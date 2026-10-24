# GuillocheJS

Spirographic pattern generator for HTML5 Canvas. Renders Hypotrochoid, Epitrochoid, and Hypocycloid curves with animation, HiDPI support, and PNG export.

[Live Demo](https://stabla.github.io/guillocheJS/) | [MIT License](LICENSE)

![hypotrochoid](https://upload.wikimedia.org/wikipedia/commons/f/fa/HypotrochoidOutThreeFifths.gif?raw=true)

## Install

```html
<script src="src/bezier-easing.js"></script>
<script src="src/guilloche.js"></script>
```

No build tools, no dependencies. Just two vanilla JS files.

## Quick Start

```html
<div id="guilloche" style="width: 100%; height: 100vh;"></div>

<script src="src/bezier-easing.js"></script>
<script src="src/guilloche.js"></script>
<script>
  const g = new GuillocheJS('#guilloche');
  g.clear();
  g.draw();
</script>
```

## Configuration

```js
const g = new GuillocheJS('#guilloche', {
  figure: {
    majorR: 40,        // Outer circle radius
    minorR: 0.25,      // Inner circle radius
    steps: 1200,       // Number of points (resolution)
    radius: 25,        // Drawing point distance from inner circle center
    angle: 1,          // Angle multiplier
    amplitude: 4.5,    // Scale factor
    multiplier: 2,     // Pattern complexity
  },
  appearance: {
    lineColor: '#000000',
    backgroundColor: '#FFFFFF',
    lineWidth: 0.5,
    opacity: 1,
    type: 'Hypotrochoid',  // 'Hypotrochoid' | 'Epitrochoid' | 'Hypocycloid'
  },
  motion: {
    duration: 2000,          // Animation duration in ms
    delay: 100,              // Delay before animation starts
    easing: 'ease-in-out',   // CSS name, [x1,y1,x2,y2] array, 'perlin', or function
    iterations: 0,           // 0 = infinite
    direction: 'alternate',  // 'normal' | 'alternate' | 'alternate-reverse'
    timeBetween: 2000,       // Pause between iterations in ms
  },
});
```

## API

```js
g.draw()                              // Render the pattern
g.clear()                             // Clear the canvas
g.setFigure({ majorR: 60 })           // Update figure params + redraw
g.setAppearance({ lineColor: 'red' }) // Update appearance + redraw
g.setMotion({ duration: 5000 })       // Update motion config

// Animation — interpolates from current state to target
g.animate(
  { majorR: 100, amplitude: 10 },     // Target figure state
  { easing: 'perlin', duration: 4000 }, // Motion overrides (optional)
  (figure, progress) => { ... }        // onFrame callback (optional)
);
g.stop()                              // Stop animation

// Preview — draw a ghost overlay of a target state
g.drawPreview(
  { majorR: 100, minorR: 5, steps: 2000, radius: 40, angle: 2, amplitude: 8, multiplier: 4 },
  '#0066ff',  // color
  0.2         // opacity
);

// Export — returns a Promise<Blob> (transparent PNG, auto-fitted)
g.exportPNG(4096).then(blob => { ... });

g.resize()   // Manual resize (auto-handled via ResizeObserver)
g.destroy()  // Cleanup: remove canvas, observers, cancel animations

// Read-only getters
g.figure     // { majorR, minorR, steps, ... }
g.appearance // { lineColor, backgroundColor, ... }
g.motion     // { duration, easing, ... }
g.animating  // boolean
```

## Easing Options

```js
// CSS named easings
g.animate(target, { easing: 'ease-in-out' });

// Cubic bezier array
g.animate(target, { easing: [0.42, 0, 0.58, 1] });

// Perlin noise — organic, non-uniform speed
g.animate(target, { easing: 'perlin' });

// Custom Perlin with parameters
g.animate(target, { easing: ['perlin', { speed: 5, strength: 0.4 }] });

// Custom function
g.animate(target, { easing: (t) => t * t });
```

## Multiple Instances

Each instance has its own canvas and state:

```js
const g1 = new GuillocheJS('#left', { figure: { majorR: 40 } });
const g2 = new GuillocheJS('#right', { figure: { majorR: 80 } });
```

## Features

- Single `ctx.stroke()` per frame (vs 2400 in v1)
- HiDPI / Retina canvas support via `devicePixelRatio`
- Auto-resize via `ResizeObserver`
- Perlin noise easing (FBM, 4 octaves)
- Bezier curve easing (CSS presets + custom)
- 4K transparent PNG export with bounding-box auto-fit
- Ghost preview overlay for animation targets
- No globals, no dependencies, no build step

## The Math

### Hypotrochoid

Point traced by a circle rolling **inside** a larger circle:

```text
x = (R - r) cos(θ) + d cos((R-r)/r · θ)
y = (R - r) sin(θ) + d sin((R-r)/r · θ)
```

![hypotrochoid](https://upload.wikimedia.org/wikipedia/commons/f/fa/HypotrochoidOutThreeFifths.gif?raw=true)

### Epitrochoid

Point traced by a circle rolling **outside** a larger circle:

```text
x = (R + r) cos(θ) + d cos((R+r)/r · θ)
y = (R + r) sin(θ) + d sin((R+r)/r · θ)
```

![epitrochoid](https://upload.wikimedia.org/wikipedia/commons/2/20/EpitrochoidIn3.gif?raw=true)

### Hypocycloid

Special case of Hypotrochoid where `d = r` (point on the circumference):

```text
x = (R - r) cos(θ) + r cos((R-r)/r · θ)
y = (R - r) sin(θ) + r sin((R-r)/r · θ)
```

Where `R` = majorR, `r` = minorR, `d` = radius, `θ` = angle.

## File Structure

```text
src/
  bezier-easing.js   # Cubic bezier easing utility (56 lines)
  guilloche.js       # GuillocheJS class + Perlin noise (460 lines)
demo/
  index.html         # Interactive demo with dat.gui controls
  demo.js            # Demo logic: sliders, preview, animation, export
  style.css          # Demo styles
```

## License

MIT - Guillaume Bonnet
