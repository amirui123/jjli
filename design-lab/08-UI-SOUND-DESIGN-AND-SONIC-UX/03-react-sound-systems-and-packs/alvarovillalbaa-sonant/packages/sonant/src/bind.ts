import type { SoundEvent } from "./catalog.js";
import type { SoundSystem } from "./runtime.js";

/** Delegated click bindings. Hover is opt-in and requires real pointer movement. */
export function bindSounds(
  root: HTMLElement | Document,
  system: SoundSystem,
  { hover = false }: { hover?: boolean } = {},
) {
  const controller = new AbortController();
  let lastPoint: { x: number; y: number } | undefined;
  let lastTarget: Element | null = null;
  const element = (target: EventTarget | null) =>
    target && typeof (target as Element).closest === "function" ? (target as Element) : null;
  const find = (target: EventTarget | null, attribute: string) => {
    const found = element(target)?.closest(`[${attribute}]`);
    if (!found || !root.contains(found) || found.closest(":disabled,[aria-disabled='true']"))
      return null;
    return found;
  };
  const play = (target: Element, attribute: string) =>
    void system.emit(target.getAttribute(attribute) as SoundEvent, {
      source: target.getAttribute("data-sonant-source") ?? undefined,
      surface: target.getAttribute("data-sonant-surface") ?? undefined,
    });
  const reset = () => {
    lastPoint = undefined;
    lastTarget = null;
  };
  root.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented) return;
      const target = find(event.target, "data-sonant");
      if (target) play(target, "data-sonant");
    },
    { signal: controller.signal },
  );
  if (hover) {
    root.addEventListener(
      "pointermove",
      (event) => {
        const pointer = event as PointerEvent;
        if (pointer.pointerType !== "mouse" || pointer.buttons !== 0) return;
        const point = { x: pointer.clientX, y: pointer.clientY };
        if (!lastPoint) {
          lastPoint = point;
          return;
        }
        if (Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < 3) return;
        lastPoint = point;
        const target = find(event.target, "data-sonant-hover");
        if (target && target !== lastTarget) play(target, "data-sonant-hover");
        lastTarget = target;
      },
      { signal: controller.signal },
    );
    root.addEventListener("pointerdown", reset, { signal: controller.signal });
    root.addEventListener("scroll", reset, { capture: true, signal: controller.signal });
  }
  return () => controller.abort();
}
