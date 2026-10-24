# The 20 laws of UX, for auditing a real screen

Use this in phase 4. For each law, write one entry for the screen in front of you: the **evidence** (a measured number, a file and line, an observation from a screenshot) and a **directive** that names a real element and says what to do with it. A law with nothing to say about this screen gets one line saying so. Two or three sentences per law is plenty.

The words on the screen are audited separately: see `ux-copy.md`. Several laws below (peak-end, Tesler, Postel, Hick) have a copy side, and the table there maps them.

## Contents

- [How the laws fit together](#how-the-laws-fit-together)
- [Names people get wrong](#names-people-get-wrong)
- Choice and effort: [1 Hick](#1-hicks-law) · [2 Fitts](#2-fittss-law-and-minimizing-target-distance) · [3 Tesler](#3-teslers-law) · [4 Occam](#4-occams-razor) · [5 Pareto](#5-pareto-principle)
- Perception: [6 Prägnanz](#6-law-of-prägnanz) · [7 Proximity](#7-law-of-proximity) · [8 Similarity](#8-law-of-similarity) · [9 Common region](#9-law-of-common-region) · [10 Uniform connectedness](#10-law-of-uniform-connectedness) · [11 Von Restorff](#11-von-restorff-effect)
- Memory and attention: [12 Miller](#12-millers-law) · [13 Serial position](#13-serial-position-effect) · [14 Zeigarnik](#14-zeigarnik-effect) · [15 Peak-end](#15-peak-end-rule)
- Expectation, time and robustness: [16 Jakob](#16-jakobs-law) · [17 Doherty](#17-doherty-threshold) · [18 Postel](#18-postels-law) · [19 Parkinson](#19-parkinsons-law)
- Feel: [20 Aesthetic-usability](#20-aesthetic-usability-effect)
- [Other laws worth reaching for](#other-laws-worth-reaching-for)
- [Target-size numbers](#target-size-numbers)

## How the laws fit together

They are heuristics drawn from psychology and engineering, and they pull against each other. Hick says show fewer options; Fitts says make each one bigger and closer; Pareto says optimize the common path; Jakob says don't surprise people. Settle conflicts in this order:

1. **The domain rules** the screen must express. A law never justifies hiding a rule or inventing one.
2. **Task frequency** (Pareto). The weekly task beats the yearly one for prominence, but the yearly one stays reachable.
3. **Measured problems** from phase 3. A law that explains a measured problem outranks one that doesn't.
4. **Convention** (Jakob) where the other three don't decide.

Several laws are really one idea seen from different sides. Proximity, Similarity, Common region and Uniform connectedness are the Gestalt grouping laws: together they decide what reads as related. Hick, Miller and Occam are all about load. Use that to keep directives from repeating.

## Names people get wrong

When a user supplies a list, correct these out loud and move on:

| Written as | Correct name | Note |
|---|---|---|
| Zeigamnik, Zeigernik | **Zeigarnik effect** | After Bluma Zeigarnik. |
| Law of Pregnanz | **Law of Prägnanz** | German for "conciseness". |
| Tester's law | **Tesler's law** | After Larry Tesler. |
| Posters law, Postal's law | **Postel's law** | After Jon Postel. |
| Uniform connec… | **Law of uniform connectedness** | Palmer and Rock. |
| Minimize target distance | Part of **Fitts's law** | Distance is half of Fitts's formula. It isn't a separate law. |
| "Keep patterns consistent" | **Law of similarity** (plus Jakob's law for outside conventions) | Not Postel's law. |
| "Connect related elements visually" | **Uniform connectedness** and **Common region** | Not Postel's law. |
| Doherty's law | **Doherty threshold** | |
| Aesthetic usability | **Aesthetic-usability effect** | |

Lists copied from two-column infographics often arrive numbered out of order (1, 11, 20, 12, 3…). Renumber them.

---

## Choice and effort

### 1. Hick's law

**Says:** the time to decide grows with the number and complexity of the choices, roughly logarithmically. Hick (1952) and Hyman (1953): RT = a + b·log₂(n + 1).

**Look for:** a row of equal-weight buttons; menus where the right option is buried among rarely used ones; a flat list of candidates with no ranking; several ways to do the same thing; status strips with many item types.

**Directives that work:** lead with the 1–3 options that fit the situation and collapse the rest under plain headings; replace several typed buttons with one action whose context decides the type; progressive disclosure for rare settings; smart defaults.

**Caveat:** it models choosing among unfamiliar, equally likely options. Experts who know what they want *search* rather than choose, so a longer list with good search can beat a shorter one. Hick's law is not an argument for removing features; it is an argument for ranking and grouping them.

### 2. Fitts's law (and minimizing target distance)

**Says:** the time to reach a target depends on its distance and size. Fitts (1954); the Shannon form is MT = a + b·log₂(D/W + 1). Larger and closer is faster. Screen edges and corners behave like infinitely large targets for a mouse.

**Look for:** small controls (measure them), icon-only buttons, hover-only controls, actions far from the thing they act on, a detail panel that opens across the screen from the item clicked, destructive and common actions placed side by side.

**Directives that work:** make whole rows, cards or empty cells the target; put the action on or beside its object (a card anchored to the item, an inline fix next to the issue); keyboard shortcuts as zero-distance targets; generous padding rather than bigger glyphs. For distance, put the next step where attention already is, *without crowding*: keep destructive actions apart from frequent ones.

**Caveat:** size has diminishing returns, and giant targets cost space that Hick and Miller care about. See [Target-size numbers](#target-size-numbers) for the platform minimums.

### 3. Tesler's law

**Says:** every system has complexity that can't be removed, only moved. The question is whether the user or the system carries it. Larry Tesler, conservation of complexity (Xerox PARC and Apple, 1980s).

**Look for:** users re-entering what the system knows; users working out eligibility, rules or totals in their head; format errors the system could have fixed; jargon the user must translate.

**Directives that work:** the system pre-computes who or what qualifies and says why; one plain sentence per verdict; defaults from history; accept messy input and normalize it (see Postel).

**Caveat:** absorbing complexity is not hiding it. When the rule matters (a legal minimum, a price), show the verdict and let the user see the reason. Oversimplifying moves the complexity into errors.

### 4. Occam's razor

**Says:** among options that work equally well, prefer the one with the fewest assumptions and parts. William of Ockham, 14th century.

**Look for:** the same information shown twice; two controls for one job; decorative elements with no meaning; legends needed to read the screen; rules the UI enforces that the domain doesn't have.

**Directives that work:** one way to do each thing; merge duplicates; make each element self-explanatory so no legend is needed; delete anything that carries no meaning; add no rule that isn't in the source documents.

**Caveat:** simplest is not fewest pixels. Removing a label or a confirmation that users need is not simplification.

### 5. Pareto principle

**Says:** a minority of causes produce most of the effect. Pareto (1896, land ownership); Juran generalized it as "the vital few". In UX: a few tasks account for most use.

**Look for:** the most frequent task taking more steps than a rare one; rare settings given prime space; frequent actions hidden at some widths.

**Directives that work:** list the tasks by frequency (phase 1) and optimize the top row first; give rare controls quieter, secondary places.

**Caveat:** 80/20 is a pattern, not a law of nature, and not a license to drop rare tasks that are critical: compliance, recovery, undo, accessibility, the once-a-year closing. Rare should be quiet, never missing. Measure frequency rather than guessing it.

---

## Perception

### 6. Law of Prägnanz

**Says:** people perceive ambiguous or complex arrangements in the simplest form they can. Gestalt psychology (Wertheimer, Koffka, 1920s–30s). Also called the law of simplicity or good figure.

**Look for:** components made of many small parts; nested boxes; inconsistent shapes for one kind of thing; several badges on one item.

**Directives that work:** each component is one clean shape with one line of content where possible; at most one status icon per item; flatten nesting; remove borders that don't separate anything.

**Caveat:** simplicity serves recognition; strip too much and items become indistinguishable.

### 7. Law of proximity

**Says:** things near each other are seen as a group. Gestalt (Wertheimer, 1923).

**Look for:** uniform spacing everywhere, so nothing groups; a label equally far from two fields; an action or verdict far from what it's about; related facts split across the screen.

**Directives that work:** space inside a group clearly smaller than space between groups (a 1:2 ratio or more); put the fix next to the problem, the count next to what it counts, the status next to what it describes.

**Caveat:** proximity is the weakest signal to override. A border or a connecting line wins over closeness, so don't rely on spacing alone when two groups touch.

### 8. Law of similarity

**Says:** things that look alike are seen as related and as doing the same job. Gestalt. This is the **"keep patterns consistent"** law.

**Look for:** one treatment carrying many meanings (a dashed border, a colour, a glyph that means five different things); one meaning drawn several ways (two button styles for the same action); success styled like a warning; links that don't look like links.

**Directives that work:** one visual treatment, one meaning, everywhere on the screen and across the product; write the mapping down in the brief ("amber = deficit, always with an icon and words").

**Caveat:** consistency within the product beats consistency with an abstract rule; where outside convention matters, see Jakob's law.

### 9. Law of common region

**Says:** things inside a shared boundary (a card, a background, a band) are seen as a group, even when they are far apart or look different. Palmer (1992). Half of **"connect related elements visually"**.

**Look for:** groups that should read as one but have no container; boxes inside boxes inside boxes; containers that group things that aren't related.

**Directives that work:** use a region for each real group (a day, a band, a form section); at most two levels of nesting; a background tint often groups better than a border.

**Caveat:** every region adds visual weight. When spacing alone already groups things, a box is noise.

### 10. Law of uniform connectedness

**Says:** things that are visibly connected (by a line, a shared colour, a frame, or highlighting together) are seen as more related than things that are only close or similar. Palmer and Rock (1994). The other half of **"connect related elements visually"**.

**Look for:** related items that can't sit together (one person's shifts across a week, a summary item and the cell it refers to, a primary and a backup); steps of a process with no visible path.

**Directives that work:** highlight every instance of the same thing when one is hovered or searched; pair items with a shared line or tint; hovering a summary item highlights its target; steppers and progress lines for sequences.

**Caveat:** connection is a strong signal, so use it only for real relationships; decorative lines imply structure that isn't there.

### 11. Von Restorff effect

**Says:** the item that differs from its surroundings is noticed and remembered. Hedwig von Restorff (1933), the isolation effect.

**Look for:** everything shouting (many colours, bold, badges), so nothing stands out; the most serious state drawn the same as a minor one; warnings on screens where nothing is wrong (alarm fatigue); the primary action styled like the others.

**Directives that work:** reserve the single loudest treatment for the single most important state; keep everything else calm so real problems have room; one primary action per view.

**Caveat:** never rely on colour alone (WCAG 1.4.1): pair it with an icon and words. Things that look like ads get ignored (banner blindness), so "different" must still look like content.

---

## Memory and attention

### 12. Miller's law

**Says:** working memory holds a small number of chunks. Miller (1956) said "seven, plus or minus two"; Cowan (2001) put it nearer four.

**Look for:** a legend the user must memorize (seven role colours, eight border styles); codes to remember between screens; information the user must carry from one step to the next; long unchunked strings.

**Directives that work:** at most about five visual encodings on a screen, each self-explanatory; group long lists into three or four labelled groups; keep what the user needs in view instead of in memory; chunk numbers and codes.

**Caveat:** it is about what people must *hold in mind*, not about how many items may be *visible*. Recognition is cheap and recall is expensive, so a menu of twelve well-labelled items is fine. Don't cite Miller to cap navigation at seven.

### 13. Serial position effect

**Says:** people remember the first items (primacy) and the last (recency) in a series better than the middle. Ebbinghaus (1885); Murdock (1962).

**Look for:** the most important status buried mid-screen; key navigation items in the middle; the best candidates in the middle of a list; the confirmation of a finished task missing at the end.

**Directives that work:** status first (top-left for left-to-right readers); the action or confirmation that ends the task last; best options first and blocked ones last, collapsed; key navigation at the ends.

**Caveat:** people scanning a screen (as opposed to hearing a list) favour the start heavily; don't count on recency for things at the bottom of a long page.

### 14. Zeigarnik effect

**Says:** unfinished tasks stay on the mind and people are inclined to go back to them. Bluma Zeigarnik (1927).

**Look for:** no sense of how much is left; no way to see what's still open; drafts that look finished; progress lost on leaving.

**Directives that work:** a count of open items that goes down ("3 need you"); drafts that visibly read as unfinished; save progress and invite people back to it.

**Caveat:** the original memory finding replicates poorly (a 2025 meta-analysis by Ghibellini and Meier found no general memory advantage for unfinished tasks). The tendency to *resume* an interrupted task (the Ovsiankina effect, 1928) holds up better, so justify directives with "people want to finish what's open", not "people remember it better". Don't use it for manipulative "profile 60% complete" nagging.

### 15. Peak-end rule

**Says:** people judge an experience largely by its most intense moment and by how it ends, not by the average. Kahneman, Fredrickson, Schreiber and Redelmeier (1993); Redelmeier and Kahneman (1996).

**Look for:** the worst moment (an error with no way out, lost work, a refusal that doesn't say why, a raw server error); how the task ends (silence, or a clear "done").

**Directives that work:** remove negative peaks first (undo for destructive actions, plain-language errors that say what's wrong and how to fix it; see `ux-copy.md`); make the key success a small, satisfying moment; end the task on a calm, explicit finished state.

**Caveat:** it doesn't license long or painful flows that end nicely (duration neglect has limits), and it's not a reason to hide bad news.

---

## Expectation, time and robustness

### 16. Jakob's law

**Says:** users spend most of their time on other products, so they expect yours to work the same way. Jakob Nielsen (2000).

**Look for:** custom controls where a standard one exists; familiar things in unfamiliar places; invented vocabulary; interactions that break habits (a click that doesn't open, a key that doesn't do what it does elsewhere).

**Directives that work:** find out which products *these* users use daily and borrow their patterns (a scheduler's users know Google Calendar: Today and ‹ › in the header, click an empty slot to add, drag to move, ⌘Z); standard form controls; standard placement for search, account and navigation.

**Caveat:** borrow what works, not every habit of the leader; and when a domain rule differs from the familiar product, the rule wins, stated plainly.

### 17. Doherty threshold

**Says:** productivity rises sharply when the system responds in under about 400ms, because neither person nor computer waits on the other. Doherty and Thadani, IBM technical report GE20-0752-0 (1982). Related limits: about 0.1s feels instant, about 1s keeps a train of thought, about 10s holds attention (Miller 1968; Nielsen 1993).

**Look for:** actions with no visible acknowledgement; spinners where a skeleton would do; the old data showing under new headings while loading; saves that give no sign.

**Directives that work:** acknowledge every action within 100ms (optimistic update, with rollback on failure); skeletons shown instantly, never stale data; prefetch the likely next view; "Saving…" then "Saved"; progress for anything over about a second.

**Caveat:** optimistic updates need honest failure handling. A fast lie followed by a silent rollback is worse than a slow truth.

### 18. Postel's law

**Says:** be conservative in what you send and liberal in what you accept. Jon Postel, the robustness principle (RFC 760, 1980; RFC 793, 1981). In UX: accept many forms of input, produce one consistent form of output.

**Look for:** inputs that reject reasonable formats (dates, times, phone numbers, pasted text with spaces); search that needs an exact match; one way to act when users try several (click, drag, keyboard, touch); output formats that vary across the screen.

**Directives that work:** accept "3", "3pm", "15:00" and "3–5" and show "3–5 PM" back; search by first name, last initial, role or credential; support mouse, keyboard and touch; normalize and echo back what you understood.

**Caveat:** RFC 9413 (2023) argues that unlimited tolerance breeds ambiguity and security bugs. Accept liberally, then normalize visibly and confirm when a guess would matter; never silently guess on anything destructive, legal or financial.

### 19. Parkinson's law

**Says:** work expands to fill the time available. C. Northcote Parkinson, 1955 essay in The Economist.

**Look for:** open-ended tasks with no finish line; forms that ask for more than they need; nothing to say "you're done".

**Directives that work:** give the task a finite scope (a count of what's left, "Accept all"); pre-fill and default so there's less to do; an explicit finished state.

**Caveat:** the original was satire about bureaucracies, not an experiment. Use it as a framing for bounded tasks, never as evidence.

---

## Feel

### 20. Aesthetic-usability effect

**Says:** people perceive attractive designs as easier to use and forgive them more minor problems. Kurosu and Kashimura (1995, ATM layouts at Hitachi); Tractinsky (1997, 2000).

**Look for:** visual noise that makes a working screen feel broken; inconsistent type, spacing and icons; a dated look that erodes trust (especially on public or health sites).

**Directives that work:** one type family and a small type scale; a spacing scale; one icon set; restrained colour with defined meanings; motion only where it explains a change. This law is the reason for the craft in the brief's visual direction.

**Caveat:** it cuts both ways in testing: people rate a pretty prototype as usable even when they struggle with it. Measure behaviour (time, errors, completion), not only opinions.

---

## Other laws worth reaching for

Not part of the 20, but often the better explanation for a finding:

- **Goal-gradient effect:** effort rises as people near a goal (Hull 1932; Kivetz et al. 2006). Show progress; give a head start.
- **Chunking:** grouping information into meaningful units makes it easier to scan and remember (Miller 1956).
- **Cognitive load:** the mental effort a screen demands; remove extraneous load so the essential load fits (Sweller 1988).
- **Choice overload:** too many options can reduce satisfaction and stop people choosing at all (Iyengar and Lepper 2000; the effect varies a lot between studies).
- **Mental model:** people predict behaviour from what they believe the system is; match it or teach the difference.
- **Scanning, not reading:** people read the first line, then a shorter second line, then scan down the left edge (NN/g's F-pattern, 2006). NN/g now treats it as a failure mode design should prevent: front-load headings, labels and list items so the key word comes first. Pairs with the serial position effect. Details and evidence in `ux-copy.md`.
- **Selective attention and banner blindness:** people ignore what looks like an ad or like chrome.
- **Paradox of the active user:** people start using a product without reading instructions (Carroll and Rosson 1987). Make it learnable by doing.
- **Flow:** full, focused engagement needs clear goals, immediate feedback and a balance of challenge and skill (Csikszentmihalyi 1990).
- **Nielsen's 10 usability heuristics:** visibility of status, match with the real world, user control and freedom (undo), consistency, error prevention, recognition over recall, flexibility, minimalism, error recovery, help. Useful as a cross-check after the laws.

## Target-size numbers

| Standard | Size | Notes |
|---|---|---|
| WCAG 2.2, 2.5.8 Target Size (Minimum), AA | 24×24 CSS px | Smaller targets pass if a 24px circle around each doesn't overlap another target; inline links in text are exempt. |
| WCAG 2.1, 2.5.5 Target Size (Enhanced), AAA | 44×44 CSS px | |
| Apple Human Interface Guidelines | 44×44 pt default; 28×28 pt minimum | Larger on visionOS. |
| Material Design | 48×48 dp | Visual size may be smaller if the touch area is 48. |

A dense desktop tool can justify 32px in-grid controls for mouse use, with the grid's items growing to 44px on coarse pointers (`@media (pointer: coarse)`). Write the choice and the reason into the brief.
