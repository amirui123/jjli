import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';

const { outputFiles } = await build({ entryPoints: ['src/index.ts'], bundle: true, minify: true, write: false, format: 'esm', platform: 'browser', target: 'es2020', external: ['react', 'react-dom'] });
const bytes = gzipSync(outputFiles[0].contents).byteLength;
const budget = 8192;
console.log(`Browser bundle including web-haptics, excluding React: ${bytes} gzip bytes (budget ${budget}).`);
if (bytes > budget) throw new Error('Haptic exceeds its measured bundle-size budget.');
