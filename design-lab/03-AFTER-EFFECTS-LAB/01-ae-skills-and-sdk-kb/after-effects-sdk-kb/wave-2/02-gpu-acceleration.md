---
source: https://ae-plugins.docsforadobe.dev
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
api_version: '25.4'
title: Adobe After Effects SDK - GPU Acceleration Complete Guide
---
[3-Resources/anchors/status-active]]


# Adobe After Effects SDK - GPU Acceleration Complete Guide

## Executive Summary

GPU acceleration in After Effects plugins represents a paradigm shift from traditional CPU-based rendering to massively parallel GPU computing. Introduced in After Effects 16.0, the GPU Effects API enables plugin developers to leverage NVIDIA CUDA, Apple Metal, OpenCL, and Microsoft DirectX for dramatically improved rendering performance.

This comprehensive guide covers the complete GPU effects development workflow, from architecture fundamentals through platform-specific implementations, memory management, and production deployment strategies.

---

## Table of Contents

1. [[#GPU Effects Architecture Overview]]
2. [[#Supported GPU APIs]]
3. [[#GPU Command Selectors]]
4. [[#GPU Device Information Structures]]
5. [[#GPU Texture Handling]]
6. [[#Memory Management on GPU]]
7. [[#GPU Rendering Pipeline]]
8. [[#CPU Fallback Strategies]]
9. [[#Build Configuration]]
10. [[#Sample GPU Effect Analysis]]
11. [[#Best Practices and Optimization]]
12. [[#Troubleshooting Guide]]

---

## GPU Effects Architecture Overview

### Historical Context

The After Effects GPU SDK was introduced in version 16.0, marking a significant evolution in the plugin architecture. Prior to this, all effect processing occurred on the CPU, limiting performance on complex compositions. The GPU framework integrates with the existing SmartFX architecture while adding GPU-specific command selectors and data structures.

### Architecture Principles

The GPU effects framework follows these core architectural principles:

1. **Device Abstraction**: A unified API abstracts differences between CUDA, Metal, OpenCL, and DirectX
2. **Bidirectional Communication**: Effects declare GPU capabilities; the host manages device selection
3. **Fallback Support**: Effects can gracefully degrade to CPU rendering when GPU is unavailable
4. **Memory Efficiency**: Explicit memory management prevents GPU memory exhaustion
5. **Multi-Framework Support**: Single effect binary can support multiple GPU frameworks

### Integration with SmartFX

GPU effects extend the SmartFX two-phase rendering model:

```
┌─────────────────────────────────────────────────────────────┐
│                    SmartFX + GPU Pipeline                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Pre-Render      │───>│  GPU Device      │               │
│  │  Phase           │    │  Setup           │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           v                       v                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Declare Input   │    │  Allocate GPU    │               │
│  │  Requirements    │    │  Resources       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           v                       v                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Smart Render    │───>│  GPU Kernel      │               │
│  │  GPU             │    │  Execution       │               │
│  └──────────────────┘    └──────────────────┘               │
│           │                       │                          │
│           v                       v                          │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Output          │<───│  GPU Device      │               │
│  │  Generation      │    │  Setdown         │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Capability Declaration

Effects declare GPU support during `PF_Cmd_GLOBAL_SETUP` by setting the appropriate `PF_OutFlag2` flags:

```cpp
// In PF_Cmd_GLOBAL_SETUP handler
out_data->out_flags2 |= PF_OutFlag2_SUPPORTS_GPU_RENDER_F32;
```

This flag serves dual purposes:
1. **Runtime Behavior**: Effect receives GPU-specific selectors during execution
2. **UI Indication**: Effect displays GPU capability badge in After Effects interface

---

## Supported GPU APIs

### Overview Matrix

| API | Platform | Vendor Support | AE Version |
|-----|----------|----------------|------------|
| CUDA | Windows, Linux | NVIDIA only | 16.0+ |
| Metal | macOS | Apple Silicon, AMD | 16.0+ |
| OpenCL | Cross-platform | Multi-vendor | 16.0+ |
| DirectX | Windows | Multi-vendor | 25.0+ |

### CUDA Implementation

NVIDIA's Compute Unified Device Architecture (CUDA) provides the most mature GPU computing platform for After Effects plugins.

#### CUDA SDK Requirements

After Effects 25.4 requires CUDA 12.8. Earlier versions may use different CUDA SDKs:

| AE Version | CUDA Version |
|------------|--------------|
| 25.4 | 12.8 |
| 24.x | 12.x |
| 23.x | 11.x |
| 16.0-22.x | 10.x |

#### CUDA Driver API vs Runtime API

The SDK recommends using the CUDA Driver API for maximum compatibility:

```cpp
// CUDA Driver API approach (recommended)
#include <cuda.h>

CUresult initCUDA() {
    CUresult result = cuInit(0);
    if (result != CUDA_SUCCESS) {
        return result;
    }

    CUdevice device;
    result = cuDeviceGet(&device, 0);
    if (result != CUDA_SUCCESS) {
        return result;
    }

    CUcontext context;
    result = cuCtxCreate(&context, 0, device);
    return result;
}
```

#### CUDA Linking Strategies

Three approaches exist for CUDA library linking:

1. **Driver API (Recommended)**
   - Maximum compatibility across CUDA versions
   - No runtime library distribution required
   - Requires explicit context management

2. **Static Linking (cudart_static.lib)**
   - Self-contained binary
   - Larger file size
   - No external dependencies

3. **Dynamic Linking (cudart.dll)**
   - Smaller binary
   - Requires DLL distribution
   - Version dependency management

```cpp
// Environment variable setup (Windows)
// Set before building:
// CUDA_SDK_BASE_PATH = C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.8
```

### Metal Implementation (macOS)

Apple's Metal API provides optimal GPU performance on macOS systems.

#### Metal Framework Setup

```cpp
#include <Metal/Metal.h>
#include <MetalKit/MetalKit.h>

// Metal device initialization
id<MTLDevice> initMetal() {
    id<MTLDevice> device = MTLCreateSystemDefaultDevice();
    if (!device) {
        // Handle Metal unavailable
        return nil;
    }
    return device;
}

// Metal command queue creation
id<MTLCommandQueue> createCommandQueue(id<MTLDevice> device) {
    return [device newCommandQueue];
}
```

#### Metal Shader Compilation

Metal shaders can be compiled at build time or runtime:

```cpp
// Build-time compilation (recommended)
// metallib files are generated from .metal source files

// Runtime compilation
id<MTLLibrary> library = [device newLibraryWithSource:shaderSource
                                              options:nil
                                                error:&error];
```

### OpenCL Implementation

OpenCL provides cross-platform GPU support for multi-vendor compatibility.

#### OpenCL Context Setup

```cpp
#include <CL/cl.h>

cl_int initOpenCL(cl_context* context, cl_command_queue* queue) {
    cl_platform_id platform;
    cl_device_id device;
    cl_int err;

    // Get platform
    err = clGetPlatformIDs(1, &platform, NULL);
    if (err != CL_SUCCESS) return err;

    // Get GPU device
    err = clGetDeviceIDs(platform, CL_DEVICE_TYPE_GPU, 1, &device, NULL);
    if (err != CL_SUCCESS) return err;

    // Create context
    *context = clCreateContext(NULL, 1, &device, NULL, NULL, &err);
    if (err != CL_SUCCESS) return err;

    // Create command queue
    *queue = clCreateCommandQueue(*context, device, 0, &err);
    return err;
}
```

#### OpenCL Kernel Example

```opencl
__kernel void invertEffect(
    __global const float4* input,
    __global float4* output,
    const int width,
    const int height)
{
    int x = get_global_id(0);
    int y = get_global_id(1);

    if (x < width && y < height) {
        int idx = y * width + x;
        float4 pixel = input[idx];

        // Invert RGB, preserve alpha
        output[idx] = (float4)(
            1.0f - pixel.x,
            1.0f - pixel.y,
            1.0f - pixel.z,
            pixel.w
        );
    }
}
```

### DirectX Implementation (Windows)

DirectX support was enhanced in After Effects 25.0 with DirectX Shader Compiler integration.

#### DirectX Setup Requirements

```cpp
// Environment variable
// DXC_SDK_BASE_PATH = path to DirectX Shader Compiler

// PiPL flag requirement
// Set PF_OutFlag2_SUPPORTS_DIRECTX_RENDERING in PiPL resources
```

#### DirectX Asset Deployment

Critical: The `DirectXAssets` folder generated during build must be copied alongside the plugin binary for runtime functionality.

```
MyPlugin/
├── MyPlugin.aex
└── DirectXAssets/
    ├── shader_vs.cso
    ├── shader_ps.cso
    └── ...
```

#### HLSL Shader Example

```hlsl
// Vertex Shader
struct VS_INPUT {
    float4 position : POSITION;
    float2 texcoord : TEXCOORD0;
};

struct VS_OUTPUT {
    float4 position : SV_POSITION;
    float2 texcoord : TEXCOORD0;
};

VS_OUTPUT VSMain(VS_INPUT input) {
    VS_OUTPUT output;
    output.position = input.position;
    output.texcoord = input.texcoord;
    return output;
}

// Pixel Shader
Texture2D inputTexture : register(t0);
SamplerState textureSampler : register(s0);

float4 PSMain(VS_OUTPUT input) : SV_TARGET {
    float4 color = inputTexture.Sample(textureSampler, input.texcoord);
    // Invert RGB
    return float4(1.0 - color.rgb, color.a);
}
```

---

## GPU Command Selectors

### Command Selector Overview

GPU effects receive three primary command selectors in addition to standard effect selectors:

| Selector | Purpose | Timing |
|----------|---------|--------|
| `PF_Cmd_GPU_DEVICE_SETUP` | Initialize GPU resources | Once per device |
| `PF_Cmd_GPU_DEVICE_SETDOWN` | Release GPU resources | Before device release |
| `PF_Cmd_SMART_RENDER_GPU` | Perform GPU rendering | Each render call |

### PF_Cmd_GPU_DEVICE_SETUP

This selector is called by the host to initialize GPU resources. It may be called at any time but will be called not more than once for each GPU device.

```cpp
static PF_Err HandleGPUDeviceSetup(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output,
    PF_GPUDeviceSetupExtra* gpu_setup)
{
    PF_Err err = PF_Err_NONE;

    // Determine GPU framework
    switch (gpu_setup->what_gpu) {
        case PF_GPU_Framework_CUDA:
            err = InitializeCUDA(gpu_setup);
            break;

        case PF_GPU_Framework_OPENCL:
            err = InitializeOpenCL(gpu_setup);
            break;

        case PF_GPU_Framework_METAL:
            err = InitializeMetal(gpu_setup);
            break;

        case PF_GPU_Framework_DIRECTX:
            err = InitializeDirectX(gpu_setup);
            break;
    }

    if (!err) {
        // Store GPU context in sequence data
        PF_Handle gpu_data = PF_NEW_HANDLE(sizeof(GPUContext));
        if (gpu_data) {
            GPUContext* ctx = (GPUContext*)PF_LOCK_HANDLE(gpu_data);
            // Initialize context...
            PF_UNLOCK_HANDLE(gpu_data);
            gpu_setup->gpu_data = gpu_data;
        }
    }

    return err;
}
```

#### Device Setup Responsibilities

1. **Query Device Capabilities**: Determine compute capability, memory size
2. **Compile GPU Kernels**: Pre-compile shaders for the target device
3. **Allocate Persistent Resources**: Create buffers that persist across renders
4. **Store Context Handle**: Save GPU context in `gpu_setup->gpu_data`

### PF_Cmd_GPU_DEVICE_SETDOWN

This selector releases GPU resources before the host releases the GPU device. Effects must dispose of `gpu_data` through this selector.

```cpp
static PF_Err HandleGPUDeviceSetdown(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output,
    PF_GPUDeviceSetdownExtra* gpu_setdown)
{
    PF_Err err = PF_Err_NONE;

    if (gpu_setdown->gpu_data) {
        GPUContext* ctx = (GPUContext*)PF_LOCK_HANDLE(gpu_setdown->gpu_data);

        // Release GPU resources based on framework
        switch (gpu_setdown->what_gpu) {
            case PF_GPU_Framework_CUDA:
                ReleaseCUDAResources(ctx);
                break;

            case PF_GPU_Framework_OPENCL:
                ReleaseOpenCLResources(ctx);
                break;

            case PF_GPU_Framework_METAL:
                ReleaseMetalResources(ctx);
                break;

            case PF_GPU_Framework_DIRECTX:
                ReleaseDirectXResources(ctx);
                break;
        }

        PF_UNLOCK_HANDLE(gpu_setdown->gpu_data);
        PF_DISPOSE_HANDLE(gpu_setdown->gpu_data);
        gpu_setdown->gpu_data = NULL;
    }

    return err;
}
```

### PF_Cmd_SMART_RENDER_GPU

This is the GPU equivalent of `PF_Cmd_SMART_RENDER`. All frame operations occur on GPU buffers during this selector.

```cpp
static PF_Err HandleSmartRenderGPU(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output,
    PF_SmartRenderExtra* extra)
{
    PF_Err err = PF_Err_NONE;

    // Access GPU context
    GPUContext* ctx = (GPUContext*)PF_LOCK_HANDLE(extra->gpu_data);
    if (!ctx) {
        return PF_Err_BAD_CALLBACK_PARAM;
    }

    // Get input and output GPU textures
    PF_GPUWorld input_world, output_world;

    err = extra->cb->checkout_layer_pixels_gpu(
        in_data->effect_ref,
        0,  // layer index
        &input_world);

    if (!err) {
        err = extra->cb->get_output_world_gpu(
            in_data->effect_ref,
            &output_world);
    }

    if (!err) {
        // Execute GPU kernel
        err = ExecuteGPUKernel(ctx, &input_world, &output_world, params);
    }

    PF_UNLOCK_HANDLE(extra->gpu_data);
    return err;
}
```

### Pre-Render GPU Integration

During `PF_Cmd_SMART_PRE_RENDER`, effects can indicate GPU rendering capability:

```cpp
static PF_Err HandleSmartPreRender(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_PreRenderExtra* extra)
{
    PF_Err err = PF_Err_NONE;

    // Standard pre-render setup
    PF_RenderRequest req = extra->input->output_request;

    // Indicate GPU rendering is possible
    extra->output->flags |= PF_RenderOutputFlag_GPU_RENDER_POSSIBLE;

    // Checkout input layer
    err = extra->cb->checkout_layer(
        in_data->effect_ref,
        0,  // layer index
        0,  // param index
        &req,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &extra->output->max_result_rect);

    return err;
}
```

---

## GPU Device Information Structures

### PF_GPUDeviceInfo

The `PF_GPUDeviceInfo` structure provides information about the GPU device:

```cpp
typedef struct PF_GPUDeviceInfo {
    A_long          device_index;       // GPU device index
    PF_GPU_Framework what_gpu;          // CUDA, OpenCL, Metal, DirectX
    void*           deviceHandle;       // Native device handle
    void*           contextHandle;      // Native context handle
    A_u_long        total_mem;          // Total device memory (bytes)
    A_u_long        free_mem;           // Available device memory (bytes)
    char            device_name[256];   // Human-readable device name
    A_long          compute_capability_major;
    A_long          compute_capability_minor;
} PF_GPUDeviceInfo;
```

### PF_GPUDeviceSetupExtra

Extended setup information passed during device setup:

```cpp
typedef struct PF_GPUDeviceSetupExtra {
    PF_GPUDeviceInfo    device_info;
    PF_GPU_Framework    what_gpu;
    A_long              device_index;
    PF_Handle           gpu_data;       // Effect stores context here
} PF_GPUDeviceSetupExtra;
```

### PF_GPU_Framework Enumeration

```cpp
typedef enum {
    PF_GPU_Framework_NONE = 0,
    PF_GPU_Framework_CUDA,
    PF_GPU_Framework_OPENCL,
    PF_GPU_Framework_METAL,
    PF_GPU_Framework_DIRECTX
} PF_GPU_Framework;
```

### Accessing Native Handles

```cpp
// CUDA context access
CUcontext cudaContext = (CUcontext)device_info.contextHandle;

// Metal device access
id<MTLDevice> metalDevice = (__bridge id<MTLDevice>)device_info.deviceHandle;

// OpenCL context access
cl_context clContext = (cl_context)device_info.contextHandle;

// DirectX device access
ID3D11Device* d3dDevice = (ID3D11Device*)device_info.deviceHandle;
```

---

## GPU Texture Handling

### PF_GPUWorld Structure

GPU textures are represented by the `PF_GPUWorld` structure:

```cpp
typedef struct PF_GPUWorld {
    A_long          width;              // Texture width in pixels
    A_long          height;             // Texture height in pixels
    A_long          rowbytes;           // Bytes per row (may include padding)
    PF_PixelFormat  pixel_format;       // Pixel format (usually 32bpc float)
    void*           texture_handle;     // Native GPU texture handle
    PF_GPU_Framework what_gpu;          // Framework this texture belongs to
} PF_GPUWorld;
```

### Texture Access Patterns

#### CUDA Texture Access

```cpp
void processCUDATexture(
    PF_GPUWorld* input,
    PF_GPUWorld* output,
    CUcontext context)
{
    CUarray inputArray = (CUarray)input->texture_handle;
    CUarray outputArray = (CUarray)output->texture_handle;

    // Create texture object for reading
    CUDA_TEXTURE_DESC texDesc = {};
    texDesc.addressMode[0] = CU_TR_ADDRESS_MODE_CLAMP;
    texDesc.addressMode[1] = CU_TR_ADDRESS_MODE_CLAMP;
    texDesc.filterMode = CU_TR_FILTER_MODE_LINEAR;
    texDesc.flags = CU_TRSF_NORMALIZED_COORDINATES;

    CUtexObject texObj;
    cuTexObjectCreate(&texObj, &resDesc, &texDesc, NULL);

    // Create surface object for writing
    CUsurfObject surfObj;
    cuSurfObjectCreate(&surfObj, &surfResDesc);

    // Launch kernel
    // ...
}
```

#### Metal Texture Access

```cpp
void processMetalTexture(
    PF_GPUWorld* input,
    PF_GPUWorld* output,
    id<MTLDevice> device,
    id<MTLCommandQueue> commandQueue)
{
    id<MTLTexture> inputTexture = (__bridge id<MTLTexture>)input->texture_handle;
    id<MTLTexture> outputTexture = (__bridge id<MTLTexture>)output->texture_handle;

    id<MTLCommandBuffer> commandBuffer = [commandQueue commandBuffer];
    id<MTLComputeCommandEncoder> encoder = [commandBuffer computeCommandEncoder];

    [encoder setComputePipelineState:pipelineState];
    [encoder setTexture:inputTexture atIndex:0];
    [encoder setTexture:outputTexture atIndex:1];

    MTLSize threadGroupSize = MTLSizeMake(16, 16, 1);
    MTLSize numThreadGroups = MTLSizeMake(
        (input->width + 15) / 16,
        (input->height + 15) / 16,
        1);

    [encoder dispatchThreadgroups:numThreadGroups
            threadsPerThreadgroup:threadGroupSize];
    [encoder endEncoding];
    [commandBuffer commit];
    [commandBuffer waitUntilCompleted];
}
```

### Pixel Format Considerations

GPU effects typically work with 32-bit floating-point pixels:

```cpp
// Standard GPU pixel format
typedef struct PF_PixelFloat {
    PF_FpShort  alpha;
    PF_FpShort  red;
    PF_FpShort  green;
    PF_FpShort  blue;
} PF_PixelFloat;

// Note: Channel order may differ between frameworks
// CUDA: RGBA or ARGB depending on configuration
// Metal: RGBA (MTLPixelFormatRGBA32Float)
// OpenCL: Configurable, typically RGBA
// DirectX: RGBA (DXGI_FORMAT_R32G32B32A32_FLOAT)
```

---

## Memory Management on GPU

### Memory Allocation Strategies

#### Persistent Resources

Allocate during `PF_Cmd_GPU_DEVICE_SETUP`, release during `PF_Cmd_GPU_DEVICE_SETDOWN`:

```cpp
typedef struct GPUContext {
    // CUDA resources
    CUmodule        cudaModule;
    CUfunction      cudaKernel;
    CUdeviceptr     constantBuffer;

    // Metal resources
    id<MTLComputePipelineState> metalPipeline;
    id<MTLBuffer>   metalConstantBuffer;

    // OpenCL resources
    cl_program      clProgram;
    cl_kernel       clKernel;
    cl_mem          clConstantBuffer;

    // Common
    size_t          constantBufferSize;
} GPUContext;
```

#### Per-Frame Resources

Allocate and release within `PF_Cmd_SMART_RENDER_GPU`:

```cpp
PF_Err RenderFrame(GPUContext* ctx, PF_GPUWorld* input, PF_GPUWorld* output) {
    // Allocate temporary buffer
    CUdeviceptr tempBuffer;
    size_t bufferSize = input->width * input->height * sizeof(float4);

    CUresult result = cuMemAlloc(&tempBuffer, bufferSize);
    if (result != CUDA_SUCCESS) {
        return PF_Err_OUT_OF_MEMORY;
    }

    // Use buffer for processing
    // ...

    // Free temporary buffer
    cuMemFree(tempBuffer);

    return PF_Err_NONE;
}
```

### Memory Pool Management

For effects requiring frequent allocations, implement a memory pool:

```cpp
typedef struct MemoryPool {
    CUdeviceptr     blocks[MAX_BLOCKS];
    size_t          blockSizes[MAX_BLOCKS];
    bool            inUse[MAX_BLOCKS];
    int             blockCount;
} MemoryPool;

CUdeviceptr AllocFromPool(MemoryPool* pool, size_t size) {
    // Find free block of sufficient size
    for (int i = 0; i < pool->blockCount; i++) {
        if (!pool->inUse[i] && pool->blockSizes[i] >= size) {
            pool->inUse[i] = true;
            return pool->blocks[i];
        }
    }

    // Allocate new block
    if (pool->blockCount < MAX_BLOCKS) {
        CUdeviceptr newBlock;
        if (cuMemAlloc(&newBlock, size) == CUDA_SUCCESS) {
            pool->blocks[pool->blockCount] = newBlock;
            pool->blockSizes[pool->blockCount] = size;
            pool->inUse[pool->blockCount] = true;
            pool->blockCount++;
            return newBlock;
        }
    }

    return 0;  // Allocation failed
}
```

### Memory Pressure Handling

Monitor available GPU memory and handle exhaustion gracefully:

```cpp
bool CheckGPUMemory(size_t required) {
    size_t free, total;

#ifdef USE_CUDA
    cuMemGetInfo(&free, &total);
#elif defined(USE_METAL)
    // Metal doesn't provide direct memory queries
    // Use system-level APIs or heuristics
#endif

    // Require 20% headroom
    return (free > required * 1.2);
}
```

---

## GPU Rendering Pipeline

### Complete Rendering Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GPU Rendering Pipeline                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. PF_Cmd_GLOBAL_SETUP                                     │
│     └─> Set PF_OutFlag2_SUPPORTS_GPU_RENDER_F32             │
│                                                              │
│  2. PF_Cmd_GPU_DEVICE_SETUP (once per device)               │
│     ├─> Query device capabilities                            │
│     ├─> Compile GPU kernels                                  │
│     ├─> Allocate persistent resources                        │
│     └─> Store context in gpu_data                           │
│                                                              │
│  3. PF_Cmd_SMART_PRE_RENDER (each frame)                    │
│     ├─> Set PF_RenderOutputFlag_GPU_RENDER_POSSIBLE         │
│     ├─> Checkout input layers                                │
│     └─> Declare output rectangle                             │
│                                                              │
│  4. PF_Cmd_SMART_RENDER_GPU (each frame)                    │
│     ├─> Checkout GPU textures                                │
│     ├─> Set kernel parameters                                │
│     ├─> Execute GPU kernel                                   │
│     ├─> Synchronize                                          │
│     └─> Check-in textures                                    │
│                                                              │
│  5. PF_Cmd_GPU_DEVICE_SETDOWN (once per device)             │
│     ├─> Release GPU resources                                │
│     └─> Dispose gpu_data handle                             │
│                                                              │
│  6. PF_Cmd_GLOBAL_SETDOWN                                   │
│     └─> Final cleanup                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Pass Rendering

Complex effects may require multiple GPU passes:

```cpp
PF_Err MultiPassRender(GPUContext* ctx, PF_GPUWorld* input, PF_GPUWorld* output) {
    PF_Err err = PF_Err_NONE;

    // Allocate intermediate buffers
    CUdeviceptr pass1Output, pass2Output;
    size_t bufferSize = input->width * input->height * sizeof(float4);

    cuMemAlloc(&pass1Output, bufferSize);
    cuMemAlloc(&pass2Output, bufferSize);

    // Pass 1: Horizontal blur
    err = LaunchHorizontalBlur(ctx, input, pass1Output);
    if (err) goto cleanup;

    // Synchronize between passes
    cuStreamSynchronize(ctx->stream);

    // Pass 2: Vertical blur
    err = LaunchVerticalBlur(ctx, pass1Output, pass2Output);
    if (err) goto cleanup;

    cuStreamSynchronize(ctx->stream);

    // Pass 3: Composite
    err = LaunchComposite(ctx, input, pass2Output, output);

cleanup:
    cuMemFree(pass1Output);
    cuMemFree(pass2Output);

    return err;
}
```

### Asynchronous Execution

Leverage GPU streams for overlapped operations:

```cpp
void AsyncRender(GPUContext* ctx) {
    // Create multiple streams
    CUstream stream1, stream2;
    cuStreamCreate(&stream1, CU_STREAM_DEFAULT);
    cuStreamCreate(&stream2, CU_STREAM_DEFAULT);

    // Launch kernels on different streams
    cuLaunchKernel(ctx->kernel1, ..., stream1, ...);
    cuLaunchKernel(ctx->kernel2, ..., stream2, ...);

    // Synchronize when needed
    cuStreamSynchronize(stream1);
    cuStreamSynchronize(stream2);
}
```

---

## CPU Fallback Strategies

### Fallback Decision Matrix

| Condition | Action |
|-----------|--------|
| No GPU available | Fall back to CPU |
| GPU memory exhausted | Fall back to CPU |
| Unsupported pixel format | Fall back to CPU |
| User preference | Respect system settings |
| Device setup failed | Fall back to CPU |

### Implementing Fallback

```cpp
static PF_Err SmartRender(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_SmartRenderExtra* extra)
{
    PF_Err err = PF_Err_NONE;

    // Check if GPU rendering is available
    bool useGPU = (extra->gpu_data != NULL) &&
                  (extra->what_gpu != PF_GPU_Framework_NONE);

    if (useGPU) {
        err = SmartRenderGPU(in_data, out_data, extra);

        // If GPU failed, fall back to CPU
        if (err) {
            err = SmartRenderCPU(in_data, out_data, extra);
        }
    } else {
        err = SmartRenderCPU(in_data, out_data, extra);
    }

    return err;
}
```

### Matching CPU and GPU Results

Ensure CPU and GPU implementations produce identical results:

```cpp
// Use consistent math libraries
// GPU: Use CUDA math functions with consistent rounding
// CPU: Use same mathematical approach

// Example: Gaussian blur with consistent coefficients
const float GAUSS_COEFFS[] = {
    0.0545f, 0.2442f, 0.4026f, 0.2442f, 0.0545f
};

// Same coefficients used in both CPU and GPU implementations
```

---

## Build Configuration

### macOS Build Configuration (Xcode)

#### Boost Dependency Setup

```bash
# Install Boost via Homebrew
brew install boost

# Typical installation path
/usr/local/Cellar/boost/[version]/include/boost
# or
/usr/local/include/boost
```

#### Xcode Configuration

1. Open **Xcode > Settings > Locations > Custom Paths**
2. Add custom path:
   - **Name**: `BOOST_BASE_PATH`
   - **Path**: Your Boost installation directory

#### Python Requirements

The SDK build process requires Python for kernel processing:

```bash
# Ensure Python is available
which python3

# If using Python 3, modify build rules to use "python3" instead of "python"
```

#### Metal Shader Compilation

```bash
# Compile Metal shaders at build time
xcrun -sdk macosx metal -c MyShader.metal -o MyShader.air
xcrun -sdk macosx metallib MyShader.air -o MyShader.metallib
```

### Windows Build Configuration (Visual Studio)

#### Environment Variables

```batch
REM CUDA SDK
set CUDA_SDK_BASE_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.8

REM Boost
set Boost_BASE_PATH=C:\boost_1_82_0

REM DirectX Shader Compiler
set DXC_SDK_BASE_PATH=C:\DirectXShaderCompiler
```

#### Boost Build

```batch
cd C:\boost_1_82_0
bootstrap.bat
b2 --build-type=complete
```

#### DirectX Shader Compiler

Download from Microsoft's GitHub repository:
https://github.com/microsoft/DirectXShaderCompiler

#### Project Settings

```xml
<!-- Additional Include Directories -->
$(CUDA_SDK_BASE_PATH)\include
$(Boost_BASE_PATH)
$(DXC_SDK_BASE_PATH)\include

<!-- Additional Library Directories -->
$(CUDA_SDK_BASE_PATH)\lib\x64
$(DXC_SDK_BASE_PATH)\lib\x64
```

### PiPL Resource Configuration

```cpp
// Include GPU support flags in PiPL
resource 'PiPL' (16000) {
    {
        // Standard properties
        Kind { AEEffect },
        Name { "My GPU Effect" },
        Category { "Custom" },

        // GPU capability flags
        AE_Effect_Spec_Version { PF_PLUG_IN_VERSION, PF_PLUG_IN_SUBVERS },
        AE_Effect_Global_OutFlags_2 {
            PF_OutFlag2_SUPPORTS_GPU_RENDER_F32 |
            PF_OutFlag2_SUPPORTS_DIRECTX_RENDERING
        }
    }
};
```

---

## Sample GPU Effect Analysis

### SDK_Invert_ProcAmp Sample

The `SDK_Invert_ProcAmp` sample effect demonstrates the complete GPU effects API.

#### File Structure

```
SDK_Invert_ProcAmp/
├── SDK_Invert_ProcAmp.cpp          # Main effect code
├── SDK_Invert_ProcAmp.h            # Header definitions
├── SDK_Invert_ProcAmp_GPU.cpp      # GPU implementation
├── SDK_Invert_ProcAmp_Kernel.cu    # CUDA kernel
├── SDK_Invert_ProcAmp_Kernel.cl    # OpenCL kernel
├── SDK_Invert_ProcAmp_Kernel.metal # Metal kernel
├── SDK_Invert_ProcAmp_Kernel.hlsl  # DirectX shader
└── SDK_Invert_ProcAmp.r            # PiPL resource
```

#### Entry Point Structure

```cpp
// Main entry point
PF_Err EffectMain(
    PF_Cmd cmd,
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output,
    void* extra)
{
    PF_Err err = PF_Err_NONE;

    switch (cmd) {
        case PF_Cmd_GLOBAL_SETUP:
            err = GlobalSetup(in_data, out_data);
            break;

        case PF_Cmd_GPU_DEVICE_SETUP:
            err = GPUDeviceSetup(in_data, out_data,
                (PF_GPUDeviceSetupExtra*)extra);
            break;

        case PF_Cmd_GPU_DEVICE_SETDOWN:
            err = GPUDeviceSetdown(in_data, out_data,
                (PF_GPUDeviceSetdownExtra*)extra);
            break;

        case PF_Cmd_SMART_PRE_RENDER:
            err = SmartPreRender(in_data, out_data,
                (PF_PreRenderExtra*)extra);
            break;

        case PF_Cmd_SMART_RENDER:
            err = SmartRender(in_data, out_data,
                (PF_SmartRenderExtra*)extra);
            break;

        case PF_Cmd_SMART_RENDER_GPU:
            err = SmartRenderGPU(in_data, out_data,
                (PF_SmartRenderExtra*)extra);
            break;

        // ... other selectors
    }

    return err;
}
```

#### CUDA Kernel Implementation

```cuda
// SDK_Invert_ProcAmp_Kernel.cu

extern "C" __global__ void InvertProcAmpKernel(
    cudaSurfaceObject_t input,
    cudaSurfaceObject_t output,
    int width,
    int height,
    float brightness,
    float contrast,
    float saturation,
    bool invert)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;

    if (x >= width || y >= height) return;

    // Read input pixel
    float4 pixel;
    surf2Dread(&pixel, input, x * sizeof(float4), y);

    // Apply inversion
    if (invert) {
        pixel.x = 1.0f - pixel.x;
        pixel.y = 1.0f - pixel.y;
        pixel.z = 1.0f - pixel.z;
    }

    // Apply brightness/contrast
    pixel.x = (pixel.x - 0.5f) * contrast + 0.5f + brightness;
    pixel.y = (pixel.y - 0.5f) * contrast + 0.5f + brightness;
    pixel.z = (pixel.z - 0.5f) * contrast + 0.5f + brightness;

    // Apply saturation
    float luma = 0.299f * pixel.x + 0.587f * pixel.y + 0.114f * pixel.z;
    pixel.x = luma + saturation * (pixel.x - luma);
    pixel.y = luma + saturation * (pixel.y - luma);
    pixel.z = luma + saturation * (pixel.z - luma);

    // Clamp values
    pixel.x = fmaxf(0.0f, fminf(1.0f, pixel.x));
    pixel.y = fmaxf(0.0f, fminf(1.0f, pixel.y));
    pixel.z = fmaxf(0.0f, fminf(1.0f, pixel.z));

    // Write output
    surf2Dwrite(pixel, output, x * sizeof(float4), y);
}
```

---

## Best Practices and Optimization

### Performance Guidelines

1. **Minimize CPU-GPU Transfers**
   - Keep data on GPU as long as possible
   - Batch small operations
   - Use pinned memory for necessary transfers

2. **Optimize Kernel Launch Configuration**
   ```cpp
   // Optimal thread block sizes
   // Generally 16x16 or 32x32 for 2D image operations
   dim3 blockSize(16, 16);
   dim3 gridSize(
       (width + blockSize.x - 1) / blockSize.x,
       (height + blockSize.y - 1) / blockSize.y
   );
   ```

3. **Use Shared Memory**
   ```cuda
   __shared__ float4 sharedTile[TILE_SIZE][TILE_SIZE];
   // Load tile, synchronize, process
   ```

4. **Avoid Divergent Branches**
   ```cuda
   // Avoid
   if (threadIdx.x < 16) {
       // expensive operation
   } else {
       // different expensive operation
   }

   // Prefer
   float result = condition ? valueA : valueB;
   ```

### Memory Coalescing

```cuda
// Good: Coalesced access (adjacent threads access adjacent memory)
int idx = blockIdx.x * blockDim.x + threadIdx.x;
float value = input[idx];

// Bad: Strided access (poor memory coalescing)
int idx = threadIdx.x * stride;
float value = input[idx];
```

### Error Handling

```cpp
#define CUDA_CHECK(call) \
    do { \
        CUresult result = (call); \
        if (result != CUDA_SUCCESS) { \
            const char* errorStr; \
            cuGetErrorString(result, &errorStr); \
            fprintf(stderr, "CUDA error at %s:%d: %s\n", \
                __FILE__, __LINE__, errorStr); \
            return PF_Err_INTERNAL_STRUCT_DAMAGED; \
        } \
    } while(0)
```

---

## Troubleshooting Guide

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Effect not receiving GPU selectors | Missing `PF_OutFlag2_SUPPORTS_GPU_RENDER_F32` | Set flag in `PF_Cmd_GLOBAL_SETUP` |
| Black output | Kernel not writing to surface | Check surface object binding |
| Inconsistent results | CPU/GPU math differences | Use consistent rounding modes |
| Memory errors | GPU memory exhaustion | Implement memory pooling |
| Slow performance | Too many kernel launches | Batch operations |
| Build failures | Missing dependencies | Verify environment variables |

### Debugging Techniques

#### CUDA Debugging

```cpp
// Enable CUDA debugging
cuInit(0);
cuCtxCreate(&context, CU_CTX_MAP_HOST, device);

// Use cuda-memcheck
// Run: cuda-memcheck AfterEffects.exe
```

#### Metal Debugging

```cpp
// Enable Metal validation
// Set environment variable: MTL_DEBUG_LAYER=1

// Use Metal System Trace in Instruments
```

#### GPU Frame Capture

- **NVIDIA Nsight**: For CUDA debugging
- **RenderDoc**: For DirectX debugging
- **Xcode GPU Frame Capture**: For Metal debugging

### Performance Profiling

```cpp
// CUDA profiling
CUevent start, stop;
cuEventCreate(&start, CU_EVENT_DEFAULT);
cuEventCreate(&stop, CU_EVENT_DEFAULT);

cuEventRecord(start, stream);
// ... kernel execution ...
cuEventRecord(stop, stream);
cuEventSynchronize(stop);

float milliseconds;
cuEventElapsedTime(&milliseconds, start, stop);
```

---

## API Reference Quick Links

- [[01-smart-render-deep-dive|SmartFX and SmartRender]]
- [[03-parameter-supervision|Parameter Management]]
- [[AE-SDK-MASTER-INDEX|SDK Master Index]]

## External Resources

- [After Effects SDK Documentation](https://ae-plugins.docsforadobe.dev)
- [NVIDIA CUDA Documentation](https://docs.nvidia.com/cuda/)
- [Apple Metal Documentation](https://developer.apple.com/metal/)
- [OpenCL Specification](https://www.khronos.org/opencl/)
- [DirectX Documentation](https://docs.microsoft.com/en-us/windows/win32/directx)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-27 | Initial comprehensive guide |

---

## Advanced GPU Topics

### Multi-GPU Rendering

After Effects can leverage multiple GPUs for parallel rendering. Effects must properly handle device indices:

```cpp
PF_Err HandleMultiGPU(PF_GPUDeviceSetupExtra* setup) {
    // Each GPU device gets its own setup call
    A_long deviceIndex = setup->device_index;

    // Create per-device context
    GPUContext* ctx = new GPUContext();
    ctx->deviceIndex = deviceIndex;

    // Initialize resources for this specific device
    switch (setup->what_gpu) {
        case PF_GPU_Framework_CUDA:
            CUdevice device;
            cuDeviceGet(&device, deviceIndex);
            cuCtxCreate(&ctx->cudaContext, 0, device);
            break;

        case PF_GPU_Framework_METAL:
            // Metal devices are accessed via MTLCopyAllDevices()
            NSArray<id<MTLDevice>>* devices = MTLCopyAllDevices();
            ctx->metalDevice = devices[deviceIndex];
            break;
    }

    setup->gpu_data = ctx;
    return PF_Err_NONE;
}
```

### Unified Memory (CUDA)

For effects that need to share data between CPU and GPU:

```cpp
void UseUnifiedMemory() {
    // Allocate unified memory
    float* unifiedBuffer;
    cudaMallocManaged(&unifiedBuffer, bufferSize);

    // Accessible from both CPU and GPU
    unifiedBuffer[0] = 1.0f;  // CPU write

    // Launch kernel using same pointer
    myKernel<<<blocks, threads>>>(unifiedBuffer);

    // Synchronize before CPU read
    cudaDeviceSynchronize();
    float result = unifiedBuffer[0];  // CPU read

    cudaFree(unifiedBuffer);
}
```

### Texture Coordinate Systems

Different GPU frameworks use different texture coordinate conventions:

| Framework | Origin | U Direction | V Direction |
|-----------|--------|-------------|-------------|
| CUDA | Top-left | Right | Down |
| Metal | Top-left | Right | Down |
| OpenCL | Bottom-left | Right | Up |
| DirectX | Top-left | Right | Down |

Handle coordinate conversion when porting between frameworks:

```cpp
// OpenCL to CUDA/Metal/DirectX coordinate conversion
float2 convertOpenCLToStandard(float2 uv, int height) {
    return (float2)(uv.x, 1.0f - uv.y);
}
```

### Color Space Handling

GPU effects should handle color space correctly:

```cpp
// Linear to sRGB conversion (for display)
float3 linearToSRGB(float3 linear) {
    float3 srgb;
    for (int i = 0; i < 3; i++) {
        float v = linear[i];
        if (v <= 0.0031308f) {
            srgb[i] = v * 12.92f;
        } else {
            srgb[i] = 1.055f * powf(v, 1.0f/2.4f) - 0.055f;
        }
    }
    return srgb;
}

// sRGB to Linear conversion (for processing)
float3 sRGBToLinear(float3 srgb) {
    float3 linear;
    for (int i = 0; i < 3; i++) {
        float v = srgb[i];
        if (v <= 0.04045f) {
            linear[i] = v / 12.92f;
        } else {
            linear[i] = powf((v + 0.055f) / 1.055f, 2.4f);
        }
    }
    return linear;
}
```

### Half-Float Precision

For memory-efficient GPU processing:

```cuda
// CUDA half-float support
#include <cuda_fp16.h>

__global__ void processHalfFloat(
    half4* input,
    half4* output,
    int width,
    int height)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;

    if (x < width && y < height) {
        int idx = y * width + x;
        half4 pixel = input[idx];

        // Convert to float for processing
        float4 fp = __half42float4(pixel);

        // Process...
        fp.x = 1.0f - fp.x;
        fp.y = 1.0f - fp.y;
        fp.z = 1.0f - fp.z;

        // Convert back to half
        output[idx] = __float42half4_rn(fp);
    }
}
```

### Compute Shader Variants

Metal compute shader with multiple precision options:

```metal
#include <metal_stdlib>
using namespace metal;

kernel void processEffect(
    texture2d<float, access::read> input [[texture(0)]],
    texture2d<float, access::write> output [[texture(1)]],
    constant EffectParams& params [[buffer(0)]],
    uint2 gid [[thread_position_in_grid]])
{
    if (gid.x >= input.get_width() || gid.y >= input.get_height()) {
        return;
    }

    float4 color = input.read(gid);

    // Apply effect
    if (params.invert) {
        color.rgb = 1.0 - color.rgb;
    }

    // Brightness/Contrast
    color.rgb = (color.rgb - 0.5) * params.contrast + 0.5 + params.brightness;

    // Clamp
    color.rgb = saturate(color.rgb);

    output.write(color, gid);
}
```

---

## Platform-Specific Considerations

### macOS (Apple Silicon vs Intel)

Apple Silicon Macs require universal binary support:

```bash
# Build for both architectures
xcodebuild -project MyPlugin.xcodeproj \
    -target MyPlugin \
    -arch arm64 -arch x86_64 \
    -configuration Release

# Verify universal binary
lipo -info MyPlugin.plugin/Contents/MacOS/MyPlugin
```

Metal shaders should be compiled for both architectures:

```bash
# Compile Metal shaders for universal binary
xcrun -sdk macosx metal -arch air64 -arch air64e \
    MyShader.metal -o MyShader.metallib
```

### Windows Driver Considerations

NVIDIA driver versions affect CUDA compatibility:

| CUDA Version | Minimum Driver |
|--------------|----------------|
| 12.8 | 565.90 |
| 12.0 | 525.60 |
| 11.8 | 520.61 |

Check driver version at runtime:

```cpp
bool checkNVIDIADriver() {
    int driverVersion;
    cuDriverGetVersion(&driverVersion);

    // CUDA 12.8 requires driver >= 565.90
    // Driver version is encoded as 1000 * major + 10 * minor
    int minRequired = 565 * 10 + 90;

    return (driverVersion >= minRequired);
}
```

### GPU Memory Limits

Query and respect GPU memory limits:

```cpp
void PrintGPUMemoryInfo() {
    size_t free, total;

#ifdef USE_CUDA
    cuMemGetInfo(&free, &total);
    printf("CUDA Memory: %zu MB free / %zu MB total\n",
           free / (1024*1024), total / (1024*1024));
#endif

#ifdef USE_METAL
    id<MTLDevice> device = MTLCreateSystemDefaultDevice();
    printf("Metal Memory: Recommended working set: %lu MB\n",
           device.recommendedMaxWorkingSetSize / (1024*1024));
#endif
}
```

---

## Performance Benchmarking

### Measuring GPU Performance

Implement comprehensive performance metrics:

```cpp
typedef struct PerformanceMetrics {
    double kernelTimeMs;
    double transferTimeMs;
    double totalTimeMs;
    size_t bytesProcessed;
    double throughputGBps;
} PerformanceMetrics;

PerformanceMetrics BenchmarkEffect(
    GPUContext* ctx,
    PF_GPUWorld* input,
    PF_GPUWorld* output)
{
    PerformanceMetrics metrics = {0};

    // Create timing events
    CUevent startKernel, endKernel;
    CUevent startTotal, endTotal;
    cuEventCreate(&startKernel, CU_EVENT_DEFAULT);
    cuEventCreate(&endKernel, CU_EVENT_DEFAULT);
    cuEventCreate(&startTotal, CU_EVENT_DEFAULT);
    cuEventCreate(&endTotal, CU_EVENT_DEFAULT);

    // Measure total time
    cuEventRecord(startTotal, ctx->stream);

    // Transfer + kernel execution
    cuEventRecord(startKernel, ctx->stream);
    ExecuteKernel(ctx, input, output);
    cuEventRecord(endKernel, ctx->stream);

    cuEventRecord(endTotal, ctx->stream);
    cuEventSynchronize(endTotal);

    // Calculate timings
    cuEventElapsedTime(&metrics.kernelTimeMs, startKernel, endKernel);
    cuEventElapsedTime(&metrics.totalTimeMs, startTotal, endTotal);
    metrics.transferTimeMs = metrics.totalTimeMs - metrics.kernelTimeMs;

    // Calculate throughput
    metrics.bytesProcessed = input->width * input->height * sizeof(float4) * 2;
    metrics.throughputGBps = (metrics.bytesProcessed / 1e9) /
                             (metrics.totalTimeMs / 1000.0);

    // Cleanup
    cuEventDestroy(startKernel);
    cuEventDestroy(endKernel);
    cuEventDestroy(startTotal);
    cuEventDestroy(endTotal);

    return metrics;
}
```

### Optimization Checklist

Before shipping a GPU effect, verify:

1. [ ] GPU fallback to CPU works correctly
2. [ ] Memory leaks are checked with cuda-memcheck/Instruments
3. [ ] Multiple GPU configurations tested
4. [ ] Different GPU vendors tested (NVIDIA, AMD, Intel)
5. [ ] Performance meets target (> 30fps for HD)
6. [ ] Error handling is comprehensive
7. [ ] Resource cleanup is complete
8. [ ] Thread safety verified for multi-frame rendering

---

## Appendix A: GPU Framework Feature Matrix

| Feature | CUDA | Metal | OpenCL | DirectX |
|---------|------|-------|--------|---------|
| Unified memory | Yes | Yes | Limited | No |
| Async execution | Yes | Yes | Yes | Yes |
| Multi-GPU | Yes | Yes | Yes | Yes |
| Half-float | Yes | Yes | Yes | Yes |
| Tensor cores | Yes | No | No | No |
| RT cores | Yes | No | No | Yes |
| Debug tools | Nsight | Xcode | CodeXL | PIX |

---

## Appendix B: Error Code Reference

### CUDA Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1 | CUDA_ERROR_INVALID_VALUE | Invalid argument |
| 2 | CUDA_ERROR_OUT_OF_MEMORY | Insufficient memory |
| 3 | CUDA_ERROR_NOT_INITIALIZED | Driver not initialized |
| 100 | CUDA_ERROR_NO_DEVICE | No CUDA device |
| 201 | CUDA_ERROR_INVALID_CONTEXT | Invalid context |

### Metal Error Codes

| Code | Description |
|------|-------------|
| MTLCommandBufferErrorNone | No error |
| MTLCommandBufferErrorTimeout | GPU timeout |
| MTLCommandBufferErrorPageFault | Memory access error |
| MTLCommandBufferErrorBlacklisted | Device blacklisted |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Compute Capability** | NVIDIA GPU architecture version |
| **Kernel** | GPU function executed in parallel |
| **Warp** | Group of 32 threads in CUDA |
| **Threadgroup** | Metal equivalent of CUDA block |
| **Coalescing** | Optimized memory access pattern |
| **Occupancy** | GPU utilization percentage |
| **Unified Memory** | CPU+GPU accessible memory |
| **Surface Object** | CUDA texture with write access |

---

*This document is part of the After Effects SDK Wave 2 documentation series.*
