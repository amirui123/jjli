import backdropFragSource from "./shaders/backdrop.frag.glsl?raw";
import blitVertSource from "./shaders/blit.vert.glsl?raw";
import glassFragSource from "./shaders/glass.frag.glsl?raw";
import panelVertSource from "./shaders/panel.vert.glsl?raw";

import {
  createRenderTarget,
  disposeRenderTarget,
  type RenderTarget,
} from "./fbo";
import {
  collectUniforms,
  createGlassGeometry,
  linkProgram,
  type UniformMap,
} from "./gl";
import { GpuTimer } from "./gpu-timer";
import { IOR, schlickF0 } from "./optics";
import { backingSize } from "./viewport";

export const MODE_GLASS = 0;
export const MODE_NORMAL = 1;
export const MODE_FRINGE = 2;
export type ViewMode = 0 | 1 | 2;

/** How the panel is built. The backdrop is on the same canvas in all three cases. */
export type GlassPath = "webgl" | "css" | "none";

export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 540;
export const PANEL_WIDTH = 420;
export const PANEL_HEIGHT = 260;
export const PANEL_RADIUS = 40;
export const PANEL_PAD = 4;

export const DEFAULT_BEVEL = 34;
export const DEFAULT_THICKNESS = 6;
export const DEFAULT_DEPTH = 90;
export const DEFAULT_IOR = IOR.crownGlass;
export const DEFAULT_SPREAD = 0.15;
export const DEFAULT_SAMPLES = 3;
export const DEFAULT_SCALE = 0.75;
export const DEFAULT_BACKDROP_SCALE = 1;

export interface GlassParams {
  ior: number;
  spread: number;
  samples: number;
  bevel: number;
  thickness: number;
  depth: number;
  mode: ViewMode;
}

export function defaultParams(): GlassParams {
  return {
    ior: DEFAULT_IOR,
    spread: DEFAULT_SPREAD,
    samples: DEFAULT_SAMPLES,
    bevel: DEFAULT_BEVEL,
    thickness: DEFAULT_THICKNESS,
    depth: DEFAULT_DEPTH,
    mode: MODE_GLASS,
  };
}

export class Renderer {
  readonly gl: WebGL2RenderingContext;
  readonly timer: GpuTimer;
  readonly params: GlassParams = defaultParams();

  private readonly canvas: HTMLCanvasElement;
  private readonly vao: WebGLVertexArrayObject;
  private readonly backdropProgram: WebGLProgram;
  private readonly backdropUniforms: UniformMap;
  private readonly glassProgram: WebGLProgram;
  private readonly glassUniforms: UniformMap;

  private capture: RenderTarget;
  private sample: RenderTarget;
  private cssWidth = STAGE_WIDTH;
  private cssHeight = STAGE_HEIGHT;
  private backdropScale = DEFAULT_BACKDROP_SCALE;
  private path: GlassPath = "webgl";

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("Could not get a WebGL2 context");

    this.canvas = canvas;
    this.gl = gl;
    this.timer = new GpuTimer(gl);
    this.vao = createGlassGeometry(gl);
    this.backdropProgram = linkProgram(gl, blitVertSource, backdropFragSource);
    this.backdropUniforms = collectUniforms(gl, this.backdropProgram);
    this.glassProgram = linkProgram(gl, panelVertSource, glassFragSource);
    this.glassUniforms = collectUniforms(gl, this.glassProgram);

    gl.bindVertexArray(this.vao);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.DITHER);

    canvas.width = STAGE_WIDTH;
    canvas.height = STAGE_HEIGHT;
    this.capture = createRenderTarget(gl, canvas.width, canvas.height);
    this.sample = this.capture;
  }

  get backingWidth(): number {
    return this.canvas.width;
  }

  get backingHeight(): number {
    return this.canvas.height;
  }

  get sampleWidth(): number {
    return this.sample.width;
  }

  get sampleHeight(): number {
    return this.sample.height;
  }

  /** CSS size of the stage; alignment with the CSS panel is verified from here. */
  get cssSize(): { width: number; height: number } {
    return { width: this.cssWidth, height: this.cssHeight };
  }

  /** Ratio from CSS pixel to backing-buffer pixel. Panel dimensions are scaled by it. */
  get pixelScale(): number {
    return this.canvas.width / this.cssWidth;
  }

  setGlassPath(path: GlassPath): void {
    this.path = path;
  }

  setBackdropScale(scale: number): void {
    if (scale === this.backdropScale) return;
    this.backdropScale = scale;
    this.rebuildTargets();
  }

  /** cssW/cssH: CSS size of the stage. dpr and scale are clamped by `backingSize`. */
  resize(
    cssWidth: number,
    cssHeight: number,
    dpr: number,
    scale: number,
  ): void {
    const { width, height } = backingSize(cssWidth, cssHeight, dpr, scale);
    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.rebuildTargets();
  }

  /** Measurement mode: dpr and window size are ignored, the backing buffer is pinned. */
  setFixedSize(width: number, height: number): void {
    this.cssWidth = width;
    this.cssHeight = height;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.rebuildTargets();
    }
  }

  private rebuildTargets(): void {
    const { gl } = this;
    if (this.sample !== this.capture) disposeRenderTarget(gl, this.sample);
    disposeRenderTarget(gl, this.capture);
    this.capture = createRenderTarget(
      gl,
      this.canvas.width,
      this.canvas.height,
    );
    this.sample =
      this.backdropScale >= 1
        ? this.capture
        : createRenderTarget(
            gl,
            Math.max(1, Math.round(this.canvas.width * this.backdropScale)),
            Math.max(1, Math.round(this.canvas.height * this.backdropScale)),
          );
  }

  private readonly drawBackdrop = (time: number): void => {
    const { gl } = this;
    gl.useProgram(this.backdropProgram);
    const u = this.backdropUniforms;
    gl.uniform2f(u.uResolution, this.capture.width, this.capture.height);
    gl.uniform1f(u.uTime, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /** Draws the backdrop into the FBO, then copies it to the screen and (if needed) the sample target. */
  captureBackdrop(time: number): void {
    const { gl, canvas, capture, sample, drawBackdrop } = this;

    gl.bindFramebuffer(gl.FRAMEBUFFER, capture.framebuffer);
    gl.viewport(0, 0, capture.width, capture.height);
    drawBackdrop(time); // the backdrop is drawn only ONCE

    // 1) copy the captured frame to the screen
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, capture.framebuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    // prettier-ignore
    gl.blitFramebuffer(
      0, 0, capture.width, capture.height,
      0, 0, canvas.width, canvas.height,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST,
    );

    // 2) prepare the copy the glass will sample (downscaled if requested)
    if (sample !== capture) {
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, sample.framebuffer);
      // prettier-ignore
      gl.blitFramebuffer(
        0, 0, capture.width, capture.height,
        0, 0, sample.width, sample.height,
        gl.COLOR_BUFFER_BIT,
        gl.LINEAR,
      );
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Draws the glass panel to the screen. Fragment cost is proportional to the panel's area. */
  drawGlass(): void {
    const { gl, params } = this;
    const s = this.pixelScale;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.glassProgram);

    const u = this.glassUniforms;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sample.texture);
    gl.uniform1i(u.uBackdrop, 0);
    gl.uniform2f(u.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(
      u.uHalfTexel,
      0.5 / this.sample.width,
      0.5 / this.sample.height,
    );
    gl.uniform2f(u.uPanelCenter, this.canvas.width / 2, this.canvas.height / 2);
    gl.uniform2f(u.uPanelHalf, (PANEL_WIDTH / 2) * s, (PANEL_HEIGHT / 2) * s);
    gl.uniform1f(u.uRadius, PANEL_RADIUS * s);
    gl.uniform1f(u.uBevel, params.bevel * s);
    gl.uniform1f(u.uThickness, params.thickness * s);
    gl.uniform1f(u.uNormalEps, 1);
    gl.uniform1f(u.uDepth, params.depth * s);
    gl.uniform1f(u.uIor, params.ior);
    gl.uniform1f(u.uSpread, params.spread);
    gl.uniform1i(u.uSamples, params.samples);
    gl.uniform1i(u.uMode, params.mode);
    gl.uniform1f(u.uF0, schlickF0(IOR.air, params.ior));
    gl.uniform1f(u.uSpecular, 0.85);
    gl.uniform3f(u.uTint, 0.78, 0.86, 1.0);
    gl.uniform1f(u.uPad, PANEL_PAD * s);

    const blend = params.mode !== MODE_FRINGE;
    if (blend) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (blend) gl.disable(gl.BLEND);
  }

  renderFrame(time: number): void {
    const { gl } = this;
    this.timer.begin();

    if (this.params.mode === MODE_FRINGE) {
      // In fringe mode the backdrop is not drawn: everything outside the panel stays
      // fully black so that readPixels reads only the encoded separation.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.drawGlass();
    } else {
      this.captureBackdrop(time);
      if (this.path === "webgl") this.drawGlass();
    }

    this.timer.end();
    this.timer.poll();
  }

  /** Reads back the rectangle the panel covers (for MODE_FRINGE). */
  readFringe(): Uint8Array {
    const { gl } = this;
    const s = this.pixelScale;
    const w = Math.ceil((PANEL_WIDTH + 2 * PANEL_PAD) * s);
    const h = Math.ceil((PANEL_HEIGHT + 2 * PANEL_PAD) * s);
    const x = Math.max(0, Math.floor(this.canvas.width / 2 - w / 2));
    const y = Math.max(0, Math.floor(this.canvas.height / 2 - h / 2));
    const width = Math.min(w, this.canvas.width - x);
    const height = Math.min(h, this.canvas.height - y);
    const pixels = new Uint8Array(width * height * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
  }

  dispose(): void {
    const { gl } = this;
    this.timer.dispose();
    if (this.sample !== this.capture) disposeRenderTarget(gl, this.sample);
    disposeRenderTarget(gl, this.capture);
    gl.deleteProgram(this.backdropProgram);
    gl.deleteProgram(this.glassProgram);
    gl.deleteVertexArray(this.vao);
  }
}
