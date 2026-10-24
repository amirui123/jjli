/**
 * Embed mode: `?embed=1` (or `embed=1` inside the hash) shows only the stage, a tiny
 * play button and a corner link back to the full page. Pure helpers; main.js applies them.
 */
import { encode } from './state.js';

const TRUTHY = new Set(['', '1', 'true', 'yes', 'on']);

function flag(params, key) {
  if (!params.has(key)) return false;
  return TRUTHY.has(String(params.get(key)).toLowerCase());
}

function params(str) {
  const s = typeof str === 'string' ? str.replace(/^[?#]/, '') : '';
  try {
    return new URLSearchParams(s);
  } catch {
    return new URLSearchParams();
  }
}

/** Is embed mode requested by the query string or the hash? */
export function embedRequested(search, hash) {
  return flag(params(search), 'embed') || flag(params(hash), 'embed');
}

/** Where the request came from: 'search', 'hash' or null. */
export function embedSource(search, hash) {
  if (flag(params(search), 'embed')) return 'search';
  if (flag(params(hash), 'embed')) return 'hash';
  return null;
}

/** The hash to write for a state, keeping `embed=1` when the request lives in the hash. */
export function stateHash(state, keepEmbed = false) {
  return encode(state) + (keepEmbed ? '&embed=1' : '');
}

/** The full-page link for an embedded scene (no `?embed`). */
export function fullPageUrl(base, state) {
  return `${base}#${encode(state)}`;
}

/** The iframe snippet people paste. */
export function embedSnippet(base, state, { width = 480, height = 480 } = {}) {
  const src = `${base}?embed=1#${encode(state)}`;
  return `<iframe src="${src}" width="${width}" height="${height}" title="NECKLACE" loading="lazy" allow="autoplay" style="border:0;border-radius:12px;background:#0a0c12"></iframe>`;
}
