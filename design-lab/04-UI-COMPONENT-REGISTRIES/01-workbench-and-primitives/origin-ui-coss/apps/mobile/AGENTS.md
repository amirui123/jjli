# AGENTS.md — `apps/mobile` (coss.com for iOS)

Expo (SDK 57, React Native 0.86, Expo Router) companion app for the dashboard. Organization:
projects, reputation, domains (DNS records, DMARC reports), dedicated IPs, SMS senders (numbers,
carrier registrations, countries), members, spend (the organization's, or a member's own
personal keys') and budgets, settings (general, single sign-on, directory sync), billing, plans
and invoices, the audit log. Environment: activity, sent and received emails,
templates and their versions, suppressions, open/click tracking, content storage, sent and
received SMS, SMS suppressions, broadcasts, contacts (and their properties), audiences, segments,
topics, marketing settings, risk assessments, rules, lists, rate limits, calibration and settings,
Hooks (applications, endpoints, messages, event types, portal settings), API keys (owners and
budget pauses), webhook
endpoints and deliveries, logs, log drains. A few changes, each mirroring a dashboard action (same
checks, same audit event): retrying a webhook delivery, recovering an endpoint's failed
deliveries, enabling or disabling an endpoint, canceling or rescheduling a scheduled email,
pausing, resuming or canceling a broadcast, and reporting a risk assessment's outcome (also from
the review queue); everything else is read-only (with a link to the same page on coss.com). It
talks only to the dashboard's `/api/mobile/v1/*` (never the public API: it holds no API key).

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK. Before touching an Expo, EAS or React Native API, read the
versioned docs for the `expo` major in `package.json` (`https://docs.expo.dev/versions/v57.0.0/`,
index at `https://docs.expo.dev/llms.txt`). Add native modules with `bunx expo install <pkg>`
(SDK-compatible versions), then check with `EXPO_NO_TYPESCRIPT_SETUP=1 bunx expo-doctor`.

## Commands

```sh
bun run --cwd apps/mobile ios        # prebuild + build + install on the iOS Simulator (Xcode)
bun run --cwd apps/mobile start      # Metro (interactive; deliberately not a `dev` task in turbo)
bun run --cwd apps/mobile typecheck  # tsc (TS 7), run by the root `bun run typecheck`
bun run --cwd apps/mobile test       # bun test: pure modules only (React Native can't load in bun)
```

The dashboard URL is `EXPO_PUBLIC_DASHBOARD_URL` (default `http://localhost:3000`, which the
Simulator reaches; a device needs the Mac's LAN address), inlined by Metro at bundle time:
set it in `apps/mobile/.env.local` (gitignored) or the shell. No `build` script: release builds
go through EAS (below).

## Releases (TestFlight)

- EAS project `@calcoms-organization/coss` (`extra.eas.projectId`), Apple team Cal.com, Inc.
  (`ADWKXDJV75`), bundle id `com.coss.ios` (`com.coss.app` belongs to another team), App Store
  Connect app `6823275264` (listed as "coss.com"; the home screen name is `expo.name`).
- `eas.json`'s `production` profile bakes in `EXPO_PUBLIC_DASHBOARD_URL=https://coss.com` and
  takes build numbers from EAS (`appVersionSource: remote`, `autoIncrement`); bump
  `expo.version` for a new marketing version. The `calcoms-organization` account also injects its
  own production env vars (Cal.com's `EXPO_PUBLIC_CALCOM_*`), unused here.
- Signing is EAS-managed: the team's shared distribution certificate (also calcom-companion's;
  expires 2026-12-29, renew it in `eas credentials`) and a provisioning profile for `com.coss.ios`.
  App Store builds get `aps-environment: production` from Xcode's archive.
- Build: `bunx eas-cli build -p ios --profile production` with the App Store Connect API key in
  `EXPO_ASC_API_KEY_PATH`/`EXPO_ASC_KEY_ID`/`EXPO_ASC_ISSUER_ID` and `EXPO_APPLE_TEAM_ID`
  (an Admin team key; ask the owner for the `.p8`, never commit it). Upload the finished `.ipa`
  with `xcrun altool --upload-app -f <ipa> -t ios --apiKey <id> --apiIssuer <issuer>` (the key in
  `~/.appstoreconnect/private_keys`): `eas submit` insists on an Apple ID login to set up its own key.
- TestFlight: internal group "Team (Expo)" (created by EAS); internal testers need no review.

## Sign-in

The browser hand-off in `src/lib/auth.tsx`: PKCE (`src/lib/pkce.ts`) → `WebBrowser.openAuthSessionAsync`
on the dashboard's `/app/authorize` with `preferEphemeralSession` (no Safari cookies, so a code is only
minted after signing in inside the sheet) → `coss://auth/callback?code&state` → `POST
/api/mobile/v1/auth/token` → a mobile-only credential (`cm1.…`, not a dashboard cookie) in the Keychain (`expo-secure-store`,
`WHEN_UNLOCKED_THIS_DEVICE_ONLY`) sent as `Authorization: Bearer`. Server side: `@coss/auth/mobile`
and `apps/web/src/lib/mobile-api.ts`. Every web sign-in method works because the user signs in on
the real dashboard. A 401 forgets the token; `sso_required`/`two_factor_required` (403) carry the
dashboard page that resolves them.

## Push notifications

`expo-notifications` (config plugin in `app.json`, which adds the `aps-environment` entitlement)
with raw APNs device tokens; the dashboard's worker sends them (`@coss/push`, `packages/push/AGENTS.md`).
`src/lib/push.ts` asks for permission on the first signed-in start (iOS shows its prompt once per
install; afterwards the Account screen's Notifications panel, `components/push-settings.tsx`, turns
it on or links to Settings), then `PUT /api/mobile/v1/push` registers the token on this session with `apns_environment` `sandbox` in development builds (the plugin's default entitlement)
and `production` otherwise (Xcode's archive of a release build has the production entitlement).
Production's APNs key only serves the production gateway and `com.coss.ios`, so a development
build signed in to coss.com gets no pushes: APNs refuses them, and the worker retries that device until
the notification gives up (the others are delivered).
`AuthProvider` re-registers on every sign-in and token change. Signing out unregisters from APNs
(so a phone that couldn't reach the dashboard stops receiving pushes anyway) and revokes the
session, which ends its registration on the server; offline, the credential is kept in the
Keychain and revoked on a later start. A 401 only signs out when it answers the current credential.
Requests send `User-Agent: COSS-iOS/<version>`, which the dashboard's session list names
"coss.com app on iOS" (`describeUserAgent`). A tapped notification opens its `body.path`
(`content.data.path`) in `_layout.tsx`, only when `routeFromNotification` (`src/lib/push-route.ts`,
an allow-list of the paths `@coss/push` builds) accepts it: a new kind of notification needs its
path added there. Remote notifications need a physical iPhone or a Simulator on an Apple-silicon
Mac, and `APNS_*` set for the worker (it prints them without).

## Conventions

- Wire types come from `@coss/companion`, imported **type-only** (Metro never bundles it). Change
  the dashboard handlers and the type together. Newer areas keep their types in a file of their
  own (`packages/companion/src/<area>.ts`, re-exported by `export type *` — which silently drops a
  name two files both export, so keep names unique), their mapping in a `wire.ts` next to their
  routes, their hooks in `src/lib/queries-<area>.ts` (on the helpers `src/lib/queries.ts`
  exports) and their badge labels in `src/lib/status-<area>.ts`.
- A page the app shows needs a `read_*` flag in `OrganizationResponse["can"]` (the dashboard
  page's read permission) for the environment or organization screen's link to it.
- `src/app/` holds routes only (Expo Router); everything else lives in `src/lib` and
  `src/components`. Relative imports (no path aliases).
- Routes mirror the dashboard's paths (`/[org]/projects/[project]/[env]/…`, `/[org]/settings/…`),
  so `coss://<dashboard path>` deep links work and `WebButton`/`openOnWeb` (`src/lib/web.ts`)
  open the same page on coss.com. Copy is the dashboard's, copied verbatim (say where from).
- Design follows the dashboard (`apps/site/DESIGN.md`, coss ui): grayscale, hue only for status.
  `src/lib/theme.ts` holds coss ui's tokens (`packages/ui/src/styles/theme.css`, light and `.dark`)
  as `DynamicColorIOS` colors (`colors`) and plain ones for SVG (`usePalette`). Type is Cal Sans and
  Paper Mono: static TTFs cut from `@coss/ui`'s WOFF2 by `scripts/build-fonts.py` (re-run it when
  those change), embedded by the `expo-font` plugin and named by PostScript name (`fonts`). Always
  render text through `components/text.tsx` (never `fontWeight` with these families); mono is for
  ids, slugs, timestamps and measured values only. Icons are lucide (`components/icon.tsx`), as on the web.
- Components mirror the dashboard's: `Panel` (framed card on the muted tray), `ListRow`/`Ruled`,
  `SpecList`/`SpecItem`, `StatGrid`/`Stat`, `Badge`/`StatusDot`, `Alert`,
  `EmptyState` (on the drafting grid), `Tabs`/`Segmented`, `Button`, `ActivityChart`. Copy and status
  colors are the dashboard's (`src/lib/status.ts` mirrors `apps/web/src/components/email-badges.tsx`).
- Pages draw their own title like the dashboard's `PageHeader` (`Screen title` + `PageIntro`); the
  navigation bar shows it once it scrolls away. Native large titles didn't render with this setup
  (screens mount a loading view before their scroll view), so they're off.
- Hermes has no `Intl.RelativeTimeFormat`: `formatAgo` in `src/lib/format.ts` counts by hand.
- `src/lib/api.ts`, `src/lib/pkce.ts` and `src/lib/push-route.ts` import nothing from React Native so
  `bun test` covers them.
- `ios/`/`android/` are generated (Continuous Native Generation): configure `app.json` and config
  plugins, never edit or commit them.
- React and React Native are pinned to the SDK's versions (React 19.2.3), not the root catalog's
  (the web apps' React): RN refuses a mismatched renderer. The isolated linker keeps them apart.
- `react-native-reanimated`, `-worklets` and `-gesture-handler` are declared (SDK versions) only
  because `expo-router` → `react-native-drawer-layout` requires them as peers: undeclared, Bun
  installs their latest releases, which don't match the SDK's native code.
- TypeScript is the catalog's TS 7 (no JS API); `EXPO_NO_TYPESCRIPT_SETUP=1` keeps the Expo CLI
  from touching it, and `expo.install.exclude` silences `expo-doctor`'s version check.
- `expo-doctor` reports "duplicate" copies of `expo`/`@expo/log-box`/`expo-router`: Bun's
  isolated linker makes one per peer set (their peers are circular). Same version, same React;
  the bundle contains one copy (checked with a source map).
