import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { soundEngine } from "../engines/soundEngine";
import { publicUrl } from "../lib/base";
import { useAppSettings } from "../lib/store";
import { cn } from "../ui/kit";
import { HERO_LINES, HERO_WORDS, INTRO_COPY, INTRO_PROGRESS_LABEL } from "../shell/introCopy";

/* ------------------------------------------------------------------ timing */

/**
 * The film is four movements, and only one of them waits for the visitor.
 *
 *  1. greeting  1,500ms  «سلام، چطوری؟» + the bespoke medallion face
 *  2. invite    up to 7,000ms  the living point asks to be pressed
 *  3. bloom     1,000ms  the point gives way: shockwave, embers, sub-bass
 *  4. sentence  3,600ms  the hero sentence lands word by word (RTL, stereo)
 *  5. portal    1,450ms  the curved curtain splits and hands over to the site
 *
 * Worst case — nobody touches it — is ~14.5s, and the skip control is on
 * screen for every frame of it.
 */
const GREETING_MS = 1500;
const INVITE_TIMEOUT_MS = 7000;
const BLOOM_MS = 1000;
const SENTENCE_MS = 3600;
const PORTAL_MS = 1450;

/** Per-word stagger of the sentence. Kept in ms so it can drive audio too. */
const WORD_STAGGER_MS = 130;
const WORD_LEAD_MS = 260;

type Phase = "greeting" | "invite" | "bloom" | "sentence" | "exit";

/* ------------------------------------------------------------- responsive */

function useIsMobilePortrait(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(max-width: 639px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return isMobile;
}

function haptic(ms = 14) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(ms);
    }
  } catch {
    // unsupported — silence is the correct fallback
  }
}

/* ------------------------------------------------------------ the medallion */

/**
 * The film's bespoke mark: a shamse-style sun medallion with a face drawn in
 * the same language as the type — gold rim, lapis heart, and a smile that is
 * really just a calligraphic curve. It blinks, so it reads as a character
 * rather than as another logo.
 */
const ShamsFace: React.FC<{ size?: number; blink?: boolean }> = ({ size = 96, blink = true }) => (
  <motion.div
    aria-hidden
    className="relative shrink-0"
    style={{ width: size, height: size }}
    initial={{ scale: 0.2, rotate: -35, opacity: 0 }}
    animate={{ scale: 1, rotate: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 190, damping: 14, mass: 0.8 }}
  >
    <svg viewBox="0 0 120 120" width={size} height={size} className="overflow-visible">
      <defs>
        <radialGradient id="shams-core" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="46%" stopColor="#F5B841" />
          <stop offset="100%" stopColor="#B4771A" />
        </radialGradient>
        <linearGradient id="shams-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="52%" stopColor="#F5B841" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <filter id="shams-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* rotating girih rays */}
      <motion.g
        style={{ transformOrigin: "60px 60px" }}
        animate={blink ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          const r1 = 46;
          const r2 = i % 2 === 0 ? 57 : 52;
          return (
            <line
              key={i}
              x1={60 + Math.cos(a) * r1}
              y1={60 + Math.sin(a) * r1}
              x2={60 + Math.cos(a) * r2}
              y2={60 + Math.sin(a) * r2}
              stroke="url(#shams-rim)"
              strokeWidth={i % 2 === 0 ? 2.2 : 1.3}
              strokeLinecap="round"
              opacity={i % 2 === 0 ? 0.95 : 0.55}
            />
          );
        })}
      </motion.g>

      <circle
        cx="60"
        cy="60"
        r="43"
        fill="url(#shams-core)"
        stroke="url(#shams-rim)"
        strokeWidth="1.6"
        filter="url(#shams-glow)"
      />
      <circle
        cx="60"
        cy="60"
        r="35"
        fill="none"
        stroke="#5B3B0B"
        strokeWidth="0.9"
        opacity="0.35"
      />

      {/* eyes — calligraphic dots, not circles */}
      <motion.g
        animate={blink ? { scaleY: [1, 1, 0.12, 1] } : { scaleY: 1 }}
        transition={{
          duration: 5.4,
          repeat: Infinity,
          times: [0, 0.9, 0.95, 1],
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "60px 54px" }}
      >
        <ellipse cx="48" cy="52" rx="4.4" ry="5.6" fill="#2A1A06" />
        <ellipse cx="72" cy="52" rx="4.4" ry="5.6" fill="#2A1A06" />
        <circle cx="49.6" cy="50" r="1.25" fill="#FFFBEB" opacity="0.9" />
        <circle cx="73.6" cy="50" r="1.25" fill="#FFFBEB" opacity="0.9" />
      </motion.g>

      {/* smile + dimples */}
      <path
        d="M46 66 Q60 79 74 66"
        fill="none"
        stroke="#2A1A06"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      <circle cx="41.5" cy="63" r="1.9" fill="#B4771A" opacity="0.55" />
      <circle cx="78.5" cy="63" r="1.9" fill="#B4771A" opacity="0.55" />
    </svg>
  </motion.div>
);

/* ---------------------------------------------------------------- 1. hello */

const GreetingStage: React.FC<{ reduced: boolean | null }> = ({ reduced }) => {
  const words = INTRO_COPY.greeting.words;
  return (
    <motion.div
      key="greeting"
      className="flex flex-col items-center gap-3 px-6 text-center sm:gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -26, filter: "blur(10px)" }}
      transition={{ duration: 0.45 }}
    >
      <ShamsFace size={92} blink={!reduced} />
      <div
        dir="rtl"
        className="flex flex-wrap items-center justify-center gap-x-3 text-[#F5F2EB]"
        style={{ fontFamily: "'IranNastaliq', 'GulzarNastaliq', serif", lineHeight: 2 }}
      >
        {words.map((w, i) => (
          <motion.span
            key={w}
            className="inline-block text-[clamp(34px,10vw,54px)] sm:text-[68px]"
            initial={reduced ? false : { opacity: 0, y: 34, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 17,
              delay: reduced ? 0 : 0.22 + i * 0.16,
            }}
          >
            {w}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

/* ------------------------------------------------------------- 2. the point */

/**
 * The "press here" cue: a bespoke hand that reaches in, dips onto the point and
 * leaves a ripple — drawn rather than iconified so it matches the greeting
 * medallion. `aria-hidden`, because the copy already says what to do.
 */
const TapCue: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    aria-hidden
    className={cn("pointer-events-none absolute z-20", className)}
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.9 }}
  >
    <motion.svg
      viewBox="0 0 100 100"
      className="h-full w-full overflow-visible"
      style={{ filter: "drop-shadow(0 12px 22px rgba(0, 0, 0, 0.55))" }}
      animate={{ y: [8, -4, 8], rotate: [22, 18, 22] }}
      transition={{ duration: 2.4, times: [0, 0.42, 1], repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="intro-tap-gold" x1="12%" y1="100%" x2="88%" y2="0%">
          <stop offset="0%" stopColor="#EBB24B" />
          <stop offset="62%" stopColor="#F7D488" />
          <stop offset="100%" stopColor="#FFFBEB" />
        </linearGradient>
      </defs>
      {/* palm */}
      <rect x="26" y="40" width="50" height="52" rx="18" fill="url(#intro-tap-gold)" />
      {/* folded fingers, read as two creases rather than separate blocks */}
      <path
        d="M40 58h26M40 72h26"
        stroke="rgba(80, 44, 6, 0.32)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* index finger */}
      <rect x="46" y="6" width="21" height="46" rx="10.5" fill="url(#intro-tap-gold)" />
      {/* fingertip contact + expanding ripple */}
      <circle cx="56.5" cy="8" r="4" fill="#FFFFFF" />
      <motion.circle
        cx="56.5"
        cy="7"
        r="7"
        fill="none"
        stroke="#FFFBEB"
        strokeWidth="2.2"
        animate={{ r: [5, 20], opacity: [0.9, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
    </motion.svg>
  </motion.div>
);

const PointGate: React.FC<{ onIgnite: () => void; reduced: boolean | null }> = ({
  onIgnite,
  reduced,
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-34, Math.min(34, (e.clientX - cx) * 0.1));
    const dy = Math.max(-34, Math.min(34, (e.clientY - cy) * 0.1));
    setOffset({ x: dx, y: dy });
  }, []);

  return (
    <motion.div
      key="invite"
      className="flex flex-col items-center gap-7 px-6 text-center sm:gap-9"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        dir="rtl"
        className="flex flex-wrap items-baseline justify-center gap-x-2.5 text-[#F5F2EB]"
        style={{ fontFamily: "'IranNastaliq', 'GulzarNastaliq', serif", lineHeight: 1.9 }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <span className="text-[clamp(24px,7vw,38px)] sm:text-[clamp(46px,3.7vw,64px)]">
          {INTRO_COPY.invite.lead}
        </span>
        <span className="text-[clamp(24px,7vw,38px)] text-[#F5B841] sm:text-[clamp(46px,3.7vw,64px)]">
          {INTRO_COPY.invite.focus}
        </span>
      </motion.div>

      <div className="relative">
        {!reduced && (
          <TapCue className="-bottom-5 -left-4 h-[74px] w-[74px] sm:-bottom-7 sm:-left-9 sm:h-[96px] sm:w-[96px]" />
        )}

        <motion.div
          onPointerMove={handlePointerMove}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onClick={() => {
            haptic(16);
            onIgnite();
          }}
          role="button"
          tabIndex={0}
          aria-label={INTRO_COPY.invite.gateLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              haptic(16);
              onIgnite();
            }
          }}
          className="group relative flex h-28 w-28 cursor-pointer touch-manipulation items-center justify-center rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-[#F5B841]/70 sm:h-32 sm:w-32"
          style={{
            transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0) scale(${pressed ? 0.9 : 1})`,
            transition: "transform 140ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* breathing rings */}
          {!reduced && (
            <>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute h-[68px] w-[68px] rounded-full border border-[#F5B841]/55 sm:h-[80px] sm:w-[80px]"
                animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                aria-hidden
                className="pointer-events-none absolute h-[52px] w-[52px] rounded-full border border-[#38BDF8]/60 sm:h-[62px] sm:w-[62px]"
                animate={{ scale: [1, 1.85, 1], opacity: [0.62, 0.12, 0.62] }}
                transition={{ duration: 2.6, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          <span
            aria-hidden
            className="pointer-events-none absolute h-28 w-28 rounded-full bg-[#F5B841]/15 blur-2xl transition-all duration-300 group-hover:scale-125 group-hover:bg-[#F5B841]/30 sm:h-36 sm:w-36"
          />

          <span
            className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFFBEB] transition-transform duration-300 group-hover:scale-110 group-active:scale-90 sm:h-8 sm:w-8"
            style={{
              boxShadow:
                "0 0 22px 6px rgba(245, 184, 65, 0.95), 0 0 52px 16px rgba(56, 189, 248, 0.45)",
            }}
          />
        </motion.div>
      </div>

      <motion.p
        className="max-w-[16rem] text-[11.5px] leading-relaxed text-zinc-400 sm:max-w-none sm:text-[13.5px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
      >
        {INTRO_COPY.invite.hint}
      </motion.p>
    </motion.div>
  );
};

/* ---------------------------------------------------------- 3. the bloom */

const Bloom: React.FC = () => {
  const embers = useMemo(
    () =>
      Array.from({ length: 46 }).map((_, i) => {
        const a = (i / 46) * Math.PI * 2 + (i % 4) * 0.11;
        const r = 150 + ((i * 53) % 330);
        return {
          x: Math.cos(a) * r,
          y: Math.sin(a) * r * 0.84,
          s: 2 + ((i * 7) % 7),
          delay: (i % 6) * 0.012,
          gold: i % 3 !== 0,
        };
      }),
    []
  );

  return (
    <motion.div
      key="bloom"
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ opacity: { duration: 0.35 } }}
    >
      {/* full-frame flash — the page blinks, it does not gently glow */}
      <motion.span
        className="absolute inset-0 bg-[#FFFBEB]"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: [0.9, 0.75, 0] }}
        transition={{ duration: 0.5, times: [0, 0.4, 1], ease: "linear" }}
      />

      {/* white-hot core: expands fast, but its opacity is held on a slower clock */}
      <motion.span
        className="absolute h-28 w-28 rounded-full"
        style={{
          background:
            "radial-gradient(circle, #FFFFFF 0%, #FFFBEB 24%, rgba(245,184,65,0.9) 52%, transparent 78%)",
        }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 6, opacity: [1, 0.95, 0] }}
        transition={{
          scale: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 1.05, times: [0, 0.42, 1], ease: "linear" },
        }}
      />

      {/* shockwave front — a soft annulus of light, never a drawn circle */}
      <motion.span
        className="absolute rounded-full"
        style={{
          width: 110,
          height: 110,
          background:
            "radial-gradient(closest-side, transparent 62%, rgba(245,184,65,0.95) 74%, rgba(255,251,235,0.55) 78%, transparent 88%)",
          filter: "blur(2px)",
        }}
        initial={{ scale: 0.22, opacity: 0.95 }}
        animate={{ scale: 13, opacity: [0.95, 0.6, 0] }}
        transition={{
          scale: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 1.05, times: [0, 0.34, 1], ease: "linear" },
        }}
      />

      {/* lapis afterglow, half a beat behind and softer still */}
      <motion.span
        className="absolute rounded-full"
        style={{
          width: 110,
          height: 110,
          background:
            "radial-gradient(closest-side, transparent 66%, rgba(56,189,248,0.75) 77%, transparent 90%)",
          filter: "blur(3px)",
        }}
        initial={{ scale: 0.22, opacity: 0.85 }}
        animate={{ scale: 9.5, opacity: [0.85, 0.45, 0] }}
        transition={{
          scale: { duration: 1.0, delay: 0.07, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 1.0, delay: 0.07, times: [0, 0.36, 1], ease: "linear" },
        }}
      />

      {/* one crisp white front, gone in half a second, so the burst has an edge */}
      <motion.span
        className="absolute rounded-full border-[1.5px] border-white/70"
        style={{ width: 110, height: 110, boxShadow: "0 0 26px 6px rgba(255,251,235,0.5)" }}
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 6.5, opacity: [0.9, 0.35, 0] }}
        transition={{
          scale: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.55, times: [0, 0.5, 1], ease: "linear" },
        }}
      />

      {/* a horizontal lash of light, like ink thrown across the page */}
      <motion.span
        className="absolute h-[3px] w-[52vw] max-w-[860px] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #F5B841 18%, #FFFFFF 50%, #38BDF8 82%, transparent)",
        }}
        initial={{ scaleX: 0.04, opacity: 1 }}
        animate={{ scaleX: 1.5, opacity: [1, 0.85, 0] }}
        transition={{
          scaleX: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.9, times: [0, 0.4, 1], ease: "linear" },
        }}
      />

      {embers.map((e, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: e.s,
            height: e.s,
            background: e.gold ? "#F5B841" : "#7DD3FC",
            boxShadow: e.gold
              ? "0 0 12px 3px rgba(245,184,65,0.85)"
              : "0 0 12px 3px rgba(56,189,248,0.75)",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: e.x, y: e.y, opacity: [1, 1, 0], scale: [1, 1, 0.15] }}
          transition={{
            x: { duration: 1.05, delay: e.delay, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 1.05, delay: e.delay, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 1.05, delay: e.delay, times: [0, 0.5, 1], ease: "linear" },
            opacity: { duration: 1.05, delay: e.delay, times: [0, 0.5, 1], ease: "linear" },
          }}
        />
      ))}
    </motion.div>
  );
};

/* -------------------------------------------------------- 4. the sentence */

const SentenceStage: React.FC<{
  reduced: boolean | null;
  isMobile: boolean;
  onCue: (index: number) => void;
}> = ({ reduced, isMobile, onCue }) => {
  // Words stay in normal flow, so the browser owns the final layout: every
  // breakpoint lands on the same two balanced lines. The animation only moves
  // each word *into* the slot the layout already reserved for it.
  const cueTimers = useRef<number[]>([]);

  useEffect(() => {
    if (reduced) return;
    let offset = 0;
    HERO_LINES.forEach((line) => {
      line.words.forEach(() => {
        const index = offset++;
        const id = window.setTimeout(() => onCue(index), WORD_LEAD_MS + index * WORD_STAGGER_MS);
        cueTimers.current.push(id);
      });
    });
    return () => {
      cueTimers.current.forEach((id) => window.clearTimeout(id));
      cueTimers.current = [];
    };
  }, [onCue, reduced]);

  let runningIndex = 0;

  return (
    <motion.div
      key="sentence"
      dir="rtl"
      className="relative flex w-full flex-col items-center px-3 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* gold pool of light the words settle into */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[62%] w-[86%] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(245,184,65,0.20), rgba(56,189,248,0.08) 58%, transparent 78%)",
          filter: "blur(18px)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.5 }}
      />

      {/* one slow ribbon of light crossing the finished line */}
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -z-10 w-[38%]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,251,235,0.16) 45%, rgba(245,184,65,0.22) 55%, transparent)",
            filter: "blur(14px)",
          }}
          initial={{ x: "160%", opacity: 0 }}
          animate={{ x: "-160%", opacity: [0, 1, 0] }}
          transition={{ duration: 2.1, delay: 1.15, ease: "easeInOut" }}
        />
      )}
      {HERO_LINES.map((line, lineIndex) => (
        <div
          key={lineIndex}
          className="flex w-full flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-6"
          style={{
            fontFamily: "'IranNastaliq', 'GulzarNastaliq', serif",
            lineHeight: isMobile ? 2.2 : 2.35,
          }}
        >
          {line.words.map((word) => {
            const index = runningIndex++;
            const dir = index % 2 === 0 ? 1 : -1;
            return (
              <motion.span
                key={`${lineIndex}-${word.text}-${index}`}
                className="inline-block whitespace-nowrap px-0.5 will-change-[transform,filter,opacity]"
                style={{
                  fontSize: isMobile ? "clamp(28px, 8.6vw, 40px)" : "clamp(44px, 5.2vw, 76px)",
                  color: word.gold ? undefined : "#F5F2EB",
                }}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        x: dir * (isMobile ? 46 : 126),
                        y: isMobile ? 64 : 118,
                        rotate: dir * (isMobile ? 9 : 11),
                        scale: 0.58,
                        filter: "blur(12px)",
                      }
                }
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
                transition={{
                  type: "spring",
                  stiffness: 118,
                  damping: 15,
                  mass: 0.85,
                  delay: reduced ? 0 : WORD_LEAD_MS / 1000 + index * (WORD_STAGGER_MS / 1000),
                }}
              >
                <span
                  className={cn(
                    "inline-block",
                    word.gold
                      ? "bg-gradient-to-l from-amber-200 via-[#F5B841] to-amber-100 bg-clip-text text-transparent"
                      : ""
                  )}
                  style={{
                    filter: "drop-shadow(0 10px 26px rgba(0, 0, 0, 0.8))",
                  }}
                >
                  {word.text}
                </span>
              </motion.span>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
};

/* ------------------------------------------------------------- the film */

export interface IntroFilmProps {
  onClose: (reason: "skip" | "finish") => void;
}

const IntroFilm: React.FC<IntroFilmProps> = ({ onClose }) => {
  const reduced = useReducedMotion();
  const isMobile = useIsMobilePortrait();
  const { update } = useAppSettings();

  const [phase, setPhase] = useState<Phase>(reduced ? "sentence" : "greeting");
  const [exitProgress, setExitProgress] = useState(0);
  const finishedRef = useRef(false);

  const firedCues = useRef<Set<string>>(new Set());
  const fireCue = useCallback((key: string, fn: () => void) => {
    if (firedCues.current.has(key)) return;
    firedCues.current.add(key);
    fn();
  }, []);

  /* -- 1. greeting hands over to the invitation ---------------------------- */
  useEffect(() => {
    if (phase !== "greeting") return;
    const id = window.setTimeout(() => setPhase("invite"), GREETING_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  /* -- 2. the invitation waits, but never forever ------------------------- */
  useEffect(() => {
    if (phase !== "invite") return;
    const id = window.setTimeout(() => setPhase("bloom"), INVITE_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  /* -- 3. the bloom resolves into the sentence ---------------------------- */
  useEffect(() => {
    if (phase !== "bloom") return;
    const id = window.setTimeout(() => setPhase("sentence"), BLOOM_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  /* -- 4. the sentence holds, then the curtain opens ---------------------- */
  useEffect(() => {
    if (phase !== "sentence") return;
    fireCue("sentence-bed", () => soundEngine.playIntroSentenceBed());
    const id = window.setTimeout(() => setPhase("exit"), SENTENCE_MS);
    return () => window.clearTimeout(id);
  }, [phase, fireCue]);

  /* -- audio: only after a real gesture, so nothing is blocked ------------- */
  const ignite = useCallback(async () => {
    if (phase !== "invite") return;
    soundEngine.enabled = true;
    update({ sound: true });
    try {
      await soundEngine.unlock();
    } catch {
      // the film still works silently
    }
    fireCue("ignition", () => soundEngine.playIntroIgnition());
    setPhase("bloom");
  }, [phase, update, fireCue]);

  const wordCue = useCallback((index: number) => {
    soundEngine.playIntroWordTick(index, HERO_WORDS.length);
  }, []);

  /* -- 5. portal: the curved curtain splits and hands over ---------------- */
  useEffect(() => {
    if (phase !== "exit") return;
    let raf = 0;
    const start = performance.now();
    const appRoot = document.getElementById("root");

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / PORTAL_MS);
      setExitProgress(p);

      if (appRoot) {
        const settleP = Math.min(1, Math.max(0, (p - 0.12) / 0.88));
        const ease = 1 - Math.pow(1 - settleP, 3.4);
        if (p < 0.99) {
          appRoot.style.transform = `scale(${(0.96 + 0.04 * ease).toFixed(4)})`;
          appRoot.style.transformOrigin = "50% 45%";
        } else {
          appRoot.style.transform = "";
          appRoot.style.transformOrigin = "";
        }
      }

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        if (appRoot) {
          appRoot.style.transform = "";
          appRoot.style.transformOrigin = "";
        }
        if (!finishedRef.current) {
          finishedRef.current = true;
          onClose("finish");
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (appRoot) {
        appRoot.style.transform = "";
        appRoot.style.transformOrigin = "";
      }
    };
  }, [phase, onClose]);

  /* -- escape hatch -------------------------------------------------------- */
  const skip = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onClose("skip");
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  /* -- curtain geometry ---------------------------------------------------- */
  const seamIgnite = Math.min(1, Math.max(0, exitProgress / 0.22));
  const splitRaw = Math.min(1, Math.max(0, (exitProgress - 0.14) / 0.86));
  const centerOpen =
    splitRaw <= 0
      ? 0
      : splitRaw < 0.5
        ? 4 * Math.pow(splitRaw, 3)
        : 1 - Math.pow(-2 * splitRaw + 2, 3) / 2;
  const edgeOpen = Math.pow(centerOpen, 1.65);

  const upperEdgeY = 500 - edgeOpen * 540;
  const upperControlY = 500 - centerOpen * 760;
  const lowerEdgeY = 500 + edgeOpen * 540;
  const lowerControlY = 500 + centerOpen * 760;

  const wing = (edgeY: number, controlY: number, top: boolean) =>
    top
      ? `M 0,0 L 1000,0 L 1000,${edgeY.toFixed(1)} Q 500,${controlY.toFixed(1)} 0,${edgeY.toFixed(1)} Z`
      : `M 0,1000 L 1000,1000 L 1000,${edgeY.toFixed(1)} Q 500,${controlY.toFixed(1)} 0,${edgeY.toFixed(1)} Z`;

  const lipCurve = (edgeY: number, controlY: number) =>
    `M 0,${edgeY.toFixed(1)} Q 500,${controlY.toFixed(1)} 1000,${edgeY.toFixed(1)}`;

  const lipGlowOpacity =
    exitProgress <= 0.01
      ? 0
      : exitProgress < 0.2
        ? exitProgress / 0.2
        : Math.max(0, 1 - (exitProgress - 0.25) / 0.72);

  const seamHalfSpan = 500 * (1 - Math.pow(1 - seamIgnite, 3));
  const bgUrl = publicUrl("/backgrounds/nebula-lapis-gold.jpg");

  const stageLabel =
    phase === "greeting"
      ? INTRO_PROGRESS_LABEL.greeting
      : phase === "bloom"
        ? INTRO_PROGRESS_LABEL.bloom
        : phase === "sentence" || phase === "exit"
          ? INTRO_PROGRESS_LABEL.sentence
          : INTRO_PROGRESS_LABEL.invite;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={INTRO_COPY.dialogLabel}
      className={cn(
        "fixed inset-0 z-[120] h-[100dvh] w-screen overflow-hidden overscroll-none touch-none text-[#F5F2EB]",
        phase === "exit" ? "pointer-events-none" : ""
      )}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* the curtain the site will be revealed through */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id="intro-nebula" patternUnits="userSpaceOnUse" width="1000" height="1000">
            <rect width="1000" height="1000" fill="#05060A" />
            <image
              href={bgUrl}
              x="0"
              y="0"
              width="1000"
              height="1000"
              preserveAspectRatio="xMidYMid slice"
              opacity="0.34"
            />
            <rect width="1000" height="1000" fill="rgba(5, 6, 10, 0.55)" />
          </pattern>

          <linearGradient id="intro-lip" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245, 184, 65, 0.1)" />
            <stop offset="22%" stopColor="#F5B841" />
            <stop offset="50%" stopColor="#FFFBEB" />
            <stop offset="78%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.1)" />
          </linearGradient>

          {!isMobile && (
            <filter id="intro-lip-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        <path d={wing(upperEdgeY, upperControlY, true)} fill="url(#intro-nebula)" />
        <path d={wing(lowerEdgeY, lowerControlY, false)} fill="url(#intro-nebula)" />

        {exitProgress > 0.005 && exitProgress < 0.35 && (
          <line
            x1={(500 - seamHalfSpan).toFixed(1)}
            y1="500"
            x2={(500 + seamHalfSpan).toFixed(1)}
            y2="500"
            stroke="url(#intro-lip)"
            strokeWidth={(2.8 + Math.sin(seamIgnite * Math.PI) * 5.5).toFixed(1)}
            strokeLinecap="round"
            filter={isMobile ? undefined : "url(#intro-lip-glow)"}
            style={{ opacity: Math.max(0, 1 - splitRaw * 2.2) }}
          />
        )}

        {lipGlowOpacity > 0.01 && (
          <g
            style={{ opacity: lipGlowOpacity }}
            filter={isMobile ? undefined : "url(#intro-lip-glow)"}
          >
            <path
              d={lipCurve(upperEdgeY, upperControlY)}
              fill="none"
              stroke="url(#intro-lip)"
              strokeWidth={isMobile ? "6" : "4.5"}
            />
            <path
              d={lipCurve(lowerEdgeY, lowerControlY)}
              fill="none"
              stroke="url(#intro-lip)"
              strokeWidth={isMobile ? "6" : "4.5"}
            />
          </g>
        )}
      </svg>

      {/* ambient halo behind whatever is on stage */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: 0.45 }}
        style={{
          background:
            "radial-gradient(46% 40% at 50% 48%, rgba(245, 184, 65, 0.13), rgba(29, 78, 216, 0.07) 55%, transparent 84%)",
        }}
      />

      {/* SKIP — present for every frame until the curtain starts opening */}
      <button
        type="button"
        onClick={skip}
        aria-label={INTRO_COPY.skipLabel}
        data-testid="intro-skip"
        className={cn(
          "absolute end-3 top-3 z-30 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 text-[11.5px] font-medium text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-[#F5B841]/50 hover:text-white focus-visible:ring-2 focus-visible:ring-[#F5B841]/60 focus-visible:outline-none sm:end-5 sm:top-5 sm:text-[12.5px]",
          phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        {INTRO_COPY.skip}
      </button>

      {/* STAGE */}
      <motion.div
        className="relative z-10 flex h-full w-full items-center justify-center"
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: 0.45 }}
      >
        <AnimatePresence>
          {phase === "greeting" && <GreetingStage key="greeting" reduced={reduced} />}
          {phase === "invite" && (
            <PointGate key="invite" reduced={reduced} onIgnite={() => void ignite()} />
          )}
          {phase === "bloom" && <Bloom key="bloom" />}
          {(phase === "sentence" || phase === "exit") && (
            <SentenceStage key="sentence" reduced={reduced} isMobile={isMobile} onCue={wordCue} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* screen-reader only running commentary */}
      <p className="sr-only" aria-live="polite">
        {stageLabel}
      </p>
    </motion.div>
  );
};

/* -------------------------------------------------------------------- host */

export const IntroHost: React.FC = () => {
  const isAutomatedSmoke =
    typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent || "");

  const [open, setOpen] = useState<boolean>(() => !isAutomatedSmoke);

  useEffect(() => {
    const openFilm = () => {
      void soundEngine.unlock();
      setOpen(true);
    };
    window.addEventListener("rtmlab:open-intro", openFilm);
    window.addEventListener("rtl-lab:replay-intro", openFilm);
    return () => {
      window.removeEventListener("rtmlab:open-intro", openFilm);
      window.removeEventListener("rtl-lab:replay-intro", openFilm);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <AnimatePresence>{open && <IntroFilm key="intro-film" onClose={close} />}</AnimatePresence>

      {!open && !isAutomatedSmoke && (
        <div className="fixed start-3 bottom-[74px] z-[70] sm:start-4 sm:bottom-5">
          <button
            type="button"
            onClick={async () => {
              soundEngine.enabled = true;
              await soundEngine.unlock();
              setOpen(true);
            }}
            aria-label={INTRO_COPY.replayLabel}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#0A0C12]/90 px-2.5 py-1.5 text-[10.5px] font-medium text-[#F5F2EB] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all hover:border-[#F5B841]/50 hover:text-white active:scale-[0.97] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[11.5px]"
          >
            <Volume2 className="h-3 w-3 text-[#F5B841] sm:h-3.5 sm:w-3.5" />
            <span>{INTRO_COPY.replay}</span>
          </button>
        </div>
      )}
    </>
  );
};

export default IntroHost;
