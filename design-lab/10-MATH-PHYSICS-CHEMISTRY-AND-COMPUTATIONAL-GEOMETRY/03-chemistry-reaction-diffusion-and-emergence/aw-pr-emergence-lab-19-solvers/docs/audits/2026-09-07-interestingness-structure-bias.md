# Interestingness structure-term bias audit — 2026-09-07

**Verdict: the 55% lag-1 structure term is a deliberate tradeoff with a real
smoothness bias, not an implementation defect and not merely a coincidence in
the BZ sweep.** Neighbour covariance is a reasonable way to reject white noise,
but it cannot distinguish organised structure from local smoothness. Coverage,
entropy and liveliness stop a uniform or dead field scoring well; they do not
stop a broad, blurred pattern beating a sharper pattern when those other terms
are similar. The composite is therefore useful as a within-sim ranking aid, but
its structure-led margins are not sufficient promotion evidence on their own.

## Why this is a tradeoff rather than a universal failure

`spatialAutocorrelation` is the covariance of each cell with its right and down
neighbours, divided by field variance. Its own contract says that it approaches
one for smoothly varying structure, sits near zero for white noise, and becomes
negative for high-frequency anti-correlation
([`e2e/harness/metrics.ts`, `spatialAutocorrelation`](../../e2e/harness/metrics.ts)).
The composite then clamps that reading at zero and gives it 55% of the additive
core, against 45% for entropy; coverage and liveliness multiply the result
([`e2e/harness/metrics.ts`, `interestingness`](../../e2e/harness/metrics.ts)).
The nearby design comment explicitly says the intent is to reward coherent
organisation and starve white noise. The implementation matches that intent.

The bias follows from that construction. Low-pass smoothing makes adjacent
samples more alike and therefore usually raises lag-1 covariance. That does not
make high autocorrelation synonymous with blur: a sharp periodic pattern whose
same-valued regions span several cells can also score highly. Conversely, a
one-cell periodic pattern can be anti-correlated at lag 1. The Game of Life
write-up records exactly that counter-case for Maze-like: it is visibly
structured but has autocorrelation -0.07
([Game of Life, “Finding 2”](../sweeps/game-of-life-interestingness.md#finding-2-maze-like-scores-0082-and-the-metric-is-wrong-about-it)).
The repository's multi-lag comment exists for the same reason. Lag-1 is a
local-scale proxy, not a general detector of organisation.

BZ is nevertheless stronger than circumstantial evidence. Along its diffusion
spine, score rises monotonically from 0.879 to 0.967 and autocorrelation from
0.81 to 0.97, while entropy and coverage are U-shaped and flux first falls; the
varied parameter is documented as widening and blurring fronts
([BZ appendix, “Reading”](../sweeps/belousov-zhabotinsky-interestingness.md#reading-1)).
That does not prove every high-autocorrelation field is blurred. It does show
that, when one axis directly controls front width, the composite rewards the
smoother end for the exact mathematical reason predicted by its construction.
The BZ write-up correctly made no promotion
([BZ appendix, “Promotion”](../sweeps/belousov-zhabotinsky-interestingness.md#promotion-1)).

The same limitation appears in the harness configuration note for particle
sims: an unsmoothed point cloud has almost no lag-1 structure, so a term worth
55% collapses and the ranking falls onto coverage
([`e2e/harness/sims.ts`, particle-sim note](../../e2e/harness/sims.ts)). That is
the opposite edge of the same scale preference.

## Promotion audit

The census covers all fifteen `*-interestingness.md` write-ups in
`docs/sweeps/`. Fourteen shipped promotion decisions appear across nine of
them. Six write-ups record no promotion: Abelian Sandpile retained its presets
after the conservation fix ([“Promotion” and re-sweep](../sweeps/abelian-sandpile-interestingness.md#promotion));
BZ declined both the original and diffusion candidates
([original “Promotion”](../sweeps/belousov-zhabotinsky-interestingness.md#promotion),
[appendix “Promotion”](../sweeps/belousov-zhabotinsky-interestingness.md#promotion-1));
and Boids, Kuramoto Oscillators, Particle Life and Swarmalators each explicitly
record none ([Boids](../sweeps/boids-interestingness.md#promotion),
[Kuramoto](../sweeps/kuramoto-oscillators-interestingness.md#promotion),
[Particle Life](../sweeps/particle-life-interestingness.md#promotion),
[Swarmalators](../sweeps/swarmalators-interestingness.md#promotion)).

To discount structure without inventing new sweep results, let published score
be `s`, entropy `e`, and clamped non-negative autocorrelation `a`. Because

`s = coverageFactor * (0.55a + 0.45e) * liveliness`,

the structure-zero contribution recoverable from a write-up is

`D = s * (0.45e) / (0.55a + 0.45e)`.

`D` keeps the published coverage and liveliness factors and sets only the
structure contribution to zero. Renormalising detail from 0.45 to 1 would
multiply both sides of every comparison by the same constant, so it cannot
change the sign of a margin. Values below are approximate where a write-up
reports components to two or three decimals; a remainder smaller than that
source precision is treated as absent, not as a win.

| Promotion and source | Published composite margin | Structure-zero arithmetic | Does the margin survive? |
|---|---:|---:|---|
| Brian's Brain — Sparse spirals, `dyingValue` 0.62 → 0.9 ([“Appearance-sensitive ranking”, “Corrected-kernel references” and “Preset retune”](../sweeps/brians-brain-interestingness.md#appearance-sensitive-ranking)) | 0.051 → 0.055; **+0.004** | `0.051*(.45*.074)/(.55*.339+.45*.074)=.007728` → `0.055*(.45*.074)/(.55*.368+.45*.074)=.007770`; **≈+0.000042** | **Not demonstrated.** The remainder is below source precision. |
| Brian's Brain — Storm, `dyingValue` 0.42 → 0.9 ([same sections](../sweeps/brians-brain-interestingness.md#appearance-sensitive-ranking)) | 0.057 → 0.070; **+0.013** | `0.057*(.45*.083)/(.55*.303+.45*.083)=.010436` → `0.070*(.45*.083)/(.55*.385+.45*.083)=.010496`; **≈+0.000060** | **Not demonstrated.** The remainder is below source precision. |
| Clifford / De Jong — Clifford veils ([“Result”](../sweeps/clifford-dejong-interestingness.md#result-three-of-the-eight-shipped-presets-were-thin-line-figures)) | 0.481 → 0.740; **+0.259** | Exact `e,a` pairs are absent. With new `e≥.72`, clamped `a≤1`: `D_new≥.740*(.45*.72)/(.55*1+.45*.72)=.274325`; always `D_old≤.481`. | **Unknown.** The bounds overlap. |
| Clifford / De Jong — De Jong web → swan ([“Result”](../sweeps/clifford-dejong-interestingness.md#result-three-of-the-eight-shipped-presets-were-thin-line-figures)) | 0.435 → 0.762; **+0.327** | `D_new≥.762*(.45*.72)/(.55*1+.45*.72)=.282481`; `D_old≤.435`. Exact components are absent. | **Unknown.** The bounds overlap. |
| Clifford / De Jong — De Jong scroll → heart ([“Result”](../sweeps/clifford-dejong-interestingness.md#result-three-of-the-eight-shipped-presets-were-thin-line-figures)) | 0.262 → 0.768; **+0.506** | `D_new≥.768*(.45*.72)/(.55*1+.45*.72)=.284705`; `D_old≤.262`; therefore **`D_new-D_old≥.022705`**. | **Yes.** It survives even under worst-case bounds from the reported 0.72–0.78 new entropy range. |
| Cyclic CA — Turbulence, threshold 3 → 2 ([“Promotion: Turbulence”](../sweeps/cyclic-ca-interestingness.md#promotion-turbulence-0250--0719)) | 0.250 → 0.719; **+0.469** | `0.250*(.45*.60)/(.55*.04+.45*.60)=.231164` → `0.719*(.45*.59)/(.55*.82+.45*.59)=.266426`; **+0.035262** | **Yes.** Flux also changes from 0 to 0.1036, recovering a frozen preset. |
| Cyclic CA — Crystal lattice, threshold 2 → 1 ([fine pass and “Promotion”](../sweeps/cyclic-ca-interestingness.md#promotion-crystal-lattice-0283--0626)) | 0.283 → 0.626242; **+0.343242** | `0.283*(.45*.72)/(.55*.02+.45*.72)=.273707` → `0.626242*(.45*.715982)/(.55*.552818+.45*.715982)=.322192`; **+0.048484** | **Yes.** Flux also changes from 0 to 0.4625. |
| DLA — Dense coral ([“Promotion: Dense coral”](../sweeps/diffusion-limited-aggregation-interestingness.md#promotion-dense-coral-0397--0542)) | 0.397 → 0.542; **+0.145** | `0.397*(.45*.351)/(.55*.519+.45*.351)=.141421` → `0.542*(.45*.610)/(.55*.660+.45*.610)=.233379`; **+0.091958** | **Yes.** Entropy and coverage both improve. |
| Game of Life — Dense ash, seed density 0.28 → 0.4 ([“Promotion: Dense ash”](../sweeps/game-of-life-interestingness.md#promotion-dense-ash-0374--0411)) | 0.374 → 0.411; **+0.037** | `0.374*(.45*.24)/(.55*.49+.45*.24)=.106999` → `0.411*(.45*.30)/(.55*.50+.45*.30)=.135329`; **+0.028331** | **Yes.** It also removes a byte-identical duplicate and improves entropy, coverage and flux. |
| Gray-Scott — Spots ([“Every shipped preset”](../sweeps/gray-scott-interestingness.md#every-shipped-preset-old-score-vs-new-score)) | 0.000 → 0.743; **+0.743** on the original recorded run | Original component pairs are absent, so `D_old=0.000*(.45e_o)/(.55a_o+.45e_o)` and `D_new=.743*(.45e_n)/(.55a_n+.45e_n)` cannot be evaluated. The current promoted params give `0.741193*(.45*.5260)/(.55*.9491+.45*.5260)=.231237`, but the pre-promotion params no longer have a current-run row. | **Unknown for the promotion margin.** The current row proves non-zero detail contribution, not the missing old/new comparison. |
| Gray-Scott — Waves ([“Every shipped preset”](../sweeps/gray-scott-interestingness.md#every-shipped-preset-old-score-vs-new-score)) | 0.669 → 0.831; **+0.162** on the original recorded run | Original component pairs are absent. The current promoted params give `0.796346*(.45*.5806)/(.55*.9729+.45*.5806)=.261264`; there is no current-run predecessor, so the sign of the old promotion margin cannot be recovered. | **Unknown.** Mixing the original and current seeds would not answer it. |
| Ising — Positive field, field 0.35 → 0.02 ([original “Ranking”](../sweeps/ising-model-interestingness.md#ranking), [external-field sweep](../sweeps/ising-model-interestingness.md#appendix-external-field-sweep--2026-08-25)) | 0.003 → 0.519035; **+0.516035** | `0.003*(.45*.02)/(.55*.07+.45*.02)=.000568` → `0.519035*(.45*.156358)/(.55*.818375+.45*.156358)=.070167`; **+0.069599** | **Yes.** Coverage moves away from the incumbent's 0.990 saturated lattice. |
| Lenia — add Living labyrinth ([radius “Reading”](../sweeps/lenia-interestingness.md#reading-1), [“Fourth-preset promotion”](../sweeps/lenia-interestingness.md#fourth-preset-promotion--2026-09-01)) | best incumbent 0.413518 → candidate 0.463022; **+0.049504 (11.97%)** | `0.413518*(.45*.3236)/(.55*.5042+.45*.3236)=.142379` → `0.463022*(.45*.282094)/(.55*.692109+.45*.282094)=.115794`; **-0.026586** | **No; it reverses.** The candidate loses on entropy and flux and wins through structure. |
| Physarum — add Root mat ([“Ranking”](../sweeps/physarum-interestingness.md#ranking), [“Promotion appendix”](../sweeps/physarum-interestingness.md#promotion-appendix--2026-08-30)) | best incumbent 0.851 → candidate 0.901; **+0.050 (5.9%)** | `0.851*(.45*.87)/(.55*.98+.45*.87)=.358051` → `0.901*(.45*.84)/(.55*.97+.45*.84)=.373646`; **+0.015595** | **Yes, narrowly.** Structure is almost constant; the surviving gain comes from the other factors. |

The arithmetic does not re-score a field and is not a replacement metric. It
answers the narrower audit question: was the sign of the recorded promotion
margin dependent on the 55% structure contribution? “Unknown” is material: the
Clifford/De Jong write-up gives only aggregate ranges for the new sets, while
the Gray-Scott write-up says the pre-promotion parameter rows no longer exist
and records no original component metrics. Filling those cells numerically
would require a re-run or another source, both outside this card.

## Distinguishing test for a future card

### Phase-scrambled, spectrum-matched blur test

Use four fixed 128×128 scalar fields: a BZ spiral, the Lenia Living labyrinth
candidate, a sharp periodic maze, and white noise. For each source, generate an
iterative amplitude-adjusted Fourier-transform surrogate that preserves the
source's pixel-value histogram and Fourier magnitude spectrum but randomises
phase. This preserves intensity distribution, spatial-frequency power and
therefore smoothness-scale statistics while destroying the source's particular
spatial arrangement. For every original/surrogate pair, also generate Gaussian
blur levels sigma 0, 0.5, 1, 2 and 4, then histogram-match each result back to
its unblurred source so entropy and threshold coverage stay fixed. Use identical
static frames for A and B so temporal flux is exactly zero.

Measure, for every field: current lag-1 autocorrelation, multi-lag
autocorrelation, entropy, coverage and composite; Fourier-magnitude equality;
and a predeclared organisation check appropriate to the source (spiral winding
and connected-front count for BZ, component persistence for Lenia, and dominant
period plus phase continuity for the maze). Include a blinded side-by-side
human judgement of “more organised”, with blur level hidden, as the visual
criterion the composite is meant to assist.

The future card should require exact histogram-bin equality after matching,
coverage within one cell of the source, and surrogate radial-power bins within
2% of the original before accepting a pair. Use at least five blinded raters.
The settling result is predeclared:

- **Smoothness-bias confirmed:** blur raises lag-1/composite for phase-scrambled
  fields monotonically across at least three adjacent blur levels, and their
  median score gain is at least 80% of the originals' gain, while the independent
  organisation checks do not improve and at least four of five raters prefer
  the originals.
- **Genuine-coherence account supported:** surrogate gain is at most 20% of the
  originals' gain, the relevant organisation check improves monotonically with
  the original's score, and at least four of five raters prefer the higher-scored
  original at each accepted blur step.
- **Otherwise inconclusive:** neither threshold is met; retain the tradeoff
  verdict and do not use the test to justify a metric change.

Record all transformations, seeds and exact arrays. That makes the test a
deterministic instrument check rather than another parameter sweep.

## Shipped-preset verdict

**Three shipped decisions need substantive revisiting:** Living labyrinth,
Sparse spirals and Storm. Living labyrinth's measured advantage reverses when
structure is discounted, and its write-up records that live visual verification
was not completed. The two Brian's Brain retunes have no supported non-structure
margin at the precision recorded; their own write-up says the choice is a
brighter-afterglow preference, not richer dynamics. Revisit those three with
targeted visual A/B checks, not automatic reverts.

Four more records need evidence backfill before anyone claims their published
margin survives the discount: Clifford veils, De Jong web → swan, Gray-Scott
Spots and Gray-Scott Waves. This is a documentation/evidence revisit, not on its
own a reason to change the shipped presets: Clifford/De Jong records independent
coverage and visual-character reasons, and the current Gray-Scott write-up
re-baselines the promoted parameters as the two highest-scoring shipped sets.
De Jong scroll → heart does not join that list because its margin survives even
the conservative bounds available in its write-up.

The two Cyclic CA fixes, Dense coral, Dense ash, Positive field, De Jong heart
and Root mat do not need reopening on this evidence: their margins remain
positive without the structure contribution and their write-ups give
independent defect, identity, coverage, entropy, flux or operator-visual reasons.
The six no-promotion sweeps made no shipped decision to revisit.
