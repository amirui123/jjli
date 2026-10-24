import { rawDir } from './paths.ts';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { median,p95,runN,table } from './stats.ts';
const runs=Number(process.env.BENCH_RUNS??15), dir=rawDir, stamp=Date.now(), base='http://127.0.0.1:3908';
await mkdir(dir,{recursive:true});
let server: any,browser: any;
const raw:any={metadata:{runs,node:process.version,warmup:1},preload:[],render:{},first:{},cached:{},hot:{},bind:{},profiles:{}};
const rows:unknown[][]=[];
const row=(name:string,s:number[],unit='ms')=>rows.push([name,median(s),p95(s),unit]);
try {
 if(!await fetch(base+'/bench/perf/fixture.html').then(r=>r.ok).catch(()=>false)) {
  server=spawn(process.execPath,['test/browser/server.ts'],{cwd:new URL('../..',import.meta.url),stdio:'ignore'});
  let ready=false;
  for(let i=0;i<100;i++){if(await fetch(base+'/bench/perf/fixture.html').then(r=>r.ok).catch(()=>false)){ready=true;break}await new Promise(r=>setTimeout(r,100))}
  if(!ready)throw Error('Browser server failed to start');
 }
 browser=await chromium.launch({headless:true,executablePath:process.env.BENCH_CHROMIUM_EXECUTABLE,args:['--autoplay-policy=no-user-gesture-required']});raw.metadata.chromium=browser.version();raw.metadata.executable=process.env.BENCH_CHROMIUM_EXECUTABLE??'playwright default';
 const fresh=async(audio=false)=>{
  const p=await browser.newPage();await p.goto(base+'/bench/perf/fixture.html');await p.waitForFunction(()=>(window as any).ready);
  if(audio){await p.click('#unlock');await p.waitForFunction(()=>(window as any).running===true)}
  await p.evaluate(()=>(window as any).sfx.configure({minInterval:0,maxVoices:24}));return p;
 };
 // Cold preload and first-play runs get fresh pages, with one discarded warmup.
 for(const kind of ['preload','play']) {
  const samples=await runN(async()=>{
   const p=await fresh(kind==='play');
   try{return await p.evaluate(async(kind:string)=>{
    const s=(window as any).sfx,result:any={};
    if(kind==='preload'){
     const t=performance.now();await s.preload();result.preload=performance.now()-t;result.render={};
     for(const n of s.sounds){const t=performance.now();if(!await s.renderBuffer(n,{sampleRate:48000}))throw Error(n);result.render[n]=performance.now()-t}
    }else{
     result.first={};result.cached={};
     for(const n of s.sounds){const t=performance.now();s.play(n);result.first[n]=(performance.now()-t)*1000}
     await s.preload();s.stopAll();
     for(const n of s.sounds){const t=performance.now();s.play(n);result.cached[n]=(performance.now()-t)*1000}
    }return result;
   },kind)}finally{await p.close()}
  },{warmup:1,runs});
  for(const sample of samples as any[])for(const [key,value]of Object.entries(sample)) {
   if(key==='preload')raw.preload.push(value);
   else for(const [n,v]of Object.entries(value as any))(raw[key][n]??=[]).push(v);
  }
 }
 const p=await fresh(true);await p.evaluate(()=>(window as any).sfx.preload());
 const cdp=await p.context().newCDPSession(p);await cdp.send('HeapProfiler.enable');
 for(const variant of ['plain','options','category']) {
  raw.hot[variant]=await runN(async()=>{
   await p.evaluate(()=>(window as any).sfx.stopAll());await p.waitForTimeout(50);await cdp.send('HeapProfiler.collectGarbage');
   const before=await cdp.send('Runtime.getHeapUsage');const batch=await p.evaluate((v:string)=>(window as any).batch(v),variant);
   const after=await cdp.send('Runtime.getHeapUsage');await p.evaluate(()=>(window as any).sfx.stopAll());await p.waitForTimeout(50);await cdp.send('HeapProfiler.collectGarbage');
   const retained=await cdp.send('Runtime.getHeapUsage');
   return {...batch,heapGrowth:after.usedSize-before.usedSize,retainedGrowth:retained.usedSize-before.usedSize};
  },{warmup:1,runs});row('hot '+variant,raw.hot[variant].map((x:any)=>x.us),'µs/call');
 }
 for(const count of [100,1000,10000]){
  raw.bind[count]=await runN(()=>p.evaluate((count:number)=>{
   const s=(window as any).sfx;s.setVolume(1,{category:'controls'});
   const root=document.createElement('div');root.innerHTML=('<button data-sound-press="press" data-sound-release="release" data-sound-hover="chime"><span><span><span>deep</span></span></span></button>').repeat(count);document.body.append(root);
   const t=performance.now(),unbind=s.bind(root),setup=performance.now()-t,target=root.lastElementChild!.querySelector('span span span')!;
   const start=performance.now();for(let i=0;i<1000;i++)target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse',button:0}));
   const dispatch=performance.now()-start;unbind();root.remove();s.stopAll();return {setup,dispatch};
  },count),{warmup:1,runs});
  row('bind '+count,raw.bind[count].map((x:any)=>x.setup));row('pointerdown '+count,raw.bind[count].map((x:any)=>x.dispatch),'µs/event');
 }
 // Separate diagnostic profiles keep sampling overhead out of timing distributions.
 for(const kind of ['hot','preload']){
  if(kind==='preload')await p.evaluate(()=>(window as any).sfx.dispose());
  await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:100});await cdp.send('Profiler.start');
  if(kind==='hot')await p.evaluate(()=>(window as any).batch('plain'));else await p.evaluate(()=>(window as any).sfx.preload());
  const {profile}=await cdp.send('Profiler.stop');await writeFile(`${dir}/${kind}-${stamp}.cpuprofile`,JSON.stringify(profile));
  const nodes=new Map(profile.nodes.map((n:any)=>[n.id,n])), totals=new Map<string,number>();
  profile.samples?.forEach((id:number,i:number)=>{const f=(nodes.get(id) as any).callFrame,key=`${f.functionName||'(anonymous)'} ${f.url}:${f.lineNumber+1}`;totals.set(key,(totals.get(key)??0)+(profile.timeDeltas?.[i]??0))});
  raw.profiles[kind]=[...totals].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([name,us])=>[name,us/1000]);
 }
 row('preload catalog',raw.preload);
 for(const kind of ['render','first','cached'])for(const [name,s]of Object.entries(raw[kind]))row(kind+' '+name,s as number[],kind==='render'?'ms':'µs/call');
 console.log('# Chromium performance\n\n'+table(['operation','median','p95','unit'],rows));
 console.log('\n'+table(['variant','heap growth median B','heap growth p95 B','retained median B','retained p95 B','nodes/batch'],Object.entries(raw.hot).map(([name,s]:[string,any])=>[name,median(s.map((x:any)=>x.heapGrowth)),p95(s.map((x:any)=>x.heapGrowth)),median(s.map((x:any)=>x.retainedGrowth)),p95(s.map((x:any)=>x.retainedGrowth)),JSON.stringify(s[0].nodes)])));
 for(const kind of ['hot','preload'])console.log(`\n${kind} CPU profile: top 15 self-times\n\n`+table(['function / URL:line','self ms'],raw.profiles[kind]));
 console.log('\nMain-thread scheduling times are not audible latency. Heap growth is an allocation proxy including pending callbacks; retained deltas are after stopAll, callback drain and GC and may be negative. Dispatch includes event creation and playback. Profiles sample JS, not native audio threads. Hot batches have 10,000 calls; dispatch batches have 1,000 events.');
 await writeFile(`${dir}/browser-${stamp}.json`,JSON.stringify(raw,null,2));
}finally{await browser?.close();server?.kill()}
