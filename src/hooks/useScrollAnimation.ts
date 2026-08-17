import { useEffect, useRef, useState } from "react";

/** Shared reduced-motion query, read once and subscribed to for live changes. */
function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return prefers;
}

/**
 * Reveals an element once it scrolls into view.
 *
 * The observer disconnects after the first intersection — these are one-shot
 * entrance animations, so there's no reason to keep observing every stage on
 * the page for the rest of the session.
 *
 * `onVisible` is held in a ref so callers don't have to memoize it; passing an
 * inline arrow previously tore down and rebuilt the observer on every render.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
  onVisible?: () => void,
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: reveal immediately, no observer at all.
    if (prefersReducedMotion) {
      setIsVisible(true);
      onVisibleRef.current?.();
      return;
    }

    // No IntersectionObserver (very old browsers): fail open — show content
    // rather than leaving it stuck at opacity 0.
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      onVisibleRef.current?.();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisibleRef.current?.();
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, prefersReducedMotion]);

  return { ref, isVisible, prefersReducedMotion };
}

/**
 * Current scroll offset, sampled at most once per frame.
 *
 * The previous version called setState on every scroll event, which on a
 * trackpad or smooth-scrolling device fires far more often than the display
 * refreshes — so most of those renders were discarded work.
 */
export function useParallax() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setOffset(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return offset;
}
