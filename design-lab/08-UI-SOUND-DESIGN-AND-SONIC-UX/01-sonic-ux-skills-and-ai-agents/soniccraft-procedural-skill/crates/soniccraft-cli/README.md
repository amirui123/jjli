# soniccraft

The `soniccraft` command line for [SonicCraft](https://github.com/user-github-me/soniccraft): compile a
declarative YAML/JSON audio timeline (TTS speech, music beds, sound effects) into ducked,
loudness-mastered audio with WebVTT/SRT subtitles. It also ships `soniccraft-mcp`, the same MCP server as
`soniccraft mcp` for clients that cannot pass arguments.

```bash
cargo install --locked soniccraft     # from crates.io (Rust 1.89+ and a C toolchain, for LAME)
cargo binstall soniccraft             # or the prebuilt binaries of the GitHub release (cargo-binstall)
cargo install --locked --path crates/soniccraft-cli   # or from a clone of the repository
soniccraft --version

soniccraft init demo            # starter timeline + royalty-free assets (renders offline)
cd demo
soniccraft validate timeline.yaml
soniccraft plan timeline.yaml   # dry run: layout, ducking, cost; never calls a TTS provider
soniccraft render timeline.yaml
```

## Commands

| Command | What it does |
|---|---|
| `validate <TIMELINE> [--check-credentials] [--json]` | Checks the document and its environment; rustc-style diagnostics with fix hints. |
| `plan <TIMELINE> [--json]` (alias `dry-run`) | Layout with cached or estimated durations, ducking regions, characters per provider, ASCII diagram. |
| `render <TIMELINE> [-o PATH] [--format F] [--subtitles] [--stems] [--manifest] [--preview] [--no-cache] [--json]` | The full pipeline. Relative `-o` paths are relative to the current directory. Ctrl-C cancels cleanly. |
| `schema [-o FILE]` | The timeline JSON Schema. |
| `init [DIR] [--template NAME] [--force] [--no-assets] [--list]` | A starter timeline plus the audio it references, synthesized procedurally (deterministic, royalty-free). |
| `providers [--json]`, `voices <PROVIDER> [--json]` | Which TTS providers work here; their voices (`PROVIDER` ignores case and `-`/`_`, unlike timelines). |
| `cache <info\|clear> [TIMELINE] [--json]` | The TTS cache. |
| `mcp [--base-dir DIR] [--allow-command]` | The MCP server on stdin/stdout. Timelines run no local programs (`command` providers) unless it is started with `--allow-command` or `SONICCRAFT_ALLOW_COMMAND=1`. |

Global options: `-q/--quiet`, `-v/--verbose` (info diagnostics; logs on stderr, `RUST_LOG` honored),
`--color auto|always|never` (`NO_COLOR` honored), `--cache-dir DIR`, `-j/--jobs N`. A timeline argument of
`-` reads stdin. Timelines are at most 5 MB, and no more than that is ever read: `/dev/zero`, a FIFO or
endless stdin fail at once with the size error (exit 1).

Source snippets in diagnostics never show secrets: API keys, tokens and passwords (whatever
`secret_in_timeline` reports, and any `sk-…` key-shaped token) appear as `<redacted>`, as in the JSON
reports.

## Scripting and agents

* With `--json`, stdout carries exactly one JSON document: the engine report (`ValidationReport`,
  `PlanReport`, `RenderReport`, …), or on failure `{"message", "diagnostics", "hint"?}` (a render failure
  is the engine's `RenderFailure`). That includes usage errors (exit 2):
  `` {"message": "unexpected argument '--bogus' found", "diagnostics": [], "hint": "…; see `soniccraft validate --help`"} ``,
  with clap's message on stderr as usual (`soniccraft mcp` excepted: its stdout is the protocol). Progress and
  logs go to stderr.
* Exit statuses: `0` success, `1` timeline invalid (error diagnostics), `2` usage error, `3` runtime or
  render failure, `130` interrupted. A render stopped by its environment or options (a missing key, an
  unreachable server, a voice that is not installed, `--format` needing ffmpeg) also exits 1, but ends
  with `error: render stopped: N errors` rather than blaming the timeline.

The `mp3` feature (default) statically links the LAME 3.100 encoder (LGPL-2.0-or-later, built by the
LGPL-3.0 crates `mp3lame-sys` and `mp3lame-encoder`; see [licenses/README.md](../../licenses/README.md))
for native MP3 encoding; `--no-default-features` builds without it (MP3 output then needs ffmpeg).
SonicCraft itself is licensed MIT OR Apache-2.0.
