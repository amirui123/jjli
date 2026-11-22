# نقشه کامل پروژه — RTL Motion Lab

> بررسی فنی کامل مخزن `amirui123/jjli` · تاریخ بررسی: ۲۰۲۶-۱۰-۲۹
> این سند به‌عنوان مرجع دائمی نوشته شده؛ هر وقت خواستی کاری روی پروژه شروع کنیم، از همین‌جا می‌شود ادامه داد.

---

## ۱. خلاصه در ۳۰ ثانیه

یک **workbench تک‌صفحه‌ای فارسی (RTL)** که با React 18 + Vite 6 + Tailwind v4 + Framer Motion ساخته شده و **بدون بک‌اند** کار می‌کند. همه‌چیز یا در باندل است یا به‌صورت فایل استاتیک از `/public` خوانده می‌شود.

- **۷ استودیوی کاری + خانه + داشبورد + ۴۰۴** = ۹ مسیر واقعی (به‌علاوهٔ fallback)
- **۴۸٬۷۰۰ خط** کد در ۵۱ فایل (بدون احتساب vault)
- **`design-lab/`**: ۴٬۰۴۹ فایل دانش در ۱۱ ستون و ۵۴ زیرشاخه (≈۳۰ مگابایت)
- **۹۳ خانواده فونت فارسی/عربی/انگلیسی** (۱۴۰ فایل واقعی روی دیسک)
- **۴٬۱۹۹ سورس کامپوننت** از ۱۲ رجیستری متن‌باز (سرو از طریق ۴۷ فایل chunk در `/regcode`)
- **۲۸۵ صدای رویه‌ای** (۸۵ طراحی DSL + ۲۰۰ رسیپی قدیمی‌تر)
- **۲۶ شیدر GLSL واقعی** با WebGL + اطلس گلیف فارسی ۶۴ خانه‌ای
- **۸۴ سیستم برند + ۱۷۹ اسکیل مارک‌داون** در `/public/vault`

**وضعیت سلامت:** build ✅ · typecheck‌پذیر ✅ · smoke test هر ۱۰ مسیر + همه تعامل‌ها ✅ · همهٔ assetها روی dev server با کد ۲۰۰ سرو می‌شوند ✅ · base path گیت‌هاب پیجز درست بازنویسی می‌شود ✅

---

## ۲. اجرا و پیش‌نمایش

```bash
npm ci
npm run dev        # → http://localhost:5173  (بایند روی 0.0.0.0)
```

| اسکریپت | کار |
| :--- | :--- |
| `dev` | `generate` + Vite dev server روی پورت ۵۱۷۳ |
| `build` | `generate` + build تولیدی |
| `generate` | ۵ اسکریپت تولید داده (manifest، vault، فونت، chunk، آمار) |
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint روی `src` و `scripts` |
| `smoke` | build + اجرای کل اپ در jsdom و تست هر ۱۰ مسیر + ۵ تعامل |
| `single` | ساخت فایل HTML تک‌فایلی آفلاین (خروجی ۲۲ مگابایتی در `share/`) |
| `serve` | سرور استاتیک برای تست build |

**استقرار:** GitHub Actions (`.github/workflows/pages.yml`) با `VITE_BASE=/<repo>/` روی GitHub Pages. این را تست کردم — هم لینک‌های `index.html` و هم `url()`های داخل CSS درست به `/jjli/...` بازنویسی می‌شوند، و هر `fetch` در زمان اجرا از `publicUrl()` رد می‌شود.

> ⚠️ نکته: کلید پشتیبانی `VITE_BASE` تنها جایی است که زیرمسیر را می‌فهمد. هر `fetch` جدیدی که بدون `publicUrl()` بنویسی، روی GitHub Pages می‌شکند.

---

## ۳. نقشه پوشه‌ها

```
src/
├─ App.tsx                  ← lazy routing، ErrorBoundary، Suspense، عنوان صفحه
├─ main.tsx                 ← mount + حذف اسپلش #boot
├─ index.css                ← ۱٬۵۴۰ خط: ۹۳ @font-face + توکن‌ها + یوتیلیتی‌ها
├─ lib/
│  ├─ router.tsx            ← hash router دستی (بدون وابستگی) + جدول ROUTES
│  ├─ store.tsx             ← تنظیمات سراسری + localStorage + loadAsset
│  ├─ spring.ts             ← حل عددی ODE فنر + خروجی CSS linear()
│  ├─ download.ts           ← blob/native FS/zip
│  ├─ zip.ts                ← سازنده ZIP بدون وابستگی
│  ├─ base.ts               ← publicUrl() برای base path
│  └─ format.ts             ← faNum / faCount
├─ shell/AppShell.tsx       ← TopBar + CommandPalette + BottomDock + Footer + backdrop
├─ ui/
│  ├─ StudioShell.tsx       ← قالب ۳ ریلی همه استودیوها + تب موبایل
│  ├─ kit.tsx               ← Panel/Slider/Toggle/Segmented/Badge/CodeBlock/…
│  ├─ Markdown.tsx, Toast.tsx, DownloadButton.tsx, ErrorBoundary.tsx
├─ pages/                   ← ۱۰ صفحه (خانه، داشبورد، ۷ استودیو، ۴۰۴)
├─ components/              ← IntroFilm (۱٬۲۰۹ خط)، BentoShowcase، ShaderSurface، AiTour…
├─ engines/                 ← soundEngine، shaderLab، persianEngines
└─ data/                    ← ۹ فایل auto-generated (۴۲ هزار خط!)
design-lab/                 ← vault دانش، ۴٬۰۴۹ فایل
public/
├─ fonts/                   ← ۱۴۰ فایل در ۶ دسته
├─ vault/                   ← ۱۷۹ skill + ۸۴ brand + index.json
├─ regcode/chunks/          ← ۴۷ chunk سورس کامپوننت (۲۸ مگابایت)
├─ ai/                      ← dataset.json (۴۰ جفت) + system-prompt.md
├─ backgrounds/             ← ۳ والپیپر
└─ favicon.svg
scripts/                    ← ۹ اسکریپت تولید/تست
share/                      ← خروجی HTML تک‌فایلی (۲۲ مگابایت)
docs/                       ← hero.svg، architecture.svg، همین سند
```

**نکته مهم دربارهٔ `toolkit/`:** این پوشه در `.gitignore` است (۷۶ مگابایت / ۷٬۰۳۵ فایل منبع خام). اسکریپت `generate` وقتی نبودش را می‌بیند، پیام `toolkit/ not found — using committed data` می‌دهد و از داده‌های کامیت‌شده در `src/data/` استفاده می‌کند. یعنی **همه‌چیز بدون آن هم کار می‌کند**، ولی اگر بخواهی manifestها را از نو بسازی، باید `toolkit/` را برگردانی.

---

## ۴. مسیرها

| # | مسیر | id | رنگ | چه چیزی |
| :-- | :--- | :--- | :--- | :--- |
| ۱ | `#/` | home | زعفرانی `#E8B33A` | لندینگ سینمایی با ۳ صحنه |
| ۲ | `#/dashboard` | dashboard | بنفش `#8B5CF6` | تله‌متری ۴ گیج رادیال + دک استودیوها |
| ۳ | `#/studio/fonts` | fonts | زعفرانی `#E8B33A` | آتلیه تایپوگرافی |
| ۴ | `#/studio/motion` | motion | فیروزه‌ای `#22D3EE` | فیزیک فنر |
| ۵ | `#/studio/components` | components | سبزآبی `#5EEAD4` | کاوشگر سورس + بنتو |
| ۶ | `#/studio/sounds` | sounds | یاقوتی `#FB7185` | DAW صدا |
| ۷ | `#/studio/skills` | skills | بنفش `#A78BFA` | Codex / vault |
| ۸ | `#/studio/engines` | engines | آبی `#38BDF8` | شیدر + ممیزی RTL |
| ۹ | `#/studio/ai` | ai | صورتی `#F472B6` | پرامپت‌ساز + QLoRA |

روتر **hash-based** است و دستی نوشته شده (`useSyncExternalStore` + یک listener مشترک `hashchange`). چرا؟ تا روی هر هاست استاتیکی بدون rewrite rule کار کند.

---

## ۵. پوستهٔ اپ (`AppShell.tsx`)

| بخش | چیست |
| :--- | :--- |
| **TopBar** | لوگو + پیل ناوبری مغناطیسی دسکتاپ (فقط `xl`+) + دکمهٔ جستجو + منوی دسترسی‌پذیری + پیکر رنگ + تماشای اینترو + تاگل صدا + لینک گیت‌هاب |
| **CommandPalette** (`⌘K` / `Ctrl+K`) | جستجوی زنده در مسیرها؛ با `Escape` بسته می‌شود |
| **BottomDock** | ۹ بخش با افکت macOS-style magnify (همسایه‌ها ۱٬۰۴ برابر، هاور ۱٬۱۲)؛ روی موبایل اسکرول افقی با ماسک لبه |
| **A11y Sheet** | ۴ گروه: فونت نمایشی (۵ گزینه)، مقیاس متن (۱ / ۱٬۰۸ / ۱٬۱۵)، شدت موشن (۱–۳)، کنتراست بالا |
| **رنگ** | ۶ تم (زعفران، فیروزه، لاجورد، زمرد، یاقوت، بنفش) + هگز سفارشی + یادداشت روانشناسی رنگ برای هر تم |
| **Footer** | فقط روی مسیرهای غیراستودیو |
| **Backdrop** | والپیپر تمام‌صفحه با `opacity: 0.17` که **بر اساس تم انتخابی** عوض می‌شود |
| **Page transition** | هر مسیر یک `initial` اختصاصی دارد (خانه از پایین، اسکیل از بالا، کامپوننت از راست…) |

**نکات ریز مهندسی‌شده:** دکمهٔ «پرش به محتوا» به‌جای `href="#…"` از `focus()` استفاده می‌کند (چون روتر hash است و `href` ناوبری را می‌شکست). ساندپلی روی هاور با throttle ۷۵ میلی‌ثانیه.

---

## ۶. سیستم طراحی

### ۶-۱. توکن‌های رنگ

```
--bg             #05060A     پس‌زمینهٔ اصلی (خیلی تیره، نه سیاه مطلق)
--panel          #0B0D14     پنل
--panel-elevated #101420
--line           rgba(255,255,255,0.075)
--line-strong    rgba(255,255,255,0.14)
--accent         #E8B33A     زعفرانی پیش‌فرض
--accent-glow    232,179,58  (RGB برای rgba(var(--accent-glow), α))
--font-scale     1
```

`--accent` و `--accent-glow` در زمان اجرا از `AppSettingsProvider` روی `:root` ست می‌شوند. کنتراست بالا `--line` را به ۰٬۲۲ می‌برد.

### ۶-۲. تایپوگرافی

- **UI:** Vazirmatn
- **نمایشی:** Hasti (Heavy) — و با سوییچر قابل تعویض به Nastaliq / Morabba / Kahroba / Peyda
- **خوشنویسی:** IranNastaliq، Gulzar
- **کد:** Vazir Code
- ۹۳ خانواده در ۶ دسته: نستعلیق و خوشنویسی · خاص و پوستری · مدرن UI و متغیر · مونواسپیس کد · تحریریه و بین‌المللی · انگلیسی نمایشی
- **قانون سخت:** `[dir="rtl"] *:not([data-tracking]) { letter-spacing: 0 }` — چون هر tracking مثبتی اتصال حروف فارسی را می‌شکند

### ۶-۳. یوتیلیتی‌های CSS

| کلاس | کار |
| :--- | :--- |
| `.bg-engineering-grid` | گرید ۳۲پیکسلی محو |
| `.bg-grain` | نویز SVG درون‌خطی |
| `.holographic-foil` | گرادیان زعفران/فیروزه/بنفش با `mix-blend-mode: screen` |
| `.glass-bevel` | بیول شیشه‌ای (inset highlight + سایه) |
| `.spotlight-card` | هالهٔ شعاعی که با `--spot-x/--spot-y` دنبال موس می‌رود |
| `.studio-scroll` | اسکرول‌بار ۶ پیکسلی نازک برای ریل‌ها |
| `.marquee-track` | نوار بی‌پایان با متغیر `--marquee-duration` |
| `.shimmer-text` / `.aurora-blob` / `.float-y` / `.skeleton` | انیمیشن‌های آماده |
| `.tap-target` / `.tap-icon` | حداقل ۴۰ پیکسل لمس روی موبایل |
| `.dock-mask` / `.pb-safe` | ماسک لبه و `env(safe-area-inset-bottom)` |
| **`desk:`** | variant اختصاصی Tailwind v4 برای `width >= 1200px` |

### ۶-۴. کیت کامپوننت (`src/ui/kit.tsx`)

`Panel` · `Slider` · `Toggle` · `Segmented` · `Badge` · `SearchField` · `Select` · `CopyButton` · `CodeBlock` (هایلایتر دستی بدون Prism) · `Spinner` · `EmptyState` · `Stat` · `useInterval` · `useMediaQuery` · `useCopyState`

### ۶-۵. ستون فقرات: `StudioShell`

همهٔ ۷ استودیو یک قالب مشترک دارند:

- **دسکتاپ (≥۱۲۰۰px):** سه ریل — `فهرست | دستگیره | صحنه | دستگیره | تنظیمات`
  - عرض‌ها با درگ تغییر می‌کند (فهرست ۲۰۰–۴۳۰، تنظیمات ۲۴۰–۴۷۰)، `Shift+Arrow` برای دقت، دابل‌کلیک = ریست
  - کلید **`F`** = حالت فوکوس (ریل‌ها می‌روند)، `Escape` = خروج
  - عرض‌ها در `localStorage` ذخیره می‌شوند (`studio-layout`)
  - صفحه اسکرول نمی‌خورد (`h-[100dvh] overflow-hidden`) — هر ریل خودش اسکرول دارد
- **موبایل (<۱۲۰۰px):** به شیت سه‌تبی تبدیل می‌شود: `پیش‌نمایش / تنظیمات / فهرست`. انتخاب یک آیتم از فهرست خودکار به پیش‌نمایش برمی‌گردد (`focusStudioPreview()`).
- هر ریل `data-rail` دارد — تست smoke همین را چک می‌کند.
- **هفت variant بصری** با رنگ و هدر گرادیان و متن راهنمای اختصاصی: `atelier` · `oscilloscope` · `blueprint` · `daw` · `codex` · `shader-deck` · `neural-forge`

---

## ۷. استودیو به استودیو

### 🏠 خانه (`Landing.tsx`, ۷۴۵ خط)
سه صحنهٔ اسکرول‌کرئوگرافی‌شده:

1. **هیرو تمام‌صفحه** — شیدر `mesh-aurora` با `opacity 0.25` به‌عنوان هاله. تیتر دو خطی: خط اول از **راست** می‌آید، خط دوم از **چپ** — نماد بصری RTL. چهار پیل تعویض زندهٔ فونت تیتر که با کلیک، همان فونت را در استودیو باز می‌کند (deep link با `writePersisted`).
2. **نوارهای سینتیک** — دو خط عظیم (Hasti + Nastaliq) که روی اسکرول در جهت مخالف هم می‌لغزند (`useSpring` روی `scrollYProgress`).
3. **چهار پرده** (تایپوگرافی، فیزیک، Codex، کامپوننت/صدا/شیدر) — هر پرده: شماره و برچسب از بالا فرود می‌آید، تیتر از راست، صحنهٔ تعاملی از چپ. هر پرده یک ویژوال واقعی دارد (`typography` / `physics` / `vault` / `engines`) + ۷ کاشی دسترسی سریع در انتها.
4. **نوار پیشرفت اسکرول** ۲ پیکسلی بالای صفحه با گرادیان زعفران→فیروزه→بنفش.

### 📊 داشبورد (`Dashboard.tsx`, ۷۵۴ خط)
- ۴ گیج رادیال SVG واقعی (vault / fonts / components / sounds) با درصد و رنگ اختصاصی، کلیک‌پذیر برای پرش به استودیو
- دک استودیوها + پیکر رنگ + بازپخش اینترو
- شمارنده‌های تله‌متری زنده

### 🟡 استودیو فونت (`FontStudio.tsx`, ۹۱۷ خط)
- متن نمونهٔ دلخواه + ۹۳ خانواده با **بارگذاری واقعی فایل**
- ۸ محور تایپوگرافی: اندازه، وزن، ارتفاع خط، تراکم حروف، کشیدگی، شیب، سایه، محور متغیر `GRAD`/`wdth`
- دسته‌بندی + جستجو، ارتفاع خط پیشنهادی هر فونت، بج «ارقام فارسی»
- خروجی کپی‌شدنی: `@font-face`، Tailwind v4، `next/font`
- دانلود مستقیم `woff2/woff/ttf` + دانلود کیت ZIP
- `data-testid="font-specimen"` برای تست

### 🔵 استودیو موشن (`MotionStudio.tsx`, ۶۶۳ خط)
- **حل عددی ODE واقعی** در `lib/spring.ts`: سختی/میرایی/جرم → شبیه‌سازی فریم‌به‌فریم
- خروجی محاسبه‌شده: **نسبت میرایی ζ**، **زمان نشست (ms)**، **درصد فراجهش**، دستهٔ کیفی (کشسان/طبیعی/آرام/بدون نوسان)
- `springToCssLinear()` منحنی واقعی را به `linear()` تبدیل می‌کند و `springPath()` آن را به SVG می‌کشد
- ۶ پریست فنر (ابریشم، چابک، کشسان، سنگین، شلاقی، مایع) + رسیپی‌های کامل حرکت (distance، rotate، blur، scale، target)
- کد خروجی: Framer Motion، CSS، GSAP + دانلود کیت ZIP

### 🟢 استودیو کامپوننت (`ComponentsStudio.tsx`, ۸۷۹ خط)
- **۴٬۱۹۹ سورس واقعی** از ۱۲ رجیستری؛ کاوشگر **مجازی‌شده** (فقط ردیف‌های در دید رندر می‌شوند، `ROW_H` ثابت)
- سورس به‌صورت lazy از `/regcode/chunks/<registry>/<n>.json` خوانده می‌شود (chunk-size دار) — باندل اولیه سبک می‌ماند
- **BentoShowcase**: ۱۲ ویجت تعاملی بومی (کارت بانکی ۳بعدی، تایپ سینتیک، داک مغناطیسی، دیینامیک آیلند، تقویم جلالی، کره COBE، اورب Siri، ممیز RTL، دکمه مایع، بنتو اسپات‌لایت، استدلال AI، …)
- دانلود تک‌فایل `.tsx` یا کل رجیستری `.zip`

### 🔴 استودیو صدا (`SoundStudio.tsx`, ۶۹۸ خط + `soundEngine.ts` ۱٬۳۹۲ خط)
- **۲۸۵ صدا** = ۸۵ طراحی لایه‌ای (tone/noise/bell/seq) + ۲۰۰ رسیپی
- موتور Web Audio واقعی: ۴ نوع لایه، فیلتر biquad، نویز سفید/صورتی/قهوه‌ای، ریورب convolution، LFO، پن استریو، envelope
- کویزهای طراحی‌شده برای اینترو (sweep / rebound / astrolabe / spin / shatter / portal)
- اسکوپ‌وویس موج زنده + خروجی **WAV ۱۶ بیتی** (رندر آفلاین با `OfflineAudioContext`)

### 🟣 استودیو اسکیل (`SkillsStudio.tsx`, ۱٬۲۷۴ خط — بزرگ‌ترین صفحه)
سه تب: **مخزن ۴٬۰۴۹ فایلی** · **۱۷۹ اسکیل** · **۸۴ سیستم برند**
- **ریل پیلار** برای ۱۱ ستون + ۵۴ زیرشاخه، فیلتر پسوند (md/tsx/ts/js/css/html/frag/…)، جستجوی debounced
- فهرست مجازی‌شده، خوانندهٔ مارک‌داون با هایلایت کد، پیمایش با کلید (`stepVaultFile`)
- **AI Prompt Compiler**: انتخاب فریم‌ورک هدف (`react-tailwind` / `nextjs` / `vue` / `vanilla` / `ae-script`)، فونت، شدت قواعد، پلتفرم → پرامپت آماده کپی
- دانلود سند Markdown

### 💠 آزمایشگاه شیدر (`EnginesStudio.tsx`, ۸۱۹ خط)
دو حالت با یک سوئیچ:

**الف) شیدر (۲۶ عدد)** — دسته‌ها: `hacker` (۸ عدد: Matrix Rain فارسی، راهروی سایبری ۳بعدی، CRT، گرداب سینتیک، رادار هولوگرام، ASCII سینتز، پلکسوس، لیزر نستعلیق) · `gradient` · `noise` · `liquid` · `geometric` · `retro`
- `ShaderSurface.tsx`: رندرر WebGL خام (بدون three.js) با **اطلس گلیف ۸×۸ (۶۴ خانه، ۵۱۲×۵۱۲)** که با Canvas2D از حروف فارسی ساخته می‌شود و به شیدر پاس می‌شود
- یونیفرم‌های زنده: speed، scale، hue، warp، grain + `interactive` (دنبال موس)
- fallback گرادیانی اگر WebGL نبود

**ب) ممیزی RTL** — **۲۰ قاعده** روی کد چسبانده‌شده:
`ml/mr/pl/pr` · `left/right` · `split('')` روی فارسی · `tracking` · انیمیت width/top/left · `space-x/y` · `border-l/r`, `rounded-l/r` · `uppercase` روی فارسی · قفل `ltr` · ارقام لاتین · **نیم‌فاصله جاافتاده** · حروف عربی `ي/ك` · `letter-spacing` · آیکون جهت‌دار آینه‌نشده · انیمیت margin/padding · گرید فیزیکی
+ **اصلاح خودکار** + گزارش Markdown + امتیاز ۰–۱۰۰

### 🩺 موتورهای بومی ایرانی (`persianEngines.ts`, ۸۱۰ خط)
- **۱۸ بانک ایرانی** با تشخیص از پیش‌شماره کارت (بلوبانک، سامان، ملت، پاسارگاد، ملی، پارسیان، تجارت، صادرات، کشاورزی، سپه، مسکن، رفاه، آینده، کارآفرین، سینا، گردشگری، شهر، رسالت) هرکدام با تم رنگی
- `validateShetabLuhn` — اعتبارسنجی لان واقعی کارت شتاب
- `validateIranianNationalCode` — کد ملی با رقم کنترلی
- `generateShebaFromCard` — تولید شبا از کارت
- `numberToPersianWords` — عدد به حروف فارسی
- `cleanupPersianText` — پاکسازی متن، تبدیل ارقام، نیم‌فاصله
- `auditPersianCopy` — ممیزی متن (حروف عربی، ZWNJ، فاصله قبل از نگارش، bidi، ارقام)
- `toPersianDigits` / `toEnglishDigits` / `formatCardNumberFa` / `splitPersianWordsSafe`
- `mutateComponentCode` — تزریق تم و پیکربندی در سورس کامپوننت

### 🤖 استودیو AI (`AiStudio.tsx`, ۷۸۱ خط)
- **۴۰ جفت داده واقعی** در `public/ai/dataset.json` — هر جفت از یک فایل واقعی رجیستری ساخته شده (نه متن ساختگی)
- **پرامپت‌ساز**: نوع پروژه، فونت، سطح جزئیات، IDE هدف، پرسونا زیبایی‌شناسی، سه اجبار (فین‌تک ایرانی / Zero-CLS / OLED-safe)
- **`AiPipeline`**: نمودار ۴ گرهی زنده با پالس نور
- **`AiTour`**: تور ۵ صحنه‌ای (فقط یک‌بار نشان داده می‌شود، کلید `rtmlab.v1.ai-tour-seen`)
- **QLoRA config generator**: پایتون `datasets` + `SFTTrainer` + مدل‌های پایه (Qwen2.5-Coder / DeepSeek-Coder)
- `public/ai/system-prompt.md` — سند سیستم‌پرامپت سخت‌گیرانه (RTL-first، منع tracking، `useMotionValue` به‌جای `useState`، …)

### 📄 صفحهٔ ۴۰۴ (`NotFound.tsx`)
۳۸ خط، ساده و درست.

---

## ۸. لایهٔ داده (`src/data/`)

| فایل | خط | منبع |
| :--- | ---: | :--- |
| `designLabManifest.ts` | ۱۶٬۷۷۹ | پیمایش `design-lab/` |
| `registriesManifest.ts` | ۴٬۵۱۴ | فهرست رجیستری‌ها |
| `skillsManifest.ts` | ۲٬۸۹۹ | ۱۷۹ SKILL.md + ۸۴ DESIGN.md |
| `soundsManifest.ts` | ۱٬۸۱۶ | ۲۰۰ رسیپی |
| `persianFontsCatalog.ts` | ۹۵۲ | ۹۳ خانواده |
| `engineFilesManifest.ts` | ۸۹۲ | فایل‌های موتور/AI |
| `fontFiles.ts` | ۶۷۰ | نقشهٔ ۹۳ خانواده → ۱۸۶ فایل |
| `componentCatalog.ts` | ۵۴۹ | ۱۲ ویجت بومی |
| `soundLibrary.ts` | ۴۷۹ | ۸۵ طراحی DSL |
| `toolkitStats.ts` | ۹۱ | آمار اندازه‌گیری‌شده |

همه با هدر `AUTO-GENERATED — do not edit by hand` شروع می‌شوند.

### کلیدهای localStorage (پیشوند `rtmlab.v1.`)
`app-settings` · `studio-layout` · `studio-fonts` · `studio-motion` · `studio-components` · `studio-components-pick` · `studio-sounds` · `studio-sounds-pick` · `studio-shaders` · `studio-shaders-pick` · `studio-ai` · `studio-skills-pick-v2` · `ai-tour-seen`

---

## ۹. موشن ورود — «مُهر» (`IntroSeal.tsx`)

یک سکانس **۱٫۹ ثانیه‌ای** که فقط یک بار در هر نشست پخش می‌شود (`sessionStorage`). برخلاف اینتروی قبلی، دکمه یا دعوت به کلیک ندارد: خودش شروع می‌شود، خودش تمام می‌شود.

| مرحله | زمان | چه اتفاقی می‌افتد |
|---|---|---|
| فرود | ۰–۳۲۰ms | مِهرِ برنزی با رینگ طلایی از بالا می‌آید؛ چون در فریم اول در حال حرکت است، بادِ اولیه ندارد |
| ضربه | ۳۲۰ms | مهر روی کاغذ می‌نشیند: اسکواش، لرزش ۱px، دو جبههٔ فشار (طلایی و عاجی) و یک هالهٔ نور |
| اثر | ۳۲۰–۱۱۸۰ms | همان هندسهٔ حکاکی‌شده زیر مهر می‌ماند؛ هاله یک نفس می‌کشد |
| برداشتن | ۱۱۸۰ms | مهر به بالا کشیده می‌شود؛ در **۱۲۸۰ms** رویداد `rtmlab:hero-reveal` می‌رسد و هیرو از زیرِ همان برگه اجرا می‌شود |
| باز شدن | ۱۲۰۰–۱۹۰۰ms | برگه محو و بزرگ می‌شود و خودِ «اثر مهر» تا ۱۲ برابر باز می‌شود — صفحه از دلِ مهر بیرون می‌آید |

**چرا این:** سایت دربارهٔ «نشستنِ خط فارسی روی صفحه» است؛ مهر نماد اصیل همان ادعاست. مهم‌تر این‌که هیرو دیگر جدا از اینترو نیست — تا لحظهٔ برداشتن مهر اجرا نمی‌شود.

جزئیات پیاده‌سازی: کل تایم‌لاین یک جدول `CUES` بالای `IntroSeal.tsx` است (زمان مطلق + منحنی)، همهٔ توکن‌ها در `src/shell/introSeal.ts`، و `prefers-reduced-motion` فقط یک محو ۲۰۰ms می‌گیرد.

## ۱۰. یافته‌های بررسی — ریسک‌ها و باگ‌ها

### 🔴 بالا

**۱. ~~اینترو قابل رد کردن نیست.~~ ✅ رفع شد.**
`IntroFilm` حالا دکمهٔ «رد کردن» روی هر فریم دارد و `Escape` را هم می‌پذیرد (`e2e/app.spec.ts` نگهبان این رفتار است).

### 🟠 متوسط

**۲. عددهای متن با داده واقعی نمی‌خوانند (drift).**

| جای متن | می‌گوید | واقعیت |
| :--- | :--- | :--- |
| Landing / Dashboard / SkillsStudio | ۴٬۰۲۳ اسکیل | **۴٬۰۴۹** فایل |
| Landing / Dashboard / AppShell / README | ۱۸ شیدر | **۲۶** شیدر |
| AppShell footer / README | ۵۰ خانواده فونت | **۹۳** خانواده |
| index.html meta | ۴۴ فونت · ۱۷۹ اسکیل · ۲۰۰ صدا | ۹۳ · ۱۷۹ · **۲۸۵** |
| Landing / README | ۴۶ یا ۵۰ زیرشاخه | **۵۴** زیرشاخه |

اینها همه رشته‌های hard-coded هستند؛ منبع درست `TOOLKIT_STATS` و `DESIGN_LAB_TOTAL_FILES` است. اگر بخواهی، همه را به یک helper مرکزی وصل می‌کنم تا دیگر drift نکنند.

**۳. تکرار در `index.css` با مقادیر متناقض.**
`.marquee-track` دو بار، `.aurora-blob` دو بار، `@keyframes aurora-drift` **سه بار**، `.holographic-foil` دو بار، `.font-nastaliq` دو بار (اول `line-height: 2.35`، بعد `2.3 !important`)، `:root` دو بار، `:focus-visible` دو بار. در عمل آخرین تعریف برنده است، اما نگهداری را ریسکی می‌کند.

### 🟡 پایین

**۴. `toolkit/` در `.gitignore` است.** هر `npm run generate` پیام skip می‌دهد. کار می‌کند، ولی اگر روزی خواستی manifest را از منبع بازسازی کنی باید بدانی چرا چیزی عوض نمی‌شود.

**۵. باندل دادهٔ بزرگ.** سه chunk داده (`data-design-lab` ۲۴۷KB، `data-registries` ۲۳۴KB، `data-skills` ۱۹۹KB) بدون احتساب gzip. چون همهٔ صفحات lazy هستند، فقط صفحه‌ای که لازم دارد دانلود می‌کند — ولی `SkillsStudio` هر سه را می‌کشد.

**۶. `/studio/fonts` در smoke تنها ۱۹۳ کاراکتر برمی‌گرداند** — این باگ نیست، اثر زمان‌بندی است: اولین import تنبل آن chunk بیش از ۶۵۰ میلی‌ثانیهٔ انتظار هارنس طول می‌کشد و اسکلتون دیده می‌شود. در مرورگر واقعی طبیعی است. (اینجا ثبت کردم تا بعداً گیج‌کننده نشود.)

---

## ۱۱. گیت‌های کیفیت موجود

- `npm run typecheck` — TypeScript strict
- `npm run lint` — ESLint 9 + `react-hooks` + `jsx-a11y`
- `npm run smoke` — **بهترین سرمایهٔ پروژه**: نسخهٔ تولیدی را می‌سازد، کل اپ را در jsdom mount می‌کند و چک می‌کند:
  - هر ۱۰ مسیر > ۸۰ کاراکتر رندر شود
  - هر ۷ استودیو دقیقاً ۳ ریل `data-rail` داشته باشد
  - تعویض فونت، باز شدن سورس کامپوننت، deep link فونت، تغییر تم (`--accent`)، تب‌های موبایل، برگشت از فهرست به پیش‌نمایش
  - **دقیقاً یک `<h1>` در هر صفحه** و **هیچ دکمهٔ بی‌نامی**
  - داک دقیقاً ۹ بخش با `aria-label`

---

## ۱۲. اگر بخواهیم کار کنیم، مسیرهای طبیعی اینها هستند

1. **اصلاح اینترو** (skip + first-visit) — کم‌ریسک، اثر UX بالا
2. **یکسان‌سازی اعداد متن** با `TOOLKIT_STATS` — حذف drift برای همیشه
3. **پاکسازی `index.css`** از تعریف‌های تکراری
4. **تغییر ظاهر** — پالت، فونت نمایشی، فاصله‌ها، چیدمان هیرو
5. **افزودن استودیو یا قاعده جدید** به ممیز RTL / شیدر / صدا
6. **بهینه‌سازی باندل** — تقسیم بیشتر `data-*` یا جستجوی تنبل‌تر
7. **استقرار** — Pages یا Vercel، بررسی base path

هر کدام را بگویی، از همان‌جا شروع می‌کنیم. 🚀
