# Principle 1 ... Honest motion

> Good design is honest.
> ... Dieter Rams, principle 6

## What it means

If you animate something, the animation must communicate information the static state could not. Motion that performs quality without doing informational work is decoration that moves, which is worse than decoration that doesn't. Remove any animation where its absence costs the user no understanding.

## Why it matters

The pre-HCI source is Ollie Johnston and Frank Thomas's *The Illusion of Life* (1981). Their 12 animation principles were derived empirically from the problem of making motion feel physically real... not aesthetically pleasing, physically honest. The underlying claim is that motion must communicate something true about the thing it depicts. When Emil Kowalski and Rauno Freiberg write about motion, they are writing in a vocabulary Johnston and Thomas named. Rams's principle 6 extends this to design ethics: design cannot misrepresent its purpose or capabilities. Don Norman's feedback model extends it to interfaces: the system must communicate what happened, and motion is one of the strongest signals it can send. When motion is used decoratively, it occupies the same channel as meaningful feedback and degrades that channel. Emil Kowalski's essay "You Don't Need Animations" makes the modern case explicitly: each animation is a claim, and the claim must be true.

## Register sensitivity

**`brand`** ... motion on brand surfaces often has expressive value the static state truly couldn't carry. Scroll-driven reveals, parallax, hero transitions can be honest when they establish register ("this is editorial, this is ambitious") or when they pace reading. Decorative motion still fires when it's genuinely pure ornament (a loop animation that never stops, a "floating element" that floats for no reason), but the bar is lower.

**`product`** ... motion is a state-change language. Every animation must communicate something the static state didn't. A 200ms fade on a static element is a 🔴 BREAK in product. A hover decoration that animates for its own sake is a 🔴 BREAK. The bar is high.

**Common ground** ... reduced-motion preferences must be respected in both registers. Loop animations with no purpose fire in both registers. A single static element with a .5-second delay to "feel alive" fires in both.

## Tactics

- For each animation in a component, state what the user learns from it. If the answer is empty, remove the animation.
- Reserve entrance animations for content that loads asynchronously or appears in response to a user action. Static content has nothing to announce.
- Use motion to signal state transitions: loading to success, selected to deselected, empty to populated. These have information the static frame cannot show.
- Apply Kowalski's test before shipping: "Does the user need this animation to understand what just happened?" If no, cut.

## Anti-patterns

- **Decorative page-load fade:** Page content fades in on every load regardless of whether the user navigated. The motion communicates nothing; the content was always going to be there.
- **Pulse on a static badge:** A notification dot that pulses when there are no new notifications. The signal says "something is happening." The data says nothing is. The animation is a lie.
- **Animated counter from zero:** A number that counts up from zero to its real value on render. The number was fetched; it is known. The animation performs computation it is not doing.

## Exemplars

- **Sonner toast lifecycle:** Loading, success, and error each have distinct motion. Remove any one of them and you lose the state signal, not just polish. The animation is the feedback.
- **NotBoring Habits:** The completion animation communicates "you did the thing" without performing celebration as a proxy for quality. Motion appetite is high; honesty is intact.

## Further study

- Ollie Johnston and Frank Thomas, *The Illusion of Life: Disney Animation* (1981) ... the Layer 0 source; the 12 animation principles, derived from physical honesty, establish the vocabulary for why motion must communicate something true
- Emil Kowalski, "You Don't Need Animations" (emilkowal.ski) ... the primary case for motion as a citable claim
- Dieter Rams, principle 6 in *Less and More: The Design Ethos of Dieter Rams* (Klemp & Ueki-Polet, 2009)
