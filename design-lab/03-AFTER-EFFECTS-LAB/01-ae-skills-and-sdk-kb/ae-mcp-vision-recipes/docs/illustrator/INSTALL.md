# Installing

## Requirements

- **Illustrator 2023 (27.0) or later.** Items are addressed by `PageItem.uuid`,
  which older versions do not have. Measured on 30.8.1 (Illustrator 2026);
  27.x-29.x are expected to work but have not been checked.
- macOS or Windows 10/11.
- For Claude Desktop, or any client that needs the stdio bridge: **Node.js 18+**.

## Install

Illustrator support ships in the same extension as After Effects - one install
covers both apps. Use the installer or dev install described in the main
[INSTALL.md](../INSTALL.md), then restart Illustrator.

Each app runs its own server, so both can be open at once without conflict:

| | After Effects | Illustrator |
|---|---|---|
| Port | 8791 | 8792 |
| Token | `~/.ae-mcp-vision/token` | `~/.illustrator-mcp-vision/token` |
| Panel | Window > Extensions > AE MCP Vision | Window > Extensions > Illustrator MCP Vision |
| Tools | `ae_*` | `ai_*` |

## When the server starts

The server starts the first time Illustrator becomes the **frontmost app** after
launching, not at launch itself. Measured on 30.8.1: launched in the background,
Illustrator ran with nothing on port 8792 until it was brought to the front; the
server was up within seconds of that. In normal use you click into
Illustrator anyway. If you launch it from a script, activate it too:

```bash
osascript -e 'tell application "Adobe Illustrator" to activate'
```

No panel needs to be open. **Window > Extensions > Illustrator MCP Vision**
shows status and a ready-to-paste config for each client.

## Connect a client

**Your token** is in `~/.illustrator-mcp-vision/token` on macOS and
`%USERPROFILE%\.illustrator-mcp-vision\token` on Windows. It is created the
first time the server starts and persists across restarts.

### Claude Code

```bash
claude mcp add --transport http --scope user illustrator-vision http://127.0.0.1:8792/mcp --header "Authorization: Bearer $(cat ~/.illustrator-mcp-vision/token)"
```

Keep it on one line. In PowerShell use `$(Get-Content ~/.illustrator-mcp-vision/token)`.

### Claude Desktop

Claude Desktop's config file only launches stdio servers, so it reaches this
HTTP server through [`mcp-remote`](https://github.com/geelen/mcp-remote). Open
**Settings > Developer > Edit Config** and add:

```json
{
  "mcpServers": {
    "illustrator-vision": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://127.0.0.1:8792/mcp",
               "--header", "Authorization:${AUTH_HEADER}",
               "--transport", "http-only"],
      "env": { "AUTH_HEADER": "Bearer <token>" }
    }
  }
}
```

The token goes in `env` because some clients mangle spaces inside arguments.

### Codex and the ChatGPT desktop app

In `~/.codex/config.toml`:

```toml
[mcp_servers.illustrator_vision]
url = "http://127.0.0.1:8792/mcp"
http_headers = { Authorization = "Bearer <token>" }
```

Use the static header, not `bearer_token_env_var`: the IDE extension and the
desktop app are not launched from a shell, so an environment variable never
reaches them.

### Anything else

| Setting | Value |
|---|---|
| Transport | Streamable HTTP |
| URL | `http://127.0.0.1:8792/mcp` |
| Header | `Authorization: Bearer <token>` |

Nothing that runs in a browser tab or on someone else's server can reach it: it
listens only on your machine and refuses web origins.

## Check it works

```bash
curl -H "Authorization: Bearer $(cat ~/.illustrator-mcp-vision/token)" http://127.0.0.1:8792/health
./test/verify-live-illustrator.sh   # the whole stack; uses a scratch document it closes itself
```

## Troubleshooting

**Nothing listening on 8792.** Illustrator is not running, or has not been
brought to the front since it launched - see *When the server starts*.

**401 Unauthorized.** Your config's token does not match the token file, most
often because `~/.illustrator-mcp-vision/` was deleted. Copy the current one in.

**Port 8792 is taken.** Illustrator reads `ILLUSTRATOR_MCP_PORT` from its own
environment. On macOS use `launchctl setenv ILLUSTRATOR_MCP_PORT 8795` and
restart Illustrator; update your client's URL to match.

**A call hangs and then times out.** A modal dialog is waiting in Illustrator.
Every op suppresses alerts, so this should not happen - dismiss it and treat it
as a bug. One known slow call that is not a hang: enumerating every installed
font, which is why `ai_query fonts` requires a name filter.

**Boot problems.** The headless extension writes `boot.log` to
`$TMPDIR/illustrator-mcp-vision/`, and CEP logs to `~/Library/Logs/CSXS/`.

## Uninstalling

Uninstalling the extension removes it from both apps - see the main
[INSTALL.md](../INSTALL.md#uninstalling). Delete `~/.illustrator-mcp-vision/`
to remove the Illustrator token, and remove the server from your client's
config.
