import { detectPlatform } from "./platform.js";

let host: HTMLLabelElement | null = null;
let input: HTMLInputElement | null = null;

function ensure(): boolean {
  if (typeof document === "undefined") return false;
  if (host && input) return true;
  try {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:0;height:0;opacity:0;pointer-events:none;";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.setAttribute("switch", ""); // WebKit's native switch, the Taptic source
    label.appendChild(cb);
    (document.body ?? document.documentElement).appendChild(label);
    host = label;
    input = cb;
    return true;
  } catch {
    return false;
  }
}

/** Whether the iOS invisible-switch path is plausibly available (iOS WebKit). */
export function iosSwitchAvailable(): boolean {
  return detectPlatform().ios;
}

/**
 * Best-effort single Taptic tick on iOS Safari; no-op everywhere else.
 *
 * Toggling a native `<input switch>` makes iOS play a tick. We click the LABEL,
 * the path WebKit honored for programmatic use on iOS 17.4–26.4. iOS 26.5
 * patched the script path; the documented follow-up is a real, invisible switch
 * the user's own finger toggles (an overlay), which slots in HERE without
 * changing any caller. See docs/DEFERRED.md (AUDIT-016: repointed from a cross-repo path).
 */
export function iosTick(): void {
  if (!ensure() || !host) return;
  try {
    host.click();
  } catch {
    /* ignore */
  }
}
