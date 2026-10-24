# Hit-testing snippet

A copy-paste browser snippet for the **live page** procedure in `SKILL.md` section 6. It is optional: the skill works without it, and you can run the same steps by hand in DevTools.

## Contents
- [What it does and does not do](#what-it-does-and-does-not-do)
- [Snippet](#snippet)
- [Reading the result](#reading-the-result)
- [Static estimate fallback](#static-estimate-fallback)

## What it does and does not do
- **Read-only.** It samples a grid of points with `document.elementFromPoint` and reads computed styles. It never clicks, dispatches events, submits forms or changes the page.
- **Delegated activation cannot be proven from here.** A framework or `addEventListener` handler on a container is invisible to page JavaScript. The snippet reports such a hit as `possible` only when the element or an ancestor has an inline `onclick` attribute or `cursor: pointer`, and otherwise as `unknown, confirm manually`. Confirm in DevTools (the Event Listeners panel, or `getEventListeners(el)` in the console) or with a manual click on a **non-destructive** page. Never submit a live form to find out.
- Only points inside the visible viewport are sampled. Off-screen points are counted as `offscreen` and left out of the total. If the region is partly off-screen, scroll it into view first and say so in the report.
- Points covered by an element **outside** the region (a sticky bar, a modal, a sibling overlay) are counted as `occluded` and stay in the total, so an overlay lowers the target share instead of raising it.

## Snippet
Set the two selectors, paste into the DevTools console, and read the printed table.

```js
(() => {
  const REGION = '.promo';          // the card, row or container to measure
  const TARGET = '.archive-link';   // the anchor or button whose real hit area you want
  const N = 12;                     // grid size (N x N points)

  const region = document.querySelector(REGION);
  const target = document.querySelector(TARGET);
  if (!region || !target) return console.warn('Check REGION and TARGET selectors');

  const interactive = 'a[href],button,input,select,textarea,summary,[role=button],[role=link],[tabindex]:not([tabindex="-1"])';
  const r = region.getBoundingClientRect();
  const counts = { target: 0, 'other-control': 0, 'delegated-possible': 0, 'delegated-unknown': 0, occluded: 0, offscreen: 0 };
  const intercepted = new Set();

  const hasDelegateHint = (el) => {
    for (let e = el; e && e !== region.parentElement; e = e.parentElement) {
      if (e.hasAttribute && e.hasAttribute('onclick')) return true;
      if (getComputedStyle(e).cursor === 'pointer') return true;
    }
    return false;
  };

  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = r.left + (i + 0.5) * r.width / N, y = r.top + (j + 0.5) * r.height / N;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { counts.offscreen++; continue; }
    const hit = document.elementFromPoint(x, y);
    if (!hit || !region.contains(hit)) { counts.occluded++; continue; }   // covered by something outside the region
    if (target.contains(hit)) { counts.target++; continue; }
    const ctl = hit.closest(interactive);
    if (ctl && ctl !== target) { counts['other-control']++; continue; }
    counts[hasDelegateHint(hit) ? 'delegated-possible' : 'delegated-unknown']++;
  }

  // Controls whose centre is captured by the target (the stretched-link interception defect).
  region.querySelectorAll(interactive).forEach((c) => {
    if (c === target || target.contains(c)) return;
    const b = c.getBoundingClientRect();
    const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    if (top && target.contains(top)) intercepted.add(c.tagName.toLowerCase() + (c.id ? '#' + c.id : ''));
  });

  const pseudo = ['::before', '::after'].map((p) => {
    const s = getComputedStyle(target, p);
    return { pseudo: p, generated: s.content !== 'none' && s.content !== 'normal', position: s.position,
             inset: [s.top, s.right, s.bottom, s.left].join(' '), display: s.display,
             visibility: s.visibility, pointerEvents: s.pointerEvents };
  });

  const total = N * N - counts.offscreen;   // occluded points stay in the denominator
  console.table(counts);
  console.table(pseudo);
  console.log({
    targetBox: (({ width, height }) => `${Math.round(width)}x${Math.round(height)}`)(target.getBoundingClientRect()),
    regionBox: `${Math.round(r.width)}x${Math.round(r.height)}`,
    effectiveTargetShare: total ? Math.round(100 * counts.target / total) + '% of sampled region' : 'no points in viewport',
    interceptedControls: [...intercepted],
    note: 'delegated-possible/unknown cannot be confirmed from page JS; confirm in DevTools or by a safe manual click.',
  });
})();
```

## Reading the result
- `target`: points where the hit element is the target or inside it. This is the effective hit area, as a share of the region.
- `other-control`: points that land on a different link, button or input, which is correct.
- `occluded`: points in the viewport that something outside the region covers. A large share means the region isn't reachable there.
- `interceptedControls`: any other control whose centre is captured by the target, which is a defect. Grade it under law 3 (`SKILL.md` sections 4 and 6).
- `delegated-possible`: an inline `onclick` or `cursor: pointer` suggests a container handler. Treat it as part of the target only after you confirm it.
- `delegated-unknown`: no evidence either way. Report the area as **unknown, confirm manually**.
- The pseudo-element table tells you whether a stretched overlay is actually generated and hit-testable (`content`, `display`, `visibility`, `pointer-events`).

## Static estimate fallback
If you cannot run JavaScript on the page, use the static procedure in `SKILL.md` section 6 and label the measurement "static estimate".
