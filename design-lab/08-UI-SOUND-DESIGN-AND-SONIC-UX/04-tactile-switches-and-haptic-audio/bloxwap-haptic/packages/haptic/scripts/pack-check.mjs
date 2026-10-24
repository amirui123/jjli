import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
import { smokeConsumer } from './consumer-browser.mjs';

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: process.env });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
const temporary = mkdtempSync(join(process.env.RUNNER_TEMP || tmpdir(), 'haptic-pack-'));
try {
  const registryVersion = process.env.HAPTIC_REGISTRY_VERSION;
  const specifier = registryVersion ? `@bloxwap/haptic@${registryVersion}` : '.';
  const [packed] = JSON.parse(run('npm', ['pack', specifier, '--ignore-scripts', '--json', '--pack-destination', temporary], process.cwd()));
  const paths = packed.files.map(file => file.path);
  for (const required of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/index.d.cts', 'dist/feedback.js', 'dist/feedback.cjs', 'dist/feedback.d.ts', 'dist/feedback.d.cts', 'package.json', 'README.md', 'LICENSE', 'CHANGELOG.md']) {
    if (!paths.includes(required)) throw new Error(`Missing published file: ${required}`);
  }
  for (const path of paths) {
    if (!/^(dist\/(index|feedback)\.(js|cjs|d\.ts|d\.cts)|package\.json|README\.md|LICENSE|CHANGELOG\.md)$/.test(path)) throw new Error(`Unexpected published file: ${path}`);
  }
  const manifest = JSON.parse(run('tar', ['-xOf', join(temporary, packed.filename), 'package/package.json'], process.cwd()));
  if (manifest.name !== '@bloxwap/haptic' || manifest.publishConfig.access !== 'public') throw new Error('Incorrect publication identity.');
  if (Object.keys(manifest.dependencies).join(',') !== 'web-haptics') throw new Error('Unexpected runtime dependencies.');
  if (manifest.dependencies['web-haptics'] !== '0.0.6') throw new Error('Unexpected feedback engine version.');
  if (registryVersion && manifest.version !== registryVersion) throw new Error('Registry bytes do not match the requested version.');
  for (const version of ['18.3.1', '19.3.0']) {
    const consumer = join(temporary, `react-${version}`);
    run('mkdir', ['-p', consumer], process.cwd());
    writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', registryVersion ? '--package-lock' : '--no-package-lock', join(temporary, packed.filename), `react@${version}`, `react-dom@${version}`, version.startsWith('18') ? '@types/react@18' : '@types/react@19', version.startsWith('18') ? '@types/react-dom@18' : '@types/react-dom@19', 'typescript@5.9.3'], consumer);
    writeFileSync(join(consumer, 'feedback.ts'), `
      import { createHapticAdapter, createNativeHapticAdapter, type FeedbackEvent, type FeedbackPreferences } from '@bloxwap/haptic/feedback';
      const event: FeedbackEvent = { id: '1', source: 'consumer', intent: 'success', origin: 'programmatic' };
      const preferences: FeedbackPreferences = { version: 1, haptics: true, sound: false, volume: 0, motion: false };
      void createHapticAdapter; void createNativeHapticAdapter; void event; void preferences;
    `);
    writeFileSync(join(consumer, 'feedback.tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, noEmit: true, types: [], lib: ['ES2020'], target: 'ES2020', module: 'NodeNext', moduleResolution: 'NodeNext' }, files: ['feedback.ts'] }));
    run('node', ['node_modules/typescript/bin/tsc', '-p', 'feedback.tsconfig.json'], consumer);
    const checks = `
      import { strict as assert } from 'node:assert';
      import { createRequire } from 'node:module';
      import React from 'react';
      import { renderToString } from 'react-dom/server';
      Reflect.deleteProperty(globalThis, 'navigator');
      const esm = await import('@bloxwap/haptic');
      const cjs = createRequire(import.meta.url)('@bloxwap/haptic');
      assert.equal(typeof (await import('@bloxwap/haptic/feedback')).createHapticAdapter, 'function');
      assert.equal(typeof createRequire(import.meta.url)('@bloxwap/haptic/feedback').createNativeHapticAdapter, 'function');
      for (const api of [esm, cjs]) {
        assert.deepEqual(Object.keys(api).sort(), ['Haptic', 'HapticTarget', 'isIOSWebKitWithoutVibration', 'useIOSNativeHaptics', 'canTriggerHaptic', 'triggerHaptic'].sort());
        assert.equal(api.Haptic, api.HapticTarget);
        assert.equal(api.isIOSWebKitWithoutVibration(), false);
        assert.deepEqual(api.canTriggerHaptic(), { available: false, mechanism: 'none', observed: false, reason: 'browser-unavailable' });
        assert.deepEqual(await api.triggerHaptic(), { delivered: false, mechanism: 'none', reason: 'browser-unavailable' });
        const html = renderToString(React.createElement(api.Haptic, null, React.createElement('button', { type: 'button' }, 'Consumer')));
        assert.match(html, /Consumer/); assert.doesNotMatch(html, /type="checkbox"/);
      }
      console.log('React ${version}: installed ESM/CJS imports and SSR passed');
    `;
    writeFileSync(join(consumer, 'smoke.mjs'), checks);
    console.log(run('node', ['smoke.mjs'], consumer).trim());
    const types = `import { Haptic, HapticTarget, isIOSWebKitWithoutVibration, useIOSNativeHaptics, canTriggerHaptic, triggerHaptic, type HapticCapability, type HapticTriggerResult, type HapticTargetProps, type HapticInput, type HapticPattern, type HapticPreset, type TriggerOptions, type Vibration, type WebHapticsOptions } from '@bloxwap/haptic';
const capability: HapticCapability = canTriggerHaptic();
const result: Promise<HapticTriggerResult> = triggerHaptic('success', { intensity: 0.7 });
const events: Vibration[] = [{ duration: 8, delay: 5, intensity: 0.5 }];
const pattern: HapticPattern = events;
const preset: HapticPreset = { pattern: events };
const inputs: HapticInput[] = [8, 'selection', [8, 5, 8], pattern, preset];
const triggerOptions: TriggerOptions = { intensity: 0.7 };
const webHapticsOptions: WebHapticsOptions = { debug: true, showSwitch: true };
const props: HapticTargetProps = { children: <button>Typed</button>, feedback: inputs[0], triggerOptions, webHapticsOptions, enabled: true, disabled: false, className: 'target', style: { display: 'grid' } };
const element = <HapticTarget {...props} />;
isIOSWebKitWithoutVibration();
function Hook() { return <Haptic enabled={useIOSNativeHaptics()}><button>Hook</button></Haptic>; }
`;
    writeFileSync(join(consumer, 'types.tsx'), types);
    writeFileSync(join(consumer, 'common.cts'), "import haptic = require('@bloxwap/haptic');\nimport React = require('react');\nReact.createElement(haptic.Haptic, { children: React.createElement('button') });\nhaptic.isIOSWebKitWithoutVibration();\nconst capability: haptic.HapticCapability = haptic.canTriggerHaptic();\nconst result: Promise<haptic.HapticTriggerResult> = haptic.triggerHaptic();\n");
    writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, skipLibCheck: true, noEmit: true, target: 'ES2020', module: 'NodeNext', moduleResolution: 'NodeNext', jsx: 'react-jsx' }, include: ['types.tsx', 'common.cts'] }));
    run('node', ['node_modules/typescript/bin/tsc'], consumer);
    await build({ stdin: { contents: "import { Haptic } from '@bloxwap/haptic'; console.log(Haptic);", resolveDir: consumer }, bundle: true, write: false, platform: 'browser', format: 'esm' });
    console.log(`React ${version}: NodeNext ESM/CJS declarations, JSX, all public types, and browser bundling passed`);
    if (registryVersion) console.log(run('npm', ['audit', 'signatures'], consumer).trim());
    if (registryVersion || process.env.HAPTIC_BROWSER_SMOKE === '1') await smokeConsumer(consumer, version);
  }
  console.log(`Verified exact tarball allowlist (${paths.length} files), metadata, and isolated consumers.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
