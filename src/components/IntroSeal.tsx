import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimate,
  useReducedMotion,
  type AnimationPlaybackControls,
  type Easing,
} from "framer-motion";
import {
  SEAL_COLORS,
  SEAL_COPY,
  SEAL_EASE,
  SEAL_EVENT,
  SEAL_SESSION_KEY,
  SEAL_SIZE,
  SEAL_TIMING,
} from "../shell/introSeal";

/* ------------------------------------------------------------------ helpers */

const sec = (ms: number) => ms / 1000;

/** True only on a first visit, in a real browser. */
function shouldAutoPlay(): boolean {
  if (typeof window === "undefined") return false;
  // The e2e suite runs with a "jsdom" UA; that UA must never see the seal.
  if (/jsdom/i.test(navigator.userAgent)) return false;
  try {
    return window.sessionStorage.getItem(SEAL_SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

function rememberSeen() {
  try {
    window.sessionStorage.setItem(SEAL_SESSION_KEY, "1");
  } catch {
    /* private mode: replaying next time is harmless */
  }
}

/**
 * Freeze the document without shifting it. Compensating the scrollbar gutter
 * means locking the sheet costs exactly zero layout shift.
 */
function lockScroll(): () => void {
  const root = document.documentElement;
  const gap = window.innerWidth - root.clientWidth;
  const before = {
    overflow: root.style.overflow,
    overscroll: root.style.overscrollBehavior,
    padding: root.style.paddingInlineEnd,
  };
  root.style.overflow = "hidden";
  root.style.overscrollBehavior = "none";
  if (gap > 0) root.style.paddingInlineEnd = `${gap}px`;
  return () => {
    root.style.overflow = before.overflow;
    root.style.overscrollBehavior = before.overscroll;
    root.style.paddingInlineEnd = before.padding;
  };
}

/** Hand the keyboard to the page the moment the seal is gone. */
function focusContent() {
  document.getElementById("main")?.focus({ preventScroll: true });
}

/* -------------------------------------------------------------------- mark */

/** Two interlaced squares and a nuqta: an eight-fold Persian girih. */
const Girih: React.FC<{ stroke: string }> = ({ stroke }) => (
  <g fill="none" stroke={stroke} strokeLinejoin="round">
    <rect x="57" y="57" width="86" height="86" rx="3" strokeWidth="0.9" />
    <rect
      x="57"
      y="57"
      width="86"
      height="86"
      rx="3"
      strokeWidth="0.9"
      transform="rotate(45 100 100)"
    />
    <circle cx="100" cy="100" r="43" strokeWidth="0.65" opacity="0.62" />
  </g>
);

/** The signet's monogram — the same «م» that sits in the site's own logo. */
const Monogram: React.FC<{ fill: string; size?: number }> = ({ fill, size = 64 }) => (
  <text
    x="100"
    y="100"
    dy="4"
    textAnchor="middle"
    dominantBaseline="central"
    fill={fill}
    style={{ fontFamily: "'Hasti', 'IranNastaliq', serif" }}
    fontSize={size}
  >
    م
  </text>
);

/** The bronze face that flies in: gold rim, gold engraving, dark metal. */
const SealFace: React.FC = () => (
  <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
    <defs>
      <radialGradient id="seal-metal" cx="36%" cy="28%" r="86%">
        <stop offset="0%" stopColor="#453517" />
        <stop offset="44%" stopColor="#1E1708" />
        <stop offset="100%" stopColor="#0A0803" />
      </radialGradient>
      <linearGradient id="seal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={SEAL_COLORS.goldLight} />
        <stop offset="52%" stopColor={SEAL_COLORS.gold} />
        <stop offset="100%" stopColor={SEAL_COLORS.goldDeep} />
      </linearGradient>
    </defs>

    <circle cx="100" cy="100" r="96" fill="url(#seal-metal)" />
    <ellipse cx="72" cy="60" rx="54" ry="42" fill="#FFFBEB" opacity="0.06" />
    <circle cx="100" cy="100" r="96" fill="none" stroke="url(#seal-gold)" strokeWidth="2.2" />
    <circle
      cx="100"
      cy="100"
      r="89"
      fill="none"
      stroke={SEAL_COLORS.gold}
      strokeWidth="0.7"
      opacity="0.42"
    />
    <Girih stroke={SEAL_COLORS.gold} />
    <Monogram fill="url(#seal-gold)" />
  </svg>
);

/** What it leaves behind: the same geometry as ink, with no body. */
const SealInk: React.FC = () => (
  <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible" aria-hidden>
    <defs>
      <linearGradient id="seal-ink" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={SEAL_COLORS.goldLight} />
        <stop offset="52%" stopColor={SEAL_COLORS.gold} />
        <stop offset="100%" stopColor={SEAL_COLORS.goldDeep} />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="96" fill="none" stroke="url(#seal-ink)" strokeWidth="1.4" />
    <Girih stroke={SEAL_COLORS.gold} />
    <Monogram fill="url(#seal-ink)" size={62} />
  </svg>
);

/* ---------------------------------------------------------------- timeline */

/**
 * One flat cue table on an absolute clock, read top to bottom. Each entry is a
 * single element, so retiming the sequence never leaks into a neighbour.
 * `at` is milliseconds from the first frame.
 */
type Cue = {
  /** Which `data-seal` slot this drives. */
  slot: string;
  at: number;
  to: Record<string, number | string | number[] | string[]>;
  duration: number;
  ease?: Easing | Easing[];
  times?: number[];
};

const CUES: Cue[] = [
  // ——— contact: two pressure fronts leave the rim
  {
    slot: "halo",
    at: 320,
    to: { opacity: [0, 0.9, 0.62], scale: [0.34, 1.16, 1.22] },
    duration: 0.52,
    ease: SEAL_EASE.ring,
    times: [0, 0.34, 1],
  },
  {
    slot: "ring",
    at: 320,
    to: { opacity: [0, 1, 0], scale: [0.44, 3.6] },
    duration: 0.64,
    ease: SEAL_EASE.ring,
    times: [0, 0.07, 1],
  },
  {
    slot: "echo",
    at: 386,
    to: { opacity: [0, 0.4, 0], scale: [0.44, 2.7] },
    duration: 0.74,
    ease: SEAL_EASE.ring,
    times: [0, 0.07, 1],
  },
  {
    slot: "ink",
    at: 320,
    to: { opacity: [0, 1], scale: [1, 1.012] },
    duration: 0.12,
    ease: "linear",
  },
  // ——— the bite: the mark is engraved, the light breathes once
  {
    slot: "halo",
    at: 860,
    to: { opacity: [0.62, 0.78, 0.58], scale: [1.22, 1.26, 1.22] },
    duration: 0.78,
    ease: "easeInOut",
    times: [0, 0.5, 1],
  },
  // ——— the lift: the seal is pulled off, the mark opens the sheet
  {
    slot: "halo",
    at: 1180,
    to: { opacity: 0, scale: 1.5 },
    duration: 0.3,
    ease: "linear",
  },
  {
    slot: "sheet",
    at: 1200,
    to: { opacity: [1, 1, 0], scale: [1, 1.01, 1.14] },
    duration: 0.72,
    ease: SEAL_EASE.sheet,
    times: [0, 0.12, 1],
  },
  {
    slot: "ink",
    at: 1250,
    to: { scale: [1.012, 3, 12], opacity: [1, 1, 0] },
    duration: 0.66,
    ease: SEAL_EASE.ring,
    times: [0, 0.56, 1],
  },
];

/** The seal body owns every transform it has, in one track, so nothing fights. */
const BODY_TRACK = (fall: number) => ({
  y: [fall, 0, 0, -64],
  rotate: [6, 0, 0, -3.2],
  scale: [1.42, 1, 1.055, 1.07],
  opacity: [0, 1, 1, 0],
});

/* ------------------------------------------------------------- choreography */

const Stage: React.FC<{ scope: React.RefObject<HTMLDivElement>; fall: number }> = ({
  scope,
  fall,
}) => (
  <div ref={scope} className="absolute inset-0" data-seal="root">
    {/* the sheet: opaque from frame zero, so nothing ever flashes behind it */}
    <div
      data-seal="sheet"
      aria-hidden
      className="absolute inset-0"
      style={{ backgroundColor: SEAL_COLORS.paper }}
    />

    <div className="absolute inset-0 flex items-center justify-center">
      <div data-seal="stage" className="relative" style={{ width: SEAL_SIZE, height: SEAL_SIZE }}>
        <div
          data-seal="halo"
          aria-hidden
          className="absolute inset-0 rounded-full opacity-0"
          style={{
            background: `radial-gradient(closest-side, ${SEAL_COLORS.gold}70, ${SEAL_COLORS.gold}1f 52%, transparent 76%)`,
          }}
        />

        {/* the mark engraved under the face — and the page's opening at the end */}
        <div data-seal="ink" aria-hidden className="absolute inset-0 opacity-0">
          <SealInk />
        </div>

        <div
          data-seal="ring"
          aria-hidden
          className="absolute inset-0 rounded-full opacity-0"
          style={{
            border: `1px solid ${SEAL_COLORS.gold}`,
            boxShadow: `0 0 22px 1px ${SEAL_COLORS.gold}44, inset 0 0 22px 1px ${SEAL_COLORS.gold}22`,
          }}
        />
        <div
          data-seal="echo"
          aria-hidden
          className="absolute inset-0 rounded-full opacity-0"
          style={{ border: `1px solid ${SEAL_COLORS.ivory}` }}
        />

        <div
          data-seal="body"
          className="absolute inset-0 opacity-0"
          style={{ transform: `translate3d(0, ${fall}px, 0)` }}
        >
          <SealFace />
        </div>
      </div>
    </div>
  </div>
);

/* ---------------------------------------------------------------- component */

export const IntroSeal: React.FC = () => {
  const reduced = useReducedMotion() === true;
  const [active, setActive] = useState(shouldAutoPlay);
  const [ready, setReady] = useState(false);
  const [runId, setRunId] = useState(0);

  const [scope, animate] = useAnimate<HTMLDivElement>();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef<HTMLButtonElement | null>(null);
  const finished = useRef(false);

  const fall = typeof window === "undefined" ? -420 : -Math.round(window.innerHeight * 0.46);

  /* Replays arrive as an event; a repeat visit never mounts anything. */
  useEffect(() => {
    const open = () => {
      setReady(false);
      setRunId((n) => n + 1);
      setActive(true);
    };
    window.addEventListener(SEAL_EVENT.open, open);
    return () => window.removeEventListener(SEAL_EVENT.open, open);
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    rememberSeen();
    setActive(false);
    focusContent();
  }, []);

  /* The page must not scroll behind the sheet, from the very first frame. */
  useEffect(() => {
    if (!active) return;
    const unlock = lockScroll();
    return unlock;
  }, [active]);

  /**
   * Wait for the one family the seal itself prints, never for the whole page:
   * `document.fonts.ready` resolves only after every family has loaded, which
   * cost ~560ms before the first frame could move.
   */
  useEffect(() => {
    if (!active || ready) return;
    let cancelled = false;
    const start = () => {
      if (!cancelled) setReady(true);
    };
    const cap = window.setTimeout(start, SEAL_TIMING.assetCap);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const load = fonts?.load?.("64px Hasti");
    if (load) load.then(start).catch(start);
    else window.setTimeout(start, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(cap);
    };
  }, [active, ready]);

  /* The sequence: build the tracks, fire the handoff, tear everything down. */
  useEffect(() => {
    if (!active || !ready) return;

    const controls: AnimationPlaybackControls[] = [];
    const root = scope.current;
    finished.current = false;

    const play = (
      el: Element | null | undefined,
      to: Record<string, unknown>,
      opts: { duration: number; delay?: number; ease?: Easing | Easing[]; times?: number[] }
    ) => {
      if (!el) return;
      controls.push(animate(el, to as never, opts as never));
    };

    const reveal = () => window.dispatchEvent(new CustomEvent(SEAL_EVENT.reveal));

    if (reduced) {
      play(
        root?.querySelector('[data-seal="sheet"]'),
        { opacity: 0 },
        {
          duration: sec(SEAL_TIMING.reduced),
          ease: "linear",
        }
      );
    } else if (root) {
      const total = sec(SEAL_TIMING.lift) + 0.46;
      play(root.querySelector('[data-seal="body"]'), BODY_TRACK(fall), {
        duration: total,
        times: [0, sec(SEAL_TIMING.strike) / total, 0.78, 1],
        ease: [SEAL_EASE.fall, "linear", SEAL_EASE.lift],
      });
      for (const cue of CUES) {
        play(root.querySelector(`[data-seal="${cue.slot}"]`), cue.to, {
          duration: cue.duration,
          delay: sec(cue.at),
          ease: cue.ease,
          times: cue.times,
        });
      }

      // the skip control waits until the strike has been read
      play(
        skipRef.current,
        { opacity: [0, 1], y: [8, 0] },
        { duration: 0.4, delay: sec(SEAL_TIMING.skipDelay), ease: "easeOut" }
      );
    }

    const timers = reduced
      ? [
          window.setTimeout(finish, SEAL_TIMING.reduced + 40),
          window.setTimeout(finish, SEAL_TIMING.safety),
        ]
      : [
          window.setTimeout(reveal, SEAL_TIMING.reveal),
          window.setTimeout(finish, SEAL_TIMING.gone + 80),
          window.setTimeout(finish, SEAL_TIMING.safety),
        ];

    dialogRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
        return;
      }
      // one focusable node: keep Tab inside the dialog, never on the page behind
      if (e.key === "Tab") {
        e.preventDefault();
        skipRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKey);
      controls.forEach((c) => c.stop());
    };
  }, [active, ready, reduced, runId, animate, scope, finish, fall]);

  if (!active) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={SEAL_COPY.dialogLabel}
      data-testid="intro-seal"
      className="fixed inset-0 z-[130] overflow-hidden overscroll-none outline-none select-none"
      style={{ backgroundColor: ready ? undefined : SEAL_COLORS.paper }}
    >
      <p className="sr-only">{SEAL_COPY.description}</p>

      {ready && <Stage scope={scope} fall={fall} />}

      {ready && !reduced && (
        <button
          ref={skipRef}
          type="button"
          onClick={finish}
          data-seal="skip"
          data-testid="intro-skip"
          className="absolute inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-10 mx-auto w-max rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-[12px] font-medium text-zinc-300 opacity-0 backdrop-blur-md transition-colors hover:border-[color:var(--accent)]/60 hover:text-white focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/70 focus-visible:outline-none"
        >
          {SEAL_COPY.skip}
        </button>
      )}
    </div>
  );
};

export default IntroSeal;
