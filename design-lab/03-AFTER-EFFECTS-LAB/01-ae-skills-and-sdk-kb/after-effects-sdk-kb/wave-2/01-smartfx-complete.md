---
source: '[unknown - 01-smartfx-complete.md]'
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
title: SmartFX Complete Reference
---
[3-Resources/anchors/status-active]]


# SmartFX Complete Reference

## Overview

SmartFX is the modern effect rendering architecture in Adobe After Effects, introduced in AE 7.0 (2005) and declared as the recommended standard for effect plugin development. It fundamentally reverses the traditional rendering sequence to enable significant performance optimizations and provides the only pathway to 32-bit per channel (floating point) color support.

### Why SmartFX Exists

The traditional effect rendering model suffered from a critical inefficiency: After Effects would render complete input buffers before calling the effect, even when only a small portion of that input was actually needed. SmartFX solves this by implementing a demand-driven architecture where effects declare their input requirements based on requested output regions.

### Key Benefits

1. **32-bit Float Support** - The only way to access 32-bpc rendering in After Effects
2. **Performance Optimization** - Reduced memory allocation and buffer copying
3. **Render Skipping** - Frames that prove unnecessary during dependency analysis are never rendered
4. **Precise Dependency Tracking** - Effects declare exactly which pixels they need
5. **Multi-Frame Rendering Compatibility** - Foundation for modern concurrent rendering

---

## Architecture Overview

### Two-Phase Rendering Model

SmartFX implements a bidirectional communication pattern split into two distinct phases:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SmartFX Render Pipeline                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 1: Pre-Render (PF_Cmd_SMART_PRE_RENDER)                  │
│  ─────────────────────────────────────────────                  │
│  • After Effects specifies required output via PF_RenderRequest │
│  • Effect analyzes output requirements                          │
│  • Effect declares input dependencies via checkout_layer()      │
│  • Effect returns result bounds in PF_PreRenderOutput           │
│  • NO pixel data accessed in this phase                         │
│                                                                  │
│  ↓                                                               │
│                                                                  │
│  Phase 2: Render (PF_Cmd_SMART_RENDER)                          │
│  ──────────────────────────────────────                         │
│  • Effect retrieves checked-out pixels via checkout_layer_pixels│
│  • Effect accesses output buffer via checkout_output()          │
│  • Effect performs actual pixel processing                      │
│  • One-to-one correspondence with pre-render checkouts required │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Critical Design Principle

> "SmartFX solves this problem by reversing the calling sequence. The effect is told how much of its output is required, and must explicitly ask the host for the inputs it needs."

This demand-driven model enables After Effects to:
- Skip rendering effects whose outputs prove unnecessary
- Optimize buffer allocation based on actual needs
- Avoid redundant pixel copies
- Cache results more intelligently

---

## Enabling SmartFX

### Required Flag

To indicate SmartFX support, effects must set the following flag during `PF_Cmd_GLOBAL_SETUP`:

```c
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_SMART_RENDER;
```

### Command Selector Changes

Effects setting `PF_OutFlag2_SUPPORTS_SMART_RENDER` receive:

| Instead of This | You Receive This |
|-----------------|------------------|
| `PF_Cmd_FRAME_SETUP` | `PF_Cmd_SMART_PRE_RENDER` |
| `PF_Cmd_RENDER` | `PF_Cmd_SMART_RENDER` |
| `PF_Cmd_FRAME_SETDOWN` | (Eliminated - cleanup in SmartRender) |

### Backward Compatibility

To maintain compatibility with non-SmartFX hosts, effects should continue supporting the older command sequence alongside SmartFX:

```c
case PF_Cmd_GLOBAL_SETUP:
    out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_SMART_RENDER;
    // Also handle legacy rendering...
    break;

case PF_Cmd_FRAME_SETUP:
    // Legacy pre-render (for non-SmartFX hosts)
    break;

case PF_Cmd_RENDER:
    // Legacy render (for non-SmartFX hosts)
    break;

case PF_Cmd_SMART_PRE_RENDER:
    // SmartFX pre-render
    break;

case PF_Cmd_SMART_RENDER:
    // SmartFX render
    break;
```

---

## PF_Cmd_SMART_PRE_RENDER Complete Reference

### Purpose

"SmartFX only. Identify the area(s) of input the effect will need to produce its output, based on whatever criteria the effect implements."

### Invocation Patterns

`PF_Cmd_SMART_PRE_RENDER` may be called multiple times before a single render executes:

1. **Dependency Collection** - First call to gather input requirements
2. **Dimension Calculation** - Second call with actual source sizes to determine output dimensions
3. **Multiple Requests** - May be called for different output regions

### Extra Parameter

The `extra` parameter in `PF_Cmd_SMART_PRE_RENDER` contains a `PF_PreRenderExtra` structure:

```c
typedef struct {
    PF_PreRenderInput    *input;     // What AE wants from us
    PF_PreRenderOutput   *output;    // What we'll provide
    PF_PreRenderCallbacks *cb;       // Callback functions
} PF_PreRenderExtra;
```

### PF_PreRenderInput Structure

Describes what After Effects needs from the effect:

```c
typedef struct {
    PF_RenderRequest  output_request;  // Requested output region
    short             bitdepth;        // Color depth (8, 16, or 32)
    const void        *gpu_data;       // GPU context (if applicable)
    PF_GPU_Framework  what_gpu;        // GPU framework in use
    A_u_long          device_index;    // GPU device index
} PF_PreRenderInput;
```

### PF_RenderRequest Structure

Specifies the exact rendering parameters:

```c
typedef struct {
    PF_LRect         rect;                      // Requested output rectangle
    PF_Field         field;                     // Field rendering mode
    PF_ChannelMask   channel_mask;              // Which channels to render
    PF_Boolean       preserve_rgb_of_zero_alpha; // RGB preservation flag
    char             unused[3];                 // Padding
    A_long           reserved[4];               // Reserved for future use
} PF_RenderRequest;
```

### PF_ChannelMask Values

```c
enum {
    PF_ChannelMask_ALPHA = 0x1,   // Alpha channel only
    PF_ChannelMask_RED   = 0x2,   // Red channel only
    PF_ChannelMask_GREEN = 0x4,   // Green channel only
    PF_ChannelMask_BLUE  = 0x8,   // Blue channel only
    PF_ChannelMask_ARGB  = 0xF    // All channels
};
```

### PF_PreRenderOutput Structure

The effect populates this to describe its output:

```c
typedef struct {
    PF_LRect                     result_rect;              // Actual output bounds
    PF_LRect                     max_result_rect;          // Maximum possible output
    PF_Boolean                   solid;                    // Full opacity indicator
    PF_Boolean                   reserved;                 // Reserved
    PF_RenderOutputFlags         flags;                    // Output flags
    void                         *pre_render_data;         // Effect-allocated data
    PF_DeletePreRenderDataFunc   delete_pre_render_data_func; // Cleanup function
} PF_PreRenderOutput;
```

### PF_RenderOutputFlags

```c
enum {
    PF_RenderOutputFlag_RETURNS_EXTRA_PIXELS   = 0x1,  // Result may exceed request
    PF_RenderOutputFlag_GPU_RENDER_POSSIBLE    = 0x2,  // GPU rendering available
    PF_RenderOutputFlag_RESERVED               = 0x4   // Reserved
};
```

### Pre-Render Output Fields Explained

| Field | Description | Critical Notes |
|-------|-------------|----------------|
| `result_rect` | Actual output rectangle in layer coordinates | Can be smaller than requested if output has empty pixels |
| `max_result_rect` | Maximum possible output regardless of request | **MUST remain constant** - cannot vary based on request size |
| `solid` | TRUE if output is fully opaque | Optimization hint for compositing |
| `flags` | Rendering capability flags | Set `GPU_RENDER_POSSIBLE` if GPU path available |
| `pre_render_data` | Optional effect-allocated data | Passed to SmartRender; must provide cleanup function |

### Critical max_result_rect Requirement

> "The content bounds of a node are the largest possible result rectangle that can be returned from a call to PreRender. It absolutely cannot vary depending on current render request or anything else. It should be calculated carefully, not loosely. This calculation is very important. It is an intrinsic property of the node (and its inputs) and is fixed once the graph is built. Violation of it can and probably will cause all sorts of problems in various pieces of code."

Incorrect `max_result_rect` values cause the error:
```
[effect name] return invalid max_result_rect from PF_Cmd_SMART_PRE_RENDER(25::237)
```

---

## Checkout Layer Mechanism

### Purpose

The checkout layer mechanism enables effects to declare their input pixel dependencies during pre-render and retrieve those pixels during render.

### Pre-Render Callback: checkout_layer

```c
PF_Err (*checkout_layer)(
    PF_ProgPtr         effect_ref,      // Effect reference from in_data
    PF_ParamIndex      index,           // Parameter index of layer input
    A_long             checkout_idL,    // Unique positive checkout ID
    const PF_RenderRequest *req,        // Requested input region
    A_long             what_time,       // Time to checkout
    A_long             time_step,       // Time step for temporal sampling
    A_u_long           time_scale,      // Time scale denominator
    PF_CheckoutResult  *checkout_result // Returned checkout information
);
```

### PF_CheckoutResult Structure

Returned by `checkout_layer` with information about the checked-out layer:

```c
typedef struct {
    PF_LRect         result_rect;     // Actual available region
    PF_LRect         max_result_rect; // Maximum available region
    PF_RationalScale par;             // Pixel aspect ratio
    PF_Boolean       solid;           // Full opacity indicator
    PF_Boolean       reservedB[3];    // Reserved
    A_long           ref_width;       // Original layer width
    A_long           ref_height;      // Original layer height
    A_long           reserved[6];     // Reserved for future use
} PF_CheckoutResult;
```

### Checkout ID Requirements

1. **Must be unique** - Each `checkout_layer` call requires a distinct positive `checkout_idL`
2. **Must be positive** - Zero or negative values are invalid
3. **One-to-one mapping** - Same ID used in pre-render must be used in render
4. **Multiple layers** - Use different IDs for checking out multiple layers or the same layer multiple times

### Example: Basic Layer Checkout

```c
static PF_Err SmartPreRender(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_PreRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->output_request;
    PF_CheckoutResult checkout_result;

    // Checkout the input layer (parameter index 0 is typically the input)
    #define INPUT_CHECKOUT_ID 1

    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,                        // Input layer param index
        INPUT_CHECKOUT_ID,        // Unique checkout ID
        &req,                     // Same region as output
        in_data->current_time,    // Current time
        in_data->time_step,       // Time step
        in_data->time_scale,      // Time scale
        &checkout_result));

    // Set output based on checkout result
    extra->output->result_rect = checkout_result.result_rect;
    extra->output->max_result_rect = checkout_result.max_result_rect;
    extra->output->solid = checkout_result.solid;

    return err;
}
```

### Example: Expanded Input Region (Blur Effects)

For effects that sample beyond the output region (like blurs):

```c
static PF_Err SmartPreRender_Blur(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_PreRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->output_request;
    PF_CheckoutResult checkout_result;

    // Get blur radius from parameters
    A_long blur_radius = 50; // Example: get from params

    // Expand the input request by blur radius
    PF_RenderRequest expanded_req = req;
    expanded_req.rect.left   -= blur_radius;
    expanded_req.rect.top    -= blur_radius;
    expanded_req.rect.right  += blur_radius;
    expanded_req.rect.bottom += blur_radius;

    // Checkout expanded input region
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,
        1,                        // Checkout ID
        &expanded_req,            // Expanded region
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &checkout_result));

    // Output matches request (not expanded)
    extra->output->result_rect = req.rect;

    // Max result is the full expanded area
    extra->output->max_result_rect = checkout_result.max_result_rect;

    return err;
}
```

### Multiple Layer Checkout

For effects with multiple layer parameters:

```c
#define FOREGROUND_CHECKOUT_ID  1
#define BACKGROUND_CHECKOUT_ID  2
#define MATTE_CHECKOUT_ID       3

// Checkout each layer with unique IDs
ERR(extra->cb->checkout_layer(
    in_data->effect_ref,
    FOREGROUND_PARAM_INDEX,
    FOREGROUND_CHECKOUT_ID,
    &req,
    in_data->current_time,
    in_data->time_step,
    in_data->time_scale,
    &fg_checkout));

ERR(extra->cb->checkout_layer(
    in_data->effect_ref,
    BACKGROUND_PARAM_INDEX,
    BACKGROUND_CHECKOUT_ID,
    &req,
    in_data->current_time,
    in_data->time_step,
    in_data->time_scale,
    &bg_checkout));
```

---

## PF_Cmd_SMART_RENDER Complete Reference

### Purpose

"SmartFX only. Perform rendering and provide output for the area(s) the effect was asked to render."

### Invocation

Sent after all pre-render analysis is complete. May not be sent if After Effects determines the output is not needed.

### Extra Parameter

The `extra` parameter contains a `PF_SmartRenderExtra` structure:

```c
typedef struct {
    PF_SmartRenderInput    *input;  // Render input information
    PF_SmartRenderCallbacks *cb;    // Callback functions for pixel access
} PF_SmartRenderExtra;
```

### PF_SmartRenderInput Structure

```c
typedef struct {
    PF_RenderRequest  output_request;   // Same request as pre-render
    short             bitdepth;         // Color depth (8, 16, or 32)
    void              *pre_render_data; // Data from pre-render phase
    const void        *gpu_data;        // GPU context (if applicable)
    PF_GPU_Framework  what_gpu;         // GPU framework in use
    A_u_long          device_index;     // GPU device index
} PF_SmartRenderInput;
```

### PF_SmartRenderCallbacks Structure

```c
typedef struct {
    PF_Err (*checkout_layer_pixels)(
        PF_ProgPtr      effect_ref,
        A_long          checkout_idL,    // Must match pre-render ID
        PF_EffectWorld  **pixels);       // Returned pixel buffer

    PF_Err (*checkin_layer_pixels)(
        PF_ProgPtr      effect_ref,
        A_long          checkout_idL);   // Optional early cleanup

    PF_Err (*checkout_output)(
        PF_ProgPtr      effect_ref,
        PF_EffectWorld  **output);       // Output buffer
} PF_SmartRenderCallbacks;
```

### Callback Functions Explained

| Function | Purpose | Requirements |
|----------|---------|--------------|
| `checkout_layer_pixels` | Retrieve previously checked-out layer pixels | Must use same checkout_idL from pre-render; can only be called once per ID |
| `checkin_layer_pixels` | Release layer pixels early (optional) | For memory optimization; not required |
| `checkout_output` | Get the output buffer to write to | Must checkout at least one input first |

### Critical Constraint

> "`checkout_layer_pixels` can only be called once with the checkout_id used earlier in PreRender."

### Example: Basic Smart Render

```c
static PF_Err SmartRender(
    PF_InData         *in_data,
    PF_OutData        *out_data,
    PF_SmartRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_EffectWorld *input_worldP = NULL;
    PF_EffectWorld *output_worldP = NULL;

    // Get input pixels using same checkout ID from pre-render
    ERR(extra->cb->checkout_layer_pixels(
        in_data->effect_ref,
        INPUT_CHECKOUT_ID,
        &input_worldP));

    // Get output buffer (requires prior input checkout)
    ERR(extra->cb->checkout_output(
        in_data->effect_ref,
        &output_worldP));

    if (!err && input_worldP && output_worldP) {
        // Perform actual rendering based on bit depth
        switch (extra->input->bitdepth) {
            case 8:
                err = RenderEffect8(in_data, input_worldP, output_worldP);
                break;
            case 16:
                err = RenderEffect16(in_data, input_worldP, output_worldP);
                break;
            case 32:
                err = RenderEffect32(in_data, input_worldP, output_worldP);
                break;
        }
    }

    return err;
}
```

### Origin Offset Handling

When dealing with expanded buffers, proper offset calculation is essential:

```c
// Calculate origin offsets between input and output
A_long origin_x_offset = input_worldP->origin_x - output_worldP->origin_x;
A_long origin_y_offset = input_worldP->origin_y - output_worldP->origin_y;

// Use offsets when sampling input pixels
for (A_long y = 0; y < output_worldP->height; y++) {
    for (A_long x = 0; x < output_worldP->width; x++) {
        // Sample from input with offset
        A_long input_x = x + origin_x_offset;
        A_long input_y = y + origin_y_offset;

        // Bounds checking and pixel access...
    }
}
```

---

## 32-bit Float Rendering Requirements

### Mandatory Flags

To support 32-bit per channel rendering, effects must set both flags:

```c
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_SMART_RENDER;
out_data->out_flags2 |= PF_OutFlag2_FLOAT_COLOR_AWARE;
```

### Critical Requirement

> "If you are not using a SmartFX plugin, you CAN'T determine 32bpc color depth - this is intended behavior and was the main reason SmartFX was created in the first place. The old API will only get you 8 or 16bpc, and when applied on a 32bpc layer, you will still get 8 or 16bpc (converted) data."

### Bit Depth Handling in SmartRender

```c
switch (extra->input->bitdepth) {
    case 8:
        // Process PF_Pixel8 data (A_u_char: 0-255)
        err = Process8bpc(in_data, input_worldP, output_worldP);
        break;

    case 16:
        // Process PF_Pixel16 data (A_u_short: 0-32768)
        err = Process16bpc(in_data, input_worldP, output_worldP);
        break;

    case 32:
        // Process PF_PixelFloat data (A_FpShort: 0.0-1.0+)
        err = Process32bpc(in_data, input_worldP, output_worldP);
        break;
}
```

### 32-bit Pixel Structure

```c
typedef struct {
    A_FpShort  alpha;  // Float: typically 0.0 to 1.0
    A_FpShort  red;    // Float: can exceed 1.0 (HDR)
    A_FpShort  green;  // Float: can exceed 1.0 (HDR)
    A_FpShort  blue;   // Float: can exceed 1.0 (HDR)
} PF_PixelFloat;
```

### Creating 32-bit Float Worlds

Use `PF_WorldSuite2` with `PF_PixelFormat_ARGB128`:

```c
PF_WorldSuite2 *wsP = NULL;
PF_EffectWorld new_world;

ERR(AEFX_AcquireSuite(
    in_data,
    out_data,
    kPFWorldSuite,
    kPFWorldSuiteVersion2,
    "Couldn't acquire WorldSuite2",
    (void**)&wsP));

if (!err && wsP) {
    ERR(wsP->PF_NewWorld(
        in_data->effect_ref,
        width,
        height,
        FALSE,                    // Not clear to zero
        PF_PixelFormat_ARGB128,   // 32-bit float
        &new_world));
}
```

### Deep Color Awareness

If `PF_OutFlag_DEEP_COLOR_AWARE` is also set, effects must handle all three depths:

| Flag Combination | Required Implementations |
|------------------|-------------------------|
| SmartFX only | 8-bpc and 32-bpc |
| SmartFX + DEEP_COLOR_AWARE | 8-bpc, 16-bpc, and 32-bpc |

---

## SmartFX vs Non-SmartFX Comparison

### Feature Comparison

| Feature | Non-SmartFX | SmartFX |
|---------|-------------|---------|
| Maximum bit depth | 16-bpc | 32-bpc (float) |
| Input buffer control | None (receives full buffer) | Demand-driven (request specific regions) |
| Render skipping | Not possible | Automatic for unused outputs |
| Memory efficiency | Lower (full buffers allocated) | Higher (minimal allocations) |
| Command sequence | FRAME_SETUP → RENDER → FRAME_SETDOWN | SMART_PRE_RENDER → SMART_RENDER |
| Buffer expansion | PF_OutFlag_I_EXPAND_BUFFER | result_rect/max_result_rect |
| Temporal access | Limited | Full via checkout at any time |
| GPU rendering | Not supported | PF_Cmd_SMART_RENDER_GPU |
| Multi-frame rendering | Limited compatibility | Full MFR support |

### Command Selector Mapping

| Non-SmartFX | SmartFX Equivalent |
|-------------|-------------------|
| `PF_Cmd_FRAME_SETUP` | `PF_Cmd_SMART_PRE_RENDER` |
| `PF_Cmd_RENDER` | `PF_Cmd_SMART_RENDER` |
| `PF_Cmd_FRAME_SETDOWN` | (Integrated into SmartRender) |

### Obsolete Flags in SmartFX

These flags are marked obsolete when using SmartFX:

- `PF_OutFlag_I_EXPAND_BUFFER` - Use rect expansion in PreRenderOutput instead
- `PF_OutFlag_USE_OUTPUT_EXTENT` - Handled by SmartFX architecture

---

## Multi-Pass Rendering Patterns

### Temporal Sampling Pattern

For effects that need frames at different times:

```c
static PF_Err SmartPreRender_Temporal(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_PreRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->output_request;
    PF_CheckoutResult checkout_result;

    // Checkout current frame
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,
        CHECKOUT_ID_CURRENT,
        &req,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &checkout_result));

    // Checkout previous frame
    A_long prev_time = in_data->current_time - in_data->time_step;
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,
        CHECKOUT_ID_PREVIOUS,
        &req,
        prev_time,
        in_data->time_step,
        in_data->time_scale,
        &checkout_result));

    // Checkout next frame
    A_long next_time = in_data->current_time + in_data->time_step;
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,
        CHECKOUT_ID_NEXT,
        &req,
        next_time,
        in_data->time_step,
        in_data->time_scale,
        &checkout_result));

    return err;
}
```

### Pre-Render Data Pattern

For passing computed data from pre-render to render:

```c
typedef struct {
    A_long  blur_radius;
    A_long  effect_mode;
    // ... other computed values
} MyPreRenderData;

static void DeletePreRenderData(void *pre_render_data)
{
    if (pre_render_data) {
        PF_FREE(pre_render_data);
    }
}

static PF_Err SmartPreRender(...)
{
    // Allocate and populate pre-render data
    MyPreRenderData *dataP = NULL;
    ERR(PF_NEW_HANDLE(sizeof(MyPreRenderData), &dataP));

    if (!err && dataP) {
        dataP->blur_radius = /* computed value */;
        dataP->effect_mode = /* computed value */;

        extra->output->pre_render_data = dataP;
        extra->output->delete_pre_render_data_func = DeletePreRenderData;
    }

    return err;
}

static PF_Err SmartRender(...)
{
    // Access pre-render data
    MyPreRenderData *dataP = (MyPreRenderData*)extra->input->pre_render_data;

    if (dataP) {
        A_long blur_radius = dataP->blur_radius;
        // Use computed values...
    }

    return err;
}
```

---

## Threading Considerations with SmartFX

### Multi-Frame Rendering (MFR)

After Effects 2022+ supports Multi-Frame Rendering, which renders multiple frames concurrently. SmartFX effects must be thread-safe to fully participate.

### Required Flag for MFR

```c
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_THREADED_RENDERING;
```

### Thread-Safety Requirements

An effect is thread-safe when:

1. **No problematic static/global variables** - Either absent or free from race conditions
2. **Global data read-only during render** - Can only write in `PF_Cmd_GLOBAL_SETUP` and `PF_Cmd_GLOBAL_SETDOWN`
3. **Sequence data read-only during render** - Must use `PF_EffectSequenceDataSuite` for access

### Selector Threading Model

| Selector | Threading |
|----------|-----------|
| `PF_Cmd_GLOBAL_SETUP` | Main thread only |
| `PF_Cmd_GLOBAL_SETDOWN` | Main thread only |
| UI selectors | Main thread only |
| `PF_Cmd_SEQUENCE_SETUP` | Multi-threaded |
| `PF_Cmd_SMART_PRE_RENDER` | Multi-threaded |
| `PF_Cmd_SMART_RENDER` | Multi-threaded |

### Critical Warning

> "If an effect uses blocking synchronization mechanisms, such as mutexes or gates, these must not be held when calling back into the host" to avoid deadlocks.

### Sequence Data Handling (March 2021 SDK+)

```c
// Access sequence data in thread-safe manner
PF_EffectSequenceDataSuite1 *seqDataSuite = NULL;
ERR(AEFX_AcquireSuite(
    in_data,
    out_data,
    kPFEffectSequenceDataSuite,
    kPFEffectSequenceDataSuiteVersion1,
    NULL,
    (void**)&seqDataSuite));

if (!err && seqDataSuite) {
    void *seq_data = NULL;
    ERR(seqDataSuite->PF_GetSequenceData(in_data->effect_ref, &seq_data));
    // Use seq_data (read-only)...
}
```

### Mutable Sequence Data (Performance Cost)

If writes to sequence_data are required during render:

```c
out_data->out_flags2 |= PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER;
```

This flag significantly reduces rendering concurrency.

---

## GPU Integration with SmartFX

### PF_Cmd_SMART_RENDER_GPU

For effects supporting GPU acceleration:

```c
case PF_Cmd_SMART_RENDER_GPU:
    err = SmartRenderGPU(in_data, out_data,
                         (PF_SmartRenderExtra*)extra);
    break;
```

### GPU Rendering Flag

During pre-render, indicate GPU capability:

```c
extra->output->flags |= PF_RenderOutputFlag_GPU_RENDER_POSSIBLE;
```

### GPU Data Access

The `gpu_data` field in `PF_PreRenderInput` and `PF_SmartRenderInput` provides GPU context information:

```c
if (extra->input->gpu_data != NULL) {
    PF_GPU_Framework gpu = extra->input->what_gpu;
    A_u_long device = extra->input->device_index;

    switch (gpu) {
        case PF_GPU_Framework_OPENCL:
            // OpenCL rendering path
            break;
        case PF_GPU_Framework_METAL:
            // Metal rendering path (macOS)
            break;
        case PF_GPU_Framework_CUDA:
            // CUDA rendering path (Windows)
            break;
    }
}
```

### GPU vs CPU Selection

After Effects automatically selects GPU or CPU rendering based on:
- GPU availability
- Effect's GPU capability flag
- User preferences
- Memory constraints

Either `PF_Cmd_SMART_RENDER` or `PF_Cmd_SMART_RENDER_GPU` executes, never both for the same frame.

---

## Buffer Expansion in SmartFX

### The Problem

Effects like blurs need to sample pixels beyond the requested output region.

### The Solution

Expand rectangles during pre-render:

```c
static PF_Err SmartPreRender_Expanded(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_PreRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->output_request;
    A_long expansion = 50; // Pixels to expand

    // Expand input request
    PF_RenderRequest expanded_req = req;
    expanded_req.rect.left   -= expansion;
    expanded_req.rect.top    -= expansion;
    expanded_req.rect.right  += expansion;
    expanded_req.rect.bottom += expansion;

    // Checkout with expanded region
    PF_CheckoutResult checkout;
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref, 0, 1,
        &expanded_req,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &checkout));

    // Set result rectangles
    // If both rects are set to the expanded rect,
    // PF_RenderOutputFlag_RETURNS_EXTRA_PIXELS is not needed
    extra->output->result_rect = expanded_req.rect;
    extra->output->max_result_rect = expanded_req.rect;

    return err;
}
```

### PF_RenderOutputFlag_RETURNS_EXTRA_PIXELS

Use this flag when your result may exceed the requested region but you're returning the original request size:

```c
extra->output->flags |= PF_RenderOutputFlag_RETURNS_EXTRA_PIXELS;
```

---

## Common Issues and Solutions

### Empty Rectangles in PF_CheckoutResult

**Known Bug (AE 11.0):** With `PF_OutFlag2_AUTOMATIC_WIDE_TIME_INPUT` and `PF_OutFlag_NON_PARAM_VARY`, `checkout_layer` returns empty rects.

**Workaround:** Call `checkout_layer` again:

```c
ERR(extra->cb->checkout_layer(...));
if (checkout_result.result_rect.left == 0 &&
    checkout_result.result_rect.right == 0) {
    // Bug workaround: call again
    ERR(extra->cb->checkout_layer(...));
}
```

**Note:** Fixed in AE 11.0.1+

### NULL Pixels from checkout_layer_pixels

**Cause:** Mismatch between pre-render checkout_idL and render checkout_idL.

**Solution:** Ensure exact ID matching:

```c
// Pre-render
#define MY_CHECKOUT_ID 42
ERR(extra->cb->checkout_layer(..., MY_CHECKOUT_ID, ...));

// Render - MUST use same ID
ERR(extra->cb->checkout_layer_pixels(..., MY_CHECKOUT_ID, ...));
```

### FORCE_RERENDER Usage

For SmartFX effects where custom UI or dialog changes affect rendering:

```c
// When sequence data changes during UI interaction
out_data->out_flags |= PF_OutFlag_FORCE_RERENDER;
```

During `PF_Cmd_SMART_PRERENDER`, use `GuidMixInPtr()` to mix additional state into the cache GUID:

```c
// Mix custom state into cache key
ERR(GuidMixInPtr(guid, my_custom_state_ptr));
```

### Pre-Render Data Memory Leaks

**Always provide cleanup function:**

```c
extra->output->pre_render_data = myAllocatedData;
extra->output->delete_pre_render_data_func = MyCleanupFunction;
```

The render phase may never execute, so After Effects calls the cleanup function automatically.

---

## Best Practices

### 1. Always Check Errors

```c
if (!err) {
    ERR(extra->cb->checkout_layer_pixels(...));
}
if (!err && input_worldP) {
    ERR(extra->cb->checkout_output(...));
}
```

### 2. Validate Pointers Before Use

```c
if (!err && input_worldP && output_worldP) {
    // Safe to proceed with rendering
}
```

### 3. Handle All Bit Depths

```c
switch (extra->input->bitdepth) {
    case 8:  err = Render8(in_data, input, output); break;
    case 16: err = Render16(in_data, input, output); break;
    case 32: err = Render32(in_data, input, output); break;
}
```

### 4. Propagate preserve_rgb_of_zero_alpha

When checking out layers, propagate this flag:

```c
PF_RenderRequest child_req = extra->input->output_request;
child_req.preserve_rgb_of_zero_alpha =
    extra->input->output_request.preserve_rgb_of_zero_alpha;
```

### 5. Use Sample Projects

Adobe provides sample projects demonstrating SmartFX:
- **SmartyPants** - Basic SmartFX implementation with GUID mixing
- **Shifter** - Buffer expansion example
- **SDK samples** - Various SmartFX patterns

---

## Complete Example: SmartFX Effect

```c
#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_EffectCBSuites.h"
#include "AE_Macros.h"

#define INPUT_CHECKOUT_ID  1

static PF_Err GlobalSetup(
    PF_InData   *in_data,
    PF_OutData  *out_data)
{
    out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_SMART_RENDER;
    out_data->out_flags2 |= PF_OutFlag2_FLOAT_COLOR_AWARE;
    out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}

static PF_Err SmartPreRender(
    PF_InData         *in_data,
    PF_OutData        *out_data,
    PF_PreRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->output_request;
    PF_CheckoutResult checkout;

    // Checkout input layer
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,                        // Input param index
        INPUT_CHECKOUT_ID,
        &req,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &checkout));

    // Set output bounds
    extra->output->result_rect = checkout.result_rect;
    extra->output->max_result_rect = checkout.max_result_rect;
    extra->output->solid = checkout.solid;

    return err;
}

static PF_Err SmartRender(
    PF_InData           *in_data,
    PF_OutData          *out_data,
    PF_SmartRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;
    PF_EffectWorld *input_worldP = NULL;
    PF_EffectWorld *output_worldP = NULL;

    // Get input pixels
    ERR(extra->cb->checkout_layer_pixels(
        in_data->effect_ref,
        INPUT_CHECKOUT_ID,
        &input_worldP));

    // Get output buffer
    ERR(extra->cb->checkout_output(
        in_data->effect_ref,
        &output_worldP));

    if (!err && input_worldP && output_worldP) {
        // Process based on bit depth
        switch (extra->input->bitdepth) {
            case 8:
                err = Process8bpc(in_data, input_worldP, output_worldP);
                break;
            case 16:
                err = Process16bpc(in_data, input_worldP, output_worldP);
                break;
            case 32:
                err = Process32bpc(in_data, input_worldP, output_worldP);
                break;
        }
    }

    return err;
}

PF_Err PluginMain(
    PF_Cmd       cmd,
    PF_InData    *in_data,
    PF_OutData   *out_data,
    PF_ParamDef  *params[],
    PF_LayerDef  *output,
    void         *extra)
{
    PF_Err err = PF_Err_NONE;

    switch (cmd) {
        case PF_Cmd_GLOBAL_SETUP:
            err = GlobalSetup(in_data, out_data);
            break;

        case PF_Cmd_SMART_PRE_RENDER:
            err = SmartPreRender(in_data, out_data,
                                (PF_PreRenderExtra*)extra);
            break;

        case PF_Cmd_SMART_RENDER:
            err = SmartRender(in_data, out_data,
                             (PF_SmartRenderExtra*)extra);
            break;

        // Handle other commands...
    }

    return err;
}
```

---

## Related Documentation

- [[02-effect-parameters-complete]] - Parameter definitions and checkout
- [[03-suites-reference]] - Available function suites
- [[04-pixel-iteration]] - Efficient pixel processing techniques
- [[05-memory-management]] - Handle allocation and management
- [[06-gpu-effects]] - Detailed GPU effect development
- [[07-multi-frame-rendering]] - MFR implementation details
- [[00-wave-2-index]] - Wave 2 research index

---

## Sources

1. [SmartFX - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/smartfx/smartfx/)
2. [Command Selectors - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-basics/command-selectors/)
3. [PF_OutData - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-basics/PF_OutData/)
4. [Multi-Frame Rendering in AE - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-details/multi-frame-rendering-in-ae/)
5. [AE_Effect.h Header File](https://github.com/takahirome/AdobeScripts/blob/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Headers/AE_Effect.h)
6. [Adobe Community Forums - SmartFX Discussions](https://community.adobe.com/t5/after-effects-discussions/ct-p/after-effects)

---

*Document generated as part of Wave 2 After Effects SDK research*
*Last updated: 2025-12-27*
