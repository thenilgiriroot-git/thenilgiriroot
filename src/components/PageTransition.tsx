import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Route-change choreography.
 *
 * Cross-fade only. The previous version also translated 20px vertically on
 * enter and exit, which fought the scroll reset in AnimatedRoutes: the reset
 * fired while the outgoing page was still animating out, so navigation showed
 * a visible upward jump before the new page settled.
 *
 * 200ms out, 260ms in — fast enough that navigation feels immediate, long
 * enough to read as a transition rather than a flash.
 */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.26, ease: EASE_OUT_EXPO } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "linear" as const } },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return <>{children}</>;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
