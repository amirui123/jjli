import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CreditCard,
  Download,
  FileCode2,
  Layers,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
} from "lucide-react";
import { CHUNK_SIZE, REGISTRY_FILES } from "../data/registryFiles";
import { COMPONENT_CATALOG } from "../data/componentCatalog";
import { loadAsset, useDebounced, usePersisted } from "../lib/store";
import { saveKit, saveText } from "../lib/download";
import { Badge, CodeBlock, CopyButton, Panel, SearchField, Slider, Toggle, cn } from "../ui/kit";
import { StudioShell, StudioList, focusStudioPreview } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import {
  DynamicIslandWidget,
  Iranian3DBankCardWidget,
  JalaliCalendarWidget,
  MagneticRtlDockWidget,
  PersianKineticTypographyWidget,
  RtlMotionBugHunterWidget,
  UniversalComponentPreview,
} from "../components/BentoShowcase";
import { faCount, faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";
import { useToast } from "../ui/Toast";

interface ChunkFile {
  p: string;
  s: number;
  c: string;
}

interface Row {
  reg: string;
  regLabel: string;
  path: string;
  bytes: number;
  index: number;
}

interface CodeSettings {
  fontSize: number;
  scope: "registry" | "all";
  borderRadius: number;
  glassBlur: number;
  widgetScale: number;
  accentColor: string;
  dirMode: "rtl" | "ltr";
  borderGlow: number;
  injectCustomHeader: boolean;
}

const DEFAULT_CODE: CodeSettings = {
  fontSize: 12,
  scope: "registry",
  borderRadius: 20,
  glassBlur: 16,
  widgetScale: 1,
  accentColor: "#34D399",
  dirMode: "rtl",
  borderGlow: 35,
  injectCustomHeader: true,
};

const ACCENT_SWATCHES = [
  { id: "emerald", label: "زمردی", hex: "#34D399" },
  { id: "gold", label: "طلایی", hex: "#F5C542" },
  { id: "cyan", label: "فیروزه‌ای", hex: "#38BDF8" },
  { id: "violet", label: "بنفش", hex: "#A78BFA" },
  { id: "rose", label: "یاقوتی", hex: "#FB7185" },
];

const ROW_H = 32;

const TOTAL_FILES = REGISTRY_FILES.reduce((a, r) => a + r.totalFiles, 0);
const TOTAL_SOURCE = REGISTRY_FILES.reduce((a, r) => a + r.sourceFiles, 0);

const FLAGSHIP_WIDGETS = [
  {
    id: "bank-card",
    label: "کارت بانکی شتاب 3D",
    icon: CreditCard,
    desc: "تشخیص خودکار بانک از روی BIN، الگوریتم Luhn و بازتاب هولوگرافیک حساس به موس",
  },
  {
    id: "jalali-calendar",
    label: "تقویم خورشیدی جلالی",
    icon: Calendar,
    desc: "الگوریتم نجومی سال کبیسه، انتخاب بازهٔ تاریخ و مناسبت‌های رسمی ایران",
  },
  {
    id: "magnetic-dock",
    label: "داک مغناطیسی RTL",
    icon: Layers,
    desc: "بزرگ‌نمایی گاوسی با نزدیک شدن موس و کپسول فعال مشترک",
  },
  {
    id: "dynamic-island",
    label: "جزیرهٔ پویا + گوی صوتی",
    icon: Sparkles,
    desc: "تغییر ابعاد سیال با فیزیک فنر بین ۳ حالت دستیار، پرداخت و تله‌متری",
  },
  {
    id: "bug-hunter",
    label: "ممیز خودکار RTL",
    icon: ShieldCheck,
    desc: "تشخیص و اصلاح خودکار کلاس‌های چپ‌به‌راست و باگ‌های انیمیشن فارسی",
  },
  {
    id: "kinetic-type",
    label: "تایپوگرافی جنبشی",
    icon: Type,
    desc: "ورود واژه‌به‌واژه با فیزیک فنر و صیانت کامل از پیوند حروف فارسی",
  },
] as const;

type FlagshipId = (typeof FLAGSHIP_WIDGETS)[number]["id"];

export const ComponentsStudio: React.FC = () => {
  const [raw, set, reset] = usePersisted<CodeSettings>("studio-components", DEFAULT_CODE);
  const s = { ...DEFAULT_CODE, ...raw };
  const [pick, setPick] = usePersisted<{ regId: string }>("studio-components-pick", {
    regId: REGISTRY_FILES[0]?.id ?? "",
  });
  const regId = REGISTRY_FILES.some((r) => r.id === pick.regId)
    ? pick.regId
    : (REGISTRY_FILES[0]?.id ?? "");

  const [activeWidget, setActiveWidget] = useState<FlagshipId>("bank-card");
  const [showLiveDeck, setShowLiveDeck] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [code, setCode] = useState<ChunkFile | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(448);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cache = useRef(new Map<string, ChunkFile[]>());
  const reqId = useRef(0);
  const toast = useToast();

  const debounced = useDebounced(query, 120);
  const registry = REGISTRY_FILES.find((r) => r.id === regId) ?? REGISTRY_FILES[0];

  const setRegId = (id: string) => {
    setPick({ regId: id });
    focusStudioPreview();
  };

  const rows = useMemo<Row[]>(() => {
    if (s.scope === "all") {
      return REGISTRY_FILES.flatMap((r) =>
        r.files.map(([path, bytes], idx) => ({
          reg: r.id,
          regLabel: r.label,
          path,
          bytes,
          index: idx,
        }))
      );
    }
    return registry.files.map(([path, bytes], i) => ({
      reg: registry.id,
      regLabel: registry.label,
      path,
      bytes,
      index: i,
    }));
  }, [registry, s.scope]);

  const filtered = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    return rows.filter((r) => {
      if (!term) return true;
      return r.path.toLowerCase().includes(term) || r.regLabel.toLowerCase().includes(term);
    });
  }, [rows, debounced]);

  const fetchChunk = useCallback(async (reg: string, chunk: number) => {
    const key = `${reg}#${chunk}`;
    const hit = cache.current.get(key);
    if (hit) return hit;
    const data = await loadAsset<ChunkFile[]>(`/regcode/chunks/${reg}/${chunk}.json`);
    cache.current.set(key, data);
    return data;
  }, []);

  const open = useCallback(
    async (row: Row) => {
      setSelected(row);
      soundEngine.playTick(1.1);
      focusStudioPreview();
      const my = ++reqId.current;
      const registryFiles = REGISTRY_FILES.find((r) => r.id === row.reg)?.files ?? [];
      const idx = registryFiles.findIndex(([p]) => p === row.path);
      if (idx < 0) {
        setCode(null);
        return;
      }
      const chunk = Math.floor(idx / CHUNK_SIZE);
      setLoadingCode(true);
      try {
        const files = await fetchChunk(row.reg, chunk);
        if (my !== reqId.current) return;
        setCode(files.find((f) => f.p === row.path) ?? null);
      } catch {
        if (my === reqId.current) setCode(null);
      } finally {
        if (my === reqId.current) setLoadingCode(false);
      }
    },
    [fetchChunk]
  );

  // Auto-open the first file in the active registry so the code viewer is never empty
  useEffect(() => {
    if (!selected && filtered.length > 0) {
      const firstTsx = filtered.find((r) => r.path.endsWith(".tsx")) ?? filtered[0];
      if (firstTsx) void open(firstTsx);
    }
  }, [filtered, open, selected]);

  const ensureCode = useCallback(
    async (row: Row | null): Promise<ChunkFile | null> => {
      if (!row) return null;
      if (code && selected && code.p === selected.path) return code;
      const registryFiles = REGISTRY_FILES.find((r) => r.id === row.reg)?.files ?? [];
      const idx = registryFiles.findIndex(([p]) => p === row.path);
      if (idx < 0) return null;
      const files = await fetchChunk(row.reg, Math.floor(idx / CHUNK_SIZE));
      return files.find((f) => f.p === row.path) ?? null;
    },
    [code, selected, fetchChunk]
  );

  const downloadRegistry = useCallback(async () => {
    const reg = REGISTRY_FILES.find((r) => r.id === regId);
    if (!reg) return false;
    const files: { name: string; content: string }[] = [];
    for (let i = 0; i < reg.chunks; i++) {
      const chunk = await fetchChunk(reg.id, i);
      for (const f of chunk) files.push({ name: `${reg.id}/${f.p}`, content: f.c });
    }
    if (files.length === 0) return false;
    return saveKit(`rtl-motion-registry-${reg.id}`, [
      ...files,
      {
        name: "README.md",
        content: `# ${reg.label} (${reg.id})\n\n${faNum(files.length)} فایل سورس آماده از مخزن متن‌باز.\n`,
      },
    ]);
  }, [regId, fetchChunk]);

  const decorateSourceWithCustomTokens = useCallback(
    (rawSource: string, filePath: string) => {
      if (!s.injectCustomHeader) return rawSource;
      const header = `/**
 * Customized in Persian RTL Blueprint Studio
 * File: ${filePath}
 * Direction: ${s.dirMode.toUpperCase()} | Radius: ${s.borderRadius}px | Backdrop Blur: ${s.glassBlur}px
 * Accent Token: ${s.accentColor} | Scale: ${s.widgetScale}x
 */
export const STUDIO_COMPONENT_TOKENS = {
  dir: "${s.dirMode}",
  borderRadiusPx: ${s.borderRadius},
  backdropBlurPx: ${s.glassBlur},
  accentHex: "${s.accentColor}",
  scale: ${s.widgetScale},
} as const;\n\n`;
      return header + rawSource;
    },
    [s.injectCustomHeader, s.dirMode, s.borderRadius, s.glassBlur, s.accentColor, s.widgetScale]
  );

  const downloadFile = useCallback(async () => {
    const file = await ensureCode(selected);
    if (!file) return false;
    const name = file.p.split("/").pop() ?? "component.tsx";
    const finalContent =
      file.p.endsWith(".tsx") || file.p.endsWith(".ts")
        ? decorateSourceWithCustomTokens(file.c, file.p)
        : file.c;
    saveText(finalContent, name, file.p.endsWith(".tsx") ? "text/typescript" : "text/plain");
    return true;
  }, [ensureCode, selected, decorateSourceWithCustomTokens]);

  const downloadKit = useCallback(async () => {
    const file = await ensureCode(selected);
    if (!file || !selected) return false;
    const name = file.p.split("/").pop() ?? "component.tsx";
    const base = name.replace(/\.\w+$/, "");
    const finalContent =
      file.p.endsWith(".tsx") || file.p.endsWith(".ts")
        ? decorateSourceWithCustomTokens(file.c, file.p)
        : file.c;
    return saveKit(`rtl-motion-${base}`, [
      { name, content: finalContent },
      {
        name: "studio-tokens.json",
        content: JSON.stringify(
          {
            dir: s.dirMode,
            borderRadiusPx: s.borderRadius,
            backdropBlurPx: s.glassBlur,
            accentHex: s.accentColor,
            scale: s.widgetScale,
          },
          null,
          2
        ),
      },
      {
        name: "README.md",
        content: `# ${name}\n\nرجیستری: ${selected.regLabel} (\`${selected.reg}\`)\nمسیر: \`${file.p}\`\n`,
      },
    ]);
  }, [
    ensureCode,
    selected,
    decorateSourceWithCustomTokens,
    s.dirMode,
    s.borderRadius,
    s.glassBlur,
    s.accentColor,
    s.widgetScale,
  ]);

  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - 6);
  const end = Math.min(filtered.length, start + Math.ceil(viewH / ROW_H) + 12);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setViewH(el.clientHeight || 448));
    ro.observe(el);
    setViewH(el.clientHeight || 448);
    return () => ro.disconnect();
  }, []);

  const catalogMatch = useMemo(() => {
    if (!selected) return null;
    const base = (selected.path.split("/").pop() ?? "").replace(/\.\w+$/, "").toLowerCase();
    return COMPONENT_CATALOG.find((c) => c.id.toLowerCase() === base) ?? null;
  }, [selected]);

  const activeWidgetMeta =
    FLAGSHIP_WIDGETS.find((w) => w.id === activeWidget) ?? FLAGSHIP_WIDGETS[0];

  return (
    <StudioShell
      variant="blueprint"
      eyebrow="BLUEPRINT COMPONENT & REGISTRY WORKBENCH"
      title="استودیو مونتاژ کامپوننت و کاوشگر سورس"
      description={`${faCount(TOTAL_SOURCE)} فایل سورس واقعی در ${faNum(REGISTRY_FILES.length)} رجیستری متن‌باز به‌همراه ۶ ویجت تعاملی بومی — تست کن و سورس را مستقیم دانلود کن.`}
      icon={Layers}
      stats={
        <>
          <Badge tone="accent">{faCount(TOTAL_SOURCE)} سورس</Badge>
          <Badge>{faNum(REGISTRY_FILES.length)} رجیستری</Badge>
        </>
      }
      actions={
        <div className="flex items-center gap-1.5">
          {selected && (
            <DownloadButton
              label={`دانلود ${selected.path.split("/").pop() ?? "فایل"}`}
              onDownload={downloadFile}
              compact
            />
          )}
          <DownloadButton
            label="دانلود کل رجیستری (ZIP)"
            onDownload={downloadRegistry}
            variant="ghost"
            compact
          />
        </div>
      }
      onReset={() => {
        reset();
        setQuery("");
      }}
      topDeck={
        <div className="flex flex-wrap items-center gap-1">
          <span className="me-1 text-[10px] font-bold text-emerald-300">ویجت‌های تعاملی بومی:</span>
          {FLAGSHIP_WIDGETS.map((w) => {
            const active = showLiveDeck && activeWidget === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  soundEngine.playSnap();
                  setShowLiveDeck(true);
                  setActiveWidget(w.id);
                }}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] transition-all",
                  active
                    ? "border-emerald-400/60 bg-emerald-400/20 font-bold text-white"
                    : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white"
                )}
              >
                <w.icon className="h-3 w-3 text-emerald-300" />
                <span>{w.label}</span>
              </button>
            );
          })}
        </div>
      }
      /* --------------------------------------------------- RIGHT RAIL: VIRTUALIZED FILE TREE */
      list={
        <StudioList
          title="درخت فایل‌های سورس"
          subtitle={`${faNum(filtered.length)} فایل در دسترس`}
          className="min-h-[420px] desk:min-h-0"
          listClassName="flex min-h-0 flex-col overflow-hidden p-1.5"
          footer={`${faNum(TOTAL_FILES)} فایل کل · ${faNum(TOTAL_SOURCE)} سورس`}
          toolbar={<Badge tone="accent">{faCount(filtered.length)}</Badge>}
        >
          <div className="shrink-0 space-y-2 pb-1.5">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="جستجوی نام کامپوننت (مثلاً dock، card، button)..."
            />
            <select
              value={s.scope === "all" ? "__all" : regId}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__all") set({ scope: "all" });
                else {
                  set({ scope: "registry" });
                  setRegId(v);
                }
                setSelected(null);
                setCode(null);
                soundEngine.playTick(1);
              }}
              aria-label="انتخاب رجیستری کامپوننت"
              className="w-full rounded-xl border border-white/[0.1] bg-[#070A10] px-2.5 py-2 font-mono text-[10.5px] text-zinc-200 outline-none focus:border-emerald-400"
              dir="ltr"
            >
              <option value="__all" className="bg-[#0B0D14]">
                All Registries ({TOTAL_FILES})
              </option>
              {REGISTRY_FILES.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#0B0D14]">
                  {r.label} ({r.totalFiles})
                </option>
              ))}
            </select>
          </div>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto"
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            <div style={{ height: filtered.length * ROW_H, position: "relative" }}>
              <div style={{ transform: `translateY(${start * ROW_H}px)` }}>
                {Array.from({ length: end - start }, (_, i) => {
                  const row = filtered[start + i];
                  if (!row) return null;
                  const active = selected?.path === row.path && selected?.reg === row.reg;
                  const name = row.path.split("/").pop() ?? row.path;
                  return (
                    <div
                      key={`${row.reg}/${row.path}`}
                      style={{ height: ROW_H }}
                      className={cn(
                        "group flex items-center gap-1.5 rounded-lg px-2 transition-colors",
                        active ? "bg-emerald-400/15 text-white" : "hover:bg-white/[0.04]"
                      )}
                    >
                      <button
                        type="button"
                        data-file-row
                        onClick={() => open(row)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-start"
                      >
                        <FileCode2
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            row.path.endsWith(".tsx") ? "text-emerald-400" : "text-zinc-500"
                          )}
                        />
                        <span
                          className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-zinc-200"
                          dir="ltr"
                        >
                          {name}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] text-zinc-500">
                          {(row.bytes / 1024).toFixed(1)}k
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const file = await ensureCode(row);
                          if (!file) return;
                          saveText(file.c, name, "text/typescript");
                          toast.push(`${name} دانلود شد`, { tone: "download" });
                        }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 text-zinc-400 hover:border-emerald-400/50 hover:text-emerald-300"
                        aria-label={`دانلود ${name}`}
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-[11px] text-zinc-500">
                <Search className="h-5 w-5" />
                فایلی با این عبارت پیدا نشد
              </div>
            )}
          </div>
        </StudioList>
      }
      /* --------------------------------------------------- CENTER STAGE: INTERACTIVE SANDBOX + SOURCE CODE */
      stage={
        <div className="space-y-3.5">
          {/* Interactive Native Widget Blueprint Stage */}
          {showLiveDeck && (
            <div className="overflow-hidden rounded-3xl border border-emerald-400/25 bg-[radial-gradient(85%_100%_at_50%_0%,rgba(52,211,153,0.12),#070A10_70%)] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <activeWidgetMeta.icon className="h-4 w-4 text-emerald-400" />
                    <span className="text-[13px] font-bold text-white">
                      میز تست زنده: {activeWidgetMeta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">{activeWidgetMeta.desc}</p>
                </div>
                <Badge tone="accent">RTL · 60FPS</Badge>
              </div>

              <div
                dir={s.dirMode}
                className="flex min-h-[240px] items-center justify-center border border-white/[0.08] bg-[#05070C]/80 bg-engineering-dots p-5 transition-all"
                style={{
                  borderRadius: `${s.borderRadius}px`,
                  backdropFilter: `blur(${s.glassBlur}px)`,
                  boxShadow:
                    s.borderGlow > 0
                      ? `0 0 ${s.borderGlow}px -6px ${s.accentColor}66, inset 0 0 18px ${s.accentColor}22`
                      : undefined,
                  borderColor: `${s.accentColor}55`,
                }}
              >
                <div
                  style={{
                    transform: `scale(${s.widgetScale})`,
                    transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                  className="w-full flex items-center justify-center"
                >
                  {activeWidget === "bank-card" && <Iranian3DBankCardWidget />}
                  {activeWidget === "jalali-calendar" && <JalaliCalendarWidget />}
                  {activeWidget === "magnetic-dock" && <MagneticRtlDockWidget />}
                  {activeWidget === "dynamic-island" && <DynamicIslandWidget />}
                  {activeWidget === "bug-hunter" && <RtlMotionBugHunterWidget />}
                  {activeWidget === "kinetic-type" && <PersianKineticTypographyWidget />}
                </div>
              </div>
            </div>
          )}

          {/* If the selected file in the registry also has a custom UniversalComponentPreview */}
          {catalogMatch && (
            <Panel
              title={`پیش‌نمایش اختصاصی کامپوننت: ${catalogMatch.titleFa}`}
              subtitle={catalogMatch.descriptionFa}
            >
              <div className="flex min-h-[210px] items-center justify-center rounded-2xl border border-white/[0.06] bg-[#07090F] p-5">
                <UniversalComponentPreview previewType={catalogMatch.previewType} />
              </div>
            </Panel>
          )}

          {/* Clean Source Code Inspector */}
          <Panel
            padded={false}
            title={
              <span className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-emerald-400" />
                <span className="truncate font-mono text-[12px]" dir="ltr">
                  {selected ? selected.path : "انتخاب فایل از فهرست"}
                </span>
              </span>
            }
            subtitle={
              selected
                ? `رجیستری: ${selected.regLabel} · حجم: ${faNum(selected.bytes)} بایت`
                : "روی هر فایل در ستون راست کلیک کنید تا سورس کامل باز شود"
            }
            actions={
              selected && (
                <div className="flex items-center gap-1.5">
                  {code && <CopyButton text={code.c} label="کپی سورس" compact />}
                  <DownloadButton
                    compact
                    label="دانلود فایل"
                    filename={selected.path.split("/").pop() ?? "component.tsx"}
                    onDownload={downloadFile}
                  />
                  <DownloadButton
                    compact
                    variant="solid"
                    label="دانلود کیت ZIP"
                    filename={`rtl-motion-${(selected.path.split("/").pop() ?? "component").replace(/\.\w+$/, "")}.zip`}
                    onDownload={downloadKit}
                  />
                </div>
              )
            }
          >
            {selected && loadingCode && (
              <div className="flex flex-col items-center gap-2 py-16 text-zinc-400">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <span className="text-[11px]">در حال بارگذاری سورس کامپوننت…</span>
              </div>
            )}

            {selected && !loadingCode && code && (
              <div className="p-2" data-testid="code-panel">
                <CodeBlock
                  code={code.c}
                  filename={selected.path.split("/").pop()}
                  language={
                    selected.path.endsWith(".tsx")
                      ? "tsx"
                      : selected.path.endsWith(".json")
                        ? "json"
                        : "ts"
                  }
                  maxLines={420}
                  showCopy={false}
                  fontSize={s.fontSize}
                />
              </div>
            )}
          </Panel>
        </div>
      }
      /* --------------------------------------------------- LEFT RAIL: SIMPLIFIED DOWNLOAD & REGISTRY SWITCHER */
      settings={
        <div className="space-y-3">
          {/* Direct Download Card */}
          <div className="rounded-2xl border border-emerald-400/45 bg-gradient-to-b from-emerald-400/16 to-[#0B0D14] p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-white">
                <Download className="h-4 w-4 text-emerald-300" />
                دانلود فوری کامپوننت و رجیستری
              </span>
              <Badge tone="accent">{registry.label}</Badge>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
              فایل فعلی را به‌صورت تکی (`.tsx`) یا کل رجیستری انتخاب‌شده را در یک فایل `.zip` دانلود
              کنید:
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {selected && (
                <DownloadButton
                  label={`دانلود مستقیم ${selected.path.split("/").pop() ?? "کامپوننت"}`}
                  onDownload={downloadFile}
                  className="w-full justify-center py-2.5 text-[12px]"
                />
              )}
              <DownloadButton
                label={`دانلود کل رجیستری ${registry.label} (ZIP)`}
                onDownload={downloadRegistry}
                variant="ghost"
                className="w-full justify-center py-2 text-[11.5px]"
              />
            </div>
          </div>

          {/* Expanded Component Architecture & Visual Customizer */}
          <Panel
            title="میز فرمان شخصی‌سازی معماری کامپوننت"
            subtitle="تغییرات زیر هم روی ویجت زنده و هم روی کد دانلودی اعمال می‌شوند"
            actions={
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-300 hover:text-white"
              >
                بازنشانی
              </button>
            }
          >
            <div className="space-y-3.5">
              {/* Accent Color Swatches */}
              <div>
                <div className="mb-1.5 text-[11px] font-semibold text-zinc-300">
                  تم رنگی و هالهٔ نوری کامپوننت:
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {ACCENT_SWATCHES.map((sw) => (
                    <button
                      key={sw.id}
                      type="button"
                      onClick={() => set({ accentColor: sw.hex })}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border p-1.5 text-[10px] transition-all",
                        s.accentColor === sw.hex
                          ? "border-white bg-white/15 font-bold text-white"
                          : "border-white/10 bg-black/30 text-zinc-400"
                      )}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: sw.hex }}
                      />
                      <span>{sw.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direction Mode Toggle (RTL vs LTR) */}
              <div>
                <div className="mb-1.5 text-[11px] font-semibold text-zinc-300">
                  جهت چیدمان کانتینر (Direction):
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "rtl", label: "RTL (راست‌به‌چپ فارسی)" },
                    { id: "ltr", label: "LTR (چپ‌به‌راست تست)" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => set({ dirMode: d.id as "rtl" | "ltr" })}
                      className={cn(
                        "rounded-xl border py-1.5 text-[10.5px] font-semibold transition-all",
                        s.dirMode === d.id
                          ? "border-emerald-400/70 bg-emerald-400/20 text-emerald-200"
                          : "border-white/10 bg-black/30 text-zinc-400"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <Slider
                label="شعاع انحنای گوشه (Squircle Radius)"
                value={s.borderRadius}
                min={0}
                max={36}
                step={2}
                unit="px"
                onChange={(borderRadius) => set({ borderRadius })}
              />
              <Slider
                label="شدت شیشهٔ مات (Backdrop Blur)"
                value={s.glassBlur}
                min={0}
                max={32}
                step={2}
                unit="px"
                onChange={(glassBlur) => set({ glassBlur })}
              />
              <Slider
                label="مقیاس بزرگ‌نمایی ویجت (Scale)"
                value={s.widgetScale}
                min={0.85}
                max={1.15}
                step={0.05}
                unit="x"
                onChange={(widgetScale) => set({ widgetScale })}
              />
              <Slider
                label="شدت درخشش کادر مهندسی (Border Glow)"
                value={s.borderGlow}
                min={0}
                max={70}
                step={5}
                unit="px"
                onChange={(borderGlow) => set({ borderGlow })}
              />
              <Slider
                label="اندازهٔ قلم نمایشگر کد (Code Font Size)"
                value={s.fontSize}
                min={10}
                max={16}
                step={0.5}
                unit="px"
                onChange={(fontSize) => set({ fontSize })}
              />
              <Toggle
                label="تزریق توکن‌های شخصی‌سازی به فایل دانلودی"
                hint="بلوک STUDIO_COMPONENT_TOKENS به ابتدای فایل .tsx اضافه می‌شود"
                checked={s.injectCustomHeader}
                onChange={(injectCustomHeader) => set({ injectCustomHeader })}
              />
              <Toggle
                label="نمایش میز تست زندهٔ ویجت‌های بومی"
                hint="۶ ویجت پرچم‌دار در بالای سورس"
                checked={showLiveDeck}
                onChange={setShowLiveDeck}
              />
            </div>
          </Panel>

          {/* 13 Registries Quick Picker */}
          <Panel
            title={`انتخاب سریع رجیستری (${faNum(REGISTRY_FILES.length)} مخزن)`}
            subtitle="با کلیک روی هر مخزن، فایل‌های آن باز می‌شود"
          >
            <div className="space-y-1.5">
              {REGISTRY_FILES.map((r) => {
                const active = s.scope === "registry" && r.id === regId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      set({ scope: "registry" });
                      setRegId(r.id);
                      setSelected(null);
                      setCode(null);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-start text-[11px] transition-all",
                      active
                        ? "border-emerald-400/55 bg-emerald-400/14 font-bold text-white"
                        : "border-white/[0.05] bg-white/[0.015] text-zinc-300 hover:border-white/15"
                    )}
                  >
                    <span className="truncate">{r.label}</span>
                    <span className="rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[9.5px] text-zinc-400">
                      {faNum(r.totalFiles)} فایل
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      }
    />
  );
};

export default ComponentsStudio;
