# ill-communication

**UX writing, not fighting.** A Claude skill that writes and reviews human-sounding copy, with proper UX writing craft built in.

Most "humanizer" skills are lists of banned words. This one goes further: it strips the AI tells, but it also knows how to write a button label, an error message, and an empty state. It understands when copy is regulated and shouldn't be touched, when a decline option has been guilt-framed into a dark pattern, and why "Learn more" fails screen reader users. And it writes in your voice, not a generic clean one, because you define the voice in a template it reads every time.

Built by a UX designer, for people who ship interface copy.

## Two modes

**Write mode** is always on. Anything Claude writes for you (documents, case studies, emails, posts, interface copy) follows the rules: no em dashes, no AI vocabulary, no inflated symbolism, your locale, your voice.

**Review mode** is point and run. Paste copy or a whole flow and ask:

- "Review this error message"
- "Humanize this blog post"
- "Check this onboarding flow"
- "Does this opt-in screen work?"

Claude diagnoses first (the biggest patterns, with examples pulled from your text), then rewrites, covering everything the original covered.

## What's inside

```
ill-communication/
├── SKILL.md                     The skill: modes, hard rules, scan pass
└── references/
    ├── ai-tells.md              Full AI writing pattern catalogue with fixes
    ├── microcopy.md             UX craft: buttons, errors, empty states,
    │                            forms, accessibility, localization,
    │                            regulated copy
    └── voice-profile.md         Fill-in tone of voice template
```

## The hard rules

1. **No em dashes, ever.** Not in prose, not in headings, not in documents. No en dashes or double hyphens smuggled in as substitutes either. Each one is rewritten case by case (comma, colon, parentheses, or a new sentence) without piling up commas. En dashes in ranges (2019–2024) survive; hyphens in compounds (opt-in) survive.
2. **Your locale, consistently.** Defaults to British English; change one line in the voice profile to switch.
3. **Some copy doesn't get rewritten.** Financial disclosures, consent wording, legal text, and verbatim quotes get flagged with suggestions, never silently replaced.
4. **A final scan pass** before anything is delivered: em dash search, AI-tell skim, locale check.

## What it catches

The full catalogue is in [references/ai-tells.md](references/ai-tells.md). Highlights:

- **Vocabulary**: delve, pivotal, seamless, robust, leverage, foster, landscape, comprehensive, unlock, game-changer, and friends
- **Filler**: "It's worth noting", "In today's fast-paced world", "At its core", "In conclusion"
- **Inflation**: "serves as a testament to", "plays a vital role in", "underscores the importance of"
- **Constructions**: rule of three, negative parallelism ("It's not just X, it's Y"), participial tails ("...ensuring users succeed"), vague attribution ("studies show")
- **Structure**: uniform sentence rhythm, throat-clearing intros, summary endings, bold-led bullet lists, Title Case Headings, "X: Why Y Matters" headlines
- **Tone**: sycophancy, false enthusiasm, narrator-from-a-distance, unearned chumminess

## What makes it a UX writing skill

[references/microcopy.md](references/microcopy.md) covers the craft the de-slop skills skip:

- Verb-first, honest button pairs ("Cancel" / "Delete project", never "Cancel" / "OK")
- Errors that answer what happened, why, and what to do next, without blaming the user
- Empty states as onboarding moments, with first-use, cleared, and no-results variants
- Confirmations that state consequences, and undo instead of dialog fatigue
- Accessibility: descriptive link text, plain language reading levels, no sensory-only references
- Localization-readiness: no idioms, room for 20 to 40 percent text expansion, unambiguous dates
- Inclusive language defaults
- Dark pattern refusal: confirmshaming, pre-ticked consent, and weighted opt-in choices get flagged, not written
- A severity-ordered review checklist for auditing whole journeys

## The voice profile

[references/voice-profile.md](references/voice-profile.md) is a template you fill in once: audience, formality, three or four personality traits with boundaries ("confident but not cocky"), banned words, and example sentences in your voice. Claude reads it at the start of every task and matches it. Left blank, it falls back to sensible defaults (plain, direct, specific) and offers to match a pasted writing sample instead.

This is deliberate. Everyone agrees on what bad AI writing looks like; nobody agrees on what good writing looks like. The bad is baked in, the good is yours.

## Installation

### Claude Code

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/alexconner-79/ill-communication.git ~/.claude/skills/ill-communication
```

### Claude.ai / Claude Desktop

Download the packaged `ill-communication.skill` file from [Releases](https://github.com/alexconner-79/ill-communication/releases) and upload it in Settings, under Capabilities.

### Customise

Edit `references/voice-profile.md` with your own voice before or after installing. On claude.ai, edit it before packaging, or just tell Claude your preferences in conversation.

## The name

Ill Communication is the Beastie Boys album. This skill fixes ill communication. That's it, that's the joke.

## Lineage and credits

The AI-tells layer stands on the shoulders of:

- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintained by WikiProject AI Cleanup
- [blader/humanizer](https://github.com/blader/humanizer), which named the category
- stop-slop and conorbronsdon/avoid-ai-writing, whose hard line on em dashes this skill shares

The UX writing layer draws on standard industry practice: plain language guidance, WCAG, and fifteen-plus years of shipping interface copy.

## Licence

MIT. See [LICENSE](LICENSE).
