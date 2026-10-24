---
source: '[unknown - 01-sdk-overview-architecture.md]'
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
description: Comprehensive overview of the Adobe After Effects C++ SDK architecture,
  plugin types, development environment setup, and core concepts
---
 Adobe After Effects SDK Overview and Architecture

## Executive Summary

The Adobe After Effects C++ SDK is a comprehensive development framework enabling third-party developers to extend After Effects functionality through native plugins. This SDK provides access to After Effects' internal architecture, allowing developers to create custom effects, manipulate project data, handle specialized file formats, and implement custom 3D renderers.

The SDK represents over two decades of API evolution, supporting modern features like multi-frame rendering, GPU acceleration, and 32-bit floating-point image processing. Plugins developed with this SDK can also maintain compatibility with Adobe Premiere Pro, providing cross-application support within the Adobe Creative Cloud ecosystem.

### Key Capabilities

The After Effects SDK enables four primary plugin categories:

1. **Effect Plugins** - Process video and audio with custom algorithms, supporting both CPU and GPU rendering pipelines
2. **AEGPs (After Effects General Plugins)** - Access internal project data, hook into menus and UI, provide scripting extensions
3. **AEIOs (After Effects Input/Output)** - Handle specialized file format import and export
4. **Artisans** - Develop custom 3D rendering extensions that replace After Effects' native 3D renderer

### Target Audience

The SDK is designed for experienced C/C++ developers. According to Adobe's documentation: "You must be a proficient C/C++ programmer to write After Effects plug-ins." The documentation assumes familiarity with:

- Strong C/C++ programming skills
- After Effects as an end user
- Motion graphics terminology
- Graphics concepts including alpha channels, pixel aspect ratios, interlacing, and color spaces

---

## SDK Version Information and Compatibility

### Version History and API Mapping

The After Effects SDK maintains two parallel API version tracks: the Effect API (for effect plugins) and the AEGP API (for general plugins). Developers should compile plugins with the latest SDK headers to access current functionality, though existing plugins typically remain compatible with newer After Effects versions.

| After Effects Release | Effect API Version | AEGP API Version |
|----------------------|-------------------|------------------|
| 22.0 | 13.27 | 18.2 |
| 17.0 | 13.18 | - |
| 16.0 | 13.16 | - |
| 15.0 | 13.15 | - |
| CC 2017 (14.0) | 13.13 | - |
| CC 2015 (13.7) | 13.10 | - |
| CC 2014 (13.0-13.2) | 13.7 | - |
| CS6 (11.0) | 13.2 | 111.0 |
| CS5 (10.0) | 13.0 | 17.0 |

### Runtime Version Detection

Developers can programmatically check the runtime After Effects version through two methods:

**For Effect Plugins:**
```cpp
// Access version through PF_InData structure
A_long version = in_data->version.major;
A_long subversion = in_data->version.minor;
```

**For AEGPs (via ExtendScript):**
```cpp
// Using AEGP_ExecuteScript
AEGP_ExecuteScript(aegp_plugin_id, "app.version", FALSE, &result, &error);
// Or for build number
AEGP_ExecuteScript(aegp_plugin_id, "app.buildNumber", FALSE, &result, &error);
```

### Backward Compatibility Considerations

The SDK design philosophy prioritizes backward compatibility. Key guidelines:

1. **Use Latest Headers** - Compile with the most recent SDK headers for access to current features
2. **Graceful Degradation** - Check suite availability before using newer APIs
3. **Minimum Version Targeting** - Specify minimum supported version in PiPL resources
4. **Feature Detection** - Query for capability rather than hardcoding version checks

---

## Development Environment Setup

### Windows Development Environment

**System Requirements:**
- Windows 10 or later
- Microsoft Visual Studio 2019 or later
- After Effects installation for testing

**Configuration Steps:**

1. **Install Visual Studio 2019/2022** with C++ development workload

2. **Set Environment Variable:**
   ```batch
   set AE_PLUGIN_BUILD_DIR=C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore
   ```

3. **Configure Build Output:**
   Set the output directory in Visual Studio project properties to the MediaCore plugins folder

4. **Administrator Privileges:**
   Run Visual Studio as Administrator to avoid link errors when writing to protected system directories

5. **Open SDK Solution:**
   Use `BuildAll.sln` from the SDK Examples folder to build all sample plugins

**Windows Plugin Path:**
```
C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\
```

### macOS Development Environment

**System Requirements:**
- macOS 10.15 (Catalina) or macOS 11.0 (Big Sur) or later
- Xcode 11.3.1 or Xcode 12.4 (for Apple Silicon support)
- After Effects installation for testing

**Configuration Steps:**

1. **Install Xcode** from the Mac App Store

2. **Configure Build Output:**
   Set output path to:
   ```
   ~/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/
   ```

3. **Open SDK Project:**
   Use `Buildall.xcodeproj` from the SDK Examples folder

4. **Apple Silicon Support:**
   Xcode 12.4+ supports building universal binaries for both Intel and Apple Silicon Macs

### Code Signing Requirements (macOS 15+)

Starting with macOS 15, unsigned plugins are blocked by the operating system. During development, use ad-hoc signing:

```bash
codesign --force --deep --sign - /path/to/plugin.bundle
```

**Important:** Do not modify the plugin after final signing, as this invalidates the signature. For distribution, use proper code signing with a valid Apple Developer certificate.

### Debugging Configuration

**Windows (Visual Studio):**
1. Set your plugin project as the startup project
2. Navigate to Project Properties > Debugging > Command
3. Enter the full path to AfterFX.exe or Premiere Pro
4. Press F5 to launch with debugging, or attach to running process

**macOS (Xcode):**
1. Navigate to Product > Scheme > Edit Scheme
2. Under Run > Executable, select After Effects
3. Click the Play button to launch with debugging
4. Alternatively, use Debug > Attach to Process for running applications

### Clearing Preferences for Clean Testing

To reset After Effects preferences during development:

- **Windows:** Hold `Ctrl+Alt+Shift` when launching After Effects
- **macOS:** Hold `Cmd+Opt+Shift` when launching After Effects

**Preference Locations:**
- Windows: `[user folder]\AppData\Roaming\Adobe\After Effects\[version]\`
- macOS: `~/Library/Preferences/Adobe/After Effects/[version]/`

---

## Project Structure and Build Systems

### SDK Directory Structure

The After Effects SDK package contains the following key directories:

```
After_Effects_SDK/
├── Examples/
│   ├── AEGP/                    # AEGP sample plugins
│   │   ├── ProjDumper/          # Project text export
│   │   ├── Projector/           # Project element manipulation
│   │   ├── Easy_Cheese/         # Keyframe assistant example
│   │   └── Persisto/            # Menu command example
│   ├── Effect/                  # Effect plugin samples
│   │   ├── Skeleton/            # Starter template (recommended)
│   │   ├── Checkout/            # Parameter checkout example
│   │   ├── SmartyPants/         # Smart rendering example
│   │   └── [additional samples]
│   ├── AEIO/                    # File format handlers
│   │   ├── IO/                  # Basic I/O sample
│   │   └── FBIO/                # Frame-based I/O
│   ├── Artisans/                # 3D rendering plugins
│   │   └── Artie/               # Artisan sample
│   ├── BuildAll.sln             # Windows build solution
│   └── Buildall.xcodeproj       # macOS build project
├── Headers/                     # SDK header files
│   ├── AE_Effect.h              # Core effect definitions
│   ├── AE_EffectCB.h            # Effect callbacks
│   ├── AE_EffectCBSuites.h      # Callback suites
│   ├── AEGP_SuiteHandler.h      # Suite management
│   └── [additional headers]
├── Resources/                   # Resource tools and templates
│   └── PiPLtool.exe            # Windows PiPL compiler
└── Util/                        # Utility code and helpers
```

### Building Sample Projects

**Windows:**
1. Open `Examples/BuildAll.sln` in Visual Studio
2. Select configuration (Debug/Release) and platform (x64)
3. Build Solution (Ctrl+Shift+B)

**macOS:**
1. Open `Examples/Buildall.xcodeproj` in Xcode
2. Select target scheme
3. Build (Cmd+B)

### Creating a New Plugin Project

Adobe strongly recommends starting from existing samples rather than creating projects from scratch:

> "The temptation to start from scratch may be strong; fight it!"

**Recommended Workflow:**

1. **Copy the Skeleton Template:**
   ```
   cp -r Examples/Effect/Skeleton MyNewPlugin
   ```

2. **Rename All References:**
   - Search and replace "Skeleton" with your plugin name
   - Search and replace "SKELETON" with your plugin name (uppercase)
   - Update PiPL resource file
   - Update project/solution files

3. **Recommended Starting Points by Plugin Type:**
   - **Effects:** Skeleton template
   - **AEGPs (projects):** Projector sample
   - **Keyframe Assistants:** Easy Cheese sample
   - **Menu Commands:** Persisto sample
   - **File Formats:** AEIO sample (though Premiere Pro Importers are now recommended)

---

## Core Concepts and Terminology

### The Entry Point Model

All After Effects plugins use an entry point architecture where After Effects calls into the plugin with specific commands:

```cpp
PF_Err main (
    PF_Cmd          cmd,      // Command selector
    PF_InData       *in_data, // Input parameters from AE
    PF_OutData      *out_data,// Output parameters to AE
    PF_ParamDef     *params[],// Parameter array
    PF_LayerDef     *output,  // Output layer buffer
    void            *extra    // Extra data for specific commands
);
```

### Command Selectors

Command selectors are instructions from After Effects telling the plugin what action to perform. The documentation describes these as: "Commands are, simply, what After Effects wants your effect to do."

**All plugins must respond to `PF_Cmd_RENDER`** - the core rendering command.

### PF_InData Structure

The `PF_InData` structure provides essential information from After Effects to the plugin:

- **version** - API version information
- **effect_ref** - Handle to the effect instance
- **current_time** - Current composition time
- **time_step** - Frame duration
- **width/height** - Output dimensions
- **extent_hint** - Region requiring rendering
- **pica_basicP** - PICA suite access

### PF_OutData Structure

The `PF_OutData` structure communicates plugin state back to After Effects:

- **return_msg** - Error messages for display
- **out_flags** - Behavior flags
- **out_flags2** - Extended behavior flags
- **sequence_data** - Persistent effect instance data
- **global_data** - Plugin-wide persistent data

### Callback Functions (Suites)

After Effects provides functionality through callback function suites. These suites enable access to:

- Memory management
- Image buffer operations
- Parameter manipulation
- UI integration
- Project data access

### Function Suite Access Pattern

For C++ development, use `AEFX_SuiteScoper` for automatic suite management:

```cpp
AEFX_SuiteScoper<PF_GPUDeviceSuite1> gpu_suite =
    AEFX_SuiteScoper<PF_GPUDeviceSuite1>(
        in_dataP,
        kPFGPUDeviceSuite,
        kPFGPUDeviceSuiteVersion1,
        out_dataP
    );

// Use suite functions
gpu_suite->GetDeviceInfo(in_dataP->effect_ref, device_index, &device_info);
```

**Important:** Suite functions are generally not thread-safe. Execute UI-modifying operations only on the plugin's main thread.

### Parameter System

Parameters are time-varying values that users can manipulate:

> "Parameters are streams of values that vary with time; the source image, sliders, angles, points, colors, paths, and any arbitrary data types the user can manipulate."

**Parameter Types:**
- `PF_Param_LAYER` - Layer references
- `PF_Param_SLIDER` - Numeric sliders
- `PF_Param_ANGLE` - Rotation angles
- `PF_Param_COLOR` - Color picker
- `PF_Param_POINT` - 2D coordinates
- `PF_Param_POINT_3D` - 3D coordinates (CS5.5+)
- `PF_Param_PATH` - Mask path references
- `PF_Param_CHECKBOX` - Boolean toggles
- `PF_Param_GROUP` - Parameter grouping

---

## Plugin Types Overview

### Effect Plugins

Effect plugins process video and audio frames, applying transformations, filters, or generating content. They are the most common plugin type.

**Key Characteristics:**
- Receive input frames and parameter values
- Produce output frames
- Support 8-bit, 16-bit, and 32-bit floating-point processing (SmartFX)
- Can implement GPU acceleration
- Compatible with multi-frame rendering for parallel processing

**Command Sequence:**

```
Application Launch:
  PF_Cmd_GLOBAL_SETUP → PF_Cmd_PARAM_SETUP

Effect Applied:
  PF_Cmd_SEQUENCE_SETUP

Each Frame Render:
  PF_Cmd_FRAME_SETUP → PF_Cmd_RENDER → PF_Cmd_FRAME_SETDOWN

Effect Removed/Project Closed:
  PF_Cmd_SEQUENCE_SETDOWN

Application Quit:
  PF_Cmd_GLOBAL_SETDOWN
```

### AEGPs (After Effects General Plugins)

AEGPs hook directly into After Effects' internal architecture, providing access to project data, menus, and UI elements.

> "AEGPs utilize Plug-In Component Architecture (PICA) function suites to access After Effects functionality."

**Key Characteristics:**
- Register hook functions rather than responding to command selectors
- Access and manipulate project structure
- Add menu items and respond to user actions
- Can publish function suites for other plugins
- Operate consistently regardless of specialization

**Communication Model:**

Unlike effect plugins that use a single entry point, AEGPs register multiple hook functions:

```cpp
// In entry point
AEGP_RegisterSuites(aegp_plugin_id);
AEGP_RegisterHook(aegp_plugin_id, AEGP_HP_AfterQuit, QuitHook);
AEGP_RegisterHook(aegp_plugin_id, AEGP_HP_BeforeCommandFired, CommandHook);
```

### AEIOs (After Effects Input/Output)

AEIOs handle specialized file format import and export, extending After Effects' native file support.

**Note:** Adobe now recommends developing Premiere Pro Importers instead of AEIOs for broader Creative Cloud compatibility.

**Import Workflow:**
1. `AEIO_VerifyFileImportable()` - Validate file format
2. `AEIO_InitInSpecFromFile()` - Parse file and describe contents
3. `AEIO_GetInSpecInfo()` - Provide display information
4. `AEIO_DrawSparseFrame()` - Render frames for playback

**Export Workflow:**
1. `AEIO_InitOutputSpec()` - Initialize output settings
2. `AEIO_UserOptionsDialog()` - Present format options
3. `AEIO_StartAdding()` - Open file and write header
4. `AEIO_AddFrame()` - Write video frames
5. `AEIO_EndAdding()` - Finalize and close file

### Artisans

Artisans are specialized plugins that take over 3D rendering from After Effects.

> "The Artisan API exposes function hooks necessary for a plug-in to provide rendered output of 3D layers, taking over completely from After Effects."

**Key Characteristics:**
- Only one Artisan active per composition
- Selected through Composition Settings > Advanced
- Standard Artisans render only 3D layers
- Interactive Artisans handle all layers but only for on-screen display
- Complex implementation requiring Adobe consultation

**Important Considerations:**
- After Effects is not a 3D modeling application
- Artisans should provide multiple quality modes (interactive vs. final)
- Coordinate system conversion required (row-based vs. column-based matrices)

---

## Plugin Loading Mechanism

### Plugin Discovery

After Effects scans specific directories for plugins at launch:

**Windows:**
```
C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\
C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Plug-ins\
```

**macOS:**
```
~/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/
/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/
/Applications/Adobe After Effects [version]/Plug-ins/
```

### Plugin File Formats

- **Windows:** `.aex` files (After Effects Extension)
- **macOS:** `.plugin` bundles (application bundles)

### Loading Sequence

1. **Discovery Phase:** Scan plugin directories for valid files
2. **PiPL Reading:** Parse Plug-In Property List without executing code
3. **Validation:** Check version compatibility and requirements
4. **Registration:** Register plugin with After Effects
5. **Global Setup:** Call `PF_Cmd_GLOBAL_SETUP` for initial configuration
6. **Parameter Setup:** Call `PF_Cmd_PARAM_SETUP` to register parameters

### Multi-Hosting Support

Plugins can run in multiple Adobe applications:
- After Effects
- Premiere Pro
- Media Encoder

Set appropriate flags in PiPL and use host detection at runtime for host-specific behavior.

---

## Memory Management Fundamentals

### Core Principle

Adobe emphasizes using After Effects' memory management for significant allocations:

> "Use After Effects for any memory allocations of significant size."

Small allocations via `new` and `delete` are acceptable, but relying solely on OS memory functions can cause "lock-ups, crashes, and tech support calls."

### PF_HandleSuite1 Functions

The SDK provides six core memory management functions:

| Function | Purpose |
|----------|---------|
| `host_new_handle` | Allocate new memory handle |
| `host_lock_handle` | Lock handle for access |
| `host_unlock_handle` | Unlock handle |
| `host_dispose_handle` | Free allocated memory |
| `host_get_handle_size` | Query block size in bytes |
| `host_resize_handle` | Reallocate to new size |

### Memory Handle Pattern

```cpp
// Allocate memory
PF_Handle myHandle = NULL;
ERR(suites.HandleSuite1()->host_new_handle(size, &myHandle));

// Lock for access
void *ptr = NULL;
ERR(suites.HandleSuite1()->host_lock_handle(myHandle, &ptr));

// Use the memory...
memcpy(ptr, data, size);

// Unlock when done
ERR(suites.HandleSuite1()->host_unlock_handle(myHandle));

// Eventually dispose
ERR(suites.HandleSuite1()->host_dispose_handle(myHandle));
```

### Best Practices

1. **C++ Classes:** Implement custom `new` and `delete` operators in a base class
2. **STL Containers:** Use custom allocators in template definitions
3. **Handle Locking:** After Effects automatically locks handles before plugin calls
4. **RAM Preview:** Proper memory management enables efficient memory during resource-constrained operations

### Multi-Frame Rendering Memory Considerations

For thread-safe rendering, be aware of:

- `sequence_data` is read-only at render time by default
- Use `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER` for write access
- Consider Compute Cache API for shared computational results

---

## PiPL Resources

### Overview

PiPL (Plug-In Property List) resources originated from Adobe Photoshop and provide basic plugin information without executing plugin code:

> "PiPLs provide basic information about a plug-in's behavior, without executing the plug-in."

While largely superseded by `PF_Cmd_GLOBAL_SETUP` in After Effects, PiPL declarations must still align with runtime behavior.

### Core Properties

| Property | Purpose |
|----------|---------|
| **Kind** | Plugin type (e.g., `AEEffect` for effects) |
| **Name** | Display name (maximum 47 characters) |
| **Category** | Menu organization |
| **Entry Point** | Platform-specific export functions |
| **AE_Effect_Spec_Version** | SDK version used |
| **AE_Effect_Version** | Plugin version number |
| **AE_Effect_Global_OutFlags** | Must match `out_flags` set in GlobalSetup |
| **AE_Effect_Global_OutFlags_2** | Must align with `out_flags2` from GlobalSetup |
| **AE_Effect_Match_Name** | Unique identifier (distinct from display name) |
| **AE_Effect_Support_URL** | Link to effect information (AE 23.5+) |

### Cross-Platform Implementation

Use a single `.r` file for both macOS and Windows:

```r
#include "AEConfig.h"
#include "AE_EffectVers.h"

resource 'PiPL' (16000) {
    {
        Kind { AEEffect },
        Name { "My Effect" },
        Category { "My Category" },

        #ifdef AE_OS_WIN
            CodeWin64X86 { "EffectMain" },
        #else
            CodeMacIntel64 { "EffectMain" },
            CodeMacARM64 { "EffectMain" },
        #endif

        AE_PiPL_Version { 2, 0 },
        AE_Effect_Spec_Version { PF_PLUG_IN_VERSION, PF_PLUG_IN_SUBVERS },
        AE_Effect_Version {
            MAJOR_VERSION * 524288 +
            MINOR_VERSION * 32768 +
            BUG_VERSION * 2048 +
            STAGE_VERSION * 512 +
            BUILD_VERSION
        },
        AE_Effect_Match_Name { "ADBE My Effect" },
        AE_Effect_Global_OutFlags {
            PF_OutFlag_DEEP_COLOR_AWARE
        },
        AE_Effect_Global_OutFlags_2 {
            PF_OutFlag2_SUPPORTS_THREADED_RENDERING
        },
    }
};
```

### PiPL Tool (Windows)

On Windows, `pipltool.exe` converts `.r` files to binary `.rc` files for compilation:

```batch
pipltool.exe MyPlugin.r MyPlugin.rc
```

### Best Practices

1. Base new projects on SDK samples for automated resource updates
2. Avoid multiple PiPLs per file - use one PiPL per plugin
3. If combining AEGPs and effects, place AEGPs first in the file
4. Include pipltool output into Visual Studio's generated `.rc` file

---

## Other Integration Possibilities

Beyond the C++ SDK, After Effects supports five alternative integration approaches:

### 1. ExtendScript (JavaScript)

A JavaScript-based scripting language for automation:

> "Scripting is a relatively nimble and lightweight means to perform automated tasks with After Effects."

- Scripts can be compiled into protected `.jsxbin` files
- Command-line execution via `-s` or `-r` parameters
- Access to project structure, compositions, and layers

### 2. HTML5 Panels

Since CC 2014, After Effects supports custom panels:

- Built with HTML5, CSS, and JavaScript
- Integrate into Window > Extensions menu
- Support resizing and docking
- Communicate with ExtendScript for deeper integration

### 3. AERender (Command Line)

Command-line rendering tool for automation:

> "Primarily suited to allow automated renders, but can be used to execute any sequence of scripting commands."

### 4. Premiere Pro Importers

Recommended for file format support:

- Broader Creative Cloud compatibility
- Works across Premiere Pro, Media Encoder, Prelude, and Audition
- Priority system for import attempts
- Comprehensive documentation in Premiere Pro SDK

### 5. Mercury Transmit

For broadcasting video to output hardware:

- Works across Premiere Pro, After Effects, Prelude, and Character Animator
- Documentation in Premiere Pro SDK

---

## Source References

### Official Documentation

- [Adobe Developer Portal - After Effects](https://developer.adobe.com/after-effects/)
- [After Effects SDK Guide (DocsForAdobe)](https://ae-plugins.docsforadobe.dev/)

### Key Documentation Sections

- [Introduction](https://ae-plugins.docsforadobe.dev/)
- [PiPL Resources](https://ae-plugins.docsforadobe.dev/intro/pipl-resources/)
- [How to Start Creating Plug-ins](https://ae-plugins.docsforadobe.dev/intro/how-to-start-creating-plug-ins/)
- [SDK Audience](https://ae-plugins.docsforadobe.dev/intro/sdk-audience/)
- [Sample Projects](https://ae-plugins.docsforadobe.dev/intro/sample-projects/)
- [Version Compatibility](https://ae-plugins.docsforadobe.dev/intro/compatibility-across-multiple-versions/)
- [Other Integration Possibilities](https://ae-plugins.docsforadobe.dev/intro/other-integration-possibilities/)
- [Debugging Plug-ins](https://ae-plugins.docsforadobe.dev/intro/debugging-plug-ins/)

### Technical References

- [Memory Allocation](https://ae-plugins.docsforadobe.dev/effect-details/memory-allocation/)
- [Multi-Frame Rendering](https://ae-plugins.docsforadobe.dev/effect-details/multi-frame-rendering-in-ae/)
- [Command Selectors](https://ae-plugins.docsforadobe.dev/effect-basics/command-selectors/)
- [Function Suite Access](https://ae-plugins.docsforadobe.dev/effect-details/accessing-function-suites/)
- [AEGP Overview](https://ae-plugins.docsforadobe.dev/aegps/overview/)
- [AEGP Data Types](https://ae-plugins.docsforadobe.dev/aegps/data-types/)
- [Artisans](https://ae-plugins.docsforadobe.dev/artisans/artisans/)

---

## Graphics and Iteration Suites

The After Effects SDK provides specialized suites for image manipulation and pixel processing, enabling effects to leverage After Effects' optimized internal routines.

### Graphics Utility Suites

The SDK exposes internal transform and graphic utility routines through several function suites:

**PF_WorldTransformSuite1** provides functions for image compositing and transformation:

| Function | Purpose |
|----------|---------|
| `composite_rect` | Composite a rectangle from one PF_EffectWorld into another using transfer modes |
| `blend` | Combine two images with alpha weighting |
| `convolve` | Apply kernel-based filtering to image channels |
| `transfer_rect` | Blend with transfer modes and optional masking |
| `transform_world` | Apply geometric transformations |

**PF_FillMatteSuite2** manages image filling operations:

| Function | Purpose |
|----------|---------|
| `fill` | Populate rectangles with specified colors |
| `premultiply` | Convert between premultiplied and straight alpha |

**Sampling Suites** enable pixel sampling at various quality levels:

| Function | Purpose |
|----------|---------|
| `nn_sample` | Nearest neighbor sampling (fastest) |
| `subpixel_sample` | High-quality interpolated sampling at non-integer coordinates |
| `area_sample` | Alpha-weighted averaging of rectangular regions |
| `PF_BatchSamplingSuite1` | Optimized batch sampling functions |

**PF_ANSICallbackSuite1** provides standard mathematical functions (trigonometry, logarithms, power operations) to prevent library conflicts and ensure consistent error handling across plugins.

### Iteration Suites for Parallel Processing

The After Effects SDK documentation describes iteration suites as tools for pixel processing that enable multi-processor optimization:

> "Effects often iterate over all pixels in an image, filtering each one. By taking advantage of After Effects' iteration suites, you make it possible for After Effects to sub-allocate your task to as many processors are present."

**Available Suites:**

| Suite | Bit Depth |
|-------|-----------|
| `PF_Iterate8Suite1` | 8-bit processing |
| `PF_Iterate16Suite1` | 16-bit processing |
| `PF_IterateFloatSuite1` | Floating-point processing |

**Key Operations:**

The `iterate` function processes source pixels and populates a destination image. Developers can specify a rectangular region or iterate across all overlapping pixels.

**Important Considerations:**

1. **Automatic Progress Checking:** "This callback automatically includes progress and abort checking, so don't do so in your pixel function."
2. **Re-entrant Functions:** Pixel processing functions must be re-entrant
3. **Non-Deterministic Order:** Pixels aren't traversed in any guaranteed order
4. **Thread Limit Update:** The October 2021 SDK update increased concurrent threads to match available system CPU cores (previously limited to 32)
5. **LUT Support:** `iterate_lut` supports Look-Up Tables for optimization
6. **Generic Operations:** `iterate_generic` enables once-per-processor operations

---

## Utility Functions and UI Integration

The After Effects SDK provides several suites for utility operations and UI integration, enabling plugins to integrate seamlessly with After Effects' interface and project structure.

### PF_EffectUISuite

Allows developers to customize the options button: "Changes the text on the options button in the effect controls palette."

### PF_AppSuite

Offers comprehensive UI integration tools:

| Function Category | Capabilities |
|------------------|--------------|
| **Color Retrieval** | Get system colors for seamless UI matching |
| **Language Detection** | Retrieve the active displayed language of AE UI |
| **User Info** | Access user registration information |
| **Cursor Control** | Set and manage cursor appearance |
| **Color Picker** | Display native color picker dialogs |
| **Mouse Tracking** | Get mouse position information |
| **Window Management** | Invalidate windows for redraw |

### PF_AdvAppSuite2

Enables project manipulation and advanced application control:

| Function | Purpose |
|----------|---------|
| `PF_SaveProject` | Programmatically save the project |
| `PF_GetProjectDirtyState` | Check if project has unsaved changes |
| `PF_SetProjectDirtyState` | Mark project as modified |
| `PF_BringToFront` | Bring After Effects to foreground |
| `PF_SendToBack` | Send After Effects to background |
| `PF_InfoDrawText` | Display text in info palette |
| `PF_InfoDrawColor` | Display color in info palette |

### PF_AdvTimeSuite4

Provides time formatting that matches After Effects' internal display:

- Support for both composition and layer time contexts
- Configurable duration units
- Frame number and timecode formatting
- Consistent display with native UI elements

### PF_AdvItemSuite1

Handles timeline operations:

- Move time steps forward/backward
- Force composition rerenders
- Synchronize timeline state

### PF_ChannelSuite1

Accesses auxiliary channel data from file formats that contain metadata beyond standard pixel information:

| Channel Type | Description |
|--------------|-------------|
| Depth | Z-depth information |
| Normals | Surface normal vectors |
| Motion Vectors | Per-pixel motion data |
| Object ID | Render element identification |
| Coverage | Anti-aliasing coverage maps |

---

## UI Callbacks and Event Handling

The After Effects SDK provides callbacks for coordinate system conversion and OS-specific drawing context information, essential for plugins implementing custom user interfaces.

### Coordinate Transformation Functions

According to the guide: "After Effects provides callbacks for transposing between coordinate systems, and obtaining OS-specific information about drawing contexts."

| Callback | Purpose |
|----------|---------|
| `layer_to_comp` | Convert layer panel coordinates to composition panel coordinates |
| `comp_to_layer` | Convert composition panel coordinates to layer panel coordinates |
| `get_comp2layer_xform` | Return transformation matrix from composition to layer panel |
| `get_layer2comp_xform` | Return transformation matrix from layer to composition panel |
| `source_to_frame` | Transform source coordinates to screen coordinates (zoom-affected) |
| `frame_to_source` | Transform screen coordinates to source coordinates |

### Platform Data Access

`PF_GET_PLATFORM_DATA` retrieves platform-specific information including:

- File paths
- Window handles
- System-specific context data

### Development Considerations

The documentation emphasizes the importance of proper coordinate handling:

> "It is possible to build a functioning plug-in which utilizes a custom UI without implementing the coordinate system transposition callbacks. However, the moment a user zooms into the layer panel or rotates a layer, your plug-in will behave badly."

Developers should use these callbacks to ensure proper UI behavior during:

- Zoom operations
- Layer rotation
- Panel resizing
- Multi-monitor setups

Macros provided in header files like `AE_EffectUI.h` simplify implementation by defaulting context parameters appropriately.

---

## AEGP Data Types and Handles

The After Effects AEGP API uses opaque data types managed through accessor functions rather than direct memory dereferencing. Understanding these types is essential for AEGP development.

### Project and Item Management

| Type | Description |
|------|-------------|
| `AEGP_ProjectH` | The current After Effects project containing hierarchically arranged elements |
| `AEGP_ItemH` | An abstraction describing any element of a project, including folders |
| `AEGP_Collection2H` | A set of selected items |

### Composition and Layers

| Type | Description |
|------|-------------|
| `AEGP_CompH` | A sequence of renderable items that together produce output |
| `AEGP_LayerH` | An element of a composition including solids, text, cameras, and lights |
| `AEGP_FootageH` | Items that can be rendered (excluding folders and compositions) |

### Media and Effects

| Type | Description |
|------|-------------|
| `AEGP_WorldH` | A frame of pixels |
| `AEGP_EffectRefH` | An effect applied to a layer |
| `AEGP_StreamRefH` | Parameter streams attached to layers |

### Masks and Text

| Type | Description |
|------|-------------|
| `AEGP_MaskRefH` | A mask applied to a layer |
| `AEGP_TextDocumentH` | Text associated with text layers |

### Handle Lifecycle Management

**Important Considerations:**

1. **Reference Invalidation:** References are invalidated by user activity
2. **Caching Warning:** "Do not cache layer pixels"
3. **Just-in-Time Acquisition:** Acquire information only when needed
4. **Prompt Release:** Release handles promptly after use
5. **Disposal Requirements:** Several data types require explicit disposal functions to prevent memory leaks

---

## Multi-Frame Rendering Architecture

Multi-Frame Rendering (MFR) represents a significant architectural advancement in After Effects 2022 and later versions, enabling concurrent frame rendering across multiple CPU cores.

### Overview

Multi-Frame Rendering allows After Effects to render multiple frames simultaneously, leveraging modern multi-core processors for faster composition rendering and export operations.

### Requirements for Effect Support

To support MFR, effects must declare thread-safety by setting the `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` flag during global setup.

### Thread-Safety Definition

An effect achieves thread-safety when its implementation and shared data is guaranteed to be free of race conditions and always in a correct state when accessed concurrently. This requires:

1. **No Problematic Static Variables:** Static or global variables that are modified during rendering must be eliminated or protected
2. **No Global Data Writes at Render Time:** `global_data` must remain read-only during rendering
3. **No Sequence Data Writes During Rendering:** Writing to `sequence_data` during rendering is prohibited by default

### Sequence Data Changes (March 2021 SDK)

The March 2021 SDK introduced significant behavioral updates:

| Change | Description |
|--------|-------------|
| **Read-Only Default** | `sequence_data` becomes read-only at render time by default |
| **Opt-In Mutability** | Effects requiring write access must set `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER` |
| **Independent Copies** | Each render thread receives independent `sequence_data` copies when mutability is enabled |

### Compute Cache API

For time-consuming data computations, the Compute Cache API provides thread-safe caching:

- Allows render threads to share computational results
- Eliminates redundant calculations across separate `sequence_data` instances
- Provides automatic cache invalidation when inputs change
- Supports multiple cache entries with different keys

### Testing and Validation

Adobe provides static analysis tools to identify problematic variables:

- **macOS Analysis Tool:** Scans for static/global variable issues
- **Windows Analysis Tool:** Equivalent scanning for Windows builds
- **Runtime Detection:** After Effects can identify non-compliant effects during execution

---

## Command Selector Deep Dive

Command selectors form the communication backbone between After Effects and effect plugins. Understanding the complete selector set and their calling sequence is essential for robust plugin development.

### Global Selectors (Required)

| Selector | Purpose | When Called |
|----------|---------|-------------|
| `PF_Cmd_GLOBAL_SETUP` | Configure plugin behavior and flags | Application launch, plugin load |
| `PF_Cmd_PARAM_SETUP` | Register parameters and custom UI | After global setup |
| `PF_Cmd_ABOUT` | Display plugin information dialog | User requests About |
| `PF_Cmd_GLOBAL_SETDOWN` | Clean up global resources | Application quit |

### Sequence Selectors (Instance Management)

| Selector | Purpose | When Called |
|----------|---------|-------------|
| `PF_Cmd_SEQUENCE_SETUP` | Initialize when effect is applied | Effect first applied to layer |
| `PF_Cmd_SEQUENCE_RESETUP` | Reinitialize after loading or copying | Project open, effect duplication |
| `PF_Cmd_SEQUENCE_FLATTEN` | Prepare data for disk storage | Project save |
| `PF_Cmd_SEQUENCE_SETDOWN` | Release sequence resources | Effect removed, project close |

### Frame Selectors (Per-Frame Rendering)

| Selector | Purpose | When Called |
|----------|---------|-------------|
| `PF_Cmd_FRAME_SETUP` | Allocate frame-specific data | Before each render |
| `PF_Cmd_RENDER` | Perform actual rendering | Main render call |
| `PF_Cmd_FRAME_SETDOWN` | Free temporary frame data | After each render |

### SmartFX Selectors (32-bit Processing)

| Selector | Purpose |
|----------|---------|
| `PF_Cmd_SMART_PRE_RENDER` | Determine input requirements |
| `PF_Cmd_SMART_RENDER` | Perform 32-bit rendering |

### Event Selectors (UI Interaction)

| Selector | Purpose |
|----------|---------|
| `PF_Cmd_EVENT` | Handle custom UI events |
| `PF_Cmd_DO_DIALOG` | Display custom parameter dialog |
| `PF_Cmd_ARBITRARY_CALLBACK` | Handle arbitrary data parameter callbacks |

### Calling Sequence Guarantees

**Initial Application:**
```
PF_Cmd_GLOBAL_SETUP
  → PF_Cmd_PARAM_SETUP
    → PF_Cmd_SEQUENCE_SETUP
```

**Each Rendered Frame:**
```
PF_Cmd_FRAME_SETUP
  → PF_Cmd_RENDER (or PF_Cmd_SMART_PRE_RENDER + PF_Cmd_SMART_RENDER)
    → PF_Cmd_FRAME_SETDOWN
```

**Cleanup:**
```
PF_Cmd_SEQUENCE_SETDOWN
  → PF_Cmd_GLOBAL_SETDOWN
```

---

## Best Practices and Common Pitfalls

### Development Workflow Best Practices

Adobe's recommended six-step development workflow:

1. **Play** - Thoroughly explore After Effects and sample projects before coding. Study existing samples and set breakpoints to understand behavior.

2. **Plan** - Define clearly what your plugin will accomplish before writing code. Document intended behavior and edge cases.

3. **Hack** - Rather than starting from scratch, find an existing sample that resembles your goal. The Skeleton template project is recommended for effects development.

4. **Steal** - Copy the Skeleton directory, rename it, then search-and-replace all instances of "Skeleton" and "SKELETON" with your plugin's name throughout all project files.

5. **Test** - Create test projects with your effect applied and parameters set to extreme values to stress-test the plugin thoroughly.

6. **Blame** - If unexpected behavior occurs, reproduce it using unmodified sample projects to determine whether issues stem from your changes or pre-existing conditions.

### Common Pitfalls to Avoid

| Pitfall | Solution |
|---------|----------|
| **Starting from scratch** | Always base projects on SDK samples |
| **OS memory allocation** | Use After Effects' memory management for significant allocations |
| **Static variables in MFR** | Eliminate or protect all static/global variables |
| **Incorrect PiPL flags** | Ensure PiPL declarations match runtime behavior |
| **Missing coordinate transforms** | Implement all coordinate conversion callbacks for custom UI |
| **Caching layer pixels** | Acquire pixel data just-in-time, release promptly |
| **Ignoring thread safety** | Test thoroughly with MFR enabled |

### Error Handling Best Practices

1. **Use Suite Error Reporting:** Use `AEGP_ItemSuite>AEGP_ReportInfo()` to communicate issues to users while identifying your plugin

2. **Check Suite Availability:** Wrap suite acquisition in try/catch blocks or check for NULL pointers when `ALLOW_NO_SUITE` is true

3. **Handle Missing Features Gracefully:** Degrade functionality gracefully when running on older After Effects versions

4. **Validate Input Parameters:** Check all input data before processing to prevent crashes

5. **Return Appropriate Error Codes:** Use SDK-defined error codes to communicate specific failure conditions

---

## Related Documentation

- [[02-effect-plugins]] - Detailed Effect Plugin Development Guide
- [[03-aegp-plugins]] - AEGP Plugin Development and Function Suites
- [[04-aeio-plugins]] - File Format Import/Export Development
- [[05-artisan-blithook-plugins]] - 3D Rendering Extensions
- [[06-smartfx-gpu-rendering]] - GPU Acceleration and SmartFX
- [[07-multiframe-rendering]] - Multi-Frame Rendering Support
- [[08-parameters-ui]] - Parameter System and User Interface
- [[09-audio-processing]] - Audio Effect Development
- [[10-ppro-compatibility]] - Premiere Pro Cross-Compatibility
