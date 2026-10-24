// MicroSFX - Zero-asset procedural audio engine for Flutter / Dart
// Synthesizes mathematical audio on-the-fly into raw samples and RIFF WAV byte buffers.
// Compatible with any Flutter audio plugin: audioplayers, just_audio, or flutter_sound.

import 'dart:math';
import 'dart:typed_data';

enum Waveform {
  sine,
  square,
  sawtooth,
  triangle,
  noise,
}

class FrequencyJump {
  final double time;
  final double to;

  const FrequencyJump({required this.time, required this.to});
}

class SoundSpec {
  final String name;
  final Waveform waveform;
  final double frequency;
  final double? frequencyEnd;
  final FrequencyJump? frequencyJump;
  final double attack;
  final double decay;
  final double sustain;
  final double release;
  final double volume;
  final double? noiseFilterCutoff;

  const SoundSpec({
    required this.name,
    required this.waveform,
    required this.frequency,
    this.frequencyEnd,
    this.frequencyJump,
    this.attack = 0.005,
    this.decay = 0.15,
    this.sustain = 0.0,
    this.release = 0.05,
    this.volume = 0.25,
    this.noiseFilterCutoff,
  });
}

class MicroSFX {
  static const int sampleRate = 44100;

  static final Map<String, SoundSpec> presets = {
    // --- Retro Arcade & Action ---
    'coin': SoundSpec(
      name: 'coin',
      waveform: Waveform.square,
      frequency: 987.77,
      frequencyJump: FrequencyJump(time: 0.08, to: 1318.51),
      attack: 0.005,
      decay: 0.25,
      release: 0.05,
      volume: 0.25,
    ),
    'laser': SoundSpec(
      name: 'laser',
      waveform: Waveform.sawtooth,
      frequency: 880.0,
      frequencyEnd: 110.0,
      decay: 0.15,
      volume: 0.25,
    ),
    'jump': SoundSpec(
      name: 'jump',
      waveform: Waveform.square,
      frequency: 150.0,
      frequencyEnd: 600.0,
      decay: 0.18,
      volume: 0.2,
    ),
    'explosion': SoundSpec(
      name: 'explosion',
      waveform: Waveform.noise,
      frequency: 800.0,
      noiseFilterCutoff: 800.0,
      attack: 0.01,
      decay: 0.45,
      release: 0.1,
      volume: 0.35,
    ),
    'hit': SoundSpec(
      name: 'hit',
      waveform: Waveform.sawtooth,
      frequency: 220.0,
      frequencyEnd: 60.0,
      decay: 0.12,
      volume: 0.3,
    ),
    'powerup': SoundSpec(
      name: 'powerup',
      waveform: Waveform.triangle,
      frequency: 330.0,
      frequencyEnd: 880.0,
      attack: 0.02,
      decay: 0.3,
      volume: 0.25,
    ),

    // --- UI & Interaction ---
    'click': SoundSpec(
      name: 'click',
      waveform: Waveform.sine,
      frequency: 500.0,
      frequencyEnd: 200.0,
      decay: 0.03,
      volume: 0.25,
    ),
    'select': SoundSpec(
      name: 'select',
      waveform: Waveform.sine,
      frequency: 660.0,
      decay: 0.06,
      volume: 0.2,
    ),
    'blip': SoundSpec(
      name: 'blip',
      waveform: Waveform.sine,
      frequency: 880.0,
      decay: 0.025,
      volume: 0.2,
    ),
    'tap': SoundSpec(
      name: 'tap',
      waveform: Waveform.triangle,
      frequency: 380.0,
      frequencyEnd: 180.0,
      decay: 0.04,
      volume: 0.22,
    ),
    'toggle': SoundSpec(
      name: 'toggle',
      waveform: Waveform.sine,
      frequency: 440.0,
      frequencyJump: FrequencyJump(time: 0.03, to: 880.0),
      decay: 0.08,
      volume: 0.2,
    ),

    // --- System & Feedback ---
    'success': SoundSpec(
      name: 'success',
      waveform: Waveform.triangle,
      frequency: 523.25,
      frequencyJump: FrequencyJump(time: 0.09, to: 783.99),
      decay: 0.32,
      volume: 0.25,
    ),
    'error': SoundSpec(
      name: 'error',
      waveform: Waveform.sawtooth,
      frequency: 240.0,
      frequencyJump: FrequencyJump(time: 0.08, to: 160.0),
      decay: 0.25,
      volume: 0.28,
    ),
    'notification': SoundSpec(
      name: 'notification',
      waveform: Waveform.sine,
      frequency: 587.33,
      frequencyJump: FrequencyJump(time: 0.07, to: 880.0),
      decay: 0.22,
      volume: 0.22,
    ),
    'badge': SoundSpec(
      name: 'badge',
      waveform: Waveform.triangle,
      frequency: 659.25,
      frequencyJump: FrequencyJump(time: 0.06, to: 1046.50),
      decay: 0.2,
      volume: 0.25,
    ),
    'warp': SoundSpec(
      name: 'warp',
      waveform: Waveform.sine,
      frequency: 120.0,
      frequencyEnd: 1200.0,
      decay: 0.35,
      volume: 0.28,
    ),
  };

  /// Generates a 16-bit Mono PCM Int16List
  static Int16List generatePCM(String presetName, {double pitch = 1.0, double volume = 1.0}) {
    final spec = presets[presetName.toLowerCase()];
    if (spec == null) {
      throw ArgumentError('Preset not found: $presetName');
    }

    final duration = spec.attack + spec.decay + spec.release;
    final totalSamples = (sampleRate * duration).floor();
    final buffer = Int16List(totalSamples);

    final baseFreq = spec.frequency * pitch;
    double currentFreq = baseFreq;
    double phase = 0.0;
    final rand = Random();
    double filterState = 0.0;

    final masterVol = spec.volume * volume;

    for (int i = 0; i < totalSamples; i++) {
      final t = i / sampleRate;

      // ADSR Envelope
      double env = 0.0;
      if (t < spec.attack) {
        env = spec.attack > 0 ? (t / spec.attack) : 1.0;
      } else if (t < spec.attack + spec.decay) {
        final dProgress = (t - spec.attack) / spec.decay;
        env = 1.0 - dProgress * (1.0 - spec.sustain);
      } else {
        final rProgress = (t - spec.attack - spec.decay) / spec.release;
        env = spec.sustain * (1.0 - rProgress);
      }
      env = env.clamp(0.0, 1.0);

      // Pitch Modulation
      if (spec.frequencyJump != null && t >= spec.frequencyJump!.time) {
        currentFreq = spec.frequencyJump!.to * pitch;
      } else if (spec.frequencyEnd != null) {
        final progress = (t / duration).clamp(0.0, 1.0);
        currentFreq = baseFreq * pow((spec.frequencyEnd! * pitch) / baseFreq, progress);
      }

      // Waveform generator
      phase += 2 * pi * currentFreq / sampleRate;
      if (phase >= 2 * pi) phase -= 2 * pi;

      double sample = 0.0;
      switch (spec.waveform) {
        case Waveform.sine:
          sample = sin(phase);
          break;
        case Waveform.square:
          sample = sin(phase) >= 0 ? 1.0 : -1.0;
          break;
        case Waveform.sawtooth:
          sample = (phase / pi) - 1.0;
          break;
        case Waveform.triangle:
          sample = (2 / pi) * asin(sin(phase));
          break;
        case Waveform.noise:
          final raw = rand.nextDouble() * 2.0 - 1.0;
          final cutoff = spec.noiseFilterCutoff ?? baseFreq;
          final rc = 1.0 / (2 * pi * cutoff);
          final dt = 1.0 / sampleRate;
          final alpha = dt / (rc + dt);
          filterState += alpha * (raw - filterState);
          sample = filterState;
          break;
      }

      final intVal = (sample * env * masterVol * 32767.0).floor().clamp(-32768, 32767);
      buffer[i] = intVal;
    }

    return buffer;
  }

  /// Encodes the sound into a complete standard RIFF WAV byte buffer (Uint8List).
  /// Ready to be played directly via `audioplayers`:
  /// `await player.play(BytesSource(MicroSFX.generateWAV('coin')))`
  static Uint8List generateWAV(String presetName, {double pitch = 1.0, double volume = 1.0}) {
    final pcm = generatePCM(presetName, pitch: pitch, volume: volume);
    final dataSize = pcm.length * 2;
    final buffer = Uint8List(44 + dataSize);
    final bdata = ByteData.view(buffer.buffer);

    void writeString(int offset, String str) {
      for (int i = 0; i < str.length; i++) {
        buffer[offset + i] = str.codeUnitAt(i);
      }
    }

    // RIFF chunk
    writeString(0, 'RIFF');
    bdata.setUint32(4, 36 + dataSize, Endian.little);
    writeString(8, 'WAVE');

    // fmt chunk
    writeString(12, 'fmt ');
    bdata.setUint32(16, 16, Endian.little); // Subchunk1Size
    bdata.setUint16(20, 1, Endian.little);  // AudioFormat (PCM)
    bdata.setUint16(22, 1, Endian.little);  // Channels (Mono)
    bdata.setUint32(24, sampleRate, Endian.little); // SampleRate
    bdata.setUint32(28, sampleRate * 2, Endian.little); // ByteRate
    bdata.setUint16(32, 2, Endian.little);  // BlockAlign
    bdata.setUint16(34, 16, Endian.little); // BitsPerSample

    // data chunk
    writeString(36, 'data');
    bdata.setUint32(40, dataSize, Endian.little);

    // PCM samples
    int offset = 44;
    for (int i = 0; i < pcm.length; i++, offset += 2) {
      bdata.setInt16(offset, pcm[i], Endian.little);
    }

    return buffer;
  }
}
