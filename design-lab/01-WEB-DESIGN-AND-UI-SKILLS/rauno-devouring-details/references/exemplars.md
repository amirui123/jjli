# Exemplars

A curated catalog of named products with specific moves to study. Every entry identifies what to look at, why it matters, and which devour principles it demonstrates.

This is not a "best of the web" list. These are precisely chosen examples where a specific interaction, component, or design decision is a clear, referenceable instance of a principle from the spine. When a devour finding needs a "this is what it looks like when done right" reference, these are the entries to cite.

For citations and theory behind each principle, see [`principles-map.md`](principles-map.md).

---

## Sonner

**What to study:** Toast lifecycle design. The complete three-state arc (loading → success → error) for every promise-backed operation.

**The specific move:** `toast.promise()` is a single API call that forces you to define all three lifecycle states. It is physically impossible to call `toast.promise()` and accidentally omit the error state. The API itself encodes the principle: reversibility is not an afterthought, it is a required parameter.

Observe how the toast animations complement the lifecycle. The enter animation communicates arrival. The success variant communicates resolution. The error variant communicates failure with the same visual weight as success ... neither understated nor alarming.

```tsx
toast.promise(saveDocument(data), {
  loading: "Saving...",
  success: "Saved.",
  error: "Failed to save.",
})
```

Also worth studying: Sonner's spring physics on enter/exit. The toast does not slide in on a tween; it arrives with spring behavior that gives it appropriate mass for a transient notification.

**Principles:** #1 (honest motion: the motion communicates state change), #4 (reversibility: error path is required, not optional)

**Links:** [sonner.emilkowal.ski](https://sonner.emilkowal.ski) · [github.com/emilkowalski/sonner](https://github.com/emilkowalski/sonner) · Author: Emil Kowalski

---

## Vaul

**What to study:** Drawer drag behavior. Snap points. The spring physics on drag-and-release.

**The specific move:** Drag the Vaul drawer to a midpoint and release. The drawer does not tween to the nearest snap point at a fixed duration. It springs. The velocity of your gesture carries through into the spring's behavior: a fast fling snaps further; a slow release settles to the nearest point. This is physics, not animation.

Study the drag handle. It is a 4px bar at the top of the sheet. It is recognizable as a drag handle by every user who has ever used a mobile app, without any label, any callout, or any instructional text. It is the correct answer to principle #8 (affordances visible without being loud) on a touch surface.

Also study how Vaul handles the partial-open state. The drawer is partly visible behind the main content, which signals "there is more here" without interrupting the current surface. This is spatial affordance.

**Principles:** #2 (physics over duration: the drag-and-release is spring-based, not tween-based), #6 (ergonomics: the full bottom sheet is a large, reachable target), #11 (metaphor matching: bottom sheet is the correct metaphor for this interaction on mobile)

**Links:** [vaul.emilkowal.ski](https://vaul.emilkowal.ski) · [github.com/emilkowalski/vaul](https://github.com/emilkowalski/vaul) · Author: Emil Kowalski

---

## cmdk

**What to study:** Command menu interaction model. Hover commit behavior. Keyboard/mouse parity.

**The specific move:** Open cmdk. Move the cursor slowly across the list items. Notice that hover state commits on a slight delay (not on `mouseenter`). The cursor can pass over items en route to the keyboard; the hover state follows intent, not contact. This is principle #3 in production.

Also study the keyboard model. Every interaction available with the mouse is available with the keyboard, and the keyboard experience is the primary one. This is the correct model for any power-user surface.

The search input commits on typing, not on cursor-over. There is no confusion between "I am browsing the list" and "I am searching." The surfaces are distinct.

**Principles:** #3 (commit on intent: hover delay prevents false intent), #6 (ergonomics: keyboard-first, all actions reachable), #11 (metaphor: command surface is distinct from browse surface)

**Links:** [cmdk.vercel.app](https://cmdk.vercel.app) · [github.com/pacocoursey/cmdk](https://github.com/pacocoursey/cmdk) · Author: Paco Coursey; integrated at Vercel by Rauno Freiberg in 2020

---

## Sonner / cmdk singleton host pattern

**What to study:** How both libraries resolve the problem of global overlays through architectural convention: one host, many callers.

**The specific move:** Sonner mounts a single `<Toaster />` at the app root. Every `toast()` call anywhere in the tree dispatches to that one host. There is no per-component toast instance, no per-feature toast container, no local open state. The overlay is globally singleton by design. cmdk's reference `CommandDialog` wrapper follows the same shape: one `<CommandDialog>` in the root layout, triggers dispatch to open it. This matches the conceptual model. A command palette is not a feature-scoped surface; it is an application-level surface. Implementation reflects that.

The failure mode this prevents: a trigger+overlay bundled into a single component rendered multiple times (once per responsive breakpoint, once per nav slot) produces multiple parallel overlay instances. Only the visible one closes on selection; the rest remain as orphan portals in `document.body`, holding `pointer-events: none` on the body and blocking all interaction on the next page. No timing fix resolves this because the cause is structural. The singleton host pattern eliminates the structural condition.

**Principle:** #11 (match metaphor to medium: global overlays are conceptually singletons; implementation matches)

**Sources:** Emil Kowalski (Sonner) · Paco Coursey (cmdk, integrated at Vercel by Rauno Freiberg)

---

## Linear

**What to study:** Navigation hover delays. Keyboard-first model. Offline-first state. Information density.

**The specific move (hover intent):** Move the cursor slowly across the left sidebar nav items. Each item has a brief commit delay before the hover state activates. You can traverse the nav without triggering a cascade of active states. The interface distinguishes between "cursor passing through" and "cursor paused with intent." This is the canonical production implementation of principle #3.

**The specific move (density):** Open a project with many issues. Observe how much information is visible per row. Linear deliberately chooses maximum information density, with near-zero decoration. Status, priority, assignee, title, and label all coexist in a single row because the audience (product teams) needs to scan across all of them. The density is a product decision, not a default.

**The specific move (offline):** Open Linear and turn off your network connection. Navigate. Edit an issue. Create a new one. Reconnect. Everything syncs. The network boundary is invisible. This is the gold standard for principle #7.

**Observation source:** A pre-written 22 KB reverse-engineered observation of Linear's visual system (actual hex values, OpenType features, weights, letter-spacing at display sizes, border opacity values, shadow stacks) lives at [`nexu-io/open-design/design-systems/linear-app/DESIGN.md`](https://github.com/nexu-io/open-design/blob/main/design-systems/linear-app/DESIGN.md). Paired with `tokens.css` (machine-readable) and `components.html` (rendered reference). A rendered orbit-Linear template ships at `design-templates/orbit-linear/example.html` in the same repo. See the *systems-by-observation* exemplar below for the practice this represents.

**Principles:** #3 (intent: hover commit delays), #6 (ergonomics: keyboard-first), #7 (state: offline-first state preservation), #10 (density: deliberate, not default)

**Links:** [linear.app](https://linear.app) · [linear.app/method](https://linear.app/method) · Authors: the Linear team

---

## Vercel dashboard

**What to study:** Information density. Type system. Hover state hierarchy.

**The specific move (density):** Open the Vercel dashboard on a large screen. Count how much information is visible without scrolling. Deployments, domains, build status, runtime details, commit messages, branch names, timestamps. All coexist in a layout that is dense without being oppressive. Compare this to a generic SaaS dashboard that dedicates 80% of the viewport to three KPIs.

**The specific move (type system):** Observe how few font sizes are in use. The type scale is systematic. Titles, labels, values, timestamps, and captions each have a defined role. Per-element type decisions are gone; a system makes the decisions.

**Observation source:** [`nexu-io/open-design/design-systems/vercel/DESIGN.md`](https://github.com/nexu-io/open-design/blob/main/design-systems/vercel/DESIGN.md) ... a pre-written observation of Vercel's visual system with paired `tokens.css` and `components.html`. The rendered orbit-Vercel template (when present) ships at `design-templates/orbit-vercel/example.html`. See the *systems-by-observation* exemplar below.

**Principles:** #9 (decoration: near-zero chartjunk), #10 (density: intentionally high, appropriate for developer tools), #12 (type: systematic, not per-element decisions)

**Links:** [vercel.com/dashboard](https://vercel.com/dashboard) · [vercel.com/geist](https://vercel.com/geist) · Authors: the Vercel design organization

---

## Arc browser

**What to study:** Sidebar interaction model. Tab management. Command bar.

**The specific move (sidebar):** Hover slowly over the Arc sidebar tabs. The hover state is subtle and responsive to intent, not to cursor contact. Items expand on hover to reveal secondary actions (close, pin) without the expansion causing layout shift in the visible content.

**The specific move (command bar):** Open Arc's command bar (Cmd+T or the address bar interaction). The surface distinguishes between history browsing (spatial: where have I been?) and URL entry (intentional: I know where I am going). The metaphor for each mode is different, and the interface makes the mode switch legible.

The Browser Company pushed the browser interface further than anyone since the tab strip was invented. Whether or not you use Arc, it is worth studying as an example of rethinking a frozen UI pattern.

**Principles:** #3 (intent: hover reveals without committing), #6 (ergonomics: keyboard-first, sidebar targets are large), #11 (metaphor: different surfaces for different interaction types)

**Links:** [arc.net](https://arc.net) · Authors: the Browser Company design team (including Rauno Freiberg on early Arc)

---

## Notion slash menu

**What to study:** Inline action surface. Metaphor matching.

**The specific move:** In a Notion page, type `/`. The command menu appears inline, in the document, at the cursor position. You have not left the document. You have not opened a modal. You have not clicked a toolbar button. The action surface is the same surface as the content. The writing metaphor and the command metaphor coexist.

This is the clearest production example of principle #11 (match the metaphor to the medium) in document-style editing. The alternative (clicking a "+" button in a toolbar that opens a modal) breaks the writing metaphor. The slash menu does not.

Compare Notion's inline surface to any editor that opens a dialog for block insertion. The dialog is not wrong in isolation; it is wrong when the better answer is inline.

**Principle:** #11 (metaphor: inline command surface matches the writing medium)

**Links:** [notion.so](https://notion.so) · Authors: the Notion product team

---

## Raycast

**What to study:** Keyboard-first model. Command palette design. Extension surface.

**The specific move:** Open Raycast. Navigate through commands entirely on the keyboard. Note that every action, every result, every extension surface is reachable without touching the mouse. Keyboard navigation is not an accessibility add-on; it is the primary model.

Also study how Raycast handles the transition between modes (search results vs. form input for an extension). The mode switch is legible: the UI clearly communicates when you are selecting a command vs. filling a form. The transition is never ambiguous.

**Principles:** #3 (intent: keyboard model, no accidental triggers), #6 (ergonomics: keyboard-first is the ergonomic choice for power users)

**Links:** [raycast.com](https://raycast.com) · Authors: the Raycast team

---

## MercuryOS (Jason Yuan)

**What to study:** Ambient/spatial UI explorations. Action-first interfaces. Radial context menus.

**What this is:** A speculative design project, not shipping software. MercuryOS explored what an operating system UI might look like if it were designed around spatial relationships and ambient surfaces rather than windows and toolbars.

**The specific move:** Study the radial context menus in the MercuryOS prototype. Actions appear in spatial relationship to the object they act on, not in a list at the top of the screen. The metaphor is physical proximity, not hierarchy. The menu appears where the action is needed.

Also study the ambient surfaces: information appears in the environment of the work, not in a separate panel. The display-information vs. action-surface distinction is relaxed; context determines what appears.

MercuryOS is cited throughout Layer 4 practice because it makes legible a set of design ideas that are otherwise hard to articulate. Rauno Freiberg has referenced it directly.

**Principles:** #5 (sequence: causality is spatial, not temporal), #11 (metaphor: action surface matches spatial context)

**Links:** [mercuryos.com](https://www.mercuryos.com) · Author: Jason Yuan

---

## NotBoring iOS apps (Andy Allen)

**What to study:** Spring physics in native iOS. Considered playfulness. Honest tactile feedback.

**The specific move (Weather):** Open NotBoring Weather and interact with the main screen. Every interaction has spring physics. The elements have mass. When you poke something, it springs back. This is not cute animation; it is physical behavior that communicates the limits of the interaction space. The spring tells you: "this is as far as it goes."

**The specific move (Calculator):** Use the NotBoring Calculator. Each button has a satisfying press animation that uses spring physics, not a tween. The button looks like it depresses and returns. The visual behavior matches what a physical button would do. This is Chaudhri/Ording's rubber-banding logic applied to an input surface.

**The specific move (Habits):** Observe how Habits celebrates completions. The motion is expressive but honest: it communicates "you did the thing" without performing animation for its own sake. This is principle #1 applied with high motion appetite.

Andy Allen's work is at the intersection of Layer 3 (native iOS craft) and Layer 4 (considered web engineering sensibility). The line from Rams to Brichter to NotBoring is short and direct.

**Principles:** #2 (physics: spring physics throughout), #8 (affordances: interactions are discoverable through physical behavior, not labels)

**Links:** [notboring.software](https://notboring.software) · Author: Andy Allen

---

## Geist Design System (Vercel)

**What to study:** Type system. Color system. Density patterns.

**The specific move (type):** Read Geist's type documentation. The scale is modular. Sizes, weights, and leading are defined by the system, not per-element. Individual type decisions in the Vercel dashboard are not decisions at all ... they are lookups. The system makes them.

**The specific move (color):** Observe how Geist handles semantic color. Success, error, warning, info are each a role, not a hex value. The role maps to a value; the value can be themed. This is the correct model for any design system that will ever be maintained.

**Observation source:** The Vercel DESIGN.md (above) captures Geist's tokens and components in reverse-engineered form ... see [`design-systems/vercel/`](https://github.com/nexu-io/open-design/tree/main/design-systems/vercel) in `nexu-io/open-design`. The official Geist docs at [vercel.com/geist](https://vercel.com/geist) remain the authoritative source.

**Principles:** #9 (decoration: no chartjunk; every color token has a purpose), #12 (type: systematic, modular, auditable)

**Links:** [vercel.com/geist](https://vercel.com/geist) · Authors: the Vercel design organization

---

## iOS rubber-banding / inertial scroll

**What to study:** The original production example of physics in software.

**The specific move:** Scroll to the top of any list in iOS. Keep scrolling past the top. The content stretches with a rubber-band effect and snaps back when released. There is no "you've reached the top" message. There is no bounce animation with a fixed duration. The behavior is governed by spring physics: the further you stretch, the more resistance; the harder you release, the more snap-back velocity.

This is Imran Chaudhri and Bas Ording's work on the original iPhone. It is the canonical Layer 3 demonstration of Johnston and Thomas's Layer 0 principles... squash and stretch, slow-in/slow-out, and arc translated from cel animation into a touch interface. The rubber-band stretches with resistance (squash), snaps back with velocity matching the release force (follow-through), and settles with spring behavior rather than a tween (slow-out). Every spring animation on the web is, in some sense, a descendant of this interaction.

**Principle:** #2 (physics over duration: real springs, not eased tweens)

**Links:** Study in any iOS app. Source history: Imran Chaudhri and Bas Ording, Apple, 2007. Referenced in Rauno Freiberg's Devouring Details, "Simulating Physics."

---

## Pull-to-refresh (Loren Brichter / Tweetie)

**What to study:** Gestural affordance. Honest motion. State preservation.

**The specific move:** Pull the Tweetie timeline down. A loading indicator appears. Release. The content refreshes. This is a 2008 interaction that became the iOS standard, is in the Android HIG, and is in every native app that displays feeds.

What makes pull-to-refresh a lineage reference: it is a gestural affordance that is completely undiscoverable on first contact, and yet universally known. This is extreme principle #8 (affordances visible without being loud): the affordance is so well matched to the medium that it requires no signifier at all. The metaphor (pulling to refresh, like a pump) is so natural that the discovery moment is often described as "obviously."

Also note that Tweetie preserved tab state, scroll position, and draft text across background/foreground transitions. This was not common in 2008 and shaped the iOS expectation for principle #7.

**Principles:** #2 (physics: the rubber-band drag behavior), #11 (metaphor: physical pull metaphor for a data refresh)

**Links:** History well-documented in multiple interviews with Loren Brichter. Referenced in devour lineage at [`lineage.md`](lineage.md).

---

## Systems-by-observation (the Open Design DESIGN.md library)

**What to study:** The practice of reverse-engineering a brand's visual system by inspection, then writing it down as a reusable spec.

**The specific move:** Open [`nexu-io/open-design/design-systems/linear-app/DESIGN.md`](https://github.com/nexu-io/open-design/blob/main/design-systems/linear-app/DESIGN.md). Read the spec ... roughly 22 KB. Then open [linear.app](https://linear.app) with devtools and check what it captures: the marketing black at `#08090a`, Inter Variable with OpenType features `cv01` and `ss03`, weight 510 between regular and medium, aggressive negative letter-spacing at display sizes, semi-transparent white borders at 0.05 to 0.08 opacity. The numbers match. The same exercise repeats across ~150 brands in [`design-systems/`](https://github.com/nexu-io/open-design/tree/main/design-systems), each with a paired `tokens.css` and `components.html`.

**Why it matters:** Most exemplars in this file name a product to observe live. The Open Design library captures the observation in a transferable format, so a Devour finding can cite the actual hex or weight rather than asking the reader to inspect the live site. Treat the files as well-sourced reference with a freshness asterisk ... brands evolve, the specs lag.

**Principles:** #10 (density as captured craft choice), #12 (type system as captured lookup)

**Links:** [github.com/nexu-io/open-design/tree/main/design-systems](https://github.com/nexu-io/open-design/tree/main/design-systems) · Authors: the Nexa team and contributors. Repo is Apache 2.0.
