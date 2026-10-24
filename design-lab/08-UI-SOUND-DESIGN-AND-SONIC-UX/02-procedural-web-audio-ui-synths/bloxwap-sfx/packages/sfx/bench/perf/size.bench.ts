import { rawDir } from './paths.ts';
// Matches scripts/size.ts; the original budget gate remains authoritative.
import { build } from 'esbuild';
import { gzipSync,brotliCompressSync } from 'node:zlib';
import { readFile,mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { table } from './stats.ts';
const root=fileURLToPath(new URL('../..',import.meta.url));
const pkg=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8'));
const entries:[string,string][]=Object.entries(pkg.exports).filter(([,v]:any)=>typeof v==='object'&&v.import).map(([n,v]:any)=>[n,`export * from '${v.import}';`]);
for(const [symbol,entry]of [['play','index'],['bind','index'],['encodeWav','wav'],['renderBuffer','index']])entries.push([symbol+' only',`export { ${symbol} } from './dist/${entry}.js';`]);
const rows=[];
for(const [name,contents]of entries){
 const result=await build({stdin:{contents,resolveDir:root,loader:'js'},bundle:true,minify:true,format:'esm',write:false,treeShaking:true,target:'es2022',external:['react','react/*']});
 const code=result.outputFiles[0].contents;rows.push([name,code.length,gzipSync(code,{level:9}).length,brotliCompressSync(code).length]);
}
console.log('# Bundle sizes\n\n'+table(['entry','min bytes','gzip bytes','brotli bytes'],rows));
console.log('\nReact is external; non-JavaScript metadata and wildcard assets are excluded. Run npm run size for the existing size budget gate.');
await mkdir(rawDir,{recursive:true});await writeFile(`${rawDir}/size-${Date.now()}.json`,JSON.stringify({node:process.version,rows},null,2));
