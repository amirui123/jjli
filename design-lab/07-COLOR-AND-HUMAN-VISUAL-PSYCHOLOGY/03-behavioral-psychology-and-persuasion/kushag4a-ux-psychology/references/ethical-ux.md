# Ethical UX Reference

This file exists because behavioral psychology is dual-use: the same mechanisms that make a product clearer and more trustworthy can be twisted to manipulate. This skill's entire value depends on staying on the right side of that line, and on catching it explicitly when the interface being audited doesn't. Read this before finalizing any audit that touches pricing, cancellation, consent, urgency, defaults, or subscriptions.

## The core distinction

**Ethical use of psychology:** helps the user make a decision they'd make anyway, faster and with less friction, with full and truthful information.

**Dark pattern:** exploits a cognitive bias to get the user to do something they would *not* do with full information and low friction -- by hiding information, fabricating urgency/scarcity, adding friction asymmetrically (easy to opt in, hard to opt out), or using confusing language.

A simple test for any recommendation you're about to make: **if the user fully understood the mechanism you're using, would they still be glad you used it?** If yes, it's very likely fine. If the answer depends on the user *not* noticing what's happening, it's a dark pattern -- don't recommend it, and flag it if you see it already in place.

## Dark pattern catalog

For each, the pattern, why it works, and what to say when you flag it.

**Fake scarcity** -- "Only 2 left!" / "37 people are viewing this" when the number isn't real or isn't actually tied to inventory/interest. Flag: "This scarcity indicator can't be verified as accurate from what's provided; if it isn't tied to real, live data, it should be removed or replaced with truthful information (or nothing)."

**Fake urgency** -- Countdown timers that reset on refresh, "sale ends tonight" that recurs every night, deadlines with no real consequence behind them. Flag: "This countdown appears to create pressure without a real deadline behind it. Recommend removing it or replacing it with the real timeline if one exists."

**Fake progress** -- Progress bars or step counts that don't reflect real state (e.g., always shows "80% complete" regardless of actual completion, common in some signup flows to reduce perceived remaining effort). Flag as a MAJOR issue under Goal-Gradient, and explicitly note it's a fabrication, not just an inaccuracy.

**Fake social proof** -- Testimonials, review counts, or "X people just bought this" that can't be verified or that recur identically for every visitor regardless of real activity. Flag if this is evident from the material provided (e.g., a static "14 people bought this in the last hour" with no real-time mechanism visible in code).

**Deceptive/pre-checked defaults** -- A pre-selected option that benefits the business at the user's expense (opted into marketing email, a paid add-on pre-added to a cart, data sharing pre-enabled) presented as if it were neutral. This is different from a *smart* default (see `psychology-principles.md`), which should benefit the user. Flag it as a violation of Smart Defaults, not an example of it.

**Hidden fees** -- Costs that appear only at the final step of checkout rather than being shown up front. Flag under both Reciprocity/Trust and Contrast/Anchoring -- the user anchored on a price that wasn't the real price.

**Forced consent / forced continuity** -- Requiring agreement to unrelated terms to proceed, or converting a "free trial" into a paid subscription without a clear, prior, explicit heads-up and an easy way to avoid the charge. Flag explicitly and recommend a clear pre-charge notice and an easy way to cancel before being billed.

**Confusing or asymmetric opt-out** -- Signing up is one click; canceling requires a phone call, multiple confirmation screens, or is deliberately hard to find. Flag as a MAJOR issue regardless of how polished the rest of the product is -- asymmetric friction between opt-in and opt-out is one of the clearest dark pattern signals there is.

**Misleading CTA wording** -- A "No thanks" link phrased to shame or confuse ("No, I don't want to save money"), or a button that doesn't do what it says. Flag and propose neutral, honest wording for both options.

**Trick questions / double negatives** -- Checkbox language designed to be misread ("Uncheck this box if you don't want to not receive emails"). Flag and propose a single, plain affirmative statement instead.

## How to write the flag in the report

When you identify a dark pattern in the interface being audited, don't soften it into a generic "minor improvement." State plainly:
1. What the pattern is and where it appears.
2. Why it qualifies as manipulative rather than merely suboptimal (tie it to the "would the user be glad if they understood this?" test).
3. The honest alternative -- what the interface should do instead if the underlying goal (get more signups, reduce cancellations, sell the upgrade) is itself legitimate, which it usually is. The fix is almost always "be truthful and reduce friction asymmetry," not "abandon the business goal."

Dark pattern findings are always at least MAJOR severity, since trust damage compounds and regulatory/reputational risk is real -- but they aren't about pearl-clutching; keep the tone factual and constructive, matching the rest of the report.

## What this skill will never recommend, regardless of what the user asks for

If a user explicitly asks for help making a dark pattern more effective (e.g., "make the cancel button harder to find," "make this countdown timer feel more urgent even though it's not real"), don't comply. Explain briefly why, and offer the ethical alternative that serves the same underlying business goal instead (e.g., a genuinely compelling reason to stay, rather than an obstructed exit).
