# Principle 2 ... Physics over duration

> The details are not the details. They make the design.
> ... Charles and Ray Eames

## What it means

Real movement has mass, springs, and damping. A tween runs for a fixed duration regardless of how fast the user moved; a spring responds to velocity. When elements the user moves or gestures against are governed by fixed-duration easing, the mismatch between the expected physical feedback and the actual behavior is felt even when it cannot be named. Spring physics closes that gap.

## Why it matters

The pre-HCI source is Ollie Johnston and Frank Thomas's *The Illusion of Life* (1981), whose 12 principles of animation include squash and stretch, arcs, and slow in and slow out... all of which are observations about physically honest motion. A ball that squashes on impact and stretches on release is obeying the same physics as a rubber ball; a character whose limbs lag before following the torso is modeling inertia. Johnston and Thomas derived these from animation empirically, but the underlying claim is about what motion must do to feel real. Imran Chaudhri and Bas Ording's rubber-banding implementation on the original iPhone is the canonical Layer 3 demonstration: the further you stretch the content past the edge, the more resistance; the faster you release, the more snap-back velocity. No tween can replicate this because tweens don't carry gesture velocity. Rauno Freiberg's "Simulating Physics" chapter in Devouring Details extends this to the web: spring-based motion is not an aesthetic choice, it is the physically honest one. Emil Kowalski's Animations on the Web translates the principle into React with practical spring configurations.

## Register sensitivity

**`brand`** ... eased durations can feel editorial on brand surfaces. A 400ms ease-in-out fade on a hero headline isn't dishonest... it's film language. Springs still win on touch-initiated gestures (button press, tap), but scroll-driven choreography can use curves. Drift zone: using ease-out-quart where spring would feel native AND the gesture is user-driven.

**`product`** ... strict. Any interaction that should feel physical (drag, pull, pinch, throw, commit, release) must use spring physics. Eased durations on these gestures are 🔴 BREAK. Layout animations, modal mount/unmount, state transitions are 🟡 DRIFT at best.

**Common ground** ... bounce and elastic easing are absolute bans in both registers (per Bakaus; devour agrees). Duration hardcoded to match a spring's settle time (e.g., `transition: transform 300ms cubic-bezier(...)`) is always a tell; a spring would express the intent directly.

## Tactics

- Replace `transition: transform Xms ease-*` on any draggable, swipeable, or gesture-driven element with spring physics.
- Never use `transition: all` on interactive components. Different properties need different physical metaphors; collapsing them into one transition prevents targeted physics.
- Use `linear` easing only for color and opacity changes where physical metaphor does not apply. Never for spatial movement.
- For dialogs and sheets, spring-in on enter to communicate mass. A dialog that pops in on a fixed-duration ease has no weight.

## Anti-patterns

- **`transition: transform 300ms ease-out` on dragged elements:** Tween speed is constant regardless of gesture velocity. Release fast, the element still takes 300ms. The physical metaphor is broken.
- **Linear easing on spatial movement:** Nothing in the physical world moves like a conveyor belt. Linear is correct for opacity fades, never for position.
- **Tween-based dialog enter/exit:** A modal entering on a CSS transition at a fixed duration communicates a scheduled animation, not an object with mass.

## Exemplars

- **iOS rubber-banding:** The original production spring. Stretch past the scroll edge; resistance increases. Release; snap-back velocity matches stretch speed. No tween could do this.
- **Vaul drawer:** Drag to midpoint and release. Spring velocity carries through from gesture speed. This is what drag-and-release should feel like on every surface.
- **NotBoring Calculator:** Each button press springs back. The visual behavior matches what a physical button does.

## Further study

- Ollie Johnston and Frank Thomas, *The Illusion of Life: Disney Animation* (1981) ... the Layer 0 source; the 12 principles (squash and stretch, arcs, slow in and slow out) are the vocabulary for physically honest motion
- Rauno Freiberg, Devouring Details, "Simulating Physics" chapter (devouringdetails.com)
- Emil Kowalski, Animations on the Web, spring chapters (animations.dev)
