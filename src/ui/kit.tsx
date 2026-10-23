import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Check, ChevronDown, Copy, Loader2, Search, X } from "lucide-react";
import { copyText } from "../lib/store";
import { soundEngine } from "../engines/soundEngine";
import { faNum } from "../lib/format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function click() {
  soundEngine.playTick(1);
}

/* --------------------------------------------------------------------- panel */

export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: "default" | "flat" | "inset";
  padded?: boolean;
}> = ({ children, className, title, subtitle, actions, tone = "default", padded = true }) => (
  <section
    className={cn(
      "rounded-2xl border",
      tone === "flat"
        ? "border-white/[0.06] bg-white/[0.015]"
        : tone === "inset"
        ? "border-white/[0.05] bg-black/40"
        : "border-white/[0.07] bg-[#0D0D10]/90",
      "backdrop-blur-sm",
      className
    )}
  >
    {(title || actions) && (
      <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="min-w-0">
          {title && (
            <h3 className="truncate text-[13px] font-bold tracking-tight text-zinc-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-0.5 truncate text-[11px] leading-relaxed text-zinc-500">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
      </header>
    )}
    <div className={cn(padded && "p-4")}>{children}</div>
  </section>
);

/* -------------------------------------------------------------------- inputs */

export const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}> = ({ label, value, min, max, step = 1, unit, hint, onChange, format, disabled }) => {
  const safe = Number.isFinite(value) ? value : min;
  const pct = Math.min(1, Math.max(0, (safe - min) / (max - min || 1)));
  // Geometry: a 12px thumb travels inside the track; both fill and thumb share
  // the same coordinate space, so nothing can ever overflow the track ends.
  const travel = `calc((100% - 12px) * ${pct})`;
  const fill = pct === 0 ? "0px" : `calc(${travel} + 6px)`;

  return (
    <label className={cn("block select-none", disabled && "opacity-50")}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11.5px] font-medium text-zinc-300">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-[color:var(--accent)]">
          {faNum(format ? format(safe) : safe)}
          {unit ? <span className="text-zinc-500"> {faNum(unit)}</span> : null}
        </span>
      </div>

      <div className="group/range relative h-4 rounded-md focus-within:ring-2 focus-within:ring-[color:var(--accent)]/40" dir="ltr">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="pointer-events-none absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
          style={{ left: "6px", width: fill }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[color:var(--accent)] bg-white shadow-[0_0_0_3px_rgba(var(--accent-glow),0.14)] transition-transform duration-100 group-hover/range:scale-110"
          style={{ left: travel }}
        />
        <input
          type="range"
          dir="ltr"
          min={min}
          max={max}
          step={step}
          value={safe}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed"
        />
      </div>

      {hint && <p className="mt-1 text-[10px] leading-snug text-zinc-600">{hint}</p>}
    </label>
  );
};

export const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}> = ({ label, checked, onChange, hint }) => (
  <button
    type="button"
    onClick={() => {
      click();
      onChange(!checked);
    }}
    className="flex min-h-[34px] w-full items-center justify-between gap-3 rounded-lg py-1.5 text-start"
    aria-pressed={checked}
  >
    <span className="min-w-0">
      <span className="block text-[11.5px] font-medium text-zinc-300">{label}</span>
      {hint && <span className="mt-0.5 block text-[10px] text-zinc-600">{hint}</span>}
    </span>
    <span
      className={cn(
        "relative h-[18px] w-8 shrink-0 rounded-full border transition-colors duration-200",
        checked
          ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/30"
          : "border-white/10 bg-white/5"
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] h-[12px] w-[12px] rounded-full transition-all duration-200",
          checked
            ? "start-[2px] translate-x-0 bg-[color:var(--accent)]"
            : "start-[2px] bg-zinc-500"
        )}
        style={checked ? { transform: "translateX(-16px)" } : undefined}
      />
    </span>
  </button>
);

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
}) => (
  <div
    className={cn(
      "inline-flex flex-wrap items-center gap-0.5 rounded-xl border border-white/[0.07] bg-black/40 p-0.5",
      className
    )}
  >
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => {
          click();
          onChange(o.value);
        }}
        className={cn(
          "rounded-[9px] font-medium transition-colors duration-150",
          size === "sm" ? "px-2 py-[3px] text-[10.5px]" : "px-2.5 py-1 text-[11.5px]",
          value === o.value
            ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "text-zinc-500 hover:text-zinc-200"
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const Badge: React.FC<{
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warn" | "danger";
  className?: string;
}> = ({ children, tone = "neutral", className }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] leading-none",
      tone === "accent" && "border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 text-[color:var(--accent)]",
      tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      tone === "warn" && "border-amber-500/30 bg-amber-500/10 text-amber-300",
      tone === "danger" && "border-rose-500/30 bg-rose-500/10 text-rose-300",
      tone === "neutral" && "border-white/10 bg-white/5 text-zinc-400",
      className
    )}
  >
    {children}
  </span>
);

export const SearchField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}> = ({ value, onChange, placeholder = "جستجو…", className, autoFocus }) => (
  <div
    className={cn(
      "flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/40 px-2.5 py-1.5 transition-colors focus-within:border-[color:var(--accent)]/40",
      className
    )}
  >
    <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
    <input
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="پاک کردن جستجو"
        className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-white/5"
      >
        <X className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-200" />
      </button>
    )}
  </div>
);

export const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}> = ({ value, onChange, options, label }) => (
  <label className="block">
    {label && <span className="mb-1 block text-[11px] text-zinc-400">{label}</span>}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-white/[0.08] bg-black/50 px-2.5 py-1.5 pe-7 text-[11.5px] text-zinc-200 outline-none focus:border-[color:var(--accent)]/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
    </div>
  </label>
);

/* ---------------------------------------------------------------- copy button */

export const CopyButton: React.FC<{
  text: string;
  label?: string;
  className?: string;
  compact?: boolean;
  onCopied?: () => void;
}> = ({ text, label = "کپی", className, compact, onCopied }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(text);
        if (ok) {
          soundEngine.playSuccess();
          setDone(true);
          onCopied?.();
          window.setTimeout(() => setDone(false), 1600);
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border transition-all duration-150 active:scale-[0.97]",
        compact ? "px-1.5 py-1 text-[10px]" : "px-2.5 py-1.5 text-[11px]",
        done
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white",
        className
      )}
      aria-label={label}
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span>{done ? "کپی شد" : label}</span>
    </button>
  );
};

/* ------------------------------------------------------------------ code view */

const KEYWORDS =
  "const|let|var|function|return|if|else|for|while|do|import|from|export|default|interface|type|extends|implements|new|class|await|async|try|catch|finally|throw|switch|case|break|continue|typeof|instanceof|in|of|as|satisfies|void|null|undefined|true|false|this|super|yield|declare|enum|namespace|readonly|public|private|protected|static";

const TOKEN_RE = new RegExp(
  [
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|<!--[\\s\\S]*?-->)", // 1 comment
    "(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)", // 2 string
    `\\b(${KEYWORDS})\\b`, // 3 keyword
    "\\b(\\d+(?:\\.\\d+)?)\\b", // 4 number
    "([A-Za-z_$][\\w$]*)(?=\\s*\\()", // 5 function
    "(&lt;\\/?)([A-Z][\\w.]*)", // 6 jsx tag
  ].join("|"),
  "g"
);

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(line: string): string {
  return escapeHtml(line).replace(TOKEN_RE, (m, c, str, kw, num, fn, jxOpen, jxTag) => {
    if (c) return `<span class="tk-c">${c}</span>`;
    if (str) return `<span class="tk-s">${str}</span>`;
    if (kw) return `<span class="tk-k">${kw}</span>`;
    if (num) return `<span class="tk-n">${num}</span>`;
    if (fn) return `<span class="tk-f">${fn}</span>`;
    if (jxTag) return `${jxOpen}<span class="tk-tag">${jxTag}</span>`;
    return m;
  });
}

export const CodeBlock: React.FC<{
  code: string;
  language?: string;
  maxLines?: number;
  className?: string;
  showCopy?: boolean;
  filename?: string;
  toolbar?: React.ReactNode;
  fontSize?: number;
}> = ({ code, language = "tsx", maxLines = 260, className, showCopy = true, filename, toolbar, fontSize }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = useMemo(() => code.replace(/\t/g, "  ").split("\n"), [code]);
  const visible = expanded ? lines : lines.slice(0, maxLines);
  const html = useMemo(() => visible.map(highlight), [visible]);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/[0.07] bg-[#08080A]", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] bg-white/[0.015] px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex gap-1">
            <i className="h-1.5 w-1.5 rounded-full bg-rose-500/60" />
            <i className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
            <i className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
          </span>
          <span className="truncate font-mono text-[10.5px] text-zinc-500" dir="ltr">
            {filename ?? language}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {toolbar}
          {showCopy && <CopyButton text={code} compact />}
        </div>
      </div>
      <div className="code-scroll max-h-[460px] overflow-auto" dir="ltr">
        <pre
          className="min-w-full py-2 text-[11.5px] leading-[1.65]"
          style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
        >
          <code>
            {html.map((h, i) => (
              <div key={i} className="code-line flex">
                <span className="code-num sticky start-0 select-none bg-[#08080A] pe-2 ps-2 text-[10px] text-zinc-700">
                  {i + 1}
                </span>
                <span
                  className="code-src flex-1 whitespace-pre pe-4"
                  dangerouslySetInnerHTML={{ __html: h || "&nbsp;" }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
      {lines.length > maxLines && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full border-t border-white/[0.06] bg-white/[0.02] py-1.5 text-[10.5px] text-zinc-500 hover:text-zinc-200"
        >
          {expanded
            ? "بستن"
            : `نمایش ${lines.length - maxLines} خط باقی‌مانده (${lines.length} خط)`}
        </button>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------- misc */

export const Spinner: React.FC<{ className?: string; label?: string }> = ({
  className,
  label,
}) => (
  <div className={cn("flex items-center justify-center gap-2 text-zinc-500", className)}>
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="text-[11px]">{label ?? "در حال بارگذاری…"}</span>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  hint?: string;
  icon?: React.ReactNode;
}> = ({ title, hint, icon }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
    <div className="text-zinc-700">{icon}</div>
    <p className="text-[12.5px] font-medium text-zinc-400">{title}</p>
    {hint && <p className="max-w-sm text-[11px] text-zinc-600">{hint}</p>}
  </div>
);

export const Stat: React.FC<{
  value: React.ReactNode;
  label: string;
  sub?: string;
  onClick?: () => void;
}> = ({ value, label, sub, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className={cn(
      "group rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-start transition-colors",
      onClick && "hover:border-[color:var(--accent)]/40 hover:bg-white/[0.04]"
    )}
  >
    <div className="font-mono text-[17px] leading-none tabular-nums text-zinc-100">{value}</div>
    <div className="mt-1.5 text-[11px] font-medium text-zinc-400">{label}</div>
    {sub && <div className="mt-0.5 truncate text-[10px] text-zinc-600">{sub}</div>}
  </button>
);

export function useInterval(cb: () => void, ms: number | null) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function useCopyState(ms = 1600) {
  const [copied, setCopied] = useState(false);
  const trigger = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      if (ok) {
        soundEngine.playSuccess();
        setCopied(true);
        window.setTimeout(() => setCopied(false), ms);
      }
      return ok;
    },
    [ms]
  );
  return { copied, trigger };
}
