# UX copy: principles and audit

Use this in phase 4, after the laws, and again in phase 6 when the brief's copy rules and copy deck are written. The laws say how a screen should be organized. This file says what its words should do. Most screens that feel clunky have a copy problem alongside the layout one: vague buttons, errors that don't say what to fix, headings that bury the key word.

## Contents

- [How copy fits](#how-copy-fits)
- [The principles](#the-principles)
- [Rules by component](#rules-by-component)
- [How the laws and copy connect](#how-the-laws-and-copy-connect)
- [Running the copy audit](#running-the-copy-audit)
- [What the research does and doesn't show](#what-the-research-does-and-doesnt-show)
- [Sources](#sources)

## How copy fits

```
purpose → voice → tone → words → measure behaviour
```

- **Purpose:** what the user must do or understand at this exact spot. If you can't state it in one line, the string isn't ready to write.
- **Voice:** who the product sounds like. It stays constant across the product. Define it in three traits and one thing it never does.
- **Tone:** how the voice bends for the moment. Calm on a payment error, brief on a success, plain on a destructive confirmation.
- **Words:** clear, concise, useful (Google's Material test). These pull against each other: clearer text tends to run longer, and shorter text can lose clarity. Let the user's context decide the balance, and state the reasoning in the brief.

## The principles

Evidence ratings are explained in [the research section](#what-the-research-does-and-doesnt-show). *Strong* means replicated or a large benchmark. *Moderate* means one reasonable study or a respected expert synthesis. *Convention* means widely taught and sensible but not measured.

| # | Principle | Rule of thumb | Evidence |
|---|---|---|---|
| 1 | **People scan, they don't read** | Front-load the distinguishing word in headings, labels, links and list items. Cut lead-ins ("Manage your…", "List of…"). Put the answer first. | Strong |
| 2 | **Concise, scannable, objective** | Every word has a job. Short paragraphs, headings, lists. State facts; skip hype. | Moderate (1997, one site) |
| 3 | **Plain language, even for experts** | Write for the least expert reader. Replace jargon and Latin with the plain word. | Moderate |
| 4 | **Name the action** | Buttons are verb + object: "Save changes", "Send message", "Delete 3 entries". Never "Submit", "OK", "Yes" or "No" when a specific verb exists. | Convention |
| 5 | **Errors: what's wrong, how to fix it** | Name the exact problem and the exact fix, next to the field. Never blame. "Phone number needs 10 digits", not "Invalid input". | Strong |
| 6 | **Keep labels visible** | A visible label above the field. A placeholder shows an example format; it is never the only label. | Strong |
| 7 | **Links make sense out of context** | "Download the 2026 fee schedule", not "Click here" or "Read more". | Convention (WCAG 2.4.4) |
| 8 | **One word per thing** | Pick the users' own term and keep it everywhere: the same name in the nav, the page title, the button and the error. | Convention |
| 9 | **Voice constant, tone flexes** | Don't joke on error or payment screens. Don't be stiff on a welcome screen. | Convention |
| 10 | **Don't claim what the product can't do** | Copy that promises a capability the build lacks is a bug. Tag new capabilities (NEW / NEW·API) and write copy only for what exists. | Convention |

First-person button wording ("Start my free trial") is a test candidate, not a principle; see the research section.

## Rules by component

For each, write the audit directive as a **before → after** pair with the real string from the screen.

| Component | Check | Weak → strong |
|---|---|---|
| **Buttons** | Verb + object; matches the page heading and the result; the destructive one says what it destroys and the safe one says what it keeps. | Submit → Send message |
| **Destructive confirmations** | Name the object and count. Label the two buttons with the actions, not Yes/No or OK/Cancel. Pair with undo (peak-end, Hick). | "Are you sure? OK / Cancel" → "Delete 3 entries? Delete / Keep" |
| **Form labels and helper text** | Visible label; the format shown as an example; the reason given when asking for sensitive data. | "Name" → "Name as it appears on the card" |
| **Errors** | Next to the field. Specific problem, specific fix. No blame, no "oops", no "please" and "sorry" as padding (Google's tech-writing guidance). One error at a time where possible; clear it once fixed. | "Please enter a valid location" → "Enter a city and state, such as Houston, TX" |
| **Empty states** | Say why it's empty and what to do. | "No data" → "No sessions yet. Start one to see trends here." |
| **Loading and saving** | Say what is happening; confirm when done. | "Please wait…" → "Saving…" then "Saved" |
| **Success** | Brief, and styled as success (not as a warning). Say what changed. | "Success!" → "Schedule published for Oct 12–18" |
| **Headings, nav and menu items** | The key noun first. No filler verb. | "Manage your notification preferences" → "Notification preferences" |
| **Body text** | Short sentences, one idea each, the answer in the first line, lists for parallel items. | |
| **System errors** | Say what failed, whether the user's work is safe, and what to do. Never expose raw codes or stack text as the message. | "Error 500" → "We couldn't save your changes. Your draft is still here. Try again." |

## How the laws and copy connect

| Law | What it means for the words |
|---|---|
| Hick | Fewer words per option makes the options easier to compare; label each choice with its distinguishing word first. |
| Serial position | The first words of a line carry the most; end a flow on a clear finished message. |
| Tesler | The system carries the complexity: write the verdict and the reason in one plain sentence instead of showing the user the rules. |
| Postel | Accept messy input, then echo it back normalized ("3–5 PM") and say what you understood. |
| Peak-end | Errors are the worst moments. Their copy is the highest-value copy on the screen. The ending message is the second. |
| Jakob | Use the vocabulary of the products your users already know ("Sign in", "Search"), unless a domain term is the rule. |
| Similarity | One term per concept, one button phrasing per action. |
| Occam | Delete any string that repeats what the layout already says. |
| Miller | Don't make people remember a code or term from one screen to the next; repeat it where it's needed. |
| Von Restorff | A message that shouts on every screen stops being read; keep emphatic copy for the one thing that matters. |

## Running the copy audit

1. **Copy inventory (phase 2).** Collect every visible string by screen and state: default, empty, loading, error, success, destructive confirmation, read-only. A table is enough: *string → element → state*. The brief's copy deck starts here.
2. **Measure (phase 3).** `scripts/measure-ui.js` has a `copy` section: generic button and link labels, long button labels, vague error text visible now, sentence length, exclamation marks. Placeholder-only fields are in `forms`. These are proxies; they can't judge meaning. Error states usually aren't on screen at rest, so list them from the code and trigger them where it is safe to (never on a live form that sends data).
3. **Audit (phase 4).** Walk the inventory against the principles table. Write 5–8 before → after pairs for the worst strings, each tagged with its principle and state. Skip the rest in one line.
4. **Voice (phase 6).** Write the voice as three traits and one thing it never does, plus the tone by state, into the brief.
5. **Targets (phase 6).** Put the copy targets in §12 so the build can be re-measured.
6. **Verify (phase 7).** Walk the copy deck against the build string by string and re-run the `copy` measurement.

## What the research does and doesn't show

Most UX-copy "statistics" are old, small or repeated from one source. Use the direction, state the source, and test with your own users.

| Finding | Source | Strength |
|---|---|---|
| Concise text scored 58% higher on measured usability, scannable 47%, objective 27%, all three combined 124%. | Nielsen and Morkes (1997): one site, five versions. | Directional only. Single small study. |
| A rewrite cut to 54% of its length was preferred and judged more complete. | Nielsen's Sun Microsystems follow-up. | Directional. |
| Users read the first line across, then a shorter line, then scan down the left edge. NN/g now calls this a failure mode that good design should prevent. | NN/g (2006, revisited). | Strong. |
| 80% of people preferred sentences in clear English, and the preference rises with education and expertise. 97% preferred "among other things" to "inter alia". | Trudeau (2012), via GDS and GOV.UK. | Moderate. Small study of legal language. |
| 98% of e-commerce sites use generic error messages. A user who typed "Houston" got "Please enter a valid location" and couldn't see why. | Baymard benchmark. | Strong. |
| Inline labels vanish when typing starts; some users deleted their entry just to see the label again. | Baymard mobile usability tests. | Strong (qualitative). |
| Validate after the user leaves the field, not mid-typing; remove the error once it's fixed. | Baymard. | Moderate to strong. |
| Good error messages are visible, human-readable, precise, constructive and don't blame (12 guidelines in three groups: visibility, communication, efficiency). | NN/g. | Strong (expert synthesis). |
| "Start **my** free trial" got 90% more clicks than "your" in one test; a replication got 24%; another test reversed the result. | Unbounce and ContentVerve, Copyblogger. Marketing blogs. | Weak. Context-dependent. Test it. |
| Clear, concise, useful; the three can trade off. | Google Material. | Convention. |

**Don't cite these without checking the source:**

- "Users read only 20% of a page." Versions range from 20–28%, and the figure could not be traced to NN/g's own pages.
- "Users scan only the first two words." A practitioner heuristic, not a measured NN/g result.
- "First-person CTAs lift conversions by 90%." One test, since repeated everywhere.

**Limits of copy itself.** Better words can't fix a broken flow, hidden actions or the wrong rules. Measure behaviour (completion, errors, time), not only whether the text reads well. Copy that "sounds on-brand" can still be slower to read.

## Sources

- Nielsen and Morkes, [Concise, scannable, and objective: how to write for the web](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/) (1997)
- NN/g, [F-shaped pattern of reading on the web](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- NN/g, [Error message guidelines](https://www.nngroup.com/videos/error-message-communication-guidelines/) and [scoring rubric](https://www.nngroup.com/articles/error-messages-scoring-rubric/)
- Google, [Material's communication principles: intro to UX writing](https://codelabs.developers.google.com/codelabs/material-communication-guidance)
- Google, [Error messages: set the right tone](https://developers.google.com/tech-writing/error-messages/set-tone)
- GOV.UK, [Writing for GOV.UK](https://www.gov.uk/guidance/content-design/writing-for-gov-uk) and the GDS blog post [Clarity is king](https://gds.blog.gov.uk/2014/02/17/guest-post-clarity-is-king-the-evidence-that-reveals-the-desperate-need-to-re-think-the-way-we-write/)
- Baymard, [Mobile forms: avoid inline labels](https://baymard.com/blog/mobile-forms-avoid-inline-labels), [Inline form validation](https://baymard.com/blog/inline-form-validation) and [Adaptive validation error messages](https://baymard.com/blog/adaptive-validation-error-messages)
- ClickZ, [Me vs. you: how pronouns affect click conversion rates](https://clickz.com/me-vs-you-how-pronouns-affect-click-conversion-rates/32596/)
- Podmajersky, *Strategic Writing for UX*, 2nd ed. (O'Reilly, 2025)
