---
source: 'https://helpx.adobe.com/after-effects/release-note/release-notes-after-effects.html'
scraped: '2026-04-19'
api_provider: 'Adobe After Effects'
coverage: 'AE 26.0 (Jan 2026), 26.2 (April 2026) — no 26.1 release exists'
tags: [type/reference, topic/after-effects, topic/release-notes]
created: 2026-04-19
created-by: agent
created-session: 2026-04-19
---

# After Effects 26.x Release Notes — Developer Digest

> **Scope:** AE 26.0 (January 2026) and AE 26.2 (April 2026).
> **Finding:** No 26.1 release exists. Adobe skipped directly from 26.0 → 26.2. Multiple independent sources confirm this (VideoHelp version history, ProVideo Coalition, CG Channel).
> **SDK note:** The official AE C++ SDK guide (ae-plugins.docsforadobe.dev) documents changes only through v25.6 as of 2026-04-19 — no 26.x SDK changelog has been published. All API notes below are derived from cross-referencing feature announcements with known SDK surface area. Where no documented hook exists, this is stated explicitly.

---

## AE 26.0 (January 2026)

| Field | Detail |
|-------|--------|
| **Release date** | ~January 22, 2026 |
| **Build number** | Not publicly documented |
| **Official notes** | [helpx.adobe.com](https://helpx.adobe.com/after-effects/release-note/release-notes-after-effects.html) |
| **Platform min** | Windows 11, macOS 14.0+ |

### New Features

#### 1. Parametric 3D Meshes (Advanced 3D renderer)

Native support for primitive 3D shapes created and animated entirely within the timeline:

- **Shapes supported:** cube, sphere, cylinder, cone, torus, plane
- **Properties:** size, bevel, side count, open/capped ends, radial slicing
- **Materials:** color, roughness, metalness, emissivity, environment lighting
- **Lighting:** Spot and Parallel lights now cast shadows; "Accepts Lights" toggle per layer

Source: [Newsshooter](https://www.newsshooter.com/2026/01/22/whats-new-in-adobe-after-effects-26-0/), [CG Channel](https://www.cgchannel.com/2026/01/adobe-releases-after-effects-26-0-with-native-substance-support/)

#### 2. Substance 3D Material Integration

- Import procedural `.sbsar` material files directly into AE
- Access to 1,300+ free Substance community materials (Substars library)
- Keyframeable material parameters: texture offset, luminosity, contrast, hue

Source: [CG Channel](https://www.cgchannel.com/2026/01/adobe-releases-after-effects-26-0-with-native-substance-support/)

#### 3. SVG Import (Initial)

- Drag-and-drop SVG files; auto-converts to editable shape layers
- Preserves linear and radial gradients, strokes, and transparency
- **Limitation (26.0):** Freeform gradients not supported

Source: [Plugin Play](https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026)

#### 4. Variable Font Axis Animation

- Keyframe up to eight variable font axes per layer (weight, width, slant, etc.)
- Works with expressions — all axes are expression-accessible
- Custom expressions supported alongside standard keyframes

Source: [Newsshooter](https://www.newsshooter.com/2026/01/22/whats-new-in-adobe-after-effects-26-0/), [Plugin Play](https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026)

#### 5. Unmult Effect

- GPU-accelerated background removal for solid-color backgrounds
- Supports 8-bit, 16-bit, and 32-bit HDR footage
- Renders on GPU

Source: [Newsshooter](https://www.newsshooter.com/2026/01/22/whats-new-in-adobe-after-effects-26-0/)

#### 6. New Audio Effects

Three new built-in audio effects added:

- Gate
- Compressor
- Distortion

Source: [Plugin Play](https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026)

#### 7. Lossless Compressed Playback Cache

- Disk-based preview cache now stores lossless compressed frames
- Reduces disk usage; improves playback speed
- Transparent to users — no workflow change

Source: [Plugin Play](https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026)

#### 8. Windows on ARM (Native)

- Native WinARM binary support — effects not compiled for WinARM will not load in native mode
- **SDK note (v25.6):** The AE SDK v25.6 added WinARM build support; the 25.6 SDK changelog states: "The AE SDK now supports building effects for Windows on Arm natively." Only natively compiled effects will function when AE runs native on WinARM.
- Developers must recompile plugins with ARM64 target to maintain compatibility

Source: [ae-plugins.docsforadobe.dev — v25.6 SDK changelog](https://ae-plugins.docsforadobe.dev/intro/whats-new/)

#### 9. Improved Illustrator Layer Conversion

- Preserves gradient fills, strokes, and transparency during import
- Auto-crops composition to artwork bounds

Source: [Newsshooter](https://www.newsshooter.com/2026/01/22/whats-new-in-adobe-after-effects-26-0/)

#### 10. Per-Character Text Styling via Expressions

- Expression access to per-character text properties
- Enhanced expression keyframe referencing

Source: [Plugin Play](https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026)

#### 11. Reorganized Preferences Panel

- Structural reorg only — no new preferences added
- Enhanced accessibility modes and high-contrast support

Source: [Plugin Play](https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026)

### Plugin-Relevant API Changes (26.0)

| Change | SDK Hook | Status |
|--------|----------|--------|
| Parametric 3D mesh layer type | `AEGP_LayerSuite9 → AEGP_GetLayerObjectType` can return `AEGP_ObjectType_3D_MODEL` (established in SDK v25.2) | **Existing SDK surface — expanded scope in 26.0** |
| Substance `.sbsar` material import | No documented SDK hook — material pipeline is internal | User-facing only — no documented SDK hook |
| SVG import as shape layers | No new effect SDK API documented | User-facing only — no documented SDK hook |
| Variable font axis | Font properties are expression-accessible; no new C++ suite documented | Expressions only — no C++ plugin API change documented |
| Unmult effect (new built-in) | Built-in effect — no SDK equivalent; exists alongside custom keyer plugins | User-facing only — potential competition for keyer plugins |
| WinARM native mode | **Breaking for non-ARM plugins:** plugins not compiled for ARM64 silently ignored on native WinARM installs | **REQUIRES plugin developer action — recompile for ARM64** |
| GPU-rendered Unmult | GPU render path internal to the effect — no external GPU API change | User-facing only — no documented SDK hook |
| 3D shadow casting (Spot/Parallel) | Shadow state readable via existing `AEGP_LightSuite` and layer comp options | No new API — existing suites cover this |

### Deprecated Features (26.0)

No deprecations formally documented by Adobe for 26.0. The WinARM change is a **de facto deprecation** of x86-only plugin binaries on ARM hardware.

### Known Issues (26.0)

- Motion blur and depth of field **not available** for parametric 3D layers (deferred to future release)
- Inter-object 3D reflections **not implemented** (deferred)
- SVG freeform gradients **not supported** in this release
- Community reports of plugin loader errors (`"No loaders recognized this plugin"`) for C++ x64 DLLs compiled against SDK 25.6+ on AE 26.x — Adobe has not published updated PiPL documentation for 26.x as of 2026-04-19

Source: [Plugin Play](https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026), [Adobe Community](https://community.adobe.com/questions-529/request-for-official-guidance-on-building-after-effects-plugin-from-scratch-1551671)

---

## AE 26.1

**No 26.1 release exists.**

Adobe skipped from 26.0 (January 2026) directly to 26.2 (April 2026). This is consistent with Adobe's Creative Cloud release cadence, which sometimes skips minor version numbers. Confirmed by:

- VideoHelp version history database
- ProVideo Coalition (March 2026 Portal article — references only 26.0 and upcoming beta)
- CG Channel (26.2 announcement — no mention of 26.1)
- Web search: no results for "After Effects 26.1" with a release date

Features announced in beta during February–March 2026 (Quick Apply, Proportional Scrubbing, Object Matte, DoF, SVG enhancements) shipped in 26.2.

---

## AE 26.2 (April 2026)

| Field | Detail |
|-------|--------|
| **Release date** | April 15, 2026 |
| **Build number** | Not publicly documented (beta builds referenced as "26.2 build 27") |
| **Official notes** | [helpx.adobe.com](https://helpx.adobe.com/after-effects/release-note/release-notes-after-effects.html) |
| **Platform min** | Windows 11, macOS 14.0+ |

### New Features

#### 1. AI-Powered Object Matte

The most significant new feature. Replaces/supplements the Roto Brush workflow with a single-click AI subject isolation tool.

- **Selection modes:** one-click point selection, rectangle marquee, lasso marquee
- **Tracking:** "advanced segmentation logic for accurate propagation across frames"
- **Related tools:** Quick Selection (renamed from Roto Brush), Selection Brush (additive/subtractive strokes), Refine Edge (hair, fine detail)
- **AI backbone:** same model powering Premiere Pro's Object Mask
- **Limitation documented by Adobe:** automatic mattes may fail on complex elements — hair, motion blur, transparent objects; treat as starting point requiring inspection
- **Performance (community testing):** ~1 sec/frame for 4K footage on M2 Ultra; low GPU utilization reported

Source: [Adobe Community announcement](https://community.adobe.com/announcements-532/new-in-beta-object-matte-in-after-effects-1550754), [CG Channel 26.2](https://www.cgchannel.com/2026/04/adobe-releases-after-effects-26-2/), [Digital Production](https://digitalproduction.com/2026/04/17/adobe-after-effects-26-2-adds-object-matte-and-more/)

#### 2. Displacement Support for 3D Materials on Parametric Meshes

Extends the parametric 3D system introduced in 26.0:

- Height data from material channels physically deforms the mesh geometry
- Enables embossing, surface detailing, texture-driven mesh deformation
- Applied to the parametric primitives (cube, sphere, etc.) established in 26.0

Source: [ProVideo Coalition](https://www.provideocoalition.com/after-effect-26-2-april-2026-release/), [CG Channel 26.2](https://www.cgchannel.com/2026/04/adobe-releases-after-effects-26-2/)

#### 3. SVG Import Options (Enhanced)

Builds on 26.0's initial SVG import:

- **Import as Composition:** each SVG element becomes a separate, editable shape layer — vector-preserved
- **Import as Footage:** rasterizes the SVG into a single layer (simpler designs)
- Two distinct import paths give users control over editability vs. simplicity

Source: [ProVideo Coalition](https://www.provideocoalition.com/after-effect-26-2-april-2026-release/), [CG Channel 26.2](https://www.cgchannel.com/2026/04/adobe-releases-after-effects-26-2/)

#### 4. Quick Apply

Unified search panel for all effects, presets, and menu commands:

- Spotlight-style single search field
- Direct application from search results — no menu navigation
- Covers effects, animation presets, and top-level menu commands

Source: [ProVideo Coalition March 2026 Portal](https://www.provideocoalition.com/after-effects-portal-march-2026/), [Digital Production](https://digitalproduction.com/2026/04/17/adobe-after-effects-26-2-adds-object-matte-and-more/)

#### 5. Proportional Scrubbing

Multi-layer timeline interaction:

- Drag a property value; all selected layers adjust proportionally (not uniformly)
- Distribution by selection order — useful for cascade timing, gradient offsets
- Works without expressions

Source: [ProVideo Coalition](https://www.provideocoalition.com/after-effect-26-2-april-2026-release/), [Digital Production](https://digitalproduction.com/2026/04/17/adobe-after-effects-26-2-adds-object-matte-and-more/)

#### 6. Advanced 3D Renderer: Major Performance Improvements (Undocumented in Patch Notes)

Puget Systems independently benchmarked 26.2 vs. 26.0 and found **2–4x faster 3D rendering** with the Advanced 3D renderer. Adobe did not document this in official patch notes.

| GPU | Performance gain (26.2 vs 26.0) |
|-----|----------------------------------|
| Apple M3/M5 Max | ~3.8x |
| AMD Radeon 7900 XTX | ~2.5x |
| Intel Arc B580 | ~2.3x |
| NVIDIA RTX 3080 | ~1.1x |
| NVIDIA RTX 5080 | ~1.04x |

Adobe attributed gains to "under the hood 3D engine optimizations for AMD, Intel, and Mac GPUs."

Source: [Puget Systems benchmark](https://www.pugetsystems.com/blog/2026/04/16/after-effects-update-26-2-improved-puget-bench-3d-results/)

### Beta Features Announced but Not Yet Shipped in 26.2

Per ProVideo Coalition (March 2026 Portal):

- Depth of Field in Advanced 3D renderer (true in-engine DoF with full camera controls)
- Anchor point adjustment improvements
- Curl Noise effect
- Variable font filtering
- Clipboard frame copy with color management support

Source: [ProVideo Coalition March 2026 Portal](https://www.provideocoalition.com/after-effects-portal-march-2026/)

### Plugin-Relevant API Changes (26.2)

| Change | SDK Hook | Status |
|--------|----------|--------|
| Object Matte (AI masking) | Built on Premiere Pro's Object Mask AI — no C++ plugin API for accessing or extending the AI segmentation | User-facing only — no documented SDK hook |
| 3D Displacement on parametric meshes | Geometry deformation is internal to the renderer — not exposed via `AEGP_LayerSuite` or effect SDK | User-facing only — no documented SDK hook |
| SVG import as composition vs. footage | Import-time decision — no runtime API change; resulting layers are standard shape layers accessible via existing suites | User-facing only — shape layers accessible via existing SDK |
| Quick Apply | UI-only feature — no effect/plugin API | User-facing only — no documented SDK hook |
| Proportional Scrubbing | Timeline interaction only — no scripting or C++ API | User-facing only — no documented SDK hook |
| Advanced 3D engine optimizations (2–4x perf) | Render-path internal — improves throughput for effects applied to 3D layers without API change | **Passive benefit for plugins operating in 3D layer context** |
| Bug fixes (26.2 general) | VideoHelp notes "numerous bug fixes addressing crashes, rendering issues, and UI improvements across 3D workflows, text handling, and performance" — no itemized list available | No specific plugin-impacting fixes documented |

### Deprecated Features (26.2)

No formally documented deprecations for 26.2. The Object Matte tool supersedes the Roto Brush workflow for AI-assisted subjects — Roto Brush itself is not removed.

### Known Issues (26.2)

- Object Matte performance: community reports ~1 sec/frame on 4K footage even on M2 Ultra; low GPU/CPU utilization — suggests pipeline is not fully parallelized
- Aliasing artifacts in Object Matte propagation across frames reported in beta community testing
- Cache management concerns during Object Matte preview at mixed playback rates
- Motion blur and depth of field for 3D **still not in the shipping build** (DoF announced as beta-only)

Source: [Adobe Community announcement](https://community.adobe.com/announcements-532/new-in-beta-object-matte-in-after-effects-1550754)

---

## Plugin Developer Impact Summary

This section calls out which changes in AE 26.x require action or attention from plugin authors.

### 1. REQUIRED ACTION — Recompile for Windows on ARM (SDK 25.6+)

**Urgency: High**

AE 26.0 ships as a native WinARM binary. Plugins not compiled for ARM64 are silently ignored (`"No loaders recognized this plugin"`). This is not an error the user sees prominently — the plugin simply disappears.

- **Required:** Recompile plugin with ARM64 target using AE SDK 25.6+
- **SDK tool:** `ae-plugins.docsforadobe.dev` documents the WinARM build configuration
- **Testing:** Requires an ARM64 Windows machine or cross-compilation environment

### 2. MONITORING — Parametric 3D Layer Type (SDK v25.2+)

**Urgency: Medium — verify your layer-type checks**

Since SDK v25.2, `AEGP_GetLayerObjectType` can return `AEGP_ObjectType_3D_MODEL`. With 26.0 expanding parametric mesh use, plugins that enumerate layer types must handle this value or they may crash/skip layers unexpectedly.

- **Action:** Ensure any `AEGP_ObjectType` switch statements have a default/fallthrough case
- No new API — this extends the existing `AEGP_LayerSuite9`

### 3. WATCH — AI Object Matte (26.2) — No Plugin API, Potential Competition

**Urgency: Low — informational**

The Object Matte tool replaces manual Roto Brush workflows with AI. No C++ SDK or scripting API is exposed for controlling or extending this tool. Plugin developers building rotoscoping or masking tools should note:

- No way to hook into Object Matte's segmentation output
- The underlying AI is shared with Premiere Pro's Object Mask
- Treat as black-box user-facing feature — monitor for SDK exposure in future releases

### 4. PASSIVE BENEFIT — 3D Render Performance (26.2)

**Urgency: None — free gain**

The 2–4x Advanced 3D render speedup benefits plugins applied to 3D layers at no cost. If your plugin works in 3D layer context, it will run faster on AMD, Intel, and Apple Silicon GPUs. Note NVIDIA gains were minimal (1.0–1.1x).

### 5. MONITOR — SVG Import as Shape Layers (26.0 / 26.2)

**Urgency: Low**

SVG files now import as native shape layers. Plugins that process or manipulate shape layers may encounter a higher volume of SVG-sourced layers. No API change — existing shape layer suites apply. Watch for edge cases in complex gradient groups imported from SVG.

### 6. UNDOCUMENTED SDK CHANGELOG GAP

**Critical for SDK-dependent developers:**

The official `ae-plugins.docsforadobe.dev` "What's New" page covers SDK changes only through v25.6 as of 2026-04-19. **No SDK changes for AE 26.x are publicly documented.** Developers experiencing plugin load failures on AE 26.x should:

1. Check Adobe Developer community: [community.adobe.com/after-effects-526](https://community.adobe.com/after-effects-526)
2. File a case with Adobe Developer Support via `adobe.io/after-effects`
3. Review the AE SDK sample projects in the latest SDK download for any undocumented changes

---

## Sources

| Source | URL | Fetched |
|--------|-----|---------|
| Adobe Help — AE Release Notes | https://helpx.adobe.com/after-effects/release-note/release-notes-after-effects.html | 2026-04-19 (timeout — content via alternatives) |
| ProVideo Coalition — AE 26.2 | https://www.provideocoalition.com/after-effect-26-2-april-2026-release/ | 2026-04-19 |
| ProVideo Coalition — March 2026 Portal | https://www.provideocoalition.com/after-effects-portal-march-2026/ | 2026-04-19 |
| Plugin Play — AE 2026 | https://www.pluginplay.app/blog/whats-new-in-adobe-after-effects-2026 | 2026-04-19 |
| Newsshooter — AE 26.0 | https://www.newsshooter.com/2026/01/22/whats-new-in-adobe-after-effects-26-0/ | 2026-04-19 |
| CG Channel — AE 26.0 | https://www.cgchannel.com/2026/01/adobe-releases-after-effects-26-0-with-native-substance-support/ | 2026-04-19 |
| CG Channel — AE 26.2 | https://www.cgchannel.com/2026/04/adobe-releases-after-effects-26-2/ | 2026-04-19 |
| Digital Production — AE 26.2 | https://digitalproduction.com/2026/04/17/adobe-after-effects-26-2-adds-object-matte-and-more/ | 2026-04-19 |
| Puget Systems — AE 26.2 benchmarks | https://www.pugetsystems.com/blog/2026/04/16/after-effects-update-26-2-improved-puget-bench-3d-results/ | 2026-04-19 |
| Adobe Community — Object Matte beta | https://community.adobe.com/announcements-532/new-in-beta-object-matte-in-after-effects-1550754 | 2026-04-19 |
| AE SDK Guide — What's New | https://ae-plugins.docsforadobe.dev/intro/whats-new/ | 2026-04-19 |
| Adobe Community — Plugin build request | https://community.adobe.com/questions-529/request-for-official-guidance-on-building-after-effects-plugin-from-scratch-1551671 | 2026-04-19 |
| VideoHelp — AE version history | https://www.videohelp.com/software/Adobe-After-Effects/version-history | 2026-04-19 |
| Adobe Developer Blog | https://blog.developer.adobe.com/ | 2026-04-19 (no AE 26.x posts found) |
