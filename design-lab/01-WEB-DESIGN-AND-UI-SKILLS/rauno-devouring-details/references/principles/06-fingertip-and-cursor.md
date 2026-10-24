# Principle 6 ... The fingertip and the cursor are not the same

> Touch targets, hit boxes, ergonomic distance, Fitts's law.

## What it means

A cursor can target a 2px element precisely. A fingertip cannot. Designing touch targets by visual size rather than ergonomic size produces surfaces that look right in Figma and fail in use. The visual bounds and the interactive bounds are independent decisions, and on touch surfaces they must be made independently.

## Why it matters

Bill Buxton's thesis in *Sketching User Experiences* is that input is more important than output in interaction design. The history of UI improvement is largely a history of better input modeling. Bruce Tognazzini's First Principles encode Fitts's law directly: the time to acquire a target is a function of its size and distance. Apple's original iPhone team established 44pt as the minimum touch target based on average fingertip contact area, and it became the HIG standard. Rauno Freiberg's "Ergonomic Interactions" chapter in Devouring Details extends this to hit box expansion patterns on the web.

## Register sensitivity

**`brand`** ... mobile tap targets on CTAs matter. A 16px close button on a modal dialog is 🔴 BREAK regardless of register. Beyond CTAs, brand surfaces with complex touch interaction are rare; defer findings to #8 where affordance clarity is the bigger concern.

**`product`** ... central. 44pt minimum hit boxes. Hover-dependent affordances on mobile are 🔴 BREAK. Touch targets smaller than thumb width (11mm) on primary actions are 🔴 BREAK. Fitts's law applications (edge-snapping menus, oversized hit zones on small visible targets) are the hunting ground.

**Common ground** ... unreachable or invisible tap targets are 🔴 in both. Hover-reveals with no touch equivalent are 🔴 in both if the revealed content is load-bearing.

## Tactics

- Make touch targets a minimum 44×44pt hit zone. The visual element can be smaller; the interactive area must not be.
- Add padding to icon buttons: `p-3` or `p-2.5` brings a 24px icon to a 48-52px hit zone without changing visual size.
- Associate labels with inputs via `htmlFor`/`id` or wrapping. The entire label-plus-input area is the tap zone.
- On keyboard-first surfaces, every action must be reachable without a mouse. Keyboard navigation is the ergonomic choice for power users.

## Anti-patterns

- **Touch target below 44pt:** A 16px close button on a mobile dialog. Visible, technically tappable, fails Fitts every time.
- **Hit box identical to visual bounds:** A 24px icon with no padding. The visual designer sized by visual weight; the interactive designer must size by usability. These are different constraints.
- **Link with no padding:** Inline text link at `text-sm` is often 16-18px tall. Half the required minimum on touch.
- **Tooltip-only affordance on mobile:** Tooltips require hover. Touch has no hover event. The label is unreachable.

## Exemplars

- **iOS keyboard:** Each key is visually small. The hit box grows on touch-down to match where the fingertip thinks it landed, not where the key is drawn.
- **Linear:** Keyboard-first model. Every action is reachable without a mouse. Density is high; ergonomics are intact because the keyboard is the primary input.
- **cmdk:** All interactions available with the mouse are available with the keyboard. The keyboard experience is the primary one.

## Further study

- Bill Buxton, *Sketching User Experiences* (2007) ... input-first thinking as the foundation for ergonomic design
- Rauno Freiberg, Devouring Details, "Ergonomic Interactions" chapter (devouringdetails.com)
