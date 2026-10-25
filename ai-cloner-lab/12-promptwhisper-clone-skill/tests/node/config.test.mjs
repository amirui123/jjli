import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import YAML from 'yaml';
import { ConfigError, loadConfig, validateConfigObject } from '../../clone-any-website/scripts/load-config.mjs';
import { parseArguments } from '../../clone-any-website/scripts/run-verification.mjs';

const exampleUrl = new URL('../../clone-run.example.yaml', import.meta.url);

test('example YAML parses and validates against the schema', async () => {
  const config = await loadConfig(fileURLToPath(exampleUrl));
  assert.equal(config.version, 1);
  assert.equal(config.states.length, 3);
  assert.equal(config.environment.timezone_id, 'UTC');
});

test('unknown action is rejected', async () => {
  const input = YAML.parse(await readFile(exampleUrl, 'utf8'));
  input.states[0].actions = [{ type: 'evaluate', script: 'alert(1)' }];
  await assert.rejects(validateConfigObject(input), ConfigError);
});

test('unknown field is rejected with its name', async () => {
  const input = YAML.parse(await readFile(exampleUrl, 'utf8'));
  input.comparison.max_mismatch_raito = 0.1;
  await assert.rejects(validateConfigObject(input), /max_mismatch_raito/u);
});

test('state must reference a declared viewport', async () => {
  const input = YAML.parse(await readFile(exampleUrl, 'utf8'));
  input.states[0].viewport = 'missing';
  await assert.rejects(validateConfigObject(input), /unknown viewport/u);
});

test('CLI rejects unknown and conflicting options', () => {
  assert.throws(() => parseArguments(['--config', 'x', '--wat']), /Unknown option/u);
  assert.throws(() => parseArguments(['--config', 'x', '--target-only', '--clone-only']), /mutually exclusive/u);
});
