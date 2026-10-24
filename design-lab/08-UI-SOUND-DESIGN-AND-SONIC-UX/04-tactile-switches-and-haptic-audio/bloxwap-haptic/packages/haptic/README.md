<h1 align="center">Haptic</h1>

<p align="center"><strong>Haptic feedback for React.<br>Physical taps on iOS, patterns on vibration-capable browsers.</strong></p>

<p align="center"><a href="https://bloxwap.github.io/haptic/">Documentation and demo</a> · <a href="https://github.com/bloxwap/haptic">Source</a> · <a href="https://github.com/bloxwap/haptic/blob/main/LICENSE">MIT license</a></p>

## Installation

```sh
npm install @bloxwap/haptic
```

React and React DOM are external peers. Use matching React 18+ versions. ESM, CommonJS, and TypeScript declarations are included.

## Usage

```tsx
import { Haptic } from '@bloxwap/haptic';

<Haptic feedback="success">
  <button onClick={save}>Save</button>
</Haptic>
```

Your target keeps its handlers, ref, focus, and accessibility attributes. `HapticTarget` is the same component.

Options: `enabled` (default true), `disabled` (false), `feedback` (`selection`), `triggerOptions`, `webHapticsOptions`, `className`, and `style`. The wrapper uses `inline-grid` by default. Disabled and `aria-disabled="true"` hosts suppress feedback.

Feedback accepts `selection`, `light`, `medium`, `heavy`, `soft`, `rigid`, `success`, `warning`, `error`, `nudge`, `buzz`, a duration in milliseconds, alternating on/off arrays, vibration event objects, or a preset object.

iOS physical taps use a native system tick; presets and intensity do not change it. Synthetic events, timers, and async callbacks cannot promise iOS feedback. Desktop audio preview is opt-in with `webHapticsOptions={{ debug: true }}`. Actual feedback depends on hardware, browser, and settings.

Physical-device and VoiceOver certification remains pending in [issue #9](https://github.com/bloxwap/haptic/issues/9). Automated tests verify browser interactions and API calls, not tactile output.

Exports also include `isIOSWebKitWithoutVibration`, `useIOSNativeHaptics`, `canTriggerHaptic`, `triggerHaptic`, `HapticTargetProps`, `HapticCapability`, `HapticTriggerResult`, `HapticInput`, `HapticPattern`, `HapticPreset`, `TriggerOptions`, `Vibration`, and `WebHapticsOptions`. The wrapper/platform code is independent; feedback types and the vibration engine use the declared `web-haptics` dependency.

`useIOSNativeHaptics()` returns the detected routing value on the first client-only render. It returns `false` on the server and during the first hydration render, then resolves client routing after hydration.

`canTriggerHaptic()` probes current imperative availability without creating DOM. `triggerHaptic(cue?, options?)` requests browser vibration with the same patterns and resolves `{ delivered, mechanism, reason? }` without rejecting or creating auxiliary DOM. `delivered` means browser acceptance, not observed tactile output. iOS imperative feedback reports unavailable even during transient activation: programmatic switch clicks do not establish a trusted physical tap. Use `HapticTarget` for the eligible iOS physical path.

## Documentation

[API, guides, and interactive demos](https://bloxwap.github.io/haptic/). [Source and release evidence](https://github.com/bloxwap/haptic).

## License

MIT

### HIG semantic feedback

`@bloxwap/haptic/feedback` exports platform-free `FeedbackEvent`,
`FeedbackPreferences`, `semanticHaptics`, `createHapticAdapter(backend)` and
`createNativeHapticAdapter(hostExpoModule, capability)`. The adapters implement
HIG's haptic channel without importing React, DOM, Web Audio, Expo or RN. HIG owns
preference storage, event deduplication and cadence; the host supplies backend
availability and AppState. API success is never hardware observation.

`HapticTarget` also accepts host `preferences={{ haptics }}` and
`policyEnabled`. Application veto and stored preferences gate component intent;
sound and motion remain independent. For HIG's physical iOS target, pre-approve
eligibility, enable only the physical path and disable debug audio. An iOS tick
cannot be canceled after the OS activates its switch. Native Expo operations
cannot retract an already submitted tick either.

See the [integration guide](https://bloxwap.github.io/haptic/docs/hig/) for mappings,
backend injection, no-op defaults, independent channels and validation limits.
