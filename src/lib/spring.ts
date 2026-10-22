/**
 * Real spring physics — numerically integrated (semi-implicit Euler).
 * Everything the Motion Studio shows or exports is derived from this.
 */

export interface SpringParams {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface SpringAnalysis {
  samples: number[]; // normalized position 0..1
  duration: number; // seconds until settled
  settleTime: number;
  overshoot: number; // % beyond target
  dampingRatio: number;
  naturalFreq: number; // Hz
  peakVelocity: number;
}

const DT = 1 / 240;

export function simulateSpring(
  { stiffness, damping, mass }: SpringParams,
  maxSeconds = 3,
  threshold = 0.001
): SpringAnalysis {
  const k = Math.max(1, stiffness);
  const c = Math.max(0, damping);
  const m = Math.max(0.05, mass);

  let x = 0;
  let v = 0;
  const samples: number[] = [0];
  let settleTime = 0;
  let overshoot = 0;
  let peakVelocity = 0;
  const steps = Math.floor(maxSeconds / DT);
  const sampleEvery = 4; // 60 samples/sec

  for (let i = 1; i <= steps; i++) {
    const a = (-k * (x - 1) - c * v) / m;
    v += a * DT;
    x += v * DT;
    if (Math.abs(v) > peakVelocity) peakVelocity = Math.abs(v);
    if (x > 1) overshoot = Math.max(overshoot, x - 1);
    if (Math.abs(x - 1) > threshold || Math.abs(v) > threshold) {
      settleTime = i * DT;
    }
    if (i % sampleEvery === 0) samples.push(x);
  }

  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));

  return {
    samples,
    duration: Math.max(0.2, settleTime),
    settleTime,
    overshoot: overshoot * 100,
    dampingRatio: zeta,
    naturalFreq: omega0 / (2 * Math.PI),
    peakVelocity,
  };
}

/** Build a CSS `linear()` easing function from the simulated curve. */
export function springToCssLinear(analysis: SpringAnalysis, points = 24): string {
  const { samples } = analysis;
  const step = Math.max(0, (samples.length - 1) / (points - 1));
  const values: string[] = [];
  for (let i = 0; i < points; i++) {
    const idx = Math.min(samples.length - 1, Math.round(i * step));
    values.push(samples[idx].toFixed(4));
  }
  // clamp first/last for a valid easing
  values[0] = "0";
  if (Number(values[points - 1]) > 1.001) values[points - 1] = "1";
  return `linear(${values.join(", ")})`;
}

/** SVG path for the position/time graph. */
export function springPath(analysis: SpringAnalysis, width: number, height: number): string {
  const s = analysis.samples;
  if (s.length < 2) return "";
  const min = Math.min(...s, 0);
  const max = Math.max(...s, 1);
  const range = max - min || 1;
  return s
    .map((v, i) => {
      const x = (i / (s.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export const SPRING_PRESETS: {
  id: string;
  labelFa: string;
  params: SpringParams;
}[] = [
  { id: "silk", labelFa: "ابریشم", params: { stiffness: 120, damping: 22, mass: 1 } },
  { id: "snappy", labelFa: "چابک", params: { stiffness: 420, damping: 30, mass: 0.7 } },
  { id: "bouncy", labelFa: "کشسان", params: { stiffness: 320, damping: 12, mass: 0.9 } },
  { id: "heavy", labelFa: "سنگین", params: { stiffness: 180, damping: 34, mass: 2.2 } },
  { id: "whip", labelFa: "شلاقی", params: { stiffness: 700, damping: 18, mass: 0.45 } },
  { id: "liquid", labelFa: "مایع", params: { stiffness: 90, damping: 14, mass: 1.4 } },
];
