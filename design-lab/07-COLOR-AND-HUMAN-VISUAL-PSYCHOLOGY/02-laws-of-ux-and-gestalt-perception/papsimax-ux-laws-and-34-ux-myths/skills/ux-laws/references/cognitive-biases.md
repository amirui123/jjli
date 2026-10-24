# Cognitive Biases Relevant to Interface Design

*Drawn from the behavioral psychology and behavioral economics literature (e.g. Daniel Kahneman, Amos Tversky, Richard Thaler), as applied to interface and product design.*

These biases mainly illuminate decision/conversion flows and message/microcopy writing. Use them with care and transparency: naming them serves to understand and design honestly, not to manipulate users against their own interest (dark patterns).

## Anchoring
**Definition**: the first piece of information received serves as a reference point for judging everything that follows.
**Implication**: the display order of prices or options influences the perceived value of the ones that follow.
**Example**: showing the higher "crossed-out" price first before the discounted price, to anchor the perception of a good deal.

## Loss Aversion
**Definition**: a potential loss weighs psychologically heavier than an equivalent gain.
**Implication**: framing in terms of "what the user loses by not acting" can be more compelling than "what they gain", to be used honestly (no false urgency).
**Example**: "You have 2 days left before losing access to your data" rather than a plain, neutral expiration date.

## Choice Paradox (Choice Overload)
**Definition**: beyond a certain number of options, satisfaction and decision-making ability decrease instead of increasing.
**Implication**: worth pairing with Hick's Law, limit and prioritize options, offer a "recommended" default selection.
**Example**: a list of 50 search filters overwhelming the user, rather than 5 main filters plus a collapsed "more filters."

## Default Effect
**Definition**: users tend to keep the pre-selected option rather than actively changing it.
**Implication**: the default choice carries enormous weight on actual behavior, set it ethically, aligned with the user's interest, not just the product's.
**Example**: a marketing-communications consent checkbox unchecked by default rather than checked.

## IKEA Effect
**Definition**: people value something more when they've invested their own effort in it (time, personalization, building).
**Implication**: involving the user in building their experience (profile personalization, initial setup) increases their attachment to the product.
**Example**: an onboarding flow that has the user pick their interests before showing them a personalized feed.

## Confirmation Bias
**Definition**: a tendency to favor information that confirms what one already believes.
**Implication**: in user testing or product data analysis, be wary of interpreting feedback in a way that confirms a design decision already made.
**Example**: dismissing an isolated negative user comment because it contradicts the team's starting hypothesis.

## Framing Effect
**Definition**: the same information, presented differently, leads to different decisions.
**Implication**: the wording of a message (positive vs. negative, gain vs. loss) changes perception without changing the facts, use it to clarify, not to mislead.
**Example**: "95% of our servers are operational" perceived more positively than "5% of our servers are down," for the same underlying reality.

## Social Proof
**Definition**: people rely on others' behavior to judge what's good or correct to do, especially under uncertainty.
**Implication**: displaying authentic social indicators (reviews, user counts, badges) reinforces trust in a decision.
**Example**: "Chosen by 10,000 teams" next to an offer, if the figure is real and verifiable.

## Scarcity
**Definition**: a resource perceived as limited in quantity or time is perceived as more desirable.
**Implication**: handle with strict honesty, false urgency ("only 2 spots left" on an endless loop) is a dark pattern that erodes trust over time.
**Example**: showing a genuinely limited remaining stock on a product page, only when it's verifiable and true.

## Curse of Knowledge
**Definition**: someone who is an expert on a subject struggles to imagine the perspective of someone unfamiliar with it.
**Implication**: designers and developers often overestimate what a new user intuitively understands, testing with real novices remains irreplaceable.
**Example**: internal business jargon used in an interface label, obvious to the product team but opaque to the end user.
