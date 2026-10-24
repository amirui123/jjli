# soniccraft-layout

The timeline geometry of [SonicCraft](https://github.com/user-github-me/soniccraft), the declarative
multi-track audio engine for AI agents: sample-accurate scheduling of cues and clips (anchors, offsets,
the speech-overlap policy), clip lengths, loops and fades, the content end and tail, and the ASCII plan
diagram. A pure, deterministic function of a lowered `soniccraft-core` program and a table of durations.
The `test-support` feature adds a builder for lowered programs, for tests.

This crate is a building block of the [`soniccraft`](https://crates.io/crates/soniccraft) CLI and MCP
server (`cargo install soniccraft`). Its version follows SonicCraft's, and its API may change in any new
minor version (0.2, 0.3, ...). The design document and the issue tracker are in the
[repository](https://github.com/user-github-me/soniccraft).

## License

Licensed under either of [Apache License, Version 2.0](../../LICENSE-APACHE) or
[MIT license](../../LICENSE-MIT), at your option.
