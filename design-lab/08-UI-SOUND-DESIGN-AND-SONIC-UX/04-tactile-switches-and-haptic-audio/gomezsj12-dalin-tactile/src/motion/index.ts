/**
 * Motion channel entry point (`@dalin/tactile/motion`).
 *
 * Exports the built-in dependency-free driver. To use a heavier effects library
 * (tsParticles, react-rewards, canvas-confetti), implement `MotionDriver` and
 * pass it as `createTactile({ motion: myDriver })`.
 */
export { domMotionDriver } from "./dom-driver.js";
export { particleBurst } from "./particles.js";
export type { BurstOptions } from "./particles.js";
export type { MotionDriver, MotionSpec, MotionTarget, MotionRuntime } from "../types.js";
