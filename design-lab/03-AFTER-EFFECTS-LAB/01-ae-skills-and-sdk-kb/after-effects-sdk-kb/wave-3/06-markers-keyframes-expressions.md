---
source: '[unknown - 06-markers-keyframes-expressions.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Markers, Keyframes, and Expressions API Reference

## Document Information

| Property | Value |
|----------|-------|
| **Title** | Adobe After Effects SDK - Markers, Keyframes, and Expressions |
| **Category** | AEGP API Reference |
| **SDK Version** | After Effects 2024+ |
| **Last Updated** | December 2024 |

---

## Table of Contents

1. [Overview](#overview)
2. [AEGP_KeyframeSuite API](#aegp_keyframesuite-api)
3. [AEGP_MarkerSuite API](#aegp_markersuite-api)
4. [Data Structures](#data-structures)
5. [Keyframe Interpolation](#keyframe-interpolation)
6. [Temporal and Spatial Bezier Handles](#temporal-and-spatial-bezier-handles)
7. [Expression APIs](#expression-apis)
8. [Stream Integration](#stream-integration)
9. [Code Examples](#code-examples)
10. [Best Practices](#best-practices)

---

## Overview

The After Effects SDK provides comprehensive APIs for working with keyframes, markers, and expressions through the AEGP (After Effects General Plug-in) architecture. These suites enable plugins to:

- Add, modify, and remove keyframes from any keyframe-able stream
- Create and manipulate composition and layer markers
- Access and modify expressions on properties
- Control interpolation types and ease values
- Work with temporal and spatial tangents

### Suite Versions

| Suite | Current Version | Notes |
|-------|-----------------|-------|
| AEGP_KeyframeSuite | Version 4 | Primary keyframe manipulation |
| AEGP_MarkerSuite | Version 3 | Marker data handling |
| AEGP_StreamSuite | Version 5 | Stream access with Unicode expression support |

---

## AEGP_KeyframeSuite API

The KeyframeSuite provides complete control over keyframe manipulation for any keyframe-able stream in After Effects.

### Suite Header Declaration

```cpp
// Suite handler declarations
AEGP_KeyframeSuite4 *keyframe_suite4P;
AEGP_KeyframeSuite3 *keyframe_suite3P;
AEGP_KeyframeSuite1 *keyframe_suite1P;

// Access pattern
suites.KeyframeSuite4()->AEGP_FunctionName(...);
```

### Core Functions

#### AEGP_GetStreamNumKFs

Retrieves the number of keyframes on a given stream.

```cpp
A_Err AEGP_GetStreamNumKFs(
    AEGP_StreamRefH  streamH,        // Stream to query
    A_long          *num_kfsPL       // Returns keyframe count
);
```

**Returns:** `AEGP_NumKF_NO_DATA` if stream is not keyframe-able.

---

#### AEGP_GetKeyframeTime

Obtains the time of a specified keyframe.

```cpp
A_Err AEGP_GetKeyframeTime(
    AEGP_StreamRefH       streamH,       // Stream handle
    AEGP_KeyframeIndex    key_index,     // Keyframe index (0-based)
    AEGP_LTimeMode        time_mode,     // Layer or composition time
    A_Time               *timePT         // Returns keyframe time
);
```

**Time Modes:**
- `AEGP_LTimeMode_LayerTime` - Time relative to layer
- `AEGP_LTimeMode_CompTime` - Time relative to composition

---

#### AEGP_InsertKeyframe

Adds a keyframe at a specified time.

```cpp
A_Err AEGP_InsertKeyframe(
    AEGP_StreamRefH       streamH,       // Target stream
    AEGP_LTimeMode        time_mode,     // Time mode
    const A_Time         *timePT,        // Time to insert
    AEGP_KeyframeIndex   *key_indexP     // Returns new keyframe index
);
```

**Note:** If a keyframe already exists at the specified time, its values are updated and the existing index is returned.

---

#### AEGP_DeleteKeyframe

Removes a keyframe from the stream.

```cpp
A_Err AEGP_DeleteKeyframe(
    AEGP_StreamRefH     streamH,      // Stream handle
    AEGP_KeyframeIndex  key_index     // Index of keyframe to delete
);
```

---

### Value Management Functions

#### AEGP_GetNewKeyframeValue

Creates and populates an AEGP_StreamValue2 for the keyframe's value.

```cpp
A_Err AEGP_GetNewKeyframeValue(
    AEGP_PluginID         aegp_plugin_id,  // Your plugin ID
    AEGP_StreamRefH       streamH,         // Stream handle
    AEGP_KeyframeIndex    key_index,       // Keyframe index
    AEGP_StreamValue2    *valueP           // Returns keyframe value
);
```

**Important:** The returned value must be disposed using `AEGP_DisposeStreamValue()`.

---

#### AEGP_SetKeyframeValue

Sets the stream's value at a keyframe's time.

```cpp
A_Err AEGP_SetKeyframeValue(
    AEGP_StreamRefH          streamH,      // Stream handle
    AEGP_KeyframeIndex       key_index,    // Keyframe index
    const AEGP_StreamValue2 *valueP        // Value to set
);
```

---

### Spatial Tangent Functions

#### AEGP_GetNewKeyframeSpatialTangents

Returns spatial tangential values (in and out) for a keyframe.

```cpp
A_Err AEGP_GetNewKeyframeSpatialTangents(
    AEGP_PluginID         aegp_plugin_id,  // Your plugin ID
    AEGP_StreamRefH       streamH,         // Stream handle
    AEGP_KeyframeIndex    key_index,       // Keyframe index
    AEGP_StreamValue2    *in_tanP,         // Returns incoming tangent
    AEGP_StreamValue2    *out_tanP         // Returns outgoing tangent
);
```

**Note:** Both returned values must be disposed using `AEGP_DisposeStreamValue()`.

---

#### AEGP_SetKeyframeSpatialTangents

Sets tangential values for a keyframe's spatial animation curve.

```cpp
A_Err AEGP_SetKeyframeSpatialTangents(
    AEGP_StreamRefH          streamH,      // Stream handle
    AEGP_KeyframeIndex       key_index,    // Keyframe index
    const AEGP_StreamValue2 *in_tanP,      // Incoming tangent
    const AEGP_StreamValue2 *out_tanP      // Outgoing tangent
);
```

---

### Interpolation Functions

#### AEGP_GetKeyframeInterpolation

Retrieves interpolation types for a keyframe.

```cpp
A_Err AEGP_GetKeyframeInterpolation(
    AEGP_StreamRefH               streamH,       // Stream handle
    AEGP_KeyframeIndex            key_index,     // Keyframe index
    AEGP_KeyframeInterpolationType *in_interpP,  // Returns in interpolation
    AEGP_KeyframeInterpolationType *out_interpP  // Returns out interpolation
);
```

---

#### AEGP_SetKeyframeInterpolation

Sets interpolation types for a keyframe.

```cpp
A_Err AEGP_SetKeyframeInterpolation(
    AEGP_StreamRefH                streamH,      // Stream handle
    AEGP_KeyframeIndex             key_index,    // Keyframe index
    AEGP_KeyframeInterpolationType in_interp,    // In interpolation type
    AEGP_KeyframeInterpolationType out_interp    // Out interpolation type
);
```

---

### Temporal Ease Functions

#### AEGP_GetKeyframeTemporalEase

Retrieves ease values for a specific dimension of the keyframe.

```cpp
A_Err AEGP_GetKeyframeTemporalEase(
    AEGP_StreamRefH      streamH,         // Stream handle
    AEGP_KeyframeIndex   key_index,       // Keyframe index
    A_long               dimensionL,      // Dimension (0 for most streams)
    AEGP_KeyframeEase   *in_easeP,        // Returns in ease
    AEGP_KeyframeEase   *out_easeP        // Returns out ease
);
```

**Note:** For dimensionL, use 0 to get valid values for speed and influence. Higher dimensions may return invalid data depending on stream type.

---

#### AEGP_SetKeyframeTemporalEase

Sets temporal ease values for a keyframe.

```cpp
A_Err AEGP_SetKeyframeTemporalEase(
    AEGP_StreamRefH          streamH,      // Stream handle
    AEGP_KeyframeIndex       key_index,    // Keyframe index
    A_long                   dimensionL,   // Dimension
    const AEGP_KeyframeEase *in_easeP,     // In ease values
    const AEGP_KeyframeEase *out_easeP     // Out ease values
);
```

---

### Dimensionality Functions

#### AEGP_GetStreamValueDimensionality

Returns the number of value dimensions for a stream.

```cpp
A_Err AEGP_GetStreamValueDimensionality(
    AEGP_StreamRefH  streamH,         // Stream handle
    A_short         *value_dimPS      // Returns dimensionality
);
```

**Examples:**
- Position (2D): returns 2
- Position (3D): returns 3
- Scale (3D): returns 3
- Opacity: returns 1

---

#### AEGP_GetStreamTemporalDimensionality

Returns the temporal dimensionality of a stream.

```cpp
A_Err AEGP_GetStreamTemporalDimensionality(
    AEGP_StreamRefH  streamH,           // Stream handle
    A_short         *temporal_dimPS     // Returns temporal dimensions
);
```

---

### Keyframe Flag Functions

#### AEGP_GetKeyframeFlags

Retrieves flags associated with a keyframe.

```cpp
A_Err AEGP_GetKeyframeFlags(
    AEGP_StreamRefH        streamH,      // Stream handle
    AEGP_KeyframeIndex     key_index,    // Keyframe index
    AEGP_KeyframeFlags    *flagsP        // Returns keyframe flags
);
```

---

#### AEGP_SetKeyframeFlag

Sets individual flags on a keyframe.

```cpp
A_Err AEGP_SetKeyframeFlag(
    AEGP_StreamRefH      streamH,      // Stream handle
    AEGP_KeyframeIndex   key_index,    // Keyframe index
    AEGP_KeyframeFlags   flag,         // Flag to set
    A_Boolean            valueB        // TRUE to enable, FALSE to disable
);
```

---

### Batch Keyframe Operations

For efficiency when adding multiple keyframes, use the batch operations:

#### AEGP_StartAddKeyframes

Initiates batch keyframe addition.

```cpp
A_Err AEGP_StartAddKeyframes(
    AEGP_StreamRefH           streamH,     // Stream handle
    AEGP_AddKeyframesInfoH   *akH          // Returns batch operation handle
);
```

---

#### AEGP_AddKeyframes

Adds a keyframe at specified time within batch.

```cpp
A_Err AEGP_AddKeyframes(
    AEGP_AddKeyframesInfoH   akH,          // Batch handle
    AEGP_LTimeMode           time_mode,    // Time mode
    const A_Time            *timePT,       // Keyframe time
    AEGP_KeyframeIndex      *indexP        // Returns keyframe index
);
```

---

#### AEGP_SetAddKeyframe

Sets values for a keyframe added in batch.

```cpp
A_Err AEGP_SetAddKeyframe(
    AEGP_AddKeyframesInfoH   akH,          // Batch handle
    AEGP_KeyframeIndex       key_index,    // Keyframe index
    const AEGP_StreamValue2 *valueP        // Value to set
);
```

---

#### AEGP_EndAddKeyframes

Completes batch operations and commits to undo stack.

```cpp
A_Err AEGP_EndAddKeyframes(
    A_Boolean                 addB,        // TRUE to commit, FALSE to cancel
    AEGP_AddKeyframesInfoH    akH          // Batch handle
);
```

---

## AEGP_MarkerSuite API

The MarkerSuite provides functions for creating, reading, and modifying markers on compositions and layers.

### Suite Header Declaration

```cpp
// Suite handler declarations
AEGP_MarkerSuite3 *marker_suite3P;
AEGP_MarkerSuite2 *marker_suite2P;
AEGP_MarkerSuite1 *marker_suite1P;

// Access pattern
suites.MarkerSuite2()->AEGP_FunctionName(...);
```

### Marker Creation and Management

#### AEGP_NewMarker

Creates a new marker structure.

```cpp
A_Err AEGP_NewMarker(
    AEGP_MarkerValP *markerPP     // Returns new marker pointer
);
```

---

#### AEGP_DisposeMarker

Frees a marker.

```cpp
A_Err AEGP_DisposeMarker(
    AEGP_MarkerValP  markerP      // Marker to dispose
);
```

---

#### AEGP_DuplicateMarker

Creates a copy of an existing marker.

```cpp
A_Err AEGP_DuplicateMarker(
    AEGP_MarkerValP   markerP,        // Source marker
    AEGP_MarkerValP  *new_markerPP    // Returns duplicate
);
```

---

### Marker Flag Functions

#### AEGP_SetMarkerFlag

Sets marker flags.

```cpp
A_Err AEGP_SetMarkerFlag(
    AEGP_MarkerValP     markerP,      // Marker
    AEGP_MarkerFlagType flag,         // Flag type
    A_Boolean           valueB        // Value to set
);
```

---

#### AEGP_GetMarkerFlag

Retrieves the value of a marker flag.

```cpp
A_Err AEGP_GetMarkerFlag(
    AEGP_MarkerValP      markerP,     // Marker
    AEGP_MarkerFlagType  flag,        // Flag type
    A_Boolean           *valuePB      // Returns flag value
);
```

---

### Marker Text Functions

#### AEGP_GetMarkerString

Retrieves text content from a marker field.

```cpp
A_Err AEGP_GetMarkerString(
    AEGP_PluginID         aegp_plugin_id,  // Your plugin ID
    AEGP_MarkerValP       markerP,         // Marker
    AEGP_MarkerStringType strType,         // Which string field
    AEGP_MemHandle       *unicodePH        // Returns UTF-16 string handle
);
```

**Important:** The returned `AEGP_MemHandle` must be disposed when finished.

---

#### AEGP_SetMarkerString

Sets text content in a marker field.

```cpp
A_Err AEGP_SetMarkerString(
    AEGP_MarkerValP        markerP,     // Marker
    AEGP_MarkerStringType  strType,     // Which string field
    const A_u_short       *unicodeP,    // UTF-16 null-terminated string
    A_long                 lengthL      // String length
);
```

---

### Cue Point Parameter Functions

#### AEGP_CountCuePointParams

Returns the number of cue point parameters.

```cpp
A_Err AEGP_CountCuePointParams(
    AEGP_MarkerValP  markerP,       // Marker
    A_long          *countPL        // Returns parameter count
);
```

---

#### AEGP_GetIndCuePointParam

Retrieves a cue point parameter by index.

```cpp
A_Err AEGP_GetIndCuePointParam(
    AEGP_PluginID     aegp_plugin_id,  // Your plugin ID
    AEGP_MarkerValP   markerP,         // Marker
    A_long            param_indexL,    // Parameter index
    AEGP_MemHandle   *unicodeKeyPH,    // Returns key name
    AEGP_MemHandle   *unicodeValuePH   // Returns value
);
```

---

#### AEGP_SetIndCuePointParam

Sets or updates a cue point parameter.

```cpp
A_Err AEGP_SetIndCuePointParam(
    AEGP_MarkerValP    markerP,         // Marker
    A_long             param_indexL,    // Parameter index
    const A_u_short   *unicodeKeyP,     // Key name
    A_long             key_lengthL,     // Key length
    const A_u_short   *unicodeValueP,   // Value
    A_long             value_lengthL    // Value length
);
```

---

#### AEGP_InsertCuePointParam

Adds a new cue point parameter at a specified index.

```cpp
A_Err AEGP_InsertCuePointParam(
    AEGP_MarkerValP    markerP,         // Marker
    A_long             param_indexL     // Insertion index
);
```

---

#### AEGP_DeleteIndCuePointParam

Removes a cue point parameter.

```cpp
A_Err AEGP_DeleteIndCuePointParam(
    AEGP_MarkerValP  markerP,         // Marker
    A_long           param_indexL     // Parameter index to delete
);
```

---

### Marker Duration Functions

#### AEGP_SetMarkerDuration

Sets the temporal duration of a marker.

```cpp
A_Err AEGP_SetMarkerDuration(
    AEGP_MarkerValP   markerP,       // Marker
    const A_Time     *durationPT     // Duration value
);
```

---

#### AEGP_GetMarkerDuration

Retrieves a marker's duration.

```cpp
A_Err AEGP_GetMarkerDuration(
    AEGP_MarkerValP   markerP,       // Marker
    A_Time           *durationPT     // Returns duration
);
```

---

## Data Structures

### AEGP_KeyframeEase

Structure containing temporal ease parameters.

```cpp
typedef struct {
    A_FpLong  speedF;       // Speed value (units depend on property type)
    A_FpLong  influenceF;   // Influence value [0.1 - 100.0]
} AEGP_KeyframeEase;
```

**Notes:**
- Speed units match the property type (pixels/second, degrees/second, etc.)
- Influence controls the bezier curve shape (percentage of time segment)
- Values must be multiplied by layer height to match UI display

---

### AEGP_KeyframeInterpolationType

Enumeration of keyframe interpolation types.

```cpp
typedef A_long AEGP_KeyframeInterpolationType;

enum {
    AEGP_KeyInterp_NONE    = 0,  // No interpolation
    AEGP_KeyInterp_LINEAR  = 1,  // Linear interpolation
    AEGP_KeyInterp_BEZIER  = 2,  // Bezier curve interpolation
    AEGP_KeyInterp_HOLD    = 3,  // Hold (step) interpolation
    AEGP_KeyInterp_NUM_VALUES
};
```

---

### AEGP_KeyInterpolationMask

Bitmask for allowed interpolation types.

```cpp
typedef A_long AEGP_KeyInterpolationMask;

enum {
    AEGP_KeyInterpMask_NONE   = 0,
    AEGP_KeyInterpMask_LINEAR = 1 << 0,
    AEGP_KeyInterpMask_BEZIER = 1 << 1,
    AEGP_KeyInterpMask_HOLD   = 1 << 2,
    AEGP_KeyInterpMask_CUSTOM = 1 << 3,
    AEGP_KeyInterpMask_ANY    = 0xFFFF
};
```

---

### AEGP_KeyframeFlags

Keyframe property flags.

```cpp
typedef A_long AEGP_KeyframeFlags;

enum {
    AEGP_KeyframeFlag_NONE                  = 0,
    AEGP_KeyframeFlag_TEMPORAL_CONTINUOUS   = 1 << 0,
    AEGP_KeyframeFlag_TEMPORAL_AUTOBEZIER   = 1 << 1,
    AEGP_KeyframeFlag_SPATIAL_CONTINUOUS    = 1 << 2,
    AEGP_KeyframeFlag_SPATIAL_AUTOBEZIER    = 1 << 3,
    AEGP_KeyframeFlag_ROVING                = 1 << 4
};
```

**Flag Descriptions:**

| Flag | Description |
|------|-------------|
| TEMPORAL_CONTINUOUS | Temporal bezier handles are linked |
| TEMPORAL_AUTOBEZIER | Temporal handles auto-adjust for smooth animation |
| SPATIAL_CONTINUOUS | Spatial bezier handles are linked |
| SPATIAL_AUTOBEZIER | Spatial handles auto-adjust for smooth motion path |
| ROVING | Keyframe time adjusts to maintain constant speed |

---

### AEGP_MarkerStringType

Types of string fields in markers.

```cpp
typedef A_long AEGP_MarkerStringType;

enum {
    AEGP_MarkerString_NONE           = 0,
    AEGP_MarkerString_COMMENT        = 1,  // Comment/name field
    AEGP_MarkerString_CHAPTER        = 2,  // Chapter link field
    AEGP_MarkerString_URL            = 3,  // URL field
    AEGP_MarkerString_FRAME_TARGET   = 4,  // Frame target field
    AEGP_MarkerString_CUE_POINT_NAME = 5,  // Cue point name
    AEGP_MarkerString_NUMTYPES
};
```

---

### AEGP_MarkerFlagType

Marker flag types.

```cpp
typedef A_long AEGP_MarkerFlagType;

enum {
    AEGP_MarkerFlag_NONE            = 0x00000000,
    AEGP_MarkerFlag_NAVIGATION      = 0x00000001,  // Navigation vs Event
    AEGP_MarkerFlag_PROTECT_REGION  = 0x00000002   // Protected region (AE 16.0+)
};
```

**Note:** If `AEGP_MarkerFlag_NAVIGATION` is not set, the marker is an Event cue point.

---

### AEGP_StreamValue2

Union containing stream values of various types.

```cpp
typedef struct {
    AEGP_StreamType streamType;
    union {
        AEGP_FourDVal       four_d;
        AEGP_ThreeDVal      three_d;
        AEGP_TwoDVal        two_d;
        AEGP_OneDVal        one_d;
        AEGP_ColorVal       color;
        AEGP_ArbBlockVal    arbH;
        AEGP_MarkerValP     markerP;
        AEGP_LayerIDVal     layer_id;
        AEGP_MaskIDVal      mask_id;
        AEGP_MaskOutlineValH mask;
        AEGP_TextDocumentH  text_documentH;
    } val;
} AEGP_StreamValue2;
```

---

### AEGP_KeyframeIndex

Type for keyframe indices.

```cpp
typedef A_long AEGP_KeyframeIndex;
```

Keyframe indices are 0-based and sequential within a stream.

---

## Keyframe Interpolation

### Interpolation Types Explained

#### Linear Interpolation

Creates constant rate of change between keyframes. The animation proceeds at a uniform speed.

```cpp
suites.KeyframeSuite4()->AEGP_SetKeyframeInterpolation(
    streamH,
    key_index,
    AEGP_KeyInterp_LINEAR,
    AEGP_KeyInterp_LINEAR
);
```

---

#### Hold Interpolation

Values jump instantaneously at keyframe time. No interpolation between values.

```cpp
suites.KeyframeSuite4()->AEGP_SetKeyframeInterpolation(
    streamH,
    key_index,
    AEGP_KeyInterp_HOLD,   // In doesn't matter for hold
    AEGP_KeyInterp_HOLD
);
```

**Note:** Hold interpolation is only available for temporal interpolation, not spatial.

---

#### Bezier Interpolation

Smooth curves controlled by direction handles. Provides the most control over animation.

```cpp
suites.KeyframeSuite4()->AEGP_SetKeyframeInterpolation(
    streamH,
    key_index,
    AEGP_KeyInterp_BEZIER,
    AEGP_KeyInterp_BEZIER
);

// Set ease values for bezier
AEGP_KeyframeEase in_ease = { 0.0, 33.33 };   // Speed, Influence
AEGP_KeyframeEase out_ease = { 0.0, 33.33 };

suites.KeyframeSuite4()->AEGP_SetKeyframeTemporalEase(
    streamH,
    key_index,
    0,           // Dimension
    &in_ease,
    &out_ease
);
```

---

#### Auto Bezier

System automatically adjusts handles for smooth transitions.

```cpp
// Enable auto bezier via flags
suites.KeyframeSuite4()->AEGP_SetKeyframeFlag(
    streamH,
    key_index,
    AEGP_KeyframeFlag_TEMPORAL_AUTOBEZIER,
    TRUE
);

suites.KeyframeSuite4()->AEGP_SetKeyframeFlag(
    streamH,
    key_index,
    AEGP_KeyframeFlag_SPATIAL_AUTOBEZIER,
    TRUE
);
```

---

#### Continuous Bezier

Handles are linked but manually adjustable.

```cpp
suites.KeyframeSuite4()->AEGP_SetKeyframeFlag(
    streamH,
    key_index,
    AEGP_KeyframeFlag_TEMPORAL_CONTINUOUS,
    TRUE
);

suites.KeyframeSuite4()->AEGP_SetKeyframeFlag(
    streamH,
    key_index,
    AEGP_KeyframeFlag_SPATIAL_CONTINUOUS,
    TRUE
);
```

---

## Temporal and Spatial Bezier Handles

### Understanding the Difference

| Aspect | Temporal | Spatial |
|--------|----------|---------|
| **Controls** | Animation speed/timing | Motion path shape |
| **Graph** | Speed/Value graph | Motion path in viewer |
| **Data** | Speed + Influence | XYZ tangent vectors |
| **Applies to** | All keyframe-able properties | Position-based properties only |

---

### Working with Temporal Handles

Temporal bezier handles control how fast the animation proceeds through the value change.

```cpp
// Get current temporal ease
AEGP_KeyframeEase in_ease, out_ease;
suites.KeyframeSuite4()->AEGP_GetKeyframeTemporalEase(
    streamH,
    key_index,
    0,           // First dimension
    &in_ease,
    &out_ease
);

// Modify for "ease in" effect (slow approach to keyframe)
in_ease.speedF = 0.0;        // Zero velocity at keyframe
in_ease.influenceF = 75.0;   // Strong influence

// Modify for "ease out" effect (slow departure from keyframe)
out_ease.speedF = 0.0;
out_ease.influenceF = 75.0;

suites.KeyframeSuite4()->AEGP_SetKeyframeTemporalEase(
    streamH,
    key_index,
    0,
    &in_ease,
    &out_ease
);
```

---

### Working with Spatial Handles

Spatial tangents control the shape of the motion path for position properties.

```cpp
// Get spatial tangents
AEGP_StreamValue2 in_tan, out_tan;
suites.KeyframeSuite4()->AEGP_GetNewKeyframeSpatialTangents(
    plugin_id,
    streamH,
    key_index,
    &in_tan,
    &out_tan
);

// Modify tangent values (for 3D position)
in_tan.val.three_d.x = -50.0;
in_tan.val.three_d.y = 0.0;
in_tan.val.three_d.z = 0.0;

out_tan.val.three_d.x = 50.0;
out_tan.val.three_d.y = 0.0;
out_tan.val.three_d.z = 0.0;

suites.KeyframeSuite4()->AEGP_SetKeyframeSpatialTangents(
    streamH,
    key_index,
    &in_tan,
    &out_tan
);

// Don't forget to dispose
suites.StreamSuite5()->AEGP_DisposeStreamValue(&in_tan);
suites.StreamSuite5()->AEGP_DisposeStreamValue(&out_tan);
```

---

### Roving Keyframes

Roving keyframes automatically adjust their time position to maintain constant velocity.

```cpp
// Enable roving for a keyframe
suites.KeyframeSuite4()->AEGP_SetKeyframeFlag(
    streamH,
    key_index,
    AEGP_KeyframeFlag_ROVING,
    TRUE
);
```

**Important Notes:**
- Roving is only available for spatial properties (Position, Anchor Point, etc.)
- First and last keyframes cannot be roving
- The keyframe maintains its value but repositions in time

---

### Time Remapping Keyframes

Time remapping is accessed through the layer's time remap stream.

```cpp
// Get time remap stream
AEGP_StreamRefH timeRemapStream;
suites.StreamSuite5()->AEGP_GetNewLayerStream(
    plugin_id,
    layerH,
    AEGP_LayerStream_TIME_REMAP,
    &timeRemapStream
);

// Check if time remapping is enabled
A_Boolean hasKeyframes;
A_long numKFs;
suites.KeyframeSuite4()->AEGP_GetStreamNumKFs(
    timeRemapStream,
    &numKFs
);

if (numKFs > 0) {
    // Add keyframe for time remap
    A_Time insertTime = { 1, 1 }; // 1 second
    AEGP_KeyframeIndex newIndex;

    suites.KeyframeSuite4()->AEGP_InsertKeyframe(
        timeRemapStream,
        AEGP_LTimeMode_CompTime,
        &insertTime,
        &newIndex
    );

    // Set the remapped time value
    AEGP_StreamValue2 remapValue;
    remapValue.val.one_d = 0.5; // Remap to 0.5 seconds

    suites.KeyframeSuite4()->AEGP_SetKeyframeValue(
        timeRemapStream,
        newIndex,
        &remapValue
    );
}

suites.StreamSuite5()->AEGP_DisposeStream(timeRemapStream);
```

---

## Expression APIs

### Expression Functions in AEGP_StreamSuite5

#### AEGP_GetExpression

Retrieves the expression string from a stream.

```cpp
A_Err AEGP_GetExpression(
    AEGP_PluginID     aegp_plugin_id,  // Your plugin ID
    AEGP_StreamRefH   streamH,         // Stream handle
    AEGP_MemHandle   *unicodeH         // Returns expression as UTF-16
);
```

**Note:** Returns an empty string if no expression is applied.

---

#### AEGP_SetExpression

Sets an expression on a stream.

```cpp
A_Err AEGP_SetExpression(
    AEGP_PluginID      aegp_plugin_id,  // Your plugin ID
    AEGP_StreamRefH    streamH,         // Stream handle
    const A_u_short   *expressionP      // UTF-16 expression string
);
```

---

#### AEGP_GetExpressionState

Checks if an expression is enabled.

```cpp
A_Err AEGP_GetExpressionState(
    AEGP_PluginID     aegp_plugin_id,   // Your plugin ID
    AEGP_StreamRefH   streamH,          // Stream handle
    A_Boolean        *enabledPB         // Returns enabled state
);
```

---

#### AEGP_SetExpressionState

Enables or disables an expression.

```cpp
A_Err AEGP_SetExpressionState(
    AEGP_PluginID     aegp_plugin_id,  // Your plugin ID
    AEGP_StreamRefH   streamH,         // Stream handle
    A_Boolean         enabledB         // TRUE to enable
);
```

---

### Expression Evaluation

**Important:** The values obtained through `AEGP_GetNewStreamValue` do NOT reflect expression results. Expressions are evaluated at render time.

To get evaluated values that include expressions:

```cpp
// Get the evaluated stream value at a specific time
AEGP_StreamValue2 evaluatedValue;
A_Time sampleTime = { 30, 30 }; // 1 second at 30fps

suites.StreamSuite5()->AEGP_GetNewStreamValue(
    plugin_id,
    streamH,
    AEGP_LTimeMode_CompTime,
    &sampleTime,
    TRUE,           // Pre-expression value
    &evaluatedValue
);

// Use the value...

// Dispose when done
suites.StreamSuite5()->AEGP_DisposeStreamValue(&evaluatedValue);
```

---

### Expression Error Handling

Expressions can fail during evaluation. After Effects displays errors in a warning banner but continues evaluating the expression.

**Error Detection:**
- Check for expression errors through the scripting DOM
- The SDK doesn't directly expose expression error states
- Use try/catch patterns in expressions for graceful degradation

**Common Expression Issues:**
1. Undefined variables or properties
2. Type mismatches
3. Circular references
4. Performance bottlenecks

---

### Dynamic Link Expressions

Expressions can reference properties in other compositions through dynamic links:

```javascript
// Expression referencing another comp
comp("Other Comp").layer("Control").effect("Slider")("Slider")
```

**SDK Considerations:**
- Dynamic links create dependencies between compositions
- Modifying linked properties may trigger re-evaluation
- Be aware of render order implications

---

## Stream Integration

### Accessing Keyframed Streams

```cpp
// Get a layer stream
AEGP_StreamRefH positionStream;
suites.StreamSuite5()->AEGP_GetNewLayerStream(
    plugin_id,
    layerH,
    AEGP_LayerStream_POSITION,
    &positionStream
);

// Check if stream has keyframes
A_long numKeyframes;
suites.KeyframeSuite4()->AEGP_GetStreamNumKFs(
    positionStream,
    &numKeyframes
);

if (numKeyframes > 0) {
    // Work with keyframes...
}

// Always dispose streams
suites.StreamSuite5()->AEGP_DisposeStream(positionStream);
```

---

### Common Layer Streams

| Stream Constant | Description |
|-----------------|-------------|
| `AEGP_LayerStream_ANCHORPOINT` | Layer anchor point |
| `AEGP_LayerStream_POSITION` | Layer position |
| `AEGP_LayerStream_SCALE` | Layer scale |
| `AEGP_LayerStream_ROTATION` | Layer rotation (2D) |
| `AEGP_LayerStream_ROTATE_X` | X rotation (3D) |
| `AEGP_LayerStream_ROTATE_Y` | Y rotation (3D) |
| `AEGP_LayerStream_ROTATE_Z` | Z rotation (3D) |
| `AEGP_LayerStream_OPACITY` | Layer opacity |
| `AEGP_LayerStream_MARKER` | Layer markers |
| `AEGP_LayerStream_TIME_REMAP` | Time remapping |

---

### Accessing Effect Parameter Streams

```cpp
// Get effect reference
AEGP_EffectRefH effectH;
suites.EffectSuite4()->AEGP_GetLayerEffectByIndex(
    plugin_id,
    layerH,
    effect_index,
    &effectH
);

// Get parameter stream
AEGP_StreamRefH paramStream;
suites.StreamSuite5()->AEGP_GetNewEffectStreamByIndex(
    plugin_id,
    effectH,
    param_index,
    &paramStream
);

// Work with parameter keyframes...

suites.StreamSuite5()->AEGP_DisposeStream(paramStream);
suites.EffectSuite4()->AEGP_DisposeEffect(effectH);
```

---

### Accessing Composition Markers

Composition markers are accessed differently from layer markers:

```cpp
// Get composition item
AEGP_ItemH compItem;
suites.CompSuite11()->AEGP_GetItemFromComp(compH, &compItem);

// Composition markers are accessed through the marker property
// which is part of the composition's property group
```

---

## Code Examples

### Example 1: Adding Keyframes to Position

```cpp
void AddPositionKeyframes(
    AEGP_PluginID plugin_id,
    AEGP_LayerH layerH,
    AEFX_SuiteScoper<AEGP_KeyframeSuite4>& kfSuite,
    AEFX_SuiteScoper<AEGP_StreamSuite5>& streamSuite)
{
    A_Err err = A_Err_NONE;
    AEGP_StreamRefH positionStream = NULL;
    AEGP_AddKeyframesInfoH akH = NULL;

    // Get position stream
    ERR(streamSuite->AEGP_GetNewLayerStream(
        plugin_id,
        layerH,
        AEGP_LayerStream_POSITION,
        &positionStream
    ));

    if (!err) {
        // Start batch keyframe addition
        ERR(kfSuite->AEGP_StartAddKeyframes(positionStream, &akH));

        if (!err && akH) {
            // Add keyframe at 0 seconds
            A_Time time0 = { 0, 1 };
            AEGP_KeyframeIndex idx0;
            ERR(kfSuite->AEGP_AddKeyframes(
                akH,
                AEGP_LTimeMode_CompTime,
                &time0,
                &idx0
            ));

            // Set value for first keyframe
            AEGP_StreamValue2 val0;
            val0.val.three_d.x = 100.0;
            val0.val.three_d.y = 100.0;
            val0.val.three_d.z = 0.0;
            ERR(kfSuite->AEGP_SetAddKeyframe(akH, idx0, &val0));

            // Add keyframe at 1 second
            A_Time time1 = { 1, 1 };
            AEGP_KeyframeIndex idx1;
            ERR(kfSuite->AEGP_AddKeyframes(
                akH,
                AEGP_LTimeMode_CompTime,
                &time1,
                &idx1
            ));

            // Set value for second keyframe
            AEGP_StreamValue2 val1;
            val1.val.three_d.x = 500.0;
            val1.val.three_d.y = 300.0;
            val1.val.three_d.z = 0.0;
            ERR(kfSuite->AEGP_SetAddKeyframe(akH, idx1, &val1));

            // Commit the keyframes
            ERR(kfSuite->AEGP_EndAddKeyframes(TRUE, akH));
        }
    }

    // Cleanup
    if (positionStream) {
        streamSuite->AEGP_DisposeStream(positionStream);
    }
}
```

---

### Example 2: Creating Easy Ease Keyframes

```cpp
void ApplyEasyEase(
    AEGP_StreamRefH streamH,
    AEGP_KeyframeIndex key_index,
    AEFX_SuiteScoper<AEGP_KeyframeSuite4>& kfSuite)
{
    A_Err err = A_Err_NONE;

    // Set bezier interpolation
    ERR(kfSuite->AEGP_SetKeyframeInterpolation(
        streamH,
        key_index,
        AEGP_KeyInterp_BEZIER,
        AEGP_KeyInterp_BEZIER
    ));

    if (!err) {
        // Get stream dimensionality
        A_short dimensions = 1;
        // Assume we've obtained this value

        for (A_short dim = 0; dim < dimensions; dim++) {
            // Easy ease values (similar to UI default)
            AEGP_KeyframeEase in_ease = { 0.0, 33.33 };
            AEGP_KeyframeEase out_ease = { 0.0, 33.33 };

            ERR(kfSuite->AEGP_SetKeyframeTemporalEase(
                streamH,
                key_index,
                dim,
                &in_ease,
                &out_ease
            ));
        }
    }
}
```

---

### Example 3: Working with Markers

```cpp
void CreateMarkerWithComment(
    AEGP_PluginID plugin_id,
    AEGP_StreamRefH markerStream,
    A_Time* timePT,
    const A_u_short* commentP,
    AEFX_SuiteScoper<AEGP_MarkerSuite2>& markerSuite,
    AEFX_SuiteScoper<AEGP_KeyframeSuite4>& kfSuite)
{
    A_Err err = A_Err_NONE;
    AEGP_MarkerValP markerP = NULL;

    // Create new marker
    ERR(markerSuite->AEGP_NewMarker(&markerP));

    if (!err && markerP) {
        // Set comment
        ERR(markerSuite->AEGP_SetMarkerString(
            markerP,
            AEGP_MarkerString_COMMENT,
            commentP,
            PF_wcslen(commentP)
        ));

        // Set duration (1 second)
        A_Time duration = { 1, 1 };
        ERR(markerSuite->AEGP_SetMarkerDuration(markerP, &duration));

        // Set as navigation marker
        ERR(markerSuite->AEGP_SetMarkerFlag(
            markerP,
            AEGP_MarkerFlag_NAVIGATION,
            TRUE
        ));

        // Insert marker as keyframe on marker stream
        AEGP_KeyframeIndex idx;
        ERR(kfSuite->AEGP_InsertKeyframe(
            markerStream,
            AEGP_LTimeMode_CompTime,
            timePT,
            &idx
        ));

        if (!err) {
            // Set the marker value
            AEGP_StreamValue2 markerValue;
            markerValue.val.markerP = markerP;

            ERR(kfSuite->AEGP_SetKeyframeValue(
                markerStream,
                idx,
                &markerValue
            ));
        }
    }

    // Note: Don't dispose marker here - it's now owned by the stream
}
```

---

### Example 4: Setting an Expression

```cpp
void SetWiggleExpression(
    AEGP_PluginID plugin_id,
    AEGP_StreamRefH streamH,
    A_FpLong frequency,
    A_FpLong amplitude,
    AEFX_SuiteScoper<AEGP_StreamSuite5>& streamSuite)
{
    A_Err err = A_Err_NONE;

    // Build expression string
    char expression[256];
    sprintf(expression, "wiggle(%.2f, %.2f)", frequency, amplitude);

    // Convert to UTF-16
    A_u_short unicodeExpr[256];
    for (int i = 0; i <= strlen(expression); i++) {
        unicodeExpr[i] = (A_u_short)expression[i];
    }

    // Set expression
    ERR(streamSuite->AEGP_SetExpression(
        plugin_id,
        streamH,
        unicodeExpr
    ));

    if (!err) {
        // Enable expression
        ERR(streamSuite->AEGP_SetExpressionState(
            plugin_id,
            streamH,
            TRUE
        ));
    }
}
```

---

### Example 5: Iterating Through Keyframes

```cpp
void IterateKeyframes(
    AEGP_PluginID plugin_id,
    AEGP_StreamRefH streamH,
    AEFX_SuiteScoper<AEGP_KeyframeSuite4>& kfSuite,
    AEFX_SuiteScoper<AEGP_StreamSuite5>& streamSuite)
{
    A_Err err = A_Err_NONE;
    A_long numKFs = 0;

    ERR(kfSuite->AEGP_GetStreamNumKFs(streamH, &numKFs));

    for (AEGP_KeyframeIndex i = 0; i < numKFs && !err; i++) {
        // Get keyframe time
        A_Time kfTime;
        ERR(kfSuite->AEGP_GetKeyframeTime(
            streamH,
            i,
            AEGP_LTimeMode_CompTime,
            &kfTime
        ));

        // Get keyframe value
        AEGP_StreamValue2 kfValue;
        ERR(kfSuite->AEGP_GetNewKeyframeValue(
            plugin_id,
            streamH,
            i,
            &kfValue
        ));

        if (!err) {
            // Get interpolation
            AEGP_KeyframeInterpolationType inInterp, outInterp;
            ERR(kfSuite->AEGP_GetKeyframeInterpolation(
                streamH,
                i,
                &inInterp,
                &outInterp
            ));

            // Get flags
            AEGP_KeyframeFlags flags;
            ERR(kfSuite->AEGP_GetKeyframeFlags(streamH, i, &flags));

            // Process keyframe data...
            // Log or modify as needed

            // Dispose value
            streamSuite->AEGP_DisposeStreamValue(&kfValue);
        }
    }
}
```

---

## Best Practices

### Memory Management

1. **Always dispose allocated resources:**
   ```cpp
   // Streams
   suites.StreamSuite5()->AEGP_DisposeStream(streamH);

   // Stream values
   suites.StreamSuite5()->AEGP_DisposeStreamValue(&value);

   // Memory handles
   suites.MemorySuite1()->AEGP_FreeMemHandle(memH);
   ```

2. **Use RAII patterns when possible**

3. **Check for NULL before disposing**

---

### Undo Management

1. **Use batch operations for multiple keyframes:**
   ```cpp
   AEGP_StartAddKeyframes()
   // Add keyframes...
   AEGP_EndAddKeyframes(TRUE, akH);  // Single undo entry
   ```

2. **Individual `AEGP_InsertKeyframe` calls each create an undo entry**

3. **Wrap related changes in undo groups:**
   ```cpp
   suites.UtilitySuite6()->AEGP_StartUndoGroup("My Operation");
   // Make changes...
   suites.UtilitySuite6()->AEGP_EndUndoGroup();
   ```

---

### Thread Safety

1. **Stream operations must run on UI thread**
2. **Avoid modifying project state in render callbacks**
3. **Use `PF_Cmd_COMPLETELY_GENERAL` for command hooks**

---

### Performance Considerations

1. **Cache stream references when possible**
2. **Use batch keyframe operations for bulk changes**
3. **Dispose resources promptly**
4. **Be mindful of undo stack impact**

---

### Data Validity

1. **Stream references invalidate when keyframes are added/removed**
2. **Re-acquire references after structural changes**
3. **Check error returns before using data**

---

## See Also

- [AEGP_StreamSuite Reference](./07-streams-effects-api.md)
- [AEGP_LayerSuite Reference](./04-layer-suite-api.md)
- [AEGP_CompSuite Reference](./03-composition-suite-api.md)
- [After Effects Expression Reference](https://ae-expressions.docsforadobe.dev/)

---

## Sources

- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [AEGP Suites Documentation](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [After Effects Expression Reference](https://ae-expressions.docsforadobe.dev/)
- [After Effects Scripting Guide - KeyframeEase](https://ae-scripting.docsforadobe.dev/other/keyframeease/)
- [SDK Header: AE_GeneralPlug.h](https://github.com/takahirome/AdobeScripts/blob/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Headers/AE_GeneralPlug.h)
- [Adobe After Effects Keyframe Interpolation](https://helpx.adobe.com/after-effects/using/keyframe-interpolation.html)
