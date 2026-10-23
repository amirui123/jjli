import React, { useCallback, useEffect, useRef, useState } from "react";
import { Eye, List, Maximize2, Minimize2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "./kit";
import { usePersisted } from "../lib/store";

/**
 * The shared studio frame used by every section.
 *
 * Desktop (>=1200px) is a single, non-scrolling viewport split into three
 * resizable rails — exactly the mental model of a desktop editor:
 *
 *   [ settings ] | [ live preview ] | [ item list ]
 *        left           centre             right
 *
 * Each rail scrolls on its own, so the page itself never scrolls. The two
 * dividers are draggable (and double-clickable to reset), widths are persisted,
 * and `F` toggles a distraction-free focus mode that hides both rails.
 * Below 1200px the three rails turn into three tabs (preview / settings / list)
 * so a phone never has to scroll past one panel to reach another.
 */

interface Layout {
  list: number;
  settings: number;
  focus: boolean;
}

const MIN_LIST = 200;
const MAX_LIST = 430;
const MIN_SETTINGS = 240;
const MAX_SETTINGS = 470;
const STAGE_MIN = 360;
const HANDLE_W = 7;
const GAP = 12;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type MobileTab = "stage" | "settings" | "list";

const STUDIO_PREVIEW_EVENT = "studio:preview";

/**
 * Called by a list row after it changes the selection. On phones the shell
 * switches to the preview panel so the change is visible immediately; on
 * desktop (three rails) it is a no-op.
 */
export function focusStudioPreview() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  if (!window.matchMedia("(max-width: 1199px)").matches) return;
  window.dispatchEvent(new Event(STUDIO_PREVIEW_EVENT));
}

const MOBILE_TABS: { id: MobileTab; label: string; icon: React.ElementType }[] = [
  { id: "stage", label: "پیش‌نمایش", icon: Eye },
  { id: "settings", label: "تنظیمات", icon: SlidersHorizontal },
  { id: "list", label: "فهرست", icon: List },
];

export const StudioShell: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  onReset?: () => void;
  list: React.ReactNode;
  listWidth?: string;
  stage: React.ReactNode;
  settings: React.ReactNode;
  settingsWidth?: string;
}> = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  stats,
  actions,
  onReset,
  list,
  listWidth = "248px",
  stage,
  settings,
  settingsWidth = "306px",
}) => {
  const [layout, setLayout] = usePersisted<Layout>("studio-layout", {
    list: parseInt(listWidth, 10) || 248,
    settings: parseInt(settingsWidth, 10) || 306,
    focus: false,
  });

  // Every studio opens on its live preview; the tab choice is per-visit so a
  // phone never lands in the middle of another studio's settings.
  const [tab, setTab] = useState<MobileTab>("stage");

  const gridRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ side: "list" | "settings"; startX: number; start: number } | null>(null);

  const listW = clamp(layout.list, MIN_LIST, MAX_LIST);
  const settingsW = clamp(layout.settings, MIN_SETTINGS, MAX_SETTINGS);

  /* -------------------------------------------------------------- dragging */

  const bounds = useCallback(
    (side: "list" | "settings") => {
      const width = gridRef.current?.clientWidth ?? 1440;
      const usable = width - HANDLE_W * 2 - GAP * 4;
      const other = side === "list" ? settingsW : listW;
      const absoluteMax = width - other - STAGE_MIN - HANDLE_W * 2 - GAP * 4;
      const max = Math.min(side === "list" ? MAX_LIST : MAX_SETTINGS, Math.max(absoluteMax, side === "list" ? MIN_LIST : MIN_SETTINGS));
      return { min: side === "list" ? MIN_LIST : MIN_SETTINGS, max: Math.max(max, side === "list" ? MIN_LIST : MIN_SETTINGS), usable };
    },
    [listW, settingsW]
  );

  useEffect(() => {
    if (!drag) return;
    const side = drag.side;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - drag.startX;
      // RTL: both rail boundaries grow when the pointer moves to the left.
      const next = drag.start - dx;
      const { min, max } = bounds(side);
      setLayout({ [side]: clamp(Math.round(next), min, max) } as Partial<Layout>);
    };
    const stop = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
    };
  }, [drag, bounds, setLayout]);

  const resetWidths = useCallback(() => {
    setLayout({ list: 248, settings: 306 });
  }, [setLayout]);

  /* ------------------------------------------------ mobile tab → top of page */
  const pickTab = useCallback((next: MobileTab) => {
    setTab(next);
    if (typeof window !== "undefined" && window.scrollY > 80) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  /* Picking an item on a phone should land on the preview it changed. */
  useEffect(() => {
    const onPreview = () => pickTab("stage");
    window.addEventListener(STUDIO_PREVIEW_EVENT, onPreview);
    return () => window.removeEventListener(STUDIO_PREVIEW_EVENT, onPreview);
  }, [pickTab]);

  /* ------------------------------------------------------------ focus mode */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (typing) return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setLayout({ focus: !layout.focus });
      }
      if (e.key === "Escape" && layout.focus) setLayout({ focus: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout.focus, setLayout]);

  const columns = layout.focus
    ? "minmax(0,1fr)"
    : `${listW}px ${HANDLE_W}px minmax(0,1fr) ${HANDLE_W}px ${settingsW}px`;

  const handle = (side: "list" | "settings") => (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={side === "list" ? "تغییر عرض فهرست" : "تغییر عرض تنظیمات"}
      tabIndex={0}
      onPointerDown={(e) => {
        e.preventDefault();
        setDrag({ side, startX: e.clientX, start: side === "list" ? listW : settingsW });
      }}
      onDoubleClick={resetWidths}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 32 : 12;
        if (e.key === "ArrowLeft") setLayout({ [side]: clamp((side === "list" ? listW : settingsW) + step, side === "list" ? MIN_LIST : MIN_SETTINGS, side === "list" ? MAX_LIST : MAX_SETTINGS) } as Partial<Layout>);
        if (e.key === "ArrowRight") setLayout({ [side]: clamp((side === "list" ? listW : settingsW) - step, side === "list" ? MIN_LIST : MIN_SETTINGS, side === "list" ? MAX_LIST : MAX_SETTINGS) } as Partial<Layout>);
      }}
      className={cn(
        "group hidden cursor-col-resize touch-none items-center justify-center desk:flex",
        drag?.side === side && "bg-[color:var(--accent)]/10"
      )}
      title="برای تغییر عرض بکشید · دوبار کلیک = بازنشانی"
    >
      <span
        className={cn(
          "h-10 w-[2px] rounded-full bg-white/10 transition-colors",
          "group-hover:bg-[color:var(--accent)]/60",
          drag?.side === side && "bg-[color:var(--accent)]"
        )}
      />
    </div>
  );

  return (
    <div className="flex min-h-0 flex-col gap-3 desk:h-full">
      {/* ----------------------------------------------------------- header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/[0.06] bg-[#0C0C0F]/80 px-3 py-2 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
            style={{
              borderColor: "rgba(var(--accent-glow),0.28)",
              background: "rgba(var(--accent-glow),0.10)",
              color: "var(--accent)",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-hasti text-[15px] leading-tight text-white sm:text-[17px]">
                {title}
              </h1>
              <span className="hidden shrink-0 font-mono text-[9px] tracking-[0.16em] text-zinc-600 sm:inline">
                {eyebrow}
              </span>
            </div>
            <p className="mt-0.5 hidden max-w-2xl truncate text-[10.5px] leading-tight text-zinc-500 sm:block">
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {stats && <div className="hidden items-center gap-1.5 sm:flex">{stats}</div>}
          {actions}
          <button
            onClick={() => setLayout({ focus: !layout.focus })}
            title={layout.focus ? "خروج از حالت تمرکز (Esc)" : "حالت تمرکز — پنهان کردن ریل‌ها (F)"}
            aria-label="حالت تمرکز"
            aria-pressed={layout.focus}
            className={cn(
              "hidden h-7 w-7 items-center justify-center rounded-lg border transition-colors desk:flex",
              layout.focus
                ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-white"
            )}
          >
            {layout.focus ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
          {onReset && (
            <button
              onClick={onReset}
              title="بازنشانی تنظیمات"
              aria-label="بازنشانی تنظیمات"
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">بازنشانی</span>
            </button>
          )}
        </div>
      </header>

      {/* -------------------------------------------------- mobile panel tabs */}
      <nav
        aria-label="پنل‌های استودیو"
        className="sticky top-14 z-20 flex shrink-0 items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0B0B0E]/95 p-1 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl desk:hidden"
      >
        {MOBILE_TABS.map(({ id, label, icon: TabIcon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => pickTab(id)}
              aria-pressed={active}
              className={cn(
                "tap-target flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                active
                  ? "bg-[color:var(--accent)]/12 text-white ring-1 ring-inset ring-[color:var(--accent)]/25"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              )}
            >
              <TabIcon
                className={cn("h-3.5 w-3.5", active ? "text-[color:var(--accent)]" : "text-zinc-500")}
              />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ------------------------------------------------------------ rails */}
      <div
        ref={gridRef}
        className="grid min-h-0 flex-1 grid-cols-1 gap-3 desk:[grid-template-columns:var(--studio-cols)]"
        style={{ ["--studio-cols" as string]: columns }}
      >
        {/* list — first in the DOM = right rail in RTL */}
        <div
          data-rail="list"
          className={cn(
            "order-2 min-h-0 desk:order-none desk:h-full desk:overflow-hidden",
            layout.focus && "desk:hidden",
            tab !== "list" && "hidden desk:block"
          )}
        >
          {list}
        </div>

        {!layout.focus && handle("list")}

        {/* stage — live preview, scrolls inside its own rail */}
        <div
          data-rail="stage"
          className={cn(
            "order-1 min-w-0 desk:order-none desk:h-full desk:overflow-y-auto desk:pe-1 studio-scroll",
            tab !== "stage" && "hidden desk:block"
          )}
        >
          {stage}
        </div>

        {!layout.focus && handle("settings")}

        {/* settings — left rail */}
        <div
          data-rail="settings"
          className={cn(
            "order-3 min-h-0 desk:order-none desk:h-full desk:overflow-y-auto desk:pe-1 studio-scroll",
            layout.focus && "desk:hidden",
            tab !== "settings" && "hidden desk:block"
          )}
        >
          {settings}
        </div>
      </div>
    </div>
  );
};

/** A compact, self-scrolling list container used inside a studio rail. */
export const StudioList: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  listClassName?: string;
}> = ({ title, subtitle, toolbar, children, footer, className, listClassName }) => (
  <section
    className={cn(
      "flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D0D10]/90 backdrop-blur-sm",
      "max-h-[62vh] desk:h-full desk:max-h-none",
      className
    )}
  >
    <header className="flex shrink-0 items-start justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
      <div className="min-w-0">
        <h3 className="truncate text-[11.5px] font-bold text-zinc-100">{title}</h3>
        {subtitle && <p className="mt-0.5 truncate text-[9.5px] text-zinc-500">{subtitle}</p>}
      </div>
      {toolbar}
    </header>
    <div className={cn("studio-scroll min-h-0 flex-1 overflow-y-auto p-1.5", listClassName)}>{children}</div>
    {footer && (
      <div className="shrink-0 border-t border-white/[0.06] px-3 py-1.5 text-[9px] leading-tight text-zinc-600">
        {footer}
      </div>
    )}
  </section>
);
