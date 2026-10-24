---
name: ux-writing
description: Write interface microcopy for buttons, error messages, empty states, and confirmations, or strip AI-generated tells out of copy you already have. Use for "write the button copy for...", "draft an error message for...", "this copy sounds AI-generated", "write empty state copy", or "rewrite this confirmation dialog". Do not use for marketing pages or long-form content - interface microcopy only.
---

# UX writing

Write interface copy that reads like someone thought about the specific screen, or rewrite copy that reads like a model generated it.

## Step 0 - load the pattern table

Before writing or rewriting anything, read [references/banned-patterns.md](references/banned-patterns.md) if it is not already in context. It has the 14 AI-tell patterns this skill checks for, each with a bad and fixed example in interface copy. Do not skip this even if the patterns look familiar - the exact wording matters for a consistent check every run. The table is one of the two checks strip mode runs, not the whole of it: the other is the element's own rule in step 2b. Write mode has no check of its own that reads it - the table reaches a written draft only at the step 4 gate, which is also the only place it is read against a strip-mode rewrite.

## Step 1 - pick a mode

- **Write mode**: the request describes a component or flow with no existing copy to work from - a button, a form, an error state, an empty state, a delete flow.
- **Strip mode**: the request includes an actual string of existing copy, or says the copy sounds generated, robotic, or "too AI".

If the request gives neither a component to write for nor a string to rewrite, ask what needs copy instead of guessing.

## Step 2 - write mode

### 2a. Identify the element type

If the user names the element (button, error, empty state), use it directly. If they only describe a flow ("write the copy for deleting a project"), break it into the elements that flow actually needs - usually a button, a confirmation, an error, and a success message - and write each one.

A third case is neither of those: the request describes one piece of copy and never says what element it is ("write the line that explains why the Publish button is disabled"). Infer the type from the request, and then test the inference, because here it decides more than it does in strip mode. There an inferred type picks the rule a finished string is judged against, so a wrong one ships a wrong verdict about a line that may be correct. Here it picks the rule the line is built to, so a wrong one ships copy shaped for an element the screen does not have: as a tooltip that line states the condition now, "Publishing needs a title and at least one section", and as an error message it has to state what happened and how to fix it, which reports a failure that has not occurred.

So name the one other type the request could plausibly be asking for, read that rule too, and compare the lines the two rules produce. The inferred type stands either way - this test does not re-pick it, and there is no second string for two rules to agree or disagree about, which is why the branches here are not 3a's:

- **The two rules produce the same line.** The inference decided nothing. Ship the block, marking the type inferred (2d) so the user can correct it.
- **The two rules produce different lines.** The type decided the output. Ship the line for the inferred type, still marked inferred, and ask which element it is under the block, naming both candidates and what each changes about the line (2d). A written line is a draft, and 2c already says what a draft missing something does: it ships with the gap named and the question under it. Withholding the copy is the one move not available - 2c forbids dropping an element to avoid its question, and unlike 3a there is no existing line here that a wrong verdict could call broken.

A type the user stated never runs this test, and neither does an element the flow decomposition created: its type is fixed by the decision that it belongs in the flow at all. What that path can get wrong is which elements the flow has - a delete that is reversible wants a toast carrying an undo and no confirmation dialog - and reading a second type's rule catches none of that.

### 2b. Apply the rule for that element type

| Element | Rule | Shape |
|---|---|---|
| Button / link | Start with a verb, name the outcome. Sentence case. Never a bare "Submit", "OK", or "Learn more" if a specific outcome can be named instead. | `<Verb> <object>` - "Save changes", "Delete project", "Invite teammate" |
| Error message | State what happened, then how to fix it, in that order. No blame, no bare apology. | `<What happened>. <How to fix it>.` |
| Empty state | Name what belongs in the space, then the one action that fills it. Never a bare "Nothing here yet" with no next step. | `<What's missing>. <Action>.` plus one button |
| Confirmation (destructive) | Name the specific consequence: what gets removed, how much, whether it's reversible. Never a bare "Are you sure?" | `<Action> "<item>"? <Consequence>. <Reversible or not>.` |
| Placeholder text | An example value inside a field. Never a substitute for a persistent label - if removing the placeholder would leave the field unlabeled, that is a bug, not a copy choice. | short example value, not an instruction |
| Tooltip | One sentence. States what the control does, or why it's disabled. Never a restatement of its own label. | `<What it does or why it's disabled>` |
| Toast / inline notification | States the result, past tense. No exclamation mark unless a provided brand voice guide calls for it. | `<Object> <past-tense result>.` - "Project deleted." |
| Field label | Sentence case. Names the field's content, not an instruction. | short noun phrase |

### 2c. Facts the line needs and the input does not have

Two of the rules in 2b turn on a fact about the product rather than on the element: a destructive confirmation names how much goes and whether it comes back, and an error names what happened. A request often describes the flow and not the data - "write the copy for deleting a project" says nothing about what a project holds or about what blocks a delete - and self-check 8 forbids shipping a number or a cause the input never confirmed. That leaves the line with a rule it cannot satisfy and a gate it cannot pass.

Do not pick a plausible value. Write the line with the missing fact as a named slot in the position it belongs, and ask for it under the block:

- **Slot, not a guess.** Angle brackets around what is needed: `all <n> tasks inside it`, never `all 14 tasks inside it` on a request that never mentioned tasks.
- **A line carrying a slot is a draft.** It does not ship until the slot is filled, and the `Needs:` line says so by existing.
- **One question per slot**, in the order the slots appear, each naming the element it belongs to.
- **Answered, the block is re-emitted whole** with the slots filled and the `Needs:` line dropped.

Elements whose rules need no product fact ship as finished copy in the same block. A missing count in the confirmation does not hold up the button label next to it.

### 2d. Output format - write mode

```
## <Component or flow name>

**<Element type>:** <copy>
**<Element type> [inferred]:** <copy>
**<Element type>:** <copy>

**Needs:** <one question per slot, semicolon-separated>
**Type:** <the two candidate element types, and what each changes about the line>
```

One line per element, labeled by type, in the order a user would meet them. The `Needs:` line appears only when a line in the block carries a slot - an empty one is never shipped, the same way an empty `Removed:` is not. For a multi-element flow (a delete confirmation, say), that order is usually: button, confirmation dialog, error, success toast.

A type the request stated carries no marker. A type this skill inferred carries `[inferred]` on its label, and that marker is the only thing telling the reader which labels were their words and which were ours. The labels sit in one block next to each other, so without it a guess reads as a settled fact. An element the flow decomposition created counts as stated here: the request named the flow, and the element is in the block because the flow needs it.

`Type:` appears only where an inferred type's two candidate rules produced different lines (2a), one entry per such element, and it is never shipped empty. It does not replace the copy the way strip mode's `Type:` line replaces a verdict: the line above it is written and usable, and the question is about which element it belongs to. `Needs:` and `Type:` are different questions and one block can carry both - a slot is a fact the line needs, `Type:` is which element the line is. Answered, the block is re-emitted whole with the marker dropped from every label the answer settled.

## Step 3 - strip mode

### 3a. Identify the element type

If the user names it, use that. If not, infer it from shape - a short imperative phrase reads as a button, a sentence describing a problem reads as an error, a question with an implied yes/no reads as a confirmation - and name the inferred type in the output so the user can correct it.

An inferred type is not just a label on the output. Check 2 reads the 2b rule for the type named here, so a guess about the element decides which rule the copy is judged against, and the same string can pass one rule and fail another. "Save changes" handed over on its own is a short imperative phrase, so the shape heuristic calls it a button, and as a button it passes 2b - verb first, outcome named, sentence case. As the tooltip on a Save changes button it fails 2b for restating its own label, which is the case the check-2 table below already names. Nothing in the string separates the two, and the type is doing the deciding.

So an inferred type is tested before its verdict ships. Name the one other type the string could plausibly be, and read that rule too:

- **The two rules agree** - both pass, or both fail and the fix is the same line -> ship the block, naming the inferred type as above. Most strings land here: an apology with no fact is an error whichever neighbouring type you try.
- **The two rules disagree** - one passes, the other fails -> the verdict would be a finding about the element, not about the copy. Ship what check 1 found, and ask which element it is, naming both candidates and what each would mean for the line (3d). Do not ship a rewrite that reshapes copy into the wrong element's shape.

A type the user stated never runs this test. They said what it is, and the inference that could be wrong never happened.

### 3b. Two checks, not one

**Check 1 - the pattern table.** Compare the copy against every row of [references/banned-patterns.md](references/banned-patterns.md). Five of those rows are bound to a specific element rather than to copy in general, and they catch what the general rows miss:

| What you see | Row it belongs to |
|---|---|
| Title Case on a button or label instead of sentence case | Title Case in labels |
| An error that opens with an apology ("Oops!", "Sorry!") and states no fact | Apology with no fact |
| A confirmation that asks "Are you sure?" without naming what happens if the user says yes | Unnamed consequence |
| An exclamation mark carrying no information ("You're all set!" with nothing after it) | Generic positive closer |
| A decorative emoji the product's own established format did not already use | Decorative emoji |

Every tell named here has a row, because 3d has to report one. A tell with no row is a gap in the table, not a licence to invent a name for it.

**Check 2 - the element's own rule.** Look up the type named in 3a in the table in step 2b and read its rule against the original. Where 3a inferred that type rather than reading it off the request, run 3a's test first: this check's verdict is only as good as the type it was run against. The two checks do not overlap: the table asks whether the copy carries a tell, and the rule asks whether the line does the job its element type exists to do. A line can pass all 14 rows and still fail its rule, and the strings this skill is handed most often are exactly that shape:

| Copy | Rows that apply | The 2b rule it fails |
|---|---|---|
| "Nothing here yet." (empty state) | none | Names what belongs in the space, then the one action that fills it |
| "Submit" (button) | none | Starts with a verb and names the outcome |
| "Save changes" as the tooltip on a Save changes button | none | States what the control does, never a restatement of its own label |
| "Your project will be deleted." (toast after the delete ran) | none | States the result, past tense |

"Nothing here yet." is the sharpest of them: step 2b names that exact wording as the empty-state failure, so a check that reads the table alone reports the skill's own banned line as copy that reads fine.

A row that applied and a rule that failed are both defects, and either one ships a rewrite. They are reported on separate lines because they are opposite moves - a row names something taken out, a rule names something the line never had (3d). A 2b rule failure is not a gap in the table and never gets a row invented for it.

Where the rule turns on something the string alone cannot show - the placeholder rule turns on whether the field has a persistent label, which no amount of reading the placeholder reveals - say what the rule turns on and ask. Do not assume the label is there, and do not report the bug on the assumption that it is not.

### 3c. Rewrite: keep the facts, slot the ones the fix needs

Preserve every number, name, and specific claim in the original exactly - a rewrite that fixes tone but changes a fact is a worse bug than the tone. If the copy contains no real facts to preserve (pure filler), the rewrite can be shorter than the original.

Two of the rows in check 1 are only fixable by adding a fact. `Apology with no fact` is fixed by naming what happened; `Unnamed consequence` is fixed by naming what goes and whether it comes back. "Oops! Something went wrong. Please try again later." and "Are you sure?" are the two lines this skill is handed most often, and neither one carries the fact its own fix needs. Cutting is not available - there is nothing invented in the original to cut - and the row applied, so 3d has already ruled out skipping the rewrite. That leaves a plausible guess, which is the thing this skill exists to stop.

The write-mode remedy holds here too. Where the missing fact came from decides which way it goes:

- **The original claims it and the input never confirmed it** -> cut it. The rewrite carries the facts the original carried and no others. This is self-check 8's original case, unchanged.
- **The fix needs it and neither the original nor the request carries it** -> write it as a named slot in the position it belongs (`all <n> <items> inside it`, `because <cause>`) and ask for it on a `Needs:` line under the block.

A rewrite carrying a slot is a draft, exactly as in write mode: it does not ship until the slot is filled, and the `Needs:` line says so by existing. Answered, the block is re-emitted with the slots filled and the line dropped. A slot never appears on the `Before:` line - the original is quoted as the user gave it, tells and all.

Check 2 produces slots the same way, and on copy where no row applied at all. Three of the 2b rules are satisfied by adding a fact the line never had: an empty state names what belongs in the space and the action that fills it, a button names the outcome, an error names what happened. "Nothing here yet." needs both of the empty state's, "Submit" needs the outcome of the form it sits under, and a request that hands over the string alone carries none of them. Slot each one and ask for it, exactly as above. A rule fixed by cutting instead - a tooltip that restates its own label, a toast in the wrong tense - needs nothing from the user and ships finished.

### 3d. Output format - strip mode

```
### <Element type - short label>
- Before: "<original copy>"
- After: "<rewrite>"
- Removed: <pattern name(s) from banned-patterns.md, comma-separated>
- Rule: <the 2b rule for this element type that the original failed>
- Needs: <one question per slot the rewrite carries>
- Type: <the two candidate element types, and what each would mean for this line>
```

One block per string the user gave.

`Needs:` appears only on a block whose rewrite carries a slot (3c), one question per slot, in the order the slots appear. An empty `Needs:` is never shipped, and neither is an empty `Removed:`, `Rule:` or `Type:`.

The two report lines are not interchangeable. `Removed:` carries row names from `references/banned-patterns.md` - what came out of the copy. `Rule:` carries the 2b rule the original failed - what the copy never did. A fix that adds a fact has nothing to put on `Removed:`, and a fix that cuts an adjective has nothing to put on `Rule:`, so each line is present only when its own check found something:

- **At least one row applied, or the 2b rule failed** -> rewrite the line. Name every row that applied on `Removed:`, not just the first, and name the failed rule on `Rule:`.
- **Neither check found anything** -> the copy reads fine. Say so and skip the rewrite. Do not manufacture a change to justify a response, and never invent a pattern name to fill the line. Both checks have to have reached a verdict for this branch: a split type test means check 2 never did.
- **3a's type test came back split** -> no verdict on check 2. Ship whatever check 1 found and the `Type:` question, and stop there.

`Type:` is the one line that stands in for a verdict rather than reporting one, and a block carrying it has no `Rule:` line - 3a's test came back split, so no rule failure has been established and none can be named. What check 1 found still ships: the 14 rows read the copy and not the element, so `Removed:` and an `After:` carrying that fix are present when the table found something and absent when it did not. A block that is nothing but `Before:` and `Type:` is the honest shape for a string the table passed and whose answer turns on which element it is. It is not the skip branch, and it is not a rewrite either.

A block that ships a rewrite carries at least one of `Removed:` and `Rule:`. A block that carries neither is the skip branch, unless it carries `Type:`, which says the second check has not run to a verdict yet. "No row applied" on its own is not a verdict: it is one check out of two, and on a bare empty state or a bare "Submit" it is the expected result of the check that was never going to catch them.

If a line is plainly wrong and neither check covers it, ship the rewrite, put whatever each check did find on its own line, and add a `Note:` line under the block naming the remaining defect in plain words and saying neither the table nor the 2b rule covers it. An honest gap belongs in the output; an invented row name sends the user to a reference file that does not have it.

## Step 4 - pre-ship self-check (run before either mode's output ships)

Scan the draft against these ten questions. **A single "yes" sends the line back for a rewrite** - this is a gate, not a suggestion. Questions 1 to 9 read one line at a time; question 10 reads the block, and what it sends back is an element rather than a sentence.

This gate is the only thing that reads the pattern table against a line this skill wrote. Check 1 in step 3b reads it against the original the user handed over, and nothing reads it against the rewrite that replaces it; write mode never runs it at all. Both of those drafts arrive here.

1. **Preamble?** Does the line open with framing like "Here's your..." or "This will..." instead of stating the message directly? -> Delete the opener, and leave the message behind it alone. The table carries a Preamble row, so the same shape in copy the user handed over is a row check 1 can report on `Removed:` rather than a defect with no name.
2. **Negative parallelism?** Any shape like "not just a button - it's peace of mind"? -> Drop the negative half, state the positive claim directly.
3. **Em dash?** Any em dash (—) at all, or an en dash (–) doing an em dash's job between words? The threshold is zero, not two: one em dash in a shipped line already breaks the rule below, and a line short enough to be a button, a toast, or an error rarely holds two, so a "more than one" gate never fires on real interface copy. -> Replace it with a period, a comma, or " - ". A string quoted verbatim is the only exception (see edge cases).
4. **Promotional adjective?** "Seamless", "effortless", "powerful", "intuitive", "robust", "cutting-edge"? -> Cut it, or replace with the concrete fact it was standing in for.
5. **Title Case?** A button or label capitalized like a headline instead of sentence case? -> Lowercase everything but the first word and proper nouns.
6. **Filler verb?** "In order to", "serves as", "is used to" where "to" or "is" would do? -> Replace with the plain verb.
7. **Generic closer?** "Enjoy!", "Happy exploring!", or an exclamation mark with nothing after it? -> Delete it, or replace with the actual next step.
8. **Unverifiable claim?** A number, guarantee, or capability stated as fact that isn't confirmed by the input? -> In write mode, turn it into a slot and ask for it on the `Needs:` line (2c). In strip mode it turns on where the fact came from (3c): a claim the original made and the input never confirmed is cut, and a fact the fix itself needs becomes a slot and a `Needs:` question. "Flag it" means one of those shapes; a guessed fact does not ship with a caveat attached to it.
9. **A row the eight questions above don't reach?** Read the draft against [references/banned-patterns.md](references/banned-patterns.md). Questions 1 to 8 reach nine of its 14 rows - Preamble, Negative parallelism, Em dash, Promotional adjective, Title Case in labels, Filler phrase and Copula avoidance together, Generic positive closer, and Vague attribution. The other five are Inflated significance, Forced rule of three, Decorative emoji, Apology with no fact, and Unnamed consequence. -> Fix it the way the row's fixed example does. A row this skill's own draft introduced is fixed and not reported: `Removed:` names what came out of the user's copy, never what the rewrite put in and took back out.
10. **An element the flow does not have, or one it needs and the block skips?** Write mode on a flow only. 2a fixes each decomposed element's type by deciding it belongs in the flow at all, so no later step asks whether it does. Read the labels against the flow once: a spurious element - a confirmation dialog on a delete that is reversible, which wants a toast carrying an undo instead - or a missing one, a destructive action with no confirmation anywhere. -> Drop the spurious element, or write the missing one to its 2b rule. Where the request never gave the fact the set turns on, that fact is already a slot on the element it belongs to, so its `Needs:` question names what else the answer settles: whether the element stays.

Question 9 is where the count reconciles: nine rows reached by the questions above, five reached only by reading the table, and 14 in the file. Three of the five have no other gate anywhere in write mode. The two that do - Apology with no fact, Unnamed consequence - have a 2b rule behind them for the error and the destructive confirmation only, so an apology in a toast or an unnamed consequence in a tooltip meets nothing. "Congratulations! You've unlocked a whole new way to manage your projects." passes all eight: the exclamation mark has a sentence after it, so question 7 does not fire, and "whole new way" is not on question 4's adjective list.

Question 10 is the only gate on 2a's flow path. A stated type runs its 2b rule, an inferred type runs 2a's test as well, and an element the decomposition created had neither - 2d counts it as stated, so it ships unmarked. The question does not fire on a request naming one piece of copy: one element is not a set, and there is nothing for it to be missing from. It is also the only question whose fix can remove a line rather than rewrite one, and 2c's bar still holds on the other branch - a missing element is written with its facts slotted, never left out to avoid the question it would raise.

## Edge cases

| Situation | What to do |
|---|---|
| Copy is legal or compliance-reviewed (terms, consent language, pricing disclaimers) | Flag it as compliance copy instead of rewriting the meaning. Fix only surface AI-tells (em dashes, Title Case) if asked, and say plainly that a meaning-changing edit needs human sign-off first. |
| A brand voice guide is provided | It wins over the defaults in this skill wherever the two conflict. Apply the voice guide's rules first, and fall back to this skill's rules for anything the guide doesn't cover. |
| Request is for non-English copy | The structural rules hold in any language (verb-led buttons, cause-then-fix errors, named consequences). Say plainly that the vocabulary list in `references/banned-patterns.md` is English-specific and does not transfer word for word. |
| Element type isn't stated (write mode) | Infer it from the request, then run 2a's test: read the one other plausible type's rule too. Write the copy to the inferred type either way, mark its label `[inferred]` so the user can correct it, and add the `Type:` question when the two rules would produce different lines. |
| Write mode infers a single element's type and both candidates sit on one 2b row (a button or a link to the same destination) | One rule, so one line, and the inference decided nothing. Ship the block with the label marked `[inferred]` and no `Type:` question. |
| Write mode infers a single element's type and the two candidates produce different lines ("the line explaining why Publish is disabled" - a tooltip states the condition, an error states a failure that has not happened) | Write the line for the inferred type, mark its label `[inferred]`, and ask which element it is on a `Type:` line. Do not hold the copy back: a draft with its question under it is 2c's shape, and there is no existing line here for a wrong verdict to call broken. |
| An element's rule needs a product fact the request never gave (how many items a delete removes, why an upload fails) | Write the line with a named slot where the fact belongs and ask for it on the `Needs:` line. Never fill a slot with a plausible value, and never drop the element to avoid the question - a confirmation with no consequence named is the pattern this skill exists to catch. |
| The row that applied is only fixable by adding a fact the input never gave ("Are you sure?", "Oops! Something went wrong.") | Rewrite with a named slot where the fact belongs and ask for it on the `Needs:` line. Do not skip the rewrite - a row applied, so the copy is not fine - and do not fill the slot with a plausible cause or count. |
| Strip mode is handed a line with no tell that still fails its element's rule ("Nothing here yet.", "Submit", a tooltip repeating its own label) | Rewrite it. No row applied is the expected result of check 1 here, not a verdict - check 2 is the one that catches these. Leave `Removed:` off the block, name the failed rule on `Rule:`, and slot any fact the fix needs. |
| Strip mode infers the element type and the two plausible types disagree on the verdict (a bare "Save changes" - button, or the tooltip on a Save changes button) | Do not ship a verdict. Report what the table found, then ask which element it is, naming both candidates and what each would mean. A rewrite built on the wrong type reshapes copy that was already right for its element. |
| Strip mode infers the element type and both plausible types give the same verdict | Ship the block as normal, naming the inferred type so the user can correct it. The test catches a split, it does not put a question on every inferred block. |
| Strip mode is handed a placeholder and the input never says whether the field has a label | The placeholder rule turns on the label, which the string cannot show. Say what the rule turns on and ask. Do not assume a label is there, and do not report the bug on the assumption that it is not. |
| Existing copy already reads fine (strip mode) | Say so and skip the rewrite. "Reads fine" means both checks came back clean, not only the table. An empty "nothing to fix" is a valid result, not a failure to find something. |
| Copy contains a real number or fact from the product | Preserve it exactly. Never invent or round a count, price, or limit that isn't in the input. |
| Copy quotes a string that has to stay verbatim (a legal clause, a third-party product name, text the user typed) | An em dash inside the quotation stays. Fix the ones outside it, and name the one you left and why. An exact quote beats a clean dash count. |
| A rewrite fixes the row that applied and introduces another one ("Enjoy a seamless checkout." -> "Checkout is fast, simple, and clear.") | Question 9 catches it at the gate. Fix it before the block ships, and leave the report lines alone: `Removed:` carries the row the original had, not the one the rewrite briefly grew. |

## Rules that hold in both modes

- Sentence case for every button, label, and heading in shipped copy - no exceptions.
- No em dash in shipped copy, and no en dash standing in for one. Zero, not "not too many". Use a period, a comma, or " - " instead. A verbatim quotation is the only place one survives.
- Never invent a number, a guarantee, or a capability that isn't in the input. A fact the line's own rule needs becomes a slot and a `Needs:` question, in either mode; a claim the original made and the input never confirmed is cut.
- Strip mode runs both checks, the pattern table and the element's own rule from 2b. A clean pass on the table is one check out of two, not a verdict that the copy reads fine.
- Every line this skill wrote is read against all 14 rows before it ships, at the step 4 gate. The checks in step 3b read the copy the user handed over; nothing else reads the copy we hand back.
- An element type the request never stated is tested before anything built on it ships, in both modes: read the second plausible type's 2b rule too. What the test protects differs, because the type decides a different thing in each mode. In strip mode it decides the rule a finished string is judged against, so a split ships no verdict on check 2 and asks which element it is instead. In write mode it decides the rule the line is built to, so a split ships the line marked `[inferred]` with the question under it, because holding back copy the request asked for is not one of this skill's moves. A stated type needs no test in either mode.
- A failed self-check item means a rewrite, not a footnote explaining the tradeoff.
- Compliance-reviewed copy needs a human sign-off before a meaning-changing edit ships.
- Keep the tone direct. No hedging ("this might possibly need a better label") - either fix it or leave it.
