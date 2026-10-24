/* =====================================================================
   CLACKIFY — BRIDGE CLIENT
   Menghubungkan halaman ke helper lokal (bridge/clack-bridge.py) lewat SSE.
   Helper membaca keyboard GLOBAL (di luar browser); halaman ini memainkan
   suaranya. Halaman boleh duduk di tab belakang — audio tetap jalan.

   Aturan anti-dobel: bila halaman ini sendiri yang sedang fokus, event dari
   helper DIABAIKAN, karena keydown asli halaman sudah membunyikannya.
   ===================================================================== */
(function () {
  'use strict';

  var ENDPOINT = 'http://127.0.0.1:8091/events';

  var st = {
    enabled: false,
    status: 'OFF',          /* OFF | CONNECTING | LIVE | OFFLINE */
    events: 0,
    skipped: 0,
    errors: 0,
    deltas: [],
    last: null,
    forceBackground: false  /* hook QA: paksa mode "di belakang" */
  };

  var es = null;
  var tick = null;                 /* penyegar status berkala (counter & Δ tetap hidup) */

  function $(id) { return document.getElementById(id); }

  function avg(a) {
    if (!a.length) return 0;
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i];
    return s / a.length;
  }

  function inBackground() {
    return st.forceBackground || !document.hasFocus();
  }

  function refresh() {
    var out = $('hookOut');
    if (out) out.textContent = st.status;

    var btn = $('hookBtn');
    if (btn) {
      btn.textContent = st.enabled ? '[ DISCONNECT ]' : '[ CONNECT BRIDGE ]';
      btn.setAttribute('aria-pressed', st.enabled ? 'true' : 'false');
    }

    var el = $('hookStatus');
    if (!el) return;
    el.className = 'flagline';

    if (!st.enabled) {
      el.textContent = 'HOOK: DISCONNECTED — IN-PAGE CAPTURE ONLY';
      return;
    }
    if (st.status === 'LIVE') {
      el.textContent = 'HOOK: LIVE — ' + st.events + ' EVT · Δ ' + avg(st.deltas).toFixed(1) +
        ' MS · ' + (st.skipped ? st.skipped + ' DEDUPED' : 'BACKGROUND ONLY');
      el.classList.add('ok');
      return;
    }
    if (st.status === 'OFFLINE') {
      el.textContent = 'HOOK: HELPER OFFLINE — JALANKAN python bridge/clack-bridge.py';
      el.classList.add('warn');
      return;
    }
    el.textContent = 'HOOK: MENGHUBUNGI ' + ENDPOINT + ' …';
  }

  function deliver(evt) {
    if (!window.CLACK) return;
    if (!inBackground()) { st.skipped++; return; }

    var mods = {
      ctrl: !!evt.ctrl, alt: !!evt.alt, shift: !!evt.shift,
      meta: !!evt.meta, repeat: !!evt.repeat
    };

    if (evt.type === 'down') window.CLACK.press(evt.code, evt.key, mods);
    else window.CLACK.release(evt.code, evt.key, mods);

    st.events++;
    st.last = evt;
    if (typeof evt.t === 'number') {
      var d = Date.now() - evt.t;              /* helper & halaman satu mesin -> tanpa skew */
      if (d >= 0 && d < 2000) {
        st.deltas.push(d);
        if (st.deltas.length > 40) st.deltas.shift();
      }
    }
  }

  function connect() {
    if (es) return;
    st.enabled = true;
    st.status = 'CONNECTING';
    st.errors = 0;
    refresh();
    if (!tick) tick = setInterval(refresh, 500);

    try {
      es = new EventSource(ENDPOINT);
    } catch (e) {
      st.status = 'OFFLINE';
      refresh();
      return;
    }

    es.onopen = function () { st.status = 'LIVE'; st.errors = 0; refresh(); };

    es.onmessage = function (msg) {
      var evt;
      try { evt = JSON.parse(msg.data); } catch (e) { return; }
      if (evt.type === 'hello') { st.status = 'LIVE'; refresh(); return; }
      deliver(evt);
    };

    es.onerror = function () {
      st.errors++;
      /* EventSource mencoba sambung ulang sendiri; >=2 kegagalan = helper mati */
      st.status = (es && es.readyState === 2) ? 'OFFLINE' : (st.errors >= 2 ? 'OFFLINE' : 'CONNECTING');
      refresh();
    };
  }

  function disconnect() {
    if (es) { try { es.close(); } catch (e) {} es = null; }
    if (tick) { clearInterval(tick); tick = null; }
    st.enabled = false;
    st.status = 'OFF';
    refresh();
  }

  function wire() {
    var btn = $('hookBtn');
    if (btn) btn.addEventListener('click', function () { if (st.enabled) disconnect(); else connect(); });
    refresh();
  }

  /* debug / QA hook — sejajar dengan window.CLACK di app.js */
  window.CLACK_BRIDGE = {
    state: st,
    endpoint: ENDPOINT,
    connect: connect,
    disconnect: disconnect,
    refresh: refresh,
    setForceBackground: function (v) { st.forceBackground = !!v; refresh(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
