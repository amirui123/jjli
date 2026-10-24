import { SoundSpec, PlayOptions } from '../types.js';
import { generatePCM } from './synth.js';
import { encodeWAV } from './wav.js';

/**
 * Converts a Uint8Array into a Base64 string.
 * Works seamlessly across Node.js, Modern Browsers, and React Native (Hermes/JSC).
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  } else if (typeof btoa !== 'undefined') {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } else {
    // Pure JS fallback for Hermes / React Native engines without global Buffer or btoa
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    const len = bytes.length;
    for (let i = 0; i < len; i += 3) {
      const b0 = bytes[i];
      const b1 = i + 1 < len ? bytes[i + 1] : 0;
      const b2 = i + 2 < len ? bytes[i + 2] : 0;

      const c0 = b0 >> 2;
      const c1 = ((b0 & 3) << 4) | (b1 >> 4);
      const c2 = ((b1 & 15) << 2) | (b2 >> 6);
      const c3 = b2 & 63;

      output += chars.charAt(c0) + chars.charAt(c1);
      output += i + 1 < len ? chars.charAt(c2) : '=';
      output += i + 2 < len ? chars.charAt(c3) : '=';
    }
    return output;
  }
}

/**
 * Returns a data:audio/wav;base64,... URI.
 * Enables zero-asset, instant sound playback in React Native (expo-av, react-native-sound).
 */
export function toDataURI(spec: SoundSpec, options: PlayOptions = {}, sampleRate = 44100): string {
  const pcm = generatePCM(spec, options, sampleRate);
  const wav = encodeWAV(pcm, sampleRate);
  const base64 = uint8ArrayToBase64(wav);
  return `data:audio/wav;base64,${base64}`;
}
