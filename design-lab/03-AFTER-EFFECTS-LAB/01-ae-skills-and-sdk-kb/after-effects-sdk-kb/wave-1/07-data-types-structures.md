---
source: '[unknown - 07-data-types-structures.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Adobe After Effects SDK: Data Types and Structures

## Overview

The After Effects SDK provides a comprehensive type system for plugin development, encompassing fundamental numeric types, complex structures for image manipulation, parameter handling, and inter-plugin communication. This documentation covers the complete hierarchy of data types from primitive numerics to sophisticated opaque handles.

Understanding these data types is essential for developing stable, high-performance plugins that integrate seamlessly with After Effects' rendering pipeline and memory management systems.

---

## Table of Contents

1. [Fundamental Numeric Types](#fundamental-numeric-types)
2. [Spatial Types: Points and Rectangles](#spatial-types-points-and-rectangles)
3. [Matrix Types](#matrix-types)
4. [Time and Ratio Types](#time-and-ratio-types)
5. [Pixel Structures and Color Types](#pixel-structures-and-color-types)
6. [PF_EffectWorld: Image Buffer Structure](#pf_effectworld-image-buffer-structure)
7. [Parameter System Types](#parameter-system-types)
8. [Interface Structures: PF_InData and PF_OutData](#interface-structures-pf_indata-and-pf_outdata)
9. [Command Selectors: PF_Cmd](#command-selectors-pf_cmd)
10. [Error Codes: PF_Err](#error-codes-pf_err)
11. [Output Flags: PF_OutFlags and PF_OutFlags2](#output-flags-pf_outflags-and-pf_outflags2)
12. [Quality and Field Enumerations](#quality-and-field-enumerations)
13. [Handle Types](#handle-types)
14. [AEGP Handle Types](#aegp-handle-types)
15. [SmartFX Data Structures](#smartfx-data-structures)
16. [Memory Safety and Best Practices](#memory-safety-and-best-practices)

---

## Fundamental Numeric Types

After Effects defines platform-independent numeric types to ensure consistent behavior across operating systems and architectures.

### Integer Types

```c
// Signed types
typedef char           A_char;      // 8-bit signed character
typedef short          A_short;     // 16-bit signed integer
typedef long           A_long;      // 32-bit signed integer

// Unsigned types
typedef unsigned char  A_u_char;    // 8-bit unsigned integer
typedef unsigned short A_u_short;   // 16-bit unsigned integer
typedef unsigned long  A_u_long;    // 32-bit unsigned integer
```

### Floating-Point Types

```c
typedef float          A_FpShort;   // 32-bit IEEE floating-point
typedef double         A_FpLong;    // 64-bit IEEE double-precision floating-point
```

### Type Ranges and Usage

| Type | Size | Range | Typical Usage |
|------|------|-------|---------------|
| `A_char` | 8 bits | -128 to 127 | Character data, small signed values |
| `A_u_char` | 8 bits | 0 to 255 | 8-bit pixel channels |
| `A_short` | 16 bits | -32,768 to 32,767 | UI dimensions, small coordinates |
| `A_u_short` | 16 bits | 0 to 65,535 | 16-bit pixel channels |
| `A_long` | 32 bits | -2^31 to 2^31-1 | Parameter IDs, general integers |
| `A_u_long` | 32 bits | 0 to 2^32-1 | Flags, unsigned quantities |
| `A_FpShort` | 32 bits | IEEE float | Quick floating-point calculations |
| `A_FpLong` | 64 bits | IEEE double | High-precision coordinates, angles |

### Example: Using Fundamental Types

```c
// Parameter ID assignment
A_long param_id = 1;

// Pixel channel manipulation
A_u_char alpha = 255;
A_u_char red = 128;

// High-precision angle calculation
A_FpLong angle_radians = 3.14159265358979;

// Floating-point color value
A_FpShort intensity = 0.75f;
```

---

## Spatial Types: Points and Rectangles

### Point Structures

After Effects provides both integer and floating-point point types for different precision requirements.

#### A_LongPoint (Integer Point)

```c
typedef struct {
    A_long  x;
    A_long  y;
} A_LongPoint;
```

**Usage:** Pixel coordinates, screen positions, integer-based UI coordinates.

#### A_FloatPoint (2D Floating-Point Point)

```c
typedef struct {
    A_FpLong  x;
    A_FpLong  y;
} A_FloatPoint;
```

**Usage:** Subpixel coordinates, effect control points, layer positions.

#### A_FloatPoint3 (3D Floating-Point Point)

```c
typedef struct {
    A_FpLong  x;
    A_FpLong  y;
    A_FpLong  z;
} A_FloatPoint3;
```

**Usage:** 3D layer positions, camera coordinates, 3D effect parameters.

### Rectangle Structures

#### A_LongRect (Integer Rectangle)

```c
typedef struct {
    A_long  left;
    A_long  top;
    A_long  right;
    A_long  bottom;
} A_LongRect;
```

**Usage:** Pixel bounds, clipping regions, extent hints.

#### A_FloatRect (Floating-Point Rectangle)

```c
typedef struct {
    A_FpLong  left;
    A_FpLong  top;
    A_FpLong  right;
    A_FpLong  bottom;
} A_FloatRect;
```

**Usage:** Subpixel bounds, mask paths, precise region definitions.

#### A_Rect (Legacy Rectangle)

```c
typedef struct {
    A_short  top;
    A_short  left;
    A_short  bottom;
    A_short  right;
} A_Rect;
```

**Note:** Order differs from `A_LongRect`! The `A_Rect` type uses (top, left, bottom, right) ordering.

### Example: Rectangle Operations

```c
// Define a processing region
A_LongRect extent;
extent.left = 0;
extent.top = 0;
extent.right = 1920;
extent.bottom = 1080;

// Calculate rectangle dimensions
A_long width = extent.right - extent.left;
A_long height = extent.bottom - extent.top;

// Check if point is within rectangle
A_LongPoint pt = {100, 200};
A_Boolean inside = (pt.x >= extent.left && pt.x < extent.right &&
                    pt.y >= extent.top && pt.y < extent.bottom);
```

---

## Matrix Types

### A_Matrix3 (3x3 Transformation Matrix)

```c
typedef struct {
    A_FpLong  mat[3][3];
} A_Matrix3;
```

The 3x3 matrix is used for 2D transformations including translation, rotation, scaling, and shearing.

**Matrix Layout:**
```
| mat[0][0]  mat[0][1]  mat[0][2] |   | scaleX  shearX  translateX |
| mat[1][0]  mat[1][1]  mat[1][2] | = | shearY  scaleY  translateY |
| mat[2][0]  mat[2][1]  mat[2][2] |   | 0       0       1          |
```

### A_Matrix4 (4x4 Transformation Matrix)

```c
typedef struct {
    A_FpLong  mat[4][4];
} A_Matrix4;
```

The 4x4 matrix handles full 3D transformations including perspective projection.

**Matrix Layout:**
```
| mat[0][0]  mat[0][1]  mat[0][2]  mat[0][3] |
| mat[1][0]  mat[1][1]  mat[1][2]  mat[1][3] |
| mat[2][0]  mat[2][1]  mat[2][2]  mat[2][3] |
| mat[3][0]  mat[3][1]  mat[3][2]  mat[3][3] |
```

### Example: Identity Matrix Initialization

```c
// Initialize 3x3 identity matrix
A_Matrix3 identity3;
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        identity3.mat[i][j] = (i == j) ? 1.0 : 0.0;
    }
}

// Initialize 4x4 identity matrix
A_Matrix4 identity4;
for (int i = 0; i < 4; i++) {
    for (int j = 0; j < 4; j++) {
        identity4.mat[i][j] = (i == j) ? 1.0 : 0.0;
    }
}
```

---

## Time and Ratio Types

### A_Time

```c
typedef struct {
    A_long  value;
    A_u_long scale;
} A_Time;
```

`A_Time` represents time as a rational number where `value / scale` gives the time in seconds.

**Key Points:**
- The `scale` is typically the composition's frame rate times a multiplier
- Common scale values: 2997 (29.97 fps), 2400 (24 fps), 3000 (30 fps)
- Supports sub-frame precision for motion blur and time remapping

### A_Ratio

```c
typedef struct {
    A_long  num;    // Numerator
    A_u_long den;   // Denominator
} A_Ratio;
```

`A_Ratio` represents fractional values, commonly used for pixel aspect ratios and downsample factors.

### PF_Rational (Alternative Ratio Type)

```c
typedef struct {
    A_long  num;
    A_u_long den;
} PF_Rational;
```

Functionally equivalent to `A_Ratio`, used specifically in effect contexts.

### Example: Time Calculations

```c
// Convert A_Time to seconds
A_Time current_time;
current_time.value = 150;
current_time.scale = 3000;  // 30 fps composition

double time_in_seconds = (double)current_time.value / (double)current_time.scale;
// Result: 0.05 seconds (frame 1.5 at 30 fps)

// Calculate frame number
double frame_number = time_in_seconds * 30.0;  // 1.5

// Pixel aspect ratio example
A_Ratio par;
par.num = 10;
par.den = 11;  // D1 NTSC pixel aspect ratio
double aspect = (double)par.num / (double)par.den;  // ~0.909
```

---

## Pixel Structures and Color Types

After Effects supports three primary bit depths, each with its own pixel structure.

### PF_Pixel8 (8-bit ARGB)

```c
typedef struct {
    A_u_char  alpha;
    A_u_char  red;
    A_u_char  green;
    A_u_char  blue;
} PF_Pixel8, PF_Pixel, PF_UnionablePixel;
```

**Value Range:** 0-255 per channel
**Memory Layout:** ARGB (Alpha first, then Red, Green, Blue)
**Size:** 4 bytes per pixel

### PF_Pixel16 (16-bit ARGB)

```c
typedef struct {
    A_u_short  alpha;
    A_u_short  red;
    A_u_short  green;
    A_u_short  blue;
} PF_Pixel16;
```

**Value Range:** 0-32768 per channel (NOT 0-65535!)
**Memory Layout:** ARGB
**Size:** 8 bytes per pixel

**Important:** The maximum value is 32768, not 65535. This allows for over-range values during intermediate calculations.

### PF_PixelFloat / PF_Pixel32 (32-bit Floating-Point ARGB)

```c
typedef struct {
    PF_FpShort  alpha;
    PF_FpShort  red;
    PF_FpShort  green;
    PF_FpShort  blue;
} PF_PixelFloat, PF_Pixel32;
```

**Value Range:** Typically 0.0-1.0, but supports over-range (HDR)
**Memory Layout:** ARGB (as 32-bit floats)
**Size:** 16 bytes per pixel

### A_Color (Normalized Color)

```c
typedef struct {
    A_FpLong  alpha;
    A_FpLong  red;
    A_FpLong  green;
    A_FpLong  blue;
} A_Color;
```

**Usage:** High-precision color operations, color parameters, double-precision color math.

### Alternative Color Formats

```c
// HLS (Hue, Lightness, Saturation)
typedef A_FpShort PF_HLS_PIXEL[3];

// YIQ (Luminance, In-phase, Quadrature)
typedef A_FpShort PF_YIQ_PIXEL[3];
```

### Example: Pixel Manipulation

```c
// 8-bit pixel: Set to semi-transparent red
PF_Pixel8 pixel8;
pixel8.alpha = 128;
pixel8.red = 255;
pixel8.green = 0;
pixel8.blue = 0;

// 16-bit pixel: Full white
PF_Pixel16 pixel16;
pixel16.alpha = 32768;  // Note: Max is 32768, not 65535
pixel16.red = 32768;
pixel16.green = 32768;
pixel16.blue = 32768;

// 32-bit floating-point: Over-bright cyan (HDR)
PF_PixelFloat pixelF;
pixelF.alpha = 1.0f;
pixelF.red = 0.0f;
pixelF.green = 1.5f;   // Over-range for HDR
pixelF.blue = 2.0f;    // Over-range for HDR

// Convert 8-bit to 16-bit
PF_Pixel16 converted;
converted.alpha = (A_u_short)(pixel8.alpha * 32768 / 255);
converted.red = (A_u_short)(pixel8.red * 32768 / 255);
converted.green = (A_u_short)(pixel8.green * 32768 / 255);
converted.blue = (A_u_short)(pixel8.blue * 32768 / 255);
```

---

## PF_EffectWorld: Image Buffer Structure

`PF_EffectWorld` (also known as `PF_LayerDef` and `PF_World`) is the fundamental structure for representing image data in After Effects.

### Structure Definition

```c
typedef struct PF_EffectWorld {
    PF_WorldFlags   world_flags;    // Bit depth and permissions
    PF_PixelPtr     data;           // Pointer to pixel data
    A_long          rowbytes;       // Bytes per scanline
    A_long          width;          // Buffer width in pixels
    A_long          height;         // Buffer height in pixels
    A_Rect          extent_hint;    // Opaque pixel bounds
    void*           platform_ref;   // Platform-specific (deprecated)
    A_long          pix_aspect_ratio; // Pixel aspect ratio
    PF_LayerDefault dephault;       // Default layer parameter value
} PF_EffectWorld, PF_LayerDef, PF_World;
```

### PF_WorldFlags

```c
typedef enum {
    PF_WorldFlag_DEEP        = 0x01,  // 16-bit per channel
    PF_WorldFlag_WRITEABLE   = 0x02   // Buffer can be modified
} PF_WorldFlags;
```

**Note:** For 32-bit float detection, use `PF_GET_PIXEL_DATA16` and check for NULL return.

### PF_LayerDefault

```c
typedef enum {
    PF_LayerDefault_NONE   = -1,  // No default layer
    PF_LayerDefault_MYSELF = -2   // Use effect's own layer
} PF_LayerDefault;
```

### Critical Memory Layout Rules

**1. NEVER assume 16-byte alignment:**
> "The pixels in a `PF_EffectWorld` are not guaranteed to be 16-byte aligned."

Subregions may have unexpected alignment, breaking SIMD optimizations that assume alignment.

**2. ALWAYS use rowbytes for scanline traversal:**
> "Don't assume that you can get to the next scanline...use the PF_EffectWorld's `rowbytes` instead."

The rowbytes value includes padding and varies between buffers. Never calculate stride from width.

**3. NEVER write outside indicated regions:**
Writing outside the valid area corrupts cached buffers and causes undefined behavior.

### Pixel Access Macros

```c
// Get 8-bit pixel pointer
PF_Pixel8* pixel8P = NULL;
PF_Err err = PF_GET_PIXEL_DATA8(worldP, NULL, &pixel8P);
if (!err && pixel8P) {
    // Process 8-bit pixels
}

// Get 16-bit pixel pointer
PF_Pixel16* pixel16P = NULL;
err = PF_GET_PIXEL_DATA16(worldP, NULL, &pixel16P);
if (!err && pixel16P) {
    // Process 16-bit pixels
}
```

### Example: Safe Pixel Iteration

```c
static PF_Err ProcessWorld(
    PF_EffectWorld* input,
    PF_EffectWorld* output)
{
    PF_Err err = PF_Err_NONE;

    // Check bit depth
    A_Boolean is_deep = (input->world_flags & PF_WorldFlag_DEEP) != 0;

    if (is_deep) {
        // 16-bit processing
        PF_Pixel16* in_baseP = NULL;
        PF_Pixel16* out_baseP = NULL;

        ERR(PF_GET_PIXEL_DATA16(input, NULL, &in_baseP));
        ERR(PF_GET_PIXEL_DATA16(output, NULL, &out_baseP));

        if (!err && in_baseP && out_baseP) {
            for (A_long y = 0; y < input->height; y++) {
                // Calculate scanline pointers using rowbytes
                PF_Pixel16* in_rowP = (PF_Pixel16*)((char*)in_baseP +
                                       y * input->rowbytes);
                PF_Pixel16* out_rowP = (PF_Pixel16*)((char*)out_baseP +
                                        y * output->rowbytes);

                for (A_long x = 0; x < input->width; x++) {
                    // Process each pixel
                    out_rowP[x].alpha = in_rowP[x].alpha;
                    out_rowP[x].red = in_rowP[x].red;
                    out_rowP[x].green = in_rowP[x].green;
                    out_rowP[x].blue = in_rowP[x].blue;
                }
            }
        }
    } else {
        // 8-bit processing
        PF_Pixel8* in_baseP = NULL;
        PF_Pixel8* out_baseP = NULL;

        ERR(PF_GET_PIXEL_DATA8(input, NULL, &in_baseP));
        ERR(PF_GET_PIXEL_DATA8(output, NULL, &out_baseP));

        if (!err && in_baseP && out_baseP) {
            for (A_long y = 0; y < input->height; y++) {
                PF_Pixel8* in_rowP = (PF_Pixel8*)((char*)in_baseP +
                                      y * input->rowbytes);
                PF_Pixel8* out_rowP = (PF_Pixel8*)((char*)out_baseP +
                                       y * output->rowbytes);

                for (A_long x = 0; x < input->width; x++) {
                    out_rowP[x] = in_rowP[x];
                }
            }
        }
    }

    return err;
}
```

### GPU Rendering Note

During `PF_Cmd_SMART_RENDER_GPU`, all `PF_LayerDef` fields are populated normally **except** `data`, which remains NULL. GPU rendering uses separate texture handles.

---

## Parameter System Types

### PF_ParamDef Structure

```c
typedef struct {
    A_long          id;             // Unique parameter identifier
    PF_ChangeFlags  change_flags;   // Modification indicators
    PF_ParamUIFlags ui_flags;       // UI behavior flags
    A_short         ui_width;       // Custom UI width
    A_short         ui_height;      // Custom UI height
    PF_ParamType    param_type;     // Parameter category
    A_char          name[32];       // Display name (31 chars max)
    PF_ParamFlags   flags;          // Behavior flags
    PF_ParamDefUnion u;             // Type-specific data union
} PF_ParamDef;
```

### PF_ParamType Enumeration

```c
typedef enum {
    PF_Param_RESERVED       = -1,
    PF_Param_LAYER          = 0,    // Layer reference
    PF_Param_SLIDER         = 2,    // Fixed-point slider
    PF_Param_FIX_SLIDER     = 3,    // Fixed-point slider (alias)
    PF_Param_ANGLE          = 4,    // Angle in degrees
    PF_Param_CHECKBOX       = 5,    // Boolean toggle
    PF_Param_COLOR          = 6,    // RGB color picker
    PF_Param_POINT          = 7,    // 2D point
    PF_Param_POPUP          = 8,    // Dropdown menu
    PF_Param_CUSTOM         = 9,    // Custom data type
    PF_Param_NO_DATA        = 10,   // Topic separator
    PF_Param_FLOAT_SLIDER   = 11,   // Floating-point slider
    PF_Param_ARBITRARY_DATA = 12,   // Custom structured data
    PF_Param_PATH           = 13,   // Mask path reference
    PF_Param_GROUP_START    = 14,   // Parameter group begin
    PF_Param_GROUP_END      = 15,   // Parameter group end
    PF_Param_BUTTON         = 16,   // Push button
    PF_Param_POINT_3D       = 17    // 3D point (CS5.5+)
} PF_ParamType;
```

### PF_ParamFlags

```c
typedef enum {
    PF_ParamFlag_NONE               = 0,
    PF_ParamFlag_CANNOT_TIME_VARY   = 1 << 0,   // No keyframes
    PF_ParamFlag_CANNOT_INTERP      = 1 << 1,   // No interpolation
    PF_ParamFlag_RESERVED_1         = 1 << 2,
    PF_ParamFlag_RESERVED_2         = 1 << 3,
    PF_ParamFlag_SUPERVISE          = 1 << 4,   // Receive change messages
    PF_ParamFlag_START_COLLAPSED    = 1 << 5,   // Start twirled closed
    PF_ParamFlag_USE_VALUE_FOR_OLD  = 1 << 6,   // Legacy project compat
    PF_ParamFlag_LAYER_PARAM_IS_TRACKMATTE = 1 << 7,
    PF_ParamFlag_EXCLUDE_FROM_HAVE_INPUTS  = 1 << 8,
    PF_ParamFlag_SKIP_REVEAL_WHEN_UNHIDDEN = 1 << 9
} PF_ParamFlags;
```

### PF_ParamUIFlags

```c
typedef enum {
    PF_PUI_NONE             = 0,
    PF_PUI_TOPIC            = 1 << 0,   // Custom UI topic
    PF_PUI_CONTROL          = 1 << 1,   // Custom UI control
    PF_PUI_STD_CONTROL_ONLY = 1 << 2,   // No keyframe stream
    PF_PUI_NO_ECW_UI        = 1 << 3,   // Hide from Effect Controls
    PF_PUI_ECW_SEPARATOR    = 1 << 4,   // Add separator line
    PF_PUI_DISABLED         = 1 << 5,   // Gray out parameter
    PF_PUI_DONT_ERASE_TOPIC = 1 << 6,
    PF_PUI_DONT_ERASE_CONTROL = 1 << 7,
    PF_PUI_RADIO_BUTTON     = 1 << 8,   // Popup as radio buttons
    PF_PUI_INVISIBLE        = 1 << 9    // Hidden parameter (CS6+)
} PF_ParamUIFlags;
```

### PF_ParamDefUnion

The union contains type-specific parameter data:

```c
typedef union {
    PF_LayerDef     ld;         // Layer parameter
    PF_SliderDef    sd;         // Slider parameter
    PF_FixedSliderDef fd;       // Fixed-point slider
    PF_AngleDef     ad;         // Angle parameter
    PF_CheckBoxDef  bd;         // Checkbox parameter
    PF_ColorDef     cd;         // Color parameter
    PF_PointDef     td;         // 2D point parameter
    PF_PopupDef     pd;         // Popup menu parameter
    PF_FloatSliderDef fs;       // Float slider parameter
    PF_ArbitraryDef arb;        // Arbitrary data parameter
    PF_PathDef      path;       // Path parameter
    PF_ButtonDef    button;     // Button parameter
    PF_Point3DDef   point3d;    // 3D point parameter
} PF_ParamDefUnion;
```

### Example: Parameter Registration

```c
static PF_Err ParamsSetup(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    PF_Err err = PF_Err_NONE;
    PF_ParamDef def;

    // Clear the parameter definition
    AEFX_CLR_STRUCT(def);

    // Add a float slider
    PF_ADD_FLOAT_SLIDER(
        "Intensity",           // Name
        0.0,                   // Valid min
        100.0,                 // Valid max
        0.0,                   // Slider min
        100.0,                 // Slider max
        0.0,                   // Curve tolerance
        50.0,                  // Default value
        PF_Precision_HUNDREDTHS, // Display precision
        0,                     // Display flags
        0,                     // Flags
        INTENSITY_DISK_ID      // Parameter ID
    );

    // Add a color picker
    AEFX_CLR_STRUCT(def);
    def.param_type = PF_Param_COLOR;
    PF_STRCPY(def.name, "Tint Color");
    def.u.cd.value.red = 255;
    def.u.cd.value.green = 0;
    def.u.cd.value.blue = 0;
    def.u.cd.dephault = def.u.cd.value;

    ERR(PF_ADD_PARAM(in_data, -1, &def));

    out_data->num_params = PARAM_COUNT;

    return err;
}
```

---

## Interface Structures: PF_InData and PF_OutData

### PF_InData Structure

`PF_InData` is the primary structure through which After Effects communicates context to plugins.

#### Callback and Reference Fields

| Field | Type | Description |
|-------|------|-------------|
| `inter` | `PF_InteractCallbacks*` | Interaction callbacks for user input, parameter access, progress |
| `utils` | `PF_UtilCallbacks*` | Graphical and mathematical utilities |
| `effect_ref` | `PF_ProgPtr` | Opaque identifier for callback routing |
| `pica_basicP` | `SPBasicSuite*` | PICA Basic suite for acquiring other suites |

#### Version and Application Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | `PF_SpecVersion` | Effects specification version |
| `appl_id` | `A_long` | Application identifier ('FXTC' for AE, 'PrMr' for Premiere) |
| `quality` | `PF_Quality` | Current render quality (HI or LO) |

#### Timing Fields

| Field | Type | Description |
|-------|------|-------------|
| `current_time` | `A_long` | Current frame time in layer coordinates |
| `time_step` | `A_long` | Duration of current source frame (can be negative) |
| `local_time_step` | `A_long` | Constant frame duration, affected by time stretch |
| `time_scale` | `A_u_long` | Units per second |
| `total_time` | `A_long` | Total layer duration |
| `shutter_angle` | `A_Fixed` | Motion blur angle (0-1 for 0-360 degrees) |
| `shutter_phase` | `A_Fixed` | Offset from frame time to shutter open |

#### Spatial Fields

| Field | Type | Description |
|-------|------|-------------|
| `width` | `A_long` | Source layer width |
| `height` | `A_long` | Source layer height |
| `extent_hint` | `A_LongRect` | Intersection of visible input/output portions |
| `output_origin_x` | `A_long` | Output buffer X origin in input buffer |
| `output_origin_y` | `A_long` | Output buffer Y origin in input buffer |
| `downsample_x` | `A_Ratio` | Horizontal downsampling factor |
| `downsample_y` | `A_Ratio` | Vertical downsampling factor |
| `pixel_aspect_ratio` | `A_Ratio` | Pixel width-to-height ratio |

#### Data Management Fields

| Field | Type | Description |
|-------|------|-------------|
| `global_data` | `PF_Handle` | Plugin-stored data across all selectors |
| `sequence_data` | `PF_Handle` | Sequence-level persistent data |
| `frame_data` | `PF_Handle` | Frame-level temporary data |

#### Example: Reading PF_InData

```c
static PF_Err Render(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    // Get current time in seconds
    double time_sec = (double)in_data->current_time / (double)in_data->time_scale;

    // Check quality setting
    A_Boolean high_quality = (in_data->quality == PF_Quality_HI);

    // Use extent_hint for optimization
    A_LongRect extent = in_data->extent_hint;
    A_long process_width = extent.right - extent.left;
    A_long process_height = extent.bottom - extent.top;

    // Access global data
    MyGlobalData* globals = *(MyGlobalData**)in_data->global_data;

    // ...
}
```

### PF_OutData Structure

`PF_OutData` allows plugins to communicate status and capabilities back to After Effects.

#### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `my_version` | `A_u_long` | Plugin version (use PF_VERSION macro) |
| `global_data` | `PF_Handle` | Handle returned in future PF_InData calls |
| `num_params` | `A_long` | Total parameter count (validated against PF_ADD_PARAM calls) |
| `sequence_data` | `PF_Handle` | Sequence data handle |
| `frame_data` | `PF_Handle` | Frame data handle |
| `width` | `A_long` | Output buffer width (if different from input) |
| `height` | `A_long` | Output buffer height (if different from input) |
| `origin` | `A_LongPoint` | Output buffer origin |
| `return_msg` | `A_char[256]` | Message to display to user |
| `out_flags` | `PF_OutFlags` | Primary capability flags |
| `out_flags2` | `PF_OutFlags2` | Extended capability flags |

---

## Command Selectors: PF_Cmd

Command selectors tell the plugin what action After Effects is requesting.

### Global Selectors (Required)

| Selector | Description |
|----------|-------------|
| `PF_Cmd_GLOBAL_SETUP` | First call when plugin is applied; set flags and describe capabilities |
| `PF_Cmd_GLOBAL_SETDOWN` | Final call on exit; free all global data |
| `PF_Cmd_PARAM_SETUP` | Register parameters and set `num_params` |
| `PF_Cmd_ABOUT` | Display About dialog with version info |

### Sequence Selectors

| Selector | Description |
|----------|-------------|
| `PF_Cmd_SEQUENCE_SETUP` | Effect applied to layer; allocate sequence data |
| `PF_Cmd_SEQUENCE_RESETUP` | After loading, pre-comp, or copy; recreate sequence data |
| `PF_Cmd_SEQUENCE_FLATTEN` | Before save/duplicate; flatten data for disk storage |
| `PF_Cmd_SEQUENCE_SETDOWN` | Effect removed; free sequence data |

### Frame Selectors

| Selector | Description |
|----------|-------------|
| `PF_Cmd_FRAME_SETUP` | Before each frame; allocate frame data, set output size |
| `PF_Cmd_FRAME_SETDOWN` | After frame render; free frame data |
| `PF_Cmd_RENDER` | **Required**: Render the effect output |

### Audio Selectors

| Selector | Description |
|----------|-------------|
| `PF_Cmd_AUDIO_SETUP` | Before audio render; request input span |
| `PF_Cmd_AUDIO_RENDER` | Process audio data |
| `PF_Cmd_AUDIO_SETDOWN` | After audio render; cleanup |

### SmartFX Selectors

| Selector | Description |
|----------|-------------|
| `PF_Cmd_SMART_PRE_RENDER` | Declare input requirements and output extent |
| `PF_Cmd_SMART_RENDER` | Perform rendering for requested areas |
| `PF_Cmd_SMART_RENDER_GPU` | GPU rendering (AE 16.0+) |

### UI/Messaging Selectors

| Selector | Description |
|----------|-------------|
| `PF_Cmd_EVENT` | UI events (mouse, keyboard) |
| `PF_Cmd_USER_CHANGED_PARAM` | User modified a supervised parameter |
| `PF_Cmd_UPDATE_PARAMS_UI` | Update Effect Controls appearance |
| `PF_Cmd_DO_DIALOG` | Display options dialog |
| `PF_Cmd_ARBITRARY_CALLBACK` | Custom data type handlers |
| `PF_Cmd_QUERY_DYNAMIC_FLAGS` | Query dynamic behavior flags |

### GPU Device Selectors (AE 16.0+)

| Selector | Description |
|----------|-------------|
| `PF_Cmd_GPU_DEVICE_SETUP` | Initialize GPU resources |
| `PF_Cmd_GPU_DEVICE_SETDOWN` | Release GPU resources |

---

## Error Codes: PF_Err

### Standard Error Values

| Error Code | Value | Description |
|------------|-------|-------------|
| `PF_Err_NONE` | 0 | Success - no error |
| `PF_Err_OUT_OF_MEMORY` | 4 | Memory allocation failed |
| `PF_Err_INTERNAL_STRUCT_DAMAGED` | 512 | Data structure corruption |
| `PF_Err_INVALID_INDEX` | 513 | Array index out of bounds |
| `PF_Err_UNRECOGNIZED_PARAM_TYPE` | 514 | Unknown parameter type |
| `PF_Err_INVALID_CALLBACK` | 515 | Callback pointer invalid |
| `PF_Err_BAD_CALLBACK_PARAM` | 516 | Invalid callback parameter |
| `PF_Interrupt_CANCEL` | 517 | User cancelled operation |
| `PF_Err_CANNOT_PARSE_KEYFRAME_TEXT` | 518 | Keyframe text parsing failed |

### Error Handling Pattern

```c
// Standard error checking macro
#define ERR(FUNC) do { if (!err) { err = (FUNC); } } while (0)

// Example usage
static PF_Err MyFunction(PF_InData* in_data)
{
    PF_Err err = PF_Err_NONE;
    PF_Handle dataH = NULL;

    // Allocate memory
    ERR(in_data->inter->create_callback(
        in_data->effect_ref,
        1024,
        &dataH));

    if (!err && dataH) {
        // Use the handle
        char* dataP = *(char**)dataH;

        // ... operations ...

        // Dispose when done
        ERR(in_data->inter->dispose_callback(
            in_data->effect_ref,
            dataH));
    }

    // Always return error to host
    return err;
}
```

### Memory Error Special Case

`PF_Err_OUT_OF_MEMORY` is expected during RAM preview and should be handled gracefully:

```c
if (err == PF_Err_OUT_OF_MEMORY) {
    // Don't display error dialog
    // After Effects will handle memory pressure
    return err;
}
```

---

## Output Flags: PF_OutFlags and PF_OutFlags2

### PF_OutFlags (Primary Flags)

```c
typedef enum {
    PF_OutFlag_NONE                     = 0,
    PF_OutFlag_KEEP_RESOURCE_OPEN       = 1 << 0,   // Keep resources available
    PF_OutFlag_WIDE_TIME_INPUT          = 1 << 1,   // Sample params at other times
    PF_OutFlag_NON_PARAM_VARY           = 1 << 2,   // Output varies without param change
    PF_OutFlag_RESERVED_1               = 1 << 3,
    PF_OutFlag_SEQUENCE_DATA_NEEDS_FLATTENING = 1 << 4,
    PF_OutFlag_I_DO_DIALOG              = 1 << 5,   // Has options dialog
    PF_OutFlag_USE_OUTPUT_EXTENT        = 1 << 6,   // Use extent_hint
    PF_OutFlag_SEND_DO_DIALOG           = 1 << 7,   // Request DO_DIALOG calls
    PF_OutFlag_DISPLAY_ERROR_MESSAGE    = 1 << 8,   // Display error in return_msg
    PF_OutFlag_I_EXPAND_BUFFER          = 1 << 9,   // Effect expands output
    PF_OutFlag_PIX_INDEPENDENT          = 1 << 10,  // Pixels are independent
    PF_OutFlag_I_WRITE_INPUT_BUFFER     = 1 << 11,  // Writes to input buffer
    PF_OutFlag_I_SHRINK_BUFFER          = 1 << 12,  // Effect shrinks output
    PF_OutFlag_WORKS_IN_PLACE           = 1 << 13,  // Can work in-place
    PF_OutFlag_RESERVED_2               = 1 << 14,
    PF_OutFlag_CUSTOM_UI                = 1 << 15,  // Has custom UI
    PF_OutFlag_RESERVED_3               = 1 << 16,
    PF_OutFlag_REFRESH_UI               = 1 << 17,  // Refresh UI after render
    PF_OutFlag_NOP_RENDER               = 1 << 18,  // No-op render
    PF_OutFlag_I_USE_SHUTTER_ANGLE      = 1 << 19,  // Uses motion blur
    PF_OutFlag_I_USE_AUDIO              = 1 << 20,  // Audio effect
    PF_OutFlag_I_AM_OBSOLETE            = 1 << 21,  // Deprecated effect
    PF_OutFlag_FORCE_RERENDER           = 1 << 22,  // Force frame re-render
    PF_OutFlag_PiPL_OVERRIDES_OUTDATA   = 1 << 23,  // PiPL takes precedence
    PF_OutFlag_I_HAVE_EXTERNAL_DEPENDENCIES = 1 << 24,  // External files
    PF_OutFlag_DEEP_COLOR_AWARE         = 1 << 25,  // Handles 16-bit color
    PF_OutFlag_SEND_UPDATE_PARAMS_UI    = 1 << 26,  // Request UI updates
    PF_OutFlag_AUDIO_FLOAT_ONLY         = 1 << 27,  // Float audio only
    PF_OutFlag_AUDIO_IIR                = 1 << 28,  // IIR audio filter
    PF_OutFlag_I_SYNTHESIZE_AUDIO       = 1 << 29,  // Generates audio
    PF_OutFlag_AUDIO_EFFECT_TOO         = 1 << 30,  // Also processes audio
    PF_OutFlag_AUDIO_EFFECT_ONLY        = 1 << 31   // Audio-only effect
} PF_OutFlags;
```

### PF_OutFlags2 (Extended Flags)

```c
typedef enum {
    PF_OutFlag2_NONE                        = 0,
    PF_OutFlag2_SUPPORTS_QUERY_DYNAMIC_FLAGS = 1 << 0,
    PF_OutFlag2_I_USE_3D_CAMERA             = 1 << 1,
    PF_OutFlag2_I_USE_3D_LIGHTS             = 1 << 2,
    PF_OutFlag2_PARAM_GROUP_START_COLLAPSED_FLAG = 1 << 3,
    PF_OutFlag2_I_AM_THREADSAFE             = 1 << 4,
    PF_OutFlag2_CAN_COMBINE_WITH_DESTINATION = 1 << 5,
    PF_OutFlag2_DOESNT_NEED_EMPTY_PIXELS    = 1 << 6,
    PF_OutFlag2_REVEALS_ZERO_ALPHA          = 1 << 7,   // Exposes hidden RGB
    PF_OutFlag2_PRESERVES_FULLY_OPAQUE_PIXELS = 1 << 8,
    PF_OutFlag2_SUPPORTS_SMART_RENDER       = 1 << 10,  // SmartFX enabled
    PF_OutFlag2_RESERVED_1                  = 1 << 11,
    PF_OutFlag2_FLOAT_COLOR_AWARE           = 1 << 12,  // 32-bit float support
    PF_OutFlag2_I_USE_COLORSPACE_ENUMERATION = 1 << 13,
    PF_OutFlag2_I_AM_DEPRECATED             = 1 << 14,
    PF_OutFlag2_PPRO_DO_NOT_CLONE_SEQUENCE_DATA_FOR_RENDER = 1 << 15,
    PF_OutFlag2_RESERVED_2                  = 1 << 16,
    PF_OutFlag2_AUTOMATIC_WIDE_TIME_INPUT   = 1 << 17,  // Auto track deps
    PF_OutFlag2_I_USE_TIMECODE              = 1 << 18,
    PF_OutFlag2_DEPENDS_ON_UNREFERENCED_MASKS = 1 << 19,
    PF_OutFlag2_OUTPUT_IS_WATERMARKED       = 1 << 20,
    PF_OutFlag2_I_MIX_GUID_DEPENDENCIES     = 1 << 21,
    PF_OutFlag2_AE13_5_THREADSAFE           = 1 << 22,
    PF_OutFlag2_SUPPORTS_GET_FLATTENED_SEQUENCE_DATA = 1 << 23,
    PF_OutFlag2_CUSTOM_UI_ASYNC_MANAGER     = 1 << 24,
    PF_OutFlag2_SUPPORTS_GPU_RENDER_F32     = 1 << 25,
    PF_OutFlag2_RESERVED_3                  = 1 << 26,
    PF_OutFlag2_SUPPORTS_THREADED_RENDERING = 1 << 27,  // AE 2022+
    PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER = 1 << 28  // AE 2022+
} PF_OutFlags2;
```

### Example: Setting Flags in Global Setup

```c
static PF_Err GlobalSetup(
    PF_InData* in_data,
    PF_OutData* out_data)
{
    out_data->my_version = PF_VERSION(MAJOR_VERSION,
                                       MINOR_VERSION,
                                       BUG_VERSION,
                                       STAGE_VERSION,
                                       BUILD_VERSION);

    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE |
                          PF_OutFlag_PIX_INDEPENDENT |
                          PF_OutFlag_USE_OUTPUT_EXTENT;

    out_data->out_flags2 = PF_OutFlag2_FLOAT_COLOR_AWARE |
                           PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}
```

---

## Quality and Field Enumerations

### PF_Quality

```c
typedef enum {
    PF_Quality_LO = 0,    // Draft quality rendering
    PF_Quality_HI = 1     // Full quality rendering
} PF_Quality;
```

**Usage:** Check `in_data->quality` to determine render quality level.

### PF_Field

```c
typedef enum {
    PF_Field_FRAME = 0,   // Full frame (progressive)
    PF_Field_UPPER = 1,   // Upper field first
    PF_Field_LOWER = 2    // Lower field first
} PF_Field;
```

**Usage:** Field rendering for interlaced video output.

### Example: Quality-Dependent Processing

```c
static PF_Err Render(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    PF_Err err = PF_Err_NONE;

    if (in_data->quality == PF_Quality_HI) {
        // Full quality - use expensive algorithm
        err = RenderHighQuality(in_data, output);
    } else {
        // Draft quality - use fast approximation
        err = RenderLowQuality(in_data, output);
    }

    return err;
}
```

---

## Handle Types

### PF_Handle

`PF_Handle` is an opaque pointer to allocated memory managed through After Effects' memory system.

```c
typedef void** PF_Handle;
```

**Key Characteristics:**
- Double-pointer (points to a pointer to data)
- Must be locked before accessing underlying memory
- Must be unlocked when direct access is complete
- Must be disposed when no longer needed

### Handle Management Functions

```c
// Allocate a handle
PF_Handle PF_NEW_HANDLE(A_long size);

// Lock handle for access
void* PF_LOCK_HANDLE(PF_Handle handle);

// Unlock handle
void PF_UNLOCK_HANDLE(PF_Handle handle);

// Dispose handle
void PF_DISPOSE_HANDLE(PF_Handle handle);

// Get handle size
A_long PF_GET_HANDLE_SIZE(PF_Handle handle);

// Resize handle
PF_Err PF_RESIZE_HANDLE(A_long new_size, PF_Handle* handleP);
```

### Example: Handle Usage

```c
static PF_Err AllocateSequenceData(
    PF_InData* in_data,
    PF_OutData* out_data)
{
    PF_Err err = PF_Err_NONE;

    // Allocate sequence data handle
    PF_Handle seqH = PF_NEW_HANDLE(sizeof(MySequenceData));

    if (seqH) {
        // Lock to access memory
        MySequenceData* seqP = (MySequenceData*)PF_LOCK_HANDLE(seqH);

        if (seqP) {
            // Initialize the data
            seqP->initialized = TRUE;
            seqP->cached_value = 0.0;

            // Unlock when done
            PF_UNLOCK_HANDLE(seqH);

            // Store in out_data for persistence
            out_data->sequence_data = seqH;
        } else {
            err = PF_Err_OUT_OF_MEMORY;
            PF_DISPOSE_HANDLE(seqH);
        }
    } else {
        err = PF_Err_OUT_OF_MEMORY;
    }

    return err;
}
```

---

## AEGP Handle Types

AEGP (After Effects General Plug-in) handles are opaque references to After Effects objects. They cannot be dereferenced directly; all access is through suite functions.

### Handle Types Overview

| Handle Type | Description |
|-------------|-------------|
| `AEGP_MemHandle` | Memory allocation handle |
| `AEGP_ProjectH` | Current project reference |
| `AEGP_ItemH` | Project item (comp, footage, folder) |
| `AEGP_CompH` | Composition reference |
| `AEGP_LayerH` | Layer within a composition |
| `AEGP_StreamRefH` | Parameter stream (keyframes) |
| `AEGP_EffectRefH` | Applied effect reference |
| `AEGP_MaskRefH` | Layer mask reference |
| `AEGP_WorldH` | Frame of pixels |
| `AEGP_RenderOptionsH` | Render settings |
| `AEGP_Collection2H` | Selected items set |
| `AEGP_TextDocumentH` | Text layer content |

### Handle Acquisition Patterns

**Get vs GetNew:**
- Functions prefixed with `Get` return handles owned by After Effects - do not dispose
- Functions prefixed with `GetNew` allocate handles that the caller must dispose

```c
// Get (AE-owned) - do NOT dispose
AEGP_CompH compH;
err = suites.CompSuite->AEGP_GetCompFromItem(itemH, &compH);
// Use compH, but don't dispose it

// GetNew (caller-owned) - MUST dispose
AEGP_LayerH layerH;
err = suites.LayerSuite->AEGP_GetNewLayerByIndex(compH, 0, &layerH);
// Use layerH
err = suites.LayerSuite->AEGP_DisposeLayer(layerH);  // Required
```

### Disposal Functions

| Handle Type | Disposal Function |
|-------------|-------------------|
| `AEGP_StreamRefH` | `AEGP_DisposeStream` |
| `AEGP_MaskRefH` | `AEGP_DisposeMask` |
| `AEGP_EffectRefH` | `AEGP_DisposeEffect` |
| `AEGP_Collection2H` | `AEGP_DisposeCollection` |
| `AEGP_MemHandle` | `AEGP_FreeMemHandle` |

### Handle Validity

Handles can become invalid when:
- The referenced object is deleted
- Project structure changes (reordering, modifications)
- After Effects performs internal cleanup

**Best Practice:** Acquire handles immediately before use and dispose promptly.

---

## SmartFX Data Structures

SmartFX enables efficient bidirectional communication between effects and After Effects for optimized rendering.

### PF_RenderRequest

```c
typedef struct {
    A_LongRect      rect;               // Requested output rectangle
    PF_Field        field;              // Field information
    PF_ChannelMask  channel_mask;       // Requested channels
    A_Boolean       preserve_rgb_of_zero_alpha;
} PF_RenderRequest;
```

### PF_ChannelMask

```c
typedef enum {
    PF_ChannelMask_ALPHA = 1 << 0,
    PF_ChannelMask_RED   = 1 << 1,
    PF_ChannelMask_GREEN = 1 << 2,
    PF_ChannelMask_BLUE  = 1 << 3,
    PF_ChannelMask_ARGB  = PF_ChannelMask_ALPHA |
                          PF_ChannelMask_RED |
                          PF_ChannelMask_GREEN |
                          PF_ChannelMask_BLUE
} PF_ChannelMask;
```

### PF_CheckoutResult

```c
typedef struct {
    A_LongRect      result_rect;        // Actual output rectangle
    A_LongRect      max_result_rect;    // Maximum possible output
    PF_RationalScale ref_width;         // Reference width
    PF_RationalScale ref_height;        // Reference height
    A_Ratio         par;                // Pixel aspect ratio
    A_Boolean       solid;              // Is layer solid?
    A_long          ref_time;           // Reference time
    A_long          ref_timescale;      // Reference time scale
} PF_CheckoutResult;
```

### SmartFX Rendering Flow

```c
static PF_Err SmartPreRender(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_PreRenderExtra* extra)
{
    PF_Err err = PF_Err_NONE;
    PF_RenderRequest req = extra->input->output_request;
    PF_CheckoutResult result;

    // Request input pixels
    ERR(extra->cb->checkout_layer(
        in_data->effect_ref,
        0,                      // Checkout ID
        0,                      // param_index (0 = input layer)
        &req,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &result));

    // Set output extent
    extra->output->result_rect = result.result_rect;
    extra->output->max_result_rect = result.max_result_rect;

    return err;
}

static PF_Err SmartRender(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_SmartRenderExtra* extra)
{
    PF_Err err = PF_Err_NONE;
    PF_EffectWorld* input_world = NULL;
    PF_EffectWorld* output_world = NULL;

    // Get input pixels
    ERR(extra->cb->checkout_layer_pixels(
        in_data->effect_ref,
        0,                      // Checkout ID (must match pre-render)
        &input_world));

    // Get output world
    ERR(extra->cb->checkout_output(
        in_data->effect_ref,
        &output_world));

    if (!err && input_world && output_world) {
        // Process pixels
        err = ProcessPixels(input_world, output_world);
    }

    return err;
}
```

---

## Memory Safety and Best Practices

### Critical Rules

1. **Always use rowbytes for scanline traversal**
   ```c
   // WRONG
   PF_Pixel8* nextRow = currentRow + width;

   // CORRECT
   PF_Pixel8* nextRow = (PF_Pixel8*)((char*)currentRow + rowbytes);
   ```

2. **Never assume 16-byte alignment**
   ```c
   // WRONG - assumes alignment
   __m128i* simd_ptr = (__m128i*)pixel_data;

   // CORRECT - use unaligned loads
   __m128i pixels = _mm_loadu_si128((__m128i*)pixel_data);
   ```

3. **Never write outside buffer bounds**
   ```c
   // Check extent_hint before processing
   if (x >= extent.left && x < extent.right &&
       y >= extent.top && y < extent.bottom) {
       // Safe to write
   }
   ```

4. **Always check handle validity before use**
   ```c
   if (handle) {
       void* ptr = PF_LOCK_HANDLE(handle);
       if (ptr) {
           // Safe to use
           PF_UNLOCK_HANDLE(handle);
       }
   }
   ```

5. **Dispose AEGP handles acquired with GetNew**
   ```c
   AEGP_LayerH layerH = NULL;
   err = suites.LayerSuite->AEGP_GetNewLayerByIndex(compH, 0, &layerH);
   // ... use layerH ...
   if (layerH) {
       suites.LayerSuite->AEGP_DisposeLayer(layerH);  // Required!
   }
   ```

### Error Propagation Pattern

```c
// Macro for clean error handling
#define ERR(FUNC) do { \
    if (!err) { \
        err = (FUNC); \
        if (err) { \
            /* Optionally log error location */ \
        } \
    } \
} while (0)

// Usage
PF_Err err = PF_Err_NONE;
ERR(Function1());
ERR(Function2());  // Only called if Function1 succeeded
ERR(Function3());  // Only called if both previous succeeded
return err;        // Return first error encountered
```

### Thread Safety (AE 2022+)

For effects using `PF_OutFlag2_SUPPORTS_THREADED_RENDERING`:

```c
// Sequence data is READ-ONLY during render
// Use PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER if mutation needed

static PF_Err ThreadSafeRender(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output)
{
    // Access sequence data (read-only)
    MySeqData* seq = *(MySeqData**)in_data->sequence_data;

    // DO NOT modify sequence data here
    // Use thread-local storage for mutable state

    return ProcessPixels(in_data, output, seq);
}
```

---

## Summary

The After Effects SDK type system provides:

- **Fundamental types** (`A_long`, `A_FpLong`, etc.) for cross-platform consistency
- **Spatial types** (`A_FloatPoint`, `A_LongRect`) for coordinates and regions
- **Pixel structures** (`PF_Pixel8`, `PF_Pixel16`, `PF_PixelFloat`) for multi-depth support
- **Buffer management** (`PF_EffectWorld`) with critical memory layout rules
- **Parameter system** (`PF_ParamDef`, `PF_ParamType`) for effect controls
- **Interface structures** (`PF_InData`, `PF_OutData`) for host communication
- **Command flow** (`PF_Cmd`) defining the effect lifecycle
- **Error handling** (`PF_Err`) for robust error propagation
- **Handle types** (`PF_Handle`, `AEGP_*H`) for memory and object management

Understanding these types and their proper usage is essential for developing stable, high-performance After Effects plugins that integrate seamlessly with Adobe's rendering infrastructure.

---

## References

- [After Effects SDK Guide - Data Types](https://ae-plugins.docsforadobe.dev/aegps/data-types/)
- [After Effects SDK Guide - PF_EffectWorld](https://ae-plugins.docsforadobe.dev/effect-basics/PF_EffectWorld/)
- [After Effects SDK Guide - PF_ParamDef](https://ae-plugins.docsforadobe.dev/effect-basics/PF_ParamDef/)
- [After Effects SDK Guide - PF_InData](https://ae-plugins.docsforadobe.dev/effect-basics/PF_InData/)
- [After Effects SDK Guide - PF_OutData](https://ae-plugins.docsforadobe.dev/effect-basics/PF_OutData/)
- [After Effects SDK Guide - Errors](https://ae-plugins.docsforadobe.dev/effect-basics/errors/)
- [After Effects SDK Guide - Command Selectors](https://ae-plugins.docsforadobe.dev/effect-basics/command-selectors/)
