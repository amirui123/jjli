// <ca-background>: any of the six sims behind someone else's page.
//
// A thin custom element over runtime.js. The shadow root holds one canvas and a few
// lines of CSS, so the host page's stylesheet cannot reach in and nothing leaks out.
// No UI, no i18n, no storage: attributes in, pixels out. The element never throws
// into the host page — every failure warns on the console and falls back.
//
// The public entry point is /element.js at the repo root; this file's path is an
// implementation detail and may move.

import { THEMES } from './theme.js';
import { createRuntime } from './runtime.js';
import rule1d from './sims/rule1d.js';
import life from './sims/life.js';
import cyclic from './sims/cyclic.js';
import boids from './sims/boids.js';
import lenia from './sims/lenia.js';
import nca from './sims/nca.js';

export const SIMS = { rule1d, life, cyclic, boids, lenia, nca };
const DEFAULT_SIM = 'boids';

// The sims' error codes, in English, for the console. The site translates these; the element has no i18n.
const CODES = {
  noWebGL2: 'this browser has no WebGL2',
  noFloat: 'this device has no float render targets (EXT_color_buffer_float)',
  noWeights: 'the Neural CA weights failed to load',
  lostContext: 'the GPU dropped the canvas',
};

// pointer-events: none so the page underneath stays clickable; the runtime listens
// on window and translates through this box, so the sims still see the cursor.
const CSS = `
  :host { display: block; position: relative; overflow: hidden; pointer-events: none; }
  :host([hidden]) { display: none; }
  div { position: absolute; inset: 0; }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
`;

const warn = (msg) => console.warn(`<ca-background>: ${msg}`);

export class CaBackground extends HTMLElement {
  static observedAttributes = ['sim', 'theme', 'speed', 'paused', 'interactive', 'options', 'fallback'];

  #rt = null;
  #stage;
  #scheme = null;   // matchMedia for theme="auto"
  #tried = new Set(); // sims that failed in this element, so a fallback loop cannot form
  #retry = 0;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style><div part="stage"></div>`;
    this.#stage = root.querySelector('div');
  }

  connectedCallback() {
    if (!this.#rt) this.#start();
  }

  disconnectedCallback() {
    this.#stop();
  }

  attributeChangedCallback(name, was, now) {
    if (!this.#rt || was === now) return;
    switch (name) {
      case 'sim': case 'options': this.#tried.clear(); this.#mount(); break;
      case 'theme': this.#applyTheme(); break;
      case 'speed': this.#rt.setSpeed(this.speed); break;
      case 'paused': this.paused ? this.#rt.pause() : this.#rt.resume(); break;
      case 'interactive': this.#stop(); this.#start(); break; // the pointer listeners are bound at creation
      case 'fallback': break; // consulted at the next failure
    }
  }

  // --- attributes as properties -------------------------------------------------

  get sim() { return this.getAttribute('sim') || DEFAULT_SIM; }
  set sim(v) { this.setAttribute('sim', v); }
  get theme() { return this.getAttribute('theme') || 'auto'; }
  set theme(v) { this.setAttribute('theme', v); }
  get speed() { const n = parseFloat(this.getAttribute('speed')); return Number.isFinite(n) ? n : 1; }
  set speed(v) { this.setAttribute('speed', String(v)); }
  get paused() { return this.hasAttribute('paused'); }
  set paused(v) { this.toggleAttribute('paused', !!v); }
  get interactive() { return this.getAttribute('interactive') !== 'false'; }
  set interactive(v) { this.setAttribute('interactive', v ? 'true' : 'false'); }
  get options() { return this.getAttribute('options') || ''; }
  set options(v) { this.setAttribute('options', typeof v === 'string' ? v : Object.entries(v).map(([k, x]) => `${k}=${x}`).join(',')); }
  get fallback() { return this.getAttribute('fallback') || DEFAULT_SIM; }
  set fallback(v) { this.setAttribute('fallback', v); }

  /** The running sim's id, or null while nothing is mounted. */
  get current() { return this.#rt?.ctrl ? this.#rt.sim.id : null; }
  /** Read-only access to the runtime, for debugging and tests. */
  get runtime() { return this.#rt; }

  reseed() { this.#rt?.reseed(); }

  // --- internals ------------------------------------------------------------------

  #start() {
    this.#rt = createRuntime(this.#stage, {
      theme: this.#resolveTheme(),
      speed: this.speed,
      interactive: this.interactive,
      observeViewport: true, // scrolled out of view means stopped: a background in a long page must not burn a battery unseen
      onMount: (sim, error) => { if (error) this.#fail(sim, error); },
      onError: (sim, error) => {
        if (error.code === 'lostContext') {
          // the runtime remounts on webglcontextrestored; if that never comes, try once on our own
          clearTimeout(this.#retry);
          this.#retry = setTimeout(() => { if (this.#rt?.lastError?.code === 'lostContext') this.#rt.resume(); }, 2500);
          return;
        }
        this.#fail(sim, error);
      },
    });
    if (this.paused) this.#rt.pause();
    this.#applyTheme();
    this.#mount();
  }

  #stop() {
    clearTimeout(this.#retry);
    this.#scheme?.removeEventListener('change', this.#onScheme);
    this.#scheme = null;
    this.#rt?.destroy();
    this.#rt = null;
  }

  #mount(id = this.sim) {
    const sim = SIMS[id];
    if (!sim) { warn(`unknown sim "${id}"`); this.#fail({ id }, { message: 'unknown sim' }); return; }
    this.#rt.setSim(sim, { options: this.#parseOptions(sim) });
  }

  // Every failure path resolves the same way: warn, then mount the fallback. If the
  // fallback fails too, render nothing and leave the host's own background visible.
  #fail(sim, error) {
    this.#tried.add(sim.id);
    warn(`"${sim.id}" cannot run here: ${CODES[error.code] ?? error.message}`);
    const fb = this.fallback;
    if (SIMS[fb] && !this.#tried.has(fb)) { warn(`falling back to "${fb}"`); this.#mount(fb); }
  }

  #parseOptions(sim) {
    const out = {};
    for (const pair of this.options.split(',').map((s) => s.trim()).filter(Boolean)) {
      const [k, v] = pair.split('=').map((s) => s.trim());
      const opt = sim.options?.[k];
      if (!opt) { warn(`"${sim.id}" has no option "${k}"`); continue; }
      if (!opt.values.map(String).includes(v)) { warn(`"${sim.id}" option "${k}" has no value "${v}" (one of ${opt.values.join(', ')})`); continue; }
      out[k] = v;
    }
    return out;
  }

  #onScheme = () => this.#rt?.setTheme(this.#resolveTheme());

  #resolveTheme() {
    const t = this.theme;
    if (t === 'dark' || t === 'light') return THEMES[t];
    if (!this.#scheme) { this.#scheme = matchMedia('(prefers-color-scheme: dark)'); this.#scheme.addEventListener('change', this.#onScheme); }
    return THEMES[this.#scheme.matches ? 'dark' : 'light'];
  }

  #applyTheme() {
    if (this.theme !== 'auto' && this.#scheme) { this.#scheme.removeEventListener('change', this.#onScheme); this.#scheme = null; }
    this.#rt.setTheme(this.#resolveTheme());
  }
}
