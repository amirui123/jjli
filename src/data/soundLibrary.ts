/**
 * دستی‌سازِ کتابخانه صدا — طراحی‌های لایه‌ای (نه فقط یک نوسان‌ساز).
 *
 * هر آیتم از تون‌ها، نویز رنگی، زنگ‌ها و آرپژها ساخته شده و از فیلتر،
 * پن استریو، LFO و ریورب عبور می‌کند. طول‌ها از ۸۰ میلی‌ثانیه تا ۲۰ ثانیه
 * است تا هم افکت‌های ریز رابط و هم فضاسازی‌های بلند سینمایی در دست باشد.
 */
import type { SoundDesign, SoundItem, SoundLayer } from "../engines/soundEngine";

type Opts = Partial<SoundDesign>;

const tone = (
  f: number | number[],
  dur: number,
  o: Omit<Extract<SoundLayer, { k: "tone" }>, "k" | "f" | "dur"> = {}
): SoundLayer => ({ k: "tone", f, dur, ...o });

const noise = (
  dur: number,
  o: Omit<Extract<SoundLayer, { k: "noise" }>, "k" | "dur"> = {}
): SoundLayer => ({ k: "noise", dur, ...o });

const bell = (
  f: number,
  dur: number,
  o: Omit<Extract<SoundLayer, { k: "bell" }>, "k" | "f" | "dur"> = {}
): SoundLayer => ({ k: "bell", f, dur, ...o });

const seq = (
  steps: { f: number; at: number; dur: number; gain?: number; type?: OscillatorType }[],
  o: Omit<Extract<SoundLayer, { k: "seq" }>, "k" | "steps"> = {}
): SoundLayer => ({ k: "seq", steps, ...o });

const s = (
  id: string,
  nameFa: string,
  category: SoundItem["category"],
  descFa: string,
  tags: string[],
  duration: number,
  layers: SoundLayer[],
  extra: Opts = {}
): SoundItem => ({
  id,
  nameFa,
  category,
  descFa,
  tags,
  duration: extra.duration ?? duration,
  design: { duration, layers, gain: 0.9, ...extra },
});

/* --------------------------------------------------------------------- UI */

const UI: SoundItem[] = [
  s("ui-tap", "ضربه نرم", "ui", "کلیک کوتاه و تمیز برای دکمه‌های اصلی", ["tap", "button"], 0.12, [
    tone(920, 0.09, { to: 700, gain: 0.18, partials: [{ m: 2, a: 0.2, d: 0.05 }] }),
    noise(0.03, { gain: 0.05, filter: { type: "highpass", f: 3200 } }),
  ]),
  s("ui-click-soft", "کلیک لطیف", "ui", "کلیک چوبی بسیار کوتاه، مناسب ناوبری", ["click"], 0.16, [
    tone(430, 0.12, { type: "triangle", gain: 0.2, to: 360, filter: { type: "lowpass", f: 2200 } }),
    noise(0.04, { color: "brown", gain: 0.04, filter: { type: "lowpass", f: 900 } }),
  ]),
  s("ui-pop", "پاپ", "ui", "بازشدن حباب‌وار منو و پاپ‌اور", ["pop", "menu"], 0.2, [
    tone(300, 0.16, { to: 880, gain: 0.2, release: 0.12 }),
    bell(1320, 0.12, { gain: 0.05 }),
  ]),
  s("ui-toggle-on", "سوییچ روشن", "ui", "دو نُت بالارونده برای روشن‌کردن", ["toggle"], 0.24, [
    seq([
      { f: 660, at: 0, dur: 0.1, gain: 0.18 },
      { f: 990, at: 0.07, dur: 0.14, gain: 0.16 },
    ]),
  ]),
  s("ui-toggle-off", "سوییچ خاموش", "ui", "دو نُت پایین‌رونده برای خاموش‌کردن", ["toggle"], 0.24, [
    seq([
      { f: 780, at: 0, dur: 0.1, gain: 0.16 },
      { f: 520, at: 0.07, dur: 0.14, gain: 0.14 },
    ]),
  ]),
  s("ui-hover", "هاور", "ui", "تیک بسیار ریز برای عبور ماوس", ["hover", "tick"], 0.08, [
    tone(1900, 0.05, { gain: 0.09, filter: { type: "highpass", f: 1200 } }),
  ]),
  s("ui-check", "تیک تأیید", "ui", "زنگ کوچک تأیید برای چک‌باکس", ["check"], 0.28, [
    bell(880, 0.26, { gain: 0.16, ratios: [[1, 1, 1], [2, 0.35, 0.6], [3.01, 0.12, 0.4]] }),
  ]),
  s("ui-coin", "سکه", "ui", "دو زنگ پشت‌سرهم، کلاسیک بازی", ["coin", "game"], 0.42, [
    seq([
      { f: 988, at: 0, dur: 0.09, gain: 0.2, type: "square" },
      { f: 1319, at: 0.08, dur: 0.2, gain: 0.16, type: "square" },
    ], { filter: { type: "lowpass", f: 4200 } }),
  ]),
  s("ui-page", "ورق‌زدن", "ui", "صدای کاغذ و ورق‌خوردن سند", ["paper"], 0.5, [
    noise(0.42, { color: "pink", gain: 0.11, attack: 0.02, filter: { type: "bandpass", f: 1800, to: 3200, q: 0.7 }, lfo: { rate: 9, depth: 0.4, target: "gain" } }),
  ]),
  s("ui-swipe", "سوایپ", "ui", "سوایپ کارت و اسلایدر", ["swipe", "gesture"], 0.34, [
    noise(0.28, { color: "pink", gain: 0.1, attack: 0.01, filter: { type: "highpass", f: 600, to: 3600 } }),
  ]),
  s("ui-open-panel", "بازشدن پنل", "ui", "کشیده‌شدن پنل کناری", ["panel"], 0.6, [
    noise(0.5, { color: "brown", gain: 0.08, attack: 0.06, filter: { type: "lowpass", f: 500, to: 1600 } }),
    tone(180, 0.45, { to: 320, type: "triangle", gain: 0.08 }),
  ]),
  s("ui-close-panel", "بستن پنل", "ui", "جمع‌شدن آرام پنل", ["panel"], 0.5, [
    noise(0.42, { color: "brown", gain: 0.07, filter: { type: "lowpass", f: 1600, to: 400 } }),
    tone(320, 0.4, { to: 170, type: "triangle", gain: 0.07 }),
  ]),
  s("ui-typing", "تایپ", "ui", "یک ضربه کیبورد مکانیکی", ["keyboard"], 0.1, [
    noise(0.05, { color: "white", gain: 0.09, filter: { type: "bandpass", f: 2400, q: 1.6 } }),
    tone(210, 0.06, { type: "triangle", gain: 0.07, to: 140 }),
  ]),
  s("ui-drag", "کشیدن", "ui", "هنگام درگ‌کردن یک آیتم", ["drag"], 0.2, [
    noise(0.16, { color: "pink", gain: 0.06, filter: { type: "bandpass", f: 1200, q: 1.4 } }),
  ]),
  s("ui-drop", "رهاکردن", "ui", "رهاکردن آیتم در مقصد", ["drop"], 0.3, [
    tone(240, 0.24, { to: 130, type: "triangle", gain: 0.18 }),
    noise(0.08, { color: "brown", gain: 0.06 }),
  ]),
  s("ui-copy", "کپی", "ui", "کپی‌شدن متن در کلیپ‌بورد", ["copy"], 0.26, [
    seq([
      { f: 1046, at: 0, dur: 0.08, gain: 0.14 },
      { f: 1568, at: 0.06, dur: 0.12, gain: 0.1 },
    ]),
  ]),
  s("ui-success", "موفقیت", "ui", "سه‌نُت صعودی برای انجام‌شدن کار", ["success"], 0.7, [
    seq([
      { f: 784, at: 0, dur: 0.16, gain: 0.18 },
      { f: 988, at: 0.1, dur: 0.18, gain: 0.17 },
      { f: 1319, at: 0.2, dur: 0.34, gain: 0.15 },
    ]),
  ], { reverb: { decay: 0.7, mix: 0.24 } }),
  s("ui-error", "خطا", "ui", "دو نُت نزولی تیره برای شکست", ["error"], 0.4, [
    seq([
      { f: 320, at: 0, dur: 0.14, gain: 0.16, type: "square" },
      { f: 220, at: 0.12, dur: 0.22, gain: 0.14, type: "square" },
    ], { filter: { type: "lowpass", f: 1400 } }),
  ]),
  s("ui-warning", "هشدار", "ui", "دو بوق کوتاه توجه", ["warning"], 0.55, [
    seq([
      { f: 880, at: 0, dur: 0.12, gain: 0.12, type: "square" },
      { f: 880, at: 0.2, dur: 0.12, gain: 0.12, type: "square" },
    ], { filter: { type: "lowpass", f: 2600 } }),
  ]),
  s("ui-notify", "اعلان", "ui", "زنگ اعلان با دنباله ریورب", ["notify"], 0.9, [
    bell(1320, 0.8, { gain: 0.16 }),
    bell(1980, 0.55, { gain: 0.06 }),
  ], { reverb: { decay: 0.9, mix: 0.3 } }),
];

/* ----------------------------------------------------------------- impact */

const IMPACT: SoundItem[] = [
  s("hit-sub-boom", "بوم ساب", "impact", "افت ساب‌بیس عمیق با ریورب بلند", ["boom", "sub"], 2.6, [
    tone(72, 2.2, { to: 26, type: "sine", gain: 0.5, attack: 0.004, release: 1.6 }),
    noise(0.5, { color: "brown", gain: 0.16, filter: { type: "lowpass", f: 260 } }),
  ], { reverb: { decay: 2.4, mix: 0.32 } }),
  s("hit-thud", "تاپ سنگین", "impact", "برخورد خشک و کوتاه", ["thud"], 0.5, [
    tone(120, 0.4, { to: 58, type: "triangle", gain: 0.34 }),
    noise(0.09, { color: "brown", gain: 0.14, filter: { type: "lowpass", f: 700 } }),
  ]),
  s("hit-anvil", "سندان", "impact", "فلز با هارمونیک‌های ناهماهنگ", ["metal"], 2.0, [
    bell(196, 1.9, { gain: 0.26, ratios: [[1, 1, 1], [2.76, 0.5, 0.8], [5.4, 0.25, 0.5], [8.93, 0.12, 0.35]] }),
    noise(0.06, { color: "white", gain: 0.1, filter: { type: "highpass", f: 1800 } }),
  ], { reverb: { decay: 1.8, mix: 0.3 } }),
  s("hit-wood", "چوب", "impact", "ضربه چوبی گرم", ["wood"], 0.35, [
    tone(240, 0.28, { to: 150, type: "triangle", gain: 0.3 }),
    tone(520, 0.14, { gain: 0.12, release: 0.1 }),
  ]),
  s("hit-glass", "شیشه", "impact", "شکستن شیشه با ذرات بالا", ["glass", "break"], 1.6, [
    noise(0.6, { color: "white", gain: 0.2, filter: { type: "highpass", f: 2600 } }),
    ...Array.from({ length: 6 }, (_, i) =>
      bell(1800 + i * 420, 0.5 + Math.random() * 0.5, { gain: 0.05, at: i * 0.035, pan: i % 2 ? 0.4 : -0.4 })
    ),
  ], { reverb: { decay: 1.2, mix: 0.26 } }),
  s("hit-punch", "مشت", "impact", "ضربه گوشتی با بدنه", ["punch"], 0.4, [
    tone(140, 0.28, { to: 60, gain: 0.36, type: "sine" }),
    noise(0.12, { color: "pink", gain: 0.16, filter: { type: "lowpass", f: 1600, to: 400 } }),
  ]),
  s("hit-kick-808", "کیک ۸۰۸", "impact", "کیک الکترونیک با افت طولانی", ["kick", "808"], 1.2, [
    tone(160, 1.05, { to: 44, gain: 0.5, type: "sine", attack: 0.002, release: 0.9 }),
    noise(0.03, { gain: 0.12, filter: { type: "highpass", f: 2500 } }),
  ]),
  s("hit-snare", "اسنر", "impact", "اسنر با بدنه و سیم", ["snare", "drum"], 0.5, [
    tone(190, 0.16, { to: 150, gain: 0.2, type: "triangle" }),
    noise(0.32, { color: "white", gain: 0.18, filter: { type: "bandpass", f: 1800, q: 0.7 } }),
  ]),
  s("hit-clap", "کلپ", "impact", "سه برخورد پشت‌سرهم دست", ["clap", "drum"], 0.6, [
    noise(0.05, { gain: 0.18, filter: { type: "bandpass", f: 1400, q: 1.2 } }),
    noise(0.05, { gain: 0.15, at: 0.024, filter: { type: "bandpass", f: 1600, q: 1.2 } }),
    noise(0.3, { gain: 0.12, at: 0.05, filter: { type: "bandpass", f: 1800, q: 0.9 } }),
  ], { reverb: { decay: 0.5, mix: 0.2 } }),
  s("hit-stone", "سنگ", "impact", "برخورد سنگین معدنی", ["stone"], 0.8, [
    tone(90, 0.6, { to: 44, type: "triangle", gain: 0.3 }),
    noise(0.2, { color: "brown", gain: 0.16, filter: { type: "lowpass", f: 1200, to: 300 } }),
  ]),
  s("hit-tom", "تام", "impact", "تام فرودست با پوست", ["tom", "drum"], 0.9, [
    tone(180, 0.7, { to: 98, gain: 0.34, type: "sine" }),
    noise(0.1, { color: "pink", gain: 0.08, filter: { type: "lowpass", f: 1400 } }),
  ]),
  s("hit-riser-drop", "رایزر و دراپ", "impact", "اوج‌گیری کوتاه و فرود سنگین", ["riser", "drop"], 2.4, [
    noise(1.6, { color: "pink", gain: 0.12, attack: 1.5, filter: { type: "highpass", f: 400, to: 6000 } }),
    tone(120, 0.9, { to: 40, gain: 0.42, at: 1.7, release: 0.7 }),
    noise(0.3, { color: "brown", gain: 0.12, at: 1.7 }),
  ], { reverb: { decay: 1.4, mix: 0.24 } }),
];

/* ------------------------------------------------------------------ sweeps */

const SWEEP: SoundItem[] = [
  s("sweep-riser-short", "رایزر کوتاه", "sweep", "یک‌ونیم ثانیه اوج‌گیری تمیز", ["riser"], 1.6, [
    noise(1.45, { color: "pink", gain: 0.13, attack: 1.3, filter: { type: "bandpass", f: 300, to: 6200, q: 1.4 } }),
    tone(180, 1.4, { to: 900, gain: 0.06, attack: 1.2, type: "triangle" }),
  ]),
  s("sweep-riser-long", "رایزر بلند", "sweep", "شش ثانیه تنش برای ویدیو و ترنزیشن", ["riser", "long"], 6.0, [
    noise(5.7, { color: "pink", gain: 0.14, attack: 5.2, filter: { type: "bandpass", f: 220, to: 7400, q: 1.8 } }),
    tone(110, 5.6, { to: 1400, gain: 0.07, attack: 5.2, lfo: { rate: 3.2, depth: 6, target: "pitch" } }),
  ], { reverb: { decay: 2.4, mix: 0.3 } }),
  s("sweep-downlifter", "داون‌لیفتر", "sweep", "افت سه‌ثانیه‌ای پس از دراپ", ["downlifter"], 3.0, [
    noise(2.8, { color: "pink", gain: 0.13, release: 2.4, filter: { type: "bandpass", f: 6000, to: 200, q: 1.6 } }),
    tone(900, 2.6, { to: 80, gain: 0.06, release: 2.2 }),
  ], { reverb: { decay: 1.8, mix: 0.26 } }),
  s("sweep-whoosh", "ووش", "sweep", "عبور سریع هوا از کنار گوش", ["whoosh"], 1.0, [
    noise(0.9, { color: "white", gain: 0.15, attack: 0.35, filter: { type: "bandpass", f: 400, to: 4200, q: 0.8 } }),
  ]),
  s("sweep-stereo", "سووش استریو", "sweep", "حرکت صدا از چپ به راست", ["pan", "whoosh"], 1.4, [
    noise(1.2, { color: "pink", gain: 0.11, attack: 0.4, pan: -0.8, filter: { type: "bandpass", f: 800, to: 2600, q: 0.9 } }),
    noise(1.2, { color: "pink", gain: 0.11, attack: 0.15, at: 0.2, pan: 0.8, filter: { type: "bandpass", f: 1200, to: 3200, q: 0.9 } }),
  ]),
  s("sweep-whip", "شلاق", "sweep", "ضربه هوایی تیز", ["whip"], 0.5, [
    noise(0.4, { color: "white", gain: 0.18, filter: { type: "highpass", f: 1200, to: 8000 } }),
    tone(700, 0.12, { to: 180, gain: 0.1, type: "triangle" }),
  ]),
  s("sweep-laser", "لیزر", "sweep", "زپ علمی‌تخیلی", ["laser", "sci-fi"], 0.5, [
    tone(2400, 0.36, { to: 240, gain: 0.16, type: "sawtooth", filter: { type: "lowpass", f: 4800, to: 900 } }),
  ]),
  s("sweep-power-up", "شارژ شدن", "sweep", "بالا رفتن انرژی تا کلیک نهایی", ["power"], 2.0, [
    tone(160, 1.7, { to: 1600, gain: 0.12, type: "sawtooth", filter: { type: "lowpass", f: 500, to: 6000 } }),
    bell(1800, 0.5, { at: 1.7, gain: 0.14 }),
  ], { reverb: { decay: 1.1, mix: 0.22 } }),
  s("sweep-scifi-pass", "عبور سفینه", "sweep", "پنج ثانیه عبور از کنار", ["sci-fi", "long"], 5.0, [
    noise(4.6, { color: "brown", gain: 0.16, attack: 2.0, release: 2.4, pan: -0.9, filter: { type: "lowpass", f: 300, to: 2200 } }),
    tone(90, 4.4, { to: 420, gain: 0.08, attack: 2.0, release: 2.0, type: "sawtooth", filter: { type: "lowpass", f: 900 } }),
    noise(4.6, { color: "brown", gain: 0.12, attack: 2.4, release: 2.0, pan: 0.9, filter: { type: "lowpass", f: 2400, to: 300 } }),
  ], { reverb: { decay: 2.6, mix: 0.3 } }),
  s("sweep-reverse-cymbal", "سنج معکوس", "sweep", "کرِسندوی معکوس پیش از ضربه", ["reverse", "cymbal"], 2.2, [
    noise(2.0, { color: "white", gain: 0.14, attack: 1.9, filter: { type: "highpass", f: 3000, to: 9000 } }),
  ], { reverb: { decay: 1.4, mix: 0.24 } }),
  s("sweep-teleport", "تلپورت", "sweep", "سه ثانیه فروپاشی و بازسازی", ["teleport"], 3.0, [
    tone(1200, 2.6, { to: 60, gain: 0.12, type: "sawtooth", filter: { type: "bandpass", f: 2400, to: 200, q: 2 } }),
    noise(2.4, { color: "white", gain: 0.1, attack: 0.3, filter: { type: "highpass", f: 2000, to: 400 } }),
    bell(2400, 1.2, { at: 2.2, gain: 0.09 }),
  ], { reverb: { decay: 2.0, mix: 0.3 } }),
  s("sweep-air-crack", "ترکش هوا", "sweep", "ترق تیز و کوتاه", ["crack"], 0.25, [
    noise(0.16, { color: "white", gain: 0.2, filter: { type: "bandpass", f: 5200, q: 0.6 } }),
  ]),
];

/* ------------------------------------------------- long ambient soundscapes */

const AIR: SoundItem[] = [
  s("air-warm-pad", "پد گرم", "air", "پد ۱۲ ثانیه‌ای برای پس‌زمینه رابط آرام", ["pad", "ambient", "long"], 12, [
    tone([110, 164.81, 220, 329.63], 11.4, { gain: 0.1, attack: 4.5, release: 5.5, type: "sawtooth", filter: { type: "lowpass", f: 700, q: 1.2 }, lfo: { rate: 0.12, depth: 220, target: "filter" } }),
    tone([55, 82.41], 11.8, { gain: 0.12, attack: 5, release: 5, type: "sine" }),
  ], { reverb: { decay: 3.4, mix: 0.45 } }),
  s("air-deep-drone", "درون عمیق", "air", "۱۶ ثانیه فرکانس پایین سینمایی", ["drone", "long"], 16, [
    tone([41.2, 61.7, 82.4], 15.4, { gain: 0.16, attack: 6, release: 6, type: "sine" }),
    tone(123.5, 14, { gain: 0.05, attack: 7, release: 5, type: "triangle", lfo: { rate: 0.08, depth: 0.4, target: "gain" } }),
    noise(15, { color: "brown", gain: 0.05, attack: 6, release: 6, filter: { type: "lowpass", f: 220 } }),
  ], { reverb: { decay: 4.2, mix: 0.4 } }),
  s("air-rain", "باران", "air", "۱۴ ثانیه باران یکنواخت با قطره‌های پراکنده", ["rain", "nature"], 14, [
    noise(13.5, { color: "pink", gain: 0.12, attack: 1.2, release: 3, filter: { type: "lowpass", f: 5200 } }),
    noise(13.5, { color: "white", gain: 0.045, attack: 1.4, release: 3, filter: { type: "highpass", f: 3000 }, lfo: { rate: 0.6, depth: 0.03, target: "gain" } }),
  ], { reverb: { decay: 2.2, mix: 0.25 } }),
  s("air-wind", "باد", "air", "۱۸ ثانیه باد با تلاطم آرام", ["wind", "nature", "long"], 18, [
    noise(17, { color: "brown", gain: 0.16, attack: 4, release: 5, filter: { type: "bandpass", f: 320, q: 0.6 }, lfo: { rate: 0.09, depth: 220, target: "filter" } }),
    noise(16, { color: "pink", gain: 0.05, attack: 6, release: 4, filter: { type: "bandpass", f: 1400, to: 900, q: 0.8 } }),
  ]),
  s("air-ocean", "موج دریا", "air", "۱۶ ثانیه دو موج پشت‌سرهم", ["ocean", "nature"], 16, [
    noise(6.5, { color: "pink", gain: 0.16, attack: 2.6, release: 3.6, filter: { type: "lowpass", f: 1400, to: 600 } }),
    noise(6.5, { color: "pink", gain: 0.14, attack: 2.8, at: 7.6, release: 3.4, filter: { type: "lowpass", f: 1200, to: 500 } }),
    noise(15, { color: "brown", gain: 0.05, attack: 3, release: 4, filter: { type: "lowpass", f: 420 } }),
  ], { reverb: { decay: 2.6, mix: 0.3 } }),
  s("air-forest", "جنگل شب", "air", "۱۴ ثانیه جنگل با جیرجیرک پراکنده", ["forest", "nature"], 14, [
    noise(13, { color: "brown", gain: 0.07, attack: 2, release: 3, filter: { type: "lowpass", f: 900 } }),
    tone(4200, 12, { gain: 0.012, at: 0.4, type: "sine", lfo: { rate: 14, depth: 0.01, target: "gain" } }),
    tone(5200, 10, { gain: 0.008, at: 3, lfo: { rate: 11, depth: 0.008, target: "gain" } }),
  ], { reverb: { decay: 2.4, mix: 0.35 } }),
  s("air-cafe", "کافه", "air", "۱۲ ثانیه همهمه و ظرف‌ها", ["cafe", "crowd"], 12, [
    noise(11.4, { color: "pink", gain: 0.08, attack: 1.6, release: 2.4, filter: { type: "bandpass", f: 700, q: 0.5 } }),
    ...Array.from({ length: 5 }, (_, i) =>
      bell(2200 + i * 300, 0.4, { gain: 0.02, at: 1.4 + i * 2.1, pan: i % 2 ? 0.5 : -0.5 })
    ),
  ], { reverb: { decay: 1.4, mix: 0.3 } }),
  s("air-vinyl", "صفحه گرام", "air", "۱۰ ثانیه خش‌خش و هیس آنالوگ", ["vinyl", "lofi"], 10, [
    noise(9.6, { color: "white", gain: 0.035, attack: 0.4, release: 1.4, filter: { type: "highpass", f: 1800 } }),
    noise(9.6, { color: "pink", gain: 0.02, attack: 0.6, release: 1.6, filter: { type: "bandpass", f: 4200, q: 2 } }),
  ]),
  s("air-starfield", "میدان ستاره", "air", "۱۴ ثانیه درخشش فضایی", ["space", "shimmer"], 14, [
    tone([523.25, 783.99, 1046.5], 13, { gain: 0.05, attack: 4, release: 5, type: "sine", lfo: { rate: 0.2, depth: 0.03, target: "gain" } }),
    ...Array.from({ length: 7 }, (_, i) =>
      bell(1200 + i * 420, 1.4, { gain: 0.025, at: 0.8 + i * 1.7, pan: -0.7 + (i % 3) * 0.7 })
    ),
  ], { reverb: { decay: 3.6, mix: 0.5 } }),
  s("air-singing-bowl", "کاسه تبتی", "air", "۲۰ ثانیه زنگ مدیتیشن با ضربان", ["bowl", "meditation", "long"], 20, [
    bell(220, 19, { gain: 0.2, ratios: [[1, 1, 1], [2.4, 0.35, 0.9], [3.7, 0.18, 0.7], [5.1, 0.08, 0.5]] }),
    tone(110, 18, { gain: 0.05, attack: 0.5, release: 9, type: "sine", lfo: { rate: 0.18, depth: 0.02, target: "gain" } }),
  ], { reverb: { decay: 4.5, mix: 0.45 } }),
  s("air-chimes", "باد‌زنگ", "air", "۱۵ ثانیه زنگ‌های پراکنده باغ", ["chimes"], 15, [
    ...Array.from({ length: 12 }, (_, i) =>
      bell([1046, 1318, 1568, 2093][i % 4], 1.6, { gain: 0.05, at: i * 1.2, pan: -0.8 + (i % 5) * 0.4 })
    ),
  ], { reverb: { decay: 3, mix: 0.42 } }),
  s("air-crickets", "جیرجیرک", "air", "۱۴ ثانیه شب تابستانی", ["nature"], 14, [
    tone(4600, 13, { gain: 0.02, attack: 1.5, release: 2, lfo: { rate: 22, depth: 0.02, target: "gain" } }),
    tone(3900, 12, { gain: 0.014, at: 2.2, lfo: { rate: 17, depth: 0.014, target: "gain" } }),
    noise(12.5, { color: "brown", gain: 0.04, attack: 2, release: 3, filter: { type: "lowpass", f: 500 } }),
  ]),
  s("air-subway", "مترو", "air", "۱۲ ثانیه رامبل تونل", ["urban"], 12, [
    noise(11.4, { color: "brown", gain: 0.18, attack: 2.4, release: 3, filter: { type: "lowpass", f: 260 }, lfo: { rate: 0.35, depth: 0.05, target: "gain" } }),
    tone(58, 11, { gain: 0.08, attack: 3, release: 3, type: "sine" }),
    noise(10, { color: "pink", gain: 0.03, at: 2, filter: { type: "bandpass", f: 2200, q: 3 } }),
  ]),
  s("air-heartbeat", "ضربان قلب", "air", "۹ ثانیه ضربان آرام و واقعی", ["heartbeat"], 9, [
    ...Array.from({ length: 8 }, (_, i) => [
      tone(58, 0.22, { gain: 0.42, at: i * 1.05, to: 38, type: "sine" }),
      tone(52, 0.18, { gain: 0.26, at: i * 1.05 + 0.28, to: 34, type: "sine" }),
    ]).flat(),
  ], { reverb: { decay: 0.8, mix: 0.14 } }),
];

/* --------------------------------------------------------- texture / music */

const TEXTURE: SoundItem[] = [
  s("mus-arp-up", "آرپژ صعودی", "texture", "آرپژ سریع برای بارگذاری", ["arp", "music"], 2.0, [
    seq(
      [523, 659, 784, 1046, 1318, 1568].map((f, i) => ({ f, at: i * 0.11, dur: 0.26, gain: 0.14 })),
      { filter: { type: "lowpass", f: 4200 } }
    ),
  ], { reverb: { decay: 1.4, mix: 0.3 } }),
  s("mus-arp-down", "آرپژ نزولی", "texture", "آرپژ نزولی برای بستن", ["arp"], 2.0, [
    seq(
      [1568, 1318, 1046, 784, 659, 523].map((f, i) => ({ f, at: i * 0.11, dur: 0.26, gain: 0.14 })),
      { filter: { type: "lowpass", f: 4200 } }
    ),
  ], { reverb: { decay: 1.4, mix: 0.3 } }),
  s("mus-pluck", "پلاک پناتونیک", "texture", "پلاک نرم با ریورب", ["pluck"], 1.6, [
    seq([523, 587, 698, 784, 880].map((f, i) => ({ f, at: i * 0.14, dur: 0.5, gain: 0.16, type: "triangle" as OscillatorType }))),
  ], { reverb: { decay: 1.8, mix: 0.36 } }),
  s("mus-marimba", "ماریمبا", "texture", "اجرای سریع ماریمبا", ["marimba"], 1.8, [
    seq([392, 523, 659, 784, 659, 523].map((f, i) => ({ f, at: i * 0.13, dur: 0.35, gain: 0.15, type: "sine" as OscillatorType }))),
  ], { reverb: { decay: 1.2, mix: 0.26 } }),
  s("mus-lofi-chord", "آکورد لوفای", "texture", "آکورد چهار ثانیه‌ای گرم با لرزش", ["lofi", "chord"], 4.0, [
    tone([220, 261.63, 329.63, 392], 3.6, { gain: 0.09, attack: 0.4, release: 1.6, type: "triangle", filter: { type: "lowpass", f: 1800 }, lfo: { rate: 0.8, depth: 0.02, target: "gain" } }),
    noise(3.4, { color: "pink", gain: 0.03, filter: { type: "lowpass", f: 3000 } }),
  ], { reverb: { decay: 2.2, mix: 0.4 } }),
  s("mus-cinematic-hit", "ضربه سینمایی", "texture", "ضربه ارکسترال با دنباله", ["cinematic"], 3.0, [
    tone([55, 82.4, 110], 2.6, { gain: 0.26, attack: 0.01, release: 2.2, type: "sawtooth", filter: { type: "lowpass", f: 800, to: 200 } }),
    noise(0.5, { color: "brown", gain: 0.14 }),
    bell(440, 2.4, { gain: 0.06 }),
  ], { reverb: { decay: 3, mix: 0.4 } }),
  s("mus-tension-pulse", "پالس تنش", "texture", "۱۰ ثانیه پالس ریتمیک برای انتظار", ["tension", "long"], 10, [
    seq(
      Array.from({ length: 16 }, (_, i) => ({ f: i % 4 === 0 ? 110 : 82, at: i * 0.5, dur: 0.24, gain: i % 4 === 0 ? 0.2 : 0.12, type: "sawtooth" as OscillatorType })),
      { filter: { type: "lowpass", f: 600 } }
    ),
    noise(9, { color: "brown", gain: 0.04, filter: { type: "lowpass", f: 300 } }),
  ], { reverb: { decay: 1.6, mix: 0.26 } }),
  s("mus-shimmer", "شیمِر", "texture", "آکورد شفاف شش ثانیه‌ای", ["shimmer", "pad"], 6.0, [
    tone([523.25, 783.99, 1046.5, 1568], 5.4, { gain: 0.06, attack: 1.6, release: 3, type: "sine", lfo: { rate: 0.3, depth: 0.03, target: "gain" } }),
  ], { reverb: { decay: 4, mix: 0.5 } }),
  s("mus-kalimba", "کالیمبا", "texture", "نُت‌های فلزی آرام", ["kalimba"], 2.4, [
    seq([659, 784, 880, 1046].map((f, i) => ({ f, at: i * 0.22, dur: 0.7, gain: 0.14 }))),
  ], { reverb: { decay: 1.8, mix: 0.34 } }),
  s("mus-box", "جعبه موسیقی", "texture", "جعبه موسیقی کودکانه", ["music-box"], 3.0, [
    seq([1046, 1318, 1568, 1318, 1046, 880].map((f, i) => ({ f, at: i * 0.28, dur: 0.6, gain: 0.12 }))),
  ], { reverb: { decay: 2, mix: 0.32 } }),
];

/* --------------------------------------------------------------- cinematic */

const CINEMATIC: SoundItem[] = [
  s("cine-braam", "برام", "cinematic", "برام غول‌آسای تریلر", ["trailer", "braam"], 3.5, [
    tone([41.2, 61.7, 82.4], 3.2, { gain: 0.3, attack: 0.06, release: 2.4, type: "sawtooth", filter: { type: "lowpass", f: 400, to: 120 } }),
    noise(0.6, { color: "brown", gain: 0.16 }),
  ], { reverb: { decay: 3.2, mix: 0.4 } }),
  s("cine-trailer-hit", "هیت تریلر", "cinematic", "ضربه + ریورب + ساب", ["trailer"], 4.0, [
    tone(70, 1.2, { to: 30, gain: 0.45, release: 1 }),
    noise(0.8, { color: "brown", gain: 0.18, filter: { type: "lowpass", f: 500 } }),
    bell(392, 3.4, { gain: 0.05 }),
  ], { reverb: { decay: 3.8, mix: 0.45 } }),
  s("cine-portal", "پرتال", "cinematic", "شش ثانیه بازشدن دروازه انرژی", ["portal", "long"], 6.0, [
    tone(180, 5.6, { to: 720, gain: 0.1, attack: 1.6, release: 2.4, type: "sawtooth", filter: { type: "bandpass", f: 400, to: 2400, q: 2 }, lfo: { rate: 0.5, depth: 0.03, target: "gain" } }),
    noise(5.4, { color: "pink", gain: 0.08, attack: 2, release: 2.4, filter: { type: "highpass", f: 500, to: 3200 } }),
    ...Array.from({ length: 5 }, (_, i) => bell(880 + i * 220, 1.2, { gain: 0.03, at: 1 + i * 0.9 })),
  ], { reverb: { decay: 3.4, mix: 0.5 } }),
  s("cine-glitch", "گلیچ", "cinematic", "خطای دیجیتال دو ثانیه‌ای", ["glitch", "digital"], 2.0, [
    seq(Array.from({ length: 14 }, (_, i) => ({ f: 400 + ((i * 373) % 1800), at: i * 0.13, dur: 0.05, gain: 0.12, type: "square" as OscillatorType }))),
    noise(1.8, { color: "white", gain: 0.05, filter: { type: "bandpass", f: 3000, q: 4 } }),
  ]),
  s("cine-data-stream", "جریان داده", "cinematic", "چهار ثانیه داده در حال عبور", ["data", "tech"], 4.0, [
    seq(Array.from({ length: 24 }, (_, i) => ({ f: 800 + ((i * 211) % 2400), at: i * 0.15, dur: 0.06, gain: 0.06 }))),
    tone(220, 3.6, { gain: 0.05, attack: 1, release: 1.4, type: "triangle", lfo: { rate: 4, depth: 0.02, target: "gain" } }),
  ], { reverb: { decay: 1.6, mix: 0.3 } }),
  s("cine-alarm", "آژیر", "cinematic", "شش ثانیه آژیر هشدار", ["alarm", "long"], 6.0, [
    tone(660, 5.6, { to: 990, gain: 0.12, type: "square", filter: { type: "lowpass", f: 2400 }, lfo: { rate: 1.6, depth: 180, target: "pitch" } }),
  ], { reverb: { decay: 1.8, mix: 0.24 } }),
  s("cine-door", "دروازه علمی", "cinematic", "بازشدن درِ فلزی هیدرولیک", ["door", "sci-fi"], 3.2, [
    noise(2.8, { color: "brown", gain: 0.14, attack: 0.4, release: 1.2, filter: { type: "lowpass", f: 700, to: 300 } }),
    tone(80, 2.4, { to: 55, gain: 0.14, type: "sawtooth", filter: { type: "lowpass", f: 400 } }),
    bell(320, 1.2, { at: 2.2, gain: 0.08 }),
  ], { reverb: { decay: 2.2, mix: 0.34 } }),
  s("cine-sonar", "سونار", "cinematic", "پینگ سونار با اکوی بلند", ["sonar", "ping"], 2.6, [
    bell(1200, 2.2, { gain: 0.14, ratios: [[1, 1, 1], [2, 0.2, 0.5]] }),
  ], { reverb: { decay: 3, mix: 0.5 } }),
  s("cine-riser-boom", "رایزر و انفجار", "cinematic", "پنج ثانیه تنش و انفجار", ["riser", "boom", "long"], 5.0, [
    noise(3.4, { color: "pink", gain: 0.14, attack: 3.2, filter: { type: "bandpass", f: 200, to: 6000, q: 1.6 } }),
    tone(60, 1.4, { to: 28, gain: 0.5, at: 3.4, release: 1.2 }),
    noise(0.7, { color: "brown", gain: 0.2, at: 3.4 }),
  ], { reverb: { decay: 3.4, mix: 0.42 } }),
];

/* ---------------------------------------------------------- notify / games */

const NOTIFY: SoundItem[] = [
  s("ntf-level-up", "ارتقای سطح", "notify", "فانفار کوتاه پیروزی", ["game", "win"], 1.4, [
    seq([
      { f: 659, at: 0, dur: 0.12, gain: 0.16 },
      { f: 784, at: 0.1, dur: 0.12, gain: 0.16 },
      { f: 1046, at: 0.2, dur: 0.12, gain: 0.16 },
      { f: 1318, at: 0.3, dur: 0.5, gain: 0.18 },
    ]),
  ], { reverb: { decay: 1.4, mix: 0.3 } }),
  s("ntf-quest", "پایان مأموریت", "notify", "آکورد سه‌نُتی کامل", ["complete"], 1.6, [
    tone([523.25, 659.25, 783.99], 1.4, { gain: 0.1, attack: 0.05, release: 1, type: "triangle" }),
    bell(1046.5, 0.8, { gain: 0.08, at: 0.1 }),
  ], { reverb: { decay: 1.8, mix: 0.32 } }),
  s("ntf-message", "پیام", "notify", "دو نُت دلنشین پیام‌رسان", ["message"], 0.9, [
    seq([
      { f: 880, at: 0, dur: 0.16, gain: 0.14 },
      { f: 1174, at: 0.12, dur: 0.3, gain: 0.12 },
    ]),
  ], { reverb: { decay: 0.9, mix: 0.24 } }),
  s("ntf-ringtone", "زنگ تماس", "notify", "چهار ثانیه رینگ‌تون ملودیک", ["ring"], 4.0, [
    seq(Array.from({ length: 8 }, (_, i) => ({ f: i % 2 ? 880 : 660, at: i * 0.45, dur: 0.32, gain: 0.1 }))),
  ], { reverb: { decay: 1.2, mix: 0.26 } }),
  s("ntf-power-down", "خاموش‌شدن", "notify", "افت نزولی سیستم", ["power"], 1.2, [
    tone(880, 1.0, { to: 110, gain: 0.14, type: "triangle", filter: { type: "lowpass", f: 3200, to: 400 } }),
  ]),
  s("ntf-double-beep", "بوق دوتایی", "notify", "دو بوق دقیق دیجیتال", ["beep"], 0.5, [
    seq([
      { f: 1200, at: 0, dur: 0.09, gain: 0.12, type: "square" },
      { f: 1200, at: 0.17, dur: 0.09, gain: 0.12, type: "square" },
    ], { filter: { type: "lowpass", f: 3000 } }),
  ]),
  s("ntf-coin-burst", "باران سکه", "notify", "شش سکه پشت‌سرهم", ["coin"], 1.4, [
    seq(Array.from({ length: 6 }, (_, i) => ({ f: 1046 + (i % 3) * 260, at: i * 0.14, dur: 0.16, gain: 0.12, type: "square" as OscillatorType }))),
  ]),
  s("ntf-error-buzz", "بازر خطا", "notify", "بازر تیز و آزاردهنده سیستمی", ["buzz", "error"], 0.8, [
    tone(120, 0.7, { gain: 0.16, type: "square", filter: { type: "lowpass", f: 900 }, lfo: { rate: 22, depth: 0.06, target: "gain" } }),
  ]),
];

export const DESIGNED_SOUNDS: SoundItem[] = [
  ...UI,
  ...IMPACT,
  ...SWEEP,
  ...AIR,
  ...TEXTURE,
  ...CINEMATIC,
  ...NOTIFY,
];

export const SOUND_CATEGORY_LABEL: Record<SoundItem["category"], string> = {
  ui: "رابط",
  impact: "برخورد",
  sweep: "سویپ",
  air: "فضا",
  texture: "موسیقی",
  cinematic: "سینمایی",
  notify: "اعلان",
};
