import React from "react";
import { motion, useReducedMotion, type Target, type Transition } from "framer-motion";
import { cn } from "./kit";

/**
 * یک زبان حرکت مستقل برای هر بخش صفحه.
 * هر بخش ورودی خودش را دارد تا صفحه مثل یک اسلاید تکراری نباشد:
 * ماسک، بلور، وایپ راست‌به‌چپ، تیلت سه‌بعدی، فنر و ریل کشویی.
 */
export type RevealVariant =
  | "mask-up"
  | "blur-in"
  | "clip-wipe"
  | "tilt-in"
  | "spring-pop"
  | "rail-stagger"
  | "drop-in";

const EASE = [0.22, 1, 0.36, 1] as const;

interface Preset {
  initial: Target;
  animate: Target;
  transition: Transition;
}

const PRESETS: Record<RevealVariant, Preset> = {
  "mask-up": {
    initial: { opacity: 0, y: 28, clipPath: "inset(16% 0 0 0)" },
    animate: { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" },
    transition: { duration: 0.7, ease: EASE },
  },
  "blur-in": {
    initial: { opacity: 0, filter: "blur(14px)", scale: 0.975 },
    animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
    transition: { duration: 0.75, ease: EASE },
  },
  "clip-wipe": {
    initial: { opacity: 0, clipPath: "inset(0 0 0 96%)" },
    animate: { opacity: 1, clipPath: "inset(0 0 0 0%)" },
    transition: { duration: 0.85, ease: EASE },
  },
  "tilt-in": {
    initial: { opacity: 0, y: 34, rotateX: 12, transformPerspective: 900 },
    animate: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 900 },
    transition: { duration: 0.8, ease: EASE },
  },
  "spring-pop": {
    initial: { opacity: 0, scale: 0.92, y: 18 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: "spring", stiffness: 220, damping: 24 },
  },
  "rail-stagger": {
    initial: { opacity: 0, x: 34 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: EASE },
  },
  "drop-in": {
    initial: { opacity: 0, y: -22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE },
  },
};

interface RevealProps {
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  children: React.ReactNode;
  /** برای بخش‌هایی که باید همیشه دیده شوند (مثلاً بالای صفحه) */
  eager?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  variant = "mask-up",
  delay = 0,
  className,
  children,
  eager = false,
}) => {
  const reduced = useReducedMotion();
  const preset = PRESETS[variant];

  if (reduced) return <div className={className}>{children}</div>;

  if (eager) {
    return (
      <motion.div
        initial={preset.initial}
        animate={preset.animate}
        transition={{ ...preset.transition, delay }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={preset.initial}
      whileInView={preset.animate}
      viewport={{ once: true, margin: "-60px 0px" }}
      transition={{ ...preset.transition, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

/** نسخه‌ی آیتمی برای گریدها: هر کارت با تأخیر کوچک از ریل بیرون می‌آید. */
export const RevealGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  step?: number;
  variant?: RevealVariant;
}> = ({ children, className, step = 0.05, variant = "spring-pop" }) => {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <Reveal key={i} variant={variant} delay={i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
};

export default Reveal;
