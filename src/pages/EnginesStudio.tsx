import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  CreditCard,
  Fingerprint,
  Hash,
  ShieldCheck,
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
import { Badge, CodeBlock, CopyButton, Panel, Segmented, Slider, cn } from "../ui/kit";
import { EngineShader } from "../components/EngineShaders";
import { soundEngine } from "../engines/soundEngine";
import { usePersisted } from "../lib/store";
import { faNum } from "../lib/format";

type EngineTab = "fintech" | "rtl" | "shaders";

const DEMO_CODE = `export function Card({ title }) {
  return (
    <div className="ml-4 pl-6 text-left" dir="ltr">
      <h3 className="tracking-widest">کارت بانکی</h3>
      <motion.div transition={{ duration: 0.2 }} className="transition-all" />
    </div>
  );
}`;

const SAMPLE_TEXT =
  "این   متن  با  فاصله های   اضافی و ميخواهم و نمي توانم نوشته شده است";

export const EnginesStudio: React.FC = () => {
  const [tab, setTab] = useState<EngineTab>("fintech");
  const [card, setCard] = useState("6274 1212 3456 7890");
  const [nationalCode, setNationalCode] = useState("0067689416");
  const [amount, setAmount] = useState("۲۵۰۰۰۰۰");
  const [dirtyText, setDirtyText] = useState(SAMPLE_TEXT);
  const [code, setCode] = useState(DEMO_CODE);
  const [shaderMode, setShaderMode] = useState<"matrix" | "gravity" | "aurora">("matrix");
  const [shaderSpeed, setShaderSpeed] = useState(1);
  const [accentName, setAccentName] = useState<keyof typeof ACCENT_PALETTES>("firoozeh");
  const [bankQuery, setBankQuery] = useState("");
  const [auditTab, setAuditTab] = usePersisted<{ severity: "all" | "critical" }>("studio-engines", {
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
    () => (auditTab.severity === "all" ? audit.issues : audit.issues.filter((i) => i.severity === "critical")),
    [audit, auditTab.severity]
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
    if (tab !== "fintech") setTab("fintech");
    soundEngine.playTick(1.1);
  };

  const shaderSnippet = `import { EngineShader } from "@/components/EngineShaders";

<EngineShader
  mode="${shaderMode}"
  speed={${shaderSpeed.toFixed(1)}}
  accent="${ACCENT_PALETTES[accentName]?.hex ?? "#E8B33A"}"
  height={420}
/>`;

  const auditReport = `# گزارش ممیزی RTL و موشن

- فایل‌های بررسی‌شده: ۱
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

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <Cpu className="h-3.5 w-3.5" />
            <span className="font-mono tracking-[0.18em]">ENGINES STUDIO</span>
          </div>
          <h1 className="mt-1 text-[24px] font-bold leading-tight text-white sm:text-[28px]">
            استودیو موتورها
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            موتورهای واقعی در مرورگر: تشخیص {faNum(18)} بانک ایران، Luhn شتاب، شبا ISO-7064،
            کد ملی، عدد به حروف فارسی، پاک‌ساز نیم‌فاصله و ممیزی کد RTL.
          </p>
        </div>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "fintech", label: "فین‌تک ایران" },
            { value: "rtl", label: "ممیزی RTL" },
            { value: "shaders", label: "شیدر" },
          ]}
        />
      </header>

      {tab === "fintech" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Panel
              title="کارت بانک: تشخیص + اعتبارسنجی"
              subtitle="پیش‌شماره واقعی شتاب و الگوریتم Luhn"
              actions={
                <Badge tone={luhnOk ? "success" : "danger"}>
                  {luhnOk ? "شماره معتبر" : "شماره نامعتبر"}
                </Badge>
              }
            >
              <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#141418] to-[#0A0A0C] p-4">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[9.5px] tracking-[0.18em] text-zinc-500">SHETAB · RTL</span>
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
                  className="mt-6 w-full bg-transparent font-mono text-[19px] tracking-[0.12em] text-zinc-100 outline-none placeholder:text-zinc-700"
                />
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-[8.5px] text-zinc-600">شماره فارسی</div>
                    <div className="font-mono text-[11px] text-zinc-300">{formatCardNumberFa(card)}</div>
                  </div>
                  <div className="h-6 w-9 rounded bg-gradient-to-br from-[color:var(--accent)]/70 to-transparent" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2.5">
                  <div className="text-[9.5px] text-zinc-500">شبا (ISO 7064 mod 97-10)</div>
                  <div className="mt-1 break-all font-mono text-[11px] text-teal-300" dir="ltr">
                    {sheba || "—"}
                  </div>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2.5">
                  <div className="text-[9.5px] text-zinc-500">پیش‌شماره‌های شناسایی‌شده</div>
                  <div className="mt-1 font-mono text-[11px] text-zinc-300" dir="ltr">
                    {bank.bins.slice(0, 4).join(" · ")}
                  </div>
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Panel title="کد ملی" subtitle="رقابت با الگوریتم رسمی + شهر">
                <input
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value)}
                  dir="ltr"
                  maxLength={12}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 font-mono text-[15px] tracking-wider text-zinc-100 outline-none focus:border-[color:var(--accent)]/50"
                />
                <div
                  className={cn(
                    "mt-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px]",
                    nc.valid
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/25 bg-rose-500/10 text-rose-300"
                  )}
                >
                  {nc.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {nc.valid ? `معتبر — ${nc.cityFa}` : "کد ملی نامعتبر است"}
                </div>
              </Panel>

              <Panel title="عدد به حروف فارسی">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 font-mono text-[15px] text-zinc-100 outline-none focus:border-[color:var(--accent)]/50"
                />
                <div className="mt-2 min-h-[52px] rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-[13px] leading-relaxed text-zinc-100">
                  {words || "—"}
                </div>
                {words && <CopyButton text={words} label="کپی" compact className="mt-2 w-full justify-center" />}
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
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2.5 text-[12px] leading-relaxed text-zinc-300 outline-none focus:border-[color:var(--accent)]/50"
              />
              <div className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-[12.5px] leading-relaxed text-zinc-100">
                {lint.cleaned}
              </div>
              <CopyButton text={lint.cleaned} label="کپی متن پاک" compact className="mt-2 w-full justify-center" />
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel
              title={`${faNum(IRANIAN_BANKS.length)} بانک و مؤسسه`}
              subtitle="روی هر بانک بزنید تا نمونه کارتش بارگذاری شود"
            >
              <input
                value={bankQuery}
                onChange={(e) => setBankQuery(e.target.value)}
                placeholder="جستجوی بانک یا پیش‌شماره…"
                className="mb-2 w-full rounded-lg border border-white/[0.07] bg-black/40 px-2 py-1.5 text-[11px] text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-[color:var(--accent)]/40"
              />
              <div className="grid max-h-[430px] grid-cols-2 gap-1.5 overflow-y-auto pe-1">
                {banks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => loadBankSample(b.bins[0] ?? "")}
                    className={cn(
                      "rounded-lg border p-2 text-start transition-colors",
                      bank.id === b.id
                        ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.08]"
                        : "border-white/[0.06] hover:border-white/20"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: b.accentHex }} />
                      <span className="truncate text-[10.5px] text-zinc-200">{b.nameFa}</span>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[8.5px] text-zinc-600" dir="ltr">
                      {b.bins.slice(0, 2).join(", ")}
                    </span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel tone="inset" title="کد استفاده">
              <CodeBlock
                code={`import { detectIranianBank, generateShebaFromCard } from "@/engines/persianEngines";

const bank = detectIranianBank("${card}");
const sheba = generateShebaFromCard("${card}");
// ${bank.nameFa} · ${sheba || "—"}`}
                language="ts"
                maxLines={8}
                filename="fintech.ts"
              />
            </Panel>
          </div>
        </div>
      )}

      {tab === "rtl" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel
              title="ممیزی زنده کد"
              subtitle="کلاس‌های فیزیکی، letter-spacing فارسی، تداخل transition، ارقام لاتین"
              actions={
                <Badge tone={audit.issues.length === 0 ? "success" : audit.issues.length > 2 ? "danger" : "warn"}>
                  {faNum(audit.issues.length)} یافته
                </Badge>
              }
            >
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                dir="ltr"
                spellCheck={false}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-300 outline-none focus:border-[color:var(--accent)]/50"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCode(DEMO_CODE)}
                  className="flex-1 rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
                >
                  نمونه باگ‌دار
                </button>
                <button
                  onClick={() => setCode("")}
                  className="flex-1 rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
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
                  value={auditTab.severity}
                  onChange={(v) => setAuditTab({ severity: v })}
                  options={[
                    { value: "all", label: "همه" },
                    { value: "critical", label: "بحرانی" },
                  ]}
                />
              }
            >
              <div className="max-h-[420px] space-y-2 overflow-y-auto p-3">
                {issues.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-14 text-center">
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                    <p className="text-[12px] text-zinc-300">موردی پیدا نشد</p>
                    <p className="text-[10.5px] text-zinc-600">کد شما با قواعد RTL و موشن سازگار است.</p>
                  </div>
                )}
                {issues.map((issue, i) => (
                  <div key={i} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          issue.severity === "critical" ? "bg-rose-400" : "bg-amber-400"
                        )}
                      />
                      <span className="text-[11.5px] font-medium text-zinc-200">{issue.titleFa}</span>
                      <Badge className="ms-auto" tone={issue.severity === "critical" ? "danger" : "warn"}>
                        {issue.severity === "critical" ? "بحرانی" : "هشدار"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-zinc-500">{issue.fixFa}</p>
                    {issue.match && (
                      <p className="mt-1 truncate rounded bg-black/40 px-1.5 py-1 font-mono text-[10px] text-rose-300/80" dir="ltr">
                        {issue.match}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="قواعد موتور">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Wand2, t: "کلاس‌های فیزیکی", d: "ml/mr/pl/pr/left/right باید ms/me/ps/pe/start/end شوند" },
                { icon: Hash, t: "ارقام لاتین", d: "در متن فارسی باید ارقام فارسی به‌کار رود" },
                { icon: AlertTriangle, t: "letter-spacing", d: "tracking روی متن فارسی اتصال حروف را می‌شکند" },
                { icon: SparklesIcon, t: "transition-all", d: "روی motion.* باعث jumping و افت فریم می‌شود" },
                { icon: CreditCard, t: "Luhn شتاب", d: "اعتبارسنجی پیش از ارسال به درگاه" },
                { icon: Fingerprint, t: "کد ملی", d: "کنترل رقم کنترلی و استخراج شهر" },
              ].map((r) => (
                <div key={r.t} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-200">
                    <r.icon className="h-3 w-3 text-[color:var(--accent)]" />
                    {r.t}
                  </div>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-zinc-500">{r.d}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === "shaders" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
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
                height={430}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-white/[0.06] p-3 sm:grid-cols-2">
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
                <span className="mb-1.5 block text-[11px] text-zinc-300">پالت</span>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(ACCENT_PALETTES) as (keyof typeof ACCENT_PALETTES)[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setAccentName(k)}
                      className={cn(
                        "flex items-center gap-1 rounded-md border px-1.5 py-1 text-[10px]",
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

          <div className="space-y-4">
            <Panel title="کد استفاده">
              <CodeBlock code={shaderSnippet} language="tsx" maxLines={12} filename="shader.tsx" />
            </Panel>
            <Panel tone="inset" title="عملکرد">
              <p className="text-[11px] leading-relaxed text-zinc-400">
                هر شیدر با <code className="font-mono text-[10.5px] text-teal-300">IntersectionObserver</code> و
                رویداد <code className="font-mono text-[10.5px] text-teal-300">visibilitychange</code> متوقف می‌شود؛
                ضریب پیکسل روی ۲ محدود است.
              </p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = Wand2;

export default EnginesStudio;
