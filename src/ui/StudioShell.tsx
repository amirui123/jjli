import React from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "./kit";

/**
 * The shared studio frame used by every section.
 *
 * Desktop (xl+) is a single, non-scrolling viewport split into three rails:
 *
 *   [ settings rail ]   [ live preview ]   [ item list ]
 *            left              centre            right
 *
 * Each rail scrolls on its own, so the page itself never scrolls — exactly the
 * mental model of a desktop editor. Below xl the rails stack and the page
 * scrolls normally.
 */
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
  settingsWidth = "308px",
}) => (
  <div className="flex min-h-0 flex-col gap-3 xl:h-full">
    {/* ------------------------------------------------------------- header */}
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
            <h1 className="truncate font-hasti text-[17px] leading-tight text-white">{title}</h1>
            <span className="hidden shrink-0 font-mono text-[9px] tracking-[0.16em] text-zinc-600 sm:inline">
              {eyebrow}
            </span>
          </div>
          <p className="mt-0.5 hidden max-w-2xl truncate text-[10.5px] leading-tight text-zinc-500 lg:block">
            {description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {stats}
        {actions}
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

    {/* -------------------------------------------------------------- rails */}
    <div
      className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:[grid-template-columns:var(--studio-cols)]"
      style={{ ["--studio-cols" as string]: `${listWidth} minmax(0,1fr) ${settingsWidth}` }}
    >
      {/* list — first in the DOM = right rail in RTL */}
      <div className="order-2 min-h-0 xl:order-none xl:h-full xl:overflow-hidden">{list}</div>
      {/* stage — live preview, scrolls inside its own rail */}
      <div className="order-1 min-w-0 xl:order-none xl:h-full xl:overflow-y-auto xl:pe-1 studio-scroll">
        {stage}
      </div>
      {/* settings — left rail */}
      <div className="order-3 min-h-0 xl:order-none xl:h-full xl:overflow-y-auto xl:pe-1 studio-scroll">
        {settings}
      </div>
    </div>
  </div>
);

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
      "max-h-[62vh] xl:h-full xl:max-h-none",
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
