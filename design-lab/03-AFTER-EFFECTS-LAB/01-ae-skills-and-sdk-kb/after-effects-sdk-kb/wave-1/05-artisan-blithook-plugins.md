---
source: Adobe After Effects SDK Official Documentation
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Adobe After Effects SDK: Artisan and BlitHook Plugins

## Executive Summary

This document provides comprehensive documentation for two specialized plugin types within the Adobe After Effects SDK: **Artisan plugins** for 3D rendering and **BlitHook plugins** for external video output. These represent advanced integration points that allow developers to extend After Effects' core rendering and output capabilities.

Artisan plugins enable complete takeover of 3D layer rendering, while BlitHook plugins (now superseded by Mercury Transmit) facilitate broadcast-quality video monitoring through external hardware. Both plugin types operate as AEGPs (After Effects General Plug-ins) and require deep integration with After Effects' internal architecture.

---

## Part 1: Artisan Plugins (3D Rendering)

### 1.1 Overview and Purpose

Artisan plugins are the most complex and powerful plugin type in the After Effects SDK. An Artisan is essentially an application unto itself, providing a complete 3D rendering implementation that replaces After Effects' built-in 3D renderer.

The Artisan API exposes function hooks necessary for a plug-in to provide rendered output of 3D layers, taking over completely from After Effects (which still handles all rendering of 2D layers). There can be only one Artisan per composition, chosen from within the Composition Settings dialog (Advanced tab > Rendering Plug-in dropdown).

Adobe recognized early in After Effects 5.0 development that there are many valid approaches to 3D rendering problems such as intersections and shading. Rather than enforce a single solution, they provided the Artisan API so that both Adobe and third parties could implement any desired 3D rendering scheme.

**Important Warning:** The SDK published by Adobe is outdated for the 3D Artisan API. A second-generation Artisan 3D API (artisan-2-api) exists but is not included in the official SDK. This requires additional headers like `PR_Feature.h` which must be obtained by contacting Adobe's AE SDK team directly.

### 1.2 Artisan Architecture

#### 1.2.1 Plugin Type Classification

An Artisan is an AEGP (After Effects General Plug-in) with a single entry point. Unlike standard effects, Artisans must register their own function entry points through a special callback mechanism.

There are two variants of Artisan plugins:

1. **Standard Artisans**: Handle 3D layer rendering and request layer information from After Effects. They render during both preview and final output.

2. **Interactive Artisans**: Handle ALL layers in a composition (not just 3D layers) and operate only for onscreen display during preview, never for final rendering output.

#### 1.2.2 Entry Point Structure

Artisans use the `PR_ArtisanEntryPoints` structure to define their callback functions. Only the `render_func` is required; all other functions are optional:

| Function Pointer | Purpose | Required |
|------------------|---------|----------|
| `global_setup_func0` | Initialize global artisan resources | No |
| `global_setdown_func0` | Clean up global artisan resources | No |
| `global_do_about_func0` | Display about dialog | No |
| `pre_render_func0` | Prepare for rendering | No |
| `render_func` | Main rendering function | **Yes** |
| `query_func0` | Respond to transform queries | No |
| `instance_setup_func0` | Per-instance initialization | No |
| `instance_setdown_func0` | Per-instance cleanup | No |
| `frame_setup_func0` | Per-frame setup | No |
| `frame_teardown_func0` | Per-frame cleanup | No |

### 1.3 Registration and Lifecycle

#### 1.3.1 Registering an Artisan

Artisans must register with After Effects using `AEGP_RegisterArtisan()` from `AEGP_RegisterSuite5`. The registration requires:

```cpp
AEGP_RegisterArtisan(
    A_Version api_version,           // SDK version
    A_Version artisan_version,       // Plugin version
    long aegp_plugin_id,             // Plugin identifier
    void *aegp_refconPV,             // Reference constant
    const A_char *match_nameZ,       // Internal match name
    const A_char *artisan_nameZ,     // Display name
    PR_ArtisanEntryPoints *entry_funcsP  // Function pointers
);
```

For Interactive Artisans, use `AEGP_RegisterInteractiveArtisan()` with an identical parameter signature.

#### 1.3.2 Lifecycle Flow

1. **Global Setup** (`global_setup_func0`): Called once when the Artisan is first loaded. Allocate global resources here.

2. **Instance Setup** (`instance_setup_func0`): Called when the Artisan is selected for a composition. Initialize per-composition state.

3. **Frame Setup** (`frame_setup_func0`): Called before rendering each frame. Prepare per-frame resources.

4. **Render** (`render_func`): Called to render the 3D scene. This is where the core rendering logic resides.

5. **Frame Teardown** (`frame_teardown_func0`): Called after rendering each frame. Release per-frame resources.

6. **Instance Teardown** (`instance_setdown_func0`): Called when the Artisan is deselected. Clean up per-composition state.

7. **Global Teardown** (`global_setdown_func0`): Called when After Effects exits. Release global resources.

### 1.4 3D Data Structure Access

#### 1.4.1 Core Data Types

| Type | Purpose |
|------|---------|
| `AEGP_RenderLayerContextH` | State information at the time of a render request |
| `PR_RenderContextH` | Collection of settings defining what to render and how |
| `AEGP_WorldH` | Frame of pixels (image buffer) |
| `AEGP_RenderReceiptH` | Receipt for rendered content |
| `AEGP_FrameReceiptH` | Reference to a rendered frame |
| `AEGP_RenderOptionsH` | Settings for render queue items |
| `AEGP_SoundDataH` | Audio settings for a layer |

#### 1.4.2 Coordinate System

After Effects uses a specific coordinate system for 3D rendering:

- **X-axis**: Positive to the right
- **Y-axis**: Positive downward
- **Z-axis**: Positive into the screen
- **Origin**: Upper-left corner

**Matrix conventions:**
- After Effects uses row-based matrices (OpenGL uses column-based)
- Translation is stored in the bottom row
- Orientations are quaternions (applied first)
- Rotations are applied in order: X, then Y, then Z

**Best Practice:** Use either orientation OR rotation, but not both together.

#### 1.4.3 Pixel Aspect Ratio Handling

Before rendering, the built-in Artisans apply an inverse transform to get square pixels, then re-apply the transform before display. For example:

- If pixel aspect ratio is 10/11 (DV NTSC)
- Multiply by 11/10 to get square pixels
- Process and composite 3D layers
- Divide by 10/11 to return to original aspect ratio

### 1.5 Camera Suite (AEGP_CameraSuite2)

The Camera Suite provides access to camera properties for 3D rendering.

#### 1.5.1 Camera Types

| Type | Description |
|------|-------------|
| `AEGP_CameraType_PERSPECTIVE` | Standard perspective projection |
| `AEGP_CameraType_ORTHOGRAPHIC` | Parallel projection |
| `AEGP_CameraType_NONE` | No camera type |

#### 1.5.2 Camera Parameters

| Parameter | Description |
|-----------|-------------|
| Focal Length | Distance from film plane to camera lens |
| Film Size | Size of exposed area (measured in pixels, default 36mm equivalent) |
| Focal Distance | Affects depth of field calculations only |
| Zoom | Calculated from focal length and film size |
| Angle of View | Width of scene captured (derived from above values) |

**Note:** Cameras have no source and thus have no `AEGP_ItemH`. They are accessed differently from other layer types.

**Orthographic Projection Formula:**
```
glOrtho(-width/2, width/2, -height/2, height/2, -1, 100)
```

### 1.6 Light Suite (AEGP_LightSuite2)

The Light Suite provides access to light properties for 3D illumination calculations.

#### 1.6.1 Light Types

| Type | Description |
|------|-------------|
| `AEGP_LightType_PARALLEL` | Directional light from infinite distance (like the sun) |
| `AEGP_LightType_SPOT` | Cone-constrained light (like a flashlight) |
| `AEGP_LightType_POINT` | Omnidirectional light (like a bare bulb) |
| `AEGP_LightType_AMBIENT` | Non-directional scene-wide illumination |
| `AEGP_LightType_ENVIRONMENT` | Image-based lighting (newer addition) |

#### 1.6.2 Specular Reflection Calculation

The SDK specifies this formula for specular reflection:

```
S * power(H dot N, shine)
```

Where:
- `S` = Specular intensity
- `H` = Normalized half-angle vector
- `N` = Surface normal
- `shine` = Shininess exponent

### 1.7 Canvas Suite (AEGP_CanvasSuite8)

The Canvas Suite is vital for all Artisans, supplying layers, compositions, texture buffers, and destination buffers. It includes approximately 40+ functions.

#### 1.7.1 Key Rendering Functions

**AEGP_RenderTexture()**
- Supplies raw pixels of a layer, untransformed
- Renders into an arbitrarily-sized buffer
- Useful for obtaining source texture data

**AEGP_RenderLayer()**
- Invokes the entire After Effects render pipeline
- Includes transforms, masking, and other effects
- Provides the layer as it appears in its composition
- For 3D layers, invokes the default (Standard 3D) Artisan
- Useful for rendering track matte layers

#### 1.7.2 Transform Query Functions

These functions are essential for building a scene representation:

**AEGP_QueryXformGetTransformTime()**
- Gets the time of the transform
- Passed to `AEGP_GetCompShutterFrameRange()` from `AEGP_CompSuite11`

**AEGP_QueryXformGetViewTime()**
- Gets the time of the view
- Used in calling `AEGP_GetLayerToWorldXformFromView()` from `AEGP_LayerSuite9`

### 1.8 Rendering Pipeline Implementation

#### 1.8.1 Render Function Pattern

Based on the Artie sample project, a typical render function follows this pattern:

1. **Camera Construction**: Create perspective projection from composition dimensions or existing cameras
2. **Scene Assembly**: Iterate through render layers, extracting geometry, materials, and textures
3. **Image Synthesis**: Apply rendering algorithm (ray-tracing, rasterization, etc.)

#### 1.8.2 Sample Implementation (Artie)

The Artie sample project demonstrates a complete ray-tracing implementation:

```cpp
// Core render pipeline
Artie_Render() {
    Artie_BuildCamera();     // Setup camera projection
    Artie_BuildScene();      // Gather layer geometry and materials
    Artie_Paint();           // Perform ray-tracing
}

// Ray-tracing functions
Raytrace();                  // Recursive ray-surface intersection
SceneIntersection();         // Test ray against all polygons
Artie_RayIntersectLayer();   // Barycentric coordinate calculation
```

The system supports:
- Material properties (ambient, diffuse, specular coefficients)
- Light interactions
- Depth-limited recursion for reflections
- Texture mapping via barycentric coordinates

### 1.9 Query Function (PR_QueryFunc)

The query function provides information about transforms for correctly placing layers within a composition. While optional, failing to implement it will cause camera and light indicators to vanish during interactive preview drawing.

Adobe has added the ability for Artisans to provide functions for basic drawing operations during preview, including:
- Camera indicators
- Light indicators
- Wireframe preview modeling
- 3D layer handles

**Note:** If your Artisan doesn't respond to the 3D layer handles query, the default Artisan will draw them for you.

### 1.10 Quality Modes

After Effects is not a 3D modeling application. Users work in a responsive preview mode, switching to higher quality only for proofing or final output.

**Recommendation:** Provide at least two quality modes:
1. **Layout/Preview Mode**: Fast, responsive, lower quality
2. **Final Output Mode**: High quality, slower rendering

Be conscious of render time in low quality mode to maintain interactivity.

### 1.11 Memory Management and Caching

#### 1.11.1 Receipt-Based Memory Management

| Handle Type | Disposal Method |
|-------------|-----------------|
| `AEGP_RenderReceiptH` | `AEGP_DisposeRenderReceipt()` |
| `AEGP_FrameReceiptH` | `AEGP_CheckinFrame()` |
| Layer textures | `AEGP_DisposeTexture()` |

#### 1.11.2 Caching Guidelines

**Critical Warning:** Do not cache layer pixels. The SDK explicitly states:

> "Caching references between calls to a specific hook function within your plug-in is not recommended; acquire information when you need it, and forget (release) it as soon as possible."

Layer, stream, and other item information is frequently invalidated by user activity. Anything that modifies the quantity (not quality) of items will invalidate references.

---

## Part 2: BlitHook Plugins (External Video Output)

### 2.1 Overview and Purpose

BlitHook plugins output video to external hardware for broadcast-quality monitoring and playback to tape. They provide a mechanism for sending rendered frames to professional video equipment during preview and playback.

**Important Note:** As of After Effects CC 2014 and later, Mercury Transmit is the recommended API for external video output. BlitHook is considered a legacy API.

### 2.2 BlitHook Architecture

#### 2.2.1 Automatic Loading

Unlike most plugins, BlitHook plugins are automatically loaded and used by After Effects without appearing in any menu or dialog. They operate transparently as part of the video output pipeline.

#### 2.2.2 Frame Delivery

Frames are pushed as they're displayed in the Composition panel:
1. User initiates RAM preview on a timeline segment
2. Frames render to RAM
3. Playback occurs at full speed
4. Each displayed frame is pushed to the BlitHook plugin

### 2.3 Registration and Menu Integration

BlitHook plugins may optionally provide a custom settings dialog through the AEGP API:

#### 2.3.1 Menu Registration

```cpp
AEGP_RegisterUpdateMenuHook()  // Register for menu updates
```

#### 2.3.2 Menu State Control

```cpp
AEGP_EnableCommand()   // Enable menu item
AEGP_DisableCommand()  // Disable (dim) menu item
```

This allows the plugin to:
- Add a menu item for settings access
- Control menu item enabled/disabled state based on hardware availability
- Update menu text dynamically

### 2.4 Sample Project: EMP

The EMP (External Monitor Preview) sample project provides a starting point for BlitHook plugin development. It demonstrates:

- Basic BlitHook infrastructure setup
- Frame buffer handling
- Hardware integration patterns
- Settings dialog implementation

### 2.5 Hardware Integration Considerations

BlitHook plugins typically interface with professional video hardware:
- AJA video cards
- Blackmagic Design devices
- Matrox I/O hardware
- Other broadcast equipment

The plugin is responsible for:
- Hardware detection and initialization
- Frame format conversion
- Timing synchronization
- Buffer management

---

## Part 3: Mercury Transmit (Modern Replacement)

### 3.1 Overview

Mercury Transmit replaced BlitHook as the recommended video output API starting with After Effects CC 2014. It provides unified transmitter support across Adobe Creative Cloud applications.

### 3.2 Key Advantages

- **Cross-application support**: Works in Premiere Pro, After Effects, Prelude, and Character Animator
- **Unified API**: Single implementation works across multiple applications
- **Modern architecture**: Better performance and reliability
- **Active development**: Continues to receive updates

### 3.3 Documentation Location

The Mercury Transmit API is documented in the Premiere Pro SDK, not the After Effects SDK:

**URL:** https://www.adobe.io/apis/creativecloud/premierepro.html

Developers must obtain the appropriate Mercury Transmit headers from either the Adobe Premiere Pro or After Effects C++ SDK.

### 3.4 User Configuration

Mercury Transmit settings are accessible via:
- **Menu:** Preferences > Video Preview
- **Enable Toggle:** Keyboard shortcut '/' on numeric keypad
- **Device Selection:** Check boxes for available output devices
- **Device Configuration:** Setup button for hardware-specific options

---

## Part 4: Performance Considerations

### 4.1 Artisan Performance

#### 4.1.1 Preview vs. Final Rendering

- Implement quality tiers for different rendering contexts
- Prioritize interactivity in preview mode
- Reserve complex calculations for final output

#### 4.1.2 Resource Management

- Acquire resources only when needed
- Release resources immediately after use
- Avoid caching between hook function calls
- Register a death hook (`AEGP_RegisterDeathHook()`) for cleanup on exit

### 4.2 BlitHook/Mercury Transmit Performance

#### 4.2.1 Frame Timing

- Synchronize with hardware refresh rates
- Handle dropped frames gracefully
- Buffer appropriately for smooth playback

#### 4.2.2 Format Conversion

- Optimize pixel format conversions
- Consider hardware acceleration
- Handle various color depths (8-bit to 32-bit float)

---

## Part 5: Known Limitations

### 5.1 Artisan Limitations

1. **Outdated Public SDK**: The publicly available SDK is outdated for Artisan development. The artisan-2-api requires additional headers (`PR_Feature.h`, etc.) obtainable only from Adobe.

2. **Single Artisan Per Composition**: Only one Artisan can be active per composition at any time.

3. **Interactive Artisans**: Limited to preview display only; cannot be used for final output rendering.

4. **Complexity**: Artisans are described as "complex beasts" even by Adobe; extensive development effort is required.

### 5.2 BlitHook Limitations

1. **Legacy API**: Deprecated in favor of Mercury Transmit since After Effects CC 2014.

2. **After Effects Only**: Unlike Mercury Transmit, BlitHook works only in After Effects.

3. **Limited Documentation**: Minimal public documentation available.

### 5.3 Mercury Transmit Limitations

1. **Separate SDK Documentation**: Documented in Premiere Pro SDK, not After Effects SDK.

2. **Hardware Requirements**: Requires compatible broadcast video hardware.

---

## Part 6: Development Resources

### 6.1 Sample Projects

| Sample | Type | Purpose |
|--------|------|---------|
| Artie | Artisan | Complete 3D ray-tracing renderer demonstration |
| EMP | BlitHook | External Monitor Preview starting point |

### 6.2 Key Header Files

| Header | Contents |
|--------|----------|
| `AE_GeneralPlug.h` | AEGP definitions |
| `PR_Public.h` | Artisan API definitions |
| `AE_Effect.h` | Core effect definitions |
| `AEGP_SuiteHandler.h` | Suite handler utilities |

### 6.3 Relevant Suites

| Suite | Version | Purpose |
|-------|---------|---------|
| `AEGP_RegisterSuite` | 5 | Plugin registration |
| `AEGP_CanvasSuite` | 8 | Layer and texture rendering |
| `AEGP_CameraSuite` | 2 | Camera property access |
| `AEGP_LightSuite` | 2 | Light property access |
| `AEGP_LayerSuite` | 9 | Layer property access |
| `AEGP_CompSuite` | 11 | Composition access |

---

## Related Documentation

### Wave 1 Documents
- [[01-sdk-fundamentals]] - SDK Foundation and Architecture
- [[02-effect-plugins]] - Effect Plugin Development
- [[03-aegp-overview]] - AEGP (After Effects General Plugins)
- [[04-aeio-plugins]] - Input/Output Plugins
- [[06-expressions-scripting]] - Expressions and Scripting

### External References
- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [Adobe Developer Portal - After Effects](https://developer.adobe.com/after-effects/)
- [Artisan Data Types](https://ae-plugins.docsforadobe.dev/artisans/artisan-data-types/)
- [AEGP Suites](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Sample Projects](https://ae-plugins.docsforadobe.dev/intro/sample-projects/)
- [Premiere Pro SDK (Mercury Transmit)](https://www.adobe.io/apis/creativecloud/premierepro.html)

---

## Appendix A: Artisan Quick Reference

### A.1 Registration Template

```cpp
// Set up API version
PR_ArtisanEntryPoints entry_funcs;
A_Version api_version, artisan_version;

api_version.majorS = PR_ARTISAN_API_VERSION_MAJOR;
api_version.minorS = PR_ARTISAN_API_VERSION_MINOR;

// Assign entry points
entry_funcs.render_func = MyArtisan_Render;        // Required
entry_funcs.global_setup_func0 = MyArtisan_Setup;  // Optional
entry_funcs.query_func0 = MyArtisan_Query;         // Optional

// Register with After Effects
suites.RegisterSuite5()->AEGP_RegisterArtisan(
    api_version,
    artisan_version,
    plugin_id,
    refcon,
    "MyArtisan",        // Match name
    "My 3D Renderer",   // Display name
    &entry_funcs
);
```

### A.2 Render Function Template

```cpp
A_Err MyArtisan_Render(PR_RenderContextH context) {
    A_Err err = A_Err_NONE;

    // 1. Get render parameters
    AEGP_RenderLayerContextH layer_context;
    // ... obtain render context ...

    // 2. Build camera
    // ... camera setup ...

    // 3. Iterate layers
    // ... layer processing ...

    // 4. Render scene
    // ... rendering logic ...

    // 5. Clean up
    // ... resource disposal ...

    return err;
}
```

---

## Appendix B: BlitHook Quick Reference

### B.1 Plugin Structure

```cpp
// BlitHook plugins are automatically loaded
// No explicit registration is required

// Optional: Register menu for settings
AEGP_RegisterUpdateMenuHook(menu_callback);

// Menu callback
void MenuCallback() {
    // Enable/disable based on hardware state
    if (hardware_available) {
        AEGP_EnableCommand(settings_command);
    } else {
        AEGP_DisableCommand(settings_command);
    }
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial comprehensive documentation |

---

*Document generated from official Adobe After Effects SDK documentation and community resources.*

*Sources: [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/), [Adobe Developer Portal](https://developer.adobe.com/after-effects/), [Artisan Data Types](https://ae-plugins.docsforadobe.dev/artisans/artisan-data-types/)*
