import type { Category, SoundEvent, SoundTheme, ThemeName } from "./catalog.js";
export type Profile = "quiet" | "balanced" | "expressive";
export interface Preferences {
  enabled: boolean;
  volume: number;
  profile: Profile;
  categories: Partial<Record<Category, boolean>>;
}
export interface PreferenceStorage {
  load(): Partial<Preferences> | null;
  save(value: Preferences): void;
}
export interface Voice {
  stop(): void;
  ended: Promise<void>;
}
export interface Provider {
  name: string;
  unlock(): Promise<boolean>;
  play(
    event: SoundEvent,
    options: { volume: number; loop: boolean; signal?: AbortSignal },
  ): Voice | null | Promise<Voice | null>;
  setVolume?(value: number): void;
  suspend?(): void | Promise<void>;
  destroy?(): void | Promise<void>;
  getStatus?(): string;
}
export interface EventPolicy {
  enabled?: boolean;
  cooldownMs?: number;
  priority?: number;
  maxDurationMs?: number;
  volume?: number;
}
export interface EmitOptions {
  source?: string;
  surface?: string;
  visibleEquivalent?: boolean;
  loop?: boolean;
  signal?: AbortSignal;
}
export type Decision = "played" | "suppressed" | "blocked" | "error";
export type Reason =
  | "muted"
  | "category"
  | "profile"
  | "speech"
  | "background"
  | "surface"
  | "cooldown"
  | "density"
  | "voice-limit"
  | "activation"
  | "provider"
  | "destroyed"
  | "unknown-event"
  | "visual-equivalent"
  | "cancelled";
export interface TraceEntry {
  id: number;
  event: string;
  time: number;
  source?: string;
  surface?: string;
  provider: string;
  decision: Decision;
  reason?: Reason;
  active: boolean;
  loop: boolean;
}
export interface FeedbackHandle extends Voice {
  id: number;
  decision: Decision;
  reason?: Reason;
}
export interface Snapshot {
  preferences: Preferences;
  trace: readonly TraceEntry[];
  activeVoices: number;
  speechActive: boolean;
  destroyed: boolean;
  provider: string;
}
export interface SoundOptions {
  theme?: ThemeName | SoundTheme;
  provider?: Provider;
  preferences?: Partial<Preferences>;
  storage?: PreferenceStorage;
  maxVoices?: number;
  densityPerSecond?: number;
  idleSuspendMs?: number;
  traceLimit?: number;
  mutedSurfaces?: string[];
  policy?: Partial<Record<SoundEvent, EventPolicy>>;
  requireVisibleEquivalent?: boolean;
  now?: () => number;
}
