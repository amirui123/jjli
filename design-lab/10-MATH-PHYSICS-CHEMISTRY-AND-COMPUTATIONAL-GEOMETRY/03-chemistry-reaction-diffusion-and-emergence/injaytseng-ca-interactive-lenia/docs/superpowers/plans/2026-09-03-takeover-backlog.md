# Takeover backlog — execution plan

- **Date:** 2026-09-03
- **Status:** executed 2026-09-03, one commit per tier (see `git log`); every box below shipped
- **Source:** five-lens review panel (product, visual, code, a11y/perf, architecture), every finding
  spot-checked against the code before it was accepted. Items the panel raised but this plan
  declines are listed at the end with the reason, so they are not re-litigated.
- **Ground rules:** zero build step, zero runtime dependencies, plain ES modules, direct-to-main
  commits, one commit per tier, `npm test` and `node tools/browser-check.mjs` green before each.

## Tier 0 — delivery pipeline

- [x] `tools/browser-check.mjs`: CDP smoke test. Mounts all six sims, fails on any console error /
      exception / 404, screenshots on request. This is the safety net for everything below.
- [x] CI: `deploy` job after `test`, main pushes only, serialised, skipped with a warning until
      `CLOUDFLARE_API_TOKEN` exists. Post-deploy check that the live `main.js` equals `dist/`.
- [x] Pin wrangler in `package.json`.

## Tier 1 — spec amendments (before any implementation touches them)

- [x] Pointer contract: sims take canvas-local CSS px; the runtime translates window coordinates
      through `getBoundingClientRect()` and emits `leave` outside the box.
- [x] `options` attribute in the public API (`options="rule=90,mood=attract"`).
- [x] Failure policy covers `webglcontextlost` (remount on restore) and a throwing `frame()`.
- [x] `/element.js` gets `max-age=0, must-revalidate` like `/src/*`.
- [x] IntersectionObserver: element only; on the site it is a no-op (`body { overflow: hidden }`).
- [x] "Canvas sizing" → "resize forwarding": sims own their backing store.
- [x] Runtime state must be per-instance with a full `destroy()`; note why (`main.js` singletons).

## Tier 2 — site fixes that do not touch the loop

- [x] Space/Enter on a focused control activates the control, not the pause shortcut.
- [x] GitHub link in the header; `title` = tag on tabs.
- [x] `#card-brief` shows the error paragraph and the option chips.
- [x] i18n: `speed`, `dark`/`light`, document title, tablist label, `#lang` aria-label; `lang="en"`
      on the always-English spans; first-visit language from `navigator.language`.
- [x] `role="alert"` on the error paragraph; error text set via `textContent`, first line only.
- [x] `Object.hasOwn` for the stored theme.
- [x] CSS: scrim under brand + key hints; reduced-motion covers every transition; `color-mix`
      82% → 100%; drop the dead `[data-theme="light"]` block; `accentText` token; `--fs-xs` → 11px;
      `--fs-xl/2xl` + `--gutter` tokens; `.ui-hint` opacity 1; mobile touch targets.
- [x] Self-host Fraunces + IBM Plex Mono (latin woff2) under `fonts/`, `immutable` cache, preload
      the two roman faces. Build copies `fonts/`.
- [x] `tools/og.py`: 6px cells, brighter depth floor, wordmark; regenerate `og.png`.

## Tier 3 — sim robustness

- [x] `src/canvas.js` `fitCanvas(canvas, { maxDpr })`: clamps to ≥1 px, returns `{ w, h, dpr }`.
      Node tests with a fake canvas. All six sims use it; GL sims pass `maxDpr: 1`.
- [x] Every sim's `resize()` and grid maths survive a 0×0 host.
- [x] `acc` clamped after the step loop in all six sims.
- [x] `main.js` wraps `ctrl.resize()` in the same catch as `frame()`.

## Tier 4 — runtime extraction (mechanical)

- [x] `src/runtime.js` `createRuntime(host, opts)`: loop, resize forwarding, pause policy, pointer,
      reduced-motion settle, mount race guard. Per-instance state, listeners collected into
      `destroy()`, `raf` cancelled while paused.
- [x] `main.js` consumes it; every current behaviour kept. Browser matrix: 6 sims × 2 themes ×
      2 languages, reduced-motion, mobile viewport.

## Tier 5 — runtime behaviour changes

- [x] Context loss: error-pause + message; remount on `webglcontextrestored` or when the visitor
      presses play.
- [x] Idle-time prefetch of the NCA weights after first mount.
- [x] IntersectionObserver pause (element).

## Tier 6 — the element

- [x] `src/element.js` + root `element.js`, shadow root, attributes live, `options`, `fallback`,
      never throws into the host.
- [x] `embed.html` demo/docs page; `_headers` CORS; build copies both.
- [x] Concept card gains an Embed row with the current chips baked into the snippet.
- [x] README: Embedding section, pointer contract, `lostContext`, Layout tree, test count, CI +
      rollback under Deploy. `CHANGELOG.md` for element-facing changes.
- [x] Cross-origin check: `embed.html` served from a second port loads modules from the first.

## Tier 7 — hygiene

- [x] Keyboard range and key-hint string derived from `SIMS.length`.
- [x] README drift fixed; plan/spec status updated.

## Declined, with reasons

- **Dynamic `import()` per sim.** HTTP/2 + modulepreload already parallelise 15 tiny modules;
  the trade is a click-time stall. Only the idle prefetch of the weights is taken.
- **Hand-versioned `weights.<n>.json` + `immutable`.** A manual step to save one revalidation a
  day on an 85 KB file.
- **Tab third column engine → tag.** The engine label is the specimen-tag aesthetic. Tag goes in
  `title` instead.
- **`* { transition: 0s !important }` for reduced motion.** Too blunt; the specific selectors are
  covered instead.
- **Panel alpha ≥ 0.9.** Changes the look everywhere; the `accentText` token fixes the contrast
  failure on its own.
- **Flow Lenia spike.** Separate research task with a subjective answer; sequenced after this plan.
