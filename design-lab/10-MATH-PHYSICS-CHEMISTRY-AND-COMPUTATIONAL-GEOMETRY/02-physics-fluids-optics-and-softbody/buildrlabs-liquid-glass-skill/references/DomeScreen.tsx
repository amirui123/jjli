/**
 * DomeScreen.tsx — Gemini liquid glass welcome screen.
 * Stack: Expo + @shopify/react-native-skia + Reanimated 4 + Gesture Handler 2.
 * Shader: ./dome.sksl (inlined by babel-plugin-inline-import; see SKILL.md).
 *
 * Flow: dome rests on the bottom edge -> swipe up (or tap) -> spring docks a
 * 34pt glass button at 54% height -> badges orbit, headline + CTA appear.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import {
  BackdropFilter, Blur, Canvas, Circle, Fill, Group, RadialGradient,
  RuntimeShader, Skia, rect, useClock, vec,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation, cancelAnimation, interpolate, useAnimatedReaction, useAnimatedStyle,
  useDerivedValue, useFrameCallback, useReducedMotion, useSharedValue,
  withSequence, withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import DOME_SKSL from './dome.sksl';

// ─── Tokens ────────────────────────────────────────────────────────────────
export const T = {
  background: '#090A0F',
  horizonGlow: '#1A2342',
  primaryAccent: '#4B90FF',
  secondaryAccent: '#A87FFB',
  causticHighlight: '#FF6B8B',
  text: '#FFFFFF',
  textMuted: '#C9D3F0',
  ior: 1.48,
  chromaticDispersion: 0.038,
  domeRadius: 210,     // pt @ 402 wide
  dockedRadius: 34,    // pt @ 402 wide (68pt target)
  dockedY: 0.54,       // fraction of height
  spring: { damping: 18, stiffness: 160 },
} as const;

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const TINT = rgb(T.primaryAccent);
const CAUSTIC = rgb(T.causticHighlight);

const BADGES = ['Code', 'Research', 'Write', 'Plan', 'Create', 'Learn'];

// Compile once. null => fallback disc (also used for Reduce Transparency).
const domeEffect = Skia.RuntimeEffect.Make(DOME_SKSL);

type Props = {
  headline?: string;
  body?: string;
  cta?: string;
  onContinue?: () => void;
};

export default function DomeScreen({
  headline = 'Your agent is ready',
  body = 'Ask, build, and explore from one place.',
  cta = 'Get started',
  onContinue,
}: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => sub.remove();
  }, []);

  // ─── Geometry ────────────────────────────────────────────────────────────
  const s = W / 402;
  const R0 = T.domeRadius * s;
  const R1 = T.dockedRadius * s;
  const CY0 = H;
  const CY1 = H * T.dockedY;
  const travel = CY0 - CY1;

  // ─── Motion state ────────────────────────────────────────────────────────
  const progress = useSharedValue(0); // may overshoot slightly (rubber band)
  const force = useSharedValue(0);    // 0..1 caustic drive
  const start = useSharedValue(0);
  const time = useSharedValue(0);     // seconds, for badge orbit
  const reveal = useSharedValue(0);   // headline/CTA

  // Geometry follows progress (declared before gestures: worklets capture it).
  const cy = useDerivedValue(() => interpolate(progress.value, [0, 1], [CY0, CY1]));
  const radius = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [R0, R1], Extrapolation.CLAMP),
  );

  useFrameCallback((f) => {
    if (!reduceMotion) time.value = f.timeSinceFirstFrame / 1000;
  });

  const rubber = (x: number) => {
    'worklet';
    if (x < 0) return x * 0.25;
    if (x > 1) return 1 + (x - 1) * 0.25;
    return x;
  };

  const animateTo = (target: 0 | 1, velocity = 0) => {
    'worklet';
    if (reduceMotion) {
      progress.value = withTiming(target, { duration: 220 });
      return;
    }
    progress.value = withSpring(target, { ...T.spring, velocity }, (finished) => {
      // Peak-end: one crown flare on landing.
      if (finished && target === 1) {
        force.value = withSequence(withTiming(0.7, { duration: 90 }), withTiming(0, { duration: 520 }));
      }
    });
  };

  const open = () => animateTo(1);
  const close = () => animateTo(0);

  // ─── Gestures ────────────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(progress);
      start.value = progress.value;
    })
    .onUpdate((e) => {
      progress.value = rubber(start.value - e.translationY / travel);
      const target = reduceMotion ? 0 : Math.min(1, Math.max(0, -e.velocityY / 1800));
      force.value += (target - force.value) * 0.35; // smooth: light answers push
    })
    .onEnd((e) => {
      const v = -e.velocityY / travel; // progress units / s
      const projected = progress.value + 0.15 * v;
      force.value = withTiming(0, { duration: 450 });
      animateTo(projected > 0.5 ? 1 : 0, v);
    });

  // Tap on the glass only (taps on the CTA must not toggle the dome).
  const tap = Gesture.Tap().onEnd((e) => {
    const hitR = Math.max(radius.value, 22) * 1.2;
    if (Math.hypot(e.x - W / 2, e.y - cy.value) > hitR) return;
    animateTo(progress.value > 0.5 ? 0 : 1);
  });

  const gesture = Gesture.Race(pan, tap);

  // ─── Docking (decided from position, with hysteresis) ────────────────────
  const onDock = (d: boolean) => {
    setDocked(d);
    if (d) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  useAnimatedReaction(
    () => progress.value,
    (p, prev) => {
      if (prev == null) return;
      if (p > 0.97 && prev <= 0.97 && reveal.value < 0.5) {
        reveal.value = withTiming(1, { duration: reduceMotion ? 0 : 420 });
        scheduleOnRN(onDock, true);
      } else if (p < 0.8 && prev >= 0.8 && reveal.value > 0.5) {
        reveal.value = withTiming(0, { duration: reduceMotion ? 0 : 240 });
        scheduleOnRN(onDock, false);
      }
    },
  );

  // ─── Progress -> geometry -> uniforms ────────────────────────────────────

  const uniforms = useDerivedValue(() => {
    const pc = Math.min(1, Math.max(0, progress.value));
    return {
      u_center: [W / 2, cy.value],
      u_radius: radius.value,
      u_ior: T.ior,
      u_dispersion: T.chromaticDispersion,
      u_thickness: 0.9 + 0.2 * pc,
      u_force: force.value,
      u_progress: pc,
      u_tint: TINT,
      u_caustic: CAUSTIC,
    };
  });

  // Only run the shader around the dome (+ halo).
  const clip = useDerivedValue(() => {
    const r = radius.value * 1.4;
    return rect(W / 2 - r, cy.value - r, r * 2, r * 2);
  });

  // Aurora drift (frozen under Reduce Motion).
  const clock = useClock();
  const blobA = useDerivedValue(() =>
    reduceMotion ? W * 0.3 : W * (0.3 + 0.08 * Math.sin(clock.value / 2600)),
  );
  const blobB = useDerivedValue(() =>
    reduceMotion ? W * 0.72 : W * (0.72 + 0.07 * Math.cos(clock.value / 3100)),
  );

  const useGlass = !!domeEffect && !reduceTransparency;
  const center = useDerivedValue(() => vec(W / 2, cy.value));

  // ─── RN overlay styles ───────────────────────────────────────────────────
  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2], [1, 0], Extrapolation.CLAMP),
  }));
  const copyStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * 12 }],
  }));

  const domeHit = useAnimatedStyle(() => {
    const r = Math.max(radius.value, 22); // >= 44pt target
    return { left: W / 2 - r, top: cy.value - r, width: r * 2, height: r * 2, borderRadius: r };
  });

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.root}>
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Backdrop: everything here is refracted by the dome. */}
          <Fill color={T.background} />
          <Circle cx={W / 2} cy={H * 1.05} r={H * 0.7}>
            <RadialGradient c={vec(W / 2, H * 1.05)} r={H * 0.7} colors={[T.horizonGlow, '#1A234200']} />
          </Circle>
          <Group opacity={0.55}>
            <Circle cx={blobA} cy={H * 0.82} r={W * 0.32} color={T.primaryAccent}>
              <Blur blur={60} />
            </Circle>
            <Circle cx={blobB} cy={H * 0.9} r={W * 0.28} color={T.secondaryAccent}>
              <Blur blur={60} />
            </Circle>
          </Group>

          {useGlass ? (
            <BackdropFilter
              clip={clip}
              filter={<RuntimeShader source={domeEffect!} uniforms={uniforms} />}
            />
          ) : (
            // Fallback: solid disc, same geometry and gesture.
            <Group>
              <Circle c={center} r={radius} color={T.horizonGlow} />
              <Circle c={center} r={radius} color={T.primaryAccent} style="stroke" strokeWidth={2} />
            </Group>
          )}
        </Canvas>

        {/* Orbiting domain badges (decorative, not refracted). */}
        {BADGES.map((label, i) => (
          <Badge
            key={label}
            label={label}
            index={i}
            count={BADGES.length}
            cx={W / 2}
            cy={CY1}
            scale={s}
            reveal={reveal}
            time={time}
          />
        ))}

        {/* Accessible control over the dome: swipe is never the only way in.
            Touch is handled by the Tap gesture above; this element exists for
            VoiceOver/TalkBack, which activate it via the 'activate' action. */}
        <Animated.View style={[styles.domeHit, domeHit]} pointerEvents="none">
          <Pressable
            style={StyleSheet.absoluteFill}
            accessible
            accessibilityRole="button"
            accessibilityLabel={docked ? 'Close' : 'Open'}
            accessibilityHint="Swipe up or double tap"
            accessibilityActions={[{ name: 'activate' }]}
            onAccessibilityAction={() => (docked ? close() : open())}
          />
        </Animated.View>

        <Animated.Text style={[styles.hint, { bottom: insets.bottom + 28 }, hintStyle]} accessible={false}>
          Swipe up
        </Animated.Text>

        <Animated.View
          style={[styles.copy, { bottom: insets.bottom + 24 }, copyStyle]}
          pointerEvents={docked ? 'auto' : 'none'}
          accessibilityElementsHidden={!docked}
          importantForAccessibility={docked ? 'auto' : 'no-hide-descendants'}
        >
          <Text style={styles.headline} accessibilityRole="header">{headline}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable
            style={({ pressed }) => [styles.pill, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={cta}
            onPress={onContinue}
          >
            <Text style={styles.pillLabel}>{cta}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────
function Badge({
  label, index, count, cx, cy, scale, reveal, time,
}: {
  label: string; index: number; count: number; cx: number; cy: number; scale: number;
  reveal: SharedValue<number>; time: SharedValue<number>;
}) {
  const base = (index / count) * Math.PI * 2;
  const ring = (88 + (index % 2) * 34) * scale;
  const style = useAnimatedStyle(() => {
    const a = base + time.value * 0.25;
    const out = reveal.value; // badges travel out from the button
    return {
      opacity: out,
      transform: [
        { translateX: cx + Math.cos(a) * ring * out - 40 },
        { translateY: cy + Math.sin(a) * ring * 0.62 * out - 14 },
        { scale: 0.6 + 0.4 * out },
      ],
    };
  });
  return (
    <Animated.View style={[styles.badge, style]} pointerEvents="none" accessible={false}>
      <Text style={styles.badgeLabel}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.background },
  domeHit: { position: 'absolute' },
  hint: {
    position: 'absolute', alignSelf: 'center', color: T.textMuted,
    fontSize: 15, fontWeight: '500', letterSpacing: 0.3,
  },
  copy: { position: 'absolute', left: 24, right: 24 },
  headline: { color: T.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.4 },
  body: { color: T.textMuted, fontSize: 16, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  pill: {
    height: 56, borderRadius: 28, backgroundColor: T.primaryAccent,
    alignItems: 'center', justifyContent: 'center',
  },
  pillLabel: { color: T.background, fontSize: 17, fontWeight: '700' },
  badge: {
    position: 'absolute', left: 0, top: 0, width: 80, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(26,35,66,0.85)', borderWidth: 1, borderColor: 'rgba(75,144,255,0.45)',
  },
  badgeLabel: { color: T.text, fontSize: 12, fontWeight: '600' },
});
