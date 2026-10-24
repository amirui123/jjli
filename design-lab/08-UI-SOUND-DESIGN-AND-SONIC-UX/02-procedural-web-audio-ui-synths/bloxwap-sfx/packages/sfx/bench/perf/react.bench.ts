import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { packageDir, variantURL } from './paths.ts';
// React re-render cost: 200 React.memo consumers of useSoundPreference() under one <SoundProvider>,
// whose parent re-renders 100 times with unchanged props. Counts consumer renders and wall time.
// Usage: node bench/perf/react.bench.ts [base|variant|dist-path]
import { Window } from 'happy-dom';
import { median, p95 } from './stats.ts';

const win = new Window({ url: 'http://localhost/' });
const g = globalThis as any;
for (const k of ['window', 'document', 'navigator', 'localStorage', 'HTMLElement', 'Node', 'MutationObserver']) g[k] ??= (win as any)[k] ?? win;
g.IS_REACT_ACT_ENVIRONMENT = true;
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const dir = process.argv[2] ?? 'base';
const dist = dir === 'dist' || dir.includes('/')
  ? pathToFileURL(resolve(packageDir, dir) + '/')
  : variantURL(dir);
const lib = await import(new URL('react.js', dist).href);
const RUNS = Number(process.env.BENCH_RUNS ?? 15);
const h = React.createElement;
let renders = 0;
const Consumer = React.memo(function Consumer() { lib.useSoundPreference(); renders++; return null; });
const consumers = Array.from({ length: 200 }, (_, i) => h(Consumer, { key: i }));
let bump = () => {};
function App() { const [n, set] = React.useState(0); bump = () => set(n + 1); return h(lib.SoundProvider, null, consumers); }

const times: number[] = [], counts: number[] = [];
for (let run = -1; run < RUNS; run++) {
  const root = createRoot(document.createElement('div') as any);
  await React.act(async () => root.render(h(App)));
  renders = 0;
  const t = performance.now();
  for (let i = 0; i < 100; i++) await React.act(async () => bump());
  const elapsed = performance.now() - t;
  await React.act(async () => root.unmount());
  if (run >= 0) { times.push(elapsed); counts.push(renders); }
}
console.log(`| ${dir} | ${median(counts)} | ${median(times).toFixed(1)} | ${p95(times).toFixed(1)} |`);

await win.happyDOM.close();
