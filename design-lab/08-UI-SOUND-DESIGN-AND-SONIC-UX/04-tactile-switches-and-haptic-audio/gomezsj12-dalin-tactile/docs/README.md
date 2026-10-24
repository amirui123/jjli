# docs/: @dalin/tactile

Living documentation for the library: architecture, the code-review process, the
findings catalogue, and the operational history. **Docs are living**: findings are
never deleted (their status is updated), errors are logged forever, and every review
is a dated session log in [`reviews/`](./reviews/).

All docs here are **local to this repo** (no cross-repo dependencies) so an agent or
developer can work from `dalin-tactile/` alone.

## Documentation index

| File | Purpose | Audience |
|------|---------|----------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System map: the three channels, the backend swap seam, the instance lifecycle, file map, entry points, SSR model | All agents and developers |
| [`STACK_DECISIONS.md`](./STACK_DECISIONS.md) | Why each pick was made (zero-dep, `tsc`-only, committed `dist/`, Capacitor-shaped API) and what was rejected | Before proposing a stack change |
| [`CODE_REVIEW.md`](./CODE_REVIEW.md) | The code-review **process**: phased checklists, anti-patterns for a browser feedback library, per-model agent guidance | All agents and developers |
| [`code-audit.md`](./code-audit.md) | Catalogued findings (`AUDIT-NNN`) with severity, file, recommendation and status, plus a "Verified sound" section | Agents implementing fixes |
| [`error-log.md`](./error-log.md) | Known errors + resolutions (`ERR-NNN`), incl. the iOS audio-unlock lessons | Agents debugging issues |
| [`DEFERRED.md`](./DEFERRED.md) | Deliberately out-of-scope work (npm publish, native backend, `dispose()`, React hook) | Before building any of those |
| [`TOOLING.md`](./TOOLING.md) | MCP servers, CLIs, npm scripts/gates, recommended additions | All agents |
| [`change-log.md`](./change-log.md) | What changed, when, and why | All agents and developers |
| [`reviews/`](./reviews/) | Individual code-review session logs (timestamped) | Review auditing |

Root-level complements:

| File | Purpose |
|------|---------|
| [`../AGENTS.md`](../AGENTS.md) | Full agent guide: critical warnings, before/while/after rules, per-model guidance, git hygiene, key-files table |
| [`../CLAUDE.md`](../CLAUDE.md) | One-page entry point for Claude Code (points to `AGENTS.md`) |
| [`../README.md`](../README.md) | The public, consumer-facing README |
| [`../ROADMAP.md`](../ROADMAP.md) | Shipped / next / later |

## How docs stay current

1. **Before changing code.** Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) and
   [`code-audit.md`](./code-audit.md) so you understand the system and known issues.
2. **After changing `src/`.** Update any docs your change invalidates (architecture,
   change-log, error-log, audit-finding status). **Rebuild and commit `dist/`**, because it's
   the committed build output GitHub installs pull, and CI fails on a stale `dist/`.
3. **After a code review.** Create a new session log in [`reviews/`](./reviews/) with
   a timestamped filename, and add/update findings in [`code-audit.md`](./code-audit.md).
4. **When you find or fix a bug.** Log it in [`error-log.md`](./error-log.md).

## Naming conventions

- **Review session logs:** `reviews/YYYY-MM-DD-<short-description>.md`
- **Audit findings:** `AUDIT-NNN`, sequential, never reused. The `// AUDIT-NNN`
  locator comment in source is the durable anchor (line numbers drift).
- **Errors:** `ERR-NNN`, sequential, never reused.

## For new agents joining this project

1. Read [`../AGENTS.md`](../AGENTS.md) first, for the critical warnings + the platform-reality
   rules (no real web haptics API; iOS is fragile; SSR-safety; committed `dist/`).
2. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the channel model and lifecycle.
3. Read [`code-audit.md`](./code-audit.md) for open findings before writing code.
4. Read [`CODE_REVIEW.md`](./CODE_REVIEW.md) for the review process and anti-patterns.
5. Check [`reviews/`](./reviews/) for the most recent session log.
