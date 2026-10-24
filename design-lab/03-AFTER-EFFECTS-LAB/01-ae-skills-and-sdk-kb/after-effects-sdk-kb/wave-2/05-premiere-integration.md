---
source: '[unknown - 05-premiere-integration.md]'
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
title: 'Cross-Host Plugin Development: Premiere Pro Integration'
category: sdk-reference
---
[3-Resources/anchors/status-complete]]

# Cross-Host Plugin Development: Premiere Pro Integration

This document provides comprehensive guidance for developing After Effects plugins that work seamlessly across both After Effects and Premiere Pro. Understanding the differences between these hosts is essential for creating robust, professional-grade plugins that deliver consistent behavior regardless of the host application.

## Table of Contents

1. [Cross-Host Plugin Overview](#cross-host-plugin-overview)
2. [Host Application Detection](#host-application-detection)
3. [Premiere Pro Specific Differences](#premiere-pro-specific-differences)
4. [PF_OutFlags for Premiere Pro](#pf_outflags-for-premiere-pro)
5. [Pixel Format Differences](#pixel-format-differences)
6. [GPU Rendering in Premiere Pro](#gpu-rendering-in-premiere-pro)
7. [Parameter Limitations](#parameter-limitations)
8. [Audio Effect Differences](#audio-effect-differences)
9. [Building for Both Hosts](#building-for-both-hosts)
10. [Testing Cross-Host Plugins](#testing-cross-host-plugins)

---

## Cross-Host Plugin Overview

After Effects plugins can be designed to work in multiple Adobe applications, with Premiere Pro being the most common secondary host. Both applications share a significant portion of the After Effects plugin API, but crucial differences exist that developers must account for.

### Supported API Subset

Premiere Pro and Premiere Elements support the After Effects effect API as described in the core SDK documentation, specifically:

- **Chapter 2**: Effect Basics (parameters, commands, data structures)
- **Chapter 3**: Effect Details (rendering, threading, utilities)
- **Chapter 5**: Effect UI & Events (custom interfaces, parameter controls)

### Unsupported Features in Premiere Pro

The following After Effects features are **not available** in Premiere Pro:

| Feature Category | Specific Unsupported Items |
|-----------------|---------------------------|
| **3D Support** | Auxiliary channels, cameras, lights, 3D layer properties |
| **Color Depth** | 16-bit color depth processing |
| **SmartFX** | Entire SmartFX technology stack |
| **AEGP** | After Effects General Plug-in suite |
| **Suites** | PF World Transform Suite, PF AE Channel Suite |
| **Functions** | extent_hint, PF_SUBPIXEL_SAMPLE(), PF_GET_PIXEL_DATA16() |
| **Audio** | Full audio API (plugins with PF_OutFlag_I_USE_AUDIO won't load) |
| **UI Flags** | PF_ParamFlag_COLLAPSE_TWIRLY, START_COLLAPSED |
| **Multiple PiPLs** | Multiple PiPL resources in single plugin binary |

### Detection Strategy for Unsupported Suites

The recommended approach for handling unsupported features is to check for suite availability during initialization:

```cpp
PF_Err GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;

    // Attempt to acquire a required suite
    AEFX_SuiteScoper<PF_WorldTransformSuite1> worldTransformSuite =
        AEFX_SuiteScoper<PF_WorldTransformSuite1>(
            in_data,
            kPFWorldTransformSuite,
            kPFWorldTransformSuiteVersion1,
            out_data);

    if (!worldTransformSuite.IsValid()) {
        // Suite not available - likely running in Premiere Pro
        // Return error to prevent loading
        return PF_Err_UNRECOGNIZED_PARAM_TYPE;
    }

    return err;
}
```

When an effect returns an error during `PF_Cmd_GLOBAL_SETUP` due to missing suites, Premiere Pro adds it to an internal "don't load" list, preventing future load attempts.

---

## Host Application Detection

Detecting the host application is the first step in implementing cross-host behavior. The `PF_InData` structure provides the necessary identification.

### Application Identifier Values

| Host Application | appl_id Value | Notes |
|-----------------|---------------|-------|
| After Effects | `'FXTC'` | Primary development target |
| Premiere Pro | `'PrMr'` | Includes Premiere Elements |
| Premiere Elements | `'PrMr'` | Use App Info Suite for distinction |

### Implementation Pattern

```cpp
bool IsRunningInPremiereHost(PF_InData *in_data)
{
    // Check if running in Premiere Pro or Premiere Elements
    return (in_data->appl_id == 'PrMr');
}

bool IsRunningInAfterEffects(PF_InData *in_data)
{
    // Check if running in After Effects
    return (in_data->appl_id == 'FXTC');
}

PF_Err GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;

    if (IsRunningInPremiereHost(in_data)) {
        // Configure for Premiere Pro behavior
        // Disable unsupported features
        // Use alternative rendering paths
    } else {
        // Full After Effects functionality
        // Enable SmartFX, 16-bit, etc.
    }

    return err;
}
```

### Version Detection

Plugin developers can identify specific Premiere Pro versions through the version fields:

```cpp
void LogHostVersion(PF_InData *in_data)
{
    A_short majorVersion = in_data->version.major;
    A_short minorVersion = in_data->version.minor;

    // Premiere Pro CC reports major=13, minor=4
    // Premiere Pro CS6 reports major=13, minor=2
}
```

**Critical Note**: Version numbers in Premiere Pro do **not** indicate API feature parity with corresponding After Effects versions. They only distinguish between successive Premiere Pro releases.

### Distinguishing Premiere Pro from Premiere Elements

To distinguish between Premiere Pro and Premiere Elements specifically, use the Premiere-specific **App Info Suite** available in the Premiere Pro SDK:

```cpp
#include "PrSDKAppInfoSuite.h"

bool IsPremiereElements(PF_InData *in_data)
{
    PrSDKAppInfoSuite *appInfoSuite;
    // Acquire suite and check application type
    // Implementation depends on Premiere Pro SDK headers
}
```

---

## Premiere Pro Specific Differences

Understanding the behavioral differences between hosts is crucial for reliable cross-host plugins.

### Time Value Handling

Premiere Pro uses different time scale and step values than After Effects:

| Timeline Type | Host | time_scale | time_step |
|--------------|------|------------|-----------|
| NTSC | Premiere Pro | 60000 | 1001 |
| NTSC | After Effects | 2997 | 50 or 100 |
| PAL | Both | 25 | 1 |

The **ratio** between time_scale and time_step determines timing, not the absolute values. Always calculate frame rates as:

```cpp
double GetFrameRate(PF_InData *in_data)
{
    return (double)in_data->time_scale / (double)in_data->time_step;
}
```

### Rendering Behavior Differences

**Quality Levels During Editing**:
Premiere Pro requests renders at multiple quality levels during timeline scrubbing:
1. First, a low-quality render for immediate feedback
2. Then, a high-quality render once scrubbing stops
3. Speculative rendering of upcoming frames

**Field Rendering**:
For field rendering in native interlaced formats, Premiere Pro sends `PF_Cmd_RENDER` once for each field, with adjusted height and rowbytes values.

### Render Order and Threading

Unlike After Effects' sequential processing model, Premiere Pro creates **multiple instances** of effects that can be called **concurrently from separate threads**:

```cpp
// WRONG: Using static variables for state
static int s_lastFrameRendered = 0;  // Will cause race conditions!

// CORRECT: Use sequence_data for instance-specific state
typedef struct {
    int lastFrameRendered;
} MySequenceData;
```

Effects should **never**:
- Expect chronological render requests
- Rely on static or global variables for render state
- Assume single-threaded execution

### Frame Dimensions

Premiere Pro handles source-to-project scaling differently. When an NTSC clip appears in a PAL sequence:

- **After Effects**: Maintains original dimensions with pixel aspect ratio adjustment
- **Premiere Pro**: May produce different width/height and pixel aspect ratio values

Always use the dimensions provided in `PF_InData` rather than assuming source dimensions.

### PF_InData Field Differences

| Field | After Effects | Premiere Pro |
|-------|--------------|--------------|
| `field` | Current field being rendered | May differ in field rendering |
| `quality` | Layer quality setting | Monitor window quality setting |

---

## PF_OutFlags for Premiere Pro

Proper flag configuration is essential for cross-host compatibility. Some flags have Premiere Pro-specific behavior.

### PF_OutFlags Reference

| Flag | Description | Premiere Pro Notes |
|------|-------------|-------------------|
| `PF_OutFlag_KEEP_RESOURCE_OPEN` | Resources available during all commands | Supported |
| `PF_OutFlag_PIX_INDEPENDENT` | Pixels independent of neighbors | Enables parallel processing |
| `PF_OutFlag_I_SHRINK_BUFFER` | Effect shrinks buffer | Supported |
| `PF_OutFlag_WIDE_TIME_INPUT` | Accesses non-current times | Supported |
| `PF_OutFlag_NON_PARAM_VARY` | Output varies non-parametrically | Supported |
| `PF_OutFlag_CUSTOM_UI` | Requires event messages | Limited support |
| `PF_OutFlag_I_DO_DIALOG` | Displays options dialog | Supported |
| `PF_OutFlag_AUDIO_EFFECT_TOO` | Also processes audio | **Not Supported** - Plugin won't load |
| `PF_OutFlag_I_SYNTHESIZE_AUDIO` | Generates audio | **Not Supported** |
| `PF_OutFlag_AUDIO_IIR` | Output depends on previous output | **Not Supported** |

### PF_OutFlags2 Reference

| Flag | Description | Premiere Pro Notes |
|------|-------------|-------------------|
| `PF_OutFlag2_SUPPORTS_SMART_RENDER` | SmartFX API support | **Not Supported in Premiere** |
| `PF_OutFlag2_FLOAT_COLOR_AWARE` | 32-bpc float support | Supported differently |
| `PF_OutFlag2_SUPPORTS_GPU_RENDER_F32` | GPU rendering support | Premiere-specific implementation |
| `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` | Multi-threaded rendering | Supported (AE 2022+) |
| `PF_OutFlag2_PPRO_DO_NOT_CLONE_SEQUENCE_DATA_FOR_RENDER` | Premiere-specific threading | **Not recommended** - causes UI issues |
| `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER` | Writable sequence data per thread | Use carefully |
| `PF_OutFlag2_AUTOMATIC_WIDE_TIME_INPUT` | Auto-track parameter dependencies | Supported |

### Premiere-Specific Threading Flag Warning

The documentation explicitly advises against using `PF_OutFlag2_PPRO_DO_NOT_CLONE_SEQUENCE_DATA_FOR_RENDER`:

> "We advise against setting this flag, as it has been found to cause parameter UI problems."

### Cross-Host Flag Configuration Pattern

```cpp
PF_Err GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    out_data->my_version = PF_VERSION(MAJOR_VERSION, MINOR_VERSION,
                                       BUG_VERSION, STAGE_VERSION,
                                       BUILD_VERSION);

    // Common flags for both hosts
    out_data->out_flags = PF_OutFlag_PIX_INDEPENDENT |
                          PF_OutFlag_DEEP_COLOR_AWARE;

    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_THREADED_RENDERING |
                           PF_OutFlag2_FLOAT_COLOR_AWARE;

    if (!IsRunningInPremiereHost(in_data)) {
        // After Effects-only flags
        out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_SMART_RENDER;
    }

    return PF_Err_NONE;
}
```

---

## Pixel Format Differences

Pixel format handling represents one of the most significant differences between After Effects and Premiere Pro.

### Format Comparison

| Aspect | After Effects | Premiere Pro |
|--------|--------------|--------------|
| Primary Format | ARGB_8u | BGRA_8u |
| Channel Order | Alpha-Red-Green-Blue | Blue-Green-Red-Alpha |
| YUV Support | Limited | Full native support |
| 16-bit | Supported | **Not supported for AE plugins** |
| 32-bit Float | Supported | Supported (recommended path) |
| Format Count | ~5 core formats | 69+ formats |

### Premiere Pro Pixel Formats

Premiere Pro supports extensive pixel format options:

**Unpacked, Uncompressed**:
- `BGRA_8u`, `BGRA_16u`, `BGRA_32f`
- `VUYA_8u`, `VUYA_16u`, `VUYA_32f`

**Packed, Uncompressed**:
- `YUYV_422_8u`, `UYVY_422_8u`
- `V210_422_10u`

**Compressed Y'UV**:
- DV25, DV50, DV100
- MPEG-2 4:2:0, MPEG-4 4:2:0

### Registering for Additional Pixel Formats

Use the **PF Pixel Format Suite** (defined in `PrAESDKSupport.h`) to register support:

```cpp
#include "PrAESDKSupport.h"

PF_Err GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;

    if (IsRunningInPremiereHost(in_data)) {
        // Register for Premiere-native formats
        PF_PixelFormatSuite1 *pixelFormatSuite;

        err = AEFX_AcquireSuite(in_data, out_data,
                                kPFPixelFormatSuite,
                                kPFPixelFormatSuiteVersion1,
                                "Couldn't acquire Pixel Format Suite",
                                (void**)&pixelFormatSuite);

        if (!err && pixelFormatSuite) {
            // Add support for 32-bit float BGRA
            pixelFormatSuite->AddSupportedPixelFormat(
                in_data->effect_ref,
                PrPixelFormat_BGRA_4444_32f);

            // Add support for 8-bit BGRA (native Premiere format)
            pixelFormatSuite->AddSupportedPixelFormat(
                in_data->effect_ref,
                PrPixelFormat_BGRA_4444_8u);
        }
    }

    return err;
}
```

### Parameter Checkout Frame Matching

Before CS6, `PF_CHECKOUT_PARAM()` always returned 8-bit ARGB buffers regardless of render format. Starting with CS6, effects can opt-in to receive frames matching the render pixel format:

```cpp
#include "PrSDKAESupport.h"

PF_Err GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    if (IsRunningInPremiereHost(in_data)) {
        PF_UtilitySuite3 *utilitySuite;

        err = AEFX_AcquireSuite(in_data, out_data,
                                kPFUtilitySuite,
                                kPFUtilitySuiteVersion3,
                                NULL,
                                (void**)&utilitySuite);

        if (!err && utilitySuite) {
            // Request checked-out frames match render format
            utilitySuite->EffectWantsCheckedOutFramesToMatchRenderPixelFormat(
                in_data->effect_ref);
        }
    }

    return PF_Err_NONE;
}
```

### Recommended Format Strategy

For cross-host effects:

1. **RGB-based algorithms**: Support 8-bit BGRA (fast path) and 32-bit BGRA (quality path)
2. **YUV-based algorithms**: Use VUYA formats directly
3. **Always support 32f**: The 32-bit float path is recommended for high-quality rendering
4. **Avoid 16u**: Use 32f instead for high bit-depth workflows

```cpp
// Format detection during render
void DetectPixelFormat(PF_EffectWorld *world)
{
    switch (world->pixelFormat) {
        case PrPixelFormat_BGRA_4444_8u:
            // 8-bit BGRA processing
            break;
        case PrPixelFormat_BGRA_4444_32f:
            // 32-bit float BGRA processing
            break;
        case PrPixelFormat_VUYA_4444_32f:
            // YUV processing path
            break;
    }
}
```

### Blend Function Limitations

After Effects functions like `PF_BLEND()` have **not** been enhanced to work with pixel formats beyond 8-bit RGB. For higher bit depths, implement custom blending:

```cpp
void BlendPixels32f(
    float *srcA, float *srcB, float *dst,
    float blendFactor)
{
    dst[0] = srcA[0] * (1.0f - blendFactor) + srcB[0] * blendFactor; // B
    dst[1] = srcA[1] * (1.0f - blendFactor) + srcB[1] * blendFactor; // G
    dst[2] = srcA[2] * (1.0f - blendFactor) + srcB[2] * blendFactor; // R
    dst[3] = srcA[3] * (1.0f - blendFactor) + srcB[3] * blendFactor; // A
}
```

---

## GPU Rendering in Premiere Pro

GPU acceleration in Premiere Pro differs significantly from After Effects and offers direct access to GPU-resident frames through the Mercury Playback Engine.

### Architecture Overview

GPU effects in Premiere Pro:
- Provide full access to GPU-resident frames without readback to system memory
- Build upon the After Effects SDK framework with GPU extensions
- Support a dual-path rendering approach (GPU primary, CPU fallback)

### Supported GPU Technologies

| Technology | Platform | Notes |
|-----------|----------|-------|
| **CUDA** | Windows, Linux | Recommended SDK 11.8; min compute sm_50 |
| **Metal** | macOS | Required for macOS 10.14+ (no CUDA) |
| **OpenCL** | Cross-platform | Now uses half-precision 16f rendering |
| **DirectX 12** | Windows | In development; contact Adobe for access |

### GPU Framework Detection

```cpp
void HandleGPURender(PF_InData *in_data, void *extraP)
{
    PF_GPUDeviceSetupExtra *gpuExtra = (PF_GPUDeviceSetupExtra*)extraP;

    switch (gpuExtra->input->what_gpu) {
        case PF_GPU_Framework_CUDA:
            // CUDA rendering path
            break;
        case PF_GPU_Framework_OPENCL:
            // OpenCL rendering path
            break;
        case PF_GPU_Framework_METAL:
            // Metal rendering path
            break;
    }
}
```

**Important**: After Effects/Premiere Pro chooses the GPU API and device. You cannot force a specific API.

### Cross-Platform Kernel Development

The PrGPU SDK provides macros and device functions for writing kernels that compile on both CUDA and Metal:

```cpp
// Using PrGPU cross-platform macros
#include "PrGPU/KernelSupport/KernelCore.h"

GF_KERNEL_FUNCTION(MyEffect,
    ((GF_PTR(float4)), inBuf),
    ((GF_PTR(float4)), outBuf),
    ((uint32_t), width),
    ((uint32_t), height))
{
    uint32_t x = GF_GLOBAL_ID_X;
    uint32_t y = GF_GLOBAL_ID_Y;

    if (x >= width || y >= height) return;

    uint32_t index = y * width + x;
    float4 pixel = inBuf[index];

    // Process pixel...

    outBuf[index] = pixel;
}
```

### CUDA Development Guidelines

**SDK Version**: Use CUDA SDK 11.8 for building GPU effects

**Driver API vs Runtime API**:
```cpp
// RECOMMENDED: Use Driver API for backward compatibility
cuModuleLoad(&module, "mykernel.ptx");
cuModuleGetFunction(&function, module, "MyKernel");
cuLaunchKernel(function, ...);

// NOT RECOMMENDED: Runtime API has compatibility issues
// MyKernel<<<grid, block>>>(...);
```

**Linking Options**:
- Static linking to `cudart_static.lib` for compatibility
- Dynamic linking requires compatible runtime DLL on user systems

### OpenCL Requirements

OpenCL rendering now uses half-precision 16-bit floating point:

```cpp
// GPU effects with OpenCL must support both formats
void RegisterGPUFormats()
{
    // 16-bit half precision (required for OpenCL)
    RegisterPixelFormat(PrPixelFormat_GPU_BGRA_4444_16f);

    // 32-bit full precision
    RegisterPixelFormat(PrPixelFormat_GPU_BGRA_4444_32f);
}
```

### Real-Time Processing Declaration

Effects can declare real-time processing support to avoid non-realtime flagging:

```cpp
PF_Err GlobalSetup(...)
{
    // Indicate real-time capability
    out_data->out_flags2 |= PF_OutFlag2_I_AM_REALTIME;

    return PF_Err_NONE;
}
```

---

## Parameter Limitations

Several parameter features available in After Effects have limited or no support in Premiere Pro.

### Unsupported Parameter Features

| Feature | After Effects | Premiere Pro |
|---------|--------------|--------------|
| `START_COLLAPSED` | Supported | **Ignored** |
| `PF_ParamFlag_COLLAPSE_TWIRLY` | Supported | **Ignored** |
| Parameter Groups (Twirls) | Full support | Groups remain expanded |

### Missing Command Selectors

| Selector | After Effects | Premiere Pro |
|----------|--------------|--------------|
| `PF_Cmd_UPDATE_PARAMS_UI` | Sent on parameter changes | **Not sent** when moving time needle without keyframes |
| `PF_Cmd_DRAW` | Sent for custom UI | **Not sent** when moving time needle without keyframes |

### Parameter UI Behavior Differences

```cpp
// This pattern may not work reliably in Premiere Pro
case PF_Cmd_UPDATE_PARAMS_UI:
    // In Premiere, this won't be called during timeline scrubbing
    // without keyframe changes
    UpdateParameterVisibility(in_data, params);
    break;
```

### Workaround for Dynamic Parameters

If your effect needs to update parameter visibility or values based on time:

```cpp
case PF_Cmd_RENDER:
    // Check parameter state during render instead
    if (NeedsUIUpdate(in_data, params)) {
        // Handle parameter state changes here
        // Note: Can't modify UI during render
    }
    break;
```

---

## Audio Effect Differences

Audio processing has significant limitations in Premiere Pro for After Effects-style plugins.

### Critical Limitation

**If a plugin sets `PF_OutFlag_I_USE_AUDIO` during `PF_Cmd_GLOBAL_SETUP`, it will NOT be loaded at all in Premiere Pro.**

```cpp
// This will prevent loading in Premiere Pro:
out_data->out_flags |= PF_OutFlag_I_USE_AUDIO;  // Plugin won't appear!

// Also unsupported:
out_data->out_flags |= PF_OutFlag_I_SYNTHESIZE_AUDIO;  // Won't load
out_data->out_flags |= PF_OutFlag_AUDIO_IIR;           // Won't load
```

### Cross-Host Audio Strategy

For effects that need audio capabilities in After Effects but should also work in Premiere Pro:

```cpp
PF_Err GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    // Common video processing flags
    out_data->out_flags = PF_OutFlag_PIX_INDEPENDENT;

    if (!IsRunningInPremiereHost(in_data)) {
        // Only enable audio in After Effects
        out_data->out_flags |= PF_OutFlag_I_USE_AUDIO;
    }

    return PF_Err_NONE;
}
```

**Note**: This creates a degraded experience in Premiere Pro where audio features are unavailable. Consider documenting this limitation for users.

---

## Building for Both Hosts

Creating plugins that work reliably in both hosts requires careful project configuration.

### Installation Location

**Critical**: Use the common plug-in folder, not application-specific directories.

| Platform | Common Plugin Path |
|----------|-------------------|
| Windows | `C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\` |
| macOS | `/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/` |

**Why This Matters**:
1. Adobe Media Encoder uses this location (separate application from Premiere)
2. Project interchange between Premiere Pro and After Effects requires common location
3. Copy/paste of effects between applications requires common location

### PiPL Resource Configuration

For maximum compatibility, maintain both the legacy PiPL resource and the new runtime entry point:

```cpp
// PiPL resource (for backward compatibility)
resource 'PiPL' (16000) {
    {
        Kind { AEEffect },
        Name { "My Cross-Host Effect" },
        Category { "My Category" },
        AE_Effect_Spec_Version { 13, 28 },
        AE_Effect_Version { 1, 0 },
        AE_Effect_Match_Name { "MYCOMPANY My Effect" },
        // ... additional properties
    }
};
```

### Runtime Entry Point (Premiere Pro First)

Premiere Pro supports a new runtime entry point that doesn't rely on PiPL resources. After Effects will support this in a future release:

```cpp
// New runtime registration (supported in Premiere first)
extern "C" {
    DllExport PF_Err PluginMain(
        PF_Cmd cmd,
        PF_InData *in_data,
        PF_OutData *out_data,
        PF_ParamDef *params[],
        PF_LayerDef *output,
        void *extra);
}
```

### Platform Support

| Platform | After Effects | Premiere Pro |
|----------|--------------|--------------|
| Windows x64 | Yes | Yes |
| Windows ARM64 | SDK 25.6+ | Beta available |
| macOS Intel | Yes | Yes |
| macOS Apple Silicon | Yes | Yes (native required) |

**Apple Silicon Note**: When running native Premiere Pro on Apple Silicon, only natively compiled effects will load. x86 effects running under Rosetta 2 are not compatible.

### Premiere Elements Icon Requirements

For Premiere Elements compatibility, provide PNG icons:

- **Size**: 60x45 pixels
- **Format**: PNG
- **Location**: `/[Program Files]/Adobe/Adobe Premiere Elements [version]/Plug-in/Common/Effect/Previews/`
- **Naming**: `AE.{MatchName}.png`

```
Example: Match name "MYCO MyEffect" becomes "AE.MYCO MyEffect.png"
```

---

## Testing Cross-Host Plugins

Thorough testing across hosts is essential for reliable plugins.

### Testing Matrix

| Test Category | After Effects | Premiere Pro | Media Encoder |
|--------------|--------------|--------------|---------------|
| Basic rendering | Yes | Yes | Yes |
| All parameters | Yes | Yes | N/A |
| GPU acceleration | Yes | Yes | Yes |
| Multi-frame rendering | Yes | Yes | Yes |
| Export paths | Yes | Yes | Yes |
| Project interchange | Test both directions | Test both directions | N/A |

### Render Quality Testing

Test all quality combinations in Premiere Pro:

1. **Draft quality scrubbing**: Low-quality preview
2. **High quality preview**: Full-quality timeline
3. **Export rendering**: Final output quality
4. **Background rendering**: Media Encoder processing

### Threading Stress Tests

```cpp
// Verify thread safety by enabling aggressive multi-threading
// In Premiere Pro, create a complex sequence with:
// - Multiple tracks
// - Multiple instances of your effect
// - Different parameter settings per instance
// - Keyframe animation
```

### Pixel Format Testing

Verify rendering with different sequence settings:

1. **8-bit RGB sequence**: Default editing
2. **32-bit Float sequence**: High-quality timeline
3. **YUV source footage**: Native format testing
4. **Mixed format timeline**: Format conversion testing

### Troubleshooting Plugin Visibility

If plugins appear in After Effects but not Premiere Pro:

1. Check installation location (must be common folder)
2. Verify no unsupported flags are set
3. Check for suite acquisition failures
4. Review Premiere Pro's plugin loading logs

**Log Location**:
- Windows: `%APPDATA%\Adobe\Premiere Pro\[version]\`
- macOS: `~/Library/Application Support/Adobe/Premiere Pro/[version]/`

### Forcing Plugin Reload

To troubleshoot loading issues:

1. Quit Premiere Pro completely
2. Move files from MediaCore folder temporarily
3. Relaunch Premiere Pro while holding Shift+Alt (Windows) or Shift+Option (macOS)
4. Restore plugin files
5. Relaunch normally

---

## Summary and Best Practices

### Do's

1. **Always check `appl_id`** before using host-specific features
2. **Use common plugin folder** for installation
3. **Register for Premiere pixel formats** (BGRA, VUYA)
4. **Implement 32-bit float path** for high-quality rendering
5. **Use sequence_data** for instance state, not static variables
6. **Test in both hosts** with all quality settings
7. **Check suite availability** before using advanced features
8. **Provide Premiere Elements icons** if targeting that host

### Don'ts

1. **Don't use SmartFX** in Premiere-compatible effects
2. **Don't set audio flags** if Premiere compatibility is needed
3. **Don't rely on `UPDATE_PARAMS_UI`** during timeline scrubbing
4. **Don't use static variables** for render state
5. **Don't assume render order** is chronological
6. **Don't install to app-specific folders** only
7. **Don't use `PF_OutFlag2_PPRO_DO_NOT_CLONE_SEQUENCE_DATA_FOR_RENDER`**
8. **Don't use 16-bit rendering** (use 32f instead)

### Quick Reference: Host-Specific Code Branches

```cpp
PF_Err MainEntryPoint(
    PF_Cmd cmd,
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output,
    void *extra)
{
    bool inPremiere = (in_data->appl_id == 'PrMr');

    switch (cmd) {
        case PF_Cmd_GLOBAL_SETUP:
            return GlobalSetup(in_data, out_data, params, output, inPremiere);

        case PF_Cmd_RENDER:
            if (inPremiere) {
                return RenderPremiere(in_data, out_data, params, output);
            } else {
                return RenderAfterEffects(in_data, out_data, params, output);
            }

        case PF_Cmd_SMART_PRE_RENDER:
        case PF_Cmd_SMART_RENDER:
            if (inPremiere) {
                // SmartFX not supported - should never reach here
                return PF_Err_UNRECOGNIZED_PARAM_TYPE;
            }
            return HandleSmartFX(cmd, in_data, out_data, params, output, extra);
    }

    return PF_Err_NONE;
}
```

---

## Additional Resources

- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [Premiere Pro C++ SDK Guide](https://ppro-plugins.docsforadobe.dev/)
- [Adobe Developer Portal](https://developer.adobe.com/after-effects/)
- [GPU Effects & Transitions](https://ppro-plugins.docsforadobe.dev/gpu-effects-transitions/gpu-effects-transitions/)
- [Pixel Formats and Color Spaces](https://ppro-plugins.docsforadobe.dev/universals/pixel-formats-and-color-spaces/)

---

*Document generated: 2025-12-27*
*SDK Version: 25.6*
*Compatibility: After Effects CC 2020+, Premiere Pro CC 2020+*
