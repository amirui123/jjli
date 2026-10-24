# Embeddable background element — design

- **Date:** 2026-09-03
- **Status:** approved design, amended 2026-09-03 after a five-lens review (pointer
  coordinates, `options`, post-mount failures, `/element.js` caching, per-instance
  runtime state); **implemented 2026-09-03** — `src/runtime.js`, `src/element.js`,
  `element.js`, `embed.html`, CORS in `_headers`, CI deploy
- **Scope:** one deliverable — a `<ca-background>` custom element that puts any of
  the six sims behind someone else's page. Flow Lenia is a separate effort and is
  deliberately not specced here (see *Related work*).

## Why

The repository is named for backgrounds and ships six of them, but the only page
that can use one is this project's own. The six sim modules already share a single
interface, so the missing piece is not the animations — it is everything around
them: a canvas, a loop, resize, pause, pointer, theme. Today that lives inside
`src/main.js`, tangled with the tabs, the concept card, the toolbar, i18n and the
hash router, none of which an embedder wants.

Extracting the loop is worth doing on its own terms. `main.js` is 262 lines and
carries two unrelated jobs; separating them makes both halves easier to reason
about, and gives the element something to stand on.

## Non-goals

- **No npm package.** Distribution is a script tag served from `ca.davidyc.com`.
  `package.json` stays `private: true`. No version numbers, no publish flow, no
  compatibility promises to strangers.
- **No build step.** The project's zero-build, zero-dependency property is load
  bearing; the element is plain ES modules like everything else.
- **No UI.** No tabs, card, toolbar, keyboard shortcuts or i18n inside the element.
  Those belong to the site.
- **No new sims.** The element exposes the six that exist.

## Architecture

Three pieces, in dependency order.

### `src/runtime.js` (new)

Owns everything `main.js` currently does that is not UI: the 30fps rAF loop, resize
forwarding, pause policy, pointer forwarding, reduced-motion, and the mount/destroy
lifecycle including the async `sim.load()` race guard.

```js
createRuntime(host, { sim, theme, speed, interactive, onError }) -> {
  setSim(sim), setTheme(theme), setOption(k, v), setSpeed(n),
  reseed(), pause(), resume(), stats(), destroy()
}
```

`host` is the element the canvas is appended to. The runtime never touches
`document.documentElement`, `localStorage`, or the hash — those are the site's
concerns and stomping them is exactly what would break an embedder's page.

**Resize forwarding, not canvas sizing.** Each sim already sizes its own backing
store inside `resize()` — the cell size, the DPR cap and the grid maths are sim
decisions. The runtime only debounces `window` resize and calls `ctrl.resize()`,
exactly as `main.js` does today. The six copies of the DPR idiom are lifted into a
shared `fitCanvas()` helper in a separate, earlier commit so the extraction itself
stays mechanical.

**Per-instance state.** `main.js` keeps its state in module-level singletons
(`state`, `mountSeq`, `resizeT`), adds its `window`/`document` listeners once with no
disposers, never cancels `state.raf`, and keys the `webglcontextlost` guard on the
global `state.canvas`. Moved verbatim, that yields a runtime that can exist once per
page and can never be torn down — the opposite of what a custom element needs. So
the move closes every piece of state over `createRuntime()`, collects every
`addEventListener` into a list that `destroy()` drains, and cancels the rAF while
paused. Same lines of logic, different scope; the browser matrix is what proves the
behaviour did not change.

**Speed is clamped** to the largest step budget any sim has (`4`): the sims cap steps
per frame but let `acc` grow without bound, so an embedder passing `speed="8"` would
build a backlog that replays for seconds after the attribute changes back.

### `src/element.js` (new)

A thin custom element over the runtime. Attaches a shadow root containing one
canvas and a few lines of inline CSS, so the host page's stylesheet cannot reach in
and the element's styles cannot leak out.

### `element.js` at the repo root (new)

Two lines: import `src/element.js`, call `customElements.define`. Its only job is to
be the stable public URL. Embedders point at `https://ca.davidyc.com/element.js` and
never at a path inside `src/`, so the internals can be reorganised later without
breaking anyone's page. A public entry point is worth one file of indirection; a
published URL containing `/src/` is a structural decision made by accident.

### `src/main.js` (refactor)

Rewired to consume `runtime.js` for its loop, keeping every behaviour it has today:
hash routing, tabs, concept card, toolbar, keyboard, theme and language
persistence, the `window.__ca` debug hook, and the reduced-motion settle.

This is a **mechanical move, not a rewrite.** Code comes out of `main.js` and into
`runtime.js` with its comments intact. Behaviour changes ship in their own commit
after the move has been verified: the context-loss remount under *Failure policy*,
the idle-time weights prefetch, and the rAF being cancelled while paused.

## Public API

```html
<script type="module" src="https://ca.davidyc.com/element.js"></script>
<ca-background sim="boids"></ca-background>
```

| Attribute | Values | Default | Meaning |
|---|---|---|---|
| `sim` | `rule1d` `life` `cyclic` `boids` `lenia` `nca` | `boids` | which specimen to run |
| `theme` | `dark` `light` `auto` | `auto` | `auto` follows `prefers-color-scheme` and updates live |
| `speed` | number | `1` | multiplier passed to `frame()` |
| `paused` | boolean attribute | absent | present stops the loop |
| `interactive` | `true` `false` | `true` | `false` ignores the pointer entirely |
| `options` | `key=value,key=value` | sim defaults | the same choices the site's chips offer, e.g. `rule=90`, `preset=turbulent`, `mood=attract`, `density=many`, `brush=off` |
| `fallback` | a sim id | `boids` | used when `sim` cannot run here |

Properties mirror the attributes. One method: `reseed()`. All attributes are live —
changing `sim` tears down the old controller and mounts the new one through the
same path `mount()` uses today.

`options` exists because the chips are what the site's visitors spend their time on:
Rule 90's fractal, Day & Night, a tank full of Orbiums. Without it, what a visitor
sees on the site is not what they can copy. Unknown keys and values are ignored with
a `console.warn`. The site's concept card shows the exact `<ca-background>` snippet
for the current tab with the currently pressed chips baked in.

Sizing is the host page's job. The element is `display: block` and fills its box;
the canvas fills the element. The documented recipe for a page background:

```css
ca-background { position: fixed; inset: 0; z-index: -1; }
```

## Two decisions that are not obvious

### Pointer

The host element sets `pointer-events: none`, and the runtime listens for
`pointermove` on `window` instead. A background that swallowed clicks would be
useless, but a background that ignores the pointer loses the one feature that makes
these six worth embedding. Listening at the window gets both: the flock reacts to
the cursor, and the reader can still click the article underneath.

`interactive="false"` removes the listener entirely for hosts that want a purely
decorative surface.

**Coordinates.** The sims' `pointer({ x, y })` contract is *canvas-local CSS pixels*:
every sim divides by `canvas.clientWidth`/`clientHeight` or compares against its own
`w`/`h`. `main.js` forwards `clientX`/`clientY` untouched, which is only correct
because the site's canvas is `position: fixed; inset: 0`. An element sitting anywhere
else on the page would aim every brush at the wrong place. The runtime therefore
translates through `host.getBoundingClientRect()` before forwarding, and sends
`leave: true` whenever the pointer is outside the box. README documents the contract
so a seventh sim does not reintroduce the assumption.

### Pause policy

The site pauses on `document.hidden`. The element pauses on that **and** on an
`IntersectionObserver` — scrolled out of view means stopped. An embedded background
sitting in a long page would otherwise burn a phone battery to animate pixels
nobody is looking at.

The observer is an element concern only. The site's stage is `position: fixed` under
a `body { overflow: hidden }`, so it can never be scrolled out of view and the observer
would never fire there; the site keeps `document.hidden` alone. The runtime exposes
the observer as an option the element turns on and `main.js` leaves off.

While paused — by the visitor, by an error, by a hidden tab or an off-screen
element — the runtime cancels its rAF rather than waking every frame to do nothing.
Today `main.js` keeps the loop alive and rewrites the stats line every 400 ms of a
still image.

## Failure policy

The element must never throw into the host page. Every failure path — WebGL2
absent, `EXT_color_buffer_float` absent, the NCA weights fetch failing, an unknown
`sim` value — resolves the same way: `console.warn` with a short explanation, then
mount `fallback`. If the fallback also fails, the element renders nothing and leaves
the host's own background visible.

The sims already carry error codes (`noWebGL2`, `noFloat`, `noWeights`) from the
translated-message work; the element reads the same codes and reports them in
English to the console, since it has no i18n.

Two failures happen *after* a successful mount and need their own rule:

- **`webglcontextlost`** (iOS backgrounding, a GPU reset). The runtime error-pauses
  and reports `lostContext`. On `webglcontextrestored`, or when the visitor presses
  play, it remounts the same sim rather than resuming: GL calls on a dead context do
  not throw, so resuming would show a blank stage under a UI that says "playing".
  Today `main.js` has exactly that bug — the pause button clears `errorPaused`.
- **A throwing `frame()`.** The runtime error-pauses and reports the message. The
  element treats this like a mount failure: warn, then mount `fallback`.

Both are runtime behaviour, so the site gets them too.

## Deployment requirements

Cross-origin ES modules require CORS headers on the script **and** on everything it
imports. Without this the element is broken on every domain except this one, which
is the entire point of it. `_headers` gains:

```
/element.js
  Cache-Control: public, max-age=0, must-revalidate
  Access-Control-Allow-Origin: *
/src/*
  Access-Control-Allow-Origin: *
/nca/*
  Access-Control-Allow-Origin: *
```

The CORS lines are merged into the existing `/src/*` and `/nca/*` blocks rather than
duplicated. `/element.js` needs its own `Cache-Control`: it is not under `/src/`, so
without one it would be heuristically cached by browsers while the modules it imports
revalidate every request — exactly the version-skew `_headers` was written to
prevent. The weights and images keep their day.

`npm run build` copies `element.js` and a new `embed.html` demo page into `dist/`.

## Verification

- `npm test` — the core tests must stay green. They cover the pure step functions,
  which this work does not touch; a red test means the refactor reached somewhere it
  should not have.
- `npm run check` — `tools/browser-check.mjs` drives headless Chrome over the DevTools
  protocol, mounts all six sims and fails on any exception, `console.error` or 404.
  Run it per theme, language, reduced-motion and a phone viewport; that is the
  browser matrix below, automated.
- **Browser matrix on the existing site**, the same one used for the predator work:
  all six tabs mount without console errors, in both themes and both languages, plus
  hide-UI restore, tab keyboard navigation, and the pause state machine. `main.js`
  has no automated coverage, so this matrix is the safety net for the refactor and is
  not optional.
- **`embed.html`** served from a *different origin* than the modules — a second local
  port is enough — proving the CORS headers work and that a page with its own CSS,
  its own scroll, and clickable content behaves correctly with the element behind it.
- **IntersectionObserver** verified by scrolling the element out of view in
  `embed.html` and confirming the loop stops.

## Risks

**The `main.js` refactor has no test net.** Mitigated by keeping the move mechanical
and by the browser matrix above. If the matrix finds a regression that is not
obviously a moved-code mistake, the right response is to stop and reconsider the
extraction boundary rather than patch around it.

**CORS is a deploy-time property, not a code property.** The element can look
perfect locally and be broken for every consumer. The cross-origin check in
*Verification* exists precisely because same-origin testing cannot catch this.

**The NCA is an 85KB fetch on someone else's page.** Only when `sim="nca"`, and the
element does not preload it otherwise. Documented so an embedder chooses knowingly.

## Related work, not in this spec

**Flow Lenia** is the other candidate for what comes next. It is not specced because
the first step is a spike, and a spike's output is an answer rather than code:
*does the existing Orbium remain a coherent moving creature once mass is conserved?*
The parameters were found for classic Lenia and the two schemes do not share
creatures freely, so the answer decides whether Flow Lenia becomes a second option
inside tab 05 or an independent tab 07 with a creature of its own. Throwaway code,
half a day, no changes under `src/`.

**CI auto-deploy** was the prerequisite and is done (`.github/workflows/ci.yml`):
production served stale code after the predator release because deployment was
manual and was simply forgotten. Once other people's sites load `element.js` from
this origin, "the code is on main" and "the code is live" must stop being different
states. The deploy job also proves the live `main.js` equals what it just built.
