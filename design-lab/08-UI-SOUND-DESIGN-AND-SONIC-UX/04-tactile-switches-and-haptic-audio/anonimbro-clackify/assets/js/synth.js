/* ==========================================================================
   CLACKIFY® — SYNTH.JS
   SAMPLE BANK GENERATOR — rekaman asli + fallback sintesis
   --------------------------------------------------------------------------
   10 switch profiles x 6 key classes x (press + release) = 120 buffers,
   rendered to AudioBuffers via OfflineAudioContext at the live sample rate.

   PRIMARY SOURCE — assets/js/samples.js: rekaman switch ASLI (MIT) dari
   kbsim (Thomas Lai) dan mechvibes (Hai Nguyen), dipotong per tombol dan
   dinormalisasi. Atribusi lengkap di CREDITS.md. Bila file itu tidak ada /
   gagal decode, setiap pack otomatis jatuh ke profil sintesis di bawah
   (fallback), sehingga app tetap berbunyi tanpa aset eksternal.

   FALLBACK LAYER MODEL
     noise : white noise -> biquad (bandpass/lowpass) -> decay envelope
     osc   : oscillator w/ pitch drop (f0 -> f1) -> decay envelope
   Each layer is tagged with a class key (click/body/texture/metal) so the
   per-key modifiers can scale it independently.
   ========================================================================== */

window.ClackSynth = (function () {
  'use strict';

  /* ---------------------------------------------------------------------
     KEY CLASSES — how the physical board is partitioned
     --------------------------------------------------------------------- */
  var KEY_CLASSES = ['char', 'space', 'enter', 'backspace', 'mod', 'nav'];

  var KEY_MOD = {
    char:      { pitch: 1.00, dur: 1.00, gain: 1.00, click: 1.00, body: 1.00, metal: 1.00 },
    space:     { pitch: 0.55, dur: 1.70, gain: 1.25, click: 0.70, body: 1.35, metal: 1.10, rattle: true },
    enter:     { pitch: 0.72, dur: 1.35, gain: 1.15, click: 0.85, body: 1.20, metal: 1.00 },
    backspace: { pitch: 0.80, dur: 1.20, gain: 1.08, click: 0.90, body: 1.12, metal: 1.00 },
    mod:       { pitch: 1.12, dur: 0.85, gain: 0.70, click: 0.85, body: 0.70, metal: 0.80 },
    nav:       { pitch: 0.95, dur: 1.05, gain: 0.92, click: 0.95, body: 1.00, metal: 1.00 }
  };

  /* Stabilizer rattle — two tiny ticks after the spacebar impact */
  var RATTLE_LAYERS = [
    { k: 'click', t: 'noise', filt: 'bandpass', f: 2400, q: 1.6, g: 0.10, at: 0.012, dur: 0.0022 },
    { k: 'click', t: 'noise', filt: 'bandpass', f: 2150, q: 1.6, g: 0.07, at: 0.026, dur: 0.0020 }
  ];

  /* ---------------------------------------------------------------------
     SAMPLE MODIFIERS — per key class, untuk jalur rekaman asli.
     Tiap kelas sudah punya rekaman sendiri (char/space/enter/backspace/mod/nav),
     jadi pergeseran di sini halus saja: rate = tinggi nada, gain = level.
     --------------------------------------------------------------------- */
  var SAMPLE_MOD = {
    char:      { rate: 1.00, gain: 1.00 },
    space:     { rate: 0.98, gain: 1.06 },
    enter:     { rate: 0.99, gain: 1.02 },
    backspace: { rate: 1.01, gain: 0.98 },
    mod:       { rate: 1.04, gain: 0.86 },
    nav:       { rate: 1.02, gain: 0.90 }
  };

  /* ---------------------------------------------------------------------
     SAMPLE BANKS — the ten switch profiles
     Ordered: MX family -> boutique -> exotic. Every profile renders 6 key
     classes x (press + release) = 12 buffers, so the bank count is exact.
     --------------------------------------------------------------------- */
  var PACKS = [
    {
      id: 'mxred',
      code: 'SW-01',
      name: 'CHERRY MX RED',
      tag: 'CLEAN LIGHT CLACK',
      profile: 'LINEAR / LIGHT',
      character: 'Clean light clack',
      bodyHz: '250 / 125',
      clickHz: '1000',
      release: 'FAINT TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 1650, q: 1.1, g: 0.20, at: 0,      dur: 0.0042 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 3100, q: 0.8, g: 0.09, at: 0.0004, dur: 0.0028 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 245, f1: 180, g: 0.62, at: 0, dur: 0.0480 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 122, f1: 100, g: 0.34, at: 0, dur: 0.0600 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 520,  q: 0.6, g: 0.13, at: 0, dur: 0.0280 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1950, q: 1.1, g: 0.055, at: 0, dur: 0.0032 }
      ]
    },
    {
      id: 'mxblue',
      code: 'SW-02',
      name: 'CHERRY MX BLUE',
      tag: 'CRISP CLICK',
      profile: 'CLICKY / SHARP',
      character: 'Two-stage click jacket',
      bodyHz: '90 / 60',
      clickHz: '8000',
      release: 'SOFT TICK',
      press: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 3200, q: 1.3, g: 0.42, at: 0,      dur: 0.0045 },
        { k: 'click', t: 'noise', filt: 'bandpass', f: 5200, q: 1.0, g: 0.18, at: 0.0004, dur: 0.0030 },
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1900, q: 0.9, g: 0.20, at: 0.0010, dur: 0.0040 },
        { k: 'body',  t: 'osc',   wave: 'triangle', f0: 260, f1: 200, g: 0.55, at: 0, dur: 0.0400 },
        { k: 'body',  t: 'osc',   wave: 'sine',     f0: 120, f1: 96,  g: 0.28, at: 0, dur: 0.0550 },
        { k: 'metal', t: 'noise', filt: 'bandpass', f: 1850, q: 1.5, g: 0.10, at: 0, dur: 0.0060 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 2650, q: 1.4, g: 0.34, at: 0,      dur: 0.0040 },
        { k: 'click', t: 'noise', filt: 'bandpass', f: 4300, q: 1.0, g: 0.12, at: 0.0003, dur: 0.0030 },
        { k: 'body',  t: 'osc',   wave: 'sine',     f0: 200, f1: 170, g: 0.16, at: 0, dur: 0.0280 }
      ]
    },
    {
      id: 'mxbrown',
      code: 'SW-03',
      name: 'CHERRY MX BROWN',
      tag: 'MUTED SOFT BUMP',
      profile: 'TACTILE / SOFT',
      character: 'Soft brown bump',
      bodyHz: '500 / 250',
      clickHz: '2800',
      release: 'CRISP TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 2150, q: 1.2, g: 0.22, at: 0,      dur: 0.0040 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 1450, q: 0.9, g: 0.12, at: 0.0016, dur: 0.0052 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 228, f1: 168, g: 0.66, at: 0, dur: 0.0550 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 112, f1: 92,  g: 0.38, at: 0, dur: 0.0680 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 430,  q: 0.6, g: 0.20, at: 0, dur: 0.0360 },
        { k: 'metal',   t: 'noise', filt: 'bandpass', f: 2450, q: 1.5, g: 0.05, at: 0, dur: 0.0050 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1800, q: 1.1, g: 0.070, at: 0, dur: 0.0034 }
      ]
    },
    {
      id: 'egpurple',
      code: 'SW-04',
      name: 'EG CRYSTAL PURPLE',
      tag: 'CRISP BOUTIQUE BUMP',
      profile: 'TACTILE / CRISP',
      character: 'Crisp boutique bump',
      bodyHz: '500 / 250',
      clickHz: '1000',
      release: 'CRISP TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 2850, q: 1.3, g: 0.28, at: 0,      dur: 0.0038 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 4300, q: 1.0, g: 0.11, at: 0.0004, dur: 0.0028 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 300, f1: 228, g: 0.48, at: 0, dur: 0.0420 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 142, f1: 114, g: 0.26, at: 0, dur: 0.0520 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 760,  q: 0.6, g: 0.11, at: 0, dur: 0.0240 },
        { k: 'metal',   t: 'noise', filt: 'bandpass', f: 3250, q: 1.5, g: 0.07, at: 0, dur: 0.0045 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 2950, q: 1.3, g: 0.120, at: 0, dur: 0.0034 },
        { k: 'body',  t: 'osc',   wave: 'sine',     f0: 230, f1: 196, g: 0.100, at: 0, dur: 0.0240 }
      ]
    },
    {
      id: 'cream',
      code: 'SW-05',
      name: 'NK CREAM',
      tag: 'SMOOTH DENSE THOCK',
      profile: 'LINEAR / DENSE',
      character: 'Smooth dense thock',
      bodyHz: '125 / 62',
      clickHz: '2000',
      release: 'CRISP TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 1250, q: 1.1, g: 0.20, at: 0,      dur: 0.0055 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 2600, q: 0.8, g: 0.10, at: 0.0005, dur: 0.0032 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 185, f1: 132, g: 0.88, at: 0, dur: 0.0720 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 96,  f1: 74,  g: 0.50, at: 0, dur: 0.0920 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 385, f1: 300, g: 0.12, at: 0, dur: 0.0300 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 380,  q: 0.6, g: 0.20, at: 0, dur: 0.0400 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1500, q: 1.1, g: 0.060, at: 0, dur: 0.0034 }
      ]
    },
    {
      id: 'alpaca',
      code: 'SW-06',
      name: 'ALPACA LINEAR',
      tag: 'CREAMY CLACK',
      profile: 'SMOOTH / ROUND',
      character: 'Mid clack, soft attack',
      bodyHz: '90 / 60',
      clickHz: '2800',
      release: 'CRISP TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 1050, q: 1.2, g: 0.26, at: 0,      dur: 0.0050 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 2400, q: 0.8, g: 0.16, at: 0.0005, dur: 0.0030 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 215, f1: 150, g: 0.80, at: 0, dur: 0.0620 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 108, f1: 86,  g: 0.42, at: 0, dur: 0.0780 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 430,  q: 0.6, g: 0.16, at: 0, dur: 0.0320 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1350, q: 1.1, g: 0.055, at: 0, dur: 0.0032 }
      ]
    },
    {
      id: 'holypanda',
      code: 'SW-07',
      name: 'HOLY PANDA',
      tag: 'DEEP THOCK',
      profile: 'TACTILE / POP',
      character: 'Deep thock, hard bottom-out',
      bodyHz: '125 / 62',
      clickHz: '2800',
      release: 'CRISP TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 1350, q: 1.0, g: 0.20, at: 0,      dur: 0.0040 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 2600, q: 0.7, g: 0.10, at: 0.0005, dur: 0.0030 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 150, f1: 100, g: 0.90, at: 0, dur: 0.0850 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 82,  f1: 62,  g: 0.55, at: 0, dur: 0.1100 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 320,  q: 0.6, g: 0.22, at: 0, dur: 0.0400 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 420, f1: 330, g: 0.14, at: 0, dur: 0.0280 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1700, q: 1.0, g: 0.09, at: 0, dur: 0.0035 }
      ]
    },
    {
      id: 'turquoise',
      code: 'SW-08',
      name: 'KAILH BOX TURQUOISE',
      tag: 'THICK CLICK BAR',
      profile: 'CLICKY / THICK',
      character: 'Thick click bar',
      bodyHz: '125 / 62',
      clickHz: '2800',
      release: 'CRISP TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 1900, q: 1.4, g: 0.48, at: 0,      dur: 0.0055 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 3600, q: 1.0, g: 0.20, at: 0.0004, dur: 0.0030 },
        { k: 'click',   t: 'noise', filt: 'bandpass', f: 950,  q: 1.0, g: 0.26, at: 0.0012, dur: 0.0050 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 200, f1: 142, g: 0.80, at: 0, dur: 0.0700 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 90,  f1: 68,  g: 0.48, at: 0, dur: 0.0950 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 340,  q: 0.6, g: 0.22, at: 0, dur: 0.0420 },
        { k: 'metal',   t: 'noise', filt: 'bandpass', f: 1500, q: 1.5, g: 0.10, at: 0, dur: 0.0060 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1750, q: 1.3, g: 0.260, at: 0,      dur: 0.0044 },
        { k: 'click', t: 'noise', filt: 'bandpass', f: 3300, q: 1.0, g: 0.100, at: 0.0004, dur: 0.0030 },
        { k: 'body',  t: 'osc',   wave: 'sine',     f0: 175, f1: 148, g: 0.180, at: 0, dur: 0.0300 }
      ]
    },
    {
      id: 'topre',
      code: 'SW-09',
      name: 'TOPRE ELECTRO-CAPACITIVE',
      tag: 'MUTED THUD',
      profile: 'DAMPED / RUBBER',
      character: 'Damped rubber thump',
      bodyHz: '250 / 125',
      clickHz: '1000',
      release: 'CRISP TICK',
      press: [
        { k: 'click',   t: 'noise', filt: 'lowpass',  f: 900, q: 0.5, g: 0.10, at: 0, dur: 0.0050 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 118, f1: 86, g: 0.95, at: 0, dur: 0.0720 },
        { k: 'body',    t: 'osc',   wave: 'sine',     f0: 58,  f1: 48, g: 0.35, at: 0, dur: 0.0850 },
        { k: 'texture', t: 'noise', filt: 'lowpass',  f: 240, q: 0.5, g: 0.26, at: 0, dur: 0.0450 },
        { k: 'body',    t: 'osc',   wave: 'triangle', f0: 200, f1: 170, g: 0.20, at: 0, dur: 0.0350 }
      ],
      rel: [
        { k: 'click', t: 'noise', filt: 'lowpass', f: 800, q: 0.5, g: 0.050, at: 0, dur: 0.0040 }
      ]
    },
    {
      id: 'modelm',
      code: 'SW-10',
      name: 'IBM MODEL M',
      tag: 'VINTAGE METALLIC',
      profile: 'BUCKLING SPRING',
      character: 'Buckling spring snap',
      bodyHz: '355 / 177',
      clickHz: '1400',
      release: 'SOFT TICK',
      press: [
        { k: 'click', t: 'noise', filt: 'bandpass', f: 2900, q: 1.1, g: 0.30, at: 0,      dur: 0.0050 },
        { k: 'click', t: 'noise', filt: 'bandpass', f: 1400, q: 0.8, g: 0.18, at: 0.0006, dur: 0.0060 },
        { k: 'body',  t: 'osc',   wave: 'triangle', f0: 190, f1: 150, g: 0.62, at: 0, dur: 0.0550 },
        { k: 'body',  t: 'osc',   wave: 'sine',     f0: 95,  f1: 78,  g: 0.30, at: 0, dur: 0.0700 },
        { k: 'metal', t: 'noise', filt: 'bandpass', f: 3200, q: 1.2, g: 0.16, at: 0.001, dur: 0.0070 },
        { k: 'metal', t: 'noise', filt: 'bandpass', f: 5400, q: 1.2, g: 0.08, at: 0.001, dur: 0.0055 }
      ],
      rel: [
        { k: 'metal', t: 'noise', filt: 'bandpass', f: 3500, q: 1.3, g: 0.12, at: 0, dur: 0.0060 },
        { k: 'metal', t: 'noise', filt: 'bandpass', f: 5200, q: 1.3, g: 0.07, at: 0, dur: 0.0050 },
        { k: 'click', t: 'noise', filt: 'bandpass', f: 2500, q: 1.2, g: 0.12, at: 0, dur: 0.0040 }
      ]
    }
  ];

  /* ---------------------------------------------------------------------
     CLASSIFIER — KeyboardEvent.code -> key class
     --------------------------------------------------------------------- */
  var CLASS_MAP = {
    Space: 'space', Enter: 'enter', NumpadEnter: 'enter', Backspace: 'backspace',
    ShiftLeft: 'mod', ShiftRight: 'mod', ControlLeft: 'mod', ControlRight: 'mod',
    AltLeft: 'mod', AltRight: 'mod', MetaLeft: 'mod', MetaRight: 'mod', CapsLock: 'mod',
    ArrowUp: 'nav', ArrowDown: 'nav', ArrowLeft: 'nav', ArrowRight: 'nav',
    Home: 'nav', End: 'nav', PageUp: 'nav', PageDown: 'nav',
    Insert: 'nav', Delete: 'backspace', Tab: 'nav', Escape: 'nav', ContextMenu: 'mod'
  };

  function classify(code) {
    return CLASS_MAP[code] || 'char';
  }

  /* ---------------------------------------------------------------------
     RENDER CORE
     --------------------------------------------------------------------- */
  function envelope(param, t0, peak, attack, dur) {
    var p = Math.max(0.0002, peak);
    param.setValueAtTime(0.0001, t0);
    param.exponentialRampToValueAtTime(p, t0 + attack);
    param.exponentialRampToValueAtTime(0.0001, t0 + attack + dur);
  }

  /* Noise source is plain data and not bound to a context, so generate it
     once per sample rate instead of once per sound (120 renders -> 1). */
  var _noiseCache = {};
  function makeNoiseBuffer(ctx) {
    var key = String(ctx.sampleRate);
    if (_noiseCache[key]) return _noiseCache[key];
    var len = Math.floor(ctx.sampleRate * 1.0);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    _noiseCache[key] = buf;
    return buf;
  }

  function totalDuration(layers) {
    var end = 0;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var e = (L.at || 0) + L.dur;
      if (e > end) end = e;
    }
    return end;
  }

  /* Apply per-key-class modifiers to a layer spec (returns a new spec). */
  function adaptLayer(L, m) {
    var out = { k: L.k, t: L.t, at: (L.at || 0) * Math.min(1.6, m.dur), dur: L.dur * m.dur };
    var catGain = (L.k === 'click') ? m.click : (L.k === 'body') ? m.body : (L.k === 'metal') ? m.metal : 1;
    out.g = L.g * m.gain * catGain;
    if (L.t === 'noise') {
      out.filt = L.filt; out.q = L.q;
      out.f = L.f * m.pitch;
    } else {
      out.wave = L.wave;
      out.f0 = L.f0 * m.pitch;
      out.f1 = L.f1 * m.pitch;
    }
    return out;
  }

  /* Render one sound (array of adapted layers) to an AudioBuffer. */
  function renderSound(sampleRate, layers) {
    var dur = totalDuration(layers);
    var length = Math.max(64, Math.ceil(sampleRate * (dur + 0.03)));
    var off = new OfflineAudioContext(1, length, sampleRate);
    var noise = makeNoiseBuffer(off);

    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var t0 = L.at || 0;
      var g = off.createGain();

      if (L.t === 'noise') {
        var src = off.createBufferSource();
        src.buffer = noise;
        src.loop = true;
        src.loopStart = Math.random() * 0.5;
        src.loopEnd = src.loopStart + 0.25;
        var flt = off.createBiquadFilter();
        flt.type = L.filt;
        flt.frequency.value = Math.max(30, L.f);
        flt.Q.value = L.q || 0.7;
        envelope(g.gain, t0, L.g, 0.0008, L.dur);
        src.connect(flt); flt.connect(g); g.connect(off.destination);
        src.start(t0);
        src.stop(t0 + L.dur + 0.02);
      } else {
        var osc = off.createOscillator();
        osc.type = L.wave;
        var detune = 1 + (Math.random() - 0.5) * (L.k === 'metal' ? 0.03 : 0.01);
        osc.frequency.setValueAtTime(Math.max(20, L.f0 * detune), t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, L.f1 * detune), t0 + L.dur * 0.85);
        envelope(g.gain, t0, L.g, 0.0012, L.dur);
        osc.connect(g); g.connect(off.destination);
        osc.start(t0);
        osc.stop(t0 + L.dur + 0.05);
      }
    }

    return off.startRendering().then(function (buffer) {
      normalize(buffer);
      return buffer;
    });
  }

  /* Peak-safe normalization + 1ms tail fade (no clipping, no end clicks). */
  function normalize(buffer) {
    var d = buffer.getChannelData(0);
    var peak = 0, i;
    for (i = 0; i < d.length; i++) { var a = Math.abs(d[i]); if (a > peak) peak = a; }
    if (peak > 0.98 && peak > 0) {
      var s = 0.98 / peak;
      for (i = 0; i < d.length; i++) d[i] *= s;
    }
    var fade = Math.min(64, d.length);
    for (i = 0; i < fade; i++) {
      d[d.length - 1 - i] *= i / fade;
    }
  }

  /* ---------------------------------------------------------------------
     SAMPLE PATH — rekaman switch asli (window.CLACK_SAMPLES)
     Payload base64 di-decode sekali per payload (cache), lalu dirender ulang
     per kelas tombol dengan rate/gain halus supaya tiap buffer tetap unik.
     --------------------------------------------------------------------- */
  var _sampleCache = {};
  var _source = {};

  function decodeSample(ctx, key, b64) {
    if (!_sampleCache[key]) {
      var bin = atob(b64);
      var n = bin.length;
      var bytes = new Uint8Array(n);
      for (var i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i);
      _sampleCache[key] = ctx.decodeAudioData(bytes.buffer).catch(function (err) {
        delete _sampleCache[key];
        throw err;
      });
    }
    return _sampleCache[key];
  }

  /* Satu render offline per pack: 12 slot ditaruh berurutan di timeline lalu
     dipotong jadi 12 AudioBuffer — jauh lebih cepat dari 12 render terpisah. */
  function sampleBank(sampleRate, pack) {
    var S = window.CLACK_SAMPLES;
    var slot = S && S.packs && S.packs[pack.id];
    if (!slot || !S.files) return null;
    var decoder = new OfflineAudioContext(1, 128, sampleRate);
    var specs = [];
    KEY_CLASSES.forEach(function (kc) {
      var m = SAMPLE_MOD[kc] || SAMPLE_MOD.char;
      [['press', 'press'], ['release', 'rel']].forEach(function (ph) {
        var ref = slot[ph[1]] && slot[ph[1]][kc];
        var b64 = ref && S.files[ref];
        if (!b64) return;
        specs.push({ kc: kc, phase: ph[0], ref: ref, b64: b64, rate: m.rate, gain: m.gain });
      });
    });
    if (specs.length !== KEY_CLASSES.length * 2) return null;
    return Promise.all(specs.map(function (s) {
      return decodeSample(decoder, s.ref, s.b64).then(function (buf) { s.buf = buf; return s; });
    })).then(function (list) {
      var GAP = Math.ceil(sampleRate * 0.012);
      var offset = GAP;
      list.forEach(function (s) {
        s.len = Math.max(64, Math.ceil(sampleRate * (s.buf.duration / s.rate + 0.02)));
        s.off = offset;
        offset += s.len + GAP;
      });
      var off = new OfflineAudioContext(1, offset + GAP, sampleRate);
      list.forEach(function (s) {
        var src = off.createBufferSource();
        src.buffer = s.buf;
        src.playbackRate.value = s.rate;
        var g = off.createGain();
        g.gain.value = s.gain;
        src.connect(g);
        g.connect(off.destination);
        src.start(s.off / sampleRate);
      });
      return off.startRendering().then(function (rendered) {
        var data = rendered.getChannelData(0);
        var bank = {};
        KEY_CLASSES.forEach(function (kc) { bank[kc] = { press: null, release: null }; });
        list.forEach(function (s) {
          var out = off.createBuffer(1, s.len, sampleRate);
          out.getChannelData(0).set(data.subarray(s.off, s.off + s.len));
          normalize(out);
          bank[s.kc][s.phase] = out;
        });
        return bank;
      });
    });
  }

  /* ---------------------------------------------------------------------
     BANK RENDER — one pack -> { char:{press,release}, space:{...}, ... }
     Rekaman asli dulu; kalau tidak lengkap -> profil sintesis pack tersebut.
     --------------------------------------------------------------------- */
  function synthBank(sampleRate, pack) {
    var jobs = [];
    KEY_CLASSES.forEach(function (kc) {
      var m = KEY_MOD[kc];

      var pressLayers = pack.press.map(function (L) { return adaptLayer(L, m); });
      if (m.rattle) {
        RATTLE_LAYERS.forEach(function (L) { pressLayers.push(adaptLayer(L, m)); });
      }
      jobs.push(
        renderSound(sampleRate, pressLayers).then(function (buf) {
          return { kc: kc, phase: 'press', buf: buf };
        })
      );

      if (pack.rel) {
        var relLayers = pack.rel.map(function (L) { return adaptLayer(L, m); });
        jobs.push(
          renderSound(sampleRate, relLayers).then(function (buf) {
            return { kc: kc, phase: 'release', buf: buf };
          })
        );
      }
    });

    return Promise.all(jobs).then(function (results) {
      var bank = {};
      KEY_CLASSES.forEach(function (kc) { bank[kc] = { press: null, release: null }; });
      results.forEach(function (r) { bank[r.kc][r.phase] = r.buf; });
      return bank;
    });
  }

  /* Rekaman asli dulu; kalau tidak lengkap/gagal -> sintesis. Sumber dicatat
     per pack (dipakai QA dan bisa ditampilkan di UI). */
  function renderBank(sampleRate, pack) {
    var real = sampleBank(sampleRate, pack);
    if (!real) {
      _source[pack.id] = 'synth';
      return synthBank(sampleRate, pack);
    }
    return real.then(function (bank) {
      if (bank) {
        _source[pack.id] = 'samples';
        return bank;
      }
      _source[pack.id] = 'synth';
      return synthBank(sampleRate, pack);
    }).catch(function () {
      _source[pack.id] = 'synth';
      return synthBank(sampleRate, pack);
    });
  }

  /* Render every bank. onProgress(index, pack, doneCount, total) */
  function renderAll(sampleRate, onProgress) {
    var banks = {};
    var chain = Promise.resolve();
    var done = 0;
    PACKS.forEach(function (pack, i) {
      chain = chain.then(function () {
        return renderBank(sampleRate, pack).then(function (bank) {
          banks[pack.id] = bank;
          done++;
          if (onProgress) onProgress(i, pack, done, PACKS.length);
        });
      });
    });
    return chain.then(function () { return banks; });
  }

  return {
    PACKS: PACKS,
    KEY_CLASSES: KEY_CLASSES,
    KEY_MOD: KEY_MOD,
    SAMPLE_MOD: SAMPLE_MOD,
    source: _source,
    classify: classify,
    renderAll: renderAll
  };
})();
