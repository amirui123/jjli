# AGENTS.md — coss.com monorepo

coss.com is a unified developer platform: one API key + one SDK (`coss.email.send()`, `coss.sms.send()`, later
video, scheduling…). This repo holds the dashboard, the public API, shared packages and the public SDK.
Email delivery goes through the provider interface in `packages/email/src/provider.ts` (Amazon SES v2 with one SES
tenant per organization, or the fake provider); sandbox environments always use the fake provider. Delivery events
drive per-recipient status and signed customer webhooks. Environments also receive email (an SES receipt rule → S3 +
SQS → the worker; see `packages/email/AGENTS.md`). A sample of live messages is screened by an AI decision model
(`@coss/screening`) before it is sent. SMS (`@coss/sms`) goes through Twilio — Cal.com's ISV account, one subaccount
per organization, US A2P 10DLC and toll-free registration of each organization's numbers — with status and inbound
callbacks to the API (`/sms/twilio/*`); see `packages/sms/AGENTS.md`. Plans, contracts, metered usage, credits and invoices are `@coss/billing`
(coss.com rates usage itself; Stripe, behind a provider interface, only collects). Rate limits (per API key, per-org send quotas, dashboard
auth) are counted in Valkey (ElastiCache Serverless in production) by `@coss/ratelimit`. Errors and traces go to
Sentry (organization `cosscom`) through `@coss/observability`. coss.com Risk (`@coss/risk`, `coss.risk.assess()`) assesses customers' sign-ups, logins and other
events: email/IP signals (`@coss/signals`), content scores, plus what each environment remembers (velocity in Valkey,
duplicate mailboxes, fraud reports, allow/block lists) and its rules become `allow`/`review`/`block` with reasons; the
signals are also building blocks of their own, next to rate limiting as a service (`coss.risk.limit()`). Human setup docs (incl. running on SES): [README.md](./README.md).

## License

`AGPL-3.0-only` (root `LICENSE`), except `packages/sdk` (MIT, its own `LICENSE`: customers bundle it), `packages/mcp`
and `packages/cli` (MIT, published with the SDK), the Claude Code plugin and Agent Skill in `plugins/coss` (MIT, its
own `LICENSE`: installed into customers' agents), the framework drivers in `integrations/*` (MIT, each with its own
`LICENSE`), the generated SDKs in `sdks/*` (MIT, each with its own `LICENSE`), `packages/kloq` (MIT, vendored) and
the fonts (OFL). New code is AGPL unless it lives in one of those; never copy AGPL code into the SDK, the MCP server,
the CLI, the plugin, the drivers or the generated SDKs. Outside contributors sign the CLA (`CLA.md`, enforced by cla-assistant.io on pull requests; the agreement
text it shows is a gist that must match `CLA.md`: change both together, as a new version).

## Layout

| Path | Package | What |
|---|---|---|
| `apps/web` | `@coss/web` | Next.js 16 dashboard (:3000). Hosts Better Auth at `/api/auth/*`. |
| `apps/api` | `@coss/api` | Hono on Bun public API (:3001): `/v1/*`, `/openapi.json`, `/health`. Commits its OpenAPI document as `openapi.json`. |
| `apps/site` | `@coss/site` | coss.com (:3002): placeholder landing page, Shipyard's landing page and docs at `/shipyard`, kloq's pages at `/kloq` (landing page, demo, tools, comparisons, docs, shadcn registry) + Fumadocs docs at `/docs` (guides, Twoslash-checked SDK docs, API reference generated from `apps/api/openapi.json`). See `apps/site/AGENTS.md`. |
| `apps/portal` | `@coss/portal` | The Hooks portal (:3003) on its own domain (production: `portal.cosshooks.com`, Cloudflare → ALB, `PORTAL_HOST` in `infra/aws/routing.ts`): customers' users manage one application's endpoints and see its deliveries, signed in by a session the customer's backend creates (token in the URL fragment, never a cookie). See `apps/portal/AGENTS.md`. |
| `apps/mobile` | `@coss/mobile` | Expo (SDK 57) iOS companion app mirroring the dashboard's pages (organization: projects, reputation, domains with DMARC, dedicated IPs, SMS senders, members, spend and budgets, settings with SSO and SCIM, billing and plans, audit log; environment: emails, templates, received, suppressions, tracking, content storage, SMS, broadcasts, contacts, audiences, segments, topics, marketing settings, risk with its rules, lists and settings, Hooks, API keys, webhooks, logs, log drains), mostly read-only, signed in through the dashboard (browser hand-off + PKCE) and using its `/api/mobile/v1/*`, with push notifications (APNs) for alerts. Not deployed by `infra`. See `apps/mobile/AGENTS.md`. |
| `apps/smtp` | `@coss/smtp` | Bun SMTP relay (`smtp.coss.com`; locally :2465 implicit TLS, :2587 STARTTLS) on `smtp-server`: username `coss`, an API key as the password; each message becomes a `POST /v1/emails` request (`@coss/email/smtp`) stored through the same email service, rate limits and quotas. Behind an NLB; terminates TLS itself (exported ACM certificate). See `apps/smtp/AGENTS.md`. |
| `apps/worker` | `@coss/worker` | Bun background worker: email dispatch (pg-boss), scheduled sends, broadcast fan-out, webhook deliveries, domain re-checks, dedicated IP pools, stale-claim/unclaimed sweeps, data retention purges, organization deletions, SES events and received emails from SQS (`EMAIL_PROVIDER=ses`). `scripts/ses-bootstrap.ts`. Safe to run several. |
| `packages/db` | `@coss/db` | Drizzle schema (generated Better Auth tables + domain tables), pg client, TypeIDs, migrations, test guard; `./jobs` (pg-boss); `./idempotency` (`withIdempotencyKey`, request hashes); `./partitions` (daily range partitions: create ahead, drop expired). |
| `packages/signals` | `@coss/signals` | Stateless abuse signals shared by coss.com's sign-up and risk: `./email` (syntax, disposable domains, MX/null-MX/NXDOMAIN with a cache, canonical mailbox, role accounts, free providers, typo suggestions), `./ip` (bogons, subnets, CIDR range sets, `IpIntelligence`: Tor, cloud/hosting networks, ASN, country), `./datasets` (parsers for the public IP feeds and IPinfo Lite's MMDB), `./testing` (`buildTestMmdb`). No workspace deps, no database; server-only. |
| `packages/auth` | `@coss/auth` | Better Auth options/instance (organization, admin, api-key, two-factor, passkey, sso, scim, captcha plugins), org permissions, slug rules, API key permissions (`./api-key-permissions`: the labelled catalog, access presets, validation; client-safe), the sign-up email guard (`src/email-guard.ts`, built on `@coss/signals/email`); `./social`: Google/GitHub sign-in (server-only); `./risk`: the injected sign-up risk assessor (coss.com Risk on coss.com's own sign-ups); `./sso`: SSO trust rules; `./scim`: directory sync rules (both server-only); `./emails`: the account email outbox; `./mobile`: the iOS app's sign-in (PKCE codes, bearer sessions; server-only). See `packages/auth/AGENTS.md`. |
| `packages/tenancy` | `@coss/tenancy` | Projects, environments, environment-bound API keys (create/authenticate), memberships, organization SSO settings, directory sync (SCIM) connections and group roles, seed/admin scripts, test fixtures; `./admin`: suspensions, SSO/SCIM recovery, organization deletion, audit log and cross-org reads; `./deletion`: organization teardown (imports only `@coss/db`). See `packages/tenancy/AGENTS.md`. |
| `packages/email` | `@coss/email` | Email product: wire schemas, providers (fake, SES under `./ses`), send/dispatch/read, recipients + event ingestion, domains/DNS (with the BIMI check), custom tracking domains (Cloudflare for SaaS), dedicated IP pools (SES managed dedicated IPs, `dedicated-ips.ts`), receiving (received emails, receiving domains, managed inbound addresses, the content store), DMARC reports (ingestion, guidance to `p=reject`, owner notifications), templates (drafts, versions, locales, rendering at send), tenants, sweeps, contacts (custom properties, audiences, segments, topics, marketing settings; wire schemas in `./contact-schemas`), broadcasts (wire schemas in `./broadcast-schemas`); `./templates` (the template language: parse, check, render, variable validation; client-safe, no imports), `./domain-connect` (one-click DNS setup: discovery, the signed apply link, `domain-connect/coss.com.email.json`), `./dispatch` (pg-boss queue + worker handler), `./runtime` builds providers from env, `./admin` (the admin console's cross-org reads), `./env` (zod only), `./testing`. See `packages/email/AGENTS.md`. |
| `packages/ratelimit` | `@coss/ratelimit` | Rate limits: bucket catalog, GCRA in Valkey (Lua) or memory, per-org overrides (`rate_limit_override`), client IP resolution; `./env` (zod only), `./testing`. `scripts/valkey-bootstrap.ts`, `scripts/set-override.ts`. |
| `packages/webhooks` | `@coss/webhooks` | Product-agnostic webhooks: endpoints (secrets encrypted with a key ring, secret rolls), outbox, SSRF-safe signed delivery with retries, secret re-encryption, endpoint auto-disable and recovery; log drains (management, signed NDJSON batch delivery, retention); `./engine` (the delivery engine shared by every product: holds, lease fencing, retry outcomes, the HTTP attempt, endpoint health, a bounded runner); `./schemas`, `./env` (zod only). See `packages/webhooks/AGENTS.md`. |
| `packages/reputation` | `@coss/reputation` | Reputation guard: per-org standing (`good`/`warning`/`suspended`), history, pluggable checks, the worker's evaluation scan, admin reinstatement, `account.*` webhooks, notification emails to owners/admins (outbox + `ReputationNotifier`); `./schemas` (zod only: policy, wire schemas, trigger labels). See `packages/reputation/AGENTS.md`. |
| `packages/hooks` | `@coss/hooks` | Hooks, webhooks as a service: applications (one per customer's end user, by id or `uid`), event types, endpoints (own secrets, filters, rate limits, auto-disable), messages fanned out to deliveries (day-partitioned, idempotent sends), the delivery worker on the shared engine, endpoint recovery, portal sessions and settings; `./schemas`, `./env` (zod only), `./testing`. See `packages/hooks/AGENTS.md`. |
| `packages/screening` | `@coss/screening` | Product-agnostic AI content screening: sampling per org + product, the `ContentClassifier` interface (`./classifier`; content kinds `email`, `sms` and `text`, the last for risk's user content; Vercel AI SDK `experimental_decide` adapter under `./ai`, `fakeClassifier` in `./testing`), `prepareText`/`prepareLinks` (`./text`), verdict history, the `content_screening` reputation check; `./env` (zod only), `./runtime`. `./classifier`, `./text`, `./ai`, `./runtime` and `./testing` import no workspace package. See `packages/screening/AGENTS.md`. |
| `packages/risk` | `@coss/risk` | Risk assessments: `assessRisk` (signals under a time budget, scoring, decision, one transaction with the log line, mailbox identity and `risk.assessment.review` webhook), velocity (`VELOCITY_SCRIPT` in Valkey or memory), lists, feedback + fraud memory, forgetting users, IP datasets (`refreshDueDatasets` in the worker, `createIpIntelligenceSource` in the API), the building blocks (`checkEmail`, `checkIp`, `classifyContent` in `lookups.ts`), customers' rate limit buckets (`checkRiskLimit` in `limits.ts`), device tokens (`device.ts`), IP privacy data (`privacy.ts`, `ipinfoPrivacyLookup`), calibration from feedback (`calibration.ts`), sandbox fixtures, purges; `./schemas` (zod only: wire schemas, `REASONS`, `VELOCITY_RULES`, `RISK_EVENT_TYPES`), `./env` (zod only), `./runtime`, `./datasets`, `./testing`. See `packages/risk/AGENTS.md`. |
| `packages/billing` | `@coss/billing` | Plans and billing: the price catalog (`./catalog`: meters, list rates, plans, entitlements, add-ons) and contract terms (`./schemas`), both client-safe; the pure rating engine (`./engine`); accounts, contracts (self-serve and sales), hourly metered usage (`./metering`, the only module products import), credit grants and their ledger, month closes, invoices, payments, credit notes, dunning and holds, usage alerts, plan enforcement (`PlanGate`/`UsageGate` types in `./gate`), providers (fake, manual, Stripe under `./stripe`), the public API's read models and `billing.*` webhook events (wire schemas in `./wire`, client-safe); `./env` (zod only), `./runtime`, `./testing`. `scripts/seed.ts`, `scripts/close-period.ts`. See `packages/billing/AGENTS.md`. |
| `packages/migrate` | `@coss/migrate` | Imports from Resend, SendGrid and Postmark (dashboard only): provider sources (`src/sources/*.ts`, throttled `providerClient`, SendGrid's contact exports through `publicDownloader`), the worker's `runDueMigrations` (leased, resumable phases: custom fields, topics, lists, templates, contacts, list members, suppressions, webhook endpoints), template converters (`./templates`, client-safe), purges; `./testing` (`fakeSource`). Domains are created by the dashboard's start action. See `packages/migrate/AGENTS.md`. |
| `packages/observability` | `@coss/observability` | Sentry setup shared by every app: env shape (`./env`, zod only), `sentryConfig`/`sentryOptions`, PII scrubbing (`scrubEvent`), the browser init (`./browser`), the dashboard's envelope tunnel (`./tunnel`) and `withSentryConfig` options (`./build`). Takes each app's SDK; depends on no framework SDK and no workspace. |
| `packages/logs` | `@coss/logs` | Environment logs and the org audit log: the day-partitioned `log_entry` table (API requests, email events, webhook attempts), the buffered fail-open request writer, queries (keyset pages, histogram, facets, related lines, CSV/NDJSON export), partition retention, `org_audit_event`, the log drain outbox (`log_drain_record`, written by `appendLogEntries`/`recordOrgAuditEvent`); `./schemas` + `./query` (search syntax; zod only), `./testing`. See `packages/logs/AGENTS.md`. |
| `packages/versioning` | `@coss/versioning` | Dated public API versions (`Coss-Version`): `API_VERSIONS`, the `VERSION_CHANGES` registry and the engine that renders latest-shape responses/webhook payloads in older versions and upgrades older request bodies. Zero deps, client-safe; `./testing` (`testVersioning()`). |
| `packages/sms` | `@coss/sms` | SMS: wire schemas (`./schemas`, zod only; also `SMS_WEBHOOK_EVENT_TYPES`, the simulator's numbers, registration forms), segment counting (`./segments`, client-safe), sending (`createSmsService`: E.164 + country, live sender authorization, suppressions, scheduled sends, the `UsageGate` reservation by country), dispatch (`./dispatch`, pg-boss `sms-dispatch`), delivery events and metering, suppressions, receiving (STOP/START across live environments), Twilio (`./twilio`: REST client, provider, signature checks, callbacks, `FakeTwilioApi`), senders (subaccounts, the 10DLC and toll-free registration state machine, numbers, monthly fees, teardown), reputation checks, purges, `./admin`, `./env` (zod only), `./runtime`, `./testing`. See `packages/sms/AGENTS.md`. |
| `packages/push` | `@coss/push` | Push notifications to the iOS app: devices (one per app session), the outbox products enqueue into (`enqueuePush`, in the deciding transaction), recipients (role + `orgAccess`) and content resolved at send time, the worker's send loop; `./apns` (APNs over `node:http2`, ES256 provider tokens), `./schemas` (zod only: categories, kinds, registration), `./testing` (`FakePushSender`, `createTestPushDevice`). See `packages/push/AGENTS.md`. |
| `packages/companion` | `@coss/companion` | Wire types of the dashboard's iOS app API (`/api/mobile/v1/*`): plain TypeScript types, zero deps, client-safe. |
| `packages/retention` | `@coss/retention` | The data retention policy: `RETENTION_POLICY` (published by the docs and the dashboard) and `RETENTION_DAYS` (enforced by each package's purge, run by the worker). Zero deps, client-safe. |
| `packages/ui` | `@coss/ui` | coss ui components (shadcn `@coss` registry, Base UI) + `theme.css` (tokens), `globals.css` (the dashboard's stylesheet) and `./fonts` (`next/font/local`: Cal Sans as `fontSans`/`fontHeading` and, upright only, `fontCalSans`; Paper Mono as `fontMono`). |
| `packages/sdk` | `coss` | **Public** SDK. Zero deps, ESM-only, built with tsdown. `coss/device` is its browser-only entry (risk's device tokens); `coss/diagnose` explains an email's delivery (used by the MCP server and the CLI); `coss/nodemailer`, `coss/better-auth` and `coss/authjs` are the integrations (docs: `/docs/integrations`). |
| `packages/mcp` | `coss-mcp` | **Public** MCP server (`npx coss-mcp`, stdio, Node): tools for coding agents built only on the published `coss` SDK — search and read the docs (no key needed), find emails and diagnose delivery (the SDK's `coss/diagnose`), send, suppressions, domains, webhook deliveries, received emails, logs, account status. See "MCP server" below. |
| `plugins/coss` | — | **Public** Claude Code plugin (marketplace: the root `.claude-plugin/marketplace.json`; `/plugin install coss --marketplace cosscom/coss`) with the `coss` Agent Skill (`skills/coss/SKILL.md`, also installed into other agents by `npx skills add cosscom/coss`) and the MCP server (`.mcp.json`, `npx -y coss-mcp`). Plain files, not a workspace; served from main. See "Coding agents" below. |
| `packages/cli` | `coss-cli` | **Public** CLI (`npm i -g coss-cli`, command `coss`, Node): `login` (browser PKCE or `--manual`), `logout`, `whoami`, `emails send`, `logs tail`, `listen` (forwards webhook events to localhost), built only on the published `coss` SDK. See "CLI" below. |
| `packages/kloq` | `kloq` | The kloq library (the `cosscom/calendar` repository's `packages/kloq/src`, tests left out): the `<Kloq>` calendar, its themes, settings dialog, design mode and stylesheet. Vendored (excluded from Biome, `noUncheckedIndexedAccess` off); also what `/kloq/r/kloq.json` serves as source. Used only by `apps/site`. |
| `tooling/typescript` | `@coss/tsconfig` | Shared tsconfig bases. |
| `tooling/sdkgen` | `@coss/sdkgen` | Builds the generated SDKs: `SDK_METHODS` (every operation's SDK method, named as in the TypeScript SDK) and `NO_RETRY` (`src/methods.ts`), the derive step that turns `apps/api/openapi.json` into the spec Fern generates from (`src/derive.ts`), the post-processing of each generator's output (`src/languages.ts`), the API reference's code samples (`snippets.json`, from each SDK's `reference.md`); `scripts/generate.ts` (`bun run sdks:generate`, needs Docker). See `sdks/AGENTS.md`. |
| `sdks/{python,go,ruby,php,java,dotnet}` | `cosscom` (PyPI, `import coss`), `github.com/cosscom/coss-go`, `coss` (gem), `coss/coss` (Composer), `com.coss:coss` (Maven), `Coss` (NuGet) | **Public** SDKs generated from the OpenAPI document by Fern's open-source generators (`sdks/fern/generators.yml`), each with a few hand-written files kept by its `.fernignore` (webhook verification, tests, metadata). Not workspaces. Regenerated on main by the "Regenerate SDKs" PR; released by `release-sdks.yml`. See `sdks/AGENTS.md`. |
| `integrations/{laravel,rails,django}` | `coss/laravel`, `coss-rails`, `coss-django` | **Public** framework mail drivers (PHP/Composer, Ruby gem, Python/PyPI), each sending its framework's messages to `POST /v1/emails` with a small HTTP client of its own. Not Bun workspaces (turbo, Biome and the images never see them). Shared rules in `integrations/README.md`, shared test scenarios in `integrations/conformance/*.json`. |
| `infra` | `@coss/infra` | AWS deployment spec (ECS services, env vars, ALB rules, CloudFront behaviours), checked by tests, and the production Terraform + deploy scripts that apply it. See `infra/AGENTS.md`. |

Runtime dependencies: `observability` (no workspace deps) ← `api`, `worker`, `web`, `site`, `portal`, `smtp`, `infra`; `signals` (no workspace deps) ← `auth`, `webhooks`, `risk`; `db ← auth ← tenancy`,
`db ← logs ← webhooks ← risk` (`risk` also `→ signals, ratelimit, retention, screening` — only screening's DB-free `./classifier`, `./text`, `./runtime`, `./testing`; `email` imports only `@coss/risk/schemas`, for `WEBHOOK_EVENT_TYPES`), `db ← logs ← webhooks ← reputation ← screening ← email`, `webhooks ← sms → billing, reputation, retention, versioning` (`email` imports only `@coss/sms/schemas`, for `WEBHOOK_EVENT_TYPES`; screening is injected), `reputation ← hooks`, `db ← ratelimit`, `db ← push ← webhooks, hooks, reputation, billing, risk, worker, web` (`push` also `→ retention` and only `@coss/auth/{permissions,org-access}`), `email, webhooks, logs, retention ← migrate` (`billing` only `./gate` types), `webhooks ← billing ← email` (packages take
`billing`'s plan checks injected — `PlanGate`, `UsageGate`, and in webhooks the structural `WebhookPlanLimits`, since
billing enqueues `billing.*` events through it — and email imports only `./metering`, `./gate` and `./wire`); `versioning` (no deps) ← `tenancy`, `webhooks`, `email`, `billing` (`schemas`/`wire` examples);
`retention` (no deps) ← `tenancy`, `webhooks`, `reputation`, `screening`, `email`, `hooks`, `billing`, `push`, `worker`, `web`, `site`, `mobile`;
`api → tenancy, email, sms, hooks, reputation, webhooks, ratelimit, versioning, logs, billing, risk, screening (`./env` only), db`;
`smtp → tenancy, email, ratelimit, logs, billing, observability, db`;
`web → auth, tenancy, email, sms, hooks, reputation, screening, webhooks, ratelimit, versioning, retention, logs, billing, risk, push, migrate, companion, db, ui`; `mobile → companion` (types only; a dev dependency), `retention` (bundled by Metro: keep it dependency-free); `portal → hooks, webhooks, ratelimit, logs, observability, db, ui`; `site → ui, auth, versioning, retention, billing, risk, sdkgen` (only the client-safe `@coss/auth/{slugs,constants,api-key-permissions}`, the changelog, the retention policy, `@coss/billing/{catalog,money,engine}`, `@coss/risk/schemas` and `@coss/sdkgen`'s `snippets.json` + `./methods`) +
`@coss/api/openapi.json` (data only, never api code); `sdkgen → @coss/api/openapi.json` (data only); `infra → auth, email, sms, hooks, ratelimit, screening, billing` (`slugs`, `env` only);
`worker → auth (`./emails` only), email, sms, hooks, reputation, screening, webhooks, ratelimit, logs, risk, push, migrate, tenancy, retention, billing, db` (from tenancy only `./retention` and `./deletion`, which import nothing but `db`); `sdk`, `ui`, `kloq` and `companion` depend on no workspace (`site → kloq`); `mcp` and `cli` depend only on the published `coss` (a
semver range, not `workspace:`).
Dev-only: `email`/`sms`/`webhooks`/`hooks`/`reputation`/`screening`/`ratelimit`/`logs`/`billing`/`risk`/`push`/`migrate`/`worker → tenancy` (test fixtures — so tenancy and auth must never import email, webhooks, screening, ratelimit, logs or billing (plan limits reach Better Auth through `setMembershipLimitResolver` from `@coss/auth/limits`); Better Auth's own audit events reach the log through `setOrgAuditRecorder` from `@coss/auth/audit`) and
`api`/`worker`/`site → coss` and `api → coss-mcp`, `coss-cli` (SDK, MCP and CLI contract tests and the docs' Twoslash snippets — turbo builds the SDK before their
`typecheck`/`test`, and before the site's `dev`/`build`). `web → coss` is a runtime dependency: the sign-up form sends
`coss/device`'s token (turbo builds the SDK before the dashboard's `dev`/`build` too).

## Commands (repo root)

Prerequisites: Bun (version in `packageManager`), Node ≥ 24, Postgres with `coss` and `coss_test` databases,
Valkey (or Redis) at `TEST_VALKEY_URL` for the ratelimit/api tests.

```sh
bun install                 # never npm/pnpm/yarn
bun run dev                 # web :3000 + api :3001 + site :3002 + portal :3003 + smtp :2465/:2587 + worker (turbo TUI; agents: bunx turbo run dev --ui=stream)
bun run --cwd apps/mobile ios  # the iOS app on the Simulator (Xcode; needs `bun run dev` for the dashboard)
bun run lint                # biome ci .            bun run format → biome check --write .
bun run typecheck           # tsc --noEmit per workspace (TS 7); web runs `next typegen` first; builds the SDK first
bun run test                # migrates TEST_DATABASE_URL, then `bun test` in every workspace (uncached; SDK built first)
bun run build               # next build + SDK build (tsdown, publint, attw)
bun run db:generate         # drizzle-kit generate after editing packages/db/src/schema/*.ts (or after auth:generate)
bun run db:migrate          # apply migrations + install/upgrade the pg-boss schema on DATABASE_URL
                            #   (db:migrate:test → TEST_DATABASE_URL); db:studio
bun run auth:generate       # regenerate packages/db/src/schema/auth.ts after changing Better Auth plugins/options,
                            #   then bun run db:generate && bun run db:migrate
bun run signals:update-disposable  # refresh the vendored disposable-domain list (review the diff before committing)
bun run openapi:generate    # rewrite apps/api/openapi.json after changing API routes (a test fails when stale)
bun run sdks:generate       # regenerate sdks/* from it (Docker; [--lang python,go,…]); main's "Regenerate SDKs" PR
                            #   does this, so API pull requests don't need to
bun run changeset           # describe an SDK, MCP server or CLI change (CI requires one when
                            #   packages/{sdk,mcp,cli}/src changes; --empty if none)
bun run version-packages    # apply changesets: bump the SDK's (and coss-mcp's, coss-cli's) package.json, src/version.ts,
                            #   CHANGELOG.md, bun.lock
                            #   (CI's Release workflow opens a "Version packages" PR doing this; merging it publishes to npm)
bun run db:seed             # idempotent demo data; mints a new development (coss_test_) key on every run
bun run admin:create --email you@example.com   # promote an existing user to platform admin (also how the
                                               #   first admin is bootstrapped in production)
bun run domain-connect:key --key-id _dck1     # a Domain Connect signing key + the TXT records of its
                                               #   public half (--from-env: the configured key's records)
AWS_REGION=… bun run ses:bootstrap             # idempotently create the shared SES/SNS/SQS/EventBridge resources,
                                               #   per-app IAM policies and (--alert-email) queue alarms, and
                                               #   print the SES env vars (needs AWS admin credentials)
AWS_REGION=… bun run valkey:bootstrap --subnet-ids … --security-group-ids …
                                               # idempotently create the ElastiCache Serverless (Valkey)
                                               #   cache, its user + user group; prints VALKEY_URL
bun run ratelimit:set --org acme [--bucket api.read --limit 100 [--period 1s] [--burst 200] | --reset]
                                               # show/change an org's rate limit overrides (~1 min to apply;
                                               #   not audited — prefer the admin console's organization page)
bun run --cwd apps/worker hooks:load [--applications 20 --endpoints 3 --messages 2000]
                                               # Hooks load test on the test database: send and
                                               #   delivery throughput, the claim query's plan
bun run webhooks:reencrypt [--dry-run]         # re-encrypt webhook endpoint secrets with the first
                                               #   WEBHOOK_SECRETS_KEY (step 3 of a key rotation, README)
bun run billing:close-period --org acme [--at 2026-11-01T00:20:00Z]
                                               # development only: close billing months as if it were --at
                                               #   (see this month's invoice early); the worker collects it
```

Single package: `bun run --cwd <pkg> test [filter]` (after `bun run db:migrate:test` once). Don't run bare `bun test`
from the root or a package — the package script is what loads `.env` and the test-DB preload.

**Before committing**, run what CI (`.github/workflows/ci.yml`, Postgres 18, no `.env`) runs:
`bun run lint && bun run typecheck && bun run test && bun run build`. After changing `integrations/<driver>` also
run its own lint and tests (CI's `integrations` job): `composer lint && composer test` (Laravel),
`bundle exec rubocop && bundle exec rake test` (Rails), `uv run ruff check && uv run ruff format --check && uv run
pytest` (Django); their end-to-end tests run when `COSS_E2E` holds the line `bun run --cwd apps/api serve:test` prints.

**Remote cache** (README, "Remote cache"): `typecheck` and `build` results are uploaded to Turbo's Vercel Remote Cache
(team `cal`, signed) and CI replays any task whose hash it finds, so running the commands above also makes CI fast.
Each machine is set up once by a human (`turbo login`, `~/.config/coss/turbo.env` loaded from the shell profile). If
a `turbo` run's header says `Remote caching disabled` or `unavailable`, tell the user the machine isn't set up and
point them at that README section — never run `turbo login`, create Vercel tokens, or write `TURBO_*` values into
`.env`, a commit or a log yourself. Keep task outputs machine-independent and keep `globalEnv` to build-affecting
variables (`infra/test` enforces the list): a hash that differs between laptops and CI silently turns the cache off.

## Conventions

- **Wire format is snake_case** (`reply_to`, `created_at`); internal code is camelCase. The SDK's wire types are
  hand-written mirrors (`packages/sdk/src/types/*.ts`), checked against the zod schemas by `apps/api/test/contract-types.ts`
  (typecheck) and `apps/api/test/sdk-contract.test.ts` (built SDK vs. the in-process app). Change both sides together.
- **IDs are TypeIDs** stored as `text` (`<prefix>_<26-char base32 UUIDv7>`, e.g. `email_01k…`). Prefixes live in
  `ID_PREFIXES` (`packages/db/src/id.ts`; Better Auth's `invitation` → `invite`, `apikey` → `key`). Use
  `newId(ID_PREFIXES.x)` / `isId()` from `@coss/db/id`. Domain tables generate ids app-side (`$defaultFn`), so raw SQL
  inserts must supply one. Better Auth uses `generateAuthId` (`MODEL_ID_PREFIX` in `packages/auth/src/options.ts`) —
  a new Better Auth model needs an entry there or it falls back to `id_…`.
- Internal packages are **just-in-time TypeScript** (`exports` point at `.ts`, no build). Relative imports use explicit
  `.ts` extensions in `packages/*` and `apps/api`; `apps/web` uses extensionless imports and the `@/*` alias;
  `packages/ui` imports itself via `@coss/ui/*` (shadcn aliases). A new internal package used by the dashboard must be
  added to `transpilePackages` in `apps/web/next.config.ts`.
- Every workspace declares every dependency it imports or extends (Bun isolated linker). Versions shared by several
  workspaces live in the root `workspaces.catalog` (`"catalog:"`); single-use deps may pin directly. The SDK uses explicit
  versions mirroring the catalog (no `workspace:`/`catalog:`) — bump both together.
- Env: one root `.env` (copy `.env.example`). Package scripts load it with `--env-file=../../.env` (a missing file is a
  no-op, so real env vars win in CI/production; images never contain one, see `.dockerignore`); `process.loadEnvFile` loads it for Next (`apps/web/load-root-env.ts`,
  imported first by `next.config.ts`) and drizzle-kit (`packages/db/drizzle.config.ts`). Packages don't validate env but
  **read it at import time** (`@coss/db` builds its pool from `DATABASE_URL`; `@coss/auth/options` reads `BETTER_AUTH_*`),
  so load env before importing them. Apps validate with t3-env (`apps/api/src/env.ts` — imported only by `src/index.ts`;
  `apps/web/src/env.ts` — imported by `next.config.ts` for dev/build and by `src/instrumentation.ts` when a server
  starts: the standalone server never runs `next.config.ts`). No `NEXT_PUBLIC_*` variables: they are inlined at build
  time, and images are built once for every stage.
- Library docs matching the installed versions live in the consuming workspace's `node_modules` (isolated linker):
  Next `apps/web/node_modules/next/dist/docs/` (see `apps/web/AGENTS.md`), Base UI
  `packages/ui/node_modules/@base-ui/react/docs/`, Turborepo `node_modules/turbo/docs/` (block at the end of this file).
  Read them before relying on memory.

## Environment variables

| Var | Used by |
|---|---|
| `DATABASE_URL` | `@coss/db` pool, drizzle-kit, migrations; validated by api + web |
| `TEST_DATABASE_URL` | must name a `*_test` database; swapped in by `@coss/db/testing`; `db:migrate:test` |
| `DATABASE_POOL_MAX` | optional pg pool size (default 10) |
| `BETTER_AUTH_SECRET` (≥ 32 chars), `BETTER_AUTH_URL` | `packages/auth/src/options.ts` (base URL, trusted origin, invitation links); `BETTER_AUTH_URL` also `apps/worker` (dashboard links in notification emails) |
| `PORTAL_PUBLIC_URL` | api, web ("Open portal"): origin of the Hooks portal (`apps/portal`, its own registrable domain); portal session links point there. Default `http://localhost:3003` outside production |
| `API_PORT`, `API_PUBLIC_URL` | `apps/api` (port; OpenAPI `servers` and email tracking URLs, falls back to the request origin outside production); `API_PUBLIC_URL` also `apps/worker` (email tracking) and `apps/web` (quick-start snippets, read at runtime) |
| `API_CORS_ORIGINS` | `apps/api`: comma-separated browser origins allowed on `/v1/*` (the docs' playground); default `https://coss.com`, locally `http://localhost:3002` |
| `EMAIL_PROVIDER` | api, web, worker: provider for live environments (`fake` or `ses`); shape in `@coss/email/env` |
| `AWS_REGION`, `SES_CONFIGURATION_SET`, `SES_TENANT_PREFIX` | required with `EMAIL_PROVIDER=ses` (api, web, worker); printed by `ses:bootstrap`. The marketing stream's configuration set is derived (`<SES_CONFIGURATION_SET>-marketing`); the prefix is at most 23 characters. AWS credentials come from the default chain (`globalPassThroughEnv` in `turbo.json`) |
| `TRACKING_DOMAIN_PROVIDER`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `TRACKING_CNAME_TARGET` | api, web, worker: custom tracking domains (`fake` default, or `cloudflare`: Cloudflare for SaaS custom hostnames on the cosslinks.com zone, which needs the token and zone id); customers CNAME to `TRACKING_CNAME_TARGET` (default `track.cosslinks.com`); shape in `@coss/email/env` |
| `TRACKING_PUBLIC_URL` | api + worker + smtp: origin of the open/click tracking links in emails (default `API_PUBLIC_URL`; smtp: required in production, locally `http://localhost:3001`); production `https://track.cosslinks.com`, a domain of its own so senders' abuse never lands on coss.com |
| `SES_EVENTS_QUEUE_URL` | worker with `EMAIL_PROVIDER=ses`: the SQS queue of SES events |
| `INBOUND_MANAGED_DOMAIN`, `SES_INBOUND_BUCKET` | api, web, worker: receiving. The managed inbound domain (`<label>.<domain>` addresses per environment; default `inbound.coss.test` with the fake provider) and, with SES, the bucket received content lives in (both or neither with SES; unset → receiving off). Printed by `ses:bootstrap --managed-domain` |
| `SES_INBOUND_QUEUE_URL` | worker with SES receiving: the SQS queue of receipt notifications |
| `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY`, `APNS_TOPIC`, `APNS_ENVIRONMENTS` | worker: push notifications to the iOS app through APNs with a token-based `.p8` key (its id, the Apple Developer team, the PEM contents — `\n` line breaks accepted — the bundle id, default `com.coss.ios`, and the gateways the key serves, default `production,sandbox`; devices registered for another are skipped). The first three together or none; unset → printed in development, held in production |
| `NOTIFICATIONS_ENVIRONMENT_ID`, `NOTIFICATIONS_FROM` | web reads the id only to refuse admin suspensions of coss.com's own organization (`isSystemOrganization`, `apps/web/src/lib/system-organization.ts`); worker: account emails (verification, password reset, invitation) and reputation notification emails go out through coss.com's own email product from this live environment (of coss.com's own org) and sender (on one of its verified domains). Both or neither; unset → held in production (account email links are printed by the dashboard outside production) |
| `SMTP_HOSTNAME`, `SMTP_IMPLICIT_TLS_PORT`, `SMTP_STARTTLS_PORT` | smtp: the relay's name (greeting, certificate; production `smtp.coss.com`) and the ports it listens on (default 2465/2587; the NLB maps 465/587 onto them) |
| `SMTP_TLS_CERTIFICATE_ARN`, `SMTP_TLS_PASSPHRASE` | smtp (production, both required): the exportable ACM certificate the relay exports at start and every 12 hours, and the passphrase that encrypts the exported key in transit. The ARN is set by Terraform (`generated_env`) |
| `SMTP_TLS_CERT_FILE`, `SMTP_TLS_KEY_FILE` | smtp (development): a certificate from files; neither → a self-signed one made with `openssl` (clients skip verification) |
| `SMTP_PUBLIC_HOST` | web: the relay's host shown with its settings on environment pages (default `localhost` outside production; unset in production hides them) |
| `VALKEY_URL`, `VALKEY_CLUSTER` | api + web + worker (the daily inbound limit, Hooks delivery limits) + smtp: rate limit counters (`rediss://user:pass@…`, `true` for ElastiCache Serverless; printed by `valkey:bootstrap`). Required in production; unset → in-memory per process |
| `RATE_LIMIT_KEY_PREFIX` | api + web: namespaces Valkey keys (default `coss`) |
| `CLIENT_IP_HEADER`, `TRUSTED_PROXY_COUNT` | api + web: where the client IP comes from (e.g. `x-forwarded-for`, proxies of ours appending to it). Unset → public unauthenticated limits use an aggregate fallback subject instead of a per-IP subject |
| `TEST_VALKEY_URL` | ratelimit + api tests (keys under a random prefix, never flushed) |
| `RISK_HASH_KEY` | api + web: 32-byte base64 key of every HMAC risk remembers identifiers by (velocity keys, mailbox identities, fraud reports); required in production, a fixed development key otherwise. Changing it resets that memory |
| `IPINFO_TOKEN` | worker: downloads IPinfo Lite (ASN + country, CC BY-SA 4.0) for risk's IP signals; unset → Tor and cloud ranges only |
| `EMAIL_LINK_KEYS` | api + worker: comma-separated 32-byte base64 keys, newest first (the first encrypts); marketing email's preference center, unsubscribe and double opt-in links (`@coss/email` `link-tokens.ts`). Required in production (`linkKeysFromEnv`), a fixed development key otherwise. Retired keys stay listed for years: dropping one breaks every link made with it (README, "Rotating `EMAIL_LINK_KEYS`") |
| `WEBHOOK_SECRETS_KEY` | api + web + worker: comma-separated 32-byte base64 keys, newest first (the first encrypts, all decrypt); encrypts endpoint signing secrets (and the provider keys imports hold) (losing it makes them unreadable). Shape in `@coss/webhooks/env` |
| `WORKER_LOOPS` | worker: comma-separated loops to run (`WORKER_LOOP_NAMES` in `apps/worker/src/jobs.ts`, including the `email-dispatch` and `email-dispatch-marketing` queues); unset runs all. A second worker service with `hooks` scales Hooks deliveries on their own |
| `LOG_RETENTION_DAYS` | worker: days of environment logs kept (1-31, default 30); whole expired day partitions are dropped hourly |
| `SMS_PROVIDER` | api, web, worker: provider of live environments' SMS and of new numbers (`fake` default, or `twilio`). Production with `fake` refuses to buy numbers or submit registrations, so nothing live is sent; the api only needs the name (callbacks are verified with each subaccount's token). Shape in `@coss/sms/env` |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PRIMARY_CUSTOMER_PROFILE_SID`, `SMS_SUBACCOUNT_PREFIX` | web + worker with `SMS_PROVIDER=twilio`: Cal.com's parent Twilio account (shared ISV), the approved primary customer profile organizations' 10DLC brands are registered under, and the prefix of the subaccounts coss.com creates (`<prefix>-<organization id>`). Twilio calls back `${API_PUBLIC_URL}/sms/twilio/*` |
| `SMS_NEGOTIATED_COSTS` | `bun run sms:update-prices` only (never deployed or committed): Twilio's negotiated per-segment costs by country, JSON in dollars |
| `BILLING_PROVIDER`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | web + worker: the payment provider of new billing accounts (`fake` default, or `stripe`, which needs the key); the webhook secret only the dashboard (`/api/billing/webhook`). Shape in `@coss/billing/env` |
| `SCREENING_CLASSIFIER`, `SCREENING_MODEL`, `AI_GATEWAY_API_KEY` | worker: content screening (`off`/`fake`/`ai`; a Vercel AI Gateway decision model id, default `typesafe-ai/jev`; the Gateway key, required with `ai`). The model and key also serve the api's `RISK_CLASSIFIER` |
| `RISK_IP_PRIVACY`, `IPINFO_PRIVACY_TOKEN` | api (+ web, for its sign-up assessments): risk's VPN/proxy/relay data per address (`off` default; `ipinfo`: IPinfo's privacy detection with a paid plan's token, which sends every assessed public IP to IPinfo — list it as a subprocessor first). Without it, VPNs are only guessed from the network (`ip.vpn_network`) |
| `RISK_SIGNUP_ENVIRONMENT_ID` | web: a live environment of coss.com's own organization that assesses the dashboard's sign-ups (dogfooding; `block` refuses them, `review` waits in its queue). Unset: not assessed |
| `RISK_CLASSIFIER` | api: risk's content classification in live environments (`off` default: classify answers 503 and assessments skip content; `fake`: the `[coss-test:…]` markers; `ai`: `SCREENING_MODEL` with `AI_GATEWAY_API_KEY`). Sandbox environments always use the markers |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE` | api, worker, web: Sentry (each its own project's DSN; web's also serves browsers of both zones); unset → nothing reported. Read before t3-env (`src/instrument.ts`, `src/lib/monitoring-server.ts`, `/api/monitoring`) and validated by it (`sentryEnvShape`) |
| `SENTRY_RELEASE` | api, worker: the image's commit (Dockerfile build argument); the Next apps' release is `NEXT_DEPLOYMENT_ID`, injected at build |
| `SENTRY_AUTH_TOKEN` (`SENTRY_ORG`, `SENTRY_PROJECT`) | Next builds only (`globalPassThroughEnv`; a BuildKit secret in the Dockerfiles): uploads source maps to `cosscom`/`web` and deletes them from the build. Unset → no source maps |
| `NODE_ENV`, `SKIP_ENV_VALIDATION` | `production` makes dev auth emails and the seed refuse to run; the latter skips t3-env (image builds set it) |
| `SKIP_BUILD_TYPECHECK` | `1` makes `next build` (web, site) skip its TypeScript check; set only by CI's build job (its check job typechecks) |
| `TURBO_TOKEN`, `TURBO_TEAM`, `TURBO_REMOTE_CACHE_SIGNATURE_KEY` | turbo itself (Vercel Remote Cache, team `cal`): locally `turbo login` stores the token and `~/.config/coss/turbo.env` (sourced by the shell profile) sets the other two; in CI `secrets.TURBO_TOKEN`, `vars.TURBO_TEAM`, `secrets.TURBO_REMOTE_CACHE_SIGNATURE_KEY`. Never in `.env` (turbo doesn't read it) |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | `apps/web`: Server Actions key shared by every dashboard task of a stage (base64, 16/24/32 bytes); read at runtime, required in production |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | `apps/web` (read by `packages/auth/src/social.ts`): sign-in with Google / GitHub, each on when both of its values are set (`src/instrumentation.ts` refuses half a pair). Callbacks `${BETTER_AUTH_URL}/api/auth/callback/{google,github}`. Production: ids plain (tfvars), secrets in the stage secret — put the secrets there **before** the `terraform apply` that adds them, or web tasks can't start |
| `DOMAIN_CONNECT_KEY_ID`, `DOMAIN_CONNECT_PRIVATE_KEY` | `apps/web`: Domain Connect, one-click DNS setup on domain pages (`src/lib/domain-connect.ts`, `@coss/email/domain-connect`): the RSA key apply links are signed with and the TXT host its public half is published at under coss.com (`bun run domain-connect:key`; README, "Domain Connect"). Both or neither (`src/instrumentation.ts`); unset → no button. The key may be one line with `\n` escapes |
| `DEPLOY_GITHUB_APP_ID`, `DEPLOY_GITHUB_APP_PRIVATE_KEY` | `apps/web`: the admin console's Deploys page (`src/lib/deploys.ts`), through the coss.com Deploy GitHub App (Actions read/write, Contents read on `cosscom/coss`; README, "Deploying from the admin console"). Both or neither (`src/instrumentation.ts`); unset → the page explains the setup. The key may be one line with `\n` escapes. The app's bot is on `deploy_actor_ids` |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | `apps/web`: Cloudflare Turnstile (both or neither; required in production, checked in `src/instrumentation.ts`). Pages pass the site key to the auth forms; `packages/auth/src/options.ts` adds the `captcha` plugin when the secret is set |
| `TRUSTED_PROXY_HOPS` | `apps/web`: proxies that append to `X-Forwarded-For` (CloudFront → ALB: `2`; default `0`). `src/proxy.ts` replaces the header with the one client address they vouch for, which Better Auth then uses (it ignores multi-value headers) |
| `NEXT_DEPLOYMENT_ID` | Next builds (`apps/web`, `apps/site`): the commit, passed by the Dockerfiles; build id + version-skew protection |
| `PORT`, `HOSTNAME`, `KEEP_ALIVE_TIMEOUT` | set by the Next images (standalone `server.js`) |
| `SEED_PASSWORD` | `db:seed` demo password (only when the user is first created) |
| `COSS_API_KEY`, `COSS_BASE_URL` | SDK defaults / `packages/sdk/examples` only (the example also reads `COSS_FROM`, `COSS_TO`); also the MCP server's and the CLI's (where they win over a saved profile) |
| `COSS_DASHBOARD_URL`, `COSS_PROFILE`, `COSS_NO_UPDATE_CHECK` | the CLI only (`packages/cli`): the dashboard `coss login` opens (default `https://coss.com`), which saved profile commands use, and `1` to turn off the daily update notice |

Adding one: `.env.example`, the app's t3-env schema, **`turbo.json` `globalPassThroughEnv`** (strict env mode drops
undeclared vars from tasks — CI and image builds have no `.env`), the service in `infra/aws/services.ts` (a test fails
otherwise), and `ci.yml` if CI needs it. Only a variable that changes what a task *produces* goes in `globalEnv`
instead (today `NODE_ENV`, `NEXT_DEPLOYMENT_ID`; `infra/test` pins the list): those values are part of every task hash,
and laptops and CI must compute the same hashes to share the remote cache (README, "Remote cache"). Runtime values
are never inlined into builds (no `NEXT_PUBLIC_*`), which is what makes pass-through safe.

## Public API (`apps/api`)

- `createApp(opts)` (`src/app.ts`) is side-effect free; services are injected via `CreateAppOptions` and `src/index.ts`
  wires env (`webhookDeps` is required — a throwaway secrets key would make the endpoints it creates
  undeliverable; `emailService` is required — `src/index.ts` builds it on the pg-boss queue; `domainDeps` defaults to
  the fake provider). Middleware order: request id → `secureHeaders` → `bodyLimit` (5 MB; `POST /v1/emails` uses its own 40 MB limit after authentication) → `logger` (off under test). Every
  response carries a server-generated `X-Request-Id: req_…` (client values are ignored).
- The only unauthenticated routes are `/health`, `/openapi.json` and the tracking endpoints `GET /t/o/:token`
  (open pixel, always a GIF) and `GET /t/c/:token/:position` (302 to the stored link, else a plain-text 404)
  (`src/routes/tracking.ts`). They are plain Hono routes outside `/v1` and the OpenAPI document, never return the
  error envelope, record nothing for HEAD, and get `Cross-Origin-Resource-Policy: cross-origin` (everything else keeps
  `same-origin`).
- Errors are always the envelope `{ error: { type, code, message, param?, issues?, request_id } }`, built only by
  `errorResponse` (`src/errors.ts`). Throw `new ApiError(status, { type, code, message, param? })` with `type` from
  `ERROR_TYPES`, or a product error mapped in `toApiError`; anything else is logged and returned as a generic 500. Never
  hand-build error JSON.
- New endpoint: `createRoute({ …, security: [{ bearerAuth: [] }], middleware: [requireApiKey({ <product>: ["<action>"] }), rateLimit("api.read" | "api.write" | "api.send")] })`
  + `router.openapi(route, handler)`, mounted in `createV1Router` (`src/routes/v1.ts`). Auth goes in `middleware` so it
  runs before validation (401 beats 422). Tenancy comes only from `c.var.auth` — environment-scoped resources filter by
  `environmentId`, organization-scoped ones (domains, audit events, billing) only by `organizationId`. Document responses with
  `jsonDoc`/`errorDoc`/`commonErrors` (`src/routes/docs.ts`, includes 429). The root `validationHook` turns zod failures into 422 + `issues`;
  a per-route hook must end with `validationHook(result)`. `test/app.test.ts` asserts the exact OpenAPI path list.
- Every operation needs an `operationId` (it names its docs page). Wire schemas carry a whole-object
  `.meta({ examples: [...] })` (OpenAPI 3.1 form; the singular `example` is ignored by the docs), checked by
  `packages/{email,webhooks}/test/schema-examples.test.ts`; they feed the reference's samples and playground. After route changes
  run `bun run openapi:generate`, add the operation's SDK sample in `apps/site/src/lib/sdk-samples.ts` and its method
  to `SDK_METHODS` in `tooling/sdkgen/src/methods.ts` (the same name; to `NO_RETRY` too when the API doesn't
  deduplicate it, like the TypeScript SDK's `retry: false`) — tests enforce all three. The generated SDKs
  (`sdks/*`) and their docs samples (`tooling/sdkgen/snippets.json`) follow in main's "Regenerate SDKs" PR.
  Webhook event schemas no route returns are listed in `src/webhook-events.ts` (components of the document, so the
  generated SDKs type them).
- **Versions** (`Coss-Version: YYYY-MM-DD`, `@coss/versioning`): handlers always build the latest shape. The
  `apiVersion` middleware (`src/middleware/api-version.ts`, on `/v1/*`) rejects unknown versions (400
  `invalid_api_version`, before authentication), echoes `Coss-Version` and renders 2xx JSON bodies in the caller's
  version; `requireApiKey` resolves `c.var.apiVersion` (header, else the org pin from `authenticateApiKey`). Routes
  with a JSON body end their `middleware` with `upgradeRequestBody("<METHOD> /v1/<path template>")` (after the body
  limit, before validation). Error envelopes, CSV and `/t/*` are never versioned. The OpenAPI `Coss-Version`
  parameter/header and `info.version` are added by `withApiVersionDocs` (`src/openapi-versions.ts`).
- Long polls (`POST /v1/webhook_listeners/{id}/poll`, `coss listen`) wait at most 25 s (CloudFront's and the ALB's
  60 s) and end on `AbortSignal.any([c.req.raw.signal, shutdownSignal])`: `src/index.ts` aborts `shutdownSignal`
  on SIGTERM before draining, so they never hold a deploy up. They aren't request-logged (`request-log.ts`) or
  traced (`@coss/observability`). `GET /v1/environment` and `DELETE /v1/api_key` take any valid key
  (`requireApiKey({})`): a key can always describe and revoke itself.
- CORS: only `/v1/*`, only `API_CORS_ORIGINS`, never `credentials` — the API authenticates with bearer keys and must
  never accept the dashboard's session cookie (that would need CSRF protection on every endpoint).

## SDK (`packages/sdk`, published as `coss`)

- `Coss` (`src/client.ts`) → one `HttpClient` (`src/core/http.ts`: bearer auth, JSON, per-attempt timeout, retries on
  network/timeout/409/429/5xx honoring `Retry-After`, an `Idempotency-Key` on every POST reused across retries) → one
  resource per product or managed resource (`src/resources/*.ts`: `email`, `domains`, `webhookEndpoints`;
  sub-resources hang off their parent, e.g. `coss.email.suppressions`, `coss.webhookEndpoints.deliveries`). Methods return `{ data, error }` and never
  throw for API/network failures. Webhook endpoint creation disables
  automatic retries because the API does not deduplicate it, even with an `Idempotency-Key`.
- Must run unchanged on Node, Bun, Deno and Workers: no `node:*`, no `Bun.*`, only guarded `globalThis.process`
  access, zero runtime deps. `isolatedDeclarations` is on (exported functions need explicit types).
- React Email (`src/react.ts`): a send's `react` is rendered into `html`/`text` by `@react-email/render`, an
  **optional peer** loaded with a literal `import()` inside try/catch (bundlers include it when installed, only
  warn when not) — never make it a dependency or import React types (`ReactEmailElement` is structural). `react`
  is SDK-only: `contract-types.ts` compares `Omit<SendEmailParams, "react">` with the API's schema.
- **Integrations** (`src/nodemailer.ts`, `src/better-auth.ts`, `src/authjs.ts`; shared code in `src/core/integration.ts`
  + `src/core/mime.ts`): each is its own tsdown entry and describes its host library **structurally** (no import
  from it in `src/`, so no runtime or type dependency; the libraries are optional `peerDependencies` and pinned
  devDependencies). `test/integration-types.ts` (typecheck only) assigns them to the libraries' real types, so
  drift fails `typecheck`; `apps/api/test/integrations-contract.test.ts` runs the built ones against the app. They
  throw `CossSendError` (the libraries report failures by throwing), create their client lazily (a missing key
  fails the first send, not a build), tag `User-Agent` via the internal `INTEGRATION` symbol (never a
  `CossOptions` field), drop the API's reserved headers (`isReservedHeader` mirrors `RESERVED_HEADERS`; the
  contract test sends every one) and refuse what coss.com can't send (raw MIME, custom envelopes, `sender`, AMP)
  rather than dropping it. Auth emails (Better Auth, Auth.js) always send `category: "account"` with tracking
  off — click tracking would route secret links through `/t/c/…` — and derive idempotency keys only from
  single-use tokens (hashed), never from OTP codes or invitation ids, which are legitimately resent.
- **Framework drivers** (`integrations/*`, not part of the SDK): Laravel, Rails and Django follow the same mapping and
  retry rules as the JS integrations, written down in `integrations/README.md` and checked by every driver's tests
  against `integrations/conformance/{http,message}.json` (`webhooks.json` is the generated SDKs', checked against
  `verifyWebhook` by `packages/sdk/test/webhooks-conformance.test.ts`) (generated from `src/core/mime.ts`'s behaviour: change the
  README, the JSON, the SDK and all three drivers together). Each keeps `Coss-Version` and the reserved-header list as
  hand mirrors of `API_VERSION` and `RESERVED_HEADERS`. Releases: `.github/workflows/release-integrations.yml` (below).
- Error types are listed in three places: `ERROR_TYPES` (`apps/api/src/errors.ts`) and `CossErrorType` +
  `API_ERROR_TYPES` (`packages/sdk/src/core/errors.ts`).
- The api contract tests import the SDK's built `dist`: turbo builds it first, but outside turbo run
  `bun run --cwd packages/sdk build` before api typecheck/tests. `src/version.ts` must equal `package.json` `version`.
- `verifyWebhook` (`src/webhooks.ts`, Web Crypto only) is the one SDK function that throws (`WebhookVerificationError`):
  a failed signature check must not be ignorable. The event body's wire types live in `src/types/webhook.ts`; endpoint
  management's in `src/types/webhook-endpoint.ts`.
- Every request sends `Coss-Version`: `API_VERSION` (`src/api-version.ts`, a hand mirror of `API_VERSIONS`; the
  contract tests keep them equal), overridable with the `apiVersion` client option. The SDK's wire types describe
  `API_VERSION` only.
- Releases: Changesets 3 (`.changeset/`, the SDK, `coss-mcp` and `coss-cli` — every other workspace is private and never versioned).
  `bun run version-packages` also rewrites `src/version.ts` (`scripts/sync-version.ts`) and refreshes `bun.lock`
  (it records workspace versions; CI installs with `--frozen-lockfile`).
- **Publishing** (`.github/workflows/release.yml`): merging the "Version packages" PR publishes `coss` to npm
  from CI only — npm trusted publishing (GitHub OIDC, no npm token anywhere) with provenance, trusted for exactly
  `cosscom/coss` → `release.yml` → the `npm` environment (deployable from `main`); `npm trust list coss` shows it.
  The publish job builds the SDK and runs `npm publish --provenance` itself, skipping a version already on npm,
  waits until the registry serves the new one (usually a minute or two, up to 15 minutes) and tags it. Never
  publish from a laptop. npm owners: baileypumfleet, peer_rich, keithwillcode (versions 0.0.1–0.0.5 are a previous
  owner's unrelated, deprecated package).
- **Publishing the framework drivers** (`.github/workflows/release-integrations.yml`, on pushes to `main` touching
  `integrations/**`): a driver whose version file (`laravel/src/Version.php`, `rails/lib/coss/rails/version.rb`,
  `django/src/coss_django/__init__.py`, with its `CHANGELOG.md`) names a version its registry doesn't have is tested,
  published and tagged `coss-<driver>@<version>`. PyPI (`pypi` environment) and RubyGems (`rubygems` environment) use
  trusted publishing; Packagist reads `cosscom/coss-laravel`, a read-only mirror the job pushes `git subtree split
  --prefix integrations/laravel` and a `v<version>` tag to with the deploy key `COSS_LARAVEL_DEPLOY_KEY` (`packagist`
  environment) — never commit to the mirror. Every job is skipped until the repository variable
  `INTEGRATIONS_PUBLISH` is `true`.
- **CLI binaries** (the `cli-*` jobs of `release.yml`, after `publish`): for the `coss-cli@<version>` tag (built
  from the tag, never a newer main) whose GitHub release has no `SHA256SUMS` yet, `packages/cli/scripts/binaries.ts`
  cross-compiles standalone executables (`bun build --compile`, 7 targets: macOS, glibc/musl Linux, Windows; macOS
  ones come out ad-hoc signed). With the repository variable `CLI_MACOS_NOTARIZE` `true`, `cli-binaries-notarize`
  (macOS runner, `apple` environment: `APPLE_DEVELOPER_ID_P12` (base64 `.p12` of the Developer ID Application
  certificate and key) + `APPLE_DEVELOPER_ID_P12_PASSWORD`, `APPLE_NOTARY_KEY` (an App Store Connect API key's
  `.p8`) + `APPLE_NOTARY_KEY_ID` + `APPLE_NOTARY_ISSUER_ID`) re-signs them with the hardened runtime and Bun's JIT
  entitlements, has Apple notarize them (`scripts/notarize.ts`; a bare executable can't be stapled, so Gatekeeper
  checks online) and archives them again with a new `SHA256SUMS`; the smoke tests then run the notarized builds,
  quarantined on macOS as a browser download is. When turning it on, drop the `xattr` note from the CLI's README and
  `cli.mdx`. `scripts/smoke-binary.ts` runs them on their own OS (musl in Alpine,
  which needs `libstdc++`), and the release gets the archives + `SHA256SUMS`, marked latest (`install.sh` and
  `releases/latest` rely on the CLI being the only package with GitHub releases). Then `scripts/homebrew.ts` renders
  `Formula/coss.rb` from that `SHA256SUMS` and pushes it to `cosscom/homebrew-tap` with the deploy key
  `HOMEBREW_TAP_DEPLOY_KEY` (`homebrew` environment) — never edit the tap by hand. Every job is skipped until the
  repository variable `CLI_BINARIES_PUBLISH` is `true`; each checks the release first, so a rerun fills in what's
  missing. `packages/cli/install.sh` (served from main's raw URL) is the `curl | sh` installer: it verifies the
  archive against `SHA256SUMS`.

## MCP server (`packages/mcp`, published as `coss-mcp`)

- `createCossMcpServer({ coss, apiKey })` (`src/server.ts`) registers every tool on an `McpServer`
  (`@modelcontextprotocol/server` v2); `src/cli.ts` serves it over stdio (`serveStdio`). Configuration comes from the
  environment only (`COSS_API_KEY`, `COSS_BASE_URL`), never argv; stdout is the protocol, so log to stderr.
- Tools (`src/tools/*.ts`) call only the public SDK — never workspace packages (AGPL) or the database — so anything a
  tool needs must exist in the public API first. The exception is `search_docs`/`read_docs` (`tools/docs.ts`), which
  fetch coss.com's public docs (`/docs/search.json`, `<page>.md`, nothing outside `/docs`) and work without a key:
  with no `COSS_API_KEY` the server registers only them. Every tool carries annotations (`READ_ONLY`, `WRITE`,
  `DESTRUCTIVE`, `SENDS` in `tools/shared.ts`); clients rely on them to prompt (full-access keys hold every
  permission; a restricted key's 403 hint points at `get_account_status`, which lists what it holds).
- Answers stay small: lists drop content (`compact`, `emailListItem`), bodies are cut (`truncate`), API failures
  become `isError` results with a hint (`result.ts`). Third-party text (email content, received mail, bounce and
  webhook responses) is labelled untrusted, and the server's `instructions` say so.
- Delivery diagnosis is the SDK's `coss/diagnose` (`packages/sdk/src/diagnose.ts`, shared with `coss emails
  diagnose`): `diagnoseEmail` is pure (email + events + best-effort context → verdict), `diagnose` fetches first;
  next steps name the server's tools through `references`. Its explanations of failure codes and recipient
  statuses must match the email product's behaviour: change both together.
- Dependencies are explicit versions (`npm publish` doesn't rewrite `workspace:`/`catalog:`); `coss` is a caret
  range that changesets moves when the SDK's version leaves it. The release job publishes it after `coss`.
- Tests: `packages/mcp/test` (in-memory client, fake `fetch`) and `apps/api/test/mcp-contract.test.ts` (built
  server against the in-process app; turbo builds it first).

## Coding agents

What an agent pointed at coss.com reads, all describing the same facts — change them together:
- `/llms.txt` and `/llms-full.txt` open with `AGENT_BRIEF` (`apps/site/src/lib/llms.ts`): how to read the docs, get a
  key with `npx coss-cli init`, the SDK's conventions, testing webhooks. Every docs page is Markdown at `<page>.md`
  (`apps/site/AGENTS.md`); API reference pages render the OpenAPI document (`operation-markdown.ts`).
- The landing page's prompt (`AGENT_PROMPT`, `apps/site/src/lib/site.ts`), quoted by `/docs/agents`.
- The `coss` skill (`plugins/coss/skills/coss/SKILL.md`), the notes `coss init --agents` writes into a project's
  AGENTS.md (`agentNotes`, `packages/cli/src/commands/init.ts`) and the MCP server's instructions (`src/server.ts`).
- `claude plugin validate .` and `claude plugin validate plugins/coss` check the marketplace and the plugin. The
  plugin has no `version` on purpose: installs follow main. Its MCP server takes the key from the plugin's optional
  `api_key` (`userConfig`); without one `coss-mcp` serves only the docs tools.

## CLI (`packages/cli`, published as `coss-cli`, command `coss`)

- `run(argv, io)` (`src/run.ts`) dispatches commands (`src/commands/*.ts`); everything outside the process (env,
  streams, `fetch`, clock, browser, prompts, cwd, child processes, config dir, the Ctrl-C signal) comes through `CliIo` (`src/io.ts`), so
  tests run commands in process. `src/cli.ts` is the bin (`nodeIo()`). Results go to stdout (`--json`: one object per
  line), progress and warnings to stderr. Usage errors exit 2, failures 1, Ctrl-C 130.
- Calls only the public SDK (`clientFor` always passes `apiKey`, `baseUrl` and `fetch`, so the SDK never reads
  `process.env` itself) — never workspace packages (AGPL) or the database; anything a command needs must exist in the
  public API first. No flag takes an API key (command lines are visible to other processes): `COSS_API_KEY`, else
  the profile (`--profile`, `COSS_PROFILE`, the saved default) in `config.json` (`src/config.ts`: XDG/APPDATA/
  `~/.config/coss`, 0600, written atomically). Login remembers a non-default `COSS_BASE_URL`/`COSS_DASHBOARD_URL`.
- `login`: the dashboard's CLI sign-in (`packages/auth/AGENTS.md`, "CLI sign-in") — PKCE with a 127.0.0.1 loopback
  server (`src/auth/loopback.ts`), or `mode=code` (pasted) with `--no-browser` and over SSH; `verificationCode`
  (`src/auth/pkce.ts`) must equal `cliVerificationCode` (`@coss/auth/cli`; both tests pin `DZ93-GPCX`). Keys it
  created (`login: "browser"`) are revoked by `logout` and by the next login of the profile (`coss.apiKey.revoke()`, at the
  profile's saved origin, never `COSS_BASE_URL`'s). Polling commands retry only transient errors (`isTransient`).
- `init` reuses login's browser flow with a `project` hint (the approval page then offers sandbox environments
  only and names the key after the project; `apps/web/src/app/app/authorize/cli/params.ts`), checks the key's
  environment again (a live key is revoked, never written) and writes it to the project's env file, never the
  profile. The update notice (`src/update-check.ts`) asks the npm registry at most once a day, runs alongside the
  command and is dropped if it hasn't answered when the command ends; never with `--json`, in CI, off a TTY or with
  `COSS_NO_UPDATE_CHECK`.
- `listen`: opens a webhook listener (`packages/webhooks/AGENTS.md`), long-polls (`wait_ms` 20 s, SDK timeout 35 s,
  no SDK retries), forwards each body byte for byte to `--forward-to`, signed with the profile's stable `whsec_`
  `listen_secret` (`src/listen/sign.ts`, Standard Webhooks, written from the spec) and `webhook-id` = the event id,
  and acks results in the next poll; Ctrl-C acks what was forwarded and deletes the listener. Live environments
  need `--live`.
- `trigger <type>`: `POST /v1/webhook_events/test` (`coss.webhookEvents.test`; `sendTestWebhookEvent` in
  `packages/email/src/test-events.ts`): a sample event built from the type's schema example, fresh ids, `data`
  merged over it and checked against the schema (unknown fields refused), fanned out through the outbox like a
  real one. Sandbox environments only, never the live-only `domain.*`/`account.*`/`billing.*`; nothing in the body
  marks it as a test. The SDK's `WEBHOOK_EVENT_TYPES`/`TEST_WEBHOOK_EVENT_TYPES` (completion) are hand mirrors of
  `@coss/email`'s, kept equal by `sdk-contract.test.ts`. `webhooks list|deliveries|retry` wrap the endpoint API.
- `logs tail` polls `GET /v1/logs` like the dashboard's live mode (re-reads from a minute before the newest line,
  prints unseen ids oldest first, `src/logs/tail.ts`); `emails send --simulate` uses the mailbox simulator addresses
  (`src/emails/simulate.ts`, must match `packages/email/src/providers/fake.ts`).
- Dependencies are explicit versions, `coss` a caret range (like the MCP server); the release job publishes it after
  `coss`. Tests: `packages/cli/test` (fake `fetch`, real loopback and receiver servers) and
  `apps/api/test/cli-contract.test.ts` (built CLI against the in-process app; turbo builds it first).
- It also ships as a standalone executable (Bun's compiled runtime, not Node: `bun run build:binaries`, output in
  the git-ignored `packages/cli/binaries/`; releases under "CLI binaries" above). Keep `src/` to what both run:
  `test/binaries.test.ts` compiles this machine's binary, installs it with `install.sh` and runs
  `scripts/smoke-binary.ts` on it (stdin, pipes flushed on exit, the config file, Ctrl-C, the browser sign-in's
  loopback server).

## Dashboard (`apps/web`)

- Pages use the generated `PageProps<"/…">`/`LayoutProps` globals and `await params`. Call `requireOrgMember(orgSlug)`
  (`src/lib/session.ts`; non-members get a 404) and gate controls with its `can(…)` (the role check, read-only while
  the org is suspended). Read data straight
  from `@coss/tenancy` / `@coss/email` (the dashboard never calls the public API). Server code uses `auth` from
  `@/lib/auth`; client code uses `authClient` from `@/lib/auth-client`.
- Layout follows coss.com's docs (`apps/site/DESIGN.md`: grayscale, Cal Sans/Paper Mono, hue only for status):
  `AppShell` (`src/components/shell/`) is the sidebar + framed page with breadcrumbs and ⌘K, used by the
  `[orgSlug]`, `/settings` and `/admin` layouts. `src/lib/navigation.ts` is the one list of pages the sidebar,
  breadcrumbs, ⌘K and settings tabs read — add a page there. Its items carry icon components, so server components
  pass an area name (`SubNav nav=…`, `AreaSidebar area=…`), never the lists. Pages compose `PageHeader`, `Panel`
  (`<Table variant="card">` or `PanelBody` inside), `EmptyState`, `SpecList`, `StatRow`, `StatusDot`; no back
  links (breadcrumbs). `data-page-width="full"` on a page lifts the shell's `max-w-6xl`.
- Mutations live in a colocated `actions.ts` (`"use server"`): `(prev: ActionResult<T> | null, formData) => runAction(…)`
  (`src/lib/actions.ts`). Start with `requireOrgPermission(formString(formData, "orgSlug"), {…})`, re-check that target
  ids belong to that org (`getKeyBinding`, `getOrganizationMember`, `getPendingInvitation`, `getDomain`,
  `getWebhookEndpoint` + its `environmentId`), `refresh()` after writes.
  Throw `ActionError` for user-facing messages. Clients use `useActionToast(action, { success })` (`src/lib/toast.ts`,
  `useActionState` that toasts) + `<FormError>`: every user-triggered mutation toasts its success (short, past
  tense, no period; redirecting actions too, with a static message), failures stay inline in forms and dialogs
  (`errors: "toast"` for one-click buttons); `toast.*` for client-side calls (`authClient`). Pure reads don't toast.
  Hidden inputs carry slugs/ids only.
- coss ui is **Base UI, not Radix**: compose with `render` (`<DialogTrigger render={<Button />}>`), never `asChild`.
  A `<form>` inside `DialogPopup`/`AlertDialogPopup` needs `className="contents"` (otherwise the footer renders outside the
  popup). Popups unmount on close. Add components with `bunx shadcn@latest add @coss/<name>` from `packages/ui`;
  dashboard-specific compositions go in `apps/web/src/components`.
- Routes: a new top-level segment must be added to `RESERVED_ORG_SLUGS` (`packages/auth/src/slugs.ts`), a new static
  segment under `[orgSlug]` to the allow-list in `apps/web/test/reserved-slugs.test.ts`, signed-out pages to
  `PUBLIC_PATH_PREFIXES` (`src/proxy.ts`). The entry page is `/dashboard` (`DASHBOARD_PATH`), never `/` (the site's
  landing page): use it for every "go to the dashboard" link and as the post-sign-in default (`safeRedirectPath`).
  The dashboard has no root files (icon, robots, sitemap): the site serves them.
- Domain management uses `emailRuntime().domainDeps` (`src/lib/email-runtime.ts`) and webhook management
  `webhookManagementDeps()` (`src/lib/webhooks.ts`); domain/webhook errors carry user-facing messages. Revealing a
  webhook secret needs `webhook:update` (members can read endpoints but never see secrets).
- Org settings (`[orgSlug]/settings`: rename, slug change, leave, 2FA requirement; `settings/sso`: SSO provider and
  requirement; `settings/scim`: directory sync) and account settings (top-level `/settings`: name and
  verification email; `/settings/security`: password, connected accounts, two-factor, passkeys;
  `/settings/sessions`) call `auth.api.*` server-side — their HTTP routes stay disabled
  (`disabledPaths`, below). `canRemoveOrgMember`/`assignableOrgRoles` mirror Better Auth's owner rules for the UI; Better
  Auth alone protects the last owner. Account actions refuse while impersonating.
- Session-bound Better Auth calls made while *rendering* pass `authHeaders()` (`src/lib/session.ts`), not raw
  `headers()`: after an action replaces the session cookie (password change), Next re-renders with the new cookies
  but the old request headers.
- When driving the dashboard in a browser, wait for hydration before typing or submitting.

## coss.com zones

- coss.com is shared by Next.js multi-zones, routed by the ALB (not Next rewrites): the dashboard is the default zone
  (org slugs, `/dashboard`, `/api/*`, bare `/_next/*`); the site, the coss ui repository's apps (`/ui`, `/origin`) and
  qnot's site (`/qnot`, the `cosscom/qnot` repository's `apps/web`, Vercel project `coss-com-qnot` with
  `NEXT_PUBLIC_BASE_PATH=/qnot`) — the last three deployed on Vercel and served by CloudFront from their own origins — get the paths in **`ZONE_ROUTES`**
  (`@coss/auth/slugs`, client-safe), from which `RESERVED_ORG_SLUGS`, the ALB rules and CloudFront behaviours
  (`infra/aws/routing.ts`) are derived. Adding a site page = a `ZONE_ROUTES` entry (unless `/docs` etc. covers it) +
  the route; `apps/site/test/reserved-slugs.test.ts` fails otherwise. The site's assets live under its
  `assetPrefix` (`SITE_ASSET_PREFIX`, `/site-assets`); its search is `/docs/search.json`.
- Org slugs can't be taken back once used, so plausible future site pages (pricing, blog, products, legal, …) are
  reserved up front in `slugs.ts`. Slugs are ≥ 3 characters, so a localized site must use 2-letter prefixes
  (`/de/…`), never `xx-yy` codes (valid slugs). Reserve a new marketing path before any org can take it.
- Same origin: any script on the site can act as the signed-in dashboard user. Both apps send a CSP without
  third-party script origins (except the dashboard's `TURNSTILE_ORIGIN`, script + frame only) and deny framing (`src/lib/security-headers.ts` in each); see `apps/site/AGENTS.md`.
- Local dev keeps separate ports: `localhost:3000` redirects `/` to `/dashboard` and `/legal/*` to the site, and
  proxies `/icon.svg` to the site;
  the site proxies `/api/auth/*` to :3000 and links with `dashboardUrl()`.

## Containers and deployment (AWS)

- `apps/{web,site,portal,api,worker}/Dockerfile`, built from the repository root (`docker build -f apps/web/Dockerfile .`):
  `turbo prune --docker` (works with `bun.lock` and the isolated linker) → `bun install --frozen-lockfile` → build →
  a small non-root runtime image. Bun/Node/turbo versions are `ARG`s that `infra/test` keeps equal to `package.json`.
- Next apps use `output: "standalone"` with `outputFileTracingRoot` at the monorepo root; the traced
  `node_modules/.bun` keeps relative symlinks, which resolve after copying (verified). They run `node
  apps/<app>/server.js` on Node 24. `generateBuildId` uses `NEXT_DEPLOYMENT_ID` (Next sets it to `""` when unset,
  hence `||`). api and worker run their TypeScript source on Bun from a `--production` prune.
- Build once, deploy to any stage: nothing stage-specific at build time (`SKIP_ENV_VALIDATION`), validation at
  startup. `next.config.ts` runs only at build/dev time and is serialized into the standalone server: decide nothing
  there from runtime env.
- Health checks: `/api/health` (web, site, portal; public in `proxy.ts`), `/health` (api); none touch the database.
- SIGTERM: Next drains itself; the API (`src/server.ts`) stops accepting, finishes in-flight requests, closes the pg
  pool; the worker (`src/shutdown.ts`) aborts the SQS poll and long runs between items, waits for each loop's current
  run, closes the pool. Idle keep-alive timeouts (75 s) exceed the ALB's 60 s.
- Migrations: `bun packages/db/src/migrate.ts` (drizzle-orm's migrator, no drizzle-kit) as a one-off task from the
  worker image. Runbook, resources, IAM and deploy order: README.md, "Deploying to AWS"; machine-readable: `infra/`.

## Tests

- `bun:test`. DB-backed suites (`apps/api`, `apps/smtp`, `apps/worker`, `packages/billing`, `packages/email`, `packages/hooks`, `packages/migrate`, `packages/push`, `packages/reputation`, `packages/risk`, `packages/screening`, `packages/tenancy`, `packages/webhooks`) preload `test/setup.ts` via their
  `bunfig.toml` → `@coss/db/testing`, which throws unless `TEST_DATABASE_URL` names a `*_test` database, then points
  `DATABASE_URL` at it. Other suites are DB-free; before adding DB tests elsewhere copy `packages/email/bunfig.toml` +
  `test/setup.ts`, or the tests hit the dev database.
- Tests never truncate; every test creates its own uniquely named fixtures: `createTestTenant()` (owner, org, project,
  `production`/`development`, `liveKey`/`sandboxKey`), `createTestUser()`, `addMember()` from `@coss/tenancy/testing`;
  `uniqueSuffix()` from `@coss/db/testing`. API: `createTestApp()` (sends only enqueue; its `dispatch()` runs the queued
  jobs) + `errorOf(res)` (`apps/api/test/helpers.ts`). Email: `memoryDispatchQueue()` (records jobs; `drain(service)`
  dispatches them), `dispatchingEmailService()` (send + dispatch in one call, for tests about what happens after dispatch),
  `FakeEmailProvider({ log: false, fail })`, `gatedProvider()` for races, `createVerifiedDomain(orgId)` (live sends need
  one), `FakeSesApi`, `fakeDnsResolver()`, `FakeCloudflareApi` (a `fetch` for `CloudflareTrackingHostnameProvider`)
  from `@coss/email/testing`, `FakeTrackingHostnameProvider({ state })` from `@coss/email`. Receiving:
  `receiveFakeEmail()` + `buildTestMessage()` + `FakeInboundStore` from `@coss/email`, `FakeS3Api` and
  `sesReceiptNotification()` from `@coss/email/testing`; `createTestApp()` returns its `inbound` runtime. Real pg-boss tests use their own queue name
  (`packages/email/test/dispatch.test.ts`). Rate limits: `memoryLimiter({ overrides })`,
  `testValkeyLimiter()` from `@coss/ratelimit/testing`; `createTestApp({ rateLimiter, clientIp })` (defaults to an
  in-memory limiter per app); tighten limits for a test org with `setRateLimitOverride`. Webhooks: `webhookReceiver()` (local server),
  `testSender()`, `testManagementDeps` from `@coss/webhooks/testing`. Hooks: `testHookDeps`, `testHookDeliveryDeps({ send, throttle, … })` (no jitter)
  from `@coss/hooks/testing`; the test preload creates this week's Hooks partitions (they have no default partition). Screening: `fakeClassifier({ scores, fail, delayMs })` from
  `@coss/screening/testing` (markers like `[coss-test:phishing]` in the content score 0.99). Billing (`@coss/billing/testing`):
`createTestContract(orgId, terms, { effectiveFrom })`, `recordTestUsage({ …, at })`, `testBillingProviders()` (a
`FakeBillingProvider` with `willCollect(...)`/`fail(op)`), `FakeStripeApi` (`fetch` for `StripeBillingProvider`);
month closes, dunning and usage checks take `now` and `scope`; `createTestApp({ plans, billing })`, `screenMessage(…, { random })`
  for deterministic sampling, `Experimental_DecisionMockModelV4` (`ai/test`) for the AI SDK adapter; `dispatchingEmailService({ screen })`. Risk: `testRiskDeps(overrides)` (fixed IP data for `TEST_IPS`, fake DNS via `fakeMailDomains`, in-memory velocity) from `@coss/risk/testing`, `buildTestMmdb` from `@coss/signals/testing`; `createTestApp({ riskDeps })`. Worker-style scans take `scope: { organizationIds }`
  and `now` — always pass `scope` in tests (the test DB is shared and never truncated). Session-bound Better Auth calls: sign in with
  `auth.api.signInEmail({ returnHeaders: true })` and forward the cookie (`packages/tenancy/test/hardening.test.ts`).

## Recipes

**Add a table:** add a prefix to `ID_PREFIXES`; define the table in `packages/db/src/schema/domain.ts` with a `text` id
(`$defaultFn(() => newId(ID_PREFIXES.x))`), `organization_id NOT NULL`, a composite FK `(parent_id, organization_id) →
parent(id, organization_id)` and the `createdAt()`/`updatedAt()` helpers (history tables must not FK `apikey` — Better
Auth hard-deletes keys); `bun run db:generate`, review and commit the SQL + `migrations/meta/`, `bun run db:migrate`.
Never edit an applied migration; do renames as a separate step (drizzle-kit prompts interactively).

**Add a product** (e.g. `video`; `packages/sms` is the most recent one built this way):
1. Tables + ID prefix (above).
2. `packages/<product>`: `src/schemas.ts` (zod `strictObject`, snake_case, `.meta({ id })`, no DB imports, exported as
   `./schemas`), provider interface + fake provider, a service taking the authenticated environment, an error class with
   statuses, `bunfig.toml` + `test/setup.ts` preload.
3. Permissions: add the resource to `orgStatements` and the roles (`packages/auth/src/permissions.ts`), to
   `API_KEY_PERMISSIONS` (`packages/auth/src/constants.ts`) and its label, group and description to `API_KEY_RESOURCES`
   (`packages/auth/src/api-key-permissions.ts`; a test fails otherwise, and the dashboard and docs read them).
   Full-access keys (`environment_api_key.access = 'full'`) get the new permissions at once (resolved from the catalog on
   every request); restricted keys keep exactly what they were created with — never backfill `apikey.permissions` (the
   pre-`0080` migrations `0004`…`0077` did, when every key was full).
4. API: `src/routes/<resource>.ts` mounted in `routes/v1.ts`, service injected via `createApp` options, error class
   mapped in `toApiError`, OpenAPI path list in `test/app.test.ts` updated.
5. SDK: types, resource, `Coss` property, `src/index.ts` exports, unit tests; extend `contract-types.ts` +
   `sdk-contract.test.ts`.
6. Docs (`apps/site`): `bun run openapi:generate`, SDK samples (and `SDK_METHODS` entries) for the new operations, a guide under
   `content/docs/<product>/` (a section of its own: `"root": true`, an `icon` and a `description` in its `meta.json`,
   listed in `content/docs/meta.json`) with Twoslash SDK examples (per-method SDK usage lives in the API reference),
   and its API tags under a `---<Product>---` separator in `content/docs/api-reference/meta.json` (a test fails otherwise).
7. Dashboard: dependency + `transpilePackages`; pages under `[orgSlug]/projects/[projectSlug]/[envSlug]/`.
8. Events/webhooks: record events in the product's own table and call `enqueueWebhookMessage(tx, …)` from
   `@coss/webhooks` in the same transaction; add the payload zod schema + SDK type + contract assertion.
9. Logs: append a log line per new event with `appendLogEntries(tx, …)` from `@coss/logs` in the same transaction
   (only for rows actually inserted, so deduplicated events aren't logged twice), and add a `LogSource` value
   (enum migration + `LOG_SOURCES` + SDK `LogSource`). Mutations of the product's settings record
   `recordAudit` (dashboard) / `recordApiAudit` (API) audit events.
10. Billing: its meter is in `METERS` and priced in `RATE_CARDS` (`@coss/billing/catalog`; video and scheduling
   already are). Call `recordUsage(tx, …)` from `@coss/billing/metering` once per billable event, in the transaction
   that makes it billable (guard it with a compare-and-set, like `email.usage_recorded_at`), and reserve capped usage
   at acceptance through an injected `UsageGate` (as `EmailServiceOptions.billing` does). Plan-gated creation takes an
   injected `PlanGate`.

**Partitioned tables** (only `log_entry` so far): drizzle-kit can't declare partitioning, so declare the table in the
schema as usual (composite primary key including the partition column), `db:generate` it, then add a `--custom`
migration that drops the still-empty table and recreates it identically with `PARTITION BY` (see `0027`/`0028`).
Later column changes generated by drizzle-kit apply to partitioned tables as they are. The worker keeps daily
partitions ahead and drops expired ones through `@coss/db/partitions` (`ensurePartitions`/`dropExpiredPartitions`,
by `{ table, column, defaultPartition }`): a table with a default partition is dropped under a short ACCESS EXCLUSIVE
lock; one without is detached `CONCURRENTLY` (Postgres refuses that with a default partition), but rejects inserts
outside its created days. Nothing may hold an FK into a partitioned table.

**Make a breaking API change** (renaming/removing a field, changing a type or default — additive changes need none of
this): append today's date to `API_VERSIONS` (`packages/versioning/src/versions.ts`) and add a `VersionChange` to
`VERSION_CHANGES` (`changes.ts`) whose `responses` transforms (keyed by the wire `object`) rebuild the previous shape
from the new one — an event-data change needs both `email_event` (API) and `event` (webhooks, `eventDataTransform`) —
and whose `requests` transforms upgrade old request bodies. Change the handlers/schemas to the new shape, test the
old shape through the real registry, mirror the date in the SDK (`API_VERSIONS`, `API_VERSION`, wire types) with a
changeset, `bun run openapi:generate`. Organizations stay on their pin until they upgrade in the dashboard; endpoints
keep theirs. `title`/`description` appear in the docs changelog and the upgrade dialog. Don't add a version for a
change that can't be expressed as a transform — that is a `/v2`.

**Add a reputation trigger**: a *measured* signal is a `ReputationCheck`
(`{ trigger, evaluate(context) }`, see `packages/email/src/reputation-checks.ts`; `rateResult` grades rates) passed to
`runDueReputationEvaluations` in `apps/worker/src/jobs.ts` — all checks of one evaluation share one `context` object,
and mark the org due (`markReputationDue`) when new evidence arrives. A *one-off verdict* calls
`suspendOrganization({ organizationId, trigger: "<name>", actor: { kind: "system" }, note }, tx?)` directly (content
screening does both: it suspends on a block and its check keeps the verdicts in the window). Either way add
the trigger's label to `TRIGGER_LABELS` (`packages/reputation/src/schemas.ts`, shared by the dashboard and the
notification emails) and, if there is useful advice, to `ADVICE` (`packages/reputation/src/notifications.ts`); new thresholds go in
`ReputationPolicy` (+ overrides schema and the admin `PolicyForm`).

## Generated / managed files — don't hand-edit

- `packages/db/src/schema/auth.ts` (`bun run auth:generate`) and `packages/db/migrations/**` (`bun run db:generate`).
- `apps/api/openapi.json` (`bun run openapi:generate`; excluded from Biome).
- `infra/terraform/spec.json` (`bun run --cwd infra aws:spec:write`; excluded from Biome).
- `packages/sdk/package.json` `exports`/`main`/`module`/`types` (rewritten by the SDK build — commit the result).
- `sdks/<language>/**` (`bun run sdks:generate`; excluded from Biome) except the files its `.fernignore` lists,
  `sdks/VERSION` and the CHANGELOGs (the "Regenerate SDKs" PR bumps both), and `tooling/sdkgen/snippets.json`.
- `packages/kloq/src`: kloq's library, vendored from `cosscom/calendar` (excluded from Biome); and
  `apps/site/src/lib/calendar/registry/generated.json` + `apps/site/src/components/calendar/registry/what-lands.json`
  (`bun run --cwd apps/site calendar:registry` after changing the library or the registry's blocks; a test fails when stale).
- `packages/ui/src/{components,hooks,lib}`: vendored from the `@coss` registry and excluded from Biome; re-adding a
  component overwrites local edits.
- `bun.lock` (only via `bun install`; CI uses `--frozen-lockfile`).
- `packages/signals/src/disposable-domains.generated.ts` (`bun run signals:update-disposable`; local exceptions go in
  `ALLOWED_DOMAINS` / `EXTRA_DISPOSABLE_DOMAINS` in `packages/signals/src/email.ts`).
- The `<!-- BEGIN:*-agent-rules -->` blocks at the end of this file and in `apps/{web,site}/AGENTS.md` are rewritten by `turbo`
  and `next dev`: never edit inside them, keep project text above them, and commit tool changes to them.
- Agent docs: `AGENTS.md` files are the source of truth; each `CLAUDE.md` contains only `@AGENTS.md`. A new nested
  `AGENTS.md` needs a sibling `CLAUDE.md` shim, or Claude Code never sees it.

## Guardrails (verified against the versions in the root catalog — re-verify a bullet when bumping that library)

- **Runtimes:** Next.js and the `auth` / `drizzle-kit` CLIs run on **Node**; the API, scripts and tests run on Bun.
  Shared package `src/` must not use `Bun.*` or `bun:*` (tests may use `bun:test`) — use `pg` /
  `drizzle-orm/node-postgres` and `node:crypto`. Never `next --bun`, never `[run] bun = true` in bunfig.
- **TypeScript 7** (native, no JS API): `types` defaults to `[]` (list `["bun"]`/`["node"]`); `baseUrl` and
  `moduleResolution: node` are errors. VS Code needs the "TypeScript (Native Preview)" extension.
- **Next 16:** middleware is `src/proxy.ts`; request APIs and `params` are async; no `next lint`; keep `cacheComponents`
  off. Next doesn't edit tsconfigs that use `extends` — keep the manual `next` plugin + `.next/types` includes.
- **Drizzle 0.x** (see catalog): the drizzle.team docs default to v1 — don't use `defineRelations`, `drizzle-orm/zod`,
  `getColumns` until the catalog moves to 1.x.
- **Biome** is pinned exactly; keep the `$schema` URL in `biome.json` and `apps/web/biome.json` in step with it.
- **Better Auth** (details in `packages/auth/AGENTS.md` — read it before changing sign-in, sessions, API keys,
  invitations, org membership, 2FA, passkeys, social sign-in, SSO, SCIM, the iOS app's sign-in or account emails,
  including dashboard actions that call `auth.api.*`): `better-auth`, `@better-auth/core`, `@better-auth/api-key`,
  `@better-auth/passkey`, `@better-auth/sso`, `@better-auth/scim` and `auth` (CLI) stay on one identical exact version
  (catalog). Keys are organization keys or members' personal keys (their usage is that member's spend; see
  `packages/auth/AGENTS.md`). Keys are created only by `createEnvironmentApiKey` and authenticated only by `authenticateApiKey` (never
  `verifyApiKey`). `disabledPaths` blocks the HTTP routes of API keys, every organization route but
  create/accept-invitation, account changes, admin mutations and SSO provider management (server-side `auth.api.*`
  still works) — never re-enable them to "simplify" things. Better Auth's `bearer` plugin stays off (the iOS app's
  credential works only on `/api/mobile/*`). Never add NOT NULL columns to Better Auth tables. `packages/auth` must not
  import `next/*` or `"server-only"`; `nextCookies()` is appended last, only in `apps/web/src/lib/auth.ts`.
- **Tenancy rule:** every tenancy/email/webhooks function that touches tenant data takes `organizationId` and scopes its
  SQL by it; writes derive org/project from the environment row. Only `getMembership` (by slug), `authenticateApiKey`
  (from the key's binding), the platform-level `@coss/tenancy/admin` and `@coss/email/admin` modules,
  `listScreeningsForAdmin`/`countScreeningsForAdmin` (`@coss/screening`) and `platformUsageByDay` (`@coss/billing`)
  (call them only after `requirePlatformAdmin*`), and these system-level functions resolve the org
  themselves (scoping every write by the row's own org): `recordProviderEvent`/`ingestProviderEvents` (from the email
  id tag), `applyTenantStatus` (prefix-checked tenant name), `authorizeLiveSender` (reads domain names across orgs),
  `recordOpen`/`recordClick` (from the email's tracking token), `trackingBaseUrlFor` (dispatch; reads domain names
  across orgs like `authorizeLiveSender`), `receiveEmail`/`routeRecipients` (receiving; from the envelope recipients), `recordSmsEvent`/`ingestSmsEvents` (from the `sms_id` of the callback URL), `receiveSms` (from the receiving number), `handleStatusCallback`/`handleInboundCallback` (from the callback's subaccount), `authorizeLiveSmsSender`, `ingestDmarcReports` (from the report address's token), `reencryptWebhookSecrets` (operator script), `authenticateHookPortalSession` (from the session), and the worker scans `runDueWebhookDeliveries`, `runDueLogDrainDeliveries`, `runDueHookDeliveries`, `parkHeldHookDeliveries`, `runDueHookRecoveries`, the Hooks purges, `recheckDueDomains`,
  `recheckDueTrackingDomains`, `recheckDueReceivingDomains`, `reconcileDedicatedIpPools`, `sweepStaleClaims`, `sweepUnclaimedEmails`, `runDueReputationEvaluations`, `runDueOrganizationDeletions`, `runDueDmarcNotifications`, `runDueMigrations`, `EmailService.dispatchDue`,
  `SmsService.dispatchDue`, `sweepStaleSmsClaims`, `sweepUnclaimedSms`, `advanceDueSmsRegistrations`, `chargeDueSmsFees`
  (and the dispatch jobs, from the job's `organizationId`); `@coss/sms/admin` is platform-level like `@coss/email/admin`. Server actions take only slugs +
  target ids and derive the org from `requireOrgPermission`; every Better Auth organization call passes `organizationId`
  explicitly (never rely on `session.activeOrganizationId`).
- **Client-safe modules** never import `@coss/db`: `@coss/risk/{schemas,env}`, `@coss/observability/*`, `@coss/auth/{permissions,slugs,constants,api-key-permissions,org-access}`, `@coss/push/schemas`, `@coss/email/schemas`,
  `@coss/email/{broadcast-schemas,contact-schemas,test-event-schemas,env,templates}`, `@coss/sms/{schemas,segments,env}`, `@coss/hooks/{schemas,env}`, `@coss/reputation/schemas`, `@coss/screening/env`, `@coss/webhooks/{schemas,env}`, `@coss/versioning`, `@coss/retention`, `@coss/logs/{schemas,query}`, `@coss/billing/{catalog,schemas,engine,money,env,gate,wire}` (`gate` is types only), `@coss/ui/*`, `@coss/ui/theme.css`, `@coss/companion`, `@coss/migrate/templates`. `@coss/webhooks`, `@coss/db/jobs`, `@coss/screening/{ai,runtime}`, `@coss/email/{runtime,ses,dispatch,domain-connect}`, `@coss/risk/{runtime,datasets}`, `@coss/signals/*`, `@coss/sms` (root, `./twilio`, `./runtime`, `./dispatch`, `./admin`), `@coss/push` (root, `./apns`) and `@coss/billing` (root, `./metering`, `./runtime`, `./stripe`) are server-only; only `./stripe` (and `./runtime`) import the Stripe SDK. Server-only web
  modules start with `import "server-only"`.
- **Rate limits** (`@coss/ratelimit`): buckets are defined only in `BUCKETS` (`src/buckets.ts`); GCRA state is one
  key per bucket, `GCRA_SCRIPT` (Valkey) and `gcraStep` (memory) must stay in step (`test/store.test.ts` runs both).
  One consume call = one hash tag (`{scope:subject}`), so all its buckets share a scope and a cluster slot. The
  limiter applies each bucket's explicit `failureMode` on store errors and logs them: read-only API traffic allows,
  while authentication, writes, sends, quotas and public-ingress abuse controls deny. Never make it throw or block on Valkey. Never
  `FLUSH*`/`KEYS` (tests use random prefixes). Valkey time (`TIME`) is the clock, not the app's. API key buckets run
  after `requireApiKey` (a bad key spends no route bucket); key and aggregate-IP authentication buckets run before
  every database lookup, and `api.auth_failure` adds a client-IP penalty for bad keys. Send quotas are charged before `emailService.send` and refunded on replays and thrown errors.
  The worker charges `email.inbound.day` (per org, one per environment a message reaches) and **fails open** on
  purpose: a Valkey outage must never lose customer mail.
  Client IPs come only from `clientIpResolver` (`CLIENT_IP_HEADER`, rightmost-trusted `x-forwarded-for` entry) —
  never trust a raw header. Emails are hashed into keys. Better Auth's built-in limiter stays off
  (`rateLimit: { enabled: false }`): `apps/web/src/lib/auth-rate-limit.ts` wraps the `/api/auth` POST handler. The
  ElastiCache user's ACL (`valkey-bootstrap.ts` `APP_ACCESS`) must list every command the client and the scripts use
  (risk's `VELOCITY_SCRIPT` too). Changing it changes nothing live: re-run `valkey:bootstrap` in production (it
  rewrites the user's access string), or every script call with a new command fails with `NOPERM`/`ACL failure`.
  Per-org overrides are changed in the admin console's organization page through `changeRateLimitOverride`, which
  records a `rate_limit.override_*` audit event (bucket, previous and new rule) in the same transaction (the
  `ratelimit:set` script writes without one). Rule values are stored as `integer` (`MAX_RULE_VALUE`).

- **API versions** (`organization_api_version`, `webhook_endpoint.api_version`): an organization is pinned lazily to
  the latest version by its first authenticated request (`getOrganizationApiVersion`, insert-or-read; the dashboard
  only reads with `readOrganizationApiVersion`), and only moves forward (`setOrganizationApiVersion`, from org
  settings, `organization:update`). The outbox stores the latest-shape event; `renderWebhookPayload` renders it in
  the endpoint's version at every attempt and adds `api_version` (signed, in the body). Outbox payloads are typed
  `Stored*WebhookEvent` (no `api_version`). Never version error envelopes, and never transform in handlers.
- **Data retention** (`@coss/retention`): `RETENTION_DAYS` / `RETENTION_POLICY` are the only source of retention
  periods — the docs page (`/docs/data-retention`, `<RetentionTable />`/`<RetentionPeriod of>` MDX components, also
  rendered into `/llms*.txt`) and the dashboard's settings card render them, and each owning package's purge
  enforces them: `purgeExpiredEmails`/`purgeEmptyEmailBatches`/`purgeExpiredReputationRollups`/`purgeExpiredDedicatedIpRollups`/
  `purgeExpiredReceivedEmails`/`purgeExpiredFakeInboundObjects`/`purgeExpiredInboundDropCounters`/
  `purgeExpiredDmarcReports`/`purgeExpiredDmarcNotifications` (`@coss/email`;
  received content in S3 expires by the bucket's lifecycle rule, retention + 1 day),
  `purgeExpiredWebhookMessages`/`purgeExpiredWebhookListeners` (`@coss/webhooks`), `purgeExpiredScreenings` (`@coss/screening`),
  `purgeExpiredReputationNotifications`/`purgeExpiredReputationEvents` (`@coss/reputation`),
  `purgeExpiredRiskPersonalData`/`purgeExpiredRiskMemory`/`purgeExpiredRiskAssessments` (`@coss/risk`),
  `purgeExpiredPushNotifications` (`@coss/push`), `purgeExpiredSmsMessages`/`purgeExpiredReceivedSms` (`@coss/sms`), `purgeExpiredMigrations`/`purgeAbandonedMigrationDrafts` (`@coss/migrate`),
  `purgeExpiredAuthRows`/`purgeExpiredAdminAuditEvents` (`@coss/tenancy/retention`). The worker's `retention` loop
  (`apps/worker/src/retention.ts`, every 10 min, 1,000 rows per step, back-to-back while a step fills its batch) runs
  them in order (emails before their batches). Purges are system-level `DELETE … WHERE id IN (oldest batch)` with
  the condition re-checked, take `{ now, limit, scope }` (always pass `scope` in tests), and rely on cascades for
  children. Never purge: `queued`/`scheduled` emails, emails of an unfinished (`scheduled`/`sending`/`paused`) broadcast, webhook messages with a `pending` delivery (suspended orgs' are held),
  an org's latest reputation transition (notifications compare against it), `content_screening_counter` (the
  sampling sequence), suppressions (they outlive their email; the dashboard hides "View email" past the cutoff).
  The exception is Hooks: messages, deliveries and attempts are dropped by whole days with their partitions
  (`RETENTION_DAYS.hookMessages`, the worker's `partitions` loop), pending or not (the policy says so); its small tables
  have purges (`purgeExpiredHookIdempotencyKeys`, `purgeExpiredHookPortalSessions`, `purgeFinishedHookRecoveries`).
  Email retention must exceed the reputation window (≤ 30 days) and rollup recounts (31 days) — a test checks it. A
  new table either gets a catalog entry + purge or is covered by an existing "while your account exists" rule; changing
  a period changes the published policy, so treat it like a terms change.
- **Platform admin** (`/admin`, `@coss/tenancy/admin`): every admin page calls `requirePlatformAdmin()` itself — Next
  renders layouts and pages in parallel, so the layout's check alone would still stream the page's data to non-admins
  (verified). Actions use `requirePlatformAdminAction()` and record an `admin_audit_event` (append-only; no FKs; the
  actor's email is copied; deleted after `RETENTION_DAYS.adminAuditLog`); suspension/key revocation write it in the same transaction. Admins can't act on
  themselves; never send session tokens to the browser (revoke-one looks the token up server-side).
  Visibility: the overview, Sending (orgs by live volume), Emails (every org's emails, `@coss/email/admin`),
  Sign-ups (`RISK_SIGNUP_ENVIRONMENT_ID`'s assessments joined to accounts by address) and Screening pages. An
  email's content is only loaded by `revealEmailContentAction`, which records `email.view_content` in the
  admin audit log (never the organization's own: that would tip off an abuser); never render it with the page,
  and preview it with `UNTRUSTED_PREVIEW_HEAD` (no remote loads: a tracking pixel would tell the sender too).
  **Take down** (`takeDownOrganizationAction`, from `planOrganizationTakedown`) suspends the organization,
  revokes its keys and permanently bans members without another active organization (platform admins, the
  actor and already-banned users are kept), each step audited on its own, so it can be re-run.
  **Deploys** (`/admin/deploys`, `src/lib/deploys.ts`; pure parts in `deploy-runs.ts`) reads GitHub only through
  the coss.com Deploy app's installation token (Actions write, Contents read — never widen it): "Deploy now"
  dispatches `deploy.yml` for main and cancels push runs still before their deploy job; "Redeploy" dispatches
  `image_tag` for a commit a recent run deployed (re-checked server-side). It parses the runs' job names (`gate`,
  `build (…)`, `deploy`, its `Roll out` step) and the `run-name` of `image_tag` dispatches: change them together.
  The pages poll GitHub (`DEPLOY_REFRESH_SECONDS`): GETs are conditional (ETags; a 304 doesn't count against the
  token's 5,000 requests an hour) and the overview is shared for a few seconds, so keep new reads behind `github()`.
  A run's page (`[runId]`) also downloads failed jobs' logs (only their last 256 KB, excerpted by
  `failureLogExcerpt`; GitHub masks the workflow's secrets in them).
- **Organization suspension** (`organization_suspension`, presence = suspended; reason is admin-internal): enforced in
  `authenticateApiKey` (`suspended` → 403 `organization_suspended`, only for otherwise-valid keys),
  `createEnvironmentApiKey`, webhook `claimDue` (held, not failed), the Better Auth org hooks
  (`packages/auth/AGENTS.md`), and the dashboard (`OrgContext.can()` / `requireOrgPermission` allow only reads). New
  write paths must respect it. Domain re-checks and SES event ingestion keep running. Gate dashboard controls with `can(…)` from `requireOrgMember`, not `orgRoleCan`.
- **Monitoring** (Sentry, `@coss/observability`): api and worker import `src/instrument.ts` first in `src/index.ts`
  (`@sentry/bun`; Bun has no runtime module hooks, so Hono gets `honoMiddleware(app)` in `createApp` — route names
  only, errors come from `onError`'s `console.error` — and pg/AWS calls aren't traced). The dashboard initializes
  its server in `register()` after env validation and exports `onRequestError`; both Next apps' browsers run
  `startBrowserMonitoring` (`src/instrumentation-client.ts`), which fetches the config from the dashboard's
  `/api/monitoring` (public in `proxy.ts`; the site proxies it in `next dev`) and tunnels envelopes through it
  (only the configured DSN's — never make it an open relay or add a Sentry origin to a CSP). The browser SDK is
  dynamically imported from `src/lib/monitoring-browser.ts` (named re-exports) only once that config arrives:
  client code never imports `@sentry/nextjs` statically, and never `import * as Sentry` (the namespace defeats
  tree-shaking and shipped Session Replay — ~150 KB gzipped — on every page). Every server runs
  `captureConsoleIntegration({ levels: ["error"] })`: a `console.error` with an error **is** a Sentry event, so
  packages keep logging handled failures that way and never import an SDK (expected outcomes don't belong in
  `console.error`). Every SDK uses `sentryOptions`: `DATA_COLLECTION` turns off what SDK v11 collects by default (bodies, IPs, cookies, query strings, AI prompts, local variables — never loosen it) and the `scrub*` hooks mask what remains; new URL secrets
  (tokens in paths) go in `SECRET_PATH_SEGMENTS` (`packages/observability/src/scrub.ts`). Tags: `request_id`,
  `organization_id`, `environment_id`, `api_key_id` (API), user id + `organization_id` (dashboard), `loop`,
  `email_id` (worker); never emails or content. No session replay (it would record customer data).
- **Live keys** (`coss_live_`) require a verified email and can't be created while impersonating or reputation-suspended (`liveKeyRestriction`,
  `apps/web/src/lib/live-keys.ts`, enforced in the action and mirrored in the UI).
- **Email preview iframe** (`…/emails/[emailId]/page.tsx`): `sandbox=""`, `referrerPolicy="no-referrer"`, CSP
  `PREVIEW_HEAD` prepended to `srcDoc`. Never add `allow-scripts` or `allow-same-origin`.
- **Product rules live next to their code** — read the `AGENTS.md` below before changing a product (each is loaded
  when you open files in its directory, so read it yourself when you work on the product from an app). The invariants
  that reach beyond them:
  - **Email** (`packages/email/AGENTS.md`: SES, suppressions, open/click tracking, one-click unsubscribe, custom
    tracking domains, scheduled and batch sends, attachments, generated text parts, reads, templates, receiving): only the
    `coss_email_id` tag is ever set on SES messages; `SendEmail` is not idempotent (only throttling is retried); coss.com
    keeps the only suppression list and does its own open/click tracking — never turn SES's on; `email.html` always
    keeps the original (only the provider's copy is instrumented); templates are rendered at send and the `email`
    row stores the result.
  - **SMTP relay** (`apps/smtp/AGENTS.md`): never a raw MIME passthrough — every message goes through
    `EmailService.send` like `POST /v1/emails`; never move Bcc'd addresses into visible headers.
  - **Billing** (`packages/billing/AGENTS.md`): coss.com owns the catalog, contracts, rating and invoices; the provider
    (Stripe) only collects — never move pricing into Stripe objects. Products meter through `@coss/billing/metering`
    and take plan checks injected (`PlanGate`/`UsageGate`). Billing holds and reputation suspensions are independent.
  - **Webhooks** (`packages/webhooks/AGENTS.md`: delivery, the shared engine, endpoint health, secret rolls, log
    drains): deliver only through `createWebhookSender`; payloads never include bodies, headers, cc or bcc; every write
    of a secret column goes through `encryptSecret`, and `reencryptWebhookSecrets` covers every encrypted column.
  - **Hooks** (`packages/hooks/AGENTS.md`): day-partitioned tables with no FKs in or out; portal tokens never in a
    path, query or cookie.
  - **Reputation** (`packages/reputation/AGENTS.md`): a suspension is never lifted automatically (only
    `reinstateOrganization`); the worker never suspends coss.com's own organization.
  - **SMS** (`packages/sms/AGENTS.md`): opt-outs are always honored (STOP suppresses in every live environment);
    live sends only from an organization's `active` number whose registration is `approved`; Twilio's `SmartEncoded`
    stays off (coss.com bills the segments it counts); subaccount tokens only through `encryptSecret` (and
    `reencryptWebhookSecrets`); Twilio's negotiated rates and the markup are never committed (the repo is public).
  - **Content screening** (`packages/screening/AGENTS.md`): an unscreened sample is never sent; verdicts never store
    content and scores are admin-only.
  - **Logs** (`packages/logs/AGENTS.md`): `log_entry` rows only through `appendLogEntries`; bodies only through
    `redactBody`, never `Authorization`, cookies or attachment bytes.
  - **Push notifications** (`packages/push/AGENTS.md`): products call `enqueuePush(tx, …)` in the transaction that
    decided the event; devices belong to an app session, never to a user alone; the text passes through Apple, so names
    and counts only — never free-form text, addresses, URLs, scores or notes.
  - **Risk** (`packages/risk/AGENTS.md`): memory is HMAC-only (`RISK_HASH_KEY`); raw email, IP and user agent live
    only on `risk_assessment`; signals fail open.
  - **Organization deletion** (`packages/tenancy/AGENTS.md`): a table with many rows per organization belongs in
    `deleteOrganizationData`, anything held outside Postgres in `releaseProviderResources`.

## Local dev

- Postgres.app: `createdb coss && createdb coss_test`; URLs like `postgres://<macOS user>@localhost:5432/coss` (no
  password — the `postgres:postgres` form in `.env.example` is CI's).
- `bun run db:migrate && bun run db:seed`, then sign in at http://localhost:3000 as `demo@coss.local` /
  `coss-demo-password` (platform admin; org `acme` with the verified fake domain `acme.test`, project `default`).
  Each seed run prints a new `COSS_API_KEY`.
- Send with `COSS_API_KEY=… COSS_BASE_URL=http://localhost:3001 bun packages/sdk/examples/send-email.ts` (live keys:
  add `COSS_FROM=hello@acme.test`; `COSS_TO=bounce@simulator.amazonses.com` simulates a bounce). Webhook endpoints
  may be `http://127.0.0.1:…` locally; the worker (part of `bun run dev`) delivers them.

## Known limitations (v0)

- Sends are asynchronous: `POST /v1/emails` stores the email and its `email-dispatch` pg-boss job in one transaction
  and returns 202 `queued`; the worker runs `dispatch`, which claims the email (sets `provider`) before calling the
  provider, so a job that runs twice never sends twice. Retries with the same `Idempotency-Key` replay the email in its
  current state (queued included). If a worker dies after the claim (or SES's answer is lost: a timeout or reset
  connection, `UncertainSendError`), the row stays `queued` until the stale-claim sweep
  (15 min) marks it `sent` (if SES reported it) or `failed`/`dispatch_interrupted` (a late SES `Send` event still
  repairs it). An email still unclaimed after 10 min (its job exhausted its retries) is re-enqueued, and after 1 hour
  (`UNCLAIMED_FAIL_MS`) it is `failed`/`dispatch_failed` with an `email.failed` webhook — so a worker outage longer than
  an hour fails the emails queued during it instead of sending them late. Sends need the worker running.
- Logs are best effort: request lines are buffered (up to 1 s, dropped if the database is down), requests with an
  invalid or missing key can't be attributed and aren't logged, and free-text search is a substring match. Facets and
  the histogram scan the selected range, so very long ranges on busy environments are slow (no rollups yet).
- Webhook deliveries are not ordered (use `data.occurred_at`; SES itself may publish a complaint before the
  delivery). SES complaints may list every recipient on the complaining domain (and each of them gets suppressed).
  SES never suppresses mailbox-simulator addresses, and with tenant-level suppression `suppressionlist@simulator.amazonses.com` is a plain hard bounce — only
  the fake provider simulates `suppressed` (via that address).
- Content screening only samples (a sender can still get unsampled messages through, until the random sample or
  bounces/complaints catch up) and its scores are uncalibrated model probabilities; thresholds were chosen, not
  measured against labeled coss.com traffic. Injected text in a message can lower its scores. An org-wide suspension from
  one false positive needs an admin to reinstate.
- Tracking does not filter bots: mail clients that prefetch images (e.g. Apple Mail Privacy Protection) inflate opens
  and link scanners inflate clicks. Providers send one message to every recipient, so hits on emails with several
  recipients have `recipient: null`.
- Rate-limit outage behavior is explicit per bucket: read-only API traffic fails open, while security and cost
  controls fail closed. Override changes take up to a minute (per-process cache). Without `CLIENT_IP_HEADER`, public
  unauthenticated entry points use a per-process aggregate subject instead of a client IP. Sign-in is also limited per email address, so
  someone hammering an address delays its owner's sign-in for as long as they keep at it (accepted).
- SSO domains must be verified **email** domains, so an organization that signs in with a domain it doesn't send
  from still adds it under Domains (which creates an SES identity). OIDC IdPs must be public `https://` hosts.
  SAML errors after the IdP step land on the callback URL (`?error=`), not on `/sso`. The SAML path is covered by
  Better Auth's own tests only (ours drive OIDC against oauth2-mock-server).
- Directory sync only manages members and admins: owners are never added, demoted or removed by it (a directory
  deactivating an owner shows a warning on the SCIM page), and groups only map to roles. Directory users must sign
  in through the organization's SSO provider, so SCIM needs one.
  Disconnecting keeps every member. Profile changes of linked (pre-existing) accounts are not synced.
- Next's cache is per task (nothing uses ISR or `revalidateTag` yet; add a shared `cacheHandler` first).
- Abuse prevention is best-effort: the disposable list only knows public burner services (refresh it), one-account-
  per-mailbox folds only well-known providers' dots/`+tags`, the DNS check lets every lookup failure through, and a
  Cloudflare siteverify outage blocks password sign-in, sign-up and reset (passkeys and SSO keep working).
- Accepted: sign-up email enumeration. A user ban does not cut off their orgs' organization API
  keys (only their personal keys) — suspend the organization. Suspension does not pause the SES tenant itself;
  already-queued immediate sends finish, while scheduled sends wait for the suspension to be lifted.

- Receiving is SES-region bound (SES receiving regions only) and accepts any mail for a verified domain of the
  account, then drops what doesn't route (no SMTP-time rejection, no bounces). Over an organization's daily inbound
  limit mail is dropped and only counted. Received `cid:` inline images don't render in the dashboard preview.
  Content written for a message whose row never committed (a crash in between) stays until the lifecycle rule.
- Account emails go to unverified addresses by design (sign-up verification, invitations) from coss.com's own
  organization, so bounces from made-up sign-up addresses count against that organization's reputation like any
  customer's — but the worker never suspends it on its own (`systemOrganizationId`: the guard only warns it and a
  screening block only flags its message), and neither can platform admins (the dashboard reads the same variable).
  If it was suspended before this rule, an admin can still lift it. Sign-up and verification
  resends are rate limited per IP and address; invitations only by Better Auth's pending-invitation limit per org.
- Reputation rollups are kept per hour of sending, so late events for an old hour make the next evaluation
  recount that whole hour. Emails are purged 45 days after creation, so a send scheduled weeks ahead can be gone
  before it leaves a 30-day window; its closed hour keeps its rolled-up counts unless a later event forces a recount. A send already past `authorizeLiveSender` when the org is suspended still goes out.
  Customers are told by banner, page, API, webhooks and a notification email to owners/admins — only for warnings
  and suspensions (not recoveries or reinstatements), and only once the worker's `NOTIFICATIONS_*` variables point
  at a verified sender of coss.com's own organization.

**Not built yet** (don't assume these exist; delete a line when it ships): the real landing page,
Universal Link sign-in callbacks, an Android app, App Store (beyond TestFlight) releases of the iOS app, push notifications for other events (or per organization),
log drain secret rolls and custom request headers (vendor intake APIs that need an API key header take a relay),
in the generated SDKs (`sdks/*`): auto-pagination, a `COSS_BASE_URL` default and typed events from webhook
verification outside Go (the others return plain JSON), framework drivers built on the generated SDKs,
IdP-initiated SAML and SAML single logout, more than one SSO provider per organization,
editing an API key's permissions (create a new key), API keys restricted to sending domains or IP addresses,
org logos, uploading a profile picture, user account deletion (before adding it: `sso_provider.user_id` and `member.user_id` cascade, which
would drop an org's SSO provider or last owner), email change,
email/SMS two-factor codes, sign-in providers other than Google and GitHub, "trust this device" for 2FA, renaming passkeys, webhooks and notification emails for dedicated IP status changes, standard (manually
warmed) dedicated IPs or more than one pool per organization, an automatic direct-debit policy (only per-account
required payment methods), multi-currency, metering for video/scheduling (their meters
and rates exist; the products don't), SMS alphanumeric sender IDs, short codes, MMS, batch SMS, SMS templates,
sole-proprietor 10DLC brands, `sms.registration.*` webhooks and push notifications, Twilio usage reconciliation, and
these Hooks features: channels, payload transformations, custom endpoint headers, sending one message to several
applications, strict ordering, portal custom domains, per-destination rate-limit overrides, Hooks attempts in
environment logs and log drains.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
