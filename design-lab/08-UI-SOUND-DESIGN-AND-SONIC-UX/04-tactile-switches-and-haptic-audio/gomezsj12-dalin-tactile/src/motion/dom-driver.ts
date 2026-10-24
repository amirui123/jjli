import type { MotionDriver, MotionRuntime, MotionSpec, MotionTarget } from "../types.js";
import { particleBurst } from "./particles.js";

/**
 * Built-in, dependency-free motion driver.
 *   • boop:      a springy transform pulse on an element (Web Animations API)
 *   • particles: a canvas emoji burst (see particles.ts, adapted from lochie MIT)
 * Heavier effect libs can be supplied as an alternative MotionDriver.
 */

const OVERSHOOT = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // spring-ish settle

export const domMotionDriver: MotionDriver = {
  name: "dom",
  render(spec: MotionSpec, target: MotionTarget, runtime: MotionRuntime): void {
    if (runtime.reducedMotion) return; // accessibility: motion off → no-op
    switch (spec.kind) {
      case "none":
        return;
      case "custom":
        spec.play(target, runtime);
        return;
      case "boop":
        boop(target.el ?? null, spec, runtime.scale);
        return;
      case "particles": {
        const pt = resolvePoint(target);
        particleBurst(pt.x, pt.y, {
          emojis: spec.emojis,
          flip: spec.flip,
          count: spec.count != null ? Math.max(1, Math.round(spec.count * runtime.scale)) : undefined,
          duration: spec.duration,
          gravityX: spec.gravityX,
          gravityY: spec.gravityY,
        });
        return;
      }
    }
  },
};

function boop(el: Element | null, spec: Extract<MotionSpec, { kind: "boop" }>, scale: number): void {
  if (!el || typeof el.animate !== "function") return;
  const s = 1 + ((spec.scale ?? 1.15) - 1) * scale;
  const r = (spec.rotate ?? 0) * scale;
  const x = (spec.x ?? 0) * scale;
  const y = (spec.y ?? 0) * scale;
  const to = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`;
  el.animate([{ transform: "none" }, { transform: to }, { transform: "none" }], {
    duration: spec.timing ?? 300,
    easing: OVERSHOOT,
  });
}

function resolvePoint(target: MotionTarget): { x: number; y: number } {
  if (typeof target.x === "number" && typeof target.y === "number") {
    return { x: target.x, y: target.y };
  }
  if (target.el) {
    const r = target.el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  const w = typeof window !== "undefined" ? window.innerWidth : 0;
  const h = typeof window !== "undefined" ? window.innerHeight : 0;
  return { x: w / 2, y: h / 2 };
}
