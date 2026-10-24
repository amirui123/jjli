/* -----------------------------------------------
 * GuillocheJS - Spirographic pattern generator
 * Author: Guillaume Bonnet - guillaumebonnet.fr
 * MIT license: http://opensource.org/licenses/MIT
 * GitHub: github.com/stabla/
 * v2.0
 * ----------------------------------------------- */

// -- Perlin Noise 1D --

const PerlinNoise = (() => {
  const PERM = new Uint8Array(512);
  const GRAD = [1, -1, 1, -1, 1, -1, 1, -1];

  // Seed the permutation table
  function seed(s) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle with seed
    let m = s || 0;
    for (let i = 255; i > 0; i--) {
      m = (m * 16807 + 1) & 0x7fffffff;
      const j = m % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  }

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function noise1d(x) {
    const xi = Math.floor(x) & 255;
    const xf = x - Math.floor(x);
    const u = fade(xf);
    const g0 = GRAD[PERM[xi] & 7] * xf;
    const g1 = GRAD[PERM[xi + 1] & 7] * (xf - 1);
    return lerp(g0, g1, u);
  }

  // Fractal Brownian Motion for richer noise
  function fbm(x, octaves = 4, lacunarity = 2, gain = 0.5) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxAmp = 0;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * noise1d(x * frequency);
      maxAmp += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return value / maxAmp;
  }

  seed(42);

  return { noise1d, fbm, seed };
})();

class GuillocheJS {

  static TYPES = {
    HYPOTROCHOID: 'Hypotrochoid',
    EPITROCHOID: 'Epitrochoid',
    HYPOCYCLOID: 'Hypocycloid',
  };

  static DEFAULTS = {
    figure: {
      majorR: 40,
      minorR: 0.25,
      steps: 1200,
      radius: 25,
      angle: 1,
      amplitude: 4.5,
      multiplier: 2,
    },
    appearance: {
      opacity: 1,
      lineColor: '#000000',
      backgroundColor: '#FFFFFF',
      lineWidth: 0.5,
      type: 'Hypotrochoid',
    },
    motion: {
      duration: 2000,
      delay: 100,
      easing: [0.42, 0.0, 1.00, 1.0],
      iterations: 0,
      direction: 'normal',
      timeBetween: 2000,
    },
  };

  constructor(container, options = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) {
      throw new Error('GuillocheJS: container element not found');
    }

    this._container = container;
    this._figure = { ...GuillocheJS.DEFAULTS.figure, ...(options.figure || {}) };
    this._appearance = { ...GuillocheJS.DEFAULTS.appearance, ...(options.appearance || {}) };
    this._motion = { ...GuillocheJS.DEFAULTS.motion, ...(options.motion || {}) };

    this._canvas = null;
    this._ctx = null;
    this._dpr = 1;
    this._logicalWidth = 0;
    this._logicalHeight = 0;
    this._animationId = null;
    this._animationTimeout = null;
    this._resizeObserver = null;
    this._resizeRafId = null;

    this._initCanvas();
  }

  // -- Public API --

  get figure() { return { ...this._figure }; }
  get appearance() { return { ...this._appearance }; }
  get motion() { return { ...this._motion }; }

  draw() {
    const points = this._computePath(this._figure);
    this._renderPath(points);
  }

  drawPreview(figure, color = null, opacity = 0.2) {
    const points = this._computePath(figure);
    const ctx = this._ctx;
    ctx.strokeStyle = color || this._appearance.lineColor;
    ctx.lineWidth = this._appearance.lineWidth;
    ctx.globalAlpha = opacity;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  clear() {
    const ctx = this._ctx;
    const hw = this._logicalWidth / 2;
    const hh = this._logicalHeight / 2;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.clearRect(-hw - 1, -hh - 1, this._logicalWidth + 2, this._logicalHeight + 2);
    ctx.fillStyle = this._appearance.backgroundColor;
    ctx.fillRect(-hw, -hh, this._logicalWidth, this._logicalHeight);
    ctx.restore();
  }

  setFigure(opts) {
    Object.assign(this._figure, opts);
    this.clear();
    this.draw();
  }

  setAppearance(opts) {
    Object.assign(this._appearance, opts);
    this.clear();
    this.draw();
  }

  setMotion(opts) {
    Object.assign(this._motion, opts);
  }

  animate(finalState, motionOverrides = {}, onFrame = null) {
    this.stop();

    const motion = { ...this._motion, ...motionOverrides };
    const startState = { ...this._figure };
    const endState = { ...this._figure, ...finalState };

    // Pre-compute both full paths at the same resolution.
    // Use the higher step count so no detail is lost.
    const resolution = Math.max(
      Math.round(startState.steps),
      Math.round(endState.steps),
      500
    );
    const startForPath = { ...startState, steps: resolution };
    const endForPath = { ...endState, steps: resolution };
    const startPoints = this._computePath(startForPath);
    const endPoints = this._computePath(endForPath);

    // Pre-allocate the interpolation buffer (reused every frame)
    const framePoints = new Float64Array(startPoints.length);

    let iterationCount = 0;
    let forward = motion.direction !== 'alternate-reverse';
    this._animating = true;

    const startIteration = () => {
      const easingFn = this._resolveEasing(motion.easing);
      const fromPoints = forward ? startPoints : endPoints;
      const toPoints = forward ? endPoints : startPoints;
      const fromState = forward ? startState : endState;
      const toState = forward ? endState : startState;
      let startTime = null;

      const tick = (now) => {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / motion.duration, 1);
        const t = easingFn(progress);

        // Lerp all points directly — no trig, no _computePath
        const len = framePoints.length;
        const oneMinusT = 1 - t;
        for (let i = 0; i < len; i++) {
          framePoints[i] = fromPoints[i] * oneMinusT + toPoints[i] * t;
        }

        this.clear();
        this._renderPath(framePoints);

        // Lerp figure params for onFrame callback and final state tracking
        if (onFrame || progress >= 1) {
          const interpolated = {};
          for (const key of Object.keys(fromState)) {
            interpolated[key] = fromState[key] + (toState[key] - fromState[key]) * t;
          }
          this._figure = interpolated;
          if (onFrame) onFrame(interpolated, progress);
        }

        if (progress < 1) {
          this._animationId = requestAnimationFrame(tick);
        } else {
          this._figure = { ...toState };

          iterationCount++;

          if (motion.iterations === 0 || iterationCount < motion.iterations) {
            if (motion.direction === 'alternate' || motion.direction === 'alternate-reverse') {
              forward = !forward;
            }
            this._animationTimeout = setTimeout(startIteration, motion.timeBetween);
          } else {
            this._animating = false;
          }
        }
      };

      if (iterationCount === 0 && motion.delay > 0) {
        this._animationTimeout = setTimeout(() => {
          this._animationId = requestAnimationFrame(tick);
        }, motion.delay);
      } else {
        this._animationId = requestAnimationFrame(tick);
      }
    };

    startIteration();
  }

  get animating() { return !!this._animating; }

  stop() {
    this._animating = false;
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    if (this._animationTimeout) {
      clearTimeout(this._animationTimeout);
      this._animationTimeout = null;
    }
  }

  resize() {
    this._setupHiDPI();
    this.clear();
    this.draw();
  }

  exportPNG(size = 4096) {
    const points = this._computePath(this._figure);

    // Compute bounding box of the pattern
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
      if (points[i] < minX) minX = points[i];
      if (points[i] > maxX) maxX = points[i];
      if (points[i + 1] < minY) minY = points[i + 1];
      if (points[i + 1] > maxY) maxY = points[i + 1];
    }

    const patternW = maxX - minX || 1;
    const patternH = maxY - minY || 1;
    const padding = size * 0.05;
    const usable = size - padding * 2;
    const scale = Math.min(usable / patternW, usable / patternH);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext('2d');

    ctx.translate(size / 2, size / 2);

    ctx.strokeStyle = this._appearance.lineColor;
    ctx.lineWidth = this._appearance.lineWidth * scale;
    ctx.globalAlpha = this._appearance.opacity;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo((points[0] - cx) * scale, (points[1] - cy) * scale);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo((points[i] - cx) * scale, (points[i + 1] - cy) * scale);
    }
    ctx.stroke();

    return new Promise((resolve) => {
      offscreen.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  destroy() {
    this.stop();
    if (this._resizeRafId) {
      cancelAnimationFrame(this._resizeRafId);
      this._resizeRafId = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._canvas && this._canvas.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
    this._canvas = null;
    this._ctx = null;
  }

  // -- Private --

  _initCanvas() {
    this._canvas = document.createElement('canvas');
    this._canvas.className = 'guilloche-canvas';
    this._canvas.style.display = 'block';
    this._container.appendChild(this._canvas);

    this._ctx = this._canvas.getContext('2d');

    this._resizeObserver = new ResizeObserver(() => {
      if (this._resizeRafId) return;
      this._resizeRafId = requestAnimationFrame(() => {
        this._resizeRafId = null;
        this._setupHiDPI();
        this.clear();
        this.draw();
      });
    });
    this._resizeObserver.observe(this._container);

    this._setupHiDPI();
  }

  _setupHiDPI() {
    const dpr = window.devicePixelRatio || 1;
    this._dpr = dpr;

    const rect = this._container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this._canvas.width = Math.round(width * dpr);
    this._canvas.height = Math.round(height * dpr);
    this._canvas.style.width = width + 'px';
    this._canvas.style.height = height + 'px';

    this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._ctx.translate(width / 2, height / 2);

    this._logicalWidth = width;
    this._logicalHeight = height;
  }

  _computePath(figure) {
    const steps = Math.max(1, Math.round(figure.steps));
    const points = new Float64Array((steps + 1) * 2);
    const thetaStep = figure.multiplier * Math.PI / steps;

    const majorR = figure.majorR;
    const minorR = figure.minorR;
    const sub = majorR - minorR;
    const add = majorR + minorR;
    const s = sub / minorR;
    const radiusGame = minorR + figure.radius;
    const amp = figure.amplitude;
    const angleMultiplier = figure.angle;
    const type = this._appearance.type;

    let theta = 0;

    if (type === 'Hypotrochoid') {
      for (let t = 0; t <= steps; t++) {
        const et = angleMultiplier * theta;
        const idx = t * 2;
        points[idx] = (sub * Math.cos(et) + radiusGame * Math.cos(s * et)) * amp;
        points[idx + 1] = (sub * Math.sin(et) + radiusGame * Math.sin(s * et)) * amp;
        theta += thetaStep;
      }
    } else if (type === 'Epitrochoid') {
      const addOverMinor = add / minorR;
      for (let t = 0; t <= steps; t++) {
        const et = angleMultiplier * theta;
        const idx = t * 2;
        points[idx] = (add * Math.cos(et) + radiusGame * Math.cos(addOverMinor * et)) * amp;
        points[idx + 1] = (add * Math.sin(et) + radiusGame * Math.sin(addOverMinor * et)) * amp;
        theta += thetaStep;
      }
    } else if (type === 'Hypocycloid') {
      for (let t = 0; t <= steps; t++) {
        const et = angleMultiplier * theta;
        const idx = t * 2;
        points[idx] = (sub * Math.cos(et) + minorR * Math.cos(s * et)) * amp;
        points[idx + 1] = (sub * Math.sin(et) + minorR * Math.sin(s * et)) * amp;
        theta += thetaStep;
      }
    }

    return points;
  }

  _renderPath(points) {
    const ctx = this._ctx;
    ctx.strokeStyle = this._appearance.lineColor;
    ctx.lineWidth = this._appearance.lineWidth;
    ctx.globalAlpha = this._appearance.opacity;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      ctx.lineTo(points[i], points[i + 1]);
    }
    ctx.stroke();
  }

  _lerp(a, b, t) {
    return a + (b - a) * t;
  }

  static perlinEasing(speed = 3, strength = 0.3) {
    // Reseed for variety each time
    PerlinNoise.seed(Math.floor(Math.random() * 100000));
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      // Noise displacement that tapers at endpoints
      const envelope = 4 * t * (1 - t); // 0 at edges, 1 at midpoint
      const n = PerlinNoise.fbm(t * speed, 4);
      return Math.max(0, Math.min(1, t + strength * envelope * n));
    };
  }

  _resolveEasing(easing) {
    if (typeof easing === 'function') return easing;
    if (easing === 'perlin') return GuillocheJS.perlinEasing();
    if (Array.isArray(easing)) {
      if (easing.length === 2 && easing[0] === 'perlin') {
        // ['perlin', { speed, strength }]
        return GuillocheJS.perlinEasing(easing[1].speed, easing[1].strength);
      }
      return BezierEasing(easing[0], easing[1], easing[2], easing[3]);
    }
    if (typeof easing === 'string') {
      const named = BezierEasing.css[easing];
      if (named) return named;
      const match = easing.match(
        /cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/
      );
      if (match) return BezierEasing(+match[1], +match[2], +match[3], +match[4]);
    }
    return (t) => t;
  }
}
