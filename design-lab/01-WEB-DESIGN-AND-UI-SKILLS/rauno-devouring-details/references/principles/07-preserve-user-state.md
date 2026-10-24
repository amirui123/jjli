# Principle 7 ... Preserve user state across boundaries

> Loading must not lose your scroll, your selection, your draft.

## What it means

Every state the user has accumulated... scroll position, text draft, selection, active tab, current filter... represents work the user did. Navigation, refresh, or network boundary events that discard that work transfer the cost of the system's architecture to the user. State preservation is not a feature; it is the interface paying back what the user invested.

## Why it matters

Bruce Tognazzini's First Principles establish state preservation as a primary usability requirement. Andy Matuschak's work on working memory as a first-class design constraint makes the cognitive dimension explicit: the interface should externalize state the user has accumulated so they do not have to hold it mentally across boundaries. Loren Brichter built Tweetie with tab state, scroll position, and draft text preserved across background/foreground transitions in 2008... when this was not common. The Linear team made offline-first state preservation a core product decision: the network boundary is invisible.

## Register sensitivity

**`brand`** ... applies mostly to long forms (pricing configurators, multi-step signup, contact/lead forms). Loss of scroll position on navigation back to a long marketing page is 🟡 DRIFT. Loss of form draft on refresh is 🔴 BREAK when the form is long enough to represent significant user investment.

**`product`** ... everywhere. Scroll position, selection state, filter state, draft content, subscription-flow stage, session context must all survive navigation and refresh. Loss of any of these is 🔴 BREAK on any flow that's not a one-shot form. Linear's offline-first model is the bar.

**Common ground** ... page refresh that resets scroll to top when the user was deep in the page is 🔴 in both. Navigation away and back that loses unsaved form state is 🔴 in both.

## Tactics

- Store active tab in the URL query string (`?tab=overview`), not in component state. This gives shareability, browser history correctness, and refresh survival at minimal cost.
- Persist long-form field values to `localStorage` and restore on mount. Clear the draft on successful submission.
- Preserve selection through filter changes. Selected item IDs are independent of visible items.
- Handle the navigation/cleanup race explicitly: state cleanup before route push, never concurrent. Close portals before navigating.

## Anti-patterns

- **Scroll reset on navigation:** Route change resets page scroll to top. Users who navigated to a specific row in a long list must scroll back.
- **Lost form state on refresh:** Long form loses all progress on accidental navigation. The user's work is gone.
- **Tab state not in URL:** Active tab stored in `useState`. Refresh loses it. Sharing a URL shares the wrong view. Browser back navigates away from the page.
- **Selection cleared on filter change:** Multi-select list resets selection whenever filter or sort changes. The user's decision about which items to act on is discarded.

## Exemplars

- **Linear offline-first:** Open on a plane, navigate, edit, create. Reconnect on the ground. Everything syncs. The network boundary is invisible. This is the gold standard.
- **Tweetie (Loren Brichter):** Tab state, scroll position, and draft text survived background/foreground transitions in 2008. It shaped the iOS expectation for state continuity.

## Further study

- Andy Matuschak, andymatuschak.org ... working memory as a design constraint; state externalization patterns
- Bruce Tognazzini, First Principles of Interaction Design (asktog.com) ... state preservation as a foundational requirement
