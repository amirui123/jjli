# soniccraft-dsp

The native signal chain of [SonicCraft](https://github.com/user-github-me/soniccraft), the declarative
multi-track audio engine for AI agents: decoding (symphonia, with an ffmpeg fallback), resampling, silence
trim and analysis, clip rendering with fades, loops and pan, sidechain ducking, EBU R128 loudness, an
oversampled true-peak limiter, the mastering loop, and WAV, MP3 and FLAC encoders (ogg, opus and m4a through
ffmpeg). Deterministic: identical input gives byte-identical wav, flac and mp3 output.

The default `mp3` feature statically links the LAME 3.100 encoder (LGPL-2.0-or-later) through the LGPL-3.0
crates `mp3lame-sys` and `mp3lame-encoder`. With `default-features = false` the crate contains no LGPL
code, and MP3 output needs ffmpeg.

This crate is a building block of the [`soniccraft`](https://crates.io/crates/soniccraft) CLI and MCP
server (`cargo install soniccraft`). Its version follows SonicCraft's, and its API may change in any new
minor version (0.2, 0.3, ...). The design document (its §4 specifies the algorithms) and the issue tracker
are in the [repository](https://github.com/user-github-me/soniccraft).

## License

Licensed under either of [Apache License, Version 2.0](../../LICENSE-APACHE) or
[MIT license](../../LICENSE-MIT), at your option.
