import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import logoDark from "@/assets/logo-dark.webp";
import { motion, AnimatePresence } from "framer-motion";
import { trackCtaClick } from "@/lib/analytics";
import RfqDialog from "@/components/RfqDialog";

/**
 * Information architecture.
 *
 * Nine flat top-level items had outgrown the bar — the code was already
 * compensating between 1024px and 1280px by shortening labels and tightening
 * gaps, which is the tell that the count exceeded the space. Nine
 * undifferentiated choices is also past the point where people scan rather
 * than read, and it buried Solutions and Certificates: the two pages that most
 * support a B2B sourcing decision.
 *
 * Regrouped to four labels plus the quote CTA. Every original destination is
 * still one or two clicks away, and nothing was removed.
 */
interface NavChild {
  label: string;
  path: string;
  hint: string;
}
interface NavItem {
  label: string;
  path?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "Products",
    children: [
      { label: "Our Fries", path: "/products", hint: "9mm, 10mm and 11mm cuts" },
      { label: "Solutions", path: "/solutions", hint: "By buyer type — HORECA, QSR, retail, export" },
    ],
  },
  {
    label: "Why Us",
    children: [
      { label: "Our Process", path: "/process", hint: "Farm to blast freezer, ten stages" },
      { label: "Certificates", path: "/certificates", hint: "FSSAI and quality documentation" },
      { label: "About Us", path: "/about", hint: "The story behind the brand" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Blog", path: "/blog", hint: "Recipes, sourcing and industry notes" },
      { label: "FAQ", path: "/faq", hint: "Common sourcing questions" },
    ],
  },
  { label: "Contact", path: "/contact" },
];

/** Flat list for the mobile sheet, which has room to show everything. */
const mobileNavGroups: { heading: string; items: { label: string; path: string }[] }[] = [
  { heading: "Products", items: [{ label: "Our Fries", path: "/products" }, { label: "Solutions", path: "/solutions" }] },
  {
    heading: "Why Us",
    items: [
      { label: "Our Process", path: "/process" },
      { label: "Certificates", path: "/certificates" },
      { label: "About Us", path: "/about" },
    ],
  },
  { heading: "Resources", items: [{ label: "Blog", path: "/blog" }, { label: "FAQ", path: "/faq" }] },
];

const linkBase =
  "text-sm font-body tracking-wide whitespace-nowrap rounded-sm transition-colors duration-base focus-ring";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const isHome = location.pathname === "/";

  // Scroll state, sampled at most once per frame. The previous version called
  // setState directly from the scroll event, which fires far more often than
  // the display refreshes.
  const frameRef = useRef(0);
  useEffect(() => {
    const read = () => {
      frameRef.current = 0;
      const threshold = isHome ? window.innerHeight * 0.95 : 20;
      setPastHero(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isHome]);

  const showSolid = !isHome || pastHero;
  const logoSrc = theme === "dark" ? logoDark : "/logo.webp";

  const isActive = (path?: string) => !!path && location.pathname === path;
  const groupActive = (item: NavItem) =>
    isActive(item.path) || !!item.children?.some((c) => location.pathname === c.path);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ease-out"
      style={{
        backgroundColor: showSolid
          ? theme === "dark"
            ? "rgba(20, 40, 20, 0.9)"
            : "rgba(244, 244, 244, 0.92)"
          : "transparent",
        // backdrop-filter is left permanently declared rather than toggled
        // between "blur(0px)" and "blur(20px)". Toggling it on and off forces
        // the browser to create and destroy a backdrop root on every scroll
        // past the threshold; keeping it constant and animating only the
        // background colour keeps the layer stable.
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderBottom: showSolid
          ? theme === "dark"
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(53,94,59,0.12)"
          : "1px solid transparent",
        boxShadow: showSolid ? "0 4px 30px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 rounded-sm focus-ring" aria-label="The Nilgiri Root — home">
          {/* The logo box is a fixed 84px tall and the image scales inside it
              with transform. Animating `height` (the previous approach) is a
              layout property: every frame of the 500ms transition reflowed the
              whole navbar and repainted the blur behind it. transform runs on
              the compositor and reflows nothing. */}
          <span className="flex h-[84px] items-center overflow-hidden">
            <img
              src={logoSrc}
              alt="The Nilgiri Root"
              width={180}
              height={84}
              fetchPriority="high"
              decoding="async"
              className="h-[84px] w-auto origin-left transition-transform duration-500 ease-out will-change-transform"
              style={{ transform: showSolid ? "scale(0.714)" : "scale(1)" }}
            />
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger
                  className={`${linkBase} flex items-center gap-1 px-3 py-2 hover:text-accent ${
                    groupActive(item) ? "text-accent" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.path} asChild>
                      <Link to={child.path} className="flex flex-col items-start gap-0.5 cursor-pointer">
                        <span
                          className={`font-body text-sm ${
                            isActive(child.path) ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {child.label}
                        </span>
                        <span className="font-body text-2xs text-muted-foreground">{child.hint}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.path}
                to={item.path!}
                className={`${linkBase} px-3 py-2 hover:text-accent ${
                  isActive(item.path) ? "text-accent" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        {/* CTA + Theme Toggle */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <ThemeToggle />

          <AnimatePresence>
            {showSolid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <RfqDialog
                  sourceSection="navbar-desktop"
                  trigger={
                    <Button
                      size="sm"
                      className="bg-accent text-accent-foreground hover:bg-accent/90 font-body text-sm px-4 xl:px-5 rounded-full flex items-center gap-2 shadow-lg shadow-accent/20 whitespace-nowrap"
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      Request Quote
                    </Button>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            to="/contact"
            className="rounded-full focus-ring"
            onClick={() =>
              trackCtaClick({
                label: "Partner With Us",
                destination: "/contact",
                pageSource: "navbar",
                section: "navbar-desktop",
              })
            }
          >
            <Button
              variant="outline"
              tabIndex={-1}
              className="font-body text-sm px-4 xl:px-6 rounded-full border-border/50 text-foreground hover:bg-muted transition-colors duration-base whitespace-nowrap"
            >
              Partner With Us
            </Button>
          </Link>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />

          <AnimatePresence>
            {showSolid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <RfqDialog
                  sourceSection="navbar-mobile"
                  trigger={
                    <Button
                      size="icon"
                      aria-label="Request a quote"
                      className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-9 w-9 shadow-lg shadow-accent/20"
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu" className="text-foreground">
                <Menu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background/95 backdrop-blur-xl border-border/30 w-80 overflow-y-auto"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-6 mt-10" aria-label="Main">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className={`text-lg font-display py-2 px-4 rounded-lg transition-colors duration-base focus-ring ${
                    location.pathname === "/" ? "text-accent bg-muted" : "text-foreground/80"
                  }`}
                >
                  Home
                </Link>

                {mobileNavGroups.map((group) => (
                  <div key={group.heading} className="flex flex-col gap-1">
                    <p className="font-body text-2xs tracking-[0.2em] uppercase text-muted-foreground px-4 mb-1">
                      {group.heading}
                    </p>
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={`text-base font-display py-2 px-4 rounded-lg transition-colors duration-base focus-ring ${
                          location.pathname === item.path ? "text-accent bg-muted" : "text-foreground/80"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}

                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className={`text-lg font-display py-2 px-4 rounded-lg transition-colors duration-base focus-ring ${
                    location.pathname === "/contact" ? "text-accent bg-muted" : "text-foreground/80"
                  }`}
                >
                  Contact
                </Link>

                <div className="flex flex-col gap-3 mt-2 px-1">
                  <div onClick={() => setOpen(false)}>
                    <RfqDialog
                      sourceSection="navbar-mobile-menu"
                      trigger={
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body rounded-full flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                          Request Quote
                        </Button>
                      }
                    />
                  </div>
                  <Link
                    to="/contact"
                    className="rounded-full focus-ring"
                    onClick={() => {
                      trackCtaClick({
                        label: "Partner With Us",
                        destination: "/contact",
                        pageSource: "navbar",
                        section: "navbar-mobile-menu",
                      });
                      setOpen(false);
                    }}
                  >
                    <Button
                      variant="outline"
                      tabIndex={-1}
                      className="w-full font-body rounded-full border-border/50"
                    >
                      Partner With Us
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
