---
source: '[unknown - 01-blithook-mercury-transmit.md]'
scraped: 2025-12-28
api_provider: Adobe
discovery_tier: 2
verified: false
description: BlitHook and Mercury Transmit plugin development for external video monitoring
---
 BlitHook and Mercury Transmit Plugin Development

## Executive Summary

This document covers the After Effects SDK support for external video monitoring plugins. There are two generations of APIs:

1. **BlitHook (Legacy)** - After Effects-specific API, deprecated but functional
2. **Mercury Transmit (Current)** - Cross-application API supporting AE, Premiere Pro, and Media Encoder

**Recommendation:** Use Mercury Transmit for all new development. BlitHook documentation is provided for reference only.

---

## Table of Contents

1. [Mercury Transmit Overview](#1-mercury-transmit-overview)
2. [Architecture and Data Flow](#2-architecture-and-data-flow)
3. [Core Data Structures](#3-core-data-structures)
4. [tmModule Functions Reference](#4-tmmodule-functions-reference)
5. [Frame Delivery Mechanisms](#5-frame-delivery-mechanisms)
6. [PiPL Requirements](#6-pipl-requirements)
7. [Threading Model](#7-threading-model)
8. [GPU Integration](#8-gpu-integration)
9. [BlitHook Legacy API](#9-blithook-legacy-api)
10. [Real-World Implementations](#10-real-world-implementations)
11. [Implementation Guide](#11-implementation-guide)
12. [Best Practices](#12-best-practices)

---

## 1. Mercury Transmit Overview

Mercury Transmit is Adobe's cross-application framework for real-time video output to external devices. It provides a unified API for:

- **Hardware video I/O** (Blackmagic DeckLink, AJA KONA, etc.)
- **Software video routing** (NDI, Syphon)
- **Preview monitors** (SDI, HDMI output)

### Supported Applications

| Application | Transmit Support |
|-------------|------------------|
| After Effects | Full support |
| Premiere Pro | Full support |
| Media Encoder | Full support |
| Prelude | Limited support |

### Key Characteristics

- **Plugin location:** Same as effects plugins (Plug-ins folder)
- **No PiPL required:** Registration via startup function
- **Single-threaded host:** All calls from host UI thread
- **Push model:** Host pushes frames to transmitter

---

## 2. Architecture and Data Flow

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Host Application                          │
│  (After Effects / Premiere Pro / Media Encoder)             │
├─────────────────────────────────────────────────────────────┤
│                 Mercury Transmit Host API                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Video Frames │  │ Audio Buffer │  │ Playback     │       │
│  │ (PPix)       │  │ (tmAudioMode)│  │ Clock        │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
├─────────┼─────────────────┼─────────────────┼────────────────┤
│         ▼                 ▼                 ▼                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Mercury Transmit Plugin                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │tmStartup │  │tmPushVid │  │tmPushAud │            │   │
│  │  │          │  │eo        │  │io        │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘            │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           ▼
                ┌──────────────────────┐
                │  External Hardware    │
                │  (SDI/HDMI/NDI)      │
                └──────────────────────┘
```

### Frame Flow

1. Host renders frame to PPix buffer
2. Host calls `tmPushVideo` with frame data
3. Plugin converts/transfers to output device
4. Plugin signals frame completion
5. Host provides playback clock for sync

---

## 3. Core Data Structures

### tmStdParms - Standard Parameters

Passed to all transmitter functions:

```cpp
typedef struct {
    csSDK_uint32    piSuiteVersion;     // Suite version
    tmPIError       (*tmFuncs)(         // Callback functions
        tmStdParms*     parms,
        tmCommand       cmd,
        void*           paramBlock
    );
    csSDK_int32     ioPrivateData;      // Plugin private data
    prUTF16Char     pluginPath[2048];   // Plugin file path
    PrMemoryPtr     memFuncs;           // Memory allocation
    prSequenceID    sequenceID;         // Current sequence
    PrPixelFormat   pixelFormat;        // Requested pixel format
} tmStdParms;
```

### tmPluginInfo - Plugin Registration

Returned during `tmStartup`:

```cpp
typedef struct {
    prUTF16Char     outDisplayName[256];    // Display name
    csSDK_int32     outAPIVersion;          // API version (current: 1)
    csSDK_int32     outFlags;               // Plugin capabilities
    csSDK_int32     outNumVideoModes;       // Number of video modes
    csSDK_int32     outNumAudioModes;       // Number of audio modes
    csSDK_int32     outClockPriority;       // Clock source priority
} tmPluginInfo;
```

### tmInstance - Instance Data

Per-activation instance:

```cpp
typedef struct {
    void*           privateData;        // Plugin instance data
    csSDK_int32     videoModeIndex;     // Active video mode
    csSDK_int32     audioModeIndex;     // Active audio mode
    PrTime          currentTime;        // Current playback time
    csSDK_int32     playState;          // Play/Stop/Pause
} tmInstance;
```

### tmVideoMode - Video Output Configuration

```cpp
typedef struct {
    prUTF16Char     modeName[256];      // Mode display name
    csSDK_int32     width;              // Output width
    csSDK_int32     height;             // Output height
    PrTime          frameRate;          // Frame duration
    csSDK_int32     fieldType;          // Progressive/Interlaced
    PrPixelFormat   preferredFormat;    // Preferred pixel format
    csSDK_int32     aspectRatioNum;     // PAR numerator
    csSDK_int32     aspectRatioDen;     // PAR denominator
    csSDK_int32     flags;              // Mode flags
} tmVideoMode;
```

### tmAudioMode - Audio Output Configuration

```cpp
typedef struct {
    prUTF16Char     modeName[256];      // Mode display name
    csSDK_int32     sampleRate;         // Sample rate (e.g., 48000)
    csSDK_int32     numChannels;        // Channel count
    csSDK_int32     bitsPerSample;      // Bits per sample (16/24/32)
    csSDK_int32     flags;              // Mode flags
} tmAudioMode;
```

### tmPlaybackClock - Timing Information

```cpp
typedef struct {
    PrTime          currentTime;        // Current playback position
    PrTime          inPoint;            // In point
    PrTime          outPoint;           // Out point
    csSDK_int32     playState;          // Current state
    float           playbackSpeed;      // Speed multiplier
    csSDK_int32     loopMode;           // Loop behavior
} tmPlaybackClock;

// Play states
#define tmPlayState_Stopped     0
#define tmPlayState_Playing     1
#define tmPlayState_Scrubbing   2
#define tmPlayState_Shuttling   3
```

### tmPushVideo - Video Frame Data

```cpp
typedef struct {
    PPix*           inPPixBuffer;       // Pixel buffer
    csSDK_int32     inPPixBufferIndex;  // Buffer index
    PrTime          inTimeStamp;        // Frame time
    csSDK_int32     inFlags;            // Frame flags
    csSDK_int32     inFieldType;        // Field dominance
} tmPushVideo;
```

### tmPushAudio - Audio Buffer Data

```cpp
typedef struct {
    float**         inAudioBuffers;     // Per-channel audio data
    csSDK_int32     inNumSamples;       // Sample count
    PrTime          inTimeStamp;        // Audio timestamp
    csSDK_int32     inFlags;            // Audio flags
} tmPushAudio;
```

### tmLabeledFrame - Labeled Frame Data

For secondary/preview streams:

```cpp
typedef struct {
    prUTF16Char     label[64];          // Frame label
    PPix*           pPixBuffer;         // Pixel data
    PrTime          timeStamp;          // Frame time
    csSDK_int32     flags;              // Frame flags
} tmLabeledFrame;
```

---

## 4. tmModule Functions Reference

### Required Entry Point

```cpp
prSuiteError xTransmitModule(
    csSDK_int32     selector,
    tmStdParms*     stdParms,
    void*           paramBlock,
    void*           privateData
);
```

### Function Selectors

| Selector | Parameter Block | Purpose |
|----------|-----------------|---------|
| `tmStartup` | `tmPluginInfo*` | Plugin registration |
| `tmShutdown` | `NULL` | Plugin cleanup |
| `tmCreateInstance` | `tmInstance*` | Create output instance |
| `tmDisposeInstance` | `tmInstance*` | Destroy output instance |
| `tmQueryVideoMode` | `tmVideoMode*` | Get video mode details |
| `tmQueryAudioMode` | `tmAudioMode*` | Get audio mode details |
| `tmSetVideoMode` | `tmVideoMode*` | Activate video mode |
| `tmSetAudioMode` | `tmAudioMode*` | Activate audio mode |
| `tmStartPlayback` | `tmPlaybackClock*` | Begin playback |
| `tmStopPlayback` | `NULL` | Stop playback |
| `tmPushVideo` | `tmPushVideo*` | Receive video frame |
| `tmPushAudio` | `tmPushAudio*` | Receive audio samples |
| `tmQueryClock` | `tmPlaybackClock*` | Query timing |
| `tmPushLabeledFrame` | `tmLabeledFrame*` | Secondary video stream |
| `tmGetSettings` | `prUTF8Char*` | Export settings |
| `tmSetSettings` | `prUTF8Char*` | Import settings |

### Function Signatures

```cpp
// Startup - Register plugin and enumerate modes
prSuiteError tmStartup(
    tmStdParms*     stdParms,
    tmPluginInfo*   outPluginInfo
);

// Create Instance - Allocate per-output resources
prSuiteError tmCreateInstance(
    tmStdParms*     stdParms,
    tmInstance*     outInstance
);

// Push Video - Receive and output frame
prSuiteError tmPushVideo(
    tmStdParms*     stdParms,
    tmPushVideo*    inVideoData
);

// Push Audio - Receive and output audio
prSuiteError tmPushAudio(
    tmStdParms*     stdParms,
    tmPushAudio*    inAudioData
);

// Query Clock - Provide timing information
prSuiteError tmQueryClock(
    tmStdParms*     stdParms,
    tmPlaybackClock* outClock
);
```

---

## 5. Frame Delivery Mechanisms

### PPix Buffer Access

Video frames arrive as PPix structures:

```cpp
prSuiteError HandleVideoFrame(tmPushVideo* videoData) {
    PPix* ppix = videoData->inPPixBuffer;

    // Get pixel format suite
    PrSDKPPixSuite* ppixSuite;
    stdParms->piSuites->AcquireSuite(
        kPrSDKPPixSuite,
        kPrSDKPPixSuiteVersion,
        (void**)&ppixSuite
    );

    // Get frame dimensions
    prRect bounds;
    ppixSuite->GetBounds(ppix, &bounds);

    // Get pixel data pointer
    char* pixels;
    csSDK_int32 rowBytes;
    ppixSuite->GetPixels(ppix, PrPPixBufferAccess_ReadOnly, &pixels);
    ppixSuite->GetRowBytes(ppix, &rowBytes);

    // Get pixel format
    PrPixelFormat format;
    ppixSuite->GetPixelFormat(ppix, &format);

    // Process frame...

    return suiteError_NoError;
}
```

### Recommended Pixel Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| `PrPixelFormat_BGRA_4444_8u` | 8-bit BGRA | SDI output |
| `PrPixelFormat_VUYA_4444_8u` | 8-bit YUV | Broadcast |
| `PrPixelFormat_BGRA_4444_16u` | 16-bit BGRA | HDR |
| `PrPixelFormat_BGRA_4444_32f` | 32-bit float BGRA | HDR/Linear |
| `PrPixelFormat_VUYA_4444_32f` | 32-bit float YUV | HDR Broadcast |

### Audio Handling

Audio arrives as floating-point planar buffers:

```cpp
prSuiteError HandleAudio(tmPushAudio* audioData) {
    // Audio is in planar format - one buffer per channel
    float** channelBuffers = audioData->inAudioBuffers;
    csSDK_int32 numSamples = audioData->inNumSamples;

    // Access individual channels
    float* leftChannel = channelBuffers[0];
    float* rightChannel = channelBuffers[1];
    // ... additional channels

    // Copy/process samples
    for (csSDK_int32 i = 0; i < numSamples; i++) {
        // Process sample from each channel
        float leftSample = leftChannel[i];
        float rightSample = rightChannel[i];
        // Output to device...
    }

    return suiteError_NoError;
}
```

### Latency Management

```cpp
// Report frame latency to host
void ReportLatency(tmStdParms* stdParms, PrTime latency) {
    tmFuncs* funcs = (tmFuncs*)stdParms->tmFuncs;
    funcs->ReportLatency(stdParms, latency);
}
```

---

## 6. PiPL Requirements

**Mercury Transmit plugins do NOT require a PiPL resource.**

Registration occurs dynamically via the `tmStartup` selector. The host scans the Plug-ins folder for DLLs/bundles exporting the `xTransmitModule` symbol.

### Installation Locations

| Platform | Location |
|----------|----------|
| macOS | `/Library/Application Support/Adobe/Common/Plug-ins/[version]/MediaCore/` |
| Windows | `C:\Program Files\Adobe\Common\Plug-ins\[version]\MediaCore\` |

### Export Symbol

```cpp
// macOS
__attribute__((visibility("default")))
prSuiteError xTransmitModule(...);

// Windows
__declspec(dllexport)
prSuiteError xTransmitModule(...);
```

---

## 7. Threading Model

### Single-Threaded Host Calls

All Mercury Transmit calls from the host occur on the **main UI thread**. The plugin must not block for extended periods.

**Critical Constraints:**
- Return from `tmPushVideo` quickly
- Use async transfer to hardware
- Signal frame completion via callback

### Recommended Pattern

```cpp
// Double-buffered async pattern
typedef struct {
    void*   buffers[2];
    int     writeIndex;
    int     readIndex;
    HANDLE  transferComplete;
} AsyncTransfer;

prSuiteError tmPushVideo(tmStdParms* stdParms, tmPushVideo* video) {
    AsyncTransfer* transfer = (AsyncTransfer*)stdParms->ioPrivateData;

    // Copy to write buffer
    CopyToPPixBuffer(video->inPPixBuffer, transfer->buffers[transfer->writeIndex]);

    // Start async transfer (non-blocking)
    StartAsyncDMATransfer(transfer->buffers[transfer->writeIndex]);

    // Swap buffers
    transfer->writeIndex = (transfer->writeIndex + 1) % 2;

    return suiteError_NoError;  // Return immediately
}
```

### AEGP Limitations

AEGP calls during transmit callbacks are limited:
- No UI operations
- No project modifications
- Limited suite access

---

## 8. GPU Integration

### CUDA Support

```cpp
prSuiteError tmPushVideo_CUDA(tmStdParms* stdParms, tmPushVideo* video) {
    // Get CUDA device data
    PrSDKGPUDeviceSuite* gpuSuite;
    stdParms->piSuites->AcquireSuite(
        kPrSDKGPUDeviceSuite,
        kPrSDKGPUDeviceSuiteVersion,
        (void**)&gpuSuite
    );

    // Access GPU frame data if available
    void* cudaData = NULL;
    gpuSuite->GetGPUPPixData(video->inPPixBuffer, &cudaData);

    if (cudaData) {
        // Direct GPU-to-GPU transfer
        cudaMemcpyAsync(outputBuffer, cudaData, size, cudaMemcpyDeviceToDevice);
    } else {
        // Fallback to CPU path
        // ...
    }

    return suiteError_NoError;
}
```

### Metal Support (macOS)

```cpp
prSuiteError tmPushVideo_Metal(tmStdParms* stdParms, tmPushVideo* video) {
    // Get Metal texture if available
    PrSDKGPUDeviceSuite* gpuSuite;
    stdParms->piSuites->AcquireSuite(
        kPrSDKGPUDeviceSuite,
        kPrSDKGPUDeviceSuiteVersion,
        (void**)&gpuSuite
    );

    id<MTLTexture> metalTexture = nil;
    gpuSuite->GetMetalPPixTexture(video->inPPixBuffer, &metalTexture);

    if (metalTexture) {
        // Use Metal blit encoder for efficient transfer
        id<MTLBlitCommandEncoder> blitEncoder = [commandBuffer blitCommandEncoder];
        [blitEncoder copyFromTexture:metalTexture toTexture:outputTexture];
        [blitEncoder endEncoding];
    }

    return suiteError_NoError;
}
```

---

## 9. BlitHook Legacy API

### Overview

BlitHook is the legacy After Effects-specific external monitoring API. It predates Mercury Transmit and is limited to After Effects only.

**Status:** Deprecated but functional. Use Mercury Transmit for new development.

### Architecture

BlitHook plugins register via AEGP hooks and receive frames through a callback system.

```cpp
// BlitHook registration (in AEGP main)
A_Err RegisterBlitHook(AEGP_PluginID pluginID) {
    AEGP_SuiteHandler suites(pluginID);

    // Register blit hook
    AEGP_BlitHookRefcon refcon = (void*)myData;

    ERR(suites.RegisterSuite5()->AEGP_RegisterBlitHook(
        pluginID,
        "My Blit Hook",
        BlitHookFunc,
        refcon,
        &blitHookRef
    ));

    return err;
}
```

### BlitHook Callback

```cpp
A_Err BlitHookFunc(
    AEGP_BlitHookRefcon refcon,
    AEGP_WorldH         worldH,
    const A_LRect*      srcR,
    AEGP_CompositeFlags flags,
    PF_Pixel8*          base_addr,
    A_long              rowbytes,
    A_long              width,
    A_long              height)
{
    // Process frame for external output
    // base_addr points to pixel data
    // rowbytes is stride between rows

    return A_Err_NONE;
}
```

### EMP Sample

Adobe provides the EMP (External Monitor Preview) sample demonstrating BlitHook usage. Key files:

- `EMP.cpp` - Main plugin
- `EMP.h` - Data structures
- `EMP_GPU.cpp` - GPU acceleration

### Limitations

| Aspect | BlitHook | Mercury Transmit |
|--------|----------|------------------|
| Applications | AE only | AE, PPro, AME |
| Registration | AEGP hook | Module export |
| Audio | No | Yes |
| GPU frames | Limited | Full support |
| Documentation | Sparse | Comprehensive |

---

## 10. Real-World Implementations

### Blackmagic DeckLink

Industry-standard implementation supporting:
- SDI output (HD/4K/8K)
- HDMI output
- Genlock synchronization
- Embedded audio

**Key Features:**
- Hardware color space conversion
- Low-latency DMA transfers
- Multi-format support

### AJA KONA

Professional video I/O supporting:
- Multi-channel SDI
- HDMI 2.0
- Reference input/output

### Syphon-Transmit (Open Source)

macOS software transmitter using Syphon framework:
- Inter-application video sharing
- GPU texture sharing
- Low-latency software routing

**GitHub:** [github.com/Syphon/Syphon-Transmit](https://github.com/Syphon/Syphon-Transmit)

### NDI Transmitter

NewTek NDI implementation:
- Network video streaming
- Discovery protocol
- Compressed/uncompressed modes

---

## 11. Implementation Guide

### Step 1: Entry Point Setup

```cpp
// Main entry point
extern "C" {

#ifdef _WIN32
__declspec(dllexport)
#else
__attribute__((visibility("default")))
#endif
prSuiteError xTransmitModule(
    csSDK_int32     selector,
    tmStdParms*     stdParms,
    void*           paramBlock,
    void*           privateData)
{
    prSuiteError result = suiteError_NoError;

    switch (selector) {
        case tmStartup:
            result = Startup(stdParms, (tmPluginInfo*)paramBlock);
            break;
        case tmShutdown:
            result = Shutdown(stdParms);
            break;
        case tmCreateInstance:
            result = CreateInstance(stdParms, (tmInstance*)paramBlock);
            break;
        case tmDisposeInstance:
            result = DisposeInstance(stdParms, (tmInstance*)paramBlock);
            break;
        case tmQueryVideoMode:
            result = QueryVideoMode(stdParms, (tmVideoMode*)paramBlock);
            break;
        case tmSetVideoMode:
            result = SetVideoMode(stdParms, (tmVideoMode*)paramBlock);
            break;
        case tmPushVideo:
            result = PushVideo(stdParms, (tmPushVideo*)paramBlock);
            break;
        // ... other selectors
        default:
            result = suiteError_Fail;
    }

    return result;
}

} // extern "C"
```

### Step 2: Startup and Registration

```cpp
prSuiteError Startup(tmStdParms* stdParms, tmPluginInfo* outInfo) {
    // Set plugin information
    wcscpy(outInfo->outDisplayName, L"My Transmitter");
    outInfo->outAPIVersion = 1;
    outInfo->outFlags = 0;

    // Enumerate available video modes
    outInfo->outNumVideoModes = EnumerateVideoModes();
    outInfo->outNumAudioModes = EnumerateAudioModes();

    // Clock priority (higher = preferred clock source)
    outInfo->outClockPriority = 0;

    return suiteError_NoError;
}
```

### Step 3: Instance Creation

```cpp
typedef struct {
    void*           deviceHandle;
    void*           transferBuffer;
    csSDK_int32     currentVideoMode;
    csSDK_int32     currentAudioMode;
} TransmitterInstance;

prSuiteError CreateInstance(tmStdParms* stdParms, tmInstance* outInstance) {
    TransmitterInstance* inst = new TransmitterInstance();

    // Initialize device
    inst->deviceHandle = OpenOutputDevice();
    if (!inst->deviceHandle) {
        delete inst;
        return suiteError_Fail;
    }

    // Allocate transfer buffer
    inst->transferBuffer = AllocateTransferBuffer();

    // Store instance data
    outInstance->privateData = inst;

    return suiteError_NoError;
}
```

### Step 4: Video Mode Handling

```cpp
prSuiteError QueryVideoMode(tmStdParms* stdParms, tmVideoMode* mode) {
    csSDK_int32 modeIndex = mode->modeIndex;

    // Populate mode information
    switch (modeIndex) {
        case 0:
            wcscpy(mode->modeName, L"1080p 23.976");
            mode->width = 1920;
            mode->height = 1080;
            mode->frameRate = MakeFrameRate(24000, 1001);
            mode->fieldType = tmFieldType_Progressive;
            mode->preferredFormat = PrPixelFormat_BGRA_4444_8u;
            break;
        case 1:
            wcscpy(mode->modeName, L"1080p 29.97");
            mode->width = 1920;
            mode->height = 1080;
            mode->frameRate = MakeFrameRate(30000, 1001);
            mode->fieldType = tmFieldType_Progressive;
            mode->preferredFormat = PrPixelFormat_BGRA_4444_8u;
            break;
        // ... additional modes
    }

    return suiteError_NoError;
}
```

### Step 5: Frame Handling

```cpp
prSuiteError PushVideo(tmStdParms* stdParms, tmPushVideo* video) {
    TransmitterInstance* inst =
        (TransmitterInstance*)stdParms->ioPrivateData;

    // Get pixel suite
    PrSDKPPixSuite* ppixSuite;
    stdParms->piSuites->AcquireSuite(
        kPrSDKPPixSuite,
        kPrSDKPPixSuiteVersion,
        (void**)&ppixSuite
    );

    // Get frame data
    char* pixels;
    ppixSuite->GetPixels(video->inPPixBuffer,
                         PrPPixBufferAccess_ReadOnly,
                         &pixels);

    prRect bounds;
    ppixSuite->GetBounds(video->inPPixBuffer, &bounds);

    csSDK_int32 rowBytes;
    ppixSuite->GetRowBytes(video->inPPixBuffer, &rowBytes);

    // Transfer to output device
    TransferFrame(inst->deviceHandle,
                  pixels,
                  bounds.right - bounds.left,
                  bounds.bottom - bounds.top,
                  rowBytes);

    return suiteError_NoError;
}
```

---

## 12. Best Practices

### Performance Optimization

1. **Use async transfers**
   - Never block in `tmPushVideo`
   - Use DMA when available
   - Double/triple buffer

2. **Minimize format conversion**
   - Request preferred format in `tmVideoMode`
   - Use hardware conversion when available

3. **Leverage GPU data path**
   - Check for GPU PPix before CPU fallback
   - Use CUDA/Metal for direct GPU-to-device transfer

### Error Handling

```cpp
prSuiteError SafePushVideo(tmStdParms* stdParms, tmPushVideo* video) {
    if (!stdParms || !video) {
        return suiteError_InvalidParms;
    }

    if (!video->inPPixBuffer) {
        return suiteError_InvalidParms;
    }

    TransmitterInstance* inst =
        (TransmitterInstance*)stdParms->ioPrivateData;

    if (!inst || !inst->deviceHandle) {
        return suiteError_Fail;
    }

    // Safe to proceed
    return DoPushVideo(inst, video);
}
```

### Testing Recommendations

1. **Test with multiple frame rates**
   - 23.976, 29.97, 59.94 (drop frame)
   - 24, 25, 30, 50, 60 (non-drop)

2. **Test field handling**
   - Progressive
   - Upper field first
   - Lower field first

3. **Test color spaces**
   - Rec.709
   - Rec.2020
   - DCI-P3

4. **Stress test**
   - Long playback sessions
   - Start/stop cycles
   - Mode switching

### Common Pitfalls

| Issue | Solution |
|-------|----------|
| Frame drops | Use async transfer, optimize conversion |
| Audio sync | Use playback clock, match sample rates |
| Crashes on mode change | Clean shutdown before mode switch |
| Memory leaks | Track all allocations, use RAII |
| Threading issues | All work on main thread or async with proper sync |

---

## References

- [Adobe Mercury Transmit SDK Documentation](https://developer.adobe.com)
- [Premiere Pro SDK Guide](https://ppro-plugins.docsforadobe.dev/)
- [After Effects SDK Guide](https://ae-plugins.docsforadobe.dev/)
- [Blackmagic DeckLink SDK](https://www.blackmagicdesign.com/developer/)
- [AJA Developer Resources](https://www.aja.com/products/developer)
- [Syphon-Transmit GitHub](https://github.com/Syphon/Syphon-Transmit)

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Covers: Mercury Transmit API and BlitHook legacy API*
