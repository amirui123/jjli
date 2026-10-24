import { defaultPatterns } from "./patterns";
import type {
  HapticInput,
  TriggerOptions,
  Vibration,
  WebHapticsOptions,
} from "./types";

const TOGGLE_MIN = 16; // ms at intensity 1 (every frame)
const TOGGLE_MAX = 184; // range above min (0.5 intensity ≈ 100ms)
const MAX_PHASE_MS = 1000; // browser haptic window limit
const PWM_CYCLE = 20; // ms per intensity modulation cycle

// Convert any HapticInput into a Vibration array for toVibratePattern / runPattern.
function normalizeInput(input: HapticInput): { vibrations: Vibration[] } | null {
  if (typeof input === "number") return { vibrations: [{ duration: input }] };
  if (typeof input === "string") {
    const preset = defaultPatterns[input as keyof typeof defaultPatterns];
    if (!preset) {
      console.warn(`[web-haptics] Unknown preset: "${input}"`);
      return null;
    }
    return { vibrations: preset.pattern.map((v) => ({ ...v })) };
  }

  if (Array.isArray(input)) {
    if (input.length === 0) return { vibrations: [] };
    // number[] shorthand: alternating on/off ms.
    if (typeof input[0] === "number") {
      const nums = input as number[];
      const vibrations: Vibration[] = [];
      for (let i = 0; i < nums.length; i += 2) {
        const delay = i > 0 ? nums[i - 1]! : 0;
        vibrations.push({
          ...(delay > 0 && { delay }),
          duration: nums[i]!,
        });
      }
      return { vibrations };
    }

    return { vibrations: (input as Vibration[]).map((v) => ({ ...v })) };
  }
  return { vibrations: input.pattern.map((v) => ({ ...v })) };
}

// PWM modulation: turn (duration, intensity) into flat on/off ms segments for navigator.vibrate.
function modulateVibration(duration: number, intensity: number): number[] {
  if (intensity >= 1) return [duration];
  if (intensity <= 0) return [];

  const onTime = Math.max(1, Math.round(PWM_CYCLE * intensity));
  const offTime = PWM_CYCLE - onTime;
  const result: number[] = [];

  // Round to whole ms up front: fractional durations (e.g. 0.5) would never
  // reach the `remaining >= PWM_CYCLE` exit condition below and loop forever.
  let remaining = Math.round(duration);
  while (remaining >= PWM_CYCLE) {
    result.push(onTime);
    result.push(offTime);
    remaining -= PWM_CYCLE;
  }
  if (remaining > 0) {
    const remOn = Math.max(1, Math.round(remaining * intensity));
    result.push(remOn);
    const remOff = remaining - remOn;
    if (remOff > 0) result.push(remOff);
  }

  return result;
}

// Build flat number[] for navigator.vibrate() from Vibration[] with PWM per segment.
function toVibratePattern(
  vibrations: Vibration[],
  defaultIntensity: number,
): number[] {
  const result: number[] = [];

  for (let i = 0; i < vibrations.length; i++) {
    const vib = vibrations[i]!;
    const intensity = Math.max(
      0,
      Math.min(1, vib.intensity ?? defaultIntensity),
    );
    const delay = vib.delay ?? 0;

    // Prepend delay: merge into trailing off-time or add new gap
    if (delay > 0) {
      if (result.length > 0 && result.length % 2 === 0) {
        result[result.length - 1]! += delay;
      } else {
        if (result.length === 0) result.push(0);
        result.push(delay);
      }
    }

    const modulated = modulateVibration(vib.duration, intensity);

    if (modulated.length === 0) {
      // Zero intensity — treat vibration as silence
      if (result.length > 0 && result.length % 2 === 0) {
        result[result.length - 1]! += vib.duration;
      } else if (vib.duration > 0) {
        result.push(0);
        result.push(vib.duration);
      }
      continue;
    }

    // Append modulated vibration segments
    for (const seg of modulated) {
      result.push(seg);
    }
  }

  return result;
}

let instanceCounter = 0;

// Same API as web-haptics: trigger patterns, optional debug (sound) and showSwitch (on-screen toggle).
export class WebHaptics {
  private hapticLabel: HTMLLabelElement | null = null;
  private domInitialized = false;
  private instanceId: number;
  private debug: boolean;
  private showSwitch: boolean;
  private rafId: number | null = null;
  private patternResolve: (() => void) | null = null;
  private audioCtx: AudioContext | null = null;
  private audioFilter: BiquadFilterNode | null = null;
  private audioGain: GainNode | null = null;
  private audioBuffer: AudioBuffer | null = null;

  constructor(options?: WebHapticsOptions) {
    this.instanceId = ++instanceCounter;
    this.debug = options?.debug ?? false;
    this.showSwitch = options?.showSwitch ?? false;
  }

  static get isSupported(): boolean {
    if (typeof navigator === "undefined" || typeof window === "undefined") return false;
    
    // Standard Vibration API support
    const hasVibrate = typeof navigator.vibrate === "function";
    
    // iOS Safari / WebKit "switch" trick support
    // (Modern iOS WebKit supports the switch attribute on checkboxes which triggers haptics)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    return hasVibrate || isIOS;
  }

  async trigger(
    input: HapticInput = [{ duration: 25, intensity: 0.7 }],
    options?: TriggerOptions,
  ): Promise<void> {
    const normalized = normalizeInput(input);
    if (!normalized) return;

    const { vibrations } = normalized;
    if (vibrations.length === 0) return;

    const defaultIntensity = Math.max(
      0,
      Math.min(1, options?.intensity ?? 0.5),
    );

    // Validate first, then clamp: clamping Infinity/NaN before the check would
    // silently turn invalid input into a MAX_PHASE_MS vibration.
    for (const vib of vibrations) {
      if (
        !Number.isFinite(vib.duration) ||
        vib.duration < 0 ||
        (vib.delay !== undefined &&
          (!Number.isFinite(vib.delay) || vib.delay < 0))
      ) {
        console.warn(
          `[web-haptics] Invalid vibration values. Durations and delays must be finite non-negative numbers.`,
        );
        return;
      }
      if (vib.duration > MAX_PHASE_MS) vib.duration = MAX_PHASE_MS;
    }

    // `isSupported` is true on iOS even without `navigator.vibrate`. Only call vibrate when it exists,
    // otherwise we skip the iOS switch fallback entirely (`!isSupported` is never true on iOS).
    const canVibrate =
      typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
    if (canVibrate) {
      try {
        navigator.vibrate(toVibratePattern(vibrations, defaultIntensity));
      } catch {
        /* ignore */
      }
    }

    // No Vibration API (iOS WebKit) and/or debug: DOM switch + optional desktop sound.
    if (!canVibrate || this.debug) {
      this.ensureDOM();
      if (!this.hapticLabel) return;

      this.stopPattern();

      const firstDelay = vibrations[0]?.delay ?? 0;
      const firstClickFired = firstDelay === 0;

      // First switch toggle before any `await` (e.g. `ensureAudio`) so WebKit keeps user activation.
      if (!canVibrate && firstClickFired) {
        this.hapticLabel.click();
      }

      if (this.debug) {
        await this.ensureAudio();
      }

      if (firstClickFired) {
        if (canVibrate) {
          this.hapticLabel.click();
        }
        if (this.debug && this.audioCtx) {
          const firstIntensity = Math.max(
            0,
            Math.min(1, vibrations[0]!.intensity ?? defaultIntensity),
          );
          this.playClick(firstIntensity);
        }
      }

      await this.runPattern(vibrations, defaultIntensity, firstClickFired);
    }
  }

  cancel(): void {
    this.stopPattern();
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(0);
      } catch {
        /* ignore */
      }
    }
  }

  destroy(): void {
    this.stopPattern();
    if (this.hapticLabel) {
      this.hapticLabel.remove();
      this.hapticLabel = null;
      this.domInitialized = false;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
      this.audioFilter = null;
      this.audioGain = null;
      this.audioBuffer = null;
    }
  }

  setDebug(debug: boolean): void {
    this.debug = debug;
    if (!debug && this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
      this.audioFilter = null;
      this.audioGain = null;
      this.audioBuffer = null;
    }
  }

  setShowSwitch(show: boolean): void {
    this.showSwitch = show;
    if (this.hapticLabel) {
      const checkbox = this.hapticLabel.querySelector("input");
      this.hapticLabel.style.display = show ? "" : "none";
      if (checkbox) checkbox.style.display = show ? "" : "none";
    }
  }

  private stopPattern(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.patternResolve?.();
    this.patternResolve = null;
  }

  // Run pattern over time: label.click() for iOS; when debug, playClick() for desktop sound.
  private runPattern(
    vibrations: Vibration[],
    defaultIntensity: number,
    firstClickFired: boolean,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.patternResolve = resolve;

      // Build phase boundaries: each vibration has an optional delay then an "on" phase
      const phases: { end: number; isOn: boolean; intensity: number }[] = [];
      let cumulative = 0;
      for (const vib of vibrations) {
        const intensity = Math.max(
          0,
          Math.min(1, vib.intensity ?? defaultIntensity),
        );
        const delay = vib.delay ?? 0;
        if (delay > 0) {
          cumulative += delay;
          phases.push({ end: cumulative, isOn: false, intensity: 0 });
        }
        cumulative += vib.duration;
        phases.push({ end: cumulative, isOn: true, intensity });
      }
      const totalDuration = cumulative;

      let startTime = 0;
      let lastToggleTime = -1;

      const loop = (time: number) => {
        if (startTime === 0) startTime = time;
        const elapsed = time - startTime;

        if (elapsed >= totalDuration) {
          this.rafId = null;
          // Null the handle before resolving so a cancel() issued from the
          // awaiting continuation can't re-enter a already-finished pattern.
          const done = this.patternResolve;
          this.patternResolve = null;
          done?.();
          return;
        }

        // Find current phase
        let phase = phases[0]!;
        for (const p of phases) {
          if (elapsed < p.end) {
            phase = p;
            break;
          }
        }

        if (phase.isOn) {
          const toggleInterval =
            TOGGLE_MIN + (1 - phase.intensity) * TOGGLE_MAX;

          if (lastToggleTime === -1) {
            lastToggleTime = time;
            if (!firstClickFired) {
              this.hapticLabel?.click();
              if (this.debug && this.audioCtx) {
                this.playClick(phase.intensity);
              }
              firstClickFired = true;
            }
          } else if (time - lastToggleTime >= toggleInterval) {
            this.hapticLabel?.click();
            if (this.debug && this.audioCtx) {
              this.playClick(phase.intensity);
            }
            lastToggleTime = time;
          }
        }

        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    });
  }

  // Play a short click at given intensity for debug (desktop) so user can hear the pattern.
  private playClick(intensity: number): void {
    if (!this.audioCtx || !this.audioFilter || !this.audioGain || !this.audioBuffer) return;
    const data = this.audioBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 25);
    }

    this.audioGain.gain.value = 0.5 * intensity;

    const baseFreq = 2000 + intensity * 2000;
    const jitter = 1 + (Math.random() - 0.5) * 0.3;
    this.audioFilter.frequency.value = baseFreq * jitter;

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioFilter);
    source.onended = () => source.disconnect();
    source.start();
  }

  // Lazy-init AudioContext + bandpass filter + gain for playClick (debug mode).
  private async ensureAudio(): Promise<void> {
    if (!this.audioCtx && typeof AudioContext !== "undefined") {
      // Construction can reject under strict autoplay policies; leave state
      // clean so the next user-gesture trigger can retry.
      try {
        this.audioCtx = new AudioContext();
      } catch {
        return;
      }

      this.audioFilter = this.audioCtx.createBiquadFilter();
      this.audioFilter.type = "bandpass";
      this.audioFilter.frequency.value = 4000;
      this.audioFilter.Q.value = 8;

      this.audioGain = this.audioCtx.createGain();
      this.audioFilter.connect(this.audioGain);
      this.audioGain.connect(this.audioCtx.destination);

      const duration = 0.004;
      this.audioBuffer = this.audioCtx.createBuffer(
        1,
        this.audioCtx.sampleRate * duration,
        this.audioCtx.sampleRate,
      );
      const data = this.audioBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 25);
      }
    }
    if (this.audioCtx?.state === "suspended") {
      await this.audioCtx.resume();
    }
  }

  // Create hidden label (and optional checkbox) for iOS fallback / programmatic click.
  private ensureDOM(): void {
    if (this.domInitialized) return;
    if (typeof document === "undefined") return;
    const id = `web-haptics-toast-${this.instanceId}`;
    const hapticLabel = document.createElement("label");
    hapticLabel.setAttribute("for", id);
    hapticLabel.textContent = "Haptic feedback";
    hapticLabel.style.position = "fixed";
    hapticLabel.style.bottom = "10px";
    hapticLabel.style.left = "10px";
    hapticLabel.style.padding = "5px 10px";
    hapticLabel.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    hapticLabel.style.color = "white";
    hapticLabel.style.fontFamily = "sans-serif";
    hapticLabel.style.fontSize = "14px";
    hapticLabel.style.borderRadius = "4px";
    hapticLabel.style.zIndex = "9999";
    hapticLabel.style.userSelect = "none";
    this.hapticLabel = hapticLabel;

    const hapticCheckbox = document.createElement("input");
    hapticCheckbox.type = "checkbox";
    hapticCheckbox.setAttribute("switch", "");
    hapticCheckbox.id = id;
    hapticCheckbox.style.all = "initial";
    hapticCheckbox.style.appearance = "auto";

    if (!this.showSwitch) {
      hapticLabel.style.display = "none";
      hapticCheckbox.style.display = "none";
    }

    hapticLabel.appendChild(hapticCheckbox);
    document.body.appendChild(hapticLabel);
    this.domInitialized = true;
  }
}
