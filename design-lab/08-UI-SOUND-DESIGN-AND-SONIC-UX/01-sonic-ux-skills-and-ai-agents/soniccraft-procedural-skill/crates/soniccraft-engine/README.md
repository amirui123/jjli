# soniccraft-engine

The engine of [SonicCraft](https://github.com/user-github-me/soniccraft), the declarative multi-track audio
engine for AI agents, and the API its CLI and MCP server use: `Engine::validate` (the timeline and the
environment it would render in), `Engine::plan` (a dry run that never calls a TTS provider) and
`Engine::render` (synthesis, layout, ducking, loudness mastering, encoding, and subtitles, stems, a
manifest and a web preview). Every problem is a structured diagnostic with a stable code and, wherever
possible, a fix hint. Renders are deterministic.

The default `mp3` feature enables native MP3 encoding with LAME (LGPL) in `soniccraft-dsp`; with
`default-features = false` MP3 output needs ffmpeg.

This crate is a building block of the [`soniccraft`](https://crates.io/crates/soniccraft) CLI and MCP
server (`cargo install soniccraft`). Its version follows SonicCraft's, and its API may change in any new
minor version (0.2, 0.3, ...). The design document and the issue tracker are in the
[repository](https://github.com/user-github-me/soniccraft).

## License

Licensed under either of [Apache License, Version 2.0](../../LICENSE-APACHE) or
[MIT license](../../LICENSE-MIT), at your option.
