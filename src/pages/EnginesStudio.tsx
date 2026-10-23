import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  CreditCard,
  Fingerprint,
  Hash,
  Palette,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  ACCENT_PALETTES,
  IRANIAN_BANKS,
  auditRtlMotionCode,
  cleanupPersianText,
  detectIranianBank,
  formatCardNumberFa,
  generateShebaFromCard,
  numberToPersianWords,
  validateIranianNationalCode,
  validateShetabLuhn,
} from "../engines/persianEngines";
import {
  Badge,
  CodeBlock,
  CopyButton,
  EmptyState,
  Panel,
  Segmented,
  Slider,
  cn,
} from "../ui/kit";
import { EngineShader } from "../components/EngineShaders";
import { StudioShell, StudioList } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { saveKit, saveText } from "../lib/download";
import { faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";
import { usePersisted } from "../lib/store";

type EngineTool = "fintech" | "rtl" | "shaders";

const DEMO_CODE = `export function Card({ title }) {
  return (
    <div className="ml-4 pl-6 text-left" dir="ltr">
      <h3 className="tracking-widest">کارت بانکی</h3>
      <motion.div transition={{ duration: 0.2 }} className="transition-all" />
    </div>
  );
}`;

const TOOLS: { id: EngineTool; label: string; hint: string; icon: typeof Cpu }[] = [
  { id: "fintech", label: "فین‌تک ایران", hint: "کارت · شبا · کد ملی · عدد به حروف", icon: CreditCard },
  { id: "rtl", label: "ممیزی RTL", hint: "باگ‌یابی کد فارسی و موشن", icon: ShieldCheck },
  { id: "shaders", label: "شیدر WebGL", hint: "ماتریس، گرانش، شفق", icon: Sparkles },
];

export const EnginesStudio: React.FC = () => {
  const [tab, setTab] = useState<EngineTool>("fintech");
  const [card, setCard] = useState("6274 1212 3456 7890");
  const [nationalCode, setNationalCode] = useState("0067689416");
  const [amount, setAmount] = useState("۲۵۰۰۰۰۰");
  const [dirtyText, setDirtyText] = useState(
    "این   متن  با  فاصله های   اضافی و ميخواهم و نمي توانم نوشته شده است"
  );
  const [code, setCode] = useState(DEMO_CODE);
  const [shaderMode, setShaderMode] = useState<"matrix" | "gravity" | "aurora">("matrix");
  const [shaderSpeed, setShaderSpeed] = useState(1);
  const [accentName, setAccentName] = useState<keyof typeof ACCENT_PALETTES>("firoozeh");
  const [bankQuery, setBankQuery] = useState("");
  const [auditFilter, setAuditFilter] = usePersisted<{ severity: "all" | "critical" }>("studio-engines", {
    severity: "all",
  });

  const bank = useMemo(() => detectIranianBank(card), [card]);
  const luhnOk = useMemo(() => validateShetabLuhn(card), [card]);
  const sheba = useMemo(() => generateShebaFromCard(card), [card]);
  const nc = useMemo(() => validateIranianNationalCode(nationalCode), [nationalCode]);
  const words = useMemo(() => {
    const numeric = amount.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    return numberToPersianWords(numeric);
  }, [amount]);
  const lint = useMemo(() => cleanupPersianText(dirtyText), [dirtyText]);
  const audit = useMemo(() => auditRtlMotionCode(code), [code]);
  const issues = useMemo(
    () => (auditFilter.severity === "all" ? audit.issues : audit.issues.filter((i) => i.severity === "critical")),
    [audit, auditFilter.severity]
  );

  const banks = useMemo(
    () =>
      IRANIAN_BANKS.filter(
        (b) => !bankQuery.trim() || b.nameFa.includes(bankQuery) || b.bins.some((x) => x.startsWith(bankQuery))
      ),
    [bankQuery]
  );

  const loadBankSample = (bins: string) => {
    setCard(bins + "0".repeat(Math.max(0, 16 - bins.length)));
    setTab("fintech");
    soundEngine.playTick(1.1);
  };

  /* ------------------------------------------------------------- exports */

  const fintechSnippet = `// RTL Motion Lab — خروجی واقعی موتورهای فین‌تک برای ورودی فعلی
import {
  detectIranianBank, validateShetabLuhn, generateShebaFromCard,
  validateIranianNationalCode, numberToPersianWords, formatCardNumberFa,
} from "@/engines/persianEngines";

const CARD = "${card}";
const bank = detectIranianBank(CARD);       // ${bank.nameFa}
const isValid = validateShetabLuhn(CARD);   // ${luhnOk}
const sheba = generateShebaFromCard(CARD);  // ${sheba || "—"}
const national = validateIranianNationalCode("${nationalCode}"); // ${nc.valid}
const words = numberToPersianWords("${amount.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))}");
// "${words}"
`;

  const auditReport = `# گزارش ممیزی RTL و موشن

- یافته‌ها: ${faNum(audit.issues.length)}
- بحرانی: ${faNum(audit.issues.filter((i) => i.severity === "critical").length)}

${audit.issues.length === 0 ? "✅ هیچ مشکلی پیدا نشد." : ""}
${audit.issues
  .map(
    (i, n) =>
      `## ${n + 1}. ${i.titleFa} — ${i.severity === "critical" ? "بحرانی" : "هشدار"}\n\n${
        i.match ? "```\n" + i.match + "\n```\n\n" : ""
      }${i.fixFa}\n`
  )
  .join("\n")}`;

  const shaderSnippet = `import { EngineShader } from "@/components/EngineShaders";

<EngineShader
  mode="${shaderMode}"
  speed={${shaderSpeed.toFixed(1)}}
  accent="${ACCENT_PALETTES[accentName]?.hex ?? "#E8B33A"}"
  height={420}
/>`;

  const currentExport = tab === "fintech" ? fintechSnippet : tab === "rtl" ? auditReport : shaderSnippet;
  const currentFile = tab === "fintech" ? "fintech-validators.ts" : tab === "rtl" ? "rtl-audit.md" : "shader.tsx";

  const downloadKit = () =>
    saveKit("rtl-motion-engines", [
      { name: "fintech-validators.ts", content: fintechSnippet },
      { name: "rtl-audit.md", content: auditReport },
      { name: "shader.tsx", content: shaderSnippet },
      {
        name: "README.txt",
        content: `RTL Motion Lab — کیت موتورها
بانک: ${bank.nameFa}
Luhn: ${luhnOk ? "معتبر" : "نامعتبر"}
شبا: ${sheba || "—"}
کد ملی: ${nc.valid ? `معتبر (${nc.cityFa})` : "نامعتبر"}
مبلغ به حروف: ${words || "—"}
اصلاح‌های متن: ${lint.fixesCount}
یافته‌های ممیزی: ${audit.issues.length}
`,
      },
    ]);

  /* ----------------------------------------------------------------- list */

  const list = (
    <StudioList
      title="ابزار و بانک‌ها"
      subtitle={`${faNum(TOOLS.length)} موتور · ${faNum(IRANIAN_BANKS.length)} بانک`}
      footer="هر بانک را بزنید تا کارت نمونه‌اش بارگذاری شود"
      toolbar={<Badge tone="accent">{faNum(IRANIAN_BANKS.length)}</Badge>}
    >
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setTab(t.id);
            soundEngine.playSnap();
          }}
          className={cn(
            "mb-1 flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-start transition-colors",
            tab === t.id
              ? "border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/[0.08]"
              : "border border-transparent hover:bg-white/[0.04]"
          )}
        >
          <t.icon
            className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", tab === t.id ? "text-[color:var(--accent)]" : "text-zinc-600")}
          />
          <span className="min-w-0">
            <span className="block text-[11px] text-zinc-200">{t.label}</span>
            <span className="mt-0.5 block truncate text-[9px] text-zinc-600">{t.hint}</span>
          </span>
        </button>
      ))}

      <div className="my-2 border-t border-white/[0.06]" />

      <input
        value={bankQuery}
        onChange={(e) => setBankQuery(e.target.value)}
        placeholder="جستجوی بانک یا پیش‌شماره…"
        className="mb-1.5 w-full rounded-lg border border-white/[0.07] bg-black/40 px-2 py-1 text-[10px] text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-[color:var(--accent)]/40"
      />

      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-1">
        {banks.map((b) => (
          <button
            key={b.id}
            onClick={() => loadBankSample(b.bins[0] ?? "")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-1.5 py-1 text-start transition-colors",
              bank.id === b.id
                ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.08]"
                : "border-white/[0.06] hover:border-white/20"
            )}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: b.accentHex }} />
            <span className="flex-1 truncate text-[10px] text-zinc-200">{b.nameFa}</span>
            <span className="font-mono text-[8px] text-zinc-600" dir="ltr">
              {b.bins[0]}
            </span>
          </button>
        ))}
      </div>
    </StudioList>
  );

  /* ---------------------------------------------------------------- stage */

  const stage = (
    <div className="space-y-3">
      {tab === "fintech" && (
        <>
          <Panel
            title="کارت بانک — تشخیص و اعتبارسنجی"
            subtitle="پیش‌شماره واقعی شتاب + الگوریتم Luhn"
            actions={<Badge tone={luhnOk ? "success" : "danger"}>{luhnOk ? "معتبر" : "نامعتبر"}</Badge>}
          >
            <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#141418] to-[#0A0A0C] p-4">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-500">SHETAB · RTL</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] text-white/90"
                  style={{ background: `${bank.accentHex}33` }}
                >
                  {bank.nameFa}
                </span>
              </div>
              <input
                value={card}
                onChange={(e) => setCard(e.target.value)}
                dir="ltr"
                placeholder="6104 3377 1234 5678"
                maxLength={25}
                aria-label="شماره کارت"
                className="mt-5 w-full bg-transparent font-mono text-[18px] tracking-[0.1em] text-zinc-100 outline-none placeholder:text-zinc-700"
              />
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[8.5px] text-zinc-600">قالب فارسی</div>
                  <div className="font-mono text-[11px] text-zinc-300">{formatCardNumberFa(card)}</div>
                </div>
                <div className="h-6 w-9 rounded bg-gradient-to-br from-[color:var(--accent)]/70 to-transparent" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2">
                <div className="text-[9px] text-zinc-500">شبا (ISO 7064 mod 97-10)</div>
                <div className="mt-1 break-all font-mono text-[10.5px] text-teal-300" dir="ltr">
                  {sheba || "—"}
                </div>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2">
                <div className="text-[9px] text-zinc-500">پیش‌شماره‌های شناسایی‌شده</div>
                <div className="mt-1 font-mono text-[10.5px] text-zinc-300" dir="ltr">
                  {bank.bins.slice(0, 4).join(" · ")}
                </div>
              </div>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Panel title="کد ملی">
              <input
                value={nationalCode}
                onChange={(e) => setNationalCode(e.target.value)}
                dir="ltr"
                maxLength={12}
                aria-label="کد ملی"
                className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 font-mono text-[14px] tracking-wider text-zinc-100 outline-none focus:border-[color:var(--accent)]/50"
              />
              <div
                className={cn(
                  "mt-2 flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10.5px]",
                  nc.valid
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/25 bg-rose-500/10 text-rose-300"
                )}
              >
                {nc.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {nc.valid ? `معتبر — ${nc.cityFa}` : "کد ملی نامعتبر"}
              </div>
            </Panel>

            <Panel title="عدد به حروف فارسی">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                dir="ltr"
                aria-label="مبلغ"
                className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 font-mono text-[14px] text-zinc-100 outline-none focus:border-[color:var(--accent)]/50"
              />
              <div className="mt-2 min-h-[46px] rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-[12px] leading-relaxed text-zinc-100">
                {words || "—"}
              </div>
              {words && <CopyButton text={words} label="کپی" compact className="mt-1.5 w-full justify-center" />}
            </Panel>
          </div>

          <Panel
            title="پاک‌ساز متن فارسی"
            subtitle="نیم‌فاصله، ی/ک عربی، فاصله‌های تکراری، ارقام"
            actions={<Badge tone={lint.fixesCount ? "accent" : "success"}>{faNum(lint.fixesCount)} اصلاح</Badge>}
          >
            <textarea
              value={dirtyText}
              onChange={(e) => setDirtyText(e.target.value)}
              rows={2}
              aria-label="متن خام"
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2 text-[12px] leading-relaxed text-zinc-300 outline-none focus:border-[color:var(--accent)]/50"
            />
            <div className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-[12px] leading-relaxed text-zinc-100">
              {lint.cleaned}
            </div>
            <CopyButton text={lint.cleaned} label="کپی متن پاک" compact className="mt-1.5 w-full justify-center" />
          </Panel>
        </>
      )}

      {tab === "rtl" && (
        <>
          <Panel
            title="ممیزی زنده کد RTL و موشن"
            subtitle="کلاس فیزیکی، letter-spacing فارسی، تداخل transition، ارقام لاتین"
            actions={
              <Badge tone={audit.issues.length === 0 ? "success" : audit.issues.length > 2 ? "danger" : "warn"}>
                {faNum(audit.issues.length)} یافته
              </Badge>
            }
          >
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={11}
              dir="ltr"
              spellCheck={false}
              aria-label="کد برای ممیزی"
              className="studio-scroll w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-300 outline-none focus:border-[color:var(--accent)]/50"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCode(DEMO_CODE)}
                className="flex-1 rounded-lg border border-white/10 py-1.5 text-[10px] text-zinc-400 hover:text-white"
              >
                نمونه باگ‌دار
              </button>
              <button
                onClick={() => setCode("")}
                className="flex-1 rounded-lg border border-white/10 py-1.5 text-[10px] text-zinc-400 hover:text-white"
              >
                پاک کردن
              </button>
              <CopyButton text={auditReport} label="گزارش" compact />
            </div>
          </Panel>

          <Panel
            title="یافته‌ها"
            subtitle="هر مورد با پیشنهاد اصلاح دقیق"
            padded={false}
            actions={
              <Segmented
                size="sm"
                value={auditFilter.severity}
                onChange={(v) => setAuditFilter({ severity: v })}
                options={[
                  { value: "all", label: "همه" },
                  { value: "critical", label: "بحرانی" },
                ]}
              />
            }
          >
            <div className="studio-scroll max-h-[330px] space-y-2 overflow-y-auto p-2.5">
              {issues.length === 0 && (
                <EmptyState
                  icon={<ShieldCheck className="h-6 w-6 text-emerald-400" />}
                  title="موردی پیدا نشد"
                  hint="کد با قواعد RTL و موشن سازگار است."
                />
              )}
              {issues.map((issue, i) => (
                <div key={i} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        issue.severity === "critical" ? "bg-rose-400" : "bg-amber-400"
                      )}
                    />
                    <span className="text-[10.5px] font-medium text-zinc-200">{issue.titleFa}</span>
                    <Badge className="ms-auto" tone={issue.severity === "critical" ? "danger" : "warn"}>
                      {issue.severity === "critical" ? "بحرانی" : "هشدار"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">{issue.fixFa}</p>
                  {issue.match && (
                    <p className="mt-1 truncate rounded bg-black/40 px-1.5 py-1 font-mono text-[9.5px] text-rose-300/80" dir="ltr">
                      {issue.match}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="قواعد موتور" padded={false}>
            <div className="grid gap-1.5 p-2.5 sm:grid-cols-2">
              {[
                { icon: Wand2, t: "کلاس‌های فیزیکی", d: "ml/mr/pl/pr → ms/me/ps/pe" },
                { icon: Hash, t: "ارقام لاتین", d: "ارقام فارسی در متن فارسی" },
                { icon: AlertTriangle, t: "letter-spacing", d: "tracking روی فارسی حروف را می‌شکند" },
                { icon: Sparkles, t: "transition-all", d: "روی motion.* افت فریم" },
                { icon: CreditCard, t: "Luhn شتاب", d: "اعتبارسنجی پیش از ارسال" },
                { icon: Fingerprint, t: "کد ملی", d: "رقم کنترلی و شهر" },
              ].map((r) => (
                <div key={r.t} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-zinc-200">
                    <r.icon className="h-3 w-3 text-[color:var(--accent)]" />
                    {r.t}
                  </div>
                  <p className="mt-0.5 text-[9.5px] leading-relaxed text-zinc-500">{r.d}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      {tab === "shaders" && (
        <>
          <Panel
            title="پیش‌نمایش شیدر"
            subtitle="۶۰ فریم · توقف خودکار خارج از دید · DPR حداکثر ۲"
            padded={false}
            actions={
              <Segmented
                size="sm"
                value={shaderMode}
                onChange={setShaderMode}
                options={[
                  { value: "matrix", label: "ماتریس" },
                  { value: "gravity", label: "گرانش" },
                  { value: "aurora", label: "شفق" },
                ]}
              />
            }
          >
            <div className="p-2">
              <EngineShader
                mode={shaderMode}
                speed={shaderSpeed}
                accent={ACCENT_PALETTES[accentName]?.hex ?? "#E8B33A"}
                height={340}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-white/[0.06] p-2.5 sm:grid-cols-2">
              <Slider
                label="سرعت"
                value={shaderSpeed}
                min={0.2}
                max={3}
                step={0.1}
                onChange={setShaderSpeed}
                format={(v) => `${v.toFixed(1)}×`}
              />
              <div>
                <span className="mb-1.5 flex items-center gap-1 text-[10.5px] text-zinc-300">
                  <Palette className="h-3 w-3" /> پالت
                </span>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(ACCENT_PALETTES) as (keyof typeof ACCENT_PALETTES)[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setAccentName(k)}
                      className={cn(
                        "flex items-center gap-1 rounded-md border px-1.5 py-1 text-[9.5px]",
                        accentName === k ? "border-white/30 text-white" : "border-white/[0.07] text-zinc-500"
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT_PALETTES[k].hex }} />
                      {ACCENT_PALETTES[k].labelFa}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="کد استفاده">
            <CodeBlock code={shaderSnippet} language="tsx" maxLines={10} filename="shader.tsx" />
          </Panel>

          <Panel tone="inset" title="عملکرد">
            <p className="text-[11px] leading-relaxed text-zinc-400">
              شیدر با <code className="font-mono text-[10px] text-teal-300">IntersectionObserver</code> و رویداد{" "}
              <code className="font-mono text-[10px] text-teal-300">visibilitychange</code> متوقف می‌شود؛ ضریب پیکسل
              حداکثر ۲ است.
            </p>
          </Panel>
        </>
      )}
    </div>
  );

  /* ------------------------------------------------------------- settings */

  const settings = (
    <div className="space-y-3">
      <Panel title="موتور فعال">
        <Segmented
          className="w-full"
          size="sm"
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: "fintech", label: "فین‌تک" },
            { value: "rtl", label: "ممیزی" },
            { value: "shaders", label: "شیدر" },
          ]}
        />
      </Panel>

      {tab === "shaders" && (
        <Panel title="تنظیمات شیدر">
          <div className="space-y-3">
            <Slider
              label="سرعت حرکت"
              value={shaderSpeed}
              min={0.2}
              max={3}
              step={0.1}
              format={(v) => `${v.toFixed(1)}×`}
              onChange={setShaderSpeed}
            />
            <div>
              <span className="mb-1.5 block text-[10.5px] text-zinc-400">پالت رنگ</span>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(ACCENT_PALETTES) as (keyof typeof ACCENT_PALETTES)[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setAccentName(k)}
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-1.5 py-1 text-[9.5px]",
                      accentName === k
                        ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                        : "border-white/[0.07] text-zinc-500"
                    )}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT_PALETTES[k].hex }} />
                    {ACCENT_PALETTES[k].labelFa}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {tab === "fintech" && (
        <Panel title="آمار زنده">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { k: "بانک", v: faNum(IRANIAN_BANKS.length) },
              { k: "Luhn", v: luhnOk ? "✓" : "✕" },
              { k: "کد ملی", v: nc.valid ? "✓" : "✕" },
              { k: "اصلاح متن", v: faNum(lint.fixesCount) },
            ].map((x) => (
              <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5">
                <div className="text-[9px] text-zinc-500">{x.k}</div>
                <div className="font-mono text-[13px] text-zinc-100">{x.v}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "rtl" && (
        <Panel title="خلاصه ممیزی">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5">
              <div className="text-[9px] text-zinc-500">یافته‌ها</div>
              <div className="font-mono text-[13px] text-zinc-100">{faNum(audit.issues.length)}</div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5">
              <div className="text-[9px] text-zinc-500">بحرانی</div>
              <div className="font-mono text-[13px] text-rose-300">
                {faNum(audit.issues.filter((i) => i.severity === "critical").length)}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
            موتور روی ۹ قاعده RTL، تایپوگرافی فارسی و کارایی موشن کار می‌کند.
          </p>
        </Panel>
      )}

      <Panel tone="inset" title="خروجی این ابزار">
        <p className="text-[10.5px] leading-relaxed text-zinc-400">محتوای واقعی محاسبه‌شده، آماده دانلود.</p>
        <div className="mt-2 flex gap-1.5">
          <DownloadButton
            label="فایل"
            filename={currentFile}
            onDownload={() => (saveText(currentExport, currentFile), true)}
            className="flex-1 justify-center"
          />
          <DownloadButton
            label="کیت"
            filename="rtl-motion-engines.zip"
            onDownload={downloadKit}
            className="flex-1 justify-center"
          />
        </div>
      </Panel>
    </div>
  );

  return (
    <StudioShell
      eyebrow="ENGINE STUDIO"
      title="استودیو موتورها"
      description={`موتورهای واقعی در مرورگر: تشخیص ${faNum(IRANIAN_BANKS.length)} بانک ایران، Luhn، شبا، کد ملی، عدد به حروف، پاک‌ساز نیم‌فاصله، ممیزی RTL و شیدر زنده.`}
      icon={Cpu}
      stats={
        <>
          <Badge tone="accent">{faNum(IRANIAN_BANKS.length)} بانک</Badge>
          <Badge>{faNum(TOOLS.length)} موتور</Badge>
        </>
      }
      actions={<DownloadButton label="کیت کامل" filename="rtl-motion-engines.zip" onDownload={downloadKit} />}
      listWidth="238px"
      settingsWidth="286px"
      list={list}
      stage={stage}
      settings={settings}
    />
  );
};

export default EnginesStudio;
