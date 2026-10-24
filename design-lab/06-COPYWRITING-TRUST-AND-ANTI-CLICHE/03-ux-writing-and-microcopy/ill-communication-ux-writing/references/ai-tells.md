# AI Writing Tells: Full Catalogue

Patterns that mark text as AI-generated, with fixes. Based on observed tells from Wikipedia's "Signs of AI writing" work and common humanizer pattern sets, adapted for this skill. In review mode, audit the text against every section. Rewrite, don't delete: the fix must cover everything the original said.

## Contents

1. Punctuation and formatting
2. Vocabulary
3. Filler and throat-clearing
4. Inflated and promotional language
5. Constructions
6. Attribution and evidence
7. Structure and rhythm
8. Tone failures

---

## 1. Punctuation and formatting

**Em dashes.** Hard ban. See SKILL.md. Includes en dashes doing em dash work, double hyphens, and spaced hyphens used as dashes.

**Title Case Headings.** Use sentence case for headings unless the user's style guide says otherwise. "Why drop-off happens at checkout", not "Why Drop-Off Happens At Checkout".

**Colon-subtitle headlines.** "X: Why Y Matters" and "X: A Comprehensive Guide" are tells. Write a heading that says the thing. "Checkout drop-off starts at the insurance step."

**Bold-led bullet lists.** Lists where every bullet opens with a bolded phrase and a colon. Occasionally fine; as a default structure, a tell. Prefer prose, or bullets that read as natural sentences.

**Emoji as decoration.** Emoji in headings, or one per bullet. Remove unless the user's voice profile asks for them.

**Quotation mark inflation.** Scare quotes around ordinary terms. Drop them.

## 2. Vocabulary

Replace these on sight unless quoting. The fix is almost always a plainer word.

| Tell | Use instead |
|---|---|
| delve into | look at, dig into, cover |
| pivotal, crucial | important, key (or cut; if everything is crucial, nothing is) |
| seamless | smooth, easy, or describe what actually happens |
| robust | reliable, solid, thorough |
| leverage (verb) | use |
| foster | build, encourage |
| landscape (metaphorical) | market, field, or name the thing |
| realm, tapestry | cut; rewrite the sentence |
| comprehensive | full, complete, or cut |
| utilize | use |
| elevate, enhance | improve, or say specifically what got better |
| unlock, supercharge, turbocharge | cut; state the benefit plainly |
| game-changer, cutting-edge | cut; show the evidence instead |
| journey (metaphorical, non-UX) | process, experience (note: "user journey" is legitimate UX terminology and stays) |
| navigate (metaphorical) | handle, deal with, work through |
| myriad, plethora | many, lots of |
| meticulous(ly) | careful(ly), or show the care through detail |
| boast(s) | has, offers |
| furthermore, moreover | also, and, or restructure |
| additionally (sentence-initial) | also, or just start the sentence |

## 3. Filler and throat-clearing

Cut these entirely; the sentence is stronger without them.

- "It's worth noting that" / "It's important to note that"
- "In today's fast-paced world" / "In an ever-changing landscape"
- "At its core" / "At the end of the day" / "Ultimately"
- "When it comes to X"
- "In the world of X"
- "Needless to say"
- "In conclusion" / "To summarize" / "In summary"
- "Let's dive in" / "Let's explore"
- "Whether you're a beginner or an expert"
- Over-signposting: "In this section, we will..." / "As mentioned above"

## 4. Inflated and promotional language

AI text sells when it should describe. Symptoms and fixes:

**Inflated symbolism.** "Serves as a testament to", "stands as a beacon of", "is a reflection of the company's commitment to". Fix: state the fact. "The update fixes the three most-reported bugs."

**Importance inflation.** "Plays a vital role in", "underscores the importance of", "highlights the significance of". Fix: say what it does, not how important it is.

**Editorializing adjectives.** "Stunning", "remarkable", "impressive", "rich cultural heritage". Fix: cut, or replace with the detail that earned the adjective.

**Benefit stacking.** "Intuitive, powerful, and flexible." Fix: pick the one that matters here, and prove it.

## 5. Constructions

**Rule of three.** AI defaults to triads: "fast, simple, and secure", "research, prototyping, and testing". One or two triads in a long piece is fine; a triad per paragraph is a fingerprint. Vary: use two items, four items, or restructure.

**Negative parallelism.** "It's not just a feature, it's a philosophy." / "This isn't about X. It's about Y." Fix: make the positive claim directly.

**False ranges.** "From startups to enterprises, everyone benefits." Fix: name the actual audience.

**Participial tails.** Sentences ending in ", ensuring..." / ", allowing..." / ", making it...". One occasionally is fine; as a habit it's a tell. Fix: split into a second sentence with a real subject.

**Superficial -ing analysis.** "By doing X, the team demonstrated Y, showcasing Z." Fix: separate claims into sentences and support each one.

**Hedging stacks.** "It could potentially be argued that this may..." Fix: commit, or state the actual uncertainty once.

**Antithesis overuse.** "Less X, more Y." Fine once; a tell when repeated.

## 6. Attribution and evidence

**Vague attribution.** "Experts agree", "studies show", "research suggests", "many believe", with no source. Fix: cite the source, or own the claim ("In my experience..."), or cut it.

**Invented precision.** Suspiciously round statistics presented without source ("boosts engagement by 40%"). Fix: only use numbers you can trace.

**Weasel consensus.** "It is widely regarded as..." Fix: who regards it? Say so or cut.

## 7. Structure and rhythm

**Uniform sentence length.** Human writing varies. Mix short sentences with long ones. Read it aloud in your head; if every sentence has the same cadence, break the pattern.

**Uniform paragraph length.** Same fix. A one-sentence paragraph is allowed. So is a long one.

**Summary endings.** Paragraphs or pieces that end by restating what they just said. Cut the restatement; end on the strongest point.

**Throat-clearing openings.** Introductions that describe what the piece will do instead of doing it. Start in the substance.

**Exhaustive symmetry.** Covering every option with equal weight ("On one hand... on the other hand..."). Humans have opinions about emphasis. Weight the writing toward what matters.

**Heading proliferation.** A heading every two paragraphs. Merge sections; let prose carry transitions.

## 8. Tone failures

**Sycophancy.** "Great question!" / "What a fascinating topic!" Cut.

**False enthusiasm.** Exclamation marks doing the work that specifics should do.

**Narrator-from-a-distance.** Writing about the subject's significance instead of the subject. "This project represented an opportunity to rethink onboarding" vs "We rethought onboarding."

**Chumminess without warrant.** "Let's be honest", "we've all been there". Only if the voice profile supports it.

**Apology and permission-seeking.** "I hope this helps!" / "Feel free to adjust." Cut from documents entirely.

---

## Review mode output format

When asked to review or humanize text:

1. Give a short diagnosis: the two to four biggest patterns present, with one example of each pulled from the text.
2. Provide the rewrite, covering everything the original covered (same scope, same claims, same approximate length unless asked to cut).
3. Run the final scan pass from SKILL.md before delivering.
4. If the text contains regulated, legal, or quoted material, leave it intact and flag it per SKILL.md rule 3.
