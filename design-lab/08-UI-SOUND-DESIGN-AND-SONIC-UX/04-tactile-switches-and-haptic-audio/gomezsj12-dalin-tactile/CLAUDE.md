@AGENTS.md

# Claude Code: Quick Reference

You are working in **@dalin/tactile**, a zero-dependency, SSR-safe **browser library**
that fires coordinated **haptics + sound + motion** from one semantic call. It is
`tsc`-built, ships ESM + types, and commits `dist/` for GitHub install. Sibling to the
dalin apps (`../notes-app`, `../tactile-site`) but **not** a web app. No server, DB, or
framework.

## Read order

1. `AGENTS.md` (root): the full agent guide (critical warnings, rules, per-model guidance)
2. `docs/ARCHITECTURE.md`: the three channels, the backend swap seam, the instance lifecycle
3. `src/types.ts`: the entire public type surface
4. `src/index.ts`: the `createTactile()` state machine (where most behavior lives)
5. `docs/code-audit.md`: open findings before you touch anything

## Most important rules

- **Not a web app.** Zero runtime dependencies, never add one. Effects libs are
  consumer-supplied `MotionDriver`s, not deps.
- **SSR-safe always.** `typeof`-guard every `window`/`document`/`navigator`/`AudioContext`.
- **Audio unlock is gesture-sensitive.** Create/resume the `AudioContext` synchronously in
  a gesture, and re-resume on every gesture (ERR-001/002). Don't move it behind an `await`.
- **`dist/` is committed.** After any `src/` change run `npm run build` and commit `dist/`
  (no `prepare` script; CI fails on a stale `dist/`).
- **Don't statically import `sound/*` or `motion/*` into `index.ts`.** The core lazy-loads
  them via dynamic `import()`.
- **During a review, don't change library logic.** Output findings to `docs/code-audit.md`
  + a session log in `docs/reviews/`.

## Build and run

```bash
npm install
npm run build         # tsc → dist/ (run after every src/ change, then commit dist/)
npm test              # vitest (unit)
npm run lint          # eslint src/
npm run size          # gzipped bundle-size budget
npm run demo          # build + serve demo/ at http://localhost:8137
```

Verification bundle: `npm run build && npm test && npm run lint && npm run size`.
