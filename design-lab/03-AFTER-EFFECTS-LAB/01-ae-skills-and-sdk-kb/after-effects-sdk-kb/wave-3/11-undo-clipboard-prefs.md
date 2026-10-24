---
source: '[unknown - 11-undo-clipboard-prefs.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
 Undo, Clipboard, and Preferences APIs

## Executive Summary

This document provides comprehensive coverage of Adobe After Effects SDK APIs for undo management, persistent data storage, and preference handling. These systems enable plugins to integrate with After Effects' undo stack, persist configuration across sessions, and serialize data for project storage.

**Key Suites Covered:**
- `AEGP_UtilitySuite6` - Undo group management and error reporting
- `AEGP_PersistentDataSuite4` - Application preferences storage
- `PF_HandleSuite1` - Memory handle management for sequence data
- `PF_EffectSequenceDataSuite1` - Thread-safe sequence data access

---

## Table of Contents

1. [Undo Management](#undo-management)
   - [AEGP_UtilitySuite Overview](#aegp_utilitysuite-overview)
   - [Undo Group Functions](#undo-group-functions)
   - [Undo Coalescing and Nesting](#undo-coalescing-and-nesting)
   - [Best Practices](#undo-best-practices)
2. [Persistent Data Storage](#persistent-data-storage)
   - [AEGP_PersistentDataSuite Overview](#aegp_persistentdatasuite-overview)
   - [Persistent Type Enumeration](#persistent-type-enumeration)
   - [Data Access Functions](#data-access-functions)
   - [Section and Key Organization](#section-and-key-organization)
3. [Sequence Data Serialization](#sequence-data-serialization)
   - [Sequence Data Lifecycle](#sequence-data-lifecycle)
   - [Flattening and Unflattening](#flattening-and-unflattening)
   - [Multi-Frame Rendering Considerations](#multi-frame-rendering-considerations)
4. [Arbitrary Data Parameters](#arbitrary-data-parameters)
   - [Arb Data Callbacks](#arb-data-callbacks)
   - [Serialization Functions](#serialization-functions)
5. [Clipboard Access](#clipboard-access)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)

---

## Undo Management

### AEGP_UtilitySuite Overview

The `AEGP_UtilitySuite` provides undo stack management, error reporting, and utility functions. The current version is **AEGP_UtilitySuite6**.

```cpp
// Suite acquisition
#define kAEGPUtilitySuite       "AEGP Utility Suite"
#define kAEGPUtilitySuiteVersion6   6

AEGP_UtilitySuite6 *utilitySuite;
AEGP_GetSuite(
    in_data->pica_basicP,
    kAEGPUtilitySuite,
    kAEGPUtilitySuiteVersion6,
    (const void**)&utilitySuite
);
```

### Undo Group Functions

#### AEGP_StartUndoGroup

Begins an undo group that bundles multiple operations into a single undoable action.

```cpp
A_Err AEGP_StartUndoGroup(
    const A_char *undo_nameZ    // Name displayed in Edit menu
);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `undo_nameZ` | `const A_char*` | Undo action name shown in Edit > Undo menu. Pass `NULL` for operations that should not appear in undo history. |

#### AEGP_EndUndoGroup

Closes the current undo group, finalizing all operations as a single undoable action.

```cpp
A_Err AEGP_EndUndoGroup(void);
```

**Critical:** Every `AEGP_StartUndoGroup` must be balanced with `AEGP_EndUndoGroup`. Unbalanced calls can cause UI failures including dialogs not opening.

### Undo Coalescing and Nesting

Undo groups support nesting. Inner groups become part of the outer group, and inner group names are ignored:

```cpp
// Outer group name "Batch Edit" will be used
suites.UtilitySuite6()->AEGP_StartUndoGroup("Batch Edit");
{
    // This name is ignored due to nesting
    suites.UtilitySuite6()->AEGP_StartUndoGroup("Modify Layer");
    // ... layer modifications ...
    suites.UtilitySuite6()->AEGP_EndUndoGroup();

    // This name is also ignored
    suites.UtilitySuite6()->AEGP_StartUndoGroup("Add Keyframes");
    // ... keyframe operations ...
    suites.UtilitySuite6()->AEGP_EndUndoGroup();
}
suites.UtilitySuite6()->AEGP_EndUndoGroup();
// User sees "Undo Batch Edit" in menu
```

### Undo Best Practices

#### Threading Requirements

Undo operations must execute on the **UI thread**. Do not call from:
- Render threads
- Background processing threads
- `PF_EVENT_DRAW` handlers (passive UI updates)

```cpp
// WRONG: Called from render thread
PF_Err Render(...) {
    suites.UtilitySuite6()->AEGP_StartUndoGroup("Bad Idea");  // Will fail
    // ...
}

// CORRECT: Called from UI event handler
PF_Err HandleClick(...) {
    suites.UtilitySuite6()->AEGP_StartUndoGroup("Apply Settings");
    // ... modify project state ...
    suites.UtilitySuite6()->AEGP_EndUndoGroup();
}
```

#### Slider/Continuous Change Pattern

For continuous UI interactions (sliders, drag operations), manage undo groups carefully:

```cpp
class MyPanel {
    bool undoGroupInProgress = false;

    void OnSliderDragStart() {
        if (!undoGroupInProgress) {
            suites.UtilitySuite6()->AEGP_StartUndoGroup("Adjust Value");
            undoGroupInProgress = true;
        }
    }

    void OnSliderDragEnd() {
        if (undoGroupInProgress) {
            suites.UtilitySuite6()->AEGP_EndUndoGroup();
            undoGroupInProgress = false;
        }
    }
};
```

#### NULL Undo Group Name

Pass `NULL` for internal operations that should not create user-visible undo entries:

```cpp
suites.UtilitySuite6()->AEGP_StartUndoGroup(NULL);
// Internal state synchronization
suites.UtilitySuite6()->AEGP_EndUndoGroup();
```

**Note:** Some operations like `PF_OutFlag_FORCE_RERENDER` may still create undo entries despite NULL name.

---

## Persistent Data Storage

### AEGP_PersistentDataSuite Overview

The `AEGP_PersistentDataSuite` stores plugin preferences in After Effects' preferences file, persisting across sessions but outside of project files.

```cpp
#define kAEGPPersistentDataSuite        "AEGP Persistent Data Suite"
#define kAEGPPersistentDataSuiteVersion4    4

AEGP_PersistentDataSuite4 *persistentDataSuite;
```

### Persistent Type Enumeration

Version 4 introduced `AEGP_PersistentType` to select which preference blob to access:

```cpp
typedef enum {
    AEGP_PersistentType_MACHINE_SPECIFIC,       // Per-machine settings
    AEGP_PersistentType_MACHINE_INDEPENDENT,    // Portable settings
    AEGP_PersistentType_MACHINE_SPECIFIC_RENDER,
    AEGP_PersistentType_MACHINE_INDEPENDENT_RENDER
} AEGP_PersistentType;
```

| Type | Use Case |
|------|----------|
| `MACHINE_SPECIFIC` | Hardware-dependent settings (paths, GPU selections) |
| `MACHINE_INDEPENDENT` | User preferences portable across machines |
| `*_RENDER` variants | Settings specific to render processes |

### Data Access Functions

#### Getting the Application Blob

```cpp
A_Err AEGP_GetApplicationBlob(
    AEGP_PersistentType     type,       // Which blob to retrieve
    AEGP_PersistentBlobH    *blobPH     // Output: preference blob handle
);
```

#### Primitive Data Functions

| Function | Purpose | Notes |
|----------|---------|-------|
| `AEGP_GetLong` / `AEGP_SetLong` | Integer storage | 32-bit signed integers |
| `AEGP_GetFpLong` / `AEGP_SetFpLong` | Floating-point | 6 decimal precision |
| `AEGP_GetString` / `AEGP_SetString` | Text values | Null-terminated strings |
| `AEGP_GetData` / `AEGP_SetData` | Binary data | Arbitrary byte sequences |
| `AEGP_GetTime` / `AEGP_SetTime` | Time values | Added in v4 |
| `AEGP_GetARGB` / `AEGP_SetARGB` | Color values | Added in v4 |

#### Function Signatures

```cpp
// Long integer
A_Err AEGP_GetLong(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ,
    A_long                  defaultVal,
    A_long                  *valuePL
);

A_Err AEGP_SetLong(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ,
    A_long                  value
);

// String
A_Err AEGP_GetString(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ,
    const A_char            *defaultZ,
    A_u_long                buf_sizeLu,
    A_char                  *bufZ,
    A_u_long                *actual_sizePLu
);

A_Err AEGP_SetString(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ,
    const A_char            *strZ
);

// Binary data
A_Err AEGP_GetData(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ,
    A_u_long                data_sizeLu,
    void                    *dataPV,
    A_u_long                *actual_sizePLu
);

A_Err AEGP_SetData(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ,
    A_u_long                data_sizeLu,
    const void              *dataPV
);
```

#### Management Functions

```cpp
// Check if key exists
A_Err AEGP_DoesKeyExist(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ,
    A_Boolean               *existsPB
);

// Delete a key
A_Err AEGP_DeleteEntry(
    AEGP_PersistentBlobH    blobH,
    const A_char            *sectionZ,
    const A_char            *keyZ
);

// Count sections
A_Err AEGP_GetNumSections(
    AEGP_PersistentBlobH    blobH,
    A_long                  *num_sectionsPL
);
```

### Section and Key Organization

Preferences are organized hierarchically with sections and keys:

```
[MyPlugin Settings]
"Version" = "1.0.0"
"LastUsedPreset" = "Default"
"MaxThreads" = "4"

[MyPlugin License]
"Registered" = "1"
"LicenseKey" = "XXXX-XXXX-XXXX"
```

**Naming Conventions:**
- Use your plugin name as section prefix
- Keep key names descriptive but concise
- Section names may change between AE versions

---

## Sequence Data Serialization

### Sequence Data Lifecycle

Sequence data stores instance-specific information that persists in project files.

| Selector | Purpose | Trigger |
|----------|---------|---------|
| `PF_Cmd_SEQUENCE_SETUP` | Allocate sequence data | Effect applied |
| `PF_Cmd_SEQUENCE_RESETUP` | Restore from flat/unflat data | Project load, undo |
| `PF_Cmd_SEQUENCE_FLATTEN` | Convert to disk-safe format | Project save |
| `PF_Cmd_GET_FLATTENED_SEQUENCE_DATA` | Non-destructive flatten (preferred) | MFR, caching |
| `PF_Cmd_SEQUENCE_SETDOWN` | Deallocate sequence data | Effect removed |

### Flattening and Unflattening

**Unflat data** may contain pointers to external memory. **Flat data** is a self-contained, serializable block.

```cpp
// Example structures
typedef struct {
    A_long      version;
    A_long      data_size;
    A_char      name[256];
    A_FpLong    values[10];
    // No pointers - safe for direct serialization
} FlatSequenceData;

typedef struct {
    A_long      version;
    A_char      *dynamicString;     // External pointer - requires flattening
    A_FpLong    *valueArray;        // External pointer - requires flattening
    A_long      arraySize;
} UnflatSequenceData;
```

#### Flattening Implementation

```cpp
PF_Err HandleSequenceFlatten(
    PF_InData       *in_data,
    PF_OutData      *out_data)
{
    UnflatSequenceData *unflat = (UnflatSequenceData*)
        PF_LOCK_HANDLE(in_data->sequence_data);

    // Calculate flat size
    A_long flatSize = sizeof(FlatSequenceData);

    // Allocate flat handle
    PF_Handle flatH = PF_NEW_HANDLE(flatSize);
    FlatSequenceData *flat = (FlatSequenceData*)PF_LOCK_HANDLE(flatH);

    // Copy data to contiguous block
    flat->version = unflat->version;
    flat->data_size = flatSize;
    strncpy(flat->name, unflat->dynamicString, 255);
    memcpy(flat->values, unflat->valueArray,
           sizeof(A_FpLong) * MIN(unflat->arraySize, 10));

    PF_UNLOCK_HANDLE(flatH);
    PF_UNLOCK_HANDLE(in_data->sequence_data);

    // Dispose old, assign new
    PF_DISPOSE_HANDLE(in_data->sequence_data);
    out_data->sequence_data = flatH;

    return PF_Err_NONE;
}
```

#### Unflattening Implementation

```cpp
PF_Err HandleSequenceResetup(
    PF_InData       *in_data,
    PF_OutData      *out_data)
{
    // Check if data is flat or unflat using a flag at known offset
    A_long *dataPtr = (A_long*)PF_LOCK_HANDLE(in_data->sequence_data);
    A_Boolean isFlat = (dataPtr[0] == FLAT_DATA_MAGIC);
    PF_UNLOCK_HANDLE(in_data->sequence_data);

    if (isFlat) {
        // Unflatten: convert to working structure
        FlatSequenceData *flat = (FlatSequenceData*)
            PF_LOCK_HANDLE(in_data->sequence_data);

        PF_Handle unflatH = PF_NEW_HANDLE(sizeof(UnflatSequenceData));
        UnflatSequenceData *unflat = (UnflatSequenceData*)
            PF_LOCK_HANDLE(unflatH);

        unflat->version = flat->version;
        unflat->dynamicString = strdup(flat->name);
        unflat->arraySize = 10;
        unflat->valueArray = malloc(sizeof(A_FpLong) * 10);
        memcpy(unflat->valueArray, flat->values, sizeof(A_FpLong) * 10);

        PF_UNLOCK_HANDLE(unflatH);
        PF_UNLOCK_HANDLE(in_data->sequence_data);

        PF_DISPOSE_HANDLE(in_data->sequence_data);
        out_data->sequence_data = unflatH;
    }

    return PF_Err_NONE;
}
```

### Cross-Platform Byte Ordering

Projects may transfer between macOS and Windows. Handle endianness:

```cpp
// Portable serialization
void WriteInt32(A_u_char *buf, A_long value) {
    buf[0] = (value >> 24) & 0xFF;
    buf[1] = (value >> 16) & 0xFF;
    buf[2] = (value >> 8) & 0xFF;
    buf[3] = value & 0xFF;
}

A_long ReadInt32(const A_u_char *buf) {
    return ((A_long)buf[0] << 24) |
           ((A_long)buf[1] << 16) |
           ((A_long)buf[2] << 8) |
           (A_long)buf[3];
}
```

### Multi-Frame Rendering Considerations

With Multi-Frame Rendering (AE 2022+), sequence data becomes read-only during render:

```cpp
// Acquire suite
PF_EffectSequenceDataSuite1 *seqDataSuite;
AEFX_AcquireSuite(
    in_data,
    out_data,
    kPFEffectSequenceDataSuite,
    kPFEffectSequenceDataSuiteVersion1,
    (void**)&seqDataSuite
);

// Thread-safe read access
const void *const_seq;
seqDataSuite->PF_GetConstSequenceData(
    in_data->effect_ref,
    &const_seq
);

// Cast to your type (read-only!)
const MySequenceData *seq = (const MySequenceData*)const_seq;
```

**Important Flags:**

| Flag | Purpose |
|------|---------|
| `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` | Enable MFR (sequence data becomes const) |
| `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER` | Allow writes but reduce concurrency |

---

## Arbitrary Data Parameters

### Arb Data Callbacks

Arbitrary data parameters require implementing all callback selectors:

| Selector | Purpose | Required |
|----------|---------|----------|
| `PF_Arbitrary_NEW_FUNC` | Allocate new instance | Yes |
| `PF_Arbitrary_DISPOSE_FUNC` | Free instance | Yes |
| `PF_Arbitrary_COPY_FUNC` | Duplicate instance | Yes |
| `PF_Arbitrary_FLAT_SIZE_FUNC` | Report flat buffer size | Yes |
| `PF_Arbitrary_FLATTEN_FUNC` | Serialize to buffer | Yes |
| `PF_Arbitrary_UNFLATTEN_FUNC` | Deserialize from buffer | Yes |
| `PF_Arbitrary_INTERP_FUNC` | Interpolate between values | Yes |
| `PF_Arbitrary_COMPARE_FUNC` | Compare two instances | Yes |
| `PF_Arbitrary_PRINT_SIZE_FUNC` | Text export size | Optional |
| `PF_Arbitrary_PRINT_FUNC` | Format as text | Optional |
| `PF_Arbitrary_SCAN_FUNC` | Parse from text | Optional |

### Serialization Functions

```cpp
PF_Err HandleArbitraryCallback(
    PF_InData           *in_data,
    PF_OutData          *out_data,
    PF_ArbParamsExtra   *extra)
{
    PF_Err err = PF_Err_NONE;

    switch (extra->which_function) {
        case PF_Arbitrary_NEW_FUNC:
            err = ArbNew(in_data, out_data, extra);
            break;

        case PF_Arbitrary_DISPOSE_FUNC:
            err = ArbDispose(extra->u.dispose_func_params.arbH);
            break;

        case PF_Arbitrary_COPY_FUNC:
            err = ArbCopy(
                extra->u.copy_func_params.src_arbH,
                extra->u.copy_func_params.dst_arbPH
            );
            break;

        case PF_Arbitrary_FLAT_SIZE_FUNC:
            err = ArbFlatSize(
                extra->u.flat_size_func_params.arbH,
                extra->u.flat_size_func_params.flat_data_sizePLu
            );
            break;

        case PF_Arbitrary_FLATTEN_FUNC:
            err = ArbFlatten(
                extra->u.flatten_func_params.arbH,
                extra->u.flatten_func_params.buf_sizeLu,
                extra->u.flatten_func_params.flat_dataPV
            );
            break;

        case PF_Arbitrary_UNFLATTEN_FUNC:
            err = ArbUnflatten(
                extra->u.unflatten_func_params.buf_sizeLu,
                extra->u.unflatten_func_params.flat_dataPV,
                extra->u.unflatten_func_params.arbPH
            );
            break;

        case PF_Arbitrary_INTERP_FUNC:
            err = ArbInterpolate(
                extra->u.interp_func_params.left_arbH,
                extra->u.interp_func_params.right_arbH,
                extra->u.interp_func_params.tF,
                extra->u.interp_func_params.interpPH
            );
            break;

        case PF_Arbitrary_COMPARE_FUNC:
            err = ArbCompare(
                extra->u.compare_func_params.a_arbH,
                extra->u.compare_func_params.b_arbH,
                extra->u.compare_func_params.compareP
            );
            break;
    }

    return err;
}
```

### Comparison Results

```cpp
typedef enum {
    PF_ArbCompare_EQUAL = 0,
    PF_ArbCompare_LESS,
    PF_ArbCompare_MORE,
    PF_ArbCompare_NOT_EQUAL
} PF_ArbCompareResult;
```

---

## Clipboard Access

### SDK Limitations

The After Effects C++ SDK does **not** provide direct clipboard API access. Clipboard functionality requires:

1. **Platform-native APIs** - Win32 clipboard functions or macOS NSPasteboard
2. **ExtendScript workarounds** - Using menu commands
3. **Third-party solutions** - CEP panels with Node.js

### Platform-Native Approach (Windows)

```cpp
#include <Windows.h>

bool CopyTextToClipboard(const char* text) {
    if (!OpenClipboard(NULL)) return false;
    EmptyClipboard();

    size_t len = strlen(text) + 1;
    HGLOBAL hMem = GlobalAlloc(GMEM_MOVEABLE, len);
    if (hMem) {
        memcpy(GlobalLock(hMem), text, len);
        GlobalUnlock(hMem);
        SetClipboardData(CF_TEXT, hMem);
    }

    CloseClipboard();
    return true;
}
```

### Platform-Native Approach (macOS)

```cpp
#include <Cocoa/Cocoa.h>

bool CopyTextToClipboard(const char* text) {
    NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
    [pasteboard clearContents];

    NSString *nsText = [NSString stringWithUTF8String:text];
    return [pasteboard setString:nsText forType:NSPasteboardTypeString];
}
```

---

## Code Examples

### Complete Preferences Manager

```cpp
class PreferencesManager {
    AEGP_PersistentDataSuite4 *m_suite;
    AEGP_PersistentBlobH m_blobH;
    const char *m_section;

public:
    PreferencesManager(SPBasicSuite *pica, const char *section)
        : m_suite(nullptr), m_blobH(nullptr), m_section(section)
    {
        pica->AcquireSuite(
            kAEGPPersistentDataSuite,
            kAEGPPersistentDataSuiteVersion4,
            (const void**)&m_suite
        );

        if (m_suite) {
            m_suite->AEGP_GetApplicationBlob(
                AEGP_PersistentType_MACHINE_INDEPENDENT,
                &m_blobH
            );
        }
    }

    bool GetInt(const char *key, A_long defaultVal, A_long *outVal) {
        if (!m_suite || !m_blobH) return false;
        return m_suite->AEGP_GetLong(
            m_blobH, m_section, key, defaultVal, outVal
        ) == A_Err_NONE;
    }

    bool SetInt(const char *key, A_long value) {
        if (!m_suite || !m_blobH) return false;
        return m_suite->AEGP_SetLong(
            m_blobH, m_section, key, value
        ) == A_Err_NONE;
    }

    bool GetString(const char *key, const char *defaultVal,
                   char *buf, A_u_long bufSize) {
        if (!m_suite || !m_blobH) return false;
        A_u_long actualSize;
        return m_suite->AEGP_GetString(
            m_blobH, m_section, key, defaultVal,
            bufSize, buf, &actualSize
        ) == A_Err_NONE;
    }

    bool SetString(const char *key, const char *value) {
        if (!m_suite || !m_blobH) return false;
        return m_suite->AEGP_SetString(
            m_blobH, m_section, key, value
        ) == A_Err_NONE;
    }

    bool KeyExists(const char *key) {
        if (!m_suite || !m_blobH) return false;
        A_Boolean exists;
        m_suite->AEGP_DoesKeyExist(m_blobH, m_section, key, &exists);
        return exists != 0;
    }

    bool DeleteKey(const char *key) {
        if (!m_suite || !m_blobH) return false;
        return m_suite->AEGP_DeleteEntry(
            m_blobH, m_section, key
        ) == A_Err_NONE;
    }
};

// Usage
PreferencesManager prefs(in_data->pica_basicP, "MyPlugin Settings");
A_long lastMode;
prefs.GetInt("LastMode", 0, &lastMode);
prefs.SetInt("LastMode", 2);
```

### Undo-Safe Operation Wrapper

```cpp
class UndoScope {
    AEGP_UtilitySuite6 *m_suite;
    bool m_active;

public:
    UndoScope(AEGP_UtilitySuite6 *suite, const char *name)
        : m_suite(suite), m_active(false)
    {
        if (m_suite) {
            if (m_suite->AEGP_StartUndoGroup(name) == A_Err_NONE) {
                m_active = true;
            }
        }
    }

    ~UndoScope() {
        if (m_suite && m_active) {
            m_suite->AEGP_EndUndoGroup();
        }
    }

    // Prevent copying
    UndoScope(const UndoScope&) = delete;
    UndoScope& operator=(const UndoScope&) = delete;
};

// Usage - RAII ensures balanced undo groups
void ModifyProject(AEGP_UtilitySuite6 *suite) {
    UndoScope undo(suite, "Modify Layers");

    // All operations here are grouped
    ModifyLayerA();
    ModifyLayerB();
    AddKeyframes();
    // Undo group automatically closed on scope exit
}
```

---

## Error Handling

### Quiet Error Mode

Suppress error dialogs during batch operations:

```cpp
AEGP_ErrReportState errState;

// Silence errors
suites.UtilitySuite6()->AEGP_StartQuietErrors(&errState);

// Operations that might fail but shouldn't show dialogs
A_Err err = PerformBatchOperation();

// Restore error reporting - MUST be called
suites.UtilitySuite6()->AEGP_EndQuietErrors(&errState);

// Handle error programmatically
if (err != A_Err_NONE) {
    LogError(err);
}
```

**Critical:** Always balance `AEGP_StartQuietErrors` with `AEGP_EndQuietErrors`. Unbalanced calls prevent dialogs (save, open) from appearing.

### Report Info

Display user-facing messages:

```cpp
// Basic info
suites.UtilitySuite6()->AEGP_ReportInfo(
    my_plugin_id,
    "Operation completed successfully."
);

// Unicode version (v6+)
suites.UtilitySuite6()->AEGP_ReportInfoUnicode(
    my_plugin_id,
    L"Operation completed successfully."
);
```

---

## Summary Tables

### Suite Version Reference

| Suite | Current Version | Key Additions |
|-------|-----------------|---------------|
| `AEGP_UtilitySuite` | 6 | `AEGP_ReportInfoUnicode`, `AEGP_GetPluginPaths` |
| `AEGP_PersistentDataSuite` | 4 | `AEGP_PersistentType` parameter, Time/ARGB functions |
| `PF_HandleSuite` | 1 | Standard handle operations |
| `PF_EffectSequenceDataSuite` | 1 | Thread-safe `GetConstSequenceData` |

### Preference Storage Scopes

| Scope | Suite | Storage Location | Survives |
|-------|-------|------------------|----------|
| Application | `AEGP_PersistentDataSuite` | AE preferences file | AE restarts |
| Project | Sequence data | Project file (.aep) | Project saves |
| Session | Global data | Memory | Effect lifetime |
| Frame | Frame data | Memory | Frame render |

### Data Serialization Requirements

| Data Type | Flatten Required | Cross-Platform Handling |
|-----------|------------------|------------------------|
| Plain structs (no pointers) | No | Byte order only |
| Structs with pointers | Yes | Byte order + serialization |
| Dynamic arrays | Yes | Size + byte order |
| C++ std::string | Yes | Convert to C string |
| Complex objects | Yes | Custom serialization |

---

## References

- [AEGP Suites - After Effects C++ SDK Guide](https://ae-plugins.docsforadobe.dev/aegps/aegp-suites/)
- [Global, Sequence, & Frame Data](https://ae-plugins.docsforadobe.dev/effect-details/global-sequence-frame-data/)
- [Arbitrary Data Parameters](https://ae-plugins.docsforadobe.dev/effect-details/arbitrary-data-parameters/)
- [Multi-Frame Rendering in AE](https://ae-plugins.docsforadobe.dev/effect-details/multi-frame-rendering-in-ae/)
- [Sample Projects - Persisto](https://ae-plugins.docsforadobe.dev/intro/sample-projects/)
- [Adobe After Effects SDK (Official)](https://www.adobe.io/after-effects/)

---

*Document generated through deep research synthesis of Adobe After Effects SDK documentation.*
*Version: 1.0 | Last Updated: December 2025*
