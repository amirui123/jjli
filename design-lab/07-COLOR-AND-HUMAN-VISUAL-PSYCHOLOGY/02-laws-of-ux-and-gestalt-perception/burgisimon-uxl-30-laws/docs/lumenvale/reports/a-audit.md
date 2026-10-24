# UXL runtime audit

**3** page renders · **7** findings (**0** critical, **0** major, **7** minor) · heuristic score **90/100**

Each finding cites the Law of UX it violates (lawsofux.com). Measurements are heuristics. Confirm visually in the annotated screenshots.

## without-uxl/index.html · small

- Targets: 31 interactive, 0 undersized · Body text: 15px · Font sizes: 12 · Families: familjen grotesk, martian mono
- Paint: FCP 96ms · LCP 96ms · CLS 0.000 · Filled CTAs in first screen: 2 · h1: 1
- Screenshots: `screens/a-small.png` (first screen), `screens/a-small-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| minor | `text-too-small` | §L01 Aesthetic-Usability Effect, §L05 Cognitive Load | Most body text renders at 15px on mobile | 35% of characters | Body text >= 16px on mobile; nothing below 12px. |
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 11 distinct font sizes in use | 12, 13, 14, 15, 16, 17, 18, 20, 22, 32, 43.2, 44 | Use a type scale of ~6-8 sizes and at most 2 font families. |
| minor | `cta-competition` | §L28 Von Restorff Effect, §L10 Hick's Law | 2 filled actions share the first screen; make sure one clearly dominates | "Book a night", "Choose your night" | One filled/high-emphasis primary action per view; demote others to secondary/ghost styles. |

## without-uxl/index.html · mobile

- Targets: 31 interactive, 0 undersized · Body text: 15px · Font sizes: 14 · Families: familjen grotesk, martian mono
- Paint: FCP 80ms · LCP 80ms · CLS 0.000 · Filled CTAs in first screen: 2 · h1: 1
- Screenshots: `screens/a-mobile.png` (first screen), `screens/a-mobile-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| minor | `text-too-small` | §L01 Aesthetic-Usability Effect, §L05 Cognitive Load | Most body text renders at 15px on mobile | 35% of characters | Body text >= 16px on mobile; nothing below 12px. |
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 12 distinct font sizes in use | 12, 13.0691, 14, 15, 16, 16.085, 17, 17.15, 18, 20, 22, 32, 44, 46.8 | Use a type scale of ~6-8 sizes and at most 2 font families. |
| minor | `cta-competition` | §L28 Von Restorff Effect, §L10 Hick's Law | 2 filled actions share the first screen; make sure one clearly dominates | "Book a night", "Choose your night" | One filled/high-emphasis primary action per view; demote others to secondary/ghost styles. |

## without-uxl/index.html · desktop

- Targets: 31 interactive, 0 undersized · Body text: 15px · Font sizes: 15 · Families: familjen grotesk, martian mono
- Paint: FCP 124ms · LCP 124ms · CLS 0.005 · Filled CTAs in first screen: 2 · h1: 1
- Screenshots: `screens/a-desktop.png` (first screen), `screens/a-desktop-annotated.png` (annotated)

| Severity | Rule | Law | Finding | Evidence | Remedy |
|---|---|---|---|---|---|
| minor | `font-sprawl` | §L15 Law of Similarity, §L14 Law of Prägnanz, §L01 Aesthetic-Usability Effect | 14 distinct font sizes in use | 12, 14, 15, 15.4375, 15.84, 16, 17, 18, 19, 20.1601, 22, 23.04, 27.9994, 56.0002, 112 | Use a type scale of ~6-8 sizes and at most 2 font families. |

---

Not measurable at runtime (review manually): §L04 Cognitive Bias, §L12 Law of Common Region, §L16 Law of Uniform Connectedness, §L19 Occam's Razor, §L20 Paradox of the Active User, §L21 Pareto Principle, §L22 Parkinson's Law, §L23 Peak-End Rule, §L27 Tesler's Law, §L30 Zeigarnik Effect