# 05 — What's happened since, and what's still open

The einstein problem is solved. The field that opened up behind it is not.

## Mathematics, 2023–2026

**Alternative and simplified proofs.** Several groups have re-proved aperiodicity
by other routes — a golden-ratio argument
([arXiv:2403.09640](https://arxiv.org/pdf/2403.09640)), an alternative proof
([arXiv:2307.12322](https://arxiv.org/html/2307.12322)), a Markov-partition
construction ([arXiv:2604.20964](https://arxiv.org/pdf/2604.20964)). The
incommensurability technique from the original paper is the interesting one to
generalize: it is a genuinely new tool, and nobody yet knows its full reach.

**Structure theory.** The hat family's dynamics and topology
([arXiv:2305.05639](https://arxiv.org/html/2305.05639)), long-range order and
diffraction of spectre tilings
([arXiv:2411.15503](https://arxiv.org/pdf/2411.15503), *Discrete & Computational
Geometry*, 2025), homochiral inflation for `Tile(1,1)`
([arXiv:2502.15608](https://arxiv.org/pdf/2502.15608)), the tilings' relation to
rhombic tilings ([arXiv:2403.01911](https://arxiv.org/pdf/2403.01911)), and a
group-theoretic view ([arXiv:2409.15880](https://arxiv.org/pdf/2409.15880)).

**Placing them in the taxonomy.** Survey work relating Wang tiles, Penrose,
the hat and the spectre in one framework
([arXiv:2310.06759](https://arxiv.org/pdf/2310.06759)); finite-state transducers
for substitution tilings ([arXiv:2512.16595](https://arxiv.org/pdf/2512.16595)).

## Physics and materials

The hat and spectre are now standard test lattices for aperiodic-order physics —
they are the simplest aperiodic geometries available, so they get used the way the
honeycomb lattice gets used.

- **Statistical mechanics** — Ising models on the hat
  ([arXiv:2402.11331](https://arxiv.org/pdf/2402.11331)); quantum dimer models on
  the spectre showing a deconfined phase.
- **Electronic structure** — tight-binding models on the hat give graphene-like
  but *chiral* spectra, macroscopic zero-energy degeneracies, and topological
  behaviour in a magnetic field.
- **Quasilattices** — decorating the spectre with point sets generates a large
  family of non-periodic quasilattices, in contrast to the rigid catalogue of
  Bravais lattices ([arXiv:2502.06926](https://arxiv.org/pdf/2502.06926)).
- **Experiment (2026)** — an *aperiodic polariton monotile*: a driven-dissipative
  artificial material built with structured optical pumping and a programmable
  spatial light modulator, with ballistically propagating polaritons at monotile
  vertices; long-range coherence coexisting with enforced geometric aperiodicity
  ([arXiv:2605.13206](https://arxiv.org/html/2605.13206),
  [arXiv:2605.29023](https://arxiv.org/pdf/2605.29023)).
- **Quantum error correction** — codes derived from hat and spectre tilings
  ([arXiv:2607.15326](https://arxiv.org/html/2607.15326)).

## Engineering applications

- **Metamaterials** — honeycombs with near-zero Poisson's ratio; the `Tile(a,b)`
  continuum is attractive here precisely because it is *continuous*, giving a
  tunable geometry parameter rather than a discrete catalogue.
- **Composites** — aperiodic microstructures that are defect-tolerant and combine
  ductility with strength, because there is no periodic cleavage direction for a
  crack to follow.
- **Sensor arrays** — aperiodic monotile arrays beat the classical aliasing limit,
  since there is no lattice periodicity to fold high frequencies back in
  ([arXiv:2408.16476](https://arxiv.org/pdf/2408.16476)).

## Open questions

Kaplan's own summary is that "there's still so much we don't understand" about
aperiodicity's nature and limits. Concretely:

- **Why does it work?** There is no theory that predicts which shapes will be
  aperiodic. The hat was found by hand, and had been catalogued and overlooked
  repeatedly. What is the invariant?
- **How rare is it?** Is the hat continuum an isolated curiosity, or one point in
  a large space of aperiodic monotiles waiting to be found? Almost nothing is known
  about the measure of aperiodic shapes among, say, polykites.
- **A convex einstein?** No convex aperiodic monotile is known in the plane. The
  hat is strongly non-convex.
- **Higher dimensions.** An aperiodic monotile in 3D that is genuinely aperiodic
  (not merely screw-symmetric like SCD) is still open. Likewise hyperbolic and
  spherical settings.
- **Simply-connected, no reflections, no decorations, and *simpler*?** How small
  can the description complexity of an einstein be — fewer edges than 13/14?
- **Can the incommensurability technique prove other things?** This is probably
  the highest-value open direction: the method is new and its scope is untested.

## Reading order if you want to go deeper

1. The two primary papers ([references.md](references.md)).
2. Kaplan's [isohedral.ca overview](https://isohedral.ca/aperiodic-monotiles/) —
   the discovery narrative from inside.
3. [arXiv:2310.06759](https://arxiv.org/pdf/2310.06759) for where these sit in the
   wider theory of aperiodic tile sets.
4. Tatham's [combinatorial coordinates](https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/aperiodic-spectre/)
   if you are building anything.
