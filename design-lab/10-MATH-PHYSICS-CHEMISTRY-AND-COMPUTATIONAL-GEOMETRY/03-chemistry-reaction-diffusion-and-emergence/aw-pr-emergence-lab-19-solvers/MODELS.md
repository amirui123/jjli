# MODELS.md — Model policy

## The rule

**There is no per-model ownership of areas of this repo.** Whichever agent is
working a task may edit any part of it — code, docs, architecture. Earlier
phases split the trunk by model (Codex on `src/**`, Claude on docs); that split
is retired.

Multi-agent work happens through **autometta** when you want it: stage cards
under `docs/stages/` drive a worker / verifier loop with cross-family
verification (see `docs/dispatch-contract.md`). Single-agent sessions just do
the work directly, editing whatever the task needs.

## The interface contract

The kernel-to-renderer contract in `docs/INTERFACE.md` is still a deliberate,
reviewed boundary. It is not owned by any one model, but a change to its *shape*
is a versioned decision: bump the version, record it, and commit the contract
update before any dependent code work begins. Keep code that implements or
consumes it in step with the committed version.

Gating the contract this way preserves architectural review of the kernel seam
without tying it to a particular model.

## Commit attribution

The committer is always the human user; the commit *author* identifies the
model that wrote the change (e.g. `Claude Opus 4.8 <claude-opus-4-8@local>`,
`Codex GPT-5.3 <codex-gpt-5-3@local>`). This attribution convention is
unchanged. See the global dev rules and `.cursor/rules/git-strategy.mdc`.

## History (context only)

- **Build phase**: three-model split — Codex kernels, Cursor renderer, Claude
  docs. Useful while the kernel/renderer seam was being shaped.
- **Consolidation phase**: dropped to two — Cursor full stack, Claude docs.
- **Hone phase (earlier)**: single-lead Codex over the code trunk, Claude over
  directives and essays.
- **Now**: no area ownership. Any agent edits any part of the repo; autometta is
  the mechanism for multi-agent runs when parallel work and cross-checking are
  wanted.
