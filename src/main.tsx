import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

/**
 * Retire the HTML-shell preloader.
 *
 * The overlay animates and self-hides purely in CSS (see index.html), so this
 * is not what dismisses it — the sequence completes with or without JS. All
 * this does is remove the now-invisible node from the DOM once React has
 * painted, so the compositor layer it occupies is released.
 *
 * The `--done` class is applied first rather than removing the node outright:
 * if React mounts *before* the CSS sequence finishes (fast connection, warm
 * cache), yanking the element mid-animation would cut the intro short. The
 * class cross-fades it out instead, and the node is removed after.
 */
function retirePreloader() {
  const el = document.getElementById("tnr-preloader");
  if (!el) return;

  const remove = () => el.remove();

  // Already hidden by its own animation — just clean up.
  if (getComputedStyle(el).visibility === "hidden") {
    remove();
    return;
  }

  el.classList.add("tnr-preloader--done");
  el.addEventListener("transitionend", remove, { once: true });
  // Backstop: transitionend does not fire if the element was already
  // display:none (reduced motion, or a repeat visit in the same session).
  window.setTimeout(remove, 600);
}

if (typeof window !== "undefined") {
  // Two frames after mount: the first commits React's DOM, the second paints
  // it. Removing the overlay before that paint would show a blank ground.
  requestAnimationFrame(() => requestAnimationFrame(retirePreloader));

  // Defer smooth scroll initialization until after first paint
  requestIdleCallback(
    async () => {
      const { default: Lenis } = await import("lenis");

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    },
    { timeout: 2000 },
  );
}
