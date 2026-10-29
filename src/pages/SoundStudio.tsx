import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, Waves, Sparkles, Timer } from "lucide-react";
import { ALL_SOUND_RECIPES_MANIFEST } from "../data/soundsManifest";
import { DESIGNED_SOUNDS, SOUND_CATEGORY_LABEL } from "../data/soundLibrary";
import {
  audibleDuration,
  designFromLegacy,
  soundEngine,
  type PlayOptions,
  type SoundItem,
} from "../engines/soundEngine";
import { usePersisted } from "../lib/store";
import { saveBlob, saveKit } from "../lib/download";
import { Badge, CodeBlock, Panel, SearchField, Slider, Toggle, cn } from "../ui/kit";
import { StudioShell, StudioList, focusStudioPreview } from "../ui/StudioShell";
import { DownloadButton } from "../ui/DownloadButton";
import { faNum } from "../lib/format";
import { useToast } from "../ui/Toast";

/* ------------------------------------------------------------------ catalog */

const LEGACY_ITEMS: SoundItem[] = ALL_SOUND_RECIPES_MANIFEST.map((r) => {
  const ratio = Math.abs(r.freqTo - r.freqFrom) / Math.max(r.freqFrom, 1);
  const category: SoundItem["category"] =
    r.duration > 1.6
      ? "air"
      : r.duration > 0.45
        ? "sweep"
        : r.hasNoise
          ? "impact"
          : ratio > 0.4
            ? "sweep"
            : "ui";
  return {
    id: r.id,
    nameFa: r.id.replace(/[-_]/g, " "),
    category,
    duration: r.duration,
    descFa: `رسیپی اصلی مخزن · ${r.freqFrom.toFixed(0)}→${r.freqTo.toFixed(0)}Hz`,
    tags: [r.hasNoise ? "noise" : "tone", r.duration > 1 ? "long" : "short"],
    design: designFromLegacy(r),
  };
});

export const SOUND_LIBRARY: SoundItem[] = [...DESIGNED_SOUNDS, ...LEGACY_ITEMS];

const CATEGORY_ORDER: (SoundItem["category"] | "all" | "long")[] = [
  "all",
  "ui",
  "impact",
  "sweep",
  "air",
  "texture",
  "cinematic",
  "notify",
  "long",
];

const seconds = (v: number) =>
  `${v < 1 ? faNum(Math.round(v * 1000)) + "ms" : faNum(v.toFixed(v < 10 ? 1 : 0)) + "s"}`;

/* ----------------------------------------------------------------- settings */

interface SoundSettings extends PlayOptions {
  stretch: number;
  noise: boolean;
  autoPreview: boolean;
  reverbMix: number;
  stereoPan: number;
  harmonicBoost: number;
  euclidPulses: number;
  euclidSteps: number;
  bpm: number;
}

const DEFAULT: SoundSettings = {
  pitch: 1,
  gain: 1,
  cutoff: 1,
  stretch: 1,
  noise: false,
  autoPreview: true,
  reverbMix: 0.28,
  stereoPan: 0,
  harmonicBoost: 1,
  euclidPulses: 5,
  euclidSteps: 8,
  bpm: 116,
};

/* ---------------------------------------------------------------- waveform */

const Waveform: React.FC<{
  item: SoundItem;
  options: PlayOptions;
  version: number;
  progress: number;
}> = ({ item, options, version, progress }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);

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
        .renderDesign(item.design, options)
        .then((buffer) => {
          if (!alive || !buffer) return;
          const data = buffer.getChannelData(0);
          const buckets = 220;
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
        .catch(() => setPeaks([]));
    }, 120);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
    // options is memoised upstream; its primitive fields are the real inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, options.pitch, options.gain, options.cutoff, options.stretch, version]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 2 || h < 2) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#E8B33A";
    const mid = h / 2;

    if (!peaks) {
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("در حال رندر شکل موج…", 8, mid - 6);
      return;
    }
    if (peaks.length === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("رندر آفلاین در این مرورگر در دسترس نیست", 8, mid - 6);
      return;
    }

    const barW = w / peaks.length;
    peaks.forEach((p, i) => {
      const amp = Math.max(0.02, p) * (h * 0.44);
      const played = i / peaks.length <= progress;
      ctx.fillStyle = accent;
      ctx.globalAlpha = played ? 0.95 : 0.28 + p * 0.4;
      ctx.fillRect(i * barW, mid - amp, Math.max(barW - 0.7, 0.8), amp * 2);
    });
    ctx.globalAlpha = 1;
    if (progress > 0 && progress < 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * progress, 4);
      ctx.lineTo(w * progress, h - 4);
      ctx.stroke();
    }
  }, [peaks, boxWidth, progress]);

  return <canvas ref={ref} className="h-24 w-full sm:h-28" aria-label="شکل موج" role="img" />;
};

/* ------------------------------------------------------------------ studio */

export const SoundStudio: React.FC = () => {
  const [s, set, reset] = usePersisted<SoundSettings>("studio-sounds", DEFAULT);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORY_ORDER)[number]>("all");
  const [pick, setPick] = usePersisted<{ id: string }>("studio-sounds-pick", {
    id: SOUND_LIBRARY[0]?.id ?? "",
  });
  const selectedId = SOUND_LIBRARY.some((r) => r.id === pick.id)
    ? pick.id
    : (SOUND_LIBRARY[0]?.id ?? "");
  const [version, setVersion] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seqPlaying, setSeqPlaying] = useState(false);
  const [seqStep, setSeqStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const playTimer = useRef<number | null>(null);
  const progressTimer = useRef<number | null>(null);
  const interacted = useRef(false);
  const toast = useToast();

  const selected = SOUND_LIBRARY.find((r) => r.id === selectedId) ?? SOUND_LIBRARY[0];

  const setSelectedId = (id: string) => {
    setPick({ id });
    setElapsed(0);
    focusStudioPreview();
  };

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

  const customizedDesign = useMemo(() => {
    const panShift = s.stereoPan ?? 0;
    const harmScale = s.harmonicBoost ?? 1;
    const revMix = s.reverbMix ?? 0.28;
    return {
      ...selected.design,
      reverb:
        revMix > 0
          ? {
              decay: selected.design.reverb?.decay ?? 1.2,
              mix: revMix,
            }
          : undefined,
      layers: selected.design.layers.map((layer, idx) => ({
        ...layer,
        pan: Math.max(-1, Math.min(1, (layer.pan ?? 0) + panShift)),
        gain: idx > 0 ? (layer.gain ?? 0.5) * harmScale : layer.gain,
      })),
    };
  }, [selected.design, s.stereoPan, s.harmonicBoost, s.reverbMix]);

  const euclidPattern = useMemo(() => {
    const steps = Math.max(4, s.euclidSteps ?? 8);
    const pulses = Math.max(1, Math.min(steps, s.euclidPulses ?? 5));
    const arr: boolean[] = [];
    for (let i = 0; i < steps; i++) {
      arr.push((i * pulses) % steps < pulses);
    }
    return arr;
  }, [s.euclidPulses, s.euclidSteps]);

  useEffect(() => {
    if (!seqPlaying) return;
    const intervalMs = Math.max(90, Math.round(60000 / (s.bpm ?? 116) / 2));
    const id = window.setInterval(() => {
      setSeqStep((prev) => {
        const next = (prev + 1) % euclidPattern.length;
        if (euclidPattern[next]) {
          soundEngine.playDesign(customizedDesign, {
            ...options,
            pitch: (options.pitch ?? 1) * (next === 0 ? 1.2 : 1),
            force: true,
          });
        }
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [seqPlaying, s.bpm, euclidPattern, customizedDesign, options]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SOUND_LIBRARY.filter((r) => {
      const haystack = `${r.id} ${r.nameFa} ${r.descFa} ${r.tags.join(" ")}`.toLowerCase();
      const matchTerm = !term || haystack.includes(term);
      const matchCat = cat === "all" ? true : cat === "long" ? r.duration >= 5 : r.category === cat;
      return matchTerm && matchCat;
    });
  }, [q, cat]);

  const countFor = (c: (typeof CATEGORY_ORDER)[number]) =>
    c === "all"
      ? SOUND_LIBRARY.length
      : c === "long"
        ? SOUND_LIBRARY.filter((r) => r.duration >= 5).length
        : SOUND_LIBRARY.filter((r) => r.category === c).length;

  const stopTimers = () => {
    if (playTimer.current) window.clearTimeout(playTimer.current);
    if (progressTimer.current) window.clearInterval(progressTimer.current);
    playTimer.current = null;
    progressTimer.current = null;
  };

  const stop = () => {
    soundEngine.stopAll();
    stopTimers();
    setPlaying(false);
    setElapsed(0);
  };

  const play = (item: SoundItem = selected) => {
    interacted.current = true;
    stopTimers();
    const designToPlay = item.id === selected.id ? customizedDesign : item.design;
    const ok = soundEngine.playDesign({ ...designToPlay }, { ...options, force: true });
    if (!ok) {
      toast.push("پخش ممکن نشد", {
        desc: "مرورگر اجازه صدا نداد — یک‌بار روی صفحه کلیک کن",
        tone: "error",
      });
      return;
    }
    /* برخی مرورگرها فقط پس از یک لمس واقعی صدا را آزاد می‌کنند */
    window.setTimeout(() => {
      if (soundEngine.contextState === "suspended") {
        toast.push("مرورگر هنوز صدا را آزاد نکرده", {
          desc: "یک‌بار روی صفحه ضربه بزن و دوباره پخش را بزن",
          tone: "error",
        });
      }
    }, 450);

    /* طول واقعی صدا (با استرچ و دنباله ریورب) — نه عدد دستی */
    const total = Math.max(0.12, audibleDuration(item.design, options));
    setPlaying(true);
    setElapsed(0);
    const started = performance.now();
    progressTimer.current = window.setInterval(() => {
      const t = (performance.now() - started) / 1000 / total;
      setElapsed(Math.min(1, t));
    }, 60);
    playTimer.current = window.setTimeout(
      () => {
        setPlaying(false);
        setElapsed(0);
        stopTimers();
      },
      total * 1000 + 140
    );
  };

  useEffect(
    () => () => {
      stopTimers();
      soundEngine.stopAll();
    },
    []
  );

  /* تغییر اسلایدرها با تأخیر کوتاه پخش می‌شود تا هنگام کشیدن، صداها روی هم نیفتند */
  useEffect(() => {
    if (!s.autoPreview || !interacted.current) return;
    const id = window.setTimeout(() => play(selected), 180);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, s.pitch, s.gain, s.cutoff, s.stretch, s.noise]);

  const downloadWav = async () => {
    try {
      const blob = await soundEngine.renderDesignWav(customizedDesign, options);
      if (blob.size < 100) return false;
      saveBlob(blob, `${selected.id}.wav`);
      return true;
    } catch {
      toast.push("رندر WAV ناموفق بود", {
        desc: "مرورگر از OfflineAudioContext پشتیبانی نمی‌کند",
        tone: "error",
      });
      return false;
    }
  };

  const downloadKit = async () => {
    const wav = await soundEngine.renderDesignWav(selected.design, options).catch(() => null);
    return saveKit(`rtl-sound-${selected.id}`, [
      ...(wav ? [{ name: `${selected.id}.wav`, content: wav }] : []),
      { name: "design.json", content: JSON.stringify({ ...selected, options }, null, 2) },
      {
        name: "usage.tsx",
        content: `import { soundEngine } from "@/engines/soundEngine";
import { SOUND_LIBRARY } from "@/data/soundLibrary";

const item = SOUND_LIBRARY.find((x) => x.id === "${selected.id}")!;
soundEngine.playDesign(item.design, ${JSON.stringify(options)});`,
      },
    ]);
  };

  /* ------------------------------------------------------------------ rails */

  const rows = filtered.slice(0, 300).map((item) => {
    const active = item.id === selectedId;
    return (
      <button
        key={item.id}
        onClick={() => {
          setSelectedId(item.id);
          if (s.autoPreview) play(item);
        }}
        className={cn(
          "mb-1 flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-start transition-colors",
          active
            ? "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/[0.08]"
            : "border-transparent hover:border-white/10 hover:bg-white/[0.035]"
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            active
              ? "bg-[color:var(--accent)]/20 text-[color:var(--accent)]"
              : "bg-white/[0.04] text-zinc-500"
          )}
        >
          <Play className="h-3 w-3" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn("block truncate text-[11.5px]", active ? "text-white" : "text-zinc-300")}
          >
            {item.nameFa}
          </span>
          <span className="block truncate text-[9.5px] text-zinc-600">
            {SOUND_CATEGORY_LABEL[item.category]} · {seconds(item.duration)}
          </span>
        </span>
        {item.duration >= 5 && (
          <span className="shrink-0 text-[9px] text-[color:var(--accent)]/80">بلند</span>
        )}
      </button>
    );
  });

  const list = (
    <StudioList
      title="کتابخانه صدا"
      subtitle={`${faNum(filtered.length)} از ${faNum(SOUND_LIBRARY.length)} رسیپی`}
      toolbar={<Badge tone="accent">{faNum(SOUND_LIBRARY.length)}</Badge>}
      footer="همه صداها سینتز زنده‌اند؛ فایل صوتی خارجی وجود ندارد"
      className="min-h-[360px] desk:min-h-0"
    >
      <div className="sticky top-0 z-10 -m-1.5 mb-1.5 space-y-2 bg-[#0D0D10]/95 p-1.5 backdrop-blur">
        <SearchField value={q} onChange={setQ} placeholder="نام، برچسب یا کاربرد…" />
        <div className="flex flex-wrap gap-1">
          {CATEGORY_ORDER.map((c) => (
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
              {c === "all" ? "همه" : c === "long" ? "بلند" : SOUND_CATEGORY_LABEL[c]}{" "}
              <span className="font-mono opacity-60">{faNum(countFor(c))}</span>
            </button>
          ))}
        </div>
      </div>
      {rows}
      {filtered.length === 0 && (
        <p className="py-8 text-center text-[11px] text-zinc-600">صدایی پیدا نشد</p>
      )}
    </StudioList>
  );

  const stage = (
    <div className="space-y-3">
      <Panel padded={false} className="overflow-hidden desk:sticky desk:top-0 desk:z-20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-hasti text-[17px] text-white">{selected.nameFa}</h2>
              <Badge tone="accent">{SOUND_CATEGORY_LABEL[selected.category]}</Badge>
              <Badge>{seconds(selected.duration)}</Badge>
            </div>
            <p className="mt-0.5 truncate text-[10.5px] text-zinc-500">{selected.descFa}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => (playing ? stop() : play())}
              aria-pressed={playing}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition-colors",
                playing
                  ? "bg-white/10 text-white ring-1 ring-inset ring-white/20"
                  : "bg-[color:var(--accent)] text-black"
              )}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "توقف" : "پخش"}
            </button>
            <DownloadButton
              label="WAV"
              filename={`${selected.id}.wav`}
              onDownload={downloadWav}
              variant="outline"
            />
            <DownloadButton
              label="کیت"
              filename={`rtl-sound-${selected.id}.zip`}
              onDownload={downloadKit}
              variant="solid"
            />
          </div>
        </div>

        <div className="relative bg-[#0A0A0C] px-3 py-3">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(60% 120% at 50% 0%, rgba(var(--accent-glow),0.12), transparent 70%)",
            }}
          />
          <div className="relative">
            <Waveform item={selected} options={options} version={version} progress={elapsed} />
            <div
              className="mt-1 flex items-center justify-between font-mono text-[9.5px] text-zinc-600"
              dir="ltr"
            >
              <span>0s</span>
              <span>{audibleDuration(selected.design, options).toFixed(2)}s</span>
              <span>{faNum(selected.design.layers.length)} layers</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-white/[0.06] bg-white/[0.04] sm:grid-cols-4">
          {[
            { k: "لایه‌ها", v: faNum(selected.design.layers.length), i: Sparkles },
            { k: "طول", v: seconds(selected.duration), i: Timer },
            {
              k: "ریورب",
              v: selected.design.reverb
                ? `${faNum(Math.round(selected.design.reverb.mix * 100))}%`
                : "—",
              i: Waves,
            },
            { k: "دسته", v: SOUND_CATEGORY_LABEL[selected.category], i: Volume2 },
          ].map((m) => (
            <div key={m.k} className="bg-[#0D0D10] px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <m.i className="h-3 w-3" />
                {m.k}
              </div>
              <div className="mt-0.5 truncate font-mono text-[13px] text-zinc-100">{m.v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="طراحی صدا (JSON)" subtitle="همان چیزی که موتور سینتز اجرا می‌کند">
        <CodeBlock
          code={JSON.stringify(selected.design, null, 2)}
          language="json"
          maxLines={14}
          filename={`${selected.id}.json`}
        />
      </Panel>

      <Panel title="صدای همین دسته" subtitle="برای شنیدن سریع و مقایسه" padded={false}>
        <div className="grid max-h-56 grid-cols-2 gap-1 overflow-y-auto p-2 studio-scroll sm:grid-cols-3">
          {SOUND_LIBRARY.filter((r) => r.category === selected.category && r.id !== selected.id)
            .slice(0, 12)
            .map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedId(r.id);
                  play(r);
                }}
                className="truncate rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-start text-[10.5px] text-zinc-300 hover:border-[color:var(--accent)]/40 hover:text-white"
              >
                {r.nameFa}
                <span className="ms-1 text-[9px] text-zinc-600">{seconds(r.duration)}</span>
              </button>
            ))}
        </div>
      </Panel>
    </div>
  );

  const settings = (
    <div className="space-y-3">
      <Panel title="میکس و فضاسازی پیشرفته" subtitle="روی پخش زنده و خروجی WAV اثر می‌گذارد">
        <div className="space-y-3">
          <Slider
            label="زیر و بمی (Pitch)"
            value={s.pitch ?? 1}
            min={0.5}
            max={2}
            step={0.01}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => set({ pitch: v })}
          />
          <Slider
            label="بلندی (Master Gain)"
            value={s.gain ?? 1}
            min={0}
            max={2}
            step={0.01}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => set({ gain: v })}
          />
          <Slider
            label="فیلتر (Cutoff)"
            value={s.cutoff ?? 1}
            min={0.2}
            max={3}
            step={0.01}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => set({ cutoff: v })}
          />
          <Slider
            label="کشش زمان (Time Stretch)"
            value={s.stretch}
            min={0.5}
            max={2.5}
            step={0.01}
            format={(v) => `${v.toFixed(2)}×`}
            onChange={(v) => set({ stretch: v })}
            hint="صداهای بلند تا ۳۰ ثانیه کشیده می‌شوند"
          />
          <Slider
            label="پژواک فضایی (Reverb Mix)"
            value={s.reverbMix ?? 0.28}
            min={0}
            max={0.95}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => set({ reverbMix: v })}
          />
          <Slider
            label="مکان استریو (Stereo Pan L/R)"
            value={s.stereoPan ?? 0}
            min={-1}
            max={1}
            step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={(v) => set({ stereoPan: v })}
          />
          <Slider
            label="تقویت هارمونیک (Overtone Boost)"
            value={s.harmonicBoost ?? 1}
            min={0.2}
            max={2.2}
            step={0.1}
            format={(v) => `${v.toFixed(1)}×`}
            onChange={(v) => set({ harmonicBoost: v })}
          />
        </div>
      </Panel>

      <Panel
        title={`سکوئنسر ریتم اقلیدسی E(${s.euclidPulses ?? 5}, ${s.euclidSteps ?? 8})`}
        subtitle="تست ضرب‌آهنگ تعامل با الگوریتم بیورکلوند"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-1">
            {euclidPattern.map((hit, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex h-6 items-center justify-center rounded border font-mono text-[9px]",
                  seqPlaying && seqStep === idx
                    ? "border-amber-300 bg-amber-400 font-bold text-black"
                    : hit
                      ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/20 text-[color:var(--accent)]"
                      : "border-white/10 bg-black/40 text-zinc-600"
                )}
              >
                {hit ? "●" : "·"}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSeqPlaying((v) => !v)}
            className={cn(
              "w-full rounded-lg py-1.5 text-[11px] font-bold transition-colors",
              seqPlaying
                ? "bg-amber-400 text-black"
                : "border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
            )}
          >
            {seqPlaying ? "توقف ریتم اقلیدسی" : "اجرای زنده ریتم اقلیدسی"}
          </button>
          <Slider
            label="ضرب‌های فعال (Pulses k)"
            value={s.euclidPulses ?? 5}
            min={1}
            max={s.euclidSteps ?? 8}
            step={1}
            onChange={(v) => set({ euclidPulses: v })}
          />
          <Slider
            label="کل گام‌ها (Steps n)"
            value={s.euclidSteps ?? 8}
            min={4}
            max={16}
            step={1}
            onChange={(v) =>
              set({ euclidSteps: v, euclidPulses: Math.min(s.euclidPulses ?? 5, v) })
            }
          />
          <Slider
            label="سرعت ریتم (BPM)"
            value={s.bpm ?? 116}
            min={60}
            max={180}
            step={2}
            unit="BPM"
            onChange={(v) => set({ bpm: v })}
          />
        </div>
      </Panel>

      <Panel title="رفتار">
        <div className="space-y-1.5">
          <Toggle
            label="پیش‌شنود خودکار"
            checked={s.autoPreview}
            onChange={(v) => set({ autoPreview: v })}
            hint="با انتخاب هر رسیپی پخش می‌شود"
          />
          <Toggle
            label="افزودن نویز"
            checked={s.noise}
            onChange={(v) => set({ noise: v })}
            hint="برای رسیپی‌های قدیمی"
          />
          <button
            onClick={() => {
              setVersion((v) => v + 1);
              play();
            }}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[11px] text-zinc-300 hover:text-white"
          >
            رندر دوباره شکل موج
          </button>
        </div>
      </Panel>

      <Panel tone="inset" title="چطور استفاده کنم؟">
        <pre
          dir="ltr"
          className="overflow-x-auto rounded-lg bg-black/50 p-2 font-mono text-[10px] leading-relaxed text-zinc-300"
        >
          {`soundEngine.playDesign(item.design, { gain: 0.8 });`}
        </pre>
        <p className="mt-2 text-[10.5px] leading-relaxed text-zinc-500">
          هر صدا فقط چند نود Web Audio است؛ بدون فایل، بدون دانلود و بدون تأخیر شبکه. صداهای بلند را
          می‌توانید مستقیم به‌عنوان بستر ویدیو یا لایه رابط استفاده کنید.
        </p>
      </Panel>

      <Panel title="آمار کتابخانه">
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              ["کل", SOUND_LIBRARY.length],
              ["بلند (۵s+)", countFor("long")],
              ["سینمایی", countFor("cinematic")],
              ["فضا", countFor("air")],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
              <div className="text-[9.5px] text-zinc-500">{k}</div>
              <div className="font-mono text-[13px] text-zinc-100">{faNum(v)}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  return (
    <StudioShell
      eyebrow="SOUND STUDIO"
      title="استودیو صدای رویه‌ای"
      description={`${faNum(SOUND_LIBRARY.length)} رسیپی لایه‌ای با فیلتر، ریورب و پن استریو؛ از کلیک ۸۰ میلی‌ثانیه‌ای تا فضای ۲۰ ثانیه‌ای.`}
      icon={Waves}
      stats={
        <>
          <Badge tone="accent">{faNum(SOUND_LIBRARY.length)} صدا</Badge>
          <Badge>{faNum(countFor("long"))} بلند</Badge>
        </>
      }
      actions={
        <DownloadButton
          label="دانلود کتابخانه"
          filename="rtl-sound-library.json"
          onDownload={() => saveTextLibrary()}
          variant="outline"
        />
      }
      onReset={() => {
        reset();
        setVersion((v) => v + 1);
      }}
      list={list}
      stage={stage}
      settings={settings}
      listWidth="252px"
      settingsWidth="302px"
    />
  );
};

/** Exported as a helper so the download button in the header stays declarative. */
function saveTextLibrary() {
  const json = JSON.stringify({ total: SOUND_LIBRARY.length, sounds: SOUND_LIBRARY }, null, 2);
  saveBlob(new Blob([json], { type: "application/json" }), "rtl-sound-library.json");
  return true;
}

export default SoundStudio;
