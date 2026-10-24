<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/wordmark-dark.png">
    <img src="assets/brand/wordmark-light.png" alt="SonicCraft" width="420">
  </picture>
</p>

# SonicCraft

**A declarative, deterministic audio engine for AI agents.** Describe a production as a YAML (or JSON)
timeline: who says what, in which order, over which music, at what loudness. SonicCraft compiles it into
TTS speech, music beds and sound effects, mixed with sidechain ducking, mastered to an EBU R128 loudness
target, plus WebVTT/SRT subtitles that match the audio it actually rendered. It ships as a CLI, an MCP
server and an Agent Skill.

[![CI](https://github.com/user-github-me/soniccraft/actions/workflows/ci.yml/badge.svg)](https://github.com/user-github-me/soniccraft/actions/workflows/ci.yml)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](#license)
[![crates.io](https://img.shields.io/crates/v/soniccraft.svg)](https://crates.io/crates/soniccraft)
[![SonicCraft MCP on mcprush](https://mcprush.com/badge/soniccraft-mcp/score.svg)](https://mcprush.com/to/soniccraft-mcp?ref=badge)

**[Website](https://user-github-me.github.io/soniccraft/)** · [Quickstart](#quickstart) ·
[Use it from an AI agent](#use-it-from-an-ai-agent) · [MCP server](#mcp-server) · [Agent Skill](#agent-skill)

## Use it from an AI agent

Give an agent (Claude Code, Codex, Cursor, Gemini CLI, ...) the link to this repository and ask for audio, for
example *"Use https://github.com/user-github-me/soniccraft to make a 30-second voiceover with background music
for my product video."* Everything it needs is below and in [AGENTS.md](AGENTS.md).

1. **Install the CLI** (prebuilt and checksum-verified, no Rust needed). Homebrew, Scoop, Docker and Cargo work
   too: see [Quickstart](#quickstart).

   ```bash
   curl -fsSL https://raw.githubusercontent.com/user-github-me/soniccraft/main/install.sh | sh   # macOS, Linux
   ```

   ```powershell
   irm https://raw.githubusercontent.com/user-github-me/soniccraft/main/install.ps1 | iex        # Windows
   ```

2. **Write a timeline.** `soniccraft init my-audio` starts one that renders offline: macOS voices on a Mac,
   elsewhere a mock test voice (not real speech). Real voices anywhere: Kokoro or Piper (free, local) or an
   ElevenLabs, OpenAI or Cartesia key, see [Providers](#providers). `soniccraft init --list` shows the
   templates, `soniccraft providers` the voices usable here, and `soniccraft schema` the JSON Schema; the
   [Agent Skill](skills/soniccraft/SKILL.md) explains the format.
3. **Check it, see the cost, render it:**

   ```bash
   soniccraft validate my-audio/timeline.yaml           # errors with a code, line, column and fix hint
   soniccraft plan my-audio/timeline.yaml               # free dry run: timing, ducking, characters to synthesize
   soniccraft render my-audio/timeline.yaml --preview   # mastered audio, subtitles, manifest, preview page
   ```

To keep SonicCraft in an agent for good, add the skill and the MCP server. Both use the CLI from step 1; with
Node.js 20 or newer the MCP server also runs with nothing installed: use `npx -y soniccraft-mcp` in place of
`soniccraft mcp` below.

| Agent | Skill | MCP server |
|---|---|---|
| Claude Code | `claude plugin marketplace add user-github-me/soniccraft`, then `claude plugin install soniccraft@soniccraft` | included in the plugin, or `claude mcp add soniccraft -- soniccraft mcp` |
| Codex | `npx skills add user-github-me/soniccraft -g -a codex` | `codex mcp add soniccraft -- soniccraft mcp` |
| Cursor | `npx skills add user-github-me/soniccraft -g -a cursor` | `{"mcpServers": {"soniccraft": {"command": "soniccraft", "args": ["mcp"]}}}` in `.cursor/mcp.json` |
| Gemini CLI and others | `npx skills add user-github-me/soniccraft -g` (choose the agent) | the same `mcpServers` entry (Gemini CLI: `~/.gemini/settings.json`) |

The server is also in the [official MCP Registry](https://registry.modelcontextprotocol.io) as
`io.github.user-github-me/soniccraft` (container image). Details: [MCP server](#mcp-server) and
[Agent Skill](#agent-skill).

## Why

Ask an agent for a two-voice explainer with background music and it will usually hand-write an ffmpeg
filter graph: `adelay` offsets computed from guessed speech lengths, an `amix`, perhaps a half-remembered
`sidechaincompress`. That fails in predictable ways:

- **Timing drift and overlaps.** Synthesized speech is never exactly as long as the agent guessed, so lines
  collide or leave dead air, and every script edit shifts every later offset.
- **No ducking.** Sidechain compression is fiddly to get right in a filter graph, so the music either
  drowns the voice or sits uniformly too low.
- **Loudness disparity.** Different providers and voices come out at different levels. Nothing measures
  integrated loudness or true peak, so the result is uneven and can clip.
- **Drifting subtitles.** Captions are written from estimated times instead of from the audio that was
  rendered.
- **Opaque, expensive iteration.** A broken graph is a cryptic ffmpeg error, and every retry re-bills every
  TTS call.

## How SonicCraft works

[HyperFrames](https://github.com/heygen-com/hyperframes) showed that agents make better video when they
write declarative HTML and a deterministic renderer does the frame-accurate work. SonicCraft applies the
same idea to audio. The agent writes **intent as data**; a **compiler** validates it, measures the real
durations, resolves all timing in integer sample frames, and renders natively in Rust. The same timeline,
TTS cache and binary always produce byte-identical audio, subtitles and manifests.

```yaml
version: "1.0"
output:
  format: "mp3"
  sample_rate: 48000
  bitrate: "320k"
  target_lufs: -16.0 # integrated loudness target, measured per EBU R128 / ITU-R BS.1770
  export_subtitles: true # Emits matching .vtt and .srt

tracks:
  - id: ambient_bed
    type: "music"
    source: "assets/audio/synthwave_loop.wav"
    loop: true
    volume: 0.65
    fade_in_ms: 1200
    fade_out_ms: 2500
    ducking:
      trigger_tracks: ["voice_primary", "voice_secondary"]
      reduction_db: -18.0
      attack_ms: 80
      release_ms: 350

  - id: voice_primary
    type: "speech"
    pan: -0.15 # Subtle left stereo placement
    sequence:
      - id: cue_01
        speaker: "narrator"
        provider: "elevenlabs"
        voice_id: "21m00Tcm4TlvDq8ikWAM"
        text: "Autonomous software development requires deterministic compilation targets."
      - pause_duration: 350ms
      - id: cue_03
        speaker: "narrator"
        provider: "elevenlabs"
        voice_id: "21m00Tcm4TlvDq8ikWAM"
        text: "By separating high-level planning from digital signal processing, systems eliminate runtime hallucinations."

  - id: voice_secondary
    type: "speech"
    pan: 0.15 # Subtle right stereo placement
    sequence:
      - id: cue_02
        start_relative:
          after_cue: "cue_01"
          offset_ms: 150
        speaker: "guest"
        provider: "local_kokoro"
        voice_id: "am_adam"
        text: "Exactly. SonicCraft treats audio composition the same way Hyperframes treated web-based video."

  - id: sfx_impact
    type: "sfx"
    source: "assets/sfx/whoosh.wav"
    volume: 0.8
    start_at_ms: 0
```

This is [`examples/tech-briefing/timeline.yaml`](examples/tech-briefing/timeline.yaml). Here is what
`soniccraft render` does with it:

1. **Validates everything at once.** Unknown keys, misspelled enum values, dangling anchors, missing
   voices, missing files and missing API keys are all reported together, each with a stable code, a path,
   a line and column, and a fix hint.
2. **Synthesizes and caches.** `cue_01` and `cue_03` go to ElevenLabs (with word timestamps); `cue_02` goes
   to a local Kokoro-FastAPI server (`local_kokoro` is an alias of the built-in `kokoro` provider). Each
   result is cached by a content hash, so later renders only pay for lines that changed.
3. **Levels the voices.** Each cue is trimmed of leading and trailing silence and normalized to -20 LUFS,
   so the cloud voice and the local voice sit at the same level.
4. **Lays out the timeline in sample frames.** `cue_01` starts at 0. `cue_02` starts 150 ms after `cue_01`
   ends. `cue_03` is sequential, 350 ms after `cue_01`, but that slot collides with `cue_02`, so the default
   overlap policy (`push`) **automatically moves `cue_03` to 350 ms after `cue_02` ends**, keeping its pause
   as the gap, and reports an info `cue_pushed`. The result is a natural three-turn exchange with no timing
   arithmetic by the agent.
5. **Places the music.** The bed is a looping clip without a length, so it runs to the end of the timeline
   with a 1.2 s fade-in; the timeline ends 2.5 s after the last word (the bed's `fade_out_ms`) and the bed
   fades out over exactly that tail. The whoosh fires at 0.
6. **Ducks the bed** by 18 dB whenever either voice speaks. Detection runs on the voices' own signal with
   an 80 ms lookahead (it defaults to the attack time), so the bed is already down when the first syllable
   lands; it recovers over 350 ms, and the default 250 ms hold bridges the 150 ms turn gap.
7. **Pans** the two voices to -0.15 and +0.15 (constant power).
8. **Masters** the mix to -16 LUFS integrated with a -1.0 dBTP true-peak ceiling (from the default
   `podcast` preset), iterating loudness gain and a 4× oversampled true-peak limiter until within 0.2 LU
   (the closest pass is kept and `loudness_target_missed` says by how much when no pass gets there; an
   unreachable target gives the loudest master within 6 dB of average limiting, whatever the target).
9. **Encodes** a 48 kHz, 320 kbps MP3 natively, decodes and measures the delivered file (re-limiting if the
   codec pushed a peak over the ceiling), and writes `timeline.vtt` and `timeline.srt` from the placed word
   timings, labelled `narrator` and `guest`.

Before spending anything, `soniccraft plan` (alias `dry-run`) shows the same layout from estimated
durations without calling a TTS API (abridged JSON, estimated numbers):

```json
{ "valid": true, "duration_ms": 20616.9, "estimated": true,
  "items": [
    { "id": "cue_01", "kind": "cue", "start_ms": 0.0,     "end_ms": 4838.7,  "duration_source": "estimate" },
    { "id": "cue_02", "kind": "cue", "start_ms": 4988.7,  "end_ms": 10863.7, "duration_source": "estimate" },
    { "id": "cue_03", "kind": "cue", "start_ms": 11213.7, "end_ms": 18116.9, "duration_source": "estimate",
      "pushed_from_ms": 5188.7 } ],
  "synthesis": { "cues": 3, "cached": 0, "characters_to_synthesize": 276 } }
```

## Features

- **Timeline DSL v1.0** in YAML or JSON with a published JSON Schema. Strict validation: unknown keys are
  errors with did-you-mean hints; every problem is reported at once with a stable code, path, line/column
  and a mechanical fix.
- **Timing without arithmetic:** sequential cues and pauses, absolute starts, and relative anchors
  (`after_cue`, `with_cue`, `before_cue`, with signed offsets) on cues, clips or whole tracks. Speech
  overlaps are pushed apart automatically (or warned about, rejected, or allowed per cue for crosstalk).
- **Eight TTS providers:** ElevenLabs, any OpenAI-compatible `/audio/speech` server, Cartesia, Kokoro
  (Kokoro-FastAPI), Piper, macOS `say`, any local command, and a deterministic mock voice. Mix them freely
  in one timeline. Speakers registry with layered voice settings.
- **Cheap iteration:** a content-addressed TTS cache, dry runs that never call paid APIs (with estimated
  durations and per-provider character counts), bounded concurrency and retries with backoff.
- **Music and sound effects:** loops (seamless, or with loop crossfades), trims, fades with three curves,
  crossfades between clips, open-ended beds that end with an automatic fade-out tail.
- **Sidechain ducking** driven by the actual speech signal (or by the timeline), with attack, release,
  hold and lookahead.
- **Loudness done properly:** per-source BS.1770 normalization, then master normalization to a preset
  (podcast -16, streaming -14, EBU R128 broadcast -23, ATSC A/85 -24 LUFS) and an oversampled true-peak
  limiter. Lossy outputs are decoded and measured as delivered, with codec true-peak and loudness-drift
  compensation.
- **Native DSP and encoders:** wav, mp3 and flac with no ffmpeg; ogg, opus and m4a through ffmpeg when it is
  installed. 16/24-bit integer or 32-bit float, fixed-seed TPDF dither.
- **Subtitles from the rendered audio:** WebVTT, SRT, JSON with per-word timestamps, and a
  HyperFrames-compatible transcript; speaker labels; per-cue caption overrides.
- **Side files:** per-track stems, a deterministic manifest, and a self-contained HTML preview with the
  waveform, ducking envelopes and captions.
- **Agent surfaces:** machine-readable `--json` reports from `validate`, `plan`, `render`, `providers` and
  `voices`, an MCP server that speaks both protocol eras, an Agent Skill, and a Claude Code plugin.

## Quickstart

Install a prebuilt binary (checksum-verified; no Rust or C toolchain needed):

```bash
curl -fsSL https://raw.githubusercontent.com/user-github-me/soniccraft/main/install.sh | sh   # macOS, Linux: ~/.local/bin
brew install user-github-me/soniccraft/soniccraft                                            # Homebrew (macOS, Linux)
```

```powershell
irm https://raw.githubusercontent.com/user-github-me/soniccraft/main/install.ps1 | iex        # Windows
scoop bucket add soniccraft https://github.com/user-github-me/scoop-soniccraft; scoop install soniccraft
```

With Rust: `cargo binstall soniccraft` downloads the same release binary, and `cargo install --locked soniccraft`
builds it from [crates.io](https://crates.io/crates/soniccraft) (requirements below).

**From source.** Requirements: Rust 1.89 or newer ([rustup](https://rustup.rs)) and a C toolchain for the bundled LAME MP3
encoder (`cc` and `make`: Xcode Command Line Tools on macOS, `build-essential` on Linux; on Windows, the
Visual Studio Build Tools, plus `AWS_LC_SYS_PREBUILT_NASM=1` in the environment unless NASM is installed).
ffmpeg is optional (ogg/opus/m4a output, extra input formats). Prebuilt binaries need none of this: see
below.

```bash
git clone https://github.com/user-github-me/soniccraft
cd soniccraft
cargo install --locked --path crates/soniccraft-cli    # installs `soniccraft` and `soniccraft-mcp` into ~/.cargo/bin
soniccraft --version
```

`--locked` builds with the dependency versions in `Cargo.lock`, the ones CI tests.

**Prebuilt binaries.** Each [GitHub release](https://github.com/user-github-me/soniccraft/releases) has archives for
Linux (`x86_64-unknown-linux-gnu`, `aarch64-unknown-linux-gnu`; glibc 2.35 or newer), macOS
(`aarch64-apple-darwin`, `x86_64-apple-darwin`; macOS 11 or newer) and Windows (`x86_64-pc-windows-msvc`).
`soniccraft-v<version>-<target>.tar.gz` (`.zip` for Windows) holds `soniccraft`, `soniccraft-mcp`, the
license texts and `THIRD-PARTY-LICENSES.txt`. The `-no-mp3` archives leave out the LGPL MP3 encoder; mp3
output then needs ffmpeg. Check a download with `sha256sum --check --ignore-missing SHA256SUMS` (on macOS:
`shasum -a 256 --check --ignore-missing SHA256SUMS`). The binaries are not notarized: on macOS a browser
download is quarantined; clear it with `xattr -d com.apple.quarantine soniccraft soniccraft-mcp` (curl and the
npm launcher do not set the attribute).

**Container image.** Each release is also published as
[`ghcr.io/user-github-me/soniccraft`](https://github.com/user-github-me/soniccraft/pkgs/container/soniccraft)
(linux/amd64 and linux/arm64, with ffmpeg for ogg, opus and m4a output):

```bash
docker run --rm -v "$PWD":/work ghcr.io/user-github-me/soniccraft render timeline.yaml
docker run -i --rm -v "$PWD":/work ghcr.io/user-github-me/soniccraft mcp --base-dir /work   # MCP on stdio
```

Files written to the mounted directory belong to uid 1000; add `--user "$(id -u):$(id -g)"` to write them as
yourself. Pass API keys with `-e ELEVENLABS_API_KEY` (never in the timeline). macOS `say` is not available in
the container: use the mock voice, a cloud provider or a local server. `docker build -t soniccraft .` builds the
same image from source.

Render the demo with **zero API keys**:

```bash
# macOS: Samantha and Daniel from macOS `say`, plus the built-in mock voice
soniccraft render examples/offline-demo/timeline.yaml --preview

# any OS: the same timeline with mock voices only
soniccraft render examples/offline-demo/timeline.mock.yaml
```

The macOS run writes `examples/offline-demo/offline-demo.wav` with `.vtt`, `.srt`, `.words.json` and
`.transcript.json` subtitles, a `.manifest.json`, and `offline-demo.preview.html` (open it in a browser to
see the waveform, the ducking envelope and the captions). The full loop an agent follows:

```bash
soniccraft validate examples/offline-demo/timeline.mock.yaml          # errors, warnings, fix hints
soniccraft plan     examples/offline-demo/timeline.mock.yaml          # dry run: layout, ducking, cost
soniccraft render   examples/offline-demo/timeline.mock.yaml --json   # one JSON report on stdout
```

With API keys and a local Kokoro server, render the README timeline:

```bash
export ELEVENLABS_API_KEY=...                                          # never put keys in timelines
docker run -d -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest
soniccraft render examples/tech-briefing/timeline.yaml
```

Start your own project from a template (writes the timeline and generated stand-ins for its audio assets):

```bash
soniccraft init my-episode --template two-person-podcast
```

## CLI

```
soniccraft validate <TIMELINE> [--json] [--check-credentials]
soniccraft plan <TIMELINE> [--json]                      (alias: dry-run)
soniccraft render <TIMELINE> [-o PATH] [--format F] [--subtitles] [--stems] [--manifest] [--preview]
                  [--no-cache] [--cache-dir DIR] [--jobs N] [--json]
soniccraft schema [-o FILE]
soniccraft init [DIR] [--template NAME] [--list] [--no-assets] [--force]
soniccraft providers [--json]
soniccraft voices <PROVIDER> [--json]
soniccraft cache <info|clear> [--cache-dir DIR] [TIMELINE]
soniccraft mcp [--base-dir DIR] [--allow-command]
```

| Command | What it does |
|---|---|
| `validate` | Parses and checks the timeline and its environment (assets exist and decode, credentials present and allowed to go to their host, local TTS servers answer, macOS voices and piper models installed, ffmpeg when needed, the render fits the memory budget, cache status). `--check-credentials` also verifies API keys with a cheap authenticated request. |
| `plan` / `dry-run` | Validates, then lays out the timeline with cached or estimated durations (mock voices exactly): item times, overlap moves, ducking regions, characters to synthesize per provider, and an ASCII diagram. Never calls a paid API. |
| `render` | The full pipeline. `-o` sets the output path (its extension picks the format only when `output.format` is not set: for a `format: wav` timeline write `-o out.mp3 --format mp3`); `--format` is one of wav, mp3, flac, ogg, opus, m4a and overrides both. `--subtitles`, `--stems` and `--manifest` switch on those exports (like the `output.export_*` fields); `--preview` writes `<stem>.preview.html`. `--no-cache` ignores cached TTS audio (fresh results are still cached); `--cache-dir` picks the cache; `--jobs N` limits concurrent synthesis requests (default 4). Outputs are put in place only when the render succeeds, and existing files that are not SonicCraft outputs are never overwritten. |
| `schema` | Prints the timeline JSON Schema, or writes it with `-o`. |
| `init` | Writes `DIR/timeline.yaml` (default `DIR`: the current directory) from a template, plus the audio assets it references, generated procedurally (a seamless synth loop and three SFX, deterministic and royalty-free). Templates (`--list`): `offline-demo` (default on macOS: system voices + mock), `offline-demo-mock` (default elsewhere: renders anywhere), `tech-briefing`, `two-person-podcast`, `voiceover-with-music`, `dialogue-crosstalk`. `--no-assets` writes only the timeline; existing files are never overwritten without `--force`. |
| `providers` | Lists built-in providers with availability, credential status and default voices. |
| `voices` | Lists the voices of one provider (may call its API); the provider name ignores case and `-`/`_`. |
| `cache` | `info` shows the TTS cache location, entry count and size; `clear` empties it. |
| `mcp` | Runs the MCP server on stdio. `--allow-command` (or `SONICCRAFT_ALLOW_COMMAND=1`) lets timelines run `command` providers, which are refused by default. |

Exit codes: `0` success, `1` timeline invalid (error diagnostics), `2` usage error, `3` runtime or render
failure, `130` interrupted. With `--json`, stdout contains exactly one JSON document (the report, or
`{"message", "diagnostics", "hint"}` when the command fails, usage errors included); progress and logs go to
stderr. A render stopped by its environment or options (a missing key, a provider that cannot run, a voice
that is not installed, the memory budget) also exits 1 and ends with `error: render stopped: N errors`.
Timelines (files, FIFOs, `-` for stdin) are read up to the 5 MB document limit and no further. Run
`soniccraft <command> --help` for every option.

## MCP server

`soniccraft mcp` serves the engine over stdio (newline-delimited JSON-RPC 2.0); `soniccraft-mcp` is the
same server as a zero-argument binary. It supports both MCP protocol eras: the `initialize` handshake
(2024-11-05 through 2025-11-25, used by Codex and Cursor) and the stateless 2026-07-28 revision with
`server/discover` (which Claude Code probes first).

| Tool | Input | Result |
|---|---|---|
| `soniccraft_validate_timeline` | `{yaml_content?, yaml_path?, base_dir?, check_credentials?, detail?}` (one of content/path; `path` is an alias of `yaml_path`) | ValidationReport |
| `soniccraft_dry_run` | `{yaml_content?, yaml_path?, base_dir?, detail?}` | PlanReport (+ diagram as text) |
| `soniccraft_render` | `{yaml_content?, yaml_path?, output_path?, format?, base_dir?, export_subtitles?, no_cache?, detail?}` | RenderReport |
| `soniccraft_get_schema` | `{detail?}` | DSL quick reference (+ the JSON Schema with `detail: "full"`) |
| `soniccraft_list_providers` | `{}` | Providers, availability (local servers probed), credential status, default voices |
| `soniccraft_list_voices` | `{provider}` | Voices (may call the provider API) |

Reports are returned as `structuredContent` (mirrored as JSON text, plus a short summary). Long timelines
get a compact report by default (`detail: "auto"`) so the result stays readable in an agent's context; pass
`detail: "full"` for every item. Renders add `resource_link` blocks with `file://` URIs for the audio and side
files (sessions on protocol revisions before 2025-06-18 get the files as text instead); audio is never inlined
as base64. `format` overrides the timeline's `output.format` (pass it with an `output_path` whose extension
names another format). For mp3/ogg/opus/m4a, the report's loudness describes the delivered file
(`loudness.pre_encode` has the master's). An invalid timeline is a successful validate/dry-run call
(`valid: false`); a failed render or a bad argument returns `isError: true` with what to fix, so the agent
can repair and retry. Relative paths resolve against `base_dir`, else `soniccraft mcp --base-dir`, else
`CLAUDE_PROJECT_DIR`, else the server's working directory. Long renders report `notifications/progress` and
honour cancellation; at most two run at once (`SONICCRAFT_MCP_MAX_RENDERS`). Each render may use up to
`SONICCRAFT_MAX_RENDER_GB` of memory (default 8 GB), so the server's peak can reach their product (16 GB by
default); lower either on small machines. Timelines run `command` providers only when the server is started
with `soniccraft mcp --allow-command` (see [Security](#security)). Tool arguments and report shapes:
[skills/soniccraft/reference/mcp-tools.md](skills/soniccraft/reference/mcp-tools.md).

**Claude Code**

```bash
claude mcp add soniccraft -- soniccraft mcp                    # local scope (default): this project, private to you
claude mcp add --scope user soniccraft -- soniccraft mcp       # all your projects
claude mcp add --scope project soniccraft -- soniccraft mcp    # writes .mcp.json to commit with the project
claude mcp add soniccraft -- soniccraft mcp --allow-command    # only if your timelines use `command` providers (they run local programs)
```

Or in a project's `.mcp.json` (`timeout` is the per-call limit in milliseconds). A stdio server inherits the
environment Claude Code runs in, so exported API keys reach it without an `env` block:

```json
{
  "mcpServers": {
    "soniccraft": {
      "type": "stdio",
      "command": "soniccraft",
      "args": ["mcp"],
      "timeout": 900000
    }
  }
}
```

Do not add `"env": {"ELEVENLABS_API_KEY": "${ELEVENLABS_API_KEY}"}`: when the variable is unset, the client
passes the literal text `${ELEVENLABS_API_KEY}`. SonicCraft treats such a placeholder as a missing key and
says so (`missing_credentials`); if you need an `env` entry, write `"${ELEVENLABS_API_KEY:-}"`.

**Without installing Rust**, through npm (Node.js 20 or newer): the [`soniccraft-mcp`](packages/soniccraft-mcp)
package uses `soniccraft` from `PATH` when there is one; otherwise it downloads the prebuilt release for your
platform on first use and verifies it against SHA-256 checksums pinned in the package. Each version on npm is
the release's `soniccraft-mcp-X.Y.Z.tgz` asset, published from GitHub Actions with
[provenance](https://docs.npmjs.com/generating-provenance-statements).

```bash
claude mcp add soniccraft -- npx -y soniccraft-mcp
```

```json
{ "mcpServers": { "soniccraft": { "command": "npx", "args": ["-y", "soniccraft-mcp"] } } }
```

Arguments after the package name go to `soniccraft mcp` (for example `--base-dir`);
[packages/soniccraft-mcp/README.md](packages/soniccraft-mcp/README.md) covers platforms, environment
variables, proxies and offline installs. The same `npx` form works in the Cursor and Codex configurations
below (command `npx`, args `["-y", "soniccraft-mcp"]`).

**Cursor**: `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "soniccraft": {
      "type": "stdio",
      "command": "soniccraft",
      "args": ["mcp"],
      "env": { "ELEVENLABS_API_KEY": "${env:ELEVENLABS_API_KEY}" }
    }
  }
}
```

In a project-level file you can add `"CLAUDE_PROJECT_DIR": "${workspaceFolder}"` to `env` so relative paths
in tool calls resolve against the workspace. If a key variable is unset and the client passes the
placeholder text through, SonicCraft reports the key as missing instead of sending the placeholder.

**Codex**

```bash
codex mcp add soniccraft -- soniccraft mcp
```

Then raise the tool timeout in `~/.codex/config.toml` (Codex defaults to 60 s; renders can take longer),
forward the API keys you use, and decide how the render tool is approved:

```toml
[mcp_servers.soniccraft]
command = "soniccraft"
args = ["mcp"]
env_vars = ["ELEVENLABS_API_KEY", "OPENAI_API_KEY", "CARTESIA_API_KEY"]
startup_timeout_sec = 20
tool_timeout_sec = 900
default_tools_approval_mode = "approve"   # needed for non-interactive `codex exec`, see below
```

`soniccraft_render` writes files, so Codex asks before running it. Interactive sessions prompt for approval;
non-interactive `codex exec` (approval policy `never`) fails the call with "MCP tool call requires approval"
unless the server entry approves it: `default_tools_approval_mode = "approve"` for every SonicCraft tool, or
only the render tool with

```toml
[mcp_servers.soniccraft.tools.soniccraft_render]
approval_mode = "approve"
```

For a single run: `codex exec -c 'mcp_servers.soniccraft.default_tools_approval_mode="approve"' ...`.

## Agent Skill

[`skills/soniccraft/`](skills/soniccraft/SKILL.md) is an [Agent Skills](https://agentskills.io) package:
`SKILL.md` (workflow, DSL essentials, duration heuristics, mixing practice, a diagnostics fix table) plus
on-demand references (full DSL reference, providers, mixing guide, every diagnostic code, MCP tools) and
five templates. It is written around the CLI, so it works in any agent, and mentions the MCP tools as an
alternative.

```bash
npx skills add user-github-me/soniccraft                                              # pick agents interactively
npx skills add user-github-me/soniccraft --skill soniccraft -a claude-code -a codex -a cursor -y   # project scope
npx skills add user-github-me/soniccraft --skill soniccraft -g -a claude-code -y                   # global
```

Or copy the directory by hand: `cp -R skills/soniccraft ~/.claude/skills/` (Claude Code, user),
`.claude/skills/soniccraft` (Claude Code, project), `~/.agents/skills/soniccraft` or
`.agents/skills/soniccraft` (Codex, Cursor and other agents that read `.agents/skills`).

**Claude Code plugin** (the skill plus the MCP server in one step; needs `soniccraft` on PATH):

```bash
claude plugin marketplace add user-github-me/soniccraft
claude plugin install soniccraft@soniccraft
```

If the plugin's MCP server shows as failed, the `soniccraft` binary is usually not on PATH: install it (see
[Quickstart](#quickstart)) and restart Claude Code. The skill's Setup section tells agents the same.

For Codex, `skills/soniccraft/agents/openai.yaml` declares the MCP dependency, launched as `soniccraft-mcp`.

## Providers

| Provider | `provider:` | Credentials / setup | Default voice | Word timings |
|---|---|---|---|---|
| ElevenLabs | `elevenlabs` | `ELEVENLABS_API_KEY` | none (`voice_id` required) | yes |
| OpenAI-compatible | `openai` | `OPENAI_API_KEY`; `base_url` for other servers | `alloy` | estimated |
| Cartesia | `cartesia` | `CARTESIA_API_KEY` | none (`voice_id` required) | yes |
| Kokoro (Kokoro-FastAPI) | `kokoro` | local server: `KOKORO_BASE_URL` (default `http://localhost:8880`), optional `KOKORO_API_KEY` | `af_heart` | yes |
| Piper | `piper` | `pip install piper-tts`; voice models (`voices_dir`, `PIPER_VOICES_DIR`, or next to the timeline) | none (`voice_id` required) | estimated |
| macOS speech | `macos_say` | macOS | `Samantha` | estimated |
| Custom command | `command` | your argv template | none (`voice_id` required) | estimated |
| Mock | `mock` | nothing (deterministic synthetic voice) | `mock` | exact |

- ElevenLabs audio is requested as raw `pcm_24000` by default (falls back to it if a configured format is
  not available on your plan); `eleven_v4` accepts only `stability` and `similarity_boost`.
- `openai` is a generic OpenAI-compatible `/audio/speech` client. OpenAI's own TTS models retire on
  2027-01-06; point `base_url` at Kokoro-FastAPI, Speaches, LocalAI or another compatible server.
- Cartesia uses API version `2026-08-14` and defaults to `sonic-3.6`.
- Kokoro: `docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest`; word timestamps come from its
  captioned-speech endpoint. `soniccraft providers` and `validate` probe local servers (Kokoro-FastAPI,
  OpenAI-compatible servers on this machine or a private network) with a 300 ms TCP connect; one that does
  not answer is not available (`no Kokoro-FastAPI server answered at http://localhost:8880`) and validate
  reports `provider_unavailable`.
- Piper is maintained as OHF-Voice/piper1-gpl: `pip install piper-tts`, then download a voice into the
  project: `python3 -m piper.download_voices en_US-lessac-medium --data-dir voices` and set
  `voices_dir: voices` on the provider (or download it next to the timeline). `voice_id: en_US-lessac-medium`
  is looked up in `voices_dir`, `$PIPER_VOICES_DIR`, the timeline directory and
  `~/.local/share/piper/voices`, in that order; `soniccraft voices piper` lists what it finds, or the
  searched directories and the download command, and validate reports a missing model as `unknown_voice`.
- macOS `say` silently falls back to the default voice for unknown names, so SonicCraft checks voice names
  against `say -v '?'` first (`unknown_voice` in validate, with the closest installed names).
- API keys are sent only to the provider's own API host, to servers on this machine (only the provider's own
  key variable, such as `OPENAI_API_KEY`), or to hosts listed in `SONICCRAFT_ALLOWED_HOSTS`; a key that would go
  anywhere else is refused before any request (`provider_unavailable`). See [Security](#security).

Setup, models, voices, settings and limits per provider:
[skills/soniccraft/reference/providers.md](skills/soniccraft/reference/providers.md).

| Environment variable | Purpose |
|---|---|
| `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `CARTESIA_API_KEY` | Provider API keys (rename per instance with `api_key_env`). |
| `KOKORO_BASE_URL`, `KOKORO_API_KEY` | Kokoro-FastAPI location and optional key. |
| `PIPER_VOICES_DIR` | Directory searched for `<voice_id>.onnx` (after the provider's `voices_dir`). |
| `SONICCRAFT_ALLOWED_HOSTS` | More hosts that may receive API keys (comma-separated, `*.example.com` patterns), besides each provider's own API host and servers on this machine (which get only the provider's own key variable). |
| `SONICCRAFT_CACHE_DIR` | TTS cache location (overridden by `--cache-dir`). |
| `SONICCRAFT_MAX_RENDER_GB` | Memory budget of one render in GB (default 8); a timeline that needs more fails with `timeline_too_long` before any TTS request. |
| `CLAUDE_PROJECT_DIR` | MCP server: base directory for relative paths when a call has no `base_dir`. |
| `SONICCRAFT_ALLOW_COMMAND` | MCP server: `1` lets timelines run local programs (`command` providers, a piper `command`); off by default, like `soniccraft mcp --allow-command`. |
| `SONICCRAFT_MCP_MAX_RENDERS` | MCP server: renders that run at once (default 2); later ones wait. |

## Subtitles and HyperFrames

`output.export_subtitles` takes `true` (= vtt + srt) or a list of `vtt`, `srt`, `json` and `transcript`.
`json` (`<stem>.words.json`) holds the captions and every word's timing; `transcript`
(`<stem>.transcript.json`) is a word array in seconds in the shape HyperFrames' `transcribe` command
consumes. To caption a [HyperFrames](https://github.com/heygen-com/hyperframes) video with a SonicCraft
voiceover:

```bash
soniccraft render voiceover.yaml            # with output.export_subtitles: [vtt, transcript]
npx hyperframes transcribe voiceover.transcript.json --dir my-video
```

and play the mastered audio in the composition from the start, e.g.
`<audio id="voiceover" src="assets/voiceover.wav" data-start="0" data-duration="21.04"></audio>`.

## Determinism and caching

- **Deterministic output.** The same timeline, TTS cache and binary produce byte-identical audio,
  subtitles and manifests. No wall-clock timestamps, random seeds, host names or absolute paths leak into
  rendered artifacts; dither and the mock voice use fixed seeds; all geometry is integer sample frames.
  Stage timings and cache statistics appear only in the live report, never in the manifest, so a render
  from a warm cache writes the same manifest as a fresh one.
- **Content-addressed TTS cache.** Each cue's key is a blake3 hash of a canonical JSON of everything that
  affects the audio (provider type, API version, non-default base URL, model, voice, language, text,
  settings, output format; for command/piper the templates, the program and a hash of its contents, the
  files its arguments name and the piper model). Entries are `<key>.wav` (32-bit float, the provider's
  native rate, untrimmed) and `<key>.json` (metadata and word timings), written atomically. Changing one
  line re-synthesizes one cue; retiming, re-mixing or re-mastering costs nothing. A cache that cannot be
  written gives the warning `cache_write_failed`; the render still succeeds.
- **Location:** `--cache-dir` > `SONICCRAFT_CACHE_DIR` > `<timeline dir>/.soniccraft/cache`.
  `soniccraft cache info` and `soniccraft cache clear` manage it; `render --no-cache` re-synthesizes but
  still refreshes the cache.
- **Free dry runs.** `plan` uses cached durations where available, renders mock voices in-process (exact)
  and estimates the rest from per-provider speaking rates (characters per second); it never calls a
  provider.

## Security

A timeline is data, often written by an agent from text it found somewhere, so SonicCraft treats it as
untrusted:

- **Secrets never live in timelines.** API keys, tokens and passwords in a timeline (a key named
  `api_key`/`token`/`secret`/`password`, an `sk-...` value, a password in a URL, a key inside a provider's
  `command`) are the error `secret_in_timeline`, and diagnostics never repeat them (CLI snippets show
  `<redacted>`). Keys come only from environment variables (`api_key_env`).
- **Keys go only where they belong:** to each provider's own API host, to servers on this machine (only
  the provider's own key variable: `OPENAI_API_KEY` for an `openai` instance pointed at a local server,
  `KOKORO_API_KEY` for Kokoro), or to hosts you list in `SONICCRAFT_ALLOWED_HOSTS` (in soniccraft's or the
  MCP server's environment, never in the timeline). A timeline cannot send a variable of its choosing
  (`api_key_env: GITHUB_TOKEN`) to a local server, or any key to another device on the local network, unless
  that host is listed. To use a key with an OpenAI-compatible server elsewhere on your network or remote, a
  remote Kokoro or a regional endpoint, set for example `SONICCRAFT_ALLOWED_HOSTS=tts.example.com`. Anything
  else is refused before a request is made. Redirects are not followed, and keys echoed by a server are removed from
  messages.
- **Local programs:** `command` providers (and piper with its own `command`) run programs. Over MCP the
  server refuses them unless started with `soniccraft mcp --allow-command` (or `SONICCRAFT_ALLOW_COMMAND=1`).
  Programs never see provider API keys, run in their own process group (killed as a whole on timeout or
  cancel), and get the cue text through a file or stdin: an argument that would start with `-` is refused.
- **Files:** outputs are written to temporary files and put in place only when the whole render succeeds;
  a failed or cancelled render leaves earlier outputs untouched. An existing file is replaced only by an
  output of its kind (`-o notes.txt` over a text file is refused). Over MCP, a timeline's own `output.path`
  must stay inside the base directory (an explicit `output_path` argument may point anywhere).
- **Reads:** timelines are at most 5 MB, and `/dev/zero`, FIFOs or endless stdin fail at once.

## Resources

A render holds the mastered mix in memory: tracks are mixed in windows straight into one full-length master,
stems stream to their files and mastering works in place. Measured peaks (stereo, 48 kHz): about 23 MB per
minute of output for WAV, MP3, ogg, opus and m4a when music dominates (a 10-minute bed: 245 MB), about 40 MB
per minute when speech runs throughout (a 16-minute voiceover: 615 MB), and about 85 MB per minute for
24-bit FLAC, whose encoder keeps the whole stream (10 minutes: 870 MB). `SONICCRAFT_MAX_RENDER_GB` (default
8) caps a render: one that would need more fails with `timeline_too_long` before any TTS request, and
validate/plan warn ahead. Timelines are at most 24 h long.

## Architecture

```
  timeline.yaml / .json
          |
          v
  +----------------+   diagnostics: code, path, line:col, hint
  | parse + lower  |-------------------------------------------------+
  | (core)         |                                                 |
  +-------+--------+                                                 |
          | IR (Program): resolved voices, defaults, anchors          |
          v                                                          |
  +----------------+  cached / estimated durations  +-------------+   |
  | synthesis      |------------------------------->|  layout     |   |
  | (tts + cache)  |  exact durations (render)      |  (frames)   |   |
  +-------+--------+                                +------+------+   |
          | audio + word timings                          | placements|
          v                                               v           v
  +------------------------------------------------------------+  reports:
  | DSP (dsp): decode -> resample -> trim -> normalize -> clips |  validate,
  | -> pan -> stems -> ducking -> master (R128 + true peak)     |  plan,
  +-------+----------------------------------------------------+  render
          |
          v
  encode (wav/mp3/flac native; ogg/opus/m4a via ffmpeg) + captions (vtt/srt/json/transcript)
  + stems + manifest + preview.html
```

| Crate / directory | Responsibility |
|---|---|
| [`soniccraft-core`](crates/soniccraft-core) | DSL raw AST (serde + schemars), YAML/JSON parsing with source spans, diagnostics, validation and lowering to the IR, JSON Schema generation, static provider metadata. Pure: no I/O beyond environment variables. |
| [`soniccraft-layout`](crates/soniccraft-layout) | Timeline geometry in sample frames: scheduling, the speech-overlap policy, clip lengths, content end and tail; the ASCII plan diagram. Pure. |
| [`soniccraft-captions`](crates/soniccraft-captions) | Word alignment (provider timings or estimates), caption segmentation, WebVTT/SRT/JSON/transcript writers. |
| [`soniccraft-dsp`](crates/soniccraft-dsp) | AudioBuffer, decoding (symphonia; ffmpeg fallback), resampling (rubato), analysis, clip rendering, pan, ducking, loudness (ebur128), true-peak limiter, mastering loop, encoders (WAV, LAME MP3, FLAC; ffmpeg for ogg/opus/m4a). |
| [`soniccraft-tts`](crates/soniccraft-tts) | Provider trait and the eight built-in providers, content-addressed cache, duration estimator, retries and concurrency, credential checks, voice listing. |
| [`soniccraft-engine`](crates/soniccraft-engine) | Orchestration: `validate()`, `plan()` (dry run), `render()`; environment checks; all report types. |
| [`soniccraft-mcp`](crates/soniccraft-mcp) | MCP stdio server exposing the engine as tools. |
| [`soniccraft`](crates/soniccraft-cli) (`crates/soniccraft-cli`) | The `soniccraft` binary (and the `soniccraft-mcp` launcher). Human-readable and `--json` output. |
| [`packages/soniccraft-web-preview`](packages/soniccraft-web-preview) | Zero-dependency WebAudio visualizer; the engine embeds a vendored copy (`crates/soniccraft-engine/assets/preview.html`) for `render --preview`. |
| [`packages/soniccraft-mcp`](packages/soniccraft-mcp) | The npm launcher (`npx -y soniccraft-mcp`): finds or downloads the release binary and runs `soniccraft mcp`. |
| [`skills/soniccraft`](skills/soniccraft) | The Agent Skill: `SKILL.md`, references, templates. |
| [`examples`](examples) | Runnable timelines with royalty-free, procedurally generated assets. |

Dependencies point one way: `layout` → `core`; `tts` → {`core`, `dsp`}; `engine` → {`core`, `layout`,
`captions`, `dsp`, `tts`}; `mcp` → `engine`; `cli` → {`engine`, `mcp`}. The full specification is
[docs/DESIGN.md](docs/DESIGN.md); a contributor's tour of the pipeline is
[docs/architecture.md](docs/architecture.md).

## Roadmap

- **Phase 1: DSL and compiler** (implemented in v0.1)
  - [x] Timeline DSL v1.0 (YAML/JSON), JSON Schema, strict validation with did-you-mean hints
  - [x] Lowering to a resolved IR: voices, providers, defaults, anchors, dependency checks
  - [x] Sample-accurate layout with the speech-overlap policy, dry-run plans and ASCII diagrams
- **Phase 2: Synthesis** (implemented in v0.1)
  - [x] Eight providers: ElevenLabs, OpenAI-compatible, Cartesia, Kokoro, Piper, macOS say, command, mock
  - [x] Content-addressed cache, duration estimates, concurrency limits, retries, credential checks
- **Phase 3: Native DSP and mastering** (implemented in v0.1)
  - [x] Decode, resample, silence trim, source normalization, loops, fades, crossfades, pan
  - [x] Sidechain and cue-driven ducking, EBU R128 mastering loop, oversampled true-peak limiter
  - [x] WAV/MP3/FLAC encoders; ogg/opus/m4a through ffmpeg
- **Phase 4: Agent surfaces and outputs** (implemented in v0.1)
  - [x] WebVTT, SRT, JSON word timestamps and HyperFrames transcripts
  - [x] CLI with `--json`, MCP server (both protocol eras), Agent Skill, Claude Code plugin
  - [x] Stems, manifest, web preview, examples with generated assets
- **Phase 5: Distribution** (v0.1)
  - [x] Release workflow: prebuilt binaries for macOS, Linux and Windows (with and without the LGPL MP3
    encoder), `SHA256SUMS`, third-party license notices and the `soniccraft-mcp` npm launcher
  - [x] Package managers: one-line installers (`install.sh`, `install.ps1`), a
    [Homebrew tap](https://github.com/user-github-me/homebrew-soniccraft), a
    [Scoop bucket](https://github.com/user-github-me/scoop-soniccraft) and the container image
  - [x] Listings under the project's GitHub owner: the official MCP Registry
    (`io.github.user-github-me/soniccraft`), the Claude Code plugin marketplace in this repository and the
    Agent Skill for `npx skills add`
  - [x] crates.io: `cargo install soniccraft` and `cargo binstall soniccraft`
  - [x] npm: `npx -y soniccraft-mcp` (the MCP server, with the release binary downloaded and verified)
  - [ ] Curated directories: the Anthropic plugin directory and the Cursor Marketplace

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The behaviour of every component is specified in
[docs/DESIGN.md](docs/DESIGN.md); change the spec and the code together.

## License

SonicCraft is licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or
[MIT license](LICENSE-MIT), at your option. Unless you explicitly state otherwise, any contribution
intentionally submitted for inclusion in this project, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.

Native MP3 encoding uses LAME 3.100 (LGPL-2.0-or-later), statically linked through the `mp3lame-sys` and
`mp3lame-encoder` crates (LGPL-3.0), behind the default-on cargo feature `mp3`. Build with
`--no-default-features` to exclude it (for example
`cargo install --locked --path crates/soniccraft-cli --no-default-features`); mp3 output then goes through
ffmpeg when available (`format_requires_ffmpeg` otherwise). The `-no-mp3` release archives are built that
way and contain no LGPL code. The other release archives carry the license texts in `licenses/`, and
[licenses/README.md](licenses/README.md) explains how to rebuild soniccraft with a modified LAME. Audio
decoding uses symphonia, and `dirs` uses option-ext, both MPL-2.0 (a file-level copyleft; used unmodified,
with their source on crates.io). Every other dependency is under a permissive license (MIT, Apache-2.0,
BSD-3-Clause, ISC, Zlib, Unicode-3.0). Each release archive lists every crate compiled into it, with the
license texts the crate ships, in `THIRD-PARTY-LICENSES.txt`, and CI enforces this policy with cargo-deny
([deny.toml](deny.toml)).

The example audio in `examples/*/assets/` is synthesized from scratch by
[`scripts/generate-example-assets.sh`](scripts/generate-example-assets.sh) and is covered by the same
licenses.
