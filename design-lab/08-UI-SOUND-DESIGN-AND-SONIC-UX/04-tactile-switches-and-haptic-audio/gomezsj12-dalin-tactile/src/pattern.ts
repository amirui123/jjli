import type { HapticStep } from "./types.js";

const PWM_PERIOD_MS = 20;
const MAX_PWM_WINDOWS_PER_STEP = 64;
const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Converts recipe steps to the pattern expected by `navigator.vibrate`. The result
 * always starts with an on-value and alternates on and off.
 *
 * The web has no amplitude control, so `intensity` uses PWM: each scaled on-time is
 * chopped into windows whose duty cycle equals the step's intensity. Full intensity
 * becomes one solid pulse. `PWM_PERIOD_MS` is 20 ms, raised from 10. At 10 ms, a
 * 0.5 duty gave an Android LRA motor only 5 ms to move. At 20 ms, a 0.7 duty
 * gives 14 ms on, enough for partial response and perceptible roughness.
 *
 * `strength` scales each step's duration. `MAX_PWM_WINDOWS_PER_STEP` remains 64,
 * widening the window only beyond 1280 ms so each step stays bounded at 64 windows.
 */
export function stepsToPattern(steps: HapticStep[], strength = 1): number[] {
  type Seg = { on: boolean; ms: number };
  const segs: Seg[] = [];
  const add = (on: boolean, ms: number): void => {
    if (ms <= 0) return;
    const last = segs[segs.length - 1];
    if (last && last.on === on) last.ms += ms; // coalesce same-type runs
    else segs.push({ on, ms });
  };

  for (const step of steps) {
    if (step.delay && step.delay > 0) add(false, step.delay);
    const dur = Math.round((step.duration ?? 0) * strength);
    if (dur <= 0) continue;
    const intensity = clamp01(step.intensity ?? 1);
    if (intensity >= 0.999) {
      add(true, dur);
      continue;
    }
    if (intensity <= 0.001) {
      add(false, dur);
      continue;
    }
    // Long fractional steps widen the PWM carrier so custom buzzes do not expand
    // into huge `navigator.vibrate` arrays while keeping roughly the same duty cycle.
    const pwmPeriod = Math.max(PWM_PERIOD_MS, Math.ceil(dur / MAX_PWM_WINDOWS_PER_STEP));
    let remaining = dur;
    while (remaining > 0.5) {
      const w = Math.min(pwmPeriod, remaining);
      const on = Math.max(1, Math.round(w * intensity));
      add(true, on);
      add(false, Math.round(w - on));
      remaining -= w;
    }
  }

  while (segs.length > 0 && !segs[segs.length - 1]!.on) segs.pop(); // drop trailing silence
  if (segs.length === 0) return [];
  const pattern: number[] = [];
  if (!segs[0]!.on) pattern.push(0); // lead with a 0-length on so on/off parity holds
  for (const s of segs) pattern.push(Math.round(s.ms));
  return pattern;
}
