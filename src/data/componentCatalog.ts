export interface CatalogComponentItem {
  id: string;
  titleFa: string;
  titleEn: string;
  registry:
    | "Effect UI"
    | "React Bits"
    | "SmoothUI"
    | "Animate UI"
    | "Kokonut UI"
    | "Fancy"
    | "Eldora UI"
    | "Cult UI"
    | "Magic UI"
    | "Rasa FarsiUI"
    | "Tailark Blocks";
  category:
    | "3d-fintech"
    | "kinetic-typography"
    | "motion-primitives"
    | "webgl-shaders"
    | "ai-ui"
    | "persian-blocks";
  categoryLabelFa: string;
  descriptionFa: string;
  fps: "60fps GPU" | "WebGL 60fps" | "Spring 60fps";
  rtlReady: boolean;
  previewType:
    | "bank-card-3d"
    | "kinetic-type"
    | "magnetic-dock"
    | "dynamic-island"
    | "jalali-calendar"
    | "cobe-globe"
    | "siri-orb"
    | "rtl-auditor"
    | "liquid-button"
    | "bento-spotlight"
    | "ai-reasoning"
    | "otp-farsi";
  cliCommand: string;
  aiPromptFa: string;
  codeTsx: string;
}

export const COMPONENT_CATALOG: CatalogComponentItem[] = [
  {
    id: "iranian-3d-bank-card",
    titleFa: "کارت بانکی سه‌بعدی و هولوگرافیک شتاب",
    titleEn: "Iranian Fintech 3D Holographic Card",
    registry: "Effect UI",
    category: "3d-fintech",
    categoryLabelFa: "سه‌بعدی و فین‌تک ایران",
    descriptionFa:
      "تشخیص خودکار ۱۸ بانک ایران از روی پیش‌شماره کارت (BIN)، اعتبارسنجی الگوریتم Luhn، شیدر هولوگرافیک حساس به زاویه ماوس و قرینه‌سازی خودکار محور چرخش در RTL.",
    fps: "60fps GPU",
    rtlReady: true,
    previewType: "bank-card-3d",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/iranian-3d-bank-card.json",
    aiPromptFa:
      "یک کارت بانکی سه‌بعدی و هولوگرافیک به سبک بلوبانک و سامان با Framer Motion بساز که با حرکت ماوس در فضای 3D بچرخد (stiffness: 260, damping: 22)، از روی ۶ رقم اول شماره کارت رنگ و لوگوی بانک ایرانی را تشخیص دهد و در حالت RTL زاویه rotateY را قرینه کند.",
    codeTsx: `import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const MAX_TILT = 14;

export function IranianHolographicCard({ dir = "rtl" }: { dir?: "rtl" | "ltr" }) {
  const [cardNumber, setCardNumber] = useState("6219861912345678");
  const rtlSign = dir === "rtl" ? -1 : 1;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.8 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);
  const rotateY = useTransform(
    springX,
    [-0.5, 0.5],
    [-MAX_TILT * rtlSign, MAX_TILT * rtlSign]
  );

  return (
    <motion.div
      dir={dir}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.03 }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      className="relative w-88 rounded-2xl border border-white/15 bg-gradient-to-br from-sky-500/30 via-indigo-950 to-zinc-950 p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-cyan-300">بلوبانک سامان</span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">شتاب • Luhn OK</span>
      </div>
      <div dir="ltr" className="my-6 font-mono text-xl tracking-widest text-zinc-100">
        {cardNumber.replace(/(\\d{4})/g, "$1 ").trim()}
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>دارنده: امیرحسین رضایی</span>
        <span>انقضا: ۰۸/۱۴۰۷</span>
      </div>
    </motion.div>
  );
}`,
  },
  {
    id: "persian-kinetic-typography",
    titleFa: "تایپوگرافی جنبشی فارسی (هستی، نستعلیق و متغیر)",
    titleEn: "ZWNJ-Safe Persian Kinetic Typography",
    registry: "React Bits",
    category: "kinetic-typography",
    categoryLabelFa: "تایپوگرافی جنبشی فارسی",
    descriptionFa:
      "موتور انیمیشن کلمات و تیترهای فارسی با پشتیبانی از فونت‌های «هستی»، «ایران‌نستعلیق»، «کهربا» و «مربع» بدون شکستن اتصال حروف چسبیده یا نیم‌فاصله (ZWNJ).",
    fps: "Spring 60fps",
    rtlReady: true,
    previewType: "kinetic-type",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/persian-kinetic-text.json",
    aiPromptFa:
      "یک کامپوننت تایپوگرافی جنبشی فارسی با Framer Motion بساز که متن را فقط بر اساس فاصله و با حفظ نیم‌فاصله (ZWNJ) به کلمات تقسیم کند، هرگز از split('') یا letter-spacing مثبت استفاده نکند و با انیمیشن فنری blur و y وارد صفحه شود.",
    codeTsx: `import React from "react";
import { motion } from "framer-motion";

export function PersianKineticHeading({
  text = "مهندسی موشن و تایپوگرافی اصیل فارسی در ۶۰ فریم",
  dir = "rtl",
}: {
  text?: string;
  dir?: "rtl" | "ltr";
}) {
  // هرگز در خط فارسی از split("") استفاده نکنید تا اتصال حروف و نیم‌فاصله نشکند
  const words = text.trim().split(/\\s+/);

  return (
    <h2
      dir={dir}
      className="flex flex-wrap gap-x-2.5 gap-y-2 text-2xl font-bold leading-[1.45] tracking-normal text-zinc-100"
    >
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
            mass: 0.8,
            delay: idx * 0.055,
          }}
          whileHover={{ scale: 1.08, color: "#06B6D4" }}
          className="inline-block cursor-pointer"
        >
          {word}
        </motion.span>
      ))}
    </h2>
  );
}`,
  },
  {
    id: "rtl-magnetic-dock",
    titleFa: "داک مغناطیسی ۶۰ فریم (Gaussian RTL Dock)",
    titleEn: "Raycast / macOS Gaussian Magnetic Dock",
    registry: "Motion Primitives",
    category: "motion-primitives",
    categoryLabelFa: "پریمیوهای موشن و ناوبری",
    descriptionFa:
      "بزرگ‌نمایی پیوسته آیکون‌ها بر اساس فاصله اقلیدسی اشاره‌گر ماوس با هوک‌های useMotionValue و useSpring بدون هیچ‌گونه Re-render در ری‌اکت.",
    fps: "60fps GPU",
    rtlReady: true,
    previewType: "magnetic-dock",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/rtl-magnetic-dock.json",
    aiPromptFa:
      "یک داک مغناطیسی به سبک macOS و Raycast با Framer Motion بساز که با useMotionValue و useTransform فاصله ماوس تا مرکز هر آیکون را محاسبه کرده و عرض آیکون را با فنر (stiffness: 280, damping: 20) بین 44px تا 72px تغییر دهد.",
    codeTsx: `import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";

export function MagneticRtlDock({ items = ["خانه", "کامپوننت‌ها", "استودیو", "شیدر", "هوش مصنوعی"] }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      dir="rtl"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="mx-auto flex h-16 items-end gap-3 rounded-2xl border border-white/10 bg-zinc-900/85 px-4 pb-2.5 backdrop-blur-xl"
    >
      {items.map((label, i) => (
        <DockIcon key={i} mouseX={mouseX} label={label} />
      ))}
    </motion.div>
  );
}

function DockIcon({ mouseX, label }: { mouseX: MotionValue<number>; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  const sizeSync = useTransform(distance, [-130, 0, 130], [44, 70, 44]);
  const size = useSpring(sizeSync, { stiffness: 260, damping: 22, mass: 0.8 });

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-xl border border-white/10 bg-zinc-800/90 text-xs font-medium text-white shadow-lg"
    >
      {label.slice(0, 2)}
    </motion.div>
  );
}`,
  },
  {
    id: "dynamic-island-persian",
    titleFa: "جزیره پویا و دستیار صوتی (Dynamic Island)",
    titleEn: "SmoothUI Morphing Dynamic Island",
    registry: "SmoothUI",
    category: "ai-ui",
    categoryLabelFa: "رابط‌های هوش مصنوعی AI UI",
    descriptionFa:
      "تغییر شکل سیال (Shared Layout Morphing) بین حالت فشرده، دستیار صوتی هوش مصنوعی، تایید تراکنش بانکی و تایمر زنده با فیزیک فنری.",
    fps: "Spring 60fps",
    rtlReady: true,
    previewType: "dynamic-island",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/dynamic-island-rtl.json",
    aiPromptFa:
      "یک کامپوننت Dynamic Island راست‌به‌چپ با Framer Motion و layoutId بساز که بین ۴ وضعیت (فشرده، دستیار صوتی هوش مصنوعی، پرداخت موفق شاپرک و تایمر رندر) با انیمیشن فنری تغییر ابعاد دهد.",
    codeTsx: `import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PersianDynamicIsland() {
  const [mode, setMode] = useState<"idle" | "ai" | "payment">("ai");

  return (
    <motion.div
      layout
      dir="rtl"
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.8 }}
      className="mx-auto overflow-hidden rounded-[28px] border border-white/15 bg-black px-5 py-3.5 text-white shadow-2xl"
    >
      <AnimatePresence mode="wait">
        {mode === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="flex items-center gap-4"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold">معمار موشن هوش مصنوعی</p>
              <p className="text-[11px] text-zinc-400">در حال تولید کد ۶۰ فریم راست‌به‌چپ...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}`,
  },
  {
    id: "cobe-webgl-iran-globe",
    titleFa: "کره سه‌بعدی تعاملی نودهای ایران (Cobe WebGL)",
    titleEn: "Interactive 3D Iran Edge Globe",
    registry: "Eldora UI",
    category: "webgl-shaders",
    categoryLabelFa: "پس‌زمینه‌های WebGL و شیدر",
    descriptionFa:
      "کره ماتریس نقطه‌ای سه‌بعدی با قابلیت چرخش با ماوس، اینرسی فنری و کمان‌های نوری بین تهران، اصفهان، شیراز، تبریز و مشهد.",
    fps: "WebGL 60fps",
    rtlReady: true,
    previewType: "cobe-globe",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/cobe-iran-globe.json",
    aiPromptFa:
      "یک کامپوننت کره سه‌بعدی نقطه‌ای به سبک Cobe و Vercel با Canvas/WebGL بساز که نودهای ایران (تهران، اصفهان، شیراز، تبریز) را با کمان‌های نوری متصل کند و با کشیدن ماوس با اینرسی نرم بچرخد.",
    codeTsx: `// مشاهده پیاده‌سازی کامل در src/components/InteractiveShaders.tsx (InteractiveCobeGlobe)
import { InteractiveCobeGlobe } from "./InteractiveShaders";

export default function GlobeShowcase() {
  return <InteractiveCobeGlobe accentHex="#06B6D4" size={280} />;
}`,
  },
  {
    id: "shadcn-jalali-spring-calendar",
    titleFa: "تقویم خورشیدی (جلالی) با انیمیشن فنری",
    titleEn: "Shadcn Jalali Spring Date Picker",
    registry: "Rasa FarsiUI",
    category: "persian-blocks",
    categoryLabelFa: "بلوک‌های فارسی و تقویم جلالی",
    descriptionFa:
      "تقویم کامل شمسی منطبق با استانداردهای Shadcn UI، نشانگر انتخاب سیال (layoutId)، نمایش تعطیلات رسمی ایران و ارقام استاندارد فارسی.",
    fps: "Spring 60fps",
    rtlReady: true,
    previewType: "jalali-calendar",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/shadcn-jalali-calendar.json",
    aiPromptFa:
      "یک تقویم خورشیدی (جلالی) راست‌به‌چپ برای آبان ۱۴۰۵ با Tailwind CSS و Framer Motion بساز که روز انتخاب‌شده دارای پس‌زمینه متحرک با layoutId باشد و جمعه‌ها و تعطیلات را با نشانگر یاقوتی متمایز کند.",
    codeTsx: `import React, { useState } from "react";
import { motion } from "framer-motion";

const DAYS_HEADER = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export function JalaliSpringCalendar({ dir = "rtl" }: { dir?: "rtl" | "ltr" }) {
  const [selectedDay, setSelectedDay] = useState(22);

  return (
    <div dir={dir} className="w-80 rounded-2xl border border-white/10 bg-zinc-950 p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold">آبان ۱۴۰۵</span>
        <span className="text-xs text-cyan-400">تقویم جلالی</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
        {DAYS_HEADER.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="relative h-8 rounded-lg text-xs font-medium"
            >
              {isSelected && (
                <motion.span
                  layoutId="jalali-day-pill"
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="absolute inset-0 rounded-lg bg-[#6366F1]"
                />
              )}
              <span className="relative z-10">{day.toLocaleString("fa-IR")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}`,
  },
  {
    id: "siri-harmonic-orb-ai",
    titleFa: "گوی شیدری صوتی و استدلال هوش مصنوعی",
    titleEn: "Siri Shader Orb & AI Reasoning Stream",
    registry: "SmoothUI",
    category: "ai-ui",
    categoryLabelFa: "رابط‌های هوش مصنوعی AI UI",
    descriptionFa:
      "ترکیب گوی شیدری چندلایه با نمایش مرحله‌به‌مرحله زنجیره استدلال مدل (Chain-of-Thought) و توکن‌سنج زنده برای چت‌بات‌های فارسی.",
    fps: "WebGL 60fps",
    rtlReady: true,
    previewType: "siri-orb",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/siri-orb-ai-rtl.json",
    aiPromptFa:
      "یک کامپوننت گوی صوتی هوش مصنوعی به سبک Siri و SmoothUI همراه با باکس بازشونده نمایش مراحل فکر کردن (AI Reasoning) راست‌به‌چپ بساز.",
    codeTsx: `import React from "react";
import { SiriShaderOrb } from "./InteractiveShaders";

export function AiVoiceOrbCard() {
  return (
    <div dir="rtl" className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <SiriShaderOrb active />
      <div>
        <h4 className="text-sm font-bold text-white">پاسخ‌گوی صوتی و شیدری</h4>
        <p className="mt-1 text-xs text-zinc-400">پردازش هم‌زمان صوت و استدلال زنجیره‌ای فارسی</p>
      </div>
    </div>
  );
}`,
  },
  {
    id: "rtl-motion-bug-hunter",
    titleFa: "اسکنر و ممیز خودکار باگ‌های RTL و 60fps",
    titleEn: "Automated RTL & Motion Bug Auditor",
    registry: "Animate UI",
    category: "motion-primitives",
    categoryLabelFa: "پریمیوهای موشن و ناوبری",
    descriptionFa:
      "تشخیص آنی ۵ باگ مرگبار در کدهای ری‌اکت و تیلویند (ml-*/mr-*، left/right، شکستن حروف فارسی با split('')، tracking مثبت و انیمیشن‌های غیر GPU) همراه با اصلاح خودکار.",
    fps: "60fps GPU",
    rtlReady: true,
    previewType: "rtl-auditor",
    cliCommand: "node toolkit/05-qa-and-bug-hunters/rtl-motion-auditor.mjs ./src",
    aiPromptFa:
      "این کد کامپوننت ری‌اکت را از نظر سازگاری با راست‌به‌چپ (Logical CSS)، عدم شکستن حروف چسبیده فارسی و اجرای ۶۰ فریم روی GPU بررسی و بازنویسی کن.",
    codeTsx: `// اجرای مستقیم موتور ممیزی از toolkit/05-qa-and-bug-hunters/rtl-motion-auditor.mjs
import { auditRtlMotionCode } from "../engines/persianEngines";

const result = auditRtlMotionCode('<div className="ml-4 left-2 tracking-widest">{text.split("")}</div>');
console.log(result.fixedCode); // '<div className="ms-4 start-2 tracking-normal">{text.split(/\\s+/)}</div>'`,
  },
  {
    id: "kokonut-liquid-particle-button",
    titleFa: "دکمه مغناطیسی و ذره‌ای کوکونات (Particle & Liquid CTA)",
    titleEn: "Kokonut Magnetic Particle Button",
    registry: "Kokonut UI",
    category: "motion-primitives",
    categoryLabelFa: "پریمیوهای موشن و ناوبری",
    descriptionFa:
      "دکمه فراخوان (CTA) با جذب مغناطیسی اشاره‌گر ماوس، درخشش مرزی (Border Beam) و بازخورد صوتی مکانیکی Web Audio API.",
    fps: "60fps GPU",
    rtlReady: true,
    previewType: "liquid-button",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/kokonut-particle-button.json",
    aiPromptFa:
      "یک دکمه مغناطیسی و درخشان به سبک Kokonut UI و Linear با Framer Motion بساز که با نزدیک شدن ماوس به سمت اشاره‌گر کشیده شود و هنگام کلیک موج ذره‌ای آزاد کند.",
    codeTsx: `import React from "react";
import { motion } from "framer-motion";

export function LiquidMagneticButton({ children = "اجرای زنده در استودیو" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-xl border border-cyan-400/40 bg-gradient-to-l from-cyan-500/20 via-indigo-500/20 to-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg"
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}`,
  },
  {
    id: "cult-spotlight-bento-card",
    titleFa: "کارت بنتو با پرتو نوری رهگیر ماوس (Spotlight Bento)",
    titleEn: "Cult UI Radial Spotlight Bento Card",
    registry: "Cult UI",
    category: "webgl-shaders",
    categoryLabelFa: "پس‌زمینه‌های WebGL و شیدر",
    descriptionFa:
      "پرتو نوری شعاعی ۶۰ فریم که مختصات دقیق ماوس را روی کارت و مرز ۱ پیکسلی آن دنبال می‌کند، بدون تحمیل بار اضافی به React State.",
    fps: "60fps GPU",
    rtlReady: true,
    previewType: "bento-spotlight",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/spotlight-bento-rtl.json",
    aiPromptFa:
      "یک کارت Bento به سبک Linear و Cult UI بساز که با حرکت ماوس یک هاله نوری radial-gradient در محل دقیق اشاره‌گر روی پس‌زمینه و حاشیه ۱ پیکسلی کارت ایجاد کند.",
    codeTsx: `import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function SpotlightBentoCard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  return (
    <div
      dir="rtl"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate\`radial-gradient(260px circle at \${mouseX}px \${mouseY}px, rgba(99,102,241,0.22), transparent 80%)\`,
        }}
      />
      <h3 className="text-base font-bold text-white">کارت هوشمند پرتو نوری</h3>
      <p className="mt-1 text-xs text-zinc-400">رهگیری ۶۰ فریم مختصات ماوس با useMotionTemplate</p>
    </div>
  );
}`,
  },
  {
    id: "farsi-otp-verification-block",
    titleFa: "بلوک کد تایید پیامکی هوشمند (Persian OTP Block)",
    titleEn: "Animated Persian OTP & Shake Validator",
    registry: "Tailark Blocks",
    category: "persian-blocks",
    categoryLabelFa: "بلوک‌های فارسی و تقویم جلالی",
    descriptionFa:
      "ورودی کد تایید ۵ رقمی با تبدیل خودکار ارقام فارسی به انگلیسی، پرش فنری بین خانه‌ها و انیمیشن لرزش افقی در صورت خطا.",
    fps: "Spring 60fps",
    rtlReady: true,
    previewType: "otp-farsi",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/persian-otp-block.json",
    aiPromptFa:
      "یک کامپوننت ورود کد تایید پیامکی (OTP) برای کاربران ایرانی بساز که هم اعداد فارسی (۰-۹) و هم انگلیسی را بپذیرد، خانه‌ها را از چپ به راست پر کند اما چیدمان کلی کارت راست‌به‌چپ باشد.",
    codeTsx: `import React, { useState } from "react";
import { motion } from "framer-motion";

export function PersianOtpCard() {
  const [digits, setDigits] = useState(["۴", "۸", "۲", "۹", "۱"]);
  return (
    <div dir="rtl" className="rounded-2xl border border-white/10 bg-zinc-950 p-5 text-white">
      <p className="text-xs font-bold">کد تایید ارسال‌شده به ۰۹۱۲•••۸۴۹۲</p>
      <div dir="ltr" className="mt-3 flex justify-center gap-2">
        {digits.map((d, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3, borderColor: "#06B6D4" }}
            className="flex h-11 w-10 items-center justify-center rounded-xl border border-white/15 bg-zinc-900 font-bold text-cyan-300"
          >
            {d}
          </motion.div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: "ai-chain-of-thought-rtl",
    titleFa: "پنل زنجیره استدلال و مصرف توکن هوش مصنوعی",
    titleEn: "AI Chain-of-Thought & Context Meter",
    registry: "Effect UI",
    category: "ai-ui",
    categoryLabelFa: "رابط‌های هوش مصنوعی AI UI",
    descriptionFa:
      "نمایش مرحله‌به‌مرحله تحلیل مدل، بررسی قوانین RTL، بودجه فریم ۶۰fps و نمودار حلقوی مصرف پنجره زمینه (Context Window).",
    fps: "Spring 60fps",
    rtlReady: true,
    previewType: "ai-reasoning",
    cliCommand: "npx shadcn@latest add https://rtlmotion.ir/r/ai-reasoning-rtl.json",
    aiPromptFa:
      "یک کامپوننت نمایش زنجیره استدلال هوش مصنوعی (AI Reasoning & Context Meter) راست‌به‌چپ با Framer Motion بساز که مراحل تحلیل کد را با انیمیشن بازشونده نمایش دهد.",
    codeTsx: `import React from "react";
import { motion } from "framer-motion";

export function AiReasoningStream() {
  const steps = [
    "بررسی قوانین Logical CSS (تبدیل ml/mr به ms/me)",
    "تنظیم فنر ۶۰ فریم (stiffness: 260, damping: 22)",
    "حفظ اتصال حروف فارسی و نیم‌فاصله‌ها (ZWNJ)",
  ];
  return (
    <div dir="rtl" className="rounded-2xl border border-white/10 bg-zinc-950 p-4 text-xs text-zinc-300">
      {steps.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="py-1">
          ✓ {s}
        </motion.div>
      ))}
    </div>
  );
}`,
  },
];
