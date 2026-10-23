import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { TOOLKIT_STATS } from "../data/toolkitStats";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { SHADERS } from "../engines/shaderLab";
import { soundEngine } from "../engines/soundEngine";
import { useAppSettings } from "../lib/store";
import { faNum } from "../lib/format";
import { ShaderSurface } from "./ShaderSurface";
import { cn, useMediaQuery } from "../ui/kit";

/* ------------------------------------------------------------------ helpers */

const SOUNDS_TOTAL = TOOLKIT_STATS.sounds;
const FONTS_TOTAL = TOOLKIT_STATS.fonts;
const SHADERS_TOTAL = SHADERS.length;

const SPECIMEN_FONTS = ["iran-nastaliq", "hasti", "morabba", "kahroba", "darvish", "vazirmatn"]
  .map((id) => PERSIAN_FONT_CATALOG.find((f) => f.id === id))
  .filter((f): f is NonNullable<typeof f> => Boolean(f));

interface Step {
  id: string;
  tagFa: string;
  titleFa: string;
  bodyFa: string;
}

const STEPS: Step[] = [
  {
    id: "brand",
    tagFa: "شروع",
    titleFa: "یک زبان، چهار استودیو",
    bodyFa:
      "هر چیزی که برای رابط فارسی لازم داری — فونت، حرکت، صدا، شیدر و کد — در یک آزمایشگاه، بدون سرور و بدون ثبت‌نام.",
  },
  {
    id: "fonts",
    tagFa: "تایپوگرافی",
    titleFa: "فونت، لحنِ متن",
    bodyFa: `${faNum(FONTS_TOTAL)} خانواده فونت فارسی با فایل واقعی، پیش‌نمایش زنده و نمونه‌سازی مستقیم روی متن خودت.`,
  },
  {
    id: "motion",
    tagFa: "حرکت",
    titleFa: "حرکت با وزن، نه با تصادف",
    bodyFa:
      "منحنی‌های فنری، مدت‌زمان و فاصله‌ها را تنظیم کن؛ خروجی همان لحظه روی GPU اجرا می‌شود و کد آماده را می‌گیری.",
  },
  {
    id: "sound",
    tagFa: "صدا و شیدر",
    titleFa: `${faNum(SOUNDS_TOTAL)} صدا و ${faNum(SHADERS_TOTAL)} شیدر زنده`,
    bodyFa: `کتابخانه صدا از کلیک ۸۰ میلی‌ثانیه‌ای تا فضای ۲۰ ثانیه‌ای، به‌همراه ${faNum(SHADERS_TOTAL)} شیدر GLSL با سورس قابل دانلود.`,
  },
  {
    id: "enter",
    tagFa: "ورود",
    titleFa: "آماده‌ای؟",
    bodyFa:
      "از داشبورد شروع کن یا مستقیم سراغ استودیویی برو که به آن نیاز داری. هر چیز قابل دانلود است.",
  },
];

const DESKTOP_STEP_MS = 6200;
const MOBILE_STEP_MS = 5000;

/* ------------------------------------------------------------------- scenes */

const FontScene: React.FC<{ compact: boolean }> = ({ compact }) => {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % SPECIMEN_FONTS.length), compact ? 1500 : 1900);
    return () => window.clearInterval(t);
  }, [reduced, compact]);

  const font = SPECIMEN_FONTS[i];
  if (!font) return null;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 35%, rgba(var(--accent-glow),0.16), transparent 70%)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={font.id}
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-center"
          style={{ fontFamily: font.family }}
        >
          <div
            className={cn(
              "leading-[1.35] text-white",
              compact ? "text-[40px]" : "text-[68px]"
            )}
            style={{ textShadow: "0 12px 60px rgba(0,0,0,0.55)" }}
          >
            حرکت، زبانِ
            <br />
            رابطِ فارسی
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
        {SPECIMEN_FONTS.map((f, idx) => (
          <span
            key={f.id}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] transition-colors",
              idx === i
                ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                : "border-white/10 text-zinc-500"
            )}
          >
            {f.nameFa.split(" (")[0]}
          </span>
        ))}
      </div>
    </div>
  );
};

const MotionScene: React.FC<{ compact: boolean }> = ({ compact }) => {
  const reduced = useReducedMotion();
  const cards = useMemo(
    () => [
      { id: "spring", labelFa: "فنر", x: compact ? 0 : -70, delay: 0 },
      { id: "ease", labelFa: "ایز", x: 0, delay: 0.12 },
      { id: "io", labelFa: "ورود/خروج", x: compact ? 0 : 70, delay: 0.24 },
    ],
    [compact]
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 px-4">
      <div aria-hidden className="grid-backdrop pointer-events-none absolute inset-0 opacity-40" />
      <svg viewBox="0 0 240 90" className="relative h-[90px] w-full max-w-[260px]" fill="none">
        <motion.path
          d="M4 78 C 60 78, 62 12, 120 12 S 182 74, 236 14"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
        <motion.path
          d="M4 78 C 60 78, 62 12, 120 12 S 182 74, 236 14"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 1.6, ease: "easeInOut", repeat: reduced ? 0 : Infinity, repeatType: "reverse" }}
        />
      </svg>
      <div className={cn("relative flex items-center justify-center", compact ? "gap-2" : "gap-3")}>
        {cards.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, x: reduced ? 0 : [c.x, -c.x, c.x], y: 0 }}
            transition={{
              opacity: { duration: 0.4, delay: c.delay },
              y: { duration: 0.4, delay: c.delay },
              x: reduced
                ? { duration: 0 }
                : { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: c.delay },
            }}
            className={cn(
              "rounded-xl border border-white/10 bg-white/[0.04] text-center backdrop-blur",
              compact ? "px-3 py-2 text-[10px]" : "px-4 py-3 text-[11px]"
            )}
          >
            <span className="block font-mono text-[9px] text-zinc-500">motion</span>
            <span className="text-zinc-200">{c.labelFa}</span>
          </motion.div>
        ))}
      </div>
      <p className="relative font-mono text-[9.5px] tracking-wide text-zinc-500">
        transform · opacity · filter — ۶۰fps
      </p>
    </div>
  );
};

const SoundScene: React.FC<{ compact: boolean }> = ({ compact }) => {
  const reduced = useReducedMotion();
  const { settings } = useAppSettings();
  const bars = compact ? 20 : 32;
  const heights = useMemo(
    () => Array.from({ length: bars }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7)) * 0.75),
    [bars]
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 px-4">
      <div className="flex h-[92px] items-center justify-center gap-[3px]" aria-hidden>
        {heights.map((h, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: `${h * 100}%`,
              background:
                i % 4 === 0 ? "var(--accent)" : "rgba(255,255,255,0.28)",
            }}
            animate={reduced ? undefined : { scaleY: [0.55, 1, 0.7] }}
            transition={{
              duration: 1.1 + (i % 5) * 0.12,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: (i % 9) * 0.05,
            }}
          />
        ))}
      </div>
      <button
        onClick={() => {
          if (!settings.sound) return;
          try {
            soundEngine.playSuccess();
          } catch {
            /* audio blocked until first gesture — ignore */
          }
        }}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 text-[11.5px] text-zinc-200 transition-colors hover:border-white/25"
      >
        <Volume2 className="h-3.5 w-3.5 text-[color:var(--accent)]" />
        پخش یک نمونه
      </button>
      <p className="font-mono text-[9.5px] tracking-wide text-zinc-500">
        {faNum(SOUNDS_TOTAL)} رسیپی · WAV · {faNum(SHADERS_TOTAL)} شیدر GLSL
      </p>
    </div>
  );
};

const ShaderScene: React.FC<{ compact: boolean }> = ({ compact }) => {
  const def = SHADERS[0];
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!failed && def ? (
        <ShaderSurface
          def={def}
          speed={0.5}
          scale={1.1}
          hue={0.4}
          warp={1.1}
          grain={0.35}
          interactive
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <div className="absolute inset-0 aurora-fallback" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/45 p-3 backdrop-blur-md",
          compact && "p-2.5"
        )}
      >
        <div className="flex items-center justify-between gap-2 font-mono text-[9.5px] text-zinc-400">
          <span className="text-[color:var(--accent)]">{def?.nameEn ?? "mesh-aurora"}.frag</span>
          <span>{faNum(SHADERS_TOTAL)} شیدر · LIVE</span>
        </div>
        <pre className="mt-1.5 overflow-hidden text-[9px] leading-relaxed text-zinc-500">
{`uniform float u_time;   // زمان
uniform vec3  u_accent;  // رنگ پلتفرم
void main() { gl_FragColor = aurora(); }`}
        </pre>
      </div>
    </div>
  );
};

const BrandScene: React.FC<{ compact: boolean }> = ({ compact }) => {
  const words = ["حرکت", "زبانِ", "رابطِ", "فارسی", "است"];
  const reduced = useReducedMotion();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 40%, rgba(var(--accent-glow),0.18), transparent 72%)",
        }}
      />
      <div className={cn("relative flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1", compact ? "text-[30px]" : "text-[52px]")}>
        {words.map((w, i) => (
          <motion.span
            key={w}
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: reduced ? 0 : 0.12 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "leading-tight",
              i === 4 ? "text-[color:var(--accent)]" : "text-white"
            )}
          >
            {w}
          </motion.span>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 0.75, duration: 0.6 }}
        className="relative mt-4 flex flex-wrap items-center justify-center gap-2 text-[10.5px] text-zinc-400"
      >
        <span className="rounded-full border border-white/10 px-2 py-1">
          {faNum(FONTS_TOTAL)} فونت
        </span>
        <span className="rounded-full border border-white/10 px-2 py-1">
          {faNum(SOUNDS_TOTAL)} صدا
        </span>
        <span className="rounded-full border border-white/10 px-2 py-1">
          {faNum(SHADERS_TOTAL)} شیدر
        </span>
        <span className="rounded-full border border-white/10 px-2 py-1">
          {faNum(TOOLKIT_STATS.components)} کامپوننت
        </span>
      </motion.div>
    </div>
  );
};

const Scene: React.FC<{ id: string; compact: boolean }> = ({ id, compact }) => {
  if (id === "brand") return <BrandScene compact={compact} />;
  if (id === "fonts") return <FontScene compact={compact} />;
  if (id === "motion") return <MotionScene compact={compact} />;
  if (id === "sound") return <SoundScene compact={compact} />;
  return <ShaderScene compact={compact} />;
};

/* -------------------------------------------------------------------- film */

interface IntroFilmProps {
  onClose: (reason: "skip" | "finish") => void;
}

const IntroFilm: React.FC<IntroFilmProps> = ({ onClose }) => {
  const reduced = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { settings } = useAppSettings();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const last = STEPS.length - 1;

  const go = useCallback(
    (next: number, direction: 1 | -1 = 1) => {
      const clamped = Math.max(0, Math.min(last, next));
      if (clamped === step) return;
      if (settings.sound) {
        try {
          if (direction > 0) soundEngine.playTick(1.1);
          else soundEngine.playTick(0.85);
        } catch {
          /* ignore */
        }
      }
      if (barRef.current) barRef.current.style.transform = "scaleX(0)";
      setStep(clamped);
    },
    [last, step, settings.sound]
  );

  // auto-advance clock — one rAF loop, never more than one at a time
  useEffect(() => {
    if (paused || reduced || step >= last) return;
    const duration = isMobile ? MOBILE_STEP_MS : DESKTOP_STEP_MS;
    let frame = 0;
    let lastTick = performance.now();
    let elapsed = 0;
    const loop = (now: number) => {
      elapsed += now - lastTick;
      lastTick = now;
      const p = Math.min(elapsed / duration, 1);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (p >= 1) {
        go(step + 1);
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [step, paused, reduced, isMobile, last, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose("skip");
      if (e.key === "ArrowLeft") go(step + 1);
      if (e.key === "ArrowRight") go(step - 1);
      if (e.key === " ") {
        e.preventDefault();
        setPaused((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, step]);

  const active = STEPS[step];
  const isLast = step === last;

  const header = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"
          style={{ boxShadow: "0 0 26px -10px rgba(var(--accent-glow),0.9)" }}
        >
          <span className="font-hasti text-[15px] leading-none text-[color:var(--accent)]">م</span>
        </span>
        <div>
          <p className="text-[12px] font-bold leading-tight text-zinc-100">آزمایشگاه موشن فارسی</p>
          <p className="font-mono text-[9px] tracking-[0.18em] text-zinc-500">INTRO · RTL MOTION LAB</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPaused((v) => !v)}
          aria-label={paused ? "ادامه معرفی" : "توقف معرفی"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => onClose("skip")}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[11px] text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          رد کردن
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="معرفی سایت"
        className="fixed inset-0 z-[120] flex flex-col bg-[#050507] text-zinc-200"
      >
        <div className="px-4 pb-2" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>{header}</div>

        <div className="flex items-center justify-center gap-1.5 px-4">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i, i > step ? 1 : -1)}
              aria-label={s.titleFa}
              aria-current={i === step ? "step" : undefined}
              className="flex h-6 items-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-7 bg-[color:var(--accent)]"
                    : i < step
                    ? "w-1.5 bg-[color:var(--accent)]/55"
                    : "w-1.5 bg-white/15"
                )}
              />
            </button>
          ))}
        </div>

        <motion.div
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -60) go(step + 1);
            else if (info.offset.x > 60) go(step - 1, -1);
          }}
          className="relative mx-4 mt-3 min-h-[230px] flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0D]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0"
            >
              <Scene id={active.id} compact />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="space-y-3 px-4 pb-4 pt-3">
          <div className="flex items-center gap-2 text-[10px] text-[color:var(--accent)]">
            <Sparkles className="h-3 w-3" />
            {active.tagFa}
            <span className="ms-auto font-mono text-[9.5px] text-zinc-500">
              {faNum(step + 1)} / {faNum(STEPS.length)}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active.id}-copy`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="text-[19px] font-bold leading-snug text-white">{active.titleFa}</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{active.bodyFa}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go(step - 1, -1)}
              disabled={step === 0}
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 text-[12px] text-zinc-300 disabled:opacity-35"
            >
              <ArrowRight className="h-4 w-4" />
              قبلی
            </button>
            <button
              onClick={() => (isLast ? onClose("finish") : go(step + 1))}
              className="flex h-12 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-[color:var(--accent)] text-[12.5px] font-bold text-black"
            >
              {isLast ? "ورود به آزمایشگاه" : "بعدی"}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="معرفی سایت"
      className="fixed inset-0 z-[120] overflow-hidden bg-[#050507] text-zinc-200"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(80% 60% at 80% 0%, rgba(var(--accent-glow),0.10), transparent 62%), radial-gradient(60% 50% at 0% 100%, rgba(var(--accent-glow),0.06), transparent 65%)",
        }}
      />
      <div className="relative mx-auto flex h-full max-w-[1280px] flex-col px-8 py-6">
        {header}

        <div className="mt-6 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#08080B]">
            <div aria-hidden className="grid-backdrop pointer-events-none absolute inset-0 opacity-30" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Scene id={active.id} compact={false} />
              </motion.div>
            </AnimatePresence>
            <span className="absolute start-4 top-4 font-mono text-[9.5px] tracking-[0.2em] text-zinc-500">
              SCENE {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </span>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="flex-1 overflow-y-auto pe-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-copy`}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  transition={{ duration: 0.28 }}
                >
                  <p className="flex items-center gap-2 text-[10.5px] text-[color:var(--accent)]">
                    <Sparkles className="h-3 w-3" />
                    {active.tagFa}
                  </p>
                  <h2 className="mt-2 text-[30px] font-bold leading-tight text-white">{active.titleFa}</h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">{active.bodyFa}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-7 space-y-1">
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => go(i, i > step ? 1 : -1)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors",
                      i === step ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[9px]",
                        i < step
                          ? "border-[color:var(--accent)]/45 bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                          : i === step
                          ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                          : "border-white/12 text-zinc-500"
                      )}
                    >
                      {i < step ? "✓" : faNum(i + 1)}
                    </span>
                    <span
                      className={cn(
                        "text-[12px]",
                        i === step ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    >
                      {s.titleFa}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <span
                  ref={barRef}
                  className="block h-full origin-right rounded-full bg-[color:var(--accent)]"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onClose("skip")}
                  className="h-11 rounded-xl border border-white/10 px-3 text-[12px] text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
                >
                  رد کردن
                </button>
                <button
                  onClick={() => go(step - 1, -1)}
                  disabled={step === 0}
                  aria-label="صحنه قبلی"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-300 disabled:opacity-30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => (isLast ? onClose("finish") : go(step + 1))}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] text-[12.5px] font-bold text-black"
                >
                  {isLast ? "ورود به آزمایشگاه" : "صحنه بعد"}
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------- host */

const SEEN_KEY = "rtmlab.v1.intro-seen";

/**
 * پیش‌معرفی سایت: یک فیلم کوتاه پنج‌صحنه‌ای که فقط بار اول پخش می‌شود و
 * هر وقت کاربر خواست از نوار بالا (`rtmlab:open-intro`) دوباره باز می‌شود.
 * دو نسخه مستقل دارد: دسکتاپ (صحنه بزرگ + ریل صحنه‌ها) و موبایل (کارت عمودی).
 */
export const IntroHost: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen) {
      const t = window.setTimeout(() => setOpen(true), 700);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const openFilm = () => setOpen(true);
    window.addEventListener("rtmlab:open-intro", openFilm);
    return () => window.removeEventListener("rtmlab:open-intro", openFilm);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = useCallback(() => {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode — show it again next time */
    }
    setOpen(false);
  }, []);

  return (
    <AnimatePresence>
      {open && <IntroFilm key="intro-film" onClose={close} />}
    </AnimatePresence>
  );
};

export default IntroHost;
