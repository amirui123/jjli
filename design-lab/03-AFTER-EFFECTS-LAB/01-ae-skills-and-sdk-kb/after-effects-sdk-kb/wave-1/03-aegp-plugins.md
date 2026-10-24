---
source: Official Adobe Documentation
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
---
[3-Resources/anchors/status-active]]

# AEGP (After Effects General Plugins) - Complete Developer Reference

## Overview

The After Effects General Plug-in (AEGP) API is powerful and broad, offering functionality beyond what is available to effect plug-ins. To end users, AEGP extensions appear as native After Effects features. AEGPs can add items to any After Effects menu, and additional panels listed in the Window menu. These menu items are indistinguishable from After Effects' own menu items.

AEGP plug-ins, panels, and scripts can read and modify nearly every element of After Effects projects and preferences. They can add menu items, "hook" (register themselves to receive) and trigger After Effects' internal commands, and add new panels that dock and resize within the After Effects UI. They can work with markers and keyframes, manage the render queue, and can even run scripts.

### Core Capabilities

AEGPs can perform extensive project manipulation:

- **Menu Integration**: Add, intercept, and trigger menu commands
- **Keyframe Management**: Access and modify the keyframe database
- **Internal Messaging**: Register functions within After Effects' messaging system
- **Composition Control**: Add/remove items to projects and compositions
- **Filter Management**: Apply and remove filters and keyframes
- **Project Analysis**: Determine external files required for rendering
- **File Handling**: Replace files and modify interpretations
- **Panel Creation**: Create dockable UI panels within After Effects
- **Script Execution**: Run ExtendScript from within native code

---

## AEGP Plugin Types

### Standard AEGPs

Standard AEGPs are general-purpose plugins that extend After Effects functionality through menu commands, automation, and project manipulation.

### Specialized AEGP Types

The documentation identifies three specialized categories that remain AEGPs structurally but have access to specialized messaging streams:

1. **Keyframers** - Handle keyframe-specific operations and animation data manipulation
2. **Artisans** - Specialized 3D rendering plugins that provide rendered output of 3D layers
3. **I/O Modules (AEIOs)** - Import/export functionality for custom file formats

---

## Plugin Lifecycle and Initialization

### Entry Point Function

The primary initialization occurs through a single entry point exported in PiPL Resources. This function is called once during application launch:

```c
A_Err AEGP_PluginInitFuncPrototype(
    struct SPBasicSuite *pica_basicP,      // PICA basic suite for acquiring other suites
    A_long major_versionL,                  // Major API version
    A_long minor_versionL,                  // Minor API version
    AEGP_PluginID aegp_plugin_id,          // Unique plugin identifier
    AEGP_GlobalRefcon *global_refconP      // Pointer for storing global data
);
```

**Key characteristics:**
- Called exactly once during application launch
- Unlike effect plugins, all subsequent communication flows through registered callback functions
- Should defer acquiring non-essential suites until appropriate hook functions execute
- API version parameters enable version-specific behavior handling
- Store the `aegp_plugin_id` in `global_refconP` for later use

### PiPL Resources

Plug-ins, written in C or C++, are bundle packages on macOS and DLLs on Windows. They must contain a Plug-in Property List (PiPL) resource on both platforms. The plug-ins must be located in one of a few specific folders to be loaded by After Effects.

The PiPL contains:
- Plugin type identifier (AEGP)
- Entry point function name
- Version information
- Plugin capabilities and requirements

### Initialization Best Practices

```c
A_Err EntryPointFunc(
    struct SPBasicSuite *pica_basicP,
    A_long major_versionL,
    A_long minor_versionL,
    AEGP_PluginID aegp_plugin_id,
    AEGP_GlobalRefcon *global_refconP)
{
    A_Err err = A_Err_NONE;

    // Store plugin ID in global refcon for later use
    *global_refconP = reinterpret_cast<AEGP_GlobalRefcon>(aegp_plugin_id);

    // Acquire suite handler
    AEGP_SuiteHandler suites(pica_basicP);

    // Check API version before using newer features
    if (major_versionL >= 13) {
        // Use newer suite functions
    }

    // Register hooks (see Hook Registration section)
    ERR(RegisterHooks(suites, aegp_plugin_id));

    return err;
}
```

---

## Hook Registration

AEGPs utilize PICA function suites to interact with After Effects. Hook functions are registered during the entry point and called by After Effects in response to various events.

### AEGP_RegisterSuite5

The Register Suite is used to register callback hooks with After Effects. This must be used from within the AEGP's entry point.

| Function | Purpose |
|----------|---------|
| `AEGP_RegisterCommandHook` | Register handler for menu commands |
| `AEGP_RegisterUpdateMenuHook` | Register handler for menu state updates |
| `AEGP_RegisterIdleHook` | Register handler for idle-time processing |
| `AEGP_RegisterDeathHook` | Register handler for application shutdown |
| `AEGP_RegisterArtisan` | Register a custom 3D renderer (Artisan) |
| `AEGP_RegisterIO` | Register an import/output module (AEIO) |
| `AEGP_RegisterInteractiveArtisan` | Register interactive Artisan functions |

### Command Hook

Plug-ins which process menu commands register a single CommandHook for all commands:

```c
A_Err CommandHook(
    AEGP_GlobalRefcon plugin_refconP,
    AEGP_CommandRefcon refconP,
    AEGP_Command command,
    AEGP_HookPriority hook_priority,
    A_Boolean already_handledB,
    A_Boolean *handledPB)
{
    A_Err err = A_Err_NONE;

    if (command == my_command_id) {
        // Handle the command
        *handledPB = TRUE;
    }

    return err;
}

// Registration in entry point:
ERR(suites.RegisterSuite5()->AEGP_RegisterCommandHook(
    aegp_plugin_id,
    AEGP_HP_BeforeAE,
    CommandHook,
    NULL));
```

### Update Menu Hook

An AEGP that adds menu items must register an UpdateMenuHook. **Your menu items will be permanently disabled unless you register a menu updating function.**

```c
A_Err UpdateMenuHook(
    AEGP_GlobalRefcon plugin_refconP,
    AEGP_UpdateMenuRefcon refconP,
    AEGP_WindowType active_window)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(sP);

    // Enable or disable menu items based on application state
    if (ProjectIsOpen()) {
        ERR(suites.CommandSuite1()->AEGP_EnableCommand(my_command_id));
    } else {
        ERR(suites.CommandSuite1()->AEGP_DisableCommand(my_command_id));
    }

    return err;
}

// Registration:
ERR(suites.RegisterSuite5()->AEGP_RegisterUpdateMenuHook(
    aegp_plugin_id,
    UpdateMenuHook,
    NULL));
```

### Idle Hook

The idle hook is called during After Effects' idle time, allowing background processing:

```c
A_Err IdleHook(
    AEGP_GlobalRefcon plugin_refconP,
    AEGP_IdleRefcon refconP,
    A_long *max_sleepPL)
{
    A_Err err = A_Err_NONE;

    // Perform background processing
    // Set max_sleepPL to control how soon to be called again
    *max_sleepPL = 1000; // milliseconds

    return err;
}

// Registration:
ERR(suites.RegisterSuite5()->AEGP_RegisterIdleHook(
    aegp_plugin_id,
    IdleHook,
    NULL));
```

### Death Hook

The death hook is called when After Effects is shutting down:

```c
A_Err DeathHook(
    AEGP_GlobalRefcon plugin_refconP,
    AEGP_DeathRefcon refconP)
{
    A_Err err = A_Err_NONE;

    // Clean up resources
    // Free allocated memory
    // Close file handles

    return err;
}

// Registration:
ERR(suites.RegisterSuite5()->AEGP_RegisterDeathHook(
    aegp_plugin_id,
    DeathHook,
    NULL));
```

---

## Complete AEGP Suites Reference

AEGPs interact with After Effects exclusively through PICA function suites. The following suites are used by all types of AEGPs and may be called from within any hook function.

### Memory Suite - AEGP_MemorySuite1

Allocates 16-byte aligned memory with error reporting via handles that require locking before access.

| Function | Description |
|----------|-------------|
| `AEGP_NewMemHandle` | Allocate new memory block |
| `AEGP_FreeMemHandle` | Free allocated memory |
| `AEGP_LockMemHandle` | Lock handle to get pointer |
| `AEGP_UnlockMemHandle` | Unlock handle when done |
| `AEGP_GetMemHandleSize` | Get size of allocation |
| `AEGP_ResizeMemHandle` | Resize existing allocation |
| `AEGP_SetMemReportingOn` | Enable memory error reporting |

**Usage Example:**
```c
AEGP_MemHandle memH = NULL;
void *dataP = NULL;

ERR(suites.MemorySuite1()->AEGP_NewMemHandle(
    aegp_plugin_id,
    "My Data",
    sizeof(MyStruct),
    AEGP_MemFlag_CLEAR,
    &memH));

ERR(suites.MemorySuite1()->AEGP_LockMemHandle(memH, &dataP));

// Use dataP...

ERR(suites.MemorySuite1()->AEGP_UnlockMemHandle(memH));
ERR(suites.MemorySuite1()->AEGP_FreeMemHandle(memH));
```

**Important:** Always use After Effects memory functions. Using C++ `new` is not recommended as After Effects then cannot track the plugin's memory consumption or send proper low-memory messages.

### Command Suite - AEGP_CommandSuite1

Manages menu items, enabling/disabling commands, and checkmarks.

| Function | Description |
|----------|-------------|
| `AEGP_GetUniqueCommand` | Obtain unique command ID |
| `AEGP_InsertMenuCommand` | Add menu item |
| `AEGP_RemoveMenuCommand` | Remove menu item |
| `AEGP_SetMenuCommandName` | Set menu item text |
| `AEGP_EnableCommand` | Enable menu item |
| `AEGP_DisableCommand` | Disable (dim) menu item |
| `AEGP_CheckMarkMenuCommand` | Set/clear checkmark |
| `AEGP_DoCommand` | Trigger a command programmatically |

**Menu Integration Example:**
```c
AEGP_Command my_command;

// Get unique command ID
ERR(suites.CommandSuite1()->AEGP_GetUniqueCommand(&my_command));

// Insert into File menu
ERR(suites.CommandSuite1()->AEGP_InsertMenuCommand(
    my_command,
    "My Plugin Action",
    AEGP_Menu_FILE,
    AEGP_MENU_INSERT_SORTED));
```

### Project Suite - AEGP_ProjSuite6

Reads and modifies project data including save/load, time display settings, and bit depth.

| Function | Description |
|----------|-------------|
| `AEGP_GetProjectByIndex` | Get project handle by index |
| `AEGP_GetProjectName` | Get project filename |
| `AEGP_GetProjectPath` | Get full project path |
| `AEGP_GetProjectRootFolder` | Get root folder item |
| `AEGP_SaveProjectToPath` | Save project to file |
| `AEGP_OpenProjectFromPath` | Open project file |
| `AEGP_GetProjectBitDepth` | Get project color depth |
| `AEGP_SetProjectBitDepth` | Set project color depth |
| `AEGP_GetProjectTimeDisplay` | Get time display mode |
| `AEGP_SetProjectTimeDisplay` | Set time display mode |

**Caution:** Functions for opening and creating projects do not save changes to the currently open project when called.

### Item Suite - AEGP_ItemSuite9

Manages items within a project or composition including folders, comps, solids, and footage.

| Function | Description |
|----------|-------------|
| `AEGP_GetFirstProjItem` | Get first item in project |
| `AEGP_GetNextProjItem` | Iterate to next item |
| `AEGP_GetItemByGUID` | Get item by unique ID |
| `AEGP_GetActiveItem` | Get currently selected item |
| `AEGP_IsItemSelected` | Check if item is selected |
| `AEGP_SelectItem` | Select/deselect item |
| `AEGP_GetItemType` | Get item type (folder/comp/footage) |
| `AEGP_GetTypeName` | Get type as string |
| `AEGP_GetItemName` | Get item name |
| `AEGP_SetItemName` | Rename item |
| `AEGP_GetItemID` | Get unique item ID |
| `AEGP_GetItemFlags` | Get item flags |
| `AEGP_SetItemUseProxy` | Enable/disable proxy |
| `AEGP_GetItemParentFolder` | Get parent folder |
| `AEGP_SetItemParentFolder` | Move to folder |
| `AEGP_GetItemDuration` | Get item duration |
| `AEGP_GetItemDimensions` | Get width/height |
| `AEGP_GetItemPixelAspectRatio` | Get pixel aspect |
| `AEGP_DeleteItem` | Delete item from project |

### Composition Suite - AEGP_CompSuite11

Creates and modifies compositions, cameras, lights, solids, and text layers.

| Function | Description |
|----------|-------------|
| `AEGP_GetCompFromItem` | Get comp handle from item |
| `AEGP_GetItemFromComp` | Get item handle from comp |
| `AEGP_GetCompDownsampleFactor` | Get downsample factor |
| `AEGP_SetCompDownsampleFactor` | Set downsample factor |
| `AEGP_GetCompBGColor` | Get background color |
| `AEGP_SetCompBGColor` | Set background color |
| `AEGP_GetCompFlags` | Get composition flags |
| `AEGP_GetCompFramerate` | Get frame rate |
| `AEGP_SetCompFrameRate` | Set frame rate |
| `AEGP_GetCompShutterAnglePhase` | Get motion blur settings |
| `AEGP_SetCompShutterAnglePhase` | Set motion blur settings |
| `AEGP_GetCompShutterFrameRange` | Get shutter frame range |
| `AEGP_GetCompWorkAreaStart` | Get work area start |
| `AEGP_GetCompWorkAreaDuration` | Get work area duration |
| `AEGP_SetCompWorkAreaStartAndDuration` | Set work area |
| `AEGP_CreateSolidInComp` | Create solid layer |
| `AEGP_CreateCameraInComp` | Create camera layer |
| `AEGP_CreateLightInComp` | Create light layer |
| `AEGP_CreateTextLayerInComp` | Create text layer |
| `AEGP_CreateNullInComp` | Create null object |
| `AEGP_GetNewCompMarkerStream` | Get marker stream |
| `AEGP_SetSelection` | Set layer selection |
| `AEGP_ReorderCompSelection` | Reorder selected layers |

**New in Version 11:** `AEGP_ReorderCompSelection()` moves a selection to a certain layer index. It should be used along with `AEGP_SetSelection()`.

### Layer Suite - AEGP_LayerSuite9

Provides information about layers within a composition. As most After Effects usage boils down to layer manipulation, this is among the largest function suites in the API.

| Function | Description |
|----------|-------------|
| `AEGP_GetCompNumLayers` | Get layer count |
| `AEGP_GetCompLayerByIndex` | Get layer by index |
| `AEGP_GetActiveLayer` | Get active layer (if one selected) |
| `AEGP_GetLayerIndex` | Get layer's index |
| `AEGP_GetLayerSourceItem` | Get source item |
| `AEGP_GetLayerSourceItemID` | Get source item ID |
| `AEGP_GetLayerParentComp` | Get parent composition |
| `AEGP_GetLayerName` | Get layer name |
| `AEGP_SetLayerName` | Rename layer |
| `AEGP_GetLayerQuality` | Get layer quality |
| `AEGP_SetLayerQuality` | Set layer quality |
| `AEGP_GetLayerFlags` | Get layer flags |
| `AEGP_SetLayerFlag` | Set layer flag |
| `AEGP_IsLayerVideoReallyOn` | Check video visibility |
| `AEGP_IsLayerAudioReallyOn` | Check audio visibility |
| `AEGP_GetLayerCurrentTime` | Get current time |
| `AEGP_GetLayerInPoint` | Get in point |
| `AEGP_GetLayerDuration` | Get duration |
| `AEGP_SetLayerInPointAndDuration` | Set timing |
| `AEGP_GetLayerOffset` | Get start offset |
| `AEGP_SetLayerOffset` | Set start offset |
| `AEGP_GetLayerStretch` | Get time stretch |
| `AEGP_SetLayerStretch` | Set time stretch |
| `AEGP_GetLayerTransferMode` | Get blending mode |
| `AEGP_SetLayerTransferMode` | Set blending mode |
| `AEGP_IsAddLayerValid` | Check if can add layer |
| `AEGP_AddLayer` | Add layer to composition |
| `AEGP_ReorderLayer` | Change layer order |
| `AEGP_GetLayerMaskedBounds` | Get masked bounds |
| `AEGP_GetLayerObjectType` | Get layer type |
| `AEGP_IsLayer3D` | Check if 3D layer |
| `AEGP_IsLayer2D` | Check if 2D layer |
| `AEGP_IsVideoActive` | Check video active at time |
| `AEGP_IsLayerUsedAsTrackMatte` | Check track matte usage |
| `AEGP_GetLayerToWorldXform` | Get layer to world transform |
| `AEGP_GetLayerToWorldXformFromView` | Get transform from camera view |
| `AEGP_DeleteLayer` | Delete layer |
| `AEGP_DuplicateLayer` | Duplicate layer |
| `AEGP_GetLayerFromLayerID` | Get layer from ID |
| `AEGP_ConvertCompToLayerTime` | Convert comp time to layer time |
| `AEGP_ConvertLayerToCompTime` | Convert layer time to comp time |
| `AEGP_GetLayerID` | Get unique layer ID |

### Stream Suite - AEGP_StreamSuite5

Access and manipulate the values of a layer's streams (properties). For paint and text streams, use Dynamic Streams instead.

| Function | Description |
|----------|-------------|
| `AEGP_GetNewLayerStream` | Get stream from layer |
| `AEGP_GetNewMaskStream` | Get stream from mask |
| `AEGP_GetNewEffectStreamByIndex` | Get effect parameter stream |
| `AEGP_GetNewStreamRefForMask` | Get mask stream reference |
| `AEGP_GetStreamName` | Get stream name |
| `AEGP_GetStreamUnitsText` | Get units text |
| `AEGP_GetStreamType` | Get stream data type |
| `AEGP_GetNewStreamValue` | Sample stream value at time |
| `AEGP_SetStreamValue` | Set stream value |
| `AEGP_GetStreamValueDimensionality` | Get number of dimensions |
| `AEGP_GetStreamGroupingType` | Get grouping type |
| `AEGP_GetNumStreamGroupChildren` | Get child count |
| `AEGP_GetStreamGroupChild` | Get child by index |
| `AEGP_GetNumParamStreams` | Get parameter count |
| `AEGP_GetParamStreamIndex` | Get stream index |
| `AEGP_DisposeStreamValue` | Free stream value |
| `AEGP_GetExpression` | Get expression text (Unicode) |
| `AEGP_SetExpression` | Set expression text (Unicode) |
| `AEGP_GetExpressionState` | Check expression enabled |
| `AEGP_SetExpressionState` | Enable/disable expression |

**Stream Value Types:**
Stream values are represented as a union including:
- `AEGP_FourDVal` - Four-dimensional value
- `AEGP_ThreeDVal` - Three-dimensional value (Position, Scale, etc.)
- `AEGP_TwoDVal` - Two-dimensional value
- `AEGP_OneDVal` - One-dimensional value (Opacity, Rotation, etc.)
- `AEGP_ColorVal` - Color value (RGBA)
- `AEGP_ArbBlockVal` - Arbitrary block data
- `AEGP_MarkerValP` - Marker value pointer

### Dynamic Stream Suite - AEGP_DynamicStreamSuite4

Manages paint and text streams with hierarchical navigation.

| Function | Description |
|----------|-------------|
| `AEGP_GetNewStreamRefForLayer` | Get dynamic stream for layer |
| `AEGP_GetStreamName` | Get stream name |
| `AEGP_GetNumStreamsInGroup` | Get children count |
| `AEGP_GetNewStreamRefByIndex` | Get child by index |
| `AEGP_GetNewStreamRefByMatchname` | Get child by match name |
| `AEGP_DeleteStream` | Delete dynamic stream |
| `AEGP_ReorderStream` | Reorder stream |
| `AEGP_DuplicateStream` | Duplicate stream |
| `AEGP_GetDynamicStreamFlags` | Get stream flags |
| `AEGP_SetDynamicStreamFlag` | Set stream flag |

### Keyframe Suite - AEGP_KeyframeSuite4

Add, remove, and modify keyframes with interpolation and easing control.

| Function | Description |
|----------|-------------|
| `AEGP_GetStreamNumKFs` | Get keyframe count |
| `AEGP_GetKeyframeTime` | Get keyframe time |
| `AEGP_InsertKeyframe` | Insert new keyframe |
| `AEGP_DeleteKeyframe` | Delete keyframe |
| `AEGP_GetKeyframeLegalDimensions` | Get valid dimensions |
| `AEGP_GetKeyframeIndependence` | Get spatial independence |
| `AEGP_SetKeyframeIndependence` | Set spatial independence |
| `AEGP_GetKeyframeInterpolation` | Get interpolation type |
| `AEGP_SetKeyframeInterpolation` | Set interpolation type |
| `AEGP_GetKeyframeTemporalEase` | Get temporal ease |
| `AEGP_SetKeyframeTemporalEase` | Set temporal ease |
| `AEGP_GetNewKeyframeSpatialTangents` | Get spatial tangents |
| `AEGP_SetKeyframeSpatialTangents` | Set spatial tangents |
| `AEGP_GetKeyframeValue` | Get keyframe value |
| `AEGP_SetKeyframeValue` | Set keyframe value |
| `AEGP_StartAddKeyframes` | Begin keyframe batch add |
| `AEGP_AddKeyframes` | Add keyframe to batch |
| `AEGP_SetAddKeyframe` | Set batch keyframe value |
| `AEGP_EndAddKeyframes` | End keyframe batch |

**Keyframe Batch Adding Example:**
```c
AEGP_AddKeyframesInfoH addH = NULL;
A_long kf_indexL = 0;

ERR(suites.KeyframeSuite4()->AEGP_StartAddKeyframes(
    stream_refH, &addH));

ERR(suites.KeyframeSuite4()->AEGP_AddKeyframes(
    addH, AEGP_LTimeMode_CompTime, &timeT, &kf_indexL));

ERR(suites.KeyframeSuite4()->AEGP_SetAddKeyframe(
    addH, kf_indexL, &value));

ERR(suites.KeyframeSuite4()->AEGP_EndAddKeyframes(
    TRUE, addH)); // TRUE to add, FALSE to cancel
```

**Interpolation Types:**
- `AEGP_KeyInterp_NONE` - No interpolation (hold)
- `AEGP_KeyInterp_LINEAR` - Linear interpolation
- `AEGP_KeyInterp_BEZIER` - Bezier interpolation

### Footage Suite - AEGP_FootageSuite5

Manages footage interpretation, solids, proxies, and file sequences.

| Function | Description |
|----------|-------------|
| `AEGP_GetMainFootageFromItem` | Get main footage |
| `AEGP_GetProxyFootageFromItem` | Get proxy footage |
| `AEGP_GetFootageNumFiles` | Get file count |
| `AEGP_GetFootagePath` | Get file path |
| `AEGP_GetFootageSignature` | Get format signature |
| `AEGP_NewFootage` | Create new footage |
| `AEGP_AddFootageToProject` | Add to project |
| `AEGP_SetItemProxyFootage` | Set as proxy |
| `AEGP_ReplaceItemMainFootage` | Replace main footage |
| `AEGP_DisposeFootage` | Dispose footage handle |
| `AEGP_GetFootageInterpretation` | Get interpretation |
| `AEGP_SetFootageInterpretation` | Set interpretation |
| `AEGP_GetFootageLayerKey` | Get layer key |
| `AEGP_NewPlaceholderFootage` | Create placeholder |
| `AEGP_NewPlaceholderFootageWithPath` | Create placeholder with path |
| `AEGP_NewSolidFootage` | Create solid |

### Effect Suite - AEGP_EffectSuite4

Apply, remove, and manipulate effects on layers.

| Function | Description |
|----------|-------------|
| `AEGP_GetLayerNumEffects` | Get effect count on layer |
| `AEGP_GetLayerEffectByIndex` | Get effect by index |
| `AEGP_GetInstalledKeyFromLayerEffect` | Get effect key |
| `AEGP_ApplyEffect` | Apply effect to layer |
| `AEGP_DeleteLayerEffect` | Remove effect |
| `AEGP_GetEffectName` | Get effect name |
| `AEGP_GetEffectMatchName` | Get effect match name |
| `AEGP_GetEffectCategory` | Get effect category |
| `AEGP_DuplicateEffect` | Duplicate effect |
| `AEGP_GetNumInstalledEffects` | Get installed effect count |
| `AEGP_GetNextInstalledEffect` | Iterate installed effects |
| `AEGP_GetEffectNumParamStreams` | Get parameter count |
| `AEGP_EnableEffect` | Enable/disable effect |
| `AEGP_GetEffectIsEnabled` | Check if enabled |
| `AEGP_SendEffectMessage` | Send message to effect |
| `AEGP_GetEffectFlags` | Get effect flags |
| `AEGP_SetEffectFlags` | Set effect flags |
| `AEGP_ReorderEffect` | Reorder effect on layer |

### Mask Suite - AEGP_MaskSuite6

Create, delete, and manage masks with modes, colors, and motion blur.

| Function | Description |
|----------|-------------|
| `AEGP_GetLayerNumMasks` | Get mask count |
| `AEGP_GetLayerMaskByIndex` | Get mask by index |
| `AEGP_CreateNewMask` | Create new mask |
| `AEGP_DeleteMaskFromLayer` | Delete mask |
| `AEGP_GetMaskName` | Get mask name |
| `AEGP_SetMaskName` | Set mask name |
| `AEGP_GetMaskMode` | Get mask mode |
| `AEGP_SetMaskMode` | Set mask mode |
| `AEGP_GetMaskInvert` | Check if inverted |
| `AEGP_SetMaskInvert` | Set inversion |
| `AEGP_GetMaskColor` | Get mask color |
| `AEGP_SetMaskColor` | Set mask color |
| `AEGP_GetMaskLockState` | Check if locked |
| `AEGP_SetMaskLockState` | Lock/unlock mask |
| `AEGP_GetMaskIsRotoBezier` | Check if RotoBezier |
| `AEGP_SetMaskIsRotoBezier` | Set RotoBezier mode |
| `AEGP_DuplicateMask` | Duplicate mask |

### Mask Outline Suite - AEGP_MaskOutlineSuite3

Detailed information about the path rendered to make a layer's mask.

| Function | Description |
|----------|-------------|
| `AEGP_IsMaskOutlineOpen` | Check if path is open |
| `AEGP_SetMaskOutlineOpen` | Open/close path |
| `AEGP_GetMaskOutlineNumSegments` | Get segment count |
| `AEGP_GetMaskOutlineVertexInfo` | Get vertex data |
| `AEGP_SetMaskOutlineVertexInfo` | Set vertex data |
| `AEGP_CreateVertex` | Add vertex |
| `AEGP_DeleteVertex` | Remove vertex |
| `AEGP_GetMaskOutlineNumFeathers` | Get feather count |
| `AEGP_GetMaskOutlineFeatherInfo` | Get feather data |
| `AEGP_SetMaskOutlineFeatherInfo` | Set feather data |
| `AEGP_CreateMaskOutlineFeather` | Add feather |
| `AEGP_DeleteMaskOutlineFeather` | Remove feather |

### Collection Suite - AEGP_CollectionSuite2

Handles selection sets and queries which items are currently selected.

| Function | Description |
|----------|-------------|
| `AEGP_NewCollection` | Create new collection |
| `AEGP_DisposeCollection` | Dispose collection |
| `AEGP_GetCollectionNumItems` | Get item count |
| `AEGP_GetCollectionItemByIndex` | Get item by index |
| `AEGP_CollectionPushBack` | Add item to end |
| `AEGP_CollectionErase` | Remove item |
| `AEGP_GetCompSelection` | Get current selection |
| `AEGP_SetSelection` | Set selection |

### Render Options Suite - AEGP_RenderOptionsSuite4

Configure render settings including time, quality, downsampling, and ROI.

| Function | Description |
|----------|-------------|
| `AEGP_NewFromItem` | Create options from item |
| `AEGP_Duplicate` | Duplicate options |
| `AEGP_Dispose` | Dispose options |
| `AEGP_SetTime` | Set render time |
| `AEGP_GetTime` | Get render time |
| `AEGP_SetTimeStep` | Set time step |
| `AEGP_GetTimeStep` | Get time step |
| `AEGP_SetFieldRender` | Set field render mode |
| `AEGP_GetFieldRender` | Get field render mode |
| `AEGP_SetWorldType` | Set world type (8/16/32-bit) |
| `AEGP_GetWorldType` | Get world type |
| `AEGP_SetDownsampleFactor` | Set downsample |
| `AEGP_GetDownsampleFactor` | Get downsample |
| `AEGP_SetRegionOfInterest` | Set ROI |
| `AEGP_GetRegionOfInterest` | Get ROI |
| `AEGP_SetMatteMode` | Set matte mode |
| `AEGP_GetMatteMode` | Get matte mode |
| `AEGP_SetChannelOrder` | Set channel order |
| `AEGP_GetChannelOrder` | Get channel order |
| `AEGP_SetMotionBlur` | Enable motion blur |
| `AEGP_GetMotionBlur` | Get motion blur state |

### Render Suite - AEGP_RenderSuite4

Get rendered frames and audio samples from within an AEGP.

| Function | Description |
|----------|-------------|
| `AEGP_RenderAndCheckoutFrame` | Render and get frame |
| `AEGP_RenderAndCheckoutLayerFrame` | Render single layer |
| `AEGP_CheckinFrame` | Return rendered frame |
| `AEGP_GetReceiptWorld` | Get pixel data from receipt |
| `AEGP_GetRenderedRegion` | Get rendered region |
| `AEGP_RenderNewItemSoundData` | Render audio data |
| `AEGP_IsItemWorthwhileToRender` | Check if render needed |
| `AEGP_CancelAllItemRenders` | Cancel pending renders |
| `AEGP_GetNumGPUDevices` | Get GPU count |
| `AEGP_GetGPUDeviceInfo` | Get GPU info |

**Render Example:**
```c
AEGP_RenderOptionsH optionsH = NULL;
AEGP_FrameReceiptH receiptH = NULL;
AEGP_WorldH worldH = NULL;

// Create render options
ERR(suites.RenderOptionsSuite4()->AEGP_NewFromItem(
    aegp_plugin_id, itemH, &optionsH));

// Set render time
ERR(suites.RenderOptionsSuite4()->AEGP_SetTime(optionsH, timeT));

// Render frame
ERR(suites.RenderSuite4()->AEGP_RenderAndCheckoutFrame(
    optionsH, NULL, NULL, &receiptH));

// Get pixel data
ERR(suites.RenderSuite4()->AEGP_GetReceiptWorld(receiptH, &worldH));

// Use pixels...

// Return frame
ERR(suites.RenderSuite4()->AEGP_CheckinFrame(receiptH));
ERR(suites.RenderOptionsSuite4()->AEGP_Dispose(optionsH));
```

### World Suite - AEGP_WorldSuite3

Allocate and manipulate pixel buffers in 8/16/32-bit formats.

| Function | Description |
|----------|-------------|
| `AEGP_New` | Create new world |
| `AEGP_Dispose` | Dispose world |
| `AEGP_GetType` | Get world type |
| `AEGP_GetSize` | Get dimensions |
| `AEGP_GetRowBytes` | Get row stride |
| `AEGP_GetBaseAddr8` | Get 8-bit base address |
| `AEGP_GetBaseAddr16` | Get 16-bit base address |
| `AEGP_GetBaseAddr32` | Get 32-bit base address |
| `AEGP_FillOutPFEffectWorld` | Fill PF_EffectWorld struct |

**Bit Depth Handling:**
- 8-bit: `PF_Pixel8` structure (0-255 range per channel)
- 16-bit: `PF_Pixel16` structure (0-32768 range per channel)
- 32-bit: `PF_PixelFloat` structure (floating point, typically 0.0-1.0)

### Composite Suite - AEGP_CompositeSuite2

Apply transfer modes, track mattes, and pixel copying.

| Function | Description |
|----------|-------------|
| `AEGP_CopyPixelBetweenWorlds` | Copy pixel between worlds |
| `AEGP_GetSmallDestRect` | Get destination rectangle |
| `AEGP_TransferRect` | Transfer with transfer mode |
| `AEGP_ConvertARGBToHSL` | Convert ARGB to HSL |
| `AEGP_ConvertHSLToARGB` | Convert HSL to ARGB |

### Utility Suite - AEGP_UtilitySuite6

Error reporting, undo management, scripting, and preferences access.

| Function | Description |
|----------|-------------|
| `AEGP_ReportInfo` | Report info to user |
| `AEGP_ReportInfoUnicode` | Report Unicode info |
| `AEGP_GetDriverPluginInitFuncVersion` | Get init func version |
| `AEGP_GetDriverImplementationVersion` | Get implementation version |
| `AEGP_StartUndoGroup` | Begin undo group |
| `AEGP_EndUndoGroup` | End undo group |
| `AEGP_ExecuteScript` | Run ExtendScript |
| `AEGP_GetMainHWND` | Get main window handle |
| `AEGP_ShowHideAllFloaters` | Show/hide floating windows |
| `AEGP_PaintPalGetForeColor` | Get paint foreground color |
| `AEGP_PaintPalGetBackColor` | Get paint background color |
| `AEGP_PaintPalSetForeColor` | Set paint foreground color |
| `AEGP_PaintPalSetBackColor` | Set paint background color |
| `AEGP_CharPalGetFillColor` | Get character fill color |
| `AEGP_CharPalGetStrokeColor` | Get character stroke color |
| `AEGP_CharPalSetFillColor` | Set character fill color |
| `AEGP_CharPalSetStrokeColor` | Set character stroke color |
| `AEGP_CharPalIsFillColorUIFront` | Check fill color front |
| `AEGP_GetProjectName` | Get project name |
| `AEGP_GetSuppressInteractiveUI` | Check UI suppression |
| `AEGP_WriteToOSConsole` | Write to OS console |
| `AEGP_WriteToDebugLog` | Write to debug log |
| `AEGP_GetPluginPaths` | Get plugin paths |

**Undo Example:**
```c
ERR(suites.UtilitySuite6()->AEGP_StartUndoGroup("My Action"));

// Make changes...

ERR(suites.UtilitySuite6()->AEGP_EndUndoGroup());
```

**Important:** Undo calls must be made on the UI thread, not the render thread.

### Persistent Data Suite - AEGP_PersistentDataSuite4

Store plugin data in preferences with section/value keys.

| Function | Description |
|----------|-------------|
| `AEGP_GetApplicationBlob` | Get app-wide data |
| `AEGP_GetNumSections` | Get section count |
| `AEGP_GetSectionKeyByIndex` | Get section key |
| `AEGP_DoesKeyExist` | Check if key exists |
| `AEGP_GetDataLength` | Get data length |
| `AEGP_GetData` | Get data value |
| `AEGP_SetData` | Set data value |
| `AEGP_DeleteEntry` | Delete entry |

### Text Document Suite - AEGP_TextDocumentSuite1

Get and set UTF-16 text on text layers.

| Function | Description |
|----------|-------------|
| `AEGP_GetNewText` | Get text content |
| `AEGP_SetText` | Set text content |

### Text Layer Suite - AEGP_TextLayerSuite1

Access text outline paths for manipulation.

| Function | Description |
|----------|-------------|
| `AEGP_GetNewTextOutlines` | Get text outlines |
| `AEGP_DisposeTextOutlines` | Dispose outlines |
| `AEGP_GetNumTextOutlines` | Get outline count |
| `AEGP_GetIndexedTextOutline` | Get outline by index |

### Marker Suite - AEGP_MarkerSuite2

Create and modify markers with cue point parameters.

| Function | Description |
|----------|-------------|
| `AEGP_NewMarker` | Create new marker |
| `AEGP_DisposeMarker` | Dispose marker |
| `AEGP_DuplicateMarker` | Duplicate marker |
| `AEGP_GetMarkerString` | Get marker string |
| `AEGP_SetMarkerString` | Set marker string |
| `AEGP_CountCuePointParams` | Get parameter count |
| `AEGP_GetIndCuePointParam` | Get parameter by index |
| `AEGP_SetIndCuePointParam` | Set parameter |
| `AEGP_InsertCuePointParam` | Insert parameter |
| `AEGP_DeleteIxdCuePointParam` | Delete parameter |
| `AEGP_SetMarkerDuration` | Set duration |
| `AEGP_GetMarkerDuration` | Get duration |

### Render Queue Suite - AEGP_RenderQueueSuite1

Add items and control playback state.

| Function | Description |
|----------|-------------|
| `AEGP_AddCompToRenderQueue` | Add comp to queue |
| `AEGP_GetNumRQItems` | Get queue item count |
| `AEGP_GetRQItemByIndex` | Get item by index |

### RQ Item Suite - AEGP_RQItemSuite4

Query and modify render queue items.

| Function | Description |
|----------|-------------|
| `AEGP_GetNumOutputModulesForRQItem` | Get output module count |
| `AEGP_GetCompFromRQItem` | Get comp from item |
| `AEGP_DeleteRQItem` | Delete queue item |
| `AEGP_GetRQItemStatus` | Get render status |
| `AEGP_SetRQItemStatus` | Set render status |
| `AEGP_GetRQItemRenderTime` | Get render time range |
| `AEGP_SetRQItemRenderTime` | Set render time range |
| `AEGP_GetOutputModuleByIndex` | Get output module |
| `AEGP_GetRQItemComment` | Get item comment |
| `AEGP_SetRQItemComment` | Set item comment |

### Output Module Suite - AEGP_OutputModuleSuite4

Configure output modules including format, channels, stretch, and crop.

| Function | Description |
|----------|-------------|
| `AEGP_GetOutputModuleByIndex` | Get module by index |
| `AEGP_GetEmbedOptions` | Get embed options |
| `AEGP_SetEmbedOptions` | Set embed options |
| `AEGP_GetPostRenderAction` | Get post-render action |
| `AEGP_SetPostRenderAction` | Set post-render action |
| `AEGP_GetEnabledOutputs` | Get enabled outputs |
| `AEGP_SetEnabledOutputs` | Set enabled outputs |
| `AEGP_GetOutputChannels` | Get channel options |
| `AEGP_SetOutputChannels` | Set channel options |
| `AEGP_GetStretch` | Get stretch settings |
| `AEGP_SetStretch` | Set stretch settings |
| `AEGP_GetCrop` | Get crop settings |
| `AEGP_SetCrop` | Set crop settings |
| `AEGP_GetSoundFormatInfo` | Get audio format |
| `AEGP_SetSoundFormatInfo` | Set audio format |
| `AEGP_GetOutputFilePath` | Get output path |
| `AEGP_SetOutputFilePath` | Set output path |

### Color Settings Suite - AEGP_ColorSettingsSuite5

Access color profiles, OCIO configuration, and color transforms.

| Function | Description |
|----------|-------------|
| `AEGP_GetBlendingTables` | Get blending tables |
| `AEGP_DoesItemHaveColorProfile` | Check for color profile |
| `AEGP_GetItemColorProfile` | Get item profile |
| `AEGP_SetItemColorProfile` | Set item profile |
| `AEGP_GetItemColorProfileApproxName` | Get profile name |
| `AEGP_IsRGBColorProfile` | Check if RGB profile |
| `AEGP_GetNewDisplayColorProfile` | Get display profile |
| `AEGP_GetNewWorkingSpaceColorProfile` | Get working space |
| `AEGP_OCIOGPUEnabled` | Check OCIO GPU enabled |

### Camera Suite - AEGP_CameraSuite2

Manage camera geometry, properties, film size, and lens settings.

| Function | Description |
|----------|-------------|
| `AEGP_GetCamera` | Get camera from layer |
| `AEGP_GetCameraType` | Get camera type |
| `AEGP_GetDefaultCameraDistanceToImagePlane` | Get default distance |
| `AEGP_GetCameraFilmSize` | Get film size |
| `AEGP_SetCameraFilmSize` | Set film size |

### Light Suite - AEGP_LightSuite2

Handle light types and lighting calculations.

| Function | Description |
|----------|-------------|
| `AEGP_GetLightType` | Get light type |
| `AEGP_SetLightType` | Set light type |

**Light Types:**
- `AEGP_LightType_PARALLEL` - Parallel/directional light
- `AEGP_LightType_SPOT` - Spot light
- `AEGP_LightType_POINT` - Point/omni light
- `AEGP_LightType_AMBIENT` - Ambient light

---

## Specialized AEGP Types

### Artisans (3D Renderers)

Artisans are specialized plugin 3D renderer AEGPs that provide rendered output of 3D layers. "An Artisan is nearly an application unto itself."

**Entry Points (via PR_ArtisanEntryPoints):**
- `render_func` (required) - Performs scene rendering
- `global_setup_func0` / `global_setdown_func0` - Lifecycle management
- `frame_setup_func0` / `frame_setdown_func0` - Per-frame preparation
- `query_func0` - Handles transform queries and interactive drawing

**Registration:**
```c
ERR(suites.RegisterSuite5()->AEGP_RegisterArtisan(
    aegp_plugin_id,
    my_io_refcon,
    &artisan_entry_funcs));
```

**Key Artisan Suites:**
- `AEGP_CanvasSuite8` - Layer access, composition rendering, texture acquisition
- `AEGP_CameraSuite2` - Camera geometry and properties
- `AEGP_LightSuite2` - Light types and calculations
- `AEGP_ArtisanUtilSuite1` - Context conversion
- `AEGP_QueryXFormSuite2` - Transform information

Artisans appear in the Rendering Plug-in drop-down in the Advanced tab of the Composition Settings dialog.

### AEIOs (Import/Output Modules)

AEIOs are AEGPs that perform media file import and/or export. They handle all file-type-specific functionality that After Effects would normally manage.

**Import Functions:**
- Open existing media files
- Manage file-specific interpretation settings
- Deliver audio data via AEGP_SoundWorld format
- Provide video frames as PF_EffectWorlds

**Export Functions:**
- Create output files interactively
- Manage render queue output options
- Accept and save frames provided by After Effects

**Technical Requirements:**
AEIOs work exclusively with uncompressed video featuring pixels in ARGB order from low to high-byte in 8-bit, 16-bit, or 32-bit float formats. AEIOs must handle their own compression/decompression of any codecs supported.

**Registration:**
```c
AEGP_IORefcon my_io_refcon;
AEGP_ModuleInfo module_info;
AEGP_FunctionBlock io_funcs;

// Populate module_info and io_funcs...

ERR(suites.RegisterSuite5()->AEGP_RegisterIO(
    aegp_plugin_id,
    my_io_refcon,
    &module_info,
    &io_funcs));
```

**Key Handles:**
- `AEIO_InSpecH` - Opaque handle for import operations
- `AEIO_OutSpecH` - Opaque handle for export operations

### Keyframers

Keyframers are specialized AEGPs that can add and remove items to projects and compositions, add and remove filters and keyframes, and access the keyframe database for detailed manipulation of animation data.

---

## Memory Management

### AEGP Memory Best Practices

1. **Always use After Effects memory functions** - Using C++ `new` is not recommended as After Effects cannot track the plugin's memory consumption.

2. **Lock before access** - `AEGP_MemHandle` contains more than just the referenced memory. Use `AEGP_LockMemHandle` to get a pointer.

3. **Balance lock/unlock calls** - Every lock must have a corresponding unlock.

4. **Dispose when done** - Many suite functions allocate memory that the caller must dispose.

5. **Don't cache references** - Information about layers, streams, and other items can become invalidated by user activity.

### Handle Lifecycle Example

```c
AEGP_MemHandle handle = NULL;
void *ptr = NULL;

// Allocate
ERR(suites.MemorySuite1()->AEGP_NewMemHandle(
    plugin_id,
    "Description",
    size,
    AEGP_MemFlag_CLEAR,  // or AEGP_MemFlag_NONE
    &handle));

// Lock and use
ERR(suites.MemorySuite1()->AEGP_LockMemHandle(handle, &ptr));
// ... use ptr ...
ERR(suites.MemorySuite1()->AEGP_UnlockMemHandle(handle));

// Free
ERR(suites.MemorySuite1()->AEGP_FreeMemHandle(handle));
```

### Data Types Requiring Disposal

The following data types require explicit cleanup:
- `AEGP_Collection2H`
- `AEGP_FootageH`
- `AEGP_WorldH`
- `AEGP_EffectRefH`
- `AEGP_MaskRefH`
- `AEGP_RenderOptionsH`
- `AEGP_FrameReceiptH`
- `AEGP_StreamRefH`

---

## Thread Safety Considerations

**CRITICAL: AEGP supports no threading at all.** Everything must be done from the main thread, either in response to a callback, or from the idle hook.

### Thread-Safe Functions

There is exactly ONE call that is thread-safe:
- `AEGP_CauseIdleRoutinesToBeCalled()` - Safe to call from any thread

However, even `SPBasicSuite` requires main-thread access for suite acquisition.

### Common Threading Mistakes

1. **Undo on render thread** - Making calls like `AEGP_StartUndoGroup()` on the render thread will result in an error. Move these calls to the UI thread.

2. **Project modification during render** - Adobe has tightened validation of AEGP calls used from the wrong thread or making changes to project state during render.

### Proper Threading Pattern

```c
// From worker thread, signal main thread
ERR(suites.UtilitySuite6()->AEGP_CauseIdleRoutinesToBeCalled());

// Then in IdleHook (on main thread):
A_Err IdleHook(AEGP_GlobalRefcon plugin_refconP,
               AEGP_IdleRefcon refconP,
               A_long *max_sleepPL)
{
    // Safe to make AEGP calls here
    ProcessQueuedWork();
    return A_Err_NONE;
}
```

---

## Data Storage Best Practices

### Using Refcons

All hook functions are passed refcon pointers for storage:
- **global_refconPV** - Store plugin-wide data like `aegp_plugin_id`
- **plugin_refconPV** - Hook-function-specific storage

This approach prevents issues with multiple After Effects instances.

### Persistent Data

To save project-specific data outside the project file, use the Persistent Data Suite:

```c
ERR(suites.PersistentDataSuite4()->AEGP_SetData(
    blob,
    "MyPlugin",        // Section
    "MySetting",       // Key
    dataSize,
    dataPtr));
```

### State Invalidation

**Important:** Anything that modifies the quantity (not quality) of items will invalidate references:
- Adding a keyframe to a stream invalidates references to that stream
- Adding compositions or modifying output modules invalidates render queue item references
- Forcing a layer to be rendered does NOT invalidate references to it

**Recommendation:** Do not cache layer pixels. Do not cache references between hook function calls. Acquire information when needed and release it as soon as possible.

---

## Error Handling

### Graceful Degradation

If a suite isn't present, make every attempt to fail gracefully:
1. Show the user a message indicating the nature of the problem
2. Attempt to acquire and use an earlier version of the same suite
3. Identify yourself to the user
4. Provide support and/or help information

### Error Reporting

```c
// Report information to user
ERR(suites.UtilitySuite6()->AEGP_ReportInfo(
    aegp_plugin_id,
    "MyPlugin: Operation completed successfully"));

// For Unicode text
ERR(suites.UtilitySuite6()->AEGP_ReportInfoUnicode(
    aegp_plugin_id,
    unicodeTextP));
```

### Common Error Patterns

```c
#define ERR(FUNC) do { \
    if (!err) { \
        err = (FUNC); \
        if (err) { \
            ReportError(err, #FUNC); \
        } \
    } \
} while(0)
```

---

## Complete Data Types Reference

| Type | Purpose | Management Suite |
|------|---------|------------------|
| `AEGP_MemHandle` | Memory block reference | AEGP_MemorySuite1 |
| `AEGP_ProjectH` | Current project | AEGP_ProjSuite6 |
| `AEGP_ItemH` | Any selectable project element | AEGP_ItemSuite9 |
| `AEGP_Collection2H` | Container for selected items | AEGP_CollectionSuite2 |
| `AEGP_CompH` | Composition | AEGP_CompSuite11 |
| `AEGP_FootageH` | Renderable project item | AEGP_FootageSuite5 |
| `AEGP_LayerH` | Composition layer | AEGP_LayerSuite9 |
| `AEGP_WorldH` | Pixel frame buffer | AEGP_WorldSuite3 |
| `AEGP_EffectRefH` | Applied effect instance | AEGP_EffectSuite4 |
| `AEGP_StreamRefH` | Parameter stream | AEGP_StreamSuite5 |
| `AEGP_MaskRefH` | Layer mask | AEGP_MaskSuite6 |
| `AEGP_MaskOutlineValH` | Mask path vertices | AEGP_MaskOutlineSuite3 |
| `AEGP_TextDocumentH` | Text layer content | AEGP_TextDocumentSuite1 |
| `AEGP_TextOutlinesH` | Text path outlines | AEGP_TextLayerSuite1 |
| `AEGP_MarkerVal` | Timeline marker | AEGP_MarkerSuite2 |
| `AEGP_RenderOptionsH` | Render settings | AEGP_RenderOptionsSuite4 |
| `AEGP_FrameReceiptH` | Rendered frame reference | AEGP_RenderSuite4 |
| `AEGP_AddKeyframesInfoH` | Keyframe batch info | AEGP_KeyframeSuite4 |

---

## Code Examples

### Complete Menu Plugin Example

```c
#include "AEConfig.h"
#include "AE_GeneralPlug.h"
#include "AEGP_SuiteHandler.h"

static AEGP_PluginID S_my_id = 0;
static AEGP_Command S_my_command = 0;
static SPBasicSuite *S_basic_suite = NULL;

static A_Err CommandHook(
    AEGP_GlobalRefcon plugin_refconP,
    AEGP_CommandRefcon refconP,
    AEGP_Command command,
    AEGP_HookPriority hook_priority,
    A_Boolean already_handledB,
    A_Boolean *handledPB)
{
    A_Err err = A_Err_NONE;

    if (command == S_my_command) {
        AEGP_SuiteHandler suites(S_basic_suite);

        // Start undo group
        ERR(suites.UtilitySuite6()->AEGP_StartUndoGroup("My Action"));

        // Perform operations
        AEGP_ItemH activeItemH = NULL;
        ERR(suites.ItemSuite9()->AEGP_GetActiveItem(&activeItemH));

        if (activeItemH) {
            AEGP_ItemType itemType;
            ERR(suites.ItemSuite9()->AEGP_GetItemType(activeItemH, &itemType));

            if (itemType == AEGP_ItemType_COMP) {
                // Process composition
            }
        }

        // End undo group
        ERR(suites.UtilitySuite6()->AEGP_EndUndoGroup());

        *handledPB = TRUE;
    }

    return err;
}

static A_Err UpdateMenuHook(
    AEGP_GlobalRefcon plugin_refconP,
    AEGP_UpdateMenuRefcon refconP,
    AEGP_WindowType active_window)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(S_basic_suite);

    // Always enable our command
    ERR(suites.CommandSuite1()->AEGP_EnableCommand(S_my_command));

    return err;
}

A_Err EntryPointFunc(
    struct SPBasicSuite *pica_basicP,
    A_long major_versionL,
    A_long minor_versionL,
    AEGP_PluginID aegp_plugin_id,
    AEGP_GlobalRefcon *global_refconP)
{
    A_Err err = A_Err_NONE;

    S_my_id = aegp_plugin_id;
    S_basic_suite = pica_basicP;

    AEGP_SuiteHandler suites(pica_basicP);

    // Get unique command ID
    ERR(suites.CommandSuite1()->AEGP_GetUniqueCommand(&S_my_command));

    // Add menu item
    ERR(suites.CommandSuite1()->AEGP_InsertMenuCommand(
        S_my_command,
        "My Plugin Action",
        AEGP_Menu_EDIT,
        AEGP_MENU_INSERT_SORTED));

    // Register hooks
    ERR(suites.RegisterSuite5()->AEGP_RegisterCommandHook(
        S_my_id, AEGP_HP_BeforeAE, CommandHook, NULL));

    ERR(suites.RegisterSuite5()->AEGP_RegisterUpdateMenuHook(
        S_my_id, UpdateMenuHook, NULL));

    return err;
}
```

### Iterating Project Items

```c
A_Err IterateProjectItems(AEGP_SuiteHandler &suites)
{
    A_Err err = A_Err_NONE;
    AEGP_ProjectH projH = NULL;
    AEGP_ItemH itemH = NULL;

    ERR(suites.ProjSuite6()->AEGP_GetProjectByIndex(0, &projH));
    ERR(suites.ItemSuite9()->AEGP_GetFirstProjItem(projH, &itemH));

    while (itemH && !err) {
        A_char name[AEGP_MAX_ITEM_NAME_SIZE];
        AEGP_ItemType type;

        ERR(suites.ItemSuite9()->AEGP_GetItemName(
            S_my_id, itemH, name));
        ERR(suites.ItemSuite9()->AEGP_GetItemType(itemH, &type));

        // Process item...

        ERR(suites.ItemSuite9()->AEGP_GetNextProjItem(projH, itemH, &itemH));
    }

    return err;
}
```

### Accessing Layer Properties

```c
A_Err GetLayerPosition(
    AEGP_SuiteHandler &suites,
    AEGP_LayerH layerH,
    A_Time *timeP,
    A_FloatPoint3 *posP)
{
    A_Err err = A_Err_NONE;
    AEGP_StreamRefH streamH = NULL;
    AEGP_StreamValue2 val;

    // Get position stream
    ERR(suites.StreamSuite5()->AEGP_GetNewLayerStream(
        S_my_id,
        layerH,
        AEGP_LayerStream_POSITION,
        &streamH));

    // Get value at time
    ERR(suites.StreamSuite5()->AEGP_GetNewStreamValue(
        S_my_id,
        streamH,
        AEGP_LTimeMode_CompTime,
        timeP,
        FALSE,  // pre-expression
        &val));

    // Extract position
    posP->x = val.three_d.x;
    posP->y = val.three_d.y;
    posP->z = val.three_d.z;

    // Clean up
    ERR(suites.StreamSuite5()->AEGP_DisposeStreamValue(&val));
    ERR(suites.StreamSuite5()->AEGP_DisposeStream(streamH));

    return err;
}
```

---

## Related Documentation

- [[01-sdk-overview]] - After Effects SDK Overview and Architecture
- [[02-effect-plugins]] - Effect Plugin Development Guide
- [[04-aeio-plugins]] - AEIO Import/Export Plugin Development
- [[05-artisan-plugins]] - Artisan 3D Renderer Development
- [[06-pipl-resources]] - PiPL Resource Format Reference
- [[07-memory-management]] - Memory Management Best Practices
- [[08-debugging-tips]] - Debugging After Effects Plugins

---

## Official Resources

- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/) - Primary documentation source
- [Adobe Developer Portal - After Effects](https://developer.adobe.com/after-effects/) - Official SDK download
- [AEGP Suites Reference](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/) - Complete suite documentation
- [AEGP Implementation Guide](https://ae-plugins.docsforadobe.dev/aegps/implementation/) - Implementation details
- [AEGP Data Types](https://ae-plugins.docsforadobe.dev/aegps/data-types/) - Data type reference

---

*Document Version: 1.0*
*Last Updated: 2025-12-27*
*Source: Official Adobe After Effects SDK Documentation*
