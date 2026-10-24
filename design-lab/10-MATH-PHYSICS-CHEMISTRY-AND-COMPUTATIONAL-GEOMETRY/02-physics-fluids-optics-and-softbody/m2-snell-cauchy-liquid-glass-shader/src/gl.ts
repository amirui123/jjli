// gl.ts — compile/link helpers. WebGL objects can come back null; under strict
// every one of them is checked and throws a meaningful error.

/** Makes a shader compile error readable by prefixing line numbers. */
export function annotateSource(source: string): string {
  return source
    .split("\n")
    .map((line, i) => `${String(i + 1).padStart(4, " ")} | ${line}`)
    .join("\n");
}

export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("createShader failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "(no log)";
    gl.deleteShader(shader);
    throw new Error(`Shader compile error:\n${log}\n${annotateSource(source)}`);
  }
  return shader;
}

export function linkProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("createProgram failed");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "(no log)";
    gl.deleteProgram(program);
    throw new Error(`Program failed to link:\n${log}`);
  }
  return program;
}

export type UniformMap = Record<string, WebGLUniformLocation>;

/** Turns every active uniform into a name → location table. */
export function collectUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): UniformMap {
  const total = gl.getProgramParameter(
    program,
    gl.ACTIVE_UNIFORMS,
  ) as unknown as number;
  const map: UniformMap = {};
  for (let i = 0; i < total; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    const name = info.name.replace(/\[0\]$/, "");
    const location = gl.getUniformLocation(program, name);
    if (location) map[name] = location;
  }
  return map;
}

/**
 * WebGL2 wants a bound VAO in order to draw, but the panel and the fullscreen
 * triangle have no attributes at all: an empty VAO is enough.
 */
export function createGlassGeometry(
  gl: WebGL2RenderingContext,
): WebGLVertexArrayObject {
  const vao = gl.createVertexArray();
  if (!vao) throw new Error("createVertexArray failed");
  return vao;
}
