#version 330 core
/*
 * post.frag — the second pass: screen-space effects on the finished scene.
 *
 * WHY A SECOND PASS?
 * The RGB split (chromatic aberration) needs the scene at three different
 * positions: red from slightly left, blue from slightly right. In a
 * single-pass design the only way to get that is to RENDER THE WHOLE SCENE
 * THREE TIMES, which at 3840x2400 pushed integrated GPUs over their frame
 * budget on every bar. Here the scene is already a texture, so the split
 * costs three texture reads per pixel instead of three scenes.
 *
 * It also lets the scene be drawn at a lower RENDER SCALE: the texture
 * may be smaller than the screen, and the texture() reads below stretch it
 * with bilinear filtering. The cheap per-pixel effects (scanlines, grain)
 * still run at full display resolution, which hides the upscaling well.
 */

out vec4 fragColor;

uniform sampler2D uScene;      // the scene, rendered by shader.frag (HDR)
uniform vec2      uResolution; // DISPLAY framebuffer size in pixels
uniform float     uTime;
uniform float     uBeatCount;

// Same beat-structure envelopes as shader.frag (keep them identical).
const float PHRASE = 16.0;
float barPunch()  { return uBeatCount > 0.0 ? exp(-mod(uBeatCount, 4.0) * 3.0) : 0.0; }
float phraseHit() { return uBeatCount > 0.0 ? exp(-mod(uBeatCount, PHRASE) * 2.5) : 0.0; }

// Integer hash for the film grain (see shader.frag, HASHING).
uint hashU(uint x)
{
    x ^= x >> 16; x *= 0x7feb352du;
    x ^= x >> 15; x *= 0x846ca68bu;
    x ^= x >> 16;
    return x;
}
float toF(uint x) { return float(x >> 8) * (1.0 / 16777216.0); }

void main()
{
    // Texture coordinates run 0..1 across the texture regardless of its
    // size, which is what makes the render scale transparent here.
    vec2 uv = gl_FragCoord.xy / uResolution;

    /* RGB SPLIT: red from a little to the right, blue from a little to the left,
     * green in place. The offset is in display pixels, converted to texture
     * units by dividing by the width. Bars punch a little, phrases punch hard. */
    float split = (6.0 * barPunch() + 22.0 * phraseHit()) * (uResolution.y / 720.0);
    vec2  off   = vec2(split / uResolution.x, 0.0);
    vec3  col;
    col.r = texture(uScene, uv + off).r;
    col.g = texture(uScene, uv).g;
    col.b = texture(uScene, uv - off).b;

    // Vignette: darken towards the corners to frame the image.
    vec2 v = uv - 0.5;
    col *= 1.0 - dot(v, v) * 1.1;

    // Scanlines: sin(pi*y) at pixel centres (y = n + 0.5) alternates +1/-1,
    // so every other line is 12% darker. A cheap CRT feel.
    col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 3.14159265);

    // Film grain: tiny per-pixel, per-frame noise. Also hides gradient banding.
    uint px = uint(gl_FragCoord.x) + uint(gl_FragCoord.y) * 4096u;
    col += (toF(hashU(px ^ hashU(uint(uTime * 60.0)))) - 0.5) * 0.025;

    /* Tone mapping: 1 - exp(-x) maps [0, infinity) smoothly into [0, 1), so
     * bright heads plus glow roll off softly to white-green instead of
     * clipping to a flat blob. This is why the scene texture is 16-bit
     * float: an 8-bit texture would clip everything above 1.0 BEFORE this. */
    col = 1.0 - exp(-col * 1.25);

    fragColor = vec4(col, 1.0);
}
