---
source: '[unknown - 06-pf-suites-reference.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Adobe After Effects SDK: PF Suites Reference

## Overview

The After Effects SDK provides a comprehensive collection of PF (Plug-in Functions) Suites that give effect plug-ins access to host functionality. These suites cover memory management, image processing, iteration, color conversion, path manipulation, parameter handling, and UI operations. This reference documents 18+ essential PF Suites with complete function signatures, usage patterns, and best practices.

---

## Suite Acquisition

### Using AEFX_SuiteScoper (C++)

The recommended approach for acquiring suites in C++ code uses `AEFX_SuiteScoper`, which automatically manages suite lifecycle:

```cpp
AEFX_SuiteScoper<PF_GPUDeviceSuite1> gpu_suite =
    AEFX_SuiteScoper<PF_GPUDeviceSuite1>(
        in_dataP,
        kPFGPUDeviceSuite,
        kPFGPUDeviceSuiteVersion1,
        out_dataP);

// Call suite functions directly
gpu_suite->GetDeviceInfo(in_dataP->effect_ref, extraP->input->device_index, &device_info);
```

### Error Handling

`AEFX_SuiteScoper` throws `A_Err_MISSING_SUITE` if a suite cannot be acquired (unless `ALLOW_NO_SUITE` is true). Wrap calls in try/catch blocks when disallowing missing suites, or check for NULL pointers when allowing them.

### Suite Versioning

Multiple suite versions can coexist (e.g., WhizBangSuite1 and WhizBangSuite2). The recommended strategy involves attempting to acquire the latest version first, then falling back to earlier versions if needed.

### Threading Considerations

Unless documented otherwise, assume that any function provided by suites is not thread-safe. UI modifications should occur only in the main thread.

---

## 1. PF_HandleSuite1 - Memory Management

### Purpose

Provides host-managed memory allocation for plug-ins. Using After Effects for memory allocations of significant size avoids competition with the host for OS memory during low-memory conditions such as RAM preview.

### Suite Name
`kPFHandleSuite` / `PF_HandleSuite1`

### Functions

#### host_new_handle
Allocates a new memory handle.

```cpp
PF_Handle (*host_new_handle)(A_HandleSize size);
```

**Parameters:**
- `size` - Size in bytes to allocate

**Returns:** `PF_Handle` to the allocated memory block, or NULL on failure.

---

#### host_lock_handle
Locks a handle for direct memory access.

```cpp
void* (*host_lock_handle)(PF_Handle pf_handle);
```

**Parameters:**
- `pf_handle` - Handle to lock

**Returns:** Pointer to the locked memory block.

---

#### host_unlock_handle
Unlocks a previously locked handle.

```cpp
void (*host_unlock_handle)(PF_Handle pf_handle);
```

**Parameters:**
- `pf_handle` - Handle to unlock

**Returns:** None.

---

#### host_dispose_handle
Frees a previously allocated handle.

```cpp
void (*host_dispose_handle)(PF_Handle pf_handle);
```

**Parameters:**
- `pf_handle` - Handle to dispose

**Returns:** None.

---

#### host_get_handle_size
Returns the size of an allocated handle.

```cpp
A_HandleSize (*host_get_handle_size)(PF_Handle pf_handle);
```

**Parameters:**
- `pf_handle` - Handle to query

**Returns:** Size of the memory block in bytes.

---

#### host_resize_handle
Resizes an existing handle.

```cpp
PF_Err (*host_resize_handle)(A_HandleSize new_sizeL, PF_Handle *handlePH);
```

**Parameters:**
- `new_sizeL` - New size in bytes
- `handlePH` - Pointer to handle (may be modified if reallocation occurs)

**Returns:** `PF_Err` error code.

### Best Practices

- For C++ classes wrapping handles, create a base class implementing new/delete rather than overloading globally
- For STL containers, provide custom allocators in template definitions instead of global overloads
- Handles passed to your plug-in arrive locked and are unlocked upon return

---

## 2. PF_WorldSuite2 - Image Buffer Management

### Purpose

Creates and manages `PF_EffectWorld` image buffers, which represent the fundamental image data structure in After Effects.

### Suite Name
`kPFWorldSuite` / `PF_WorldSuite2`

### Functions

#### PF_NewWorld
Creates a new PF_EffectWorld with specified dimensions and pixel format.

```cpp
PF_Err PF_NewWorld(
    PF_ProgPtr      effect_ref,
    A_long          widthL,
    A_long          heightL,
    PF_Boolean      clear_pixB,
    PF_PixelFormat  pixel_format,
    PF_EffectWorld  *worldP);
```

**Parameters:**
- `effect_ref` - Effect reference from PF_InData
- `widthL` - Width in pixels
- `heightL` - Height in pixels
- `clear_pixB` - TRUE to initialize pixels to zero
- `pixel_format` - Desired pixel format
- `worldP` - Pointer to receive the created world

**Returns:** `PF_Err` error code.

---

#### PF_DisposeWorld
Destroys an existing PF_EffectWorld and frees its memory.

```cpp
PF_Err PF_DisposeWorld(
    PF_ProgPtr      effect_ref,
    PF_EffectWorld  *worldP);
```

**Parameters:**
- `effect_ref` - Effect reference
- `worldP` - World to dispose

**Returns:** `PF_Err` error code.

---

#### PF_GetPixelFormat
Retrieves the pixel format of an existing world.

```cpp
PF_Err PF_GetPixelFormat(
    const PF_EffectWorld    *worldP,
    PF_PixelFormat          *pixel_formatP);
```

**Parameters:**
- `worldP` - World to query
- `pixel_formatP` - Pointer to receive pixel format

**Returns:** `PF_Err` error code.

### Supported Pixel Formats

| Format Constant | Description |
|-----------------|-------------|
| `PF_PixelFormat_ARGB32` | Standard 8-bit per channel ARGB |
| `PF_PixelFormat_ARGB64` | 16-bit per channel ARGB |
| `PF_PixelFormat_ARGB128` | 32-bit floating-point per channel ARGB |

---

## 3. PF_PixelFormatSuite2 - Pixel Format Declaration

### Purpose

Declares supported pixel formats for SmartFX effects during `PF_Cmd_GLOBAL_SETUP`.

### Suite Name
`kPFPixelFormatSuite` / `PF_PixelFormatSuite2`

### Functions

#### AddSupportedPixelFormat
Registers a pixel format that the effect can process.

```cpp
PF_Err AddSupportedPixelFormat(
    PF_ProgPtr          effect_ref,
    PF_PixelFormat      pixel_format);
```

**Parameters:**
- `effect_ref` - Effect reference
- `pixel_format` - Pixel format to support

**Returns:** `PF_Err` error code.

**Usage:** Call during `PF_Cmd_GLOBAL_SETUP` for each format your effect supports.

---

#### ClearSupportedPixelFormats
Removes all previously registered pixel formats.

```cpp
PF_Err ClearSupportedPixelFormats(
    PF_ProgPtr effect_ref);
```

**Parameters:**
- `effect_ref` - Effect reference

**Returns:** `PF_Err` error code.

---

## 4. PF_PixelDataSuite1 - Pixel Data Access

### Purpose

Provides safe access to pixel data in PF_EffectWorld buffers at various bit depths.

### Suite Name
`kPFPixelDataSuite` / `PF_PixelDataSuite1`

### Functions

#### get_pixel_data8
Retrieves a pointer to 8-bit pixel data.

```cpp
PF_Err get_pixel_data8(
    PF_EffectWorld  *worldP,
    PF_PixelPtr     pixelsP0,
    PF_Pixel8       **pixel8PP);
```

**Parameters:**
- `worldP` - Source world
- `pixelsP0` - Optional existing pixel pointer (can be NULL)
- `pixel8PP` - Pointer to receive 8-bit pixel data

**Returns:** `PF_Err` error code.

---

#### get_pixel_data16
Retrieves a pointer to 16-bit pixel data.

```cpp
PF_Err get_pixel_data16(
    PF_EffectWorld  *worldP,
    PF_PixelPtr     pixelsP0,
    PF_Pixel16      **pixel16PP);
```

**Parameters:**
- `worldP` - Source world
- `pixelsP0` - Optional existing pixel pointer (can be NULL)
- `pixel16PP` - Pointer to receive 16-bit pixel data

**Returns:** `PF_Err` error code.

---

#### get_pixel_data_float
Retrieves a pointer to 32-bit floating-point pixel data.

```cpp
PF_Err get_pixel_data_float(
    PF_EffectWorld  *worldP,
    PF_PixelPtr     pixelsP0,
    PF_PixelFloat   **pixelFloatPP);
```

**Parameters:**
- `worldP` - Source world
- `pixelsP0` - Optional existing pixel pointer (can be NULL)
- `pixelFloatPP` - Pointer to receive float pixel data

**Returns:** `PF_Err` error code.

---

## 5. PF_WorldTransformSuite1 - Image Transformations

### Purpose

Provides compositing, blending, convolution, and geometric transformation operations on image buffers.

### Suite Name
`kPFWorldTransformSuite` / `PF_WorldTransformSuite1`

### Functions

#### composite_rect
Composites a rectangle from one PF_EffectWorld into another using transfer modes.

```cpp
PF_Err composite_rect(
    PF_ProgPtr      effect_ref,
    PF_Rect         *src_rect,
    A_long          src_opacity,
    PF_EffectWorld  *src_world,
    A_long          dst_x,
    A_long          dst_y,
    PF_Field        field_rdr,
    PF_XferMode     xfer_mode,
    PF_EffectWorld  *dst);
```

**Parameters:**
- `effect_ref` - Effect reference
- `src_rect` - Source rectangle to composite
- `src_opacity` - Opacity (0-255)
- `src_world` - Source image buffer
- `dst_x`, `dst_y` - Destination coordinates
- `field_rdr` - Field rendering mode
- `xfer_mode` - Transfer mode (COPY, BEHIND, IN_FRONT)
- `dst` - Destination image buffer

**Returns:** `PF_Err` error code.

**Supported Transfer Modes:**
- `PF_Xfer_COPY` - Direct copy
- `PF_Xfer_BEHIND` - Place behind existing pixels
- `PF_Xfer_IN_FRONT` - Place in front of existing pixels

---

#### blend
Blends two images with alpha weighting.

```cpp
PF_Err blend(
    PF_ProgPtr              effect_ref,
    const PF_EffectWorld    *src1,
    const PF_EffectWorld    *src2,
    PF_Fixed                ratio,
    PF_EffectWorld          *dst);
```

**Parameters:**
- `effect_ref` - Effect reference
- `src1` - First source image
- `src2` - Second source image
- `ratio` - Blend ratio (fixed-point 0.0-1.0)
- `dst` - Destination buffer

**Returns:** `PF_Err` error code.

---

#### convolve
Applies convolution with arbitrary kernel on each channel.

```cpp
PF_Err convolve(
    PF_EffectWorld      *src,
    const PF_Rect       *area,
    PF_KernelFlags      flags,
    A_long              kernel_size,
    void                *a_kernel,
    void                *r_kernel,
    void                *g_kernel,
    void                *b_kernel,
    PF_EffectWorld      *dst);
```

**Parameters:**
- `src` - Source image
- `area` - Region to convolve
- `flags` - Kernel configuration flags
- `kernel_size` - Size of kernel
- `a_kernel`, `r_kernel`, `g_kernel`, `b_kernel` - Per-channel kernels
- `dst` - Destination buffer

**Returns:** `PF_Err` error code.

**Kernel Flags:**

| Flag | Description |
|------|-------------|
| `PF_KernelFlag_2D` | Two-dimensional kernel |
| `PF_KernelFlag_1D` | One-dimensional kernel |
| `PF_KernelFlag_NORMALIZED` | Kernel values are normalized |
| `PF_KernelFlag_UNNORMALIZED` | Kernel values are raw |
| `PF_KernelFlag_USE_LONG` | Kernel uses long integers (implemented) |
| `PF_KernelFlag_USE_CHAR` | Kernel uses chars |
| `PF_KernelFlag_USE_FIXED` | Kernel uses fixed-point |
| `PF_KernelFlag_TRANSPARENT_BORDERS` | Treat edges as transparent |
| `PF_KernelFlag_REPLICATE_BORDERS` | Replicate edge pixels |
| `PF_KernelFlag_STRAIGHT_CONVOLVE` | Direct convolution |
| `PF_KernelFlag_ALPHA_WEIGHT_CONVOLVE` | Alpha-weighted convolution |

---

#### copy / copy_hq
Copies a region from one world to another, preserving alpha.

```cpp
PF_Err copy(
    PF_EffectWorld  *src,
    PF_EffectWorld  *dst,
    PF_Rect         *src_r,
    PF_Rect         *dst_r);

PF_Err copy_hq(
    PF_EffectWorld  *src,
    PF_EffectWorld  *dst,
    PF_Rect         *src_r,
    PF_Rect         *dst_r);
```

**Parameters:**
- `src` - Source world
- `dst` - Destination world
- `src_r` - Source rectangle
- `dst_r` - Destination rectangle

**Returns:** `PF_Err` error code.

**Note:** `copy_hq` is a higher fidelity variant for quality-sensitive operations.

---

#### transfer_rect
Blends using a transfer mode with an optional mask.

```cpp
PF_Err transfer_rect(
    PF_ProgPtr              effect_ref,
    PF_Quality              quality,
    PF_ModeFlags            m_flags,
    PF_Field                field,
    const PF_Rect           *src_rec,
    const PF_EffectWorld    *src_world,
    const PF_CompositeMode  *comp_mode,
    const PF_MaskWorld      *mask_world0,
    A_long                  dest_x,
    A_long                  dest_y,
    PF_EffectWorld          *dst_world);
```

**Parameters:**
- `effect_ref` - Effect reference
- `quality` - Rendering quality
- `m_flags` - Mode flags
- `field` - Field rendering mode
- `src_rec` - Source rectangle
- `src_world` - Source buffer
- `comp_mode` - Composite mode settings
- `mask_world0` - Optional mask (can be NULL)
- `dest_x`, `dest_y` - Destination coordinates
- `dst_world` - Destination buffer

**Returns:** `PF_Err` error code.

---

#### transform_world
Performs geometric transformations with optional motion blur.

```cpp
PF_Err transform_world(
    PF_InData               *in_data,
    PF_Quality              quality,
    PF_ModeFlags            m_flags,
    PF_Field                field,
    const PF_EffectWorld    *src_world,
    const PF_CompositeMode  *comp_mode,
    const PF_MaskWorld      *mask_world0,
    const PF_FloatMatrix    *matrices,
    A_long                  num_matrices,
    Boolean                 src2dst_matrix,
    const PF_Rect           *dest_rect,
    PF_EffectWorld          *dst_world);
```

**Parameters:**
- `in_data` - PF_InData structure
- `quality` - Rendering quality
- `m_flags` - Mode flags
- `field` - Field rendering mode
- `src_world` - Source buffer
- `comp_mode` - Composite mode
- `mask_world0` - Optional mask
- `matrices` - Array of transformation matrices
- `num_matrices` - Number of matrices (for motion blur)
- `src2dst_matrix` - TRUE if matrices transform source to destination
- `dest_rect` - Destination rectangle
- `dst_world` - Destination buffer

**Returns:** `PF_Err` error code.

---

## 6. PF_FillMatteSuite2 - Fill and Premultiplication

### Purpose

Provides fill operations and alpha premultiplication for image buffers.

### Suite Name
`kPFFillMatteSuite` / `PF_FillMatteSuite2`

### Functions

#### fill
Fills a rectangle with a specified color.

```cpp
PF_Err fill(
    PF_ProgPtr          effect_ref,
    const PF_Pixel      *color,
    const PF_Rect       *dst_rect,
    PF_EffectWorld      *world);
```

**Parameters:**
- `effect_ref` - Effect reference
- `color` - Fill color (NULL for black with zero alpha)
- `dst_rect` - Rectangle to fill
- `world` - Target world

**Returns:** `PF_Err` error code.

---

#### fill16
16-bit variant of fill operation.

```cpp
PF_Err fill16(
    PF_ProgPtr          effect_ref,
    const PF_Pixel16    *color,
    const PF_Rect       *dst_rect,
    PF_EffectWorld      *world);
```

---

#### fill_float
Floating-point variant of fill operation.

```cpp
PF_Err fill_float(
    PF_ProgPtr              effect_ref,
    const PF_PixelFloat     *color,
    const PF_Rect           *dst_rect,
    PF_EffectWorld          *world);
```

---

#### premultiply
Converts to/from premultiplied alpha with black.

```cpp
PF_Err premultiply(
    A_long          forward,
    PF_EffectWorld  *dst);
```

**Parameters:**
- `forward` - TRUE to premultiply, FALSE to unpremultiply
- `dst` - Image buffer to modify

**Returns:** `PF_Err` error code.

---

#### premultiply_color / premultiply_color16 / premultiply_color_float
Premultiplies with a custom color instead of black.

```cpp
PF_Err premultiply_color(
    PF_EffectWorld  *src,
    PF_Pixel        *color,
    A_long          forward,
    PF_EffectWorld  *dst);

PF_Err premultiply_color16(
    PF_EffectWorld  *src,
    PF_Pixel16      *color,
    A_long          forward,
    PF_EffectWorld  *dst);

PF_Err premultiply_color_float(
    PF_EffectWorld  *src,
    PF_PixelFloat   *color,
    A_long          forward,
    PF_EffectWorld  *dst);
```

**Parameters:**
- `src` - Source image
- `color` - Color for premultiplication
- `forward` - TRUE to premultiply, FALSE to unpremultiply
- `dst` - Destination buffer

**Returns:** `PF_Err` error code.

---

## 7. PF_Iterate8Suite1 - 8-bit Pixel Iteration

### Purpose

Enables efficient, multi-threaded pixel processing for 8-bit images. After Effects automatically distributes work across available CPU cores and manages progress reporting.

### Suite Name
`kPFIterate8Suite` / `PF_Iterate8Suite1`

### Thread Safety Requirements

**Critical:** Pixel processing functions passed to iterator callbacks must be re-entrant. Pixels may process in non-deterministic order across multiple CPU threads.

### Functions

#### iterate
Processes pixels from source to destination across specified regions.

```cpp
PF_Err iterate(
    PF_InData       *in_data,
    A_long          progress_base,
    A_long          progress_final,
    PF_EffectWorld  *src,
    const PF_Rect   *area,
    void            *refcon,
    PF_Err          (*pix_fn)(void *refcon, A_long x, A_long y,
                              PF_Pixel *in, PF_Pixel *out),
    PF_EffectWorld  *dst);
```

**Parameters:**
- `in_data` - PF_InData structure
- `progress_base` - Starting progress value
- `progress_final` - Ending progress value
- `src` - Source image (read-only during processing)
- `area` - Region to process (NULL for entire image)
- `refcon` - User data passed to callback
- `pix_fn` - Per-pixel callback function
- `dst` - Destination image

**Returns:** `PF_Err` error code.

**Note:** Progress and abort checking are handled automatically; do not implement them in your pixel function.

---

#### iterate_origin
Handles offset processing when output buffers differ in size from input buffers.

```cpp
PF_Err iterate_origin(
    PF_InData       *in_data,
    A_long          progress_base,
    A_long          progress_final,
    PF_EffectWorld  *src,
    const PF_Rect   *area,
    const PF_Point  *origin,
    void            *refcon,
    PF_Err          (*pix_fn)(void *refcon, A_long x, A_long y,
                              PF_Pixel *in, PF_Pixel *out),
    PF_EffectWorld  *dst);
```

**Parameters:**
- `origin` - Origin offset for coordinate mapping
- (Other parameters same as `iterate`)

---

#### iterate_lut
Applies look-up tables per channel.

```cpp
PF_Err iterate_lut(
    PF_InData       *in_data,
    A_long          progress_base,
    A_long          progress_final,
    PF_EffectWorld  *src,
    const PF_Rect   *area,
    A_u_char        *a_lut,
    A_u_char        *r_lut,
    A_u_char        *g_lut,
    A_u_char        *b_lut,
    PF_EffectWorld  *dst);
```

**Parameters:**
- `a_lut` - Alpha channel LUT (256 entries)
- `r_lut` - Red channel LUT (256 entries)
- `g_lut` - Green channel LUT (256 entries)
- `b_lut` - Blue channel LUT (256 entries)

**Returns:** `PF_Err` error code.

**Note:** 8-bit suite only.

---

#### iterate_origin_non_clip_src
Processes pixels outside source/destination intersection, passing {0,0,0,0} for out-of-bounds source pixels.

```cpp
PF_Err iterate_origin_non_clip_src(
    PF_InData       *in_data,
    A_long          progress_base,
    A_long          progress_final,
    PF_EffectWorld  *src,
    const PF_Rect   *area,
    const PF_Point  *origin,
    void            *refcon,
    PF_Err          (*pix_fn)(void *refcon, A_long x, A_long y,
                              PF_Pixel *in, PF_Pixel *out),
    PF_EffectWorld  *dst);
```

---

#### iterate_generic
Executes callback once per CPU processor for parallel processing.

```cpp
PF_Err iterate_generic(
    A_long      iterationsL,
    void        *refconPV,
    PF_Err      (*fn_func)(void *refconPV, A_long thread_indexL,
                           A_long i, A_long iterationsL));
```

**Parameters:**
- `iterationsL` - Use `PF_Iterations_ONCE_PER_PROCESSOR` for CPU count
- `refconPV` - User data
- `fn_func` - Callback function

**Returns:** `PF_Err` error code.

**Note:** Only thread 0 should call abort/progress functions. 8-bit suite only.

---

## 8. PF_Iterate16Suite1 - 16-bit Pixel Iteration

### Purpose

Same functionality as PF_Iterate8Suite1 for 16-bit per channel images.

### Suite Name
`kPFIterate16Suite` / `PF_Iterate16Suite1`

### Functions

All functions mirror PF_Iterate8Suite1 with `PF_Pixel16` types:

```cpp
PF_Err iterate(
    PF_InData       *in_data,
    A_long          progress_base,
    A_long          progress_final,
    PF_EffectWorld  *src,
    const PF_Rect   *area,
    void            *refcon,
    PF_Err          (*pix_fn)(void *refcon, A_long x, A_long y,
                              PF_Pixel16 *in, PF_Pixel16 *out),
    PF_EffectWorld  *dst);
```

**Note:** `iterate_lut` is not available for 16-bit suite.

---

## 9. PF_IterateFloatSuite1 - Float Pixel Iteration

### Purpose

Same functionality as PF_Iterate8Suite1 for 32-bit floating-point images.

### Suite Name
`kPFIterateFloatSuite` / `PF_IterateFloatSuite1`

### Functions

All functions mirror PF_Iterate8Suite1 with `PF_PixelFloat` types:

```cpp
PF_Err iterate(
    PF_InData       *in_data,
    A_long          progress_base,
    A_long          progress_final,
    PF_EffectWorld  *src,
    const PF_Rect   *area,
    void            *refcon,
    PF_Err          (*pix_fn)(void *refcon, A_long x, A_long y,
                              PF_PixelFloat *in, PF_PixelFloat *out),
    PF_EffectWorld  *dst);
```

**Note:** `iterate_lut` and `iterate_generic` are not available for float suite.

### Iteration Suite Notes

- October 2021 SDK update increased concurrent threads to match available system CPU cores (previously capped at 32)
- Source parameters are read-only during processing as image data may be distributed across CPUs

---

## 10. PF_Sampling8Suite1 - 8-bit Sampling

### Purpose

Provides pixel sampling functions for 8-bit images with nearest-neighbor, subpixel, and area sampling capabilities.

### Suite Name
`kPFSampling8Suite` / `PF_Sampling8Suite1`

### Functions

#### nn_sample
Performs nearest neighbor sampling at a point.

```cpp
PF_Err nn_sample(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_Pixel            *dst_pixel);
```

**Parameters:**
- `effect_ref` - Effect reference
- `x`, `y` - Sample coordinates (fixed-point)
- `params` - Sampling parameter block
- `dst_pixel` - Output pixel

**Returns:** `PF_Err` error code.

---

#### subpixel_sample
Queries alpha-weighted interpolation at non-integral coordinates.

```cpp
PF_Err subpixel_sample(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_Pixel            *dst_pixel);
```

**Parameters:** Same as `nn_sample`

---

#### area_sample
Calculates alpha-weighted average of an axis-aligned rectangle.

```cpp
PF_Err area_sample(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_Pixel            *dst_pixel);
```

**Parameters:** Same as `nn_sample`

**Limitation:** Maximum sample area is 256x256 pixels (radius must be less than 128 pixels).

---

## 11. PF_Sampling16Suite1 - 16-bit Sampling

### Purpose

Same functionality as PF_Sampling8Suite1 for 16-bit images.

### Suite Name
`kPFSampling16Suite` / `PF_Sampling16Suite1`

### Functions

```cpp
PF_Err nn_sample16(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_Pixel16          *dst_pixel);

PF_Err subpixel_sample16(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_Pixel16          *dst_pixel);

PF_Err area_sample16(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_Pixel16          *dst_pixel);
```

---

## 12. PF_SamplingFloatSuite1 - Float Sampling

### Purpose

Same functionality as PF_Sampling8Suite1 for floating-point images.

### Suite Name
`kPFSamplingFloatSuite` / `PF_SamplingFloatSuite1`

### Functions

```cpp
PF_Err nn_sample_float(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_PixelFloat       *dst_pixel);

PF_Err subpixel_sample_float(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_PixelFloat       *dst_pixel);

PF_Err area_sample_float(
    PF_ProgPtr          effect_ref,
    PF_Fixed            x,
    PF_Fixed            y,
    const PF_SampPB     *params,
    PF_PixelFloat       *dst_pixel);
```

---

## 13. PF_BatchSamplingSuite1 - Batch Sampling

### Purpose

Optimizes sampling operations when processing many pixels by reducing per-call overhead.

### Suite Name
`kPFBatchSamplingSuite` / `PF_BatchSamplingSuite1`

### Functions

#### begin_sampling
Prepares After Effects for batch sampling operations.

```cpp
PF_Err (*begin_sampling)(
    PF_ProgPtr      effect_ref,
    PF_Quality      qual,
    PF_ModeFlags    mf,
    PF_SampPB       *params);
```

**Parameters:**
- `effect_ref` - Effect reference
- `qual` - Quality setting
- `mf` - Mode flags
- `params` - Sampling parameter block

**Returns:** `PF_Err` error code.

---

#### end_sampling
Finalizes batch sampling operations.

```cpp
PF_Err (*end_sampling)(
    PF_ProgPtr      effect_ref,
    PF_Quality      qual,
    PF_ModeFlags    mf,
    PF_SampPB       *params);
```

---

#### get_batch_func
Returns an optimized batch sampling function pointer for 8-bit processing.

```cpp
PF_Err (*get_batch_func)(
    PF_ProgPtr              effect_ref,
    PF_Quality              quality,
    PF_ModeFlags            mode_flags,
    const PF_SampPB         *params,
    PF_BatchSampleFunc      *batch);
```

**Parameters:**
- `batch` - Pointer to receive batch function

---

#### get_batch_func16
Returns an optimized batch sampling function pointer for 16-bit processing.

```cpp
PF_Err (*get_batch_func16)(
    PF_ProgPtr              effect_ref,
    PF_Quality              quality,
    PF_ModeFlags            mode_flags,
    const PF_SampPB         *params,
    PF_BatchSample16Func    *batch);
```

---

## 14. PF_ANSICallbacksSuite1 - Math and String Functions

### Purpose

Provides standard mathematical and string manipulation functions through host callbacks.

### Suite Name
`kPFANSICallbacksSuite` / `PF_ANSICallbacksSuite1`

### Mathematical Functions

All trigonometric functions use radians. Use `PF_RAD_PER_DEGREE` to convert from degrees.

#### Trigonometric Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `acos` | `double (*acos)(double x)` | Arc cosine |
| `asin` | `double (*asin)(double x)` | Arc sine |
| `atan` | `double (*atan)(double x)` | Arc tangent |
| `atan2` | `double (*atan2)(double y, double x)` | Two-argument arc tangent |
| `cos` | `double (*cos)(double x)` | Cosine |
| `sin` | `double (*sin)(double x)` | Sine |
| `tan` | `double (*tan)(double x)` | Tangent |

#### Exponential and Logarithmic Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `exp` | `double (*exp)(double x)` | Exponential (e^x) |
| `log` | `double (*log)(double x)` | Natural logarithm |
| `log10` | `double (*log10)(double x)` | Base-10 logarithm |
| `pow` | `double (*pow)(double base, double exp)` | Power function |
| `sqrt` | `double (*sqrt)(double x)` | Square root |

#### Utility Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `ceil` | `double (*ceil)(double x)` | Ceiling |
| `fabs` | `double (*fabs)(double x)` | Absolute value |
| `floor` | `double (*floor)(double x)` | Floor |
| `fmod` | `double (*fmod)(double x, double y)` | Floating-point modulo |
| `hypot` | `double (*hypot)(double x, double y)` | Hypotenuse |

### String Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `sprintf` | `int (*sprintf)(char *str, const char *format, ...)` | Formatted string output |
| `strcpy` | `char* (*strcpy)(char *dest, const char *src)` | String copy |

---

## 15. PF_ColorCallbacksSuite1 - Color Space Conversion

### Purpose

Provides color space conversion between RGB, HLS, and YIQ formats.

### Suite Name
`kPFColorCallbacksSuite` / `PF_ColorCallbacksSuite1`

### Pixel Format Structures

| Format | Structure | Description |
|--------|-----------|-------------|
| 8-bit ARGB | `PF_Pixel8` | Alpha, red, green, blue as unsigned chars |
| 16-bit ARGB | `PF_Pixel16` | Alpha, red, green, blue as unsigned shorts |
| 32-bit ARGB | `PF_PixelFloat`/`PF_Pixel32` | Floating-point values |
| HLS | `PF_HLS_PIXEL[3]` | Fixed-point Hue, Lightness, Saturation |
| YIQ | `PF_YIQ_PIXEL[3]` | Fixed-point luminance and chrominance |

### Functions

#### RGBtoHLS
Converts RGB pixels to HLS format.

```cpp
PF_Err RGBtoHLS(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    PF_HLS_PIXEL    *hls);
```

**Parameters:**
- `effect_ref` - Effect reference
- `rgb` - Input RGB pixel
- `hls` - Output HLS values (scaled 0-1)

---

#### HLStoRGB
Converts HLS pixels to RGB format.

```cpp
PF_Err HLStoRGB(
    PF_ProgPtr      effect_ref,
    PF_HLS_PIXEL    *hls,
    PF_Pixel        *rgb);
```

---

#### RGBtoYIQ
Converts RGB to YIQ color space.

```cpp
PF_Err RGBtoYIQ(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    PF_YIQ_PIXEL    *yiq);
```

**Output Ranges:**
- Y (luminance): 0 to 1
- I (in-phase): approximately +/- 0.5959
- Q (quadrature): approximately +/- 0.5227

---

#### YIQtoRGB
Converts YIQ to RGB color space.

```cpp
PF_Err YIQtoRGB(
    PF_ProgPtr      effect_ref,
    PF_YIQ_PIXEL    *yiq,
    PF_Pixel        *rgb);
```

---

#### Luminance
Extracts luminance component from RGB pixel.

```cpp
PF_Err Luminance(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *lum100);
```

**Returns:** Luminance as 100x the actual value (range 0-25500).

---

#### Hue
Extracts hue component from RGB pixel.

```cpp
PF_Err Hue(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *hue);
```

**Returns:** Hue angle mapped to 0-255 (representing 0-360 degrees).

---

#### Lightness
Extracts lightness component from RGB pixel.

```cpp
PF_Err Lightness(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *lightness);
```

**Returns:** Lightness as 0-255.

---

#### Saturation
Extracts saturation component from RGB pixel.

```cpp
PF_Err Saturation(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *rgb,
    A_long          *saturation);
```

**Returns:** Saturation as 0-255.

### 16-bit and Float Variants

Corresponding suites exist for 16-bit (`PF_ColorCallbacks16Suite1`) and floating-point (`PF_ColorCallbacksFloatSuite1`) with identical function names operating on `PF_Pixel16` and `PF_PixelFloat` types respectively.

---

## 16. PF_AdvTimeSuite4 - Time Formatting

### Purpose

Provides time formatting and display preference functions for proper time representation.

### Suite Name
`kPFAdvTimeSuite` / `PF_AdvTimeSuite4`

### Functions

#### PF_FormatTimeActiveItem
Formats time string for the active item with optional duration units.

```cpp
PF_Err PF_FormatTimeActiveItem(
    PF_ProgPtr      effect_ref,
    A_long          time_value,
    A_u_long        time_scale,
    PF_Boolean      duration,
    A_char          *time_buf);
```

**Parameters:**
- `effect_ref` - Effect reference
- `time_value` - Time numerator
- `time_scale` - Time denominator (samples per second)
- `duration` - TRUE for duration formatting
- `time_buf` - Buffer for formatted string

---

#### PF_FormatTime
Contextualizes time formatting for a specific layer.

```cpp
PF_Err PF_FormatTime(
    PF_ProgPtr      effect_ref,
    PF_EffectWorld  *world,
    A_long          time_value,
    A_u_long        time_scale,
    PF_Boolean      duration,
    A_char          *time_buf);
```

---

#### PF_FormatTimePlus
Allows composition or layer time selection.

```cpp
PF_Err PF_FormatTimePlus(
    PF_ProgPtr      effect_ref,
    PF_EffectWorld  *world,
    A_long          time_value,
    A_u_long        time_scale,
    PF_Boolean      comp_time,
    PF_Boolean      duration,
    A_char          *time_buf);
```

**Parameters:**
- `comp_time` - TRUE for composition time, FALSE for layer time
- (Other parameters same as above)

---

#### PF_GetTimeDisplayPref
Returns frame numbering and display preferences.

```cpp
PF_Err PF_GetTimeDisplayPref(
    PF_ProgPtr          effect_ref,
    PF_TimeDisplayPref  *pref);
```

---

#### PF_TimeCountFrames
Returns frame index for a given time.

```cpp
PF_Err PF_TimeCountFrames(
    PF_ProgPtr      effect_ref,
    A_long          time_value,
    A_u_long        time_scale,
    PF_Boolean      duration,
    A_long          *frame_count);
```

**Note:** Available in After Effects 15.0 and later.

---

## 17. PF_AdvAppSuite2 - Application Control

### Purpose

Provides project management and application-level control functions.

### Suite Name
`kPFAdvAppSuite` / `PF_AdvAppSuite2`

### Project Functions

#### PF_SetProjectDirty
Marks the project as modified.

```cpp
PF_Err PF_SetProjectDirty(PF_ProgPtr effect_ref);
```

---

#### PF_SaveProject
Saves the project to its current path.

```cpp
PF_Err PF_SaveProject(PF_ProgPtr effect_ref);
```

### Window Management Functions

#### PF_SaveBackgroundState / PF_RestoreBackgroundState
Manages window ordering state.

```cpp
PF_Err PF_SaveBackgroundState(PF_ProgPtr effect_ref);
PF_Err PF_RestoreBackgroundState(PF_ProgPtr effect_ref);
```

---

#### PF_ForceForeground
Brings After Effects to the foreground.

```cpp
PF_Err PF_ForceForeground(PF_ProgPtr effect_ref);
```

---

#### PF_RefreshAllWindows
Forces a refresh of all windows.

```cpp
PF_Err PF_RefreshAllWindows(PF_ProgPtr effect_ref);
```

### Info Palette Functions

#### PF_InfoDrawText
Writes text to the info palette.

```cpp
PF_Err PF_InfoDrawText(
    PF_ProgPtr      effect_ref,
    const A_char    *text);
```

---

#### PF_InfoDrawColor
Displays a color swatch in the info palette.

```cpp
PF_Err PF_InfoDrawColor(
    PF_ProgPtr      effect_ref,
    PF_Pixel        color);
```

---

#### PF_InfoDrawText3
Enhanced text drawing with multiple lines.

```cpp
PF_Err PF_InfoDrawText3(
    PF_ProgPtr      effect_ref,
    const A_char    *line1,
    const A_char    *line2,
    const A_char    *line3);
```

---

#### PF_InfoDrawText3Plus
Extended version with more options.

```cpp
PF_Err PF_InfoDrawText3Plus(
    PF_ProgPtr      effect_ref,
    const A_char    *line1,
    const A_char    *line2,
    const A_char    *line3,
    PF_Boolean      should_clear);
```

---

#### PF_AppendInfoText
Appends text to existing info palette content.

```cpp
PF_Err PF_AppendInfoText(
    PF_ProgPtr      effect_ref,
    const A_char    *text);
```

---

## 18. PF_PathQuerySuite1 - Path Access

### Purpose

Identifies and accesses paths (masks, shape layers) associated with an effect's source layer.

### Suite Name
`kPFPathQuerySuite` / `PF_PathQuerySuite1`

### Functions

#### PF_NumPaths
Retrieves the count of paths on the source layer.

```cpp
PF_Err PF_NumPaths(
    PF_ProgPtr      effect_ref,
    A_long          *num_pathsPL);
```

---

#### PF_PathInfo
Obtains the PF_PathID for a specified path index.

```cpp
PF_Err PF_PathInfo(
    PF_ProgPtr      effect_ref,
    A_long          indexL,
    PF_PathID       *unique_idP);
```

---

#### PF_CheckoutPath
Acquires the PF_PathOutlinePtr at a given time.

```cpp
PF_Err PF_CheckoutPath(
    PF_ProgPtr          effect_ref,
    PF_PathID           unique_id,
    A_long              what_time,
    A_long              time_step,
    A_u_long            time_scale,
    PF_PathOutlinePtr   *pathPP);
```

**Parameters:**
- `effect_ref` - Effect reference
- `unique_id` - Path identifier
- `what_time` - Time numerator
- `time_step` - Frame step
- `time_scale` - Time denominator
- `pathPP` - Pointer to receive path data

**Critical:** Every checkout must be balanced by a checkin.

---

#### PF_CheckinPath
Releases the path back to After Effects.

```cpp
PF_Err PF_CheckinPath(
    PF_ProgPtr          effect_ref,
    PF_PathID           unique_id,
    PF_Boolean          changedB,
    PF_PathOutlinePtr   pathP);
```

**Parameters:**
- `changedB` - TRUE if path was modified
- `pathP` - Path to release

**Warning:** Never use path parameter values without first checking out the path. Deleted paths will not be available, and updates occur lazily.

---

## 19. PF_PathDataSuite1 - Path Geometry

### Purpose

Provides detailed information about path geometry and properties.

### Suite Name
`kPFPathDataSuite` / `PF_PathDataSuite1`

### Path Vertex Structure

```cpp
typedef struct {
    PF_FpLong   x;          // Vertex X position
    PF_FpLong   y;          // Vertex Y position
    PF_FpLong   tan_in_x;   // Incoming tangent X
    PF_FpLong   tan_in_y;   // Incoming tangent Y
    PF_FpLong   tan_out_x;  // Outgoing tangent X
    PF_FpLong   tan_out_y;  // Outgoing tangent Y
} PF_PathVertex;
```

All coordinates are in layer coordinate space.

### Query Functions

#### PF_PathIsOpen
Returns TRUE if path endpoints don't connect.

```cpp
PF_Err PF_PathIsOpen(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    PF_Boolean          *openPB);
```

---

#### PF_PathNumSegments
Retrieves segment count.

```cpp
PF_Err PF_PathNumSegments(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    A_long              *num_segmentsPL);
```

**Note:** N segments means valid indices are [0, N-1].

---

#### PF_PathVertexInfo
Retrieves vertex at specified index.

```cpp
PF_Err PF_PathVertexInfo(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    A_long              which_pointL,
    PF_PathVertex       *vertexP);
```

**Note:** Valid index range is [0, num_segments].

---

#### PF_PathIsInverted
Returns TRUE if path is inverted.

```cpp
PF_Err PF_PathIsInverted(
    PF_ProgPtr      effect_ref,
    PF_PathID       unique_id,
    PF_Boolean      *invertedB);
```

---

#### PF_PathGetMaskMode
Retrieves the blending mode.

```cpp
PF_Err PF_PathGetMaskMode(
    PF_ProgPtr      effect_ref,
    PF_PathID       unique_id,
    PF_MaskMode     *modeP);
```

**Mask Modes:** ADD, SUBTRACT, INTERSECT, LIGHTEN, DARKEN, DIFFERENCE, ACCUM, NONE

---

#### PF_PathGetName
Retrieves path name.

```cpp
PF_Err PF_PathGetName(
    PF_ProgPtr      effect_ref,
    PF_PathID       unique_id,
    A_char          *nameZ);
```

**Note:** Maximum length is `PF_MAX_PATH_NAME_LEN` characters.

### Segment Analysis Functions

#### PF_PathPrepareSegLength
Prepares segment for length calculations.

```cpp
PF_Err PF_PathPrepareSegLength(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    A_long              which_segL,
    A_long              frequencyL,
    PF_PathSegPrepPtr   *lengthPrepPP);
```

**Parameters:**
- `frequencyL` - Sampling frequency for length calculation
- `lengthPrepPP` - Receives preparation handle

---

#### PF_PathGetSegLength
Retrieves total length of a segment.

```cpp
PF_Err PF_PathGetSegLength(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    A_long              which_segL,
    PF_PathSegPrepPtr   *lengthPrepP0,
    PF_FpLong           *lengthPF);
```

---

#### PF_PathEvalSegLength
Retrieves coordinates at specified distance along segment.

```cpp
PF_Err PF_PathEvalSegLength(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    PF_PathSegPrepPtr   *lengthPrepPP0,
    A_long              which_segL,
    PF_FpLong           lengthF,
    PF_FpLong           *x,
    PF_FpLong           *y);
```

---

#### PF_PathEvalSegLengthDeriv1
Retrieves coordinates and first derivative at a point.

```cpp
PF_Err PF_PathEvalSegLengthDeriv1(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    PF_PathSegPrepPtr   *lengthPrepPP0,
    A_long              which_segL,
    PF_FpLong           lengthF,
    PF_FpLong           *x,
    PF_FpLong           *y,
    PF_FpLong           *deriv1x,
    PF_FpLong           *deriv1y);
```

---

#### PF_PathCleanupSegLength
Releases segment length preparation resources.

```cpp
PF_Err PF_PathCleanupSegLength(
    PF_ProgPtr          effect_ref0,
    PF_PathOutlinePtr   pathP,
    A_long              which_segL,
    PF_PathSegPrepPtr   *lengthPrepPP);
```

---

## 20. PF_ParamUtilsSuite3 - Parameter Utilities

### Purpose

Provides access to parameter streams, keyframe information, and UI updates without requiring AEGP suite usage.

### Suite Name
`kPFParamUtilsSuite` / `PF_ParamUtilsSuite3`

### Functions

#### PF_UpdateParamUI
Forces refresh of parameter UI in effect controls palette.

```cpp
PF_Err PF_UpdateParamUI(
    PF_ProgPtr          effect_ref,
    PF_ParamIndex       param_index,
    const PF_ParamDef   *defP);
```

**Usage:** Call exclusively during `PF_Cmd_UPDATE_PARAMS_UI`. Do not modify the original parameter. Setting `PF_OutFlag_REFRESH_UI` is not necessary as this function handles it.

---

#### PF_GetCurrentState
Captures parameter state snapshot for caching comparison.

```cpp
PF_Err PF_GetCurrentState(
    PF_ProgPtr          effect_ref,
    PF_ParamIndex       param_index,
    const A_Time        *startPT0,
    const A_Time        *durationPT0,
    PF_State            *stateP);
```

**Note:** Retrieves hash for layer parameter (inputs needed to generate frames, not pixel data).

---

#### PF_AreStatesIdentical
Compares two saved parameter states.

```cpp
PF_Err PF_AreStatesIdentical(
    PF_ProgPtr          effect_ref,
    const PF_State      *state1P,
    const PF_State      *state2P,
    A_boolean           *samePB);
```

---

#### PF_IsIdenticalCheckout
Verifies if parameter value matches at two different times.

```cpp
PF_Err PF_IsIdenticalCheckout(
    PF_ProgPtr      effect_ref,
    PF_ParamIndex   param_index,
    A_long          what_time1,
    A_long          time_step1,
    A_u_long        time_scale1,
    A_long          what_time2,
    A_long          time_step2,
    A_u_long        time_scale2,
    PF_Boolean      *identicalPB);
```

---

#### PF_FindKeyframeTime
Searches for next keyframe in specified direction.

```cpp
PF_Err PF_FindKeyframeTime(
    PF_ProgPtr      effect_ref,
    PF_ParamIndex   param_index,
    A_long          what_time,
    A_u_long        time_scale,
    PF_TimeDir      time_dir,
    PF_Boolean      *foundPB,
    PF_KeyIndex     *key_indexP0,
    A_long          *key_timeP0,
    A_u_long        *key_timescaleP0);
```

**Parameters:**
- `time_dir` - Search direction (PF_TimeDir_FORWARD or PF_TimeDir_BACKWARD)

---

#### PF_GetKeyframeCount
Returns total keyframe count for parameter.

```cpp
PF_Err PF_GetKeyframeCount(
    PF_ProgPtr      effect_ref,
    PF_ParamIndex   param_index,
    PF_KeyIndex     *key_countP);
```

---

#### PF_CheckoutKeyframe
Retrieves keyframe data from database.

```cpp
PF_Err PF_CheckoutKeyframe(
    PF_ProgPtr      effect_ref,
    PF_ParamIndex   param_index,
    PF_KeyIndex     key_index,
    A_long          *key_timeP0,
    A_u_long        *key_timescaleP0,
    PF_ParamDef     *paramP0);
```

---

#### PF_CheckinKeyframe
Balances checkout calls for database integrity.

```cpp
PF_Err PF_CheckinKeyframe(
    PF_ProgPtr      effect_ref,
    PF_ParamDef     *paramP);
```

---

#### PF_KeyIndexToTime
Converts keyframe index to time values.

```cpp
PF_Err PF_KeyIndexToTime(
    PF_ProgPtr      effect_ref,
    PF_ParamIndex   param_index,
    PF_KeyIndex     key_indexP,
    A_long          *key_timeP,
    A_u_long        *key_timescaleP);
```

### Parameter Index Constants

| Constant | Description |
|----------|-------------|
| `PF_ParamIndex_CHECK_ALL` | Evaluate all parameters including layer references |
| `PF_ParamIndex_CHECK_ALL_EXCEPT_LAYER_PARAMS` | Exclude layer parameters |
| `PF_ParamIndex_CHECK_ALL_HONOR_EXCLUDE` | Respect `PF_ParamFlag_EXCLUDE_FROM_HAVE_INPUTS_CHANGED` |

---

## 21. PF_EffectUISuite1 - Effect UI

### Purpose

Controls effect-specific UI elements in the effect controls palette.

### Suite Name
`kPFEffectUISuite` / `PF_EffectUISuite1`

### Functions

#### PF_SetOptionsButtonName
Changes the text on the options button in the effect controls palette.

```cpp
PF_Err PF_SetOptionsButtonName(
    PF_ProgPtr      effect_ref,
    const A_char    *nameZ);
```

**Usage:** Must be called during `PF_Cmd_PARAM_SETUP`. Maximum string length is 31 characters.

---

## 22. PF_EffectCustomUISuite1 - Custom UI Drawing

### Purpose

Provides drawing reference access for custom UI implementation using Drawbot.

### Suite Name
`kPFEffectCustomUISuite` / `PF_EffectCustomUISuite1`

### Functions

#### PF_GetDrawingReference
Retrieves the drawing reference needed for Drawbot operations.

```cpp
PF_Err PF_GetDrawingReference(
    const PF_ContextH   effect_contextH,
    DRAWBOT_DrawRef     *referenceP0);
```

**Usage:** This is the entry point for all Drawbot drawing operations.

**Critical:** Drawing may only occur during `PF_Event_DRAW` (not during `PF_Event_DRAG` or `PF_Event_DO_CLICK`).

### Redraw Strategies

- Call `PF_InvalidateRect` for lazy redraw at the next idle moment
- Set `PF_EO_UPDATE_NOW` event outflag for immediate redraw

### HiDPI Support

Create offscreen images at 2x resolution and scale down using the `Transform` function from `Drawbot_SurfaceSuite`.

---

## 23. PF_AppSuite6 - Application Integration

### Purpose

Provides UI integration capabilities for interacting with After Effects application features.

### Suite Name
`kPFAppSuite` / `PF_AppSuite6`

### Functions

#### PF_AppGetBgColor
Retrieves current application background color.

```cpp
PF_Err PF_AppGetBgColor(
    PF_ProgPtr      effect_ref,
    PF_Pixel        *bg_colorP);
```

---

#### PF_AppGetColor
Retrieves color for specified UI element.

```cpp
PF_Err PF_AppGetColor(
    PF_ProgPtr      effect_ref,
    PF_App_Color    color_selector,
    PF_Pixel        *colorP);
```

---

#### PF_AppGetLanguage
Returns active UI language code.

```cpp
PF_Err PF_AppGetLanguage(
    PF_ProgPtr      effect_ref,
    A_char          *lang_tagZ);
```

**Returns:** Language codes such as en_US, ja_JP, de_DE, etc.

---

#### PF_GetPersonalInfo
Accesses user registration data.

```cpp
PF_Err PF_GetPersonalInfo(
    PF_ProgPtr              effect_ref,
    PF_PersonalInfoType     info_type,
    A_char                  *infoZ);
```

**Info Types:** Name, organization, serial string

---

#### PF_GetFontStyleSheet
Returns After Effects UI font information.

```cpp
PF_Err PF_GetFontStyleSheet(
    PF_ProgPtr          effect_ref,
    PF_FontStyleSheet   *style_sheetP);
```

---

#### PF_SetCursor
Sets cursor from predefined types.

```cpp
PF_Err PF_SetCursor(
    PF_ProgPtr      effect_ref,
    PF_CursorType   cursor);
```

---

#### PF_IsRenderEngine
Indicates if running in render engine or watched folder mode.

```cpp
PF_Err PF_IsRenderEngine(
    PF_ProgPtr      effect_ref,
    PF_Boolean      *is_render_enginePB);
```

---

#### PF_AppColorPickerDialog
Displays the system color picker dialog.

```cpp
PF_Err PF_AppColorPickerDialog(
    PF_ProgPtr      effect_ref,
    const A_char    *dialog_titleZ,
    PF_Pixel        *colorP);
```

**Returns:** `PF_Interrupt_CANCEL` if user cancels.

---

#### PF_GetMouse
Returns mouse position in custom UI coordinates.

```cpp
PF_Err PF_GetMouse(
    PF_ProgPtr      effect_ref,
    PF_Point        *mouse_posP);
```

---

#### PF_InvalidateRect
Queues a redraw of a specific area of the custom UI.

```cpp
PF_Err PF_InvalidateRect(
    PF_ContextH     contextH,
    const PF_Rect   *rectP);
```

---

#### PF_ConvertLocalToGlobal
Converts custom UI coordinates to screen coordinates.

```cpp
PF_Err PF_ConvertLocalToGlobal(
    PF_ContextH     contextH,
    const PF_Point  *local_ptP,
    PF_Point        *global_ptP);
```

---

## 24. PF_AdvItemSuite1 - Item Control

### Purpose

Provides timeline control and item manipulation functions.

### Suite Name
`kPFAdvItemSuite` / `PF_AdvItemSuite1`

### Functions

#### PF_MoveTimeStep
Advances current time by steps.

```cpp
PF_Err PF_MoveTimeStep(
    PF_ProgPtr      effect_ref,
    A_long          steps);
```

---

#### PF_MoveTimeStepActiveItem
Moves active item time.

```cpp
PF_Err PF_MoveTimeStepActiveItem(
    PF_ProgPtr      effect_ref,
    A_long          steps);
```

---

#### PF_TouchActiveItem
Signals that an item requires update.

```cpp
PF_Err PF_TouchActiveItem(
    PF_ProgPtr      effect_ref);
```

---

#### PF_ForceRerender
Forces current frame re-rendering.

```cpp
PF_Err PF_ForceRerender(
    PF_ProgPtr      effect_ref);
```

---

#### PF_EffectIsActiveOrEnabled
Checks effect status.

```cpp
PF_Err PF_EffectIsActiveOrEnabled(
    PF_ProgPtr      effect_ref,
    PF_Boolean      *enabledPB);
```

---

## 25. PF_ChannelSuite1 - Auxiliary Channels

### Purpose

Provides access to auxiliary channels like depth, normals, and object IDs from 3D-rendered footage.

### Suite Name
`kPFChannelSuite` / `PF_ChannelSuite1`

### Functions

#### PF_GetLayerChannelCount
Counts auxiliary channels on a layer.

```cpp
PF_Err PF_GetLayerChannelCount(
    PF_ProgPtr      effect_ref,
    A_long          *num_channelsPL);
```

---

#### PF_GetLayerChannelIndexedRefAndDesc
Retrieves channel by index.

```cpp
PF_Err PF_GetLayerChannelIndexedRefAndDesc(
    PF_ProgPtr              effect_ref,
    A_long                  channel_index,
    PF_Boolean              *foundPB,
    PF_ChannelRef           *channel_refP,
    PF_ChannelDesc          *channel_descP);
```

---

#### PF_GetLayerChannelTypedRefAndDesc
Retrieves channel by type.

```cpp
PF_Err PF_GetLayerChannelTypedRefAndDesc(
    PF_ProgPtr              effect_ref,
    PF_ChannelType          channel_type,
    PF_Boolean              *foundPB,
    PF_ChannelRef           *channel_refP,
    PF_ChannelDesc          *channel_descP);
```

**Channel Types:** DEPTH, NORMALS, OBJECTID, etc.

---

#### PF_CheckoutLayerChannel
Accesses channel data.

```cpp
PF_Err PF_CheckoutLayerChannel(
    PF_ProgPtr              effect_ref,
    PF_ChannelRef           channel_ref,
    A_long                  what_time,
    A_long                  time_step,
    A_u_long                time_scale,
    PF_ChannelCheckoutFlags flags,
    PF_ChannelChunk         *channel_chunkP);
```

---

#### PF_CheckinLayerChannel
Returns channel data.

```cpp
PF_Err PF_CheckinLayerChannel(
    PF_ProgPtr          effect_ref,
    PF_ChannelRef       channel_ref,
    PF_ChannelChunk     *channel_chunkP);
```

---

## Best Practices Summary

### Memory Management
1. Use `PF_HandleSuite1` for significant allocations
2. Always lock handles before access, unlock after
3. Balance all allocations with corresponding disposals

### Image Processing
1. Use appropriate iteration suite for bit depth
2. Ensure pixel functions are re-entrant for multi-threading
3. Do not modify source buffers during iteration
4. Match input and output pixel formats

### Path Operations
1. Always checkout paths before access
2. Balance every checkout with a checkin
3. Never trust path parameter values without explicit checkout

### Parameter Handling
1. Use `PF_UpdateParamUI` only during `PF_Cmd_UPDATE_PARAMS_UI`
2. Balance keyframe checkouts with checkins
3. Use state comparison for caching optimization

### Color Conversion
1. Understand value ranges for each color space
2. Use appropriate bit-depth variant for your data
3. Convert to HLS for intuitive color manipulation

### Threading
1. Assume suites are not thread-safe unless documented
2. Perform UI modifications only on main thread
3. Use `iterate_generic` thread index for abort/progress calls

---

## Related Documentation

- [Effect Basics - PF_InData](https://ae-plugins.docsforadobe.dev/effect-basics/PF_InData/)
- [Graphics Utility Suites](https://ae-plugins.docsforadobe.dev/effect-details/graphics-utility-suites/)
- [Iteration Suites](https://ae-plugins.docsforadobe.dev/effect-details/iteration-suites/)
- [Memory Allocation](https://ae-plugins.docsforadobe.dev/effect-details/memory-allocation/)
- [Working with Paths](https://ae-plugins.docsforadobe.dev/effect-details/working-with-paths/)

---

## Code Examples

### Example 1: Basic Memory Management

```cpp
// Allocate and use a handle
PF_Handle my_handle = NULL;
void *data_ptr = NULL;

// Acquire the handle suite
AEFX_SuiteScoper<PF_HandleSuite1> handle_suite =
    AEFX_SuiteScoper<PF_HandleSuite1>(
        in_data,
        kPFHandleSuite,
        kPFHandleSuiteVersion1,
        out_data);

// Allocate memory
my_handle = handle_suite->host_new_handle(sizeof(MyDataStruct));
if (my_handle) {
    // Lock the handle to get a pointer
    data_ptr = handle_suite->host_lock_handle(my_handle);

    // Use the memory
    MyDataStruct *my_data = (MyDataStruct*)data_ptr;
    my_data->value = 42;

    // Unlock when done
    handle_suite->host_unlock_handle(my_handle);

    // Dispose when no longer needed
    handle_suite->host_dispose_handle(my_handle);
    my_handle = NULL;
}
```

### Example 2: Pixel Iteration with 8-bit Processing

```cpp
// Per-pixel callback function - must be re-entrant
static PF_Err InvertPixel(
    void        *refcon,
    A_long      x,
    A_long      y,
    PF_Pixel    *in,
    PF_Pixel    *out)
{
    PF_Err err = PF_Err_NONE;

    // Invert RGB channels, preserve alpha
    out->alpha = in->alpha;
    out->red   = PF_MAX_CHAN8 - in->red;
    out->green = PF_MAX_CHAN8 - in->green;
    out->blue  = PF_MAX_CHAN8 - in->blue;

    return err;
}

// In your render function
PF_Err ProcessImage(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_EffectWorld  *input,
    PF_EffectWorld  *output)
{
    PF_Err err = PF_Err_NONE;

    AEFX_SuiteScoper<PF_Iterate8Suite1> iterate_suite =
        AEFX_SuiteScoper<PF_Iterate8Suite1>(
            in_data,
            kPFIterate8Suite,
            kPFIterate8SuiteVersion1,
            out_data);

    err = iterate_suite->iterate(
        in_data,
        0,                  // progress_base
        output->height,     // progress_final
        input,              // source
        NULL,               // area (NULL = entire image)
        NULL,               // refcon
        InvertPixel,        // pixel function
        output);            // destination

    return err;
}
```

### Example 3: Sampling with Subpixel Precision

```cpp
PF_Err SampleAtPoint(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_EffectWorld  *input,
    PF_Fixed        x,
    PF_Fixed        y,
    PF_Pixel        *result)
{
    PF_Err err = PF_Err_NONE;

    AEFX_SuiteScoper<PF_Sampling8Suite1> sampling_suite =
        AEFX_SuiteScoper<PF_Sampling8Suite1>(
            in_data,
            kPFSampling8Suite,
            kPFSampling8SuiteVersion1,
            out_data);

    // Set up sampling parameters
    PF_SampPB samp_pb;
    AEFX_CLR_STRUCT(samp_pb);
    samp_pb.src = input;
    samp_pb.x_radius = INT2FIX(1);
    samp_pb.y_radius = INT2FIX(1);

    // Perform subpixel sampling
    err = sampling_suite->subpixel_sample(
        in_data->effect_ref,
        x,
        y,
        &samp_pb,
        result);

    return err;
}
```

### Example 4: Color Space Conversion

```cpp
PF_Err AdjustHue(
    PF_InData   *in_data,
    PF_OutData  *out_data,
    PF_Pixel    *pixel,
    A_long      hue_shift)
{
    PF_Err err = PF_Err_NONE;
    PF_HLS_PIXEL hls;

    AEFX_SuiteScoper<PF_ColorCallbacksSuite1> color_suite =
        AEFX_SuiteScoper<PF_ColorCallbacksSuite1>(
            in_data,
            kPFColorCallbacksSuite,
            kPFColorCallbacksSuiteVersion1,
            out_data);

    // Convert RGB to HLS
    err = color_suite->RGBtoHLS(
        in_data->effect_ref,
        pixel,
        &hls);

    if (!err) {
        // Adjust hue (values are 0-1 in fixed-point)
        hls[0] += hue_shift;
        if (hls[0] > FIX_1) hls[0] -= FIX_1;
        if (hls[0] < 0) hls[0] += FIX_1;

        // Convert back to RGB
        err = color_suite->HLStoRGB(
            in_data->effect_ref,
            &hls,
            pixel);
    }

    return err;
}
```

### Example 5: Path Data Access

```cpp
PF_Err ProcessPath(
    PF_InData   *in_data,
    PF_OutData  *out_data,
    A_long      path_index)
{
    PF_Err err = PF_Err_NONE;
    PF_PathID path_id;
    PF_PathOutlinePtr path_ptr = NULL;
    A_long num_segments = 0;

    AEFX_SuiteScoper<PF_PathQuerySuite1> query_suite =
        AEFX_SuiteScoper<PF_PathQuerySuite1>(
            in_data,
            kPFPathQuerySuite,
            kPFPathQuerySuiteVersion1,
            out_data);

    AEFX_SuiteScoper<PF_PathDataSuite1> data_suite =
        AEFX_SuiteScoper<PF_PathDataSuite1>(
            in_data,
            kPFPathDataSuite,
            kPFPathDataSuiteVersion1,
            out_data);

    // Get path ID
    err = query_suite->PF_PathInfo(
        in_data->effect_ref,
        path_index,
        &path_id);

    if (!err) {
        // Checkout the path at current time
        err = query_suite->PF_CheckoutPath(
            in_data->effect_ref,
            path_id,
            in_data->current_time,
            in_data->time_step,
            in_data->time_scale,
            &path_ptr);
    }

    if (!err && path_ptr) {
        // Get number of segments
        err = data_suite->PF_PathNumSegments(
            in_data->effect_ref,
            path_ptr,
            &num_segments);

        // Process each vertex
        for (A_long i = 0; i <= num_segments && !err; i++) {
            PF_PathVertex vertex;
            err = data_suite->PF_PathVertexInfo(
                in_data->effect_ref,
                path_ptr,
                i,
                &vertex);

            if (!err) {
                // Use vertex data (x, y, tangents)
                // vertex.x, vertex.y
                // vertex.tan_in_x, vertex.tan_in_y
                // vertex.tan_out_x, vertex.tan_out_y
            }
        }

        // Always check in the path
        query_suite->PF_CheckinPath(
            in_data->effect_ref,
            path_id,
            FALSE,  // not changed
            path_ptr);
    }

    return err;
}
```

### Example 6: Creating Temporary Worlds

```cpp
PF_Err CreateTempBuffer(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    A_long          width,
    A_long          height,
    PF_EffectWorld  **temp_worldPP)
{
    PF_Err err = PF_Err_NONE;

    AEFX_SuiteScoper<PF_WorldSuite2> world_suite =
        AEFX_SuiteScoper<PF_WorldSuite2>(
            in_data,
            kPFWorldSuite,
            kPFWorldSuiteVersion2,
            out_data);

    // Create world matching input bit depth
    PF_PixelFormat pixel_format;
    err = world_suite->PF_GetPixelFormat(
        &in_data->input->world,
        &pixel_format);

    if (!err) {
        *temp_worldPP = NULL;
        err = world_suite->PF_NewWorld(
            in_data->effect_ref,
            width,
            height,
            TRUE,           // clear pixels
            pixel_format,
            *temp_worldPP);
    }

    return err;
}

PF_Err DisposeTempBuffer(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_EffectWorld  *temp_worldP)
{
    PF_Err err = PF_Err_NONE;

    if (temp_worldP) {
        AEFX_SuiteScoper<PF_WorldSuite2> world_suite =
            AEFX_SuiteScoper<PF_WorldSuite2>(
                in_data,
                kPFWorldSuite,
                kPFWorldSuiteVersion2,
                out_data);

        err = world_suite->PF_DisposeWorld(
            in_data->effect_ref,
            temp_worldP);
    }

    return err;
}
```

---

## Common Error Codes

| Error Code | Description |
|------------|-------------|
| `PF_Err_NONE` | Success |
| `PF_Err_OUT_OF_MEMORY` | Memory allocation failed |
| `PF_Err_INTERNAL_STRUCT_DAMAGED` | Internal data corruption |
| `PF_Err_INVALID_INDEX` | Index out of range |
| `PF_Err_UNRECOGNIZED_PARAM_TYPE` | Unknown parameter type |
| `PF_Err_INVALID_CALLBACK` | Invalid callback function |
| `PF_Err_BAD_CALLBACK_PARAM` | Bad callback parameter |
| `A_Err_MISSING_SUITE` | Requested suite not available |

---

## Suite Version History

| Suite | Current Version | Notes |
|-------|-----------------|-------|
| PF_HandleSuite | 1 | Stable since initial release |
| PF_WorldSuite | 2 | Version 2 added pixel format support |
| PF_PixelFormatSuite | 2 | SmartFX support |
| PF_PixelDataSuite | 1 | Stable |
| PF_WorldTransformSuite | 1 | Stable |
| PF_FillMatteSuite | 2 | Added premultiply_color variants |
| PF_Iterate8Suite | 1 | Thread count increased Oct 2021 |
| PF_Iterate16Suite | 1 | Thread count increased Oct 2021 |
| PF_IterateFloatSuite | 1 | Thread count increased Oct 2021 |
| PF_Sampling8Suite | 1 | Stable |
| PF_Sampling16Suite | 1 | Stable |
| PF_SamplingFloatSuite | 1 | Stable |
| PF_BatchSamplingSuite | 1 | Stable |
| PF_ANSICallbacksSuite | 1 | Stable |
| PF_ColorCallbacksSuite | 1 | Stable |
| PF_AdvTimeSuite | 4 | TimeCountFrames added in AE 15.0 |
| PF_AdvAppSuite | 2 | Stable |
| PF_PathQuerySuite | 1 | Stable |
| PF_PathDataSuite | 1 | Stable |
| PF_ParamUtilsSuite | 3 | Stable |
| PF_EffectUISuite | 1 | Stable |
| PF_EffectCustomUISuite | 1 | Drawbot integration |
| PF_AppSuite | 6 | Multiple versions available |
| PF_AdvItemSuite | 1 | Stable |
| PF_ChannelSuite | 1 | 3D channel support |

---

## Glossary

| Term | Definition |
|------|------------|
| **PF_EffectWorld** | The fundamental image buffer structure containing pixel data |
| **PF_Handle** | A relocatable memory block managed by the host |
| **PF_ProgPtr** | Effect reference pointer used to identify the plug-in instance |
| **PF_Fixed** | 16.16 fixed-point number format |
| **PF_FpLong** | Double-precision floating-point value |
| **ARGB** | Alpha, Red, Green, Blue channel order |
| **HLS** | Hue, Lightness, Saturation color space |
| **YIQ** | Luminance, In-phase, Quadrature color space (NTSC) |
| **SmartFX** | Modern effect architecture with pre-render/render separation |
| **Drawbot** | Vector drawing API for custom UI elements |
| **Suite** | Collection of related functions provided by the host |
| **Checkout/Checkin** | Resource borrowing pattern for paths and parameters |

---

## Related Documentation

- [Effect Basics - PF_InData](https://ae-plugins.docsforadobe.dev/effect-basics/PF_InData/)
- [Graphics Utility Suites](https://ae-plugins.docsforadobe.dev/effect-details/graphics-utility-suites/)
- [Iteration Suites](https://ae-plugins.docsforadobe.dev/effect-details/iteration-suites/)
- [Memory Allocation](https://ae-plugins.docsforadobe.dev/effect-details/memory-allocation/)
- [Working with Paths](https://ae-plugins.docsforadobe.dev/effect-details/working-with-paths/)

---

*Document generated from Adobe After Effects SDK documentation. Last updated: December 2025.*
