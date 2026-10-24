/**
 * String Pluck JS — a dependency-free plucked-string instrument for browsers.
 * Author: Craig Johnson
 * License: MIT (see LICENSE)
 *
 * Usage (load this file with <script src="string-pluck.js"></script>):
 *
 *   const stringPluck = new StringPluck({ attack: 0.008, decay: 2.2 });
 *   document.querySelector('#play').addEventListener('click', async () => {
 *     await stringPluck.resume(); // Browsers require a user gesture to start audio.
 *     stringPluck.pluck(110);     // Play A2 at 110 Hz.
 *   });
 *
 * Options: attack (seconds), decay (seconds), brightness, damping,
 * pickPosition, and volume (the last four range from 0 to 1, except
 * pickPosition, which ranges from 0.05 to 0.5). Optionally pass an existing
 * AudioContext as `context` and an AudioNode as `destination`.
 *
 * Methods: pluck(frequency, velocity = 1, overrides = {}), setParams({...}),
 * resume(), stopAll(), and dispose(). Frequency is in Hz (40–2000).
 * Parameters changed with setParams() affect subsequent notes.
 */
(function (root) {
  'use strict';
  const defaults = { attack: 0.008, decay: 2.2, brightness: 0.65, damping: 0.28, pickPosition: 0.22, volume: 0.7 };
  const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v)));
  class StringPluck {
    constructor(options = {}) {
      this.context = options.context || new (root.AudioContext || root.webkitAudioContext)();
      this.ownsContext = !options.context;
      this.output = this.context.createGain();
      this.output.connect(options.destination || this.context.destination);
      this.setParams(options);
      this.voices = new Set();
    }
    setParams(params = {}) {
      this.params = { ...defaults, ...(this.params || {}), ...params };
      const p = this.params;
      p.attack = clamp(p.attack, 0.001, 0.5);
      p.decay = clamp(p.decay, 0.15, 8);
      p.brightness = clamp(p.brightness, 0, 1);
      p.damping = clamp(p.damping, 0, 1);
      p.pickPosition = clamp(p.pickPosition, 0.05, 0.5);
      p.volume = clamp(p.volume, 0, 1);
      return this;
    }
    async resume() { if (this.context.state === 'suspended') await this.context.resume(); }
    pluck(frequency, velocity = 1, overrides = {}) {
      const ctx = this.context;
      const hz = Number(frequency);
      if (!Number.isFinite(hz) || hz < 40 || hz > 2000) throw new RangeError('frequency must be between 40 and 2000 Hz');
      const p = { ...this.params, ...overrides };
      const attack = clamp(p.attack, 0.001, 0.5);
      const decay = clamp(p.decay, 0.15, 8);
      const brightness = clamp(p.brightness, 0, 1);
      const damping = clamp(p.damping, 0, 1);
      const position = clamp(p.pickPosition, 0.05, 0.5);
      const level = clamp(p.volume, 0, 1) * clamp(velocity, 0, 1);
      const now = ctx.currentTime;
      const sampleRate = ctx.sampleRate;
      const duration = Math.min(12, decay * 2.4 + attack + 0.15);
      const length = Math.ceil(duration * sampleRate);
      const buffer = ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      const period = Math.max(8, Math.round(sampleRate / hz));
      const delay = new Float32Array(period);
      // A pluck displaces a string into a triangle at the chosen picking position.
      const peak = Math.max(1, Math.round(period * position));
      for (let i = 0; i < period; i++) delay[i] = i < peak ? i / peak : (period - i) / (period - peak);
      let mean = 0;
      for (const n of delay) mean += n;
      mean /= period;
      for (let i = 0; i < period; i++) delay[i] = (delay[i] - mean) * 0.85 + (Math.random() * 2 - 1) * brightness * 0.15;
      let cursor = 0, previous = 0;
      // Karplus-Strong delay loop; damping sets high-frequency loss on each pass.
      const blend = 0.05 + damping * 0.8;
      const feedback = Math.exp(-period / (sampleRate * decay * 0.55));
      for (let i = 0; i < length; i++) {
        const current = delay[cursor];
        data[i] = current;
        const filtered = current * (1 - blend) + previous * blend;
        delay[cursor] = filtered * feedback;
        previous = filtered;
        cursor = (cursor + 1) % period;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = Math.min(sampleRate * 0.45, 900 + brightness * 13500);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(Math.max(level * 0.42, 0.00001), now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      source.connect(tone).connect(gain).connect(this.output);
      const voice = { source, gain, tone };
      this.voices.add(voice);
      source.onended = () => { source.disconnect(); tone.disconnect(); gain.disconnect(); this.voices.delete(voice); };
      source.start(now);
      source.stop(now + duration + 0.02);
      return voice;
    }
    stopAll() {
      for (const voice of this.voices) {
        try { voice.source.stop(); } catch (_) { /* already stopped */ }
      }
    }
    async dispose() {
      this.stopAll();
      this.output.disconnect();
      if (this.ownsContext) await this.context.close();
    }
  }
  root.StringPluck = StringPluck;
  if (typeof module !== 'undefined' && module.exports) module.exports = StringPluck;
})(typeof globalThis !== 'undefined' ? globalThis : window);
