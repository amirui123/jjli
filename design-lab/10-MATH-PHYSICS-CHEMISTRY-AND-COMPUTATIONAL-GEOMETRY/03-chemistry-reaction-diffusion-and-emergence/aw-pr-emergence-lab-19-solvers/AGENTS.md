# AGENTS.md — emergence-lab

## Phase: hone

emergence-lab is in the **hone phase** — refinement, parameter tuning,
performance, and UX polish on a working set of 18 simulations. See `MODELS.md`.

## Working model

There is **no per-model ownership** of areas of this repo. Whichever agent
picks up a task may edit any part of it — code (`src/**`), docs, architecture.
Multi-agent work is run through **autometta** (stage cards under `docs/stages/`,
see `docs/dispatch-contract.md`) when you want parallel workers and
cross-checking; otherwise just do the work directly.

The dispatch-contract templates and the contract-test gate
(`scripts/check-contract-test-gate.sh`) are **vendored** from Autometta;
provenance is recorded in `.autometta-vendor`. Check currency against the
canonical checkout with
`AUTOMETTA_ROOT=~/repos/autometta scripts/autometta-vendor-check.sh`, and
refresh by re-running the autometta-setup vendor step.

## Worktrees and branches

**Take new worktrees from `dev`.** `dev` is the live branch in practice; `main`
advances from it and `publish` is the mirror boundary. A worktree branched from
anywhere else inherits a history the rest of the fleet is not working against.

Two long-lived branches are not `dev` and should not be treated as a base:

- `feat/logistic-mandelbrot-hybrid-surface` (worktree `../emergence-lab-surface`)
  is **an experiment whose fate is undecided.** It rewrites `orbit3d.ts`
  internals and adds `src/app/orbitSurface.ts`; operator visual review rejected
  its output on 2026-07-20 (sawtooth silhouette, no sheet-to-cloud dissolve) and
  it has been parked since. Do not branch from it, import from it, reconcile
  against it, or treat its approach as precedent. Do not delete it or propose
  deleting it either — the decision is the operator's and has not been made.
  Follow-up notes live at
  `docs/plans/2026-07-20-logistic-mandelbrot-edge-transition-next-steps.md`.
- `feat/logistic-mandelbrot-gpu-sampler` (worktree `../emergence-lab-gpu`) is the
  active autometta run for stages 34-36, moving orbit sampling to a WebGL2
  fragment shader. Branched from `dev`.

Both touch the same `orbit3d.ts` internals, and a rebase between them has
already failed once with eight structural conflicts. They are deliberately
allowed to diverge.

## Interface contract

The kernel-to-renderer contract in `docs/INTERFACE.md` is a reviewed boundary,
not owned by any one model. Code that consumes or implements it must stay in
step with the committed version and must not change its shape casually. A change
to its *shape* is versioned: bump the version, record it, and commit it before
dependent code work begins.

## Adding a simulation

1. Confirm `docs/INTERFACE.md` covers the new sim's needs.
2. Implement the kernel under `src/sims/<name>/` and wire the gallery.
3. Write the essay in `essays/<name>.md`.

## Commit discipline

Atomic commits, one logical change each. Author identity tracks the model
that wrote the change; committer is always the human user. The verify gate
`npm run verify` must be green before any commit lands on `main`. See
`.cursor/rules/git-strategy.mdc`.

## Secrets

Never put secrets, tokens, or API keys in code or committed files. Use
`.env.local` (already git-ignored). Remind the user if a prompt asks for
credentials inline.

## Publishing

This repo uses armed publish-guard git hooks and the private → public mirror
model. See `docs/PUBLISH-WORKFLOW.md`. Do not push to a public remote from an
agent session unless explicitly asked.

## Related

- `docs/INTERFACE.md` — kernel contract (reviewed boundary, v1.0.1)
- `MODELS.md` — model policy (no area ownership; autometta for multi-agent)
- `HANDOFF.md` — current status and next-run brief
- `docs/PUBLISH-WORKFLOW.md` — publish-safety workflow and guard hooks
