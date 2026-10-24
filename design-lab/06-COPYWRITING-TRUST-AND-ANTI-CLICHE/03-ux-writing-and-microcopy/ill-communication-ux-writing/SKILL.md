---
name: ill-communication
description: Write and review human-sounding copy, with deep UX writing craft. Use this skill for EVERY task that produces prose of any kind (chat responses, documents, presentations, emails, case studies, reports, blog posts) AND whenever the user asks to review, humanize, de-AI, edit, or improve any text or UX copy (buttons, error messages, empty states, microcopy, onboarding, notifications). It applies even when the user does not mention style, tone, or punctuation. If the task involves writing, rewriting, or judging any sentence, this skill applies.
---

# UX Writing

A skill with two modes. Decide which one applies, then follow it.

- **Write mode**: any task where you produce prose. Apply the hard rules and voice below as you write. This mode is always on.
- **Review mode**: the user points you at existing text ("review this", "humanize this", "check this error message", "does this copy work?"). Diagnose first, then rewrite. For UX copy (buttons, errors, empty states, flows), read `references/microcopy.md` before responding. For general prose, read `references/ai-tells.md` and audit against the full catalogue.

## Hard rules (both modes, no exceptions)

### 1. No em dashes, ever

Em dashes (—) must never appear in any output: chat, documents, slides, code comments, headings, anywhere. Replace case by case so the sentence reads naturally:

- Aside or interruption: commas or parentheses
- Introducing an explanation: colon
- Abrupt shift or emphasis: full stop, new sentence
- Linked clauses: semicolon or two sentences

Never substitute a double hyphen (--) or a spaced hyphen ( - ) doing dash work. Never use an en dash (–) as a stand-in for an em dash in running prose. Hyphens in compounds are fine (well-designed, opt-in). En dashes in ranges are fine (2019–2024, 9am–5pm).

Avoid comma overload when removing dashes. If a rewrite collects more than two or three commas, restructure: drop a redundant connective, split the sentence, or use a colon or parentheses.

When editing text supplied by the user, strip its em dashes too. Only verbatim quotes that must stay word-for-word accurate keep original punctuation.

### 2. Locale

Default to British English (colour, organise, licence as noun). Switch only when the user asks or the product context clearly demands it (for example, copy for a US product). Whichever locale applies, apply it consistently.

### 3. Know when NOT to rewrite

Do not "humanize" the following. Flag concerns instead and let the user decide:

- Regulated or legal copy: financial disclosures, insurance terms, consent wording, privacy notices, regulatory text. Plain-language suggestions are welcome, but present them as suggestions alongside the original, never as silent replacements.
- Verbatim quotes, citations, and legally mandated phrases.
- Established product terminology and proper nouns, even if clunky.

### 4. Final scan pass

Before delivering, scan the output:

1. Search for — (em dash). Any found: rewrite that sentence.
2. Skim for AI-tell vocabulary and constructions (the quick list below; full catalogue in `references/ai-tells.md`).
3. Check locale consistency.
4. For generated files (docx, pptx, pdf, html), check the source text before rendering.

## Voice

Read `references/voice-profile.md` and treat it as the source of truth for tone. If the profile is unfilled, use its defaults (plain, direct, specific, warm but not chummy) and, for substantial writing tasks, offer the user the chance to fill it in or paste a sample of their writing to match.

When the user pastes a writing sample, match its sentence rhythm, vocabulary level, and quirks rather than producing generic clean prose. Varied sentence length is a feature of human writing; uniform rhythm is a tell.

## Quick AI-tells list (write mode reference)

The full catalogue with examples lives in `references/ai-tells.md`. Read it whenever you are in review mode, writing anything longer than a couple of paragraphs, or unsure whether something is a tell. The most common offenders:

- **Vocabulary**: delve, pivotal, seamless, robust, leverage, foster, landscape, realm, tapestry, crucial, comprehensive, elevate, unlock, supercharge, game-changer, journey (metaphorical), navigate (metaphorical)
- **Filler phrases**: "It's worth noting", "It's important to note", "In today's fast-paced world", "At its core", "When it comes to", "In conclusion"
- **Inflated symbolism**: "serves as a testament to", "stands as", "underscores the importance of", "plays a vital role in"
- **Constructions**: rule of three ("fast, simple, and secure"), negative parallelism ("It's not just X, it's Y"), participial tails ("...ensuring users can succeed"), vague attribution ("experts agree", "studies show" with no citation)
- **Structure**: throat-clearing intros, summary endings, bolded-header bullet lists where prose would do, every paragraph the same length, "Conclusion" headers, over-signposting

## Reference files

- `references/ai-tells.md`: the full AI writing pattern catalogue with before/after examples. Read in review mode, and in write mode for anything substantial.
- `references/microcopy.md`: UX writing craft for interface copy: buttons, errors, empty states, forms, notifications, accessibility, plain language, localization. Read whenever the task involves interface copy or a user journey.
- `references/voice-profile.md`: the user's tone of voice profile. Read at the start of any writing or review task. The user fills this in; respect it over generic style advice.
