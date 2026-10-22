import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Cpu,
  Hash,
  Landmark,
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
  Panel,
  Segmented,
  Slider,
  cn,
} from "../ui/kit";
import { EngineShader } from "../components/EngineShaders";
import { soundEngine } from "../engines/soundEngine";

type EngineTab = "fintech" | "rtl" | "shaders";

const DEMO_CODE = `export function Card({ title }) {
  return (
    <div className="ml-4 pl-6 text-left" dir="ltr">
      <h3 className="tracking-widest">کارت بانکی</h3>
      <motion.div transition={{ duration: 0.2 }} className="transition-all" />
    </div>
  );
}`;

export const EnginesStudio: React.FC = () => {
  const [tab, setTab] = useState<EngineTab>("fintech");
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

  const bank = useMemo(() => detectIranianBank(card), [card]);
  const luhnOk = useMemo(() => validateShetabLuhn(card), [card]);
  const sheba = useMemo(() => generateShebaFromCard(card), [card]);
  const nc = useMemo(() => validateIranianNationalCode(nationalCode), [nationalCode]);
  const words = useMemo(() => {
    const numeric = amount.replace(/[۰-۹]/g, (d) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    );
    return numberToPersianWords(numeric);
  }, [amount]);
  const lint = useMemo(() => cleanupPersianText(dirtyText), [dirtyText]);
  const audit = useMemo(() => auditRtlMotionCode(code), [code]);

  const groupedBanks = IRANIAN_BANKS;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <Cpu className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">ENGINES STUDIO</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            استودیو موتورها
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            موتورهای واقعی و قابل استفاده: تشخیص ۱۸ بانک ایران، اعتبارسنجی شبا و کد ملی،
            تبدیل عدد به حروف فارسی، پاک‌ساز نیم‌فاصله و ممیز RTL — همه در مرورگر و بدون
            سرور.
          </p>
        </div>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: "fintech", label: "فین‌تک ایران" },
            { value: "rtl", label: "ممیزی RTL" },
            { value: "shaders", label: "شیدرها" },
          ]}
        />
      </header>

      {tab === "fintech" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Panel
              title="تشخیص بانک و اعتبارسنجی کارت"
              subtitle="پیش‌شماره‌های واقعی شتاب + الگوریتم Luhn"
              actions={<Badge tone={luhnOk ? "success" : "danger"}>{luhnOk ? "معتبر" : "نامعتبر"}</Badge>}
            >
              <input
                value={card}
                onChange={(e) => setCard(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2.5 text-center font-mono text-[16px] tracking-[0.14em] text-zinc-100 outline-none focus:border-[color:var(--accent)]/50"
                placeholder="6104 3377 1234 5678"
                maxLength={25}
              />
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-bold text-white"
                    style={{ background: bank.accentHex }}
                  >
                    {bank.nameFa.slice(0, 1)}
                  </span>
                  <div>
                    <div className="text-[12px] font-medium text-zinc-100">{bank.nameFa}</div>
                    <div className="font-mono text-[10px] text-zinc-500" dir="ltr">
                      {bank.bins.slice(0, 3).join(" · ")}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="font-mono text-[13px] text-zinc-200" dir="rtl">
                    {formatCardNumberFa(card)}
                  </div>
                  <div className="text-[9.5px] text-zinc-600">قالب‌بندی فارسی</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2">
                  <div className="text-[9.5px] text-zinc-500">شبا تولیدشده (ISO-7064)</div>
                  <div className="mt-1 break-all font-mono text-[11px] text-teal-300" dir="ltr">
                    {sheba || "—"}
                  </div>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2">
                  <div className="text-[9.5px] text-zinc-500">رنگ برند</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded" style={{ background: bank.accentHex }} />
                    <span className="font-mono text-[11px] text-zinc-300" dir="ltr">
                      {bank.accentHex}
                    </span>
                  </div>
                </div>
              </div>
              <CopyButton text={sheetCode(card, sheba)} label="کپی کد اعتبارسنجی" className="mt-3 w-full justify-center" />
            </Panel>

            <Panel title="کد ملی و عدد به حروف">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] text-zinc-400">کد ملی</label>
                  <div className="flex items-center gap-2">
                    <input
                      value={nationalCode}
                      onChange={(e) => setNationalCode(e.target.value)}
                      dir="ltr"
                      maxLength={12}
                      className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 font-mono text-[13px] text-zinc-100 outline-none focus:border-[color:var(--accent)]/50"
                    />
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10.5px] whitespace-nowrap",
                        nc.valid
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      )}
                    >
                      {nc.valid ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {nc.valid ? nc.cityFa : "نامعتبر"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] text-zinc-400">مبلغ (تومان)</label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 font-mono text-[13px] text-zinc-100 outline-none focus:border-[color:var(--accent)]/50"
                  />
                  <div className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="text-[9.5px] text-zinc-500">به حروف فارسی</div>
                    <div className="mt-1 text-[13px] leading-relaxed text-zinc-100">
                      {words || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="۱۸ بانک و مؤسسه ایران" subtitle="پیش‌شماره‌های واقعی کارت">
              <div className="grid max-h-[300px] grid-cols-2 gap-1.5 overflow-y-auto pe-1 sm:grid-cols-3">
                {groupedBanks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCard(`${b.bins[0]}${"0".repeat(16 - b.bins[0].length)}`);
                      soundEngine.playTick(1.1);
                    }}
                    className={cn(
                      "rounded-lg border p-2 text-start transition-colors",
                      bank.id === b.id
                        ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.08]"
                        : "border-white/[0.06] hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: b.accentHex }} />
                      <span className="truncate text-[10.5px] text-zinc-200">{b.nameFa}</span>
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[9px] text-zinc-600" dir="ltr">
                      {b.bins.slice(0, 2).join(", ")}
                    </div>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel
              title="پاک‌ساز متن فارسی (fa_lint)"
              subtitle="نیم‌فاصله، ی/ک عربی، فاصله‌های تکراری"
              actions={<Badge tone="accent">{lint.fixesCount} اصلاح</Badge>}
            >
              <textarea
                value={dirtyText}
                onChange={(e) => setDirtyText(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2.5 text-[12px] leading-relaxed text-zinc-300 outline-none focus:border-[color:var(--accent)]/50"
              />
              <div className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-[12px] leading-relaxed text-zinc-100">
                {lint.cleaned}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {describeFixes(dirtyText).map((c, i) => (
                  <Badge key={i}>{c}</Badge>
                ))}
              </div>
              <CopyButton text={lint.cleaned} label="کپی متن پاک" className="mt-2 w-full justify-center" />
            </Panel>
          </div>
        </div>
      )}

      {tab === "rtl" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel
            title="ممیزی زنده کد RTL و موشن"
            subtitle="کلاس‌های فیزیکی، letter-spacing فارسی، تداخل transition و انیمیشن"
            actions={
              <Badge tone={audit.issues.length === 0 ? "success" : audit.issues.length > 2 ? "danger" : "warn"}>
                {audit.issues.length} مورد
              </Badge>
            }
          >
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              dir="ltr"
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-300 outline-none focus:border-[color:var(--accent)]/50"
            />
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => setCode(DEMO_CODE)}
                className="flex-1 rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
              >
                نمونه باگ‌دار
              </button>
              <button
                onClick={() => setCode(audit.issues.length ? "" : DEMO_CODE)}
                className="flex-1 rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
              >
                پاک کردن
              </button>
            </div>
          </Panel>

          <Panel title="یافته‌ها" subtitle="هر مورد با پیشنهاد اصلاح" padded={false}>
            <div className="max-h-[440px] space-y-2 overflow-y-auto p-3">
              {audit.issues.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  <p className="text-[12px] text-zinc-300">هیچ باگی پیدا نشد</p>
                  <p className="text-[10.5px] text-zinc-600">
                    کد از قواعد RTL و موشن ۶۰ فریم پیروی می‌کند.
                  </p>
                </div>
              )}
              {audit.issues.map((issue, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5"
                >
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
                    <p className="mt-1 font-mono text-[10px] text-rose-300/70" dir="ltr">
                      {issue.match}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="lg:col-span-2" title="قواعدی که موتور بررسی می‌کند">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Wand2, t: "کلاس‌های فیزیکی", d: "ml/mr/pl/pr/left/right → ms/me/ps/pe/start/end" },
                { icon: Hash, t: "ارقام فارسی", d: "تشخیص ارقام لاتین در متون و مبالغ فارسی" },
                { icon: AlertTriangle, t: "letter-spacing فارسی", d: "tracking-* روی متن فارسی حروف را می‌شکند" },
                { icon: Sparkles, t: "تداخل transition", d: "transition-all روی motion.div باعث پرش فریم می‌شود" },
                { icon: CreditCard, t: "حسابرسی Luhn", d: "اعتبارسنجی شماره کارت شتاب پیش از ارسال" },
                { icon: Landmark, t: "نیم‌فاصله", d: "می‌خواهم → میخواهم، نیم‌فاصله‌های گم‌شده" },
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
            subtitle="۶۰ فریم، متوقف‌شونده خارج از دید، سازگار با دستگاه‌های ضعیف"
            actions={
              <Segmented
                size="sm"
                value={shaderMode}
                onChange={setShaderMode}
                options={[
                  { value: "matrix", label: "ماتریس فارسی" },
                  { value: "gravity", label: "گرانش" },
                  { value: "aurora", label: "شفق" },
                ]}
              />
            }
          >
            <EngineShader
              mode={shaderMode}
              speed={shaderSpeed}
              accent={ACCENT_PALETTES[accentName]?.hex ?? "#E8B33A"}
              height={420}
            />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                        accentName === k
                          ? "border-white/30 text-white"
                          : "border-white/[0.07] text-zinc-500"
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: ACCENT_PALETTES[k].hex }}
                      />
                      {ACCENT_PALETTES[k].labelFa}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel title="کد استفاده">
              <CodeBlock
                code={`import { EngineShader } from "@/components/EngineShaders";

<EngineShader
  mode="${shaderMode}"
  speed={${shaderSpeed.toFixed(1)}}
  accent="${ACCENT_PALETTES[accentName]?.hex}"
  height={420}
/>`}
                language="tsx"
                maxLines={12}
                filename="shader.tsx"
              />
            </Panel>
            <Panel tone="inset" title="نکته عملکرد">
              <p className="text-[11.5px] leading-relaxed text-zinc-400">
                هر شیدر با <code className="font-mono text-[10.5px] text-teal-300">IntersectionObserver</code>{" "}
                خاموش می‌شود و در حالت پنهان‌شدن تب هم متوقف می‌گردد. ضریب پیکسل حداکثر ۲
                است تا روی نمایشگرهای Retina هم فریم حفظ شود.
              </p>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
};

function describeFixes(raw: string): string[] {
  const out: string[] = [];
  if (/[يك]/.test(raw)) out.push("ي/ك عربی → ی/ک فارسی");
  if (/(^|\s)\S+\s{2,}\S+/.test(raw)) out.push("فاصله‌های تکراری حذف شد");
  if (/\d/.test(raw)) out.push("ارقام لاتین → فارسی");
  if (/(^|\s)ن?می\s+/.test(raw)) out.push("نیم‌فاصله «می» اضافه شد");
  if (/(^|\s)\S+\s+های?\b/.test(raw)) out.push("نیم‌فاصله «ها» اصلاح شد");
  return out.length ? out : ["متنی برای اصلاح یافت نشد"];
}

function sheetCode(card: string, sheba: string) {
  return `// RTL Motion Lab — fintech validators (real output for current input)
const card = ${JSON.stringify(card)};
const bank = detectIranianBank(card);   // ${detectIranianBank(card).nameFa}
const luhnOk = validateShetabLuhn(card); // ${validateShetabLuhn(card)}
const sheba = "${sheba}";               // ISO-7064 mod-97`;
}

export default EnginesStudio;
