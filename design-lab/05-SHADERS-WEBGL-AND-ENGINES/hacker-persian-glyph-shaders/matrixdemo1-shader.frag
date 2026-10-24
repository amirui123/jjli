#version 330 core
/*
 * shader.frag — Matrix digital rain, 100% procedural.
 *
 * THE BIG IDEA
 * ------------
 * A fragment shader runs once per pixel, in parallel, with no memory of
 * other pixels or of previous frames. So we can't "move characters down the
 * screen" the way a CPU program would. Instead each pixel asks:
 *
 *   1. Which character cell am I in?            (divide by the cell size)
 *   2. Where is the falling drop in my column right now?
 *                                               (a pure function of time)
 *   3. How far behind the drop's head is my cell?  (gives brightness)
 *   4. Which glyph lives in my cell, and is my pixel one of its "on" dots?
 *
 * Everything is a deterministic function of (pixel position, time). The
 * "randomness" (column speeds, glyph shapes) comes from HASH FUNCTIONS: they
 * turn integers (column number, row number...) into numbers that look
 * random but are always the same for the same input. That's how we get
 * per-column variety without storing any per-column data.
 *
 * Two copies of the rain are drawn: a small, dim, slow "far" layer and a
 * big, bright "near" layer. Different sizes and speeds fake depth (parallax).
 *
 * COORDINATES
 *   gl_FragCoord.xy = pixel centre in pixels of the render target, origin
 *   BOTTOM-left, y goes up. Rain falls downward, so we count rows from the top.
 *
 * TWO PASSES
 *   This shader draws the SCENE into an off-screen texture (possibly at a
 *   reduced "render scale"), in HDR: colours may exceed 1.0. post.frag then
 *   reads that texture and does the screen-space effects (RGB split,
 *   vignette, scanlines, grain, tone mapping) at full display resolution.
 *   See main.c, RENDER TARGET, for why.
 *
 * Edit this file and press R in the running demo to hot-reload it.
 */

out vec4 fragColor;

/* ---- Uniforms: values the CPU sets once per frame (see main.c) ---- */
uniform vec2  uResolution; // framebuffer size in pixels
uniform float uTime;       // seconds of music heard (the master clock)
uniform float uRainTime;   // "warped" time for falling motion (speeds up on beats)
uniform float uBeat;       // 1.0 at each kick drum, decays towards 0 before the next
uniform float uBeatCount;  // beats elapsed since the music started (fractional)

/* ---- Tunables. Units: rows per second, or rows (character cells). ---- */
const float SPEED_MIN  = 5.0;
const float SPEED_MAX  = 17.0;
const float TRAIL_MIN  = 6.0;
const float TRAIL_MAX  = 28.0;
const float CELL_ASPECT = 0.62;              // cell width / height (glyphs are tall)
const vec3  TRAIL_COLOR = vec3(0.10, 1.00, 0.35);
const vec3  HEAD_COLOR  = vec3(0.80, 1.00, 0.88);

/* ======================================================================== */
/* HASHING                                                                   */
/* ======================================================================== */
/*
 * Many shader tutorials use  fract(sin(x) * 43758.5453).  That trick depends
 * on how precisely each GPU computes sin() of large numbers, so it can give
 * different patterns (or visible banding) on different vendors' drivers.
 * GLSL 3.30 has real 32-bit unsigned integers, so we use an integer hash
 * instead. It's exact and identical on every GPU.
 *
 * hashU is "lowbias32" by Chris Wellons: alternating xor-shifts (fold high
 * bits down) and multiplications by odd constants (spread low bits up).
 * After two rounds, flipping any input bit flips about half of the output
 * bits ("avalanche"), which is what makes neighbouring columns look unrelated.
 */
uint hashU(uint x)
{
    x ^= x >> 16; x *= 0x7feb352du;
    x ^= x >> 15; x *= 0x846ca68bu;
    x ^= x >> 16;
    return x;
}

/* uint to float in [0,1). We keep the top 24 bits because a float's mantissa
 * holds exactly 24 bits, so the conversion is exact. */
float toF(uint x) { return float(x >> 8) * (1.0 / 16777216.0); }

/* Hash two values together. The golden-ratio constant 0x9E3779B9 keeps
 * (a,b) and (b,a) and small values from colliding. */
float hash2(uint a, uint b) { return toF(hashU(a ^ hashU(b + 0x9E3779B9u))); }
uint  hashU3(uint a, uint b, uint c) { return hashU(a ^ hashU(b ^ hashU(c + 0x9E3779B9u))); }

/* ======================================================================== */
/* DROPS: column speed & reset logic                                          */
/* ======================================================================== */
/*
 * Each column hosts two independent drops (k = 0, 1), so columns sometimes
 * have two streams at once. A drop's head moves down at `speed` rows/sec.
 *
 * RESET LOGIC WITHOUT STATE: the head position is wrapped with a modulo,
 *     pos  = rainTime * speed + randomOffset
 *     head = pos mod cycle
 * where cycle = (screen rows) + (max trail length) + (random gap).
 * So the head enters at the top (head = 0), falls past the bottom, keeps going
 * until its whole tail has left the screen, waits off-screen for the "gap",
 * then wraps to 0 and enters again. The random gap stops columns from
 * restarting in lock-step.
 *
 * iter = floor(pos / cycle) counts how many times the drop has wrapped. Using
 * it as a hash input gives every pass a new trail length and new identity,
 * so a column never repeats exactly. The change happens while the drop is
 * off-screen, so it's invisible.
 */
struct Drop {
    float head;   // row index of the head (0 = top row; fractional)
    float trail;  // trail length in rows
};

Drop getDrop(uint column, uint k, float rows, float speedMul)
{
    uint  id    = hashU(column * 2u + k);
    float speed = mix(SPEED_MIN, SPEED_MAX, hash2(id, 1u)) * speedMul;
    float gap   = hash2(id, 2u) * rows * 1.2;
    float cycle = rows + TRAIL_MAX + gap;
    float pos   = uRainTime * speed + hash2(id, 3u) * cycle;
    float iter  = floor(pos / cycle);

    Drop d;
    d.head  = pos - iter * cycle;                             // = pos mod cycle
    d.trail = mix(TRAIL_MIN, TRAIL_MAX, hash2(id, uint(iter) * 7u + 4u));
    return d;
}

/* ======================================================================== */
/* GLYPHS: procedural 5x7 dot-matrix characters                               */
/* ======================================================================== */
/*
 * The film used mirrored katakana and digits. We don't ship a font texture,
 * so we invent glyphs: a 5x7 grid where each dot is on or off according to a
 * hash of (glyph id, dot x, dot y). Pure random dots look like noise, so half
 * the glyphs are made left-right SYMMETRIC (mirror x around the centre
 * column), and symmetric shapes read as "characters" to our brains.
 *
 * uv: position inside the cell, [0,1]^2 with y up. Returns dot coverage 0..1.
 */
float glyph(vec2 uv, uint gid)
{
    const vec2 GRID = vec2(5.0, 7.0);
    const vec2 PAD  = vec2(0.14, 0.08);         // empty margin around each glyph
    vec2 p = (uv - PAD) / (1.0 - 2.0 * PAD);    // 0..1 inside the glyph box
    if (any(lessThan(p, vec2(0.0))) || any(greaterThanEqual(p, vec2(1.0)))) return 0.0;

    p *= GRID;
    ivec2 ip = ivec2(p);                        // which dot (0..4, 0..6)
    vec2  fp = fract(p);                        // position inside that dot

    int x = ip.x;
    if ((gid & 1u) != 0u) x = min(x, 4 - x);    // symmetric glyph: mirror columns

    // ~45% of dots lit. Rows 0 and 6 are lit a bit less, which looks less blocky.
    float threshold = (ip.y == 0 || ip.y == 6) ? 0.65 : 0.55;
    float on = step(threshold, toF(hashU3(gid, uint(x), uint(ip.y))));

    // Round each dot slightly (LED / CRT phosphor look) instead of a hard square.
    vec2  q   = abs(fp - 0.5);
    float dot = 1.0 - smoothstep(0.36, 0.5, max(q.x, q.y));
    return on * dot;
}

/* ======================================================================== */
/* ONE LAYER OF RAIN                                                          */
/* ======================================================================== */
/*
 *  frag     : pixel position (y up)
 *  rows     : how many character rows fit on screen (sets the cell size)
 *  seed     : decorrelates layers so they don't share column patterns
 *  speedMul : layer speed multiplier (far = slower: parallax)
 *  chaos    : 0..1, how infected this spot is by the virus (see infection())
 *
 * Returns rgb = the normal green rain, a = brightness of the virus's own
 * "corrupted" glyphs. They're kept apart so main() can colour them differently.
 */
vec4 rainLayer(vec2 frag, float rows, uint seed, float speedMul, float chaos)
{
    float cellH = uResolution.y / rows;
    float cellW = cellH * CELL_ASPECT;

    // Grid coordinates: x = column (left to right), y = row (top to bottom).
    vec2  g     = vec2(frag.x / cellW, (uResolution.y - frag.y) / cellH);
    vec2  cell  = floor(g);
    vec2  local = vec2(fract(g.x), 1.0 - fract(g.y)); // inside the cell, y up again
    int   colI  = int(cell.x);
    float row   = cell.y;

    /* GLYPH CHOICE: a cell's character belongs to the CELL, not to the drop.
     * That's how the film looks: the "screen" of characters mostly stays put and
     * the falling drops light them up as they pass. About 30% of cells mutate
     * now and then, at their own random rate, which gives the shimmer. */
    uint  cellId  = hashU3(uint(colI) ^ seed, uint(row), 0x51u);
    float mutRate = toF(cellId) < 0.3 ? mix(1.0, 9.0, hash2(cellId, 5u)) : 0.05;

    float lit   = 0.0;   // trail brightness of this cell (max over both drops)
    float head  = 0.0;   // 1 if this cell is a drop head
    float glow  = 0.0;   // soft light around heads (bloom substitute)
    float haze  = 0.0;   // soft light along trails

    /* We look at our own column AND both neighbours, because a head's glow
     * spills sideways into the next columns. Without this, the glow would be
     * cut off with a hard vertical edge at the column border. The glyph itself
     * only needs our own column (dc == 0). */
    for (int dc = -1; dc <= 1; dc++) {
        // int to uint keeps the bit pattern, so column -1 hashes fine.
        uint column = uint(colI + dc) ^ seed;
        for (uint k = 0u; k < 2u; k++) {
            Drop  d        = getDrop(column, k, rows, speedMul);
            float headCell = floor(d.head);  // characters jump cell by cell, like
                                             // a terminal, so snap the head to a row

            /* GLOW: Gaussian falloff by distance (in cell-height units) from
             * this pixel to the head cell's centre. exp(-r^2 * k) is a cheap,
             * smooth blob, which is what bloom looks like. */
            vec2 toHead = vec2((g.x - (cell.x + float(dc) + 0.5)) * CELL_ASPECT,
                               g.y - (headCell + 0.5));
            // Only drops whose head is near our pixel matter; skip the exp otherwise.
            if (abs(toHead.y) < 3.0)
                glow += exp(-dot(toHead, toHead) * 1.6);

            if (dc != 0) continue;

            float dist = headCell - row;     // 0 = head cell, >0 = rows behind it
            if (dist >= 0.0 && dist <= d.trail) {
                float fade = 1.0 - dist / d.trail;
                fade *= fade;                // quadratic: long dim tail, bright front
                lit  = max(lit, fade);
                if (dist < 0.5) head = 1.0;
                // Haze: a fuzzy vertical strip centred on the column.
                float dx = local.x - 0.5;
                haze = max(haze, fade * exp(-dx * dx * 10.0));
            }
        }
    }

    // The head character mutates every frame-ish (fast flicker); others at their own rate.
    // Infected cells all scramble fast: the virus is rewriting the code.
    float rate = head > 0.0 ? 14.0 : mix(mutRate, 18.0, chaos);
    uint  gid  = hashU(cellId ^ uint(floor(uTime * rate + toF(cellId) * 7.0)));
    float dots = glyph(local, gid);

    /* VIRUS GLYPHS: infection fills the EMPTY space too. Each cell gets a
     * random draw 12 times a second. The more infected the area, the more
     * cells win and light up, so dark gaps between the streams crawl with
     * corrupted characters. */
    float corrupt = chaos * step(1.0 - 0.3 * chaos, hash2(cellId, uint(uTime * 12.0)));

    /* BEAT REACTION: heads flare on each kick, the haze breathes. The fall
     * speed boost is done on the CPU side via uRainTime (see main.c for why). */
    float beat = uBeat;
    vec3  c    = TRAIL_COLOR * dots * lit * (0.85 + 0.35 * beat);
    c         += HEAD_COLOR  * dots * head * (1.3 + 1.0 * beat);
    c         += TRAIL_COLOR * haze * (0.07 + 0.08 * beat);
    c         += mix(TRAIL_COLOR, HEAD_COLOR, 0.5) * glow * (0.22 + 0.25 * beat);
    return vec4(c, dots * corrupt);
}

/* ======================================================================== */
/* BEAT STRUCTURE: turning "beats elapsed" into musical events                */
/* ======================================================================== */
/*
 * The music (synth.c) is 4 beats per bar and 4 bars per phrase. The beat
 * counter alone tells us where we are at every level:
 *
 *   beat   : fract(beats)            every kick           -> uBeat (CPU side)
 *   bar    : mod(beats, 4)           every 4 kicks        -> PUNCH
 *   phrase : mod(beats, 16)          every 16 kicks       -> VIRUS
 *
 * Bigger musical units get bigger visual events. That's what makes a hit
 * feel "major": the eye learns the hierarchy just as the ear does.
 *
 *   ...beat 15.75: tear glitch (build-up) | beat 0: FLASH + SHAKE + VIRUS
 */
const float PHRASE      = 16.0;  // beats per phrase
const float VIRUS_BEATS = 5.0;   // how long an infection lasts
const vec3  VIRUS_COLOR = vec3(1.00, 0.10, 0.22);   // infected code
const vec3  VIRUS_HOT   = vec3(1.00, 0.75, 0.80);   // infection front / corrupted glyphs

// Exponential decays since the last bar / phrase downbeat. 1 on the hit, falls to ~0.
// post.frag has identical copies (for the RGB split). Change both together.
float barPunch()  { return uBeatCount > 0.0 ? exp(-mod(uBeatCount, 4.0) * 3.0) : 0.0; }
float phraseHit() { return uBeatCount > 0.0 ? exp(-mod(uBeatCount, PHRASE) * 2.5) : 0.0; }

/*
 * INFECTION. Returns x = how infected this pixel is (0 or 1), y = brightness
 * of the infection's leading edge.
 *
 * The screen is split into BLOCKS of 2x2 near-layer character cells, so the
 * infection eats whole characters and looks digital rather than smooth.
 * For each block:
 *
 *   d      = distance from the outbreak origin + random jitter per block.
 *            The jitter turns a perfect circle into a ragged, organic
 *            spreading shape (a cheap "dissolve" trick).
 *   radius = grows fast at first, then slows: 1 - exp(-t) shape.
 *   block is infected while  d < radius  AND  t < healTime(block).
 *
 * healTime also depends on the jitter and on distance, so the infection
 * breaks up block by block (and flickers just before each block heals) instead
 * of vanishing at once. Every phrase gets a new origin from hashing the phrase
 * number, so it never starts from the same spot twice in a row.
 */
vec2 infection(vec2 frag, out vec2 block)
{
    float t = mod(uBeatCount, PHRASE);   // beats since the phrase started
    block = vec2(0.0);
    if (uBeatCount <= 0.0 || t > VIRUS_BEATS) return vec2(0.0);

    uint  ph     = uint(uBeatCount / PHRASE);           // which phrase we're in
    float aspect = uResolution.x / uResolution.y;
    // Outbreak origin in "screen height" units, y measured from the top.
    vec2  origin = vec2(mix(0.2, 0.8, hash2(ph, 11u)) * aspect,
                        mix(0.2, 0.8, hash2(ph, 12u)));

    // Same cell grid as the near rain layer (34 rows), grouped 2x2.
    float cellH = uResolution.y / 34.0;
    vec2  cellSz = vec2(cellH * CELL_ASPECT, cellH);
    vec2  g      = vec2(frag.x, uResolution.y - frag.y) / cellSz;
    block        = floor(g / 2.0);
    vec2  centre = (block * 2.0 + 1.0) * cellSz / uResolution.y;

    float jitter = toF(hashU3(uint(int(block.x)), uint(int(block.y)), ph));
    float d      = length(centre - origin) + jitter * 0.22;
    float radius = 0.05 + 0.75 * (1.0 - exp(-t * 1.4));   // tops out around 0.8 screen heights
    float heal   = 1.6 + jitter * 1.8 + d * 1.4;

    if (d > radius || t > heal) return vec2(0.0);

    // Dying blocks stutter on and off during their last half beat.
    if (t > heal - 0.5 && hash2(uint(int(block.x * 31.0 + block.y)), uint(uBeatCount * 16.0)) > 0.5)
        return vec2(0.0);

    /* The front glows while the infection is still advancing. Scaling by
     * exp(-1.4 t), which is proportional to the spread speed (the derivative
     * of the radius), means it dims as the spread stalls, rather than leaving
     * a permanent bright rim. */
    float edge = (1.0 - smoothstep(0.0, 0.07, radius - d)) * exp(-t * 1.4);
    return vec2(1.0, edge);
}

/* ======================================================================== */
/* THE WHOLE IMAGE (before post-processing)                                   */
/* ======================================================================== */
/* It's a function so main() can call it several times at shifted positions
 * for the RGB-split effect. */
vec3 scene(vec2 frag)
{
    vec2  res    = uResolution;
    float scale  = res.y / 720.0;        // pixel effects look the same at any resolution
    float punch  = barPunch();
    float hit    = phraseHit();

    /* ZOOM PUNCH: scale the image around the centre for a moment. Dividing
     * the coordinate makes the content BIGGER (we sample closer to the
     * centre). Bars punch a little, phrases punch hard. */
    vec2 centre = res * 0.5;
    frag = centre + (frag - centre) / (1.0 + 0.025 * punch + 0.06 * hit);

    /* SHAKE on phrase hits: a random offset that changes 24 times a beat,
     * scaled by the decaying hit so it settles quickly. */
    if (hit > 0.02) {
        uint tick = uint(uBeatCount * 24.0);
        frag += (vec2(hash2(tick, 1u), hash2(tick, 2u)) - 0.5) * 28.0 * scale * hit;
    }

    /* TEAR: during the last quarter-beat of every phrase, slice the screen
     * into horizontal bands and shove some of them sideways. Moving the sample
     * position before drawing is the cheapest possible "VHS tear". It's the
     * build-up just before the virus hits. */
    if (uBeatCount > 0.0 && mod(uBeatCount, PHRASE) > PHRASE - 0.25) {
        uint band = uint(frag.y / (res.y / 28.0));
        uint tick = uint(uBeatCount * 8.0);
        if (hash2(band, tick) > 0.6) frag.x += (hash2(band, tick + 99u) - 0.5) * res.x * 0.08;
    }

    // ---- The virus ----
    vec2 block;
    vec2 inf = infection(frag, block);

    /* GLITCH INSETS: inside the infection, a few big rectangles (10x4 cells)
     * become "windows" showing the code from somewhere else: displaced sideways
     * by a whole number of cells, drawn hot and striped like a corrupted video
     * buffer. They re-roll 4 times per beat, so the windows jump around. */
    bool inset = false;
    if (inf.x > 0.0) {
        uvec2 r    = uvec2(ivec2(floor(block / vec2(5.0, 2.0))));
        uint  tick = uint(uBeatCount * 4.0);
        float h    = toF(hashU3(r.x, r.y, tick));
        if (h > 0.86) {
            inset = true;
            float cellW = res.y / 34.0 * CELL_ASPECT;
            frag.x += floor((hash2(r.x ^ tick, r.y) - 0.5) * 24.0) * cellW;
        }
    }

    // ---- Rain layers ----
    // Far layer: small cells, slower, dim and slightly bluer (atmospheric depth).
    vec3 col  = rainLayer(frag, 58.0, 0xA341316Cu, 0.55, 0.0).rgb * vec3(0.30, 0.38, 0.42);
    // Near layer: big cells, full speed. Layers are light, so they ADD.
    vec4 near = rainLayer(frag, 34.0, 0xC8013EA4u, 1.0, inf.x);
    col += near.rgb;

    // ---- Infected look ----
    if (inf.x > 0.0) {
        // Keep the brightness of the code, swap its colour to virus red...
        float lum = dot(col, vec3(0.3, 0.6, 0.1));
        col  = VIRUS_COLOR * lum * 1.5;
        // ...add the corrupted glyphs growing in the empty space...
        col += VIRUS_HOT * near.a * 0.9;
        // ...a dim red backlight so infected areas read as a region...
        col += VIRUS_COLOR * 0.06;
        // ...and a hot leading edge where the infection is still spreading.
        col += VIRUS_HOT * inf.y * 0.5;
        // Insets: the displaced code glows hot on a striped red backing. The
        // stripes (dark every 3rd pixel row) suggest a damaged framebuffer.
        if (inset) {
            float stripe = step(1.0, mod(gl_FragCoord.y, 3.0));
            col = VIRUS_HOT * lum * 2.2 + VIRUS_COLOR * 0.10 * stripe;
        }
    }

    // Phrase hit flash: red-pink that fades in about half a beat.
    col += mix(VIRUS_COLOR, VIRUS_HOT, 0.4) * 0.3 * hit * hit;
    return col;
}

/* ======================================================================== */
void main()
{
    // Just the scene, in HDR. All screen-space effects happen in post.frag.
    fragColor = vec4(scene(gl_FragCoord.xy), 1.0);
}
