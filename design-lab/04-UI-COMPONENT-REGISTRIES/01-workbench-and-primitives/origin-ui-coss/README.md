# coss.com

One API key, one SDK, every communication primitive:

```ts
import { Coss } from "coss";

const coss = new Coss({ apiKey: process.env.COSS_API_KEY });

const { data, error } = await coss.email.send({
  from: "Acme <hello@acme.dev>",
  to: "user@example.com",
  subject: "Welcome",
  html: "<p>Hi there</p>",
});
```

Transactional email is the first product, delivered by **Amazon SES** (`EMAIL_PROVIDER=ses`) or a **fake
provider** for local development (nothing leaves your machine). Development (sandbox) environments always use the
fake provider, which simulates delivery events like the SES mailbox simulator. Live sends come from verified
domains; every recipient gets a delivery status, and signed webhooks report `email.delivered`, `email.bounced`
and the rest.

## Stack

Bun workspaces · Turborepo · TypeScript 7 · Biome · Next.js 16 (dashboard) · Hono (public API) ·
Postgres + Drizzle · Valkey (rate limits) · Better Auth (organization, admin, API key plugins) · Tailwind v4 + [coss ui](https://coss.com/ui) ·
[Fumadocs](https://fumadocs.dev) (coss.com and its docs: OpenAPI reference, Twoslash) · Expo + Expo Router (iOS app)

See [AGENTS.md](./AGENTS.md) for the layout, conventions and guardrails.

## Prerequisites

- [Bun](https://bun.com) ≥ 1.4.2 and Node.js ≥ 24 (Next.js and the Better Auth CLI run on Node)
- PostgreSQL 18 (e.g. [Postgres.app](https://postgresapp.com))
- [Valkey](https://valkey.io) 8 (or Redis) for the test suite, e.g. `brew install valkey && brew services start valkey`
- VS Code: install the recommended extensions (Biome, TypeScript Native Preview)

## Setup

```sh
bun install
createdb coss && createdb coss_test
cp .env.example .env             # then set DATABASE_URL, TEST_DATABASE_URL, BETTER_AUTH_SECRET and
                                 # WEBHOOK_SECRETS_KEY (each: openssl rand -base64 32)
bun run db:migrate
bun run db:seed                  # creates demo@coss.local (admin), org "acme" with the verified domain
                                 # acme.test, a project, and prints a dev API key
bun run dev                      # dashboard http://localhost:3000/dashboard · API http://localhost:3001 ·
                                 # site + docs http://localhost:3002 · worker
```

Then set up the shared build cache once per machine ([Remote cache](#remote-cache-turborepo-on-vercel)): without it
everything works, but CI rebuilds what you already built.

`db:migrate` also installs the `pgboss` schema: sends return `202` with `status: "queued"` and the worker
dispatches them moments later, so keep the worker running.

Send an email with the key printed by the seed:

```sh
curl -X POST http://localhost:3001/v1/emails \
  -H "Authorization: Bearer $COSS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Acme <hello@acme.dev>","to":"user@example.com","subject":"Hello","text":"Hi!"}'

# or with the SDK from this repo
COSS_API_KEY=coss_test_... COSS_BASE_URL=http://localhost:3001 bun packages/sdk/examples/send-email.ts
```

The email shows up in the dashboard under the project's **Development** environment, with per-recipient
status and events. Send to `bounce@simulator.amazonses.com` (or `complaint@`, `suppressionlist@`) to simulate
failures. Add a webhook endpoint in the environment's **Webhooks** page (local `http://` URLs are allowed outside
production) and the worker delivers signed events to it. Auth emails (email verification, invitations, password
resets) are printed to the dashboard's server console in development.

## Concepts

- **Organizations & members** — Better Auth organization plugin (roles: owner, admin, member).
- **Projects** — belong to an organization; each gets two **environments**:
  `production` (mode `live`, keys `coss_live_…`) and `development` (mode `sandbox`, keys `coss_test_…`, never really sends).
- **API keys** — Better Auth API key plugin, owned by the organization and bound to one environment.
- **Domains** — owned by the organization and shared by its projects. Live keys can only send from verified
  domains (Easy DKIM + a `send.` MAIL FROM subdomain); sandbox keys accept any `from`.
- **Recipients & events** — each email has one recipient per distinct address, whose status follows delivery
  events: `queued` → `sent` → `delivery_delayed` → `delivered`, then `bounced`/`suppressed`/`failed`, `complained`.
- **Attachments** — up to 20 base64 files per send (25 MB combined), inline images via `content_id` (`cid:`).
  Only metadata is kept once the email is sent.
- **Suppressions** — per environment. Sends skip a suppressed recipient (status `suppressed`, event
  `email.suppressed`) and still deliver to the rest. An entry covers every email (scope `*`) or one **category**
  (the optional `category` of a send, e.g. `marketing`), so it can back an unsubscribe flow. Permanent bounces and
  complaints add `*` entries automatically (except for mailbox simulator addresses), one-click unsubscribes an
  entry for the email's category. coss.com keeps the only list: SES
  suppression is turned off.
- **Scheduled sends** — pass `scheduled_at` (ISO 8601 with an offset, up to 30 days ahead) and the email is stored
  as `scheduled` (event `email.scheduled`); the worker sends it when it is due, re-checking the domain and the
  suppression list. Until then `POST /v1/emails/{id}/reschedule` moves it to a new time (event `email.rescheduled`)
  and `POST /v1/emails/{id}/cancel` cancels it (`canceled`, event `email.canceled`).
- **One-click unsubscribe** (RFC 8058) — off by default; turned on per category with the tracking rules (or per send,
  `tracking: { unsubscribe: true }`). Emails with a category and a single recipient get `List-Unsubscribe` +
  `List-Unsubscribe-Post` headers pointing at the tracking host (`/t/u/<token>`); the one-click POST suppresses the
  recipient for that category (reason `unsubscribe`) and records `email.unsubscribed`.
- **Open & click tracking** — off by default. Turn it on per environment (a default plus per-category rules, in the
  dashboard) or per send (`tracking: { opens, clicks }`). coss.com adds an invisible image and rewrites HTML links to its
  own redirect (`API_PUBLIC_URL/t/…`) when it hands the email to the provider; the stored email keeps the original
  HTML. Opens and clicks show up as `email.opened` / `email.clicked` events, webhooks, counts on the email
  (`tracking`) and per-link click counts. Independent of SES's own tracking, which stays off.
  A verified domain can have a **custom tracking domain** (e.g. `links.acme.com`, a CNAME to `track.cosslinks.com`):
  emails from it are tracked through that hostname while it is active. coss.com registers it as a Cloudflare for SaaS
  custom hostname (`TRACKING_DOMAIN_PROVIDER=cloudflare`), which issues its certificate and proxies `/t/*` to the API.
- **Webhooks** — per environment, signed with [Standard Webhooks](https://www.standardwebhooks.com) headers and
  retried for about a day. Verify them with `verifyWebhook` from the SDK.
- **Single sign-on** — per organization, OpenID Connect or SAML 2.0 (Better Auth's SSO plugin), set up under
  the organization's Settings → Single sign-on. Its domains must be the organization's **verified email domains**:
  no second DNS check. People at those domains join as members on their first SSO sign-in, and existing accounts
  with a verified email are linked. Owners can **require SSO**: members and admins then need an SSO session from the
  organization's provider (owners keep password "break-glass" access). An SSO session also satisfies the
  organization's two-factor requirement — the IdP is responsible for MFA. Support recovers broken setups from
  `/admin` (unlink a user's SSO accounts, stop requiring SSO, disable a provider).
- **Directory sync (SCIM 2.0)** — per organization, under Settings → Directory sync (needs an active SSO provider).
  The IdP (Okta, Entra ID, JumpCloud…) provisions users at `/api/auth/scim/v2` with an expiring bearer token: active
  users are members, members of groups mapped to admin are admins, and deactivating or deleting a user removes them
  from the organization and ends their SSO sessions there. While a directory is connected, only its active users
  (and owners) sign in with SSO. Owners are never changed by the directory. Support can disconnect a directory from
  `/admin`.
- **Reputation guard** — the worker watches each organization's live bounce and complaint rates (per recipient, over
  7 days) and acts without a human: a **warning** at 4% bounces / 0.08% complaints, an automatic **suspension** of
  live sending at 8% / 0.3% (from 200 / 500 recipients). Suspended organizations get `403 account_suspended` on live
  sends and can't create live keys; sandbox keys keep working. Customers see it in the dashboard (banner +
  **Reputation** page), via `GET /v1/reputation`, through `account.*` webhooks and by email to the organization's
  owners and admins (sent through coss.com itself, see "Deploying to AWS"). Only platform admins reinstate
  (`/admin/organizations`), where they can also suspend manually and override thresholds per organization.
- **Content screening** — right before a sampled live email reaches the provider, the worker asks an AI decision
  model (TypeSafe AI's Jev through the Vercel AI SDK and AI Gateway, swappable with `SCREENING_MODEL`) how likely
  it is spam, phishing, malware or fraud. Sampled: each organization's first 10 live emails, its 25th, 50th, 100th,
  250th, 500th and 1000th, then 2% at random. At ≥ 0.95 the email fails with `content_rejected` and the
  organization is suspended (the reputation guard's `content_screening` trigger); at ≥ 0.70 it is sent but the
  organization is warned until the flag ages out of the window. In enforcement mode, classifier errors and
  timeouts (3 s) hold the email: it is tried (and screened) again every minute, and fails as
  `content_screening_unavailable` only if screening is still down an hour after it was due. coss.com's
  own notification organization always sends so an AI outage cannot stop account recovery. Admins see every verdict on the organization's reputation page and can
  tune thresholds and sampling, switch to shadow mode, or turn screening off per organization (e.g. for
  phishing-simulation senders). Locally `SCREENING_CLASSIFIER=fake` flags content containing `[coss-test:phishing]`
  (or `spam`, `malware`, `fraud`; `[coss-test:spam:0.8]` sets the score).
- **Organization deletion** — owners delete an organization from its Settings by typing its slug (not while it
  is suspended; platform admins can, from `/admin`, audited). Members, invitations, API keys, the SSO provider and
  the sessions it created go at once and scheduled emails never send; the worker then removes the organization's
  SES identities and tenant, deletes its data in batches and finally the organization, which frees its slug. A
  record of the deletion (who, when) is kept. There is no undo.
- **Data retention** — the worker deletes data once it passes its published period (`packages/retention`, shown at
  `/docs/data-retention` and in each organization's settings): emails with their events and links after 45 days,
  webhook deliveries after 30, screening verdicts after 90, standing history and the admin audit log after 2 years,
  expired sessions and invitations 7 days after expiry. Suppressions and configuration are kept until deleted.
- **Platform admins** — the console at `/admin` (promote with `bun run admin:create --email …`): search users and
  organizations; ban users (with a reason and duration — signs them out everywhere), grant/remove the admin role,
  revoke sessions, impersonate (with a reason, never other admins); **suspend organizations** (API keys get 403
  `organization_suspended`, webhook deliveries are held until lifted, the dashboard turns read-only and membership
  changes are blocked; members never see the internal reason); revoke a single leaked API key. Every action is
  recorded in an append-only audit log (`/admin/audit`). Banning a user doesn't stop their organizations' keys —
  suspend the organization for that.

## Commands

| Command | |
|---|---|
| `bun run dev` | Run dashboard + API + site + worker |
| `bun run lint` / `bun run format` | Biome check / fix |
| `bun run typecheck` | Type-check every package |
| `bun run test` | Run all tests (against `coss_test`) |
| `bun run build` | Build dashboard + site (standalone servers) + SDK |
| `bun run db:generate` / `db:migrate` / `db:studio` | Drizzle migrations |
| `bun run auth:generate` | Regenerate Better Auth tables after changing auth plugins (then `db:generate` + `db:migrate`) |
| `bun run signals:update-disposable` | Refresh the list of disposable email domains (refused at sign-up, flagged by risk assessments) |
| `bun run ses:bootstrap` | Create/update the shared AWS resources for `EMAIL_PROVIDER=ses` (see below) |
| `bun run valkey:bootstrap` | Create/update the ElastiCache Serverless for Valkey cache for rate limits (see below) |
| `bun run ratelimit:set --org <slug> [--bucket … --limit … \| --reset]` | Show or change an organization's rate limits |

## Remote cache (Turborepo on Vercel)

`typecheck` and `build` results are shared through Turborepo's [Vercel Remote Cache](https://vercel.com/docs/monorepos/remote-caching)
(Vercel team **`cal`**) by everyone's machines, agents and CI. Turbo fingerprints each task's inputs (source,
lockfile, `turbo.json`, `NODE_ENV`, `NEXT_DEPLOYMENT_ID`); when CI computes a fingerprint someone already built, it
downloads that result instead of building again, so running `bun run typecheck && bun run build` before pushing
makes CI's check and build jobs near-instant. On pull requests those two jobs check out the pushed commit (what you
built), while the test job runs on GitHub's merge with `main`; `main`'s own run covers the merged result. Any change
to the inputs is a miss and CI runs the task itself, so nothing goes unchecked. Tests are never cached. Artifacts are HMAC-signed with a shared key; Turbo ignores
(rebuilds) anything that doesn't verify.

**One-time setup per machine** (a laptop, or a box agents run on; every worktree on it picks it up):

1. Be a member of the `cal` team on Vercel.
2. Put the team and the signing key (password manager: "coss.com turbo remote cache signing key") in a private file
   and load it from your shell profile (open a new shell afterwards). Turbo only reads the shell's environment, never `.env`:
   ```sh
   mkdir -p ~/.config/coss && install -m 600 /dev/null ~/.config/coss/turbo.env
   cat > ~/.config/coss/turbo.env <<'SH'
   export TURBO_TEAM=cal
   export TURBO_REMOTE_CACHE_SIGNATURE_KEY='<signing key>'
   SH
   # first line of ~/.zshrc (macOS) or ~/.bashrc — above any "not interactive → return" guard, so agents'
   # non-interactive shells load it too:
   [ -f "$HOME/.config/coss/turbo.env" ] && . "$HOME/.config/coss/turbo.env"
   ```
3. Log Turbo in (stores a token in Turbo's user config; the Vercel CLI's own login is not used):
   ```sh
   bunx turbo login                 # pick the cal team if asked
   # headless box: create a token at https://vercel.com/account/tokens (scope: cal), then
   bunx turbo login --manual        # Remote Cache URL: https://vercel.com/api (not https://vercel.com);
                                    # needs TURBO_TEAM=cal from step 2 in this shell
   ```
4. Check it: `bun run typecheck` prints `Remote caching enabled` in its header. `Remote caching disabled` or
   `Remote caching unavailable (Authentication failed …)` means step 2 or 3 is missing; builds still work, unshared.

**CI** reads `secrets.TURBO_TOKEN` (a Vercel token scoped to `cal`), `vars.TURBO_TEAM` (`cal`) and
`secrets.TURBO_REMOTE_CACHE_SIGNATURE_KEY` (`gh secret list`, `gh variable list`); without them it runs every task.
Rotating the signing key means updating the GitHub secret and every machine's `turbo.env` (old artifacts then miss
and are rebuilt). Anyone with a `cal` token and the key can upload results CI will accept: treat them like push
access, and revoke a leaver's token (vercel.com/account/tokens, or remove them from the team).

Runtime settings (`DATABASE_URL`, secrets, URLs, …) are pass-through and never part of a fingerprint, which is what
lets laptops and CI share results — see "Adding one" in AGENTS.md before adding a variable that changes build output.

## iOS app

`apps/mobile` is the iOS companion app (Expo SDK 57). It needs Xcode with an iOS Simulator and the dashboard running
(`bun run dev`):

```sh
bun run --cwd apps/mobile ios    # generates ios/, builds, installs and opens the app on the Simulator
bun run --cwd apps/mobile start  # Metro only, once the app is installed
```

"Sign in with coss.com" opens the dashboard's sign-in in a browser sheet (`demo@coss.local` / `coss-demo-password`
after `db:seed`). The app reads `EXPO_PUBLIC_DASHBOARD_URL` (default `http://localhost:3000`); on a physical device
set it to your Mac's LAN address in `apps/mobile/.env.local`, and run the dashboard with `BETTER_AUTH_URL` on that
address too. Signed-in devices are listed under Settings → Sessions. See `apps/mobile/AGENTS.md`.

## API

- `POST /v1/emails` — send an email (`Idempotency-Key` header supported)
- `POST /v1/emails/batch` — send up to 100 emails at once, all or nothing (one `Idempotency-Key` for the batch)
- `GET /v1/emails/{id}` — retrieve an email, with its recipients' delivery status
- `GET /v1/emails/{id}/events` — list an email's delivery, open and click events
- `GET /v1/emails/{id}/links` — list an email's tracked links with their click counts
- `POST /v1/emails/{id}/cancel` — cancel a scheduled email (`scheduled_at` on send)
- `POST|GET /v1/domains`, `GET|DELETE /v1/domains/{id}`, `POST /v1/domains/{id}/verify` — sending domains
  (organization-wide, so every key of the organization sees the same ones)
- `POST|GET /v1/webhook_endpoints`, `GET|PATCH|DELETE /v1/webhook_endpoints/{id}` — webhook endpoints of the
  key's own environment; the signing secret is returned only when one is created
- `POST /v1/suppressions` — suppress an address (`scope`: `*` or a category)
- `GET /v1/suppressions` — list the environment's suppressions (`address`, `scope`, `limit`, `after`)
- `GET /v1/suppressions/check?address=…&category=…` — would a send skip this address?
- `GET /v1/suppressions/{id}` / `DELETE /v1/suppressions/{id}` — retrieve / remove an entry
- `POST /v1/suppressions/import` — add up to 1,000 entries at once (invalid ones are skipped and reported)
- `GET /v1/suppressions/export` — the whole list as CSV (`scope`, `reason` filters); it imports again as is
- `GET /openapi.json` — OpenAPI 3.1 document
- `GET /v1/reputation` — the organization's standing and latest rates
- `GET /t/o/{token}`, `GET /t/c/{token}/{position}` — public open-pixel and click-redirect endpoints that tracked
  emails link to (not part of the documented API)

Everything is also available in the dashboard, and through the SDK as `coss.email`, `coss.domains`,
`coss.webhookEndpoints` and `coss.reputation`.

### SDKs in other languages

`sdks/` holds SDKs for Python (`cosscom`), Go (`github.com/cosscom/coss-go`), Ruby (`coss`), PHP (`coss/coss`),
Java (`com.coss:coss`) and .NET (`Coss`), generated from `apps/api/openapi.json` with Fern's open-source generators:
`bun run sdks:generate` (needs Docker). On main, the "Regenerate SDKs" pull request
(`.github/workflows/sdks-regenerate.yml`) keeps them up to date, and merging it publishes them
(`release-sdks.yml`, skipped until the repository variable `SDKS_PUBLISH` is `true`). How they're made, what's
hand-written and the one-time registry setup: [`sdks/AGENTS.md`](./sdks/AGENTS.md).

Requests are rate limited per API key by route class (reads, writes, sends; responses carry `RateLimit-Limit`,
`RateLimit-Remaining` and `RateLimit-Reset`), and sends count their distinct recipients against the
organization's quota per second and per day (sandbox environments have a small daily quota of their own).
Over a limit the API answers `429 rate_limit_error` (`rate_limited` or `quota_exceeded`) with `Retry-After`.
Defaults live in `packages/ratelimit/src/buckets.ts`; platform admins override them per organization on the
organization's page in the admin console (`/admin/organizations`, recorded in the audit log) or with
`bun run ratelimit:set`. The dashboard limits sign-in, sign-up, password reset and verification emails per
client IP and per email address.

## SMTP relay

`apps/smtp` lets anything that only speaks SMTP send through coss.com (Supabase Auth, WordPress, Rails, Laravel,
Django, nodemailer, older apps): host `smtp.coss.com`, port 465 (TLS) or 587 (STARTTLS) (2465/2587 as
alternatives), username `coss`, an API key as the password. Each message is mapped onto the same request as
`POST /v1/emails` (envelope recipients decide who receives it; `To`/`Cc` headers keep their roles and the rest are
Bcc; `X-Coss-Category`, `X-Coss-Tags`, `X-Coss-Tracking`, `X-Coss-Scheduled-At` and `X-Coss-Idempotency-Key` set
the API's fields) and stored through the same email service, rate limits and quotas; the worker sends it. Locally,
`bun run dev` starts it on 2465/2587 with a self-signed certificate (made with `openssl`):

```sh
swaks --server localhost:2587 --tls --auth-user coss --auth-password "$COSS_API_KEY" \
  --from hello@acme.test --to ada@example.com --header "Subject: Hello"
```

The docs' guide is `/docs/email/smtp`.

## Running on Amazon SES

Email is split into two **streams**, transactional and marketing (`email.stream`), so marketing complaints never
pause password resets. Each organization gets one SES **tenant** per stream (isolated reputation and pausing),
created with its first domain, and every domain identity is associated with both. Each stream has its own
**configuration set**, `<name>` and `<name>-marketing`, both publishing delivery events to SNS → SQS, where the
worker picks them up; an EventBridge rule sends tenant pause/resume events to the same queue. SES suppression is
off for tenants and configuration sets: coss.com's own suppression lists decide who is skipped.

1. Use a dedicated AWS account (or at least region) per stage: SES identities are account-wide, so the same
   domain can't be verified in two stages of one account. New accounts start in the SES sandbox; request
   production access in the SES console.
2. Apply `bun run db:migrate`, then with admin credentials and this stage's `DATABASE_URL`, create the shared
   resources (idempotent; re-run after upgrades):
   `AWS_REGION=eu-west-1 bun run ses:bootstrap [--name coss] [--tenant-prefix coss] [--alert-email ops@…]`
   This also creates least-privilege IAM policies `<name>-api`, `<name>-dashboard` and `<name>-worker` (path
   `/coss/`, defined in `apps/worker/scripts/ses-policies.ts`) and, with `--alert-email`, CloudWatch alarms
   (`<name>-events-dead-letters`: events failed to be recorded; `<name>-events-backlog`: the worker isn't
   consuming) sent to that address once its SNS subscription is confirmed.
3. Set what it prints (`EMAIL_PROVIDER=ses`, `AWS_REGION`, `SES_CONFIGURATION_SET`, `SES_TENANT_PREFIX`,
   `SES_EVENTS_QUEUE_URL`) for the API, dashboard and worker, and attach each app's policy to the identity it
   runs as (role, or credentials as a last resort).
   When upgrading an existing SES deployment, pause sends and domain changes, drain the SES event
   queue with the worker, then run bootstrap before resuming with the new application version.
   For scheduled sends, first apply migration `0014_pretty_thunderbolts` with `bun run db:migrate`.
   Deploy the API and worker from the same release. Rerun bootstrap with the deployment's existing region, name and tenant prefix
   to update the attached `<name>-worker` policy with SES send permissions before starting the new
   worker. Bootstrap makes the updated policy version the default; existing attachments stay in place.
   If you manage IAM policies separately, apply both worker `ses:SendEmail` grants from
   `apps/worker/scripts/ses-policies.ts` (identities and the coss.com configuration set).
   Organization deletion needs `ses:DeleteTenant` in the `<name>-worker` policy: rerun bootstrap (or add it)
   before deploying that release, or deletions retry until it is there.
   Bootstrap imports historical SES permanent bounces and complaints into their original live
   environments, and conservatively copies the SES account and tenant lists to every live
   environment of each matching organization (SES lists have no environment attribution).
   Sandbox lists are untouched. The database records completion per tenant in the same transaction;
   reruns preserve later coss.com removals. All imports must succeed before bootstrap disables any SES
   suppression. Keep traffic paused if bootstrap fails, correct the error, and rerun it.
   Bootstrap needs `ses:ListSuppressedDestinations` for both account and tenant lists in addition
   to its infrastructure permissions; an unmapped SES tenant stops the transition.
   **Upgrading to streams:** apply the migration, run bootstrap *before* deploying (it creates the
   `<name>-marketing` configuration set, lets SES publish its events to the topic, adds it to the
   IAM policies and creates every existing organization's marketing tenant with its domains'
   identities associated), deploy, then run bootstrap once more: it associates domains the old
   release added meanwhile with the marketing tenants too. Keep domain changes paused from the
   migration until the deploy (as above): the migration re-keys `email_tenant` by stream, so the old
   release can't store an organization's first tenant, and adding a first domain fails until the new
   release runs (retrying afterwards works). Tenants double, so ask
   AWS for a higher SES tenant quota first if you are near it. The tenant prefix is now at most 23
   characters (`<prefix>-<organization id>-marketing` must fit SES's 64).
4. Optionally, put a stream on a managed dedicated IP pool: `--transactional-pool <pool>` and/or
   `--marketing-pool <pool>` create the pool (`ScalingMode: MANAGED`) and set it as that configuration set's
   sending pool; omitting a flag leaves the set as it is. Dedicated IPs are billed per pool and by volume
   and warm up over weeks, so start them well before the traffic they are for.

coss.com tags the identities it creates `coss_managed=<tenant prefix>` and only ever recreates or deletes identities
carrying its own tag (enforced in code and by the IAM policies), so domains verified by hand in the same account
are left alone. Sending can't be limited by tag (SES authorizes sends against the sender address), so the API
and worker policies allow `ses:SendEmail` on any identity but only with the coss.com configuration sets (another set,
or none, is denied); coss.com always sends with the organization's tenant of the email's stream, which SES only allows
for identities associated with it.

### Receiving email on SES

Environments receive email at their own `<label>.<INBOUND_MANAGED_DOMAIN>` addresses and at customers' receiving
domains. On SES this is one **receipt rule set** per account and region, with a single catch-all rule: it
scans each message for spam and viruses, writes it to the inbound bucket under `landing/` and notifies an SNS
topic, whose SQS queue the worker consumes. The worker routes each message by its envelope recipients, stores a
copy per receiving environment under `orgs/…`, then deletes the landing object. Mail for anything that doesn't
route is dropped.

1. Pick a region where SES receives email, and the managed domain (production: `inbound.coss.com`).
2. Run bootstrap with `--managed-domain inbound.coss.com`. It also creates the bucket `<name>-inbound-<account>`
   (private, SSE-S3, TLS only; lifecycle: `landing/` 21 days, `orgs/` received email retention + 1 day), the topic
   `<name>-ses-inbound`, the queues `<name>-inbound` (+ `-dlq`), the rule set `<name>-inbound` (made active), the
   managed domain's SES identity (tagged `coss_inbound=<name>`) and, with `--alert-email`, the alarms
   `<name>-inbound-dead-letters` and `<name>-inbound-backlog`. An account/region has only one *active* rule set:
   if another one is active, bootstrap stops unless you pass `--replace-active-rule-set` (mail its rules handle
   stops being handled).
3. Publish the records it prints in the coss.com zone on Cloudflare: the managed domain's three DKIM `CNAME`s,
   `MX 10 inbound-smtp.<region>.amazonaws.com` for both `inbound.coss.com` and `*.inbound.coss.com`, and
   `TXT "v=DMARC1"` at `*._report._dmarc.inbound.coss.com`. That last one lets mailbox providers send DMARC
   aggregate reports to `dmarc-<token>@inbound.coss.com` for customers' domains (RFC 7489's external destination
   check); without it they send none.
4. Set `INBOUND_MANAGED_DOMAIN` and `SES_INBOUND_BUCKET` for the API, dashboard and worker, and
   `SES_INBOUND_QUEUE_URL` (plus `VALKEY_URL`, for the daily inbound limit) for the worker. Rerun bootstrap first on
   upgrades: the updated `<name>-*` policies grant the S3 and SQS access.

Before relying on it in a new account, check against a live account (and note the results here): that a verified
parent domain receives for its subdomains (`in.acme.com` on `acme.com`'s identity) and one identity covers the
managed domain's wildcard; that identities associated with SES tenants still receive; that
`receipt.action.objectKey` includes the `landing/` prefix; and what SES's own `Received:` header names (copies
drop `for <address>` clauses naming other environments' recipients).

## Content screening on Vercel AI Gateway

1. Create an AI Gateway API key in the Vercel team that will pay for screening. Requests ask for zero data
   retention (the content is customer email), which Vercel offers on Pro and Enterprise teams. In enforced
   mode, a failed request records an `error` verdict and holds the email for a retry a minute later (it fails
   with `content_screening_unavailable` after an hour of outage); shadow mode records the failure and sends the
   email.
2. Set `SCREENING_CLASSIFIER=ai` and `AI_GATEWAY_API_KEY` for the worker (which screens emails), and
   `RISK_CLASSIFIER=ai` with the same key for the api (risk's content classification, at request time, 3 s
   timeout, limited per organization by the `risk.classify*` buckets). `SCREENING_MODEL` defaults to
   `typesafe-ai/jev`; any Gateway decision model id works.
3. Cost: one screening is about 2k input tokens (bodies are truncated to 8,000 characters) — about $0.0001 with
   Jev — so the default sampling costs a few dollars per million live emails.

## Rate limits on ElastiCache Serverless for Valkey

Rate limit counters live in Valkey (one GCRA bucket per key, updated atomically by a Lua script with the
server's clock). Without `VALKEY_URL` each process counts in memory, which is fine for development but
refused in production. Every bucket declares its outage policy: read-only API traffic is allowed when Valkey
is unreachable, while authentication, writes, sends, quotas and public-ingress abuse controls are denied.
A warning is logged in either case.

1. The cache lives in a VPC: the API, dashboard and worker must run in it, and its security group must allow inbound
   TCP 6379 from them.
2. With admin credentials, create it (idempotent; it takes a few minutes the first time):
   `AWS_REGION=eu-west-1 bun run valkey:bootstrap --subnet-ids subnet-a,subnet-b --security-group-ids sg-… [--name coss] [--max-ecpu 5000] [--max-storage-gb 1]`
   It creates a password user limited to the `<prefix>:*` keys and the commands the limiter uses, a disabled
   `default` user, a user group and the serverless cache (Valkey 8, TLS).
3. Set what it prints (`VALKEY_URL=rediss://…`, `VALKEY_CLUSTER=true`, `RATE_LIMIT_KEY_PREFIX`) for the API,
   dashboard and worker (which counts the daily inbound limit). The password is only printed when the user is created; `--rotate-password` makes a new one
   (running processes apply each bucket's outage policy until they get it).
4. Set `CLIENT_IP_HEADER` (e.g. `x-forwarded-for`) and `TRUSTED_PROXY_COUNT` (how many of your proxies append
   to it) to match your load balancers. Without them, public unauthenticated entry points use an aggregate
   fallback subject instead of trusting the load balancer's socket address; email-address and token/key
   buckets still apply where available.

## Billing on Stripe

coss.com computes every invoice itself (`@coss/billing`: plans, contracts, usage, credits); Stripe only stores
customers and payment methods, issues the invoices coss.com pushes and collects them. Without Stripe
(`BILLING_PROVIDER=fake`, the default) every charge succeeds and nothing leaves coss.com.

1. Create a restricted key with write access to Customers, Invoices, Invoice Items, Credit Notes, Checkout
   Sessions, Customer Portal and Setup Intents, and read access to Payment Methods and Invoice Payments. Set it as
   `STRIPE_SECRET_KEY` for the dashboard and the worker, with `BILLING_PROVIDER=stripe`.
2. Add a webhook endpoint `https://coss.com/api/billing/webhook` for `invoice.paid`, `invoice.payment_succeeded`,
   `invoice.payment_failed`, `invoice.payment_action_required`, `invoice.voided`, `invoice.marked_uncollectible`,
   `checkout.session.completed`, `customer.updated` and `charge.dispute.created`; set its signing secret as
   `STRIPE_WEBHOOK_SECRET` (dashboard only). Locally: `stripe listen --forward-to localhost:3000/api/billing/webhook`.
3. Customer Portal (Settings → Billing → Customer portal): allow updating payment methods, the billing address
   and tax IDs; turn off everything about subscriptions and invoices' cancellation (coss.com has no Stripe
   subscriptions).
4. Turn off Stripe's automatic collection features that would duplicate coss.com's: Smart Retries and failed-payment
   emails for invoices (coss.com retries charges and emails billing contacts itself). Invoice and receipt emails from
   Stripe are fine to keep.
5. Enable the payment method types you offer (cards; ACH Direct Debit, SEPA and Bacs Direct Debit for accounts that
   need them; bank transfers for invoices with payment terms). Each account's allowed and required types are set in
   the admin console. Stripe Tax is used only for accounts set to `stripe_automatic` tax.

Sales deals, credits and invoice adjustments are made in the admin console (`/admin/organizations/<id>/billing`);
deals invoiced off-Stripe use an account's `manual` provider (coss.com emails the invoice; an admin records payments).

## SMS on Twilio

SMS goes through Cal.com's Twilio account (an approved ISV), shared by coss.com: each organization gets its own
subaccount (`<SMS_SUBACCOUNT_PREFIX>-<organization id>`), and its US senders are registered under the ISV's primary
customer profile. Without Twilio (`SMS_PROVIDER=fake`, the default) nothing is sent and registrations are approved
at once; production with `fake` refuses to buy numbers or submit registrations, so no live SMS goes anywhere.

1. In the parent account, confirm the primary customer profile is approved with "ISV Reseller or Partner" as its
   business identity, and that subaccounts may use it. Set `TWILIO_PRIMARY_CUSTOMER_PROFILE_SID` (plain) for the
   dashboard and the worker.
2. Set `SMS_SUBACCOUNT_PREFIX` (plain, e.g. `coss-production`) in `production.tfvars` for web and worker, and
   store the parent's account SID and auth token with `infra/terraform/scripts/put-secret.sh TWILIO_ACCOUNT_SID
   --clipboard` and `… TWILIO_AUTH_TOKEN --clipboard` (then drop them from `unset_secrets`). The SID is a secret
   only because the repository is public: GitHub's push protection refuses it in `production.tfvars`. Set
   `SMS_PROVIDER=twilio` for web, api and worker, apply, and deploy.
3. Twilio calls `https://api.coss.com/sms/twilio/status` and `/sms/twilio/inbound` (set on every message and on each
   registration's messaging service). They are verified with the subaccount's auth token: before launch, send one
   message from a staging subaccount and check its callbacks are accepted (`403 Invalid signature` would mean Twilio
   signs subaccount callbacks with the parent's token instead).
4. Prices: `TWILIO_ACCOUNT_SID=… TWILIO_AUTH_TOKEN=… SMS_NEGOTIATED_COSTS='{"outbound":{"US":"0.0108",…}}' bun run
   sms:update-prices --markup 25 --effective <YYYY-MM-01>` writes a new dated list-price file from Twilio's prices
   (the account's discounted `current_price`, the highest carrier per country) and your negotiated rates (US
   including carrier fees). Review it, add a `RATE_CARDS` entry using it, and commit only the list prices: the
   negotiated costs and the markup stay out of the repository.
5. Twilio's own subaccount usage is billed to Cal.com: reconcile it with coss.com's `sms.*` usage monthly.

Locally, Twilio needs a public `API_PUBLIC_URL` for its callbacks (a tunnel).

## Error monitoring on Sentry

Errors and traces go to the Sentry organization `cosscom` (`@coss/observability`, EU region). Create three projects —
`web` (Next.js), `api` (Bun) and `worker` (Bun) — and set each service's `SENTRY_DSN` to its project's DSN
(Project settings → Client Keys), plus `SENTRY_ENVIRONMENT` (the stage) and optionally
`SENTRY_TRACES_SAMPLE_RATE` (default 0.1). Without a DSN nothing is reported, so local development and CI
send nothing unless you set one.

- **What is reported:** unhandled errors everywhere; every `console.error` on a server (the packages log the
  failures they handle that way: provider errors, webhook deliveries, failed worker runs…), also as Sentry
  logs with `console.warn`; failed email-dispatch jobs; browser errors on the dashboard and the site.
  Events are tagged `service`, and with `request_id` + `organization_id`/`environment_id` (API),
  `organization_id` + the user's id (dashboard) or `loop`/`email_id` (worker).
- **Privacy:** the SDKs collect no request/response bodies (email content), IPs, cookies, query strings, AI
  prompts or local variables (`DATA_COLLECTION`), and the `scrub*` hooks mask secret URL segments (tracking and
  password-reset tokens) in events, spans and logs. There is no session replay.
- **Browsers** (both zones) fetch their configuration from the dashboard's `GET /api/monitoring` and post their
  events to it; it forwards only envelopes for the dashboard's own DSN. The CSP needs no Sentry origin.
- **Releases** are the commit: `NEXT_DEPLOYMENT_ID` for the Next.js images, `SENTRY_RELEASE` (a build argument)
  for the API and worker images. Builds with a `SENTRY_AUTH_TOKEN` (organization token, passed to `docker build`
  as the `sentry_auth_token` secret) upload the Next.js apps' source maps to `web` and delete them from the image;
  the API and worker run their TypeScript source, so their stack traces need none.

## Deploying to AWS

Production runs in AWS account `294417174674`, region **us-east-2** (the organization's guardrails allow no other
region for regional services). The repository holds everything it takes: one Dockerfile per app
(`apps/{web,site,portal,api,worker,smtp}/Dockerfile`, built from the repository root), a machine-readable spec in
[`infra/`](./infra/AGENTS.md) (`bun run --cwd infra aws:spec` prints every service's port, health check, stop
timeout, size, task-role policy and env vars, the ALB listener rules and the CloudFront behaviours as JSON), the
Terraform that provisions it from that spec (`infra/terraform`) and the deploy workflow
(`.github/workflows/deploy.yml`). This section is the runbook around them.

```
Cloudflare DNS (coss.com zone, DNS only)
  coss.com, api.coss.com ─▶ CloudFront + WAF ──(HTTPS, X-Origin-Verify)──▶ ALB ─┬─▶ web    (Next, :3000) ─┐
                              │                                                 ├─▶ site   (Next, :3002)  ├─▶ RDS Postgres
                              ├─ /ui, /ui/*         ─▶ coss ui   (Vercel)       └─▶ api    (Bun,  :3001) ─┤   Valkey
                              └─ /origin, /origin/* ─▶ Origin UI (Vercel)    worker (Bun, no load balancer)┘   SES · SNS · SQS
  Cloudflare DNS (cosslinks.com zone, self-serve account, proxied)
  track.cosslinks.com + customer tracking domains (Cloudflare for SaaS) ──(X-Tracking-Origin-Verify)──▶ ALB /t/* ─▶ api
  Cloudflare DNS (cosshooks.com zone, self-serve account, proxied)
  portal.cosshooks.com (Hooks portal) ──(X-Portal-Origin-Verify)──▶ ALB ─▶ portal (Next, :3003)
  Cloudflare DNS (coss.com zone, DNS only)
  smtp.coss.com ──(TCP 465/2465, 587/2587, client IP preserved)──▶ NLB ─▶ smtp (Bun, :2465 TLS, :2587 STARTTLS)
```

### Resources (`infra/terraform`)

- **Network:** a VPC (`10.40.0.0/16`) over us-east-2a/b; public subnets for the ALB and one NAT gateway per AZ,
  private subnets for tasks, RDS and Valkey. Security groups: the ALB takes 443 only from the managed prefix list
  `com.amazonaws.global.cloudfront.origin-facing` (its own group: the list weighs ~55 rules) and from Cloudflare's
  IPv4 ranges (tracking domains); each service's tasks only from the ALB on their port (the SMTP relay's from
  the internet through the NLB); RDS 5432 and Valkey 6379 only from web, portal, api, worker and smtp.
- **NAT gateways (required):** the worker delivers customer webhooks to arbitrary public URLs and ports, and domain
  verification in web, api and worker queries public DNS (1.1.1.1 / 8.8.8.8, port 53) directly. AWS traffic stays
  off them through VPC endpoints: interface endpoints for `sqs`, `secretsmanager`, `ecr.api`, `ecr.dkr`, `logs` and
  `email` (the SES API), plus the free `s3` gateway endpoint (ECR image layers).
- **ECS on Fargate (arm64):** cluster `coss-production`, services `web`, `site`, `portal`, `api`, `worker`, `smtp`, task definitions
  built from `spec.json` (sizes, minimum counts, `stopTimeout`, env names and kinds; plain values from
  `production.tfvars`, secrets from the stage secret), CPU target-tracking autoscaling, deployment circuit breaker
  with rollback, ECS Exec. ECR repositories `coss/<service>` (immutable commit tags; `buildcache-<hash>` is the
  BuildKit cache of the dependency layers, exported only when the lockfile, a `package.json` or the Dockerfile
  changed). Logs in `/coss/production/<service>` (30 days).
- **ALB:** HTTPS listener with an ACM certificate (us-east-2) for `coss.com` and `api.coss.com` (CloudFront forwards
  the viewer `Host`, and validates the origin certificate against it). Default action: fixed 403. Rules exactly as
  the spec prints them (generated from `ZONE_ROUTES` in `packages/auth/src/slugs.ts`):

  | Priority | Conditions | Target group |
  |---|---|---|
  | 10 | host `api.coss.com` + `X-Origin-Verify` | api |
  | 20 | path `/t/*` + `X-Tracking-Origin-Verify` (any host: customer tracking domains through Cloudflare) | api |
  | 30–80 | the site's paths (`/`, `/pricing`, `/docs*`, `/legal*`, `/llms*.txt`, `/site-assets/*`, root files, `/.well-known*`; 3 per rule) + `X-Origin-Verify` | site |
  | 90 | host `coss.com` + `X-Origin-Verify` (every other path: org slugs, `/dashboard`, `/api/*`, `/_next/*`) | web |

  Target groups: health checks `/api/health` (web, site, portal) and `/health` (api), HTTP 200, no database access;
  deregistration delay 30 s. Keep the idle timeout at 60 s: the apps hold idle connections for 75 s
  (`KEEP_ALIVE_TIMEOUT`, Bun `idleTimeout`) so the ALB never reuses one they are closing.
- **CloudFront + WAF:** two distributions, certificates from ACM in us-east-1, HTTP→HTTPS redirect, a response
  headers policy that adds HSTS (2 years, subdomains, preload).
  - `coss.com`: origins `alb` (HTTPS only, custom header `X-Origin-Verify: <secret>`, origin request policy
    `Managed-AllViewer`, so `Host`, cookies and query strings reach the apps) and one per external zone of the coss
    ui repository: `ui` → `coss-com-ui.vercel.app`, `origin` → `coss-com-origin.vercel.app` (Vercel projects serving
    their base path; `Managed-AllViewerExceptHostHeader`, so Vercel sees its own hostname). Default behaviour
    `Managed-CachingDisabled` (dashboard, auth, server actions, and the landing page, since a path pattern can't
    match exactly `/`). The cached behaviours from the spec use the policy `coss-production-origin-cache-control`,
    which honours the origin's `Cache-Control`: min/default TTL 0, max 1 year, all query strings (`_rsc`), no
    cookies, and the headers `RSC`, `Next-Router-Prefetch`, `Next-Router-State-Tree`, `Next-Router-Segment-Prefetch`
    in the cache key. Docs pages are sent with `s-maxage=31536000`: the deploy workflow invalidates the site's
    cached paths after every rollout (`cloudFront.invalidateAfterDeploy` in the spec: pages as `/pricing*`, since
    a path without a wildcard leaves its `?_rsc=` payloads cached), never the hashed asset folders, so tabs opened
    before a deploy can still load their old chunks.
  - `api.coss.com`: the ALB only, never cached.
  - WAF web ACLs (scope `CLOUDFRONT`): a per-IP rate rule (5,000 / 5 min on coss.com, 20,000 on the API; floods
    only, the apps rate-limit precisely), AWS IP reputation, common and known-bad-inputs rule groups. Rules that
    legitimate traffic trips are counted instead of blocking: `SizeRestrictions_BODY` (both), and on the API
    `CrossSiteScripting_BODY` (sends carry whole HTML emails) and `NoUserAgent_HEADER` (some SDK runtimes).
- **RDS Postgres 18:** `coss-production`, `db.t4g.medium`, Multi-AZ, encrypted, 14-day backups, deletion
  protection, Performance Insights, `rds.force_ssl`. Apps connect with
  `?sslmode=verify-full&sslrootcert=/etc/ssl/certs/rds-global-bundle.pem` (each image ships the RDS CA bundle
  there). The master password is set through a write-only argument and never stored in the Terraform state.
  **Pool sizing:** every task opens up to `DATABASE_POOL_MAX` (default 10) app connections. Each API task also opens
  one pg-boss metadata connection; each worker adds up to four pg-boss connections and one LISTEN connection. Budget
  `(max web + max api + max worker tasks) × DATABASE_POOL_MAX + max api tasks + 5 × max worker tasks`, plus two
  connections for migrations and a few for operators (today ≈ 160 of ~410). Keep the total below `max_connections`
  (`SHOW max_connections;` — on RDS it scales with instance memory, roughly `memory / 9.5 MB`). Lower the pool size
  or add RDS Proxy before scaling task counts past that.
- **ElastiCache Serverless (Valkey):** created by `valkey:bootstrap` (see
  [Rate limits on ElastiCache Serverless for Valkey](#rate-limits-on-elasticache-serverless-for-valkey)) in the
  private subnets with the `coss-production-valkey` security group.
- **SES, SNS, SQS, EventBridge:** created by `ses:bootstrap` (see [Running on Amazon SES](#running-on-amazon-ses)),
  run as a one-off task (below).
- **DNS (Cloudflare, zone `coss.com`):** `coss.com` and `api.coss.com` are DNS-only CNAMEs (flattened at the apex)
  to their distributions; ACM validation CNAMEs; DKIM and MAIL FROM records of coss.com's own sending domain.
- **Tracking links (`cosslinks.com`, a self-serve Cloudflare account, not the coss.com zone):** every tracking
  link points at a domain of its own, so a sender's abuse flagged by URL blocklists never lands on coss.com.
  `track.cosslinks.com` is a **proxied** record pointing at the ALB's DNS name (`terraform output alb_dns_name`):
  it is the default tracking origin (`TRACKING_PUBLIC_URL`, api + worker) and the Cloudflare for SaaS fallback
  origin customers CNAME their tracking domains to (`TRACKING_CNAME_TARGET`). coss.com registers each customer domain
  as a custom hostname (HTTP certificate validation) with `CLOUDFLARE_API_TOKEN` (an account token scoped to the
  zone, SSL and Certificates: Edit) and `CLOUDFLARE_ZONE_ID`. A request header transform rule sets
  `X-Tracking-Origin-Verify: <secret>` (Secrets Manager `coss/production/tracking-origin-verify`) on every request
  in the zone: the ALB forwards `/t/*` with it to the api target group for any host, and nothing else. SSL mode
  **Full** (zone-wide; the zone serves nothing else): Cloudflare connects with the caller's hostname as SNI, which
  the ALB's certificate doesn't cover; the header secret is what proves a request came through Cloudflare. The
  apex redirects to coss.com. Free plan: 100 custom hostnames included, then $0.10 each per month.

- **SMTP relay (`smtp.coss.com`):** the `smtp` service behind a network load balancer
  (`infra/terraform/nlb.tf`): TCP listeners 465 and 2465 → container port 2465 (implicit TLS), 587 and 2587 → 2587
  (STARTTLS), client addresses preserved (the relay limits connections and failed logins per address), so the
  tasks' security group takes 2465/2587 from anywhere (they have no public address; only the NLB reaches them).
  The relay terminates TLS itself, since STARTTLS can't be offloaded: Terraform requests an **exportable** ACM
  certificate for `smtp.coss.com` (exportable certificates cost extra; validation CNAME from
  `terraform output smtp_certificate_validation_records`, DNS only), passes its ARN as `SMTP_TLS_CERTIFICATE_ARN`,
  and the task role may only `acm:ExportCertificate` it; the relay exports it at start and every 12 hours (ACM
  renews it) with `SMTP_TLS_PASSPHRASE` (stage secret, any random value). `smtp.coss.com` is a **DNS-only** CNAME to
  `terraform output nlb_dns_name` (Cloudflare can't proxy SMTP). `SMTP_PUBLIC_HOST=smtp.coss.com` (web) shows the
  settings on environment pages; leave it unset on a stage whose relay isn't reachable yet. No SES
  permissions: the relay only stores and enqueues, the worker sends.
- **Hooks portal (`cosshooks.com`, the same self-serve Cloudflare account as `cosslinks.com`):** `apps/portal`,
  the page customers embed for their users, runs as the `portal` service on a registrable domain of its own (never
  under coss.com, which would make it same-site with the dashboard). `portal.cosshooks.com` is a **proxied** record
  pointing at the ALB (`terraform output alb_dns_name`), which serves it with its own ACM certificate (an SNI
  listener certificate; validation CNAME from `terraform output portal_certificate_validation_records`, DNS only),
  so the zone's SSL mode is **Full (strict)**. A request header transform rule sets
  `X-Portal-Origin-Verify: <secret>` (Secrets Manager `coss/production/portal-origin-verify`) on every request in
  the zone; the ALB forwards `portal.cosshooks.com` with it to the portal and nothing else. A redirect rule sends
  the apex to `https://coss.com`. `PORTAL_PUBLIC_URL=https://portal.cosshooks.com` (web, api) makes portal session
  links point there.

### Monitoring and cost guardrails

- **Errors and uptime:** Sentry (organization `cosscom`). Every server and browser reports errors; the `web` project
  filters errors caused by browser extensions and web crawlers. Uptime monitors check `https://coss.com/api/health`
  (`web`) and `https://api.coss.com/health` (`api`) every minute from several regions.
- **Alarms** (`infra/terraform/monitoring.tf`, notify the `coss-alerts` SNS topic → `alert_email`): per service,
  fewer running tasks than its minimum, memory above 85 %, CPU above 90 % (autoscaling saturated); load balancer
  5xx, per-target 5xx and unhealthy targets; RDS CPU, CPU credits (t4g), free storage, free memory and connections
  (> 300 of ~410); Valkey throttling (raise `--max-ecpu`); plus ses:bootstrap's SES event queue backlog and dead
  letters. Route 53 health checks and CloudFront metrics exist only in us-east-1, which the organization's SCP
  denies: uptime is Sentry's.
- **Cost:** an AWS budget (`monthly_budget_usd`, email at 80 % actual and 100 % forecasted) and Cost Anomaly
  Detection per service (daily email for anomalies ≥ $25).

### Secrets and environment

One Secrets Manager secret per stage, `coss/production` (JSON), injected through each task definition's `secrets`
(one key per `secret` variable of `infra/aws/services.ts`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `VALKEY_URL`,
`WEBHOOK_SECRETS_KEY`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_CLIENT_SECRET`,
`GITHUB_CLIENT_SECRET`, `CLOUDFLARE_API_TOKEN`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `AI_GATEWAY_API_KEY`, `SMTP_TLS_PASSPHRASE` (any random value: it
only protects the SMTP relay's exported certificate key), `RISK_HASH_KEY` (changing it resets what
risk assessments remember), `EMAIL_LINK_KEYS` (marketing email's preference, unsubscribe and confirmation links;
store it with `put-secret.sh EMAIL_LINK_KEYS --generate` **before** the deploy that adds it, or api and worker tasks
can't start; see [Rotating `EMAIL_LINK_KEYS`](#rotating-email_link_keys)), `IPINFO_TOKEN` (optional: a free IPinfo account's token for risk's ASN and country
data) and `IPINFO_PRIVACY_TOKEN` (optional, with `RISK_IP_PRIVACY=ipinfo`: a paid IPinfo plan's token for VPN and
proxy data per address; IPinfo must be a listed subprocessor first) and `APNS_PRIVATE_KEY` (optional: the iOS app's
push notifications, see below). Terraform creates only the container; values are
written with `infra/terraform/scripts/put-secret.sh NAME --generate | --clipboard | --stdin`, which never prints them
(losing `WEBHOOK_SECRETS_KEY` makes webhook secrets unreadable, see
[Rotating `WEBHOOK_SECRETS_KEY`](#rotating-webhook_secrets_key) to change it). Tasks read secrets when they start:
redeploy after changing one. The two origin header values are separate secrets (`coss/production/origin-verify`,
`coss/production/tracking-origin-verify`), generated by Terraform for CloudFront, Cloudflare and the ALB rules
(rotate one by adding the new value to the rules, then the sender, then removing the old one).

Plain values live in `infra/terraform/production.tfvars` (`plain_env`, per service); the plan fails when a required
plain variable of the spec has no value or tfvars sets one the spec doesn't declare. `SENTRY_*` DSNs come from the
`cosscom` Sentry organization (EU region). Receiving adds `INBOUND_MANAGED_DOMAIN=inbound.coss.com` and
`SES_INBOUND_BUCKET` (web, api, worker) and `SES_INBOUND_QUEUE_URL` (worker), printed by
`ses:bootstrap --managed-domain`. The site needs nothing: everything it needs is in the image.

Images are built once and promoted: builds set `SKIP_ENV_VALIDATION` and bake in nothing stage-specific (only the
commit: `NEXT_DEPLOYMENT_ID`, `SENTRY_RELEASE`). Each server validates its environment at startup and exits if it is
wrong. AWS credentials come from the task role.

### IAM

- **Execution role** (`coss-production-ecs-execution`, shared): pull from ECR, write logs, read the stage secret.
- **Task roles:** web → `coss-dashboard`, api → `coss-api`, worker → `coss-worker`: the policies `ses:bootstrap`
  creates under `/coss/` (defined in [`apps/worker/scripts/ses-policies.ts`](./apps/worker/scripts/ses-policies.ts)),
  plus ECS Exec. The site gets no permissions; smtp only `acm:ExportCertificate` on its own certificate. The `ses-bootstrap` one-off task runs with
  `coss-production-ses-bootstrap` (SES, SNS, SQS, EventBridge, S3 (the inbound bucket), CloudWatch alarms, IAM
  policies under `/coss/`).
- **Deploys** (`coss-production-deploy`): the role of the CodeBuild project whose runners execute the Deploy
  workflow's AWS jobs (ECR push, task definitions, service updates, the migrate task, `iam:PassRole` on the task
  roles, the CloudFront invalidation, read-only ALB/CloudFront reads for the routing check). The organization's SCP
  forbids IAM identity providers, so GitHub OIDC isn't available; the runners are started by a webhook (through the
  `coss-production-github` CodeConnections connection to the AWS Connector app on `cosscom`) only for jobs of the
  workflow named `Deploy`, and only when the job's actor is on `deploy_actor_ids` (`production.tfvars`: the
  numeric GitHub ids of the people with write access; add a new maintainer there, or their merges won't deploy).
  The repository is public, so that allow-list is what keeps a stranger's pull request (with its own workflow
  named `Deploy`) off this role, which can read every production secret (it passes the execution role); verified
  by excluding an actor and dispatching (no runner started). Fork pull requests also need a maintainer's approval
  before any workflow runs (Settings → Actions: all external contributors). CodeBuild can't filter workflow jobs
  by branch (`HEAD_REF` only applies to push and pull request events): the workflow's first job refuses anything
  but `deploy.yml` from `main`, and the AWS jobs need the `production` environment, whose deployment branch policy
  allows only `main`.

### Deploy order

**Upgrading a stage that still runs v1-only webhook secret readers:** use the
[one-time coordinated upgrade](#upgrading-from-v1-webhook-secret-storage) below instead of step 3's rolling
deployment. This applies even when `WEBHOOK_SECRETS_KEY` is unchanged.

The Deploy workflow does this for pushes to main in batches: its `gate` job (on GitHub's runners, which cost
nothing here, unlike CodeBuild's minutes) waits until the push's CI passed and then until main has had no newer
push for 20 minutes or production's last deploy is an hour old, so the first push after a quiet spell ships right
after CI and a busy stretch ships about hourly. A push that's superseded while it waits isn't built (the newer
push's run ships it). Run it by hand from the admin console's Deploys page or the Actions tab (`gh workflow run
deploy.yml`) to ship main at once; with
`image_tag` it redeploys an earlier commit's images, e.g. a rollback. When CI failed and a re-run passed, re-run
the Deploy run's failed jobs. A deploy job whose commit production already includes (a newer deploy went first)
skips, so production never goes back to an older commit unless you dispatch one:

1. Build and push the six images, tagged with the commit (`docker buildx build --platform linux/arm64 -f
   apps/web/Dockerfile --build-arg NEXT_DEPLOYMENT_ID=<sha> --secret id=sentry_auth_token,env=SENTRY_AUTH_TOKEN .`
   for the Next apps; `--build-arg SENTRY_RELEASE=<sha>` for the API, worker and SMTP relay), skipping images that exist. Base
   images never come from Docker Hub there (CodeBuild's shared addresses exhaust its anonymous pull limit): Node from
   ECR Public (`NODE_IMAGE`), Bun from `coss/base/bun` in our ECR (`BUN_IMAGE`), which the workflow fills from Docker
   Hub once per Bun version. Local builds keep Docker Hub (the Dockerfiles' defaults).
2. Run migrations as a one-off task from the new worker image (`infra/scripts/ecs-task.sh --image-tag <sha> worker --
   bun packages/db/src/migrate.ts`; never two at once, the deploy job's concurrency group). Migrations must be
   backward compatible with the running code.
3. Roll out all six services at once (`infra/scripts/ecs-deploy.sh <sha> <services…>`): each gets a new revision
   of its latest task definition with the new image, and the script fails if the circuit breaker rolled it back. A
   service behind the load balancer counts as deployed once its new tasks passed their health checks and the old
   ones are draining; the worker (no health check) once its old tasks are gone and the new ones ran for 60 s
   without a failure. Rolling deploys keep 100 % healthy; SIGTERM drains each task (Next and the API finish in-flight requests,
   the worker finishes each loop's current item, the SMTP relay answers messages in progress and sends idle
   clients `421`, so they reconnect to another task).
4. Record the commit in SSM (`/coss/production/image-tag`, read by Terraform) and invalidate the spec's
   `cloudFront.invalidateAfterDeploy` paths on the coss.com distribution.
5. Check routing (`infra/scripts/check-routing.sh`, also runnable locally): the ALB's rules and the coss.com
   distribution's cached behaviours must match `infra/terraform/spec.json`. Routing changes (a new `ZONE_ROUTES`
   entry, i.e. a new site page or zone) only go live with `terraform apply`, which deploys never run, so until
   someone applies them this step fails with "routing drift: run terraform apply" and the differences. The code
   ships either way.

Infrastructure changes: `cd infra/terraform && terraform init && terraform plan -var-file=production.tfvars` with
admin credentials for the account, then `apply`. Services ignore task definition changes; after changing
environment values, run the Deploy workflow by hand so the services pick up the new revision.

### Deploying from the admin console

`/admin/deploys` shows the commit production runs, main's merges it doesn't run yet (with their CI) and the Deploy
workflow's latest runs (waiting for their batch, building, deploying with the step it is on, done), and refreshes
itself while the tab is open (every 10 s while a run moves, else every 30 s). Each run has its own page
(`/admin/deploys/<run id>`): the merges it ships (or, for a redeploy, takes back out) against the deploy before it,
its jobs on a timeline, the deploy job's steps and the end of each failed job's log.
**Deploy now** dispatches the workflow for main (skipping the batch wait) and cancels the push runs still waiting;
**Redeploy** on an earlier run's commit dispatches it with `image_tag` (production stays there until main is
deployed again; migrations aren't undone). Both record an admin audit event with the admin and their reason.

It reads and dispatches through a GitHub App, **coss.com Deploy**, so no person's token is involved. Setting it up once:

1. In the `cosscom` organization: Settings → Developer settings → GitHub Apps → New GitHub App. Name `coss.com Deploy`,
   homepage `https://coss.com`, webhook off, repository permissions **Actions: read and write** and **Contents:
   read-only** (nothing else), installable on this account only. Create it, note its **App ID**, and generate a
   private key (a `.pem` download).
2. Install it on `cosscom`, only on `cosscom/coss`.
3. Its bot account starts the deploy runner, so it goes on the allow-list: `gh api 'users/coss-com-deploy[bot]' --jq .id`
   (the app's slug + `[bot]`; ours is `coss-com-deploy`, App ID 5340076) → `deploy_actor_ids` in `production.tfvars`.
4. `infra/terraform/scripts/put-secret.sh DEPLOY_GITHUB_APP_PRIVATE_KEY --stdin < coss-com-deploy.*.private-key.pem`,
   then take it out of `unset_secrets`, set `DEPLOY_GITHUB_APP_ID` under `plain_env.web`, and apply. Delete the
   `.pem`.
5. Run the Deploy workflow (`gh workflow run deploy.yml`) so the dashboard picks up the new task definition.

The dashboard asks GitHub for installation tokens limited to those two permissions on this repository. With them
it can dispatch, cancel and re-run this repository's workflows and read its code, never push: the Deploy workflow
refuses anything but main, and the release workflow only runs on pushes. Anyone with the private key (the dashboard's
task, the stage secret) can start the deploy runner like a maintainer can, so rotate it (generate a new key in the
app's settings, store it, redeploy, delete the old one) if it may have leaked.

One-off tasks (from `infra/`, with admin credentials):

```sh
scripts/ecs-task.sh worker -- bun packages/db/src/migrate.ts
scripts/ecs-task.sh --task-role "$(terraform -chdir=terraform output -raw bootstrap_role_arn)" worker -- \
  bun apps/worker/scripts/ses-bootstrap.ts --name coss --tenant-prefix coss --alert-email ops@coss.com
scripts/ecs-task.sh api -- bun packages/tenancy/scripts/create-admin.ts --email you@example.com [--verify-email]
scripts/ecs-task.sh worker -- bun apps/worker/scripts/webhooks-reencrypt.ts --dry-run
```

First deployment of a stage: Terraform (network, RDS, IAM, secrets, ECR, certificates; validation CNAMEs in
Cloudflare) → `valkey:bootstrap` → stage secret values (`put-secret.sh`) → images → Terraform (services, ALB,
CloudFront, WAF) → migrate → `ses-bootstrap` one-off task → test through CloudFront with
`curl --resolve coss.com:443:<distribution IP>` → DNS in Cloudflare → sign up on the dashboard → `create-admin
--verify-email` (sign-in needs a verified address, and no verification email can go out yet) →
create coss.com's own organization in the dashboard, add and verify its sending domain (`coss.com`: reserved for
everyone else, so only a platform admin can add it, from the dashboard; an SES identity for it created outside coss.com
must be deleted first, coss.com never adopts one), and set the worker's
`NOTIFICATIONS_ENVIRONMENT_ID` (its project's live environment, `env_…`) and `NOTIFICATIONS_FROM` (e.g. `coss.com
<notifications@coss.com>`) in `production.tfvars`, apply, and redeploy. Until then the worker logs a warning at
startup and holds account emails (sign-up verification, password resets, invitations — dropped once their link
expires: an hour, or the invitation's 48 hours) and reputation notification emails (dropped after 3 days), so nobody
can verify their address or create a live key; afterwards, ask for a new verification email from account settings.
They are ordinary live emails of that organization: its dashboard shows their delivery, and its suppressions and
reputation guard apply. Account emails keep no body once sent (their links are secrets).

Push notifications to the iOS app use the APNs key "coss.com push" (`APNS_KEY_ID` `WCQDCU4HUL`) of the Cal.com, Inc.
Apple team (`ADWKXDJV75`), which owns `com.coss.ios`: Production environment, restricted to that topic. Its `.p8` is
the `APNS_PRIVATE_KEY` key of `coss/production` (`put-secret.sh APNS_PRIVATE_KEY --stdin < AuthKey_….p8`); the key
id, team and topic are plain values in `production.tfvars`. To replace it, create a new key under Certificates,
Identifiers & Profiles → Keys (Apple lets you download it once), store it, change `APNS_KEY_ID`, apply and redeploy,
then revoke the old one. Without them the worker logs a warning and holds pushes (each is dropped after an hour).
Local development uses its own key (Sandbox) in `.env`.

### Domain Connect

Domain pages offer **Connect with <DNS provider>** when the customer's DNS provider supports
[Domain Connect](https://www.domainconnect.org) and has onboarded coss.com's template
(`packages/email/domain-connect/coss.com.email.json`). The dashboard sends the customer to the provider with a
link signed by `DOMAIN_CONNECT_PRIVATE_KEY`; the provider checks it against TXT records coss.com publishes, applies
the template after the customer confirms, and sends them back to the domain page. Until the steps below are done
nobody sees the button. Setting it up once:

1. `bun run domain-connect:key --key-id _dck1` prints a new key (PEM) and the TXT records of its public half.
2. Publish each printed record as its own TXT record at `_dck1.coss.com` (the coss.com zone on Cloudflare).
3. `infra/terraform/scripts/put-secret.sh DOMAIN_CONNECT_PRIVATE_KEY --stdin` with the PEM, take it out of
   `unset_secrets`, set `DOMAIN_CONNECT_KEY_ID = "_dck1"` under `plain_env.web`, apply and run the Deploy workflow.
4. Open a pull request adding `coss.com.email.json` to
   [Domain-Connect/Templates](https://github.com/Domain-Connect/Templates) (their linter runs on it).
5. Ask DNS providers to onboard it once it is merged (Cloudflare: domain-connect@cloudflare.com; GoDaddy, IONOS
   and others each have their own process). A provider that has it answers the template check with 200.

Changing the template means a new `version` and another upstream pull request, and providers apply the version they
have, so keep changes backwards compatible. To rotate the key, make one under a new id (`--key-id _dck2`),
publish its records, switch both variables, deploy, and remove the old records a day later.

### Upgrading from v1 webhook secret storage

The key-ring release reads both `v1` and `v2` ciphertext, but immediately writes `v2` when an endpoint is created
or its secret is rolled. Earlier releases read only `v1`: mixing these releases breaks deliveries and dashboard
secret reveals. This first format upgrade requires a maintenance window; subsequent deployments between
dual-format releases can follow the normal rolling deploy order. A new stage needs no transition.

1. Build the new images and run the backward-compatible migrations (deploy steps 1–2). Keep the existing single
   `WEBHOOK_SECRETS_KEY` unchanged on all services; do not combine this upgrade with a key rotation or run
   `webhooks:reencrypt` yet.
2. Block incoming API and dashboard traffic at the load balancer, including direct origin access. Suspend service
   autoscaling and automated deployments, and disable automatic rollback to v1-only task revisions (including ECS
   deployment circuit-breaker/alarm rollback). Record desired counts, and scale **web, api and worker to zero**.
   Allow SIGTERM draining to finish, and verify that every old task has stopped, including standalone tasks or
   operator scripts that access webhook secrets. Do not start any new app task while an old reader remains.
3. Set all three services to the new image revisions before restoring their desired counts. Keep traffic blocked
   until every running task uses a dual-format reader and the API/dashboard health checks pass. Verify a legacy
   endpoint's secret reveal and delivery, then create or roll a test endpoint and verify its reveal and delivery.
   Run these checks through controlled operator access during maintenance.
4. Restore traffic, autoscaling and automated deployments, pinned to the upgraded revisions. Re-enable automatic
   rollback only when its target revision also reads both formats. Queued work resumes
   when the workers start; allow for delayed email and webhook deliveries during the maintenance window.
   Existing `v1` rows remain readable and do not need immediate re-encryption. Only now may the re-encryption
   script or the key-rotation procedure below run.

**Rollback:** before any new task or re-encryption script has written `v2`, the old images can be restored using
the same stop-all/start-all procedure with the original key. Once a `v2` secret exists, rollback images must also
read both formats; keeping the same encryption key does not make a v1-only image compatible. Keep traffic blocked
and repair forward if the cutover fails after v2 writes. This release has no v2-to-v1 downgrade command.

### Rotating `WEBHOOK_SECRETS_KEY`

Prerequisite: every API, dashboard and worker task already runs a dual-format reader. For a stage still using
v1-only readers, complete [the format upgrade](#upgrading-from-v1-webhook-secret-storage) first.

The variable is a comma-separated list of keys, newest first: the first encrypts new endpoint secrets, every one
decrypts. Each stored secret names its key by an id derived from the key itself (the `webhooks:reencrypt` script
prints them), so the list needs no labels and its order only decides which key encrypts. Endpoints' own signing
secrets don't change, so customers notice nothing.

1. Generate a key (`openssl rand -base64 32`) and **append** it: `WEBHOOK_SECRETS_KEY=<old>,<new>`. Deploy web, api
   and worker. Every task can now decrypt with both keys; nothing is encrypted with the new one yet.
2. Swap the order, `<new>,<old>`, and deploy again. New and rolled endpoint secrets are encrypted with the new key.
   Doing step 1 first means no task that only knows the old key ever reads a secret made with the new one (rolling
   deploys run both versions at once).
3. Run the `webhooks-reencrypt` one-off task from the worker image (`bun apps/worker/scripts/webhooks-reencrypt.ts`,
   needs `DATABASE_URL` and the new `WEBHOOK_SECRETS_KEY`; `--dry-run` only counts). It rewrites every secret still
   encrypted with an older key, while traffic continues, and exits 1 if anything was left over (a secret no listed key
   decrypts, or one rolled while it ran: run it again).
4. Remove the old key, `<new>`, and deploy. Destroy the old key.

After a leak of the key, do all four steps right away: with the database alone the key is useless, but with both,
every endpoint's signing secret can be read. Customers should then [roll their endpoint
secrets](https://coss.com/docs/webhooks#rolling-the-secret) with no grace period. Locally, `bun run
webhooks:reencrypt` does step 3 against `DATABASE_URL`.

### Rotating `EMAIL_LINK_KEYS`

Unsubscribe and preference links in marketing email are encrypted with the first key of `EMAIL_LINK_KEYS` and work
as long as their key is listed: nothing about them is stored, so a dropped key breaks every link made with it.
Recipients follow links in old emails for years, and the law requires unsubscribe links to work for at least 30 days
after sending: keep retired keys listed for at least two years.

1. Generate a key (`openssl rand -base64 32`) and **append** it: `EMAIL_LINK_KEYS=<old>,<new>`. Deploy api and
   worker: both now read links made with either key.
2. Swap the order, `<new>,<old>`, and deploy again: new links use the new key.
3. Years later, remove the old key. After a leak, swap right away (step 1 and 2 at once is fine for the reader side)
   and accept that anyone holding the old key could forge links that change one recipient's preferences in one
   environment; drop it once that risk outweighs the broken links.

### Known gaps

- Next's data cache is per task (in memory and on local disk). Nothing uses `revalidateTag`/ISR today; a shared
  `cacheHandler` is needed before anything does.

## License

coss.com is licensed under the [GNU Affero General Public License v3.0](./LICENSE) (`AGPL-3.0-only`), Copyright (c)
2026 Cal.com, Inc. — except:

- `packages/sdk` (the `coss` npm package): [MIT](./packages/sdk/LICENSE), so applications can bundle it freely.
- `packages/mcp` (the `coss-mcp` npm package, coss.com's MCP server): [MIT](./packages/mcp/LICENSE), like the SDK it
  is built on.
- `packages/cli` (the `coss-cli` npm package, the `coss` command): [MIT](./packages/cli/LICENSE), likewise.
- The generated SDKs in `sdks/*` and the framework drivers in `integrations/*`: MIT, each with its own `LICENSE`.
- `packages/kloq`: [MIT](./packages/kloq/LICENSE), vendored from `cosscom/calendar` (as is the kloq registry the
  site serves).
- The fonts in `packages/ui/src/fonts`: [SIL Open Font License 1.1](./packages/ui/src/fonts/OFL.txt).

### Contributing

Contributions are welcome. Before we can merge your first pull request, you sign our
[Contributor License Agreement](./CLA.md) (`CLA.md`): the CLA Assistant check on the pull request links to it, and
signing takes one click with your GitHub account. You keep the copyright to your work; the agreement lets Cal.com distribute it under the
project's licenses and under commercial licenses.
