# AGENTS.md — earcon

Instructions for humans and coding agents working in this repository.

## Baseline

- Package manager and test runner: bun only (never npm/yarn/pnpm for installs).
- Task runner: `just`, one `justfile` at the root.
- Config files use `.yaml`, never `.yml`.
- TDD (red → green → refactor); structural and behavioural changes in separate
  commits; Conventional Commits with the package as scope (`feat(core): …`).
- Never weaken a gate to make it pass; fix the cause.

## What this repo is

A bun workspace publishing three ESM packages (`@earcon/core`, `@earcon/engine-tone`,
`@earcon/react`) plus `apps/demo` (Vite). The design is fixed by a private spec
(not in the repo); deviations and interpretations are recorded in `docs/adr/`.

## Hard rules

- `packages/core/src` never references `Date`, `performance`, timers, `window`,
  `globalThis`. Time arrives as arguments (`Sample.t`, `tick(nowMs)`). Enforced by
  `.semgrep/rules/earcon-core-no-time.yaml` and `packages/core/src/purity.test.ts`.
- `@earcon/react` imports only `@earcon/core` (the `Engine` interface), never
  `@earcon/engine-tone` or `tone`.
- `tone` is never statically imported from `packages/engine-tone/src/index.ts`;
  it is loaded inside `unlock()`.
- Every millisecond handed to `core` is on the `performance.now()` axis. Never pass
  AudioContext seconds.
- Unit tests are colocated (`src/*.test.ts`, `bun:test`). Playwright tests live in
  `tests/e2e/`. No mocks in e2e.
- `mock.module` rewrites a module's exports for the whole test process and
  `mock.restore()` does not undo it (bun 1.4.x), so a mock left installed past the
  test that needed it makes the suite pass or fail by file order. Apply it inside
  that one test and restore the real exports (captured as function values, before
  the mock) in a `finally`. `test/suite-isolation.test.tsx` guards the ssr/hooks
  pair.

## Git

`main` is pull-request only (repository ruleset, no bypass). Branch, push, open a
PR, wait for `check` and `e2e`, squash-merge. Version bumps arrive as the bot's
"Version Packages" PR; approve its workflow run, then merge it.

## Release

Publishing goes through `.github/workflows/release.yaml` with npm Trusted
Publishing. The publish step runs `bunx npm publish` — the single sanctioned
exception to "bun only", because `bun publish` has no OIDC/provenance (ADR-0007).
Never run `bun publish`; never put an npm token in CI. Procedure: `docs/release.md`.

## Commands

`just check` is the gate (`tsc -b`, semgrep, `bun test`, core coverage ≥ 90%).
`just test-e2e` needs `bunx playwright install chromium` once.

## Docs

`docs/intent.md` (why), `docs/handover.md` (where we are), `docs/adr/` (why we
deviated), `docs/spec-coverage.md` (spec test id → test name).
