export type SwitchProfile =
  | 'thock'
  | 'clicky'
  | 'typewriter'
  | 'bubble'
  | 'creamy'
  | 'cyberpunk';

export type KeyRole = 'standard' | 'space' | 'enter' | 'backspace' | 'modifier';

export type DeskmatAcoustic = 'none' | 'felt' | 'wood' | 'metal';

export interface PlaySwitchOptions {
  /** Switch profile sound signature. Default: 'thock' */
  profile?: SwitchProfile;
  /** Volume multiplier between 0 and 1. Default: 0.8 */
  volume?: number;
  /** Pitch multiplier. 1.0 is default. Default: 1.0 */
  pitch?: number;
  /** Stereo pan position from -1.0 (left) to 1.0 (right). If omitted, calculated from key position if stereo is enabled. */
  pan?: number;
  /** Whether this is a key release (upstroke) sound. Default: false */
  isRelease?: boolean;
  /** Key name or KeyRole for tailored acoustics (e.g., Spacebar has stabilizer thud). */
  key?: string | KeyRole;
  /** Deskmat acoustic surface resonance. Default: 'none' */
  deskmat?: DeskmatAcoustic;
  /** Synthesize vintage typewriter bell on Enter. Default: false */
  carriageBell?: boolean;
  /** Trigger mobile haptic micro-vibration if supported. Default: false */
  haptic?: boolean;
}

export interface AttachOptions {
  /** Sound profile. Default: 'thock' */
  profile?: SwitchProfile;
  /** Volume between 0 and 1. Default: 0.8 */
  volume?: number;
  /** Play release sound on keyup. Default: true */
  playRelease?: boolean;
  /** Enable 3D spatial stereo panning based on keyboard layout. Default: true */
  stereoPan?: boolean;
  /** Enable mobile haptic micro-vibrations on mobile touch devices. Default: false */
  haptic?: boolean;
  /** Dynamically modulate pitch based on typing speed (WPM flow state). Default: false */
  wpmDynamics?: boolean;
  /** Deskmat acoustic surface resonance. Default: 'none' */
  deskmat?: DeskmatAcoustic;
  /** Synthesize vintage typewriter bell on Enter. Default: false */
  carriageBell?: boolean;
  /** Optional custom filter to ignore certain keys. */
  filter?: (event: KeyboardEvent) => boolean;
}

export interface SwitchEngine {
  /** Play an individual mechanical switch sound */
  play: (options?: PlaySwitchOptions) => void;
  /** Current active switch profile */
  getProfile: () => SwitchProfile;
  /** Change active profile */
  setProfile: (profile: SwitchProfile) => void;
  /** Get current master volume */
  getVolume: () => number;
  /** Set master volume */
  setVolume: (volume: number) => void;
  /** Stop or mute audio context */
  close: () => void;
}
