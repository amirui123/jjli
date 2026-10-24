# SFX docs: HIG candidate refresh (872906a)

Before = `main` at `7d0b3c8` (HIG `0.1.0-candidate.sha7c67a07c`, [sfx#50](https://github.com/bloxwap/sfx/pull/50)).
After = this branch, with `0.1.0-candidate.sha872906a9` tarballs from
[bloxwap/hig@872906a](https://github.com/bloxwap/hig/tree/872906a9071469af8714b3b6fb5cc7bd64d2d6f3).

## Workarounds removed

| Upstream fix | Workaround in sfx#50 | Now |
| --- | --- | --- |
| [hig#65](https://github.com/bloxwap/hig/issues/65) token font variables | `hig-bridge.css` set `.hig-button`/`.hig-number` `font-family` to the Next loader variables | Bridge rules removed; HIG CSS reads `--hig-font-sans`/`--hig-font-mono`. The smoke test asserts the install copy button's first family is a loaded Bloxwap face |
| [hig#63](https://github.com/bloxwap/hig/issues/63) caret Radix peers | npm nested Fumadocs' Radix (22 nested entries, about 18 KB of JS) | One Radix tree: 48 → 34 entries, 0 nested. Fumadocs and HIG React hoist to the root |
| [hig#66](https://github.com/bloxwap/hig/issues/66) radius/motion/density roles | Bridge hard-coded HIG radius, motion and compact values (14px, 180/260/320 ms, 36px) plus its own reduced-motion zeroing | Bridge aliases point at `--hig-radius-*`, `--hig-motion-*`, `--hig-density-compact-control`; HIG zeroes durations for reduced motion |
| [hig#64](https://github.com/bloxwap/hig/issues/64) TTFs out of web tokens | 4.4 MB tokens tarball carried the OG faces | Tokens tarball is 8 KB; OG faces come from the build-time `@bloxwap/hig-native-fonts` devDependency |
| [hig#69](https://github.com/bloxwap/hig/issues/69) Callout severities/titles | `idea` fell back to `info`; titles were strings only | `note`/`idea` map to HIG `note`/`tip`; ReactNode titles pass through |

The install tabs keep their SDK-specific row (`$` prompt, inline icon copy). Its panel starts with text, so
HIG Tabs correctly keeps the panel as its tab stop (hig#69 only removes the stop when the first content is
focusable).

## Measurements

From `measurements.json`. Emitted file sums, not transfer sizes.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Vendored tarballs | 4,446,466 B (3) | 4,454,889 B (4) | +8,423 B |
| … web packages only (tokens + react + contracts) | 4,446,466 B | 34,514 B | −4,411,952 B |
| Lockfile package entries | 522 | 509 | −13 |
| Lockfile Radix entries (nested) | 48 (22) | 34 (0) | −14 (−22) |
| Emitted JS | 1,122,957 B (367,566 gzip) | 1,112,363 B (364,524 gzip) | −10,594 B (−3,042 gzip) |
| Emitted CSS | 158,666 B (25,235 gzip) | 167,295 B (26,769 gzip) | +8,629 B (+1,534 gzip) |
| Emitted fonts (22 files) | 12,965,628 B | 12,965,628 B | 0 |
| Total static export (159 files) | 18,947,908 B | 18,945,943 B | −1,965 B |
| `styles/hig-bridge.css` | 66 lines / 2,744 B | 63 lines / 2,689 B | −3 / −55 B |

JS shrinks because the duplicated Radix tree is gone. CSS grows because HIG's stylesheet now ships the
radius/type/motion/density/font roles, density selectors and Callout severities. The repository carries
about the same tarball bytes only because the OG renderer still needs two static TTFs. Re-resolving the
Radix subtree also moved `motion`/`framer-motion` 14.1.0 → 14.3.0 and `motion-utils` 14.1.0 → 14.1.1
(within Fumadocs' ranges); the full lockfile diff is in `measurements.json`.

## Checks (local, macOS arm64, Node 24.10.0, npm 11.6.1)

| Command | Result |
| --- | --- |
| `rm -rf node_modules && npm ci` | pass |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 183 tests pass |
| `NEXT_PUBLIC_BASE_PATH=/sfx ... npm run docs:build` | pass: 18 HTML files, 15 social cards, base path /sfx |
| `npm run docs:check` | pass |
| `DOCS_URL=http://127.0.0.1:5304/sfx/ npm run docs:smoke -- --project chromium --project webkit` | 6/6 passed (sound board, controls, demo, search, recipe editor, HIG shell incl. the new font check) |

Firefox could not launch inside this machine's sandbox, as in sfx#50; PR CI covers Linux builds.

## Screenshots

`screenshots/`: before/after at 1440×900 and 390×844 (Playwright Chromium, reduced motion, external
requests blocked) for `home`, `getting-started`, `native-callout` and `recipe-editor`. They are visually
equivalent: HIG buttons are 4 px shorter by default (hig#80). Browser captures only.

## Not covered

No physical iPhone/Android, VoiceOver/TalkBack, perceived audio latency, iOS Simulator or Android
emulator; this is a static web docs change. Nothing was published, tagged or released.

Rollback: revert the PR (restores the previous tarballs, lockfile and bridge).
