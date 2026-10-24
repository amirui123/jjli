# Vendored HIG candidate packages

These are the unmodified `npm pack` outputs of the HIG release **dry run**, not
registry packages. HIG has no published npm release yet, so `apps/docs` installs
them through `file:` dependencies and the root `overrides` pin HIG's internal
`@bloxwap/hig-tokens`/`@bloxwap/hig-contracts` dependency to the same files.

- Source: [bloxwap/hig@872906a](https://github.com/bloxwap/hig/tree/872906a9071469af8714b3b6fb5cc7bd64d2d6f3) (0.1.0 candidate)
- Produced with: `npm ci && npm run build && npm run generate:fonts && npm run release:dry-run -- --channel candidate`
  (`generate:fonts` feeds the separate `@bloxwap/hig-native-fonts` package, which the docs do not vendor)
- Only the packages the docs import: `hig-tokens` (CSS variables and roles), `hig-contracts`
  (dependency of `hig-react`), `hig-react` (control CSS, components and the overlay-free
  `recipes/code-window` entry)
- `SHA256SUMS` is verified by `npm run lint` (`.github/scripts/hig-check.mjs`)

Since hig#64 the tokens tarball ships no font binaries (8 KB, down from 4.4 MB); `npm run lint`
asserts the installed package has none. Web fonts come from `@bloxwap/font`. Since hig#63 the
optional Radix peers are caret ranges, so npm keeps one Radix tree with Fumadocs and Vaul
(34 lockfile entries, none nested).

Upgrade: rebuild the dry run from a reviewed HIG commit, replace these files and
`SHA256SUMS`, update the versions in `apps/docs/package.json` and root `overrides`,
then run `npm install`, `npm run lint`, `npm run docs:check`, `npm run docs:build`
and `npm run docs:smoke`. Replace with registry versions once HIG publishes.
Rollback: revert the adopting PR (restores the previous docs CSS and lockfile).
