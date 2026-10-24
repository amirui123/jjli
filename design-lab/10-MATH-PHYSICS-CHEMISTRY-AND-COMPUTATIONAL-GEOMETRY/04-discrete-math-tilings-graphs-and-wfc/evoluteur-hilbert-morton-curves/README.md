# Space-Filling-Curves

One line that visits every cell of a square: the Hilbert, Peano, Moore, Gosper flowsnake, Sierpiński, arrowhead, dragon, Lévy C and Z-order curves, drawn level by level, with colors that follow the line. Download them as SVG or PNG. No sign-up, no libraries.

**[▶ Draw a curve](https://evoluteur.github.io/space-filling-curves/)**

[![Space-Filling Curves](space-filling-curves.png)](https://evoluteur.github.io/space-filling-curves/)

## Features

| Control | What it does |
| ------- | ------------ |
| **Curve** | Hilbert (1891), Moore (1900), Peano (1890), Gosper flowsnake (1973), Sierpiński (1912), Sierpiński arrowhead, Dragon (1966), Lévy C (1938), or Z-order (1966). |
| **Level** | How many times the recipe is applied: the line crowds the square. |
| **Line width** | As a share of a step. |
| **Colors** | Rainbow, Sunset, Ocean, Ink on paper, Blueprint, Black and gold. |
| **Draw it step by step** | Watch the line travel from its start to its end. |
| **Download SVG** | Vector, for print, a plotter or a laser cutter. |
| **Download PNG** | The picture. |

The colors follow the line from its start to its end. The address of the page keeps the curve, to share it.

## How it is built

The curves are L-systems: a starting string and rewriting rules, applied *level* times, then read by a turtle (`F` draws a step, `+` and `-` turn). For example, the Hilbert curve is `A → +BF−AFA−FB+`, `B → −AF+BFB+FA−`, with 90° turns. The strings are expanded recursively, without building them in full. The Z-order is computed directly, by interleaving the bits of x and y.

The line is drawn in a few hundred colored pieces, and fitted to the square.

Plain HTML, CSS and JavaScript, with no dependencies and no build step:

| File | Content |
| ---- | ------- |
| [index.html](index.html) | the page and its controls |
| [js/curves.js](js/curves.js) | the curves, the drawing and the SVG export |
| [css/curves.css](css/curves.css) | the styles of the page |
| [css/themes](css/themes) | the three color themes |

To run it locally, just open `index.html` in a browser. The three color themes (dark, light and blue) are shared with my other projects (copied from [omg-themes](https://github.com/evoluteur/omg-themes)).

## A little history

Giuseppe Peano, *Sur une courbe, qui remplit toute une aire plane* (1890). David Hilbert, *Über die stetige Abbildung einer Linie auf ein Flächenstück* (1891). Aristid Lindenmayer introduced L-systems in 1968.

## Related projects

- [Truchet Tiles](https://evoluteur.github.io/truchet-tiles/) ([code](https://github.com/evoluteur/truchet-tiles))
- [Maze Maker](https://evoluteur.github.io/maze-maker/) ([code](https://github.com/evoluteur/maze-maker))
- [Spiral Gallery](https://evoluteur.github.io/spiral-gallery/) ([code](https://github.com/evoluteur/spiral-gallery))

For more patterns grown from a few rules, see [Generative Art](https://evoluteur.github.io/generative-art.html).

## License

Space-Filling Curves is open source under the [MIT license](LICENSE).

Had fun with the app? [Buy me a coffee by becoming a sponsor](https://github.com/sponsors/evoluteur).

(c) 2026 [Olivier Giulieri](https://evoluteur.github.io/)
