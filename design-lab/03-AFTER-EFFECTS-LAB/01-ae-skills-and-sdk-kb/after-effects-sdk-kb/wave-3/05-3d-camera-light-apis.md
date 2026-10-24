---
source: '[unknown - 05-3d-camera-light-apis.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 3D Layer, Camera, and Light APIs in Adobe After Effects SDK

## Executive Summary

This document provides comprehensive documentation of the 3D layer, Camera, and Light APIs in the Adobe After Effects SDK. It covers the AEGP_CameraSuite, AEGP_LightSuite, 3D layer properties, coordinate systems, matrix transformations, and the interaction between Artisan plugins and the 3D system.

---

## Table of Contents

1. [Overview](#overview)
2. [Camera API Reference](#camera-api-reference)
3. [Light API Reference](#light-api-reference)
4. [3D Layer Properties and Streams](#3d-layer-properties-and-streams)
5. [Coordinate Systems and Spaces](#coordinate-systems-and-spaces)
6. [Matrix Transformations](#matrix-transformations)
7. [Layer-to-World Transformations](#layer-to-world-transformations)
8. [Artisan 3D Integration](#artisan-3d-integration)
9. [Code Examples](#code-examples)
10. [Best Practices](#best-practices)

---

## Overview

After Effects provides robust 3D capabilities through its SDK, enabling plugin developers to:

- Access and manipulate camera properties
- Query and modify light parameters
- Transform between coordinate spaces
- Build custom 3D renderers (Artisans)
- Access layer transformation matrices

### Key Handles and Types

| Type | Purpose |
|------|---------|
| `AEGP_LayerH` | Layer handle (cameras, lights, 3D layers) |
| `AEGP_CameraH` | Camera-specific handle (deprecated - use LayerH) |
| `AEGP_LightH` | Light-specific handle (deprecated - use LayerH) |
| `A_Matrix4` | 4x4 transformation matrix |
| `AEGP_RenderLayerContextH` | Render context for Artisans |
| `PR_RenderContextH` | Collection of render settings |

### Important Flags

Effects that use 3D camera or light information must set these flags:

```c
PF_OutFlag2_I_USE_3D_CAMERA    // Effect uses camera information
PF_OutFlag2_I_USE_3D_LIGHTS    // Effect uses light information
```

These flags influence After Effects' caching decisions and ensure proper invalidation when camera/light properties change.

---

## Camera API Reference

### AEGP_CameraSuite2

The Camera Suite provides functions for querying and modifying camera properties.

**Suite Access:**
```c
#define kAEGPCameraSuite        "AEGP Camera Suite"
#define kAEGPCameraSuiteVersion2 2

AEGP_CameraSuite2 *cameraSuite;
AEFX_AcquireSuite(in_data, out_data, kAEGPCameraSuite,
                  kAEGPCameraSuiteVersion2, NULL, (void**)&cameraSuite);
```

### Camera Types

```c
typedef enum {
    AEGP_CameraType_NONE = -1,
    AEGP_CameraType_PERSPECTIVE,
    AEGP_CameraType_ORTHOGRAPHIC,
    AEGP_CameraType_NUM_TYPES
} AEGP_CameraType;
```

| Type | Description |
|------|-------------|
| `AEGP_CameraType_PERSPECTIVE` | Standard perspective projection with vanishing points |
| `AEGP_CameraType_ORTHOGRAPHIC` | Parallel projection without perspective distortion |
| `AEGP_CameraType_NONE` | Invalid or no camera |

### Camera Suite Functions

#### AEGP_GetCamera

Retrieves the active camera at a specified time.

```c
A_Err AEGP_GetCamera(
    AEGP_RenderLayerContextH  render_contextH,    // IN: Render context
    const A_Time              *comp_timeP,        // IN: Composition time
    AEGP_LayerH               *camera_layerPH     // OUT: Camera layer handle
);
```

#### AEGP_GetCameraType

Returns the camera projection type.

```c
A_Err AEGP_GetCameraType(
    AEGP_LayerH        camera_layerH,    // IN: Camera layer
    AEGP_CameraType    *camera_typeP     // OUT: Camera type
);
```

#### AEGP_GetDefaultCameraDistanceToImagePlane

Gets the default distance from camera to image plane.

```c
A_Err AEGP_GetDefaultCameraDistanceToImagePlane(
    AEGP_CompH    compH,              // IN: Composition
    A_FpLong      *distanceP          // OUT: Distance in pixels
);
```

#### AEGP_GetCameraFilmSize

Retrieves camera film dimensions.

```c
A_Err AEGP_GetCameraFilmSize(
    AEGP_LayerH        camera_layerH,    // IN: Camera layer
    A_FpLong           *film_widthP,     // OUT: Film width in pixels
    A_FpLong           *film_heightP     // OUT: Film height in pixels
);
```

**Film Size Conversion Formula:**
```
pixels = millimeters × 72 ÷ 25.4
millimeters = pixels × 25.4 ÷ 72
```

#### AEGP_SetCameraFilmSize

Modifies camera film size.

```c
A_Err AEGP_SetCameraFilmSize(
    AEGP_LayerH    camera_layerH,    // IN: Camera layer
    A_FpLong       film_width,       // IN: Film width in pixels
    A_FpLong       film_height       // IN: Film height in pixels
);
```

### Camera Layer Streams

Camera-specific properties accessed via `AEGP_GetLayerStreamValue`:

| Stream Constant | Type | Description |
|-----------------|------|-------------|
| `AEGP_LayerStream_ZOOM` | `A_FpLong` | Camera zoom level |
| `AEGP_LayerStream_DEPTH_OF_FIELD` | `A_Boolean` | DOF enabled flag |
| `AEGP_LayerStream_FOCUS_DISTANCE` | `A_FpLong` | Focus distance in pixels |
| `AEGP_LayerStream_APERTURE` | `A_FpLong` | Aperture size |
| `AEGP_LayerStream_BLUR_LEVEL` | `A_FpLong` | DOF blur percentage |

### Camera Layer Flags

```c
AEGP_LayerFlag_LOOK_AT_POI        // Camera looks at point of interest
AEGP_LayerFlag_AUTO_ORIENT_ROTATION  // Camera auto-orients
```

**Setting One-Node vs Two-Node Camera:**
```c
// For One-Node camera (free rotation)
suites.LayerSuite9()->AEGP_SetLayerFlag(camera_layerH,
    AEGP_LayerFlag_LOOK_AT_POI, FALSE);

// For Two-Node camera (looks at POI)
suites.LayerSuite9()->AEGP_SetLayerFlag(camera_layerH,
    AEGP_LayerFlag_LOOK_AT_POI, TRUE);
```

### Creating Cameras

Cameras are created using `AEGP_CompSuite`:

```c
A_Err AEGP_CreateCameraInComp(
    AEGP_CompH         compH,           // IN: Target composition
    const A_UTF16Char  *nameP,          // IN: Camera name (UTF-16)
    A_FloatPoint       center_point,    // IN: Initial position
    AEGP_LayerH        *new_cameraHP    // OUT: New camera layer
);
```

**Note:** Cameras have no source, thus no `AEGP_ItemH`.

---

## Light API Reference

### AEGP_LightSuite2

The Light Suite provides functions for querying and modifying light properties.

**Suite Access:**
```c
#define kAEGPLightSuite          "AEGP Light Suite"
#define kAEGPLightSuiteVersion1  1
#define kAEGPLightSuiteVersion2  2

AEGP_LightSuite2 *lightSuite;
AEFX_AcquireSuite(in_data, out_data, kAEGPLightSuite,
                  kAEGPLightSuiteVersion2, NULL, (void**)&lightSuite);
```

### Light Types

```c
typedef enum {
    AEGP_LightType_NONE = -1,
    AEGP_LightType_PARALLEL,
    AEGP_LightType_SPOT,
    AEGP_LightType_POINT,
    AEGP_LightType_AMBIENT,
    AEGP_LightType_NUM_TYPES
} AEGP_LightType;
```

| Type | Description | Shadows | Falloff |
|------|-------------|---------|---------|
| `AEGP_LightType_PARALLEL` | Directional light from infinite distance (like sun) | Yes | No |
| `AEGP_LightType_SPOT` | Cone-constrained light (like flashlight) | Yes | Yes |
| `AEGP_LightType_POINT` | Omnidirectional light (like bare bulb) | Yes | Yes |
| `AEGP_LightType_AMBIENT` | Global illumination, no source | No | No |

### Light Falloff Types

```c
typedef enum {
    AEGP_LightFalloff_NONE,
    AEGP_LightFalloff_SMOOTH,
    AEGP_LightFalloff_INVERSE_SQUARE_CLAMPED,
    AEGP_LightFalloff_NUM_TYPES
} AEGP_LightFalloffType;
```

| Falloff Type | Description |
|--------------|-------------|
| `AEGP_LightFalloff_NONE` | No intensity decrease with distance |
| `AEGP_LightFalloff_SMOOTH` | Linear falloff from start radius |
| `AEGP_LightFalloff_INVERSE_SQUARE_CLAMPED` | Physically accurate inverse-square falloff |

### Light Suite Functions

#### AEGP_GetLightType

```c
A_Err AEGP_GetLightType(
    AEGP_LayerH       light_layerH,    // IN: Light layer
    AEGP_LightType    *light_typeP     // OUT: Light type
);
```

#### AEGP_SetLightType

```c
A_Err AEGP_SetLightType(
    AEGP_LayerH       light_layerH,    // IN: Light layer
    AEGP_LightType    light_type       // IN: New light type
);
```

### Light Layer Streams

Light-specific properties accessed via `AEGP_GetLayerStreamValue`:

| Stream Constant | Type | Description |
|-----------------|------|-------------|
| `AEGP_LayerStream_INTENSITY` | `A_FpLong` | Light intensity (0-100+) |
| `AEGP_LayerStream_COLOR` | `AEGP_ColorVal` | Light color (RGBA) |
| `AEGP_LayerStream_CONE_ANGLE` | `A_FpLong` | Spot light cone angle (degrees) |
| `AEGP_LayerStream_CONE_FEATHER` | `A_FpLong` | Spot light edge softness |
| `AEGP_LayerStream_SHADOW_DARKNESS` | `A_FpLong` | Shadow opacity (0-100) |
| `AEGP_LayerStream_SHADOW_DIFFUSION` | `A_FpLong` | Shadow softness |

### Additional Light Properties (via Dynamic Streams)

| Property | Description |
|----------|-------------|
| Falloff Type | None/Smooth/Inverse Square Clamped |
| Falloff Start | Distance where falloff begins |
| Falloff Distance | Range of falloff effect |
| Casts Shadows | Boolean shadow enable |

### Creating Lights

```c
A_Err AEGP_CreateLightInComp(
    AEGP_CompH         compH,           // IN: Target composition
    const A_UTF16Char  *nameP,          // IN: Light name (UTF-16)
    A_FloatPoint       center_point,    // IN: Initial position
    AEGP_LayerH        *new_lightHP     // OUT: New light layer
);
```

---

## 3D Layer Properties and Streams

### Object Types

```c
typedef enum {
    AEGP_ObjectType_NONE = -1,
    AEGP_ObjectType_AV,           // Audio/Visual layer
    AEGP_ObjectType_CAMERA,       // Camera layer
    AEGP_ObjectType_LIGHT,        // Light layer
    AEGP_ObjectType_TEXT,         // Text layer
    AEGP_ObjectType_3D_MODEL,     // 3D model layer (AE 25.2+)
    AEGP_ObjectType_NUM_TYPES
} AEGP_ObjectType;
```

**Checking Layer Object Type:**
```c
AEGP_ObjectType objectType;
suites.LayerSuite9()->AEGP_GetLayerObjectType(layerH, &objectType);

if (objectType == AEGP_ObjectType_CAMERA) {
    // Handle camera
} else if (objectType == AEGP_ObjectType_LIGHT) {
    // Handle light
}
```

### Common Transform Streams (All 3D Layers)

| Stream Constant | Type | Description |
|-----------------|------|-------------|
| `AEGP_LayerStream_ANCHORPOINT` | `A_FloatPoint3` | Layer anchor point |
| `AEGP_LayerStream_POSITION` | `A_FloatPoint3` | Layer position |
| `AEGP_LayerStream_SCALE` | `A_FloatPoint3` | Layer scale (percentage) |
| `AEGP_LayerStream_ROTATION` | `A_FpLong` | 2D rotation (Z-axis) |
| `AEGP_LayerStream_ROTATE_X` | `A_FpLong` | 3D X rotation |
| `AEGP_LayerStream_ROTATE_Y` | `A_FpLong` | 3D Y rotation |
| `AEGP_LayerStream_ROTATE_Z` | `A_FpLong` | 3D Z rotation |
| `AEGP_LayerStream_ORIENTATION` | `A_FloatPoint3` | Quaternion-based orientation |
| `AEGP_LayerStream_OPACITY` | `A_FpLong` | Layer opacity |

### 3D Material Properties (AV Layers)

| Stream Constant | Type | Description |
|-----------------|------|-------------|
| `AEGP_LayerStream_AMBIENT_COEFF` | `A_FpLong` | Ambient reflection coefficient |
| `AEGP_LayerStream_DIFFUSE_COEFF` | `A_FpLong` | Diffuse reflection coefficient |
| `AEGP_LayerStream_SPECULAR_INTENSITY` | `A_FpLong` | Specular highlight intensity |
| `AEGP_LayerStream_SPECULAR_SHININESS` | `A_FpLong` | Specular shininess exponent |
| `AEGP_LayerStream_METAL` | `A_FpLong` | Metallic appearance amount |

### Layer Flags for 3D

```c
AEGP_LayerFlag_LAYER_IS_3D           // Layer is 3D
AEGP_LayerFlag_ENVIRONMENT_LAYER     // Environment layer (CS6+)
AEGP_LayerFlag_LOOK_AT_POI           // Looks at point of interest
AEGP_LayerFlag_AUTO_ORIENT_ROTATION  // Auto-orient to path
```

### Checking 3D Status

```c
A_Boolean is3D;
suites.LayerSuite9()->AEGP_IsLayer3D(layerH, &is3D);

// Alternative using flags
AEGP_LayerFlags flags;
suites.LayerSuite9()->AEGP_GetLayerFlags(layerH, &flags);
A_Boolean is3D = (flags & AEGP_LayerFlag_LAYER_IS_3D) != 0;
```

---

## Coordinate Systems and Spaces

### After Effects Coordinate System

**Origin:** Upper-left corner of composition

| Axis | Positive Direction |
|------|-------------------|
| X | Right |
| Y | Down |
| Z | Into screen (away from viewer) |

**Rotation Order:** X, then Y, then Z

**Comparison with OpenGL:**

| Aspect | After Effects | OpenGL |
|--------|---------------|--------|
| Origin | Upper-left | Center |
| Y-axis | Down (+Y) | Up (+Y) |
| Z-axis | Into screen (+Z) | Out of screen (+Z) |
| Rotation | X→Y→Z | Varies |

### Transform Spaces

```c
typedef enum {
    AEGP_Query_Xform_LAYER,     // Layer local space
    AEGP_Query_Xform_WORLD,     // Composition world space
    AEGP_Query_Xform_VIEW,      // Camera view space
    AEGP_Query_Xform_SCREEN     // Screen/output space
} AEGP_QueryXformType;
```

| Space | Description |
|-------|-------------|
| Layer | Local to the layer, centered at anchor point |
| World | Composition coordinate space |
| View | Camera's coordinate space (eye space) |
| Screen | 2D output pixel coordinates |

### Conversion Between OpenGL and After Effects

```c
// AE to OpenGL coordinate conversion
void ConvertAEtoOpenGL(A_Matrix4 *ae_matrix, float *gl_matrix) {
    // AE matrices are row-major, OpenGL is column-major
    // AE has Y-down, OpenGL has Y-up
    // AE has Z-in, OpenGL has Z-out

    // Transpose matrix
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            gl_matrix[j * 4 + i] = ae_matrix->mat[i][j];
        }
    }

    // Flip Y and Z axes
    for (int i = 0; i < 4; i++) {
        gl_matrix[4 + i] *= -1.0f;  // Flip Y row
        gl_matrix[8 + i] *= -1.0f;  // Flip Z row
    }
}
```

---

## Matrix Transformations

### A_Matrix4 Structure

```c
typedef struct {
    A_FpLong mat[4][4];
} A_Matrix4;
```

**Matrix Layout (Row-Major):**
```
| m00  m01  m02  m03 |   | Xx  Xy  Xz  0  |
| m10  m11  m12  m13 | = | Yx  Yy  Yz  0  |
| m20  m21  m22  m23 |   | Zx  Zy  Zz  0  |
| m30  m31  m32  m33 |   | Tx  Ty  Tz  1  |
```

- Row 0-2: Rotation/Scale
- Row 3: Translation
- Column 3: Typically (0, 0, 0, 1)

### AEGP_MathSuite1

**Suite Access:**
```c
AEGP_MathSuite1 *mathSuite;
AEFX_AcquireSuite(in_data, out_data, kAEGPMathSuite,
                  kAEGPMathSuiteVersion1, NULL, (void**)&mathSuite);
```

#### AEGP_MatrixMultiply4

Multiplies two 4x4 matrices.

```c
A_Err AEGP_MatrixMultiply4(
    const A_Matrix4    *matrix_aP,     // IN: First matrix
    const A_Matrix4    *matrix_bP,     // IN: Second matrix
    A_Matrix4          *resultP        // OUT: Result (A * B)
);
```

#### AEGP_MatrixDecompose4

Decomposes matrix into position, scale, shear, and rotation.

```c
A_Err AEGP_MatrixDecompose4(
    const A_Matrix4    *matrixP,       // IN: Matrix to decompose
    A_FloatPoint3      *positionP,     // OUT: Translation
    A_FloatPoint3      *scaleP,        // OUT: Scale factors
    A_FloatPoint3      *shearP,        // OUT: Shear values
    A_FloatPoint3      *rotationP      // OUT: Rotation (radians, XYZ)
);
```

### Custom Matrix Functions

```c
// Initialize identity matrix
void IdentityMatrix4(A_Matrix4 *matrix) {
    memset(matrix, 0, sizeof(A_Matrix4));
    matrix->mat[0][0] = 1.0;
    matrix->mat[1][1] = 1.0;
    matrix->mat[2][2] = 1.0;
    matrix->mat[3][3] = 1.0;
}

// Apply translation
void TranslateMatrix4(A_Matrix4 *matrix, A_FpLong x, A_FpLong y, A_FpLong z) {
    matrix->mat[3][0] += x;
    matrix->mat[3][1] += y;
    matrix->mat[3][2] += z;
}

// Apply scale
void ScaleMatrix4(A_Matrix4 *matrix, A_FpLong sx, A_FpLong sy, A_FpLong sz) {
    for (int i = 0; i < 4; i++) {
        matrix->mat[0][i] *= sx;
        matrix->mat[1][i] *= sy;
        matrix->mat[2][i] *= sz;
    }
}

// Transpose matrix
void TransposeMatrix4(const A_Matrix4 *src, A_Matrix4 *dst) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            dst->mat[j][i] = src->mat[i][j];
        }
    }
}

// Transform point
void TransformPoint4(const A_Matrix4 *matrix,
                     const A_FloatPoint3 *src,
                     A_FloatPoint3 *dst) {
    A_FpLong w;

    dst->x = src->x * matrix->mat[0][0] +
             src->y * matrix->mat[1][0] +
             src->z * matrix->mat[2][0] +
             matrix->mat[3][0];

    dst->y = src->x * matrix->mat[0][1] +
             src->y * matrix->mat[1][1] +
             src->z * matrix->mat[2][1] +
             matrix->mat[3][1];

    dst->z = src->x * matrix->mat[0][2] +
             src->y * matrix->mat[1][2] +
             src->z * matrix->mat[2][2] +
             matrix->mat[3][2];

    w = src->x * matrix->mat[0][3] +
        src->y * matrix->mat[1][3] +
        src->z * matrix->mat[2][3] +
        matrix->mat[3][3];

    // Normalize by W
    if (w != 0 && w != 1.0) {
        dst->x /= w;
        dst->y /= w;
        dst->z /= w;
    }
}
```

---

## Layer-to-World Transformations

### AEGP_LayerSuite9 Transform Functions

#### AEGP_GetLayerToWorldXform

Gets the complete layer-to-world transformation matrix, including all parent transforms.

```c
A_Err AEGP_GetLayerToWorldXform(
    AEGP_LayerH       layerH,         // IN: Layer handle
    const A_Time      *comp_timeP,    // IN: Time in composition
    A_Matrix4         *transform      // OUT: Layer-to-world matrix
);
```

**Usage Example:**
```c
A_Matrix4 layer2WorldMat;
A_Time comp_time = {in_data->current_time, in_data->time_scale};

suites.LayerSuite9()->AEGP_GetLayerToWorldXform(
    layerH, &comp_time, &layer2WorldMat);

// Decompose to get position, scale, rotation
A_FloatPoint3 position, scale, shear, rotation;
suites.MathSuite1()->AEGP_MatrixDecompose4(
    &layer2WorldMat, &position, &scale, &shear, &rotation);
```

#### AEGP_GetLayerToWorldXformFromView

Returns transformation accounting for camera view and aspect ratio correction.

```c
A_Err AEGP_GetLayerToWorldXformFromView(
    AEGP_LayerH       layerH,         // IN: Layer handle
    const A_Time      *view_timeP,    // IN: View (camera) time
    const A_Time      *comp_timeP,    // IN: Composition time
    A_Matrix4         *transform      // OUT: Transform matrix
);
```

### AEGP_PFInterfaceSuite Functions

For effects accessing camera/light data:

#### AEGP_GetEffectCameraMatrix

Gets camera matrix including all parenting.

```c
A_Err AEGP_GetEffectCameraMatrix(
    AEGP_EffectRefH   effect_refH,    // IN: Effect reference
    const A_Time      *comp_timeP,    // IN: Composition time
    A_Matrix4         *matrixP,       // OUT: Camera matrix
    A_FpLong          *focal_lengthP, // OUT: Focal length
    A_short           *comp_widthP,   // OUT: Comp width
    A_short           *comp_heightP   // OUT: Comp height
);
```

**Usage:**
```c
A_Matrix4 cameraMatrix;
A_FpLong focalLength;
A_short compWidth, compHeight;
A_Time compTime = {in_data->current_time, in_data->time_scale};

suites.PFInterfaceSuite1()->AEGP_ConvertEffectToCompTime(
    in_data->effect_ref, in_data->current_time, in_data->time_scale, &compTime);

suites.PFInterfaceSuite1()->AEGP_GetEffectCameraMatrix(
    in_data->effect_ref, &compTime,
    &cameraMatrix, &focalLength, &compWidth, &compHeight);

// Extract camera position from matrix (translation row)
A_FloatPoint3 cameraPos;
cameraPos.x = cameraMatrix.mat[3][0];
cameraPos.y = cameraMatrix.mat[3][1];
cameraPos.z = cameraMatrix.mat[3][2];
```

#### AEGP_GetEffectCamera

Gets the camera layer for an effect.

```c
A_Err AEGP_GetEffectCamera(
    AEGP_EffectRefH   effect_refH,    // IN: Effect reference
    const A_Time      *comp_timeP,    // IN: Composition time
    AEGP_LayerH       *camera_layerP  // OUT: Camera layer handle
);
```

---

## Artisan 3D Integration

Artisans are specialized AEGP plugins that provide custom 3D rendering in After Effects.

### Artisan Registration

```c
A_Err AEGP_RegisterArtisan(
    AEGP_GlobalRefcon       plugin_refcon,
    AEGP_PluginID           plugin_id,
    const A_char            *nameZ,
    const A_char            *match_nameZ,
    PR_ArtisanEntryPoints   *entry_funcsP
);
```

### PR_ArtisanEntryPoints

```c
typedef struct {
    PR_GlobalSetupFunc         global_setup_func;      // Optional
    PR_GlobalSetdownFunc       global_setdown_func;    // Optional
    PR_GlobalDoAboutFunc       global_do_about_func;   // Optional
    PR_InstanceSetupFunc       instance_setup_func;    // Optional
    PR_InstanceSetdownFunc     instance_setdown_func;  // Optional
    PR_FlattenInstanceFunc     flatten_instance_func;  // Optional
    PR_InflateInstanceFunc     inflate_instance_func;  // Optional
    PR_RenderFunc              render_func;            // REQUIRED
    PR_InteractiveRenderFunc   interactive_render_func;// Optional
    PR_QueryFunc               query_func;             // Optional
} PR_ArtisanEntryPoints;
```

### AEGP_CanvasSuite8

Used by Artisans for rendering operations.

#### Key Functions

| Function | Description |
|----------|-------------|
| `AEGP_GetCompToRender` | Get composition handle from render context |
| `AEGP_GetNumLayersToRender` | Count of layers to render |
| `AEGP_GetNthLayerContextToRender` | Get specific layer context |
| `AEGP_RenderTexture` | Render raw layer pixels (no transforms) |
| `AEGP_RenderLayer` | Render layer with full pipeline |
| `AEGP_GetCompDestinationBuffer` | Get output buffer |
| `AEGP_GetRenderLayerToWorldXform` | Get layer's world transform |
| `AEGP_GetRenderLayerBounds` | Get layer bounding rectangle |

#### AEGP_RenderTexture

Supplies raw pixels of a layer, untransformed.

```c
A_Err AEGP_RenderTexture(
    AEGP_RenderLayerContextH   render_layer_contextH,
    AEGP_RenderHints           render_hints,
    A_FloatPoint               *suggested_scaleP,
    A_FloatRect                *suggested_src_rectP,
    A_Matrix3                  *src_matrixP,
    AEGP_WorldH                *dst_worldP
);
```

**Render Hints:**
```c
typedef enum {
    AEGP_RenderHints_NONE             = 0,
    AEGP_RenderHints_IGNORE_EXTENTS   = 1 << 0,
    AEGP_RenderHints_NO_TRANSFER_MODE = 1 << 1
} AEGP_RenderHints;
```

#### AEGP_RenderLayer

Invokes the full After Effects render pipeline.

```c
A_Err AEGP_RenderLayer(
    AEGP_RenderLayerContextH   render_layer_contextH,
    AEGP_RenderHints           render_hints,
    AEGP_WorldH                *dst_worldP
);
```

### AEGP_QueryXFormSuite2

Transform query functions for Artisans.

```c
A_Err AEGP_QueryXformGetSrcType(
    AEGP_QueryXformContextH    query_contextH,
    AEGP_QueryXformType        *src_typeP
);

A_Err AEGP_QueryXformGetDstType(
    AEGP_QueryXformContextH    query_contextH,
    AEGP_QueryXformType        *dst_typeP
);

A_Err AEGP_QueryXformGetLayer(
    AEGP_QueryXformContextH    query_contextH,
    AEGP_LayerH                *layerPH
);

A_Err AEGP_QueryXformGetCamera(
    AEGP_QueryXformContextH    query_contextH,
    AEGP_LayerH                *camera_layerPH
);

A_Err AEGP_QueryXformGetXform(
    AEGP_QueryXformContextH    query_contextH,
    A_Matrix4                  *xformP
);

A_Err AEGP_QueryXformSetXform(
    AEGP_QueryXformContextH    query_contextH,
    const A_Matrix4            *xformP
);
```

### Interactive Drawing (PR_InteractiveDrawProcs)

```c
typedef void (*PR_Draw_MoveToFunc)(short x, short y);
typedef void (*PR_Draw_LineToFunc)(short x, short y);
typedef void (*PR_Draw_ForeColorFunc)(const A_Color *fore_color);
typedef void (*PR_Draw_FrameRectFunc)(const A_Rect *rectPR);
typedef void (*PR_Draw_PaintRectFunc)(const A_Rect *rectPR);
```

---

## Code Examples

### Example 1: Accessing Camera Properties

```c
static A_Err GetCameraInfo(
    PF_InData        *in_data,
    PF_OutData       *out_data,
    CameraInfo       *camera_info)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(in_data->pica_basicP);

    AEGP_LayerH camera_layerH = NULL;
    A_Time comp_time;

    // Convert effect time to composition time
    ERR(suites.PFInterfaceSuite1()->AEGP_ConvertEffectToCompTime(
        in_data->effect_ref,
        in_data->current_time,
        in_data->time_scale,
        &comp_time));

    // Get camera layer
    ERR(suites.PFInterfaceSuite1()->AEGP_GetEffectCamera(
        in_data->effect_ref, &comp_time, &camera_layerH));

    if (!err && camera_layerH) {
        // Get camera type
        AEGP_CameraType camera_type;
        ERR(suites.CameraSuite2()->AEGP_GetCameraType(
            camera_layerH, &camera_type));
        camera_info->type = camera_type;

        // Get camera matrix (includes parenting)
        A_Matrix4 camera_matrix;
        A_FpLong focal_length;
        A_short comp_w, comp_h;

        ERR(suites.PFInterfaceSuite1()->AEGP_GetEffectCameraMatrix(
            in_data->effect_ref, &comp_time,
            &camera_matrix, &focal_length, &comp_w, &comp_h));

        camera_info->focal_length = focal_length;

        // Extract position from matrix
        camera_info->position.x = camera_matrix.mat[3][0];
        camera_info->position.y = camera_matrix.mat[3][1];
        camera_info->position.z = camera_matrix.mat[3][2];

        // Get camera-specific streams
        AEGP_StreamVal2 stream_val;
        AEGP_StreamType stream_type;

        // Zoom
        ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
            camera_layerH, AEGP_LayerStream_ZOOM,
            AEGP_LTimeMode_CompTime, &comp_time, FALSE,
            &stream_val, &stream_type));
        camera_info->zoom = stream_val.one_d;

        // Depth of Field enabled
        ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
            camera_layerH, AEGP_LayerStream_DEPTH_OF_FIELD,
            AEGP_LTimeMode_CompTime, &comp_time, FALSE,
            &stream_val, &stream_type));
        camera_info->dof_enabled = stream_val.one_d != 0;

        // Focus Distance
        ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
            camera_layerH, AEGP_LayerStream_FOCUS_DISTANCE,
            AEGP_LTimeMode_CompTime, &comp_time, FALSE,
            &stream_val, &stream_type));
        camera_info->focus_distance = stream_val.one_d;

        // Aperture
        ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
            camera_layerH, AEGP_LayerStream_APERTURE,
            AEGP_LTimeMode_CompTime, &comp_time, FALSE,
            &stream_val, &stream_type));
        camera_info->aperture = stream_val.one_d;
    }

    return err;
}
```

### Example 2: Building Light Information

```c
static A_Err BuildLightInfo(
    AEGP_SuiteHandler  &suites,
    AEGP_LayerH        light_layerH,
    const A_Time       *comp_timeP,
    LightInfo          *light_info)
{
    A_Err err = A_Err_NONE;

    // Get light type
    ERR(suites.LightSuite2()->AEGP_GetLightType(
        light_layerH, &light_info->type));

    // Get light transform
    A_Matrix4 light_xform;
    ERR(suites.LayerSuite9()->AEGP_GetLayerToWorldXform(
        light_layerH, comp_timeP, &light_xform));

    // Extract position
    light_info->position.x = light_xform.mat[3][0];
    light_info->position.y = light_xform.mat[3][1];
    light_info->position.z = light_xform.mat[3][2];

    // Extract direction (Z-axis of rotation matrix)
    light_info->direction.x = light_xform.mat[2][0];
    light_info->direction.y = light_xform.mat[2][1];
    light_info->direction.z = light_xform.mat[2][2];

    // Get light streams
    AEGP_StreamVal2 stream_val;
    AEGP_StreamType stream_type;

    // Intensity
    ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
        light_layerH, AEGP_LayerStream_INTENSITY,
        AEGP_LTimeMode_CompTime, comp_timeP, FALSE,
        &stream_val, &stream_type));
    light_info->intensity = stream_val.one_d / 100.0;  // Normalize to 0-1

    // Color
    ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
        light_layerH, AEGP_LayerStream_COLOR,
        AEGP_LTimeMode_CompTime, comp_timeP, FALSE,
        &stream_val, &stream_type));
    light_info->color.red   = stream_val.color.redF;
    light_info->color.green = stream_val.color.greenF;
    light_info->color.blue  = stream_val.color.blueF;
    light_info->color.alpha = stream_val.color.alphaF;

    // Spot light specific properties
    if (light_info->type == AEGP_LightType_SPOT) {
        // Cone Angle
        ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
            light_layerH, AEGP_LayerStream_CONE_ANGLE,
            AEGP_LTimeMode_CompTime, comp_timeP, FALSE,
            &stream_val, &stream_type));
        light_info->cone_angle = stream_val.one_d;

        // Cone Feather
        ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
            light_layerH, AEGP_LayerStream_CONE_FEATHER,
            AEGP_LTimeMode_CompTime, comp_timeP, FALSE,
            &stream_val, &stream_type));
        light_info->cone_feather = stream_val.one_d;
    }

    // Shadow properties
    ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
        light_layerH, AEGP_LayerStream_SHADOW_DARKNESS,
        AEGP_LTimeMode_CompTime, comp_timeP, FALSE,
        &stream_val, &stream_type));
    light_info->shadow_darkness = stream_val.one_d / 100.0;

    ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
        light_layerH, AEGP_LayerStream_SHADOW_DIFFUSION,
        AEGP_LTimeMode_CompTime, comp_timeP, FALSE,
        &stream_val, &stream_type));
    light_info->shadow_diffusion = stream_val.one_d;

    return err;
}
```

### Example 3: Iterating Composition Lights

```c
static A_Err BuildSceneLights(
    AEGP_SuiteHandler  &suites,
    AEGP_CompH         compH,
    const A_Time       *comp_timeP,
    SceneLights        *scene_lights)
{
    A_Err err = A_Err_NONE;
    A_long num_layers;

    ERR(suites.LayerSuite9()->AEGP_GetCompNumLayers(compH, &num_layers));

    scene_lights->count = 0;

    for (A_long i = 0; i < num_layers && !err; i++) {
        AEGP_LayerH layerH;
        ERR(suites.LayerSuite9()->AEGP_GetCompLayerByIndex(compH, i, &layerH));

        if (!err) {
            // Check if layer is a light
            AEGP_ObjectType obj_type;
            ERR(suites.LayerSuite9()->AEGP_GetLayerObjectType(layerH, &obj_type));

            if (!err && obj_type == AEGP_ObjectType_LIGHT) {
                // Check if light is visible at this time
                A_Boolean video_active;
                ERR(suites.LayerSuite9()->AEGP_IsVideoActive(
                    layerH, AEGP_LTimeMode_CompTime, comp_timeP, &video_active));

                if (!err && video_active) {
                    // Build light info
                    ERR(BuildLightInfo(suites, layerH, comp_timeP,
                        &scene_lights->lights[scene_lights->count]));
                    scene_lights->count++;
                }
            }
        }
    }

    return err;
}
```

### Example 4: 3D Point Transformation

```c
static A_Err TransformPointLayerToWorld(
    AEGP_SuiteHandler  &suites,
    AEGP_LayerH        layerH,
    const A_Time       *comp_timeP,
    const A_FloatPoint3 *layer_pointP,
    A_FloatPoint3      *world_pointP)
{
    A_Err err = A_Err_NONE;
    A_Matrix4 layer_to_world;

    // Get layer-to-world transform
    ERR(suites.LayerSuite9()->AEGP_GetLayerToWorldXform(
        layerH, comp_timeP, &layer_to_world));

    if (!err) {
        // Transform point
        A_FpLong w;

        world_pointP->x = layer_pointP->x * layer_to_world.mat[0][0] +
                          layer_pointP->y * layer_to_world.mat[1][0] +
                          layer_pointP->z * layer_to_world.mat[2][0] +
                          layer_to_world.mat[3][0];

        world_pointP->y = layer_pointP->x * layer_to_world.mat[0][1] +
                          layer_pointP->y * layer_to_world.mat[1][1] +
                          layer_pointP->z * layer_to_world.mat[2][1] +
                          layer_to_world.mat[3][1];

        world_pointP->z = layer_pointP->x * layer_to_world.mat[0][2] +
                          layer_pointP->y * layer_to_world.mat[1][2] +
                          layer_pointP->z * layer_to_world.mat[2][2] +
                          layer_to_world.mat[3][2];

        w = layer_pointP->x * layer_to_world.mat[0][3] +
            layer_pointP->y * layer_to_world.mat[1][3] +
            layer_pointP->z * layer_to_world.mat[2][3] +
            layer_to_world.mat[3][3];

        // Perspective divide
        if (w != 0 && w != 1.0) {
            world_pointP->x /= w;
            world_pointP->y /= w;
            world_pointP->z /= w;
        }
    }

    return err;
}
```

### Example 5: Building Camera View Matrix for Rendering

```c
static A_Err BuildCameraViewMatrix(
    AEGP_SuiteHandler  &suites,
    AEGP_LayerH        camera_layerH,
    const A_Time       *comp_timeP,
    A_long             comp_width,
    A_long             comp_height,
    A_Matrix4          *view_matrixP)
{
    A_Err err = A_Err_NONE;
    A_Matrix4 camera_xform;

    // Get camera's world transform
    ERR(suites.LayerSuite9()->AEGP_GetLayerToWorldXform(
        camera_layerH, comp_timeP, &camera_xform));

    if (!err) {
        // Initialize identity
        IdentityMatrix4(view_matrixP);

        // Get camera properties
        AEGP_StreamVal2 stream_val;
        AEGP_StreamType stream_type;
        A_FpLong zoom;

        ERR(suites.StreamSuite4()->AEGP_GetLayerStreamValue(
            camera_layerH, AEGP_LayerStream_ZOOM,
            AEGP_LTimeMode_CompTime, comp_timeP, FALSE,
            &stream_val, &stream_type));
        zoom = stream_val.one_d;

        // Calculate focal length from zoom
        // zoom = focal_length when film size equals comp size
        A_FpLong focal_length = zoom;

        // Set up camera position at origin looking down -Z
        A_FpLong comp_origin_x = comp_width / 2.0;
        A_FpLong comp_origin_y = comp_height / 2.0;

        // Translate to composition center
        TranslateMatrix4(view_matrixP, comp_origin_x, comp_origin_y, -focal_length);

        // Invert camera transform to get view matrix
        A_Matrix4 inv_camera;
        InverseMatrix4(&camera_xform, &inv_camera);

        // Combine: view = inv_camera * default_view
        A_Matrix4 result;
        suites.MathSuite1()->AEGP_MatrixMultiply4(&inv_camera, view_matrixP, &result);
        *view_matrixP = result;
    }

    return err;
}
```

---

## Best Practices

### 1. Always Check Layer Object Type

Before accessing camera or light-specific properties, verify the layer type:

```c
AEGP_ObjectType obj_type;
suites.LayerSuite9()->AEGP_GetLayerObjectType(layerH, &obj_type);

if (obj_type == AEGP_ObjectType_CAMERA) {
    // Safe to use camera streams
} else if (obj_type == AEGP_ObjectType_LIGHT) {
    // Safe to use light streams
}
```

### 2. Use IsStreamLegal for Stream Access

Not all streams are valid for all layers:

```c
A_Boolean is_legal;
suites.StreamSuite4()->AEGP_IsStreamLegal(layerH, stream_type, &is_legal);
if (is_legal) {
    // Safe to access stream
}
```

### 3. Set Proper Effect Flags

Effects using 3D camera/light data must set flags for proper cache invalidation:

```c
// In PF_Cmd_GLOBAL_SETUP
out_data->out_flags2 |= PF_OutFlag2_I_USE_3D_CAMERA;
out_data->out_flags2 |= PF_OutFlag2_I_USE_3D_LIGHTS;
```

### 4. Handle No Camera/Light Cases

Compositions may not have cameras or lights:

```c
AEGP_LayerH camera_layerH = NULL;
err = suites.PFInterfaceSuite1()->AEGP_GetEffectCamera(
    in_data->effect_ref, &comp_time, &camera_layerH);

if (camera_layerH == NULL) {
    // No camera in comp - use default view
    BuildDefaultCamera(...);
}
```

### 5. Consider Parenting Hierarchies

Use `AEGP_GetLayerToWorldXform` to account for parent transforms:

```c
// This automatically handles all parent transforms
A_Matrix4 world_xform;
suites.LayerSuite9()->AEGP_GetLayerToWorldXform(layerH, &comp_time, &world_xform);

// Don't manually read position/rotation if you need world coordinates
```

### 6. Film Size Unit Conversions

Remember film size is in pixels, not millimeters:

```c
// Convert mm to pixels
A_FpLong film_size_pixels = film_size_mm * 72.0 / 25.4;

// Convert pixels to mm
A_FpLong film_size_mm = film_size_pixels * 25.4 / 72.0;
```

### 7. Matrix Orientation Differences

After Effects uses row-major matrices; OpenGL uses column-major:

```c
// Transpose when converting to OpenGL
TransposeMatrix4(&ae_matrix, &gl_matrix);

// Also flip Y and Z axes for coordinate system conversion
```

### 8. Quaternion vs Euler Considerations

Orientation uses quaternions internally; rotation uses Euler angles:

- Use `AEGP_LayerStream_ORIENTATION` for smooth interpolation
- Use `AEGP_LayerStream_ROTATE_X/Y/Z` for explicit axis control
- Avoid mixing both in the same layer when possible

---

## References

### Official Documentation
- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [AEGP Suites Reference](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Artisan Data Types](https://ae-plugins.docsforadobe.dev/artisans/artisan-data-types/)
- [Accessing Camera & Light Information](https://ae-plugins.docsforadobe.dev/effect-details/accessing-camera-light-information.html)

### SDK Sample Projects
- **Artie** - Complete Artisan renderer example with camera/light handling
- **Resizer** - Effect accessing camera and light information

### Key Header Files
- `AE_GeneralPlug.h` - AEGP types and suites
- `AE_Effect.h` - Effect plugin definitions
- `PR_Public.h` - Artisan plugin definitions

---

## Version History

| SDK Version | Changes |
|-------------|---------|
| CS6 (11.0) | Added `AEGP_LayerFlag_ENVIRONMENT_LAYER`, renamed material streams |
| CC 2014 | AEGP_LayerSuite7, enhanced stream access |
| CC 2019 | AEGP_CameraSuite2, AEGP_LightSuite2 |
| 25.2 | Added `AEGP_ObjectType_3D_MODEL` support |

---

*Document generated: December 2025*
*SDK Reference Version: 22.0.0+*
