/**
 * Dev-only runtime harness: mounts the real <App /> in a jsdom document so
 * every route's render + effects can be exercised outside the browser.
 * Not imported by the app bundle.
 */
import { createRoot, type Root } from "react-dom/client";
import App from "../App";

let root: Root | null = null;

export function mount() {
  const el = document.getElementById("root");
  if (!el) throw new Error("#root missing");
  if (!root) root = createRoot(el);
  root.render(<App />);
}

export function text() {
  return (document.getElementById("root")?.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function click(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return false;
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  return true;
}

export function setHash(hash: string) {
  window.location.hash = hash;
}
