/*
 * MicroSFX - Single-header C99 / Raylib / SDL Procedural Audio Synthesizer
 * Zero audio assets. Generates raw 16-bit PCM Mono audio in memory.
 */

#ifndef MICRO_SFX_H
#define MICRO_SFX_H

#include <stdint.h>
#include <stdlib.h>
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

typedef enum {
    MSFX_SINE,
    MSFX_SQUARE,
    MSFX_SAWTOOTH,
    MSFX_TRIANGLE,
    MSFX_NOISE
} msfx_waveform_t;

typedef struct {
    const char* name;
    msfx_waveform_t waveform;
    float frequency;
    float frequency_end;
    float jump_time;
    float jump_frequency;
    float attack;
    float decay;
    float release;
    float volume;
} msfx_spec_t;

// Built-in presets
static inline msfx_spec_t msfx_preset_coin(void) {
    msfx_spec_t s = { "coin", MSFX_SQUARE, 987.77f, 0.0f, 0.08f, 1318.51f, 0.005f, 0.25f, 0.05f, 0.25f };
    return s;
}

static inline msfx_spec_t msfx_preset_laser(void) {
    msfx_spec_t s = { "laser", MSFX_SAWTOOTH, 880.0f, 110.0f, 0.0f, 0.0f, 0.005f, 0.15f, 0.02f, 0.25f };
    return s;
}

static inline msfx_spec_t msfx_preset_jump(void) {
    msfx_spec_t s = { "jump", MSFX_SQUARE, 150.0f, 600.0f, 0.0f, 0.0f, 0.005f, 0.18f, 0.02f, 0.20f };
    return s;
}

static inline msfx_spec_t msfx_preset_explosion(void) {
    msfx_spec_t s = { "explosion", MSFX_NOISE, 800.0f, 0.0f, 0.0f, 0.0f, 0.01f, 0.45f, 0.10f, 0.35f };
    return s;
}

static inline msfx_spec_t msfx_preset_click(void) {
    msfx_spec_t s = { "click", MSFX_SINE, 500.0f, 200.0f, 0.0f, 0.0f, 0.001f, 0.03f, 0.01f, 0.25f };
    return s;
}

/**
 * Synthesizes 16-bit PCM audio samples into a dynamically allocated buffer.
 * Caller must free() the returned pointer.
 * Out sample_count receives the number of int16_t samples generated.
 */
static inline int16_t* msfx_generate_pcm(msfx_spec_t spec, float pitch, float volume, int sample_rate, int* out_sample_count) {
    float duration = spec.attack + spec.decay + spec.release;
    int total_samples = (int)(sample_rate * duration);
    if (total_samples <= 0) return NULL;

    int16_t* buffer = (int16_t*)malloc(total_samples * sizeof(int16_t));
    if (!buffer) return NULL;

    float base_freq = spec.frequency * pitch;
    float current_freq = base_freq;
    double phase = 0.0;
    float master_vol = spec.volume * volume;

    for (int i = 0; i < total_samples; i++) {
        float t = (float)i / (float)sample_rate;

        if (spec.jump_time > 0.0f && t >= spec.jump_time) {
            current_freq = spec.jump_frequency * pitch;
        } else if (spec.frequency_end > 0.0f) {
            float progress = t / duration;
            current_freq = base_freq + (spec.frequency_end * pitch - base_freq) * progress;
        }

        float env = 0.0f;
        if (t < spec.attack) {
            env = t / spec.attack;
        } else {
            float decay_rem = (spec.decay + spec.release);
            env = (decay_rem > 0.0f) ? (1.0f - (t - spec.attack) / decay_rem) : 0.0f;
            if (env < 0.0f) env = 0.0f;
        }

        phase += (2.0 * M_PI * current_freq) / (double)sample_rate;
        float sample = 0.0f;

        switch (spec.waveform) {
            case MSFX_SINE:
                sample = (float)sin(phase);
                break;
            case MSFX_SQUARE:
                sample = (sin(phase) >= 0.0) ? 1.0f : -1.0f;
                break;
            case MSFX_SAWTOOTH: {
                double p = phase / (2.0 * M_PI);
                sample = (float)(2.0 * (p - floor(p + 0.5)));
                break;
            }
            case MSFX_TRIANGLE: {
                double p = phase / (2.0 * M_PI);
                sample = (float)(2.0 * fabs(2.0 * (p - floor(p + 0.5))) - 1.0);
                break;
            }
            case MSFX_NOISE:
                sample = ((float)rand() / (float)RAND_MAX) * 2.0f - 1.0f;
                break;
        }

        float final_val = sample * env * master_vol * 32767.0f;
        if (final_val > 32767.0f) final_val = 32767.0f;
        if (final_val < -32768.0f) final_val = -32768.0f;
        buffer[i] = (int16_t)final_val;
    }

    if (out_sample_count) *out_sample_count = total_samples;
    return buffer;
}

#endif // MICRO_SFX_H
