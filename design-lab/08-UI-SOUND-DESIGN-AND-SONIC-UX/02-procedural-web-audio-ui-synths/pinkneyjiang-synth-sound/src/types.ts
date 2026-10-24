export type OscillatorWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface SynthSoundOptions {
  /** 是否全局静音 (默认: false) */
  muted?: boolean;
  /** 合成音量缩放倍率 (0.0 ~ 1.0, 默认: 1.0) */
  masterVolume?: number;
  /** 是否在 localStorage 中持久化静音设置 (默认: true) */
  persistMuteKey?: string | null;
}

export interface PlayCustomOptions {
  /** 振荡器波形类型 */
  waveform?: OscillatorWaveform;
  /** 起始频率 (Hz) */
  frequency: number;
  /** 终止频率 (Hz)，若传入则在持续时间内指数衰减或上升 */
  targetFrequency?: number;
  /** 持续时间 (秒) */
  duration: number;
  /** 音量 (0.0 ~ 1.0) */
  volume?: number;
}
