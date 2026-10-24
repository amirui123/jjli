# Vendored Bloxwap HIG candidate packages

The docs use four packed HIG candidates through `file:` dependencies. These are package archives,
not copied source. `@bloxwap/hig-og-fonts` replaces the former native-fonts build dependency for
Open Graph cards ([bloxwap/hig#115](https://github.com/bloxwap/hig/issues/115)).

| Tarball | Package | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `bloxwap-hig-tokens-0.1.0-candidate.shae3390bbd.tgz` | `@bloxwap/hig-tokens` | 8,227 | `a650c37a3bb34943bbe6b8476906029eb7be014580cbd66b4e91030eace83791` |
| `bloxwap-hig-react-0.1.0-candidate.shae3390bbd.tgz` | `@bloxwap/hig-react` | 21,918 | `f18f76f4847f4f1c75dcec128709454b3b649fd49d98c80bf22c44b3b97cac56` |
| `bloxwap-hig-contracts-0.1.0-candidate.shae3390bbd.tgz` | `@bloxwap/hig-contracts` | 7,205 | `801fea3c0f3d8bcaad20fcee7ffca91b30da59616b5477a288a3a8c2c27536b9` |
| `bloxwap-hig-og-fonts-0.1.0-candidate.shae3390bbd.tgz` | `@bloxwap/hig-og-fonts` | 844,028 | `5d322cd414ac8c6ace05d103f59ac1065ef609ec7cb176e1e91044e0beb9a89e` |

Source: [bloxwap/hig@e3390bbd](https://github.com/bloxwap/hig/tree/e3390bbd0ac12b9d4b371175bd250d01ea866abe),
version `0.1.0-candidate.shae3390bbd`. The [authoritative release report](../../evidence/hig/og-font-refresh/candidate-report.json)
records `sourceTreeDirty: false`, `published: false`, and no tags or releases. `provenance.json`
records the reviewed archive hashes and the exact two font faces this host uses.

The docs consume:

- `@bloxwap/hig-tokens/css` for semantic palette, spacing, radius, motion, density and font roles.
- `@bloxwap/hig-react/css/base` for the whole-page rules used by this docs app, followed by
  `@bloxwap/hig-react/css` for component recipes. The explicit base import preserves the prior
  page/table/focus behavior after HIG split those rules out of component CSS (#95).
- HIG navigation/status/control entries for the existing install picker, callouts and search states.
- `@bloxwap/hig-tokens` for OG colors and `@bloxwap/hig-og-fonts/node` `readOgFont()` for
  `BloxwapSans-Bold.ttf` and `BloxwapSans-Black.ttf`. The loader verifies each TTF against its
  manifest. The renderer keeps `Bloxwap Sans`, weights 700/900 and the original font bytes.
  The package is a dev dependency because the cards are rendered during the static docs build.

The font archive is 844,028 B (previous native bundle: 4,420,375 B). The complete four-archive
vendor set is 881,378 B (previous: 4,454,889 B), a reduction of 3,573,511 B. The docs do not
need the native renderer, native font bundle, feedback backends or chart adapter.

The package/face guard runs in `npm run docs:check` and rejects archive, dependency, installed
version, family, weight or font-byte drift. The font cases remain derived from `@bloxwap/font`
0.1.2; licenses ship in the archive. The [refresh evidence](../../evidence/hig/og-font-refresh/README.md)
records production card comparisons and browser/build checks.

To refresh, pack a reviewed HIG commit, replace these four archives, update the four docs
`file:` specs, provenance and this table, regenerate the lock from a clean dependency install,
and run `npm ci` plus the repository and docs gates. No `legacy-peer-deps` flag is used.
Rollback is a revert of the adopting change, restoring the previous imports, archives and lockfile.
