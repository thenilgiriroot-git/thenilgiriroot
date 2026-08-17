import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useGaPageviews } from "@/lib/analytics";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import ConsentBanner from "@/components/consent/ConsentBanner";

// Defer non-critical UI off the initial bundle. RootBot mounts a floating chat
// button only after the page is interactive.
//
// The brand preloader is deliberately NOT here: it lives in the HTML shell
// (index.html) so it can paint on the first frame, before this bundle has even
// parsed. A React-rendered preloader can only appear after mount, which is
// after the moment it exists to cover.
const RootBot = lazy(() => import("@/components/RootBot"));

const queryClient = new QueryClient();

function DeferredRootBot() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const idle = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const id = idle(() => setShow(true));
    return () => {
      const cancel = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
      else clearTimeout(id as unknown as number);
    };
  }, []);
  if (!show) return null;
  return (
    <Suspense fallback={null}>
      <RootBot />
    </Suspense>
  );
}

/** Emits GA4 page_view on every SPA route change. Must live inside <BrowserRouter>. */
function GaRouteTracker() {
  useGaPageviews();
  return null;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <ConsentProvider>
          <GaRouteTracker />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded-md"
          >
            Skip to main content
          </a>
          <Navbar />
          {/* tabIndex={-1} makes this a valid focus target. Without it the skip
              link only moved the scroll position — focus stayed in the nav, so
              the next Tab dropped the user straight back into the menu they had
              just skipped, which is the exact failure the link exists to fix. */}
          <div id="main-content" tabIndex={-1} className="outline-none">
            <AnimatedRoutes />
          </div>
          <Footer />
          <DeferredRootBot />
          <ConsentBanner />
        </ConsentProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
