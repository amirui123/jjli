#version 300 es
precision highp float;
precision highp int;

#define MAX_SAMPLES 8
#define MODE_GLASS 0
#define MODE_NORMAL 1
#define MODE_FRINGE 2
// Ceiling of the fringe encoding (pixels). SAME as FRINGE_SCALE_PX in fringe.ts.
#define FRINGE_SCALE 32.0

// Panel geometry and material. The backdrop sampling uniforms are declared
// right above sampleBackdrop.
uniform vec2 uPanelCenter;
uniform vec2 uPanelHalf;
uniform float uRadius;
uniform float uBevel;
uniform float uThickness;
uniform float uNormalEps;
uniform float uDepth;
uniform float uIor;
uniform float uSpread;
uniform int uSamples;
uniform int uMode;
uniform float uF0;
uniform float uSpecular;
uniform vec3 uTint;

out vec4 outColor;

// p: pixel coordinate relative to the panel center
// b: half size (pixels), r: corner radius (pixels)
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// d: signed distance to the edge (negative inside), w: bevel width (pixels)
// Returns 0 at the edge and 1 where the bevel ends.
float glassHeight(float d, float w) {
  float x = clamp(-d / max(w, 1e-3), 0.0, 1.0);
  float t = 1.0 - x;
  return sqrt(max(1.0 - t * t, 0.0));
}

vec3 glassNormal(
  vec2 p, vec2 halfSize, float radius, float bevel, float thickness, float eps
) {
  vec2 e = vec2(eps, 0.0);
  float hx =
      glassHeight(sdRoundedBox(p + e.xy, halfSize, radius), bevel)
    - glassHeight(sdRoundedBox(p - e.xy, halfSize, radius), bevel);
  float hy =
      glassHeight(sdRoundedBox(p + e.yx, halfSize, radius), bevel)
    - glassHeight(sdRoundedBox(p - e.yx, halfSize, radius), bevel);

  float k = thickness / (2.0 * eps);
  return normalize(vec3(-hx * k, -hy * k, 1.0));
}

// n: surface normal, eta: n1/n2, depth: glass thickness (pixels)
// The return value is how many pixels we shift inside the backdrop texture.
vec2 refractOffset(vec3 n, float eta, float depth) {
  vec3 i = vec3(0.0, 0.0, -1.0); // orthographic view: we enter perpendicular to the screen
  vec3 r = refract(i, n, eta);
  if (dot(r, r) < 0.5) return vec2(0.0); // total internal reflection
  return r.xy * (depth / max(abs(r.z), 1e-3));
}

uniform sampler2D uBackdrop;
uniform vec2 uResolution;
uniform vec2 uHalfTexel;

vec3 sampleBackdrop(vec2 fragPx) {
  vec2 uv = fragPx / uResolution;
  // Clamp half a texel inward: keeps the LINEAR filter from reaching outside the texture at the edge.
  return texture(uBackdrop, clamp(uv, uHalfTexel, 1.0 - uHalfTexel)).rgb;
}

// Schlick approximation — the same formula as fresnelSchlick in optics.ts.
float fresnelSchlick(float cosTheta, float f0) {
  float c = clamp(1.0 - cosTheta, 0.0, 1.0);
  return f0 + (1.0 - f0) * pow(c, 5.0);
}

// t: 0 red end, 1 blue end. A coarse three-peaked spectrum weight.
vec3 spectrumWeight(float t) {
  return vec3(
    exp(-16.0 * (t - 0.15) * (t - 0.15)),
    exp(-16.0 * (t - 0.50) * (t - 0.50)),
    exp(-16.0 * (t - 0.85) * (t - 0.85))
  );
}

vec3 refractBackdrop(vec2 fragPx, vec3 n, float ior, float spread, float depth) {
  if (uSamples <= 1) {
    return sampleBackdrop(fragPx + refractOffset(n, 1.0 / ior, depth));
  }

  vec3 sum = vec3(0.0);
  vec3 wsum = vec3(0.0);
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= uSamples) break;
    float t = float(i) / float(uSamples - 1);
    float ni = ior + spread * (t - 0.5);      // the blue end gets the higher index
    vec2 off = refractOffset(n, 1.0 / ni, depth);
    vec3 w = spectrumWeight(t);
    sum += sampleBackdrop(fragPx + off) * w;
    wsum += w;
  }
  // Each channel is divided by its own weight sum: white stays white.
  return sum / max(wsum, vec3(1e-4));
}

void main() {
  vec2 p = gl_FragCoord.xy - uPanelCenter;
  float d = sdRoundedBox(p, uPanelHalf, uRadius);
  float alpha = 1.0 - smoothstep(-1.0, 1.0, d); // 2-pixel soft edge
  if (alpha <= 0.0) discard;

  vec3 n = glassNormal(p, uPanelHalf, uRadius, uBevel, uThickness, uNormalEps);

  if (uMode == MODE_NORMAL) {
    outColor = vec4(n * 0.5 + 0.5, alpha);
    return;
  }

  // Encode the inter-channel separation in pixels, relative to FRINGE_SCALE.
  if (uMode == MODE_FRINGE) {
    vec2 offR = refractOffset(n, 1.0 / (uIor - uSpread * 0.5), uDepth);
    vec2 offB = refractOffset(n, 1.0 / (uIor + uSpread * 0.5), uDepth);
    float sep = length(offR - offB);
    outColor = vec4(clamp(sep / FRINGE_SCALE, 0.0, 1.0), 0.0, 0.0, 1.0);
    return;
  }

  vec3 refr = refractBackdrop(gl_FragCoord.xy, n, uIor, uSpread, uDepth);

  vec3 view = vec3(0.0, 0.0, 1.0);
  float f = fresnelSchlick(max(dot(n, view), 0.0), uF0);
  vec3 sky = uTint * (0.55 + 0.45 * n.y); // cheap ambient: a gradient off the normal
  vec3 col = mix(refr, sky, f);

  vec3 l = normalize(vec3(-0.35, 0.72, 0.60));
  float spec = pow(max(dot(reflect(-view, n), l), 0.0), 48.0);
  col += vec3(1.0, 0.98, 0.94) * spec * uSpecular;

  outColor = vec4(col, alpha);
}
