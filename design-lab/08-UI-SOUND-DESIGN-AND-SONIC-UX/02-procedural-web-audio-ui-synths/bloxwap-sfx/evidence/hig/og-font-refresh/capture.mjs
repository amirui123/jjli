// Reproduce the local static-export captures used for hig#115 (run from the repository root).
// Usage: HIG_EVIDENCE_PORT=3681 node evidence/hig/og-font-refresh/capture.mjs before|after
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const phase=process.argv[2];
assert(['before','after'].includes(phase));
const root=fileURLToPath(new URL('../../../',import.meta.url));
const docs=join(root,'apps/docs');
const evidence=fileURLToPath(new URL('./',import.meta.url));
const baseline=JSON.parse(await readFile(join(evidence,'before.json'),'utf8'));
const port=Number(process.env.HIG_EVIDENCE_PORT??3681);
const origin=`http://127.0.0.1:${port}${baseline.basePath}`;
const preview=baseline.basePath==='/sfx'?'preview.ts':'preview.mjs';
const server=spawn(process.execPath,[join(docs,'scripts',preview)],{cwd:root,env:{...process.env,PORT:String(port),NEXT_PUBLIC_BASE_PATH:baseline.basePath},stdio:['ignore','pipe','inherit']});
let browser;
try{
 await new Promise((resolve,reject)=>{server.stdout.on('data',chunk=>{if(String(chunk).includes('Static docs preview'))resolve();});server.on('error',reject);server.on('exit',code=>reject(new Error(`Preview exited ${code}`)));});
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const pages=[];
 for(const route of ['/','/docs/']){
  const response=await page.goto(`${origin}${route}`,{timeout:15000});
  assert.equal(response.status(),200);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(1200);
  const title=await page.title();
  const controls=await page.evaluate(()=>Object.fromEntries(['body','.hig-button','table th','a'].map(selector=>{const node=document.querySelector(selector);if(!node)return[selector,null];const css=getComputedStyle(node);const box=node.getBoundingClientRect();return[selector,{fontFamily:css.fontFamily,fontSize:css.fontSize,background:css.backgroundColor,padding:css.padding,boxSizing:css.boxSizing,outlineStyle:css.outlineStyle,outlineWidth:css.outlineWidth,width:box.width,height:box.height}];})));
  await page.screenshot({path:join(evidence,`${phase}-${route==='/'?'home':'docs'}-desktop.png`),fullPage:true});
  pages.push({route,status:response.status(),title,controls});
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(`${origin}/`,{timeout:15000});
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile page must not scroll horizontally');
 await page.screenshot({path:join(evidence,`${phase}-home-mobile.png`),fullPage:true});
 const response=await context.request.get(`${origin}/og/home.png`);
 assert.equal(response.status(),200);const card=await response.body();
 const hash=createHash('sha256').update(card).digest('hex');
 assert.equal(hash,baseline.cards['home.png'].sha256,'Home OG card bytes stay identical');
 await writeFile(join(evidence,`${phase}-og-home.png`),card);
 assert.deepEqual(errors,[]);
 await writeFile(join(evidence,`${phase}-browser.json`),JSON.stringify({engine:'chromium',browser:browser.version(),node:process.version,basePath:baseline.basePath,pages,mobile:{width:390,noHorizontalOverflow:true},ogHome:{status:response.status(),sha256:hash,matchesBaseline:true},errors},null,2)+'\n');
 await context.close();
 console.log(`${phase}: local docs browser captures, mobile overflow and OG home verified`);
}finally{await browser?.close();server.kill();}
