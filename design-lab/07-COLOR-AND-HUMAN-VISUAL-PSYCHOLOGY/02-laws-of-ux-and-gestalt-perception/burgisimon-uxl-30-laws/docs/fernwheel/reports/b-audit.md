# UXL runtime audit

**3** page renders · **3** findings (**0** critical, **0** major, **3** minor) · heuristic score **96/100**

Each finding cites the Law of UX it violates (lawsofux.com). Measurements are heuristics. Confirm visually in the annotated screenshots.

## with-uxl/index.html · small

- Targets: 31 interactive, 0 undersized · Body text: 16px · Font sizes: 11 · Families: instrument sans, bricolage grotesque
- Paint: FCP 276ms · LCP 276ms · CLS 0.000 · Filled CTAs in first screen: 1 · h1: 1
- Screenshots: `screens/b-small.png` (first screen), `screens/b-small-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 11 distinct font sizes in use | 13, 14, 16, 18, 20, 22, 24, 28, 32, 40, 52 | Use a type scale of ~6-8 sizes and at most 2 font families. |

## with-uxl/index.html · mobile

- Targets: 31 interactive, 0 undersized · Body text: 16px · Font sizes: 11 · Families: instrument sans, bricolage grotesque
- Paint: FCP 236ms · LCP 236ms · CLS 0.000 · Filled CTAs in first screen: 1 · h1: 1
- Screenshots: `screens/b-mobile.png` (first screen), `screens/b-mobile-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 11 distinct font sizes in use | 13, 14, 16, 18, 20, 22, 24, 28, 32, 40.34, 52 | Use a type scale of ~6-8 sizes and at most 2 font families. |

## with-uxl/index.html · desktop

- Targets: 35 interactive, 0 undersized · Body text: 16px · Font sizes: 11 · Families: instrument sans, bricolage grotesque
- Paint: FCP 320ms · LCP 320ms · CLS 0.027 · Filled CTAs in first screen: 2 · h1: 1
- Screenshots: `screens/b-desktop.png` (first screen), `screens/b-desktop-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 11 distinct font sizes in use | 13, 14, 16, 18, 20, 22, 24, 40, 52, 56, 76 | Use a type scale of ~6-8 sizes and at most 2 font families. |

---

Not measurable at runtime (review manually): §L04 Cognitive Bias, §L12 Law of Common Region, §L16 Law of Uniform Connectedness, §L19 Occam's Razor, §L20 Paradox of the Active User, §L21 Pareto Principle, §L22 Parkinson's Law, §L23 Peak-End Rule, §L27 Tesler's Law, §L30 Zeigarnik Effect