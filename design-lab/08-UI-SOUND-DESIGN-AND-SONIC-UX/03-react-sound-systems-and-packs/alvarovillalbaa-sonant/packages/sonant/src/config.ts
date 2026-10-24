import { createTheme, type ThemeName } from "./catalog.js";
import type { Profile } from "./types.js";

export const packageName = "@alvarovillalbaa/sonant";
export function createConfig({
  theme = "studio",
  profile = "balanced",
  volume = 0.35,
  enabled = false,
}: {
  theme?: ThemeName;
  profile?: Profile;
  volume?: number;
  enabled?: boolean;
} = {}) {
  if (!["studio", "soft", "arcade"].includes(theme))
    throw new TypeError("Theme must be studio, soft, or arcade.");
  if (!["quiet", "balanced", "expressive"].includes(profile))
    throw new TypeError("Profile must be quiet, balanced, or expressive.");
  if (!Number.isFinite(volume) || volume < 0 || volume > 1)
    throw new RangeError("Volume must be between 0 and 1.");
  return {
    schemaVersion: 1,
    theme,
    preferences: { enabled, volume, profile },
    directory: "components/sonant",
  };
}
export function providerSource(config: ReturnType<typeof createConfig>) {
  return `"use client";
import { SoundProvider } from "@alvarovillalbaa/sonant/react";
import { localPreferences, type SoundTheme } from "@alvarovillalbaa/sonant";
import type { ReactNode } from "react";
import theme from "./theme.json" with { type: "json" };

export function SonantProvider({ children }: { children: ReactNode }) {
  return <SoundProvider theme={theme as SoundTheme} preferences={${JSON.stringify(config.preferences)}} storage={localPreferences()}>
    {children}
  </SoundProvider>;
}
`;
}
export function kitFiles(config: ReturnType<typeof createConfig>) {
  return {
    "sonant.config.json": JSON.stringify(config, null, 2) + "\n",
    [`${config.directory}/provider.tsx`]: providerSource(config),
    [`${config.directory}/theme.json`]: JSON.stringify(createTheme(config.theme), null, 2) + "\n",
  };
}
