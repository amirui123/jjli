#version 300 es
precision highp float;

// The pattern that sits behind the glass. Because refraction is "displacement",
// the edges of the pattern have to be SHARP: on a soft gradient you cannot see with
// your eye that a pixel has moved. That is why every layer is thresholded with step().

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

const vec3 PAPER = vec3(0.86, 0.89, 0.94);
const vec3 INK = vec3(0.05, 0.06, 0.09);
const vec3 WARM = vec3(0.98, 0.60, 0.22);
const vec3 COOL = vec3(0.24, 0.70, 0.96);

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uResolution;

  // 1) horizontal bands — make the vertical displacement readable
  float band = step(0.5, fract(px.y / 18.0));

  // 2) dot grid — makes the horizontal displacement readable
  vec2 cell = fract(px / 48.0) - 0.5;
  float dots = 1.0 - step(0.16, length(cell));

  // 3) sliding diagonal — keeps the scene from standing still
  float diag = step(0.62, fract((px.x + px.y) / 96.0 - uTime * 0.12));

  vec3 col = mix(PAPER, INK, band * 0.6);
  col = mix(col, WARM, diag * 0.55);
  col = mix(col, COOL, dots);
  col *= 0.84 + 0.16 * uv.y;

  outColor = vec4(col, 1.0);
}
