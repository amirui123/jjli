import { SoundSpec } from '../types';

export const PRESETS: Record<string, SoundSpec> = {
  // --- Retro Arcade & Action ---
  coin: {
    name: 'coin',
    waveform: 'square',
    frequency: 987.77, // B5
    frequencyJump: { time: 0.08, to: 1318.51 }, // E6
    attack: 0.005,
    decay: 0.25,
    release: 0.05,
    volume: 0.25
  },
  laser: {
    name: 'laser',
    waveform: 'sawtooth',
    frequency: 880,
    frequencyEnd: 110,
    attack: 0.005,
    decay: 0.15,
    release: 0.02,
    volume: 0.25
  },
  jump: {
    name: 'jump',
    waveform: 'square',
    frequency: 150,
    frequencyEnd: 600,
    attack: 0.005,
    decay: 0.18,
    release: 0.02,
    volume: 0.2
  },
  explosion: {
    name: 'explosion',
    waveform: 'noise',
    frequency: 800,
    noiseFilterCutoff: 800,
    attack: 0.01,
    decay: 0.45,
    release: 0.1,
    volume: 0.35
  },
  hit: {
    name: 'hit',
    waveform: 'sawtooth',
    frequency: 220,
    frequencyEnd: 60,
    attack: 0.002,
    decay: 0.12,
    release: 0.02,
    volume: 0.3
  },
  powerup: {
    name: 'powerup',
    waveform: 'triangle',
    frequency: 330,
    frequencyEnd: 880,
    attack: 0.02,
    decay: 0.3,
    release: 0.05,
    volume: 0.25
  },

  // --- Sci-Fi & Combat Expansions (Daily Drop #1) ---
  shield: {
    name: 'shield',
    waveform: 'sine',
    frequency: 220,
    frequencyJump: { time: 0.06, to: 440 },
    attack: 0.01,
    decay: 0.25,
    release: 0.08,
    volume: 0.28
  },
  missile: {
    name: 'missile',
    waveform: 'sawtooth',
    frequency: 140,
    frequencyEnd: 480,
    attack: 0.04,
    decay: 0.28,
    release: 0.06,
    volume: 0.26
  },
  zap: {
    name: 'zap',
    waveform: 'sawtooth',
    frequency: 1200,
    frequencyEnd: 240,
    attack: 0.002,
    decay: 0.08,
    release: 0.01,
    volume: 0.24
  },

  // --- Sci-Fi & Combat Expansions (Daily Drop #2) ---
  phaser: {
    name: 'phaser',
    waveform: 'square',
    frequency: 1600,
    frequencyEnd: 320,
    attack: 0.001,
    decay: 0.12,
    release: 0.015,
    volume: 0.22
  },
  thruster: {
    name: 'thruster',
    waveform: 'noise',
    frequency: 300,
    noiseFilterCutoff: 500,
    attack: 0.03,
    sustain: 0.6,
    decay: 0.5,
    release: 0.15,
    volume: 0.3
  },
  alarm: {
    name: 'alarm',
    waveform: 'square',
    frequency: 740,
    frequencyJump: { time: 0.12, to: 560 },
    attack: 0.004,
    decay: 0.28,
    release: 0.05,
    volume: 0.26
  },

  // --- UI & Web/Mobile Interactions ---
  click: {
    name: 'click',
    waveform: 'sine',
    frequency: 500,
    frequencyEnd: 200,
    attack: 0.001,
    decay: 0.03,
    release: 0.01,
    volume: 0.25
  },
  select: {
    name: 'select',
    waveform: 'sine',
    frequency: 660,
    attack: 0.005,
    decay: 0.06,
    release: 0.01,
    volume: 0.2
  },
  blip: {
    name: 'blip',
    waveform: 'sine',
    frequency: 880,
    attack: 0.001,
    decay: 0.025,
    release: 0.005,
    volume: 0.2
  },
  tap: {
    name: 'tap',
    waveform: 'triangle',
    frequency: 380,
    frequencyEnd: 180,
    attack: 0.001,
    decay: 0.04,
    release: 0.01,
    volume: 0.22
  },
  toggle: {
    name: 'toggle',
    waveform: 'sine',
    frequency: 440,
    frequencyJump: { time: 0.03, to: 880 },
    attack: 0.002,
    decay: 0.08,
    release: 0.02,
    volume: 0.2
  },

  // --- System & Feedback Alerts ---
  success: {
    name: 'success',
    waveform: 'triangle',
    frequency: 523.25, // C5
    frequencyJump: { time: 0.09, to: 783.99 }, // G5
    attack: 0.005,
    decay: 0.32,
    release: 0.05,
    volume: 0.25
  },
  error: {
    name: 'error',
    waveform: 'sawtooth',
    frequency: 240,
    frequencyJump: { time: 0.08, to: 160 },
    attack: 0.005,
    decay: 0.25,
    release: 0.04,
    volume: 0.28
  },
  notification: {
    name: 'notification',
    waveform: 'sine',
    frequency: 587.33, // D5
    frequencyJump: { time: 0.07, to: 880.00 }, // A5
    attack: 0.003,
    decay: 0.22,
    release: 0.03,
    volume: 0.22
  },
  badge: {
    name: 'badge',
    waveform: 'triangle',
    frequency: 659.25, // E5
    frequencyJump: { time: 0.06, to: 1046.50 }, // C6
    attack: 0.005,
    decay: 0.2,
    release: 0.04,
    volume: 0.25
  },
  warp: {
    name: 'warp',
    waveform: 'sine',
    frequency: 120,
    frequencyEnd: 1200,
    attack: 0.01,
    decay: 0.35,
    release: 0.08,
    volume: 0.28
  },

  // --- Daily Drop #3 (Gameplay & Magic/Combat) ---
  heal: {
    name: 'heal',
    waveform: 'sine',
    frequency: 523.25, // C5
    frequencyJump: { time: 0.08, to: 659.25 }, // jump to E5 (major 3rd warmth)
    attack: 0.03,
    decay: 0.35,
    release: 0.12,
    volume: 0.26
  },
  critical: {
    name: 'critical',
    waveform: 'sawtooth',
    frequency: 90,
    frequencyEnd: 35,
    attack: 0.003,
    decay: 0.42,
    release: 0.1,
    volume: 0.35
  },
  teleport: {
    name: 'teleport',
    waveform: 'sine',
    frequency: 300,
    frequencyEnd: 950,
    frequencyJump: { time: 0.12, to: 220 },
    attack: 0.005,
    decay: 0.22,
    release: 0.05,
    volume: 0.25
  },

  // --- Daily Drop #4 (Gameplay & Inventory UI) ---
  'inventory-open': {
    name: 'inventory-open',
    waveform: 'triangle',
    frequency: 320,
    frequencyJump: { time: 0.05, to: 520 },
    attack: 0.004,
    decay: 0.18,
    release: 0.04,
    volume: 0.22
  },
  'low-ammo': {
    name: 'low-ammo',
    waveform: 'square',
    frequency: 720,
    frequencyEnd: 440,
    attack: 0.002,
    decay: 0.1,
    release: 0.02,
    volume: 0.24
  },
  levelup: {
    name: 'levelup',
    waveform: 'triangle',
    frequency: 523.25, // C5
    frequencyJump: { time: 0.1, to: 1046.5 }, // leap to C6 fanfare
    attack: 0.01,
    decay: 0.45,
    release: 0.1,
    volume: 0.28
  }
};
