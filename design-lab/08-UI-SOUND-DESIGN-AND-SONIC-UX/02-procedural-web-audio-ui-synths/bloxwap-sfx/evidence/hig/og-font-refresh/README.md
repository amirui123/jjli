# sfx docs: OG-only font candidate refresh (hig#115)

This isolated refresh adopts HIG `0.1.0-candidate.shae3390bbd` from
[`e3390bbd`](https://github.com/bloxwap/hig/tree/e3390bbd0ac12b9d4b371175bd250d01ea866abe).
The [candidate release report](candidate-report.json) records a clean source snapshot and no publication.

The OG renderer now reads the approved Bold and Black TTFs with
`@bloxwap/hig-og-fonts/node` `readOgFont()`. It keeps the `Bloxwap Sans` name, normal style,
weights 700/900, and the exact prior bytes/SHA-256 values ([before](before.json), [after](after.json)).

All **15 generated OG PNGs are byte-identical** to the pre-refresh production export.
The desktop home/docs and 390 px home captures are also byte-identical, with no page errors or
horizontal overflow ([browser comparison](browser-comparison.json)). Both builds use Next16.4.1 / Playwright1.64.1 and the same
real deployment base path, with baseline main `4f9fcce`. The explicit `hig-react/css/base` import preserves the previous
whole-page rules after HIG split them from component CSS.

The vendor set drops from 4,454,889 B to 881,378 B (**−3,573,511B**). The native-fonts archive,
dev dependency and lock entries are removed; no TTF is included in the static export.
`vendor/bloxwap-hig/provenance.json` and the docs guard verify all four archive hashes, installed
candidate versions and the exact selected font faces.

Validated locally on Node 24.6.0 / npm 11.5.1:

- Fresh lock resolution and `npm ci`, without compatibility flags.
- Root build, lint, typecheck and **190 tests** ([log](root-gates.log)).
- Production default-Turbopack docs build: **15 cards** ([log](after-build.log)).
- Docs provenance/font/type gates ([log](docs-check.log)).
- Existing Chromium docs smoke: **3 checks** against the local production export ([log](docs-smoke.log)).
- Before/after browser captures and all-card byte comparison ([report](report.json)).

The old-lock update attempted to fetch an unpublished transitive candidate. Moving the generated
install/lock aside and resolving the coherent file dependencies from scratch avoided that fetch.

Package publication and deployment are outside this refresh. Remote CI and the central HIG
adoption linkage are tracked through the draft refresh PR.

A later [normal main integration](main-sync-2026-10-18/README.md) preserves the original candidate
and all 15 OG cards, rehearses the updated owning gates and records why strict branch protection
required updating the feature branch. The original baseline evidence above remains historical.
