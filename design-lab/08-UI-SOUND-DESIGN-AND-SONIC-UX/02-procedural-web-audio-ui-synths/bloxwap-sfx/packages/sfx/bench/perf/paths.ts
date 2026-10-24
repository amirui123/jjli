import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const packageDir = fileURLToPath(new URL('../..', import.meta.url));
export const outDir = resolve(packageDir, process.env.BENCH_OUT ?? 'bench/perf/.out');
export const rawDir = resolve(outDir, 'raw');

export function variantPath(name: string): string {
  if (name === 'base') return 'dist';
  if (!/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(name)) {
    throw new Error(`Expected base or a variant directory name, got: ${name}`);
  }
  return `.perf-variants/${name}`;
}

export function variantURL(name: string): URL {
  return new URL(`../../${variantPath(name)}/`, import.meta.url);
}
