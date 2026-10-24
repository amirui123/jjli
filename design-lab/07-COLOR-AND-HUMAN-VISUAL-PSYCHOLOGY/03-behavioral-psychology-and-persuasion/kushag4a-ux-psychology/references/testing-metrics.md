# Testing & Metrics Reference

Every audit ends with recommendations that are, at bottom, predictions about human behavior made without access to real usage data. This file governs how to frame those predictions honestly and how to point the user toward what would actually validate them.

## The framing rule

Never write a recommendation as if it's guaranteed to work. Behavioral principles predict *tendencies* across populations, not certainties for a specific product's specific users. Use language like:

- "This is expected to reduce X" -- not "this will increase conversion by Y%."
- "Worth testing: ..." -- not "this fixes the problem."
- If you don't have a number and don't have a way to get one from the material provided, don't invent one. Ever.

## What to recommend measuring, by flow type

**Signup / account creation:** signup completion rate, time-to-complete, field-level abandonment (which field people quit on, if instrumented), time-to-first-value after signup.

**Onboarding:** checklist/step completion rate, time to first meaningful action, drop-off point in the sequence, activation rate (whatever "activated" means for this specific product).

**Checkout:** cart-to-purchase completion rate, step-level abandonment in a multi-step checkout, time spent on the pricing/plan-selection step, use of discount/promo fields (a proxy for price sensitivity or friction).

**Pricing pages:** click-through rate per tier, time spent before selecting a tier, upgrade/downgrade rate after launch of a pricing change.

**Dashboards / core product screens:** task completion rate for the primary job-to-be-done on that screen, feature discovery rate for less obvious functionality, error rate on primary actions.

**Notifications / upgrade prompts:** interaction rate (click/dismiss), rate of the prompt reappearing being seen as helpful vs. annoying (often only knowable via support tickets or direct user feedback, not just click data).

## How to write a testing recommendation

Pattern:

```
Hypothesis: <what you expect to change and why, tied to the principle>
What to measure: <the specific metric(s) from the list above or a close analog>
How to test: <A/B test, moderated usability session, or simple before/after if traffic is too low for a controlled test>
```

Example:
```
Hypothesis: Making the "3 of 7 steps complete" progress visible on the onboarding checklist will increase the rate at which users complete the remaining steps, per the Goal-Gradient effect.
What to measure: Checklist completion rate, and time between steps 3 and 7.
How to test: A/B test the visible-progress version against the current hidden-progress version for at least one full onboarding cohort cycle.
```

## Don't do this

- Don't claim a specific percentage lift ("this will improve conversion by 15%") -- you have no basis for a number.
- Don't cite invented studies or generic "research shows..." claims not tied to the specific principle being discussed in `psychology-principles.md`.
- Don't recommend testing something so obviously correct (fixing a broken button) that testing it would waste the team's time -- reserve "worth testing" framing for genuinely uncertain behavioral bets, and just recommend the fix outright for clear defects.
