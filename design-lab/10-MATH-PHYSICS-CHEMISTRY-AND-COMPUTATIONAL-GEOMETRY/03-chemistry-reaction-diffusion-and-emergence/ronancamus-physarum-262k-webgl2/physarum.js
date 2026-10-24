// A slime mould in raw WebGL2. No library: a quarter of a million agents living in two textures.
//
// Physarum polycephalum explores by laying a chemical trail and following it. Jones (2010) reduced that to three
// rules, and they are enough to grow a transport network from noise:
//   1. agents: each one senses the trail ahead, left and right, turns toward the strongest, and steps forward;
//   2. deposit: each one leaves a little trail where it stands;
//   3. spread: the trail blurs and fades; whatever the pointer touches is food, which is just more trail.
// Agents are pixels of a float texture (x, y, heading). The trail is a single 16-bit channel that wraps at the
// edges. Three draw calls per step, sixty steps per second.
//
// Pointer: feeds it. Press and hold: a feast. Keys 1 to 4: temperament. Space: pause. R: start over.
(() => {
  const canvas = document.getElementById('gl');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) { document.body.classList.add('no-gl'); return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, coarse = matchMedia('(pointer: coarse)').matches;
  const SIDE = coarse ? 256 : 512;                   // agents per side of their texture: 65 536 or 262 144 of them
  const WIDE = coarse ? 960 : 1280;                  // the trail is at most this wide; the screen only samples it
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  const HEAD = '#version 300 es\nprecision highp float;\nprecision highp int;\n';
  const FULL = `${HEAD}out vec2 vUV; void main(){ vec2 v = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); vUV = v; gl_Position = vec4(v * 2. - 1., 0., 1.); }`;
  const SRC = {
    agents: { vs: FULL, fs: `${HEAD}
out vec4 o;
uniform sampler2D uAgents, uTrail;
uniform vec4 uSim;      // sensor angle, sensor distance, turn angle, step (distances in image heights)
uniform vec2 uSeed;     // a fresh draw each step, width over height
float hash13(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
vec2 dir(float h){ return vec2(cos(h) / uSeed.y, sin(h)); }
// What a sensor feels: the trail attracts, but a crowded vein attracts less. Without this every agent ends up
// in the same few veins and the network collapses into a handful of fat tubes.
float sense(vec2 q){ float v = texture(uTrail, q).r; return v * exp(-v * .55); }
void main(){
  vec4 a = texelFetch(uAgents, ivec2(gl_FragCoord.xy), 0);
  vec2 p = a.xy; float h = a.z;
  float r = hash13(vec3(gl_FragCoord.xy, uSeed.x * 977.));
  // A few agents are reborn somewhere else each step: they are the ones who open new veins
  if (hash13(vec3(gl_FragCoord.yx, uSeed.x * 311. + 5.)) < .0015) { o = vec4(hash13(vec3(gl_FragCoord.xy, uSeed.x * 53.)), hash13(vec3(gl_FragCoord.xy, uSeed.x * 131. + 2.)), (r * 2. - 1.) * 3.14159265, a.w); return; }
  float F = sense(p + dir(h) * uSim.y), L = sense(p + dir(h + uSim.x) * uSim.y), R = sense(p + dir(h - uSim.x) * uSim.y);
  if (F < L && F < R) h += (r < .5 ? -1. : 1.) * uSim.z;      // trail on both sides: toss a coin
  else if (L > F && L > R) h += uSim.z;
  else if (R > F && R > L) h -= uSim.z;
  h += (r - .5) * .1;                                           // a little hesitation
  h = mod(h + 3.14159265, 6.2831853) - 3.14159265;
  o = vec4(fract(p + dir(h) * uSim.w), h, a.w);
}` },
    deposit: { vs: `${HEAD}
uniform sampler2D uAgents;
uniform int uSide;
void main(){ gl_Position = vec4(texelFetch(uAgents, ivec2(gl_VertexID % uSide, gl_VertexID / uSide), 0).xy * 2. - 1., 0., 1.); gl_PointSize = 1.; }`, fs: `${HEAD}
out vec4 o;
uniform float uDeposit;
void main(){ o = vec4(uDeposit, 0., 0., 1.); }` },
    spread: { vs: FULL, fs: `${HEAD}
in vec2 vUV; out vec4 o;
uniform sampler2D uTrail;
uniform vec4 uFood;     // x, y, radius, strength
uniform vec2 uDecay;    // what remains after one step, width over height
void main(){
  // Four reads between the texels are worth nine: each already averages four neighbours
  vec2 px = .5 / vec2(textureSize(uTrail, 0));
  float v = texture(uTrail, vUV + px).r + texture(uTrail, vUV - px).r + texture(uTrail, vUV + vec2(px.x, -px.y)).r + texture(uTrail, vUV + vec2(-px.x, px.y)).r;
  vec2 d = (vUV - uFood.xy) * vec2(uDecay.y, 1.);
  o = vec4(min(v * .25 * uDecay.x + uFood.w * exp(-dot(d, d) / (uFood.z * uFood.z)), 5.), 0., 0., 1.);
}` },
    copy: { vs: FULL, fs: `${HEAD}
in vec2 vUV; out vec4 o; uniform sampler2D uTrail;
void main(){ o = vec4(texture(uTrail, vUV).r, 0., 0., 1.); }` },
    // The screen: cyan where it barely passes, magenta then orange in its veins, white hot in the thickest ones
    show: { vs: FULL, fs: `${HEAD}
in vec2 vUV; out vec4 o;
uniform sampler2D uTrail;
uniform vec2 uTime;     // seconds, hue offset
vec3 cmo(float t){ t = fract(t);
  vec3 cy = vec3(0., .9, 1.), mg = vec3(1., 0., .85), og = vec3(1., .55, 0.);
  float s = t * 3.;
  if (s < 1.) return mix(cy, mg, smoothstep(0., 1., s));
  if (s < 2.) return mix(mg, og, smoothstep(0., 1., s - 1.));
  return mix(og, cy, smoothstep(0., 1., s - 2.)); }
void main(){
  float v = texture(uTrail, vUV).r, k = 1. - exp(-v * 1.1);
  vec3 c = cmo(.04 + k * .5 + uTime.x * .008 + uTime.y) * pow(k, 1.2) + vec3(1., .9, .8) * pow(k, 5.) * .3;
  c = pow(max(c, 0.), vec3(.8)) * 1.25;
  vec2 q = vUV - .5; c *= 1. - dot(q, q) * .6;                                                       // a soft vignette
  c += (fract(sin(dot(gl_FragCoord.xy + fract(uTime.x) * 61., vec2(12.9898, 78.233))) * 43758.5453) - .5) * .035;   // grain hides banding
  o = vec4(c, 1.);
}` },
  };
  const PRG = {};
  for (const [name, s] of Object.entries(SRC)) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, s.vs], [gl.FRAGMENT_SHADER, s.fs]]) { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); gl.attachShader(p, sh); }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(name, gl.getProgramInfoLog(p)); document.body.classList.add('no-gl'); return; }
    const u = {}; for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); }
    PRG[name] = { p, u };
  }
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);

  // A texture one can draw into
  const hold = (w, h, format, type, filter, wrap, data) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, format === gl.R16F ? gl.RED : gl.RGBA, type, data);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, filter], [gl.TEXTURE_MAG_FILTER, filter], [gl.TEXTURE_WRAP_S, wrap], [gl.TEXTURE_WRAP_T, wrap]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { document.body.classList.add('no-gl'); throw new Error('float framebuffer'); }
    return { t, f, w, h };
  };
  let seed = 20260929;
  const draw = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const born = () => { const a = new Float32Array(SIDE * SIDE * 4); for (let i = 0; i < a.length; i += 4) { a[i] = draw(); a[i + 1] = draw(); a[i + 2] = (draw() * 2 - 1) * Math.PI; a[i + 3] = draw(); } return a; };
  const agents = [0, 1].map(() => hold(SIDE, SIDE, gl.RGBA32F, gl.FLOAT, gl.NEAREST, gl.CLAMP_TO_EDGE, born()));
  let trail = null, a = 0, o = 0, n = 0, acc = 0, aspect = 16 / 9, deposit = 0;

  // The four temperaments: sensor angle, sensor distance, turn angle, step; then how much trail survives a step
  const KINDS = [
    { name: 'veins', sim: [0.45, 0.016, 0.7, 0.002], decay: 0.89 },
    { name: 'lace', sim: [0.35, 0.007, 0.45, 0.0014], decay: 0.86 },
    { name: 'coral', sim: [0.9, 0.03, 0.35, 0.002], decay: 0.93 },
    { name: 'storm', sim: [1.3, 0.05, 1.3, 0.0045], decay: 0.8 },
  ];
  const store = { kind: 0, hue: 0, food: [0.5, 0.5], aim: [0.5, 0.5], fed: 0, want: 0, touched: -1e9, pressed: false, paused: false, time: 0 };
  const label = document.getElementById('kind'), count = document.getElementById('count');
  if (count) count.textContent = `${(SIDE * SIDE).toLocaleString('en')} agents`;
  const name = () => { if (label) label.textContent = KINDS[store.kind].name; };
  name();

  function fit() {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = Math.max(1, Math.round(innerWidth * dpr)), h = Math.max(1, Math.round(innerHeight * dpr));
    if (canvas.width === w && canvas.height === h && trail) return;
    canvas.width = w; canvas.height = h; aspect = w / h;
    const s = Math.min(1, WIDE / Math.max(w, h)), tw = Math.max(1, Math.round(w * s)), th = Math.max(1, Math.round(h * s));
    if (trail && trail[0].w === tw && trail[0].h === th) return;
    const fresh = [0, 1].map(() => hold(tw, th, gl.R16F, gl.HALF_FLOAT, gl.LINEAR, gl.REPEAT, null));
    if (trail) {      // the network survives a resize: the old trail is drawn into the new one
      gl.bindFramebuffer(gl.FRAMEBUFFER, fresh[o].f); gl.viewport(0, 0, tw, th); gl.useProgram(PRG.copy.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, trail[o].t); gl.uniform1i(PRG.copy.u.uTrail, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
      for (const x of trail) { gl.deleteTexture(x.t); gl.deleteFramebuffer(x.f); }
    }
    trail = fresh; deposit = 0.028 * (tw * th) / (SIDE * SIDE);
  }

  function step() {
    const A = agents[a], B = agents[1 - a], O = trail[o], P = trail[1 - o], kind = KINDS[store.kind];
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, B.f); gl.viewport(0, 0, SIDE, SIDE);
    let u = PRG.agents.u; gl.useProgram(PRG.agents.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, O.t);
    gl.uniform1i(u.uAgents, 0); gl.uniform1i(u.uTrail, 1); gl.uniform4f(u.uSim, ...kind.sim); gl.uniform2f(u.uSeed, (n * 0.6180339887) % 1, aspect);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindTexture(gl.TEXTURE_2D, null);                         // the trail is about to receive the deposit: stop reading it
    gl.bindFramebuffer(gl.FRAMEBUFFER, O.f); gl.viewport(0, 0, O.w, O.h);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    u = PRG.deposit.u; gl.useProgram(PRG.deposit.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, B.t); gl.uniform1i(u.uAgents, 0); gl.uniform1i(u.uSide, SIDE); gl.uniform1f(u.uDeposit, deposit);
    gl.drawArrays(gl.POINTS, 0, SIDE * SIDE);
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, P.f);
    u = PRG.spread.u; gl.useProgram(PRG.spread.p);
    gl.bindTexture(gl.TEXTURE_2D, O.t); gl.uniform1i(u.uTrail, 0);
    gl.uniform4f(u.uFood, store.food[0], store.food[1], store.pressed ? 0.13 : 0.09, store.fed * 0.07); gl.uniform2f(u.uDecay, kind.decay, aspect);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    a = 1 - a; o = 1 - o; n++;
  }

  function show() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    const u = PRG.show.u; gl.useProgram(PRG.show.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, trail[o].t); gl.uniform1i(u.uTrail, 0); gl.uniform2f(u.uTime, store.time, store.hue);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Food follows the pointer with some lag. Left alone for a while, the meal wanders on its own, slowly.
  function feed(dt) {
    const idle = store.time - store.touched;
    if (idle > 6 && !reduced) { const t = store.time * 0.07; store.aim = [0.5 + 0.34 * Math.sin(t * 1.3 + 0.7), 0.5 + 0.3 * Math.sin(t * 0.9)]; store.want = 0.4; }
    else if (idle > 0.25 && !store.pressed) store.want = 0;
    const k = 1 - Math.exp(-dt * 4);
    store.food[0] += (store.aim[0] - store.food[0]) * k; store.food[1] += (store.aim[1] - store.food[1]) * k;
    store.fed += (store.want - store.fed) * (1 - Math.exp(-dt * (store.want > store.fed ? 6 : 2)));
  }

  let last = performance.now(), raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    fit();
    store.time += dt;
    feed(dt);
    if (!store.paused) { acc = Math.min(acc + dt * 60, 3); while (acc >= 1) { step(); acc -= 1; } }
    show();
  }
  // Reduced motion: the network is grown once, then it only moves when the visitor does
  function still(k) { for (let i = 0; i < k; i++) step(); show(); }

  const touch = (e) => {
    store.aim = [e.clientX / innerWidth, 1 - e.clientY / innerHeight];
    store.touched = store.time; store.want = store.pressed ? 1 : 0.6;
    if (reduced) { feed(1 / 30); still(4); }
  };
  addEventListener('pointermove', touch);
  addEventListener('pointerdown', (e) => { store.pressed = true; touch(e); });
  addEventListener('pointerup', () => { store.pressed = false; store.want = 0.6; });
  addEventListener('pointercancel', () => { store.pressed = false; });
  addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '4') { store.kind = Number(e.key) - 1; name(); }
    else if (e.key === ' ') { store.paused = !store.paused; e.preventDefault(); }
    else if (e.key === 'r' || e.key === 'R') { for (const x of agents) { gl.bindTexture(gl.TEXTURE_2D, x.t); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, SIDE, SIDE, gl.RGBA, gl.FLOAT, born()); } for (const x of trail) { gl.bindFramebuffer(gl.FRAMEBUFFER, x.f); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); } n = 0; }
    else if (e.key === 'h' || e.key === 'H') store.hue = (store.hue + 1 / 6) % 1;
    else return;
    if (reduced) still(e.key === ' ' ? 0 : 120);
  });
  addEventListener('resize', () => { fit(); if (reduced) show(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!reduced && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });

  fit();
  document.documentElement.classList.add('gl');
  if (reduced) still(400); else raf = requestAnimationFrame(frame);
  window.__physarum = () => ({ agents: SIDE * SIDE, steps: n, kind: KINDS[store.kind].name, trail: `${trail[0].w}x${trail[0].h}`, fed: Math.round(store.fed * 100) / 100, paused: store.paused });
})();
