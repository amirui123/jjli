# Adobe After Effects SDK — Complete Knowledge Base

> A comprehensive, developer-ready reference for Adobe After Effects plugin and scripting development. Covers the full C++ SDK, ExtendScript scripting API, AE 26.x release notes, and curated ecosystem references.

**Last updated:** 2026-04-19
**Coverage:** AE C++ SDK through v25.6 (Adobe has not published 26.x SDK docs yet) · ExtendScript through AE 26.0 (Jan 2026) · Release notes through AE 26.2 (April 2026)
**Total:** 37 markdown files · ~1.2 MB of technical reference

---

## What's In Here

| Folder | Purpose | Files |
|--------|---------|-------|
| [`wave-1/`](wave-1/) | Core C++ SDK: architecture, effect plugins, AEGP, AEIO, Artisan/BlitHook, PF suites, data types, error handling | 8 |
| [`wave-2/`](wave-2/) | Advanced C++: SmartFX, GPU acceleration, Multi-Frame Rendering, audio effects, Premiere integration, sample code analysis | 6 |
| [`wave-3/`](wave-3/) | C++ gap-fill: Mercury Transmit, AEGP suite versions, custom UI/Drawbot, 3D/camera/light, markers/keyframes, text/shape layers, masks/paths, render queue, color management, undo/clipboard/prefs, footage/composition | 12 |
| [`final/`](final/) | Consolidated master reference, knowledge map, gap analysis | 3 |
| [`scripting/`](scripting/) | **NEW (Apr 2026)** — Complete ExtendScript reference (AE 26.0), scripting overview, UXP status note | 3 |
| [`release-notes/`](release-notes/) | **NEW (Apr 2026)** — AE 26.0 + 26.2 plugin-developer digest | 1 |
| [`REFERENCES.md`](REFERENCES.md) | **NEW (Apr 2026)** — Curated ecosystem: top GitHub repos, blogs, templates, quick-start paths | — |
| [`COVERAGE.md`](COVERAGE.md), [`SOURCES.md`](SOURCES.md), [`source-registry.yaml`](source-registry.yaml) | Scrape provenance and coverage tracking | — |

---

## Where To Start

**Brand new to AE plugin dev?** Read in this order:
1. [`final/MASTER-AE-SDK-REFERENCE.md`](final/MASTER-AE-SDK-REFERENCE.md) — single-file high-level orientation
2. [`wave-1/01-sdk-overview-architecture.md`](wave-1/01-sdk-overview-architecture.md) — the actual SDK architecture
3. [`wave-1/02-effect-plugins.md`](wave-1/02-effect-plugins.md) — your first effect plugin
4. [`REFERENCES.md`](REFERENCES.md) → "Quick-Start Paths by Goal" table

**Already know the SDK, want to automate AE via script?**
1. [`scripting/00-overview.md`](scripting/00-overview.md) — when to script vs plugin
2. [`scripting/01-extendscript-complete-reference.md`](scripting/01-extendscript-complete-reference.md) — 2,500-line complete API reference

**Checking what's new in AE 26.x?**
1. [`release-notes/01-ae-26x-release-notes.md`](release-notes/01-ae-26x-release-notes.md) — plugin-developer digest

---

## Quick-Start Paths by Goal

| Goal | Start here |
|------|-----------|
| Build a classic image-processing effect plugin (C++) | [`wave-1/02-effect-plugins.md`](wave-1/02-effect-plugins.md) |
| Build a SmartFX / GPU-accelerated effect | [`wave-2/01-smartfx-complete.md`](wave-2/01-smartfx-complete.md) + [`wave-2/02-gpu-acceleration.md`](wave-2/02-gpu-acceleration.md) |
| Build in Rust instead of C++ | [`REFERENCES.md`](REFERENCES.md) → `virtualritz/after-effects` crate |
| Build project-level automation (AEGP) | [`wave-1/03-aegp-plugins.md`](wave-1/03-aegp-plugins.md) + relevant `wave-3/` files |
| Build automation via scripting (no compiled plugin) | [`scripting/01-extendscript-complete-reference.md`](scripting/01-extendscript-complete-reference.md) |
| Build an importer/exporter (AEIO) | [`wave-1/04-aeio-plugins.md`](wave-1/04-aeio-plugins.md) |
| Integrate with Premiere Pro | [`wave-2/05-premiere-integration.md`](wave-2/05-premiere-integration.md) |
| Build a UXP panel (not yet available for AE) | [`scripting/UXP-STATUS-NOTE.md`](scripting/UXP-STATUS-NOTE.md) |
| Build AI-integrated AE tooling | [`REFERENCES.md`](REFERENCES.md) → `Dakkshin/after-effects-mcp` (294★ MCP server) |

---

## Coverage Summary

### C++ SDK — 100% of documented APIs
- All 25 PF (effect) suites documented
- All 40+ AEGP suites documented with version history
- Effect, AEGP, AEIO, Artisan plugin types
- SmartFX, GPU acceleration, Multi-Frame Rendering
- Mercury Transmit / BlitHook
- Custom UI / Drawbot
- 3D layers, cameras, lights
- Markers, keyframes, expressions
- Text layers, shape layers, masks, paths
- Render queue, output modules, color management
- Undo, clipboard, preferences, persistent data

### ExtendScript — 35+ API objects, AE 26.0 current
- General: `app`, `Project`, `System`
- Items: `Item`, `ItemCollection`, `AVItem`, `CompItem`, `FolderItem`, `FootageItem`
- Layers: `Layer`, `AVLayer`, `CameraLayer`, `LightLayer`, `ShapeLayer`, `TextLayer`, `ThreeDModelLayer`
- Properties: `PropertyBase`, `Property`, `PropertyGroup`, `MaskPropertyGroup`
- Render Queue, Sources, Text, Collections, Markers, Shapes, Viewers
- Match Names reference tables
- Complete changelog AE 9.0 → 26.0

### Release Notes
- AE 26.0 (January 22, 2026) — full feature list + developer impact
- AE 26.2 (April 15, 2026) — AI Object Matte, 3D displacement, SVG import, 2-4x 3D render speedup
- Windows ARM64 recompile advisory for plugin authors

---

## Intentional Scope Exclusions

The following are **out of scope** and intentionally not included:

| Topic | Reason |
|-------|--------|
| CEP (HTML) panel development | Different tech stack; [Adobe CEP docs](https://github.com/Adobe-CEP/Getting-Started-guides) cover this |
| UXP panels for AE | Not yet available for AE — see [`scripting/UXP-STATUS-NOTE.md`](scripting/UXP-STATUS-NOTE.md) |
| Third-party commercial frameworks | Proprietary, change frequently |
| Reverse-engineered undocumented APIs | Unsupported |
| Pre-CS6 historical APIs | Legacy, no practical value |
| GPU vendor-specific optimization | Beyond SDK scope — see [NVIDIA CUDA](https://docs.nvidia.com/cuda/), [Apple Metal](https://developer.apple.com/metal/), [Khronos OpenCL](https://www.khronos.org/opencl/) |

---

## Provenance

All content is scraped from public sources. No Adobe internal documents, no reverse-engineering, no NDA material.

**Primary sources:**
- [ae-plugins.docsforadobe.dev](https://ae-plugins.docsforadobe.dev/) — community-maintained C++ SDK guide
- [ae-scripting.docsforadobe.dev](https://ae-scripting.docsforadobe.dev/) — community-maintained ExtendScript guide
- [developer.adobe.com/after-effects](https://developer.adobe.com/after-effects/) — official Adobe developer portal
- [helpx.adobe.com release notes](https://helpx.adobe.com/after-effects/release-note/release-notes-after-effects.html)

Full source registry: [`source-registry.yaml`](source-registry.yaml) · Coverage report: [`COVERAGE.md`](COVERAGE.md)

---

## License

This knowledge base is a curated compilation of publicly-available technical documentation. Individual API signatures, structure definitions, and code samples are derived from Adobe's official and community-maintained After Effects SDK documentation and are subject to Adobe's terms of use.

The *compilation, organization, annotations, and cross-references* in this repository are released under [MIT License](LICENSE) for any use by AE developers.

**When in doubt about an API's canonical behavior, defer to the original source linked in each file's frontmatter.**

---

## Contributing

If you spot an out-of-date API, missing suite, or a new AE release worth digesting, open an issue or PR.

---

*Compiled for After Effects plugin and scripting developers. Not affiliated with Adobe Systems.*
