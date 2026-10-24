import { build } from 'esbuild';
import { gzipSync, brotliCompressSync } from 'node:zlib';

function dependencyBytes(metafile) {
  let bytes = 0;
  for (const output of Object.values(metafile.outputs)) {
    for (const [path, input] of Object.entries(output.inputs)) {
      if (path.includes('web-haptics/')) bytes += input.bytesInOutput;
    }
  }
  return bytes;
}

export async function measureBundles(cwd) {
  const entries = [
    ['Full ESM', 'index.js', null, 'esm'],
    ['Full CJS', 'index.cjs', null, 'cjs'],
    ...['triggerHaptic', 'canTriggerHaptic', 'isIOSWebKitWithoutVibration', 'useIOSNativeHaptics', 'HapticTarget']
      .map(name => [name, 'index.js', name, 'esm']),
    ['createHapticAdapter', 'feedback.js', 'createHapticAdapter', 'esm'],
    ['web-haptics defaultPatterns', null, 'defaultPatterns', 'esm'],
    ['web-haptics WebHaptics', null, 'WebHaptics', 'esm'],
  ];
  const bundles = [];
  for (const [name, file, exportName, format] of entries) {
    const specifier = file ? `./dist/${file}` : 'web-haptics';
    const entry = exportName ? {
      stdin: {
        contents: `import { ${exportName} } from '${specifier}'; console.log(${exportName});`,
        resolveDir: cwd,
        sourcefile: 'bench-entry.js',
      },
    } : { entryPoints: [`${cwd}/dist/${file}`] };
    const result = await build({
      ...entry,
      bundle: true,
      minify: true,
      write: false,
      metafile: true,
      format,
      platform: 'browser',
      target: 'es2020',
      external: ['react', 'react/*'],
      logLevel: 'silent',
    });
    const bytes = result.outputFiles[0].contents;
    bundles.push({
      name,
      minified: bytes.length,
      gzip: gzipSync(bytes).length,
      brotli: brotliCompressSync(bytes).length,
      webHapticsBytes: dependencyBytes(result.metafile),
    });
  }
  return bundles;
}
