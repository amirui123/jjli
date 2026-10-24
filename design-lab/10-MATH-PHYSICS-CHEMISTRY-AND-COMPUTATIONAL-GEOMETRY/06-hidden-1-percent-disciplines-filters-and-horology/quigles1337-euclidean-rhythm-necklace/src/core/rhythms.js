/**
 * Every Euclidean rhythm Toussaint prints in "The Euclidean Algorithm Generates Traditional
 * Musical Rhythms" (2005), in the exact form the paper prints it, with the name the paper
 * gives it and the onset the paper says it is usually started on.
 *
 *   start — 1-based onset index the paper says the rhythm is usually started on
 *           (1 = play E(k,n) as printed). "Started on the second onset" => start: 2.
 *   alts  — other named rhythms the paper identifies as rotations of the same necklace.
 */
import { bjorklund, onsets, rotate, toBox } from './euclid.js';

export const RHYTHMS = [
  { k: 1, n: 2, box: 'x.', name: 'One in two', origin: 'the simplest Euclidean rhythms, k = 1', start: 1 },
  { k: 1, n: 3, box: 'x..', name: 'One in three', origin: 'the simplest Euclidean rhythms, k = 1', start: 1 },
  { k: 1, n: 4, box: 'x...', name: 'One in four', origin: 'the simplest Euclidean rhythms, k = 1', start: 1 },
  { k: 2, n: 3, box: 'x.x', name: 'Swing Tumbao', origin: 'Afro-Cuban conga pattern in 6/8; also the Cueca of Latin America', start: 1 },
  {
    k: 2, n: 5, box: 'x.x..', name: 'Khafif-e-ramal',
    origin: '13th-century Persian; the metre of the 2nd movement of Tchaikovsky\'s Symphony No. 6', start: 1,
    alts: [{ name: 'Take Five', start: 2, origin: 'Dave Brubeck; also Mars from Holst\'s The Planets' }],
  },
  { k: 3, n: 4, box: 'x.xx', name: 'Cumbia', origin: 'Colombia; also the Calypso of Trinidad, the Persian Khalif-e-saghil and the trochoid choreic of ancient Greece', start: 1 },
  { k: 3, n: 5, box: 'x.x.x', name: 'Khafif-e-ramal', origin: '13th-century Persian, started on the 2nd onset; also a Rumanian folk dance', start: 2 },
  { k: 3, n: 7, box: 'x.x.x..', name: 'Ruchenitza', origin: 'Bulgarian folk dance; also the metre of Pink Floyd\'s Money', start: 1 },
  { k: 3, n: 8, box: 'x..x..x.', name: 'Tresillo', origin: 'Cuba; the Habanera of rockabilly, the atoke bell of the Ewe, the first bar of the son clave', start: 1 },
  { k: 4, n: 7, box: 'x.x.x.x', name: 'Ruchenitza', origin: 'another Bulgarian folk-dance rhythm', start: 1 },
  { k: 4, n: 9, box: 'x.x.x.x..', name: 'Aksak', origin: 'Turkey; also Dave Brubeck\'s Rondo a la Turk', start: 1 },
  { k: 4, n: 11, box: 'x..x..x..x.', name: 'Outside Now', origin: 'the metric pattern of Frank Zappa\'s Outside Now', start: 1 },
  { k: 4, n: 12, box: 'x..x..x..x..', name: 'Fandango', origin: '12/8 clapping pattern of Flamenco (loud clap, soft, soft)', start: 1 },
  { k: 5, n: 6, box: 'x.xxxx', name: 'York-Samai', origin: 'popular Arab rhythm, started on the 2nd onset', start: 2 },
  { k: 5, n: 7, box: 'x.xx.xx', name: 'Nawakhat', origin: 'popular Arab rhythm', start: 1 },
  {
    k: 5, n: 8, box: 'x.xx.xx.', name: 'Cinquillo',
    origin: 'Cuba; the hand-claps of Hound Dog; widely used in West African music', start: 1,
    alts: [{ name: 'Spanish Tango', start: 2, origin: 'also the 13th-century Persian Al-saghil-al-sani' }],
  },
  {
    k: 5, n: 9, box: 'x.x.x.x.x', name: 'Agsag-Samai', origin: 'popular Arab rhythm', start: 1,
    alts: [{ name: 'Venda drum pattern', start: 2, origin: 'South Africa; also a Rumanian folk dance' }],
  },
  { k: 5, n: 11, box: 'x.x.x.x.x..', name: 'Pictures at an Exhibition', origin: 'the metric pattern Moussorgsky used', start: 1 },
  { k: 5, n: 12, box: 'x..x.x..x.x.', name: 'Venda clapping', origin: 'clapping pattern of a South African children\'s song', start: 1 },
  { k: 5, n: 13, box: 'x..x.x..x.x..', name: 'Bjorklund\'s example', origin: 'the worked example of the paper; 13 is not a common measure in world music', start: 1 },
  { k: 5, n: 16, box: 'x..x..x..x..x...', name: 'Bossa nova', origin: 'Brazil; the bossa nova usually starts on the 3rd onset', start: 3 },
  { k: 7, n: 8, box: 'x.xxxxxx', name: 'Bendir', origin: 'frame-drum rhythm accompanying songs of the Tuareg of Libya', start: 1 },
  {
    k: 7, n: 12, box: 'x.xx.x.xx.x.', name: 'West African bell', origin: 'the Mpre rhythm of the Ashanti of Ghana', start: 1,
    alts: [{ name: 'Bembé bell', start: 3, origin: 'the Bembé bell pattern of West Africa (paper, Fig. 3a)' }],
  },
  {
    k: 7, n: 16, box: 'x..x.x.x..x.x.x.', name: 'Samba', origin: 'Brazil; the samba starts E(7,16) on its last onset', start: 7,
    alts: [{ name: 'Ghana clapping', start: 5, origin: 'a clapping pattern from Ghana' }],
  },
  {
    k: 9, n: 16, box: 'x.xx.x.x.xx.x.x.', name: 'Central African necklace', origin: 'rhythm necklace of the Central African Republic', start: 1,
    alts: [
      { name: 'Samba cow-bell', start: 4, origin: 'West and Central Africa; the cow-bell of the Brazilian samba' },
      { name: 'Ngbaka-Maibo bell', start: 8, origin: 'Central African Republic, started on the penultimate onset' },
    ],
  },
  { k: 11, n: 24, box: 'x..x.x.x.x.x..x.x.x.x.x.', name: 'Aka Pygmies', origin: 'Central Africa; usually started on the 7th onset', start: 7 },
  { k: 13, n: 24, box: 'x.xx.x.x.x.x.xx.x.x.x.x.', name: 'Aka Pygmies (upper Sangha)', origin: 'Central Africa; usually started on the 4th onset', start: 4 },
];

export function findRhythm(k, n) {
  return RHYTHMS.find((r) => r.k === k && r.n === n) || null;
}

/** Rotation (steps) that starts E(k,n) on its `start`-th onset (1-based). */
export function rotationForStart(k, n, start) {
  const o = onsets(bjorklund(k, n));
  return o[(((start - 1) % o.length) + o.length) % o.length];
}

/**
 * Name the rhythm the app is currently showing.
 * Returns { name, origin, exact } where `exact` says whether the rotation matches the
 * paper's orientation for that name; or null when (k,n) is not in the paper.
 */
export function identify(k, n, rot) {
  const r = findRhythm(k, n);
  if (!r) return null;
  const want = ((rot % n) + n) % n;
  const candidates = [{ name: r.name, start: r.start, origin: r.origin }, ...(r.alts || [])];
  for (const c of candidates) {
    if (rotationForStart(k, n, c.start) === want) return { name: c.name, origin: c.origin, exact: true };
  }
  return { name: r.name, origin: r.origin, exact: false };
}

/** Picker entries grouped by step count: [{ n, entries }] ascending in n, then k. */
export function pickerGroups() {
  const byN = new Map();
  for (const e of pickerEntries()) {
    if (!byN.has(e.n)) byN.set(e.n, []);
    byN.get(e.n).push(e);
  }
  return [...byN.keys()]
    .sort((a, b) => a - b)
    .map((n) => ({ n, entries: byN.get(n).slice().sort((a, b) => a.k - b.k || a.rot - b.rot) }));
}

/** Flat list for a picker: the 27 paper rhythms plus their named rotations. */
export function pickerEntries() {
  const out = [];
  for (const r of RHYTHMS) {
    const rot = rotationForStart(r.k, r.n, r.start);
    out.push({ id: `${r.k}-${r.n}`, k: r.k, n: r.n, rot, name: r.name, origin: r.origin, box: toBox(rotate(bjorklund(r.k, r.n), rot)) });
    for (const a of r.alts || []) {
      const arot = rotationForStart(r.k, r.n, a.start);
      out.push({ id: `${r.k}-${r.n}-${a.start}`, k: r.k, n: r.n, rot: arot, name: a.name, origin: a.origin, box: toBox(rotate(bjorklund(r.k, r.n), arot)) });
    }
  }
  return out;
}
