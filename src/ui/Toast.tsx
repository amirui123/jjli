import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Download, Info } from "lucide-react";

type Tone = "success" | "error" | "info" | "download";

interface ToastItem {
  id: number;
  title: string;
  desc?: string;
  tone: Tone;
}

interface ToastApi {
  push: (title: string, opts?: { desc?: string; tone?: Tone }) => void;
}

const ToastCtx = createContext<ToastApi>({ push: () => {} });

const ICONS: Record<Tone, React.ElementType> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  download: Download,
};

const TONE_STYLE: Record<Tone, string> = {
  success: "border-emerald-500/30 text-emerald-300",
  error: "border-rose-500/30 text-rose-300",
  info: "border-white/12 text-zinc-300",
  download: "border-[color:var(--accent)]/40 text-[color:var(--accent)]",
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback<ToastApi["push"]>((title, opts) => {
    const id = ++seq.current;
    setItems((prev) => [...prev.slice(-2), { id, title, desc: opts?.desc, tone: opts?.tone ?? "info" }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-24 start-1/2 z-[90] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 sm:start-4 sm:translate-x-0 sm:items-start">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const Icon = ICONS[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={`pointer-events-auto flex w-full items-start gap-2.5 rounded-xl border bg-[#0D0D10]/95 px-3 py-2.5 shadow-2xl backdrop-blur ${TONE_STYLE[t.tone]}`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11.5px] font-medium leading-snug text-zinc-100">{t.title}</p>
                  {t.desc && (
                    <p className="mt-0.5 truncate font-mono text-[9.5px] text-zinc-500" dir="ltr">
                      {t.desc}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
};

export function useToast() {
  return useContext(ToastCtx);
}
