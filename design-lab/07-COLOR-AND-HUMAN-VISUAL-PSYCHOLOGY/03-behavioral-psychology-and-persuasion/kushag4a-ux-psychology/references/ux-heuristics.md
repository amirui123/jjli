# UX Heuristics Reference

General usability analysis to run alongside the six psychology principles. These are conventional UX heuristics (adapted from Nielsen's usability heuristics and standard cognitive-load/accessibility practice) -- use them to catch issues that aren't specifically about the six behavioral principles but still matter for the audit.

## Contents
1. Visual & information hierarchy
2. Cognitive load
3. Discoverability & affordance
4. Consistency & terminology
5. Feedback & system status
6. Error prevention & recovery
7. Accessibility
8. Mobile & responsive behavior
9. Trust & perceived control
10. Task continuity & abandonment risk

---

## 1. Visual & information hierarchy

Ask: if the user glances at this screen for two seconds, what do they understand? The most important element (primary action, key number, main message) should be the most visually dominant one -- not necessarily the biggest, but the one that draws the eye first through size, contrast, position, or whitespace.

Watch for: multiple elements competing for primary visual weight (two buttons that look equally important when only one should be primary), important information buried below less important information, or decorative elements outranking functional ones.

A screen can be aesthetically polished and still fail this -- beauty and hierarchy are different axes. Evaluate them separately.

## 2. Cognitive load

How much does the user have to hold in their head at once to complete the task? Count genuinely: number of visible fields, number of simultaneous decisions, amount of text that must be read before acting, number of unfamiliar terms or icons without labels.

Progressive disclosure (showing advanced options only when requested) is usually a load-reducer; cramming everything onto one screen "for transparency" usually isn't, unless the user genuinely needs to see it all at once to decide.

## 3. Discoverability & affordance

Can the user tell what's clickable, draggable, expandable, or editable without trial and error? Look for: buttons that don't look like buttons, links that look like plain text, icons with no label and no obvious universal meaning, hidden functionality that's only reachable via a gesture or hover with no visible hint.

Affordance problems are especially costly on primary paths (the thing most users need to do) and more tolerable on rarely-used secondary features.

## 4. Consistency & terminology

Does the same concept use the same word and the same visual treatment everywhere in the flow? Inconsistent terminology ("Workspace" on one screen, "Project" on another, referring to the same thing) forces the user to re-verify they're in the right place. Inconsistent button styles/positions (primary action on the right on one screen, left on the next) slow down every subsequent screen in the flow.

## 5. Feedback & system status

Does the interface tell the user what just happened, what's happening now, and what will happen next? Look for: actions with no visible confirmation (did that save?), loading states with no indicator, and destructive or important actions with no acknowledgment after they complete.

This overlaps with the Goal-Gradient principle for multi-step flows, but applies just as much to single actions (button clicks, saves, submissions).

## 6. Error prevention & recovery

Prevention: can the interface stop likely mistakes before they happen (input masks, inline validation, disabled states, confirmation for destructive actions) rather than only catching them after submission?

Recovery: when an error does occur, is the message specific and actionable ("Email must include an @ symbol") rather than generic ("Invalid input")? Is the user's other input preserved, or do they have to redo the whole form because of one field?

## 7. Accessibility

From a screenshot or code, you can often assess: color contrast (is text readable against its background?), whether interactive elements appear large enough to tap reliably, whether color is the *only* signal for important information (e.g., error states shown only in red with no icon or text), and whether form fields have visible labels (not just placeholder text that disappears on focus, which harms usability for many users).

If code is available, also check for missing alt text, missing form labels/aria attributes, and heading structure -- but don't claim to have run a full accessibility audit tool; frame these as observations, not a certified compliance check.

## 8. Mobile & responsive behavior

Where a mobile screenshot or responsive code is provided: are tap targets large enough, is text legible without zooming, does content reflow sensibly rather than requiring horizontal scrolling, and are multi-column desktop layouts appropriately simplified rather than just shrunk?

Don't assume desktop-only screenshots have responsive problems -- only comment on responsive behavior when you can actually observe or infer it (e.g., from code breakpoints).

## 9. Trust & perceived control

Does the user feel like they understand and control what's about to happen, especially before payment, data sharing, or irreversible actions? Look for: unclear pricing before checkout, unclear data usage before a permission request, destructive actions with no undo or confirmation, and any point where the user might reasonably wonder "wait, what did I just agree to?"

This is closely related to Reciprocity and Loss Aversion but focuses specifically on the moment of commitment rather than the lead-up to it.

## 10. Task continuity & abandonment risk

Across a flow, ask where a real user is most likely to give up, and why: a field they don't have the answer to on hand, a moment of unclear value, an unexpected requirement (e.g., asking for a credit card before a "free" trial actually starts), or simply fatigue from too many steps.

Naming the single highest-abandonment-risk point in a flow (rather than treating every screen as equally risky) is one of the most useful things this audit can do -- it tells the user where to focus first.
