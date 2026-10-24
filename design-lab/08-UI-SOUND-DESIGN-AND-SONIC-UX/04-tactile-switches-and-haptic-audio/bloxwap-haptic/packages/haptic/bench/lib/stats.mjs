import { performance } from 'node:perf_hooks';

export const rows = [];

export function summarize(name, values, unit = 'ms') {
  values.sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];
  rows.push({
    name,
    median,
    p95: values[Math.ceil(values.length * 0.95) - 1],
    unit,
    samples: values.length,
    ...(unit === 'ms/render' ? { opsPerSecond: 1000 / median } : {}),
  });
}

export async function sample(name, action, unit, repetitions = 9, divisor = 1) {
  for (let i = 0; i < 3; i++) {
    await action();
  }
  const values = [];
  for (let i = 0; i < repetitions; i++) {
    const start = performance.now();
    await action();
    values.push((performance.now() - start) / divisor);
  }
  summarize(name, values, unit);
}
