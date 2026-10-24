# Page probe

A read-only browser snippet that measures one page at one viewport, so a live audit starts from numbers instead of impressions. It feeds the laws in `SKILL.md`; it does not grade anything itself. Its numbers are prompts to look closer, as `SKILL.md` §4 says of every number.

## Contents
- [What it measures](#what-it-measures)
- [How to run it](#how-to-run-it)
- [Snippet](#snippet)
- [Reading the result](#reading-the-result)
- [False-positive rules](#false-positive-rules)
- [Viewports and rendering](#viewports-and-rendering)
- [Checking the snippet](#checking-the-snippet)

## What it measures
Everything below counts only **visible** elements. That means a box with size; not hidden by CSS on the element or an ancestor (`checkVisibility()` where the browser has it); and not cut away by a clipping ancestor, so the children of a collapsed `height: 0; overflow: hidden` panel are skipped, with or without a border. Clipping is tested per axis, at the ancestor's padding box (inside its border): an ancestor with `overflow-x: clip` and a visible y axis doesn't hide content that extends below it. Text counts as visible when its nearest ancestor with a box is visible, so text inside a `display: contents` wrapper is measured, and text in a 1px visually-hidden span is not. The one exception: an interactive element with an empty box but a card-sized overlay is kept, because its overlay can still be clicked.

The clipping test walks DOM ancestors. An absolutely or fixed-positioned element can escape a clipping ancestor that isn't its containing block, and the probe may then skip it although it is on screen. If a control you can see is missing from the result, measure it by hand.

- `overflowX`: document-level horizontal overflow (`scrollWidth − clientWidth`). **This number is authoritative.**
- `wide`: the outermost elements that reach past the right edge. `clipped: true` only when an ancestor that stays inside the viewport clips them (`overflow-x: hidden|clip`, a `clip-path`, or `contain: paint|strict|content`).
- `targets.list`: interactive elements whose **own box** is under the 44×44 usability goal (`omitted` says how many were cut by the list cap). Each carries:
  - `inline: true` for a link inside running text: the surrounding block has at least 6 visible words outside every interactive element, at least twice as many characters as the visible controls in it, **and** no two controls separated only by spaces or punctuation. Hidden text never makes a link inline. A link that is a whole paragraph, a row of links ("Edit Delete") or a labelled row of actions ("Alexandria Catherine Johnson Edit Delete", "Alice Edit") is not inline. A short sentence with a link ("Read the method note.") is also left as not inline, which errs towards inspection. Inline links **stay in this list**;
  - `stretched: true` when the element generates a hit-testable `::before`/`::after` overlay (`position: absolute`, inset 0). `overlayEstimate` is then that overlay's containing-block size, a **static estimate**. A stretched target stays in this list until a hit-test shows its real area.
- `needsHitTest`: **every** stretched target, never truncated, with its own size (possibly 0×0 for an empty anchor) and `overlayEstimate`. Hit-test each one before grading it.
- `conformanceCandidates`: **every** target under 24 CSS px that is not inline, never truncated, each with the result of the WCAG 2.5.8 spacing test (a 24px circle on the target's centre) and its `stretched` flag. Stretched targets stay here until a hit-test shows their area is at least 24×24. This list is separate from the usability list and doesn't change any grade.
- `smallText`: elements with their own text rendered under 12px.
- `lineLength`: characters per line for each visible `p` and `li`, counted from text geometry (below):
  - `blocks` holds every measured block (up to 40, with `omitted` for the rest), with its selector, the start of its rendered text (`innerText`, so hidden text is left out and CSS case changes show), `lines`, `perLine` and `estimate`;
  - `long` names the blocks over 90 characters per line;
  - `estimates` counts the uncertain counts.
- `headings`: the number of `h1`s and how many times a heading level is skipped.
- `imagesWithoutAlt`: visible images with no `alt` attribute at all (an empty `alt` is a valid decorative choice and isn't counted). Images in closed or collapsed UI are counted when you open it and measure again (false-positive rule 5).

It never clicks, focuses, scrolls, writes, or dispatches an event.

## How to run it
Paste the snippet as the **top-level expression** of the browser tool's JavaScript call, once per page and viewport, after the page has finished loading. Don't run it any other way:
- `eval`, `new Function` or an injected `<script>` are blocked on sites with a strict content-security policy (for example Trusted Types).
- An iframe sweep fails on `frame-ancestors 'none'` or `X-Frame-Options`. Even when it loads, it measures the iframe's viewport, not the page's.

Record the page, the viewport and the returned object. Several pages make a coverage matrix; see [multi-surface.md](multi-surface.md).

## Snippet
```js
(() => {
  const MAX = 12;                     // entries kept per list
  const BLOCKS = 40;                  // per-block line measurements kept
  const LONG = 90;                    // characters per line that count as long
  const doc = document.documentElement, vw = doc.clientWidth;
  /* Visible means: a box, not hidden by CSS on itself or an ancestor, and not cut away by a
     clipping ancestor (a collapsed panel with height 0 and overflow hidden hides its children).
     Each axis is tested only where that ancestor clips it, so overflow-x: clip with a visible
     y axis keeps content that extends downwards. */
  const styled = el => (el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
    : getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none');
  const unclipped = el => {
    const r = el.getBoundingClientRect();
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a), cx = s.overflowX !== 'visible', cy = s.overflowY !== 'visible';
      if (!cx && !cy) continue;
      /* Overflow clips at the padding box, inside the border. */
      const c = a.getBoundingClientRect(), b = k => parseFloat(s[`border${k}Width`]) || 0;
      if (cx && Math.min(r.right, c.right - b('Right')) - Math.max(r.left, c.left + b('Left')) <= 0) return false;
      if (cy && Math.min(r.bottom, c.bottom - b('Bottom')) - Math.max(r.top, c.top + b('Top')) <= 0) return false;
    }
    return true;
  };
  const shown = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && styled(el) && unclipped(el); };
  /* Text is visible when its nearest ancestor with a box (display: contents has none) is shown and
     bigger than a 1px visually-hidden span, and the text itself isn't visibility: hidden. */
  const boxed = el => { while (el && getComputedStyle(el).display === 'contents') el = el.parentElement; return el; };
  const textShown = n => {
    const b = boxed(n.parentElement), r = b && b.getBoundingClientRect();
    return !!b && getComputedStyle(n.parentElement).visibility === 'visible' && shown(b) && r.width > 1 && r.height > 1;
  };
  const sel = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + [...el.classList].map(c => '.' + c).join('');
  const label = el => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const size = r => ({ w: Math.round(r.width), h: Math.round(r.height) });

  /* 1. Overflow. The document figure is authoritative; elements are listed to locate it. */
  const clippedBy = el => {
    for (let a = el.parentElement; a && a !== doc; a = a.parentElement) {
      const s = getComputedStyle(a);
      const clips = /hidden|clip/.test(s.overflowX) || (s.clipPath && s.clipPath !== 'none') || /paint|strict|content/.test(s.contain);
      if (clips && a.getBoundingClientRect().right <= vw + 1) return sel(a);
    }
    return null;
  };
  const past = [...document.body.querySelectorAll('*')].filter(el => shown(el) && el.getBoundingClientRect().right > vw + 1);
  const wide = past.filter(el => !past.some(o => o !== el && o.contains(el)))   // outermost only
    .slice(0, MAX).map(el => ({ el: sel(el), right: Math.round(el.getBoundingClientRect().right), clipped: !!clippedBy(el), clippedBy: clippedBy(el) }));

  /* 2. Targets. Inline links in running text stay in the usability list (flagged);
        only the 2.5.8 conformance list applies that exception. */
  const INTERACTIVE = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[tabindex]:not([tabindex="-1"])';
  /* "In a sentence" means the surrounding block reads as running text: at least 6 visible words
     outside every interactive element, at least twice as many characters as the visible controls
     in it, and no two controls separated only by spaces or punctuation. Hidden text never counts.
     A link that is the whole paragraph, a row of links ("Edit Delete") or a labelled row of
     actions ("Alexandria Catherine Johnson Edit Delete", "Alice Edit") is a set of standalone
     controls, not an inline exception.
     Ambiguous blocks fall on the side of "not inline", so they stay conformance candidates. */
  const len = t => t.replace(/[\s\p{P}\p{S}]+/gu, '').length;
  const split = host => {
    let prose = '', controls = '', row = false, last = null, gap = '';
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) {
      if (!textShown(n)) continue;
      const ctl = n.parentElement.closest(INTERACTIVE);
      if (!ctl) { prose += n.textContent; gap += n.textContent; continue; }
      if (last && ctl !== last && !len(gap)) row = true;
      controls += n.textContent; last = ctl; gap = '';
    }
    return { prose: len(prose), controls: len(controls), row, words: prose.split(/\s+/).filter(w => len(w)).length };
  };
  const inline = el => {
    const host = el.parentElement.closest('p,li,dd,td,figcaption,blockquote');
    if (getComputedStyle(el).display !== 'inline' || !host || el.closest('nav')) return false;
    const t = split(host);
    return t.words >= 6 && t.prose >= 2 * t.controls && !t.row;
  };
  const overlay = el => ['::before', '::after'].find(p => {
    const s = getComputedStyle(el, p);
    return s.content !== 'none' && s.content !== 'normal' && s.display !== 'none' && s.visibility !== 'hidden'
      && s.pointerEvents !== 'none' && s.position === 'absolute' && ['top', 'right', 'bottom', 'left'].every(k => s[k] === '0px');
  }) || null;
  const block = el => {
    if (getComputedStyle(el).position !== 'static') return el;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.position !== 'static' || s.transform !== 'none' || s.filter !== 'none' || s.perspective !== 'none'
        || /paint|layout|strict|content/.test(s.contain) || (s.containerType && s.containerType !== 'normal')) return a;
    }
    return doc;
  };
  /* An empty anchor can have a zero box and still own a card-sized overlay, so look for the
     overlay before rejecting an element as invisible. */
  const targets = [...document.querySelectorAll(INTERACTIVE)]
    .filter(el => shown(el) || (overlay(el) && styled(el) && unclipped(block(el))))
    .map(el => {
      const r = el.getBoundingClientRect(), p = overlay(el);
      return { el, r, inline: inline(el), stretched: !!p, overlay: p ? size(block(el).getBoundingClientRect()) : null };
    });
  /* Sizes are the element's own box. A stretched overlay is only an estimate until hit-tested,
     so stretched targets stay in both lists and are also listed under needsHitTest. */
  const small = targets.filter(t => t.r.width < 44 || t.r.height < 44);
  const under24 = targets.filter(t => !t.inline && (t.r.width < 24 || t.r.height < 24));
  /* Spacing test: a 24px circle on each undersized target's centre must not touch another target. */
  const centre = r => [r.left + r.width / 2, r.top + r.height / 2];
  const hitsRect = ([x, y], r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom)) < 12;
  const conformance = under24.map(t => {
    const c = centre(t.r);
    const clash = targets.find(o => o !== t && (hitsRect(c, o.r) || (under24.includes(o) && Math.hypot(c[0] - centre(o.r)[0], c[1] - centre(o.r)[1]) < 24)));
    return { name: label(t.el), size: size(t.r), stretched: t.stretched, spacing: clash ? `fails against ${label(clash.el) || sel(clash.el)}` : 'passes' };
  });

  /* 3. Small text. */
  const tiny = [...document.body.querySelectorAll('*')].filter(el => shown(boxed(el))
    && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 12);

  /* 4. Characters per line, from text geometry. Rects that overlap by half the smaller height
        are on the same line, and lines joined through any rect merge, so a larger or shifted
        inline span can link a superscript and the baseline text whatever order they sort in.
        Whitespace-only nodes count as separators only. */
  const lines = el => {
    const text = [], rects = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => textShown(n) && n.parentElement.closest('p,li') === el
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    for (let n; (n = walker.nextNode());) {
      text.push(n.textContent);
      if (!n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      rects.push(...[...range.getClientRects()].filter(r => r.width > 0 && r.height > 0));
    }
    const chars = text.join('').replace(/\s+/g, ' ').trim().length;
    if (!chars) return null;
    if (!rects.length) {
      /* Fallback without geometry: content height over line-height, marked as an estimate. */
      const s = getComputedStyle(el), fs = parseFloat(s.fontSize);
      const lh = s.lineHeight === 'normal' ? 1.2 * fs : parseFloat(s.lineHeight);
      const h = el.getBoundingClientRect().height - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom);
      const n = Math.max(1, Math.round(h / lh));
      return { lines: n, perLine: Math.round(chars / n), estimate: true };
    }
    let bands = [];
    for (const r of rects.sort((a, b) => a.top - b.top)) {
      const near = bands.filter(b => b.some(m => Math.min(m.bottom, r.bottom) - Math.max(m.top, r.top) >= 0.5 * Math.min(m.height, r.height)));
      bands = bands.filter(b => !near.includes(b)).concat([[r, ...near.flat()]]);
    }
    const hs = rects.map(r => r.height);
    return { lines: bands.length, perLine: Math.round(chars / bands.length), estimate: Math.max(...hs) / Math.min(...hs) > 1.5 };
  };
  const blocks = [...document.querySelectorAll('p, li')].filter(shown).map(el => ({ el, m: lines(el) })).filter(x => x.m);

  /* 5. Structure. */
  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(shown).map(h => +h.tagName[1]);

  return {
    path: location.pathname, viewport: `${innerWidth}x${innerHeight}`,
    overflowX: doc.scrollWidth - doc.clientWidth,
    wide,
    targets: { checked: targets.length, under44: small.length, omitted: Math.max(0, small.length - MAX),
      list: small.slice(0, MAX).map(t => ({ name: label(t.el) || sel(t.el), size: size(t.r), inline: t.inline, stretched: t.stretched, overlayEstimate: t.overlay })) },
    /* Actionable lists are never truncated: every entry needs a hit-test or a spacing decision. */
    needsHitTest: targets.filter(t => t.stretched)
      .map(t => ({ name: label(t.el) || sel(t.el), size: size(t.r), overlayEstimate: t.overlay })),
    conformanceCandidates: conformance,
    smallText: [...new Set(tiny.map(el => `${sel(el)} ${getComputedStyle(el).fontSize}`))].slice(0, MAX),
    lineLength: { measured: blocks.length, omitted: Math.max(0, blocks.length - BLOCKS),
      long: blocks.filter(x => x.m.perLine > LONG).slice(0, MAX).map(x => sel(x.el)),
      estimates: blocks.filter(x => x.m.estimate).length,
      blocks: blocks.slice(0, BLOCKS).map(x => ({ el: sel(x.el), text: x.el.innerText.trim().replace(/\s+/g, ' ').slice(0, 30), ...x.m })) },
    headings: { h1: levels.filter(l => l === 1).length, skipped: levels.filter((l, i) => i && l > levels[i - 1] + 1).length },
    imagesWithoutAlt: [...document.images].filter(i => !i.hasAttribute('alt') && shown(i)).length
  };
})()
```

## Reading the result
- **Line counting.** Lines come from `Range.getClientRects()` over each block's own text nodes. Two rects are on the same line when they overlap by at least half the smaller height, and lines linked through any rect merge into one. So a superscript or a larger or shifted inline span stays on its line, even when another span is what links it to the baseline text, in whatever order the rects sort. Whitespace-only text nodes add a separator to the character count and no geometry, so `<span>Alpha</span> <span>Beta</span>` counts 10 characters. Text in a nested `p` or `li` is measured with that block, not double-counted. If a block's rects differ in height by more than 1.5×, the count is kept but marked `estimate: true`. Only when no geometry is available does the snippet divide the content height (padding removed, `line-height: normal` taken as 1.2 × font size) by the line height, and that result is always an estimate.
- **Targets.** `targets.list` is the input to law 2 (size), after the `needsHitTest` entries are hit-tested. `conformanceCandidates` is the input to the §6 conformance note. Keep the two apart, as §6 does.
- **Line evidence.** Cite `lineLength.blocks` entries (selector and text start) when quoting a measurement. `long` is only an index into them.
- **Small text and long lines** are diagnostics. They aren't laws.

## False-positive rules
1. **Document overflow decides.** `overflowX > 0` is always a finding, even when the wide element is decorative or the bleed is intentional; report the intent beside it. An element in `wide` is set aside only when it is `clipped: true` **and** `overflowX` is 0.
2. **Stretched is a prompt, not a verdict.** The probe never removes a stretched target on the strength of its overlay estimate. Every entry in `needsHitTest` gets the live hit-test in [hit-testing.md](hit-testing.md) before it is graded, because clipping, overlays and nested controls can shrink or break the overlay that `overlayEstimate` assumes. Only a hit-tested area of at least 44×44 clears a law 2 size concern, and at least 24×24 clears a conformance candidate. A stretched overlay that is itself small stays a finding.
3. **Inline links stay in.** An `inline: true` link remains in the usability list. When it's unclear whether a block is running text or a group of controls, the probe treats it as controls (not inline), so it stays a conformance candidate for you to inspect. A frequent one, or one within 8px of another target on a touch-first surface, can still meet the law 2 Warning. The 2.5.8 inline exception applies only to the conformance list.
4. **Line length is unscored.** A block over 90 characters per line is a readability diagnostic. On its own it never sets or changes a grade. It can support a law finding only when that law's applicability (§3) and its §4 evidence hold independently. Report `estimate: true` lines as estimates.
5. **Hidden UI is not measured.** A closed menu or collapsed panel is invisible to the snippet. Open it (a safe, non-mutating toggle) and run the snippet again, or list it as not measured.

## Viewports and rendering
- **Default set:** 375×812 (phone), 768×1024 (tablet), 1440×900 (desktop). A sweep covers all three, or names the ones it skipped and why.
- **Measure, then screenshot.** Screenshots can time out while a page is mid-transition (view transitions, smooth scroll, entrance animation). Wait for the render and retry once. If it still fails, rely on the measured numbers and say so. A number measured in a page the browser tool opened is render evidence.
- **Assets.** To inspect an SVG or image on its own, open its URL directly instead of scrolling the page to it.

## Checking the snippet
Two inert fixtures in `evals/fixtures/` pin its behaviour: `site-sections.html` (no page overflow) and `overflow-unclipped.html` (page overflow). Their expected results at 375 and 1440 are listed in `evals/README.md`.
