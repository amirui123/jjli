# SFX docs: HIG package migration (bloxwap/hig#34)

Before = `main` at `f68d375`. After = this branch. HIG = 0.1.0 candidate tarballs from
`bloxwap/hig@7c67a07`, installed from `vendor/bloxwap-hig/` (see its README for hashes).

## What changed

| Area | Before | After |
| --- | --- | --- |
| Tokens/palette | Hand-vendored `styles/hig/tokens.css` | `@import '@bloxwap/hig-tokens/css'` |
| Controls | Hand-vendored `styles/hig/controls.css` plus a local `.btn` alias layer | `@import '@bloxwap/hig-react/css'`; buttons use `hig-button` intents and `data-hig-density="compact"` |
| Spacing | Local `--space-*`/`--text-*` alias layer | `--hig-space-*` directly; Tailwind supplies `--text-*` |
| Install control | Bespoke tablist | HIG `Tabs` (roving focus, arrows/Home/End), one copy result per panel |
| Copy buttons | `.btn--ghost.btn--icon` | `hig-button` ghost icon with a `hig-sr-only` status |
| Callouts | Fumadocs default (none used) | MDX `<Callout>` renders HIG `Callout`, not a live region; native guide's platform-verification note uses it |
| Search | Fumadocs static search, default empty state | Same Fumadocs/Orama static index; HIG no-results state and HIG error `Alert` with llms.txt fallback |
| Forms | Recipe editor used unstyled label/select; its code rendered as inline-code chips | `hig-surface`/`hig-field`/`hig-input`, a scrollable focusable code block |
| Font family in HIG recipes | `.hig-button` asked for `'Bloxwap Sans'`, which the Next loader does not register, so it fell back to system-ui | Bridge maps HIG recipe families to the loader variables |
| OG fonts/colors | Copied TTFs in `apps/docs/fonts` and hex constants | `@bloxwap/hig-tokens/fonts/*` and `tokens.colors` |

Kept as they were: Fumadocs routing and layout, `/sfx` base path, static export, metadata,
social cards, sitemap/llms.txt, deep links, API examples, the sound board (canvas scope, mixer,
pads, keyboard map, snippet copy), the binding demo (`data-sound-*` with native buttons, so HIG's
React `Button` and its `stopPropagation` never sit between `bind()` and the target), the recipe
editor's define/play/copy, and the semantic preference preview.

Exceptions, all in `apps/docs/styles/hig-bridge.css`: SDK sound-category colors (purple, yellow,
pink in OG bar), two landing layout steps wider than HIG section spacing, and HIG's JS-only
radius/motion/compact values exposed as CSS variables.

## Measurements

From `measurements.json`. Emitted file sums, not transfer sizes.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Docs source CSS lines (apps/docs) | 605 | 501 | -104 |
| Docs source CSS bytes | 35,675 | 31,110 | -4,565 |
| Source CSS files | 4 | 2 | -2 |
| Repo font/CSS/licence files removed from apps/docs | | | 8 files, 904,457 B |
| Emitted CSS (2 files) | 156,951 B (24,876 gzip) | 158,666 B (25,215 gzip) | +1,715 B (+339 gzip) |
| Emitted JS | 1,101,714 B (359,845 gzip) | 1,122,957 B (366,687 gzip) | +21,243 B (+6,842 gzip) |
| Emitted fonts (22 files) | 12,965,628 B | 12,965,628 B | 0 |
| Total static export (159 files) | 18,927,778 B | 18,947,908 B | +20,130 B |
| Docs direct dependencies | 9 | 12 | +3 (`hig-tokens`, `hig-react`, `hig-contracts`) |
| Lockfile package entries | 503 | 520 | +17 |

Emitted CSS grew by 1.7 KB. It now includes the packaged token CSS's oklch block, which the
hand-copied snapshot did not have, plus the new recipe/callout/search-state layout. The removed
alias layers offset part of that. JS breakdown (build with only the lockfile change):

- Radix re-resolution: +18,180 B raw, +5,936 gzip. `@bloxwap/hig-react` pins optional peers
  `@radix-ui/react-dialog`/`react-popover` to exactly 1.1.15, which conflicts with Fumadocs'
  `^1.1.23`. npm then nests Fumadocs' Radix and re-resolves it to 1.3.1 (inside Fumadocs' ranges).
  Root `overrides` did not change this. The docs never import HIG's overlay entry. This should be
  fixed in HIG (widen or drop the exact optional peer pins).
- HIG React code and component changes: +3,063 B raw, +906 gzip.

## Checks (local, macOS arm64, Node 24.6.0)

| Command | Result |
| --- | --- |
| `npm ci` | pass (file: tarballs resolve; lockfile in sync) |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm run coverage` | 183 tests pass, 100% lines/branches/functions |
| `npm run size` | full 6,305 B gzip (budget 6,656) |
| `npm audit --audit-level=high` | 0 vulnerabilities |
| `NEXT_PUBLIC_BASE_PATH=/sfx ... npm run docs:build` | 18 HTML, 15 social cards, base path /sfx |
| `npm run docs:check` | pass |
| `npm run test:browser -- --project chromium --project webkit` | 7 passed, 1 skipped |
| `DOCS_URL=http://127.0.0.1:4131/sfx/ npm run docs:smoke` (Chromium, WebKit) | 6/6 passed. Chromium x4 repeats: 12/12 |

Firefox could not launch inside this machine's sandbox (`sandbox_extension_issue_file_to_process`
failed), so Firefox results come from PR CI (Linux, Xvfb, PulseAudio null sink).

The new smoke test `HIG shell: …` (in `apps/docs/test/deployed.spec.ts`) covers these:

- Keyboard: Tab order reaches the header, hero actions and the selected install tab, each with a
  visible focus ring. WebKit skips links in the Tab order by default, so the link check is not run there.
- Install/copy: HIG Tabs respond to ArrowRight and End; copying from a panel reports "copied"
  or the manual-copy fallback.
- Search: ⌘/Ctrl+K opens search, a query with no matches shows the HIG no-results state, Escape closes it.
- Callout: the native guide's platform-verification callout renders with warning severity and
  is not a live region.
- 404: the recovery link keeps the `/sfx/docs/` base path.
- Mobile at 390 px: no horizontal scroll; the sidebar opens and navigates to `/docs/api/recipes/`,
  where the recipe editor renders.
- WebKit reports Next RSC prefetches that a navigation cancels as page errors ("access control
  checks"). Those payloads return 200 from the static export, so the test ignores only that message.

The overflow assertions in the existing recipe test now poll. Under parallel load, Fumadocs'
responsive header sometimes measured 392 px for one frame after `setViewportSize`.

## Screenshots

`screenshots/` has before/after pairs at 1440×900 desktop and 390×844 mobile (Playwright
Chromium, reduced motion, served by `npm run docs:preview` with `/sfx`): `home`, `board`,
`recipe-editor`, `react-preferences`, `search-empty`, `native-callout`, `not-found`, plus
`mobile-nav-mobile` and the `og-home` social card. These are browser captures only.

## Not covered

No physical iPhone/Android, VoiceOver/TalkBack, perceived audio latency, or haptics were
tested. No iOS Simulator or Android emulator run applies to this static web docs change. Large-text
and RTL checks were not run. The HIG adoption matrix row in bloxwap/hig is updated by its owner.
Nothing was published, tagged, or released.

Rollback: revert the PR. That restores the previous lockfile, imports and vendored CSS/font files.
