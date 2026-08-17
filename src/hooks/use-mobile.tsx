import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

/**
 * True below 768px.
 *
 * Initialised synchronously from matchMedia rather than starting `undefined`
 * and resolving in an effect. The deferred version reported "not mobile" on
 * the very first render, so components branching on it (the hero, the process
 * story) mounted their desktop variant on a phone and then immediately swapped
 * — a visible flash plus a wasted mount of the parallax path we deliberately
 * skip on mobile.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(QUERY).matches
      : false,
  );

  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // Re-sync in case the viewport changed between first render and effect.
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
