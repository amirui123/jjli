# @earcon/react

React bindings for earcon: `NotifierProvider` owns monitors and sounds and wires
events to the engine; `useMonitor` feeds one value in; `useToneNotifier` exposes
status, unlock, mute and master volume; `UnlockGate` is a headless gate for the
browser's user-gesture requirement.

```tsx
<NotifierProvider engine={createToneEngine()}>
  <UnlockGate.Default />
  <Wallet />
</NotifierProvider>
```

Part of [earcon](https://github.com/hironow/earcon). Quick start and API in the repository README and `docs/api.md`.
