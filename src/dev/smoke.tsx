/**
 * Development-only runtime smoke harness.
 * Mounts the real <App /> in a jsdom document and cycles every route,
 * surfacing any render/effect crash. Not part of the production bundle.
 */
import { createRoot } from "react-dom/client";
import App from "../App";

export async function runSmoke(routes: string[], waitMs = 260) {
  const errors: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args.map(String).join(" ");
    if (!msg.includes("not wrapped in act")) errors.push(msg.slice(0, 400));
  };

  const container = document.getElementById("root")!;
  const root = createRoot(container);
  const perRoute: { route: string; len: number; sample: string }[] = [];

  for (const route of routes) {
    window.location.hash = `#${route}`;
    try {
      root.render(<App />);
    } catch (e) {
      errors.push(`RENDER ${route}: ${(e as Error).message}`);
    }
    await new Promise((r) => window.setTimeout(r, waitMs));
    const text = container.textContent || "";
    if (text.length < 30) errors.push(`EMPTY ${route}: rendered text is ${text.length} chars`);
    perRoute.push({
      route,
      len: text.replace(/\s+/g, " ").trim().length,
      sample: text.replace(/\s+/g, " ").trim().slice(0, 90),
    });
  }

  // ---- interaction check: font studio settings must actually apply -------
  window.location.hash = "#/studio/fonts";
  root.render(<App />);
  await new Promise((r) => window.setTimeout(r, 400));
  const before = document.querySelector('[data-testid="font-preview"]') as HTMLElement | null;
  const target = document.querySelector('[data-font-id="kahroba"]') as HTMLElement | null;
  if (!before || !target) {
    errors.push("FONT-TEST: preview or font button missing");
  } else {
    const beforeFamily = before.style.fontFamily;
    target.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    await new Promise((r) => window.setTimeout(r, 260));
    const after = document.querySelector('[data-testid="font-preview"]') as HTMLElement | null;
    const afterFamily = after?.style.fontFamily ?? "";
    if (afterFamily === beforeFamily) {
      errors.push(`FONT-TEST: font-family did not change (${beforeFamily})`);
    }
    if (!/Kahroba/i.test(afterFamily)) {
      errors.push(`FONT-TEST: expected Kahroba, got ${afterFamily}`);
    }
  }

  // ---- interaction check: component registry really loads source code -----
  window.location.hash = "#/studio/components";
  root.render(<App />);
  await new Promise((r) => window.setTimeout(r, 900));
  const compText = document.body.textContent || "";
  if (!compText.includes("۴٬۱۹۷") && !compText.includes("4197")) {
    errors.push("COMPONENTS: total file count not rendered");
  }
  const codeLines = document.querySelectorAll("pre code .code-line").length;
  if (codeLines < 10) {
    errors.push(`COMPONENTS: source viewer rendered only ${codeLines} lines`);
  }
  if (!compText.includes("effect-ui")) {
    errors.push("COMPONENTS: registry list missing effect-ui");
  }

  // ---- interaction check: skills studio loads a real markdown document ----
  window.location.hash = "#/studio/skills";
  root.render(<App />);
  await new Promise((r) => window.setTimeout(r, 800));
  const skillText = document.body.textContent || "";
  if (skillText.length < 2000) errors.push("SKILLS: markdown document did not render");

  console.error = originalError;
  return { errors, html: container.innerHTML.length, perRoute };
}
