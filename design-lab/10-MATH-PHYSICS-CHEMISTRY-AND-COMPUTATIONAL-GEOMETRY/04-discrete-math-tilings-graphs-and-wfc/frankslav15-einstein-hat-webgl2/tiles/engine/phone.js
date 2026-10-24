/* Phone layout, layered on map.js. On a phone (narrow, or a landscape
   phone) the cards become: a one-row top bar (tiling menu, Essay, About),
   a bottom toolbar, and bottom sheets that open one at a time. The cards
   keep their own controls and handlers; this only moves and shows them.
   Tablet and desktop are untouched: everything keys off body.phone. */
(function () {
  'use strict';
  var mq = window.matchMedia('(max-width: 600px), (max-height: 500px) and (max-width: 950px)');
  var body = document.body, $ = function (id) { return document.getElementById(id); };
  var options = document.querySelector('.options'), legend = $('legend'), stats = $('stats'), diff = $('diff');
  var title = document.querySelector('.top .title'), sw = document.querySelector('.switch');
  if (!options || !legend || !title) return;
  var ICON = {
    shape: '<path d="M4 17 9 7l4 6 2-3 5 7z"/>',
    colours: '<circle cx="12" cy="12" r="8.2"/><circle cx="8.6" cy="9.6" r="1.3" fill="currentColor"/><circle cx="12.4" cy="7.6" r="1.3" fill="currentColor"/><circle cx="15.6" cy="10.4" r="1.3" fill="currentColor"/><path d="M12 20.2c-1.6 0-2.2-1.6-1.2-2.6 1.2-1.2.2-3-1.6-2.6"/>',
    options: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    stats: '<path d="M5 19V11M10 19V5M15 19v-6M20 19V9"/>'
  };

  /* Which sheets this page has. Krinkle's options open with tabs, not a
     shape slider, so there all of them sit in one sheet. */
  var first = options.querySelector('.body > .section:first-child');
  var split = !!(first && first.querySelector('input[type="range"]'));
  if (split) first.classList.add('shape-section');
  var sheets = split ? [['shape', 'Shape'], ['options', 'Options']] : [['options', 'Tile']];
  sheets.push(['colours', 'Colours']);
  if (stats) sheets.push(['stats', 'Stats']);
  var cardFor = { shape: options, options: options, colours: legend, stats: stats, diff: diff };

  /* Bottom toolbar. */
  var bar = document.createElement('nav');
  bar.className = 'phone-bar';
  bar.setAttribute('aria-label', 'Map tools');
  bar.innerHTML = sheets.map(function (s) {
    return '<button type="button" data-sheet="' + s[0] + '" aria-expanded="false">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICON[s[0]] + '</svg><span>' + s[1] + '</span></button>';
  }).join('');
  body.appendChild(bar);

  /* A grip and a head on each sheet: tap the grip or the cross, or drag
     down, to close. */
  function grip(card, label) {
    if (!card) return;
    var g = document.createElement('div');
    g.className = 'sheet-grip';
    g.innerHTML = '<span class="bar-handle" aria-hidden="true"></span><strong class="sheet-title">' + label +
      '</strong><button type="button" class="sheet-close" aria-label="Close">×</button>';
    card.insertBefore(g, card.firstChild);
    g.querySelector('.sheet-close').addEventListener('click', function () { open(null); });
    var y0 = null;
    g.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    g.addEventListener('touchend', function (e) {
      if (y0 === null) return;
      var dy = e.changedTouches[0].clientY - y0; y0 = null;
      if (dy > 40 || (Math.abs(dy) < 6 && !e.target.closest('button'))) open(null);
    });
  }
  grip(options, '<span class="t-shape">Tile shape</span><span class="t-options">' + (split ? 'Options' : 'Tile') + '</span>');
  grip(legend, 'Colours');
  grip(stats, 'Live stats');
  grip(diff, 'Diffraction');

  var current = null;
  function open(name) {
    if (name === current) name = null;
    var prev = current;
    current = name;
    if (name) body.dataset.sheet = name; else delete body.dataset.sheet;
    body.classList.toggle('sheet-open', !!name);
    Array.prototype.forEach.call(bar.children, function (b) {
      b.setAttribute('aria-expanded', b.dataset.sheet === name);
    });
    // Stats run only while their sheet is open; the card's own Close agrees.
    if (name === 'stats' && stats.hidden) $('stats-on').click();
    if (prev === 'stats' && name !== 'stats' && stats && !stats.hidden) $('stats-close').click();
    if (prev === 'diff' && name !== 'diff' && diff && !diff.hidden) $('diff-close').click();
    var card = cardFor[name];
    if (card) card.scrollTop = 0;
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-sheet]');
    if (b) open(b.dataset.sheet);
  });
  // Stats or diffraction switched on from elsewhere (the options, a link)
  // take over the sheet; switched off, they give it back.
  [stats, diff].forEach(function (card) {
    if (!card) return;
    new MutationObserver(function () {
      if (!body.classList.contains('phone')) return;
      var name = card === stats ? 'stats' : 'diff';
      if (!card.hidden && current !== name) open(name);
      else if (card.hidden && current === name) { current = null; open(null); }
    }).observe(card, { attributes: true, attributeFilter: ['hidden'] });
  });

  /* Top bar: the tiling switch becomes one full-size menu. */
  if (sw) {
    var sel = document.createElement('select');
    sel.className = 'tiling-select';
    sel.id = 'tiling-select';
    sel.setAttribute('aria-label', 'Tiling');
    Array.prototype.forEach.call(sw.querySelectorAll('a'), function (a) {
      var o = document.createElement('option');
      o.value = a.getAttribute('href');
      o.textContent = a.textContent + ' tiling';
      if (a.getAttribute('aria-current') === 'page') o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () { location.href = sel.value; });
    var row = title.querySelector('.row');
    row.insertBefore(sel, row.firstChild);
  }
  // The back link and credits move into About on a phone.
  var about = $('about');
  if (about) {
    var more = document.createElement('div');
    more.className = 'phone-more';
    ['.back', '.credit'].forEach(function (q) {
      var el = title.querySelector(q);
      if (el) { var c = el.cloneNode(true); c.removeAttribute('id'); more.appendChild(c); }
    });
    about.appendChild(more);
  }

  // The key is part of the Colours sheet, so on a phone it stays open.
  var lb = $('legend-body'), lt = $('legend-toggle');
  function keyOpen() {
    if (body.classList.contains('phone') && lb && lt && lt.getAttribute('aria-expanded') === 'false') lt.click();
  }
  if (lb) new MutationObserver(keyOpen).observe(lb, { attributes: true, attributeFilter: ['hidden'] });

  // Essay mode has its own sheet, so a tool sheet gives way to it.
  new MutationObserver(function () {
    if (current && body.classList.contains('essay-on')) open(null);
  }).observe(body, { attributes: true, attributeFilter: ['class'] });

  /* Phone or not, kept up to date as the screen turns. */
  function sync() {
    var phone = mq.matches;
    body.classList.toggle('phone', phone);
    body.classList.toggle('phone-portrait', phone && window.innerWidth <= 600);
    if (phone) {
      options.classList.remove('folded');
      // The key is part of the Colours sheet, so it stays open there.
      keyOpen();
      var tb = title.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty('--top-h', Math.round(tb) + 'px');
    } else if (current) open(null);
  }
  if (mq.addEventListener) mq.addEventListener('change', sync); else mq.addListener(sync);
  window.addEventListener('resize', sync);
  sync();
  // Escape closes a sheet.
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) open(null); });
  window.phoneUI = { open: open, current: function () { return current; } };
})();
