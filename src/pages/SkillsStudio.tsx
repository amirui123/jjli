import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  FileCode2,
  FileText,
  FolderTree,
  LayoutGrid,
  Palette,
  Search,
  Sliders,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  ALL_BRAND_DESIGNS_MANIFEST,
  ALL_SKILLS_MANIFEST,
  type BrandDesignManifestItem,
  type SkillManifestItem,
} from "../data/skillsManifest";
import {
  DESIGN_LAB_PILLARS,
  DESIGN_LAB_TOTAL_FILES,
} from "../data/designLabManifest";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { publicUrl } from "../lib/base";
import {
  ACCENTS,
  useAppSettings,
  useDebounced,
  usePersisted,
} from "../lib/store";

const textFetchCache = new Map<string, Promise<string>>();

function loadText(input: string): Promise<string> {
  const url = publicUrl(input);
  const hit = textFetchCache.get(url);
  if (hit) return hit;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.text();
    })
    .catch((err) => {
      textFetchCache.delete(url);
      throw err;
    });
  textFetchCache.set(url, p);
  return p;
}
import { saveKit, saveText } from "../lib/download";
import {
  Badge,
  CodeBlock,
  CopyButton,
  Panel,
  SearchField,
  Segmented,
  Slider,
  Spinner,
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList, focusStudioPreview } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { Markdown } from "../ui/Markdown";
import { faCount, faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";

type Tab = "vault4000" | "skills179" | "brands84";
type FileExtFilter = "all" | "md" | "code" | "shader";
type StageViewMode = "reader" | "prompt";
type SettingsTab = "target" | "rules" | "reader";

interface SkillStudioSettings {
  size: number;
  lineHeight: number;
  fontId: string;
  theme: "dark" | "paper" | "lapis";
  targetStack: "react-tailwind" | "nextjs" | "vue" | "vanilla" | "ae-script";
  strictness: "mvp" | "production" | "aaa-120hz";
  inject603010: boolean;
  injectOledSafe: boolean;
  injectRtlRules: boolean;
  injectSpringPhysics: boolean;
  outputTone: "persian-docs" | "code-only" | "step-by-step";
  codeFontSize: number;
}

const DEFAULT_SETTINGS: SkillStudioSettings = {
  size: 14,
  lineHeight: 1.9,
  fontId: "vazirmatn",
  theme: "dark",
  targetStack: "react-tailwind",
  strictness: "aaa-120hz",
  inject603010: true,
  injectOledSafe: true,
  injectRtlRules: true,
  injectSpringPhysics: true,
  outputTone: "persian-docs",
  codeFontSize: 12,
};

interface VaultFileRow {
  pillarId: string;
  pillarCode: string;
  pillarTitleFa: string;
  pillarAccent: string;
  subcatId: string;
  subcatTitleFa: string;
  relPath: string;
  fileName: string;
  ext: string;
  bytes: number;
  fullUrl: string;
}

const ROW_H = 40;

function skillDocUrl(id: string) {
  return `/vault/skills/${id.replace(/\//g, "__")}.md`;
}

export const SkillsStudio: React.FC = () => {
  const [tab, setTab] = useState<Tab>("vault4000");
  const [stageView, setStageView] = useState<StageViewMode>("reader");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("target");
  const [showPillarGrid, setShowPillarGrid] = useState<boolean>(false);

  const [pick, setPick] = usePersisted<{
    pillarId?: string;
    vaultUrl: string;
    skill: string;
    brand: string;
  }>("studio-skills-pick-v2", {
    pillarId: "all",
    vaultUrl: "/design-lab/00-INDEX-AND-BLUEPRINTS/01-MASTER-VAULT-INDEX.md",
    skill: ALL_SKILLS_MANIFEST[0]?.id ?? "",
    brand: ALL_BRAND_DESIGNS_MANIFEST[0]?.id ?? "",
  });

  const selectedPillarId = pick.pillarId ?? "all";
  const setSelectedPillarId = (pillarId: string) => setPick({ ...pick, pillarId });
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>("all");
  const [extFilter, setExtFilter] = useState<FileExtFilter>("all");
  const [q, setQ] = useState("");

  const [rawSettings, setSettings, reset] = usePersisted<SkillStudioSettings>(
    "studio-skills-v2",
    DEFAULT_SETTINGS
  );
  const s = useMemo(() => ({ ...DEFAULT_SETTINGS, ...rawSettings }), [rawSettings]);

  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(480);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { update } = useAppSettings();

  const debouncedQ = useDebounced(q, 110);

  // Build flat index of all 4,023 files in design-lab
  const allVaultRows = useMemo<VaultFileRow[]>(() => {
    const out: VaultFileRow[] = [];
    for (const p of DESIGN_LAB_PILLARS) {
      for (const sc of p.subcategories) {
        for (const [relPath, bytes] of sc.files) {
          const parts = relPath.split("/");
          const fileName = parts[parts.length - 1] ?? relPath;
          const dotIdx = fileName.lastIndexOf(".");
          const ext = dotIdx >= 0 ? fileName.slice(dotIdx + 1).toLowerCase() : "";
          out.push({
            pillarId: p.id,
            pillarCode: p.code,
            pillarTitleFa: p.titleFa,
            pillarAccent: p.accent,
            subcatId: sc.id,
            subcatTitleFa: sc.titleFa,
            relPath,
            fileName,
            ext,
            bytes,
            fullUrl: `/design-lab/${p.id}/${sc.id}/${relPath}`,
          });
        }
      }
    }
    return out;
  }, []);

  const activePillarObj = useMemo(
    () => DESIGN_LAB_PILLARS.find((p) => p.id === selectedPillarId) ?? null,
    [selectedPillarId]
  );

  // Filtered 4,023 vault files
  const filteredVaultRows = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return allVaultRows.filter((row) => {
      if (selectedPillarId !== "all" && row.pillarId !== selectedPillarId) return false;
      if (selectedSubcatId !== "all" && row.subcatId !== selectedSubcatId) return false;
      if (extFilter === "md" && row.ext !== "md" && row.ext !== "mdx") return false;
      if (
        extFilter === "code" &&
        !["tsx", "ts", "jsx", "js", "py", "rs", "css", "html"].includes(row.ext)
      ) {
        return false;
      }
      if (extFilter === "shader" && !["glsl", "wgsl", "frag", "vert", "json"].includes(row.ext)) {
        return false;
      }
      if (!term) return true;
      return (
        row.relPath.toLowerCase().includes(term) ||
        row.subcatTitleFa.toLowerCase().includes(term) ||
        row.pillarTitleFa.toLowerCase().includes(term)
      );
    });
  }, [allVaultRows, selectedPillarId, selectedSubcatId, extFilter, debouncedQ]);

  const filteredSkills179 = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return ALL_SKILLS_MANIFEST.filter((item) => {
      if (!term) return true;
      return `${item.title} ${item.slug} ${item.summary} ${item.categoryFolder}`
        .toLowerCase()
        .includes(term);
    });
  }, [debouncedQ]);

  const filteredBrands84 = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return ALL_BRAND_DESIGNS_MANIFEST.filter((b) => {
      if (!term) return true;
      return `${b.title} ${b.id} ${b.excerpt}`.toLowerCase().includes(term);
    });
  }, [debouncedQ]);

  const selectedVaultRow = useMemo(
    () =>
      allVaultRows.find((r) => r.fullUrl === pick.vaultUrl) ??
      filteredVaultRows[0] ??
      allVaultRows[0],
    [allVaultRows, filteredVaultRows, pick.vaultUrl]
  );

  const currentRowIndex = useMemo(() => {
    if (!selectedVaultRow) return -1;
    return filteredVaultRows.findIndex((r) => r.fullUrl === selectedVaultRow.fullUrl);
  }, [filteredVaultRows, selectedVaultRow]);

  const stepVaultFile = (delta: number) => {
    if (filteredVaultRows.length === 0) return;
    const nextIdx =
      currentRowIndex < 0
        ? 0
        : (currentRowIndex + delta + filteredVaultRows.length) % filteredVaultRows.length;
    const nextRow = filteredVaultRows[nextIdx];
    if (nextRow) {
      soundEngine.playTick(1.05);
      setPick({ ...pick, vaultUrl: nextRow.fullUrl });
    }
  };

  const selectedSkill: SkillManifestItem | null = useMemo(
    () =>
      ALL_SKILLS_MANIFEST.find((x) => x.id === pick.skill) ??
      filteredSkills179[0] ??
      ALL_SKILLS_MANIFEST[0] ??
      null,
    [filteredSkills179, pick.skill]
  );

  const selectedBrand: BrandDesignManifestItem | null = useMemo(
    () =>
      ALL_BRAND_DESIGNS_MANIFEST.find((x) => x.id === pick.brand) ??
      filteredBrands84[0] ??
      ALL_BRAND_DESIGNS_MANIFEST[0] ??
      null,
    [filteredBrands84, pick.brand]
  );

  // Load real file content on selection change
  useEffect(() => {
    let alive = true;
    setLoading(true);
    if (tab === "vault4000" && selectedVaultRow) {
      loadText(selectedVaultRow.fullUrl)
        .then((txt) => alive && setFileContent(txt))
        .catch(() =>
          alive &&
          setFileContent(
            `# ${selectedVaultRow.fileName}\n\nمسیر در مخزن: \`${selectedVaultRow.fullUrl}\`\nدسته: ${selectedVaultRow.pillarTitleFa} / ${selectedVaultRow.subcatTitleFa}`
          )
        )
        .finally(() => alive && setLoading(false));
    } else if (tab === "skills179" && selectedSkill) {
      loadText(skillDocUrl(selectedSkill.id))
        .then((txt) => alive && setFileContent(txt))
        .catch(() => alive && setFileContent(selectedSkill.summary))
        .finally(() => alive && setLoading(false));
    } else if (tab === "brands84" && selectedBrand) {
      loadText(`/vault/brands/${selectedBrand.id}.md`)
        .then((txt) => alive && setFileContent(txt))
        .catch(() => alive && setFileContent(selectedBrand.excerpt))
        .finally(() => alive && setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      alive = false;
    };
  }, [tab, selectedVaultRow, selectedSkill, selectedBrand]);

  // Virtualized scroll window calculation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setViewH(el.clientHeight || 480));
    ro.observe(el);
    setViewH(el.clientHeight || 480);
    return () => ro.disconnect();
  }, []);

  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - 6);
  const endIdx = Math.min(
    filteredVaultRows.length,
    startIdx + Math.ceil(viewH / ROW_H) + 14
  );

  // Build customized AI Prompt from the active file + user's customization settings
  const customizedPrompt = useMemo(() => {
    const stackLabel =
      s.targetStack === "react-tailwind"
        ? "React 19 + TypeScript + Tailwind CSS v4 + Framer Motion"
        : s.targetStack === "nextjs"
          ? "Next.js 15 App Router + Server/Client Components + Tailwind v4"
          : s.targetStack === "vue"
            ? "Vue 3 Composition API + TypeScript + Tailwind CSS"
            : s.targetStack === "ae-script"
              ? "Adobe After Effects ExtendScript (JSX) + JavaScript Expressions"
              : "HTML5 + Modern CSS + Vanilla TS";

    const strictLabel =
      s.strictness === "aaa-120hz"
        ? "سطح AAA-120Hz (بدون افت فریم، دسترس‌پذیری کامل کیبورد و کنتراست استاندارد)"
        : s.strictness === "production"
          ? "سطح پروداکشن تجاری (کد تمیز، ماژولار و تایپ‌شده)"
          : "سطح نمونهٔ اولیه سریع (MVP تک‌فایلی)";

    const toneLabel =
      s.outputTone === "code-only"
        ? "فقط کد نهایی و کامل را بدون توضیحات اضافه برگردان."
        : s.outputTone === "step-by-step"
          ? "معماری را گام‌به‌گام توضیح بده و سپس کد کامل را بنویس."
          : "کد کامل را به‌همراه کامنت‌ها و مستندات فارسی بنویس.";

    const title =
      tab === "vault4000"
        ? `${selectedVaultRow?.fileName} (${selectedVaultRow?.subcatTitleFa})`
        : tab === "skills179"
          ? selectedSkill?.title ?? ""
          : `سیستم برند ${selectedBrand?.title ?? ""}`;

    const rules: string[] = [];
    if (s.inject603010) {
      rules.push(
        "- **قانون رنگی ۶۰-۳۰-۱۰ در فضای OKLCH:** ۶۰٪ پس‌زمینهٔ آرام، ۳۰٪ سطوح و کارت‌ها، ۱۰٪ رنگ تأکیدی کانونی."
      );
    }
    if (s.injectOledSafe) {
      rules.push(
        "- **محافظت از پنل OLED (ضد کشیدگی سیاه):** به‌جای `#000000` از `#05060A` و `#0B0D14` استفاده کن."
      );
    }
    if (s.injectRtlRules) {
      rules.push(
        "- **معماری بومی RTL-First:** فقط از کلاس‌های منطقی (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) استفاده کن و نیم‌فاصله‌ها را حفظ کن."
      );
    }
    if (s.injectSpringPhysics) {
      rules.push(
        "- **فیزیک حرکت مرتبهٔ دوم:** تمام انیمیشن‌ها با فنر کالیبره‌شده (`stiffness: 260, damping: 24, mass: 0.9`) اجرا شوند."
      );
    }

    return `# پرامپت مهندسی شخصی‌سازی‌شده — آزمایشگاه موشن فارسی
## مرجع انتخاب‌شده: ${title}
- **پشتهٔ فناوری هدف:** ${stackLabel}
- **سطح کیفیت و سخت‌گیری:** ${strictLabel}
- **قالب خروجی:** ${toneLabel}

## قوانین الزامی تزریق‌شده
${rules.join("\n")}

## محتوای مرجع از مخزن (${tab === "vault4000" ? selectedVaultRow?.fullUrl : activeFilename(tab, selectedVaultRow, selectedSkill, selectedBrand)}):
\`\`\`
${(fileContent || "").slice(0, 2800)}
\`\`\`
`;
  }, [fileContent, s, selectedBrand, selectedSkill, selectedVaultRow, tab]);

  const currentFileName = activeFilename(tab, selectedVaultRow, selectedSkill, selectedBrand);

  const downloadCurrentFile = useCallback(() => {
    if (!fileContent) return false;
    saveText(fileContent, currentFileName);
    return true;
  }, [currentFileName, fileContent]);

  const downloadCustomizedKit = useCallback(async () => {
    return saveKit(`skill-kit-${currentFileName.replace(/\.\w+$/, "")}.zip`, [
      { name: currentFileName, content: fileContent },
      { name: "CUSTOMIZED-AI-PROMPT.md", content: customizedPrompt },
      {
        name: "settings.json",
        content: JSON.stringify(s, null, 2),
      },
    ]);
  }, [currentFileName, customizedPrompt, fileContent, s]);

  const readFont =
    PERSIAN_FONT_CATALOG.find((f) => f.id === s.fontId) ?? PERSIAN_FONT_CATALOG[0];

  const isMarkdownFile =
    tab !== "vault4000" ||
    ["md", "mdx", "txt", ""].includes(selectedVaultRow?.ext ?? "md");

  return (
    <StudioShell
      variant="codex"
      eyebrow={`CODEX VAULT · ${DESIGN_LAB_TOTAL_FILES} FILES IN 11 PILLARS`}
      title="استودیو مهارت، دانش و سیستم‌های برند"
      description={`دسترسی منظم و دسته‌بندی‌شده به ${faNum(DESIGN_LAB_TOTAL_FILES)} فایل تخصصی در ۱۱ ستون و ۴۶ زیرشاخه به‌همراه ${faNum(ALL_SKILLS_MANIFEST.length)} راهنمای منتخب و ${faNum(ALL_BRAND_DESIGNS_MANIFEST.length)} سیستم برند.`}
      icon={BookOpen}
      onReset={reset}
      stats={
        <>
          <Badge tone="accent">{faNum(DESIGN_LAB_TOTAL_FILES)} فایل</Badge>
          <Badge tone="neutral">۱۱ ستون · ۴۶ زیرشاخه</Badge>
        </>
      }
      actions={
        <div className="flex items-center gap-1.5">
          <CopyButton text={customizedPrompt} label="کپی پرامپت" compact />
          <DownloadButton
            label={`دانلود ${currentFileName}`}
            onDownload={downloadCurrentFile}
            compact
            variant="solid"
          />
        </div>
      }
      topDeck={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                {
                  id: "vault4000",
                  label: `مخزن ۴٬۰۲۳ فایلی (۱۱ ستون)`,
                  icon: FolderTree,
                },
                {
                  id: "skills179",
                  label: `راهنماهای منتخب (${faNum(ALL_SKILLS_MANIFEST.length)})`,
                  icon: Sparkles,
                },
                {
                  id: "brands84",
                  label: `سیستم‌های برند (${faNum(ALL_BRAND_DESIGNS_MANIFEST.length)})`,
                  icon: Palette,
                },
              ] as const
            ).map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playSnap();
                    setTab(item.id);
                    setScrollTop(0);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[11px] transition-all",
                    active
                      ? "border-violet-400/65 bg-violet-500/20 font-bold text-white shadow-sm"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 text-violet-300" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {tab === "vault4000" && (
            <button
              type="button"
              onClick={() => setShowPillarGrid((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10.5px] transition-all",
                showPillarGrid
                  ? "border-violet-400/60 bg-violet-500/20 font-bold text-violet-200"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{showPillarGrid ? "بستن نمای کارتی ۱۱ ستون" : "نمای کارتی ۱۱ ستون"}</span>
            </button>
          )}
        </div>
      }
      /* --------------------------------------------------- RIGHT RAIL: CLEAN VIRTUALIZED FILE BROWSER */
      list={
        <StudioList
          title={
            tab === "vault4000"
              ? `فهرست فایل‌ها (${faNum(filteredVaultRows.length)})`
              : tab === "skills179"
                ? `مهارت‌های منتخب (${faNum(filteredSkills179.length)})`
                : `سیستم‌های برند (${faNum(filteredBrands84.length)})`
          }
          subtitle={
            tab === "vault4000" && activePillarObj
              ? activePillarObj.titleFa
              : "جستجو و انتخاب سریع"
          }
          className="min-h-[440px] desk:min-h-0"
          listClassName="flex min-h-0 flex-col overflow-hidden p-1.5"
          toolbar={
            <Badge tone="accent">
              {tab === "vault4000"
                ? faCount(filteredVaultRows.length)
                : tab === "skills179"
                  ? faNum(filteredSkills179.length)
                  : faNum(filteredBrands84.length)}
            </Badge>
          }
        >
          <div className="shrink-0 space-y-2 pb-2">
            <SearchField
              value={q}
              onChange={(val) => {
                setQ(val);
                setScrollTop(0);
              }}
              placeholder="جستجو در نام فایل یا دسته..."
            />

            {tab === "vault4000" && (
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    { id: "all", label: "همه" },
                    { id: "md", label: "مستند" },
                    { id: "code", label: "کد" },
                    { id: "shader", label: "شیدر" },
                  ] as const
                ).map((ef) => (
                  <button
                    key={ef.id}
                    type="button"
                    onClick={() => {
                      setExtFilter(ef.id);
                      setScrollTop(0);
                    }}
                    className={cn(
                      "rounded-lg border py-1 text-[10px] transition-colors",
                      extFilter === ef.id
                        ? "border-violet-400/60 bg-violet-500/20 font-bold text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {ef.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Virtualized List for all 4,023 Vault Files */}
          {tab === "vault4000" && (
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto studio-scroll"
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            >
              <div
                style={{
                  height: filteredVaultRows.length * ROW_H,
                  position: "relative",
                }}
              >
                <div style={{ transform: `translateY(${startIdx * ROW_H}px)` }}>
                  {Array.from({ length: Math.max(0, endIdx - startIdx) }, (_, i) => {
                    const row = filteredVaultRows[startIdx + i];
                    if (!row) return null;
                    const active = row.fullUrl === selectedVaultRow?.fullUrl;
                    const isMd = row.ext === "md" || row.ext === "mdx";
                    return (
                      <div
                        key={row.fullUrl}
                        style={{ height: ROW_H }}
                        className={cn(
                          "group flex items-center justify-between gap-1.5 rounded-xl px-2.5 transition-colors",
                          active
                            ? "bg-violet-500/20 text-white ring-1 ring-inset ring-violet-400/40"
                            : "text-zinc-300 hover:bg-white/[0.04]"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playTick(0.95);
                            setPick({ ...pick, vaultUrl: row.fullUrl });
                            focusStudioPreview();
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2 text-start"
                        >
                          {isMd ? (
                            <FileText className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                          ) : (
                            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div
                              className="truncate font-mono text-[10.5px] font-medium"
                              dir="ltr"
                            >
                              {row.fileName}
                            </div>
                            <div className="truncate text-[9px] text-zinc-500">
                              {row.subcatTitleFa}
                            </div>
                          </div>
                        </button>
                        <span className="shrink-0 font-mono text-[8.5px] text-zinc-500">
                          {(row.bytes / 1024).toFixed(1)}k
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {filteredVaultRows.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-14 text-center text-[11px] text-zinc-500">
                  <Search className="h-5 w-5" />
                  فایلی با این فیلتر پیدا نشد
                </div>
              )}
            </div>
          )}

          {/* List for 179 Curated Skills */}
          {tab === "skills179" && (
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto studio-scroll">
              {filteredSkills179.map((item) => {
                const active = selectedSkill?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playTick(0.95);
                      setPick({ ...pick, skill: item.id });
                      focusStudioPreview();
                    }}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-xl border p-2.5 text-start transition-all",
                      active
                        ? "border-violet-400/60 bg-violet-500/18 text-white"
                        : "border-white/[0.05] bg-white/[0.015] text-zinc-300 hover:border-white/15"
                    )}
                  >
                    <span className="truncate text-[11.5px] font-bold">{item.title}</span>
                    <span className="line-clamp-1 text-[9.5px] text-zinc-400">{item.summary}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* List for 84 Brand Design Systems */}
          {tab === "brands84" && (
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto studio-scroll">
              {filteredBrands84.map((bItem) => {
                const active = selectedBrand?.id === bItem.id;
                return (
                  <button
                    key={bItem.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playTick(0.95);
                      setPick({ ...pick, brand: bItem.id });
                      focusStudioPreview();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl border p-2.5 text-start transition-all",
                      active
                        ? "border-violet-400/60 bg-violet-500/18 text-white"
                        : "border-white/[0.05] bg-white/[0.015] text-zinc-300 hover:border-white/15"
                    )}
                  >
                    <span className="truncate text-[11.5px] font-bold">{bItem.title}</span>
                    <div className="flex items-center gap-1">
                      {bItem.colors.slice(0, 4).map((hex, idx) => (
                        <span
                          key={idx}
                          className="h-3 w-3 rounded-full border border-white/20"
                          style={{ background: hex }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </StudioList>
      }
      /* --------------------------------------------------- CENTER STAGE: CLEAN CATEGORY STRIP + TABBED READER */
      stage={
        <div className="space-y-3">
          {/* Clean, Compact Category & Subcategory Navigator */}
          {tab === "vault4000" && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#090B12] p-3.5">
              {/* Row 1: Compact Horizontal Pillar Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="me-1 flex shrink-0 items-center gap-1 text-[11px] font-bold text-violet-300">
                  <Compass className="h-3.5 w-3.5" />
                  <span>دسته:</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSnap();
                    setSelectedPillarId("all");
                    setSelectedSubcatId("all");
                    setScrollTop(0);
                  }}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-1.5 text-[11px] transition-all",
                    selectedPillarId === "all"
                      ? "border-violet-400 bg-violet-500/25 font-bold text-white"
                      : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:text-white"
                  )}
                >
                  همهٔ ۱۱ ستون ({faNum(DESIGN_LAB_TOTAL_FILES)})
                </button>

                {DESIGN_LAB_PILLARS.map((p) => {
                  const active = selectedPillarId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playSnap();
                        setSelectedPillarId(p.id);
                        setSelectedSubcatId("all");
                        setScrollTop(0);
                      }}
                      className={cn(
                        "shrink-0 rounded-xl border px-3 py-1.5 text-[11px] transition-all",
                        active
                          ? "border-violet-400 bg-violet-500/25 font-bold text-white"
                          : "border-white/[0.07] bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:text-white"
                      )}
                    >
                      <span className="me-1 font-mono text-[9.5px]" style={{ color: p.accent }}>
                        {p.code}
                      </span>
                      <span>{p.titleFa}</span>
                      <span className="ms-1.5 font-mono text-[9.5px] opacity-65">
                        ({faNum(p.totalFiles)})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Expandable Full 11-Pillar Card Grid */}
              <AnimatePresence>
                {showPillarGrid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 sm:grid-cols-3 lg:grid-cols-4">
                      {DESIGN_LAB_PILLARS.map((p) => {
                        const active = selectedPillarId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              soundEngine.playSnap();
                              setSelectedPillarId(p.id);
                              setSelectedSubcatId("all");
                              setShowPillarGrid(false);
                              setScrollTop(0);
                            }}
                            className={cn(
                              "flex flex-col justify-between rounded-xl border p-2.5 text-start transition-all",
                              active
                                ? "border-violet-400 bg-violet-500/25 text-white"
                                : "border-white/[0.07] bg-white/[0.02] text-zinc-300 hover:border-white/20"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="font-mono text-[9.5px] font-bold"
                                style={{ color: p.accent }}
                              >
                                ستون {faNum(Number(p.code))}
                              </span>
                              <span className="font-mono text-[9px] text-zinc-400">
                                {faNum(p.totalFiles)} فایل
                              </span>
                            </div>
                            <div className="mt-1 truncate text-[11px] font-bold text-white">
                              {p.titleFa}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Row 2: Subcategory Pills when a Pillar is selected */}
              <AnimatePresence>
                {activePillarObj && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-2.5"
                  >
                    <span className="me-1 text-[10.5px] font-bold text-zinc-400">
                      زیرشاخه‌های «{activePillarObj.titleFa}»:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubcatId("all");
                        setScrollTop(0);
                      }}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[10px] transition-all",
                        selectedSubcatId === "all"
                          ? "border-violet-400 bg-violet-500/25 font-bold text-white"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white"
                      )}
                    >
                      همه ({faNum(activePillarObj.totalFiles)})
                    </button>
                    {activePillarObj.subcategories.map((sc) => {
                      const active = selectedSubcatId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playTick(1);
                            setSelectedSubcatId(sc.id);
                            setScrollTop(0);
                            const firstInSub = allVaultRows.find(
                              (r) =>
                                r.pillarId === activePillarObj.id && r.subcatId === sc.id
                            );
                            if (firstInSub) {
                              setPick({ ...pick, vaultUrl: firstInSub.fullUrl });
                            }
                          }}
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-[10px] transition-all",
                            active
                              ? "border-violet-400 bg-violet-500/25 font-bold text-white"
                              : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white"
                          )}
                        >
                          {sc.titleFa} ({faNum(sc.totalFiles)})
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Brand Palette Bar (when in Brands mode) */}
          {tab === "brands84" && selectedBrand && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0B0D14] p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {selectedBrand.colors.slice(0, 5).map((hex, idx) => (
                    <span
                      key={idx}
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ background: hex }}
                    />
                  ))}
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-white">{selectedBrand.title}</h2>
                  <p className="text-[10.5px] text-zinc-400">سیستم طراحی و پالت رسمی برند</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const hex = selectedBrand.colors[0]?.toLowerCase() ?? "";
                  const match =
                    ACCENTS.find((a) => a.hex.toLowerCase() === hex) ?? ACCENTS[0];
                  update({ accent: match.id, customAccent: hex || match.hex });
                  soundEngine.playSuccess();
                }}
                className="rounded-xl bg-[color:var(--accent)] px-3.5 py-2 text-[11px] font-bold text-[#05060A]"
              >
                اعمال رنگ برند روی پلتفرم
              </button>
            </div>
          )}

          {/* Clean Tabbed Document / Code / AI-Prompt Stage */}
          <Panel
            title={
              <div className="flex flex-wrap items-center gap-2">
                <Segmented
                  size="sm"
                  value={stageView}
                  onChange={setStageView}
                  options={[
                    { value: "reader", label: "۱. متن اسکیل و سورس" },
                    { value: "prompt", label: "۲. پرامپت هوش مصنوعی" },
                  ]}
                />
                <span className="hidden truncate font-mono text-[11px] text-zinc-400 sm:inline" dir="ltr">
                  {tab === "vault4000"
                    ? selectedVaultRow?.fileName
                    : tab === "skills179"
                      ? selectedSkill?.title
                      : selectedBrand?.title}
                </span>
              </div>
            }
            subtitle={
              tab === "vault4000" && selectedVaultRow
                ? `ستون ${faNum(Number(selectedVaultRow.pillarCode))} (${selectedVaultRow.pillarTitleFa}) ⟵ ${selectedVaultRow.subcatTitleFa} · ${faNum(selectedVaultRow.bytes)} بایت`
                : "مطالعهٔ مستقیم یا تولید پرامپت مهندسی"
            }
            actions={
              <div className="flex items-center gap-1.5">
                {tab === "vault4000" && (
                  <div className="flex items-center gap-1 me-1">
                    <button
                      type="button"
                      onClick={() => stepVaultFile(-1)}
                      aria-label="فایل قبلی"
                      title="فایل قبلی"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepVaultFile(1)}
                      aria-label="فایل بعدی"
                      title="فایل بعدی"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <CopyButton
                  text={stageView === "prompt" ? customizedPrompt : fileContent}
                  label={stageView === "prompt" ? "کپی پرامپت" : "کپی متن"}
                  compact
                />
                <DownloadButton
                  compact
                  label="دانلود فایل"
                  onDownload={downloadCurrentFile}
                />
              </div>
            }
          >
            {stageView === "prompt" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3.5 py-2.5 text-[11.5px] text-violet-200">
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4 text-violet-300" />
                    <span>
                      این پرامپت از روی فایل فعلی و تنظیمات ستون چپ برای Claude / Cursor آماده شده است.
                    </span>
                  </span>
                  <CopyButton text={customizedPrompt} label="کپی پرامپت کامل" compact />
                </div>
                <CodeBlock code={customizedPrompt} language="md" maxLines={38} />
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            ) : isMarkdownFile ? (
              <div
                className={cn(
                  "max-h-[62vh] overflow-y-auto rounded-2xl border p-5 transition-colors studio-scroll",
                  s.theme === "paper"
                    ? "border-[#D8CEBE] bg-[#F5F0E6] text-[#1A1612]"
                    : s.theme === "lapis"
                      ? "border-sky-400/20 bg-[#081020] text-zinc-100"
                      : "border-white/[0.06] bg-[#07090F] text-zinc-100"
                )}
                style={{
                  fontFamily: readFont.family,
                  fontSize: `${s.size}px`,
                  lineHeight: s.lineHeight,
                }}
              >
                <Markdown source={fileContent || "# فایل آماده است"} />
              </div>
            ) : (
              <CodeBlock
                code={fileContent}
                filename={selectedVaultRow?.fileName}
                language={selectedVaultRow?.ext || "tsx"}
                maxLines={420}
                fontSize={s.codeFontSize}
              />
            )}
          </Panel>
        </div>
      }
      /* --------------------------------------------------- LEFT RAIL: ORGANIZED 3-TAB CUSTOMIZATION CONSOLE */
      settings={
        <div className="space-y-3">
          {/* Direct Download Card */}
          <div className="rounded-2xl border border-violet-400/40 bg-gradient-to-b from-violet-500/15 to-[#0B0D14] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-white">
                <Download className="h-4 w-4 text-violet-300" />
                <span>دانلود فایل و کیت</span>
              </span>
              <Badge tone="accent">{currentFileName}</Badge>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <DownloadButton
                label={`دانلود مستقیم ${currentFileName}`}
                onDownload={downloadCurrentFile}
                className="w-full justify-center py-2 text-[11.5px]"
              />
              <DownloadButton
                label="دانلود کیت کامل (ZIP)"
                onDownload={downloadCustomizedKit}
                variant="ghost"
                className="w-full justify-center py-1.5 text-[11px]"
              />
            </div>
          </div>

          {/* Clean 3-Tab Customization Switcher */}
          <Panel
            title={
              <span className="flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-violet-300" />
                <span>میز شخصی‌سازی اسکیل</span>
              </span>
            }
            subtitle="تنظیمات در ۳ بخش منظم دسته‌بندی شده‌اند"
          >
            <div className="mb-3">
              <Segmented
                className="w-full"
                size="sm"
                value={settingsTab}
                onChange={setSettingsTab}
                options={[
                  { value: "target", label: "فریم‌ورک" },
                  { value: "rules", label: "قوانین" },
                  { value: "reader", label: "مطالعه" },
                ]}
              />
            </div>

            {/* Tab 1: Target Stack & Output Format */}
            {settingsTab === "target" && (
              <div className="space-y-3">
                <div>
                  <span className="mb-1 block text-[10.5px] text-zinc-400">
                    فریم‌ورک و پشتهٔ هدف:
                  </span>
                  <select
                    value={s.targetStack}
                    onChange={(e) =>
                      setSettings({
                        targetStack: e.target.value as SkillStudioSettings["targetStack"],
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-[#07090F] px-3 py-2 text-[11px] text-white outline-none focus:border-violet-400"
                  >
                    <option value="react-tailwind">React 19 + Tailwind v4 + Motion</option>
                    <option value="nextjs">Next.js 15 App Router + TypeScript</option>
                    <option value="vue">Vue 3 + Nuxt + Tailwind</option>
                    <option value="vanilla">HTML5 + Modern CSS + Vanilla TS</option>
                    <option value="ae-script">After Effects ExtendScript / Expression</option>
                  </select>
                </div>

                <div>
                  <span className="mb-1 block text-[10.5px] text-zinc-400">
                    سطح سخت‌گیری مهندسی:
                  </span>
                  <Segmented
                    className="w-full"
                    size="sm"
                    value={s.strictness}
                    onChange={(strictness) => setSettings({ strictness })}
                    options={[
                      { value: "mvp", label: "MVP" },
                      { value: "production", label: "پروداکشن" },
                      { value: "aaa-120hz", label: "AAA 120Hz" },
                    ]}
                  />
                </div>

                <div>
                  <span className="mb-1 block text-[10.5px] text-zinc-400">
                    قالب خروجی پرامپت:
                  </span>
                  <Segmented
                    className="w-full"
                    size="sm"
                    value={s.outputTone}
                    onChange={(outputTone) => setSettings({ outputTone })}
                    options={[
                      { value: "code-only", label: "فقط کد" },
                      { value: "persian-docs", label: "کد + مستندات" },
                      { value: "step-by-step", label: "گام‌به‌گام" },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Injected Architectural Rules */}
            {settingsTab === "rules" && (
              <div className="space-y-2.5">
                <Toggle
                  label="قانون رنگی ۶۰-۳۰-۱۰ (OKLCH)"
                  hint="توازن بصری ۶۰٪ بوم، ۳۰٪ کارت، ۱۰٪ رنگ کانونی"
                  checked={s.inject603010}
                  onChange={(inject603010) => setSettings({ inject603010 })}
                />
                <Toggle
                  label="محافظت پنل OLED (#05060A)"
                  hint="جلوگیری از کشیدگی سیاه در اسکرول ۱۲۰ هرتز"
                  checked={s.injectOledSafe}
                  onChange={(injectOledSafe) => setSettings({ injectOledSafe })}
                />
                <Toggle
                  label="معماری بومی RTL-First"
                  hint="کلاس‌های منطقی و ممنوعیت letter-spacing مثبت"
                  checked={s.injectRtlRules}
                  onChange={(injectRtlRules) => setSettings({ injectRtlRules })}
                />
                <Toggle
                  label="فیزیک فنر دیفرانسیل ۱۲۰Hz"
                  hint="انیمیشن‌های طبیعی بدون پرش فریم"
                  checked={s.injectSpringPhysics}
                  onChange={(injectSpringPhysics) => setSettings({ injectSpringPhysics })}
                />
              </div>
            )}

            {/* Tab 3: Reading & Code Typography */}
            {settingsTab === "reader" && (
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-[10.5px] text-zinc-400">تم بوم مطالعه</div>
                  <Segmented
                    className="w-full"
                    size="sm"
                    value={s.theme}
                    onChange={(theme) => setSettings({ theme })}
                    options={[
                      { value: "dark", label: "ابسیدین" },
                      { value: "lapis", label: "لاجوردی" },
                      { value: "paper", label: "کاغذ کاهی" },
                    ]}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] text-zinc-400">
                    فونت مطالعهٔ متون فارسی:
                    <select
                      value={s.fontId}
                      onChange={(e) => setSettings({ fontId: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#07090F] px-3 py-1.5 text-[11px] text-white outline-none"
                    >
                      {PERSIAN_FONT_CATALOG.slice(0, 12).map((f) => (
                        <option key={f.id} value={f.id} className="bg-[#0B0D14]">
                          {f.nameFa}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <Slider
                  label="اندازهٔ متن سند"
                  value={s.size}
                  min={11}
                  max={19}
                  step={0.5}
                  unit="px"
                  onChange={(size) => setSettings({ size })}
                />
                <Slider
                  label="فاصلهٔ خطوط سند"
                  value={s.lineHeight}
                  min={1.4}
                  max={2.4}
                  step={0.05}
                  onChange={(lineHeight) => setSettings({ lineHeight })}
                />
                <Slider
                  label="اندازهٔ قلم کد"
                  value={s.codeFontSize}
                  min={10}
                  max={16}
                  step={0.5}
                  unit="px"
                  onChange={(codeFontSize) => setSettings({ codeFontSize })}
                />
              </div>
            )}
          </Panel>
        </div>
      }
    />
  );
};

function activeFilename(
  tab: Tab,
  vaultRow: VaultFileRow | undefined,
  skill: SkillManifestItem | null,
  brand: BrandDesignManifestItem | null
) {
  if (tab === "vault4000") return vaultRow?.fileName ?? "skill.md";
  if (tab === "skills179") return `${skill?.slug ?? "skill"}.md`;
  return `${brand?.id ?? "brand"}-DESIGN.md`;
}

export default SkillsStudio;
