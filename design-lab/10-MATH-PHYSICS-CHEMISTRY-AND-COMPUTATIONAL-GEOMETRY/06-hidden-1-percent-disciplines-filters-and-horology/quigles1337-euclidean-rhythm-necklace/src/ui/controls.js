/**
 * Side panel: one card per necklace with steps / onsets / rotate sliders, voice and mute,
 * the box notation, the interval vector and, when the pattern matches one the paper
 * prints, its name.
 *
 * Cards are created once per necklace id and updated in place, so dragging a slider
 * never re-creates the element under the pointer.
 */
import { pattern, toBox, intervals } from '../core/euclid.js';
import { identify } from '../core/rhythms.js';
import { VOICES } from '../audio/voices.js';
import { LIMITS, colorOf } from '../core/state.js';
import { mountPicker } from './picker.js';

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
}

function slider(label, min, max) {
  const wrap = el('label', 'row');
  const name = el('span', 'row-name');
  name.append(label, ' ');
  const out = el('output', 'row-out');
  name.append(out);
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = '1';
  wrap.append(name, input);
  return { wrap, input, out };
}

export function mountPanel(root, { getState, onChange, onRemove }) {
  const cards = new Map();

  function build(nk) {
    const card = el('section', 'necklace');
    const head = el('header');
    const swatch = el('span', 'swatch');
    const ekn = el('strong', 'ekn');
    const name = el('em', 'name');
    const spacer = el('span', 'spacer');
    const mute = el('button', 'icon mute', 'M');
    mute.type = 'button';
    mute.title = 'Mute';
    mute.setAttribute('aria-pressed', 'false');
    const remove = el('button', 'icon remove', '×');
    remove.type = 'button';
    remove.title = 'Remove necklace';
    remove.setAttribute('aria-label', 'Remove necklace');
    head.append(swatch, ekn, name, spacer, mute, remove);

    const pick = document.createElement('select');
    pick.className = 'pick';
    pick.setAttribute('aria-label', 'Load a named rhythm');

    const n = slider('steps', LIMITS.nMin, LIMITS.nMax);
    const k = slider('onsets', 1, LIMITS.nMax);
    const rot = slider('rotate', 0, LIMITS.nMax - 1);

    const voiceRow = el('label', 'row');
    voiceRow.append(el('span', 'row-name', 'voice'));
    const voice = document.createElement('select');
    for (const v of VOICES) {
      const o = document.createElement('option');
      o.value = v.id;
      o.textContent = `${v.label} · ${v.hint}`;
      voice.append(o);
    }
    voiceRow.append(voice);

    const pat = el('div', 'pattern');
    const box = el('code', 'box');
    const iv = el('span', 'iv');
    pat.append(box, iv);

    card.append(head, pick, n.wrap, k.wrap, rot.wrap, voiceRow, pat);

    const edit = (fn) => {
      const cur = getState().necklaces.find((x) => x.id === nk.id);
      if (!cur) return;
      fn(cur);
      cur.k = Math.min(cur.k, cur.n);
      cur.rot = ((cur.rot % cur.n) + cur.n) % cur.n;
      onChange();
      sync();
    };
    n.input.addEventListener('input', () => edit((c) => (c.n = Number(n.input.value))));
    k.input.addEventListener('input', () => edit((c) => (c.k = Number(k.input.value))));
    rot.input.addEventListener('input', () => edit((c) => (c.rot = Number(rot.input.value))));
    voice.addEventListener('change', () => edit((c) => (c.voice = voice.value)));
    mute.addEventListener('click', () => edit((c) => (c.mute = !c.mute)));
    remove.addEventListener('click', () => {
      if (onRemove) onRemove(nk.id);
    });
    mountPicker(pick, (e) =>
      edit((c) => {
        c.n = e.n;
        c.k = e.k;
        c.rot = e.rot;
      }),
    );

    return { card, swatch, ekn, name, mute, remove, n, k, rot, voice, box, iv };
  }

  function update(refs, nk, index) {
    const color = colorOf(index);
    refs.card.style.setProperty('--c', color);
    refs.card.classList.toggle('muted', nk.mute);
    refs.ekn.textContent = `E(${nk.k},${nk.n})`;
    const id = identify(nk.k, nk.n, nk.rot);
    if (id) {
      refs.name.textContent = id.exact ? id.name : `${id.name} necklace`;
      refs.name.title = id.origin + (id.exact ? '' : ' (rotated from the paper\'s orientation)');
    } else {
      refs.name.textContent = '';
      refs.name.title = '';
    }
    refs.mute.setAttribute('aria-pressed', String(nk.mute));
    refs.remove.disabled = getState().necklaces.length <= 1;
    if (refs.n.input.value !== String(nk.n)) refs.n.input.value = String(nk.n);
    refs.n.out.textContent = String(nk.n);
    refs.k.input.max = String(nk.n);
    if (refs.k.input.value !== String(nk.k)) refs.k.input.value = String(nk.k);
    refs.k.out.textContent = String(nk.k);
    refs.rot.input.max = String(nk.n - 1);
    if (refs.rot.input.value !== String(nk.rot)) refs.rot.input.value = String(nk.rot);
    refs.rot.out.textContent = String(nk.rot);
    if (refs.voice.value !== nk.voice) refs.voice.value = nk.voice;

    const bits = pattern(nk.k, nk.n, nk.rot);
    refs.box.replaceChildren(...toBox(bits).split('').map((ch) => el('span', ch === 'x' ? 'on' : 'off', ch)));
    refs.iv.textContent = `(${intervals(bits).join(' ')})`;
  }

  function sync() {
    const state = getState();
    const ids = new Set(state.necklaces.map((nk) => nk.id));
    for (const [id, refs] of cards) {
      if (!ids.has(id)) {
        refs.card.remove();
        cards.delete(id);
      }
    }
    state.necklaces.forEach((nk, index) => {
      let refs = cards.get(nk.id);
      if (!refs) {
        refs = build(nk);
        cards.set(nk.id, refs);
      }
      update(refs, nk, index);
      if (root.children[index] !== refs.card) root.insertBefore(refs.card, root.children[index] || null);
    });
  }

  return { sync };
}
