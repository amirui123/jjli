# Laws of UX

*Naming and framing based on the corpus popularized by Jon Yablonski, [lawsofux.com](https://lawsofux.com), enriched with associated classic principles from the wider UX/psychology literature.*

Each law: short definition, practical design implication, concrete example. Based on the corpus popularized by Jon Yablonski ("Laws of UX"), enriched with associated classic principles.

## Fitts's Law
**Definition**: the time to reach a target depends on its size and the distance to it. The smaller or farther the target, the longer it takes to reach.
**Implication**: frequent or critical actions (confirm, send, close) should be large and close to the natural point of interaction; rare or destructive actions can be smaller/farther to avoid accidental clicks.
**Example**: a full-width "Send" button on mobile rather than a small text link; a close button (X) large enough to tap without needing pixel-precise aim.

## Hick's Law (Hick-Hyman Law)
**Definition**: decision time increases with the number and complexity of options.
**Implication**: reduce the number of choices visible at once, or group/prioritize them to lower decision load.
**Example**: a navigation menu with 5 main entries and submenus, rather than 20 flat links; a plan-selection page highlighting 3 plans rather than listing 10.

## Jakob's Law
**Definition**: users spend most of their time on other sites/apps; they prefer a product to work according to conventions they already know.
**Implication**: follow established conventions (cart icon top right, clickable logo returning home, X to close) unless there's a strong reason to deviate.
**Example**: keeping the "swipe to delete" pattern on a mobile list rather than inventing a proprietary gesture.

## Miller's Law
**Definition**: human working memory holds on average 7±2 items (often narrowed to 4±1 in more recent research) at once.
**Implication**: group information into chunks rather than presenting a long flat list; limit the number of simultaneous items in a menu or form.
**Example**: a phone number displayed in blocks (555 123 4567) rather than as one continuous string; a long form broken into steps with a few fields each.

## Tesler's Law (Law of Conservation of Complexity)
**Definition**: every application has an irreducible level of complexity; the only question is who absorbs it, the system or the user.
**Implication**: shift complexity toward the system (smart defaults, auto-detection, automatic calculations) rather than offloading it onto the user.
**Example**: auto-detecting the country/phone format from geolocation rather than a field where the user must manually pick the dialing code.

## Doherty Threshold
**Definition**: user productivity and engagement rise sharply when the system responds in under ~400ms.
**Implication**: optimize perceived speed (immediate visual feedback, loading skeletons, optimistic UI) even if the actual processing takes longer.
**Example**: showing the added item in the cart immediately with a "pending" state, rather than waiting for server confirmation before any display.

## Von Restorff Effect (Isolation Effect)
**Definition**: among several similar elements, the one that stands out visually is remembered better.
**Implication**: use visual distinction sparingly and intentionally, on the element that truly needs to stand out (primary CTA, recommended offer).
**Example**: visually highlighting the "most popular" plan in a pricing grid.
**Caution**: if everything is highlighted, nothing stands out, the effect only works through rare contrast.

## Zeigarnik Effect
**Definition**: interrupted or incomplete tasks are remembered better than completed ones.
**Implication**: use visible progress (completion bars, "3/5 steps") to motivate finishing a flow; be careful not to create frustration with tasks left open for no reason.
**Example**: a profile-completion progress bar ("70% complete") that nudges users to finish filling it in.

## Postel's Law (Robustness Principle)
**Definition**: be liberal in what you accept, strict in what you produce.
**Implication**: accept varied input formats from users (spaces, dashes in a phone number, case in an email) and normalize them yourself rather than rejecting with an error.
**Example**: a search field that tolerates typos and variations rather than requiring an exact match.

## Aesthetic-Usability Effect
**Definition**: an interface perceived as aesthetically pleasing is perceived as more usable, regardless of its actual usability, which can also mask real usage problems during testing.
**Implication**: visual polish isn't cosmetic, it affects trust and tolerance for imperfections; but don't confuse "it looks good" with "it's been tested and it works."
**Example**: two equally functional forms, where the one with polished design is judged more trustworthy by users.

## Peak-End Rule
**Definition**: the memory of an experience is dominated by its most intense moment (positive or negative) and by how it ends, more than by its overall average.
**Implication**: pay special attention to moments of maximum friction (error, payment, long loading) and to the very end of a flow (confirmation, success message).
**Example**: a polished, warm order-confirmation screen, even if the rest of the checkout flow was neutral.

## Serial Position Effect
**Definition**: in a list, the first and last items are remembered better than the ones in the middle.
**Implication**: place the most important items at the beginning and end of a list/menu.
**Example**: in a horizontal navigation menu, putting key entries (Home, Contact/Cart) at the ends.

## Goal-Gradient Effect
**Definition**: motivation to continue a task increases as one gets closer to the goal.
**Implication**: display progress and, where possible, start the progress bar slightly advanced to encourage continuation.
**Example**: a loyalty card shown with 2 stamps already earned from the start rather than empty.

## Occam's Razor
**Definition**: given equivalent outcomes, prefer the simplest solution.
**Implication**: when in doubt between two design solutions achieving the same goal, choose the one with fewer elements, steps, or concepts to learn.
**Example**: removing an intermediate confirmation step if it doesn't add real value to the security of the action.

## Parkinson's Law
**Definition**: a task expands to fill the time allotted to it.
**Implication**: constraining available time or space can speed up decision-making or output (e.g. character limits, visible deadlines).
**Example**: a "bio" field capped at 160 characters that pushes toward conciseness, rather than an unlimited field that invites procrastination.
