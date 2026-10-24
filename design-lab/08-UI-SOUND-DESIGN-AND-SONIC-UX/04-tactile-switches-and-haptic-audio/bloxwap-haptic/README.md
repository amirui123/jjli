<h1 align="center">Haptic</h1>

<!--
─────────────────────────────────────────────────────────────────────────────
-->

<p align="center">
Haptic feedback for React on iOS and vibration-capable browsers.<br>
SSR-safe, with graceful fallbacks. <a href="https://bloxwap.github.io/haptic/">Try the live demo</a>.
</p>

<!--
─────────────────────────────────────────────────────────────────────────────
-->

<p align="center">
<a href="https://www.npmjs.com/package/@bloxwap/haptic"><img src="https://img.shields.io/npm/v/@bloxwap/haptic" alt="npm version"></a>
<a href="https://www.npmjs.com/package/@bloxwap/haptic"><img src="https://img.shields.io/npm/dm/@bloxwap/haptic" alt="downloads"></a>
<a href="https://codecov.io/gh/bloxwap/haptic"><img src="https://img.shields.io/codecov/c/github/bloxwap/haptic" alt="coverage"></a>
<a href="https://bundlephobia.com/package/@bloxwap/haptic"><img src="https://img.shields.io/bundlephobia/minzip/@bloxwap/haptic" alt="minzipped size"></a>
</p>

## Features

- **One component wrapping the original React target.** `Haptic` and `HapticTarget` are aliases for a single wrapper that preserves your element's handlers, ref, focus, and accessibility.
- **Eleven vibration presets and custom patterns.** Choose from presets like `selection`, `success`, and `error`, or specify custom durations, alternating patterns, and event objects with delay and intensity.
- **Native iOS physical-tap ticks.** Physical taps on iOS trigger the system haptic, while vibration-capable browsers use the Vibration API with pattern and intensity support.
- **Full target behavior preservation.** Handlers, refs, focus, accessibility, keyboard, forms, links, and drawer integration all retain the original target's behavior.
- **Server-safe rendering.** Works with SSR and hydration, providing both ESM and CommonJS builds with TypeScript declarations.
- **Independently written wrapper.** Platform-specific code with `web-haptics` as a declared dependency.

## Installation

```sh
npm install @bloxwap/haptic
```

Works with React 18 or newer. Requires matching React and React DOM peer versions.

## Release status

`0.3.0` is public; physical iPhone/Android/iPadOS/VoiceOver certification is still pending (see issues [#7](https://github.com/bloxwap/haptic/issues/7) and [#9](https://github.com/bloxwap/haptic/issues/9)). Automated checks establish browser interactions and API calls, not tactile output.

## Usage

Wrap any React element to add haptic feedback.

```tsx
import { Haptic } from '@bloxwap/haptic';

export function SaveButton() {
  return (
    <Haptic feedback="success">
      <button onClick={() => console.log('Saved')}>Save</button>
    </Haptic>
  );
}
```

The original element keeps its handlers, ref, focus, and accessibility. The wrapper defaults to `inline-grid`; `className` and `style` control its layout.

```tsx
<Haptic
  feedback={[30, 60, 30]}
  triggerOptions={{ intensity: 0.7 }}
  webHapticsOptions={{ debug: false, showSwitch: false }}
  style={{ display: 'grid', width: '100%' }}
>
  <button>Continue</button>
</Haptic>
```

`enabled={false}` or `disabled={true}` suppresses feedback while leaving the action available. Disabled and `aria-disabled="true"` hosts are detected automatically.

## API

```ts
import {
  Haptic, HapticTarget,
  isIOSWebKitWithoutVibration, useIOSNativeHaptics,
  canTriggerHaptic, triggerHaptic,
  type HapticTargetProps, type HapticInput, type HapticPattern,
  type HapticPreset, type TriggerOptions, type Vibration, type WebHapticsOptions,
  type HapticCapability, type HapticTriggerResult,
} from '@bloxwap/haptic';
```

| Export | Description |
| --- | --- |
| `Haptic` / `HapticTarget` | The component that wraps a single React element and adds haptic feedback. Props: `feedback` (preset, duration, pattern, or object), `enabled`, `disabled`, `triggerOptions`, `webHapticsOptions`, `className`, `style`, `children` (single element). |
| `isIOSWebKitWithoutVibration()` | Returns `true` when running on iOS WebKit without Vibration API support, indicating native system haptics will be used. |
| `useIOSNativeHaptics()` | React hook that returns whether iOS native haptics are active. |
| `canTriggerHaptic()` | Probes current imperative availability without creating DOM or requesting feedback. |
| `triggerHaptic(cue?, options?)` | Requests browser vibration with the same patterns as `HapticTarget` and resolves `{ delivered, mechanism, reason? }` without rejecting. |

**Presets:** `selection`, `light`, `medium`, `heavy`, `soft`, `rigid`, `success`, `warning`, `error`, `nudge`, `buzz`.

`feedback` accepts a preset string, duration in milliseconds, alternating on/off `number[]`, vibration event objects, or `{ pattern: [...] }`. The default is `selection`.

`delivered` means the browser accepted the request, not that tactile output was observed. iOS imperative requests report unavailable even inside a click handler because programmatic clicks cannot establish a trusted physical tap. Use `HapticTarget` for the eligible iOS physical path. See the [API guide](https://bloxwap.github.io/haptic/docs/api/).

## Platforms

iOS feedback requires a physical tap and always uses the native system tick. Timers, synthetic clicks, and asynchronous callbacks cannot promise physical feedback. Presets and intensity apply to vibration-capable browsers.

Desktop audio preview is opt-in with `webHapticsOptions={{ debug: true }}`. Hardware and browser settings determine actual feedback; iPadOS routing alone does not prove haptic hardware. Browser automation does not establish tactile output.

For Next.js, place interactive usage in a client component. The build preserves its client boundary and renders safely through React SSR.

## Documentation

Guides, API reference, and interactive demos: **https://bloxwap.github.io/haptic/**

The [evaluation](.github/planning/EVALUATION.md), [compatibility contract](.github/planning/COMPATIBILITY.md), and [task index](.github/planning/TASKS.md) record the independent build and release requirements.

## Development

This repository is an npm workspace: the library lives in [`packages/haptic`](packages/haptic) and the documentation site in [`apps/docs`](apps/docs).

```sh
npm ci
npm test            # run the test suite
npm run coverage    # tests with 100% line/branch/function coverage enforcement
npm run build       # build the library
npm run typecheck   # TypeScript validation
npm run test:matrix # test across React versions
npm run size        # bundle size check
npm run pack:check  # verify package contents
npm run test:browser # Playwright tests
npm run dev         # docs dev server at http://localhost:3905
```

Type checking uses [`tsrs`](https://github.com/oxc-project/tsrs), a Rust port of the TypeScript 7 compiler that reports the same diagnostics as `tsc`. tsrs ships binaries for macOS on Apple Silicon and Linux (x64/arm64) only. On Windows or an Intel Mac, use the `tsc` fallbacks instead:

```sh
npm run typecheck:tsc   # library type check with the regular TypeScript compiler
npm run docs:check:tsc  # docs and snippet type check with tsc
```

The library build (tsup) never used `tsc`, so `npm run build`, tests, and coverage work everywhere. `npm run docs:build` runs tsrs before `next build`; on those platforms run `npm run docs:check:tsc`, then `npm --workspace @bloxwap/haptic-docs exec -- next build`.

Requires Node.js 24 or newer. `bun run dev` invokes the same development script; npm owns the lockfile.

Documentation build and preview:

```sh
NEXT_PUBLIC_BASE_PATH=/haptic npm run docs:build
npm run docs:check
npm run docs:preview
```

### Documentation dev-server ports

| Repository | Port |
| --- | --- |
| hyperliquid | 3901 |
| chart | 3902 |
| sfx | 3903 |
| font | 3904 |
| haptic | 3905 |

## License

[MIT](LICENSE)

`web-haptics` is independently distributed under MIT; website fonts retain their [OFL license notice](apps/docs/public/licenses/bloxwap-font-OFL.txt), which is included in the static site.
