# Principle 3 ... Commit on intent, not on contact

> Distinguish hover-passing-through from hover-with-intent.

## What it means

The cursor moves across many elements while traveling to its target. Triggering UI state on contact with any element the cursor crosses punishes cursor movement and creates visual noise the user did not request. Intent is the brief pause that distinguishes "I am looking at this" from "I am on my way somewhere else." Interfaces that commit only on intent surface state only when it is wanted.

## Why it matters

Bruce Tognazzini's First Principles of Interaction Design establish prediction as a core principle: the system should model what the user intends, not just what the user contacts. Rauno Freiberg's "Inferring Intent" chapter in Devouring Details applies this directly to hover states and commit timing. The Linear team made it production-visible: their sidebar hover state has a brief commit delay so the nav can be traversed without triggering a cascade of active states.

## Register sensitivity

**`brand`** ... on marketing pages, "commit on intent" mostly applies to tooltips and decorative hover states. Instant-fire tooltips on brand pages are noise (🟡 DRIFT). Rare cases where a hover-intent is load-bearing (e.g., a nav disclosure that reveals a submenu) still need commit timing.

**`product`** ... central. Keyboard nav, command menus (cmdk), multi-select, drag-start, and hover-reveals are the hunting ground. 0ms hover = 🔴 BREAK. Linear/Vercel-style ~80ms hover commit is the reference. Tooltip stacking or flicker on cursor travel is 🔴 BREAK.

**Common ground** ... accidental commit on touch (where hover doesn't exist) fires in both. Irreversible actions on hover/focus (never click) fire in both.

## Tactics

- Use a minimum 80-100ms intent timer before activating hover states on navigation items and small elements.
- For tooltips, use `delayDuration={400}` in Radix `TooltipProvider`, or a minimum 200ms intent delay in custom implementations.
- Add a 100ms close delay on tooltip and popover dismiss so the cursor can travel from trigger to tooltip without closing it.
- For hover cards on small elements (avatars, tags, labels), use 300-500ms intent delay. The smaller the element, the more likely hover is accidental.
- Fire actions on `click` (mouseup) not `mousedown`. `mousedown` removes the escape hatch of moving the cursor away before releasing.

## Anti-patterns

- **Instant tooltip on `mouseenter`:** Cursor passes over a button en route to a target. Five tooltips surface in 200ms. None were requested.
- **Instant dismiss on `mouseleave`:** Tooltip closes before the cursor reaches it. The content is unreachable.
- **Nav sub-menu on `mouseenter` with no delay:** Every traversed nav item activates its sub-menu. Layout shifts push the cursor off its path. Navigation becomes an obstacle course.

## Exemplars

- **Linear sidebar nav:** Brief commit delay on hover prevents flicker while traversing. Hover intent is distinct from hover contact.
- **cmdk:** Hover state commits on slight delay. The cursor can pass over list items on the way to the keyboard; the hover state follows intent, not contact.
- **Arc browser sidebar:** Hover reveals secondary actions (close, pin) without the expansion causing layout shift in visible content.

## Further study

- Rauno Freiberg, Devouring Details, "Inferring Intent" chapter (devouringdetails.com)
- Bruce Tognazzini, First Principles of Interaction Design (asktog.com)
