import React, { useEffect, useMemo, useState } from "react";
import { Brain, Database, Cpu, Sparkles, FileJson2, Gauge } from "lucide-react";
import { ALL_SKILLS_MANIFEST } from "../data/skillsManifest";
import { ALL_AI_TRAINING_FILES } from "../data/engineFilesManifest";
import { PERSIAN_FONT_CATALOG } from "../data/persianFontsCatalog";
import { loadAsset, usePersisted } from "../lib/store";
import {
  Badge,
  CodeBlock,
  CopyButton,
  Panel,
  Segmented,
  Slider,
  Spinner,
  cn,
} from "../ui/kit";
import { Markdown } from "../ui/Markdown";
import { soundEngine } from "../engines/soundEngine";

interface Pair {
  registry: string;
  component: string;
  features: string[];
  user: string;
  assistant: string;
  system: string;
}

interface DatasetFile {
  total: number;
  pairs: Pair[];
}

interface TuningSettings {
  baseModel: string;
  rank: number;
  alpha: number;
  lr: number;
  epochs: number;
  seqLen: number;
  dropout: number;
  batch: number;
}

const DEFAULT_TUNING: TuningSettings = {
  baseModel: "Qwen/Qwen2.5-Coder-7B-Instruct",
  rank: 16,
  alpha: 32,
  lr: 2e-4,
  epochs: 3,
  seqLen: 2048,
  dropout: 0.05,
  batch: 2,
};

const MODELS = [
  "Qwen/Qwen2.5-Coder-7B-Instruct",
  "Qwen/Qwen2.5-Coder-1.5B-Instruct",
  "deepseek-ai/deepseek-coder-6.7b-instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
];

export const AiStudio: React.FC = () => {
  const [tab, setTab] = useState<"prompt" | "dataset" | "tuning">("prompt");
  const [dataset, setDataset] = useState<DatasetFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [pairIdx, setPairIdx] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tuning, setTuning] = usePersisted<TuningSettings>("studio-ai", DEFAULT_TUNING);
  const [promptKind, setPromptKind] = useState("kinetic");
  const [promptFont, setPromptFont] = useState("hasti");
  const [promptDetail, setPromptDetail] = useState(3);

  useEffect(() => {
    if (tab !== "dataset" || dataset) return;
    setLoading(true);
    Promise.all([
      loadAsset<DatasetFile>("/ai/dataset.json"),
      loadAsset<string>("/ai/system-prompt.md").catch(() => ""),
    ])
      .then(([d, sp]) => {
        setDataset(d);
        setSystemPrompt(sp);
      })
      .finally(() => setLoading(false));
  }, [tab, dataset]);

  const font = PERSIAN_FONT_CATALOG.find((f) => f.id === promptFont) ?? PERSIAN_FONT_CATALOG[0];

  const prompt = useMemo(() => {
    const kinds: Record<string, string> = {
      kinetic: "تایپوگرافی جنبشی فارسی با نمایش واژه‌به‌واژه",
      card: "کارت سه‌بعدی فین‌تک با شیدر هولوگرافیک",
      dock: "داک مغناطیسی RTL با فنر طبیعی",
      table: "جدول داده فارسی با اعداد tabular و مرتب‌سازی",
      hero: "هیرو اسکرول‌محور با شیدر WebGL",
    };
    const skill = ALL_SKILLS_MANIFEST.find((s) => s.slug.includes("motion")) ?? ALL_SKILLS_MANIFEST[0];
    return `# نقش
تو یک مهندس ارشد رابط کاربری فارسی (RTL-first) و متخصص موشن ۶۰ فریم هستی.
خروجی فقط کد TypeScript + React 18 + Tailwind v4 + framer-motion باشد.

# درخواست
${kinds[promptKind]}

# قیدهای تایپوگرافی
- فونت: ${font.nameFa} (${font.nameEn}) — line-height ${font.recommendedLineHeight ?? 1.8}
- هرگز letter-spacing مثبت روی متن فارسی نگذار.
- اعداد و مبالغ با ارقام فارسی و ویژگی "ss01".
- شکستن واژه‌ها فقط با split(/\\s+/).split("") هرگز.

# قیدهای موشن
- فیزیک فنر: stiffness: 260, damping: 22, mass: 0.9
- انیمیشن‌های پیوسته با useMotionValue/useSpring خارج از چرخه رندر.
- محور x را با جهت صفحه قرینه کن (RTL mirror).
- بدون transition-all روی motion.* .

# قیدهای دسترس‌پذیری
- احترام به prefers-reduced-motion.
- تمام کنترل‌ها با aria-label فارسی.

# استاندارد مرجع
${skill.title} — ${skill.summary.slice(0, 140)}

# سطح جزئیات: ${["حداقلی", "متوسط", "کامل", "استاندارد تولید"][promptDetail - 1]}
${promptDetail >= 3 ? "- شامل تست‌های واحد، حالت‌های خطا و بارگذاری تنبل." : ""}`;
  }, [promptKind, font, promptDetail]);

  const pythonSnippet = `from datasets import load_dataset
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

BASE = "${tuning.baseModel}"

bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(BASE, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    BASE, quantization_config=bnb, device_map="auto", trust_remote_code=True
)

lora = LoraConfig(
    r=${tuning.rank},
    lora_alpha=${tuning.alpha},
    lora_dropout=${tuning.dropout},
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)
model = get_peft_model(model, lora)

ds = load_dataset("json", data_files="rtl_motion_dataset.jsonl", split="train")
# max_seq_length=${tuning.seqLen} · epochs=${tuning.epochs} · lr=${tuning.lr} · batch=${tuning.batch}
`;

  const currentPair = dataset?.pairs[pairIdx];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <Brain className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">AI STUDIO</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            استودیو هوش مصنوعی و دیتاست
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            پرامپت‌ساز تخصصی RTL، مرورگر دیتاست QLoRA و پیکربندی آموزش مدل اختصاصی —
            همه از دارایی واقعی مخزن.
          </p>
        </div>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: "prompt", label: "پرامپت‌ساز" },
            { value: "dataset", label: "دیتاست" },
            { value: "tuning", label: "آموزش QLoRA" },
          ]}
        />
      </header>

      {tab === "prompt" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Panel title="سازنده پرامپت">
            <div className="space-y-3">
              {[
                {
                  label: "نوع کامپوننت",
                  value: promptKind,
                  set: setPromptKind,
                  options: [
                    { v: "kinetic", l: "تایپوگرافی جنبشی" },
                    { v: "card", l: "کارت فین‌تک" },
                    { v: "dock", l: "داک مغناطیسی" },
                    { v: "table", l: "جدول داده" },
                    { v: "hero", l: "هیرو WebGL" },
                  ],
                },
              ].map((g) => (
                <div key={g.label}>
                  <span className="mb-1 block text-[11px] text-zinc-400">{g.label}</span>
                  <div className="flex flex-wrap gap-1">
                    {g.options.map((o) => (
                      <button
                        key={o.v}
                        onClick={() => g.set(o.v)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-[10.5px]",
                          g.value === o.v
                            ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                            : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                        )}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <span className="mb-1 block text-[11px] text-zinc-400">فونت</span>
                <select
                  value={promptFont}
                  onChange={(e) => setPromptFont(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 text-[11.5px] text-zinc-200 outline-none"
                >
                  {PERSIAN_FONT_CATALOG.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#111]">
                      {f.nameFa}
                    </option>
                  ))}
                </select>
              </div>

              <Slider
                label="سطح جزئیات"
                value={promptDetail}
                min={1}
                max={4}
                onChange={setPromptDetail}
                format={(v) => ["حداقلی", "متوسط", "کامل", "تولیدی"][v - 1]}
              />

              <CopyButton text={prompt} label="کپی پرامپت" className="w-full justify-center" />
            </div>
          </Panel>

          <Panel
            title="پرامپت تولیدشده"
            subtitle="ساختار نقش + قید + استاندارد مرجع"
            actions={<Badge>{prompt.length} کاراکتر</Badge>}
          >
            <CodeBlock code={prompt} language="md" maxLines={34} filename="prompt.md" />
          </Panel>
        </div>
      )}

      {tab === "dataset" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <Panel title="آمار دیتاست">
              {loading || !dataset ? (
                <Spinner className="py-8" />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: "جفت آموزشی", v: dataset.total },
                    { k: "رجیستری", v: new Set(dataset.pairs.map((p) => p.registry)).size },
                    { k: "میانگین توکن", v: Math.round(dataset.pairs.reduce((a, p) => a + p.assistant.length / 3.4, 0) / Math.max(dataset.pairs.length, 1)) },
                    { k: "سیستم‌پرامپت", v: `${(systemPrompt.length / 1024).toFixed(1)}K` },
                  ].map((x) => (
                    <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                      <div className="text-[9.5px] text-zinc-500">{x.k}</div>
                      <div className="font-mono text-[15px] text-zinc-100">
                        {typeof x.v === "number" ? x.v.toLocaleString("fa-IR") : x.v}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="جفت‌ها" padded={false}>
              <div className="max-h-[420px] overflow-y-auto p-1.5">
                {dataset?.pairs.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPairIdx(i);
                      soundEngine.playTick(1);
                    }}
                    className={cn(
                      "block w-full truncate rounded-lg px-2 py-1.5 text-start font-mono text-[10.5px]",
                      pairIdx === i ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/[0.035]"
                    )}
                    dir="ltr"
                  >
                    {i + 1}. {p.registry}/{p.component}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="فایل‌های خط آموزش" padded={false}>
              <div className="max-h-40 overflow-y-auto p-2">
                {ALL_AI_TRAINING_FILES.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500" dir="ltr">
                    <FileJson2 className="h-3 w-3 shrink-0 text-zinc-700" />
                    {f}
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel
            title={currentPair ? `${currentPair.registry}/${currentPair.component}` : "جفت آموزشی"}
            subtitle="داده واقعی از rtl_motion_dataset_sample.jsonl"
            actions={
              currentPair && (
                <CopyButton
                  text={JSON.stringify(currentPair, null, 2)}
                  label="کپی JSON"
                  compact
                />
              )
            }
          >
            {loading || !currentPair ? (
              <Spinner className="py-20" />
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <Sparkles className="h-3 w-3" /> پرسش کاربر
                  </div>
                  <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5 text-[11.5px] leading-relaxed text-zinc-300">
                    {currentPair.user}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <Cpu className="h-3 w-3" /> پاسخ مدل
                  </div>
                  <CodeBlock code={currentPair.assistant} language="tsx" maxLines={22} filename="answer.tsx" />
                </div>
                {currentPair.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentPair.features.map((f) => (
                      <Badge key={f} tone="accent">
                        {f}
                      </Badge>
                    ))}
                  </div>
                )}
                {systemPrompt && (
                  <details className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2">
                    <summary className="cursor-pointer text-[11px] text-zinc-400">
                      مشاهده پرامپت سیستمی مدل
                    </summary>
                    <div className="mt-2 max-h-64 overflow-y-auto">
                      <Markdown source={systemPrompt} />
                    </div>
                  </details>
                )}
              </div>
            )}
          </Panel>
        </div>
      )}

      {tab === "tuning" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Panel title="پیکربندی QLoRA">
            <div className="space-y-3.5">
              <div>
                <span className="mb-1 block text-[11px] text-zinc-400">مدل پایه</span>
                <select
                  value={tuning.baseModel}
                  onChange={(e) => setTuning({ baseModel: e.target.value })}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 font-mono text-[10.5px] text-zinc-200 outline-none"
                  dir="ltr"
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m} className="bg-[#111]">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <Slider label="رتبه LoRA (r)" value={tuning.rank} min={4} max={64} step={4} onChange={(v) => setTuning({ rank: v })} />
              <Slider label="آلفا" value={tuning.alpha} min={8} max={128} step={8} onChange={(v) => setTuning({ alpha: v })} />
              <Slider label="Dropout" value={tuning.dropout} min={0} max={0.2} step={0.01} onChange={(v) => setTuning({ dropout: v })} format={(v) => v.toFixed(2)} />
              <Slider label="نرخ یادگیری" value={tuning.lr} min={0.0001} max={0.001} step={0.0001} onChange={(v) => setTuning({ lr: v })} format={(v) => v.toExponential(1)} />
              <Slider label="دوره‌ها" value={tuning.epochs} min={1} max={8} onChange={(v) => setTuning({ epochs: v })} />
              <Slider label="طول دنباله" value={tuning.seqLen} min={512} max={4096} step={256} onChange={(v) => setTuning({ seqLen: v })} />
              <Slider label="Batch" value={tuning.batch} min={1} max={8} onChange={(v) => setTuning({ batch: v })} />
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel
              title="اسکریپت آموزش"
              subtitle="مقادیر پیکربندی شما مستقیماً داخل کد قرار می‌گیرد"
              actions={<CopyButton text={pythonSnippet} label="کپی پایتون" compact />}
            >
              <CodeBlock code={pythonSnippet} language="python" maxLines={30} filename="train_qlora.py" showCopy={false} />
            </Panel>

            <Panel title="برآورد منابع" subtitle="تخمین تجربی برای ۴بیت + LoRA">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { k: "VRAM تقریبی", v: tuning.baseModel.includes("7B") ? "~9GB" : tuning.baseModel.includes("1.5B") ? "~4GB" : "~11GB", icon: Gauge },
                  { k: "پارامتر آموزش‌پذیر", v: `${((tuning.rank * 4 * 4096 * 32) / 1e6).toFixed(1)}M`, icon: Cpu },
                  { k: "گام تقریبی", v: `${Math.round((40 / tuning.batch) * tuning.epochs)}`, icon: Database },
                  { k: "حافظه دیتاست", v: "0.33MB", icon: FileJson2 },
                ].map((x) => (
                  <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <div className="flex items-center gap-1 text-[9.5px] text-zinc-500">
                      <x.icon className="h-3 w-3" />
                      {x.k}
                    </div>
                    <div className="mt-0.5 font-mono text-[14px] text-zinc-100">{x.v}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiStudio;
