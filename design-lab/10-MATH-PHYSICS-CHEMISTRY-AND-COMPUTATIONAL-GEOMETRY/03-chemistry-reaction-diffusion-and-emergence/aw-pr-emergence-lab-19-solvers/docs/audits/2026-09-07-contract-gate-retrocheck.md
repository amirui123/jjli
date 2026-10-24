# Contract-test gate retrocheck — 2026-09-07

## Finding

The historical gate result did not establish that a contract was checked. Of
the 29 verifier artefacts that explicitly invoked
`scripts/check-contract-test-gate.sh` through stage 81, only **2** correspond to
a card with both a real frozen block and a declared digest. **15** correspond
to cards for which no freeze exists, and **12** name a currently marked test
but do not declare a `sha256:` digest. Those three populations sum to 29.

This is a retrospective classification of the card and its named test, not a
claim that the historical stage's changed files have been replayed. The 29 are
verifier artefacts, not 29 consecutive stage cards: they are stages 13, 14,
18–22, 31, 32, 42, 45, 50, 58, 60, 63, 65–67, 70, and 72–81. The per-card table
required by this audit covers every current card from 67 through 86 exactly
once, so its 20 rows are a different population.

## Cards 67–86

`verified` means that the named file has a frozen block and the card declares
the matching digest. `digest undeclared` means the file is marked but the card
does not contain a `sha256:` token. `no freeze exists` covers `Test file: none`
and the one card with no Contract test section. No block is drifted.

| stage | test file named by card | freeze marker in file? | card declares digest? | verdict |
|---:|---|:---:|:---:|---|
| 67 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 68 | none | no | no | no freeze exists |
| 69 | none | no | no | no freeze exists |
| 70 | `e2e/sweep.spec.ts` | yes | yes | verified |
| 71 | none | no | no | no freeze exists |
| 72 | `src/sims/brians-brain/kernel.test.cjs` | yes | yes | verified |
| 73 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 74 | not declared; Contract test section absent | no | no | no freeze exists |
| 75 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 76 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 77 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 78 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 79 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 80 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 81 | `e2e/sweep.spec.ts` | yes | no | digest undeclared |
| 82 | `e2e/sweep.spec.ts` | yes | yes | verified |
| 83 | none | no | no | no freeze exists |
| 84 | none | no | no | no freeze exists |
| 85 | `e2e/sweep.spec.ts` | yes | yes | verified |
| 86 | none | no | no | no freeze exists |

Current 67–86 totals are 4 verified, 7 with no freeze, and 9 with an
undeclared digest: 20 cards.

## Recomputed frozen-block digests

Each value below came from
`scripts/check-contract-test-gate.sh print <file>`. The comparison is literal
SHA-256 equality:

| marked file | declaring card | recomputed | declared | arithmetic | verdict |
|---|---|---|---|---|---|
| `e2e/sweep.spec.ts` | stage 70 | `sha256:d423a74581557368b535a0be297459def702f2f9357ee38f77e191e8e164d676` | `sha256:d423a74581557368b535a0be297459def702f2f9357ee38f77e191e8e164d676` | `d423…d676 = d423…d676` | verified |
| `src/sims/brians-brain/kernel.test.cjs` | stage 72 | `sha256:6d8ae044bcf508d8fde20c4f1eaf6d8a23dbf885e8a214c9048e767b7d54769d` | `sha256:6d8ae044bcf508d8fde20c4f1eaf6d8a23dbf885e8a214c9048e767b7d54769d` | `6d8a…469d = 6d8a…469d` | verified |
| `src/sims/logistic-mandelbrot/gpu-parity.test.cjs` | stage 36 | `sha256:111b37b263b2afb8137c4628eae41ec55f035d2a2c8955f939ad82816d7be30e` | `sha256:111b37b263b2afb8137c4628eae41ec55f035d2a2c8955f939ad82816d7be30e` | `111b…e30e = 111b…e30e` | verified |

No frozen assertion block has changed without its declaring card being
updated.

## What the fixed gate would do

The current gate has three outcomes in `--worktree` mode:

- Exit 0 means at least one relevant changed file was inspected and every
  frozen block matched its declaring card.
- Exit 2 with `no relevant changed files to inspect in the working tree` means
  the change set contains no named contract test or `scripts/*-smoke.sh`. This
  is the expected, truthful result for a document-only card such as stage 86.
- Exit 1 with diagnostics means a named test is unmarked, a marker/card/digest
  relationship is invalid, or a recomputed digest differs.

The gate operates on the changed-file set. It does not validate every Contract
test section merely because a card exists, and a later card's prose reference
to stage 70's freeze is not a second digest relationship: the marker in
`e2e/sweep.spec.ts` points to stage 70, whose digest is authoritative.

None of the 29 historical stages can be identified from this table alone as a
definite failure under the fixed gate. Determining which would fail requires
replaying each historical change set and its contemporaneous files, which this
audit explicitly does not do. A document-only or otherwise irrelevant change
would now produce the explicit exit-2 result; a changed, card-named unmarked
test would fail; and a changed marked test would be checked against the card
named on its marker.

## Recommendation

Cards should declare a contract test only when the stage is responsible for a
specific frozen assertion block. In that case, the test must contain exactly
one marker pair pointing to the authoritative card, and that card must record
the exact digest printed by the gate. A later card relying on the same freeze
should name the authoritative freeze and digest explicitly for human audit,
without implying that an unrelated change set will cause the gate to inspect
it.

When a stage touches no frozen test, write `Test file: none` and state that the
expected `--worktree` result is exit 2 with
`no relevant changed files to inspect in the working tree`. Do not call that a
pass: it is an explicit not-applicable result. Reserve “the guard passes” for
exit 0 with relevant files actually inspected.

## Appendix: commands

The three digests were recomputed with:

```sh
scripts/check-contract-test-gate.sh print e2e/sweep.spec.ts
scripts/check-contract-test-gate.sh print src/sims/brians-brain/kernel.test.cjs
scripts/check-contract-test-gate.sh print src/sims/logistic-mandelbrot/gpu-parity.test.cjs
```

This stage's own gate invocation is:

```sh
scripts/check-contract-test-gate.sh --worktree
```

That mode is required because dispatch work is unstaged. The final run
returned exit 2 with this verbatim message:

```text
contract-gate: no relevant changed files to inspect in the working tree
```

This is the second of the fixed gate's three outcomes. It is correct for stage
86 because the sole change is a document that no card names as a contract
test; no frozen file was available for the gate to inspect.
