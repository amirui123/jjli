export type Platform = 'ios' | 'android' | 'desktop'

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop'

  const ua = navigator.userAgent

  if (/iPhone|iPod|iPad/.test(ua)) return 'ios'
  // iPad-as-desktop: reports as Macintosh but has touch
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios'
  if (/Android/.test(ua)) return 'android'

  return 'desktop'
}
