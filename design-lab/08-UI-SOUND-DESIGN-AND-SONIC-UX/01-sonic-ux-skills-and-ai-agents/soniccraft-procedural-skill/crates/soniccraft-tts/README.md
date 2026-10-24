# soniccraft-tts

The speech synthesis of [SonicCraft](https://github.com/user-github-me/soniccraft), the declarative
multi-track audio engine for AI agents: providers for ElevenLabs, OpenAI-compatible servers, Cartesia,
Kokoro, Piper, macOS `say`, an arbitrary command and a deterministic mock voice, with word timings where
the provider has them; a content-addressed cache; duration estimates for dry runs; retries, concurrency
limits and credential checks. API keys are read from the environment and sent only to each provider's own
host (or to hosts listed in `SONICCRAFT_ALLOWED_HOSTS`).

This crate is a building block of the [`soniccraft`](https://crates.io/crates/soniccraft) CLI and MCP
server (`cargo install soniccraft`). Its version follows SonicCraft's, and its API may change in any new
minor version (0.2, 0.3, ...). The provider documentation and the issue tracker are in the
[repository](https://github.com/user-github-me/soniccraft).

## License

Licensed under either of [Apache License, Version 2.0](../../LICENSE-APACHE) or
[MIT license](../../LICENSE-MIT), at your option.
