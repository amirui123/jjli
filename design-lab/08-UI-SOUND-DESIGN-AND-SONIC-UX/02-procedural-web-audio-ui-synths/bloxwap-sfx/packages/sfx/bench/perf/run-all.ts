import { outDir, rawDir } from './paths.ts';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { mkdir,writeFile } from 'node:fs/promises';
const reports=[`# SFX performance report\n\nGenerated ${new Date().toISOString()}; Node ${process.version}; ${process.platform}/${process.arch}; BENCH_RUNS=${process.env.BENCH_RUNS??15}. One discarded warmup. p95 uses nearest rank. Raw samples/profiles: ${rawDir}/.`];
for(const script of ['node','browser','size']){
 reports.push(await new Promise<string>((resolve,reject)=>{
  const child=spawn(process.execPath,[`bench/perf/${script}.bench.ts`],{cwd:new URL('../..',import.meta.url),env:process.env,stdio:['ignore','pipe','inherit']});let text='';
  child.stdout.on('data',chunk=>{process.stdout.write(chunk);text+=chunk});child.on('error',reject);child.on('close',code=>code===0?resolve(text):reject(Error(`${script} exited ${code}`)));
 }));
}
await mkdir(outDir,{recursive:true});await writeFile(join(outDir,'results.md'),reports.join('\n\n'));console.log(`\nReport: ${join(outDir,'results.md')}`);
