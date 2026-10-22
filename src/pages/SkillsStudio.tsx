import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  FolderTree,
  Palette,
  Search,
  Sparkles,
} from "lucide-react";
import {
  ALL_BRAND_DESIGNS_MANIFEST,
  ALL_SKILLS_MANIFEST,
  type BrandDesignManifestItem,
  type SkillManifestItem,
} from "../data/skillsManifest";
import { ACCENTS, loadAsset, useAppSettings, useDebounced, usePersisted } from "../lib/store";
import {
  CodeBlock,
  CopyButton,
  EmptyState,
  Panel,
  SearchField,
  Segmented,
  Spinner,
  cn,
} from "../ui/kit";
import { Markdown } from "../ui/Markdown";
import { soundEngine } from "../engines/soundEngine";

type Tab = "skills" | "brands";

const CATEGORY_LABEL: Record<string, string> = {
  "01-motion-and-awwwards": "موشن و Awwwards",
  "02-3d-webgl-and-shaders": "سه‌بعدی و شیدر",
  "03-art-direction-and-taste": "هنر و کارگردانی",
  "04-ui-systems-and-shadcn": "سیستم رابط و shadcn",
  "05-brand-design-md-vault": "سیستم برندها",
  "06-persian-writing-and-rtl": "نوشتار فارسی و RTL",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL);

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
  const [selectedSkill, setSelectedSkill] = useState<SkillManifestItem | null>(
    ALL_SKILLS_MANIFEST[0] ?? null
  );
  const [selectedBrand, setSelectedBrand] = useState<BrandDesignManifestItem | null>(
    ALL_BRAND_DESIGNS_MANIFEST[0] ?? null
  );
  const [doc, setDoc] = useState<string>("");
  const [docLoading, setDocLoading] = useState(false);
  const [limit, setLimit] = useState(60);
  const { update } = useAppSettings();
  const [favorites, setFavorites] = usePersisted<{ ids: string[] }>("skill-favs", { ids: [] });

  const debounced = useDebounced(q, 150);

  const skills = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    return ALL_SKILLS_MANIFEST.filter((s) => {
      const inCat = cat === "all" || s.categoryFolder === cat;
      const inTerm =
        !term ||
        s.title.toLowerCase().includes(term) ||
        s.slug.includes(term) ||
        s.summary.toLowerCase().includes(term);
      return inCat && inTerm;
    });
  }, [debounced, cat]);

  const brands = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    if (!term) return ALL_BRAND_DESIGNS_MANIFEST;
    return ALL_BRAND_DESIGNS_MANIFEST.filter(
      (b) => b.id.includes(term) || b.title.toLowerCase().includes(term)
    );
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

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">SKILLS STUDIO</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            استودیو مهارت و برند
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            {ALL_SKILLS_MANIFEST.length} اسکیل‌فایل و {ALL_BRAND_DESIGNS_MANIFEST.length} سیستم
            طراحی برند، همه با متن واقعی و قابل کپی به‌عنوان پرامپت. پالت هر برند را
            می‌توانید مستقیماً روی همین پلتفرم اعمال کنید.
          </p>
        </div>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: "skills", label: `${ALL_SKILLS_MANIFEST.length} اسکیل` },
            { value: "brands", label: `${ALL_BRAND_DESIGNS_MANIFEST.length} برند` },
          ]}
        />
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel
            title={tab === "skills" ? "مهارت‌ها" : "برندها"}
            subtitle={`${tab === "skills" ? skills.length : brands.length} نتیجه`}
            padded={false}
          >
            <div className="space-y-2 border-b border-white/[0.06] p-2">
              <SearchField value={q} onChange={setQ} placeholder="جستجو…" />
              {tab === "skills" && (
                <div className="flex flex-wrap gap-1">
                  {["all", ...CATEGORY_ORDER.filter((c) => c !== "05-brand-design-md-vault")].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 text-[9.5px] transition-colors",
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

            <div className="max-h-[540px] overflow-y-auto p-1.5">
              {tab === "skills" &&
                skills.slice(0, limit).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSkill(s);
                      soundEngine.playTick(1);
                    }}
                    className={cn(
                      "group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-start transition-colors",
                      selectedSkill?.id === s.id ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"
                    )}
                  >
                    <span className="mt-1 shrink-0 text-[9px] text-zinc-700">
                      {favorites.ids.includes(s.id) ? "★" : "○"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11.5px] text-zinc-200">{s.title}</span>
                      <span className="mt-0.5 block truncate font-mono text-[9px] text-zinc-600" dir="ltr">
                        {s.slug}
                      </span>
                    </span>
                  </button>
                ))}

              {tab === "skills" && skills.length > limit && (
                <button
                  onClick={() => setLimit((l) => l + 60)}
                  className="mt-1 w-full rounded-lg border border-white/[0.07] py-1.5 text-[10.5px] text-zinc-500 hover:text-white"
                >
                  نمایش بیشتر ({skills.length - limit} باقی‌مانده)
                </button>
              )}

              {tab === "brands" &&
                brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBrand(b);
                      soundEngine.playTick(1);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition-colors",
                      selectedBrand?.id === b.id ? "bg-white/[0.07]" : "hover:bg-white/[0.035]"
                    )}
                  >
                    <span className="flex shrink-0 gap-0.5">
                      {b.colors.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="h-3 w-1.5 rounded-sm"
                          style={{ background: c }}
                        />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] text-zinc-200" dir="ltr">
                      {b.id}
                    </span>
                  </button>
                ))}

              {(tab === "skills" ? skills : brands).length === 0 && (
                <EmptyState title="نتیجه‌ای پیدا نشد" icon={<Search className="h-5 w-5" />} />
              )}
            </div>
          </Panel>

          <Panel title="وضعیت خزانه">
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: "اسکیل", v: ALL_SKILLS_MANIFEST.length },
                { k: "برند", v: ALL_BRAND_DESIGNS_MANIFEST.length },
                { k: "دسته", v: CATEGORY_ORDER.length },
                { k: "نشان‌شده", v: favorites.ids.length },
              ].map((x) => (
                <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                  <div className="text-[9.5px] text-zinc-500">{x.k}</div>
                  <div className="font-mono text-[15px] text-zinc-100">
                    {x.v.toLocaleString("fa-IR")}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title={
              tab === "skills" ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                  {selectedSkill?.title}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                  {selectedBrand?.title}
                </span>
              )
            }
            subtitle={tab === "skills" ? selectedSkill?.path : selectedBrand?.path}
            actions={
              <>
                {tab === "skills" && selectedSkill && (
                  <button
                    onClick={() => toggleFav(selectedSkill.id)}
                    className={cn(
                      "rounded-lg border px-2 py-1 text-[10.5px]",
                      favorites.ids.includes(selectedSkill.id)
                        ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                        : "border-white/10 text-zinc-500 hover:text-white"
                    )}
                  >
                    {favorites.ids.includes(selectedSkill.id) ? "★ نشان‌شده" : "☆ نشان کن"}
                  </button>
                )}
                <CopyButton
                  text={currentDoc}
                  label={tab === "skills" ? "کپی پرامپت کامل" : "کپی سند"}
                  compact
                />
              </>
            }
            padded={false}
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
                  className="ms-auto flex items-center gap-1 rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-2.5 py-1 text-[10.5px] text-[color:var(--accent)]"
                >
                  <Check className="h-3 w-3" />
                  اعمال پالت برند روی پلتفرم
                </button>
              </div>
            )}

            <div className="max-h-[560px] overflow-y-auto p-4">
              {docLoading ? (
                <Spinner className="py-20" />
              ) : (
                <Markdown source={currentDoc} />
              )}
            </div>
          </Panel>

          {tab === "skills" && selectedSkill && (
            <Panel
              title="پرامپت آماده برای مدل هوش مصنوعی"
              subtitle="شامل نقش، استاندارد اجرایی و قواعد سخت‌گیرانه RTL"
              actions={<CopyButton text={buildPrompt(selectedSkill, currentDoc)} label="کپی پرامپت" compact />}
            >
              <CodeBlock
                code={buildPrompt(selectedSkill, currentDoc)}
                language="md"
                maxLines={18}
                filename={`${selectedSkill.slug}.prompt.md`}
              />
            </Panel>
          )}

          {tab === "brands" && (
            <Panel title="مقایسه پالت‌ها" subtitle="پنج برند اول با رنگ‌های واقعی">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ALL_BRAND_DESIGNS_MANIFEST.slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b)}
                    className="rounded-xl border border-white/[0.07] p-2 text-start transition-colors hover:border-white/20"
                  >
                    <div className="flex h-8 overflow-hidden rounded-md">
                      {b.colors.map((c, i) => (
                        <span key={i} className="flex-1" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-zinc-400" dir="ltr">
                      <FolderTree className="h-3 w-3" />
                      {b.id}
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsStudio;
