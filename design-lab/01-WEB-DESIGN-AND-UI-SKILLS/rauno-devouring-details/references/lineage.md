# Lineage

Devour stands on a body of design thought that predates and exceeds it. This document maps that lineage in five layers, from pre-HCI foundations through modern web design engineering, and shows how each layer feeds the spine of principles in `devour/SKILL.md`.

The five-layer model is not a strict hierarchy ... great work crosses layers ... but it is a useful way to understand why some "polish" advice ages well and other advice ages badly. **Advice that traces only to Layer 4 is fashion. Advice that traces through Layers 3, 2, 1, and 0 is craft.**

---

## Layer 0 ... Pre-HCI foundations

Pre-computing sources whose work predates software but shaped every subsequent treatment of motion, information, grid, and method. These are not historical curiosities... they are load-bearing for the principles that Layers 1 through 4 operationalize. When Emil Kowalski and Rauno Freiberg write about motion, they are writing in a vocabulary that Johnston and Thomas named in 1981. When Dieter Rams wrote his 10 principles, he was articulating the systematic-design method that HfG Ulm codified.

### Ollie Johnston and Frank Thomas

Disney animators who spent the 1930s through 1970s at the studio, Johnston and Thomas co-authored *The Illusion of Life: Disney Animation* (1981). The book codified the 12 principles of animation: squash and stretch, anticipation, staging, straight ahead and pose to pose, follow through and overlapping action, slow in and slow out, arc, secondary action, timing, exaggeration, solid drawing, and appeal. These principles were not invented to make cartoons cute; they were derived empirically from the problem of making motion feel physically real. A character that squashes on impact and stretches on release is obeying the same physics as a rubber ball. Timing that front-loads ease (slow in) and back-loads settle (slow out) is modeling inertia. The vocabulary is animation; the underlying claim is about physical honesty in motion.

**Devour load:** Principle 2 (physics over duration) traces to squash and stretch, arcs, and slow-in/slow-out. Principle 5 (sequence carries meaning) traces to anticipation, staging, timing, and follow-through / overlapping action. Emil Kowalski and Rauno Freiberg both cite *The Illusion of Life* as primary source material.

### Josef Müller-Brockmann

Swiss graphic designer and art director. *Grid Systems in Graphic Design* (1981) is the systematic treatment of the typographic grid as an architecture for information rather than a convenience for layout. Müller-Brockmann's argument is that the grid is not a constraint applied from the outside: it is the underlying logic that makes decisions legible in relation to each other. Modular grids, baseline grids, and column structures give every element a position that belongs to a system. His work was central to the International Typographic Style (Swiss Style) that defined European graphic design from the 1950s through the 1970s and shaped every design system built since.

**Devour load:** Principle 12 (type is a system) traces most directly to Müller-Brockmann. Principle 10 (density is a craft choice) traces to the systematic-grid foundation... density is a craft choice when the grid supports the decision; it is noise without one.

### Jacques Bertin

French cartographer and theorist. *Semiology of Graphics* (1967) is the first systematic account of the visual variables that communicate information in a graphic: position, size, shape, value, color, orientation, and texture. Bertin's contribution was to treat graphic communication as a language with grammar rules, not an art with aesthetic conventions. Each visual variable has a different set of properties (ordered vs. unordered, quantitative vs. categorical) and a different range of appropriate uses. Edward Tufte's later work on data-ink ratio and chartjunk is built on Bertin's foundation; Bertin described the grammar, Tufte wrote the practice manual.

**Devour load:** Principle 9 (reduce decoration, increase information) traces through Tufte to Bertin. Bertin's grammar of visual variables is why the data-ink ratio is not a style preference but a structural claim: decoration occupies variables that could carry information.

### Hochschule für Gestaltung Ulm

German design school, 1953 to 1968. Founded by Inge Aicher-Scholl, Otl Aicher, and Max Bill as a successor to the Bauhaus. Later directed by Tomás Maldonado. HfG Ulm codified what is now called systematic design method: design as a discipline that proceeds from research, defined method, and explicit criteria rather than from individual stylistic intuition. The school's collaboration with Braun produced the product language that Dieter Rams later articulated as his 10 principles. Rams did not study at Ulm, but he worked within the tradition it established: his principles are one articulation of the Ulm method applied to industrial product design.

The school closed in 1968 after funding conflicts with the state of Baden-Württemberg, but its methodology shaped European industrial design, graphic design, and product design curricula for decades. Otl Aicher went on to design the 1972 Munich Olympics visual system; the Ulm method is visible throughout.

HfG Ulm is cited here as a school, not a book. Layer 0 accommodates both: what matters is the load-bearing contribution to the lineage, not the publication format.

**Devour load:** Layer 1's entire framing of design as systematic discipline (rather than self-expression) traces to HfG Ulm. Without Ulm, Rams's 10 principles have a different character. Rams's own principles 8 ("thorough down to the last detail") and 10 ("as little design as possible") are legible as the Ulm method applied to industrial product design... and those two Rams principles are the load-bearing claims under devour's epigraph and its stance on decoration.

---

## Layer 1 ... Principles of design itself

Universal, timeless. These are the principles that apply whether you are designing a coffee maker, a poster, a building, or a screen.

### Dieter Rams

Designer at Braun for over four decades. His **10 Principles of Good Design**, formulated in the late 1970s and early 1980s, are the most-cited articulation of design ethics in modern practice. The full list:

1. Good design is innovative.
2. Good design makes a product useful.
3. Good design is aesthetic.
4. Good design makes a product understandable.
5. Good design is unobtrusive.
6. Good design is honest.
7. Good design is long-lasting.
8. Good design is thorough down to the last detail.
9. Good design is environmentally friendly.
10. Good design is as little design as possible.

**Devour load:** Principles 4, 5, 6, 8, and 10 are heavily encoded. Principle 8 ("thorough down to the last detail") is the epigraph of the entire skill. Principle 6 ("honest") is the load-bearing principle behind devour's stance on motion (#1) and reversibility (#4).

Source: *Less and More: The Design Ethos of Dieter Rams* (Klemp & Ueki-Polet, 2009).

### Charles and Ray Eames

> "The details are not the details. They make the design."

That single quote is the moral foundation for treating polish as not-optional.

### Naoto Fukasawa

Design philosophy of "Without Thought" ... interfaces that work without conscious attention ... and "super-normal" ... the ordinary done with extraordinary care. Devour's principle #8 (affordances visible without being loud) descends from Fukasawa.

### Edward Tufte

*The Visual Display of Quantitative Information* (1983), *Envisioning Information* (1990), *Visual Explanations* (1997), *Beautiful Evidence* (2006). The canonical body of work on information design. Concepts encoded in devour:

- **Data-ink ratio** ... every pixel earns its place. → devour #9
- **Small multiples** ... repetition with variation as a way to show patterns. → devour exemplars
- **Density as a virtue** ... when designed well, more information is more usable, not less. → devour #10
- **Chartjunk** ... decoration that masquerades as information. → devour anti-patterns

### Christopher Alexander

*A Pattern Language* (1977), *The Timeless Way of Building* (1979), *Notes on the Synthesis of Form* (1964). The idea that good design has a **quality without a name** ... a sense of rightness that is recognizable but hard to articulate. Devour is, at its core, an attempt to make that quality nameable enough to review for. Alexander's pattern language structure also influenced the principles-tactics-anti-patterns format of `references/principles/`.

---

## Layer 2 ... Human-computer interaction

The principles of designing for software and computers specifically. These thinkers translated Layer 1 ideas into the medium of pixels and input devices.

### Bret Victor

The most influential interaction design thinker of the past 25 years. Key essays:

- **"Magic Ink"** (2006) ... the case for information software as a graphic design problem, not a software engineering problem
- **"Inventing on Principle"** (2012) ... the talk; live, dynamic representation as a creative tool
- **"Learnable Programming"** (2012) ... how software hides its state and how that's bad
- **"A Brief Rant on the Future of Interaction Design"** (2011) ... the case against the touchscreen monoculture

[worrydream.com](https://worrydream.com)

**Devour load:** Victor's insistence on **dynamic feedback** and **state visibility** underlies devour #4 (reversibility) and #7 (preserve state across boundaries).

### Bill Verplank

Co-author with Bill Moggridge of the Interaction Design framework: **do, feel, know.** When a user takes an action, the interface must answer three questions ... what did I do, how does that feel, and what do I now know?

### Bill Buxton

*Sketching User Experiences* (2007). Long-running thesis that **input is more important than output** in interaction design. The history of computing is a history of input innovations (mouse, multi-touch, voice). Devour's principle #6 ("the fingertip and the cursor are not the same") is Buxton.

### Don Norman

*The Design of Everyday Things* (1988, revised 2013), *Emotional Design* (2004). The vocabulary that lets designers talk about why things work or don't:

- **Affordances** ... the perceived possible actions
- **Signifiers** ... the cues that point to those affordances
- **Mapping** ... the relationship between controls and effects
- **Feedback** ... the system telling the user what just happened
- **Gulf of execution / gulf of evaluation** ... the gaps that interfaces must bridge

**Devour load:** Norman's vocabulary is throughout. Principle #8 (affordances visible without being loud) is the cleanest Norman descendant.

### Bruce Tognazzini ("Tog")

Apple Human Interface Group, founder of the Bruce Tognazzini company. **First Principles of Interaction Design** ([asktog.com](https://asktog.com)) is a comprehensive, opinionated checklist that has aged remarkably well. Devour's principle #6 (Fitts's law, hit boxes) and #7 (state preservation) both have Tog underpinnings.

### Jon Yablonski

Product designer in Detroit. *Laws of UX* (O'Reilly, 1st ed. 2020, 2nd ed. 2024) and [lawsofux.com](https://lawsofux.com), launched 2017. The canonical compilation of cognitive UX heuristics for working designers ... 30 laws drawn from psychology, perception research, and HCI, curated into a working vocabulary that practitioners reach for daily. The selection (which laws make the cut), the naming conventions (e.g., "Hick's Law" rather than "Hick-Hyman Law"), and the groupings (perception / decision-making / memory / interaction / behavior) are Jon's authored contributions. The underlying research is older and authored by others; the *legibility* of this set as a daily UX reference is Jon's.

**Devour load:** the 30 laws live in [`laws-of-ux.md`](laws-of-ux.md) as a sibling reference to the spine. They complement Devour's principles ... they do not replace them. When a finding touches composition density, decision load, working memory, motor accuracy, or expectation, the matching law and its citation are there. Principle #6 (Fitts), #10 (Miller / density), and #4 (Peak-End reading of error paths) all have direct law counterparts. The [`methodology.md`](methodology.md) entry *cite-the-compiler* names the discipline Devour models in citing Jon prominently rather than reaching only for the underlying researchers.

---

## Layer 3 ... Native software craft

Where Layer 1 and 2 principles get applied to the specific medium of native software ... iOS, macOS, modern desktop and mobile apps. This is where the lineage starts to feel contemporary.

### Imran Chaudhri and Bas Ording (Apple, 2007 and after)

The original iPhone interaction design. Inertial scrolling, rubber-banding, the home button gesture, the lock screen. Each of these is a complete answer to a specific Layer 2 question. Studied carefully, they reveal the principles. **Devour load:** rubber-banding is the canonical example for principle #2 (physics over duration).

### Loren Brichter

Tweetie (2008-2010), invented pull-to-refresh. Letterpress (2012). Lived by the maxim **"every pixel matters."** The pull-to-refresh interaction is a perfect Layer 3 demonstration of Layer 2 principles ... it answers "what just happened" (Norman) with physical feedback (Buxton), in a way that respects state continuity (Tog).

### Andy Matuschak

Co-creator of Khan Academy's iPad app, formerly Apple. Now writes and researches at [andymatuschak.org](https://andymatuschak.org). Key contributions to the lineage:

- **Working memory as a first-class design constraint** ... interfaces should not require users to remember things across boundaries
- **Patches** ... an alternative model for collaborative editing that respects user state
- **Spaced repetition UX** ... making learning interfaces honest about the difficulty curve

### Andy Allen / NotBoring Software

[notboring.software](https://notboring.software). Weather, Calculator, Habits ... iOS apps that take Layer 1-3 principles and add a particular kind of considered playfulness. Allen has been quoted as a fan of Rauno's Devouring Details work. The line from Rams to NotBoring is direct, and short.

### The Linear team

[linear.app](https://linear.app). The Linear Method is the most important written articulation of modern productivity software design. Key principles encoded in Linear:

- **Speed as a feature** ... every interaction is sub-100ms
- **Density as a craft choice** ... Linear is information-dense by intent
- **Keyboard-first** ... the cursor is for novices; experts live in keys

Devour's principles #6 (ergonomics), #7 (state preservation), and #10 (density as choice) all draw from Linear.

### Jason Yuan

MercuryOS, a speculative ambient operating system. The work is influential out of proportion to its production reach because it makes legible a set of design ideas (radial menus, ambient surfaces, action-first interfaces) that are otherwise hard to articulate. Rauno Freiberg has cited MercuryOS directly.

---

## Layer 4 ... Modern web design engineering

The current generation of designers who have made the web feel like native software. These are the people whose work shows up most directly in devour's tactical layer.

### Rauno Freiberg

Staff Design Engineer at Vercel. Previously at The Browser Company on Arc. Estonian. (Name spelled **Freiberg** ... never "Fäber", "Faber", or other variants. When citing him in review output, use the exact spelling.) Author of:

- **[Devouring Details](https://devouringdetails.com)** ($249) ... interactive reference manual with 23 chapters, 23 downloadable React components, and 8 named principles: Inferring Intent, Interaction Metaphors, Ergonomic Interactions, Simulating Physics, Motion Choreography, Responsive Interfaces, Contained Gestures, Drawing Inspiration
- **[rauno.me](https://rauno.me)** ... ~70 craft entries spanning prototypes, production work, and essays
- Essays: "Invisible Details of Interaction Design" (2023), "Designing Depth" (2024), "Crafting the Next.js Website" (2023), "What will you ship?" (2023), "History of Software Design" (2026)
- Integrated open source: [cmdk](https://github.com/pacocoursey/cmdk) by Paco Coursey (used and integrated by Rauno at Vercel in 2020) ... the command-menu pattern used by virtually every modern productivity app

**Devour load:** Rauno is the single largest tactical influence on devour's Layer 4. His 8 DD principles map directly to devour's spine: Inferring Intent → #3, Ergonomic Interactions → #6, Simulating Physics → #2, Motion Choreography → #5, Interaction Metaphors → #11.

### Emil Kowalski

Design Engineer at Linear. Previously at Vercel on the design team. Author of:

- **[Animations on the Web](https://animations.dev)** ($249) ... canonical web animation course
- **[Sonner](https://github.com/emilkowalski/sonner)** ... opinionated toast component for React
- **[Vaul](https://github.com/emilkowalski/vaul)** ... drawer component for React
- **[emilkowal.ski](https://emilkowal.ski)** ... 14+ essays on craft and animation

Key essays:

- "Train Your Judgement" ... settling for good enough is not good enough
- "Developing Taste" ... why taste matters and how to develop it
- "Good vs Great Animations" ... practical tips
- "Great Animations" ... what it takes
- "You Don't Need Animations" ... the case against motion you don't need
- "Agents with Taste" ... transferring taste into AI
- "Building a Toast Component" ... the Sonner story
- "Building a Drawer Component" ... the Vaul story
- "The Magic of Clip Path" ... an underrated CSS property

**Devour load:** Emil's writing on judgment and taste underlies the entire stance of devour. "You Don't Need Animations" is the source for principle #1 (honest motion). Sonner's lifecycle is the canonical exemplar for #4 (reversibility).

### The Browser Company

Arc browser, now Dia. Pushed the envelope on what a browser interface could be. Many of the considered details (sidebar interactions, tab management, command bar, color and theme system) are studied and absorbed into Layer 4 practice. Rauno was on the design team.

### The Vercel design organization

[Geist](https://vercel.com/geist) design system. The Vercel dashboard. The Next.js homepage. The cmdk pattern (Paco Coursey). The Vercel design org has, more than any other corporate design team in the past five years, raised the public expectation for what production web software can look and feel like.

### Brian Lovin

[brianlovin.com](https://brianlovin.com). Considered web craft. Personal site as gallery. Long-running practice of treating his own site as a continuously updated portfolio of small craft decisions.

### Sam Henri Gold

[samhenri.gold](https://samhenri.gold). Typography craft, motion theory. Recently published "Thoughts and Feelings around Claude Design" which articulates a thesis that Layer 4 craft is increasingly the domain that AI tools cannot easily reproduce ... raising the bar for human designers, not lowering it.

---

## Why this matters

Devour is opinionated about what makes design advice durable. The pattern is consistent: **principles from Layers 0-3 are stable; tactics from Layer 4 are durable when they instantiate those principles, and faddish when they don't.**

A spring animation is durable not because Rauno uses it, but because it instantiates Johnston and Thomas's slow-in/slow-out (Layer 0), Buxton's input-first thinking (Layer 2), and Brichter's "every pixel matters" stance (Layer 3). When the next animation library replaces Framer Motion, the principle survives. When the next design influencer replaces Rauno, the principle survives.

This is why devour's review output always cites the principle first, the tactic second, and the contemporary exemplar third. The principle is the load-bearing claim. The tactic is the working answer. The exemplar is evidence.

---

## See also

- [`principles-map.md`](principles-map.md) ... explicit map from each devour principle back to its primary sources
- [`exemplars.md`](exemplars.md) ... named products with specific moves to study
- [`anti-patterns.md`](anti-patterns.md) ... the failure modes the spine catches
- [`reading-list.md`](reading-list.md) ... ordered reading list for someone new to the lineage
