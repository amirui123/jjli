import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Palette, Search, Sparkles } from "lucide-react";
import {
  ALL_BRAND_DESIGNS_MANIFEST,
  ALL_SKILLS_MANIFEST,
  type BrandDesignManifestItem,
  type SkillManifestItem,
} from "../data/skillsManifest";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { ACCENTS, loadAsset, useAppSettings, useDebounced, usePersisted } from "../lib/store";
import { saveKit, saveText } from "../lib/download";
import {
  Badge,
  Slider,
  Panel,
  SearchField,
  Segmented,
  Spinner,
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { Markdown } from "../ui/Markdown";
import { faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";

type Tab = "skills" | "brands";

interface ReadSettings {
  fontId: string;
  size: number;
  lineHeight: number;
  theme: "dark" | "paper";
  favoritesOnly: boolean;
}

const DEFAULT_READ: ReadSettings = {
  fontId: "vazirmatn",
  size: 12.5,
  lineHeight: 1.9,
  theme: "dark",
  favoritesOnly: false,
};

const CATEGORY_LABEL: Record<string, string> = {
  "01-motion-and-awwwards": "موشن و Awwwards",
  "02-3d-webgl-and-shaders": "سه‌بعدی و شیدر",
  "03-art-direction-and-taste": "هنر و کارگردانی",
  "04-ui-systems-and-shadcn": "سیستم رابط",
  "05-brand-design-md-vault": "برندها",
  "06-persian-writing-and-rtl": "نوشتار فارسی",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL).filter((c) => c !== "05-brand-design-md-vault");

function skillFile(id: string) {
  return `/vault/skills/${id.replace(/\//g, "__")}.md`;
}

function buildPrompt(skill: SkillManifestItem, doc: string) {
  return `# نقش: تو یک مهندس ارشد رابط کاربری فارسی و متخصص موشن هستی.

## مهارت فعال
${skill.title}  (${skill.slug})

## خلاصه
${skill.summary}

## استاندارد اجرایی (از مخزن RTL Motion Lab)
${doc.slice(0, 2400)}

## قواعد سخت‌گیرانه
- RTL-first: تنها از کلاس‌های منطقی (ms/me/ps/pe/start/end) استفاده کن.
- برای متون فارسی هرگز letter-spacing مثبت نگذار.
- انیمیشن‌ها باید با useMotionValue/useSpring خارج از چرخه رندر باشند و ۶۰ فریم بمانند.
- خروجی باید TypeScript + Tailwind v4 + framer-motion و سازگار با React 18 باشد.

## درخواست
[اینجا نیاز خودت را بنویس]
`;
}

export const SkillsStudio: React.FC = () => {
  const [tab, setTab] = useState<Tab>("skills");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [pick, setPick] = usePersisted<{ skill: string; brand: string }>("studio-skills-pick", {
    skill: ALL_SKILLS_MANIFEST[0]?.id ?? "",
    brand: ALL_BRAND_DESIGNS_MANIFEST[0]?.id ?? "",
  });
  const selectedSkill =
    ALL_SKILLS_MANIFEST.find((x) => x.id === pick.skill) ?? ALL_SKILLS_MANIFEST[0] ?? null;
  const selectedBrand =
    ALL_BRAND_DESIGNS_MANIFEST.find((x) => x.id === pick.brand) ?? ALL_BRAND_DESIGNS_MANIFEST[0] ?? null;
  const setSelectedSkill = (skill: SkillManifestItem) => setPick({ skill: skill.id });
  const setSelectedBrand = (brand: BrandDesignManifestItem) => setPick({ brand: brand.id });
  const [doc, setDoc] = useState<string>("");
  const [docLoading, setDocLoading] = useState(false);
  const [limit, setLimit] = useState(80);
  const { update } = useAppSettings();
  const [read, setRead] = usePersisted<ReadSettings>("studio-skills", DEFAULT_READ);
  const [favorites, setFavorites] = usePersisted<{ ids: string[] }>("skill-favs", { ids: [] });

  const debounced = useDebounced(q, 150);

  const skills = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    return ALL_SKILLS_MANIFEST.filter((s) => {
      const inCat = cat === "all" || s.categoryFolder === cat;
      const inTerm =
        !term || s.title.toLowerCase().includes(term) || s.slug.includes(term) || s.summary.toLowerCase().includes(term);
      const inFav = !read.favoritesOnly || favorites.ids.includes(s.id);
      return inCat && inTerm && inFav;
    });
  }, [debounced, cat, read.favoritesOnly, favorites.ids]);

  const brands = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    if (!term) return ALL_BRAND_DESIGNS_MANIFEST;
    return ALL_BRAND_DESIGNS_MANIFEST.filter((b) => b.id.includes(term) || b.title.toLowerCase().includes(term));
  }, [debounced]);

  useEffect(() => {
    if (tab !== "skills" || !selectedSkill) return;
    let alive = true;
    setDocLoading(true);
    setDoc("");
    loadAsset<string>(skillFile(selectedSkill.id))
      .then((text) => alive && setDoc(text))
      .catch(() => alive && setDoc(selectedSkill.excerpt))
      .finally(() => alive && setDocLoading(false));
    return () => {
      alive = false;
    };
  }, [tab, selectedSkill]);

  useEffect(() => {
    if (tab !== "brands" || !selectedBrand) return;
    let alive = true;
    setDocLoading(true);
    setDoc("");
    loadAsset<string>(`/vault/brands/${selectedBrand.id}.md`)
      .then((text) => alive && setDoc(text))
      .catch(() => alive && setDoc(selectedBrand.excerpt))
      .finally(() => alive && setDocLoading(false));
    return () => {
      alive = false;
    };
  }, [tab, selectedBrand]);

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({
      ids: prev.ids.includes(id) ? prev.ids.filter((x) => x !== id) : [...prev.ids, id],
    }));
    soundEngine.playTick(1.2);
  };

  const applyBrand = (brand: BrandDesignManifestItem) => {
    const hex = brand.colors[0]?.toLowerCase() ?? "";
    const match =
      ACCENTS.find((a) => a.hex.toLowerCase() === hex) ??
      ACCENTS.find((a) => brand.colors.some((c) => c.toLowerCase() === a.hex.toLowerCase())) ??
      ACCENTS[0];
    update({ accent: match.id, customAccent: hex || match.hex });
    soundEngine.playSuccess();
  };

  const currentDoc = doc || (tab === "skills" ? selectedSkill?.excerpt : selectedBrand?.excerpt) || "";
  const docName =
    tab === "skills"
      ? `${selectedSkill?.slug ?? "skill"}.md`
      : `${selectedBrand?.id ?? "brand"}-DESIGN.md`;

  const downloadDoc = () => {
    if (!currentDoc) return false;
    saveText(currentDoc, docName, "text/markdown;charset=utf-8");
    return true;
  };

  const downloadSkillKit = async () => {
    if (!selectedSkill || !currentDoc) return false;
    return saveKit(`rtl-motion-skill-${selectedSkill.slug}`, [
      { name: `${selectedSkill.slug}.md`, content: currentDoc },
      { name: "prompt.md", content: buildPrompt(selectedSkill, currentDoc) },
      {
        name: "meta.json",
        content: JSON.stringify(
          {
            id: selectedSkill.id,
            title: selectedSkill.title,
            category: selectedSkill.categoryFolder,
            path: selectedSkill.path,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ]);
  };

  const downloadBrandKit = async () => {
    if (!selectedBrand || !currentDoc) return false;
    return saveKit(`rtl-motion-brand-${selectedBrand.id}`, [
      { name: `${selectedBrand.id}-DESIGN.md`, content: currentDoc },
      {
        name: "tokens.json",
        content: JSON.stringify({ brand: selectedBrand.id, colors: selectedBrand.colors, title: selectedBrand.title }, null, 2),
      },
      {
        name: "tokens.css",
        content: `:root {\n${selectedBrand.colors
          .map((c, i) => `  --brand-${i + 1}: ${c};`)
          .join("\n")}\n}\n`,
      },
    ]);
  };

  /** Fetches every skill document and bundles them, plus an index. */
  const downloadAllSkills = async () => {
    const docs = await Promise.all(
      ALL_SKILLS_MANIFEST.map(async (skill) => {
        const text = await loadAsset<string>(skillFile(skill.id)).catch(() => skill.excerpt);
        return { skill, text };
      })
    );
    const ok = docs.filter((d) => d.text && d.text.length > 0);
    if (ok.length === 0) return false;
    return saveKit("rtl-motion-skills", [
      ...ok.map(({ skill, text }) => ({ name: `${skill.id.replace(/\//g, "__")}.md`, content: text })),
      {
        name: "index.json",
        content: JSON.stringify(
          ok.map(({ skill }) => ({
            id: skill.id,
            title: skill.title,
            category: skill.categoryFolder,
            path: skill.path,
          })),
          null,
          2
        ),
      },
      {
        name: "README.md",
        content: `# خزانه مهارت‌های RTL Motion Lab

${ok.length} سند \`SKILL.md\` کامل، مستقیماً از مخزن.

هر سند را می‌توانید به‌عنوان دستورالعمل به یک مدل هوش مصنوعی بدهید.
`,
      },
    ]);
  };

  const readFont = PERSIAN_FONT_CATALOG.find((f) => f.id === read.fontId) ?? PERSIAN_FONT_CATALOG[0];

  /* ----------------------------------------------------------------- list */

  const list = (
    <StudioList
      title={tab === "skills" ? "مهارت‌ها" : "برندها"}
      subtitle={`${faNum(tab === "skills" ? skills.length : brands.length)} نتیجه`}
      className="min-h-[360px] desk:min-h-0"
      footer="هر سند با متن کامل و قابل دانلود"
      toolbar={<Badge tone="accent">{faNum(tab === "skills" ? ALL_SKILLS_MANIFEST.length : ALL_BRAND_DESIGNS_MANIFEST.length)}</Badge>}
    >
      <div className="sticky top-0 z-10 -m-1.5 mb-1 space-y-2 bg-[#0D0D10]/95 p-1.5 backdrop-blur">
        <Segmented
          className="w-full"
          size="sm"
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: "skills", label: `اسکیل` },
            { value: "brands", label: `برند` },
          ]}
        />
        <SearchField value={q} onChange={setQ} placeholder="جستجو…" />
        {tab === "skills" && (
          <div className="flex flex-wrap gap-1">
            {["all", ...CATEGORY_ORDER].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[9px] transition-colors",
                  cat === c
                    ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                    : "border-white/[0.07] text-zinc-500 hover:text-zinc-300"
                )}
              >
                {c === "all" ? "همه" : CATEGORY_LABEL[c] ?? c}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "skills" &&
        skills.slice(0, limit).map((s) => (
          <div
            key={s.id}
            className={cn(
              "group flex items-start gap-1.5 rounded-lg px-1.5 py-1.5 transition-colors",
              selectedSkill?.id === s.id ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"
            )}
          >
            <button onClick={() => toggleFav(s.id)} className="mt-1 shrink-0 text-[9px]" aria-label="نشان کردن">
              <span className={favorites.ids.includes(s.id) ? "text-[color:var(--accent)]" : "text-zinc-700"}>★</span>
            </button>
            <button
              onClick={() => {
                setSelectedSkill(s);
                soundEngine.playTick(1);
              }}
              className="min-w-0 flex-1 text-start"
            >
              <span className="block truncate text-[11px] text-zinc-200">{s.title}</span>
              <span className="mt-0.5 block truncate font-mono text-[8.5px] text-zinc-600" dir="ltr">
                {s.slug}
              </span>
            </button>
            <DownloadButton
              compact
              variant="ghost"
              label="دانلود"
              filename={`${s.slug}.md`}
              onDownload={async () => {
                const text = await loadAsset<string>(skillFile(s.id)).catch(() => s.excerpt);
                saveText(text, `${s.slug}.md`, "text/markdown;charset=utf-8");
                return true;
              }}
            />
          </div>
        ))}

      {tab === "skills" && skills.length > limit && (
        <button
          onClick={() => setLimit((l) => l + 80)}
          className="mt-1 w-full rounded-lg border border-white/[0.07] py-1.5 text-[10px] text-zinc-500 hover:text-white"
        >
          نمایش بیشتر ({faNum(skills.length - limit)})
        </button>
      )}

      {tab === "brands" &&
        brands.map((b) => (
          <div
            key={b.id}
            className={cn(
              "group flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition-colors",
              selectedBrand?.id === b.id ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"
            )}
          >
            <span className="flex shrink-0 gap-0.5">
              {b.colors.slice(0, 3).map((c, i) => (
                <span key={i} className="h-3 w-1 rounded-sm" style={{ background: c }} />
              ))}
            </span>
            <button onClick={() => setSelectedBrand(b)} className="min-w-0 flex-1 truncate text-start font-mono text-[10px] text-zinc-300" dir="ltr">
              {b.id}
            </button>
            <DownloadButton
              compact
              variant="ghost"
              label="دانلود"
              filename={`${b.id}-DESIGN.md`}
              onDownload={async () => {
                const text = await loadAsset<string>(`/vault/brands/${b.id}.md`).catch(() => b.excerpt);
                saveText(text, `${b.id}-DESIGN.md`, "text/markdown;charset=utf-8");
                return true;
              }}
            />
          </div>
        ))}

      {(tab === "skills" ? skills : brands).length === 0 && (
        <div className="flex flex-col items-center py-10 text-center text-[11px] text-zinc-600">
          <Search className="mb-2 h-5 w-5" />
          نتیجه‌ای پیدا نشد
        </div>
      )}
    </StudioList>
  );

  /* ---------------------------------------------------------------- stage */

  const stage = (
    <div className="space-y-4">
      <Panel
        padded={false}
        title={
          <span className="flex items-center gap-2">
            {tab === "skills" ? <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent)]" /> : <Palette className="h-3.5 w-3.5 text-[color:var(--accent)]" />}
            {tab === "skills" ? selectedSkill?.title : selectedBrand?.title}
          </span>
        }
        subtitle={tab === "skills" ? selectedSkill?.path : selectedBrand?.path}
        actions={
          <>
            {tab === "skills" && selectedSkill && (
              <button
                onClick={() => toggleFav(selectedSkill.id)}
                className={cn(
                  "rounded-lg border px-2 py-1 text-[10px]",
                  favorites.ids.includes(selectedSkill.id)
                    ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                    : "border-white/10 text-zinc-500 hover:text-white"
                )}
              >
                {favorites.ids.includes(selectedSkill.id) ? "★" : "☆"}
              </button>
            )}
            <DownloadButton compact label=".md" filename={docName} onDownload={downloadDoc} />
            <DownloadButton
              compact
              label="کیت"
              filename={tab === "skills" ? `rtl-motion-skill-${selectedSkill?.slug}.zip` : `rtl-motion-brand-${selectedBrand?.id}.zip`}
              onDownload={tab === "skills" ? downloadSkillKit : downloadBrandKit}
              variant="solid"
            />
          </>
        }
      >
        {tab === "brands" && selectedBrand && (
          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] p-3">
            {selectedBrand.colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  update({ customAccent: c });
                  soundEngine.playSnap();
                }}
                className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1"
                title="اعمال این رنگ روی پلتفرم"
              >
                <span className="h-3.5 w-3.5 rounded-full" style={{ background: c }} />
                <span className="font-mono text-[10px] text-zinc-400 group-hover:text-zinc-100" dir="ltr">
                  {c}
                </span>
              </button>
            ))}
            <button
              onClick={() => applyBrand(selectedBrand)}
              className="ms-auto flex items-center gap-1 rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-2.5 py-1 text-[10px] text-[color:var(--accent)]"
            >
              <Check className="h-3 w-3" />
              اعمال پالت
            </button>
          </div>
        )}

        <div
          className={cn("studio-scroll max-h-[52vh] min-h-[280px] overflow-y-auto p-4 desk:max-h-[46vh]", read.theme === "paper" && "paper rounded-b-2xl")}
        >
          {docLoading ? (
            <Spinner className="py-16" />
          ) : (
            <div
              style={{
                fontFamily: readFont.family,
                fontSize: `${read.size}px`,
                lineHeight: read.lineHeight,
              }}
              className={read.theme === "paper" ? "text-[#191410]" : undefined}
            >
              <Markdown source={currentDoc} />
            </div>
          )}
        </div>
      </Panel>

      {tab === "skills" && selectedSkill && (
        <Panel
          title="پرامپت آماده برای مدل هوش مصنوعی"
          subtitle="شامل نقش، استاندارد اجرایی و قواعد سخت‌گیرانه RTL"
          actions={
            <DownloadButton
              compact
              label=".md"
              filename={`${selectedSkill.slug}.prompt.md`}
              onDownload={() => saveText(buildPrompt(selectedSkill, currentDoc), `${selectedSkill.slug}.prompt.md`)}
            />
          }
        >
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-black/40 p-2.5 text-[10.5px] leading-relaxed text-zinc-400" dir="ltr">
            {buildPrompt(selectedSkill, currentDoc)}
          </pre>
        </Panel>
      )}
    </div>
  );

  /* ------------------------------------------------------------- settings */

  const settings = (
    <div className="space-y-4">
      <Panel title="خواندن سند">
        <div className="space-y-3">
          <div>
            <span className="mb-1 block text-[10.5px] text-zinc-400">فونت متن</span>
            <select
              value={read.fontId}
              onChange={(e) => setRead({ fontId: e.target.value })}
              className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 text-[11px] text-zinc-200 outline-none"
            >
              {PERSIAN_FONT_CATALOG.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#111]">
                  {f.nameFa}
                </option>
              ))}
            </select>
          </div>
          <Slider label="اندازه متن" value={read.size} min={11} max={20} step={0.5} unit="px" format={(v) => v.toFixed(1)} onChange={(v) => setRead({ size: v })} />
          <Slider label="ارتفاع خط" value={read.lineHeight} min={1.4} max={2.6} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => setRead({ lineHeight: v })} />
          <Segmented
            className="w-full"
            size="sm"
            value={read.theme}
            onChange={(v) => setRead({ theme: v })}
            options={[
              { value: "dark", label: "تیره" },
              { value: "paper", label: "کاغذی" },
            ]}
          />
          <Toggle label="فقط نشان‌شده‌ها" checked={read.favoritesOnly} onChange={(v) => setRead({ favoritesOnly: v })} />
        </div>
      </Panel>

      <Panel title="خزانه">
        <div className="grid grid-cols-2 gap-2">
          {[
            { k: "اسکیل", v: ALL_SKILLS_MANIFEST.length },
            { k: "برند", v: ALL_BRAND_DESIGNS_MANIFEST.length },
            { k: "دسته", v: CATEGORY_ORDER.length + 1 },
            { k: "نشان‌شده", v: favorites.ids.length },
          ].map((x) => (
            <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
              <div className="text-[9.5px] text-zinc-500">{x.k}</div>
              <div className="font-mono text-[14px] text-zinc-100">{faNum(x.v)}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel tone="inset" title="کل خزانه" subtitle={`${faNum(ALL_SKILLS_MANIFEST.length)} سند کامل`}>
        <DownloadButton
          label="دانلود همه اسناد"
          filename="rtl-motion-skills.zip"
          onDownload={downloadAllSkills}
          variant="solid"
          className="w-full justify-center"
        />
      </Panel>

      <Panel tone="inset" title="دانلود">
        <p className="text-[11px] leading-relaxed text-zinc-400">
          سند کامل به‌صورت <code className="font-mono text-[10px] text-teal-300">.md</code> یا کیت
          شامل پرامپت و متادیتا ذخیره می‌شود.
        </p>
        <div className="mt-2 flex gap-1.5">
          <DownloadButton label="سند" filename={docName} onDownload={downloadDoc} className="flex-1 justify-center" />
          <DownloadButton
            label="کیت"
            filename={tab === "skills" ? `rtl-motion-skill-${selectedSkill?.slug}.zip` : `rtl-motion-brand-${selectedBrand?.id}.zip`}
            onDownload={tab === "skills" ? downloadSkillKit : downloadBrandKit}
            className="flex-1 justify-center"
          />
        </div>
      </Panel>
    </div>
  );

  return (
    <StudioShell
      eyebrow="SKILLS STUDIO"
      title="استودیو مهارت و برند"
      description={`${faNum(ALL_SKILLS_MANIFEST.length)} سند مهارتی و ${faNum(ALL_BRAND_DESIGNS_MANIFEST.length)} سیستم طراحی برند — با متن کامل، خوانای قابل تنظیم و خروجی قابل دانلود.`}
      icon={BookOpen}
      stats={
        <>
          <Badge tone="accent">{faNum(ALL_SKILLS_MANIFEST.length)} اسکیل</Badge>
          <Badge>{faNum(ALL_BRAND_DESIGNS_MANIFEST.length)} برند</Badge>
        </>
      }
      actions={
        <DownloadButton
          label="دانلود کیت"
          filename={tab === "skills" ? `rtl-motion-skill-${selectedSkill?.slug}.zip` : `rtl-motion-brand-${selectedBrand?.id}.zip`}
          onDownload={tab === "skills" ? downloadSkillKit : downloadBrandKit}
        />
      }
      listWidth="240px"
      settingsWidth="288px"
      list={list}
      stage={stage}
      settings={settings}
    />
  );
};

export default SkillsStudio;
