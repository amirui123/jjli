import type { PreferenceStorage } from "./types.js";

/** Device-local and opt-in. Storage failures never block an interaction. */
export function localPreferences(key = "sonant:preferences"): PreferenceStorage {
  return {
    load() {
      try {
        return JSON.parse(globalThis.localStorage.getItem(key) ?? "null");
      } catch {
        return null;
      }
    },
    save(value) {
      try {
        globalThis.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* Private mode or unavailable storage. */
      }
    },
  };
}
