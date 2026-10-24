import { measureBundles } from './lib/bundles.mjs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { run } from './lib/process.mjs';
import { cpus, totalmem, platform, release } from 'node:os';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const environment = {
  node: process.version,
  os: `${platform()} ${release()}`,
  cpu: cpus()[0]?.model,
  cores: cpus().length,
  totalMemory: totalmem(),
  commit: (await run('git', ['rev-parse', 'HEAD'], { cwd })).trim(),
  date: new Date().toISOString(),
};
const bundles = await measureBundles(cwd);
async function measureColdImports() {
  const rows = [];
  const entries = [['react', 'react'], ['ESM', './dist/index.js'], ['CJS', './dist/index.cjs']];
  for (const [name, target] of entries) {
    const times = [];
    const script = `
      const start = performance.now();
      await import(${JSON.stringify(target)});
      console.log(performance.now() - start);
    `;
    for (let iteration = 0; iteration < 12; iteration++) {
      const output = await run(process.execPath, ['--input-type=module', '-e', script], {
        cwd,
        env: { ...process.env, NODE_ENV: 'production' },
      });
      if (iteration >= 3) times.push(Number(output));
    }
    times.sort((a, b) => a - b);
    rows.push({ name: `Cold import ${name}`, median: times[4], p95: times[8], unit: 'ms', samples: 9 });
  }
  return rows;
}

const rows = await measureColdImports();

const resources = [];
for (const mode of ['ssr', 'vibration', 'ios', 'desktop']) {
  const output = await run(process.execPath, ['--expose-gc', 'bench/worker.mjs', mode], {
    cwd,
    timeout: 120000,
    env: { ...process.env, NODE_ENV: 'production' },
  });
  if (!output.trim()) {
    throw Error(`Empty worker output: ${mode}`);
  }
  const result = JSON.parse(output);
  rows.push(...result.rows);
  if (result.resources) {
    resources.push(result.resources);
  }
}

// Instrument only a separate diagnostic build; timing workers import untouched dist.
const source = await readFile(`${cwd}/dist/index.js`, 'utf8');
const instrumented = source
  .replace('  if (!isValidElement(children))', '  globalThis.__hapticBench.renders++;\n  if (!isValidElement(children))')
  .replace('new WebHaptics(options.webHapticsOptions)', '(globalThis.__hapticBench.engines++, new WebHaptics(options.webHapticsOptions))');
if (!instrumented.includes('__hapticBench.renders++')) {
  throw Error('Render instrumentation failed: HapticTarget entry point not found in dist/index.js');
}
// Engine counting depends on the current construction site; report "n/a" if it moves.
const enginesInstrumented = instrumented.includes('__hapticBench.engines++');
await mkdir(`${cwd}/bench/results`, { recursive: true });
await writeFile(`${cwd}/bench/results/instrumented.mjs`, instrumented);
const diagnostics = [];
try {
  for (const mode of ['vibration', 'ios', 'desktop']) {
    diagnostics.push(JSON.parse(await run(process.execPath, ['bench/worker.mjs', mode, 'diagnostic'], {
      cwd,
      env: { ...process.env, NODE_ENV: 'production' },
    })));
  }
} finally {
  await rm(`${cwd}/bench/results/instrumented.mjs`, { force: true });
}
const formatNumber = value => value === null ? '—' : value.toFixed(6);
const lines = [
  `Environment: ${environment.node}; ${environment.os}; ${environment.cpu}; ${environment.cores} cores; ${(environment.totalMemory / 2 ** 30).toFixed(1)} GiB RAM; ${environment.commit}; ${environment.date}`,
  'Build: production React for timings; production profiling renderer + instrumented dist for untimed counts.',
  '',
  '| Bundle | Min bytes | Gzip bytes | Brotli bytes | web-haptics bytes¹ |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...bundles.map(bundle => `| ${bundle.name} | ${bundle.minified} | ${bundle.gzip} | ${bundle.brotli} | ${bundle.webHapticsBytes} |`),
  '',
  '| Operation | Median | p95 | Unit | Ops/sec² |',
  '| --- | ---: | ---: | --- | ---: |',
  ...rows.map(row => `| ${row.name} | ${formatNumber(row.median)} | ${formatNumber(row.p95)} | ${row.unit} | ${row.opsPerSecond?.toFixed(1) ?? '—'} |`),
  '',
  '| Path | Instances | Commits per mount | HapticTarget renders per instance |',
  '| --- | ---: | ---: | ---: |',
  ...diagnostics.flatMap(result => result.diagnostics.map(count => `| ${result.path} | ${count.instances} | ${count.commits} | ${count.rendersPerInstance} |`)),
  '',
  '| Resources (100 instances) | Vibration | iOS | Desktop without vibration |',
  '| --- | ---: | ---: | ---: |',
];
for (const [label, read] of [
  ['DOM nodes/instance', resource => resource.nodesPerInstance],
  ['Listener adds/instance³', resource => resource.listenersAddedPerInstance],
  ['Observers/instance', resource => resource.observersPerInstance],
  ['First tap: body nodes / engine labels / rAF scheduled', resource => `${resource.firstTap.nodes} / ${resource.firstTap.labels} / ${resource.firstTap.raf}`],
  ['100 distinct taps: body nodes / engine labels / rAF per tap', resource => `${resource.allTaps.nodes} / ${resource.allTaps.labels} / ${resource.allTaps.rafPerTap}`],
  ['Engines constructed after 100 distinct taps⁴', resource => enginesInstrumented ? diagnostics.find(result => result.path === resource.path).engines : 'n/a'],
  ['First tap cost (instrumented ms)', resource => resource.firstTap.milliseconds.toFixed(6)],
  ['Remaining 99 distinct taps (instrumented ms/tap)', resource => resource.allTaps.millisecondsPerTap.toFixed(6)],
  ['Unmount: listener adds / removes / balance³', resource => `${resource.afterUnmount.adds} / ${resource.afterUnmount.removes} / ${resource.afterUnmount.balance}`],
  ['Unmount: active observers / body nodes', resource => `${resource.afterUnmount.activeObservers} / ${resource.afterUnmount.leftoverBodyNodes}`],
  ['Unmount: listeners on document / detached nodes³', resource => `${resource.afterUnmount.retainedOnDocument} / ${resource.afterUnmount.retainedOnDetached}`],
]) {
  lines.push(`| ${label} | ${resources.map(read).join(' | ')} |`);
}
lines.push(
  '',
  '¹ Uncompressed esbuild contribution; shared compression cannot be attributed per dependency.',
  '² SSR only. All timings use production React, createRoot + flushSync; passive effects settle across macrotasks.',
  '³ Includes delegated root listeners; detached listeners are collectible, not proof of a leak.',
  '⁴ Constructor counts use a separate instrumented build; desktop label counts independently corroborate engines.',
  'Tap timing rows are warmed batch-normalized dispatch costs. Resource tap costs include instrumentation and a simulated 60Hz rAF drain.',
);
const markdown = lines.join('\n');
await mkdir(`${cwd}/bench/results`, { recursive: true });
await writeFile(`${cwd}/bench/results/latest.json`, JSON.stringify({
  environment,
  configuration: { warmups: 3, samples: 9, importSamples: 9, memoryCycles: 8, memoryInstances: 1000 },
  bundles,
  rows,
  resources,
  diagnostics,
  markdown,
}, null, 2) + '\n');
console.log(markdown);
