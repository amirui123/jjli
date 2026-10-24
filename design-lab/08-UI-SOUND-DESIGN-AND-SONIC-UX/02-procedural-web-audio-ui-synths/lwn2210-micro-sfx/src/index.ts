import { PRESETS } from './presets/index.js';
import { playWebAudio, generatePCM, getAudioContext } from './core/synth.js';
import { encodeWAV, createWAVBlob } from './core/wav.js';
import { toDataURI, uint8ArrayToBase64 } from './core/base64.js';
import { SoundSpec, PlayOptions } from './types.js';

export * from './types.js';
export * from './presets/index.js';
export { playWebAudio, generatePCM, getAudioContext, encodeWAV, createWAVBlob, toDataURI, uint8ArrayToBase64 };

export interface SFXInstance {
  play(nameOrSpec: string | SoundSpec, options?: PlayOptions): void;
  // Retro & Action
  coin(options?: PlayOptions): void;
  laser(options?: PlayOptions): void;
  jump(options?: PlayOptions): void;
  explosion(options?: PlayOptions): void;
  hit(options?: PlayOptions): void;
  powerup(options?: PlayOptions): void;
  // Combat & Sci-Fi Expansions
  shield(options?: PlayOptions): void;
  missile(options?: PlayOptions): void;
  zap(options?: PlayOptions): void;
  phaser(options?: PlayOptions): void;
  thruster(options?: PlayOptions): void;
  alarm(options?: PlayOptions): void;
  // UI & Interaction
  click(options?: PlayOptions): void;
  select(options?: PlayOptions): void;
  blip(options?: PlayOptions): void;
  tap(options?: PlayOptions): void;
  toggle(options?: PlayOptions): void;
  // System & Feedback
  success(options?: PlayOptions): void;
  error(options?: PlayOptions): void;
  notification(options?: PlayOptions): void;
  badge(options?: PlayOptions): void;
  warp(options?: PlayOptions): void;
  // Daily Drop #3
  heal(options?: PlayOptions): void;
  critical(options?: PlayOptions): void;
  teleport(options?: PlayOptions): void;
  // Daily Drop #4
  inventoryOpen(options?: PlayOptions): void;
  lowAmmo(options?: PlayOptions): void;
  levelup(options?: PlayOptions): void;
  // Generators & Helpers
  generatePCM(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate?: number): Int16Array;
  encodeWAV(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate?: number): Uint8Array;
  createWAVBlob(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate?: number): Blob;
  toDataURI(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate?: number): string;
}

function resolveSpec(nameOrSpec: string | SoundSpec): SoundSpec {
  if (typeof nameOrSpec === 'string') {
    const found = PRESETS[nameOrSpec.toLowerCase()];
    if (!found) {
      throw new Error(`[micro-sfx] Preset '${nameOrSpec}' not found. Available: ${Object.keys(PRESETS).join(', ')}`);
    }
    return found;
  }
  return nameOrSpec;
}

export const sfx: SFXInstance = {
  play(nameOrSpec: string | SoundSpec, options?: PlayOptions): void {
    const spec = resolveSpec(nameOrSpec);
    playWebAudio(spec, options);
  },

  // Retro & Action
  coin(options?: PlayOptions): void { playWebAudio(PRESETS.coin, options); },
  laser(options?: PlayOptions): void { playWebAudio(PRESETS.laser, options); },
  jump(options?: PlayOptions): void { playWebAudio(PRESETS.jump, options); },
  explosion(options?: PlayOptions): void { playWebAudio(PRESETS.explosion, options); },
  hit(options?: PlayOptions): void { playWebAudio(PRESETS.hit, options); },
  powerup(options?: PlayOptions): void { playWebAudio(PRESETS.powerup, options); },

  // Combat & Sci-Fi Expansions
  shield(options?: PlayOptions): void { playWebAudio(PRESETS.shield, options); },
  missile(options?: PlayOptions): void { playWebAudio(PRESETS.missile, options); },
  zap(options?: PlayOptions): void { playWebAudio(PRESETS.zap, options); },
  phaser(options?: PlayOptions): void { playWebAudio(PRESETS.phaser, options); },
  thruster(options?: PlayOptions): void { playWebAudio(PRESETS.thruster, options); },
  alarm(options?: PlayOptions): void { playWebAudio(PRESETS.alarm, options); },

  // UI & Interaction
  click(options?: PlayOptions): void { playWebAudio(PRESETS.click, options); },
  select(options?: PlayOptions): void { playWebAudio(PRESETS.select, options); },
  blip(options?: PlayOptions): void { playWebAudio(PRESETS.blip, options); },
  tap(options?: PlayOptions): void { playWebAudio(PRESETS.tap, options); },
  toggle(options?: PlayOptions): void { playWebAudio(PRESETS.toggle, options); },

  // System & Feedback
  success(options?: PlayOptions): void { playWebAudio(PRESETS.success, options); },
  error(options?: PlayOptions): void { playWebAudio(PRESETS.error, options); },
  notification(options?: PlayOptions): void { playWebAudio(PRESETS.notification, options); },
  badge(options?: PlayOptions): void { playWebAudio(PRESETS.badge, options); },
  warp(options?: PlayOptions): void { playWebAudio(PRESETS.warp, options); },
  heal(options?: PlayOptions): void { playWebAudio(PRESETS.heal, options); },
  critical(options?: PlayOptions): void { playWebAudio(PRESETS.critical, options); },
  teleport(options?: PlayOptions): void { playWebAudio(PRESETS.teleport, options); },
  // Daily Drop #4
  inventoryOpen(options?: PlayOptions): void { playWebAudio(PRESETS['inventory-open'], options); },
  lowAmmo(options?: PlayOptions): void { playWebAudio(PRESETS['low-ammo'], options); },
  levelup(options?: PlayOptions): void { playWebAudio(PRESETS.levelup, options); },

  // Raw Data Buffers
  generatePCM(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate = 44100): Int16Array {
    const spec = resolveSpec(nameOrSpec);
    return generatePCM(spec, options, sampleRate);
  },

  encodeWAV(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate = 44100): Uint8Array {
    const spec = resolveSpec(nameOrSpec);
    const pcm = generatePCM(spec, options, sampleRate);
    return encodeWAV(pcm, sampleRate);
  },

  createWAVBlob(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate = 44100): Blob {
    const spec = resolveSpec(nameOrSpec);
    return createWAVBlob(spec, options, sampleRate);
  },

  toDataURI(nameOrSpec: string | SoundSpec, options?: PlayOptions, sampleRate = 44100): string {
    const spec = resolveSpec(nameOrSpec);
    return toDataURI(spec, options, sampleRate);
  }
};

export default sfx;
