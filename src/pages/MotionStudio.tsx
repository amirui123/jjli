import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Gauge, RotateCcw, Waves, Zap } from "lucide-react";
import { usePersisted, useAppSettings } from "../lib/store";
import {
  SPRING_PRESETS,
  simulateSpring,
  springToCssLinear,
  type SpringParams,
} from "../lib/spring";
import {
  Badge,
  CodeBlock,
  Panel,
  Segmented,
  Slider,
  Toggle,
  cn,
} from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";

type Target = "card" | "type" | "orb";
type Mode = "spring" | "tween";

interface MotionSettings extends SpringParams {
  target: Target;
  mode: Mode;
  distance: number;
  durationS: number;
  scale: number;
  rotate: number;
  blur: number;
  opacityFrom: number;
  stagger: number;
  rtl: boolean;
  loop: boolean;
  bezier: [number, number, number, number];
  exportTab: "motion" | "css" | "variants";
}

const DEFAULT: MotionSettings = {
  stiffness: 260,
  damping: 22,
  mass: 0.9,
  target: "card",
  mode: "spring",
  distance: 96,
  durationS: 0.6,
  scale: 1.06,
  rotate: 4,
  blur: 8,
  opacityFrom: 0.2,
  stagger: 0.06,
  rtl: true,
  loop: false,
  bezier: [0.22, 1, 0.36, 1],
  exportTab: "motion",
};

const Graph: React.FC<{ samples: number[]; accent: string }> = ({ samples, accent }) => {
  const W = 100;
  const H = 40;
  const min = Math.min(...samples, 0);
  const max = Math.max(...samples, 1);
  const range = max - min || 1;
  const path = samples
    .map((v, i) => {
      const x = (i / (samples.length - 1)) * W;
      const y = H - ((v - min) / range) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-20 w-full" preserveAspectRatio="none">
      <line x1="0" y1={H - ((1 - min) / range) * H} x2={W} y2={H - ((1 - min) / range) * H} stroke="rgba(255,255,255,0.12)" strokeDasharray="2 2" strokeWidth="0.4" />
      <path d={path} fill="none" stroke={accent} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const MotionStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<MotionSettings>("studio-motion", DEFAULT);
  const { motionScale } = useAppSettings();
  const [replay, setReplay] = useState(0);

  const analysis = useMemo(
    () => simulateSpring({ stiffness: s.stiffness, damping: s.damping, mass: s.mass }),
    [s.stiffness, s.damping, s.mass]
  );

  const cssEasing = useMemo(() => springToCssLinear(analysis, 20), [analysis]);

  const transition =
    s.mode === "spring"
      ? { type: "spring" as const, stiffness: s.stiffness, damping: s.damping, mass: s.mass }
      : {
          type: "tween" as const,
          duration: s.durationS / motionScale,
          ease: s.bezier as [number, number, number, number],
        };

  const dirSign = s.rtl ? -1 : 1;
  const initial = {
    x: s.distance * dirSign,
    opacity: s.opacityFrom,
    scale: 0.94,
    rotate: s.rotate * dirSign,
    filter: `blur(${s.blur}px)`,
  };
  const animate = {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: "blur(0px)",
  };
  const hover = { scale: s.scale, rotate: s.rotate * 0.6 * dirSign };
  const loopTransition = {
    ...transition,
    repeat: Infinity,
    repeatType: "reverse" as const,
    repeatDelay: 0.5,
  };

  const replayAll = () => {
    setReplay((r) => r + 1);
    soundEngine.playSpring();
  };

  const quality =
    analysis.dampingRatio < 0.35
      ? { label: "کشسان", tone: "warn" as const }
      : analysis.dampingRatio < 0.8
      ? { label: "طبیعی", tone: "accent" as const }
      : analysis.dampingRatio < 1
      ? { label: "آرام", tone: "success" as const }
      : { label: "بدون نوسان", tone: "neutral" as const };

  /* ------------------------------------------------------------- exports */

  const motionSnippet = `const transition = ${
    s.mode === "spring"
      ? `{
  type: "spring",
  stiffness: ${s.stiffness},
  damping: ${s.damping},
  mass: ${s.mass},
}`
      : `{
  type: "tween",
  duration: ${s.durationS},
  ease: [${s.bezier.join(", ")}],
}`
  };

<motion.div
  initial={{ x: ${initial.x}, opacity: ${initial.opacity}, rotate: ${Math.round(initial.rotate)} }}
  animate={{ x: 0, opacity: 1, rotate: 0 }}
  whileHover={{ scale: ${s.scale} }}
  transition={transition}
/>`;

  const cssSnippet = `.enter {
  /* فنر ${s.stiffness}/${s.damping}/${s.mass} → ${analysis.settleTime.toFixed(2)}s */
  transition: transform ${analysis.settleTime.toFixed(2)}s ${cssEasing},
              opacity ${analysis.settleTime.toFixed(2)}s ${cssEasing};
  transform: translateX(0);
  opacity: 1;
}

/* حالت اولیه */
.enter[data-state="hidden"] {
  transform: translateX(${initial.x}px) rotate(${Math.round(initial.rotate)}deg);
  opacity: ${s.opacityFrom};
}

@media (prefers-reduced-motion: reduce) {
  .enter { transition-duration: 0.01ms; }
}`;

  const variantsSnippet = `import type { Variants } from "framer-motion";

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: ${s.stagger}, delayChildren: 0.05 } },
};

export const item: Variants = {
  hidden: { x: ${initial.x}, opacity: ${s.opacityFrom}, rotate: ${Math.round(initial.rotate)} },
  show: {
    x: 0,
    opacity: 1,
    rotate: 0,
    transition: ${
      s.mode === "spring"
        ? `{ type: "spring", stiffness: ${s.stiffness}, damping: ${s.damping}, mass: ${s.mass} }`
        : `{ type: "tween", duration: ${s.durationS}, ease: [${s.bezier.join(", ")}] }`
    },
  },
};

// <motion.ul variants={container} initial="hidden" animate="show">
//   {items.map(i => <motion.li key={i} variants={item} />)}
// </motion.ul>`;

  const exportCode = {
    motion: motionSnippet,
    css: cssSnippet,
    variants: variantsSnippet,
  }[s.exportTab];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <Activity className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">MOTION STUDIO</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            استودیو فیزیک حرکت
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            فنر را با معادلات واقعی شبیه‌سازی می‌کنیم؛ منحنی، زمان نشست، فراجهش و کد
            خروجی از همان محاسبات ساخته می‌شود — نه از عددهای ثابت.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SPRING_PRESETS.map((p) => {
            const active =
              p.params.stiffness === s.stiffness &&
              p.params.damping === s.damping &&
              p.params.mass === s.mass;
            return (
              <button
                key={p.id}
                onClick={() => {
                  soundEngine.playTick(1.1);
                  set({ ...p.params, mode: "spring" });
                }}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors",
                  active
                    ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                    : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:text-zinc-100"
                )}
              >
                {p.labelFa}
              </button>
            );
          })}
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[11px] text-zinc-500 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Panel padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Segmented
                  size="sm"
                  value={s.target}
                  onChange={(v) => set({ target: v })}
                  options={[
                    { value: "card", label: "کارت" },
                    { value: "type", label: "متن" },
                    { value: "orb", label: "گوی" },
                  ]}
                />
                <Segmented
                  size="sm"
                  value={s.mode}
                  onChange={(v) => set({ mode: v })}
                  options={[
                    { value: "spring", label: "فنر" },
                    { value: "tween", label: "بیزی" },
                  ]}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge tone={quality.tone}>{quality.label}</Badge>
                <Badge>{analysis.settleTime.toFixed(2)}s</Badge>
                <button
                  onClick={replayAll}
                  className="rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-2.5 py-1 text-[10.5px] font-medium text-[color:var(--accent)]"
                >
                  پخش دوباره
                </button>
              </div>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#0A0A0C] bg-engineering-dots p-8">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 90% at 50% 100%, rgba(var(--accent-glow),0.10), transparent 70%)",
                }}
              />
              <motion.div
                key={`${replay}-${s.target}-${s.mode}`}
                initial={initial}
                animate={animate}
                whileHover={hover}
                transition={s.loop ? loopTransition : transition}
                className="relative"
              >
                {s.target === "card" && (
                  <div className="relative h-44 w-72 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17171C] to-[#0B0B0E] p-4 shadow-2xl">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background:
                          "radial-gradient(120% 120% at 100% 0%, rgba(var(--accent-glow),0.28), transparent 60%)",
                      }}
                    />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-[10px] text-zinc-500">RTL · MOTION</span>
                        <span className="h-6 w-8 rounded bg-gradient-to-br from-[color:var(--accent)]/70 to-transparent" />
                      </div>
                      <div>
                        <p className="font-hasti text-[22px] leading-tight text-white">
                          حرکت، زبانِ رابط است
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-zinc-500" dir="ltr">
                          stiffness {s.stiffness} · damping {s.damping} · mass {s.mass}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {s.target === "type" && (
                  <div className="text-center">
                    <p className="font-nastaliq text-[42px] leading-[1.9] text-white">
                      جهان بی‌حرکت، ساکن است
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-zinc-500" dir="ltr">
                      {analysis.settleTime.toFixed(2)}s · ζ {analysis.dampingRatio.toFixed(2)}
                    </p>
                  </div>
                )}

                {s.target === "orb" && (
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,var(--accent),#6366F1,#EC4899,var(--accent))] opacity-70 blur-xl" />
                    <div className="relative h-32 w-32 rounded-full border border-white/20 bg-[#0B0B0E] shadow-inner">
                      <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-px border-t border-white/[0.06] bg-white/[0.04] sm:grid-cols-4">
              {[
                { k: "زمان نشست", v: `${analysis.settleTime.toFixed(2)}s`, icon: Gauge },
                { k: "نسبت میرایی ζ", v: analysis.dampingRatio.toFixed(2), icon: Waves },
                { k: "فراجهش", v: `${analysis.overshoot.toFixed(1)}%`, icon: Zap },
                { k: "فرکانس طبیعی", v: `${analysis.naturalFreq.toFixed(2)}Hz`, icon: Activity },
              ].map((m) => (
                <div key={m.k} className="bg-[#0D0D10] px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <m.icon className="h-3 w-3" />
                    {m.k}
                  </div>
                  <div className="mt-0.5 font-mono text-[15px] tabular-nums text-zinc-100" dir="ltr">
                    {m.v}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel
              title="منحنی حرکت"
              subtitle="موقعیت بر حسب زمان — مستقیماً از انتگرال‌گیری عددی"
              actions={<Badge>{s.mode === "spring" ? "Spring" : "Cubic-bezier"}</Badge>}
            >
              <Graph samples={analysis.samples} accent="var(--accent)" />
              <div className="mt-1 flex items-center justify-between font-mono text-[9.5px] text-zinc-600" dir="ltr">
                <span>0s</span>
                <span>{analysis.settleTime.toFixed(2)}s</span>
                <span>3s</span>
              </div>
            </Panel>

            <Panel title="تنظیمات بیزی" subtitle="در حالت Tween اعمال می‌شود">
              <div className="mb-3">
                <svg viewBox="0 0 100 100" className="h-32 w-full">
                  <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <path
                    d={`M0,100 C${s.bezier[0] * 100},${100 - s.bezier[1] * 100} ${s.bezier[2] * 100},${100 - s.bezier[3] * 100} 100,0`}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.2"
                  />
                  <line x1="0" y1="100" x2={s.bezier[0] * 100} y2={100 - s.bezier[1] * 100} stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" strokeDasharray="2 2" />
                  <line x1="100" y1="0" x2={s.bezier[2] * 100} y2={100 - s.bezier[3] * 100} stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" strokeDasharray="2 2" />
                  <circle cx={s.bezier[0] * 100} cy={100 - s.bezier[1] * 100} r="2" fill="var(--accent)" />
                  <circle cx={s.bezier[2] * 100} cy={100 - s.bezier[3] * 100} r="2" fill="var(--accent)" />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["x1", "y1", "x2", "y2"] as const).map((axis, i) => (
                  <Slider
                    key={axis}
                    label={axis}
                    value={s.bezier[i]}
                    min={axis.startsWith("x") ? 0 : -0.5}
                    max={axis.startsWith("x") ? 1 : 1.5}
                    step={0.01}
                    onChange={(v) => {
                      const next = [...s.bezier] as [number, number, number, number];
                      next[i] = v;
                      set({ bezier: next });
                    }}
                    format={(v) => v.toFixed(2)}
                  />
                ))}
              </div>
            </Panel>
          </div>

          <Panel
            title="کد خروجی"
            subtitle="همان اعداد شبیه‌سازی‌شده، آماده استفاده"
            actions={
              <Segmented
                size="sm"
                value={s.exportTab}
                onChange={(v) => set({ exportTab: v })}
                options={[
                  { value: "motion", label: "Motion" },
                  { value: "css", label: "CSS" },
                  { value: "variants", label: "Variants" },
                ]}
              />
            }
          >
            <CodeBlock
              code={exportCode}
              language={s.exportTab === "css" ? "css" : "tsx"}
              maxLines={26}
              filename={s.exportTab === "css" ? "motion.css" : "motion.tsx"}
            />
          </Panel>
        </div>

        {/* controls */}
        <aside className="space-y-4">
          <Panel title="پارامترهای فنر">
            <div className="space-y-3.5">
              <Slider label="سختی (stiffness)" value={s.stiffness} min={40} max={900} step={10} onChange={(v) => set({ stiffness: v })} />
              <Slider label="میرایی (damping)" value={s.damping} min={4} max={70} step={1} onChange={(v) => set({ damping: v })} />
              <Slider label="جرم (mass)" value={s.mass} min={0.2} max={3} step={0.05} onChange={(v) => set({ mass: v })} format={(v) => v.toFixed(2)} />
              <Slider label="مدت Tween" value={s.durationS} min={0.1} max={2} step={0.05} unit="s" onChange={(v) => set({ durationS: v })} format={(v) => v.toFixed(2)} />
            </div>
          </Panel>

          <Panel title="مسیر حرکت">
            <div className="space-y-3.5">
              <Slider label="فاصله افقی" value={s.distance} min={0} max={320} step={4} unit="px" onChange={(v) => set({ distance: v })} />
              <Slider label="بلور اولیه" value={s.blur} min={0} max={30} unit="px" onChange={(v) => set({ blur: v })} />
              <Slider label="شفافیت اولیه" value={s.opacityFrom} min={0} max={1} step={0.05} onChange={(v) => set({ opacityFrom: v })} format={(v) => v.toFixed(2)} />
              <Slider label="چرخش" value={s.rotate} min={0} max={20} unit="°" onChange={(v) => set({ rotate: v })} />
              <Slider label="بزرگ‌نمایی هاور" value={s.scale} min={1} max={1.3} step={0.01} onChange={(v) => set({ scale: v })} format={(v) => `${v.toFixed(2)}×`} />
              <Slider label="تأخیر پله‌ای" value={s.stagger} min={0} max={0.3} step={0.01} unit="s" onChange={(v) => set({ stagger: v })} format={(v) => v.toFixed(2)} />
              <div className="space-y-2 border-t border-white/[0.06] pt-3">
                <Toggle label="قرینه‌سازی RTL" checked={s.rtl} onChange={(v) => set({ rtl: v })} hint="محور حرکت با جهت صفحه برعکس می‌شود" />
                <Toggle label="حلقه پیوسته" checked={s.loop} onChange={(v) => set({ loop: v })} />
              </div>
            </div>
          </Panel>

          <Panel tone="inset" title="تحلیل مهندسی">
            <ul className="space-y-1.5 text-[11px] text-zinc-400">
              <li className="flex justify-between">
                <span>سرعت اوج</span>
                <span className="font-mono text-zinc-200" dir="ltr">{analysis.peakVelocity.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>تعداد نمونه</span>
                <span className="font-mono text-zinc-200" dir="ltr">{analysis.samples.length}</span>
              </li>
              <li className="flex justify-between">
                <span>وضعیت</span>
                <span className="text-zinc-200">
                  {analysis.dampingRatio < 1 ? "زیرمیرا (نوسانی)" : "بیش‌میرا (بدون پرش)"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Easing CSS</span>
                <span className="font-mono text-[9.5px] text-zinc-500" dir="ltr">linear(…)</span>
              </li>
            </ul>
            <p className="mt-2 rounded-lg bg-black/30 p-2 font-mono text-[9px] leading-relaxed text-zinc-500" dir="ltr">
              {cssEasing.slice(0, 88)}…
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default MotionStudio;
