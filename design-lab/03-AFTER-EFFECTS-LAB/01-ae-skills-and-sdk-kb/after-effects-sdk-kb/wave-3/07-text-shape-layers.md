---
source: '[unknown - 07-text-shape-layers.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Text Layer and Shape Layer APIs - Adobe After Effects SDK

## Executive Summary

This document provides comprehensive documentation of the Text Layer and Shape Layer APIs in the Adobe After Effects C++ SDK (AEGP). It covers text document access, text layer manipulation, text styling properties, shape layer architecture, path manipulation, and the significant limitations developers face when working with these layer types programmatically.

**Key Finding**: While the AEGP SDK provides robust APIs for text layer access through `AEGP_TextDocumentSuite` and `AEGP_TextLayerSuite`, **direct shape layer access is severely limited** in the public API. Shape layers must be manipulated indirectly through mask APIs and dynamic stream casting.

---

## Table of Contents

1. [Text Document Suite API](#1-text-document-suite-api)
2. [Text Layer Suite API](#2-text-layer-suite-api)
3. [Text Properties](#3-text-properties)
4. [Per-Character Styling & Animators](#4-per-character-styling--animators)
5. [Text Path Options](#5-text-path-options)
6. [Shape Layer Architecture](#6-shape-layer-architecture)
7. [Shape Groups and Paths](#7-shape-groups-and-paths)
8. [Shape Effects](#8-shape-effects)
9. [Parametric Shapes](#9-parametric-shapes)
10. [Bezier Path Manipulation](#10-bezier-path-manipulation)
11. [Key Data Structures](#11-key-data-structures)
12. [Limitations and Workarounds](#12-limitations-and-workarounds)
13. [Code Examples](#13-code-examples)
14. [References](#14-references)

---

## 1. Text Document Suite API

### AEGP_TextDocumentSuite1

The `AEGP_TextDocumentSuite1` provides access to text content on text layers. Text documents are accessed through stream values containing `AEGP_TextDocumentH` handles.

#### Suite Definition

```cpp
#define kAEGPTextDocumentSuite "AEGP Text Document Suite"
#define kAEGPTextDocumentSuiteVersion1 1

// Access via suite handler
AEGP_SUITE_ACCESS_BOILERPLATE(TextDocumentSuite, 1, AEGP_,
    text_document_suite1P, kAEGPTextDocumentSuite, kAEGPTextDocumentSuiteVersion1)
```

#### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `AEGP_GetNewText` | `(AEGP_PluginID id, AEGP_TextDocumentH docH, AEGP_MemHandle *unicodeH)` | Retrieves UTF-16 NULL-terminated string from text document. Returns handle of `A_u_short` that must be disposed with `AEGP_FreeMemHandle`. |
| `AEGP_SetText` | `(AEGP_TextDocumentH docH, const A_u_short *unicodeZ, A_long lengthL)` | Sets text content using UTF-16 string input with specified length. |

#### Accessing Text Documents

Text documents are accessed through the stream system:

```cpp
AEGP_StreamRefH text_streamH = NULL;
AEGP_StreamValue val;
A_Time timeT = {0, 1};

// Get the SOURCE_TEXT stream from the text layer
ERR(suites.StreamSuite2()->AEGP_GetNewLayerStream(
    pluginID,
    layerH,
    AEGP_LayerStream_SOURCE_TEXT,  // Key enum for text layers
    &text_streamH));

// Get the stream value at a specific time
ERR(suites.StreamSuite2()->AEGP_GetNewStreamValue(
    pluginID,
    text_streamH,
    AEGP_LTimeMode_LayerTime,
    &timeT,
    TRUE,  // Pre-expression value
    &val));

// Access the text document handle
AEGP_TextDocumentH textDocH = val.val.text_documentH;

// Get the actual text content
AEGP_MemHandle textMemH;
ERR(suites.TextDocumentSuite1()->AEGP_GetNewText(
    pluginID,
    textDocH,
    &textMemH));
```

---

## 2. Text Layer Suite API

### AEGP_TextLayerSuite1

The `AEGP_TextLayerSuite1` provides access to text outline geometry - the actual bezier paths that make up rendered text characters.

#### Suite Definition

```cpp
#define kAEGPTextLayerSuite "AEGP Text Layer Suite"
#define kAEGPTextLayerSuiteVersion1 1
```

#### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `AEGP_GetNewTextOutlines` | `(AEGP_LayerH layerH, const A_Time *timePT, AEGP_TextOutlinesH *outlinesPH)` | Allocates text outline handles for a text layer at specified time. Returns NULL if not a text layer. Caller must dispose. |
| `AEGP_DisposeTextOutlines` | `(AEGP_TextOutlinesH outlinesH)` | Releases allocated outline structures. |
| `AEGP_GetNumTextOutlines` | `(AEGP_TextOutlinesH outlinesH, A_long *num_outlinesL)` | Returns the number of outline paths. |
| `AEGP_GetIndexedTextOutline` | `(AEGP_TextOutlinesH outlinesH, A_long indexL, PF_PathOutlinePtr *pathPP)` | Retrieves a `PF_PathOutlinePtr` for the specified outline index. Do NOT dispose the returned pointer. |

#### Text Outline Workflow

```cpp
AEGP_TextOutlinesH textOutlinesH = NULL;
PF_PathOutlinePtr pathPtr = NULL;
A_long numOutlines = 0;
A_Time time = {0, 1};

// Get all outlines for the text layer
ERR(suites.TextLayerSuite1()->AEGP_GetNewTextOutlines(
    layerH,
    &time,
    &textOutlinesH));

// Get the count
ERR(suites.TextLayerSuite1()->AEGP_GetNumTextOutlines(
    textOutlinesH,
    &numOutlines));

// Iterate through outlines
for (A_long i = 0; i < numOutlines; i++) {
    ERR(suites.TextLayerSuite1()->AEGP_GetIndexedTextOutline(
        textOutlinesH,
        i,
        &pathPtr));

    // Use PF_PathDataSuite to access path vertices
    PF_PathVertex vertex;
    ERR(suites.PathDataSuite1()->PF_PathVertexInfo(
        effectRef,
        pathPtr,
        vertexIndex,
        &vertex));
}

// Clean up
ERR(suites.TextLayerSuite1()->AEGP_DisposeTextOutlines(textOutlinesH));
```

---

## 3. Text Properties

### Available Text Properties via Scripting/Expressions

The following properties are accessible through the TextDocument object and expressions:

#### Character Properties

| Property | Type | Range | Description |
|----------|------|-------|-------------|
| `font` | String | - | Font specified by PostScript name |
| `fontSize` | Float | 0.1-1296 | Size in pixels |
| `fontFamily` | String | - | Font family name (read-only) |
| `fontStyle` | String | - | Style info like "bold" or "italic" (read-only) |
| `tracking` | Float | - | Spacing between characters |
| `leading` | Float | - | Spacing between lines |
| `baselineShift` | Float | - | Baseline shift in pixels |
| `kerning` | Integer | - | Kerning value (AE 24.0+) |
| `horizontalScale` | Float | - | Horizontal scale in pixels |
| `verticalScale` | Float | - | Vertical scale in pixels |

#### Color & Stroke Properties

| Property | Type | Description |
|----------|------|-------------|
| `applyFill` | Boolean | Shows fill when true |
| `fillColor` | [r,g,b] | Fill color as floating-point values (0-1) |
| `applyStroke` | Boolean | Shows stroke when true |
| `strokeColor` | [r,g,b] | Stroke color values (0-1) |
| `strokeWidth` | Float | Stroke thickness in pixels (0-1000) |
| `strokeOverFill` | Boolean | Determines rendering order |

#### Text Effects

| Property | Type | Description |
|----------|------|-------------|
| `fauxBold` | Boolean | Faux bold enabled |
| `fauxItalic` | Boolean | Faux italic enabled |
| `subscript` | Boolean | Subscript enabled (read-only) |
| `superscript` | Boolean | Superscript enabled (read-only) |
| `allCaps` | Boolean | All caps enabled (read-only) |
| `smallCaps` | Boolean | Small caps enabled (read-only) |

#### Paragraph Properties (AE 24.0+)

| Property | Type | Description |
|----------|------|-------------|
| `justification` | Enum | Text alignment (alignLeft, alignCenter, alignRight, justifyFull) |
| `autoLeading` | Boolean | Auto-leading setting |
| `autoHyphenate` | Boolean | Hyphenation control |
| `spaceAfter` | Float | Space after paragraph |
| `spaceBefore` | Float | Space before paragraph |
| `startIndent` | Float | Paragraph start indent |
| `endIndent` | Float | Paragraph end indent |
| `firstLineIndent` | Float | First line indent |
| `direction` | Enum | Left-to-right or right-to-left |

#### Box Text Properties

| Property | Type | Description |
|----------|------|-------------|
| `boxText` | Boolean | True for paragraph text (read-only) |
| `pointText` | Boolean | True for point text (read-only) |
| `boxTextSize` | [w,h] | Box dimensions |
| `boxTextPos` | [x,y] | Position from anchor point |
| `boxVerticalAlignment` | Enum | Vertical alignment (AE 24.6+) |
| `boxOverflow` | Boolean | Text overflow status (read-only, AE 24.6+) |

### SDK Access to Text Properties

In the C++ SDK, text properties are accessed through the stream system and dynamic streams. The `AEGP_StreamValue` union contains `text_documentH` for text layer streams.

---

## 4. Per-Character Styling & Animators

### Per-Character Styling (AE 25.0+)

After Effects 2025 introduced per-character text styling through expressions. All setter methods support optional per-character styling using additional parameters:

```javascript
// Signature: setFont(value[, startIndex, numOfCharacters])
text.sourceText.style.setFont("Arial", 0, 5)  // First 5 characters
text.sourceText.style.setFontSize(48, 5, 3)   // Characters 5-7
text.sourceText.style.setFillColor([1,0,0], 0, 1)  // First character red
```

#### Available Per-Character Methods

- `setFont(value, startIndex, numChars)`
- `setFontSize(value, startIndex, numChars)`
- `setTracking(value, startIndex, numChars)`
- `setLeading(value, startIndex, numChars)`
- `setFillColor(value, startIndex, numChars)`
- `setStrokeColor(value, startIndex, numChars)`
- `setStrokeWidth(value, startIndex, numChars)`
- `setFauxBold(value, startIndex, numChars)`
- `setFauxItalic(value, startIndex, numChars)`
- `setSmallCaps(value, startIndex, numChars)`
- `setAllCaps(value, startIndex, numChars)`
- `setBaselineShift(value, startIndex, numChars)`

#### Method Chaining

All methods return TextStyle objects, enabling chaining:

```javascript
text.sourceText.style
    .setFont("Arial")
    .setFontSize(24)
    .setFillColor([1,0,0])
    .setText("Hello World")
```

### Text Animators

Text animators allow animation of individual characters, words, or lines. They work through:

1. **Range Selectors** - Define which characters are affected
2. **Expression Selectors** - Use expressions for per-character control
3. **Animator Properties** - Transform, opacity, color, etc.

#### Expression Selector Example

```javascript
// In Expression Selector > Amount
delay = 0.1;
myDelay = delay * textIndex;
t = (time - inPoint) - myDelay;
// Apply easing or animation based on t
```

### SDK Access to Text Animators

Text animators are accessed through `AEGP_DynamicStreamSuite`:

```cpp
// Access animator groups through dynamic streams
AEGP_StreamRefH animatorStreamH = NULL;
ERR(suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByMatchname(
    pluginID,
    layerStreamH,
    "ADBE Text Animators",  // Match name for animator group
    &animatorStreamH));
```

---

## 5. Text Path Options

Text can follow mask paths on the text layer. Path options include:

| Property | Description |
|----------|-------------|
| Path | Mask to use as path (None or Mask name) |
| Reverse Path | Flip text to other side of path |
| Perpendicular to Path | Keep text upright or rotate to follow angle |
| Force Alignment | Center text on path |
| First Margin | Animate/adjust text start position |
| Last Margin | Animate/adjust text end position |

### SDK Access

Path options are accessed through dynamic streams using match names:

```cpp
// Path options match names (approximate)
"ADBE Text Path Options"
"ADBE Text Path"
"ADBE Text Reverse Path"
"ADBE Text Perpendicular to Path"
"ADBE Text Force Alignment"
"ADBE Text First Margin"
"ADBE Text Last Margin"
```

**Note**: Specific SDK functions for manipulating text path options are limited. Most manipulation is done through:
1. Creating/modifying masks on the text layer
2. Setting the Path property to reference the mask
3. Animating path option properties through keyframes

---

## 6. Shape Layer Architecture

### Overview

**Critical Limitation**: The public AEGP API does not provide direct access to shape layer infrastructure. Shape layers must be manipulated indirectly through mask APIs and dynamic stream casting.

### Shape Layer Stream Hierarchy

```
ADBE Vector Layer (Layer)
└── ADBE Root Vectors Group (Contents)
    └── ADBE Vector Group (Group - e.g., "Rectangle 1")
        ├── ADBE Vectors Group (Group Contents)
        │   ├── ADBE Vector Shape - Rect (Rectangle)
        │   ├── ADBE Vector Graphic - Fill (Fill)
        │   └── ADBE Vector Graphic - Stroke (Stroke)
        ├── ADBE Vector Transform Group (Transform)
        ├── ADBE Vector Blend Mode (Blend Mode)
        └── ADBE Vector Materials Group (Material Options)
```

### Accessing Shape Layers via Dynamic Streams

```cpp
AEGP_StreamRefH rootContentsH = NULL;
AEGP_StreamRefH groupStreamH = NULL;

// Get the root contents group
ERR(suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByMatchname(
    pluginID,
    layerStreamH,
    "ADBE Root Vectors Group",
    &rootContentsH));

// Navigate to a specific group
ERR(suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByIndex(
    pluginID,
    rootContentsH,
    0,  // First group index
    &groupStreamH));
```

---

## 7. Shape Groups and Paths

### Shape Layer Match Names

#### Core Structure

| Match Name | Display Name |
|------------|--------------|
| `ADBE Vector Layer` | Layer |
| `ADBE Root Vectors Group` | Contents |
| `ADBE Vector Group` | Group |
| `ADBE Vectors Group` | Contents (within group) |
| `ADBE Vector Transform Group` | Transform |
| `ADBE Vector Blend Mode` | Blend Mode |
| `ADBE Vector Materials Group` | Material Options |

#### Transform Properties

| Match Name | Property |
|------------|----------|
| `ADBE Vector Anchor` | Anchor Point |
| `ADBE Vector Position` | Position |
| `ADBE Vector Scale` | Scale |
| `ADBE Vector Skew` | Skew |
| `ADBE Vector Skew Axis` | Skew Axis |
| `ADBE Vector Rotation` | Rotation |
| `ADBE Vector Group Opacity` | Opacity |

#### Path Properties

| Match Name | Property |
|------------|----------|
| `ADBE Vector Shape - Group` | Path Group |
| `ADBE Vector Shape` | Path |
| `ADBE Vector Shape Direction` | Shape Direction |

### Shape Object Structure

```javascript
// Shape object properties (scripting reference)
{
    vertices: [[x,y], [x,y], ...],    // Anchor points
    inTangents: [[dx,dy], ...],        // Incoming tangent vectors (relative to vertex)
    outTangents: [[dx,dy], ...],       // Outgoing tangent vectors (relative to vertex)
    closed: true/false                  // Whether path is closed
}
```

#### Tangent Behavior

- Tangent values are **relative to the associated vertex**
- Example: `[-1, -1]` is above and to the left with 45-degree slope
- Default `[0, 0]` creates straight line segments
- Longer tangents create more pronounced curves
- RotoBezier paths calculate tangents automatically (tangent values ignored)

---

## 8. Shape Effects

### Fill & Stroke

#### Fill Properties

| Match Name | Property |
|------------|----------|
| `ADBE Vector Graphic - Fill` | Fill |
| `ADBE Vector Fill Color` | Color |
| `ADBE Vector Fill Opacity` | Opacity |
| `ADBE Vector Fill Rule` | Fill Rule |
| `ADBE Vector Composite Order` | Composite |
| `ADBE Vector Blend Mode` | Blend Mode |

#### Stroke Properties

| Match Name | Property |
|------------|----------|
| `ADBE Vector Graphic - Stroke` | Stroke |
| `ADBE Vector Stroke Color` | Color |
| `ADBE Vector Stroke Opacity` | Opacity |
| `ADBE Vector Stroke Width` | Stroke Width |
| `ADBE Vector Stroke Line Cap` | Line Cap |
| `ADBE Vector Stroke Line Join` | Line Join |
| `ADBE Vector Stroke Miter Limit` | Miter Limit |

#### Gradient Fill/Stroke

| Match Name | Property |
|------------|----------|
| `ADBE Vector Graphic - G-Fill` | Gradient Fill |
| `ADBE Vector Graphic - G-Stroke` | Gradient Stroke |

### Shape Modifiers

| Match Name | Display Name |
|------------|--------------|
| `ADBE Vector Filter - Merge` | Merge Paths |
| `ADBE Vector Filter - Offset` | Offset Paths |
| `ADBE Vector Filter - PB` | Pucker & Bloat |
| `ADBE Vector Filter - Repeater` | Repeater |
| `ADBE Vector Filter - RC` | Round Corners |
| `ADBE Vector Filter - Trim` | Trim Paths |
| `ADBE Vector Filter - Twist` | Twist |
| `ADBE Vector Filter - Roughen` | Wiggle Paths |
| `ADBE Vector Filter - Wiggler` | Wiggle Transform |
| `ADBE Vector Filter - Zigzag` | Zig Zag |

### Repeater Properties

| Match Name | Property |
|------------|----------|
| `ADBE Vector Repeater Copies` | Copies |
| `ADBE Vector Repeater Offset` | Offset |
| `ADBE Vector Repeater Transform` | Transform |
| `ADBE Vector Repeater Position` | Position |
| `ADBE Vector Repeater Rotation` | Rotation |
| `ADBE Vector Repeater Scale` | Scale |
| `ADBE Vector Repeater Start Opacity` | Start Opacity |
| `ADBE Vector Repeater End Opacity` | End Opacity |

---

## 9. Parametric Shapes

### Rectangle

| Match Name | Property |
|------------|----------|
| `ADBE Vector Shape - Rect` | Rectangle |
| `ADBE Vector Rect Size` | Size |
| `ADBE Vector Rect Position` | Position |
| `ADBE Vector Rect Roundness` | Roundness |

### Ellipse

| Match Name | Property |
|------------|----------|
| `ADBE Vector Shape - Ellipse` | Ellipse |
| `ADBE Vector Ellipse Size` | Size |
| `ADBE Vector Ellipse Position` | Position |

### Polystar

| Match Name | Property |
|------------|----------|
| `ADBE Vector Shape - Star` | Polystar |
| `ADBE Vector Star Type` | Type (Star/Polygon) |
| `ADBE Vector Star Points` | Points |
| `ADBE Vector Star Position` | Position |
| `ADBE Vector Star Rotation` | Rotation |
| `ADBE Vector Star Inner Radius` | Inner Radius |
| `ADBE Vector Star Outer Radius` | Outer Radius |
| `ADBE Vector Star Inner Roundness` | Inner Roundness |
| `ADBE Vector Star Outer Roundness` | Outer Roundness |

### Converting Parametric to Bezier

Parametric shapes can be converted to bezier paths in After Effects via:
- Right-click shape > "Convert to Bezier Path"
- This creates a standard path that can be edited vertex-by-vertex

In SDK context, parametric shapes are accessible only through their parameter streams, not as editable bezier data.

---

## 10. Bezier Path Manipulation

### PF_PathVertex Structure

```cpp
typedef struct {
    PF_FpLong x;          // Vertex X position
    PF_FpLong y;          // Vertex Y position
    PF_FpLong tan_in_x;   // Incoming tangent X (relative to vertex)
    PF_FpLong tan_in_y;   // Incoming tangent Y (relative to vertex)
    PF_FpLong tan_out_x;  // Outgoing tangent X (relative to vertex)
    PF_FpLong tan_out_y;  // Outgoing tangent Y (relative to vertex)
} PF_PathVertex;

// AEGP equivalent
typedef PF_PathVertex AEGP_MaskVertex;
```

### PF_PathDataSuite1 Functions

| Function | Description |
|----------|-------------|
| `PF_PathIsOpen` | Determines if path lacks closure between endpoints |
| `PF_PathNumSegments` | Gets segment count (N segments have indices [0..N-1]) |
| `PF_PathVertexInfo` | Retrieves vertex at specified index |
| `PF_PathPrepareSegLength` | Prepares segment length calculation (frequencyL typically=100) |
| `PF_PathGetSegLength` | Returns segment length |
| `PF_PathEvalSegLength` | Gets point location at distance along segment |
| `PF_PathEvalSegLengthDeriv1` | Returns location and first derivative |
| `PF_PathCleanupSegLength` | Releases preparation resources |
| `PF_PathIsInverted` | Checks inversion status |
| `PF_PathGetMaskMode` | Gets mode (ADD, SUBTRACT, INTERSECT, LIGHTEN, DARKEN, DIFFERENCE, ACCUM) |
| `PF_PathGetName` | Gets path name (max `PF_MAX_PATH_NAME_LEN`) |

### PF_PathQuerySuite1 Functions

| Function | Description |
|----------|-------------|
| `PF_NumPaths` | Counts paths on source layer |
| `PF_PathInfo` | Gets `PF_PathID` at specified index |
| `PF_CheckoutPath` | Acquires `PF_PathOutlinePtr` at given time |
| `PF_CheckinPath` | Releases path (must balance every checkout) |

### AEGP_MaskOutlineSuite3 Functions

| Function | Description |
|----------|-------------|
| `AEGP_IsMaskOutlineOpen` | Checks if mask outline is open |
| `AEGP_SetMaskOutlineOpen` | Sets open/closed state |
| `AEGP_GetMaskOutlineNumSegments` | Gets segment count |
| `AEGP_GetMaskOutlineVertexInfo` | Gets vertex at index (tangents relative to position) |
| `AEGP_SetMaskOutlineVertexInfo` | Sets vertex information |
| `AEGP_CreateMaskOutlineFeather` | Creates feather point |
| `AEGP_DeleteMaskOutlineFeather` | Deletes feather point |

### Critical Path Access Requirements

1. **Always checkout before access** - Paths don't update without explicit checkout
2. **Always checkin** - Imbalanced checkouts cause problems
3. **Vertex indices** - For closed masks, `vertex[0] == vertex[num_segments]`
4. **Tangents are relative** - Add tangent to vertex position for absolute coordinates

---

## 11. Key Data Structures

### Text-Related Handles

```cpp
// Opaque handle to text document
typedef struct AEGP_TextDocument *AEGP_TextDocumentH;

// Opaque handle to text outlines
typedef struct AEGP_TextOutlines *AEGP_TextOutlinesH;

// Stream value union includes text_documentH
typedef union {
    A_long          four_d[4];
    A_FpLong        four_dF[4];
    AEGP_TwoDVal    two_d;
    AEGP_ThreeDVal  three_d;
    AEGP_ColorVal   color;
    AEGP_LayerIDVal layer_id;
    AEGP_MaskIDVal  mask_id;
    AEGP_TextDocumentH text_documentH;  // For text layers
    // ... other types
} AEGP_StreamVal;
```

### Path/Mask Structures

```cpp
// Vertex index types
typedef A_long AEGP_VertexIndex;
typedef A_long AEGP_FeatherIndex;
#define AEGP_VertexIndex_END 10922

// Mask vertex (same as PF_PathVertex)
typedef PF_PathVertex AEGP_MaskVertex;

// Feather structure
typedef struct {
    A_long segment;        // Which segment
    PF_FpLong segment_loc; // Position along segment (0-1)
    PF_FpLong radius;      // Feather radius (negative = inner)
    A_long type;           // 0=outer, 1=inner
    PF_FpLong tension;     // 0-1
    A_long interp;         // 0=standard, 1=hold
    PF_FpLong rel_corner_angle;
} AEGP_MaskFeather;
```

### Stream Grouping Types

```cpp
typedef enum {
    AEGP_StreamGroupingType_NONE = 0,
    AEGP_StreamGroupingType_LEAF,      // Single value stream
    AEGP_StreamGroupingType_NAMED_GROUP,
    AEGP_StreamGroupingType_INDEXED_GROUP  // Array of streams
} AEGP_StreamGroupingType;
```

---

## 12. Limitations and Workarounds

### Critical Limitations

#### 1. No Direct Shape Layer Access

**Problem**: The public AEGP API does not expose shape layer infrastructure directly.

**Workaround**: Use mask APIs and cast data to shape layer property streams:
```cpp
// The workaround pattern:
// 1. Use AEGP_MaskOutlineSuite to create/manipulate path data
// 2. Cast the mask data as a shape layer property stream
// 3. Apply to shape path stream using DynamicStreamSuite
```

#### 2. Cannot Create AEGP_TextDocumentH From Scratch

**Problem**: There's no way to create a new `AEGP_StreamValue` containing a proper `AEGP_TextDocumentH` structure from scratch.

**Workaround**: Call `AEGP_GetNewStreamValue()` first to get an existing object, then modify it:
```cpp
// Get existing value, modify, then set
AEGP_StreamValue val;
ERR(suites.StreamSuite2()->AEGP_GetNewStreamValue(id, streamH, mode, &time, TRUE, &val));
ERR(suites.TextDocumentSuite1()->AEGP_SetText(val.val.text_documentH, newText, length));
ERR(suites.StreamSuite2()->AEGP_SetStreamValue(id, streamH, &val));
```

#### 3. Text Outline Access Limitations

**Problem**: `PF_CheckoutPath` is intended for mask paths, not text outlines.

**Workaround**: Use `PF_PathVertexInfo` which IS valid for text outlines:
```cpp
// This works for text outlines
ERR(suites.PathDataSuite1()->PF_PathVertexInfo(
    effectRef,
    textOutlinePtr,
    vertexIndex,
    &vertex));
```

#### 4. Stream References Invalidated Easily

**Problem**: Information about layers, streams, and items doesn't survive long. Adding/removing items invalidates references.

**Workaround**:
- Acquire references immediately before use
- Release immediately after
- Re-acquire if the project structure changes

#### 5. No Per-Character Style Access in C++ SDK

**Problem**: The C++ SDK doesn't expose per-character styling APIs directly (only available via expressions/scripting since AE 25.0).

**Workaround**:
- Use expressions for per-character styling
- Manipulate text animators through dynamic streams
- Consider using ExtendScript or the scripting API for complex text formatting

### Shape Layer Workaround Pattern

```cpp
// Conceptual workaround for shape layer path manipulation:

// 1. Get the shape path stream
AEGP_StreamRefH shapePathStreamH = NULL;
ERR(suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByMatchname(
    pluginID, groupStreamH, "ADBE Vector Shape", &shapePathStreamH));

// 2. Get stream value (contains path data in mask-compatible format)
AEGP_StreamValue val;
ERR(suites.StreamSuite2()->AEGP_GetNewStreamValue(..., &val));

// 3. Manipulate using mask outline suite functions
// (The path data structure is compatible)

// 4. Set the modified value back
ERR(suites.StreamSuite2()->AEGP_SetStreamValue(...));
```

---

## 13. Code Examples

### Example 1: Reading Text From a Text Layer

```cpp
A_Err ReadTextLayerContent(
    AEGP_PluginID pluginID,
    AEGP_LayerH layerH,
    A_UTF16Char **textOut)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pluginID);

    AEGP_StreamRefH textStreamH = NULL;
    AEGP_StreamValue val;
    AEGP_MemHandle textMemH = NULL;
    A_Time timeT = {0, 1};

    // Get SOURCE_TEXT stream
    ERR(suites.StreamSuite2()->AEGP_GetNewLayerStream(
        pluginID,
        layerH,
        AEGP_LayerStream_SOURCE_TEXT,
        &textStreamH));

    if (!err && textStreamH) {
        // Get value at current time
        ERR(suites.StreamSuite2()->AEGP_GetNewStreamValue(
            pluginID,
            textStreamH,
            AEGP_LTimeMode_LayerTime,
            &timeT,
            TRUE,
            &val));

        if (!err) {
            // Extract text from document
            ERR(suites.TextDocumentSuite1()->AEGP_GetNewText(
                pluginID,
                val.val.text_documentH,
                &textMemH));

            if (!err && textMemH) {
                // Lock and copy text
                A_UTF16Char *textPtr = NULL;
                ERR(suites.MemorySuite1()->AEGP_LockMemHandle(
                    textMemH,
                    (void**)&textPtr));

                // Copy to output (caller responsible for allocation)
                // ...

                ERR(suites.MemorySuite1()->AEGP_UnlockMemHandle(textMemH));
                ERR(suites.MemorySuite1()->AEGP_FreeMemHandle(textMemH));
            }

            // Dispose stream value
            ERR(suites.StreamSuite2()->AEGP_DisposeStreamValue(&val));
        }

        // Dispose stream ref
        ERR(suites.StreamSuite2()->AEGP_DisposeStreamRefH(textStreamH));
    }

    return err;
}
```

### Example 2: Setting Text Content

```cpp
A_Err SetTextLayerContent(
    AEGP_PluginID pluginID,
    AEGP_LayerH layerH,
    const A_UTF16Char *newText,
    A_long textLength)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pluginID);

    AEGP_StreamRefH textStreamH = NULL;
    AEGP_StreamValue2 val;
    A_Time timeT = {0, 1};

    // Get SOURCE_TEXT stream
    ERR(suites.StreamSuite2()->AEGP_GetNewLayerStream(
        pluginID,
        layerH,
        AEGP_LayerStream_SOURCE_TEXT,
        &textStreamH));

    if (!err && textStreamH) {
        // Get current value (required - can't create from scratch)
        ERR(suites.StreamSuite2()->AEGP_GetNewStreamValue(
            pluginID,
            textStreamH,
            AEGP_LTimeMode_LayerTime,
            &timeT,
            TRUE,
            &val));

        if (!err) {
            // Set new text in the document
            ERR(suites.TextDocumentSuite1()->AEGP_SetText(
                val.val.text_documentH,
                newText,
                textLength));

            // Apply the modified value
            ERR(suites.StreamSuite2()->AEGP_SetStreamValue(
                pluginID,
                textStreamH,
                &val));

            // Don't dispose val when using SetStreamValue
        }

        ERR(suites.StreamSuite2()->AEGP_DisposeStreamRefH(textStreamH));
    }

    return err;
}
```

### Example 3: Accessing Text Outlines

```cpp
A_Err ProcessTextOutlines(
    AEGP_PluginID pluginID,
    AEGP_LayerH layerH,
    PF_EffectRef effectRef)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pluginID);

    AEGP_TextOutlinesH outlinesH = NULL;
    A_Time timeT = {0, 1};
    A_long numOutlines = 0;

    // Get all text outlines
    ERR(suites.TextLayerSuite1()->AEGP_GetNewTextOutlines(
        layerH,
        &timeT,
        &outlinesH));

    if (!err && outlinesH) {
        ERR(suites.TextLayerSuite1()->AEGP_GetNumTextOutlines(
            outlinesH,
            &numOutlines));

        for (A_long i = 0; i < numOutlines && !err; i++) {
            PF_PathOutlinePtr pathPtr = NULL;

            ERR(suites.TextLayerSuite1()->AEGP_GetIndexedTextOutline(
                outlinesH,
                i,
                &pathPtr));

            if (!err && pathPtr) {
                A_long numSegments = 0;

                // Get segment count
                ERR(suites.PathDataSuite1()->PF_PathNumSegments(
                    effectRef,
                    pathPtr,
                    &numSegments));

                // Process each vertex
                for (A_long v = 0; v <= numSegments && !err; v++) {
                    PF_PathVertex vertex;

                    ERR(suites.PathDataSuite1()->PF_PathVertexInfo(
                        effectRef,
                        pathPtr,
                        v,
                        &vertex));

                    // Process vertex data
                    // vertex.x, vertex.y - position
                    // vertex.tan_in_x, vertex.tan_in_y - incoming tangent
                    // vertex.tan_out_x, vertex.tan_out_y - outgoing tangent
                }

                // Note: Don't dispose pathPtr
            }
        }

        // Clean up outlines
        ERR(suites.TextLayerSuite1()->AEGP_DisposeTextOutlines(outlinesH));
    }

    return err;
}
```

### Example 4: Accessing Shape Layer Properties

```cpp
A_Err AccessShapeLayerProperties(
    AEGP_PluginID pluginID,
    AEGP_LayerH layerH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pluginID);

    AEGP_StreamRefH layerStreamH = NULL;
    AEGP_StreamRefH contentsH = NULL;
    AEGP_StreamRefH groupH = NULL;
    AEGP_StreamRefH fillColorH = NULL;

    // Get layer's root stream
    ERR(suites.StreamSuite2()->AEGP_GetNewLayerStream(
        pluginID,
        layerH,
        AEGP_LayerStream_NONE,  // Root
        &layerStreamH));

    if (!err) {
        // Navigate to Contents (Root Vectors Group)
        ERR(suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByMatchname(
            pluginID,
            layerStreamH,
            "ADBE Root Vectors Group",
            &contentsH));
    }

    if (!err && contentsH) {
        // Get first shape group
        ERR(suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByIndex(
            pluginID,
            contentsH,
            0,
            &groupH));
    }

    if (!err && groupH) {
        // Navigate to fill color
        ERR(suites.DynamicStreamSuite4()->AEGP_GetNewStreamRefByMatchname(
            pluginID,
            groupH,
            "ADBE Vector Fill Color",
            &fillColorH));

        if (!err && fillColorH) {
            AEGP_StreamValue val;
            A_Time timeT = {0, 1};

            ERR(suites.StreamSuite2()->AEGP_GetNewStreamValue(
                pluginID,
                fillColorH,
                AEGP_LTimeMode_CompTime,
                &timeT,
                FALSE,
                &val));

            if (!err) {
                // Access color value
                A_FpLong r = val.val.color.redF;
                A_FpLong g = val.val.color.greenF;
                A_FpLong b = val.val.color.blueF;

                ERR(suites.StreamSuite2()->AEGP_DisposeStreamValue(&val));
            }

            ERR(suites.StreamSuite2()->AEGP_DisposeStreamRefH(fillColorH));
        }

        ERR(suites.StreamSuite2()->AEGP_DisposeStreamRefH(groupH));
    }

    if (contentsH) {
        ERR(suites.StreamSuite2()->AEGP_DisposeStreamRefH(contentsH));
    }
    if (layerStreamH) {
        ERR(suites.StreamSuite2()->AEGP_DisposeStreamRefH(layerStreamH));
    }

    return err;
}
```

### Example 5: Manipulating Mask Vertices

```cpp
A_Err ModifyMaskVertex(
    AEGP_PluginID pluginID,
    AEGP_MaskRefH maskH,
    A_long vertexIndex,
    PF_FpLong newX,
    PF_FpLong newY)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pluginID);

    AEGP_StreamRefH maskStreamH = NULL;
    AEGP_MaskOutlineValH outlineValH = NULL;

    // Get mask stream
    ERR(suites.MaskSuite6()->AEGP_GetNewMaskStream(
        pluginID,
        maskH,
        AEGP_MaskStream_OUTLINE,
        &maskStreamH));

    if (!err && maskStreamH) {
        AEGP_StreamValue val;
        A_Time timeT = {0, 1};

        // Get outline value
        ERR(suites.StreamSuite2()->AEGP_GetNewStreamValue(
            pluginID,
            maskStreamH,
            AEGP_LTimeMode_LayerTime,
            &timeT,
            TRUE,
            &val));

        if (!err) {
            outlineValH = val.val.mask;

            // Get current vertex info
            AEGP_MaskVertex vertex;
            ERR(suites.MaskOutlineSuite3()->AEGP_GetMaskOutlineVertexInfo(
                outlineValH,
                vertexIndex,
                &vertex));

            if (!err) {
                // Modify vertex position
                vertex.x = newX;
                vertex.y = newY;

                // Set updated vertex
                ERR(suites.MaskOutlineSuite3()->AEGP_SetMaskOutlineVertexInfo(
                    outlineValH,
                    vertexIndex,
                    &vertex));

                if (!err) {
                    // Apply changes to stream
                    ERR(suites.StreamSuite2()->AEGP_SetStreamValue(
                        pluginID,
                        maskStreamH,
                        &val));
                }
            }
        }

        ERR(suites.StreamSuite2()->AEGP_DisposeStreamRefH(maskStreamH));
    }

    return err;
}
```

---

## 14. References

### Official Documentation

- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [AEGP Suites Reference](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Working With Paths](https://ae-plugins.docsforadobe.dev/effect-details/working-with-paths/)
- [Data Types](https://ae-plugins.docsforadobe.dev/aegps/data-types/)
- [Adobe Developer Portal - After Effects](https://developer.adobe.com/after-effects/)

### Scripting References

- [After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
- [TextDocument Object](https://ae-scripting.docsforadobe.dev/text/textdocument/)
- [Shape Layer Match Names](https://ae-scripting.docsforadobe.dev/matchnames/layer/shapelayer/)
- [Shape Object](https://ae-scripting.docsforadobe.dev/other/shape/)

### Expression References

- [Text Style Expressions](https://ae-expressions.docsforadobe.dev/text/style/)
- [Path Property](https://ae-expressions.docsforadobe.dev/objects/path-property/)

### SDK Headers (GitHub Archives)

- [AE_GeneralPlug.h](https://github.com/takahirome/AdobeScripts/blob/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Headers/AE_GeneralPlug.h)
- [AE_EffectSuites.h](https://github.com/takahirome/AdobeScripts/blob/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Headers/AE_EffectSuites.h)
- [AEGP_SuiteHandler.h](https://github.com/takahirome/AdobeScripts/blob/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Util/AEGP_SuiteHandler.h)

### Sample Projects

- **Text Twiddler** - SDK example for text layer manipulation
- **Streamie** - SDK example for stream access patterns
- **PathMaster** - SDK example for path manipulation

### Community Resources

- [Adobe After Effects SDK Forum](https://community.adobe.com/t5/after-effects-discussions/ct-p/after-effects-discussions)
- [Creative COW After Effects Forums](https://creativecow.net/forums/after-effects/)

---

## Appendix A: Complete Match Name Reference

### Text Layer Match Names

```
ADBE Text Layer                    → Text Layer
ADBE Text Properties               → Text Properties
ADBE Text Document                 → Source Text
ADBE Text Path Options             → Path Options
ADBE Text More Options             → More Options
ADBE Text Animators                → Animators
ADBE Text Animator                 → Animator
ADBE Text Selector                 → Range Selector
ADBE Text Expressionor Selector    → Expression Selector
ADBE Text Wiggly Selector          → Wiggly Selector
```

### Shape Layer Match Names (Complete)

```
ADBE Vector Layer                  → Shape Layer
ADBE Root Vectors Group            → Contents
ADBE Vector Group                  → Group
ADBE Vectors Group                 → Contents (in group)
ADBE Vector Blend Mode             → Blend Mode
ADBE Vector Transform Group        → Transform

# Parametric Shapes
ADBE Vector Shape - Rect           → Rectangle
ADBE Vector Shape - Ellipse        → Ellipse
ADBE Vector Shape - Star           → Polystar

# Path
ADBE Vector Shape - Group          → Path
ADBE Vector Shape                  → Path
ADBE Vector Shape Direction        → Direction

# Fill & Stroke
ADBE Vector Graphic - Fill         → Fill
ADBE Vector Graphic - Stroke       → Stroke
ADBE Vector Graphic - G-Fill       → Gradient Fill
ADBE Vector Graphic - G-Stroke     → Gradient Stroke

# Modifiers
ADBE Vector Filter - Merge         → Merge Paths
ADBE Vector Filter - Offset        → Offset Paths
ADBE Vector Filter - PB            → Pucker & Bloat
ADBE Vector Filter - Repeater      → Repeater
ADBE Vector Filter - RC            → Round Corners
ADBE Vector Filter - Trim          → Trim Paths
ADBE Vector Filter - Twist         → Twist
ADBE Vector Filter - Roughen       → Wiggle Paths
ADBE Vector Filter - Wiggler       → Wiggle Transform
ADBE Vector Filter - Zigzag        → Zig Zag
```

---

*Document Version: 1.0*
*Research Date: December 2024*
*SDK Version Reference: After Effects 2024 (24.x) / 2025 (25.x)*
