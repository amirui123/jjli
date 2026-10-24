# Anti-patterns

A catalog of failure modes the devour spine is designed to catch. Organized by principle. Each entry names the anti-pattern, describes it, explains why it fails, names the principle it violates, and points to the fix direction.

This catalog is not exhaustive. New failure modes appear as new patterns emerge. The principles are stable; the anti-patterns their applications catch are not. Add exemplars and failure modes as you find them.

For the theory behind each principle, see [`principles-map.md`](principles-map.md). For positive exemplars (what correct looks like), see [`exemplars.md`](exemplars.md).

---

## Principle #1 ... Honest motion

> If you animate it, it must communicate something the static state could not.

---

### Decorative page-load fade

**What it is:** Content on a page fades or slides in when the page loads, regardless of whether the user triggered a navigation event.

**Why it fails:** The motion carries no information. The content was always going to be there. The animation performs loading without representing it. Remove it and the user loses nothing; they gain time.

**Fix direction:** Remove entrance animations from static content. Reserve fade/slide-in for: content that loads asynchronously, content that appears in response to a user action, or transitions between states where the change needs to be signaled.

---

### Pulse animation on a static badge

**What it is:** A badge or notification dot that has a persistent pulse or glow animation even when there is nothing pending.

**Why it fails:** Pulse communicates "something is happening" or "this requires attention." If the badge count is static, the pulse is a lie. Users who see a pulse look for the change; finding none, they learn to distrust the signal. The next real pulse is ignored.

**Fix direction:** Pulse only when there is a genuinely new, unseen notification. Stop the pulse as soon as the user acknowledges. Use CSS animation only when `count > 0` and `hasUnread === true`.

---

### Skeleton screen shimmer that outlasts the actual load

**What it is:** An animated shimmer on a skeleton loader that runs for a perceptible duration after the content has already loaded, or that runs on content that loads in under 100ms (i.e., content that was never actually loading from the user's perspective).

**Why it fails:** The shimmer communicates "loading." If the content is already there, or loads fast enough that the user never perceived a wait, the shimmer is performing loading theater. It adds latency sensation to an experience that didn't have latency.

**Fix direction:** Show skeleton screens only when the wait will be perceptible (>200ms). Remove immediately when data arrives. Do not add transition delay to skeletons.

---

### Animated counter counting from zero

**What it is:** A number on a dashboard or stats page that counts up from 0 to its actual value via a `setInterval` animation when the page renders.

**Why it fails:** The animation communicates "this number is being calculated in front of you." The number is not being calculated. It was fetched and is known. The animation performs computation without representing it, and delays the user from getting the information.

**Fix direction:** Remove. If the number changes in real time (live dashboard, live vote count), animate on the *change*, not on initial render.

---

### You Don't Need Animations (the whole category)

**What it is:** Any animation where removing it would not reduce the user's ability to understand what just happened.

**Why it fails:** Each unnecessary animation adds cognitive load, perceptual processing time, and potential disorientation. Motion that communicates nothing is decoration. Decoration that moves is more distracting than decoration that doesn't.

**Fix direction:** Apply Emil Kowalski's test ("You Don't Need Animations," emilkowal.ski): for each animation, ask whether the user *needs* it to understand the state change. If no, remove it. This is not a performance consideration; it is a honesty consideration.

**Source:** Emil Kowalski, "You Don't Need Animations." Principle: Dieter Rams #6 ("Good design is honest").

---

### Decorative scroll-driven fade-in

**What it is:** Sections, images, or text blocks on a marketing or content page that fade, slide, or scale in via `animation-timeline: view()` (or an IntersectionObserver equivalent) as the user scrolls past them. Applied uniformly to every block on the page, with no informational distinction between elements.

**Why it fails:** The motion communicates nothing the static page didn't. The content was always going to be there; the user is the one who moved. Worse, the animation introduces a perceptual lag between "I scrolled to this section" and "this section is readable" ... a tax the user pays on every section, on every visit. Reduced-motion users get the static page; motion users get a slower static page. The native CSS API (`animation-timeline`, `animation-range: entry`) makes this trivially easy to ship, which is precisely why it shows up everywhere now.

**Fix direction:** Reserve scroll-driven animation for cases where scroll progress is the information: data visualizations that reveal in scroll order, narrative scrollytelling where each section is a beat, parallax that establishes spatial relationship between layers, or progress through a long-form artifact where the choreography is the argument. For ordinary content sections, ship the static page. If the page feels flat without motion, the layout is doing too little work, not the animation too little.

**Source:** Emil Kowalski, "You Don't Need Animations" (emilkowal.ski). Principle: Dieter Rams #6 ("Good design is honest").

---

## Principle #2 ... Physics over duration

> Real movement has mass, springs, and damping. Eased durations betray themselves as animation.

---

### `transition: transform Xms ease-*` on a moved element

**What it is:** Any CSS transition applied to the `transform` property of an element the user moves, repositions, or that responds to a gesture.

**Why it fails:** A tween runs for a fixed duration regardless of gesture velocity. If the user drags quickly and releases, the element tweens to its endpoint at the same speed as if they dragged slowly. Real objects don't work this way: the faster you throw something, the faster it arrives. The mismatch is physically wrong and users feel it, even if they can't name it.

**Fix direction:** Replace `transition: transform Xms ease-*` on draggable, swipeable, or gesture-driven elements with spring physics. Use Framer Motion's `type: "spring"` configuration, react-spring, or CSS `@property` + `linear()` for spring approximation.

---

### Linear easing on any spatial movement

**What it is:** `transition: transform Xms linear` on anything that moves through space.

**Why it fails:** Linear easing is mechanically uniform: the element moves the same distance per unit time from start to finish. Nothing in the physical world moves this way except conveyor belts and fax machines. On an interactive surface, linear motion reads as robotic and wrong.

**Fix direction:** Linear easing is correct for some color/opacity changes (where physical metaphor doesn't apply). It is never correct for spatial movement. Replace with spring physics for anything that moves in space.

---

### `transition: all Xms` on interactive elements

**What it is:** `transition: all 200ms ease-out` (or similar) applied to any interactive component.

**Why it fails:** Different properties have different physical metaphors. Geometry (position, size) should have spring behavior. Color transitions might use easing. Opacity might use a short fade. `transition: all` collapses these into a single undifferentiated tween, preventing targeted physics.

**Fix direction:** Specify properties individually. `transition: background-color 150ms ease-out` for hover color change; spring physics for any `transform` change.

---

### Tween-based dialog enter/exit

**What it is:** A dialog or modal that scales or fades in/out on a CSS `transition` with a fixed duration.

**Why it fails:** Dialogs are heavy objects: they interrupt, they demand attention, they sit above the content. They should have the physical weight that implies. A spring-in communicates mass. A 200ms ease-out communicates a scheduled animation.

**Fix direction:**
```tsx
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.95, opacity: 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
/>
```

---

### Cubic bezier curves copied from a library that don't match the interaction

**What it is:** Easing values like `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard) applied wholesale to elements whose interaction has a different character.

**Why it fails:** Easing curves encode a particular physical metaphor. Material Design's standard easing is for elements that are always on-screen. It is wrong for elements that enter from off-screen. It is wrong for drag-and-release. It is wrong for anything that should have variable exit velocity based on gesture speed.

**Fix direction:** Understand what physical behavior the easing is trying to approximate. Then ask whether a spring would serve better. Usually, it will.

---

## Principle #3 ... Commit on intent, not on contact

> Distinguish hover-passing-through from hover-with-intent.

---

### Instant tooltip on `mouseenter`

**What it is:** A tooltip that fires immediately when the cursor enters the trigger element, with `delayDuration={0}` or an explicit `onMouseEnter={() => setOpen(true)}` with no timeout.

**Why it fails:** The cursor passes over many elements en route to its target. Instant tooltips surface on every element in the path, creating visual noise that punishes cursor movement. Users who move fast see a cascade of tooltips they didn't ask for.

**Fix direction:** Use Radix `TooltipProvider` with `delayDuration={400}` (or minimum 200ms). For custom implementations, add an 80-100ms intent timer that is cancelled on `mouseLeave`.

---

### Instant dismiss on `mouseleave`

**What it is:** A tooltip, popover, or hover card that closes immediately when the cursor exits the trigger element.

**Why it fails:** Users often need to move the cursor from the trigger to the tooltip to read it or interact with it. Instant dismiss on `mouseleave` makes the tooltip unreachable: the cursor leaving the trigger closes it before the cursor reaches it.

**Fix direction:** Add a 100ms close delay. Check whether the cursor entered the tooltip or the trigger; if either is hovered, stay open.

---

### Nav sub-menu that opens on `mouseenter`

**What it is:** A navigation menu or megamenu that activates its sub-menu the moment the cursor enters the nav item, with no intent delay.

**Why it fails:** Nav items are typically traversed to reach an item beyond them. Activating the sub-menu on every traversed item interrupts navigation and creates layout shifts that push the cursor off its path.

**Fix direction:** Add an intent delay (80-100ms minimum) before activating the sub-menu. Cancel if the cursor keeps moving without pausing.

---

### Hover card that opens on cursor contact with small elements

**What it is:** An avatar, tag, or label that opens a hover card on `mouseenter` with no delay.

**Why it fails:** Small elements are precisely the ones the cursor passes over while doing other things. Instant hover cards on small elements surface constantly during normal cursor movement.

**Fix direction:** For hover cards on small elements, use a longer intent delay (300-500ms) than you would for larger, more deliberate targets. The smaller the element, the more likely hover is accidental.

---

### Button that activates on `mousedown` instead of `mouseup`

**What it is:** A clickable element that fires its action on `pointerdown` or `mousedown` rather than `click` (which fires on `mouseup`).

**Why it fails:** Users who have already initiated a click but changed their mind cannot cancel by moving the cursor away. Standard click behavior allows cancellation by moving off-target before releasing. `mousedown` activation removes this escape hatch.

**Fix direction:** Use `onClick` (fires on `mouseup`) for destructive or significant actions. `pointerdown` activation is appropriate only for games and real-time drawing tools.

---

## Principle #4 ... Reversibility is craft

> Every optimistic state needs a believable error path.

---

### "Saved!" toast with no failure variant

**What it is:** A success toast that fires on `try` with no corresponding error toast in the `catch` block.

**Why it fails:** The user asked the system to do something. The system might fail. If the interface cannot communicate failure with the same weight as success, the user will not know their action was lost. Trust erodes silently.

**Fix direction:** Use `toast.promise()` which forces the error variant, or explicitly add `toast.error()` in every `catch` block that corresponds to a `toast.success()` in the `try` block.

---

### Silent optimistic rollback

**What it is:** Optimistic UI that updates the interface on mutation, rolls back on error, but shows nothing to the user during the rollback.

**Why it fails:** The user saw the change succeed, then saw it revert, with no explanation. From the user's perspective: "The interface did something and then undid it. Did my action fail? Did it succeed? Should I try again?"

**Fix direction:** Always surface something on rollback. `toast.error("Update failed. Your changes have been reverted.")` is the minimum.

---

### Submit button that stays in spinner on network failure

**What it is:** A button that shows a loading spinner during an async operation but never transitions to an error state if the operation fails.

**Why it fails:** The button stuck in spinner communicates "still loading" when the operation has actually failed. The user waits. The user refreshes. The action runs again. Or the user gives up.

**Fix direction:** Always catch async errors and reset button state. Always surface an error message. The loading state is a promise to the user that resolution is coming; keep the promise in all paths.

---

### Delete confirmation that doesn't name the thing being deleted

**What it is:** An "Are you sure? This cannot be undone." confirmation dialog that does not identify what will be deleted.

**Why it fails:** The user must remember what they were deleting. The confirmation is not reversible; it is a final check. The final check should include enough information for the user to make a confident decision. "Delete 'Q4 Sales Report'" is a confirmation. "Are you sure?" is a ritual.

**Fix direction:** Always include the name or identifier of the thing being deleted in the confirmation dialog. For bulk actions, include the count ("Delete 12 items?").

---

### Missing loading state

**What it is:** An async operation that has a success state and an error state but no loading state: the user clicks, nothing visible happens, then the success or error state appears.

**Why it fails:** The gap between action and feedback is the gulf of evaluation (Norman). Without a loading signal, the user doesn't know if their action was registered. They may click again.

**Fix direction:** Every async operation needs a loading signal. For buttons: spinner or "Loading..." text. For data fetching: skeleton or inline indicator. For form submission: disabled + spinner. The loading state is not optional; it is the interface keeping its promise.

---

### Optimistic UI with no network error handling

**What it is:** A component that optimistically updates state but has no error handling at all... the `catch` is empty, `console.error`-only, or entirely absent.

**Why it fails:** The most optimistic possible UI is one that shows success and has no path to show failure. This is not optimistic; it is negligent. The user's data is at risk.

**Fix direction:** TanStack Query's `onError` callback in `useMutation` is the correct pattern. It is called whenever the mutation fails, with access to the error and the rollback context. Use it.

---

## Principle #5 ... Sequence carries meaning

> Stagger only when order matters. Otherwise, simultaneity.

---

### Staggered list where order is arbitrary

**What it is:** A list of items (users, notifications, search results) that entrance-animates with a stagger (each item enters `i * 50ms` after the previous) where the list order has no inherent meaning.

**Why it fails:** The stagger communicates "these items appeared in this order for a reason." If the reason is alphabetical sorting or API response order, the stagger is a lie. The user looks for meaning in the sequence and finds none.

**Fix direction:** Remove the stagger. Simultaneous entrance on an unordered list is honest. If the list *is* ordered (ranked items, a queue, a step sequence), the stagger is correct.

---

### Simultaneous animation where causality matters

**What it is:** Two elements that have a causal relationship (pressing a button that expands a panel, selecting an item that loads its detail, adding a filter that updates a list) that animate simultaneously with identical behavior.

**Why it fails:** Simultaneous identical animation hides the causal relationship. The user's mental model of "I pressed this and that happened" is confirmed by sequence, not simultaneity.

**Fix direction:** Animate in order: the trigger first (brief confirmation), then the result (the caused thing). The Linear filter-pill animation is the correct model: existing pills shift, then the new pill enters. The order tells the causal story.

---

### Missing follow-through on chained interactions

**What it is:** An interaction chain (select a list item → detail panel opens → related content loads) where the animations do not follow through: each state change animates independently as if the previous change didn't happen.

**Why it fails:** In physical systems, a push creates follow-through: the pushed object carries momentum. In interaction chains, follow-through means the second animation should feel like a consequence of the first, not a fresh beginning.

**Fix direction:** Stagger the chain. The first change animates, and the second begins as the first settles. The gap between them communicates causality. Use `AnimatePresence` with `mode="wait"` for sequential state changes.

---

### Entrance stagger on items that are already visible

**What it is:** A list that was already rendered on screen and gets a stagger animation triggered by a user action (sorting, filtering) that does not add new items.

**Why it fails:** The items were already there. Re-animating their entrance after a sort communicates "these are new items," which is false. The user sees the stagger and wonders what changed.

**Fix direction:** Use layout animation for sorting (Framer Motion's `layout` prop). Items move to their new position; they do not exit and re-enter.

---

## Principle #6 ... The fingertip and the cursor are not the same

> Touch targets, hit boxes, ergonomic distance, Fitts's law.

---

### Touch target below 44pt

**What it is:** An interactive element (button, icon, link) with a visual or hit-box size below 44×44pt (44×44px on 1x screens) on a touch surface.

**Why it fails:** The Apple HIG established 44pt as the minimum touch target size based on average fingertip contact area. Below this, tap accuracy decreases significantly. WCAG 2.5.5 (AAA) requires 44×44px. WCAG 2.5.8 (AA, 2.2+) requires 24×24px minimum. 44pt is the pragmatic bar.

**Fix direction:** Add padding to bring the hit zone to 44×44pt while keeping the visual size smaller if needed. The visual bounds and the interactive bounds can differ.

---

### Close button in a corner at 16-24px

**What it is:** A modal, sheet, or panel with a small close button (`w-6 h-6` or similar) in a corner.

**Why it fails:** Corners require gross motor movement to reach on large screens and are often near the edge of reach on small screens. A 16-24px target in a corner is twice as hard to hit as the same size target in the center of the screen (Fitts's law: distance matters). The close button is one of the most-used controls on any modal surface; it should be generously sized.

**Fix direction:** Make close buttons at minimum 44×44pt hit zone (`p-2.5` on a 24px icon). Consider placing modal close in the center of a more reachable region on mobile.

---

### Link with no padding expansion

**What it is:** An inline text link styled as pure text with no additional padding or minimum height.

**Why it fails:** Inline text links are among the smallest tap targets in a UI. Text rendered at `text-sm` or `text-base` is often 16-20px tall. This is less than half the recommended touch target height.

**Fix direction:** Add `py-1` or `-my-1` negative margin to text links on touch surfaces. Or use `min-h-[44px]` on block-level links.

---

### Hit box that matches visible bounds exactly

**What it is:** An icon button, tag, or small interactive element where the hit box is identical to the visual bounds.

**Why it fails:** Visual designers size elements by their visual weight on screen. Interactive designers size elements by their usability. These are different constraints. A 16px icon looks right visually but is unusable on touch without a larger hit zone.

**Fix direction:** The visual size and the hit zone are independent. Use `p-3` or `p-2.5` on icon buttons to create a hit zone that is larger than the icon. The visual element stays small; the interactive area is generous.

---

### Form label not expanding hit zone to input

**What it is:** A form with a `<label>` and `<input>` rendered as separate elements, where tapping the label does not expand the interactive area to include the input.

**Why it fails:** On mobile, tapping the label should activate the input. If they are not associated (via `htmlFor` / `id` or wrapping), the label is dead space.

**Fix direction:** Wrap the input in the label, or use matching `htmlFor`/`id` attributes. The entire label-plus-input area should be the tap zone.

---

## Principle #7 ... Preserve user state across boundaries

> Loading must not lose your scroll, your selection, your draft.

---

### Scroll reset on navigation

**What it is:** A navigation event (route change, tab switch, filter change) that resets the page scroll position to the top.

**Why it fails:** The user may have scrolled to a specific position to find something. Navigation that loses that position requires them to scroll back. In long content (logs, issue lists, data tables), this is a meaningful tax on every navigation.

**Fix direction:** Preserve scroll position across navigation events where the user expects to return to the same place. In Next.js App Router: `<ScrollRestoration />` or manual position tracking. Use `scrollRestoration: "manual"` in the History API when controlling scroll explicitly.

---

### Lost form state on refresh

**What it is:** A form where the user's progress is lost if they navigate away or refresh the page.

**Why it fails:** Writing is slow. Filling a form is work. Losing work on an unintentional navigation is the interface failing its user. This is Andy Matuschak's working-memory principle: the interface should externalize state the user has accumulated.

**Fix direction:** For forms the user may spend significant time on, persist field values to `localStorage` and restore on mount. Use `react-hook-form`'s `watch` to auto-save drafts. Clear the persisted draft on successful submission.

---

### Selection cleared on filter change

**What it is:** A list with multi-select where the selection is cleared whenever the filter or sort changes.

**Why it fails:** The user is selecting items to act on them. Filtering narrows which items they can see, but does not change which items they have decided to act on. Clearing selection on filter is presuming intent the user did not express.

**Fix direction:** Preserve selection through filter changes. The selected item IDs are independent of the visible items. If the user filters such that selected items are no longer visible, show a count of "N selected items not visible in current filter" rather than clearing.

---

### Tab state not persisted to URL

**What it is:** An active tab stored only in component state (`useState("overview")`) with no URL synchronization.

**Why it fails:** The user shares a URL expecting the recipient to see the same thing. The user refreshes and loses their tab. The user uses the browser back button to return to their previous tab and instead navigates away from the page entirely.

**Fix direction:** Store active tab in the URL query string (`?tab=overview`). In Next.js App Router: `useSearchParams()` for reading, `router.push()` for writing. The cost is minimal; the benefit is deep-link-ability, share-ability, and browser-history correctness.

---

### Modal state not preserved on reopen

**What it is:** A multi-step wizard or form modal that resets to step 1 each time it is opened, even if the user had previously progressed through the steps.

**Why it fails:** The user opened the modal, started the process, closed it (accidentally or intentionally), and returns to find their progress gone. On slow or complex flows, this is friction that compounds.

**Fix direction:** For multi-step flows, persist the current step and intermediate form state. Either keep the modal mounted with `display: none` when "closed," or persist state to `localStorage` / `sessionStorage` and restore on open.

---

### Cleanup-after-navigation race

**What it is:** A single event handler triggers both a route change (`router.push(path)`) and a local state cleanup (`setOpen(false)`, `setSelected(null)`, etc.) ... but the navigation runs first.

**When this advice is enough (simple case):** plain React state transitions tied to a `router.push()` or equivalent, where the component containing the overlay is rendered exactly once in the tree. Cleanup first, navigate second.

**When this advice is NOT enough (structural case):** if the state cleanup involves a portal-based overlay (Radix Dialog, cmdk CommandDialog, Vaul Drawer, Sonner Toaster, Headless UI Dialog, any Presence-wrapped surface) AND the component containing that overlay is rendered more than once in the tree, the order-fix alone cannot prevent orphan portals. See the related anti-pattern: `Orphan portal from duplicated trigger+overlay component`.

**Why it fails:** React's render pipeline can flush the route change before the local state update commits. Portal-mounted UI (modal, command palette, popover, toast) is stranded in the new route tree. The user navigates successfully but the old surface stays visible. This is principle #7 with a wrinkle: when *crossing* a boundary (a route change), close-out work must happen *before* the boundary, not concurrent with it. Otherwise fragments of the old state are stranded in the new one. When the component is duplicated across the tree, only the instance the user interacted with receives the `onSelect` close signal... the other instances never get it, and their portals remain open in `document.body` regardless of cleanup order.

**Fix direction (simple case):** State cleanup before navigation. Always.

```tsx
// Wrong:
const handleSelect = (path: string) => {
  router.push(path);    // navigation may flush before setOpen commits
  setOpen(false);       // stranded portal in new route
};

// Right:
const handleSelect = (path: string) => {
  setOpen(false);       // queue cleanup first
  router.push(path);
};
```

The same rule applies to any portal-rendered UI invoked from a list of navigation targets: command palettes, autocomplete results, search overlays, sidebar nav menus that contain links. If a click both *closes the surface* and *takes the user somewhere*, close before going.

**Fix direction (structural case):** split trigger and overlay; see next entry.

**Lineage:** Principle #7 corollary ... cleanup must precede the boundary, not coincide with it. This is a React-specific failure mode, but the underlying principle (preserve state across boundaries cleanly) is general.

---

### Orphan portal from duplicated trigger+overlay component

**What it is:** A component that bundles a trigger (button, keyboard shortcut handler) with its own portal-based overlay (Radix Dialog, cmdk CommandDialog, Vaul Drawer, Sonner, Headless UI Dialog, any React Presence-wrapped surface) is rendered more than once in the tree. Common shape: one instance per responsive breakpoint container (`<div class="hidden md:flex">` + `<div class="md:hidden">`), or one per layout slot (desktop nav, mobile nav, sheet-nested copy). Each instance holds its own local `open` state. Each registers its own shortcut listener (⌘K, Escape). When triggered, all instances open in parallel.

**Why it fails:** Only the visible instance receives the user's interaction and closes cleanly on selection. The other instances remain open with `data-state="open"`, render their portals into `document.body`, and on many libraries hold `pointer-events: none` on body to block outside-dialog clicks. The result is visual and interaction breakdown on the next navigation target: clicks do not register, focus is trapped, visual artifacts persist. Simple timing fixes (`requestAnimationFrame`, `setTimeout`) cannot address this because the root cause is structural, not temporal. The orphaned portals are stranded because their parent components never received a close signal, not because of a render flush timing issue.

**Fix direction:** Split the component into two exports: a lightweight trigger (button + keyboard shortcut) rendered per-context, and a singleton overlay mounted exactly once at the layout level. Triggers communicate with the overlay via a chosen global mechanism: custom DOM events, React Context, global store, or imperative ref API. The choice of mechanism does not matter; what matters is that there is one overlay instance, globally.

```tsx
// Before: trigger + dialog in one component, rendered 3 times
<Nav>
  <div className="hidden md:flex">
    <Search />  {/* own open state, own listener, own dialog */}
  </div>
  <div className="md:hidden">
    <Search />  {/* own open state, own listener, own dialog */}
  </div>
  <Sheet>
    <Search />  {/* own open state, own listener, own dialog */}
  </Sheet>
</Nav>

// After: three triggers, one dialog
<RootLayout>
  <Nav>
    <div className="hidden md:flex"><SearchButton /></div>
    <div className="md:hidden"><SearchButton /></div>
    <Sheet><SearchButton /></Sheet>
  </Nav>
  <SearchDialog />  {/* singleton, mounted once at layout level */}
</RootLayout>
```

**Lineage:**
- Principle #4 (reversibility is craft) ... orphan portals break the exit path; the user has no way to close what they cannot see
- Principle #7 (preserve user state across boundaries) ... orphaned DOM state that blocks clicks on the destination page is a direct violation of state continuity across navigation
- Principle #11 (match metaphor to medium) ... a command palette, toast host, or global modal is conceptually a singleton; implementation should reflect that
- Sonner's architectural default (one `<Toaster />`, many `toast()` calls) is the canonical solution to this class of problem

---

## Principle #8 ... Make affordances visible without making them loud

> Signifiers should be discoverable, not declarative.

---

### Drag handle with instruction text

**What it is:** A draggable element with explicit "Drag to reorder" label or a large, visually dominant drag handle.

**Why it fails:** The signifier is so loud it dominates the surface. Compare to Vaul's drag handle: 4px bar, recognizable to every mobile user, claims zero attention. The difference between a good signifier and a bad one is not whether it exists, but whether it claims more space than the interaction deserves.

**Fix direction:** Reduce the drag handle to the minimum visual presence that preserves recognition. If the handle is only visible on hover and the drag behavior is optional, this is usually correct.

---

### Empty state that describes every possible action

**What it is:** An empty state (no data, no content yet) that lists every feature, includes several call-to-action buttons, and has detailed instructional copy.

**Why it fails:** The empty state is an affordance: it signals what to do next. An affordance that lists everything is no longer an affordance; it is a manual. Users don't read manuals.

**Fix direction:** Empty states should suggest *one* clear next action, not enumerate the feature set. The next action is the only thing that matters when there is nothing.

---

### Always-visible contextual actions

**What it is:** Row-level action buttons (delete, edit, share) that are visible at all times on every row, even when the user is not interacting with any row.

**Why it fails:** Constant-visibility actions add visual weight to every row. They are signifiers for actions that are only relevant when a row is focused. The correct pattern is for actions to be signified by hover/focus, not always.

**Fix direction:** Show row actions on hover or focus. This is not hiding functionality; it is applying appropriate visual hierarchy. The actions are discoverable (they appear when you look at a row), not hidden (they appear only in a menu three layers deep).

---

## Principle #9 ... Reduce decoration, increase information

> Every element earns its pixels.

---

### Gradient header on a functional page

**What it is:** A background gradient, colorful illustration, or decorative shape applied to the header of an app page that exists to make the page "feel nicer."

**Why it fails:** Decoration that does not communicate information adds perceptual load. Every pixel spent on the gradient is a pixel not spent on information. On functional surfaces (dashboards, data views, editor UIs), decoration is always a cost, sometimes worth paying, often not.

**Fix direction:** Ask what the gradient communicates. If the answer is "warmth" or "brand," ask whether this surface is the right place for that. Marketing pages earn decoration differently than working surfaces.

---

### Decorative dividers

**What it is:** Horizontal rules or decorative separators between list items or section content that exist to add visual rhythm rather than to separate semantically distinct content.

**Why it fails:** Tufte's data-ink ratio. The divider is ink (or pixels) that communicates no information. If it can be removed without losing meaning, it should be.

**Fix direction:** Use spacing to separate content rather than lines. If a line is needed to distinguish sections, it should mark a genuine semantic boundary.

---

### Card with four competing design decisions on one data point

**What it is:** A "stat card" that has: a decorative gradient background, a colored top border, a stock-photo icon, three font sizes, and a sparkline chart... for a single number.

**Why it fails:** The decoration is proportional to the design effort, not the information value. A single number requires zero of these elements to be communicated clearly. Each element adds processing load without adding meaning.

**Fix direction:** Start from the number. Ask what additional context is needed to understand the number (trend? units? comparison?). Add only those. The rest is decoration.

---

### Motion as decoration (overlaps with #1)

**What it is:** Entrance animations, hover microanimations, and transitions that exist to signal "this is a quality product" rather than to communicate state changes.

**Why it fails:** When motion is used as a proxy for quality, it accumulates: every component gets an animation, every hover gets a microinteraction, and the result is a surface that is visually busy and perceptually tiring.

**Fix direction:** Apply Emil Kowalski's test: does the user need this animation to understand what happened? If no, remove it. This overlaps with principle #1; it's included here because the motivation (decoration as quality signal) is different from the motivation in #1 (motion without informational payload).

---

## Principle #10 ... Density is a craft choice, not a default

> Choose intentionally.

---

### Default density (using design system tokens without intent)

**What it is:** A layout or component that uses the design system's default spacing and sizing tokens, producing a density that was never deliberately chosen for the product.

**Why it fails:** Default density is an accident of the system, not a decision for the product. Notion and Linear are both well-designed; they have radically different density because their audiences need different things. Neither got there by accepting defaults.

**Fix direction:** Make a deliberate density decision for each surface type. Document it in the Devour Context. Then audit components against the decision, not against the system defaults.

---

### Excessive padding around a dense data table

**What it is:** A data table or issue list with generous card padding applied to each row.

**Why it fails:** Dense data tables are designed to show many items at once. Card-style padding reduces the number of visible rows, forcing scrolling on data that could be read at a glance. The padding is a consumer-product pattern applied to a power-user surface.

**Fix direction:** Data tables and issue lists should use compact row padding (typically `py-2 px-3` or similar) that maximizes scan-ability. The density target for this surface type should be set in Devour Context.

---

### Spacious layout on a high-frequency working surface

**What it is:** An app-like surface that users interact with dozens of times per session, designed with generous margins and breathing room appropriate for a marketing page.

**Why it fails:** Spaciousness is a reading aid. Working surfaces are not reading surfaces. A user who opens an issue tracker 50 times a day does not need breathing room; they need information density. The spacing that makes a landing page feel premium makes a working surface feel slow.

**Fix direction:** Separate the density appropriate for public/marketing surfaces from the density appropriate for working surfaces in the same product. They should be different.

---

### Intentional density without typographic hierarchy

**What it is:** A dense layout that cramped everything together without establishing clear typographic or visual hierarchy.

**Why it fails:** Density is not compression. Dense design is precise. Every element is sized, colored, and weighted to create a hierarchy that allows the eye to scan. Compressed design is just small, and the user has to work to find the entry points.

**Fix direction:** Dense design requires stronger hierarchy, not weaker. Increase contrast between primary and secondary information. Use weight and color to compensate for reduced size.

---

## Principle #11 ... Match the metaphor to the medium

> Do not paginate what should scroll. Do not modal what should be inline.

---

### Modal for single-field edit

**What it is:** A dialog or modal that opens to allow the user to edit a single text field (renaming a file, updating a title, changing a status).

**Why it fails:** The modal says "stop everything and focus on this." A single-field edit does not require that level of interruption. The correct metaphor is inline edit: the field becomes editable where it lives.

**Fix direction:** Double-click or click-to-edit patterns for single-field edits. The field becomes an `<input>` or `<textarea>` in place. Save on blur or Enter. Cancel on Escape.

---

### Pagination on a feed

**What it is:** A news feed, activity timeline, or social post list that uses numbered pages instead of infinite scroll or a "Load more" pattern.

**Why it fails:** Feeds are continuous. They have no natural chapters. Pagination imposes a chapter structure the data does not have. Users experience page turns as interruptions in a flow that should be unbroken. Worse, the user has no stable position: every page change loses context.

**Fix direction:** Infinite scroll for genuinely unbounded content. "Load more" for content where the user wants explicit control. Pagination for content that has genuine page semantics (search results, documents).

---

### Toast for persistent or actionable errors

**What it is:** A toast notification used for an error that requires user action (expired session, permission denied, payment failed) or that will persist until resolved.

**Why it fails:** Toasts are transient. They auto-dismiss. An error that persists or requires action cannot be communicated with a toast because the toast will be gone before the user can act. The toast communicates "this will pass"; the error communicates "you need to deal with this."

**Fix direction:** Persistent errors belong in persistent UI: inline error states, banners, or modals (when the error blocks all action). Toast for ephemeral, self-resolving notifications only.

---

### Popover with a form

**What it is:** A popover (anchored tooltip-style overlay) used to house a form with required fields and a submit button.

**Why it fails:** Popovers are lightweight, dismissible, secondary surfaces. Forms are primary interactions. A form in a popover creates confusion: can the user close it? Do they lose data? Is it auto-saving? The metaphor (transient popover) and the interaction (committed form entry) are in conflict.

**Fix direction:** If the form is lightweight (1-2 fields, quick action), an inline or drawer pattern is correct. If the form is substantive (3+ fields, complex choices), a full modal or dedicated page is correct. Popovers are for settings panels and filter pickers, not form workflows.

---

### Bottom sheet on desktop

**What it is:** A bottom sheet drawer (Vaul-style, mobile sheet metaphor) used as the primary detail view or action surface on desktop.

**Why it fails:** The bottom sheet metaphor comes from mobile, where it appears above the keyboard and is reachable with a thumb. On desktop, there is no keyboard to avoid, the thumb is not the primary input device, and a bottom sheet occupies prime screen real estate awkwardly. The metaphor and the medium don't match.

**Fix direction:** On desktop, use panels, side drawers, or dialogs for what would be a bottom sheet on mobile. Vaul supports responsive breakpoints where the component changes form at desktop widths.

---

### Tooltip on mobile as the only affordance

**What it is:** An icon button with a tooltip label as the only way to discover its function, on a surface that may be used on touch devices.

**Why it fails:** Tooltips require hover. Mobile devices have no hover event. The label is invisible until triggered, and on touch, triggering a tooltip typically also triggers the action. The affordance is unreachable.

**Fix direction:** On mobile surfaces, use visible labels, not tooltips, for any action that is not self-evidently recognizable. If the icon is in a dense UI, show the label on long-press or use a labeled icon at mobile breakpoints.

---

## Principle #12 ... Type is a system, not a decision per element

> Scale, leading, weight, optical sizing follow rules.

---

### Six font sizes in one component

**What it is:** A single component or page section using `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, and `text-2xl` ... all chosen per-element, without a systematic reason for each step.

**Why it fails:** Each size was a local decision that made sense in isolation. Together, they are noise: the size variation communicates hierarchy that the content does not have, and the hierarchy is inconsistent across the product.

**Fix direction:** Define a type scale for the product. Typically 3-5 sizes is sufficient for a complex UI. Each size has a semantic role (headline, body, label, caption, micro). Every type element maps to a role, not a size.

---

### Font weight used for emphasis without a weight system

**What it is:** `font-bold`, `font-semibold`, `font-medium`, `font-light`, and `font-normal` applied throughout a component based on what "looks right" per element.

**Why it fails:** Weight is a signal: heavier weight means more important. When weights are applied without a system, the signal is arbitrary: "bold" doesn't mean "primary action" or "data value" consistently; it means "the designer thought this looked good."

**Fix direction:** Assign weight to semantic roles. Headings have a weight. Body has a weight. Labels have a weight. Data values have a weight. No element gets a weight for aesthetic reasons.

---

### Line-height not adjusted for large display type

**What it is:** Headings or display text that inherit body line-height values (typically `line-height: 1.5` or `leading-relaxed`).

**Why it fails:** Body copy needs generous leading for readability at small sizes. Display type at large sizes needs tighter leading: the extra vertical space reads as gapped and unintentional. This is a typographic system gap: the line-height is not calibrated to the scale.

**Fix direction:** Large type should use `leading-none` or `leading-tight` (1 or 1.1-1.2). Body copy: `leading-relaxed` (1.5-1.6). Small/label type: `leading-snug` or `leading-normal`. The system defines this; no element decides for itself.

---

### Optical sizing not applied to variable fonts

**What it is:** A variable font with an `opsz` axis (optical sizing) where `font-optical-sizing: auto` is not applied.

**Why it fails:** Variable fonts with optical sizing adjust letterform details (contrast, serifs, weight distribution) for the size at which they are rendered. Without `font-optical-sizing: auto`, the font renders with its default optical parameters at all sizes, which is typically calibrated for body text. At large display sizes, the result is type that is technically correct and visually incorrect.

**Fix direction:** Add `font-optical-sizing: auto` to the root CSS, or apply it to large type specifically. This is a one-line fix with meaningful visual impact on any product using Inter, Geist, or other optically sized variable fonts.

---

### Inconsistent letter-spacing across the type scale

**What it is:** Letter-spacing applied inconsistently: `tracking-tight` on some headings, `tracking-normal` on others with no systematic rule.

**Why it fails:** Tracking is part of the type system. Large type typically benefits from slightly tighter tracking; small caps and labels benefit from wider tracking. When tracking is applied per-element without a rule, the inconsistency reads as unfinished.

**Fix direction:** Assign tracking to semantic roles, not to elements. All large headings: `tracking-tight`. All labels/caps: `tracking-wide`. Body: `tracking-normal`. No exceptions without a reason.
