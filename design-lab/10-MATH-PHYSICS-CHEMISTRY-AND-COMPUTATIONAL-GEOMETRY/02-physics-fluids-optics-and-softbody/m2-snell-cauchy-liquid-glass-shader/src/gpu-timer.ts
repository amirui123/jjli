interface TimerExtension {
  TIME_ELAPSED_EXT: number;
  GPU_DISJOINT_EXT: number;
}

/**
 * EXT_disjoint_timer_query_webgl2 wrapper.
 * One active query; results arrive a few frames late and are NEVER waited on.
 * `gl.finish()` is FORBIDDEN — syncing the pipeline changes the thing you measure.
 */
export class GpuTimer {
  readonly available: boolean;
  readonly samplesMs: number[] = [];

  private readonly ext: TimerExtension | null;
  private readonly pending: WebGLQuery[] = [];
  private readonly free: WebGLQuery[] = [];
  private active: WebGLQuery | null = null;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.ext = gl.getExtension(
      "EXT_disjoint_timer_query_webgl2",
    ) as TimerExtension | null;
    this.available = this.ext !== null;
  }

  begin(): void {
    if (!this.ext || this.active) return;
    const query = this.free.pop() ?? this.gl.createQuery();
    if (!query) return;
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, query);
    this.active = query;
  }

  end(): void {
    if (!this.ext || !this.active) return;
    this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
    this.pending.push(this.active);
    this.active = null;
  }

  poll(): void {
    if (!this.ext) return;
    const { gl } = this;

    if (gl.getParameter(this.ext.GPU_DISJOINT_EXT)) {
      // The GPU clock went disjoint (power state change, context switch):
      // every measurement in flight is garbage.
      for (const query of this.pending) this.free.push(query);
      this.pending.length = 0;
      return;
    }

    while (this.pending.length > 0) {
      const query = this.pending[0];
      if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) break;
      const ns = gl.getQueryParameter(query, gl.QUERY_RESULT) as number;
      this.samplesMs.push(ns / 1e6);
      this.free.push(query);
      this.pending.shift();
    }
  }

  /** Throw away the accumulated samples when entering a new run. */
  reset(): void {
    this.samplesMs.length = 0;
  }

  /** Sliding window for the live HUD: keep the array from growing forever. */
  trim(max: number): void {
    if (this.samplesMs.length > max) {
      this.samplesMs.splice(0, this.samplesMs.length - max);
    }
  }

  dispose(): void {
    if (!this.ext) return;
    if (this.active) {
      this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      this.pending.push(this.active);
      this.active = null;
    }
    for (const query of [...this.pending, ...this.free]) {
      this.gl.deleteQuery(query);
    }
    this.pending.length = 0;
    this.free.length = 0;
  }
}
