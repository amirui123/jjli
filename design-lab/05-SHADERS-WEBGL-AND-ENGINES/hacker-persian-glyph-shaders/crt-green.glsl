// CRT Green: standalone phosphor tint, scanline mask, and soft green glow.

// ----------------------------- CONFIG --------------------------------------
const float SCANLINE_STRENGTH = 0.14;
const float PHOSPHOR_MASK = 0.08;
const float VIGNETTE_STRENGTH = 0.22;
const float GREEN_TINT = 0.20;
const float BLOOM_STRENGTH = 0.16;
const float CURVE_DARKEN = 0.10;

const vec3 PHOSPHOR_GREEN = vec3(0.20, 1.00, 0.42);
// ---------------------------------------------------------------------------

float luminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

vec3 sampleGlow(vec2 uv) {
    vec2 px = 1.0 / iResolution.xy;
    vec3 glow = texture(iChannel0, uv).rgb * 0.34;
    glow += texture(iChannel0, uv + vec2(px.x * 1.5, 0.0)).rgb * 0.16;
    glow += texture(iChannel0, uv - vec2(px.x * 1.5, 0.0)).rgb * 0.16;
    glow += texture(iChannel0, uv + vec2(0.0, px.y * 1.5)).rgb * 0.12;
    glow += texture(iChannel0, uv - vec2(0.0, px.y * 1.5)).rgb * 0.12;
    glow += texture(iChannel0, uv + vec2(px.x * 2.5, px.y * 2.5)).rgb * 0.05;
    glow += texture(iChannel0, uv - vec2(px.x * 2.5, px.y * 2.5)).rgb * 0.05;
    return glow;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec4 base = texture(iChannel0, uv);

    float scanline = 1.0 - SCANLINE_STRENGTH * (0.5 + 0.5 * sin(fragCoord.y * 3.14159265));
    float mask = 1.0 - PHOSPHOR_MASK * step(0.66, fract(fragCoord.x / 3.0));

    vec2 centered = uv * 2.0 - 1.0;
    float dist2 = dot(centered, centered);
    float vignette = 1.0 - VIGNETTE_STRENGTH * smoothstep(0.35, 1.35, dist2);
    float curve = 1.0 - CURVE_DARKEN * smoothstep(0.55, 1.35, abs(centered.x) + abs(centered.y));

    vec3 tinted = mix(base.rgb, base.rgb * vec3(0.70, 1.16, 0.78), GREEN_TINT);
    vec3 glow = sampleGlow(uv);
    float glowLum = luminance(glow);

    vec3 color = tinted * scanline * mask * vignette * curve;
    color += PHOSPHOR_GREEN * glowLum * BLOOM_STRENGTH;

    fragColor = vec4(min(color, vec3(1.15)), base.a);
}
