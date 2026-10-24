# Agent Guide: @dalin/tactile

The canonical rules for any agent (Claude Code, Cursor Composer, GPT-based, Copilot)
working in this repo. Read this first. The deeper docs live in [`docs/`](./docs/):
start with [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and
[`docs/code-audit.md`](./docs/code-audit.md).

## Brain dump (what this is)

`@dalin/tactile` is a **zero-dependency, SSR-safe browser library**. `createTactile()`
fires three coordinated channels from one semantic call: **haptics** (`navigator.vibrate`
+ iOS `<input switch>` Taptic), **sound** (Web Audio synth/sample packs), and **motion**
(canvas emoji particles + a WAAPI "boop"). ~15 source files, `tsc`-only build, ESM +
types, `dist/` committed for GitHub install. The API is **Capacitor / `UIFeedbackGenerator`-shaped**
so a native backend can slot in later without changing call sites.

It is **not** a web app. There is no server, no database, no auth, no framework. If
your instinct reaches for Next.js / React / a backend pattern, stop. This is a tiny
browser library.

## Critical warnings (read before touching `src/`)

### 1. The web has no real haptics API, and the library is honest about it
Android: `navigator.vibrate` (binary on/off, no amplitude). iOS: **no** Vibration API,
only the `<input switch>` Taptic hack, which **Apple patched in iOS 26.5**. Desktop: no
motor at all. Don't "fix" the fragility: it's the platform. Keep `diagnose()` honest.
See [`docs/error-log.md`](./docs/error-log.md) ERR-003.

### 2. SSR-safety is a hard invariant
`createTactile()` must return a working (silent) object with no DOM, and every
browser-global access must be `typeof`-guarded (`window`, `document`, `navigator`,
`matchMedia`, `AudioContext`). Consumers construct it at module scope in Next.js /
SvelteKit. **Never** add an unguarded global access.

### 3. Audio unlock is gesture-sensitive (two real, fixed bugs live here)
The `AudioContext` must be created/resumed **synchronously inside a user gesture** and
**re-resumed on every gesture** (iOS re-suspends). These were ERR-001 and ERR-002, and
the comments in `src/index.ts` mark the exact lines. Don't move audio-context work
behind an `await`, and don't "optimize" the per-gesture resume down to once.

### 4. `dist/` is committed and must stay in sync with `src/`
Installs are `github:gomezsj12/dalin-tactile`; there's **no `prepare` script** (so all
package managers install without building), so `dist/` is the shipped artifact.
**After any `src/` change: `npm run build` and commit `dist/`.** CI fails on a stale
`dist/`. See [`docs/STACK_DECISIONS.md`](./docs/STACK_DECISIONS.md).

### 5. Zero runtime dependencies, keep it that way
No runtime `dependencies` in `package.json`, ever. Heavier effects (confetti,
tsParticles) are supported as opt-in `MotionDriver`s the consumer supplies, not as deps.
The bundle-size budget (`npm run size`) enforces "tiny".

## Rules for all agents

### Before writing code
- Read this file, [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), and
  [`docs/code-audit.md`](./docs/code-audit.md) (the issue may already be catalogued).
- Check `src/types.ts`. It is the entire public type surface. A change there is a
  public API change.

### While writing code
- **SSR-guard every browser global.** No bare `window`/`document`/`navigator`.
- **Keep the three entry points clean:** core (`index.ts`) dynamically `import()`s the
  sound/motion chunks; don't statically import `sound/*` or `motion/*` into the core, or
  you defeat the lazy-loading and bloat the haptics-only path.
- **Types and behavior must agree.** If you change what `config.backend` or an event
  override does, update `src/types.ts` and the README in the same change.
- **No new runtime dependency.**
- After any change: `npm run build && npm test && npm run lint && npm run size`,
  then rebuild `dist/`, commit it here, run `npm run sync:site`, and commit the
  result in `tactile-site`.

### After writing code
- Update [`docs/change-log.md`](./docs/change-log.md); if you fixed/found a bug, add an
  [`docs/error-log.md`](./docs/error-log.md) entry; update finding status in
  [`docs/code-audit.md`](./docs/code-audit.md) if you closed one.
- Update this file or [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) if you added a
  convention, path, or public-API change.

### Git push hygiene
- This repository's default branch is **`main`** (verify with `git branch -vv` and
  `git ls-remote --heads origin` before pushing). Don't push to a stale branch name
  copied from a sibling repo (several siblings use `master`).
- **Commit or push only when the user asks.** If on `main` and asked to commit, branch first.
- **Multi-line commit messages: match the heredoc to the shell tool.** This is a Windows
  box with both a Bash tool and a PowerShell tool. PowerShell here-strings (`@'…'@`) are
  not understood by Bash; a Bash heredoc (`git commit -F - <<'EOF' … EOF`) is not understood
  by PowerShell. Use the right one per tool, or sidestep both by writing the message to a
  file and `git commit -F <file>`. (Bash also chokes on `C:\…` backslash paths, so use `/`.)
- A `src/` change is incomplete until `dist/` is rebuilt and staged in the same commit.

## Quality gates and dev tooling

See [`docs/TOOLING.md`](./docs/TOOLING.md). Short version: `build` (tsc), `test` (vitest),
`lint` (eslint, `src/` only), `size` (gzipped budget), `format:check` (Prettier, advisory,
the source is hand-formatted). The **fallow** MCP is recommended (paste-in `.mcp.json` snippet
in TOOLING.md). CI mirrors the gates + a `dist/` drift guard.

## For Cursor Composer / GPT-based agents

- **This is not a Next.js / React / Node-backend project.** Ignore training-data
  instincts to add a framework, a server, a bundler, or a state manager. It's a
  `tsc`-built browser library with zero deps.
- **Don't statically import the sound/motion chunks into `src/index.ts`.** The core
  uses dynamic `import()` on purpose (lazy channels). A "helpful" top-level import
  silently bloats every consumer.
- **Every browser global needs a `typeof` guard.** The library is SSR-safe and runs
  at module scope in server frameworks. A bare `window.` will crash a Next.js build.
- **Don't reformat the whole file** when making a small edit. The source is
  hand-formatted and not Prettier-clean; a bulk reformat buries a one-line change in
  noise. (Prettier adoption is a separate, owner-approved commit.)
- **`dist/` is generated.** Never hand-edit `dist/`; change `src/` and run `npm run build`.
- Read [`docs/code-audit.md`](./docs/code-audit.md) before starting. The thing you're
  about to "fix" may be a documented, intentional design choice (e.g. PWM patterns,
  the iOS single-tick, `master.gain` headroom).

## For GitHub Copilot / autocomplete

- This library has **no dependencies**, so completions importing `howler`, `canvas-confetti`,
  `framer-motion`, etc. are wrong here. Effects libs are consumer-supplied `MotionDriver`s.
- Suggestions that touch `window`/`document`/`navigator` without a guard will break SSR.
  The human accepting one is responsible for adding the `typeof` guard.
- The human accepting a completion owns updating `docs/` and rebuilding `dist/`.

## For any agent performing a code review

1. **Read first:** this file → [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) →
   [`docs/code-audit.md`](./docs/code-audit.md) → [`docs/CODE_REVIEW.md`](./docs/CODE_REVIEW.md).
2. **Don't change library logic during a review** unless asked. The output is findings
   in `code-audit.md` + a session log in `docs/reviews/`, not a refactor.
3. **If you do change code:** one change at a time, `npm run build` + `npm test` after
   each, rebuild `dist/`, documented in the session log.
4. **Severity levels:** Critical (security / data corruption / crash) · High (broken
   feature, logic bug, real perf issue) · Medium (quality, maintainability, minor perf) ·
   Low (style, polish).

## Key files

| File | Why |
|------|-----|
| `src/index.ts` | The instance state machine: channel enable, audio unlock, `fire()`, `set()`, `diagnose()`, `test()`. Most behavior lives here. |
| `src/types.ts` | The entire public type surface. Edit = public API change. |
| `src/presets.ts` | `DEFAULT_EVENTS` + `resolveEvents()`, the semantic vocabulary and override merge. |
| `src/pattern.ts` | `stepsToPattern()`, PWM/`vibrate` flattening. The one unit-tested module (`pattern.test.ts`). |
| `src/backends/web.ts` | Android `vibrate` + iOS tick routing; `probe()` for diagnostics. |
| `src/ios-switch.ts` | The iOS `<input switch>` Taptic hack + the iOS 26.5 caveat. |
| `src/sound/synth.ts` | Built-in zero-asset Web Audio cues: the 20-cue table, the voice engine (partials, filter sweeps, noise, drift), and the soft-clip output stage. Retuning a cue means editing the table, nothing else. |
| `src/motion/particles.ts` | Canvas emoji-particle engine, the perf hotspot. |
| `src/motion/dom-driver.ts` | The built-in `MotionDriver` (boop + particles). |
| `package.json` | Exports map, scripts, the zero-`dependencies` rule. |
| `docs/` | Architecture, review process, findings, errors, stack decisions, deferred work. |
