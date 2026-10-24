export const registry = {
  "sound-button": {
    description: "A semantic button with feedback after activation.",
    file: "sound-button.tsx",
    source: `"use client";
import { useSound } from "@alvarovillalbaa/sonant/react";
import type { ButtonHTMLAttributes } from "react";
export function SoundButton({ onClick, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const sound = useSound();
  return <button type="button" {...props} onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented) void sound.emit("action.confirm", { source: "SoundButton" });
  }}>{children}</button>;
}
`,
  },
  "sound-switch": {
    description: "A native checkbox with a semantic selection cue.",
    file: "sound-switch.tsx",
    source: `"use client";
import { useSound } from "@alvarovillalbaa/sonant/react";
export function SoundSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const sound = useSound();
  return <label><input type="checkbox" checked={checked} onChange={event => {
    onChange(event.target.checked);
    void sound.emit("action.select", { source: "SoundSwitch" });
  }} />{label}</label>;
}
`,
  },
  "sound-settings": {
    description: "Explicit mute, volume, and profile controls.",
    file: "sound-settings.tsx",
    source: `"use client";
import { useSound } from "@alvarovillalbaa/sonant/react";
export function SoundSettings() {
  const sound = useSound();
  return <fieldset><legend>Interaction sound</legend>
    <label><input type="checkbox" checked={sound.preferences.enabled} onChange={event => sound.setPreferences({ enabled: event.target.checked })} />Sound enabled</label>
    <label>Volume<input type="range" min="0" max="1" step="0.01" value={sound.preferences.volume} onChange={event => sound.setPreferences({ volume: Number(event.target.value) })} /></label>
    <label>Profile<select value={sound.preferences.profile} onChange={event => sound.setPreferences({ profile: event.target.value as "quiet" | "balanced" | "expressive" })}>
      <option value="quiet">Quiet</option><option value="balanced">Balanced</option><option value="expressive">Expressive</option>
    </select></label>
  </fieldset>;
}
`,
  },
  "async-action": {
    description: "A bounded operation with success, failure, and unmount cleanup.",
    file: "async-action.tsx",
    source: `"use client";
import { useState } from "react";
import { useSoundOperation } from "@alvarovillalbaa/sonant/react";
export function AsyncAction({ run }: { run: () => Promise<void> }) {
  const begin = useSoundOperation();
  const [status, setStatus] = useState("Ready");
  return <div><button type="button" disabled={status === "Saving…"} onClick={async () => {
    const operation = begin("progress.start", { source: "AsyncAction", visibleEquivalent: true });
    setStatus("Saving…");
    try { await run(); setStatus("Saved"); await operation.resolve("state.success"); }
    catch { setStatus("Could not save. Try again."); await operation.reject("state.error"); }
    finally { operation.stop(); }
  }}>Save changes</button><p role="status">{status}</p></div>;
}
`,
  },
} as const;
export type RegistryItem = keyof typeof registry;
