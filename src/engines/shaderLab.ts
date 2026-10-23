/**
 * Shader Lab — کتابخانه شیدرهای واقعی GLSL.
 *
 * هر شیدر یک `scene()` است که روی یک پیش‌درآمد مشترک سوار می‌شود
 * (نویز، fbm، چرخش، پالت و اکسنت زنده). همان سورس GLSL که می‌بینید،
 * همان چیزی است که رندر می‌شود و قابل دانلود است.
 */

export type ShaderCategory = "gradient" | "noise" | "geometric" | "retro" | "liquid";

export interface ShaderDef {
  id: string;
  nameFa: string;
  nameEn: string;
  category: ShaderCategory;
  descFa: string;
  /** فیلدهای پیشنهادی برای این شیدر */
  preset: { speed: number; scale: number; hue: number; warp: number };
  scene: string;
}

export const SHADER_CATEGORY_LABEL: Record<ShaderCategory, string> = {
  gradient: "گرادیان",
  noise: "نویز",
  geometric: "هندسی",
  retro: "رترو",
  liquid: "مایع",
};

export const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const SHADER_PRELUDE = `precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_speed;
uniform float u_scale;
uniform float u_hue;
uniform float u_warp;
uniform float u_grain;
uniform vec2  u_mouse;
uniform vec3  u_accent;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot(0.55) * p * 2.03;
    a *= 0.5;
  }
  return v;
}

vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

/** پالت زنده بر پایه اکسنت انتخاب‌شده کاربر */
vec3 tone(float t) {
  float h = fract(u_hue + t * 0.5);
  vec3 base = hsv2rgb(vec3(h, 0.72, 1.0));
  return mix(base, u_accent, 0.62);
}

vec3 scene(vec2 p, float t);
`;

export const FRAGMENT_MAIN = `
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
  float t = u_time * u_speed;
  vec2 p = uv * u_scale;
  vec2 m = u_mouse * 0.35;
  vec3 col = scene(p + m, t);
  col += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * u_grain * 0.16;
  float vig = smoothstep(1.75, 0.15, length(uv));
  col *= mix(1.0, vig, 0.5);
  col = pow(max(col, 0.0), vec3(0.92));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const SHADERS: ShaderDef[] = [
  {
    id: "mesh-aurora",
    nameFa: "شفق مش‌گرادیان",
    nameEn: "Mesh Aurora",
    category: "gradient",
    descFa: "چهار هاله رنگی که روی هم می‌لغزند؛ مناسب پس‌زمینه هیرو",
    preset: { speed: 0.35, scale: 1, hue: 0.08, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  float d = 0.0;
  vec3 col = vec3(0.02, 0.02, 0.035);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 c = vec2(sin(t * (0.5 + fi * 0.17) + fi * 2.0), cos(t * (0.43 + fi * 0.11) + fi * 1.3)) * (1.1 + fi * 0.18);
    d = length(p - c);
    float glow = 0.32 / (d * d + 0.18);
    col += tone(fi * 0.19 + t * 0.02) * glow * 0.5;
  }
  float grainF = fbm(p * 1.6 + t * 0.1);
  col *= 0.85 + grainF * 0.3;
  return col;
}`,
  },
  {
    id: "aurora-curtain",
    nameFa: "پرده شفق",
    nameEn: "Aurora Curtain",
    category: "noise",
    descFa: "نوارهای عمودی شفق با اعوجاج fbm",
    preset: { speed: 0.4, scale: 1.2, hue: 0.42, warp: 1.4 },
    scene: `
vec3 scene(vec2 p, float t) {
  vec2 q = p;
  q.x += fbm(vec2(p.x * 1.4, t * 0.25)) * u_warp * 1.6;
  float band = fbm(vec2(q.x * 2.2, q.y * 0.35 - t * 0.5));
  float curtain = smoothstep(0.35, 0.95, band) * smoothstep(-1.4, 0.7, p.y);
  vec3 col = mix(vec3(0.01, 0.02, 0.05), tone(band + 0.35), curtain);
  col += tone(0.7) * pow(curtain, 3.0) * 0.55;
  return col + 0.015;
}`,
  },
  {
    id: "plasma-flow",
    nameFa: "پلاسمای روان",
    nameEn: "Plasma Flow",
    category: "noise",
    descFa: "کلاسیک پلاسما با سینوس‌های درهم‌تنیده",
    preset: { speed: 0.6, scale: 1.6, hue: 0.62, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  float v = sin(p.x * 1.7 + t) + sin(p.y * 1.9 - t * 1.1);
  v += sin((p.x + p.y) * 1.4 + t * 0.7);
  v += sin(length(p) * 3.2 - t * 1.6) * 0.8;
  v = v * 0.25 + 0.5;
  vec3 col = tone(v * 0.8) * (0.35 + v * 0.9);
  col += tone(v * 0.8 + 0.33) * pow(v, 4.0) * 0.7;
  return col;
}`,
  },
  {
    id: "metaballs",
    nameFa: "متابال",
    nameEn: "Metaballs",
    category: "liquid",
    descFa: "قطره‌های مایع که در هم می‌آمیزند",
    preset: { speed: 0.5, scale: 1.1, hue: 0.5, warp: 1 },
    scene: `
float meta(vec2 p, float t) {
  float v = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 c = vec2(sin(t * 0.7 + fi * 1.9), cos(t * 0.55 + fi * 2.4)) * 1.25;
    v += 0.34 / (length(p - c) + 0.06);
  }
  return v;
}
vec3 scene(vec2 p, float t) {
  float m = meta(p, t);
  float edge = smoothstep(1.25, 1.5, m);
  vec3 col = mix(vec3(0.02, 0.02, 0.04), tone(m * 0.2), edge);
  col += tone(m * 0.2 + 0.4) * smoothstep(1.9, 2.5, m) * 0.5;
  col += vec3(0.06) * (1.0 - edge) * smoothstep(0.9, 1.3, m);
  return col;
}`,
  },
  {
    id: "voronoi-cells",
    nameFa: "سلول ورونوی",
    nameEn: "Voronoi Cells",
    category: "geometric",
    descFa: "سلول‌های زنده با لبه نورانی",
    preset: { speed: 0.3, scale: 1.8, hue: 0.55, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  vec2 g = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  vec2 id = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 h = hash(g + o) * 0.8 + 0.1 * vec2(sin(t + o.x), cos(t + o.y));
      vec2 r = o + h - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; id = g + o; } else if (d < d2) { d2 = d; }
    }
  }
  float edge = smoothstep(0.0, 0.12, sqrt(d2) - sqrt(d1));
  vec3 col = tone(hash(id) * 0.7) * (0.16 + 0.1 * hash(id + 3.0));
  col += tone(hash(id) + 0.5) * (1.0 - edge) * 1.1;
  return col;
}`,
  },
  {
    id: "kaleidoscope",
    nameFa: "کالیدوسکوپ",
    nameEn: "Kaleidoscope",
    category: "geometric",
    descFa: "تقارن شش‌گانه با نویز چرخان",
    preset: { speed: 0.45, scale: 1.5, hue: 0.75, warp: 1.2 },
    scene: `
vec3 scene(vec2 p, float t) {
  float a = atan(p.y, p.x);
  float r = length(p);
  float seg = 3.14159265 / 6.0;
  a = mod(a, seg * 2.0);
  a = abs(a - seg);
  p = vec2(cos(a), sin(a)) * r;
  float n = fbm(p * 2.6 + vec2(0.0, t * 0.35));
  vec3 col = tone(n * 1.4) * (0.3 + 0.8 * n);
  col += tone(n + 0.5) * smoothstep(0.62, 0.9, n) * 0.8;
  col *= smoothstep(2.4, 0.2, r);
  return col;
}`,
  },
  {
    id: "liquid-chrome",
    nameFa: "کروم مایع",
    nameEn: "Liquid Chrome",
    category: "liquid",
    descFa: "سطح فلزی موج‌دار با بازتاب رنگی",
    preset: { speed: 0.3, scale: 1.2, hue: 0.15, warp: 1.6 },
    scene: `
vec3 scene(vec2 p, float t) {
  float w = fbm(p * 1.3 + t * 0.12) * u_warp;
  vec2 q = p + vec2(w, fbm(p * 1.1 - t * 0.09) * u_warp);
  float h = fbm(q * 1.7 + t * 0.2);
  float spec = pow(smoothstep(0.45, 0.9, h), 3.0);
  vec3 col = vec3(h * 0.28) + tone(h * 0.9) * spec * 1.1;
  col += tone(h * 0.9 + 0.5) * pow(smoothstep(0.7, 1.0, h), 6.0) * 0.6;
  return col * 1.05;
}`,
  },
  {
    id: "star-warp",
    nameFa: "پرش ستاره‌ای",
    nameEn: "Star Warp",
    category: "retro",
    descFa: "حرکت با سرعت نور در میدان ستاره",
    preset: { speed: 0.8, scale: 2.2, hue: 0.58, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  float r = length(p) + 0.0001;
  float a = atan(p.y, p.x);
  float stars = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i) + 1.0;
    float band = fract(r * 0.9 - t * fi * 0.35);
    float lane = fract(a * 14.0 + hash(vec2(fi, floor(r * 3.0 - t * fi))));
    stars += smoothstep(0.86, 1.0, lane) * smoothstep(1.0, 0.2, band) * 0.9;
  }
  vec3 col = vec3(0.01, 0.012, 0.03);
  col += tone(0.2) * stars;
  col += tone(0.6) * smoothstep(0.9, 0.0, r) * 0.35;
  return col;
}`,
  },
  {
    id: "synth-grid",
    nameFa: "شبکه سینت‌ویو",
    nameEn: "Synth Grid",
    category: "retro",
    descFa: "افق شبکه‌ای هشت‌بیتی با خورشید نئونی",
    preset: { speed: 0.45, scale: 1, hue: 0.85, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  vec3 col = mix(vec3(0.03, 0.0, 0.06), vec3(0.12, 0.02, 0.18), smoothstep(0.4, -0.4, p.y));
  float sun = smoothstep(0.55, 0.5, length(p - vec2(0.0, 0.35)));
  col += tone(0.05) * sun * 0.85;
  float horizon = smoothstep(0.02, 0.0, p.y + 0.05);
  col += tone(0.4) * horizon * 0.6;
  if (p.y > -0.05) {
    vec2 g = p / (p.y + 0.06);
    g.x += sin(t * 0.6) * 0.15;
    float lines = smoothstep(0.96, 1.0, fract(g.x * 1.4)) + smoothstep(0.94, 1.0, fract(g.y * 0.8 - t * 0.4));
    col += tone(0.2) * lines * 0.75;
  }
  return col;
}`,
  },
  {
    id: "dither-wave",
    nameFa: "موج دیتر",
    nameEn: "Dither Wave",
    category: "retro",
    descFa: "سایه‌زنی نقطه‌ای با ماتریس بایر",
    preset: { speed: 0.4, scale: 2.4, hue: 0.1, warp: 1 },
    scene: `
float b2(vec2 p) {
  vec2 f = mod(floor(p), 2.0);
  float i = f.y * 2.0 + f.x;
  return i < 0.5 ? 0.0 : (i < 1.5 ? 2.0 : (i < 2.5 ? 3.0 : 1.0));
}
/** 4x4 ordered dither, built by recursion so it runs on every WebGL1 driver */
float bayer(vec2 p) { return (4.0 * b2(floor(p * 0.5)) + b2(p)) / 16.0; }
vec3 scene(vec2 p, float t) {
  float w = sin(p.x * 1.4 + t) * 0.5 + fbm(p * 1.2 + t * 0.2) * 0.8;
  float shade = smoothstep(-0.6, 0.9, w - p.y * 0.35);
  float d = step(shade, bayer(gl_FragCoord.xy * 0.5));
  vec3 col = mix(vec3(0.02, 0.02, 0.03), tone(w * 0.4), d * 0.9 + shade * 0.15);
  return col;
}`,
  },
  {
    id: "crt-terminal",
    nameFa: "ترمینال CRT",
    nameEn: "CRT Terminal",
    category: "retro",
    descFa: "مانیتور قدیمی با خطوط اسکن و شکم تصویر",
    preset: { speed: 0.7, scale: 1, hue: 0.28, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  vec2 q = p * (1.0 + 0.08 * dot(p, p));
  float scan = 0.5 + 0.5 * sin(q.y * 220.0 - t * 6.0);
  float rows = step(0.55, fract(q.y * 20.0 + t * 0.4));
  float signal = fbm(q * 5.0 + vec2(0.0, t));
  float glow = smoothstep(0.45, 0.75, signal) * rows;
  vec3 col = tone(0.25) * glow * 0.55;
  col += tone(0.25) * scan * 0.05;
  col *= smoothstep(1.55, 0.4, length(p));
  col *= 0.6 + 0.4 * step(0.02, fract(t * 0.35));
  return col;
}`,
  },
  {
    id: "caustics",
    nameFa: "کاستیک آب",
    nameEn: "Water Caustics",
    category: "liquid",
    descFa: "بازتاب نور در کف استخر",
    preset: { speed: 0.35, scale: 1.4, hue: 0.48, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  vec2 q = p;
  for (int i = 0; i < 3; i++) {
    float fi = float(i) + 1.0;
    q += vec2(sin(q.y * fi * 1.7 + t * 0.8), cos(q.x * fi * 1.5 - t * 0.6)) / (fi * 3.0);
  }
  float c = pow(abs(sin(q.x * 3.0) * sin(q.y * 3.0)), 0.6);
  vec3 col = vec3(0.01, 0.03, 0.05) + tone(0.5) * c * 0.9;
  col += tone(0.62) * pow(c, 6.0) * 0.8;
  return col;
}`,
  },
  {
    id: "lava-lamp",
    nameFa: "چراغ گدازه",
    nameEn: "Lava Lamp",
    category: "liquid",
    descFa: "حباب‌های گرم و آهسته که بالا می‌روند",
    preset: { speed: 0.25, scale: 1.1, hue: 0.02, warp: 1.2 },
    scene: `
vec3 scene(vec2 p, float t) {
  float v = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 c = vec2(sin(fi * 2.3 + t * 0.3) * 0.8, fract(fi * 0.37 - t * 0.08) * 2.4 - 1.2);
    v += 0.5 / (length(p - c) * 1.6 + 0.35);
  }
  vec3 col = mix(vec3(0.04, 0.01, 0.02), tone(0.05 + v * 0.15), smoothstep(0.8, 1.9, v));
  col += tone(0.1) * pow(smoothstep(1.2, 2.4, v), 2.0) * 0.7;
  return col;
}`,
  },
  {
    id: "tunnel",
    nameFa: "تونل بی‌پایان",
    nameEn: "Infinite Tunnel",
    category: "geometric",
    descFa: "حرکت به سمت مرکز با دیواره‌های نویزی",
    preset: { speed: 0.6, scale: 1.2, hue: 0.66, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  float r = length(p) + 0.0001;
  float a = atan(p.y, p.x);
  float z = 1.0 / r + t * 0.6;
  float wall = fbm(vec2(a * 2.4, z * 0.7));
  float rings = smoothstep(0.85, 1.0, fract(z * 1.3));
  vec3 col = tone(wall) * (0.18 + wall * 0.7);
  col += tone(wall + 0.4) * rings * 0.35;
  col *= smoothstep(0.05, 0.9, r);
  return col;
}`,
  },
  {
    id: "flow-silk",
    nameFa: "ابریشم روان",
    nameEn: "Flowing Silk",
    category: "noise",
    descFa: "رشته‌های ابریشمی که با میدان جریان حرکت می‌کنند",
    preset: { speed: 0.3, scale: 1.3, hue: 0.72, warp: 1.4 },
    scene: `
vec3 scene(vec2 p, float t) {
  vec2 q = p;
  for (int i = 0; i < 4; i++) {
    q += vec2(fbm(q * 1.1 + t * 0.1), fbm(q * 1.1 - t * 0.12 + 4.0)) * 0.6 * u_warp;
  }
  float lines = sin(q.y * 8.0 + q.x * 2.0 + t) * 0.5 + 0.5;
  lines = pow(lines, 5.0);
  vec3 col = vec3(0.015, 0.015, 0.02) + tone(lines * 0.7) * lines * 0.9;
  col += tone(lines + 0.3) * pow(lines, 4.0) * 0.5;
  return col;
}`,
  },
  {
    id: "holo-foil",
    nameFa: "فویل هولوگرافیک",
    nameEn: "Holo Foil",
    category: "gradient",
    descFa: "براقی رنگین‌کمانی مناسب کارت و دکمه",
    preset: { speed: 0.25, scale: 1.6, hue: 0.36, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  vec2 q = p * rot(0.6 + sin(t * 0.2) * 0.1);
  float bands = sin(q.x * 2.4 + q.y * 1.6 + t * 0.6) * 0.5 + 0.5;
  float sheen = pow(fbm(q * 1.4 + t * 0.15), 2.0);
  vec3 col = tone(bands * 0.8 + sheen * 0.3) * (0.28 + bands * 0.55);
  col += vec3(1.0) * pow(sheen, 8.0) * 0.5;
  col += tone(bands + 0.5) * pow(bands, 6.0) * 0.35;
  return col;
}`,
  },
  {
    id: "neon-rings",
    nameFa: "حلقه‌های نئون",
    nameEn: "Neon Rings",
    category: "geometric",
    descFa: "حلقه‌های تپنده با عمق میدان",
    preset: { speed: 0.55, scale: 1.8, hue: 0.52, warp: 1 },
    scene: `
vec3 scene(vec2 p, float t) {
  float r = length(p);
  float ring = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i) + 1.0;
    float radius = fi * 0.35 + sin(t * 0.8 + fi) * 0.06;
    ring += smoothstep(0.018, 0.0, abs(r - radius)) * (0.5 + 0.5 * sin(t * 2.0 + fi));
  }
  vec3 col = vec3(0.01, 0.01, 0.02) + tone(r * 0.4) * ring;
  col += tone(r * 0.4 + 0.3) * exp(-r * 2.2) * 0.18;
  return col;
}`,
  },
  {
    id: "spiral-noise",
    nameFa: "مارپیچ نویزی",
    nameEn: "Noise Spiral",
    category: "noise",
    descFa: "مارپیچ ارگانیک با اعوجاج نویز",
    preset: { speed: 0.4, scale: 1.4, hue: 0.62, warp: 1.3 },
    scene: `
vec3 scene(vec2 p, float t) {
  float r = length(p);
  float a = atan(p.y, p.x) + r * 2.2 - t * 0.9;
  float s = fbm(vec2(a * 1.6, r * 1.8 - t * 0.25));
  float bands = sin(a * 5.0 + s * 4.0) * 0.5 + 0.5;
  vec3 col = tone(bands * 0.7 + s * 0.4) * (0.2 + bands * 0.7);
  col += tone(bands) * pow(bands, 5.0) * 0.5;
  col *= smoothstep(2.0, 0.2, r);
  return col;
}`,
  },
];

export function shaderSource(def: ShaderDef) {
  return `${SHADER_PRELUDE}\n${def.scene}\n${FRAGMENT_MAIN}`;
}
