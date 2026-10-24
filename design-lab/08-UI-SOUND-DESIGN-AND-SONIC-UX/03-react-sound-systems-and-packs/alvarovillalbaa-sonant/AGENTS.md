# Sonant contributor instructions

Last updated: 2026-10-15

Read `README.md`, `docs/specs/product.md`, and the closest source before editing. Preserve unrelated work.

- `packages/sonant/src/` owns the public runtime, taxonomy, recipes, React hooks, and CLI.
- `website/src/` consumes the package. Do not fork its audio engine or configuration generator.
- Keep core imports SSR-safe and free of runtime dependencies. React stays an optional peer.
- Never play audio on mount. Preserve explicit mute, volume, and visible outcome feedback.
- Cancel pending playback on teardown. Every loop needs bounded lifetime and deterministic cleanup.
- Do not copy third-party audio or invent endorsements, adoption counts, or compatibility evidence.
- `audit` findings are advisory. Never claim they prove accessibility or control flow.
- Tests live under `tests/unit`, `tests/integration`, and `tests/e2e`; fixture data is synthetic T2.
- Verify relevant changes with `npm run check`, `npm test`, `npm run build:site`, and browser checks when authorized. Always use `git diff --check`.
- Read `docs/runbooks/release.md` before publishing. Never expose registry credentials or add them to source.
- Durable sources, specs, references, results, and runbooks live under `docs/` following AFS naming. Keep evidence distinct from claims about live releases.
