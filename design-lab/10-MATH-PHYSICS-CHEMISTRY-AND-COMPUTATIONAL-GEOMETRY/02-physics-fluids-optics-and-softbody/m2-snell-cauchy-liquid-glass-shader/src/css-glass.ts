import {
  buildDisplacementRGBA,
  toPngDataUrl,
  type PanelShape,
} from "./displacement-map";

export type CssMode = "none" | "blur" | "displace" | "rgb";

const FILTER: Record<CssMode, string> = {
  none: "none",
  blur: "blur(2px)",
  displace: "blur(2px) url(#liquid-glass)",
  rgb: "blur(2px) url(#liquid-glass-rgb)",
};

export function applyDisplacementMap(shape: PanelShape): void {
  const rgba = buildDisplacementRGBA(shape);
  const url = toPngDataUrl(rgba, shape.width, shape.height);

  for (const image of document.querySelectorAll("feImage")) {
    image.setAttribute("href", url);
    image.setAttribute("width", String(shape.width));
    image.setAttribute("height", String(shape.height));
  }
}

/**
 * Careful: this is a SYNTAX check. The browser is saying "yes, I can parse this
 * value", not "yes, I apply this filter". The measurement output labels it that way too.
 */
export function backdropFilterUrlSyntaxSupported(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    (CSS.supports("backdrop-filter", "url(#x)") ||
      CSS.supports("-webkit-backdrop-filter", "url(#x)"))
  );
}

/** Changes the backdrop-filter value of the `.glass` panel. */
export function setCssMode(element: HTMLElement, mode: CssMode): void {
  element.hidden = mode === "none";
  element.style.backdropFilter = FILTER[mode];
  element.style.setProperty("-webkit-backdrop-filter", FILTER[mode]);
}
