export const catalog = [
  ["action.press", "Press", "Controls", "A soft, tactile downstroke.", [240, 160], 0.07],
  ["action.release", "Release", "Controls", "A light lift to complete a press.", [320, 490], 0.065],
  ["action.select", "Select", "Controls", "A precise tick for a deliberate choice.", [660], 0.065],
  [
    "action.confirm",
    "Confirm",
    "Controls",
    "A rounded double tap that settles in.",
    [440, 660],
    0.14,
  ],
  ["action.cancel", "Cancel", "Controls", "A gentle step back, without alarm.", [390, 260], 0.13],
  [
    "overlay.open",
    "Open",
    "Navigation",
    "An airy rise as a new layer appears.",
    [280, 420, 560],
    0.18,
  ],
  [
    "overlay.close",
    "Close",
    "Navigation",
    "A soft descent as a layer falls away.",
    [560, 420, 280],
    0.14,
  ],
  [
    "navigation.forward",
    "Forward",
    "Navigation",
    "A small ascending step into the next view.",
    [392, 523],
    0.13,
  ],
  [
    "navigation.backward",
    "Backward",
    "Navigation",
    "A descending pair for the way back.",
    [523, 392],
    0.13,
  ],
  [
    "navigation.arrive",
    "Arrive",
    "Navigation",
    "A spacious landing for a new destination.",
    [330, 495, 660],
    0.23,
  ],
  [
    "state.info",
    "Information",
    "Feedback",
    "A clear, neutral note. Something to know.",
    [523, 523],
    0.16,
  ],
  [
    "state.success",
    "Success",
    "Feedback",
    "Three warm notes. A job well done.",
    [523, 659, 784],
    0.27,
  ],
  [
    "state.warning",
    "Warning",
    "Feedback",
    "A measured double note asking for attention.",
    [440, 466],
    0.24,
  ],
  [
    "state.error",
    "Error",
    "Feedback",
    "A low descending pair. Clear, never harsh.",
    [294, 220],
    0.23,
  ],
  [
    "progress.start",
    "Processing",
    "Progress",
    "A quiet pulse while work is in motion.",
    [220, 330],
    0.26,
  ],
  [
    "progress.complete",
    "Complete",
    "Progress",
    "An upward resolve when the work is finished.",
    [392, 587, 784],
    0.25,
  ],
  [
    "progress.fail",
    "Failed",
    "Progress",
    "A muted fall when an operation needs help.",
    [330, 247, 196],
    0.24,
  ],
  [
    "progress.cancel",
    "Stopped",
    "Progress",
    "A short, soft landing for cancelled work.",
    [294, 196],
    0.12,
  ],
  [
    "drag.pickup",
    "Pick up",
    "Controls",
    "A tiny lift as an object leaves its place.",
    [260, 520],
    0.1,
  ],
  [
    "drag.move",
    "Move",
    "Controls",
    "A quiet detent for a meaningful position change.",
    [350],
    0.045,
  ],
  ["drag.drop", "Drop", "Controls", "A satisfying, grounded landing.", [520, 260, 195], 0.13],
  [
    "drag.reject",
    "Reject",
    "Controls",
    "A soft rebound for an unavailable target.",
    [260, 290, 240],
    0.14,
  ],
  [
    "agent.connecting",
    "Connecting",
    "Agent",
    "A patient pair while a connection is made.",
    [262, 330],
    0.24,
  ],
  [
    "agent.listening",
    "Listening",
    "Agent",
    "An open interval. Ready for your input.",
    [392, 587],
    0.24,
  ],
  [
    "agent.thinking",
    "Thinking",
    "Agent",
    "An understated pulse for work in progress.",
    [196, 294],
    0.32,
  ],
  [
    "agent.streaming",
    "Streaming",
    "Agent",
    "A restrained tick for a meaningful chunk, not every token.",
    [440],
    0.05,
  ],
  [
    "agent.tool.started",
    "Tool started",
    "Agent",
    "A small opening note for a tool call.",
    [330, 440],
    0.11,
  ],
  [
    "agent.tool.completed",
    "Tool complete",
    "Agent",
    "A quick upward answer from a tool.",
    [440, 554],
    0.13,
  ],
  [
    "agent.tool.failed",
    "Tool failed",
    "Agent",
    "A low pair when a tool needs another approach.",
    [277, 207],
    0.18,
  ],
  [
    "agent.waiting-for-user",
    "Your turn",
    "Agent",
    "A gentle invitation to continue.",
    [587, 740, 587],
    0.3,
  ],
  [
    "agent.interrupted",
    "Interrupted",
    "Agent",
    "A brief descent that acknowledges an interruption.",
    [392, 294],
    0.14,
  ],
  [
    "agent.ready",
    "Ready",
    "Agent",
    "A bright, settled resolution. The result is here.",
    [440, 554, 659],
    0.28,
  ],
] as const;

export type SoundEvent = (typeof catalog)[number][0];
export type Category = (typeof catalog)[number][2];
export type ThemeName = "studio" | "soft" | "arcade";
export type Waveform = "sine" | "triangle";
export interface Tone {
  frequency: number;
  endFrequency?: number;
  delay: number;
  duration: number;
  gain: number;
  waveform: Waveform;
}
export interface Recipe {
  tones: Tone[];
  duration: number;
}
export type SoundTheme = Record<SoundEvent, Recipe>;
export const events = catalog.map(([event]) => event);
export const categories = ["Controls", "Feedback", "Navigation", "Progress", "Agent"] as const;

export function createTheme(name: ThemeName = "studio"): SoundTheme {
  return Object.fromEntries(
    catalog.map(([event, , , , notes, duration]) => {
      const stretch = name === "soft" ? 1.3 : name === "arcade" ? 0.8 : 1;
      const tones = notes.map((frequency, i) => ({
        frequency: frequency * (name === "soft" ? 0.8 : name === "arcade" ? 1.5 : 1),
        delay: ((i * duration) / notes.length) * 0.65 * stretch,
        duration: duration * stretch * 0.7,
        gain: (name === "soft" ? 0.18 : 0.22) / Math.sqrt(notes.length),
        waveform: name === "arcade" ? ("triangle" as const) : ("sine" as const),
      }));
      return [
        event,
        { tones, duration: Math.max(...tones.map((t) => t.delay + t.duration)) + 0.025 },
      ];
    }),
  ) as SoundTheme;
}

function validRecipe(value: unknown): value is Recipe {
  if (!value || typeof value !== "object") return false;
  const recipe = value as Recipe;
  return (
    Number.isFinite(recipe.duration) &&
    recipe.duration > 0 &&
    recipe.duration <= 3 &&
    Array.isArray(recipe.tones) &&
    recipe.tones.length > 0 &&
    recipe.tones.length <= 16 &&
    recipe.tones.every(
      (t) =>
        t &&
        typeof t === "object" &&
        Number.isFinite(t.frequency) &&
        t.frequency >= 20 &&
        t.frequency <= 20000 &&
        (t.endFrequency === undefined ||
          (Number.isFinite(t.endFrequency) && t.endFrequency >= 20 && t.endFrequency <= 20000)) &&
        Number.isFinite(t.duration) &&
        t.duration > 0 &&
        Number.isFinite(t.delay) &&
        t.delay >= 0 &&
        t.delay + t.duration <= recipe.duration &&
        Number.isFinite(t.gain) &&
        t.gain >= 0 &&
        t.gain <= 0.5 &&
        ["sine", "triangle"].includes(t.waveform),
    )
  );
}
export function validateTheme(value: unknown): value is SoundTheme {
  if (!value || typeof value !== "object") return false;
  return events.every((event) => validRecipe((value as SoundTheme)[event]));
}

export function renderPCM(recipe: Recipe, sampleRate = 44100): Float32Array {
  if (!Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 192000)
    throw new RangeError("Sample rate must be 8000–192000 Hz.");
  if (!validRecipe(recipe))
    throw new RangeError("Invalid recipe: use bounded tones and a duration up to 3 seconds.");
  const output = new Float32Array(Math.ceil(recipe.duration * sampleRate));
  for (const tone of recipe.tones) {
    const length = Math.ceil(tone.duration * sampleRate);
    const start = Math.floor(tone.delay * sampleRate);
    for (let i = 0; i < length && start + i < output.length; i++) {
      const time = i / sampleRate;
      const progress = i / length;
      const attack = Math.min(1, time / 0.006);
      const envelope =
        attack * (1 - progress) ** 3 * Math.min(1, ((1 - progress) * tone.duration) / 0.008);
      const phase =
        2 *
        Math.PI *
        (tone.frequency * time +
          (((tone.endFrequency ?? tone.frequency) - tone.frequency) * time * time) /
            (2 * tone.duration));
      const wave =
        tone.waveform === "triangle" ? (2 / Math.PI) * Math.asin(Math.sin(phase)) : Math.sin(phase);
      output[start + i] += wave * envelope * tone.gain;
    }
  }
  // Soft limiting bounds a custom recipe without introducing a hard clipping edge.
  for (let i = 0; i < output.length; i++) output[i] = Math.tanh(output[i]);
  return output;
}

export function encodeWav(samples: Float32Array, sampleRate = 44100): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const write = (at: number, text: string) =>
    [...text].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, bytes.length - 8, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) =>
    view.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true),
  );
  return bytes;
}
