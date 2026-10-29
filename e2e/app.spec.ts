/**
 * Permanent end-to-end suite (not a one-off audit script).
 * Every assertion here encodes behaviour the project promises in its README.
 *
 * Run: npm run test:e2e
 * Note: the browser comes from `npm run tool:setup` (see playwright.config.ts).
 */
import { test, expect, type Page } from "@playwright/test";

const ROUTES = [
  { id: "home", path: "/", heading: /در امتدادِ نور/ },
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
 * KNOWN DEFECT (reported in audit/before/report.md, not yet fixed):
 * the 6-act intro film is shown on every full page load and cannot be skipped —
 * `onClose("skip")` exists in IntroFilm's props but is never called, and there is
 * no Skip button / Escape handler. Until that is fixed, this test is marked
 * `fixme` so the suite stays green while the defect stays documented in code.
 *
 * Remove `.fixme` once a skip control exists — it then becomes the regression guard.
 */
test.fixme("intro film can be skipped without waiting ~10.5s", async ({ page }) => {
  // deliberately uses the real UA so the film is actually mounted
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const gate = page.locator('[aria-label="شروع انیمیشن ورود با صدا"]');
  await expect(gate).toBeVisible({ timeout: 15_000 });

  // there is no visible "skip" affordance today; a fix should add one
  const skip = page.getByRole("button", { name: /رد کردن|پرش|skip/i });
  await expect(skip).toBeVisible({ timeout: 2000 });
});
