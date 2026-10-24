---
name: uxmyths
description: Detects when a UX/product decision, critique, or piece of design advice rests on a common but false UX belief (e.g. "more choices = happier users", "icons alone are clear enough", "the homepage matters most", "users read the page"), and offers the evidence-based reality instead. Use this skill whenever an interface, user flow, redesign, feature scope, or design rationale is being discussed, justified, or written, whether in a product conversation, a mockup review, a spec, or while Claude Code writes or reviews front-end/UI code. Trigger even if the user doesn't say "myth" or "uxmyths" explicitly, stating a UX assumption as fact is enough.
---

# UX Myths

This skill gives Claude a checklist of 34 widespread but debunked UX beliefs, so it can catch when a design decision or piece of advice is quietly built on one of them, and offer the better-supported alternative instead.

## When to use it

- A design rationale leans on an unexamined UX "rule of thumb" ("keep menus under 7 items", "3-click rule", "users don't scroll", "icons are self-explanatory")
- Scoping or prioritizing features ("let's add more options, users will love it")
- Debating a redesign, a homepage revamp, or copying a competitor's pattern
- Deciding whether/how to test a design, or whether asking users what they want is enough
- Writing or reviewing front-end/UI code where a stated assumption drives a choice (icon-only buttons, hamburger menus, filler/lorem-ipsum content, cramming everything above the fold)
- Any UX audit or critique conversation, alongside `ux-laws` if that skill is also available

## How to apply it

**The goal is to correct gently and usefully, not to lecture with a numbered list.** Most conversations only touch one or two myths, surface those, not the whole catalogue.

- Name the myth only when it's actually driving the decision at hand, quote the specific belief being relied on, then give the debunking and the practical alternative in one or two sentences.
- Prefer evidence over assertion: mention the kind of finding that debunks it (usability testing results, eye-tracking data, analytics) without needing exact citations.
- If a stated "rule" turns out to be directionally reasonable in this specific context (e.g. genuinely fewer options really do serve this particular flow), say so, myths are about false universals, not about every instance of the underlying idea being wrong.
- For a full audit (user explicitly asks to review a design or spec against common misconceptions), walk the quick reference below and flag every myth that's plausibly in play.
- Stay concrete: tie the myth to the actual feature, page, or decision being discussed, not an abstract lecture on UX research.

## Quick reference

The 34 myths, one line each. For the full reasoning and evidence behind each one, see `references/myths.md`.

| # | Myth | Reality in one line |
|---|---|---|
| 1 | People read on the web | They scan for keywords and headings, and read word-for-word only once they've found what matters to them |
| 2 | All pages should be reachable in 3 clicks | Click count doesn't predict satisfaction, clear labeling does |
| 3 | People don't scroll | Scrolling is natural; most engagement happens below the fold |
| 4 | Design is about making it look good | Design is about how it works, not just how it looks |
| 5 | Accessibility is expensive and difficult | Designed in from the start, it costs about the same as inaccessible design |
| 6 | Accessible sites are ugly | Accessibility is about structure, not visual style, the two are independent |
| 7 | Graphics make an element more visible | Flashy graphics often trigger banner blindness and get ignored |
| 8 | Stock photos improve the experience | Purely decorative images are largely ignored or hurt credibility |
| 9 | Design has to be original | Familiar patterns need no learning curve, novelty adds friction |
| 10 | If the design is good, small details don't matter | Small wording/detail changes repeatedly move real conversion and satisfaction numbers |
| 11 | You need to redesign periodically | Users resent disruptive redesigns; incremental refinement wins long-term |
| 12 | More choices/features = more satisfaction | Simplicity drives post-use satisfaction more than feature count |
| 13 | Icons enhance usability | Most icons aren't self-explanatory, pair them with text labels |
| 14 | You are like your users | Building the product makes you atypical, validate with real users |
| 15 | Users make optimal choices | Users "satisfice": they take the first good-enough option, not the best one |
| 16 | Search solves navigation problems | Recognition beats recall, users click familiar links before they search |
| 17 | The homepage is your most important page | Its share of pageviews has fallen sharply as deep-linking grew |
| 18 | Flash was evil *(historical)* | Mature implementations could be accessible and SEO-friendly; mobile killed it, not usability alone |
| 19 | You don't need content to design a website | Designs built on filler text make unrealistic assumptions and often break with real content |
| 20 | If it works for Amazon, it will work for you | A pattern's success depends on context (traffic, trust, scale) that rarely transfers |
| 21 | People can tell you what they want | Stated preference often diverges sharply from actual behavior |
| 22 | Usability testing is expensive | Small, informal tests with ~5 users reliably surface most major issues |
| 23 | Choices should be limited to 7±2 | That's a short-term-memory limit, not a rule for on-screen, already-visible options |
| 24 | People use your product exactly as intended | Users routinely repurpose products, that's often a signal of real unmet needs |
| 25 | Aesthetics don't matter if usability is good | Visual appeal shapes perceived credibility and even perceived usability |
| 26 | Usability testing = focus groups | Focus groups capture opinions; usability tests observe actual behavior, different methods, different purposes |
| 27 | UX design is about usability | Usability is table stakes; UX also covers delight, emotion, and meaning |
| 28 | White space is wasted space | White space actively improves readability, hierarchy, and perceived quality |
| 29 | People are rational | Decisions are driven by predictable emotional shortcuts (anchoring, framing, loss aversion), not cold calculation |
| 30 | Experts don't need to test their designs | Expert review and user testing surface different problems, they complement, not replace, each other |
| 31 | UX design is one step in the project | User-centered design spans strategy through post-launch iteration, not just the wireframing step |
| 32 | Success happens overnight | Apparent overnight hits typically took years of iteration and false starts |
| 33 | Mobile users are distracted | Most mobile use happens at home/work, in the same context as desktop use |
| 34 | Simple means minimal | Visual minimalism can hide complexity; simplicity is about reduced effort, not reduced elements |

## Reference files

- `references/myths.md`, all 34 myths in full: the belief, why it's wrong, and the practical takeaway, with the kind of evidence behind each.

Open it before a detailed answer or a full audit; the quick reference above is enough for a one-off remark.

## Credits & sources

This skill is an original synthesis of the misconceptions catalogued by **Zoltán Gócza and Zoltán Kollin** on **[UX Myths](https://uxmyths.com)**. The myth list, numbering, and framing follow their site; the wording of each summary in `references/myths.md` and in this file was written independently for this skill, not copied from the source. Credit for identifying and popularizing these misconceptions belongs to the original authors and the researchers they cite (Jakob Nielsen, Steve Krug, Jared Spool, Don Norman, and others).
