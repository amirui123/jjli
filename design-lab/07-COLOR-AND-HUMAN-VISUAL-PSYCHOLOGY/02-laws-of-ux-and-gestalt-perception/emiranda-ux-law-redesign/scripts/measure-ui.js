/*
 * measure-ui.js: baseline and acceptance measurements for a live screen.
 *
 * Paste the whole file into the browser's JavaScript tool (or DevTools console)
 * on the page to measure. It defines window.measureUI and runs it once with the
 * defaults. Resize the viewport (don't reload or navigate) and call measureUI()
 * again for each width; after any navigation, paste the file again. Pass
 * options to focus it:
 *
 *   measureUI({
 *     root: 'main section',      // what to measure (default: <main>, else <body>)
 *     keep: '[data-chip] > span:nth-child(2)', // text that must never be cut off
 *     minText: 12,               // smallest body text you accept, px
 *     capsMin: 11,               // smallest uppercase label you accept, px
 *     target: 44,                // comfortable target, px
 *     minTarget: 24,             // WCAG 2.2 AA minimum, px
 *   })
 *
 * Same script before and after, so the numbers are comparable. Everything is
 * read-only: it never clicks, types or changes the page.
 *
 * Reading the results: contrast on text over images or gradients can't be
 * computed (contrastUnmeasured); text at opacity 0 is judged as it will look
 * once revealed (waitingToAppear). Content inside iframes from another origin
 * (embedded forms, maps) is invisible to the script; forms.iframes lists them.
 * The copy section counts generic button and link labels, vague error text that
 * is visible right now, and sentence length. Error states usually aren't on screen
 * at rest, so vagueMessages of 0 means "none showing", not "none exist".
 */
window.measureUI = function measureUI(options) {
  const opts = Object.assign(
    { root: null, keep: null, minText: 12, capsMin: 11, target: 44, minTarget: 24, samples: 6 },
    options || {},
  );
  const root = (opts.root && document.querySelector(opts.root)) || document.querySelector('main') || document.body;
  const out = { viewport: `${innerWidth}x${innerHeight}`, root: describe(root), url: location.href };

  function describe(el) {
    if (!el) return null;
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  }
  function label(el) {
    const t = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.value || '').trim();
    return t.replace(/\s+/g, ' ').slice(0, 40);
  }
  const pageWidth = document.documentElement.scrollWidth;
  function visible(el) {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    // Parked off-screen: anti-spam fields, skip links waiting for focus.
    if (r.right <= 0 || r.left >= pageWidth) return false;
    // Opacity is ignored here on purpose: pages that fade content in on scroll
    // hold it at opacity 0 until it's revealed. The contrast check reports those.
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }
  // A control someone can actually use: visible, and not inside an aria-hidden, hidden or inert region.
  function usable(el) {
    return visible(el) && !el.closest('[aria-hidden="true"],[hidden],[inert]');
  }
  function section(name, fn) {
    try {
      out[name] = fn();
    } catch (err) {
      out[name] = { error: String(err && err.message ? err.message : err) };
    }
  }

  const all = [...root.querySelectorAll('*')].filter(visible);
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const textEls = all.filter(ownText);

  // Height: how many viewport heights the content takes, for the page and for the root.
  section('height', () => {
    const doc = document.scrollingElement || document.documentElement;
    let scroller = doc;
    if (doc.scrollHeight <= doc.clientHeight + 1) {
      // The app may scroll inside an element instead of the document.
      let best = null;
      for (const el of document.querySelectorAll('*')) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
          if (!best || el.scrollHeight - el.clientHeight > best.scrollHeight - best.clientHeight) best = el;
        }
      }
      if (best) scroller = best;
    }
    const content = scroller === doc ? doc.scrollHeight : scroller.scrollHeight + scroller.getBoundingClientRect().top + scrollY;
    return {
      pageScreens: +(content / innerHeight).toFixed(2),
      rootScreens: +(root.getBoundingClientRect().height / innerHeight).toFixed(2),
      scroller: scroller === doc ? 'document' : describe(scroller),
      horizontalScroll: doc.scrollWidth > innerWidth + 1,
    };
  });

  // Text: sizes, the share below the minimum (uppercase labels allowed down to capsMin), typefaces.
  section('text', () => {
    const sizes = {};
    const families = {};
    const small = [];
    for (const el of textEls) {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      sizes[fs] = (sizes[fs] || 0) + 1;
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      families[fam] = (families[fam] || 0) + 1;
      const txt = el.textContent.trim();
      const caps = cs.textTransform === 'uppercase' || (/[A-Z]/.test(txt) && txt === txt.toUpperCase());
      if (fs < opts.minText && !(caps && fs >= opts.capsMin)) small.push(`${fs}px "${txt.slice(0, 24)}"`);
    }
    const loaded = [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))];
    return {
      textElements: textEls.length,
      words: (root.innerText.match(/\S+/g) || []).length,
      minPx: textEls.length ? Math.min(...Object.keys(sizes).map(Number)) : null,
      sizes: Object.entries(sizes).sort((a, b) => a[0] - b[0]).map(([px, n]) => `${px}px×${n}`),
      distinctSizes: Object.keys(sizes).length,
      underMin: small.length,
      underMinPct: textEls.length ? Math.round((100 * small.length) / textEls.length) : 0,
      underMinSamples: small.slice(0, opts.samples),
      families,
      webfontsLoaded: loaded,
    };
  });

  // Truncation: ellipsis, line clamps, clipped nowrap text, and anything in `keep` that is cut off.
  section('truncation', () => {
    const ellipsis = all.filter((el) => getComputedStyle(el).textOverflow === 'ellipsis');
    const cut = ellipsis.filter((el) => el.scrollWidth > el.clientWidth + 1);
    const clamped = all.filter((el) => {
      const cs = getComputedStyle(el);
      return cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && el.scrollHeight > el.clientHeight + 1;
    });
    const clipped = all.filter((el) => {
      const cs = getComputedStyle(el);
      return cs.textOverflow !== 'ellipsis' && cs.overflowX === 'hidden' && cs.whiteSpace.includes('nowrap') && ownText(el) && el.scrollWidth > el.clientWidth + 1;
    });
    const result = {
      ellipsisElements: ellipsis.length,
      truncated: cut.length,
      truncatedSamples: cut.slice(0, opts.samples).map((el) => el.textContent.trim().slice(0, 40)),
      lineClamped: clamped.length,
      clippedWithoutEllipsis: clipped.length,
    };
    if (opts.keep) {
      const keep = [...root.querySelectorAll(opts.keep)].filter(visible);
      const lost = keep.filter((el) => {
        if (el.scrollWidth > el.clientWidth + 1) return true;
        const r = el.getBoundingClientRect();
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (getComputedStyle(p).overflowX !== 'visible') {
            const pr = p.getBoundingClientRect();
            if (r.right > pr.right + 1 || r.left < pr.left - 1) return true;
          }
        }
        return false;
      });
      result.keep = { checked: keep.length, cutOff: lost.length, samples: lost.slice(0, opts.samples).map((el) => el.textContent.trim().slice(0, 40)) };
    }
    return result;
  });

  // Targets: size of everything you can click or focus. Inline links inside text are exempt (WCAG 2.5.8).
  section('targets', () => {
    const sel = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=checkbox],[role=radio],[role=switch],[role=menuitem],[role=option],[tabindex]:not([tabindex="-1"])';
    const els = [...root.querySelectorAll(sel)].filter(usable);
    const rows = [];
    let inline = 0;
    for (const el of els) {
      if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
        const siblingsText = [...el.parentElement.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim());
        if (siblingsText) { inline++; continue; }
      }
      let box = el;
      if (el.tagName === 'INPUT' && /^(checkbox|radio)$/.test(el.type)) box = el.closest('label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el;
      const r = box.getBoundingClientRect();
      rows.push({ el, w: Math.round(r.width), h: Math.round(r.height) });
    }
    const under = (n) => rows.filter((t) => t.w < n || t.h < n);
    const unnamed = els.filter((el) => {
      if (el.matches('input,select,textarea')) return false;
      const name = (el.innerText || '').trim() || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title') || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('');
      return !name;
    });
    return {
      targets: rows.length,
      inlineLinksExempt: inline,
      [`under${opts.target}`]: under(opts.target).length,
      [`heightUnder${opts.target}`]: rows.filter((t) => t.h < opts.target).length,
      [`under${opts.minTarget}`]: under(opts.minTarget).length,
      smallest: rows.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).slice(0, opts.samples).map((t) => `${t.w}x${t.h} ${t.el.tagName.toLowerCase()} "${label(t.el)}"`),
      unnamedControls: unnamed.length,
      unnamedSamples: unnamed.slice(0, 3).map((el) => el.outerHTML.slice(0, 80)),
    };
  });

  // Forms: fields without a programmatic label, and fields whose only label is the placeholder.
  section('forms', () => {
    const fields = [...root.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea')].filter(usable);
    let unlabelled = 0;
    let placeholderOnly = 0;
    for (const f of fields) {
      const labelled = f.getAttribute('aria-label') || f.getAttribute('aria-labelledby') || f.closest('label') || (f.id && document.querySelector(`label[for="${CSS.escape(f.id)}"]`)) || f.getAttribute('title');
      if (!labelled) {
        if (f.getAttribute('placeholder')) placeholderOnly++;
        else unlabelled++;
      }
    }
    const iframes = [...root.querySelectorAll('iframe')].filter(visible).map((f) => {
      try { return new URL(f.src, location.href).host || 'inline'; } catch (e) { return 'unknown'; }
    });
    return { fields: fields.length, unlabelled, placeholderOnly, iframes };
  });

  // Colour and borders: how many distinct treatments the screen uses, and text below AA contrast.
  section('colour', () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const cache = new Map();
    const rgba = (c) => {
      if (cache.has(c)) return cache.get(c);
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      const v = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
      cache.set(c, v);
      return v;
    };
    const over = (top, bottom) => ({
      r: top.r * top.a + bottom.r * (1 - top.a),
      g: top.g * top.a + bottom.g * (1 - top.a),
      b: top.b * top.a + bottom.b * (1 - top.a),
      a: 1,
    });
    const lum = (c) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const backdrop = (el) => {
      const layers = [];
      let opacity = 1;
      for (let p = el; p; p = p.parentElement) {
        const cs = getComputedStyle(p);
        opacity *= parseFloat(cs.opacity);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return { unknown: true };
        const c = rgba(cs.backgroundColor);
        if (c.a > 0) layers.push(c);
        if (c.a >= 1) break;
      }
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
      return { bg, opacity };
    };
    const fills = new Set();
    const inks = new Set();
    const borderColours = new Set();
    const borderStyles = {};
    const shadows = new Set();
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (rgba(cs.backgroundColor).a > 0) fills.add(cs.backgroundColor);
      if (ownText(el)) inks.add(cs.color);
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        const st = cs[`border${side}Style`];
        if (st !== 'none' && st !== 'hidden' && parseFloat(cs[`border${side}Width`]) > 0) {
          borderStyles[st] = (borderStyles[st] || 0) + 1;
          borderColours.add(cs[`border${side}Color`]);
          break;
        }
      }
      if (cs.boxShadow && cs.boxShadow !== 'none') shadows.add(cs.boxShadow);
    }
    const low = [];
    let unknown = 0;
    let waiting = 0;
    for (const el of textEls) {
      const cs = getComputedStyle(el);
      const b = backdrop(el);
      if (b.unknown) { unknown++; continue; }
      // Fully transparent text is almost always waiting for a scroll reveal: judge it as it will appear.
      let alpha = b.opacity;
      if (alpha < 0.05) { waiting++; alpha = 1; }
      const ink = rgba(cs.color);
      const fg = over({ ...ink, a: ink.a * alpha }, b.bg);
      const L1 = lum(fg), L2 = lum(b.bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const fs = parseFloat(cs.fontSize);
      const large = fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
      if (ratio < (large ? 3 : 4.5)) low.push(`${ratio.toFixed(2)}:1 ${fs}px "${el.textContent.trim().slice(0, 24)}"`);
    }
    return {
      fills: fills.size,
      textColours: inks.size,
      borderColours: borderColours.size,
      borderStyles,
      shadows: shadows.size,
      belowAA: low.length,
      belowAASamples: low.slice(0, opts.samples),
      contrastUnmeasured: unknown,
      waitingToAppear: waiting,
    };
  });

  // Icons: Unicode glyphs doing an icon's job, distinct inline SVGs, icon fonts, images without alt.
  section('icons', () => {
    const glyphRe = /[←-⇿⌀-⏿①-⓿■-◿☀-➿⬀-⯿×−⋯]|\p{Extended_Pictographic}/gu;
    const counts = {};
    for (const ch of root.innerText.match(glyphRe) || []) counts[ch] = (counts[ch] || 0) + 1;
    const svgs = [...root.querySelectorAll('svg')].filter(visible);
    const distinct = new Set(svgs.map((s) => s.innerHTML.replace(/\s+/g, '')));
    const iconFont = textEls.filter((el) => /icon|symbols|awesome/i.test(getComputedStyle(el).fontFamily)).length;
    const imgs = [...root.querySelectorAll('img')].filter(visible);
    return {
      unicodeGlyphs: Object.entries(counts).map(([g, n]) => `${g}×${n}`),
      distinctGlyphs: Object.keys(counts).length,
      inlineSvgs: svgs.length,
      distinctSvgs: distinct.size,
      iconFontElements: iconFont,
      images: imgs.length,
      imagesWithoutAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
    };
  });

  // Copy: proxies for the copy audit (references/ux-copy.md). They can't judge meaning or tone.
  section('copy', () => {
    const genericButton = /^(submit|ok|okay|yes|no|go|click here|here|more)$/i;
    const genericLink = /^(click here|here|read more|learn more|more|more info|link)$/i;
    const vagueMessage = /\b(oops|something went wrong|invalid (input|entry|value)|an error (has )?occurred|unknown error|try again later)\b/i;
    const text = (el) => (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
    const words = (s) => (s.match(/\S+/g) || []).length;
    const buttons = [...root.querySelectorAll('button,[role=button],input[type=submit],input[type=button]')].filter(usable).map(text).filter(Boolean);
    const links = [...root.querySelectorAll('a[href]')].filter(usable).map(text).filter(Boolean);
    const messages = [...root.querySelectorAll('[role=alert],[role=status],[aria-live],[class*="error" i],[class*="invalid" i]')]
      .filter(usable).map(text).filter(Boolean);
    const vague = messages.filter((m) => vagueMessage.test(m));
    const prose = [...root.querySelectorAll('p,li,dd,blockquote')].filter((el) => usable(el) && ownText(el));
    const sentences = prose.flatMap((el) => el.innerText.split(/(?<=[.!?])\s+/)).map(words).filter((n) => n > 0);
    return {
      buttons: buttons.length,
      genericButtons: buttons.filter((b) => genericButton.test(b)).length,
      genericButtonSamples: [...new Set(buttons.filter((b) => genericButton.test(b)))].slice(0, opts.samples),
      longButtons: buttons.filter((b) => words(b) > 4).length,
      links: links.length,
      genericLinks: links.filter((l) => genericLink.test(l)).length,
      genericLinkSamples: [...new Set(links.filter((l) => genericLink.test(l)))].slice(0, opts.samples),
      messagesOnScreen: messages.length,
      vagueMessages: vague.length,
      vagueMessageSamples: vague.slice(0, opts.samples).map((m) => m.slice(0, 60)),
      exclamationMarks: (root.innerText.match(/!/g) || []).length,
      sentences: sentences.length,
      avgSentenceWords: sentences.length ? +(sentences.reduce((a, b) => a + b, 0) / sentences.length).toFixed(1) : null,
      sentencesOver25Words: sentences.filter((n) => n > 25).length,
    };
  });

  // Structure: the headings in order, for serial position and scanning.
  section('structure', () => {
    const hs = [...root.querySelectorAll('h1,h2,h3')].filter(visible);
    return {
      h1: hs.filter((h) => h.tagName === 'H1').length,
      headings: hs.slice(0, 20).map((h) => `${h.tagName.toLowerCase()} ${h.textContent.trim().replace(/\s+/g, ' ').slice(0, 50)}`),
    };
  });

  return out;
};

measureUI();
