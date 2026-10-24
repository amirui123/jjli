# Sonant

Last updated: 2026-10-15

**A little sound. A lot more feeling.**

An open-source sound layer for React, Next.js, and the web: semantic feedback, original sound characters, considerate playback policy, copy-in components, and local diagnostics.

[Website & playground](https://sonant-beta.vercel.app/) · [Create a kit](https://sonant-beta.vercel.app/#/create) · [Documentation](https://sonant-beta.vercel.app/#/docs)

## Install

```sh
npm install @alvarovillalbaa/sonant
# or: pnpm add @alvarovillalbaa/sonant

npx @alvarovillalbaa/sonant@latest init
pnpm dlx @alvarovillalbaa/sonant@latest add sound-button sound-settings
```

The CLI copies a client provider, all editable recipes, and chosen headless components into your application. It refuses existing files and symlinks. It never installs dependencies or modifies your layout automatically.

```tsx
"use client";
import { SoundProvider, useSound } from "@alvarovillalbaa/sonant/react";

function Preview() {
  const sound = useSound();
  return <button onClick={() => void sound.emit("action.select")}>Try a cue</button>;
}

export default function App() {
  return <SoundProvider><Preview /></SoundProvider>;
}
```

The runtime defaults to enabled at 35% volume. The generated installation starts sound **off**, uses device-local preferences, and works with the copied `sound-settings` component for explicit opt-in. Neither plays automatically.

## Included

- **32 semantic events:** 22 interface interactions plus 10 agent state transitions.
- **Three original characters:** Studio, Soft, and Arcade. Deterministic synthesis, no recordings or runtime dependencies in the core.
- **Scoped runtime:** cooldowns, surface density budgets, priorities, voice limits, preference controls, speech suppression, background silence, bounded loops, and idle suspension.
- **Operation lifecycle:** begin, update, resolve, reject, and stop. Cancellation and React unmount cleanup cover pending browser unlocks.
- **React:** client provider, reactive hook, operation hook, and headless inspector; SSR-safe core imports.
- **Providers:** Web Audio, application-owned contexts, HTML audio files, and a normalized bridge for existing engines.
- **CLI:** init, add, list, audit, test, export, and compile. Editable recipes and source; WAV export with provenance and hashes.
- **Website:** searchable previews, code snippets, WAV downloads, examples, configurator, complete API docs, and live trace inspector.
- **Local diagnostics:** bounded traces and explicit suppression reasons. No network telemetry or audio recording.

## Stateful feedback

```ts
const operation = sound.begin("progress.start", {
  source: "Upload",
  visibleEquivalent: true,
});
try {
  await upload();
  await operation.resolve("state.success");
} catch {
  await operation.reject("state.error");
} finally {
  operation.stop();
}
```

Loops stop after three seconds by default. A later confirmed outcome can still play. The consuming app owns status messages, accessibility, cancellation, and the decision to use sound.

## Development

Node 22.12+ and npm:

```sh
npm ci
npm run dev
npm run check
npm test
npm run build:site
npm run test:e2e
npm run pack:library
```

The repository is an npm workspace. `packages/sonant/` owns the public ESM package; `website/` consumes that exact package. `tests/` holds unit, CLI integration, and browser checks. The static site uses hash routes and is hosted on Vercel, Clous Team (Pro). `vercel.json` builds the workspace with `npm run build:site` and serves `website/dist` at `/`. The connected `main` branch deploys automatically. See [deployment evidence](docs/deployment.md).

## Proof and limits

`sonant audit` is an advisory source review, not control-flow or accessibility proof. `sonant test` checks deterministic recipes, sample peaks, and tails, not perceptual loudness or subjective quality. A “played” trace means a provider accepted playback; it cannot establish physical audibility.

This release does not include hosted analytics, experiments, native haptics, Ogg export, team governance, or direct version-specific third-party adapters. See [scope](docs/specs/product.md), [architecture](docs/references/architecture.md), [sources](docs/sources/INDEX.md), and [release procedure](docs/runbooks/release.md).

Original recipes and code are MIT licensed. Website fonts use their upstream SIL Open Font Licenses. No competitor sounds or testimonials are copied.
