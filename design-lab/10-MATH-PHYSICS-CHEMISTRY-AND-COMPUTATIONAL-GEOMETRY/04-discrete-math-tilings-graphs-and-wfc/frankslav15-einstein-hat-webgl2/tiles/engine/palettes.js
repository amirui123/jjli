/* Palettes for the colour system (Explore mode of the Hat page).

   A colour-by mode (a grouping in map.js) says WHAT is coloured: n classes,
   and how they relate. A palette says HOW: a named scheme that can colour
   any mode. This file turns (palette, grouping) into n colours.

   A grouping may describe its classes with
     kind     'cat' (categories), 'seq' (ordered) or 'cyc' (ordered, wraps)
     field    indices of "everything else" classes (off-river, unstacked…):
              they take the palette's quiet field colour
     rest     index of a catch-all class ("rarer"): a muted grey
     families lists of class indices that belong together, darkest first
              (a heading's flip/triple/pair, an ancestor's variants): one
              base colour per family, shaded in lightness per member
     t(k)     position 0..1 of class k along an ordered mode

   A palette has
     cat      discrete colours for categories (cycled, then shaded, past
              their count)
     ramp     colour stops for ordered classes (interpolated in OKLab);
              either list stands in for the other when missing
     cyclic   the ramp wraps (a hue wheel)
     range    the part of the ramp categories are sampled from
     field    the quiet colour of field classes
     bg, edge, width   suggested canvas, outline colour and outline width
     exact    { groupingId: presetId }: use that preset's colours verbatim
     fn       a function of the context, for semantic palettes

   No libraries; plain ES5 so it runs with David Ryan's engine as is. */
(function (global) {
  'use strict';

  /* ------------------------------------------------ colour conversions */
  function hex(h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16) / 255; }); }
  function toHex(c) {
    return '#' + c.map(function (v) {
      var s = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16);
      return s.length < 2 ? '0' + s : s;
    }).join('');
  }
  function lin(x) { return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
  function enc(x) { x = Math.min(1, Math.max(0, x)); return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055; }
  function toLab(c) {
    var r = lin(c[0]), g = lin(c[1]), b = lin(c[2]);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  }
  function fromLab(o) {
    var l = Math.pow(o[0] + 0.3963377774 * o[1] + 0.2158037573 * o[2], 3);
    var m = Math.pow(o[0] - 0.1055613458 * o[1] - 0.0638541728 * o[2], 3);
    var s = Math.pow(o[0] - 0.0894841775 * o[1] - 1.2914855480 * o[2], 3);
    return [enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
            enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
            enc(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)];
  }
  function oklch(L, C, h) { h *= Math.PI / 180; return fromLab([L, C * Math.cos(h), C * Math.sin(h)]); }
  function mix(a, b, t) { var A = toLab(a), B = toLab(b); return fromLab([0, 1, 2].map(function (k) { return A[k] + (B[k] - A[k]) * t; })); }

  // Colour at t in 0..1 along stops (rgb arrays), evenly spaced, in OKLab.
  function along(stops, t, wrap) {
    var n = stops.length;
    if (n === 1) return stops[0].slice();
    if (wrap) { t = ((t % 1) + 1) % 1; var x = t * n, i = Math.floor(x) % n; return mix(stops[i], stops[(i + 1) % n], x - Math.floor(x)); }
    t = Math.max(0, Math.min(1, t));
    var y = t * (n - 1), j = Math.min(n - 2, Math.floor(y));
    return mix(stops[j], stops[j + 1], y - j);
  }
  // m lightness variants of one colour, spread around it, kept in range.
  function shades(c, m, amp) {
    if (m <= 1) return [c.slice()];
    var lab = toLab(c), Ls = [];
    for (var j = 0; j < m; j++) Ls.push(lab[0] + amp * (-1 + 2 * j / (m - 1)));
    var lo = Math.min.apply(null, Ls), hi = Math.max.apply(null, Ls), sh = 0;
    if (lo < 0.24) sh = 0.24 - lo; else if (hi > 0.96) sh = 0.96 - hi;
    return Ls.map(function (L) {
      L += sh;
      // Very light or dark shades lose some chroma, as real pigments do.
      var k = 1 - Math.min(0.5, Math.abs(L - lab[0]) * 0.8);
      return fromLab([L, lab[1] * k, lab[2] * k]);
    });
  }

  /* ---------------------------------------------------------- palettes */
  function H(list) { return list.map(hex); }
  function hues(n, L, C, off) { var o = []; for (var i = 0; i < n; i++) o.push(oklch(L, C, off + 360 * i / n)); return o; }

  var LIST = [
    { id: 'original', group: 'Original', name: 'Original', note: 'The article\'s legend colours, or David Ryan\'s for his modes' },

    { id: 'pastel', group: 'David Ryan', name: 'Pastel', exact: { turnhand: 'pastel' }, cat: hues(6, 0.86, 0.085, 25), field: hex('#fdfcf8') },
    { id: 'rainbow', group: 'David Ryan', name: 'Rainbow', exact: { turnhand: 'rainbow' }, cyclic: true, ramp: hues(12, 0.8, 0.12, 25), cat: hues(6, 0.8, 0.12, 25), field: hex('#f3f0ea') },
    { id: 'grey', group: 'David Ryan', name: 'Greyscale', exact: { turnhand: 'grey' }, ramp: H(['#000000', '#ffffff']), range: [0.1, 0.9], field: hex('#f4f4f4') },
    { id: 'mirrored', group: 'David Ryan', name: 'Mirrored', exact: { hand: 'hands' }, preview: H(['#eee7d6', '#2d5fa8']),
      fn: function (ctx) { return ctx.groups.map(function (g) { return hex(g.flip ? (ctx.dark ? '#6fa0e8' : '#2d5fa8') : (ctx.dark ? '#3a3935' : '#eee7d6')); }); } },
    { id: 'plain', group: 'David Ryan', name: 'Plain', exact: { one: 'plain' }, preview: H(['#fdfcf8']),
      fn: function (ctx) { return ctx.groups.map(function () { return hex(ctx.dark ? '#2a2a30' : '#fdfcf8'); }); } },

    { id: 'viridis', group: 'Scientific', name: 'Viridis', ramp: H(['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725']), field: hex('#ecebe4') },
    { id: 'magma', group: 'Scientific', name: 'Magma', ramp: H(['#000004', '#140e36', '#3b0f70', '#641a80', '#8c2981', '#b73779', '#de4968', '#f7705c', '#fe9f6d', '#fecf92', '#fcfdbf']), range: [0.12, 1], field: hex('#efe9e0') },
    { id: 'cividis', group: 'Scientific', name: 'Cividis', ramp: H(['#00224e', '#123570', '#3b496c', '#575d6d', '#707173', '#8a8779', '#a69d75', '#c4b56c', '#e4cf5b', '#fee838']), field: hex('#eceae3') },
    { id: 'turbo', group: 'Scientific', name: 'Turbo', ramp: H(['#30123b', '#4145ab', '#4675ed', '#39a2fc', '#1bcfd4', '#24eca6', '#61fc6c', '#a4fc3b', '#d1e834', '#f3c63a', '#fe9b2d', '#f36315', '#d93806', '#b11901', '#7a0402']), range: [0.05, 0.95], field: hex('#efede6') },

    { id: 'set2', group: 'Qualitative', name: 'Set2', cat: H(['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3']), field: hex('#f4f2ec') },
    { id: 'dark2', group: 'Qualitative', name: 'Dark2', cat: H(['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666']), field: hex('#f1eee6') },
    { id: 'paired', group: 'Qualitative', name: 'Paired', cat: H(['#1f78b4', '#a6cee3', '#33a02c', '#b2df8a', '#e31a1c', '#fb9a99', '#ff7f00', '#fdbf6f', '#6a3d9a', '#cab2d6', '#b15928', '#ffff99']), field: hex('#f5f3ee') },
    { id: 'tableau', group: 'Qualitative', name: 'Tableau 10', cat: H(['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac']), field: hex('#f3f1ec') },

    { id: 'okabe', group: 'Colour-blind safe', name: 'Okabe–Ito', cat: H(['#e69f00', '#56b4e9', '#009e73', '#f0e442', '#0072b2', '#d55e00', '#cc79a7', '#000000']), field: hex('#f2f0ea') },

    { id: 'blues', group: 'Mood', name: 'Monochrome blue', ramp: H(['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']), range: [0.25, 1], field: hex('#f7fbff') },
    { id: 'earth', group: 'Mood', name: 'Earth & terracotta', cat: H(['#c4572f', '#e2a65a', '#7a8b4f', '#8c5a3c', '#4e5d4a', '#d98b6a', '#a8742e', '#b9b08a']),
      ramp: H(['#3d2b1f', '#7a4a2a', '#b5653a', '#d9925a', '#e8c08a', '#f2e3c6']), field: hex('#efe4d0') },
    { id: 'neon', group: 'Mood', name: 'Neon on dark', cat: H(['#ff2bd6', '#00e5ff', '#b6ff00', '#ffe600', '#ff6a00', '#8a5cff', '#00ff9c', '#ff3355']),
      ramp: H(['#2a0a5e', '#7a00ff', '#ff00c8', '#ff6a00', '#ffe600', '#b6ff00']), field: hex('#14141f'), bg: hex('#08080d'), edge: hex('#05050a'), width: 2.2 },
    { id: 'softpastel', group: 'Mood', name: 'Soft pastel', cat: H(['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec']),
      ramp: H(['#b3cde3', '#ccebc5', '#ffffcc', '#fed9a6', '#fbb4ae']), field: hex('#fbfaf6') },
    { id: 'print', group: 'Mood', name: 'Print greyscale', ramp: H(['#ffffff', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525']), range: [0.2, 1],
      field: hex('#ffffff'), bg: hex('#ffffff'), edge: hex('#000000'), width: 1.3 },

    { id: 'bauhaus', group: 'Art', name: 'Bauhaus', cat: H(['#d6312b', '#f4c21b', '#1f4fa3', '#151515', '#7d8a8f', '#e07b27']), field: hex('#ede6d6'), edge: hex('#151515'), width: 1.4 },
    { id: 'mondrian', group: 'Art', name: 'Mondrian', cat: H(['#d40920', '#1356a2', '#f7d842', '#f4f1ea', '#111111']), field: hex('#f4f1ea'), edge: hex('#111111'), width: 2.6 },
    { id: 'sepia', group: 'Art', name: 'Escher sepia', ramp: H(['#2b1d12', '#5a3d26', '#8a6440', '#b89268', '#dcc39a', '#f3e6cb']), range: [0, 0.85], field: hex('#f3e6cb'), edge: hex('#2b1d12') },
    { id: 'iznik', group: 'Art', name: 'Islamic tile blues', cat: H(['#1c3f94', '#2f9fb8', '#0b6e8a', '#c99a2e', '#7fc8d6', '#123060', '#b8462e', '#e3d3a8']),
      ramp: H(['#0d1f4f', '#1c3f94', '#2f9fb8', '#7fc8d6', '#f5f1e6']), field: hex('#f5f1e6'), edge: hex('#0b1f45') }
  ];
  var BY = {};
  LIST.forEach(function (p) { BY[p.id] = p; });

  /* ------------------------------------------------------- generation */
  // n colours sampled for categories.
  function catColours(P, m) {
    var out = [];
    if (P.cat && P.cat.length) {
      var L = P.cat.length;
      for (var i = 0; i < m; i++) {
        var c = P.cat[i % L], round = Math.floor(i / L);
        // Second and later rounds: lighter, then darker, of the same list.
        out.push(round ? shades(c, 3, 0.13)[round % 2 ? 2 : 0] : c.slice());
      }
      return out;
    }
    var R = P.ramp, r = P.range || [0, 1];
    for (var k = 0; k < m; k++) out.push(along(R, m === 1 ? (r[0] + r[1]) / 2 : r[0] + (r[1] - r[0]) * k / (m - 1), false));
    return out;
  }
  function rampAt(P, t, cyc) {
    var R = P.ramp && P.ramp.length ? P.ramp : P.cat, r = P.range || [0, 1];
    if (cyc) {
      if (P.cyclic || !P.ramp) return along(R, t, true);
      t = 1 - Math.abs(2 * t - 1);        // there and back, so the wrap is seamless
    }
    return along(R, r[0] + (r[1] - r[0]) * t, false);
  }
  function fieldOf(P, dark) { return P.field ? P.field.slice() : hex(dark ? '#2a2a30' : '#ece7da'); }

  /* ctx: { grouping, groups: [{flip, caption}], dark, preset(id) → colours,
            original → colours of the mode's own preset }
     Returns g.n rgb arrays. */
  function colours(P, ctx) {
    var g = ctx.grouping, n = g.n;
    if (!P || P.id === 'original') return ctx.original;
    if (P.exact && P.exact[g.id]) return ctx.preset(P.exact[g.id]);
    // A saved palette remembers the exact colours of the mode it was made on.
    if (P.exactCols && P.exactCols[g.id] && P.exactCols[g.id].length === n) return P.exactCols[g.id].map(hex);
    if (P.fn) return P.fn(ctx);
    var out = new Array(n), field = g.field || [], used = {};
    field.forEach(function (k) { out[k] = fieldOf(P, ctx.dark); used[k] = 1; });
    if (g.rest !== undefined) { out[g.rest] = mix(fieldOf(P, ctx.dark), hex('#6b6b6b'), 0.7); used[g.rest] = 1; }
    if (g.families) {
      var base = catColours(P, g.families.length);
      g.families.forEach(function (fam, f) {
        var sh = shades(base[f], fam.length, fam.length > 2 ? 0.14 : 0.12);
        fam.forEach(function (k, j) { out[k] = sh[j]; used[k] = 1; });
      });
    }
    var free = [];
    for (var k = 0; k < n; k++) if (!used[k]) free.push(k);
    var kind = g.kind || 'cat';
    if (kind === 'cat') {
      var cs = catColours(P, free.length);
      free.forEach(function (k, i) { out[k] = cs[i]; });
    } else {
      free.forEach(function (k, i) {
        var t = g.t ? g.t(k) : (kind === 'cyc' ? i / free.length : (free.length > 1 ? i / (free.length - 1) : 0.5));
        out[k] = rampAt(P, t, kind === 'cyc');
      });
    }
    return out;
  }
  // A few colours that show what a palette looks like.
  function preview(P, m) {
    m = m || 6;
    if (P.preview) return P.preview;
    if (P.cat && P.cat.length) return P.cat.slice(0, m);
    var o = [], r = P.range || [0, 1];
    for (var i = 0; i < m; i++) o.push(along(P.ramp, r[0] + (r[1] - r[0]) * i / (m - 1), false));
    return o;
  }

  /* ------------------------------------------------- user palettes */
  // A saved palette: a name, an ordered list of colours (used both as
  // categories and as a ramp), and optional field, bg, edge and width.
  function fromUser(u) {
    var cat = (u.colours || []).map(hex);
    return { id: 'u:' + u.name, user: true, group: 'My palettes', name: u.name, cat: cat, ramp: cat.length > 1 ? cat : null,
             field: u.field ? hex(u.field) : null, bg: u.bg ? hex(u.bg) : null, edge: u.edge ? hex(u.edge) : null, width: u.width, src: u,
             exactCols: u.exact || null };
  }
  var HEX = /^#?[0-9a-f]{6}$/i;
  function cleanHex(x) { x = String(x || '').trim(); if (!HEX.test(x)) return null; return (x[0] === '#' ? x : '#' + x).toLowerCase(); }
  // The short share code: HP1;name;c1,c2,…[;f=field][;b=bg][;o=edge][;w=width]
  function encode(u) {
    var s = 'HP1;' + String(u.name || 'palette').replace(/[;~]/g, ' ').slice(0, 40) + ';' + u.colours.map(function (h) { return h.slice(1); }).join(',');
    if (u.field) s += ';f=' + u.field.slice(1);
    if (u.bg) s += ';b=' + u.bg.slice(1);
    if (u.edge) s += ';o=' + u.edge.slice(1);
    if (u.width !== undefined && u.width !== null) s += ';w=' + (+u.width).toFixed(2).replace(/\.?0+$/, '');
    return s;
  }
  // Accepts the short code, JSON, or a plain list of hex colours.
  function decode(text) {
    text = String(text || '').trim();
    if (!text) return null;
    var u = null;
    try {
      if (text[0] === '{' || text[0] === '[') {
        var o = JSON.parse(text);
        if (Array.isArray(o)) o = { colours: o };
        u = { name: o.name, colours: o.colours || o.cat || o.colors, field: o.field, bg: o.bg || o.background, edge: o.edge || o.outline, width: o.width };
        if (o.exact && typeof o.exact === 'object') {
          var ex = {};
          Object.keys(o.exact).forEach(function (gid) {
            var l = Array.isArray(o.exact[gid]) ? o.exact[gid].map(cleanHex) : [];
            if (l.length && l.every(Boolean)) ex[gid] = l;
          });
          u.exact = ex;
        }
      } else if (/^HP1;/i.test(text)) {
        var parts = text.split(';');
        u = { name: parts[1], colours: (parts[2] || '').split(',') };
        parts.slice(3).forEach(function (p) {
          var kv = p.split('=');
          if (kv[0] === 'f') u.field = kv[1]; else if (kv[0] === 'b') u.bg = kv[1];
          else if (kv[0] === 'o') u.edge = kv[1]; else if (kv[0] === 'w') u.width = parseFloat(kv[1]);
        });
      } else {
        u = { colours: text.split(/[\s,;-]+/) };
      }
    } catch (e) { return null; }
    if (!u || !Array.isArray(u.colours)) return null;
    u.colours = u.colours.map(cleanHex).filter(Boolean).slice(0, 64);
    if (!u.colours.length) return null;
    u.name = String(u.name || 'Imported').trim().slice(0, 40) || 'Imported';
    ['field', 'bg', 'edge'].forEach(function (k) { u[k] = cleanHex(u[k]) || undefined; });
    if (!(u.width >= 0 && u.width <= 4)) delete u.width;
    return u;
  }

  global.TilePalettes = {
    list: LIST, get: function (id) { return BY[id]; }, colours: colours, preview: preview,
    fromUser: fromUser, encode: encode, decode: decode, cleanHex: cleanHex,
    hex: hex, toHex: toHex, mix: mix, oklch: oklch
  };
})(this);
