import { rawDir } from './paths.ts';
// Extends bench/schedule.bench.ts: same native offline renderer and synthesize graph.
import { OfflineAudioContext } from 'node-web-audio-api';
import { synthesize } from '../../dist/engine.js';
import { renderBuffer } from '../../dist/index.js';
import { sounds, recipes, duration } from '../../dist/recipes.js';
import { encodeWav, trimSilence } from '../../dist/wav.js';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { median, p95, runN, table } from './stats.ts';

const runs = Number(process.env.BENCH_RUNS ?? 15);
const options = { runs, warmup: 1 };
const raw: any = { metadata: { runs, node: process.version, platform: process.platform, arch: process.arch, sampleRate: 48000, warmup: 1 }, imports: {}, render: {}, graph: {}, wav: {}, memory: [], noise: {} };
const rows: unknown[][] = [];
function record(label: string, samples: number[], unit = 'ms') { rows.push([label, median(samples), p95(samples), unit]); }
for (const entry of ['index', 'recipes', 'wav', 'semantic', 'react']) {
  const url = new URL(`../../dist/${entry}.js`, import.meta.url).href;
  const samples = await runN(() => Number(execFileSync(process.execPath, ['-e', `(async()=>{const t=performance.now();await import(${JSON.stringify(url)});console.log(performance.now()-t)})()`], { encoding: 'utf8' }).trim()), options);
  raw.imports[entry] = samples; record(`SSR import ${entry}`, samples);
}
// Check SSR in a separate process, before installing the offline constructor here.
const ssr = new URL('../../dist/index.js', import.meta.url).href;
raw.ssr = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', `
const m=await import(${JSON.stringify(ssr)});
if (typeof window!=='undefined'||typeof AudioContext!=='undefined') throw Error('Not SSR');
m.play();await m.preload();m.bind()();await m.unlock();
const samples=[]; for(let r=-1;r<${runs};r++){const t=performance.now();for(let i=0;i<1e6;i++)m.play();if(r>=0)samples.push((performance.now()-t)*1e6/1e6)}
console.log(JSON.stringify({verified:true,samples}));`], { encoding: 'utf8' }));
record('SSR play (1,000,000 calls/batch)', raw.ssr.samples, 'ns/call');
(globalThis as any).OfflineAudioContext = OfflineAudioContext;
const buffers: NonNullable<Awaited<ReturnType<typeof renderBuffer>>>[] = [];
for (const name of sounds) {
  const buffer = await renderBuffer(name, { sampleRate: 48000 });
  if (!buffer) throw Error(`Rendering failed: ${name}`);
  buffers.push(buffer);
  raw.render[name] = await runN(async () => { const t = performance.now(); if (!await renderBuffer(name, { sampleRate: 48000 })) throw Error(name); return performance.now() - t; }, options);
  raw.graph[name] = await runN(() => {
    const ctx = new OfflineAudioContext(2, Math.ceil((duration(name) + .1) * 48000), 48000);
    const t = performance.now(); synthesize(ctx, recipes[name], ctx.destination, 0); return performance.now() - t;
  }, options);
  record(`render ${name}`, raw.render[name]); record(`graph ${name}`, raw.graph[name]);
}
const throughput: unknown[][] = [];
for (const [label, opts] of [['16 stereo', {bitDepth:16}], ['24 stereo', {bitDepth:24}], ['32 stereo', {bitDepth:32}], ['16 mono', {bitDepth:16, channels:1}], ['trimSilence', null]] as const) {
  let bytes = 0;
  const samples = await runN(() => {
    bytes = 0; const t = performance.now();
    for (const buffer of buffers) { const out = opts ? encodeWav(buffer, opts) : trimSilence(buffer); bytes += out instanceof ArrayBuffer ? out.byteLength : out.length * out.numberOfChannels * 4; }
    return performance.now() - t;
  }, options);
  const sampleCount = buffers.reduce((n, b) => n + b.length * (opts?.channels ?? 2), 0);
  raw.wav[label] = { samples, bytes, sampleCount };
  throughput.push([label, median(samples), p95(samples), bytes / median(samples) / 1000, sampleCount / median(samples) / 1000]);
}
for (const sampleRate of [44100, 48000]) for (const name of sounds) {
  const b = sampleRate === 48000 ? buffers[sounds.indexOf(name)] : await renderBuffer(name, { sampleRate });
  if (!b) throw Error(name);
  const stereo = recipes[name].layers.some(layer => layer.pan !== undefined);
  raw.memory.push({ sampleRate, name, length: b.length, channels: b.numberOfChannels, bytes: b.length * b.numberOfChannels * 4, stereo, hypotheticalBytes: b.length * (stereo ? 2 : 1) * 4 });
}
const cached = Float32Array.from({length:48000}, () => Math.random() * 2 - 1);
for (const mode of ['random', 'copy']) {
  raw.noise[mode] = await runN(() => {
    const ctx = new OfflineAudioContext(2, 48000, 48000);
    const t = performance.now(); const data = ctx.createBuffer(1, 48000, 48000).getChannelData(0);
    if (mode === 'copy') data.set(cached); else for (let i=0;i<data.length;i++) data[i] = Math.random()*2-1;
    return performance.now()-t;
  }, options); record(`noise ${mode} (buffer allocation included)`, raw.noise[mode]);
}
console.log('# Node performance\n\n' + table(['operation', 'median', 'p95', 'unit'], rows));
console.log('\nWAV: decimal MB/s output; Msamples/s counts output channel samples (input samples for trim).\n\n' + table(['catalog operation', 'median ms', 'p95 ms', 'MB/s', 'Msamples/s'], throughput));
console.log('\n' + table(['Hz', 'sound', 'frames/channel', 'channels', 'bytes', 'panned', 'hypothetical bytes'], raw.memory.map((r: any) => [r.sampleRate,r.name,r.length,r.channels,r.bytes,r.stereo,r.hypotheticalBytes])));
console.log('\n' + table(['Hz','catalog bytes','panned recipes','hypothetical bytes'], [44100,48000].map(hz => {const rs=raw.memory.filter((r:any)=>r.sampleRate===hz);return [hz,rs.reduce((n:number,r:any)=>n+r.bytes,0),rs.filter((r:any)=>r.stereo).length,rs.reduce((n:number,r:any)=>n+r.hypotheticalBytes,0)];})));
console.log('\nStereo estimate uses explicit layer pan; oscillators, mono noise, envelopes, filters and echo do not independently require stereo. Graph timing excludes context construction and includes first noise allocation. No fixed random seed: noise follows the production Math.random path.');
await mkdir(rawDir, {recursive:true});
await writeFile(`${rawDir}/node-${Date.now()}.json`, JSON.stringify(raw,null,2));
