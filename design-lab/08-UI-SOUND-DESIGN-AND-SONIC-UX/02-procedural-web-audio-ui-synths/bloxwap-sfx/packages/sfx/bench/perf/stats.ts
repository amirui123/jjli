/** Nearest-rank p95; median averages the two central samples. Units belong to callers. */
export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
export function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export const p95 = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.ceil(xs.length * .95) - 1];
export async function runN<T>(fn: () => T | Promise<T>, { warmup = 1, runs = 15 } = {}): Promise<T[]> {
  if (!Number.isInteger(runs) || runs < 1) throw new Error('runs must be a positive integer');
  for (let i = 0; i < warmup; i++) await fn();
  const samples: T[] = [];
  for (let i = 0; i < runs; i++) samples.push(await fn());
  return samples;
}
export function table(headers: string[], rows: unknown[][]): string {
  const cell = (v: unknown) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(3)) : String(v)).replaceAll('|', '\\|').replaceAll('\n', ' ');
  return [headers, headers.map(() => '---'), ...rows].map(row => `| ${row.map(cell).join(' | ')} |`).join('\n');
}
