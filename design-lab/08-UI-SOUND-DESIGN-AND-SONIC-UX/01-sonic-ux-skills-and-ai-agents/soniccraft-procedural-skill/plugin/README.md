# SonicCraft plugin for Claude Code

The SonicCraft Agent Skill and MCP server: compile declarative audio timelines (TTS speech, music beds, sound
effects) into ducked, loudness-mastered audio with WebVTT/SRT subtitles.

- `skills/soniccraft/`: the Agent Skill, a copy of the repository's `skills/soniccraft` kept in sync by
  `scripts/sync-plugin.sh`
- `.mcp.json`: the MCP server, `soniccraft mcp` on stdio

The MCP server is the SonicCraft CLI, which the plugin does not bundle: install it with Homebrew
(`brew install user-github-me/soniccraft/soniccraft`), Scoop, `cargo install --locked soniccraft` or a release
archive, as the repository README describes.

## Data handling

SonicCraft runs on your machine. The publisher operates no service and receives no data, and there is no
telemetry.

- **Reads:** the timeline files and audio assets you point it at and, for a cloud voice, that provider's API key
  from your environment.
- **Writes:** the rendered audio, subtitles, stems, manifest and preview page where you ask, and a local cache of
  synthesized speech (`.soniccraft/cache` next to the timeline unless you pass `--cache-dir`;
  `soniccraft cache clear` empties it).
- **Sends off your machine:** only when a timeline uses a cloud voice. The text of its speech cues then goes to
  that provider (ElevenLabs, OpenAI or an OpenAI-compatible server you configure, or Cartesia), with that
  provider's own API key. macOS voices, Piper, a Kokoro server on your machine and the mock voice send nothing.
  A `command` provider runs the program you configure; the MCP server allows it only when started with
  `--allow-command`.
- **Retention:** SonicCraft keeps nothing beyond the local cache. The cloud providers' own terms apply to the
  text you send them.

Source, documentation and license (MIT OR Apache-2.0): https://github.com/user-github-me/soniccraft
