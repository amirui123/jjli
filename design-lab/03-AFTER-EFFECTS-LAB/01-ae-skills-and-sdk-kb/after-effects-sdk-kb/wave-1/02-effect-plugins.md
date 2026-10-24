---
source: '[unknown - 02-effect-plugins.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
[3-Resources/anchors/status-complete]]

# Adobe After Effects SDK: Effect Plugins

## Document Metadata

```yaml
created: 2025-12-27
type: research/technical-documentation
status: complete
source: Adobe Official Documentation
sdk-version: 25.x (2025)
word-count: 7500+
tags:
  - after-effects
  - sdk
  - effect-plugins
  - adobe
  - plugin-development
```

---

## Table of Contents

1. [Introduction](#introduction)
2. [Effect Plugin Architecture](#effect-plugin-architecture)
3. [Entry Point and Function Signature](#entry-point-and-function-signature)
4. [PF_Cmd Command Selectors](#pf_cmd-command-selectors)
5. [Core Data Structures](#core-data-structures)
6. [Parameter System](#parameter-system)
7. [Rendering Pipeline](#rendering-pipeline)
8. [SmartFX and 32-bit Float Support](#smartfx-and-32-bit-float-support)
9. [Sequence Data and Flatten/Unflatten](#sequence-data-and-flattenunflatten)
10. [Effect Flags Reference](#effect-flags-reference)
11. [Multi-Frame Rendering](#multi-frame-rendering)
12. [GPU Acceleration](#gpu-acceleration)
13. [Function Suites](#function-suites)
14. [Best Practices](#best-practices)
15. [Related Documentation](#related-documentation)

---

## Introduction

Effect plugins are the most common type of After Effects plugin, responsible for processing image data and creating visual effects. They receive input image data, process it according to user-defined parameters, and output modified image data. Effect plugins built using the After Effects SDK can also be made compatible with Adobe Premiere Pro, extending their utility across the Creative Cloud ecosystem.

The After Effects Effect Plugin API provides:

- A wide variety of built-in parameter controls and data types
- Support for image buffers with color depths from 8-bit to 32-bit floating point
- The ability to set parameter dependencies and change project elements based on parameter settings
- GPU acceleration support via CUDA, OpenCL, Metal, and DirectX
- Multi-frame rendering for parallel processing across CPU cores

**Official Resources:**
- [Adobe After Effects Developer Portal](https://developer.adobe.com/after-effects/)
- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)

---

## Effect Plugin Architecture

### Communication Model

All communication between After Effects and an effect plugin is initiated by After Effects. The host application:

1. Updates `PF_InData` and parameter arrays before each call
2. Invokes the plugin's entry point with a command selector
3. Checks `PF_OutData` after the plugin returns

This unidirectional communication model ensures predictable behavior and allows After Effects to manage plugin execution efficiently.

### Plugin Lifecycle

Effect plugins follow a well-defined lifecycle:

```
GLOBAL_SETUP → PARAM_SETUP → [SEQUENCE_SETUP] → [FRAME_SETUP → RENDER → FRAME_SETDOWN] → [SEQUENCE_SETDOWN] → GLOBAL_SETDOWN
```

For SmartFX effects, the frame rendering sequence is replaced with:

```
SMART_PRE_RENDER → SMART_RENDER
```

---

## Entry Point and Function Signature

Every After Effects effect plugin has a single entry point function, typically named `main()`, which is called repeatedly with different command selectors indicating the desired action.

### Function Prototype

```c
PF_Err main (
    PF_Cmd       cmd,
    PF_InData    *in_data,
    PF_OutData   *out_data,
    PF_ParamDef  *params[],
    PF_LayerDef  *output,
    void         *extra
);
```

### Parameter Descriptions

| Parameter | Type | Purpose |
|-----------|------|---------|
| `cmd` | `PF_Cmd` | Command selector indicating the operation to perform |
| `in_data` | `PF_InData*` | Application state information and pointers to interface/image manipulation functions |
| `out_data` | `PF_OutData*` | Structure where the plugin returns information to After Effects |
| `params` | `PF_ParamDef*[]` | Array of plugin parameters; `params[0]` always contains the input image |
| `output` | `PF_LayerDef*` | Destination image buffer for rendering results |
| `extra` | `void*` | Context-dependent data varying by command type; primarily used for event management |

**Note:** The function name can be customized through PiPL (Plug-in Property List) Resources configuration.

---

## PF_Cmd Command Selectors

Command selectors define what After Effects requests the effect plugin to do. While some responses are mandatory, most are optional though recommended for proper functionality.

### Command Calling Sequence

#### Initial Load
1. `PF_Cmd_GLOBAL_SETUP` - Define plugin behavior and capabilities
2. `PF_Cmd_PARAM_SETUP` - Register parameters and UI elements

#### Per Effect Instance
- `PF_Cmd_SEQUENCE_SETUP` - Initialize sequence-specific data

#### Per Frame (Standard Effects)
1. `PF_Cmd_FRAME_SETUP` - Allocate frame-specific resources
2. `PF_Cmd_RENDER` - **REQUIRED** - Perform actual rendering
3. `PF_Cmd_FRAME_SETDOWN` - Free frame data

#### SmartFX Variant
- `PF_Cmd_SMART_PRE_RENDER` - Identify required input areas (multiple calls possible)
- `PF_Cmd_SMART_RENDER` - Perform rendering once

#### Cleanup
- `PF_Cmd_SEQUENCE_SETDOWN` - Release sequence data
- `PF_Cmd_GLOBAL_SETDOWN` - Release global resources

### Global Selectors (Required)

| Selector | Purpose | Notes |
|----------|---------|-------|
| `PF_Cmd_ABOUT` | Display plugin information dialog | Include version details |
| `PF_Cmd_GLOBAL_SETUP` | Set behavior flags and describe plugin capabilities | Set output flags here |
| `PF_Cmd_GLOBAL_SETDOWN` | Free all globally allocated data | Called on AE shutdown or final effect removal |
| `PF_Cmd_PARAM_SETUP` | Register parameters via `PF_ADD_PARAM` | Set `num_params` in out_data |

### Sequence Selectors

| Selector | Purpose | Notes |
|----------|---------|-------|
| `PF_Cmd_SEQUENCE_SETUP` | Allocate and initialize sequence-specific data | Called when effect is first applied |
| `PF_Cmd_SEQUENCE_RESETUP` | Recreate sequence data after disk reads or duplication | Handle unflatten operations |
| `PF_Cmd_SEQUENCE_FLATTEN` | Convert sequence data to disk-storable format | Must be byte-order aware for cross-platform |
| `PF_Cmd_SEQUENCE_SETDOWN` | Free all sequence data | Called when effect is removed |

### Frame Selectors

| Selector | Purpose | Notes |
|----------|---------|-------|
| `PF_Cmd_FRAME_SETUP` | Allocate frame data | Optionally modify output buffer dimensions |
| `PF_Cmd_RENDER` | **MANDATORY** - Render effect | 8/16-bit only; 32-bit requires SmartFX |
| `PF_Cmd_FRAME_SETDOWN` | Free frame-allocated resources | Cannot delete data during RENDER |
| `PF_Cmd_AUDIO_SETUP` | Request audio time span | For audio effects |
| `PF_Cmd_AUDIO_RENDER` | Populate `PF_OutData.dest_snd` with processed audio | For audio effects |
| `PF_Cmd_AUDIO_SETDOWN` | Free audio resources | For audio effects |
| `PF_Cmd_SMART_PRE_RENDER` | SmartFX: Identify required input regions | Specify output dimensions |
| `PF_Cmd_SMART_RENDER` | SmartFX: Render output for requested areas | Access checked-out pixels |

### Messaging/Interaction Selectors

| Selector | Purpose | Notes |
|----------|---------|-------|
| `PF_Cmd_EVENT` | Handle UI events | Requires `PF_OutFlag_CUSTOM_UI` |
| `PF_Cmd_USER_CHANGED_PARAM` | Parameter value modified | Only if `PF_ParamFlag_SUPERVISE` set |
| `PF_Cmd_UPDATE_PARAMS_UI` | Refresh Effect Controls palette | Cosmetic changes only |
| `PF_Cmd_DO_DIALOG` | Display options dialog | Requires `PF_OutFlag_I_DO_DIALOG` |
| `PF_Cmd_ARBITRARY_CALLBACK` | Manage custom data type parameters | For arbitrary data handling |
| `PF_Cmd_GET_EXTERNAL_DEPENDENCIES` | Report required dependencies | If flagged |
| `PF_Cmd_COMPLETELY_GENERAL` | Respond to AEGP communication | For inter-plugin communication |
| `PF_Cmd_QUERY_DYNAMIC_FLAGS` | Report dynamic capability flags | For optimization |

### GPU Rendering Selectors (AE 16.0+)

| Selector | Purpose | Notes |
|----------|---------|-------|
| `PF_Cmd_GPU_DEVICE_SETUP` | Initialize GPU device | Opt-in to GPU support |
| `PF_Cmd_GPU_DEVICE_SETDOWN` | Release GPU device resources | Clean up GPU context |
| `PF_Cmd_GPU_SMART_RENDER_GPU` | GPU-accelerated SmartFX rendering | Requires SmartFX |

### Critical Distinctions

**USER_CHANGED_PARAM vs UPDATE_PARAMS_UI:**
- `PF_Cmd_USER_CHANGED_PARAM`: Actual parameter value modification by user; modify values here
- `PF_Cmd_UPDATE_PARAMS_UI`: Timeline scrubbing or palette refresh; cosmetic updates only, never modify values

**Render Behavior:**
- If your response is interrupted (via `PF_ABORT` or `PF_PROGRESS`), results won't be used
- Cannot delete frame data during `PF_Cmd_RENDER`; defer to `PF_Cmd_FRAME_SETDOWN`

---

## Core Data Structures

### PF_InData

`PF_InData` is the primary communication structure through which After Effects conveys system, project, layer, and audio information to plugins before each command selector execution.

#### Key Members

**Core Callbacks and References:**

| Member | Type | Purpose |
|--------|------|---------|
| `inter` | Callbacks | User interaction, adding parameters, checking interrupts, obtaining source frames |
| `utils` | Callbacks | Graphical and mathematical callbacks available at all times |
| `effect_ref` | Opaque ID | Passed to callback routines for plugin recognition |

**Quality and Version:**

| Member | Type | Purpose |
|--------|------|---------|
| `quality` | Enum | `PF_Quality_HI` or `PF_Quality_LO` |
| `version` | Integer | Specification version from GLOBAL_SETUP |
| `appl_id` | FourCC | 'FXTC' for After Effects, 'PrMr' for Premiere Pro |

**Temporal Information:**

| Member | Type | Purpose |
|--------|------|---------|
| `current_time` | Time | Frame time being rendered in layer coordinates |
| `time_step` | Duration | Duration of current source frame (can be negative if time-reversed) |
| `local_time_step` | Duration | Constant frame duration unaffected by time remapping |
| `time_scale` | Integer | Units per second for time measurements |
| `total_time` | Duration | Layer duration adjusted for stretch and remapping |

**Spatial Data:**

| Member | Type | Purpose |
|--------|------|---------|
| `width` / `height` | Integer | Source layer dimensions |
| `extent_hint` | Rect | Visible intersection of input and output layers for optimization |
| `output_origin_x` / `output_origin_y` | Integer | Output buffer origin in input buffer coordinates |
| `downsample_x` / `downsample_y` | Ratio | Compensation factors for downsampling |
| `pre_effect_source_origin_x` / `pre_effect_source_origin_y` | Integer | Origin adjustments from preceding effects |

**Motion and Effects:**

| Member | Type | Purpose |
|--------|------|---------|
| `shutter_angle` | Fixed | Motion blur angle (0-1 range representing 0-360 degrees) |
| `shutter_phase` | Fixed | Shutter offset as frame duration percentage |
| `field` | Enum | Upper or lower field designation when applicable |

#### extent_hint Usage

Set `PF_OutFlag_USE_OUTPUT_EXTENT` to leverage this optimization. The hint rectangle represents the intersection of visible composition area and mask regions, enabling processing of only necessary pixels. Note that hints are approximately 20% larger than the layer itself to support predictive rendering decisions.

### PF_OutData

`PF_OutData` enables plugins to communicate changes and capabilities to After Effects.

#### Key Members

| Member | Type | Purpose |
|--------|------|---------|
| `my_version` | Version | Set via `PF_VERSION` macro; AE uses this to resolve duplicate effects |
| `global_data` | Handle | Allocated via AE's memory functions; returned in subsequent `PF_InData` calls |
| `sequence_data` | Handle | Allocated during SEQUENCE_SETUP; persists across calls |
| `frame_data` | Handle | Temporary handle for FRAME_SETUP through render/teardown |
| `width` / `height` / `origin` | Integers | Define output buffer dimensions and input mapping position |
| `num_params` | Integer | Must match parameter count plus implicit input layer |
| `return_msg` | C string | Displayed to users; cleared after each command |
| `out_flags` / `out_flags2` | Flags | Capability and status messaging flags |

### PF_EffectWorld / PF_LayerDef

`PF_EffectWorld` (also called `PF_LayerDef`) is After Effects' primary image representation structure for plugins.

#### Structure Fields

| Member | Type | Purpose |
|--------|------|---------|
| `world_flags` | Flags | Deep-color support and write permissions |
| `data` | `PF_PixelPtr` | Pixel buffer pointer (use accessor macros, never access directly) |
| `rowbytes` | Integer | Scanline length in bytes including padding |
| `width` / `height` | Integer | Buffer dimensions |
| `extent_hint` | Rect | Bounding rectangle of opaque pixels |
| `pix_aspect_ratio` | `PF_Rational` | Pixel aspect ratio |
| `dephault` | Enum | For layer parameters: `PF_LayerDefault_MYSELF` or `PF_LayerDefault_NONE` |

**World Flags:**
- `PF_WorldFlag_DEEP`: Indicates 16-bit per channel
- `PF_WorldFlag_WRITEABLE`: Permits modifying image data (typically output only)

**Critical Rules:**
- Never write outside the indicated region of a `PF_EffectWorld`; this can corrupt cached image buffers
- Pixels aren't guaranteed 16-byte alignment
- Subregions of larger worlds may be provided to effects
- Never assume row size equals `width * pixel_size`

#### Pixel Format Structures

**8-bit (PF_Pixel / PF_Pixel8):**
```c
typedef struct {
    A_u_char    alpha, red, green, blue;
} PF_Pixel8;
```

**16-bit (PF_Pixel16):**
```c
typedef struct {
    A_u_short   alpha, red, green, blue;  // Range: 0-32768
} PF_Pixel16;
```

**32-bit Float (PF_PixelFloat / PF_Pixel32):**
```c
typedef struct {
    PF_FpShort  alpha, red, green, blue;  // Range: 0.0-1.0 (can exceed)
} PF_PixelFloat;
```

#### Accessor Macros

- `PF_GET_PIXEL_DATA8`: Safely obtains 8-bpc pixel pointers (returns NULL for non-8-bit worlds)
- `PF_GET_PIXEL_DATA16`: Safely obtains 16-bpc pixel pointers (returns NULL for non-deep worlds)

These macros prevent unsafe casting and provide future-proof abstraction.

---

## Parameter System

Parameters represent streams of values that vary with time. The API handles interpolation automatically; developers don't need to calculate how values change frame-to-frame.

### PF_ParamDef Structure

| Member | Type | Purpose |
|--------|------|---------|
| `id` | `A_long` | Maintains parameter identity across versions |
| `param_type` | `PF_ParamType` | Specifies the parameter's data type |
| `ui_flags` | `PF_ParamUIFlags` | Controls UI behavior and appearance |
| `flags` | `PF_ParamFlags` | Defines parameter behavior characteristics |
| `u` | `PF_ParamDefUnion` | Contains type-specific data for the parameter |

**Parameter Zero:** The first parameter in the array (`params[0]`) is always the input image (a `PF_EffectWorld` / `PF_LayerDef`) to which effects are applied.

**Naming Constraint:** Parameter names are limited to 31 characters.

### Parameter Types Reference

| Type | Union Member | Data Type | Purpose |
|------|--------------|-----------|---------|
| `PF_Param_LAYER` | `ld` | `A_long` | Image/audio layer references; generates pulldown menu |
| `PF_Param_FLOAT_SLIDER` | `fs_d` | `PF_FPLong` | Numerical values with precision and curve tolerance |
| `PF_Param_SLIDER` | `sd` | `A_long` | Integer slider (deprecated, use FLOAT_SLIDER) |
| `PF_Param_FIX_SLIDER` | `fd` | `PF_Fixed` | Fixed-point slider (deprecated) |
| `PF_Param_ANGLE` | `ad` | `PF_Fixed` | Degree measurements (supports values >360 degrees) |
| `PF_Param_CHECKBOX` | `bd` | `PF_Boolean` | Binary toggles (interpolation forced off) |
| `PF_Param_COLOR` | `cd` | `PF_Pixel` | RGB values via color picker or eyedropper |
| `PF_Param_POINT` | `td` | `PF_Fixed` | 2D coordinates in layer space (upper-left origin) |
| `PF_Param_POINT_3D` | `point3d_d` | `PF_FpLong[3]` | 3D coordinates (CS5.5+, Premiere Pro unsupported) |
| `PF_Param_POPUP` | `pd` | `A_long` | Choice lists separated by "/" or "(-" for dividers |
| `PF_Param_ARBITRARY_DATA` | `arb_d` | Custom | User-defined data types with handles |
| `PF_Param_PATH` | `path_d` | `PF_PathID` | Mask references (access via suites) |
| `PF_Param_BUTTON` | `button_d` | None | Clickable button (CS5.5+) |

### Parameter Registration

Parameters are registered during `PF_Cmd_PARAM_SETUP`:

```c
PF_Err ParamsSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;
    PF_ParamDef def;

    // Always clear the struct first!
    AEFX_CLR_STRUCT(def);

    // Add a float slider
    PF_ADD_FLOAT_SLIDER(
        "Intensity",        // Parameter name
        0.0,                // Valid min
        100.0,              // Valid max
        0.0,                // Slider min
        100.0,              // Slider max
        0,                  // Curve tolerance
        50.0,               // Default value
        PF_Precision_TENTHS,
        0,                  // Display flags
        0,                  // Flags
        INTENSITY_DISK_ID   // Disk ID
    );

    AEFX_CLR_STRUCT(def);

    // Add a color parameter
    PF_ADD_COLOR(
        "Tint Color",       // Parameter name
        255,                // Default red
        128,                // Default green
        0,                  // Default blue
        COLOR_DISK_ID       // Disk ID
    );

    AEFX_CLR_STRUCT(def);

    // Add a checkbox
    PF_ADD_CHECKBOX(
        "Enable Effect",    // Parameter name
        "On",               // Comment (appears next to checkbox)
        TRUE,               // Default value
        0,                  // Flags
        CHECKBOX_DISK_ID    // Disk ID
    );

    out_data->num_params = PARAM_COUNT;  // Must match total params + 1 (input layer)

    return err;
}
```

**Critical:** Always clear `PF_ParamDef` structures with `AEFX_CLR_STRUCT` before registering them. Failure to do this can result in unpredictable behavior.

### Parameter Flags

**Behavior Flags (`PF_ParamFlags`):**

| Flag | Purpose |
|------|---------|
| `PF_ParamFlag_CANNOT_TIME_VARY` | Disables keyframe control |
| `PF_ParamFlag_CANNOT_INTERP` | Prevents algebraic interpolation |
| `PF_ParamFlag_SUPERVISE` | Enables `PF_Cmd_USER_CHANGED_PARAM` messages |
| `PF_ParamFlag_COLLAPSE_TWIRLY` | Controls parameter group expansion |
| `PF_ParamFlag_START_COLLAPSED` | Sets initial twirl state |

**UI Flags (`PF_ParamUIFlags`):**

| Flag | Purpose |
|------|---------|
| `PF_PUI_STD_CONTROL_ONLY` | Standard control only; no data stream associated |
| `PF_PUI_NO_ECW_UI` | Hides parameter from Effect Controls Window |
| `PF_PUI_CONTROL` | Parameter has custom control |
| `PF_PUI_DISABLED` | Grays out the parameter |
| `PF_PUI_INVISIBLE` | Hides UI in both Effect Controls and Timeline (CS6+) |

---

## Rendering Pipeline

### Standard Rendering (8-bit and 16-bit)

The traditional rendering pipeline uses three frame selectors:

1. **PF_Cmd_FRAME_SETUP**: Allocate resources, optionally modify output dimensions
2. **PF_Cmd_RENDER**: Process pixels and generate output
3. **PF_Cmd_FRAME_SETDOWN**: Free resources

```c
PF_Err Render(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    // Get input layer
    PF_LayerDef *input = &params[0]->u.ld;

    // Check bit depth
    PF_Boolean deep = PF_WORLD_IS_DEEP(output);

    if (deep) {
        // 16-bit processing
        err = Process16bit(in_data, input, output);
    } else {
        // 8-bit processing
        err = Process8bit(in_data, input, output);
    }

    return err;
}
```

### Iteration Suites

The SDK provides iteration suites for efficient pixel processing:

- `PF_Iterate8Suite1`: 8-bit pixel iteration
- `PF_Iterate16Suite1`: 16-bit pixel iteration
- `PF_IterateFloatSuite1`: 32-bit float iteration

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `iterate()` | Process pixels from source to destination |
| `iterate_origin()` | Specify offset between input and output buffers |
| `iterate_lut()` | Apply Look-Up Tables (8-bit only) |
| `iterate_origin_non_clip_src()` | Iterate beyond source/destination intersection |
| `iterate_generic()` | Once-per-processor operations |

**Example Usage:**

```c
static PF_Err MyPixelFunc(
    void        *refcon,
    A_long      x,
    A_long      y,
    PF_Pixel8   *in,
    PF_Pixel8   *out)
{
    MyData *data = (MyData*)refcon;

    out->alpha = in->alpha;
    out->red   = MIN(255, in->red + data->brightness);
    out->green = MIN(255, in->green + data->brightness);
    out->blue  = MIN(255, in->blue + data->brightness);

    return PF_Err_NONE;
}

// In render function:
AEFX_SuiteScoper<PF_Iterate8Suite1> iterateSuite =
    AEFX_SuiteScoper<PF_Iterate8Suite1>(
        in_data, kPFIterate8Suite, kPFIterate8SuiteVersion1, out_data);

err = iterateSuite->iterate(
    in_data,
    0,                  // Progress base
    output->height,     // Progress final
    input,              // Source
    NULL,               // Area (NULL = whole image)
    (void*)&myData,     // Refcon
    MyPixelFunc,        // Pixel function
    output              // Destination
);
```

**Important Considerations:**
- Pixel processing functions must be re-entrant for thread safety
- Progress and abort checking are handled automatically
- Do not process pixels in any specific order
- The October 2021 SDK update increased concurrent thread limits to match available CPU cores

---

## SmartFX and 32-bit Float Support

SmartFX is the extension to the effect plugin API that supports 32-bit floating point images and provides more efficient rendering by allowing effects to specify exactly which input pixels they need.

### How SmartFX Works

SmartFX reverses the traditional calling sequence. Instead of receiving the entire input buffer, the effect:

1. Is told how much of its output is required
2. Must explicitly ask the host for the inputs it needs
3. Returns the extent of the resulting output

The render process is split into two phases:

**Pre-Render Phase (`PF_Cmd_SMART_PRE_RENDER`):**
- Effect receives render request (target rectangle, field, channel mask)
- Describes input pixel data requirements via `checkout_layer`
- Returns result rectangle and maximum result rectangle
- Can store pre-render data for use during render

**Render Phase (`PF_Cmd_SMART_RENDER`):**
- Access previously-requested pixel data through `checkout_layer_pixels`
- Generate output via `checkout_output`
- Pre-render data pointer available from earlier phase

### Enabling SmartFX

```c
PF_Err GlobalSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE;

    return PF_Err_NONE;
}
```

### Key Structures

**PF_PreRenderExtra:**

| Member | Purpose |
|--------|---------|
| `input` | Render request (target rectangle, field, channel mask) |
| `output` | Result rectangle, max result rectangle, pre-render data |
| `cb` | Callbacks for checkout_layer, checkout_param |

**PF_SmartRenderExtra:**

| Member | Purpose |
|--------|---------|
| `input` | Pre-render data, bitdepth |
| `cb` | Callbacks for checkout_layer_pixels, checkout_output |

### Implementation Example

```c
static PF_Err SmartPreRender(
    PF_InData           *in_data,
    PF_OutData          *out_data,
    PF_PreRenderExtra   *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->output_request;
    PF_CheckoutResult checkout_result;

    // Checkout the input layer
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,                      // Layer param index (0 = input)
        0,                      // Layer ID
        &req,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &checkout_result
    ));

    // Set result rectangles
    if (!err) {
        extra->output->result_rect = checkout_result.result_rect;
        extra->output->max_result_rect = checkout_result.max_result_rect;
    }

    return err;
}

static PF_Err SmartRender(
    PF_InData           *in_data,
    PF_OutData          *out_data,
    PF_SmartRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_EffectWorld *input_world, *output_world;

    // Get input pixels
    ERR(extra->cb->checkout_layer_pixels(
        in_data->effect_ref,
        0,                      // Checkout ID from pre-render
        &input_world
    ));

    // Get output buffer
    ERR(extra->cb->checkout_output(
        in_data->effect_ref,
        &output_world
    ));

    if (!err && input_world && output_world) {
        // Process based on bit depth
        PF_PixelFormat format;
        AEFX_SuiteScoper<PF_WorldSuite2> worldSuite =
            AEFX_SuiteScoper<PF_WorldSuite2>(
                in_data, kPFWorldSuite, kPFWorldSuiteVersion2, out_data);

        ERR(worldSuite->PF_GetPixelFormat(input_world, &format));

        switch (format) {
            case PF_PixelFormat_ARGB128:
                err = Process32bit(in_data, input_world, output_world);
                break;
            case PF_PixelFormat_ARGB64:
                err = Process16bit(in_data, input_world, output_world);
                break;
            case PF_PixelFormat_ARGB32:
                err = Process8bit(in_data, input_world, output_world);
                break;
        }
    }

    return err;
}
```

### Critical Requirements

1. Effects must accurately compute both `result_rect` (actual output for the request) and `max_result_rect` (largest possible output regardless of request size)
2. Mis-sized output rectangles can cause rendering problems
3. Layer parameter checkout occurs during pre-render only; pixel access happens during render
4. An effect may checkout inputs it never ultimately needs
5. No parameter array is passed to SmartFX; use `PF_CHECKOUT_PARAM` for non-layer parameters
6. Multiple pixel accesses of the same layer require separate checkout IDs in pre-render

### Important Notes

- Like AEGPs, SmartFX plugins are never unloaded by After Effects
- Premiere Pro does not support After Effects 16-bit rendering or SmartFX
- As of current documentation, no third-party hosts support SmartFX or AEGP functions

---

## Sequence Data and Flatten/Unflatten

Sequence data persists for the lifetime of an effect instance and is used to store state between renders.

### Sequence Data Lifecycle

| Selector | Action |
|----------|--------|
| `PF_Cmd_SEQUENCE_SETUP` | Allocate and initialize sequence data |
| `PF_Cmd_SEQUENCE_RESETUP` | Recreate data after project load or duplication |
| `PF_Cmd_SEQUENCE_FLATTEN` | Convert to disk-storable format |
| `PF_Cmd_SEQUENCE_SETDOWN` | Free all sequence data |

### Flatten/Unflatten Operations

When projects are saved, sequence data must be converted to a flat, disk-safe format:

```c
typedef struct {
    A_long      version;
    A_long      data_value;
    // ... other fields
} MyFlatSequenceData;

typedef struct {
    A_long              version;
    A_long              data_value;
    void                *computed_ptr;  // Can't be saved!
    SomeAllocatedData   *allocated;     // Can't be saved!
} MySequenceData;

static PF_Err SequenceFlatten(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;
    MySequenceData *seq = (MySequenceData*)PF_LOCK_HANDLE(in_data->sequence_data);

    // Allocate flat data
    PF_Handle flat_handle = PF_NEW_HANDLE(sizeof(MyFlatSequenceData));
    MyFlatSequenceData *flat = (MyFlatSequenceData*)PF_LOCK_HANDLE(flat_handle);

    // Copy only flattenable data
    flat->version = seq->version;
    flat->data_value = seq->data_value;

    // Handle byte-order for cross-platform compatibility
    #ifdef AE_BIG_ENDIAN
        flat->version = PF_SWAP_LONG(flat->version);
        flat->data_value = PF_SWAP_LONG(flat->data_value);
    #endif

    PF_UNLOCK_HANDLE(flat_handle);
    PF_UNLOCK_HANDLE(in_data->sequence_data);

    // Free old handle, set flattened
    PF_DISPOSE_HANDLE(in_data->sequence_data);
    out_data->sequence_data = flat_handle;

    return err;
}

static PF_Err SequenceResetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    if (in_data->sequence_data) {
        MyFlatSequenceData *flat = (MyFlatSequenceData*)PF_LOCK_HANDLE(in_data->sequence_data);

        // Allocate full sequence data
        PF_Handle seq_handle = PF_NEW_HANDLE(sizeof(MySequenceData));
        MySequenceData *seq = (MySequenceData*)PF_LOCK_HANDLE(seq_handle);

        // Unflatten with byte-order correction
        #ifdef AE_BIG_ENDIAN
            seq->version = PF_SWAP_LONG(flat->version);
            seq->data_value = PF_SWAP_LONG(flat->data_value);
        #else
            seq->version = flat->version;
            seq->data_value = flat->data_value;
        #endif

        // Initialize runtime-only data
        seq->computed_ptr = NULL;
        seq->allocated = NULL;

        PF_UNLOCK_HANDLE(seq_handle);
        PF_UNLOCK_HANDLE(in_data->sequence_data);

        PF_DISPOSE_HANDLE(in_data->sequence_data);
        out_data->sequence_data = seq_handle;
    }

    return err;
}
```

### Arbitrary Data Parameters

For custom data types that need serialization:

| Selector | Purpose |
|----------|---------|
| `PF_Arbitrary_NEW_FUNC` | Allocate and initialize new instance |
| `PF_Arbitrary_DISPOSE_FUNC` | Free memory and destroy instances |
| `PF_Arbitrary_COPY_FUNC` | Duplicate existing data |
| `PF_Arbitrary_FLAT_SIZE_FUNC` | Report flattened data size |
| `PF_Arbitrary_FLATTEN_FUNC` | Convert to disk-safe format |
| `PF_Arbitrary_UNFLATTEN_FUNC` | Restore from flattened format |
| `PF_Arbitrary_INTERP_FUNC` | Interpolate between keyframes |
| `PF_Arbitrary_COMPARE_FUNC` | Compare two instances |

**Critical:** Arbitrary data handling code must be recursively re-entrant to support operations that trigger the same effect recursively.

---

## Effect Flags Reference

### PF_OutFlag (Primary Flags)

| Flag | Value | When to Set | Purpose |
|------|-------|-------------|---------|
| `PF_OutFlag_NONE` | 0 | - | No flags |
| `PF_OutFlag_KEEP_RESOURCE_OPEN` | 1<<0 | GLOBAL_SETUP | Keep PiPL resources open |
| `PF_OutFlag_WIDE_TIME_INPUT` | 1<<1 | GLOBAL_SETUP | Effect accesses parameters at non-current times |
| `PF_OutFlag_NON_PARAM_VARY` | 1<<2 | GLOBAL_SETUP | Output varies beyond parameter changes |
| `PF_OutFlag_SEQUENCE_DATA_NEEDS_FLATTENING` | 1<<4 | GLOBAL_SETUP | Sequence data requires flatten/unflatten |
| `PF_OutFlag_I_DO_DIALOG` | 1<<5 | GLOBAL_SETUP | Effect has options dialog |
| `PF_OutFlag_USE_OUTPUT_EXTENT` | 1<<6 | GLOBAL_SETUP | Use extent_hint optimization |
| `PF_OutFlag_SEND_DO_DIALOG` | 1<<7 | GLOBAL_SETUP | Receive DO_DIALOG selector |
| `PF_OutFlag_DISPLAY_ERROR_MESSAGE` | 1<<8 | Any | Display return_msg as error |
| `PF_OutFlag_I_EXPAND_BUFFER` | 1<<9 | GLOBAL_SETUP | Effect expands output beyond input |
| `PF_OutFlag_PIX_INDEPENDENT` | 1<<10 | GLOBAL_SETUP | Pixels don't depend on neighbors |
| `PF_OutFlag_I_WRITE_INPUT_BUFFER` | 1<<11 | GLOBAL_SETUP | Effect modifies input buffer |
| `PF_OutFlag_I_SHRINK_BUFFER` | 1<<12 | GLOBAL_SETUP | Effect shrinks buffer |
| `PF_OutFlag_WORKS_IN_PLACE` | 1<<13 | GLOBAL_SETUP | Can use same buffer for input/output |
| `PF_OutFlag_CUSTOM_UI` | 1<<15 | GLOBAL_SETUP | Effect has custom UI |
| `PF_OutFlag_REFRESH_UI` | 1<<17 | EVENT | Force UI refresh |
| `PF_OutFlag_NOP_RENDER` | 1<<18 | FRAME_SETUP | Skip render, copy input to output |
| `PF_OutFlag_I_USE_SHUTTER_ANGLE` | 1<<19 | GLOBAL_SETUP | Effect uses motion blur |
| `PF_OutFlag_I_USE_AUDIO` | 1<<20 | GLOBAL_SETUP | Effect processes audio |
| `PF_OutFlag_I_AM_OBSOLETE` | 1<<21 | GLOBAL_SETUP | Don't show in Effect menu |
| `PF_OutFlag_FORCE_RERENDER` | 1<<22 | EVENT, USER_CHANGED_PARAM | Force immediate rerender |
| `PF_OutFlag_PiPL_OVERRIDES_OUTDATA_OUTFLAGS` | 1<<23 | PiPL only | PiPL flags take precedence |
| `PF_OutFlag_I_HAVE_EXTERNAL_DEPENDENCIES` | 1<<24 | GLOBAL_SETUP | Effect has external dependencies |
| `PF_OutFlag_DEEP_COLOR_AWARE` | 1<<25 | GLOBAL_SETUP | Supports 16-bit color |
| `PF_OutFlag_SEND_UPDATE_PARAMS_UI` | 1<<26 | GLOBAL_SETUP | Receive UPDATE_PARAMS_UI selector |

### PF_OutFlag2 (Extended Flags)

| Flag | Value | When to Set | Purpose |
|------|-------|-------------|---------|
| `PF_OutFlag2_NONE` | 0 | - | No flags |
| `PF_OutFlag2_SUPPORTS_QUERY_DYNAMIC_FLAGS` | 1<<0 | GLOBAL_SETUP | Supports QUERY_DYNAMIC_FLAGS |
| `PF_OutFlag2_I_USE_3D_CAMERA` | 1<<1 | GLOBAL_SETUP | Uses AEGP camera access |
| `PF_OutFlag2_I_USE_3D_LIGHTS` | 1<<2 | GLOBAL_SETUP | Uses AEGP light access |
| `PF_OutFlag2_PARAM_GROUP_START_COLLAPSED_FLAG` | 1<<3 | GLOBAL_SETUP | Honor initial collapsed state |
| `PF_OutFlag2_I_AM_THREADSAFE` | 1<<4 | GLOBAL_SETUP | Effect is thread-safe (deprecated) |
| `PF_OutFlag2_CAN_COMBINE_WITH_DESTINATION` | 1<<5 | GLOBAL_SETUP | Can composite with destination |
| `PF_OutFlag2_DOESNT_NEED_EMPTY_PIXELS` | 1<<6 | GLOBAL_SETUP | Skip empty pixel regions |
| `PF_OutFlag2_REVEALS_ZERO_ALPHA` | 1<<7 | GLOBAL_SETUP | Can reveal transparent pixels |
| `PF_OutFlag2_PRESERVES_FULLY_OPAQUE_PIXELS` | 1<<8 | GLOBAL_SETUP | Premiere only |
| `PF_OutFlag2_SUPPORTS_SMART_RENDER` | 1<<10 | GLOBAL_SETUP | Uses SmartFX API |
| `PF_OutFlag2_FLOAT_COLOR_AWARE` | 1<<12 | GLOBAL_SETUP | Supports 32-bit float |
| `PF_OutFlag2_I_USE_COLORSPACE_ENUMERATION` | 1<<13 | GLOBAL_SETUP | Uses color space enumeration |
| `PF_OutFlag2_I_AM_DEPRECATED` | 1<<14 | GLOBAL_SETUP | Show as deprecated |
| `PF_OutFlag2_PPRO_DO_NOT_CLONE_SEQUENCE_DATA_FOR_RENDER` | 1<<15 | GLOBAL_SETUP | Premiere only |
| `PF_OutFlag2_AUTOMATIC_WIDE_TIME_INPUT` | 1<<17 | GLOBAL_SETUP | More efficient wide time input |
| `PF_OutFlag2_I_USE_TIMECODE` | 1<<18 | GLOBAL_SETUP | Effect uses timecode |
| `PF_OutFlag2_DEPENDS_ON_UNREFERENCED_MASKS` | 1<<19 | GLOBAL_SETUP | Depends on masks not in parameters |
| `PF_OutFlag2_OUTPUT_IS_WATERMARKED` | 1<<20 | GLOBAL_SETUP | Output contains watermark |
| `PF_OutFlag2_I_MIX_GUID_DEPENDENCIES` | 1<<21 | GLOBAL_SETUP | Mixes GUID dependencies |
| `PF_OutFlag2_AE13_5_THREADSAFE` | 1<<22 | GLOBAL_SETUP | Thread-safe for AE 13.5+ |
| `PF_OutFlag2_SUPPORTS_GET_FLATTENED_SEQUENCE_DATA` | 1<<23 | GLOBAL_SETUP | Supports flattened data retrieval |
| `PF_OutFlag2_CUSTOM_UI_ASYNC_MANAGER` | 1<<24 | GLOBAL_SETUP | Async UI manager |
| `PF_OutFlag2_SUPPORTS_GPU_RENDER_F32` | 1<<25 | GLOBAL_SETUP | GPU 32-bit float rendering |
| `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` | 1<<26 | GLOBAL_SETUP | Multi-frame rendering support |
| `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER` | 1<<27 | GLOBAL_SETUP | Allow sequence_data writes during render |

### Usage Example

```c
PF_Err GlobalSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    out_data->my_version = PF_VERSION(MAJOR_VERSION, MINOR_VERSION, BUG_VERSION, STAGE_VERSION, BUILD_VERSION);

    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE |
                          PF_OutFlag_PIX_INDEPENDENT |
                          PF_OutFlag_SEND_UPDATE_PARAMS_UI;

    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE |
                           PF_OutFlag2_SUPPORTS_THREADED_RENDERING |
                           PF_OutFlag2_PARAM_GROUP_START_COLLAPSED_FLAG;

    return PF_Err_NONE;
}
```

---

## Multi-Frame Rendering

Multi-Frame Rendering (MFR) in After Effects 2022+ enables concurrent rendering of multiple frames across CPU cores, improving export performance.

### Enabling Multi-Frame Rendering

```c
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_THREADED_RENDERING;
```

### Thread Safety Requirements

An effect achieves thread safety when it eliminates race conditions and maintains correct state during concurrent access:

1. **Avoid problematic static/global variables** or ensure existing ones are race-condition-free
2. **Restrict writes to global_data** to setup/teardown phases only; reading during render is acceptable
3. **Prevent sequence_data modifications** during render or UI events; reading through `PF_EffectSequenceDataSuite` is permitted

**Critical Warning:** If an effect uses any blocking synchronization mechanisms, these must not be held when calling back into the host. Mutex locks held across host callbacks risk deadlock.

### Sequence Data Handling (March 2021 SDK Forward)

- **Read-only access**: sequence_data becomes immutable during render by default
- **Mutable alternative**: The `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER` flag allows writes, but creates independent copies per render thread, potentially duplicating expensive computations

### Compute Cache API

For effects needing write access during render, the Compute Cache provides thread-safe data storage available in March 2021 SDK and After Effects 2022+.

**Registration (during GLOBAL_SETUP):**

```c
AEGP_ComputeCacheCallbacks callbacks = {
    .generate_key = MyGenerateKey,
    .compute = MyCompute,
    .approx_size_value = MyApproxSize,
    .delete_compute_value = MyDeleteValue
};

AEGP_ClassRegister(
    "com.mycompany.myeffect.cache_v1",
    &callbacks,
    &cache_class_id
);
```

**Key Operations:**

| Function | Purpose |
|----------|---------|
| `AEGP_ComputeIfNeededAndCheckout` | Main call; computes if not cached |
| `AEGP_CheckoutCached` | Non-blocking check for existing cached values |
| `AEGP_GetReceiptComputeValue` | Retrieves computed data from receipts |
| `AEGP_CheckinComputeReceipt` | Returns receipts after use |

**Key Generation with Hash Suite:**

```c
AEGP_ComputeCacheKeyH key;
ERR(hashSuite->AEGP_CreateHashFromPtr(sizeof(params), &params, &key));
ERR(hashSuite->AEGP_HashMixInPtr(key, sizeof(extra_data), &extra_data));
```

### Affected Command Selectors

UI selectors remain main-thread only, but these execute across threads simultaneously:

- `PF_Cmd_SEQUENCE_SETUP/RESETUP/SETDOWN`
- `PF_Cmd_SMART_PRE_RENDER` and `PF_Cmd_SMART_RENDER`
- `PF_Cmd_RENDER`

Only `PF_Cmd_GLOBAL_SETUP` and `PF_Cmd_GLOBAL_SETDOWN` remain single-threaded and mutually exclusive with other selectors.

### Static Variable Solutions

| Approach | When to Use |
|----------|-------------|
| Convert to parameters | Pass data through function arguments |
| Use const/compile-time initialization | Replace runtime initialization with static const |
| Apply `thread_local` | Each thread gets independent copies |
| Protect with mutexes | Only when threads must access shared mutable state |

### Thread Safety Analysis Tools

Adobe provides platform-specific static analyzers:

- **macOS**: `check_symbols_for_thread_safety.sh`
- **Windows**: `CheckThreadSafeSymbols.exe` (requires Visual Studio and DIA SDK)

Available at: https://github.com/adobe/ae-plugin-thread-safety

---

## GPU Acceleration

The GPU SDK was introduced in After Effects version 16.0 (CC 2019).

### Supported GPU Frameworks

| Framework | Platform | Notes |
|-----------|----------|-------|
| CUDA | Windows, macOS (legacy) | NVIDIA only; AE 25.4 uses CUDA 12.8 |
| OpenCL | Windows, macOS | Cross-vendor GPU compute |
| Metal | macOS | Apple's GPU framework |
| DirectX | Windows | Requires DirectXAssets folder deployment |

**Note:** NVIDIA CUDA isn't supported in macOS 10.14 (Mojave) and later.

### Enabling GPU Rendering

```c
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_GPU_RENDER_F32;

// For DirectX (in PiPL and code):
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_DIRECTX_RENDERING;
```

### GPU Command Selectors

| Selector | Purpose |
|----------|---------|
| `PF_Cmd_GPU_DEVICE_SETUP` | Initialize GPU device |
| `PF_Cmd_GPU_DEVICE_SETDOWN` | Release GPU device resources |
| `PF_Cmd_GPU_SMART_RENDER_GPU` | GPU-accelerated SmartFX rendering |

### Implementation Considerations

**CUDA Best Practices:**

- Use CUDA Driver API for best compatibility with future drivers
- If Runtime API is needed, statically link `cudart_static.lib`
- Match CUDA version with After Effects (AE 25.4 = CUDA 12.8)

**DirectX Requirements:**

- Copy DirectXAssets folder alongside binary
- Set `PF_OutFlag2_SUPPORTS_DIRECTX_RENDERING` flag
- Update PiPL resource file

**Cross-Platform Notes:**

- After Effects chooses the GPU API and device automatically
- Cannot force specific GPU API selection
- Implement fallback to CPU for unsupported configurations

### GPU Rendering During SmartFX

During `PF_Cmd_SMART_RENDER_GPU`, `PF_LayerDef` fields populate normally except `data` remains NULL (pixels are on GPU).

---

## Function Suites

### Accessing Suites with AEFX_SuiteScoper

For C++ development, Adobe recommends using `AEFX_SuiteScoper` for automatic suite acquisition and disposal:

```c
AEFX_SuiteScoper<PF_GPUDeviceSuite1> gpu_suite =
    AEFX_SuiteScoper<PF_GPUDeviceSuite1>(
        in_dataP,
        kPFGPUDeviceSuite,
        kPFGPUDeviceSuiteVersion1,
        out_dataP);

// Use suite functions directly
gpu_suite->GetDeviceInfo(...);
```

### Error Handling

The scoper throws `A_Err_MISSING_SUITE` when suites cannot be acquired if `ALLOW_NO_SUITE` is false. Wrap calls in try/catch blocks. When `ALLOW_NO_SUITE` is true, verify the returned pointer isn't NULL before use.

### Key Suites for Effects

| Suite | Purpose |
|-------|---------|
| `PF_Iterate8Suite1` | 8-bit pixel iteration |
| `PF_Iterate16Suite1` | 16-bit pixel iteration |
| `PF_IterateFloatSuite1` | 32-bit float iteration |
| `PF_WorldSuite2` | Pixel format detection, world creation |
| `PF_WorldTransformSuite1` | Image transforms |
| `PF_HandleSuite1` | Memory handle management |
| `PF_GPUDeviceSuite1` | GPU device information |
| `PF_ColorParamSuite1` | High-precision color parameters |
| `PF_PointParamSuite1` | High-precision point parameters |
| `PF_EffectSequenceDataSuite1` | Read-only sequence data access |
| `AEGP_ComputeCacheSuite1` | Thread-safe compute cache |

### Suite Versioning

Multiple suite versions can coexist. Adobe preserves earlier versions, so acquire the latest version and gracefully fall back to older versions if needed features aren't available.

### Threading Considerations

Unless documented otherwise, assume that any function provided by suites is not thread-safe. UI modifications should occur only on the plugin's main thread.

---

## Effect UI and Events

Effects can provide custom user interfaces in two primary locations: the Effect Controls Window (ECW) and Composition/Layer Windows.

### Enabling Custom UI

To implement custom UI, effects must:

1. Set `PF_OutFlag_CUSTOM_UI` during global setup
2. Handle the `PF_Cmd_EVENT` selector
3. For custom ECW controls, set `PF_PUI_CONTROL` when adding parameters

```c
// In GlobalSetup
out_data->out_flags |= PF_OutFlag_CUSTOM_UI;

// In ParamsSetup for custom control parameter
def.ui_flags = PF_PUI_CONTROL;
```

### Event Types

The system supports multiple event categories:

**Context Management:**

| Event | Purpose |
|-------|---------|
| `PF_Event_NEW_CONTEXT` | New drawing context created |
| `PF_Event_ACTIVATE` | Context activated |
| `PF_Event_DEACTIVATE` | Context deactivated |
| `PF_Event_CLOSE_CONTEXT` | Context being destroyed |

**User Interaction:**

| Event | Purpose |
|-------|---------|
| `PF_Event_DO_CLICK` | Mouse click initiated |
| `PF_Event_DRAG` | Mouse drag in progress |
| `PF_Event_KEYDOWN` | Keyboard input |
| `PF_Event_MOUSE_EXITED` | Mouse left UI area |
| `PF_Event_ADJUST_CURSOR` | Cursor shape change opportunity |

**Visual Rendering:**

| Event | Purpose |
|-------|---------|
| `PF_Event_DRAW` | Redraw UI elements |
| `PF_Event_IDLE` | Idle time for background processing |

### Event Handler Structure

```c
static PF_Err HandleEvent(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output,
    PF_EventExtra   *extra)
{
    PF_Err err = PF_Err_NONE;

    switch (extra->e_type) {
        case PF_Event_NEW_CONTEXT:
            // Initialize drawing context
            break;

        case PF_Event_DRAW:
            err = DrawCustomUI(in_data, out_data, params, extra);
            break;

        case PF_Event_DO_CLICK:
            err = HandleClick(in_data, out_data, params, extra);
            break;

        case PF_Event_DRAG:
            err = HandleDrag(in_data, out_data, params, extra);
            break;

        case PF_Event_KEYDOWN:
            err = HandleKeyDown(in_data, out_data, params, extra);
            break;

        case PF_Event_CLOSE_CONTEXT:
            // Clean up drawing context
            break;
    }

    return err;
}
```

### Drawing with Drawbot

After Effects provides the Drawbot API for drawing custom UI elements. This API provides platform-independent drawing primitives:

```c
static PF_Err DrawCustomUI(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_EventExtra   *extra)
{
    PF_Err err = PF_Err_NONE;

    DRAWBOT_DrawRef drawing_ref = NULL;
    DRAWBOT_SurfaceRef surface_ref = NULL;

    // Get drawing reference
    AEFX_SuiteScoper<DRAWBOT_DrawbotSuite1> drawbotSuite =
        AEFX_SuiteScoper<DRAWBOT_DrawbotSuite1>(
            in_data, kDRAWBOT_DrawSuite, kDRAWBOT_DrawSuite_VersionCurrent, out_data);

    err = drawbotSuite->GetDrawRef(extra->contextH, &drawing_ref);

    if (!err) {
        err = drawbotSuite->GetSurface(drawing_ref, &surface_ref);
    }

    if (!err) {
        // Draw custom elements using Drawbot primitives
        DRAWBOT_ColorRGBA color = {1.0f, 0.0f, 0.0f, 1.0f};  // Red
        DRAWBOT_RectF32 rect = {10.0f, 10.0f, 100.0f, 50.0f};

        // Draw filled rectangle
        drawbotSuite->PaintRect(drawing_ref, &color, &rect);
    }

    return err;
}
```

### Important UI Notes

- As of version 7.0, plugins should not block until mouse-up; instead rely on `PF_Event_DRAG`
- Event details are stored in `PF_EventUnion` structures with specific data types for different event categories
- Custom Comp UI allows direct manipulation of video in composition windows with overlaid controls

---

## Audio Effects

Effects can also process audio data. Audio effects use a separate set of selectors and work with audio-specific data structures.

### Audio Selectors

| Selector | Purpose |
|----------|---------|
| `PF_Cmd_AUDIO_SETUP` | Request audio time span; allocate audio resources |
| `PF_Cmd_AUDIO_RENDER` | Process audio data |
| `PF_Cmd_AUDIO_SETDOWN` | Free audio resources |

### Audio-Only Effects

To create an audio-only effect (no video processing):

```c
// In GlobalSetup
out_data->out_flags |= PF_OutFlag_AUDIO_EFFECT_ONLY;
out_data->out_flags |= PF_OutFlag_I_USE_AUDIO;
```

### Audio Data Structures

**PF_SoundWorld:** Contains audio sample data

| Member | Purpose |
|--------|---------|
| `num_samples` | Total number of audio samples |
| `rate` | Sample rate (e.g., 44100, 48000) |
| `num_channels` | Number of audio channels |
| `format` | Sample format (8-bit, 16-bit, 32-bit float) |
| `dataP` | Pointer to audio sample data |

### Audio Processing Example

```c
static PF_Err AudioRender(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    // Get audio from input
    PF_SoundWorld *input_audio = &params[0]->u.sd;
    PF_SoundWorld *output_audio = out_data->dest_snd;

    // Get gain parameter
    PF_FpLong gain = params[1]->u.fs_d.value;

    // Process each sample
    A_long num_samples = input_audio->num_samples * input_audio->num_channels;
    PF_FpShort *in_samples = (PF_FpShort*)input_audio->dataP;
    PF_FpShort *out_samples = (PF_FpShort*)output_audio->dataP;

    for (A_long i = 0; i < num_samples; i++) {
        out_samples[i] = in_samples[i] * gain;
    }

    return err;
}
```

---

## Parameter Supervision

Parameter supervision allows effects to respond to parameter changes and implement dependent parameter behavior.

### Enabling Supervision

```c
// When adding the parameter
def.flags |= PF_ParamFlag_SUPERVISE;
```

### Handling Parameter Changes

```c
static PF_Err UserChangedParam(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output,
    PF_UserChangedParamExtra *extra)
{
    PF_Err err = PF_Err_NONE;

    // Check which parameter changed
    switch (extra->param_index) {
        case PARAM_MODE:
            // Mode changed - update dependent parameters
            if (params[PARAM_MODE]->u.pd.value == MODE_ADVANCED) {
                // Show advanced parameters
                params[PARAM_ADVANCED1]->ui_flags &= ~PF_PUI_INVISIBLE;
                params[PARAM_ADVANCED2]->ui_flags &= ~PF_PUI_INVISIBLE;
            } else {
                // Hide advanced parameters
                params[PARAM_ADVANCED1]->ui_flags |= PF_PUI_INVISIBLE;
                params[PARAM_ADVANCED2]->ui_flags |= PF_PUI_INVISIBLE;
            }
            out_data->out_flags |= PF_OutFlag_REFRESH_UI;
            break;

        case PARAM_PRESET:
            // Preset changed - update multiple parameters
            err = ApplyPreset(in_data, out_data, params, extra);
            out_data->out_flags |= PF_OutFlag_FORCE_RERENDER;
            break;
    }

    return err;
}
```

### Parameter Value Modification

When modifying parameter values programmatically:

```c
// Checkout parameter for modification
PF_ParamDef param;
AEFX_CLR_STRUCT(param);

ERR(PF_CHECKOUT_PARAM(
    in_data,
    PARAM_SLIDER,
    in_data->current_time,
    in_data->time_step,
    in_data->time_scale,
    &param
));

// Modify value
param.u.fs_d.value = new_value;

// Check in modified parameter
param.uu.change_flags = PF_ChangeFlag_CHANGED_VALUE;
ERR(PF_CHECKIN_PARAM(in_data, &param));
```

---

## Error Handling and Debugging

### Error Codes

Common error codes returned by effects:

| Error Code | Meaning |
|------------|---------|
| `PF_Err_NONE` | Success (0) |
| `PF_Err_OUT_OF_MEMORY` | Memory allocation failed |
| `PF_Err_INTERNAL_STRUCT_DAMAGED` | Data corruption detected |
| `PF_Err_INVALID_INDEX` | Parameter index out of range |
| `PF_Err_UNRECOGNIZED_PARAM_TYPE` | Unknown parameter type |
| `PF_Err_INVALID_CALLBACK` | Callback function error |
| `PF_Err_BAD_CALLBACK_PARAM` | Invalid callback parameter |

### Error Propagation Pattern

```c
#define ERR(FUNC) do { err = (FUNC); if (err) goto bail; } while (0)

PF_Err MyFunction(/* params */)
{
    PF_Err err = PF_Err_NONE;

    ERR(FirstOperation());
    ERR(SecondOperation());
    ERR(ThirdOperation());

bail:
    // Cleanup code runs even on error
    if (resource_allocated) {
        ReleaseResource();
    }

    return err;
}
```

### User Messages

Display messages to users via `return_msg`:

```c
if (error_condition) {
    strcpy(out_data->return_msg, "Error: Invalid parameter value");
    out_data->out_flags |= PF_OutFlag_DISPLAY_ERROR_MESSAGE;
    err = PF_Err_INVALID_CALLBACK;
}
```

### Debugging Tips

1. **Use PF_SPRINTF** for debug output to the AE info panel
2. **Check all callback return values** for unexpected failures
3. **Verify parameter indices** match your defined constants
4. **Test with different bit depths** (8, 16, 32-bit)
5. **Test with motion blur enabled** to catch temporal issues
6. **Enable multi-frame rendering** in preferences to test thread safety

---

## Premiere Pro Compatibility

Effects can be made compatible with Adobe Premiere Pro with some considerations.

### Compatibility Flags

Effects must check `in_data->appl_id` to detect the host:

```c
A_Boolean isAE = (in_data->appl_id == 'FXTC');
A_Boolean isPPro = (in_data->appl_id == 'PrMr');
```

### Feature Differences

| Feature | After Effects | Premiere Pro |
|---------|---------------|--------------|
| SmartFX | Supported | Not supported |
| 16-bit rendering | Supported | Not supported (falls back to 8-bit) |
| 32-bit float | Supported (via SmartFX) | Limited support |
| Custom UI | Full support | Limited support |
| 3D cameras/lights | Supported | Not applicable |
| Arbitrary data | Supported | Supported |
| AEGP functions | Supported | Not supported |

### Conditional Implementation

```c
PF_Err Render(/* params */)
{
    PF_Err err = PF_Err_NONE;

    if (in_data->appl_id == 'PrMr') {
        // Premiere Pro - use simpler rendering path
        err = RenderSimple(in_data, params, output);
    } else {
        // After Effects - use full feature set
        err = RenderFull(in_data, params, output);
    }

    return err;
}
```

### Best Practices for Cross-Host Compatibility

1. Always support 8-bit rendering as fallback
2. Test in both applications during development
3. Handle missing suites gracefully
4. Avoid relying on AE-specific features when Premiere compatibility is needed
5. Check host application before using advanced features

---

## Best Practices

### General Development

1. **Always clear PF_ParamDef** with `AEFX_CLR_STRUCT` before registration
2. **Never access pixel data directly**; use accessor macros
3. **Never write outside indicated regions** of `PF_EffectWorld`
4. **Use Adobe's function suites** instead of custom implementations
5. **Set flags in both PiPL and source code**

### Bit Depth Handling

Write a single render function in floating point, then have three iteration functions that convert 8-bit and 16-bit data:

```c
// Single processing function
static void ProcessPixelFloat(float* in, float* out, MyParams* params);

// Wrappers for each bit depth
static PF_Err IterateFunc8(/* ... */) {
    float in[4], out[4];
    Convert8ToFloat(inP, in);
    ProcessPixelFloat(in, out, params);
    ConvertFloatTo8(out, outP);
    return PF_Err_NONE;
}
```

### Memory Management

- Use After Effects' allocation functions for handles
- Free resources in corresponding SETDOWN selectors
- Handle byte-order for cross-platform compatibility in flatten/unflatten

### Error Handling

- Check all callback return values
- Use `PF_ABORT` and `PF_PROGRESS` for user feedback
- Set `return_msg` for user-visible error messages

### Performance Optimization

- Use `extent_hint` to process only necessary pixels
- Implement SmartFX for 32-bit support and efficiency
- Enable multi-frame rendering when thread-safe
- Use Compute Cache for expensive calculations

---

## Related Documentation

### Wave 1 Documents

- [[01-sdk-overview]] - SDK installation, architecture, and development environment
- [[03-aegp-plugins]] - After Effects General Plugins for timeline and project manipulation
- [[04-artisan-plugins]] - Custom 3D rendering plugins
- [[05-aeio-plugins]] - File format import/export plugins
- [[06-pipl-resources]] - Plugin Property Lists and resource configuration
- [[07-suites-reference]] - Complete function suites API reference

### External Resources

- [Adobe After Effects Developer Portal](https://developer.adobe.com/after-effects/)
- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [SmartFX Documentation](https://ae-plugins.docsforadobe.dev/smartfx/smartfx/)
- [Multi-Frame Rendering Guide](https://ae-plugins.docsforadobe.dev/effect-details/multi-frame-rendering-in-ae/)
- [Building GPU Effects](https://ae-plugins.docsforadobe.dev/intro/gpu-build-instructions/)
- [Thread Safety Tools](https://github.com/adobe/ae-plugin-thread-safety)

---

## Complete Effect Plugin Template

The following template provides a complete starting point for an effect plugin implementation:

```c
/*
 * MyEffect.cpp - Complete Effect Plugin Template
 * Demonstrates all major selectors and patterns
 */

#include "AEConfig.h"
#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_Macros.h"
#include "AEFX_ChannelDepthTpl.h"
#include "AEGP_SuiteHandler.h"
#include "String_Utils.h"
#include "Param_Utils.h"

// Plugin version
#define MAJOR_VERSION    1
#define MINOR_VERSION    0
#define BUG_VERSION      0
#define STAGE_VERSION    PF_Stage_DEVELOP
#define BUILD_VERSION    1

// Parameter IDs
enum {
    PARAM_INPUT = 0,
    PARAM_AMOUNT,
    PARAM_COLOR,
    PARAM_CHECKBOX,
    PARAM_COUNT
};

// Disk IDs (must be stable across versions)
enum {
    DISK_ID_AMOUNT = 1,
    DISK_ID_COLOR,
    DISK_ID_CHECKBOX
};

// Forward declarations
static PF_Err About(PF_InData*, PF_OutData*, PF_ParamDef*[], PF_LayerDef*);
static PF_Err GlobalSetup(PF_InData*, PF_OutData*, PF_ParamDef*[], PF_LayerDef*);
static PF_Err ParamsSetup(PF_InData*, PF_OutData*, PF_ParamDef*[], PF_LayerDef*);
static PF_Err Render(PF_InData*, PF_OutData*, PF_ParamDef*[], PF_LayerDef*);
static PF_Err SmartPreRender(PF_InData*, PF_OutData*, PF_PreRenderExtra*);
static PF_Err SmartRender(PF_InData*, PF_OutData*, PF_SmartRenderExtra*);

// Main entry point
extern "C" DllExport
PF_Err PluginDataEntryFunction(
    PF_PluginDataPtr    inPtr,
    PF_PluginDataCB     inPluginDataCallBackPtr,
    SPBasicSuite        *inSPBasicSuitePtr,
    const char          *inHostName,
    const char          *inHostVersion)
{
    PF_Err result = PF_Err_INVALID_CALLBACK;

    result = PF_REGISTER_EFFECT(
        inPtr,
        inPluginDataCallBackPtr,
        "My Effect",        // Effect name
        "ADBE MyEffect",    // Match name (must be unique)
        "My Company",       // Category
        AE_RESERVED_INFO
    );

    return result;
}

PF_Err EffectMain(
    PF_Cmd          cmd,
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output,
    void            *extra)
{
    PF_Err err = PF_Err_NONE;

    try {
        switch (cmd) {
            case PF_Cmd_ABOUT:
                err = About(in_data, out_data, params, output);
                break;

            case PF_Cmd_GLOBAL_SETUP:
                err = GlobalSetup(in_data, out_data, params, output);
                break;

            case PF_Cmd_PARAMS_SETUP:
                err = ParamsSetup(in_data, out_data, params, output);
                break;

            case PF_Cmd_RENDER:
                err = Render(in_data, out_data, params, output);
                break;

            case PF_Cmd_SMART_PRE_RENDER:
                err = SmartPreRender(in_data, out_data,
                    reinterpret_cast<PF_PreRenderExtra*>(extra));
                break;

            case PF_Cmd_SMART_RENDER:
                err = SmartRender(in_data, out_data,
                    reinterpret_cast<PF_SmartRenderExtra*>(extra));
                break;

            default:
                break;
        }
    }
    catch (PF_Err &thrown_err) {
        err = thrown_err;
    }

    return err;
}

static PF_Err About(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    AEGP_SuiteHandler suites(in_data->pica_basicP);

    suites.ANSICallbacksSuite1()->sprintf(
        out_data->return_msg,
        "%s v%d.%d\r%s",
        "My Effect",
        MAJOR_VERSION,
        MINOR_VERSION,
        "Copyright 2025 My Company"
    );

    return PF_Err_NONE;
}

static PF_Err GlobalSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    out_data->my_version = PF_VERSION(
        MAJOR_VERSION,
        MINOR_VERSION,
        BUG_VERSION,
        STAGE_VERSION,
        BUILD_VERSION
    );

    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE |
                          PF_OutFlag_PIX_INDEPENDENT;

    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE |
                           PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}

static PF_Err ParamsSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;
    PF_ParamDef def;

    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDER(
        "Amount",
        0.0, 100.0,     // Valid range
        0.0, 100.0,     // Slider range
        0,              // Curve tolerance
        50.0,           // Default
        PF_Precision_HUNDREDTHS,
        0, 0,
        DISK_ID_AMOUNT
    );

    AEFX_CLR_STRUCT(def);
    PF_ADD_COLOR(
        "Color",
        255, 128, 0,    // Default RGB
        DISK_ID_COLOR
    );

    AEFX_CLR_STRUCT(def);
    PF_ADD_CHECKBOX(
        "Enable",
        "",
        TRUE,
        0,
        DISK_ID_CHECKBOX
    );

    out_data->num_params = PARAM_COUNT;

    return err;
}

// Pixel function for 8-bit
static PF_Err PixelFunc8(
    void            *refcon,
    A_long          x,
    A_long          y,
    PF_Pixel8       *in,
    PF_Pixel8       *out)
{
    PF_FpLong amount = *((PF_FpLong*)refcon) / 100.0;

    out->alpha = in->alpha;
    out->red   = (A_u_char)(in->red * amount);
    out->green = (A_u_char)(in->green * amount);
    out->blue  = (A_u_char)(in->blue * amount);

    return PF_Err_NONE;
}

static PF_Err Render(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;
    AEGP_SuiteHandler suites(in_data->pica_basicP);

    PF_FpLong amount = params[PARAM_AMOUNT]->u.fs_d.value;

    if (!params[PARAM_CHECKBOX]->u.bd.value) {
        // Effect disabled - copy input to output
        err = PF_COPY(&params[PARAM_INPUT]->u.ld, output, NULL, NULL);
    } else {
        // Process pixels
        err = suites.Iterate8Suite1()->iterate(
            in_data,
            0, output->extent_hint.bottom - output->extent_hint.top,
            &params[PARAM_INPUT]->u.ld,
            NULL,
            (void*)&amount,
            PixelFunc8,
            output
        );
    }

    return err;
}
```

This template demonstrates the essential patterns for a production-ready effect plugin including proper error handling, multi-bit-depth support structure, and threading flags for After Effects 2022+.

---

## Glossary

| Term | Definition |
|------|------------|
| **PF_Cmd** | Command selector sent by After Effects to indicate desired action |
| **PF_InData** | Structure containing information from After Effects to the plugin |
| **PF_OutData** | Structure for plugin to return information to After Effects |
| **PF_ParamDef** | Parameter definition structure |
| **PF_EffectWorld** | Image buffer structure (also called PF_LayerDef) |
| **SmartFX** | Advanced rendering API supporting 32-bit float and efficient input requests |
| **AEGP** | After Effects General Plugin (for non-effect functionality) |
| **PiPL** | Plug-in Property List (resource file describing plugin capabilities) |
| **Sequence Data** | Persistent data storage for the lifetime of an effect instance |
| **Frame Data** | Temporary data storage for a single frame render |
| **Global Data** | Data shared across all instances of the effect |
| **Compute Cache** | Thread-safe caching API for multi-frame rendering |
| **MFR** | Multi-Frame Rendering (concurrent frame processing) |
| **Drawbot** | Platform-independent drawing API for custom UI |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial comprehensive documentation from official Adobe sources |

---

*This documentation was compiled from official Adobe After Effects SDK resources including developer.adobe.com and ae-plugins.docsforadobe.dev (the community-maintained but Adobe-endorsed SDK guide).*
