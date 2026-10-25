#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { auditGateFailures, redactText, redactUrl } from './audit-runtime.mjs';
import { writeReports, createReport } from './build-report.mjs';
import { captureStates } from './capture-states.mjs';
import { compareCapturedStates } from './compare-run.mjs';
import { ConfigError, loadConfig } from './load-config.mjs';
import { startCloneRuntime, waitForUrl } from './process-manager.mjs';

const EXIT = { success: 0, gateFailure: 1, invalid: 2, captureFailure: 3, runtimeFailure: 4 };

function usage() {
  return `Usage: node clone-any-website/scripts/run-verification.mjs --config <path> [options]

Options:
  --output <path>         Override output.directory
  --target-only           Capture only the public target baseline
  --clone-only            Capture only the local clone and reuse target files
  --skip-start-command    Assume clone.url is already running
  --headed                Show Chromium while capturing
  --update-baseline       Explicitly replace existing target captures
  --help                  Show this help`;
}

export function parseArguments(argv) {
  const options = { targetOnly: false, cloneOnly: false, skipStartCommand: false, headed: false, updateBaseline: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') options.help = true;
    else if (argument === '--target-only') options.targetOnly = true;
    else if (argument === '--clone-only') options.cloneOnly = true;
    else if (argument === '--skip-start-command') options.skipStartCommand = true;
    else if (argument === '--headed') options.headed = true;
    else if (argument === '--update-baseline') options.updateBaseline = true;
    else if (argument === '--config' || argument === '--output') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) throw new ConfigError(`${argument} requires a value`);
      options[argument === '--config' ? 'config' : 'output'] = value;
    } else throw new ConfigError(`Unknown option: ${argument}`);
  }
  if (!options.help && !options.config) throw new ConfigError('--config <path> is required');
  if (options.targetOnly && options.cloneOnly) throw new ConfigError('--target-only and --clone-only are mutually exclusive');
  if (options.updateBaseline && options.cloneOnly) throw new ConfigError('--update-baseline cannot be used with --clone-only');
  return options;
}

function emptyAudit(side) {
  return { version: 1, side, requests: [], responses: [], console_errors: [], page_errors: [], request_failures: [], http_status_failures: [], forbidden_target_requests: [], blocked_origins: [], unlisted_origins: [] };
}

async function loadExistingTarget(config) {
  const states = [];
  for (const state of config.states) {
    const image = path.join(config.paths.output, 'target', state.viewport, `${state.name}.png`);
    const metadata = path.join(config.paths.output, 'target', 'metadata', state.viewport, `${state.name}.json`);
    try {
      await access(image);
      const details = JSON.parse(await readFile(metadata, 'utf8'));
      states.push({ state: state.name, viewport: state.viewport, status: 'captured', reused: true, image, metadata, details });
    } catch {
      states.push({ state: state.name, viewport: state.viewport, status: 'failed', image: null, metadata: null, error: 'Existing target baseline is missing; run --target-only --update-baseline first' });
    }
  }
  let audit = emptyAudit('target');
  try { audit = JSON.parse(await readFile(path.join(config.paths.output, 'audit', 'target.json'), 'utf8')); } catch { /* A prior audit is optional for clone-only runs. */ }
  return { side: 'target', states, audit };
}

function resolvedConfigForDisk(config) {
  const copy = structuredClone(config);
  delete copy.paths;
  copy.target.url = redactUrl(copy.target.url);
  copy.clone.url = redactUrl(copy.clone.url);
  copy.states = copy.states.map((state) => ({ ...state, actions: state.actions.map((action) => action.type === 'fill' ? { ...action, value: '[redacted]' } : action) }));
  return copy;
}

async function readPriorAudit(config, side) {
  try { return JSON.parse(await readFile(path.join(config.paths.output, 'audit', `${side}.json`), 'utf8')); }
  catch { return null; }
}

async function writeAudit(outputDirectory, side, audit) {
  const auditDirectory = path.join(outputDirectory, 'audit');
  await mkdir(auditDirectory, { recursive: true });
  await writeFile(path.join(auditDirectory, `${side}.json`), `${JSON.stringify(audit, null, 2)}\n`);
}

function captureFailed(capture) {
  return capture?.states.some((state) => state.status !== 'captured') ?? false;
}

function decideStatus(checks, approximations) {
  const values = Object.values(checks);
  if (values.every((value) => value === 'passed')) return approximations.length ? 'passed_with_approximations' : 'ready_for_user_review';
  return 'failed_with_residuals';
}

async function buildAndWriteReport(context) {
  const report = createReport(context);
  const paths = await writeReports(report, context.config.paths.output);
  return { report, paths };
}

export async function run(argv = process.argv.slice(2)) {
  let options;
  try { options = parseArguments(argv); } catch (error) {
    console.error(`ERROR: ${error.message}\n\n${usage()}`);
    return EXIT.invalid;
  }
  if (options.help) { console.log(usage()); return EXIT.success; }

  let config;
  try { config = await loadConfig(options.config, options.output); } catch (error) {
    console.error(`ERROR: ${error.message}`);
    return EXIT.invalid;
  }
  await mkdir(config.paths.output, { recursive: true });
  await writeFile(path.join(config.paths.output, 'config.resolved.json'), `${JSON.stringify(resolvedConfigForDisk(config), null, 2)}\n`);

  const startedAt = new Date().toISOString();
  const captures = {};
  const audit = {};
  const comparisons = [];
  const failures = [];
  const skipped = [];
  let browser = null;
  let runtime = null;
  let forcedStatus = null;
  let forcedExit = null;

  try {
    if (!options.targetOnly) {
      try {
        if (options.skipStartCommand) await waitForUrl(config.clone.url, config.clone.startup_timeout_ms);
        else runtime = await startCloneRuntime(config);
      } catch (error) {
        failures.push(redactText(error.message));
        forcedStatus = 'blocked_by_local_runtime';
        forcedExit = EXIT.runtimeFailure;
      }
    }

    if (forcedStatus !== 'blocked_by_local_runtime') {
      browser = await chromium.launch({ headless: !options.headed });
      if (!options.cloneOnly) {
        const priorTargetAudit = await readPriorAudit(config, 'target');
        captures.target = await captureStates({ browser, side: 'target', config, outputDirectory: config.paths.output, updateBaseline: options.updateBaseline });
        audit.target = captures.target.states.every((state) => state.reused) && priorTargetAudit ? priorTargetAudit : captures.target.audit;
        await writeAudit(config.paths.output, 'target', audit.target);
        if (captureFailed(captures.target)) {
          failures.push(...captures.target.states.filter((state) => state.status === 'failed').map((state) => `target/${state.viewport}/${state.state}: ${state.error}`));
          if (captures.target.states.every((state) => state.status === 'failed')) forcedStatus = 'blocked_by_target_access';
          forcedExit = EXIT.captureFailure;
        }
      } else {
        captures.target = await loadExistingTarget(config);
        audit.target = captures.target.audit;
      }

      if (!options.targetOnly) {
        captures.clone = await captureStates({ browser, side: 'clone', config, outputDirectory: config.paths.output });
        audit.clone = captures.clone.audit;
        await writeAudit(config.paths.output, 'clone', audit.clone);
        if (captureFailed(captures.clone)) {
          failures.push(...captures.clone.states.filter((state) => state.status === 'failed').map((state) => `clone/${state.viewport}/${state.state}: ${state.error}`));
          if (captures.clone.states.every((state) => state.status === 'failed')) forcedStatus = 'blocked_by_local_runtime';
          forcedExit = forcedStatus === 'blocked_by_local_runtime' ? EXIT.runtimeFailure : EXIT.captureFailure;
        }
      }
    } else {
      audit.clone = emptyAudit('clone');
      await writeAudit(config.paths.output, 'clone', audit.clone);
    }

    if (!options.targetOnly && captures.clone) comparisons.push(...await compareCapturedStates(config, config.paths.output, captures.target, captures.clone));
    else skipped.push('visual comparison: target-only mode');
  } catch (error) {
    failures.push(redactText(error.message));
    forcedExit ??= /browserType\.launch|Executable doesn't exist/u.test(error.message) ? EXIT.invalid : EXIT.captureFailure;
    forcedStatus ??= 'failed_with_residuals';
  } finally {
    if (browser) await browser.close().catch((error) => failures.push(`Browser cleanup failed: ${error.message}`));
    if (runtime) await runtime.stop().catch((error) => failures.push(`Runtime cleanup failed: ${error.message}`));
  }

  audit.target ??= emptyAudit('target');
  audit.clone ??= emptyAudit('clone');
  const auditFailures = [...auditGateFailures(audit.target, config), ...auditGateFailures(audit.clone, config)];
  failures.push(...auditFailures);
  const capturePass = !captureFailed(captures.target) && (options.targetOnly || (!captureFailed(captures.clone) && Boolean(captures.clone)));
  const visualPass = !options.targetOnly && comparisons.length === config.states.length && comparisons.every((state) => state.passed === true);
  if (!options.targetOnly && comparisons.some((state) => state.status === 'unverified')) skipped.push('visual gates: comparator gates were not fully configured');
  if (options.cloneOnly && captureFailed(captures.target)) skipped.push('target baseline: missing');
  const consolePass = !config.network.fail_on_console_error && !config.network.fail_on_page_error
    ? true
    : audit.target.console_errors.length + audit.target.page_errors.length + audit.clone.console_errors.length + audit.clone.page_errors.length === 0;
  const networkPass = auditFailures.filter((failure) => !failure.includes('console') && !failure.includes('page errors')).length === 0;
  const checks = {
    capture: capturePass ? 'passed' : 'failed',
    visual: options.targetOnly ? 'skipped' : visualPass ? 'passed' : 'failed',
    network: networkPass ? 'passed' : 'failed',
    console: consolePass ? 'passed' : 'failed',
    local_runtime: options.targetOnly ? 'skipped' : captures.clone ? 'passed' : 'failed',
  };
  const approximations = [...config.approximations, ...config.states.filter((state) => state.approximation)];
  const status = forcedStatus ?? decideStatus(checks, approximations);
  const completedAt = new Date().toISOString();
  const result = await buildAndWriteReport({ config: { ...config, target: { ...config.target, url: redactUrl(config.target.url) }, clone: { ...config.clone, url: redactUrl(config.clone.url) } }, startedAt, completedAt, captures, comparisons, audit, checks, failures, skipped, status });
  console.log(JSON.stringify({ status, output: config.paths.output, report_json: result.paths.jsonPath, report_html: result.paths.htmlPath }, null, 2));

  if (forcedExit !== null) return forcedExit;
  if (Object.values(checks).some((value) => value !== 'passed')) return EXIT.gateFailure;
  return EXIT.success;
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const exitCode = await run();
  process.exitCode = exitCode;
}
