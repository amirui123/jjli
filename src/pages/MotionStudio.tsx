import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Gauge, Play, Waves, Zap } from "lucide-react";
import { usePersisted, useAppSettings } from "../lib/store";
import {
  MOTION_PRESETS,
  simulateSpring,
  springToCssLinear,
  type MotionPreset,
  type SpringParams,
} from "../lib/spring";
import { saveKit, saveText } from "../lib/download";
import {
  Badge,
  CodeBlock,
  Panel,
  Segmented,
  Slider,
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";

type Target = "card" | "type" | "orb";
type Mode = "spring" | "tween";

interface MotionSettings extends SpringParams {
  presetId: string;
  target: Target;
  mode: Mode;
  distance: number;
  liftY: number;
  durationS: number;
  scale: number;
  initialScale: number;
  rotate: number;
  rotateX: number;
  blur: number;
  opacityFrom: number;
  stagger: number;
  cascadeCount: number;
  simHz: 60 | 120 | 144;
  rtl: boolean;
  loop: boolean;
  bezier: [number, number, number, number];
  exportTab: "motion" | "css" | "variants" | "raf120";
  /** the visitor's own content, used by every preview and by the code output */
  content: string;
}

const DEFAULT: MotionSettings = {
  presetId: "silk",
  stiffness: 120,
  damping: 22,
  mass: 1,
  target: "type",
  mode: "spring",
  distance: 80,
  liftY: 0,
  durationS: 0.6,
  scale: 1.02,
  initialScale: 0.94,
  rotate: 0,
  rotateX: 0,
  blur: 10,
  opacityFrom: 0,
  stagger: 0.06,
  cascadeCount: 1,
  simHz: 120,
  rtl: true,
  loop: false,
  bezier: [0.22, 1, 0.36, 1],
  exportTab: "motion",
  content: "حرکت، زبانِ رابط است",
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
  const targetY = H - ((1 - min) / range) * H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none" aria-label="منحنی حرکت">
      <line x1="0" y1={targetY} x2={W} y2={targetY} stroke="rgba(255,255,255,0.12)" strokeDasharray="2 2" strokeWidth="0.4" />
      <path d={path} fill="none" stroke={accent} strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const MotionStudio: React.FC = () => {
  const [raw, set, reset] = usePersisted<MotionSettings>("studio-motion", DEFAULT);
  const s = { ...DEFAULT, ...raw };
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
    y: s.liftY ?? 0,
    opacity: s.opacityFrom,
    scale: s.initialScale ?? 0.94,
    rotate: s.rotate * dirSign,
    rotateX: s.rotateX ?? 0,
    filter: `blur(${s.blur}px)`,
  };
  const animate = { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0, rotateX: 0, filter: "blur(0px)" };
  const hover = { scale: s.scale, rotate: s.rotate * 0.6 * dirSign };
  const loopTransition = { ...transition, repeat: Infinity, repeatType: "reverse" as const, repeatDelay: 0.5 };

  const replayAll = () => {
    setReplay((r) => r + 1);
    soundEngine.playSpring();
  };

  const applyPreset = (p: MotionPreset) => {
    soundEngine.playTick(1.1);
    set({
      presetId: p.id,
      mode: p.mode,
      stiffness: p.params.stiffness,
      damping: p.params.damping,
      mass: p.params.mass,
      durationS: p.durationS,
      bezier: p.bezier,
      distance: p.distance,
      rotate: p.rotate,
      blur: p.blur,
      opacityFrom: p.opacityFrom,
      scale: p.scale,
      target: p.target,
    });
    setReplay((r) => r + 1);
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
  initial={{ x: ${initial.x}, opacity: ${initial.opacity}, rotate: ${Math.round(initial.rotate)}, filter: "blur(${s.blur}px)" }}
  animate={{ x: 0, opacity: 1, rotate: 0, filter: "blur(0px)" }}
  whileHover={{ scale: ${s.scale} }}
  transition={transition}
/>`;

  const cssSnippet = `/* فنر ${s.stiffness}/${s.damping}/${s.mass} → ${analysis.settleTime.toFixed(2)}s */
.enter {
  transition: transform ${analysis.settleTime.toFixed(2)}s ${cssEasing},
              opacity ${analysis.settleTime.toFixed(2)}s ${cssEasing};
  transform: translateX(0);
  opacity: 1;
}

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
};`;

  const raf120Snippet = `// Rory Driscoll Frame-Rate Independent Damping (${s.simHz ?? 120}Hz ProMotion Calibrated)
// Natural Frequency: ${analysis.naturalFreq.toFixed(2)}Hz · Damping Ratio ζ: ${analysis.dampingRatio.toFixed(2)}
export function dampRtlFrameIndependent(
  current: number,
  target: number,
  dtSeconds = ${(1 / (s.simHz ?? 120)).toFixed(5)}
): number {
  const decay = ${(analysis.naturalFreq * 4.2).toFixed(2)};
  return current + (target - current) * (1 - Math.exp(-decay * dtSeconds));
}`;

  const exportCode = {
    motion: motionSnippet,
    css: cssSnippet,
    variants: variantsSnippet,
    raf120: raf120Snippet,
  }[s.exportTab];
  const preset = MOTION_PRESETS.find((p) => p.id === s.presetId);

  const downloadConfig = () =>
    saveKit(`rtl-motion-${s.presetId}`, [
      { name: "MotionCard.tsx", content: `${motionSnippet}\n\n// متن نمونه: ${s.content}\n` },
      {
        name: "motion.css",
        content: `${cssSnippet}\n\n/* easing تولیدشده از شبیه‌سازی فنر */\n.enter { --easing: ${cssEasing}; }\n`,
      },
      {
        name: "tokens.json",
        content: JSON.stringify(
          {
            preset: s.presetId,
            spring: { stiffness: s.stiffness, damping: s.damping, mass: s.mass },
            metrics: {
              settleTime: Number(analysis.settleTime.toFixed(3)),
              dampingRatio: Number(analysis.dampingRatio.toFixed(3)),
              overshoot: Number(analysis.overshoot.toFixed(2)),
            },
            distance: s.distance,
            rotate: s.rotate,
            blur: s.blur,
            opacityFrom: s.opacityFrom,
            scale: s.scale,
            rtlMirrored: s.rtl,
          },
          null,
          2
        ),
      },
      {
        name: "README.txt",
        content: `RTL Motion Lab — ${preset?.labelFa ?? "حرکت سفارشی"}
${preset?.hintFa ?? ""}

زمان نشست: ${analysis.settleTime.toFixed(2)}s
نسبت میرایی: ${analysis.dampingRatio.toFixed(2)}
فراجهش: ${analysis.overshoot.toFixed(1)}%
فرکانس طبیعی: ${analysis.naturalFreq.toFixed(2)}Hz

همه اعداد از شبیه‌سازی عددی فنر به‌دست آمده‌اند.
`,
      },
    ]);

  /* --------------------------------------------------------------- stage */

  const stage = (
    <div className="space-y-4">
      <Panel padded={false} className="overflow-hidden desk:sticky desk:top-0 desk:z-20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
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
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              value={s.content}
              onChange={(e) => set({ content: e.target.value })}
              dir="rtl"
              aria-label="متن پیش‌نمایش"
              placeholder="متن خودت را بنویس…"
              className="w-[150px] max-w-full rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1 text-[12px] text-zinc-200 outline-none focus:border-[color:var(--accent)]/50 sm:w-[190px] sm:text-[10.5px]"
            />
            <Badge tone={quality.tone}>{quality.label}</Badge>
            <Badge>{analysis.settleTime.toFixed(2)}s</Badge>
            <button
              onClick={replayAll}
              className="flex items-center gap-1 rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-2.5 py-1 text-[10.5px] font-medium text-[color:var(--accent)]"
            >
              <Play className="h-3 w-3" />
              پخش
            </button>
            <DownloadButton
              label="دانلود کیت"
              filename={`rtl-motion-${s.presetId}.zip`}
              onDownload={downloadConfig}
              variant="solid"
            />
          </div>
        </div>

        <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-[#0A0A0C] bg-engineering-dots p-6 sm:min-h-[260px]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(70% 90% at 50% 100%, rgba(var(--accent-glow),0.10), transparent 70%)",
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
              <div className="relative h-44 w-72 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17171C] to-[#0B0B0E] p-4 shadow-2xl">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(var(--accent-glow),0.28), transparent 60%)" }}
                />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] text-zinc-500">RTL · MOTION</span>
                    <span className="h-6 w-8 rounded bg-gradient-to-br from-[color:var(--accent)]/70 to-transparent" />
                  </div>
                  <div>
                    <p className="font-hasti text-[22px] leading-tight text-white">{s.content || DEFAULT.content}</p>
                    <p className="mt-1 font-mono text-[10px] text-zinc-500" dir="ltr">
                      {s.stiffness}/{s.damping}/{s.mass}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {s.target === "type" && (
              <div className="text-center">
                <p className="font-nastaliq text-[38px] leading-[1.9] text-white">{s.content || DEFAULT.content}</p>
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
        <Panel title="منحنی حرکت" subtitle="موقعیت بر حسب زمان — انتگرال‌گیری عددی" actions={<Badge>{s.mode === "spring" ? "Spring" : "Bezier"}</Badge>}>
          <Graph samples={analysis.samples} accent="var(--accent)" />
          <div className="mt-1 flex items-center justify-between font-mono text-[9.5px] text-zinc-600" dir="ltr">
            <span>0s</span>
            <span>{analysis.settleTime.toFixed(2)}s</span>
            <span>3s</span>
          </div>
        </Panel>

        <Panel title="تنظیمات بیزی" subtitle="در حالت Tween اعمال می‌شود">
          <svg viewBox="0 0 100 100" className="h-28 w-full">
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <path
              d={`M0,100 C${s.bezier[0] * 100},${100 - s.bezier[1] * 100} ${s.bezier[2] * 100},${100 - s.bezier[3] * 100} 100,0`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.2"
            />
            <circle cx={s.bezier[0] * 100} cy={100 - s.bezier[1] * 100} r="2" fill="var(--accent)" />
            <circle cx={s.bezier[2] * 100} cy={100 - s.bezier[3] * 100} r="2" fill="var(--accent)" />
          </svg>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["x1", "y1", "x2", "y2"] as const).map((axis, i) => (
              <Slider
                key={axis}
                label={axis}
                value={s.bezier[i]}
                min={axis.startsWith("x") ? 0 : -0.5}
                max={axis.startsWith("x") ? 1 : 1.5}
                step={0.01}
                format={(v) => v.toFixed(2)}
                onChange={(v) => {
                  const next = [...s.bezier] as [number, number, number, number];
                  next[i] = v;
                  set({ bezier: next });
                }}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="کد خروجی"
        subtitle="همان اعداد شبیه‌سازی‌شده، آماده استفاده"
        actions={
          <>
            <Segmented
              size="sm"
              value={s.exportTab}
              onChange={(v) => set({ exportTab: v })}
              options={[
                { value: "motion", label: "Motion" },
                { value: "css", label: "CSS" },
                { value: "variants", label: "Variants" },
                { value: "raf120", label: `${s.simHz ?? 120}Hz Damp` },
              ]}
            />
            <DownloadButton
              compact
              label="دانلود"
              filename={`${s.presetId}.${s.exportTab === "css" ? "css" : "tsx"}`}
              onDownload={() =>
                saveText(
                  exportCode,
                  `${s.presetId}.${s.exportTab === "css" ? "css" : "tsx"}`,
                  s.exportTab === "css" ? "text/css" : "text/typescript"
                )
              }
            />
          </>
        }
      >
        <CodeBlock
          code={exportCode}
          language={s.exportTab === "css" ? "css" : "tsx"}
          filename={s.exportTab === "css" ? "motion.css" : "motion.tsx"}
          maxLines={24}
        />
      </Panel>
    </div>
  );

  /* ------------------------------------------------------------ settings */

  const settings = (
    <div className="space-y-4">
      <Panel title="پارامترهای فنر">
        <div className="space-y-3.5">
          <Slider label="سختی (stiffness)" value={s.stiffness} min={40} max={900} step={10} onChange={(v) => set({ stiffness: v })} />
          <Slider label="میرایی (damping)" value={s.damping} min={4} max={70} onChange={(v) => set({ damping: v })} />
          <Slider label="جرم (mass)" value={s.mass} min={0.2} max={3} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => set({ mass: v })} />
          <Slider label="مدت Tween" value={s.durationS} min={0.1} max={2} step={0.05} unit="s" format={(v) => v.toFixed(2)} onChange={(v) => set({ durationS: v })} />
        </div>
      </Panel>

      <Panel title="مسیر و ابعاد حرکت (شخصی‌سازی پیشرفته)">
        <div className="space-y-3.5">
          <div>
            <div className="mb-1 text-[10.5px] text-zinc-400">نرخ نوسازی هدف (Refresh Rate):</div>
            <Segmented
              className="w-full"
              size="sm"
              value={String(s.simHz ?? 120) as "60" | "120" | "144"}
              onChange={(v) => set({ simHz: Number(v) as 60 | 120 | 144 })}
              options={[
                { value: "60", label: "60Hz" },
                { value: "120", label: "120Hz ProMotion" },
                { value: "144", label: "144Hz" },
              ]}
            />
          </div>
          <Slider label="فاصله افقی (X)" value={s.distance} min={0} max={320} step={4} unit="px" onChange={(v) => set({ distance: v })} />
          <Slider label="پرش عمودی (Lift Y)" value={s.liftY ?? 0} min={-120} max={120} step={4} unit="px" onChange={(v) => set({ liftY: v })} />
          <Slider label="مقیاس اولیه ورود (Initial Scale)" value={s.initialScale ?? 0.94} min={0.5} max={1.25} step={0.02} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => set({ initialScale: v })} />
          <Slider label="بلور اولیه (Motion Blur)" value={s.blur} min={0} max={30} unit="px" onChange={(v) => set({ blur: v })} />
          <Slider label="شفافیت اولیه (Opacity)" value={s.opacityFrom} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => set({ opacityFrom: v })} />
          <Slider label="چرخش دوبعدی (Rotate Z)" value={s.rotate} min={0} max={30} unit="°" onChange={(v) => set({ rotate: v })} />
          <Slider label="چرخش سه‌بعدی (Tilt X)" value={s.rotateX ?? 0} min={-40} max={40} step={2} unit="°" onChange={(v) => set({ rotateX: v })} />
          <Slider label="بزرگ‌نمایی هاور (Hover Scale)" value={s.scale} min={1} max={1.35} step={0.01} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => set({ scale: v })} />
          <Slider label="تأخیر پله‌ای (Stagger)" value={s.stagger} min={0} max={0.3} step={0.01} unit="s" format={(v) => v.toFixed(2)} onChange={(v) => set({ stagger: v })} />
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
            <span>نمونه‌ها</span>
            <span className="font-mono text-zinc-200" dir="ltr">{analysis.samples.length}</span>
          </li>
          <li className="flex justify-between">
            <span>وضعیت</span>
            <span className="text-zinc-200">{analysis.dampingRatio < 1 ? "زیرمیرا" : "بیش‌میرا"}</span>
          </li>
        </ul>
        <p className="mt-2 rounded-lg bg-black/30 p-2 font-mono text-[9px] leading-relaxed text-zinc-500" dir="ltr">
          {cssEasing.slice(0, 88)}…
        </p>
      </Panel>
    </div>
  );

  /* ---------------------------------------------------------------- list */

  const rows = MOTION_PRESETS.map((p) => {
    const active = p.id === s.presetId;
    const pAnalysis = simulateSpring(p.params);
    return (
      <div
        key={p.id}
        className={cn(
          "group rounded-xl border transition-colors",
          active
            ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.07]"
            : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"
        )}
      >
        <button
          data-motion-preset={p.id}
          onClick={() => applyPreset(p)}
          className="w-full px-2.5 py-2 text-start"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-zinc-100">{p.labelFa}</span>
            <span className="font-mono text-[9px] text-zinc-600">{pAnalysis.settleTime.toFixed(2)}s</span>
          </span>
          <span className="mt-0.5 block truncate text-[10px] text-zinc-500">{p.hintFa}</span>
          <span className="mt-1.5 flex h-1 gap-0.5 overflow-hidden rounded-full">
            <span className="h-full rounded-full bg-[color:var(--accent)]/70" style={{ width: `${Math.min(100, pAnalysis.settleTime * 70)}%` }} />
            <span className="h-full flex-1 rounded-full bg-white/5" />
          </span>
        </button>
      </div>
    );
  });

  return (
    <StudioShell
      eyebrow="MOTION STUDIO"
      title="استودیو فیزیک حرکت"
      description="پیش‌نمایش زنده، فهرست حرکت‌های آماده کنار آن، و تنظیمات کامل فنر سمت چپ. منحنی و کد خروجی از شبیه‌سازی واقعی ساخته می‌شوند."
      icon={Activity}
      stats={
        <>
          <Badge tone="accent">{faNum(MOTION_PRESETS.length)} حرکت آماده</Badge>
          <Badge>۶۰fps</Badge>
        </>
      }
      actions={
        <DownloadButton label="دانلود کیت" filename={`rtl-motion-${s.presetId}.zip`} onDownload={downloadConfig} />
      }
      onReset={() => {
        reset();
        soundEngine.playSnap();
      }}
      listWidth="230px"
      settingsWidth="308px"
      list={
        <StudioList
          title="حرکت‌های آماده"
          subtitle={`${faNum(MOTION_PRESETS.length)} رسیپی · قابل ویرایش`}
          className="min-h-[360px] desk:min-h-0"
          footer="با انتخاب هر مورد، پیش‌نمایش و اعداد به‌روز می‌شوند"
        >
          {rows}
          <button
            onClick={() => {
              set({ presetId: "custom" });
              setReplay((r) => r + 1);
            }}
            className={cn(
              "mt-1 w-full rounded-xl border border-dashed px-2.5 py-2 text-center text-[10.5px] transition-colors",
              s.presetId === "custom"
                ? "border-[color:var(--accent)]/50 text-[color:var(--accent)]"
                : "border-white/10 text-zinc-500 hover:text-zinc-200"
            )}
          >
            {s.presetId === "custom" ? "حالت سفارشی فعال" : "ساخت حالت سفارشی"}
          </button>
        </StudioList>
      }
      stage={stage}
      settings={settings}
    />
  );
};

export default MotionStudio;
