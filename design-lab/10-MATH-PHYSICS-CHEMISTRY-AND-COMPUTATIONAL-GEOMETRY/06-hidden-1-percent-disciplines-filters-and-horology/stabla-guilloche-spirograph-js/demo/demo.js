/*
 * GuillocheJS Interactive Demo
 * dat.gui panel provides sliders for all parameters.
 */

const container = document.getElementById('guilloche');

const guilloche = new GuillocheJS(container, {
  figure: {
    majorR: 40,
    minorR: 0.25,
    steps: Math.round(Math.random() * 2400) || 1200,
    radius: 25,
    angle: 1,
    amplitude: 4.5,
    multiplier: 2,
  },
  appearance: {
    lineColor: '#000000',
    backgroundColor: '#FFFFFF',
    lineWidth: 0.5,
    type: 'Hypotrochoid',
  },
});

guilloche.clear();
guilloche.draw();

// -- dat.gui Control Panel --

const params = {
  majorR: guilloche.figure.majorR,
  minorR: guilloche.figure.minorR,
  steps: guilloche.figure.steps,
  radius: guilloche.figure.radius,
  angle: guilloche.figure.angle,
  amplitude: guilloche.figure.amplitude,
  multiplier: guilloche.figure.multiplier,
  lineColor: guilloche.appearance.lineColor,
  backgroundColor: guilloche.appearance.backgroundColor,
  lineWidth: guilloche.appearance.lineWidth,
  opacity: guilloche.appearance.opacity,
  type: guilloche.appearance.type,
};

const gui = new dat.GUI({ width: 280 });

const figureFolder = gui.addFolder('Figure');
figureFolder.add(params, 'majorR', 0, 200).step(0.1).name('Major R').onChange(updateFigure);
figureFolder.add(params, 'minorR', 0.01, 100).step(0.01).name('Minor R').onChange(updateFigure);
figureFolder.add(params, 'steps', 10, 5000).step(1).name('Steps').onChange(updateFigure);
figureFolder.add(params, 'radius', 0, 100).step(0.1).name('Radius').onChange(updateFigure);
figureFolder.add(params, 'angle', 0, 10).step(0.01).name('Angle').onChange(updateFigure);
figureFolder.add(params, 'amplitude', 0, 20).step(0.1).name('Amplitude').onChange(updateFigure);
figureFolder.add(params, 'multiplier', 0, 10).step(0.1).name('Multiplier').onChange(updateFigure);
figureFolder.open();

const appearanceFolder = gui.addFolder('Appearance');
appearanceFolder.addColor(params, 'lineColor').name('Line Color').onChange(updateAppearance);
appearanceFolder.addColor(params, 'backgroundColor').name('Background').onChange(updateAppearance);
appearanceFolder.add(params, 'lineWidth', 0.1, 5).step(0.1).name('Line Width').onChange(updateAppearance);
appearanceFolder.add(params, 'opacity', 0, 1).step(0.01).name('Opacity').onChange(updateAppearance);
appearanceFolder.add(params, 'type', ['Hypotrochoid', 'Epitrochoid', 'Hypocycloid']).name('Type').onChange(updateAppearance);
appearanceFolder.open();

function updateFigure() {
  guilloche.setFigure({
    majorR: params.majorR,
    minorR: params.minorR,
    steps: params.steps,
    radius: params.radius,
    angle: params.angle,
    amplitude: params.amplitude,
    multiplier: params.multiplier,
  });
  redrawPreview();
}

function updateAppearance() {
  guilloche.setAppearance({
    lineColor: params.lineColor,
    backgroundColor: params.backgroundColor,
    lineWidth: params.lineWidth,
    opacity: params.opacity,
    type: params.type,
  });
  redrawPreview();
}

// -- Target State (animation destination) --

const target = {
  majorR: 80,
  minorR: 5,
  steps: 2000,
  radius: 40,
  angle: 2,
  amplitude: 8,
  multiplier: 4,
  showPreview: true,
  previewColor: '#0066ff',
  previewOpacity: 0.5,
};

const targetFolder = gui.addFolder('Target (end state)');
targetFolder.add(target, 'majorR', 0, 200).step(0.1).name('Major R').onChange(redrawPreview);
targetFolder.add(target, 'minorR', 0.01, 100).step(0.01).name('Minor R').onChange(redrawPreview);
targetFolder.add(target, 'steps', 10, 5000).step(1).name('Steps').onChange(redrawPreview);
targetFolder.add(target, 'radius', 0, 100).step(0.1).name('Radius').onChange(redrawPreview);
targetFolder.add(target, 'angle', 0, 10).step(0.01).name('Angle').onChange(redrawPreview);
targetFolder.add(target, 'amplitude', 0, 20).step(0.1).name('Amplitude').onChange(redrawPreview);
targetFolder.add(target, 'multiplier', 0, 10).step(0.1).name('Multiplier').onChange(redrawPreview);
targetFolder.add(target, 'showPreview').name('Show Preview').onChange(redrawPreview);
targetFolder.addColor(target, 'previewColor').name('Preview Color').onChange(redrawPreview);
targetFolder.add(target, 'previewOpacity', 0.05, 0.5).step(0.05).name('Preview Alpha').onChange(redrawPreview);
targetFolder.open();

function getTargetFigure() {
  return {
    majorR: target.majorR,
    minorR: target.minorR,
    steps: target.steps,
    radius: target.radius,
    angle: target.angle,
    amplitude: target.amplitude,
    multiplier: target.multiplier,
  };
}

function redrawPreview() {
  guilloche.clear();
  guilloche.draw();
  if (target.showPreview && !guilloche.animating) {
    guilloche.drawPreview(getTargetFigure(), target.previewColor, target.previewOpacity);
  }
}

// Initial preview
redrawPreview();

// -- Utilities --

const types = ['Hypotrochoid', 'Epitrochoid', 'Hypocycloid'];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randomFigure() {
  return {
    majorR: Math.round(rand(10, 120) * 10) / 10,
    minorR: Math.round(rand(0.1, 30) * 100) / 100,
    steps: Math.round(rand(200, 3000)),
    radius: Math.round(rand(2, 60) * 10) / 10,
    angle: Math.round(rand(0.2, 4) * 100) / 100,
    amplitude: Math.round(rand(1, 12) * 10) / 10,
    multiplier: Math.round(rand(1, 6) * 10) / 10,
  };
}

// -- Actions --

const actions = {};

actions.Randomize = function () {
  const fig = randomFigure();
  Object.assign(params, fig);
  params.type = types[Math.floor(Math.random() * types.length)];
  updateFigure();
  updateAppearance();
  gui.updateDisplay();
};

actions['Randomize Target'] = function () {
  const fig = randomFigure();
  Object.assign(target, fig);
  gui.updateDisplay();
  redrawPreview();
};

actions['Export PNG (4K)'] = function () {
  guilloche.exportPNG(4096).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'guilloche-' + Date.now() + '.png';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });
};

// -- Animation --

const animParams = {
  duration: 3000,
  easing: 'ease-in-out',
  direction: 'alternate',
  iterations: 0,
  timeBetween: 500,
};

const animFolder = gui.addFolder('Animation');
animFolder.add(animParams, 'duration', 500, 20000).step(100).name('Duration (ms)');
animFolder.add(animParams, 'easing', [
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'perlin'
]).name('Easing');
animFolder.add(animParams, 'direction', [
  'normal', 'alternate', 'alternate-reverse'
]).name('Direction');
animFolder.add(animParams, 'iterations', 0, 20).step(1).name('Iterations (0=inf)');
animFolder.add(animParams, 'timeBetween', 0, 5000).step(100).name('Pause Between');
animFolder.open();

// Throttled GUI sync — update sliders at ~12fps instead of 60fps
let lastGuiUpdate = 0;
function syncGui(fig) {
  const now = performance.now();
  if (now - lastGuiUpdate < 80) return;
  lastGuiUpdate = now;
  params.majorR = fig.majorR;
  params.minorR = fig.minorR;
  params.steps = Math.round(fig.steps);
  params.radius = fig.radius;
  params.angle = fig.angle;
  params.amplitude = fig.amplitude;
  params.multiplier = fig.multiplier;
  gui.updateDisplay();
}

actions.Animate = function () {
  guilloche.animate(getTargetFigure(), {
    duration: animParams.duration,
    easing: animParams.easing,
    direction: animParams.direction,
    iterations: animParams.iterations,
    timeBetween: animParams.timeBetween,
    delay: 0,
  }, syncGui);
};

actions.Stop = function () {
  guilloche.stop();
  const fig = guilloche.figure;
  Object.assign(params, fig);
  params.steps = Math.round(params.steps);
  gui.updateDisplay();
  redrawPreview();
};

gui.add(actions, 'Animate');
gui.add(actions, 'Stop');
gui.add(actions, 'Randomize');
gui.add(actions, 'Randomize Target');
gui.add(actions, 'Export PNG (4K)');
