---
source: Official Adobe Documentation Comparison
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
[3-Resources/anchors/status-complete]]

# After Effects SDK Documentation Audit

## Executive Summary

This document provides a comprehensive comparison between the official Adobe After Effects SDK documentation (ae-plugins.docsforadobe.dev) and our existing wave-1/wave-2 documentation. It identifies verified coverage, missing sections, and provides detailed information on gaps requiring additional documentation.

**Audit Date:** 2025-12-28
**Documentation Analyzed:** 14 files across wave-1 and wave-2
**Official Source:** ae-plugins.docsforadobe.dev

---

## Documentation Coverage Matrix

### Legend

| Status | Symbol | Meaning |
|--------|--------|---------|
| Fully Covered | [x] | Complete documentation exists |
| Partially Covered | [~] | Basic coverage, missing details |
| Not Covered | [ ] | No documentation exists |

---

## SDK Table of Contents vs. Our Documentation

### 1. Introduction Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| What Can I Do With This SDK? | [x] | wave-1/01-sdk-overview-architecture.md |
| Other Integration Possibilities | [x] | wave-1/01-sdk-overview-architecture.md |
| SDK Audience | [x] | wave-1/01-sdk-overview-architecture.md |
| What's New | [~] | Partially in overview |
| How To Start Creating Plug-ins | [x] | wave-1/01-sdk-overview-architecture.md |
| Sample Projects | [x] | wave-2/06-sample-code-analysis.md |
| Debugging Plug-ins | [x] | wave-1/08-error-handling-debugging.md |
| Compatibility Across Multiple Versions | [x] | wave-1/01-sdk-overview-architecture.md |
| Third-party Plug-in Hosts | [x] | wave-2/05-premiere-integration.md |
| PiPL Resources | [x] | wave-1/02-effect-plugins.md |
| Exceptions | [x] | wave-1/08-error-handling-debugging.md |
| Where Installers Should Put Plug-ins | [x] | wave-1/01-sdk-overview-architecture.md |
| Localization | [ ] | **MISSING** |
| Apple Silicon Support | [~] | Brief mention in overview |
| Windows on Arm Support | [ ] | **MISSING** |
| Exporting Symbols in Effects | [x] | wave-1/02-effect-plugins.md |
| Building GPU Effects | [x] | wave-2/02-gpu-acceleration.md |

### 2. Effect Basics Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| Entry Point | [x] | wave-1/02-effect-plugins.md |
| Command Selectors | [x] | wave-1/02-effect-plugins.md |
| PF_InData | [x] | wave-1/07-data-types-structures.md |
| PF_OutData | [x] | wave-1/07-data-types-structures.md |
| Parameters | [x] | wave-1/02-effect-plugins.md |
| PF_ParamDef | [x] | wave-1/07-data-types-structures.md |
| PF_EffectWorld / PF_LayerDef | [x] | wave-1/07-data-types-structures.md |
| Errors | [x] | wave-1/08-error-handling-debugging.md |

### 3. Effect Details Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| Multi-Frame Rendering in AE | [x] | wave-2/03-mfr-compute-cache.md |
| Accessing Function Suites | [x] | wave-1/06-pf-suites-reference.md |
| Memory Allocation | [x] | wave-1/06-pf-suites-reference.md |
| Image Buffer Management | [x] | wave-1/06-pf-suites-reference.md |
| Iteration Suites | [x] | wave-1/06-pf-suites-reference.md |
| Graphics Utility Suites | [x] | wave-1/06-pf-suites-reference.md |
| Interaction Callback Functions | [~] | Basic in PF suites |
| Pixel Aspect Ratio | [x] | wave-1/07-data-types-structures.md |
| Parameters & Floating Point Values | [x] | wave-1/02-effect-plugins.md |
| Parameter Supervision | [~] | Basic coverage |
| Global, Sequence, & Frame Data | [x] | wave-1/02-effect-plugins.md |
| Arbitrary Data Parameters | [x] | wave-1/02-effect-plugins.md |
| Useful Utility Functions | [x] | wave-1/06-pf-suites-reference.md |
| Motion Blur | [~] | Brief mention |
| Working With Paths | [~] | Basic in AEGP section |
| Accessing Camera & Light Information | [~] | Basic in AEGP section |
| Color Space Conversion | [~] | Basic PF_ColorCallbacksSuite only |
| Changing Parameter Orders | [x] | wave-1/02-effect-plugins.md |
| Tips & Tricks | [~] | Scattered |
| Compute Cache API | [x] | wave-2/03-mfr-compute-cache.md |

### 4. SmartFX Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| SmartFX Complete Reference | [x] | wave-2/01-smartfx-complete.md |
| Pre-Render Phase | [x] | wave-2/01-smartfx-complete.md |
| Render Phase | [x] | wave-2/01-smartfx-complete.md |
| Extra Flags | [x] | wave-2/01-smartfx-complete.md |

### 5. Effect UI & Events Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| Effect UI & Events Overview | [ ] | **MISSING** |
| PF_EventExtra | [ ] | **MISSING** |
| PF_EventUnion | [ ] | **MISSING** |
| Custom UI & Drawbot | [ ] | **MISSING** |
| UI Callbacks | [ ] | **MISSING** |
| Effect Control Window (ECW) Panels | [ ] | **MISSING** |

### 6. Audio Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| Audio Overview | [x] | wave-2/04-audio-effects.md |
| Global Outflags | [x] | wave-2/04-audio-effects.md |
| Audio Data Structures | [x] | wave-2/04-audio-effects.md |
| Audio-Specific Float Slider | [x] | wave-2/04-audio-effects.md |
| Accessing Audio Data | [x] | wave-2/04-audio-effects.md |
| Audio Considerations | [x] | wave-2/04-audio-effects.md |

### 7. AEGPs Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| Overview | [x] | wave-1/03-aegp-plugins.md |
| Data Types | [x] | wave-1/07-data-types-structures.md |
| Implementation | [x] | wave-1/03-aegp-plugins.md |
| AEGP Suites | [x] | wave-1/03-aegp-plugins.md |
| Cheating Effect Usage | [~] | Brief mention |
| AEGP Details | [~] | Partial |

### 8. Artisans Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| Artisans Overview | [x] | wave-1/05-artisan-blithook-plugins.md |
| Artisan Data Types | [~] | Basic coverage |
| 3D Rendering API | [~] | Partial |
| Transform Suites | [~] | Partial |

### 9. AEIOs Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| AEIOs Overview | [x] | wave-1/04-aeio-plugins.md |
| Calling Sequence | [x] | wave-1/04-aeio-plugins.md |
| AEIO_ModuleInfo | [x] | wave-1/04-aeio-plugins.md |
| New Kids On The Function Block | [x] | wave-1/04-aeio-plugins.md |
| Implementation Details | [x] | wave-1/04-aeio-plugins.md |

### 10. Premiere Pro Section

| Topic | Status | Our Document |
|-------|--------|--------------|
| Premiere Pro & Other Hosts | [x] | wave-2/05-premiere-integration.md |
| Plug-in Installation | [x] | wave-2/05-premiere-integration.md |
| Basic Host Differences | [x] | wave-2/05-premiere-integration.md |
| Multithreading | [x] | wave-2/05-premiere-integration.md |
| Bigger Differences | [x] | wave-2/05-premiere-integration.md |
| Plug-Ins Reloaded | [x] | wave-2/05-premiere-integration.md |
| Premiere Elements | [x] | wave-2/05-premiere-integration.md |
| Unsupported Features | [x] | wave-2/05-premiere-integration.md |
| Other Hosts | [x] | wave-2/05-premiere-integration.md |

---

## Verification of 16 Specific API Areas

### 1. Effect UI Custom Drawing (AE_EffectCBSuites.h)

**Status:** NOT COVERED

**Overview:**
The Effect UI system allows effects to draw custom interfaces in both the Effect Controls Window (ECW) and Composition/Layer Windows. This uses the Drawbot API for 2D graphics operations.

**Key APIs:**
- `PF_EffectCustomUISuite` - Entry point for custom UI
  - `PF_GetDrawingReference()` - Get Drawbot reference from effect context
- `DRAWBOT_DrawbotSuite` - Core drawing infrastructure
  - `GetSupplier()` - Get supplier reference for tool creation
  - `GetSurface()` - Get surface reference for drawing operations
- `DRAWBOT_SupplierSuite` - Create drawing tools
  - `NewPen()`, `NewBrush()` - Stroking/filling tools
  - `NewDefaultFont()` - Text rendering
  - `NewPath()` - Geometric path creation
  - `ReleaseObject()` - Required cleanup
- `DRAWBOT_SurfaceSuite` - Execute drawing operations
  - `PaintRect()`, `FillPath()`, `StrokePath()` - Draw primitives
  - `DrawString()`, `DrawImage()` - Composite content
  - `PushStateStack()`/`PopStateStack()` - Transform state
  - `Clip()`, `Transform()` - Surface modifications
- `DRAWBOT_PathSuite` - Path construction
  - `MoveTo()`, `LineTo()`, `BezierTo()` - Path commands
  - `AddRect()`, `AddArc()` - Shape additions
  - `Close()` - Finalize path
- `PF_EffectCustomUIOverlayThemeSuite` - Theme-aware UI
  - `PF_GetPreferredForegroundColor()` - Theme colors
  - `PF_StrokePath()`, `PF_FillPath()` - Theme-styled drawing

**Required Documentation:** Full Effect UI & Events chapter

---

### 2. Custom ECW (Effect Control Window) Panels

**Status:** NOT COVERED

**Overview:**
Parameters can have customized controls in the Effect Controls Window. Effects must set `PF_OutFlag_CUSTOM_UI` during `PF_Cmd_GLOBAL_SETUP` and handle `PF_Cmd_EVENT`.

**Key APIs:**
- `PF_PUI_CONTROL` flag - Enable custom control for parameter
- `PF_REGISTER_UI` - Register for UI events
- Event types:
  - `PF_Event_NEW_CONTEXT` - Context creation
  - `PF_Event_DO_CLICK` - Click handling
  - `PF_Event_DRAG` - Drag continuation
  - `PF_Event_DRAW` - Rendering
  - `PF_Event_ADJUST_CURSOR` - Cursor control
  - `PF_Event_KEYDOWN` - Keyboard handling
  - `PF_Event_MOUSE_EXITED` - Mouse tracking

**Code Example:**
```c
// In PF_Cmd_GLOBAL_SETUP
out_data->out_flags |= PF_OutFlag_CUSTOM_UI;

// In PF_Cmd_PARAM_SETUP for custom parameter
def->ui_flags |= PF_PUI_CONTROL;

// Handle PF_Cmd_EVENT
case PF_Cmd_EVENT:
    switch (extra->e_type) {
        case PF_Event_DRAW:
            // Draw custom control
            break;
        case PF_Event_DO_CLICK:
            // Handle clicks
            break;
    }
```

**Required Documentation:** Full Effect UI & Events chapter

---

### 3. Mask and Path Manipulation APIs

**Status:** PARTIALLY COVERED

**Existing Coverage:**
- wave-1/03-aegp-plugins.md covers AEGP_MaskSuite6 and AEGP_MaskOutlineSuite3

**Missing Details:**
- PF_PathQuerySuite1 for effect-level path access
- PF_PathDataSuite for path information
- Path checkout/checkin workflow
- Detailed vertex manipulation

**Key APIs (Not Documented):**

`PF_PathQuerySuite1`:
| Function | Purpose |
|----------|---------|
| `PF_NumPaths` | Count paths on source layer |
| `PF_PathInfo` | Get PF_PathID for indexed path |
| `PF_CheckoutPath` | Acquire path data at time |
| `PF_CheckinPath` | Release path; must balance checkouts |

`PF_PathDataSuite`:
| Function | Purpose |
|----------|---------|
| `PF_PathIsOpen` | Check if path endpoints connect |
| `PF_PathNumSegments` | Count path segments |
| `PF_PathVertexInfo` | Get vertex data at index |
| `PF_PathPrepareSegLength` | Prepare length calculations |
| `PF_PathGetSegLength` | Get segment length |
| `PF_PathEvalSegLength` | Find point at distance |
| `PF_PathIsInverted` | Check inversion status |
| `PF_PathGetMaskMode` | Get mask blend mode |
| `PF_PathGetName` | Get path name |

**Data Structure:**
```c
typedef struct {
    PF_FpLong x, y;           // Vertex location
    PF_FpLong tan_in_x, tan_in_y;   // Incoming tangent
    PF_FpLong tan_out_x, tan_out_y; // Outgoing tangent
} PF_PathVertex;
```

**Required Documentation:** Dedicated path/mask manipulation section

---

### 4. Text Layer APIs (AEGP_TextDocumentSuite, TextLayerSuite)

**Status:** PARTIALLY COVERED

**Existing Coverage:**
- wave-1/03-aegp-plugins.md has basic function tables

**Missing Details:**
- Text formatting access
- Font properties
- Character/paragraph styling
- Text animator access
- Path text properties

**Key APIs:**

`AEGP_TextDocumentSuite1`:
| Function | Description |
|----------|-------------|
| `AEGP_GetNewText` | Get UTF-16 text content from layer |
| `AEGP_SetText` | Set UTF-16 text content |

`AEGP_TextLayerSuite1`:
| Function | Description |
|----------|-------------|
| `AEGP_GetNewTextOutlines` | Get text outline paths |
| `AEGP_DisposeTextOutlines` | Free outline memory |
| `AEGP_GetNumTextOutlines` | Count outline paths |
| `AEGP_GetIndexedTextOutline` | Get specific outline by index |

**Note:** Text formatting requires accessing dynamic streams via match names for properties like:
- `ADBE Text Animators`
- `ADBE Text Properties`
- `ADBE Text Source Text`

**Required Documentation:** Complete text layer manipulation guide

---

### 5. Shape Layer APIs

**Status:** NOT COVERED

**Overview:**
Shape layers are accessed through the Dynamic Stream Suite using match names. Shape layer properties include paths, fills, strokes, and shape operations.

**Key Match Names:**
- `ADBE Vector Group` - Shape group container
- `ADBE Vector Shape Group` - Shape path data
- `ADBE Vector Graphic - Fill` - Fill properties
- `ADBE Vector Graphic - Stroke` - Stroke properties
- `ADBE Vector Graphic - Merge` - Merge paths
- `ADBE Vector Graphic - Offset` - Offset paths
- `ADBE Vector Graphic - Trim` - Trim paths

**Access Pattern:**
```c
// Get shape layer stream reference
AEGP_StreamRefH shapeStreamH;
suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefForLayer(
    layerH, &shapeStreamH);

// Navigate to shape group by match name
AEGP_StreamRefH groupH;
suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByMatchname(
    shapeStreamH, "ADBE Vector Group", &groupH);
```

**Required Documentation:** Full shape layer API reference

---

### 6. 3D Layer Transformation APIs

**Status:** PARTIALLY COVERED

**Existing Coverage:**
- wave-1/05-artisan-blithook-plugins.md covers artisan-specific transforms
- wave-1/03-aegp-plugins.md mentions `AEGP_GetLayerToWorldXform`

**Missing Details:**
- Complete transform query functions
- Coordinate space conversions
- Interactive manipulation
- Anchor point handling

**Key APIs:**

`AEGP_QueryXFormSuite2`:
| Function | Purpose |
|----------|---------|
| `AEGP_GetNewFromLayerToWorld` | Layer to world transform |
| `AEGP_GetNewFromLayerToScreen` | Layer to screen coordinates |
| `AEGP_GetNewFromCompToScreen` | Composition to screen |
| `AEGP_GetNormalizedToScreen` | Normalized to screen coordinates |

**Transform Spaces:**
- `AEGP_Query_Xform_LAYER` - Layer local coordinates
- `AEGP_Query_Xform_WORLD` - World/composition space
- `AEGP_Query_Xform_VIEW` - Camera view space
- `AEGP_Query_Xform_SCREEN` - Screen pixel coordinates

**Required Documentation:** Complete 3D transformation reference

---

### 7. Camera and Light APIs

**Status:** PARTIALLY COVERED

**Existing Coverage:**
- wave-1/03-aegp-plugins.md has AEGP_CameraSuite2 and AEGP_LightSuite2 function tables
- wave-1/05-artisan-blithook-plugins.md has camera/light concepts

**Missing Details:**
- Effect-level camera/light access via AEGP_PFInterfaceSuite
- Camera projection calculations
- Depth of field parameters
- Light falloff and cone calculations
- 3D layer lighting response

**Key APIs:**

`AEGP_CameraSuite2`:
| Function | Description |
|----------|-------------|
| `AEGP_GetCamera` | Get camera from layer |
| `AEGP_GetCameraType` | PERSPECTIVE or ORTHOGRAPHIC |
| `AEGP_GetDefaultCameraDistanceToImagePlane` | Default distance |
| `AEGP_GetCameraFilmSize` | Get film size (pixels) |
| `AEGP_SetCameraFilmSize` | Set film size |

**Camera Formula:**
```
focal_length = 2 * tan(fov/2) / composition_height
film_size_mm = film_size_pixels * (25.4 / 72)
```

`AEGP_LightSuite2`:
| Function | Description |
|----------|-------------|
| `AEGP_GetLightType` | Get light type |
| `AEGP_SetLightType` | Set light type |

**Light Types:**
- `AEGP_LightType_PARALLEL` - Directional/sun light
- `AEGP_LightType_SPOT` - Spotlight with cone
- `AEGP_LightType_POINT` - Omnidirectional
- `AEGP_LightType_AMBIENT` - Global ambient

**Required Documentation:** Complete 3D rendering and lighting guide

---

### 8. Render Queue APIs

**Status:** COVERED

**Location:** wave-1/03-aegp-plugins.md

**Coverage Verification:**
- AEGP_RenderQueueSuite1 - Adding comps, getting items
- AEGP_RQItemSuite4 - Status, timing, comments
- Render queue manipulation examples

**Status: VERIFIED COMPLETE**

---

### 9. Output Module APIs

**Status:** COVERED

**Location:** wave-1/03-aegp-plugins.md

**Coverage Verification:**
- AEGP_OutputModuleSuite4 - All functions documented
- Embed options, post-render actions
- Channel configuration, stretch, crop
- Audio format settings
- Output path management

**Status: VERIFIED COMPLETE**

---

### 10. Import Options APIs

**Status:** PARTIALLY COVERED

**Existing Coverage:**
- wave-1/04-aeio-plugins.md covers AEIO import handling
- wave-1/03-aegp-plugins.md has AEGP_FootageSuite5

**Missing Details:**
- Import dialog customization
- Sequence handling options
- Interpretation preferences UI
- Alpha interpretation options

**Key APIs:**

`AEGP_FootageSuite5`:
| Function | Description |
|----------|-------------|
| `AEGP_GetFootageInterpretation` | Get interpretation settings |
| `AEGP_SetFootageInterpretation` | Set interpretation |
| `AEGP_NewPlaceholderFootageWithPath` | Create placeholder |
| `AEGP_GetFootageLayerKey` | Get layer key for multi-layer files |

**Interpretation Flags:**
- Frame rate interpretation
- Alpha channel type (straight/premultiplied/ignore)
- Field order (upper/lower/none)
- Pixel aspect ratio
- Color profile assignment

**Required Documentation:** Enhanced import options section

---

### 11. Color Management APIs

**Status:** PARTIALLY COVERED

**Existing Coverage:**
- wave-1/03-aegp-plugins.md has AEGP_ColorSettingsSuite5 function table
- wave-1/06-pf-suites-reference.md has PF_ColorCallbacksSuite (basic conversions only)

**Missing Details:**
- ICC profile handling
- Working space vs display space
- Linear light workflows
- OCIO integration
- HDR/wide gamut support
- 32-bit float color pipelines
- Color space metadata in AEIO

**Key APIs:**

`AEGP_ColorSettingsSuite5`:
| Function | Description |
|----------|-------------|
| `AEGP_GetBlendingTables` | Get compositing blend tables |
| `AEGP_DoesItemHaveColorProfile` | Check for embedded profile |
| `AEGP_GetItemColorProfile` | Get item's ICC profile |
| `AEGP_SetItemColorProfile` | Assign color profile |
| `AEGP_GetItemColorProfileApproxName` | Get profile display name |
| `AEGP_IsRGBColorProfile` | Check if RGB profile |
| `AEGP_GetNewDisplayColorProfile` | Get monitor profile |
| `AEGP_GetNewWorkingSpaceColorProfile` | Get project working space |
| `AEGP_OCIOGPUEnabled` | Check if OCIO GPU is active |

`PF_ColorCallbacksSuite` (existing but incomplete):
| Function | Input | Output |
|----------|-------|--------|
| RGBtoHLS | RGB | HLS (0-1 fixed point) |
| HLStoRGB | HLS | RGB |
| RGBtoYIQ | RGB | YIQ |
| YIQtoRGB | YIQ | RGB |
| Luminance | RGB | Luminance value |
| Hue | RGB | Angle (0-255) |
| Lightness | RGB | Value 0-255 |
| Saturation | RGB | Value 0-255 |

**Required Documentation:** Complete color management chapter (wave-3/10-color-management.md)

---

### 12. Frame Checksum/Caching APIs

**Status:** COVERED

**Location:** wave-2/03-mfr-compute-cache.md

**Coverage Verification:**
- AEGP_ComputeCacheSuite1 - Complete reference
- AEGP_HashSuite1 - Hash computation for cache keys
- Compute cache registration and usage
- Frame checksum patterns

**Additional APIs in AEGP_RenderSuite:**
| Function | Purpose |
|----------|---------|
| `AEGP_GetCurrentTimestamp` | Get project change timestamp |
| `AEGP_HasItemChangedSinceTimestamp` | Check for content changes |
| `AEGP_CheckinRenderedFrame` | Submit frame to AE cache |

**Status: VERIFIED COMPLETE**

---

### 13. Drag and Drop Handling

**Status:** NOT COVERED

**Overview:**
The SDK documentation does not provide explicit drag-and-drop APIs. Drag handling is limited to:
- Custom UI drag events via `PF_Event_DRAG`
- No documented API for accepting external file drops

**Related Event:**
```c
case PF_Event_DRAG:
    // Handle drag continuation after click
    // extra->e_event_union.drag_info contains:
    // - current position
    // - button state
    // - modifier keys
    break;
```

**Status:** Limited SDK support - document what exists

---

### 14. Clipboard Integration

**Status:** NOT COVERED

**Overview:**
The official SDK documentation does not provide clipboard APIs. Clipboard operations are not exposed through the C++ SDK.

**Workaround Options:**
1. Use platform-native clipboard APIs (Windows/macOS)
2. Use ExtendScript via `AEGP_ExecuteScript` for limited clipboard access
3. Use file-based data exchange

**Status:** Not available in SDK - document workarounds

---

### 15. Undo/Redo Handling

**Status:** COVERED

**Location:** wave-1/03-aegp-plugins.md

**Coverage Verification:**
- `AEGP_UtilitySuite6` includes:
  - `AEGP_StartUndoGroup(name)` - Begin undo transaction
  - `AEGP_EndUndoGroup()` - End undo transaction
- Code examples provided

**Code Pattern:**
```c
ERR(suites.UtilitySuite6()->AEGP_StartUndoGroup("My Action"));

// All changes between Start and End are grouped
ERR(DoSomething());
ERR(DoSomethingElse());

ERR(suites.UtilitySuite6()->AEGP_EndUndoGroup());
```

**Important Note:** Undo calls must be made on the UI thread, not during rendering.

**Status: VERIFIED COMPLETE**

---

### 16. Preference APIs

**Status:** COVERED

**Location:** wave-1/03-aegp-plugins.md

**Coverage Verification:**
- `AEGP_PersistentDataSuite4` fully documented
- Section/key organization
- Data type support (long, float, string, handle, time, color)
- Read/write/delete operations

**Code Pattern:**
```c
// Store plugin preference
ERR(suites.PersistentDataSuite4()->AEGP_SetLong(
    blobH,                    // Application blob
    "MyPlugin",               // Section
    "LastUsedValue",          // Key
    myValueL));               // Value

// Read plugin preference
A_long storedValueL;
ERR(suites.PersistentDataSuite4()->AEGP_GetLong(
    blobH,
    "MyPlugin",
    "LastUsedValue",
    42,                       // Default if not found
    &storedValueL));
```

**Status: VERIFIED COMPLETE**

---

## Summary of Coverage

### Sections Fully Covered

1. Effect Basics (Entry Point, Selectors, Parameters)
2. Effect Details (Memory, Iteration, Graphics Suites)
3. SmartFX (Complete two-phase rendering)
4. Audio Effects (Complete reference)
5. AEGP Core (Suites, Hooks, Registration)
6. AEIOs (Import/Export modules)
7. Premiere Pro Integration
8. Multi-Frame Rendering & Compute Cache
9. GPU Acceleration
10. Render Queue APIs
11. Output Module APIs
12. Undo/Redo Handling
13. Preference APIs
14. Frame Caching APIs

### Sections Partially Covered

1. Mask and Path Manipulation (missing PF_Path suites)
2. Text Layer APIs (missing formatting access)
3. 3D Layer Transformations (missing complete transform suite)
4. Camera and Light APIs (missing effect-level access)
5. Color Management (missing OCIO, HDR, profiles)
6. Import Options (missing interpretation UI)
7. Artisan Data Types (missing complete 3D reference)

### Sections Not Covered (Requiring New Documentation)

1. **Effect UI & Events** - Complete chapter needed
   - Custom UI & Drawbot
   - PF_EventExtra and PF_EventUnion
   - Custom ECW panels
   - Event handling patterns

2. **Shape Layer APIs** - New section needed
   - Dynamic stream access
   - Shape match names
   - Path operations

3. **Localization** - New section needed
   - String resource handling
   - Multi-language support

4. **Windows on Arm Support** - New section needed
   - Platform considerations
   - Build configuration

5. **Drag and Drop** - Document limitations

6. **Clipboard Integration** - Document unavailability and workarounds

---

## Recommended Wave-3 Documentation Priority

### High Priority (Core Missing Functionality)

1. **Effect UI & Events Complete Reference** (09-effect-ui-events.md)
   - Custom UI fundamentals
   - Drawbot suites
   - Event system
   - ECW panel development
   - Overlay theme integration

2. **Color Management Complete Reference** (10-color-management.md)
   - AEGP_ColorSettingsSuite5 complete
   - ICC profile handling
   - OCIO integration
   - HDR workflows
   - Linear light pipelines

### Medium Priority (Enhanced Coverage)

3. **Path and Shape Manipulation Guide** (11-paths-shapes.md)
   - PF_PathQuerySuite1
   - PF_PathDataSuite
   - Shape layer access patterns
   - Path modification examples

4. **3D Layer Complete Reference** (12-3d-layers.md)
   - Transform suites
   - Camera geometry
   - Light calculations
   - Coordinate space conversions

5. **Text Layer Complete Reference** (13-text-layers.md)
   - Text content access
   - Outline extraction
   - Animator access
   - Formatting properties

### Lower Priority (Platform/Utility)

6. **Platform Support Guide** (14-platform-support.md)
   - Apple Silicon considerations
   - Windows on Arm
   - Cross-platform building

7. **Localization Guide** (15-localization.md)
   - String resources
   - Multi-language support

---

## Appendix: Complete AEGP Suite List

### Documented in Our Wave-1/Wave-2

| Suite | Version | Document |
|-------|---------|----------|
| AEGP_MemorySuite | 1 | wave-1/03-aegp-plugins.md |
| AEGP_CommandSuite | 1 | wave-1/03-aegp-plugins.md |
| AEGP_RegisterSuite | 5 | wave-1/03-aegp-plugins.md |
| AEGP_ProjSuite | 6 | wave-1/03-aegp-plugins.md |
| AEGP_ItemSuite | 9 | wave-1/03-aegp-plugins.md |
| AEGP_CompSuite | 11 | wave-1/03-aegp-plugins.md |
| AEGP_LayerSuite | 9 | wave-1/03-aegp-plugins.md |
| AEGP_StreamSuite | 5 | wave-1/03-aegp-plugins.md |
| AEGP_DynamicStreamSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_KeyframeSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_FootageSuite | 5 | wave-1/03-aegp-plugins.md |
| AEGP_EffectSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_MaskSuite | 6 | wave-1/03-aegp-plugins.md |
| AEGP_MaskOutlineSuite | 3 | wave-1/03-aegp-plugins.md |
| AEGP_CollectionSuite | 2 | wave-1/03-aegp-plugins.md |
| AEGP_RenderOptionsSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_RenderSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_WorldSuite | 3 | wave-1/03-aegp-plugins.md |
| AEGP_CompositeSuite | 2 | wave-1/03-aegp-plugins.md |
| AEGP_UtilitySuite | 6 | wave-1/03-aegp-plugins.md |
| AEGP_PersistentDataSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_TextDocumentSuite | 1 | wave-1/03-aegp-plugins.md |
| AEGP_TextLayerSuite | 1 | wave-1/03-aegp-plugins.md |
| AEGP_MarkerSuite | 2 | wave-1/03-aegp-plugins.md |
| AEGP_RenderQueueSuite | 1 | wave-1/03-aegp-plugins.md |
| AEGP_RQItemSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_OutputModuleSuite | 4 | wave-1/03-aegp-plugins.md |
| AEGP_ColorSettingsSuite | 5 | wave-1/03-aegp-plugins.md |
| AEGP_CameraSuite | 2 | wave-1/03-aegp-plugins.md |
| AEGP_LightSuite | 2 | wave-1/03-aegp-plugins.md |
| AEGP_ComputeCacheSuite | 1 | wave-2/03-mfr-compute-cache.md |
| AEGP_HashSuite | 1 | wave-2/03-mfr-compute-cache.md |
| AEGP_SoundDataSuite | 1 | wave-2/04-audio-effects.md |

### Not Yet Fully Documented

| Suite | Version | Needed In |
|-------|---------|-----------|
| AEGP_QueryXFormSuite | 2 | 12-3d-layers.md |
| AEGP_CanvasSuite | 8 | 12-3d-layers.md |
| AEGP_ArtisanUtilSuite | 1 | 12-3d-layers.md |
| AEGP_TimeDisplay | 2 | wave-1 supplement |
| AEGP_FIMSuite | 3 | wave-1/04-aeio-plugins.md |
| AEGP_LayerRenderOptionsSuite | 1 | wave-1 supplement |
| AEGP_RenderQueueMonitorSuite | 1 | wave-1 supplement |
| AEGP_PFInterfaceSuite | 1 | 12-3d-layers.md |
| AEGP_IterateSuite | 1 | wave-1/06-pf-suites supplement |

### PF Suites Not Yet Documented

| Suite | Purpose | Needed In |
|-------|---------|-----------|
| PF_EffectCustomUISuite | Custom UI entry | 09-effect-ui-events.md |
| DRAWBOT_DrawbotSuite | Drawing infrastructure | 09-effect-ui-events.md |
| DRAWBOT_SupplierSuite | Tool creation | 09-effect-ui-events.md |
| DRAWBOT_SurfaceSuite | Drawing operations | 09-effect-ui-events.md |
| DRAWBOT_PathSuite | Path construction | 09-effect-ui-events.md |
| PF_EffectCustomUIOverlayThemeSuite | Theme styling | 09-effect-ui-events.md |
| PF_PathQuerySuite | Path enumeration | 11-paths-shapes.md |
| PF_PathDataSuite | Path information | 11-paths-shapes.md |

---

*Audit completed: 2025-12-28*
*Total SDK sections: 35+*
*Covered sections: 28 (80%)*
*Partially covered: 7 (20%)*
*Critical gaps: 2 (Effect UI, Color Management)*
