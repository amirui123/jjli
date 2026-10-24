# Legal And Security Notes

This is operational guidance, not legal advice.

## Library Licensing

- Motion is MIT/open source per its public positioning.
- Anime.js is MIT on GitHub.
- Lottie-web is open source, but individual animation assets may not be.
- Rive runtime/library terms and hosted/editor terms should be checked per project.
- GSAP's standard license now broadly covers commercial usage at no charge, including previously paid plugins, but any builder/editor/platform product should still review current terms before shipping.
- Remotion has its own licensing model; check commercial usage requirements before using it in paid SaaS or large-scale rendering products.

## Asset Rights

Every animation asset should have:

- Source URL or owner.
- License.
- Whether it is editable, redistributable, commercial-safe, and client-safe.
- Whether it includes generated imagery or third-party marks.

## MCP Security

MCP servers can carry real risk:

- Tool poisoning through hidden instructions in tool metadata.
- Prompt injection from design/doc/web content.
- Excessive read/write/shell permissions.
- OAuth scope creep.
- Supply-chain risk from unofficial servers.

## Recommended Policy

- Prefer official MCP servers for Figma, Canva, Remotion, GitHub, and Vercel.
- Review unofficial MCP source before install.
- Avoid broad filesystem access unless the server is local and trusted.
- Keep secret-reading tools separate from design/content tools.
- Log tool calls for any MCP that writes files, posts externally, or deploys.
- Pin versions for production workflows.

