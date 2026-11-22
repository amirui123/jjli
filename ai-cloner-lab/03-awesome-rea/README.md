# Awesome REA: Reverse Engineer Anything with AI [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

**English** · [简体中文](README.zh-CN.md)

**What AI agents reverse-engineered and rebuilt, and which ones really used REA.**

> Unofficial. Not affiliated with morluto/rea.

"REA" started as [morluto/rea](https://github.com/morluto/rea) (Reverse Engineer Anything, 200k+ stars), an open-source MCP server and CLI (npm `rea-agents`) that lets coding agents inspect native binaries, Electron apps, .NET assemblies, APKs, firmware and websites without their source code, explain how a feature works with evidence, and rebuild it. REA itself does not decompile; it orchestrates Hopper, Ghidra, IDA and JADX for the agent.

"REA" now also names the whole wave of AI agents reverse-engineering and rebuilding closed software, whether they use REA, or Claude Code and Codex with Ghidra or IDA MCP. This list covers that wave and says what each case actually used.

**Tags**

- `REA`: the project README, the author's post or the official showcase says morluto/rea was used.
- `AI-RE`: AI reverse engineering with other tools, or with no tool named.
- `Rebuild`: clean-room rewrite with no reverse-engineering evidence.
- `Claim?`: not yet verified.

> ⚠️ Reverse engineering is governed by local law, software licenses and terms of service. This list covers only public information, for learning, research, interoperability and preservation. Make sure you are allowed to analyse the target. See [Legal and controversy](#legal-and-controversy).

## Most shared

| Case | What they did | Reach | Tag |
|---|---|---|---|
| [Universal Modder](https://github.com/rehan-remade/universal-modder) by @rehan_shei | Minecraft content inside GTA V and other games you own | 14k likes | `AI-RE` |
| [Steam game to Unity in 30 min](https://x.com/AIWarper/status/2109060856466264566) by @AIWarper | Decompiled a game he owns to C#, using Opus 5.5 | 467k views | `REA` (author's post) |
| [Claude Slides editor](https://x.com/dotey/status/2109151666020794711) by @dotey | Deobfuscated the web front end, then rewrote it as [baocut](https://github.com/JimLiu/baocut) (source-available) | 686 likes, 81k views (2026-10-12) | `REA` (author's post) |
| [Native Plex client for LG TVs](https://github.com/GLinnik21/plx-native) by GLinnik21 | Startup and selection screen faster on an LG TV | 7.3k likes (repost) | `AI-RE` |
| [Apple TV remote on Linux](https://github.com/a-funk/open-appleremote) by @alexzfunk | Bluetooth protocol of the first-gen remote, open source | 5.4k likes | `Claim?` |
| [DX-Ball](https://github.com/N0zoM1z0/dx-ball) by N0zoM1z0 | Byte-exact reconstruction of one sound-pan function, checked against 3,205 original x86 cases | official showcase | `REA` |

Snapshot dates: likes from [songshikang0111/awesome-REA-cases](https://github.com/songshikang0111/awesome-REA-cases) on 2026-10-12; views as noted.

## Contents

- [Official showcases](#official-showcases)
- [Community cases built with REA](#community-cases-built-with-rea)
- [The wider wave: without confirmed REA](#the-wider-wave-without-confirmed-rea)
- [Find projects by the app they replace](docs/by-app.md)
- [Did it really use REA?](docs/is-it-rea.md): a claim check for each case
- [New this week](docs/new-this-week.md)
- [Posts from X](docs/x-posts.zh-CN.md) (in Chinese)
- [Plugins and integrations](#plugins-and-integrations)
- [Guides and research](#guides-and-research)
- [Related MCP reverse-engineering tools](#related-mcp-reverse-engineering-tools)
- [Other lists](#other-lists)
- [Discussion and press](#discussion-and-press)
- [Press and posts about REA](docs/press-and-posts.md)
- [Legal and controversy](#legal-and-controversy)
- [Contributing](#contributing)

## Official showcases

These are on [rea.tools](https://rea.tools/showcase/) and are tagged `REA`, except where noted.

- [DX-Ball: sound-pan function](https://rea.tools/showcase/dx-ball/) - One helper that maps sound position to left/right channels, rebuilt as C. It matches 3,205 original x86 test cases, and 63 bytes match after recompilation. This is one function, not the whole game.
- [Notion: Electron clipboard bridge](https://rea.tools/showcase/notion/) - Traces a copy from the page API through preload and IPC to the main process.
- [TH04: DOS bullet-ring maths](https://rea.tools/showcase/th04/) - 16-bit angle helpers from *Touhou 4* on PC-98. REA made a fresh inspection for the page; the reconstruction comes from the TH04 project.
- [Aegis: login-code generation](https://rea.tools/showcase/aegis/) - Traces TOTP code generation in the Aegis 3.4.3 Android app.
- [CTF: flag checker](https://rea.tools/showcase/ctf/) - A DownUnderCTF 2023 reverse-engineering challenge.
- [Blog: the industrial revolution in reverse engineering](https://rea.tools/blog/touhou-reconstruction) - Written by N0zoM1z0, who also co-builds REA. Most of the work was done by agents with IDA / Ghidra; REA supplied only part of the evidence. Tagged `AI-RE`.
- [Blog: does reverse engineering need a bigger model?](https://rea.tools/blog/reverse-engineering-models) - Discusses model capability using Touhou examples and proposes a comparison, but reports no measured results. Tagged `AI-RE`.

## Community cases built with REA

Tags show the evidence source. Star counts are from 2026-10-14.

### Games and reconstructions

- [N0zoM1z0/dx-ball](https://github.com/N0zoM1z0/dx-ball) - `REA` Reconstruction of English DX-Ball 1.07 in C/C++, which the README says used REA. Alpha, MIT. The author is also a contributor to REA, so this is a first-party case.
- [N0zoM1z0/th04](https://github.com/N0zoM1z0/th04) - `REA (showcase)` Source reconstruction of *Touhou 4* (PC-98), built on ReC98 and checked against Turbo C++ 4.0J. The README does not mention REA; see the showcase above. MIT.
- [N0zoM1z0's Touhou series](https://github.com/N0zoM1z0?tab=repositories): [th08](https://github.com/N0zoM1z0/th08), [th105](https://github.com/N0zoM1z0/th105), [th095](https://github.com/N0zoM1z0/th095), [th09](https://github.com/N0zoM1z0/th09), [th10](https://github.com/N0zoM1z0/th10), [th08-web](https://github.com/N0zoM1z0/th08-web), and [touhou-reconstruction-factory](https://github.com/N0zoM1z0/touhou-reconstruction-factory) - `AI-RE` Agent-driven reconstructions using Codex or GPT-web with IDA MCP or Ghidra. None of these READMEs mentions REA.
- [ucodia/desktop-games-nostalgia](https://github.com/ucodia/desktop-games-nostalgia) - `REA` Port of the 2000 Gemtree *Desktop Games* to macOS and the browser, built with Claude Code, REA and Ghidra. No license file.
- [tuunanet/rea-ski-or-die-reconstruction](https://github.com/tuunanet/rea-ski-or-die-reconstruction) - `REA` Rust + SDL2 rewrite of the 1990 DOS game *Ski or Die*. Assets come from your own copy.
- [Moxnatiy/OpenBattlefield2](https://github.com/Moxnatiy/OpenBattlefield2) - `REA` C++20 clean-room reimplementation of the Battlefield 2 Refractor 2 engine. REA is documented in CLAUDE.md and `tools/rea.sh`, not the README. Needs the original game. MIT.
- [OpenRsG/GunZRs](https://github.com/OpenRsG/GunZRs) - `REA` Rust + Bevy rewrite of *GunZ: The Duel*, reading the Steam install. The executable is packed, so REA's role in the port is limited. Apache-2.0.
- [a-barzanti/ai-rebuilds](https://github.com/a-barzanti/ai-rebuilds) - `REA` Community collection of abandoned games rebuilt for the browser. Contributors use REA to write specs, then build from those specs. Ground rules forbid committing original game files.

### Apps and tools

- [michaelshimeles/paper-rs](https://github.com/michaelshimeles/paper-rs) - `REA` Infinite-canvas design app in Rust (wgpu + egui), built after studying Paper's behaviour with REA and Claude Code.
- [michaelshimeles/rec-rs](https://github.com/michaelshimeles/rec-rs) - `REA` Rust screen recorder for macOS, after studying OBS Studio's architecture (OBS is GPL-2.0).
- [michaelshimeles/terminal-rs](https://github.com/michaelshimeles/terminal-rs) - `REA` Bloomberg-style trading terminal in Rust. Chart behaviour was studied from public TradingView pages. No license file.
- [az9713/wispr-flow-rea-teardown](https://github.com/az9713/wispr-flow-rea-teardown) - `REA` Teardown of Wispr Flow's voice pipeline. Each claim is marked proven, inferred or hidden, plus a 64-line local rebuild. The README does not link morluto/rea; it follows a tutorial video.
- [iammukeshm/hexgrab](https://github.com/iammukeshm/hexgrab) - `REA` .NET 10 colour picker written from REA's findings on PowerToys' shipped binaries. MIT.
- [AdamLinCodes/AdamTerm](https://github.com/AdamLinCodes/AdamTerm) - `REA` Minimal macOS terminal (SwiftTerm) after studying Ghostty with REA. No license file.
- [JimLiu/baocut](https://github.com/JimLiu/baocut) - `REA` (author's post) BaoCut app, whose slides editor is adapted from Claude Slides. The README does not name REA. **Source-available (BaoCut Community License 1.0), not open source.**
- [LilZeeCN/zee-rp](https://github.com/LilZeeCN/zee-rp) - `REA` (author's reply) CLI and MCP for reading and writing Axure RP `.rp` prototype files. Validated only on macOS with Axure RP 11. MIT.
- [wquguru/cameo](https://github.com/wquguru/cameo) - `Claim?` The linked repo is the author's original desktop-pet app, not REA output. The author's follow-up post describes an REA-based reconstruction, but its source was not published.
- [lxistired/ledger-reborn](https://github.com/lxistired/ledger-reborn) - `REA` Independent local accounting app, built after studying QuickBooks Desktop for Mac 2024 trial with REA. See [discussion #2198](https://github.com/morluto/rea/discussions/2198). Preview release. MIT.
- [KarlssonChristoffer/DiskLens](https://github.com/KarlssonChristoffer/DiskLens) - `REA` WinDirStat-style disk analyzer for Windows 11, written by Claude Code. The author used REA to study the shipped WinDirStat 2.5.0 binary first. The author says the code has not been reviewed, so treat it as experimental.

### Hardware, protocols and drivers

- [a-funk/open-appleremote](https://github.com/a-funk/open-appleremote) - `Claim?` Makes the first-gen Apple TV Siri Remote work over Bluetooth on Linux. Pure Python standard library, MIT. Neither README nor post says which tool was used.
- [grisuno/VSL-DSP](https://github.com/grisuno/VSL-DSP) - `REA (partial)` Linux kernel module for PreSonus AudioBox VSL sound cards. The repo predates REA; REA helped with some vendor-library findings only.
- [Slyvan25/OpenGHub](https://github.com/Slyvan25/OpenGHub) - `Manual RE` Linux-native Logitech G HUB replacement over HID++ 2.0. Reverse-engineered from captures and documented in `docs/lighting.md`. No AI or REA mention. MIT.
- [cudanexus/vd-streamer-linux](https://github.com/cudanexus/vd-streamer-linux) - `REA` Linux port of Virtual Desktop Streamer, built with Claude Code + REA. Not yet tested on a real headset.

### Security and evaluations

- [NullLabTests/OpenBSD_netcat_REA](https://github.com/NullLabTests/OpenBSD_netcat_REA) - `REA` Static analysis of Ubuntu's netcat-openbsd 1.234-1 with REA and Ghidra. MIT.
- [az9713/REA-demo](https://github.com/az9713/REA-demo) - `REA` REA analysing its own installed package, with falsifiable predictions and a self-grade.
- [REA discussion #1406](https://github.com/morluto/rea/discussions/1406) - `REA` Outside-in leak check of a production Next.js + Stripe app.
- [REA discussion #2254](https://github.com/morluto/rea/discussions/2254) - `REA` Stripped bzip2 analysed and checked against an unstripped build.
- [UnknownHacker1/rea-groundtruth](https://github.com/UnknownHacker1/rea-groundtruth) - `REA` Compares REA's reports with the actual code and provides one-command repros. MIT.

## The wider wave: without confirmed REA

These projects came up alongside REA. Their READMEs do not say REA was used, so they are listed as background.

- [storytold's Craft apps](https://github.com/storytold/photocraft) - `Rebuild` PhotoCraft (Photoshop-style, about 59k stars), WordCraft, GridCraft, VectorCraft, FilmCraft, LightCraft, PdfCraft, DeckCraft, CADCraft, EffectCraft, DesignCraft, SoundCraft and FigCraft. Clean-room rewrites, mostly alpha. WordCraft's AGENTS.md forbids disassembling the Word program, so it is a black-box rewrite. Only FilmCraft says it was "largely built" by agents. Dual MIT or Apache-2.0.
- [AsyncFinn/rook](https://github.com/AsyncFinn/rook) - `Rebuild` Rust reimplementation of the Roblox engine, tested against Studio recordings. Early development. Apache-2.0.
- [tallowmere/free-heroes4](https://github.com/tallowmere/free-heroes4) - `Rebuild` C++23 reimplementation of the Heroes of Might and Magic IV engine. Needs GOG game files. Unfinished. GPL-3.0.
- [designgears/wine-uwp](https://github.com/designgears/wine-uwp) - `AI-RE` Patches Wine to run Windows Store apps such as Shapr3D. Not clean-room: it uses Microsoft's own components. The AI claim comes from the author's X post.
- [Universal Modder](https://github.com/rehan-remade/universal-modder) - `AI-RE` Claude Code / Codex plugin that mods games you own (for example, Minecraft content inside GTA V). A modding toolkit, not a reimplementation. MIT.
- [Firefighter: DOS binary to Rust](https://x.com/esrtweet/status/2106983467141509385) - `AI-RE` Eric S. Raymond recovered the Pascal logic of an old DOS game from its binary and rewrote it in Rust. The work predates REA. No public code found.
- [Modern Warfare 2 decompilation](https://x.com/momo5502/status/2108886652391141721) - `AI-RE` Author reports 17 agents over three months, 83% of functions byte-matched. Code is not public.

## Plugins and integrations

- [zhaofeng130/dsh-rea](https://github.com/zhaofeng130/dsh-rea) - DeepSeek Harness adapter that registers the REA Skill and tools.
- [ya123-4/rea-dsh-plugin](https://github.com/ya123-4/rea-dsh-plugin) - DeepSeek Harness plugin that registers REA MCP tools.
- [sheilacraig/dsh-rea-mcp](https://github.com/sheilacraig/dsh-rea-mcp) - Config-only DeepSeek Harness bundle that mounts REA.
- [cognixws/picode-rea](https://github.com/cognixws/picode-rea) - PiCode extension enabling REA's static-analysis tools. Pins rea-agents 6.1.0; current is 6.4.0.
- [pablodiazjorge/rea-casebook](https://github.com/pablodiazjorge/rea-casebook) - Claude Code mod that logs REA evidence and requires conclusions to cite real `evidence_id`s.
- [laaielichter/reverseport](https://github.com/laaielichter/reverseport) - CLI + MCP for porting reverse-engineering results to Godot, Unity, Unreal and three.js. **Note:** its README says the analysis engine is "based on REA", and its notices say REA code is MIT-licensed. Treat it as a derivative of REA, not an independent tool.
- [Nowng/rea-mcp](https://github.com/Nowng/rea-mcp) - LM Studio plugin that wraps the original REA MCP server, for local models. It clones REA at runtime.
- [sickpyramid/ReaFuse](https://github.com/sickpyramid/ReaFuse) - Builds on REA to fuse two JS/TS source projects. v0.1, alpha.
- [dav1dngy/era-agent](https://github.com/dav1dngy/era-agent) - Evidence-driven reverse-engineering agent with a self-improvement lab. Experimental, v0.1.0.
- [alexmi256/rea-agent-docker](https://github.com/alexmi256/rea-agent-docker) - Docker images for REA. Four variants: Ghidra + Hopper, ghidra, hopper, and ida. The IDA image does not ship IDA itself. linux/amd64 only.
- [moonfruit/homebrew-tap](https://github.com/moonfruit/homebrew-tap/blob/main/Formula/rea-agents.rb) - One person's Homebrew tap. Not in homebrew-core.
- [czcdr/dsh-plugin-rea](https://github.com/czcdr/dsh-plugin-rea) - Third-party adapter that brings the morluto/rea MCP server into DeepSeek Harness as `mcp__rea__*` tools. Version 2.x installs the REA CLI, JDK and Ghidra for you.
- [ShadowSwaps/REA-Reconstruction-Companion](https://github.com/ShadowSwaps/REA-Reconstruction-Companion) - Agent Skill that turns REA findings into a specification, architecture, plan and validation steps for rebuilding an app, feature or format.

## Guides and research

- [ringozzt/rea-research](https://github.com/ringozzt/rea-research) - 🇨🇳 Chinese technical research: architecture, evidence model, what DX-Ball's numbers mean, trust model, and the gap between stars and installs. Unlicensed, data from 10-11. Read this first.
- [pablodiazjorge/rea-lab](https://github.com/pablodiazjorge/rea-lab) - 🇪🇸 Setup, exercises and tool evaluation on Windows with Ghidra. Its pre-registered study found Claude Code solved 28 of 30 tasks both with and without REA, while REA runs took about twice as long and cost more. The only controlled comparison in this list.
- [jinshi666888/rea-playbook](https://github.com/jinshi666888/rea-playbook) - 🇨🇳 Hands-on lab: a minimal Electron target, evidence extraction with `file:line` references, and an MCP probe.
- [valorisa/Reverse-Engineer-Anything](https://github.com/valorisa/Reverse-Engineer-Anything) - 🇫🇷 Unofficial French guide, including the legal framework.
- [REA: Reverse Engineer Anything with AI Agents & MCP (HoangYell)](https://hoangyell.com/rea-explained/) - Introduction.
- [Reverse Engineer Anything: What the Viral REA MCP Actually Does (MindStudio)](https://www.mindstudio.ai/blog/reverse-engineer-anything-mcp) - What REA does, without the hype.
- [Agentic Reverse Engineering: What REA Is and How to Start (El Solitario)](https://elsolitario.org/en/2026/10/10/rea-reverse-engineering-for-coding-agents/) - Getting started.
- [How To Use REA To Clone Any Software In Minutes (Eric Tech, YouTube)](https://www.youtube.com/watch?v=FnB9tHKBJXQ) - Video tutorial.
- [inematds/rea-engenharia-reversa](https://github.com/inematds/rea-engenharia-reversa) - 🇧🇷 Guide to REA in Portuguese, English and Spanish, with links, cases, an honest assessment and a test run.
- [ZooHero500/reatool](https://github.com/ZooHero500/reatool) - Unofficial REA tutorials and comparisons for installing and using it with coding agents. Not affiliated with morluto.

## Related MCP reverse-engineering tools

Tools that REA drives, or tools in the same category.

- [mrexodia/ida-pro-mcp](https://github.com/mrexodia/ida-pro-mcp) - MCP server for IDA Pro, used by REA's IDA Pro profile. Its author now recommends the official [HexRaysSA/ida-mcp](https://github.com/HexRaysSA/ida-mcp).
- [0xshlomil/ida-free-mcp](https://github.com/0xshlomil/ida-free-mcp) - Native bridge for IDA Free, used by REA (see `docs/ida-provider.md`).
- [LaurieWired/GhidraMCP](https://github.com/LaurieWired/GhidraMCP) - MCP server for Ghidra. REA calls Ghidra's `analyzeHeadless` directly, so this is a peer tool, not a dependency.
- [N0zoM1z0/touhou-reverse-engineering](https://github.com/N0zoM1z0/touhou-reverse-engineering) - `AI-RE` Evidence-first IDA + Codex notes, including runtime patch experiments. No REA mention.

## Other lists

- [sqwu/rea-gems](https://github.com/sqwu/rea-gems) - Daily-updated gallery of REA cases, built from official pages, GitHub, HN and Reddit. Includes some mirror clones; check before use.
- [miles990/rea-case-rankings](https://github.com/miles990/rea-case-rankings) - Daily scored ranking of REA cases with JSON, RSS and llms.txt (formerly `rea-awesome`).
- [kaixinbaba/awesome-rea](https://github.com/kaixinbaba/awesome-rea) - Catalog of reverse-engineering, reimplementation and compatible alternatives ([awesomerea.com](https://awesomerea.com)). REA is not required.
- [zhuyansen/awesome-ai-reverse-engineering](https://github.com/zhuyansen/awesome-ai-reverse-engineering) - AI reverse-engineering tools, each with a security rating. Bilingual.
- [DiscoverBox/awesome-ai-reverse](https://github.com/DiscoverBox/awesome-ai-reverse) - 🇨🇳 AI-assisted reverse-engineering tools across MCP, Skills, plugins and agents.
- [songshikang0111/awesome-REA-cases](https://github.com/songshikang0111/awesome-REA-cases) - 🇨🇳 Tracks REA and AI reverse-engineering cases several times a day. Currently 139 cases, each marked as confirmed-REA or not.
- [Asymmetrical-1024/awsome-REA](https://github.com/Asymmetrical-1024/awsome-REA) - 🇨🇳 REA case collection with post screenshots, evidence excerpts and verification limits.
- [yibie/awesome-rea](https://github.com/yibie/awesome-rea) - Only includes AI decompilation and porting cases with stated acceptance tests.
- [heaven-hm/awesome-reverse-engineered-games](https://github.com/heaven-hm/awesome-reverse-engineered-games) - AI-rebuilt games.
- [SubmitGame/awesome-decomp-games](https://github.com/SubmitGame/awesome-decomp-games) - Decompiled games, many playable in the browser. CC0-1.0.

## Discussion and press

- [Hacker News: Reverse engineer anything with agents, from app behavior down to native binaries](https://news.ycombinator.com/item?id=50058850)
- [GitHub discussion: reducing token waste in REA workflows](https://github.com/morluto/rea/discussions/1958)
- [GitHub discussion: install notes and pitfalls on Fedora-family Linux](https://github.com/morluto/rea/discussions/1435)
- [GitHub discussion: Linux benchmarks (Node 22/24/26 startup and five local models)](https://github.com/morluto/rea/discussions/1998)
- [Startup Fortune](https://startupfortune.com/an-ai-agent-that-reverse-engineers-any-software-just-hit-number-one-on-github/)
- [Cybersecurity News](https://cybersecuritynews.com/reverse-engineer-anything-tool/)
- [CyberPress](https://cyberpress.org/new-open-source-rea-tool/)
- [RuntimeWire](https://runtimewire.com/article/matthew-berman-rea-ai-reverse-engineering)
- [MayhemCode](https://www.mayhemcode.com/2026/10/rea-reverse-engineering-tool-can-ai.html)

The [by-app index](docs/by-app.md) lists alternatives by the app they replace.

More posts, roundups, critics and press are in [Press and posts about REA](docs/press-and-posts.md).

## Legal and controversy

REA's rise has also brought controversy. Keep these in mind when you use or share a case:

- **Clean-room claims:** critics note that one agent doing both analysis and rebuilding does not meet the personnel separation of traditional clean-room development.
- **Scope:** the official project does not claim to recover original source code or clone a whole application. DX-Ball's 3,205 / 63 figures apply to one function (see [rea-research](https://github.com/ringozzt/rea-research)).
- **Privacy and trust:** analysis runs locally, but tool results pass through the agent to the model provider. SECURITY.md says REA is not a sandbox.
- **Commercial tools:** IDA Pro, Hopper and JEB must be legally licensed. REA provides no licenses.
- **Service terms:** Anthropic's and OpenAI's terms prohibit reverse-engineering their own services. They do not cover other software, but cases that target Claude Slides, Claude Code, Claude Chrome or Codex's browser feature should be checked against the terms yourself.
- **Official position:** DISCLAIMER.md lists permitted uses: learning, research, interoperability, preservation, security research, vulnerability disclosure, and CTFs. It excludes copying proprietary software or reproducing its protected code and assets. See [DISCLAIMER.md](https://github.com/morluto/rea/blob/main/DISCLAIMER.md).

This list does not accept projects whose main purpose is bypassing licensing, copying paid features, or distributing copyrighted assets.

**Beware of fake downloads:** GitHub has repositories that claim to offer an "official free download" of REA as zip files. The official channels are [morluto/rea](https://github.com/morluto/rea), [rea.tools](https://rea.tools/) and the npm package `rea-agents` (`npx rea-agents setup`). Do not run archives or executables from anywhere else.

## Contributing

Suggestions are welcome as issues or pull requests. Inclusion rules:

1. Prefer **open-source** projects with a source link. Cases without code belong on the [X page](docs/x-posts.zh-CN.md).
2. A community case needs evidence that REA was used (the README, the author's post or an official showcase). Otherwise it goes in "The wider wave".
3. One line per entry: `- [Name](link) - what it does, and its tag.`
4. No mirrors, pure forks, or projects whose main purpose is infringement or bypassing licensing.
5. Takedown requests: open an issue with the project name and reason. We will remove the entry and keep the evidence archived.
