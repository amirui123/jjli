# Laws of UX

Universal cognitive, perceptual, and behavioral heuristics that decide what a UI composes ... how many pricing tiers fit on a screen, where a primary action anchors in scanning order, when a progress indicator earns its place, why a settings list needs grouping.

The 30 laws below are **compiled and curated by Jon Yablonski** at [lawsofux.com](https://lawsofux.com), and treated at length in his book *Laws of UX: Using Psychology to Design Better Products & Services* (O'Reilly, 2nd ed. 2024). The selection ... which laws make the cut, what they're called, how they're grouped ... is Jon's authored contribution. The underlying research is older and authored by others (Wertheimer, Hick, Fitts, Miller, Kahneman, Tversky, and so on); the *legibility* of this set as a working UX vocabulary is Jon's.

> Jon Yablonski (`@jonyablonski`) is a product designer based in Detroit. *Laws of UX* started as a personal site in 2017 and has become a canonical compilation of cognitive UX heuristics for working designers. [The book](https://lawsofux.com/book/) is the long-form treatment; [the site](https://lawsofux.com) is the quick reference; the poster and card set live at [lawsofux.com/store](https://lawsofux.com/store/).

## How this fits with the Devour spine

The 12 principles in `principles-map.md` are *load-bearing* for Devour: every Devour finding must cite one. The 30 laws below are *adjacent and complementary*: a different layer of design thought (cognitive heuristics for human-computer interaction) that overlaps with the spine in places (Fitts ↔ Principle #6; Miller ↔ Principle #10; Peak-End ↔ Principle #4) and extends it elsewhere (anchoring, Jakob's Law, Parkinson's Law, choice overload).

Use this file as reference, not as spine. When a Devour review touches composition density, decision load, working memory, motor accuracy, or expectation, the matching law and its citation are here. The principle from the spine is still what carries the finding ... the law is what supplies the cognitive evidence.

## Entry format

Each entry has two lines below the law name:

- **Guidance** ... the Devour voice. States what the law implies and leaves the call to the reviewer.
- **Agent directive** ... the agent-emittable version. Concrete numbers and clear constraint, suitable for inclusion in a generation prompt.

Citations are inline. Every entry lists Jon as the compiler and the original researcher with the venue.

---

## Perception and visual grouping

The Gestalt laws plus selective attention and the Von Restorff effect ... how the eye groups elements before the brain reads them.

### Law of Proximity

> Objects that are near, or proximate to each other, tend to be grouped together. ... Yablonski, paraphrasing Wertheimer.

- **Guidance.** Proximity is the cheapest grouping signal ... cheaper than borders or shared color. Uniform spacing reads as nothing being grouped; visible difference in spacing reads as intent. Trust spacing before adding chrome.
- **Agent directive.** Apply variable vertical rhythm: 8 to 12 px within a group, 32 to 48 px between groups. Reach for borders or background tints only after spacing alone fails.
- **Citation.** Wertheimer, "Untersuchungen zur Lehre von der Gestalt II" (*Psychologische Forschung* 4:301–350, 1923). Compiled in Yablonski, [lawsofux.com/law-of-proximity](https://lawsofux.com/law-of-proximity/).

### Law of Similarity

> The human eye tends to perceive similar elements as a complete picture, shape, or group, even if those elements are separated. ... Yablonski.

- **Guidance.** Equivalent affordances must share visual treatment. Visible deviation is reserved for the one item meant to draw attention.
- **Agent directive.** Every list row identical class set, every secondary button identical, every destructive action identical. Reserve a single visual outlier for the recommended choice, the active nav item, or the warning state.
- **Citation.** Wertheimer (1923). Compiled in Yablonski, [lawsofux.com/law-of-similarity](https://lawsofux.com/law-of-similarity/).

### Law of Common Region

> Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary. ... Yablonski, paraphrasing Palmer.

- **Guidance.** Use enclosure when proximity is not enough ... and reserve it. A page where every section is bordered destroys the signal.
- **Agent directive.** Padding ≥ 16 px inside the region. Distinct surface (border + tinted background, or card chrome at ≥ 1 px hairline). At most one enclosure per visual scope.
- **Citation.** Palmer, "Common region: A new principle of perceptual grouping" (*Cognitive Psychology* 24:436–447, 1992). Compiled in Yablonski, [lawsofux.com/law-of-common-region](https://lawsofux.com/law-of-common-region/).

### Law of Prägnanz

> People will perceive and interpret ambiguous or complex images as the simplest form possible, because it is the interpretation that requires the least cognitive effort of us. ... Yablonski.

- **Guidance.** Layouts that align with a clear underlying grid feel inevitable. Ornate breaks that add nothing semantic feel arbitrary.
- **Agent directive.** Anchor to a named grid (12-column, F-pattern, 4-quadrant). Visible asymmetry must encode meaning, not decoration.
- **Citation.** Wertheimer, [observations on apparent motion at the railroad crossing, 1910](https://lawsofux.com/law-of-pr%C3%A4gnanz/); formalized in Gestalt papers through 1923. Compiled in Yablonski.

### Law of Uniform Connectedness

> Elements that are visually connected are perceived as more related than elements with no connection. ... Yablonski.

- **Guidance.** The strongest grouping signal in the Gestalt hierarchy. Connected lines, shared toolbars, or bracketing containers tie items together more strongly than proximity or similarity.
- **Agent directive.** Use for wizard steps, comparison sets, and explicit navigation flows. Reach for an explicit connector before adding spacing or color.
- **Citation.** Palmer & Rock, "Rethinking perceptual organization: The role of uniform connectedness" (*Psychonomic Bulletin & Review* 1:29–55, 1994). Compiled in Yablonski, [lawsofux.com/law-of-uniform-connectedness](https://lawsofux.com/law-of-uniform-connectedness/).

### Selective Attention

> The process of focusing our attention only to a subset of stimuli in an environment ... usually those related to our goals. ... Yablonski.

- **Guidance.** Cognitive bandwidth is finite. Users filter aggressively and ignore anything that looks irrelevant to their goal ... banner blindness comes from this.
- **Agent directive.** Reserve the strongest visual contrast for the single goal-relevant action per surface. Demote supporting content in weight. Never emit two equally loud calls to action.
- **Citation.** Broadbent, *Perception and Communication* (Pergamon Press, 1958). Cherry's cocktail-party effect (1953) is the related auditory framing. Compiled in Yablonski, [lawsofux.com/selective-attention](https://lawsofux.com/selective-attention/).

### Von Restorff Effect

> When multiple similar objects are present, the one that differs from the rest is most likely to be remembered. ... Yablonski.

- **Guidance.** The isolated item is the remembered item. Use deliberately for the recommended pricing tier, the active nav item, the warning state.
- **Agent directive.** Pair contrast with a non-color signal (icon, text label, position). Color-alone signaling fails WCAG 1.4.1.
- **Citation.** von Restorff, "Über die Wirkung von Bereichsbildungen im Spurenfeld" (*Psychologische Forschung* 18:299–342, 1933). Compiled in Yablonski, [lawsofux.com/von-restorff-effect](https://lawsofux.com/von-restorff-effect/).

### Aesthetic-Usability Effect

> Users often perceive aesthetically pleasing design as design that's more usable. ... Yablonski.

- **Guidance.** Visual polish biases perceived usability. Refined typography, generous whitespace, and a calm palette earn the benefit of the doubt for minor friction. **Never** substitutes for measurable usability.
- **Agent directive.** When polish budget is limited, spend it on typography hierarchy and whitespace before color and ornament. The effect is real but does not unlock corner-cutting on actual interaction.
- **Citation.** Kurosu & Kashimura, "Apparent usability vs. inherent usability" (*CHI '95 Conference Companion*, pp. 292–293), Hitachi Design Center, 1995. Compiled in Yablonski, [lawsofux.com/aesthetic-usability-effect](https://lawsofux.com/aesthetic-usability-effect/).

---

## Decision-making

How fast and how well users decide when an interface offers a choice.

### Hick's Law

> The time it takes to make a decision increases with the number and complexity of choices. ... Yablonski.

- **Guidance.** Decision time grows roughly log(n+1) with the number of equivalent options. Aggressive truncation that hides the path forward is the opposite failure mode ... surface the full option set, just don't render every option at the same visual weight.
- **Agent directive.** Cap any single decision-screen to 3 to 5 visible primary options. Collapse the rest behind progressive disclosure. Visually distinguish the recommended choice.
- **Citation.** Hick, "On the rate of gain of information" (*Quarterly Journal of Experimental Psychology* 4:11–26, 1952). Hyman, "Stimulus information as a determinant of reaction time" (*Journal of Experimental Psychology* 45:188–196, 1953) ... replication and extension. Compiled in Yablonski, [lawsofux.com/hicks-law](https://lawsofux.com/hicks-law/).

### Choice Overload

> The tendency for people to get overwhelmed when they are presented with a large number of options, often used interchangeably with the term paradox of choice. ... Yablonski.

- **Guidance.** Too many roughly-equivalent options stall or abandon the decision. Closely related to Hick's Law but distinct: Hick is about decision time, Choice Overload is about decision avoidance.
- **Agent directive.** Pricing pages: 3 to 4 tiers, exactly one marked recommended. Product grids: 6 to 9 hero cards above the fold. Settings panels: ≤ 5 named groups. Never emit a flat wall of equivalents.
- **Citation.** Iyengar & Lepper, "When choice is demotivating" (*Journal of Personality and Social Psychology* 79:995–1006, 2000). Framing dates to Toffler, *Future Shock* (Random House, 1970). Compiled in Yablonski, [lawsofux.com/choice-overload](https://lawsofux.com/choice-overload/).

### Cognitive Bias

> A systematic error of thinking or rationality in judgment that influence our perception of the world and our decision-making ability. ... Yablonski.

- **Guidance.** Designs unavoidably exploit or mitigate cognitive biases. Default toward mitigation. Exploitation has a name in this profession: dark pattern.
- **Agent directive.** When choosing defaults (subscribed/unsubscribed, opt-in/opt-out, expanded/collapsed), pick the default that aligns with the user's stated goal, not the business's. Audit every pre-checked checkbox.
- **Citation.** Tversky & Kahneman, "Judgment under uncertainty: Heuristics and biases" (*Science* 185:1124–1131, 1974). Treated at book length in Kahneman, *Thinking, Fast and Slow* (Farrar, Straus and Giroux, 2011), and Thomas, *Design for Cognitive Bias* (A Book Apart, 2020). Compiled in Yablonski, [lawsofux.com/cognitive-bias](https://lawsofux.com/cognitive-bias/).

### Pareto Principle

> Roughly 80% of the effects come from 20% of the causes. ... Yablonski.

- **Guidance.** A small share of features drives most of the value. Identify the 2 to 3 actions that drive the dominant journey for the target persona.
- **Agent directive.** Emphasize the 20% visually. Demote the long tail to overflow menus, footer surfaces, or settings. Resist the urge to surface every capability with equal weight.
- **Citation.** Pareto, *Cours d'économie politique* (c. 1906). Reformulated as the 80/20 management principle by Juran, *Quality Control Handbook* (McGraw-Hill, 1951). Compiled in Yablonski, [lawsofux.com/pareto-principle](https://lawsofux.com/pareto-principle/).

### Tesler's Law

> For any system there is a certain amount of complexity which cannot be reduced. ... Yablonski. Also called The Law of Conservation of Complexity.

- **Guidance.** Every product has an irreducible amount of complexity. The design choice is *where* it lives ... engineering team, interface, or user ... not whether to eliminate it.
- **Agent directive.** When complexity reaches the user, surface contextual guidance (tooltips, smart defaults, inline coaching, progressive disclosure) at the exact step where it surfaces. Hiding complexity is not the same as removing it.
- **Citation.** Larry Tesler at Apple, mid-1980s (he left Xerox PARC for Apple in 1980; the Conservation-of-Complexity formulation traces to his Apple years, despite frequent misattribution to PARC). Treated in Saffer, *Designing for Interaction* (New Riders, 2009). Compiled in Yablonski, [lawsofux.com/teslers-law](https://lawsofux.com/teslers-law/).

### Occam's Razor

> Among competing hypotheses that predict equally well, the one with the fewest assumptions should be selected. ... Yablonski.

- **Guidance.** Among options that explain the data equally well, prefer the one with the fewest assumptions. The law constrains *assumptions*, not feature count ... a "minimum viable" framing misreads it.
- **Agent directive.** Specify a minimal element inventory per surface. Forbid decorative chrome that doesn't serve a stated user task.
- **Citation.** William of Ockham (c. 1287–1347), 14th-century English Franciscan friar and scholastic philosopher. Compiled in Yablonski, [lawsofux.com/occams-razor](https://lawsofux.com/occams-razor/).

---

## Memory and learning

How working memory handles information density and what the user retains afterward.

### Miller's Law

> The average person can only keep 7 (plus or minus 2) items in their working memory. ... Yablonski.

- **Guidance.** Often misread as a rule about menu length. Miller's paper is about *chunks* ... a slot can hold a larger familiar unit, but chunking does not let you pack arbitrary content into a single slot. Modern replication (Cowan, 2001) sets the practical bound nearer 4.
- **Agent directive.** Group related fields with clear section headings, dividers, or card containers. A settings page with sections "Account / Notifications / Privacy / Billing / Danger zone" beats one flat list of 30 toggles.
- **Citation.** Miller, "The magical number seven, plus or minus two: Some limits on our capacity for processing information" (*Psychological Review* 63:81–97, 1956). Modern bound from Cowan, "The magical number 4 in short-term memory: A reconsideration of mental storage capacity" (*Behavioral and Brain Sciences* 24:87–114, 2001). Compiled in Yablonski, [lawsofux.com/millers-law](https://lawsofux.com/millers-law/).

### Chunking

> A process by which individual pieces of an information set are broken down and then grouped together in a meaningful whole. ... Yablonski.

- **Guidance.** Chunks compress information into single working-memory slots only when the user has the domain knowledge to recognize the chunk. Phone numbers chunked as `(XXX) XXX-XXXX` work because the chunk pattern is shared; novel chunks must be taught or skipped.
- **Agent directive.** Long credentials, identifiers, and keys: insert separators every 3 to 5 characters. Card numbers: 4-4-4-4. Postal codes: per locale. Don't invent chunk patterns the user has never seen.
- **Citation.** Miller (1956) ... same paper as Miller's Law, treating chunking as the mechanism behind the 7±2 limit. Compiled in Yablonski, [lawsofux.com/chunking](https://lawsofux.com/chunking/).

### Working Memory

> A cognitive system that temporarily holds and manipulates information needed to complete tasks. ... Yablonski.

- **Guidance.** Items decay in seconds without rehearsal. Recognition beats recall: persisting prior context across screens, marking visited elements, and surfacing comparison views beats forcing the user to memorize.
- **Agent directive.** On dashboards: sticky filter chips, last-N selections persisted, breadcrumbs that include applied filters. Across navigations: scroll position, form draft state, and selection preserved by default.
- **Citation.** Baddeley & Hitch, "Working memory" (in Bower, ed., *The Psychology of Learning and Motivation* vol. 8, Academic Press, 1974). Earlier short-term-store framing from Atkinson & Shiffrin, "Human memory: A proposed system and its control processes" (in Spence & Spence, eds., *The Psychology of Learning and Motivation* vol. 2, Academic Press, 1968). Compiled in Yablonski, [lawsofux.com/working-memory](https://lawsofux.com/working-memory/).

### Cognitive Load

> The amount of mental resources needed to understand and interact with an interface. ... Yablonski.

- **Guidance.** Total mental effort splits into intrinsic (the task's inherent difficulty) and extraneous (poor layout, jargon, inconsistent patterns, visual noise). Designers can't reduce intrinsic load; they own extraneous fully.
- **Agent directive.** Single accent color per surface, three-weight typography rhythm, no decorative chrome without semantic role. Every removed visual element that wasn't doing work is extraneous load deleted.
- **Citation.** Sweller, "Cognitive load during problem solving: Effects on learning" (*Cognitive Science* 12:257–285, 1988). Compiled in Yablonski, [lawsofux.com/cognitive-load](https://lawsofux.com/cognitive-load/).

### Serial Position Effect

> Users have a propensity to best remember the first and last items in a series. ... Yablonski.

- **Guidance.** Recall favors the extremes ... primacy at the start, recency at the end ... while middle items fade.
- **Agent directive.** Anchor the most important nav items at the leftmost and rightmost positions of a horizontal menu. Cluster utilities in the middle. Lists of options: most important first or last, never middle.
- **Citation.** Ebbinghaus, *Über das Gedächtnis: Untersuchungen zur experimentellen Psychologie* (Duncker & Humblot, 1885). Compiled in Yablonski, [lawsofux.com/serial-position-effect](https://lawsofux.com/serial-position-effect/).

### Peak-End Rule

> People judge an experience largely based on how they felt at its peak and at its end, rather than the total sum or average of every moment of the experience. ... Yablonski.

- **Guidance.** Stage a high-effort celebratory success state; let intermediate steps stay calm. Mediocre middles matter less than a strong close. The peak belongs at the *end* of a flow, not as arbitrary mid-flow motion.
- **Agent directive.** Empty-state coaching, mid-flow indicators: calm and informational. Completion confirmations, first-time successes, end-of-onboarding: invest in motion, copy, and visual peak. Save the celebration for the close.
- **Citation.** Kahneman, Fredrickson, Schreiber, & Redelmeier, "When more pain is preferred to less: Adding a better end" (*Psychological Science* 4:401–405, 1993). Compiled in Yablonski, [lawsofux.com/peak-end-rule](https://lawsofux.com/peak-end-rule/).

### Zeigarnik Effect

> People remember uncompleted or interrupted tasks better than completed tasks. ... Yablonski.

- **Guidance.** Uncompleted tasks create cognitive tension that pulls the user back. Visible progress converts that tension into completion pressure. Reserve for genuinely beneficial flows like onboarding; applying the same lever to streaks, daily-quest counters, or notification-reduction nags is a dark pattern.
- **Agent directive.** Multi-step onboarding: visible "3 of 5" or "next: invite team" indicators. Greyed-out next sections that hint at what's pending. **Never** apply to engagement loops the user didn't ask for.
- **Citation.** Zeigarnik, "Über das Behalten erledigter und unerledigter Handlungen" (*Psychologische Forschung* 9:1–85, 1927). Compiled in Yablonski, [lawsofux.com/zeigarnik-effect](https://lawsofux.com/zeigarnik-effect/).

---

## Interaction and motor

How fast and how accurately users can act on the UI.

### Fitts's Law

> The time to acquire a target is a function of the distance to and size of the target. ... Yablonski.

- **Guidance.** Bigger and closer is faster. Spacing between adjacent hit zones matters as much as size. The law gives the speed-accuracy tradeoff; the platform floor (WCAG 2.5.8 at 24 × 24 CSS px, iOS HIG at 44 × 44 pt, Material 3 at 48 × 48 dp) gives the safety floor. Fitts plus the platform floor, never just Fitts.
- **Agent directive.** Hit zones ≥ 24 × 24 CSS px (AA floor); ≥ 44 × 44 pt on iOS. High-frequency controls placed in the natural thumb arc on mobile. Adjacent destructive and confirmatory actions: separated by ≥ 24 px or visually grouped to make confusion impossible.
- **Citation.** Fitts, "The information capacity of the human motor system in controlling the amplitude of movement" (*Journal of Experimental Psychology* 47:381–391, 1954). Compiled in Yablonski, [lawsofux.com/fittss-law](https://lawsofux.com/fittss-law/).

### Doherty Threshold

> Productivity soars when a computer and its users interact at a pace (< 400 ms) that ensures that neither has to wait on the other. ... Yablonski.

- **Guidance.** Sub-second feedback keeps users in flow; latency above ~1 s breaks attention. The 400 ms number is the popular framing; Doherty & Thadani's 1982 paper makes the case for sub-second response without naming the specific 400 ms threshold.
- **Agent directive.** Loading state thresholds: no indicator under 300 ms; skeleton from 300 ms to 2 s; labelled spinner from 2 to 10 s; determinate progress bar with cancel from 10 to 60 s; stop and offer error/retry past 60 s.
- **Citation.** Doherty & Thadani, "The economic value of rapid response time" (*IBM Systems Journal* 21:67–78, 1982). Compiled in Yablonski, [lawsofux.com/doherty-threshold](https://lawsofux.com/doherty-threshold/).

### Flow

> The mental state in which a person performing some activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity. ... Yablonski.

- **Guidance.** Flow sits in the balance between challenge and skill. Too hard breeds frustration, too easy breeds boredom. Continuous feedback and a clear sense of control keep the user inside the state. System friction and latency are the fastest ways to break it.
- **Agent directive.** Minimize state-loss across navigations. Keep response time sub-second on the dominant interaction path. Default to no-confirmation-required for reversible actions; reserve confirmations for genuinely destructive ones.
- **Citation.** Csíkszentmihályi, *Beyond Boredom and Anxiety* (Jossey-Bass, 1975), and *Flow: The Psychology of Optimal Experience* (Harper & Row, 1990). Compiled in Yablonski, [lawsofux.com/flow](https://lawsofux.com/flow/).

### Goal-Gradient Effect

> The tendency to approach a goal increases with proximity to the goal. ... Yablonski.

- **Guidance.** Motivation to finish rises as the goal gets closer. Visible progress is a real motivational lever ... and a tempting one to fake. Endowed progress that doesn't reflect real prerequisites is a dark pattern.
- **Agent directive.** Multi-step flows render a prominent progress indicator that reflects *real* endowed progress. Show completed prerequisites when they truly exist (saved profile, imported team, prior survey answer). When no real prerequisite exists, render the current step honestly as `1 of N`.
- **Citation.** Hull, "The goal-gradient hypothesis and maze learning" (*Psychological Review* 39:25–43, 1932). Kivetz, Urminsky, & Zheng, "The goal-gradient hypothesis resurrected" (*Journal of Marketing Research* 43:39–58, 2006) for the punch-card replication. Compiled in Yablonski, [lawsofux.com/goal-gradient-effect](https://lawsofux.com/goal-gradient-effect/).

### Postel's Law

> Be liberal in what you accept, and conservative in what you send. ... Postel, RFC 760; surfaced for UX by Yablonski.

- **Guidance.** Take input in whatever shape users naturally give it. Normalize internally to a canonical form. Emit one consistent format on output. (RFC 9413, Thomson 2023, retracts the maxim for *protocol design* citing security surface ... the UX-input application stands.)
- **Agent directive.** Phone numbers accepted with or without dashes, parentheses, country code prefix. Dates in mixed formats. Percentages with or without `%`. Stripped on the way in, formatted on the way out.
- **Citation.** Postel, "DOD standard Transmission Control Protocol" (RFC 760, IETF, 1980). UX framing in Yablonski, [lawsofux.com/postels-law](https://lawsofux.com/postels-law/).

---

## Behavior and expectation

What users predict and how that prediction interacts with the rendered surface.

### Jakob's Law

> Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know. ... Yablonski, quoting Nielsen.

- **Guidance.** Reuse category convention so the user spends zero cycles relearning interaction grammar. Novelty must earn its keep against the convention's ROI; "innovate everywhere" is the opposite failure mode.
- **Agent directive.** Nav placement in upper bar; cart icon upper-right for commerce; settings gear lower-left for SaaS; primary CTA in the hero. Deviation requires a named reason that beats the convention's value.
- **Citation.** Nielsen, "End of Web Design" (Nielsen Norman Group, 2000); reinforced across his writing and the NN/g body of work. Compiled in Yablonski, [lawsofux.com/jakobs-law](https://lawsofux.com/jakobs-law/).

### Mental Model

> A compressed model based on what we think we know about a system and how it works. ... Yablonski.

- **Guidance.** Every user arrives with a prior built from competitor products and the physical world. When the prediction holds, the product feels intuitive; when it breaks, friction shows up as confusion, not curiosity.
- **Agent directive.** When the brief names a reference product (or category leader), anchor the interaction grammar to it explicitly. Don't make the user re-derive what's normal for the category.
- **Citation.** Craik, *The Nature of Explanation* (Cambridge University Press, 1943). Operationalized for design in Norman, *The Psychology of Everyday Things* (Basic Books, 1988; reissued as *The Design of Everyday Things*, 2013). Compiled in Yablonski, [lawsofux.com/mental-model](https://lawsofux.com/mental-model/).

### Paradox of the Active User

> Users never read manuals but start using the software immediately. ... Yablonski.

- **Guidance.** Users skip the manual and start using the software immediately, even when reading it would speed them up. Documentation that exists outside the surface gets read by no one.
- **Agent directive.** Bake guidance into the surface itself ... empty-state coaching, inline tooltips, contextual hints ... at the action point. The first time a user encounters a feature *is* the manual.
- **Citation.** Carroll & Rosson, "Paradox of the active user" (chapter in Carroll, ed., *Interfacing Thought: Cognitive Aspects of Human-Computer Interaction*, MIT Press, 1987, pp. 80–111). Often miscited as a *Communications of the ACM* article; the canonical source is the MIT Press book chapter. Compiled in Yablonski, [lawsofux.com/paradox-of-the-active-user](https://lawsofux.com/paradox-of-the-active-user/).

### Parkinson's Law

> Any task will inflate until all of the available time is spent. ... Yablonski.

- **Guidance.** Work expands to fill the time allotted to it. Loose interfaces let users dawdle; tight ones beat the user's anticipated duration, and beating the anticipated duration becomes the felt win.
- **Agent directive.** Pre-fill what you can: autofill, smart defaults, saved state, "use last address," remember-form-values. Checkout flows: every field that can be derived from prior input should be derived.
- **Citation.** Parkinson, "Parkinson's Law" (*The Economist*, November 19, 1955); collected in Parkinson, *Parkinson's Law: The Pursuit of Progress* (John Murray, 1958). Compiled in Yablonski, [lawsofux.com/parkinsons-law](https://lawsofux.com/parkinsons-law/).

---

## See also

- [`principles-map.md`](principles-map.md) ... the 12 Devour principles and their primary sources. The laws above complement, not replace, the spine.
- [`lineage.md`](lineage.md) ... the five-layer model. Jon Yablonski is a Layer 2 source.
- [`reading-list.md`](reading-list.md) ... ordered reading list. *Laws of UX* (O'Reilly book) is listed under Layer 2.
- [`methodology.md`](methodology.md) ... the *cite-the-compiler* discipline is the review-side version of how this file is structured.
