import { DeskmatAcoustic, KeyRole, PlaySwitchOptions, SwitchProfile } from './types';

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let masterGain: GainNode | null = null;
let currentProfile: SwitchProfile = 'thock';
let masterVolume = 0.8;
let isAudioMuted = false;

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend().catch(() => {});
    }
  });
}

/**
 * Initializes or resumes the Web Audio API context.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextClass =
    window.AudioContext ||
    // @ts-expect-error - Safari fallback
    window.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(isAudioMuted ? 0 : masterVolume, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
    initNoiseBuffer(audioCtx);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Pre-generate a 1-second white/pink noise buffer for fast micro-burst synthesis.
 */
function initNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate; // 1 second
  noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
  }
}

/**
 * Resolve acoustic role of a key.
 */
export function resolveKeyRole(key?: string | KeyRole): KeyRole {
  if (!key) return 'standard';
  if (typeof key !== 'string') return key;

  const lower = key.toLowerCase();
  if (lower === ' ' || lower === 'space' || lower === 'spacebar') return 'space';
  if (lower === 'enter' || lower === 'return') return 'enter';
  if (lower === 'backspace' || lower === 'delete') return 'backspace';
  if (['shift', 'control', 'alt', 'meta', 'tab', 'capslock'].includes(lower)) return 'modifier';

  return 'standard';
}

/**
 * Calculate stereo horizontal position based on standard keyboard layout (-0.45 to +0.45).
 */
export function calculateKeyPan(key?: string | KeyRole): number {
  if (!key || typeof key !== 'string') return 0;
  const k = key.toLowerCase();

  // Far Left
  if (['q', 'a', 'z', '1', '2', 'tab', 'capslock', 'shift', 'control'].includes(k)) return -0.42;
  // Mid Left
  if (['w', 'e', 's', 'd', 'x', 'c', '3', '4'].includes(k)) return -0.22;
  // Center
  if (['r', 't', 'f', 'g', 'v', 'b', '5', '6', ' ', 'space', 'spacebar'].includes(k)) return 0;
  // Mid Right
  if (['y', 'u', 'h', 'j', 'n', 'm', '7', '8'].includes(k)) return 0.22;
  // Far Right
  if (['i', 'o', 'p', 'k', 'l', '9', '0', '-', '=', '[', ']', ';', '\'', 'enter', 'backspace'].includes(k)) return 0.42;

  return 0;
}

/**
 * Trigger mobile haptic micro-pulse.
 */
export function triggerHaptic(duration = 7): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}

/**
 * Procedural synthesizer for vintage typewriter carriage return bell ("DING!").
 */
export function synthesizeCarriageBell(ctx: AudioContext, dest: AudioNode, now: number): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const bellGain = ctx.createGain();

  // Dual metallic bell harmonic
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1860, now);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(3720, now);

  const duration = 0.55;
  bellGain.gain.setValueAtTime(0.4, now);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(bellGain);
  osc2.connect(bellGain);
  bellGain.connect(dest);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
}

/**
 * Apply surface material resonance acoustics (felt dampening, wood warmth, or metal ring).
 */
function applyDeskmatFilter(ctx: AudioContext, input: AudioNode, output: AudioNode, material: DeskmatAcoustic, now: number): void {
  if (material === 'felt') {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    input.connect(filter);
    filter.connect(output);
  } else if (material === 'wood') {
    const filter = ctx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.setValueAtTime(280, now);
    filter.gain.setValueAtTime(5, now);
    input.connect(filter);
    filter.connect(output);
  } else if (material === 'metal') {
    const filter = ctx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.setValueAtTime(3200, now);
    filter.gain.setValueAtTime(4, now);
    input.connect(filter);
    filter.connect(output);
  } else {
    input.connect(output);
  }
}

/**
 * Procedural synthesizer for "Thock" (lubed tactile/linear mechanical switches).
 */
function synthesizeThock(ctx: AudioContext, dest: AudioNode, now: number, pitchMult: number, isRelease: boolean, role: KeyRole) {
  const isSpace = role === 'space';
  const duration = isRelease ? 0.03 : (isSpace ? 0.09 : 0.06);

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  const baseFreq = (isSpace ? 110 : (isRelease ? 220 : 160)) * pitchMult;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq * 1.5, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + duration);

  const maxGain = isRelease ? 0.35 : (isSpace ? 1.0 : 0.85);
  oscGain.gain.setValueAtTime(maxGain, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(oscGain);
  oscGain.connect(dest);
  osc.start(now);
  osc.stop(now + duration);

  if (noiseBuffer) {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSpace ? 650 * pitchMult : 850 * pitchMult, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + duration);

    const noiseGain = ctx.createGain();
    const noiseVol = isRelease ? 0.2 : (isSpace ? 0.7 : 0.55);
    noiseGain.gain.setValueAtTime(noiseVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (duration * 0.8));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + duration);
  }
}

/**
 * Procedural synthesizer for "Creamy" (lubed marbly linear switches, TikTok custom keyboard sound).
 */
function synthesizeCreamy(ctx: AudioContext, dest: AudioNode, now: number, pitchMult: number, isRelease: boolean, role: KeyRole) {
  const isSpace = role === 'space';
  const duration = isRelease ? 0.025 : (isSpace ? 0.075 : 0.05);

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  const baseFreq = (isSpace ? 140 : (isRelease ? 290 : 220)) * pitchMult;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq * 1.8, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + duration);

  const vol = isRelease ? 0.3 : (isSpace ? 0.9 : 0.75);
  oscGain.gain.setValueAtTime(vol, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(oscGain);
  oscGain.connect(dest);
  osc.start(now);
  osc.stop(now + duration);

  if (noiseBuffer) {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, now);
    filter.frequency.setValueAtTime((isRelease ? 1600 : 1350) * pitchMult, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(isRelease ? 0.2 : 0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (duration * 0.75));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + duration);
  }
}

/**
 * Procedural synthesizer for "Clicky" (Cherry MX Blue / Kailh Box White).
 */
function synthesizeClicky(ctx: AudioContext, dest: AudioNode, now: number, pitchMult: number, isRelease: boolean, role: KeyRole) {
  const isSpace = role === 'space';
  const duration = isRelease ? 0.025 : (isSpace ? 0.065 : 0.045);

  if (noiseBuffer) {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.5, now);
    filter.frequency.setValueAtTime((isRelease ? 3400 : 2800) * pitchMult, now);

    const noiseGain = ctx.createGain();
    const clickVol = isRelease ? 0.4 : 0.85;
    noiseGain.gain.setValueAtTime(clickVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isRelease ? 0.015 : 0.022));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + duration);
  }

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  const pingFreq = (isRelease ? 1200 : 920) * pitchMult;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pingFreq, now);
  osc.frequency.exponentialRampToValueAtTime(pingFreq * 0.8, now + duration);

  const pingVol = isRelease ? 0.15 : 0.45;
  oscGain.gain.setValueAtTime(pingVol, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(oscGain);
  oscGain.connect(dest);
  osc.start(now);
  osc.stop(now + duration);

  if (!isRelease) {
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(isSpace ? 140 : 200, now);
    thud.frequency.exponentialRampToValueAtTime(80, now + duration);

    thudGain.gain.setValueAtTime(0.4, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    thud.connect(thudGain);
    thudGain.connect(dest);
    thud.start(now);
    thud.stop(now + duration);
  }
}

/**
 * Procedural synthesizer for "Typewriter" (Vintage mechanical steel typewriter).
 */
function synthesizeTypewriter(ctx: AudioContext, dest: AudioNode, now: number, pitchMult: number, isRelease: boolean, role: KeyRole) {
  const isSpace = role === 'space';
  const duration = isRelease ? 0.03 : (isSpace ? 0.08 : 0.06);

  const metal = ctx.createOscillator();
  const metalGain = ctx.createGain();

  metal.type = 'sawtooth';
  metal.frequency.setValueAtTime((isRelease ? 1800 : 1400) * pitchMult, now);
  metal.frequency.exponentialRampToValueAtTime(350, now + duration);

  metalGain.gain.setValueAtTime(isRelease ? 0.2 : 0.6, now);
  metalGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  metal.connect(metalGain);
  metalGain.connect(dest);
  metal.start(now);
  metal.stop(now + duration);

  if (noiseBuffer && !isRelease) {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1100, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (duration * 0.7));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + duration);
  }
}

/**
 * Procedural synthesizer for "Cyberpunk" (80s Sci-Fi retro terminal).
 */
function synthesizeCyberpunk(ctx: AudioContext, dest: AudioNode, now: number, pitchMult: number, isRelease: boolean, role: KeyRole) {
  const isSpace = role === 'space';
  const duration = isRelease ? 0.025 : (isSpace ? 0.07 : 0.045);

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  const startFreq = (isSpace ? 480 : (isRelease ? 880 : 740)) * pitchMult;
  osc.type = 'square';
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(startFreq * 0.4, now + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1800, now);

  oscGain.gain.setValueAtTime(isRelease ? 0.2 : 0.5, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(filter);
  filter.connect(oscGain);
  oscGain.connect(dest);
  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Procedural synthesizer for "Bubble" (Playful modern UI pop).
 */
function synthesizeBubble(ctx: AudioContext, dest: AudioNode, now: number, pitchMult: number, isRelease: boolean, role: KeyRole) {
  if (isRelease) return;
  const isSpace = role === 'space';
  const duration = isSpace ? 0.055 : 0.04;

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  const startFreq = (isSpace ? 480 : 720) * pitchMult;
  const endFreq = (isSpace ? 220 : 360) * pitchMult;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

  oscGain.gain.setValueAtTime(0.7, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(oscGain);
  oscGain.connect(dest);
  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Main switch sound trigger with humanized jitter, stereo panning, deskmat acoustics, and carriage bell.
 */
export function playSwitch(options: PlaySwitchOptions = {}): void {
  if (isAudioMuted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const profile = options.profile || currentProfile;
  const role = resolveKeyRole(options.key);
  const isRelease = Boolean(options.isRelease);
  const deskmat = options.deskmat ?? 'none';

  if (options.haptic) {
    triggerHaptic(isRelease ? 5 : 8);
  }

  const now = ctx.currentTime;

  // Carriage Return Ding Bell on Enter
  if (options.carriageBell && role === 'enter' && !isRelease) {
    synthesizeCarriageBell(ctx, masterGain, now);
  }

  // Humanization jitter: organic variation (±4% pitch, ±5% gain)
  const jitter = 0.96 + Math.random() * 0.08;
  const userPitch = options.pitch ?? 1.0;
  const pitchMult = userPitch * jitter;

  // Local gain node for this specific keystroke
  const keyGain = ctx.createGain();
  const baseVol = options.volume ?? 1.0;
  const volJitter = 0.95 + Math.random() * 0.1;
  keyGain.gain.setValueAtTime(Math.min(1.0, Math.max(0, baseVol * volJitter)), now);

  // Apply Deskmat Material Resonance
  const deskmatNode = ctx.createGain();
  applyDeskmatFilter(ctx, keyGain, deskmatNode, deskmat, now);

  // 3D Spatial Stereo Panning
  const panValue = options.pan ?? (typeof options.key === 'string' ? calculateKeyPan(options.key) : 0);

  if (panValue !== 0 && typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.min(1.0, Math.max(-1.0, panValue)), now);
    deskmatNode.connect(panner);
    panner.connect(masterGain);
  } else {
    deskmatNode.connect(masterGain);
  }

  switch (profile) {
    case 'creamy':
      synthesizeCreamy(ctx, keyGain, now, pitchMult, isRelease, role);
      break;
    case 'cyberpunk':
      synthesizeCyberpunk(ctx, keyGain, now, pitchMult, isRelease, role);
      break;
    case 'clicky':
      synthesizeClicky(ctx, keyGain, now, pitchMult, isRelease, role);
      break;
    case 'typewriter':
      synthesizeTypewriter(ctx, keyGain, now, pitchMult, isRelease, role);
      break;
    case 'bubble':
      synthesizeBubble(ctx, keyGain, now, pitchMult, isRelease, role);
      break;
    case 'thock':
    default:
      synthesizeThock(ctx, keyGain, now, pitchMult, isRelease, role);
      break;
  }
}

export function setMasterProfile(profile: SwitchProfile): void {
  currentProfile = profile;
}

export function getMasterProfile(): SwitchProfile {
  return currentProfile;
}

export function setMasterVolume(vol: number): void {
  masterVolume = Math.min(1.0, Math.max(0, vol));
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(masterVolume, audioCtx.currentTime);
  }
}

export function getMasterVolume(): number {
  return masterVolume;
}

export function isMuted(): boolean {
  return isAudioMuted;
}

export function setMuted(muted: boolean): void {
  isAudioMuted = muted;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(muted ? 0 : masterVolume, audioCtx.currentTime);
  }
}

export function toggleMute(): boolean {
  setMuted(!isAudioMuted);
  return isAudioMuted;
}

export function closeAudio(): void {
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close().catch(() => {});
    audioCtx = null;
    noiseBuffer = null;
    masterGain = null;
  }
}
