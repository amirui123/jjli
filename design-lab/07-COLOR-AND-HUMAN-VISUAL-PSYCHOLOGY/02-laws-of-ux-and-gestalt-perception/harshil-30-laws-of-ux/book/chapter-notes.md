# Laws of UX (Yablonski, first edition, 2020): chapter notes

Notes on Jon Yablonski, *Laws of UX: Using Psychology to Design Better Products & Services*, O'Reilly, first edition. Read in full on 2026-10-13 from extracted text, in order, preface to chapter 12. The figures were not viewed, only their captions.

These are working notes in my own words, with page numbers so a claim can be checked against the book. They are not a substitute for the book and they do not reproduce its text.

## How the book is built

- Ten law chapters, then two chapters on responsibility and on putting the laws to work.
- Every law chapter has the same parts: the law in a sentence, key takeaways, overview, origins, examples, one "key consideration" that limits the law, and a conclusion.
- Five chapters carry a "psychology concept" sidebar and three carry a "technique" sidebar. Several of the website's 30 laws exist in this edition only as those sidebars.

| Ch. | Law | Concept sidebar | Technique sidebar | Key consideration (the limit) |
|---|---|---|---|---|
| 1 | Jakob's Law | Mental models | User personas | Sameness |
| 2 | Fitts's Law | | | Touch targets |
| 3 | Hick's Law | Cognitive load | Card sorting | Oversimplification |
| 4 | Miller's Law | Chunking | | The magical number seven |
| 5 | Postel's Law | | | Design resiliency |
| 6 | Peak-End Rule | Cognitive biases | Journey mapping | Negative peaks |
| 7 | Aesthetic-Usability Effect | Automatic cognitive processing | | Effect on usability tests |
| 8 | von Restorff Effect | Selective attention, banner blindness, change blindness | | Moderation and accessibility |
| 9 | Tesler's Law | | | When simplicity turns to abstraction |
| 10 | Doherty Threshold | | | When response times are too fast |

The pattern to take from the table: **no law is given without its limit.** Applying a law without its key consideration is the usual way these laws get misused.

## Preface (pp. v to x)

- The book began on a client project where the author had to justify design decisions with no data. Psychology research filled the gap, and the website came out of collecting it.
- The stance: adapt the design to how people perceive and process, do not make people adapt to the design.
- It is an introduction for designers, not a complete account of the psychology.

**Use:** the laws are a way to give reasons for a design decision when there is no data. They are not a replacement for data when data exists.

## 1. Jakob's Law (pp. 1 to 10)

- **Law.** People bring expectations from every other product they use.
- **Why it works.** Familiarity saves mental effort, and effort saved on the interface goes to the task.
- **Friction.** Not all friction is bad, and some is needed. The target is friction that serves no purpose. Conventions in page structure, workflows, navigation and the placement of things like search remove it.
- **Mental models (sidebar).** A mental model is what a person believes about how a system works. Good experience comes when the design matches that belief. The gap between the designer's model and the user's model is one of the hardest problems, and research methods exist to close it.
- **Discordance.** When a familiar product changes suddenly, the mismatch is called mental model discordance.
  - Snapchat's 2018 redesign changed the format in one release. Users objected publicly and many left for a competitor.
  - Google let YouTube users opt in to the 2017 redesign, preview it, give feedback and switch back. The same change in kind, with far less damage.
- **Other examples.** Form controls copy physical control panels. Shopping sites keep the familiar product, cart, checkout sequence. Car seat controls shaped like the seat.
- **Personas (sidebar).** A persona stops "the user" meaning something different to each team member. Parts: info, details, insights. It must be based on data from real users.
- **Limit: sameness.** The law does not ask every product to be identical. Some sameness is only trend. Some has good reason.
- **Author's rule.** Start with common patterns. Depart only when there is a strong argument that it improves the core experience. If you depart, test with users.

## 2. Fitts's Law (pp. 13 to 21)

- **Law.** Time to hit a target depends on its distance and its size. Paul Fitts, 1954. Index of difficulty: log2(2D / W).
- **Three rules for targets:** big enough to see and hit, enough space between them, placed where they are easy to reach.
- **Minimum sizes given** (p. 15): Apple 44 × 44 pt, Google Material 48 × 48 dp, WCAG 44 × 44 CSS px, Nielsen Norman Group 1 × 1 cm. These are minimums and should be exceeded.
- **Perception.** Small targets make an interface feel less usable even when people manage not to make errors.
- **Spacing.** Adult finger pads are 10 to 14 mm and fingertips 8 to 10 mm, so some touches land outside the target. Material recommends 8 dp or more between targets.
- **Position.** Hard-to-reach areas depend on device and grip. On phones people look at and touch the centre of the screen most accurately. Accuracy does not simply fall off from one corner to the other.
- **Examples.**
  - A label tied to its input enlarges the target.
  - The submit button sits next to the last field.
  - A dialog with accept and deny placed tightly together forces care to avoid the wrong one.
  - A car touchscreen with well-spaced navigation, where the driver's attention is elsewhere.
  - Apple's Reachability gesture brings the top of the screen down.

**Note for use:** the WCAG figure in the book is the stricter level. WCAG 2.2 also has a 24 × 24 CSS px minimum at level AA. See `reference/laws.md`.

## 3. Hick's Law (pp. 23 to 33)

- **Law.** Decision time rises with the number and complexity of choices. Hick and Hyman, 1952. RT = a + b log2(n).
- **Too many options is a symptom.** It shows the makers did not understand what the user needs. The same goes for a missing clear call to action, unclear information architecture and unneeded steps.
- **Cognitive load (sidebar).** The mental resource needed to understand and use an interface. Working memory has limited slots. When a task needs more than is available, information is lost, and if that information mattered the task gets harder and may be abandoned.
- **Examples.**
  - TV remotes grew a button per feature. People taped over all but the essential ones. Smart TV remotes kept only essentials and moved the rest into on-screen menus.
  - Google Search offers result filters only after a search has begun: the right choices at the right time.
  - Slack's onboarding hides everything but the message box, teaches through a bot, then reveals features step by step. This matches how people learn, by building on the last step.
- **Card sorting (sidebar).** A way to find how people expect content to be organised. Steps for a moderated open sort: identify topics, have participants group them, have them name the groups, debrief. Avoid topic labels that share a word, since people will group by the word.
- **Limit: oversimplification.** Simplify too far and it is no longer clear what is possible or what comes next. Icons are the standard case: they save space and make good targets, but few are universal, and the same icon does different jobs across products. Text labels beside icons fix this, most of all in navigation.
- **Too few is also a fault.** With too few choices it gets harder to tell which one leads where.

**Erratum:** the first key takeaway on p. 23 reads as if minimising choices increases decision time. The chapter means the opposite.

## 4. Miller's Law (pp. 35 to 41)

- **Law as usually stated.** People hold about seven items, plus or minus two, in working memory. George Miller, 1956.
- **What Miller found.** Memory span stayed near seven regardless of how much information each item carried. So the count of chunks matters more than their size. He used "magical number seven" as a figure of speech and was surprised it was taken literally. Later research shows the span is not constant, and suggests the average is lower.
- **Chunking (sidebar).** Grouping familiar units so they are stored as one. Applied to design: visually distinct groups with clear hierarchy, so people can scan, find what matches their goal, and act.
- **Examples.** A formatted phone number against a raw string of digits. A wall of text against the same text with headings, space, shorter lines, underlined links and highlighted key words. A dense news page organised into modules. A product listing grouped by proximity alone, with no borders.
- **Limit: the number seven.** Chunking sets no limit on how many items can be shown. Navigation does not need memorising because the options stay visible, so capping a menu at seven gives no usability gain. A menu with far more than seven links scans well when it is categorised and separated.

## 5. Postel's Law (pp. 43 to 51)

- **Law.** Be conservative in what you do and liberal in what you accept. Jon Postel, in the TCP specification, 1981.
- **Starting point.** People are inconsistent, distracted, error-prone and emotional. They expect to be understood and forgiven, to feel in control, and they dislike being asked for more than is needed.
- **Conservative output.** What the product gives back should be reliable and accessible to the widest range of people, whatever the device, input method, assistive technology or connection speed.
- **Liberal input.** Accept input through any mechanism and in varied formats.
- **Examples.**
  - Forms: ask only for what is necessary and never for what you already have. More fields cost effort, wear down decision quality and reduce completion.
  - Face ID: authentication with no typed input at all.
  - Responsive design: one design that adapts to any screen.
  - Progressive enhancement: core content and function for everyone, with extra layers added where support is detected. A search box that gains voice input where available.
  - Design systems: accept contributions widely, publish output that is clear and deliberate.
- **Limit: design resiliency.** Accepting more means more can go wrong, so plan for it.
  - Translated text can be much longer than English, and text direction varies.
  - People raise their default font size. Layouts must respond gracefully, for example by dropping the least important links first.

## 6. Peak-End Rule (pp. 53 to 62)

- **Law.** An experience is judged mostly by its most intense moment and its end. Kahneman and colleagues, 1993.
- **Evidence.** People preferred to repeat a longer cold-water trial that ended slightly warmer over a shorter one. In later medical studies, patients whose procedure was extended with a milder final stretch rated it less unpleasant and were more likely to come back.
- **Cognitive biases (sidebar).** Systematic shortcuts in judgement. They save effort and sometimes distort. Confirmation bias: seeking and remembering what confirms what you already believe. The peak-end rule is a memory bias, related to the recency effect.
- **Examples.**
  - Mailchimp treats the moment before sending a campaign as a peak and lightens it with character and humour, then marks the send with a small celebration.
  - Uber treated waiting as an unavoidable negative peak and worked on three things: keeping people occupied, showing how the arrival estimate is made, and showing each step so progress is felt. Cancellations after requesting fell.
- **Journey mapping (sidebar).** A map of one persona doing one task. Parts: the lens (who, which scenario, what they expect), the experience (phases, actions, thoughts, and an emotional line across the whole), and insights (opportunities, metrics, owners). The emotional line is where the peaks show.
- **Limit: negative peaks.** Something will go wrong. People recall bad moments more vividly than good ones. A failure with a good fallback can become a point of rapport, as with a well-made error page.

## 7. Aesthetic-Usability Effect (pp. 65 to 74)

- **Law.** People perceive attractive design as more usable. Kurosu and Kashimura, 1995: 26 ATM layouts, 252 participants, and perceived usability tracked beauty more than actual ease of use. Confirmed by later work.
- **More than perception.** Attractive design produces a positive response that improves thinking, raises perceived usability and lends credibility.
- **Automatic cognitive processing (sidebar).** Fast, effortless judgement (System 1) forms impressions before slow, deliberate thought (System 2) is called on. People scan for what matches their goal and skip the rest. Opinions of a website form within about 50 ms, visual appeal is a main factor, and the opinion rarely changes with more time on the site.
- **Examples.** Braun under Dieter Rams, where every detail had a function, and Apple continuing that approach. People overlook Apple's usability faults because of the aesthetic.
- **Limit: effect on usability tests.** With two functionally identical phone prototypes, people rated the attractive one more usable and also completed tasks on it faster. So appearance can hide real problems in testing. The remedy: listen to what participants say, watch more closely what they do, and ask questions that take them past the look.

## 8. von Restorff Effect (pp. 77 to 85)

- **Law.** Among similar items, the one that differs is remembered. Hedwig von Restorff, 1933.
- **The tension.** Emphasis guides people to a goal. Too many points of emphasis compete and make things harder to find. Colour, shape, size, position and motion all direct attention.
- **Selective attention (sidebar).** Attention is limited in capacity and duration, so people filter out what seems irrelevant.
  - Banner blindness: people ignore anything that looks like an advert or sits near one. Real content styled to stand out can be skipped for this reason.
  - Change blindness: people miss significant changes when cues are weak or their attention is elsewhere.
- **Examples.**
  - A confirm dialog with two identical buttons invites the wrong choice. Emphasising the destructive action helps both those who want it and those who do not. A warning icon adds to it.
  - The floating action button for the primary action on a screen, made familiar through consistent rules.
  - A pricing table that emphasises one plan by colour, size and central position.
  - Notification badges.
  - News sites using scale to mark the lead story.
- **Limit: moderation and accessibility.**
  - Too much contrast is worse than none. Use emphasis on purpose and rarely.
  - Do not rely on colour alone. Consider colour vision deficiency and low vision, and keep enough contrast between foreground and background.
  - Motion can trigger dizziness, nausea or worse in people with vestibular disorders, epilepsy or migraine sensitivity.

## 9. Tesler's Law (pp. 87 to 94)

- **Law.** Every system has complexity that cannot be reduced, only moved. Larry Tesler, Xerox PARC, mid-1980s.
- **The question.** Who carries the complexity: the user, or the designers and developers?
- **Examples.**
  - Email needs a sender and a recipient. The client fills in the sender and suggests recipients. Later features suggest whole phrases and replies.
  - Checkout lets the shipping address inherit from billing. Payment services remove the typing altogether.
  - Checkout-free shops: the customer walks out, and a great deal of technology absorbs what the queue used to.
- **Limit: abstraction.** Simplify until there is too little information to make a decision, and the interface has become abstract. Icons without labels are again the example. An icon with no clear meaning and no consistent action is noise.
- **Author's position.** Designers have a duty to take on the complexity. What they do not take on gets shipped to the user.

## 10. Doherty Threshold (pp. 97 to 106)

- **Law.** Productivity rises sharply when the system responds in under 400 ms, so neither side waits on the other. Doherty and Thadani, IBM, 1982. The earlier accepted standard was 2 seconds.
- **Speed is a design feature**, not only an engineering concern.
- **Timing bands** (p. 98): 100 ms feels instant. From 100 to 300 ms the delay is perceptible and people feel less in control. Past 1 second attention wanders and task information starts to be lost.
- **Techniques for perceived speed.**
  - Skeleton screens: placeholders appear at once and are replaced as content arrives. They also stop content jumping.
  - Blur-up: a tiny blurred image holds the space until the full image loads.
  - Progress bars make waits more tolerable whatever their accuracy. They reassure, give something to watch, and move attention off the wait.
  - Past 10 seconds, add time remaining and a description of the current step.
  - Optimistic UI: show the action as done at once, and show an error only if it fails.
- **Limit: too fast.** A change can be missed, most of all one the person did not trigger. It can be hard to follow. It can cause mistrust when it does not match how much work the person expects. A deliberate delay can raise perceived value and trust, as in a security scan that takes time to explain what it is checking.

**Erratum:** the footnote for the Doherty paper on p. 99 gives a URL that belongs to a different source.

## 11. With Power Comes Responsibility (pp. 107 to 119)

The chapter that turns the book from technique to judgement. Full checklist in `method/ethics-checklist.md`.

- **Premise.** Using psychology to design is not wrong in itself. The same knowledge can work against the goals of the person using the product, so the people building it are accountable.
- **How behaviour is shaped.** Skinner's operant conditioning: a behaviour tied to a consequence is learned. Reward on an unpredictable schedule produced the most persistent behaviour, more than reward every time or too rarely. Slot machines are the modern form.
- **Seven mechanisms in digital products** (pp. 110 to 115): intermittent variable rewards, infinite loops, social affirmation, defaults, lack of friction, reciprocity, dark patterns.
- **Why it matters.** Harm does not need intent. Features built with good intentions produced compulsive use and worse. Unintended harm is still the builder's to answer for.
- **The conflict named.** Business goals such as time on site and daily active users are seldom the same as the person's goal of getting something done. Designers stand between the two.
- **Three practices** (pp. 118 to 119):
  - Think beyond the happy path. Design the non-ideal scenarios first.
  - Diversify teams and thinking, and do not limit personas to the core segment.
  - Look beyond data. Numbers show what people do, not why, or how the product affects them. Talk to them.

## 12. Applying Psychological Principles in Design (pp. 121 to 128)

The method chapter. Worked out in `method/principle-law-rule.md`.

- **Building awareness.** Keep the laws visible to the team, and share knowledge regularly. This helps but does not embed the laws in decisions.
- **Why principles.** As a team grows, either every decision queues behind a gatekeeper, or individuals decide alone and "good design" becomes a moving target. Shared principles let people decide consistently without the gatekeeper.
- **How to define them:** identify the team, align on what a principle must do, diverge, converge and vote, refine and apply, circulate and advocate.
- **What makes a good principle:** not a truism, settles real questions, opinionated, memorable.
- **The chain:** design principle (goal) → law (observation) → rules (guidelines for this product).
  - "Clarity over abundance of choice" → Hick's Law → at most 3 choices at a time; explanations of 80 characters or fewer.
  - "Familiarity over novelty" → Jakob's Law → use common patterns; no flashy or quirky animation that distracts.
- **Result.** A team has shared values, the psychological reason for each, and agreed rules that make them checkable.

## What this edition does not cover

The website lists 30 laws. These have no chapter here: Choice Overload, Flow, Goal-Gradient Effect (mentioned once, p. 57), the four Gestalt laws and Prägnanz, Occam's Razor, Paradox of the Active User, Pareto Principle, Parkinson's Law, Serial Position Effect, Working Memory (inside the cognitive load sidebar only), Zeigarnik Effect. For those, `reference/laws.md` relies on the website and other sources.
