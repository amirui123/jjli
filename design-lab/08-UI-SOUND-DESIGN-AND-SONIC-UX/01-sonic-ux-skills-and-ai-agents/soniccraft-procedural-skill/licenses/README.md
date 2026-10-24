# Licenses of bundled components

SonicCraft's own code is licensed under MIT OR Apache-2.0 ([LICENSE-MIT](../LICENSE-MIT),
[LICENSE-APACHE](../LICENSE-APACHE)). This directory holds the license texts of the one copyleft component
that the default build links into the binaries: the LAME MP3 encoder, behind the default-on cargo feature
`mp3`.

The release archives built with that feature (`soniccraft-v<version>-<target>.tar.gz`, `.zip` on Windows)
include this directory. The `-no-mp3` archives contain no LGPL code and do not need it. Every archive also
has a `THIRD-PARTY-LICENSES.txt` that lists each crate compiled into that binary, with the license texts
the crate ships. `scripts/third-party-licenses.py` generates it from `Cargo.lock`.

## What each file covers

| File | License | Covers |
|---|---|---|
| [`LGPL-2.0-LAME.txt`](LGPL-2.0-LAME.txt) | GNU Library General Public License, version 2 (LAME's `COPYING`) | **LAME 3.100**, licensed LGPL-2.0-or-later: the C encoder library, compiled from the sources bundled in `mp3lame-sys` and linked statically |
| [`LGPL-3.0.txt`](LGPL-3.0.txt) | GNU Lesser General Public License, version 3 | the Rust crates **`mp3lame-sys`** (0.1.11) and **`mp3lame-encoder`** (0.2.5), which build LAME and wrap its API |
| [`GPL-3.0.txt`](GPL-3.0.txt) | GNU General Public License, version 3 | LGPL-3.0 is a set of additional permissions on top of GPL-3.0, and requires that both texts accompany the binary |

Only LAME's encoder is built. The `decoder` feature of `mp3lame-sys` (MPGLIB from mpg123, which is GPL) is
off, and [`deny.toml`](../deny.toml) makes CI fail if anything enables it.

This software uses LAME ("LAME Ain't an MP3 Encoder", <https://lame.sourceforge.io>), copyright 1999-2011
The LAME Project and its contributors. LAME asks programs that use the library to acknowledge it and link
to its website.

## Other licenses in the dependency graph

- **MPL-2.0**: `symphonia` and its codec and format crates (audio decoding), and `option-ext` (through
  `dirs`). The MPL is a file-level copyleft that permits linking into a program under other terms. These
  files are used unmodified, and their source code is on crates.io at the versions that
  `THIRD-PARTY-LICENSES.txt` lists (MPL-2.0 section 3.2).
- **Everything else is permissive**: MIT, Apache-2.0, BSD-3-Clause, ISC, Zlib and Unicode-3.0. Several
  crates offer further alternatives, such as 0BSD, BSL-1.0, CC0-1.0, MIT-0 or Unlicense. `deny.toml` holds
  the allow-list, which CI enforces with cargo-deny.

## The LGPL and relinking a modified LAME

The LGPL lets you use, share and sell soniccraft binaries that contain LAME, as long as recipients can
rebuild them with a modified LAME. SonicCraft is open source, so the source of the program (the LGPL's
"Corresponding Application Code") and of the LAME it links (the "Minimal Corresponding Source") are both
public:

- SonicCraft: <https://github.com/user-github-me/soniccraft>, at the tag of the release (`v<version>`).
- LAME 3.100 as built: the `lame-3.100/` directory of the `mp3lame-sys` 0.1.11 crate,
  <https://crates.io/crates/mp3lame-sys/0.1.11>.

To build soniccraft with a modified LAME:

1. Check out the release you want to rebuild:

   ```bash
   git clone --branch v0.1.0 https://github.com/user-github-me/soniccraft
   cd soniccraft
   ```

2. Unpack the `mp3lame-sys` source next to it, then change LAME under `lame-3.100/`:

   ```bash
   curl -L https://crates.io/api/v1/crates/mp3lame-sys/0.1.11/download | tar -xz -C ..
   ```

3. Point the build at your copy by adding this to the workspace `Cargo.toml`:

   ```toml
   [patch.crates-io]
   mp3lame-sys = { path = "../mp3lame-sys-0.1.11" }
   ```

4. Build without `--locked`, because the patch changes `Cargo.lock`:

   ```bash
   cargo build --release -p soniccraft
   cargo tree -i mp3lame-sys    # shows the path of your copy
   ```

   `target/release/soniccraft` and `target/release/soniccraft-mcp` now link your LAME.

The build needs Rust 1.89 or newer, a C compiler and `make`. On Unix, LAME builds with its own autotools
scripts. On Windows, the `cc` crate compiles it with MSVC.

## Builds without LGPL code

`cargo build --no-default-features` leaves out the `mp3` feature, and so do the `-no-mp3` release
archives. Neither LAME nor the mp3lame crates are compiled in. MP3 output is then encoded with ffmpeg
when it is installed; without ffmpeg, rendering to mp3 fails with the diagnostic `format_requires_ffmpeg`.
