import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ALargeSmall,
  Check,
  Clapperboard,
  Github,
  Palette,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Type,
  X,
  Zap,
} from "lucide-react";
import { ROUTES, navigate, useRouter, type RouteMeta } from "../lib/router";
import { publicUrl } from "../lib/base";
import { ACCENTS, useAppSettings } from "../lib/store";
import {
  ACCENT_COPY,
  APPEARANCE_COPY,
  COMMAND_COPY,
  DISPLAY_FONTS,
  DOCK_COPY,
  DOCK_LABELS,
  DOCK_TUNING,
  MOTION_LEVELS,
  TEXT_SCALES,
  TOPBAR_COPY,
} from "./nav";
import { cn } from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";
import { FOOTER_COUPLET } from "./introCopy";

const PSYCHOLOGY_NOTES: Record<string, string> = {
  saffron: "کانون گرم توجه · کنتراست طلایی",
  turquoise: "تله‌متری مهندسی · تمرکز آرام",
  lapis: "عمق شناختی · تفکر تحلیلی",
  emerald: "تعادل زیستی · تایید آنی",
  rose: "انرژی جنبشی · موج صوتی",
  violet: "خلاقیت فضایی · سنتز هوش مصنوعی",
};

/* ------------------------------------------------------------------ top bar */

/** Small, readable switch used inside the appearance panel. */
const Switch: React.FC<{
  id: string;
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}> = ({ id, on, onChange, label, hint }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    id={id}
    onClick={() => onChange(!on)}
    className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1.5 text-start transition-colors hover:bg-white/[0.04]"
  >
    <span className="min-w-0">
      <span className="block text-[12px] font-medium text-zinc-200">{label}</span>
      {hint && <span className="block text-[11px] leading-snug text-zinc-500">{hint}</span>}
    </span>
    <span
      aria-hidden
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
        on
          ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/80"
          : "border-white/15 bg-white/[0.06]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all",
          on ? "start-[calc(100%-1rem)]" : "start-0.5"
        )}
      />
    </span>
  </button>
);

const SegmentRow = <T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) => (
  <div
    role="group"
    aria-label={ariaLabel}
    className="grid gap-1.5"
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}
  >
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(o.value)}
          className={cn(
            "truncate rounded-lg border px-2 py-1.5 text-[12px] font-medium transition-colors",
            active
              ? "border-[color:var(--accent)]/55 bg-[color:var(--accent)]/16 text-white"
              : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-100"
          )}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const TopBar: React.FC = () => {
  const { meta } = useRouter();
  const { settings, update, reset, accent } = useAppSettings();
  const [accentOpen, setAccentOpen] = useState(false);
  const [tuningOpen, setTuningOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const lastHoverTickRef = useRef(0);

  const playSubtleHover = () => {
    if (!settings.sound || !soundEngine.isUnlocked()) return;
    const now = performance.now();
    if (now - lastHoverTickRef.current > 75) {
      lastHoverTickRef.current = now;
      soundEngine.playTick(0.6);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setAccentOpen(false);
        setTuningOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tuningDirty =
    settings.highContrast ||
    settings.fontScale > 1 ||
    settings.reduceMotion ||
    settings.motionLevel !== 3 ||
    settings.displayFont !== "font-hasti";

  /* one shell for every action button so the cluster stays optically aligned */
  const actionBase =
    "tap-icon relative flex shrink-0 items-center justify-center gap-2 rounded-xl border transition-colors duration-150";
  const actionIdle =
    "border-white/[0.09] bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white";
  const actionLit = "border-[color:var(--accent)]/45 bg-[color:var(--accent)]/14 text-white";

  return (
    <>
      <header className="app-topbar sticky top-0 z-40 border-b border-white/[0.07] bg-[#05060A]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-1.5 px-2.5 sm:gap-2.5 sm:px-5">
          {/* ── BRAND ─────────────────────────────────────────────────────── */}
          <button
            onClick={() => {
              if (settings.sound) soundEngine.playSnap();
              navigate("/");
            }}
            onMouseEnter={playSubtleHover}
            className="group flex min-w-0 items-center gap-2.5 text-start"
            aria-label={TOPBAR_COPY.brandName}
          >
            <span
              aria-hidden
              className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-gradient-to-b from-[#141824] to-[#080A10] transition-transform duration-300 group-hover:scale-105"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.14), 0 0 26px -6px rgba(var(--accent-glow),0.75)",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(var(--accent-glow),0.32), transparent 70%)",
                }}
              />
              <span className="font-hasti relative z-10 text-[16px] leading-none text-[color:var(--accent)] after:content-['م']" />
            </span>
            <span className="hidden min-w-0 min-[360px]:block">
              <span className="block truncate text-[12.5px] font-bold leading-tight text-zinc-100 transition-colors group-hover:text-white">
                {TOPBAR_COPY.brandName}
              </span>
            </span>
          </button>

          {/* ── BREADCRUMB (replaces the old duplicated section nav) ───────── */}
          <nav
            aria-label={TOPBAR_COPY.breadcrumbLabel}
            className="ms-2 hidden min-w-0 items-center gap-2.5 border-s border-white/[0.08] ps-3.5 md:flex"
          >
            <span className="shrink-0 text-[11px] font-medium text-zinc-500">
              {TOPBAR_COPY.youAreHere}
            </span>
            <span
              aria-current="page"
              className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.035] px-2 py-1"
            >
              <span
                aria-hidden
                className="shrink-0 text-[12px] leading-none"
                style={{ color: meta.accent }}
              >
                {meta.glyph}
              </span>
              <span className="truncate text-[12px] font-semibold leading-none text-zinc-100">
                {meta.labelFa}
              </span>
            </span>
            <span className="hidden truncate text-[11.5px] text-zinc-500 xl:inline">
              {meta.descFa}
            </span>
          </nav>

          <div className="flex-1" />

          {/* ── ACTIONS ───────────────────────────────────────────────────── */}
          <button
            onClick={() => {
              if (settings.sound) soundEngine.playTick(1);
              setCmdOpen(true);
            }}
            onMouseEnter={playSubtleHover}
            aria-label={TOPBAR_COPY.searchHint}
            title={`${TOPBAR_COPY.searchHint} (⌘K)`}
            className={cn(actionBase, actionIdle, "h-9 w-9 sm:w-auto sm:px-2.5")}
          >
            <Search className="h-4 w-4 text-[color:var(--accent)]" />
            <span className="hidden text-[12px] sm:inline">{TOPBAR_COPY.search}</span>
            <kbd className="me-0.5 hidden h-[18px] items-center rounded border border-white/10 bg-black/40 px-1.5 font-mono text-[10px] leading-none text-zinc-400 after:content-['⌘K'] lg:inline-flex" />
          </button>

          {/* appearance / accessibility */}
          <div className="relative">
            <button
              onClick={() => {
                if (settings.sound) soundEngine.playTick(1.1);
                setAccentOpen(false);
                setTuningOpen((v) => !v);
              }}
              onMouseEnter={playSubtleHover}
              aria-label={TOPBAR_COPY.appearance}
              aria-expanded={tuningOpen}
              title={TOPBAR_COPY.appearance}
              className={cn(
                actionBase,
                "h-9 w-9",
                tuningOpen || tuningDirty ? actionLit : actionIdle
              )}
            >
              <Settings2 className="h-4 w-4" />
              {tuningDirty && !tuningOpen && (
                <span
                  aria-hidden
                  className="absolute end-1 top-1 h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"
                />
              )}
            </button>

            {tuningOpen && (
              <button
                type="button"
                aria-label={TOPBAR_COPY.closeAppearance}
                tabIndex={-1}
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setTuningOpen(false)}
              />
            )}

            <AnimatePresence>
              {tuningOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute end-0 top-11 z-50 w-[min(21rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-white/15 bg-[#0B0D14]/98 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-3.5 py-2.5">
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-white">
                        {APPEARANCE_COPY.title}
                      </div>
                      <div className="truncate text-[11px] text-zinc-500">
                        {APPEARANCE_COPY.subtitle}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playTick(0.9);
                        reset();
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-zinc-400 hover:border-white/20 hover:text-white"
                      title={TOPBAR_COPY.resetTitle}
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>{APPEARANCE_COPY.reset}</span>
                    </button>
                  </div>

                  <div className="max-h-[min(30rem,70dvh)] space-y-4 overflow-y-auto px-3.5 py-3 studio-scroll">
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-300">
                        <Type className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                        {APPEARANCE_COPY.font}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {DISPLAY_FONTS.map((df) => {
                          const active = (settings.displayFont || "font-hasti") === df.id;
                          return (
                            <button
                              key={df.id}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                soundEngine.playSnap();
                                update({ displayFont: df.id });
                              }}
                              className={cn(
                                "rounded-lg border px-1.5 py-1.5 text-center transition-colors",
                                active
                                  ? "border-[color:var(--accent)]/55 bg-[color:var(--accent)]/16 text-white"
                                  : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-100"
                              )}
                            >
                              <span className={cn("block text-[13px] leading-tight", df.id)}>
                                {df.sample}
                              </span>
                              <span className="mt-0.5 block truncate text-[10.5px] text-zinc-500">
                                {df.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-300">
                        <ALargeSmall className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                        {APPEARANCE_COPY.scale}
                      </div>
                      <SegmentRow
                        ariaLabel={APPEARANCE_COPY.scale}
                        value={settings.fontScale}
                        onChange={(v) => update({ fontScale: v as 1 | 1.08 | 1.15 })}
                        options={TEXT_SCALES}
                      />
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-300">
                        <Zap className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                        {APPEARANCE_COPY.motion}
                      </div>
                      <SegmentRow
                        ariaLabel={APPEARANCE_COPY.motion}
                        value={settings.motionLevel}
                        onChange={(v) => update({ motionLevel: v as 1 | 2 | 3 })}
                        options={MOTION_LEVELS}
                      />
                    </div>

                    <div className="space-y-0.5 border-t border-white/[0.07] pt-2.5">
                      <Switch
                        id="toggle-contrast"
                        on={settings.highContrast}
                        onChange={(v) => update({ highContrast: v })}
                        label={APPEARANCE_COPY.contrast}
                        hint={APPEARANCE_COPY.contrastHint}
                      />
                      <Switch
                        id="toggle-sound"
                        on={settings.sound}
                        onChange={async (v) => {
                          soundEngine.enabled = v;
                          update({ sound: v });
                          if (v) {
                            await soundEngine.unlock();
                            soundEngine.playSuccess();
                          }
                        }}
                        label={APPEARANCE_COPY.sound}
                        hint={APPEARANCE_COPY.soundHint}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTuningOpen(false);
                        window.dispatchEvent(new CustomEvent("rtmlab:open-intro"));
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[11.5px] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                      <Clapperboard className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                      {APPEARANCE_COPY.replayIntro}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* accent / colour psychology */}
          <div className="relative">
            <button
              onClick={() => {
                if (settings.sound) soundEngine.playTick(1);
                setTuningOpen(false);
                setAccentOpen((v) => !v);
              }}
              onMouseEnter={playSubtleHover}
              className={cn(actionBase, "h-9 w-9", accentOpen ? actionLit : actionIdle)}
              aria-label={TOPBAR_COPY.accent}
              aria-expanded={accentOpen}
              title={ACCENT_COPY.panelTitleFull}
            >
              <span
                className="h-4 w-4 rounded-full shadow-[0_0_12px_rgba(var(--accent-glow),0.8)]"
                style={{ background: accent.hex }}
              />
            </button>
            {accentOpen && (
              <button
                type="button"
                aria-label={ACCENT_COPY.close}
                tabIndex={-1}
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setAccentOpen(false)}
              />
            )}
            <AnimatePresence>
              {accentOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute end-0 top-11 z-50 w-[min(17rem,calc(100vw-1.25rem))] rounded-2xl border border-white/15 bg-[#0B0D14]/98 p-2.5 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
                >
                  <div className="mb-2 flex items-center justify-between border-b border-white/[0.07] px-1 pb-2">
                    <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-zinc-200">
                      <Palette className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                      {ACCENT_COPY.panelTitle}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">{ACCENT_COPY.ratio}</span>
                  </div>
                  <div className="space-y-0.5">
                    {ACCENTS.map((a) => {
                      const active = settings.accent === a.id && !settings.customAccent;
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            soundEngine.playSnap();
                            update({ accent: a.id, customAccent: null });
                            setAccentOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-white/[0.06]",
                            active ? "bg-white/[0.05] text-white" : "text-zinc-300"
                          )}
                        >
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full"
                            style={{ background: a.hex, boxShadow: `0 0 10px ${a.hex}88` }}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-bold leading-tight">
                              {a.labelFa}
                            </span>
                            <span className="block truncate text-[10.5px] leading-tight text-zinc-500">
                              {PSYCHOLOGY_NOTES[a.id]}
                            </span>
                          </span>
                          {active && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 flex items-center gap-2 border-t border-white/[0.07] pt-2">
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-zinc-400 hover:text-zinc-200">
                      <input
                        type="color"
                        value={settings.customAccent ?? accent.hex}
                        onChange={(e) => update({ customAccent: e.target.value })}
                        className="h-6 w-6 cursor-pointer rounded border border-white/10 bg-transparent"
                        aria-label={ACCENT_COPY.customPicker}
                      />
                      <span>{ACCENT_COPY.custom}</span>
                    </label>
                    {settings.customAccent && (
                      <button
                        onClick={() => update({ customAccent: null })}
                        className="ms-auto rounded-lg border border-white/10 px-2 py-0.5 text-[10.5px] text-zinc-400 hover:text-white"
                      >
                        {ACCENT_COPY.backToPalette}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="https://github.com/amirui123/jjli"
            target="_blank"
            rel="noreferrer noopener"
            onMouseEnter={playSubtleHover}
            className={cn(actionBase, actionIdle, "hidden h-9 w-9 lg:flex")}
            aria-label={TOPBAR_COPY.github}
            title={TOPBAR_COPY.github}
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
};

/* --------------------------------------------------------- command palette */

const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ROUTES;
    return ROUTES.filter(
      (r) =>
        r.labelFa.includes(term) ||
        r.labelEn.toLowerCase().includes(term) ||
        r.descFa.includes(term)
    );
  }, [q]);

  useEffect(() => setActive(0), [q]);

  const go = (index: number) => {
    const target = results[index];
    if (!target) return;
    soundEngine.playSnap();
    navigate(target.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/75 px-4 pt-[13vh] backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0B0D14] shadow-[0_28px_80px_-12px_rgba(0,0,0,0.95)]"
          >
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-3.5 py-3">
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-autocomplete="list"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => (results.length ? (i + 1) % results.length : 0));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) =>
                      results.length ? (i - 1 + results.length) % results.length : 0
                    );
                  } else if (e.key === "Enter") {
                    go(active);
                  }
                }}
                placeholder={COMMAND_COPY.placeholder}
                className="w-full bg-transparent text-[13px] text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <button onClick={onClose} aria-label={COMMAND_COPY.close}>
                <X className="h-4 w-4 text-zinc-500 hover:text-zinc-200" />
              </button>
            </div>
            <div
              id="command-results"
              role="listbox"
              aria-label={COMMAND_COPY.results}
              className="max-h-80 overflow-y-auto p-1.5"
            >
              {results.map((r, i) => (
                <button
                  key={r.id}
                  id={`cmd-${r.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors",
                    i === active ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                  )}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl border text-[13px] font-bold"
                    style={{
                      borderColor: `${r.accent}40`,
                      color: r.accent,
                      background: `${r.accent}15`,
                    }}
                  >
                    {r.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold text-zinc-100">{r.labelFa}</span>
                    <span className="block truncate text-[10.5px] text-zinc-400">{r.descFa}</span>
                  </span>
                  <span className="ms-auto font-mono text-[9.5px] text-zinc-500">{r.labelEn}</span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-[11.5px] text-zinc-500">
                  نتیجه‌ای پیدا نشد
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------------------------------------------------------------- bottom dock */

/**
 * A single dock item.
 *
 * Magnification is driven by the pointer's distance from the item's centre and
 * runs entirely on MotionValues + a spring — no React state, so moving the
 * cursor across the dock never re-renders the tree (60fps, per the project's
 * own motion doctrine). `transform-origin: bottom` makes items grow upward and
 * keeps neighbours from reflowing.
 */
const DockItem: React.FC<{
  route: RouteMeta;
  active: boolean;
  mouseX: MotionValue<number>;
  strength: number;
  sound: boolean;
  onHover: (route: RouteMeta | null) => void;
}> = ({ route, active, mouseX, strength, sound, onHover }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return DOCK_TUNING.range * 2;
    return x - (box.x + box.width / 2);
  });

  const peak = 1 + (DOCK_TUNING.maxScale - 1) * strength;
  const scaleTarget = useTransform(
    distance,
    [-DOCK_TUNING.range, 0, DOCK_TUNING.range],
    [1, peak, 1]
  );
  const scale = useSpring(scaleTarget, DOCK_TUNING.spring);

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ scale, transformOrigin: "bottom center" }}
      onClick={() => {
        if (sound) soundEngine.playSnap();
        navigate(route.path);
      }}
      onMouseEnter={() => {
        onHover(route);
        if (sound && soundEngine.isUnlocked()) soundEngine.playTick(0.75);
      }}
      onFocus={() => onHover(route)}
      onBlur={() => onHover(null)}
      aria-current={active ? "page" : undefined}
      aria-label={route.labelFa}
      className={cn(
        "tap-target group relative flex h-10 shrink-0 snap-center items-center gap-1 rounded-xl px-2 text-[12px] font-medium transition-colors duration-150 sm:gap-1.5 sm:px-2",
        active ? "text-white" : "text-zinc-400 hover:text-zinc-100"
      )}
    >
      {active && (
        <motion.span
          layoutId="dock-active"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          aria-hidden
          className="absolute inset-0 rounded-xl border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/12"
          style={{ boxShadow: "0 0 26px -8px rgba(var(--accent-glow),0.85)" }}
        />
      )}
      <span
        aria-hidden
        className={cn(
          "relative z-10 flex h-6 w-6 items-center justify-center rounded-lg text-[16px] font-bold transition-transform duration-150 sm:text-[15px]",
          !active && "group-hover:-translate-y-px"
        )}
        style={{ color: active ? route.accent : undefined }}
      >
        {route.glyph}
      </span>
      <span
        className={cn(
          "relative z-10 whitespace-nowrap text-[11.5px] leading-none sm:text-[12px]",
          active ? "font-bold" : "font-medium"
        )}
      >
        {DOCK_LABELS[route.id]}
      </span>
    </motion.button>
  );
};

const BottomDock: React.FC = () => {
  const { meta } = useRouter();
  const { settings } = useAppSettings();
  const mouseX = useMotionValue(Infinity);
  const [hovered, setHovered] = useState<RouteMeta | null>(null);
  const navRef = useRef<HTMLElement>(null);

  /* on narrow screens the dock scrolls — keep the active section in view */
  useEffect(() => {
    const el = navRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const active = el.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [meta.id]);

  /* motion preferences scale the magnet down instead of removing it outright */
  const strength =
    settings.reduceMotion || settings.motionLevel === 1 ? 0 : settings.motionLevel === 2 ? 0.5 : 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-safe sm:pb-4">
      <div className="relative max-w-full">
        {/* full label for the hovered section — outside the scroll container so it never clips */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 460, damping: 34 }}
              className="pointer-events-none absolute inset-x-0 bottom-full mx-auto mb-2.5 hidden w-max max-w-[80vw] items-center gap-2 rounded-xl border border-white/[0.12] bg-[#0A0C14]/96 px-3 py-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:flex"
            >
              <span aria-hidden className="text-[13px]" style={{ color: hovered.accent }}>
                {hovered.glyph}
              </span>
              <span className="whitespace-nowrap text-[12px] font-bold text-white">
                {hovered.labelFa}
              </span>
              <span className="truncate text-[11.5px] text-zinc-500">· {hovered.descFa}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.nav
          ref={navRef}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.12 }}
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => {
            mouseX.set(Infinity);
            setHovered(null);
          }}
          className="dock-mask pointer-events-auto flex max-w-full snap-x-soft items-end gap-1 overflow-x-auto rounded-[20px] border border-white/[0.12] bg-[#080A11]/95 px-2 pb-2 pt-3 shadow-[0_24px_70px_-12px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl scrollbar-none"
          aria-label={DOCK_COPY.label}
        >
          {ROUTES.map((r) => (
            <DockItem
              key={r.id}
              route={r}
              active={meta.id === r.id}
              mouseX={mouseX}
              strength={strength}
              sound={settings.sound}
              onHover={setHovered}
            />
          ))}
        </motion.nav>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------- footer */

const Footer: React.FC = () => {
  const { settings } = useAppSettings();
  return (
    <footer className="border-t border-white/[0.07] bg-[#040508] pb-28 pt-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-[#0B0D14]">
              <span className="font-hasti text-[14px] leading-none text-[color:var(--accent)]">
                م
              </span>
            </span>
            <div>
              <span className="block text-[13px] font-bold text-zinc-100">
                آزمایشگاه موشن و تایپوگرافی فارسی
              </span>
              <span className="block font-nastaliq text-[18px] leading-[2.3] text-[color:var(--accent)]">
                {FOOTER_COUPLET}
              </span>
            </div>
          </div>
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-zinc-400">
            پلتفرم رایگان، متن‌باز و ۶۰ فریم بر ثانیه برای مهندسی رابط‌های فارسی: ۵۰ خانواده فونت
            اصیل، فیزیک فنر مرتبهٔ دوم، ۴٬۱۹۹ فایل کامپوننت، ۱۸ شیدر WebGL و سینت‌سایزر Web Audio —
            کاملاً محلی در مرورگر شما.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
          {ROUTES.slice(1).map((r) => (
            <button
              key={r.id}
              onClick={() => {
                if (settings.sound) soundEngine.playTick(0.9);
                navigate(r.path);
              }}
              className="flex items-center gap-1.5 text-start text-[11.5px] text-zinc-400 transition-colors hover:text-[color:var(--accent)]"
            >
              <span className="text-[10px]" style={{ color: r.accent }}>
                {r.glyph}
              </span>
              <span>{r.labelFa}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3.5 text-[10.5px] text-zinc-500">
          <p className="font-bold text-zinc-300">شناسنامهٔ مهندسی (Colophon)</p>
          <p className="mt-1">React 18 · Tailwind v4 · Motion · WebGL · Web Audio</p>
          <p className="mt-1">پالت ۶۰-۳۰-۱۰ OKLCH · ضد کشیدگی پنل‌های OLED</p>
          <p className="mt-2 font-mono text-[9.5px] text-[color:var(--accent)]" dir="ltr">
            {settings.accent.toUpperCase()} · {settings.displayFont} · 60FPS
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ------------------------------------------------------------------- shell */

const PAGE_ENTER: Record<string, { from: Record<string, string | number>; duration: number }> = {
  home: { from: { opacity: 0, y: 10 }, duration: 0.36 },
  dashboard: { from: { opacity: 0, y: 16, scale: 0.995 }, duration: 0.34 },
  fonts: { from: { opacity: 0, y: 12 }, duration: 0.36 },
  motion: { from: { opacity: 0, scale: 0.985, y: 14 }, duration: 0.36 },
  components: { from: { opacity: 0, x: 18 }, duration: 0.34 },
  sounds: { from: { opacity: 0, scale: 0.99, y: 12 }, duration: 0.35 },
  skills: { from: { opacity: 0, y: -12 }, duration: 0.35 },
  engines: { from: { opacity: 0, y: 14 }, duration: 0.38 },
  ai: { from: { opacity: 0, scale: 0.992, y: 12 }, duration: 0.36 },
};

const STUDIO_ROUTES = new Set([
  "fonts",
  "motion",
  "components",
  "sounds",
  "skills",
  "engines",
  "ai",
]);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { route } = useRouter();
  const { settings } = useAppSettings();
  const isStudio = STUDIO_ROUTES.has(route);

  const bgWallpaper = useMemo(() => {
    if (settings.accent === "turquoise" || settings.accent === "emerald") {
      return publicUrl("/backgrounds/emerald-turquoise-aurora.jpg");
    }
    if (settings.accent === "violet" || settings.accent === "rose") {
      return publicUrl("/backgrounds/amethyst-horizon-silk.jpg");
    }
    return publicUrl("/backgrounds/nebula-lapis-gold.jpg");
  }, [settings.accent]);

  return (
    <div
      dir="rtl"
      className={cn(
        "relative bg-[#05060A] text-zinc-100",
        isStudio ? "desk:h-[100dvh] desk:overflow-hidden" : "min-h-screen"
      )}
    >
      {/* Color-Psychology 60-30-10 Atmospheric Backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.17] transition-[background-image,opacity] duration-700"
          style={{ backgroundImage: `url("${bgWallpaper}")` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(85% 65% at 50% 0%, transparent 15%, rgba(5, 6, 10, 0.88) 85%, #05060A 100%)",
          }}
        />
      </div>

      {/* Skip to content button — never an href="#…" since router uses hash */}
      <button
        type="button"
        onClick={() => document.getElementById("main")?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-[95] focus:rounded-lg focus:bg-[color:var(--accent)] focus:px-3 focus:py-2 focus:text-[12px] focus:font-bold focus:text-black"
      >
        پرش به محتوا
      </button>
      <TopBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          tabIndex={-1}
          key={route}
          initial={(PAGE_ENTER[route] ?? { from: { opacity: 0, y: 8 }, duration: 0.22 }).from}
          animate={{
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
          }}
          exit={{ opacity: 0, y: -4 }}
          transition={{
            duration: (PAGE_ENTER[route] ?? { duration: 0.22 }).duration,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "relative z-10 mx-auto max-w-[1440px] px-3.5 sm:px-6",
            isStudio
              ? "min-h-[calc(100dvh-3.5rem)] pb-28 pt-3 desk:h-[calc(100dvh-3.5rem)] desk:min-h-0 desk:overflow-hidden desk:pb-[68px] desk:pt-3"
              : "min-h-[calc(100vh-3.5rem)] pb-24 pt-5"
          )}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!isStudio && <Footer />}
      <BottomDock />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[-1] h-28 bg-gradient-to-t from-[#05060A] to-transparent" />
    </div>
  );
};
