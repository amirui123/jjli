# soniccraft-captions

The subtitles of [SonicCraft](https://github.com/user-github-me/soniccraft), the declarative multi-track
audio engine for AI agents: word alignment (provider timings or estimates), caption segmentation, and
WebVTT, SRT, JSON word-timestamp and transcript writers. It is independent of the other SonicCraft crates
(plain text, millisecond times, its own small input types) and deterministic: the same input always gives
byte-identical files.

This crate is a building block of the [`soniccraft`](https://crates.io/crates/soniccraft) CLI and MCP
server (`cargo install soniccraft`). Its version follows SonicCraft's, and its API may change in any new
minor version (0.2, 0.3, ...). The design document and the issue tracker are in the
[repository](https://github.com/user-github-me/soniccraft).

## License

Licensed under either of [Apache License, Version 2.0](../../LICENSE-APACHE) or
[MIT license](../../LICENSE-MIT), at your option.
