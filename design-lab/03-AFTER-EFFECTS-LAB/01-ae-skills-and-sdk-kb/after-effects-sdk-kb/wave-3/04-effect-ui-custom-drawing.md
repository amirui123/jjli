---
source: '[unknown - 04-effect-ui-custom-drawing.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Effect UI & Custom Drawing - After Effects SDK Reference

## Overview

After Effects provides comprehensive APIs for creating custom user interfaces within effects. Effects can provide custom UI in two distinct areas:

1. **Effect Controls Window (ECW)** - Custom controls within the effect's parameter panel
2. **Composition/Layer Windows** - Overlay controls directly on the video preview

This document provides a complete reference for implementing custom UI, handling events, and drawing with the Drawbot API.

---

## Table of Contents

1. [Setup Requirements](#setup-requirements)
2. [Event System Architecture](#event-system-architecture)
3. [PF_EventExtra Structure](#pf_eventextra-structure)
4. [PF_EventUnion - Event Types](#pf_eventunion---event-types)
5. [Drawbot Drawing API](#drawbot-drawing-api)
6. [Custom UI Suites](#custom-ui-suites)
7. [Hit Testing & Coordinate Conversion](#hit-testing--coordinate-conversion)
8. [Cursor Management](#cursor-management)
9. [Drag Interactions](#drag-interactions)
10. [HiDPI/Retina Display Support](#hidpiretina-display-support)
11. [Platform Considerations](#platform-considerations)
12. [Code Examples](#code-examples)
13. [Best Practices](#best-practices)

---

## Setup Requirements

### Global Setup Configuration

Effects using custom UI must configure flags during `PF_Cmd_GLOBAL_SETUP`:

```cpp
case PF_Cmd_GLOBAL_SETUP:
    // Enable custom UI event handling
    out_data->out_flags |= PF_OutFlag_CUSTOM_UI;

    // Optional: Enable UI refresh notifications
    out_data->out_flags |= PF_OutFlag_SEND_UPDATE_PARAMS_UI;
    break;
```

### Parameter Setup Configuration

Parameters with custom controls must set appropriate flags during `PF_Cmd_PARAM_SETUP`:

```cpp
// For ECW custom control parameters
def.ui_flags |= PF_PUI_CONTROL;

// For parameters with no ECW UI (custom comp UI only)
def.ui_flags |= PF_PUI_NO_ECW_UI;

// For invisible parameters (hidden but affect rendering)
def.ui_flags |= PF_PUI_INVISIBLE;

// For visual separator above parameter
def.ui_flags |= PF_PUI_ECW_SEPARATOR;
```

### Event Registration

Effects should register for UI events:

```cpp
// Register for events (typically in PARAM_SETUP)
PF_CustomUIInfo cui;
cui.events = PF_CustomEFlag_NONE;

// For Premiere Pro keydown event support
cui.events |= PF_CustomEFlag_COMP;

// Set comp UI dimensions if needed
cui.comp_ui_width = 100;
cui.comp_ui_height = 100;
cui.comp_ui_alignment = PF_UIAlignment_NONE;
```

### Required Flags Relationship

| Flag | Location | Requirement |
|------|----------|-------------|
| `PF_OutFlag_CUSTOM_UI` | `PF_Cmd_GLOBAL_SETUP` | Required for any custom UI |
| `PF_PUI_CONTROL` | Parameter definition | Requires `PF_OutFlag_CUSTOM_UI` |
| `PF_CustomEFlag_COMP` | `PF_CustomUIInfo` | Required for Premiere Pro keydowns |

---

## Event System Architecture

### Event Flow

```
User Input → After Effects Event Queue → PF_Cmd_EVENT → Effect Handler
                                                              ↓
                                              PF_EventExtra (e_type + union)
                                                              ↓
                                              Event-specific processing
```

### PF_Cmd_EVENT Selector

The `PF_Cmd_EVENT` selector is sent when After Effects needs the effect to handle a UI event. The event details are provided in the `extra` parameter as `PF_EventExtra*`.

```cpp
case PF_Cmd_EVENT:
{
    PF_EventExtra* event_extra = reinterpret_cast<PF_EventExtra*>(extra);

    switch (event_extra->e_type) {
        case PF_Event_NEW_CONTEXT:
            // Handle new context
            break;
        case PF_Event_DRAW:
            // Handle drawing
            break;
        case PF_Event_DO_CLICK:
            // Handle click
            break;
        // ... other events
    }
}
```

### Related Command Selectors

| Selector | Purpose | Notes |
|----------|---------|-------|
| `PF_Cmd_EVENT` | Handle UI events | Main custom UI entry point |
| `PF_Cmd_UPDATE_PARAMS_UI` | Update parameter UI | Cosmetic changes only, no value changes |
| `PF_Cmd_USER_CHANGED_PARAM` | User modified parameter | Validate/modify parameter values |

---

## PF_EventExtra Structure

### Structure Definition

```cpp
typedef struct PF_EventExtra {
    PF_ContextH         contextH;       // Window context handle
    PF_EventType        e_type;         // Event type identifier
    PF_EventUnion       u;              // Event-specific data union
    PF_EventCallbacks   cbs;            // Event callback functions
    PF_EventInFlags     evt_in_flags;   // Input flags from AE
    PF_EventOutFlags    evt_out_flags;  // Output flags to set
} PF_EventExtra;
```

### Event Types Enumeration

```cpp
enum {
    PF_Event_NONE = -1,
    PF_Event_NEW_CONTEXT,       // Window/context created
    PF_Event_ACTIVATE,          // Context brought to foreground
    PF_Event_DO_CLICK,          // Mouse click in custom UI area
    PF_Event_DRAG,              // Follow-up drag after DO_CLICK
    PF_Event_DRAW,              // Render custom UI
    PF_Event_DEACTIVATE,        // Context loses focus
    PF_Event_CLOSE_CONTEXT,     // User closes context
    PF_Event_IDLE,              // No activity in open context
    PF_Event_KEYDOWN_OBSOLETE,  // Deprecated
    PF_Event_ADJUST_CURSOR,     // Cursor over custom UI
    PF_Event_KEYDOWN,           // Keyboard input
    PF_Event_MOUSE_EXITED,      // Pointer leaves view (CS6+)
    PF_Event_NUM_EVENTS
};
```

### Event Output Flags

```cpp
enum {
    PF_EO_NONE           = 0,
    PF_EO_HANDLED_EVENT  = (1L << 0),  // Event was handled
    PF_EO_ALWAYS_UPDATE  = (1L << 1),  // Always request updates
    PF_EO_NEVER_UPDATE   = (1L << 2),  // Never request updates
    PF_EO_UPDATE_NOW     = (1L << 3)   // Request immediate redraw
};
```

### Window Context Types

```cpp
// Access window type from context
PF_WindowType w_type = (**(event_extra->contextH)).w_type;

// Window union for window-specific info
typedef union {
    PF_EffectWindowInfo  effect_win;  // ECW events
    PF_ItemWindowInfo    item_win;    // Comp/Layer events
} PF_WindowUnion;
```

---

## PF_EventUnion - Event Types

### Click Event (PF_DoClickEventInfo)

Triggered when a mouse click occurs within the custom UI area.

```cpp
typedef struct {
    A_u_long        when;               // OS timestamp
    PF_Point        screen_point;       // Click location (screen coords)
    A_long          num_clicks;         // Consecutive click count
    PF_Modifiers    modifiers;          // Active modifier keys
    A_intptr_t      continue_refcon[4]; // Storage for drag sequences
    PF_Boolean      send_drag;          // Set TRUE to receive drag events
    PF_Boolean      last_time;          // TRUE when drag ends
} PF_DoClickEventInfo;
```

**Usage:**

```cpp
case PF_Event_DO_CLICK:
{
    PF_DoClickEventInfo* click = &event_extra->u.do_click;

    // Check for double-click
    if (click->num_clicks == 2) {
        // Handle double-click
    }

    // Check modifier keys
    if (click->modifiers & PF_Mod_SHIFT_KEY) {
        // Shift+click behavior
    }

    // Enable drag tracking
    click->send_drag = TRUE;

    // Store drag state in continue_refcon
    click->continue_refcon[0] = (A_intptr_t)my_drag_state;

    event_extra->evt_out_flags = PF_EO_HANDLED_EVENT;
}
break;
```

### Draw Event (PF_DrawEventInfo)

Sent when After Effects needs the custom UI to refresh.

```cpp
typedef struct {
    PF_UnionableRect    update_rect;    // Area needing refresh
    A_long              depth;          // Pixel depth of context
} PF_DrawEventInfo;
```

**Critical Rule:** Drawing may ONLY occur during `PF_Event_DRAW`. Never draw during `PF_Event_DRAG` or `PF_Event_DO_CLICK`.

### Keydown Event (PF_KeyDownEvent)

Triggered when a key is pressed while the effect's UI is active.

```cpp
typedef struct {
    A_u_long        when;           // Timestamp
    PF_Point        screen_point;   // Mouse position
    PF_KeyCode      key_code;       // Character or control code
    PF_Modifiers    modifiers;      // Active modifiers
} PF_KeyDownEvent;
```

**Key Codes:** Standard character codes for alphanumeric keys, plus special codes for F1-F24, arrow keys, Home, End, Page Up/Down, etc.

### Adjust Cursor Event (PF_AdjustCursorEventInfo)

Allows cursor customization when it enters the effect's UI area.

```cpp
typedef struct {
    PF_Point        screen_point;   // Mouse position
    PF_Modifiers    modifiers;      // Active modifiers
    PF_CursorType   set_cursor;     // Desired cursor type
} PF_AdjustCursorEventInfo;
```

### Modifier Keys

```cpp
enum {
    PF_Mod_NONE             = 0x0000,
    PF_Mod_CMD_CTRL_KEY     = 0x0100,  // Cmd (Mac) / Ctrl (Win)
    PF_Mod_SHIFT_KEY        = 0x0200,
    PF_Mod_CAPS_LOCK_KEY    = 0x0400,
    PF_Mod_OPT_ALT_KEY      = 0x0800,  // Option (Mac) / Alt (Win)
    PF_Mod_MAC_CONTROL_KEY  = 0x1000   // Control key (Mac only)
};
```

---

## Drawbot Drawing API

### Overview

Drawbot is After Effects' composited drawing API for custom UI. It supports:

- Basic 2D path drawing (lines, rectangles, arcs, Bezier curves)
- Stroking and filling paths
- Image composition (ARGB/BGRA buffers)
- Surface state management (push/pop)
- Text drawing (when supplier supports it)

**Important:** Drawbot is for UI only. It cannot render to normal render buffers.

### Getting Started

```cpp
#include "AEFX_SuiteHelper.h"
#include "DrawbotSuite.h"

// In your draw event handler:
PF_Err HandleDraw(PF_InData* in_data, PF_EventExtra* extra)
{
    PF_Err err = PF_Err_NONE;

    // Get the drawing reference
    DRAWBOT_DrawRef drawRef = NULL;
    AEFX_SuiteScoper<PF_EffectCustomUISuite1> customUISuite(
        in_data, kPFEffectCustomUISuite, kPFEffectCustomUISuiteVersion1);

    ERR(customUISuite->PF_GetDrawingReference(extra->contextH, &drawRef));

    if (drawRef && !err) {
        // Acquire Drawbot suites
        DRAWBOT_Suites drawbotSuites;
        AEFX_AcquireDrawbotSuites(in_data, out_data, &drawbotSuites);

        // Get supplier and surface references
        DRAWBOT_SupplierRef supplierRef = NULL;
        DRAWBOT_SurfaceRef surfaceRef = NULL;

        drawbotSuites.drawbot_suiteP->GetSupplier(drawRef, &supplierRef);
        drawbotSuites.drawbot_suiteP->GetSurface(drawRef, &surfaceRef);

        // Perform drawing...

        AEFX_ReleaseDrawbotSuites(in_data, out_data);
    }

    return err;
}
```

### DRAWBOT_DrawbotSuite1

Primary suite for obtaining supplier and surface references.

```cpp
typedef struct DRAWBOT_DrawbotSuite1 {
    SPErr (*GetSupplier)(
        DRAWBOT_DrawRef         in_drawbot_ref,
        DRAWBOT_SupplierRef*    out_supplierP);

    SPErr (*GetSurface)(
        DRAWBOT_DrawRef         in_drawbot_ref,
        DRAWBOT_SurfaceRef*     out_surfaceP);
} DRAWBOT_DrawbotSuite1;
```

### DRAWBOT_SupplierSuite1

Creates and manages drawing objects.

```cpp
typedef struct DRAWBOT_SupplierSuite1 {
    // Create a pen for stroking
    SPErr (*NewPen)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        const DRAWBOT_ColorRGBA* in_colorP,
        float                   in_size,
        DRAWBOT_PenRef*         out_penP);

    // Create a brush for filling
    SPErr (*NewBrush)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        const DRAWBOT_ColorRGBA* in_colorP,
        DRAWBOT_BrushRef*       out_brushP);

    // Create a path object
    SPErr (*NewPath)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        DRAWBOT_PathRef*        out_pathP);

    // Create default font
    SPErr (*NewDefaultFont)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        float                   in_font_sizeF,
        DRAWBOT_FontRef*        out_fontP);

    // Get default font size
    SPErr (*GetDefaultFontSize)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        float*                  out_font_sizeF);

    // Create image from pixel buffer
    SPErr (*NewImageFromBuffer)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        int                     in_width,
        int                     in_height,
        int                     in_row_bytes,
        DRAWBOT_PixelLayout     in_pl,
        const void*             in_dataP,
        DRAWBOT_ImageRef*       out_imageP);

    // Check text support
    SPErr (*SupportsText)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        DRAWBOT_Boolean*        out_supports_textPB);

    // Query pixel format support
    SPErr (*SupportsPixelLayoutBGRA)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        DRAWBOT_boolean*        out_supports_bgraPB);

    SPErr (*PrefersPixelLayoutBGRA)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        DRAWBOT_boolean*        out_prefers_bgraPB);

    SPErr (*SupportsPixelLayoutARGB)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        DRAWBOT_boolean*        out_supports_argbPB);

    SPErr (*PrefersPixelLayoutARGB)(
        DRAWBOT_SupplierRef     in_supplier_ref,
        DRAWBOT_boolean*        out_prefers_argbPB);

    // Reference counting
    SPErr (*RetainObject)(DRAWBOT_ObjectRef in_obj_ref);
    SPErr (*ReleaseObject)(DRAWBOT_ObjectRef in_obj_ref);
} DRAWBOT_SupplierSuite1;
```

### DRAWBOT_SurfaceSuite1/2

Handles rendering operations on the drawing surface.

```cpp
typedef struct DRAWBOT_SurfaceSuite1 {
    // State stack management
    SPErr (*PushStateStack)(DRAWBOT_SurfaceRef in_surface_ref);
    SPErr (*PopStateStack)(DRAWBOT_SurfaceRef in_surface_ref);

    // Fill rectangle with solid color
    SPErr (*PaintRect)(
        DRAWBOT_SurfaceRef          in_surface_ref,
        const DRAWBOT_ColorRGBA*    in_colorP,
        const DRAWBOT_RectF32*      in_rectPR);

    // Fill path with brush
    SPErr (*FillPath)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        DRAWBOT_BrushRef        in_brush_ref,
        DRAWBOT_PathRef         in_path_ref,
        DRAWBOT_FillType        in_fill_type);

    // Stroke path with pen
    SPErr (*StrokePath)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        DRAWBOT_PenRef          in_pen_ref,
        DRAWBOT_PathRef         in_path_ref);

    // Clipping
    SPErr (*Clip)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        DRAWBOT_SupplierRef     in_supplier_ref,
        const DRAWBOT_Rect32*   in_rectPR);

    SPErr (*GetClipBounds)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        DRAWBOT_Rect32*         out_rectPR);

    SPErr (*IsWithinClipBounds)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        const DRAWBOT_Rect32*   in_rectPR,
        DRAWBOT_boolean*        out_withinPB);

    // Transformation
    SPErr (*Transform)(
        DRAWBOT_SurfaceRef          in_surface_ref,
        const DRAWBOT_MatrixF32*    in_matrixP);

    // Text drawing
    SPErr (*DrawString)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        DRAWBOT_BrushRef        in_brush_ref,
        DRAWBOT_FontRef         in_font_ref,
        const DRAWBOT_UTF16Char* in_stringP,
        const DRAWBOT_PointF32* in_originP,
        DRAWBOT_TextAlignment   in_alignment_style,
        DRAWBOT_TextTruncation  in_truncation_style,
        float                   in_truncation_width);

    // Image drawing
    SPErr (*DrawImage)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        DRAWBOT_ImageRef        in_image_ref,
        const DRAWBOT_PointF32* in_originP,
        float                   in_alpha);

    // Quality settings
    SPErr (*SetInterpolationPolicy)(
        DRAWBOT_SurfaceRef          in_surface_ref,
        DRAWBOT_InterpolationPolicy in_interp);

    SPErr (*SetAntiAliasPolicy)(
        DRAWBOT_SurfaceRef      in_surface_ref,
        DRAWBOT_AntiAliasPolicy in_policy);

    // Flush drawing commands
    SPErr (*Flush)(DRAWBOT_SurfaceRef in_surface_ref);
} DRAWBOT_SurfaceSuite1;

// Version 2 additions (AE CC 2015+)
typedef struct DRAWBOT_SurfaceSuite2 {
    // ... all v1 functions ...

    // HiDPI/Retina support
    SPErr (*GetTransformToScreenScale)(
        DRAWBOT_SurfaceRef  in_surface_ref,
        float*              out_scale);
} DRAWBOT_SurfaceSuite2;
```

### DRAWBOT_PathSuite1

Constructs path geometry for drawing.

```cpp
typedef struct DRAWBOT_PathSuite1 {
    // Start new subpath
    SPErr (*MoveTo)(
        DRAWBOT_PathRef in_path_ref,
        float           in_x,
        float           in_y);

    // Add line segment
    SPErr (*LineTo)(
        DRAWBOT_PathRef in_path_ref,
        float           in_x,
        float           in_y);

    // Add cubic Bezier curve
    SPErr (*BezierTo)(
        DRAWBOT_PathRef             in_path_ref,
        const DRAWBOT_PointF32*     in_pt1P,    // Control point 1
        const DRAWBOT_PointF32*     in_pt2P,    // Control point 2
        const DRAWBOT_PointF32*     in_pt3P);   // End point

    // Add rectangle
    SPErr (*AddRect)(
        DRAWBOT_PathRef             in_path_ref,
        const DRAWBOT_RectF32*      in_rectPR);

    // Add arc
    // Note: Angles in degrees, 0 = 3 o'clock, clockwise sweep
    SPErr (*AddArc)(
        DRAWBOT_PathRef             in_path_ref,
        const DRAWBOT_PointF32*     in_centerP,
        float                       in_radius,
        float                       in_start_angle,
        float                       in_sweep);

    // Close path
    SPErr (*Close)(DRAWBOT_PathRef in_path_ref);
} DRAWBOT_PathSuite1;
```

### C++ Helper Classes

The SDK provides RAII wrappers for automatic resource management:

```cpp
// Smart pointer for pens
DRAWBOT_PenP penP(supplier_suiteP, supplier_ref,
                  DRAWBOT_ColorRGBA(1.0f, 0.0f, 0.0f, 1.0f),  // Red
                  2.0f);  // 2px width

// Smart pointer for brushes
DRAWBOT_BrushP brushP(supplier_suiteP, supplier_ref,
                      DRAWBOT_ColorRGBA(0.0f, 1.0f, 0.0f, 1.0f));  // Green

// Smart pointer for paths
DRAWBOT_PathP pathP(supplier_suiteP, supplier_ref);

// RAII state stack management
DRAWBOT_SaveAndRestoreStateStack stateGuard(surface_suiteP, surface_ref);
// State automatically restored when stateGuard goes out of scope
```

---

## Custom UI Suites

### PF_EffectCustomUISuite1

Primary suite for custom UI drawing.

```cpp
typedef struct PF_EffectCustomUISuite1 {
    // Get drawing reference for custom UI
    PF_Err (*PF_GetDrawingReference)(
        PF_ContextH         effect_contextH,
        DRAWBOT_DrawRef*    drawing_refP);
} PF_EffectCustomUISuite1;
```

### PF_EffectCustomUIOverlayThemeSuite1

Ensures UI consistency with After Effects' theming system.

```cpp
typedef struct PF_EffectCustomUIOverlayThemeSuite1 {
    // Get theme-aware foreground color
    PF_Err (*PF_GetPreferredForegroundColor)(
        DRAWBOT_ColorRGBA*  colorP);

    // Get theme-aware shadow color
    PF_Err (*PF_GetPreferredShadowColor)(
        DRAWBOT_ColorRGBA*  colorP);

    // Get recommended stroke width
    PF_Err (*PF_GetPreferredStrokeWidth)(
        float*              widthP);

    // Get recommended vertex size
    PF_Err (*PF_GetPreferredVertexSize)(
        float*              sizeP);

    // Get shadow offset
    PF_Err (*PF_GetPreferredShadowOffset)(
        A_FloatPoint*       offsetP);

    // Stroke path with theme colors
    PF_Err (*PF_StrokePath)(
        DRAWBOT_DrawRef     drawRef,
        DRAWBOT_PathRef     pathRef);

    // Fill path with theme foreground
    PF_Err (*PF_FillPath)(
        DRAWBOT_DrawRef     drawRef,
        DRAWBOT_PathRef     pathRef);

    // Draw control point vertex
    PF_Err (*PF_FillVertex)(
        DRAWBOT_DrawRef         drawRef,
        const DRAWBOT_PointF32* centerP);
} PF_EffectCustomUIOverlayThemeSuite1;
```

### PF_AppSuite4 (UI-Related Functions)

```cpp
// Invalidate a region for redraw (lazy update)
PF_Err (*PF_InvalidateRect)(
    PF_ContextH     contextH,
    const PF_Rect*  rectP);     // NULL for entire pane

// Set cursor during modal operations
PF_Err (*PF_SetCursor)(
    PF_CursorType   cursor);

// Convert local to global coordinates
PF_Err (*PF_ConvertLocalToGlobal)(
    const PF_Point* localP,
    PF_Point*       globalP);

// Get color at screen position (eyedropper)
PF_Err (*PF_GetColorAtGlobalPoint)(
    const PF_Point* globalP,
    PF_Pixel*       colorP,
    PF_Boolean      use_eyedropper);

// Get current mouse position
PF_Err (*PF_GetMouse)(
    PF_Point*       mouseP);
```

### PF_EffectUISuite1

```cpp
// Set options button label
PF_Err (*PF_SetOptionsButtonName)(
    PF_ProgPtr      effect_ref,
    const A_char*   nameZ);
```

---

## Hit Testing & Coordinate Conversion

### Coordinate Systems

| Coordinate Space | Description |
|-----------------|-------------|
| Screen | Raw screen pixel coordinates |
| Window | Relative to window origin |
| Layer | Layer pixel coordinates |
| Comp | Composition coordinates |

### Converting Click Coordinates

```cpp
case PF_Event_DO_CLICK:
{
    PF_DoClickEventInfo* click = &extra->u.do_click;

    // Screen point from click event
    PF_Point screenPoint = click->screen_point;

    // For layer space conversion, store in sequence data
    // and force re-render to access layer pixels

    my_sequence_data->click_x = screenPoint.h;
    my_sequence_data->click_y = screenPoint.v;
    my_sequence_data->pending_sample = TRUE;

    // Force re-render to sample color
    out_data->out_flags |= PF_OutFlag_FORCE_RERENDER;
}
```

### Hit Testing Pattern

```cpp
bool HitTest(const PF_Point& point, const PF_Rect& bounds)
{
    return (point.h >= bounds.left &&
            point.h <= bounds.right &&
            point.v >= bounds.top &&
            point.v <= bounds.bottom);
}

// In DO_CLICK handler:
PF_Rect controlBounds = GetControlBounds();
if (HitTest(click->screen_point, controlBounds)) {
    // Handle click on this control
    extra->evt_out_flags = PF_EO_HANDLED_EVENT;
}
```

### Pixel Aspect Ratio Considerations

Point parameters are automatically scaled for downsample factor and pixel aspect ratio. For custom coordinate handling:

```cpp
// Convert screen coords to layer space accounting for PAR
float layerX = screenX / in_data->downsample_x.num * in_data->downsample_x.den;
float layerY = screenY / in_data->downsample_y.num * in_data->downsample_y.den;

// Account for pixel aspect ratio
float parH = in_data->pixel_aspect_ratio.num;
float parV = in_data->pixel_aspect_ratio.den;
layerX *= parV / parH;  // Convert to square pixels
```

---

## Cursor Management

### Available Cursor Types

```cpp
enum PF_CursorType {
    PF_Cursor_NONE,             // Let app set cursor
    PF_Cursor_ARROW,            // Standard arrow
    PF_Cursor_CROSSHAIRS,       // Crosshair
    PF_Cursor_HAND,             // Hand/grab cursor
    PF_Cursor_PEN,              // Pen tool
    PF_Cursor_EYEDROPPER,       // Color sampler
    PF_Cursor_FEATHER,          // Feather edge
    PF_Cursor_LASSO_ARROW,      // Lasso with arrow
    // ... many more specialized cursors
    PF_Cursor_CUSTOM,           // Effect sets cursor itself
    // Rotation cursors for different angles
    PF_Cursor_ROTATE,
    PF_Cursor_ROTATE_0,
    PF_Cursor_ROTATE_45,
    // etc.
};
```

### Setting Custom Cursor

```cpp
case PF_Event_ADJUST_CURSOR:
{
    PF_AdjustCursorEventInfo* cursor = &extra->u.adjust_cursor;

    // Check if over a control
    if (IsOverResizeHandle(cursor->screen_point)) {
        cursor->set_cursor = PF_Cursor_SCALE;
    } else if (IsOverRotateHandle(cursor->screen_point)) {
        cursor->set_cursor = PF_Cursor_ROTATE;
    } else {
        cursor->set_cursor = PF_Cursor_CROSSHAIRS;
    }

    extra->evt_out_flags = PF_EO_HANDLED_EVENT;
}
break;
```

### Custom Cursor via Platform API

```cpp
case PF_Event_ADJUST_CURSOR:
{
    // Set your own cursor using platform APIs
    #ifdef AE_OS_MAC
        [[NSCursor pointingHandCursor] set];
    #else
        SetCursor(LoadCursor(NULL, IDC_HAND));
    #endif

    cursor->set_cursor = PF_Cursor_CUSTOM;
    extra->evt_out_flags = PF_EO_HANDLED_EVENT;
}
```

---

## Drag Interactions

### Implementing Click-Drag Sequence

```cpp
case PF_Event_DO_CLICK:
{
    PF_DoClickEventInfo* click = &extra->u.do_click;

    // Initialize drag state
    MyDragState* state = new MyDragState();
    state->startPoint = click->screen_point;
    state->currentValue = GetCurrentValue();

    // Store in continue_refcon for access during drag
    click->continue_refcon[0] = reinterpret_cast<A_intptr_t>(state);

    // Request drag events
    click->send_drag = TRUE;

    extra->evt_out_flags = PF_EO_HANDLED_EVENT;
}
break;

case PF_Event_DRAG:
{
    PF_DoClickEventInfo* drag = &extra->u.do_click;

    // Retrieve drag state
    MyDragState* state = reinterpret_cast<MyDragState*>(
        drag->continue_refcon[0]);

    if (state) {
        // Calculate delta
        int deltaX = drag->screen_point.h - state->startPoint.h;
        int deltaY = drag->screen_point.v - state->startPoint.v;

        // Update value based on drag
        float newValue = state->currentValue + deltaX * 0.01f;
        UpdateParameter(newValue);

        // Request UI refresh
        AEFX_SuiteScoper<PF_AppSuite4> appSuite(in_data);
        appSuite->PF_InvalidateRect(extra->contextH, NULL);

        // Check if drag ended
        if (drag->last_time) {
            // Cleanup
            delete state;
            drag->continue_refcon[0] = 0;
        }
    }

    extra->evt_out_flags = PF_EO_HANDLED_EVENT;
}
break;
```

### Force Re-render During Drag

To force a re-render during drag operations:

1. Implement `PF_Cmd_GET_FLATTENED_SEQUENCE_DATA`
2. Set `PF_OutFlag_FORCE_RERENDER` in your drag handler

```cpp
// FORCE_RERENDER requires GET_FLATTENED_SEQUENCE_DATA implementation
case PF_Cmd_GET_FLATTENED_SEQUENCE_DATA:
{
    // Return a copy of sequence data without disposing original
    // This prevents state loss during mouse operations
    *out_data->sequence_data = CopySequenceData(*in_data->sequence_data);
}
break;

// In drag handler:
out_data->out_flags |= PF_OutFlag_FORCE_RERENDER;
```

### Modifier Key Handling During Drag

```cpp
// Check modifiers during drag for constrained movement
if (drag->modifiers & PF_Mod_SHIFT_KEY) {
    // Constrain to horizontal or vertical
    if (abs(deltaX) > abs(deltaY)) {
        deltaY = 0;
    } else {
        deltaX = 0;
    }
}

if (drag->modifiers & PF_Mod_OPT_ALT_KEY) {
    // Fine adjustment mode
    deltaX /= 10;
    deltaY /= 10;
}
```

---

## HiDPI/Retina Display Support

### Detecting HiDPI Displays

```cpp
// Use SurfaceSuite version 2 for Retina detection
DRAWBOT_SurfaceSuite2* surfaceSuiteP = drawbotSuites.surface_suiteP;

float screenScale = 1.0f;
surfaceSuiteP->GetTransformToScreenScale(surfaceRef, &screenScale);

bool isRetina = (screenScale > 1.0f);
```

### Drawing for HiDPI

```cpp
if (isRetina) {
    // Create images at 2x resolution
    int imageWidth = targetWidth * 2;
    int imageHeight = targetHeight * 2;

    // Create buffer and render at high resolution
    void* buffer = AllocateBuffer(imageWidth, imageHeight);
    RenderToBuffer(buffer, imageWidth, imageHeight);

    // Create Drawbot image
    DRAWBOT_ImageRef imageRef = NULL;
    supplierSuiteP->NewImageFromBuffer(
        supplierRef,
        imageWidth, imageHeight,
        imageWidth * 4,  // row bytes
        kDRAWBOT_PixelLayout_BGRA32,
        buffer,
        &imageRef);

    // Save state and apply 0.5x transform
    surfaceSuiteP->PushStateStack(surfaceRef);

    DRAWBOT_MatrixF32 scaleMatrix = {
        0.5f, 0.0f,
        0.0f, 0.5f,
        0.0f, 0.0f
    };
    surfaceSuiteP->Transform(surfaceRef, &scaleMatrix);

    // Draw scaled image
    DRAWBOT_PointF32 origin = {0.0f, 0.0f};
    surfaceSuiteP->DrawImage(surfaceRef, imageRef, &origin, 1.0f);

    // Restore state
    surfaceSuiteP->PopStateStack(surfaceRef);

    supplierSuiteP->ReleaseObject(imageRef);
    FreeBuffer(buffer);
}
```

### Known Limitations

- Some native AE tools (roto masks, puppet pins) may appear blurry on Retina
- Drawbot doesn't truly support high-DPI native drawing
- Workaround: Render at 2x and scale down

---

## Platform Considerations

### macOS vs Windows Differences

| Aspect | macOS | Windows |
|--------|-------|---------|
| Modifier Key | `PF_Mod_CMD_CTRL_KEY` = Command | `PF_Mod_CMD_CTRL_KEY` = Control |
| Additional Mod | `PF_Mod_MAC_CONTROL_KEY` (Control) | N/A |
| Drawing Context | Colors not preset to B&W | May have preset colors |
| Cursor API | NSCursor | Win32 Cursor functions |

### macOS-Specific Notes

```cpp
// macOS: foreground/background colors are NOT preset to white/black
// during custom UI draw events - this is by design
// You don't need to change background when drawing directly

#ifdef AE_OS_MAC
    // Drawing context is ready as-is
#endif
```

### Windows-Specific Notes

```cpp
#ifdef AE_OS_WIN
    // May need to explicitly set up drawing state
#endif
```

### Cross-Platform Drawing

For maximum compatibility, some developers use Cairo instead of Drawbot:

```cpp
// Alternative: Render to buffer with Cairo, then blit to Drawbot
cairo_surface_t* cairoPurface = cairo_image_surface_create(
    CAIRO_FORMAT_ARGB32, width, height);
cairo_t* cr = cairo_create(cairoSurface);

// Draw with Cairo
cairo_set_source_rgb(cr, 1.0, 0.0, 0.0);
cairo_rectangle(cr, x, y, w, h);
cairo_fill(cr);

// Get pixel data
unsigned char* data = cairo_image_surface_get_data(cairoSurface);

// Create Drawbot image from buffer
DRAWBOT_ImageRef imageRef = NULL;
supplierSuiteP->NewImageFromBuffer(supplierRef,
    width, height, width * 4,
    kDRAWBOT_PixelLayout_BGRA32, data, &imageRef);

// Draw to Drawbot surface
DRAWBOT_PointF32 origin = {0, 0};
surfaceSuiteP->DrawImage(surfaceRef, imageRef, &origin, 1.0f);
```

---

## Code Examples

### Complete ECW Custom Control

```cpp
static PF_Err HandleEvent(
    PF_InData*      in_data,
    PF_OutData*     out_data,
    PF_ParamDef*    params[],
    PF_LayerDef*    output,
    PF_EventExtra*  extra)
{
    PF_Err err = PF_Err_NONE;

    switch (extra->e_type) {
        case PF_Event_NEW_CONTEXT:
            // Initialize any context-specific state
            break;

        case PF_Event_DRAW:
            err = DrawCustomControl(in_data, out_data, extra);
            break;

        case PF_Event_DO_CLICK:
            err = HandleClick(in_data, out_data, params, extra);
            break;

        case PF_Event_DRAG:
            err = HandleDrag(in_data, out_data, params, extra);
            break;

        case PF_Event_ADJUST_CURSOR:
            err = AdjustCursor(in_data, extra);
            break;

        case PF_Event_CLOSE_CONTEXT:
            // Cleanup context-specific state
            break;
    }

    return err;
}

static PF_Err DrawCustomControl(
    PF_InData*      in_data,
    PF_OutData*     out_data,
    PF_EventExtra*  extra)
{
    PF_Err err = PF_Err_NONE;

    DRAWBOT_DrawRef drawRef = NULL;

    AEFX_SuiteScoper<PF_EffectCustomUISuite1> customUISuite(
        in_data, kPFEffectCustomUISuite, kPFEffectCustomUISuiteVersion1);

    ERR(customUISuite->PF_GetDrawingReference(extra->contextH, &drawRef));

    if (!err && drawRef) {
        DRAWBOT_Suites suites;
        AEFX_AcquireDrawbotSuites(in_data, out_data, &suites);

        DRAWBOT_SupplierRef supplierRef = NULL;
        DRAWBOT_SurfaceRef surfaceRef = NULL;

        suites.drawbot_suiteP->GetSupplier(drawRef, &supplierRef);
        suites.drawbot_suiteP->GetSurface(drawRef, &surfaceRef);

        // Set high quality anti-aliasing
        suites.surface_suiteP->SetAntiAliasPolicy(
            surfaceRef, kDRAWBOT_AntiAliasPolicy_High);

        // Draw background
        DRAWBOT_ColorRGBA bgColor = {0.2f, 0.2f, 0.2f, 1.0f};
        DRAWBOT_RectF32 bgRect = {0, 0, 100, 50};
        suites.surface_suiteP->PaintRect(surfaceRef, &bgColor, &bgRect);

        // Create and draw a path
        DRAWBOT_PathP pathP(suites.supplier_suiteP, supplierRef);
        suites.path_suiteP->MoveTo(*pathP, 10, 10);
        suites.path_suiteP->LineTo(*pathP, 90, 10);
        suites.path_suiteP->LineTo(*pathP, 90, 40);
        suites.path_suiteP->LineTo(*pathP, 10, 40);
        suites.path_suiteP->Close(*pathP);

        // Stroke the path
        DRAWBOT_PenP penP(suites.supplier_suiteP, supplierRef,
                         DRAWBOT_ColorRGBA(1.0f, 0.5f, 0.0f, 1.0f), 2.0f);
        suites.surface_suiteP->StrokePath(surfaceRef, *penP, *pathP);

        AEFX_ReleaseDrawbotSuites(in_data, out_data);
    }

    extra->evt_out_flags = PF_EO_HANDLED_EVENT;
    return err;
}
```

### Composition Window Overlay

```cpp
static PF_Err DrawCompOverlay(
    PF_InData*      in_data,
    PF_OutData*     out_data,
    PF_EventExtra*  extra)
{
    PF_Err err = PF_Err_NONE;

    // Check we're in comp/layer window
    PF_WindowType wType = (**(extra->contextH)).w_type;
    if (wType == PF_Window_COMP || wType == PF_Window_LAYER) {

        DRAWBOT_DrawRef drawRef = NULL;
        // ... get drawing reference ...

        // Use overlay theme suite for consistent appearance
        AEFX_SuiteScoper<PF_EffectCustomUIOverlayThemeSuite1> themeSuite(
            in_data, kPFEffectCustomUIOverlayThemeSuite,
            kPFEffectCustomUIOverlayThemeSuiteVersion1);

        DRAWBOT_ColorRGBA fgColor, shadowColor;
        float strokeWidth, vertexSize;
        A_FloatPoint shadowOffset;

        themeSuite->PF_GetPreferredForegroundColor(&fgColor);
        themeSuite->PF_GetPreferredShadowColor(&shadowColor);
        themeSuite->PF_GetPreferredStrokeWidth(&strokeWidth);
        themeSuite->PF_GetPreferredVertexSize(&vertexSize);
        themeSuite->PF_GetPreferredShadowOffset(&shadowOffset);

        // Draw control point at effect's point parameter location
        DRAWBOT_PointF32 vertexCenter = {pointX, pointY};
        themeSuite->PF_FillVertex(drawRef, &vertexCenter);

        // Draw path with theme stroke
        themeSuite->PF_StrokePath(drawRef, pathRef);
    }

    return err;
}
```

### Using Arbitrary Data for UI State

```cpp
// Structure for UI state
typedef struct {
    float       last_value;
    PF_Point    last_click;
    bool        is_dragging;
    int         selected_control;
} MyUIState;

// Store in arbitrary data parameter
PF_ParamDef arbDef;
AEFX_CLR_STRUCT(arbDef);
arbDef.param_type = PF_Param_ARBITRARY_DATA;
arbDef.ui_flags = PF_PUI_CONTROL;  // Custom UI for this param
arbDef.u.arb_d.value = NULL;
arbDef.u.arb_d.dephault = CreateDefaultUIState();
arbDef.u.arb_d.id = UI_STATE_ARB_ID;

// Access during events
MyUIState* state = reinterpret_cast<MyUIState*>(
    params[UI_STATE_PARAM]->u.arb_d.value);
```

---

## Best Practices

### Performance Optimization

1. **Use `PF_EO_ALWAYS_UPDATE` and `PF_EO_NEVER_UPDATE` wisely**
   - Balance responsiveness vs. accuracy
   - `PF_EO_ALWAYS_UPDATE` for real-time feedback during drag
   - `PF_EO_NEVER_UPDATE` when updates aren't needed

2. **Minimize redraws**
   - Use `PF_InvalidateRect` with specific rectangles, not NULL
   - Only set `PF_OutFlag_REFRESH_UI` when multiple windows need update

3. **Cache drawing resources**
   - Reuse pens, brushes, and fonts when possible
   - Create complex paths once and reuse

### State Management

1. **Use arbitrary data parameters for UI state**
   - Stores state, preferences, and tracking information
   - Automatically persists with project
   - Richer message stream than custom UI alone

2. **Implement `PF_Cmd_GET_FLATTENED_SEQUENCE_DATA`**
   - Required for `FORCE_RERENDER` during drag operations
   - Prevents state loss during mouse operations

### Drawing Guidelines

1. **Never draw outside `PF_Event_DRAW`**
   - No drawing during `PF_Event_DRAG` or `PF_Event_DO_CLICK`
   - Request redraws via `PF_InvalidateRect` or `PF_EO_UPDATE_NOW`

2. **Use theme suite for overlays**
   - `PF_EffectCustomUIOverlayThemeSuite` ensures visibility in all themes
   - Automatically adjusts colors for light/dark UI

3. **Handle HiDPI properly**
   - Check `GetTransformToScreenScale` for Retina displays
   - Render at 2x and scale down for crisp graphics

### Event Handling

1. **Always set `PF_EO_HANDLED_EVENT`** when handling an event
2. **Check window type** before processing events
3. **Store drag state in `continue_refcon`** for multi-event sequences
4. **Clean up resources** in `PF_Event_CLOSE_CONTEXT`

### Thread Safety

1. **UI events are sent on UI thread**
   - `PF_Cmd_SEQUENCE_SETUP`, `PF_Cmd_USER_CHANGED_PARAM`, `PF_Cmd_DO_DIALOG`
   - `PF_EVENT_DRAW` always on UI thread

2. **Don't block on mouse-up in DO_CLICK**
   - Request drag events instead
   - Use `last_time` to detect mouse release

### Debugging Tips

1. **Note:** `PF_InvalidateRect` not allowed during KEYDOWN events
2. **Store pixel depth** from last render if needed during events
3. **Test both ECW and Comp window contexts** separately

---

## SDK Sample Projects

| Sample | Description |
|--------|-------------|
| **ColorGrid** | Arbitrary data with custom ECW UI, recommended starting point |
| **CCU** | Custom Comp UI with PAR/downsample handling |
| **Custom ECW UI** | Basic ECW custom control implementation |
| **Histogrid** | Async frame access for custom UI (CC 2015+) |
| **Supervisor** | Dynamic parameter UI based on other values |
| **GLator** | OpenGL context management in effects |

---

## References

- [Effect UI & Events - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-ui-events/effect-ui-events/)
- [PF_EventUnion - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-ui-events/PF_EventUnion/)
- [Custom UI & Drawbot - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-ui-events/custom-ui-and-drawbot/)
- [Tips & Tricks - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/effect-ui-events/tips-and-tricks/)
- [Sample Projects - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/intro/sample-projects/)
- [AE_EffectUI.h (GitHub)](https://github.com/KAndQ/AEPlugins/blob/master/Adobe%20After%20Effects%20CC%202014%20Mac%20SDK/Examples/Headers/AE_EffectUI.h)
- [DrawbotSuite.h (GitHub)](https://github.com/takahirome/AdobeScripts/blob/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Headers/adobesdk/DrawbotSuite.h)

---

*Document Version: 1.0*
*Last Updated: 2025-12-28*
*SDK Version Reference: After Effects CC 2015+ (with notes for earlier versions)*
