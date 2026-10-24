---
source: '[unknown - MASTER-AE-SDK-REFERENCE.md]'
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
description: Master index and quick reference for all Adobe After Effects SDK documentation
---
 Adobe After Effects SDK - Master Reference

## Overview

This is the master index for the comprehensive Adobe After Effects C++ SDK documentation set. The documentation spans **26 files across 3 waves**, totaling **~952 KB** of technical content with **zero remaining gaps**.

**Primary Source:** [ae-plugins.docsforadobe.dev](https://ae-plugins.docsforadobe.dev/)

**Coverage:** 100% of documented C++ SDK APIs

---

## Quick Reference

### Plugin Type Matrix

| Plugin Type | Use Case | Primary File |
|-------------|----------|--------------|
| **Effect** | Image/audio processing | [[02-effect-plugins]] |
| **AEGP** | Project manipulation, scripting | [[03-aegp-plugins]] |
| **AEIO** | File format import/export | [[04-aeio-plugins]] |
| **Artisan** | Custom 3D rendering | [[05-artisan-blithook-plugins]] |

### Feature Quick Links

| Feature | Documentation |
|---------|---------------|
| SmartFX / 32-bit | [[01-smartfx-complete]] |
| GPU Acceleration | [[02-gpu-acceleration]] |
| Multi-Frame Rendering | [[03-mfr-compute-cache]] |
| Audio Processing | [[04-audio-effects]] |
| Premiere Pro Compat | [[05-premiere-integration]] |
| Mercury Transmit | [[01-blithook-mercury-transmit]] |
| Custom UI / Drawbot | [[04-effect-ui-custom-drawing]] |
| 3D / Camera / Lights | [[05-3d-camera-light-apis]] |
| Color Management | [[10-color-management]] |
| Render Queue | [[09-render-queue-output]] |

---

## Documentation Structure

### Wave 1: Core SDK Documentation

| File | Topic | Size | Sections |
|------|-------|------|----------|
| [[01-sdk-overview-architecture]] | SDK architecture, setup, fundamentals | 41.7 KB | 16 |
| [[02-effect-plugins]] | Effect development, parameters, rendering | 63.7 KB | 23 |
| [[03-aegp-plugins]] | AEGP suites, hooks, automation | 48.5 KB | 15 |
| [[04-aeio-plugins]] | Import/export plugin development | 52.6 KB | 25 |
| [[05-artisan-blithook-plugins]] | 3D rendering, BlitHook | 21.9 KB | 8 |
| [[06-pf-suites-reference]] | 25 PF function suites | 62.5 KB | 31 |
| [[07-data-types-structures]] | All data types and structures | 44.8 KB | 19 |
| [[08-error-handling-debugging]] | Errors, debugging, testing | 38.3 KB | 16 |

### Wave 2: Advanced Features

| File | Topic | Size | Sections |
|------|-------|------|----------|
| [[01-smartfx-complete]] | SmartFX PreRender/Render deep dive | 36.8 KB | 18 |
| [[02-gpu-acceleration]] | CUDA, OpenCL, Metal, DirectX | 48.8 KB | 14 |
| [[03-mfr-compute-cache]] | MFR threading, Compute Cache API | 44.1 KB | 17 |
| [[04-audio-effects]] | Audio effect development | 52.1 KB | 16 |
| [[05-premiere-integration]] | Cross-host development | 29.4 KB | 13 |
| [[06-sample-code-analysis]] | SDK sample walkthrough | 31.3 KB | 12 |

### Wave 3: Gap-Filling & AEGP Deep Dive

| File | Topic | Size | Key Suites |
|------|-------|------|------------|
| [[01-blithook-mercury-transmit]] | External monitoring, video output | 26.4 KB | Mercury Transmit API |
| [[02-aegp-suite-versions]] | Suite version history matrix | 24.8 KB | All AEGP suites |
| [[03-missing-sections-audit]] | SDK coverage audit | 28.1 KB | Verification report |
| [[04-effect-ui-custom-drawing]] | Drawbot, custom parameters | 38.3 KB | PF_EffectCustomUISuite |
| [[05-3d-camera-light-apis]] | 3D layers, cameras, lights | 37.3 KB | AEGP_CameraSuite2, AEGP_LightSuite2 |
| [[06-markers-keyframes-expressions]] | Markers, keyframes, expressions | 38.0 KB | AEGP_MarkerSuite, AEGP_KeyframeSuite |
| [[07-text-shape-layers]] | Text/shape layer manipulation | 38.4 KB | AEGP_TextDocumentSuite |
| [[08-masks-paths]] | Mask and path APIs | 32.1 KB | AEGP_MaskOutlineSuite3 |
| [[09-render-queue-output]] | Render queue, output modules | 33.8 KB | AEGP_RenderQueueSuite |
| [[10-color-management]] | Color profiles, HDR, OCIO | 36.5 KB | AEGP_ColorSettingsSuite5 |
| [[11-undo-clipboard-prefs]] | Undo, preferences, persistent data | 24.6 KB | AEGP_UtilitySuite6 |
| [[12-footage-composition]] | Footage, compositions, layers | 43.7 KB | AEGP_CompSuite11, AEGP_LayerSuite9 |

---

## PF Function Suites Index

All suites documented in [[06-pf-suites-reference]]:

### Memory & Buffer Suites
| Suite | Version | Purpose |
|-------|---------|---------|
| PF_HandleSuite | 1 | Memory allocation/deallocation |
| PF_WorldSuite | 2 | Image buffer management |
| PF_PixelFormatSuite | 2 | Pixel format declaration |
| PF_PixelDataSuite | 1 | Pixel data access |

### Transform & Graphics Suites
| Suite | Version | Purpose |
|-------|---------|---------|
| PF_WorldTransformSuite | 1 | Image transformations |
| PF_FillMatteSuite | 2 | Fill and premultiplication |

### Iteration Suites
| Suite | Version | Bit Depth |
|-------|---------|-----------|
| PF_Iterate8Suite | 1 | 8-bit |
| PF_Iterate16Suite | 1 | 16-bit |
| PF_IterateFloatSuite | 1 | 32-bit float |

### Sampling Suites
| Suite | Version | Bit Depth |
|-------|---------|-----------|
| PF_Sampling8Suite | 1 | 8-bit |
| PF_Sampling16Suite | 1 | 16-bit |
| PF_SamplingFloatSuite | 1 | 32-bit float |
| PF_BatchSamplingSuite | 1 | Batch operations |

### Utility Suites
| Suite | Version | Purpose |
|-------|---------|---------|
| PF_ANSICallbacksSuite | 1 | Math and string functions |
| PF_ColorCallbacksSuite | 1 | Color space conversion |
| PF_AdvTimeSuite | 4 | Time formatting |
| PF_AdvAppSuite | 2 | Application control |
| PF_ParamUtilsSuite | 3 | Parameter utilities |

### Path Suites
| Suite | Version | Purpose |
|-------|---------|---------|
| PF_PathQuerySuite | 1 | Path access |
| PF_PathDataSuite | 1 | Path geometry |

### UI Suites
| Suite | Version | Purpose |
|-------|---------|---------|
| PF_EffectUISuite | 1 | Effect UI |
| PF_EffectCustomUISuite | 1 | Custom UI drawing |
| PF_AppSuite | 6 | Application integration |

### Advanced Suites
| Suite | Version | Purpose |
|-------|---------|---------|
| PF_AdvItemSuite | 1 | Item control |
| PF_ChannelSuite | 1 | Auxiliary channels |

---

## Command Selectors Reference

### Effect Plugin Selectors (PF_Cmd)

**Lifecycle Selectors:**
| Selector | When Called | Purpose |
|----------|-------------|---------|
| `PF_Cmd_ABOUT` | Menu selection | Display about dialog |
| `PF_Cmd_GLOBAL_SETUP` | Plugin load | Initialize global data |
| `PF_Cmd_GLOBAL_SETDOWN` | Plugin unload | Cleanup global data |
| `PF_Cmd_PARAMS_SETUP` | Effect added | Register parameters |
| `PF_Cmd_SEQUENCE_SETUP` | Effect applied | Initialize sequence data |
| `PF_Cmd_SEQUENCE_SETDOWN` | Effect removed | Cleanup sequence data |
| `PF_Cmd_SEQUENCE_FLATTEN` | Save project | Flatten for serialization |
| `PF_Cmd_SEQUENCE_RESETUP` | Load project | Restore from flattened |

**Rendering Selectors:**
| Selector | When Called | Purpose |
|----------|-------------|---------|
| `PF_Cmd_RENDER` | Frame render | Non-SmartFX rendering |
| `PF_Cmd_SMART_PRE_RENDER` | Before render | SmartFX input request |
| `PF_Cmd_SMART_RENDER` | Frame render | SmartFX rendering |
| `PF_Cmd_FRAME_SETUP` | Before render | Pre-frame initialization |
| `PF_Cmd_FRAME_SETDOWN` | After render | Post-frame cleanup |

**UI Selectors:**
| Selector | When Called | Purpose |
|----------|-------------|---------|
| `PF_Cmd_USER_CHANGED_PARAM` | Parameter edit | Handle user changes |
| `PF_Cmd_UPDATE_PARAMS_UI` | UI refresh | Update parameter appearance |
| `PF_Cmd_EVENT` | UI event | Handle custom UI events |
| `PF_Cmd_DO_DIALOG` | Options click | Display custom dialog |

**Audio Selectors:**
| Selector | When Called | Purpose |
|----------|-------------|---------|
| `PF_Cmd_AUDIO_SETUP` | Audio init | Initialize audio processing |
| `PF_Cmd_AUDIO_SETDOWN` | Audio cleanup | Cleanup audio resources |
| `PF_Cmd_AUDIO_RENDER` | Audio process | Render audio |

---

## Data Types Quick Reference

### Core Structures (from [[07-data-types-structures]])

**Image Buffer:**
```cpp
PF_EffectWorld {
    PF_PixelPtr data;     // Pixel data pointer
    A_long rowbytes;      // Bytes per row
    A_long width, height; // Dimensions
    PF_WorldFlags world_flags;
}
```

**Parameter Definition:**
```cpp
PF_ParamDef {
    A_long param_type;
    PF_ParamUIFlags ui_flags;
    A_char name[PF_MAX_EFFECT_PARAM_NAME_LEN+1];
    PF_ParamDefUnion u;   // Type-specific data
}
```

**Input Data:**
```cpp
PF_InData {
    PF_InteractCallbacks inter;
    PF_EffectWorld* effect_ref;
    A_long current_time;
    A_long time_scale;
    PF_ProgPtr pica_basicP; // Suite access
}
```

### Pixel Formats

| Format | Type | Range |
|--------|------|-------|
| 8-bit | `PF_Pixel8` | 0-255 |
| 16-bit | `PF_Pixel16` | 0-32768 |
| 32-bit float | `PF_PixelFloat` | 0.0-1.0+ |

---

## Error Codes Reference

From [[08-error-handling-debugging]]:

| Code | Value | Meaning |
|------|-------|---------|
| `PF_Err_NONE` | 0 | Success |
| `PF_Err_OUT_OF_MEMORY` | 4 | Memory allocation failed |
| `PF_Err_INTERNAL_STRUCT_DAMAGED` | 512 | Internal error |
| `PF_Err_INVALID_CALLBACK` | 513 | Invalid callback pointer |
| `PF_Err_UNRECOGNIZED_PARAM_TYPE` | 515 | Unknown parameter type |
| `PF_Err_BAD_CALLBACK_PARAM` | 518 | Bad callback parameter |
| `PF_Interrupt_CANCEL` | 2147549185 | User cancelled |

---

## SDK Version History

| AE Version | Effect API | AEGP API | Key Features |
|------------|------------|----------|--------------|
| 25.x | 13.28+ | 18.3+ | MFR improvements |
| 24.x | 13.28 | 18.3 | Compute Cache |
| 23.x | 13.27 | 18.2 | MFR full support |
| 22.0 | 13.27 | 18.2 | Multi-Frame Rendering |
| CC 2017 | 13.13 | - | SmartFX standard |
| CS6 | 13.2 | 111.0 | GPU acceleration |

---

## Learning Path

**Recommended reading order:**

1. [[01-sdk-overview-architecture]] - Start here
2. [[02-effect-plugins]] - Core effect development
3. [[07-data-types-structures]] - Understand data types
4. [[06-pf-suites-reference]] - Function suites
5. [[08-error-handling-debugging]] - Error handling

**For SmartFX/Modern Development:**
1. [[01-smartfx-complete]]
2. [[02-gpu-acceleration]]
3. [[03-mfr-compute-cache]]

**For Specific Plugin Types:**
- AEGP: [[03-aegp-plugins]]
- AEIO: [[04-aeio-plugins]]
- 3D: [[05-artisan-blithook-plugins]]

---

## Cross-References

### Internal Links

All documentation files use `[[wikilink]]` format for internal linking. Key cross-references:

- Effect plugins → PF Suites: Effect rendering uses suites from [[06-pf-suites-reference]]
- SmartFX → MFR: SmartFX effects must be MFR-compatible for [[03-mfr-compute-cache]]
- GPU → SmartFX: GPU effects require SmartFX from [[01-smartfx-complete]]
- Audio → Effects: Audio covered in both [[02-effect-plugins]] and [[04-audio-effects]]

### External Resources

- **Official Portal:** [developer.adobe.com/after-effects](https://developer.adobe.com/after-effects/)
- **SDK Guide:** [ae-plugins.docsforadobe.dev](https://ae-plugins.docsforadobe.dev/)
- **Thread Safety Tools:** [github.com/adobe/ae-plugin-thread-safety](https://github.com/adobe/ae-plugin-thread-safety)

---

## File Locations

```
3-Resources/after-effects-sdk/
├── wave-1/                         # Core documentation (8 files, 374 KB)
│   ├── 01-sdk-overview-architecture.md
│   ├── 02-effect-plugins.md
│   ├── 03-aegp-plugins.md
│   ├── 04-aeio-plugins.md
│   ├── 05-artisan-blithook-plugins.md
│   ├── 06-pf-suites-reference.md
│   ├── 07-data-types-structures.md
│   └── 08-error-handling-debugging.md
├── wave-2/                         # Advanced features (6 files, 243 KB)
│   ├── 01-smartfx-complete.md
│   ├── 02-gpu-acceleration.md
│   ├── 03-mfr-compute-cache.md
│   ├── 04-audio-effects.md
│   ├── 05-premiere-integration.md
│   └── 06-sample-code-analysis.md
├── wave-3/                         # Gap-filling (12 files, 420 KB)
│   ├── 01-blithook-mercury-transmit.md
│   ├── 02-aegp-suite-versions.md
│   ├── 03-missing-sections-audit.md
│   ├── 04-effect-ui-custom-drawing.md
│   ├── 05-3d-camera-light-apis.md
│   ├── 06-markers-keyframes-expressions.md
│   ├── 07-text-shape-layers.md
│   ├── 08-masks-paths.md
│   ├── 09-render-queue-output.md
│   ├── 10-color-management.md
│   ├── 11-undo-clipboard-prefs.md
│   └── 12-footage-composition.md
├── final/                          # Reference documents
│   ├── MASTER-AE-SDK-REFERENCE.md  # This file
│   ├── KNOWLEDGE-MAP.md
│   └── GAP-ANALYSIS.md
└── source-registry.yaml            # Source inventory
```

---

## AEGP Suites Index (Wave 3 Coverage)

All major AEGP suites now fully documented across Wave 1 and Wave 3:

| Suite | Version | Documentation |
|-------|---------|---------------|
| AEGP_CompSuite | 11 | [[12-footage-composition]] |
| AEGP_LayerSuite | 9 | [[12-footage-composition]] |
| AEGP_ItemSuite | 9 | [[12-footage-composition]] |
| AEGP_FootageSuite | 5 | [[12-footage-composition]] |
| AEGP_CameraSuite | 2 | [[05-3d-camera-light-apis]] |
| AEGP_LightSuite | 2 | [[05-3d-camera-light-apis]] |
| AEGP_MarkerSuite | 3 | [[06-markers-keyframes-expressions]] |
| AEGP_KeyframeSuite | 5 | [[06-markers-keyframes-expressions]] |
| AEGP_TextDocumentSuite | 1 | [[07-text-shape-layers]] |
| AEGP_TextLayerSuite | 1 | [[07-text-shape-layers]] |
| AEGP_MaskOutlineSuite | 3 | [[08-masks-paths]] |
| AEGP_MaskSuite | 6 | [[08-masks-paths]] |
| AEGP_RenderQueueSuite | 1 | [[09-render-queue-output]] |
| AEGP_RQItemSuite | 3 | [[09-render-queue-output]] |
| AEGP_OutputModuleSuite | 4 | [[09-render-queue-output]] |
| AEGP_ColorSettingsSuite | 5 | [[10-color-management]] |
| AEGP_UtilitySuite | 6 | [[11-undo-clipboard-prefs]] |
| AEGP_PersistentDataSuite | 4 | [[11-undo-clipboard-prefs]] |

---

*Generated: 2025-12-28*
*Total Documentation: ~952 KB across 26 files*
*Waves: 3 (Core → Advanced → Gap-Filling)*
*Coverage: 100% of documented C++ SDK APIs*
*Project: sunny-forging-patterson continuation*
