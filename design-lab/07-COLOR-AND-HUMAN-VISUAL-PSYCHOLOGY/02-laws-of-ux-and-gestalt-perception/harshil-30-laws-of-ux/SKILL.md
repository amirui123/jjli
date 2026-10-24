---
name: laws-of-ux
description: Apply the Laws of UX reference (30 laws, Yablonski's book notes, the principle-law-rule method and an ethics checklist) to design, build or audit a UI. Runs only when the user asks for it by name.
argument-hint: "[build | audit <screens> | rubric | explain <law> | ethics <feature>]"
disable-model-invocation: true
---

# Laws of UX

The user has asked for this skill. Use it for this request only. Do not carry it into later work in the session unless asked again.

All paths below are relative to this skill's folder.

## What is here

| File | Read it when |
|---|---|
| `reference/laws.md` | Always. 30 laws: rule, what it means when building, violation signs, how to check, sources, plus conflicts between laws and the Octalysis overlap. |
| `method/principle-law-rule.md` | Writing or proposing a rubric, or when a project has none. |
| `method/ethics-checklist.md` | The work touches engagement, gamification, retention, defaults, notifications or anything meant to change behaviour. |
| `book/chapter-notes.md` | More depth is needed on one of the ten laws the book covers, or on its examples. |

Read `reference/laws.md` first. Read the others only when the table says so.

## Ground rules

1. **The project's rubric is the standard. This reference is not.** Look for a rubric in the project (commonly `thoughts/shared/ux/rubric.md` or a path named in `CLAUDE.md` or `AGENTS.md`). If none exists, say so, and offer the `rubric` mode. Do not invent a standard and audit against it.
2. **No law without its limit.** Each law has a note or a key consideration that bounds it. Check the conflicts table before applying two laws that pull apart.
3. **Say how you know.** Label every judgement `CODE`, `APP` or `USERS` as the reference does. Never present something that needs the running app or real users as settled from reading code.
4. **Mind evidence strength.** The reference grades the laws. Do not let a contested or heuristic law override a strong one.
5. **Numbers.** Use a number as research only when the reference marks it **(sourced)**. A **(heuristic)** number is a starting point for the owner to accept or change.
6. **Do not quote the book or the Laws of UX site.** Paraphrase and cite the page or URL.

## Modes

Pick the mode from the user's request. If it is unclear, ask which one.

### build

For creating or changing UI.

1. Read the project rubric and `reference/laws.md`.
2. Before writing code, list the laws that bear on this change and what each requires here. Three to six is typical. Name any conflict and which way you resolved it.
3. Build.
4. End the change with a short note:
   - laws considered, one line each on how the change meets them
   - rubric rules touched, by ID
   - what could not be verified without the running app or users

### audit `<screens>`

For checking named screens.

1. Read only the rubric, `reference/laws.md`, the project's UI inventory if it has one, and the named screens and their code. Do not read earlier plans, diffs or design notes for those screens. Reading intent makes an auditor find what was intended.
2. If the rubric is missing or still has placeholders, stop and say so.
3. Report each finding with:
   - ID
   - route, file and line
   - what a person using the screen experiences
   - the rubric rule it breaks, by ID
   - severity: **Blocks** (cannot complete the job), **Slows** (can complete it, with avoidable effort or error), **Polish** (does not affect completion)
   - direction: what must be true afterwards, not how to build it
   - evidence type: `CODE`, `APP` or `USERS`
4. Put findings that break no rubric rule in a separate **Unanchored** section. They are observations for the owner, not failures.
5. Run `method/ethics-checklist.md` on any engagement feature on the screen. An ethics failure is reported even when no rubric rule covers it.
6. Do not change code.

### rubric

For helping the owner write the standard.

1. Read `method/principle-law-rule.md`.
2. Learn the product: who uses it and the few jobs they come to do.
3. Propose principles in "X over Y" form, each with its law, why it matters here, and checkable rules marked `CODE`, `APP` or `USERS`. Give a reason for each.
4. Write proposals to a separate proposals file. Never write into the rubric. The owner accepts, edits or rejects.

### explain `<law>`

Give the law's entry from `reference/laws.md` in plain terms, its limit, its evidence strength, and one example on the user's current product if there is one.

### ethics `<feature>`

Run `method/ethics-checklist.md` against the named feature. Report each of the seven mechanisms as present or absent, with the test result for those present.

## Scope of the sources

- The book is the first edition (2020) and covers 10 laws. The other 20 come from the Laws of UX website and from the further sources cited in the reference.
- The reference was researched on 2026-10-13. If a claim matters and may have changed, check its source URL.
