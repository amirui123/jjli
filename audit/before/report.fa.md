# گزارش ممیزی خودکار — RTL Motion Lab

**تاریخ:** ۲۰۲۶-۱۰-۲۹ · **کامیت پایه:** `aa5322f` · **شاخه:** `arena/3dd837ec-jjli`
**خروجی خام:** `audit/before/` · **مجموع:** ۹۰ بارگذاری صفحه، ۲۷ اجرای a11y، ۱۸ اجرای Lighthouse، ۵۴ بیت‌مپ مرجع

> همه اعداد این گزارش از فایل‌های واقعی داخل `audit/before/` استخراج شده‌اند. هر جا ابزاری نتوانسته اجرا شود، صریح گفته شده و دستور دقیق اجرای آن آمده است.

---

## ۱. خلاصه اجرایی

| حوزه | وضعیت | عدد |
| :-- | :-- | :-- |
| TypeScript (strict) | ✅ پاک | ۰ خطا |
| ESLint + jsx-a11y | ✅ پاک | ۰ خطا · ۰ هشدار |
| Stylelint | ⚠️ | ۸۵ هشدار، **۷ سلکتور تکراری** |
| html-validate | ⚠️ | ۲ خطا (حروف کوچک DOCTYPE) |
| Prettier | ⚠️ | **۵۰ فایل** فرمت‌نشده |
| Knip | ⚠️ | ۳ فایل مرده، ۲ وابستگی اعلام‌نشده |
| size-limit | ✅ | ۱۲ بودجه، همه پاس |
| Playwright e2e | ✅ | **۲۹ پاس** · ۵ skip · ۱ نقص مستندشده |
| Lighthouse (میانگین) | ⚠️ | P **۷۹** · A **۹۳** · BP **۱۰۰** · SEO **۱۰۰** |
| axe-core | ❌ | ۹۲ گره کنتراست + ۸۲ گره دیگر |
| pa11y | ❌ | ۱٬۱۰۴ مورد در ۱۰ صفحه |
| Semgrep | ✅ | ۰ آسیب‌پذیری بهره‌برداری‌شدنی |
| Secretlint | ✅ | ۰ راز |
| npm audit (runtime) | ✅ | ۰ در ۶ وابستگی اصلی |
| لینک‌ها | ❌ | ۱ asset شکسته از ۱۲۵ |

**سه مورد بحرانی:**
1. فیلم اینترو کل اپ را **~۱۰٫۵ ثانیه** قفل می‌کند و **راه رد کردن ندارد**.
2. در عرض ≤ **۳۸۹px** همه صفحات **سرریز افقی** دارند (۳۷۵px = ۱۰ صفحه از ۱۰).
3. صفحه `#/studio/skills` فایل اول مخزن را **۴۰۴** می‌گیرد.

---

## ۲. محیط اجرا و محدودیت‌های واقعی

این سندباکس فقط به این میزبان‌ها دسترسی دارد: `github.com`, `codeload.github.com`, `api.github.com`, `registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org`.

| مشکل | اثر | راه‌حل من |
| :-- | :-- | :-- |
| `cdn.playwright.dev` مسدود | `playwright install` شکست می‌خورد | Chromium 153 از پکیج `@sparticuz/chromium` (npm) استخراج شد |
| کروم به `libnspr4`/`libnss3` نیاز دارد و ایمیج آن‌ها را ندارد | باینری اجرا نمی‌شد | NSS از tarball پکیج `chrome-aws-lambda` + **کامپایل NSPR از سورس** (`mozilla/nspr`) در `.tooling/browser-libs` |
| `sudo apt-get` → مخازن Debian مسدود | نصب کتابخانه سیستمی ناممکن | بدون sudo، فقط با `LD_LIBRARY_PATH` |
| `release-assets.githubusercontent.com` مسدود | **Gitleaks** دانلود نشد | جانشین: `secretlint` (npm) + اسکن دستی تاریخ گیت |
| `storage.googleapis.com` مسدود | **Firefox/WebKit** و **chromedriver** (sitespeed) دانلود نشد | فقط Chromium تست‌پذیر است |
| `semgrep.dev` مسدود | رجیستری قواعد Semgrep در دسترس نبود | قواعد رسمی از `codeload.github.com/semgrep/semgrep-rules` + ۸ قاعده اختصاصی |
| Node نمی‌تواند ۶GiB بافر بسازد | `knip@6` (oxc-parser) کرش می‌کرد | `knip@5` (مبتنی بر TypeScript) |

همه اینها با **`npm run tool:setup`** بازتولید می‌شوند — بدون sudo، بدون نصب سراسری.

### ابزارهایی که نتوانستم اجرا کنم (دستور دقیق برای شما)

```bash
# ۱. Firefox + WebKit — روی ماشین با اینترنت آزاد
npx playwright install firefox webkit
npx playwright test --project=firefox --project=webkit     # نیاز به افزودن project در playwright.config.ts

# ۲. Gitleaks (جانشین secretlint اجرا شد)
gitleaks detect --source . --report-format json --report-path audit/before/security/gitleaks.json
gitleaks detect --source . --log-opts="--all"              # کل تاریخ

# ۳. sitespeed.io (نیاز به chromedriver از storage.googleapis.com)
npm rebuild @sitespeed.io/chromedriver
npx sitespeed.io "http://127.0.0.1:4173/#/" -n 3 --outputFolder audit/before/sitespeed
```

---

## ۳. چیزهایی که نصب کردم و چرا

همه به‌صورت `devDependency` (بدون نصب سراسری)، با `--ignore-scripts` برای وابستگی‌هایی که به CDN مسدود وصل می‌شدند.

| ابزار | ستاره | آخرین به‌روزرسانی | لایسنس | چرا |
| :-- | --: | :-- | :-- | :-- |
| `@playwright/test` 1.64.1 | ۹۸٬۷۷۷ | 2026-10-29 | Apache-2.0 | تست واقعی روی هر مسیر، ۸ عرض، موبایل، reduced-motion |
| `playwright-core` | — | — | Apache-2.0 | برای اسکریپت‌های crawl/axe/links |
| `@sparticuz/chromium` 153 | — | فعال | MIT | تنها راه رسیدن به باینری کروم بدون CDN |
| `@axe-core/playwright` 4.14 | ۷٬۷۲۷ (axe-core) | 2026-10-26 | **MPL-2.0** | WCAG روی هر صفحه + حالت تعاملی |
| `axe-core` | — | — | MPL-2.0 | موتور اصلی |
| `pa11y` 10 + `pa11y-ci` 5 | ۴٬۵۸۸ / ۶۴۶ | 2026-10-26 | **LGPL-3.0** | نظر دوم (axe + HTML_CodeSniffer) |
| `lighthouse` 13.6 | ۳۰٬۹۷۲ | 2026-10-28 | Apache-2.0 | ۴ دسته امتیاز، موبایل + دسکتاپ |
| `@lhci/cli` 0.15.1 | ۷٬۱۲۰ | 2026-10-28 | Apache-2.0 | آستانه امتیاز + گیت CI |
| `size-limit` 14.3 | ۷٬۰۳۹ | 2026-10-28 | MIT | بودجه باندل، ۱۲ ورودی |
| `stylelint` 16 + `stylelint-config-standard` | ۱۱٬۵۴۱ | 2026-10-29 | MIT | **نصب با v16 نه v17** چون `config-standard@39` هنوز peer به v16 دارد |
| `html-validate` 11 | ۱۹★ (خطای API؛ ریپوی رسمی فعال) | 2026-10-28 | MIT | اعتبارسنجی مارک‌آپ |
| `prettier` 3.9 | ۵۲٬۳۸۵ | 2026-10-29 | MIT | فرمت یکدست |
| `knip` 5.63 | ۱۲٬۵۴۵ | 2026-10-29 | ISC | کد مرده — **v5** به‌خاطر محدودیت حافظه |
| `purgecss` 8 | ۸٬۰۵۳ | 2026-10-29 | MIT | فقط تحلیل — نتیجه **رد شد** (پایین) |
| `linkinator` 8 | ۱٬۲۷۸ | 2026-10-28 | MIT | لینک شکسته |
| `sharp` 0.35 | ۳۲٬۸۰۶ | 2026-10-23 | Apache-2.0 | فشرده‌سازی تصویر (فاز بعد) |
| `backstopjs` 6.3 | ۷٬۱۹۰ | 2026-10-10 | MIT | دیف بصری قبل/بعد — **۵۴ بیت‌مپ مرجع ساخته شد** |
| `sitespeed.io` 42 | ۵٬۰۴۵ | 2026-10-27 | MIT | نصب شد، اجرا نشد (chromedriver) |
| `secretlint` 13 | ۱٬۴۷۰ | 2026-10-29 | MIT | **جانشین Gitleaks** |
| `vite-bundle-analyzer` | ۴۶۸ | 2026-07-13 | MIT | از جستجوی GitHub — تحلیل باندل |
| `semgrep` 1.182 (venv) | ۱۷٬۳۳۲ | 2026-10-29 | **LGPL-2.1** | SAST |

### از پژوهش GitHub (۵+ جستجو، ۱۰ نتیجه هرکدام)
`nextjs audit` · `rtl css testing` · `web vitals tools` · `frontend bug finder` · `css layout debugging` · `tailwind rtl` · `vite bundle analyzer` · `react accessibility testing` · `visual regression testing` · `persian farsi typography`

**نتیجه:** برای این استک ابزار بهتری پیدا نشد. جستجوی `tailwind rtl` فقط پلاگین‌های قدیمی (۲۰۲۰–۲۰۲۱) نشان داد — Tailwind v4 خودش logical properties دارد. `vite-bundle-analyzer` (۴۶۸★، MIT) به‌عنوان افزودنی مفید اضافه شد. هیچ ابزار آرشیوشده یا ناسازگاری استفاده نشد.

---

## ۴. نتایج ابزار به ابزار

### ۴-۱. استاتیک

| ابزار | نتیجه |
| :-- | :-- |
| `tsc --noEmit` (strict) | **۰ خطا** |
| ESLint (۹ قاعده + jsx-a11y) | **۰ خطا، ۰ هشدار** |
| Stylelint | ۸۵ هشدار: `color-function-alias-notation` ۴۲، `at-rule-empty-line-before` ۲۳، **`no-duplicate-selectors` ۷**، `property-no-vendor-prefix` ۷ |
| html-validate | ۲ خطا: `<!doctype html>` باید `<!DOCTYPE html>` باشد |
| Prettier | ۵۰ فایل فرمت‌نشده |

**۷ سلکتور تکراری در `src/index.css`** (دقیقاً همان چیزی که در بررسی اولیه دیده شد):

| خط | سلکتور | تعریف اول در خط |
| --: | :-- | --: |
| 1003 | `.font-nastaliq` | 979 |
| 1061 | `:root` | 986 |
| 1107 | `.holographic-foil` | 1029 |
| 1333 | `.marquee-track` | 1228 |
| 1373 | `.aurora-blob` | 1248 |
| 1417 | `html` | 1073 |
| 1422 | `body` | 991 |

بعلاوه `@keyframes aurora-drift` **سه بار** تعریف شده (1242، 1362، آخرین بلوک).

### ۴-۲. Playwright — کرال کامل

- **۹۰ بارگذاری صفحه** = ۱۰ مسیر × ۸ عرض (320…1920) + ۱۰ شبیه‌سازی iPhone 13
- **۲۰ سرریز افقی** — همه در 320px و 375px
- **۹ خطای کنسول + ۹ خطای HTTP** — همه یک مورد تکراری
- ۰ درخواست شکست‌خورده، ۰ خطای استثنا

| عرض | بارگذاری | سرریز |
| --: | --: | --: |
| 320 | 10 | **10** |
| 375 | 10 | **10** |
| 390+ | 70 | ۰ |

زمان بارگذاری (میانگین، محیط کند این سندباکس): `ai 9.6s` · `engines 5.3s` · `home 3.9s` · بقیه ۱٫۲–۳٫۳s

اسکرین‌شات‌ها: `audit/before/playwright/shots/` (۹۰ تصویر + اینترو + reduced-motion + light-scheme)

### ۴-۳. Lighthouse (۱۸ اجرا)

| صفحه | موبایل P / A | دسکتاپ P / A | LCP موبایل |
| :-- | :-- | :-- | --: |
| home | **45** / 96 | 66 / 96 | ۸٫۰s |
| dashboard | 81 / 96 | **99** / 96 | ۵٫۳s |
| fonts | 82 / 94 | 76 / 87 | ۴٫۱s |
| motion | 80 / 94 | 98 / 90 | ۵٫۰s |
| components | 65 / 94 | 90 / 90 | ۴٫۸s |
| sounds | 88 / 96 | 90 / 89 | ۳٫۹s |
| skills | 75 / 98 | 90 / 88 | ۴٫۶s |
| engines | **51** / 96 | 66 / 89 | ۵٫۱s |
| ai | 80 / 94 | 99 / 89 | ۴٫۴s |
| **میانگین** | | | **P79 · A93 · BP100 · SEO100** |

**Auditهای شکست‌خورده:** `largest-contentful-paint` (۱۸/۱۸) · `label-content-name-mismatch` (۱۸/۱۸) · `unminified-javascript` (۱۸/۱۸، فقط **۲KiB**) · `color-contrast` (۱۴/۱۸) · `heading-order` (۱۲/۱۸) · `aria-required-attr` (۷/۱۸) · `unused-javascript` (۱۲/۱۸) · `forced-reflow-insight` (۱۱/۱۸)

> ⚠️ **هشدار تفسیر:** TBT روی صفحه‌های شیدر (home: ۱۳۹٬۸۰۰ms موبایل، engines: ۱۱۸٬۳۶۰ms) نتیجهٔ رندر نرم‌افزاری WebGL (SwiftShader) در این سندباکس است، نه عدد واقعی روی GPU. الگو (شیدر = بدترین TBT و LCP) واقعی است، مقدار مطلق نیست.

### ۴-۴. axe-core — ۱۷ اجرا (۱۰ صفحه + ۷ حالت تعاملی)

| قاعده | گره‌های متأثر | معنا |
| :-- | --: | :-- |
| `color-contrast` | **۹۲** | کنتراست کافی نیست |
| `label-content-name-mismatch` | **۳۲** | متن دکمه با `aria-label` نمی‌خواند |
| `aria-required-attr` | **۱۴** | `role="separator"` بدون `aria-valuenow` |
| `heading-order` | ۱۰ | پرش سطح تیتر |
| `target-size` | ۸ | هدف لمسی کوچک |
| `scrollable-region-focusable` | ۶ | ناحیه اسکرول بدون کیبورد |
| `select-name` | ۴ | `select` بی‌برچسب |
| `label` | ۲ | فیلد بی‌برچسب |
| `region` | ۲ | محتوا بیرون از landmark |

حالت‌های تعاملی تست‌شده: پالت فرمان باز · پیکر رنگ باز · جستجوی باز · ۳ تب موبایل · reduced-motion.

### ۴-۵. pa11y / pa11y-ci (WCAG2AA، دو موتور: axe + HTML_CodeSniffer)

**۱٬۱۰۴ مورد** در ۱۰ صفحه. توزیع: `color-contrast` ۱۰۵۳ · `aria-required-attr` ۱۴ · `F68` (برچسب فرم) ۱۳ · نام `input` ۷ · `scrollable-region-focusable` ۵ · `select-name` ۴

| صفحه | تعداد |
| :-- | --: |
| `/#/studio/sounds` | ۱۵۸ |
| `/#/studio/components` | ۱۵۰ |
| `/#/studio/skills` | ۱۲۸ |
| `/#/studio/motion` | ۱۲۷ |
| `/#/studio/fonts` | ۱۲۱ |
| `/#/studio/engines` | ۱۱۷ |
| `/#/studio/ai` | ۱۰۴ |
| `/#/dashboard` | ۸۰ |
| `/#/` | ۷۲ |
| `/#/nope` | ۴۷ |

**هم‌خوانی دو موتور** روی `aria-required-attr` (۱۴ = ۱۴)، `scrollable-region-focusable` و `select-name` → این سه مورد قطعی و تکرارپذیرند.

### ۴-۶. امنیت

| ابزار | نتیجه |
| :-- | :-- |
| Semgrep (قواعد رسمی + ۸ قاعده اختصاصی RTL) | ۷۱ یافته خام → **۰ قابل بهره‌برداری** |
| Secretlint (روی همه فایل‌های نسخه‌بندی‌شده) | **۰** |
| اسکن تاریخ گیت (۱ کامیت، ۴٬۵۸۲ فایل) | **۰** |
| npm audit (کل) | ۸۰ (۶۴ high، ۱ critical) — **همه در ابزار توسعه** |
| npm audit (فقط runtime) | **۰ در ۶ وابستگی اصلی** (react, react-dom, framer-motion, lucide-react, clsx, tailwind-merge) |

یافته‌های Semgrep که بررسی و **پاک اعلام شد:**
- `kit.tsx:402` — `dangerouslySetInnerHTML` در `CodeBlock`؛ قبل از تزریق از `escapeHtml()` (خط ۳۴۲) رد می‌شود. **امن است.**
- `AppShell.tsx:570` و `Markdown.tsx:199` — `target="_blank"` هر دو `rel="noreferrer noopener"` دارند. **امن.**

> ⚠️ critical npm، پکیج `tar` است که `sitespeed.io` (ابزار خودم) می‌آورد — با حذف sitespeed یا `npm audit fix` برطرف می‌شود و هیچ ارتباطی با کد اپ ندارد.

### ۴-۷. کد مرده، CSS بی‌استفاده، باندل

**Knip:**
- فایل‌های بی‌استفاده: `src/data/featuredSounds.ts` · `src/data/registriesManifest.ts` · `src/data/toolkitManifest.ts`
- وابستگی اعلام‌نشده: `@eslint/js` (در `eslint.config.js`) · `esbuild` (در `scripts/`)
- devDeps بی‌استفاده: `tailwindcss` (peer است)، که بعد از اتصال اسکریپت‌ها حل شد

**PurgeCSS — نتیجه رد شد:** مدعی حذف ۱۰۱٬۷۵۵ بایت (۵۴٪) CSS است. بررسی نشان داد **۱۰۰٪ مثبت کاذب**: سلکتورهای `sm\:flex` و `[color:var(--x)]` را حذف می‌کند درحالی‌که هر دو در مارک‌آپ استفاده می‌شوند. Tailwind v4 فقط utilityهای مصرف‌شده را تولید می‌کند؛ **PurgeCSS روی این پروژه نباید اجرا شود.**

**size-limit (brotli):** ۱۲ بودجه، همه پاس:

| باندل | اندازه | بودجه |
| :-- | --: | --: |
| initial JS | 25.1 kB | 120 |
| vendor-react | 40.0 kB | 150 |
| vendor-motion | 36.3 kB | 130 |
| CSS | 19.2 kB | 200 |
| data-design-lab | 43.2 kB | 260 |
| همه chunkهای صفحه | 107.2 kB | 125 |
| SoundStudio (سنگین‌ترین) | 21.3 kB | 32 |

### ۴-۸. لینک و دارایی

- `linkinator` روی build: ۹ لینک، **۰ شکسته** — اما SPA با hash routing است، پس فقط `index.html` را می‌بیند.
- **بازرسی رندر-محور (خودم نوشتم):** ۱۲۵ دارایی داخلی، **۱ شکسته**:

```
✗ 404  /design-lab/00-INDEX-AND-BLUEPRINTS/root/01-MASTER-VAULT-INDEX.md
```

- **۱۰ انکر** در کل اپ؛ فقط **۱ لینک خارجی**. ناوبری همه با `<button>` است، نه `<a href>` → هیچ مسیری برای خزنده قابل کشف نیست، و کاربر نمی‌تواند تب جدید باز کند.

---

## ۵. یافته‌ها به ترتیب شدت

### 🔴 P0

**۱. اینترو کل اپ را قفل می‌کند — بدون راه فرار**
- `IntroHost` در `IntroFilm.tsx:1186` مقدار اولیهٔ `open` را `true` می‌گذارد → روی **هر بار لود کامل**.
- `onClose(reason: "skip" | "finish")` تعریف شده (خط ۸۵۹) اما **هیچ‌جا با `"skip"` صدا زده نمی‌شود**.
- بدون دکمه Skip، بدون `Escape`، بدون کلیک بیرونی. مدت: ۸٬۹۰۰ms + ۱٬۵۵۰ms خروج = **۱۰٬۴۵۰ms**.
- **شاهد قطعی:** ۴ تست e2e من با خطای «element is not stable» شکست می‌خوردند؛ علت این بود که اینترو روی همه‌چیز افتاده بود. بعد از bypass، همان تست‌ها در ۲۶ ثانیه پاس شدند (قبلاً ۵۷۰ ثانیه timeout).
- تست اختصاصی: `e2e/app.spec.ts` → `test.fixme("intro film can be skipped…")`
- **راه‌حل:** دکمهٔ Skip + listener برای `Escape` + فلگ `rtmlab.v1.intro-seen` تا فقط بار اول پخش شود.

**۲. سرریز افقی در ≤۳۸۹px** — ✅ **رفع شد** (بازطراحی پوسته؛ شاهد: `audit/after/chrome-redesign.fa.md`)
- هر ۱۰ صفحه، در ۳۲۰px و ۳۷۵px.
- علت دقیق: `header > div` شامل سه فرزند — برند **۹۳px**، ناوبری `hidden` (۰)، خوشهٔ اکشن **۲۷۰px** (۶ دکمهٔ `tap-icon` که با `@media (max-width:640px)` حداقل **۴۰px** می‌گیرند) + padding ۲۸ = **۳۸۹px**.
- نتیجه: در ۳۷۵px، ۱۴px محتوا بیرون می‌زند؛ در ۳۲۰px، ۶۹px. اسکرین‌شات: `audit/before/playwright/shots/home-320.jpg`
- **راه‌حل:** زیر `sm` دکمه‌های ثانویه (اینتور، گیت‌هاب، تم) به شیت موبایل منتقل شوند یا `tap-icon` به ۳۶px برود.

**۳. صفحهٔ Skills فایل اول را ۴۰۴ می‌گیرد**
- `SkillsStudio.tsx:190`: `fullUrl = /design-lab/${p.id}/${sc.id}/${relPath}`
- پیلار `00-INDEX-AND-BLUEPRINTS` زیرشاخه‌ای با `id: "root"` دارد که **پوشهٔ واقعی نیست** — فایل‌ها مستقیماً زیر پیلارند.
- هر سه مسیر deep-link همین الگو را می‌سازند: `Landing.tsx:187`، `Dashboard.tsx:256`، `SkillsStudio.tsx:190`
- همین یک مورد مسئول **۹ خطای کنسول + ۹ خطای HTTP** در کرال و **تمام** نویز کنسول است.
- **راه‌حل:** اگر `sc.id === "root"`، بخش `sc.id` از URL حذف شود.

### 🟠 P1 — دسترسی‌پذیری

**۴. `role="separator"` بدون `aria-valuenow` (۱۴ گره × ۷ استودیو)**
- `StudioShell.tsx` — دستگیره‌های تغییر عرض `role="separator"` دارند اما `aria-valuenow/min/max` ندارند.
- هر دو موتور (axe + pa11y) مستقل تأیید کردند.
- **راه‌حل:** افزودن `aria-valuenow={listW} aria-valuemin={MIN_LIST} aria-valuemax={MAX_LIST}` و `aria-label` موجود.

**۵. کنتراست — ۹۲ گره (axe) / ۱٬۰۵۳ (pa11y)**
- نمونه‌ها: `text-zinc-500` روی `#05060A`، `.code-num` در `CodeBlock`، `text-white/15` در نوارهای سینتیک، `text-[9.5px]` در داشبورد.
- `text-zinc-500` = `#71717a` روی `#05060A` ≈ **۴٫۰:۱** — زیر حد ۴٫۵:۱ برای متن معمولی.
- **راه‌حل:** ارتقای `zinc-500` به `zinc-400` برای متن بدنه، و کنار گذاشتن `white/15` برای متنی که معنا دارد.

**۶. `label-content-name-mismatch` (۳۲ گره)** — ✅ **در نوار بالا رفع شد** (۰ ران از ۹)
- دکمهٔ برند: `aria-label="آزمایشگاه موشن فارسی"` اما متن مرئی «آزمایشگاه موشن فارسی RTL MOTION LAB 60FPS».
- **راه‌حل:** `aria-label` باید متن مرئی را در خود داشته باشد، یا از `aria-labelledby` استفاده شود.

**۷. `heading-order` (۱۰) · `target-size` (۸) · `select-name` (۴) · `label` (۲) · `scrollable-region-focusable` (۶)**
- `heading-order`: `h3` بدون `h2` والد در ریل‌ها.
- `target-size`: دکمه‌های `AiPipeline` و ردیف‌های موبایل.
- `select-name`: `select`های `SkillsStudio` و `AiStudio` برچسب ندارند.
- `scrollable-region-focusable`: `.code-scroll` و `pre` بدون `tabIndex={0}`.

### 🟡 P2

**۸. کد مرده:** ۳ فایل در `src/data/` (هر سه توسط `npm run generate` بازتولید می‌شوند — یا وصل شوند یا تولیدشان متوقف شود) و ۲ وابستگی اعلام‌نشده.

**۹. CSS تکراری:** ۷ سلکتور (+۳ بار `@keyframes aurora-drift`) با مقادیر متناقض؛ آخرین تعریف برنده است.

**۱۰. drift اعداد متن** (از بررسی اولیه): «۴٬۰۲۳ اسکیل» (واقعی ۴٬۰۴۹) · «۱۸ شیدر» (واقعی ۲۶) · «۵۰ فونت» (واقعی ۹۳) · «۲۰۰ صدا» (واقعی ۲۸۵).

**۱۱. SEO:** صفر `<a href="#/...">` — ناوبری کاملاً دکمه‌ای است.

---

## ۶. گیت‌های دائمی

`.github/workflows/audit.yml` اضافه شد: ۴ job (استاتیک → build+size → e2e+axe → LHCI) با آپلود گزارش.

```bash
npm run tool:setup        # یک‌بار: کروم + کتابخانه‌ها
npm run health            # typecheck + eslint + build + size
npm run test:e2e          # ۳۴ تست Playwright
npm run audit:crawl       # ۹۰ بارگذاری + اسکرین‌شات
npm run audit:axe         # axe روی ۱۷ حالت
npm run a11y:pa11y        # نظر دوم
npm run audit:lighthouse  # ۱۸ اجرای Lighthouse
npm run visual:reference  # عکس مرجع برای دیف قبل/بعد
npm run visual:test       # دیف بعد از اصلاحات
npm run audit:knip audit:size audit:secrets
```

**قبل از هر تغییر ظاهری:** `npm run visual:reference` (۵۴ بیت‌مپ آماده است) → تغییر → `npm run visual:test` → `npx backstop openReport`.

---

## ۷. جمع‌بندی

پایهٔ کد **تمیز** است: TypeScript strict بدون خطا، ESLint بدون هیچ هشدار، صفر راز، صفر آسیب‌پذیری در کد ارسالی. مشکلات اصلی در سه دسته‌اند:

1. **یک مسدودکنندهٔ UX** (اینترو) که با ۲۰ خط کد حل می‌شود و بزرگ‌ترین اثر را دارد.
2. **یک باگ موبایل** (۳۸۹px) که روی گوشی‌های کوچک همه صفحات را می‌شکند.
3. **بدهی دسترسی‌پذیری** که عمده‌اش سه الگو است (`separator` بدون مقدار، کنتراست `zinc-500`، `aria-label` ناهمخوان) و با اصلاح سه نقطه، ۱۵۰+ گره از ۲۱۵ گره را پاک می‌کند.

برای فاز بعد آماده‌ام: هر سه P0 + پنج P1 را می‌توانم اصلاح کنم و با `backstop test` ثابت کنم طراحی عوض نشده.
