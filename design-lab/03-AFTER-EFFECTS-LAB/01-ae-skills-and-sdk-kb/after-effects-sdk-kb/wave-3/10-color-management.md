---
source: '[unknown - 10-color-management.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Color Management APIs in Adobe After Effects SDK

## Executive Summary

This document provides comprehensive documentation of the Color Management APIs available in the Adobe After Effects SDK. It covers the complete color pipeline from input interpretation through compositing to final output, including support for ICC profiles, OCIO (OpenColorIO), HDR workflows, and 32-bit float color processing.

The After Effects SDK provides color management capabilities through multiple suites:
- **AEGP_ColorSettingsSuite5** - Project-level color settings and ICC profile management
- **PF_ColorCallbacksSuite1** - Effect-level RGB/HLS/YIQ color conversion (8-bit)
- **PF_ColorCallbacks16Suite1** - 16-bit color conversion callbacks
- **PF_ColorCallbacksFloatSuite1** - 32-bit float color conversion callbacks
- **AEGP_IOInSuite5** - Color profile handling for AEIO import operations

---

## Table of Contents

1. [Color Management Overview](#color-management-overview)
2. [AEGP_ColorSettingsSuite5](#aegp_colorsettingssuite5)
3. [PF_ColorCallbacksSuite](#pf_colorcallbackssuite)
4. [Pixel Formats and Color Depth](#pixel-formats-and-color-depth)
5. [AEIO Color Profile Handling](#aeio-color-profile-handling)
6. [OCIO Integration](#ocio-integration)
7. [HDR and Wide Gamut Workflows](#hdr-and-wide-gamut-workflows)
8. [Display Color Management](#display-color-management)
9. [Linearization and Gamma](#linearization-and-gamma)
10. [Code Examples](#code-examples)
11. [Best Practices](#best-practices)
12. [API Reference](#api-reference)

---

## Color Management Overview

### The Color Pipeline

After Effects implements a color-managed workflow with the following stages:

```
Input Footage                    Working Color Space                     Output
     |                                  |                                   |
     v                                  v                                   v
[ICC Profile] --> [Working Space Conversion] --> [Compositing] --> [Output Profile]
     |                                  |                                   |
   Input                           Linear                              Display/
  Interpret                         Light                              Render
```

### Key Concepts

| Concept | Definition |
|---------|------------|
| **Working Color Space** | The color space in which all compositing operations occur |
| **Input Profile** | ICC profile describing the source footage color space |
| **Output Profile** | ICC profile for the target delivery format |
| **Display Profile** | Monitor profile used for preview display |
| **Linear Light** | Gamma 1.0 working mode for physically accurate blending |

### Color Engines

After Effects supports two color management engines:

1. **Adobe Color Managed** - Uses ICC (International Color Consortium) profiles
2. **OCIO Color Managed** - Uses OpenColorIO for ACES and custom color workflows

---

## AEGP_ColorSettingsSuite5

The `AEGP_ColorSettingsSuite5` provides comprehensive project-level color management functionality.

### Suite Constants

```cpp
#define kAEGPColorSettingsSuite          "AEGP Color Settings Suite"
#define kAEGPColorSettingsSuiteVersion5  5
```

### Color Space Transformation Functions

#### AEGP_XformWorkingToViewColorSpace

Transforms colors from working color space to view color space.

```cpp
A_Err AEGP_XformWorkingToViewColorSpace(
    AEGP_PluginID       plugin_id,
    AEGP_ItemH          itemH,
    AEGP_WorldH         *worldPH
);
```

| Parameter | Description |
|-----------|-------------|
| `plugin_id` | Your plugin's registered ID |
| `itemH` | The item whose view is being transformed |
| `worldPH` | Pointer to the world buffer to transform |

#### AEGP_DoesViewHaveColorSpaceXform

Determines if a color space transform applies to the current item view.

```cpp
A_Err AEGP_DoesViewHaveColorSpaceXform(
    AEGP_ItemH          itemH,
    AEGP_ItemMRUViewH   viewH,
    A_Boolean           *has_xformPB
);
```

### ICC Profile Functions

#### AEGP_GetNewWorkingSpaceColorProfile

Retrieves the current working space ICC profile.

```cpp
A_Err AEGP_GetNewWorkingSpaceColorProfile(
    AEGP_PluginID           plugin_id,
    AEGP_CompH              compH,
    AEGP_ColorProfileP      *color_profilePP
);
```

**Usage Notes:**
- The returned profile must be disposed when no longer needed
- Use this when unpacking non-RGB data directly into working space
- Essential for AEIO plugins handling color-managed media

#### AEGP_GetNewColorProfileFromICCProfile

Creates an AEGP color profile from raw ICC profile data.

```cpp
A_Err AEGP_GetNewColorProfileFromICCProfile(
    AEGP_PluginID           plugin_id,
    A_long                  icc_sizeL,
    const void              *icc_dataPV,
    AEGP_ColorProfileP      *color_profilePP
);
```

#### AEGP_GetNewICCProfileFromColorProfile

Extracts ICC profile data from an AEGP color profile.

```cpp
A_Err AEGP_GetNewICCProfileFromColorProfile(
    AEGP_PluginID           plugin_id,
    AEGP_ConstColorProfileP color_profileP,
    AEGP_MemHandle          *icc_dataPH
);
```

#### AEGP_GetColorProfileApproximateGamma

Returns the approximate gamma value for a color profile.

```cpp
A_Err AEGP_GetColorProfileApproximateGamma(
    AEGP_ConstColorProfileP color_profileP,
    A_FpShort               *gammaPS
);
```

#### AEGP_IsRGBColorProfile

Validates whether a color profile describes an RGB color space.

```cpp
A_Err AEGP_IsRGBColorProfile(
    AEGP_ConstColorProfileP color_profileP,
    A_Boolean               *is_rgbPB
);
```

### Working Space Configuration

#### AEGP_SetWorkingColorSpace

Assigns a color profile to the composition working space.

```cpp
A_Err AEGP_SetWorkingColorSpace(
    AEGP_CompH              compH,
    AEGP_ConstColorProfileP color_profileP
);
```

#### AEGP_GetNewColorProfileDescription

Returns a textual description of a color profile.

```cpp
A_Err AEGP_GetNewColorProfileDescription(
    AEGP_PluginID           plugin_id,
    AEGP_ConstColorProfileP color_profileP,
    AEGP_MemHandle          *descPH
);
```

### OCIO-Specific Functions

#### AEGP_IsOCIOColorManagementUsed

Checks if the project uses the OCIO color management engine.

```cpp
A_Err AEGP_IsOCIOColorManagementUsed(
    AEGP_ProjectH           projH,
    A_Boolean               *uses_ocioPB
);
```

#### AEGP_GetOCIOConfigurationFile

Retrieves the OCIO configuration filename.

```cpp
A_Err AEGP_GetOCIOConfigurationFile(
    AEGP_ProjectH           projH,
    AEGP_MemHandle          *config_filenamePH
);
```

#### AEGP_GetOCIOConfigurationFilePath

Gets the absolute path to the OCIO configuration file.

```cpp
A_Err AEGP_GetOCIOConfigurationFilePath(
    AEGP_ProjectH           projH,
    AEGP_MemHandle          *config_pathPH
);
```

#### AEGP_GetOCIOWorkingColorSpace

Returns the project's OCIO working color space name.

```cpp
A_Err AEGP_GetOCIOWorkingColorSpace(
    AEGP_ProjectH           projH,
    AEGP_MemHandle          *working_spacePH
);
```

#### AEGP_GetOCIODisplayColorSpace

Retrieves the OCIO display and view transform settings.

```cpp
A_Err AEGP_GetOCIODisplayColorSpace(
    AEGP_ProjectH           projH,
    AEGP_MemHandle          *display_spacePH,
    AEGP_MemHandle          *view_transformPH
);
```

### Blending Operations

#### AEGP_GetBlendingTables

Retrieves current blending tables for transfer operations.

```cpp
A_Err AEGP_GetBlendingTables(
    AEGP_PluginID               plugin_id,
    AEGP_CompH                  compH,
    PF_EffectBlendingTables     *blend_tablesPP
);
```

---

## PF_ColorCallbacksSuite

The `PF_ColorCallbacksSuite` provides effect-level color conversion functions for transforming between RGB and alternative color spaces (HLS, YIQ).

### Suite Versions

| Suite | Version | Bit Depth | Status |
|-------|---------|-----------|--------|
| `PF_ColorCallbacksSuite1` | 1 | 8-bit | Active |
| `PF_ColorCallbacks16Suite1` | 1 | 16-bit | Frozen (AE 5.0) |
| `PF_ColorCallbacksFloatSuite1` | 1 | 32-bit float | Active |

### Color Space Types

#### HLS (Hue, Lightness, Saturation)

```cpp
typedef PF_Fixed PF_HLS_Pixel[3];
// [0] = Hue (0-255 maps to 0-360 degrees in 8-bit)
// [1] = Lightness (0-255 in 8-bit, 0-32768 in 16-bit)
// [2] = Saturation (0-255 in 8-bit, 0-32768 in 16-bit)
```

#### YIQ (Luminance, In-phase, Quadrature)

```cpp
typedef PF_Fixed PF_YIQ_Pixel[3];
// [0] = Y (Luminance): 0-1 range
// [1] = I (In-phase): -0.5959 to 0.5959
// [2] = Q (Quadrature): -0.5227 to 0.5227
```

### 8-bit Color Callbacks (PF_ColorCallbacksSuite1)

#### RGBtoHLS

Converts an 8-bit RGB pixel to HLS color space.

```cpp
PF_Err (*RGBtoHLS)(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    PF_HLS_Pixel    hls
);
```

#### HLStoRGB

Converts HLS values back to an 8-bit RGB pixel.

```cpp
PF_Err (*HLStoRGB)(
    PF_ProgPtr      effect_ref,
    PF_HLS_Pixel    hls,
    PF_Pixel        *rgb
);
```

#### RGBtoYIQ

Converts an 8-bit RGB pixel to YIQ color space.

```cpp
PF_Err (*RGBtoYIQ)(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    PF_YIQ_Pixel    yiq
);
```

#### YIQtoRGB

Converts YIQ values back to an 8-bit RGB pixel.

```cpp
PF_Err (*YIQtoRGB)(
    PF_ProgPtr      effect_ref,
    PF_YIQ_Pixel    yiq,
    PF_Pixel        *rgb
);
```

#### Luminance

Extracts the luminance value from an RGB pixel.

```cpp
PF_Err (*Luminance)(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *lumP  // Returns 100 * luminance value
);
```

#### Hue

Extracts the hue value from an RGB pixel.

```cpp
PF_Err (*Hue)(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *hueP  // 0-255 maps to 0-360 degrees
);
```

#### Lightness

Extracts the lightness value from an RGB pixel.

```cpp
PF_Err (*Lightness)(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *lightnessP  // 0-255 range
);
```

#### Saturation

Extracts the saturation value from an RGB pixel.

```cpp
PF_Err (*Saturation)(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *satP  // 0-255 range
);
```

### 16-bit Color Callbacks (PF_ColorCallbacks16Suite1)

Identical function signatures but operates on `PF_Pixel16` with extended value ranges:

- Lightness: 0-32768
- Saturation: 0-32768
- Hue: Same 0-255 to 0-360 mapping

### 32-bit Float Color Callbacks (PF_ColorCallbacksFloatSuite1)

Operates on `PF_PixelFloat` with normalized float ranges:

- Luminance: Returns unscaled float value (not 100x multiplied)
- Hue: Returns float in 0-360 degree range directly
- Lightness: Returns normalized float 0.0-1.0
- Saturation: Returns normalized float 0.0-1.0

### Important Conversion Notes

**Fixed Point Conversion:**
```cpp
// PF_HLS_Pixel uses Fixed Point format
// Use FIX_2_FLOAT(X) macro for conversion to float
A_FpShort hue_float = FIX_2_FLOAT(hls[0]);
```

**8-bit Limitation:**
The RGB to HLS callbacks only work with 8bpc data. For 16-bit and 32-bit modes, implement custom conversion functions.

---

## Pixel Formats and Color Depth

### Pixel Structure Definitions

```cpp
// 8-bit pixel (standard)
typedef struct {
    A_u_char    alpha;
    A_u_char    red;
    A_u_char    green;
    A_u_char    blue;
} PF_Pixel8;  // Also: PF_Pixel, PF_UnionablePixel

// 16-bit pixel (deep color)
typedef struct {
    A_u_short   alpha;
    A_u_short   red;
    A_u_short   green;
    A_u_short   blue;
} PF_Pixel16;

// 32-bit float pixel (HDR capable)
typedef struct {
    PF_FpShort  alpha;
    PF_FpShort  red;
    PF_FpShort  green;
    PF_FpShort  blue;
} PF_PixelFloat;  // Also: PF_Pixel32
```

### Pixel Format Enumeration

```cpp
typedef enum {
    PF_PixelFormat_ARGB32 = 0,   // 8-bit per channel
    PF_PixelFormat_ARGB64,       // 16-bit per channel
    PF_PixelFormat_ARGB128       // 32-bit float per channel
} PF_PixelFormat;
```

### Value Ranges

| Depth | Type | Range | Max Constant |
|-------|------|-------|--------------|
| 8-bit | `A_u_char` | 0-255 | `PF_MAX_CHAN8` |
| 16-bit | `A_u_short` | 0-32767 | `PF_MAX_CHAN16` |
| 32-bit | `PF_FpShort` | 0.0-1.0 (normalized) | 1.0f |

### Enabling Deep Color Support

To enable your effect for different bit depths, set the appropriate output flags:

```cpp
// In PF_Cmd_GLOBAL_SETUP
out_data->out_flags |= PF_OutFlag_DEEP_COLOR_AWARE;      // 16-bit
out_data->out_flags2 |= PF_OutFlag2_FLOAT_COLOR_AWARE;   // 32-bit
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_SMART_RENDER; // Required for 32-bit
```

### Multi-Depth Rendering Pattern

```cpp
// Recommended approach: Write core function in float, adapt for bit depths
static PF_Err ProcessPixelFloat(
    PF_PixelFloat   *inP,
    PF_PixelFloat   *outP,
    void            *refcon
);

// In render function, switch based on pixel format
switch (format) {
    case PF_PixelFormat_ARGB128:  // 32-bit
        // Direct float processing
        suites.iterate32(in_data, 0, output_world->height,
                        input_world, NULL, NULL,
                        ProcessPixelFloat, output_world);
        break;

    case PF_PixelFormat_ARGB64:   // 16-bit
        // Convert to float, process, convert back
        suites.iterate16(in_data, 0, output_world->height,
                        input_world, NULL, NULL,
                        ProcessPixel16, output_world);
        break;

    case PF_PixelFormat_ARGB32:   // 8-bit
        suites.iterate8(in_data, 0, output_world->height,
                       input_world, NULL, NULL,
                       ProcessPixel8, output_world);
        break;
}
```

### PF_PixelDataSuite Functions

```cpp
// Get 8-bit pixel data
PF_Err (*get_pixel_data8)(
    PF_EffectWorld  *worldP,
    PF_PixelPtr     pixelsP,
    PF_Pixel8       **pixel8PP
);

// Get 16-bit pixel data
PF_Err (*get_pixel_data16)(
    PF_EffectWorld  *worldP,
    PF_PixelPtr     pixelsP,
    PF_Pixel16      **pixel16PP
);

// Get 32-bit float pixel data
PF_Err (*get_pixel_data_float)(
    PF_EffectWorld  *worldP,
    PF_PixelPtr     pixelsP,
    PF_PixelFloat   **pixelFloatPP
);
```

**Note:** These functions return NULL if there's a depth mismatch between the requested format and the world's actual format.

---

## AEIO Color Profile Handling

AEIOs (After Effects Input/Output plugins) manage color profiles during media import and export using `AEGP_IOInSuite5`.

### Color Profile Functions for Import

#### AEGP_SetInSpecEmbeddedColorProfile

Sets the embedded color profile for imported footage.

```cpp
A_Err AEGP_SetInSpecEmbeddedColorProfile(
    AEIO_InSpecH            inSpecH,
    AEGP_ConstColorProfileP color_profileP,  // NULL for non-RGB
    const A_UTF16Char       *profile_descP   // NULL for RGB
);
```

**Usage Rules:**
- Either `color_profileP` or `profile_descP` should be NULL (not both)
- For RGB data with embedded ICC profile: pass profile, set description to NULL
- For non-RGB data: pass NULL profile, provide color space description string

#### AEGP_SetInSpecAssignedColorProfile

Assigns a color profile to footage being unpacked to a specific RGB space.

```cpp
A_Err AEGP_SetInSpecAssignedColorProfile(
    AEIO_InSpecH            inSpecH,
    AEGP_ConstColorProfileP color_profileP
);
```

**Usage Notes:**
- Required when unpacking non-RGB data into a specific RGB color space
- If not set, RGB data will be incorrectly interpreted as working space

### Import Workflow Example

```cpp
// Example: AEIO color profile handling during import
A_Err HandleFootageColorProfile(
    AEIO_InSpecH            inSpecH,
    AEGP_SuiteHandler       *suites
) {
    A_Err err = A_Err_NONE;
    AEGP_ColorProfileP working_profile = NULL;

    // Get working space profile
    ERR(suites->ColorSettingsSuite()->AEGP_GetNewWorkingSpaceColorProfile(
        my_plugin_id,
        compH,
        &working_profile
    ));

    // If footage has embedded RGB profile
    if (has_embedded_icc_profile) {
        AEGP_ColorProfileP embedded_profile = NULL;

        ERR(suites->ColorSettingsSuite()->AEGP_GetNewColorProfileFromICCProfile(
            my_plugin_id,
            icc_size,
            icc_data,
            &embedded_profile
        ));

        ERR(suites->IOInSuite()->AEGP_SetInSpecEmbeddedColorProfile(
            inSpecH,
            embedded_profile,
            NULL  // description NULL for RGB
        ));
    }
    // If footage is non-RGB (e.g., YUV video)
    else if (is_non_rgb_footage) {
        // Pass description, not profile
        ERR(suites->IOInSuite()->AEGP_SetInSpecEmbeddedColorProfile(
            inSpecH,
            NULL,  // profile NULL for non-RGB
            L"Rec. 709"  // UTF-16 color space description
        ));

        // Assign output RGB profile if not unpacking to working space
        if (!unpack_to_working_space) {
            ERR(suites->IOInSuite()->AEGP_SetInSpecAssignedColorProfile(
                inSpecH,
                target_rgb_profile
            ));
        }
    }

    return err;
}
```

### AEIO_InSpecH Functions Summary

| Function | Purpose |
|----------|---------|
| `AEGP_SetInSpecEmbeddedColorProfile` | Set embedded source profile |
| `AEGP_SetInSpecAssignedColorProfile` | Assign conversion target profile |
| `AEGP_GetNewWorkingSpaceColorProfile` | Get project working space |
| `AEGP_SetInSpecDimensions` | Set footage dimensions |
| `AEGP_SetInSpecDepth` | Set footage bit depth |

---

## OCIO Integration

After Effects integrates OpenColorIO (OCIO) as an alternative color management engine, enabling ACES workflows and custom color pipelines.

### OCIO Configuration

When OCIO color management is enabled:
- Project uses OpenColorIO-based transforms
- Default ACES 2.0 configuration available
- Custom OCIO config files supported

### Querying OCIO State

```cpp
// Check if project uses OCIO
A_Boolean uses_ocio = FALSE;
ERR(suites->ColorSettingsSuite()->AEGP_IsOCIOColorManagementUsed(
    projH,
    &uses_ocio
));

if (uses_ocio) {
    AEGP_MemHandle config_path = NULL;
    AEGP_MemHandle working_space = NULL;

    // Get configuration file path
    ERR(suites->ColorSettingsSuite()->AEGP_GetOCIOConfigurationFilePath(
        projH,
        &config_path
    ));

    // Get working color space name (e.g., "ACEScg")
    ERR(suites->ColorSettingsSuite()->AEGP_GetOCIOWorkingColorSpace(
        projH,
        &working_space
    ));
}
```

### OCIO Effects (Built-in)

After Effects provides native OCIO effects:

| Effect | Purpose |
|--------|---------|
| **OCIO File Transform** | Apply LUT or CDL files |
| **OCIO Color Space Transform** | Convert between color spaces |
| **OCIO Display Transform** | Apply display view transforms |
| **OCIO Look Transform** | Apply look transforms from config |
| **OCIO CDL Transform** | Apply Color Decision Lists |

### OCIO Configuration File Structure

```yaml
# Typical ACES OCIO config structure
ocio_profile_version: 2

search_path: luts

roles:
  color_picking: sRGB - Texture
  color_timing: ACEScct
  compositing_linear: ACEScg
  data: Raw
  default: ACEScg
  scene_linear: ACEScg

displays:
  sRGB:
    - !<View> {name: ACES 1.0 - SDR Video, colorspace: sRGB}
    - !<View> {name: Raw, colorspace: Raw}

colorspaces:
  - !<ColorSpace>
    name: ACEScg
    family: ACES
    bitdepth: 32f
    isdata: false
```

---

## HDR and Wide Gamut Workflows

### Supported Color Spaces

| Color Space | Gamut | Transfer | Use Case |
|-------------|-------|----------|----------|
| **sRGB** | sRGB | ~2.2 gamma | Web, standard displays |
| **Rec. 709** | Rec.709 | Rec.709 | HDTV broadcast |
| **Rec. 2020** | Rec.2020 | PQ/HLG | 4K/8K HDR broadcast |
| **ACEScg** | AP1 | Linear | VFX compositing |
| **ACES 2065-1** | AP0 | Linear | Archival, interchange |
| **P3-D65** | DCI-P3 | 2.6 gamma | Digital cinema |
| **ProPhoto RGB** | ProPhoto | Linear | Wide gamut photo |

### 32-bit Float Requirements

For HDR workflows, 32-bit float is required:

```cpp
// Check project bit depth
AEGP_ProjBitDepth bit_depth;
ERR(suites->ProjSuite()->AEGP_GetProjectBitDepth(
    projH,
    &bit_depth
));

// Set to 32-bit for HDR
if (bit_depth != AEGP_ProjBitDepth_32) {
    ERR(suites->ProjSuite()->AEGP_SetProjectBitDepth(
        projH,
        AEGP_ProjBitDepth_32
    ));
}
```

### HDR Value Handling

32-bit float allows values outside the 0-1 range (overbright/superwhite):

```cpp
// HDR pixel processing example
PF_Err ProcessHDRPixel(PF_PixelFloat *pixel) {
    // Values can exceed 1.0 for HDR
    if (pixel->red > 1.0f || pixel->green > 1.0f || pixel->blue > 1.0f) {
        // Handle overbright values
        // Apply tone mapping, etc.
    }

    // Don't clamp - preserve HDR range
    return PF_Err_NONE;
}
```

### ACES Workflow Setup

For ACES workflows in After Effects:

1. **Project Settings:**
   - Color Engine: OCIO color managed
   - Working Color Space: ACEScg (compositing_linear)
   - Bit Depth: 32-bit

2. **Display Settings:**
   - Display Color Space: sRGB or Rec.709
   - View Transform: ACES 1.0 - SDR Video

3. **Import Interpretation:**
   - Override Media Color Space as needed
   - Assign appropriate input color space per footage

### Wide Gamut Considerations

- ACEScg encompasses P3 but uses non-physically realizable primaries
- Rec.2020 is larger than P3, suitable for HDR delivery
- Always use 16-bit minimum for wide gamut (32-bit preferred)

---

## Display Color Management

### Enabling Display Color Management

Display color management converts working space colors to monitor profile for accurate preview.

**Toggle Methods:**
- View menu: Use Display Color Management
- Keyboard: Shift+/ (Windows), Ctrl+Opt+/ (macOS)
- Button: Yellow + indicator in viewer

### Display Color Space (OCIO Mode)

When using OCIO, the Composition panel provides a Display Color Space menu:

```cpp
// Get current display color space settings
AEGP_MemHandle display_space = NULL;
AEGP_MemHandle view_transform = NULL;

ERR(suites->ColorSettingsSuite()->AEGP_GetOCIODisplayColorSpace(
    projH,
    &display_space,
    &view_transform
));
```

### Output Simulation

Simulate final output appearance without rendering:

- View > Simulate Output
- Available presets: sRGB, film stocks, custom
- Applies output space then converts back to display space

### View Transform Application

The OCIO Display Transform effect provides:
- Selection from available display devices
- View transforms per selected display
- Inverse transform option

---

## Linearization and Gamma

### Linear Light Workflow

Linear light (gamma 1.0) provides physically accurate blending:

```cpp
// Enable linear blending in project
// "Blend Colors Using 1.0 Gamma" option
```

**Benefits:**
- Prevents edge/halo artifacts
- Accurate motion blur
- Correct anti-aliasing
- Proper high-contrast color blending

### Gamma Curve Types

| Type | Gamma | Use Case |
|------|-------|----------|
| Linear | 1.0 | Compositing, CGI rendering |
| sRGB | ~2.2 (with linear toe) | Web, standard monitors |
| Rec.709 | Complex curve | Broadcast video |
| Gamma 2.2 | 2.2 | Legacy displays |
| Gamma 2.4 | 2.4 | DCI cinema |

### Linearizing Working Space

```cpp
// Project Settings > Color > Linearize Working Color Space
// Performs operations in linear light while preserving working space primaries
```

**When to Linearize:**
- CGI compositing
- Motion blur rendering
- Layer blending
- Image resampling

### sRGB Gamma Characteristics

sRGB uses a compound gamma curve:
- Linear section (gamma 1.0) near black
- Non-linear section with 2.4 exponent elsewhere
- Overall effective gamma approximately 2.2
- Avoids infinite slope at zero

### Gamma Approximation Query

```cpp
// Get profile's approximate gamma
A_FpShort gamma = 0.0f;
ERR(suites->ColorSettingsSuite()->AEGP_GetColorProfileApproximateGamma(
    color_profileP,
    &gamma
));
// gamma will be 1.0 for linear, ~2.2 for sRGB, etc.
```

---

## Code Examples

### Example 1: Complete Color Callback Usage

```cpp
// Effect that shifts hue using color callbacks
PF_Err ShiftHue(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output
) {
    PF_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(in_data->pica_basicP);

    PF_ColorCallbacksSuite1 *colorSuite = NULL;
    ERR(AEFX_AcquireSuite(in_data,
                          out_data,
                          kPFColorCallbacksSuite,
                          kPFColorCallbacksSuiteVersion1,
                          "Could not acquire ColorCallbacksSuite",
                          (void**)&colorSuite));

    if (!err && colorSuite) {
        // Iterate over pixels
        for (A_long y = 0; y < output->height; y++) {
            PF_Pixel *pixel = (PF_Pixel*)((char*)output->data +
                              y * output->rowbytes);

            for (A_long x = 0; x < output->width; x++) {
                PF_HLS_Pixel hls;

                // Convert RGB to HLS
                ERR(colorSuite->RGBtoHLS(
                    in_data->effect_ref,
                    pixel,
                    hls
                ));

                // Shift hue (fixed point)
                A_long hue_shift = params[HUE_PARAM]->u.sd.value;
                hls[0] = (hls[0] + LONG2FIX(hue_shift)) % LONG2FIX(256);

                // Convert back to RGB
                ERR(colorSuite->HLStoRGB(
                    in_data->effect_ref,
                    hls,
                    pixel
                ));

                pixel++;
            }
        }
    }

    return err;
}
```

### Example 2: Multi-Bit-Depth Effect Support

```cpp
// Header for multi-depth effect
static PF_Err
Render(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output
) {
    PF_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(in_data->pica_basicP);

    PF_EffectWorld *input_worldP = &params[INPUT_LAYER]->u.ld;
    PF_PixelFormat format = PF_PixelFormat_ARGB32;

    // Determine pixel format
    ERR(suites.WorldSuite2()->PF_GetPixelFormat(input_worldP, &format));

    if (!err) {
        switch (format) {
            case PF_PixelFormat_ARGB128:
                err = Render32(in_data, out_data, params, output);
                break;

            case PF_PixelFormat_ARGB64:
                err = Render16(in_data, out_data, params, output);
                break;

            case PF_PixelFormat_ARGB32:
            default:
                err = Render8(in_data, out_data, params, output);
                break;
        }
    }

    return err;
}

// 32-bit float version
static PF_Err
Render32(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output
) {
    PF_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(in_data->pica_basicP);

    PF_EffectWorld *input = &params[INPUT_LAYER]->u.ld;
    PF_PixelFloat *src_pixels = NULL;
    PF_PixelFloat *dst_pixels = NULL;

    ERR(suites.PixelDataSuite1()->get_pixel_data_float(
        input, NULL, &src_pixels
    ));
    ERR(suites.PixelDataSuite1()->get_pixel_data_float(
        output, NULL, &dst_pixels
    ));

    if (!err && src_pixels && dst_pixels) {
        for (A_long y = 0; y < output->height; y++) {
            PF_PixelFloat *src = (PF_PixelFloat*)((char*)src_pixels +
                                  y * input->rowbytes);
            PF_PixelFloat *dst = (PF_PixelFloat*)((char*)dst_pixels +
                                  y * output->rowbytes);

            for (A_long x = 0; x < output->width; x++) {
                // Process in float - preserve HDR range
                dst->alpha = src->alpha;
                dst->red   = ProcessChannel(src->red);
                dst->green = ProcessChannel(src->green);
                dst->blue  = ProcessChannel(src->blue);

                src++;
                dst++;
            }
        }
    }

    return err;
}
```

### Example 3: AEIO Color Profile Import

```cpp
// AEIO: Handle color profile during InitInSpecFromFile
A_Err
AEIO_InitInSpecFromFile(
    AEIO_BasicData  *basic_dataP,
    const A_UTF16Char *file_pathZ,
    AEIO_InSpecH    specH
) {
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Read file and detect color profile...
    A_Boolean has_icc = DetectEmbeddedICCProfile(file_pathZ, &icc_data, &icc_size);

    if (has_icc) {
        // File has embedded ICC profile
        AEGP_ColorProfileP profile = NULL;

        ERR(suites.ColorSettingsSuite5()->AEGP_GetNewColorProfileFromICCProfile(
            basic_dataP->aegp_plug_id,
            icc_size,
            icc_data,
            &profile
        ));

        if (!err && profile) {
            // Check if it's an RGB profile
            A_Boolean is_rgb = FALSE;
            ERR(suites.ColorSettingsSuite5()->AEGP_IsRGBColorProfile(
                profile, &is_rgb
            ));

            if (is_rgb) {
                ERR(suites.IOInSuite5()->AEGP_SetInSpecEmbeddedColorProfile(
                    specH,
                    profile,
                    NULL  // description NULL for RGB
                ));
            }

            // Dispose profile after use
            ERR(suites.ColorSettingsSuite5()->AEGP_DisposeColorProfile(profile));
        }
    }
    else {
        // No embedded profile - let AE use interpretation rules
        // Or assign a default based on file type

        if (IsVideoFormat(file_pathZ)) {
            // Typical video is Rec.709
            ERR(suites.IOInSuite5()->AEGP_SetInSpecEmbeddedColorProfile(
                specH,
                NULL,
                L"Rec. 709"  // UTF-16 description
            ));
        }
    }

    return err;
}
```

### Example 4: Working with OCIO Settings

```cpp
// Query and use OCIO configuration
A_Err
HandleOCIOProject(
    AEGP_PluginID   plugin_id,
    AEGP_ProjectH   projH
) {
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Check if OCIO is enabled
    A_Boolean uses_ocio = FALSE;
    ERR(suites.ColorSettingsSuite5()->AEGP_IsOCIOColorManagementUsed(
        projH,
        &uses_ocio
    ));

    if (uses_ocio) {
        AEGP_MemHandle config_path_h = NULL;
        AEGP_MemHandle working_space_h = NULL;
        AEGP_MemHandle display_h = NULL;
        AEGP_MemHandle view_h = NULL;

        // Get OCIO config path
        ERR(suites.ColorSettingsSuite5()->AEGP_GetOCIOConfigurationFilePath(
            projH,
            &config_path_h
        ));

        // Get working color space (e.g., "ACEScg")
        ERR(suites.ColorSettingsSuite5()->AEGP_GetOCIOWorkingColorSpace(
            projH,
            &working_space_h
        ));

        // Get display color space settings
        ERR(suites.ColorSettingsSuite5()->AEGP_GetOCIODisplayColorSpace(
            projH,
            &display_h,
            &view_h
        ));

        // Use OCIO API directly for color transforms
        if (!err) {
            A_UTF16Char *config_path = NULL;
            A_UTF16Char *working_space = NULL;

            suites.MemorySuite1()->AEGP_LockMemHandle(config_path_h,
                                                       (void**)&config_path);
            suites.MemorySuite1()->AEGP_LockMemHandle(working_space_h,
                                                       (void**)&working_space);

            // Initialize OCIO with this config...
            // OCIO::Config::CreateFromFile(config_path);

            suites.MemorySuite1()->AEGP_UnlockMemHandle(config_path_h);
            suites.MemorySuite1()->AEGP_UnlockMemHandle(working_space_h);
        }

        // Cleanup
        if (config_path_h) suites.MemorySuite1()->AEGP_FreeMemHandle(config_path_h);
        if (working_space_h) suites.MemorySuite1()->AEGP_FreeMemHandle(working_space_h);
        if (display_h) suites.MemorySuite1()->AEGP_FreeMemHandle(display_h);
        if (view_h) suites.MemorySuite1()->AEGP_FreeMemHandle(view_h);
    }

    return err;
}
```

---

## Best Practices

### 1. Always Support Multiple Bit Depths

```cpp
// Set flags in GlobalSetup
out_data->out_flags |= PF_OutFlag_DEEP_COLOR_AWARE;
out_data->out_flags2 |= PF_OutFlag2_FLOAT_COLOR_AWARE;
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_SMART_RENDER;
```

### 2. Preserve HDR Range in 32-bit

```cpp
// DON'T clamp 32-bit values to 0-1
// DO preserve overbright values for HDR workflows
if (format == PF_PixelFormat_ARGB128) {
    // Allow values > 1.0 for HDR headroom
    out_pixel->red = processed_value;  // May exceed 1.0
}
```

### 3. Respect Color Management Settings

```cpp
// Query project settings before assuming color space
AEGP_ProjBitDepth depth;
suites->ProjSuite()->AEGP_GetProjectBitDepth(projH, &depth);

A_Boolean uses_ocio;
suites->ColorSettingsSuite()->AEGP_IsOCIOColorManagementUsed(projH, &uses_ocio);
```

### 4. Handle ICC Profile Disposal

```cpp
// Always dispose color profiles after use
AEGP_ColorProfileP profile = NULL;
ERR(AEGP_GetNewWorkingSpaceColorProfile(..., &profile));

// Use profile...

ERR(AEGP_DisposeColorProfile(profile));  // Required cleanup
```

### 5. Use Appropriate Color Space for Operations

- **Compositing/Blending**: Linear (gamma 1.0) working space
- **Color Correction**: Log or linear depending on operation
- **Final Output**: Target delivery color space
- **Display Preview**: Monitor profile via display management

### 6. AEIO Color Profile Guidelines

- Always set embedded profile if footage has ICC data
- Use profile description (not profile) for non-RGB sources
- Assign output profile if unpacking to specific RGB space
- Get working space profile for direct working space output

### 7. Test Across Color Configurations

- Test with Adobe Color Management ON and OFF
- Test with OCIO enabled (ACES workflows)
- Test with different working spaces (sRGB, Rec.709, ACEScg)
- Verify 8/16/32-bit rendering produces consistent results

---

## API Reference

### Suite Summary

| Suite | Version | Purpose |
|-------|---------|---------|
| `AEGP_ColorSettingsSuite` | 5 | Project color settings, ICC profiles, OCIO |
| `PF_ColorCallbacksSuite` | 1 | 8-bit RGB/HLS/YIQ conversion |
| `PF_ColorCallbacks16Suite` | 1 | 16-bit color conversion |
| `PF_ColorCallbacksFloatSuite` | 1 | 32-bit float color conversion |
| `AEGP_IOInSuite` | 5 | AEIO import color profiles |
| `AEGP_IOOutSuite` | 4 | AEIO export color handling |
| `AEGP_ProjSuite` | 6 | Project bit depth settings |
| `PF_PixelDataSuite` | 1 | Pixel format access |
| `PF_WorldSuite` | 2 | World/buffer format queries |

### Common Color Space Identifiers

| Identifier | Description |
|------------|-------------|
| `sRGB IEC61966-2.1` | Standard RGB for web |
| `HDTV (Rec. 709)` | HD broadcast standard |
| `ProPhoto RGB` | Wide gamut photography |
| `ACEScg` | ACES compositing space (linear AP1) |
| `ACES 2065-1` | ACES archival (linear AP0) |
| `Rec. 2020` | UHD/HDR broadcast |
| `DCI-P3` | Digital cinema |

### Error Codes

| Code | Meaning |
|------|---------|
| `A_Err_NONE` | Success |
| `A_Err_STRUCT` | Invalid structure |
| `A_Err_PARAMETER` | Invalid parameter |
| `A_Err_ALLOC` | Memory allocation failure |
| `PF_Err_INVALID_CALLBACK` | Callback not available |

---

## References

### Official Documentation
- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [AEGP Suites Reference](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Color Space Conversion](https://ae-plugins.docsforadobe.dev/effect-details/color-space-conversion/)
- [AEIOs Documentation](https://ae-plugins.docsforadobe.dev/aeios/aeios/)
- [Managing Color in After Effects](https://helpx.adobe.com/after-effects/using/color-management.html)
- [OpenColorIO and ACES](https://helpx.adobe.com/after-effects/using/opencolorio-aces-color-management.html)

### SDK Resources
- [Adobe After Effects SDK](https://developer.adobe.com/after-effects/)
- [SDK Header Files (GitHub Mirror)](https://github.com/takahirome/AdobeScripts/tree/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Headers)

### External Resources
- [OpenColorIO](https://opencolorio.org/)
- [ACES Central](https://acescentral.com/)
- [Academy Software Foundation](https://www.aswf.io/)

### Community Resources
- [Multi-Bit-Depth Plugin Tutorial](https://s-nako.work/2020/04/how-to-adapt-your-ae-plugin-for-8-16-32bit-color/)
- [ACES Pipeline Workflow](https://blog.frame.io/2021/08/23/aces-after-effects-resolve-workflow/)
- [Linear Light Compositing](https://prolost.com/blog/aces)

---

*Document Version: 1.0*
*Last Updated: 2025-12-28*
*SDK Reference: After Effects SDK 25.x*
