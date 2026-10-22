import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Pause, Play, RotateCcw, Volume2, Waves } from "lucide-react";
import { ALL_SOUND_RECIPES_MANIFEST, type SoundRecipeItem } from "../data/soundsManifest";
import { soundEngine, type PlayOptions } from "../engines/soundEngine";
import { usePersisted } from "../lib/store";
import {
  Badge,
  CodeBlock,
  CopyButton,
  Panel,
  SearchField,
  Slider,
  Toggle,
  cn,
} from "../ui/kit";

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

const ROW_H = 34;

/** Draws the REAL offline-rendered waveform (not a decorative guess). */
const WaveformCanvas: React.FC<{ recipe: SoundRecipeItem; options: PlayOptions; version: number }> = ({
  recipe,
  options,
  version,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);

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
  }, [recipe, options.pitch, options.gain, options.cutoff, options.stretch, options.noise, version]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#E8B33A";
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
  }, [peaks]);

  return <canvas ref={ref} className="h-24 w-full" />;
};

export const SoundStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<SoundSettings>("studio-sounds", DEFAULT);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<SoundCategory>("all");
  const [selectedId, setSelectedId] = useState(ALL_SOUND_RECIPES_MANIFEST[0]?.id ?? "");
  const [scrollTop, setScrollTop] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [version, setVersion] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimer = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ALL_SOUND_RECIPES_MANIFEST.filter((r) => {
      const matchTerm = !term || r.id.includes(term);
      const matchCat = cat === "all" || categoryOf(r) === cat;
      return matchTerm && matchCat;
    });
  }, [q, cat]);

  const selected =
    ALL_SOUND_RECIPES_MANIFEST.find((r) => r.id === selectedId) ??
    ALL_SOUND_RECIPES_MANIFEST[0];

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

  const interacted = useRef(false);

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

  const download = async () => {
    setExporting(true);
    try {
      const blob = await soundEngine.renderWav(selected, options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selected.id}.wav`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    } finally {
      setExporting(false);
    }
  };

  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - 5);
  const visible = Math.ceil(470 / ROW_H) + 10;
  const end = Math.min(filtered.length, start + visible);

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

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[color:var(--accent)]">
            <Waves className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wide">SOUND STUDIO</span>
          </div>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-white sm:text-[30px]">
            استودیو صدای رویه
          </h1>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-zinc-500">
            {ALL_SOUND_RECIPES_MANIFEST.length} افکت که همه با Web Audio ساخته می‌شوند —
            بدون فایل MP3. شکل موج زیر خروجی واقعی رندر آفلاین است و می‌توانید هر صدا را
            با پارامترهای دلخواه خودتان بگیرید.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent">{ALL_SOUND_RECIPES_MANIFEST.length} رسیپی</Badge>
          <Badge>۰ فایل صوتی</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel padded={false}>
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] p-2">
              <SearchField value={q} onChange={setQ} placeholder="جستجوی نام صدا…" className="min-w-[160px] flex-1" />
              <div className="flex flex-wrap gap-1">
                {(Object.keys(CATEGORY_LABEL) as SoundCategory[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[10px] transition-colors",
                      cat === c
                        ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                        : "border-white/[0.07] text-zinc-500 hover:text-zinc-200"
                    )}
                  >
                    {CATEGORY_LABEL[c]} <span className="font-mono opacity-60">{counts[c] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="overflow-y-auto"
              style={{ height: 470 }}
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
            >
              <div style={{ height: filtered.length * ROW_H, position: "relative" }}>
                <div style={{ transform: `translateY(${start * ROW_H}px)` }}>
                  {Array.from({ length: end - start }, (_, i) => {
                    const r = filtered[start + i];
                    if (!r) return null;
                    const active = r.id === selectedId;
                    return (
                      <div
                        key={r.id}
                        style={{ height: ROW_H }}
                        className={cn(
                          "group flex items-center gap-2 px-2",
                          active ? "bg-[color:var(--accent)]/[0.08]" : "hover:bg-white/[0.035]"
                        )}
                      >
                        <button
                          onClick={() => {
                            setSelectedId(r.id);
                            if (!s.autoPreview) play(r);
                          }}
                          className="min-w-0 flex-1 truncate text-start font-mono text-[11px] text-zinc-300"
                          dir="ltr"
                        >
                          {r.id}
                        </button>
                        <span className="w-14 shrink-0 text-end font-mono text-[9.5px] text-zinc-600">
                          {r.duration.toFixed(2)}s
                        </span>
                        <span className="hidden w-24 shrink-0 text-end font-mono text-[9.5px] text-zinc-600 sm:block">
                          {Math.round(r.freqFrom)}→{Math.round(r.freqTo)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedId(r.id);
                            play(r);
                          }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 text-zinc-400 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                          aria-label={`پخش ${r.id}`}
                        >
                          <Play className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="border-t border-white/[0.06] px-3 py-1.5 text-[10px] text-zinc-600">
              {filtered.length} صدا · پنجره‌بندی مجازی برای عملکرد روان
            </div>
          </Panel>

          <Panel
            title={<span className="font-mono text-[12px]" dir="ltr">{selected.id}</span>}
            subtitle={`${selected.duration.toFixed(2)}s · lowpass ${selected.lowpass}Hz · ${selected.hasNoise ? "دارای نویز" : "بدون نویز"}`}
            actions={
              <>
                <button
                  onClick={() => play()}
                  className="flex items-center gap-1 rounded-lg border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/12 px-2.5 py-1 text-[10.5px] text-[color:var(--accent)]"
                >
                  {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  پخش
                </button>
                <button
                  onClick={download}
                  disabled={exporting}
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-[10.5px] text-zinc-400 hover:text-white disabled:opacity-50"
                >
                  <Download className="h-3 w-3" />
                  {exporting ? "…" : "WAV"}
                </button>
              </>
            }
          >
            <div className="rounded-xl border border-white/[0.06] bg-black/40 p-2">
              <WaveformCanvas recipe={selected} options={options} version={version} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { k: "فرکانس شروع", v: `${Math.round(selected.freqFrom)}Hz` },
                { k: "فرکانس پایان", v: `${Math.round(selected.freqTo)}Hz` },
                { k: "فیلتر", v: `${selected.lowpass}Hz` },
                { k: "دسته", v: CATEGORY_LABEL[categoryOf(selected)] },
              ].map((m) => (
                <div key={m.k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
                  <div className="text-[9.5px] text-zinc-500">{m.k}</div>
                  <div className="mt-0.5 font-mono text-[12px] text-zinc-200">{m.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <CodeBlock code={usageSnippet} language="tsx" maxLines={14} filename="usage.tsx" />
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="پارامترهای صدا" subtitle="روی پخش و رندر WAV اثر می‌گذارد">
            <div className="space-y-3.5">
              <Slider label="زیر و بمی (Pitch)" value={s.pitch ?? 1} min={0.4} max={2.6} step={0.05} onChange={(v) => set({ pitch: v })} format={(v) => `${v.toFixed(2)}×`} />
              <Slider label="بلندی (Gain)" value={s.gain ?? 1} min={0} max={2.2} step={0.05} onChange={(v) => set({ gain: v })} format={(v) => `${v.toFixed(2)}×`} />
              <Slider label="برش فیلتر" value={s.cutoff ?? 1} min={0.2} max={3.5} step={0.05} onChange={(v) => set({ cutoff: v })} format={(v) => `${v.toFixed(2)}×`} />
              <Slider label="کشیدگی زمانی" value={s.stretch} min={0.4} max={3} step={0.05} onChange={(v) => set({ stretch: v })} format={(v) => `${v.toFixed(2)}×`} />
              <div className="space-y-2 border-t border-white/[0.06] pt-3">
                <Toggle label="نویز رویه" checked={s.noise} onChange={(v) => set({ noise: v })} hint="باعث حالت لمسی/هوا می‌شود" />
                <Toggle label="پیش‌نمایش خودکار" checked={s.autoPreview} onChange={(v) => set({ autoPreview: v })} hint="هنگام تغییر صدا پخش شود" />
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={reset}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                  بازنشانی
                </button>
                <button
                  onClick={() => setVersion((v) => v + 1)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[10.5px] text-zinc-400 hover:text-white"
                >
                  <Volume2 className="h-3 w-3" />
                  رندر مجدد
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="آماده استفاده در کد" subtitle="بدون وابستگی به فایل صوتی">
            <CodeBlock
              code={`// 1) کپی رسیپی
const ${selected.id} = {
  duration: ${selected.duration}, lowpass: ${selected.lowpass},
  freqFrom: ${selected.freqFrom}, freqTo: ${selected.freqTo},
};

// 2) پخش با تنظیمات استودیو
soundEngine.playRecipe(${selected.id}, {
  pitch: ${s.pitch}, gain: ${s.gain},
  cutoff: ${s.cutoff}, stretch: ${s.stretch},
});`}
              language="tsx"
              maxLines={16}
              filename="recipe.tsx"
            />
            <CopyButton text={usageSnippet} label="کپی کامل" className="mt-2 w-full justify-center" />
          </Panel>

          <Panel tone="inset" title="چرا صدا؟">
            <p className="text-[11.5px] leading-relaxed text-zinc-400">
              بازخورد صوتی، حس فیزیکی رابط را چند برابر می‌کند. همه صداها در زمان اجرا با
              نوسان‌ساز و فیلتر ساخته می‌شوند: حجم صفر، کیفیت بی‌نهایت، و امکان تغییر
              زیر و بمی بر اساس سرعت حرکت.
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default SoundStudio;
