# SonicCraft web preview

`preview.html` is a single, self-contained page that shows a rendered SonicCraft timeline and plays it. It has
inline CSS and JS, no dependencies, and makes no network requests, so it works when opened from `file://`. The engine
embeds a vendored copy of it, `crates/soniccraft-engine/assets/preview.html` (so the crate stays publishable), with
`include_str!` and writes `<stem>.preview.html` next to the rendered audio (`soniccraft render --preview`). An engine
test fails while the two files differ: after editing this page, run
`cp packages/soniccraft-web-preview/preview.html crates/soniccraft-engine/assets/preview.html`. The data contract is
[DESIGN.md §8](../../docs/DESIGN.md) (RenderReport) and §10.2 (preview payload).

## What the page shows

- **Header:** the title and key stats: duration, integrated loudness against the target, true peak against the
  ceiling, loudness range (with sample peak), format, bitrate or bit depth, sample rate and channels, file size, and
  TTS cache hits (plus which providers were called). Mastering gain, limiter reduction and iterations appear in the
  loudness tooltip. A plan report (dry run) gets a banner that says durations are estimates.
- **Transport:** play/pause, current time and duration, zoom out/in/fit. The bar stays pinned while you scroll.
- **Timeline:** a time ruler with adaptive ticks, the master waveform (canvas, DPR-aware min/max bars, played part
  in ink), and one lane per track in report order with a type badge:
  - speech cues are blocks labelled with the speaker and text. A cue moved by the overlap policy gets an arrow
    from its tentative start (`pushed_from_ms`) to where it ended up.
  - music and sfx clips are blocks with the source file name. `↻` marks looped clips and `⇥` marks open-ended ones.
  - pauses are drawn as dimension lines with their length.
  - ducked lanes have their active regions shaded, and the ducking gain envelope is drawn as a line (0 dB at the
    top, full depth at the bottom).

  Click or drag anywhere on the timeline to seek. Hovering shows the time under the pointer plus a tooltip for the
  item (and the ducking gain at that instant on ducked lanes). Ctrl/Cmd + wheel (or trackpad pinch) zooms around
  the pointer. Shift + wheel or a horizontal swipe scrolls. While playing, the view follows the playhead. Block
  labels stay readable when a block's start is scrolled out of view.
- **Live captions:** the current caption with its speaker. When `words` are present they are highlighted
  karaoke-style: spoken words in ink, the current word marked, upcoming words muted. The box is an `aria-live`
  region.
- **Items table:** id, kind, track, start, end, duration, duration source (`exact`, `cache`, `estimate`, `source`,
  `fixed`) and text or source. Playing items are highlighted (the table follows the current cue during playback).
  Clicking a row, or pressing Enter on it, seeks to the item.
- **Diagnostics:** severity icon and label, code, message, path with line and column, hint, and related ids. A
  related id that is an item becomes a button that seeks to it. Backticked text renders as code.
- **Side files** (subtitles, manifest, stems) are linked in the footer.

Light and dark themes follow `prefers-color-scheme`. All colors are CSS custom properties on `:root`. The layout
works down to 375 px wide. Timeline geometry is in seconds × pixels per second, so zooming only changes one width
and the canvases redraw just the visible window. A one-hour render with 900 cues and 180,000 waveform points stays
responsive.

### Keyboard and URL

| Key | Action |
|---|---|
| Space | play / pause (except when a button or link has focus, so it activates normally) |
| ← / → | seek −5 s / +5 s (Shift: 1 s) |
| Home / End | seek to start / end |
| + or = / − | zoom in / out |
| 0 | fit the whole timeline |
| Enter (on a table row) | seek to that item |

`preview.html#t=12.5` seeks on load (and on hash change), and `#zoom=4` zooms. Both can be combined
(`#zoom=4&t=12.5`), which is handy for links and headless screenshots.

### Accessibility

The timeline is a focusable `role="slider"` with `aria-valuenow` and `aria-valuetext`. Its visual lanes are
`aria-hidden`, because the items table carries the same information as real table markup. Captions are a polite
live region. Every control has a label, and focus is always visible. Status is never conveyed by color alone (each
state has an icon and text). Upcoming karaoke words still meet text contrast.

## Embedding contract (engine)

1. Embed the template. The engine uses its vendored copy,
   `include_str!("../assets/preview.html")` in `crates/soniccraft-engine/src/preview.rs`, kept byte-identical to
   this package's `preview.html` by a test.
2. Serialize the payload (below) to compact JSON, then make it safe inside a `<script>` element, then substitute
   it for the placeholder `__SONICCRAFT_DATA__`. The placeholder occurs **exactly once** in the template, as the
   entire content of `<script id="soniccraft-data" type="application/json">`.

The engine escapes **every** `<` as `\u003c` (DESIGN.md §10.2) and U+2028/U+2029 as `\u2028`/`\u2029`:

```rust
let json = serde_json::to_string(&payload)?;
let json = json.replace('<', "\\u003c").replace('\u{2028}', "\\u2028").replace('\u{2029}', "\\u2029");
let html = PREVIEW_TEMPLATE.replacen("__SONICCRAFT_DATA__", &json, 1);
```

That is still valid JSON, because `<` only ever occurs inside strings. Escaping only `</` (as `<\/`) leaves one
hole: a string that contains `<!--` followed later by `<script` (with no `-->` in between) puts the HTML tokenizer in
its "script data double escaped" state, where `</script>` no longer closes the element. The template defends against
this too. A hidden `<div hidden>--></script></div>` right after the data script returns the tokenizer to normal, and
the page cuts that tail off before parsing the JSON. So both escapings work, but `\u003c` removes the hazard at the
source.

`build-sample.mjs` (`embedPayload`) uses the `</` rule (plus the U+2028/U+2029 escapes), and the tests pin it down.
If you substitute in JavaScript, use split/join or a function replacer: `String#replace` with a string replacement
would interpret `$&` inside the payload.

### Payload (`soniccraft_preview: 1`)

Every field except `report` is optional, and the page degrades gracefully when one is missing or malformed. Numbers
may also arrive as numeric strings. Unknown fields are ignored.

| Field | Used for | When missing |
|---|---|---|
| `title` | heading and document title | the output file stem, else "Untitled render" |
| `audio` | `<audio src>`, a path **relative to the HTML file** | a note says there is no audio. Play runs a silent clock so captions and the playhead still work. If the file fails to load, the note names it and offers a file picker. |
| `report.output` | duration (`duration_ms`), format, `sample_rate`, `channels`, `bit_depth`, `bitrate_bps` (or `bitrate`), `bytes` | duration falls back to `report.duration_ms` (plan), then the latest item, caption, word, waveform or envelope end |
| `report.loudness` | loudness stats. `integrated_lufs: null` means silent output. | the stats are omitted |
| `report.tracks` | lane order, type badges, gain/pan/ducked-by tooltip | lanes are inferred from items, ducking and envelopes (a track with cues counts as speech) |
| `report.items` | lanes, table, and caption fallback | an empty lane and an empty table |
| `report.ducking` | shaded active regions | no shading |
| `report.synthesis` | cache stat (`cache_hits`, or `cached` for plans) | the stat is omitted |
| `report.files` | side-file links (relative to the HTML) | no links |
| `report.diagnostics` | diagnostics list | "No diagnostics" |
| `waveform` `{points_per_second, min[], max[]}` | master waveform | a flat line and a note |
| `envelopes[]` `{track_id, points_per_second, gain_db[]}` | gain line on ducked lanes | no line |
| `captions[]` (words.json shape) | live captions | each cue's text, for the cue's whole interval |
| `words[]` (words.json shape) | karaoke highlighting, linked to captions by `cue_id` (else by time) | captions without highlighting |

Paths are only turned into links or media sources if they are relative (percent-encoded per segment) or use
`http(s):`, `file:` or `blob:`. Payload text reaches the DOM only through `textContent` and attributes.

## Opening the template directly

If the placeholder is still in place, the page shows a drop zone with file pickers. Drop or choose any of these;
nothing leaves the browser:

- a `.preview.json` payload, a `.manifest.json` render report, or `soniccraft plan --json` output;
- optionally the `.words.json` captions file, which adds karaoke highlighting to a manifest;
- the rendered audio (played through an object URL).

Files can be dropped onto a rendered preview too, for example to supply audio that has moved.

## Development

Node 20 or later is enough, with no `npm install`. ffmpeg is only needed to synthesize the sample audio.

```sh
node make-sample.mjs     # regenerate sample.preview.json and sample.mp3 (deterministic model of the README timeline)
node build-sample.mjs    # sample.html = preview.html + sample.preview.json, embedded exactly like the engine does
open "sample.html#t=6.2"
node --test test.mjs     # template contract, inline-script syntax, data functions, embedding, fixture
node --test browser-test.mjs   # opt-in, Node 22+: the real page in headless Chrome (skips without a browser)
```

`browser-test.mjs` drives Chrome through the DevTools protocol with Node's built-in WebSocket. It covers playback,
click and keyboard seeking, zoom (buttons, ctrl+wheel, keys), karaoke captions, row highlighting, table and chip
seeking, tooltips, 390/375 px layouts, dark mode, loader mode through real file inputs, and degraded or hostile
payloads, and it asserts there is no console output. Set `CHROME_PATH` to choose the browser.

`sample.preview.json` is the README timeline (4 tracks, 18.75 s): `cue_03` pushed from 4.56 s to 10.13 s,
sidechain ducking regions and a 50 points/s gain envelope measured from the synthesized voices, captions segmented
per §6, word timings, and three realistic diagnostics. `sample.mp3` matches it: tone-burst "speech" per word, a
ducked pad bed and a whoosh. The waveform in the JSON is computed from that same signal, so playback and the
visuals line up. Both generated files are git-ignored.

Headless check:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --window-size=1440,900 --screenshot=shot.png --enable-logging=stderr --v=0 "file://$PWD/sample.html#t=6.2"
```

(Headless Chrome on macOS will not make a window narrower than about 500 px. Check phone widths with DevTools
device emulation instead.)

### Rules for editing `preview.html`

- Keep it one file: no external URLs, fonts, images or imports. The tests enforce this.
- Copy every change to the engine's vendored copy:
  `cp packages/soniccraft-web-preview/preview.html crates/soniccraft-engine/assets/preview.html` (an engine test
  fails until they match).
- The placeholder must occur exactly once. Inside the inline script, build it by concatenation, as `TOKEN` does.
- Never write `</script`, `<!--` or `<script` inside the inline script, not even in comments. The HTML parser
  would end or escape the element. The tests extract the script the way the parser does and check it with
  `node --check`.
- Payload values go through `textContent` or attributes only. The tests allow exactly one `innerHTML` (constant
  icons).
- Budget: at most 60 KiB, enforced by the tests.
- `window.SonicCraftPreview` exposes the pure data functions (`normalize`, `classify`, `waveBars`, …). The tests
  load them in Node, where the page skips all DOM work.

Supported browsers are current evergreen ones: Chrome/Edge 111+, Firefox 113+, Safari 16.2+ (the page uses
`color-mix()` and `overflow: clip`).
