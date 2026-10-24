import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const source = process.cwd();
const temporary = mkdtempSync(join(process.env.RUNNER_TEMP || tmpdir(), 'haptic-react-matrix-'));
function run(args, cwd) {
  const result = spawnSync('npm', args, { cwd, stdio: 'inherit', env: process.env });
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed (${result.status})`);
}
try {
  for (const version of ['18.3.1', '19.3.0']) {
    const root = join(temporary, version);
    const project = join(root, 'packages/haptic');
    mkdirSync(project, { recursive: true });
    for (const entry of ['src', 'test', 'vitest.config.ts', 'tsconfig.json']) cpSync(join(source, entry), join(project, entry), { recursive: true });
    mkdirSync(join(root, '.github/planning'), { recursive: true });
    cpSync(resolve(source, '../../.github/planning/reference-observations.json'), join(root, '.github/planning/reference-observations.json'));
    const manifest = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
    manifest.private = true;
    manifest.devDependencies.react = version;
    manifest.devDependencies['react-dom'] = version;
    manifest.devDependencies['@types/react'] = version.startsWith('18') ? '^18' : '^19';
    manifest.devDependencies['@types/react-dom'] = version.startsWith('18') ? '^18' : '^19';
    manifest.overrides = { esbuild: '0.28.2' };
    writeFileSync(join(project, 'package.json'), JSON.stringify(manifest));
    console.log(`\nRunning the complete component, hook, hydration, lifecycle, and engine suite with React ${version}`);
    run(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock'], project);
    run(['run', 'coverage'], project);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
