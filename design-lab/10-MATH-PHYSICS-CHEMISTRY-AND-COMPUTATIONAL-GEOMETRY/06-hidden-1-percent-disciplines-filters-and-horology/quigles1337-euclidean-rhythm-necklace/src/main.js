import { pattern } from './core/euclid.js';
import { defaultState, colorOf, clampTempo, addNecklace, removeNecklace, LIMITS, encode, decode } from './core/state.js';
import { createRenderer } from './render.js';
import { ensureAudio, getEngine } from './audio/engine.js';
import { playVoice } from './audio/voices.js';
import { createTransport } from './scheduler.js';
import { mountPanel } from './ui/controls.js';
import { barDuration } from './core/schedule.js';
import { clipPlan } from './core/clip.js';
import { recorderSupported, recordClip, saveBlob } from './recorder.js';
import { renderPoster, POSTER_FILENAME } from './poster.js';
import { surprise } from './core/surprise.js';
import { identify } from './core/rhythms.js';
import { DEFAULT_NOTES, DEFAULT_CHANNEL, clampNote, clampChannel, midiEventsFor } from './core/midi.js';
import { midiSupported, createMidiOut } from './midi.js';
import { embedSource, stateHash, fullPageUrl } from './core/embed.js';

// The URL hash is the save file: load it, keep it current, follow it when it changes.
const state = decode(location.hash) || defaultState();
// ?embed=1 (or embed=1 in the hash): stage only, a tiny play button, a corner link.
const embedFrom = embedSource(location.search, location.hash);
const embed = embedFrom !== null;
const PANS = [-0.35, 0.35, -0.15, 0.15];
const FLASH_SECONDS = 0.28;

const canvas = document.getElementById('stage');
const hint = document.getElementById('hint');
const playBtn = document.getElementById('play');
const tempoInput = document.getElementById('tempo');
const tempoOut = document.getElementById('tempo-out');
const addBtn = document.getElementById('add');
const surpriseBtn = document.getElementById('surprise');
const shareBtn = document.getElementById('share');
const posterBtn = document.getElementById('poster');
const midiBtn = document.getElementById('midi');
const midiBar = document.getElementById('midibar');
const midiOutSel = document.getElementById('midi-out');
const midiChInput = document.getElementById('midi-ch');
const midiNotesBox = document.getElementById('midi-notes');
const recordBtn = document.getElementById('record');
const recBars = document.getElementById('rec-bars');
const recBadge = document.getElementById('rec-badge');
const recText = document.getElementById('rec-text');
const toast = document.getElementById('toast');
const embedPlay = document.getElementById('embed-play');
const embedLink = document.getElementById('embed-link');
const renderer = createRenderer(canvas);

let lastHash = '';
function writeHash() {
  const h = '#' + stateHash(state, embedFrom === 'hash');
  if (h === lastHash) return;
  lastHash = h;
  history.replaceState(null, '', h);
}

let toastTimer = null;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// Onsets scheduled on the audio clock, waiting to light up when their time comes.
const pending = [];
const flashes = new Map();

const transport = createTransport({
  engine: ensureAudio,
  getTempo: () => state.tempo,
  getNecklaces: () => state.necklaces.map((nk) => ({ id: nk.id, n: nk.n })),
  onEvent(ev) {
    const i = state.necklaces.findIndex((nk) => nk.id === ev.id);
    if (i < 0) return;
    const nk = state.necklaces[i];
    const bits = pattern(nk.k, nk.n, nk.rot);
    if (!bits[ev.step]) return;
    const engine = getEngine();
    if (!nk.mute) {
      playVoice(engine, nk.voice, ev.time, { dest: engine.bus(i, PANS[i] || 0) });
      if (midi.active) {
        const bar = transport.barAt(ev.time);
        const dur = bar ? bar.dur / ev.n : undefined;
        midi.send(midiEventsFor([{ index: i, time: ev.time, dur }], midiConfig), engine.ctx.currentTime);
      }
    }
    pending.push({ key: `${nk.id}:${ev.step}`, time: ev.time });
  },
});

function changed() {
  addBtn.disabled = state.necklaces.length >= LIMITS.maxNecklaces;
  writeHash();
  if (midi.enabled) syncMidiUI();
  if (embed) embedLink.href = fullPageUrl(shareBase(), state);
}

const panel = mountPanel(document.getElementById('panel'), {
  getState: () => state,
  onChange: changed,
  onRemove(id) {
    if (removeNecklace(state, id)) {
      changed();
      panel.sync();
    }
  },
});

addBtn.addEventListener('click', () => {
  if (addNecklace(state)) {
    changed();
    panel.sync();
  }
});

/** Replace the whole scene (tempo and necklaces) and reflect it everywhere. */
function applyState(s) {
  state.tempo = s.tempo;
  state.necklaces.splice(0, state.necklaces.length, ...s.necklaces);
  syncTempo();
  changed();
  panel.sync();
}

// Surprise me: a fresh scene from the paper, playing at once (the click is the gesture).
function surpriseMe(rng) {
  const s = surprise(rng);
  applyState(s);
  if (!transport.playing) setPlaying(true);
  const names = s.necklaces.map((nk) => {
    const id = identify(nk.k, nk.n, nk.rot);
    return id ? id.name : `E(${nk.k},${nk.n})`;
  });
  showToast(`${names.join(' + ')} · ${s.tempo} bpm`);
  return s;
}
surpriseBtn.addEventListener('click', () => surpriseMe());

// Web MIDI out: one note per necklace (GM drums by default), one channel, on a MIDI output.
const MIDI_STORAGE = 'necklace.midi';
const midiConfig = { notes: [...DEFAULT_NOTES], channel: DEFAULT_CHANNEL };
try {
  const saved = JSON.parse(localStorage.getItem(MIDI_STORAGE) || 'null');
  if (saved && typeof saved === 'object') {
    if (Array.isArray(saved.notes)) midiConfig.notes = DEFAULT_NOTES.map((d, i) => clampNote(saved.notes[i], d));
    midiConfig.channel = clampChannel(saved.channel);
    midiConfig.outputId = typeof saved.outputId === 'string' ? saved.outputId : undefined;
  }
} catch {
  /* no storage, defaults it is */
}
function saveMidiConfig() {
  try {
    localStorage.setItem(MIDI_STORAGE, JSON.stringify({ notes: midiConfig.notes, channel: midiConfig.channel, outputId: midi.output ? midi.output.id : midiConfig.outputId }));
  } catch {
    /* ignore */
  }
}

const midi = createMidiOut({ onChange: syncMidiUI });

const midiNoteInputs = DEFAULT_NOTES.map((d, i) => {
  const label = document.createElement('label');
  label.style.setProperty('--c', colorOf(i));
  const sw = document.createElement('span');
  sw.className = 'swatch';
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = '127';
  input.value = String(midiConfig.notes[i]);
  input.title = `MIDI note for necklace ${i + 1} (GM default ${d})`;
  input.setAttribute('aria-label', `MIDI note for necklace ${i + 1}`);
  input.addEventListener('change', () => {
    midiConfig.notes[i] = clampNote(input.value, d);
    input.value = String(midiConfig.notes[i]);
    saveMidiConfig();
  });
  label.append(sw, input);
  midiNotesBox.append(label);
  return label;
});

function syncMidiUI() {
  const on = midi.enabled;
  midiBtn.setAttribute('aria-pressed', String(on));
  midiBar.hidden = !on;
  if (!on) return;
  const outs = midi.outputs();
  midiOutSel.replaceChildren();
  if (outs.length === 0) {
    const o = document.createElement('option');
    o.value = '';
    o.textContent = 'no MIDI outputs found';
    midiOutSel.append(o);
    midiOutSel.disabled = true;
  } else {
    midiOutSel.disabled = false;
    for (const out of outs) {
      const o = document.createElement('option');
      o.value = out.id;
      o.textContent = out.name;
      o.selected = out.current;
      midiOutSel.append(o);
    }
  }
  midiChInput.value = String(midiConfig.channel);
  midiNoteInputs.forEach((label, i) => label.classList.toggle('spare', i >= state.necklaces.length));
}

midiOutSel.addEventListener('change', () => {
  midi.select(midiOutSel.value);
  saveMidiConfig();
});
midiChInput.addEventListener('change', () => {
  midiConfig.channel = clampChannel(midiChInput.value);
  midiChInput.value = String(midiConfig.channel);
  saveMidiConfig();
});

async function toggleMidi(on = !midi.enabled) {
  if (!on) {
    midi.disable();
    return false;
  }
  midiBtn.disabled = true;
  try {
    if (midiConfig.outputId) midi.select(midiConfig.outputId);
    await midi.enable();
    if (midi.outputs().length === 0) showToast('MIDI is on, but no output is connected. Plug one in or start a virtual port.');
    else showToast(`MIDI out → ${midi.output.name}`);
    return true;
  } catch (err) {
    showToast(`MIDI access refused: ${err && err.message ? err.message : err}`);
    midi.disable();
    return false;
  } finally {
    midiBtn.disabled = false;
    syncMidiUI();
  }
}

if (!midiSupported()) {
  midiBtn.disabled = true;
  midiBtn.title = 'Web MIDI is not available in this browser (Chrome and Edge have it)';
}
midiBtn.addEventListener('click', () => toggleMidi());

function audioNow() {
  const engine = getEngine();
  return engine ? engine.ctx.currentTime - engine.latency() : 0;
}

function updateFlashes(now) {
  for (let i = pending.length - 1; i >= 0; i--) {
    if (pending[i].time <= now) {
      flashes.set(pending[i].key, pending[i].time);
      pending.splice(i, 1);
    }
  }
  for (const [key, t] of flashes) if (now - t > FLASH_SECONDS) flashes.delete(key);
}

function flashArray(nk, now) {
  const arr = new Array(nk.n).fill(0);
  if (flashes.size === 0) return arr;
  for (let s = 0; s < nk.n; s++) {
    const t = flashes.get(`${nk.id}:${s}`);
    if (t !== undefined) arr[s] = Math.pow(Math.max(0, 1 - (now - t) / FLASH_SECONDS), 1.6);
  }
  return arr;
}

function frame() {
  const playing = transport.playing;
  const now = audioNow();
  if (playing) updateFlashes(now);
  renderer.draw({
    rings: state.necklaces.map((nk, i) => ({
      bits: pattern(nk.k, nk.n, nk.rot),
      color: colorOf(i),
      muted: nk.mute,
      flash: playing ? flashArray(nk, now) : null,
    })),
    phase: playing ? transport.phase(now) : 0,
    playing,
  });
  requestAnimationFrame(frame);
}

function setPlaying(on) {
  if (on) transport.start();
  else {
    transport.stop();
    pending.length = 0;
    flashes.clear();
    cancelRecording();
  }
  playBtn.textContent = transport.playing ? 'Stop' : 'Play';
  playBtn.setAttribute('aria-pressed', String(transport.playing));
  embedPlay.innerHTML = transport.playing ? '&#10074;&#10074;' : '&#9654;';
  embedPlay.setAttribute('aria-pressed', String(transport.playing));
}

function syncTempo() {
  tempoInput.value = String(state.tempo);
  tempoOut.textContent = String(state.tempo);
}

playBtn.addEventListener('click', () => setPlaying(!transport.playing));
embedPlay.addEventListener('click', () => setPlaying(!transport.playing));
canvas.addEventListener('pointerdown', () => setPlaying(!transport.playing));

tempoInput.addEventListener('input', () => {
  state.tempo = clampTempo(tempoInput.value);
  syncTempo();
  changed();
});

shareBtn.addEventListener('click', async () => {
  writeHash();
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied. It holds everything on screen.');
  } catch {
    showToast('Copy the address bar: the link holds everything on screen.');
  }
});

// Record: exactly N bars of the stage with sound, aligned to the next bar boundary.
let recording = null;
let recordingCancelled = false;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

function cancelRecording() {
  if (!recording) return;
  recordingCancelled = true;
  recording.cancel();
}

/** Returns the clip Blob (also used from window.NECKLACE for scripted checks). */
async function record({ bars = recBars.value, download = true } = {}) {
  if (recording) return recording;
  if (!recorderSupported()) {
    showToast('Recording needs MediaRecorder and canvas capture: try Chrome, Edge or Firefox.');
    return null;
  }
  const engine = ensureAudio();
  if (!transport.playing) setPlaying(true);
  const now = engine.ctx.currentTime;
  const bar = transport.barAt(now) || { start: now, dur: barDuration(state.tempo) };
  const plan = clipPlan(state, bars, { now, barStart: bar.start, barDur: bar.dur, minLead: 0.05 });
  recordingCancelled = false;
  recordBtn.disabled = true;
  recordBtn.setAttribute('aria-busy', 'true');
  recBars.disabled = true;
  tempoInput.disabled = true;
  recBadge.hidden = false;
  recBadge.classList.remove('live');
  recText.textContent = `ARMED · ${plural(plan.bars, 'bar')} from the next bar`;
  recording = recordClip({
    canvas,
    engine,
    plan,
    onStart() {
      recBadge.classList.add('live');
      recText.textContent = `REC · ${plural(plan.bars, 'bar')}`;
    },
  });
  try {
    const blob = await recording;
    if (recordingCancelled) {
      showToast('Recording cancelled.');
      return null;
    }
    if (download) {
      saveBlob(blob, plan.filename);
      showToast(`Saved ${plan.filename} · ${(blob.size / 1e6).toFixed(1)} MB`);
    }
    return blob;
  } catch (err) {
    showToast(`Recording failed: ${err && err.message ? err.message : err}`);
    return null;
  } finally {
    recording = null;
    recordBtn.disabled = false;
    recordBtn.removeAttribute('aria-busy');
    recBars.disabled = false;
    tempoInput.disabled = false;
    recBadge.hidden = true;
    recBadge.classList.remove('live');
  }
}

// Poster: a PNG of the scene with its names, tempo and link.
function shareBase() {
  return location.origin + location.pathname;
}

async function poster({ download = true, size = 'portrait' } = {}) {
  posterBtn.disabled = true;
  try {
    const blob = await renderPoster(state, { base: shareBase(), size });
    if (download) {
      saveBlob(blob, POSTER_FILENAME);
      showToast(`Saved ${POSTER_FILENAME}`);
    }
    return blob;
  } catch (err) {
    showToast(`Poster failed: ${err && err.message ? err.message : err}`);
    return null;
  } finally {
    posterBtn.disabled = false;
  }
}
posterBtn.addEventListener('click', () => poster());

if (!recorderSupported()) {
  recordBtn.disabled = true;
  recordBtn.title = 'Recording needs MediaRecorder and canvas capture (Chrome, Edge, Firefox)';
}
recordBtn.addEventListener('click', () => record());

window.addEventListener('hashchange', () => {
  if (location.hash === lastHash) return;
  const s = decode(location.hash);
  if (!s) return;
  lastHash = location.hash;
  applyState(s);
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    setPlaying(!transport.playing);
  }
});

hint.textContent = 'space · play / stop';
if (embed) {
  document.documentElement.classList.add('embed');
  embedPlay.hidden = false;
  embedLink.hidden = false;
}
syncTempo();
changed();
panel.sync();
new ResizeObserver(() => renderer.resize()).observe(canvas);
renderer.resize();
frame();

// Scripting hook: window.NECKLACE.record({ bars: 1, download: false }) and
// window.NECKLACE.poster({ download: false }) resolve with the Blob they would have saved.
window.NECKLACE = Object.freeze({ record, poster, surprise: surpriseMe, midi: { toggle: toggleMidi, out: midi, config: midiConfig }, embed, state });
