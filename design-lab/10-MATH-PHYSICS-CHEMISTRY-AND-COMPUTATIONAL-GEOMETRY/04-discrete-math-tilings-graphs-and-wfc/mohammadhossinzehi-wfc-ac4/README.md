# wave-function-collapse

A from scratch implementation of the Wave Function Collapse (WFC) procedural generation algorithm in plain JavaScript. Give it a tiny example image (or a handful of tiles with labelled edges) and it produces arbitrarily large outputs that look locally like the example: every small window of the output is something that appeared in the input.

No dependencies. The solver, both models, the CLI, the browser demo and the test suite together come to about 1,200 lines.

```
$ node cli.js overlapping samples/maze.txt --width 44 --height 12 --seed 7
#........#.##.#.#.##....#.##.###.#.#########
##########.##.#.#.#######.##...#.#.#.......#
#..........##...#.##......####.#.#.#.#####.#
############################...#.#.#.......#
############################.###.#.#.#######
##.........#...##.......#.##.....#.#.#.....#
##.#######.#.#.########.#.######.#.#.#.###.#
##.#.....#.#.#.##.......#.##...#.#.#.#.#...#
##.#.###.#.#.#.##.#######.##.#.#...#.#.#.###
##.#...#.#.#.#.##.........##.#.#####.#.#...#
##.###.#...#.#.#############.........#.#####
##.....#####.#.#####################.#......
```

That maze was learned from a single 9x9 example (`samples/maze.txt`). Here is the tiled model assembling a pipe network from six tiles:

```
$ node cli.js tiled tilesets/pipes.json --width 14 --height 4 --seed 5
.....................................#....
....####.....##########........o##########
....#..#.....#........#..............#....
....#..#.....#........#..............#....
....o..#.....#........#.....#############.
.......#.....#........#.....#........#..#.
```

## Why this is interesting

WFC is a constraint satisfaction problem wearing a graphics costume. Each output cell starts in a "superposition" of every pattern it could be. The solver repeatedly picks the cell with the lowest Shannon entropy, collapses it to one pattern (weighted by how often that pattern appeared in the input), and propagates the consequences to its neighbours until nothing else changes. It is used in games (Townscaper, Caves of Qud, Bad North) for level and texture generation, and it is a nice small showcase of arc consistency, heuristics and search.

## What is implemented

**Solver** (`src/solver.js`), independent of any model:

* **Support counting propagation (AC4 style).** For each cell, pattern and direction the solver keeps a count of how many neighbouring patterns still support it. Banning a pattern only decrements the counters it contributes to; a pattern is removed exactly when a counter hits zero. This avoids rescanning whole domains on every change.
* **Minimum entropy heuristic** with a seeded jitter for tie breaking, and incrementally maintained entropy sums so choosing the next cell is a single linear scan.
* **Trail based backtracking.** Every ban and every counter decrement is appended to an undo trail. When propagation hits a contradiction the solver rolls back to the last decision, forbids the choice that failed, and continues. If there is no decision left to revisit, the constraints are provably unsatisfiable from the start (the test suite checks this on a 3x3 periodic checkerboard, which cannot exist).
* **Up front pruning.** Patterns that have no possible neighbour in some direction are banned before the first observation instead of being discovered by accident later.
* **Deterministic.** All randomness goes through a seeded mulberry32 generator, so a (model, size, seed) triple always gives the same output.
* `step()` for animation, `run()` for batch use, `observed()` and `possibilities(i)` for inspection.

**Overlapping model** (`src/overlapping.js`): extracts every N x N window from a text bitmap (optionally wrapping around the edges), optionally adds its 8 rotations and reflections, counts frequencies, and precomputes which patterns can overlap at each offset. Outputs can be bounded or periodic (tileable).

**Tiled model** (`src/tiled.js`): tiles declare four edge labels. Labels are read clockwise around the tile, so two tiles fit when one label equals the other reversed. Symmetric labels like `010` behave like simple sockets, while asymmetric labels like `LSS` encode direction aware transitions, which is how the coastline tileset gets shores that only continue in the right orientation without any hand written neighbour lists. Rotations are generated automatically and deduplicated (a cross gives one variant, a straight pipe two, a corner four).

## Running it

Requires Node 18 or newer. There is nothing to install.

```bash
git clone https://github.com/MohammadHossinzehi/wave-function-collapse.git
cd wave-function-collapse

# overlapping model: learn from a text image
node cli.js overlapping samples/islands.txt --width 60 --height 20 --seed 3
node cli.js overlapping samples/maze.txt --N 3 --periodic --stats
node cli.js overlapping samples/bricks.txt --symmetry 1     # keep bricks horizontal

# tiled model: assemble tiles with labelled edges
node cli.js tiled tilesets/pipes.json --width 20 --height 10
node cli.js tiled tilesets/coast.json --seed 42

# tests
npm test
```

CLI options: `--width`, `--height`, `--seed`, `--periodic`, `--N` (pattern size), `--symmetry` (1 to 8), `--no-wrap-input`, `--attempts` (restarts allowed if backtracking gives up) and `--stats` (pattern count, observations, bans, backtracks and timing on stderr).

### Browser demo

`index.html` animates the collapse: every pixel is drawn as the weighted average colour of the patterns it could still become, so you see a blurry superposition sharpen into a picture. ES modules need to be served over HTTP, so run any static server from the repo root:

```bash
npm run demo              # uses npx http-server on port 8080
# or
python3 -m http.server 8080
```

then open http://localhost:8080.

### Using it as a library

```js
import { OverlappingModel, TiledModel, Solver, generate, toText } from './src/index.js';

const model = OverlappingModel.fromText(sampleText, { N: 3, symmetry: 8 });
const { image, stats } = generate(model, { width: 64, height: 32, seed: 7 });
console.log(toText(image), stats);

// or drive the solver yourself, one observation at a time
const [w, h] = model.waveSize(64, 32, false);
const solver = new Solver(model, { width: w, height: h, seed: 7 });
while (solver.step() === 'running') { /* draw solver.wave here */ }
```

Any object with `weights` and a symmetric `propagator[direction][pattern]` can be fed to `Solver`, so you can plug in your own models (the tests do this with a two pattern checkerboard).

## Your own inputs

* **Samples** are plain text files; every distinct character becomes a colour. Small is good: 8x8 to 16x16 is typical. Larger N captures more structure but multiplies the pattern count.
* **Tilesets** are JSON: `{ "tiles": [{ "name", "weight", "edges": [top, right, bottom, left], "pixels": [...rows], "rotations": true }] }`. All tiles must share the same square pixel size. `weight` is how often the tile appears overall; it is split evenly across its distinct rotations.

## Design notes

* **Why keep backtracking when restarts exist?** Plain WFC restarts from scratch on a contradiction. That works for easy inputs but wastes all work done so far on harder ones. With N=3 on the maze sample at 40x40, about one run in ten hits a contradiction; with backtracking all 30 seeds in the test suite succeed on the first attempt. Restarts are still available as an outer loop in `generate()`.
* **Trail instead of snapshots.** Copying the whole wave at every decision costs O(cells x patterns x 4) memory per step. The trail only records what actually changed, so undo cost is proportional to the work being undone.
* **Skipping counters of banned patterns.** Once a pattern is gone from a cell its support counters are never read again, so propagation skips them. This also keeps the undo trail smaller and makes the undo logic exact, which a dedicated test verifies by comparing the full state before and after a rollback.
* **Bounded overlapping output.** For non periodic outputs the wave is (W minus N plus 1) by (H minus N plus 1) nodes and the last row and column of nodes paint the remaining pixels, so every N x N window of the image is a learned pattern, not just the top left pixel of each node.

## Testing

`npm test` runs 34 tests with Node's built in test runner:

* solver: exact checkerboard, unsatisfiable detection, determinism, weight frequencies, starting entropy, exact state restoration after undo, and a check that backtracking rescues seeds that fail without it
* overlapping: sample parsing, the 8 dihedral symmetries, propagator symmetry, and for every sample a scan confirming that each N x N window of the generated image appears in the learned pattern set (bounded and periodic)
* tiled: rotation and deduplication, and an independent adjacency check on generated grids for several seeds of both tilesets
* CLI: output dimensions, determinism and error codes

## Credits

The algorithm was introduced by Maxim Gumin (mxgmn/WaveFunctionCollapse). This is an independent reimplementation; the backtracking, up front pruning and clockwise edge label tiled format are additions of this project.

MIT licensed.
