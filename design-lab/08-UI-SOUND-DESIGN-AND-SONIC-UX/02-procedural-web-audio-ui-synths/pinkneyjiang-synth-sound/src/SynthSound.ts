import { SynthSoundOptions, PlayCustomOptions } from './types';

/**
 * 🔊 SynthSound
 * Zero-audio-file, pure Web Audio API mathematical sound synthesizer.
 * 零外部音频文件加载、纯基于浏览器震荡器与指数包络线实时合成的极客微音效引擎。
 */
export class SynthSound {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public masterVolume: number = 1.0;
  private persistMuteKey: string | null = null;

  constructor(options: SynthSoundOptions = {}) {
    this.masterVolume = options.masterVolume ?? 1.0;
    this.persistMuteKey = options.persistMuteKey === undefined ? 'synth_sound_muted' : options.persistMuteKey;

    if (this.persistMuteKey && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.persistMuteKey);
        this.isMuted = stored === 'true' || stored === 'muted';
      } catch {
        this.isMuted = options.muted ?? false;
      }
    } else {
      this.isMuted = options.muted ?? false;
    }
  }

  /**
   * 安全获取或懒初始化 AudioContext (SSR-Safe)
   */
  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * 切换静音状态
   */
  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * 设定静音状态
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.persistMuteKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.persistMuteKey, muted ? 'true' : 'false');
      } catch {}
    }
  }

  /**
   * 设定全局音量倍率 (0.0 ~ 1.0)
   */
  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎹 纯合成微交互音效预设
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 鼠标划过微触碰音效 (轻快清脆，极适合按钮与卡片 hover)
   */
  public playHover(freq = 800, duration = 0.02): void {
    this.playClick(freq, duration, 0.04);
  }

  /**
   * 点击/按键按压物理反馈音
   */
  public playClick(freq = 600, duration = 0.04, baseVol = 0.06): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

      const targetVol = baseVol * this.masterVolume;
      gain.gain.setValueAtTime(targetVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  /**
   * 机械键盘敲击音效 (终端与打字机专用，随机多频混音)
   */
  public playKey(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqs = [350, 420, 500, 560];
      const freq = freqs[Math.floor(Math.random() * freqs.length)];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const vol = 0.03 * this.masterVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  }

  /**
   * 成功提示音 (C-E-G-C 四音上行琶音和弦)
   */
  public playSuccess(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const vol = 0.05 * this.masterVolume;
        gain.gain.setValueAtTime(vol, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
    } catch {}
  }

  /**
   * 警报与阻断警示音 (双频交替锯齿波)
   */
  public playWarning(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [880, 440, 880, 440].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const vol = 0.04 * this.masterVolume;
        gain.gain.setValueAtTime(vol, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.07);
      });
    } catch {}
  }

  /**
   * 窗口呼出与展开音效 (低频到高频扫频)
   */
  public playWindowOpen(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05 * this.masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  /**
   * 窗口收起与关闭音效 (高频到低频衰减)
   */
  public playWindowClose(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.04 * this.masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  /**
   * 赛博高能脉冲激光音 (锯齿扫频)
   */
  public playLaser(pulses = 3): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      for (let i = 0; i < pulses; i++) {
        const offset = i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950 - i * 40, now + offset);
        osc.frequency.exponentialRampToValueAtTime(140, now + offset + 0.1);

        gain.gain.setValueAtTime(0.08 * this.masterVolume, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      }
    } catch {}
  }

  /**
   * 自定义频率与波形实时合成
   */
  public playCustom(options: PlayCustomOptions): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = options.waveform || 'sine';
      osc.frequency.setValueAtTime(options.frequency, ctx.currentTime);
      if (options.targetFrequency) {
        osc.frequency.exponentialRampToValueAtTime(options.targetFrequency, ctx.currentTime + options.duration);
      }

      const vol = (options.volume ?? 0.05) * this.masterVolume;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + options.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + options.duration);
    } catch {}
  }
}

/** 默认开箱即用的全局单例 */
export const synthSound = new SynthSound();
export default synthSound;
