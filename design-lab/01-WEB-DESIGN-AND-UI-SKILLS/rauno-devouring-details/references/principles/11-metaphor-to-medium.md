# Principle 11 ... Match the metaphor to the medium

> Do not paginate what should scroll. Do not modal what should be inline. Do not toast what should be persistent.

## What it means

Every UI pattern carries an implicit contract with the user about what kind of interaction is happening. A modal says "stop everything." A toast says "this will pass." Inline editing says "stay where you are." When the pattern and the interaction are mismatched, the user's expectation is wrong before they begin. The match between metaphor and medium is a prerequisite for the interaction to work.

## Why it matters

Bill Buxton's medium-shapes-the-message thesis in *Sketching User Experiences* is the foundation: the choice of input and output modality changes the meaning of the interaction, not just its delivery. Don Norman's mapping principle establishes that the relationship between controls and effects must be legible. Rauno Freiberg's "Interaction Metaphors" chapter in Devouring Details catalogs the current production vocabulary: when to use each pattern, and what each pattern communicates implicitly. Loren Brichter's pull-to-refresh is the Layer 3 canonical example of a metaphor so well matched to the medium that it requires no instruction.

## Register sensitivity

**`brand`** ... metaphor mostly about message architecture. Long-form scroll vs. pagination, inline expansion vs. modal, hero video vs. static image. Brand pages that paginate content that should scroll (or vice versa) fire. "Modal for a one-line text edit" is less common on brand surfaces but still wrong.

**`product`** ... central. Modal-for-inline-edit, paginate-what-should-scroll, toast-for-persistent, command-palette-vs-keyboard-shortcut are the hunting ground. The Notion slash menu, Sonner/cmdk singleton patterns, Linear's keyboard-first register are references.

**Common ground** ... metaphors that contradict the medium (video player controls inside a written article) fire in both. Metaphor mismatch at transaction moments (subscribe flow with celebration-theater confetti where Stripe-quiet-utility is appropriate) is 🔴 in both.

## Tactics

- Use inline editing for single-field edits. Double-click or click to edit, in place. The modal says "this is important enough to interrupt everything"; renaming a file is not.
- Use persistent UI (inline error state, banner) for errors that require user action. Toast auto-dismisses; persistent problems cannot be communicated with transient UI.
- Use infinite scroll for unbounded feeds. Pagination imposes chapter structure on data that has none.
- Respect the bottom sheet / panel / dialog distinction across breakpoints. A bottom sheet is the correct metaphor on mobile (above the keyboard, reachable with a thumb). On desktop, it is not.

## Anti-patterns

- **Modal for single-field edit:** The modal says "stop everything." Renaming a file does not require stopping everything. Inline editing is the correct metaphor.
- **Toast for persistent or actionable errors:** Toast communicates "this will pass." Expired session and payment failure do not pass on their own. The toast is gone before the user can act.
- **Pagination on a feed:** News feeds and activity timelines have no natural chapters. Pagination imposes structure the data does not have and loses the user's scroll position on every page.
- **Bottom sheet on desktop:** The thumb-reachable bottom sheet metaphor does not survive context-switching to desktop. The metaphor and the medium are mismatched.

## Exemplars

- **Notion slash menu:** The command surface is inline in the document, at the cursor. The writing metaphor and the command metaphor coexist without interruption. No modal, no toolbar click, no context switch.
- **Loren Brichter's pull-to-refresh:** Physical pull metaphor for data refresh. Undiscoverable on first contact; universally known. The metaphor is so well matched to the medium that discovery is experienced as "obviously."
- **Vaul drawer:** Bottom sheet is the correct metaphor on mobile. Vaul supports responsive breakpoints so the component can change form at desktop widths.

## Further study

- Rauno Freiberg, Devouring Details, "Interaction Metaphors" chapter (devouringdetails.com)
- Bill Buxton, *Sketching User Experiences* (2007) ... the medium-shapes-the-message thesis; input and output as meaning-makers
