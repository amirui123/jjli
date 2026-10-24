# Einstein hat explorer: "Ein Stein, One Stone"

An interactive explorer for the **hat**, the aperiodic monotile ("einstein") found by Smith, Myers, Kaplan and Goodman-Strauss in 2023, with an **essay mode** that walks through the article *"Ein Stein, One Stone"* by [@SlavisTon](https://x.com/slaviston/status/2097027746329169990) while the live tiling behind it flies to each scene and recolours itself.

It is built on [David Ryan's tiling explorer](https://drbuild.uk/tiles) ([source](https://github.com/davidryan59/davidryan59.github.io), MIT).

**Live:** https://frankslav15.github.io/einstein-hat-explorer/

Plain HTML, JavaScript and WebGL 2. No build step, no dependencies.

## Features

**David Ryan's explorer, kept intact**
- Pan, zoom and rotate an effectively infinite hat tiling, generated on the fly in a web worker from exact coordinates.
- The Tile(a, b) shape slider, morphing through Chevron, Hat, Spectre, Turtle and Comet.
- Supertile outlines, grids, his colour schemes, presets, dice and custom colours, and shareable URL state.
- His sibling pages: [Spectre](https://frankslav15.github.io/einstein-hat-explorer/tiles/spectre/), [Hat (extended)](https://frankslav15.github.io/einstein-hat-explorer/tiles/hat-extended/) and [Krinkle](https://frankslav15.github.io/einstein-hat-explorer/tiles/krinkle/).

**Nine colour-probe maps from the article** (in the colour menu as "Article map n: …")
1. 12 orientations
2. Flipped hats: the mirrored hats, about one in eight
3. Chains by direction: rivers of flip → stack, hue by heading
4. Position on the stack: ends, middles of triples, flips
5. Distance to the nearest flip: seven discrete shells
6. Three axes: heading mod 180°, with flips as ink
7. Substitution roles H, T, P, F from the level-1 metatile
8. Flip + three-shell
9. Grain phase: centroids projected on 54° and wrapped (adjustable period)

**Colours, your way (Explore mode).** Pick what to *colour by* (orientation, any of the article's maps, or the explorations) and, separately, a *palette* that applies to it: the article's original colours, David's Pastel/Rainbow/Greyscale/Mirrored/Plain, Viridis, Magma, Cividis, Turbo, Set2, Dark2, Paired, Tableau 10, colour-blind-safe Okabe–Ito, Monochrome blue, Earth & terracotta, Neon on dark, Soft pastel, Print greyscale, Bauhaus, Mondrian, Escher sepia and Islamic tile blues. Ordered maps (distance shells, grain phase) follow a ramp; categories get discrete colours. Tap a key swatch to recolour a class, or highlight one class. *Customise* sets outline colour and width and the background, saves named palettes (kept in your browser, reusable on every map), and exports/imports them as a short code or JSON. The link in the address bar reproduces the palette and your edits. Essay mode keeps the article's colours.

**Essay mode.** The Essay / Explore toggle opens the article in a side panel (a bottom sheet on narrow screens). Scroll, click a section, or press PageUp/PageDown or j/k, and the map flies to that section's scene: colour map, view, tile shape and outlines. The article's own images sit under each section for comparison.

**New explorations**
- **Supertile ancestry**: colour each hat by its ancestor at level k (k = 1–5).
- **Neighbourhood census**: 17 local neighbourhood types, with a frequency legend.
- **Diffraction**: the structure factor of the hat centroids, for all hats or flips only.
- **Morph-fixed colours**: classes are computed once at the true hat shape, so colours stay attached to their tiles while the shape slider morphs them.
- **Live stats** (Options → Probe tools): flip ratios against 1/(1+φ⁴) and 1/φ⁴, role counts, stack census, nearest-flip distances and more, counted over about 4,000 hats around the view.

## Run locally

Web workers need http(s), so serve the folder rather than opening the files from disk. Any static server works, for example:

```sh
git clone https://github.com/FrankSlav15/einstein-hat-explorer.git
cd einstein-hat-explorer
python3 -m http.server 8000
# open http://localhost:8000/  (redirects to tiles/hat/)
```

All paths are relative, so the site also works from a subpath, as it does on GitHub Pages. You need a browser with WebGL 2.

## Editing essay scenes

The article text and one scene per section are in [`essay/scenes.js`](essay/scenes.js). Each section has `paras` (the article text; leave it as it is) and a `scene`:

```js
"scene": { "scheme": "chains", "v": [0, 0, 4.5, 0, 0, 0], "shape": 30, "outlines": false }
```

- `scheme`: a preset id. Article maps: `flipped`, `chains`, `stacks`, `shells`, `axes`, `roles`, `molecule`, `grain`. David's presets: `pastel`, `rainbow`, `grey`, `hands`, `plain`. Explorations: `ancestry`, `census`.
- `v`: `[dP0, dP1, zoom, turnDeg, dR0, dR1]`, the same as the URL's `v=` parameter. Zoom is pixels per hat unit (default 8).
- `shape`: degrees on the slider (0 chevron, 30 hat, 45 spectre, 60 turtle, 90 comet).
- Optional: `outlines`, `ancLevel` (1–5), `grainPeriod` (article units), `ms` (flight time), `palette` (a palette id such as `viridis`; default: the article's colours).

The easiest way to get a scene: set up the view in Explore mode, click **Options → Copy scene**, and paste the result over a section's `scene`.

## Layout

```
index.html              redirects to tiles/hat/
assets/theme.js         David's theme toggle
essay/                  scenes.js (article + scenes), essay.js, probe-ui.js, essay.css, img/
tiles/engine/           David's map engine and worker core, with a small probe-map extension and palettes.js (colour schemes)
tiles/hat/              Hat page, rules (tiling.js) and probe analysis (probes.js, new)
tiles/spectre/, tiles/hat-extended/, tiles/krinkle/   David's sibling pages
```

## How the probe maps are computed

Everything is computed in the hat worker (`tiles/hat/probes.js`) from the exact positions in David's engine, evaluated at the hat shape Tile(1, √3). Each chunk is analysed with a margin, so neighbour relations are correct across chunk edges, and the classes are sent to the shader as extra words per tile. Some checks against the article: flipped/all ≈ 0.1274 (1/(1+φ⁴) = 0.1273); stacks come only as pairs and straight triples; the nearest-flip distance takes 7 discrete values from 1.561 to 3.031 article units (the article text was corrected to match in Oct 2026).

## Credits

- **David Ryan**: the Hat tiling explorer, map engine, Tile(a, b) slider, colour presets and the Spectre, Hat (extended) and Krinkle pages. © 2026 David Ryan, MIT. https://drbuild.uk/tiles · https://github.com/davidryan59/davidryan59.github.io
- **David Smith, Joseph Samuel Myers, Craig S. Kaplan and Chaim Goodman-Strauss**, [*An aperiodic monotile*](https://arxiv.org/abs/2303.10798) (2023).
- **Craig S. Kaplan**: the metatile construction follows his [hatviz](https://cs.uwaterloo.ca/~csk/hat/).
- **@SlavisTon**: the article [*"Ein Stein, One Stone"*](https://x.com/slaviston/status/2097027746329169990) and the probe-map ideas, colours and legends.

## License

- **Code:** MIT. See [`LICENSE`](LICENSE). New work © 2026 FrankSlav15 (@SlavisTon). Portions © 2026 David Ryan, MIT; his original notice is in [`LICENSE-davidryan59`](LICENSE-davidryan59).
- **Article text and images:** the text of *"Ein Stein, One Stone"* (in `essay/scenes.js`) and the images in `essay/img/` are © 2026 @SlavisTon, **all rights reserved**. They are **not** covered by the MIT licence.
