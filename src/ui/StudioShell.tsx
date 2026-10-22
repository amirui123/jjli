import React from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "./kit";

/**
 * The shared studio frame used by every section:
 *   [ item list ]  [ live preview ]  [ settings ]
 *
 * In RTL the first column renders on the right, so the list sits beside the
 * preview and the settings rail lands on the left — exactly the mental model
 * of a desktop editor.
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
  settingsWidth = "310px",
}) => (
  <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
          <Icon className="h-3.5 w-3.5" />
          <span className="font-mono tracking-wide">{eyebrow}</span>
        </div>
        <h1 className="mt-1 text-[24px] font-bold leading-tight text-white sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {stats}
        {actions}
        {onReset && (
          <button
            onClick={onReset}
            title="بازنشانی تنظیمات"
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10.5px] text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            بازنشانی
          </button>
        )}
      </div>
    </header>

    <div
      className="grid grid-cols-1 gap-4 xl:items-start xl:[grid-template-columns:var(--studio-cols)]"
      style={{ ["--studio-cols" as string]: `${listWidth} minmax(0,1fr) ${settingsWidth}` }}
    >
      {/* list — first in DOM = right column in RTL */}
      <div className="order-3 xl:order-none xl:sticky xl:top-[72px]">{list}</div>
      {/* stage — live preview */}
      <div className="order-1 min-w-0 xl:order-none">{stage}</div>
      {/* settings — left rail */}
      <div className="order-2 xl:order-none xl:sticky xl:top-[72px]">{settings}</div>
    </div>
  </div>
);

/** A compact, scrollable list container with a sticky search row. */
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
      className
    )}
  >
    <header className="flex items-start justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5">
      <div className="min-w-0">
        <h3 className="truncate text-[12px] font-bold text-zinc-100">{title}</h3>
        {subtitle && <p className="mt-0.5 truncate text-[10px] text-zinc-500">{subtitle}</p>}
      </div>
      {toolbar}
    </header>
    <div className={cn("min-h-0 flex-1 overflow-y-auto p-1.5", listClassName)}>{children}</div>
    {footer && (
      <div className="border-t border-white/[0.06] px-3 py-1.5 text-[9.5px] text-zinc-600">
        {footer}
      </div>
    )}
  </section>
);
