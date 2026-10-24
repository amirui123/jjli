export class SpatialHashGrid {
  private cellSize: number;
  private invCellSize: number;
  private tableSize: number;
  private buckets: Map<number, number[]>;

  constructor(cellSize = 0.1, tableSize = 4096) {
    this.cellSize = cellSize;
    this.invCellSize = 1.0 / cellSize;
    this.tableSize = tableSize;
    this.buckets = new Map();
  }

  hashCoords(ix: number, iy: number, iz: number): number {
    const h = ((ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791)) >>> 0;
    return h % this.tableSize;
  }

  hashPosition(x: number, y: number, z: number): number {
    const ix = Math.floor(x * this.invCellSize);
    const iy = Math.floor(y * this.invCellSize);
    const iz = Math.floor(z * this.invCellSize);
    return this.hashCoords(ix, iy, iz);
  }

  clear() {
    this.buckets.clear();
  }

  insert(particleIndex: number, x: number, y: number, z: number) {
    const cell = this.hashPosition(x, y, z);
    if (!this.buckets.has(cell)) {
      this.buckets.set(cell, []);
    }
    this.buckets.get(cell)!.push(particleIndex);
  }

  getBucket(x: number, y: number, z: number): number[] {
    const cell = this.hashPosition(x, y, z);
    return this.buckets.get(cell) || [];
  }
}
