import { clearNoiseCache } from "./utils";

let ctx: AudioContext | null = null;

// Suspend on blur — prevents Safari from silently disconnecting audio output
// while reporting state === "running".
if (typeof document !== "undefined") {
  window.addEventListener("blur", () => {
    if (ctx && ctx.state === "running") {
      ctx.suspend().catch(() => {});
    }
  });
}

export function getContext(): AudioContext {
  const state = ctx?.state as string | undefined;

  // Discard contexts that are closed or in Safari's non-standard "interrupted"
  // state — an interrupted context cannot be reliably resumed.
  if (ctx && (state === "closed" || state === "interrupted")) {
    clearNoiseCache();
    ctx = null;
  }

  if (!ctx) {
    ctx = new AudioContext();
  }

  ctx.resume().catch(() => {});

  return ctx;
}

export function setContext(userCtx: AudioContext): void {
  clearNoiseCache();
  ctx = userCtx;
}
