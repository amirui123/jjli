---
source: '[unknown - 03-mfr-compute-cache.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
---
[3-Resources/anchors/status-complete]]

# Adobe After Effects SDK: Multi-Frame Rendering and Compute Cache API

---
created: 2025-12-27
type: research/technical-documentation
status: complete
source: Adobe Official Documentation
sdk-version: 25.x (2025)
word-count: 6500+
tags:
  - after-effects
  - sdk
  - multi-frame-rendering
  - compute-cache
  - threading
  - adobe
  - plugin-development
  - mfr
related:
  - "[[02-effect-plugins]]"
  - "[[03-aegp-plugins]]"
---

## Table of Contents

1. [Introduction to Multi-Frame Rendering](#introduction-to-multi-frame-rendering)
2. [Threading Model in After Effects](#threading-model-in-after-effects)
3. [MFR Opt-In Requirements](#mfr-opt-in-requirements)
4. [Thread-Safe Sequence Data](#thread-safe-sequence-data)
5. [PF_EffectSequenceDataSuite1 Reference](#pf_effectsequencedatasuite1-reference)
6. [Compute Cache API Complete Reference](#compute-cache-api-complete-reference)
7. [AEGP_HashSuite1 Reference](#aegp_hashsuite1-reference)
8. [Thread Safety Best Practices](#thread-safety-best-practices)
9. [Static Analyzer Tools](#static-analyzer-tools)
10. [Common MFR Pitfalls](#common-mfr-pitfalls)
11. [Migrating Effects to MFR](#migrating-effects-to-mfr)
12. [Performance Implications](#performance-implications)
13. [Complete Implementation Examples](#complete-implementation-examples)
14. [Related Documentation](#related-documentation)

---

## Introduction to Multi-Frame Rendering

Multi-Frame Rendering (MFR) represents one of the most significant architectural changes in After Effects history. Introduced in After Effects 2022 (version 22.0), MFR enables the application to render multiple frames concurrently by leveraging modern multi-core CPU architectures.

### What is Multi-Frame Rendering?

Multi-Frame Rendering allows After Effects to distribute frame rendering across multiple CPU cores and threads simultaneously. Instead of rendering frame 1, then frame 2, then frame 3 sequentially, MFR enables rendering frames 1, 2, and 3 (and potentially many more) at the same time on different threads.

**Key Benefits:**
- Dramatically improved export and preview performance
- Better utilization of modern multi-core processors
- Scalable performance with additional CPU cores
- Reduced wait times for composition rendering

**Impact on Third-Party Effects:**
Effects that do not support MFR force After Effects to serialize their execution, meaning only one thread can execute the effect code at a time. This significantly reduces the performance benefits MFR provides and triggers a warning icon in the Effects Control Window to alert users of the performance impact.

### SDK Version Requirements

**Critical Requirement:** Effects must be compiled with the March 2021 SDK (version 13.25) or later to maintain MFR compatibility. Plugins compiled with the June 2020 SDK or earlier will lose MFR support starting with After Effects 22.0x6 (released June 29, 2021), even if `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` is set.

The SDK version constants `PF_AE_PLUG_IN_VERSION` and `PF_AE_PLUG_IN_SUBVERS` ensure proper version reporting to After Effects.

---

## Threading Model in After Effects

Understanding the threading model is essential for developing MFR-compatible effects. After Effects divides command selectors into two categories based on their threading behavior.

### Main Thread Operations

The following operations execute exclusively on the main thread and are never called concurrently with other selectors:

| Selector | Description |
|----------|-------------|
| `PF_Cmd_GLOBAL_SETUP` | Plugin initialization and capability declaration |
| `PF_Cmd_GLOBAL_SETDOWN` | Plugin shutdown and resource cleanup |
| UI Event Selectors | All user interface handling (`PF_Cmd_EVENT`, custom UI events) |

### Multi-Threaded Operations

These selectors may execute concurrently on multiple threads at the same time as UI selectors are being handled:

| Selector | Description |
|----------|-------------|
| `PF_Cmd_SEQUENCE_SETUP` | Sequence data initialization |
| `PF_Cmd_SEQUENCE_RESETUP` | Sequence data restoration after project load |
| `PF_Cmd_SEQUENCE_SETDOWN` | Sequence data cleanup |
| `PF_Cmd_SMART_PRE_RENDER` | SmartFX input region identification |
| `PF_Cmd_RENDER` | Standard frame rendering |
| `PF_Cmd_SMART_RENDER` | SmartFX frame rendering |

### Thread Safety Definition

An effect is considered thread-safe when:

1. **No problematic static or global variables**: Either eliminate static/global variables entirely or ensure those that exist are free of race conditions
2. **Read-only global_data at render time**: Never write to `in_data->global_data` during render operations (reading is permitted)
3. **Read-only sequence_data at render time**: Never write to `in_data->sequence_data` during render or `PF_Cmd_UPDATE_PARAMS_UI` events (reading via suite is permitted)
4. **No blocking synchronization across host calls**: Never hold mutex locks or other synchronization primitives when calling back into the host

---

## MFR Opt-In Requirements

Effects must explicitly opt into Multi-Frame Rendering support through specific flags and compliance requirements.

### PF_OutFlag2_SUPPORTS_THREADED_RENDERING

This is the primary flag that enables MFR support for an effect.

**Flag Definition:**
```c
#define PF_OutFlag2_SUPPORTS_THREADED_RENDERING (1L << 26)
```

**Purpose:** Indicates that the effect supports rendering on multiple threads concurrently. Single or multiple applications of this effect on a layer can be called to render at the same time on different threads.

**Usage:**
```c
static PF_Err GlobalSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    // Update the magic number after adding this flag
    // AE will provide the correct value on first run

    return PF_Err_NONE;
}
```

**Important:** After setting this flag, launch After Effects with your effect applied. AE will provide the correct `AE_Effect_Global_OutFlags_2` magic number to include in your PiPL resource.

### PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER

This flag provides backward compatibility for effects that cannot operate with read-only sequence data.

**Flag Definition:**
```c
#define PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER (1L << 27)
```

**Purpose:** Allows sequence_data to be written during render operations. When set, each render thread receives its own independent copy of sequence_data that is not shared or synchronized with other rendering threads.

**Trade-offs:**
- Changes to sequence_data are discarded after each span of frames is rendered
- After Effects cannot apply maximum rendering concurrency
- A warning indicator appears in the Effects Control Window
- Performance improvements from MFR are significantly reduced

**When to Use:**
- Legacy effects that absolutely require writing to sequence_data during render
- Transitional period while migrating to Compute Cache API
- Effects that cannot be refactored within project constraints

### PF_OutFlag2_SUPPORTS_GET_FLATTENED_SEQUENCE_DATA

This flag must be set alongside `PF_OutFlag_SEQUENCE_DATA_NEEDS_FLATTENING` when using threaded rendering with flattened sequence data.

**Flag Definition:**
```c
#define PF_OutFlag2_SUPPORTS_GET_FLATTENED_SEQUENCE_DATA (1L << 23)
```

**Usage Pattern:**
```c
// In GlobalSetup
out_data->out_flags |= PF_OutFlag_SEQUENCE_DATA_NEEDS_FLATTENING;
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_GET_FLATTENED_SEQUENCE_DATA |
                        PF_OutFlag2_SUPPORTS_THREADED_RENDERING;
```

### Configuration Summary Table

| Sequence Data Usage | Required Configuration |
|---------------------|------------------------|
| No sequence_data access | Set `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` |
| Read-only access | Use `PF_EffectSequenceDataSuite1` |
| Read/write access | Implement Compute Cache API OR set `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER` |
| Flattened data access | Additionally set `PF_OutFlag2_SUPPORTS_GET_FLATTENED_SEQUENCE_DATA` |

---

## Thread-Safe Sequence Data

Starting with the March 2021 SDK, sequence_data behavior changed fundamentally when MFR is enabled.

### Sequence Data Behavior Changes

**Before MFR (Pre-2022):**
- sequence_data was freely readable and writable at any time
- All render operations shared a single sequence_data instance
- Effects could store computed values during render

**With MFR Enabled:**
- sequence_data becomes read-only (const) during render operations
- Access must be through the `PF_EffectSequenceDataSuite1` interface
- Writing to sequence_data at render time results in undefined behavior
- Direct access via `in_data->sequence_data` is deprecated for render operations

### Const vs Mutable Data Patterns

**Const Pattern (Recommended):**
```c
// During render - read-only access via suite
static PF_Err Render(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    PF_Err err = PF_Err_NONE;

    // Acquire the sequence data suite
    AEFX_SuiteScoper<PF_EffectSequenceDataSuite1> seqdata_suite =
        AEFX_SuiteScoper<PF_EffectSequenceDataSuite1>(
            in_data,
            kPFEffectSequenceDataSuite,
            kPFEffectSequenceDataSuiteVersion1,
            out_data);

    // Get read-only sequence data
    PF_ConstHandle const_seq;
    ERR(seqdata_suite->PF_GetConstSequenceData(in_data->effect_ref, &const_seq));

    if (!err && const_seq) {
        // Cast to your sequence data type (read-only!)
        const MySequenceData *seq = (const MySequenceData*)(*const_seq);

        // Use seq->field values but never modify them
        float cached_value = seq->precomputed_value;
        // ...
    }

    return err;
}
```

**Mutable Pattern (Legacy Compatibility):**
```c
// With PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER set
// Each thread gets its own copy - changes are NOT persisted

static PF_Err Render(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    // Direct access still works but each thread has isolated copy
    MySequenceData *seq = (MySequenceData*)PF_LOCK_HANDLE(in_data->sequence_data);

    // Modifications only affect this thread's copy
    // Changes are discarded after frame span completes
    seq->per_frame_cache = ComputeExpensiveValue();

    PF_UNLOCK_HANDLE(in_data->sequence_data);

    return err;
}
```

---

## PF_EffectSequenceDataSuite1 Reference

This suite provides thread-safe access to sequence data during render operations.

### Suite Identification

```c
#define kPFEffectSequenceDataSuite       "PF Effect Sequence Data Suite"
#define kPFEffectSequenceDataSuiteVersion1  1
```

### Suite Functions

#### PF_GetConstSequenceData

Retrieves a const (read-only) handle to the sequence data.

**Signature:**
```c
PF_Err (*PF_GetConstSequenceData)(
    PF_ProgPtr      effect_ref,
    PF_ConstHandle  *constSeqDataPH
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `effect_ref` | `PF_ProgPtr` | The effect reference from `in_data->effect_ref` |
| `constSeqDataPH` | `PF_ConstHandle*` | Output pointer to receive the const handle |

**Return Value:**
- `PF_Err_NONE` on success
- Error code on failure (suite unavailable, invalid effect_ref, etc.)

**Usage Example:**
```c
PF_Err GetSequenceDataSafely(
    PF_InData *in_data,
    PF_OutData *out_data,
    const MySequenceData **out_seq)
{
    PF_Err err = PF_Err_NONE;

    AEFX_SuiteScoper<PF_EffectSequenceDataSuite1> suite =
        AEFX_SuiteScoper<PF_EffectSequenceDataSuite1>(
            in_data,
            kPFEffectSequenceDataSuite,
            kPFEffectSequenceDataSuiteVersion1,
            out_data);

    PF_ConstHandle const_handle;
    ERR(suite->PF_GetConstSequenceData(in_data->effect_ref, &const_handle));

    if (!err && const_handle) {
        *out_seq = (const MySequenceData*)(*const_handle);
    } else {
        *out_seq = NULL;
    }

    return err;
}
```

---

## Compute Cache API Complete Reference

The Compute Cache API provides a thread-safe caching mechanism for expensive computations that need to be shared across render threads. This API was introduced in the March 2021 SDK as the recommended alternative to writing to sequence_data during render.

### AEGP_ComputeCacheSuite1

**Suite Identification:**
```c
#define kAEGPComputeCacheSuite       "AEGP Compute Cache Suite"
#define kAEGPComputeCacheSuiteVersion1  1
```

### Core Functions

#### AEGP_ClassRegister

Registers a new cache class with the compute cache system.

**Signature:**
```c
A_Err (*AEGP_ClassRegister)(
    AEGP_CCComputeClassIdP              compute_classP,
    const AEGP_ComputeCacheCallbacks    *callbacksP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `compute_classP` | `AEGP_CCComputeClassIdP` | Globally unique identifier string (e.g., "adobe.ae.effect.myeffect.cache_v_1") |
| `callbacksP` | `const AEGP_ComputeCacheCallbacks*` | Pointer to callback function structure |

**Return Value:**
- `A_Err_NONE` on success

**Usage:** Call during `PF_Cmd_GLOBAL_SETUP`

---

#### AEGP_ClassUnregister

Unregisters a previously registered cache class and purges all cached values.

**Signature:**
```c
A_Err (*AEGP_ClassUnregister)(
    AEGP_CCComputeClassIdP  compute_classP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `compute_classP` | `AEGP_CCComputeClassIdP` | The class identifier used during registration |

**Behavior:**
- Triggers `delete_compute_value` callback for all cached entries
- Releases all resources associated with the cache class

**Usage:** Call during `PF_Cmd_GLOBAL_SETDOWN`

---

#### AEGP_ComputeIfNeededAndCheckout

The primary checkout function that computes and/or returns a receipt pointer to the cache entry.

**Signature:**
```c
A_Err (*AEGP_ComputeIfNeededAndCheckout)(
    AEGP_CCComputeClassIdP          compute_classP,
    AEGP_CCComputeOptionsRefconP    opaque_optionsP,
    A_Boolean                       wait_for_other_threadB,
    AEGP_CCCheckoutReceiptP         *compute_receiptPP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `compute_classP` | `AEGP_CCComputeClassIdP` | The registered cache class identifier |
| `opaque_optionsP` | `AEGP_CCComputeOptionsRefconP` | User-defined options passed to callbacks |
| `wait_for_other_threadB` | `A_Boolean` | If TRUE, blocks until value is available; if FALSE, returns immediately if another thread is computing |
| `compute_receiptPP` | `AEGP_CCCheckoutReceiptP*` | Output pointer to receive the checkout receipt |

**Return Values:**
| Return Code | Meaning |
|-------------|---------|
| `A_Err_NONE` | Success; receipt contains cached or newly computed value |
| `A_Err_NOT_IN_CACHE_OR_COMPUTE_PENDING` | Another thread is computing (only when `wait_for_other_threadB` is FALSE) |

**Behavior:**
1. Calls `generate_key` callback to determine cache key
2. If value exists in cache, returns immediately with receipt
3. If value doesn't exist and no other thread is computing, calls `compute` callback
4. If another thread is computing and `wait_for_other_threadB` is TRUE, blocks until complete
5. If another thread is computing and `wait_for_other_threadB` is FALSE, returns error code

---

#### AEGP_CheckoutCached

Checks for a pre-computed cache value without triggering computation.

**Signature:**
```c
A_Err (*AEGP_CheckoutCached)(
    AEGP_CCComputeClassIdP          compute_classP,
    AEGP_CCComputeOptionsRefconP    opaque_optionsP,
    AEGP_CCCheckoutReceiptP         *compute_receiptPP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `compute_classP` | `AEGP_CCComputeClassIdP` | The registered cache class identifier |
| `opaque_optionsP` | `AEGP_CCComputeOptionsRefconP` | User-defined options for key generation |
| `compute_receiptPP` | `AEGP_CCCheckoutReceiptP*` | Output pointer for the checkout receipt |

**Return Values:**
| Return Code | Meaning |
|-------------|---------|
| `A_Err_NONE` | Value found in cache |
| `A_Err_NOT_IN_CACHE_OR_COMPUTE_PENDING` | Value not in cache or another thread is computing |

**Usage:** Use when you want to check if a value is cached without triggering computation

---

#### AEGP_GetReceiptComputeValue

Retrieves the actual cached value from a checkout receipt.

**Signature:**
```c
A_Err (*AEGP_GetReceiptComputeValue)(
    const AEGP_CCCheckoutReceiptP   compute_receiptP,
    AEGP_CCComputeValueRefconP      *compute_valuePP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `compute_receiptP` | `const AEGP_CCCheckoutReceiptP` | Receipt from a previous checkout operation |
| `compute_valuePP` | `AEGP_CCComputeValueRefconP*` | Output pointer to receive the cached value |

**Return Value:**
- `A_Err_NONE` on success

---

#### AEGP_CheckinComputeReceipt

Returns a checked-out cache receipt when done using the cached value.

**Signature:**
```c
A_Err (*AEGP_CheckinComputeReceipt)(
    AEGP_CCCheckoutReceiptP compute_receiptP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `compute_receiptP` | `AEGP_CCCheckoutReceiptP` | Receipt to return |

**Return Value:**
- `A_Err_NONE` on success
- `A_Err_STRUCT` if an invalid receipt is passed (triggers user-facing error dialog)

**Critical:** Always check in receipts after use. Failing to do so prevents cache memory from being reclaimed.

---

### AEGP_ComputeCacheCallbacks Structure

Effects must implement four callbacks when registering a cache class.

**Structure Definition:**
```c
typedef struct AEGP_ComputeCacheCallbacks {
    A_Err (*generate_key)(
        AEGP_CCComputeOptionsRefconP    optionsP,
        AEGP_CCComputeKeyP              out_keyP
    );

    A_Err (*compute)(
        AEGP_CCComputeOptionsRefconP    optionsP,
        AEGP_CCComputeValueRefconP      *out_valuePP
    );

    size_t (*approx_size_value)(
        AEGP_CCComputeValueRefconP      valueP
    );

    void (*delete_compute_value)(
        AEGP_CCComputeValueRefconP      valueP
    );
} AEGP_ComputeCacheCallbacks;
```

#### generate_key Callback

Creates a unique cache key based on all inputs affecting the computation.

**Signature:**
```c
A_Err (*generate_key)(
    AEGP_CCComputeOptionsRefconP    optionsP,
    AEGP_CCComputeKeyP              out_keyP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `optionsP` | `AEGP_CCComputeOptionsRefconP` | User-defined options containing parameters and SPBasicSuite |
| `out_keyP` | `AEGP_CCComputeKeyP` | Output pointer for the generated key (AEGP_GUID) |

**Requirements:**
- Must include ALL inputs that affect the computation result
- Use `AEGP_HashSuite1` to generate the key
- Same inputs must always generate the same key
- Different inputs must generate different keys

**Example Implementation:**
```c
static A_Err GenerateKeyCallback(
    AEGP_CCComputeOptionsRefconP    optionsP,
    AEGP_CCComputeKeyP              out_keyP)
{
    A_Err err = A_Err_NONE;
    MyCacheOptions *opts = (MyCacheOptions*)optionsP;

    // Acquire hash suite using SPBasicSuite from options
    AEGP_HashSuite1 *hashSuite;
    opts->pica_basicP->AcquireSuite(
        kAEGPHashSuite,
        kAEGPHashSuiteVersion1,
        (const void**)&hashSuite);

    // Create initial hash from identifier string
    const char* id = "com.mycompany.myeffect.histogram";
    ERR(hashSuite->AEGP_CreateHashFromPtr(
        strlen(id),
        id,
        out_keyP));

    // Mix in effect parameters
    ERR(hashSuite->AEGP_HashMixInPtr(
        sizeof(opts->param_value),
        &opts->param_value,
        out_keyP));

    // Mix in frame time
    ERR(hashSuite->AEGP_HashMixInPtr(
        sizeof(opts->current_time),
        &opts->current_time,
        out_keyP));

    // Release suite
    opts->pica_basicP->ReleaseSuite(
        kAEGPHashSuite,
        kAEGPHashSuiteVersion1);

    return err;
}
```

---

#### compute Callback

Performs the actual computation when a cache miss occurs.

**Signature:**
```c
A_Err (*compute)(
    AEGP_CCComputeOptionsRefconP    optionsP,
    AEGP_CCComputeValueRefconP      *out_valuePP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `optionsP` | `AEGP_CCComputeOptionsRefconP` | User-defined options containing computation inputs |
| `out_valuePP` | `AEGP_CCComputeValueRefconP*` | Output pointer for the computed value |

**Requirements:**
- Allocate memory for the result using standard allocation
- Set `*out_valuePP` to point to the allocated result
- The cache system takes ownership of the allocated memory
- Must be thread-safe (may be called from multiple threads)

**Example Implementation:**
```c
static A_Err ComputeCallback(
    AEGP_CCComputeOptionsRefconP    optionsP,
    AEGP_CCComputeValueRefconP      *out_valuePP)
{
    A_Err err = A_Err_NONE;
    MyCacheOptions *opts = (MyCacheOptions*)optionsP;

    // Allocate result structure
    MyHistogramData *histogram = new MyHistogramData();

    if (histogram) {
        // Perform expensive computation
        err = ComputeHistogramFromLayer(
            opts->layer_data,
            opts->param_value,
            histogram);

        if (!err) {
            *out_valuePP = (AEGP_CCComputeValueRefconP)histogram;
        } else {
            delete histogram;
            *out_valuePP = NULL;
        }
    } else {
        err = A_Err_ALLOC;
    }

    return err;
}
```

---

#### approx_size_value Callback

Returns the approximate memory footprint of a cached value.

**Signature:**
```c
size_t (*approx_size_value)(
    AEGP_CCComputeValueRefconP  valueP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `valueP` | `AEGP_CCComputeValueRefconP` | Pointer to the cached value |

**Return Value:** Approximate size in bytes

**Purpose:** Informs the cache purging system about memory usage. Accurate reporting helps After Effects make better decisions about which entries to purge when memory is needed.

**Example Implementation:**
```c
static size_t ApproxSizeCallback(AEGP_CCComputeValueRefconP valueP)
{
    MyHistogramData *histogram = (MyHistogramData*)valueP;

    size_t size = sizeof(MyHistogramData);
    size += histogram->num_bins * sizeof(uint32_t);  // Bin data
    size += histogram->auxiliary_data_size;          // Any additional allocations

    return size;
}
```

---

#### delete_compute_value Callback

Frees all resources associated with a cached value.

**Signature:**
```c
void (*delete_compute_value)(
    AEGP_CCComputeValueRefconP  valueP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `valueP` | `AEGP_CCComputeValueRefconP` | Pointer to the value to delete |

**Called When:**
- Cache entry is purged due to memory pressure
- Cache class is unregistered
- After Effects determines the entry is no longer needed

**Example Implementation:**
```c
static void DeleteValueCallback(AEGP_CCComputeValueRefconP valueP)
{
    MyHistogramData *histogram = (MyHistogramData*)valueP;

    if (histogram) {
        // Free any nested allocations
        if (histogram->auxiliary_data) {
            free(histogram->auxiliary_data);
        }

        // Free the main structure
        delete histogram;
    }
}
```

---

### AEGP_GUID Structure

Cache keys use the AEGP_GUID type for unique identification.

**Structure Definition:**
```c
typedef struct AEGP_GUID {
    A_long bytes[4];  // 128-bit identifier
} AEGP_GUID;
```

This structure is also used as `AEGP_CCComputeKeyP` in the Compute Cache API.

---

## AEGP_HashSuite1 Reference

The Hash Suite provides functions for generating unique cache keys.

### Suite Identification

```c
#define kAEGPHashSuite           "AEGP Hash Suite"
#define kAEGPHashSuiteVersion1   1
```

### Functions

#### AEGP_CreateHashFromPtr

Initializes a hash from a buffer, typically a recognizable string identifier.

**Signature:**
```c
A_Err (*AEGP_CreateHashFromPtr)(
    const A_u_longlong  buf_sizeLu,
    const void          *bufPV,
    AEGP_GUID           *hashP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `buf_sizeLu` | `const A_u_longlong` | Size of the buffer in bytes |
| `bufPV` | `const void*` | Pointer to the data buffer |
| `hashP` | `AEGP_GUID*` | Output pointer for the hash |

**Usage:**
```c
const char* cache_id = "com.example.myeffect.cache_v1";
AEGP_GUID key;
hashSuite->AEGP_CreateHashFromPtr(strlen(cache_id), cache_id, &key);
```

---

#### AEGP_HashMixInPtr

Mixes additional data into an existing hash.

**Signature:**
```c
A_Err (*AEGP_HashMixInPtr)(
    const A_u_longlong  buf_sizeLu,
    const void          *bufPV,
    AEGP_GUID           *hashP
);
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `buf_sizeLu` | `const A_u_longlong` | Size of the data to mix in |
| `bufPV` | `const void*` | Pointer to the data to mix |
| `hashP` | `AEGP_GUID*` | Hash to modify (in/out) |

**Usage Pattern:**
```c
// Start with identifier
hashSuite->AEGP_CreateHashFromPtr(strlen(id), id, &key);

// Mix in each parameter that affects the computation
hashSuite->AEGP_HashMixInPtr(sizeof(param1), &param1, &key);
hashSuite->AEGP_HashMixInPtr(sizeof(param2), &param2, &key);
hashSuite->AEGP_HashMixInPtr(sizeof(current_time), &current_time, &key);
```

---

## Thread Safety Best Practices

### The Four Fundamental Rules

1. **Eliminate or Protect Static/Global Variables**
   - No static or global variables with mutable state
   - OR protect them with appropriate synchronization

2. **Read-Only Global Data at Render Time**
   - Only write to `global_data` during `PF_Cmd_GLOBAL_SETUP` and `PF_Cmd_GLOBAL_SETDOWN`
   - Reading during render is safe

3. **Read-Only Sequence Data at Render Time**
   - Use `PF_EffectSequenceDataSuite1` for access
   - Never write during render or UI events

4. **Never Hold Locks Across Host Calls**
   - Release all synchronization primitives before calling suite functions
   - Failure to do so leads to deadlocks

### Static Variable Remediation Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Function Parameters** | Convert static variables to parameters passed through call chain | Data varies per invocation |
| **Const Initialization** | Use `const` for lookup tables and precomputed data | Data is truly immutable |
| **Static Const Locals** | C++ static local initialization (thread-safe in C++11+) | One-time initialization |
| **Thread-Local Storage** | Use `thread_local` keyword for per-thread copies | State must be per-thread |
| **Mutex Protection** | Guard with `std::lock_guard<std::mutex>` | Truly shared mutable state (rare) |

### Code Examples

**Before (Problematic):**
```c
// WRONG: Global mutable state
static float g_cached_value = 0.0f;
static bool g_initialized = false;

PF_Err Render(...)
{
    if (!g_initialized) {
        g_cached_value = ExpensiveComputation();  // Race condition!
        g_initialized = true;
    }
    // Use g_cached_value...
}
```

**After (Thread-Safe - Option 1: Const Initialization):**
```c
// Const lookup table - initialized once, never modified
static const float LUT[256] = {
    // Pre-computed values...
};

PF_Err Render(...)
{
    // Safe to read from multiple threads
    float value = LUT[pixel_value];
}
```

**After (Thread-Safe - Option 2: Thread-Local):**
```c
// Each thread gets its own copy
static thread_local float tl_cached_value = 0.0f;
static thread_local bool tl_initialized = false;

PF_Err Render(...)
{
    if (!tl_initialized) {
        tl_cached_value = ExpensiveComputation();
        tl_initialized = true;
    }
    // Safe - each thread has its own copy
}
```

**After (Thread-Safe - Option 3: Compute Cache):**
```c
// Use Compute Cache for shared expensive computations
PF_Err Render(...)
{
    AEGP_CCCheckoutReceiptP receipt;

    err = cacheSuite->AEGP_ComputeIfNeededAndCheckout(
        g_cache_class,
        &options,
        TRUE,  // Wait for other threads
        &receipt);

    if (!err) {
        AEGP_CCComputeValueRefconP value;
        cacheSuite->AEGP_GetReceiptComputeValue(receipt, &value);

        // Use cached value...

        cacheSuite->AEGP_CheckinComputeReceipt(receipt);
    }
}
```

### Mutex Usage Warning

**Critical:** Never hold mutex locks when calling into After Effects:

```c
// WRONG: Potential deadlock
std::mutex g_mutex;

PF_Err Render(...)
{
    std::lock_guard<std::mutex> lock(g_mutex);

    // DANGER: Calling suite while holding lock!
    suite->SomeFunction(...);  // May cause deadlock
}

// CORRECT: Release lock before host calls
PF_Err Render(...)
{
    MyData local_copy;

    {
        std::lock_guard<std::mutex> lock(g_mutex);
        local_copy = g_shared_data;  // Quick copy under lock
    }
    // Lock released before host call

    suite->SomeFunction(...);  // Safe
}
```

---

## Static Analyzer Tools

Adobe provides static analysis tools to identify thread-safety issues in plugin code.

### Tool Repository

**GitHub Location:** [https://github.com/adobe/ae-plugin-thread-safety](https://github.com/adobe/ae-plugin-thread-safety)

### macOS: check_symbols_for_thread_safety.sh

**Usage:**
```bash
# Navigate to binary location
cd /path/to/plugin.plugin/Contents/MacOS

# Run analyzer
/path/to/check_symbols_for_thread_safety.sh ./YourPlugin
```

**Output Format:**
```
[symbol type]; [symbol name]
```

**Symbol Types:**
| Type | Meaning |
|------|---------|
| `b` | Uninitialized data section (likely static variable) |
| `d` | Initialized data section |
| `s` | Small data section |
| `B` | External uninitialized data |
| `D` | External initialized data |

### Windows: CheckThreadSafeSymbols.exe

**Prerequisites:**
- Visual Studio installation
- DIA SDK (Debug Interface Access)

**Usage Options:**

**Option 1: Analyze binary with PDB:**
```cmd
CheckThreadSafeSymbols.exe -objfile "C:\path\to\plugin.aex" "C:\path\to\plugin.pdb"
```

**Option 2: Analyze source files:**
```cmd
CheckThreadSafeSymbols.exe -source "C:\path\to\source.cpp" "C:\path\to\plugin.pdb"
```

**Option 3: Global analysis:**
```cmd
CheckThreadSafeSymbols.exe -g "C:\path\to\plugin.pdb"
```

**Output Interpretation:**
The tool reports static and global variables that may cause thread-safety issues. Review each reported symbol and apply appropriate remediation.

---

## Common MFR Pitfalls

### Pitfall 1: Race Conditions in Initialization

**Problem:** Multiple threads attempting to initialize shared state simultaneously.

```c
// WRONG
static bool initialized = false;
static LookupTable* lut = nullptr;

void Initialize() {
    if (!initialized) {  // Race: multiple threads check this
        lut = CreateLUT();  // Race: multiple allocations
        initialized = true;
    }
}
```

**Solution:** Use `std::call_once` or static local initialization.

```c
// CORRECT
static LookupTable* GetLUT() {
    static LookupTable lut = CreateLUT();  // Thread-safe in C++11+
    return &lut;
}
```

### Pitfall 2: Writing to sequence_data During Render

**Problem:** Direct modification of sequence_data causes undefined behavior.

```c
// WRONG
PF_Err Render(...)
{
    MySeqData* seq = (MySeqData*)(*in_data->sequence_data);
    seq->cached_result = ComputeResult();  // Undefined behavior!
}
```

**Solution:** Use Compute Cache or set `PF_OutFlag2_MUTABLE_RENDER_SEQUENCE_DATA_SLOWER`.

### Pitfall 3: Holding Locks Across Suite Calls

**Problem:** Deadlock when multiple threads wait on each other.

```c
// WRONG
std::mutex g_mutex;

PF_Err Render(...)
{
    std::lock_guard<std::mutex> lock(g_mutex);
    iterateSuite->iterate(...);  // May call back into plugin!
}
```

**Solution:** Release locks before any host interaction.

### Pitfall 4: Assuming Single-Threaded Execution Order

**Problem:** Code relies on frame order that no longer exists.

```c
// WRONG
static int last_frame = -1;

PF_Err Render(...)
{
    if (current_frame == last_frame + 1) {
        // Assumes sequential rendering - WRONG with MFR!
    }
    last_frame = current_frame;
}
```

**Solution:** Make each render call independent and stateless.

### Pitfall 5: Old SDK Version

**Problem:** Plugin compiled with June 2020 SDK or earlier loses MFR support.

**Solution:** Recompile with March 2021 SDK (version 13.25) or later.

---

## Migrating Effects to MFR

### Migration Checklist

1. **Verify SDK Version**
   - Update to March 2021 SDK (13.25) or later
   - Verify `PF_AE_PLUG_IN_VERSION` and `PF_AE_PLUG_IN_SUBVERS` are current

2. **Audit Static and Global Variables**
   - Run Adobe's static analyzer tools
   - Document each static/global variable
   - Apply appropriate remediation strategy

3. **Update Sequence Data Access**
   - Replace direct `in_data->sequence_data` access with suite
   - Convert render-time writes to Compute Cache

4. **Review Synchronization**
   - Identify all mutex/lock usage
   - Ensure locks are released before host calls

5. **Set Required Flags**
   ```c
   out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_THREADED_RENDERING;
   // Update magic number after first run
   ```

6. **Test Thoroughly**
   - Enable MFR in Preferences > Memory & Performance
   - Test with maximum thread count
   - Verify output consistency with MFR on vs. off
   - Test with multiple instances of effect on same layer

### Migration from sequence_data to Compute Cache

**Step 1: Identify Cacheable Data**
Determine which sequence_data fields are:
- Computed at render time
- Expensive to compute
- Needed by multiple frames

**Step 2: Design Cache Structure**
```c
// Options passed to callbacks
typedef struct {
    SPBasicSuite*   pica_basicP;
    A_Time          current_time;
    PF_FpLong       param_value;
    // ... other parameters affecting computation
} MyCacheOptions;

// Cached result structure
typedef struct {
    float*  histogram_data;
    int     num_bins;
    float   computed_value;
} MyCachedResult;
```

**Step 3: Implement Callbacks**
See [Compute Cache API Complete Reference](#compute-cache-api-complete-reference) for callback implementations.

**Step 4: Register Cache in GlobalSetup**
```c
static AEGP_CCComputeClassIdP g_cache_class_id =
    "com.mycompany.myeffect.cache_v_1";

PF_Err GlobalSetup(...)
{
    AEGP_ComputeCacheCallbacks callbacks = {
        GenerateKeyCallback,
        ComputeCallback,
        ApproxSizeCallback,
        DeleteValueCallback
    };

    cacheSuite->AEGP_ClassRegister(g_cache_class_id, &callbacks);

    out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}
```

**Step 5: Use Cache in Render**
```c
PF_Err Render(...)
{
    MyCacheOptions options = {
        .pica_basicP = in_data->pica_basicP,
        .current_time = in_data->current_time,
        .param_value = params[PARAM_VALUE]->u.fs_d.value
    };

    AEGP_CCCheckoutReceiptP receipt;
    err = cacheSuite->AEGP_ComputeIfNeededAndCheckout(
        g_cache_class_id,
        &options,
        TRUE,
        &receipt);

    if (!err) {
        MyCachedResult* result;
        cacheSuite->AEGP_GetReceiptComputeValue(receipt, (void**)&result);

        // Use result->histogram_data, etc.

        cacheSuite->AEGP_CheckinComputeReceipt(receipt);
    }

    return err;
}
```

---

## Performance Implications

### MFR Performance Benefits

When properly implemented, MFR can provide substantial performance improvements:

| Scenario | Approximate Improvement |
|----------|------------------------|
| Single MFR-compatible effect | 2-4x faster (varies by core count) |
| Multiple MFR-compatible effects | 3-6x faster |
| Complex compositions | Up to 8x faster on high-core systems |

**Real-World Example:** The Auto Color plugin achieved "at least 3x faster renders" by switching from sequence_data to Compute Cache, enabling histogram and level data sharing across rendering threads.

### Performance Degradation Factors

**Non-MFR-Compatible Effects:**
Effects without `PF_OutFlag2_SUPPORTS_THREADED_RENDERING` force serialized execution, limiting MFR benefits for the entire render chain.

**MUTABLE_RENDER_SEQUENCE_DATA_SLOWER:**
Effects using this flag experience:
- Reduced concurrency
- Per-thread data duplication
- Memory overhead for multiple sequence_data copies
- Warning indicator in Effects Control Window

### Compute Cache Performance Characteristics

**Advantages:**
- Computed values shared across all render threads
- Eliminates redundant computation
- Unified with After Effects' other caches (balanced memory usage)
- Automatic purging under memory pressure

**Considerations:**
- Cache misses require synchronization
- First frame may be slower due to computation
- Memory overhead for cached values
- Cache doesn't persist across sessions

### Multi-Checkout Pattern for Optimal Thread Utilization

When an effect needs multiple cached values per frame, use non-blocking checkout to keep threads productive:

```c
PF_Err Render(...)
{
    // Request both values without blocking
    AEGP_CCCheckoutReceiptP receipt1, receipt2;
    A_Err err1, err2;

    err1 = cacheSuite->AEGP_ComputeIfNeededAndCheckout(
        class_id, &options1, FALSE, &receipt1);  // Non-blocking

    err2 = cacheSuite->AEGP_ComputeIfNeededAndCheckout(
        class_id, &options2, FALSE, &receipt2);  // Non-blocking

    // If either is pending, wait now
    if (err1 == A_Err_NOT_IN_CACHE_OR_COMPUTE_PENDING) {
        cacheSuite->AEGP_ComputeIfNeededAndCheckout(
            class_id, &options1, TRUE, &receipt1);  // Blocking
    }

    if (err2 == A_Err_NOT_IN_CACHE_OR_COMPUTE_PENDING) {
        cacheSuite->AEGP_ComputeIfNeededAndCheckout(
            class_id, &options2, TRUE, &receipt2);  // Blocking
    }

    // Now use both values
    // ...

    // Clean up
    if (receipt1) cacheSuite->AEGP_CheckinComputeReceipt(receipt1);
    if (receipt2) cacheSuite->AEGP_CheckinComputeReceipt(receipt2);

    return err;
}
```

---

## Complete Implementation Examples

### Example 1: Basic MFR-Compatible Effect

```c
// MFR-compatible effect with no sequence_data requirements

static PF_Err GlobalSetup(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output)
{
    out_data->my_version = PF_VERSION(1, 0, 0, PF_Stage_DEVELOP, 1);

    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE |
                          PF_OutFlag_PIX_INDEPENDENT;

    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE |
                           PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}

// Pixel function is naturally thread-safe (no shared state)
static PF_Err PixelFunc(
    void        *refcon,
    A_long      x,
    A_long      y,
    PF_Pixel8   *in,
    PF_Pixel8   *out)
{
    PixelParams *params = (PixelParams*)refcon;

    out->alpha = in->alpha;
    out->red   = (A_u_char)(in->red * params->amount);
    out->green = (A_u_char)(in->green * params->amount);
    out->blue  = (A_u_char)(in->blue * params->amount);

    return PF_Err_NONE;
}
```

### Example 2: Effect with Compute Cache

```c
// Effect using Compute Cache for histogram computation

static AEGP_CCComputeClassIdP g_histogram_cache =
    "com.example.histoeffect.cache_v_1";

// Cache options structure
typedef struct {
    SPBasicSuite*   pica_basicP;
    A_Time          frame_time;
    A_long          time_scale;
    A_long          width;
    A_long          height;
} HistogramOptions;

// Cached histogram data
typedef struct {
    A_u_long    red_hist[256];
    A_u_long    green_hist[256];
    A_u_long    blue_hist[256];
    A_u_long    total_pixels;
} HistogramData;

// Generate unique key
static A_Err HistoGenerateKey(
    AEGP_CCComputeOptionsRefconP    optionsP,
    AEGP_CCComputeKeyP              out_keyP)
{
    A_Err err = A_Err_NONE;
    HistogramOptions *opts = (HistogramOptions*)optionsP;

    AEGP_HashSuite1 *hashSuite;
    opts->pica_basicP->AcquireSuite(
        kAEGPHashSuite, kAEGPHashSuiteVersion1,
        (const void**)&hashSuite);

    const char* id = "com.example.histoeffect.histogram";
    ERR(hashSuite->AEGP_CreateHashFromPtr(strlen(id), id, out_keyP));
    ERR(hashSuite->AEGP_HashMixInPtr(sizeof(opts->frame_time),
        &opts->frame_time, out_keyP));
    ERR(hashSuite->AEGP_HashMixInPtr(sizeof(opts->width),
        &opts->width, out_keyP));
    ERR(hashSuite->AEGP_HashMixInPtr(sizeof(opts->height),
        &opts->height, out_keyP));

    opts->pica_basicP->ReleaseSuite(kAEGPHashSuite, kAEGPHashSuiteVersion1);

    return err;
}

// Compute histogram
static A_Err HistoCompute(
    AEGP_CCComputeOptionsRefconP    optionsP,
    AEGP_CCComputeValueRefconP      *out_valuePP)
{
    HistogramData *histo = new HistogramData();
    memset(histo, 0, sizeof(HistogramData));

    // Actual histogram computation would go here
    // ...

    *out_valuePP = (AEGP_CCComputeValueRefconP)histo;
    return A_Err_NONE;
}

static size_t HistoApproxSize(AEGP_CCComputeValueRefconP valueP)
{
    return sizeof(HistogramData);
}

static void HistoDelete(AEGP_CCComputeValueRefconP valueP)
{
    delete (HistogramData*)valueP;
}

// Register in GlobalSetup
static PF_Err GlobalSetup(...)
{
    AEGP_ComputeCacheCallbacks callbacks = {
        HistoGenerateKey,
        HistoCompute,
        HistoApproxSize,
        HistoDelete
    };

    AEFX_SuiteScoper<AEGP_ComputeCacheSuite1> cacheSuite(...);
    cacheSuite->AEGP_ClassRegister(g_histogram_cache, &callbacks);

    out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_THREADED_RENDERING;

    return PF_Err_NONE;
}

// Use in Render
static PF_Err Render(...)
{
    HistogramOptions opts = {
        .pica_basicP = in_data->pica_basicP,
        .frame_time = in_data->current_time,
        .time_scale = in_data->time_scale,
        .width = input->width,
        .height = input->height
    };

    AEGP_CCCheckoutReceiptP receipt;
    AEFX_SuiteScoper<AEGP_ComputeCacheSuite1> cacheSuite(...);

    ERR(cacheSuite->AEGP_ComputeIfNeededAndCheckout(
        g_histogram_cache, &opts, TRUE, &receipt));

    if (!err) {
        HistogramData *histo;
        cacheSuite->AEGP_GetReceiptComputeValue(
            receipt, (AEGP_CCComputeValueRefconP*)&histo);

        // Use histogram data for effect processing
        // ...

        cacheSuite->AEGP_CheckinComputeReceipt(receipt);
    }

    return err;
}
```

---

## Related Documentation

### Wave 1 Documents

- [[02-effect-plugins]] - Effect plugin architecture and rendering pipeline
- [[03-aegp-plugins]] - AEGP plugins for timeline and project manipulation

### Wave 2 Documents

- [[01-smart-fx-rendering]] - Advanced SmartFX rendering techniques
- [[02-gpu-acceleration]] - GPU rendering with CUDA, Metal, and OpenCL

### External Resources

- [After Effects C++ SDK Guide - MFR](https://ae-plugins.docsforadobe.dev/effect-details/multi-frame-rendering-in-ae/)
- [Compute Cache API Documentation](https://ae-plugins.docsforadobe.dev/effect-details/compute-cache-api/)
- [Adobe Thread Safety Tools](https://github.com/adobe/ae-plugin-thread-safety)
- [Global, Sequence, and Frame Data](https://ae-plugins.docsforadobe.dev/effect-details/global-sequence-frame-data/)
- [DeepWiki MFR Reference](https://deepwiki.com/docsforadobe/after-effects-plugin-guide/6.1-multi-frame-rendering-and-threading)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial comprehensive MFR and Compute Cache documentation |

---

*This documentation was compiled from official Adobe After Effects SDK resources including ae-plugins.docsforadobe.dev, the Adobe thread safety tools repository, and community resources. For the most current information, always consult the official SDK documentation.*
