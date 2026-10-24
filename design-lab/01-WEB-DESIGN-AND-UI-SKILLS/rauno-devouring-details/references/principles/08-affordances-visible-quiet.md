# Principle 8 ... Make affordances visible without making them loud

> Good design is unobtrusive.
> ... Dieter Rams, principle 5

## What it means

Affordances should be discoverable, not declarative. A signifier that is louder than the interaction it signals is doing more design work than the interaction requires. The correct size of a signifier is the minimum needed for recognition. Anything above that minimum is decoration that competes with content.

## Why it matters

The pre-HCI source is HfG Ulm (1953-1968), whose systematic design method established that design proceeds from explicit criteria rather than individual stylistic intuition. Dieter Rams worked within the tradition Ulm established; his principle 5 ("good design is unobtrusive") is the Ulm method applied to the question of how a designed object should present itself. The same constraint maps directly to signifiers: the interface should not draw attention to itself, and a signifier that is louder than the interaction it points to violates that constraint. Don Norman's vocabulary distinguishes affordances (the possible actions) from signifiers (the cues that point to them): signifiers are communication, and communication can be over-stated. Naoto Fukasawa's "Without Thought" and "super-normal" philosophies push further: the best signifier is one that requires no conscious processing, just recognition. The macOS scrollbar demonstrates all three: thin, present when needed, invisible when not, requiring no explanation.

## Register sensitivity

**`brand`** ... brand surfaces tolerate more visible, declarative affordances. A labeled "GET STARTED" button in a hero is fine; Fukasawa-level invisibility would be wrong here. But still fires when decorative signifiers are shouting (drop shadows on every button, badges on everything, icons decorating nothing).

**`product`** ... signifiers should recede until needed. The macOS scrollbar is the reference. Fires when product UI is loud with affordances (always-visible drag handles when only occasional, per-row action buttons instead of hover-reveal, redundant labeling).

**Common ground** ... affordances that are invisible to the user who needs them (hidden tap zones with no visible hint) are 🔴 in both. Affordances that are so loud they dominate the content are 🔴 in both.

## Tactics

- Show row-level actions on hover or focus, not always. Always-visible actions add visual weight to every row in the table; none of it is needed until the user attends to that row.
- Size drag handles to the minimum visual presence that preserves recognition. Four pixels is enough for a mobile drag handle; a 32px gradient bar is a label.
- Empty states should surface one clear next action. Listing every possible feature in an empty state is not an affordance; it is a manual.
- For hover-revealed signifiers, make sure the reveal is deliberate (commit on intent, not on contact)... see principle 3.

## Anti-patterns

- **Drag handle with instruction text:** "Drag to reorder" in a label on a drag handle. The handle's physical form communicates draggability; the text over-explains and claims space the interaction doesn't need.
- **Always-visible row actions:** Delete, edit, and share buttons rendered on every row at all times. The visual weight of all three rows of buttons serves only the rare moment when the user needs them.
- **Empty state that lists every feature:** Three CTA buttons, a feature list, and a tutorial link. The empty state is an onboarding manual. Users skip manuals.

## Exemplars

- **macOS scrollbar:** Thin and present when scrolling, invisible otherwise. The affordance appears when needed; the decoration does not appear when not needed.
- **Vaul drawer handle:** A 4px bar at the top of the sheet. Every mobile user recognizes it as a drag handle. It claims zero attention. This is the correct answer to principle 8 on a touch surface.
- **NotBoring apps:** Interactions are discoverable through physical behavior. Spring physics communicates limits. No labels required.

## Further study

- Hochschule für Gestaltung Ulm (1953-1968) ... the Layer 0 source for the systematic-design tradition that produced Rams's unobtrusive-design principle; see `references/lineage.md` Layer 0 section
- Don Norman, *The Design of Everyday Things* (1988, revised 2013) ... affordances and signifiers; the vocabulary for talking about discoverability
- Naoto Fukasawa, "Without Thought" ... super-normal design; the principle of recognition without conscious processing
