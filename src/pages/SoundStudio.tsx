import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, Waves } from "lucide-react";
import { ALL_SOUND_RECIPES_MANIFEST, type SoundRecipeItem } from "../data/soundsManifest";
import { soundEngine, type PlayOptions } from "../engines/soundEngine";
import { usePersisted } from "../lib/store";
import { saveKit } from "../lib/download";
import {
  Badge,
  CodeBlock,
  Panel,
  SearchField,
  Slider,
  Toggle,
  cn,
} from "../ui/kit";
import { StudioShell, StudioList } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { faNum } from "../lib/format";
import { useToast } from "../ui/Toast";

type SoundCategory = "all" | "impact" | "click" | "sweep" | "air" | "noise";

const CATEGORY_LABEL: Record<SoundCategory, string> = {
  all: "همه",
  impact: "برخورد",
  click: "کلیک",
  sweep: "سویپ",
  air: "فضا",
  noise: "نویز",
};

function categoryOf(r: SoundRecipeItem): Exclude<SoundCategory, "all"> {
  const ratio = Math.abs(r.freqTo - r.freqFrom) / Math.max(r.freqFrom, 1);
  if (r.duration > 0.45) return "air";
  if (ratio > 0.45) return "sweep";
  if (r.hasNoise) return "noise";
  if (r.duration <= 0.12) return "impact";
  return "click";
}

interface SoundSettings extends PlayOptions {
  stretch: number;
  noise: boolean;
  autoPreview: boolean;
}

const DEFAULT: SoundSettings = {
  pitch: 1,
  gain: 1,
  cutoff: 1,
  stretch: 1,
  noise: false,
  autoPreview: true,
};

const WaveformCanvas: React.FC<{ recipe: SoundRecipeItem; options: PlayOptions; version: number }> = ({
  recipe,
  options,
  version,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  /* The canvas lives in a rail that is hidden while another mobile tab is
     active, so it must redraw by itself whenever its real width changes. */
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const measure = () => setBoxWidth(canvas.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    setPeaks(null);
    const id = window.setTimeout(() => {
      soundEngine
        .renderBuffer(recipe, options)
        .then((buffer) => {
          if (!alive || !buffer) return;
          const data = buffer.getChannelData(0);
          const buckets = 180;
          const size = Math.floor(data.length / buckets) || 1;
          const out: number[] = [];
          for (let b = 0; b < buckets; b++) {
            let peak = 0;
            const from = b * size;
            for (let i = from; i < Math.min(from + size, data.length); i++) {
              const v = Math.abs(data[i]);
              if (v > peak) peak = v;
            }
            out.push(peak);
          }
          const max = Math.max(...out, 0.001);
          setPeaks(out.map((v) => v / max));
        })
        .catch(() => {});
    }, 90);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
    // options is memoised upstream; the primitive fields are the real inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, options.pitch, options.gain, options.cutoff, options.stretch, options.noise, version]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 2 || h < 2) return; // hidden panel: skip instead of drawing a 0px canvas
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#E8B33A";
    const mid = h / 2;

    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    if (!peaks) {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.font = "10px monospace";
      ctx.fillText("rendering…", 8, mid - 6);
      return;
    }

    const barW = w / peaks.length;
    peaks.forEach((p, i) => {
      const amp = Math.max(0.012, p) * (h * 0.44);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.35 + p * 0.65;
      ctx.fillRect(i * barW, mid - amp, Math.max(barW - 0.6, 0.7), amp * 2);
    });
    ctx.globalAlpha = 1;
  }, [peaks, boxWidth]);

  return <canvas ref={ref} className="h-24 w-full" />;
};

export const SoundStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<SoundSettings>("studio-sounds", DEFAULT);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<SoundCategory>("all");
  const [pick, setPick] = usePersisted<{ id: string }>("studio-sounds-pick", {
    id: ALL_SOUND_RECIPES_MANIFEST[0]?.id ?? "",
  });
  const selectedId = ALL_SOUND_RECIPES_MANIFEST.some((r) => r.id === pick.id)
    ? pick.id
    : ALL_SOUND_RECIPES_MANIFEST[0]?.id ?? "";
  const setSelectedId = (id: string) => setPick({ id });
  const [version, setVersion] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimer = useRef<number | null>(null);
  const interacted = useRef(false);
  const toast = useToast();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ALL_SOUND_RECIPES_MANIFEST.filter((r) => {
      const matchTerm = !term || r.id.includes(term);
      const matchCat = cat === "all" || categoryOf(r) === cat;
      return matchTerm && matchCat;
    });
  }, [q, cat]);

  const selected =
    ALL_SOUND_RECIPES_MANIFEST.find((r) => r.id === selectedId) ?? ALL_SOUND_RECIPES_MANIFEST[0];

  const options: PlayOptions = useMemo(
    () => ({
      pitch: s.pitch,
      gain: s.gain,
      cutoff: s.cutoff,
      stretch: s.stretch,
      noise: s.noise ? true : undefined,
    }),
    [s.pitch, s.gain, s.cutoff, s.stretch, s.noise]
  );

  const play = (recipe: SoundRecipeItem = selected) => {
    interacted.current = true;
    soundEngine.playRecipe(recipe, options);
    setPlaying(true);
    if (playTimer.current) window.clearTimeout(playTimer.current);
    playTimer.current = window.setTimeout(
      () => setPlaying(false),
      Math.max(220, recipe.duration * 1000 * s.stretch)
    );
  };

  useEffect(() => {
    if (s.autoPreview && interacted.current) play(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, s.pitch, s.gain, s.cutoff, s.stretch, s.noise]);

  const downloadWav = async () => {
    const blob = await soundEngine.renderWav(selected, options);
    const { saveBlob } = await import("../lib/download");
    saveBlob(blob, `${selected.id}.wav`);
    return true;
  };

  const downloadKit = async () => {
    const blob = await soundEngine.renderWav(selected, options);
    if (!blob || blob.size < 100) return false;
    return saveKit(`rtl-motion-sound-${selected.id}`, [
      { name: `${selected.id}.wav`, content: blob },
      {
        name: "recipe.json",
        content: JSON.stringify({ ...selected, options }, null, 2),
      },
      {
        name: "usage.tsx",
        content: `import { soundEngine } from "@/engines/soundEngine";

soundEngine.playRecipe(
  {
    id: "${selected.id}",
    duration: ${selected.duration},
    lowpass: ${selected.lowpass},
    freqFrom: ${selected.freqFrom},
    freqTo: ${selected.freqTo},
    hasNoise: ${selected.hasNoise},
    snippet: "",
  },
  { pitch: ${s.pitch}, gain: ${s.gain}, cutoff: ${s.cutoff}, stretch: ${s.stretch}${s.noise ? ", noise: true" : ""} }
);
`,
      },
      {
        name: "README.txt",
        content: `RTL Motion Lab — ${selected.id}
دسته: ${CATEGORY_LABEL[categoryOf(selected)]}
مدت: ${selected.duration}s · فیلتر: ${selected.lowpass}Hz
فرکانس: ${selected.freqFrom} → ${selected.freqTo}Hz
فایل WAV با Web Audio آفلاین رندر شده است (۴۴.۱kHz، ۱۶بیت).
`,
      },
    ]);
  };

  /** Bundles the current filter into a JSON recipe pack (no audio rendering). */
  const downloadFiltered = async () => {
    if (filtered.length === 0) return false;
    return saveKit(`rtl-motion-sounds-${cat}`, [
      {
        name: "recipes.json",
        content: JSON.stringify(
          filtered.map((r) => ({ ...r, category: categoryOf(r), options })),
          null,
          2
        ),
      },
      {
        name: "play.ts",
        content: `import { soundEngine } from "@/engines/soundEngine";
import recipes from "./recipes.json";

// ${filtered.length} رسیپی سینتز — بدون فایل صوتی، همه در مرورگر ساخته می‌شوند
export function playAll(gap = 220) {
  recipes.forEach((recipe, i) => window.setTimeout(() => soundEngine.playRecipe(recipe), i * gap));
}
`,
      },
      {
        name: "README.txt",
        content: `RTL Motion Lab — بسته صدای ${CATEGORY_LABEL[cat]}
تعداد: ${filtered.length}
هر صدا با Web Audio ساخته می‌شود؛ هیچ MP3 یا آدرس خارجی لازم نیست.
`,
      },
    ]);
  };

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: ALL_SOUND_RECIPES_MANIFEST.length };
    for (const r of ALL_SOUND_RECIPES_MANIFEST) {
      const c = categoryOf(r);
      base[c] = (base[c] ?? 0) + 1;
    }
    return base;
  }, []);

  const usageSnippet = `import { soundEngine } from "@/engines/soundEngine";

// ${selected.id} — ${selected.duration.toFixed(2)}s · ${selected.freqFrom}Hz → ${selected.freqTo}Hz
soundEngine.playRecipe(
  { id: "${selected.id}", duration: ${selected.duration}, lowpass: ${selected.lowpass},
    freqFrom: ${selected.freqFrom}, freqTo: ${selected.freqTo}, hasNoise: ${selected.hasNoise}, snippet: "" },
  { pitch: ${s.pitch}, gain: ${s.gain}, cutoff: ${s.cutoff}, stretch: ${s.stretch}${s.noise ? ", noise: true" : ""} }
);`;

  const stage = (
    <div className="space-y-4">
      <Panel padded={false} className="desk:sticky desk:top-0 desk:z-20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: playing ? "#34d399" : "#52525b" }} />
            <span className="truncate font-mono text-[11.5px] text-zinc-200" dir="ltr">
              {selected.id}
            </span>
            <Badge>{CATEGORY_LABEL[categoryOf(selected)]}</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => play()}
              className="flex items-center gap-1 rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-2.5 py-1 text-[10.5px] text-[color:var(--accent)]"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              پخش
            </button>
            <DownloadButton label="WAV" filename={`${selected.id}.wav`} onDownload={downloadWav} />
            <DownloadButton
              label="کیت"
              filename={`rtl-motion-sound-${selected.id}.zip`}
              onDownload={downloadKit}
              variant="solid"
            />
          </div>
        </div>

        <div className="p-3">
          <div className="rounded-xl border border-white/[0.06] bg-black/40 p-2">
            <WaveformCanvas recipe={selected} options={options} version={version} />
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] text-zinc-600" dir="ltr">
            <span>0.00s</span>
            <span>
              {selected.duration.toFixed(2)}s · lowpass {selected.lowpass}Hz
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { k: "فرکانس شروع", v: `${Math.round(selected.freqFrom)}Hz` },
              { k: "فرکانس پایان", v: `${Math.round(selected.freqTo)}Hz` },
              { k: "نویز", v: selected.hasNoise ? "دارد" : "ندارد" },
              { k: "دسته", v: CATEGORY_LABEL[categoryOf(selected)] },
            ].map((m) => (
              <div key={m.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                <div className="text-[9.5px] text-zinc-500">{m.k}</div>
                <div className="mt-0.5 font-mono text-[12px] text-zinc-200">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="کد استفاده" subtitle="بدون وابستگی به فایل MP3" padded={false}>
        <div className="p-3">
          <CodeBlock code={usageSnippet} language="tsx" maxLines={16} filename="usage.tsx" />
        </div>
      </Panel>

      <Panel title="پیش‌نمایش سریع" subtitle="همین صدا با تنظیمات فعلی">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ALL_SOUND_RECIPES_MANIFEST.slice(0, 6).map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedId(r.id);
                play(r);
              }}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-1.5 py-2 font-mono text-[9.5px] text-zinc-400 transition-colors hover:border-[color:var(--accent)]/40 hover:text-zinc-100"
              dir="ltr"
            >
              {r.id}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );

  const settings = (
    <div className="space-y-4">
      <Panel title="پارامترهای صدا" subtitle="روی پخش و رندر WAV اثر می‌گذارد">
        <div className="space-y-3.5">
          <Slider label="زیر و بمی (Pitch)" value={s.pitch ?? 1} min={0.4} max={2.6} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => set({ pitch: v })} />
          <Slider label="بلندی (Gain)" value={s.gain ?? 1} min={0} max={2.2} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => set({ gain: v })} />
          <Slider label="برش فیلتر" value={s.cutoff ?? 1} min={0.2} max={3.5} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => set({ cutoff: v })} />
          <Slider label="کشیدگی زمانی" value={s.stretch} min={0.4} max={3} step={0.05} format={(v) => `${v.toFixed(2)}×`} onChange={(v) => set({ stretch: v })} />
          <div className="space-y-2 border-t border-white/[0.06] pt-3">
            <Toggle label="نویز رویه" checked={s.noise} onChange={(v) => set({ noise: v })} hint="حس لمسی و هوا" />
            <Toggle label="پیش‌نمایش خودکار" checked={s.autoPreview} onChange={(v) => set({ autoPreview: v })} />
          </div>
          <button
            onClick={() => setVersion((v) => v + 1)}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
          >
            <Volume2 className="h-3 w-3" />
            رندر مجدد موج
          </button>
        </div>
      </Panel>

      <Panel tone="inset" title="بسته صدا" subtitle={`${faNum(filtered.length)} رسیپی در فیلتر فعلی`}>
        <DownloadButton
          label="دانلود رسیپی‌ها"
          filename={`rtl-motion-sounds-${cat}.zip`}
          onDownload={downloadFiltered}
          variant="solid"
          className="w-full justify-center"
        />
      </Panel>

      <Panel title="راهنما">
        <p className="text-[11px] leading-relaxed text-zinc-400">
          همه صداها در زمان اجرا با نوسان‌ساز و فیلتر ساخته می‌شوند؛ حجم صفر و کیفیت
          بی‌نهایت. تغییر Pitch بر اساس سرعت حرکت، حس فیزیکی رابط را چند برابر می‌کند.
        </p>
      </Panel>
    </div>
  );

  const list = (
    <StudioList
      title="همه صداها"
      subtitle={`${faNum(filtered.length)} از ${faNum(ALL_SOUND_RECIPES_MANIFEST.length)}`}
      className="min-h-[360px] desk:min-h-0"
      footer="برای شنیدن، روی هر ردیف کلیک کنید"
      toolbar={<Badge tone="accent">{faNum(ALL_SOUND_RECIPES_MANIFEST.length)}</Badge>}
    >
      <div className="sticky top-0 z-10 -m-1.5 mb-1.5 space-y-2 bg-[#0D0D10]/95 p-1.5 backdrop-blur">
        <SearchField value={q} onChange={setQ} placeholder="جستجوی نام صدا…" />
        <div className="flex flex-wrap gap-1">
          {(Object.keys(CATEGORY_LABEL) as SoundCategory[]).map((c) => (
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
              {CATEGORY_LABEL[c]} <span className="opacity-60">{faNum(counts[c] ?? 0)}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.map((r) => {
        const active = r.id === selectedId;
        return (
          <div
            key={r.id}
            className={cn(
              "group flex h-[30px] items-center gap-2 rounded-md px-1.5",
              active ? "bg-[color:var(--accent)]/10" : "hover:bg-white/[0.035]"
            )}
          >
            <button
              onClick={() => {
                setSelectedId(r.id);
                interacted.current = true;
                play(r);
              }}
              className="min-w-0 flex-1 truncate text-start font-mono text-[10.5px] text-zinc-300"
              dir="ltr"
            >
              {r.id}
            </button>
            <span className="w-11 shrink-0 text-end font-mono text-[9px] text-zinc-600">
              {r.duration.toFixed(2)}s
            </span>
            <button
              onClick={() => play(r)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/10 text-zinc-400 opacity-100 transition-opacity hover:text-white focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={`پخش ${r.id}`}
            >
              <Play className="h-2.5 w-2.5" />
            </button>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-[11px] text-zinc-600">
          صدایی با این شرط پیدا نشد
        </div>
      )}
    </StudioList>
  );

  return (
    <StudioShell
      eyebrow="SOUND STUDIO"
      title="استودیو صدای رویه"
      description="۲۰۰ افکت سینتز که همه با Web Audio ساخته می‌شوند. شکل موج، خروجی واقعی رندر آفلاین است و می‌توانید هر صدا را با پارامترهای خودتان دانلود کنید."
      icon={Waves}
      stats={
        <>
          <Badge tone="accent">{faNum(ALL_SOUND_RECIPES_MANIFEST.length)} رسیپی</Badge>
          <Badge>WAV 44.1kHz</Badge>
        </>
      }
      actions={
        <DownloadButton label="دانلود کیت صدا" filename={`rtl-motion-sound-${selected.id}.zip`} onDownload={downloadKit} />
      }
      onReset={() => {
        reset();
        toast.push("تنظیمات صدا بازنشانی شد", { tone: "info" });
      }}
      listWidth="236px"
      settingsWidth="300px"
      list={list}
      stage={stage}
      settings={settings}
    />
  );
};

export default SoundStudio;
