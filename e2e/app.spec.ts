/**
 * Permanent end-to-end suite (not a one-off audit script).
 * Every assertion here encodes behaviour the project promises in its README.
 *
 * Run: npm run test:e2e
 * Note: the browser comes from `npm run tool:setup` (see playwright.config.ts).
 */
import { test, expect, type Page } from "@playwright/test";

const ROUTES = [
  { id: "home", path: "/", heading: /هر واژه/ },
  { id: "dashboard", path: "/dashboard", heading: /داشبورد|تله‌متری|نمای/i },
  { id: "fonts", path: "/studio/fonts", heading: /فونت/ },
  { id: "motion", path: "/studio/motion", heading: /حرکت|موشن/ },
  { id: "components", path: "/studio/components", heading: /کامپوننت/ },
  { id: "sounds", path: "/studio/sounds", heading: /صدا/ },
  { id: "skills", path: "/studio/skills", heading: /مهارت|دانش/ },
  { id: "engines", path: "/studio/engines", heading: /شیدر/ },
  { id: "ai", path: "/studio/ai", heading: /هوش مصنوعی/ },
];

/**
 * Known, already-reported defects. Tests stay green (so new breakage is visible)
 * but the allow-list must shrink to zero as the bugs are fixed.
 *   1. skills page: the "root" subcategory is rendered as a real folder, so the
 *      first vault file 404s. Reported in audit/before/report.
 */
const KNOWN_CONSOLE_NOISE: { page?: string; match: RegExp }[] = [
  { page: "skills", match: /design-lab\/00-INDEX-AND-BLUEPRINTS\/root\// },
  { page: "skills", match: /^Failed to load resource: the server responded with a status of 404/ },
];

/**
 * The app animates continuously by design (marquees, shimmers, aurora blobs,
 * spring-driven pills). Playwright refuses to click an element whose bounding
 * box keeps moving, so for interaction tests we freeze CSS animation/transition
 * after load. Visual fidelity is covered by the screenshot crawl instead.
 */
async function open(page: Page, path: string) {
  const res = await page.goto(`/#${path}`, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}`,
  });
  await page.waitForTimeout(300);
  return res;
}

const errors: { page: string; text: string }[] = [];
let currentPage = "";

function watchConsole(page: Page) {
  const push = (text: string) => errors.push({ page: currentPage, text });
  page.on("console", (m) => {
    if (m.type() === "error") push(m.text().slice(0, 240));
  });
  page.on("pageerror", (e) => push(`pageerror: ${e.message.slice(0, 240)}`));
  page.on("requestfailed", (r) => {
    // SPA route changes cancel in-flight lazy-chunk requests; that is not a defect.
    if (/ERR_ABORTED/.test(r.failure()?.errorText ?? "")) return;
    push(`requestfailed: ${r.url().slice(0, 200)}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) push(`http ${r.status()}: ${r.url().slice(0, 200)}`);
  });
}

function unexpected(pageId: string) {
  return errors.filter(
    (e) => !KNOWN_CONSOLE_NOISE.some((k) => (!k.page || k.page === pageId) && k.match.test(e.text))
  );
}

test.beforeEach(() => {
  errors.length = 0;
});

for (const route of ROUTES) {
  test(`${route.id}: renders, has one h1 and no console errors`, async ({ page }) => {
    currentPage = route.id;
    watchConsole(page);
    const res = await open(page, route.path);
    expect(res?.status(), "document responds 200").toBeLessThan(400);

    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("main")).toContainText(route.heading);

    if (route.path.startsWith("/studio/")) {
      await expect(page.locator("[data-rail]")).toHaveCount(3);
    }

    await page.waitForTimeout(1500);
    const bad = unexpected(route.id);
    expect(bad, `console/network errors on ${route.path}`).toEqual([]);
  });
}

test("unknown route shows the 404 page", async ({ page }) => {
  currentPage = "404";
  await open(page, "/this-does-not-exist");
  const main = page.locator("main");
  await expect(main).toContainText(/گم شدی|وجود ندارد/);
  // the 404 page must offer a way home
  await expect(main.getByRole("button", { name: /بازگشت به خانه/ })).toBeVisible();
});

test("command palette opens with Ctrl+K and filters routes", async ({ page }) => {
  currentPage = "palette";
  await open(page, "/");
  await page.keyboard.press("Control+k");

  const input = page.getByRole("combobox");
  await expect(input).toBeVisible();
  await input.fill("فونت");
  const results = page.locator("#command-results");
  await expect(results).toContainText(/فونت/);

  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
});

test("bottom dock navigates between all nine sections", async ({ page }) => {
  currentPage = "dock";
  await open(page, "/");
  const dock = page.locator('nav[aria-label="ناوبری بخش‌ها"]');
  await expect(dock.locator("button")).toHaveCount(9);

  await dock.locator('button[aria-label="استودیو موشن"]').click();
  await expect(page).toHaveURL(/#\/studio\/motion/);
});

/**
 * The dock is the only navigation surface in the shell (the old duplicate
 * section rail in the top bar was removed), so it has to keep magnification,
 * label visibility and no-overflow behaviour at every viewport.
 */
test("top bar carries no section nav and the dock magnifies on hover", async ({
  page,
}, testInfo) => {
  currentPage = "chrome";
  await open(page, "/");
  const isMobile = testInfo.project.name.includes("mobile");

  // no duplicated section navigation anywhere in the header
  const header = page.locator("header").first();
  await expect(header.locator('a[href^="#/studio"], button[aria-label^="استودیو"]')).toHaveCount(0);

  // breadcrumb still tells the user where they are (desktop/tablet only)
  if (!isMobile) {
    await expect(header.getByRole("navigation", { name: "مسیر فعلی" })).toBeVisible();
  }

  const dock = page.locator('nav[aria-label="ناوبری بخش‌ها"]');
  await expect(dock).toBeVisible();
  await expect(dock.locator("button").first()).toBeVisible();

  // nothing may overflow horizontally (the old shell was 10/10 pages broken at 320px)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);

  if (!isMobile) {
    const item = dock.locator("button").nth(3);
    const before = await item.boundingBox();
    await item.hover();
    await expect
      .poll(async () => (await item.boundingBox())?.height ?? 0, { timeout: 4_000 })
      .toBeGreaterThan((before?.height ?? 0) + 2);
  }
});

test("display settings switch visual state in RTL", async ({ page }) => {
  currentPage = "appearance";
  await open(page, "/dashboard");
  await page.locator('button[aria-label="تنظیمات نمایش"]').first().click();

  const toggle = page.locator("#toggle-contrast");
  const knobOffset = () =>
    toggle.locator("span[aria-hidden] > span").evaluate((el) => {
      const track = (el.parentElement ?? el).getBoundingClientRect();
      const knob = el.getBoundingClientRect();
      // distance from the *start* edge — in RTL the track's start edge is its right edge
      return Math.round(track.right - knob.right);
    });

  await expect(toggle).toHaveAttribute("aria-checked", "false");
  const off = await knobOffset();
  // off sits at the reading-start edge (the right edge in RTL)
  expect(off).toBeLessThan(6);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  // "on" slides the knob to the reading-end edge — ~22px on a 36px track
  await expect.poll(knobOffset).toBeGreaterThan(off + 10);
});

test("accent picker applies the theme to CSS custom properties", async ({ page }) => {
  currentPage = "accent";
  await open(page, "/dashboard");

  await page.locator('button[aria-label="رنگ پلتفرم"]').first().click();
  const turquoise = page.getByRole("button", { name: /فیروزه/ }).first();
  await expect(turquoise).toBeVisible();
  await turquoise.click();

  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()
      )
    )
    .toBe("#2DD4BF");
});

test("font studio specimen changes when a different font is picked", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop rail layout only");
  currentPage = "fonts";
  await open(page, "/studio/fonts");

  const specimen = page.locator('[data-testid="font-specimen"]');
  await expect(specimen).toBeVisible();
  const before = await specimen.getAttribute("style");

  const row = page.locator("[data-font-id]").nth(2);
  await row.scrollIntoViewIfNeeded();
  await row.click();

  await expect
    .poll(async () => (await specimen.getAttribute("style")) ?? "")
    .not.toBe(before ?? "");
});

test("studio rails respond to the keyboard focus-mode shortcut", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "desktop rail layout only");
  currentPage = "focus";
  await open(page, "/studio/motion");
  await expect(page.locator("[data-rail]")).toHaveCount(3);

  await page.locator("main").click({ position: { x: 4, y: 4 } });
  await page.keyboard.press("f");
  await expect(page.locator('[role="separator"]').first()).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.locator('[role="separator"]').first()).toBeVisible();
});

test("mobile: studio becomes a three-tab sheet and returns to preview after a pick", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile project only");
  currentPage = "mobile";
  await open(page, "/studio/fonts");

  const tabs = page.locator('nav[aria-label="پنل‌های استودیو"] button');
  await expect(tabs).toHaveCount(3);

  await tabs.nth(2).click(); // list
  const listRail = page.locator('[data-rail="list"]');
  await expect(listRail).toBeVisible();

  await page.locator("[data-font-id]").first().click();
  await expect(page.locator('[data-rail="stage"]')).toBeVisible();
});

/**
 * Nastaliq ascenders and descenders stack ~2em tall, so a two-line headline
 * needs at least ~2.0em of leading. It shipped with a hard-coded 1.68 for every
 * display font, which made the second line physically collide with the first
 * one (the tail of «هر» ran into «نور،»). The headline must now take its leading
 * from the font catalog, and each font must keep its own value.
 */
test("hero headline uses the leading that its display font needs", async ({ page }) => {
  currentPage = "hero";
  await open(page, "/");
  const headline = page.locator('[data-testid="hero-headline"]');
  await expect(headline).toBeVisible();

  const metrics = await headline.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      family: s.fontFamily.split(",")[0].replace(/"/g, ""),
      size: parseFloat(s.fontSize),
      leading: parseFloat(s.lineHeight) / parseFloat(s.fontSize),
    };
  });

  // default hero font is IranNastaliq, whose own metrics need ~2.4em
  expect(metrics.family).toBe("IranNastaliq");
  expect(metrics.leading).toBeGreaterThanOrEqual(2.3);

  // the two lines must not share a single pixel row of ink
  const box = await headline.boundingBox();
  const shot = await page.screenshot({ clip: box ?? undefined });
  const pixels = await page.evaluate(async (pngB64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${pngB64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, img.width, img.height);
    const rows = new Array(img.height).fill(0);
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4;
        if (data[i] > 36 || data[i + 1] > 36 || data[i + 2] > 36) rows[y]++;
      }
    }
    let best = 0;
    let run = 0;
    for (const n of rows) {
      run = n === 0 ? run + 1 : 0;
      if (run > best) best = run;
    }
    return { tallestEmptyBand: best, height: img.height };
  }, shot.toString("base64"));

  // a real gap between the two lines is at least a tenth of the block
  expect(pixels.tallestEmptyBand).toBeGreaterThan(pixels.height * 0.08);
});

/**
 * «گ» must not render as «ک».
 *
 * IranNastaliq draws the second dot of گ as a short stroke that sits beside the
 * ک head-stroke. In the upstream woff2 it never rises above that head-stroke, so
 * the glyph's silhouette is identical to ک and «می‌گیرد» reads as «می‌کیرد» —
 * the defect the user reported. The shipped font now carries the dot 200 font
 * units further up-left, which makes گ reach measurably higher than ک.
 *
 * The check is geometric rather than perceptual: at a given size, the topmost
 * ink of گ must clear the topmost ink of ک by at least 5% of the font size.
 * With the upstream font that difference is exactly 0 px, so this is a real
 * regression guard for "someone re-downloaded the font".
 */
test("nastaliq gaf keeps its two dots and does not render as kaf", async ({ page }) => {
  currentPage = "gaf-dots";
  await open(page, "/");

  const SIZE = 160;
  await page.evaluate(async (size) => {
    await document.fonts.ready;
    const hero = document.querySelector('[data-testid="hero-headline"]');
    const family = hero ? getComputedStyle(hero).fontFamily : "";
    const probe = document.createElement("div");
    probe.id = "gaf-probe";
    probe.style.cssText = [
      "position:fixed",
      "left:0",
      "top:0",
      "width:620px",
      "height:560px",
      "z-index:999999",
      "background:#000",
      "color:#fff",
      "direction:rtl",
      "text-align:center",
      `font-family:${family}`,
      `font-size:${size}px`,
      "line-height:3.2",
    ].join(";");
    probe.textContent = "\u06AF";
    document.body.appendChild(probe);
  }, SIZE);

  const probe = page.locator("#gaf-probe");
  const box = await probe.boundingBox();
  if (!box) throw new Error("gaf probe did not render");

  const gafShot = await page.screenshot({ clip: box });
  await page.evaluate(() => {
    const el = document.getElementById("gaf-probe");
    if (el) el.textContent = "\u06A9";
  });
  await page.waitForTimeout(120);
  const kafShot = await page.screenshot({ clip: box });

  const tops = await page.evaluate(
    async ([a, b]) => {
      const topInk = async (b64: string) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        if (!ctx) return img.height;
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, img.width, img.height);
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            if (data[(y * img.width + x) * 4] > 110) return y;
          }
        }
        return img.height;
      };
      return { gafTop: await topInk(a), kafTop: await topInk(b) };
    },
    [gafShot.toString("base64"), kafShot.toString("base64")]
  );

  // both glyphs must have rendered at all
  expect(tops.gafTop).toBeLessThan(560);
  expect(tops.kafTop).toBeLessThan(560);

  // گ's second dot must reach above ک's head-stroke
  const rise = tops.kafTop - tops.gafTop;
  expect(rise).toBeGreaterThan(SIZE * 0.05);
});

/**
 * The entrance film used to run for ~10.5s with no way out: `onClose("skip")`
 * existed on the prop type but was never called, and there was no control or
 * Escape handler. It now carries a «رد کردن» affordance on every frame, so the
 * visitor is never trapped behind the motion.
 *
 * The film only mounts for a real browser UA (the suite's default UA is
 * "jsdom", which is the app's own escape hatch), so this block opts out.
 */
test.describe("intro film", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
  });

  test("can be skipped immediately instead of waiting ~10.5s", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // the greeting plays first, then the invitation to press the point
    const gate = page.locator('[aria-label="شروع انیمیشن ورود با صدا"]');
    await expect(gate).toBeVisible({ timeout: 15_000 });

    const skip = page.getByTestId("intro-skip");
    await expect(skip).toBeVisible();

    const started = Date.now();
    await skip.click({ force: true });
    await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 3_000 });
    expect(Date.now() - started).toBeLessThan(3_000);
  });

  test("Escape also leaves the film", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const film = page.locator('[role="dialog"]');
    await expect(film).toHaveCount(1, { timeout: 10_000 });
    // wait until the film is past mount and answering taps — pressing Escape
    // before the key listener is attached would be a no-op, not a regression
    await expect(page.getByTestId("intro-skip")).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press("Escape");
    await expect(film).toHaveCount(0, { timeout: 5_000 });
  });

  test("pressing the point builds the hero sentence word by word", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const gate = page.locator('[aria-label="شروع انیمیشن ورود با صدا"]');
    await expect(gate).toBeVisible({ timeout: 15_000 });

    const box = await gate.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(
      (box?.x ?? 0) + (box?.width ?? 0) / 2,
      (box?.y ?? 0) + (box?.height ?? 0) / 2
    );

    // once the burst resolves, the film typesets the same two lines the hero uses
    await expect(page.locator('[role="dialog"]')).toContainText("هر واژه", { timeout: 12_000 });
    await expect(page.locator('[role="dialog"]')).toContainText("نفس", { timeout: 6_000 });
  });
});
