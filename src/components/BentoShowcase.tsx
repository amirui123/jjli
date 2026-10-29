import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";
import {
  Sparkles,
  CreditCard,
  Type,
  Compass,
  ShieldCheck,
  Calendar,
  Sliders,
  Check,
  Wand2,
  Cpu,
  Volume2,
  Layers,
  Terminal,
} from "lucide-react";
import {
  IRANIAN_BANKS,
  detectIranianBank,
  formatCardNumberFa,
  validateShetabLuhn,
  toPersianDigits,
  splitPersianWordsSafe,
  auditRtlMotionCode,
  StudioPhysicsConfig,
  ACCENT_PALETTES,
} from "../engines/persianEngines";
import { soundEngine } from "../engines/soundEngine";
import { InteractiveCobeGlobe, SiriShaderOrb } from "./InteractiveShaders";

/* ============================================================================
   1. Interactive 3D Holographic Iranian Bank Card Widget
   ============================================================================ */
export const Iranian3DBankCardWidget: React.FC<{
  physics?: StudioPhysicsConfig;
  compact?: boolean;
}> = ({ physics, compact = false }) => {
  const [cardInput, setCardInput] = useState("6219861940285519");
  const bank = detectIranianBank(cardInput);
  const isValidLuhn = validateShetabLuhn(cardInput);
  const dir = physics?.dir ?? "rtl";
  const rtlSign = dir === "rtl" ? -1 : 1;
  const maxTilt = physics?.tiltAngle ?? 14;
  const stiffness = physics?.stiffness ?? 260;
  const damping = physics?.damping ?? 22;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt * rtlSign, maxTilt * rtlSign]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div style={{ perspective: 1100 }} className="w-full max-w-[350px]">
        <motion.div
          dir={dir}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={{ scale: physics?.scale ?? 1.02 }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            x.set((e.clientX - rect.left) / rect.width - 0.5);
            y.set((e.clientY - rect.top) / rect.height - 0.5);
          }}
          onPointerLeave={() => {
            x.set(0);
            y.set(0);
          }}
          className={`relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br ${bank.gradient} p-5 text-white shadow-2xl select-none`}
        >
          <div className="holographic-foil pointer-events-none absolute inset-0 opacity-65" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: bank.accentHex }}
              />
              <span className="text-sm font-bold tracking-normal">{bank.nameFa}</span>
            </div>
            <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-0.5 text-[10px] text-zinc-200 backdrop-blur-md">
              {bank.badgeText}
            </span>
          </div>

          {/* EMV Chip + Contactless */}
          <div className="relative z-10 mt-4 flex items-center justify-between">
            <div className="h-7 w-10 rounded-md border border-amber-300/40 bg-gradient-to-tr from-amber-500/40 to-yellow-200/30 shadow-inner" />
            <span className="font-mono text-[10px] text-zinc-400">
              IR-{bank.shebaCode} • SHETAB 3D
            </span>
          </div>

          {/* Card Number */}
          <div
            dir="ltr"
            className="relative z-10 my-4 text-center font-mono text-lg font-bold tracking-wider text-white drop-shadow"
          >
            {formatCardNumberFa(cardInput)}
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-zinc-300">
            <span>دارنده: امیرحسین رضایی</span>
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  isValidLuhn
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {isValidLuhn ? "Luhn معتبر" : "تست BIN"}
              </span>
              <span>۰۸/۱۴۰۸</span>
            </div>
          </div>
        </motion.div>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {IRANIAN_BANKS.slice(0, 5).map((b) => (
            <button
              key={b.id}
              onClick={() => {
                soundEngine.playSnap();
                setCardInput(b.bins[0].padEnd(16, "4"));
              }}
              className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${
                bank.id === b.id
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 bg-zinc-900/80 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {b.nameFa}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   2. Persian Kinetic Typography & Special Fonts Widget (Hasti, Nastaliq, Kahroba)
   ============================================================================ */
export const PersianKineticTypographyWidget: React.FC<{
  physics?: StudioPhysicsConfig;
  compact?: boolean;
}> = ({ physics, compact = false }) => {
  const [selectedFont, setSelectedFont] = useState<string>(physics?.fontFamily || "font-hasti");
  const [replayKey, setReplayKey] = useState(0);

  const fontOptions = [
    { id: "font-hasti", label: "هستی (Hasti)", sample: "هنر مهندسی موشن و تایپوگرافی اصیل ایرانی" },
    {
      id: "font-nastaliq",
      label: "نستعلیق (Nastaliq)",
      sample: "چو ایران نباشد تن من مباد • آزمایشگاه موشن",
    },
    {
      id: "font-kahroba",
      label: "کهربا متغیر (Kahroba)",
      sample: "فیزیک فنری ۶۰ فریم بدون شکستن نیم‌فاصله‌ها",
    },
    {
      id: "font-morabba",
      label: "مربع (Morabba)",
      sample: "سیستم طراحی تاریک و مهندسی در تراز جهانی",
    },
    { id: "font-peyda", label: "پیدا (Peyda)", sample: "رابط کاربری مدرن و راست‌به‌چپ نسل جدید" },
    {
      id: "font-yekanbakh",
      label: "یکان‌بخ (YekanBakh)",
      sample: "تایپوگرافی دقیق برای داشبوردهای فین‌تک و هوش مصنوعی",
    },
  ];

  const activeFontObj =
    fontOptions.find((f) => f.id === (physics?.fontFamily || selectedFont)) || fontOptions[0];
  const words = splitPersianWordsSafe(activeFontObj.sample);

  return (
    <div className="flex w-full flex-col justify-between gap-4">
      {!compact && (
        <div className="flex flex-wrap items-center gap-1.5">
          {fontOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundEngine.playSnap();
                setSelectedFont(f.id);
                setReplayKey((k) => k + 1);
              }}
              className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${
                activeFontObj.id === f.id
                  ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-200"
                  : "border-white/10 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        key={replayKey}
        onClick={() => {
          soundEngine.playSpring();
          setReplayKey((k) => k + 1);
        }}
        title="برای تکرار انیمیشن کلیک کنید"
        aria-label="پخش دوباره انیمیشن نمونه"
        className="flex min-h-[108px] w-full cursor-pointer flex-wrap items-center justify-center gap-x-2.5 gap-y-2 rounded-xl border border-white/10 bg-zinc-950/90 px-4 py-5 text-center"
      >
        {words.map((word, idx) => (
          <motion.span
            key={`${replayKey}-${idx}`}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)", scale: 0.92 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{
              type: "spring",
              stiffness: physics?.stiffness ?? 260,
              damping: physics?.damping ?? 20,
              mass: physics?.mass ?? 0.8,
              delay: idx * 0.06,
            }}
            whileHover={{
              scale: 1.12,
              color: "#38BDF8",
            }}
            className={`${activeFontObj.id} inline-block text-xl sm:text-2xl font-bold text-zinc-100 select-none`}
          >
            {word}
          </motion.span>
        ))}
      </button>

      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>حفظ ۱۰۰٪ اتصال حروف و نیم‌فاصله (ZWNJ-Safe)</span>
        <span className="text-cyan-400">کلیک روی متن = تکرار موج فنری</span>
      </div>
    </div>
  );
};

/* ============================================================================
   3. Gaussian 60fps RTL Magnetic Dock Widget
   ============================================================================ */
export const MagneticRtlDockWidget: React.FC<{
  physics?: StudioPhysicsConfig;
}> = ({ physics }) => {
  const mouseX = useMotionValue(Infinity);
  const [activeDockItem, setActiveDockItem] = useState("استودیو فیزیک");

  const items = [
    { label: "ویترین", icon: Compass, badge: "۶۰fps" },
    { label: "فونت هستی", icon: Type, badge: "۴۰ فونت" },
    { label: "استودیو فیزیک", icon: Sliders, badge: "AST" },
    { label: "شیدر WebGL", icon: Layers, badge: "OGL" },
    { label: "صداهای تعاملی", icon: Volume2, badge: "۲۰۰+" },
    { label: "هوش مصنوعی", icon: Cpu, badge: "QLoRA" },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="rounded-full border border-white/10 bg-zinc-900/90 px-3 py-1 text-[11px] text-cyan-300">
        آیتم فعال: <span className="font-bold text-white">{activeDockItem}</span>
      </div>
      <motion.div
        dir={physics?.dir ?? "rtl"}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex h-16 items-end gap-2.5 rounded-2xl border border-white/15 bg-zinc-900/85 px-4 pb-2.5 shadow-2xl backdrop-blur-xl"
      >
        {items.map((item) => (
          <DockItemButton
            key={item.label}
            mouseX={mouseX}
            label={item.label}
            badge={item.badge}
            Icon={item.icon}
            stiffness={physics?.stiffness ?? 280}
            damping={physics?.damping ?? 20}
            onSelect={() => {
              soundEngine.playThock();
              setActiveDockItem(item.label);
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

const DockItemButton: React.FC<{
  mouseX: MotionValue<number>;
  label: string;
  badge: string;
  Icon: React.ElementType;
  stiffness: number;
  damping: number;
  onSelect: () => void;
}> = ({ mouseX, label, Icon, stiffness, damping, onSelect }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  const sizeTransform = useTransform(distance, [-120, 0, 120], [42, 64, 42]);
  const size = useSpring(sizeTransform, { stiffness, damping });

  return (
    <motion.button
      ref={ref}
      onClick={onSelect}
      style={{ width: size, height: size }}
      title={label}
      className="group relative flex items-center justify-center rounded-xl border border-white/15 bg-gradient-to-b from-zinc-800 to-zinc-950 text-zinc-100 shadow-lg transition-colors hover:border-cyan-400/50 hover:text-cyan-300"
    >
      <Icon className="h-5 w-5" />
      <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md border border-white/10 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-200 opacity-0 shadow transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </motion.button>
  );
};

/* ============================================================================
   4. Morphing Dynamic Island & Siri Shader Orb Widget
   ============================================================================ */
export const DynamicIslandWidget: React.FC<{
  physics?: StudioPhysicsConfig;
}> = ({ physics }) => {
  const [mode, setMode] = useState<"ai" | "payment" | "shader">("ai");

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex items-center gap-1.5">
        {[
          { id: "ai", label: "دستیار صوتی AI" },
          { id: "payment", label: "تراکنش شاپرک" },
          { id: "shader", label: "تله‌متری ۶۰fps" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundEngine.playSpring();
              setMode(tab.id as "ai" | "payment" | "shader");
            }}
            className={`rounded-lg border px-2.5 py-1 text-[11px] transition ${
              mode === tab.id
                ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                : "border-white/10 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        layout
        dir={physics?.dir ?? "rtl"}
        transition={{
          type: "spring",
          stiffness: physics?.stiffness ?? 280,
          damping: physics?.damping ?? 22,
        }}
        className="w-full max-w-[330px] overflow-hidden rounded-[26px] border border-white/15 bg-black p-4 text-white shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {mode === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="flex items-center gap-3.5"
            >
              <div className="scale-75 -my-3">
                <SiriShaderOrb active />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">معمار هوش مصنوعی RTL</span>
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300">
                    زنده
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  در حال سنتز کامپوننت ۶۰ فریم با فونت هستی و منطق راست‌به‌چپ...
                </p>
              </div>
            </motion.div>
          )}

          {mode === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">واریز آنی پایا تایید شد</p>
                  <p className="text-[11px] text-zinc-400">بلوبانک سامان • کد پیگیری ۴۸۲۹۱۰</p>
                </div>
              </div>
              <span className="font-bold text-sm text-emerald-400">+۲۴,۵۰۰,۰۰۰ ت</span>
            </motion.div>
          )}

          {mode === "shader" && (
            <motion.div
              key="shader"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-indigo-300">موتور شیدر OGL + GPU Compositor</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  بودجه فریم: ۱۶.۶ms • بدون Layout Shift
                </p>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 font-mono text-xs font-bold text-indigo-300">
                ۶۰.۰ FPS
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* ============================================================================
   5. Live RTL & 60fps Code Bug Hunter Widget
   ============================================================================ */
export const RtlMotionBugHunterWidget: React.FC = () => {
  const brokenSample = `<motion.div
  className="ml-4 pr-6 left-2 text-left tracking-widest"
  animate={{ left: 120 }}
>
  {persianTitle.split("").map((ch, i) => (
    <span key={i}>{ch}</span>
  ))}
</motion.div>`;

  const [code, setCode] = useState(brokenSample);
  const [isFixed, setIsFixed] = useState(false);
  const audit = auditRtlMotionCode(code);

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              audit.issues.length === 0
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {audit.issues.length === 0
              ? "۱۰۰٪ استاندارد RTL و 60fps"
              : `${toPersianDigits(audit.issues.length)} باگ مرگبار شناسایی شد`}
          </span>
        </div>
        <button
          onClick={() => {
            if (isFixed) {
              soundEngine.playSnap();
              setCode(brokenSample);
              setIsFixed(false);
            } else {
              soundEngine.playSuccess();
              setCode(audit.fixedCode);
              setIsFixed(true);
            }
          }}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-500/25"
        >
          <Wand2 className="h-3.5 w-3.5" />
          <span>{isFixed ? "بازگردانی کد معیوب" : "اصلاح خودکار با ۱ کلیک"}</span>
        </button>
      </div>

      <pre
        dir="ltr"
        className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-200"
      >
        <code>{code}</code>
      </pre>

      <div className="space-y-1">
        {audit.issues.slice(0, 2).map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-200"
          >
            <span className="truncate">{issue.titleFa}</span>
            <span className="font-mono text-[10px] text-rose-300">{issue.match}</span>
          </div>
        ))}
        {audit.issues.length === 0 && (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
            ✓ تمام کلاس‌ها به Logical CSS تبدیل شدند و اتصال حروف فارسی حفظ شد!
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   6. Animated Jalali (Shamsi) Spring Calendar Widget
   ============================================================================ */
export const JalaliCalendarWidget: React.FC<{
  physics?: StudioPhysicsConfig;
}> = ({ physics }) => {
  const [selectedDay, setSelectedDay] = useState(22);
  const daysHeader = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  return (
    <div
      dir={physics?.dir ?? "rtl"}
      className="w-full max-w-[310px] rounded-2xl border border-white/10 bg-zinc-950/90 p-3.5 text-white shadow-xl"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white">آبان ۱۴۰۵</span>
          <span className="ms-2 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">
            جلالی خورشیدی
          </span>
        </div>
        <span className="text-[11px] text-zinc-400">
          انتخاب: {toPersianDigits(selectedDay)} آبان
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500">
        {daysHeader.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const isSelected = day === selectedDay;
          const isFriday = day % 7 === 0;
          return (
            <button
              key={day}
              onClick={() => {
                soundEngine.playSnap();
                setSelectedDay(day);
              }}
              className={`relative flex h-7 items-center justify-center rounded-lg text-[11px] font-medium transition ${
                isSelected
                  ? "text-white font-bold"
                  : isFriday
                    ? "text-rose-400 hover:bg-white/5"
                    : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="jalali-active-day"
                  transition={{
                    type: "spring",
                    stiffness: physics?.stiffness ?? 280,
                    damping: physics?.damping ?? 22,
                  }}
                  className="absolute inset-0 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md"
                />
              )}
              <span className="relative z-10">{toPersianDigits(day)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   Universal Component Preview Renderer (Used in Explorer & Studio)
   ============================================================================ */
export const UniversalComponentPreview: React.FC<{
  previewType: string;
  physics?: StudioPhysicsConfig;
}> = ({ previewType, physics }) => {
  const palette = ACCENT_PALETTES[physics?.accentName ?? "firoozeh"];

  switch (previewType) {
    case "bank-card-3d":
      return <Iranian3DBankCardWidget physics={physics} />;
    case "kinetic-type":
      return <PersianKineticTypographyWidget physics={physics} />;
    case "magnetic-dock":
      return <MagneticRtlDockWidget physics={physics} />;
    case "dynamic-island":
      return <DynamicIslandWidget physics={physics} />;
    case "cobe-globe":
      return <InteractiveCobeGlobe accentHex={palette.hex} size={240} />;
    case "jalali-calendar":
      return <JalaliCalendarWidget physics={physics} />;
    case "siri-orb":
      return (
        <div className="flex flex-col items-center gap-3">
          <SiriShaderOrb active />
          <span className="text-xs text-zinc-300">گوی شیدری چندلایه و طیف صوتی هوش مصنوعی</span>
        </div>
      );
    case "rtl-auditor":
      return <RtlMotionBugHunterWidget />;
    case "liquid-button":
      return (
        <motion.button
          onClick={() => soundEngine.playSuccess()}
          whileHover={{ scale: physics?.scale ?? 1.06 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: physics?.stiffness ?? 260,
            damping: physics?.damping ?? 20,
          }}
          className="group relative overflow-hidden rounded-2xl border border-cyan-400/50 bg-gradient-to-l from-cyan-500/25 via-indigo-500/25 to-zinc-900 px-7 py-4 text-sm font-bold text-white shadow-2xl"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>دکمه ذره‌ای و مغناطیسی ۶۰ فریم (کلیک کنید)</span>
          </span>
        </motion.button>
      );
    case "otp-farsi":
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <span className="text-xs text-zinc-300">کد تایید ۵ رقمی ارسال‌شده به ۰۹۱۲•••۸۴۹۲</span>
          <div dir="ltr" className="flex gap-2">
            {["۴", "۸", "۲", "۹", "۱"].map((d, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.08 }}
                onClick={() => soundEngine.playThock()}
                className="flex h-11 w-10 cursor-pointer items-center justify-center rounded-xl border border-cyan-400/40 bg-zinc-900 text-base font-bold text-cyan-300 shadow-inner"
              >
                {d}
              </motion.div>
            ))}
          </div>
        </div>
      );
    case "ai-reasoning":
      return (
        <div className="w-full max-w-sm space-y-2 rounded-2xl border border-white/10 bg-zinc-950 p-4 text-xs">
          <div className="flex items-center justify-between text-cyan-300 font-bold">
            <span>زنجیره استدلال مدل (Chain-of-Thought)</span>
            <span>۱۲۸ توکن/ثانیه</span>
          </div>
          {[
            "۱. جایگزینی کلاس‌های ml-4 و left-0 با ms-4 و start-0",
            "۲. تنظیم فیزیک فنر ۶۰ فریم (stiffness: 260, damping: 22)",
            "۳. صیانت از نیم‌فاصله‌ها و اتصال حروف در فونت هستی و نستعلیق",
          ].map((step, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-zinc-900/80 px-3 py-1.5 text-zinc-300"
            >
              ✓ {step}
            </div>
          ))}
        </div>
      );
    default:
      return <Iranian3DBankCardWidget physics={physics} compact />;
  }
};

/* ============================================================================
   Main 6-Card Interactive Bento Grid Showcase
   ============================================================================ */
export const BentoShowcaseGrid: React.FC<{
  onOpenInStudio: (componentId: string) => void;
}> = ({ onOpenInStudio }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleQuickCopy = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet).catch(() => {});
    soundEngine.playSuccess();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>بنتو گرید تعاملی زنده • بدون هیچ تصویر استاتیک</span>
          </div>
          <h2 className="mt-2.5 text-2xl sm:text-3xl font-bold text-white">
            ۶ موتور زنده در یک ماتریس مهندسی ۱ پیکسلی
          </h2>
        </div>
        <p className="max-w-md text-xs sm:text-sm text-zinc-400">
          هر کارت زیر یک کامپوننت واقعی ۶۰ فریم بر ثانیه است؛ ماوس را حرکت دهید، فونت‌های خاص و
          نستعلیق را عوض کنید یا مستقیم وارد استودیوی فیزیک شوید.
        </p>
      </div>

      {/* 6-Card Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Card 1: 3D Iranian Holographic Bank Card (7 cols) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215]/90 p-5 transition hover:border-zinc-700 md:col-span-7">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  موتور سه‌بعدی و هولوگرافیک کارت‌های بانکی ایران
                </h3>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                تشخیص خودکار بانک از روی BIN، الگوریتم Luhn، فویل هولوگرافیک و قرینه‌سازی زاویه 3D
                در RTL
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenInStudio("iranian-3d-bank-card")}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-200 hover:border-cyan-400/50 hover:text-cyan-300"
              >
                <Sliders className="h-3 w-3" />
                <span>استودیو</span>
              </button>
            </div>
          </div>

          <div className="my-auto flex items-center justify-center py-2">
            <Iranian3DBankCardWidget />
          </div>
        </div>

        {/* Card 2: Interactive 3D Cobe Globe of Iran Nodes (5 cols) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215]/90 p-5 transition hover:border-zinc-700 md:col-span-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  کره سه‌بعدی WebGL نودهای ایران (Cobe Engine)
                </h3>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                ماتریس نقطه‌ای فیبوناچی با کمان‌های نوری بین تهران، اصفهان، شیراز، تبریز و مشهد
              </p>
            </div>
            <button
              onClick={() => onOpenInStudio("cobe-webgl-iran-globe")}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-200 hover:border-indigo-400/50 hover:text-indigo-300"
            >
              <Sliders className="h-3 w-3" />
              <span>استودیو</span>
            </button>
          </div>

          <div className="my-auto flex items-center justify-center py-1">
            <InteractiveCobeGlobe accentHex="#06B6D4" size={245} />
          </div>
        </div>

        {/* Card 3: Persian Kinetic Typography & Special Fonts (Hasti, Nastaliq, Kahroba) (7 cols) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215]/90 p-5 transition hover:border-zinc-700 md:col-span-7">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  آزمایشگاه تایپوگرافی جنبشی و ۴۰ فونت فارسی (هستی، نستعلیق، کهربا و مربع)
                </h3>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                تست زنده فونت‌های خاص و خوشنویسی ایرانی با انیمیشن فنری بدون گسستگی حروف چسبیده
              </p>
            </div>
            <button
              onClick={() => onOpenInStudio("persian-kinetic-typography")}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-200 hover:border-amber-400/50 hover:text-amber-300"
            >
              <Sliders className="h-3 w-3" />
              <span>استودیو</span>
            </button>
          </div>

          <PersianKineticTypographyWidget />
        </div>

        {/* Card 4: Dynamic Island & Siri Voice Shader Orb (5 cols) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215]/90 p-5 transition hover:border-zinc-700 md:col-span-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  جزیره پویا و گوی صوتی هوش مصنوعی (SmoothUI)
                </h3>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                تغییر ابعاد سیال با layoutId بین دستیار صوتی، تایید شاپرک و تله‌متری فریم
              </p>
            </div>
            <button
              onClick={() => onOpenInStudio("dynamic-island-persian")}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-200 hover:border-cyan-400/50 hover:text-cyan-300"
            >
              <Sliders className="h-3 w-3" />
              <span>استودیو</span>
            </button>
          </div>

          <div className="my-auto flex items-center justify-center py-3">
            <DynamicIslandWidget />
          </div>
        </div>

        {/* Card 5: Automated RTL & 60fps Code Bug Hunter (6 cols) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215]/90 p-5 transition hover:border-zinc-700 md:col-span-6">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  شکارچی خودکار باگ‌های RTL و پرفورمنس موشن
                </h3>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                موتور ممیزی زنده که کلاس‌های LTR و شکستگی حروف فارسی را با ۱ کلیک اصلاح می‌کند
              </p>
            </div>
            <button
              onClick={() =>
                handleQuickCopy(
                  "auditor",
                  "node toolkit/05-qa-and-bug-hunters/rtl-motion-auditor.mjs ./src"
                )
              }
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-200 hover:border-emerald-400/50"
            >
              {copiedId === "auditor" ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Terminal className="h-3 w-3" />
              )}
              <span>{copiedId === "auditor" ? "کپی شد" : "کپی دستور CLI"}</span>
            </button>
          </div>

          <RtlMotionBugHunterWidget />
        </div>

        {/* Card 6: Magnetic RTL Dock + Jalali Calendar Split Showcase (6 cols) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#121215]/90 p-5 transition hover:border-zinc-700 md:col-span-6">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  داک مغناطیسی ۶۰ فریم + تقویم خورشیدی (جلالی)
                </h3>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                بزرگ‌نمایی پیوسته گاوسی روی داک + انتخابگر روز جلالی با انیمیشن فنری layoutId
              </p>
            </div>
            <button
              onClick={() => onOpenInStudio("shadcn-jalali-spring-calendar")}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-200 hover:border-indigo-400/50"
            >
              <Sliders className="h-3 w-3" />
              <span>استودیو</span>
            </button>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex-1 flex justify-center">
              <JalaliCalendarWidget />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <MagneticRtlDockWidget />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
