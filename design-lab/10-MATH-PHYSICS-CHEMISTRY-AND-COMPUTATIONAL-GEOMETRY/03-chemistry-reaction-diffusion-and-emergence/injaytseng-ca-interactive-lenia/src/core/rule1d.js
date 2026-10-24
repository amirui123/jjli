// Elementary (1-D, radius-1) cellular automaton. Wolfram rule number 0..255.
// Wraps around at the edges so the row is a ring.
export function stepRow(row, rule, out = new Uint8Array(row.length)) {
  const n = row.length;
  for (let i = 0; i < n; i++) {
    const l = row[i === 0 ? n - 1 : i - 1];
    const c = row[i];
    const r = row[i === n - 1 ? 0 : i + 1];
    out[i] = (rule >> ((l << 2) | (c << 1) | r)) & 1;
  }
  return out;
}

export function seedRow(n, mode, rng = Math.random) {
  const row = new Uint8Array(n);
  if (mode === 'seed') row[n >> 1] = 1;
  else for (let i = 0; i < n; i++) row[i] = rng() < 0.5 ? 1 : 0;
  return row;
}
