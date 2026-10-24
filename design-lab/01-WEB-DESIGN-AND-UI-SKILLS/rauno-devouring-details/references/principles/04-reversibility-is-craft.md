# Principle 4 ... Reversibility is craft

> Every optimistic state needs a believable error path.

## What it means

When the interface updates optimistically, it makes a promise: this action will succeed. Every promise must be kept or the breaking of it must be communicated with equal weight to the original claim. An error path that is an afterthought... silent rollback, spinner stuck in loading, no catch block... is a design failure, not a code failure. The craft of an async interaction is measured by the quality of its worst-case path.

## Why it matters

Dieter Rams's principle 6 ("good design is honest") applies to error states as much as success states: the interface must not misrepresent what is happening. Don Norman's gulf of evaluation names the problem precisely: without feedback, the user cannot assess the system's state. Bret Victor's "Magic Ink" argues for state visibility as a first-class design constraint. Emil Kowalski's Sonner API encodes the principle structurally: `toast.promise()` requires all three lifecycle states. The error path is not optional; it is a required parameter.

## Register sensitivity

**`brand`** ... narrow scope. Applies to email capture, plan selection on pricing, any form that bounces users into the product. "You've been subscribed!" with no unsubscribe path is 🟡 DRIFT. On most brand surfaces, this principle is 🟢 opportunity at most.

**`product`** ... everywhere. Optimistic UI without error path is 🔴 BREAK. Form submission without draft preservation is 🔴 BREAK on long forms. Toast "Saved" without an undo affordance is 🟡 DRIFT at minimum, 🔴 for destructive operations. Subscription/purchase flows without reversibility at each stage are 🔴 BREAK.

**Common ground** ... silent rollback (the app quietly undoes your optimistic action without telling you) is 🔴 BREAK in both registers. A "permanent" action like delete without confirmation or undo is 🔴 in both.

## Tactics

- Use `toast.promise()` rather than separate `toast.success()` calls. The API structure forces you to define the error path before you can ship.
- In every `catch` block corresponding to a `toast.success()` in the `try` block, add `toast.error()`. The error path should have the same design attention as the success path.
- Never ship optimistic UI without a rollback path that surfaces something to the user. Silent rollback erodes trust silently.
- Delete confirmation dialogs must name what is being deleted. "Are you sure?" is a ritual. "Delete 'Q4 Sales Report'?" is a confirmation.

## Anti-patterns

- **"Saved!" toast with no failure variant:** Success fires; catch is empty. The user's data may be lost. The interface shows nothing.
- **Silent optimistic rollback:** The change appears, then disappears, with no explanation. "Did it work? Should I try again?"
- **Submit button stuck in spinner:** The operation failed but the button never leaves loading state. The user waits. Then refreshes. Then maybe runs the action twice.
- **Missing loading state:** Action fires, nothing visible happens, result appears. The gulf of evaluation is open; the user clicks again.

## Exemplars

- **Sonner `toast.promise()`:** One call, three required states. Loading, success, and error are designed together or not at all. The API enforces the principle.
- **Sonner enter/exit physics:** The toast does not just convey content... the spring on enter communicates arrival with appropriate mass for a transient notification.

## Further study

- Emil Kowalski, "Building a Toast Component" (emilkowal.ski) ... the Sonner design story, including why the promise API was structured this way
- Bret Victor, "Magic Ink" (worrydream.com) ... the case for state visibility as a first-class design constraint
