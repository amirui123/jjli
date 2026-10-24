// The part of the page that is not UI: one canvas inside a host element, the 30fps
// rAF loop, resize and pointer forwarding, the pause policy, reduced motion, and the
// mount/destroy lifecycle with its async load() race guard. Lifted out of main.js so
// the site and <ca-background> run the same code.
//
// Nothing in here touches document.documentElement's attributes, localStorage or
// the hash: those are the site's concerns, and stomping them is exactly what would
// break an embedder's page. Every piece of state is closed over createRuntime(), and
// every listener is collected so destroy() can drain it; an element may be created
// and removed many times in one page.

export const FPS = 30;
// The largest step budget any sim has. Above it, acc saturates (see the sims), so a
// higher speed would only bank a backlog that replays after the speed comes down.
export const MAX_SPEED = 4;

const clampSpeed = (n) => Math.max(0, Math.min(MAX_SPEED, +n || 0));

export function createRuntime(host, {
  theme,
  speed = 1,
  interactive = true,
  observeViewport = false,       // pause when the host is scrolled out of view (the element wants this; the site cannot scroll)
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
  pointerFilter = () => false,   // (event) => true means "the pointer is over something else"; sims are told it left
  onMount = () => {},            // (sim, error | null) after setSim() settles, unless a later setSim() superseded it; error.cause is the thrown value
  onError = () => {},            // (sim, { code?, message? }) for failures after a successful mount
  onPause = () => {},            // (paused) whenever the derived pause state is recomputed
  onStats = () => {},            // (text) every 400ms while a sim is mounted
} = {}) {
  const s = {
    sim: null, ctrl: null, canvas: null, options: undefined, theme, speed: clampSpeed(speed), lastError: null,
    paused: false, userPaused: false, errorPaused: false, offscreen: false, forceMotion: false, reduced,
    raf: 0, last: 0, fpsAcc: 0, fpsN: 0, fps: 0, lastStats: 0, mountSeq: 0, resizeT: 0,
  };
  const listeners = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); listeners.push([target, type, fn, opts]); };
  let io = null;

  // A sim that throws mid-life (frame or resize) is error-paused and reported, rather
  // than left half-updated and throwing again next frame.
  function guarded(fn) {
    try { fn(); }
    catch (e) { console.error(e); s.lastError = { message: e.message }; setPaused({ error: true }); onError(s.sim, s.lastError); }
  }

  // `options` overrides the sim module's own option values (the site keeps chip state
  // there; an element keeps its own).
  async function setSim(sim, { options } = {}) {
    const my = ++s.mountSeq;
    if (s.ctrl) { s.ctrl.destroy(); s.ctrl = null; }
    s.canvas?.remove();
    s.sim = sim; s.options = options; s.lastError = null;
    setPaused({ error: false }); // a previous sim's crash must not freeze this one
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);
    s.canvas = canvas;
    let error = null;
    try {
      const extra = sim.load ? await sim.load() : undefined;
      if (my !== s.mountSeq) return; // a later mount superseded this one while weights were loading
      const ctrl = sim.create(canvas, { theme: s.theme }, extra);
      s.ctrl = ctrl;
      Object.entries(sim.options ?? {}).forEach(([k, o]) => ctrl.setOption(k, options?.[k] ?? o.value)); // chips persist across tab switches
      // A real loss (iOS backgrounding, a GPU reset) pauses with a message. GL calls
      // on a dead context do not throw, so "resume" would show a blank stage under a
      // UI that says playing: the way back is a remount, on restore or on play.
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        if (s.canvas !== canvas) return; // our own destroy() -> loseContext() on a tab switch, not a real loss
        s.lastError = { code: 'lostContext' }; setPaused({ error: true }); onError(sim, s.lastError);
      });
      canvas.addEventListener('webglcontextrestored', () => { if (s.canvas === canvas) remount(); });
      if (s.reduced) for (let i = 0; i < 120; i++) ctrl.frame(1); // settle into something worth looking at, then hold
    } catch (e) {
      error = { code: e.code, message: e.message, cause: e }; // the consumer decides how loud to be
      canvas.style.display = 'none';
    }
    if (my !== s.mountSeq) return;
    s.lastError = error;
    onMount(sim, error);
    pushStats();
  }

  const remount = () => s.sim && setSim(s.sim, { options: s.options });

  // The loop only runs while something would change on screen. Paused, hidden,
  // off-screen or holding still for reduced motion, there is no rAF at all.
  const shouldRun = () => !s.paused && !(s.reduced && !s.forceMotion);
  function schedule() {
    if (s.raf || !shouldRun()) return;
    s.last = performance.now(); s.fpsAcc = 0; s.fpsN = 0; // a fresh measurement window, not the gap we slept through
    s.raf = requestAnimationFrame(loop);
  }
  function halt() { cancelAnimationFrame(s.raf); s.raf = 0; }
  function loop(t) {
    s.raf = 0;
    if (!shouldRun()) return;
    s.raf = requestAnimationFrame(loop);
    const dt = t - s.last;
    if (dt < 1000 / FPS - 1) return;
    s.last = t;
    s.fpsAcc += dt; s.fpsN++;
    if (s.fpsAcc > 500) { s.fps = Math.round(1000 * s.fpsN / s.fpsAcc); s.fpsAcc = 0; s.fpsN = 0; }
    if (s.ctrl) guarded(() => s.ctrl.frame(s.speed));
    if (t - s.lastStats > 400) pushStats(t);
  }
  function pushStats(t = performance.now()) {
    if (!s.ctrl) return;
    s.lastStats = t;
    onStats(`${shouldRun() ? `${s.fps} fps · ` : ''}${s.ctrl.stats()}${s.paused ? ' · paused' : ''}`);
  }

  // One writer for `paused`, derived from the four things that can pause the loop.
  function setPaused({ user, error } = {}) {
    if (user !== undefined) s.userPaused = user;
    if (error !== undefined) s.errorPaused = error;
    s.paused = s.userPaused || s.errorPaused || document.hidden || s.offscreen;
    if (shouldRun()) schedule(); else { halt(); pushStats(); }
    onPause(s.paused);
  }

  // Sims take canvas-local CSS pixels. Translating through the host's rect is what
  // lets an element sit anywhere on a page; for the site's fixed, inset-0 stage the
  // rect is the viewport and the numbers are unchanged.
  function forward(e, down) {
    if (!s.ctrl) return;
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const outside = x < 0 || y < 0 || x >= r.width || y >= r.height;
    if (outside || pointerFilter(e)) { s.ctrl.pointer({ x: -1, y: -1, down: false, leave: true }); return; } // sims must treat leave as "no pointer"
    s.ctrl.pointer({ x, y, down, leave: false });
  }

  on(window, 'resize', () => { clearTimeout(s.resizeT); s.resizeT = setTimeout(() => s.ctrl && guarded(() => s.ctrl.resize()), 150); });
  on(document, 'visibilitychange', () => setPaused());
  if (observeViewport && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(([entry]) => { s.offscreen = !entry.isIntersecting; setPaused(); });
    io.observe(host);
  }
  if (interactive) {
    on(window, 'pointermove', (e) => forward(e, e.buttons > 0));
    on(window, 'pointerdown', (e) => forward(e, true));
    // pointerleave does not bubble; listen on the root element (window never sees it in the bubble phase)
    on(document.documentElement, 'pointerleave', () => s.ctrl?.pointer({ x: -1, y: -1, down: false, leave: true }));
  }
  setPaused();

  return {
    setSim,
    setTheme(t) { s.theme = t; s.ctrl?.setTheme(t); },
    setOption(k, v) { s.ctrl?.setOption(k, v); },
    setSpeed(n) { s.speed = clampSpeed(n); },
    setForceMotion(b) { s.forceMotion = !!b; if (shouldRun()) schedule(); else halt(); },
    reseed() { s.ctrl?.reseed(); if (!shouldRun()) s.ctrl?.frame(0); },
    pause() { setPaused({ user: true }); },
    // play after a context loss rebuilds the sim; play after anything else just continues
    resume() { if (s.lastError?.code === 'lostContext') remount(); else setPaused({ user: false, error: false }); },
    frame(mul = 1) { s.ctrl?.frame(mul); }, // debug: drive by hand when rAF is throttled (e.g. hidden tab)
    stats() { return s.ctrl ? s.ctrl.stats() : ''; },
    get sim() { return s.sim; },
    get ctrl() { return s.ctrl; },
    get canvas() { return s.canvas; },
    get running() { return !!s.raf; },
    get paused() { return s.paused; },
    get userPaused() { return s.userPaused; },
    get lastError() { return s.lastError; },
    get speed() { return s.speed; },
    get reduced() { return s.reduced; },
    get forceMotion() { return s.forceMotion; },
    destroy() {
      s.mountSeq++; // a load() still in flight must not mount into a destroyed runtime
      cancelAnimationFrame(s.raf); clearTimeout(s.resizeT);
      listeners.forEach(([t, type, fn, opts]) => t.removeEventListener(type, fn, opts)); listeners.length = 0;
      io?.disconnect(); io = null;
      s.ctrl?.destroy(); s.ctrl = null;
      s.canvas?.remove(); s.canvas = null;
    },
  };
}
