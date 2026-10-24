---
status: complete
started: 2026-04-22T00:00:00Z
completed: 2026-04-22T23:59:59Z
skill: devour-motion
target: "Fifth Set event listing: LiveBadge.tsx, EventCard.tsx, EventList.tsx, GroupedListingsView.tsx, StarButton.tsx, Nav.tsx, Search.tsx, Sheet.tsx, globals.css"
repo: /Users/borrowers/Codes/fifthset
context-file: .devour-context.md
browser-mcp: null
terse: false
---

# Devour run: Fifth Set event listing motion review

## Context

Fifth Set's `Devour Context` was set up via `/devour-teach` and identified the product as a content platform with a "considered" motion appetite. Principle #1 was weighted HIGH (breaks), #5 MEDIUM (drifts), #2 medium. The card entrance stagger, live pulse, and slide-up animations all needed to feel like a single deliberate system, not independent experiments.

The review covered the full motion surface (no specific target file, since main was clean... devour-motion fell back to scanning the codebase): `LiveBadge.tsx`, `EventCard.tsx`, `EventList.tsx`, `GroupedListingsView.tsx`, `StarButton.tsx`, `Nav.tsx`, `Search.tsx`, `Sheet.tsx`, and `globals.css`.

**Codebase:** Fifth Set... Next.js 16 + Tailwind 4 + shadcn editorial events directory for jazz fans across 7 US cities. Dark, magazine-register aesthetic with a Playfair/Inter/Mono type system.  
**Date:** 2026-04-22  
**Devour skill used:** `devour-motion`  
**Principle(s) engaged:** #1 (honest motion), #2 (physics over duration), #5 (sequence carries meaning)  
**Severity:** 1 🔴 BREAK · 4 🟡 DRIFTS · 3 🟢 OPPORTUNITIES

## Findings

```
═══════════════════════════════════════════════════
DEVOUR MOTION REVIEW: Fifth Set ... full codebase
Context: Considered motion appetite · #1 weighted HIGH (breaks),
         #5 weighted MEDIUM (drifts)
═══════════════════════════════════════════════════

🔴 BREAKS (1 finding)

[#1 HONEST MOTION] - 🔴 BREAK
File: components/LiveBadge.tsx:40-47 + app/globals.css:43-50
Symptom:
  The animate-pulse-live keyframe is applied to both genuinely-live events
  (red dot, "Live Now") and sponsored venues that are merely featured (gold
  dot, "Featured"). The pulse communicates "something is happening right now"
  in both cases, but the featured state means only "this venue paid for
  placement." Two different facts. One animation.
Principle:
  Emil Kowalski's test ... "does the user need this motion to understand what
  just happened?" ... passes for the live dot (yes, the show is currently
  playing) and fails for the featured dot (no, the sponsorship is static; the
  pulse adds no information the gold color and label don't already provide).
Tactic:
  Remove animate-pulse-live from the featured branch. The gold dot and
  "Featured" label are sufficient. The live branch keeps its pulse.

  // LiveBadge.tsx ... featured branch, line 40-46
  // Before:
  <span className="w-2 h-2 rounded-full bg-accent animate-pulse-live" />
  // After:
  <span className="w-2 h-2 rounded-full bg-accent" />

Reference:
  Emil Kowalski, "You Don't Need Animations" ... animated state must
  communicate something the static state cannot. Don Norman, feedback as
  affordance ... the pulse is a continuous feedback signal; continuous signals
  imply continuous activity.

🟡 DRIFTS (4 findings)

[#5 SEQUENCE CARRIES MEANING] - 🟡 DRIFT
File: app/globals.css:127-135
Symptom:
  The card entrance stagger is hardcoded for exactly 9 children:
  nth-child(1) through nth-child(9) at 30ms steps. Cards beyond the ninth
  render without any delay and arrive simultaneously with card 9 ... breaking
  the ordered sequence mid-grid. NYC on a busy night easily has 15-20 shows.
Principle:
  Rauno Freiberg, "Motion Choreography" ... stagger communicates that items
  arrived in a sequence. When the sequence breaks silently at index 9, cards
  10-N appear to belong to a different system. The choreography becomes noise.

[#1 HONEST MOTION] - 🟡 DRIFT
File: components/EventCard.tsx:25-27 + app/globals.css:117-125
Symptom:
  card-enter is a class on every EventCard. It replays its entrance
  animation (card-in, 0.2s ease-out) whenever the component re-renders ...
  including after a filter toggle. The user clicks "Jazz Square" in the
  filter bar; every card in the grid bounces back in as if newly loaded.
  The animation says "content arrived" when the user knows they just
  narrowed a view.
Principle:
  Emil Kowalski, "Animations on the Web" ... motion communicates causality.
  When the wrong cause is communicated, users build an incorrect mental
  model of the system.

[#2 PHYSICS OVER DURATION] - 🟡 DRIFT
File: components/ui/sheet.tsx:65
Symptom:
  The mobile navigation sheet uses transition duration-200 ease-in-out
  and enters via slide-in-from-bottom-10. ease-in-out is a symmetric
  S-curve: the panel starts slow, accelerates through the middle, then
  slows again at arrival. On entry, the initial slow acceleration makes
  the sheet feel hesitant ... like it's deciding whether to open.
Principle:
  Rauno Freiberg, "Simulating Physics" ... objects entering a viewport
  arrive with velocity and decelerate. They don't accelerate from rest.
  ease-out on entry, ease-in on exit. ease-in-out is symmetric and betrays
  itself as a tween.

[#2 PHYSICS OVER DURATION] - 🟡 DRIFT
File: app/globals.css:89-95 + components/StarButton.tsx:55, 64
Symptom:
  .filter-pill uses transition: all 0.2s ease and StarButton applies
  transition-all to both the button and the inner Star icon. all means
  every CSS property (color, opacity, geometry, border, shadow) transitions
  at the same 0.2s rate. Color should transition faster than geometry;
  opacity should transition independently of layout. A single speed for all
  properties produces motion that feels undifferentiated.
Principle:
  Principle #2 ... all prevents targeted physics. Different properties have
  different mass: a color change is massless and should respond instantly
  (80-100ms); a spatial move has weight (150-300ms). Grouping them together
  makes the fast feel slow and the slow feel twitchy.

🟢 OPPORTUNITIES (3 findings)

[#1 HONEST MOTION] - 🟢 OPPORTUNITY
File: components/Nav.tsx:181-229, 340-370
  The city selector and period dropdowns use {isOpen && <div>...} with no
  enter or exit animation.

[#1 HONEST MOTION] - 🟢 OPPORTUNITY
File: components/Search.tsx:113-117
  The search overlay opens with no enter animation on the dialog panel.

[#5 SEQUENCE CARRIES MEANING] - 🟢 OPPORTUNITY
File: components/StarButton.tsx:63-67
  Star fill crossfades on save but doesn't have a distinct micro-pop to
  communicate state commit vs. passive hover.

═══════════════════════════════════════════════════
MOTION SUMMARY
1 break · 4 drifts · 3 opportunities
Reviewed: code only
═══════════════════════════════════════════════════
```

(This run was on the v0.1 skill before the `INTERACTIONS BETWEEN FINDINGS` block was added. The skill resolved the conflict at apply-time instead, surfaced in the testing notes below.)

## Interactions between findings

Not surfaced in the v0.1 review output. The structural fix happened at apply-time, after the user said "Apply findings 2-5." The interaction between findings #2 (stagger ceiling) and #3 (filter re-animation) was resolved by the user at apply time rather than flagged by the skill. This gap led directly to the addition of the `INTERACTIONS BETWEEN FINDINGS` block in the next skill iteration ([commit `318ffa6`](https://github.com/plainspace/devour-skills/commit/318ffa6)).

## Apply decisions

| Finding | Decision | Notes |
|---------|----------|-------|
| 1 (🔴 LiveBadge pulse on featured) | Apply | Commit `f46ad34` |
| 2 (🟡 Stagger ceiling at 9) | Apply | Resolved jointly with finding #3; commit `a8eada5` |
| 3 (🟡 card-enter re-fires on filter) | Apply | Resolved jointly with finding #2; commit `a8eada5` |
| 4 (🟡 Sheet ease-in-out) | Apply | Commit `a8eada5` |
| 5 (🟡 transition-all) | Apply | Commit `a8eada5` |
| 6–8 (🟢 Opportunities) | Defer | Taste calls; deferred to a future motion polish pass |

## Outcomes

Two commits on the test branch (`devour-test-2026-04-22` in the fifthset repo):

1. **`f46ad34`**... Remove pulse animation from featured venue badge (the 🔴 BREAK)
2. **`a8eada5`**... Fix motion drifts: stagger ceiling, filter re-animation, sheet timing, transition-all (4 of the 4 🟡 DRIFTS)

**Notable structural decision:** Findings #2 (stagger ceiling) and #3 (filter re-animation) were in tension. Fixing only the ceiling would have left a now-extended stagger that still re-fires on filter removal. The applied fix replaced the per-card `card-enter` with a section-level `animate-fade-in` on the grid container, resolving both findings simultaneously by changing where the animation lives. The grid container persists across filter changes, so the fade no longer re-fires when a filter narrows the view.

The 3 🟢 OPPORTUNITIES were not applied. They are taste calls deferred for a future motion polish pass.

Net diff: 7 files, +8 / -28 lines.

## What this example demonstrates

Three things make this a useful first example:

**1. Devour finds bugs that look like polish.** The featured-badge pulse is the canonical case for principle #1... the same animation applied to two facts that mean different things. The dev wouldn't have caught it on their own; it was already shipped to production. Devour caught it in one pass because the principle is stable: animated state must communicate something the static state cannot.

**2. Findings can interact, and the right fix is sometimes structural.** Findings #2 and #3 individually asked for tactical changes (extend the ceiling, prevent re-mounting). Together, they revealed that the *implementation pattern* was wrong: per-card animation when the meaning was section-level. The fix wasn't "fix the ceiling and prevent re-mount." It was "move the animation to where the meaning lives." This is a category-error fix, and it's the kind of move that earns trust in a review tool... it doesn't just push the bugs around.

**3. Citations are working.** Every finding traces to a named source (Emil Kowalski's "You Don't Need Animations," Rauno's "Motion Choreography," "Simulating Physics," Don Norman on feedback). The references aren't decorative... they tell the user *which* essay or chapter to read if they want to learn the principle deeper. The skill makes itself a teaching surface, not a checklist.

## Notes

- **The interaction between findings #2 and #3 was not surfaced in the v0.1 review output.** The structural fix happened at apply-time, after the user said "Apply findings 2-5." The user noticed the call but might not have if it had been a more subtle interaction. This gap led directly to the addition of the `INTERACTIONS BETWEEN FINDINGS` block in the next skill iteration ([commit `318ffa6`](https://github.com/plainspace/devour-skills/commit/318ffa6)). Real testing surfaced a real skill bug.

- **Reduced-motion handling.** The `card-enter` class was removed from the codebase, so its mention in the `prefers-reduced-motion` block in `globals.css` was also removed. `animate-fade-in` is already in the reduced-motion block from before. No regression for users with reduced-motion enabled.

- **The sheet `ease-in-out` finding was code-only.** The skill explicitly recommended re-running with a dev server to verify felt timing on real hardware. The change was applied based on principle (entry should decelerate, not S-curve), but the user is encouraged to feel it on the actual device before considering this finding closed.

- **What was NOT changed:** the `card-glow` hover transition (intentional; the slow 0.3s feel is part of the editorial register), the live pulse (correctly fires only on genuinely-live events), the slide-up animation on the bottom sheet (timing is fine, only the easing was off).

- **Branch:** `devour-test-2026-04-22` in the fifthset repo. Disposable test branch; not merged to main as of this writing.

## Asset references

Before/after snapshots at the time of this review are in [`0001-fifthset-motion-review.assets/`](0001-fifthset-motion-review.assets/).
