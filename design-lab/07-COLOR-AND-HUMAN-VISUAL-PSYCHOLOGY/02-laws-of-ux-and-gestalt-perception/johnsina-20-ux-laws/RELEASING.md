# Releasing

Run this checklist before tagging. Each step is a manual check that doesn't need a script.

1. **Frontmatter:** `name` is `ux-laws` (the install folder name), the description is at most 400 characters, third person, with a "Use when" and a "Not for" clause, and **contains no hard-coded counts of laws or rows**. `metadata.version` matches the tag.
2. **Size:** `SKILL.md` is at most 220 lines. Every file in `references/` is linked from `SKILL.md`, and every file over 100 lines starts with a table of contents.
3. **Matrix parity:** the applicability matrix in `SKILL.md` and the scope lines in `references/principles-breakdown.md` say the same thing for every law.
4. **Provenance:** re-check any citation you touched. Anything unconfirmed stays marked `unverified citation`. Update the "Verified on" date.
5. **Pointers:** search for `SKILL.md §` and any link to a section or file that doesn't exist.
6. **Interop, both directions:** every ui-styles ID in the `SKILL.md` interop table exists in the ui-styles style index, and the laws listed per style equal the `ux-laws #N` citations in that index (including styles that have citations but no row, and rows that have no citation).
7. **Fixtures and snippet:** serve `evals/fixtures/`, run `references/hit-testing.md` on both pages as described in `evals/README.md`, and confirm the documented results. No click may fire.
8. **Evals:** run the four functional evals by hand with fresh sessions that don't read `examples/` or `evals/expected/`. Record the result in the release notes.
9. **Tag:** `git tag -a vX.Y.Z -m vX.Y.Z` after merging, then update the README's install commands and the changelog.
