import { OPPOSITE } from './directions.js';

// Edge order inside a tile: [top, right, bottom, left].
// Each edge label is read CLOCKWISE around the tile, so two tiles fit together
// when one edge label equals the other one reversed. Palindromic labels like
// "010" are symmetric; labels like "LSS" let you build asymmetric transitions
// (coastlines, diagonals) without any hand written neighbour lists.
const EDGE_FACING = [
  [3, 1], // d=0 left:  my left edge touches the neighbour's right edge
  [2, 0], // d=1 down:  my bottom touches its top
  [1, 3], // d=2 right: my right touches its left
  [0, 2], // d=3 up:    my top touches its bottom
];

export const reverseLabel = (s) => [...s].reverse().join('');
export const edgesFit = (a, b) => a === reverseLabel(b);

/** Rotate a tile 90 degrees clockwise (edges and pixels). */
export function rotateTile(tile) {
  const [top, right, bottom, left] = tile.edges;
  const k = tile.pixels.length;
  const pixels = [];
  for (let y = 0; y < k; y++) {
    let row = '';
    for (let x = 0; x < k; x++) row += tile.pixels[k - 1 - x][y];
    pixels.push(row);
  }
  return { ...tile, edges: [left, top, right, bottom], pixels };
}

/**
 * Simple tiled model: a set of square tiles with labelled edges.
 * Rotations are generated automatically and deduplicated, so a cross tile
 * yields one variant, a straight pipe two and a corner four.
 */
export class TiledModel {
  constructor(tileset) {
    if (!tileset || !Array.isArray(tileset.tiles) || tileset.tiles.length === 0) {
      throw new Error('tileset.tiles must be a nonempty array');
    }
    this.variants = [];
    let size = -1;
    for (const tile of tileset.tiles) {
      if (!tile.name) throw new Error('every tile needs a name');
      if (!Array.isArray(tile.edges) || tile.edges.length !== 4) {
        throw new Error(`tile ${tile.name}: edges must be [top, right, bottom, left]`);
      }
      const k = tile.pixels.length;
      if (tile.pixels.some((r) => r.length !== k)) throw new Error(`tile ${tile.name}: pixels must be square`);
      if (size !== -1 && k !== size) throw new Error(`tile ${tile.name}: all tiles must be ${size}x${size}`);
      size = k;

      const unique = [];
      const seen = new Set();
      let current = { name: tile.name, edges: tile.edges.map(String), pixels: tile.pixels };
      const turns = tile.rotations === false ? 1 : 4;
      for (let r = 0; r < turns; r++) {
        const key = current.edges.join('|') + '/' + current.pixels.join('/');
        if (!seen.has(key)) {
          seen.add(key);
          unique.push({ ...current, rotation: r });
        }
        current = rotateTile(current);
      }
      // Split the declared weight across the distinct rotations, so "weight"
      // means how often the tile shows up overall, not per orientation.
      const w = (tile.weight ?? 1) / unique.length;
      for (const v of unique) this.variants.push({ ...v, id: `${v.name}@${v.rotation * 90}`, weight: w });
    }
    this.tileSize = size;
    this.weights = this.variants.map((v) => v.weight);

    const T = this.variants.length;
    this.propagator = [0, 1, 2, 3].map((d) => {
      const [mine, theirs] = EDGE_FACING[d];
      const lists = new Array(T);
      for (let t1 = 0; t1 < T; t1++) {
        const list = [];
        for (let t2 = 0; t2 < T; t2++) {
          if (edgesFit(this.variants[t1].edges[mine], this.variants[t2].edges[theirs])) list.push(t2);
        }
        lists[t1] = Int32Array.from(list);
      }
      return lists;
    });
    // sanity: the facing table must be consistent with OPPOSITE
    for (let d = 0; d < 4; d++) {
      const [a, b] = EDGE_FACING[d];
      const [c, e] = EDGE_FACING[OPPOSITE[d]];
      if (a !== e || b !== c) throw new Error('internal: edge facing table is inconsistent');
    }

    this.palette = [];
    const pIndex = new Map();
    for (const v of this.variants) {
      for (const row of v.pixels) {
        for (const ch of row) {
          if (!pIndex.has(ch)) {
            pIndex.set(ch, this.palette.length);
            this.palette.push(ch);
          }
        }
      }
    }
    this.paletteIndex = pIndex;
  }

  waveSize(width, height) {
    return [width, height];
  }

  render(solver) {
    const k = this.tileSize;
    const width = solver.width * k;
    const height = solver.height * k;
    const observed = solver.observed();
    const data = new Int32Array(width * height).fill(-1);
    for (let i = 0; i < observed.length; i++) {
      const t = observed[i];
      if (t < 0) continue;
      const tx = (i % solver.width) * k;
      const ty = ((i / solver.width) | 0) * k;
      const px = this.variants[t].pixels;
      for (let y = 0; y < k; y++) {
        for (let x = 0; x < k; x++) data[tx + x + (ty + y) * width] = this.paletteIndex.get(px[y][x]);
      }
    }
    return { width, height, data, palette: this.palette };
  }
}
