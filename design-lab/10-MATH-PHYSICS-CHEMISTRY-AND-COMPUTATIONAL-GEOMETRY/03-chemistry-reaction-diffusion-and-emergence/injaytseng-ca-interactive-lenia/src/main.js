import { THEMES, applyCssTheme } from './theme.js';
import { STR, EN_SIMS } from './i18n.js';
import { createRuntime } from './runtime.js';
import rule1d from './sims/rule1d.js';
import life from './sims/life.js';
import cyclic from './sims/cyclic.js';
import boids from './sims/boids.js';
import lenia from './sims/lenia.js';
import nca from './sims/nca.js';

// The site: tabs, concept card, toolbar, keyboard, theme and language persistence,
// the hash router. The loop, the canvas and everything else that is not UI live in
// runtime.js, shared with <ca-background>.

const SIMS = [rule1d, life, cyclic, boids, lenia, nca];
const DEFAULT_SIM = 'boids'; // the calmest of the six: what a first visit should open on
const $ = (s, r = document) => r.querySelector(s);
// Option values as shipped, before any chip is pressed: the embed snippet only spells
// out what differs from these.
const OPTION_DEFAULTS = Object.fromEntries(SIMS.map((s) => [s.id, Object.fromEntries(Object.entries(s.options ?? {}).map(([k, o]) => [k, String(o.value)]))]));

// What a visitor copies: the current tab with the currently pressed chips baked in.
function embedSnippet(sim) {
  const diff = Object.entries(sim.options ?? {}).filter(([k, o]) => String(o.value) !== OPTION_DEFAULTS[sim.id][k]).map(([k, o]) => `${k}=${o.value}`);
  return `<ca-background sim="${sim.id}"${diff.length ? ` options="${diff.join(',')}"` : ''}></ca-background>`;
}

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked (iframe, private mode) */ } },
};
const MOBILE = matchMedia('(max-width: 760px)');
const storedLang = store.get('ca.lang');
const ui = {
  // Object.hasOwn, not `in`: a stored 'constructor' would otherwise pass and THEMES[name] be a function
  theme: Object.hasOwn(THEMES, store.get('ca.theme')) ? store.get('ca.theme') : 'dark',
  // first visit follows the browser; after that, the visitor's own choice
  lang: storedLang === 'zh' || storedLang === 'en' ? storedLang : (navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en'),
  sim: null,
};

const rt = createRuntime($('#stage'), {
  theme: THEMES[ui.theme],
  pointerFilter: (e) => e.target instanceof Element && !!e.target.closest('.ui'),
  onMount: (sim, error) => { if (error) console.error(error.cause ?? error.message); renderCard(sim, error); },
  onError: (sim, error) => renderCard(sim, error),
  onPause: syncPauseButton,
  onStats: (text) => { const el = $('#stats'); if (el) el.textContent = text; },
});

function setTheme(name) {
  ui.theme = name;
  document.documentElement.dataset.theme = name;
  applyCssTheme(THEMES[name]);
  store.set('ca.theme', name);
  rt.setTheme(THEMES[name]);
  $('#theme').textContent = T()[name];
}

const T = () => STR[ui.lang];

function setTitle() {
  document.title = ui.sim ? `${ui.sim.num} ${ui.sim.title} — ${T().siteTitle}` : T().siteTitle;
}

// English overlays the Chinese originals field by field, so a partial entry in
// EN_SIMS falls back per string instead of dropping the whole object.
function simText(sim) {
  const en = ui.lang === 'en' ? EN_SIMS[sim.id] : null;
  const c = sim.concept;
  return {
    tag: en?.tag ?? sim.tag,
    rule: en?.concept?.rule ?? c.rule,
    why: en?.concept?.why ?? c.why,
    dies: en?.concept?.dies ?? c.dies,
    cost: en?.concept?.cost ?? c.cost,
    interact: en?.concept?.interact ?? c.interact,
    refs: en?.concept?.refs ?? c.refs,
    optLabel: (k) => en?.options?.[k]?.label ?? sim.options[k].label,
    optValue: (k, v) => en?.options?.[k]?.labels?.[v] ?? sim.options[k].labels?.[v] ?? v,
  };
}

function setLang(lang) {
  ui.lang = lang;
  store.set('ca.lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  const t = T();
  $('.brand-text .t1').textContent = t.t1;
  $('.brand-text .t2').textContent = t.t2;
  $('.brand-text .repo').textContent = t.repo;
  $('#tabs').setAttribute('aria-label', t.tablist);
  $('.toolbar .keys').textContent = t.keys.replace('{n}', SIMS.length);
  $('#speed-label').textContent = t.speed;
  $('#reseed').textContent = t.reseed;
  $('#hide').textContent = t.hide;
  $('#theme').textContent = t[ui.theme];
  $('#motion').textContent = t.motion;
  $('#pause').setAttribute('aria-label', t.pause);
  $('.ui-hint').textContent = t.showUI;
  // the button shows the *other* language's name, in that language
  const lb = $('#lang');
  lb.textContent = t.langBtn; lb.setAttribute('aria-label', t.langBtnLabel); lb.lang = lang === 'zh' ? 'en' : 'zh-Hant';
  SIMS.forEach((s) => { $(`#tab-${s.id}`).title = simText(s).tag; }); // the tag is the scent a newcomer needs; the engine is a spec
  setTitle();
  syncCardToggle();
  if (ui.sim) renderCard(ui.sim, rt.lastError);
}

function buildTabs() {
  const nav = $('#tabs');
  // titles and engines are English in both languages, so say so for screen readers under zh-Hant
  nav.innerHTML = SIMS.map((s) => `
    <button class="tab" id="tab-${s.id}" data-id="${s.id}" role="tab" aria-controls="card" aria-selected="false" tabindex="-1">
      <span class="num">${s.num}</span>
      <span class="name" lang="en">${s.title}</span>
      <span class="engine" lang="en">${s.engine}</span>
    </button>`).join('');
  nav.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => (location.hash = b.dataset.id)));
  nav.addEventListener('keydown', (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, Home: -SIMS.length, End: SIMS.length }[e.key];
    if (!step) return;
    e.preventDefault();
    const from = Math.max(0, SIMS.findIndex((s) => s.id === ui.sim?.id));
    const to = Math.min(SIMS.length - 1, Math.max(0, from + step));
    location.hash = SIMS[to].id;
    $(`#tab-${SIMS[to].id}`).focus(); // tabs are never rebuilt, so focus survives the mount
  });
}

// Roving tabindex: only the selected tab is in the tab order (ARIA tabs pattern).
function syncTabs() {
  $('#tabs').querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.id === ui.sim?.id;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  });
}

function syncCardToggle() {
  const open = !document.body.classList.contains('card-collapsed');
  const btn = $('#card-toggle');
  btn.textContent = `${T().concept} ${open ? '▾' : '▸'}`;
  btn.setAttribute('aria-expanded', String(open));
}

function syncPauseButton(paused) {
  const btn = $('#pause');
  btn.textContent = paused ? '▶' : '❚❚';
  btn.setAttribute('aria-pressed', String(paused));
}

// `err` is { code?, message? }: a code picks a translated, visitor-facing string,
// and anything without one falls back to the raw message.
function renderCard(sim, err) {
  const t = T(), x = simText(sim);
  const error = err ? (t[err.code] ?? err.message) : null;
  const opts = Object.entries(sim.options || {}).map(([key, o]) => `
    <div class="opt"><span class="lbl">${x.optLabel(key)}</span>
      ${o.values.map((v) => `<button class="chip" data-key="${key}" data-val="${v}" aria-pressed="${String(v) === String(o.value)}">${x.optValue(key, v)}</button>`).join('')}
    </div>`).join('');
  // The error slot is filled with textContent below: a shader log or a driver
  // message must not be parsed as HTML, and role=alert announces it.
  const errorSlot = error ? '<p class="error" role="alert"></p>' : '';
  $('#card').innerHTML = `
    <div class="card-head" lang="en">
      <span class="num">${sim.num}</span>
      <h1>${sim.title}</h1>
      <span class="engine">${sim.engine}</span>
    </div>
    <p class="tagline">${x.tag}</p>
    ${errorSlot}
    <dl class="spec">
      <dt>${t.rule}</dt><dd>${x.rule}</dd>
      <dt>${t.why}</dt><dd>${x.why}</dd>
      <dt>${t.dies}</dt><dd>${x.dies}</dd>
      <dt>${t.cost}</dt><dd>${x.cost}</dd>
      <dt>${t.interact}</dt><dd>${x.interact}</dd>
      <dt>${t.embed}</dt><dd class="embed"><code></code><a href="embed.html">${t.embedHow}</a></dd>
    </dl>
    ${sim.id === 'nca' && !error ? `<img class="target" src="nca/target.png" alt="${t.target}" title="${t.target}">` : ''}
    <div class="opts">${opts}</div>
    <ul class="refs" lang="en">${x.refs.map((r) => `<li>${r}</li>`).join('')}</ul>
    <div class="stats" id="stats"></div>`;
  // Collapsed (the mobile default) still has to say the background is interactive,
  // still has to show why a tab is blank, and still offers the chips: they are the
  // most playable thing on the page and were unreachable on a phone without this.
  $('#card-brief').innerHTML = `<p class="tagline">${x.tag}</p><p class="brief-interact">${x.interact}</p>${errorSlot}<div class="opts">${opts}</div>`;
  if (error) document.querySelectorAll('.error').forEach((p) => { p.textContent = String(error).split('\n')[0]; });
  $('#card .embed code').textContent = embedSnippet(sim); // textContent: it contains angle brackets
  document.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
    sim.options[b.dataset.key].value = b.dataset.val;
    rt.setOption(b.dataset.key, b.dataset.val);
    // both copies of the chips (card and brief) show the same pressed state, and the snippet follows
    document.querySelectorAll(`.chip[data-key="${b.dataset.key}"]`).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.val === b.dataset.val)));
    $('#card .embed code').textContent = embedSnippet(sim);
  }));
}

function mount(id) {
  const sim = SIMS.find((s) => s.id === id) || SIMS.find((s) => s.id === DEFAULT_SIM);
  ui.sim = sim;
  syncTabs();
  $('#card').setAttribute('aria-labelledby', `tab-${sim.id}`);
  setTitle();
  rt.setSim(sim); // -> onMount -> renderCard
}

function bindUI() {
  $('#theme').addEventListener('click', () => setTheme(ui.theme === 'dark' ? 'light' : 'dark'));
  $('#lang').addEventListener('click', () => setLang(ui.lang === 'en' ? 'zh' : 'en'));
  $('#speed').addEventListener('input', (e) => { rt.setSpeed(Math.pow(2, +e.target.value)); $('#speedv').textContent = rt.speed.toFixed(2) + '×'; });
  $('#pause').addEventListener('click', () => (rt.paused ? rt.resume() : rt.pause()));
  $('#reseed').addEventListener('click', () => rt.reseed());
  $('#hide').addEventListener('click', toggleUI);
  $('.ui-hint').addEventListener('click', toggleUI); // without this, hiding the UI is a dead end on touch
  $('#card-toggle').addEventListener('click', () => { document.body.classList.toggle('card-collapsed'); syncCardToggle(); });
  window.addEventListener('hashchange', () => mount(location.hash.slice(1)));
  if (MOBILE.matches) document.body.classList.add('card-collapsed');
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const k = e.key.toLowerCase();
    const n = +e.key;
    if (n >= 1 && n <= SIMS.length && e.key.length === 1) location.hash = SIMS[n - 1].id;
    else if (k === 'h') toggleUI();
    else if (k === 'r') rt.reseed();
    else if (k === ' ') {
      // Space on a focused button or link is that control's own activation key; a
      // keyboard visitor tabbing to "reseed" must get a reseed, not a pause
      if (e.target instanceof Element && e.target.closest('button, a, [role="button"]')) return;
      e.preventDefault(); $('#pause').click();
    }
    else if (k === 't') setTheme(ui.theme === 'dark' ? 'light' : 'dark');
    else if (k === 'l') setLang(ui.lang === 'en' ? 'zh' : 'en');
  });
  if (rt.reduced) {
    $('#motion').hidden = false;
    $('#motion').addEventListener('click', () => { rt.setForceMotion(!rt.forceMotion); $('#motion').setAttribute('aria-pressed', String(rt.forceMotion)); });
  }
}

function toggleUI() {
  document.body.classList.toggle('ui-hidden');
}

setTheme(ui.theme);
buildTabs();
bindUI();
setLang(ui.lang);
mount(location.hash.slice(1) || DEFAULT_SIM);
// The weights are the only thing on the page that makes a tab wait on the network.
// Fetch them once the first tab is up and the browser is idle, so 06 opens like the rest.
(window.requestIdleCallback ?? ((fn) => setTimeout(fn, 2000)))(() => { nca.load?.().catch(() => {}); });
window.__ca = rt; // debug hook: __ca.frame(1) drives a frame by hand when rAF is throttled (e.g. hidden tab)
