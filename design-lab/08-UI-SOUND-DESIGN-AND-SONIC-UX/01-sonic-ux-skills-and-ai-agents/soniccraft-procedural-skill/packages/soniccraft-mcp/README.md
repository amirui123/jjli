# soniccraft-mcp

`soniccraft-mcp` runs the [SonicCraft](https://github.com/OWNER/soniccraft) MCP server from npm, so MCP
clients that start servers with `npx` can use SonicCraft without a Rust toolchain. SonicCraft compiles a
declarative YAML/JSON audio timeline (TTS speech, music beds, sound effects) into ducked,
loudness-mastered audio with subtitles.

```json
{
  "mcpServers": {
    "soniccraft": { "command": "npx", "args": ["-y", "soniccraft-mcp"] }
  }
}
```

With Claude Code: `claude mcp add soniccraft -- npx -y soniccraft-mcp`.

The server is the Rust binary (`soniccraft mcp`). This package is a small launcher with no dependencies:
it finds that binary, downloading a prebuilt release on first use, and runs `soniccraft mcp` with stdin,
stdout and stderr passed straight through. Arguments go to the server, for example
`npx -y soniccraft-mcp --base-dir /path/to/project --cache-dir /path/to/cache`. The launcher writes
nothing to stdout, which carries the MCP protocol; its own messages go to stderr. Timelines run local
programs (`command` providers) only when you pass `--allow-command` (or set `SONICCRAFT_ALLOW_COMMAND=1`).

Requires Node.js 20 or newer.

## How the binary is found

1. `SONICCRAFT_BIN`, if set: the path of a `soniccraft` binary (`soniccraft.exe` on Windows).
2. `soniccraft` on `PATH`, for example after `cargo install --locked --path crates/soniccraft-cli`. When
   its version is not compatible with this package (a different minor version before 1.0), a note goes to
   stderr and it is used anyway.
3. A release downloaded earlier, in the user cache: `SONICCRAFT_BIN_CACHE`, else
   `~/Library/Caches/soniccraft/bin` on macOS, `$XDG_CACHE_HOME/soniccraft/bin` or
   `~/.cache/soniccraft/bin` on Linux, `%LOCALAPPDATA%\soniccraft\bin` on Windows.
4. Otherwise the launcher downloads the GitHub release archive of this package's version for the current
   platform, verifies it and unpacks it into that cache.

If none of this works, the launcher exits with status 1 and says on stderr what to do.

## Verified downloads

Each published version of this package contains `release.json`, written by the project's release
workflow: the download URL and the SHA-256 of every release archive. A download is installed only when
its checksum matches the one that came from the npm registry, so a modified archive is refused even if the
server also serves a matching `.sha256` file. The launcher also refuses an https download that is
redirected to plain http, an archive larger than 128 MB, and a download that takes longer than five
minutes. It unpacks into a temporary directory next to the cache and moves the result into place in one
step, so an interrupted download leaves nothing behind and two launchers can download at the same time.

| Platform | Release target | Archive |
|---|---|---|
| macOS, Apple silicon | `aarch64-apple-darwin` | `.tar.gz` |
| macOS, Intel | `x86_64-apple-darwin` | `.tar.gz` |
| Linux x64 (glibc) | `x86_64-unknown-linux-gnu` | `.tar.gz` |
| Linux arm64 (glibc) | `aarch64-unknown-linux-gnu` | `.tar.gz` |
| Windows x64, and Windows on Arm through x64 emulation | `x86_64-pc-windows-msvc` | `.zip` |

On other systems, including Linux with musl (Alpine), build soniccraft from source with
`cargo install --locked --path crates/soniccraft-cli` in a clone of the repository, then put it on `PATH`
or set `SONICCRAFT_BIN`.

## Environment

| Variable | Effect |
|---|---|
| `SONICCRAFT_BIN` | Run this binary; nothing is downloaded. |
| `SONICCRAFT_BIN_CACHE` | Keep downloaded binaries here instead of the user cache. |
| `SONICCRAFT_FLAVOR` | `no-mp3` downloads the build without the LGPL MP3 encoder (mp3 output then needs ffmpeg); `mp3` is the default. |
| `SONICCRAFT_DOWNLOAD_BASE` | A mirror of the `releases/download` directory. Downloads from it are still checked against the pinned checksums. |
| `NODE_USE_ENV_PROXY` | Node's built-in `fetch` ignores `HTTPS_PROXY` unless this is `1`, in the Node versions whose `node --help` lists `--use-env-proxy`. |

The server reads its own variables too, such as `SONICCRAFT_CACHE_DIR`, the TTS provider keys,
`SONICCRAFT_ALLOWED_HOSTS` (more hosts that may receive those keys), `SONICCRAFT_ALLOW_COMMAND`,
`SONICCRAFT_MCP_MAX_RENDERS` and `SONICCRAFT_MAX_RENDER_GB`.

## Installing ahead of time

`npx -y soniccraft-mcp --install` downloads the binary if needed and prints its path, without starting
the server: useful in a Docker image or before going offline. Without network access, download the
archive for your platform from the project's GitHub releases on another machine, check it against
`SHA256SUMS`, unpack it, and set `SONICCRAFT_BIN` to the `soniccraft` binary inside.

`soniccraft-mcp --help` and `soniccraft-mcp --version` describe the launcher itself; with any other
arguments, `--help` goes to the server.

## Licenses

This launcher is MIT OR Apache-2.0 ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)). The
default binaries it downloads also contain the LAME MP3 encoder (LGPL); each archive has its license texts
in `licenses/` and a `THIRD-PARTY-LICENSES.txt` for every crate compiled in. `SONICCRAFT_FLAVOR=no-mp3`
selects archives without LGPL code.

## Development

```bash
cd packages/soniccraft-mcp
npm test    # node:test, no dependencies
```

The tests that run the real server use `SONICCRAFT_TEST_BIN`, else `target/release/soniccraft` or
`target/debug/soniccraft` of the repository (`cargo build -p soniccraft`), and are skipped when neither
exists. The archive names follow `.github/workflows/release.yml`:
`soniccraft-v<version>-<target>[-no-mp3].tar.gz` (`.zip` for Windows), each with a `.sha256` file, all
listed in `SHA256SUMS`. Keep `version` in `package.json` equal to the workspace version; the release
workflow checks it.

Publishing is done by the release workflow. After the archives are built, it runs
`scripts/pin-release.mjs` (it writes `release.json` from `SHA256SUMS` and replaces the `OWNER`
placeholder in `package.json` with the real repository) and packs the package. `npm pack` and
`npm publish` refuse to run on an unpinned package (the `prepack` script, `scripts/check-release.mjs`),
because the published launcher could not verify or even find its downloads.
