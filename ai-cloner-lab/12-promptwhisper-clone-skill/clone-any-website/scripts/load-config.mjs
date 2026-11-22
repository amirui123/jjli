import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
export const schemaPath = path.resolve(moduleDirectory, '../schemas/clone-run.schema.json');

export class ConfigError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ConfigError';
    this.details = details;
  }
}

function readableErrors(errors = []) {
  return errors.map((error) => {
    const location = error.instancePath || '<root>';
    if (error.keyword === 'additionalProperties') {
      return `${location}: unknown field "${error.params.additionalProperty}"`;
    }
    return `${location}: ${error.message}`;
  });
}

function assertHttpUrl(value, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new ConfigError(`${label} must be a valid HTTP(S) URL`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ConfigError(`${label} must use http: or https:`);
  }
  return parsed;
}

function applyDefaults(config) {
  config.environment ??= {};
  config.environment.locale ??= 'en-US';
  config.environment.color_scheme ??= 'light';
  config.environment.reduced_motion ??= false;
  config.environment.timezone_id ??= 'UTC';
  config.clone.startup_timeout_ms ??= 30000;
  config.comparison.pixel_threshold ??= 16;
  config.comparison.write_heatmap ??= true;
  config.network.fail_on_console_error ??= true;
  config.network.fail_on_page_error ??= true;
  config.network.fail_on_request_failure ??= true;
  config.network.fail_on_http_status ??= [404, 500, 501, 502, 503];
  config.network.forbid_target_origin_in_clone_runtime ??= true;
  config.network.target_capture_origin_policy ??= 'report_only';
  config.network.allowed_target_origins ??= [new URL(config.target.url).origin];
  config.approximations ??= [];
  for (const viewport of config.viewports) {
    viewport.device_scale_factor ??= 1;
    viewport.is_mobile ??= false;
    viewport.has_touch ??= false;
  }
  for (const state of config.states) state.actions ??= [];
}

function semanticValidation(config) {
  const target = assertHttpUrl(config.target.url, 'target.url');
  assertHttpUrl(config.clone.url, 'clone.url');
  const viewportNames = new Set();
  for (const viewport of config.viewports) {
    if (viewportNames.has(viewport.name)) throw new ConfigError(`Duplicate viewport name: ${viewport.name}`);
    viewportNames.add(viewport.name);
  }
  const stateNames = new Set();
  for (const state of config.states) {
    if (stateNames.has(state.name)) throw new ConfigError(`Duplicate state name: ${state.name}`);
    stateNames.add(state.name);
    if (!viewportNames.has(state.viewport)) {
      throw new ConfigError(`State "${state.name}" references unknown viewport "${state.viewport}"`);
    }
  }
  config.network.allowed_target_origins = config.network.allowed_target_origins.map((value, index) =>
    assertHttpUrl(value, `network.allowed_target_origins[${index}]`).origin,
  );
  if (!config.network.allowed_target_origins.includes(target.origin)) {
    throw new ConfigError('network.allowed_target_origins must include target.url origin');
  }
}

export async function validateConfigObject(input) {
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const config = structuredClone(input);
  if (!validate(config)) {
    const details = readableErrors(validate.errors);
    throw new ConfigError(`Configuration validation failed:\n- ${details.join('\n- ')}`, details);
  }
  applyDefaults(config);
  semanticValidation(config);
  return config;
}

export async function loadConfig(configFile, outputOverride) {
  const absoluteConfigPath = path.resolve(configFile);
  let source;
  try {
    source = await readFile(absoluteConfigPath, 'utf8');
  } catch (error) {
    throw new ConfigError(`Cannot read configuration ${absoluteConfigPath}: ${error.message}`);
  }
  let input;
  try {
    input = YAML.parse(source);
  } catch (error) {
    throw new ConfigError(`Invalid YAML in ${absoluteConfigPath}: ${error.message}`);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ConfigError('Configuration root must be a mapping');
  }
  const config = await validateConfigObject(input);
  const configDirectory = path.dirname(absoluteConfigPath);
  config.paths = {
    config: absoluteConfigPath,
    output: outputOverride ? path.resolve(outputOverride) : path.resolve(configDirectory, config.output.directory),
    working_directory: config.clone.working_directory
      ? path.resolve(configDirectory, config.clone.working_directory)
      : configDirectory,
    mask: config.comparison.mask ? path.resolve(configDirectory, config.comparison.mask) : null,
  };
  return config;
}
