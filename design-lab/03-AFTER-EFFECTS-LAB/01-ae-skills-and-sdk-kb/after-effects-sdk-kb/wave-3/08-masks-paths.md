---
source: '[unknown - 08-masks-paths.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Masks and Paths API Reference

This document provides comprehensive documentation for mask and path manipulation in the Adobe After Effects SDK, covering both AEGP (After Effects General Plug-in) suites for host-level access and PF (Plug-in Filter) suites for effect-level path operations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AEGP_MaskSuite6](#aegp_masksuite6)
3. [AEGP_MaskOutlineSuite3](#aegp_maskoutlinesuite3)
4. [PF_PathQuerySuite1](#pf_pathquerysuite1)
5. [PF_PathDataSuite1](#pf_pathdatasuite1)
6. [Key Data Structures](#key-data-structures)
7. [Mask Properties](#mask-properties)
8. [Bezier Mathematics](#bezier-mathematics)
9. [RotoBezier vs Bezier Paths](#rotobezier-vs-bezier-paths)
10. [Mask Animation and Keyframes](#mask-animation-and-keyframes)
11. [Path Operations](#path-operations)
12. [Code Examples](#code-examples)
13. [Best Practices](#best-practices)

---

## Architecture Overview

After Effects provides two distinct API layers for working with masks and paths:

### AEGP Layer (Host-Level Access)
- **AEGP_MaskSuite6**: Access and manipulate masks applied to layers
- **AEGP_MaskOutlineSuite3**: Detailed path geometry and vertex manipulation
- Used by: AEGPs, Artisans, and effects (with limitations)

### Effect Layer (Effect-Level Access)
- **PF_PathQuerySuite1**: Identify and check out paths from the source layer
- **PF_PathDataSuite1**: Read path geometry, vertices, and segment data
- Used by: Effect plug-ins during rendering

```
┌─────────────────────────────────────────────────────────────┐
│                    After Effects Host                        │
├─────────────────────────────────────────────────────────────┤
│  AEGP Layer                                                  │
│  ┌──────────────────────┐  ┌────────────────────────────┐   │
│  │   AEGP_MaskSuite6    │  │  AEGP_MaskOutlineSuite3    │   │
│  │  - Layer mask access │  │  - Vertex manipulation     │   │
│  │  - Mask properties   │  │  - Path geometry           │   │
│  │  - Create/delete     │  │  - Feather control         │   │
│  └──────────────────────┘  └────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Effect Layer                                                │
│  ┌──────────────────────┐  ┌────────────────────────────┐   │
│  │  PF_PathQuerySuite1  │  │    PF_PathDataSuite1       │   │
│  │  - Path enumeration  │  │  - Vertex data access      │   │
│  │  - Checkout/checkin  │  │  - Segment calculations    │   │
│  │  - Path identification│ │  - Mask mode retrieval     │   │
│  └──────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## AEGP_MaskSuite6

The primary suite for accessing and manipulating masks at the layer level.

### Suite Acquisition

```cpp
AEGP_MaskSuite6 *maskSuite;
AEFX_AcquireSuite(in_data,
    out_data,
    kAEGPMaskSuite,
    kAEGPMaskSuiteVersion6,
    "Couldn't acquire AEGP_MaskSuite6",
    (void **)&maskSuite);
```

### Function Reference

#### Mask Access Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `AEGP_GetLayerNumMasks` | Get count of masks on layer | `layer_handle` -> `num_masksL` |
| `AEGP_GetLayerMaskByIndex` | Get mask at index | `layer_handle`, `indexL` -> `maskH` |
| `AEGP_GetMaskID` | Get unique mask identifier | `maskH` -> `id_valP` |
| `AEGP_GetMaskName` | Get mask name | `maskH` -> `nameZ` |
| `AEGP_SetMaskName` | Set mask name | `maskH`, `nameZ` |

#### Mask Creation/Deletion

| Function | Description | Notes |
|----------|-------------|-------|
| `AEGP_CreateNewMask` | Create new mask on layer | Returns mask with zero nodes |
| `AEGP_DeleteMaskFromLayer` | Remove mask from layer | Cannot be undone |
| `AEGP_DuplicateMask` | Duplicate existing mask | Returns new handle (must dispose) |
| `AEGP_DisposeMask` | Release mask handle | Required for all acquired handles |

#### Mask Properties

| Function | Get/Set | Property |
|----------|---------|----------|
| `AEGP_GetMaskInvert` | Get | Inversion state |
| `AEGP_SetMaskInvert` | Set | Inversion state |
| `AEGP_GetMaskMode` | Get | Blend mode (PF_MaskMode) |
| `AEGP_SetMaskMode` | Set | Blend mode |
| `AEGP_GetMaskMotionBlurState` | Get | Motion blur on/off/same as layer |
| `AEGP_SetMaskMotionBlurState` | Set | Motion blur state |
| `AEGP_GetMaskFeatherFalloff` | Get | Smooth or Linear falloff |
| `AEGP_SetMaskFeatherFalloff` | Set | Falloff type |
| `AEGP_GetMaskIsRotoBezier` | Get | RotoBezier status |
| `AEGP_GetMaskColor` | Get | Mask outline color |
| `AEGP_SetMaskColor` | Set | Mask outline color |
| `AEGP_GetMaskLockState` | Get | Lock state |
| `AEGP_SetMaskLockState` | Set | Lock state |

### PF_MaskMode Enumeration

```cpp
enum {
    PF_MaskMode_NONE = 0,       // No effect
    PF_MaskMode_ADD,            // Union/Add
    PF_MaskMode_SUBTRACT,       // Subtract from below
    PF_MaskMode_INTERSECT,      // Intersection only
    PF_MaskMode_LIGHTEN,        // Lighten blend
    PF_MaskMode_DARKEN,         // Darken blend
    PF_MaskMode_DIFFERENCE,     // Difference blend
    PF_MaskMode_ACCUM,          // Accumulate (internal)
    PF_NUM_MASKMODES
};
typedef A_long PF_MaskMode;
```

---

## AEGP_MaskOutlineSuite3

Provides detailed access to mask path geometry, vertices, and feathering.

### Suite Acquisition

```cpp
AEGP_MaskOutlineSuite3 *outlineSuite;
AEFX_AcquireSuite(in_data,
    out_data,
    kAEGPMaskOutlineSuite,
    kAEGPMaskOutlineSuiteVersion3,
    "Couldn't acquire AEGP_MaskOutlineSuite3",
    (void **)&outlineSuite);
```

### Path Structure Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `AEGP_IsMaskOutlineOpen` | Check if path is open | `A_Boolean` |
| `AEGP_SetMaskOutlineOpen` | Set open/closed state | - |
| `AEGP_GetMaskOutlineNumSegments` | Get segment count | `A_long` |

### Vertex Manipulation

| Function | Description |
|----------|-------------|
| `AEGP_GetMaskOutlineVertexInfo` | Get vertex position and tangents |
| `AEGP_SetMaskOutlineVertexInfo` | Set vertex position and tangents |
| `AEGP_CreateVertex` | Add new vertex at index |
| `AEGP_DeleteVertex` | Remove vertex at index |

#### AEGP_MaskVertex Structure

```cpp
typedef struct AEGP_MaskVertex {
    A_FpLong x;           // Vertex X position
    A_FpLong y;           // Vertex Y position
    A_FpLong tan_in_x;    // Incoming tangent X (relative to vertex)
    A_FpLong tan_in_y;    // Incoming tangent Y (relative to vertex)
    A_FpLong tan_out_x;   // Outgoing tangent X (relative to vertex)
    A_FpLong tan_out_y;   // Outgoing tangent Y (relative to vertex)
} AEGP_MaskVertex;
```

### Feathering Functions (CS6+)

| Function | Description |
|----------|-------------|
| `AEGP_GetMaskOutlineNumFeathers` | Count of feather points |
| `AEGP_GetMaskOutlineFeatherInfo` | Get feather at index |
| `AEGP_SetMaskOutlineFeatherInfo` | Set feather at index |
| `AEGP_CreateMaskOutlineFeather` | Add new feather point |
| `AEGP_DeleteMaskOutlineFeather` | Remove feather point |

#### AEGP_MaskFeather Structure

```cpp
typedef struct AEGP_MaskFeather {
    A_long   segment_index;     // Which segment (0 to num_segments-1)
    PF_FpLong segment_param;    // Position along segment (0.0 to 1.0)
    PF_FpLong radius;           // Feather radius in pixels
    A_u_char  interp_type;      // Interpolation: 0=smooth, 1=linear
    A_u_char  feather_type;     // 0=outer, 1=inner
} AEGP_MaskFeather;
```

---

## PF_PathQuerySuite1

Effect-level suite for identifying and checking out paths from the source layer.

### Suite Acquisition

```cpp
PF_PathQuerySuite1 *pathQuerySuite;
PF_Err err = AEFX_AcquireSuite(in_data,
    out_data,
    kPFPathQuerySuite,
    kPFPathQuerySuiteVersion1,
    "Couldn't acquire PF_PathQuerySuite1",
    (void **)&pathQuerySuite);
```

### Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `PF_NumPaths` | `(PF_ProgPtr, A_long*)` | Get count of paths on source layer |
| `PF_PathInfo` | `(PF_ProgPtr, A_long index, PF_PathID*)` | Get path identifier at index |
| `PF_CheckoutPath` | `(PF_ProgPtr, PF_PathID, A_Time, A_long time_step, A_u_long time_scale, PF_PathOutlinePtr*)` | Acquire path data for time |
| `PF_CheckinPath` | `(PF_ProgPtr, PF_PathID, A_Boolean changed, PF_PathOutlinePtr)` | Release path back to AE |

### Critical Usage Pattern

```cpp
// ALWAYS checkout before access, checkin after
PF_PathOutlinePtr pathPtr = NULL;
PF_PathID pathID;

// Get path identifier
pathQuerySuite->PF_PathInfo(in_data->effect_ref, 0, &pathID);

// Checkout at current time
pathQuerySuite->PF_CheckoutPath(
    in_data->effect_ref,
    pathID,
    in_data->current_time,
    in_data->time_step,
    in_data->time_scale,
    &pathPtr);

// Use path data...

// ALWAYS checkin when done
pathQuerySuite->PF_CheckinPath(
    in_data->effect_ref,
    pathID,
    FALSE,  // changed = FALSE for read-only
    pathPtr);
```

> **WARNING**: Never use path values without first checking them out. Path updates are performed lazily - your effect won't see changes unless it checks out the path fresh.

---

## PF_PathDataSuite1

Effect-level suite for reading path geometry data. Frozen since AE 5.0.

### Suite Acquisition

```cpp
PF_PathDataSuite1 *pathDataSuite;
AEFX_AcquireSuite(in_data,
    out_data,
    kPFPathDataSuite,
    kPFPathDataSuiteVersion1,
    "Couldn't acquire PF_PathDataSuite1",
    (void **)&pathDataSuite);
```

### Path Structure Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `PF_PathIsOpen` | Check if path is unclosed | `A_Boolean` |
| `PF_PathNumSegments` | Get segment count (N segments = vertices [0..N]) | `A_long` |

### Vertex Access

| Function | Description |
|----------|-------------|
| `PF_PathVertexInfo` | Get vertex position and tangents at index |

#### PF_PathVertex Structure

```cpp
typedef struct PF_PathVertex {
    PF_FpLong x;          // Vertex X in layer coordinates
    PF_FpLong y;          // Vertex Y in layer coordinates
    PF_FpLong tan_in_x;   // Incoming tangent X (relative)
    PF_FpLong tan_in_y;   // Incoming tangent Y (relative)
    PF_FpLong tan_out_x;  // Outgoing tangent X (relative)
    PF_FpLong tan_out_y;  // Outgoing tangent Y (relative)
} PF_PathVertex;
```

### Segment Length Functions

| Function | Description |
|----------|-------------|
| `PF_PathPrepareSegLength` | Prepare segment for length calculations |
| `PF_PathGetSegLength` | Get total segment length |
| `PF_PathEvalSegLength` | Get position at length along segment |
| `PF_PathEvalSegLengthDeriv1` | Get position AND first derivative (tangent) |

### Metadata Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `PF_PathIsInverted` | Check mask inversion state | `A_Boolean` |
| `PF_PathGetMaskMode` | Get mask blend mode | `PF_MaskMode` |
| `PF_PathGetName` | Get path name (max 31 chars) | `A_char[32]` |

### Segment Evaluation Example

```cpp
// Prepare for length calculations
A_long frequency = 100;  // Sampling rate
err = pathDataSuite->PF_PathPrepareSegLength(
    in_data->effect_ref,
    pathPtr,
    segmentIndex,
    frequency,
    &segPrepHandle);

// Get total segment length
PF_FpLong segLength;
err = pathDataSuite->PF_PathGetSegLength(
    in_data->effect_ref,
    pathPtr,
    segmentIndex,
    &segLength);

// Evaluate point at 50% along segment
PF_FpLong evalLength = segLength * 0.5;
PF_FpLong x, y;
err = pathDataSuite->PF_PathEvalSegLength(
    in_data->effect_ref,
    pathPtr,
    segPrepHandle,
    evalLength,
    &x, &y);

// With tangent/derivative
PF_FpLong dx, dy;
err = pathDataSuite->PF_PathEvalSegLengthDeriv1(
    in_data->effect_ref,
    pathPtr,
    segPrepHandle,
    evalLength,
    &x, &y,
    &dx, &dy);  // First derivative = tangent direction
```

---

## Key Data Structures

### AEGP_MaskRefH

Opaque handle to a mask applied to a layer. Used for accessing mask properties and streams.

```cpp
typedef struct AEGP_MaskRef *AEGP_MaskRefH;
```

**Lifecycle**:
- Acquired via `AEGP_GetLayerMaskByIndex`
- Must be disposed via `AEGP_DisposeMask`
- Do not cache between function calls

### AEGP_MaskOutlineValH

Handle to the actual mask outline data (points constituting the mask).

```cpp
typedef struct AEGP_MaskOutlineVal *AEGP_MaskOutlineValH;
```

**Key Difference**:
- `AEGP_MaskRefH` = Mask reference for properties and streams
- `AEGP_MaskOutlineValH` = Actual geometric data (vertices, tangents)

### PF_PathID

Unique identifier for a path, used with PF_PathQuerySuite.

```cpp
typedef A_u_long PF_PathID;
```

### Mask Stream Types

Masks have dedicated stream types (different from layer streams):

```cpp
enum AEGP_MaskStream {
    AEGP_MaskStream_OUTLINE,     // Path geometry
    AEGP_MaskStream_OPACITY,     // Mask opacity (0-100%)
    AEGP_MaskStream_FEATHER,     // Feather amount in pixels
    AEGP_MaskStream_EXPANSION    // Expansion in pixels
};
```

Access via `AEGP_GetNewMaskStream` from `AEGP_StreamSuite5`.

---

## Mask Properties

### Core Properties

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| Mode | `PF_MaskMode` | Enum | How mask combines with others |
| Opacity | Float | 0-100% | Mask transparency |
| Feather | Float | 0+ pixels | Edge softness |
| Expansion | Float | +/- pixels | Shrink/grow mask edge |
| Inverted | Boolean | true/false | Swap inside/outside |

### Mode Behaviors

| Mode | Description | Alpha Calculation |
|------|-------------|-------------------|
| NONE | No contribution | - |
| ADD | Union of masks | `max(existing, mask)` |
| SUBTRACT | Remove from existing | `existing * (1 - mask)` |
| INTERSECT | Only overlapping area | `min(existing, mask)` |
| LIGHTEN | Per-pixel lighten | `max(existing, mask)` |
| DARKEN | Per-pixel darken | `min(existing, mask)` |
| DIFFERENCE | XOR-like operation | `abs(existing - mask)` |

### Motion Blur States

```cpp
enum AEGP_MaskMBlur {
    AEGP_MaskMBlur_SAME_AS_LAYER,  // Inherit from layer
    AEGP_MaskMBlur_OFF,            // Forced off
    AEGP_MaskMBlur_ON              // Forced on
};
```

### Feather Falloff Types

```cpp
enum AEGP_MaskFeatherFalloff {
    AEGP_MaskFeatherFalloff_SMOOTH,  // Smooth/curved falloff
    AEGP_MaskFeatherFalloff_LINEAR   // Linear falloff
};
```

---

## Bezier Mathematics

After Effects paths use cubic Bezier curves. Understanding the math is essential for path manipulation.

### Cubic Bezier Formula

A cubic Bezier curve is defined by four points:
- **P0**: Start point (vertex)
- **P1**: First control point (vertex + tan_out)
- **P2**: Second control point (next vertex + tan_in)
- **P3**: End point (next vertex)

The parametric equation for t in [0, 1]:

```
B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
```

Expanded form:
```
B(t) = P0 + 3t(P1-P0) + 3t²(P2-2P1+P0) + t³(P3-3P2+3P1-P0)
```

### First Derivative (Tangent)

```
B'(t) = 3(1-t)²(P1-P0) + 6(1-t)t(P2-P1) + 3t²(P3-P2)
```

This gives the tangent direction at any point t.

### Implementation Example

```cpp
// Evaluate cubic Bezier at parameter t
void EvalBezier(
    const PF_PathVertex& v0,  // Start vertex
    const PF_PathVertex& v1,  // End vertex
    PF_FpLong t,              // Parameter [0,1]
    PF_FpLong* x,
    PF_FpLong* y)
{
    // Control points
    PF_FpLong p0x = v0.x;
    PF_FpLong p0y = v0.y;
    PF_FpLong p1x = v0.x + v0.tan_out_x;
    PF_FpLong p1y = v0.y + v0.tan_out_y;
    PF_FpLong p2x = v1.x + v1.tan_in_x;
    PF_FpLong p2y = v1.y + v1.tan_in_y;
    PF_FpLong p3x = v1.x;
    PF_FpLong p3y = v1.y;

    // Bernstein polynomial coefficients
    PF_FpLong t2 = t * t;
    PF_FpLong t3 = t2 * t;
    PF_FpLong mt = 1.0 - t;
    PF_FpLong mt2 = mt * mt;
    PF_FpLong mt3 = mt2 * mt;

    // Cubic Bezier evaluation
    *x = mt3 * p0x + 3.0 * mt2 * t * p1x +
         3.0 * mt * t2 * p2x + t3 * p3x;
    *y = mt3 * p0y + 3.0 * mt2 * t * p1y +
         3.0 * mt * t2 * p2y + t3 * p3y;
}
```

### De Casteljau Algorithm

Numerically stable recursive evaluation:

```cpp
void DeCasteljau(
    PF_FpLong p0, PF_FpLong p1,
    PF_FpLong p2, PF_FpLong p3,
    PF_FpLong t, PF_FpLong* result)
{
    // First level
    PF_FpLong q0 = p0 + t * (p1 - p0);
    PF_FpLong q1 = p1 + t * (p2 - p1);
    PF_FpLong q2 = p2 + t * (p3 - p2);

    // Second level
    PF_FpLong r0 = q0 + t * (q1 - q0);
    PF_FpLong r1 = q1 + t * (q2 - q1);

    // Final point
    *result = r0 + t * (r1 - r0);
}
```

### Tangent Coordinate System

In After Effects:
- Tangent values are **relative to the vertex position**
- A tangent of `(0, 0)` means the control point is at the vertex (corner)
- A tangent of `(-50, 0)` means the control point is 50 pixels left of the vertex
- Longer tangents = more influence on curve shape

```
Vertex at (100, 100) with tan_out = (-30, -20)
→ Control point is at (100-30, 100-20) = (70, 80)
```

---

## RotoBezier vs Bezier Paths

### Key Differences

| Aspect | Standard Bezier | RotoBezier |
|--------|-----------------|------------|
| Tangent control | Manual handles | Automatic |
| User interaction | 3 points per vertex | 1 point per vertex |
| Tangent storage | User-defined | Calculated on access |
| Animation | Complex (more keyframes) | Simpler |
| Use case | Geometric shapes | Organic shapes |

### RotoBezier Automatic Calculation

RotoBezier masks automatically calculate tangents based on:
1. Positions of neighboring vertices
2. Tension parameter (0-100%)

When setting a RotoBezier shape:
```javascript
// Scripting example - tangents can be null
shape.vertices = [[100,100], [200,150], [150,250]];
shape.inTangents = null;   // Will be auto-calculated
shape.outTangents = null;  // Will be auto-calculated
```

When reading a RotoBezier shape, tangent values are populated with calculated values.

### Tension Control

| Tension | Effect |
|---------|--------|
| 0% | Minimum tension, maximum curve |
| 33% | Default smooth point |
| 100% | Maximum tension, corner point |

### Conversion Behavior

- **Bezier → RotoBezier**: Shape may change (handles are discarded)
- **RotoBezier → Bezier**: Shape preserved (calculated tangents become explicit)

### SDK Detection

```cpp
A_Boolean isRotoBezier;
maskSuite->AEGP_GetMaskIsRotoBezier(maskH, &isRotoBezier);
```

---

## Mask Animation and Keyframes

### Accessing Mask Streams

Masks use dedicated stream types accessed via `AEGP_StreamSuite5`:

```cpp
AEGP_StreamRefH maskStream;
streamSuite->AEGP_GetNewMaskStream(
    aegp_plugin_id,
    maskH,
    AEGP_MaskStream_OUTLINE,  // or OPACITY, FEATHER, EXPANSION
    &maskStream);

// Use stream...

streamSuite->AEGP_DisposeStream(maskStream);
```

### Adding Keyframes

```cpp
AEGP_AddKeyframesInfoH addKeyInfo;
A_long keyIndex;

// Start keyframe addition session
keyframeSuite->AEGP_StartAddKeyframes(maskStream, &addKeyInfo);

// Add keyframe at time
keyframeSuite->AEGP_AddKeyframes(addKeyInfo, time, &keyIndex);

// Set keyframe value
AEGP_StreamVal2 streamVal;
// ... populate streamVal with mask outline data ...
keyframeSuite->AEGP_SetAddKeyframe(addKeyInfo, keyIndex, &streamVal);

// End session (commits to undo stack)
keyframeSuite->AEGP_EndAddKeyframes(TRUE, addKeyInfo);
```

### Temporal vs Spatial Interpolation

| Interpolation Type | Controls | Properties |
|--------------------|----------|------------|
| Temporal | Ease in/out timing | Speed, influence |
| Spatial | Path between points | Tangent handles |

Mask path vertices have both:
- **Temporal tangents**: Timing curve between keyframes
- **Spatial tangents**: Shape of the bezier path

### Path Animation Vertex Mapping

When animating between keyframe shapes:
1. AE assigns first vertex as topmost vertex at initial keyframe
2. Vertices numbered in ascending order from first
3. Same numbering applies to all subsequent keyframes
4. Interpolation occurs between corresponding vertex numbers

> **TIP**: Ensure vertex count matches between keyframes for predictable animation.

### Smart Mask Interpolation

After Effects provides "Smart Mask Interpolation" for complex path morphing:
- Creates intermediate keyframes automatically
- Settings control interpolation quality
- Useful for organic shape transitions

---

## Path Operations

### Boolean Operations

After Effects provides boolean path operations through the **Merge Paths** operator in shape layers:

| Mode | Operation | Description |
|------|-----------|-------------|
| Add | Union | Encompasses all areas |
| Subtract | Difference | Topmost minus underlying |
| Intersect | Intersection | Only overlapping areas |
| Exclude Intersections | XOR | Union minus intersections |

> **Note**: Boolean operations are not directly exposed in the SDK. They operate at the shape layer level, not on individual mask paths.

### Path Operations via Shape Layers

To perform boolean operations programmatically:
1. Create shape layer with multiple paths
2. Add Merge Paths operator
3. Set merge mode
4. Access resulting path via shape stream

### Tracking Data and Paths

Motion tracking data can be applied to mask paths through:

1. **Expressions** - Link mask path vertices to tracker position
2. **Copy/Paste** - Paste tracker keyframes to mask path
3. **TrackerViz-style** - Convert track points to animated mask vertices

SDK access to tracking data:
- Track points exist as layer properties
- Access via `AEGP_StreamSuite` dynamic streams
- Property group: "Motion Trackers" → Tracker → Track Points

---

## Code Examples

### Example 1: Enumerate All Masks on a Layer

```cpp
A_Err EnumerateLayerMasks(AEGP_LayerH layerH)
{
    A_Err err = A_Err_NONE;
    A_long numMasks;

    // Get mask count
    ERR(maskSuite->AEGP_GetLayerNumMasks(layerH, &numMasks));

    for (A_long i = 0; i < numMasks && !err; i++) {
        AEGP_MaskRefH maskH;
        ERR(maskSuite->AEGP_GetLayerMaskByIndex(layerH, i, &maskH));

        if (!err) {
            // Get mask properties
            PF_MaskMode mode;
            A_Boolean inverted;

            ERR(maskSuite->AEGP_GetMaskMode(maskH, &mode));
            ERR(maskSuite->AEGP_GetMaskInvert(maskH, &inverted));

            // Process mask...

            // Always dispose
            ERR(maskSuite->AEGP_DisposeMask(maskH));
        }
    }

    return err;
}
```

### Example 2: Read Mask Outline Vertices

```cpp
A_Err ReadMaskVertices(AEGP_MaskOutlineValH outlineH)
{
    A_Err err = A_Err_NONE;
    A_long numSegments;

    ERR(outlineSuite->AEGP_GetMaskOutlineNumSegments(outlineH, &numSegments));

    // For closed paths: vertex[0] == vertex[numSegments]
    // For open paths: numSegments vertices total

    A_Boolean isOpen;
    ERR(outlineSuite->AEGP_IsMaskOutlineOpen(outlineH, &isOpen));

    A_long numVertices = isOpen ? numSegments : numSegments + 1;

    for (A_long v = 0; v < numVertices && !err; v++) {
        AEGP_MaskVertex vertex;

        ERR(outlineSuite->AEGP_GetMaskOutlineVertexInfo(
            outlineH, v, &vertex));

        if (!err) {
            // vertex.x, vertex.y = position
            // vertex.tan_in_x, tan_in_y = incoming tangent
            // vertex.tan_out_x, tan_out_y = outgoing tangent

            // Note: For vertex 0, tan_in sets tan_out of last vertex
        }
    }

    return err;
}
```

### Example 3: Create a Rectangular Mask

```cpp
A_Err CreateRectangleMask(
    AEGP_LayerH layerH,
    A_FloatRect bounds)
{
    A_Err err = A_Err_NONE;
    AEGP_MaskRefH maskH;
    A_long maskIndex;

    // Create new mask (starts with 0 vertices)
    ERR(maskSuite->AEGP_CreateNewMask(layerH, &maskH, &maskIndex));

    if (!err) {
        // Set mask mode
        ERR(maskSuite->AEGP_SetMaskMode(maskH, PF_MaskMode_ADD));

        // Get mask outline stream
        AEGP_StreamRefH outlineStream;
        ERR(streamSuite->AEGP_GetNewMaskStream(
            aegp_id, maskH, AEGP_MaskStream_OUTLINE, &outlineStream));

        if (!err) {
            // Get current stream value
            AEGP_StreamVal2 streamVal;
            A_Time time = {0, 1};

            ERR(streamSuite->AEGP_GetNewStreamValue(
                aegp_id, outlineStream,
                AEGP_LTimeMode_LayerTime, &time, FALSE,
                &streamVal));

            if (!err) {
                AEGP_MaskOutlineValH outlineH = streamVal.val.mask;

                // Add 4 vertices for rectangle
                AEGP_MaskVertex vertices[4] = {
                    {bounds.left, bounds.top, 0,0, 0,0},      // Top-left
                    {bounds.right, bounds.top, 0,0, 0,0},     // Top-right
                    {bounds.right, bounds.bottom, 0,0, 0,0},  // Bottom-right
                    {bounds.left, bounds.bottom, 0,0, 0,0}    // Bottom-left
                };

                for (A_long i = 0; i < 4; i++) {
                    ERR(outlineSuite->AEGP_CreateVertex(outlineH, i));
                    ERR(outlineSuite->AEGP_SetMaskOutlineVertexInfo(
                        outlineH, i, &vertices[i]));
                }

                // Close the path
                ERR(outlineSuite->AEGP_SetMaskOutlineOpen(outlineH, FALSE));

                // Set the stream value
                ERR(streamSuite->AEGP_SetStreamValue(
                    aegp_id, outlineStream, &streamVal));

                // Dispose stream value
                ERR(streamSuite->AEGP_DisposeStreamValue(&streamVal));
            }

            ERR(streamSuite->AEGP_DisposeStream(outlineStream));
        }

        ERR(maskSuite->AEGP_DisposeMask(maskH));
    }

    return err;
}
```

### Example 4: Effect Path Access

```cpp
A_Err ProcessLayerPaths(PF_InData *in_data)
{
    A_Err err = A_Err_NONE;
    A_long numPaths;

    // Get path count from source layer
    ERR(pathQuerySuite->PF_NumPaths(in_data->effect_ref, &numPaths));

    for (A_long p = 0; p < numPaths && !err; p++) {
        PF_PathID pathID;
        PF_PathOutlinePtr pathPtr = NULL;

        // Get path identifier
        ERR(pathQuerySuite->PF_PathInfo(
            in_data->effect_ref, p, &pathID));

        // Checkout path at current time
        ERR(pathQuerySuite->PF_CheckoutPath(
            in_data->effect_ref,
            pathID,
            in_data->current_time,
            in_data->time_step,
            in_data->time_scale,
            &pathPtr));

        if (!err && pathPtr) {
            // Get path info
            A_Boolean isOpen;
            A_long numSegments;

            ERR(pathDataSuite->PF_PathIsOpen(
                in_data->effect_ref, pathPtr, &isOpen));
            ERR(pathDataSuite->PF_PathNumSegments(
                in_data->effect_ref, pathPtr, &numSegments));

            // Iterate vertices
            for (A_long v = 0; v <= numSegments && !err; v++) {
                PF_PathVertex vertex;

                ERR(pathDataSuite->PF_PathVertexInfo(
                    in_data->effect_ref, pathPtr, v, &vertex));

                // Use vertex data...
            }

            // ALWAYS checkin
            ERR(pathQuerySuite->PF_CheckinPath(
                in_data->effect_ref, pathID, FALSE, pathPtr));
        }
    }

    return err;
}
```

### Example 5: Segment Length Evaluation

```cpp
A_Err EvaluateAlongPath(
    PF_InData *in_data,
    PF_PathOutlinePtr pathPtr,
    PF_FpLong normalizedLength,  // 0.0 to 1.0 along entire path
    PF_FpLong *outX,
    PF_FpLong *outY)
{
    A_Err err = A_Err_NONE;
    A_long numSegments;

    ERR(pathDataSuite->PF_PathNumSegments(
        in_data->effect_ref, pathPtr, &numSegments));

    if (numSegments == 0) return err;

    // Calculate total path length
    PF_FpLong totalLength = 0;
    PF_FpLong *segLengths = new PF_FpLong[numSegments];

    for (A_long s = 0; s < numSegments && !err; s++) {
        PF_PathSegPrepPtr prepPtr;

        ERR(pathDataSuite->PF_PathPrepareSegLength(
            in_data->effect_ref, pathPtr, s, 100, &prepPtr));

        ERR(pathDataSuite->PF_PathGetSegLength(
            in_data->effect_ref, pathPtr, s, &segLengths[s]));

        totalLength += segLengths[s];
    }

    // Find target length
    PF_FpLong targetLength = normalizedLength * totalLength;
    PF_FpLong accumulated = 0;

    for (A_long s = 0; s < numSegments && !err; s++) {
        if (accumulated + segLengths[s] >= targetLength) {
            // Target is in this segment
            PF_FpLong segOffset = targetLength - accumulated;

            PF_PathSegPrepPtr prepPtr;
            ERR(pathDataSuite->PF_PathPrepareSegLength(
                in_data->effect_ref, pathPtr, s, 100, &prepPtr));

            ERR(pathDataSuite->PF_PathEvalSegLength(
                in_data->effect_ref, pathPtr, prepPtr,
                segOffset, outX, outY));

            break;
        }
        accumulated += segLengths[s];
    }

    delete[] segLengths;
    return err;
}
```

---

## Best Practices

### Memory Management

1. **Always dispose handles**: Every `AEGP_MaskRefH` must be disposed
2. **Balance checkouts**: Every `PF_CheckoutPath` needs `PF_CheckinPath`
3. **Dispose streams**: Release stream handles when done
4. **Don't cache opaque handles**: They may become invalid

### Threading Considerations

1. Path/mask operations must occur on main thread
2. Checkout paths during render for thread-safe access
3. Don't hold checkouts across frames

### Performance

1. Minimize checkout/checkin cycles
2. Cache path data if accessing multiple times in same frame
3. Use `PF_PathPrepareSegLength` once per segment for multiple evaluations

### Effect Dependencies

When effects depend on masks:
```cpp
// Set output flag to indicate mask dependency
out_data->out_flags2 |= PF_OutFlag2_DEPENDS_ON_UNREFERENCED_MASKS;
```

### Error Handling Pattern

```cpp
#define ERR(FUNC) do { \
    if (!err) { \
        err = (FUNC); \
    } \
} while(0)

// Usage
ERR(maskSuite->AEGP_GetLayerNumMasks(layerH, &numMasks));
ERR(maskSuite->AEGP_GetLayerMaskByIndex(layerH, 0, &maskH));
if (err) {
    // Handle error, cleanup acquired resources
}
```

---

## References

### Official Documentation
- [AEGP Suites - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Working With Paths - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-details/working-with-paths/)
- [Data Types - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/aegps/data-types/)

### SDK Headers
- `AE_Effect.h` - PF_MaskMode, PF_PathID, PF_PathVertex
- `AE_EffectSuites.h` - PF_PathQuerySuite1, PF_PathDataSuite1
- `AE_GeneralPlug.h` - AEGP mask suites

### Related Topics
- [Cheating Effect Usage of AEGP Suites](https://ae-plugins.docsforadobe.dev/aegps/cheating-effect-usage-of-aegp-suites/)
- [A Primer on Bezier Curves](https://pomax.github.io/bezierinfo/)
- [Shape Object Scripting Reference](https://ae-scripting.docsforadobe.dev/other/shape/)

---

*Document generated from deep research synthesis*
*Sources: Adobe After Effects SDK documentation, GitHub SDK headers, Adobe Community forums*
