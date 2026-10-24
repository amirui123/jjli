---
source: '[unknown - 12-footage-composition.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Footage and Composition APIs - Adobe After Effects SDK

> **Complete API Reference for Project Item Manipulation**

This document provides comprehensive documentation for the After Effects SDK APIs related to footage items, compositions, project hierarchy, and layer management.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Data Types](#core-data-types)
3. [AEGP_ItemSuite - Project Item Hierarchy](#aegp_itemsuite---project-item-hierarchy)
4. [AEGP_FootageSuite - Footage Item Access](#aegp_footagesuite---footage-item-access)
5. [AEGP_CompSuite - Composition Manipulation](#aegp_compsuite---composition-manipulation)
6. [AEGP_LayerSuite - Layer Management](#aegp_layersuite---layer-management)
7. [AEGP_CollectionSuite - Item Collections](#aegp_collectionsuite---item-collections)
8. [Footage Interpretation](#footage-interpretation)
9. [Solid and Adjustment Layer Creation](#solid-and-adjustment-layer-creation)
10. [Layer Flags and Properties](#layer-flags-and-properties)
11. [Composition Settings](#composition-settings)
12. [Code Examples](#code-examples)
13. [Best Practices](#best-practices)

---

## Overview

The After Effects SDK provides a comprehensive set of suites for manipulating project items, footage, compositions, and layers. These APIs form the foundation for building AEGPs that can:

- Import and manage footage items
- Create and modify compositions
- Manipulate layer hierarchies and parenting
- Handle footage interpretation settings
- Create solids and adjustment layers
- Manage proxy footage

### Suite Versions

| Suite | Current Version | Purpose |
|-------|-----------------|---------|
| AEGP_ItemSuite | 9 | Project item management |
| AEGP_FootageSuite | 5 | Footage item operations |
| AEGP_CompSuite | 11 | Composition manipulation |
| AEGP_LayerSuite | 9 | Layer management |
| AEGP_CollectionSuite | 2 | Selection collections |

---

## Core Data Types

### Primary Handle Types

```cpp
// Project structure - the current After Effects project
// Projects are a set of elements arranged hierarchically in a tree
typedef struct AEGP_Project *AEGP_ProjectH;

// Item handle - abstraction for any selectable project element
// Includes folders, compositions, and footage items
typedef struct AEGP_Item *AEGP_ItemH;

// Composition handle - represents a composition
// A sequence of renderable items that produce output over a time interval
typedef struct AEGP_Comp *AEGP_CompH;

// Footage handle - describes renderable items
// Folders and compositions are NOT footage
typedef struct AEGP_Footage *AEGP_FootageH;

// Layer handle - an element of a composition
// Includes solids, text, paint, cameras, lights, and images
typedef struct AEGP_Layer *AEGP_LayerH;

// Effect reference - an effect applied to a layer
typedef struct AEGP_EffectRef *AEGP_EffectRefH;

// Collection handle - represents selected items
typedef struct AEGP_Collection2 *AEGP_Collection2H;

// Memory handle - requires AEGP_LockMemHandle for access
typedef struct AEGP_MemHandle *AEGP_MemHandle;

// World handle - represents a frame of pixels
typedef struct AEGP_World *AEGP_WorldH;
```

### Time Structures

```cpp
// A_Time - rational time representation
typedef struct {
    A_long value;   // Numerator (frame count or time value)
    A_u_long scale; // Denominator (frames per second or time base)
} A_Time;

// A_Ratio - rational number for aspect ratios
typedef struct {
    A_long num;   // Numerator
    A_u_long den; // Denominator
} A_Ratio;
```

### Item Types

```cpp
typedef enum {
    AEGP_ItemType_NONE = 0,
    AEGP_ItemType_FOLDER,
    AEGP_ItemType_COMP,
    AEGP_ItemType_SOLID,
    AEGP_ItemType_FOOTAGE,
    AEGP_ItemType_NUM_TYPES
} AEGP_ItemType;
```

### Color Structure

```cpp
typedef struct {
    A_FpLong redF;    // 0.0 - 1.0
    A_FpLong greenF;  // 0.0 - 1.0
    A_FpLong blueF;   // 0.0 - 1.0
    A_FpLong alphaF;  // 0.0 - 1.0
} AEGP_ColorVal;
```

---

## AEGP_ItemSuite - Project Item Hierarchy

The Item Suite manages all items within the project panel, including folders, compositions, and footage items.

### Key Concepts

- **Anything in the project bin is an AEGP_Item**
- Cameras have no source and thus have no AEGP_ItemH
- Remain as abstract as possible; AEGP_Comps are passed as AEGP_Items unless specificity is required

### Functions

#### Project Iteration

```cpp
// Get the first item in the project
SPAPI A_Err (*AEGP_GetFirstProjItem)(
    AEGP_ProjectH   projectH,     // >> Project handle
    AEGP_ItemH      *itemPH);     // << First item (NULL if empty)

// Get the next item in project iteration
SPAPI A_Err (*AEGP_GetNextProjItem)(
    AEGP_ProjectH   projectH,     // >> Project handle
    AEGP_ItemH      itemH,        // >> Current item
    AEGP_ItemH      *next_itemPH); // << Next item (NULL if end)
```

#### Item Properties

```cpp
// Get item type (folder, comp, footage, solid)
SPAPI A_Err (*AEGP_GetItemType)(
    AEGP_ItemH      itemH,        // >> Item handle
    AEGP_ItemType   *item_typeP); // << Item type

// Get item name
SPAPI A_Err (*AEGP_GetItemName)(
    AEGP_PluginID   aegp_plugin_id, // >> Plugin ID
    AEGP_ItemH      itemH,          // >> Item handle
    AEGP_MemHandle  *unicode_namePH); // << UTF-16 name (dispose with AEGP_FreeMemHandle)

// Set item name (UNDOABLE)
SPAPI A_Err (*AEGP_SetItemName)(
    AEGP_ItemH          itemH,        // >> Item handle
    const A_UTF16Char   *nameZ);      // >> New name (UTF-16)

// Get item ID (unique within project)
SPAPI A_Err (*AEGP_GetItemID)(
    AEGP_ItemH   itemH,    // >> Item handle
    A_long       *item_idPL); // << Unique item ID

// Get item dimensions
SPAPI A_Err (*AEGP_GetItemDimensions)(
    AEGP_ItemH   itemH,     // >> Item handle
    A_long       *widthPL,  // << Width in pixels
    A_long       *heightPL); // << Height in pixels

// Get item pixel aspect ratio
SPAPI A_Err (*AEGP_GetItemPixelAspectRatio)(
    AEGP_ItemH   itemH,  // >> Item handle
    A_Ratio      *parP); // << Pixel aspect ratio

// Get item duration
SPAPI A_Err (*AEGP_GetItemDuration)(
    AEGP_ItemH   itemH,      // >> Item handle
    A_Time       *durationPT); // << Duration
```

#### Item Manipulation

```cpp
// Select/deselect item in project panel
SPAPI A_Err (*AEGP_SelectItem)(
    AEGP_ItemH   itemH,       // >> Item handle
    A_Boolean    selectB,     // >> TRUE to select
    A_Boolean    deselect_othersB); // >> TRUE to deselect others

// Check if item is selected
SPAPI A_Err (*AEGP_IsItemSelected)(
    AEGP_ItemH   itemH,        // >> Item handle
    A_Boolean    *selectedPB); // << Selection state

// Delete item (UNDOABLE)
SPAPI A_Err (*AEGP_DeleteItem)(
    AEGP_ItemH   itemH);  // >> Item to delete

// Get active (most recently selected) item
SPAPI A_Err (*AEGP_GetActiveItem)(
    AEGP_ItemH   *itemPH); // << Active item (NULL if none)

// Create new folder
SPAPI A_Err (*AEGP_CreateNewFolder)(
    const A_UTF16Char   *nameZ,       // >> Folder name
    AEGP_ItemH          parent_folderH0, // >> Parent folder (NULL for root)
    AEGP_ItemH          *new_folderPH); // << New folder handle

// Set item's parent folder
SPAPI A_Err (*AEGP_SetItemParentFolder)(
    AEGP_ItemH   itemH,          // >> Item to move
    AEGP_ItemH   parent_folderH); // >> New parent folder

// Get item's parent folder
SPAPI A_Err (*AEGP_GetItemParentFolder)(
    AEGP_ItemH   itemH,           // >> Item handle
    AEGP_ItemH   *parent_folderPH); // << Parent folder (NULL if root)
```

#### Item Flags

```cpp
// Get item flags (missing, proxy, etc.)
SPAPI A_Err (*AEGP_GetItemFlags)(
    AEGP_ItemH      itemH,       // >> Item handle
    AEGP_ItemFlags  *item_flagsP); // << Item flags

// Item flag values
#define AEGP_ItemFlag_MISSING          0x00000001  // Source file missing
#define AEGP_ItemFlag_HAS_PROXY        0x00000002  // Has proxy assigned
#define AEGP_ItemFlag_USING_PROXY      0x00000004  // Currently using proxy
#define AEGP_ItemFlag_MISSING_PROXY    0x00000008  // Proxy file missing
#define AEGP_ItemFlag_HAS_VIDEO        0x00000010  // Contains video
#define AEGP_ItemFlag_HAS_AUDIO        0x00000020  // Contains audio
#define AEGP_ItemFlag_STILL            0x00000040  // Is still image
#define AEGP_ItemFlag_HAS_ACTIVE_AUDIO 0x00000080  // Audio is active
```

---

## AEGP_FootageSuite - Footage Item Access

The Footage Suite provides access to footage items and their interpretation settings.

### Important Notes

- When getting/setting footage interpretation, incompatible options may cause warnings
- Make all related changes atomically
- Changing pulldown interpretation requires a difference between native and conformed frame rate

### Functions

#### Footage Access

```cpp
// Get footage handle from item (returns error if not footage)
SPAPI A_Err (*AEGP_GetMainFootageFromItem)(
    AEGP_ItemH      itemH,      // >> Item handle
    AEGP_FootageH   *footagePH); // << Footage handle

// Get proxy footage from item
SPAPI A_Err (*AEGP_GetProxyFootageFromItem)(
    AEGP_ItemH      itemH,      // >> Item handle
    A_Boolean       *has_proxyPB, // << TRUE if has proxy
    AEGP_FootageH   *proxy_footagePH); // << Proxy footage handle

// Get footage file path
SPAPI A_Err (*AEGP_GetFootagePath)(
    AEGP_FootageH   footageH,       // >> Footage handle
    A_long          frame_numL,     // >> Frame number (for sequences)
    A_long          file_typeL,     // >> File type
    AEGP_MemHandle  *unicode_pathPH); // << UTF-16 path (dispose required)
```

#### Creating Footage

```cpp
// Create new footage from file
SPAPI A_Err (*AEGP_NewFootage)(
    AEGP_PluginID           aegp_plugin_id,  // >> Plugin ID
    const A_UTF16Char       *pathZ,          // >> File path (UTF-16)
    const AEGP_FootageLayerKey *layer_infoP0, // >> Layer info (NULL for merged)
    const AEGP_FileSequenceImportOptions *sequence_optionsP0, // >> Sequence options
    AEGP_InterpretationStyle interp_style,   // >> Interpretation style
    void                    *reserved,       // >> Reserved (NULL)
    AEGP_FootageH           *footagePH);     // << New footage handle

// Interpretation styles
typedef enum {
    AEGP_InterpretationStyle_NO_DIALOG_GUESS = 0,
    AEGP_InterpretationStyle_DIALOG_OK = 1,
    AEGP_InterpretationStyle_NO_DIALOG_NO_GUESS = 2  // For replace footage
} AEGP_InterpretationStyle;

// Create solid footage
SPAPI A_Err (*AEGP_NewSolidFootage)(
    const A_UTF16Char   *nameZ,     // >> Solid name
    A_long              width,      // >> Width in pixels
    A_long              height,     // >> Height in pixels
    const AEGP_ColorVal *colorP,    // >> Solid color
    AEGP_FootageH       *footagePH); // << New solid footage handle

// Create placeholder footage
SPAPI A_Err (*AEGP_NewPlaceholderFootage)(
    AEGP_PluginID       aegp_plugin_id, // >> Plugin ID
    const A_UTF16Char   *nameZ,         // >> Placeholder name
    A_long              width,          // >> Width in pixels
    A_long              height,         // >> Height in pixels
    const A_Time        *durationPT,    // >> Duration
    AEGP_FootageH       *footagePH);    // << New placeholder handle

// Create placeholder from path (file_type must be set properly)
SPAPI A_Err (*AEGP_NewPlaceholderFootageWithPath)(
    AEGP_PluginID       aegp_plugin_id, // >> Plugin ID
    const A_UTF16Char   *pathZ,         // >> File path
    AEGP_Platform       platform,       // >> Platform type
    AEIO_FileType       file_type,      // >> File type (required!)
    A_long              width,          // >> Width
    A_long              height,         // >> Height
    const A_Time        *durationPT,    // >> Duration
    AEGP_FootageH       *footagePH);    // << New placeholder handle
```

#### Adding Footage to Project

```cpp
// Add footage to project
SPAPI A_Err (*AEGP_AddFootageToProject)(
    AEGP_FootageH   footageH,       // >> Footage to add
    AEGP_ItemH      folder_itemH,   // >> Parent folder
    AEGP_ItemH      *added_itemPH); // << Added item handle
```

#### Solid Footage Properties

```cpp
// Get solid footage color
SPAPI A_Err (*AEGP_GetSolidFootageColor)(
    AEGP_ItemH      itemH,    // >> Solid item handle
    A_Boolean       proxyB,   // >> TRUE for proxy, FALSE for main
    AEGP_ColorVal   *colorP); // << Solid color

// Set solid footage color (UNDOABLE)
SPAPI A_Err (*AEGP_SetSolidFootageColor)(
    AEGP_ItemH          itemH,   // >> Solid item handle
    A_Boolean           proxyB,  // >> TRUE for proxy
    const AEGP_ColorVal *colorP); // >> New color

// Set solid footage dimensions (UNDOABLE)
SPAPI A_Err (*AEGP_SetSolidFootageDimensions)(
    AEGP_ItemH   itemH,   // >> Solid item handle
    A_Boolean    proxyB,  // >> TRUE for proxy
    A_long       width,   // >> New width
    A_long       height); // >> New height
```

#### Footage Disposal

```cpp
// Dispose of footage handle (when not added to project)
SPAPI A_Err (*AEGP_DisposeFootage)(
    AEGP_FootageH   footageH);  // >> Footage to dispose
```

---

## AEGP_CompSuite - Composition Manipulation

The Comp Suite manages compositions, their settings, and layer creation.

### Functions

#### Composition Access

```cpp
// Get composition from item handle
SPAPI A_Err (*AEGP_GetCompFromItem)(
    AEGP_ItemH   itemH,    // >> Item handle (must be comp type)
    AEGP_CompH   *compPH); // << Composition handle

// Get item from composition handle
SPAPI A_Err (*AEGP_GetItemFromComp)(
    AEGP_CompH   compH,    // >> Composition handle
    AEGP_ItemH   *itemPH); // << Item handle
```

#### Composition Properties

```cpp
// Get composition downsample factor
SPAPI A_Err (*AEGP_GetCompDownsampleFactor)(
    AEGP_CompH              compH,  // >> Composition handle
    AEGP_DownsampleFactor   *dsfP); // << Downsample factor

// Set composition downsample factor
SPAPI A_Err (*AEGP_SetCompDownsampleFactor)(
    AEGP_CompH                  compH, // >> Composition handle
    const AEGP_DownsampleFactor *dsfP); // >> New downsample factor

// AEGP_DownsampleFactor structure
typedef struct {
    A_short xS;  // Horizontal factor (1 = full, 2 = half, etc.)
    A_short yS;  // Vertical factor
} AEGP_DownsampleFactor;

// Get composition background color
SPAPI A_Err (*AEGP_GetCompBGColor)(
    AEGP_CompH      compH,       // >> Composition handle
    AEGP_ColorVal   *bg_colorP); // << Background color

// Set composition background color
SPAPI A_Err (*AEGP_SetCompBGColor)(
    AEGP_CompH          compH,       // >> Composition handle
    const AEGP_ColorVal *bg_colorP); // >> New background color

// Get composition flags
SPAPI A_Err (*AEGP_GetCompFlags)(
    AEGP_CompH      compH,        // >> Composition handle
    AEGP_CompFlags  *comp_flagsP); // << Composition flags

// Get composition frame rate
SPAPI A_Err (*AEGP_GetCompFramerate)(
    AEGP_CompH   compH,   // >> Composition handle
    A_FpLong     *fpsPF); // << Frames per second

// Set composition frame rate (UNDOABLE)
SPAPI A_Err (*AEGP_SetCompFrameRate)(
    AEGP_CompH      compH,   // >> Composition handle
    const A_FpLong  *fpsPF); // >> New frame rate

// Get composition frame duration
SPAPI A_Err (*AEGP_GetCompFrameDuration)(
    AEGP_CompH   compH,    // >> Composition handle
    A_Time       *timeP);  // << Duration of one frame

// Set composition duration (UNDOABLE)
SPAPI A_Err (*AEGP_SetCompDuration)(
    AEGP_CompH     compH,       // >> Composition handle
    const A_Time   *durationPT); // >> New duration

// Get composition work area
SPAPI A_Err (*AEGP_GetCompWorkAreaStart)(
    AEGP_CompH   compH,    // >> Composition handle
    A_Time       *startPT); // << Work area start time

SPAPI A_Err (*AEGP_GetCompWorkAreaDuration)(
    AEGP_CompH   compH,       // >> Composition handle
    A_Time       *durationPT); // << Work area duration
```

#### Composition Flags

```cpp
// Composition flag values
#define AEGP_CompFlag_SHOW_ALL_SHY        0x00000001
#define AEGP_CompFlag_ENABLE_MOTION_BLUR  0x00000002
#define AEGP_CompFlag_ENABLE_TIME_FILTER  0x00000004
#define AEGP_CompFlag_GRID_TO_FRAMES      0x00000008
#define AEGP_CompFlag_GRID_TO_FIELDS      0x00000010
#define AEGP_CompFlag_USE_LOCAL_DSF       0x00000020
#define AEGP_CompFlag_DRAFT_3D            0x00000040
#define AEGP_CompFlag_SHOW_GRAPH          0x00000080
```

#### Creating Compositions

```cpp
// Create new composition (UNDOABLE)
SPAPI A_Err (*AEGP_CreateComp)(
    AEGP_ItemH          parent_folderH0, // >> Parent folder (NULL for root)
    const A_UTF16Char   *nameZ,          // >> Composition name
    A_long              width,           // >> Width in pixels
    A_long              height,          // >> Height in pixels
    const A_Ratio       *pixel_aspect_ratioP, // >> Pixel aspect ratio
    const A_Time        *durationPT,     // >> Duration
    const A_Ratio       *framerateP,     // >> Frame rate (num/den)
    AEGP_CompH          *new_compPH);    // << New composition handle

// Duplicate composition (UNDOABLE)
SPAPI A_Err (*AEGP_DuplicateComp)(
    AEGP_CompH   compH,           // >> Composition to duplicate
    AEGP_CompH   *new_compPH);    // << Duplicated composition

// Get most recently used composition
SPAPI A_Err (*AEGP_GetMostRecentlyUsedComp)(
    AEGP_CompH   *compPH);  // << Most recent comp (NULL if none)
```

#### Creating Layers in Compositions

```cpp
// Create solid in composition (UNDOABLE)
SPAPI A_Err (*AEGP_CreateSolidInComp)(
    const A_UTF16Char   *utf_nameZ,     // >> Solid name
    A_long              width,          // >> Width in pixels
    A_long              height,         // >> Height in pixels
    const AEGP_ColorVal *colorP,        // >> Solid color
    AEGP_CompH          parent_compH,   // >> Parent composition
    const A_Time        *durationPT0,   // >> Duration (NULL for comp duration)
    AEGP_LayerH         *new_solidPH);  // << New solid layer handle

// Create camera in composition (UNDOABLE)
SPAPI A_Err (*AEGP_CreateCameraInComp)(
    const A_UTF16Char   *nameZ,         // >> Camera name
    A_FloatPoint        center_point,   // >> Center point
    AEGP_CompH          parent_compH,   // >> Parent composition
    AEGP_LayerH         *new_cameraPH); // << New camera layer handle

// Create light in composition (UNDOABLE)
SPAPI A_Err (*AEGP_CreateLightInComp)(
    const A_UTF16Char   *nameZ,        // >> Light name
    A_FloatPoint        center_point,  // >> Center point
    AEGP_CompH          parent_compH,  // >> Parent composition
    AEGP_LayerH         *new_lightPH); // << New light layer handle

// Create null object (UNDOABLE)
SPAPI A_Err (*AEGP_CreateNullInComp)(
    const A_UTF16Char   *nameZ,       // >> Null name
    AEGP_CompH          parent_compH, // >> Parent composition
    const A_Time        *durationPT0, // >> Duration (NULL for comp duration)
    AEGP_LayerH         *new_nullPH); // << New null layer handle
```

#### Layer Ordering

```cpp
// Reorder composition selection (UNDOABLE) - New in CompSuite11
SPAPI A_Err (*AEGP_ReorderCompSelection)(
    AEGP_CompH   compH,        // >> Composition handle
    A_long       layer_index); // >> Target layer index

// Get selection from composition
SPAPI A_Err (*AEGP_GetNewCollectionFromCompSelection)(
    AEGP_PluginID       aegp_plugin_id, // >> Plugin ID
    AEGP_CompH          compH,          // >> Composition handle
    AEGP_Collection2H   *collectionPH); // << Selection collection
```

---

## AEGP_LayerSuite - Layer Management

The Layer Suite is one of the largest in the SDK, providing comprehensive layer manipulation capabilities.

### Key Concepts

- All layers created with AEGP calls start at composition time 0
- Use AEGP_SetLayerOffset() and AEGP_SetLayerInPointAndDuration() to set time info

### Functions

#### Layer Access

```cpp
// Get number of layers in composition
SPAPI A_Err (*AEGP_GetCompNumLayers)(
    AEGP_CompH   compH,        // >> Composition handle
    A_long       *num_layersPL); // << Layer count

// Get layer by index
SPAPI A_Err (*AEGP_GetCompLayerByIndex)(
    AEGP_CompH   compH,       // >> Composition handle
    A_long       layer_index, // >> Layer index (0 = topmost)
    AEGP_LayerH  *layerPH);   // << Layer handle

// Get active (selected) layer
SPAPI A_Err (*AEGP_GetActiveLayer)(
    AEGP_LayerH  *layerPH);  // << Active layer (NULL if none or multiple)

// Get layer index
SPAPI A_Err (*AEGP_GetLayerIndex)(
    AEGP_LayerH  layerH,       // >> Layer handle
    A_long       *layer_indexPL); // << Layer index

// Get layer's parent composition
SPAPI A_Err (*AEGP_GetLayerParentComp)(
    AEGP_LayerH  layerH,    // >> Layer handle
    AEGP_CompH   *compPH);  // << Parent composition

// Get layer from layer ID
SPAPI A_Err (*AEGP_GetLayerFromLayerID)(
    AEGP_CompH   parent_compH,  // >> Parent composition
    AEGP_LayerID layer_id,      // >> Layer ID
    AEGP_LayerH  *layerPH);     // << Layer handle
```

#### Layer Properties

```cpp
// Get layer name
SPAPI A_Err (*AEGP_GetLayerName)(
    AEGP_LayerH     layerH,         // >> Layer handle
    AEGP_MemHandle  *utf_layer_namePH0, // << Layer name (UTF-16)
    AEGP_MemHandle  *utf_source_namePH0); // << Source name (UTF-16)

// Set layer name (UNDOABLE)
SPAPI A_Err (*AEGP_SetLayerName)(
    AEGP_LayerH         layerH,   // >> Layer handle
    const A_UTF16Char   *nameZ);  // >> New name

// Get layer quality
SPAPI A_Err (*AEGP_GetLayerQuality)(
    AEGP_LayerH         layerH,     // >> Layer handle
    AEGP_LayerQuality   *qualityP); // << Layer quality

// Set layer quality (UNDOABLE)
SPAPI A_Err (*AEGP_SetLayerQuality)(
    AEGP_LayerH         layerH,   // >> Layer handle
    AEGP_LayerQuality   quality); // >> New quality

// Layer quality values
typedef enum {
    AEGP_LayerQual_NONE = 0,
    AEGP_LayerQual_WIREFRAME,
    AEGP_LayerQual_DRAFT,
    AEGP_LayerQual_BEST
} AEGP_LayerQuality;

// Get layer source item
SPAPI A_Err (*AEGP_GetLayerSourceItem)(
    AEGP_LayerH  layerH,       // >> Layer handle
    AEGP_ItemH   *source_itemPH); // << Source item handle
```

#### Layer Time

```cpp
// Get layer in-point and duration
SPAPI A_Err (*AEGP_GetLayerInPointAndDuration)(
    AEGP_LayerH  layerH,      // >> Layer handle
    AEGP_LTimeMode time_mode, // >> Time mode (layer or comp)
    A_Time       *in_pointPT, // << In-point
    A_Time       *durationPT); // << Duration

// Set layer in-point and duration (UNDOABLE)
SPAPI A_Err (*AEGP_SetLayerInPointAndDuration)(
    AEGP_LayerH     layerH,       // >> Layer handle
    AEGP_LTimeMode  time_mode,    // >> Time mode
    const A_Time    *in_pointPT,  // >> New in-point
    const A_Time    *durationPT); // >> New duration

// Get layer offset (start time)
SPAPI A_Err (*AEGP_GetLayerOffset)(
    AEGP_LayerH  layerH,    // >> Layer handle
    A_Time       *offsetPT); // << Offset time

// Set layer offset (UNDOABLE)
SPAPI A_Err (*AEGP_SetLayerOffset)(
    AEGP_LayerH   layerH,     // >> Layer handle
    const A_Time  *offsetPT); // >> New offset

// Time mode values
typedef enum {
    AEGP_LTimeMode_LayerTime = 0,  // Relative to layer
    AEGP_LTimeMode_CompTime        // Relative to composition
} AEGP_LTimeMode;

// Convert comp time to layer time
SPAPI A_Err (*AEGP_ConvertCompToLayerTime)(
    AEGP_LayerH   layerH,        // >> Layer handle
    const A_Time  *comp_timePT,  // >> Comp time
    A_Time        *layer_timePT); // << Layer time

// Map comp to layer time (handles time remapping)
SPAPI A_Err (*AEGP_MapCompToLayerTime)(
    AEGP_LayerH   layerH,        // >> Layer handle
    const A_Time  *comp_timePT,  // >> Comp time
    A_Time        *layer_timePT); // << Layer time (with time remap)
```

#### Layer Parenting

```cpp
// Get layer parent
SPAPI A_Err (*AEGP_GetLayerParent)(
    AEGP_LayerH   layerH,          // >> Layer handle
    AEGP_LayerH   *parent_layerPH); // << Parent layer (NULL if no parent)

// Set layer parent (UNDOABLE)
SPAPI A_Err (*AEGP_SetLayerParent)(
    AEGP_LayerH   layerH,          // >> Layer handle
    AEGP_LayerH   parent_layerH0); // >> Parent layer (NULL to remove parent)
```

#### Layer Operations

```cpp
// Check if adding layer is valid
SPAPI A_Err (*AEGP_IsAddLayerValid)(
    AEGP_ItemH   item_to_addH,  // >> Item to add as layer
    AEGP_CompH   into_compH,    // >> Target composition
    A_Boolean    *validPB);     // << TRUE if valid

// Add layer from item (UNDOABLE)
SPAPI A_Err (*AEGP_AddLayer)(
    AEGP_ItemH   item_to_addH,    // >> Item to add (check with IsAddLayerValid first)
    AEGP_CompH   into_compH,      // >> Target composition
    AEGP_LayerH  *added_layerPH0); // << Added layer handle

// Duplicate layer (UNDOABLE)
SPAPI A_Err (*AEGP_DuplicateLayer)(
    AEGP_LayerH   orig_layerH,        // >> Original layer
    AEGP_LayerH   *duplicate_layerPH); // << Duplicated layer

// Delete layer (UNDOABLE)
SPAPI A_Err (*AEGP_DeleteLayer)(
    AEGP_LayerH   layerH);  // >> Layer to delete
```

#### Layer Video/Audio State

```cpp
// Check if layer video is really on (considers solo)
SPAPI A_Err (*AEGP_IsLayerVideoReallyOn)(
    AEGP_LayerH   layerH,      // >> Layer handle
    A_Boolean     *onPB);      // << TRUE if video on

// Check if layer audio is really on (considers solo)
SPAPI A_Err (*AEGP_IsLayerAudioReallyOn)(
    AEGP_LayerH   layerH,      // >> Layer handle
    A_Boolean     *onPB);      // << TRUE if audio on
```

---

## AEGP_CollectionSuite - Item Collections

The Collection Suite manages groups of selected items for batch operations.

### Functions

```cpp
// Create new empty collection
SPAPI A_Err (*AEGP_NewCollection)(
    AEGP_PluginID       aegp_plugin_id, // >> Plugin ID
    AEGP_Collection2H   *collectionPH); // << New collection handle

// Dispose collection
SPAPI A_Err (*AEGP_DisposeCollection)(
    AEGP_Collection2H   collectionH);  // >> Collection to dispose

// Get number of items in collection
SPAPI A_Err (*AEGP_GetCollectionNumItems)(
    AEGP_Collection2H   collectionH,    // >> Collection handle
    A_u_long            *num_itemsPL);  // << Number of items

// Get item from collection by index
SPAPI A_Err (*AEGP_GetCollectionItemByIndex)(
    AEGP_Collection2H       collectionH,  // >> Collection handle
    A_u_long                index,        // >> Item index
    AEGP_CollectionItem2    *itemP);      // << Collection item

// Add item to collection
SPAPI A_Err (*AEGP_CollectionPushBack)(
    AEGP_Collection2H           collectionH, // >> Collection handle
    const AEGP_CollectionItem2  *itemP);     // >> Item to add

// Erase item range from collection
SPAPI A_Err (*AEGP_CollectionErase)(
    AEGP_Collection2H   collectionH,  // >> Collection handle
    A_u_long            index_firstL, // >> First index
    A_u_long            index_lastL); // >> Last index

// Set current selection from collection
SPAPI A_Err (*AEGP_SetSelection)(
    AEGP_Collection2H   collectionH);  // >> Collection to set as selection
```

### Collection Item Types

```cpp
// Collection item structure
typedef struct {
    AEGP_CollectionItemType type;
    union {
        AEGP_LayerH         layer;
        AEGP_MaskRefH       mask;
        AEGP_EffectRefH     effect;
        AEGP_StreamRefH     stream;
        AEGP_MaskVertexIDVal mask_vertex;
        AEGP_KeyframeIdxVal keyframe;
    } u;
} AEGP_CollectionItem2;

// Collection item types
typedef enum {
    AEGP_CollectionItemType_NONE = 0,
    AEGP_CollectionItemType_LAYER,
    AEGP_CollectionItemType_MASK,
    AEGP_CollectionItemType_EFFECT,
    AEGP_CollectionItemType_STREAM,
    AEGP_CollectionItemType_KEYFRAME,
    AEGP_CollectionItemType_MASK_VERTEX
} AEGP_CollectionItemType;
```

---

## Footage Interpretation

### AEGP_FootageInterp Structure

```cpp
typedef struct {
    AEGP_InterlaceLabel     il;              // Interlace settings
    AEGP_AlphaLabel         al;              // Alpha interpretation
    AEGP_PulldownPhase      pd;              // 3:2 pulldown phase
    AEGP_LoopBehavior       loop;            // Loop settings
    A_Ratio                 pix_aspect_ratio; // Pixel aspect ratio
    A_FpLong                native_fpsF;     // Native frame rate
    A_FpLong                conform_fpsF;    // Conformed frame rate
    A_long                  depthL;          // Bit depth
    A_Boolean               motion_dB;       // Motion detection
} AEGP_FootageInterp;
```

### Pulldown Phase Values

```cpp
typedef enum {
    AEGP_PulldownPhase_NO_PULLDOWN = 0,
    AEGP_PulldownPhase_WSSWW = 1,   // Whole-Split-Split-Whole-Whole
    AEGP_PulldownPhase_SSWWW,       // Split-Split-Whole-Whole-Whole
    AEGP_PulldownPhase_SWWWS,       // Split-Whole-Whole-Whole-Split
    AEGP_PulldownPhase_WWWSS,       // Whole-Whole-Whole-Split-Split
    AEGP_PulldownPhase_WWSSW,       // Whole-Whole-Split-Split-Whole
    AEGP_PulldownPhase_WWWSW,       // Advanced pulldown patterns
    AEGP_PulldownPhase_WWSWW,
    AEGP_PulldownPhase_WSWWW,
    AEGP_PulldownPhase_SWWWW,
    AEGP_PulldownPhase_WWWWS
} AEGP_PulldownPhase;
```

### Loop Behavior

```cpp
typedef struct {
    A_long  loops;     // Number of loops
    A_long  reserved;  // Reserved for future use (palindrome, etc.)
} AEGP_LoopBehavior;
```

### Interpretation Functions

```cpp
// Get footage interpretation
SPAPI A_Err (*AEGP_GetFootageInterpretation)(
    AEGP_ItemH          itemH,     // >> Footage item
    A_Boolean           proxyB,    // >> TRUE for proxy interpretation
    AEGP_FootageInterp  *interpP); // << Interpretation settings

// Set footage interpretation (UNDOABLE)
SPAPI A_Err (*AEGP_SetFootageInterpretation)(
    AEGP_ItemH              itemH,    // >> Footage item
    A_Boolean               proxyB,   // >> TRUE for proxy
    const AEGP_FootageInterp *interpP); // >> New interpretation
```

---

## Solid and Adjustment Layer Creation

### Creating Solids

```cpp
// Method 1: Create solid footage first, then add as layer
AEGP_FootageH solidFootage;
ERR(suites.FootageSuite5()->AEGP_NewSolidFootage(
    L"My Solid",        // Name
    1920,               // Width
    1080,               // Height
    &color,             // Color
    &solidFootage));

AEGP_ItemH solidItem;
ERR(suites.FootageSuite5()->AEGP_AddFootageToProject(
    solidFootage,
    folderH,
    &solidItem));

AEGP_LayerH solidLayer;
ERR(suites.LayerSuite9()->AEGP_AddLayer(
    solidItem,
    compH,
    &solidLayer));

// Method 2: Create solid directly in composition
AEGP_LayerH solidLayer;
ERR(suites.CompSuite11()->AEGP_CreateSolidInComp(
    L"My Solid",        // Name
    1920,               // Width
    1080,               // Height
    &color,             // Color
    compH,              // Parent composition
    &duration,          // Duration (NULL for comp duration)
    &solidLayer));      // Output layer handle
```

### Creating Adjustment Layers

```cpp
// Create solid, then set adjustment layer flag
AEGP_LayerH adjustmentLayer;
ERR(suites.CompSuite11()->AEGP_CreateSolidInComp(
    L"Adjustment Layer",
    compWidth,
    compHeight,
    &whiteColor,
    compH,
    NULL,
    &adjustmentLayer));

// Set adjustment layer flag
ERR(suites.LayerSuite9()->AEGP_SetLayerFlag(
    adjustmentLayer,
    AEGP_LayerFlag_ADJUSTMENT_LAYER,
    TRUE));
```

---

## Layer Flags and Properties

### Layer Flag Values

```cpp
typedef enum {
    AEGP_LayerFlag_NONE              = 0x00000000,
    AEGP_LayerFlag_VIDEO_ACTIVE      = 0x00000001,  // Video switch on
    AEGP_LayerFlag_AUDIO_ACTIVE      = 0x00000002,  // Audio switch on
    AEGP_LayerFlag_EFFECTS_ACTIVE    = 0x00000004,  // Effects switch on
    AEGP_LayerFlag_MOTION_BLUR       = 0x00000008,  // Motion blur enabled
    AEGP_LayerFlag_FRAME_BLENDING    = 0x00000010,  // Frame blending enabled
    AEGP_LayerFlag_LOCKED            = 0x00000020,  // Layer locked
    AEGP_LayerFlag_SHY               = 0x00000040,  // Shy layer
    AEGP_LayerFlag_COLLAPSE          = 0x00000080,  // Collapse transformations
    AEGP_LayerFlag_AUTO_ORIENT_ROTATION = 0x00000100, // Auto-orient rotation
    AEGP_LayerFlag_ADJUSTMENT_LAYER  = 0x00000200,  // Adjustment layer
    AEGP_LayerFlag_TIME_REMAPPING    = 0x00000400,  // Time remapping enabled
    AEGP_LayerFlag_LAYER_IS_3D       = 0x00000800,  // 3D layer
    AEGP_LayerFlag_LOOK_AT_CAMERA    = 0x00001000,  // Look at camera
    AEGP_LayerFlag_LOOK_AT_POI       = 0x00002000,  // Look at point of interest
    AEGP_LayerFlag_SOLO              = 0x00004000,  // Solo layer
    AEGP_LayerFlag_MARKERS_LOCKED    = 0x00008000,  // Markers locked
    AEGP_LayerFlag_ENVIRONMENT_LAYER = 0x00010000,  // Environment layer (CS6+)
    AEGP_LayerFlag_NULL_LAYER        = 0x00020000,  // Null layer
    AEGP_LayerFlag_HIDE_LOCKED_MASKS = 0x00040000,  // Hide locked masks
    AEGP_LayerFlag_GUIDE_LAYER       = 0x00080000   // Guide layer
} AEGP_LayerFlags;
```

### Layer Flag Functions

```cpp
// Get all layer flags
SPAPI A_Err (*AEGP_GetLayerFlags)(
    AEGP_LayerH      layerH,        // >> Layer handle
    AEGP_LayerFlags  *layer_flagsP); // << All flags

// Set individual layer flag (UNDOABLE)
SPAPI A_Err (*AEGP_SetLayerFlag)(
    AEGP_LayerH      layerH,       // >> Layer handle
    AEGP_LayerFlags  single_flag,  // >> Flag to set
    A_Boolean        valueB);      // >> TRUE to enable, FALSE to disable
```

---

## Composition Settings

### Complete Composition Properties

```cpp
// Get/set dimensions
SPAPI A_Err (*AEGP_GetCompDimensions)(
    AEGP_CompH   compH,
    A_long       *widthPL,
    A_long       *heightPL);

// Get/set pixel aspect ratio
SPAPI A_Err (*AEGP_GetCompPixelAspectRatio)(
    AEGP_CompH   compH,
    A_Ratio      *parP);

// Get/set shutter angle and phase
SPAPI A_Err (*AEGP_GetCompShutterAnglePhase)(
    AEGP_CompH   compH,
    A_Ratio      *angle,
    A_Ratio      *phase);

SPAPI A_Err (*AEGP_SetCompShutterAnglePhase)(
    AEGP_CompH      compH,
    const A_Ratio   *angle,
    const A_Ratio   *phase);

// Get/set motion blur samples limit
SPAPI A_Err (*AEGP_GetCompMotionBlurAdaptiveSampleLimit)(
    AEGP_CompH   compH,
    A_long       *samplesPL);

SPAPI A_Err (*AEGP_SetCompMotionBlurAdaptiveSampleLimit)(
    AEGP_CompH   compH,
    A_long       samples);

// Get/set display start time
SPAPI A_Err (*AEGP_GetCompDisplayStartTime)(
    AEGP_CompH   compH,
    A_Time       *start_timePT);

SPAPI A_Err (*AEGP_SetCompDisplayStartTime)(
    AEGP_CompH      compH,
    const A_Time    *start_timePT);

// Get layer/source name display mode (CompSuite11+)
SPAPI A_Err (*AEGP_GetCompDisplayDropFrame)(
    AEGP_CompH   compH,
    A_Boolean    *dropFramePB);

SPAPI A_Err (*AEGP_SetShowLayerNameOrSourceName)(
    AEGP_CompH   compH,
    A_Boolean    showLayerNamesB);

SPAPI A_Err (*AEGP_GetShowBlendModes)(
    AEGP_CompH   compH,
    A_Boolean    *showBlendModesPB);
```

---

## Code Examples

### Example 1: Import Footage and Add to Composition

```cpp
A_Err ImportFootageToComp(
    AEGP_PluginID      plugin_id,
    const A_UTF16Char  *file_path,
    AEGP_CompH         target_comp)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Create new footage from file
    AEGP_FootageH footageH = NULL;
    ERR(suites.FootageSuite5()->AEGP_NewFootage(
        plugin_id,
        file_path,
        NULL,  // Layer info (NULL for merged)
        NULL,  // Sequence options
        AEGP_InterpretationStyle_NO_DIALOG_GUESS,
        NULL,
        &footageH));

    if (!err && footageH) {
        // Add footage to project root
        AEGP_ItemH footageItemH = NULL;
        ERR(suites.FootageSuite5()->AEGP_AddFootageToProject(
            footageH,
            NULL,  // Parent folder (NULL for root)
            &footageItemH));

        if (!err && footageItemH) {
            // Check if we can add this as a layer
            A_Boolean valid = FALSE;
            ERR(suites.LayerSuite9()->AEGP_IsAddLayerValid(
                footageItemH,
                target_comp,
                &valid));

            if (!err && valid) {
                // Add as layer to composition
                AEGP_LayerH newLayerH = NULL;
                ERR(suites.LayerSuite9()->AEGP_AddLayer(
                    footageItemH,
                    target_comp,
                    &newLayerH));
            }
        }
    }

    return err;
}
```

### Example 2: Create Solid with Custom Duration

```cpp
A_Err CreateColoredSolid(
    AEGP_PluginID  plugin_id,
    AEGP_CompH     compH,
    A_FpLong       r, A_FpLong g, A_FpLong b,
    A_long         durationFrames,
    AEGP_LayerH    *solidLayerPH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Get composition dimensions
    A_long compWidth, compHeight;
    ERR(suites.ItemSuite9()->AEGP_GetItemDimensions(
        suites.CompSuite11()->AEGP_GetItemFromComp(compH),
        &compWidth, &compHeight));

    // Get frame duration for calculating time
    A_Time frameDuration;
    ERR(suites.CompSuite11()->AEGP_GetCompFrameDuration(compH, &frameDuration));

    // Calculate solid duration
    A_Time solidDuration;
    solidDuration.value = frameDuration.value * durationFrames;
    solidDuration.scale = frameDuration.scale;

    // Set up color
    AEGP_ColorVal color;
    color.redF = r;
    color.greenF = g;
    color.blueF = b;
    color.alphaF = 1.0;

    // Create the solid
    ERR(suites.CompSuite11()->AEGP_CreateSolidInComp(
        L"Custom Solid",
        compWidth,
        compHeight,
        &color,
        compH,
        &solidDuration,
        solidLayerPH));

    return err;
}
```

### Example 3: Iterate Project Items

```cpp
A_Err ListAllCompositions(AEGP_PluginID plugin_id)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Get current project
    AEGP_ProjectH projectH;
    ERR(suites.ProjSuite6()->AEGP_GetProjectByIndex(0, &projectH));

    // Get first item
    AEGP_ItemH itemH = NULL;
    ERR(suites.ItemSuite9()->AEGP_GetFirstProjItem(projectH, &itemH));

    while (!err && itemH) {
        // Check item type
        AEGP_ItemType itemType;
        ERR(suites.ItemSuite9()->AEGP_GetItemType(itemH, &itemType));

        if (!err && itemType == AEGP_ItemType_COMP) {
            // Get composition name
            AEGP_MemHandle nameH = NULL;
            ERR(suites.ItemSuite9()->AEGP_GetItemName(
                plugin_id, itemH, &nameH));

            if (!err && nameH) {
                // Process composition...
                ERR(suites.MemorySuite1()->AEGP_FreeMemHandle(nameH));
            }
        }

        // Get next item
        AEGP_ItemH nextItemH = NULL;
        ERR(suites.ItemSuite9()->AEGP_GetNextProjItem(
            projectH, itemH, &nextItemH));
        itemH = nextItemH;
    }

    return err;
}
```

### Example 4: Set Layer Parent

```cpp
A_Err ParentLayerToNull(
    AEGP_PluginID  plugin_id,
    AEGP_LayerH    childLayer,
    AEGP_CompH     compH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Create null object
    AEGP_LayerH nullLayer = NULL;
    ERR(suites.CompSuite11()->AEGP_CreateNullInComp(
        L"Parent Null",
        compH,
        NULL,  // Use comp duration
        &nullLayer));

    if (!err && nullLayer) {
        // Set parent relationship
        ERR(suites.LayerSuite9()->AEGP_SetLayerParent(
            childLayer,
            nullLayer));
    }

    return err;
}
```

### Example 5: Replace Footage Source

```cpp
A_Err ReplaceFootageSource(
    AEGP_PluginID      plugin_id,
    AEGP_ItemH         existingItemH,
    const A_UTF16Char  *newFilePath)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Create new footage
    AEGP_FootageH newFootageH = NULL;
    ERR(suites.FootageSuite5()->AEGP_NewFootage(
        plugin_id,
        newFilePath,
        NULL,
        NULL,
        AEGP_InterpretationStyle_NO_DIALOG_NO_GUESS,  // For replacement
        NULL,
        &newFootageH));

    if (!err && newFootageH) {
        // Replace the main footage
        ERR(suites.FootageSuite5()->AEGP_ReplaceItemMainFootage(
            existingItemH,
            newFootageH));
    }

    return err;
}
```

### Example 6: Batch Layer Operations with Collections

```cpp
A_Err SoloSelectedLayers(AEGP_PluginID plugin_id, AEGP_CompH compH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Get current selection
    AEGP_Collection2H collectionH = NULL;
    ERR(suites.CompSuite11()->AEGP_GetNewCollectionFromCompSelection(
        plugin_id, compH, &collectionH));

    if (!err && collectionH) {
        A_u_long numItems = 0;
        ERR(suites.CollectionSuite2()->AEGP_GetCollectionNumItems(
            collectionH, &numItems));

        for (A_u_long i = 0; !err && i < numItems; i++) {
            AEGP_CollectionItem2 item;
            ERR(suites.CollectionSuite2()->AEGP_GetCollectionItemByIndex(
                collectionH, i, &item));

            if (!err && item.type == AEGP_CollectionItemType_LAYER) {
                // Solo this layer
                ERR(suites.LayerSuite9()->AEGP_SetLayerFlag(
                    item.u.layer,
                    AEGP_LayerFlag_SOLO,
                    TRUE));
            }
        }

        // Dispose collection
        ERR(suites.CollectionSuite2()->AEGP_DisposeCollection(collectionH));
    }

    return err;
}
```

---

## Best Practices

### Memory Management

1. **Always dispose handles when done**
   ```cpp
   AEGP_MemHandle nameH = NULL;
   ERR(suites.ItemSuite9()->AEGP_GetItemName(plugin_id, itemH, &nameH));
   if (nameH) {
       // Use the name...
       ERR(suites.MemorySuite1()->AEGP_FreeMemHandle(nameH));
   }
   ```

2. **Dispose footage not added to project**
   ```cpp
   AEGP_FootageH footageH = NULL;
   ERR(suites.FootageSuite5()->AEGP_NewFootage(..., &footageH));
   if (err) {
       // Failed to use footage, must dispose
       suites.FootageSuite5()->AEGP_DisposeFootage(footageH);
   }
   ```

3. **Always dispose collections**
   ```cpp
   AEGP_Collection2H collH = NULL;
   // ... use collection ...
   ERR(suites.CollectionSuite2()->AEGP_DisposeCollection(collH));
   ```

### Error Handling

1. **Check validity before operations**
   ```cpp
   A_Boolean valid = FALSE;
   ERR(suites.LayerSuite9()->AEGP_IsAddLayerValid(itemH, compH, &valid));
   if (!err && valid) {
       ERR(suites.LayerSuite9()->AEGP_AddLayer(itemH, compH, &layerH));
   }
   ```

2. **Gracefully handle missing suites**
   ```cpp
   if (!suites.FootageSuite5()) {
       // Fall back to older version or show error
       return AEGP_Err_MISSING_SUITE;
   }
   ```

### Undo Support

1. **Use UNDOABLE operations within undo groups**
   ```cpp
   ERR(suites.UtilitySuite6()->AEGP_StartUndoGroup(L"My Operation"));
   // Perform undoable operations...
   ERR(suites.UtilitySuite6()->AEGP_EndUndoGroup());
   ```

### Performance

1. **Lock memory handles only when needed**
   ```cpp
   void *dataP = NULL;
   ERR(suites.MemorySuite1()->AEGP_LockMemHandle(memH, &dataP));
   // Quick operation on data
   ERR(suites.MemorySuite1()->AEGP_UnlockMemHandle(memH));
   ```

2. **Batch operations when possible**
   - Collect all items first, then process
   - Use collections for multi-selection operations

3. **Cache handles when iterating**
   - Avoid repeated lookups of the same item/layer

---

## References

- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [AEGP Suites Documentation](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [AEGP Data Types](https://ae-plugins.docsforadobe.dev/aegps/data-types/)
- [AEGP Details](https://ae-plugins.docsforadobe.dev/aegps/aegp-details/)
- [SDK Implementation Guide](https://ae-plugins.docsforadobe.dev/aegps/implementation/)

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Covers: After Effects SDK through version 24.x (2024)*
