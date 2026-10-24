/**
 * The shareable poster: a 1600×2000 (or 1600×1600) picture of the scene with the title,
 * every necklace's E(k,n), name and interval vector, the tempo and the share link.
 * This module is the pure part: where everything goes (posterLayout) and what it says
 * (posterText). src/poster.js paints it.
 */
import { pattern, toBox, intervals } from './euclid.js';
import { identify } from './rhythms.js';
import { colorOf, encode } from './state.js';
import { BEATS_PER_BAR } from './schedule.js';

export const POSTER_SIZES = Object.freeze({
  portrait: Object.freeze({ width: 1600, height: 2000 }),
  square: Object.freeze({ width: 1600, height: 1600 }),
});
export const POSTER_FILENAME = 'necklace-poster.png';
export const POSTER_TITLE = 'NECKLACE';
export const POSTER_SUBTITLE = 'Euclidean rhythm necklaces';
export const POSTER_CREDIT = 'Rhythms from Toussaint, BRIDGES 2005';

/** Bar-outline padding around the stage circle, in design units (beat ticks reach R + 20). */
const STAGE_PAD = 36;

/**
 * Where everything goes on a `width`×`height` poster holding `count` necklaces.
 * Text positions are baselines; every measurement is scaled from a 1600-wide design.
 */
export function posterLayout({ width = 1600, height = 2000, count = 1 } = {}) {
  const n = Math.max(1, Math.min(4, Math.round(count) || 1));
  const u = width / 1600;
  const px = (v) => Math.round(v * u);
  const margin = px(80);

  const title = { x: width / 2, y: px(150), size: px(96), tracking: 0.34 };
  const subtitle = { x: width / 2, y: px(212), size: px(32) };
  const line = { size: px(40), height: px(60) };
  const tempo = { size: px(32) };
  const footer = { size: px(24) };

  // caption block, measured from its top
  const captionGap = px(56);
  const tempoGap = px(26);
  const footerGap = px(64);
  const captionHeight = n * line.height + tempoGap + tempo.size + footerGap + footer.size;

  const stageTop = subtitle.y + px(44);
  const stageBottom = height - margin - captionHeight - captionGap;
  const size = Math.min(width - 2 * margin, stageBottom - stageTop);
  const R = size / 2 - px(STAGE_PAD);
  const stage = { cx: width / 2, cy: stageTop + (stageBottom - stageTop) / 2, R, pad: px(STAGE_PAD), scale: R / 300 };

  const captionTop = stageBottom + captionGap;
  const lines = Array.from({ length: n }, (_, i) => ({
    x: margin,
    y: captionTop + i * line.height + line.size,
    size: line.size,
    swatch: px(11),
  }));
  const tempoY = captionTop + n * line.height + tempoGap + tempo.size;
  const footerY = height - margin;

  return {
    width,
    height,
    margin,
    title,
    subtitle,
    stage,
    lines,
    tempo: { x: margin, y: tempoY, size: tempo.size },
    url: { x: margin, y: footerY, size: footer.size, maxWidth: width - 2 * margin },
    credit: { x: width - margin, y: tempoY, size: footer.size },
  };
}

/** The words on the poster for a state: one entry per necklace, the tempo line, the link. */
export function posterText(state, base = '') {
  const necklaces = state.necklaces.map((nk, i) => {
    const bits = pattern(nk.k, nk.n, nk.rot);
    const id = identify(nk.k, nk.n, nk.rot);
    return {
      ekn: `E(${nk.k},${nk.n})`,
      name: id ? (id.exact ? id.name : `${id.name} necklace`) : '',
      iv: `(${intervals(bits).join(' ')})`,
      box: toBox(bits),
      color: colorOf(i),
      muted: Boolean(nk.mute),
    };
  });
  return {
    title: POSTER_TITLE,
    subtitle: POSTER_SUBTITLE,
    necklaces,
    tempo: `${state.tempo} bpm · ${BEATS_PER_BAR} beats to the bar`,
    url: shareUrl(base, state),
    credit: POSTER_CREDIT,
  };
}

/** The link that reproduces a state: `base#t=…&r=…`. */
export function shareUrl(base, state) {
  return `${base}#${encode(state)}`;
}
