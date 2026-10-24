# soniccraft-mcp

The SonicCraft [Model Context Protocol](https://modelcontextprotocol.io) server: the engine's validate,
dry-run and render operations as MCP tools over stdio (newline-delimited JSON-RPC 2.0). Agents write a
YAML/JSON timeline, validate it, dry-run it for free and render it to loudness-mastered audio with
subtitles, all through tool calls.

It is started by the CLI (`soniccraft mcp`, or the zero-argument `soniccraft-mcp` launcher for clients
that cannot pass arguments) and is also a library (`serve_stdio`, `serve`).

## Register it with your agent

Install the `soniccraft` binary first (it must be on `PATH`, or use an absolute path below). API keys
for cloud TTS providers are read from the server's environment, never from timelines: forward the ones
you use (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `CARTESIA_API_KEY`). The `mock` provider (and `macos_say`
on macOS) needs none. Timelines that use the `command` provider (your own TTS program) need
`soniccraft mcp --allow-command`; see [Security](#security).

### Claude Code

```bash
claude mcp add soniccraft -- soniccraft mcp                    # this project, private (local scope)
claude mcp add --scope user soniccraft -- soniccraft mcp       # every project
claude mcp add --scope project soniccraft -- soniccraft mcp    # writes .mcp.json for the team
claude mcp add soniccraft -- npx -y soniccraft-mcp             # without a Rust toolchain (npm launcher)
```

Or in `.mcp.json` (project) / `~/.claude.json` (user), with a 15-minute per-call timeout for long renders.
A stdio server inherits the environment Claude Code runs in, so exported API keys reach it without an `env`
block:

```json
{
  "mcpServers": {
    "soniccraft": {
      "type": "stdio",
      "command": "soniccraft",
      "args": ["mcp"],
      "timeout": 900000
    }
  }
}
```

Avoid `"env": {"ELEVENLABS_API_KEY": "${ELEVENLABS_API_KEY}"}`: when the variable is unset, the client passes
the literal text `${ELEVENLABS_API_KEY}`. The server treats such a placeholder as a missing key
(`missing_credentials`, with a hint saying so); if you need the entry, write `"${ELEVENLABS_API_KEY:-}"`.

Claude Code sets `CLAUDE_PROJECT_DIR`, which the server uses as its default base directory. The tools
appear as `mcp__soniccraft__soniccraft_render` and so on.

### Cursor

`~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "soniccraft": {
      "type": "stdio",
      "command": "soniccraft",
      "args": ["mcp", "--base-dir", "${workspaceFolder}"],
      "env": { "ELEVENLABS_API_KEY": "${env:ELEVENLABS_API_KEY}" }
    }
  }
}
```

`--base-dir` makes relative tool paths resolve against the workspace instead of the server's working
directory.

### Codex CLI

```bash
codex mcp add soniccraft -- soniccraft mcp
```

Then raise the per-call timeout (Codex defaults to 60 s, too short for renders) in `~/.codex/config.toml`:

```toml
[mcp_servers.soniccraft]
command = "soniccraft"
args = ["mcp"]
env_vars = ["ELEVENLABS_API_KEY", "OPENAI_API_KEY", "CARTESIA_API_KEY"]  # forwarded from your shell
startup_timeout_sec = 20
tool_timeout_sec = 900
default_tools_approval_mode = "approve"   # lets non-interactive `codex exec` call soniccraft_render
# cwd = "/path/to/project"   # or pass args = ["mcp", "--base-dir", "/path/to/project"]
```

`soniccraft_render` writes files, so Codex asks before running it: interactive sessions prompt, while
`codex exec` (approval policy `never`) fails the call ("MCP tool call requires approval") unless the entry
approves it, as above, or only for the render tool with `[mcp_servers.soniccraft.tools.soniccraft_render]`
`approval_mode = "approve"`. For one run: `codex exec -c
'mcp_servers.soniccraft.default_tools_approval_mode="approve"' ...`.

## Tools

| Tool | Arguments | Result (`structuredContent`) |
|---|---|---|
| `soniccraft_validate_timeline` | `yaml_content` or `yaml_path` (alias `path`), `base_dir`, `check_credentials`, `detail` | ValidationReport `{valid, diagnostics, summary}` |
| `soniccraft_dry_run` | `yaml_content` or `yaml_path` (alias `path`), `base_dir`, `detail` | PlanReport (layout, ducking, synthesis cost, ASCII `diagram`) |
| `soniccraft_render` | `yaml_content` or `yaml_path` (alias `path`), `base_dir`, `output_path`, `format`, `export_subtitles`, `no_cache`, `detail` | RenderReport, or `{message, diagnostics}` on failure |
| `soniccraft_get_schema` | `detail` | `{dsl_version, schema_id, quick_reference}`; `detail: "full"` adds `schema` |
| `soniccraft_list_providers` | none | `{providers: [...]}` with availability and credential status |
| `soniccraft_list_voices` | `provider` | `{provider, voices: [{id, name, language, gender, description}]}` |

`format` (render) is one of wav, mp3, flac, ogg, opus, m4a and overrides the timeline's `output.format`;
pass it with an `output_path` whose extension names another format than the timeline (otherwise the
timeline's format wins and, say, WAV data lands in a `.mp3` file). Provider names in `soniccraft_list_voices`
and `format` values are matched case-insensitively.

The workflow is write → validate → dry run → render. Every result carries:

1. a compact summary text block, written for the model (diagnostics one per line as
   `error[code] path (line:column): message — hint`, the dry-run diagram, the render's output path,
   duration, loudness against its target and side files);
2. the full report as JSON text, for clients that ignore `structuredContent`;
3. `structuredContent`: the same report as an object, identical to `soniccraft … --json`;
4. for renders, `resource_link` blocks (`file://` URIs of absolute paths, with MIME type and size) for the
   audio and every side file. Sessions on a protocol revision older than 2025-06-18 (which has no
   `resource_link`; older clients reject unknown content types) get a `Files written:` text block instead.
   Audio is never inlined as base64.

An invalid timeline is a *successful* validate/dry-run call (`isError: false`, `valid: false`): fix the
diagnostics and call again. A failed render is `isError: true` with its diagnostics. Every argument
problem is also an `isError: true` result the model can act on (MCP SEP-1303): an unknown argument name
(with the valid names, a did-you-mean and `structuredContent: {error: "unknown_argument", unknown, valid,
suggestions}`), a wrong type, both or neither of `yaml_content`/`yaml_path`, a missing file, a
`yaml_path` that is not a regular file (`/dev/zero`, a FIFO) or is larger than the 5 MiB document limit.

### Result size

Results are sized for an agent's context, not only for the transport (Claude Code keeps a tool result out
of the conversation above about 25,000 tokens):

- `detail: "auto"` (the default): the whole report while its JSON has at most about 12,000 characters
  (some 40 items); above that a **compact report** with the same keys: totals, output and files,
  loudness, synthesis, tracks, ducking (regions capped, with counts), the errors and warnings (up to 50,
  with `diagnostic_counts`), and the first and last 10 items plus every item a diagnostic names or the
  overlap policy moved, with `items_total`, `items_truncated: true` and a `full_report` note (the
  manifest path when one was written). The text summary lists the first and last 15 items and shows
  the plan diagram's track lanes; a diagram longer than about 6,000 characters is left out of the text.
  The whole result (every content block plus `structuredContent`) stays under about 40,000 characters.
- `detail: "summary"`: always the compact report.
- `detail: "full"`: everything; a result too large for one message (6 MiB) is shortened step by step
  (the JSON mirror, then the diagram and cue texts, then capped lists, each with a note) and never
  becomes a JSON-RPC error.

Annotations: validate, dry run, schema, providers and voices are read-only; validate (with
`check_credentials`) and voices may contact provider APIs (`openWorldHint: true`); render writes and
overwrites files (`readOnlyHint: false`, `destructiveHint: true`), is idempotent and calls TTS APIs.

### Paths

Relative `yaml_path`, `output_path` and the paths inside an inline `yaml_content` resolve against the
call's `base_dir`, else `soniccraft mcp --base-dir`, else `CLAUDE_PROJECT_DIR`, else the server's working
directory. Paths inside a timeline *file* resolve against that file's directory. Results always report
absolute paths. A leading `~` is expanded.

### Long renders

When a `tools/call` carries `_meta.progressToken`, renders send `notifications/progress` (`total` 100,
strictly increasing, with stage messages such as `Synthesized cue_03 (3/4)`), all before the response.
At most two renders run at once (`SONICCRAFT_MCP_MAX_RENDERS`, or `ServerOptions::max_concurrent_renders`);
a later render waits, reports `Waiting for another render to finish` every 10 s, and can be cancelled
while it waits.
`notifications/cancelled` stops the render at its next checkpoint, removes its partial files and sends
no response. Requests are handled concurrently, so `ping`, `tools/list` and other tools stay responsive
during a render. When the client closes stdin, in-flight requests get up to 5 s to finish; renders still
running are then cancelled. On SIGINT/SIGTERM the server cancels running renders, gives them 0.4 s to
remove their partial files and exits.

## Protocol support

Built on the official Rust SDK [`rmcp`](https://crates.io/crates/rmcp) 3.5.1:

- **`initialize` era** (Codex, Cursor): revisions 2024-11-05, 2025-03-26, 2025-06-18 and 2025-11-25
  are echoed; any other requested version (including 2026-07-28, which has no handshake) gets
  2025-11-25. `ping` works before and after initialization.
- **2026-07-28** (Claude Code probes it first): `server/discover`, then stateless requests carrying
  `_meta` `io.modelcontextprotocol/protocolVersion` and `…/clientCapabilities`; results carry
  `resultType`, lists carry `ttlMs`/`cacheScope`. A probe does not lock the era: a later `initialize`
  still works.
- Errors: `-32700` for a line that is not JSON, `-32600` for JSON that is not a JSON-RPC message (with
  the request's `id` when it has one; batches are rejected; a request whose `id` is null, fractional,
  boolean, an array or an object gets `-32600` with no id; a `notifications/…` method with a stray `id` is
  handled as a notification), `-32601` unknown method, `-32602` malformed
  params (positional `params` included) or unknown tool, `-32022` unsupported per-request protocol
  version. Argument problems are `isError` tool results, not protocol errors. Malformed notifications are
  dropped, never answered; stray notifications before initialization are ignored.
- 2026-07-28 results (`tools/list`, `tools/call`, the empty prompt and resource lists, completions)
  carry `_meta["io.modelcontextprotocol/serverInfo"]`, as `server/discover` does.
- Framing: one compact JSON message per line, at most 16 MiB in and kept far below 8 MiB out (Codex's
  limit). stdout carries only protocol messages; logs go through `tracing` to stderr.

## Security

A timeline is data an agent may have found anywhere (a repository, a web page, a prompt), so the server
treats it as untrusted:

- **Programs**: `command` providers (and a piper instance with its own `command`) run local programs.
  The server allows them only when started with `soniccraft mcp --allow-command` or with
  `SONICCRAFT_ALLOW_COMMAND=1` in its environment; otherwise such a timeline gets
  `provider_unavailable` with that hint. Enable it only for timelines you trust.
- **Files**: renders write the audio and its side files. A timeline's own `output.path` must stay inside
  the call's base directory (`base_dir`, `--base-dir`, `CLAUDE_PROJECT_DIR`); an `output_path` argument
  is the caller's explicit choice and may point anywhere.
- **API keys** are read from the server's environment and sent only to each provider's official API
  host, servers on this machine (the provider's own key variable only), or hosts listed in
  `SONICCRAFT_ALLOWED_HOSTS`
  (set it in the server's environment, never in a timeline); `check_credentials` follows the same rule.
- **Reads**: `yaml_path` must be a regular file of at most 5 MiB; `/dev/zero` or a FIFO fails at once.

## Library use

```rust,no_run
use soniccraft_engine::{Engine, EngineOptions};
use soniccraft_mcp::{ServerOptions, serve_stdio};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let engine = Engine::new(EngineOptions::default());
    serve_stdio(engine, ServerOptions::with_base_dir("/path/to/project")).await
}
```

`serve(engine, options, reader, writer)` serves any `AsyncRead`/`AsyncWrite` pair (tests use in-memory
duplex pipes) and installs no signal handlers.

## Development

```bash
cargo test -p soniccraft-mcp                     # protocol, tools, renders (mock voices; no keys, no network)
cargo run -p soniccraft-mcp --example stdio_server -- /path/to/base/dir   # a server on stdio
```

Conformance with the MCP Inspector in each protocol era:

```bash
cargo build -p soniccraft-mcp --example stdio_server
SERVER=target/debug/examples/stdio_server
npx -y @modelcontextprotocol/inspector@2.11.0 --cli --protocol-era legacy $SERVER --method tools/list --strict
npx -y @modelcontextprotocol/inspector@2.11.0 --cli --protocol-era auto $SERVER --method initialize
npx -y @modelcontextprotocol/inspector@2.11.0 --cli --protocol-era modern $SERVER \
  --method tools/call --tool-name soniccraft_validate_timeline \
  --tool-arg path=examples/offline-demo/timeline.mock.yaml
```

Set `SONICCRAFT_LOG=debug` to see the server's logs (on stderr) when running the example.
