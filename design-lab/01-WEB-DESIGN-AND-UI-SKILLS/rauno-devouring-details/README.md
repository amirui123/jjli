# Devour

> Good design is thorough down to the last detail.
> ... Dieter Rams, principle 8

A principles-driven, lineage-aware design engineering review skill for Claude Code. Reviews changed code (or a target component, page, or flow) against a stable spine of design principles drawn from across the lineage of design thought, then outputs specific, citable findings with fixes.

This is not a checklist. It is a way of looking.

---

## What this is

Most "polish" or "design review" tools tell you what looks off. Devour tells you *why*, in language that traces back to a real lineage of design thought. It is opinionated, principles-first, and built to be useful to a working designer-engineer who already knows their tools but wants a second pair of eyes calibrated to a higher bar.

The bar is set by people who treat software as a craft material:

- **Layer 0 ... Pre-HCI foundations.** Ollie Johnston and Frank Thomas (Disney animation), Josef Müller-Brockmann (grid systems), Jacques Bertin (visual variables), HfG Ulm (systematic design method).
- **Layer 1 ... Principles of design itself.** Dieter Rams, the Eameses, Naoto Fukasawa, Edward Tufte, Christopher Alexander.
- **Layer 2 ... Principles of human-computer interaction.** Bret Victor, Bill Verplank, Bill Buxton, Don Norman, Bruce Tognazzini.
- **Layer 3 ... Principles of native software craft.** Imran Chaudhri and Bas Ording at Apple, Loren Brichter, Andy Matuschak, Andy Allen at NotBoring, the Linear team, Jason Yuan.
- **Layer 4 ... Principles of modern web design engineering.** Rauno Freiberg (Vercel, Devouring Details), Emil Kowalski (Linear, Sonner, Vaul), the Browser Company, the Vercel design org, Brian Lovin, Sam Henri Gold.

Layers 0 through 3 are *informational* prerequisites ... they shape how you think. Layer 4 is *operational* ... it is what shows up in the diff. Most polish tools ignore Layers 0 through 3 and lift Layer 4's surface tactics. Those tools age fast.

Devour is structured as a principles spine drawn from Layers 0 through 3, with operational tactics from Layer 4. The principles are stable. The tactics evolve. The citations get added to `references/`.

See [`references/lineage.md`](references/lineage.md) for the full map.

---

## What this is not

- **Not a course.** Buy [Devouring Details](https://devouringdetails.com), take Emil Kowalski's [Animations on the Web](https://animations.dev), read Tufte. This skill is a study aid, not a substitute.
- **Not affiliated** with Vercel, Linear, the Browser Company, Decimals, Devouring Details, or any of the named designers. Devour cites their public work because it stands on it. Any errors in interpretation are mine.
- **Not a checklist.** Checklists catch known failure modes. Devour applies principles, which catch the new failure modes that haven't been named yet.
- **Not auto-pilot.** A principle without judgment is a religion. The skill names the principle and the tactic; the designer makes the call.

---

## How is this different from...

Devour is opinionated about what it does and doesn't do. Here's how it differs from other design tools you're likely to consider.

### Impeccable (Paul Bakaus)

[Impeccable](https://impeccable.style) is a generalist design toolkit: one skill with 23 commands. Twenty-one of those commands MAKE design (`craft`, `shape`, `animate`, `delight`, `polish`, `distill`, and so on). Two of them EVALUATE design: `critique` and `audit`.

Devour overlaps specifically with `/impeccable critique`, not with the makers. Where we differ from `critique`: citation discipline. `critique` scores UX heuristics (hierarchy, clarity, emotional resonance). Devour traces every finding to a named source in a five-layer lineage (Rams, Tufte, Norman, Victor, Buxton, Brichter, Matuschak, Rauno, Kowalski, Johnston & Thomas, Müller-Brockmann, HfG Ulm). When a stakeholder asks "why," devour hands you a citation; `critique` hands you a score.

Where we differ from `audit`: scope. `audit` does accessibility + performance + responsive design. Devour defers those... use `chrome-devtools-mcp:a11y-debugging`, `web-design-guidelines`, or `/impeccable audit` for that work.

The two tools compose. Run devour to identify principle violations with citations. Pick a matching `/impeccable <subcommand>` to apply the fix (see the principle-to-impeccable map below). Devour names the principle; impeccable executes the change.

If you install one, consider the other. They're designed for different jobs.

### Principle → impeccable command map

When you run devour and decide to apply a finding, this table tells you which `/impeccable <subcommand>` to reach for:

| Devour principle | Primary /impeccable command | Secondary |
|---|---|---|
| #1 Honest motion | /impeccable animate | /impeccable polish |
| #2 Physics over duration | /impeccable animate | - |
| #3 Commit on intent | /impeccable polish | - |
| #4 Reversibility | /impeccable harden | /impeccable clarify |
| #5 Sequence carries meaning | /impeccable animate | - |
| #6 Fingertip vs cursor | /impeccable adapt | /impeccable polish |
| #7 Preserve user state | /impeccable harden | - |
| #8 Affordances visible | /impeccable polish | /impeccable clarify |
| #9 Reduce decoration | /impeccable distill | /impeccable quieter |
| #10 Density is a choice | /impeccable layout | /impeccable distill |
| #11 Match metaphor to medium | /impeccable polish | - |
| #12 Type is a system | /impeccable typeset | - |

Devour emits findings with an optional `Downstream:` line naming the matching subcommand. Use it as the bridge between principled review and tactical application.

### rams (Anthropic)

`rams` is a visual and accessibility review based on Dieter Rams's 10 principles. It's fast, broad, and built into Claude Code. Devour overlaps on the Rams principles but extends through Tufte, Norman, Victor, Buxton, Brichter, Matuschak, the Linear team, Rauno, Kowalski, Johnston & Thomas, Müller-Brockmann, and HfG Ulm. Use `rams` for a quick pass. Use devour for a principled review with explicit source citations.

### web-design-guidelines (Rauno Freiberg et al.)

This skill reviews against WAI-ARIA and common accessibility guidelines. Devour is not an accessibility audit. For that, use `web-design-guidelines` or `chrome-devtools-mcp:a11y-debugging`. Devour flags obvious ergonomic failures under principle #6 (the fingertip and the cursor are not the same) but it is not comprehensive on a11y.

### When to use devour

- You want principles review with citations, not polish.
- A stakeholder is going to ask "why did we do this?" and "because it looks better" isn't enough.
- You're onboarding a team and want the reviews themselves to teach design engineering.
- You want to raise the craft bar on something specific and defend the reasoning.

### When NOT to use devour

- You want to *make* design... use `impeccable`.
- You want accessibility... use `a11y-debugging` or `web-design-guidelines`.
- You want a quick polish pass on AI-generated output... use `impeccable polish` or `impeccable critique`.
- You want visual iteration in the browser... use `impeccable live`.

---

## Install

This is a skill family for [Claude Code](https://claude.com/claude-code) and compatible Claude SDK environments. Symlink the skills into your skills directory.

```bash
git clone https://github.com/plainspace/devour-skills.git ~/.devour-skills
ln -s ~/.devour-skills/skills/devour ~/.claude/skills/devour
ln -s ~/.devour-skills/skills/devour-motion ~/.claude/skills/devour-motion
ln -s ~/.devour-skills/skills/devour-micro ~/.claude/skills/devour-micro
ln -s ~/.devour-skills/skills/devour-state ~/.claude/skills/devour-state
ln -s ~/.devour-skills/skills/devour-teach ~/.claude/skills/devour-teach
```

Or clone into your project's `.claude/skills/` directly.

### Global install vs. per-project

If you use devour on multiple repos, symlink the skills into `~/.claude/skills/` once and they will be available in every Claude Code session. You can then target any repo with `--repo <path>`:

```bash
for s in devour devour-motion devour-micro devour-state devour-teach; do
  ln -s /path/to/this/repo/skills/$s ~/.claude/skills/$s
done
```

If you only use devour in one repo, per-project install (symlink into that repo's `.claude/skills/`) is fine. In that case you run devour from inside the target repo (cwd = target) without the `--repo` flag.

---

## Usage

```
/devour                              Full-spine review of current changes
/devour <file or pattern>            Full-spine review of a specific target
/devour <prose description>          Routes to the right sub-skill by keyword
/devour --repo <path>                Review the target repo from anywhere
/devour --register <brand|product>   Override register for this run
/devour --terse                      Compact output, same rigor, less teaching prose
/devour-teach                        Write DEVOUR.md at repo root (run once per repo)
/devour-teach --force                Overwrite existing DEVOUR.md
/devour-teach --surfaces             Prompt for multi-surface overrides
/devour-motion                       Deep review of motion principles (#1, #2, #5)
/devour-micro                        Deep review of micro-interaction principles (#3, #6, #11)
/devour-state                        Deep review of state-handling principles (#4, #7)
```

The first time you run devour in a repo, you will be prompted to invoke `/devour-teach` to establish project context. Different products live in different parts of the spine; a marketing page values different principles than a productivity app.

Every review ends with an explicit `APPLY?` prompt: apply only breaks, breaks + drifts, everything, cherry-pick, or review-only. You stay in control of what lands.

Every run is saved as a markdown file in `.devour/runs/` at your project root, updated live as the run proceeds. This makes runs durable against session compaction and resumable across sessions. The directory is created automatically on the first run.

`.devour/` contains two subdirectories with different durability:

- **`.devour/briefs/`** ... ephemeral pre-analysis context files, regenerable. Add to `.gitignore` (or `~/.gitignore_global` once to cover all repos).
- **`.devour/runs/`** ... your review findings with citations. The durable artifact. Commit the ones worth keeping, or copy them to a design vault.

Recommended one-time global setup:
```
echo ".devour/briefs/" >> ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global
```

### Browser-driving MCP (recommended)

Devour runs in two modes: **code-only** (always works) and **code + browser** (better, especially for motion review). The browser mode requires any browser-driving MCP installed in your Claude Code session.

Devour is not tied to any specific browser MCP. It works with whichever you have:

- [`chrome-devtools-mcp`](https://github.com/ChromeDevTools/chrome-devtools-mcp) ... most common
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [BrowserMCP](https://browsermcp.io/)
- [Browserbase MCP](https://github.com/browserbase/mcp-server-browserbase)
- Puppeteer MCP

Install any one of these per the project's instructions, then restart Claude Code. Devour will detect it automatically and use it to verify motion timing, hover behavior, state transitions, and other findings that need to be observed at runtime, not just in code.

If no browser MCP is available, devour proceeds with code-only review and tells you what it couldn't verify. Code-only is still useful; it just produces fewer browser-confirmed findings on motion-heavy surfaces.

### Project context: `DEVOUR.md`

Devour reads `DEVOUR.md` at your repo root before every review. It's a single file that holds the register (brand or product), principle weighting, motion appetite, density target, and optional per-surface overrides. Run `/devour-teach` once per repo to generate it.

If you use impeccable in the same project, devour opportunistically reads `PRODUCT.md` and `DESIGN.md` to pre-fill audience, brand voice, and design-system tokens during teach. Devour never writes to those files... they belong to impeccable. `DEVOUR.md` is devour's source of truth and works standalone.

For multi-surface projects (e.g., a repo with both a marketing site and a product app), `DEVOUR.md` has an optional `## Per-surface overrides` section that declares per-path-prefix register and weighting. Matches by path prefix; first match wins. Use `--register <brand|product>` at runtime to force a specific register for a single run.

### Verbosity as a feature

Devour's output is verbose by design. Every finding has four parts: symptom (what's in the code), principle (why it matters, with the lineage source named), tactic (the specific fix), and reference (the exemplar to study). Strip any of those out and you have a checklist; keep all four and every review is a small lesson in design engineering.

If you already know the principles cold and just want the punch list, pass `--terse` to any review skill. Same rigor, same citations, no extended exemplar prose. The verbose path is still the default... read the prose; it's where the learning lives.

---

## The spine

Twelve principles. Stable. Each maps to a tactic, an anti-pattern, and a citation.

1. **Honest motion** ... if you animate it, it must communicate something the static state could not.
2. **Physics over duration** ... real movement has mass, springs, and damping. Eased durations betray themselves as animation.
3. **Commit on intent, not on contact** ... distinguish hover-passing-through from hover-with-intent.
4. **Reversibility is craft** ... every optimistic state needs a believable error path.
5. **Sequence carries meaning** ... stagger only when order matters.
6. **The fingertip and the cursor are not the same** ... touch targets, hit boxes, ergonomic distance.
7. **Preserve user state across boundaries** ... loading must not lose your scroll, your selection, your draft.
8. **Make affordances visible without making them loud** ... signifiers should be discoverable, not declarative.
9. **Reduce decoration, increase information** ... every element earns its pixels.
10. **Density is a craft choice, not a default** ... choose intentionally.
11. **Match the metaphor to the medium** ... do not paginate what should scroll, do not modal what should be inline.
12. **Type is a system, not a decision per element** ... scale, leading, weight, optical sizing follow rules.

Full treatment in [`references/principles/`](references/principles/).

---

## Lineage and attribution

Devour stands on a body of work that is not mine. The principles are stated in my own words for clarity and consistency, but the lineage is explicit:

- **Dieter Rams** ... 10 principles of good design. Four of devour's twelve principles trace primarily to him.
- **Edward Tufte** ... data-ink ratio, density, small multiples.
- **Don Norman** ... affordances and signifiers.
- **Bret Victor** ... feedback loops, dynamic representation.
- **Bill Buxton** ... interaction design as input-first.
- **Bruce Tognazzini** ... first principles of interaction design.
- **Loren Brichter** ... pixel-level craft, user state preservation.
- **Andy Matuschak** ... working memory, state continuity.
- **Andy Allen / NotBoring** ... considered native software craft.
- **The Linear team** ... density, performance, the Linear Method.
- **Rauno Freiberg** ... [Devouring Details](https://devouringdetails.com), [rauno.me](https://rauno.me). Inferring intent, ergonomic interactions, motion choreography, simulating physics.
- **Emil Kowalski** ... [emilkowal.ski](https://emilkowal.ski), [Animations on the Web](https://animations.dev), [Sonner](https://sonner.emilkowal.ski), [Vaul](https://vaul.emilkowal.ski). Honest animation, taste, training judgment.
- **Sam Henri Gold** ... typography craft, motion theory.
- **Jason Yuan** ... MercuryOS, ambient and spatial UI explorations.
- **The Vercel design org** ... Geist, the Vercel dashboard, the cmdk pattern.
- **The Browser Company** ... Arc, Dia.

Full citations in [`references/lineage.md`](references/lineage.md). Per-principle source maps in [`references/principles-map.md`](references/principles-map.md). Review discipline (how to use devour well) in [`references/methodology.md`](references/methodology.md).

If you build software for a living, buy these people's work. They are why the bar is high.

---

## Contributing

Devour is opinionated and curated, not crowdsourced. Pull requests that add new principles will likely be declined. Pull requests that improve citations, add exemplars, fix errors, or contribute annotated before/after examples are welcome.

To add an exemplar to `references/exemplars.md`:

1. Name the product and the specific move.
2. Cite the principle it demonstrates.
3. Link to a public artifact (live URL, screenshot, source code).
4. Keep it under 100 words.

---

### Upgrading from v0.3 or earlier

v0.4 uses `DEVOUR.md` at repo root instead of `.devour-context.md`. If you have an existing `.devour-context.md`, it's not automatically migrated. Run `/devour-teach` once to write the new `DEVOUR.md`. The old file can be deleted manually.

---

## License

Apache 2.0. See [`LICENSE`](LICENSE).

This means you can use, modify, and redistribute devour ... including for commercial purposes ... as long as you preserve the attribution in [`NOTICE.md`](NOTICE.md). The named designers in `references/lineage.md` are not parties to this license; their work belongs to them.

---

## Author

Built by [Jared Volpe](https://jaredvolpe.com). Devour grew out of a working practice of designing in code across multiple products, and a recurring need to articulate *why* a particular polish move was right or wrong in a way that transferred between projects.

Open issues at [github.com/plainspace/devour-skills](https://github.com/plainspace/devour-skills/issues).
