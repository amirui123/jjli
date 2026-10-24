import { useState, useRef, useCallback } from "react";
import { play, type SoundConfig, type LayerConfig } from "plinq";
import { TextMorph } from "torph/react";

const WAVEFORMS = ["sine", "triangle", "square", "sawtooth"] as const;
const FILTER_TYPES = [
  "lowpass",
  "highpass",
  "bandpass",
  "notch",
  "allpass",
  "peaking",
  "lowshelf",
  "highshelf",
] as const;

function cleanConfig(config: SoundConfig) {
  return JSON.parse(
    JSON.stringify(config, (key, value) => {
      if (value === undefined) return undefined;
      if (value === 0 && (key === "frequencyEnd" || key === "delay"))
        return undefined;
      return value;
    })
  );
}

const MAX_LAYERS = 4;

const DEFAULT_LAYER: LayerConfig = {
  source: { type: "oscillator", waveform: "sine", frequency: 440 },
  envelope: { attack: 0.001, decay: 0.1 },
  gain: 0.25,
};

export function Playground() {
  const [config, setConfig] = useState<SoundConfig>({
    layers: [structuredClone(DEFAULT_LAYER)],
  });
  const [activeLayer, setActiveLayer] = useState(0);
  const [copied, setCopied] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const playTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedPlay = useCallback(
    (cfg: SoundConfig) => {
      if (!autoPlay) return;
      clearTimeout(playTimeout.current);
      playTimeout.current = setTimeout(() => play(cfg), 80);
    },
    [autoPlay]
  );

  const updateLayer = (
    index: number,
    updater: (layer: LayerConfig) => void
  ) => {
    setConfig((prev) => {
      const next = {
        layers: prev.layers.map((l, i) => {
          if (i !== index) return l;
          const clone = structuredClone(l);
          updater(clone);
          return clone;
        }),
      };
      debouncedPlay(next);
      return next;
    });
  };

  const addLayer = () => {
    if (config.layers.length >= MAX_LAYERS) return;
    setConfig((prev) => ({
      layers: [...prev.layers, structuredClone(DEFAULT_LAYER)],
    }));
    setActiveLayer(config.layers.length);
  };

  const removeLayer = (index: number) => {
    if (config.layers.length <= 1) return;
    setConfig((prev) => ({
      layers: prev.layers.filter((_, i) => i !== index),
    }));
    setActiveLayer((prev) => Math.min(prev, config.layers.length - 2));
  };

  const copyConfig = () => {
    const clean = cleanConfig(config);
    const code = `import { play } from 'plinq'\n\nplay(${JSON.stringify(clean, null, 2)})`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const layer = config.layers[activeLayer];
  const isOsc = layer?.source.type === "oscillator";
  const hasFilter = !!layer?.filter;

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto scrollbar-none">
          {config.layers.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveLayer(i)}
              className={`text-[12px] px-3 py-1.5 rounded-md cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 ${activeLayer === i
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
            >
              Layer {i + 1}
              {activeLayer === i && config.layers.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayer(i);
                  }}
                  className="text-zinc-400 hover:text-red-400 transition-colors -mr-1 p-1 -my-1"
                >
                  ×
                </span>
              )}
            </button>
          ))}
          {config.layers.length < MAX_LAYERS && (
            <button
              onClick={addLayer}
              className="text-[14px] leading-[14px] px-2 py-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors shrink-0"
            >
              +
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={copyConfig}
            className="text-[12px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer px-2.5 py-1.5"
          >
            <TextMorph>{copied ? "Copied!" : "Copy config"}</TextMorph>
          </button>
          <button
            onClick={() => setAutoPlay((p) => !p)}
            className={`text-[12px] px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${autoPlay
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
          >
            <TextMorph>{autoPlay ? "Auto-play on" : "Auto-play off"}</TextMorph>
          </button>



          <button
            onClick={() => play(config)}
            className="text-[12px] px-3 py-1.5 rounded-md bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors cursor-pointer active:scale-[0.97]"
          >
            Play
          </button>
        </div>
      </div>

      {/* Layer controls */}
      {layer && (
        <div className="p-4 space-y-4">
          {/* Source */}
          <div className="space-y-4">
            <SelectField
              label="source"
              desc="Oscillator generates a tone, noise generates static"
              value={layer.source.type}
              options={["oscillator", "noise"]}
              onChange={(v) =>
                updateLayer(activeLayer, (l) => {
                  if (v === "oscillator") {
                    l.source = {
                      type: "oscillator",
                      waveform: "sine",
                      frequency: 440,
                    };
                  } else {
                    l.source = { type: "noise" };
                  }
                })
              }
            />
            {isOsc && layer.source.type === "oscillator" && (
              <>
                <SelectField
                  label="waveform"
                  desc="Shape of the wave — sine is smooth, square is buzzy"
                  value={layer.source.waveform}
                  options={[...WAVEFORMS]}
                  onChange={(v) =>
                    updateLayer(activeLayer, (l) => {
                      if (l.source.type === "oscillator")
                        l.source.waveform = v as (typeof WAVEFORMS)[number];
                    })
                  }
                />
                <RangeField
                  label="frequency"
                  desc="Pitch of the sound in Hz"
                  value={layer.source.frequency}
                  min={20}
                  max={4000}
                  step={1}
                  onChange={(v) =>
                    updateLayer(activeLayer, (l) => {
                      if (l.source.type === "oscillator")
                        l.source.frequency = v;
                    })
                  }
                />
                <RangeField
                  label="Freq End"
                  desc="Pitch slides to this value — 0 means no slide"
                  value={layer.source.frequencyEnd ?? 0}
                  min={0}
                  max={4000}
                  step={1}
                  onChange={(v) =>
                    updateLayer(activeLayer, (l) => {
                      if (l.source.type === "oscillator")
                        l.source.frequencyEnd = v || undefined;
                    })
                  }
                />
              </>
            )}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800" />

          {/* Filter */}
          <div className="space-y-4">
            <SelectField
              label="filter"
              desc="Shapes the tone by cutting certain frequencies"
              value={hasFilter ? layer.filter!.type : "none"}
              options={["none", ...FILTER_TYPES]}
              onChange={(v) =>
                updateLayer(activeLayer, (l) => {
                  if (v === "none") {
                    delete l.filter;
                  } else {
                    l.filter = l.filter || {
                      type: v as BiquadFilterType,
                      frequency: 1000,
                      Q: 1,
                    };
                    l.filter.type = v as BiquadFilterType;
                  }
                })
              }
            />
            {hasFilter && layer.filter && (
              <>
                <RangeField
                  label="frequency"
                  desc="Cutoff point for the filter"
                  value={layer.filter.frequency}
                  min={20}
                  max={8000}
                  step={1}
                  onChange={(v) =>
                    updateLayer(activeLayer, (l) => {
                      if (l.filter) l.filter.frequency = v;
                    })
                  }
                />
                <RangeField
                  label="Q"
                  desc="How sharp the filter is — higher = more resonant"
                  value={layer.filter.Q ?? 1}
                  min={0.1}
                  max={20}
                  step={0.1}
                  onChange={(v) =>
                    updateLayer(activeLayer, (l) => {
                      if (l.filter) l.filter.Q = v;
                    })
                  }
                />
              </>
            )}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800" />

          {/* Envelope & Output */}
          <div className="space-y-4">
            <RangeField
              label="attack"
              desc="How quickly the sound fades in"
              value={layer.envelope.attack}
              min={0.001}
              max={0.5}
              step={0.001}
              onChange={(v) =>
                updateLayer(activeLayer, (l) => {
                  l.envelope.attack = v;
                })
              }
            />
            <RangeField
              label="decay"
              desc="How quickly the sound fades out"
              value={layer.envelope.decay}
              min={0.01}
              max={2}
              step={0.01}
              onChange={(v) =>
                updateLayer(activeLayer, (l) => {
                  l.envelope.decay = v;
                })
              }
            />
            <RangeField
              label="gain"
              desc="Volume of this layer"
              value={layer.gain}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) =>
                updateLayer(activeLayer, (l) => {
                  l.gain = v;
                })
              }
            />
            <RangeField
              label="delay"
              desc="Time before this layer starts, in seconds"
              value={layer.delay ?? 0}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) =>
                updateLayer(activeLayer, (l) => {
                  l.delay = v || undefined;
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Tooltip({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="relative group w-[72px] shrink-0">
      <label className="text-[12px] text-zinc-500 dark:text-zinc-400 cursor-default border-b border-dashed border-transparent group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
        {label.slice(0, 1).toUpperCase() + label.slice(1)}
      </label>
      {desc && (
        <div className="absolute -left-3 bottom-[70%] mb-2 px-2.5 py-1.5 rounded-md bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-800 text-[11px] leading-snug whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 shadow-lg">
          {desc}
          <div className="absolute left-3 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-zinc-800 dark:border-t-zinc-200" />
        </div>
      )}
    </div>
  );
}

function RangeField({
  label,
  desc,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  desc?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Tooltip label={label} desc={desc} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span className="font-mono text-[11px] text-zinc-400 w-[52px] text-right tabular-nums">
        {value.toFixed(step < 1 ? (step < 0.01 ? 3 : 2) : 0)}
      </span>
    </div>
  );
}

function SelectField({
  label,
  desc,
  value,
  options,
  onChange,
}: {
  label: string;
  desc?: string;
  value: string;
  options: readonly string[] | string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Tooltip label={label} desc={desc} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-[8px] px-3 py-1.5 text-[12px] font-mono text-zinc-700 dark:text-zinc-300 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.slice(0, 1).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
