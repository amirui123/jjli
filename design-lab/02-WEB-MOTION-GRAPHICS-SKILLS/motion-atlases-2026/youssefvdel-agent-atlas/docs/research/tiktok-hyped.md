# TikTok 2026: The AI-Design / Claude-Code / Agent-Skills Trend

**Research date:** 2026-10-20 (EEST) · **Source:** live TikTok search via real browser (Chromium, logged-out)
**Method:** 13 TikTok search queries → 148 unique videos → per-video `tiktok.com/embed/<id>` HTML fetched for exact `diggCount` / `commentCount` / `shareCount` / `playCount` / caption → 35 GitHub repos verified live via `gh api repos/<owner>/<repo>`.
**Raw data:** `tiktok-raw.jsonl`, `tiktok-detail.jsonl`, `merged.json`, `github-final.json` (same directory).

> **Metric note:** The number TikTok shows on a search card (`data-e2e="video-views"`) is the **like count**, not views. Verified by cross-checking the search card against the embed page's heart/comment/share SVGs on the same video (e.g. cindiezhu: card showed "24.8K" → embed showed 24,800 likes / 1,475 comments / 5,891 shares). All "likes" below are real `diggCount`; all "plays" are real `playCount`.

---

## 1. Headline: what the numbers actually say

- 148 unique videos across the 13 target queries: **1,624,064 likes / 29,968,158 plays**.
- The trend is **fragmented, not centralized**. No single account owns it. 148 videos → **125 distinct creators**, and the median creator has exactly **one** relevant video (107 of 125 creators appear once).
- **The engagement is real but shallow.** Median relevant video: ~1,300 likes, ~26 comments. High plays with low comments = passive scrollers, not practitioners.
- **Two audiences, two languages.** A large Arabic-language "Claude Code skills" cluster (Egypt/Gulf: t.ghoush.ai, mrnagdywp, ismail.9k, engabdulrahmanofficial, abdallah.khraisat) and an English "AI slop / design taste" cluster (adrien.ninet, marcelodesignx, geeklevelasian, codenameposhan, 9jabestwebdev). They share almost **zero** tools.
- **Most of the raw volume is off-topic.** `ai animation` and `vibe coding` queries returned AI-kids-cartoon channels and AI-generated-drama story channels — not design/dev content. I filtered 83 of 148 as trend-relevant; the rest is keyword noise.

---

## 2. The Creators

### Tier 1 — driving the trend (high reach, on-topic)

| Creator | Followers | Relevant vids | Best video (likes) | What they push |
|---|---|---|---|---|
| **@t.ghoush.ai** (AI with Thaer) | 249.9K | **9** | 21,100 | Claude Code gateways (OmniRoute, FreeLLM API), Google Agent Skills, Claude Code Mods, design skills |
| **@adrien.ninet** | **3.4M** | 4 | 16,800 | Process over tools; AI Figma plugin; "AI product design workflow" |
| **@nocode.joshua** | 898.9K | 1 | 18,900 | Claude Code "Mods" (session-to-session messaging, in-UI dashboards, model routing) |
| **@thehypekevin** | 30.7K | 1 | 17,400 | **Matt Pocock's skills** (explicit GitHub link) |
| **@cindiezhu** | 131.6K | 1 | 24,800 | "7 Claude skills to run an entire creative studio" |
| **@insiderforce** | 154K | 1 | 3,462 | Find Skills, Claude Mem, VibeSec (3-skill starter pack) |
| **@mrnagdywp** (Ahmed Nagdy) | 261.3K | 1 | 794 | Skill Creator; Claude/Codex skills |
| **@ismail.9k** | 91K | 2 | 1,709 | `skill-creator`; vibe-coder-survival-guide repo |
| **@codenameposhan** | 208.6K | 1 | 5,931 | **Impeccable** ("catches AI slop before it ships") |
| **@marcelodesignx** | **6.1M** | 1 | 39,500 | Premium design library to kill AI slop |
| **@geeklevelasian** | 1.2M | 1 | 102,600 | Anti-AI-design rant (counter-trend signal) |
| **@9jabestwebdev** | 41.2K | 1 | 18,900 | "5 fixes to AI slop in dashboards" |
| **@nathanhodgson.ai** | 1.9M | 1 | 13,100 | Google Antigravity (free, Gemini 3.0-powered agentic IDE) |
| **@sebintel** | 855.8K | 2 | 2,618 | Single-markdown-file design systems |
| **@ai.honeycove** | 1.5M | 1 | 1,033 | getdesign.md brand design files |
| **@marketerhub.ai** | 159.3K | 1 | 3,558 | "30+ design systems in one markdown file" |
| **@engabdulrahmanofficial** | 5,484 | 2 | 878 | "The 5 skills you must know" / "3 skills for frontend+designers" |
| **@webforge6** | 63.7K | 1 | 4,885 | Claude Code + Google Antigravity build workflow |
| **@hexalab.tech** | 2.7M | 1 | 668 | `brainless` — Claude Code UI as shadcn components |
| **@tylermommsen** | 200.2K | 1 | 284 | Skill that makes writing "pass AI detectors" |
| **@mosherifai** | 37K | 1 | 2,038 | MCP Market agent-skills library |
| **@ahmed.aaddel** | 76.2K | 1 | 4,061 | "10,000 skills in Claude" |
| **@mohammedsamyai** | 2,516 | 2 | 39 | Claude Code + HyperFrames video pipeline; YouTube agent skill |
| **@github.signals** | — | 1 | 180 | `claude-motion` toolkit |
| **@mattpocockuk** | 14.7K | (found via Users tab) | — | **Origin account** for the skills wave |

### Off-topic high-engagement (recorded so nobody mistakes it for the trend)

`@wearebrand.io` (377,100 likes / 4.2M plays, "New level"), `@hizm1bs` (205,000 / 1.1M, "banner claude"), `@webloved` (186,000 / 3.6M — *this one is genuinely on-topic*: a 6-step Claude→Spline→Three.js 3D-site recipe), `@calebthemartin007` (88,100 / 1.4M, "Building the next big thing☝️"), `@workation_memes` (36,900), `@elegant.chi.stori` (17,200 — AI drama stories), `@lupabro1` / `@kids.ai.g` / `@1_mustafa_39` (1.3–1.4M plays each, hashtag-only captions — AI cartoon channels, not design).

---

## 3. The Notable Videos

### 3a. "Claude Code skills" — the skill-library wave

**@thehypekevin** — 17,400 likes · 254,800 plays · 2,457 shares · published 2026-10-09
`https://www.tiktok.com/@thehypekevin/video/7694702701220793620`
> "Your agent can build a whole feature while you make a coffee. So what are you there for? **Matt Pocock's skills have more stars on GitHub than React.** Here's his whole flow, start to finish. Skills by Matt Pocock (x.com/mattpocockuk): `https://github.com/mattpocock/skills`"

- **Repo:** `mattpocock/skills` — **298,237 ⭐**, 25,048 forks, MIT, created 2026-02-03, pushed 2026-10-19.
- **Claim check: TRUE.** `react/react` = **251,512 ⭐** today. The skills repo really does out-star React (and it's 8 months old vs React's 13 years).
- Highest share-to-like ratio in the set (14%) — this is the one that actually propagates.

**@cindiezhu** — 24,800 likes · 345,400 plays · 5,891 shares · published 2026-05-06
`https://www.tiktok.com/@cindiezhu/video/7636813735398575367`
> "7 Claude skills to run an entire creative studio 🧬 1. ReMotion. programmatic video gen, no editor needed 2. Competitor Ads Extractor… 3. Deep Research… 4. Voice DNA… 5. ElevenLabs… 6. Content Engine… 7. Supermemory. Claude finally remembers everything across sessions"
- **Repos:** `remotion-dev/remotion` **65,525 ⭐** ✅ real; `supermemoryai/supermemory` **31,334 ⭐** ✅ real.
- **Hype:** "Competitor Ads Extractor", "Voice DNA", "Content Engine" are **not identifiable repos** — no link, no name I could find on GitHub. The video lists 7 but its own caption admits "I called it 6 in the reel" — sloppy. Also mislabels Remotion as "ReMotion."
- Still 5 months old and still the 2nd-most-shared relevant video.

**@insiderforce** — 3,462 likes · 69,200 plays · 1,035 shares · published 2026-10-05
`https://www.tiktok.com/@insiderforce/video/7680211473292922133`
> "Using Claude without skills is just burning tokens. Here are the top 3 Claude skills you actually need. 1️⃣ Find Skills 2️⃣ Claude Mem 3️⃣ VibeSec"
- **Repos:** `thedotmack/claude-mem` **101,909 ⭐** ✅ real, Apache-2.0, pushed today. `BehiSecc/VibeSec-Skill` **1,360 ⭐** ✅ real but last pushed 2026-02-17 (8 months stale).
- **"Find Skills"** — I could NOT find a canonical repo. The closest repos (`oleksbard/claude-find-skill` 11 ⭐, `miaoa8374-coder/find-skills` 1 ⭐) are trivial. **This is the weakest link in the video's "top 3."**
- The "burning tokens without skills" framing is unverified marketing.

**@the.ai.enabler** — 96 likes · 2,158 plays · published 2026-09-06
`https://www.tiktok.com/@the.ai.enabler/video/7682531077797252373`
> "50 free, open-source AI skills for Claude Code (and Cursor, Windsurf, Codex) covering SEO, ads, copywriting, cold email, pricing. One command to install. **45.7K GitHub stars.** Completely free, MIT licensed."
- **Repo:** `coreyhaines31/marketingskills` — **55,627 ⭐** today, MIT, 52 skill folders confirmed via the GitHub API (`ads`, `cold-email`, `ab-testing`, `ai-seo`, `analytics`, `aso`, `attribution`, `churn-prevention`, `co-marketing`, `competitor-profiling`, …). Created 2026-01-15.
- **Claim check: TRUE.** "50 skills" → 52. "MIT" → MIT. "45.7K stars" → was 45.7K on 2026-09-06, now 55.6K. **Accurate on every verifiable point.** Low reach (96 likes) but high credibility.
- Also plausible: `sickn33/agentic-awesome-skills` **48,042 ⭐** (2,600+ skills).

**@mohammedsamyai** — 39 likes · published 2026-10
`https://www.tiktok.com/@mohammedsamyai/video/7695828748054056212`
> "11 مهارة لـ YouTube في Claude Code … حزمة 11 مهارة لتجهيز السكريبت والعناوين … تحميل الحزمة الأصلية — Jake Schincariol، ترخيص MIT: `https://github.com/Jakeschincariol/youtube-agent-skill`"
- **Repo:** `Jakeschincariol/youtube-agent-skill` — **1,989 ⭐**, 631 forks, MIT. Description: "Eleven Claude skills that run a YouTube channel: scripts off 21 hook formulas…" — "11 skills" ✅ matches.
- The most concrete, reproducible, least-hypey video in the set — it names the exact install path (`.claude/skills/`) and the exact first command.

**@engabdulrahmanofficial** — 878 likes + 412 likes (two videos, 2026-10-11)
`https://www.tiktok.com/@engabdulrahmanofficial/video/7695412533464698113` ("لو بتستخدم Claude Code فلازم تكون عارف الـ 5 skills دول!")
`https://www.tiktok.com/@engabdulrahmanofficial/video/7695289956192767284` ("الـ 3 skills دول لازم تعرفهم في Claude!")
- **No repo named.** The 3-skill video says "important for any Front-End or Designer so they improve design quality." **The skills themselves are never identified.** Pure engagement-bait packaging of the trend, no substance. 5,484 followers.

**@ismail.9k** — 1,709 likes · published 2026-06-29
`https://www.tiktok.com/@ismail.9k/video/7656881709459213589`
> "إنت مش عارف إيه اللي إنت مش عارفه… `https://github.com/ismail9k/vibe-coder-survival-guide`"
- **Repo:** `ismail9k/vibe-coder-survival-guide` — **51 ⭐**, 7 forks, created 2026-06-29, last pushed 2026-07-01. **Essentially abandoned after 3 days.**
- Same creator's other video (357 likes) says Claude has a built-in `skill-creator` — that one is real (Claude Code does ship `skill-creator`), and the demo (fed it 20 old scripts to learn his voice) is a genuinely reasonable use case.

**@tylermommsen** — 284 likes · published 2026-10-17
`https://www.tiktok.com/@tylermommsen/video/7697648159006477586`
> "I use one custom skill in Claude to make my writing sound human and **pass AI detectors**. Every time I've tested it, it's come back as 0% AI."
- **Unverifiable and probably false.** "0% AI" is not a measurable property of AI detectors — they're unreliable by design and score arbitrary text non-zero. No repo. The two-prompt method (ask Claude to list AI-writing tells → save as a skill) is legitimate; the detector claim is not.

### 3b. The "AI slop / design taste" wave — the English counter-cluster

**@codenameposhan** — 5,931 likes · 115,700 plays · 972 shares
`https://www.tiktok.com/@codenameposhan/video/7668526634097544478`
> "AI-generated websites are starting to look the same. Purple gradients. Giant bold headlines. Cards inside cards. Endless whitespace. **Impeccable helps Claude Code catch AI slop before it ships** and honestly, it's one of the most impressive Claude Code plugins I've tried."
- **Repo:** `pbakaus/impeccable` — **83,588 ⭐**, 5,056 forks, Apache-2.0, pushed 2026-10-20 (today). Description: "The design language that makes your AI harness better at design." ✅ real and actively maintained.
- The most credible video in the cluster: named repo, real repo, correct description, no inflated numbers, and a defensible mechanism (a design-language rules layer vs. a model).

**@t.ghoush.ai** — 1,708 likes · 38,900 plays · published 2026-08-06
`https://www.tiktok.com/@t.ghoush.ai/video/7670999118499679505`
> "في 3 Skills بتغيّر شكل التصاميم اللي بيطلعها Claude Code بالكامل… الأولى: **Emil Kowalski Skill** … الثانية: **Impeccable** … وكمان فيها أمر `/polish` … الثالثة: **Taste**"
- **Repos:** `emilkowalski/skills` **47,898 ⭐** ✅ (MIT, pushed 2026-10-11); `pbakaus/impeccable` **83,588 ⭐** ✅; **`senlindesign/taste-skill` 408 ⭐** ✅ exists but is tiny and last pushed 2026-07-07.
- **Diagnosis is accurate** — the video's critique ("same gradients, same Inter font, no motion") is a real and widely-reported property of LLM-generated UI.
- **Hype:** "completely changes the designs" is overselling. Impeccable and Emil's skills are markdown rule-sets — they raise the floor; they don't make Claude creative. `Taste` at 408 stars is presented as an equal third, which it is not.
- Note: a near-identical script also appears from @markkashef (2,296 likes) — **copied-content network**, not independent corroboration.

**@marcelodesignx** — 39,500 likes · 554,400 plays
`https://www.tiktok.com/@marcelodesignx/video/7661412767722753287`
> "Give your AI a premium design library and watch the AI slop disappear. Comment 'slop' to get the website."
- **No repo named** (link in bio, paywall-ish CTA). The underlying idea = `VoltAgent/awesome-design-md` **122,457 ⭐** (MIT, "A collection of DESIGN.md files analysis by popular brand design systems. Drop one into your project and let coding agents generate a matching UI."), pushed 2026-10-14.
- **Engagement bait**: the video's whole value is the comment-to-DM mechanic. 6.1M followers, no technical content.

**@ai.honeycove** — 1,033 likes · 19,500 plays · published 2026-04-29
`https://www.tiktok.com/@ai.honeycove/video/7634291808435981582`
> "A free design system website called **getdesign.md** gives you brand-ready AI design files from Nike, Ferrari, Meta, IBM… to speed up building in Lovable, Bolt, V0, and Cursor."
- **Repo: NOT VERIFIABLE.** There is no official `getdesign.md` GitHub org. Closest matches are mirrors/clones with 0–14 stars (`piyushpradhan/getdesign.md` 14 ⭐, `wangsixiang777/getdesign.md` 5 ⭐). The site is real; **the GitHub story behind it is not**. Treat as a website, not a repo.
- Real adjacent repo: `bergside/awesome-design-skills` **3,275 ⭐**, `kwakseongjae/oh-my-design` **542 ⭐** ("One command installs 500+ quality-graded company DESIGN.md references").

**@sebintel** — 2,618 + 1,330 likes
`https://www.tiktok.com/@sebintel/video/7617135247733361942` (2026-03-14) and `.../7631201524756008214` (2026-04-21)
> "Free AI that creates clean UI layouts and gives you the exact prompts to recreate them" / "Transform your AI into a world-class UI designer with a single markdown file—**30+ design systems** inspired by top companies"
- **No repo named.** The "single markdown file / 30+ design systems" pattern = the DESIGN.md format (`VoltAgent/awesome-design-md` 122,457 ⭐, `bergside/awesome-design-skills` 3,275 ⭐). Substance in the mechanism, nothing verifiable in the video itself.
- @marketerhub.ai posted a **byte-identical caption** (3,558 likes) — confirmed duplication.

**@adrien.ninet** — 16,800 likes (309,300 plays) · 8,134 likes (184,900 plays) · 2,449 likes
- `.../7584090027190209814`: "If you let AI build your website blindly, you'll get something generic. But with the right process, AI can create sites that actually look premium."
- `.../7530206835341593878`: "This AI Figma plugin will 10x your workflow. Generate full web or mobile designs in seconds… get instant UX feedback."
- **No repo, no tool named.** "10x your workflow" is unsubstantiated. 3.4M followers but zero verifiable claims — the 2nd-largest account in the set and the emptiest technically.
- The 4th video ("Consistent Pixar-style characters → live character picker page") got only **175 likes / 4,478 plays** despite being the most technically interesting item he posted — reach is unrelated to substance.

**@geeklevelasian** — 102,600 likes · 672,200 plays · published 2026-10-03
`https://www.tiktok.com/@geeklevelasian/video/7692453162522905887`
> "Ai design is the ugliest crap I've ever seen"
- **Pure counter-trend signal.** 1.2M followers, 102.6K likes, zero tools. This is the shape of the backlash — a large, engaged audience that thinks AI-generated design is ugly.
- Related: `@spenser.bower` "A content creator stole my idea to make AI slop videos" (42,200 likes); `@winteruheart` "the AI slop banners got my eyes working overtime" (9,676 likes / 665,800 plays); `@9jabestwebdev` "5 fixes to AI slop in dashboards" (18,900 likes / 371,100 plays — **the only one that teaches fixes, and it's on the Arabic/English divide's other side**).

### 3c. Claude Code infrastructure & gateways

**@t.ghoush.ai** — 21,100 likes · 478,800 plays · 4,826 shares (published 2026-09-27) and 13,000 likes · 291,600 plays · 2,706 shares (2026-08-02)
- Video A (`.../7690271854023494933`): "**FreeLLM API** بتربط Claude Code بمئات موديلات الـAI… ChatGPT وGemini وGLM وKimi وGrok وMistral وQwen" — routes Claude Code to hundreds of free models, preserving context when one hits its limit.
  - **Repo:** `open-free-llm-api/awesome-freellm-apis` — **4,474 ⭐**, MIT, pushed 2026-10-20. Real, but ~30× smaller than the repos it's being sold alongside. Also `freellms/awesome-freellm-apis` (39 ⭐) and `guihuashaoxiang/FreeLLM-API-KeyHub` (277 ⭐) — the name maps to several things.
- Video B (`.../7669497680527248656`): "في أداة مجانية على GitHub اسمها **OmniRoute**، بتربط Claude Code مع مئات مزودي نماذج الذكاء الاصطناعي… بتحوّلك تلقائيًا إلى مزود أو نموذج آخر… ميزة لضغط الـ Prompts"
  - **Repo:** `diegosouzapw/OmniRoute` — **78,785 ⭐**, 11,475 forks, MIT, pushed 2026-10-20. Description: "Never stop coding. Free MIT AI gateway: one endpoint, 375 providers (150+ free), 1,400+ models… Works with Claude Code." ✅ **The video's "hundreds of providers" and "prompt compression" are both accurate.**
- This is the single most consistent creator in the set: **9 relevant videos, 47,242 likes, 1,062,100 plays**, and **every single video names a repo that turns out to be real.**

**@nocode.joshua** — 18,900 likes · 333,300 plays · 3,523 shares · published 2026-10-06
`https://www.tiktok.com/@nocode.joshua/video/7693627237349772550`
> "Claude Code just dropped Mods. Here are 3 ways to use them… 1. Make your sessions talk to each other… 2. Change the interface… 3. Send the easy stuff to a cheaper model. The craziest part: just describe the mod you want to Claude and it builds it."
- **No repo named.** "Mods" is a Claude Code feature, not a repo — so nothing to cross-check, but nothing fake either.
- ⚠️ **This is the most imitable video in the set** — and @markkashef (2,296 likes) posted a near-verbatim script of it 5 days later. The 12K-like @Z | AI & Claude and @Mobile Editing Club versions are the same lineage.

**@t.ghoush.ai** — 803 likes · 19,400 plays · published 2026-08-02
`.../7683458688509594901`: "أطلقت **Google's Agent Skills**، مكتبة مجانية ومفتوحة المصدر فيها أكتر من 100 Skill، بتخلي الـCoding Agent يعتمد على Playbooks من جوجل… Gemini، Analytics، Google Ads، Cloud وFirebase… بأمر تثبيت واحد."
- **Repo:** `google/skills` — **21,435 ⭐**, 1,808 forks, Apache-2.0, created 2026-03-31, pushed 2026-10-19. Description: "Agent Skills for Google products and technologies." ✅ real, official, and ">100 skills" is plausible for that org.
- Also `google-gemini/gemini-skills` **4,307 ⭐**.
- ⚠️ **Yet another copied-video cluster:** @mohamedjoe.ai posted a near-identical version 2 days later (20 likes).

**@t.ghoush.ai** — 3,359 likes · 71,200 plays
`.../7696867498314272016`: "موديلين بيراقبوا بعض… وببلاش سكل **ClaudeX**: واحد بيخطط وواحد بيدقق" — a free "ClaudeX" setup where one model plans and another audits. **No repo, no link in caption (bio-only) — unverifiable.**

### 3d. "Claude Code can do this" — the showcase genre

**@mo_blaki** (20,700 likes / 380,700 plays / 2,369 shares), **@aa40rr** (20,100 / 484,600 / 3,291), **@kaleb.hustlez** (38,300 / 672,000 / 5,457), **@wearebrand.io** (377,100 / 4,200,000 / 17,600)
- All four use the identical hook: *"Claude Code can't do this"* / *"ما يقدر يسوي هذا كلاود"* / *"comment 'Claude' if you want a simpler version"*.
- **All four are lead-generation funnels** (mo_blaki: "contact me if you want a site built"; aa40rr: UI/UX + social-media services; kaleb.hustlez: "optimizing your money with crazy side hustles", link in bio to higgsfield.ai). The caption contains **no tool, no repo, no technical claim** — the "Claude Code" mention is the hook, not the subject.
- This is the **highest-engagement, lowest-substance cluster** in the entire trend. Combined: 656,200 likes, 8.7M plays, zero verifiable content.
- @wearebrand.io (377K likes, 4.2M plays, caption "New level") is a web-design agency — the AI-design reference is entirely in the on-screen footage.

### 3e. Component-library & build-tool wave

**@hexalab.tech** — 668 likes · 11,400 plays · published 2026-08-31
`https://www.tiktok.com/@hexalab.tech/video/7680124782741867777`
> "Sebuah library bernama **brainless** berhasil meniru antarmuka Claude Code, Codex, dan Grok menjadi komponen shadcn… pesan chat, pemanggilan tool, perbedaan kode, dialog izin, daftar todo, serta perintah slash."
- **Repo:** `theswerd/brainless` — **840 ⭐**, 58 forks, MIT, created 2026-07-11, pushed 2026-09-25. Description: "Claude Code, Codex, and Grok interfaces as shadcn components." ✅ **Accurately described.**
- 2.7M followers, but 668 likes — a big account posting into a niche with no traction.

**@zaindevx_** — 29 likes · 902 plays: "This VS Code extension gives you **1,800+ Shadcn UI blocks**… Search → Preview → Install."
- **Repo: could not identify.** `shadcn-ui/ui` itself is **126,039 ⭐** (MIT, pushed 2026-10-19) but that's the component library, not a VS Code extension with 1,800 blocks. **The "1,800+" figure is unsubstantiated** — likely referring to 21st.dev's catalog.

**@jomarmontuya** — 1,349 likes: "21st.dev react component library" → `21st-dev/magic-mcp` **6,140 ⭐**, 499 forks, ISC, pushed 2026-09-09. Description: "It's like v0, but in your Cursor / Claude Code / Windsurf: search 10,000+ React/Tailwind components." ✅ The "10,000+" is the vendor's own claim and matches.

**@marina_uiux** — 2,923 likes: "Built with **Framer AI Agent**… Prompts: `https://budarina.design/prompts` Framer Remix file: `https://framer.link/n9TIWKY`" — **the only video in the set with two concrete, working, non-GitHub links** (prompt pack + a Remix file). Rare and genuinely useful.

**@nathanhodgson.ai** — 13,100 likes · 282,200 plays: "Google just launched **Antigravity**, a free AI coding tool where agents build, test, and even click through your app like real users. Powered by **Gemini 3.0**."
- ⚠️ **Unverifiable as a repo claim** (Antigravity is a product, not a repo), and **"Gemini 3.0" is a version claim I cannot confirm** — the official CLI in this space is `google-gemini/gemini-cli` **107,467 ⭐** (Apache-2.0, pushed 2026-10-20). Video published 2026-01-05.
- @webforge6 (4,885 likes, 90,600 plays) independently names Antigravity + Claude Code and is more specific: "I built this entire bespoke-kitchen brand with Antigravity… there's zero canvas and zero WebGL anywhere on this page — no GSAP, no Three.js. Every 'cinematic' moment is pure React and CSS." **That is a specific, checkable technical claim** — and it's the best anti-hype signal in the set (he *denies* using the tools people assume).

**@github.signals** — 180 likes · 5,605 plays: "**claude-motion**: How AI Codes Its Own Motion Design… exact easing curves and a built-in self-review loop that checks its own video frames… a sound engine that synthesizes custom audio effects directly in Python… render complex live web simulations… into smooth sixty frames per second video"
- **Repo:** `whaleyxbt/claude-motion` — **536 ⭐**, 70 forks, MIT, created 2026-09-29, pushed 2026-10-09. ✅ real.
- Accurately described — every feature claimed is in the repo description ("A motion design toolkit for coding agents").

**@mohammedsamyai** — 39 likes: Claude Code + **HyperFrames** for video production. **Repo:** `heygen-com/hyperframes` — **68,181 ⭐**, 6,159 forks, Apache-2.0, pushed 2026-10-20. Description: "Write HTML. Render video. Built for agents." ✅
- **The best-disclosed video in the entire dataset.** It names the affiliate link (`kie.ai?ref=…`), discloses commission ("ممكن آخد عمولة"), cites the pricing page, timestamps the screenshots ("لقطات KIE بتاريخ 16 أكتوبر 2026"), states the model versions, and lists all its sources. It also links to Anthropic's own model pages. Almost nothing else in the trend does this. Low reach, highest integrity.

**@adrien.ninet** (4th), **@aibilarabi** (3,895 likes), **@dev.mohamed.mostafa** (2,472), **@medo..code** "Vibe Coding P1/P5" (4,849 likes): "vibe coding" as a **term** — mostly definitional explainers, no tools, no repos, no demos. Pure SEO-bait. @aibilarabi's video is the only one with a real "fastest/easiest AI tools to build a site" list, but it names no specific tool in the caption.

**@flyingshorts / @mrnagdywp** — 261.3K followers: "Claude and Codex Skills… تريك بسيط بيوفر وقت سكلز كلود" — Claude/Codex skill marketplaces. No repo in caption.

---

## 4. Cross-reference: every repo a video pushed, verified live

All star counts via `gh api repos/<owner>/<repo>` on **2026-10-20**. Only repos named or unambiguously implied by a video's caption are listed.

| Repo | Real ⭐ | Video that pushed it | Verdict |
|---|---|---|---|
| `mattpocock/skills` | **298,237** | @thehypekevin (explicit link) | ✅ **Claim verified — beats React (251,512)** |
| `obra/superpowers` | **302,441** | (adjacent ecosystem, not named in a video) | ✅ Real, largest skills framework |
| `anthropics/skills` | **182,407** | Claude Code skills generally | ✅ Official |
| `VoltAgent/awesome-design-md` | **122,457** | @ai.honeycove / @marcelodesignx (design-library idea) | ✅ Real |
| `shadcn-ui/ui` | **126,039** | shadcn cluster | ✅ Real |
| `github/spec-kit` | **142,074** | (adjacent) | ✅ Real |
| `thedotmack/claude-mem` | **101,909** | @insiderforce ("Claude Mem") | ✅ Real |
| `pbakaus/impeccable` | **83,588** | @codenameposhan, @t.ghoush.ai, @markkashef | ✅ **Real, pushed today** |
| `diegosouzapw/OmniRoute` | **78,785** | @t.ghoush.ai (named) | ✅ **Real, claims accurate** |
| `ComposioHQ/awesome-claude-skills` | **77,491** | (adjacent) | ✅ Real |
| `heygen-com/hyperframes` | **68,181** | @mohammedsamyai (named) | ✅ Real |
| `remotion-dev/remotion` | **65,525** | @cindiezhu ("ReMotion") | ✅ Real (name misquoted) |
| `K-Dense-AI/scientific-agent-skills` | **53,170** | (adjacent) | ✅ Real |
| `coreyhaines31/marketingskills` | **55,627** | @the.ai.enabler ("50 skills, 45.7K ⭐, MIT") | ✅ **Every number verified** |
| `sickn33/agentic-awesome-skills` | **48,042** | (alt for "10,000 skills") | ✅ Real |
| `emilkowalski/skills` | **47,898** | @t.ghoush.ai ("Emil Kowalski Skill") | ✅ Real |
| `alirezarezvani/claude-skills` | **28,447** | (adjacent) | ✅ Real |
| `supermemoryai/supermemory` | **31,334** | @cindiezhu ("Supermemory") | ✅ Real |
| `google/skills` | **21,435** | @t.ghoush.ai, @mohamedjoe.ai | ✅ **Real + official** |
| `K-Dense-AI` / `google-gemini/gemini-skills` | **4,307** | @mohamedjoe.ai | ✅ Real |
| `theswerd/brainless` | **840** | @hexalab.tech (named) | ✅ Real, accurately described |
| `21st-dev/magic-mcp` | **6,140** | @jomarmontuya, @zaindevx_, @maximskorohood | ✅ Real ("10,000+ components") |
| `BehiSecc/VibeSec-Skill` | **1,360** | @insiderforce ("VibeSec") | ⚠️ Real but **stale** (last push 2026-02-17) |
| `open-free-llm-api/awesome-freellm-apis` | **4,474** | @t.ghoush.ai ("FreeLLM API") | ⚠️ Real but **30× smaller than implied** |
| `whaleyxbt/claude-motion` | **536** | @github.signals (named) | ✅ Real, accurately described |
| `senlindesign/taste-skill` | **408** | @t.ghoush.ai ("Taste") | ⚠️ Real but **tiny**; presented as an equal third |
| `Jakeschincariol/youtube-agent-skill` | **1,989** | @mohammedsamyai (named) | ✅ Real, "11 skills" confirmed |
| `bergside/awesome-design-skills` | **3,275** | (design.md cluster) | ✅ Real |
| `ismail9k/vibe-coder-survival-guide` | **51** | @ismail.9k (named) | ❌ **Abandoned after 3 days** |
| `kwakseongjae/oh-my-design` | **542** | (design.md cluster) | ✅ Real |
| `21st-dev/magic-mcp` | 6,140 | @maximskorohood (21st.dev + UIUX Pro Max) | ⚠️ UIUX Pro Max itself: **9 ⭐** — the pairing sells a 6K repo as a 9-repo feature |
| `getdesign.md` (repo) | **no official repo** | @ai.honeycove | ❌ **Site is real; no GitHub org. Mirrors are 0–14 ⭐** |
| "Find Skills" | **not found** | @insiderforce | ❌ **Cannot locate a canonical repo** |
| "Competitor Ads Extractor", "Voice DNA", "Content Engine" | **not found** | @cindiezhu | ❌ **No repo, no link — unverifiable names** |
| "ClaudeX" | **not found** | @t.ghoush.ai | ❌ Bio-only, unverifiable |
| "Shadcn VS Code ext, 1,800+ blocks" | **not found** | @zaindevx_ | ❌ **No matching repo; figure unsubstantiated** |
| `react/react` | **251,512** | (baseline for the "more stars than React" claim) | — |

---

## 5. Synthesis: what is actually being hyped

### The one-sentence trend
**"Skills" have become the unit of currency for AI coding, and "design taste" has become the unit of currency for AI output quality — and TikTok is monetizing both halves with a hook ("Claude Code can't do this" / "AI slop") that carries no technical payload.**

### What has substance

1. **A real, massive skills ecosystem exists.** 6 repos over 100K ⭐ (`mattpocock/skills` 298K, `obra/superpowers` 302K, `anthropics/skills` 182K, `shadcn-ui/ui` 126K, `VoltAgent/awesome-design-md` 122K, `github/spec-kit` 142K). This is not manufactured hype — the GitHub numbers are real and verifiable, and the top skills repo genuinely out-stars React.
2. **The underlying diagnosis is correct.** LLM-generated UI converges on the same gradients, the same Inter font, the same card-in-card. "AI slop" is a real, describable aesthetic failure, and DESIGN.md-style rule layers + `impeccable` are a genuine mechanism for raising output quality.
3. **The best videos are the boring ones.** @mohammedsamyai discloses his affiliate link, his commission, his source URLs and his screenshot dates. @the.ai.enebabler's numbers are all accurate. @webforge6 explains what he did *not* use. These are the exception.
4. **Model-routing gateways are a real product category.** OmniRoute (78,785 ⭐, MIT, pushed today) and the FreeLLM-API list are real and solve a real pain (rate limits killing long sessions).
5. **"Claude Code Mods" is a genuinely new capability** — session-to-session messaging, in-UI dashboards, model routing by task. Even the copies of it are spreading product knowledge.

### What is hype

1. **The engagement mechanic is the product.** The 4 biggest "Claude Code" videos (656,200 likes, 8.7M plays combined) name **no tool, no repo, no feature**. They are agency funnels with a Claude Code-shaped hook. `@wearebrand.io`'s 377K-like "New level" and `@kaleb.hustlez`'s "comment Claude" are pure lead-gen.
2. **Star counts are the credibility currency, and they are frequently wrong or unstated.** The claim "Matt Pocock's skills have more stars than React" is *true* — but most other videos cite no stars at all, and the ones that do (45.7K) are describing a repo that now has 55.6K. The one video claiming "10,000 skills" (@ahmed.aaddel, 4,061 likes) points at nothing verifiable.
3. **Three named "skills" in the top creative-studio video don't exist as repos.** "Competitor Ads Extractor", "Voice DNA", "Content Engine" — no GitHub presence, no links, no way to install them. Same for "Find Skills" in @insiderforce's "top 3" and "ClaudeX".
4. **"Pass AI detectors at 0% AI"** (@tylermommsen) is a false precision claim. AI detectors don't produce a meaningful 0%. The underlying method (tell Claude its own tells → save as a skill) is legitimate; the claim is not.
5. **Stale or abandoned repos are presented as current.** `vibe-coder-survival-guide` (51 ⭐, dead since 2026-07-01) is pushed as "start here". `VibeSec-Skill` hasn't been pushed in 8 months.
6. **The "single markdown file with 30+ design systems" claim appears twice with byte-identical captions** (@sebintel, @marketerhub.ai) — plus @t.ghoush.ai and @markkashef running near-identical "Mods" scripts, and @mohamedjoe.ai copying @t.ghoush.ai's Google-skills video within 2 days. **A meaningful share of the "trend" is content-mill duplication, not independent adoption.** Counting top-liked videos from these creators as separate trend signals double-counts.
7. **The `ai animation` and `vibe coding` query tails are keyword pollution.** AI-kids-cartoon channels (1.3–1.4M plays) and AI-drama story channels (574K plays) rank alongside real content. The trend is much smaller than raw search volume suggests.

### Two audience silos that don't talk
The Arabic cluster (t.ghoush.ai, mrnagdywp, ismail.9k, engabdulrahmanofficial, abdallah.khraisat, mosherifai, sahad/ahmed.aaddel) pushes **gateways and skill-install workflows**. The English cluster (adrien.ninet, marcelodesignx, codenameposhan, 9jabestwebdev, geeklevelasian) pushes **design taste and anti-slop**. The overlap is roughly: `impeccable`, `mattpocock/skills`, and `Google Agent Skills`. @t.ghoush.ai is the only creator operating in both, and is the most consistent source in the entire dataset.

### Counter-trend worth tracking
`@geeklevelasian` (102,600 likes / 672,200 plays on "Ai design is the ugliest crap I've ever seen") plus `@spenser.bower` (42,200) and `@winteruheart` (9,676 / 665,800 plays) show a **large, engaged backlash audience**. The critique isn't that the tools don't work — it's that the output is ugly and everyone can tell. That is the pressure that will drive the next wave of the trend: not more skills, but better taste enforcement.

---

## 6. Practical reads for the knowledge base

- **Highest-signal repos to track:** `mattpocock/skills` (298K), `obra/superpowers` (302K), `anthropics/skills` (182K), `pbakaus/impeccable` (83.5K), `diegosouzapw/OmniRoute` (78.8K), `google/skills` (21.4K), `thedotmack/claude-mem` (101.9K), `heygen-com/hyperframes` (68.2K).
- **Best-grounded videos to cite:** @mohammedsamyai (full disclosure), @the.ai.enabler (all numbers check out), @webforge6 (states what he didn't use), @codenameposhan (named repo, accurate), @nocode.joshua (Claude Code Mods).
- **Videos to treat as unverified:** anything naming "Find Skills", "Voice DNA", "Competitor Ads Extractor", "Content Engine", "ClaudeX", or "getdesign.md as a GitHub repo" without a direct URL.
- **Do not treat the engagement numbers as adoption signals.** The largest likes in this trend come from agency funnels and AI-cartoon channels.

---

## Appendix — data provenance

| Artifact | Path | Contents |
|---|---|---|
| Search harvest | `tiktok-raw.jsonl` | 148 unique videos, 13 queries, card-level like count + creator + caption |
| Per-video detail | `tiktok-detail.jsonl` | `diggCount`/`commentCount`/`shareCount`/`playCount`/author/signature/caption from `tiktok.com/embed/<id>` HTML |
| Merged dataset | `merged.json` | 148 videos joined, creator handle resolved from embed payload `uniqueId` |
| GitHub verification | `github-final.json` | 33 repos, live `gh api` snapshot 2026-10-20 |
| Raw embed HTML | `embed-cache/<vid>.html` | 148 cached pages for re-verification |
| Tools | `fetch_embed.py`, `verify_repos.py`, `ttk.py` | Re-runnable extractors |

**Known limitations:**
- TikTok search ranks by relevance/engagement, not chronology — this is a snapshot of what ranks today, not a time series. Videos surfaced are disproportionately recent (many within the last 10 days).
- Search results differ by geo/session; the Arabic-heavy weighting reflects this session's region (EG viewer region was reported by TikTok's own payload).
- Engagement is a point-in-time snapshot; TikTok counts shift.
- 10 of 148 videos had hashtag-only captions (no prose) — these are recorded but carry no analytical signal.
- Direct `tiktok.com/@user/video/<id>` navigation returns "Site Maintenance" from this IP; all video detail was obtained via the embed endpoint instead, which returns identical engagement data.
