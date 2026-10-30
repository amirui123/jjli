/**
 * Entry sequence — «مُهر» / The Seal.
 *
 * A gold seal falls, strikes the sheet, is pulled off leaving its ink, and the
 * mark opens into the page. Every number, colour and easing curve the sequence
 * uses lives here so the choreography can be retimed without touching markup.
 *
 * Timeline (ms, counted from the moment assets are ready):
 *   0 ───────── seal already falling (it enters mid-motion, no wind-up)
 *   STRIKE ──── contact: squash, shake, pressure ring, glow
 *   SETTLE ──── the bite: mark engraved, hairline pressure held
 *   LIFT ────── seal pulled off the paper, hero reveal fired to the page
 *   GONE ────── sheet lifted, overlay unmounted
 */

/** `cubic-bezier` control points, typed for framer-motion. */
export type Bezier = [number, number, number, number];

export const SEAL_COPY = {
  /** Accessible name of the overlay while the sequence plays. */
  dialogLabel: "مُهر ورود به آزمایشگاه موشن فارسی",
  /** Short description announced to screen readers. */
  description: "مُهر طلایی روی صفحه فرود می‌آید و تیتر صفحه را آشکار می‌کند.",
  /** Escape hatch, always visible while the seal plays. */
  skip: "رد کردن",
  skipLabel: "رد کردن موشن ورود",
} as const;

export const SEAL_TIMING = {
  /** Seal contacts the sheet. Everything before this is the fall. */
  strike: 320,
  /** How long the seal keeps travelling after contact (squash + settle). */
  settle: 1.18,
  /** The seal is pulled off the sheet. */
  lift: 1180,
  /** The sheet has started opening — this is when the hero performs. */
  reveal: 1280,
  /** Sheet has lifted completely — overlay unmounts. */
  gone: 1900,
  /** Last-resort cleanup if a frame stalls and a timer never lands. */
  safety: 3200,
  /** Reduced motion: a plain 200ms fade, nothing else. */
  reduced: 200,
  /** Never hold the entrance for assets longer than this. */
  assetCap: 420,
  /** Skip control fades in after the strike so it never competes with it. */
  skipDelay: 420,
} as const;

export const SEAL_COLORS = {
  /** The sheet the seal strikes — identical to the page's own ground. */
  paper: "#05060A",
  gold: "#E8B33A",
  goldLight: "#F7D488",
  goldDeep: "#8A5E13",
  ivory: "#F5F2EB",
} as const;

export const SEAL_EASE = {
  /** The fall: enters fast, brakes late. Nothing about this is linear. */
  fall: [0.12, 0.86, 0.19, 1] as Bezier,
  /** The ring blast: explosive, decelerating to a stop. */
  ring: [0.16, 1, 0.3, 1] as Bezier,
  /** The bite: invisible ease, used to hold a property still. */
  hold: [0.4, 0, 1, 1] as Bezier,
  /** The seal being pulled off: accelerating away. */
  lift: [0.55, 0, 0.85, 0.4] as Bezier,
  /** The sheet itself lifting: slow start, long glide. */
  sheet: [0.32, 0, 0.14, 1] as Bezier,
} as const;

export const SEAL_STAGGER = {
  /** Offset between the gold pressure ring and its ivory echo. */
  ringEcho: 0.06,
} as const;

/** Session flag: the seal plays once per session, then repeat visits are instant. */
export const SEAL_SESSION_KEY = "rtmlab.v1.seal-seen";

export const SEAL_EVENT = {
  /** Fired at LIFT so the page starts its hero entrance under the opening sheet. */
  reveal: "rtmlab:hero-reveal",
  /** Fired by the "watch the intro" affordances to replay the sequence. */
  open: "rtmlab:open-intro",
} as const;

/**
 * Will the seal play on this page load? The hero asks before it decides whether
 * to perform its own entrance immediately or wait for the seal to lift — that is
 * what keeps the two from running as two separate motions.
 */
export function sealWillPlay(): boolean {
  if (typeof window === "undefined") return false;
  if (/jsdom/i.test(navigator.userAgent)) return false;
  try {
    return window.sessionStorage.getItem(SEAL_SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

/** The seal's rendered size. One rule for phones, tablets and ultrawide. */
export const SEAL_SIZE = "clamp(132px, 36vw, 184px)";
