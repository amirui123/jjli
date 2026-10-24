/* ==========================================================================
   CLACKIFY® — ENGINE.JS
   ULTRA-LOW LATENCY AUDIO PLAYBACK ENGINE
   --------------------------------------------------------------------------
   - AudioContext(latencyHint:'interactive')  -> smallest hardware buffer
   - Pre-rendered sample banks cached in RAM   -> zero synthesis at key time
   - One BufferSource voice per keystroke      -> full polyphony, no cut-offs
   - Per-event random resampling               -> +/- pitch variation
   - Honest latency telemetry (base + output + dispatch)
   ========================================================================== */

window.ClackEngine = (function () {
  'use strict';

  var MAX_VOICES = 48;

  function ClackEngine() {
    this.ctx = null;
    this.master = null;
    this.analyser = null;
    this.banks = null;
    this.ready = false;

    this.currentPack = 'alpaca';
    this.pitchVar = 1.2;          // percent, +/- applied per event
    this.gainPerClass = {         // playback trim per key class (post-render)
      char: 1.0, space: 1.0, enter: 1.0, backspace: 1.0, mod: 0.95, nav: 0.95
    };

    this.activeVoices = 0;
    this.peakVoices = 0;
    this.totalEvents = 0;
    this.dropped = 0;
    this._voices = [];
  }

  /* ---------------------------------------------------------------------
     BOOT — create context, render all banks
     --------------------------------------------------------------------- */
  ClackEngine.prototype.boot = function (onProgress) {
    var self = this;
    var AC = window.AudioContext || window.webkitAudioContext;

    this.ctx = new AC({ latencyHint: 'interactive' });

    this.master = this.ctx.createGain();
    this.master.gain.value = 0; // silent until engage()

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.55;

    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    return ClackSynth.renderAll(this.ctx.sampleRate, onProgress).then(function (banks) {
      self.banks = banks;
      self.ready = true;
      return banks;
    });
  };

  /* ---------------------------------------------------------------------
     ENGAGE — user gesture unlocks the stream
     --------------------------------------------------------------------- */
  ClackEngine.prototype.engage = function () {
    var self = this;
    var p = (this.ctx.state === 'suspended') ? this.ctx.resume() : Promise.resolve();
    return p.then(function () {
      self.master.gain.setTargetAtTime(0.9, self.ctx.currentTime, 0.015);
      return self.ctx.state;
    });
  };

  ClackEngine.prototype.setVolume = function (v01) {
    if (!this.ctx) return;
    var g = Math.pow(Math.max(0, Math.min(1, v01)), 1.5) * 0.9;
    this.master.gain.setTargetAtTime(g, this.ctx.currentTime, 0.02);
  };

  ClackEngine.prototype.setPack = function (packId) {
    if (this.banks && this.banks[packId]) this.currentPack = packId;
  };

  /* ---------------------------------------------------------------------
     TRIGGER — the hot path. Called on every physical keydown/keyup.
     Returns a meta object for the telemetry UI.
     --------------------------------------------------------------------- */
  ClackEngine.prototype.trigger = function (keyClass, phase) {
    if (!this.ready) return null;
    if (this.activeVoices >= MAX_VOICES) { this.dropped++; return null; }

    var bank = this.banks[this.currentPack];
    if (!bank || !bank[keyClass]) return null;
    var buffer = bank[keyClass][phase];
    if (!buffer) return null;

    var ctx = this.ctx;
    var pv = this.pitchVar / 100;
    var rate = 1 + (Math.random() * 2 - 1) * pv;          // +/- pitch variation
    var jitter = 0.94 + Math.random() * 0.12;             // gain jitter

    var src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;

    var g = ctx.createGain();
    g.gain.value = (this.gainPerClass[keyClass] || 1) * jitter;

    src.connect(g);
    g.connect(this.master);

    var self = this;
    this.activeVoices++;
    if (this.activeVoices > this.peakVoices) this.peakVoices = this.activeVoices;
    var entry = { src: src, g: g };
    this._voices.push(entry);

    src.onended = function () {
      self.activeVoices = Math.max(0, self.activeVoices - 1);
      var i = self._voices.indexOf(entry);
      if (i >= 0) self._voices.splice(i, 1);
      try { g.disconnect(); } catch (e) { /* noop */ }
    };

    src.start();
    this.totalEvents++;

    return {
      pack: this.currentPack,
      keyClass: keyClass,
      phase: phase,
      rate: rate,
      voiceMs: Math.round(buffer.duration * 1000),
      voices: this.activeVoices
    };
  };

  /* ---------------------------------------------------------------------
     TELEMETRY
     --------------------------------------------------------------------- */
  ClackEngine.prototype.latency = function () {
    if (!this.ctx) return { base: 0, output: 0 };
    var base = (typeof this.ctx.baseLatency === 'number') ? this.ctx.baseLatency : 0.005;
    var out = (typeof this.ctx.outputLatency === 'number') ? this.ctx.outputLatency : 0.010;
    return { base: base, output: out };
  };

  ClackEngine.prototype.level = function () {
    if (!this.analyser) return { rms: 0, peak: 0 };
    var buf = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buf);
    var sum = 0, peak = 0;
    for (var i = 0; i < buf.length; i++) {
      var v = buf[i];
      sum += v * v;
      var a = Math.abs(v);
      if (a > peak) peak = a;
    }
    return { rms: Math.sqrt(sum / buf.length), peak: peak };
  };

  ClackEngine.prototype.scopeData = function (arr) {
    if (!this.analyser) return arr;
    this.analyser.getFloatTimeDomainData(arr);
    return arr;
  };

  ClackEngine.prototype.bufferFrames = function () {
    // Best-effort hardware buffer estimate from base latency.
    if (!this.ctx) return 0;
    var base = (typeof this.ctx.baseLatency === 'number') ? this.ctx.baseLatency : 0.005;
    var frames = Math.round(base * this.ctx.sampleRate);
    return Math.max(64, Math.min(2048, frames));
  };

  ClackEngine.MAX_VOICES = MAX_VOICES;
  return ClackEngine;
})();
