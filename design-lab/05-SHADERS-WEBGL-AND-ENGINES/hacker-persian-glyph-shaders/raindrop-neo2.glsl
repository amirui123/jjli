// Neo 2: clustered Matrix typing rain for Ghostty.
//
// Bigger cursor-triggered glyph clusters with randomized column timing. The
// drops do not cascade in column order; each column has its own delay, speed,
// height, and phase seeded from the cursor-change event.

// ----------------------------- CONFIG --------------------------------------
const float DURATION = 1.90;                // total fade time after a keypress
const float HOLD = 0.16;                    // stay bright briefly before fading
const float FALL_SPEED = 16.0;              // base falling speed in rows/second
const int WAKE_COLUMNS = 18;                // columns trailing behind cursor
const float LEAD_COLUMNS = 2.0;             // extra cluster columns around/ahead
const float BASE_ROWS = 17.0;               // rain height for normal typing
const float MAX_ROWS = 52.0;                // rain height cap for cursor jumps
const float TRAIL_ROWS = 13.0;              // visible rows above each bright head
const float TRAIL_DECAY = 0.21;             // larger = shorter fading tail
const float RANDOM_DELAY = 0.55;            // max per-column start delay
const float GLYPH_RATE = 8.0;               // glyph mutation rate
const float CELL_WIDTH_FROM_HEIGHT = 0.50;  // fallback for thin bar cursors
const float GREEN_ALPHA = 0.70;             // glyph opacity
const float SCREEN_DARKEN = 0.15;           // dim terminal under active rain

const vec3 GREEN_BODY = vec3(0.08, 0.82, 0.25);
const vec3 GREEN_HEAD = vec3(0.72, 1.00, 0.78);
const vec3 GREEN_GLOW = vec3(0.18, 1.00, 0.42);

// The browser preview uses a y-up framebuffer; Ghostty uses y-down.
#if defined(WEB)
const float UP = 1.0;
#else
const float UP = -1.0;
#endif
// ---------------------------------------------------------------------------

float hash11(float n) {
    return fract(sin(n) * 43758.5453123);
}

float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float strokeBox(vec2 p, vec2 center, vec2 halfSize) {
    vec2 d = abs(p - center) - halfSize;
    float outside = length(max(d, 0.0));
    float inside = min(max(d.x, d.y), 0.0);
    return 1.0 - smoothstep(0.0, 0.035, outside + inside);
}

float glyph(vec2 uv, float id) {
    uv = (uv - 0.5) / 0.84 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;

    vec2 g = floor(uv * vec2(5.0, 7.0));
    vec2 local = fract(uv * vec2(5.0, 7.0));

    float shape = 0.0;

    float spine = floor(hash11(id + 1.0) * 5.0);
    float top = floor(hash11(id + 2.0) * 3.0);
    float bottom = 4.0 + floor(hash11(id + 3.0) * 3.0);
    if (abs(g.x - spine) < 0.5 && g.y >= top && g.y <= bottom) {
        shape = max(shape, strokeBox(local, vec2(0.5), vec2(0.17, 0.42)));
    }

    float h0 = floor(hash11(id + 4.0) * 7.0);
    float h1 = floor(hash11(id + 5.0) * 7.0);
    float x0 = floor(hash11(id + 6.0) * 3.0);
    float x1 = x0 + 1.0 + floor(hash11(id + 7.0) * 3.0);
    if ((abs(g.y - h0) < 0.5 || abs(g.y - h1) < 0.5) && g.x >= x0 && g.x <= x1) {
        shape = max(shape, strokeBox(local, vec2(0.5), vec2(0.42, 0.16)));
    }

    float diagonal = abs((g.x - hash11(id + 8.0) * 2.0) - (g.y * 0.58 - 1.0));
    if (diagonal < 0.45 && hash11(id + 9.0) > 0.42) {
        shape = max(shape, strokeBox(local, vec2(0.5), vec2(0.18, 0.18)));
    }

    if (hash21(g + id * 13.7) > 0.93) {
        shape = max(shape, strokeBox(local, vec2(0.5), vec2(0.16, 0.16)));
    }

    return shape;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    fragColor = texture(iChannel0, fragCoord.xy / iResolution.xy);

    float elapsed = iTime - iTimeCursorChange;
    if (elapsed < 0.0 || elapsed > DURATION) return;

    float fade = 1.0 - smoothstep(HOLD, DURATION, elapsed);
    if (fade <= 0.0) return;

    float cellH = max(max(iCurrentCursor.w, iPreviousCursor.w), 1.0);
    float cellW = max(max(iCurrentCursor.z, iPreviousCursor.z), cellH * CELL_WIDTH_FROM_HEIGHT);

    vec2 cursorDelta = iCurrentCursor.xy - iPreviousCursor.xy;
    float movingLeft = step(cursorDelta.x, -0.35 * cellW);

    float relX = (fragCoord.x - iCurrentCursor.x) / cellW;
    float col = floor(relX);
    float signedBehind = mix(-col, col, movingLeft);
    if (signedBehind < -LEAD_COLUMNS || signedBehind > float(WAKE_COLUMNS)) return;

    float clusterColumn = signedBehind + LEAD_COLUMNS;
    float clusterWidth = float(WAKE_COLUMNS) + LEAD_COLUMNS + 1.0;
    float inX = fract(relX);

    float rowAboveCursor = UP * (fragCoord.y - iCurrentCursor.y) / cellH + 1.0;
    if (rowAboveCursor < 0.0) return;

    float row = floor(rowAboveCursor);
    vec2 cellUv = vec2(inX, fract(rowAboveCursor));

    vec2 jumpCells2D = abs(cursorDelta / vec2(cellW, cellH));
    float jumpRows = max(jumpCells2D.y, length(jumpCells2D) * 0.42);
    float rainRows = clamp(max(BASE_ROWS, jumpRows), 6.0, MAX_ROWS);

    float eventSeed = floor(iTimeCursorChange * 113.0);
    float columnSeed = clusterColumn * 23.0 + eventSeed;
    float rndDelay = hash11(columnSeed + 2.0);
    float rndSpeed = hash11(columnSeed + 3.0);
    float rndHeight = hash11(columnSeed + 5.0);
    float rndPhase = hash11(columnSeed + 8.0);

    float columnDelay = rndDelay * RANDOM_DELAY;
    float localTime = elapsed - columnDelay;
    if (localTime < 0.0) return;

    float columnSpeed = FALL_SPEED * mix(0.48, 1.75, rndSpeed);
    float columnHeight = rainRows * mix(0.72, 1.32, rndHeight);
    float stagger = rndPhase * 4.0;
    float headRow = columnHeight + stagger - localTime * columnSpeed;
    float distFromHead = row - headRow;

    if (distFromHead < -0.75 || distFromHead > TRAIL_ROWS) return;

    float head = smoothstep(1.05, 0.0, abs(distFromHead));
    float trail = exp(-max(distFromHead, 0.0) * TRAIL_DECAY);
    float centerBias = 1.0 - clamp(abs(clusterColumn - LEAD_COLUMNS) / clusterWidth, 0.0, 1.0);
    float intensity = fade * mix(0.42, 1.0, centerBias) * max(head, trail);

    float glyphPhase = floor(iTime * GLYPH_RATE + rndPhase * 5.0);
    float glyphId = eventSeed + clusterColumn * 47.0 + row * 9.0 + glyphPhase;
    float mask = glyph(cellUv, glyphId);

    vec3 rainColor = mix(GREEN_BODY, GREEN_HEAD, head);
    fragColor.rgb *= 1.0 - SCREEN_DARKEN * intensity;
    fragColor.rgb = mix(fragColor.rgb, rainColor, GREEN_ALPHA * intensity * mask);
    fragColor.rgb += GREEN_GLOW * head * intensity * mask * 0.26;
    fragColor.rgb = min(fragColor.rgb, vec3(1.15));
}
