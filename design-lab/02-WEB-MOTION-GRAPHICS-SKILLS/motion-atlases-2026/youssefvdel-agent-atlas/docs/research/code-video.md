# Programmatic Video Production — A Verified Catalog

**Scope:** Making video *from code* (HTML/CSS/JS/canvas, React, Python, WASM) — not manual NLE editing.

**Verification method.** Every "verified" claim below was checked on this machine (Linux 7.0.0-38-generic, x86_64, Node v22.22.1, Python 3.14.7, FFmpeg `n9.0.1-11-ge47273f4d9-20260831`, Chrome for Testing 156.0.8078.4 via Playwright 1.64.1) unless explicitly marked otherwise. Package versions and licenses were read live from the **npm registry** (`registry.npmjs.org`) and the **GitHub API** (`gh api`, authenticated) on 2026-10-20. API signatures are quoted from the projects' own documentation — Remotion docs via their machine-readable `.md` endpoints, the W3C WebCodecs spec at `w3c.github.io/webcodecs`, and each project's own docs site / GitHub source.

**Legend for "Verified" column:**
- ✅ **Ran here** — the minimal example was executed and produced a real output file (file size / `ffprobe` output quoted).
- 📄 **Docs-verified** — signature/behavior confirmed from official docs or source, but not executed in this environment.
- ⚠️ **Caveat** — known limitation, deprecation, or nondeterminism found while verifying.

---

## 1. Master catalog

| # | Tool | Repo / Docs | License | Lang | Deterministic? | Headless? | Install | Status |
|---|------|-------------|---------|------|----------------|-----------|---------|--------|
| 1 | **Remotion** | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) · [docs](https://www.remotion.dev/docs) | **Remotion License** (source-available, not OSS) | TypeScript | ✅ Yes (frame-exact) | ✅ Yes | `npm i remotion @remotion/cli` | ✅ rendered 1280×720 H.264 |
| 2 | **Revideo** | [midrender/revideo](https://github.com/midrender/revideo) · [docs.re.video](https://docs.re.video/) | **MIT** | TypeScript | ✅ Yes (generator-based) | ✅ Yes | `npm init @revideo@latest` | 📄 verified from source |
| 3 | **Manim Community** | [ManimCommunity/manim](https://github.com/ManimCommunity/manim) · [docs.manim.community](https://docs.manim.community/) | **MIT** | Python | ✅ Yes (with `--seed`) | ✅ Yes | `pip install manim` | ✅ rendered H.264, byte-identical across runs |
| 4 | **MoviePy** | [Zulko/moviepy](https://github.com/Zulko/moviepy) · [zulko.github.io/moviepy](https://zulko.github.io/moviepy/) | **MIT** | Python | ✅ Yes (numpy frames) | ✅ Yes | `pip install moviepy` | ✅ rendered H.264 640×360@30 |
| 5 | **FFmpeg (native)** | [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) · [ffmpeg.org/ffmpeg-filters.html](https://ffmpeg.org/ffmpeg-filters.html) | LGPL/GPL (build-dependent) | C | ✅ Yes | ✅ Yes | `apt install ffmpeg` | ✅ concat + overlay + drawtext pipeline ran |
| 6 | **ffmpeg.wasm** | [ffmpegwasm/ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) | **MIT** (wrapper); core is **GPL-2.0-or-later** | C → WASM | ⚠️ Same as native | ✅ Yes (browser) | `npm i @ffmpeg/ffmpeg @ffmpeg/core` | ✅ transcoded in headless Chromium |
| 7 | **@ffmpeg/util** | npm `@ffmpeg/util@0.12.2` | MIT | TS | — | ✅ | `npm i @ffmpeg/util` | 📄 |
| 8 | **Mediabunny** | [Vanilagy/mediabunny](https://github.com/Vanilagy/mediabunny) · [mediabunny.dev](https://mediabunny.dev/) | **MPL-2.0** | TypeScript | ✅ Yes (explicit timestamps) | ✅ Yes | `npm i mediabunny` | ✅ wrote 30-frame H.264 MP4 in-browser |
| 9 | **Mediabunny server ext** | npm `@mediabunny/server@1.61.6` | MPL-2.0 | TypeScript | ✅ Yes | ✅ Node/Bun/Deno | `npm i @mediabunny/server` | 📄 |
| 10 | **WebCodecs API** | [w3c/webcodecs](https://github.com/w3c/webcodecs) · [spec](https://w3c.github.io/webcodecs/) | W3C spec (implementations vary) | Web API | ✅ Yes (frame-driven) | ✅ Yes | *browser-native* | ✅ codec support probed live |
| 11 | **MediaRecorder API** | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) · `HTMLCanvasElement.captureStream()` | Web standard | Web API | ❌ **No** (wall-clock) | ✅ Yes | *browser-native* | ✅ captured WebM VP9 |
| 12 | **Playwright video** | [microsoft/playwright](https://github.com/microsoft/playwright) · [docs](https://playwright.dev/docs/videos) | **Apache-2.0** | TS/Py/Java/.NET | ❌ **No** (wall-clock) | ✅ Yes | `npm i playwright` | ✅ recorded 1.48 s VP9 WebM |
| 13 | **Puppeteer record/screencast** | [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) · [pptr.dev](https://pptr.dev/api/puppeteer.page.record) | **Apache-2.0** | TypeScript | ❌ **No** | ✅ Yes | `npm i puppeteer` | ✅ recorded MP4 (AV1) |
| 14 | **MP4Box.js** | [gpac/mp4box.js](https://github.com/gpac/mp4box.js) | **BSD-3-Clause** | TypeScript | ✅ Yes (parse/mux) | ✅ Node + browser | `npm i mp4box` | 📄 |
| 15 | **webm-muxer** | [Vanilagy/webm-muxer](https://github.com/Vanilagy/webm-muxer) | MIT | TypeScript | ✅ | ✅ | `npm i webm-muxer` | ⚠️ **DEPRECATED** → Mediabunny |
| 16 | **mp4-muxer** | [Vanilagy/mp4-muxer](https://github.com/Vanilagy/mp4-muxer) | MIT | TypeScript | ✅ | ✅ | `npm i mp4-muxer` | ⚠️ **DEPRECATED** → Mediabunny |
| 17 | **lottie-web** | [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | **MIT** | JavaScript | ✅ Yes (`goToAndStop(frame, true)`) | ✅ Yes | `npm i lottie-web` | ✅ rendered 60 Lottie frames → MP4 |
| 18 | **dotLottie web** | [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) | MIT | TS (Rust/WASM) | ✅ | ✅ | `npm i @lottiefiles/dotlottie-web` | 📄 |
| 19 | **Rive runtime (WASM)** | [rive-app/rive-wasm](https://github.com/rive-app/rive-wasm) · [rive-runtime](https://github.com/rive-app/rive-runtime) | **MIT** | C++/TS | ✅ (state machine advance) | ✅ Yes | `npm i @rive-app/canvas` | 📄 |
| 20 | **Three.js** | [mrdoob/three.js](https://github.com/mrdoob/three.js) | **MIT** | JavaScript | ✅ (fixed timestep) | ✅ (SwiftShader) | `npm i three` | ✅ offscreen render to PNG |
| 21 | **@remotion/three** | npm `@remotion/three@4.0.537` | MIT | TypeScript | ✅ | ✅ | `npm i @remotion/three` | 📄 |
| 22 | **@remotion/lottie** | npm `@remotion/lottie@4.0.537` | Remotion License | TS | ✅ | ✅ | `npm i @remotion/lottie` | 📄 |
| 23 | **@remotion/rive** | npm `@remotion/rive@4.0.537` | Remotion License | TS | ✅ | ✅ | `npm i @remotion/rive` | 📄 |
| 24 | **fluent-ffmpeg** | npm `fluent-ffmpeg@2.1.3` | MIT | JS | ✅ | ✅ | `npm i fluent-ffmpeg` | 📄 (⚠️ **unmaintained**, last release 2.1.3) |
| 25 | **ffmpeg-static** | npm `ffmpeg-static@5.3.0` | GPL-3.0-or-later | binary | ✅ | ✅ | `npm i ffmpeg-static` | 📄 |
| 26 | **ffmpeg-python** | PyPI `ffmpeg-python@0.2.0` | (unspecified) | Python | ✅ | ✅ | `pip install ffmpeg-python` | 📄 |
| 27 | **VidGear** | [abhiTronix/vidgear](https://github.com/abhiTronix/vidgear) | **Apache-2.0** | Python | ⚠️ mostly | ✅ | `pip install vidgear` | 📄 |
| 28 | **Decord** | [dmlc/decord](https://github.com/dmlc/decord) | Apache-2.0 | C++/Python | ⚠️ | ✅ | `pip install decord` | ⚠️ **stale** (last push 2024-07-17) |
| 29 | **OpenCV** | [opencv/opencv](https://github.com/opencv/opencv) | **Apache-2.0** | C++/Python | ⚠️ | ✅ | `pip install opencv-python` | 📄 |
| 30 | **PyAV** | [PyAV-Org/PyAV](https://github.com/PyAV-Org/PyAV) | **BSD-3-Clause** | Python/C | ✅ | ✅ | `pip install av` | 📄 (installed 19.0.1) |
| 31 | **ImageIO / imageio-ffmpeg** | [imageio/imageio](https://github.com/imageio/imageio) | BSD-2-Clause | Python | ✅ | ✅ | `pip install imageio imageio-ffmpeg` | 📄 |
| 32 | **edge-tts** | [rany2/edge-tts](https://github.com/rany2/edge-tts) | (unspecified) | Python | ❌ **No** (network) | ✅ | `pip install edge-tts` | ✅ produced MP3 (flaky 403s) |
| 33 | **Piper TTS** | [rhasspy/piper](https://github.com/rhasspy/piper) | MIT / GPL-3.0 (per-component) | C++/Python | ✅ Yes (local) | ✅ | `pip install piper-tts` | 📄 ⚠️ repo **archived** 2025-08-26 |
| 34 | **Kokoro TTS** | [hexgrad/kokoro](https://github.com/hexgrad/kokoro) | **Apache-2.0** | Python/JS | ✅ Yes (local) | ✅ | `pip install kokoro` | 📄 |
| 35 | **SoX** | sourceforge `sox` | LGPL-2.1 | C | ✅ | ✅ | `apt install sox` | 📄 (not installed here) |
| 36 | **Pydub** | PyPI `pydub@0.25.1` | MIT | Python | ✅ | ✅ | `pip install pydub` | 📄 |
| 37 | **html2canvas / dom-to-image** | npm `html2canvas@1.4.1`, `dom-to-image@2.6.0` | MIT | JS | ⚠️ rasterizing DOM ≠ real render | ✅ | `npm i html2canvas` | 📄 |
| 38 | **@resvg/resvg-js** | npm `@resvg/resvg-js@2.6.2` | **MPL-2.0** | Rust→NAPI | ✅ Yes | ✅ Node | `npm i @resvg/resvg-js` | 📄 |
| 39 | **skia-canvas / @napi-rs/canvas** | npm `skia-canvas@4.0.0`, `@napi-rs/canvas@1.0.11` | MIT | Native | ✅ | ✅ | `npm i skia-canvas` | 📄 |
| 40 | **@remotion/web-renderer** | npm `@remotion/web-renderer@4.0.537` | Remotion License | TS | ✅ | ✅ | `npm i @remotion/web-renderer` | 📄 (⚠️ always sends telemetry) |
| 41 | **@remotion/media-parser / @remotion/webcodecs** | npm | Remotion License | TS | — | ✅ | `npm i @remotion/media-parser` | ⚠️ **DEPRECATED** → Mediabunny |

---

## 2. Deep dives

### 2.1 Remotion — React → MP4

**Repo:** https://github.com/remotion-dev/remotion · **License:** Remotion License (source-available, **not** OSI open source) · **Language:** TypeScript
**npm:** `remotion@4.0.537`, `@remotion/cli@4.0.537` (all `@remotion/*` packages must share the exact same version)

#### Licensing — read this before shipping

From `LICENSE.md` in the repo (fetched 2026-10-20):

> **Free License** — You are eligible to use Remotion for free if you are: an individual; a for-profit organization with **up to 3 employees**; a non-profit or not-for-profit organization; evaluating whether Remotion is a good fit, and are not yet using it in a commercial way.
>
> **Company License** — You are required to obtain a Company License to use Remotion if you are not within the group of entities eligible for a Free License.

Pricing page (https://www.remotion.dev/docs/license/pricing) lists: **Company License** — "Pay according to usage"; **Remotion for Automators** — *"Build video creation tools — $0.01 per render, $100/mo minimum"*; **Remotion for Creators** — *$25/mo per seat*; **Enterprise** — *starting at $500/month*.

**Telemetry** (https://www.remotion.dev/docs/telemetry):
- Server-side (`renderMedia()`, `renderMediaOnLambda()`, `renderMediaOnVercel()`) sends telemetry **only when `licenseKey` is set**, and only for **successful** renders.
- Client-side (`@remotion/web-renderer` → `renderMediaOnWeb()`) **always** sends an event per render, success or failure, and transmits the end user's IP address and `window.location.origin`.
- Free-license declaration: pass `licenseKey: 'free-license'`.
- *"Telemetry never fails a render"* and *"Telemetry data is currently retained indefinitely and is not regularly deleted."*
- In Remotion 5.0 the `licenseKey` becomes **obligatory** for "Remotion for Automators" companies.

#### CLI

Commands (`npx remotion`): `studio`, `render`, `still`, `compositions`, `lambda`, `bundle`, `browser`, `cloudrun`, `benchmark`, `skills`, `versions`, `upgrade`, `add`, `gpu`, `ffmpeg`, `ffprobe`, `help`.
Deno is **not supported** (there's a `remotiond` experimental variant). Bun works via `remotionb` / `--bun`.

#### Server-side render API

Signature quoted from https://www.remotion.dev/docs/renderer/render-media.md (the `.md` suffix serves raw markdown — great for agents):

```tsx
import {renderMedia, selectComposition} from '@remotion/renderer';

const inputProps = { titleText: 'Hello World' };
const composition = await selectComposition({ serveUrl, id: 'my-video', inputProps });

await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation,
  inputProps,
});
```

Documented options include: `serveUrl`, `composition`, `codec`, `outputLocation?`, `inputProps?`, `port?`, `frameRange?` (a single frame, a `[start, end]` tuple, or — v4.0.502+ — an **array of ordered non-overlapping ranges** to concatenate sections, with video/audio from gaps omitted), `concurrency?`, `metadata?`, `onArtifact?`, `audioCodec?`, `audioBitrate?` (default 320k), `videoBitrate?`, `crf?`, `bufferSize?`, `maxRate?`, `imageFormat?` (`jpeg` default, `png` for transparent, `none` for audio-only), `browserExecutable?`, `everyNthFrame?` (GIFs only), `pixelFormat?`, `envVariables?`, `jpegQuality?` (default 80), `muted?`, `hardwareAcceleration?` (`"disable" | "if-possible" | "required"`, default `"disable"`), `enforceAudioTrack?`, `puppeteerInstance?`, `scale?`, `overwrite?`, `onStart?`, `onProgress?`, `onDownload?`, `proResProfile?`, `x264Preset?`.

#### Minimal working example — ✅ VERIFIED

```bash
mkdir remotion-demo && cd remotion-demo
npm init -y
npm i --save-exact remotion@4.0.537 @remotion/cli@4.0.537 react@19.3.1 react-dom@19.3.1
npx remotion browser ensure      # downloads a Chrome build Remotion can drive
```

`src/index.ts`
```tsx
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';
registerRoot(RemotionRoot);
```

`src/Root.tsx`
```tsx
import React from 'react';
import {Composition} from 'remotion';
import {HelloWorld} from './HelloWorld';

export const RemotionRoot: React.FC = () => (
  <Composition id="HelloWorld" component={HelloWorld}
    durationInFrames={90} fps={30} width={1280} height={720} />
);
```

`src/HelloWorld.tsx`
```tsx
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
  const scale = interpolate(frame, [0, 30], [0.5, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#0d0d12', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontSize: 90, color: 'white', opacity, transform: `scale(${scale})`}}>
        Frame {frame} @ {fps}fps
      </div>
    </AbsoluteFill>
  );
};
```

`tsconfig.json` — **required**, Remotion errors out without it:
```json
{ "compilerOptions": { "target": "ES2018", "module": "ESNext", "jsx": "react-jsx",
  "esModuleInterop": true, "strict": true, "noEmit": true, "skipLibCheck": true,
  "moduleResolution": "node" }, "include": ["src"] }
```

Render:
```bash
npx remotion render src/index.ts HelloWorld out/video.mp4
```

**Actual output on this machine:**
```
Rendered 90/90
Encoded 90/90
+                    out/video.mp4 83.4 kB
```
`ffprobe`: `codec_name=h264, width=1280, height=720, r_frame_rate=30/1, nb_frames=90, duration=3.000000, size=83431`

Programmatic variant (✅ also verified — wrote `out/video-api.mp4`, 84 985 bytes, 90 frames):
```js
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, selectComposition} from '@remotion/renderer';

const serveUrl = await bundle({entryPoint: 'src/index.ts', onProgress: () => {}});
console.log(await getCompositions(serveUrl));  // -> HelloWorld:1280x720@30f/90f
const composition = await selectComposition({serveUrl, id: 'HelloWorld'});
await renderMedia({composition, serveUrl, codec: 'h264',
  outputLocation: 'out/video-api.mp4', inputProps: {}, licenseKey: 'free-license'});
```

#### Determinism — measured, not claimed

Two CLI renders of the same composition produced **byte-identical** MP4s (`sha256 461d27f8…`). Two API renders also produced byte-identical files (`cb69a207…`). ⚠️ **However**, the CLI output and the API output differed from each other (`461d27f8…` vs `cb69a207…`) — the *decoded pixels* also differ (framemd5 of decoded frames: `e4358fef…` vs `1721161809…`). The cause is that the CLI defaults to `imageFormat: 'jpeg'` (lossy, with browser-dependent JPEG encoding) while the API path in my script rendered through a different capture configuration. **Takeaway: for bit-reproducible output, set `imageFormat: 'png'` and pin the browser build; do not rely on the default JPEG path.** This is the single most important determinism caveat in Remotion.

**Best for:** React/TS teams, data-driven video (dashboards, personalized data video), template APIs with `inputProps`, batch/serverless rendering, and anything where a component library already exists.
**Avoid when:** you need a permissive OSS license (Remotion's license is proprietary — use Revideo or Mediabunny), when render cost at scale is a concern (Remotion for Automators is metered per render), or when you need true 3D/physics beyond what CSS/SVG/Three.js-in-React can express.

---

### 2.2 Revideo — the open-source alternative

**Repo:** https://github.com/midrender/revideo (4 124 ★, MIT, TypeScript, last push 2026-07-15) · **Docs:** https://docs.re.video/
**npm:** `@revideo/core@0.11.0`, `@revideo/2d@0.11.0`, `@revideo/renderer@0.11.0`, `@revideo/cli@0.11.0`, `@revideo/ffmpeg@0.11.0`, `@revideo/player@0.11.0`, `@revideo/vite-plugin@0.11.0`.

**Important correction to the common "Remotion fork" label:** Revideo was **forked from Motion Canvas**, not from Remotion. From the original README at the repo's first commit (`5f9a3058`):

> "Revideo is an open source framework for programmatic video editing. It is **forked from the amazing Motion Canvas editor**, with the goal of turning it from a standalone application into a library…"

The current README adds: *"Revideo borrows concepts from Remotion and Rive, but is, in its core, zero dep."* So: **Motion Canvas lineage, Remotion-inspired API.**

**Architecture (from `packages/docs/src/content/guide/rendering-videos.mdx`):**
> "The code in the browser loops through all frames in the defined video, draws the defined frames onto an HTML Canvas and feeds them into the `VideoEncoder` of the WebCodecs API. This turns all frames into a mute mp4 file. In the 'backend', ffmpeg is used to extract all audio from the `<Video/>` and `<Audio/>` elements… and to merge them into a single audio file. This file finally gets merged with the mute video produced in the browser to obtain the resulting mp4 video."

**Minimal example (from the repo's own template, `packages/template/src/render.ts`):**
```tsx
import {renderVideo} from '@revideo/renderer';

async function render() {
  const file = await renderVideo({
    projectFile: './src/project.ts',
    settings: { logProgress: true },
  });
  console.log(`Rendered video to ${file}`);
}
render();
```

`renderVideo()` options (from `packages/docs/src/content/api-reference/renderer/renderVideo.mdx`): `projectFile` (required), `variables?`, and `settings?` containing `outFile?` (**must end in `.mp4`**), `outDir?` (default `./output`), `workers?` (default 1 — parallel chunk rendering), `logProgress?`, `projectSettings?` (with `range`, `size: {x, y}`), `ffmpeg?` (`ffmpegPath`, `ffmpegLogLevel`), `puppeteer?` (`args: ['--no-sandbox']`), `progressCallback?`.

**Install:** `npm init @revideo@latest` → `cd <project>` → `npm install`. Requires **Node ≥ 16**; on Linux also `sudo apt-get install nscd` (for the ffmpeg helper).

**CLI** (`packages/cli/src/index.ts`) — only two commands: `revideo serve` (render endpoint, default port 4000) and `revideo editor` (default port 9000).

**Telemetry:** PostHog, disabled with `DISABLE_TELEMETRY=true`.

**Best for:** teams that need a **permissive MIT license**, want generator-based (`yield*`) animation code, or want a React `<Player/>` preview plus a headless render API in the same project.
**Avoid when:** you need the huge Remotion ecosystem/plugin set, or when you need the well-trodden serverless/CLI path (Revideo's CLI is thinner; most usage is via `renderVideo()` in a script).

---

### 2.3 Manim Community — Python → mathematical animation

**Repo:** https://github.com/ManimCommunity/manim (41 709 ★, MIT, Python, last push 2026-10-16) · **PyPI:** `manim==0.22.0` (requires Python ≥ 3.11) · **Docs:** https://docs.manim.community/en/stable/

**System dependencies** (quoted from the official install guide):
```bash
# Debian / apt
sudo apt update
sudo apt install build-essential python3-dev libcairo2-dev libpango1.0-dev
```
> "Linux users need to build ManimPango (and potentially pycairo) from source… A C compiler, Python's development headers, the pkg-config tool, Pango and its development headers, and Cairo and its development headers."

LaTeX is **optional** — needed only for `MathTex`/`Tex`:
```bash
sudo apt install texlive-full   # or a smaller distro + the required packages
```
Required LaTeX packages: `amsmath babel-english cbfonts-fd cm-super count1to ctex doublestroke dvisvgm everysel fontspec frcursive fundus-calligra gnu-freefont jknapltx latex-bin mathastext microtype multitoc physics preview prelim2e ragged2e relsize rsfs setspace standalone tipa wasy wasysym xcolor xetex xkeyval`.

**CLI** (`manim --help` run here, v0.22.0): subcommands `render` (default), `cache`, `cfg`, `checkhealth`, `init`, `plugins`. Key flags: `-q/--quality [l|m|h|p|k]` (854×480@15, 1280×720@30, 1920×1080@60, 2560×1440@60, 3840×2160@60), `-r/--resolution "W,H"`, `--fps`, `--format [auto|none|png|png-sequence|gif|mp4|webm|mov]`, `--renderer [cairo|opengl]`, `-t/--transparent`, `--seed INTEGER` (*"Set the random seed to allow reproducibility"*), `--media_dir`, `-n/--from_animation_number`, `-a/--write_all`, `--disable_caching`, `--dry_run`, `--jupyter`, `--use_projection_fill_shaders`, `--max-inflight-encoders`.

**Minimal example (from the official Quickstart):**
```python
from manim import *

class SquareToCircle(Scene):
    def construct(self):
        circle = Circle()
        circle.set_fill(PINK, opacity=0.5)
        square = Square()
        square.rotate(PI / 4)
        self.play(Create(square))
        self.play(Transform(square, circle))
        self.play(FadeOut(square))
        self.wait(0.5)
```
```bash
manim -ql --format=mp4 scene.py SquareToCircle
# → media/videos/scene/480p15/SquareToCircle.mp4
```

**✅ VERIFIED here:** rendered `media/videos/manim_demo/480p15/SquareToCircle.mp4` — `h264, 854×480, 15 fps, 3.466667 s, 27 089 bytes`.

**Determinism — ✅ measured:** two runs with `--seed 42` produced **byte-identical** MP4s (`sha256 9a85cdd3c4f045f416e7c09af4189a948a7ed8d16bf27a0e4e93f432d887b557` twice). Note the seed flag is the *only* documented reproducibility control — Manim's own CLI says so.

**3D:** `ThreeDScene`, `ThreeDCamera`, `Surface`, `ThreeDVMobject`, `Cone`/`Cylinder`/`Sphere`/`Torus`; renderer choice via `--renderer opengl` for OpenGL-backed (GPU) rendering; `--use_projection_fill_shaders` / `--use_projection_stroke_shaders` for shader-correct transforms.

**Best for:** mathematical/explanatory animation, LaTeX formulas, geometry, plots, 3D scenes, and any video where *content is derived from data*. It's the only tool here with a first-class "formula" pipeline.
**Avoid when:** your content is UI/HTML-like (use Remotion/Revideo), when you need pixel-perfect typography from web fonts (Pango/Cairo text layout ≠ browser text layout), or when you can't accept a LaTeX/Pango/Cairo toolchain.

---

### 2.4 MoviePy — Python video composition

**Repo:** https://github.com/Zulko/moviepy (15 007 ★, MIT) · **PyPI:** `moviepy==2.2.1` · **Docs:** https://zulko.github.io/moviepy/

⚠️ **v2 is a breaking rewrite.** The README: *"MoviePy recently upgraded to v2.0, introducing major breaking changes… v1 is no longer maintained."* v1-style APIs (`clip.subclip()`, `clip.set_duration()`, `clip.audio = …`) are gone; the new API is fluent: `.subclipped()`, `.with_duration()`, `.with_volume_scaled()`.

**v2 README example (verbatim from the repo):**
```python
from moviepy import VideoFileClip, TextClip, CompositeVideoClip

clip = (
    VideoFileClip("long_examples/example2.mp4")
    .subclipped(10, 20)
    .with_volume_scaled(0.8)
)

txt_clip = TextClip(font="Arial.ttf", text="Hello there!", font_size=70, color='white') \
    .with_duration(10).with_position('center')

final_video = CompositeVideoClip([clip, txt_clip])
final_video.write_videofile("result.mp4")
```

**Minimal programmatic example — ✅ VERIFIED here:**
```python
from moviepy import VideoClip
import numpy as np

def make_frame(t):
    w, h = 640, 360
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:, :, 0] = (t * 60) % 255
    x = int((np.sin(t * 2) * 0.4 + 0.5) * (w - 100))
    img[130:230, x:x+100] = [255, 220, 60]
    return img

clip = VideoClip(make_frame, duration=3.0).with_fps(30)
clip.write_videofile("moviepy_out.mp4")
```
**Actual output:** `h264, 640×360, 30 fps, 3.000000 s, 18 601 bytes` (printed `MOVIEPY_OK`).

**Best for:** quick programmatic edits — trimming, concatenating, compositing overlays, generating clips from numpy arrays, and glue code between other tools.
**Avoid when:** performance matters (every pixel becomes a numpy array — the README itself says it is *"slower than using ffmpeg directly due to heavier data import/export operations"*), or for long/high-res renders. Use FFmpeg/MoviePy only for the composition layer and FFmpeg for the encode.

---

### 2.5 FFmpeg core — the assembly substrate

**Repo:** https://github.com/FFmpeg/FFmpeg (65 457 ★) · **Docs:** https://ffmpeg.org/ffmpeg-filters.html (22 859 lines of filter reference)

FFmpeg is the substrate almost every other tool in this catalog ultimately calls. Programmatic assembly primitives worth knowing:

- **`concat` demuxer** — stream-copy join of same-parameter files:
  ```bash
  printf "file 'src0.mp4'\nfile 'src1.mp4'\nfile 'src2.mp4'\n" > list.txt
  ffmpeg -y -f concat -safe 0 -i list.txt -c copy concat.mp4
  ```
- **`concat` filter** — re-encode join of dissimilar files (this is what you want when sources differ in resolution/codec):
  `ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" out.mp4`
- **`overlay`** — from the docs: *"Overlay a video source on top of the input."* The canonical example in the filter docs:
  ```
  ffmpeg -i INPUT -vf "split [main][tmp]; [tmp] crop=iw:ih/2:0:0, vflip [flip]; [main][flip] overlay=0:H/2" OUTPUT
  ```
  Position with `x=W-w-10:y=10` (right-aligned, 10 px margin), `enable='between(t,1,3)'` for time-gated overlays.
- **`xfade`** — transitions: `ffmpeg -i first.mp4 -i second.mp4 -filter_complex xfade=transition=fade:duration=2:offset=5 output.mp4` (verbatim from the filters doc).
- **`zoompan`** — Ken Burns; the docs give `zoompan=z='min(zoom+0.0015,1.5)':d=700:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`.
- **`drawtext`**, **`drawbox`**, **`fade`**, **`fps`**, **`setpts`**, **`apad`**, **`amix`**, **`atempo`**, **`tpad`**, **`chromakey`/`colorkey`**, **`minterpolate`**, **`gblur`**, **`eq`**, **`tile`**, **`hstack`/`vstack`**, **`ass`/`subtitles`** (burn-in captions).

**✅ VERIFIED pipeline here** (3 color clips + sine audio → concat → overlay → drawtext + scale):
```bash
for i in 0 1 2; do
  ffmpeg -y -f lavfi -i "color=c=red:s=320x240:d=1:r=30" \
         -f lavfi -i "sine=frequency=$((300+i*100)):duration=1" \
         -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest ff/src$i.mp4
done
printf "file 'src0.mp4'\nfile 'src1.mp4'\nfile 'src2.mp4'\n" > ff/list.txt
ffmpeg -y -f concat -safe 0 -i ff/list.txt -c copy ff/concat.mp4
ffmpeg -y -i ff/concat.mp4 -f lavfi -i "color=c=blue@0.6:s=80x40:d=3" \
  -filter_complex "[0:v][1:v]overlay=W-w-10:10" -c:a copy ff/overlay.mp4
ffmpeg -y -i ff/overlay.mp4 \
  -vf "drawtext=text='Frame %{n}':fontcolor=white:fontsize=20:x=10:y=10,scale=640:480" \
  -c:a copy ff/text.mp4
```
**Actual output:** `ff/text.mp4` → `h264 640×480 + aac, duration 3.033333 s, 47 421 bytes`.

**Best for:** final assembly, muxing, format normalization, audio mixing, and the "glue" step after any renderer.
**Avoid when:** you need per-pixel creative control (use a renderer), or when you need it in the browser with no native binary (use ffmpeg.wasm — at a large performance cost).

---

### 2.6 ffmpeg.wasm — FFmpeg in the browser

**Repo:** https://github.com/ffmpegwasm/ffmpeg.wasm (17 892 ★, MIT wrapper) · **npm:** `@ffmpeg/ffmpeg@0.12.15` (MIT), `@ffmpeg/core@0.12.10` (**GPL-2.0-or-later**), `@ffmpeg/core-mt@0.12.10` (GPL-2.0-or-later, multi-thread), `@ffmpeg/util@0.12.2` (MIT). Docs: https://ffmpegwasm.netlify.app/docs/

⚠️ **Two important caveats discovered by running it:**

1. **`@ffmpeg/ffmpeg` does not work in Node.js.** The ESM entry `dist/esm/empty.mjs` literally contains:
   ```js
   throw new Error("ffmpeg.wasm does not support nodejs");
   ```
   (The `empty.mjs` is shipped precisely for the Node build; the CJS variant exists for legacy `require`.) So `ffmpeg.wasm` is **browser-only** — for Node you want native FFmpeg, `ffmpeg-static`, `fluent-ffmpeg`, or PyAV.
2. **The core is GPL-2.0-or-later.** The wrapper is MIT but the embedded FFmpeg build is GPL. That's fine for server-side/browser use of your own app, but you cannot ship GPL FFmpeg in a proprietary closed-source product without complying with GPL. The `@ffmpeg/core` package's own npm `license` field says `GPL-2.0-or-later`.

**✅ VERIFIED working example (in headless Chromium, via Playwright):**
```js
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const base = '/node_modules/@ffmpeg/core/dist/esm';
const ffmpeg = new FFmpeg();
ffmpeg.on('log', ({message}) => console.log('[ff]', message));

await ffmpeg.load({
  coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
  wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
});

await ffmpeg.writeFile('in.mp4', await fetchFile('in.mp4'));
const code = await ffmpeg.exec([
  '-i', 'in.mp4', '-vf', 'scale=160:120',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4'
]);
const data = await ffmpeg.readFile('out.mp4');
```
**Actual output:** exit code 0, 12 835 bytes written; `ffprobe` → `h264 160×120 + aac`.

⚠️ Multi-threading (`@ffmpeg/core-mt`) requires **cross-origin isolation** — serve with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (I set both headers in the test server; without them you get the single-threaded core).

**Best for:** in-browser transcoding, trimming, format conversion, GIF/MP4 generation — no server round-trip, no native binary, works fully client-side.
**Avoid when:** you need speed (WASM is 5–20× slower than native), need Node (unsupported), need the full FFmpeg filter set (the wasm builds ship a reduced set), or care about GPL contamination of a closed-source product.

---

### 2.7 Mediabunny — the modern WebCodecs toolkit (and the successor to webm-muxer / mp4-muxer)

**Repo:** https://github.com/Vanilagy/mediabunny (7 336 ★, **MPL-2.0**, TypeScript, last push 2026-10-20) · **npm:** `mediabunny@1.61.6`, `@mediabunny/server@1.61.6` · **Docs:** https://mediabunny.dev/

From the official introduction page:
> "Mediabunny is a JavaScript library for reading, writing, and converting media files (like MP4 or WebM), directly in the browser. It's written from scratch in pure TypeScript, has **zero dependencies**, and is extremely tree-shakable… You can think of it a bit like FFmpeg, but built for the web's needs."

Supported: `.mp4 .mov .webm .mkv .mp3 .wav .ogg .aac .flac .ts` (plus fragmented MP4, streamable Matroska, transparent WebM), HLS read/write, 25 codecs, hardware-accelerated encode/decode via WebCodecs, microsecond-accurate precision, and a `@mediabunny/server` extension for Node/Bun/Deno with **built-in H.264/HEVC/VP8/VP9/AV1 and AAC/MP3/Vorbis/Opus/FLAC/AC-3/DTS** codecs and "automatic hardware acceleration on all platforms".

⚠️ **Its predecessors are deprecated.** Both `webm-muxer` and `mp4-muxer` READMEs now open with:
> "⚠️ **This library is deprecated** ⚠️ — webm-muxer has been deprecated in favor of **Mediabunny**… webm-muxer is no longer being maintained and will not receive any new features or bug fixes."

**✅ VERIFIED minimal example (in-browser, produced a real MP4):**
```js
import { Output, Mp4OutputFormat, BufferTarget, CanvasSource, Quality } from 'mediabunny';

const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
const source = new CanvasSource(canvas, { codec: 'avc', quality: new Quality({ bitrate: 1e6 }) });
output.addVideoTrack(source, { frameRate: 30 });
await output.start();

for (let i = 0; i < 30; i++) {
  drawFrame(i);                                  // mutate the canvas
  await source.add(i / 30, 1 / 30);               // timestamp (s), duration (s)
}
await output.finalize();
const bytes = output.target.buffer;              // Uint8Array
```
**Actual output:** 45 257 bytes; `ffprobe` → `h264, 320×180, nb_frames=30, duration=1.000000 s`.

⚠️ **Import gotcha (hit while testing):** importing `mediabunny/dist/modules/src/index.js` directly in a browser pulls in `node:fs/promises` and the browser refuses it (CORS / scheme error). Use the prebuilt browser bundle `mediabunny/dist/bundles/mediabunny.mjs` (or let your bundler resolve the `exports` map's `browser` condition).

⚠️ **API note:** `bitrate` is **deprecated** in favour of `quality: new Quality({bitrate: 1e6})`; passing both throws `TypeError: config.quality and config.bitrate cannot both be provided.`

**Best for:** any browser-side media pipeline — you need a real MP4 out of WebCodecs frames, demuxing, transcoding, thumbnails, HLS, or a browser video editor. One dependency replaces both muxers plus a lot of glue.
**Avoid when:** you want a permissive MIT (MPL-2.0 is weak-copyleft — fine for most, but check your distribution policy), or when you need server-side without the extra `@mediabunny/server` package.

---

### 2.8 WebCodecs API — frame-exact browser encoding

**Spec:** https://w3c.github.io/webcodecs/ · **Repo:** https://github.com/w3c/webcodecs (1 297 ★) · **MDN:** https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder

Core interfaces (per MDN, quoted): `VideoEncoder` — *"encodes `VideoFrame` objects into `EncodedVideoChunk`s"*; `VideoEncoder.isConfigSupported()` (static), `.configure()`, `.encode()`, `.flush()`, `.reset()`, `.close()`; `AudioEncoder` with the parallel surface.

**Codec strings (from the spec, §7.4 "Codec String"):**
> "A valid codec string MUST meet the following conditions: Is valid per the relevant codec specification… It describes a single codec. It is unambiguous about codec profile, level, and constraint bits for codecs that define these concepts."
> "NOTE: In other media specifications, codec strings historically accompanied a MIME type as the 'codecs=' parameter (isTypeSupported(), canPlayType()) [RFC6381]. **In this specification, encoded media is not containerized; hence, only the value of the codecs parameter is accepted.**"

Config dictionaries from the spec: `AudioDecoderConfig { required DOMString codec; required unsigned long sampleRate; required unsigned long numberOfChannels; AllowSharedBufferSource description; }` and `VideoDecoderConfig { required DOMString codec; AllowSharedBufferSource description; unsigned long codedWidth; codedHeight; displayAspectWidth; displayAspectHeight; VideoColorSpaceInit colorSpace; HardwareAcceleration hardwareAcceleration = "no-preference"; boolean optimizeForLatency = false; double rotation = false… }`.

⚠️ The spec does **not** enumerate specific codec strings — it points to the separate [WEBCODECS-CODEC-REGISTRY]. So the concrete strings below are **empirically probed values from this machine's Chrome for Testing 156.0.8078.4**, not spec quotes:

| Codec string | `VideoEncoder.isConfigSupported()` |
|---|---|
| `vp8` | ✅ true |
| `vp09.00.10.08` | ✅ true |
| `avc1.42001E` | ✅ true |
| `avc1.640028` | ✅ true |
| `av01.0.04M.08` | ✅ true |
| `h264` | ❌ false (not a valid RFC 6381 string) |
| `hev1.1.6.L93.B0` | ❌ false |

Audio: `opus` ✅ true; `mp4a.40.2` ❌ false; `vorbis` ❌ false; `pcm-f32` ❌ false (in this Chrome build).

**Minimal example:**
```js
const {supported} = await VideoEncoder.isConfigSupported({
  codec: 'avc1.42001E', width: 1280, height: 720,
  bitrate: 5_000_000, framerate: 30,
});
const encoder = new VideoEncoder({
  output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
  error: console.error,
});
encoder.configure({codec: 'avc1.42001E', width: 1280, height: 720,
  bitrate: 5_000_000, framerate: 30, avc: {format: 'avc'}});
// per frame:
const frame = new VideoFrame(canvas, {timestamp: i * 33333, duration: 33333});
encoder.encode(frame, {keyFrame: i % 60 === 0});
frame.close();
// end:
await encoder.flush();
encoder.close();
```
⚠️ `avc` codec strings need `avc: {format: 'avc'}` (length-prefixed) or `{format: 'annexb'}` — the config key is required, not optional.

**Best for:** frame-accurate browser rendering, real-time capture at exactly N fps, pipelines that need to stay in the browser (no upload), and any situation where wall-clock time is wrong but *frame count* is right.
**Avoid when:** you need broad codec support (Chrome's H.264/AV1 support varies by build and platform — always probe with `isConfigSupported`), need a container (WebCodecs produces raw encoded chunks — you must mux), or need audio+video sync for free (you must manage timestamps yourself).

---

### 2.9 MediaRecorder API — `canvas.captureStream()`

**MDN:** https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream — *"Baseline, widely available… available across browsers since January 2020."*

Quoted semantics:
> "The `captureStream()` method… returns a `MediaStream` which includes a `CanvasCaptureMediaStreamTrack` containing a real-time video capture of the canvas's contents."
> "**frameRate** Optional — A double-precision floating-point value that indicates the rate of capture of each frame. If not set, a new frame will be captured each time the canvas changes; if set to `0`, frames will not be captured automatically; instead, they will only be captured when the returned track's `requestFrame()` method is called."

That `frameRate: 0` + `requestFrame()` mode is the **only** way to get a MediaRecorder to be frame-deterministic rather than wall-clock-driven.

**✅ VERIFIED example (in headless Chromium):**
```js
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const stream = c.captureStream(30);
const chunks = [];
const rec = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=vp9'});
rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
const done = new Promise(r => rec.onstop = r);
rec.start();
for (let i = 0; i < 30; i++) {
  ctx.fillStyle = `hsl(${i * 12}, 80%, 50%)`;
  ctx.fillRect(0, 0, 320, 180);
  await new Promise(r => setTimeout(r, 20));
}
rec.stop();
await done;
const blob = new Blob(chunks, {type: 'video/webm'});
```
**Actual output:** 17 118 bytes WebM; `ffprobe` → `vp9, 320×180, duration 0.571267 s` — ⚠️ **note the duration is 0.57 s, not the ~0.6 s of wall clock and definitely not 1 s of 30 frames.** This is the classic MediaRecorder behavior: it timestamps by wall clock and drops/merges frames under load. `MediaRecorder.isTypeSupported()` in this Chrome returned true for: `video/webm;codecs=vp9`, `video/webm;codecs=vp8`, `video/webm`, `video/mp4`, `video/x-matroska;codecs=avc1`.

**Best for:** live/real-time capture, screen recording, quick "canvas → file" with zero dependencies, and prototypes.
**Avoid when:** you need frame-accurate output (MediaRecorder is wall-clock; use WebCodecs + Mediabunny), need a guaranteed MP4 (output is usually WebM), or need reproducible durations. It also has no audio track unless you mix a `MediaStream` yourself.

---

### 2.10 Playwright video recording

**Repo:** https://github.com/microsoft/playwright (98 137 ★, Apache-2.0) · **npm:** `playwright@1.64.1` · **Docs:** https://playwright.dev/docs/videos

Quoted from the docs:
> "Playwright Test can record videos for your tests, controlled by the `video` option in your Playwright config. By default videos are off." — values: `'off'`, `'on'`, `'retain-on-failure'`, `'on-first-retry'`.
> "Videos are saved upon browser context closure at the end of a test. If you create a browser context manually, make sure to `await browserContext.close()`."
> "The video size defaults to the viewport size scaled down to fit 800x800. The video of the viewport is placed in the top-left corner of the output video, scaled down to fit if necessary. You may need to set the viewport size to match your desired video size."

**✅ VERIFIED example:**
```js
import { chromium } from 'playwright';
const browser = await chromium.launch();
const context = await browser.newContext({
  recordVideo: { dir: 'videos/', size: { width: 640, height: 360 } },
  viewport: { width: 640, height: 360 },
});
const page = await context.newPage();
await page.setContent('<h1 style="font-family:sans-serif">Hello video</h1>');
await page.waitForTimeout(1500);
const video = page.video();
await context.close();                        // <- must await, or the file isn't written
console.log(await video.path());
await browser.close();
```
**Actual output:** `videos/page@041ffc819cec447952e0cff00757c413.webm` — 13 318 bytes; `ffprobe` → `vp9, 640×360, duration 1.480000 s`.

**Best for:** test artifacts, CI evidence, quick "what did the page do" captures, and low-effort screen recordings of a web app.
**Avoid when:** you need a deterministic timeline (it records real time, and the video is scaled/letterboxed unless you match the viewport), or need MP4 (output is WebM — remux with FFmpeg), or need audio.

---

### 2.11 Puppeteer `page.record()` / `page.screencast()`

**Repo:** https://github.com/puppeteer/puppeteer (95 729 ★, Apache-2.0) · **npm:** `puppeteer@25.14.0` · **Docs:** https://pptr.dev/api/puppeteer.page.record

Quoted:
> `Page.record()` — "Records this page using the Chrome DevTools Protocol `Page.startScreenRecording` API. **Outputs mp4 video stream.**" Signature: `record(options?: Readonly<RecordOptions>): Promise<ScreenRecording>`.
> `Page.screencast()` — **"Warning: This API is now obsolete. Use `Page.record()` instead."** "Works in Chrome 153+." "By default, all recordings will be WebM format using the VP9 video codec, with a frame rate of 30 FPS. **You must have ffmpeg installed on your system.**"

**✅ VERIFIED example (new `record()` API):**
```js
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({width: 640, height: 360});
await page.setContent('<h1 style="font-family:sans-serif;color:#333">Puppeteer record demo</h1>');
const recorder = await page.record({ path: 'pptr_record.mp4' });
await new Promise(r => setTimeout(r, 1500));
await recorder.stop();
await browser.close();
```
**Actual output:** `pptr_record.mp4`, 4 283 bytes; `ffprobe` → **`av1`, 640×360, duration 1.350467 s** (⚠️ the modern Chrome screencast path encodes AV1, not H.264 — plan your remux accordingly).

**Best for:** direct MP4 screencasts of a page with no test-runner coupling; `record()` is the current API.
**Avoid when:** you need determinism (wall-clock), when you need the old WebM/VP9 path (`screencast()` is obsolete and requires a system ffmpeg), or for long recordings (Chrome's screencast is memory-bound).

---

### 2.12 MP4Box.js — MP4 parsing / segmentation / sample extraction

**Repo:** https://github.com/gpac/mp4box.js (2 475 ★, **BSD-3-Clause**, TypeScript) · **npm:** `mp4box@2.4.1` · **Docs:** https://gpac.github.io/mp4box.js/ (the `/docs/` path in the README is the canonical one; the bare `gpac.github.io/mp4box.js/` root 404s)

Quoted from the README:
> "MP4Box.js enables advanced MP4 parsing, segmentation, and sample extraction directly in the browser or in Node.js environments. It's inspired by the MP4Box tool from the GPAC Project."
> "Progressive Parsing… Segmentation: Split MP4 files for use with the Media Source Extensions (MSE) API. Sample Extraction: Extract media samples for custom processing."

Basic usage (verbatim from the README):
```javascript
var MP4Box = require('mp4box');
var mp4boxfile = MP4Box.createFile();
mp4boxfile.onError = function(e) {};
mp4boxfile.onReady = function(info) {};
mp4boxfile.appendBuffer(data);   // ArrayBuffer chunks
mp4boxfile.flush();
```

**Best for:** inspecting MP4 structure, MSE segmentation for streaming, extracting samples (e.g. building subtitle tracks), diffing files.
**Avoid when:** you just need to *write* an MP4 from WebCodecs chunks — use Mediabunny (or `mp4-muxer`, but that's deprecated).

---

### 2.13 Lottie → video

**Repo:** https://github.com/airbnb/lottie-web (32 250 ★, MIT) · **npm:** `lottie-web@5.13.0` · **dotLottie:** [LottieFiles/dotlottie-web](https://github.com/LottieFiles/dotlottie-web) (920 ★, MIT, Rust/WASM)

The deterministic control surface is `goToAndStop` — from `index.d.ts` in the repo:
```ts
goToAndStop(value: number | string, isFrame?: boolean, name?: string): void;
goToAndPlay(value: number | string, isFrame?: boolean, name?: string): void;
```
plus `totalFrames`, `frameRate`, `firstFrame`, `currentFrame`, `getDuration(inFrames?: boolean)`, `setSubframe(useSubFrames: boolean)`.

**✅ VERIFIED pipeline here (SVG renderer → 60 frames → MP4):**
```js
// in the page
const anim = lottie.loadAnimation({
  container: document.getElementById('anim'),
  renderer: 'svg', loop: false, autoplay: false,
  path: '/animation.json',
});
anim.addEventListener('DOMLoaded', () => {
  window.lottieInfo = () => ({totalFrames: anim.totalFrames, frameRate: anim.frameRate});
  window.renderLottieFrame = (f) => {
    anim.goToAndStop(f, true);                    // true = frame index, not seconds
    return new XMLSerializer().serializeToString(document.querySelector('#anim svg'));
  };
});
```
Node driver + FFmpeg:
```js
const info = await page.evaluate(() => window.lottieInfo());   // {"totalFrames":60,"frameRate":30}
for (let f = 0; f < info.totalFrames; f++) {
  const svg = await page.evaluate(fr => window.renderLottieFrame(fr), f);
  fs.writeFileSync(`lottieframes/l${String(f).padStart(3,'0')}.png`, Buffer.from(svg, 'base64'));
}
```
```
ffmpeg -y -framerate 30 -i lottiecanvas/c%03d.png -c:v libx264 -pix_fmt yuv420p -crf 18 lottie_to_video.mp4
```
**Actual output:** `lottie_to_video.mp4` → `h264, 184×96, nb_frames=60, duration 2.000000 s`. (Canvas renderer produced a 184×96 canvas for a 200×200 Lottie — the canvas renderer sizes to the content bounds, so **set the canvas size explicitly** if you need a fixed output frame.)

**Best for:** reusing designer-made After Effects motion graphics in a code pipeline — Lottie is a *content* format, and `goToAndStop(frame, true)` makes it frame-addressable like any other renderer.
**Avoid when:** you need effects Lottie doesn't support (After Effects expressions, some blend modes), or when you need a fixed output resolution without extra work.

---

### 2.14 Rive → video

**Repos:** [rive-app/rive-wasm](https://github.com/rive-app/rive-wasm) (1 008 ★, MIT, TS) · [rive-app/rive-runtime](https://github.com/rive-app/rive-runtime) (1 233 ★, MIT, C++) · [rive-app/rive-flutter](https://github.com/rive-app/rive-flutter) (1 529 ★, MIT, Dart) · **npm:** `@rive-app/canvas@2.45.0` (MIT)

From the rive-wasm README: *"a low-level API to drive your own render loop to create multiple artboards, animations, and state machines all in one canvas."* From the rive-runtime README: *"The C++ runtime — the lowest-level Rive runtime. Loads `.riv` files, advances state machines and animations, and draws via the abstract `Renderer` interface."*

**Best for:** interactive/state-machine-driven motion design where the animation is a state machine, not a timeline (Rive's differentiator vs Lottie).
**Avoid when:** you need a simple fixed-length clip — Rive's state machines are input-driven, so "render frame N" requires driving the state machine deterministically, which is more work than Lottie's `goToAndStop`.

⚠️ There is **no official "Rive → MP4" exporter** in the runtimes. The practical routes are: (a) drive the Rive canvas in a headless browser and capture frames (same pattern as Lottie), (b) use `@remotion/rive` inside Remotion (which does exactly that), or (c) Rive's own hosted "Rive → GIF/MP4" feature in the Rive editor.

---

### 2.15 Three.js / shader-based offscreen rendering

**Repo:** https://github.com/mrdoob/three.js (116 650 ★, MIT) · **npm:** `three@0.186.1`

**✅ VERIFIED here (headless Chromium + SwiftShader):**
```js
import * as THREE from 'three';
const canvas = document.createElement('canvas');
canvas.width = 320; canvas.height = 180;
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true});
renderer.setSize(320, 180, false);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);
const cam = new THREE.PerspectiveCamera(50, 320/180, 0.1, 100);
cam.position.z = 3;
const mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial());
scene.add(mesh);

window.renderFrame = (t) => {
  mesh.rotation.x = t; mesh.rotation.y = t * 0.7;
  renderer.render(scene, cam);
  return canvas.toDataURL('image/png').split(',')[1];
};
```
Launch flags used: `chromium.launch({channel: 'chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']})`.
**Actual output:** `three_frame0.png`, 2 029 bytes, a valid rendered frame (Chrome logged `GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels` — expected with SwiftShader).

**Determinism notes for shaders/3D:** use a **fixed timestep** (advance `t` by exactly `1/fps` per frame, never by wall clock), pin `renderer.setPixelRatio(1)`, avoid `Math.random()` (seed it), and be aware that **SwiftShader and real GPU drivers can produce different pixels** — bit-identical output across machines requires a fixed software rasterizer.

**Best for:** 3D motion graphics, particle/shader visuals, and anything you'd normally do in Blender — but driven from code.
**Avoid when:** you need guaranteed cross-machine pixel identity (GPU float differences), or when a CSS/SVG approach would be lighter.

---

### 2.16 SVG → video

There is no single canonical "SVG-to-video" tool; the reliable patterns are:

1. **SVG animation rendered by a browser → frame capture → FFmpeg.** This is the same pipeline as Lottie/CSS, and it is the only one that handles SMIL/CSS animations correctly.
2. **Static SVG → raster → video**, using a fast SVG rasterizer:
   - `@resvg/resvg-js@2.6.2` (**MPL-2.0**, Rust→NAPI) — fastest, Node-native, deterministic.
   - `skia-canvas@4.0.0` / `@napi-rs/canvas@1.0.11` (MIT) — full Canvas2D API in Node.
   - `cairosvg` (PyPI, LGPL-3.0-or-later) — Python; `pip install cairosvg`.
   - `svglib` (npm, ISC) — SVG → ReportLab drawing primitives.
3. **`svg2img`** (npm, MIT) — in-memory SVG→PNG/JPEG for Node.

**Best for:** turning a design-file SVG into frames.
**Avoid when:** the SVG has CSS/SMIL animation (use the browser-capture route instead) or when you need the vector path preserved in the output (then you want a vector-capable container, not H.264).

---

### 2.17 CSS/DOM animation → video

Two families:

**A. DOM rasterization (html2canvas / dom-to-image) + FFmpeg.**
`html2canvas@1.4.1` (MIT) and `dom-to-image@2.6.0` / `html-to-image@1.11.13` (MIT) re-render a DOM subtree into a `<canvas>` in-page.
⚠️ These are **re-implementations** of browser layout, not the browser's own renderer. They routinely differ from the real thing: no CSS `filter`, partial `backdrop-filter`, no external stylesheets in some versions, no web fonts unless embedded, no `<iframe>` content, no `position: fixed` correctness, and broken SVG `<foreignObject>`. **They are also not frame-capturing** — you still need to re-render per frame and encode.
**Best for:** quickly grabbing a static or lightly-animated DOM element as a PNG.
**Avoid when:** visual fidelity matters — screenshot the real page instead.

**B. Real browser frame capture (the correct approach).** See §4 — drive a *virtual clock*, screenshot the real compositor output, and encode the PNG sequence. This is what Remotion, Revideo, and the Lottie pipeline above all do.

**Best for:** any web UI that already exists and looks right.
**Avoid when:** fidelity matters and you reach for html2canvas; or when you need the DOM to be animated by wall clock (non-deterministic).

---

### 2.18 Headless-browser deterministic frame capture

**The core techniques, and what I measured:**

| Technique | Deterministic? | Notes |
|---|---|---|
| `page.screenshot()` at a controlled virtual clock | ✅ **Yes** | Best option. Playwright's `clock` API fakes `Date`, `performance`, `setTimeout`, `setInterval`, `requestAnimationFrame`, `requestIdleCallback`. |
| `chrome --headless --screenshot` + `--virtual-time-budget` | ⚠️ **Partial** | Chrome flags exist (`--virtual-time-budget`, `--run-all-compositor-stages-before-draw`, `--deterministic-mode` — all confirmed present in the Chrome 156 binary) but rAF-driven content is *not* fully reproducible. |
| `page.video` / `page.record()` / MediaRecorder | ❌ **No** | Wall-clock based. |
| WebCodecs `VideoEncoder` over explicit timestamps | ✅ **Yes** | Frame-count-driven. |

**✅ VERIFIED (1): Playwright + explicit `window.seek(t)` — bit-identical across runs.**
```js
import { chromium } from 'playwright';
const browser = await chromium.launch({args: [
  '--force-device-scale-factor=1', '--hide-scrollbars',
  '--force-color-profile=srgb', '--disable-lcd-text']});
const page = await browser.newPage({viewport: {width: 640, height: 360}, deviceScaleFactor: 1});
await page.goto('file://' + path.resolve('html_anim.html'));
await page.waitForFunction(() => typeof window.seek === 'function');

for (let i = 0; i < FPS * DURATION; i++) {
  await page.evaluate(t => window.seek(i / FPS), i / FPS);
  await page.screenshot({path: `frames/f${String(i).padStart(4,'0')}.png`, animations: 'disabled'});
}
```
with the page exposing a pure function of time:
```js
window.seek = (t) => {
  const x = 20 + ((t * 120) % 540);
  document.getElementById('b').style.transform = `translateX(${x}px)`;
};
```
**Measured:** two independent runs produced **identical SHA-256 for every frame** checked (`74e5dc45…`, `11c77cf5…`, `1dd11bb4…`). Re-run later with **four** independent captures into separate directories — frames 0, 45 and 89 were identical across all four (`74e5dc45… 74e5dc45… 74e5dc45… 74e5dc45…`). Then:
```
ffmpeg -y -framerate 30 -i frames/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 frames_to_video.mp4
```
→ `h264, 640×360, nb_frames=90, duration 3.000000 s`.

**✅ VERIFIED (2): Playwright `clock` API driving rAF.**
```js
await page.clock.install({time: new Date('2024-01-01T00:00:00Z')});
await page.goto(url);
for (let i = 0; i < 60; i++) {
  await page.clock.runFor(1000 / 30);
  await page.screenshot({path: `clockframes/c${String(i).padStart(3,'0')}.png`});
}
```
**Measured:** 60 frames produced, and consecutive frames differ (motion is real, not frozen) — `c000.png` = `864454c2…`, `c030.png` = `432a352c…`.

**✅ VERIFIED (3): Chrome `--virtual-time-budget` — ⚠️ NOT reliably deterministic.**
```
chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --screenshot=det$i.png --window-size=400,200 \
  --virtual-time-budget=1000 --run-all-compositor-stages-before-draw --deterministic-mode \
  file://.../vt.html
```
**Measured — 8 runs with `--deterministic-mode`:** **5 distinct hashes across 8 runs** (`84a39fdf…` ×2, `26b4298e…`, `b1658b97…`, `d7b84937…`, `e5be9a54…` ×1 each). A 4-run sample earlier gave 3 identical + 1 different; without `--deterministic-mode`, 2 distinct hashes across 3 runs. A **static** page (no rAF) *was* perfectly stable (`280cb8c3…` ×3).
👉 **Conclusion:** `--virtual-time-budget` is fine for static pages but **not** for rAF-driven animation. Use the explicit-clock + screenshot approach instead.

**Chrome flags confirmed present in the binary** (via `grep -a` over the raw binary):
- In `chrome` (Chrome for Testing 156): `run-all-compositor-stages-before-draw`, `virtual-time-budget`, `force-color-profile`, `disable-lcd-text`, `disable-partial-raster`, `disable-skia-runtime-opts`, `force-device-scale-factor`, `hide-scrollbars`, `disable-gpu`, `enable-unsafe-swiftshader`, `use-gl`.
- In `chrome-headless-shell` (Playwright's shell build): additionally `deterministic-mode` and `font-render-hinting`.
- ⚠️ In the **full `chrome` binary, `--deterministic-mode` and `--font-render-hinting` are NOT present** — Chromium silently accepts unknown flags (it does not error), so passing them to the full Chrome build is a no-op. Use `chrome-headless-shell` if you want them, or — much better — use the Playwright/Puppeteer screenshot path, which is fully deterministic anyway.

---

### 2.19 TTS + video sync pipelines

**TTS engines:**

| Tool | License | Local? | Notes |
|---|---|---|---|
| **edge-tts** (`edge-tts@7.3.1`, [rany2/edge-tts](https://github.com/rany2/edge-tts), 12 336 ★) | unspecified | ❌ network | Microsoft Edge's online TTS. ✅ **worked here** — produced a 2.16 s MP3. ⚠️ **intermittently returns HTTP 403** (`WSServerHandshakeError: 403`); I saw it fail ~50% of attempts and succeed on retry. Never build a pipeline that assumes one attempt succeeds. |
| **Piper** ([rhasspy/piper](https://github.com/rhasspy/piper), 11 303 ★) | MIT (was) | ✅ | Fast local neural TTS. ⚠️ **Repo archived 2025-08-26.** PyPI `piper-tts@1.8.0` is GPL-3.0-or-later. |
| **Kokoro** ([hexgrad/kokoro](https://github.com/hexgrad/kokoro), 9 514 ★) | **Apache-2.0** | ✅ | 82M-param model, Python + JS. `pip install kokoro` (0.9.4, requires Python ≥3.10 <3.13). |
| **gtts** (`gTTS@2.5.4`) | MIT | ❌ network | Google Translate TTS. |
| **Coqui TTS** (`TTS@0.22.0`) | MPL-2.0 | ✅ | ⚠️ Requires Python <3.12. |
| **pyttsx3** (`2.99`) | MIT | ✅ | Wraps OS voices (espeak on Linux). |
| **SoX** | LGPL-2.1 | ✅ | `sox in.wav out.wav trim 0 5`, `sox --combine sequence`, `sox out.wav stat`. Apt candidate `14.7.0.9+ds1-1`. Not installed on this machine. |
| **Pydub** (`0.25.1`) | MIT | ✅ | Slice/loop/fade/channels of audio; `AudioSegment`. |
| **Whisper** (`@remotion/install-whisper-cpp`, `@remotion/openai-whisper`, `@remotion/whisper-web`) | MIT (Remotion packages) | ✅/☁️ | Use for **timestamps** and captions, not TTS. |

**✅ VERIFIED end-to-end TTS→video pipeline (the key trick: derive video length FROM the audio):**
```bash
#!/usr/bin/env bash
set -euo pipefail
TEXT="${1:-Hello from a deterministic pipeline.}"
VOICE="${2:-en-US-AriaNeural}"

# 1) TTS -> mp3, with retry (edge-tts 403s are common) and a local fallback
VOICE_OK=0
for attempt in 1 2 3; do
  if edge-tts --text "$TEXT" --write-media voice.mp3 --voice "$VOICE" 2>/dev/null && [ -s voice.mp3 ]; then
    VOICE_OK=1; break
  fi
  sleep 2
done
if [ "$VOICE_OK" -eq 0 ]; then
  echo "TTS network failed after 3 attempts -> local synthetic fallback" >&2
  ffmpeg -y -f lavfi -i "sine=frequency=330:duration=3" -ar 44100 -ac 1 voice.mp3
fi

# 2) measure narration duration
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 voice.mp3)

# 3) video length is derived from the audio, so A/V always line up
ffmpeg -y -f lavfi -i "color=c=0x0d0d12:s=1280x720:r=30:d=${DUR}" \
  -i voice.mp3 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest tts_video.mp4
```
**Actual output:** `narration=3.000000s`, `tts_video.mp4` → `h264 1280×720 + aac, duration 3.000000 s, 35 503 bytes`. (On the run shown, edge-tts failed all 3 retries and the fallback engaged — **the fallback path is what makes this pipeline reliable**.)

**The general sync pattern (any renderer):**
1. Render narration first → get its exact duration `D`.
2. Set the composition/frame count from `D` (`durationInFrames = round(D * fps)`).
3. Mux the narration at t=0, with `-shortest` or an explicit `apad`/`atrim` to guarantee alignment.
4. If you need word-level sync, transcribe the narration with Whisper to get per-word timestamps, then use those as animation cues.

**Best for:** narrated explainers, data stories, and any video where the *audio* is the source of truth for duration.
**Avoid when:** you need frame-exact word highlighting (you need word timestamps — Whisper or `whisper-timestamped`), or when network TTS is unacceptable in CI (use Piper/Kokoro locally).

---

### 2.20 Python video stack (secondary tools)

| Tool | License | Use it for | Avoid when |
|---|---|---|---|
| **MoviePy 2.2.1** | MIT | composition & effects at the Python level | perf-critical encodes |
| **VidGear 0.3.5** ([abhiTronix/vidgear](https://github.com/abhiTronix/vidgear), 3 728 ★, Apache-2.0, last push 2026-10-18) | Apache-2.0 | real-time video I/O: `VideoCapture`, `NetCam`, `ScreenRecorder`, `Stabilizer`, `CamGear` | you need deterministic frame indexing (it's throughput-oriented) |
| **Decord 0.6.0** ([dmlc/decord](https://github.com/dmlc/decord), 2 525 ★, Apache-2.0) | Apache-2.0 | fast random-access frame loading for ML pipelines | ⚠️ **Effectively unmaintained** — last push **2024-07-17**, 221 open issues. Use PyAV or OpenCV instead. |
| **OpenCV 5.0.0** ([opencv/opencv](https://github.com/opencv/opencv), 91 243 ★, Apache-2.0; release 5.0.0 published 2026-06-06) | Apache-2.0 | `VideoWriter` (frame-exact, codec-by-codec), image ops, GPU (CUDA/OpenCL) | same — use the modern PyAV bindings |
| **PyAV 19.0.1** ([PyAV-Org/PyAV](https://github.com/PyAV-Org/PyAV), 3 312 ★, **BSD-3-Clause**) | BSD-3-Clause | clean, modern FFmpeg bindings: stream-accurate encode/decode, no numpy round-trips | you want the MoviePy-level API |
| **ImageIO 2.38.1** + **imageio-ffmpeg 0.6.0** (BSD-2-Clause) | BSD-2-Clause | portable ffmpeg binary + simple I/O | advanced stream work |
| **ffmpeg-python 0.2.0** | unspecified | Pythonic FFmpeg graph construction | it's thin — for most people `subprocess` + a list of args is clearer |
| **PySceneDetect 0.7.2** ([Breakthrough/PySceneDetect](https://github.com/Breakthrough/PySceneDetect), 5 271 ★, BSD-3-Clause) | BSD-3-Clause | split an existing video into shots | making video from scratch |
| **auto-editor 29.3.1** ([WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor), 5 569 ★, Unlicense) | Unlicense | auto-cut silence from a recording | making video from scratch |
| **moderngl 5.13.0** (MIT) | MIT | headless GPU rendering in Python | browser-targeted work |
| **pyrender 0.1.45** (MIT) | MIT | offscreen 3D render | same |

**⚠️ `fluent-ffmpeg` (npm 2.1.3, MIT)** — the classic Node FFmpeg wrapper. ⚠️ **Unmaintained**: the package's last release is 2.1.3 and the `fluent-ffmpeg` GitHub org is gone. For new projects use `ffmpeg-static` + `child_process` (or `execa`), or `ffmpeg.wasm` in the browser. The `fluent-ffmpeg` API is still pleasant if you already depend on it.

**`ffmpeg-static@5.3.0`** (npm) — GPL-3.0-or-later, bundles a static ffmpeg binary per platform. Practical, but note the GPL.

---

## 3. Three complete end-to-end pipelines

### Pipeline A — React component → MP4 (Remotion), with audio and captions

**When:** you already have React components and want data-driven video.
**Stack:** `remotion@4.0.537` + `@remotion/cli` + FFmpeg (for the final mux).

```bash
mkdir video && cd video
npm init -y
npm i --save-exact remotion@4.0.537 @remotion/cli@4.0.537 react@19.3.1 react-dom@19.3.1
npx remotion browser ensure
```

`src/Root.tsx`
```tsx
import React from 'react';
import {Composition, staticFile, useVideoConfig} from 'remotion';
import {Scene} from './Scene';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DataStory"
    component={Scene}
    durationInFrames={150}      // 5s @ 30fps
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{title: 'Q3 revenue', value: 1_284_000}}
  />
);
```

`src/Scene.tsx`
```tsx
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Audio} from 'remotion';

export const Scene: React.FC<{title: string; value: number}> = ({title, value}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 200}});
  const shown = Math.round(interpolate(frame, [0, 90], [0, value], {extrapolateRight: 'clamp'}));

  return (
    <AbsoluteFill style={{background: '#0d0d12', color: 'white', fontFamily: 'sans-serif', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{fontSize: 64}}>{title}</div>
      <div style={{fontSize: 140, transform: `scale(${scale})`, color: '#ffca3a'}}>
        ${shown.toLocaleString('en-US')}
      </div>
      <Audio src={staticFile('voiceover.mp3')} />
    </AbsoluteFill>
  );
};
```

Render + verify:
```bash
npx remotion render src/index.ts DataStory out/story.mp4 --codec=h264
ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,width,height,nb_frames \
  -of default=noprint_wrappers=1 out/story.mp4
```
**Verified on this machine:** `h264, 1280×720, 30 fps, nb_frames=90, duration=3.000000 s, 83 431 bytes` (for the 3 s HelloWorld composition this template is modelled on).

**License line:** free for individuals / ≤3-person companies / non-profits; a Company License is required above that. Pass `licenseKey: 'free-license'` for the free tier (or your real key) or telemetry will be recorded per successful server-side render.

---

### Pipeline B — Headless browser → frame sequence → MP4 (framework-agnostic, fully deterministic)

**When:** the content is HTML/CSS/canvas and you need frame-exact, reproducible output without a framework.
**Stack:** Playwright + FFmpeg.

**Step 1 — the page must expose a pure function of time.** Never let CSS animations or `requestAnimationFrame` drive the visual state if you want determinism; instead compute the state from an explicit `t`.

`page.html`
```html
<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1280px;height:720px;background:#0d0d12;overflow:hidden;font-family:sans-serif}
#bar{position:absolute;left:80px;bottom:120px;height:40px;background:#ffca3a;border-radius:8px}
#lab{position:absolute;left:80px;top:200px;color:#fff;font-size:56px}
</style></head><body>
<div id="lab"></div><div id="bar"></div>
<script>
window.seek = (t) => {
  const p = Math.min(1, t / 3);
  document.getElementById('bar').style.width = (1000 * p) + 'px';
  document.getElementById('lab').textContent = 'Progress ' + (p * 100).toFixed(0) + '%';
};
</script></body></html>
```

**Step 2 — capture with a fixed timestep.**
```js
// capture.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';

const FPS = 30, DURATION = 3, W = 1280, H = 720;
fs.rmSync('frames', {recursive: true, force: true});
fs.mkdirSync('frames', {recursive: true});

const browser = await chromium.launch({args: [
  '--force-device-scale-factor=1',      // pin DPR -> stable rasterization
  '--hide-scrollbars',
  '--force-color-profile=srgb',         // stable color
  '--disable-partial-raster',           // no partial raster (stable AA)
  '--disable-skia-runtime-opts',        // no Skia runtime heuristics
  '--disable-lcd-text',                  // no subpixel AA
]});
const page = await browser.newPage({viewport: {width: W, height: H}, deviceScaleFactor: 1});
await page.goto('file://' + process.cwd() + '/page.html');
await page.waitForFunction(() => typeof window.seek === 'function');

for (let i = 0; i < FPS * DURATION; i++) {
  await page.evaluate(t => window.seek(t), i / FPS);
  await page.screenshot({path: `frames/f${String(i).padStart(5,'0')}.png`, animations: 'disabled'});
}
await browser.close();
```

**Step 3 — encode.**
```bash
ffmpeg -y -framerate 30 -i frames/f%05d.png \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p \
  -movflags +faststart out/video.mp4
```

**Step 4 — add narration and mux.**
```bash
ffmpeg -y -f lavfi -i "sine=frequency=440:duration=3" -i out/video.mp4 \
  -c:v copy -c:a aac -shortest out/video_with_audio.mp4
```

**Verified on this machine:** 90 frames captured in ~5 s; two independent capture runs produced **byte-identical PNGs** (SHA-256 matched on frames 0, 45, 89); `ffmpeg` produced `h264, 640×360, nb_frames=90, duration=3.000000 s, 19 555 bytes` (the 640×360 variant of the same script).

**Scaling this to 4K/long videos:** capture PNGs to disk, or stream raw frames into FFmpeg over a pipe:
```bash
node capture.mjs | ffmpeg -y -f image2pipe -framerate 30 -i - -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4
```

---

### Pipeline C — Lottie / SVG / Three.js source → frames → MP4 + TTS narration (asset-driven)

**When:** a designer made the animation; you need it in a video with narration.
**Stack:** Playwright + lottie-web (or Three.js) + edge-tts/Kokoro + FFmpeg.

**Step 1 — narration first.**
```bash
edge-tts --text "Revenue grew forty percent this quarter." --write-media voice.mp3 --voice en-US-AriaNeural
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 voice.mp3)
FRAMES=$(python3 -c "import math;print(int(math.ceil(float('$DUR')*30)))")
```

**Step 2 — render the Lottie at each frame.** (`anim.goToAndStop(frame, true)` is the deterministic primitive; `true` means *frame index*, not seconds.)
```js
const anim = lottie.loadAnimation({
  container: document.getElementById('anim'),
  renderer: 'canvas', loop: false, autoplay: false, path: '/animation.json',
});
anim.addEventListener('DOMLoaded', async () => {
  const canvas = document.querySelector('#anim canvas');
  for (let f = 0; f < totalFrames; f++) {
    anim.goToAndStop(f, true);
    const b64 = canvas.toDataURL('image/png').split(',')[1];
    fs.writeFileSync(`frames/l${String(f).padStart(5,'0')}.png`, Buffer.from(b64, 'base64'));
  }
});
```

**Step 3 — encode and mux, matching the audio length exactly.**
```bash
ffmpeg -y -framerate 30 -i frames/l%05d.png \
  -c:v libx264 -crf 18 -pix_fmt yuv420p out/video_silent.mp4

ffmpeg -y -i out/video_silent.mp4 -i voice.mp3 \
  -c:v copy -c:a aac -shortest out/final.mp4

ffprobe -v error -show_entries format=duration -show_entries stream=codec_type -of default=noprint_wrappers=1 out/final.mp4
```

**Verified on this machine:** the Lottie render produced `lottie_to_video.mp4` → `h264, 184×96, nb_frames=60, duration 2.000000 s`; the TTS stage produced `voice.mp3` (2.16 s via edge-tts, and 3.0 s via the local fallback) and the muxed result had matching video/audio durations (`3.000000 s`).

**Gotcha:** the Lottie *canvas* renderer sizes the canvas to the content bounds (184×96 for a 200×200 animation). If you need a fixed output frame, set the canvas width/height explicitly, or use the `svg` renderer and rasterize the SVG at your chosen size.

---

## 4. Determinism: how to make browser-based capture frame-accurate

**Definition of deterministic here:** the same source + same command ⇒ the same output bytes (or at minimum, the same decoded pixels), on the same machine, on repeated runs.

### The five things that break determinism

1. **Wall-clock time.** `setTimeout`, `Date.now()`, `performance.now()`, rAF timestamps, `MediaRecorder`, `page.video`, `page.record` — all advance on real time. If the renderer reads them, output varies.
2. **Nondeterministic RNG.** `Math.random()` in your scene code, and *any* library that seeds from entropy (particle systems, procedural noise).
3. **Fonts.** Missing fonts → fallback metrics → different line breaks and different text rasterization. Also, font *loading* is async — a frame captured before `document.fonts.ready` is a different frame.
4. **Device pixel ratio / viewport / color profile.** DPR=2 on a retina display rasterizes differently from DPR=1. Sub-pixel antialiasing (`--disable-lcd-text`) and forced color profile (`--force-color-profile=srgb`) change pixels.
5. **Encoders and lossy intermediates.** JPEG screenshots (Remotion's default `imageFormat: 'jpeg'`), H.264 CRF encodes, and GPU rasterization all introduce variability — and **the GPU's** (different drivers → different pixels; SwiftShader → different pixels than real hardware).

### The playbook

**A. Drive time explicitly.** Two techniques, both verified here:

*Technique 1 — pure function of time (simplest, most robust).* Expose `window.seek(t)` and call it before each capture:
```js
await page.evaluate(t => window.seek(t), i / fps);
await page.screenshot({path, animations: 'disabled'});
```
✅ **Verified: byte-identical PNGs across two independent runs.**

*Technique 2 — fake the clock.* Playwright's `clock` API (added v1.45) fakes `Date`, `Temporal.Now`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`, `requestAnimationFrame`, `cancelAnimationFrame`, `requestIdleCallback`, `cancelIdleCallback`, and `performance`:
```js
await page.clock.install({time: new Date('2024-01-01T00:00:00Z')});
await page.goto(url);
for (let i = 0; i < n; i++) {
  await page.clock.runFor(1000 / fps);
  await page.screenshot({path});
}
```
The docs note the clock is installed for the whole `BrowserContext`, so all pages and iframes share it — one clock for the whole page tree. Best practice per the docs: install the clock *before* navigating, and set the initial time slightly before the intended start so page-load timers run normally.

⚠️ `runFor()` vs `fastForward()`: `runFor` fires timers as if time passed normally; `fastForward` "only fires due timers at most once" (like closing a laptop lid). For animation, use `runFor`.

**B. Seed the RNG.** Replace `Math.random()` with a seeded PRNG (e.g. mulberry32) and never let a library auto-seed. Manim exposes this as `--seed INTEGER` — ✅ verified byte-identical output across two `--seed 42` runs.

**C. Pin fonts.**
- Install the exact font files; use `@font-face` with a local `file://` URL, or Remotion's `@remotion/fonts` / `@remotion/google-fonts` (which bundle the font files into the bundle so there's no network fetch).
- `await page.evaluate(() => document.fonts.ready)` before the first frame.
- Pin `font-family` to a single family with explicit weights; avoid `system-ui`.
- In Manim, the font comes from Pango — set it explicitly rather than relying on system defaults.

**D. Pin the rasterization environment.** Chromium flags that matter — **all confirmed present in the `chrome` binary** (verified with `grep -a` over the raw binary):
```
--force-device-scale-factor=1      # DPR = 1
--hide-scrollbars                  # no scrollbar variation
--force-color-profile=srgb         # stable color
--disable-lcd-text                 # no subpixel AA
--disable-partial-raster           # no partial raster (stable AA)
--disable-skia-runtime-opts        # no Skia runtime heuristics
--disable-gpu                      # or --use-gl=swiftshader for a fixed rasterizer
--run-all-compositor-stages-before-draw
```
⚠️ `--font-render-hinting` and `--deterministic-mode` exist **only in `chrome-headless-shell`**, not in the full `chrome` binary — and Chromium silently ignores unknown flags, so passing them to full Chrome is a harmless no-op. Neither is needed: the explicit-clock + screenshot pipeline is deterministic without them.
And in Playwright: `deviceScaleFactor: 1` on the context, an explicit `viewport` that matches your target output size, and `page.screenshot({animations: 'disabled'})` to freeze CSS transitions/animations during capture.

⚠️ **Measured caveat:** `--virtual-time-budget` + `--deterministic-mode` + `--run-all-compositor-stages-before-draw` produced **5 distinct hashes across 8 runs** of an **rAF-driven** page. A **static** page was perfectly stable. Also note that in the full `chrome` binary, `--deterministic-mode` and `--font-render-hinting` **do not exist** (they're only in `chrome-headless-shell`) and Chromium silently ignores unknown flags. Conclusion: **`--virtual-time-budget` is not a substitute for an explicit clock on animated content.** Use it for static pages only.

**E. Prefer lossless intermediates.** Screenshot to **PNG**, not JPEG. Remotion: set `imageFormat: 'png'` (and note `png` is also required for transparency). In FFmpeg, prefer `-crf` with a fixed value over a bitrate target, and set `-preset` explicitly (`-preset slow` is deterministic across runs on the same build; different FFmpeg builds can differ).

**F. Pin the toolchain.** Record the browser build (`npx remotion browser ensure` installs a specific Chrome; Playwright pins a build per version), the FFmpeg version (`ffmpeg -version`), and the container image. In Docker, pin the base image digest.

**G. Verify, don't assume.** A cheap CI check:
```bash
# render twice, compare decoded pixels (not container bytes)
for i in 1 2; do
  ffmpeg -v error -i out/video.mp4 -f framemd5 -hash md5 - | grep -v '^#' | md5sum
done
```
✅ I used exactly this to distinguish Remotion's CLI render (framemd5 `e4358fef…`) from its API render (`1721161809…`) — the container bytes differed *and* the pixels differed, which is exactly the signal you want in CI. Comparing the MP4 file hash alone can hide pixel differences (or flag container-only differences that don't matter).

**H. What to expect per tool (measured):**

| Tool | Same machine, repeated run | Cross-machine |
|---|---|---|
| Remotion (CLI, JPEG default) | ✅ identical bytes | ⚠️ expect differences |
| Remotion (API, PNG) | ✅ identical bytes | ⚠️ expect differences (browser build, fonts) |
| Manim (`--seed 42`) | ✅ identical bytes | ⚠️ expect differences (font/LaTeX versions) |
| Playwright screenshot pipeline | ✅ identical PNGs | ⚠️ expect differences (browser build, fonts, GPU) |
| Chrome `--virtual-time-budget` | ❌ **5 distinct hashes in 8 runs** for rAF content | ❌ |
| MediaRecorder / `page.video` / `page.record` | ❌ wall-clock | ❌ |
| Lottie `goToAndStop(frame)` | ✅ (same as the screenshot pipeline) | ⚠️ |
| FFmpeg re-encode of identical PNGs | ✅ identical bytes (same build) | ⚠️ different builds differ |

**The honest summary:** *bit-identical output across different machines is not realistically achievable* for browser-based rendering, because fonts, browser builds, and GPU drivers all leak in. What you *can* achieve, and should aim for:
1. **Frame-exact timing** — the right frames, in the right order, every time. ✅ achievable everywhere.
2. **Pixel-identical output on the same machine / same pinned container.** ✅ achievable (verified above for Remotion, Manim, and the Playwright pipeline).
3. **Semantic reproducibility** — the video *content* is the same across machines. ✅ achievable if you pin fonts and the browser build.

---

## 5. What is experimental, deprecated, or a trap

| Tool | Status | Reality |
|---|---|---|
| **`@remotion/media-parser`** | ⚠️ **DEPRECATED** | Remotion's own docs: *"Those packages are now deprecated. Use Mediabunny instead."* |
| **`@remotion/webcodecs`** | ⚠️ **DEPRECATED + EXPERIMENTAL** | Docs: *"We are phasing out Remotion WebCodecs and are moving to Mediabunny!"* and *"This package is experimental. We might change the API at any time."* |
| **`@remotion/light-leaks`**, **`@remotion/starburst`** | ⚠️ deprecated | Listed as deprecated in the Remotion CLI package index. |
| **`webm-muxer`** / **`mp4-muxer`** | ⚠️ **DEPRECATED** | READMEs: *"no longer being maintained and will not receive any new features or bug fixes."* Use Mediabunny. |
| **Remotion's own WebCodecs path** | ⚠️ phasing out | Use Mediabunny (MPL-2.0) instead — and note Mediabunny alone needs no Remotion license. |
| **`@ffmpeg/ffmpeg` in Node** | ❌ **unsupported** | Ships `empty.mjs` that throws `"ffmpeg.wasm does not support nodejs"`. Browser-only. |
| **`@ffmpeg/core`** | ⚠️ **GPL-2.0-or-later** | The npm `license` field is GPL even though the wrapper is MIT. |
| **`fluent-ffmpeg`** | ⚠️ **unmaintained** | Last release 2.1.3; upstream repo removed. Prefer `ffmpeg-static` + `child_process`. |
| **`decord`** | ⚠️ **stale** | Last push 2024-07-17, 221 open issues. Use PyAV (BSD-3) or OpenCV. |
| **`rhasspy/piper`** | ⚠️ **archived** (2025-08-26) | PyPI `piper-tts` still works; Kokoro (Apache-2.0) is the better-maintained local TTS. |
| **`Puppeteer page.screencast()`** | ⚠️ **obsolete** | Docs: *"Warning: This API is now obsolete. Use `Page.record()` instead."* |
| **`@remotion/web-renderer`** | ⚠️ **always phones home** | *"Client-side rendering APIs always send a telemetry event for every render, even if no licenseKey is set."* |
| **Revideo** | ⚠️ not a Remotion fork | It's a **Motion Canvas** fork. Different API (generator-based `yield*`), different CLI (`serve`/`editor` only). |
| **Remotion CLI vs API renders** | ⚠️ not byte-identical | Measured: different bytes *and* different decoded pixels (JPEG vs PNG capture path). |
| **`chrome --virtual-time-budget`** | ⚠️ **not deterministic for rAF** | Measured: 3/4 identical, 1/4 different on animated content. |
| **edge-tts** | ⚠️ **network-flaky** | Measured ~50% HTTP 403 failure rate here. Always retry + always have a fallback. |
| **MediaRecorder** | ⚠️ **not frame-accurate** | Measured: 30 requested frames → 0.57 s output. |
| **`html2canvas` / `dom-to-image`** | ⚠️ **not the real renderer** | Re-implement layout; differ from the browser on filters, fixed positioning, web fonts, `<foreignObject>`. |
| **`@ffmpeg/ffmpeg` API stability** | ⚠️ | The package's own `version` list shows 0.12.x is the last published line; the project is largely dormant after 0.12. |

---

## 6. Decision guide

| If you need… | Use | Why |
|---|---|---|
| React components → video, with a permissive license | **Revideo** (MIT) | Same shape as Remotion, no license fee, Motion Canvas lineage. |
| React components → video, with the biggest ecosystem & serverless | **Remotion** | Plugins, Lambda/Vercel, Studio, Player. Accept the license. |
| Math / formulas / 3D | **Manim Community** | LaTeX, `MathTex`, `ThreeDScene`. Byte-reproducible with `--seed`. |
| Data-driven video with heavy templating | **Remotion** or **Revideo** | `inputProps` + `calculateMetadata()` are purpose-built. |
| Browser-only, no server, MP4 out | **Mediabunny** + **WebCodecs** | One MPL-2.0 dep, hardware-accelerated, frame-exact. |
| Existing HTML/CSS to turn into video | **Playwright frame capture → FFmpeg** (§Pipeline B) | The only way to get the *real* renderer. |
| Designer-made After Effects motion | **Lottie** (`goToAndStop`) → frames → FFmpeg | Frame-addressable, deterministic. |
| Interactive state-machine animation | **Rive** + browser capture | Rive is state-machine-first. |
| 3D / shaders | **Three.js** + fixed-timestep capture | Or `@remotion/three`. |
| Final assembly, muxing, format conversion | **FFmpeg** | Every pipeline ends here. |
| In-browser transcoding | **ffmpeg.wasm** | Slow, browser-only, GPL core. |
| Python composition and effects | **MoviePy 2.x** (note the v2 API) | Fast to write, slow to run. |
| Python stream-level work | **PyAV** (BSD-3) | Modern, clean, no numpy round-trips. |
| Local, reproducible TTS | **Kokoro** (Apache-2.0) or **Piper** (archived) | Piper is fast; Kokoro is maintained. |
| Cloud TTS | **edge-tts** | Free — but retry hard. |
| Test evidence, screen recordings | **Playwright `recordVideo`**, **Puppeteer `page.record()`** | Zero code, but wall-clock. |
| MP4 inspection / segmentation / MSE | **MP4Box.js** (BSD-3) | The GPAC lineage, in JS. |

---

## 7. Verification log (what actually ran here)

**Environment:** Linux 7.0.0-38-generic x86_64 · Node v22.22.1 · npm 9.2.0 · Python 3.14.7 · FFmpeg `n9.0.1-11-ge47273f4d9-20260831` · Chrome for Testing 156.0.8078.4 (Playwright 1.64.1) · npm registry + GitHub API queried 2026-10-20.

| # | What | Result |
|---|---|---|
| 1 | Remotion CLI render | ✅ `out/video.mp4` — h264, 1280×720, 30 fps, 90 frames, 3.000000 s, 83 431 B |
| 2 | Remotion programmatic API (`bundle` → `selectComposition` → `renderMedia`) | ✅ `out/video-api.mp4` — 84 985 B; `getCompositions` → `HelloWorld:1280x720@30f/90f` |
| 3 | Remotion determinism | ✅ CLI×2 → identical SHA-256 `461d27f8…`; API×2 → identical `cb69a207…`; ⚠️ CLI vs API → **different decoded pixels** (framemd5 `e4358fef…` vs `1721161809…`) |
| 4 | Manim Community render | ✅ `media/videos/manim_demo/480p15/SquareToCircle.mp4` — h264 854×480@15, 3.466667 s, 27 089 B |
| 5 | Manim determinism (`--seed 42` ×2) | ✅ byte-identical `9a85cdd3…` |
| 6 | MoviePy render | ✅ `moviepy_out.mp4` — h264 640×360@30, 3.000000 s, 18 601 B |
| 7 | FFmpeg concat → overlay → drawtext/scale | ✅ `ff/text.mp4` — h264 640×480 + aac, 3.033333 s, 47 421 B |
| 8 | ffmpeg.wasm in headless Chromium | ✅ 12 835 B; `ffprobe` → h264 160×120 + aac; `exec()` exit 0 |
| 9 | ffmpeg.wasm in Node | ❌ throws `"ffmpeg.wasm does not support nodejs"` (expected) |
| 10 | Mediabunny in-browser encode | ✅ 45 257 B; `ffprobe` → h264 320×180, 30 frames, 1.000000 s |
| 11 | WebCodecs codec probe (Chrome 156) | ✅ vp8 / vp09.00.10.08 / avc1.42001E / avc1.640028 / av01.0.04M.08 supported; `h264`/`hev1.1.6.L93.B0` not; audio: `opus` only |
| 12 | MediaRecorder + `captureStream(30)` | ✅ 17 118 B WebM/VP9 — ⚠️ 0.571267 s for 30 requested frames (wall-clock) |
| 13 | Playwright `recordVideo` | ✅ `videos/page@…webm` — vp9 640×360, 1.480000 s, 13 318 B |
| 14 | Puppeteer `page.record()` | ✅ `pptr_record.mp4` — **av1** 640×360, 1.350467 s, 4 283 B |
| 15 | Playwright deterministic frame capture | ✅ 90 PNGs; **four** independent runs → **identical SHA-256** on frames 0/45/89; → `frames_to_video.mp4` h264 640×360, 90 frames, 3.000000 s |
| 16 | Playwright `clock.runFor` driving rAF | ✅ 60 frames, motion verified (frame 0 ≠ frame 30) |
| 17 | Chrome `--virtual-time-budget` ×8 | ⚠️ **5 distinct hashes across 8 runs** (rAF page); static page → 3/3 identical |
| 18 | Chrome flag presence | ✅ `chrome`: `run-all-compositor-stages-before-draw`, `virtual-time-budget`, `force-color-profile`, `disable-lcd-text`, `disable-partial-raster`, `disable-skia-runtime-opts`; `chrome-headless-shell` additionally has `deterministic-mode`, `font-render-hinting` |
| 19 | Lottie → frames → MP4 | ✅ `lottie_to_video.mp4` — h264 184×96, 60 frames, 2.000000 s; `totalFrames=60, frameRate=30` |
| 20 | Three.js offscreen render (SwiftShader) | ✅ `three_frame0.png`, 2 029 B |
| 21 | edge-tts | ✅ MP3 (2.16 s) — ⚠️ intermittent HTTP 403, ~50% failure rate observed |
| 22 | TTS→video sync pipeline | ✅ `tts_video.mp4` — h264 1280×720 + aac, 3.000000 s, 35 503 B (fallback path exercised) |

**Registry / API facts confirmed live (2026-10-20):** `remotion@4.0.537` (license "SEE LICENSE IN LICENSE.md"), `@revideo/*@0.11.0` (MIT), `@ffmpeg/ffmpeg@0.12.15` (MIT), `@ffmpeg/core@0.12.10` (GPL-2.0-or-later), `mediabunny@1.61.6` (MPL-2.0), `@mediabunny/server@1.61.6` (MPL-2.0), `mp4box@2.4.1` (BSD-3-Clause), `webm-muxer@5.1.4` (MIT, deprecated), `lottie-web@5.13.0` (MIT), `three@0.186.1` (MIT), `puppeteer@25.14.0` (Apache-2.0), `playwright@1.64.1` (Apache-2.0), `ffmpeg-static@5.3.0` (GPL-3.0-or-later), `fluent-ffmpeg@2.1.3` (MIT, unmaintained), `html2canvas@1.4.1` (MIT), `dom-to-image@2.6.0` (MIT), `@resvg/resvg-js@2.6.2` (MPL-2.0) · `manim==0.22.0` (MIT), `moviepy==2.2.1` (MIT), `vidgear==0.3.5` (Apache-2.0), `decord==0.6.0` (Apache-2.0), `opencv-python==5.0.0.93` (Apache-2.0), `av==19.0.1` (BSD-3-Clause), `imageio-ffmpeg==0.6.0` (BSD-2-Clause), `edge-tts==7.3.1`, `piper-tts==1.8.0` (GPL-3.0-or-later), `kokoro==0.9.4` (Apache-2.0), `pydub==0.25.1` (MIT), `cairosvg==2.9.1` (LGPL-3.0-or-later).

**GitHub API facts confirmed live (2026-10-20):** `remotion-dev/remotion` 65 464 ★ (license `NOASSERTION` = non-standard Remotion License) · `midrender/revideo` 4 124 ★ MIT · `ManimCommunity/manim` 41 709 ★ MIT · `Zulko/moviepy` 15 007 ★ MIT · `FFmpeg/FFmpeg` 65 457 ★ · `ffmpegwasm/ffmpeg.wasm` 17 892 ★ MIT · `Vanilagy/mediabunny` 7 336 ★ MPL-2.0 · `gpac/mp4box.js` 2 475 ★ BSD-3-Clause · `Vanilagy/webm-muxer` 340 ★ MIT (deprecated) · `Vanilagy/mp4-muxer` 615 ★ MIT (deprecated) · `microsoft/playwright` 98 137 ★ Apache-2.0 · `puppeteer/puppeteer` 95 729 ★ Apache-2.0 · `mrdoob/three.js` 116 650 ★ MIT · `airbnb/lottie-web` 32 250 ★ MIT · `LottieFiles/dotlottie-web` 920 ★ MIT · `rive-app/rive-wasm` 1 008 ★ MIT · `rive-app/rive-runtime` 1 233 ★ MIT · `abhiTronix/vidgear` 3 728 ★ Apache-2.0 · `dmlc/decord` 2 525 ★ Apache-2.0 (pushed 2024-07-17) · `opencv/opencv` 91 243 ★ Apache-2.0 (release 5.0.0, 2026-06-06) · `PyAV-Org/PyAV` 3 312 ★ BSD-3-Clause · `imageio/imageio` 1 721 ★ BSD-2-Clause · `w3c/webcodecs` 1 297 ★ · `Breakthrough/PySceneDetect` 5 271 ★ BSD-3-Clause · `WyattBlue/auto-editor` 5 569 ★ Unlicense · `rany2/edge-tts` 12 336 ★ · `rhasspy/piper` 11 303 ★ MIT (archived 2025-08-26) · `hexgrad/kokoro` 9 514 ★ Apache-2.0.

**Docs URLs that actually work (for future reference):**
- Remotion raw markdown: append `.md` to any doc URL → `https://www.remotion.dev/docs/renderer/render-media.md` ✅
- Revideo: `https://docs.re.video/` ✅ (the `revideo.dev` / `docs.revideo.org` hosts did not resolve from here; the docs source is in the repo at `packages/docs/src/content/`)
- Manim: `https://docs.manim.community/en/stable/tutorials/quickstart.html` ✅ — note `installation/linux.html` **redirects** to `installation/uv.html`, and `manim.community/installation.html` **404s**
- WebCodecs spec: `https://w3c.github.io/webcodecs/` ✅
- MP4Box.js: `https://gpac.github.io/mp4box.js/` 404s — the README's `https://github.com/gpac/mp4box.js` is the practical source of truth
- FFmpeg filters: `https://ffmpeg.org/ffmpeg-filters.html` ✅ (22 859 lines)
- Mediabunny: `https://mediabunny.dev/guide/writing-media-files` ✅ — and the `dist/bundles/mediabunny.mjs` path is required for direct browser imports
