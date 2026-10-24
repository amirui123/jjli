# CLAUDE.md — emergence-lab

## Phase: hone

emergence-lab is in the **hone phase** — refinement, parameter tuning,
performance, and UX polish on a working set of 20 simulations. See `MODELS.md`.

There is **no per-model ownership** of areas of this repo. Whichever agent is
working a task may edit any part of it — code (`src/**`), docs, architecture.
Multi-agent work runs through **autometta** when you want parallel workers and
cross-checking (stage cards under `docs/stages/`, see
`docs/dispatch-contract.md`); otherwise just do the work directly.

## Current direction

The logistic-Mandelbrot bifurcation reveal is landed and validated, including
free camera navigation and the machine-local prebaked point cloud (see
"Baking a local point cloud" in `README.md`). The analytic surface arc
(stages 52-56) is landed, deployed and mirrored publicly as of 2026-08-23.
The interestingness sweep harness landed via stage 83, which corrected its
structure-term bias; stage 57's original framing is closed, not queued.

The 87-92 logistic-Mandelbrot slate is closed: zoom diagnostic (87), camera
repair (88), period-detection window (89), detail adjudication (91) and the
point-size cap (92) all passed and merged; stage 90 was superseded on card
87's audit. Stage 93 moved parameter grouping into the kernel schema. Stage
94, the CPU-fallback refinement default, landed at `e09473fb` after three
attempts (10/10 criteria). Stage 95, which decided how a pure `src/app`
module becomes testable, landed at `cdc1d2fe` — see `docs/INTERFACE.md` for
the resulting convention (explicit `tsconfig.test.json` include list plus a
preflight guard in `scripts/run-kernel-tests.cjs`); a future card adding a
pure `src/app` module should consult it before improvising.

Stages 96-98 settled the cycling palette (cyclic Magma default) and the
hue-preserving tone map. On 2026-10-02 the operator redefined Inside-out:
each point is coloured by its distance from its column's mean height,
`fract(bands * |Re(z) - h0(c)| - phase)`, mirrored above and below, so bands
leave each bulb's sheet upward and downward and the chaotic band is coloured.
Stage 99 (`docs/audits/2026-10-02-orbit-spread-colouring.md`) fixed the
numbers and stage 100 landed the mode at `f81eee106`; prebaked clouds derive
their centres at load (`src/app/prebakedCentre.ts`). The shipped Magma at
gamma 1.65 / contrast 2.4 is flat across about 58% of a lap, so the period-1
sheet reads pale; that is a tuning question for the interestingness run
(stages 101-102, `docs/sweeps/logistic-mandelbrot-cycle-interestingness.md`),
which hands the operator a shortlist and changes no default. Stages 103
(packed cells for the orbit cloud) and 104 (a hierarchical Inside-out centre,
gated on 103) were queued on 2026-10-06.

Gray-Scott stays the priority kernel for future refinement.

## Worktrees and branches

**Take new worktrees from `dev`.** `dev` is the live branch in practice; `main`
advances from it and `publish` is the mirror boundary. A worktree branched from
anywhere else inherits a history the rest of the fleet is not working against.

As of 2026-08-23 there are no long-lived feature branches and no worktrees
beyond the primary one. Every parallel line is closed:

- `feat/logistic-mandelbrot-hybrid-surface` — the parked surface experiment.
  Rejected on visual review 2026-07-20 (sawtooth silhouette, no sheet-to-cloud
  dissolve); stages 40-41 reopened it 2026-08-19 against those two defects and
  it stalled again. Superseded by the analytic edge-curve arc below, and retired
  2026-08-23 at operator decision. Its reusable parts already reached `dev`
  independently — both stage cards, `docs/plans/2026-08-19-edge-analysis-findings.md`,
  and `src/app/orbitSurface.ts` (ported at `94024ef`). The branch implementation
  is preserved at tag `archive/logistic-mandelbrot-hybrid-surface`; nothing else
  should be recovered from it without a fresh decision, since the approach was
  rejected twice.
- `feat/logistic-mandelbrot-surface-v2` — the analytic edge-curve arc, stages
  52-56 (`docs/plans/2026-08-22-analytic-edge-curves.md`). Merged to `dev`,
  deployed and mirrored 2026-08-23; branch and worktree deleted.
- `feat/logistic-mandelbrot-gpu-sampler` — stages 34-36, WebGL2 fragment-shader
  orbit sampling. Merged to `dev` at `636315c` on 2026-08-16; branch and worktree
  `../emergence-lab-gpu` deleted. Background survives in
  `docs/plans/2026-08-15-logistic-mandelbrot-gpu-sampler-next-steps.md`.

Retire a branch this way: land or discard the work, confirm anything worth
keeping is on `dev`, tag the tip as `archive/<name>` if the implementation has
diagnostic value, then remove the worktree and delete the branch on both
local and `origin`.

## Interface contract

The `SimKernel` interface in `docs/INTERFACE.md` is a reviewed boundary, not
owned by any one model. A change to its *shape* is a versioned decision: write
it up, bump the version, and commit the contract update before any dependent
code work begins.

## Commit discipline

Atomic commits, one logical change each. Author identity tracks the model
that wrote the change (`Claude Opus 4.7 <claude-opus-4-7@local>`,
`Codex GPT-5 <codex-gpt-5@local>`, etc.); committer stays the human user.
Verify gate `npm run verify` green before any commit lands on `main`. See
`.cursor/rules/git-strategy.mdc`.

## Secrets

Never put secrets, tokens, or API keys in code or committed files. Use
`.env.local` (already git-ignored).

## Publishing

This repo uses the private-work → public-mirror model with armed git guard
hooks. See `docs/PUBLISH-WORKFLOW.md` before pushing anywhere.

## Related

- `docs/INTERFACE.md` — kernel contract (reviewed boundary, v1.0.1)
- `MODELS.md` — model policy (no area ownership; autometta for multi-agent)
- `state/handoffs/README.md` — structured handoff envelope
- `docs/PUBLISH-WORKFLOW.md` — publish-safety workflow and guard hooks
