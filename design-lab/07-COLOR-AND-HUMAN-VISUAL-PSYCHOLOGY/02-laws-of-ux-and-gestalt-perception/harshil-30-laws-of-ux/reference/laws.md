# Laws of UX: working reference

Researched 2026-10-13. Covers all 30 entries listed on https://lawsofux.com/ on that date.

This file is a reference, not a standard. A project sets its own standard in a rubric, using the method in `method/principle-law-rule.md`. A law in this file only binds a screen when that project's rubric says it is in use.

## How to read this file

Every law has the same five fields.

- **Rule.** The law in one plain sentence.
- **Building.** What it means when building a web UI.
- **Violation signs.** What to look for.
- **Check.** Where the evidence comes from:
  - `CODE` can be judged by reading components, styles and copy.
  - `APP` needs the running app: a screenshot, a real viewport, a timed interaction or a keyboard pass.
  - `USERS` needs real users or analytics. An agent cannot settle it and must say so.
- **Sources.** Where the claims come from.

Two labels mark the strength of a number:

- **(sourced)** means the number comes from a cited source.
- **(heuristic)** means it is a working default written for this reference. It is a starting point for the rubric, not a research finding.

### Research limits

- Everything is written in my own words. The Laws of UX site is CC BY-NC-ND, so nothing is quoted from it.
- Jon Yablonski's book, *Laws of UX* (O'Reilly, first edition, 2020), was read in full on 2026-10-13 from extracted text. The figures were not viewed. That edition covers 10 of the 30 laws in depth. Entries that draw on it cite "Book ch. N". The second edition was not read.
- Chapter-by-chapter notes on the book are in `book/chapter-notes.md`.
- Pages were read through a fetch tool that summarises. Numbers below were taken only from sources that state them. Where a source could not be reached, the entry says so.
- The Nielsen Norman Group article on the Zeigarnik effect and the one on the serial position effect could not be located at a working URL. Those entries rest on the Laws of UX page and the primary research cited.

### Evidence strength at a glance

Not all 30 entries are equally solid. This matters when two laws pull in different directions. The grouping below is my assessment from the sources read, not a published ranking. The two "contested" placements are backed by the meta-analyses cited in those entries.

| Strength | Laws |
|---|---|
| Strong, quantified, replicated | Fitts's Law, Hick's Law (for simple choices), Doherty Threshold and response-time limits, Working Memory, Serial Position Effect, Von Restorff Effect, the Gestalt group (Proximity, Similarity, Common Region, Uniform Connectedness, Prägnanz) |
| Solid finding, often over-applied | Miller's Law, Aesthetic-Usability Effect, Peak-End Rule, Goal-Gradient Effect, Selective Attention, Jakob's Law |
| Contested or weak as a universal claim | Choice Overload, Zeigarnik Effect |
| Design principle or heuristic, not an experimental finding | Occam's Razor, Pareto Principle, Parkinson's Law, Postel's Law, Tesler's Law, Paradox of the Active User |
| Umbrella concept, not a single rule | Cognitive Bias, Cognitive Load, Chunking, Mental Model, Flow |

---

## Group A. Deciding and choosing

### 1. Hick's Law

- **Rule.** The more options a person has to pick from, the longer the pick takes.
- **Building.**
  - One visually primary action per view **(heuristic)**. Secondary actions look secondary.
  - When a task has many decisions, split it into steps so each step has few.
  - Mark a recommended option where one exists.
  - Show new users a reduced set first and reveal the rest later.
  - Do not strip labels or options so far that what remains is cryptic. Fewer is not always clearer.
  - Icons rarely mean the same thing to everyone, and the same icon does different jobs in different products. Pair icons with text labels, above all in navigation.
  - Offer filters and refinements after the person has started, not before.
- **Violation signs.** Two or more buttons with the same primary styling in one view. A toolbar or menu where every item has equal weight. A first-run screen that shows every feature. Icon-only controls introduced to "reduce choices".
- **Check.** `CODE` for counting primary-styled actions and menu items per view. `APP` to see what is actually visible at once in each viewport. `USERS` for whether decision time is a real problem.
- **Note.** The law was measured on simple stimulus-and-response choices. It predicts speed for picking among known options. It says little about slow, considered decisions or about reading an unfamiliar list.
- **Sources.** https://lawsofux.com/hicks-law/ · Book ch. 3

### 2. Choice Overload

- **Rule.** Too many options at once can leave people overwhelmed, less satisfied, or unwilling to choose at all.
- **Building.**
  - Give long lists a way to narrow before choosing: search, filters, categories.
  - Feature the most relevant item for the current moment.
  - When people must compare, put the options side by side with the same attributes in the same order.
- **Violation signs.** A list of dozens of similar items with no search, filter or grouping. Options that differ in ways the card does not show. No default or recommended item.
- **Check.** `CODE` for list length and the presence of narrowing tools. `APP` for how the list reads in practice. `USERS` for abandonment.
- **Note. This one is contested.** A 2010 meta-analysis of 50 experiments (N = 5,036) found an average effect close to zero with large variation between studies. A 2015 meta-analysis found the effect is real once four conditions are accounted for: a hard decision task, a complex set of options, uncertainty about one's own preferences, and a goal of minimising effort. Read it as: overload happens when options are hard to compare and the person does not know what they want. A long list is not a violation by itself.
- **Sources.** https://lawsofux.com/choice-overload/ · Scheibehenne, Greifeneder and Todd (2010): https://abcwest.cogs.indiana.edu/pmwiki/pdf/scheibehenne.options.2010.pdf · Chernev, Böckenholt and Goodman (2015): https://www.kellogg.northwestern.edu/faculty/research/detail/2015/when-product-assortment-leads-to-choice-overload-a-conceptual

### 3. Occam's Razor

- **Rule.** Of two solutions that do the job equally well, pick the one with fewer parts.
- **Building.**
  - Ask of every element: what breaks if this is removed? If nothing, remove it.
  - Prefer not adding a control over adding one and hiding it.
  - This is a design-review habit. It does not produce a number.
- **Violation signs.** Elements with no function a user could name. Two controls that do the same thing. Decorative text, badges or icons that carry no information. Settings nobody is expected to change.
- **Check.** `CODE` for duplicate controls and dead UI. `APP` for visual clutter. Whether a removal "does the job equally well" is a judgement the rubric owner makes.
- **Sources.** https://lawsofux.com/occams-razor/

### 4. Pareto Principle

- **Rule.** A small share of features usually accounts for most of the use.
- **Building.**
  - Name the few jobs that matter most on each surface and give them the best position, the largest targets and the least friction.
  - Spend polish where most people are, not evenly.
  - The 80/20 split is a rule of thumb, not a measured constant.
- **Violation signs.** The most common job sits below or behind a rarely used one. Equal visual weight for a daily action and a once-a-year action.
- **Check.** `CODE` and `APP` can show what the layout prioritises. Only `USERS` (analytics) can show which features are actually the vital few. Without usage data, the rubric's list of jobs stands in.
- **Sources.** https://lawsofux.com/pareto-principle/

### 5. Tesler's Law (conservation of complexity)

- **Rule.** Every task has some complexity that cannot be removed, only moved between the system and the person.
- **Building.**
  - Have the system carry the load: defaults, pre-filled values, derived values, remembered choices.
  - Do not ask for anything the system already knows or can work out.
  - Do not design for a perfectly careful, rational user.
  - When a step cannot be simplified, put the explanation at the step.
  - Over-simplifying moves complexity back onto the person. A single vague field can be harder than three clear ones.
  - Typical moves: pre-fill what is known, suggest as the person types, let one answer feed another ("same as billing").
- **Violation signs.** A form asks for data that exists elsewhere in the app. The person must copy a value from one screen to another. Format rules the person has to satisfy by hand. A "simple" screen that needs outside instructions to use.
- **Check.** `CODE` for re-asked data and missing defaults. `APP` to walk the flow and count what the person must supply or remember.
- **Sources.** https://lawsofux.com/teslers-law/ · https://www.nngroup.com/articles/complex-application-design/ · Book ch. 9

### 6. Postel's Law (robustness)

- **Rule.** Accept input in whatever reasonable form people give it, and be exact and consistent in what the system gives back.
- **Building.**
  - Trim whitespace, ignore case where case does not matter, accept common formats for dates, phone numbers and pasted text.
  - Normalise on the system side, then show the person what was understood.
  - State limits before the person hits them.
  - Design for long names, empty states, missing data, slow networks, zoomed text and assistive technology.
  - Ask only for what is needed, and never for what the system already has. Every extra field costs effort and lowers completion.
  - Leave room for text to grow. Translated strings can be far longer than the English, and people enlarge their default font size.
  - Core content and function work for everyone first. Enhancements are layered on where the device supports them.
- **Violation signs.** A layout that breaks when the browser font size is raised. Optional fields presented as required. Validation errors for input a human would understand. Errors that say what was wrong without saying what is accepted. Layouts that break with long or empty content. A field that silently drops or changes input.
- **Check.** `CODE` for validation rules and empty and error states. `APP` to try awkward input and long content.
- **Sources.** https://lawsofux.com/postels-law/ · Book ch. 5

---

## Group B. Memory and mental effort

### 7. Cognitive Load

- **Rule.** Every interface costs mental effort, and effort spent on the interface is not available for the task.
- **Building.**
  - Separate the effort the task needs from the effort the design adds. Cut the second kind.
  - Remove visual noise: duplicate links, decoration that carries no meaning, styling that means nothing.
  - Use patterns people already know.
  - Move reading, remembering and deciding from the person to the interface: defaults, re-shown information, visuals.
- **Violation signs.** Several competing regions on one screen. The same link or action repeated. Styling variety with no meaning behind it. Instructions the person must remember while acting elsewhere.
- **Check.** `CODE` for duplication and unexplained variety. `APP` for the overall density of a screen. `USERS` to measure real effort.
- **Note.** This is an umbrella. Most findings filed under it are better filed under a more specific law (Working Memory, Hick's, Chunking, Tesler's). Use it only when no specific law fits.
- **Sources.** https://lawsofux.com/cognitive-load/ · https://www.nngroup.com/articles/minimize-cognitive-load/

### 8. Working Memory

- **Rule.** People can hold only a few things in mind at once, and only for a short time.
- **Building.**
  - Capacity is roughly four chunks, and items fade in about 20 to 30 seconds **(sourced)**.
  - Never make someone remember something from one screen to use on the next. Carry it forward and show it.
  - Prefer recognition to recall: show the options, mark what has been visited or completed.
  - Give people somewhere to park things mid-task: saved lists, side-by-side comparison.
  - The build team holds more of the product in mind than a user can. A flow that feels simple to the team is not evidence.
- **Violation signs.** A code, name or instruction shown on one screen and needed on another. No marker for visited or completed items. A comparison that requires flipping between pages. Earlier steps hidden once the next step opens.
- **Check.** `CODE` for state carried across steps and for visited or done markers. `APP` to walk a flow and note every point where something must be remembered.
- **Sources.** https://lawsofux.com/working-memory/ · https://www.nngroup.com/articles/working-memory-external-memory/ · Cowan (2001): https://pubmed.ncbi.nlm.nih.gov/11515286/

### 9. Miller's Law

- **Rule.** Short-term memory holds roughly seven items, give or take two, and probably fewer.
- **Building.**
  - **Do not use seven as a design limit.** That is the most common misuse of this law.
  - The limit applies to what people must hold in their heads. It does not apply to options that stay visible on screen, such as a menu.
  - The practical instruction is the same as Chunking and Working Memory: organise into groups, and do not make people memorise.
  - Later research puts the real figure nearer four.
- **Violation signs.** Not "more than seven items". The real sign is an ungrouped run of items the person has to hold in mind, or a design decision justified only by "seven plus or minus two".
- **Check.** `CODE`. Flag any place the number seven is used as a rule.
- **Sources.** https://lawsofux.com/millers-law/ · https://www.nngroup.com/articles/chunking/ · Cowan (2001): https://pubmed.ncbi.nlm.nih.gov/11515286/

### 10. Chunking

- **Rule.** Information broken into meaningful groups is easier to scan, understand and remember than the same information in one run.
- **Building.**
  - Short paragraphs with space between them. Line length about 50 to 75 characters **(sourced)**.
  - Headings that contrast with body text. Lists for parallel items.
  - Split long strings (codes, numbers) into groups, and format them for the person as they type.
  - Group related controls. Separate unrelated ones with space, a rule or a background.
- **Violation signs.** A wall of text. Body lines much longer than 75 characters. A long form with no sections. A toolbar where unrelated tools sit in one undivided row.
- **Check.** `CODE` for structure, heading levels and max-width on text. `APP` for actual line length at each breakpoint.
- **Sources.** https://lawsofux.com/chunking/ · https://www.nngroup.com/articles/chunking/

### 11. Serial Position Effect

- **Rule.** People remember the first and last items in a sequence better than the ones in the middle.
- **Building.**
  - Put the most important items first and last in navigation, lists and step sequences.
  - Put the least important in the middle.
  - On a long page, the opening and the close carry the most weight.
- **Violation signs.** The key navigation item sits mid-list. The most important step or message is buried in the middle of a sequence.
- **Check.** `CODE` for ordering. Which item is "most important" comes from the rubric's jobs.
- **Sources.** https://lawsofux.com/serial-position-effect/

### 12. Von Restorff Effect (isolation effect)

- **Rule.** Among similar things, the one that looks different is the one people notice and remember.
- **Building.**
  - Make the key action or the key piece of information visually distinct.
  - Use emphasis sparingly. One emphasised thing per region **(heuristic)**. If several things are emphasised, none is.
  - Do not rely on colour alone. People with colour vision deficiency or low vision may not see the difference.
  - Be careful with motion as emphasis. Some people are sensitive to it. Respect reduced-motion settings.
  - An element that stands out too much can be read as an advert and skipped. See Selective Attention.
  - Emphasis also prevents mistakes. In a confirm dialog, make the destructive action look different from the safe one so neither is picked by accident.
  - Contrast can come from size, shape, space and position as well as colour.
- **Violation signs.** Several badges, highlights or accent colours competing in one view. Status carried by colour only. The primary action looks like its neighbours. Decorative animation that draws the eye from the task.
- **Check.** `CODE` for how many elements use the accent treatment and for colour-only status. `APP` for what the eye lands on first. Contrast can be measured in `APP`.
- **Sources.** https://lawsofux.com/von-restorff-effect/ · Book ch. 8

### 13. Selective Attention

- **Rule.** People attend to what serves their current goal and filter out the rest, including things the designer thinks are obvious.
- **Building.**
  - Do not style real content like an advert: boxed, coloured, animated, or in the top banner or right rail. People skip it.
  - Do not place real content next to promotional content. The whole area gets dismissed.
  - Show a change where the person is already looking, usually where they just acted.
  - Avoid several changes at once. They compete and some go unseen.
  - A change with no motion and no proximity to the action is easy to miss.
- **Violation signs.** Important notices in a banner or side rail. A success or error message far from the control that triggered it. A page that updates in several places from one action. State changes with no visible transition and no announcement.
- **Check.** `CODE` for where feedback is rendered relative to its trigger and for live-region announcements. `APP` to perform the action and watch what changes. `USERS` to confirm people actually notice.
- **Sources.** https://lawsofux.com/selective-attention/ · https://www.nngroup.com/articles/change-blindness-definition/ · https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/

---

## Group C. Seeing structure (Gestalt)

Strength order for grouping cues, strongest first: a shared container or a connecting line, then closeness, then looking alike. A stronger cue overrides a weaker one, so a border around the wrong things beats correct spacing.

### 14. Law of Proximity

- **Rule.** Things placed close together are read as belonging together.
- **Building.**
  - Space inside a group is smaller than space between groups. Always.
  - A label sits closer to its own field than to the previous field.
  - A heading sits closer to the content below it than to the content above it.
  - Instructions sit next to the thing they describe.
  - Recheck at every breakpoint. Stacking can separate things that sat together.
  - An optional action placed far from the main actions gets missed.
- **Violation signs.** Uniform spacing everywhere, so no grouping is visible. A heading floating midway between two sections. A "skip" or secondary action isolated in a corner. Unrelated buttons clustered so they read as a set.
- **Check.** `CODE` for spacing tokens: is the gap inside a group smaller than the gap between groups? `APP` at each breakpoint, since stacking changes distances.
- **Sources.** https://lawsofux.com/law-of-proximity/ · https://www.nngroup.com/articles/gestalt-proximity/

### 15. Law of Common Region

- **Rule.** Things inside the same boundary are read as one group.
- **Building.**
  - Use a border or background to group things that differ from each other or cannot be moved closer.
  - Before adding a container, ask whether spacing already does the job. Containers add clutter.
  - A card should hold exactly one item's parts.
  - A full-width coloured band can look like the end of the page and stop people scrolling.
- **Violation signs.** Cards inside cards inside cards. Every element boxed, so boxes mean nothing. A container that holds unrelated things. A boundary that splits things that belong together.
- **Check.** `CODE` for nesting depth of bordered or filled containers. `APP` for whether the boxes match the real groups.
- **Sources.** https://lawsofux.com/law-of-common-region/ · https://www.nngroup.com/articles/common-region/

### 16. Law of Similarity

- **Rule.** Things that look alike are read as doing the same kind of thing.
- **Building.**
  - Same function, same look. Different function, different look.
  - Everything clickable shares a recognisable treatment, and nothing unclickable borrows it.
  - Links look different from body text.
  - A status colour means one thing across the whole product.
- **Violation signs.** Two buttons that look the same and do different kinds of thing. The same action styled differently on two screens. A heading or badge that looks clickable and is not. A colour that means "done" in one place and "selected" in another.
- **Check.** `CODE` across components for variant usage and colour meaning. `APP` to compare screens side by side.
- **Sources.** https://lawsofux.com/law-of-similarity/

### 17. Law of Uniform Connectedness

- **Rule.** Things joined by a line, a shared colour or a frame are read as more related than things that are only close.
- **Building.**
  - Use a connecting line for sequences: steppers, timelines, progress paths.
  - Tie a tab to its panel and an accordion header to its body visually.
  - Do not connect things that are not related. A decorative line implies a relationship.
- **Violation signs.** A stepper whose steps are not visibly linked. A tab whose active state does not join the panel. A divider or connector that links unrelated items.
- **Check.** `CODE` for connector elements. `APP` for whether the connection reads.
- **Sources.** https://lawsofux.com/law-of-uniform-connectedness/

### 18. Law of Prägnanz (simplicity)

- **Rule.** People read a complex visual as the simplest shape that fits it.
- **Building.**
  - Keep layouts on a small number of clear alignments and shapes.
  - Use simple, familiar icon forms.
  - If a layout can be read two ways, people will pick the simpler reading, which may not be the intended one.
- **Violation signs.** Many competing alignment edges. Ornate icons that do not resolve at small sizes. A composition where the grouping is ambiguous.
- **Check.** `CODE` gives weak signal (grid and alignment classes). Mostly `APP`.
- **Sources.** https://lawsofux.com/law-of-pr%C3%A4gnanz/

---

## Group D. Expectation and learning

### 19. Jakob's Law

- **Rule.** People spend most of their time in other products and expect yours to work the same way.
- **Building.**
  - Use standard patterns for standard jobs: navigation, search, forms, sign-in, tables, dialogs.
  - Treat every unusual pattern as a cost the person pays before they can start. It needs a reason.
  - Spend originality on content and on the product's own jobs, not on basic mechanics.
  - When changing something familiar, let people keep the old way for a while.
  - Start from the common pattern. Depart from it only when there is a clear argument that the new way improves the core experience, and then test it with users.
- **Violation signs.** Custom controls where a native or conventional one exists. Navigation in an unexpected place. A link that does not look like a link. Familiar icons used for unfamiliar meanings.
- **Check.** `CODE` for hand-rolled controls replacing standard elements. `APP` to compare with common products of the same kind.
- **Tension with distinctive design.** A brief that asks for intentional, non-template visuals is compatible with this law: be distinctive in look, conventional in behaviour.
- **Sources.** https://lawsofux.com/jakobs-law/ · https://www.nngroup.com/articles/end-of-web-design/ · Book ch. 1

### 20. Mental Model

- **Rule.** People act on their own belief about how a system works, and that belief is often different from how it works.
- **Building.**
  - Use the words the user uses, not internal names.
  - Structure follows how people think about the job, not how the data is stored.
  - When the belief and the system differ, there are two fixes: change the system to match the belief, or change the belief with clearer labels and explanation. Pick one on purpose.
  - The build team's model is far more detailed than a user's. It is not evidence.
- **Violation signs.** Internal or database terms in the UI. One concept with two names. Two concepts with one name. Navigation organised by implementation.
- **Check.** `CODE` for terminology consistency across screens. Whether the terms match users' own words needs `USERS`.
- **Sources.** https://lawsofux.com/mental-model/ · https://www.nngroup.com/articles/mental-models/

### 21. Paradox of the Active User

- **Rule.** People start using a product straight away and do not read instructions first, even when reading would save them time.
- **Building.**
  - The product must be usable with no reading. Onboarding cannot be the fix for an unclear screen.
  - Put guidance at the point of use: next to the field, on the empty state, in the moment.
  - Tours and intro screens will be skipped. Nothing essential may live only there.
  - First action should be possible within the first screen.
- **Violation signs.** Information that appears only in a tour, modal or intro. A blocking tutorial before any action. An empty state with no next step. Help that lives on a separate page.
- **Check.** `CODE` for content that exists only in tour or onboarding components. `APP` by using the screen with the tour dismissed.
- **Sources.** https://lawsofux.com/paradox-of-the-active-user/ · https://www.nngroup.com/articles/paradox-of-the-active-user/

### 22. Cognitive Bias

- **Rule.** People, including the people building the product, make predictable errors of judgement.
- **Building.**
  - This is mainly a rule about the process. It guards against the builder's own bias.
  - Confirmation bias: an agent that built a screen will find it good. Audits are done without reading the build notes for this reason.
  - Do not use a bias against the user. False urgency, fake scarcity and guilt copy are manipulation.
- **Violation signs.** In the UI: countdowns with no real deadline, "only N left" with no real limit, a decline option worded to shame. In the process: an audit that cites the design intent as evidence the design works.
- **Check.** `CODE` for manipulative copy and timers. Process checks belong to the audit procedure.
- **Sources.** https://lawsofux.com/cognitive-bias/

---

## Group E. Time and response

### 23. Doherty Threshold

- **Rule.** People stay engaged when the system answers within about 400 milliseconds.
- **Building.** Use these limits **(sourced)**:
  - Within 0.1 s: feels instant. Show the result. Every tap, click and keypress should get some visible response in this window.
  - From 0.1 to 0.3 s: the delay becomes noticeable and people start to feel less in control.
  - Up to 1 s: the person's train of thought holds. No special indicator needed.
  - Over 1 s: show that the system is working.
  - Over 10 s: show progress and a way to cancel. Attention is lost beyond this.
  - Keep the layout stable while loading: placeholders the same size as the content.
  - Optimistic updates make an action feel instant. Roll back visibly if it fails.
  - A short deliberate delay can make a result feel more considered. Use this rarely and never to mislead.
  - Too fast is also a fault. An instant change can be missed, can be hard to follow, or can make a serious operation feel untrustworthy. This matters most for changes the person did not trigger.
  - For waits over 10 s, add the time remaining and what is being done.
- **Violation signs.** A button with no pressed or pending state. A request with no loading indicator. A spinner with no end for a long job. Content that jumps when data arrives. A form that can be submitted twice.
- **Check.** `CODE` for pending states, loading placeholders and disabled-while-submitting. `APP` to time real interactions. The static check finds missing states. Only the running app gives a number.
- **Sources.** https://lawsofux.com/doherty-threshold/ · https://www.nngroup.com/articles/response-times-3-important-limits/ · Book ch. 10

### 24. Parkinson's Law

- **Rule.** A task tends to take as long as the time allowed for it.
- **Building.**
  - Make the task shorter than people expect: autofill, defaults, remembered values, fewer fields.
  - Say how long something will take when it is short ("about 2 minutes").
  - A real, stated time box can help people finish. An invented one is manipulation.
- **Violation signs.** Fields with no autofill attributes. Values re-entered that the system holds. An open-ended task with no indication of size.
- **Check.** `CODE` for autocomplete attributes, defaults and field counts. `USERS` for real completion time.
- **Note.** This began as a satirical essay about bureaucracy in 1955. As a UX rule it is thin. Its useful content overlaps with Tesler's Law.
- **Sources.** https://lawsofux.com/parkinsons-law/

### 25. Fitts's Law

- **Rule.** A target is faster and easier to hit when it is large and close.
- **Building.**
  - Minimum pointer target: 24 by 24 CSS pixels, or smaller with enough clear space around it (WCAG 2.2 AA) **(sourced)**.
  - Better: 44 by 44 CSS pixels for important controls (WCAG 2.2 AAA) **(sourced)**. On touch, about 1 cm physical **(sourced)**.
  - Platform guidance agrees: Apple 44 by 44 pt, Google Material 48 by 48 dp with at least 8 dp between targets **(sourced, Book ch. 2)**. All of these are minimums.
  - A label tied to its input makes the label clickable too, which enlarges the target for free.
  - On phones, accuracy is best near the centre of the screen and worst at the edges and corners.
  - Primary actions, and anything used on the move, go larger.
  - Leave space between targets. Spacing does not rescue targets that are too small.
  - Make the whole row, card or icon-plus-label clickable, not just the text.
  - Put the next action near where the person just was: submit by the last field, contextual actions by their trigger.
  - Close together helps speed and hurts safety. Keep a destructive action away from a frequent one.
- **Violation signs.** Icon buttons under 24 px with no padding. A card where only the title is a link. Submit at the top of a long form. Delete beside Save with the same size. Tightly packed row actions.
- **Check.** `CODE` for size and padding classes on interactive elements. `APP` to measure rendered boxes at each breakpoint, since content and wrapping change the real size.
- **Sources.** https://lawsofux.com/fittss-law/ · https://www.nngroup.com/articles/fitts-law/ · https://www.nngroup.com/articles/touch-target-size/ · https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html · https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html · Book ch. 2

---

## Group F. Motivation and feeling

### 26. Goal-Gradient Effect

- **Rule.** People put in more effort the closer they are to a goal.
- **Building.**
  - Show progress wherever there is a goal with more than one step.
  - Place the progress indicator next to the action that advances it, not on a separate page.
  - Say what is left ("2 of 5 done, 3 to go"), not only what is done.
  - Break a long goal into nearer sub-goals, so the end is always within sight.
  - Starting people with real progress already counted raises completion. In one field study, pre-stamped loyalty cards were redeemed by 34% of customers against 19% for blank cards with the same number of purchases required **(sourced)**.
  - Counted progress must be real. Credit for something the person did (signed up, attended) is honest. Invented progress is not.
- **Violation signs.** A multi-step task with no indication of position or length. Progress shown only as a raw count with no total. Progress shown somewhere the person does not act. A bar that resets or moves backward without explanation.
- **Check.** `CODE` for where progress is computed and rendered and whether a total is shown. `APP` for whether it is visible at the moment of action. `USERS` for effect on completion.
- **Sources.** https://lawsofux.com/goal-gradient-effect/ · Kivetz, Urminsky and Zheng (2006): https://business.columbia.edu/faculty/research/goal-gradient-hypothesis-resurrected-purchase-acceleration-illusionary-goal · Nunes and Drèze (2006), via https://coglode.com/nuggets/endowed-progress-effect

### 27. Zeigarnik Effect

- **Rule.** As usually stated: people remember unfinished tasks better than finished ones. As the evidence stands: people tend to go back to an unfinished task when given the chance.
- **Building.**
  - Make unfinished work visible and easy to pick up: "continue where you left off", a clear in-progress state, a saved draft.
  - Show that more exists, so people know there is something to return to.
  - Do not assume people will remember by themselves. The reminder has to be on the screen.
  - Too many open loops cause anxiety and avoidance. Show the next one, not all of them.
- **Violation signs.** No in-progress state, only "not started" and "done". A half-finished task is lost on leaving. Returning users land on a generic page with no resume point. A long list of incomplete items shown as a wall of red.
- **Check.** `CODE` for an in-progress state and persisted drafts. `APP` to leave mid-task and come back.
- **Note. The memory claim is weak.** A 2025 meta-analysis found no memory advantage for unfinished tasks. It did find a general tendency to resume interrupted tasks, which is called the Ovsiankina effect. Build for resumption, not for recall.
- **Sources.** https://lawsofux.com/zeigarnik-effect/ · Ghibellini and Meier (2025), doi:10.1057/s41599-025-05000-w: https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05000-w.html

### 28. Peak-End Rule

- **Rule.** People judge an experience by its most intense moment and by how it ended, not by the average.
- **Building.**
  - Find the moment of most value in each flow and make it good.
  - Design the ending on purpose: the completion screen, the confirmation, the last step.
  - Fix the worst moment first. One bad moment outweighs several good ones.
  - Errors, empty states and outages are endings. Say what happened, what to do next, and do not blame the person.
  - Do not add things after the natural end. An upsell or extra ask after completion spoils the close.
  - No "please don't go" overlays.
  - Waiting is a common negative peak. Three things soften it: give people something to watch, explain how the estimate is worked out, and show the steps so they feel progress.
- **Violation signs.** A completed task returns to a list with no acknowledgement. A generic error with no next step. A celebration that blocks the next action. An extra request placed straight after completion.
- **Check.** `CODE` for completion, error and empty states. `APP` to finish a flow and to break one. `USERS` for what people actually remember.
- **Sources.** https://lawsofux.com/peak-end-rule/ · https://www.nngroup.com/articles/peak-end-rule/ · Book ch. 6

### 29. Aesthetic-Usability Effect

- **Rule.** People believe that a good-looking interface is easier to use, and forgive its small faults.
- **Building.**
  - Visual quality earns patience and trust. It is worth the effort.
  - First impressions form in about 50 ms and rarely change afterwards **(sourced, Book ch. 7)**.
  - The effect is not only perception. In one study, people finished tasks faster on the attractive version of a functionally identical prototype.
  - It hides problems. A polished screen can still fail at its job.
  - It covers minor faults only. People do not forgive a blocked task because the page is attractive.
  - Praise for the look of a screen is not evidence it works. Judge by whether the job got done.
- **Violation signs.** In the UI: visual treatment that costs function, such as low-contrast text, hidden controls, or animation that delays the task. In the process: a review that reports "looks clean" as a usability result.
- **Check.** `APP` for the visual judgement. `USERS` to separate "looks easy" from "is easy". An audit must never record appearance as proof of usability.
- **Sources.** https://lawsofux.com/aesthetic-usability-effect/ · https://www.nngroup.com/articles/aesthetic-usability-effect/ · Book ch. 7

### 30. Flow

- **Rule.** People become absorbed when the challenge matches their skill, the goal is clear and feedback is immediate.
- **Building.**
  - Match difficulty to the person. Too hard frustrates, too easy bores. Offer a starting point for beginners and room to go further.
  - State the goal of each task plainly.
  - Give feedback on every action, straight away.
  - Remove interruptions during a task: unneeded modals, forced detours, waits.
- **Violation signs.** A modal or tour that interrupts a task in progress. No feedback after an action. Every task the same difficulty regardless of the person. A task with no stated outcome.
- **Check.** `CODE` for interruptions triggered mid-task. `APP` to do a task end to end. Whether people reach flow is `USERS` only.
- **Sources.** https://lawsofux.com/flow/

---

## Where the laws conflict

When two laws disagree, the rubric decides. This section lists the known conflicts and a default.

| Conflict | What pulls each way | Default |
|---|---|---|
| Hick's Law against Tesler's Law | Fewer options speeds the choice. Removing options pushes the complexity onto the person in another form. | Reduce what is shown first, not what is possible. Keep the capability one clear step away. |
| Hick's Law against Working Memory | Hiding options shortens the list. Hidden options must be remembered or found. | Hide only what is rare. No more than two levels of disclosure (sourced: https://www.nngroup.com/articles/progressive-disclosure/). |
| Hick's Law against Fitts's Law | Hiding an action behind a menu cuts choices. It also makes the action further away and adds a click. | Frequent actions stay visible. Rare ones can go in a menu. |
| Miller's Law against visible menus | "Seven items" suggests cutting. Visible options rely on recognition, not memory. | Do not cap by number. Group instead. |
| Jakob's Law against Von Restorff | Familiar means looking like everything else. Memorable means looking different. | Conventional behaviour and placement. Distinctive emphasis on one thing per region. |
| Jakob's Law against a brief for distinctive, non-template design | Convention against distinctive design. | Distinctive in look and tone. Conventional in how controls behave. |
| Von Restorff against Selective Attention | Make it stand out. Things that stand out too much look like adverts and get skipped. | Emphasis through weight, size and position before colour blocks and motion. |
| Von Restorff against Similarity | One thing different. Like things alike. | Break similarity once, on purpose, for the primary action. |
| Common Region against Occam's Razor | Containers make groups clear. Containers are extra parts. | Spacing first. Add a container only when spacing cannot do it. |
| Fitts's Law against error prevention | Close targets are fast. Close targets cause slips. | Sequential actions close together. Destructive actions apart, and confirmed. |
| Doherty Threshold against deliberate delay | Faster is better. A short pause can make a result feel earned. | Fast by default. A deliberate pause needs a written reason. |
| Goal-Gradient and Zeigarnik against Peak-End | Open loops and remaining steps pull people on. A good ending needs closure. | Close the current loop fully before showing the next one. |
| Goal-Gradient against Cognitive Bias | Head-start progress raises completion. Invented progress is a trick. | Count only real progress. |
| Paradox of the Active User against Tesler's Law | People will not read. Some complexity needs explaining. | Explain at the point of use, in one line, never in a separate tour. |
| Aesthetic-Usability against Doherty and Fitts | Polish builds trust. Animation and delicate controls cost time and target size. | Function limits win: response time and target size are floors. |
| Flow against Peak-End | No interruptions. Celebrate the high points. | Celebrate at a natural stop, never mid-task, and never blocking the next action. |
| Pareto against edge cases (Postel) | Spend on the common path. Be robust to the uncommon input. | Polish follows usage. Robustness is a floor everywhere. |

## Overlap with Octalysis core drives

Octalysis has eight core drives. Drives 1 to 3 are called White Hat: they leave people feeling capable and in control. Drives 6 to 8 are called Black Hat: they create urgency and can leave people uneasy afterwards. Drives 2, 4 and 6 lean on external reward. Drives 3, 5 and 7 lean on the activity being rewarding in itself. Source: https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/

The Laws of UX mostly describe whether people **can** do something. Octalysis describes whether they **want** to. The laws below are where the two meet.

| Core drive | Laws that support it | Laws that limit it |
|---|---|---|
| 1. Epic Meaning and Calling | Peak-End Rule (the close is where meaning lands). Mental Model (purpose in the user's own terms). | Paradox of the Active User (people skip the framing and go to the task, so meaning cannot live only in an intro). Occam's Razor. |
| 2. Development and Accomplishment | Goal-Gradient Effect. Zeigarnik and resumption. Flow (challenge matched to skill). Peak-End (completion moments). Doherty (instant feedback on progress). | Cognitive Bias (no invented progress). Von Restorff (too many badges and none stands out). |
| 3. Empowerment of Creativity and Feedback | Flow. Doherty Threshold (feedback loop speed). Postel's Law (accept varied input, so experimenting is safe). Tesler's Law. | Hick's Law and Choice Overload (open-ended choice can stall a beginner). |
| 4. Ownership and Possession | Working Memory (saved items are external memory). Zeigarnik (my unfinished work). Tesler's Law (the system remembers my things). | Occam's Razor (collections for their own sake are clutter). |
| 5. Social Influence and Relatedness | Jakob's Law (familiar social patterns). Common Region and Similarity (who is in my group). | Cognitive Bias (social comparison can shame). Selective Attention (a busy feed is skipped). |
| 6. Scarcity and Impatience | Hick's Law (unlocking over time reduces first-run choice). Von Restorff (a locked item stands out). | Cognitive Bias (fake scarcity is manipulation). Flow (waiting breaks it). Peak-End (a blocked moment is a negative peak). |
| 7. Unpredictability and Curiosity | Zeigarnik (showing more exists). Von Restorff (novelty). | Jakob's Law and Mental Model (people need the basics to be predictable). Doherty (uncertain waits feel longer). |
| 8. Loss and Avoidance | Zeigarnik (losing unfinished work). Goal-Gradient (not wasting progress made). | Cognitive Bias (loss framing is the easiest drive to abuse). Peak-End (losing a streak is a strong negative peak and can end engagement). |

Project-specific readings of this table belong in that project's own notes, not here.

## Book reference

- Jon Yablonski, *Laws of UX: Using Psychology to Design Better Products and Services*, O'Reilly, first edition, 2020. Chapter notes: `book/chapter-notes.md`. Method: `method/principle-law-rule.md`. Ethics: `method/ethics-checklist.md`.
