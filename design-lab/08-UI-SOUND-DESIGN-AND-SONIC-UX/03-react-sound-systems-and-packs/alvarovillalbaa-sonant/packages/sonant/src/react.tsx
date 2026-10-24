"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createSoundSystem, type SoundSystem } from "./runtime.js";
import type { SoundEvent } from "./catalog.js";
import type { EmitOptions, SoundOptions } from "./types.js";

const Context = createContext<SoundSystem | null>(null);

/** Create one system per mounted provider. Configuration is read once at mount. */
export function SoundProvider({
  children,
  system,
  ...options
}: SoundOptions & { children: ReactNode; system?: SoundSystem }) {
  const ref = useRef<SoundSystem | null>(null);
  const storage = useRef(options.storage);
  const restored = useRef(false);
  if (!ref.current)
    ref.current =
      system ??
      createSoundSystem({
        ...options,
        // Device preferences are restored after hydration so server and client agree.
        storage: storage.current
          ? { load: () => null, save: (value) => storage.current?.save(value) }
          : undefined,
      });
  const instance = system ?? ref.current;
  // React StrictMode replays effects. Delay disposal so a replay can cancel it.
  const disposal = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(disposal.current);
    if (!system && !restored.current) {
      restored.current = true;
      try {
        const saved = storage.current?.load();
        if (saved) instance.setPreferences(saved);
      } catch {
        /* Optional device storage. */
      }
    }
    return () => {
      if (!system)
        disposal.current = setTimeout(() => {
          void instance.destroy();
        }, 0);
    };
  }, [instance, system]);
  return createElement(Context.Provider, { value: instance }, children);
}

export function useSound() {
  const system = useContext(Context);
  if (!system) throw new Error("useSound must be used inside a SoundProvider.");
  const state = useSyncExternalStore(system.subscribe, system.getSnapshot, system.getSnapshot);
  return { ...system, ...state };
}

/** Stops a pending or active operation when the component unmounts. */
export function useSoundOperation() {
  const sound = useSound();
  const operation = useRef<ReturnType<SoundSystem["begin"]> | null>(null);
  useEffect(() => () => operation.current?.stop(), []);
  return (event: SoundEvent = "progress.start", options?: EmitOptions) => {
    operation.current?.stop();
    operation.current = sound.begin(event, options);
    return operation.current;
  };
}

/** Headless local diagnostics; pass children to own the rendering. */
export function SoundInspector({
  children,
}: {
  children: (state: ReturnType<typeof useSound>) => ReactNode;
}) {
  return children(useSound());
}
