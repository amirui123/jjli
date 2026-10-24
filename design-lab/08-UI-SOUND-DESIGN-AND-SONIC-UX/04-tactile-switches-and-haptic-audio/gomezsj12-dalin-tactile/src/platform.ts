/** Coarse platform detection for routing haptics and building diagnostics. */
export interface Platform {
  ios: boolean;
  android: boolean;
  desktop: boolean;
  standalonePWA: boolean;
}

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") {
    return { ios: false, android: false, desktop: true, standalonePWA: false };
  }
  const ua = navigator.userAgent || "";
  const hasTouch = typeof document !== "undefined" && "ontouchend" in document;
  // iPadOS 13+ reports a Mac UA, so disambiguate by touch support.
  const ios = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && hasTouch);
  const android = /Android/.test(ua);
  const standaloneMedia =
    typeof matchMedia !== "undefined" && matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return {
    ios,
    android,
    desktop: !ios && !android,
    standalonePWA: standaloneMedia || iosStandalone,
  };
}
