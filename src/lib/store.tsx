import { soundEngine } from "../engines/soundEngine";
import { publicUrl } from "./base";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ storage */

const PREFIX = "rtmlab.v1.";

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

/** Persisted object state with shallow-merge hydration + debounced writes. */
/** Writes a patch to a persisted key — used for cross-page deep links. */
export function writePersisted<T extends object>(key: string, patch: Partial<T>) {
  try {
    const current = readJSON<T>(key, {} as T);
    localStorage.setItem(PREFIX + key, JSON.stringify({ ...current, ...patch }));
  } catch {
    /* quota or private mode — ignore */
  }
}

export function usePersisted<T extends object>(
  key: string,
  initial: T
): [T, (patch: Partial<T> | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => readJSON(key, initial));
  const initialRef = useRef(initial);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(state));
      } catch {
        /* quota — ignore */
      }
    }, 220);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [key, state]);

  const update = useCallback((patch: Partial<T> | ((prev: T) => T)) => {
    setState((prev) =>
      typeof patch === "function"
        ? (patch as (p: T) => T)(prev)
        : { ...prev, ...patch }
    );
  }, []);

  const reset = useCallback(() => {
    setState(initialRef.current);
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  }, [key]);

  return [state, update, reset];
}

/* ------------------------------------------------------------ app settings */

export type AccentId =
  | "saffron"
  | "turquoise"
  | "lapis"
  | "emerald"
  | "rose"
  | "violet";

export interface AccentTheme {
  id: AccentId;
  labelFa: string;
  hex: string;
  soft: string;
  glow: string;
}

export const ACCENTS: AccentTheme[] = [
  { id: "saffron", labelFa: "زعفران", hex: "#E8B33A", soft: "#3a2c10", glow: "232,179,58" },
  { id: "turquoise", labelFa: "فیروزه", hex: "#2DD4BF", soft: "#0c3330", glow: "45,212,191" },
  { id: "lapis", labelFa: "لاجورد", hex: "#6366F1", soft: "#1b1c3d", glow: "99,102,241" },
  { id: "emerald", labelFa: "زمرد", hex: "#34D399", soft: "#0e3327", glow: "52,211,153" },
  { id: "rose", labelFa: "یاقوت", hex: "#FB7185", soft: "#3a1620", glow: "251,113,133" },
  { id: "violet", labelFa: "بنفش", hex: "#A78BFA", soft: "#241b45", glow: "167,139,250" },
];

export interface AppSettings {
  accent: AccentId;
  /** exact hex override (used when applying a brand palette) */
  customAccent: string | null;
  sound: boolean;
  motionLevel: 1 | 2 | 3; // ۱ = کم، ۲ = معمول، ۳ = کامل
  reduceMotion: boolean;
  displayFont: string; // css class used for display typography
  fontScale: 1 | 1.08 | 1.15;
  highContrast: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  accent: "saffron",
  customAccent: null,
  sound: true,
  motionLevel: 3,
  reduceMotion: false,
  displayFont: "font-hasti",
  fontScale: 1,
  highContrast: false,
};

interface Ctx {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
  accent: AccentTheme;
  motionScale: number;
}

const SettingsCtx = createContext<Ctx | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, update, reset] = usePersisted<AppSettings>(
    "app-settings",
    DEFAULT_SETTINGS
  );

  const baseAccent = ACCENTS.find((a) => a.id === settings.accent) ?? ACCENTS[0];
  const accent = useMemo<AccentTheme>(
    () =>
      settings.customAccent
        ? { ...baseAccent, hex: settings.customAccent, glow: hexToRgb(settings.customAccent) }
        : baseAccent,
    [baseAccent, settings.customAccent]
  );
  const motionScale =
    settings.reduceMotion || settings.motionLevel === 1
      ? 0.35
      : settings.motionLevel === 2
      ? 0.7
      : 1;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent.hex);
    root.style.setProperty("--accent-glow", accent.glow);
    root.style.setProperty("--font-scale", String(settings.fontScale ?? 1));
    root.dataset.motion = settings.reduceMotion || settings.motionLevel === 1 ? "reduced" : "full";
    root.dataset.contrast = settings.highContrast ? "high" : "normal";
    root.dataset.displayFont = settings.displayFont || "font-hasti";
    soundEngine.enabled = settings.sound;
  }, [
    accent,
    settings.displayFont,
    settings.fontScale,
    settings.highContrast,
    settings.motionLevel,
    settings.reduceMotion,
    settings.sound,
  ]);

  const value = useMemo<Ctx>(
    () => ({ settings, update, reset, accent, motionScale }),
    [settings, update, reset, accent, motionScale]
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useAppSettings(): Ctx {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return "232,179,58";
  return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
}

/* ------------------------------------------------------------------ helpers */

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export function useDebounced<T>(value: T, delay = 180): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Lazy JSON/markdown loader with in-memory + session cache. */
const fetchCache = new Map<string, Promise<unknown>>();

export function loadAsset<T>(input: string): Promise<T> {
  /* honour the deployment base (GitHub Pages serves the app from /<repo>/) */
  const url = publicUrl(input);
  const hit = fetchCache.get(url);
  if (hit) return hit as Promise<T>;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.text();
    })
    .then((text) => {
      if (url.endsWith(".json")) return JSON.parse(text) as T;
      return text as unknown as T;
    })
    .catch((err) => {
      fetchCache.delete(url);
      throw err;
    });
  fetchCache.set(url, p);
  return p as Promise<T>;
}
