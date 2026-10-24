---
source: '[unknown - 04-aeio-plugins.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Adobe After Effects SDK: AEIO Plugins Documentation

## Executive Summary

AEIO (After Effects Input/Output) plugins are specialized AEGP plugins that handle media file import and export operations. Unlike standard effect plugins that process existing footage, AEIOs serve as the bridge between external media formats and After Effects' internal representation, providing complete control over how files are read, interpreted, and written.

This comprehensive documentation covers the AEIO architecture, registration process, function signatures, data structures, import/export workflows, and implementation best practices for developers building custom media format support.

---

## Table of Contents

1. [What Are AEIOs?](#what-are-aeios)
2. [AEIO vs. Alternatives](#aeio-vs-alternatives)
3. [Registration Process](#registration-process)
4. [AEIO_ModuleInfo Structure](#aeio_moduleinfo-structure)
5. [AEIO_ModuleFlags Reference](#aeio_moduleflags-reference)
6. [AEIO_ModuleFlags2 Reference](#aeio_moduleflags2-reference)
7. [AEIO_FunctionBlock Architecture](#aeio_functionblock-architecture)
8. [Input Functions](#input-functions)
9. [Output Functions](#output-functions)
10. [Audio Handling Functions](#audio-handling-functions)
11. [AEGP_IOInSuite5 Reference](#aegp_ioinsuite5-reference)
12. [AEGP_IOOutSuite4 Reference](#aegp_iooutsuite4-reference)
13. [Import Workflow](#import-workflow)
14. [Export Workflow](#export-workflow)
15. [Implementation Details](#implementation-details)
16. [Data Storage Architecture](#data-storage-architecture)
17. [Bit Depth Handling](#bit-depth-handling)
18. [Error Handling](#error-handling)
19. [Code Examples](#code-examples)
20. [Best Practices](#best-practices)

---

## What Are AEIOs?

AEIOs are specialized AEGP (After Effects General Plug-ins) that handle media file import and export. According to Adobe's documentation, "AEIOs do everything for a file of a given type that After Effects (or the plug-ins which ship with After Effects) would normally do."

### Core Capabilities

**Import Functions:**
- Open existing media files
- Manage file-specific interpretation settings
- Provide audio via `AEGP_SoundWorld` format
- Deliver video frames in `PF_EffectWorld` format
- Create files interactively with user-defined settings

**Export Functions:**
- Create and manage output options for render queue items
- Generate output files
- Save frames provided by After Effects into those files

### Supported Pixel Formats

AEIOs work with uncompressed video featuring ARGB pixel ordering. Supported bit depths include:

| Bit Depth | Description |
|-----------|-------------|
| 8-bit per channel | Standard 8bpc footage |
| 16-bit per channel | High bit depth footage |
| 32-bit float per channel | HDR/linear light footage |

**Important:** AEIOs must independently handle any codec compression/decompression. After Effects provides uncompressed pixel data; the AEIO is responsible for encoding/decoding.

---

## AEIO vs. Alternatives

### AEIO vs. Standard AEGP

| Aspect | AEIO | Standard AEGP |
|--------|------|---------------|
| Primary Purpose | Media file I/O | General automation/effects |
| Data Handling | Provides pixels and audio data | Manipulates project/timeline |
| Use Case | Custom file format support | Timeline importers, project automation |
| Registration | AEIO_ModuleInfo + AEIO_FunctionBlock | Standard AEGP hooks |

**Recommendation:** AEGPs are better suited for timeline or project format importers where you need to manipulate the project structure. AEIOs are for media file formats.

### AEIO vs. MediaCore Importer

| Aspect | AEIO | MediaCore Importer |
|--------|------|-------------------|
| Priority System | Single handler per format | Multiple importers can compete |
| Override Capability | Cannot override built-in formats | Can override existing importers |
| Cross-Application | After Effects only | Premiere Pro, Media Encoder, etc. |
| Complexity | Moderate | Higher |

**Recommendation:** If you need to override existing After Effects importers or support multiple Adobe applications, MediaCore is preferable. For After Effects-specific custom formats, AEIO is simpler.

---

## Registration Process

During the plug-in's entry point, developers must complete three steps:

### Step 1: Populate AEIO_ModuleInfo

```c
AEIO_ModuleInfo info;
memset(&info, 0, sizeof(AEIO_ModuleInfo));

info.sig = 'MYIO';                    // Unique 4-char identifier
info.name = "My Custom Format";       // Display name
info.flags = AEIO_MFlag_INPUT | AEIO_MFlag_OUTPUT | AEIO_MFlag_VIDEO;
info.flags2 = AEIO_MFlag2_CAN_DRAW_FLOAT;
info.max_width = 8192;
info.max_height = 8192;
info.num_filetypes = 1;
info.num_extensions = 1;
```

### Step 2: Create AEIO_FunctionBlock

```c
AEIO_FunctionBlock4 funcs;
memset(&funcs, 0, sizeof(AEIO_FunctionBlock4));

funcs.AEIO_InitInSpecFromFile = MyInitInSpecFromFile;
funcs.AEIO_DisposeInSpec = MyDisposeInSpec;
funcs.AEIO_DrawSparseFrame = MyDrawSparseFrame;
// ... additional function pointers
```

### Step 3: Call AEGP_RegisterIO

```c
AEGP_RegisterSuites5 *regSuiteP;
suites.PicaSuite()->AcquireSuite(
    kAEGPRegisterSuite,
    kAEGPRegisterSuiteVersion5,
    (const void**)&regSuiteP);

regSuiteP->AEGP_RegisterIO(
    my_plugin_id,
    basic_dataP,
    &info,
    &funcs);
```

---

## AEIO_ModuleInfo Structure

The `AEIO_ModuleInfo` structure defines essential properties for AEIO plug-ins:

### Structure Definition

```c
typedef struct {
    A_long              sig;              // Unique 4-char identifier
    A_char              name[AEGP_MAX_TYPE_NAME_LEN];  // Display name
    AEIO_ModuleFlags    flags;            // Behavior flags
    AEIO_ModuleFlags2   flags2;           // Extended behavior flags
    A_long              max_width;        // Maximum supported width
    A_long              max_height;       // Maximum supported height
    A_long              num_filetypes;    // Count of file types
    A_long              num_extensions;   // Count of extensions
    A_long              num_clips;        // Clipboard format count
    A_long              create_kind;      // macOS 4-char code for output
    A_char              create_ext[AEGP_MAX_TYPE_NAME_LEN];  // Output extension
    AEIO_FileKind       read_kinds[AEIO_MAX_READ_KINDS];    // Up to 16 file kinds
    A_long              num_aux_extensions;  // Auxiliary extension count
    AEIO_ExtString      aux_ext[AEIO_MAX_AUX_EXTENSIONS];   // Aux extensions
} AEIO_ModuleInfo;
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `sig` | A_long | Unique four-character code identifying your plugin (e.g., 'MYIO') |
| `name` | A_char[] | Human-readable plugin name for display in dialogs |
| `flags` | AEIO_ModuleFlags | Primary behavior and capability flags |
| `flags2` | AEIO_ModuleFlags2 | Extended capability flags |
| `max_width` | A_long | Maximum supported image width in pixels |
| `max_height` | A_long | Maximum supported image height in pixels |
| `num_filetypes` | A_long | Number of file types supported (macOS file kinds) |
| `num_extensions` | A_long | Number of file extensions registered |
| `num_clips` | A_long | Number of clipboard formats supported |
| `create_kind` | A_long | macOS four-character code for created files |
| `create_ext` | A_char[] | Default file extension for output files |
| `read_kinds` | AEIO_FileKind[] | Array of up to 16 supported file kinds |
| `num_aux_extensions` | A_long | Number of auxiliary file extensions |
| `aux_ext` | AEIO_ExtString[] | Associated/auxiliary file extensions |

---

## AEIO_ModuleFlags Reference

The `AEIO_ModuleFlags` enumeration controls primary AEIO behavior:

### Input Capability Flags

| Flag | Value | Description |
|------|-------|-------------|
| `AEIO_MFlag_INPUT` | 0x1 | Plugin can import files |
| `AEIO_MFlag_NO_TIME` | 0x2 | Footage has no temporal component (still image) |
| `AEIO_MFlag_INTERACTIVE_GET` | 0x4 | Import requires user interaction |
| `AEIO_MFlag_CANT_CLIP` | 0x8 | Cannot render sub-regions of frames |
| `AEIO_MFlag_HOST_DEPTH_DIALOG` | 0x10 | Use AE's depth dialog for import |
| `AEIO_MFlag_HOST_FRAME_START_DIALOG` | 0x20 | Use AE's frame start dialog |
| `AEIO_MFlag_SEQUENCE_OPTIONS_OK` | 0x40 | Supports sequence import options |
| `AEIO_MFlag_INPUT_OPTIONS` | 0x80 | Has custom input options dialog |
| `AEIO_MFlag_HSF_AWARE` | 0x100 | Handles horizontal scale factor (pixel aspect) |
| `AEIO_MFlag_HAS_LAYERS` | 0x200 | File format contains layers |
| `AEIO_MFlag_SCRAP` | 0x400 | Supports clipboard operations |
| `AEIO_MFlag_NO_UI` | 0x800 | Plugin has no user interface |
| `AEIO_MFlag_SEQ_OPTIONS_DLG` | 0x1000 | Has sequence options dialog |
| `AEIO_MFlag_HAS_AUX_DATA` | 0x2000 | File has auxiliary data channels |
| `AEIO_MFlag_CAN_DRAW_DEEP` | 0x4000 | Can render 16bpc frames |
| `AEIO_MFlag_FILE` | 0x8000 | Works with file-based media |

### Output Capability Flags

| Flag | Value | Description |
|------|-------|-------------|
| `AEIO_MFlag_OUTPUT` | 0x10000 | Plugin can export files |
| `AEIO_MFlag_STILL` | 0x20000 | Supports still image output |
| `AEIO_MFlag_VIDEO` | 0x40000 | Supports video output |
| `AEIO_MFlag_AUDIO` | 0x80000 | Supports audio output |
| `AEIO_MFlag_INTERACTIVE_PUT` | 0x100000 | Export requires user interaction |
| `AEIO_MFlag_MUST_INTERACT_PUT` | 0x200000 | Export always requires interaction |
| `AEIO_MFlag_CANT_SOUND_INTERLEAVE` | 0x400000 | Cannot interleave audio in output |
| `AEIO_MFlag_CAN_ADD_FRAMES_NON_LINEAR` | 0x800000 | Supports non-linear frame addition |
| `AEIO_MFlag_NO_OPTIONS` | 0x1000000 | Has no output options |
| `AEIO_MFlag_HAS_META_DATA` | 0x2000000 | Can read/write metadata |
| `AEIO_MFlag_CAN_DO_MARKERS` | 0x4000000 | Supports chapter/marker export |

---

## AEIO_ModuleFlags2 Reference

The `AEIO_ModuleFlags2` enumeration provides extended capabilities:

| Flag | Value | Description |
|------|-------|-------------|
| `AEIO_MFlag2_AUDIO_OPTIONS` | 0x1 | Has audio-specific output options |
| `AEIO_MFlag2_SEND_ADDMARKER_BEFORE_ADDFRAME` | 0x2 | Receive markers before frames |
| `AEIO_MFlag2_CAN_DO_MARKERS_2` | 0x4 | Extended marker support (v2) |
| `AEIO_MFlag2_CAN_DRAW_FLOAT` | 0x8 | Can render 32bpc float frames |
| `AEIO_MFlag2_CAN_DO_AUDIO_32` | 0x10 | Supports 32-bit audio samples |
| `AEIO_MFlag2_SUPPORTS_ICC_PROFILES` | 0x20 | Supports embedded ICC color profiles |
| `AEIO_MFlag2_CAN_DO_MARKERS_3` | 0x40 | Extended marker support (v3) |
| `AEIO_MFlag2_SEND_ADDMARKER_BEFORE_STARTADDING` | 0x80 | Receive markers before StartAdding |
| `AEIO_MFlag2_USES_QUICKTIME` | 0x100 | Plugin uses QuickTime framework |

---

## AEIO_FunctionBlock Architecture

The `AEIO_FunctionBlock4` structure contains function pointers for all AEIO operations:

```c
typedef struct {
    // Input functions
    AEIO_InitInSpecFromFile_Func        AEIO_InitInSpecFromFile;
    AEIO_InitInSpecInteractive_Func     AEIO_InitInSpecInteractive;
    AEIO_DisposeInSpec_Func             AEIO_DisposeInSpec;
    AEIO_FlattenOptions_Func            AEIO_FlattenOptions;
    AEIO_InflateOptions_Func            AEIO_InflateOptions;
    AEIO_SynchInSpec_Func               AEIO_SynchInSpec;
    AEIO_GetActiveExtent_Func           AEIO_GetActiveExtent;
    AEIO_GetInSpecInfo_Func             AEIO_GetInSpecInfo;
    AEIO_DrawSparseFrame_Func           AEIO_DrawSparseFrame;
    AEIO_GetDimensions_Func             AEIO_GetDimensions;
    AEIO_GetDuration_Func               AEIO_GetDuration;
    AEIO_GetTime_Func                   AEIO_GetTime;
    AEIO_GetSound_Func                  AEIO_GetSound;
    AEIO_InqNextFrameTime_Func          AEIO_InqNextFrameTime;
    AEIO_InitOutputSpec_Func            AEIO_InitOutputSpec;
    AEIO_GetFlatOutputOptions_Func      AEIO_GetFlatOutputOptions;
    AEIO_SetOutputFile_Func             AEIO_SetOutputFile;
    AEIO_StartAdding_Func               AEIO_StartAdding;
    AEIO_AddFrame_Func                  AEIO_AddFrame;
    AEIO_EndAdding_Func                 AEIO_EndAdding;
    AEIO_OutputFrame_Func               AEIO_OutputFrame;
    AEIO_WriteLabels_Func               AEIO_WriteLabels;
    AEIO_GetSizes_Func                  AEIO_GetSizes;
    AEIO_Flush_Func                     AEIO_Flush;
    AEIO_AddSoundChunk_Func             AEIO_AddSoundChunk;
    AEIO_Idle_Func                      AEIO_Idle;
    AEIO_GetDepths_Func                 AEIO_GetDepths;
    AEIO_GetOutputInfo_Func             AEIO_GetOutputInfo;
    AEIO_UserOptionsDialog_Func         AEIO_UserOptionsDialog;
    AEIO_GetOutputSuffix_Func           AEIO_GetOutputSuffix;
    AEIO_SeqOptionsDlg_Func             AEIO_SeqOptionsDlg;
    AEIO_CloseSourceFiles_Func          AEIO_CloseSourceFiles;
    AEIO_CountUserData_Func             AEIO_CountUserData;
    AEIO_SetUserData_Func               AEIO_SetUserData;
    AEIO_GetUserData_Func               AEIO_GetUserData;
    AEIO_AddMarker_Func                 AEIO_AddMarker;
    AEIO_VerifyFileImportable_Func      AEIO_VerifyFileImportable;
    AEIO_UserAudioOptionsDialog_Func    AEIO_UserAudioOptionsDialog;
    AEIO_AddMarker2_Func                AEIO_AddMarker2;
    AEIO_AddMarker3_Func                AEIO_AddMarker3;
} AEIO_FunctionBlock4;
```

### Required vs. Optional Functions

**Minimum Required for Video Input:**
- `AEIO_InitInSpecFromFile` (or `AEIO_InitInSpecInteractive`)
- `AEIO_DisposeInSpec`
- `AEIO_GetInSpecInfo`
- `AEIO_DrawSparseFrame`
- `AEIO_CloseSourceFiles`
- `AEIO_InqNextFrameTime`

**Minimum Required for Video Output:**
- `AEIO_InitOutputSpec`
- `AEIO_GetFlatOutputOptions`
- `AEIO_StartAdding`
- `AEIO_AddFrame` (or `AEIO_OutputFrame` for stills)
- `AEIO_EndAdding`
- `AEIO_GetDepths`

---

## Input Functions

### AEIO_InitInSpecFromFile

Initializes an input specification from a file path.

```c
A_Err AEIO_InitInSpecFromFile(
    AEIO_BasicData      *basic_dataP,
    const A_UTF16Char   *file_pathZ,
    AEIO_InSpecH        inH
);
```

**Parameters:**
- `basic_dataP`: Pointer to AEIO basic data structure
- `file_pathZ`: UTF-16 encoded, NULL-terminated file path
- `inH`: Input specification handle to populate

**Purpose:** Parse the file and describe its contents to After Effects. Use `AEGP_IOInSuite5` functions to set image depth, dimensions, alpha interpretation, audio channels, and sample rate.

**Example:**
```c
A_Err MyInitInSpecFromFile(
    AEIO_BasicData      *basic_dataP,
    const A_UTF16Char   *file_pathZ,
    AEIO_InSpecH        inH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Open and parse the file
    MyFileHeader header;
    err = ParseMyFile(file_pathZ, &header);

    if (!err) {
        // Set dimensions
        suites.IOInSuite()->AEGP_SetInSpecDimensions(
            inH, header.width, header.height);

        // Set bit depth
        suites.IOInSuite()->AEGP_SetInSpecDepth(
            inH, header.bitDepth);

        // Set duration
        A_Time duration;
        duration.value = header.numFrames;
        duration.scale = header.frameRate;
        suites.IOInSuite()->AEGP_SetInSpecDuration(inH, &duration);

        // Set frame rate
        A_Ratio fps;
        fps.num = header.frameRate;
        fps.den = 1;
        suites.IOInSuite()->AEGP_SetInSpecNativeFPS(inH, fps);
    }

    return err;
}
```

---

### AEIO_InitInSpecInteractive

Creates media specifications through user interaction rather than file import.

```c
A_Err AEIO_InitInSpecInteractive(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH
);
```

**Purpose:** Used for generating synthetic media or when user input is needed to define the source. Present a dialog and populate the inH based on user choices.

---

### AEIO_DisposeInSpec

Deallocates an input specification.

```c
A_Err AEIO_DisposeInSpec(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH
);
```

**Purpose:** Free any memory or resources associated with the input specification. This is called when footage is removed from the project.

---

### AEIO_DrawSparseFrame

Renders a frame from the source footage.

```c
A_Err AEIO_DrawSparseFrame(
    AEIO_BasicData          *basic_dataP,
    AEIO_InSpecH            inH,
    AEIO_Quality            qual,
    const AEIO_RationalScale *rs0,
    const A_Time            *tr,
    const A_Time            *duration0,
    const A_Rect            *required_region0,
    PF_EffectWorld          *wP,
    A_long                  *originx,
    A_long                  *originy,
    AEIO_DrawingFlags       *draw_flagsP
);
```

**Parameters:**
- `basic_dataP`: Basic AEIO data
- `inH`: Input specification handle
- `qual`: Requested quality level
- `rs0`: Rational scale factor (for resolution reduction)
- `tr`: Time of requested frame
- `duration0`: Duration of frame
- `required_region0`: Sub-region to render (NULL = full frame)
- `wP`: Pre-allocated PF_EffectWorld to fill with pixels
- `originx/originy`: Origin offset for sub-region rendering
- `draw_flagsP`: Output flags indicating what was drawn

**Important:** Return data as linear light (1.0 gamma), and After Effects will perform any necessary transformations.

---

### AEIO_GetInSpecInfo

Provides descriptive strings for the Project panel.

```c
A_Err AEIO_GetInSpecInfo(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    AEIO_Verbiage   *verbiageP
);
```

**Warning:** This function is called frequently (every time the Project panel refreshes). Minimize allocations and check for valid optionsH before using.

**Example:**
```c
A_Err MyGetInSpecInfo(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    AEIO_Verbiage   *verbiageP)
{
    strcpy(verbiageP->name, "MyFormat Video");
    strcpy(verbiageP->type, "MyFormat");
    sprintf(verbiageP->sub_type, "%dx%d, %d fps",
            width, height, frameRate);
    return A_Err_NONE;
}
```

---

### AEIO_InqNextFrameTime

Locates the next frame time within the source footage's native timebase.

```c
A_Err AEIO_InqNextFrameTime(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    const A_Time    *base_time_tr,
    AEIO_TimeDir    time_dir,
    A_Boolean       *found0,
    A_Time          *key_time_tr0
);
```

**Parameters:**
- `time_dir`: Direction to search (forward or backward)
- `found0`: Set to TRUE if a frame was found
- `key_time_tr0`: Time of the found frame

---

### AEIO_VerifyFileImportable

Checks if a file can be imported by this AEIO.

```c
A_Err AEIO_VerifyFileImportable(
    AEIO_BasicData          *basic_dataP,
    AEIO_ModuleSignature    sig,
    const A_PathType        *file_pathZ,
    A_Boolean               *importablePB
);
```

**Purpose:** Called when users select a file in the import dialog that matches your registered extensions. Validate the file's actual content and set `importablePB` to TRUE if your plugin can handle it.

---

### AEIO_CloseSourceFiles

Opens or closes underlying source files.

```c
A_Err AEIO_CloseSourceFiles(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    seqH,
    A_Boolean       closeB
);
```

**Purpose:** When `closeB` is TRUE, close file handles to allow file system operations. When FALSE, reopen them.

---

## Output Functions

### AEIO_InitOutputSpec

Prepares a new output specification.

```c
A_Err AEIO_InitOutputSpec(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_Boolean       *user_interacted
);
```

**Purpose:** Initialize default output settings. After Effects caches the last-known-good optionsH in preferences.

---

### AEIO_SetOutputFile

Assigns the output file path.

```c
A_Err AEIO_SetOutputFile(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_UTF16Char     *file_pathZ
);
```

**Purpose:** Receive the target output path as a UTF-16 string with platform-appropriate separators.

---

### AEIO_StartAdding

Begins the output process.

```c
A_Err AEIO_StartAdding(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_long          flags
);
```

**Purpose:** Create the output file and write any necessary headers. This is the first opportunity to allocate pixel buffers based on valid output specifications.

**Example:**
```c
A_Err MyStartAdding(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_long          flags)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Get output dimensions
    A_long width, height;
    suites.IOOutSuite()->AEGP_GetOutSpecDimensions(outH, &width, &height);

    // Get output file path
    AEGP_MemHandle pathH;
    A_Boolean reserved;
    suites.IOOutSuite()->AEGP_GetOutSpecFilePath(outH, &pathH, &reserved);

    // Create file and write header
    err = CreateOutputFile(pathH, width, height);

    return err;
}
```

---

### AEIO_AddFrame

Appends a frame to the output file.

```c
A_Err AEIO_AddFrame(
    AEIO_BasicData      *basic_dataP,
    AEIO_OutSpecH       outH,
    A_long              frame_index,
    A_long              frames,
    PF_EffectWorld      *wP,
    const A_LPoint      *origin0,
    A_Boolean           was_compressedB,
    AEIO_InterruptFuncs *inter0
);
```

**Parameters:**
- `frame_index`: Current frame number
- `frames`: Total frame count
- `wP`: Pixel data to write
- `origin0`: Origin offset if rendering sub-region
- `was_compressedB`: Indicates if AE pre-compressed the data
- `inter0`: Interrupt callback for user cancellation

---

### AEIO_OutputFrame

Outputs a single frame (for still image formats).

```c
A_Err AEIO_OutputFrame(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    PF_EffectWorld  *wP
);
```

**Purpose:** Use for still image formats instead of `AEIO_AddFrame`.

---

### AEIO_EndAdding

Completes the output process.

```c
A_Err AEIO_EndAdding(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_long          flags
);
```

**Purpose:** Finalize the file, write any closing metadata, and close file handles.

---

### AEIO_GetFlatOutputOptions

Returns serialized output options.

```c
A_Err AEIO_GetFlatOutputOptions(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    AEIO_Handle     *optionsH
);
```

**Important:** Options must be cross-platform compatible. Address byte ordering issues for settings that will be read on different platforms.

---

### AEIO_GetDepths

Declares supported output bit depths.

```c
A_Err AEIO_GetDepths(
    AEIO_BasicData      *basic_dataP,
    AEIO_OutSpecH       outH,
    AEIO_OptionsFlags   *which
);
```

**Purpose:** Set flags indicating which bit depths your format supports (8bpc, 16bpc, 32bpc float).

---

### AEIO_UserOptionsDialog

Displays the output options dialog.

```c
A_Err AEIO_UserOptionsDialog(
    AEIO_BasicData          *basic_dataP,
    AEIO_OutSpecH           outH,
    const PF_EffectWorld    *sample0,
    A_Boolean               *user_interacted0
);
```

**Purpose:** Called when users click "Format Options" in the render queue. Display your custom settings dialog and store options.

---

### AEIO_WriteLabels

Embeds metadata labels in the output file.

```c
A_Err AEIO_WriteLabels(
    AEIO_BasicData      *basic_dataP,
    AEIO_OutSpecH       outH,
    AEIO_LabelFlags     *written
);
```

**Purpose:** Write alpha interpretation, field usage, and other interpretation metadata. Called for each frame.

---

## Audio Handling Functions

### AEIO_GetSound

Retrieves audio from imported media.

```c
A_Err AEIO_GetSound(
    AEIO_BasicData      *basic_dataP,
    AEIO_InSpecH        inH,
    AEIO_SndQuality     quality,
    const AEIO_InterruptFuncs *interrupt_funcsP0,
    const A_Time        *startPT,
    const A_Time        *durPT,
    A_u_long            start_sampLu,
    A_u_long            num_samplesLu,
    void                *dataPV
);
```

**Purpose:** Fill the data buffer with audio samples for the requested time range.

---

### AEIO_AddSoundChunk

Writes audio to the output file.

```c
A_Err AEIO_AddSoundChunk(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    const A_Time    *start,
    A_u_long        num_samplesLu,
    const void      *dataPV
);
```

**Parameters:**
- `start`: Start time of audio chunk
- `num_samplesLu`: Number of samples in chunk
- `dataPV`: Interleaved audio sample data

**Note:** Use `AEGP_GetOutSpecSoundSampleSize`, `AEGP_GetOutSpecSoundChannels`, and `AEGP_GetOutSpecSoundEncoding` to determine the audio format.

---

## AEGP_IOInSuite5 Reference

The `AEGP_IOInSuite5` provides functions to populate and retrieve input specification data:

### Dimension and Depth Functions

```c
// Set input dimensions
A_Err AEGP_SetInSpecDimensions(
    AEIO_InSpecH    inH,
    A_long          width,
    A_long          height
);

// Set bit depth
A_Err AEGP_SetInSpecDepth(
    AEIO_InSpecH    inH,
    A_short         depth
);
```

### Timing Functions

```c
// Set duration (required even for frame-based formats)
A_Err AEGP_SetInSpecDuration(
    AEIO_InSpecH    inH,
    const A_Time    *durationP
);

// Set native frame rate
A_Err AEGP_SetInSpecNativeFPS(
    AEIO_InSpecH    inH,
    A_Ratio         fps
);

// Get/set native start time
A_Err AEGP_GetInSpecNativeStartTime(
    AEIO_InSpecH    inH,
    A_Time          *startPT
);

A_Err AEGP_SetInSpecNativeStartTime(
    AEIO_InSpecH    inH,
    const A_Time    *startPT
);

A_Err AEGP_ClearInSpecNativeStartTime(
    AEIO_InSpecH    inH
);

// Get/set drop-frame setting
A_Err AEGP_GetInSpecNativeDisplayDropFrame(
    AEIO_InSpecH    inH,
    A_Boolean       *dropFramePB
);

A_Err AEGP_SetInSpecNativeDisplayDropFrame(
    AEIO_InSpecH    inH,
    A_Boolean       dropFrameB
);
```

### Audio Configuration Functions

```c
// Set audio sample rate
A_Err AEGP_SetInSpecSoundRate(
    AEIO_InSpecH    inH,
    A_FpLong        rate
);

// Set audio channel count
A_Err AEGP_SetInSpecSoundChannels(
    AEIO_InSpecH    inH,
    A_long          channels
);

// Set audio encoding format
A_Err AEGP_SetInSpecSoundEncoding(
    AEIO_InSpecH        inH,
    AEIO_SndEncoding    encoding
);
```

### Alpha and Color Functions

```c
// Set alpha interpretation
A_Err AEGP_SetInSpecAlphaLabel(
    AEIO_InSpecH            inH,
    const AEGP_AlphaLabel   *labelP
);

// Set embedded ICC color profile
A_Err AEGP_SetInSpecEmbeddedColorProfile(
    AEIO_InSpecH                inH,
    AEGP_ConstColorProfileP     profileP,
    AEGP_ColorProfileRules      rules
);
```

### Options Handle Functions

```c
// Get/set options handle
A_Err AEGP_GetInSpecOptionsHandle(
    AEIO_InSpecH    inH,
    AEGP_MemHandle  *optionsPH
);

A_Err AEGP_SetInSpecOptionsHandle(
    AEIO_InSpecH    inH,
    AEGP_MemHandle  optionsH,
    void            **flatHandlePP
);
```

---

## AEGP_IOOutSuite4 Reference

The `AEGP_IOOutSuite4` manages render queue output specifications:

### Getting Output Parameters

```c
// Get output file path
A_Err AEGP_GetOutSpecFilePath(
    AEIO_OutSpecH   outH,
    AEGP_MemHandle  *unicode_pathPH,
    A_Boolean       *file_rsrvdPB
);

// Get output dimensions
A_Err AEGP_GetOutSpecDimensions(
    AEIO_OutSpecH   outH,
    A_long          *widthPL,
    A_long          *heightPL
);

// Get output bit depth
A_Err AEGP_GetOutSpecDepth(
    AEIO_OutSpecH   outH,
    A_short         *depthPS
);

// Get output frame rate
A_Err AEGP_GetOutSpecFPS(
    AEIO_OutSpecH   outH,
    A_Ratio         *fpsP
);

// Get horizontal scale factor (pixel aspect ratio)
A_Err AEGP_GetOutSpecHSF(
    AEIO_OutSpecH   outH,
    A_Ratio         *hsfP
);

// Get alpha interpretation
A_Err AEGP_GetOutSpecAlphaLabel(
    AEIO_OutSpecH       outH,
    AEGP_AlphaLabel     *labelP
);
```

### Setting Output Parameters

```c
// Set options handle
A_Err AEGP_SetOutSpecOptionsHandle(
    AEIO_OutSpecH   outH,
    AEGP_MemHandle  optionsH,
    void            **flatHandlePP
);
```

### Color Profile Functions

```c
// Check if ICC profile should be embedded
A_Err AEGP_GetOutSpecShouldEmbedICCProfile(
    AEIO_OutSpecH   outH,
    A_Boolean       *embedPB
);

// Get ICC profile for embedding
A_Err AEGP_GetNewOutSpecColorProfile(
    AEGP_PluginID           plugin_id,
    AEIO_OutSpecH           outH,
    AEGP_ColorProfileP      *profilePP
);
```

### Audio Output Functions

```c
// Get audio sample size in bytes
A_Err AEGP_GetOutSpecSoundSampleSize(
    AEIO_OutSpecH   outH,
    A_long          *sample_sizePL
);

// Get audio channel count
A_Err AEGP_GetOutSpecSoundChannels(
    AEIO_OutSpecH   outH,
    A_long          *channelsPL
);

// Get audio encoding format
A_Err AEGP_GetOutSpecSoundEncoding(
    AEIO_OutSpecH       outH,
    AEIO_SndEncoding    *encodingP
);
```

---

## Import Workflow

The import process follows this sequence:

### 1. File Verification
```
User selects file → AEIO_VerifyFileImportable()
```
Called for files matching your registered extensions. Return TRUE in `importablePB` if you can handle the file.

### 2. File Initialization
```
File import confirmed → AEIO_InitInSpecFromFile()
```
Parse the file and use `AEGP_IOInSuite5` setter functions to describe its properties to After Effects.

### 3. Options Storage
```
Settings defined → AEGP_SetInSpecOptionsHandle()
```
Store any custom options data associated with the file.

### 4. Info Retrieval
```
Project panel display → AEIO_GetInSpecInfo()
```
Provide descriptive text for the Project panel (called frequently during refreshes).

### 5. User Data Handling
```
Metadata check → AEIO_CountUserData() → AEIO_GetUserData()
```
System checks for embedded user data (markers, labels, etc.).

### 6. Frame Rendering
```
Thumbnail/preview → AEIO_DrawSparseFrame()
```
Render frames for thumbnails and composition previews.

### 7. Ongoing Operations
```
User interaction → AEIO_DrawSparseFrame() + AEIO_GetSound()
```
Continuous calls during playback and editing.

---

## Export Workflow

The export sequence includes:

### 1. Output Specification
```
Format selected → AEIO_InitOutputSpec()
```
Initialize output settings when users choose your format in the render queue.

### 2. Configuration
```
Settings defined → AEGP_SetOutSpecOptionsHandle()
```
Store output configuration using the options handle.

### 3. Capability Detection
```
Format options → AEIO_GetDepths()
```
After Effects queries supported output bit depths.

### 4. Output Details
```
File naming → AEIO_GetOutputInfo()
```
Provide file naming and type information.

### 5. User Options
```
Format Options clicked → AEIO_UserOptionsDialog()
```
Display your custom output settings dialog.

### 6. File Setup
```
Render preparation → AEIO_SetOutputFile() → AEIO_GetSizes()
```
Receive output path and report expected file sizes.

### 7. File Creation
```
Render start → AEIO_StartAdding()
```
Create the output file and write headers.

### 8. Content Writing
```
Frame rendering → AEIO_AddSoundChunk() + AEIO_AddFrame()
```
Receive and write audio chunks and video frames sequentially.

### 9. Finalization
```
Render complete → AEIO_WriteLabels() → AEIO_EndAdding()
```
Write metadata labels for each frame, then finalize and close the file.

---

## Implementation Details

### Bit Depth Handling

Users can choose an export depth based on the options your AEIO declares support for in `AEIO_GetDepths()`. However, a critical consideration:

> "If a plug-in supports higher bit-depth exports, it should be able to handle these higher bit-depth PF_EffectWorlds passed in AEIO_AddFrame() or AEIO_OutputFrame()."

**Important:** "The frame delivered to the AEIO, and the final output will not necessarily be the same depth."

After Effects may deliver frames at the project's bit depth rather than the target output depth when it determines this provides superior quality. Your AEIO must handle bit depth conversion appropriately.

**Example Conversion:**
```c
void ConvertFrame(
    PF_EffectWorld *inputP,
    A_short targetDepth,
    void *outputBuffer)
{
    A_short inputDepth = inputP->world_flags & PF_WorldFlag_DEEP ?
                         16 : (inputP->world_flags & PF_WorldFlag_32 ? 32 : 8);

    if (inputDepth == targetDepth) {
        // Direct copy
        CopyPixelData(inputP, outputBuffer);
    } else if (inputDepth > targetDepth) {
        // Downsample (e.g., 16bpc to 8bpc)
        DownsamplePixels(inputP, targetDepth, outputBuffer);
    } else {
        // Upsample (e.g., 8bpc to 16bpc)
        UpsamplePixels(inputP, targetDepth, outputBuffer);
    }
}
```

---

## Data Storage Architecture

The documentation distinguishes between two storage mechanisms:

### User Data
Reserved for information embedded within the file itself:
- Marker data
- Field labels
- Chapter information
- Custom metadata the file format can accommodate

### Option Handles
Used for file-related settings and processing information:
- Output configurations
- Dimensions and aspect ratios
- Compression parameter details
- Codec-specific settings

This separation ensures metadata is appropriately stored based on whether it belongs within the file structure or as external processing metadata.

---

## Error Handling

### Return Values

All AEIO functions return `A_Err` error codes. Common values:

| Error Code | Description |
|------------|-------------|
| `A_Err_NONE` | Success |
| `A_Err_GENERIC` | Generic error |
| `A_Err_STRUCT` | Structure error |
| `A_Err_PARAMETER` | Invalid parameter |
| `A_Err_ALLOC` | Memory allocation failure |
| `AEIO_Err_USE_DFLT_CALLBACK` | Use After Effects' default behavior |

### Special Return: AEIO_Err_USE_DFLT_CALLBACK

For optional functions, return `AEIO_Err_USE_DFLT_CALLBACK` to allow After Effects to handle the call with its default behavior:

```c
A_Err MyOptionalFunction(AEIO_BasicData *basic_dataP, ...)
{
    // Use AE's default behavior for this function
    return AEIO_Err_USE_DFLT_CALLBACK;
}
```

---

## Code Examples

### Complete Minimal Input AEIO

```c
// Minimal AEIO for video input

static A_Err MyInitInSpecFromFile(
    AEIO_BasicData      *basic_dataP,
    const A_UTF16Char   *file_pathZ,
    AEIO_InSpecH        inH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Parse file header
    MyFileInfo info;
    ERR(ParseFile(file_pathZ, &info));

    // Set dimensions
    ERR(suites.IOInSuite()->AEGP_SetInSpecDimensions(
        inH, info.width, info.height));

    // Set depth
    ERR(suites.IOInSuite()->AEGP_SetInSpecDepth(inH, info.bitDepth));

    // Set duration
    A_Time duration = {info.frameCount, info.frameRate};
    ERR(suites.IOInSuite()->AEGP_SetInSpecDuration(inH, &duration));

    // Set fps
    A_Ratio fps = {info.frameRate, 1};
    ERR(suites.IOInSuite()->AEGP_SetInSpecNativeFPS(inH, fps));

    // Store file handle in options
    AEGP_MemHandle optH;
    ERR(suites.MemorySuite()->AEGP_NewMemHandle(
        basic_dataP->aegp_plug_id,
        "FileOptions",
        sizeof(MyFileOptions),
        AEGP_MemFlag_CLEAR,
        &optH));

    if (!err) {
        MyFileOptions *optP;
        ERR(suites.MemorySuite()->AEGP_LockMemHandle(optH, (void**)&optP));
        if (!err) {
            // Store file info
            memcpy(optP, &info, sizeof(MyFileOptions));
            suites.MemorySuite()->AEGP_UnlockMemHandle(optH);
        }
        void *flatP;
        ERR(suites.IOInSuite()->AEGP_SetInSpecOptionsHandle(inH, optH, &flatP));
    }

    return err;
}

static A_Err MyDisposeInSpec(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH)
{
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    AEGP_MemHandle optH;
    suites.IOInSuite()->AEGP_GetInSpecOptionsHandle(inH, &optH);

    if (optH) {
        suites.MemorySuite()->AEGP_FreeMemHandle(optH);
    }

    return A_Err_NONE;
}

static A_Err MyDrawSparseFrame(
    AEIO_BasicData          *basic_dataP,
    AEIO_InSpecH            inH,
    AEIO_Quality            qual,
    const AEIO_RationalScale *rs0,
    const A_Time            *tr,
    const A_Time            *duration0,
    const A_Rect            *required_region0,
    PF_EffectWorld          *wP,
    A_long                  *originx,
    A_long                  *originy,
    AEIO_DrawingFlags       *draw_flagsP)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Get options
    AEGP_MemHandle optH;
    ERR(suites.IOInSuite()->AEGP_GetInSpecOptionsHandle(inH, &optH));

    if (!err && optH) {
        MyFileOptions *optP;
        ERR(suites.MemorySuite()->AEGP_LockMemHandle(optH, (void**)&optP));

        if (!err) {
            // Calculate frame index
            A_long frameIndex = (tr->value * optP->frameRate) / tr->scale;

            // Read frame from file
            ERR(ReadFrame(optP, frameIndex, wP));

            suites.MemorySuite()->AEGP_UnlockMemHandle(optH);
        }
    }

    *draw_flagsP = AEIO_DrawingFlags_COMPLETE;
    return err;
}

static A_Err MyGetInSpecInfo(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    AEIO_Verbiage   *verbiageP)
{
    strcpy(verbiageP->name, "My Custom Video");
    strcpy(verbiageP->type, "MyFormat");
    strcpy(verbiageP->sub_type, "Video Data");
    return A_Err_NONE;
}

static A_Err MyCloseSourceFiles(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    seqH,
    A_Boolean       closeB)
{
    // Close file handles when closeB is true
    return A_Err_NONE;
}

static A_Err MyInqNextFrameTime(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    const A_Time    *base_time_tr,
    AEIO_TimeDir    time_dir,
    A_Boolean       *found0,
    A_Time          *key_time_tr0)
{
    // Return next frame time in sequence
    *found0 = TRUE;
    // Calculate next frame time based on direction
    return A_Err_NONE;
}

// Entry point
A_Err EntryPointFunc(
    struct SPBasicSuite     *pica_basicP,
    A_long                  major_versionL,
    A_long                  minor_versionL,
    AEGP_PluginID           aegp_plugin_id,
    AEGP_GlobalRefcon       *global_refconP)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(pica_basicP);

    // Set up module info
    AEIO_ModuleInfo info;
    memset(&info, 0, sizeof(info));

    info.sig = 'MYIO';
    strcpy(info.name, "My Format AEIO");
    info.flags = AEIO_MFlag_INPUT | AEIO_MFlag_VIDEO | AEIO_MFlag_FILE;
    info.flags2 = AEIO_MFlag2_CAN_DRAW_FLOAT;
    info.max_width = 8192;
    info.max_height = 8192;
    info.num_filetypes = 1;
    info.num_extensions = 1;

    info.read_kinds[0].mac_type = 'MYFT';
    strcpy(info.read_kinds[0].ext, "myf");
    info.read_kinds[0].type_category = AEIO_TypeCategory_FILE;

    // Set up function block
    AEIO_FunctionBlock4 funcs;
    memset(&funcs, 0, sizeof(funcs));

    funcs.AEIO_InitInSpecFromFile = MyInitInSpecFromFile;
    funcs.AEIO_DisposeInSpec = MyDisposeInSpec;
    funcs.AEIO_DrawSparseFrame = MyDrawSparseFrame;
    funcs.AEIO_GetInSpecInfo = MyGetInSpecInfo;
    funcs.AEIO_CloseSourceFiles = MyCloseSourceFiles;
    funcs.AEIO_InqNextFrameTime = MyInqNextFrameTime;

    // Register AEIO
    AEGP_RegisterSuites5 *regSuiteP;
    ERR(suites.Pica()->AcquireSuite(
        kAEGPRegisterSuite,
        kAEGPRegisterSuiteVersion5,
        (const void**)&regSuiteP));

    if (!err) {
        AEIO_BasicData basicData;
        basicData.pica_basicP = pica_basicP;
        basicData.aegp_plug_id = aegp_plugin_id;

        ERR(regSuiteP->AEGP_RegisterIO(
            aegp_plugin_id,
            &basicData,
            &info,
            &funcs));

        suites.Pica()->ReleaseSuite(
            kAEGPRegisterSuite,
            kAEGPRegisterSuiteVersion5);
    }

    return err;
}
```

### Output AEIO Example

```c
static A_Err MyInitOutputSpec(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_Boolean       *user_interacted)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Allocate options
    AEGP_MemHandle optH;
    ERR(suites.MemorySuite()->AEGP_NewMemHandle(
        basic_dataP->aegp_plug_id,
        "OutputOptions",
        sizeof(MyOutputOptions),
        AEGP_MemFlag_CLEAR,
        &optH));

    if (!err) {
        MyOutputOptions *optP;
        ERR(suites.MemorySuite()->AEGP_LockMemHandle(optH, (void**)&optP));

        if (!err) {
            // Set defaults
            optP->quality = 90;
            optP->codec = MY_CODEC_DEFAULT;
            suites.MemorySuite()->AEGP_UnlockMemHandle(optH);
        }

        void *flatP;
        ERR(suites.IOOutSuite()->AEGP_SetOutSpecOptionsHandle(outH, optH, &flatP));
    }

    *user_interacted = FALSE;
    return err;
}

static A_Err MyStartAdding(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_long          flags)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    // Get output specs
    A_long width, height;
    ERR(suites.IOOutSuite()->AEGP_GetOutSpecDimensions(outH, &width, &height));

    A_short depth;
    ERR(suites.IOOutSuite()->AEGP_GetOutSpecDepth(outH, &depth));

    A_Ratio fps;
    ERR(suites.IOOutSuite()->AEGP_GetOutSpecFPS(outH, &fps));

    // Get file path
    AEGP_MemHandle pathH;
    A_Boolean reserved;
    ERR(suites.IOOutSuite()->AEGP_GetOutSpecFilePath(outH, &pathH, &reserved));

    if (!err && pathH) {
        A_UTF16Char *pathP;
        ERR(suites.MemorySuite()->AEGP_LockMemHandle(pathH, (void**)&pathP));

        if (!err) {
            // Create output file
            ERR(CreateMyOutputFile(pathP, width, height, depth, fps));
            suites.MemorySuite()->AEGP_UnlockMemHandle(pathH);
        }
        suites.MemorySuite()->AEGP_FreeMemHandle(pathH);
    }

    return err;
}

static A_Err MyAddFrame(
    AEIO_BasicData      *basic_dataP,
    AEIO_OutSpecH       outH,
    A_long              frame_index,
    A_long              frames,
    PF_EffectWorld      *wP,
    const A_LPoint      *origin0,
    A_Boolean           was_compressedB,
    AEIO_InterruptFuncs *inter0)
{
    A_Err err = A_Err_NONE;

    // Check for user abort
    if (inter0 && inter0->abort0) {
        A_Boolean aborted = FALSE;
        inter0->abort0(inter0->refcon, &aborted);
        if (aborted) {
            return A_Err_GENERIC;
        }
    }

    // Encode and write frame
    ERR(EncodeAndWriteFrame(wP, frame_index));

    return err;
}

static A_Err MyEndAdding(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    A_long          flags)
{
    // Finalize file
    return FinalizeMyOutputFile();
}

static A_Err MyGetDepths(
    AEIO_BasicData      *basic_dataP,
    AEIO_OutSpecH       outH,
    AEIO_OptionsFlags   *which)
{
    // Support 8, 16, and 32-bit output
    *which = AEIO_OptionsFlags_DEPTH_8 |
             AEIO_OptionsFlags_DEPTH_16 |
             AEIO_OptionsFlags_DEPTH_32;
    return A_Err_NONE;
}

static A_Err MyGetFlatOutputOptions(
    AEIO_BasicData  *basic_dataP,
    AEIO_OutSpecH   outH,
    AEIO_Handle     *optionsH)
{
    A_Err err = A_Err_NONE;
    AEGP_SuiteHandler suites(basic_dataP->pica_basicP);

    AEGP_MemHandle optH;
    ERR(suites.IOOutSuite()->AEGP_GetOutSpecOptionsHandle(outH, &optH));

    if (!err && optH) {
        *optionsH = (AEIO_Handle)optH;
    }

    return err;
}
```

---

## Best Practices

### Performance Optimization

1. **Minimize Allocations in GetInSpecInfo**
   - This function is called frequently during Project panel refreshes
   - Cache strings rather than generating them each call
   - Check for valid optionsH before dereferencing

2. **Efficient Frame Decoding**
   - Cache decoded frames when possible
   - Use memory-mapped file I/O for large files
   - Implement progressive decoding for preview quality

3. **Thread Safety**
   - AEIOs may be called from multiple threads
   - Protect shared resources with proper synchronization
   - Avoid global state

### Cross-Platform Compatibility

1. **Byte Ordering**
   - Use platform-neutral serialization for options
   - Handle endianness explicitly when reading/writing binary data

2. **Path Handling**
   - Always use UTF-16 paths as provided by After Effects
   - Handle platform-specific path separators appropriately

3. **File Types**
   - Register both macOS file types and Windows extensions
   - Test on both platforms

### Error Handling

1. **Graceful Degradation**
   - Return meaningful error codes
   - Don't leave After Effects in an inconsistent state
   - Clean up partial allocations on failure

2. **User Feedback**
   - Use `AEGP_ReportInfo` for non-fatal warnings
   - Avoid blocking dialogs during batch operations
   - Log errors for debugging

### Memory Management

1. **Use AEGP Memory Suite**
   - Always allocate through `AEGP_MemorySuite`
   - Properly pair lock/unlock calls
   - Free handles when no longer needed

2. **Options Handles**
   - Keep options data compact
   - Flatten before storage (no pointers)
   - Version your options structure

---

## References

- [AEIOs Overview - After Effects SDK Guide](https://ae-plugins.docsforadobe.dev/aeios/aeios/)
- [AEIO_ModuleInfo - After Effects SDK Guide](https://ae-plugins.docsforadobe.dev/aeios/AEIO_ModuleInfo/)
- [New Kids On The Function Block - After Effects SDK Guide](https://ae-plugins.docsforadobe.dev/aeios/new-kids-on-the-function-block/)
- [Implementation Details - After Effects SDK Guide](https://ae-plugins.docsforadobe.dev/aeios/implementation-details/)
- [Calling Sequence - After Effects SDK Guide](https://ae-plugins.docsforadobe.dev/aeios/calling-sequence/)
- [AEGP Suites - After Effects SDK Guide](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Adobe After Effects SDK - Developer Portal](https://developer.adobe.com/after-effects/)

---

## Advanced Topics

### Marker Handling

AEIOs can read and write chapter markers and other temporal metadata. Three versions of marker support exist:

**AEIO_AddMarker (v1)**
```c
A_Err AEIO_AddMarker(
    AEIO_BasicData      *basic_dataP,
    AEIO_OutSpecH       outH,
    A_long              frame_index,
    AEIO_MarkerVal      marker_valP
);
```

**AEIO_AddMarker2 (v2)**
Extended marker support with additional metadata fields.

**AEIO_AddMarker3 (v3)**
Full marker support including URL links and cue point data.

To receive markers before frames during export, set `AEIO_MFlag2_SEND_ADDMARKER_BEFORE_ADDFRAME` in your `flags2`.

### Layer Support

For file formats containing multiple layers (like PSD or layered TIFF), set `AEIO_MFlag_HAS_LAYERS` and implement:

```c
A_Err AEIO_GetNumLayers(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    A_long          *num_layersPL
);

A_Err AEIO_GetLayerName(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    A_long          layer_index,
    A_char          *nameZ
);
```

### Auxiliary Data Channels

For formats with auxiliary channels (depth, motion vectors, object IDs), set `AEIO_MFlag_HAS_AUX_DATA` and implement auxiliary channel functions:

```c
A_Err AEIO_GetAuxChannelDesc(
    AEIO_BasicData      *basic_dataP,
    AEIO_InSpecH        inH,
    A_long              channel_index,
    AEIO_AuxChannelDesc *descP
);
```

### Sequence Options Dialog

For image sequences with per-sequence settings (like starting frame number or field order), implement:

```c
A_Err AEIO_SeqOptionsDlg(
    AEIO_BasicData  *basic_dataP,
    AEIO_InSpecH    inH,
    A_Boolean       *user_interactedP
);
```

Enable this with `AEIO_MFlag_SEQ_OPTIONS_DLG`.

---

## Debugging and Testing

### Common Issues

**1. Footage Not Appearing in Import Dialog**
- Verify extension registration in `AEIO_ModuleInfo`
- Check that `AEIO_VerifyFileImportable` returns TRUE
- Ensure `AEIO_MFlag_INPUT` is set

**2. Frames Not Rendering**
- Verify `AEIO_DrawSparseFrame` fills the entire `PF_EffectWorld`
- Check that dimensions match what was set in `InitInSpecFromFile`
- Return `AEIO_DrawingFlags_COMPLETE` when finished

**3. Output Files Corrupted**
- Ensure `AEIO_StartAdding` creates valid file headers
- Verify `AEIO_EndAdding` properly finalizes the file
- Check for proper byte ordering in binary data

**4. Memory Leaks**
- Always free `AEGP_MemHandle` allocations
- Match lock/unlock calls
- Clean up in `AEIO_DisposeInSpec` and `AEIO_EndAdding`

### Testing Checklist

- [ ] Import single file
- [ ] Import image sequence
- [ ] Preview in Project panel
- [ ] Playback in composition
- [ ] Export single frame
- [ ] Export video sequence
- [ ] Export with audio
- [ ] Test all supported bit depths
- [ ] Test on both Windows and macOS
- [ ] Verify file metadata preservation
- [ ] Test with large files (>4GB)
- [ ] Test with non-ASCII filenames

---

## Version History and Compatibility

### AEIO_FunctionBlock Versions

| Version | SDK Version | Key Additions |
|---------|-------------|---------------|
| AEIO_FunctionBlock | CS3 | Original structure |
| AEIO_FunctionBlock2 | CS4 | AddMarker2 support |
| AEIO_FunctionBlock3 | CS5 | Audio options dialog |
| AEIO_FunctionBlock4 | CS6+ | AddMarker3, 32bpc support |

### AEGP_IOInSuite Versions

| Version | Key Additions |
|---------|---------------|
| AEGP_IOInSuite1-4 | Basic functionality |
| AEGP_IOInSuite5 | Native start time, drop-frame settings |

### AEGP_IOOutSuite Versions

| Version | Key Additions |
|---------|---------------|
| AEGP_IOOutSuite1-3 | Basic functionality |
| AEGP_IOOutSuite4 | ICC profile embedding support |

---

## Platform-Specific Considerations

### macOS

- File types use four-character codes (e.g., 'MYFT')
- Use `CFBundle` for resource loading
- Handle sandboxing for file access
- Test with Apple Silicon (arm64) and Intel (x86_64)

### Windows

- File associations use extensions only
- Use Windows API for file dialogs
- Handle long path names (>260 characters)
- Test with both x64 builds

### Cross-Platform Tips

```c
// Platform-neutral path handling
#ifdef AE_OS_WIN
    #define PATH_SEP L'\\'
#else
    #define PATH_SEP L'/'
#endif

// Endianness conversion
A_u_long SwapBytes32(A_u_long value) {
    return ((value & 0xFF000000) >> 24) |
           ((value & 0x00FF0000) >> 8)  |
           ((value & 0x0000FF00) << 8)  |
           ((value & 0x000000FF) << 24);
}
```

---

## Sample AEIO Projects

### SDK Sample: SDK_File

The After Effects SDK includes a sample AEIO called `SDK_File` that demonstrates:
- Basic import functionality
- Custom file format (.sdk extension)
- Frame-by-frame import
- Options dialog implementation

Location: `Examples/AEIO/SDK_File/`

### Open Source Examples

Several open-source projects provide AEIO implementations:

1. **OpenEXR AEIO** - Import/export for OpenEXR format
2. **ProEXR** - Extended EXR support with channel access
3. **JPEG 2000 AEIO** - J2K codec support
4. **WebM AEIO** - VP8/VP9 video codec support

These projects demonstrate real-world AEIO patterns and can serve as reference implementations.

---

## Glossary

| Term | Definition |
|------|------------|
| **AEIO** | After Effects Input/Output plugin |
| **AEGP** | After Effects General Plugin |
| **InSpecH** | Input Specification Handle - represents imported footage |
| **OutSpecH** | Output Specification Handle - represents render output |
| **PF_EffectWorld** | Pixel buffer structure used by After Effects |
| **ARGB** | Alpha-Red-Green-Blue pixel ordering |
| **bpc** | Bits per channel |
| **Sparse Frame** | Individual frame request (not sequential) |
| **Function Block** | Structure containing function pointers |
| **Module Info** | Structure describing plugin capabilities |
| **ICC Profile** | Color profile for color management |
| **HSF** | Horizontal Scale Factor (pixel aspect ratio) |

---

## Frequently Asked Questions

**Q: Can I override After Effects' built-in importers?**
A: No, AEIOs cannot override built-in formats. Use MediaCore importers for that purpose.

**Q: How do I support multiple file extensions?**
A: Set `num_extensions` and populate the `read_kinds` array with multiple entries.

**Q: Can my AEIO support both import and export?**
A: Yes, set both `AEIO_MFlag_INPUT` and `AEIO_MFlag_OUTPUT` and implement the required functions for each.

**Q: How do I handle variable frame rate footage?**
A: Return accurate frame times from `AEIO_InqNextFrameTime` based on the actual file content.

**Q: Can I access other footage items from my AEIO?**
A: No, AEIOs only have access to their own input/output specifications. Use AEGP suites for project-level access.

**Q: How do I report progress during long operations?**
A: Use the `AEIO_InterruptFuncs` callback structure passed to `AEIO_AddFrame`.

**Q: What happens if my AEIO crashes?**
A: After Effects may blacklist the plugin. Always handle errors gracefully and avoid crashes.

---

*Documentation Version: 1.0*
*SDK Reference: After Effects SDK 22.0.0+*
*Last Updated: December 2025*
