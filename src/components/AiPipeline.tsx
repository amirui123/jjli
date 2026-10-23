import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brain, Database, FileJson2, Gauge, SlidersHorizontal } from "lucide-react";
import { cn } from "../ui/kit";
import { faNum } from "../lib/format";

interface Stage {
  id: string;
  labelFa: string;
  icon: React.ElementType;
  value: string;
  noteFa: string;
}

/**
 * نمودار زنده‌ی مسیر آموزش مدل فارسی.
 * چهار گره دارد و یک پالس نور روی مسیر حرکت می‌کند؛ گره فعال خودکار جلو می‌رود
 * و با کلیک/لمس هم قابل انتخاب است. اعداد از داده واقعی همان صفحه می‌آیند.
 */
export const AiPipeline: React.FC<{
  pairs: number | null;
  files: number;
  rank: number;
  systemPromptKb: number;
}> = ({ pairs, files, rank, systemPromptKb }) => {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  const stages = useMemo<Stage[]>(
    () => [
      {
        id: "dataset",
        labelFa: "دیتاست",
        icon: Database,
        value: pairs ? `${faNum(pairs)} جفت` : "…",
        noteFa: "جفت‌های واقعی RTL از رجیستری‌های عمومی؛ هر جفت شامل ویژگی، پیام کاربر و پاسخ دستیار است.",
      },
      {
        id: "prompt",
        labelFa: "سیستم‌پرامپت",
        icon: FileJson2,
        value: `${systemPromptKb.toFixed(1)}K چارک`,
        noteFa: "قیدهای RTL، اعداد فارسی و استاندارد موشن در یک فایل؛ همان چیزی که مدل هنگام آموزش می‌بیند.",
      },
      {
        id: "tuning",
        labelFa: "QLoRA",
        icon: SlidersHorizontal,
        value: `r=${faNum(rank)} · ۴بیت`,
        noteFa: "آموزش سبک روی کارت گرافیک معمولی؛ وزن‌ها فریز و فقط آداپتورها آموزش می‌بینند.",
      },
      {
        id: "output",
        labelFa: "کیت آموزش",
        icon: Brain,
        value: `${faNum(files)} فایل`,
        noteFa: "دیتاست، سیستم‌پرامپت و اسکریپت QLoRA یک‌جا؛ همان فایل‌هایی که در همین صفحه دانلود می‌شوند.",
      },
    ],
    [pairs, files, rank, systemPromptKb]
  );

  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setActive((i) => (i + 1) % stages.length), 2800);
    return () => window.clearInterval(t);
  }, [reduced, stages.length]);

  const current = stages[active];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0A0A0C] p-3 sm:p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(70% 120% at 85% 0%, rgba(var(--accent-glow),0.10), transparent 60%)",
        }}
      />

      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Gauge className="h-3 w-3 text-[color:var(--accent)]" />
          مسیر آموزش، زنده
        </div>
        <span className="font-mono text-[9px] tracking-[0.14em] text-zinc-600">
          PIPELINE · {faNum(active + 1)}/{faNum(stages.length)}
        </span>
      </div>

      <div className="relative mt-3">
        <div className="absolute inset-x-4 top-[18px] h-px bg-gradient-to-l from-transparent via-white/12 to-transparent" />
        <motion.div
          aria-hidden
          className="absolute inset-x-4 top-[17px] h-px origin-right bg-gradient-to-l from-[color:var(--accent)]/80 to-transparent"
          animate={reduced ? undefined : { scaleX: [0, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          style={{ boxShadow: "0 0 10px rgba(var(--accent-glow),0.8)" }}
        />
        <div className="grid grid-cols-4 gap-1">
          {stages.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className="group flex min-h-[72px] flex-col items-center gap-1.5 text-center"
                aria-pressed={i === active}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                    i === active
                      ? "border-[color:var(--accent)]/55 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                      : "border-white/10 bg-white/[0.03] text-zinc-500 group-hover:text-zinc-300"
                  )}
                  style={
                    i === active
                      ? { boxShadow: "0 0 22px -8px rgba(var(--accent-glow),0.9)" }
                      : undefined
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "text-[10.5px] leading-tight",
                    i === active ? "text-zinc-100" : "text-zinc-500"
                  )}
                >
                  {s.labelFa}
                </span>
                <span className="font-mono text-[9px] text-zinc-600">{s.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-3 min-h-[46px] rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
            className="text-[11px] leading-relaxed text-zinc-400"
          >
            <span className="me-1 text-[color:var(--accent)]">{current.labelFa}:</span>
            {current.noteFa}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiPipeline;
