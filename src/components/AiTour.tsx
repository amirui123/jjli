import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Brain, Database, Layers, Sparkles, X } from "lucide-react";
import { cn, useMediaQuery } from "../ui/kit";
import { faNum } from "../lib/format";
import { ALL_AI_TRAINING_FILES } from "../data/engineFilesManifest";

const TOUR_KEY = "rtmlab.v1.ai-tour-seen";

interface Scene {
  id: string;
  icon: React.ElementType;
  kicker: string;
  titleFa: string;
  bodyFa: string;
}

const SCENES: Scene[] = [
  {
    id: "data",
    icon: Database,
    kicker: "۰۱ · داده",
    titleFa: "از کامپوننت واقعی، نه از متن ساختگی",
    bodyFa:
      "هر جفت آموزشی از یک فایل واقعی رجیستری ساخته شده: ویژگی‌ها، درخواست کاربر و پاسخ دستیار فارسی.",
  },
  {
    id: "prompt",
    icon: Layers,
    kicker: "۰۲ · قواعد",
    titleFa: "سیستم‌پرامپت، قانونِ ثابت مدل",
    bodyFa:
      "RTL منطقی، نیم‌فاصله، ارقام فارسی و انیمیشن روی GPU — همه به‌صورت قید صریح در پرامپت آمده‌اند.",
  },
  {
    id: "tune",
    icon: Brain,
    kicker: "۰۳ · آموزش",
    titleFa: "QLoRA سبک، خروجی قابل استفاده",
    bodyFa: `آداپتور روی مدل فریزشده آموزش می‌بیند و کیت کامل (${faNum(
      ALL_AI_TRAINING_FILES.length
    )} فایل) همان‌جا قابل دانلود است.`,
  },
];

const STEP_MS = 4600;

/** سه‌صحنه کوتاه که فقط بار اول ورود به بخش هوش مصنوعی پخش می‌شود. */
export const AiTour: React.FC = () => {
  const reduced = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const last = SCENES.length - 1;

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(TOUR_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    /* اگر معرفی اصلی سایت باز است، صبر کن تا بسته شود تا دو لایه روی هم نیفتند */
    let tries = 0;
    let timer = 0;
    const attempt = () => {
      const introOpen = Boolean(document.querySelector('[aria-label="معرفی سایت"]'));
      if (introOpen && tries < 12) {
        tries += 1;
        timer = window.setTimeout(attempt, 900);
        return;
      }
      setOpen(true);
    };
    timer = window.setTimeout(attempt, 500);
    return () => window.clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_KEY, "1");
    } catch {
      /* private mode */
    }
    setOpen(false);
  }, []);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(last, next));
      if (clamped === step) return;
      if (barRef.current) barRef.current.style.transform = "scaleX(0)";
      setStep(clamped);
    },
    [last, step]
  );

  useEffect(() => {
    if (!open || paused || reduced || step >= last) return;
    let frame = 0;
    let lastTick = performance.now();
    let elapsed = 0;
    const loop = (now: number) => {
      elapsed += now - lastTick;
      lastTick = now;
      const p = Math.min(elapsed / STEP_MS, 1);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (p >= 1) {
        go(step + 1);
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [open, paused, reduced, step, last, go]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(step + 1);
      if (e.key === "ArrowRight") go(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, go, step]);

  const active = SCENES[step];
  const Icon = active.icon;
  const isLast = step === last;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="معرفی بخش هوش مصنوعی"
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            initial={{ y: isMobile ? 40 : 18, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: isMobile ? 30 : 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={cn(
              "relative w-full overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0A0A0E]",
              isMobile ? "max-w-full" : "max-w-[860px]"
            )}
            style={{ boxShadow: "0 40px 120px -60px rgba(0,0,0,0.95)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(70% 90% at 90% 0%, rgba(var(--accent-glow),0.16), transparent 62%)",
              }}
            />
            <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[color:var(--accent)]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[12px] font-bold leading-tight text-zinc-100">استودیو هوش مصنوعی</p>
                  <p className="font-mono text-[8.5px] tracking-[0.16em] text-zinc-500">AI · QUICK TOUR</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPaused((v) => !v)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-[10.5px] text-zinc-400 hover:text-white"
                >
                  {paused ? "ادامه" : "توقف"}
                </button>
                <button
                  onClick={close}
                  aria-label="بستن معرفی"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className={cn("relative grid gap-4 p-4", isMobile ? "grid-cols-1" : "grid-cols-[220px_minmax(0,1fr)] p-6")}>
              {/* animated visual */}
              <div className="relative flex min-h-[130px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-[#08080C]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 grid-backdrop opacity-30"
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex flex-col items-center gap-2"
                  >
                    <motion.span
                      animate={reduced ? undefined : { y: [0, -6, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                      style={{ boxShadow: "0 0 40px -14px rgba(var(--accent-glow),0.9)" }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.span>
                    <div className="flex items-end gap-[3px]" aria-hidden>
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[3px] rounded-full bg-white/25"
                          animate={reduced ? undefined : { scaleY: [0.35, 1, 0.5] }}
                          transition={{
                            duration: 1 + (i % 3) * 0.25,
                            repeat: Infinity,
                            repeatType: "mirror",
                            delay: i * 0.05,
                          }}
                          style={{ height: 22 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* copy */}
              <div className="flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${active.id}-copy`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-[10px] tracking-[0.14em] text-[color:var(--accent)]">{active.kicker}</p>
                    <h3 className={cn("mt-1.5 font-bold leading-snug text-white", isMobile ? "text-[18px]" : "text-[22px]")}>
                      {active.titleFa}
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">{active.bodyFa}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    ref={barRef}
                    className="block h-full origin-right rounded-full bg-[color:var(--accent)]"
                    style={{ transform: "scaleX(0)" }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {SCENES.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => go(i)}
                        aria-label={s.titleFa}
                        aria-current={i === step ? "step" : undefined}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === step ? "w-5 bg-[color:var(--accent)]" : "w-1.5 bg-white/15"
                        )}
                      />
                    ))}
                  </div>
                  <button
                    onClick={close}
                    className="ms-auto rounded-lg px-2 py-1.5 text-[11px] text-zinc-500 hover:text-white"
                  >
                    رد کردن
                  </button>
                  <button
                    onClick={() => (isLast ? close() : go(step + 1))}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[color:var(--accent)] px-3.5 text-[11.5px] font-bold text-black"
                  >
                    {isLast ? "شروع کار" : "بعدی"}
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiTour;
