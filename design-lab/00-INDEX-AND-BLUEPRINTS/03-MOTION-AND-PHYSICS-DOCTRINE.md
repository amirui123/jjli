# Blueprint 03: Motion & Physics Doctrine (`Web + After Effects`)
- **Easings:** Expressive Enter `cubic-bezier(0.22, 1, 0.36, 1)`, Snappy Exit `cubic-bezier(0.4, 0, 1, 1)`, Spring Solver `y + k1*y' + k2*y'' = x + k3*x'`.
- **Frame-Rate Independence:** `damp(a, b, lambda, dt) = a + (b - a) * (1 - Math.exp(-lambda * dt))`.
