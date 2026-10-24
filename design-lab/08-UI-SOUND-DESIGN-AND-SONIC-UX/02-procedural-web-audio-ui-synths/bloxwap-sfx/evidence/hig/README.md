# SFX HIG adoption evidence

Scope: bloxwap/hig #21–#25 and #34 **SFX-owned prerequisites**. HIG retains the feedback contract, channel policy, haptic adapters and native playback controller. No HIG issue is closed by this change. No open SFX PR existed when work started.

HIG 0.1.0 plain CSS and semantic mapping are pinned to the source commit in `vendor/bloxwap-hig/README.md` (packaged candidate tarballs since the docs package migration; see `docs-package-migration/`) and `semanticSource`. Routing/search remains Fumadocs, as permitted by the migration kit. The `/sfx` static base path, metadata/social cards, deep links, install/copy controls and SDK demos remain on the existing host shell. MIT CSS distribution is included byte-for-byte; host aliases and SDK visualization color exceptions are documented separately.

## Validation

- Node 24.10.0, Linux x86_64. `npm run lint`, `npm run typecheck`, `npm run coverage`: 183 tests, 100% lines/branches/functions. Existing thresholds were retained.
- `NEXT_PUBLIC_BASE_PATH=/sfx NEXT_PUBLIC_SITE_URL=https://bloxwap.github.io npm run docs:build`: 18 HTML files, 15 social cards; static export checks passed. `npm run docs:check` passed.
- `npm run size`: full core 6,338 B gzip (budget 6,656), play 4,435 B, bind 5,262 B. Core playback code is unchanged.
- `npm run bench` passed. VM scheduling measurements are not device latency evidence.
- Approved WAV regeneration executed into a separate directory. All four cues passed envelope/tail/level/duration checks; committed manifest/artifact hashes, source recipes and PCM format are tested. Regeneration changes noise samples and can change trim durations/levels; no byte identity claim.
- Chromium static smoke passed board, keyboard shortcuts, sliders, binding demo, disabled control, search/resources, recipe editing/preview/copy, semantic click/Space request count, preference reload and muted no-initialization. PR CI additionally runs Chromium, Firefox and Linux WebKit with a PulseAudio null sink and Xvfb. See the PR checks for final browser results.
- Local Linux WebKit static smoke passed both the board and recipe/preference tests after the hydration-ready wait. Local Firefox board smoke passed; its audio-running assertion failed without a native audio backend on this VM. This is retained as a local limitation rather than weakening the assertion. CI supplies the documented null sink. Linux WebKit is not physical Safari/iOS.

## Before/after measurements

`docs-bytes.json` compares equivalent production static exports against origin/main `dd15422`. Raw emitted CSS: 157,058 → 156,951 B. JS: 1,095,009 → 1,101,563 B (+6,554 B for shared preferences and semantic preview). Fonts: 13,081,684 → 12,965,628 B (-116,056 B; 23 → 22 emitted font files). These are sums of emitted files, not browser transfer counts. Existing multilingual font packaging remains unchanged; this task removes the duplicate display font only. Old token CSS (5,921 B) was removed; HIG distribution plus the host alias bridge replaces it. ESLint tooling is a development dependency; published SFX still has zero runtime dependencies.

Before/after desktop board and mobile recipe captures are included. SDK-specific canvas/synthesis logic stays in the existing components. The board now shares persisted master/mute choices with React preference controls, retaining old storage records. Recipe source export remains functional.

Rollback is an atomic revert of this owning PR (restore CSS imports, display font, board preferences and package lock). Exception to the kit's temporary shell flag: this static site uses a reviewed atomic migration/revert, without shipping two token systems or a runtime feature flag.

## Adoption matrix / issue boundaries

| HIG issue | SFX delivery | Remaining owning-repository/device work |
| --- | --- | --- |
| #21 | Browser/framework-free intent table matching HIG; cancellation/nesting/state-aware handler composition; SSR import and failure-safe core | HIG owns final contract/controller integration, independent host adapters/preferences and component adoption. SFX hooks do not replace source/id deduplication or per-source cadence. |
| #22 | React preferences/handler API, trusted first interaction unlock with mute/zero-volume listener suppression, cleanup; static interaction tests | HIG component/haptic physical target integration and physical iOS/Android/browser-settings observations; final application lifecycle disposal belongs to the shared engine owner. |
| #23 | Four approved cues, versioned manifest/provenance, package assets, reproducible offline command and bounded validation | RN/Expo backend, Metro fixture and actual iOS/Android latency, mute/silent-mode/audio-session/interruption/background/missing-assets observations belong to HIG/native hosts. |
| #24 | No Expo/RN/haptic dependencies added; sound-only consumers remain independent | Native haptic facade, capability matrix, native component adoption and physical iPhone/Android observations are outside SFX. |
| #25 | Versioned mapping/cadence, intentional silence, explicit quieter preset independent of motion, persisted master/category preferences and labeled visual/audible preview | HIG/native storage bridge, haptic preferences/previews, local controller isolation/source-id deduplication and physical tactile evidence remain HIG/host work. |
| #34 | SFX docs plain-CSS migration with source pin, demo/browser/build/measurement evidence | Other four SDK rows and the aggregate HIG adoption matrix must be updated by their owners; this checkout cannot certify them. |

No physical devices are attached to this Linux VM. No actual iPhone/iOS Safari, Android hardware, VoiceOver, perceived haptic feedback, OS audio modes/interruption or measured native playback latency was tested. API mocks, Linux WebKit and null-sink playback cannot substitute for those observations. No npm publish, tag, release or production deployment operation is performed by this task.
