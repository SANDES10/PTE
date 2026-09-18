/**
 * Premium animation variants for the PTE Master platform.
 * Built on Framer Motion — import and apply to motion.* elements.
 */
import type { Variants, Transition } from "framer-motion";

// ─── Spring presets ────────────────────────────────────────────────────────────
export const springs = {
  gentle: { type: "spring", stiffness: 200, damping: 30 } as Transition,
  snappy: { type: "spring", stiffness: 400, damping: 35 } as Transition,
  bouncy: { type: "spring", stiffness: 500, damping: 25 } as Transition,
  slow:   { type: "spring", stiffness: 120, damping: 20 } as Transition,
};

// ─── Page transitions ─────────────────────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
};

// ─── Fade in ──────────────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Slide up ─────────────────────────────────────────────────────────────────
export const slideUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: springs.gentle },
  exit:    { opacity: 0, y: 12, transition: { duration: 0.18 } },
};

// ─── Slide in from left ───────────────────────────────────────────────────────
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: springs.gentle },
  exit:    { opacity: 0, x: -12, transition: { duration: 0.18 } },
};

// ─── Slide in from right ──────────────────────────────────────────────────────
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: springs.gentle },
  exit:    { opacity: 0, x: 12, transition: { duration: 0.18 } },
};

// ─── Scale pop ────────────────────────────────────────────────────────────────
export const scalePop: Variants = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1, transition: springs.bouncy },
  exit:    { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

// ─── Stagger container ────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0 } },
};

// ─── Stagger item ─────────────────────────────────────────────────────────────
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springs.gentle },
};

export const staggerItemLeft: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: springs.gentle },
};

// ─── Card hover ───────────────────────────────────────────────────────────────
export const cardHover = {
  rest:  { scale: 1, y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  hover: { scale: 1.015, y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", transition: springs.snappy },
  tap:   { scale: 0.985, transition: { duration: 0.1 } },
};

// ─── Button press ─────────────────────────────────────────────────────────────
export const buttonPress = {
  rest:  { scale: 1 },
  hover: { scale: 1.03, transition: springs.snappy },
  tap:   { scale: 0.96, transition: { duration: 0.08 } },
};

// ─── Score counter (for animated number display) ──────────────────────────────
export const scoreReveal: Variants = {
  initial: { opacity: 0, scale: 0.5, rotate: -5 },
  animate: { opacity: 1, scale: 1, rotate: 0, transition: { ...springs.bouncy, delay: 0.3 } },
};

// ─── Progress bar fill ────────────────────────────────────────────────────────
export const progressFill = (targetWidth: number) => ({
  initial: { width: "0%" },
  animate: { width: `${targetWidth}%`, transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 } },
});

// ─── Accordion / expand ───────────────────────────────────────────────────────
export const accordionVariants: Variants = {
  closed: { height: 0, opacity: 0, overflow: "hidden" },
  open:   { height: "auto", opacity: 1, overflow: "visible", transition: { height: { duration: 0.3, ease: "easeOut" }, opacity: { duration: 0.25, delay: 0.05 } } },
};

// ─── Pulse glow (for recording indicator) ────────────────────────────────────
export const pulseGlow: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: { scale: [1, 1.15, 1], opacity: [1, 0.6, 1], transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } },
};

// ─── Shimmer skeleton ─────────────────────────────────────────────────────────
export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { backgroundPosition: "200% 0", transition: { duration: 1.6, repeat: Infinity, ease: "linear" } },
};

// ─── Notification badge bounce ────────────────────────────────────────────────
export const badgeBounce: Variants = {
  initial: { scale: 0 },
  animate: { scale: 1, transition: springs.bouncy },
};

// ─── Confetti particle ────────────────────────────────────────────────────────
export const confettiParticle = (x: number, y: number, rotation: number) => ({
  initial: { opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 },
  animate: {
    opacity: [1, 1, 0],
    y: [0, y],
    x: [0, x],
    rotate: [0, rotation],
    scale: [1, 0.8],
    transition: { duration: 1.2, ease: "easeOut" },
  },
});

// ─── Tab underline ────────────────────────────────────────────────────────────
export const tabUnderline: Variants = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1, transition: springs.snappy },
};

// ─── Waveform bar ─────────────────────────────────────────────────────────────
export const waveformBar = (amplitude: number, delay: number): Variants => ({
  initial: { scaleY: 0.1 },
  animate: {
    scaleY: amplitude,
    transition: { duration: 0.08, delay, ease: "easeOut" },
  },
});

// ─── Tooltip ─────────────────────────────────────────────────────────────────
export const tooltipVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15 } },
  exit:    { opacity: 0, scale: 0.9, y: 4, transition: { duration: 0.1 } },
};

// ─── Modal / dialog ───────────────────────────────────────────────────────────
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springs.gentle },
  exit:    { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.18 } },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};
