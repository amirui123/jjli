import React, { useCallback, useMemo, useRef, useState } from "react";
import { Download, FileCode2, FolderTree, Layers, Loader2, Search } from "lucide-react";
import { CHUNK_SIZE, REGISTRY_FILES } from "../data/registryFiles";
import { COMPONENT_CATALOG } from "../data/componentCatalog";
import { loadAsset, useDebounced, usePersisted } from "../lib/store";
import { saveKit, saveText } from "../lib/download";
import {
  Badge,
  CodeBlock,
  CopyButton,
  EmptyState,
  Panel,
  SearchField,
  Segmented,
  Slider,
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { UniversalComponentPreview } from "../components/BentoShowcase";
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

type SortKey = "path" | "size" | "dir";

interface CodeSettings {
  fontSize: number;
  sort: SortKey;
  ext: "all" | "tsx" | "ts";
  wrap: boolean;
  scope: "registry" | "all";
}

const DEFAULT_CODE: CodeSettings = {
  fontSize: 11.5,
  sort: "path",
  ext: "all",
  wrap: false,
  scope: "registry",
};

const ROW_H = 30;
const LIST_H = 448;

const TOTAL_FILES = REGISTRY_FILES.reduce((a, r) => a + r.totalFiles, 0);
const TOTAL_SOURCE = REGISTRY_FILES.reduce((a, r) => a + r.sourceFiles, 0);

export const ComponentsStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<CodeSettings>("studio-components", DEFAULT_CODE);
  const [regId, setRegId] = useState(REGISTRY_FILES[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [code, setCode] = useState<ChunkFile | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(true);
  const cache = useRef(new Map<string, ChunkFile[]>());
  const reqId = useRef(0);
  const toast = useToast();

  const debounced = useDebounced(query, 140);

  const registry = REGISTRY_FILES.find((r) => r.id === regId) ?? REGISTRY_FILES[0];

  const rows = useMemo<Row[]>(() => {
    const source =
      s.scope === "all"
        ? REGISTRY_FILES.flatMap((r) =>
            r.files.map(([path, bytes]) => ({ reg: r.id, regLabel: r.label, path, bytes, index: 0 }))
          )
        : registry.files.map(([path, bytes], i) => ({
            reg: registry.id,
            regLabel: registry.label,
            path,
            bytes,
            index: i,
          }));
    return source;
  }, [registry, s.scope]);

  const filtered = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (s.ext === "tsx" && !r.path.endsWith(".tsx")) return false;
      if (s.ext === "ts" && !r.path.endsWith(".ts")) return false;
      if (term && !r.path.toLowerCase().includes(term) && !r.regLabel.toLowerCase().includes(term)) return false;
      return true;
    });
    if (s.sort === "path") out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    if (s.sort === "size") out.sort((a, b) => b.bytes - a.bytes);
    if (s.sort === "dir") out.sort((a, b) => (a.path.split("/")[0] < b.path.split("/")[0] ? -1 : 1));
    return out;
  }, [rows, debounced, s.ext, s.sort]);

  /* --------------------------------------------------------- chunk loading */

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
      soundEngine.playTick(1.2);
      const my = ++reqId.current;
      // locate index inside its own registry (deterministic chunk mapping)
      const registryFiles = REGISTRY_FILES.find((r) => r.id === row.reg)!.files;
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

  const ensureCode = useCallback(
    async (row: Row | null): Promise<ChunkFile | null> => {
      if (!row) return null;
      if (code && selected && code.p === selected.path) return code;
      const registryFiles = REGISTRY_FILES.find((r) => r.id === row.reg)!.files;
      const idx = registryFiles.findIndex(([p]) => p === row.path);
      if (idx < 0) return null;
      const files = await fetchChunk(row.reg, Math.floor(idx / CHUNK_SIZE));
      return files.find((f) => f.p === row.path) ?? null;
    },
    [code, selected, fetchChunk]
  );

  const downloadFile = useCallback(async () => {
    const file = await ensureCode(selected);
    if (!file) return false;
    const name = file.p.split("/").pop() ?? "component.tsx";
    saveText(file.c, name, file.p.endsWith(".tsx") ? "text/typescript" : "text/plain");
    return true;
  }, [ensureCode, selected]);

  const downloadKit = useCallback(async () => {
    const file = await ensureCode(selected);
    if (!file || !selected) return false;
    const name = file.p.split("/").pop() ?? "component.tsx";
    const base = name.replace(/\.\w+$/, "");
    return saveKit(`rtl-motion-${base}`, [
      { name, content: file.c },
      {
        name: "README.md",
        content: `# ${name}

منبع واقعی: \`toolkit/04-motion-primitives-and-ui/${selected.reg}/${file.p}\`
رجیستری: ${selected.regLabel} (\`${selected.reg}\`)
حجم فایل: ${faNum(file.s)} بایت · ${faNum(file.c.split("\n").length)} خط

## نصب وابستگی‌ها
\`\`\`bash
npm i framer-motion clsx tailwind-merge lucide-react
\`\`\`

## نکات RTL
- تنها از کلاس‌های منطقی (\`ms-*\`، \`me-*\`، \`ps-*\`، \`pe-*\`، \`start-*\`، \`end-*\`) استفاده کنید.
- روی متن فارسی \`letter-spacing\` مثبت نگذارید.
- انیمیشن پیوسته را با \`useMotionValue\` + \`useSpring\` خارج از چرخه رندر نگه دارید.

## استفاده
\`\`\`tsx
import Component from "./${base}";
\`\`\`
`,
      },
      {
        name: "meta.json",
        content: JSON.stringify(
          {
            registry: selected.reg,
            registryLabel: selected.regLabel,
            path: file.p,
            bytes: file.s,
            lines: file.c.split("\n").length,
            exportedAt: new Date().toISOString(),
            license: "مطابق مجوز مخزن اصلی رجیستری",
          },
          null,
          2
        ),
      },
    ]);
  }, [ensureCode, selected]);

  /* ------------------------------------------------------------- list view */

  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - 6);
  const end = Math.min(filtered.length, start + Math.ceil(LIST_H / ROW_H) + 12);

  const list = (
    <StudioList
      title="فایل‌های واقعی"
      subtitle={`${faCount(filtered.length)} فایل · ${(filtered.reduce((a, r) => a + r.bytes, 0) / 1048576).toFixed(1)}MB`}
      className="h-[calc(100vh-186px)] min-h-[460px]"
      listClassName="flex min-h-0 flex-col overflow-hidden p-1.5"
      footer={`${faNum(TOTAL_FILES)} فایل کل · ${faNum(TOTAL_SOURCE)} سورس`}
      toolbar={<Badge tone="accent">{faCount(filtered.length)}</Badge>}
    >
      <div className="shrink-0 space-y-2 pb-1.5">
        <SearchField value={query} onChange={setQuery} placeholder="جستجوی فایل یا رجیستری…" />
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
          className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 font-mono text-[10px] text-zinc-200 outline-none"
          dir="ltr"
        >
          <option value="__all" className="bg-[#111]">
            همه رجیستری‌ها ({TOTAL_FILES})
          </option>
          {REGISTRY_FILES.map((r) => (
            <option key={r.id} value={r.id} className="bg-[#111]">
              {r.id} ({r.totalFiles})
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
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
                    "group flex items-center gap-1.5 rounded-md px-1.5 transition-colors",
                    active ? "bg-[color:var(--accent)]/10" : "hover:bg-white/[0.035]"
                  )}
                >
                  <button data-file-row onClick={() => open(row)} className="flex min-w-0 flex-1 items-center gap-1.5 text-start">
                    <FileCode2
                      className={cn(
                        "h-3 w-3 shrink-0",
                        row.path.endsWith(".tsx") ? "text-teal-400/70" : "text-zinc-600"
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-zinc-300" dir="ltr">
                      {name}
                    </span>
                    <span className="shrink-0 font-mono text-[8.5px] text-zinc-700">{(row.bytes / 1024).toFixed(1)}k</span>
                  </button>
                  <button
                    onClick={async () => {
                      const file = await ensureCode(row);
                      if (!file) return;
                      saveText(file.c, name, "text/typescript");
                      toast.push(`${name} دانلود شد`, { tone: "download" });
                    }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/10 text-zinc-500 opacity-0 transition-opacity hover:text-[color:var(--accent)] group-hover:opacity-100"
                    aria-label={`دانلود ${name}`}
                  >
                    <Download className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-[11px] text-zinc-600">
            <Search className="h-5 w-5" />
            فایلی با این شرط پیدا نشد
          </div>
        )}
      </div>
    </StudioList>
  );

  /* ------------------------------------------------------------ stage view */

  const catalogMatch = useMemo(() => {
    if (!selected) return null;
    const base = (selected.path.split("/").pop() ?? "").replace(/\.\w+$/, "").toLowerCase();
    return COMPONENT_CATALOG.find((c) => c.id.toLowerCase() === base) ?? null;
  }, [selected]);

  const lineCount = code ? code.c.split("\n").length : 0;

  const stage = (
    <div className="space-y-4">
      <Panel
        padded={false}
        title={
          <span className="flex items-center gap-2">
            <FileCode2 className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            <span className="truncate font-mono text-[12px]" dir="ltr">
              {selected ? selected.path : "فایلی انتخاب نشده"}
            </span>
          </span>
        }
        subtitle={
          selected
            ? `${selected.regLabel} · ${faNum(selected.bytes)} بایت${code ? ` · ${faNum(lineCount)} خط` : ""}`
            : "از فهرست کنار، یک فایل را باز کنید تا سورس واقعی آن نمایش داده شود"
        }
        actions={
          selected && (
            <>
              <CopyButton text={`${selected.reg}/${selected.path}`} label="مسیر" compact />
              {code && <CopyButton text={code.c} label="کد" compact />}
              <DownloadButton compact label="فایل" filename={selected.path.split("/").pop() ?? "component.tsx"} onDownload={downloadFile} />
              <DownloadButton
                compact
                variant="solid"
                label="کیت"
                filename={`rtl-motion-${(selected.path.split("/").pop() ?? "component").replace(/\.\w+$/, "")}.zip`}
                onDownload={downloadKit}
              />
            </>
          )
        }
      >
        {!selected && (
          <EmptyState
            icon={<FolderTree className="h-6 w-6" />}
            title="کاوشگر سورس"
            hint={`${faNum(TOTAL_FILES)} فایل واقعی از ${faNum(REGISTRY_FILES.length)} رجیستری متن‌باز. جستجو کنید یا از فهرست انتخاب کنید.`}
          />
        )}

        {selected && loadingCode && (
          <div className="flex flex-col items-center gap-2 py-20 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-[11px]">خواندن سورس از بسته تنبل…</span>
          </div>
        )}

        {selected && !loadingCode && code && (
          <div className="p-2" data-testid="code-panel">
            <CodeBlock
              code={code.c}
              filename={selected.path.split("/").pop()}
              language={selected.path.endsWith(".tsx") ? "tsx" : selected.path.endsWith(".json") ? "json" : "ts"}
              maxLines={420}
              showCopy={false}
              className="[&_pre]:!text-[var(--code-size)]"
            />
          </div>
        )}

        {selected && !loadingCode && !code && (
          <EmptyState
            icon={<FileCode2 className="h-6 w-6" />}
            title="این فایل متن خوانا ندارد"
            hint="فایل‌های باینری یا بزرگ‌تر از سقف نمایش، فقط دانلود می‌شوند."
          />
        )}
      </Panel>

      {catalogMatch && previewOpen && (
        <Panel
          title="پیش‌نمایش زنده"
          subtitle={`${catalogMatch.titleFa} — اجرای واقعی با متغیرهای رابط`}
          actions={
            <>
              <Badge tone="accent">{catalogMatch.fps}</Badge>
              <button
                onClick={() => setPreviewOpen(false)}
                className="rounded-md border border-white/10 px-2 py-0.5 text-[9.5px] text-zinc-500 hover:text-white"
              >
                بستن
              </button>
            </>
          }
        >
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#0A0A0C] bg-engineering-dots p-6">
            <UniversalComponentPreview previewType={catalogMatch.previewType} />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{catalogMatch.descriptionFa}</p>
        </Panel>
      )}

      {!catalogMatch && selected && (
        <Panel tone="inset" title="بدون پیش‌نمایش اختصاصی">
          <p className="text-[11px] leading-relaxed text-zinc-400">
            این فایل در کاتالوگ پیش‌نمایش‌های دست‌ساز نیست؛ اما سورس کامل آن بالا نمایش داده شده و
            قابل دانلود است. پیش‌نمایش‌های آماده را از «کاتالوگ» ببینید.
          </p>
        </Panel>
      )}
    </div>
  );

  /* --------------------------------------------------------- settings view */

  const settings = (
    <div className="space-y-4">
      <Panel title="دامنه و فیلتر">
        <div className="space-y-2.5">
          <div>
            <span className="mb-1 block text-[10.5px] text-zinc-400">دامنه</span>
            <Segmented
              className="w-full"
              size="sm"
              value={s.scope}
              onChange={(v) => set({ scope: v })}
              options={[
                { value: "registry", label: "یک رجیستری" },
                { value: "all", label: `همه (${faNum(TOTAL_FILES)})` },
              ]}
            />
          </div>
          <div>
            <span className="mb-1 block text-[10.5px] text-zinc-400">پسوند</span>
            <div className="flex gap-1">
              {(["all", "tsx", "ts"] as const).map((x) => (
                <button
                  key={x}
                  onClick={() => set({ ext: x })}
                  className={cn(
                    "flex-1 rounded-md border py-1 font-mono text-[9.5px] transition-colors",
                    s.ext === x
                      ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {x === "all" ? "همه" : `.${x}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-[10.5px] text-zinc-400">ترتیب</span>
            <div className="flex gap-1">
              {(
                [
                  ["path", "نام"],
                  ["size", "حجم"],
                  ["dir", "پوشه"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => set({ sort: k })}
                  className={cn(
                    "flex-1 rounded-md border py-1 text-[9.5px] transition-colors",
                    s.sort === k
                      ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="نمایش کد">
        <div className="space-y-3">
          <Slider
            label="اندازه فونت کد"
            value={s.fontSize}
            min={9}
            max={16}
            step={0.5}
            unit="px"
            format={(v) => v.toFixed(1)}
            onChange={(v) => set({ fontSize: v })}
          />
          <Toggle label="پیش‌نمایش زنده" checked={previewOpen} onChange={setPreviewOpen} />
          <button
            onClick={() => set({ fontSize: 11.5 })}
            className="w-full rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
          >
            بازگشت اندازه فونت
          </button>
        </div>
      </Panel>

      <Panel title="رجیستری‌ها" subtitle="شمارش واقعی از پوشه مخزن">
        <div className="space-y-1.5">
          {REGISTRY_FILES.map((r) => {
            const active = s.scope === "registry" && r.id === regId;
            return (
              <button
                key={r.id}
                onClick={() => {
                  set({ scope: "registry" });
                  setRegId(r.id);
                  setSelected(null);
                  setCode(null);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-start transition-colors hover:bg-white/[0.04]",
                  active && "bg-white/[0.05]"
                )}
              >
                <span className="w-[104px] shrink-0 truncate text-[9.5px] text-zinc-400">{r.label}</span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className={cn("block h-full rounded-full", active ? "bg-[color:var(--accent)]" : "bg-[color:var(--accent)]/45")}
                    style={{ width: `${Math.max(2, (r.totalFiles / TOTAL_FILES) * 100)}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-end font-mono text-[9px] text-zinc-600">{r.totalFiles}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel tone="inset" title="چطور کار می‌کند">
        <p className="text-[11px] leading-relaxed text-zinc-400">
          سورس در ۴۷ بسته‌ تنبل ذخیره شده؛ فقط وقتی فایلی را باز می‌کنید همان بسته خوانده می‌شود.
          به همین دلیل جستجو روی {faNum(TOTAL_FILES)} فایل بدون لگ انجام می‌شود.
        </p>
      </Panel>
    </div>
  );

  return (
    <>
      <style>{`:root{--code-size:${s.fontSize}px}`}</style>
      <StudioShell
        eyebrow="COMPONENT STUDIO"
        title="استودیو کامپوننت"
        description={`کاوشگر واقعی ${faCount(TOTAL_SOURCE)} فایل سورس در ${faNum(REGISTRY_FILES.length)} رجیستری متن‌باز (${faCount(TOTAL_FILES)} فایل با متادیتا). هر فایل جداگانه یا به‌صورت کیت قابل دانلود است.`}
        icon={Layers}
        stats={
          <>
            <Badge tone="accent">{faCount(TOTAL_SOURCE)} سورس</Badge>
            <Badge>{faNum(REGISTRY_FILES.length)} رجیستری</Badge>
          </>
        }
        onReset={() => {
          reset();
          setQuery("");
        }}
        listWidth="250px"
        settingsWidth="292px"
        list={list}
        stage={stage}
        settings={settings}
      />
    </>
  );
};

export default ComponentsStudio;
