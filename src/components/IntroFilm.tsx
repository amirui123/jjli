import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { soundEngine } from "../engines/soundEngine";
import { publicUrl } from "../lib/base";
import { useAppSettings } from "../lib/store";
import { cn } from "../ui/kit";

/* ---------------------------------------------------------------- constants */

/**
 * Pure 6-Act Cinema Choreography Timeline (TOTAL_MS = 8900ms):
 * - [0.00 .. 0.10]: Act 1A (Sweep R->L)   — Golden beam shoots from Right (950) to Left (50)
 * - [0.10 .. 0.19]: Act 1B (Rebound L->R) — Beam rebounds Left (50) to Right (950) in a counter-wave
 * - [0.19 .. 0.31]: Act 2  (Astrolabe)    — 12-Fold Sacred Persian Girih / Astrolabe blooms & spins at center while beam loops 360° into the solid Center Bar (x=220..780, y=210)
 * - [0.31 .. 0.39]: Act 3A (Fracture)     — 6 vertical laser cuts slice the bar into 7 pieces in place with visible recoil
 * - [0.39 .. 0.46]: Act 3B (Flight)       — All 7 pieces fly along curved arcs to their exact DOM-measured word coordinates
 * - [0.46 .. 0.80]: Act 4  (Words)        — Word-by-word (Right-to-Left) transformation into IranNastaliq: «در امتدادِ نور، هر خط جان می‌گیرد»
 * - [0.80 .. 1.00]: Act 5  (Prism Finale) — After the words appear, a Cosmic Prism Shockwave + Twin Orbiting Light Ribbons sweep across the calligraphy before the Curved Horizon Portal splits open!
 */
const TOTAL_MS = 8900;
const PORTAL_EXIT_MS = 1550;

/** The 6 X-coordinates along the solid center bar (x = 780..220) where the 6 fracture cuts happen */
const CUT_POINTS_X = [700, 620, 540, 460, 380, 300];

interface WordSpec {
  id: number;
  text: string;
  gold: boolean;
  barCenterX: number;
  recoilY: number;
  recoilAngle: number;
  fallbackX: number;
  fallbackYMobile: number;
  fallbackXMobile: number;
  fallbackW: number;
}

const WORDS: WordSpec[] = [
  {
    id: 0,
    text: "در",
    gold: false,
    barCenterX: 740,
    recoilY: -18,
    recoilAngle: -11,
    fallbackX: 855,
    fallbackXMobile: 730,
    fallbackYMobile: 145,
    fallbackW: 68,
  },
  {
    id: 1,
    text: "امتدادِ",
    gold: false,
    barCenterX: 660,
    recoilY: 16,
    recoilAngle: 9,
    fallbackX: 735,
    fallbackXMobile: 515,
    fallbackYMobile: 145,
    fallbackW: 118,
  },
  {
    id: 2,
    text: "نور،",
    gold: true,
    barCenterX: 580,
    recoilY: -20,
    recoilAngle: -13,
    fallbackX: 595,
    fallbackXMobile: 295,
    fallbackYMobile: 145,
    fallbackW: 92,
  },
  {
    id: 3,
    text: "هر",
    gold: false,
    barCenterX: 500,
    recoilY: 18,
    recoilAngle: 12,
    fallbackX: 490,
    fallbackXMobile: 790,
    fallbackYMobile: 278,
    fallbackW: 66,
  },
  {
    id: 4,
    text: "خط",
    gold: true,
    barCenterX: 420,
    recoilY: -16,
    recoilAngle: -10,
    fallbackX: 390,
    fallbackXMobile: 625,
    fallbackYMobile: 278,
    fallbackW: 86,
  },
  {
    id: 5,
    text: "جان",
    gold: true,
    barCenterX: 340,
    recoilY: 20,
    recoilAngle: 11,
    fallbackX: 275,
    fallbackXMobile: 445,
    fallbackYMobile: 278,
    fallbackW: 92,
  },
  {
    id: 6,
    text: "می‌گیرد",
    gold: false,
    barCenterX: 260,
    recoilY: -17,
    recoilAngle: -9,
    fallbackX: 130,
    fallbackXMobile: 225,
    fallbackYMobile: 278,
    fallbackW: 138,
  },
];

/* ------------ Responsive Mobile Portrait Detection Hook ------------ */

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

/* ------------ Acts 1A, 1B & 2 Trajectory: R->L Sweep -> L->R Rebound -> 360° Astrolabe Loop -> Center Bar */

interface TrajectorySample {
  x: number;
  y: number;
}

function buildMultiActTrajectorySamples(isMobile: boolean): TrajectorySample[] {
  const pts: TrajectorySample[] = [];
  // Boost vertical wave amplitude on portrait mobile screens so the sweep fills the vertical space
  const ampScale = isMobile ? 1.65 : 1.0;

  // Part 0 (25 pts): Ignited center point (500, 210) launches to Right edge (950, 210)
  for (let i = 0; i <= 25; i++) {
    const u = i / 25;
    pts.push({
      x: 500 + 450 * (u * u),
      y: 210 - Math.sin(u * Math.PI) * 16 * ampScale,
    });
  }

  // Part A (85 pts): Act 1A — High-speed Pass 1 from Right (950, 210) to Left (50, 210)
  for (let i = 1; i <= 85; i++) {
    const u = i / 85;
    const eased = 1 - Math.pow(1 - u, 2.0);
    pts.push({
      x: 950 - 900 * eased,
      y: 210 - Math.sin(u * Math.PI * 2) * 30 * ampScale,
    });
  }

  // Part B (85 pts): Act 1B — Counter-Sweep Rebound from Left (50, 210) back to Right (920, 210)
  for (let i = 1; i <= 85; i++) {
    const u = i / 85;
    const eased = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    pts.push({
      x: 50 + 870 * eased,
      y: 210 + Math.sin(u * Math.PI * 2) * 36 * ampScale,
    });
  }

  // Part C (115 pts): Act 2 — Full 360° Astrolabe Spiral from Right (920, 210) around the stage into (220, 210)
  for (let i = 1; i <= 115; i++) {
    const v = i / 115;
    const theta = v * Math.PI * 3; // 1.5 revolutions ending at cos(3*PI) = -1 (left side x=220)
    const rx = 420 - 140 * v;
    const ry = (isMobile ? 195 : 152) * Math.sin(v * Math.PI * 0.9 + 0.12);
    pts.push({
      x: 500 + Math.cos(theta) * rx,
      y: 210 - Math.sin(theta) * ry,
    });
  }

  // Part D (100 pts): Locks into the exact horizontal center bar from x=220 to x=780 at y=210 (indices 310..410)
  for (let i = 1; i <= 100; i++) {
    const w = i / 100;
    pts.push({
      x: 220 + 560 * w,
      y: 210,
    });
  }

  return pts;
}

function samplesToSvgPath(samples: TrajectorySample[], startIdx: number, endIdx: number): string {
  const s = Math.max(0, Math.min(samples.length - 1, startIdx));
  const e = Math.max(s, Math.min(samples.length - 1, endIdx));
  if (e <= s) return "";
  const cmds: string[] = [];
  for (let i = s; i <= e; i++) {
    const pt = samples[i];
    if (!pt) continue;
    cmds.push(`${i === s ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
  }
  return cmds.join(" ");
}

/** Builds a 12-pointed Sacred Persian Girih / Astrolabe star polygon path */
function buildGirihStarPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points = 12
): string {
  const totalVerts = points * 2;
  const cmds: string[] = [];
  for (let i = 0; i < totalVerts; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    cmds.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  cmds.push("Z");
  return cmds.join(" ");
}

/* ------------------------------------------- Act 0: The Living Point Gate */

interface IgnitionPointGateProps {
  onIgnite: () => void;
}

const IgnitionPointGate: React.FC<IgnitionPointGateProps> = ({ onIgnite }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-28, Math.min(28, (e.clientX - cx) * 0.08));
    const dy = Math.max(-28, Math.min(28, (e.clientY - cy) * 0.08));
    setOffset({ x: dx, y: dy });
  }, []);

  const triggerIgnite = useCallback(() => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(16);
      }
    } catch {
      // ignore on unsupported browsers
    }
    onIgnite();
  }, [onIgnite]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onClick={triggerIgnite}
      role="button"
      tabIndex={0}
      aria-label="شروع انیمیشن ورود با صدا"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerIgnite();
        }
      }}
      className="group relative flex h-full w-full cursor-pointer touch-manipulation flex-col items-center justify-center select-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 38% at 50% 50%, rgba(245, 184, 65, 0.16), rgba(29, 78, 216, 0.07) 54%, transparent 84%)",
        }}
      />

      {/* Ergonomic 96x96px touch target around the living center point */}
      <div
        className="relative flex h-24 w-24 items-center justify-center transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0) scale(${pressed ? 0.92 : 1})`,
        }}
      >
        <motion.span
          aria-hidden
          animate={{ scale: [1, 2.55, 1], opacity: [0.48, 0, 0.48] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute h-16 w-16 rounded-full border border-[#F5B841]/50 sm:h-16 sm:w-16"
        />

        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.8, 1], opacity: [0.64, 0.14, 0.64] }}
          transition={{ duration: 2.4, delay: 0.42, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute h-11 w-11 rounded-full border border-[#38BDF8]/60"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute h-24 w-24 rounded-full bg-[#F5B841]/18 blur-xl transition-transform duration-300 group-hover:scale-150 group-hover:bg-[#F5B841]/30"
        />

        <span
          className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFFBEB] transition-transform duration-300 group-hover:scale-125 group-active:scale-90 sm:h-5 sm:w-5"
          style={{
            boxShadow:
              "0 0 20px 5px rgba(245, 184, 65, 0.95), 0 0 46px 15px rgba(56, 189, 248, 0.45)",
          }}
        />
      </div>
    </div>
  );
};

/* ----------------------------------------------------- Stage Visual Component */

interface MeasuredSlot {
  cx: number;
  cy: number;
  width: number;
}

interface LineToWordsStageProps {
  progress: number; // 0..1
  exitProgress: number; // 0..1
  isMobile: boolean;
}

const LineToWordsStage: React.FC<LineToWordsStageProps> = ({
  progress,
  exitProgress,
  isMobile,
}) => {
  const samples = useMemo(() => buildMultiActTrajectorySamples(isMobile), [isMobile]);
  const totalPts = samples.length - 1; // 410; indices 310..410 are the horizontal bar (x=220..780, y=210)!
  const girihOuterPath = useMemo(() => buildGirihStarPath(0, 0, 128, 92, 12), []);
  const girihInnerPath = useMemo(() => buildGirihStarPath(0, 0, 76, 52, 12), []);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [measuredSlots, setMeasuredSlots] = useState<MeasuredSlot[] | null>(null);

  /**
   * Exact `xMidYMid meet` coordinate projection from DOM viewport pixels into
   * the SVG `viewBox="0 0 1000 420"` space on both mobile portrait (2 rows) and desktop (1 row).
   */
  const measureWordSlots = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    if (svgRect.width < 10 || svgRect.height < 10) return;

    // With preserveAspectRatio="xMidYMid meet", SVG scales uniformly by the larger ratio around (500, 210)
    const uniformScale = Math.max(1000 / svgRect.width, 420 / svgRect.height);
    const svgCenterX = svgRect.left + svgRect.width * 0.5;
    const svgCenterY = svgRect.top + svgRect.height * 0.5;

    const nextSlots: MeasuredSlot[] = WORDS.map((w, idx) => {
      const el = wordRefs.current[idx];
      if (!el) {
        return {
          cx: isMobile ? w.fallbackXMobile : w.fallbackX,
          cy: isMobile ? w.fallbackYMobile : 210,
          width: w.fallbackW,
        };
      }
      const r = el.getBoundingClientRect();
      if (r.width < 2) {
        return {
          cx: isMobile ? w.fallbackXMobile : w.fallbackX,
          cy: isMobile ? w.fallbackYMobile : 210,
          width: w.fallbackW,
        };
      }
      const cx = 500 + (r.left + r.width * 0.5 - svgCenterX) * uniformScale;
      const cy = 210 + (r.top + r.height * 0.52 - svgCenterY) * uniformScale;
      const width = Math.max(48, Math.min(185, r.width * uniformScale * 0.86));
      return { cx, cy, width };
    });

    setMeasuredSlots(nextSlots);
  }, [isMobile]);

  useLayoutEffect(() => {
    measureWordSlots();
    const t1 = window.setTimeout(measureWordSlots, 90);
    const t2 = window.setTimeout(measureWordSlots, 280);
    if (typeof document !== "undefined" && "fonts" in document) {
      void document.fonts.ready.then(() => measureWordSlots());
    }
    window.addEventListener("resize", measureWordSlots);
    window.addEventListener("orientationchange", measureWordSlots);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measureWordSlots);
      window.removeEventListener("orientationchange", measureWordSlots);
    };
  }, [measureWordSlots]);

  // Scale stroke widths up on mobile so lines stay bold & luminous even when the 1000-unit viewBox scales down
  const strokeBoost = isMobile ? 1.45 : 1.0;
  const svgFilter = isMobile ? undefined : "url(#beam-glow)";

  /**
   * ACTS 1A, 1B & 2 (progress 0.00 -> 0.31):
   */
  const linePhase = Math.min(1, Math.max(0, progress / 0.31));
  const headIdx = Math.round(Math.min(1, linePhase * 1.03) * totalPts);
  const tailIdx = Math.round(Math.pow(linePhase, 1.62) * 310);

  const ribbonPath = useMemo(() => {
    if (progress >= 0.31) return "";
    return samplesToSvgPath(samples, tailIdx, headIdx);
  }, [headIdx, progress, samples, tailIdx]);

  const echoPath = useMemo(() => {
    if (progress < 0.08 || progress >= 0.29) return "";
    const echoStart = Math.max(0, tailIdx - 28);
    const echoEnd = Math.max(echoStart, headIdx - 14);
    return samplesToSvgPath(samples, echoStart, echoEnd);
  }, [headIdx, progress, samples, tailIdx]);

  const headPoint = samples[Math.min(totalPts, headIdx)] ?? { x: 780, y: 210 };

  /**
   * ACT 2: SACRED PERSIAN ASTROLABE / GIRIH MANDALA RING (progress 0.17 -> 0.34)
   */
  const astrolabeRaw = Math.min(1, Math.max(0, (progress - 0.17) / 0.16));
  const astrolabeOpacity =
    astrolabeRaw <= 0 || astrolabeRaw >= 1 ? 0 : Math.sin(astrolabeRaw * Math.PI);
  const astrolabeScale =
    (0.38 + Math.sin(astrolabeRaw * Math.PI * 0.85) * 0.88) * (isMobile ? 1.38 : 1.0);
  const astrolabeRot = astrolabeRaw * 120;

  /**
   * ACT 3A (progress 0.31 -> 0.39): VISIBLE FRACTURE IN PLACE!
   */
  const fractureRaw = Math.min(1, Math.max(0, (progress - 0.31) / 0.08));
  const fractureEased = 1 - Math.pow(1 - fractureRaw, 3.2);

  /**
   * ACT 3B (progress 0.39 -> 0.46): EACH PIECE TRAVELS TO ITS OWN WORD SLOT!
   */
  const travelRaw = Math.min(1, Math.max(0, (progress - 0.39) / 0.07));
  const travelEased =
    travelRaw <= 0
      ? 0
      : travelRaw < 0.5
        ? 4 * Math.pow(travelRaw, 3)
        : 1 - Math.pow(-2 * travelRaw + 2, 3) / 2;

  /**
   * ACT 5 (progress 0.80 -> 1.00): POST-WORD COSMIC PRISM WAVE & CALLIGRAPHIC CROWN!
   */
  const prismRaw = Math.min(1, Math.max(0, (progress - 0.8) / 0.19));
  const prismBell = prismRaw <= 0 ? 0 : Math.sin(prismRaw * Math.PI);
  const crownSweepX = 880 - prismRaw * 760;

  const splitEase =
    exitProgress <= 0.14 ? 0 : Math.pow(Math.min(1, (exitProgress - 0.14) / 0.72), 2.1);

  return (
    <div className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center px-2.5 sm:px-4 select-none">
      {/* UNIFIED STAGE CONTAINER */}
      <div className="relative flex h-[300px] w-full max-w-[1080px] items-center justify-center sm:h-[380px]">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 420"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="beam-gold" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(245, 184, 65, 0.22)" />
              <stop offset="48%" stopColor="#F5B841" />
              <stop offset="100%" stopColor="#FFFBEB" />
            </linearGradient>

            <linearGradient id="beam-turquoise" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(20, 184, 166, 0.15)" />
              <stop offset="55%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#F5B841" />
            </linearGradient>

            <radialGradient id="prism-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(245, 184, 65, 0.48)" />
              <stop offset="45%" stopColor="rgba(56, 189, 248, 0.24)" />
              <stop offset="100%" stopColor="rgba(5, 6, 10, 0)" />
            </radialGradient>

            {!isMobile && (
              <filter id="beam-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            )}
          </defs>

          {/* ACT 2: Sacred 12-Fold Persian Girih / Astrolabe Supernova Ring in the Center */}
          {astrolabeOpacity > 0.01 && (
            <g
              transform={`translate(500, 210) scale(${astrolabeScale.toFixed(3)})`}
              style={{ opacity: astrolabeOpacity }}
              filter={svgFilter}
            >
              <g transform={`rotate(${astrolabeRot.toFixed(1)})`}>
                <path
                  d={girihOuterPath}
                  fill="none"
                  stroke="url(#beam-turquoise)"
                  strokeWidth={(1.9 * strokeBoost).toFixed(2)}
                  strokeDasharray="8 4"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="108"
                  fill="none"
                  stroke="rgba(245, 184, 65, 0.6)"
                  strokeWidth={(1.5 * strokeBoost).toFixed(2)}
                />
              </g>
              <g transform={`rotate(${(-astrolabeRot * 1.35).toFixed(1)})`}>
                <path
                  d={girihInnerPath}
                  fill="none"
                  stroke="#F5B841"
                  strokeWidth={(2.2 * strokeBoost).toFixed(2)}
                />
                <circle
                  cx="0"
                  cy="0"
                  r="38"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth={(1.6 * strokeBoost).toFixed(2)}
                  strokeDasharray="4 6"
                />
              </g>
            </g>
          )}

          {/* ACTS 1A, 1B & 2: Counter-Sweeping & Looping Line that locks as a horizontal bar (x=220..780, y=210) */}
          {echoPath && (
            <path
              d={echoPath}
              fill="none"
              stroke="url(#beam-turquoise)"
              strokeWidth={(2.6 * strokeBoost).toFixed(2)}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.7 }}
            />
          )}

          {ribbonPath && (
            <g filter={svgFilter}>
              <path
                d={ribbonPath}
                fill="none"
                stroke="rgba(245, 184, 65, 0.36)"
                strokeWidth={(10 * strokeBoost).toFixed(1)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={ribbonPath}
                fill="none"
                stroke={
                  progress >= 0.1 && progress < 0.2 ? "url(#beam-turquoise)" : "url(#beam-gold)"
                }
                strokeWidth={(4.0 * strokeBoost).toFixed(2)}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={headPoint.x} cy={headPoint.y} r={6.8 * strokeBoost} fill="#FFFBEB" />
              <circle
                cx={headPoint.x}
                cy={headPoint.y}
                r={17 * strokeBoost}
                fill={
                  progress >= 0.1 && progress < 0.2
                    ? "rgba(56, 189, 248, 0.45)"
                    : "rgba(245, 184, 65, 0.42)"
                }
              />
            </g>
          )}

          {/* ACT 3A: The 6 Laser Cut Sparks that visibly slice the bar into 7 pieces at progress = 0.31 */}
          {progress >= 0.31 && progress <= 0.39 && (
            <g filter={svgFilter}>
              {CUT_POINTS_X.map((cutX, cIdx) => {
                const sparkP = Math.min(1, Math.max(0, (progress - 0.31) / 0.075));
                const sparkOpacity = Math.sin(sparkP * Math.PI);
                const halfSlash = (14 + sparkP * 34) * strokeBoost;
                return (
                  <g
                    key={cIdx}
                    transform={`translate(${cutX}, 210)`}
                    style={{ opacity: sparkOpacity }}
                  >
                    <line
                      x1="0"
                      y1={-halfSlash}
                      x2="0"
                      y2={halfSlash}
                      stroke="#FFFBEB"
                      strokeWidth={3.0 * strokeBoost * (1 - sparkP * 0.55)}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r={6.5 * strokeBoost * (1 - sparkP * 0.45)}
                      fill="#38BDF8"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ACTS 3A, 3B & 4:
              - 0.31..0.39: The unbroken bar visibly cracks into 7 separated pieces!
              - 0.39..0.46: Each piece travels to the EXACT position of its word!
              - 0.46..0.80: One by one, each piece transforms into its IranNastaliq word! */}
          {progress >= 0.31 &&
            WORDS.map((w, idx) => {
              const slot = measuredSlots?.[idx] ?? {
                cx: isMobile ? w.fallbackXMobile : w.fallbackX,
                cy: isMobile ? w.fallbackYMobile : 210,
                width: w.fallbackW,
              };

              const wordStart = 0.46 + idx * 0.046;
              const solidifyP = Math.min(1, Math.max(0, (progress - wordStart) / 0.048));

              const shardOpacity = solidifyP >= 1 ? 0 : 1 - Math.pow(solidifyP, 1.5);

              if (shardOpacity <= 0.01) return null;

              const spreadFromCenter = (w.barCenterX - 500) * 1.18 + 500;
              const fracturedX = w.barCenterX + (spreadFromCenter - w.barCenterX) * fractureEased;
              const fracturedY = 210 + w.recoilY * strokeBoost * fractureEased;
              const fracturedAngle = w.recoilAngle * fractureEased;
              const fracturedWidth = 80 - 26 * fractureEased;

              const currX = fracturedX + (slot.cx - fracturedX) * travelEased;
              const flightArcY =
                Math.sin(travelEased * Math.PI) * (idx % 2 === 0 ? -32 : 32) * strokeBoost;
              const currY = fracturedY + (slot.cy - fracturedY) * travelEased + flightArcY;
              const currAngle = fracturedAngle * (1 - travelEased);
              const currWidth =
                (fracturedWidth + (slot.width - fracturedWidth) * travelEased) *
                (1 - solidifyP * 0.65);
              const halfLen = currWidth * 0.5;
              const strokeW = (3.8 + solidifyP * 3.5) * strokeBoost;

              return (
                <g
                  key={w.id}
                  transform={`translate(${currX.toFixed(1)}, ${currY.toFixed(1)}) rotate(${currAngle.toFixed(1)})`}
                  style={{ opacity: shardOpacity }}
                  filter={svgFilter}
                >
                  <line
                    x1={(-halfLen).toFixed(1)}
                    y1="0"
                    x2={halfLen.toFixed(1)}
                    y2="0"
                    stroke="rgba(245, 184, 65, 0.42)"
                    strokeWidth={strokeW + 5.5 * strokeBoost}
                    strokeLinecap="round"
                  />
                  <line
                    x1={(-halfLen).toFixed(1)}
                    y1="0"
                    x2={halfLen.toFixed(1)}
                    y2="0"
                    stroke={w.gold || solidifyP > 0.05 ? "#F5B841" : "#FFFBEB"}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

          {/* ACT 5: POST-WORD COSMIC PRISM WAVE, VOLUMETRIC RAYS & CALLIGRAPHIC CROWN RIBBON (progress 0.80 -> 1.00) */}
          {prismBell > 0.01 && (
            <g style={{ opacity: prismBell * (1 - splitEase) }} filter={svgFilter}>
              <ellipse
                cx="500"
                cy="210"
                rx={(180 + prismRaw * 340).toFixed(1)}
                ry={((isMobile ? 75 : 42) + prismRaw * (isMobile ? 140 : 95)).toFixed(1)}
                fill="url(#prism-halo)"
              />
              <ellipse
                cx="500"
                cy="210"
                rx={(160 + prismRaw * 360).toFixed(1)}
                ry={((isMobile ? 64 : 36) + prismRaw * (isMobile ? 120 : 82)).toFixed(1)}
                fill="none"
                stroke="url(#beam-turquoise)"
                strokeWidth={(2.5 * strokeBoost * (1 - prismRaw * 0.5)).toFixed(2)}
                strokeDasharray="18 10"
              />

              {/* Golden-Turquoise Calligraphic Crown Comet sweeping across the completed words */}
              <path
                d={`M 880,${isMobile ? 338 : 262} Q 500,${(
                  (isMobile ? 372 : 292) -
                  Math.sin(prismRaw * Math.PI) * 34
                ).toFixed(1)} 120,${isMobile ? 338 : 262}`}
                fill="none"
                stroke="url(#beam-gold)"
                strokeWidth={(3.0 * strokeBoost).toFixed(2)}
                strokeLinecap="round"
              />
              <circle
                cx={crownSweepX}
                cy={isMobile ? 348 : 272}
                r={6.0 * strokeBoost}
                fill="#FFFBEB"
              />
              <circle
                cx={crownSweepX}
                cy={isMobile ? 348 : 272}
                r={16 * strokeBoost}
                fill="rgba(245, 184, 65, 0.45)"
              />
            </g>
          )}
        </svg>

        {/* ACT 4 & 5: The Actual IranNastaliq Words
            On Mobile (<640px): Balanced 2-Hemistich Poetic Couplet («در امتدادِ نور،» / «هر خط جان می‌گیرد»)
            On Desktop (>=640px): Single Cinema-Scope Line */}
        <div
          dir="rtl"
          className="relative z-10 flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-0 px-2 text-center sm:gap-x-5 sm:gap-y-2 sm:px-4"
        >
          {WORDS.map((w, idx) => {
            const wordStart = 0.46 + idx * 0.046;
            const solidifyP = Math.min(1, Math.max(0, (progress - wordStart) / 0.052));
            const eased =
              solidifyP <= 0
                ? 0
                : solidifyP >= 1
                  ? 1
                  : 1 - Math.pow(1 - solidifyP, 3) + Math.sin(solidifyP * Math.PI) * 0.07;

            const wordWavePhase = Math.max(0, Math.min(1, (prismRaw - idx * 0.08) / 0.45));
            const prismLiftY = Math.sin(wordWavePhase * Math.PI) * (isMobile ? -7 : -10);
            const prismScaleBoost = 1 + Math.sin(wordWavePhase * Math.PI) * 0.06;

            const dirY = isMobile ? (idx <= 2 ? -1 : 1) : idx % 2 === 0 ? -1 : 1;
            const splitOffsetY = dirY * splitEase * (isMobile ? 68 : 95);
            const splitOffsetX = (3 - idx) * splitEase * (isMobile ? 16 : 28);
            const splitScale = (1 + splitEase * 0.32) * prismScaleBoost;
            const splitOpacity = Math.max(0, 1 - splitEase * 1.35);

            const blurPx =
              (1 - Math.min(1, solidifyP * 1.6)) * (isMobile ? 4 : 8) +
              splitEase * (isMobile ? 6 : 12);

            return (
              <React.Fragment key={w.id}>
                <span
                  ref={(el) => {
                    wordRefs.current[idx] = el;
                  }}
                  className="relative inline-flex items-center justify-center px-1 py-1 text-[clamp(36px,10.4vw,52px)] leading-[1.68] will-change-[transform,opacity] sm:px-1.5 sm:py-4 sm:text-[70px] sm:leading-[2.05] md:text-[80px]"
                  style={{
                    fontFamily: "'IranNastaliq', 'GulzarNastaliq', serif",
                    opacity: Math.min(1, solidifyP * 1.6) * splitOpacity,
                    transform: `translate3d(${splitOffsetX.toFixed(1)}px, ${(
                      (1 - Math.min(1, eased)) * (isMobile ? 12 : 16) +
                      prismLiftY +
                      splitOffsetY
                    ).toFixed(1)}px, 0) scale(${((0.55 + 0.45 * eased) * splitScale).toFixed(3)})`,
                    filter: blurPx > 0.25 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
                  }}
                >
                  {solidifyP > 0.01 && solidifyP < 0.9 && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full blur-lg sm:blur-xl"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(245,184,65,0.55), transparent 72%)",
                        opacity: Math.sin(solidifyP * Math.PI),
                      }}
                    />
                  )}

                  <span
                    className={cn(
                      "relative z-10 block transition-colors duration-300",
                      w.gold || prismBell > 0.25 || exitProgress > 0.04
                        ? "text-[#F5B841]"
                        : "text-[#F5F2EB]"
                    )}
                    style={{
                      textShadow:
                        prismBell > 0.2
                          ? "0 0 36px rgba(245, 184, 65, 0.72), 0 0 68px rgba(56, 189, 248, 0.38)"
                          : w.gold || exitProgress > 0.04
                            ? "0 0 32px rgba(245, 184, 65, 0.52)"
                            : "0 10px 28px rgba(0, 0, 0, 0.85)",
                    }}
                  >
                    {w.text}
                  </span>
                </span>
                {/* Balanced Poetic Couplet Break on Mobile Portrait right after «نور،» (idx === 2) */}
                {idx === 2 && <span aria-hidden className="h-0 basis-full sm:hidden" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------------------------- Main Entrance Film */

interface IntroFilmProps {
  onClose: (reason: "skip" | "finish") => void;
}

const IntroFilm: React.FC<IntroFilmProps> = ({ onClose }) => {
  const reduced = useReducedMotion();
  const { update } = useAppSettings();
  const isMobile = useIsMobilePortrait();

  const [ignited, setIgnited] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exitProgress, setExitProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  const firedCuesRef = useRef<Set<string>>(new Set());

  const startPortalExit = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    if (soundEngine.isUnlocked() && !firedCuesRef.current.has("portal")) {
      firedCuesRef.current.add("portal");
      soundEngine.playLineMorphCue("portal");
    }
  }, [exiting]);

  // Drive the 1,550ms Curved Center-Split Lens Aperture Choreography
  useEffect(() => {
    if (!exiting) return;
    let raf = 0;
    const start = performance.now();
    const appRoot = document.getElementById("root");

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / PORTAL_EXIT_MS);
      setExitProgress(p);

      if (appRoot) {
        const settleP = Math.min(1, Math.max(0, (p - 0.12) / 0.88));
        const settleEase = 1 - Math.pow(1 - settleP, 3.4);
        const scale = 0.96 + 0.04 * settleEase;
        if (p < 0.99) {
          appRoot.style.transform = `scale(${scale.toFixed(4)})`;
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
        onClose("finish");
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
  }, [exiting, onClose]);

  const handleIgnite = useCallback(async () => {
    if (ignited) return;
    soundEngine.enabled = true;
    update({ sound: true });
    await soundEngine.unlock();
    firedCuesRef.current.clear();
    firedCuesRef.current.add("sweep");
    soundEngine.playLineMorphCue("sweep");
    setIgnited(true);
  }, [ignited, update]);

  // Synchronized Studio Sound Cues across all 6 Acts
  useEffect(() => {
    if (!ignited) return;

    if (progress >= 0.1 && !firedCuesRef.current.has("rebound")) {
      firedCuesRef.current.add("rebound");
      soundEngine.playLineMorphCue("rebound");
    }
    if (progress >= 0.18 && !firedCuesRef.current.has("astrolabe")) {
      firedCuesRef.current.add("astrolabe");
      soundEngine.playLineMorphCue("astrolabe");
    }
    if (progress >= 0.24 && !firedCuesRef.current.has("spin")) {
      firedCuesRef.current.add("spin");
      soundEngine.playLineMorphCue("spin");
    }
    if (progress >= 0.31 && !firedCuesRef.current.has("shatter")) {
      firedCuesRef.current.add("shatter");
      soundEngine.playLineMorphCue("shatter");
    }

    WORDS.forEach((_, idx) => {
      const wordTrigger = 0.46 + idx * 0.046;
      const key = `word-${idx}`;
      if (progress >= wordTrigger && !firedCuesRef.current.has(key)) {
        firedCuesRef.current.add(key);
        soundEngine.playLineMorphCue("word", idx);
      }
    });

    if (progress >= 0.8 && !firedCuesRef.current.has("prism")) {
      firedCuesRef.current.add("prism");
      soundEngine.playLineMorphCue("prism");
    }
  }, [ignited, progress]);

  // Continuous 60/120fps rAF timeline
  useEffect(() => {
    if (!ignited || exiting) return;
    if (reduced) {
      setProgress(1);
      startPortalExit();
      return;
    }
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      setProgress((prev) => {
        const next = Math.min(1, prev + dt / TOTAL_MS);
        if (next >= 1) {
          startPortalExit();
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [exiting, ignited, reduced, startPortalExit]);

  // Curved Diamond-Lens Center Split Geometry
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

  const upperWingPath = `M 0,0 L 1000,0 L 1000,${upperEdgeY.toFixed(
    1
  )} Q 500,${upperControlY.toFixed(1)} 0,${upperEdgeY.toFixed(1)} Z`;

  const lowerWingPath = `M 0,1000 L 1000,1000 L 1000,${lowerEdgeY.toFixed(
    1
  )} Q 500,${lowerControlY.toFixed(1)} 0,${lowerEdgeY.toFixed(1)} Z`;

  const upperLipCurve = `M 0,${upperEdgeY.toFixed(1)} Q 500,${upperControlY.toFixed(
    1
  )} 1000,${upperEdgeY.toFixed(1)}`;
  const lowerLipCurve = `M 0,${lowerEdgeY.toFixed(1)} Q 500,${lowerControlY.toFixed(
    1
  )} 1000,${lowerEdgeY.toFixed(1)}`;

  const lipGlowOpacity =
    exitProgress <= 0.01
      ? 0
      : exitProgress < 0.2
        ? exitProgress / 0.2
        : Math.max(0, 1 - (exitProgress - 0.25) / 0.72);

  const seamHalfSpan = 500 * (1 - Math.pow(1 - seamIgnite, 3));
  const bgUrl = publicUrl("/backgrounds/nebula-lapis-gold.jpg");
  const portalFilter = isMobile ? undefined : "url(#portal-lip-glow)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تیتراژ ورود به آزمایشگاه موشن فارسی"
      className={cn(
        "fixed inset-0 z-[120] h-[100dvh] w-screen overflow-hidden overscroll-none touch-none text-[#F5F2EB]",
        exiting ? "pointer-events-none" : ""
      )}
    >
      {/* SCULPTURAL CURVED CENTER-SPLIT CURTAIN WITH COLOR-PSYCHOLOGY ARTWORK */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern
            id="intro-nebula-pattern"
            patternUnits="userSpaceOnUse"
            width="1000"
            height="1000"
          >
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

          <linearGradient id="portal-lip-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245, 184, 65, 0.1)" />
            <stop offset="22%" stopColor="#F5B841" />
            <stop offset="50%" stopColor="#FFFBEB" />
            <stop offset="78%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.1)" />
          </linearGradient>

          {!isMobile && (
            <filter id="portal-lip-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        <path d={upperWingPath} fill="url(#intro-nebula-pattern)" />
        <path d={lowerWingPath} fill="url(#intro-nebula-pattern)" />

        {exitProgress > 0.005 && exitProgress < 0.35 && (
          <line
            x1={(500 - seamHalfSpan).toFixed(1)}
            y1="500"
            x2={(500 + seamHalfSpan).toFixed(1)}
            y2="500"
            stroke="url(#portal-lip-gold)"
            strokeWidth={(2.8 + Math.sin(seamIgnite * Math.PI) * 5.5).toFixed(1)}
            strokeLinecap="round"
            filter={portalFilter}
            style={{ opacity: Math.max(0, 1 - splitRaw * 2.2) }}
          />
        )}

        {lipGlowOpacity > 0.01 && (
          <g style={{ opacity: lipGlowOpacity }} filter={portalFilter}>
            <path
              d={upperLipCurve}
              fill="none"
              stroke="url(#portal-lip-gold)"
              strokeWidth={isMobile ? "6" : "4.5"}
            />
            <path
              d={lowerLipCurve}
              fill="none"
              stroke="url(#portal-lip-gold)"
              strokeWidth={isMobile ? "6" : "4.5"}
            />
          </g>
        )}
      </svg>

      {/* CENTER STAGE */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {!ignited ? (
          <IgnitionPointGate onIgnite={() => void handleIgnite()} />
        ) : (
          <LineToWordsStage progress={progress} exitProgress={exitProgress} isMobile={isMobile} />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------- Host */

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
      <AnimatePresence>
        {open && <IntroFilm key="intro-point-ignition" onClose={close} />}
      </AnimatePresence>

      {/* Floating Replay Trigger inside the site (compact & non-intrusive above the mobile dock) */}
      {!open && !isAutomatedSmoke && (
        <div className="fixed start-3 bottom-[74px] z-[70] sm:start-4 sm:bottom-5">
          <button
            type="button"
            onClick={async () => {
              soundEngine.enabled = true;
              await soundEngine.unlock();
              setOpen(true);
            }}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#0A0C12]/90 px-2.5 py-1.5 text-[10.5px] font-medium text-[#F5F2EB] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all hover:border-[#F5B841]/50 hover:text-white active:scale-[0.97] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[11.5px]"
          >
            <Volume2 className="h-3 w-3 text-[#F5B841] sm:h-3.5 sm:w-3.5" />
            <span>پخش مجدد موشن ورود</span>
          </button>
        </div>
      )}
    </>
  );
};

export default IntroHost;
