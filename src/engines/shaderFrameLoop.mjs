/**
 * Schedules one animation frame at a time while active and cancels it on pause.
 * @typedef {{
 *   requestFrame: (callback: FrameRequestCallback) => number,
 *   cancelFrame: (frameId: number) => void,
 *   isActive: () => boolean,
 *   draw: (timestamp: number) => void
 * }} ShaderFrameLoopOptions
 */
export class ShaderFrameLoop {
  frameId = null;
  generation = 0;
  disposed = false;

  /** @param {ShaderFrameLoopOptions} options */
  constructor(options) {
    this.options = options;
  }

  refresh() {
    if (this.disposed) return;
    if (!this.options.isActive()) {
      this.stop();
      return;
    }
    if (this.frameId !== null) return;
    const generation = ++this.generation;
    const id = this.options.requestFrame((timestamp) => {
      if (generation !== this.generation || this.disposed) return;
      this.frameId = null;
      if (!this.options.isActive()) return;
      this.options.draw(timestamp);
      this.refresh();
    });
    this.frameId = id;
  }

  stop() {
    this.generation += 1;
    if (this.frameId === null) return;
    this.options.cancelFrame(this.frameId);
    this.frameId = null;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
  }
}
