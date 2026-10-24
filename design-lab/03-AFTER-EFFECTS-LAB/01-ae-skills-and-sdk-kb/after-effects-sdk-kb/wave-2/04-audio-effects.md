---
source: '[unknown - 04-audio-effects.md]'
scraped: 2025-12-27
api_provider: Adobe
discovery_tier: 2
verified: false
title: Adobe After Effects SDK - Audio Effects & Processing Complete Reference
category: after-effects-sdk
---
[3-Resources/anchors/status-complete]]

# Adobe After Effects SDK - Audio Effects & Processing Complete Reference

This comprehensive reference documents the audio effect plugin development system within Adobe After Effects. Audio processing, while not the primary focus of After Effects, represents a critical component of compositing and pre-visualization workflows. This document covers the complete audio architecture, data structures, command selectors, output flags, and implementation patterns necessary for building professional audio effect plugins.

---

## Table of Contents

1. [Audio Effects Architecture Overview](#audio-effects-architecture-overview)
2. [Audio Capabilities and Specifications](#audio-capabilities-and-specifications)
3. [Audio Command Selectors](#audio-command-selectors)
4. [Audio Data Structures](#audio-data-structures)
5. [Audio Output Flags](#audio-output-flags)
6. [Audio Processing Pipeline](#audio-processing-pipeline)
7. [Sample Rate and Timing](#sample-rate-and-timing)
8. [Bit Depth and Sample Size Support](#bit-depth-and-sample-size-support)
9. [Channel Configuration](#channel-configuration)
10. [Audio-Visual Synchronization](#audio-visual-synchronization)
11. [AEGP Sound Data Suites](#aegp-sound-data-suites)
12. [Audio Parameters and Float Sliders](#audio-parameters-and-float-sliders)
13. [Audio Effect Implementation Patterns](#audio-effect-implementation-patterns)
14. [Sample Code Analysis](#sample-code-analysis)
15. [Cross-Application Compatibility](#cross-application-compatibility)
16. [Performance Considerations](#performance-considerations)
17. [Debugging Audio Effects](#debugging-audio-effects)

---

## Audio Effects Architecture Overview

### Conceptual Foundation

Audio effects in After Effects operate within the same plugin framework as video effects but follow specialized processing paths. The architecture supports three primary audio plugin configurations:

1. **Audio-Only Effects** (`PF_OutFlag_AUDIO_EFFECT_ONLY`) - Plugins that exclusively process audio without any video processing
2. **Audio+Video Effects** (`PF_OutFlag_AUDIO_EFFECT_TOO`) - Plugins that process both audio and video streams
3. **Audio-Reactive Video Effects** (`PF_OutFlag_I_USE_AUDIO`) - Video effects that respond to audio analysis

### Plugin Type Hierarchy

```
Effect Plugin
├── Video-Only Effect (default)
├── Audio-Only Effect (AUDIO_EFFECT_ONLY)
├── Combined Audio+Video Effect (AUDIO_EFFECT_TOO)
└── Audio-Reactive Video Effect (I_USE_AUDIO)
```

### Processing Model

Audio effects follow a setup-render-teardown pattern similar to video frame rendering but operate on sample buffers rather than pixel buffers:

```
PF_Cmd_AUDIO_SETUP → PF_Cmd_AUDIO_RENDER → PF_Cmd_AUDIO_SETDOWN
```

This mirrors the video rendering sequence:
```
PF_Cmd_FRAME_SETUP → PF_Cmd_RENDER → PF_Cmd_FRAME_SETDOWN
```

---

## Audio Capabilities and Specifications

### Supported Audio Formats

After Effects provides comprehensive audio processing capabilities:

| Specification | Supported Range |
|---------------|-----------------|
| **Sample Rate** | Up to 96 kHz |
| **Bit Depth** | 8-bit, 16-bit, 24-bit (floating point), 32-bit float |
| **Channels** | Mono, Stereo |
| **Encoding** | Unsigned PCM, Signed PCM, Floating Point |
| **Resampling** | High-quality internal resampling |

### Audio Quality Pipeline

After Effects maintains high-quality audio throughout the compositing pipeline:

- **Internal Processing**: Floating-point representation for maximum precision
- **Resampling**: Professional-grade sample rate conversion
- **Dithering**: Applied during format conversion as needed
- **Headroom**: Floating-point processing prevents clipping during intermediate stages

---

## Audio Command Selectors

Audio command selectors govern the lifecycle of audio processing within an effect plugin. These selectors are sent in sequence for each audio render operation.

### PF_Cmd_AUDIO_SETUP

**Purpose**: Initialize audio processing and request required audio input

**When Called**: Before every audio render operation

**Responsibilities**:
- Allocate any memory or resources needed for audio processing
- Request a specific time span of input audio
- Specify alternate input time ranges if needed

**Key Actions**:
```c
case PF_Cmd_AUDIO_SETUP:
    // Allocate audio processing buffers
    // Request audio from a different time range if needed
    // Update startsampL and endsampL in out_data if requesting different audio
    out_data->startsampL = custom_start_sample;
    out_data->endsampL = custom_end_sample;
    break;
```

**Field Modifications**:
- `out_data->startsampL` - Start sample for requested audio input
- `out_data->endsampL` - End sample for requested audio input

If the effect requires audio from a different time range than the output (e.g., for reverb tails, lookahead processing, or time-stretching), update these fields accordingly.

### PF_Cmd_AUDIO_RENDER

**Purpose**: Process audio samples and produce output

**When Called**: After successful `PF_Cmd_AUDIO_SETUP`

**Responsibilities**:
- Access input audio from `in_data->src_snd`
- Process audio samples according to effect parameters
- Write processed audio to `out_data->dest_snd`

**Available Data**:
- All `PF_InData` fields are populated
- Input audio samples via `src_snd`
- Current parameter values

**Interruption Handling**:
- Check `PF_ABORT()` macro for user cancellation
- Check `PF_PROGRESS()` return value for errors
- If interrupted, rendered audio will not be used

**Implementation Pattern**:
```c
case PF_Cmd_AUDIO_RENDER:
    // Access input audio
    PF_SoundWorld *input_audio = in_data->src_snd;

    // Get audio format information
    A_FpLong sample_rate = input_audio->fi.rateF;
    A_long num_samples = input_audio->num_samples;
    PF_SoundChannels channels = input_audio->fi.num_channels;

    // Process each sample
    for (A_long i = 0; i < num_samples; i++) {
        // Apply effect processing
        // Check for interruption periodically
        if (i % 1000 == 0) {
            err = PF_PROGRESS(in_data, i, num_samples);
            if (err) break;
        }
    }

    // Write to output
    // out_data->dest_snd is populated with processed audio
    break;
```

### PF_Cmd_AUDIO_SETDOWN

**Purpose**: Clean up audio processing resources

**When Called**: After audio rendering completes (success or failure)

**Responsibilities**:
- Free memory allocated during `PF_Cmd_AUDIO_SETUP`
- Release any audio-specific handles or resources
- Reset state for next audio render cycle

**Implementation Pattern**:
```c
case PF_Cmd_AUDIO_SETDOWN:
    // Free allocated audio buffers
    if (audio_sequence_data->temp_buffer) {
        PF_DISPOSE_HANDLE(audio_sequence_data->temp_buffer);
        audio_sequence_data->temp_buffer = NULL;
    }
    break;
```

---

## Audio Data Structures

### PF_SoundFormat

Enumeration specifying the audio encoding type:

```c
typedef enum {
    PF_UNSIGNED_PCM = 0,    // Unsigned pulse code modulation
    PF_SIGNED_PCM   = 1,    // Signed pulse code modulation
    PF_SIGNED_FLOAT = 2     // Floating point format
} PF_SoundFormat;
```

| Format | Description | Use Case |
|--------|-------------|----------|
| `PF_UNSIGNED_PCM` | Unsigned integer samples | 8-bit audio, legacy formats |
| `PF_SIGNED_PCM` | Signed integer samples | 16-bit audio, standard PCM |
| `PF_SIGNED_FLOAT` | IEEE floating-point samples | 32-bit float, HDR audio |

### PF_SoundSampleSize

Enumeration defining sample resolution in bytes:

```c
typedef enum {
    PF_SSS_1 = 1,    // 1 byte per sample (8-bit)
    PF_SSS_2 = 2,    // 2 bytes per sample (16-bit)
    PF_SSS_4 = 4     // 4 bytes per sample (32-bit)
} PF_SoundSampleSize;
```

| Size | Bit Depth | Dynamic Range |
|------|-----------|---------------|
| `PF_SSS_1` | 8-bit | ~48 dB |
| `PF_SSS_2` | 16-bit | ~96 dB |
| `PF_SSS_4` | 32-bit (float) | ~144 dB+ (floating) |

### PF_SoundChannels

Enumeration indicating channel configuration:

```c
typedef enum {
    PF_Channels_MONO   = 1,    // Single channel (mono)
    PF_Channels_STEREO = 2     // Two channels (stereo)
} PF_SoundChannels;
```

### PF_SoundFormatInfo

Structure containing comprehensive audio format metadata:

```c
typedef struct {
    PF_FpLong           rateF;          // Sample rate in Hz (e.g., 44100.0, 48000.0)
    PF_SoundChannels    num_channels;   // Mono or stereo
    PF_SoundFormat      format;         // Encoding type (PCM/float)
    PF_SoundSampleSize  sample_size;    // Bytes per sample
} PF_SoundFormatInfo;
```

**Usage Example**:
```c
// Query format information
PF_SoundFormatInfo *format = &sound_world->fi;

A_FpLong sample_rate = format->rateF;           // 48000.0
int bytes_per_sample = format->sample_size;      // 4 for 32-bit
int num_channels = format->num_channels;         // 2 for stereo
int is_float = (format->format == PF_SIGNED_FLOAT);
```

### PF_SoundWorld

The primary container structure for audio data:

```c
typedef struct {
    PF_SoundFormatInfo  fi;             // Format information structure
    A_long              num_samples;    // Total sample count
    void                *dataP;         // Pointer to raw audio data
} PF_SoundWorld;
```

**Memory Layout**:
- For stereo audio: samples are interleaved (L, R, L, R, ...)
- Total buffer size: `num_samples * fi.num_channels * fi.sample_size`

**Accessing Audio Data**:
```c
PF_SoundWorld *snd = in_data->src_snd;

// Calculate buffer size
size_t buffer_size = snd->num_samples *
                     snd->fi.num_channels *
                     snd->fi.sample_size;

// Access samples based on format
if (snd->fi.format == PF_SIGNED_FLOAT && snd->fi.sample_size == PF_SSS_4) {
    // 32-bit float processing
    float *samples = (float *)snd->dataP;

    for (A_long i = 0; i < snd->num_samples; i++) {
        if (snd->fi.num_channels == PF_Channels_STEREO) {
            float left = samples[i * 2];
            float right = samples[i * 2 + 1];
            // Process stereo samples
        } else {
            float mono = samples[i];
            // Process mono sample
        }
    }
}
```

### AEGP_SoundWorld

The AEGP equivalent for audio data access in general plugins:

```c
// AEGP_SoundWorld is accessed via AEGP_SoundDataH handle
typedef struct {
    // Similar structure to PF_SoundWorld
    // Accessed through AEGP_SoundDataSuite functions
} AEGP_SoundWorld;
```

AEGP plugins access audio through the `AEGP_SoundDataSuite` rather than directly through effect callbacks.

---

## Audio Output Flags

Audio output flags are set during `PF_Cmd_GLOBAL_SETUP` to declare audio capabilities to After Effects.

### PF_OutFlag_AUDIO_EFFECT_TOO

**Purpose**: Declares that the effect processes audio in addition to video

**Declaration Context**: `PF_Cmd_GLOBAL_SETUP`

**Behavior**:
- Effect will receive both video and audio command selectors
- Audio processing occurs independently of video processing
- Both `PF_Cmd_RENDER` and `PF_Cmd_AUDIO_RENDER` will be called

**Usage**:
```c
case PF_Cmd_GLOBAL_SETUP:
    out_data->out_flags |= PF_OutFlag_AUDIO_EFFECT_TOO;
    break;
```

### PF_OutFlag_AUDIO_EFFECT_ONLY

**Purpose**: Declares that the effect processes only audio (no video)

**Declaration Context**: `PF_Cmd_GLOBAL_SETUP`

**Behavior**:
- Effect appears in audio-only context menus
- Will not receive video rendering commands
- Only audio command selectors are sent

**Usage**:
```c
case PF_Cmd_GLOBAL_SETUP:
    out_data->out_flags |= PF_OutFlag_AUDIO_EFFECT_ONLY;
    break;
```

### PF_OutFlag_AUDIO_FLOAT_ONLY

**Purpose**: Requests that After Effects provide audio in floating-point format only

**Declaration Context**: `PF_Cmd_GLOBAL_SETUP`

**Behavior**:
- After Effects performs automatic format conversion if source is PCM
- Input audio guaranteed to be `PF_SIGNED_FLOAT` format
- Simplifies effect processing by ensuring consistent input format

**Requirements**:
- Must also set either `PF_OutFlag_AUDIO_EFFECT_TOO` or `PF_OutFlag_AUDIO_EFFECT_ONLY`

**Usage**:
```c
case PF_Cmd_GLOBAL_SETUP:
    out_data->out_flags |= PF_OutFlag_AUDIO_EFFECT_ONLY |
                           PF_OutFlag_AUDIO_FLOAT_ONLY;
    break;
```

### PF_OutFlag_AUDIO_IIR

**Purpose**: Declares the effect as an Infinite Impulse Response filter

**Declaration Context**: `PF_Cmd_GLOBAL_SETUP`

**Behavior**:
- Output at a given time depends on output from previous times
- Allows requesting audio from earlier times during setup
- Permits caching interim data in sequence_data

**Use Cases**:
- Reverb effects
- Delay effects
- Feedback filters
- Any effect with temporal state dependencies

**Usage**:
```c
case PF_Cmd_GLOBAL_SETUP:
    out_data->out_flags |= PF_OutFlag_AUDIO_EFFECT_ONLY |
                           PF_OutFlag_AUDIO_IIR;
    break;
```

### PF_OutFlag_I_SYNTHESIZE_AUDIO

**Purpose**: Declares that the effect generates audio even when passed silence

**Declaration Context**: `PF_Cmd_GLOBAL_SETUP`

**Behavior**:
- Effect will be called for audio rendering even with no input audio
- Useful for audio generators, oscillators, and synthesizers
- After Effects provides silent input buffer for effect to fill

**Requirements**:
- Must also set either `PF_OutFlag_AUDIO_EFFECT_TOO` or `PF_OutFlag_AUDIO_EFFECT_ONLY`

**Use Cases**:
- Tone generators
- Synthesizers
- Audio signal generators
- Test tone effects

**Usage**:
```c
case PF_Cmd_GLOBAL_SETUP:
    out_data->out_flags |= PF_OutFlag_AUDIO_EFFECT_ONLY |
                           PF_OutFlag_I_SYNTHESIZE_AUDIO;
    break;
```

### PF_OutFlag_I_USE_AUDIO

**Purpose**: Declares that the effect's video parameters depend on audio analysis

**Declaration Context**: `PF_Cmd_GLOBAL_SETUP`

**Behavior**:
- Effect can access audio via `PF_CHECKOUT_LAYER_AUDIO`
- Audio data available during video rendering
- Enables audio-reactive visual effects

**Important Limitation**:
- **Premiere Pro does not support this flag** - plugins declaring `PF_OutFlag_I_USE_AUDIO` will not load in Premiere Pro

**Usage**:
```c
case PF_Cmd_GLOBAL_SETUP:
    out_data->out_flags |= PF_OutFlag_I_USE_AUDIO;
    break;
```

### Flag Combinations

Common flag combinations for different effect types:

| Effect Type | Flag Combination |
|-------------|-----------------|
| Audio-only with float processing | `AUDIO_EFFECT_ONLY \| AUDIO_FLOAT_ONLY` |
| Audio synthesizer | `AUDIO_EFFECT_ONLY \| I_SYNTHESIZE_AUDIO` |
| Reverb/Delay effect | `AUDIO_EFFECT_ONLY \| AUDIO_IIR` |
| Audio+Video effect | `AUDIO_EFFECT_TOO \| AUDIO_FLOAT_ONLY` |
| Audio-reactive video | `I_USE_AUDIO` |

---

## Audio Processing Pipeline

### Overall Flow

The audio processing pipeline in After Effects follows a predictable sequence:

```
1. User applies audio effect to layer
2. After Effects calls PF_Cmd_GLOBAL_SETUP (plugin declares audio capabilities)
3. When audio preview/render is requested:
   a. PF_Cmd_AUDIO_SETUP called (plugin requests input audio range)
   b. After Effects provides input audio
   c. PF_Cmd_AUDIO_RENDER called (plugin processes audio)
   d. PF_Cmd_AUDIO_SETDOWN called (plugin cleans up)
4. Process repeats for each audio segment
```

### Input Audio Access

Audio input is provided through `PF_InData` fields:

| Field | Type | Description |
|-------|------|-------------|
| `src_snd` | `PF_SoundWorld*` | Pointer to input sound data |
| `start_sampL` | `A_long` | Starting sample number (relative to layer start) |
| `dur_sampL` | `A_long` | Duration of audio in samples |
| `total_sampL` | `A_long` | Total samples in the audio layer |

### Output Audio Destination

Processed audio is written to `out_data->dest_snd`:

```c
// Access output buffer
PF_SoundWorld *output = out_data->dest_snd;

// Write processed samples
float *out_samples = (float *)output->dataP;
for (A_long i = 0; i < output->num_samples; i++) {
    out_samples[i * 2] = processed_left;      // Left channel
    out_samples[i * 2 + 1] = processed_right; // Right channel
}
```

### Block-Based Processing

Audio is typically processed in blocks rather than as a complete stream:

```c
// Block size is determined by dur_sampL
A_long block_size = in_data->dur_sampL;
A_long offset = in_data->start_sampL;

// Process this block
for (A_long i = 0; i < block_size; i++) {
    A_long absolute_sample = offset + i;
    // Process sample at absolute position
}
```

---

## Sample Rate and Timing

### Sample Rate Handling

After Effects handles sample rate conversion internally:

```c
// Get current sample rate
A_FpLong sample_rate = in_data->src_snd->fi.rateF;

// Common sample rates:
// 44100.0  - CD quality
// 48000.0  - Professional video
// 96000.0  - High-resolution audio
```

### Time-to-Sample Conversion

Converting between time values and sample positions:

```c
// Convert time (seconds) to samples
A_long time_to_samples(A_FpLong time_seconds, A_FpLong sample_rate) {
    return (A_long)(time_seconds * sample_rate);
}

// Convert samples to time (seconds)
A_FpLong samples_to_time(A_long samples, A_FpLong sample_rate) {
    return (A_FpLong)samples / sample_rate;
}

// Using After Effects time values
A_Time ae_time = in_data->current_time;
A_FpLong time_seconds = (A_FpLong)ae_time.value / (A_FpLong)ae_time.scale;
```

### Sample Position Tracking

For effects that need temporal awareness:

```c
// Track absolute position in audio stream
typedef struct {
    A_long last_sample_pos;     // Last processed sample position
    A_long samples_processed;   // Total samples processed in session
} AudioState;

// During AUDIO_RENDER
A_long current_pos = in_data->start_sampL;
A_long block_end = current_pos + in_data->dur_sampL;
```

---

## Bit Depth and Sample Size Support

### 8-Bit Audio (PF_SSS_1)

Processing 8-bit unsigned PCM audio:

```c
if (snd->fi.sample_size == PF_SSS_1 &&
    snd->fi.format == PF_UNSIGNED_PCM) {

    unsigned char *samples = (unsigned char *)snd->dataP;

    for (A_long i = 0; i < snd->num_samples; i++) {
        // 8-bit unsigned: 0-255, center at 128
        unsigned char sample = samples[i];

        // Convert to normalized float (-1.0 to 1.0)
        float normalized = ((float)sample - 128.0f) / 128.0f;

        // Process...

        // Convert back
        samples[i] = (unsigned char)((normalized * 128.0f) + 128.0f);
    }
}
```

### 16-Bit Audio (PF_SSS_2)

Processing 16-bit signed PCM audio:

```c
if (snd->fi.sample_size == PF_SSS_2 &&
    snd->fi.format == PF_SIGNED_PCM) {

    short *samples = (short *)snd->dataP;

    for (A_long i = 0; i < snd->num_samples; i++) {
        // 16-bit signed: -32768 to 32767
        short sample = samples[i];

        // Convert to normalized float
        float normalized = (float)sample / 32768.0f;

        // Process...

        // Convert back with clamping
        float processed = /* processed value */;
        processed = fmaxf(-1.0f, fminf(1.0f, processed));
        samples[i] = (short)(processed * 32767.0f);
    }
}
```

### 32-Bit Float Audio (PF_SSS_4)

Processing 32-bit floating-point audio (recommended):

```c
if (snd->fi.sample_size == PF_SSS_4 &&
    snd->fi.format == PF_SIGNED_FLOAT) {

    float *samples = (float *)snd->dataP;

    for (A_long i = 0; i < snd->num_samples; i++) {
        // Float samples: typically -1.0 to 1.0 but can exceed
        float sample = samples[i];

        // Process directly - no conversion needed
        float processed = sample * gain;

        // Write back (can exceed -1.0 to 1.0 for HDR audio)
        samples[i] = processed;
    }
}
```

### Universal Sample Access

Helper function for format-independent sample access:

```c
float get_sample(PF_SoundWorld *snd, A_long index) {
    switch (snd->fi.sample_size) {
        case PF_SSS_1: {
            unsigned char *data = (unsigned char *)snd->dataP;
            return ((float)data[index] - 128.0f) / 128.0f;
        }
        case PF_SSS_2: {
            short *data = (short *)snd->dataP;
            return (float)data[index] / 32768.0f;
        }
        case PF_SSS_4: {
            float *data = (float *)snd->dataP;
            return data[index];
        }
    }
    return 0.0f;
}

void set_sample(PF_SoundWorld *snd, A_long index, float value) {
    switch (snd->fi.sample_size) {
        case PF_SSS_1: {
            unsigned char *data = (unsigned char *)snd->dataP;
            value = fmaxf(-1.0f, fminf(1.0f, value));
            data[index] = (unsigned char)((value * 128.0f) + 128.0f);
            break;
        }
        case PF_SSS_2: {
            short *data = (short *)snd->dataP;
            value = fmaxf(-1.0f, fminf(1.0f, value));
            data[index] = (short)(value * 32767.0f);
            break;
        }
        case PF_SSS_4: {
            float *data = (float *)snd->dataP;
            data[index] = value;
            break;
        }
    }
}
```

---

## Channel Configuration

### Mono Processing

Processing single-channel audio:

```c
if (snd->fi.num_channels == PF_Channels_MONO) {
    float *samples = (float *)snd->dataP;

    for (A_long i = 0; i < snd->num_samples; i++) {
        float mono = samples[i];
        // Process mono sample
        samples[i] = mono * gain;
    }
}
```

### Stereo Processing

Processing interleaved stereo audio:

```c
if (snd->fi.num_channels == PF_Channels_STEREO) {
    float *samples = (float *)snd->dataP;

    for (A_long i = 0; i < snd->num_samples; i++) {
        float left = samples[i * 2];
        float right = samples[i * 2 + 1];

        // Stereo processing
        float new_left = left * left_gain;
        float new_right = right * right_gain;

        samples[i * 2] = new_left;
        samples[i * 2 + 1] = new_right;
    }
}
```

### Stereo-to-Mono Conversion

Converting stereo to mono for analysis:

```c
float stereo_to_mono(float left, float right) {
    // Simple average
    return (left + right) * 0.5f;
}

// Or with level preservation
float stereo_to_mono_preserve(float left, float right) {
    // -3dB per channel to maintain perceived loudness
    return (left + right) * 0.707107f;  // sqrt(0.5)
}
```

### Mono-to-Stereo Expansion

Converting mono to stereo output:

```c
void mono_to_stereo(float mono, float *left, float *right) {
    // Simple duplication
    *left = mono;
    *right = mono;
}

// With width control
void mono_to_stereo_width(float mono, float width,
                          float *left, float *right) {
    float mid = mono;
    float side = mono * width;  // Width from 0 (mono) to 1 (full stereo)
    *left = mid + side;
    *right = mid - side;
}
```

### Channel Swapping

Swapping left and right channels (as in SDK Backwards sample):

```c
void swap_channels(float *samples, A_long num_samples) {
    for (A_long i = 0; i < num_samples; i++) {
        float temp = samples[i * 2];
        samples[i * 2] = samples[i * 2 + 1];
        samples[i * 2 + 1] = temp;
    }
}
```

---

## Audio-Visual Synchronization

### Accessing Audio from Video Effects

For video effects that need audio data (`PF_OutFlag_I_USE_AUDIO`):

```c
// Request audio checkout
PF_SoundWorld *audio = NULL;
A_long start_sample = time_to_sample(current_time, sample_rate);
A_long num_samples = duration_in_samples;

err = PF_CHECKOUT_LAYER_AUDIO(in_data,
                              layer_index,
                              start_sample,
                              num_samples,
                              &audio);

if (!err && audio) {
    // Analyze audio for visual effect
    float rms = calculate_rms(audio);
    float peak = find_peak(audio);

    // Use audio values to modulate visual parameters
    effect_intensity = map_audio_to_intensity(rms);

    // Check audio back in
    PF_CHECKIN_LAYER_AUDIO(in_data, audio);
}
```

### Time Alignment

Ensuring audio and video are aligned:

```c
// Convert AE time to sample position
A_Time current_time = in_data->current_time;
A_FpLong time_seconds = (A_FpLong)current_time.value /
                        (A_FpLong)current_time.scale;

A_FpLong sample_rate = 48000.0;  // Or from format info
A_long sample_position = (A_long)(time_seconds * sample_rate);
```

### Frame-Rate Considerations

Audio samples per video frame calculation:

```c
// Given frame rate and sample rate
A_FpLong frame_rate = 29.97;
A_FpLong sample_rate = 48000.0;

// Samples per frame (not necessarily integer!)
A_FpLong samples_per_frame = sample_rate / frame_rate;

// Handle fractional samples
A_long samples_this_frame = (A_long)samples_per_frame;
A_FpLong fractional_accumulator += (samples_per_frame - samples_this_frame);
if (fractional_accumulator >= 1.0) {
    samples_this_frame++;
    fractional_accumulator -= 1.0;
}
```

---

## AEGP Sound Data Suites

For AEGP (After Effects General Plugin) development, audio access is provided through dedicated suites.

### AEGP_SoundDataSuite1

Primary suite for audio data manipulation:

| Function | Description |
|----------|-------------|
| `AEGP_NewSoundData` | Create new sound data structure |
| `AEGP_DisposeSoundData` | Free sound data memory |
| `AEGP_GetSoundDataFormat` | Query format information |
| `AEGP_LockSoundDataSamples` | Lock samples for access |
| `AEGP_UnlockSoundDataSamples` | Release sample lock |
| `AEGP_GetNumSamples` | Get sample count |

### AEGP_SoundDataFormat

Format specification structure for AEGP:

```c
typedef struct {
    A_FpLong        sample_rateF;   // Sample rate in Hz
    AEGP_SoundEncoding encoding;    // Encoding type
    A_long          bytes_per_sample; // 1, 2, or 4
    A_long          num_channels;   // 1 (mono) or 2 (stereo)
} AEGP_SoundDataFormat;
```

### AEGP_SoundEncoding

```c
typedef enum {
    AEGP_SoundEncoding_UNSIGNED_PCM,
    AEGP_SoundEncoding_SIGNED_PCM,
    AEGP_SoundEncoding_FLOAT
} AEGP_SoundEncoding;
```

### AEGP_RenderSuite4 Audio Functions

| Function | Description |
|----------|-------------|
| `AEGP_RenderNewItemSoundData` | Render audio from item at specific time/duration |

```c
// Render audio from composition
AEGP_SoundDataH sound_data;
err = suites.RenderSuite4()->AEGP_RenderNewItemSoundData(
    item,
    start_time,
    duration,
    &sound_format,
    &sound_data
);

// Access rendered audio
AEGP_SoundDataFormat format;
suites.SoundDataSuite1()->AEGP_GetSoundDataFormat(sound_data, &format);

void *samples;
suites.SoundDataSuite1()->AEGP_LockSoundDataSamples(sound_data, &samples);

// Process audio...

suites.SoundDataSuite1()->AEGP_UnlockSoundDataSamples(sound_data);
suites.SoundDataSuite1()->AEGP_DisposeSoundData(sound_data);
```

### AEGP_OutputModuleSuite4 Audio Settings

| Function | Description |
|----------|-------------|
| `AEGP_GetSoundFormatInfo` | Get output module audio settings |
| `AEGP_SetSoundFormatInfo` | Set output module audio settings |

---

## Audio Parameters and Float Sliders

### PF_Param_FLOAT_SLIDER for Audio

Float sliders are specifically designed for audio effects, containing additional fields for audio processing:

```c
// Float slider fields relevant to audio
typedef struct {
    PF_FpLong   value;              // Current value
    PF_FpLong   phase;              // Phase value (0.0 - 1.0)
    A_short     precision;          // Decimal precision
    A_short     curve_tolerance;    // Curve smoothing
} PF_FloatSliderDef;
```

### Audio-Specific Float Slider Registration

```c
// Register a frequency parameter
PF_ParamDef def;
AEFX_CLR_STRUCT(def);

def.param_type = PF_Param_FLOAT_SLIDER;
def.name = "Frequency";
def.u.fd.value = 440.0;      // A4 = 440 Hz
def.u.fd.phase = 0.0;        // Starting phase
def.u.fd.valid_min = 20.0;   // 20 Hz minimum
def.u.fd.valid_max = 20000.0; // 20 kHz maximum
def.u.fd.slider_min = 20.0;
def.u.fd.slider_max = 2000.0; // Logarithmic might be better
def.u.fd.precision = 1;      // One decimal place

err = PF_ADD_PARAM(in_data, -1, &def);
```

### Phase Parameter for Oscillators

The phase field is particularly useful for audio synthesis:

```c
// Using phase for continuous waveform generation
typedef struct {
    PF_FpLong current_phase;
} OscillatorState;

float generate_sine(OscillatorState *state, PF_FpLong frequency,
                    PF_FpLong sample_rate) {
    float sample = sinf(state->current_phase * 2.0f * PI);

    state->current_phase += frequency / sample_rate;
    while (state->current_phase >= 1.0) {
        state->current_phase -= 1.0;
    }

    return sample;
}
```

---

## Audio Effect Implementation Patterns

### Basic Audio Effect Template

Complete template for a simple audio effect:

```c
static PF_Err
main(
    PF_Cmd          cmd,
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[],
    PF_LayerDef     *output,
    void            *extra)
{
    PF_Err err = PF_Err_NONE;

    switch (cmd) {
        case PF_Cmd_GLOBAL_SETUP:
            out_data->my_version = PF_VERSION(1, 0, 0, 0);
            out_data->out_flags = PF_OutFlag_AUDIO_EFFECT_ONLY |
                                  PF_OutFlag_AUDIO_FLOAT_ONLY;
            break;

        case PF_Cmd_PARAMS_SETUP:
            err = SetupParams(in_data, out_data);
            break;

        case PF_Cmd_AUDIO_SETUP:
            // Request input audio (use default range)
            break;

        case PF_Cmd_AUDIO_RENDER:
            err = ProcessAudio(in_data, out_data, params);
            break;

        case PF_Cmd_AUDIO_SETDOWN:
            // Cleanup if needed
            break;
    }

    return err;
}

static PF_Err
ProcessAudio(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[])
{
    PF_Err err = PF_Err_NONE;

    PF_SoundWorld *input = in_data->src_snd;
    PF_SoundWorld *output = out_data->dest_snd;

    float *in_samples = (float *)input->dataP;
    float *out_samples = (float *)output->dataP;

    A_long num_samples = input->num_samples;
    A_long num_channels = input->fi.num_channels;

    // Get parameter
    PF_FpLong gain = params[GAIN_PARAM]->u.fd.value;

    // Process
    for (A_long i = 0; i < num_samples * num_channels; i++) {
        out_samples[i] = in_samples[i] * gain;
    }

    return err;
}
```

### IIR Filter Pattern (Reverb/Delay)

Pattern for effects with temporal dependencies:

```c
typedef struct {
    float *delay_buffer;
    A_long buffer_size;
    A_long write_index;
} DelayState;

static PF_Err
AudioSetup(PF_InData *in_data, PF_OutData *out_data) {
    // Request additional samples for delay
    A_long delay_samples = (A_long)(delay_time * in_data->src_snd->fi.rateF);
    out_data->startsampL = in_data->start_sampL - delay_samples;

    // Allocate delay buffer in sequence_data
    DelayState *state = (DelayState *)PF_LOCK_HANDLE(
        in_data->sequence_data);

    if (!state->delay_buffer) {
        state->buffer_size = delay_samples * 2;  // Stereo
        state->delay_buffer = (float *)malloc(
            state->buffer_size * sizeof(float));
        memset(state->delay_buffer, 0,
               state->buffer_size * sizeof(float));
    }

    PF_UNLOCK_HANDLE(in_data->sequence_data);
    return PF_Err_NONE;
}

static PF_Err
ProcessDelay(PF_InData *in_data, PF_OutData *out_data) {
    DelayState *state = (DelayState *)PF_LOCK_HANDLE(
        in_data->sequence_data);

    float *input = (float *)in_data->src_snd->dataP;
    float *output = (float *)out_data->dest_snd->dataP;

    A_long num_samples = in_data->src_snd->num_samples;

    for (A_long i = 0; i < num_samples * 2; i++) {
        // Read from delay buffer
        A_long read_index = (state->write_index - delay_samples * 2 +
                            state->buffer_size) % state->buffer_size;
        float delayed = state->delay_buffer[read_index + i % 2];

        // Mix dry and wet
        output[i] = input[i] * dry_mix + delayed * wet_mix;

        // Write to delay buffer with feedback
        state->delay_buffer[state->write_index + i % 2] =
            input[i] + delayed * feedback;
    }

    state->write_index = (state->write_index + num_samples * 2) %
                         state->buffer_size;

    PF_UNLOCK_HANDLE(in_data->sequence_data);
    return PF_Err_NONE;
}
```

### Audio Synthesizer Pattern

Pattern for effects that generate audio:

```c
typedef struct {
    PF_FpLong phase;
    PF_FpLong frequency;
} SynthState;

static PF_Err
SynthRender(PF_InData *in_data, PF_OutData *out_data,
            PF_ParamDef *params[]) {

    SynthState *state = (SynthState *)PF_LOCK_HANDLE(
        in_data->sequence_data);

    float *output = (float *)out_data->dest_snd->dataP;
    A_FpLong sample_rate = in_data->src_snd->fi.rateF;
    A_long num_samples = in_data->src_snd->num_samples;

    PF_FpLong frequency = params[FREQ_PARAM]->u.fd.value;
    PF_FpLong amplitude = params[AMP_PARAM]->u.fd.value;

    for (A_long i = 0; i < num_samples; i++) {
        // Generate sine wave
        float sample = sinf(state->phase * 2.0f * PI) * amplitude;

        // Write to both channels
        output[i * 2] = sample;      // Left
        output[i * 2 + 1] = sample;  // Right

        // Advance phase
        state->phase += frequency / sample_rate;
        if (state->phase >= 1.0) {
            state->phase -= 1.0;
        }
    }

    PF_UNLOCK_HANDLE(in_data->sequence_data);
    return PF_Err_NONE;
}
```

---

## Sample Code Analysis

### SDK Backwards Sample

The SDK includes a sample project called "SDK Backwards" that demonstrates audio processing:

**Features**:
- Reverses audio playback (plays from last frame to first)
- Mixes reversed audio with a keyframe-able sine wave
- Includes channel swap functionality
- Compatible with Premiere Pro

**Key Implementation Points**:

```c
// Audio reversal algorithm concept
void reverse_audio(float *samples, A_long num_samples, int channels) {
    A_long total_samples = num_samples * channels;
    A_long half = total_samples / 2;

    for (A_long i = 0; i < half; i += channels) {
        // Swap sample pairs
        for (int c = 0; c < channels; c++) {
            float temp = samples[i + c];
            samples[i + c] = samples[total_samples - channels - i + c];
            samples[total_samples - channels - i + c] = temp;
        }
    }
}

// Sine wave mixing
void mix_sine_wave(float *samples, A_long num_samples,
                   float frequency, float amplitude,
                   float sample_rate, float *phase) {
    for (A_long i = 0; i < num_samples; i++) {
        float sine = sinf(*phase * 2.0f * PI) * amplitude;

        samples[i * 2] += sine;      // Add to left
        samples[i * 2 + 1] += sine;  // Add to right

        *phase += frequency / sample_rate;
        while (*phase >= 1.0f) *phase -= 1.0f;
    }
}
```

---

## Cross-Application Compatibility

### Premiere Pro Considerations

| Feature | After Effects | Premiere Pro |
|---------|---------------|--------------|
| `PF_OutFlag_I_USE_AUDIO` | Supported | **Not Supported** (plugin won't load) |
| `PF_OutFlag_AUDIO_EFFECT_TOO` | Supported | Supported |
| `PF_OutFlag_AUDIO_EFFECT_ONLY` | Supported | Supported |
| `PF_OutFlag_AUDIO_FLOAT_ONLY` | Supported | Supported |
| `PF_OutFlag_AUDIO_IIR` | Supported | Supported |

### Building Cross-Compatible Plugins

```c
// Conditional compilation for app-specific features
#ifdef SUPPORTS_PREMIERE
    // Avoid I_USE_AUDIO for Premiere compatibility
    out_data->out_flags = PF_OutFlag_AUDIO_EFFECT_ONLY;
#else
    // Full feature set for After Effects only
    out_data->out_flags = PF_OutFlag_AUDIO_EFFECT_TOO |
                          PF_OutFlag_I_USE_AUDIO;
#endif
```

### AEIO Audio Integration

For import/export plugins handling audio:

| Flag | Purpose |
|------|---------|
| `AEIO_MFlag_AUDIO` | Declare audio capability |

| Function | Direction | Purpose |
|----------|-----------|---------|
| `AEIO_GetSound()` | Import | Provide audio samples to AE |
| `AEIO_AddSoundChunk()` | Export | Receive audio samples for output |

---

## Performance Considerations

### Buffer Size Optimization

```c
// Process in cache-friendly blocks
#define OPTIMAL_BLOCK_SIZE 4096

void process_with_blocks(float *samples, A_long num_samples) {
    for (A_long offset = 0; offset < num_samples;
         offset += OPTIMAL_BLOCK_SIZE) {
        A_long block_size = min(OPTIMAL_BLOCK_SIZE,
                                num_samples - offset);
        process_block(&samples[offset * 2], block_size);
    }
}
```

### SIMD Considerations

```c
// SSE-optimized stereo gain
#ifdef USE_SSE
#include <xmmintrin.h>

void apply_gain_sse(float *samples, A_long num_samples, float gain) {
    __m128 gain_vec = _mm_set1_ps(gain);
    A_long aligned_samples = num_samples & ~3;

    for (A_long i = 0; i < aligned_samples * 2; i += 4) {
        __m128 samp = _mm_load_ps(&samples[i]);
        samp = _mm_mul_ps(samp, gain_vec);
        _mm_store_ps(&samples[i], samp);
    }

    // Handle remaining samples
    for (A_long i = aligned_samples * 2; i < num_samples * 2; i++) {
        samples[i] *= gain;
    }
}
#endif
```

### Memory Allocation

```c
// Use After Effects memory management
PF_Handle audio_buffer = PF_NEW_HANDLE(buffer_size);
void *ptr = PF_LOCK_HANDLE(audio_buffer);
// Use buffer...
PF_UNLOCK_HANDLE(audio_buffer);
PF_DISPOSE_HANDLE(audio_buffer);
```

---

## Debugging Audio Effects

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No audio output | Missing dest_snd population | Ensure writing to `out_data->dest_snd` |
| Clicks/pops | Discontinuities at block boundaries | Maintain phase/state across blocks |
| Distortion | Sample clipping | Check for values exceeding range |
| Wrong channel | Interleaving error | Verify L/R sample indexing |
| Phase issues | Incorrect sample rate | Use format's `rateF` value |

### Debug Logging

```c
#ifdef DEBUG_AUDIO
void log_audio_format(PF_SoundWorld *snd) {
    AEGP_SuiteHandler suites(in_data->pica_basicP);
    char msg[256];
    sprintf(msg, "Audio: %ld samples, %.0f Hz, %d ch, %d bytes/samp",
            snd->num_samples,
            snd->fi.rateF,
            snd->fi.num_channels,
            snd->fi.sample_size);
    suites.ANSICallbacksSuite1()->sprintf(NULL, msg);
}
#endif
```

### Validation Checks

```c
PF_Err validate_audio(PF_SoundWorld *snd) {
    if (!snd) return PF_Err_BAD_CALLBACK_PARAM;
    if (!snd->dataP) return PF_Err_BAD_CALLBACK_PARAM;
    if (snd->num_samples <= 0) return PF_Err_BAD_CALLBACK_PARAM;
    if (snd->fi.rateF <= 0) return PF_Err_BAD_CALLBACK_PARAM;
    if (snd->fi.num_channels < 1 || snd->fi.num_channels > 2)
        return PF_Err_BAD_CALLBACK_PARAM;
    return PF_Err_NONE;
}
```

---

## Advanced Audio DSP Concepts

### Filter Design Fundamentals

When implementing audio filters in After Effects, understanding basic DSP concepts is essential:

#### Low-Pass Filter Implementation

```c
typedef struct {
    float prev_output;
    float coefficient;
} LowPassState;

void init_lowpass(LowPassState *state, float cutoff_hz, float sample_rate) {
    float rc = 1.0f / (2.0f * PI * cutoff_hz);
    float dt = 1.0f / sample_rate;
    state->coefficient = dt / (rc + dt);
    state->prev_output = 0.0f;
}

float process_lowpass(LowPassState *state, float input) {
    state->prev_output = state->prev_output +
                         state->coefficient * (input - state->prev_output);
    return state->prev_output;
}
```

#### High-Pass Filter Implementation

```c
typedef struct {
    float prev_input;
    float prev_output;
    float coefficient;
} HighPassState;

void init_highpass(HighPassState *state, float cutoff_hz, float sample_rate) {
    float rc = 1.0f / (2.0f * PI * cutoff_hz);
    float dt = 1.0f / sample_rate;
    state->coefficient = rc / (rc + dt);
    state->prev_input = 0.0f;
    state->prev_output = 0.0f;
}

float process_highpass(HighPassState *state, float input) {
    state->prev_output = state->coefficient *
                         (state->prev_output + input - state->prev_input);
    state->prev_input = input;
    return state->prev_output;
}
```

### Envelope Detection

For audio-reactive effects, envelope detection extracts amplitude information:

```c
typedef struct {
    float envelope;
    float attack_coeff;
    float release_coeff;
} EnvelopeFollower;

void init_envelope(EnvelopeFollower *env, float attack_ms,
                   float release_ms, float sample_rate) {
    env->envelope = 0.0f;
    env->attack_coeff = expf(-1.0f / (attack_ms * sample_rate / 1000.0f));
    env->release_coeff = expf(-1.0f / (release_ms * sample_rate / 1000.0f));
}

float process_envelope(EnvelopeFollower *env, float input) {
    float abs_input = fabsf(input);

    if (abs_input > env->envelope) {
        // Attack phase
        env->envelope = env->attack_coeff * env->envelope +
                       (1.0f - env->attack_coeff) * abs_input;
    } else {
        // Release phase
        env->envelope = env->release_coeff * env->envelope +
                       (1.0f - env->release_coeff) * abs_input;
    }

    return env->envelope;
}
```

### RMS Level Calculation

Root Mean Square provides perceptually-relevant level measurement:

```c
float calculate_rms(float *samples, A_long num_samples, int channels) {
    float sum = 0.0f;
    A_long total = num_samples * channels;

    for (A_long i = 0; i < total; i++) {
        sum += samples[i] * samples[i];
    }

    return sqrtf(sum / (float)total);
}

// Windowed RMS for continuous monitoring
typedef struct {
    float *buffer;
    A_long buffer_size;
    A_long write_pos;
    float sum_of_squares;
} RMSWindow;

float update_rms_window(RMSWindow *rms, float sample) {
    // Remove oldest sample contribution
    A_long oldest_pos = (rms->write_pos + 1) % rms->buffer_size;
    float oldest = rms->buffer[oldest_pos];
    rms->sum_of_squares -= oldest * oldest;

    // Add new sample
    rms->buffer[rms->write_pos] = sample;
    rms->sum_of_squares += sample * sample;
    rms->write_pos = (rms->write_pos + 1) % rms->buffer_size;

    return sqrtf(rms->sum_of_squares / (float)rms->buffer_size);
}
```

### Peak Detection

Finding peaks for audio visualization or triggering:

```c
typedef struct {
    float peak_value;
    float decay_rate;
} PeakHold;

void update_peak(PeakHold *peak, float input, float sample_rate) {
    float abs_input = fabsf(input);

    if (abs_input > peak->peak_value) {
        peak->peak_value = abs_input;
    } else {
        // Decay at specified rate (dB per second)
        float decay = powf(10.0f, -peak->decay_rate / (20.0f * sample_rate));
        peak->peak_value *= decay;
    }
}
```

---

## Error Handling Best Practices

### Audio-Specific Error Codes

After Effects provides standard error codes applicable to audio processing:

| Error Code | Meaning | Response |
|------------|---------|----------|
| `PF_Err_NONE` | Success | Continue processing |
| `PF_Err_OUT_OF_MEMORY` | Memory allocation failed | Free resources, return error |
| `PF_Err_BAD_CALLBACK_PARAM` | Invalid parameter | Validate inputs |
| `PF_Err_INTERNAL_STRUCT_DAMAGED` | Corrupted data | Abort gracefully |
| `PF_Interrupt_CANCEL` | User cancelled | Clean up, return |

### Robust Error Handling Pattern

```c
static PF_Err
SafeAudioRender(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[])
{
    PF_Err err = PF_Err_NONE;

    // Validate input
    if (!in_data || !out_data || !params) {
        return PF_Err_BAD_CALLBACK_PARAM;
    }

    PF_SoundWorld *input = in_data->src_snd;
    PF_SoundWorld *output = out_data->dest_snd;

    // Validate audio structures
    if (!input || !input->dataP || input->num_samples <= 0) {
        return PF_Err_BAD_CALLBACK_PARAM;
    }

    // Allocate temporary buffer if needed
    PF_Handle temp_handle = NULL;
    float *temp_buffer = NULL;

    temp_handle = PF_NEW_HANDLE(input->num_samples * sizeof(float));
    if (!temp_handle) {
        return PF_Err_OUT_OF_MEMORY;
    }
    temp_buffer = (float *)PF_LOCK_HANDLE(temp_handle);

    // Process with progress checking
    A_long block_size = 1024;
    for (A_long offset = 0; offset < input->num_samples; offset += block_size) {
        // Check for user cancellation
        err = PF_ABORT(in_data);
        if (err) goto cleanup;

        // Update progress bar
        err = PF_PROGRESS(in_data, offset, input->num_samples);
        if (err) goto cleanup;

        // Process block
        A_long current_block = (block_size < input->num_samples - offset) ?
                               block_size : input->num_samples - offset;
        // ProcessAudioBlock implementation here
    }

cleanup:
    // Always clean up resources
    if (temp_buffer) {
        PF_UNLOCK_HANDLE(temp_handle);
    }
    if (temp_handle) {
        PF_DISPOSE_HANDLE(temp_handle);
    }

    return err;
}
```

---

## Real-World Implementation Examples

### Gain/Volume Effect

A simple but complete gain control effect:

```c
// Parameter indices
enum {
    GAIN_INPUT = 0,
    GAIN_DISK_ID
};

static PF_Err
GainAudioRender(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[])
{
    PF_Err err = PF_Err_NONE;

    PF_SoundWorld *input = in_data->src_snd;
    PF_SoundWorld *output = out_data->dest_snd;

    // Get gain value (0.0 to 2.0, where 1.0 = unity gain)
    PF_FpLong gain = params[GAIN_DISK_ID]->u.fd.value;

    // Convert to linear if using dB parameter
    // gain_linear = powf(10.0f, gain_db / 20.0f);

    float *in_samples = (float *)input->dataP;
    float *out_samples = (float *)output->dataP;

    A_long total_samples = input->num_samples * input->fi.num_channels;

    for (A_long i = 0; i < total_samples; i++) {
        out_samples[i] = in_samples[i] * (float)gain;
    }

    return err;
}
```

### Stereo Pan Effect

Panning control with constant-power law:

```c
static PF_Err
PanAudioRender(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[])
{
    PF_Err err = PF_Err_NONE;

    PF_SoundWorld *input = in_data->src_snd;
    PF_SoundWorld *output = out_data->dest_snd;

    // Pan value: -1.0 (full left) to 1.0 (full right)
    PF_FpLong pan = params[PAN_DISK_ID]->u.fd.value;

    // Constant-power panning coefficients
    float pan_normalized = (pan + 1.0f) * 0.5f;  // 0 to 1
    float left_gain = cosf(pan_normalized * PI * 0.5f);
    float right_gain = sinf(pan_normalized * PI * 0.5f);

    float *in_samples = (float *)input->dataP;
    float *out_samples = (float *)output->dataP;

    if (input->fi.num_channels == PF_Channels_STEREO) {
        for (A_long i = 0; i < input->num_samples; i++) {
            float left = in_samples[i * 2];
            float right = in_samples[i * 2 + 1];

            // Mix both channels, apply pan
            float mono = (left + right) * 0.5f;
            out_samples[i * 2] = mono * left_gain + left * (1.0f - fabsf(pan));
            out_samples[i * 2 + 1] = mono * right_gain + right * (1.0f - fabsf(pan));
        }
    }

    return err;
}
```

### Simple Echo Effect

Basic delay with feedback:

```c
typedef struct {
    float *delay_buffer;
    A_long buffer_size;
    A_long write_index;
    A_FpLong last_delay_time;
} EchoSequenceData;

static PF_Err
EchoAudioRender(
    PF_InData       *in_data,
    PF_OutData      *out_data,
    PF_ParamDef     *params[])
{
    PF_Err err = PF_Err_NONE;

    EchoSequenceData *seq = (EchoSequenceData *)
        PF_LOCK_HANDLE(in_data->sequence_data);

    PF_SoundWorld *input = in_data->src_snd;
    PF_SoundWorld *output = out_data->dest_snd;

    // Parameters
    PF_FpLong delay_time = params[DELAY_TIME_ID]->u.fd.value;  // seconds
    PF_FpLong feedback = params[FEEDBACK_ID]->u.fd.value;      // 0.0 to 0.95
    PF_FpLong mix = params[MIX_ID]->u.fd.value;                // 0.0 to 1.0

    A_long delay_samples = (A_long)(delay_time * input->fi.rateF);
    A_long channels = input->fi.num_channels;

    float *in_samp = (float *)input->dataP;
    float *out_samp = (float *)output->dataP;

    for (A_long i = 0; i < input->num_samples; i++) {
        for (int c = 0; c < channels; c++) {
            A_long in_idx = i * channels + c;
            A_long buf_idx = seq->write_index * channels + c;

            // Read from delay buffer
            A_long read_idx = ((seq->write_index - delay_samples +
                               seq->buffer_size) % seq->buffer_size) *
                              channels + c;
            float delayed = seq->delay_buffer[read_idx];

            // Output: dry + wet mix
            out_samp[in_idx] = in_samp[in_idx] * (1.0f - mix) +
                              delayed * mix;

            // Write to delay buffer with feedback
            seq->delay_buffer[buf_idx] = in_samp[in_idx] +
                                         delayed * feedback;
        }

        seq->write_index = (seq->write_index + 1) % seq->buffer_size;
    }

    PF_UNLOCK_HANDLE(in_data->sequence_data);
    return err;
}
```

---

## Appendix: Quick Reference Tables

### Audio Format Summary

| Component | Values | Notes |
|-----------|--------|-------|
| Sample Rate | 8000 - 96000 Hz | Common: 44100, 48000 |
| Bit Depth | 8, 16, 32 bits | 32-bit is floating point |
| Channels | 1 (mono), 2 (stereo) | Interleaved for stereo |
| Encoding | Unsigned PCM, Signed PCM, Float | Float recommended |

### Command Selector Sequence

| Order | Selector | Purpose |
|-------|----------|---------|
| 1 | PF_Cmd_GLOBAL_SETUP | Declare audio capabilities |
| 2 | PF_Cmd_PARAMS_SETUP | Register parameters |
| 3 | PF_Cmd_SEQUENCE_SETUP | Allocate persistent data |
| 4 | PF_Cmd_AUDIO_SETUP | Request input audio range |
| 5 | PF_Cmd_AUDIO_RENDER | Process audio |
| 6 | PF_Cmd_AUDIO_SETDOWN | Clean up audio resources |

### Output Flag Reference

| Flag | Purpose | Combine With |
|------|---------|--------------|
| AUDIO_EFFECT_ONLY | Audio-only processing | - |
| AUDIO_EFFECT_TOO | Audio + video processing | - |
| AUDIO_FLOAT_ONLY | Request float format | EFFECT_ONLY or EFFECT_TOO |
| AUDIO_IIR | Temporal dependencies | EFFECT_ONLY or EFFECT_TOO |
| I_SYNTHESIZE_AUDIO | Generate audio | EFFECT_ONLY or EFFECT_TOO |
| I_USE_AUDIO | Access audio in video effect | - (AE only, not Premiere) |

---

## Related Documentation

- [[01-effect-fundamentals]] - Effect plugin basics and command selectors
- [[02-smart-render]] - SmartFX for video processing
- [[03-parameters]] - Parameter system including audio float sliders
- [[05-aegp-suites]] - AEGP suites including SoundDataSuite

---

## Sources

- [After Effects C++ SDK Guide - Audio](https://ae-plugins.docsforadobe.dev/audio/audio/)
- [After Effects C++ SDK Guide - Audio Data Structures](https://ae-plugins.docsforadobe.dev/audio/audio-data-structures/)
- [After Effects C++ SDK Guide - Command Selectors](https://ae-plugins.docsforadobe.dev/effect-basics/command-selectors/)
- [After Effects C++ SDK Guide - PF_OutData](https://ae-plugins.docsforadobe.dev/effect-basics/PF_OutData/)
- [After Effects C++ SDK Guide - PF_InData](https://ae-plugins.docsforadobe.dev/effect-basics/PF_InData/)
- [After Effects C++ SDK Guide - Sample Projects](https://ae-plugins.docsforadobe.dev/intro/sample-projects/)
- [AE_Effect.h Header (GitHub)](https://github.com/takahirome/AdobeScripts/blob/master/SDK/Adobe%20After%20Effects%20CS6%20Mac%20SDK/Examples/Headers/AE_Effect.h)
- [Adobe Developer Portal - After Effects](https://developer.adobe.com/after-effects/)

---

*Document Version: 1.0*
*Wave 2 Gap-Filling Research*
*Created: 2025-12-27*
