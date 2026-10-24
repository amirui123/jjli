# UX Microcopy Craft

Read this whenever the task involves interface copy: buttons, errors, empty states, forms, notifications, onboarding, tooltips, or reviewing copy across a user journey. Combine with the voice profile and the hard rules in SKILL.md.

## Contents

1. Universal principles
2. Buttons and CTAs
3. Error messages
4. Empty states
5. Confirmations and destructive actions
6. Forms, labels, and help text
7. Notifications
8. Onboarding and tooltips
9. Accessibility and plain language
10. Localization-readiness
11. Inclusive language
12. Regulated copy (financial, insurance, legal)
13. Review checklist for journeys

---

## 1. Universal principles

- **Front-load the keyword.** Users scan; the first word or two does most of the work. "Payment failed: card expired", not "There was a problem and unfortunately your payment could not be processed."
- **One idea per sentence.** Interface copy is read under stress or in motion.
- **Specific beats friendly.** "Saved to Drafts" beats "All done!".
- **Character economy.** Every word must earn its place, but never at the cost of clarity. Cutting "your" can make copy colder; judge case by case.
- **Terminology consistency.** One name per concept across the whole journey. If it's "policy" on screen one, it isn't "plan" on screen three. In review mode, build a quick term inventory and flag drift.
- **Match the moment.** Celebrate sparingly and only at genuine wins. Never be playful in error, payment, or legal moments.

## 2. Buttons and CTAs

- Start with a verb and name the action's object: "Save changes", "Add insurance", "Download report". Avoid bare "Submit", "OK", "Yes", "Click here".
- The label should make sense out of context (this also serves screen reader users jumping between controls).
- Pair buttons honestly. The safe option and the committing option should be unambiguous: "Cancel" / "Delete project", not "Cancel" / "OK".
- Never use the same verb for two different actions on one screen.
- For opt-in choices (consent, insurance, marketing), the two options must be parallel and neutral in weight: "Add insurance" / "Continue without insurance". No guilt framing ("No thanks, I like risk"). Confirmshaming is a dark pattern; refuse to write it and say why.

## 3. Error messages

Every error answers three questions, in order:

1. **What happened** (plainly, no codes as the headline)
2. **Why**, if the user can act on the why
3. **What to do next** (a specific action, ideally a button)

Rules:

- Never blame the user. "That email doesn't look right" not "You entered an invalid email."
- Never say just "An error occurred" or "Something went wrong" if you know more. If you genuinely know nothing, give a retry path and a support route.
- No humour in errors involving money, data loss, or security.
- Keep error codes available but secondary (for support), never as the message.
- Inline validation errors sit next to the field, name the fix, and clear when resolved.

## 4. Empty states

An empty state is an onboarding moment, not a dead end. Include:

- What this space is for, in one line
- The first action to take, as a button
- Optionally, what it will look like once populated

Distinguish three cases and write them differently: first use (teach), cleared by user (acknowledge: "All caught up"), and no results from a search or filter (offer to adjust: "No policies match these filters. Clear filters?").

## 5. Confirmations and destructive actions

- State the consequence, not just the action: "Delete this draft? You can't undo this."
- The confirm button repeats the verb: "Delete draft", never "Yes".
- Reserve confirmation dialogs for genuinely destructive or costly actions; everything else gets undo instead.
- Success confirmations: short, specific, and quiet. "Application submitted. We'll email you within 2 working days."

## 6. Forms, labels, and help text

- Labels above fields, short, no colons needed.
- Placeholder text is not a label and disappears on focus; never put required information only in a placeholder.
- Help text answers the question the user actually has ("Why do you need this?"), especially for sensitive fields. For financial products, explain data use plainly.
- Mark optional fields as optional rather than marking required with asterisks, where the design allows.
- Ask for things in the order people expect to give them.

## 7. Notifications

- Lead with the change: "Your statement is ready", not "We are pleased to inform you that..."
- Make it actionable or don't send it.
- Respect tone gravity: a payment failure push notification is calm and concrete, never alarming.

## 8. Onboarding and tooltips

- One concept per step. If a tooltip needs two sentences, the UI probably needs work; say so in review mode.
- Show value before asking for effort or permissions.
- Tooltips describe what something does, not what it is called.

## 9. Accessibility and plain language

- **Reading level**: aim for roughly age 9 to 11 comprehension (plain English) for interface copy and customer-facing content. Shorter words, shorter sentences, active voice.
- **Link and button text must describe the destination or action.** Never "Learn more", "Click here", or "Read more" alone; screen reader users navigate by pulling up a list of links out of context. "Learn how repayments work" works; "Learn more" doesn't.
- **Don't rely on sensory or positional language**: "the button below", "the green icon". Name the control.
- **Headings must describe their section** so screen reader users can navigate by heading.
- **Alt text** describes function and content, not appearance for its own sake; decorative images get empty alt.
- Avoid conveying meaning by formatting alone (bold, colour) without words.

## 10. Localization-readiness

- Avoid idioms, puns, and cultural references in interface copy; they break in translation. "Hit the ground running" does not survive Bulgarian.
- Avoid concatenated strings that assume English word order.
- Leave room: translated strings run 20 to 40 percent longer than English. Flag tight character counts.
- Use unambiguous date formats in copy examples (12 June 2026, not 6/12/26).
- British English by default per SKILL.md, unless the product locale differs.

## 11. Inclusive language

- "They" as the default singular pronoun.
- Plain, person-first or identity-respecting language; avoid ableist idioms ("sanity check", "blind spot" used carelessly, "crippled by").
- Avoid gendered defaults in examples and avatars-in-text ("the user... he").
- Examples and names in copy should not all be Anglophone.

## 12. Regulated copy (financial, insurance, legal)

For banking, insurance, credit, and similar products:

- Never silently rewrite disclosures, terms, consent wording, APR statements, risk warnings, or anything that reads as legally mandated. Per SKILL.md rule 3: suggest plain-language alternatives alongside the original, clearly labelled as suggestions requiring compliance review.
- Consent and opt-in copy must be unambiguous, affirmative, and free of pre-selection language. The user must understand what they are agreeing to, what it costs, and how to decline with equal ease.
- Avoid implying outcomes ("get approved in minutes") unless the claim is verified.
- When reviewing a journey for a regulated product, flag dark patterns explicitly: confirmshaming, hidden costs, weighted button hierarchy on consent choices, pre-ticked boxes.

## 13. Review checklist for journeys

When pointed at a flow or a set of screens, check in this order:

1. Terminology consistency across all screens
2. Every button: verb-first, specific, honest pairing
3. Every error: what/why/next, no blame
4. Scannability: front-loaded keywords, one idea per sentence
5. Accessibility: link text, heading clarity, no sensory-only references
6. Tone gravity matched to each moment
7. Locale consistency
8. Regulated copy flagged, not rewritten
9. Final scan pass from SKILL.md (em dashes, AI tells)

Present findings as: severity-ordered issues with screen reference, the current copy, the suggested copy, and a one-line rationale for each.
