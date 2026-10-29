import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  Gauge,
  Languages,
  Layers,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Square,
  Type,
} from "lucide-react";
import {
  SHADERS,
  SHADER_CATEGORY_LABEL,
  VERTEX_SHADER,
  SHADER_PRELUDE,
  shaderSource,
  type ShaderCategory,
} from "../engines/shaderLab";
import { auditPersianCopy, auditRtlMotionCode } from "../engines/persianEngines";
import { ShaderSurface } from "../components/ShaderSurface";
import { usePersisted } from "../lib/store";
import { saveKit, saveText } from "../lib/download";
import {
  Badge,
  CodeBlock,
  CopyButton,
  Panel,
  SearchField,
  Segmented,
  Slider,
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList, focusStudioPreview } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { faNum } from "../lib/format";
import { useToast } from "../ui/Toast";
import { HERO_SENTENCE } from "../shell/introCopy";

/* --------------------------------------------------------------- settings */

interface ShaderSettings {
  speed: number;
  scale: number;
  hue: number;
  warp: number;
  grain: number;
  ior: number;
  chromatic: number;
  fresnelPower: number;
  vignette: number;
  glassOverlay: boolean;
  overlayText: string;
  glyphText: string;
  glyphFont: string;
  paused: boolean;
  interactive: boolean;
  mode: "shader" | "rtl";
}

const DEFAULT: ShaderSettings = {
  speed: 0.45,
  scale: 1.2,
  hue: 0.4,
  warp: 1.1,
  grain: 0.35,
  ior: 1.52,
  chromatic: 0.28,
  fresnelPower: 3.2,
  vignette: 30,
  glassOverlay: true,
  overlayText: HERO_SENTENCE,
  glyphText: "نور خط جان کد رمز هکر ۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹",
  glyphFont: '"Vazirmatn", "Hasti", sans-serif',
  paused: false,
  interactive: true,
  mode: "shader",
};

const SAMPLE_CODE = `export function PriceCard({ amount }: { amount: number }) {
  return (
    <div dir="ltr" className="space-x-3 ml-4 border-l border-white/10 rounded-l-xl pr-2">
      <ArrowLeft className="h-4 w-4" />
      <div className="text-left uppercase tracking-widest">قیمت ويژه</div>
      <span>{amount} تومان</span>
      <div>می خواهم بخرم</div>
    </div>
  );
}`;

const RTL_PRESETS = [
  {
    id: "broken",
    label: "کد پر از باگ RTL",
    code: SAMPLE_CODE,
  },
  {
    id: "mixed",
    label: "ترکیب فارسی و لاتین",
    code: `const stats = { users: 12480 };\nexport const Stats = () => (\n  <section className="flex px-4">\n    <h3>کاربران فعال: {stats.users}</h3>\n    <span className="text-right">API v2 — 99.9%</span>\n  </section>\n);`,
  },
  {
    id: "clean",
    label: "نسخه پاک‌شده",
    code: `export function PriceCard({ amount }: { amount: number }) {
  return (
    <div className="flex items-center gap-3 ps-4 border-s border-white/10 rounded-s-xl pe-2">
      <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
      <div className="text-start">قیمت ویژه</div>
      <span>{faNum(amount)} تومان</span>
      <div>می‌خواهم بخرم</div>
    </div>
  );
}`,
  },
];

const SAMPLE_COPY = `قیمت ويژه 129000 تومان ، براي كاربري كه مي خواهد سريع خريد كند . ميزان تخفيف 15 درصد است.`;

/* ------------------------------------------------------------------ studio */

export const EnginesStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<ShaderSettings>("studio-shaders", DEFAULT);
  const [pick, setPick] = usePersisted<{ id: string; hue: number }>("studio-shaders-pick", {
    id: SHADERS[0].id,
    hue: SHADERS[0].preset.hue,
  });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ShaderCategory | "all">("all");
  const [code, setCode] = useState(SAMPLE_CODE);
  const [copyText, setCopyText] = useState(SAMPLE_COPY);
  const [toastState, setToastState] = useState<string | null>(null);
  const toast = useToast();

  const shader = SHADERS.find((x) => x.id === pick.id) ?? SHADERS[0];
  const mode = s.mode;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SHADERS.filter((x) => {
      const hay = `${x.nameFa} ${x.nameEn} ${x.descFa} ${x.id}`.toLowerCase();
      return (cat === "all" || x.category === cat) && (!term || hay.includes(term));
    });
  }, [q, cat]);

  const audit = useMemo(() => auditRtlMotionCode(code), [code]);
  const fixedAudit = useMemo(() => auditRtlMotionCode(audit.fixedCode), [audit.fixedCode]);
  const copyAudit = useMemo(() => auditPersianCopy(copyText), [copyText]);
  const critical = audit.issues.filter((i) => i.severity === "critical").length;

  const selectShader = (id: string) => {
    const target = SHADERS.find((x) => x.id === id);
    if (!target) return;
    setPick({ id, hue: target.preset.hue });
    set({
      speed: target.preset.speed,
      scale: target.preset.scale,
      warp: target.preset.warp,
      hue: target.preset.hue,
    });
    focusStudioPreview();
  };

  const downloadGlsl = () => {
    saveText(shaderSource(shader), `${shader.id}.frag`, "text/plain;charset=utf-8");
    return true;
  };

  const downloadKit = async () =>
    saveKit(`rtl-shader-${shader.id}`, [
      { name: `${shader.id}.frag`, content: shaderSource(shader) },
      { name: "vertex.vert", content: VERTEX_SHADER },
      { name: "prelude.glsl", content: SHADER_PRELUDE },
      {
        name: "ShaderSurface.tsx",
        content: `import { ShaderSurface } from "@/components/ShaderSurface";
import { SHADERS } from "@/engines/shaderLab";

const def = SHADERS.find((s) => s.id === "${shader.id}")!;

export const Live = () => (
  <div className="h-80 w-full overflow-hidden rounded-2xl">
    <ShaderSurface def={def} speed={${s.speed}} scale={${s.scale}} hue={${s.hue}} warp={${s.warp}} grain={${s.grain}} />
  </div>
);`,
      },
      {
        name: "README.txt",
        content: `RTL Motion Lab — ${shader.nameFa} (${shader.nameEn})
${"=".repeat(48)}
${shader.descFa}

uniforms:
  u_time    زمان (ثانیه)
  u_res     اندازه بوم
  u_speed   ${s.speed}
  u_scale   ${s.scale}
  u_hue     ${s.hue}
  u_warp    ${s.warp}
  u_grain   ${s.grain}
  u_accent  رنگ اکسنت پلتفرم
  u_mouse   موقعیت اشاره‌گر (-1..1)
`,
      },
    ]);

  const downloadAudit = () => {
    const md = [
      "# گزارش ممیزی RTL",
      "",
      `امتیاز: ${audit.score}/100`,
      `یافته‌ها: ${audit.issues.length} (${critical} بحرانی)`,
      "",
      "## یافته‌ها",
      ...audit.issues.map(
        (i) =>
          `- [${i.severity === "critical" ? "x" : " "}] ${i.titleFa}\n  - قاعده: ${i.rule}\n  - نمونه: \`${i.match}\`\n  - اصلاح: ${i.fixFa}`
      ),
      "",
      "## کد اصلاح‌شده",
      "```tsx",
      audit.fixedCode,
      "```",
      "",
      `## بازرسی دوباره: امتیاز ${fixedAudit.score}/100`,
      ...fixedAudit.issues.map(
        (i) => `- ${i.severity === "critical" ? "🔴" : "🟡"} ${i.titleFa} → ${i.fixFa}`
      ),
      "",
      "## ممیزی متن",
      ...copyAudit.issues.map((i) => `- ${i.titleFa} → ${i.fixFa}`),
      "",
      copyAudit.cleaned,
    ].join("\n");
    saveText(md, "rtl-audit.md", "text/markdown;charset=utf-8");
    return true;
  };

  const copyFix = async () => {
    try {
      await navigator.clipboard.writeText(audit.fixedCode);
      setToastState("کد اصلاح‌شده کپی شد");
      setTimeout(() => setToastState(null), 1600);
    } catch {
      toast.push("کپی ممکن نشد", { tone: "error" });
    }
  };

  /* ------------------------------------------------------------------ list */

  const rows =
    mode === "shader"
      ? filtered.map((item) => {
          const active = item.id === shader.id;
          return (
            <button
              key={item.id}
              onClick={() => selectShader(item.id)}
              className={cn(
                "mb-1 flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-start transition-colors",
                active
                  ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.08]"
                  : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"
              )}
            >
              <span
                className="h-7 w-7 shrink-0 overflow-hidden rounded-md border border-white/10"
                style={{
                  background: `conic-gradient(from ${item.preset.hue * 360}deg, var(--accent), #6366F1, #EC4899, var(--accent))`,
                }}
              />
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-[11.5px]",
                    active ? "text-white" : "text-zinc-300"
                  )}
                >
                  {item.nameFa}
                </span>
                <span className="block truncate font-mono text-[9px] text-zinc-600" dir="ltr">
                  {item.nameEn}
                </span>
              </span>
            </button>
          );
        })
      : [
          ...audit.issues.map((issue) => (
            <div
              key={issue.id}
              className={cn(
                "mb-1 rounded-lg border px-2 py-1.5",
                issue.severity === "critical"
                  ? "border-rose-500/25 bg-rose-500/[0.06]"
                  : "border-amber-500/20 bg-amber-500/[0.05]"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    issue.severity === "critical" ? "bg-rose-400" : "bg-amber-400"
                  )}
                />
                <span className="text-[10px] font-medium text-zinc-200">{issue.rule}</span>
              </div>
              <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-500">{issue.titleFa}</p>
              {issue.match && (
                <code
                  dir="ltr"
                  className="mt-1 block truncate rounded bg-black/40 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400"
                >
                  {issue.match}
                </code>
              )}
            </div>
          )),
          ...copyAudit.issues.map((issue) => (
            <div
              key={issue.id}
              className="mb-1 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1.5"
            >
              <div className="text-[10px] text-zinc-300">{issue.titleFa}</div>
              <p className="mt-0.5 text-[9.5px] text-zinc-500">{issue.fixFa}</p>
            </div>
          )),
          ...(audit.issues.length === 0 && copyAudit.issues.length === 0
            ? [
                <div
                  key="clean"
                  className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3 text-center"
                >
                  <BadgeCheck className="mx-auto h-5 w-5 text-emerald-400" />
                  <p className="mt-1 text-[11px] text-emerald-300">هیچ مشکلی پیدا نشد</p>
                </div>,
              ]
            : []),
        ];

  const list = (
    <StudioList
      title={mode === "shader" ? "کتابخانه شیدر" : "یافته‌های ممیزی"}
      subtitle={
        mode === "shader"
          ? `${faNum(filtered.length)} از ${faNum(SHADERS.length)} شیدر`
          : `${faNum(audit.issues.length + copyAudit.issues.length)} یافته · امتیاز ${faNum(audit.score)}`
      }
      toolbar={
        <Badge tone={mode === "shader" ? "accent" : critical ? "danger" : "success"}>
          {mode === "shader" ? faNum(SHADERS.length) : faNum(audit.score)}
        </Badge>
      }
      footer={
        mode === "shader"
          ? "سورس GLSL هر شیدر قابل دانلود است"
          : "خروجی: کد اصلاح‌شده + گزارش Markdown"
      }
      className="min-h-[360px] desk:min-h-0"
    >
      {mode === "shader" ? (
        <>
          <div className="sticky top-0 z-10 -m-1.5 mb-1.5 space-y-2 bg-[#0D0D10]/95 p-1.5 backdrop-blur">
            <SearchField value={q} onChange={setQ} placeholder="نام شیدر…" />
            <div className="flex flex-wrap gap-1">
              {(
                ["all", "hacker", "gradient", "noise", "geometric", "liquid", "retro"] as const
              ).map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9.5px] transition-colors",
                    cat === c
                      ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                      : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {c === "all" ? "همه" : SHADER_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
          {rows}
        </>
      ) : (
        rows
      )}
    </StudioList>
  );

  /* ----------------------------------------------------------------- stage */

  const shaderStage = (
    <div className="space-y-3">
      <Panel padded={false} className="overflow-hidden desk:sticky desk:top-0 desk:z-20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-hasti text-[17px] text-white">{shader.nameFa}</h2>
              <Badge tone="accent">{SHADER_CATEGORY_LABEL[shader.category]}</Badge>
            </div>
            <p className="mt-0.5 truncate text-[10.5px] text-zinc-500">{shader.descFa}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => set({ paused: !s.paused })}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10.5px] text-zinc-300"
            >
              {s.paused ? <Play className="h-3 w-3" /> : <Square className="h-3 w-3" />}
              {s.paused ? "پخش" : "توقف"}
            </button>
            <DownloadButton label="GLSL" filename={`${shader.id}.frag`} onDownload={downloadGlsl} />
            <DownloadButton
              label="کیت"
              filename={`rtl-shader-${shader.id}.zip`}
              onDownload={downloadKit}
              variant="solid"
            />
          </div>
        </div>

        <div className="relative h-[240px] w-full sm:h-[320px] desk:h-[42vh]">
          <ShaderSurface
            def={shader}
            speed={s.speed}
            scale={s.scale}
            hue={s.hue}
            warp={s.warp}
            grain={s.grain}
            paused={s.paused}
            interactive={s.interactive}
            glyphText={s.glyphText}
            glyphFont={s.glyphFont}
            className="absolute inset-0"
          />
          {(s.vignette ?? 30) > 0 && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                boxShadow: `inset 0 0 ${(s.vignette ?? 30) * 1.5}px rgba(3,5,10,${(
                  (s.vignette ?? 30) / 100
                ).toFixed(2)})`,
              }}
            />
          )}
          {(s.glassOverlay ?? true) && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <div
                dir="rtl"
                className="max-w-md rounded-2xl border border-white/25 bg-black/35 px-5 py-3.5 text-center text-white transition-all"
                style={{
                  backdropFilter: `blur(${Math.round(((s.ior ?? 1.52) - 1) * 22)}px) saturate(${Math.round(
                    130 + (s.chromatic ?? 0.28) * 90
                  )}%)`,
                  boxShadow: `0 20px 44px -16px rgba(0,0,0,0.65), inset 0 1px 0 0 rgba(255,255,255,${Math.min(
                    0.85,
                    (s.fresnelPower ?? 3.2) / 6
                  ).toFixed(2)})`,
                }}
              >
                <div className="font-mono text-[9.5px] text-amber-200/80" dir="ltr">
                  SNELL IOR n={(s.ior ?? 1.52).toFixed(2)} · CAUCHY Δn=
                  {(s.chromatic ?? 0.28).toFixed(2)} · FRESNEL p=
                  {(s.fresnelPower ?? 3.2).toFixed(1)}
                </div>
                <p className="mt-1 font-nastaliq text-[24px] leading-[2] text-white">
                  {s.overlayText || HERO_SENTENCE}
                </p>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-3">
            <span className="font-mono text-[9px] tracking-[0.2em] text-white/60">
              LIVE · GLSL ES 1.0
            </span>
            <span className="font-mono text-[9px] text-white/50" dir="ltr">
              {s.speed.toFixed(2)}× · hue {s.hue.toFixed(2)} · warp {s.warp.toFixed(2)}
            </span>
          </div>
        </div>
      </Panel>

      <Panel
        title="سورس شیدر"
        subtitle="همان کدی که اجرا می‌شود"
        actions={
          <>
            <CopyButton text={shaderSource(shader)} label="کپی" compact />
            <Badge>{faNum(shaderSource(shader).split("\n").length)} خط</Badge>
          </>
        }
      >
        <CodeBlock
          code={shaderSource(shader)}
          language="glsl"
          maxLines={16}
          filename={`${shader.id}.frag`}
        />
      </Panel>

      <Panel title="شیدرهای این دسته" padded={false}>
        <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
          {SHADERS.filter((x) => x.category === shader.category).map((x) => (
            <button
              key={x.id}
              onClick={() => selectShader(x.id)}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-start text-[10.5px] transition-colors",
                x.id === shader.id
                  ? "border-[color:var(--accent)]/40 text-[color:var(--accent)]"
                  : "border-white/[0.07] text-zinc-400 hover:text-white"
              )}
            >
              {x.nameFa}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );

  const rtlStage = (
    <div className="space-y-3">
      <Panel padded={false} className="desk:sticky desk:top-0 desk:z-20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="flex items-center gap-2">
            <h2 className="font-hasti text-[17px] text-white">ممیزی RTL</h2>
            <Badge tone={critical ? "danger" : "success"}>{faNum(audit.issues.length)} یافته</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <CopyButton text={audit.fixedCode} label="کپی اصلاح" compact />
            <DownloadButton
              label="گزارش"
              filename="rtl-audit.md"
              onDownload={downloadAudit}
              variant="solid"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
          {[
            {
              k: "امتیاز",
              v: faNum(audit.score),
              tone:
                audit.score > 70
                  ? "text-emerald-300"
                  : audit.score > 40
                    ? "text-amber-300"
                    : "text-rose-300",
            },
            { k: "بحرانی", v: faNum(critical), tone: "text-rose-300" },
            { k: "هشدار", v: faNum(audit.issues.length - critical), tone: "text-amber-300" },
          ].map((m) => (
            <div key={m.k} className="bg-[#0D0D10] px-3 py-2.5 text-center">
              <div className="text-[9.5px] text-zinc-500">{m.k}</div>
              <div className={cn("font-mono text-[20px]", m.tone)}>{m.v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="کد خودت را بچسبان"
        subtitle="لحظه‌ای تحلیل می‌شود"
        actions={<Badge>{faNum(code.length)} کاراکتر</Badge>}
      >
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          dir="ltr"
          spellCheck={false}
          rows={10}
          className="w-full resize-y rounded-xl border border-white/[0.08] bg-black/50 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-200 outline-none focus:border-[color:var(--accent)]/50"
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {RTL_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setCode(p.code)}
              className="rounded-lg border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-400 hover:text-white"
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={copyFix}
            className="ms-auto inline-flex items-center gap-1 rounded-lg bg-[color:var(--accent)] px-2.5 py-1 text-[10.5px] font-bold text-black"
          >
            <Check className="h-3 w-3" />
            {toastState ?? "کپی نسخه اصلاح‌شده"}
          </button>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="قبل" subtitle="کد فعلی">
          <CodeBlock code={code} language="tsx" maxLines={14} />
        </Panel>
        <Panel
          title="بعد"
          subtitle={`اصلاح خودکار ${faNum(audit.issues.length)} مورد · بازرسی دوباره ${faNum(fixedAudit.issues.length)} یافته`}
          actions={
            <Badge tone={fixedAudit.issues.length ? "accent" : "success"}>
              {faNum(fixedAudit.score)}/۱۰۰
            </Badge>
          }
        >
          <CodeBlock code={audit.fixedCode} language="tsx" maxLines={14} />
        </Panel>
      </div>

      <Panel title="ممیزی متن فارسی" subtitle="نیم‌فاصله، حروف عربی، ارقام و علائم">
        <textarea
          value={copyText}
          onChange={(e) => setCopyText(e.target.value)}
          rows={3}
          className="w-full resize-y rounded-xl border border-white/[0.08] bg-black/50 p-2.5 text-[12px] leading-relaxed text-zinc-200 outline-none focus:border-[color:var(--accent)]/50"
        />
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2">
            <div className="mb-1 flex items-center gap-1 text-[10px] text-zinc-500">
              <Type className="h-3 w-3" /> نسخه استاندارد
            </div>
            <p className="text-[11.5px] leading-relaxed text-zinc-200">{copyAudit.cleaned}</p>
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2">
            <div className="mb-1 flex items-center gap-1 text-[10px] text-zinc-500">
              <Languages className="h-3 w-3" /> {faNum(copyAudit.issues.length)} نکته
            </div>
            <ul className="space-y-1 text-[10.5px] text-zinc-400">
              {copyAudit.issues.map((i) => (
                <li key={i.id}>• {i.titleFa}</li>
              ))}
              {copyAudit.issues.length === 0 && <li className="text-emerald-300">متن تمیز است</li>}
            </ul>
          </div>
        </div>
      </Panel>

      <Panel tone="inset" title="چرا این مهم است؟">
        <p className="text-[11px] leading-relaxed text-zinc-400">
          در فارسی، فاصله‌گذاری فیزیکی (ml/mr) در حالت راست‌به‌چپ آینه نمی‌شود، شکستن حروف با
          <code className="mx-1 rounded bg-white/10 px-1 font-mono text-[10px]">split("")</code>
          اتصال خط را نابود می‌کند و انیمیت‌کردن layout باعث افت فریم می‌شود. این ممیزی هر سه دسته
          را با اصلاح خودکار گزارش می‌کند.
        </p>
      </Panel>
    </div>
  );

  /* -------------------------------------------------------------- settings */

  const shaderSettings = (
    <div className="space-y-3">
      <Panel title="یونیفرم‌ها" subtitle="روی رندر زنده اثر می‌گذارد">
        <div className="space-y-3">
          <Slider
            label="سرعت"
            value={s.speed}
            min={0}
            max={2}
            step={0.01}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => set({ speed: v })}
          />
          <Slider
            label="مقیاس"
            value={s.scale}
            min={0.4}
            max={4}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => set({ scale: v })}
          />
          <Slider
            label="چرخش رنگ"
            value={s.hue}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 360)}°`}
            onChange={(v) => set({ hue: v })}
          />
          <Slider
            label="اعوجاج"
            value={s.warp}
            min={0}
            max={3}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => set({ warp: v })}
          />
          <Slider
            label="دانه"
            value={s.grain}
            min={0}
            max={1.5}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => set({ grain: v })}
          />
        </div>
      </Panel>

      <Panel
        title="اطلس حروف فارسی و شیدرهای هکری (WebGL Glyph Atlas)"
        subtitle="حروف و واژه‌هایی که داخل باران ماتریکس و شیدرهای هکری می‌بارند"
      >
        <div className="space-y-2.5">
          <input
            value={s.glyphText ?? "نور خط جان کد رمز هکر ۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹"}
            onChange={(e) => set({ glyphText: e.target.value })}
            dir="rtl"
            placeholder="حروف یا واژه‌های فارسی دلخواه برای رندر در شیدر…"
            className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1.5 text-[11.5px] text-zinc-200 outline-none focus:border-[color:var(--accent)]/50"
          />
          <div className="flex flex-wrap gap-1">
            {[
              { label: "الفبا + ارقام", text: "" },
              { label: "نور و خط", text: "نور خط جان حق هو لا موج روح" },
              { label: "ترمینال هکری", text: "کد رمز هکر صفر یک شبکه نود ۰ ۱" },
              { label: "باینری ۰ و ۱", text: "۰ ۱ ۰ ۱ کد رمز ۰ ۱" },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => set({ glyphText: p.text })}
                className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-[9.5px] text-zinc-300 hover:border-[color:var(--accent)]/40 hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
          <Segmented
            size="sm"
            value={s.glyphFont ?? '"Vazirmatn", "Hasti", sans-serif'}
            onChange={(v) => set({ glyphFont: v })}
            options={[
              { value: '"Vazirmatn", "Hasti", sans-serif', label: "وزیرمتن" },
              { value: '"IranNastaliq", serif', label: "نستعلیق" },
              { value: '"Morabba", sans-serif', label: "مربع" },
              { value: '"Vazir Code", monospace', label: "وزیر کد" },
            ]}
          />
        </div>
      </Panel>

      <Panel title="عدسی شیشه مایع و اپتیک اسنل (Liquid Glass)">
        <div className="space-y-3">
          <Toggle
            label="نمایش کارت شیشه مایع روی شیدر"
            checked={s.glassOverlay ?? true}
            onChange={(v) => set({ glassOverlay: v })}
          />
          <input
            value={s.overlayText ?? HERO_SENTENCE}
            onChange={(e) => set({ overlayText: e.target.value })}
            dir="rtl"
            placeholder="متن روی عدسی شیشه مایع…"
            className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-2.5 py-1.5 text-[11.5px] text-zinc-200 outline-none focus:border-[color:var(--accent)]/50"
          />
          <Slider
            label="ضریب شکست اسنل (IOR n)"
            value={s.ior ?? 1.52}
            min={1.0}
            max={2.42}
            step={0.02}
            format={(v) => v.toFixed(2)}
            onChange={(v) => set({ ior: v })}
            hint="۱.۳۳ آب · ۱.۵۲ شیشه کراون · ۲.۴۲ الماس"
          />
          <Slider
            label="پراکندگی کروماتیک کوشی (Δn)"
            value={s.chromatic ?? 0.28}
            min={0}
            max={1}
            step={0.02}
            format={(v) => v.toFixed(2)}
            onChange={(v) => set({ chromatic: v })}
          />
          <Slider
            label="بازتاب لبه‌ای فرنل (Fresnel p)"
            value={s.fresnelPower ?? 3.2}
            min={1}
            max={8}
            step={0.2}
            format={(v) => v.toFixed(1)}
            onChange={(v) => set({ fresnelPower: v })}
          />
          <Slider
            label="وینیت اپتیکال (Vignette)"
            value={s.vignette ?? 30}
            min={0}
            max={85}
            step={5}
            unit="%"
            onChange={(v) => set({ vignette: v })}
          />
        </div>
      </Panel>

      <Panel title="رفتار">
        <div className="space-y-1.5">
          <Toggle
            label="توقف رندر"
            checked={s.paused}
            onChange={(v) => set({ paused: v })}
            hint="برای صرفه‌جویی باتری"
          />
          <Toggle
            label="واکنش به اشاره‌گر"
            checked={s.interactive}
            onChange={(v) => set({ interactive: v })}
          />
          <button
            onClick={() => {
              set({
                speed: shader.preset.speed,
                scale: shader.preset.scale,
                warp: shader.preset.warp,
                hue: shader.preset.hue,
              });
            }}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[11px] text-zinc-300 hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
            پیش‌فرض همین شیدر
          </button>
        </div>
      </Panel>

      <Panel title="آماده‌های سریع">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { k: "آرام", v: { speed: 0.15, grain: 0.2, warp: 0.6 } },
            { k: "پرانرژی", v: { speed: 1.1, grain: 0.6, warp: 2 } },
            { k: "نئون", v: { hue: 0.82, grain: 0.15, scale: 2.2 } },
            { k: "فیلم", v: { grain: 1.2, speed: 0.3, scale: 1 } },
          ].map((p) => (
            <button
              key={p.k}
              onClick={() => set(p.v)}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 py-1.5 text-[10.5px] text-zinc-300 hover:border-[color:var(--accent)]/40 hover:text-white"
            >
              {p.k}
            </button>
          ))}
        </div>
      </Panel>

      <Panel tone="inset" title="این شیدر">
        <p className="text-[11px] leading-relaxed text-zinc-400">{shader.descFa}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge>{SHADER_CATEGORY_LABEL[shader.category]}</Badge>
          <Badge>GLSL ES 1.0</Badge>
          <Badge>WebGL1</Badge>
        </div>
      </Panel>
    </div>
  );

  const rtlSettings = (
    <div className="space-y-3">
      <Panel title="قواعد فعال">
        <ul className="space-y-1.5 text-[10.5px] text-zinc-400">
          {[
            "فاصله و گوشه منطقی (ms/me/ps/pe، border-s/e)",
            'split("") و اتصال حروف',
            "tracking و letter-spacing فارسی",
            "انیمیشن layout در برابر GPU",
            "space-x در RTL",
            "حروف عربی ي/ك",
            "نیم‌فاصله می/نمی",
            "ارقام لاتین در متن",
            "آینه‌سازی آیکون جهت‌دار",
            'dir="ltr" قفل‌شده',
          ].map((r) => (
            <li key={r} className="flex gap-1.5">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--accent)]" />
              {r}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="آمار">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { k: "امتیاز", v: faNum(audit.score), i: Gauge },
            { k: "یافته", v: faNum(audit.issues.length), i: Layers },
            { k: "بحرانی", v: faNum(critical), i: ShieldCheck },
            { k: "متن", v: faNum(copyAudit.issues.length), i: Languages },
          ].map((x) => (
            <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
              <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                <x.i className="h-3 w-3" />
                {x.k}
              </div>
              <div className="font-mono text-[14px] text-zinc-100">{x.v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel tone="inset" title="پیشنهاد">
        <p className="text-[11px] leading-relaxed text-zinc-400">
          هر آیتم را یکی‌یکی روی کد خودتان اجرا کنید. اصلاح خودکار امن است، اما آینه‌سازی آیکون‌ها و
          ایزوله‌سازی لاتین را باید دستی تأیید کنید.
        </p>
      </Panel>
    </div>
  );

  return (
    <StudioShell
      eyebrow={mode === "shader" ? "SHADER LAB" : "RTL AUDIT"}
      title={mode === "shader" ? "آزمایشگاه شیدر" : "ممیزی RTL و متن فارسی"}
      description={
        mode === "shader"
          ? `${faNum(SHADERS.length)} شیدر واقعی GLSL با یونیفرم‌های زنده، سورس قابل دانلود و رندر روی GPU.`
          : "کد فارسی خود را بچسبانید: باگ‌های RTL، نیم‌فاصله و ارقام را با اصلاح خودکار پیدا می‌کند."
      }
      icon={mode === "shader" ? Sparkles : ShieldCheck}
      stats={
        <Badge tone="accent">
          {mode === "shader" ? `${faNum(SHADERS.length)} شیدر` : `${faNum(audit.score)}/۱۰۰`}
        </Badge>
      }
      actions={
        <Segmented
          size="sm"
          value={mode}
          onChange={(v) => {
            set({ mode: v });
            setCat("all");
          }}
          options={[
            { value: "shader", label: "شیدر" },
            { value: "rtl", label: "RTL" },
          ]}
        />
      }
      onReset={() => {
        reset();
        setCode(SAMPLE_CODE);
        setCopyText(SAMPLE_COPY);
      }}
      list={list}
      stage={mode === "shader" ? shaderStage : rtlStage}
      settings={mode === "shader" ? shaderSettings : rtlSettings}
      listWidth="248px"
      settingsWidth="300px"
    />
  );
};

export default EnginesStudio;
