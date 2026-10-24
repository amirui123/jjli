/* Probe tools for the Hat page: live stats, diffraction panel, supertile
   level slider, "Copy scene". Built on David Ryan's map engine (MIT) through
   the small API added in engine/map.js (ask, camRef, viewArr, setProbe). */
(function () {
  'use strict';
  var page = window.hatPage;
  if (!page) return;
  var map = page.map;
  var PHI = (1 + Math.sqrt(5)) / 2, PHI4 = Math.pow(PHI, 4);
  var HALF = 120;                     // stats patch half-size, reference units (= 60 article units)
  var $ = function (id) { return document.getElementById(id); };
  var schemeEl = $('scheme'), ancEl = $('anc'), ancOut = $('anc-out'), ancRow = $('anc-row');
  var statsEl = $('stats'), statsBody = $('stats-body'), statsOn = $('stats-on');
  var diffEl = $('diff'), diffOn = $('diff-on'), diffCanvas = $('diff-canvas'), diffNote = $('diff-note');
  var ancLevel = 2, statsTimer = 0, statsSeq = 0, lastStats = null;
  var GRAIN_P = [0.5, 0.75, 1, 1.25, 1.5, Math.sqrt(3), 2, 2.5, 3, 4, 8], grainIdx = 5;
  var grainEl = $('grain'), grainOut = $('grain-out'), grainRow = $('grain-row');
  function setGrain(p) {
    var best = 0;
    GRAIN_P.forEach(function (q, i) { if (Math.abs(q - p) < Math.abs(GRAIN_P[best] - p)) best = i; });
    grainIdx = best; grainEl.value = best;
    grainOut.textContent = (Math.abs(GRAIN_P[best] - Math.sqrt(3)) < 1e-9 ? '√3' : GRAIN_P[best]) + ' article units';
    map.setProbe({ grainMul: 1024 / GRAIN_P[best] });
    map.changed();
  }
  grainEl.addEventListener('input', function () { setGrain(GRAIN_P[+grainEl.value]); });

  function scheme() { return map.scheme(); }
  function schemeChanged() {
    ancRow.hidden = scheme() !== 'ancestry';
    grainRow.hidden = scheme() !== 'grain';
    renderStats();
  }
  schemeEl.addEventListener('change', function () { setTimeout(schemeChanged, 0); });

  function setAnc(k) {
    ancLevel = Math.max(1, Math.min(5, k | 0));
    ancEl.value = ancLevel; ancOut.textContent = ancLevel;
    map.setProbe({ ancLevel: ancLevel });
    map.changed();
  }
  ancEl.addEventListener('input', function () { setAnc(+ancEl.value); });

  /* ------------------------------------------------------------ stats */
  function fmt(n) { return n.toLocaleString('en-GB'); }
  function pct(a, b) { return b ? (100 * a / b).toFixed(1) + '%' : '–'; }
  function row(k, v, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th>' + k + '</th><td>' + v + '</td></tr>'; }
  function renderStats() {
    if (statsEl.hidden) return;
    var s = lastStats;
    if (!s) { statsBody.innerHTML = '<p class="hint">Counting…</p>'; return; }
    var sc = scheme(), un = s.n - s.flips, h = '';
    h += '<p class="hint">Fixed patch: square of ' + (2 * s.half / 2) + ' × ' + (2 * s.half / 2) +
         ' article units (stack spacing √3) centred on the view, ' + fmt(s.n) + ' hats. Positions in the hat shape Tile(1, √3).</p><table>';
    var hot = function (ids) { return ids.indexOf(sc) >= 0 ? 'hot' : ''; };
    var fl = hot(['flipped', 'hands', 'molecule', 'roles', 'axes', 'shells', 'chains']);
    h += row('Flipped', fmt(s.flips) + ' of ' + fmt(s.n), fl);
    h += row('flipped / all', (s.flips / s.n).toFixed(4) + ' <span class="ref">1/(1+φ⁴) = ' + (1 / (1 + PHI4)).toFixed(4) + '</span>', fl);
    h += row('flipped / unflipped', (s.flips / un).toFixed(4) + ' <span class="ref">1/φ⁴ = ' + (1 / PHI4).toFixed(4) + '</span>', fl);
    var r = s.roles, rh = hot(['roles', 'molecule']);
    h += row('Roles H · T · P · F · H1', [r[0], r[1], r[2], r[3], r[4]].map(fmt).join(' · '), rh);
    h += row('3 × flips vs H', fmt(3 * s.flips) + ' vs ' + fmt(r[0]) + (3 * s.flips === r[0] ? ' ✓' : ' (patch edge)'), rh);
    h += row('3-shell tiles', fmt(s.mol) + (s.mol === 3 * s.flips ? ' = 3 × flips ✓' : ''), hot(['molecule']));
    var sh = hot(['stacks', 'chains']);
    h += row('Stacks: pairs · triples · longer', fmt(s.pairs) + ' · ' + fmt(s.triples) + ' · ' + fmt(s.longer || 0), sh);
    h += row('Degree 0 · 1 · 2 (unflipped)', s.stack.map(fmt).join(' · ') + (s.stack[2] === s.triples ? ' <span class="ref">deg 2 = triples ✓</span>' : ''), sh);
    h += row('On rivers', pct(s.onRiver, s.n), hot(['chains']));
    h += row('Axes 0° · 60° · 120° (unflipped)', s.axes.map(fmt).join(' · '), hot(['axes']));
    var shells = [1.561, 1.732, 2.291, 2.598, 2.634, 2.704, 3.031];
    h += row('Nearest-flip distance', s.distMin.toFixed(3) + ' – ' + s.distMax.toFixed(3) + ' in ' +
      shells.filter(function (d, i) { return s.shells[i + 1] > 0; }).length + ' shells', hot(['shells']));
    h += row('Neighbourhood types seen', fmt(s.kinds), hot(['census']));
    h += '</table>';
    statsBody.innerHTML = h;
  }
  function refreshStats() {
    if (statsEl.hidden) return;
    var seq = ++statsSeq;
    map.ask({ what: 'stats', ref: map.camRef(), half: HALF }, function (ans, err) {
      if (seq !== statsSeq) return;
      if (err || !ans) { statsBody.innerHTML = '<p class="hint">Stats unavailable: ' + (err || 'busy') + '</p>'; return; }
      lastStats = ans;
      renderStats();
    });
  }
  function showStats(on) {
    statsEl.hidden = !on; statsOn.checked = on;
    if (on) { renderStats(); refreshStats(); }
  }
  statsOn.addEventListener('change', function () { showStats(statsOn.checked); map.changed(); });
  $('stats-close').addEventListener('click', function () { showStats(false); map.changed(); });

  /* ------------------------------------------------------ diffraction */
  function diffSet() { var x = document.querySelector('input[name="diff-set"]:checked'); return x ? x.value : 'all'; }
  function runDiff() {
    if (diffEl.hidden) return;
    diffNote.textContent = 'Computing…';
    var n = 200, K = 7;
    map.ask({ what: 'diffraction', ref: map.camRef(), radius: 90, n: n, kmax: K, only: diffSet() }, function (a, err) {
      if (err || !a) { diffNote.textContent = 'Failed: ' + (err || 'busy'); return; }
      var ctx = diffCanvas.getContext('2d'), img = ctx.createImageData(a.n, a.n);
      var lmax = Math.log(1 + a.max), lmin = Math.log(1 + a.max * 1e-3);
      for (var y = 0; y < a.n; y++) for (var x = 0; x < a.n; x++) {
        var v = (Math.log(1 + a.img[y * a.n + x]) - lmin) / (lmax - lmin);
        v = Math.max(0, Math.min(1, v));
        var o = 4 * ((a.n - 1 - y) * a.n + x);
        img.data[o] = 255 * Math.pow(v, 0.8); img.data[o + 1] = 255 * Math.pow(v, 1.6); img.data[o + 2] = 255 * Math.pow(v, 4) + 40 * v;
        img.data[o + 3] = 255;
      }
      diffCanvas.width = a.n; diffCanvas.height = a.n;
      ctx.putImageData(img, 0, 0);
      diffNote.textContent = '|Σ e^{ik·x}|² over ' + a.count + ' ' + (diffSet() === 'flips' ? 'flipped ' : '') +
        'centroids in a disc of radius 45 article units (Hann taper), k ∈ [−' + K + ', ' + K + ']² per article unit, log scale. Sharp spots = pure-point (quasicrystal) diffraction. Map axes, view rotation ignored.';
    });
  }
  function showDiff(on) { diffEl.hidden = !on; diffOn.checked = on; if (on) runDiff(); }
  diffOn.addEventListener('change', function () { showDiff(diffOn.checked); map.changed(); });
  $('diff-close').addEventListener('click', function () { showDiff(false); map.changed(); });
  $('diff-run').addEventListener('click', runDiff);
  Array.prototype.forEach.call(document.querySelectorAll('input[name="diff-set"]'), function (r) { r.addEventListener('change', runDiff); });

  /* ------------------------------------------------------- copy scene */
  $('copy-scene').addEventListener('click', function () {
    var sc = { scheme: scheme(), v: map.viewArr(), shape: +page.deg().toFixed(2), outlines: map.outlines() };
    if (scheme() === 'ancestry') sc.ancLevel = ancLevel;
    if (scheme() === 'grain') sc.grainPeriod = +GRAIN_P[grainIdx].toFixed(4);
    var txt = '"scene": ' + JSON.stringify(sc);
    var note = $('copy-note');
    function done(ok) { note.textContent = ok ? 'copied' : txt; setTimeout(function () { note.textContent = ''; }, ok ? 1500 : 15000); }
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
    else done(false);
    console.log(txt);
  });

  /* --------------------------------------------------------- hash API */
  window.probeUI = {
    viewChanged: function () { clearTimeout(statsTimer); statsTimer = setTimeout(refreshStats, 150); },
    schemeChanged: schemeChanged,
    setAnc: setAnc,
    setGrain: setGrain,
    showStats: showStats,
    showDiff: showDiff,
    stats: function () { return lastStats; },
    hashExtra: function () {
      var o = {};
      if (ancLevel !== 2) o.lk = String(ancLevel);
      if (grainIdx !== 5) o.gp = String(+GRAIN_P[grainIdx].toFixed(4));
      if (!statsEl.hidden) o.st = '1';
      if (window.essayUI && window.essayUI.on()) o.e = String(window.essayUI.index());
      return o;
    },
    hashRead: function (q) {
      if (q.lk) setAnc(+q.lk);
      if (q.gp) { setGrain(+q.gp); window.__gpSet = true; }
      if (q.st === '1') showStats(true);
      if (q.e !== undefined && window.essayUI) window.essayUI.fromHash(+q.e);
    }
  };
  if (window.__probeHash) window.probeUI.hashRead(window.__probeHash);
  setTimeout(function () { if (!window.__gpSet) setGrain(Math.sqrt(3)); schemeChanged(); }, 0);
})();
