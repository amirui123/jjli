// CRT Phosphor Bloom — a Ghostty custom shader: bold CRT scan/glow pass.
//
// Samples the terminal image and applies stable scanlines, phosphor slot tint,
// local brightness bloom, slight red/blue pixel separation, static tube grain,
// controlled phosphor flicker, glass glow, mild barrel curvature, tube edge
// darkening, and an edge vignette. The defaults are intentionally visible but
// avoid harsh full-screen strobing and blur. The effect is ambient-only and uses
// iTime, iResolution, iChannel0, and pure math with no cursor coupling, external
// textures, preprocessing, or generated data.
//
// This shader is original procedural code and uses no upstream shader source.
//
// All values below are tunable — see TUNING.

// ============================ TUNING =======================================
// --- CRT response -----------------------------------------------------------
const float SCANLINE_STRENGTH = 0.560; // dark horizontal scanline contrast
const float BLOOM_INTENSITY   = 0.410; // local bright-pixel halo strength
const float PHOSPHOR_TINT     = 0.470; // RGB phosphor color separation/tint
const float VIGNETTE          = 0.380; // edge darkening
const float GRAIN_STRENGTH    = 0.055; // static subpixel/tube texture, not flicker
const float FLICKER_STRENGTH  = 0.035; // controlled phosphor shimmer, not a hard strobe
const float FLICKER_SPEED     = 38.0;  // flicker cadence in updates per second
const float GLASS_TINT        = 0.220; // stable low tube glow visible on dark backgrounds
const float MASK_VISIBILITY   = 0.290; // shadow-mask visibility independent of text brightness
const float CHROMATIC_OFFSET  = 1.65;  // red/blue sample offset in physical pixels
const float CURVATURE         = 0.045; // barrel curvature; 0 = flat terminal plane
const float TUBE_EDGE         = 0.260; // extra darkening near curved screen edges

// --- Color -----------------------------------------------------------------
const vec3  PHOSPHOR_WARM     = vec3(1.04, 1.00, 0.93);
const vec3  PHOSPHOR_COOL     = vec3(0.92, 1.02, 1.08);
const vec3  GLASS_COLOR       = vec3(0.08, 0.16, 0.13);
// ===========================================================================

float luminance(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 sampleBloom(vec2 uv, vec2 px, vec3 center) {
    vec3 nearSum = vec3(0.0);
    nearSum += texture(iChannel0, clamp(uv + vec2( px.x, 0.0), vec2(0.0), vec2(1.0))).rgb;
    nearSum += texture(iChannel0, clamp(uv + vec2(-px.x, 0.0), vec2(0.0), vec2(1.0))).rgb;
    nearSum += texture(iChannel0, clamp(uv + vec2(0.0,  px.y), vec2(0.0), vec2(1.0))).rgb;
    nearSum += texture(iChannel0, clamp(uv + vec2(0.0, -px.y), vec2(0.0), vec2(1.0))).rgb;

    vec3 farSum = vec3(0.0);
    farSum += texture(iChannel0, clamp(uv + vec2( px.x,  px.y) * 2.0, vec2(0.0), vec2(1.0))).rgb;
    farSum += texture(iChannel0, clamp(uv + vec2(-px.x,  px.y) * 2.0, vec2(0.0), vec2(1.0))).rgb;
    farSum += texture(iChannel0, clamp(uv + vec2( px.x, -px.y) * 2.0, vec2(0.0), vec2(1.0))).rgb;
    farSum += texture(iChannel0, clamp(uv + vec2(-px.x, -px.y) * 2.0, vec2(0.0), vec2(1.0))).rgb;

    vec3 blur = nearSum * 0.18 + farSum * 0.07;
    float bright = smoothstep(0.34, 1.0, luminance(center));
    return blur * bright;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 res = iResolution.xy;
    vec2 screenUV = fragCoord / res;
    vec2 px = 1.0 / res;

    vec2 screenCentered = screenUV * 2.0 - 1.0;
    float radiusSq = dot(screenCentered, screenCentered);
    vec2 curvedCentered = screenCentered * (1.0 + CURVATURE * radiusSq);
    vec2 uv = curvedCentered * 0.5 + 0.5;

    float softBounds = smoothstep(-0.010, 0.020, uv.x)
        * smoothstep(-0.010, 0.020, uv.y)
        * (1.0 - smoothstep(0.980, 1.010, uv.x))
        * (1.0 - smoothstep(0.980, 1.010, uv.y));
    float tubeEdge = smoothstep(0.0, 0.055, uv.x)
        * smoothstep(0.0, 0.055, uv.y)
        * (1.0 - smoothstep(0.945, 1.0, uv.x))
        * (1.0 - smoothstep(0.945, 1.0, uv.y));
    uv = clamp(uv, vec2(0.0), vec2(1.0));

    vec4 base = texture(iChannel0, uv);
    vec3 color = base.rgb;

    vec2 chromaOffset = vec2(px.x * CHROMATIC_OFFSET, 0.0);
    vec3 chroma = vec3(
        texture(iChannel0, clamp(uv + chromaOffset, vec2(0.0), vec2(1.0))).r,
        color.g,
        texture(iChannel0, clamp(uv - chromaOffset, vec2(0.0), vec2(1.0))).b
    );
    color = mix(color, chroma, 0.55);

    float scanPhase = fract(fragCoord.y * 0.5);
    float scan = 0.58 + 0.42 * smoothstep(0.16, 0.46, scanPhase)
        * (1.0 - smoothstep(0.58, 0.98, scanPhase));
    color *= 1.0 - SCANLINE_STRENGTH * (1.0 - scan);

    float slot = fract(fragCoord.x / 3.0);
    vec3 phosphorMask = vec3(
        smoothstep(0.00, 0.18, slot) * (1.0 - smoothstep(0.26, 0.40, slot)),
        smoothstep(0.30, 0.48, slot) * (1.0 - smoothstep(0.58, 0.72, slot)),
        smoothstep(0.62, 0.80, slot) * (1.0 - smoothstep(0.88, 1.00, slot))
    );
    vec3 phosphor = mix(PHOSPHOR_WARM, PHOSPHOR_COOL, uv.y);
    float mask = max(phosphorMask.r, max(phosphorMask.g, phosphorMask.b));
    float phosphorLuma = smoothstep(0.04, 0.75, luminance(color));
    color *= 1.0 - MASK_VISIBILITY * (1.0 - mask) * 0.70;
    color = mix(color, color * phosphor + phosphorMask * (0.030 + phosphorLuma * 0.075), PHOSPHOR_TINT);

    vec3 bloom = sampleBloom(uv, px, base.rgb);
    color += bloom * BLOOM_INTENSITY;

    float grain = hash12(floor(fragCoord.xy * vec2(0.5, 1.0)));
    color *= 1.0 + (grain - 0.5) * GRAIN_STRENGTH;

    float flickerTick = floor(iTime * FLICKER_SPEED);
    float flickerNoise = hash12(vec2(flickerTick, 19.7));
    float flickerWave = 0.5 + 0.5 * sin(iTime * 73.0 + flickerNoise * 6.2831853);
    float phosphorFlicker = mix(1.0 - FLICKER_STRENGTH, 1.0 + FLICKER_STRENGTH, mix(flickerNoise, flickerWave, 0.35));
    float rowFlicker = 1.0 + (hash12(vec2(floor(fragCoord.y * 0.5), flickerTick * 0.5)) - 0.5) * FLICKER_STRENGTH * 0.65;
    color *= phosphorFlicker * rowFlicker;

    float glass = 1.0 - smoothstep(0.05, 1.28, radiusSq);
    color += GLASS_COLOR * GLASS_TINT * (0.35 + 0.65 * glass);

    color *= mix(1.0 - TUBE_EDGE, 1.0, tubeEdge);
    color = mix(GLASS_COLOR * 0.18, color, softBounds);

    float vig = 1.0 - smoothstep(0.24, 1.35, radiusSq);
    color *= mix(1.0 - VIGNETTE, 1.0, vig);

    fragColor = vec4(color, base.a);
}
