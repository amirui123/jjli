# Reading list

An ordered reading list for someone new to the devour lineage. Organized by layer. Each entry includes a brief note on why it matters for design engineering practice.

The five-layer model is explained in [`lineage.md`](lineage.md). The short version: Layers 0-3 are the slow-moving foundations that make Layer 4 advice durable. If you only read Layer 4, you will re-derive the principles every few years when the Layer 4 names change. If you read Layers 0-3 first, the principles stay with you permanently.

See "Where to start" at the bottom of this file for sequencing by background.

---

## Layer 0 ... Pre-HCI foundations

Pre-computing sources. These thinkers were not designing software, but their work is directly load-bearing for devour's principles on motion, information, density, and systematic type. Layer 1 operationalizes what Layer 0 built.

---

### Ollie Johnston and Frank Thomas ... *The Illusion of Life: Disney Animation*

**Format:** Book. 1981. Long (575 pages), but the chapter on the 12 principles is self-contained.

**Why it matters for devour:** Squash and stretch, arcs, slow in and slow out, anticipation, staging, timing, and follow-through are the source vocabulary for devour's principles 2 (physics over duration) and 5 (sequence carries meaning). These are not cartoon techniques; they are observations about how physical motion communicates weight, causality, and intention. Emil Kowalski and Rauno Freiberg both cite this book directly.

---

### Josef Müller-Brockmann ... *Grid Systems in Graphic Design*

**Format:** Book. 1981. Also published in German (*Rastersysteme für die visuelle Gestaltung*).

**Why it matters for devour:** Müller-Brockmann's argument is that the grid is not a layout convenience; it is the systematic architecture that makes every element's position meaningful in relation to every other element. The chapter on typographic grids is the conceptual foundation for devour's principle 12 (type is a system). The modular grid framework underpins principle 10 (density is a craft choice): density decisions are only craft when there is a grid to support them.

---

### Jacques Bertin ... *Semiology of Graphics*

**Format:** Book. Originally published in French (*Sémiologie graphique*) in 1967. English translation published by the University of Wisconsin Press, 1983.

**Why it matters for devour:** Bertin identified the seven visual variables (position, size, shape, value, color, orientation, texture) and described the grammatical rules governing their use. This is the theoretical foundation that Edward Tufte built his data-ink ratio on. Devour's principle 9 (reduce decoration, increase information) traces through Tufte to Bertin. Bertin is the grammar; Tufte is the practice manual.

---

### Hochschule für Gestaltung Ulm ... School archive and histories

**Format:** Not a single book. Key secondary sources include *An HfG Ulm Review* (Ken Friedman, ed.) and *The Ulm School: The Development of Industrial Design* (Lindinger, ed., 1991). Also: Otl Aicher's *The World as Design* (1994) and *Typographie* (1988).

**Why it matters for devour:** HfG Ulm is where systematic design method was codified as a discipline: design proceeds from defined method, research, and criteria. Dieter Rams worked within this tradition. His 10 principles are the Ulm method applied to industrial product design. Understanding Ulm explains why Layer 1 Rams is what it is, not just what it says. Start with Aicher's *The World as Design* as the most accessible entry point.

---

## Layer 1 ... Principles of design

The most universal layer. These thinkers were not designing software, but their thinking is the load-bearing structure under every devour principle.

---

### Dieter Rams ... 10 Principles of Good Design

**Format:** Essay / list. Short. Widely reprinted.

**Link:** Search "Dieter Rams 10 principles" ... multiple authoritative reprintings exist. Also in the documentary *Rams* (2018) by Gary Hustwit.

**Why it matters:** Five of devour's twelve principles trace directly to Rams. Principle 6 ("Good design is honest") is the load-bearing claim under devour's entire stance on motion (#1) and reversibility (#4). Principle 8 ("Good design is thorough down to the last detail") is the epigraph of the skill. If you read nothing else from Layer 1, read the 10 principles.

---

### Dieter Rams ... *Less and More: The Design Ethos of Dieter Rams*

**Format:** Book. Klemp & Ueki-Polet, eds., 2009.

**Why it matters:** The longer treatment of Rams's thinking. Useful for understanding why the principles are the way they are, not just what they say. Pairs well with the Braun product archive as a way to see the principles applied across a body of work.

---

### Edward Tufte ... *The Visual Display of Quantitative Information*

**Format:** Book. First edition 1983; current edition 2001. Required.

**Link:** [edwardtufte.com](https://www.edwardtufte.com/tufte/books_vdqi)

**Why it matters:** Tufte's data-ink ratio is the single most useful framework for auditing information surfaces. Devour's principles #9 (reduce decoration) and #10 (density as craft) both trace here. The book is about statistical charts but the principles apply to any information surface. The chapter on chartjunk alone is worth the book.

---

### Edward Tufte ... *Envisioning Information*

**Format:** Book. 1990.

**Link:** [edwardtufte.com](https://www.edwardtufte.com/tufte/books_ei)

**Why it matters:** Small multiples, layering and separation, color theory. Deeper treatment of how to present more information without creating confusion. The small multiples chapter is particularly relevant to dashboard design.

---

### Don Norman ... *The Design of Everyday Things*

**Format:** Book. Original 1988 ("The Psychology of Everyday Things"); revised edition 2013.

**Why it matters:** The vocabulary that allows you to talk precisely about why interactions work or don't. Affordances, signifiers, feedback, constraints, mappings. Devour's principle #8 (affordances visible without being loud) is Norman's signifier concept made reviewable. The gulf of execution and gulf of evaluation are the theoretical basis for reversibility (#4).

---

### Christopher Alexander ... *A Pattern Language*

**Format:** Book. Alexander, Ishikawa, and Silverstein. Oxford University Press, 1977.

**Why it matters:** Not a software design book, but the conceptual ancestor of component libraries, design systems, and the principles-tactics-exemplars format that devour uses. Alexander's claim that good design has a "quality without a name"... a sense of rightness that is recognizable but hard to articulate... is what devour is trying to make nameable enough to review for.

---

### Naoto Fukasawa ... Without Thought / Super-Normal

**Format:** Essays and lectures, not a single book. Search "Naoto Fukasawa super-normal" and "Without Thought."

**Why it matters:** Fukasawa's concept of "super-normal" design... the ordinary done with extraordinary care... is the aspirational end state for devour's principle #8. Affordances that require no thought to recognize because they are so perfectly calibrated to the medium.

---

## Layer 2 ... Human-computer interaction

Where Layer 1 principles get applied to the medium of screens and input devices. Bret Victor is the most important single voice in this layer for current practice.

---

### Bret Victor ... "Magic Ink: Information Software and the Graphical Interface"

**Format:** Essay. 2006. Long. Essential.

**Link:** [worrydream.com/MagicInk/](http://worrydream.com/MagicInk/)

**Why it matters:** The foundational argument that information software should be approached as a graphic design problem, not a software engineering problem. Victor argues that most software's interaction model is parasitic on the information it presents. Devour's entire stance on state visibility and reversibility (#4, #7) traces to this essay.

---

### Bret Victor ... "Inventing on Principle"

**Format:** Talk. CUSEC 2012. ~54 minutes.

**Link:** [vimeo.com/906418692](https://vimeo.com/906418692)

**Why it matters:** The talk that established Victor's reputation. The live representation demo... coding with immediate visual feedback... is a demonstration of every HCI principle from Layer 2 applied simultaneously. The thesis: creators should have immediate, live feedback from their creative tools.

---

### Bret Victor ... "A Brief Rant on the Future of Interaction Design"

**Format:** Essay. 2011. Short.

**Link:** [worrydream.com/ABriefRantOnTheFutureOfInteractionDesign/](http://worrydream.com/ABriefRantOnTheFutureOfInteractionDesign/)

**Why it matters:** The argument against touchscreen monoculture. Victor's point is that fingers are extraordinary tools and the "pictures under glass" metaphor uses almost none of their capability. This is the intellectual basis for devour's principle #6 (the fingertip and the cursor are not the same).

---

### Bruce Tognazzini ... "First Principles of Interaction Design"

**Format:** Essay / list. Maintained at asktog.com. Long, comprehensive.

**Link:** [asktog.com/atc/principles-of-interaction-design/](https://asktog.com/atc/principles-of-interaction-design/)

**Why it matters:** Tognazzini's list is more operational than Victor's essays. It is a working checklist of HCI principles, each with examples and anti-examples. Fitts's law (relevant to #6), the prediction principle (relevant to #3), and state preservation (relevant to #7) are all here, clearly explained.

---

### Bill Buxton ... *Sketching User Experiences*

**Format:** Book. 2007.

**Why it matters:** Buxton's central thesis: input is more important than output in interaction design. Devour's principle #6 is Buxton. The book covers the history of input devices, the role of sketching in design thinking, and the relationship between the designer's intent and the user's experience of interaction.

---

### Jon Yablonski ... *Laws of UX: Using Psychology to Design Better Products & Services*

**Format:** Book. O'Reilly Media, 1st ed. 2020, 2nd ed. 2024. Companion site at [lawsofux.com](https://lawsofux.com).

**Link:** [lawsofux.com/book/](https://lawsofux.com/book/)

**Why it matters:** The canonical compilation of cognitive UX heuristics for working designers. 30 laws from psychology, perception research, and HCI ... Hick, Fitts, Miller, Tesler, Peak-End, Jakob, Parkinson, Zeigarnik, and the Gestalt set ... curated into a vocabulary that practitioners can actually deploy. Each law is treated with its origin, a UX framing, real-world examples, and an explicit ethical-design consideration. The site is the quick-reference; the book is the long-form treatment.

**Devour use:** Jon's 30 laws live in [`laws-of-ux.md`](laws-of-ux.md) as a sibling reference to the spine, with Jon credited as the compiler on every entry and each underlying researcher cited with venue. The laws complement the 12 Devour principles ... they don't replace them. When a review touches composition density, decision load, working memory, motor accuracy, or expectation, the matching law is the cognitive evidence behind the principle.

---

## Layer 3 ... Native software craft

Where the principles get applied to native platforms (iOS, macOS, modern desktop and mobile apps). This layer is the bridge between theory and current web practice.

---

### Andy Matuschak ... Essays and notes at andymatuschak.org

**Format:** Ongoing writing. No single entry is required; the body of work is the reference.

**Link:** [andymatuschak.org](https://andymatuschak.org)

**Why it matters:** Matuschak writes precisely about working memory, state continuity, and what it means for an interface to respect the cognitive limits of its users. Devour's principle #7 (preserve user state) draws heavily from his framing of "working memory as a first-class design constraint."

---

### The Linear team ... The Linear Method

**Format:** Essay collection. The Linear Method is a set of documented principles for how Linear thinks about product design.

**Link:** [linear.app/method](https://linear.app/method)

**Why it matters:** The most important written articulation of modern productivity software design. Speed as a feature, density as a craft choice, keyboard-first ergonomics. Linear itself is the artifact; the Method explains the thinking behind it.

---

### Andy Allen ... NotBoring Software

**Format:** App catalog and occasional writing.

**Link:** [notboring.software](https://notboring.software)

**Why it matters:** Andy Allen's apps (Weather, Calculator, Habits) are the best current examples of Layer 3 craft applied to consumer iOS apps. The physics are right. The signifiers are earned. The motion is honest. Study them by using them, not by looking at screenshots.

---

### Loren Brichter ... Tweetie and pull-to-refresh

**Format:** Interviews and the apps themselves, not a single essay. The best interview is from The Changelog episode "Loren Brichter on Tweetie, Letterpress, and Indie Development."

**Why it matters:** Brichter's "every pixel matters" stance is the attitude behind devour. Pull-to-refresh (2008) is the canonical example of a new interaction idiom that matched the medium perfectly and became universal. Tweetie's state preservation (scroll position, tab state, draft text across background/foreground transitions) set the iOS standard for principle #7.

---

### Jason Yuan ... MercuryOS

**Format:** Design project + essays.

**Link:** [mercuryos.com](https://www.mercuryos.com)

**Why it matters:** A speculative redesign of the operating system interface built around spatial relationships and ambient surfaces. Useful for understanding what it means for an action surface to match its medium, and for thinking about interactions beyond the window-and-toolbar metaphor. Rauno Freiberg has cited MercuryOS directly.

---

## Layer 4 ... Modern web design engineering

The current generation of practitioners who have made the web feel like native software. This is where the principles show up as specific code patterns, components, and production artifacts.

---

### Rauno Freiberg ... *Devouring Details*

**Format:** Interactive course. $249.

**Link:** [devouringdetails.com](https://devouringdetails.com)

**Why it matters:** The single most important purchase for anyone serious about Layer 4 craft. 23 chapters. 23 downloadable React components. Rauno's 8 named principles (Inferring Intent, Interaction Metaphors, Ergonomic Interactions, Simulating Physics, Motion Choreography, Responsive Interfaces, Contained Gestures, Drawing Inspiration) map directly onto devour's spine. If you've read Layers 1-3, Devouring Details is where you'll see those principles expressed in production React code. If you haven't read Layers 1-3, start with Devouring Details and then work backward.

---

### Emil Kowalski ... *Animations on the Web*

**Format:** Video course. $249.

**Link:** [animations.dev](https://animations.dev)

**Why it matters:** The canonical web animation course. Covers Framer Motion in depth, spring physics, animation judgment, and the difference between motion that communicates and motion that decorates. Pairs directly with Devouring Details: DD covers the principles, Animations on the Web covers the implementation.

---

### Emil Kowalski ... Essays at emilkowal.ski

**Format:** Essays. Free.

**Link:** [emilkowal.ski](https://emilkowal.ski)

**Specific essays to read:**
- "You Don't Need Animations" ... the test for honest motion. Short and essential.
- "Developing Taste" ... why taste matters and how to develop it through deliberate looking.
- "Train Your Judgement" ... settling for "good enough" is not good enough.
- "Good vs Great Animations" ... concrete, actionable differences between acceptable and excellent animation.
- "Great Animations" ... what it takes at the highest level.

Start with "You Don't Need Animations." It is the shortest and most directly applicable to devour's principle #1.

---

### Rauno Freiberg ... Essays at rauno.me

**Format:** Essays. Free.

**Link:** [rauno.me](https://rauno.me)

**Specific essays to read:**
- "Invisible Details of Interaction Design" ... how small, invisible decisions compound into the feeling of quality. The practical companion to Devouring Details.
- "Designing Depth" ... layering, spatial hierarchy, and the use of shadow, blur, and scale to communicate depth without ornamentation.

---

### Brian Lovin ... brianlovin.com

**Format:** Personal site as practice.

**Link:** [brianlovin.com](https://brianlovin.com)

**Why it matters:** Lovin's site is a running demonstration of considered web craft decisions, many of them small and invisible. Worth bookmarking and returning to as a reference for what a well-maintained Layer 4 practice looks like in production.

---

### Sam Henri Gold ... samhenri.gold

**Format:** Essays and case studies.

**Link:** [samhenri.gold](https://samhenri.gold)

**Why it matters:** Typography craft, motion theory, and an articulate perspective on what AI tools can and cannot reproduce in design engineering. His recent essay on Claude design articulates why Layer 4 craft matters more in an AI-augmented world, not less.

---

## Adjacent reading

Typography, animation theory, and systems thinking that deepens the layer-specific reading above.

---

### Robert Bringhurst ... *The Elements of Typographic Style*

**Format:** Book. Multiple editions. The fourth edition (2012) is current.

**Why it matters:** The authoritative reference on typography. Devour's principle #12 (type is a system) requires a foundation in what a type system actually is. Bringhurst provides it. Dense, not breezy. Worth owning.

---

### Erik Spiekermann ... *Stop Stealing Sheep and Find Out How Type Works*

**Format:** Book. Multiple editions.

**Why it matters:** More accessible than Bringhurst. A practical introduction to how typefaces work and why type decisions matter. Good paired reading for designers who haven't studied typography formally.

---

### Disney's 12 Principles of Animation (Lasseter on principles)

**Format:** Essay by John Lasseter. "Principles of Traditional Animation Applied to 3D Computer Animation," 1987. Also codified in *The Illusion of Life* by Frank Thomas and Ollie Johnston.

**Why it matters:** Anticipation, follow-through, squash and stretch, slow in / slow out. These principles are not about cartoon animation; they are about how motion communicates physical reality. Devour's principle #5 (sequence carries meaning) and #2 (physics over duration) both have Disney lineage. The primary citation for *The Illusion of Life* is now in Layer 0; this entry covers Lasseter's derivative essay specifically.

---

## Where to start

The right starting sequence depends on where you are.

---

### If you are a designer who does not code

Start here:
1. Rams's 10 Principles (20 minutes)
2. Tufte's *The Visual Display of Quantitative Information* (a weekend)
3. Norman's *The Design of Everyday Things* (a week)
4. Devouring Details by Rauno Freiberg ($249, a few evenings)

This sequence gives you the foundation (Rams, Tufte, Norman) and then connects it directly to production web practice (DD). You will be able to identify what's wrong and describe why. You will need a coder to implement the fixes; learning to read and write React is the next step.

---

### If you are an engineer who wants to design well

Start here:
1. Norman's *The Design of Everyday Things* (a week)
2. Devouring Details by Rauno Freiberg ($249, a few evenings)
3. Emil Kowalski's Animations on the Web ($249, a few evenings)
4. Then dig back: Tufte, Rams, Bret Victor's essays

You already have the implementation instincts. Norman gives you the vocabulary to describe design problems. Devouring Details and Animations on the Web give you the specific web patterns. The backfill (Tufte, Rams, Victor) is for understanding *why* those patterns are right, which is what makes the knowledge durable.

---

### If you are already a design engineer

Start here:
1. Devouring Details by Rauno Freiberg (if you haven't already)
2. Emil Kowalski's essays (free, start with "You Don't Need Animations")
3. Then dig back into Layers 1-2: Tufte, Victor's essays, Tognazzini's First Principles

You already know what good looks like. The Layer 1-2 reading gives you the theoretical basis that makes your existing taste citable. The difference between "this feels wrong" and "this violates Tognazzini's prediction principle" is the difference between preference and principle. Devour is built around the second.
