# UXL runtime audit

**3** page renders · **10** findings (**2** critical, **2** major, **6** minor) · heuristic score **58/100**

Each finding cites the Law of UX it violates (lawsofux.com). Measurements are heuristics. Confirm visually in the annotated screenshots.

## without-uxl/index.html · small

- Targets: 35 interactive, 11 undersized · Body text: 16px · Font sizes: 20 · Families: inter, bricolage grotesque
- Paint: FCP 724ms · LCP 724ms · CLS 0.000 · Filled CTAs in first screen: 2 · h1: 1
- Screenshots: `screens/a-small.png` (first screen), `screens/a-small-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| critical | `tap-target-size` | §L07 Fitts's Law | 11 of 35 interactive targets are smaller than 44×44px (9 below 24px) | ul > li > a "Plans" 41×20; ul > li > a "Test ride" 66×20; ul > li > a "Delivery area" 100×20; ul > li > a "FAQ" 31×20; ul > li > a "Contact" 59×20; ul > li > a "Privacy" 56×20 | min-height/min-width 44px, or expand the hit area with ::after (inset: -10px). |
| major | `tap-target-spacing` | §L07 Fitts's Law, §L13 Law of Proximity | 2 small targets sit < 8px from a neighbour | div > p.pc-hint > button.linkish ↔ div > p.pc-hint > button.linkish (8px); div > p.pc-hint > button.linkish ↔ div > p.pc-hint > button.linkish (8px) | Keep >= 8px between separate targets, or merge them into one larger control. |
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 19 distinct font sizes in use | 12, 12.5, 13, 14, 14.5, 15, 15.5, 16, 18, 19, 20, 24, 26, 30, 32, 34, 36, 46, 54, 64 | Use a type scale of ~6-8 sizes and at most 2 font families. |
| minor | `cta-competition` | §L28 Von Restorff Effect, §L10 Hick's Law | 2 filled actions share the first screen; make sure one clearly dominates | "Book a test ride", "Book a free test ride" | One filled/high-emphasis primary action per view; demote others to secondary/ghost styles. |

## without-uxl/index.html · mobile

- Targets: 35 interactive, 11 undersized · Body text: 16px · Font sizes: 20 · Families: inter, bricolage grotesque
- Paint: FCP 244ms · LCP 244ms · CLS 0.000 · Filled CTAs in first screen: 2 · h1: 1
- Screenshots: `screens/a-mobile.png` (first screen), `screens/a-mobile-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| critical | `tap-target-size` | §L07 Fitts's Law | 11 of 35 interactive targets are smaller than 44×44px (9 below 24px) | ul > li > a "Plans" 41×20; ul > li > a "Test ride" 66×20; ul > li > a "Delivery area" 100×20; ul > li > a "FAQ" 31×20; ul > li > a "Contact" 59×20; ul > li > a "Privacy" 56×20 | min-height/min-width 44px, or expand the hit area with ::after (inset: -10px). |
| major | `tap-target-spacing` | §L07 Fitts's Law, §L13 Law of Proximity | 2 small targets sit < 8px from a neighbour | div > p.pc-hint > button.linkish ↔ div > p.pc-hint > button.linkish (8px); div > p.pc-hint > button.linkish ↔ div > p.pc-hint > button.linkish (8px) | Keep >= 8px between separate targets, or merge them into one larger control. |
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 19 distinct font sizes in use | 12, 12.5, 13, 14, 14.5, 15, 15.5, 16, 18, 19, 20, 24, 26, 30, 32, 34, 36, 46, 54, 64 | Use a type scale of ~6-8 sizes and at most 2 font families. |
| minor | `cta-competition` | §L28 Von Restorff Effect, §L10 Hick's Law | 2 filled actions share the first screen; make sure one clearly dominates | "Book a test ride", "Book a free test ride" | One filled/high-emphasis primary action per view; demote others to secondary/ghost styles. |

## without-uxl/index.html · desktop

- Targets: 39 interactive, 9 undersized · Body text: 17px · Font sizes: 22 · Families: inter, bricolage grotesque
- Paint: FCP 304ms · LCP 304ms · CLS 0.000 · Filled CTAs in first screen: 2 · h1: 1
- Screenshots: `screens/a-desktop.png` (first screen), `screens/a-desktop-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| minor | `tap-target-size` | §L07 Fitts's Law | 9 of 39 interactive targets are smaller than 24×24px | ul > li > a "Plans" 44×20; ul > li > a "Test ride" 70×20; ul > li > a "Delivery area" 106×20; ul > li > a "FAQ" 33×20; ul > li > a "Contact" 63×20; ul > li > a "Privacy" 60×20 | min-height/min-width 44px, or expand the hit area with ::after (inset: -10px). |
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 21 distinct font sizes in use | 12, 13, 14, 14.5, 15, 15.5, 16, 17, 18, 21, 23, 24, 26, 28, 30, 50, 54, 56, 60, 62, 64, 96 | Use a type scale of ~6-8 sizes and at most 2 font families. |

---

Not measurable at runtime (review manually): §L04 Cognitive Bias, §L12 Law of Common Region, §L16 Law of Uniform Connectedness, §L19 Occam's Razor, §L20 Paradox of the Active User, §L21 Pareto Principle, §L22 Parkinson's Law, §L23 Peak-End Rule, §L27 Tesler's Law, §L30 Zeigarnik Effect