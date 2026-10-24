# Method: principle → law → rule

From chapter 12 of Yablonski's *Laws of UX* (first edition, pp. 123 to 128), written out as a working procedure. The chain is the book's. The checkability test, the rubric layout and the audit link are additions for use with coding agents, and are marked as such.

## Why this exists

A law on its own does not tell you what to build. "Hick's Law applies" is true of every screen and settles nothing. A project needs to say what it values, which law backs that up, and what that means in numbers and placements for this product. Without that, review turns into taste, and every redesign starts from "make it better".

## The chain

| Link | What it is | Who writes it | Example |
|---|---|---|---|
| **Principle** | A goal that takes a side | The project owner | Clarity over abundance of choice |
| **Law** | The observation about people that supports it | Taken from `reference/laws.md` | Hick's Law |
| **Rule** | A constraint specific to this product | The owner, with proposals from the team or an agent | No more than 3 choices at a time |

A second example from the book: "Familiarity over novelty" → Jakob's Law → use common design patterns; no flashy or quirky animation that distracts.

## Writing a principle

The book gives four tests (pp. 125 to 126). A principle that fails any of them will not help anyone decide.

1. **Not a truism.** "Design should be intuitive" cannot be disagreed with, so it cannot guide.
2. **Settles a real question.** It should resolve an argument the team actually has. It should not be so specific that it only fits one screen.
3. **Opinionated.** It prioritises, and it lets the team say no.
4. **Memorable.** If people cannot recall it, they will not use it.

The form **"X over Y"** passes the third test by construction, because it names what is given up. Both sides must be things a reasonable team could want. "Clarity over confusion" is a truism in disguise.

## Choosing the law

- Pick the law that most directly explains why the principle is right. One is usually enough. Two is fine when they pull the same way.
- Read the law's limit before using it. In the book every law has a "key consideration". In `reference/laws.md` see the notes and the conflicts table.
- Check the evidence strength table in `reference/laws.md`. A rule resting on a contested law (Choice Overload, Zeigarnik as a memory claim) should be treated as a bet to test, not a fact.

## Writing rules

A rule turns the principle into something a person or an agent can check on a screen.

**Addition for agent use: the checkability test.** A rule is ready when two people looking at the same screen would agree whether it is met. Good rules usually contain one of these:

- a number ("at most one primary button per view")
- a placement ("progress sits beside the action that advances it")
- a presence or absence ("every icon in navigation has a text label")
- a sequence ("the completion state appears before any further request")

Mark where each rule can be checked, using the labels from the reference: `CODE`, `APP` or `USERS`. A rule that can only be checked with users is still worth writing. It just cannot be passed or failed by an agent.

## A rubric built on the chain

**Addition for agent use.** A project rubric is the set of chains the owner has accepted, plus the context needed to apply them.

```markdown
## Jobs
Who uses this, and the few things they come to do. Ranked.

## Principles
### P1. <X over Y>
- Law: <law name>
- Why here: <one line on why this matters for this product>
- Rules:
  - P1.1 <rule> [CODE]
  - P1.2 <rule> [APP]

## Non-negotiables
Rules that hold regardless of principle: accessibility floors, ethics lines.

## Changelog
Date, what changed, why.
```

Each rule gets an ID. An audit finding then cites the rule ID it breaks, and a finding that cites no rule is kept apart as an opinion.

## Ownership

- The owner writes and accepts principles and rules. An agent may propose them, each with a reason, in a separate file.
- An agent does not write into the rubric, and does not audit against proposals as if they were accepted.
- When a rule turns out wrong, the fix is a changelog entry and a changed rule, not a quiet exception on one screen.

## Where a team is the audience

The book's process for defining principles as a group (p. 124): identify who takes part, align on what a principle must do, generate ideas separately, bring them together into themes and vote, refine and decide where they apply, then circulate and advocate. For a single owner the same steps shrink to: list candidate principles, cut to the few that settle real arguments, attach laws and rules.
