---
source: '[unknown - 08-error-handling-debugging.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Adobe After Effects SDK: Error Handling & Debugging

## Overview

Robust error handling and effective debugging are essential for developing stable, production-quality After Effects plugins. This documentation covers the complete error handling system, debugging configurations for both Windows and macOS, memory management best practices, multi-frame rendering thread safety, and practical troubleshooting techniques.

Understanding these systems ensures plugins behave predictably, gracefully handle failure conditions, and integrate seamlessly with After Effects' resource management infrastructure.

---

## PF_Err Error Codes

After Effects defines a comprehensive set of error codes that plugins must use to communicate status back to the host application. These codes are defined in the SDK headers and follow a consistent pattern.

### Primary Error Codes

| Error Code | Value | Description |
|------------|-------|-------------|
| `PF_Err_NONE` | 0 | Success - operation completed without errors |
| `PF_Err_OUT_OF_MEMORY` | 4 | Memory allocation failed; expected during RAM preview |
| `PF_Err_INTERNAL_STRUCT_DAMAGED` | 512+ | Internal data structure corruption detected |
| `PF_Err_INVALID_INDEX` | - | Array index out of bounds or invalid member access |
| `PF_Err_UNRECOGNIZED_PARAM_TYPE` | - | Parameter type not recognized or data corrupted |
| `PF_Err_INVALID_CALLBACK` | - | Function pointer is invalid or inaccessible |
| `PF_Err_BAD_CALLBACK_PARAM` | - | Invalid parameter passed to callback function |
| `PF_Interrupt_CANCEL` | - | User cancelled operation (pressed Escape) |
| `PF_Err_CANNOT_PARSE_KEYFRAME_TEXT` | - | Failed to parse keyframe data from clipboard |

### Error Code Categories

Understanding error categories helps prioritize debugging efforts:

**Recoverable Errors:**
- `PF_Err_OUT_OF_MEMORY` - Common during RAM preview; handle gracefully
- `PF_Interrupt_CANCEL` - User-initiated; clean up and return immediately

**Critical Errors:**
- `PF_Err_INTERNAL_STRUCT_DAMAGED` - Indicates serious memory corruption
- `PF_Err_INVALID_CALLBACK` - Likely indicates SDK version mismatch

**Validation Errors:**
- `PF_Err_INVALID_INDEX` - Check array bounds before access
- `PF_Err_UNRECOGNIZED_PARAM_TYPE` - Verify parameter definitions
- `PF_Err_BAD_CALLBACK_PARAM` - Review callback usage

### The Golden Rule

> **Always, always, _always_ return a `PF_Err` from `main()`.**

This is the fundamental contract between plugins and After Effects. Every entry point must return an appropriate error code, and every error received from callbacks or suites must be propagated unless explicitly handled.

---

## Error Handling Macros

The After Effects SDK provides two critical macros that implement a fail-fast error handling pattern. These macros eliminate deep nesting while ensuring proper cleanup.

### ERR Macro (Fail-Fast)

The ERR macro executes a function only if no error has occurred, then stores the result:

```c
#define ERR(FUNC) do { if (!err) { err = (FUNC); } } while (0)
```

**Behavior:**
- Checks if `err` equals zero (no prior error)
- If zero, executes `FUNC` and stores return value in `err`
- If non-zero, skips execution entirely

**Why This Matters:**
When an API call fails, all downstream calls are skipped. This prevents cascading failures where subsequent operations would fail or crash due to invalid state from the initial failure. The original error code is preserved, making debugging straightforward.

### ERR2 Macro (Always Execute for Cleanup)

The ERR2 macro always executes but prioritizes preserving the original error:

```c
#define ERR2(FUNC) do { \
    if (((err2 = (FUNC)) != A_Err_NONE) && !err) \
        err = err2; \
} while (0)
```

**Behavior:**
- Always executes `FUNC` regardless of current error state
- Stores result in `err2`
- Only assigns to `err` if `err` was previously zero

**Use Case:**
Cleanup and deallocation operations must always execute to prevent resource leaks, even when prior operations failed. ERR2 ensures cleanup occurs while preserving the original diagnostic error code.

### Standard Usage Pattern

```c
PF_Err MyRenderFunction(
    PF_InData    *in_data,
    PF_OutData   *out_data,
    PF_ParamDef  *params[],
    PF_LayerDef  *output)
{
    PF_Err err = PF_Err_NONE;
    PF_Err err2 = PF_Err_NONE;

    PF_EffectWorld temp;
    AEFX_CLR_STRUCT(temp);

    // Allocate temporary buffer
    ERR(PF_NEW_WORLD(
        in_data,
        output->width,
        output->height,
        PF_NewWorldFlag_NONE,
        &temp));

    // Fill with color (skipped if allocation failed)
    ERR(PF_FILL(
        in_data,
        &params[MY_COLOR_PARAM]->u.cd.value,
        NULL,
        &temp));

    // Blend with output (skipped if fill failed)
    ERR(PF_BLEND(
        in_data,
        output,
        &temp,
        FLOAT2FIX(0.5),
        output));

    // ALWAYS dispose temp buffer, even on error
    if (temp.data) {
        ERR2(PF_DISPOSE_WORLD(in_data, &temp));
    }

    return err;
}
```

### Error Flow Examples

**Scenario 1: Allocation Fails**
```
PF_NEW_WORLD → PF_Err_OUT_OF_MEMORY
PF_FILL → Skipped (err != 0)
PF_BLEND → Skipped (err != 0)
PF_DISPOSE_WORLD → Skipped (temp.data is NULL)
Return: PF_Err_OUT_OF_MEMORY
```

**Scenario 2: Fill Fails (User Cancels)**
```
PF_NEW_WORLD → PF_Err_NONE (temp allocated)
PF_FILL → PF_Interrupt_CANCEL (user pressed Escape)
PF_BLEND → Skipped (err != 0)
PF_DISPOSE_WORLD → Executes via ERR2 (cleanup required)
Return: PF_Interrupt_CANCEL
```

**Scenario 3: All Operations Succeed**
```
PF_NEW_WORLD → PF_Err_NONE
PF_FILL → PF_Err_NONE
PF_BLEND → PF_Err_NONE
PF_DISPOSE_WORLD → Executes via ERR2
Return: PF_Err_NONE
```

### Benefits Over Traditional Error Handling

Without these macros, code becomes deeply nested:

```c
// Without macros - error-prone and hard to read
PF_Err err = PF_Err_NONE;
err = PF_NEW_WORLD(in_data, w, h, 0, &temp);
if (!err) {
    err = PF_FILL(in_data, &color, NULL, &temp);
    if (!err) {
        err = PF_BLEND(in_data, output, &temp, fix, output);
        if (!err) {
            // More nesting...
        }
    }
}
// Easy to forget cleanup here!
if (temp.data) {
    PF_DISPOSE_WORLD(in_data, &temp);
}
return err;
```

The macro pattern keeps code flat and ensures cleanup always occurs.

---

## Displaying Error Messages

To display error messages to the user, set the appropriate output flag and populate the return message:

```c
if (err && err != PF_Interrupt_CANCEL) {
    out_data->out_flags |= PF_OutFlag_DISPLAY_ERROR_MESSAGE;

    PF_SPRINTF(out_data->return_msg,
               "MyPlugin Error: %s",
               GetErrorDescription(err));
}
```

**Best Practices:**
- Don't display messages for `PF_Interrupt_CANCEL` (user-initiated)
- Don't display for `PF_Err_OUT_OF_MEMORY` (After Effects handles this)
- Provide actionable error descriptions when possible
- Log detailed diagnostics for debugging

---

## Debugging Setup

### Windows / Visual Studio Configuration

**Step 1: Set StartUp Project**
1. Open your solution in Visual Studio
2. In Solution Explorer, right-click your plugin project
3. Select "Set as StartUp Project"

**Step 2: Configure Debug Target**
1. Right-click the project again
2. Select "Properties"
3. Navigate to Configuration Properties → Debugging → Command
4. Enter the path to After Effects:
   ```
   C:\Program Files\Adobe\Adobe After Effects 2024\Support Files\AfterFX.exe
   ```

**Step 3: Set Working Directory**
Optionally set the working directory to After Effects' Support Files folder for consistent relative path behavior.

**Step 4: Launch Debugging**
- Press F5 or click the Play button to launch After Effects with debugger attached
- Alternatively, launch After Effects manually and use Debug → Attach to Process

**Debug Build Configuration:**
Ensure your project is set to Debug configuration for:
- Full symbol information (.pdb files)
- Disabled optimizations for accurate stepping
- Debug runtime libraries with additional checks

### macOS / Xcode Configuration

**Step 1: Select Scheme**
1. Open your .xcodeproj in Xcode
2. Select your project in the Project Navigator
3. Go to Product → Scheme → Edit Scheme

**Step 2: Configure Executable**
1. In the scheme editor, select "Run" in the left panel
2. Under the "Info" tab, find "Executable"
3. Select "Other..." and navigate to:
   ```
   /Applications/Adobe After Effects 2024/Adobe After Effects 2024.app
   ```

**Step 3: Launch Debugging**
- Click the Play button or press Cmd+R
- Alternatively, launch After Effects manually and use Debug → Attach to Process

### macOS Code Signing (macOS 15+)

Starting with macOS 15 (Sequoia), unsigned plugins are blocked from loading. During development, apply ad-hoc signing as a build step:

```bash
codesign --force --deep --sign - /path/to/YourPlugin.plugin
```

**Critical Notes:**
- The trailing hyphen (`-`) after `--sign` is essential - it specifies ad-hoc signing
- Do not modify the plugin bundle after signing, as this invalidates the signature
- For distribution, use a proper Apple Developer certificate

**Xcode Build Phase Integration:**
1. Select your target
2. Go to Build Phases
3. Add a new "Run Script" phase
4. Add the codesign command with `${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.plugin`

### Preference Reset Procedure

For a clean debugging environment, reset After Effects preferences:

**Windows:** Hold **Ctrl+Alt+Shift** while launching After Effects

**macOS:** Hold **Cmd+Option+Shift** while launching After Effects

After Effects will prompt to delete preferences - confirm to reset.

**Preference File Locations:**

Windows:
```
%APPDATA%\Adobe\After Effects\<version>\Adobe After Effects <version>-x64 Prefs.txt
```

macOS:
```
~/Library/Preferences/Adobe/After Effects/<version>/Adobe After Effects <version>-x64 Prefs
```

---

## Memory Management

Proper memory management is critical for plugin stability. After Effects provides two primary memory suites: `PF_HandleSuite1` for effect plugins and `AEGP_MemorySuite1` for AEGP plugins.

### Why Use After Effects Memory Functions

> **Use After Effects for any memory allocations of significant size.**

Benefits:
- After Effects tracks allocations and can report leaks
- Memory is managed alongside composition memory budget
- Graceful handling during RAM preview (low memory conditions)
- Prevents competition with host for OS memory
- Automatic cleanup on plugin unload

For small allocations, `new`/`delete` are acceptable but remain the exception.

### PF_HandleSuite1 Functions

The primary memory suite for effect plugins:

| Function | Signature | Purpose |
|----------|-----------|---------|
| `host_new_handle` | `PF_Err (*)(PF_Handle *handlePH, A_HandleSize size)` | Allocate new handle |
| `host_lock_handle` | `void* (*)(PF_Handle h)` | Lock handle, get pointer |
| `host_unlock_handle` | `void (*)(PF_Handle h)` | Unlock handle |
| `host_dispose_handle` | `void (*)(PF_Handle h)` | Free allocated handle |
| `host_get_handle_size` | `A_HandleSize (*)(PF_Handle h)` | Get allocation size |
| `host_resize_handle` | `PF_Err (*)(PF_Handle h, A_HandleSize new_size)` | Resize allocation |

**Usage Example:**

```c
PF_Err AllocateMyData(PF_InData *in_data, MyDataHandle *outHandle)
{
    PF_Err err = PF_Err_NONE;
    PF_Handle handle = NULL;

    PF_HandleSuite1 *handleSuite = NULL;
    ERR(AEFX_AcquireSuite(in_data,
                          out_data,
                          kPFHandleSuite,
                          kPFHandleSuiteVersion1,
                          NULL,
                          (void**)&handleSuite));

    if (!err) {
        ERR(handleSuite->host_new_handle(&handle, sizeof(MyData)));
    }

    if (!err && handle) {
        MyData *data = (MyData*)handleSuite->host_lock_handle(handle);

        // Initialize data
        memset(data, 0, sizeof(MyData));
        data->version = MY_DATA_VERSION;

        handleSuite->host_unlock_handle(handle);
        *outHandle = handle;
    }

    return err;
}
```

**Important Notes:**
- Handles provided by After Effects arrive pre-locked
- Handles auto-unlock when control returns to After Effects
- Always check return value of `host_new_handle`
- Balance lock/unlock calls

### AEGP_MemorySuite1 Functions

For AEGP plugins and advanced memory management:

| Function | Purpose |
|----------|---------|
| `AEGP_NewMemHandle` | Allocate 16-byte aligned memory with tracking |
| `AEGP_FreeMemHandle` | Release allocated memory |
| `AEGP_LockMemHandle` | Lock handle, get void** pointer |
| `AEGP_UnlockMemHandle` | Unlock handle |
| `AEGP_GetMemHandleSize` | Get size of allocation |
| `AEGP_ResizeMemHandle` | Change allocation size |
| `AEGP_SetMemReportingOn` | Enable/disable leak reporting |
| `AEGP_GetMemStats` | Get allocation statistics |

**AEGP Memory Allocation Example:**

```c
PF_Err AllocateAEGPData(AEGP_PluginID pluginID)
{
    PF_Err err = PF_Err_NONE;
    AEGP_MemHandle memHandle = NULL;
    void *dataPtr = NULL;

    AEGP_SuiteHandler suites(pluginID);

    // Allocate with descriptive name for debugging
    ERR(suites.MemorySuite1()->AEGP_NewMemHandle(
        pluginID,
        "MyPlugin: Processing Buffer",  // Shows in leak reports
        BUFFER_SIZE,
        AEGP_MemFlag_CLEAR,             // Zero-initialize
        &memHandle));

    if (!err) {
        ERR(suites.MemorySuite1()->AEGP_LockMemHandle(
            memHandle,
            &dataPtr));
    }

    if (!err) {
        // Use dataPtr...

        // Cleanup
        ERR(suites.MemorySuite1()->AEGP_UnlockMemHandle(memHandle));
    }

    // Free memory
    if (memHandle) {
        ERR(suites.MemorySuite1()->AEGP_FreeMemHandle(memHandle));
    }

    return err;
}
```

### Memory Leak Detection

Enable memory reporting during development to catch leaks:

```c
void EnableLeakDetection(AEGP_PluginID pluginID)
{
    AEGP_SuiteHandler suites(pluginID);

    // Enable reporting
    suites.MemorySuite1()->AEGP_SetMemReportingOn(TRUE);
}

void CheckMemoryStats(AEGP_PluginID pluginID)
{
    AEGP_SuiteHandler suites(pluginID);
    AEGP_MemStats memStats;

    suites.MemorySuite1()->AEGP_GetMemStats(
        pluginID,
        &memStats);

    if (memStats.totalAllocated > 0) {
        // Potential leak - log details
        char msg[256];
        sprintf(msg, "WARNING: %d bytes still allocated in %d handles",
                memStats.totalAllocated,
                memStats.numHandles);
        // Log or display warning
    }
}
```

**Note:** Only allocations through `AEGP_MemorySuite1` are tracked. `PF_HandleSuite1` allocations are not reported through this mechanism.

### STL Container Memory Management

For C++ plugins using STL containers, implement custom allocators rather than overloading global `new`/`delete`:

```c++
template <typename T>
class AEAllocator {
public:
    typedef T value_type;

    AEAllocator() noexcept {}

    template <typename U>
    AEAllocator(const AEAllocator<U>&) noexcept {}

    T* allocate(std::size_t n) {
        PF_Handle handle;
        if (handleSuite->host_new_handle(&handle, n * sizeof(T)) == PF_Err_NONE) {
            return static_cast<T*>(handleSuite->host_lock_handle(handle));
        }
        throw std::bad_alloc();
    }

    void deallocate(T* p, std::size_t n) noexcept {
        // Note: Requires tracking handle from pointer
        // Implementation depends on your handle management strategy
    }

private:
    static PF_HandleSuite1 *handleSuite;
};

// Usage
std::vector<float, AEAllocator<float>> myVector;
```

---

## Thread Safety for Multi-Frame Rendering

After Effects 2022+ uses Multi-Frame Rendering (MFR) by default, executing effect renders on multiple CPU threads simultaneously. Plugins must be thread-safe to support this.

### MFR Support Flags

**PF_OutFlag2_SUPPORTS_THREADED_RENDERING**

Set this flag in GlobalSetup to indicate thread-safe render support:

```c
PF_Err GlobalSetup(
    PF_InData    *in_data,
    PF_OutData   *out_data,
    PF_ParamDef  *params[],
    PF_LayerDef  *output)
{
    out_data->my_version = PF_VERSION(MAJOR, MINOR, BUG, STAGE, BUILD);

    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE |
                          PF_OutFlag_I_EXPAND_BUFFER;

    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE |
                           PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}
```

**PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER**

For backward compatibility when sequence_data writes are required during render:

```c
out_data->out_flags2 |= PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER;
```

When this flag is set, each render thread receives its own copy of sequence_data. This allows writes but reduces performance due to data copying overhead.

### Thread Safety Requirements

An effect is thread-safe when:

1. **No static/global variables with race conditions**
2. **No writes to `in_data->global_data` during render** (reads are allowed)
3. **No writes to `in_data->sequence_data` during render** (use `PF_EffectSequenceDataSuite` for reads)

### Identifying Thread Safety Issues

Adobe provides static analysis tools in the [ae-plugin-thread-safety](https://github.com/adobe/ae-plugin-thread-safety) repository:

**macOS Analysis:**
```bash
./check_symbols_for_thread_safety.sh /path/to/YourPlugin.plugin
```

Uses `nm` to analyze the binary for problematic symbols.

**Windows Analysis:**
```powershell
CheckThreadSafeSymbols.exe YourPlugin.aex
```

Requires Visual Studio with DIA SDK installed and debug symbols (.pdb files).

Both tools output symbol names, types, and source locations for systematic remediation.

### Common Thread Safety Solutions

| Problem | Solution |
|---------|----------|
| Data passed between functions | Convert to function parameters or struct members |
| Read-only lookup tables | Declare as `const` and pre-initialize |
| Runtime-initialized constants | Use `const static` local variables |
| Per-thread state required | Use `thread_local` keyword |
| Shared mutable state | Protect with `std::mutex` and `std::lock_guard` |

**Example: Converting Global to Thread-Local:**

```c++
// BEFORE: Thread-unsafe global
static int g_frameCounter = 0;  // Race condition!

void ProcessFrame() {
    g_frameCounter++;  // Unsafe concurrent access
}

// AFTER: Thread-local variable
static thread_local int t_frameCounter = 0;

void ProcessFrame() {
    t_frameCounter++;  // Safe - each thread has own copy
}
```

**Example: Protecting Shared State:**

```c++
#include <mutex>

class SharedCache {
public:
    void AddEntry(int key, float value) {
        std::lock_guard<std::mutex> lock(mutex_);
        cache_[key] = value;
    }

    float GetEntry(int key) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = cache_.find(key);
        return (it != cache_.end()) ? it->second : 0.0f;
    }

private:
    std::mutex mutex_;
    std::unordered_map<int, float> cache_;
};
```

### Sequence Data Handling (March 2021 SDK+)

The `sequence_data` object became const during render operations. Access requires the `PF_EffectSequenceDataSuite`:

```c
PF_Err ReadSequenceData(PF_InData *in_data)
{
    PF_Err err = PF_Err_NONE;
    PF_EffectSequenceDataSuite1 *seqSuite = NULL;

    ERR(AEFX_AcquireSuite(in_data, out_data,
                          kPFEffectSequenceDataSuite,
                          kPFEffectSequenceDataSuiteVersion1,
                          NULL,
                          (void**)&seqSuite));

    if (!err) {
        PF_ConstHandle constSeqData = NULL;
        ERR(seqSuite->PF_GetConstSequenceData(in_data->effect_ref,
                                               &constSeqData));

        if (!err && constSeqData) {
            const MySequenceData *data =
                (const MySequenceData*)constSeqData;
            // Read-only access to sequence data
        }
    }

    return err;
}
```

For effects using `PF_OutFlag_SEQUENCE_DATA_NEEDS_FLATTENING`, additionally set:
```c
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_GET_FLATTENED_SEQUENCE_DATA;
```

### Compute Cache API

For expensive calculations in multi-threaded renders, use the Compute Cache instead of sequence_data:

```c
// Register cache during GlobalSetup
PF_Err RegisterComputeCache(PF_InData *in_data)
{
    PF_Err err = PF_Err_NONE;
    PF_ComputeCacheSuite1 *cacheSuite = NULL;

    ERR(AEFX_AcquireSuite(in_data, out_data,
                          kPFComputeCacheSuite,
                          kPFComputeCacheSuiteVersion1,
                          NULL,
                          (void**)&cacheSuite));

    if (!err) {
        // Register a compute function
        ERR(cacheSuite->RegisterCompute(
            in_data->effect_ref,
            "MyExpensiveComputation",
            MyComputeFunction,
            MyDeleteFunction,
            &cacheID));
    }

    return err;
}

// During render, check cache or compute
PF_Err GetCachedData(PF_InData *in_data, void **outData)
{
    PF_Err err = PF_Err_NONE;

    // Try to get cached result
    ERR(cacheSuite->Checkout(
        in_data->effect_ref,
        cacheID,
        &cacheKey,
        outData));

    return err;
}
```

### MFR Implementation Checklist

- [ ] Set `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` in GlobalSetup
- [ ] Recompile with March 2021 SDK or later
- [ ] Update `AE_Effect_Global_OutFlags_2` magic number in PiPL
- [ ] Run static analysis tools on compiled binaries
- [ ] Fix all identified static/global variable issues
- [ ] Replace sequence_data writes with Compute Cache
- [ ] Test thoroughly with MFR enabled
- [ ] Verify no crashes under high core-count systems

---

## Interrupt Handling

Users expect responsive plugins that can be cancelled during long operations. After Effects provides two mechanisms for this.

### PF_ABORT()

Check if the user has requested cancellation:

```c
PF_Err ProcessLargeData(PF_InData *in_data, void *data, size_t count)
{
    PF_Err err = PF_Err_NONE;

    for (size_t i = 0; i < count && !err; i++) {
        // Process one item
        ProcessItem(&data[i]);

        // Check for cancel periodically
        if ((i % 100) == 0) {
            ERR(PF_ABORT(in_data));
        }
    }

    return err;  // Returns PF_Interrupt_CANCEL if user aborted
}
```

**Best Practice:** Check abort status periodically (every 100-1000 iterations), not every iteration, to minimize overhead.

### PF_PROGRESS()

Report progress to the user during long operations:

```c
PF_Err ProcessWithProgress(
    PF_InData *in_data,
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;
    A_long totalLines = output->height;

    for (A_long y = 0; y < totalLines && !err; y++) {
        // Process one line
        ProcessLine(output, y);

        // Update progress bar (0 to totalLines)
        ERR(PF_PROGRESS(in_data, y, totalLines));
    }

    return err;
}
```

**Note:** After Effects' iteration functions (like `iterate`) inherently provide abort checking and progress reporting. Manual calls are only needed in custom processing loops.

### Combined Pattern

```c
PF_Err RenderWithFeedback(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_LayerDef *input,
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;
    A_long height = output->height;

    for (A_long y = 0; y < height && !err; y++) {
        for (A_long x = 0; x < output->width && !err; x++) {
            // Expensive per-pixel operation
            PF_Pixel result = ComputePixel(input, x, y);
            SetPixel(output, x, y, result);
        }

        // Check abort and update progress each line
        if (!err) {
            err = PF_ABORT(in_data);
        }
        if (!err) {
            err = PF_PROGRESS(in_data, y, height);
        }
    }

    if (err == PF_Interrupt_CANCEL) {
        // User cancelled - clean up but don't report as error
        // After Effects expects this return value
    }

    return err;
}
```

---

## Tips and Tricks

### Pixel Sampling

Direct pixel access requires careful pointer arithmetic:

```c
// 8-bit per channel sampling
PF_Pixel *sampleIntegral32(PF_EffectWorld *world, int x, int y)
{
    return (PF_Pixel*)((char*)world->data +
                       (y * world->rowbytes) +
                       (x * sizeof(PF_Pixel)));
}

// 16-bit per channel sampling
PF_Pixel16 *sampleIntegral64(PF_EffectWorld *world, int x, int y)
{
    assert(PF_WORLD_IS_DEEP(world));
    return (PF_Pixel16*)((char*)world->data +
                         (y * world->rowbytes) +
                         (x * sizeof(PF_Pixel16)));
}

// 32-bit float per channel sampling
PF_PixelFloat *sampleIntegral128(PF_EffectWorld *world, int x, int y)
{
    // Verify world is float format first
    return (PF_PixelFloat*)((char*)world->data +
                            (y * world->rowbytes) +
                            (x * sizeof(PF_PixelFloat)));
}
```

### Subpixel Sampling Coordinates

**Critical:** Subtract 0.5 from x/y values before calling subpixel or area sample callbacks:

```c
PF_Err SampleSubpixel(
    PF_InData *in_data,
    PF_LayerDef *layer,
    PF_Fixed x,  // In pixel coordinates
    PF_Fixed y,
    PF_Pixel *result)
{
    // Adjust for subpixel sampling coordinate system
    PF_Fixed adjusted_x = x - (1L << 15);  // Subtract 0.5 in fixed point
    PF_Fixed adjusted_y = y - (1L << 15);

    return PF_SUBPIXEL_SAMPLE(in_data, 0, adjusted_x, adjusted_y, result);
}
```

**Note:** Matrix transformation functions do not require this adjustment.

### Text Layer Origin

Unlike other layer types, text layers have their origin at the bottom-left baseline rather than upper-left:

```c
void GetLayerOrigin(AEGP_LayerH layer, A_FloatPoint *origin)
{
    AEGP_ObjectType type;
    aegpSuite->AEGP_GetLayerObjectType(layer, &type);

    if (type == AEGP_ObjectType_TEXT) {
        // Text: origin at baseline, bottom-left
        origin->x = 0;
        origin->y = layerHeight;  // Baseline position
    } else {
        // Other layers: origin at top-left
        origin->x = 0;
        origin->y = 0;
    }
}
```

### Speed/Velocity Parameters

If implementing velocity-based parameters, integrate properly:

```c
// WRONG: Simple multiplication
float distance = speed * time;  // Incorrect for non-constant speed

// CORRECT: Integrate from time zero
float CalculateDistance(
    PF_InData *in_data,
    PF_ParamDef *speedParam,
    A_Time currentTime)
{
    float distance = 0;
    float dt = 1.0f / in_data->time_scale;  // Time step

    for (float t = 0; t < currentTime.value; t += dt) {
        // Sample speed at time t
        float speedAtT = SampleParameterAtTime(speedParam, t);
        distance += speedAtT * dt;
    }

    return distance;
}

// BETTER: Provide a "phase" parameter as alternative
// Phase gives direct position control without integration
```

### Dynamic OutFlags for Caching

Support dynamic outflags to prevent unnecessary cache invalidation:

```c
PF_Err QueryDynamicFlags(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[])
{
    PF_Err err = PF_Err_NONE;

    // Only set NON_PARAM_VARY if we actually use random/time
    if (UsesRandomness(params)) {
        out_data->out_flags |= PF_OutFlag_NON_PARAM_VARY;
    }

    // Only set WIDE_TIME_INPUT if we sample other frames
    if (NeedsTemporalAccess(params)) {
        out_data->out_flags |= PF_OutFlag_WIDE_TIME_INPUT;
    }

    return err;
}
```

### Version Number Updates

When shipping bug fixes, update your plugin's version number:

```c
// In GlobalSetup
out_data->my_version = PF_VERSION(
    MAJOR_VERSION,
    MINOR_VERSION,
    BUG_VERSION + 1,  // Increment for bug fix
    PF_Stage_RELEASE,
    BUILD_NUMBER);
```

This invalidates cached frames since version is part of the cache key.

---

## Testing Checklist

Before releasing a plugin, verify these scenarios:

### Memory Handling
- [ ] Out-of-memory gracefully handled (returns PF_Err_OUT_OF_MEMORY)
- [ ] Works during RAM preview (memory pressure)
- [ ] No memory leaks (use AEGP_SetMemReportingOn)
- [ ] Handles large allocations gracefully

### User Interaction
- [ ] Cancel (Escape) works during long renders
- [ ] Progress bar updates during processing
- [ ] Error messages are helpful and actionable

### Edge Cases
- [ ] Works on audio-only layers (if applicable)
- [ ] Handles projects from older plugin versions
- [ ] Parameter checkout/checkin occurs even on errors
- [ ] Empty layers handled correctly
- [ ] Zero-duration layers handled

### Multi-Frame Rendering
- [ ] Static analysis passes with no warnings
- [ ] Concurrent renders produce identical results
- [ ] No crashes under high thread counts
- [ ] Performance scales with core count

### Platform-Specific
- [ ] Windows: 32-bit and 64-bit builds (if applicable)
- [ ] macOS: Universal binary (Intel + Apple Silicon)
- [ ] macOS: Code signing works correctly
- [ ] Both platforms produce identical results

---

## Troubleshooting Common Issues

### Plugin Not Loading

**Symptoms:** Plugin doesn't appear in Effects menu

**Checks:**
1. Verify plugin is in correct folder:
   - Windows: `C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\`
   - macOS: `/Library/Application Support/Adobe/Common/Plug-ins/7.0/MediaCore/`
2. Check code signing (macOS 15+)
3. Verify architecture matches (ARM vs Intel, 32 vs 64-bit)
4. Check Console.app (macOS) or Event Viewer (Windows) for errors

### Crash on Apply

**Symptoms:** After Effects crashes when effect is applied

**Likely Causes:**
- NULL pointer dereference in PF_Cmd_GLOBAL_SETUP or PF_Cmd_SEQUENCE_SETUP
- Incorrect parameter definitions
- Missing suite acquisition

**Debug Strategy:**
1. Attach debugger before applying effect
2. Set breakpoints in GlobalSetup and SequenceSetup
3. Verify all pointers before use

### Incorrect Rendering

**Symptoms:** Visual artifacts, wrong colors, or missing pixels

**Likely Causes:**
- Incorrect rowbytes handling
- Ignoring bit depth (8/16/32-bit)
- Not handling alpha correctly
- Wrong coordinate system

**Debug Strategy:**
1. Verify pixel format detection
2. Check rowbytes calculation
3. Test at different bit depths
4. Compare against known-good reference

### Memory Leaks

**Symptoms:** After Effects memory usage grows over time

**Detection:**
```c
// Enable at plugin start
AEGP_SetMemReportingOn(TRUE);

// Check periodically or at unload
AEGP_MemStats stats;
AEGP_GetMemStats(pluginID, &stats);
```

**Common Causes:**
- Missing PF_DISPOSE_WORLD calls
- Unbalanced lock/unlock
- Missing AEGP_FreeMemHandle
- C++ exceptions bypassing cleanup

---

## Advanced Error Handling Patterns

### RAII-Style Resource Management

For C++ plugins, implement RAII (Resource Acquisition Is Initialization) wrappers to ensure automatic cleanup:

```c++
class AutoWorld {
public:
    AutoWorld(PF_InData *in_data, A_long width, A_long height)
        : in_data_(in_data), world_()
    {
        AEFX_CLR_STRUCT(world_);
        err_ = PF_NEW_WORLD(in_data_, width, height,
                            PF_NewWorldFlag_NONE, &world_);
    }

    ~AutoWorld() {
        if (world_.data) {
            PF_DISPOSE_WORLD(in_data_, &world_);
        }
    }

    // Prevent copying
    AutoWorld(const AutoWorld&) = delete;
    AutoWorld& operator=(const AutoWorld&) = delete;

    PF_Err GetError() const { return err_; }
    PF_EffectWorld* Get() { return world_.data ? &world_ : nullptr; }
    operator bool() const { return err_ == PF_Err_NONE && world_.data; }

private:
    PF_InData *in_data_;
    PF_EffectWorld world_;
    PF_Err err_;
};

// Usage
PF_Err ProcessWithAutoWorld(PF_InData *in_data, PF_LayerDef *output)
{
    AutoWorld temp(in_data, output->width, output->height);
    if (!temp) return temp.GetError();

    // Use temp.Get() - automatically disposed when function returns
    return PF_Err_NONE;
}
```

### Exception-Safe Error Handling

When mixing C++ exceptions with C-style error codes:

```c++
PF_Err SafeRender(PF_InData *in_data, PF_OutData *out_data)
{
    PF_Err err = PF_Err_NONE;

    try {
        // C++ code that might throw
        ProcessData();

    } catch (const std::bad_alloc&) {
        err = PF_Err_OUT_OF_MEMORY;

    } catch (const std::exception& e) {
        err = PF_Err_INTERNAL_STRUCT_DAMAGED;
        PF_SPRINTF(out_data->return_msg, "Exception: %s", e.what());
        out_data->out_flags |= PF_OutFlag_DISPLAY_ERROR_MESSAGE;

    } catch (...) {
        err = PF_Err_INTERNAL_STRUCT_DAMAGED;
    }

    return err;
}
```

### Conditional Logging for Debug Builds

Implement debug-only logging that compiles out in release:

```c++
#ifdef _DEBUG
#define AE_LOG(msg, ...) DebugLog(__FILE__, __LINE__, msg, ##__VA_ARGS__)
#else
#define AE_LOG(msg, ...) ((void)0)
#endif

void DebugLog(const char *file, int line, const char *fmt, ...)
{
#ifdef _DEBUG
    char buffer[1024];
    va_list args;
    va_start(args, fmt);
    vsnprintf(buffer, sizeof(buffer), fmt, args);
    va_end(args);

#ifdef _WIN32
    OutputDebugStringA(buffer);
    OutputDebugStringA("\n");
#else
    fprintf(stderr, "[%s:%d] %s\n", file, line, buffer);
#endif
#endif
}

// Usage
AE_LOG("Processing frame %d, params: blend=%.2f", frameNum, blendAmount);
```

---

## Platform-Specific Debugging Techniques

### Windows: Using Output Debug String

Capture debug output in Visual Studio or DebugView:

```c++
#include <Windows.h>

void WinDebugPrint(const char *format, ...)
{
    char buffer[2048];
    va_list args;
    va_start(args, format);
    vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);

    OutputDebugStringA(buffer);
}

// Usage during render
WinDebugPrint("MyPlugin: Frame %d, err=%d\n", frameNum, err);
```

**Viewing Output:**
- Visual Studio: View > Output window shows debug strings
- Standalone: Use Sysinternals DebugView utility

### macOS: Using Console.app and os_log

Modern macOS logging with Console.app integration:

```c++
#include <os/log.h>

static os_log_t myPluginLog = NULL;

void InitLogging() {
    myPluginLog = os_log_create("com.mycompany.myplugin", "render");
}

void MacDebugPrint(const char *format, ...)
{
    char buffer[2048];
    va_list args;
    va_start(args, format);
    vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);

    os_log_debug(myPluginLog, "%{public}s", buffer);
}
```

**Viewing Output:**
- Open Console.app
- Filter by "com.mycompany.myplugin"
- Or use: `log stream --predicate 'subsystem == "com.mycompany.myplugin"'`

### Crash Dump Analysis

**Windows Crash Dumps:**
1. Configure After Effects to generate dumps:
   - Set registry: `HKLM\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps`
   - Add AfterFX.exe subkey with DumpFolder and DumpType values
2. Reproduce crash
3. Open dump in Visual Studio with matching .pdb files

**macOS Crash Reports:**
1. Crashes generate reports in `~/Library/Logs/DiagnosticReports/`
2. Find After Effects crash report
3. Look for your plugin's symbols in the backtrace
4. Use `atos` to symbolicate addresses if needed

---

## Performance Profiling

### Measuring Render Time

Track performance to identify bottlenecks:

```c++
#include <chrono>

class ScopedTimer {
public:
    ScopedTimer(const char *name) : name_(name) {
        start_ = std::chrono::high_resolution_clock::now();
    }

    ~ScopedTimer() {
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start_);
        AE_LOG("%s took %lld us", name_, duration.count());
    }

private:
    const char *name_;
    std::chrono::high_resolution_clock::time_point start_;
};

// Usage
PF_Err Render(PF_InData *in_data, PF_LayerDef *output)
{
    ScopedTimer timer("Render");  // Logs duration when scope exits

    {
        ScopedTimer blurTimer("GaussianBlur");
        ApplyGaussianBlur(output);
    }

    {
        ScopedTimer colorTimer("ColorCorrection");
        ApplyColorCorrection(output);
    }

    return PF_Err_NONE;
}
```

### Memory Usage Tracking

Monitor allocations during development:

```c++
class MemoryTracker {
public:
    static void ReportAllocation(const char *name, size_t bytes) {
        totalAllocated_ += bytes;
        AE_LOG("ALLOC: %s = %zu bytes (total: %zu)",
               name, bytes, totalAllocated_);
    }

    static void ReportDeallocation(const char *name, size_t bytes) {
        totalAllocated_ -= bytes;
        AE_LOG("FREE: %s = %zu bytes (total: %zu)",
               name, bytes, totalAllocated_);
    }

    static size_t GetTotalAllocated() { return totalAllocated_; }

private:
    static size_t totalAllocated_;
};

size_t MemoryTracker::totalAllocated_ = 0;
```

---

## Summary

Effective error handling and debugging practices are fundamental to professional After Effects plugin development:

1. **Always return PF_Err codes** - The host depends on accurate error reporting
2. **Use ERR/ERR2 macros** - They provide clean, maintainable error handling
3. **Manage memory through AE suites** - Enables tracking and prevents conflicts
4. **Support MFR** - Modern AE requires thread-safe plugins
5. **Handle interrupts** - Keep plugins responsive with PF_ABORT/PF_PROGRESS
6. **Test thoroughly** - Cover edge cases, platforms, and memory conditions

Following these practices ensures plugins that are stable, performant, and provide good user experiences across the full range of After Effects workflows.

---

## References

- [After Effects C++ SDK: Errors](https://ae-plugins.docsforadobe.dev/effect-basics/errors/)
- [After Effects C++ SDK: Debugging Plug-ins](https://ae-plugins.docsforadobe.dev/intro/debugging-plug-ins/)
- [After Effects C++ SDK: Memory Allocation](https://ae-plugins.docsforadobe.dev/effect-details/memory-allocation/)
- [After Effects C++ SDK: Multi-Frame Rendering](https://ae-plugins.docsforadobe.dev/effect-details/multi-frame-rendering-in-ae/)
- [After Effects C++ SDK: Tips & Tricks](https://ae-plugins.docsforadobe.dev/effect-details/tips-tricks/)
- [After Effects C++ SDK: AEGP Suites](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Plugin Everything: Error Handling in the After Effects SDK](https://www.plugineverything.com/ramblings/error-handling-aesdk)
- [Adobe Thread Safety Tools](https://github.com/adobe/ae-plugin-thread-safety)
