# Contributing

Thanks for looking. Small PRs are very welcome.

## Getting started

```bash
git clone https://github.com/eklavya2201/breakinggood
cd breakinggood
npm install
npm run build
npm test
node dist/cli.js https://github.com/expressjs/express --scan-only
```

Node 20+. Site mode needs Chrome or Edge installed (it drives your own browser via playwright-core).

## Where things live

- `src/repo/` covers repo mode: stack detection (`detect-stack.ts`), safety scan (`scan.ts`), run (`run.ts`)
- `src/site/` covers site mode: capture (`capture.ts`) and the generate prompt (`generate.ts`)
- `src/ai/` holds the providers. They all implement the small interface in `provider.ts`
- `src/mcp.ts` is the MCP server

## Picking something

Look at [good first issues](https://github.com/eklavya2201/breakinggood/labels/good%20first%20issue). Comment on one and I'll assign it to you, usually within a day.

One person per issue. If an issue already has an assignee, pick another one, since there are plenty. Wait until you're assigned before opening a PR. If an assigned issue sees no activity for 7 days, it goes back to the pool.

## PRs

- One thing per PR. Add a test if the code is testable (node:test, see `src/repo/scan.test.ts`).
- `npm test` must pass. CI runs on Linux, macOS and Windows.
- If you switch between branches, `rm -rf dist` first. Stale compiled tests cause confusing failures.
- Keep the heuristics boring and predictable. The AI planner handles the weird cases.

Hacktoberfest PRs are welcome. Merged PRs get the `hacktoberfest-accepted` label.
