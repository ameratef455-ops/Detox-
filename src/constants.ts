export const ANIMATION_SPRING = {
  STIFF: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
  SOFT: { type: "spring", stiffness: 180, damping: 20, mass: 1 },
  BOUNCY: { type: "spring", stiffness: 300, damping: 15, mass: 1 },
  GENTLE: { type: "spring", stiffness: 120, damping: 14, mass: 1 },
};

export const VARIANTS = {
  FADE_IN_UP: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  },
  FADE_IN_SCALE: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
};
