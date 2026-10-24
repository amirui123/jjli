# web-haptics-toast

**Standalone** React toasts with **haptics built in**: one `npm install`, and you get the UI, styles, and vibration/audio engine together—**no extra packages** for haptics.

The **`toast()`** and **`<Toaster />`** API is compatible with **Sonner**, so you can migrate or adopt without new mental models (including an optional npm alias so imports can stay `from 'sonner'`).

By [**DesignByte**](https://studio.designbyte.dev) · [GitHub](https://github.com/Gaurav-r-a-j/)

---

## Already using Sonner? (zero code change)

Replace your package and keep all existing imports. Your app keeps `import { Toaster, toast } from 'sonner'`:

```bash
# npm
npm uninstall sonner && npm install sonner@npm:web-haptics-toast

# pnpm
pnpm remove sonner && pnpm add sonner@npm:web-haptics-toast

# yarn
yarn remove sonner && yarn add sonner@npm:web-haptics-toast

# bun
bun remove sonner && bun add sonner@npm:web-haptics-toast
```

No import changes needed. Haptics are on by default; disable with `<Toaster haptics={false} />`.

On the docs site in this repo, see **[Migrate from Sonner](./website/src/pages/migration-from-sonner.mdx)** (route `/migration-from-sonner` when you run the website) for both migration paths, CSS notes, and a checklist.

---

## New install

```bash
npm install web-haptics-toast
```

```jsx
import { Toaster, toast } from 'web-haptics-toast';
import 'web-haptics-toast/dist/styles.css';

function App() {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast('My first toast')}>Toast</button>
      <button onClick={() => toast.success('Done!')}>Success</button>
      <button onClick={() => toast.error('Failed')}>Error</button>
    </div>
  );
}
```

### Disable haptics

```jsx
<Toaster haptics={false} />
```

### Customize haptic pattern per toast type

```jsx
<Toaster
  hapticPatternMap={{
    info: 'selection',
    loading: 'light',
  }}
/>
```

Built-in pattern names: `success`, `error`, `warning`, `light`, `medium`, `heavy`, `soft`, `rigid`, `selection`, `nudge`, `buzz`.

### Test haptics on desktop (play sound)

When vibration isn’t available (e.g. desktop), you can still verify patterns by playing a short sound for each pulse:

```jsx
<Toaster hapticsDebug />
```

Use this during development to confirm which pattern runs for each toast type. On devices that support vibration, you still get real haptics; sound plays in addition when `hapticsDebug` is true.

### Show an on-screen haptics toggle

```jsx
<Toaster hapticsShowSwitch />
```

Renders a small built-in control so users can turn feedback on or off without you wiring custom UI.

### Haptics on a button (or anywhere), not on every toast

`<Toaster haptics={false}>` stops **toast**-driven vibration. You can still call **`triggerHaptic`** from any **`onClick`**, **`onSubmit`**, shortcut handler, etc.:

```jsx
import { Toaster, toast, triggerHaptic } from 'web-haptics-toast';

<Toaster haptics={false} />
<button
  type="button"
  onClick={() => {
    triggerHaptic('success');
    toast('Done');
  }}
>
  Save
</button>
```

You can also skip haptics for **individual** toasts: `toast('…', { haptics: false })` while leaving `<Toaster haptics />` on. Full write-up: **`/haptics#manual-haptics`** on the docs site.

### Other API

- **`isHapticsSupported`** – `true` if `navigator.vibrate` is available.
- **`triggerHaptic(patternName, options?)`** – fire a built-in preset by name. Options: `{ intensity?: number; debug?: boolean }`. Use `triggerHaptic('success', { debug: true })` to hear the pattern on desktop.
- **`WebHaptics`** – low-level class included in this package. Create instances with `new WebHaptics({ debug, showSwitch })`, call `.trigger(input)`, `.destroy()`.
- **`defaultPatterns`** – the preset map shipped with the library (success, error, warning, light, etc.).

Sonner-style props still work the same (`position`, `duration`, `theme`, `richColors`, etc.).

### Credits

Toast UX and API follow **Sonner**. Haptic presets and the `WebHaptics` model are **vendored inside this repo**—aligned with the ideas behind [web-haptics](https://github.com/lochie/web-haptics), but **not** installed as a separate dependency.

---

## License

MIT © [DesignByte](https://studio.designbyte.dev)
