## UXL static scan

**1** files scanned · **5** findings (**0** critical, **0** major, **5** minor) · heuristic score **92/100**

### Minor (5)

| Location | Rule | Law | Finding | Remedy |
|---|---|---|---|---|
| `docs/fernwheel/without-uxl/index.html:669` | `autocomplete-missing` | §L22 Parkinson's Law, §L24 Postel's Law, §L27 Tesler's Law | <select> looks like personal data (city fcity) but has no autocomplete | Add autocomplete (email, name, tel, street-address, postal-code, cc-number, current-password...). |
| `(project)` | `font-size-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 17 distinct font sizes: 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 17, 18, 20, 22, 24, 26, 30… | Adopt a type scale of ~6-8 steps (see assets/uxl-tokens.css) and map every size to it. |
| `docs/fernwheel/without-uxl/index.html:88` | `slow-animation` | §L06 Doherty Threshold, §L08 Flow | animation: swipe .9s .4s cubic-bezier(.2,.8,.2,1) f | Use 150-300ms for UI transitions (enter ~200-250ms ease-out, exit ~150ms). |
| `docs/fernwheel/without-uxl/index.html:279` | `slow-animation` | §L06 Doherty Threshold, §L08 Flow | transition: opacity .8s ease,transform .8s cubic-bez | Use 150-300ms for UI transitions (enter ~200-250ms ease-out, exit ~150ms). |
| `docs/fernwheel/without-uxl/index.html:44` | `spacing-off-scale` | §L13 Law of Proximity, §L15 Law of Similarity | 59/158 spacing values are off the 4px grid (e.g. 10px, 15px, 14px, 10px, 6px, 10px) | Use a spacing scale (4, 8, 12, 16, 24, 32, 48, 64...) so grouping by proximity stays consistent. |

Laws implicated: §L15×2, §L06×2, §L08×2, §L22×1, §L24×1, §L27×1, §L14×1, §L01×1
Not statically checkable (review manually): §L12 Law of Common Region, §L16 Law of Uniform Connectedness, §L19 Occam's Razor, §L21 Pareto Principle, §L26 Serial Position Effect, §L30 Zeigarnik Effect
Heuristic scan: verify each finding in context. Pair with uxl_audit.mjs for rendered measurements.
