import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import heroFries from "@/assets/hero-fries-bowl.webp";
import heroBg768 from "@/assets/hero-nilgiri-field-768.webp";
import heroBg1280 from "@/assets/hero-nilgiri-field-1280.webp";
import heroBg1920 from "@/assets/hero-nilgiri-field-1920.webp";
import { useIsMobile } from "@/hooks/use-mobile";
import { trackCtaClick } from "@/lib/analytics";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // Uses the project's shared matchMedia-based hook rather than a local
  // resize listener — a resize handler fires continuously through mobile
  // orientation changes and browser-chrome collapse to recompute one boolean.
  const isMobile = useIsMobile();
  const skip = !!prefersReducedMotion || isMobile;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const scale = useSpring(rawScale, { stiffness: 60, damping: 30 });
  const rawRotate = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const rotate = useSpring(rawRotate, { stiffness: 60, damping: 30 });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -30]);

  return (
    <section
      ref={sectionRef}
      className={skip ? "relative" : "relative h-hero-scroll"}
      aria-label="Premium golden blast frozen french fries from the Nilgiri hills"
    >
      <div
        className={
          skip
            ? "min-h-screen w-full overflow-hidden flex items-center justify-center"
            : "sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        }
      >
        {/* Field backdrop. Decorative, so it loads at normal priority — the LCP
            element is the fries card below, and it needs the bandwidth first. */}
        <picture>
          <source
            type="image/webp"
            srcSet={`${heroBg768} 768w, ${heroBg1280} 1280w, ${heroBg1920} 1920w`}
            sizes="100vw"
          />
          <img
            src={heroBg1280}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
          />
        </picture>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/70 via-background/55 to-background" />

        {/* Parallax wash. Same file as the card below, so the browser serves it
            from cache — one decode, two uses. Explicitly deprioritised: it is
            decorative and must not compete with the LCP element. */}
        {!skip && (
          <motion.div
            className="absolute inset-0 will-change-transform z-[1]"
            style={{ y: bgY }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background z-10" />
            <img
              src={heroFries}
              alt=""
              width={1600}
              height={1200}
              className="absolute inset-0 w-full h-[130%] object-cover opacity-40"
              loading="lazy"
              fetchPriority="low"
              decoding="async"
            />
          </motion.div>
        )}

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)_/_0.06),_transparent_60%)] z-[3]" />

        <div className="relative z-20 container mx-auto px-4 flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-16 py-20 lg:py-0">
          <div className="flex-1 flex justify-center relative">
            <motion.div
              className="relative will-change-transform"
              style={skip ? {} : { rotate, scale, y: contentY }}
              initial={skip ? false : { opacity: 0, y: 60 }}
              animate={skip ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] w-full max-w-[280px] sm:max-w-lg lg:max-w-xl relative glow-green">
                {/* The LCP element — the only image on the page marked high
                    priority. Previously three images competed for that slot
                    (this one, the parallax copy, and the field backdrop), so
                    bandwidth split three ways and the actual LCP arrived last. */}
                <img
                  src={heroFries}
                  alt="Premium golden crispy 10mm blast frozen french fries with rosemary"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex-1 text-center lg:text-left"
            style={skip ? {} : { opacity: textOpacity, y: textY }}
          >
            <motion.div
              initial={skip ? false : { opacity: 0, y: 40 }}
              animate={skip ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="font-body text-accent text-2xs tracking-[0.35em] uppercase mb-3 md:mb-4">
                From the Hills of Nilgiris
              </p>
              {/* Fluid size comes from the theme's fluid-display token rather
                  than an inline clamp() on the element. */}
              <h1 className="font-display font-bold text-fluid-display mb-4 md:mb-6 text-balance">
                <span className="text-foreground">The </span>
                <span className="text-gradient-forest">Nilgiri </span>
                <span className="text-foreground">Root</span>
              </h1>
            </motion.div>

            <motion.p
              className="font-body text-muted-foreground text-sm md:text-base lg:text-lg max-w-md leading-relaxed mb-6 md:mb-8 mx-auto lg:mx-0"
              initial={skip ? false : { opacity: 0, y: 30 }}
              animate={skip ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Premium frozen french fries crafted from 100% Nilgiri mountain potatoes — experience
              farm-to-freezer excellence.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              initial={skip ? false : { opacity: 0, y: 20 }}
              animate={skip ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link
                to="/products"
                onClick={() =>
                  trackCtaClick({
                    label: "Explore Products",
                    destination: "/products",
                    pageSource: "home",
                    section: "hero",
                  })
                }
                className="bg-accent text-accent-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-body text-sm font-medium hover:bg-accent/90 active:scale-[0.98] transition-[background-color,transform] duration-base ease-out-expo focus-ring"
              >
                Explore Products
              </Link>
              <Link
                to="/process"
                onClick={() =>
                  trackCtaClick({
                    label: "Our Process",
                    destination: "/process",
                    pageSource: "home",
                    section: "hero",
                  })
                }
                className="border border-border/50 text-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-body text-sm font-medium hover:bg-muted active:scale-[0.98] transition-[background-color,transform] duration-base ease-out-expo focus-ring"
              >
                Our Process
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {!skip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-2xs font-body tracking-widest uppercase">Scroll to explore</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
