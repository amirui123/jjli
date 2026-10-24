/* Essay mode: SlavisTon's article beside the map, scrollytelling. Each
   section of window.ESSAY (scenes.js) carries a scene; scrolling to a
   section, or clicking it, flies the map there. */
(function () {
  'use strict';
  var E = window.ESSAY, page = window.hatPage;
  if (!E || !page) return;
  var map = page.map;
  var panel = document.getElementById('essay'), scroller = document.getElementById('essay-scroll');
  var dots = document.getElementById('essay-dots'), toggle = document.getElementById('mode-toggle');
  var fold = document.getElementById('essay-fold');
  // Phone portrait: a bottom sheet with snap points showing one section at
  // a time, with prev/next and sideways swipes (phone.js sets the class).
  var head = panel.querySelector('.essay-head');
  head.insertAdjacentHTML('beforebegin', '<div class="essay-grip" id="essay-grip" aria-hidden="true"><span></span></div>');
  head.insertAdjacentHTML('beforeend',
    '<div class="essay-pnav"><button type="button" id="essay-prev" aria-label="Previous section">‹</button>' +
    '<span class="essay-count" id="essay-count"></span>' +
    '<button type="button" id="essay-next" aria-label="Next section">›</button>' +
    '<button type="button" id="essay-snap" aria-label="Taller">▴</button></div>');
  var count = document.getElementById('essay-count'), snapBtn = document.getElementById('essay-snap');
  function sheet() { return document.body.classList.contains('phone-portrait'); }
  var on = false, active = -1, pending = 0, sections = [], quietUntil = 0;
  // Scrolls the code starts itself do not pick a section on the way.
  function quiet(ms) { quietUntil = performance.now() + (ms || 1200); }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------------------------------------------------------- build */
  var html = '<header class="essay-title">' +
    '<h2>' + esc(E.title) + '</h2>' +
    '<p class="byline">by <a href="' + E.authorUrl + '" target="_blank" rel="noopener">' + esc(E.author) + '</a> · ' + E.date +
    ' · <a href="' + E.postUrl + '" target="_blank" rel="noopener">original on X</a></p>' +
    '<p class="essay-note">Article text verbatim. Scroll, or click a section, and the map behind follows. Colours follow the article\'s legends; maps are recomputed live on David Ryan\'s Hat tiling.</p>' +
    '</header>';
  E.sections.forEach(function (s, i) {
    html += '<section class="essay-sec" data-i="' + i + '" id="sec-' + s.id + '" tabindex="0">';
    html += '<div class="sec-label"><span>' + (i + 1) + '</span> ' + esc(s.label || '') + '</div>';
    s.paras.forEach(function (p) { html += '<p>' + esc(p) + '</p>'; });
    s.images.forEach(function (im) {
      html += '<figure class="essay-fig' + (im.files.length > 1 ? ' multi' : '') + '">';
      im.files.forEach(function (f) { html += '<img src="' + E.imageBase + f + '" alt="' + esc(im.caption) + '">'; });
      html += '<figcaption>' + esc(im.caption) + ' <span class="src">(article image)</span></figcaption></figure>';
    });
    html += '</section>';
  });
  html += '<footer class="essay-credits"><h3>Credits</h3>' +
    '<p>Essay: <a href="' + E.articleUrl + '" target="_blank" rel="noopener">“' + esc(E.title) + '”</a> by ' + esc(E.author) + '.</p>' +
    '<p>Map engine, Tile(a, b) slider, colour schemes and sibling tilings: <a href="https://drbuild.uk/tiles" target="_blank" rel="noopener">David Ryan’s tiling explorer</a> ' +
    '(<a href="https://github.com/davidryan59/davidryan59.github.io" target="_blank" rel="noopener">source</a>, MIT licence, © 2026 David Ryan).</p>' +
    '<p>The Hat: D. Smith, J. S. Myers, C. S. Kaplan, C. Goodman-Strauss, <a href="https://arxiv.org/abs/2303.10798" target="_blank" rel="noopener">An aperiodic monotile</a> (2023). Metatile construction after Kaplan’s hatviz.</p>' +
    '<p>Probe maps are recomputed here from the tiling, not copied from the article; small differences are listed in the README.</p></footer>';
  scroller.innerHTML = html;
  sections = Array.prototype.slice.call(scroller.querySelectorAll('.essay-sec'));
  // Images change the layout as they load; keep a just-chosen section in place.
  var lastJump = 0;
  Array.prototype.forEach.call(scroller.querySelectorAll('img'), function (img) {
    img.addEventListener('load', function () {
      if (on && !sheet() && active >= 0 && performance.now() - lastJump < 4000) { quiet(300); scroller.scrollTop = secTop(active); }
    });
  });
  dots.innerHTML = E.sections.map(function (s, i) {
    return '<button type="button" data-i="' + i + '" title="' + esc(s.label || s.id) + '" aria-label="Section ' + (i + 1) + ': ' + esc(s.label || s.id) + '"></button>';
  }).join('');

  /* ---------------------------------------------------------- scenes */
  // The essay sits along the bottom on narrow screens and portrait
  // tablets, as essay.css lays it out; beside the map otherwise.
  var bottomMq = window.matchMedia('(max-width: 720px), (min-width: 721px) and (max-width: 1100px) and (orientation: portrait)');
  function narrow() { return bottomMq.matches; }
  // Tablet widths (not phones): Options folds while reading (essay.css).
  function tablet() { return !document.body.classList.contains('phone') && window.innerWidth > 600 && window.innerWidth < 1280; }
  var optionsEl = document.querySelector('.options'), optionsFold = document.getElementById('options-fold'), weFolded = false;
  function foldOptions(f) {
    if (!optionsEl) return;
    optionsEl.classList.toggle('folded', f);
    if (optionsFold) optionsFold.setAttribute('aria-expanded', !f);
  }
  function offset() {
    if (!on || panel.classList.contains('folded')) return [0, 0];
    var r = panel.getBoundingClientRect();
    if (sheet()) {
      // Centre the scene in the map left between the top bar and the sheet.
      var H = window.innerHeight, top = document.querySelector('.top').getBoundingClientRect().bottom;
      var sh = Math.min(sheetPx(snap), H * 0.56);
      return [0, (top + (H - sh)) / 2 - H / 2];
    }
    return narrow() ? [0, -r.height / 2] : [-r.width / 2, 0];
  }
  function applyScene(i, instant) {
    var s = E.sections[i] && E.sections[i].scene;
    if (!s) return;
    // Scenes keep the article's own colours unless they name a palette.
    if (s.scheme) { map.scheme(s.scheme, s.palette); if (window.probeUI) window.probeUI.schemeChanged(); }
    if (s.outlines !== undefined) map.outlines(!!s.outlines);
    if (s.ancLevel && window.probeUI) window.probeUI.setAnc(s.ancLevel);
    if (s.grainPeriod && window.probeUI) window.probeUI.setGrain(s.grainPeriod);
    if (s.shape !== undefined && Math.abs(page.deg() - s.shape) > 1e-9) page.setShape(s.shape, instant ? 0 : 900);
    if (s.v) map.flyTo(s.v, { offset: offset(), ms: instant ? 0 : (s.ms || 1400) });
  }
  function activate(i, opts) {
    opts = opts || {};
    if (i === active && !opts.force) return;
    active = i;
    sections.forEach(function (el, k) { el.classList.toggle('active', k === i); });
    Array.prototype.forEach.call(dots.children, function (b, k) { b.classList.toggle('on', k === i); });
    var s = E.sections[i] || {};
    count.textContent = (i + 1) + ' / ' + sections.length + (s.label ? ' · ' + s.label : '');
    panel.classList.toggle('at-first', i === 0);
    panel.classList.toggle('at-last', i === sections.length - 1);
    if (sheet()) scroller.scrollTop = 0;
    applyScene(i, opts.instant);
    map.changed();
  }
  function secTop(i) { return i <= 0 ? 0 : sections[i].offsetTop - scroller.offsetTop - 12; }
  function scrollTo(i) {
    var el = sections[i];
    if (!el) return;
    quiet();
    if (sheet()) { scroller.scrollTop = 0; return; }
    scroller.scrollTo({ top: secTop(i), behavior: 'smooth' });
  }

  // The section crossing a line 35% down the panel is the active one.
  function pick() {
    var r = scroller.getBoundingClientRect(), line = r.top + r.height * 0.35, best = 0;
    sections.forEach(function (el, k) { if (el.getBoundingClientRect().top <= line) best = k; });
    // At the very bottom, the last section wins.
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) best = sections.length - 1;
    return best;
  }
  scroller.addEventListener('scroll', function () {
    if (!on || sheet()) return;
    clearTimeout(pending);
    if (performance.now() < quietUntil) return;
    pending = setTimeout(function () { if (performance.now() >= quietUntil) activate(pick()); }, 180);
  }, { passive: true });
  // Activate before scrolling: the old section's figure shrinks when it
  // stops being active, which moves the new one up, so the scroll target
  // has to be measured after.
  sections.forEach(function (el, k) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var was = active;
      activate(k, { force: true });
      if (k !== was) scrollTo(k);
    });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') activate(k, { force: true }); });
  });
  dots.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = +b.dataset.i; activate(k, { force: true }); scrollTo(k);
  });

  /* ---------------------------------------------------------- toggle */
  function setOn(v, opts) {
    on = !!v;
    document.body.classList.toggle('essay-on', on);
    panel.hidden = !on;
    toggle.textContent = on ? 'Explore' : 'Essay';
    toggle.setAttribute('aria-pressed', on);
    // The article's colours while reading; Explore gets its own choice back.
    if (map.essayColours) map.essayColours(on);
    if (!on && window.probeUI) window.probeUI.schemeChanged();
    // Options opens again in Explore if the essay folded it, on screens
    // where Explore shows it open.
    if (!on && weFolded) { weFolded = false; if (window.innerWidth > 640) foldOptions(false); }
    toggle.title = on ? 'Back to free Explore mode' : 'Read the article alongside the map';
    if (on) {
      if ((narrow() || tablet()) && optionsEl && !optionsEl.classList.contains('folded')) { foldOptions(true); weFolded = true; }
      var i = opts && opts.index !== undefined ? opts.index : Math.max(0, active);
      active = -1;
      requestAnimationFrame(function () {
        quiet(400); lastJump = performance.now();
        scroller.scrollTop = sections[i] ? secTop(i) : 0;
        activate(i, { instant: opts && opts.instant });
      });
    }
    map.changed();
  }
  toggle.addEventListener('click', function () { setOn(!on); });
  fold.addEventListener('click', function () {
    var f = panel.classList.toggle('folded');
    document.body.classList.toggle('essay-folded', f);
    fold.setAttribute('aria-expanded', !f);
    fold.textContent = f ? '▴' : '▾';
    fold.title = f ? 'Expand the essay' : 'Collapse the essay';
  });
  document.addEventListener('keydown', function (e) {
    if (!on || e.target.closest('input, select, textarea')) return;
    if (e.key === 'PageDown' || (e.key === 'j' && !e.ctrlKey)) { e.preventDefault(); var n = Math.min(sections.length - 1, active + 1); activate(n); scrollTo(n); }
    if (e.key === 'PageUp' || (e.key === 'k' && !e.ctrlKey)) { e.preventDefault(); var p = Math.max(0, active - 1); activate(p); scrollTo(p); }
  });

  /* ---------------------------------------------------------- phone sheet */
  var snaps = ['peek', 'half', 'full'], snap = 'half';
  function sheetPx(s) {
    var H = window.innerHeight;
    return s === 'peek' ? H * 0.32 : s === 'half' ? H * 0.52 : H;
  }
  function setSnap(s, refly) {
    snap = s;
    panel.dataset.snap = s;
    snapBtn.textContent = s === 'full' ? '▾' : '▴';
    snapBtn.setAttribute('aria-label', s === 'full' ? 'Shorter' : 'Taller');
    if (refly && on && active >= 0) setTimeout(function () { applyScene(active); }, 230);
  }
  setSnap('half');
  function step(d) {
    var n = Math.max(0, Math.min(sections.length - 1, active + d));
    if (n !== active) { activate(n); scrollTo(n); }
  }
  document.getElementById('essay-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('essay-next').addEventListener('click', function () { step(1); });
  snapBtn.addEventListener('click', function () { setSnap(snap === 'full' ? 'peek' : snaps[snaps.indexOf(snap) + 1], true); });
  // Drag the grip or head up or down to snap; a tap on the grip steps taller.
  var y0 = null;
  [document.getElementById('essay-grip'), head].forEach(function (el) {
    el.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (y0 === null || !sheet()) return;
      var dy = e.changedTouches[0].clientY - y0, k = snaps.indexOf(snap); y0 = null;
      if (dy < -30 && k < 2) setSnap(snaps[k + 1], true);
      else if (dy > 30 && k > 0) setSnap(snaps[k - 1], true);
      else if (Math.abs(dy) < 6 && el.id === 'essay-grip') setSnap(snaps[(k + 1) % 3], true);
    });
  });
  // Swipe sideways on the text for the next or previous section.
  var t0 = null;
  scroller.addEventListener('touchstart', function (e) { t0 = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
  scroller.addEventListener('touchend', function (e) {
    if (!t0 || !sheet()) return;
    var dx = e.changedTouches[0].clientX - t0[0], dy = e.changedTouches[0].clientY - t0[1]; t0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  window.essayUI = {
    on: function () { return on; },
    index: function () { return Math.max(0, active); },
    set: setOn,
    go: function (i, instant) { if (!on) setOn(true, { index: i, instant: instant }); else { activate(i, { force: true, instant: instant }); scrollTo(i); } },
    fromHash: function (i) { if (!on) setOn(true, { index: isNaN(i) ? 0 : i, instant: true }); }
  };
})();
