<!-- markdownlint-disable MD024 -->
<!-- Duplicate ### subheadings (What it is / Why it fails / Fix direction / Related / Origin) are intentional: every entry follows the same structure so readers can scan and compare. -->

# Methodology

Notes on how to use devour well. Not about what to review. About how to review.

The spine (the 12 principles) is stable. The tactics (from Layer 4) evolve. The exemplars accumulate. This file catches a third thing: **disciplines of the reviewer**. Habits that make findings credible, fixes that actually fix, and the failure modes of review itself.

New entries go here when real use exposes a review-discipline failure mode, not a design-principle one. The distinction: anti-patterns live in `anti-patterns.md` when they describe failures in the reviewed work. They live here when they describe failures in the *act of reviewing*.

---

## Speculative fixing without observation

### What it is

A reviewer applies a finding's suggested fix, the fix doesn't resolve the symptom, and the reviewer applies a second speculative fix ... then a third ... without once observing the actual runtime state (DOM, console, network, process, data). Three fixes in, the bug is still there and the reviewer is now three steps further from understanding the real cause than when they started.

The shape is recognizable: `try A → didn't work → try B → didn't work → try C → didn't work → *now* inspect`. By the fourth attempt, the reviewer has accumulated unused code changes, a cluttered git history, and a weaker understanding of the system than they started with.

### Why it fails

**The fix is a claim.** When a finding says "add `requestAnimationFrame` to defer navigation," that claim rests on an underlying model of what the system is doing. If the symptom persists after the fix, one of two things is true: the model was wrong, or the fix didn't land where the reviewer thought it did. Either answer requires observation to establish. Speculative fixing skips the observation step and pattern-matches instead.

**Pattern-matching compounds errors.** Each speculative fix is based on the same flawed model that produced the previous speculative fix. The second fix is not an independent attempt; it inherits the assumptions of the first. Three speculative fixes in a row are three rounds of the same assumption, not three genuinely different hypotheses.

**The reviewer loses trust in their own tools.** If you ship three fixes and the bug persists, the question isn't "what do I try next?" It is "what am I not seeing?" That question is answered by inspection, not by imagination.

### Fix direction

**After one failed fix, stop and observe.** Not after three. One failed attempt is already the signal that the model behind the fix is wrong. Run the app. Open the console. Inspect the DOM. Log the actual state. Compare observed state to the model the fix was based on. Adjust the model before writing more code.

**For portal-rendered UI specifically,** the observation is usually: what is the actual `data-state` attribute on the overlay after the action? Is it what React thinks it is? If not, React state and DOM state are out of sync... that's the real bug, not the thing the first fix targeted.

**For navigation-related bugs specifically,** the observation is: is the component that owns the state still mounted after the navigation? If not, cleanup of that state will never run. No amount of cleanup ordering will fix unmount-during-cleanup.

**For any bug:** the first failed fix is the cheapest signal that the model is wrong. Take it seriously.

### Related

- **Principle #4** (reversibility is craft) applies at the review level too... a fix that doesn't verifiably reverse the symptom is not a reversible claim, which makes it not craft.
- Every devour skill should be run with a browser-driving MCP available (chrome-devtools, Playwright, Puppeteer). The observation step is what the browser MCP exists for.
- The finding format in review output names the symptom, principle, tactic, and reference. The implicit fifth field is *verification*: did the tactic actually resolve the symptom? Terse mode doesn't include a verification field, but the discipline applies in both terse and verbose modes.

### Origin

This entry was added after a real debugging session in which the reviewer applied three speculative fixes (`requestAnimationFrame` deferral, `setTimeout` deferral, hoisting the parent component into root layout) to a close-on-navigate bug before inspecting the DOM. The actual cause (one component containing a portal overlay was rendered three times, opening three parallel dialogs, only one of which received the close signal) would have been visible in seconds via a single DOM query. The three fixes were reverted; the real fix was an architectural change informed by one minute of observation.

---

## Line-citation accuracy: name what's at the line

### What it is

A finding cites `file:line`, the line number is correct, but the symptom paragraph names the wrong identifier or element at that line. The reviewer read the file, saw a numeric pattern (a `radius="full"` value, an inline style, a magic number), tagged it with the surrounding component name they remembered from earlier in the file, and moved on. The line is right; the name is wrong. The fix-implementer reads the symptom, looks at the line, and finds something different than the symptom describes ... at which point they either (a) lose trust in the entire review, (b) apply the fix to the wrong thing, or (c) spend ten minutes reverse-engineering what the reviewer actually meant.

The shape: the reviewer saw `radius="full"` at line 249, recognized "Avatar" as the dominant component in the file, named the finding "Avatar `radius='full'` at line 249." Reality at line 249 was a HeroUI `Button`, not an `Avatar`. Avatars elsewhere in the file uniformly used `radius="lg"`. The drift was real (a Button radius inconsistent with surrounding interactive-element radii), but it was named wrong and the principle was misframed.

### Why it fails

**`[code-confirmed]` is a claim about reading.** The tag means: "I opened the file, I read the line, I am naming what's on it." If the reviewer can't name the element type or identifier at the cited line, they didn't read it ... they remembered it. Findings sourced from memory of the file rather than the line itself misframe the symptom roughly half the time on long files (>500 lines), more on files with multiple component types interleaved.

**Fix-implementers trust line citations more than narrative.** A finding paragraph with hedged language ("the avatar shape might drift") gets re-read; a finding with a specific line number ("Avatar at comment.tsx:249") gets acted on. The line number is the load-bearing claim. If it doesn't match what's at the line, the entire finding's credibility collapses ... including any unrelated findings in the same review.

**The misframe is invisible to the reviewer.** Devour can't catch this on its own; the line numbers are syntactically valid and the finding format reads correct. Only re-opening the file with the symptom in hand surfaces the mismatch. Discipline at write-time is the only defense.

### Fix direction

**When a finding cites file:line, the symptom paragraph must name the actual identifier or element at that line.** Specifically: the JSX element tag name as it appears in the source (`<Button>`, `<Avatar>`, `<motion.div>`, `<Drawer>`), the function name (`handleScroll`, `useAlbumPlaybackGate`), or the variable name (`isAuthed`, `lastScrollTop`). The conceptual category alone ("Avatar," "the kebab," "the date kicker") is not enough ... that's a remembered category, not a re-read fact. Name the source-level identifier so the fix-implementer can match the symptom to the line without re-deriving the reviewer's intent.

**The `[code-confirmed]` tag means: "I read the line AND I named the source-level identifier at the line."** Before tagging `[code-confirmed]`, ask the explicit question: "Did I just open the file at this line, or am I remembering it from earlier in the review?" If the answer is "remembering," re-open and re-read. The reviewer's remembered category may be correct (the line really is the element they think it is), but more often on long files (>500 lines) or files with multiple component types interleaved, the remembered category is one-element-off from what's actually at the line. Re-reading is the only defense.

**A finding without a verifiable line citation is still a finding ... it just becomes a register-level observation, not a code-level one.** Re-frame as: "the post-detail chassis drifts toward HeroUI defaults vs the editorial primitives at `community-page.tsx:923-948` (ArtistLikedStamp pattern)" rather than a false-precision claim like "Avatar `radius='full'` at line 249." The register-level observation is honest about its scope and forces the fix-implementer to do the line-level identification, which is appropriate when the reviewer didn't.

**Concrete reframe template.**

- Before (bad): `Avatar radius='full' at line 249 mixed with radius='lg' elsewhere.`
- After (good): `HeroUI Button radius='full' at comment.tsx:249 (collapse-toggle Button); UserAvatars elsewhere uniformly use radius='lg'. Drift: Button radius doesn't match other interactive-element radii in the editorial chassis.`

The "after" version names what's actually at the line (HeroUI Button, collapse-toggle), establishes the comparison surface (UserAvatars elsewhere), and frames the drift correctly (interactive-element radii in editorial chassis, not avatar shape). The fix-implementer can act on this without re-deriving the reviewer's intent.

### Related

- **`[code-confirmed]` is also a claim about reading.** See the finding-annotation rules in each review skill's Step 3.
- **Speculative fixing without observation** (above) is the fix-implementer mirror of this: applying a tactic without observing whether the tactic landed where the model said it would. Line-citation accuracy is the upstream version: naming what's at the line so the implementer doesn't have to derive it.

### Origin

This entry was added after the Sleeve chrome rebuild devour run on `(with-cname)+/p.$slug.tsx` (2026-05-04, run file `2026-05-05T010621-devour-frontend-app-routes-with-cname-p-slug.md`). Finding F1 cluster (f) cited `comment.tsx:249` for "Avatar `radius='full'` mixed with `radius='lg'` elsewhere." CC verification revealed line 249 was a HeroUI Button (the collapse-toggle), not an Avatar; UserAvatars in the file uniformly used `radius="lg"`. The line was right; the name was wrong; the principle ("avatar shape consistency") was misframed; the actual drift ("interactive-element radius consistency in editorial chassis") was missed.

---

## Tactic-as-candidate: verify semantic equivalence before asserting a swap

### What it is

A finding proposes "swap component A for component B," where A and B share visual register or appearance but differ in semantic intent. The reviewer saw component A producing a wrong-feeling output, recognized component B as the editorial-register equivalent, and asserted the swap as the tactic. The fix-implementer applies the swap, ships a finding-derived change, and only later (or never) discovers that A and B were doing different jobs ... the swap shipped a wrong meaning to users, or removed a needed signal entirely.

The shape: a `Sparkle` Badge on the post-author byline (semantically: "this account is the campaign owner / artist") was flagged as drift because the editorial register uses `ArtistLikedStamp` (semantically: "this account liked this thing"). The reviewer named the tactic as "swap Sparkle Badge for ArtistLikedStamp." The two components share visual register (small absolutely-positioned glyph on an avatar) but encode different signals. The right tactic was REMOVE the Badge (the campaignOwner signal was already conveyed by the post's authorship; the Badge was decorative drift), not swap it.

### Why it fails

**Visual register is not semantic equivalence.** Two components that look similar can encode different facts about the data model. ArtistLikedStamp answers "who liked this?"; Sparkle-on-author answers "is this the artist?"; a swap conflates the two and ships either a wrong signal (the artist's own posts now appear to be "liked by the artist") or a removed signal (the campaignOwner indicator is gone with no replacement).

**Asserted tactics get applied.** A devour finding that says "Tactic: swap A for B" reads as a directive. Impeccable runs, the swap happens, the finding closes. Whereas a finding that says "Tactic candidate: A and B share visual register but differ in semantic intent ... verify before applying" forces the implementer to check the data model, which is exactly the right move when semantic equivalence is unverified.

**The reviewer doesn't always have the data-model context.** Devour reads code, but a single component's role in the data graph (what props it derives from, what fact about the user/content it encodes) often lives in adjacent files, GraphQL types, or product docs that the reviewer didn't load into context. Asserting swap tactics across that knowledge gap produces fixes that look right and ship wrong.

### Fix direction

**When proposing a tactic that involves swapping component A for component B, verify A and B share semantic intent, not just visual register.** Semantic equivalence means: A and B encode the same fact about the data model, drawn from the same kind of source, conveyed for the same purpose. If A encodes "campaignOwner" and B encodes "likedByArtist," they are not semantically equivalent ... regardless of how similar they look.

**If semantic equivalence is unclear from the code in front of the reviewer, flag the tactic as a candidate, not an assertion.** Use the explicit phrasing `Tactic candidate: ... verify semantics before applying.` Name what would need to be verified (the data model source for A vs B, the user-facing meaning of each, the consequence of the swap if semantics differ) so the implementer knows what verification means.

**REMOVE is a valid tactic candidate.** When the reviewer flags a component as drift but isn't sure what should replace it, "REMOVE" is often the right candidate: if the existing user differentiation pattern (e.g., a `__typename` branch in adjacent components, a separate badge for the same fact rendered elsewhere) already covers the signal, the component is decorative and should be removed rather than swapped. Surfacing REMOVE as an option forces the implementer to check whether the signal is needed at all.

**Concrete reframe template.**

- Before (bad): `Wrong metaphor; editorial register uses ArtistLikedStamp (heart, not sparkle). Tactic: swap Sparkle Badge for ArtistLikedStamp.`
- After (good): `Wrong visual register: Badge uses bg-slvPrimary which competes with primary CTAs. Semantic intent: campaignOwner ("authored by artist"), distinct from ArtistLikedStamp's "liked by artist." Tactic candidate: REMOVE the Badge if existing user differentiation (e.g. PostCommentUser __typename branch) already covers the campaignOwner signal, OR find an editorial-register equivalent if the campaignOwner signal is genuinely needed. Verify semantics before applying.`

The "after" version names the actual visual problem (slvPrimary competing with CTAs), names the semantic distinction (campaignOwner vs likedByArtist), surfaces both candidate paths (REMOVE vs swap-to-equivalent), and forces the verification step.

### Related

- **Principle #11 (match the metaphor to the medium)** is the principle-level claim this discipline operationalizes. The principle says metaphor must match medium; this discipline says: when proposing a metaphor swap, verify the two metaphors encode the same semantic before asserting the swap.
- **Speculative fixing without observation** (above) is the runtime mirror: applying a tactic without observing whether the tactic landed correctly. This entry is the design-time mirror: asserting a tactic without verifying the semantic equivalence that justifies it.

### Origin

This entry was added in the same Sleeve chrome rebuild review as the line-citation entry above (run file `2026-05-05T010621-devour-frontend-app-routes-with-cname-p-slug.md`, F1 cluster (c)). The finding asserted "swap Sparkle Badge for ArtistLikedStamp" as the tactic. Verification revealed the two components encoded different signals (campaignOwner vs likedByArtist); the right move was REMOVE the Badge entirely (the campaignOwner signal was already conveyed by post authorship). Asserting the swap without verifying semantic equivalence would have shipped a wrong meaning ("the artist liked their own post") to users.

---

## Scope discipline: never expand scope via inference

### What it is

A reviewer (or an agent applying findings on the reviewer's behalf) reads a devour review, sees an opportunity to bundle a related fix that wasn't in the agreed scope ("while I'm in this file, this other finding from a different tier could land cheaply"), and applies it without surfacing the bundling option first. The diff that lands is *more* than the spec ... extra changes that the reviewer didn't authorize, even when each individual change is technically defensible.

The shape: the review names a Tier 2 punch list of 4 findings to apply. The implementer finishes the Tier 2 work, notices Tier 3 finding F7 touches the same component, and applies it inline because "it's right next door." The reviewer pulls up the diff to verify Tier 2 is clean and finds an unrequested Tier 3 fix in the same commit. Now the reviewer is no longer reviewing scope ... they're auditing the implementer's judgment about what counts as "in the spirit of" the request.

### Why it fails

**The findings list IS the scope.** Devour reviews emit a structured list (severity, principle, tactic) and an APPLY? prompt that lets the user choose explicitly: breaks only, breaks + drifts, everything, cherry-pick, review-only. The output of that prompt is the contract. Anything applied beyond what the user picked is unauthorized scope expansion, regardless of how reasonable the additional fix looks.

**Inference about "what the reviewer would obviously want" is itself a judgment call.** "Per your earlier discussion," "per your interjection," "per the spirit of the request" are not greenlights. They are inferences. The reviewer may agree that the inferred fix is correct, or may not. Either way, the inference should be surfaced before the work, not after, so the reviewer authorizes scope rather than auditing it.

**Trust-cost exceeds time-saved.** Even when an inferred fix is correct, the trust-cost of "what else did the implementer expand without asking?" exceeds the time saved by bundling. The next review cycle, the reviewer reads the diff with new attention to detail, looking for unauthorized changes. That attention is expensive and recurs every cycle until trust is rebuilt. A small bundling win is not worth the recurring tax.

**Bundling-as-observation is free; bundling-as-action is expensive.** Surfacing "I notice F7 touches this file too ... bundle it?" before the work costs one extra exchange. Applying F7 inline and reporting it after costs the trust-rebuilding overhead above. The economics favor the surfaced observation almost always.

### Fix direction

**The findings list IS the scope.** Don't pull future-tier work forward without explicit greenlight from the reviewer. If the APPLY? decision said "Tier 2 only," apply Tier 2 only. Tier 3 findings that touch the same files are bundling candidates, not authorized work.

**When you see a bundling opportunity, surface it BEFORE doing the work, not after.** Phrasing: "Tier 3 F7 touches the same component as Tier 2 F3. Bundle F7 into this commit, or hold for the Tier 3 pass?" One exchange, reviewer decides, scope stays clean.

**"Per your earlier discussion" / "per your interjection" / "per the spirit of the request" are not greenlights.** They are inferences. The reviewer must explicitly authorize scope expansion. If the inference is strong enough that it feels like a greenlight, surface it as a question anyway ... the cost is one exchange, the benefit is a clean scope contract.

**When in doubt, narrow scope to the spec.** Surface the bundling-candidate as an observation. Let the reviewer decide. The narrower-than-asked diff is recoverable in one follow-up; the wider-than-asked diff requires a trust-rebuilding review.

**This applies to BOTH the reviewer and the fix-implementer.** A devour review can over-scope just as a fix-implementer can ... if the user asked for a motion review and devour finds a state-handling drift in the same file, the right move is to flag it as out-of-scope ("noticed during this run; not part of motion scope; run `/devour-state` if you want it covered") rather than silently include it as a finding.

### Related

- **Speculative fixing without observation** (above) is the same trust-erosion failure mode in a different shape: there, the implementer accumulates unauthorized fixes by trying speculative tactics; here, the implementer accumulates unauthorized scope by inferring intent. Both fail because they substitute the implementer's judgment for the reviewer's authorization.
- **The APPLY? prompt is the scope contract.** Step 5 of every review skill names the five APPLY? options explicitly so the user's authorization is unambiguous. This discipline says: honor the contract; bundling beyond it requires a new exchange.
- **Tactic-as-candidate** (above) is the upstream version: when proposing a swap, flag as candidate rather than asserting. This entry is the downstream version: when applying authorized fixes, don't add unauthorized ones inline.

### Origin

This entry was added 2026-05-05 after a fix-application session where the implementer bundled a future-tier fix into a current-tier commit on the rationale that the bundle was "in the spirit" of the earlier discussion. The reviewer had to audit the diff to confirm the unauthorized fix was acceptable rather than reviewing scope cleanly. The trust-cost of that audit exceeded the time saved by the inline bundle. Surfacing the bundling option before the work would have cost one exchange and avoided the audit entirely.

---

## Cite the compiler, not just the upstream researcher

### What it is

A reviewer (or an agent emitting a finding) cites the original researcher behind a heuristic ... Wertheimer 1923 for Law of Proximity, Hick 1952 for Hick's Law, Tversky and Kahneman 1974 for Anchoring ... and stops there. The compiler who selected the law, named it in its canonical UX form, and made it legible as part of a working set goes uncredited.

The shape: a finding about a pricing page with too many tiers invokes Hick's Law. The citation reads "Hick's Law (Hick, *Quarterly Journal of Experimental Psychology*, 1952)." Strictly correct, structurally incomplete. The reviewer most likely did not read Hick's 1952 paper. They reached for the law because it lives in a compiled set ... in this case, Jon Yablonski's *Laws of UX* (O'Reilly, 2020) at [lawsofux.com](https://lawsofux.com), where Jon selected Hick from psychology's broader corpus, named the law, grouped it with related decision-making heuristics, and translated it into UX-applicable language.

The pattern appears across compiled reference sets ... Yablonski's UX laws, Bret Victor's reading list, Rauno Freiberg's *Devouring Details* principles, Emil Kowalski's *Animations on the Web* chapters. The selection, the naming, the groupings, and the framings the practitioner uses are the compiler's authored contribution, separate from the underlying research.

### Why it fails

**The compilation is what makes the set legible.** Hick's 1952 paper is dense empirical psychology. The version of "Hick's Law" that a working designer reaches for ... three to five primary options, log(n+1) decision time, recommended choice marked ... is the compiler's framing, distilled over years of writing. The reviewer inherits that framing, not the source paper.

**The citation should match what the reviewer used.** A citation is a claim about where the knowledge came from. If the reviewer reached for the compiler's version of a heuristic, the citation should say so. Naming only the underlying researcher reads as familiarity with primary research the reviewer almost certainly did not consult.

**Compilers contribute work that shapes practice.** Translating research into working vocabulary is its own discipline. Skipping the compiler in citation skips the labor that bridged research to practice. Crediting the compiler keeps the chain visible and acknowledges contributions practitioners actually depend on.

### Fix direction

**When citing a heuristic from a curated set, name both the compiler and the upstream researcher.** Format: `<Law name> (<Researcher>, <Venue>, <Year>). Compiled in <Compiler>, <work>.` Example: `Hick's Law (Hick, Quarterly Journal of Experimental Psychology, 1952). Compiled in Yablonski, Laws of UX (O'Reilly, 2020).`

**The compiler citation goes first if the compilation is what the reviewer actually used.** Honest attribution names the chain in the order of dependence. If the reviewer is reaching for Jon's framing of Hick, Jon's citation is load-bearing; Hick's is the underlying research the compilation rests on.

**Apply to all compiled sets.** Devour cites Rauno Freiberg's *Devouring Details* principles as compiled in *Devouring Details* and Emil Kowalski's *Animations on the Web* chapters as compiled in *Animations on the Web*, even when discussing the underlying physics (Johnston & Thomas, 1981) or the underlying HCI research (Buxton, 2007). The same standard applies to Yablonski's *Laws of UX*. The same standard applies to any future compilation Devour ingests.

**For the 30 laws specifically, the compiler citation is Jon Yablonski.** [`references/laws-of-ux.md`](laws-of-ux.md) names Jon as the compiler inline on every entry. Devour reviews that invoke a law should do the same: name the law, name the researcher, name Jon as the compiler. The principle is honest attribution of the actual chain of labor; the practical move is one extra clause per citation.

**A note on Wikipedia and aggregator citations.** When a Wikipedia article or aggregator page (NN/g, Material 3, Apple HIG, Interaction Design Foundation) is the actual source the reviewer used, that is itself a compilation and deserves credit. Devour's discipline is honest, not legalistic ... if the reviewer learned the law from Wikipedia, cite the Wikipedia article *and* the underlying researcher. Don't launder Wikipedia through the upstream paper. Same shape, different compiler.

### Related

- **[`references/laws-of-ux.md`](laws-of-ux.md)** models this discipline in practice ... every law's entry names Jon as the compiler and the underlying researcher with venue. The file's intro states the principle explicitly.
- **[`references/lineage.md`](lineage.md)** treats Jon as a Layer 2 contributor and notes that the *legibility* of his curated set is his authored contribution, not just the selection.
- **Line-citation accuracy** (above) is the structural sibling: that entry insists on naming what's at the line; this entry insists on naming who curated the heuristic. Both fail when reviewers substitute remembered category or remembered source for what they actually read.
- **Devour's lineage discipline more broadly** treats every principle citation as a claim about the chain of intellectual labor. Adding the compiler does not weaken the citation; it strengthens it by making the chain visible.
- **Devour's existing citations follow this shape.** [`principles-map.md`](principles-map.md) cites Rauno Freiberg's *Devouring Details* chapters alongside Johnston & Thomas, Tognazzini, Buxton, Norman, and Brichter. [`exemplars.md`](exemplars.md) distinguishes compiler, author, and integrator explicitly (e.g., "cmdk by Paco Coursey, integrated at Vercel by Rauno Freiberg in 2020"). This entry names the discipline that was already at work.

### Origin

This entry was added 2026-05-17 after a session reviewing a compilation of the same 30 UX laws Jon Yablonski curates at [lawsofux.com](https://lawsofux.com) and in *Laws of UX* (O'Reilly, 2020). Each law was cited only to its underlying researcher; Jon's site appeared once in a prior-art note. The corresponding work for Devour ... [`laws-of-ux.md`](laws-of-ux.md) with Jon credited as the compiler on every entry ... shipped in the same session.

---

## Composing devour with impeccable

Devour and [impeccable](https://impeccable.style) are designed for different jobs. Impeccable has 23 commands: 21 MAKE design, 2 EVALUATE (`critique` and `audit`). Devour does design review with citations... it competes with `/impeccable critique` on the citation axis, not with the makers.

Use `/impeccable critique` for heuristic-scored UX review. Use devour when you want every finding to trace to a named source from the design lineage.

The two compose on the execution side: run devour to identify principle violations, pick a matching `/impeccable <subcommand>` to apply the fix. Devour names the principle; impeccable executes the change.

Recommended flow for a serious craft pass:

1. **Set up project context once per repo:**
   - Run `/devour-teach` to create `DEVOUR.md` at repo root. devour-teach opportunistically reads `PRODUCT.md` and `DESIGN.md` if they exist (impeccable's files), and pre-fills register, audience, and brand voice from them. For multi-surface projects (e.g., marketing site + product app in one repo), pass `--surfaces` to declare per-path-prefix overrides.

2. **Review with devour:**
   - `/devour` for a full-spine review.
   - `/devour <prose description>` to route by keyword.
   - `/devour-motion`, `/devour-micro`, `/devour-state` for focused depth.
   - `--register brand` or `--register product` to override the project default for a single run.
   - Every finding cites a principle and a source. Devour writes a run file to `.devour/runs/`.

3. **For findings you decide to apply, pick the matching `/impeccable` subcommand:**
   - Principle #9 (reduce decoration) → `/impeccable distill`
   - Principle #12 (type is a system) → `/impeccable typeset`
   - Principle #1 / #2 (motion) → `/impeccable animate`
   - Principle #10 (density) → `/impeccable layout`
   - Principle #4 / #7 (state handling) → `/impeccable harden`
   - Principle #8 (affordances) → `/impeccable polish`

4. **Commit with a message that names the principle and the impeccable command used.** Example: `Apply devour #9 via /impeccable distill on StatCard`.

Devour alone tells you what's wrong and why. Impeccable alone tells you what to make. Devour + impeccable closes the loop from principle to code.

**Not required:** devour works standalone. If you don't have impeccable installed, findings still cite principles and sources; the tactic fix is yours to execute however you want.
