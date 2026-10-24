package com.microsfx

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlin.math.*

/**
 * MicroSFX - Zero-asset procedural audio engine for Android (Kotlin).
 * Synthesizes 16-bit PCM audio samples on-the-fly via AudioTrack.
 */
enum class Waveform { SINE, SQUARE, SAWTOOTH, TRIANGLE, NOISE }

data class SoundSpec(
    val name: String,
    val waveform: Waveform,
    val frequency: Float,
    val frequencyEnd: Float = 0f,
    val jumpTime: Float = 0f,
    val jumpFrequency: Float = 0f,
    val attack: Float = 0.005f,
    val decay: Float = 0.15f,
    val release: Float = 0.05f,
    val volume: Float = 0.3f
)

object MicroSFX {
    private const val SAMPLE_RATE = 44100

    val presets = mapOf(
        "coin" to SoundSpec("coin", Waveform.SQUARE, 987.77f, jumpTime = 0.08f, jumpFrequency = 1318.51f, decay = 0.25f, volume = 0.25f),
        "laser" to SoundSpec("laser", Waveform.SAWTOOTH, 880f, frequencyEnd = 110f, decay = 0.15f, volume = 0.25f),
        "jump" to SoundSpec("jump", Waveform.SQUARE, 150f, frequencyEnd = 600f, decay = 0.18f, volume = 0.2f),
        "explosion" to SoundSpec("explosion", Waveform.NOISE, 800f, decay = 0.45f, volume = 0.35f),
        "click" to SoundSpec("click", Waveform.SINE, 500f, frequencyEnd = 200f, decay = 0.03f, volume = 0.25f)
    )

    fun play(presetName: String, pitch: Float = 1.0f, volume: Float = 1.0f) {
        val spec = presets[presetName.lowercase()] ?: return
        val pcm = generatePCM(spec, pitch, volume)

        val track = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_GAME)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setSampleRate(SAMPLE_RATE)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
            )
            .setBufferSizeInBytes(pcm.size * 2)
            .setTransferMode(AudioTrack.MODE_STATIC)
            .build()

        track.write(pcm, 0, pcm.size)
        track.play()
    }

    fun generatePCM(spec: SoundSpec, pitch: Float = 1.0f, volume: Float = 1.0f): ShortArray {
        val duration = spec.attack + spec.decay + spec.release
        val totalSamples = (SAMPLE_RATE * duration).toInt()
        val buffer = ShortArray(totalSamples)

        val baseFreq = spec.frequency * pitch
        var currentFreq = baseFreq
        var phase = 0.0
        val masterVol = spec.volume * volume

        for (i in 0 until totalSamples) {
            val t = i.toFloat() / SAMPLE_RATE

            if (spec.jumpTime > 0 && t >= spec.jumpTime) {
                currentFreq = spec.jumpFrequency * pitch
            } else if (spec.frequencyEnd > 0) {
                val progress = t / duration
                currentFreq = baseFreq + (spec.frequencyEnd * pitch - baseFreq) * progress
            }

            val env = if (t < spec.attack) {
                t / spec.attack
            } else {
                max(0f, 1.0f - (t - spec.attack) / (spec.decay + spec.release))
            }

            phase += (2.0 * Math.PI * currentFreq) / SAMPLE_RATE
            val sample = when (spec.waveform) {
                Waveform.SINE -> sin(phase).toFloat()
                Waveform.SQUARE -> if (sin(phase) >= 0) 1f else -1f
                Waveform.SAWTOOTH -> (2.0 * (phase / (2.0 * Math.PI) - floor(phase / (2.0 * Math.PI) + 0.5))).toFloat()
                Waveform.TRIANGLE -> (2.0 * abs(2.0 * (phase / (2.0 * Math.PI) - floor(phase / (2.0 * Math.PI) + 0.5))) - 1.0).toFloat()
                Waveform.NOISE -> (Math.random() * 2.0 - 1.0).toFloat()
            }

            buffer[i] = (sample * env * masterVol * 32767).toInt().coerceIn(-32768, 32767).toShort()
        }

        return buffer
    }
}
