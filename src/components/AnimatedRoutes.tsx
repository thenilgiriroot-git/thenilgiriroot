import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import PageTransition from "./PageTransition";

// Lazy load all pages except Index for faster initial load
const Index = lazy(() => import("@/pages/Index"));
const Products = lazy(() => import("@/pages/Products"));
const Process = lazy(() => import("@/pages/Process"));
const Certificates = lazy(() => import("@/pages/Certificates"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const WhatsAppSent = lazy(() => import("@/pages/WhatsAppSent"));
const Admin = lazy(() => import("@/pages/Admin"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Solutions = lazy(() => import("@/pages/Solutions"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const PrivacyDashboard = lazy(() => import("@/pages/PrivacyDashboard"));

// Landing-page slugs now come from the shared route manifest, which the
// prerenderer and sitemap generator also read — one list, three consumers.
import { LANDING_SLUGS } from "@/data/routes";

// Minimal loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AnimatedRoutes() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Under reduced motion PageTransition renders a plain fragment, so there is
  // no exit animation and onExitComplete never fires — reset on pathname
  // instead. With motion enabled this effect stays out of the way and the
  // reset happens after the outgoing page has finished leaving.
  useEffect(() => {
    if (prefersReducedMotion) window.scrollTo(0, 0);
  }, [location.pathname, prefersReducedMotion]);

  return (
    <Suspense fallback={<PageLoader />}>
      {/* Scroll reset runs in onExitComplete, not in an effect keyed on
          pathname. With mode="wait" the effect fired while the outgoing page
          was still animating, so the user watched the old page jump to the top
          before it had finished leaving. */}
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          if (!prefersReducedMotion) window.scrollTo(0, 0);
        }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
          <Route path="/process" element={<PageTransition><Process /></PageTransition>} />
          <Route path="/certificates" element={<PageTransition><Certificates /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="/whatsapp-sent" element={<PageTransition><WhatsAppSent /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
          <Route path="/solutions" element={<PageTransition><Solutions /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/cookie-policy" element={<PageTransition><CookiePolicy /></PageTransition>} />
          <Route path="/privacy-dashboard" element={<PageTransition><PrivacyDashboard /></PageTransition>} />
          {/* The slug is passed explicitly. These are literal paths, not
              `/:slug`, so useParams() inside LandingPage sees nothing. */}
          {LANDING_SLUGS.map((s) => (
            <Route
              key={s}
              path={`/${s}`}
              element={<PageTransition><LandingPage slug={s} /></PageTransition>}
            />
          ))}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
