# Superformula explorer

An interactive 3D explorer for Gielis' superformula, built with plain HTML and three.js.

![formula](https://latex.codecogs.com/svg.image?r(\varphi)=\left(\left|\frac{\cos(m\varphi/4)}{a}\right|^{n_2}+\left|\frac{\sin(m\varphi/4)}{b}\right|^{n_3}\right)^{-1/n_1})

## Features

- Live 3D supershape built from two parameter sets (spherical product)
- 2D curve preview of Set 1
- Presets for common shape categories (spheres, cubes, stars, flowers, urchins, gears, torn forms, and more)
- A randomize button skewed toward well-formed shapes, plus buttons to copy or download both sets as JSON
- Drag to rotate, scroll to zoom
- Light and dark themes (follows the system until you pick one)

## Running it

Open `index.html` in any browser. No build step is needed; three.js loads from a CDN.

## Shape reference

See [shape-categories.md](shape-categories.md) for categories, parameter ranges, and sample configs.
