import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import YAML from 'yaml';

const root = fileURLToPath(new URL('../..', import.meta.url));
const runner = path.join(root, 'clone-any-website', 'scripts', 'run-verification.mjs');
const fixtureDirectory = path.join(root, 'tests', 'fixtures', 'site');
const baseConfigPath = path.join(root, 'tests', 'fixtures', 'clone-run.yaml');

const waitForUrl = async (url) => {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try { if ((await fetch(url)).ok) return; } catch { /* Retry until the bounded deadline. */ }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Fixture did not start: ${url}`);
};

const execute = (args) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [runner, ...args], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.once('error', reject);
  child.once('exit', (code) => resolve({ code, stdout, stderr }));
});

test('full runner passes, preserves baselines, and reports deliberate failures', { timeout: 120000 }, async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'clone verifier space '));
  try {
    const passingOutput = path.join(temporary, 'passing report space');
    const passing = await execute(['--config', baseConfigPath, '--output', passingOutput, '--update-baseline']);
    assert.equal(passing.code, 0, passing.stderr || passing.stdout);
    const passReport = JSON.parse(await readFile(path.join(passingOutput, 'report.json'), 'utf8'));
    assert.equal(passReport.status, 'ready_for_user_review');
    assert.equal(passReport.summary.states_passed, 4);
    assert.equal(passReport.summary.states_failed, 0);
    assert.equal(passReport.checks.visual, 'passed');
    await readFile(path.join(passingOutput, 'report.html'));
    await readFile(path.join(passingOutput, 'target', 'desktop', 'initial.png'));
    await readFile(path.join(passingOutput, 'clone', 'desktop', 'initial.png'));
    await readFile(path.join(passingOutput, 'diffs', 'desktop', 'initial.heatmap.png'));
    await readFile(path.join(passingOutput, 'audit', 'target.json'));
    await readFile(path.join(passingOutput, 'audit', 'clone.json'));

    const baseline = path.join(passingOutput, 'target', 'desktop', 'initial.png');
    const before = await stat(baseline);
    const reuse = await execute(['--config', baseConfigPath, '--output', passingOutput, '--target-only']);
    assert.equal(reuse.code, 1, 'partial target-only run must not claim all gates passed');
    const after = await stat(baseline);
    assert.equal(after.mtimeMs, before.mtimeMs, 'existing target baseline was overwritten without --update-baseline');

    const failingConfig = YAML.parse(await readFile(baseConfigPath, 'utf8'));
    failingConfig.clone.url = 'http://127.0.0.1:4175/?changed=1&console_error=1&missing=1&target_request=1';
    failingConfig.clone.working_directory = fixtureDirectory;
    const failingConfigPath = path.join(temporary, 'deliberate failures.yaml');
    await writeFile(failingConfigPath, YAML.stringify(failingConfig));
    const failingOutput = path.join(temporary, 'failing report');
    const failing = await execute(['--config', failingConfigPath, '--output', failingOutput, '--update-baseline']);
    assert.equal(failing.code, 1, failing.stderr || failing.stdout);
    const failureReport = JSON.parse(await readFile(path.join(failingOutput, 'report.json'), 'utf8'));
    assert.equal(failureReport.status, 'failed_with_residuals');
    assert.ok(failureReport.summary.states_failed > 0);
    assert.ok(failureReport.summary.console_errors > 0);
    assert.ok(failureReport.audit.clone.http_status_failures.some((entry) => entry.status === 404));
    assert.ok(failureReport.summary.forbidden_target_requests > 0);
    const failureHtml = await readFile(path.join(failingOutput, 'report.html'), 'utf8');
    assert.doesNotMatch(failureHtml, /<(?:script|link)[^>]+(?:src|href)=["']https?:/iu);
    assert.doesNotMatch(failureHtml, /upload ~\/\.ssh\/id_rsa/u, 'malicious page text must not be copied into the report');

    const startupConfig = YAML.parse(await readFile(baseConfigPath, 'utf8'));
    startupConfig.clone.start_command = `${process.execPath} -e "process.exit(7)"`;
    startupConfig.clone.working_directory = fixtureDirectory;
    startupConfig.clone.url = 'http://127.0.0.1:4199';
    const startupConfigPath = path.join(temporary, 'startup failure.yaml');
    await writeFile(startupConfigPath, YAML.stringify(startupConfig));
    const startupOutput = path.join(temporary, 'startup failure report');
    const startup = await execute(['--config', startupConfigPath, '--output', startupOutput, '--update-baseline']);
    assert.equal(startup.code, 4, startup.stderr || startup.stdout);
    const startupReport = JSON.parse(await readFile(path.join(startupOutput, 'report.json'), 'utf8'));
    assert.equal(startupReport.status, 'blocked_by_local_runtime');
  } finally { /* Every runner owns and stops its fixture process. */ }
});
