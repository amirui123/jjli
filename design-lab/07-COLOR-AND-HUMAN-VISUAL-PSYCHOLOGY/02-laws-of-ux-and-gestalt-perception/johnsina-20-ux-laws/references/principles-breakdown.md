# Comprehensive Guide: 20 Laws of UX & Cognitive Psychology

This reference covers the 20 UX laws used by `SKILL.md`: their origins, caveats, and Do's and Don'ts. Applicability (Core or Contextual) is defined **only** in the `SKILL.md` §3 matrix, and the scope lines below repeat it. Grading evidence is in `SKILL.md` §4.

---

## Table of Contents
1. [Hick's Law](#1-hicks-law)
2. [Fitts's Law — target size (with stretched-link caveat)](#2-fittss-law)
3. [Jakob's Law](#3-jakobs-law)
4. [Law of Proximity](#4-law-of-proximity)
5. [Miller's Law](#5-millers-law)
6. [Doherty Threshold](#6-doherty-threshold)
7. [Von Restorff Effect](#7-von-restorff-effect)
8. [Minimize Target Distance](#8-minimize-target-distance)
9. [Serial Position Effect](#9-serial-position-effect)
10. [Peak-End Rule](#10-peak-end-rule)
11. [Zeigarnik Effect](#11-zeigarnik-effect)
12. [Law of Prägnanz](#12-law-of-prägnanz)
13. [Law of Similarity](#13-law-of-similarity)
14. [Uniform Connectedness](#14-uniform-connectedness)
15. [Tesler's Law](#15-teslers-law)
16. [Postel's Law](#16-postels-law)
17. [Aesthetic-Usability Effect](#17-aesthetic-usability-effect)
18. [Parkinson's Law](#18-parkinsons-law)
19. [Occam's Razor](#19-occams-razor)
20. [Pareto Principle](#20-pareto-principle)

---

### 1. Hick's Law
> *Choice reaction time increases logarithmically with the number of equally likely alternatives.*

* **Origin**: William Edmund Hick (1952) and Ray Hyman (1953).
* **Formula**: $T = a + b \cdot \log_2(n + 1)$
* **Caveat**: The law holds for choices among known, equally likely options. When users scan an unfamiliar menu, search time grows closer to linearly, so organisation and familiarity matter more than the raw count. Never grade on option count alone.
* **Scope**: Core for Marketing and Forms. Contextual for SaaS (menus, filters) and Content (navigation).
* **Do**:
  - Break multi-step processes into sequential steps (wizards).
  - Use progressive disclosure to show advanced options only when requested.
  - Highlight a single "Recommended" option to reduce decision paralysis.
* **Don't**:
  - Present flat menus of 15+ choices with identical visual weight.

---

### 2. Fitts's Law
> *The time to acquire a target is a function of the distance to the target and the width of the target.*

* **Origin**: Paul Fitts (1954). The Shannon formulation $MT = a + b\log_2(D/W + 1)$ is the one used in ISO 9241-9.
* **Formula**: $MT = a + b \cdot \log_2 \left( \frac{2D}{W} \right)$
* **In this skill**: law 2 grades **W (size)** only. **D (distance)** is graded by law 8, so the same element is never cited under both.
* **Scope**: Core for SaaS and Forms. Contextual for Marketing (CTAs) and Content (navigation).
* **Size goal vs conformance**: Fitts's Law sets no minimum size. The 44×44 goal comes from Apple's HIG and WCAG 2.5.5 (AAA), and 48×48 dp from Material. The AA requirement is WCAG 2.2 **2.5.8: 24×24 CSS px**, with a spacing alternative and exceptions (`SKILL.md` §6). Missing the 44 goal is a Warning on touch-first surfaces. A 2.5.8 result is a separate conformance note.

#### ⚠️ Critical Auditor Heuristic: The Stretched-Link Pattern
When inspecting HTML/CSS or executing automated accessibility sweeps, **do not evaluate touch targets solely by the bounding box of `<a>` or `<button>` tags**.

Modern web patterns frequently stretch the interactive hit area of a small text link or icon across an entire card container:

```html
<!-- Example: Accessible Card with Stretched Link -->
<div class="card" style="position: relative; width: 320px; height: 220px;">
  <h3>Product Title</h3>
  <p>Description text...</p>
  <a href="/details" class="card-link">Learn more about Product Title</a>
</div>
```
```css
/* Card Link stretches over the entire parent card */
.card-link::after {
  content: "";
  position: absolute;
  inset: 0; /* top: 0; right: 0; bottom: 0; left: 0; */
  z-index: 1;
}
```
* **Auditor rule**: On a live page, measure the effective target by hit-testing points with `document.elementFromPoint`. With CSS only, the stretched pseudo-element covers its **containing block**. Start at the anchor that generates it, because a positioned anchor contains its own overlay. Otherwise it is the nearest positioned ancestor, or one that establishes a containing block another way. Examples are `transform`, `filter`, `backdrop-filter`, `perspective`, `contain` and `container-type`, and the list isn't exhaustive. Then subtract clipping (`overflow: hidden`, `clip-path`) and overlays (a higher `z-index`, `pointer-events: none`), and label the result "static estimate". **The effective target $W$ is that region (e.g. $320 \times 220\text{px}$), not the inline text box ($80 \times 16\text{px}$).**
* **Nested controls**: any other link or button inside the card must sit above the overlay (`position: relative; z-index: 2`), or it can't be clicked. Grade that under Jakob's Law (law 3).
* **Link text**: the stretched anchor's name must describe its destination (WCAG 2.4.4). Avoid a bare "Learn more".

* **Do**:
  - Aim for 44×44 or 48×48 targets on touch-first surfaces, and never go below 24×24 without the 2.5.8 spacing exception.
  - Make the whole card or row clickable when the whole card or row is the target.
* **Don't**:
  - Flag accessible container cards as Fitts's violations just because the text inside is small.

---

### 3. Jakob's Law
> *Users spend most of their time on other websites, so they prefer your site to work like the ones they already know.*

* **Origin**: Jakob Nielsen (2000).
* **Scope**: Core across all site types.
* **Do**:
  - Use recognizable UI conventions (cart top-right, search in header, logo returns home).
  - Maintain established visual affordances (buttons look clickable, inputs look editable).
* **Don't**:
  - Reinvent common UI patterns purely for stylistic novelty (e.g., custom scrollbars that break wheel gestures).

---

### 4. Law of Proximity
> *Objects that are near each other tend to be grouped together.*

* **Origin**: Gestalt psychology (Max Wertheimer, 1923).
* **Scope**: Core across all site types.
* **Do**:
  - Keep form field labels closer to their corresponding input than to neighboring inputs.
  - Employ a proportional spacing scale (e.g., 8pt grid) where outer section margins are $2\times$ to $3\times$ group margins.
* **Don't**:
  - Use equidistant whitespace between related sub-elements and unrelated section dividers.

---

### 5. Miller's Law
> *Working memory holds only a few chunks at a time.*

* **Origin**: George A. Miller (1956), "7 ± 2" for immediate-recall span. Cowan (2001) estimates about 4 chunks.
* **Caveat**: The law concerns **recall**. Visible menus and lists are *recognised*, so 7±2 is **not** a cap on navigation items. Don't grade nav length with it. That's Hick, and scanning cost.
* **Scope**: Core for SaaS and Forms. Contextual for Marketing (comparison tables) and Content (long procedures).
* **Do**:
  - Chunk long values (card numbers, phone numbers, keys) into 3–4 character groups.
  - Keep the information needed for a decision visible where the decision is made.
* **Don't**:
  - Require users to memorize values on screen A to type them on screen B.

---

### 6. Doherty Threshold
> *Productivity soars when computer and users interact at a pace (< 400ms) that ensures neither waits on the other.*

* **Origin**: Walter J. Doherty and Ahrin J. Thadhani (IBM, 1982).
* **Scope**: Core for SaaS and Forms. Contextual for Marketing (interactive widgets) and Content (search).
* **Related limits**: 0.1 s feels instant, 1 s keeps flow, and 10 s holds attention (Miller 1968; Card, Robertson & Mackinlay 1991; Nielsen).
* **Do**:
  - Provide immediate feedback (< 100ms) on clicks (active states, ripple animations).
  - Use skeleton screens to render layout immediately while async data loads.
* **Don't**:
  - Display uninformative full-screen spinners or freeze user input without feedback.

---

### 7. Von Restorff Effect (Isolation Effect)
> *When multiple similar objects are present, the one that differs from the rest is most likely to be remembered.*

* **Origin**: Hedwig von Restorff (1933).
* **Scope**: Core for Marketing. Contextual elsewhere (primary action, callouts).
* **Do**:
  - Give the primary recommended tier or conversion CTA distinctive elevation, border, or accent color.
* **Don't**:
  - Apply high-contrast accent colors to secondary or tertiary buttons simultaneously.

---

### 8. Minimize Target Distance
> *Reducing the distance a cursor or finger must travel speeds up interaction and reduces motor fatigue.*

* **Origin**: The **D term of Fitts's Law**. It isn't an independent law. This skill grades distance here and size under law 2, and never the same defect under both.
* **Scope**: Core for SaaS and Forms. Contextual for Marketing (interactive widgets). N/A for Content.
* **Do**:
  - Provide contextual actions (hover menus, right-click actions, inline edit buttons).
  - Place submission/confirmation controls close to the last entered field.
* **Don't**:
  - Force desktop users to move their cursor across 1920px between an input and its save button.

---

### 9. Serial Position Effect
> *Users best remember the first (primacy) and last (recency) items in a series.*

* **Origin**: Hermann Ebbinghaus (1885); free-recall curve by Murdock (1962).
* **Scope**: Core for Content. Contextual for Marketing (navigation, ordered lists), SaaS (navigation) and Forms (step lists, long option lists).
* **Do**:
  - Place the most critical navigation anchors (e.g., Home, Features at start; Sign Up / Pricing at end).
* **Don't**:
  - Place the primary conversion link in the middle of a 7-item navigation menu.

---

### 10. Peak-End Rule
> *People judge an experience largely based on how they felt at its peak and at its end.*

* **Origin**: Fredrickson & Kahneman (1993); Kahneman et al. (1993).
* **Scope**: Core for Forms. Contextual for Marketing (any **conversion flow**: form, sign-up or purchase. The end event is what happens after submit, and a missing or blank confirmation is a Fail, not N/A) and SaaS (completable tasks). N/A for Content.
* **Do**:
  - Design memorable, positive confirmation states (e.g., celebration animations, clear receipt/next-steps).
  - Provide friendly, actionable recovery guidance on 404 or form failure states.
* **Don't**:
  - Leave users on an abrupt blank screen or vague message after completing a transaction.

---

### 11. Zeigarnik Effect
> *People remember uncompleted or interrupted tasks better than completed tasks.*

* **Origin**: Bluma Zeigarnik (1927).
* **Caveat**: Replications of the memory advantage for unfinished tasks are inconsistent. Progress indicators are better justified by **visibility of system status** (Nielsen heuristic #1) and the **goal-gradient effect**. Treat Zeigarnik as supporting rationale, not the basis of the grade.
* **Scope**: Core for Forms. Contextual for Marketing (multi-step widget) and SaaS (onboarding checklist). N/A for Content.
* **Do**:
  - Show explicit progress bars (`"Profile 75% complete"`) and step indicators (`"Step 2 of 4"`).
* **Don't**:
  - Hide progress on complex, mandatory multi-page flows.

---

### 12. Law of Prägnanz (Simplicity)
> *The human eye interprets ambiguous or complex shapes in the simplest, most orderly form possible.*

* **Origin**: Gestalt psychology.
* **Scope**: Core across all site types.
* **Do**:
  - Use clean grids, standard rectangular cards, and predictable alignments.
* **Don't**:
  - Layer irregular, overlapping shapes **in the interactive structure**, so the user has to decode the UI. Decoration that follows a declared visual style (e.g. Scrapbook, Maximalism) is not a violation; see `SKILL.md` §5.

---

### 13. Law of Similarity
> *Elements that share visual characteristics are perceived to have the same role or function.*

* **Scope**: Core across all site types.
* **Do**:
  - Keep styling consistent across all interactive components (buttons, links, form fields).
* **Don't**:
  - Style regular text with blue underlined styling if it is not an anchor link.

---

### 14. Uniform Connectedness
> *Visually connected elements are perceived as more related than elements with no explicit link.*

* **Origin**: Irvin Rock and Stephen Palmer (1990).
* **Scope**: Core across all site types.
* **Do**:
  - Group related form controls or metrics inside clear card containers, panels, or linked borders.
* **Don't**:
  - Rely exclusively on subtle whitespace when grouping disparate data tables or disparate actions.

---

### 15. Tesler's Law (Conservation of Complexity)
> *Every system has an irreducible amount of complexity that must be handled either by the system or the user.*

* **Origin**: Larry Tesler (mid-1980s).
* **Scope**: Core for SaaS and Forms. Contextual for Marketing (interactive widget). N/A for Content.
* **Do**:
  - Absorb complexity behind the scenes (auto-detect card issuer, auto-fill address from postal code).
* **Don't**:
  - Expose raw database configurations or complex internal settings directly to end users.

---

### 16. Postel's Law (Robustness Principle)
> *Be liberal in what you accept, and conservative in what you send.*

* **Origin**: Jon Postel, the robustness principle in RFC 760 (IP, 1980) and RFC 761 (TCP). RFC 9413 (2023) documents its downsides for protocols: leniency hides errors.
* **Scope**: Core for SaaS and Forms. Contextual for Marketing (input fields). N/A for Content.
* **Do**:
  - Accept phone numbers with dashes, spaces or parentheses, and normalise them.
  - Accept **unambiguous** date forms (`2026-09-21`, `21 Sept 2026`). For numeric dates such as `03/04/2026`, which can be read as MM/DD or DD/MM, use a date picker or a locale-explicit format, and echo the parsed date back. Never silently guess.
* **Don't**:
  - Reject a form submission simply because a user included spaces in a credit card number.

---

### 17. Aesthetic-Usability Effect
> *Users perceive aesthetically pleasing designs as more usable and are more tolerant of minor defects.*

* **Origin**: Masaaki Kurosu and Kaori Kashimura (1995).
* **Scope**: Core for Marketing. Contextual elsewhere (first-run screens, public forms, landing docs).
* **Do**:
  - Invest in typographic hierarchy, balanced color palettes, and micro-interactions.
* **Don't**:
  - Use aesthetic polish to mask broken core functionality or broken navigation.

---

### 18. Parkinson's Law
> *Work expands to fill the time available for its completion.*

* **Origin**: Cyril Northcote Parkinson (1955), an observation about bureaucratic work.
* **In this skill**: it grades **time expectations**: whether the interface tells users how long a task will take and cuts effort with defaults and autofill. The remedies come from that goal, not from the original law.
* **Scope**: Core for Forms. Contextual for Marketing (multi-step widget) and SaaS (long tasks). N/A for Content.
* **Do**:
  - Provide autofill, browser credential autocomplete, and realistic completion time estimates (`"Takes ~2 minutes"`).
* **Don't**:
  - Drag out simple account creation over 6 disconnected screens.

---

### 19. Occam's Razor
> *Among competing designs that solve the problem equally well, the simplest one with the fewest assumptions is best.*

* **Origin**: William of Ockham (14th century).
* **Scope**: Core across all site types.
* **Do**:
  - Eliminate redundant form fields, unnecessary confirmation dialogs, and decorative clutter.
* **Don't**:
  - Build complex multi-tier dropdowns when a simple segmented control suffices.

---

### 20. Pareto Principle (80/20 Rule)
> *Roughly 80% of user activity stems from 20% of features.*

* **Origin**: Vilfredo Pareto (1896); applied to software usage by Juran.
* **Evidence**: Frequency has to come from usage data or research. Without it, report **Not assessed**. Don't guess which features are popular.
* **Scope**: Core for Marketing and SaaS. Contextual for Forms (optional fields) and Content (navigation).
* **Do**:
  - Give prominent space primarily to the most-used actions, and keep rare but critical actions (recovery, safety, legal) findable.
  - Move edge-case or administrative tools into secondary settings menus.
* **Don't**:
  - Give equal visual emphasis to a feature used daily and a feature used once a year.
