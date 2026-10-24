/**
 * A <select> of every rhythm the paper names, grouped by step count. Choosing one loads
 * E(k,n) started on the onset the paper says it is usually started on.
 */
import { pickerGroups, pickerEntries } from '../core/rhythms.js';

const PLACEHOLDER = 'Load a rhythm from the paper…';

let byId = null;
function index() {
  if (!byId) byId = new Map(pickerEntries().map((e) => [e.id, e]));
  return byId;
}

export function entryById(id) {
  return index().get(id) || null;
}

export function fillPicker(select) {
  select.replaceChildren();
  const ph = document.createElement('option');
  ph.value = '';
  ph.textContent = PLACEHOLDER;
  select.append(ph);
  for (const g of pickerGroups()) {
    const grp = document.createElement('optgroup');
    grp.label = `${g.n} steps`;
    for (const e of g.entries) {
      const o = document.createElement('option');
      o.value = e.id;
      o.textContent = `${e.name} · E(${e.k},${e.n})${e.rot ? ' ↻' : ''}`;
      o.title = e.origin;
      grp.append(o);
    }
    select.append(grp);
  }
  select.value = '';
  return select;
}

/** Wire a select: onPick(entry) fires with the chosen rhythm, then the select resets. */
export function mountPicker(select, onPick) {
  fillPicker(select);
  select.addEventListener('change', () => {
    const e = entryById(select.value);
    select.value = '';
    if (e) onPick(e);
  });
  return select;
}
