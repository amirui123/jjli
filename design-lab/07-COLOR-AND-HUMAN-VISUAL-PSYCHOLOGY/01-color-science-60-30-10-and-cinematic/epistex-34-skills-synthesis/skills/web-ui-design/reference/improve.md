# Improve

Existing UI that looks dated or is hard to use. Measure before you change anything, and keep what works.

## 1. Audit

Run the render loop's checker on the current UI and open every tile. Walk the primary flow. Write the findings as a table, `Location | Problem | Rule | Impact`, ordered by how much each hurts the user's main job. Keep the first run's tiles as the "before".

List what must survive: every piece of content (headings, data rows, prices, forms), every working flow and what it does, the brand marks, and the stack and editing workflow.

## 2. Agree the scope

Run the question round in SKILL.md. Its scope question offers three levels, with your recommendation from the audit:

- **Polish**: keep the layout and brand, fix the defects (contrast, spacing, states, focus, mobile).
- **Refresh**: keep the structure and content, replace the tokens and visual style.
- **Rebuild**: change the structure too. From here run [new.md](new.md) steps 2 to 4, with the survival list as fixed content.

The user's must-keep items join the survival list. Write the Brief, scope and survival list into `DESIGN.md`.

## 3. Fix in batches

Work down the findings table, most harmful first. For Refresh, pick the style family from [patterns.md](patterns.md) that fits the brand, and tailor its tokens per [new.md](new.md) step 3, keeping the brand colors and marks. Use the rules for every new value. Keep the stack: a hand-edited static site stays hand-editable.

## 4. Check the survival list

After the last batch, check every item on the survival list: the content is present and every flow still works, by running it.

Done when the render loop is clean, every survival item is confirmed, and every audit finding is fixed or listed with its reason.

## 5. Report

Record decisions. The reply has a `Location | Before | After | Why` table for the main changes and the before and after tiles for the primary screen at 390 and 1440 px.
