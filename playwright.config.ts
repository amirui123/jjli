import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright runs against the *production* build, served by the project's own
 * zero-dependency static server, so what we test is what ships.
 *
 * Browser: this sandbox blocks Playwright's CDN, so instead of
 * `playwright install` we launch the Chromium extracted by `npm run tool:setup`
 * (also used by every other audit tool). Firefox and WebKit cannot be
 * downloaded here — `npm run test:e2e:all-browsers` documents how to run them
 * on a machine with network access.
 */
const CHROME = process.env.CHROME_PATH || "/tmp/chromium";
const LIB_DIR = new URL("./.tooling/browser-libs", import.meta.url).pathname;

/** The app's own escape hatch: a "jsdom" UA makes IntroHost skip the intro film. */
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) jsdom Chromium/153 Safari/537.36";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 2 : 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "audit/before/playwright-results.json" }],
  ],
  use: {
    baseURL: process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173",
    userAgent: UA,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath: CHROME,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--font-render-hinting=none",
      ],
      env: { ...process.env, LD_LIBRARY_PATH: `${LIB_DIR}:${process.env.LD_LIBRARY_PATH ?? ""}` },
    },
  },
  projects: [
    // NOTE: `userAgent` must be set per project — spreading a device descriptor
    // replaces the top-level userAgent, which would re-enable the intro film and
    // cover every element (that is exactly how these tests first failed).
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], userAgent: UA, viewport: { width: 1440, height: 900 } },
    },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"], userAgent: UA } },
  ],
  webServer: {
    command: "PORT=4173 node scripts/serve-static.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
