# ca-interactive — Living Backgrounds

**Live: https://ca.davidyc.com** · **Embed it: https://ca.davidyc.com/embed.html**

Six families of cellular automata, each running as a full-page web background animation, in one page with six tabs. Every tab ships with a concept card: what the rule is, why it works as a background, whether it dies, what it costs, how the pointer interacts with it, and the one-line snippet that puts it behind your own page. English / 中文 toggle built in (`L`).

The page opens on **04 Boids** — the calmest of the six — unless the URL carries a hash (`/#lenia`).

Zero build step, zero runtime dependencies, MIT.

| # | Tab | Engine | Dies? |
|---|---|---|---|
| 01 | Rule 110 (switchable 30/90/184/54/73) | Canvas 2D, one row per frame | No |
| 02 | Life + trails (Life / HighLife / Day & Night) | Canvas 2D + decay trails + glider rain | Yes — watchdog |
| 03 | Cyclic CA (Spirals 3/5/8/M, CCA 1/1/14/N, Turbulent, 313) | Canvas 2D | No |
| 04 | Boids + 2 predators | Canvas 2D, spatial hash, reflecting walls | No |
| 05 | Lenia (Orbium) | WebGL2 fragment shader, R=13 ring kernel | Yes — replenish/reseed watchdog |
| 06 | Neural CA (self-healing lizard) | WebGL2 MRT, inference of PyTorch-trained weights | No |

Tabs 01–03 live on a torus; Boids is the exception — the window is a closed tank, so a bird banks away from a wall as it nears it and reflects off the glass if it still arrives. Two predators share that tank, each turning toward the nearest bird it can see. They scatter the flock but never catch it, so the population is constant. The pointer is a third threat of the same kind, and `mood` flips it to bait — for the predators as well as the flock, so you can drive the big fish off or lead them around.

## Embedding

```html
<script type="module" src="https://ca.davidyc.com/element.js"></script>
<ca-background sim="boids"></ca-background>

<style> ca-background { position: fixed; inset: 0; z-index: -1; } </style>
```

`<ca-background>` is a custom element over the same runtime the site uses. Attributes `sim`, `theme` (`dark` / `light` / `auto`), `speed`, `paused`, `interactive`, `options` (the same choices the site's chips offer, e.g. `options="rule=90"`) and `fallback`; all live, all mirrored as properties. It sets `pointer-events: none`, so the page on top stays clickable while the animation still follows the cursor; it stops while the tab is hidden or the element is scrolled out of view; when a sim cannot run here it warns on the console and mounts `fallback`, and never throws into the host page. The full attribute table and a live demo are on [embed.html](https://ca.davidyc.com/embed.html). Element-facing changes are recorded in `CHANGELOG.md`.

The stable contract is the attribute table. `element.js` at the origin root is the only URL to load; paths under `/src/` are internal and may move.

## Run it

```sh
npm run serve          # node tools/serve.mjs 8788 — a static server that applies _headers
open http://localhost:8788/
```

ES modules need http; opening the file directly won't work. The server applies `_headers` so the Cache-Control and CORS rules can be checked locally, exactly as Cloudflare will serve them.

Keyboard: `1–6` switch tabs · `H` hide the UI (background only) · `R` reseed · `Space` pause · `T` theme · `L` language.

## Layout

```
index.html / styles.css      shell: tabs, concept card, toolbar, first-paint token fallback, self-hosted @font-face
embed.html                   the element's documentation and live demo; ?origin= loads element.js from elsewhere
element.js                   the public entry point: imports src/element.js and defines <ca-background>
src/runtime.js               createRuntime(host, opts): canvas, 30fps loop, resize, pointer, pause policy, mount race guard
src/element.js               the custom element over the runtime: attributes, theme=auto, fallback policy
src/main.js                  the site: hash router, tabs, card, toolbar, keyboard, theme/language persistence
src/i18n.js                  UI strings (en + zh) + the English overlay for the sim cards
src/theme.js                 dark / light palettes — the source of truth for colour
src/canvas.js                fitCanvas(): the one place a sim sizes its backing store (DPR cap, 0×0 guard)
src/gl.js                    WebGL2 helpers (programs, float textures, FBOs, fullscreen quad)
src/core/*.js                pure, testable step cores: rule1d, life, cyclic, boids
src/sims/*.js                six sim modules implementing one shared interface, plus orbium.js (pattern data)
fonts/                       Fraunces + IBM Plex Mono, latin woff2, served immutable
tools/browser-check.mjs      CDP smoke test: mounts every sim in headless Chrome, fails on any console error
tools/serve.mjs              zero-dependency static server that applies _headers
tools/og.py                  regenerates og.png, the social-card image
_headers                     Cache-Control and CORS for the deployed assets
nca/train.py                 Growing-NCA trainer (PyTorch, MPS) -> nca/weights.json + target.png
test/*.test.mjs              node --test
docs/superpowers/            design specs and execution plans
CHANGELOG.md                 element-facing changes, dated
```

Each sim module exports:

```js
{ id, num, title, engine, tag,
  options?: { key: { label, values, labels?, value } },   // label/labels in Chinese; English in EN_SIMS
  concept: { rule, why, dies, cost, interact, refs },     // Chinese; English overlay in EN_SIMS
  load?(),                       // async preload (NCA fetches its weights, once per session)
  create(canvas, env, extra) => { frame(mul), resize(), reseed(), setTheme(t), setOption(k, v), pointer(p), stats(), destroy() } }
```

`pointer(p)` receives `{ x, y, down, leave }` in **canvas-local CSS pixels**; `leave: true` means "no pointer" and the coordinates are then meaningless. The runtime translates window coordinates through the host's rect before calling it, so a sim never needs to know where its canvas sits on the page. `resize()` must survive a 0×0 host — use `fitCanvas()` and it will. `frame(mul)` should cap its steps and clamp its accumulator so a large `mul` saturates instead of banking a backlog; the runtime clamps `mul` to 4.

`main.js` resolves the two languages **field by field**, so a partial `EN_SIMS` entry falls back per string rather than dropping the whole card. Errors thrown from `load()`/`create()` may carry a `code` (`noWebGL2`, `noFloat`, `noWeights`) that maps to a translated, visitor-facing message; a WebGL context lost after a successful mount is reported as `lostContext`, and play or `webglcontextrestored` remounts the sim.

## NCA weights

`nca/weights.json` is produced by `nca/train.py` (6000 iters, ~20 min on Apple silicon). To grow a different emoji:

```sh
uv venv nca/.venv -p 3.12 && uv pip install --python nca/.venv/bin/python torch numpy pillow
nca/.venv/bin/python nca/train.py --emoji 🦎 --iters 6000
```

The contract shared between the trainer and the WebGL shader (channel order, perception layout, alive mask, fire rate) is documented in the docstring at the top of `train.py`; change one side and you must change the other.

## Deploy

Every push to `main` that passes the tests is deployed by CI (`.github/workflows/ci.yml`): it runs `npm run deploy` exactly as a human would, with the wrangler version pinned in `package.json`, then checks that the live `main.js` equals what it just built. Two repository secrets are needed: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (a token with *Workers Scripts: Edit*). Until the token exists the deploy job warns and skips, so "the code is on main" and "the code is live" can still be different states — set it.

```sh
npm run deploy                        # the same thing by hand: build dist/ and deploy via Cloudflare Workers static assets
npx wrangler@4.128.0 deployments list # what is live
npx wrangler@4.128.0 rollback         # back to the previous deployment; embedders see it on their next load
```

The custom domain is configured in `wrangler.jsonc`; deploying by hand requires a wrangler login on the account that owns the zone.

## Verify

```sh
npm test               # node --test over the pure cores and fitCanvas, incl. a boids hash-vs-brute-force equivalence test
npm run check          # tools/browser-check.mjs: headless Chrome mounts all six sims, fails on any console error or 404
```

The browser check takes `--theme light --lang zh --reduced --width 375 --height 667 --shots DIR --eval JS --flags "--disable-3d-apis"`, which is how the matrix (six sims × two themes × two languages, reduced motion, a phone viewport, no WebGL) is run, and how the element is checked: `--url http://localhost:8790/embed.html?origin=http://localhost:8788 --sims ''` with two `tools/serve.mjs` instances proves the cross-origin path. CI runs `npm test` on every push and pull request. Contributions are welcome: fork, branch, keep both green, and open a PR describing what changed and why.

The page exposes `window.__ca` (the runtime), so when the tab is hidden you can still drive `__ca.frame(1)` by hand.

## Known limits

- The loop stops entirely while the tab is hidden — there is no rAF at all — deliberate; a background should not burn battery unseen. The element also stops when scrolled out of view.
- Lenia: colliding Orbiums occasionally blow up into a full-grid labyrinth. The watchdog reads total mass every 3 s, replenishes when thin, reseeds when exploded (roughly once every 1–2 minutes). Flow Lenia (mass-conserving) would fix this at the root; not implemented.
- Lenia / NCA need WebGL2 + `EXT_color_buffer_float`; without it Lenia falls back to 8-bit (visibly crunchy) and the NCA refuses to run with a translated explanation. Lenia's downgrade is *not* announced on the card — the only signal is `rgba8` in the stats line.
- The NCA was trained on a 64×64 zero-padded grid; on the page, neighbouring tiles share an open boundary and rely on seed spacing to stay apart. Stable in observation, but out of the training distribution.
- Nothing is content-hashed. Code revalidates on every request (a 304 with ETags), which is what keeps a page's modules consistent across a deploy; the trade is one conditional request per module per load.

## 中文摘要

六種細胞自動機家族做成同一頁六個分頁的網頁背景動畫，每頁附理念卡（規則、為何適合當背景、會不會死、成本、互動、嵌入片段）。介面中英雙語（`L` 切換）。零 build、零依賴。預設開在 04 Boids，視窗是一只魚缸——鳥靠近邊界會提前轉開，撞上就反彈。06 的 Neural CA 權重由 `nca/train.py` 在本機訓練（Growing NCA，Mordvintsev 2020），塞進 WebGL2 fragment shader 推論，擦掉會自己長回來。任何網站都能用一行 `<ca-background sim="…">` 把其中一個放到自己的頁面後面，說明在 `embed.html`。

## License

MIT. The Orbium pattern comes from Bert Chan's Lenia (github.com/Chakazul/Lenia, MIT); source noted in `src/sims/orbium.js`. Fraunces (Undercase Type) and IBM Plex Mono (IBM) are served under the SIL Open Font License.
