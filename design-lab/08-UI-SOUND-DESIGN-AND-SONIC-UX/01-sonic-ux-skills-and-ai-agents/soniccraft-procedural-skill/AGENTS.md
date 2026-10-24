# AGENTS.md

Instructions for AI agents (Codex, Claude Code, Cursor, Gemini CLI, GitHub Copilot and others), both for
producing audio with SonicCraft and for changing its code. People: see [README.md](README.md) and
[CONTRIBUTING.md](CONTRIBUTING.md).

## Producing audio with SonicCraft

SonicCraft compiles a YAML timeline (speech cues, music beds, sound effects) into mastered audio with
subtitles. When a user asks for a voiceover, podcast, narration, audio ad or a soundtrack for a video:

1. **Install the CLI** if `soniccraft --version` fails (prebuilt and checksum-verified, no Rust needed):
   - macOS, Linux: `curl -fsSL https://raw.githubusercontent.com/user-github-me/soniccraft/main/install.sh | sh`
     (installs to `~/.local/bin`)
   - Windows PowerShell: `irm https://raw.githubusercontent.com/user-github-me/soniccraft/main/install.ps1 | iex`
   - inside a clone of this repository: `cargo install --locked --path crates/soniccraft-cli`
2. **Learn the format** from [skills/soniccraft/SKILL.md](skills/soniccraft/SKILL.md) (workflow, rules,
   provider notes). `soniccraft schema` prints the full JSON Schema.
3. **Pick voices that work here.** `soniccraft providers` shows which TTS providers are ready.
   - `macos_say` (macOS) speaks with system voices, no API key needed.
   - `mock` is a synthetic test voice, not speech: use it to check timing, never for audio you hand over.
   - Free local voices on any OS: `kokoro` (start the server with
     `docker run -d -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest`) and `piper` (`pipx install piper-tts`).
   - Cloud voices read their key from the environment: `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `CARTESIA_API_KEY`.
4. **Start from a template.** `soniccraft init my-audio` renders offline; `--template voiceover-with-music`,
   `two-person-podcast` and others use cloud or local voices (`soniccraft init --list` shows what each needs).
   Existing recordings, music and effects go on music and sfx tracks (`source:`), with trims, fades, loops,
   volume and pan.
5. **Validate, plan, render:**
   - `soniccraft validate timeline.yaml --json`: fix every error by its `code` and hint, then run it again
   - `soniccraft plan timeline.yaml`: free dry run (timing, ducking, characters to synthesize)
   - `soniccraft render timeline.yaml --json --preview`: the audio, `.vtt`/`.srt` subtitles, a manifest and
     an HTML preview. Tell the user the output paths and the measured loudness.

Never write API keys into timelines, commands or logs. Ask the user before a render that bills a paid
provider: `plan` shows how many characters would be synthesized.

MCP clients can use the same engine as tools (`soniccraft_validate_timeline`, `soniccraft_dry_run`,
`soniccraft_render`, `soniccraft_get_schema`, `soniccraft_list_providers`, `soniccraft_list_voices`) through
`soniccraft mcp` on stdio. The README's [MCP server](README.md#mcp-server) section has the client setups.

## Changing SonicCraft

- Rust workspace in `crates/`: core (DSL, validation, diagnostics), layout, captions, dsp, tts, engine, mcp
  and the CLI (`crates/soniccraft-cli`, package `soniccraft`). The npm launcher and the web preview are in
  `packages/`, the Agent Skill in `skills/soniccraft/`.
- Before you finish, run `cargo fmt --all`, `cargo clippy --workspace --all-targets -- -D warnings`,
  `cargo test --workspace` and `python3 scripts/check-docs.py`.
- Diagnostic codes and report fields are public API. A new code in `crates/soniccraft-core/src/diagnostics.rs`
  also goes into `docs/DESIGN.md` §7 and
  [skills/soniccraft/reference/diagnostics.md](skills/soniccraft/reference/diagnostics.md); note
  user-visible changes in [CHANGELOG.md](CHANGELOG.md) under Unreleased.
- After editing `skills/soniccraft/`, run `scripts/sync-plugin.sh`: the Claude Code plugin in `plugin/` carries
  a copy of the skill, and CI fails when the copy is out of date. Keep everything else out of `plugin/`.
- [CONTRIBUTING.md](CONTRIBUTING.md) covers fixtures, templates and the release process.
