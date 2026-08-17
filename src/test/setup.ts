import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

/**
 * matchMedia is used by useIsMobile, useScrollAnimation and ScrollStory.
 * The default returns `matches: false` (desktop, motion allowed); individual
 * tests override it via `setMatchMedia`.
 */
export function setMatchMedia(matches: boolean | ((query: string) => boolean)) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: typeof matches === "function" ? matches(query) : matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

setMatchMedia(false);

/** jsdom implements neither of these; several components observe elements. */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", MockResizeObserver);

// jsdom has no layout engine, so these are no-ops rather than throwing.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
