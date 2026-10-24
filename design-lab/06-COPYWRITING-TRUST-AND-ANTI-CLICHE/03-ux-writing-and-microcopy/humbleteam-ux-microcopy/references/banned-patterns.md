# Banned patterns

Read this file before writing or rewriting any copy. It has the 14 patterns that make interface copy read as generated, each with a bad example and a fixed example written for UI copy specifically. Referenced from `SKILL.md` step 0.

All examples below are invented for illustration - no real product, client, or user is named.

| Pattern | Bad example (interface copy) | Fixed example |
|---|---|---|
| Preamble | "Here's your confirmation: your changes have been saved." | "Changes saved." |
| Inflated significance | "Congratulations! You've unlocked a whole new way to manage your projects." | "Project created." |
| Promotional adjective | "Enjoy a seamless, effortless checkout experience." | "Checkout takes about 2 minutes." |
| Negative parallelism | "This isn't just a delete button - it's peace of mind." | "Delete removes the file. This can't be undone." |
| Vague attribution | "Studies show users love a clean inbox." | "Archived items move here automatically." |
| Filler phrase | "In order to save your changes, please click the button below." | "To save your changes, click Save." |
| Copula avoidance | "This toggle serves as a way to enable dark mode." | "This toggle turns on dark mode." |
| Forced rule of three | "Fast, simple, and powerful project tracking." | "Track projects without leaving your inbox." |
| Em dash | "Your export is ready — download it before the link expires." | "Your export is ready. Download it before the link expires." |
| Title Case in labels | "Save Changes" (button) | "Save changes" |
| Generic positive closer | "You're all set! Enjoy the app!" | "You're all set. Next: invite your team." |
| Decorative emoji | "Upload complete! 🎉" | "Upload complete." |
| Apology with no fact | "Oops! Something went wrong. Please try again later." | "Your changes didn't save because the connection dropped. Reconnect, then save again." |
| Unnamed consequence | "Are you sure?" (delete dialog) | Delete "Q3 Roadmap"? This removes the project and all 14 tasks inside it. This can't be undone. |

## Notes on specific rows

- **Preamble**: the row was added on 2026-10-22, and `SKILL.md` step 4 question 1 had been checking for a preamble since the gate was written. Until then it was the one tell this skill looks for that it could not name. The gate caught a framing opener in a draft of ours and deleted it, while strip mode, which reports the row that applied, had nothing to put on the `Removed:` line for the same shape in the copy a user handed over - the gap the two rows below were added to close in August, arrived at from the question side rather than the element side. A preamble frames the message instead of stating it, and the fix takes out the opener and leaves the message behind it alone.
- **Vague attribution**: interface copy rarely needs a citation at all - if a claim needs a source to be true, it usually doesn't belong in a button or a toast. Cut it, or replace it with the actual behavior the user can see.
- **Forced rule of three**: two real, specific properties beat three where the third is padding. Don't add a third adjective just to complete a pattern.
- **Em dash**: the row was called "em-dash overuse" until 2026-08-10, and the name was the bug. One em dash in a button, a toast, or an error is already the tell, and an interface line is rarely long enough to carry two, so a threshold of two meant the check almost never fired while single-dash copy shipped. The threshold is one. An en dash (–) used between words in place of an em dash counts the same. The only survivor is an em dash inside a string quoted verbatim, and the output should say it was left on purpose.
- **Decorative emoji**: emoji used inside the skill's own output examples (like the row above) are for illustration only. In shipped copy, an emoji is allowed only where the product's own established format already uses one - never added by a rewrite to look friendlier.
- **Apology with no fact** and **Unnamed consequence**: both were listed as element-specific tells in `SKILL.md` step 3b from the start, and neither had a row here until 2026-08-15. That was a hole in the output rather than in the check. Strip-mode output names the row that applied, and "Oops! Something went wrong" is the single most common line the skill is handed, so its defect had no name to report and the "Removed" line had no legal value. An apology is not a fact: name what failed and what to do next. A destructive confirmation names what goes, how much of it, and whether it comes back.
- **The fixed examples for those two rows are the filled form.** "the connection dropped" and "all 14 tasks inside it" are facts, and a rewrite only has them when the request supplied them. Handed the bad example alone, the shipped form is the slot form - "Your changes didn't save because `<cause>`. `<Fix for that cause>`." and "Delete "`<item>`"? This removes it and all `<n>` `<items>` inside it. `<Whether a delete can be undone>`." - with the missing facts asked for on the `Needs:` line (`SKILL.md` step 3c). The confirmation's rule names three facts, not two, and reversibility is the third: a rewrite handed "Are you sure?" alone knows no more about whether the action comes back than about how much it removes, so that clause is a slot on the same footing as the count. These two rows are the only ones in the table whose fix adds a fact rather than removing one, which is why they are the only rows that can produce a slot. They are not the only source of one - see below.

## How to use this table

In write mode, check a draft against every row before it ships. The step that does it is the pre-ship gate, `SKILL.md` step 4, and it runs ten questions: the first eight reach nine of the rows here, because question 6 reaches two of them; the ninth reads the remaining five - Inflated significance, Forced rule of three, Decorative emoji, Apology with no fact, and Unnamed consequence; and the tenth reads a flow's element set rather than any row here. Write mode has no earlier check that reads this file, so a draft that skips the gate ships unchecked against all 14.

In strip mode, name the specific row(s) that applied to the original copy in the "Removed" line of the output - "Removed: promotional adjective, em dash" is more useful to the user than "Removed: AI tells". Step 3b's check 1 reads the original, and only the original. The rewrite that replaces it reaches this table at the same step 4 gate, and a row the rewrite introduced is fixed there rather than reported: the "Removed" line names what came out of the user's copy, not what a rewrite put in and took back out.

Five rows are bound to a specific element rather than to copy in general: Title Case in labels, Generic positive closer, Decorative emoji, Apology with no fact, and Unnamed consequence. They are still rows, checked the same way. Every tell this skill looks for has a row here, because a rewrite that names a row has to find one - see `SKILL.md` step 3d for what to do with a defect neither check covers.

Twelve of the 14 rows are fixed by cutting something: an adjective, a dash, a closer, a capital letter, an opener. Two are fixed by adding a fact the copy never had, and a rewrite that does not have that fact ships a slot for it rather than a plausible one - `SKILL.md` step 3c.

## What this table does not cover

This table is one of the two checks strip mode runs, not the whole of it. It catches tells: something in the copy that reads as generated and comes out of the rewrite. It does not catch a line that carries no tell at all and still fails the job its element type has. That rule lives in `SKILL.md` step 2b, one row per element type, and reading it against the original is check 2 of step 3b.

The gap is not a narrow one, and it falls on the strings this skill is handed most:

| Copy | Rows here that apply | The 2b rule it fails |
|---|---|---|
| "Nothing here yet." (empty state) | none | Names what belongs in the space, then the one action that fills it |
| "Submit" (button) | none | Starts with a verb and names the outcome |
| "Save changes" as the tooltip on a Save changes button | none | States what the control does, never a restatement of its own label |
| "Your project will be deleted." (toast after the delete ran) | none | States the result, past tense |

Each of them passes all 14 rows. Read against this table alone they come back clean, and "Nothing here yet." is the one that shows what that costs: step 2b names that exact wording as the empty-state failure, so a table-only check reports the skill's own banned line as copy that reads fine.

None of these four gets a row here, and the reason is what a row means. A row names something the rewrite took out, which is what the `Removed:` line reports. These fixes put something in. A rule failure is reported on its own `Rule:` line instead, so the two stay legible: `Removed: promotional adjective` and `Rule: an empty state names what belongs in the space and the action that fills it` are different kinds of statement about the same rewrite.

Three of the 2b rules are satisfied by adding a fact the input may not carry - the empty state's two, the button's outcome, the error's cause - so check 2 can produce a slot and a `Needs:` question on copy where no row here applied at all (`SKILL.md` step 3c).
