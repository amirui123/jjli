---
source: '[unknown - 09-render-queue-output.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 After Effects SDK: Render Queue and Output Module APIs

## Overview

The After Effects SDK provides comprehensive APIs for managing the render queue, output modules, and render settings through several interconnected AEGP suites. These APIs enable plugins to automate rendering workflows, configure output settings, monitor render progress, and integrate with both the After Effects UI and command-line rendering via aerender.

**Key Suites:**
- `AEGP_RenderQueueSuite1` - Top-level render queue state management
- `AEGP_RQItemSuite4` - Individual render queue item manipulation
- `AEGP_OutputModuleSuite4` - Output module configuration
- `AEGP_RenderOptionsSuite4` - Composition-level render parameters
- `AEGP_RenderQueueMonitorSuite1` - Render progress callbacks
- `AEGP_LayerRenderOptionsSuite1` - Layer-specific render configuration

---

## Core Data Types

### Handle Types

| Type | Description |
|------|-------------|
| `AEGP_RQItemRefH` | Reference to a render queue item. Defined as `typedef struct _AEGP_RenderQueueItem **AEGP_RQItemRefH;` |
| `AEGP_OutputModuleRefH` | Reference to an output module attached to an RQ item. Defined as `typedef struct _AEGP_OutputModule **AEGP_OutputModuleRefH;` |
| `AEGP_RenderOptionsH` | Handle to render options for a composition |
| `AEGP_LayerRenderOptionsH` | Handle to layer-specific render options |

### Render Queue States

```cpp
enum AEGP_RenderQueueState {
    AEGP_RenderQueueState_STOPPED,      // Queue is idle
    AEGP_RenderQueueState_PAUSED,       // Queue is paused mid-render
    AEGP_RenderQueueState_RENDERING     // Queue is actively rendering
};
```

**State Transition Rules:**
- Cannot transition directly from `STOPPED` to `PAUSED`
- Must go through `RENDERING` state to reach `PAUSED`

### Render Item Status

```cpp
enum AEGP_RenderItemStatusType {
    AEGP_RenderItemStatus_NONE,
    AEGP_RenderItemStatus_WILL_CONTINUE,  // Rendering paused
    AEGP_RenderItemStatus_NEEDS_OUTPUT,   // Missing valid output path
    AEGP_RenderItemStatus_UNQUEUED,       // Not ready to render
    AEGP_RenderItemStatus_QUEUED,         // Ready for rendering
    AEGP_RenderItemStatus_RENDERING,      // Currently rendering
    AEGP_RenderItemStatus_USER_STOPPED,   // Stopped by user/script
    AEGP_RenderItemStatus_ERR_STOPPED,    // Stopped due to error
    AEGP_RenderItemStatus_DONE            // Rendering complete
};
```

### Log Types

```cpp
enum AEGP_LogType {
    AEGP_LogType_NONE,
    AEGP_LogType_ERRORS_ONLY,
    AEGP_LogType_PLUS_SETTINGS,
    AEGP_LogType_PER_FRAME_INFO
};
```

### Output Types

```cpp
enum AEGP_OutputTypes {
    AEGP_OutputType_NONE    = 0x00,
    AEGP_OutputType_VIDEO   = 0x01,
    AEGP_OutputType_AUDIO   = 0x02
};
```

### Embed Options

```cpp
enum AEGP_EmbedOptions {
    AEGP_Embed_NOTHING,
    AEGP_Embed_LINK,
    AEGP_Embed_LINK_AND_COPY
};
```

### Post-Render Actions

```cpp
enum AEGP_PostRenderAction {
    AEGP_PostRenderAction_NONE,
    AEGP_PostRenderAction_IMPORT,
    AEGP_PostRenderAction_IMPORT_AND_REPLACE_USAGE,
    AEGP_PostRenderAction_SET_PROXY
};
```

### Output Channels

```cpp
enum AEGP_OutputChannels {
    AEGP_OutputChannels_RGB,
    AEGP_OutputChannels_RGBA,
    AEGP_OutputChannels_ALPHA
};
```

### World Types (Bit Depth)

```cpp
enum AEGP_WorldType {
    AEGP_WorldType_8,    // 8-bit per channel (PF_Pixel8)
    AEGP_WorldType_16,   // 16-bit per channel (PF_Pixel16)
    AEGP_WorldType_32    // 32-bit float per channel (PF_Pixel32)
};
```

### Matte Modes

```cpp
enum AEGP_MatteMode {
    AEGP_MatteMode_STRAIGHT,
    AEGP_MatteMode_PREMUL_BLACK,
    AEGP_MatteMode_PREMUL_BG_COLOR
};
```

### Channel Order

```cpp
enum AEGP_ChannelOrder {
    AEGP_ChannelOrder_ARGB,
    AEGP_ChannelOrder_BGRA
};
```

### Render Quality

```cpp
enum AEGP_RenderQuality {
    AEGP_RenderQuality_DRAFT,
    AEGP_RenderQuality_BEST
};
```

### Stretch Quality

```cpp
enum AEGP_StretchQuality {
    AEGP_StretchQual_LOW,
    AEGP_StretchQual_HIGH
};
```

---

## AEGP_RenderQueueSuite1

Manages the render queue's global operational state.

### Functions

#### AEGP_AddCompToRenderQueue

```cpp
A_Err AEGP_AddCompToRenderQueue(
    AEGP_CompH      compH,              // Composition to add
    const A_UTF16Char *pathZ            // Output file path (UTF-16)
);
```

Adds a composition to the render queue with default output settings.

**Important:** Calling this function invalidates ALL existing `AEGP_RQItemRefH` references.

#### AEGP_SetRenderQueueState

```cpp
A_Err AEGP_SetRenderQueueState(
    AEGP_RenderQueueState   state       // Target state
);
```

Changes the render queue's operational state.

**State Transitions:**
- `STOPPED` -> `RENDERING`: Starts rendering
- `RENDERING` -> `PAUSED`: Pauses current render
- `PAUSED` -> `RENDERING`: Resumes rendering
- `RENDERING` -> `STOPPED`: Stops rendering
- `PAUSED` -> `STOPPED`: Stops rendering

**Error:** Cannot transition from `STOPPED` directly to `PAUSED`.

#### AEGP_GetRenderQueueState

```cpp
A_Err AEGP_GetRenderQueueState(
    AEGP_RenderQueueState   *stateP     // Receives current state
);
```

Retrieves the current operational state of the render queue.

---

## AEGP_RQItemSuite4

Manages individual render queue items with comprehensive query and modification capabilities.

### Item Enumeration

#### AEGP_GetNumRQItems

```cpp
A_Err AEGP_GetNumRQItems(
    A_long  *num_itemsPL                // Receives item count
);
```

Returns the total number of items in the render queue.

#### AEGP_GetRQItemByIndex

```cpp
A_Err AEGP_GetRQItemByIndex(
    A_long              indexL,         // Zero-based index
    AEGP_RQItemRefH     *rq_item_refPH  // Receives item reference
);
```

Retrieves a render queue item by its index position.

#### AEGP_GetNextRQItem

```cpp
A_Err AEGP_GetNextRQItem(
    AEGP_RQItemRefH     current_rq_itemH,   // Current item (NULL for first)
    AEGP_RQItemRefH     *next_rq_itemPH     // Receives next item
);
```

Iterates through render queue items. Pass `NULL` for `current_rq_itemH` to get the first item.

### Item Properties

#### AEGP_GetNumOutputModulesForRQItem

```cpp
A_Err AEGP_GetNumOutputModulesForRQItem(
    AEGP_RQItemRefH     rq_itemH,
    A_long              *num_outmodsPL
);
```

Returns the number of output modules attached to a render queue item.

#### AEGP_GetRenderState

```cpp
A_Err AEGP_GetRenderState(
    AEGP_RQItemRefH             rq_itemH,
    AEGP_RenderItemStatusType   *statusP
);
```

Gets the current render status of an item.

#### AEGP_SetRenderState

```cpp
A_Err AEGP_SetRenderState(
    AEGP_RQItemRefH             rq_itemH,
    AEGP_RenderItemStatusType   status
);
```

Sets whether an item will render when the queue starts.

**Error:** Returns `Err_PARAMETER` if called while `AEGP_RenderQueueState != AEGP_RenderQueueState_STOPPED`.

**Error:** Returns `Err_PARAMETER` if you try to set `QUEUED` status on an item without a valid output path.

#### AEGP_GetStartedTime

```cpp
A_Err AEGP_GetStartedTime(
    AEGP_RQItemRefH     rq_itemH,
    A_Time              *started_timePT
);
```

Gets the time when rendering started for this item.

#### AEGP_GetElapsedTime

```cpp
A_Err AEGP_GetElapsedTime(
    AEGP_RQItemRefH     rq_itemH,
    A_Time              *elapsed_timePT
);
```

Gets the elapsed rendering time for this item.

#### AEGP_GetLogType / AEGP_SetLogType

```cpp
A_Err AEGP_GetLogType(
    AEGP_RQItemRefH     rq_itemH,
    AEGP_LogType        *log_typeP
);

A_Err AEGP_SetLogType(
    AEGP_RQItemRefH     rq_itemH,
    AEGP_LogType        log_type
);
```

Gets/sets the logging verbosity level for the render item.

#### AEGP_GetComment / AEGP_SetComment

```cpp
A_Err AEGP_GetComment(
    AEGP_RQItemRefH     rq_itemH,
    AEGP_MemHandle      *commentPH      // UTF-16 string
);

A_Err AEGP_SetComment(
    AEGP_RQItemRefH     rq_itemH,
    const A_UTF16Char   *commentZ
);
```

Gets/sets the comment field for a render queue item (Unicode).

#### AEGP_GetCompFromRQItem

```cpp
A_Err AEGP_GetCompFromRQItem(
    AEGP_RQItemRefH     rq_itemH,
    AEGP_CompH          *compPH
);
```

Retrieves the composition associated with a render queue item.

### Item Management

#### AEGP_DeleteRQItem

```cpp
A_Err AEGP_DeleteRQItem(
    AEGP_RQItemRefH     rq_itemH
);
```

Removes an item from the render queue. This operation is undoable.

**Important:** All `AEGP_RQItemRefH` references are invalidated after this call.

#### AEGP_RemoveOutputModule

```cpp
A_Err AEGP_RemoveOutputModule(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH
);
```

Removes an output module from a render queue item.

**Important:** Invalidates output module references for this item.

---

## AEGP_OutputModuleSuite4

Controls output module configuration for render items.

### Output Module Access

#### AEGP_GetOutputModuleByIndex

```cpp
A_Err AEGP_GetOutputModuleByIndex(
    AEGP_RQItemRefH         rq_itemH,
    A_long                  indexL,
    AEGP_OutputModuleRefH   *outmodPH
);
```

Retrieves an output module by its index within a render queue item.

#### AEGP_AddDefaultOutputModule

```cpp
A_Err AEGP_AddDefaultOutputModule(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   *outmodPH
);
```

Adds an output module with default settings to a render queue item.

### Embedding Options

#### AEGP_GetEmbedOptions / AEGP_SetEmbedOptions

```cpp
A_Err AEGP_GetEmbedOptions(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_EmbedOptions       *embed_optionsP
);

A_Err AEGP_SetEmbedOptions(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_EmbedOptions       embed_options
);
```

Gets/sets project embedding options (NOTHING, LINK, LINK_AND_COPY).

### Post-Render Actions

#### AEGP_GetPostRenderAction / AEGP_SetPostRenderAction

```cpp
A_Err AEGP_GetPostRenderAction(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_PostRenderAction   *actionP
);

A_Err AEGP_SetPostRenderAction(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_PostRenderAction   action
);
```

Gets/sets post-render behavior (NONE, IMPORT, IMPORT_AND_REPLACE_USAGE, SET_PROXY).

### Output Configuration

#### AEGP_GetEnabledOutputs / AEGP_SetEnabledOutputs

```cpp
A_Err AEGP_GetEnabledOutputs(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_OutputTypes        *typesP
);

A_Err AEGP_SetEnabledOutputs(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_OutputTypes        types
);
```

Gets/sets which output types are enabled (VIDEO, AUDIO, or both using bitwise OR).

#### AEGP_GetOutputChannels / AEGP_SetOutputChannels

```cpp
A_Err AEGP_GetOutputChannels(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_OutputChannels     *channelsP
);

A_Err AEGP_SetOutputChannels(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_OutputChannels     channels
);
```

Gets/sets output channel configuration (RGB, RGBA, ALPHA).

#### AEGP_GetOutputFilePath / AEGP_SetOutputFilePath

```cpp
A_Err AEGP_GetOutputFilePath(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_MemHandle          *pathPH      // UTF-16 string
);

A_Err AEGP_SetOutputFilePath(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    const A_UTF16Char       *pathZ
);
```

Gets/sets the output file destination path (UTF-16 encoded).

### Stretch Settings

#### AEGP_GetStretchInfo / AEGP_SetStretchInfo

```cpp
A_Err AEGP_GetStretchInfo(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    A_Boolean               *enabledPB,
    AEGP_StretchQuality     *qualityP,
    A_long                  *widthPL,
    A_long                  *heightPL
);

A_Err AEGP_SetStretchInfo(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    A_Boolean               enabled,
    AEGP_StretchQuality     quality,
    A_long                  width,
    A_long                  height
);
```

Gets/sets output stretching/resizing parameters.

### Crop Settings

#### AEGP_GetCropInfo / AEGP_SetCropInfo

```cpp
A_Err AEGP_GetCropInfo(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    A_Boolean               *enabledPB,
    A_LRect                 *crop_rectP
);

A_Err AEGP_SetCropInfo(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    A_Boolean               enabled,
    const A_LRect           *crop_rectP
);
```

Gets/sets cropping rectangle configuration.

### Audio Settings

#### AEGP_GetSoundFormatInfo / AEGP_SetSoundFormatInfo

```cpp
A_Err AEGP_GetSoundFormatInfo(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_SoundDataFormat    *formatP
);

A_Err AEGP_SetSoundFormatInfo(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    const AEGP_SoundDataFormat *formatP
);
```

Gets/sets audio format parameters.

### Extra Information

#### AEGP_GetExtraOutputModuleInfo

```cpp
A_Err AEGP_GetExtraOutputModuleInfo(
    AEGP_RQItemRefH         rq_itemH,
    AEGP_OutputModuleRefH   outmodH,
    AEGP_MemHandle          *format_descPH,     // Format description string
    AEGP_MemHandle          *file_ext_PH,       // File extension
    A_Boolean               *is_sequencePB,     // True if image sequence
    A_Boolean               *multi_framePB      // True if multi-frame format
);
```

Retrieves additional output module information including format description and sequence flags.

---

## AEGP_RenderOptionsSuite4

Configures composition-level render parameters.

### Creation and Disposal

#### AEGP_NewFromItem

```cpp
A_Err AEGP_NewFromItem(
    AEGP_PluginID           plugin_id,
    AEGP_ItemH              itemH,
    AEGP_RenderOptionsH     *render_optionsPH
);
```

Creates render options from a composition item handle.

#### AEGP_Duplicate

```cpp
A_Err AEGP_Duplicate(
    AEGP_PluginID           plugin_id,
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_RenderOptionsH     *copyPH
);
```

Creates a copy of render options for modification.

#### AEGP_Dispose

```cpp
A_Err AEGP_Dispose(
    AEGP_RenderOptionsH     render_optionsH
);
```

Frees render options memory.

### Time Settings

#### AEGP_SetTime / AEGP_GetTime

```cpp
A_Err AEGP_SetTime(
    AEGP_RenderOptionsH     render_optionsH,
    A_Time                  time
);

A_Err AEGP_GetTime(
    AEGP_RenderOptionsH     render_optionsH,
    A_Time                  *timePT
);
```

Gets/sets the render frame time.

#### AEGP_SetTimeStep / AEGP_GetTimeStep

```cpp
A_Err AEGP_SetTimeStep(
    AEGP_RenderOptionsH     render_optionsH,
    A_Time                  time_step
);

A_Err AEGP_GetTimeStep(
    AEGP_RenderOptionsH     render_optionsH,
    A_Time                  *time_stepPT
);
```

Gets/sets the frame duration/time step.

### Render Quality

#### AEGP_SetRenderQuality / AEGP_GetRenderQuality

```cpp
A_Err AEGP_SetRenderQuality(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_RenderQuality      quality
);

A_Err AEGP_GetRenderQuality(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_RenderQuality      *qualityP
);
```

Gets/sets render quality level (DRAFT or BEST).

### Bit Depth

#### AEGP_SetWorldType / AEGP_GetWorldType

```cpp
A_Err AEGP_SetWorldType(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_WorldType          type
);

A_Err AEGP_GetWorldType(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_WorldType          *typeP
);
```

Gets/sets the bit depth for rendering (8-bit, 16-bit, or 32-bit float).

### Resolution

#### AEGP_SetDownsampleFactor / AEGP_GetDownsampleFactor

```cpp
A_Err AEGP_SetDownsampleFactor(
    AEGP_RenderOptionsH     render_optionsH,
    A_short                 x_factor,
    A_short                 y_factor
);

A_Err AEGP_GetDownsampleFactor(
    AEGP_RenderOptionsH     render_optionsH,
    A_short                 *x_factorPS,
    A_short                 *y_factorPS
);
```

Gets/sets independent X/Y downsampling factors.

### Region of Interest

#### AEGP_SetRegionOfInterest / AEGP_GetRegionOfInterest

```cpp
A_Err AEGP_SetRegionOfInterest(
    AEGP_RenderOptionsH     render_optionsH,
    const A_LRect           *roiP
);

A_Err AEGP_GetRegionOfInterest(
    AEGP_RenderOptionsH     render_optionsH,
    A_LRect                 *roiP
);
```

Gets/sets partial frame rendering rectangle.

### Alpha/Matte Handling

#### AEGP_SetMatteMode / AEGP_GetMatteMode

```cpp
A_Err AEGP_SetMatteMode(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_MatteMode          mode
);

A_Err AEGP_GetMatteMode(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_MatteMode          *modeP
);
```

Gets/sets alpha handling mode (STRAIGHT, PREMUL_BLACK, PREMUL_BG_COLOR).

### Pixel Order

#### AEGP_SetChannelOrder / AEGP_GetChannelOrder

```cpp
A_Err AEGP_SetChannelOrder(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_ChannelOrder       channel_order
);

A_Err AEGP_GetChannelOrder(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_ChannelOrder       *channel_orderP
);
```

Gets/sets pixel channel ordering (ARGB or BGRA).

### Field Rendering

#### AEGP_SetFieldRender / AEGP_GetFieldRender

```cpp
A_Err AEGP_SetFieldRender(
    AEGP_RenderOptionsH     render_optionsH,
    PF_Field                field_render
);

A_Err AEGP_GetFieldRender(
    AEGP_RenderOptionsH     render_optionsH,
    PF_Field                *field_renderP
);
```

Gets/sets field rendering mode.

### Guide Layers

#### AEGP_SetRenderGuideLayers / AEGP_GetRenderGuideLayers

```cpp
A_Err AEGP_SetRenderGuideLayers(
    AEGP_RenderOptionsH     render_optionsH,
    A_Boolean               render_guide_layers
);

A_Err AEGP_GetRenderGuideLayers(
    AEGP_RenderOptionsH     render_optionsH,
    A_Boolean               *render_guide_layersPB
);
```

Gets/sets whether guide layers should be rendered.

---

## AEGP_LayerRenderOptionsSuite1

Layer-specific render configuration, introduced in CC 2014 (13.0).

### Creation

#### AEGP_NewFromLayer

```cpp
A_Err AEGP_NewFromLayer(
    AEGP_PluginID               plugin_id,
    AEGP_LayerH                 layerH,
    AEGP_LayerRenderOptionsH    *layer_optionsPH
);
```

Creates render options from a layer with its current settings.

#### AEGP_NewFromUpstreamOfEffect

```cpp
A_Err AEGP_NewFromUpstreamOfEffect(
    AEGP_PluginID               plugin_id,
    AEGP_EffectRefH             effectH,
    AEGP_LayerRenderOptionsH    *layer_optionsPH
);
```

Gets layer state before a specific effect is applied.

### Memory Management

#### AEGP_Duplicate / AEGP_Dispose

```cpp
A_Err AEGP_Duplicate(
    AEGP_PluginID               plugin_id,
    AEGP_LayerRenderOptionsH    layer_optionsH,
    AEGP_LayerRenderOptionsH    *copyPH
);

A_Err AEGP_Dispose(
    AEGP_LayerRenderOptionsH    layer_optionsH
);
```

Duplicates or frees layer render options.

---

## AEGP_RenderQueueMonitorSuite1

Provides callbacks for monitoring render queue activity.

### Callback Registration

#### AEGP_RegisterListener

```cpp
A_Err AEGP_RegisterListener(
    AEGP_PluginID               plugin_id,
    AEGP_RQM_Refcon             refcon,
    const AEGP_RQM_FunctionBlock1 *function_blockP
);
```

Registers callback functions to receive render queue events.

#### AEGP_DeregisterListener

```cpp
A_Err AEGP_DeregisterListener(
    AEGP_PluginID               plugin_id,
    AEGP_RQM_Refcon             refcon
);
```

Unregisters the callback listener.

### Function Block Structure

```cpp
typedef struct AEGP_RQM_FunctionBlock1 {
    AEGP_RQM_RenderJobStarted       render_job_started_funcP;
    AEGP_RQM_RenderJobEnded         render_job_ended_funcP;
    AEGP_RQM_RenderJobItemStarted   render_job_item_started_funcP;
    AEGP_RQM_RenderJobItemUpdated   render_job_item_updated_funcP;
    AEGP_RQM_RenderJobItemEnded     render_job_item_ended_funcP;
} AEGP_RQM_FunctionBlock1;
```

### Callback Signatures

```cpp
// Called when render job starts
typedef A_Err (*AEGP_RQM_RenderJobStarted)(
    AEGP_RQM_Refcon refcon
);

// Called when render job ends
typedef A_Err (*AEGP_RQM_RenderJobEnded)(
    AEGP_RQM_Refcon refcon
);

// Called when a queue item starts rendering
typedef A_Err (*AEGP_RQM_RenderJobItemStarted)(
    AEGP_RQM_Refcon refcon,
    AEGP_RQItemRefH rq_itemH
);

// Called for progress updates during item render
typedef A_Err (*AEGP_RQM_RenderJobItemUpdated)(
    AEGP_RQM_Refcon refcon,
    AEGP_RQItemRefH rq_itemH,
    A_long          current_frameL,
    A_long          total_framesL
);

// Called when queue item finishes
typedef A_Err (*AEGP_RQM_RenderJobItemEnded)(
    AEGP_RQM_Refcon refcon,
    AEGP_RQItemRefH rq_itemH
);
```

### Usage Pattern

```cpp
// Define callback functions
static A_Err RenderJobStarted(AEGP_RQM_Refcon refcon) {
    // Handle render start
    return A_Err_NONE;
}

static A_Err RenderJobItemUpdated(
    AEGP_RQM_Refcon refcon,
    AEGP_RQItemRefH rq_itemH,
    A_long current_frameL,
    A_long total_framesL)
{
    // Update progress bar
    float progress = (float)current_frameL / (float)total_framesL;
    return A_Err_NONE;
}

// ... other callbacks ...

// Register listener in entry point
static const AEGP_RQM_FunctionBlock1 g_renderCallbacks = {
    RenderJobStarted,
    RenderJobEnded,
    RenderJobItemStarted,
    RenderJobItemUpdated,
    RenderJobItemEnded
};

err = suites.RenderQueueMonitorSuite1()->AEGP_RegisterListener(
    pluginId,
    (AEGP_RQM_Refcon)contextPtr,
    &g_renderCallbacks
);
```

**Important Notes:**
- Register listeners in your AEGP's main entry point
- Store function block in static/global memory
- Some versions may have issues with callbacks not triggering
- `AEGP_SuiteHandler.h` may not include boilerplate for this suite

---

## Output File Path Templating

### Frame Number Padding

When specifying output paths for image sequences, use pound signs within square brackets to indicate frame number padding:

```
output_folder/frame[#####].png
```

**Format Rules:**
- The number of `#` symbols determines zero-padding digits
- `[####]` produces: 0001, 0002, 0003, ...
- `[######]` produces: 000001, 000002, 000003, ...
- After Effects replaces the `[#####]` portion with the frame number

### Examples

```cpp
// 4-digit padding
L"C:\\output\\beauty[####].tga"
// Produces: beauty0001.tga, beauty0002.tga, ...

// 6-digit padding
L"C:\\output\\frame_[######].exr"
// Produces: frame_000001.exr, frame_000002.exr, ...
```

---

## aerender Command-Line Integration

The `aerender` executable enables command-line rendering and scripting integration.

### Location

| Platform | Path |
|----------|------|
| Windows | `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\aerender.exe` |
| macOS | `/Applications/Adobe After Effects [version]/aerender` |

### Key Arguments

| Argument | Description |
|----------|-------------|
| `-help` | Display usage information |
| `-version` | Show aerender version |
| `-v [flag]` | Verbosity (ERRORS or ERRORS_AND_PROGRESS) |
| `-reuse` | Use existing AE instance |
| `-project [path]` | Project file to open |
| `-comp [name]` | Composition to render |
| `-s [frame]` | Start frame |
| `-e [frame]` | End frame (inclusive) |
| `-i [number]` | Frame increment (default: 1) |
| `-output [path]` | Output file path |
| `-OMtemplate [name]` | Output module template |
| `-RStemplate [name]` | Render settings template |
| `-rqindex [number]` | Render specific queue item by index |
| `-mem_usage [cache%] [max%]` | Memory allocation |
| `-mfr [flag] [cpu%]` | Multi-Frame Rendering settings |
| `-log [path]` | Log file path |
| `-sound [flag]` | Completion sound (ON/OFF) |
| `-close [flag]` | Close behavior (DO_NOT_SAVE_CHANGES, SAVE_CHANGES, DO_NOT_CLOSE) |
| `-continueOnMissingFootage` | Skip missing footage errors |

### Example Commands

**Render specific frames to image sequence:**
```bash
aerender -project "C:\projects\myproject.aep" \
         -comp "Main Comp" \
         -s 1 -e 100 \
         -RStemplate "Best Settings" \
         -OMtemplate "PNG Sequence" \
         -output "C:\output\frame[####].png"
```

**Render entire queue:**
```bash
aerender -project "C:\projects\myproject.aep"
```

**Run script via aerender:**
```bash
afterfx -r "path/to/script.jsx"
```

### Render-Only Node

For non-royalty bearing rendering, create a blank file named `ae_render_only_node.txt` in:

| Platform | Path |
|----------|------|
| Windows | `C:\Users\<username>\Documents` or `C:\Users\Public\Documents\Adobe` |
| macOS | `/Users/<username>/Documents/` or `/Users/Shared/Adobe/` |

---

## Asynchronous Rendering

### Async Manager (CC 2015+)

For non-blocking frame rendering in custom UI:

```cpp
A_Err AEGP_CheckoutOrRender_ItemFrame_AsyncManager(
    AEGP_AsyncRequestId     *request_idP,
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_CompH              compH,
    A_Time                  time,
    AEGP_AsyncFrameReadyCallback callback,
    AEGP_AsyncFrameRequestRefcon refcon
);

A_Err AEGP_CheckoutOrRender_LayerFrame_AsyncManager(
    AEGP_AsyncRequestId     *request_idP,
    AEGP_LayerRenderOptionsH layer_optionsH,
    AEGP_LayerH             layerH,
    A_Time                  time,
    AEGP_AsyncFrameReadyCallback callback,
    AEGP_AsyncFrameRequestRefcon refcon
);
```

### Synchronous Rendering

For user-action responses where blocking is acceptable:

```cpp
A_Err AEGP_RenderAndCheckoutFrame(
    AEGP_RenderOptionsH     render_optionsH,
    AEGP_TimeStamp          *time_stampP,
    AEGP_FrameReceiptH      *frame_receiptPH
);

A_Err AEGP_GetReceiptWorld(
    AEGP_FrameReceiptH      frame_receiptH,
    AEGP_WorldH             *worldPH
);
```

### Usage Guidelines

- Use async for passive UI drawing (histograms, previews)
- Use sync when responding to user clicks that update project state
- The `HistoGrid` SDK sample demonstrates async custom UI rendering

---

## Code Examples

### Example 1: Add Composition to Render Queue

```cpp
A_Err AddCompToQueue(
    AEGP_PluginID plugin_id,
    AEGP_CompH compH,
    const A_UTF16Char* outputPath)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Add composition with default settings
    ERR(suites.RenderQueueSuite1()->AEGP_AddCompToRenderQueue(
        compH,
        outputPath
    ));

    return err;
}
```

### Example 2: Iterate Render Queue Items

```cpp
A_Err ProcessQueueItems(AEGP_PluginID plugin_id)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    A_long numItems = 0;
    ERR(suites.RQItemSuite4()->AEGP_GetNumRQItems(&numItems));

    for (A_long i = 0; i < numItems && !err; i++) {
        AEGP_RQItemRefH rqItemH = NULL;

        ERR(suites.RQItemSuite4()->AEGP_GetRQItemByIndex(i, &rqItemH));

        if (!err && rqItemH) {
            AEGP_RenderItemStatusType status;
            ERR(suites.RQItemSuite4()->AEGP_GetRenderState(rqItemH, &status));

            // Process based on status
            if (status == AEGP_RenderItemStatus_QUEUED) {
                // Item is ready to render
            }
        }
    }

    return err;
}
```

### Example 3: Configure Output Module

```cpp
A_Err ConfigureOutputModule(
    AEGP_PluginID plugin_id,
    AEGP_RQItemRefH rqItemH,
    const A_UTF16Char* outputPath)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Get first output module
    AEGP_OutputModuleRefH outmodH = NULL;
    ERR(suites.OutputModuleSuite4()->AEGP_GetOutputModuleByIndex(
        rqItemH, 0, &outmodH
    ));

    if (!err && outmodH) {
        // Set output path
        ERR(suites.OutputModuleSuite4()->AEGP_SetOutputFilePath(
            rqItemH, outmodH, outputPath
        ));

        // Enable video output
        ERR(suites.OutputModuleSuite4()->AEGP_SetEnabledOutputs(
            rqItemH, outmodH, AEGP_OutputType_VIDEO
        ));

        // Set RGBA channels
        ERR(suites.OutputModuleSuite4()->AEGP_SetOutputChannels(
            rqItemH, outmodH, AEGP_OutputChannels_RGBA
        ));

        // Set post-render action
        ERR(suites.OutputModuleSuite4()->AEGP_SetPostRenderAction(
            rqItemH, outmodH, AEGP_PostRenderAction_IMPORT
        ));
    }

    return err;
}
```

### Example 4: Start Rendering with Progress Monitoring

```cpp
// Callback functions
static A_Err MyRenderJobStarted(AEGP_RQM_Refcon refcon) {
    MyContext* ctx = (MyContext*)refcon;
    ctx->isRendering = true;
    return A_Err_NONE;
}

static A_Err MyRenderJobItemUpdated(
    AEGP_RQM_Refcon refcon,
    AEGP_RQItemRefH rqItemH,
    A_long currentFrame,
    A_long totalFrames)
{
    MyContext* ctx = (MyContext*)refcon;
    ctx->progress = (float)currentFrame / (float)totalFrames;
    // Update UI progress bar here
    return A_Err_NONE;
}

static A_Err MyRenderJobEnded(AEGP_RQM_Refcon refcon) {
    MyContext* ctx = (MyContext*)refcon;
    ctx->isRendering = false;
    return A_Err_NONE;
}

// Static callback block
static const AEGP_RQM_FunctionBlock1 g_callbacks = {
    MyRenderJobStarted,
    MyRenderJobEnded,
    NULL,  // item started
    MyRenderJobItemUpdated,
    NULL   // item ended
};

A_Err StartRenderWithMonitoring(AEGP_PluginID plugin_id, MyContext* ctx)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    // Register listener
    ERR(suites.RenderQueueMonitorSuite1()->AEGP_RegisterListener(
        plugin_id,
        (AEGP_RQM_Refcon)ctx,
        &g_callbacks
    ));

    // Start rendering (blocking call)
    ERR(suites.RenderQueueSuite1()->AEGP_SetRenderQueueState(
        AEGP_RenderQueueState_RENDERING
    ));

    // Deregister listener when done
    ERR(suites.RenderQueueMonitorSuite1()->AEGP_DeregisterListener(
        plugin_id,
        (AEGP_RQM_Refcon)ctx
    ));

    return err;
}
```

### Example 5: Create Render Options for Custom Render

```cpp
A_Err RenderFrameWithOptions(
    AEGP_PluginID plugin_id,
    AEGP_CompH compH,
    A_Time time,
    AEGP_WorldH* worldPH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(plugin_id);

    AEGP_RenderOptionsH renderOpts = NULL;
    AEGP_ItemH itemH = NULL;
    AEGP_FrameReceiptH receiptH = NULL;

    // Get item handle from comp
    ERR(suites.CompSuite4()->AEGP_GetItemFromComp(compH, &itemH));

    // Create render options
    ERR(suites.RenderOptionsSuite4()->AEGP_NewFromItem(
        plugin_id, itemH, &renderOpts
    ));

    if (!err && renderOpts) {
        // Configure options
        ERR(suites.RenderOptionsSuite4()->AEGP_SetTime(renderOpts, time));
        ERR(suites.RenderOptionsSuite4()->AEGP_SetWorldType(
            renderOpts, AEGP_WorldType_8
        ));
        ERR(suites.RenderOptionsSuite4()->AEGP_SetRenderQuality(
            renderOpts, AEGP_RenderQuality_BEST
        ));

        // Render the frame
        AEGP_TimeStamp timeStamp;
        ERR(suites.RenderSuite4()->AEGP_RenderAndCheckoutFrame(
            renderOpts, &timeStamp, &receiptH
        ));

        if (!err && receiptH) {
            // Get the rendered world
            ERR(suites.RenderSuite4()->AEGP_GetReceiptWorld(
                receiptH, worldPH
            ));

            // Check in the frame when done
            ERR(suites.RenderSuite4()->AEGP_CheckinFrame(receiptH));
        }

        // Dispose render options
        ERR(suites.RenderOptionsSuite4()->AEGP_Dispose(renderOpts));
    }

    return err;
}
```

---

## Important Caveats

### Reference Invalidation

**Critical:** All `AEGP_RQItemRefH` and `AEGP_OutputModuleRefH` references are invalidated by:
- Calling `AEGP_AddCompToRenderQueue`
- User manually adding/removing compositions
- Adding or removing output modules
- Any reordering of queue items

**Never cache these handles.** Always re-acquire them before use.

### Format Settings Limitation

The SDK does not provide APIs for setting output format ("Format" tab) or codec options ("Format Options" tab) programmatically. To control output formats:
- Use output module templates (`-OMtemplate` with aerender)
- Create a custom AEIO plug-in for custom format handling

### Thread Safety

Since CC 2015 (13.5), After Effects separates UI and render threads:
- Render thread: `PF_Cmd_RENDER`, `PF_Cmd_SMART_PRERENDER`, `PF_Cmd_SMART_RENDER`
- UI thread: `PF_Cmd_SEQUENCE_SETUP`, `PF_Cmd_USER_CHANGED_PARAM`, `PF_Cmd_DO_DIALOG`, `PF_EVENT_DRAW`

Use appropriate async methods for cross-thread frame access.

### Multi-Frame Rendering (MFR)

Since AE 22.0 (March 2021 SDK):
- Set `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` for MFR support
- Sequence data is read-only during render selectors
- Use the Compute Cache for thread-safe data sharing

---

## Related Resources

- [After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [AEGP Suites Documentation](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [After Effects Scripting Guide - RenderQueue](https://ae-scripting.docsforadobe.dev/renderqueue/renderqueue/)
- [Automated Rendering and Network Rendering](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html)
- [Adobe Developer - After Effects](https://developer.adobe.com/after-effects/)

---

## Version History

| Suite | Version | Notes |
|-------|---------|-------|
| AEGP_RenderQueueSuite | 1 | Base render queue management |
| AEGP_RQItemSuite | 4 | Full queue item manipulation |
| AEGP_OutputModuleSuite | 4 | Output configuration |
| AEGP_RenderOptionsSuite | 4 | Includes layer checkout (CC 2014+) |
| AEGP_LayerRenderOptionsSuite | 1 | CC 2014+ layer-specific options |
| AEGP_RenderQueueMonitorSuite | 1 | Progress callbacks |

---

*Document generated from Adobe After Effects SDK documentation and community resources.*
*Last updated: December 2024*
