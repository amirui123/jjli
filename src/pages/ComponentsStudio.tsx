import React, { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ChevronLeft,
  FileCode2,
  FolderOpen,
  Layers,
  Sparkles,
} from "lucide-react";
import { ALL_REGISTRIES_MANIFEST } from "../data/registriesManifest";
import { COMPONENT_CATALOG } from "../data/componentCatalog";
import { loadAsset, useDebounced } from "../lib/store";
import {
  Badge,
  CodeBlock,
  CopyButton,
  EmptyState,
  Panel,
  SearchField,
  Segmented,
  Spinner,
  cn,
} from "../ui/kit";
import { UniversalComponentPreview } from "../components/BentoShowcase";
import { soundEngine } from "../engines/soundEngine";

interface RegistryPayload {
  id: string;
  total: number;
  files: { p: string; s: number; c: string; t: number }[];
}

type Mode = "files" | "preview";

const ROW_H = 30;
const LIST_H = 560;

export const ComponentsStudio: React.FC = () => {
  const [mode, setMode] = useState<Mode>("files");
  const [regId, setRegId] = useState(ALL_REGISTRIES_MANIFEST[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [payload, setPayload] = useState<RegistryPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [scrollTop, setScrollTop] = useState(0);
  const [onlyCode, setOnlyCode] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setPayload(null);
    setSelectedPath("");
    loadAsset<RegistryPayload>(`/regcode/${regId}.json`)
      .then((data) => {
        if (!alive) return;
        setPayload(data);
        if (data.files[0]) setSelectedPath(data.files[0].p);
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [regId]);

  const debouncedQuery = useDebounced(query, 160);

  const files = useMemo(() => {
    if (!payload) return [];
    const term = debouncedQuery.trim().toLowerCase();
    const base = onlyCode ? payload.files.filter((f) => f.c.trim().length > 40) : payload.files;
    if (!term) return base;
    return base.filter((f) => f.p.toLowerCase().includes(term));
  }, [payload, debouncedQuery, onlyCode]);

  const selected = useMemo(
    () => payload?.files.find((f) => f.p === selectedPath) ?? null,
    [payload, selectedPath]
  );

  const totalBytes = useMemo(
    () => (payload ? payload.files.reduce((a, f) => a + f.s, 0) : 0),
    [payload]
  );

  // windowing
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - 6);
  const visible = Math.ceil(LIST_H / ROW_H) + 12;
  const end = Math.min(files.length, start + visible);

  const totalComponents = ALL_REGISTRIES_MANIFEST.reduce((a, r) => a + r.totalFiles, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <Layers className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">COMPONENT STUDIO</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            استودیو کامپوننت
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            کاوشگر واقعی سورس‌کد {totalComponents.toLocaleString("fa-IR")} فایل در ۱۲
            رجیستری متن‌باز. کد هر فایل مستقیماً از مخزن خوانده می‌شود و فقط هنگام
            باز کردن رجیستری بارگذاری می‌گردد.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: "files", label: "کاوشگر سورس" },
              { value: "preview", label: "پیش‌نمایش زنده" },
            ]}
          />
        </div>
      </header>

      {mode === "files" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* registries */}
          <Panel title="رجیستری‌ها" subtitle={`${ALL_REGISTRIES_MANIFEST.length} کتابخانه`} padded={false}>
            <div className="max-h-[600px] space-y-0.5 overflow-y-auto p-1.5">
              {ALL_REGISTRIES_MANIFEST.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    soundEngine.playTick(1);
                    setRegId(r.id);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-start transition-colors",
                    regId === r.id
                      ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  )}
                >
                  <span className="min-w-0 truncate font-mono text-[10.5px]" dir="ltr">
                    {r.id}
                  </span>
                  <span className="shrink-0 font-mono text-[9.5px] text-zinc-600">
                    {r.totalFiles}
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          {/* file list */}
          <Panel
            title={<span className="font-mono text-[11.5px]">{regId}</span>}
            subtitle={
              payload
                ? `${files.length} فایل · ${(totalBytes / 1024).toFixed(0)}KB سورس`
                : "در حال خواندن…"
            }
            padded={false}
            actions={
              <Badge tone={onlyCode ? "accent" : "neutral"}>
                <button onClick={() => setOnlyCode((v) => !v)}>
                  {onlyCode ? "فقط با کد" : "همه"}
                </button>
              </Badge>
            }
          >
            <div className="border-b border-white/[0.06] p-2">
              <SearchField value={query} onChange={setQuery} placeholder="جستجوی نام فایل…" />
            </div>
            {loading && <Spinner className="py-16" label="بارگذاری سورس رجیستری…" />}
            {error && (
              <EmptyState
                title="بارگذاری ناموفق"
                hint={error}
                icon={<FileCode2 className="h-6 w-6" />}
              />
            )}
            {!loading && !error && payload && (
              <div
                className="overflow-y-auto"
                style={{ height: LIST_H }}
                onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
              >
                <div style={{ height: files.length * ROW_H, position: "relative" }}>
                  <div style={{ transform: `translateY(${start * ROW_H}px)` }}>
                    {Array.from({ length: end - start }, (_, i) => {
                      const f = files[start + i];
                      if (!f) return null;
                      return (
                        <button
                          key={f.p}
                          onClick={() => {
                            setSelectedPath(f.p);
                            soundEngine.playTick(1.2);
                          }}
                          style={{ height: ROW_H }}
                          className={cn(
                            "flex w-full items-center gap-2 px-2.5 text-start transition-colors",
                            selectedPath === f.p
                              ? "bg-white/[0.07]"
                              : "hover:bg-white/[0.035]"
                          )}
                        >
                          <FileCode2
                            className={cn(
                              "h-3 w-3 shrink-0",
                              f.p.endsWith(".tsx") ? "text-teal-400/70" : "text-zinc-600"
                            )}
                          />
                          <span
                            className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-zinc-300"
                            dir="ltr"
                          >
                            {f.p}
                          </span>
                          <span className="shrink-0 font-mono text-[9px] text-zinc-700">
                            {(f.s / 1024).toFixed(1)}k
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Panel>

          {/* viewer */}
          <Panel
            className="lg:col-span-2 xl:col-span-1"
            title={selected ? selected.p.split("/").pop() : "سورس‌کد"}
            subtitle={
              selected
                ? `${selected.p} · ${selected.s.toLocaleString("fa-IR")} بایت${
                    selected.t ? " · نمایش بخشی از فایل بزرگ" : ""
                  }`
                : "یک فایل انتخاب کنید"
            }
            padded={false}
            actions={
              selected && (
                <>
                  <CopyButton text={selected.c} label="کپی کد" compact />
                  <CopyButton
                    text={`toolkit/04-motion-primitives-and-ui/${regId}/${selected.p}`}
                    label="مسیر"
                    compact
                  />
                </>
              )
            }
          >
            {selected ? (
              <div className="p-2">
                <CodeBlock
                  code={selected.c}
                  filename={selected.p}
                  language={selected.p.endsWith(".tsx") ? "tsx" : "ts"}
                  maxLines={400}
                  showCopy={false}
                />
              </div>
            ) : (
              <EmptyState
                title="فایلی انتخاب نشده"
                hint="از فهرست کنار یک فایل را باز کنید تا سورس واقعی آن نمایش داده شود."
                icon={<FolderOpen className="h-6 w-6" />}
              />
            )}
          </Panel>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {COMPONENT_CATALOG.map((c) => (
              <Panel key={c.id} padded={false} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-zinc-200">{c.titleFa}</p>
                    <p className="truncate font-mono text-[9.5px] text-zinc-600" dir="ltr">
                      {c.registry} · {c.fps}
                    </p>
                  </div>
                  <Badge tone="accent">{c.categoryLabelFa}</Badge>
                </div>
                <div className="flex min-h-[260px] items-center justify-center bg-[#0A0A0C] bg-engineering-dots p-4">
                  <UniversalComponentPreview previewType={c.previewType} />
                </div>
                <div className="flex items-center gap-1.5 border-t border-white/[0.06] p-2">
                  <CopyButton text={c.codeTsx} label="TSX" compact />
                  <CopyButton text={c.cliCommand} label="CLI" compact />
                  <CopyButton text={c.aiPromptFa} label="پرامپت" compact />
                </div>
              </Panel>
            ))}
          </div>

          <Panel
            title="سورس کامل پیش‌نمایش منتخب"
            subtitle="کد TSX دقیقاً همان کامپوننتی که در بالا دیده می‌شود"
            actions={<Badge>{COMPONENT_CATALOG.length} نمونه دست‌ساز</Badge>}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {COMPONENT_CATALOG.slice(0, 4).map((c) => (
                <CodeBlock key={c.id} code={c.codeTsx} filename={`${c.id}.tsx`} maxLines={16} />
              ))}
            </div>
          </Panel>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Boxes className="h-3 w-3" /> کل فایل‌ها
          </div>
          <div className="mt-1 font-mono text-[18px] text-zinc-100">
            {totalComponents.toLocaleString("fa-IR")}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Layers className="h-3 w-3" /> رجیستری
          </div>
          <div className="mt-1 font-mono text-[18px] text-zinc-100">
            {ALL_REGISTRIES_MANIFEST.length}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Sparkles className="h-3 w-3" /> پیش‌نمایش دست‌ساز
          </div>
          <div className="mt-1 font-mono text-[18px] text-zinc-100">{COMPONENT_CATALOG.length}</div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <ChevronLeft className="h-3 w-3" /> حجم سورس این رجیستری
          </div>
          <div className="mt-1 font-mono text-[18px] text-zinc-100">
            {(totalBytes / 1048576).toFixed(1)}MB
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsStudio;
