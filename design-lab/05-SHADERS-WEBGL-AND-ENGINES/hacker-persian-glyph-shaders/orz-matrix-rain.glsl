// Matrix digital-rain cursor shader for Ghostty.
//
// When you type, a stream of procedural "katakana" glyphs falls from a random
// height straight down onto the new character. A bright white-green head leads
// the stream; behind it a green trail decays and fades out. The just-typed
// character flashes bright green and slowly fades back to normal.

// ----------------------------- CONFIG --------------------------------------
const float FALL_DURATION = 1.80;  // time for the head to fall to the cursor (s) — raise to slow down
const float FADE_DURATION = 1.60;  // extra fade time after the head lands (s)
const int   MIN_CELLS     = 6;     // shortest stream height (character cells)
const int   MAX_CELLS     = 22;    // tallest stream height -> "random height"
const float TRAIL_DECAY   = 0.30;  // how fast the trail dims above the head (per cell)
const float GLYPH_FLICKER = 5.0;   // how fast individual glyphs morph (lower = calmer)
const float DARKEN        = 0.40;  // how much the stream dims the terminal behind it
const float GLYPH_BRIGHT  = 2.00;  // glyph brightness
const float LAND_OFFSET   = 1.0;   // drop lands this many cells ABOVE the cursor (so it never drops past it)

const vec3 RAIN_COLOR = vec3(0.10, 1.00, 0.30); // classic matrix green
const vec3 HEAD_COLOR = vec3(0.85, 1.00, 0.90); // bright leading glyph / highlight

// Which fragCoord.y direction points to the TOP of the screen (where rain spawns).
// The in-browser preview is y-up; Ghostty's framebuffer is y-down, so we flip.
// If the rain falls the WRONG way in your Ghostty, swap the #else value to 1.0.
#if defined(WEB)
const float UP = 1.0;
#else
const float UP = -1.0;
#endif
// ---------------------------------------------------------------------------

float hash11(float n) { return fract(sin(n) * 43758.5453123); }
float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Random ASCII-style glyph: a 5x7 dot-matrix decoded from a per-cell random
// pattern, drawn as separated dots (gaps between them) so it reads like random
// monospace code rather than solid blocks. Morphs over time.
float glyphMask(vec2 uv, vec2 cellId, float seed) {
    uv = (uv - 0.5) / 0.85 + 0.5;                 // inner margin
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    vec2 cell = uv * vec2(5.0, 7.0);
    vec2 gi   = floor(cell);                       // dot index
    vec2 sub  = fract(cell);                       // position within the dot

    // separated dots -> dot-matrix character look (not merged blocks)
    float dot = step(0.12, sub.x) * step(sub.x, 0.88) *
                step(0.08, sub.y) * step(sub.y, 0.92);

    // pick a random "character" that changes over time, then test this dot's bit
    float ch  = floor(hash21(cellId + floor(iTime * GLYPH_FLICKER) * 1.7) * 977.0);
    float lit = step(0.55, hash21(gi + ch * 3.3 + 0.5));
    return lit * dot;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = texture(iChannel0, fragCoord.xy / iResolution.xy);

    float cellW = iCurrentCursor.z;
    float cellH = iCurrentCursor.w;
    if (cellW < 1.0 || cellH < 1.0) return;

    // only affect the cursor's own column
    if (fragCoord.x < iCurrentCursor.x || fragCoord.x > iCurrentCursor.x + cellW) return;

    // cell coordinate up the column: 0 = cursor cell, 1+ = above it (toward screen top)
    float cells   = UP * (fragCoord.y - iCurrentCursor.y) / cellH;
    float cellPos = cells + 1.0;
    if (cellPos < 0.0) return;                   // below the cursor cell
    float rowIndex = floor(cellPos);
    vec2  inCell   = vec2((fragCoord.x - iCurrentCursor.x) / cellW, fract(cellPos));

    // per-keystroke randomness (column + the moment it was typed)
    float colIndex = floor(iCurrentCursor.x / max(cellW, 1.0));
    float seed     = hash11(colIndex * 12.3 + iTimeCursorChange * 7.7);
    float maxRow   = float(MIN_CELLS) + floor(seed * float(MAX_CELLS - MIN_CELLS));

    // time since this character was typed; head falls at a steady (linear) pace
    float t       = iTime - iTimeCursorChange;
    float fallT   = clamp(t / FALL_DURATION, 0.0, 1.0);
    float headPos = mix(maxRow, LAND_OFFSET, fallT);  // lands above the cursor, never past it

    float globalFade = 1.0 - clamp((t - FALL_DURATION) / FADE_DURATION, 0.0, 1.0);
    if (globalFade <= 0.0) return;

    float d = rowIndex - headPos;                // cells above the falling head
    if (d < -0.5 || rowIndex > maxRow + 0.5) return;

    float trail     = exp(-max(d, 0.0) * TRAIL_DECAY);  // bright at head, fades up the trail
    float headGlow  = smoothstep(1.3, 0.0, abs(d));     // whiteness near the head
    float intensity = trail * globalFade;
    vec3  col       = mix(RAIN_COLOR, HEAD_COLOR, headGlow);

    if (rowIndex < 0.5) {
        // typed character: additive bright-green flash that fades (no solid block)
        float lum = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
        fragColor.rgb += col * intensity * (0.6 + 1.2 * lum);
    } else {
        // rain cell: gently dim the terminal behind the stream, draw a bright glyph
        float mask = glyphMask(inCell, vec2(colIndex, rowIndex), seed);
        fragColor.rgb *= 1.0 - DARKEN * intensity;
        fragColor.rgb += col * mask * intensity * GLYPH_BRIGHT;
    }

    fragColor.rgb = min(fragColor.rgb, vec3(1.3));
}
