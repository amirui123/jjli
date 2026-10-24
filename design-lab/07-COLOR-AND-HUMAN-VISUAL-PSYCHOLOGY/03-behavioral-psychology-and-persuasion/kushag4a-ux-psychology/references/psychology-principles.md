# Psychology Principles Reference

Deep-dive diagnostic guidance for each of the six core principles. Read the relevant section(s) when scoring the Psychology Scorecard or writing findings tied to a specific principle. Each section gives: what to look for, diagnostic questions, PASS/MINOR/MAJOR examples, and before/after copy patterns.

## Contents
1. Smart Defaults / Decision Fatigue
2. Goal-Gradient Effect
3. Reciprocity
4. Endowment Effect + IKEA Effect
5. Loss Aversion
6. Contrast Effect / Anchoring

---

## 1. Smart Defaults / Decision Fatigue

**The mechanism:** Every decision a person makes consumes limited mental energy. An interface that forces many small, low-value decisions before letting the user reach their actual goal increases abandonment and errors -- not because the user is lazy, but because attention is finite.

**Look for:**
- How many fields/choices/toggles are presented at once, and how many of them are genuinely necessary right now vs. deferrable.
- Whether common, safe options are pre-selected (units, region, plan tier, notification settings) rather than left blank or "Select one."
- Whether the primary path through a form or flow is obvious, or whether every field looks equally important.
- Whether the CTA label tells the user what will happen ("Start free trial") vs. a generic verb ("Submit", "Continue").
- Whether the user is asked to make the same kind of decision repeatedly when it could be inferred or remembered (e.g., re-entering a shipping address they just used).

**Diagnostic question:** "Could this screen do useful work on the user's behalf and just let them review/adjust, instead of making them build the answer from a blank slate?"

**PASS example:** A checkout pre-fills country/currency from locale, pre-selects the most common shipping option, and leaves only genuinely personal fields (card number, address) for the user to enter.

**MINOR example:** A settings page has a sensible default already, but the "recommended" option isn't visually distinguished from four other equally-weighted choices, so users still have to read all five to feel confident.

**MAJOR example:** A 12-field signup form presents every field as equally required and equally weighted, with no default plan/tier/region pre-selected, no indication of which fields are optional, and a generic "Submit" button that doesn't say what submitting does.

**Copy/interaction pattern:**
- Before: A blank multi-select with no option pre-checked and the label "Choose your preferences."
- After: The most common combination is pre-selected with a visible "Customize" link/toggle for users who want something different. Label becomes "We've set this up for most people -- adjust anything you'd like."

**Guardrail:** A default is only a "smart" default if it serves the user's own interest (fewer clicks to their goal, safer settings, etc.). A pre-checked box that opts the user into marketing email, data sharing, or an upsell is not a smart default -- it's a dark pattern (see `ethical-ux.md`). When recommending a new default, explicitly note that it's a hypothesis about the common case unless the user has told you it's backed by real usage data.

---

## 2. Goal-Gradient Effect

**The mechanism:** Motivation to finish a task increases as people perceive themselves getting closer to the goal. Interfaces that make real progress *visible* increase completion; interfaces that hide progress or make users feel like they're starting over reduce it.

**Look for:**
- Progress bars, step counters ("Step 2 of 4"), checklists, or percentage-complete indicators, and whether they're accurate.
- Whether already-completed work is acknowledged (e.g., "3 of 7 done") rather than only showing what's left.
- Whether a multi-step flow shows the user how many steps remain, or leaves them guessing.
- Whether returning users are shown their prior progress or forced to restart.
- Whether the *first* step of a flow is trivially easy (a well-known technique for triggering the effect honestly) -- this is fine as long as it's a real, useful step and not a fake "step 1 of 1."

**Diagnostic question:** "Does this interface make real progress visible and meaningful, without fabricating any of it?"

**PASS example:** An onboarding checklist shows "3/5 complete" with the two remaining items visibly clickable, and the completed items show a genuine checkmark tied to something the user actually did.

**MINOR example:** A multi-step form shows step numbers but not how many total steps exist ("Step 3" with no "of N"), leaving users unsure how much is left.

**MAJOR example:** A progress bar animates forward on page load regardless of actual completion, or a "5 steps to get started" checklist always shows all 5 as incomplete even after the user finishes them, effectively punishing progress instead of rewarding it.

**Copy/interaction pattern:**
- Before: "Here are 7 things you still need to do."
- After (only if true): "You've completed 3 of 7 -- here's what's left." Never write this unless completion is genuinely tracked and accurate.

**Guardrail:** Never recommend a progress indicator that isn't tied to real state. A fake progress bar is one of the most common dark patterns in onboarding and checkout flows -- flag it per `ethical-ux.md` if you see one already in place.

---

## 3. Reciprocity

**The mechanism:** People are more willing to commit (sign up, pay, share data) after they've already received something of value. Asking for commitment *before* demonstrating value raises the perceived risk of the ask.

**Look for:**
- Whether the user can preview, sample, or try the core value of the product before being asked to create an account or pay.
- Where exactly the signup/paywall/personal-data request sits relative to the point where value is demonstrated.
- Whether onboarding gives the user something useful early (a real insight, a completed first task, a personalized result) rather than just collecting information about them.
- Whether "free" trials/demos genuinely show the real product, or a crippled version that doesn't actually demonstrate value.

**Diagnostic question:** "What has the product given the user before it asks them for something back?"

**PASS example:** A tool lets the user paste in real data and see a real analysis result before asking them to create an account to save or export it.

**MINOR example:** The product shows value fairly early, but the signup wall appears one step before the user can see their *own* personalized result, creating unnecessary friction right at the point of highest interest.

**MAJOR example:** The user must create a full account (email, password, phone verification) before they can interact with the product at all, with no preview, sample, or explanation of what they'll get.

**Copy/interaction pattern:**
- Before: A landing page CTA reads "Create Account" as the only way to see what the product does.
- After: "Try it now" leads to a real, limited interaction (e.g., one free analysis), and the signup ask appears once the user has seen something worth saving: "Create an account to save this."

**Guardrail:** Don't recommend "give away more for free" as a purely tactical conversion trick if it isn't actually true value -- reciprocity requires the free thing to be genuinely useful, not a teaser designed to feel valuable while withholding the real function. And don't recommend hiding pricing or terms behind the free value as a bait-and-switch -- that crosses into deception.

---

## 4. Endowment Effect + IKEA Effect

**The mechanism:** People assign more value to things they've configured, built, or personalized -- and to things that already reflect their own identity or effort -- than to generic, off-the-shelf equivalents.

**Look for:**
- Opportunities for the user to name, customize, arrange, or configure part of their experience early on.
- Whether the product reflects the user's own data/input back to them (their name, their content, their choices) rather than staying generic.
- Whether users can build something small and real quickly (a first project, a first playlist, a first dashboard widget) rather than facing an empty, generic shell.
- Whether personalization feels optional and low-effort, not like a mandatory setup wizard.

**Diagnostic question:** "Does the product start to feel like it belongs to this specific user, or does it feel like a generic template no matter what they do?"

**PASS example:** A dashboard tool lets a new user rename their first project and pick a color/icon for it in a few seconds, and that project appears immediately, personalized, in their workspace.

**MINOR example:** Personalization options exist but are buried in settings rather than surfaced during onboarding, so most users never discover them and never build the sense of ownership they could.

**MAJOR example:** The product gives every new user an identical, ungendered, unnamed default state with no invitation to personalize anything before asking them to commit (pay, invite teammates, etc.), so there's nothing yet that feels like "theirs."

**Copy/interaction pattern:**
- Before: A new workspace is created silently with the name "Untitled Project."
- After: "What should we call your first project?" with a single quick input, immediately reflected in the UI.

**Guardrail:** Do not manufacture busywork (mandatory multi-screen setup wizards, forced customization before any value is shown) purely to trigger investment -- that inverts the principle into friction. Personalization should be an *opportunity*, not a toll.

---

## 5. Loss Aversion

**The mechanism:** People weigh potential losses more heavily than equivalent gains. Messaging that clearly and truthfully explains what a user stands to lose by not acting can be more motivating than messaging about what they'd gain -- but only when the loss is real.

**Look for:**
- Messaging about expiring content, unsaved work, lapsing access, or missed real deadlines -- and whether these are actually true.
- Whether "you'll lose X" framing describes something real and specific, or is vague/exaggerated.
- Countdown timers, "only N left," or "offer ends soon" messaging, and whether the underlying scarcity/deadline is genuine.
- Cancellation and downgrade flows: do they honestly state what capability/data the user will lose, without exaggerating or scaring?

**Diagnostic question:** "Is this a real consequence of the user's inaction, or a fabricated one designed purely to create pressure?"

**PASS example:** A subscription cancellation flow states plainly: "You'll keep access until March 3rd. After that, your saved reports will no longer be available for export." (True, specific, calm.)

**MINOR example:** A "your trial ends in 3 days" banner is accurate but vague about the actual consequence -- it doesn't say what specifically will stop working, leaving the user to guess and possibly panic-cancel or panic-ignore.

**MAJOR example:** A countdown timer resets every time the page is reloaded, or "only 2 left in stock" displays regardless of actual inventory, or a generic "don't lose your progress!" banner appears on a screen where nothing is actually at risk of being lost.

**Copy/interaction pattern:**
- Before: A fabricated "Offer ends in 09:58!" countdown with no real expiration behind it.
- After (only if true): "This plan price is available through the end of your trial (March 3rd)." State the real mechanism plainly.

**Guardrail:** This is the principle most prone to abuse. Never propose inventing a deadline, stock count, or consequence that doesn't exist. If you're recommending loss-aversion framing, you must be able to point to what the real, specific, verifiable loss is -- if you can't, don't use this pattern, use factual information instead.

---

## 6. Contrast Effect / Anchoring

**The mechanism:** People judge a number or option relative to whatever they saw immediately before it, not in isolation. Thoughtful sequencing and framing of options can make a choice easier to evaluate honestly; misleading sequencing can make a bad deal look good.

**Look for:**
- The order and framing of pricing tiers -- is there a reference point (e.g., a recommended middle tier, a per-month breakdown of an annual price) that helps users evaluate the real offer?
- Before/after comparisons -- are the "before" numbers real and representative?
- Feature comparison tables -- do they fairly represent what's actually excluded, or do they exaggerate the gap to make upgrading look necessary?
- "Was $X, now $Y" pricing -- was the item genuinely offered at $X for a meaningful period, or is $X an inflated reference invented for the sale?

**Diagnostic question:** "What does the user see right before this number, and does that context make the offer easier to honestly understand -- or does it distort it?"

**PASS example:** A three-tier pricing page shows the middle tier as "Most popular" with per-month equivalent pricing shown next to the annual price, helping users compare like-for-like.

**MINOR example:** Pricing tiers are shown with no recommended option and no per-month breakdown on the annual plan, forcing users to do the math themselves -- not deceptive, just a missed opportunity for clarity.

**MAJOR example:** A "was $199, now $49" banner where the item was never actually sold at $199, or a feature comparison table that lists a competitor's plan without noting a materially equivalent feature it actually has, making the gap look bigger than it is.

**Copy/interaction pattern:**
- Before: Three pricing tiers listed with no distinguishing visual weight or annotation.
- After: The tier best suited to the most common use case is marked "Recommended," with monthly-equivalent pricing shown for annual plans so the numbers are directly comparable.

**Guardrail:** An anchor must be a truthful reference point. Never recommend an inflated "original price," a misleading feature-gap comparison, or a comparison to an unrepresentative competitor plan. The goal is helping users understand a real number in context, not making a mediocre offer look better than it is.
