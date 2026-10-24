---
created: 2026-04-19
tags: [type/reference, topic/after-effects, topic/sdk, topic/ecosystem]
source: multi-source curated 2026-04-19
api_provider: Adobe After Effects SDK — Ecosystem
---

# After Effects SDK — Ecosystem References

> Curated list of the highest-signal external resources for AE plugin and scripting development. Ranked by author utility, not popularity. Last verified 2026-04-19.

---

## Official Adobe Resources

| Resource | URL | Notes |
|----------|-----|-------|
| AE Developer Portal | https://developer.adobe.com/after-effects/ | SDK access requires Adobe Developer Console login |
| C++ SDK Guide (community, authoritative) | https://ae-plugins.docsforadobe.dev/ | Primary doc source for this KB |
| ExtendScript Guide | https://ae-scripting.docsforadobe.dev/ | JavaScript scripting API — covered in `scripting/` |
| CC Developer Forums | https://forums.creativeclouddeveloper.com/ | Plugin dev Q&A |
| Adobe AE Community Discord | https://discord.com/invite/PEzhtnNyKw | General AE community |
| Release Notes | https://helpx.adobe.com/after-effects/release-note/release-notes-after-effects.html | Official AE release notes |

**SDK distribution:** The SDK ships inside the AE application install. Separate ZIP is available through the Adobe Developer Console after login. Version tracks AE app version (e.g. `AEGP_SuiteVersion` constants tied to AE 25.x / 26.x).

---

## Top GitHub Repositories (ranked by developer utility)

| # | Repo | Stars | Purpose |
|---|------|-------|---------|
| 1 | [Dakkshin/after-effects-mcp](https://github.com/Dakkshin/after-effects-mcp) | 294 | MCP server for AI-driven AE remote control via ExtendScript. Extremely active (Apr 2026). The most interesting current experiment in AI + AE. |
| 2 | [ae-scripting/scripting-snippets](https://github.com/ae-scripting/scripting-snippets) | 213 | Curated ExtendScript snippets. Pattern library. |
| 3 | [docsforadobe/after-effects-scripting-guide](https://github.com/docsforadobe/after-effects-scripting-guide) | 163 | Source repo for the ExtendScript reference. Actively updated. |
| 4 | [boltframe/aftereffects-aep-parser](https://github.com/boltframe/aftereffects-aep-parser) | 120 | Unofficial binary parser for `.aep` project files. Useful for external tooling. |
| 5 | [virtualritz/after-effects](https://github.com/virtualritz/after-effects) | 87 | High-level safe Rust bindings for the AE SDK. Cross-platform, no PiPL tool. |
| 6 | [hyperbrew/after-effects-command-ids](https://github.com/hyperbrew/after-effects-command-ids) | 85 | Interactive viewer + JSON for all AE command IDs across versions. |
| 7 | [Wunkolo/Vulkanator](https://github.com/Wunkolo/Vulkanator) | 77 | The only public Vulkan-accelerated AE effect sample. Essential for modern GPU path. |
| 8 | [docsforadobe/after-effects-plugin-guide](https://github.com/docsforadobe/after-effects-plugin-guide) | 46 | Source repo for the C++ SDK guide. Submodule candidate. |
| 9 | [Aodaruma/aod-AE-plugin](https://github.com/Aodaruma/aod-AE-plugin) | 33 | Multiple working AE plugins in Rust. Real-world examples. |
| 10 | [Trentonom0r3/AETK](https://github.com/Trentonom0r3/AETK) | 14 | Modern C++ abstraction over AE SDK suites. Reduces boilerplate. |

### Official Adobe GitHub (adjacent / cross-app)

- [AdobeDocs/uxp-premiere-pro-samples](https://github.com/AdobeDocs/uxp-premiere-pro-samples) — Closest UXP pattern reference (Premiere, not AE)
- [adobe/uxp-optimized](https://github.com/adobe/uxp-optimized) — Optimized React/JS components for UXP panels
- [hyperbrew/bolt-uxp](https://github.com/hyperbrew/bolt-uxp) — UXP plugin boilerplate (Svelte/React/Vue) — for when AE UXP ships

---

## Plugin Templates & Starter Kits

| Template | URL | Stack |
|----------|-----|-------|
| Minimal AE Plugin (C++17 CMake) | https://github.com/dolag233/Minimal-AE-Plugin-Template | C++ / CMake |
| Rust AE plugin template (cargo generate) | https://github.com/Aodaruma/after-effects-template | Rust |
| AFFEKT (cross-platform high-level Rust) | https://github.com/potistudio/AFFEKT | Rust — early stage, watch |
| Vulkanator (GPU effect sample) | https://github.com/Wunkolo/Vulkanator | C++ + Vulkan |

---

## Blog Posts & Deep-Dives (2025-2026)

1. **[How To Create An After Effects Plugin — Development Tutorial](https://aescripts.com/learn/post/how-to-create-an-after-effects-plugin---development-tutorial)** — Plugin Everything / aescripts — Step-by-step C++ SDK walkthrough. Most-cited beginner resource.
2. **[After Effects News September 2025](https://www.provideocoalition.com/after-effects-news-september-2025/)** — Rich Young, ProVideo Coalition — Monthly ecosystem roundup, tracks AE 25.x plugin compat changes.
3. **[Adobe adds new 3D features to After Effects 25.6](https://www.cgchannel.com/2025/11/adobe-adds-new-3d-features-to-after-effects-25-6-and-the-ae-beta/)** — CG Channel, Nov 2025 — Renderer API changes affecting plugin authors.
4. **[AE 26.2 April 2026 release](https://www.provideocoalition.com/after-effect-26-2-april-2026-release/)** — ProVideo Coalition, April 2026 — AI Object Matte, 3D displacement, SVG import, 2-4x faster 3D render.
5. **[Plugin Development for Adobe Premiere and After Effects (course)](https://www.fxphd.com/details/526/)** — fxphd — Paid deep C/C++ course. 8/16/32-bit processing, CUDA/OpenCL GPU.
6. **[ExtendScript vs UXP: Which One Should You Learn?](https://aftereffectscloud.wordpress.com/2025/09/12/extendscript-vs-uxp-which-one-should-you-learn/)** — September 2025 — Strategic guidance on scripting stack choice.
7. **[UXP Arrives in Premiere Pro (Dec 2025)](https://blog.developer.adobe.com/en/publish/2025/12/uxp-arrives-in-premiere-a-new-era-for-plugin-development)** — Adobe Developer Blog — Roadmap signal for when AE UXP may arrive.
8. **[after-effects crate docs (docs.rs)](https://docs.rs/after-effects)** — Continuously updated — Reference companion to the virtualritz Rust bindings.

---

## Quick-Start Paths by Goal

| Goal | Start here |
|------|-----------|
| Build a classic image-processing effect plugin (C++) | `wave-1/02-effect-plugins.md` + Plugin Everything tutorial |
| Build a SmartFX / GPU-accelerated effect | `wave-2/01-smartfx-complete.md` + `wave-2/02-gpu-acceleration.md` + Vulkanator sample |
| Build in Rust instead of C++ | `virtualritz/after-effects` + `after-effects` crate docs |
| Build a project-level automation (read/modify comps, layers, keyframes) — AEGP | `wave-1/03-aegp-plugins.md` + `wave-3/` suite-specific files |
| Build automation via scripting (no compiled plugin) | `scripting/01-extendscript-complete-reference.md` |
| Build an importer/exporter (AEIO) | `wave-1/04-aeio-plugins.md` |
| Integrate with Premiere Pro | `wave-2/05-premiere-integration.md` |
| Modern AI-integrated AE tooling | `Dakkshin/after-effects-mcp` repo as reference |

---

*Last updated: 2026-04-19*
*Compiled from 3-agent recon pass against github.com, adobe.com, docsforadobe.dev, and industry blogs*
