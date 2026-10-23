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
export const SPRING_SAMPLE_RATE = 60; // samples per second produced by simulateSpring()

export function springToCssLinear(analysis: SpringAnalysis, points = 24): string {
  const { samples } = analysis;
  // The curve must be sampled over the same window as the exported
  // `animation-duration` (the settle time) — otherwise the easing is time-warped.
  const lastIdx = Math.max(2, Math.min(samples.length - 1, Math.round(analysis.settleTime * SPRING_SAMPLE_RATE)));
  const step = Math.max(0, lastIdx / (points - 1));
  const values: string[] = [];
  for (let i = 0; i < points; i++) {
    const idx = Math.min(lastIdx, Math.round(i * step));
    values.push(samples[idx].toFixed(4));
  }
  // a CSS easing must start at 0 and finish exactly at 1, otherwise the
  // animation visibly stops short of its end state
  values[0] = "0";
  values[points - 1] = "1";
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


/** Curated motion recipes — each one fully describes the transition + path. */
export interface MotionPreset {
  id: string;
  labelFa: string;
  hintFa: string;
  mode: "spring" | "tween";
  params: SpringParams;
  durationS: number;
  bezier: [number, number, number, number];
  distance: number;
  rotate: number;
  blur: number;
  opacityFrom: number;
  scale: number;
  target: "card" | "type" | "orb";
}

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: "silk",
    labelFa: "ابریشم",
    hintFa: "ورود نرم و بدون پرش برای متن و کارت",
    mode: "spring",
    params: { stiffness: 120, damping: 22, mass: 1 },
    durationS: 0.6,
    bezier: [0.22, 1, 0.36, 1],
    distance: 80, rotate: 0, blur: 10, opacityFrom: 0, scale: 1.02, target: "type",
  },
  {
    id: "snappy",
    labelFa: "چابک",
    hintFa: "پاسخ سریع رابط، مناسب دکمه و منو",
    mode: "spring",
    params: { stiffness: 420, damping: 30, mass: 0.7 },
    durationS: 0.35,
    bezier: [0.4, 0, 0.2, 1],
    distance: 48, rotate: 0, blur: 4, opacityFrom: 0.2, scale: 1.04, target: "card",
  },
  {
    id: "bouncy",
    labelFa: "کشسان",
    hintFa: "فنر بازگشتی با فراجهش محسوس",
    mode: "spring",
    params: { stiffness: 320, damping: 12, mass: 0.9 },
    durationS: 0.6,
    bezier: [0.34, 1.56, 0.64, 1],
    distance: 110, rotate: 6, blur: 0, opacityFrom: 0.3, scale: 1.08, target: "orb",
  },
  {
    id: "heavy",
    labelFa: "سنگین",
    hintFa: "حس وزن و شکوه برای کارت‌های بزرگ",
    mode: "spring",
    params: { stiffness: 180, damping: 34, mass: 2.2 },
    durationS: 0.9,
    bezier: [0.16, 1, 0.3, 1],
    distance: 64, rotate: 2, blur: 12, opacityFrom: 0, scale: 1.01, target: "card",
  },
  {
    id: "whip",
    labelFa: "شلاقی",
    hintFa: "ورود سریع با کشیدگی و چرخش",
    mode: "spring",
    params: { stiffness: 700, damping: 18, mass: 0.45 },
    durationS: 0.3,
    bezier: [0.7, 0, 0.84, 0],
    distance: 160, rotate: 12, blur: 6, opacityFrom: 0, scale: 1.06, target: "type",
  },
  {
    id: "liquid",
    labelFa: "مایع",
    hintFa: "حرکت کشیده و آرام برای شیدر و گوی",
    mode: "spring",
    params: { stiffness: 90, damping: 14, mass: 1.4 },
    durationS: 1.1,
    bezier: [0.25, 0.1, 0.25, 1],
    distance: 120, rotate: 4, blur: 18, opacityFrom: 0, scale: 1.05, target: "orb",
  },
  {
    id: "editorial",
    labelFa: "سرمقاله‌ای",
    hintFa: "بیزیِ تند-آرام، محبوب سایت‌های حرفه‌ای",
    mode: "tween",
    params: { stiffness: 260, damping: 26, mass: 1 },
    durationS: 0.7,
    bezier: [0.22, 1, 0.36, 1],
    distance: 40, rotate: 0, blur: 8, opacityFrom: 0, scale: 1, target: "type",
  },
  {
    id: "brutal",
    labelFa: "بروتال",
    hintFa: "پرش کوتاه و ضربه‌ای بدون نرمی",
    mode: "tween",
    params: { stiffness: 500, damping: 40, mass: 1 },
    durationS: 0.22,
    bezier: [0.9, 0, 1, 0.2],
    distance: 24, rotate: 0, blur: 0, opacityFrom: 0.6, scale: 1.02, target: "card",
  },
];
