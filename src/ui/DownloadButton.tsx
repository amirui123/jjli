import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Loader2 } from "lucide-react";
import { useToast } from "./Toast";
import { cn } from "./kit";
import { soundEngine } from "../engines/soundEngine";

type State = "idle" | "busy" | "done";

export const DownloadButton: React.FC<{
  /** Performs the actual save and resolves truthy on success. */
  onDownload: () => Promise<unknown> | unknown;
  label?: string;
  /** shown in the success toast */
  filename?: string;
  compact?: boolean;
  variant?: "solid" | "ghost" | "outline";
  className?: string;
  title?: string;
}> = ({ onDownload, label = "دانلود", filename, compact, variant = "outline", className, title }) => {
  const [state, setState] = useState<State>("idle");
  const toast = useToast();

  const run = async () => {
    if (state === "busy") return;
    setState("busy");
    try {
      const result = await onDownload();
      if (result === false) throw new Error("failed");
      soundEngine.playSuccess();
      setState("done");
      toast.push("دانلود آماده شد", { desc: filename, tone: "download" });
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
      toast.push("دانلود انجام نشد", { desc: filename, tone: "error" });
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      title={title ?? label}
      aria-label={label}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-lg border font-medium transition-all duration-150 active:scale-[0.97]",
        compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]",
        variant === "solid" &&
          "border-[color:var(--accent)]/50 bg-[color:var(--accent)] text-black hover:brightness-110",
        variant === "outline" &&
          "border-white/12 bg-white/[0.03] text-zinc-300 hover:border-[color:var(--accent)]/50 hover:text-white",
        variant === "ghost" && "border-transparent bg-transparent text-zinc-500 hover:text-zinc-100",
        state === "done" && "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="flex items-center gap-1.5"
        >
          {state === "busy" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : state === "done" ? (
            <Check className="h-3 w-3" />
          ) : (
            <Download className="h-3 w-3 transition-transform group-hover:translate-y-0.5" />
          )}
          {!compact && <span>{state === "done" ? "دانلود شد" : state === "busy" ? "…" : label}</span>}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
