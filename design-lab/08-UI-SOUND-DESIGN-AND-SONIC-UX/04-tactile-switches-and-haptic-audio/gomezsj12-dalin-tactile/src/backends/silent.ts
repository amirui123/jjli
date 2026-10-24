import type { HapticBackend } from "../types.js";

/** No-op haptic backend for SSR / unsupported engines (sound may still play). */
export function createSilentBackend(): HapticBackend {
  return {
    kind: "silent",
    fire(): void {},
    cancel(): void {},
    probe() {
      return { kind: "silent" };
    },
  };
}
