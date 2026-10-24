## UXL static scan

**1** files scanned · **3** findings (**0** critical, **1** major, **2** minor) · heuristic score **92/100**

### Major (1)

| Location | Rule | Law | Finding | Remedy |
|---|---|---|---|---|
| `docs/fernwheel/with-uxl/index.html:548` | `multiple-primary-cta` | §L28 Von Restorff Effect, §L10 Hick's Law | 10 primary-styled actions (6 different) in one file/view | Keep one primary action per view; demote the rest to secondary/tertiary styles. |

### Minor (2)

| Location | Rule | Law | Finding | Remedy |
|---|---|---|---|---|
| `docs/fernwheel/with-uxl/index.html:189` | `slow-animation` | §L06 Doherty Threshold, §L08 Flow | animation: roll-in 1.4s var(--ease-out) both 0.15s | Use 150-300ms for UI transitions (enter ~200-250ms ease-out, exit ~150ms). |
| `docs/fernwheel/with-uxl/index.html:125` | `spacing-off-scale` | §L13 Law of Proximity, §L15 Law of Similarity | 6/20 spacing values are off the 4px grid (e.g. 10px, 14px, 10px, 10px, 6px, 3px) | Use a spacing scale (4, 8, 12, 16, 24, 32, 48, 64...) so grouping by proximity stays consistent. |

Laws implicated: §L28×1, §L10×1, §L06×1, §L08×1, §L13×1, §L15×1
Not statically checkable (review manually): §L12 Law of Common Region, §L16 Law of Uniform Connectedness, §L19 Occam's Razor, §L21 Pareto Principle, §L26 Serial Position Effect, §L30 Zeigarnik Effect
Heuristic scan: verify each finding in context. Pair with uxl_audit.mjs for rendered measurements.
