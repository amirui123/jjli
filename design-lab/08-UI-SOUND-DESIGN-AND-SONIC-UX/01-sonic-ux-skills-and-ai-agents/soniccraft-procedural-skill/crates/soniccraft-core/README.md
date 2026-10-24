# soniccraft-core

The timeline DSL of [SonicCraft](https://github.com/user-github-me/soniccraft), the declarative multi-track
audio engine for AI agents: YAML/JSON parsing with source spans, validation with did-you-mean hints,
lowering to the resolved IR the engine consumes, and the timeline JSON Schema. Pure and deterministic: no
I/O beyond reading environment variables.

This crate is a building block of the [`soniccraft`](https://crates.io/crates/soniccraft) CLI and MCP
server (`cargo install soniccraft`). Its version follows SonicCraft's, and its API may change in any new
minor version (0.2, 0.3, ...). The DSL reference, the design document and the issue tracker are in the
[repository](https://github.com/user-github-me/soniccraft).

## License

Licensed under either of [Apache License, Version 2.0](../../LICENSE-APACHE) or
[MIT license](../../LICENSE-MIT), at your option.
