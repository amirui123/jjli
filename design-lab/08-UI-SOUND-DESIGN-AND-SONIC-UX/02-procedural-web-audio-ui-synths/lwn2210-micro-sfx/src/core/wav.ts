import { SoundSpec, PlayOptions } from '../types.js';
import { generatePCM } from './synth.js';

/**
 * Encodes a 16-bit Mono PCM buffer into a standard RIFF WAV container.
 * Works seamlessly in both Node.js (Buffer/Uint8Array) and Browser (Blob / Uint8Array).
 */
export function encodeWAV(samples: Int16Array, sampleRate = 44100): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true); // ChunkSize
  writeString(8, 'WAVE');

  // 2. "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // 3. "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true); // Subchunk2Size

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    view.setInt16(offset, samples[i], true);
  }

  return new Uint8Array(buffer);
}

/**
 * Creates a downloadable WAV Blob for browser environments
 */
export function createWAVBlob(spec: SoundSpec, options: PlayOptions = {}, sampleRate = 44100): Blob {
  if (typeof Blob === 'undefined') {
    throw new Error('createWAVBlob is only available in browser environments. Use encodeWAV in Node.js.');
  }
  const pcm = generatePCM(spec, options, sampleRate);
  const wavBytes = encodeWAV(pcm, sampleRate);
  return new Blob([wavBytes as any], { type: 'audio/wav' });
}
