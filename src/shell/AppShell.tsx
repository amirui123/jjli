import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Command,
  Github,
  Palette,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ROUTES, navigate, useRouter } from "../lib/router";
import { ACCENTS, useAppSettings } from "../lib/store";
import { cn } from "../ui/kit";
import { soundEngine } from "../engines/soundEngine";

/* ------------------------------------------------------------------ top bar */

const TopBar: React.FC = () => {
  const { meta } = useRouter();
  const { settings, update, accent } = useAppSettings();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="app-topbar sticky top-0 z-40 border-b border-white/[0.06] bg-[#08080A]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2.5"
            aria-label="آزمایشگاه موشن فارسی"
          >
            <span
              className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#0D0D10]"
              style={{ boxShadow: "0 0 24px -8px rgba(var(--accent-glow),0.8)" }}
            >
              <span className="font-hasti text-[15px] leading-none text-[color:var(--accent)]">
                م
              </span>
            </span>
            <span className="text-start">
              <span className="block text-[12.5px] font-bold leading-tight text-zinc-100">
                آزمایشگاه موشن فارسی
              </span>
              <span className="block font-mono text-[9.5px] tracking-wide text-zinc-500">
                RTL MOTION LAB
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 text-[11.5px] text-zinc-500 lg:flex">
            {ROUTES.filter((r) => ["home", "dashboard", "fonts", "components", "skills"].includes(r.id)).map(
              (r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(r.path)}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 transition-colors hover:bg-white/5 hover:text-zinc-200",
                    meta.id === r.id && "text-zinc-100"
                  )}
                >
                  {r.labelFa}
                </button>
              )
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCmdOpen(true)}
              aria-label="جستجوی سریع"
              className="tap-icon flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-100 sm:h-auto sm:w-auto sm:min-h-0 sm:min-w-0 sm:gap-2 sm:px-2.5 sm:py-1.5 sm:text-[11px]"
            >
              <Command className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">جستجوی سریع</span>
              <kbd className="hidden rounded border border-white/10 bg-black/40 px-1 font-mono text-[9px] text-zinc-500 sm:inline">
                ⌘K
              </kbd>
            </button>

            {/* accent picker */}
            <div className="relative">
              <button
                onClick={() => setPaletteOpen((v) => !v)}
                className="tap-icon flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] transition-colors hover:border-white/20"
                aria-label="رنگ پلتفرم"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ background: accent.hex }}
                />
              </button>
              {paletteOpen && (
                <button
                  type="button"
                  aria-label="بستن انتخاب رنگ"
                  tabIndex={-1}
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setPaletteOpen(false)}
                />
              )}
              <AnimatePresence>
                {paletteOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute end-0 top-10 z-50 w-52 rounded-xl border border-white/10 bg-[#0D0D10] p-2 shadow-2xl"
                  >
                    <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] text-zinc-500">
                      <Palette className="h-3 w-3" />
                      رنگ سراسری پلتفرم
                    </div>
                    {ACCENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          soundEngine.playSnap();
                          update({ accent: a.id, customAccent: null });
                          setPaletteOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] transition-colors hover:bg-white/5",
                          settings.accent === a.id ? "text-white" : "text-zinc-400"
                        )}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: a.hex }}
                        />
                        {a.labelFa}
                        {settings.accent === a.id && (
                          <span className="ms-auto text-[9px] text-[color:var(--accent)]">
                            فعال
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => {
                const next = !settings.sound;
                soundEngine.enabled = next;
                update({ sound: next });
                if (next) soundEngine.playSuccess();
              }}
              className={cn(
                "tap-icon flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                settings.sound
                  ? "border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                  : "border-white/[0.08] bg-white/[0.03] text-zinc-500"
              )}
              aria-label="صدای رابط"
              title="سینت‌سایزر صدای رابط"
            >
              {settings.sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>

            <a
              href="https://github.com/amirui123/jjli"
              target="_blank"
              rel="noreferrer"
              className="tap-icon hidden h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-500 transition-colors hover:border-white/20 hover:text-zinc-200 sm:flex"
              aria-label="مخزن گیت‌هاب"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          </div>
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
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 pt-[14vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D10] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
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
                    setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
                  } else if (e.key === "Enter") {
                    go(active);
                  }
                }}
                placeholder="رفتن به استودیو یا بخش…"
                className="w-full bg-transparent text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600"
              />
              <button onClick={onClose} aria-label="بستن">
                <X className="h-4 w-4 text-zinc-500 hover:text-zinc-200" />
              </button>
            </div>
            <div id="command-results" role="listbox" aria-label="نتایج جستجو" className="max-h-72 overflow-y-auto p-1.5">
              {results.map((r, i) => (
                <button
                  key={r.id}
                  id={`cmd-${r.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start transition-colors",
                    i === active ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
                  )}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg border text-[12px]"
                    style={{
                      borderColor: `${r.accent}33`,
                      color: r.accent,
                      background: `${r.accent}12`,
                    }}
                  >
                    {r.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium text-zinc-200">{r.labelFa}</span>
                    <span className="block truncate text-[10px] text-zinc-500">{r.descFa}</span>
                  </span>
                  <span className="ms-auto font-mono text-[9px] text-zinc-600">{r.labelEn}</span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-[11px] text-zinc-600">نتیجه‌ای پیدا نشد</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------------------------------------------------------------- bottom dock */

const BottomDock: React.FC = () => {
  const { meta } = useRouter();
  const { settings } = useAppSettings();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-safe sm:pb-4">
      <motion.nav
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.15 }}
        className="dock-mask pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.09] bg-[#0B0B0E]/92 p-1.5 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.9)] backdrop-blur-2xl scrollbar-none snap-x-soft"
        aria-label="ناوبری بخش‌ها"
      >
        {ROUTES.map((r) => {
          const active = meta.id === r.id;
          return (
            <button
              key={r.id}
              onClick={() => {
                if (settings.sound) soundEngine.playSnap();
                navigate(r.path);
              }}
              className={cn(
                "tap-target group relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 transition-colors duration-150",
                active ? "text-white" : "text-zinc-500 hover:text-zinc-200"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={r.labelFa}
              title={`${r.labelFa} — ${r.descFa}`}
            >
              {active && (
                <motion.span
                  layoutId="dock-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl border border-white/[0.09] bg-white/[0.07]"
                  style={{ boxShadow: `0 0 20px -6px ${r.accent}66` }}
                />
              )}
              <span
                className="relative z-10 flex h-6 w-6 items-center justify-center rounded-lg text-[12px] transition-transform duration-150 group-hover:-translate-y-0.5"
                style={{ color: active ? r.accent : undefined }}
              >
                {r.glyph}
              </span>
              <span
                className={cn(
                  "relative z-10 whitespace-nowrap text-[10.5px] font-medium",
                  active ? "inline" : "hidden sm:inline"
                )}
              >
                {r.shortFa}
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};


/* -------------------------------------------------------------------- footer */

const Footer: React.FC = () => {
  const { settings } = useAppSettings();
  return (
    <footer className="border-t border-white/[0.06] pb-24 pt-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10">
              <span className="font-hasti text-[13px] leading-none text-[color:var(--accent)]">م</span>
            </span>
            <span className="text-[12.5px] font-bold text-zinc-200">آزمایشگاه موشن فارسی</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
            پلتفرم رایگان و متن‌باز مهندسی رابط فارسی: تایپوگرافی، فیزیک حرکت،
            کامپوننت‌های واقعی و موتورهای بومی. بدون حساب کاربری، بدون سطح پولی.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 sm:grid-cols-3">
          {ROUTES.slice(1).map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(r.path)}
              className="text-start text-[11px] text-zinc-500 transition-colors hover:text-zinc-200"
            >
              {r.labelFa}
            </button>
          ))}
        </div>

        <div className="text-[10.5px] text-zinc-600">
          <p>ساخته‌شده با React 18 · Tailwind v4 · Motion</p>
          <p className="mt-1">همه داده‌ها محلی و آفلاین‌اند</p>
          <p className="mt-2 font-mono text-[9.5px]" dir="ltr">
            {settings.accent} · v2.0
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ------------------------------------------------------------------- shell */

const STUDIO_ROUTES = new Set(["fonts", "motion", "components", "sounds", "skills", "engines", "ai"]);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { route } = useRouter();
  const isStudio = STUDIO_ROUTES.has(route);

  return (
    <div dir="rtl" className={cn("bg-[#08080A] text-zinc-100", isStudio ? "desk:h-[100dvh] desk:overflow-hidden" : "min-h-screen")}>
      {/* never an href="#…": this app routes on the hash */}
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "mx-auto max-w-[1440px] px-4 sm:px-6",
            isStudio
              ? // full-height studio: no page scroll on desktop, the rails scroll instead
                "min-h-[calc(100dvh-3.5rem)] pb-28 pt-3 desk:h-[calc(100dvh-3.5rem)] desk:min-h-0 desk:overflow-hidden desk:pb-[68px] desk:pt-3"
              : "min-h-[calc(100vh-3.5rem)] pb-24 pt-6"
          )}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!isStudio && <Footer />}
      <BottomDock />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[-1] h-28 bg-gradient-to-t from-[#08080A] to-transparent" />
    </div>
  );
};
