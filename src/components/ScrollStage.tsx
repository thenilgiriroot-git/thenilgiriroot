import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ScrollStageProps {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms for sibling stages. Capped so a long list never
   *  leaves the last item waiting seconds to appear. */
  delay?: number;
  onVisible?: () => void;
}

/** Longest stagger we'll ever apply, regardless of index. */
const MAX_DELAY = 240;

/**
 * Fades and lifts its children into view once scrolled to.
 *
 * Motion spec: 320ms, ease-out-expo, 20px of travel. Only `opacity` and
 * `transform` animate — both run on the compositor, so a reveal costs no
 * layout or paint work on the main thread. `will-change` is applied only
 * while the element is still hidden, so we don't leave dozens of promoted
 * layers alive after everything has revealed.
 */
export default function ScrollStage({
  children,
  className = "",
  delay = 0,
  onVisible,
}: ScrollStageProps) {
  const { ref, isVisible, prefersReducedMotion } = useScrollAnimation(0.15, onVisible);

  // Reduced motion: render revealed and skip the transition entirely rather
  // than running a 0.01ms one.
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transitionProperty: "opacity, transform",
        transitionDuration: "320ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${Math.min(delay, MAX_DELAY)}ms`,
        willChange: isVisible ? undefined : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
