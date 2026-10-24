/* ==========================================================================
   CLACKIFY® — APP.JS
   UNIT D-01 — INTERFACE / TELEMETRY / KEY CAPTURE
   --------------------------------------------------------------------------
   [01] typing range      [02] control module     [03] key matrix
   [04] output scope      [05] telemetry          [06] data integrity
   [07] sample bank matrix [08] specifications
   ========================================================================== */

(function () {
  'use strict';

  /* error collector (used by automated QA) */
  window.__errs = [];
  window.addEventListener('error', function (e) { window.__errs.push(String(e.message)); });
  window.addEventListener('unhandledrejection', function (e) { window.__errs.push('REJECT: ' + String(e.reason)); });

  var $ = function (id) { return document.getElementById(id); };
  var engine = new ClackEngine();
  var synth = ClackSynth;

  /* ---------------------------------------------------------------------
     STATE
     --------------------------------------------------------------------- */
  var state = {
    engaged: false,
    power: true,
    guard: true,          // mute during sensitive inputs
    repeat: true,         // key repeat suppression
    hpOnly: false,
    hpDetected: false,
    hpUnverified: false,
    hpBlocked: false,
    events: 0,
    suppressed: 0,
    dispatch: [],         // rolling dispatch latencies (ms)
    handlerCost: [],      // rolling handler cost (ms)
    ring: []
  };

  /* =====================================================================
     [00] BOOT SEQUENCE
     ===================================================================== */
  var BOOT_PRE = [
    ['CLACKIFY BIOS v2.6.0 — (C) 1968-2026 CLACKIFY SYSTEMS DIV.', 'ok'],
    ['CPU: VIRTUAL CORE ................. <b>OK</b>', 'ok'],
    ['RAM: 64K CONVENTIONAL ............. <b>OK</b>', 'ok'],
    ['KEY HOOK / IN-PAGE CAPTURE ........ <b>OK</b>', 'ok'],
    ['PRIVACY GATE / ZERO PERSISTENCE ... <b>ARMED</b>', 'ok'],
    ['RENDER SAMPLE BANKS:', 'ok']
  ];

  function bootLine(text, cls) {
    var log = $('bootLog');
    var div = document.createElement('div');
    div.className = cls || '';
    div.innerHTML = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function bootSequence() {
    var preDone = false;
    var queue = [];

    function flush() {
      while (queue.length) bootLine(queue.shift(), 'ok');
    }
    function enqueue(html) {
      queue.push(html);
      if (preDone) flush();
    }

    var i = 0;
    var t = setInterval(function () {
      if (i >= BOOT_PRE.length) { clearInterval(t); preDone = true; flush(); return; }
      bootLine(BOOT_PRE[i][0], BOOT_PRE[i][1]);
      i++;
    }, 55);

    engine.boot(function (idx, pack, done, total) {
      enqueue('&nbsp;&nbsp;[' + pack.code + '] ' + pack.name + ' ' + dots(pack.name.length) + ' <b>OK</b>');
      $('bootBar').style.width = Math.round((done / total) * 92) + '%';
    }).then(function () {
      enqueue('AUDIO STREAM CALIBRATION .......... <b>OK</b>');
      enqueue('STATUS: ALL SYSTEMS NOMINAL — AWAITING USER ENGAGEMENT');
      $('bootBar').style.width = '100%';
      $('bootHint').innerHTML = 'READY — CLICK OR PRESS ANY KEY';
      var btn = $('engage');
      btn.disabled = false;
      btn.focus();
    }).catch(function (err) {
      bootLine('FAULT: ' + err.message, 'bad');
      $('bootHint').innerHTML = 'AUDIO SUBSYSTEM FAULT — CHECK CONSOLE';
    });
  }

  function dots(n) {
    var len = Math.max(3, 24 - n);
    return new Array(len).join('.');
  }

  function engage() {
    if ($('engage').disabled) return;
    if ($('boot').classList.contains('done')) return;
    engine.engage().then(function () {
      state.engaged = true;
      var boot = $('boot');
      boot.classList.add('flash');
      setTimeout(function () { boot.classList.add('done'); }, 150);
      setStatus();
      refreshOutputs();
      var pad = $('testPad');
      pad.focus();
      startLoops();
    });
  }

  /* =====================================================================
     [01] KEY CAPTURE — the hot path
     ===================================================================== */
  function isSensitiveFocus() {
    var ae = document.activeElement;
    if (!ae || ae.tagName !== 'INPUT') return false;
    return ae.type === 'password' || ae.dataset.sensitive !== undefined;
  }

  function hotkeyOf(e) {
    if (!e.ctrlKey || !e.altKey) return null;
    if (e.code === 'KeyC') return 'power';
    if (e.code === 'KeyM') return 'guard';
    /* Ctrl+Alt+1..9 -> bank 1..9, Ctrl+Alt+0 -> bank 10 */
    var m = /^Digit([0-9])$/.exec(e.code);
    if (m) return 'pack:' + ((parseInt(m[1], 10) + 9) % 10);
    return null;
  }

  function handleHotkey(hk) {
    if (hk === 'power') { togglePower(); return; }
    if (hk === 'guard') { $('tglGuard').checked = !$('tglGuard').checked; $('tglGuard').dispatchEvent(new Event('change')); return; }
    if (hk.indexOf('pack:') === 0) {
      var idx = parseInt(hk.split(':')[1], 10);
      var pack = synth.PACKS[idx];
      if (pack) selectPack(pack.id);
    }
  }

  function onKeyDown(e) {
    var t0 = performance.now();

    var hk = hotkeyOf(e);
    if (hk) { e.preventDefault(); handleHotkey(hk); return; }

    var padFocused = (document.activeElement === $('testPad'));
    if (padFocused && (e.code === 'Space' || e.code === 'Tab' || e.code === 'Backspace')) e.preventDefault();
    if (padFocused && e.code === 'Escape') { $('testPad').blur(); return; }

    var sensitive = state.guard && isSensitiveFocus();
    var blocked = !state.engaged || !state.power || state.hpBlocked || sensitive;

    if (e.repeat && state.repeat) { state.suppressed++; return; }

    var kc = synth.classify(e.code);

    if (!blocked) {
      var meta = engine.trigger(kc, 'press');
      if (meta) {
        state.events++;
        paintKey(e.code, true, kc === 'space' || kc === 'enter' || kc === 'backspace');
        updateReadout(e, kc, meta, 'press');
        pushRing(e.code, kc);
        feedTypingTest(e);
      }
    } else if (state.engaged) {
      state.suppressed++;
    }

    /* dispatch latency: OS event timestamp -> handler execution */
    var d = t0 - e.timeStamp;
    if (d >= 0 && d < 250) { state.dispatch.push(d); if (state.dispatch.length > 40) state.dispatch.shift(); }

    var cost = performance.now() - t0;
    state.handlerCost.push(cost);
    if (state.handlerCost.length > 80) state.handlerCost.shift();
  }

  function onKeyUp(e) {
    var sensitive = state.guard && isSensitiveFocus();
    var blocked = !state.engaged || !state.power || state.hpBlocked || sensitive;
    paintKey(e.code, false);

    if (blocked || (e.repeat && state.repeat)) return;
    var kc = synth.classify(e.code);
    var meta = engine.trigger(kc, 'release');
    if (meta) {
      state.events++;
      updateReadout(e, kc, meta, 'release');
    }
  }

  /* =====================================================================
     [02] CONTROL MODULE
     ===================================================================== */
  function buildPackList() {
    var list = $('packList');
    $('packCount').textContent = synth.PACKS.length;
    synth.PACKS.forEach(function (p) {
      var label = document.createElement('label');
      label.className = 'pack-row';
      label.innerHTML =
        '<input type="radio" name="pack" value="' + p.id + '">' +
        '<span class="mark" aria-hidden="true">[ ]</span>' +
        '<span class="pid">' + p.code + '</span>' +
        '<span class="pname">' + p.name + '<span class="ptag">· ' + p.profile + '</span></span>';
      label.title = p.name + ' — ' + p.tag + ' · ' + p.profile;
      label.querySelector('input').addEventListener('change', function () { selectPack(p.id); });
      list.appendChild(label);
    });
  }

  function selectPack(id) {
    engine.setPack(id);
    var pack = synth.PACKS.filter(function (p) { return p.id === id; })[0];
    if (!pack) return;
    var radios = document.querySelectorAll('#packList input');
    radios.forEach(function (r) { r.checked = (r.value === id); });
    var rows = document.querySelectorAll('#matrixBody tr');
    rows.forEach(function (r) { r.classList.toggle('sel', r.dataset.pack === id); });
    $('tickerPack').textContent = 'BANK ' + pack.code + ' ' + pack.name;
    $('trayPack').textContent = pack.code + ' ' + pack.name.split(' ')[0];
    $('padBank').textContent = pack.code + ' ' + pack.name;
    /* Sengaja TIDAK ada preview saat ganti pack. Satu-satunya sumber suara
       di app ini adalah keydown/keyup fisik (press + release) — tidak ada SFX UI. */
  }

  function togglePower() {
    state.power = !state.power;
    engine.setVolume(state.power ? parseInt($('volume').value, 10) / 100 : 0);
    var btn = $('powerBtn');
    btn.setAttribute('aria-pressed', String(state.power));
    btn.textContent = 'POWER [ ' + (state.power ? 'ON' : 'OFF') + ' ]';
    setStatus();
    updateHpStatus();
  }

  function setStatus() {
    var s = $('sysStatus'), led = $('led');
    led.className = 'led';
    if (!state.engaged) { s.textContent = 'AUDIO SUBSYSTEM: STANDBY'; return; }
    if (!state.power) { s.textContent = 'AUDIO SUBSYSTEM: HALTED'; led.classList.add('mute'); return; }
    if (state.hpBlocked) { s.textContent = 'AUDIO SUBSYSTEM: HP GATE BLOCKED'; led.classList.add('mute'); return; }
    if (state.guard && isSensitiveFocus()) { s.textContent = 'AUDIO SUBSYSTEM: GUARD MUTE'; led.classList.add('mute'); return; }
    s.textContent = 'AUDIO SUBSYSTEM: ACTIVE';
    led.classList.add('on');
  }

  /* =====================================================================
     [03] KEY MATRIX — 60% visualizer
     ===================================================================== */
  var KB_ROWS = [
    [['ESC', 'Escape', 1], ['1', 'Digit1', 1], ['2', 'Digit2', 1], ['3', 'Digit3', 1], ['4', 'Digit4', 1],
     ['5', 'Digit5', 1], ['6', 'Digit6', 1], ['7', 'Digit7', 1], ['8', 'Digit8', 1], ['9', 'Digit9', 1],
     ['0', 'Digit0', 1], ['-', 'Minus', 1], ['=', 'Equal', 1], ['BACKSPACE', 'Backspace', 2]],
    [['TAB', 'Tab', 1.5], ['Q', 'KeyQ', 1], ['W', 'KeyW', 1], ['E', 'KeyE', 1], ['R', 'KeyR', 1],
     ['T', 'KeyT', 1], ['Y', 'KeyY', 1], ['U', 'KeyU', 1], ['I', 'KeyI', 1], ['O', 'KeyO', 1],
     ['P', 'KeyP', 1], ['[', 'BracketLeft', 1], [']', 'BracketRight', 1], ['\\', 'Backslash', 1.5]],
    [['CAPS', 'CapsLock', 1.75], ['A', 'KeyA', 1], ['S', 'KeyS', 1], ['D', 'KeyD', 1], ['F', 'KeyF', 1],
     ['G', 'KeyG', 1], ['H', 'KeyH', 1], ['J', 'KeyJ', 1], ['K', 'KeyK', 1], ['L', 'KeyL', 1],
     [';', 'Semicolon', 1], ["'", 'Quote', 1], ['ENTER', 'Enter', 2.25]],
    [['SHIFT', 'ShiftLeft', 2.25], ['Z', 'KeyZ', 1], ['X', 'KeyX', 1], ['C', 'KeyC', 1], ['V', 'KeyV', 1],
     ['B', 'KeyB', 1], ['N', 'KeyN', 1], ['M', 'KeyM', 1], [',', 'Comma', 1], ['.', 'Period', 1],
     ['/', 'Slash', 1], ['SHIFT', 'ShiftRight', 2.75]],
    [['CTRL', 'ControlLeft', 1.25], ['WIN', 'MetaLeft', 1.25], ['ALT', 'AltLeft', 1.25], ['', 'Space', 6.25],
     ['ALT', 'AltRight', 1.25], ['WIN', 'MetaRight', 1.25], ['MENU', 'ContextMenu', 1.25], ['CTRL', 'ControlRight', 1.25]]
  ];

  var SPECIAL = { Space: 1, Enter: 1, Backspace: 1 };
  var keyEls = {};

  function buildKeyboard() {
    var kb = $('kb');
    KB_ROWS.forEach(function (row, ri) {
      var rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      row.forEach(function (k) {
        var el = document.createElement('div');
        el.className = 'kcap' + (k[0].length > 2 ? ' wide' : '');
        el.style.gridColumn = 'span ' + Math.round(k[2] * 4);
        el.textContent = k[0];
        if (k[1]) { keyEls[k[1]] = el; }
        rowEl.appendChild(el);
      });
      kb.appendChild(rowEl);
    });
    /* NAV layer cluster (inverted T, right aligned) */
    var nav = document.createElement('div');
    nav.className = 'kb-row';
    [['↑', 'ArrowUp', 53], ['←', 'ArrowLeft', 49], ['↓', 'ArrowDown', 53], ['→', 'ArrowRight', 57]].forEach(function (k, i) {
      var el = document.createElement('div');
      el.className = 'kcap';
      el.style.gridColumn = k[2] + ' / span 4';
      el.textContent = k[0];
      keyEls[k[1]] = el;
      nav.appendChild(el);
    });
    kb.appendChild(nav);

    var legend = document.createElement('div');
    legend.className = 'kb-legend';
    legend.innerHTML = '<span><i class="sw-phos"></i>ALPHA / NAV</span><span><i class="sw-red"></i>STABILIZER CLASS (SPACE / ENTER / BKSP)</span><span>NAV LAYER: FN ARROWS</span>';
    kb.appendChild(legend);
  }

  function paintKey(code, on, special) {
    var el = keyEls[code];
    if (!el) return;
    if (on) { el.classList.add('active'); if (special || SPECIAL[code]) el.classList.add('special'); }
    else { el.classList.remove('active'); }
  }

  function clearKeys() {
    Object.keys(keyEls).forEach(function (c) {
      keyEls[c].classList.remove('active', 'special');
    });
  }

  /* =====================================================================
     [04] EVENT READOUT + VOLATILE RING BUFFER
     ===================================================================== */
  function keyLabel(e) {
    if (e.key === ' ') return 'SPACE';
    if (e.key && e.key.length === 1) return e.key.toUpperCase();
    return (e.key || e.code).toUpperCase();
  }

  function updateReadout(e, kc, meta, phase) {
    var arrow = (phase === 'press') ? '▲ ' : '▼ ';
    var outKey = $('evKey');
    outKey.textContent = arrow + keyLabel(e);
    outKey.className = phase;
    $('evCode').textContent = e.code;
    $('evClass').textContent = kc.toUpperCase();
    var d = state.dispatch.length ? state.dispatch[state.dispatch.length - 1] : 0;
    $('evDelta').textContent = d.toFixed(2) + ' MS';
    $('evRate').textContent = (meta.rate >= 1 ? '+' : '') + ((meta.rate - 1) * 100).toFixed(2) + '%';
    $('evVoice').textContent = meta.voiceMs + ' MS';
    $('padFeed').textContent = arrow + keyLabel(e) + ' · ' + kc.toUpperCase() + ' · ' + meta.voiceMs + 'MS';
  }

  function pushRing(code, kc) {
    var now = new Date();
    var ts = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()) + '.' + ('00' + now.getMilliseconds()).slice(-3);
    state.ring.unshift({ ts: ts, code: code, kc: kc });
    if (state.ring.length > 6) state.ring.pop();
    renderRing();
  }

  function renderRing() {
    var ol = $('volatile');
    ol.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var li = document.createElement('li');
      var r = state.ring[i];
      if (r) {
        li.className = (i === 0) ? 'new' : '';
        li.innerHTML = '<b>' + r.ts + '</b><span>' + r.code + ' / ' + r.kc.toUpperCase() + '</span>';
      } else {
        li.innerHTML = '<b>--:--:--.---</b><span>EMPTY SLOT</span>';
      }
      ol.appendChild(li);
    }
  }

  /* =====================================================================
     [05] TELEMETRY LOOP
     ===================================================================== */
  function avg(arr) {
    if (!arr.length) return 0;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }

  function telemetryTick() {
    if (!engine.ctx) return;
    var lat = engine.latency();
    var disp = avg(state.dispatch);
    var total = (lat.base + lat.output) * 1000 + disp;
    $('tSampleRate').textContent = engine.ctx.sampleRate;
    $('tBuffer').textContent = engine.bufferFrames();
    $('tBase').textContent = (lat.base * 1000).toFixed(2);
    $('tOutput').textContent = (lat.output * 1000).toFixed(2);
    $('tDispatch').textContent = disp.toFixed(2);
    var totalOut = $('tTotal');
    totalOut.textContent = total.toFixed(2);
    totalOut.classList.toggle('over', total >= 15);
    $('tVoices').textContent = engine.activeVoices;
    $('tEvents').textContent = state.events;
    $('tSuppressed').textContent = state.suppressed;
    $('tProc').textContent = ((avg(state.handlerCost) / 16.667) * 100).toFixed(2);
  }

  /* =====================================================================
     [04b] SCOPE + METERS
     ===================================================================== */
  var scopeBuf = new Float32Array(2048);
  var scopeCanvas, scopeCtx, scopeGain = 1, scopeGainEl;

  function drawScope() {
    if (!scopeCanvas) return;
    var w = scopeCanvas.clientWidth, h = scopeCanvas.clientHeight;
    var dpr = window.devicePixelRatio || 1;
    if (scopeCanvas.width !== Math.round(w * dpr) || scopeCanvas.height !== Math.round(h * dpr)) {
      scopeCanvas.width = Math.round(w * dpr);
      scopeCanvas.height = Math.round(h * dpr);
    }
    var c = scopeCtx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#0A0A0A';
    c.fillRect(0, 0, w, h);

    /* grid */
    c.strokeStyle = '#1C1C1C';
    c.lineWidth = 1;
    for (var i = 1; i < 8; i++) {
      var x = Math.round((w / 8) * i) + 0.5;
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
    }
    for (var j = 1; j < 4; j++) {
      var y = Math.round((h / 4) * j) + 0.5;
      c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
    }
    c.strokeStyle = '#2A2A2A';
    c.beginPath(); c.moveTo(0, Math.round(h / 2) + 0.5); c.lineTo(w, Math.round(h / 2) + 0.5); c.stroke();

    if (engine.analyser) {
      engine.scopeData(scopeBuf);
      /* auto-range: keep the trace readable across the full dynamic range */
      var mx = 0;
      for (var m = 0; m < scopeBuf.length; m++) { var av = Math.abs(scopeBuf[m]); if (av > mx) mx = av; }
      scopeGain = mx > 0.012 ? Math.min(3.2, 0.82 / mx) : 1;
      if (scopeGainEl) scopeGainEl.textContent = '×' + scopeGain.toFixed(2);
      /* phosphor trace, 2 passes (body + glow) */
      for (var pass = 0; pass < 2; pass++) {
        c.beginPath();
        c.strokeStyle = pass === 0 ? 'rgba(234,234,234,0.18)' : '#EAEAEA';
        c.lineWidth = pass === 0 ? 3 : 1;
        for (var k = 0; k < scopeBuf.length; k++) {
          var xx = (k / (scopeBuf.length - 1)) * w;
          var yy = (h / 2) - scopeBuf[k] * scopeGain * (h / 2) * 0.92;
          if (k === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy);
        }
        c.stroke();
      }
    }
  }

  function drawMeters() {
    var lv = engine.level();
    var rmsPct = Math.min(100, Math.sqrt(lv.rms) * 140);
    $('rmsBar').style.width = rmsPct.toFixed(1) + '%';
    var db = lv.rms > 1e-5 ? (20 * Math.log10(lv.rms)).toFixed(1) : '-∞';
    $('rmsOut').textContent = db + ' DB';
    var vPct = (engine.activeVoices / ClackEngine.MAX_VOICES) * 100;
    $('voiceBar').style.width = vPct.toFixed(1) + '%';
    $('voiceOut').textContent = engine.activeVoices + ' / ' + ClackEngine.MAX_VOICES;

    /* topbar signal bars */
    var bars = $('signalBars').children;
    for (var i = 0; i < bars.length; i++) {
      var on = (lv.peak * 100) > (i * 18);
      bars[i].style.background = on ? '#EAEAEA' : '#333333';
    }
  }

  /* =====================================================================
     [06] TYPING RANGE — WPM TEST
     ===================================================================== */
  var VOCAB = ('cargo build release deploy commit branch merge rebase stash fetch push pull request review refactor lint format test debug stack heap thread async await closure borrow mutex channel buffer stream socket kernel daemon latency jitter sample switch keycap stabilizer gasket mount linear tactile clicky solenoid actuator telemetry protocol dispatch matrix phosphor raster halftone console terminal command shell script module package registry pipeline cache memory register vector pointer struct enum trait impl match loop yield return yield static const type where unsafe crate macro token parser lexer runtime compiler assembler bootloader firmware circuit voltage signal clock cycle frame buffer thread pool queue index cursor node graph tree hash map list array slice tuple option result error panic unwind unwind profile flame graph trace span metric log audit patch diff hunk blame clone remote origin upstream').split(/\s+/);

  var TEST = {
    stream: [],
    wi: 0,
    ci: 0,
    correct: 0,
    errors: 0,
    keystrokes: 0,
    start: null
  };

  function makeWords(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(VOCAB[Math.floor(Math.random() * VOCAB.length)]);
    return out;
  }

  function newStream() {
    TEST.stream = makeWords(30).map(function (w) { return { text: w, states: [] }; });
    TEST.wi = 0;
    TEST.ci = 0;
    TEST.correct = 0;
    TEST.errors = 0;
    TEST.keystrokes = 0;
    TEST.start = null;
    renderStream();
    updateTestStats();
  }

  function renderStream() {
    var box = $('wordStream');
    box.innerHTML = '';
    TEST.stream.forEach(function (w, wi) {
      var span = document.createElement('span');
      span.className = 'word' + (wi < TEST.wi ? ' done' : '');
      for (var ci = 0; ci < w.text.length; ci++) {
        var ch = document.createElement('span');
        ch.className = 'ch ' + (w.states[ci] || '');
        if (wi === TEST.wi && ci === TEST.ci) ch.className += ' cur';
        ch.textContent = w.text[ci];
        span.appendChild(ch);
      }
      if (wi === TEST.wi && TEST.ci >= w.text.length) {
        var tail = document.createElement('span');
        tail.className = 'ch cur';
        tail.textContent = '·';
        span.appendChild(tail);
      }
      box.appendChild(span);
    });
  }

  function renderCurrentWord() {
    var words = $('wordStream').children;
    var w = TEST.stream[TEST.wi];
    if (!w || !words[TEST.wi]) { renderStream(); return; }
    var span = words[TEST.wi];
    span.innerHTML = '';
    for (var ci = 0; ci < w.text.length; ci++) {
      var ch = document.createElement('span');
      ch.className = 'ch ' + (w.states[ci] || '');
      if (ci === TEST.ci) ch.className += ' cur';
      ch.textContent = w.text[ci];
      span.appendChild(ch);
    }
    if (TEST.ci >= w.text.length) {
      var tail = document.createElement('span');
      tail.className = 'ch cur';
      tail.textContent = '·';
      span.appendChild(tail);
    }
  }

  function feedTypingTest(e) {
    var pad = $('testPad');
    if (document.activeElement !== pad) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var w = TEST.stream[TEST.wi];
    if (!w) return;
    if (!TEST.start) TEST.start = performance.now();

    if (e.key === ' ') {
      TEST.keystrokes++;
      if (TEST.ci < w.text.length) { TEST.errors++; w.states[TEST.ci] = 'bad'; }
      w.done = true;
      TEST.wi++;
      TEST.ci = 0;
      var next = TEST.stream[TEST.wi];
      if (next) next.states = next.states || [];
      if (TEST.wi >= 16) {
        TEST.stream = TEST.stream.slice(8).concat(makeWords(8).map(function (t) { return { text: t, states: [] }; }));
        TEST.wi -= 8;
      }
      renderStream();
    } else if (e.key === 'Backspace') {
      if (TEST.ci > 0) {
        TEST.ci--;
        TEST.keystrokes++;
        w.states[TEST.ci] = '';
        renderCurrentWord();
      }
    } else if (e.key && e.key.length === 1) {
      if (TEST.ci < w.text.length) {
        var ok = (e.key.toLowerCase() === w.text[TEST.ci].toLowerCase());
        w.states[TEST.ci] = ok ? 'ok' : 'bad';
        if (ok) TEST.correct++; else TEST.errors++;
        TEST.ci++;
        TEST.keystrokes++;
        renderCurrentWord();
      }
    }
    updateTestStats();
  }

  function updateTestStats() {
    var elapsed = TEST.start ? (performance.now() - TEST.start) / 1000 : 0;
    var minutes = elapsed / 60;
    var wpm = minutes > 0.016 ? Math.round((TEST.correct / 5) / minutes) : 0;
    var acc = TEST.keystrokes ? (TEST.correct / TEST.keystrokes) * 100 : 100;
    $('wpm').textContent = wpm;
    $('acc').textContent = acc.toFixed(1);
    $('err').textContent = TEST.errors;
    $('elapsed').textContent = elapsed.toFixed(1);
  }

  /* =====================================================================
     [07] SAMPLE BANK MATRIX TABLE
     ===================================================================== */
  function buildMatrix() {
    var tb = $('matrixBody');
    synth.PACKS.forEach(function (p) {
      var tr = document.createElement('tr');
      tr.dataset.pack = p.id;
      tr.innerHTML =
        '<td>&gt;&gt;&gt;</td>' +
        '<td class="mut">' + p.code + '</td>' +
        '<td class="sw">' + p.name + '</td>' +
        '<td class="mut">' + p.character.toUpperCase() + '</td>' +
        '<td class="mut">' + p.bodyHz + '</td>' +
        '<td class="mut">' + p.clickHz + '</td>' +
        '<td class="mut">' + p.release + '</td>' +
        '<td class="mut">' + p.profile + '</td>';
      tr.addEventListener('click', function () { selectPack(p.id); });
      tb.appendChild(tr);
    });
  }

  /* =====================================================================
     [08] HEADPHONE GATE
     ===================================================================== */
  function refreshOutputs() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      state.hpUnverified = true; updateHpStatus(); return;
    }
    navigator.mediaDevices.enumerateDevices().then(function (devs) {
      var outs = devs.filter(function (d) { return d.kind === 'audiooutput'; });
      var labeled = outs.filter(function (d) { return !!d.label; });
      var hp = outs.filter(function (d) { return /head|ear|bud|airpod/i.test(d.label || ''); })[0];
      state.hpDetected = !!hp;
      state.hpUnverified = labeled.length === 0;
      var def = outs.filter(function (d) { return d.deviceId === 'default'; })[0];
      if (def && def.label) $('devOut').textContent = def.label.toUpperCase();
      updateHpStatus();
    }).catch(function () {
      state.hpUnverified = true;
      updateHpStatus();
    });
  }

  function updateHpStatus() {
    var el = $('hpStatus');
    el.className = 'flagline';
    if (!state.hpOnly) {
      el.textContent = 'HP GATE: DISABLED — PLAYBACK ALWAYS ON';
      state.hpBlocked = false;
      setStatus();
      return;
    }
    if (state.hpDetected) {
      el.textContent = 'HP GATE: OPEN — HEADPHONE DETECTED';
      el.classList.add('ok');
      state.hpBlocked = false;
    } else if (state.hpUnverified) {
      el.textContent = 'HP GATE: UNVERIFIED — DEVICE LABELS MASKED';
      el.classList.add('warn');
      state.hpBlocked = false;
    } else {
      el.textContent = 'HP GATE: BLOCKED — NO HEADPHONE ON BUS';
      el.classList.add('warn');
      state.hpBlocked = true;
    }
    setStatus();
  }

  /* =====================================================================
     [09] WIRING
     ===================================================================== */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function startLoops() {
    setInterval(function () {
      var d = new Date();
      $('clock').textContent = pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds());
    }, 1000);

    setInterval(telemetryTick, 100);
    setInterval(updateTestStats, 400);

    (function frame() {
      drawScope();
      drawMeters();
      requestAnimationFrame(frame);
    })();
  }

  function wire() {
    $('engage').addEventListener('click', engage);
    window.addEventListener('keydown', function (e) {
      if ($('boot').classList.contains('done')) return;
      if ($('engage').disabled) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key.length === 1) engage();
    }, true);

    $('powerBtn').addEventListener('click', togglePower);

    $('volume').addEventListener('input', function () {
      var v = parseInt(this.value, 10);
      $('volumeOut').textContent = v;
      $('trayVol').textContent = '▸ ' + v + '%';
      if (state.power) engine.setVolume(v / 100);
    });

    $('pitchVar').addEventListener('input', function () {
      var v = parseFloat(this.value);
      engine.pitchVar = v;
      $('pitchOut').textContent = '±' + v.toFixed(1) + '%';
    });

    $('tglRepeat').addEventListener('change', function () { state.repeat = this.checked; });
    $('tglGuard').addEventListener('change', function () {
      state.guard = this.checked;
      updateGuardFlag();
      setStatus();
    });
    $('tglHeadphone').addEventListener('change', function () {
      state.hpOnly = this.checked;
      if (state.hpOnly) refreshOutputs(); else updateHpStatus();
    });

    $('resetTest').addEventListener('click', function () { newStream(); $('testPad').focus(); });
    $('clearRing').addEventListener('click', function () { state.ring = []; renderRing(); });

    var pad = $('testPad');
    pad.addEventListener('focus', function () { pad.classList.add('armed'); $('testHint').style.display = 'none'; });
    pad.addEventListener('blur', function () { pad.classList.remove('armed'); $('testHint').style.display = ''; });
    pad.addEventListener('click', function () { pad.focus(); });

    var sf = $('sensitiveField');
    sf.addEventListener('focus', function () { updateGuardFlag(); setStatus(); });
    sf.addEventListener('blur', function () { updateGuardFlag(); setStatus(); });

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', clearKeys);
  }

  function updateGuardFlag() {
    var el = $('guardFlag');
    el.className = 'flagline';
    if (isSensitiveFocus()) {
      if (state.guard) { el.textContent = 'GUARD: ACTIVE — AUDIO MUTED'; el.classList.add('warn'); }
      else { el.textContent = 'GUARD: BYPASSED — AUDIO LIVE (NOT RECOMMENDED)'; el.classList.add('warn'); }
    } else {
      el.textContent = 'GUARD: STANDBY — NO SENSITIVE FIELD FOCUSED';
    }
  }

  /* =====================================================================
     BOOTSTRAP
     ===================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    scopeCanvas = $('scope');
    scopeCtx = scopeCanvas.getContext('2d');
    scopeGainEl = $('scopeGain');
    buildPackList();
    buildKeyboard();
    buildMatrix();
    renderRing();
    wire();
    selectPack('alpaca');
    newStream();
    bootSequence();
    updateGuardFlag();
    $('tVoicesMax').textContent = ClackEngine.MAX_VOICES;
    /* clock starts immediately so the topbar is never blank */
    var d = new Date();
    $('clock').textContent = pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds());
  });

  /* debug / QA hook */
  window.CLACK = {
    state: state,
    engine: engine,
    synth: synth,
    test: TEST,
    selectPack: selectPack,
    press: function (code, key, mods) {
      mods = mods || {};
      onKeyDown({
        code: code, key: key || '', timeStamp: performance.now(),
        repeat: !!mods.repeat,
        ctrlKey: !!mods.ctrl, altKey: !!mods.alt, shiftKey: !!mods.shift, metaKey: !!mods.meta,
        preventDefault: function () {}
      });
    },
    release: function (code, key, mods) {
      mods = mods || {};
      onKeyUp({
        code: code, key: key || '', timeStamp: performance.now(),
        repeat: false,
        ctrlKey: !!mods.ctrl, altKey: !!mods.alt, shiftKey: !!mods.shift, metaKey: !!mods.meta
      });
    }
  };
})();
