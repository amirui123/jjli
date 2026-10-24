---
source: '[unknown - KNOWLEDGE-MAP.md]'
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
description: Visual hierarchy of SDK concepts and recommended learning paths
---
 Adobe After Effects SDK - Knowledge Map

## Concept Hierarchy

```
Adobe After Effects SDK
├── Plugin Types
│   ├── Effect Plugins (most common)
│   │   ├── Standard Effects (PF_Cmd_RENDER)
│   │   ├── SmartFX (32-bit float, PreRender/Render)
│   │   └── Audio Effects (audio-only processing)
│   ├── AEGP Plugins (automation)
│   │   ├── Menu Commands
│   │   ├── Project Manipulation
│   │   └── Scripting Extensions
│   ├── AEIO Plugins (file I/O)
│   │   ├── Import Handlers
│   │   └── Export Handlers
│   └── Artisan Plugins (3D rendering)
│       └── Custom 3D Renderers
│
├── Core Concepts
│   ├── Command Selectors (plugin lifecycle)
│   ├── Parameters (user controls)
│   ├── Function Suites (API access)
│   ├── Data Types (pixels, buffers, handles)
│   └── Error Handling
│
├── Advanced Features
│   ├── GPU Acceleration
│   │   ├── CUDA (NVIDIA)
│   │   ├── OpenCL (cross-platform)
│   │   ├── Metal (macOS)
│   │   └── DirectX (Windows)
│   ├── Multi-Frame Rendering (MFR)
│   │   ├── Thread Safety
│   │   └── Compute Cache API
│   └── Cross-Host Development
│       └── Premiere Pro Integration
│
└── Development Tools
    ├── PiPL Resources
    ├── Debugging Setup
    └── Sample Projects
```

---

## Learning Paths

### Path A: Effect Plugin Developer (Beginner)

**Goal:** Create your first video effect plugin

**Duration:** 2-4 weeks

```
Week 1: Foundations
├── 1. [[01-sdk-overview-architecture]]
│   ├── Development environment setup
│   ├── Project structure
│   └── Build system (Visual Studio / Xcode)
│
├── 2. [[02-effect-plugins]] (first half)
│   ├── Effect architecture
│   ├── Entry point function
│   └── Command selectors (GLOBAL_SETUP, PARAMS_SETUP)
│
└── 3. [[07-data-types-structures]]
    ├── PF_EffectWorld
    ├── PF_ParamDef
    └── Pixel formats

Week 2: Parameters & Rendering
├── 4. [[02-effect-plugins]] (second half)
│   ├── Parameter system deep dive
│   ├── PF_Cmd_RENDER
│   └── Basic rendering
│
├── 5. [[06-pf-suites-reference]]
│   ├── PF_Iterate suites
│   ├── PF_Sampling suites
│   └── Memory management
│
└── 6. [[08-error-handling-debugging]]
    ├── Error codes
    ├── Debugging setup
    └── Common issues

Week 3-4: Practice
└── [[06-sample-code-analysis]]
    ├── Study Skeleton sample
    ├── Study Checkout sample
    └── Build your own effect
```

### Path B: SmartFX & Modern Development (Intermediate)

**Goal:** Develop 32-bit float and GPU-accelerated effects

**Prerequisites:** Complete Path A

**Duration:** 2-3 weeks

```
Week 1: SmartFX
├── 1. [[01-smartfx-complete]]
│   ├── SmartFX architecture
│   ├── PF_Cmd_SMART_PRE_RENDER
│   ├── PF_Cmd_SMART_RENDER
│   └── 32-bit float requirements
│
└── 2. [[02-gpu-acceleration]] (concepts)
    ├── GPU framework overview
    ├── PF_OutFlag2_SUPPORTS_GPU_RENDER_F32
    └── Device setup

Week 2: Multi-Frame Rendering
├── 3. [[03-mfr-compute-cache]]
│   ├── MFR opt-in requirements
│   ├── Thread-safe sequence data
│   ├── Compute Cache API
│   └── Static analyzer tools
│
└── 4. [[02-gpu-acceleration]] (implementation)
    ├── CUDA implementation
    ├── Metal implementation
    └── OpenCL implementation

Week 3: Integration
├── 5. [[05-premiere-integration]]
│   ├── Cross-host compatibility
│   ├── Pixel format differences
│   └── Building for both hosts
│
└── 6. [[06-sample-code-analysis]]
    ├── GLator (OpenGL)
    ├── SDK_Noise (MFR)
    └── ColorGrid (custom UI)
```

### Path C: AEGP Developer (Automation)

**Goal:** Build automation plugins for project manipulation

**Duration:** 2-3 weeks

```
Week 1: AEGP Fundamentals
├── 1. [[01-sdk-overview-architecture]]
│   ├── AEGP vs Effect plugins
│   └── Hook registration
│
├── 2. [[03-aegp-plugins]]
│   ├── AEGP architecture
│   ├── Suite access pattern
│   ├── Memory management (AEGP style)
│   └── Core suites overview
│
└── 3. [[07-data-types-structures]]
    ├── AEGP handle types
    ├── Opaque pointers
    └── Reference counting

Week 2: Suite Deep Dive
├── 4. [[03-aegp-plugins]] (suites)
│   ├── AEGP_CompSuite
│   ├── AEGP_LayerSuite
│   ├── AEGP_StreamSuite
│   └── AEGP_EffectSuite
│
└── 5. [[08-error-handling-debugging]]
    ├── AEGP error handling
    └── Memory debugging

Week 3: Practice
└── [[06-sample-code-analysis]]
    ├── Easy_Cheese (menu commands)
    ├── Persisto (persistent data)
    └── Build your own AEGP
```

### Path D: AEIO Developer (File Formats)

**Goal:** Create import/export plugins for custom file formats

**Duration:** 2 weeks

```
Week 1: AEIO Architecture
├── 1. [[04-aeio-plugins]]
│   ├── AEIO_ModuleInfo
│   ├── AEIO_FunctionBlock
│   ├── Import workflow
│   └── Export workflow
│
└── 2. [[07-data-types-structures]]
    ├── Audio data structures
    └── Frame data management

Week 2: Implementation
├── 3. [[04-aeio-plugins]] (advanced)
│   ├── AEGP_IOInSuite
│   ├── AEGP_IOOutSuite
│   ├── Audio handling
│   └── Metadata support
│
└── 4. [[06-sample-code-analysis]]
    └── FBIO sample analysis
```

---

## Topic Dependencies

### Prerequisite Graph

```
                    ┌─────────────────────────┐
                    │ 01-sdk-overview         │
                    │ (START HERE)            │
                    └───────────┬─────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
   │02-effect-     │   │03-aegp-       │   │04-aeio-       │
   │plugins        │   │plugins        │   │plugins        │
   └───────┬───────┘   └───────────────┘   └───────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌─────────┐
│06-pf-   │  │07-data- │
│suites   │  │types    │
└────┬────┘  └────┬────┘
     │            │
     └──────┬─────┘
            │
            ▼
   ┌───────────────┐
   │08-error-      │
   │handling       │
   └───────────────┘
```

### SmartFX/Modern Path Dependencies

```
┌───────────────────┐
│02-effect-plugins  │ ◄── Required foundation
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│01-smartfx-        │
│complete           │
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐  ┌─────────┐
│02-gpu-  │  │03-mfr-  │
│accel    │  │cache    │
└────┬────┘  └────┬────┘
     │            │
     └──────┬─────┘
            │
            ▼
   ┌───────────────┐
   │05-premiere-   │ ◄── Optional: cross-host
   │integration    │
   └───────────────┘
```

---

## Concept Cross-Reference Matrix

|  | Overview | Effects | AEGP | AEIO | Artisan | Suites | Types | Debug | SmartFX | GPU | MFR | Audio | PPro | Samples |
|--|----------|---------|------|------|---------|--------|-------|-------|---------|-----|-----|-------|------|---------|
| **Plugin Architecture** | X | X | X | X | X | | | | | | | | | X |
| **Parameters** | | X | | | | X | X | | | | | | | X |
| **Rendering** | | X | | | X | X | X | | X | X | | | | X |
| **Memory Mgmt** | X | | X | X | | X | | X | | | X | | | |
| **Threading** | | | | | | | | X | X | | X | | | |
| **Error Handling** | | | | X | | | | X | | | | | | |
| **UI/Events** | | X | | | | X | | | | | | | | X |
| **Audio** | | X | | X | | | X | | | | | X | X | |
| **GPU** | | X | | | | | | | X | X | | | X | X |
| **Cross-Host** | | | | | | | | | | X | | X | X | |

---

## Skill Progression

### Beginner Skills
- [ ] Set up development environment
- [ ] Build and run SDK samples
- [ ] Create basic effect with sliders
- [ ] Understand command selector lifecycle
- [ ] Use PF_Iterate for pixel processing

### Intermediate Skills
- [ ] Implement SmartFX with PreRender/Render
- [ ] Handle 8/16/32-bit pixel formats
- [ ] Use sequence data correctly
- [ ] Handle flatten/unflatten for project save
- [ ] Add custom UI parameters

### Advanced Skills
- [ ] Implement GPU rendering (Metal/CUDA/OpenCL)
- [ ] Enable Multi-Frame Rendering safely
- [ ] Use Compute Cache for thread-safe data
- [ ] Build cross-host compatible plugins
- [ ] Create AEGP automation tools

### Expert Skills
- [ ] Build custom 3D renderer (Artisan)
- [ ] Create file format handler (AEIO)
- [ ] Optimize for real-time playback
- [ ] Handle all edge cases and error conditions
- [ ] Contribute to plugin ecosystem

---

## Quick Topic Lookup

| I want to... | Read... |
|--------------|---------|
| Start plugin development | [[01-sdk-overview-architecture]] |
| Create a video effect | [[02-effect-plugins]] |
| Add parameters to my effect | [[02-effect-plugins#Parameter System]] |
| Process pixels efficiently | [[06-pf-suites-reference#Iteration Suites]] |
| Support 32-bit float | [[01-smartfx-complete]] |
| Use GPU acceleration | [[02-gpu-acceleration]] |
| Make my effect multi-threaded | [[03-mfr-compute-cache]] |
| Add audio processing | [[04-audio-effects]] |
| Support Premiere Pro | [[05-premiere-integration]] |
| Create menu commands | [[03-aegp-plugins]] |
| Handle custom file formats | [[04-aeio-plugins]] |
| Build a custom 3D renderer | [[05-artisan-blithook-plugins]] |
| Debug my plugin | [[08-error-handling-debugging]] |
| Learn from examples | [[06-sample-code-analysis]] |

---

*Generated: 2025-12-27*
*Part of Adobe After Effects SDK Documentation Project*
