---
source: '[unknown - 06-sample-code-analysis.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
[3-Resources/anchors/status-complete]]

# Adobe After Effects SDK: Sample Code Analysis

## Document Metadata

```yaml
created: 2025-12-27
type: research/technical-documentation
status: complete
source: Adobe Official Documentation
sdk-version: 25.x (2025)
word-count: 4500+
tags:
  - after-effects
  - sdk
  - sample-projects
  - code-patterns
  - plugin-development
```

---

## Table of Contents

1. [Introduction](#introduction)
2. [Sample Projects Overview](#sample-projects-overview)
3. [Effect Samples Analysis](#effect-samples-analysis)
4. [AEGP Samples Analysis](#aegp-samples-analysis)
5. [AEIO Samples Analysis](#aeio-samples-analysis)
6. [Code Pattern Extraction](#code-pattern-extraction)
7. [Build System Configuration](#build-system-configuration)
8. [Project File Structure](#project-file-structure)
9. [Best Practices from Samples](#best-practices-from-samples)
10. [Related Documentation](#related-documentation)

---

## Introduction

The Adobe After Effects SDK includes comprehensive sample projects demonstrating every plug-in type supported by the current API. These samples serve as the primary learning resource for developers, prioritizing clarity over sophistication to help understand API features and implementation patterns.

According to Adobe's documentation, the sample projects are intentionally kept simple: "In the sample projects, the code is kept as simple as possible" to help developers understand the essential patterns without being overwhelmed by optimization or edge case handling.

**Official Resources:**
- [Adobe After Effects Developer Portal](https://developer.adobe.com/after-effects/)
- [After Effects C++ SDK Guide - Sample Projects](https://ae-plugins.docsforadobe.dev/intro/sample-projects/)
- [GitHub SDK Examples](https://github.com/KAndQ/AEPlugins)

---

## Sample Projects Overview

Adobe has organized all sample projects into a unified master project structure located in the SDK's Examples folder:

| Platform | Master Project File |
|----------|-------------------|
| macOS | `Buildall.xcodeproj` |
| Windows | `BuildAll.sln` |

### Sample Categories

The SDK samples are organized by plugin type:

| Category | Purpose | Sample Count |
|----------|---------|--------------|
| **Effects** | Image/video processing effects | 15+ |
| **AEGPs** | General plugins (menus, panels, keyframes) | 10+ |
| **Artisans** | Custom 3D renderers | 1 |
| **AEIO** | File format import/export | 2 |
| **BlitHook** | External monitor output | 2 |

### Output Paths

After building samples, plugins are placed in the MediaCore shared plugins folder:

| Platform | Output Path |
|----------|-------------|
| macOS | `~/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/` |
| Windows | `C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\` |

**Note:** The version number (7.0) is locked for all Creative Cloud versions.

---

## Effect Samples Analysis

### Checkout Sample - Layer Checkout

The **Checkout** sample demonstrates how to access frames from other layers at specified times, a fundamental pattern for effects that need to reference multiple sources.

**Key Demonstrated Concepts:**
- Layer parameter checkout/checkin workflow
- Cross-layer pixel access
- Region-based rendering (splitting output into sections)
- Platform detection for Premiere Pro compatibility

**Core Code Pattern - Parameter Checkout:**

```cpp
// Checkout a layer parameter for access
ERR(PF_CHECKOUT_PARAM(
    in_data,
    CHECKOUT_LAYER,           // Parameter index
    in_data->current_time,    // Time to checkout
    in_data->time_step,
    in_data->time_scale,
    &checkout));

// Use the layer data
// ...

// Always check in when done (even on error)
ERR2(PF_CHECKIN_PARAM(in_data, &checkout));
```

**Render Function Pattern:**

The Checkout sample splits output into two regions (top/bottom halves), copying different sources to each, demonstrating spatial manipulation:

```cpp
static PF_Err Render(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    // Get source layer
    PF_LayerDef *input = &params[0]->u.ld;

    // Define regions for different processing
    PF_Rect top_half, bottom_half;
    top_half.left = bottom_half.left = 0;
    top_half.right = bottom_half.right = output->width;
    top_half.top = 0;
    top_half.bottom = output->height / 2;
    bottom_half.top = output->height / 2;
    bottom_half.bottom = output->height;

    // Copy input to top half
    ERR(PF_COPY(input, output, NULL, &top_half));

    // Copy checked-out layer to bottom half
    ERR(PF_COPY(&checkout.u.ld, output, NULL, &bottom_half));

    return err;
}
```

**Platform Conditional Logic:**

```cpp
// Detect host application
if (in_data->appl_id != 'PrMr') {
    // After Effects specific code
    // Can use full feature set
} else {
    // Premiere Pro fallback
    // Use simpler implementation
}
```

---

### PathMaster Sample - Mask Path Access

The **PathMaster** sample demonstrates accessing and rasterizing paths using PICA suites, enabling effects that interact with layer masks.

**Key Demonstrated Concepts:**
- Path checkout and validation
- Mask world creation with feathering
- Sequence data flatten/unflatten for project serialization
- Color blending within masked regions

**Path Checkout Pattern:**

```cpp
PF_Err err = PF_Err_NONE;
PF_PathOutlinePtr path;

// Checkout path from path parameter
ERR(PathQuerySuite1()->PF_CheckoutPath(
    in_data->effect_ref,
    PATH_PARAM_INDEX,
    in_data->current_time,
    in_data->time_step,
    in_data->time_scale,
    &path));

// Validate path state
A_Boolean is_open;
ERR(PathDataSuite1()->PF_PathIsOpen(
    in_data->effect_ref,
    path,
    &is_open));

if (!is_open) {
    // Apply mask with feathering
    ERR(PF_MaskWorldWithPath(
        in_data->effect_ref,
        path,
        &mask_world,
        feather_amount,
        opacity));
}

// Always checkin
ERR(PathQuerySuite1()->PF_CheckinPath(
    in_data->effect_ref,
    PATH_PARAM_INDEX,
    path));
```

**Sequence Data Flatten Pattern:**

PathMaster demonstrates the critical flatten/unflatten pattern for project serialization:

```cpp
static PF_Err SequenceFlatten(
    PF_InData       *in_data,
    PF_OutData      *out_data)
{
    PF_Err err = PF_Err_NONE;

    // Get current sequence data
    MySequenceData *seq = (MySequenceData*)
        PF_LOCK_HANDLE(in_data->sequence_data);

    // Allocate flat version (no pointers, platform-safe)
    PF_Handle flat_h = PF_NEW_HANDLE(sizeof(MyFlatSequenceData));
    MyFlatSequenceData *flat = (MyFlatSequenceData*)
        PF_LOCK_HANDLE(flat_h);

    // Copy flattenable data only
    flat->version = seq->version;
    flat->value = seq->value;
    // Do NOT copy pointers or handles

    // Handle byte order for cross-platform
    #ifdef AE_BIG_ENDIAN
        flat->version = PF_SWAP_LONG(flat->version);
        flat->value = PF_SWAP_LONG(flat->value);
    #endif

    PF_UNLOCK_HANDLE(flat_h);
    PF_UNLOCK_HANDLE(in_data->sequence_data);

    // Dispose old, set new
    PF_DISPOSE_HANDLE(in_data->sequence_data);
    out_data->sequence_data = flat_h;

    return err;
}
```

---

### Resizer Sample - Output Buffer Modification

The **Resizer** sample demonstrates how effects can expand their output buffer beyond the input dimensions, essential for effects like glows, shadows, and borders.

**Key Demonstrated Concepts:**
- Buffer size modification during FRAME_SETUP
- Origin coordinate adjustment
- Proper extent handling for expanded regions

**Frame Setup Pattern for Buffer Expansion:**

```cpp
static PF_Err FrameSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    // Get border size from parameter
    A_long border = params[PARAM_BORDER]->u.sd.value;

    // Expand output dimensions
    out_data->width = in_data->width + (border * 2);
    out_data->height = in_data->height + (border * 2);

    // Set origin offset so input maps correctly
    out_data->origin.h = border;
    out_data->origin.v = border;

    return err;
}
```

**Important Notes:**
- Buffer expansion occurs in `PF_Cmd_FRAME_SETUP`, not during render
- The `PF_OutFlag_I_EXPAND_BUFFER` flag must be set in GLOBAL_SETUP
- Origin values define where the original input maps within the expanded output

---

### ColorGrid Sample - Custom UI and Arbitrary Data

The **ColorGrid** sample demonstrates arbitrary data type parameters with custom UI, enabling complex parameter types beyond the built-in options.

**Key Demonstrated Concepts:**
- Arbitrary data parameter registration
- Custom UI drawing using Drawbot
- Event handling for user interaction
- Data serialization callbacks

**Arbitrary Data Registration:**

```cpp
// In ParamsSetup
PF_ParamDef def;
AEFX_CLR_STRUCT(def);

def.param_type = PF_Param_ARBITRARY_DATA;
def.u.arb_d.id = ARB_DATA_ID;
def.u.arb_d.dflt_value = NULL;  // Will be created by NEW_FUNC
def.u.arb_d.dephault = sizeof(MyArbData);

// Register with arbitrary callbacks
PF_ADD_PARAM(-1, &def);
```

**Arbitrary Callback Handler Pattern:**

```cpp
static PF_Err HandleArbitrary(
    PF_InData               *in_data,
    PF_OutData              *out_data,
    PF_ParamDef             *params[],
    PF_LayerDef             *output,
    PF_ArbParamsExtra       *extra)
{
    PF_Err err = PF_Err_NONE;

    switch (extra->which_function) {
        case PF_Arbitrary_NEW_FUNC:
            // Allocate new instance
            err = ArbNew(in_data, out_data, extra);
            break;

        case PF_Arbitrary_DISPOSE_FUNC:
            // Free instance
            err = ArbDispose(in_data, out_data, extra);
            break;

        case PF_Arbitrary_COPY_FUNC:
            // Duplicate data
            err = ArbCopy(in_data, out_data, extra);
            break;

        case PF_Arbitrary_FLAT_SIZE_FUNC:
            // Report flattened size
            extra->u.flat_size_func_params.flat_size =
                sizeof(MyFlatArbData);
            break;

        case PF_Arbitrary_FLATTEN_FUNC:
            // Convert to disk format
            err = ArbFlatten(in_data, out_data, extra);
            break;

        case PF_Arbitrary_UNFLATTEN_FUNC:
            // Restore from disk format
            err = ArbUnflatten(in_data, out_data, extra);
            break;

        case PF_Arbitrary_INTERP_FUNC:
            // Interpolate between keyframes
            err = ArbInterp(in_data, out_data, extra);
            break;

        case PF_Arbitrary_COMPARE_FUNC:
            // Compare two instances
            err = ArbCompare(in_data, out_data, extra);
            break;
    }

    return err;
}
```

---

### GLator Sample - OpenGL Integration

The **GLator** sample demonstrates proper OpenGL context management in an effect plugin, enabling GPU-accelerated rendering using OpenGL.

**Key Demonstrated Concepts:**
- OpenGL context creation and switching
- Texture upload and download
- Shader loading and binding
- Framebuffer object rendering

**Context Management Pattern:**

```cpp
// Save host context before OpenGL operations
static void SetPluginContext(void)
{
    // Platform-specific context save
    #ifdef AE_OS_MAC
        savedContext = CGLGetCurrentContext();
    #else
        savedContext = wglGetCurrentContext();
        savedDC = wglGetCurrentDC();
    #endif

    // Activate plugin's OpenGL context
    #ifdef AE_OS_MAC
        CGLSetCurrentContext(pluginContext);
    #else
        wglMakeCurrent(pluginDC, pluginContext);
    #endif
}

static void SetHostContext(void)
{
    // Restore host's OpenGL context
    #ifdef AE_OS_MAC
        CGLSetCurrentContext(savedContext);
    #else
        wglMakeCurrent(savedDC, savedContext);
    #endif
}
```

**Texture Handling Pattern:**

```cpp
static PF_Err RenderWithGL(
    PF_InData       *in_data,
    PF_EffectWorld  *input,
    PF_EffectWorld  *output)
{
    PF_Err err = PF_Err_NONE;

    SetPluginContext();

    // Upload input pixels to GPU texture
    glBindTexture(GL_TEXTURE_2D, inputTexture);
    glTexSubImage2D(
        GL_TEXTURE_2D,
        0,
        0, 0,
        input->width, input->height,
        GL_BGRA,
        GL_UNSIGNED_BYTE,
        input->data);

    // Bind framebuffer for rendering
    glBindFramebuffer(GL_FRAMEBUFFER, fbo);

    // Render with shader
    glUseProgram(shaderProgram);
    glUniform1i(glGetUniformLocation(shaderProgram, "videoTexture"), 0);

    // Draw fullscreen quad
    glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);

    // Read back to output
    glReadPixels(
        0, 0,
        output->width, output->height,
        GL_BGRA,
        GL_UNSIGNED_BYTE,
        output->data);

    SetHostContext();

    return err;
}
```

**Global Setup with GPU Initialization:**

```cpp
static PF_Err GlobalSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    // Set flags
    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE;
    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE;

    // Initialize OpenGL resources
    err = InitOpenGL();
    if (!err) {
        // Generate textures
        glGenTextures(1, &inputTexture);
        glGenTextures(1, &reflectionTexture);

        // Configure texture parameters
        glBindTexture(GL_TEXTURE_2D, inputTexture);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    }

    return err;
}
```

---

## AEGP Samples Analysis

### Artie Sample - 3D Rendering Artisan

The **Artie** sample demonstrates creating a custom 3D renderer that takes over layer rendering from After Effects. Artisans appear in the Composition Settings' 3D Renderer tab.

**Key Demonstrated Concepts:**
- Artisan registration
- 3D layer rendering takeover
- Camera and light access
- Render opacity and z-depth handling

**Registration Pattern:**

```cpp
A_Err GPMain(
    struct SPBasicSuite     *pica_basicP,
    A_long                  major_versionL,
    A_long                  minor_versionL,
    AEGP_PluginID           aegp_plugin_id,
    AEGP_GlobalRefcon       *global_refconP)
{
    A_Err err = A_Err_NONE;

    // Register as Artisan
    AEGP_SuiteHandler suites(pica_basicP);

    AEGP_ArtisanInfo info;
    info.version = AEGP_ARTISAN_VERSION;
    info.refcon = (AEGP_ArtisanRefcon)my_refcon;
    info.pre_render_func = PreRender;
    info.render_func = Render;
    info.post_render_func = PostRender;

    ERR(suites.RegisterSuite5()->AEGP_RegisterArtisan(
        aegp_plugin_id,
        "Artie",                    // Name
        "ADBE Artie",               // Match name
        &info,
        &artisan_id));

    return err;
}
```

---

### Easy Cheese Sample - Keyframe Manipulation

The **Easy Cheese** sample demonstrates how to manipulate keyframe characteristics, appearing in After Effects' Keyframe Assistants menu.

**Key Demonstrated Concepts:**
- Menu command registration and handling
- Keyframe access and modification
- Stream property manipulation
- Temporal easing adjustment

**Menu Command Registration:**

```cpp
A_Err EntryPoint(
    struct SPBasicSuite     *pica_basicP,
    A_long                  major_versionL,
    A_long                  minor_versionL,
    AEGP_PluginID           aegp_plugin_id,
    AEGP_GlobalRefcon       *global_refconP)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pica_basicP);

    // Get unique command ID
    ERR(suites.CommandSuite1()->AEGP_GetUniqueCommand(&S_Easy_Cheese_cmd));

    // Insert into Keyframe Assistants menu
    ERR(suites.CommandSuite1()->AEGP_InsertMenuCommand(
        S_Easy_Cheese_cmd,
        "Easy Cheese",
        AEGP_Menu_KF_ASSIST,
        AEGP_MENU_INSERT_SORTED));

    // Register command handler
    ERR(suites.RegisterSuite5()->AEGP_RegisterCommandHook(
        aegp_plugin_id,
        AEGP_HP_BeforeAE,
        S_Easy_Cheese_cmd,
        CommandHook,
        NULL));

    // Register menu update handler
    ERR(suites.RegisterSuite5()->AEGP_RegisterUpdateMenuHook(
        aegp_plugin_id,
        UpdateMenuHook,
        NULL));

    return err;
}
```

**Menu Update Hook Pattern:**

```cpp
static A_Err UpdateMenuHook(
    AEGP_GlobalRefcon       plugin_refconP,
    AEGP_UpdateMenuRefcon   refconP,
    AEGP_WindowType         active_window)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(S_sp_basic_P);
    AEGP_ItemH item = NULL;
    AEGP_ItemType type;

    // Get active item
    ERR(suites.ItemSuite6()->AEGP_GetActiveItem(&item));

    if (item) {
        ERR(suites.ItemSuite6()->AEGP_GetItemType(item, &type));

        // Enable only for compositions
        if (type == AEGP_ItemType_COMP) {
            ERR(suites.CommandSuite1()->AEGP_EnableCommand(S_Easy_Cheese_cmd));
        } else {
            ERR(suites.CommandSuite1()->AEGP_DisableCommand(S_Easy_Cheese_cmd));
        }
    }

    return err;
}
```

**Keyframe Manipulation Pattern:**

```cpp
static A_Err ProcessKeyframes(
    AEGP_LayerH layer)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(S_sp_basic_P);
    AEGP_StreamRefH stream = NULL;

    // Get position stream
    ERR(suites.StreamSuite2()->AEGP_GetNewLayerStream(
        S_my_id,
        layer,
        AEGP_LayerStream_POSITION,
        &stream));

    if (stream) {
        A_long num_keyframes;
        ERR(suites.KeyframeSuite3()->AEGP_GetStreamNumKFs(stream, &num_keyframes));

        for (A_long i = 0; i < num_keyframes; i++) {
            // Get keyframe time
            A_Time time;
            ERR(suites.KeyframeSuite3()->AEGP_GetKeyframeTime(stream, i, &time));

            // Set temporal easing
            AEGP_KeyframeEase ease_in, ease_out;
            ease_in.speedF = 0.0;
            ease_in.influenceF = 33.3;
            ease_out.speedF = 0.0;
            ease_out.influenceF = 33.3;

            ERR(suites.KeyframeSuite3()->AEGP_SetKeyframeTemporalEase(
                stream,
                i,
                0,  // Dimension
                &ease_in,
                &ease_out));

            // Set interpolation type
            ERR(suites.KeyframeSuite3()->AEGP_SetKeyframeInterpolation(
                stream,
                i,
                AEGP_KeyInterp_BEZIER,
                AEGP_KeyInterp_BEZIER));
        }

        ERR(suites.StreamSuite2()->AEGP_DisposeStream(stream));
    }

    return err;
}
```

---

### Panelator Sample - Panel Creation

The **Panelator** sample demonstrates creating custom dockable panels within After Effects' interface.

**Key Demonstrated Concepts:**
- Panel registration with CreatePanelHook
- Platform-specific UI implementation
- Flyout menu population
- Panel resizing and snap sizes

**Panel Registration Pattern:**

```cpp
Panelator::Panelator(
    SPBasicSuite            *i_pica_basicP,
    AEGP_PluginID           i_pluginID,
    AEGP_Command            i_command,
    const A_char            *i_match_nameZ)
{
    // Register panel creation hook
    PT_ETX(i_pica_basicP->AcquireSuite(
        kAEGPPanelSuite,
        kAEGPPanelSuiteVersion1,
        (const void**)&panelSuite));

    PT_ETX(panelSuite->AEGP_RegisterCreatePanelHook(
        i_pluginID,
        i_match_nameZ,
        &Panelator::S_CreatePanelHook,
        (AEGP_CreatePanelRefcon)this,
        true));  // Bring to front
}
```

**Create Panel Hook Pattern:**

```cpp
static A_Err S_CreatePanelHook(
    AEGP_GlobalRefcon       refconP,
    AEGP_CreatePanelRefcon  panel_refconP,
    AEGP_PanelH             panelH,
    AEGP_PlatformViewRef    container,
    AEGP_PanelIdleRefcon    idle_refconP,
    AEGP_PanelFunctions1    *outFunctionTable)
{
    A_Err err = A_Err_NONE;

    try {
        // Create platform-specific UI
        *outRefcon = reinterpret_cast<AEGP_PanelRefcon>(
            new PanelatorUI_Plat(
                S_pica_basicP,
                panelH,
                container,
                outFunctionTable));

        // Fill function table
        outFunctionTable->DoFlyoutCommand = DoFlyoutCommand;
        outFunctionTable->GetSnapSizes = GetSnapSizes;
        outFunctionTable->PopulateFlyout = PopulateFlyout;
    }
    catch (...) {
        err = A_Err_ALLOC;
    }

    return err;
}
```

---

## AEIO Samples Analysis

### IO Sample - .fak Format Handler

The **IO** sample handles a fictitious .fak file format, demonstrating the complete AEIO workflow for file import and export.

**Key Demonstrated Concepts:**
- AEIO registration and function block setup
- Import specification handling
- Export frame writing
- Format options dialogs

**AEIO Registration Pattern:**

```cpp
A_Err GPMain(
    struct SPBasicSuite     *pica_basicP,
    A_long                  major_versionL,
    A_long                  minor_versionL,
    AEGP_PluginID           aegp_plugin_id,
    AEGP_GlobalRefcon       *global_refconP)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pica_basicP);

    // Fill module info
    AEIO_ModuleInfo info;
    info.sig = 'FAK_';
    info.max_width = 4096;
    info.max_height = 4096;
    info.num_filetypes = 1;
    info.num_extensions = 1;
    info.num_clips = 0;

    info.create_kind.type = 'FAK_';
    info.create_kind.creator = 'FAK_';
    strcpy(info.name, "FAK Format");
    info.flags = AEIO_MFlag_INPUT |
                 AEIO_MFlag_OUTPUT |
                 AEIO_MFlag_FILE;

    info.read_kinds[0].type = 'FAK_';
    info.read_kinds[0].creator = 'FAK_';
    info.file_types[0] = 'FAK_';
    strcpy(info.extensions[0], "fak");

    // Fill function block
    AEIO_FunctionBlock funcs;
    funcs.AEIO_InitInSpecFromFile = InitInSpecFromFile;
    funcs.AEIO_DrawSparseFrame = DrawSparseFrame;
    funcs.AEIO_GetInSpecInfo = GetInSpecInfo;
    funcs.AEIO_InitOutputSpec = InitOutputSpec;
    funcs.AEIO_GetFlatOutputOptions = GetFlatOutputOptions;
    funcs.AEIO_SetOutputFile = SetOutputFile;
    funcs.AEIO_StartAdding = StartAdding;
    funcs.AEIO_AddFrame = AddFrame;
    funcs.AEIO_EndAdding = EndAdding;

    // Register
    ERR(suites.RegisterSuite5()->AEGP_RegisterIO(
        aegp_plugin_id,
        &info,
        &funcs,
        &io_id));

    return err;
}
```

---

### FBIO Sample - Frame-Based Format

The **FBIO** sample supports frame-based .ffk format files (like TIFF or TGA sequences), demonstrating simpler single-frame import/export.

**Key Differences from IO:**
- Handles single frames rather than video sequences
- Uses simpler import specification
- Better starting point for image format handlers

**Frame Drawing Pattern:**

```cpp
static A_Err DrawSparseFrame(
    AEIO_BasicData          *basic_dataP,
    AEIO_InSpecH            specH,
    const AEIO_DrawFramePB  *optionsPB,
    PF_EffectWorld          *wP,
    AEIO_DrawingFlags       *draw_flagsP)
{
    A_Err err = A_Err_NONE;

    // Get file path from spec
    A_PathType path[AEGP_MAX_PATH_SIZE];
    ERR(basic_dataP->inSuite->AEGP_GetInSpecFilePath(specH, path));

    // Read file using platform APIs
    FILE *file = fopen(path, "rb");
    if (file) {
        // Parse header
        FFKHeader header;
        fread(&header, sizeof(header), 1, file);

        // Read pixel data
        A_long row;
        for (row = 0; row < header.height; row++) {
            PF_Pixel *pixel = (PF_Pixel*)
                ((char*)wP->data + row * wP->rowbytes);

            fread(pixel, sizeof(PF_Pixel) * header.width, 1, file);
        }

        fclose(file);
    }

    return err;
}
```

---

## Code Pattern Extraction

### Common Initialization Patterns

**Standard Effect GlobalSetup:**

```cpp
static PF_Err GlobalSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    // Set version
    out_data->my_version = PF_VERSION(
        MAJOR_VERSION, MINOR_VERSION,
        BUG_VERSION, STAGE_VERSION, BUILD_VERSION);

    // Set capability flags
    out_data->out_flags =
        PF_OutFlag_DEEP_COLOR_AWARE |
        PF_OutFlag_PIX_INDEPENDENT |
        PF_OutFlag_SEQUENCE_DATA_NEEDS_FLATTENING;

    out_data->out_flags2 =
        PF_OutFlag2_SUPPORTS_SMART_RENDER |
        PF_OutFlag2_FLOAT_COLOR_AWARE |
        PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    // Allocate global data if needed
    out_data->global_data = PF_NEW_HANDLE(sizeof(MyGlobalData));
    if (out_data->global_data) {
        MyGlobalData *global = (MyGlobalData*)
            PF_LOCK_HANDLE(out_data->global_data);

        // Initialize global state
        global->initialized = TRUE;
        global->cache_valid = FALSE;

        PF_UNLOCK_HANDLE(out_data->global_data);
    }

    return err;
}
```

### Error Handling Patterns

**ERR Macro Pattern (from all samples):**

```cpp
// Standard error propagation
#define ERR(FUNC) do { \
    err = (FUNC); \
    if (err) goto bail; \
} while (0)

// Secondary error (preserves first error)
#define ERR2(FUNC) do { \
    A_Err err2 = (FUNC); \
    if (!err) err = err2; \
} while (0)

// Usage in function
PF_Err MyFunction(/* params */)
{
    PF_Err err = PF_Err_NONE;
    PF_Handle handle = NULL;

    ERR(FirstOperation());
    ERR(SecondOperation());

    // Allocate resource
    handle = PF_NEW_HANDLE(size);
    if (!handle) {
        err = PF_Err_OUT_OF_MEMORY;
        goto bail;
    }

    ERR(UseResource(handle));

bail:
    // Cleanup always runs
    if (handle) {
        ERR2(PF_DISPOSE_HANDLE(handle));
    }

    return err;
}
```

### Memory Management Patterns

**Handle Suite Usage:**

```cpp
// Allocate
PF_Handle h = PF_NEW_HANDLE(sizeof(MyData));
if (!h) return PF_Err_OUT_OF_MEMORY;

// Lock for access
MyData *data = (MyData*)PF_LOCK_HANDLE(h);
data->value = 42;
PF_UNLOCK_HANDLE(h);

// Get size
A_long size;
ERR(suites.HandleSuite1()->host_get_handle_size(h, &size));

// Resize
ERR(suites.HandleSuite1()->host_resize_handle(
    sizeof(MyData) * 2, &h));  // Note: handle may change!

// Dispose
PF_DISPOSE_HANDLE(h);
```

### Parameter Setup Patterns

**Complete Parameter Registration:**

```cpp
static PF_Err ParamsSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;
    PF_ParamDef def;

    // CRITICAL: Always clear before use
    AEFX_CLR_STRUCT(def);

    // Float slider
    PF_ADD_FLOAT_SLIDERX(
        "Amount",
        0.0, 100.0,     // Valid range
        0.0, 100.0,     // Slider range
        50.0,           // Default
        PF_Precision_TENTHS,
        0,              // Display flags
        PF_ParamFlag_SUPERVISE,  // Get notifications
        DISK_ID_AMOUNT);

    AEFX_CLR_STRUCT(def);

    // Layer parameter
    PF_ADD_LAYER(
        "Source Layer",
        PF_LayerDefault_MYSELF,
        DISK_ID_LAYER);

    AEFX_CLR_STRUCT(def);

    // Color with eyedropper
    PF_ADD_COLOR(
        "Tint Color",
        255, 128, 0,    // Default RGB
        DISK_ID_COLOR);

    AEFX_CLR_STRUCT(def);

    // Popup menu
    PF_ADD_POPUP(
        "Mode",
        3,              // Num choices
        1,              // Default
        "Normal|Multiply|Screen",
        DISK_ID_MODE);

    // Set total count
    out_data->num_params = PARAM_COUNT;

    return err;
}
```

---

## Build System Configuration

### Environment Variables

| Variable | Platform | Purpose |
|----------|----------|---------|
| `AE_PLUGIN_BUILD_DIR` | Windows | Output directory for built plugins |

### Visual Studio Configuration

```
Project Properties > Configuration Properties:
  - Debugging > Command: Path to AfterFX.exe
  - Debugging > Command Arguments: (empty or project file)
  - Build Events > Post-Build: Copy to plugin folder
```

### Xcode Configuration

```
File > Project Settings > Advanced:
  - Build Location: Custom: Absolute
  - Path: ~/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/
```

### CMake Integration

For projects using CMake:

```bash
mkdir build && cd build
cmake -GXcode ..
open MyPlugin.xcodeproj
```

---

## Project File Structure

### Standard Effect Plugin Structure

```
MyEffect/
+-- MyEffect.cpp           # Main source
+-- MyEffect.h             # Header with declarations
+-- MyEffect.r             # PiPL resource file (cross-platform)
+-- MyEffectPiPL.rc        # Windows resource (generated)
+-- Win/
|   +-- MyEffect.vcxproj   # Visual Studio project
+-- Mac/
|   +-- MyEffect.xcodeproj # Xcode project
+-- Headers/
    +-- AE_Effect.h        # SDK headers (symlinked)
```

### AEGP Plugin Structure

```
MyAEGP/
+-- MyAEGP.cpp             # Main source with entry point
+-- MyAEGP.h               # Declarations
+-- MyAEGP.r               # PiPL resource
+-- MyAEGPUI.cpp           # UI implementation (optional)
+-- MyAEGPUI.h
```

---

## Best Practices from Samples

### From Official Documentation

1. **Base development on existing samples** - "Base your development on an existing sample plug-in and the build step will be correctly implemented."

2. **Always clear PF_ParamDef** - Use `AEFX_CLR_STRUCT(def)` before every parameter registration.

3. **Check all return values** - Every SDK function can fail; propagate errors appropriately.

4. **Handle platform differences** - Check `in_data->appl_id` for host-specific behavior.

5. **Use Adobe's allocation functions** - For significant allocations, use After Effects' memory management to enable proper cache behavior.

### From Sample Analysis

1. **Suite acquisition pattern** - Conditionally acquire suites and check for availability before use.

2. **Resource checkout/checkin** - Always checkin resources even on error paths using ERR2 pattern.

3. **Context save/restore** - When using OpenGL or other external APIs, save and restore the host context.

4. **Static wrapper pattern** - Use static member functions as bridges from C callbacks to C++ instance methods.

5. **Separation of concerns** - Keep platform-specific UI code separate from core logic.

---

## Related Documentation

### Wave 1 Documents

- [[01-sdk-overview]] - SDK installation and architecture
- [[02-effect-plugins]] - Complete effect plugin reference
- [[03-aegp-plugins]] - AEGP plugin development
- [[05-artisan-blithook-plugins]] - 3D rendering and output plugins

### Wave 2 Documents

- [[01-smartfx-advanced]] - Advanced SmartFX patterns
- [[02-multi-frame-rendering]] - Thread-safe rendering
- [[03-gpu-rendering]] - GPU acceleration patterns
- [[04-custom-ui-deep-dive]] - UI development patterns

### External Resources

- [After Effects C++ SDK Guide - Sample Projects](https://ae-plugins.docsforadobe.dev/intro/sample-projects/)
- [GitHub SDK Examples Repository](https://github.com/KAndQ/AEPlugins)
- [Adobe Developer Portal](https://developer.adobe.com/after-effects/)
- [Vulkanator - Modern GPU Example](https://github.com/Wunkolo/Vulkanator)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial comprehensive sample analysis from official SDK sources |

---

*This documentation was compiled from official Adobe After Effects SDK sample projects and documentation including ae-plugins.docsforadobe.dev and GitHub SDK repositories.*
