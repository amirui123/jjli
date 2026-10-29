import React, { useEffect, useMemo, useState } from "react";
import { Brain, Cpu, Database, FileJson2, Gauge, Sparkles } from "lucide-react";
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
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { saveKit, saveText } from "../lib/download";
import { Markdown } from "../ui/Markdown";
import { faNum } from "../lib/format";
import { soundEngine } from "../engines/soundEngine";
import { AiPipeline } from "../components/AiPipeline";
import { AiTour } from "../components/AiTour";

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
  quantMode: "4bit-nf4" | "8bit-int8" | "bf16";
}

type Tab = "prompt" | "dataset" | "tuning";

const DEFAULT_TUNING: TuningSettings = {
  baseModel: "Qwen/Qwen2.5-Coder-7B-Instruct",
  rank: 16,
  alpha: 32,
  lr: 2e-4,
  epochs: 3,
  seqLen: 2048,
  dropout: 0.05,
  batch: 2,
  quantMode: "4bit-nf4",
};

const MODELS = [
  "Qwen/Qwen2.5-Coder-7B-Instruct",
  "Qwen/Qwen2.5-Coder-1.5B-Instruct",
  "deepseek-ai/deepseek-coder-6.7b-instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
];

const PROMPT_KINDS = [
  { id: "kinetic", label: "تایپوگرافی جنبشی", hint: "نمایش واژه‌به‌واژه با فنر" },
  { id: "card", label: "کارت فین‌تک", hint: "شیدر هولوگرافیک و لبه نورانی" },
  { id: "dock", label: "داک مغناطیسی", hint: "فنر طبیعی و بزرگ‌نمایی هاور" },
  { id: "table", label: "جدول داده", hint: "اعداد tabular و مرتب‌سازی" },
  { id: "hero", label: "هیرو WebGL", hint: "شیدر اسکرول‌محور" },
];

export const AiStudio: React.FC = () => {
  const [tab, setTab] = useState<Tab>("prompt");
  const [dataset, setDataset] = useState<DatasetFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [pairIdx, setPairIdx] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tuning, setTuning] = usePersisted<TuningSettings>("studio-ai", DEFAULT_TUNING);
  const [promptKind, setPromptKind] = useState("kinetic");
  const [promptFont, setPromptFont] = useState("hasti");
  const [promptDetail, setPromptDetail] = useState(3);
  const [targetIde, setTargetIde] = useState("Claude 3.7 / 4 Sonnet");
  const [aestheticPersona, setAestheticPersona] = useState("Obsidian Luxury + Persian Nastaliq");
  const [customTask, setCustomTask] = useState("");
  const [enforceIranFintech, setEnforceIranFintech] = useState(true);
  const [enforceZeroCls, setEnforceZeroCls] = useState(true);
  const [enforceOledSafe, setEnforceOledSafe] = useState(true);

  useEffect(() => {
    if (dataset) return;
    let alive = true;
    setLoading(true);
    setLoadError(false);
    Promise.all([
      loadAsset<DatasetFile>("/ai/dataset.json"),
      loadAsset<string>("/ai/system-prompt.md").catch(() => ""),
    ])
      .then(([d, sp]) => {
        if (!alive) return;
        setDataset(d);
        setSystemPrompt(sp);
      })
      .catch(() => alive && setLoadError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [dataset, retry]);

  const font = PERSIAN_FONT_CATALOG.find((f) => f.id === promptFont) ?? PERSIAN_FONT_CATALOG[0];
  const kind = PROMPT_KINDS.find((k) => k.id === promptKind) ?? PROMPT_KINDS[0];

  const prompt = useMemo(() => {
    const skill =
      ALL_SKILLS_MANIFEST.find((s) => s.slug.includes("motion")) ?? ALL_SKILLS_MANIFEST[0];
    const extraRules: string[] = [];
    if (enforceIranFintech) {
      extraRules.push(
        "- پشتیبانی بومی از کارت شتاب (Luhn)، شبا (ISO-7064 Mod-97-10) و تقویم جلالی."
      );
    }
    if (enforceZeroCls) {
      extraRules.push(
        "- کالیبراسیون بدون پرش (@font-face size-adjust: 98%; ascent-override: 90%) و محور نوری GRAD در هاور."
      );
    }
    if (enforceOledSafe) {
      extraRules.push(
        "- کنتراست نوری OKLCH و پس‌زمینه #05060A (منع #000000 برای جلوگیری از OLED Smearing)."
      );
    }

    return `# نقش (${targetIde})
تو یک مهندس ارشد رابط کاربری فارسی (RTL-first) و متخصص موشن ۱۲۰ فریم هستی.
پرسونای بصری: ${aestheticPersona}
خروجی فقط کد TypeScript + React 19 + Tailwind v4 + framer-motion باشد.

# درخواست
${kind.label} — ${kind.hint}${customTask.trim() ? `\nهدف اختصاصی پروژه: ${customTask.trim()}` : ""}

# قیدهای تایپوگرافی
- فونت: ${font.nameFa} (${font.nameEn}) — line-height ${font.recommendedLineHeight ?? 1.8}
- هرگز letter-spacing مثبت روی متن فارسی نگذار.
- اعداد و مبالغ با ارقام فارسی و ویژگی "ss01".
- شکستن واژه‌ها فقط با split(/\\s+/)؛ split("") هرگز.

# قیدهای موشن و معماری
- فیزیک فنر: stiffness 260، damping 22، mass 0.9
- انیمیشن‌های پیوسته با useMotionValue/useSpring خارج از چرخه رندر.
- محور x را با جهت صفحه قرینه کن (RTL mirror).
${extraRules.join("\n")}

# قیدهای دسترس‌پذیری
- احترام به prefers-reduced-motion.
- تمام کنترل‌ها با aria-label فارسی.

# استاندارد مرجع
${skill?.title ?? "—"} — ${(skill?.summary ?? "").slice(0, 140)}

# سطح جزئیات: ${["حداقلی", "متوسط", "کامل", "استاندارد تولید"][promptDetail - 1]}
${promptDetail >= 3 ? "- شامل تست‌های واحد، حالت‌های خطا و بارگذاری تنبل." : ""}`;
  }, [
    kind,
    font,
    promptDetail,
    targetIde,
    aestheticPersona,
    customTask,
    enforceIranFintech,
    enforceZeroCls,
    enforceOledSafe,
  ]);

  const pythonSnippet = `from datasets import load_dataset
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

BASE = "${tuning.baseModel}"
QUANT_MODE = "${tuning.quantMode ?? "4bit-nf4"}"

bnb = BitsAndBytesConfig(
    load_in_4bit=${(tuning.quantMode ?? "4bit-nf4") === "4bit-nf4" ? "True" : "False"},
    load_in_8bit=${tuning.quantMode === "8bit-int8" ? "True" : "False"},
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

  const currentExport =
    tab === "prompt"
      ? prompt
      : tab === "tuning"
        ? pythonSnippet
        : JSON.stringify(currentPair ?? {}, null, 2);
  const currentFileName =
    tab === "prompt" ? "prompt.md" : tab === "tuning" ? "train_qlora.py" : "pair.json";

  const copyExport = () => {
    navigator.clipboard?.writeText(currentExport).catch(() => {});
    soundEngine.playTick(1.2);
  };

  const downloadDatasetKit = () => {
    if (!dataset) return false;
    return saveKit("rtl-motion-dataset", [
      {
        name: "rtl_motion_dataset.jsonl",
        content: dataset.pairs
          .map((p) =>
            JSON.stringify({
              messages: [
                { role: "system", content: p.system },
                { role: "user", content: p.user },
                { role: "assistant", content: p.assistant },
              ],
            })
          )
          .join("\n"),
      },
      { name: "system-prompt.md", content: systemPrompt },
      { name: "train_qlora.py", content: pythonSnippet },
      { name: "prompt.md", content: prompt },
    ]);
  };

  /* ----------------------------------------------------------------- list */

  const list = (
    <StudioList
      title={tab === "prompt" ? "قالب‌ها" : tab === "dataset" ? "جفت‌های داده" : "مدل‌ها"}
      subtitle={
        tab === "dataset"
          ? `${faNum(dataset?.total ?? 0)} جفت آموزشی`
          : tab === "prompt"
            ? `${faNum(PROMPT_KINDS.length)} قالب`
            : `${faNum(MODELS.length)} مدل`
      }
      className="min-h-[360px] desk:min-h-0"
      footer={tab === "dataset" ? "داده واقعی از دیتاست مخزن" : undefined}
    >
      <div className="sticky top-0 z-10 -m-1.5 mb-1.5 bg-[#0D0D10]/95 p-1.5 backdrop-blur">
        <Segmented
          className="w-full"
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { value: "prompt", label: "پرامپت" },
            { value: "dataset", label: "دیتاست" },
            { value: "tuning", label: "QLoRA" },
          ]}
        />
      </div>

      {tab === "prompt" &&
        PROMPT_KINDS.map((k) => (
          <button
            key={k.id}
            onClick={() => {
              setPromptKind(k.id);
              soundEngine.playTick(1);
            }}
            className={cn(
              "mb-0.5 block w-full rounded-lg px-2 py-1.5 text-start transition-colors",
              promptKind === k.id ? "bg-[color:var(--accent)]/10" : "hover:bg-white/[0.04]"
            )}
          >
            <span className="block text-[11px] text-zinc-200">{k.label}</span>
            <span className="mt-0.5 block truncate text-[9.5px] text-zinc-600">{k.hint}</span>
          </button>
        ))}

      {tab === "dataset" &&
        (loading ? (
          <Spinner className="py-12" />
        ) : (
          dataset?.pairs.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setPairIdx(i);
                soundEngine.playTick(1);
              }}
              className={cn(
                "mb-0.5 block w-full truncate rounded-lg px-2 py-1 text-start font-mono text-[9.5px]",
                pairIdx === i
                  ? "bg-white/[0.07] text-white"
                  : "text-zinc-400 hover:bg-white/[0.035]"
              )}
              dir="ltr"
            >
              {i + 1}. {p.registry}/{p.component}
            </button>
          ))
        ))}

      {tab === "tuning" &&
        MODELS.map((m) => (
          <button
            key={m}
            onClick={() => {
              setTuning({ baseModel: m });
              soundEngine.playTick(1);
            }}
            className={cn(
              "mb-0.5 block w-full truncate rounded-lg px-2 py-1.5 text-start font-mono text-[9.5px]",
              tuning.baseModel === m
                ? "bg-white/[0.07] text-white"
                : "text-zinc-400 hover:bg-white/[0.035]"
            )}
            dir="ltr"
          >
            {m.split("/")[1]}
          </button>
        ))}

      {tab === "dataset" && !loading && (
        <div className="mt-2 space-y-1 border-t border-white/[0.06] pt-2">
          {ALL_AI_TRAINING_FILES.map((f) => (
            <div
              key={f}
              className="flex items-center gap-1.5 font-mono text-[8.5px] text-zinc-600"
              dir="ltr"
            >
              <FileJson2 className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{f}</span>
            </div>
          ))}
        </div>
      )}
    </StudioList>
  );

  /* ---------------------------------------------------------------- stage */

  const stage = (
    <div className="space-y-4">
      <AiPipeline
        pairs={dataset?.total ?? null}
        files={ALL_AI_TRAINING_FILES.length}
        rank={tuning.rank}
        systemPromptKb={systemPrompt.length / 1024}
      />

      {tab === "prompt" && (
        <>
          <Panel
            title="پیش‌نمایش پرامپت"
            subtitle="ساختار نقش + قیدهای تایپوگرافی و موشن + استاندارد مرجع"
            actions={
              <>
                <Badge>{faNum(prompt.length)} کاراکتر</Badge>
                <CopyButton text={prompt} label="کپی" compact />
                <DownloadButton
                  compact
                  label=".md"
                  filename="prompt.md"
                  onDownload={() => saveText(prompt, "prompt.md")}
                />
              </>
            }
          >
            <div className="rounded-xl border border-white/[0.06] bg-[#0A0A0C] p-3">
              <div
                className="max-h-[320px] overflow-y-auto whitespace-pre-wrap text-[11.5px] leading-relaxed text-zinc-300"
                style={{ fontFamily: font.family }}
              >
                {prompt}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { k: "قالب", v: kind.label },
                { k: "فونت", v: font.nameFa },
                { k: "سطح", v: ["حداقلی", "متوسط", "کامل", "تولیدی"][promptDetail - 1] },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2"
                >
                  <div className="text-[9.5px] text-zinc-500">{x.k}</div>
                  <div className="mt-0.5 truncate text-[11px] text-zinc-200">{x.v}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="پرامپت سیستمی مدل"
            subtitle="همان فایلی که هنگام آموزش استفاده می‌شود"
            padded={false}
          >
            <div className="max-h-[280px] overflow-y-auto p-3">
              {systemPrompt ? (
                <Markdown source={systemPrompt} />
              ) : loadError ? (
                <div className="py-6 text-center">
                  <p className="text-[11px] text-zinc-500">متن پرامپت سیستمی بارگذاری نشد.</p>
                  <button
                    type="button"
                    onClick={() => setRetry((r) => r + 1)}
                    className="mt-2 rounded-lg border border-white/12 px-3 py-1.5 text-[11px] text-zinc-300"
                  >
                    تلاش دوباره
                  </button>
                </div>
              ) : (
                <Spinner className="py-8" />
              )}
            </div>
          </Panel>
        </>
      )}

      {tab === "dataset" && (
        <>
          <Panel title="آمار دیتاست">
            {loading || !dataset ? (
              <Spinner className="py-8" />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { k: "جفت آموزشی", v: faNum(dataset.total) },
                  { k: "رجیستری", v: faNum(new Set(dataset.pairs.map((p) => p.registry)).size) },
                  {
                    k: "میانگین توکن",
                    v: faNum(
                      Math.round(
                        dataset.pairs.reduce((a, p) => a + p.assistant.length / 3.4, 0) /
                          Math.max(dataset.pairs.length, 1)
                      )
                    ),
                  },
                  { k: "سیستم‌پرامپت", v: `${(systemPrompt.length / 1024).toFixed(1)}K` },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2"
                  >
                    <div className="text-[9.5px] text-zinc-500">{x.k}</div>
                    <div className="font-mono text-[14px] text-zinc-100">{x.v}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title={currentPair ? `${currentPair.registry}/${currentPair.component}` : "جفت آموزشی"}
            subtitle="داده واقعی از rtl_motion_dataset_sample.jsonl"
            actions={
              currentPair && (
                <>
                  <CopyButton text={JSON.stringify(currentPair, null, 2)} label="JSON" compact />
                  <DownloadButton
                    compact
                    label="جفت"
                    filename={`${currentPair.component}.json`}
                    onDownload={() =>
                      saveText(
                        JSON.stringify(currentPair, null, 2),
                        `${currentPair.component}.json`,
                        "application/json"
                      )
                    }
                  />
                </>
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
                  <CodeBlock
                    code={currentPair.assistant}
                    language="tsx"
                    maxLines={20}
                    filename="answer.tsx"
                  />
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
              </div>
            )}
          </Panel>
        </>
      )}

      {tab === "tuning" && (
        <>
          <Panel
            title="اسکریپت آموزش"
            subtitle="مقادیر پیکربندی شما مستقیماً داخل کد قرار می‌گیرد"
            actions={
              <>
                <CopyButton text={pythonSnippet} label="کپی" compact />
                <DownloadButton
                  compact
                  label=".py"
                  filename="train_qlora.py"
                  onDownload={() => saveText(pythonSnippet, "train_qlora.py", "text/x-python")}
                />
              </>
            }
          >
            <CodeBlock
              code={pythonSnippet}
              language="python"
              maxLines={26}
              filename="train_qlora.py"
              showCopy={false}
            />
          </Panel>

          <Panel title="برآورد منابع" subtitle="تخمین تجربی برای ۴بیت + LoRA">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                {
                  k: "VRAM تقریبی",
                  v: tuning.baseModel.includes("7B")
                    ? "~9GB"
                    : tuning.baseModel.includes("1.5B")
                      ? "~4GB"
                      : "~11GB",
                  icon: Gauge,
                },
                {
                  k: "پارامتر آموزش‌پذیر",
                  v: `${((tuning.rank * 4 * 4096 * 32) / 1e6).toFixed(1)}M`,
                  icon: Cpu,
                },
                {
                  k: "گام تقریبی",
                  v: faNum(Math.round((40 / tuning.batch) * tuning.epochs)),
                  icon: Database,
                },
                { k: "حافظه دیتاست", v: "0.33MB", icon: FileJson2 },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"
                >
                  <div className="flex items-center gap-1 text-[9.5px] text-zinc-500">
                    <x.icon className="h-3 w-3" />
                    {x.k}
                  </div>
                  <div className="mt-0.5 font-mono text-[14px] text-zinc-100">{x.v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      <Panel
        title={`خروجی ${tab === "prompt" ? "پرامپت" : tab === "tuning" ? "اسکریپت" : "جفت"}`}
        subtitle="همان فایلی که دانلود می‌کنید"
        actions={
          <DownloadButton
            compact
            variant="solid"
            label="دانلود"
            filename={currentFileName}
            onDownload={() => saveText(currentExport, currentFileName)}
          />
        }
      >
        <CodeBlock
          code={currentExport}
          language="md"
          maxLines={14}
          filename={currentFileName}
          showCopy={false}
        />
      </Panel>
    </div>
  );

  /* ------------------------------------------------------------- settings */

  const settings = (
    <div className="space-y-4">
      {tab === "prompt" && (
        <Panel title="سازنده و شخصی‌سازی پرامپت">
          <div className="space-y-3">
            <div>
              <span className="mb-1 block text-[10.5px] text-zinc-400">نوع کامپوننت</span>
              <div className="flex flex-wrap gap-1">
                {PROMPT_KINDS.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setPromptKind(k.id)}
                    className={cn(
                      "rounded-md border px-1.5 py-1 text-[9.5px]",
                      promptKind === k.id
                        ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                        : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                    )}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-[10.5px] text-zinc-400">
                مدل یا محیط هدف (Target IDE/LLM)
              </span>
              <select
                value={targetIde}
                onChange={(e) => setTargetIde(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 text-[11px] text-zinc-200 outline-none"
              >
                <option value="Claude 3.7 / 4 Sonnet" className="bg-[#111]">
                  Claude 3.7 / 4 Sonnet
                </option>
                <option value="Cursor IDE (.cursorrules)" className="bg-[#111]">
                  Cursor IDE (.cursorrules)
                </option>
                <option value="GPT-4o / o3" className="bg-[#111]">
                  GPT-4o / o3
                </option>
                <option value="Qwen-2.5-Coder / DeepSeek-R1" className="bg-[#111]">
                  Qwen-2.5-Coder / DeepSeek-R1
                </option>
              </select>
            </div>
            <div>
              <span className="mb-1 block text-[10.5px] text-zinc-400">پرسونای زیبایی‌شناسی</span>
              <select
                value={aestheticPersona}
                onChange={(e) => setAestheticPersona(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 text-[11px] text-zinc-200 outline-none"
              >
                <option value="Obsidian Luxury + Persian Nastaliq" className="bg-[#111]">
                  اشرافی ابسیدین + نستعلیق
                </option>
                <option value="Apple Liquid Glass & Fresnel" className="bg-[#111]">
                  شیشه مایع اپل (Liquid Glass)
                </option>
                <option value="SpaceX Dark Cockpit" className="bg-[#111]">
                  کابین تاریک مهندسی (Dark Cockpit)
                </option>
                <option value="Swiss High Data-Ink" className="bg-[#111]">
                  گرید سوئیسی تافتی (High Data-Ink)
                </option>
              </select>
            </div>
            <div>
              <span className="mb-1 block text-[10.5px] text-zinc-400">فونت</span>
              <select
                value={promptFont}
                onChange={(e) => setPromptFont(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 text-[11px] text-zinc-200 outline-none"
              >
                {PERSIAN_FONT_CATALOG.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#111]">
                    {f.nameFa}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1 block text-[10.5px] text-zinc-400">شرح اختصاصی پروژه شما</span>
              <textarea
                rows={2}
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                placeholder="مثلاً: کارت بانکی شتاب با انیمیشن برگشت…"
                className="w-full rounded-lg border border-white/[0.08] bg-black/50 p-2 text-[11px] text-zinc-200 outline-none"
              />
            </div>
            <Slider
              label="سطح جزئیات"
              value={promptDetail}
              min={1}
              max={4}
              onChange={setPromptDetail}
              format={(v) => ["حداقلی", "متوسط", "کامل", "تولیدی"][v - 1]}
            />
            <div className="space-y-1.5 border-t border-white/[0.06] pt-2">
              <Toggle
                label="قوانین فین‌تک ایران (شتاب، شبا، جلالی)"
                checked={enforceIranFintech}
                onChange={setEnforceIranFintech}
              />
              <Toggle
                label="کالیبراسیون Zero-CLS و محور GRAD"
                checked={enforceZeroCls}
                onChange={setEnforceZeroCls}
              />
              <Toggle
                label="کنتراست OKLCH و منع OLED Smearing"
                checked={enforceOledSafe}
                onChange={setEnforceOledSafe}
              />
            </div>
            <button
              onClick={copyExport}
              className="w-full rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
            >
              کپی پرامپت
            </button>
          </div>
        </Panel>
      )}

      {tab === "tuning" && (
        <Panel title="پیکربندی QLoRA">
          <div className="space-y-3.5">
            <div>
              <span className="mb-1 block text-[10.5px] text-zinc-400">مدل پایه</span>
              <select
                value={tuning.baseModel}
                onChange={(e) => setTuning({ baseModel: e.target.value })}
                className="w-full rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1.5 font-mono text-[9.5px] text-zinc-200 outline-none"
                dir="ltr"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m} className="bg-[#111]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1 block text-[10.5px] text-zinc-400">
                دقت کوانتیزاسیون (Quantization)
              </span>
              <Segmented
                className="w-full"
                size="sm"
                value={tuning.quantMode ?? "4bit-nf4"}
                onChange={(v) => setTuning({ quantMode: v })}
                options={[
                  { value: "4bit-nf4", label: "4-Bit NF4" },
                  { value: "8bit-int8", label: "8-Bit Int8" },
                  { value: "bf16", label: "BF16" },
                ]}
              />
            </div>
            <Slider
              label="رتبه LoRA (r)"
              value={tuning.rank}
              min={4}
              max={64}
              step={4}
              onChange={(v) => setTuning({ rank: v })}
            />
            <Slider
              label="آلفا"
              value={tuning.alpha}
              min={8}
              max={128}
              step={8}
              onChange={(v) => setTuning({ alpha: v })}
            />
            <Slider
              label="Dropout"
              value={tuning.dropout}
              min={0}
              max={0.2}
              step={0.01}
              onChange={(v) => setTuning({ dropout: v })}
              format={(v) => v.toFixed(2)}
            />
            <Slider
              label="نرخ یادگیری"
              value={tuning.lr}
              min={0.0001}
              max={0.001}
              step={0.0001}
              onChange={(v) => setTuning({ lr: v })}
              format={(v) => v.toExponential(1)}
            />
            <Slider
              label="دوره‌ها"
              value={tuning.epochs}
              min={1}
              max={8}
              onChange={(v) => setTuning({ epochs: v })}
            />
            <Slider
              label="طول دنباله"
              value={tuning.seqLen}
              min={512}
              max={4096}
              step={256}
              onChange={(v) => setTuning({ seqLen: v })}
            />
            <Slider
              label="Batch"
              value={tuning.batch}
              min={1}
              max={8}
              onChange={(v) => setTuning({ batch: v })}
            />
          </div>
        </Panel>
      )}

      {tab === "dataset" && (
        <Panel title="آمار زنده">
          <div className="grid grid-cols-2 gap-2">
            {[
              { k: "جفت", v: faNum(dataset?.total ?? 0) },
              { k: "رجیستری", v: faNum(new Set(dataset?.pairs.map((p) => p.registry) ?? []).size) },
              { k: "فایل آموزش", v: faNum(ALL_AI_TRAINING_FILES.length) },
              { k: "اسکیل", v: faNum(ALL_SKILLS_MANIFEST.length) },
            ].map((x) => (
              <div key={x.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                <div className="text-[9.5px] text-zinc-500">{x.k}</div>
                <div className="font-mono text-[13px] text-zinc-100">{x.v}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel tone="inset" title="دانلود کیت آموزش">
        <p className="text-[11px] leading-relaxed text-zinc-400">
          دیتاست JSONL، پرامپت سیستمی، اسکریپت QLoRA و پرامپت آماده در یک ZIP.
        </p>
        <DownloadButton
          label="کیت آموزش"
          filename="rtl-motion-dataset.zip"
          onDownload={downloadDatasetKit}
          variant="solid"
          className="mt-2 w-full justify-center"
        />
      </Panel>
    </div>
  );

  return (
    <>
      <AiTour />
      <StudioShell
        eyebrow="AI STUDIO"
        title="استودیو هوش مصنوعی"
        description={`پرامپت‌ساز تخصصی RTL، مرورگر ${faNum(dataset?.total ?? 40)} جفت داده آموزشی و پیکربندی QLoRA — همه از دارایی واقعی مخزن و قابل دانلود.`}
        icon={Brain}
        stats={
          <>
            <Badge tone="accent">{faNum(dataset?.total ?? 40)} جفت داده</Badge>
            <Badge>{faNum(MODELS.length)} مدل پایه</Badge>
          </>
        }
        actions={
          <DownloadButton
            label="کیت آموزش"
            filename="rtl-motion-dataset.zip"
            onDownload={downloadDatasetKit}
          />
        }
        listWidth="228px"
        settingsWidth="292px"
        list={list}
        stage={stage}
        settings={settings}
      />
    </>
  );
};

export default AiStudio;
