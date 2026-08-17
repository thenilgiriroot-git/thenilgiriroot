import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      // Type scale. Tailwind's built-in steps (xs -> 9xl) are the base; these
      // fill the two gaps the design actually needs:
      //   2xs   — the single smallest step, replacing the ad-hoc mix of
      //           text-[10px] and text-[11px] that had accumulated sitewide.
      //           One step instead of two, and 10px was below comfortable
      //           reading size for the uppercase labels using it.
      //   fluid-* — viewport-responsive display sizes, so page headings no
      //           longer carry inline clamp() declarations.
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        "fluid-display": ["clamp(2.25rem, 8vw, 6rem)", { lineHeight: "1.1" }],
        "fluid-h1": ["clamp(2rem, 5vw, 3.75rem)", { lineHeight: "1.15" }],
        "fluid-h2": ["clamp(1.75rem, 3.5vw, 3rem)", { lineHeight: "1.2" }],
      },
      // Named spacing for the scroll-driven layouts. These are viewport-relative
      // by nature (they pace scroll, not content), so they can't come from the
      // rem-based spacing scale — but naming them keeps the magic numbers in
      // one place instead of inline in three components.
      spacing: {
        "hero-scroll": "180vh",
        "stage-gap": "55vh",
        "stage-gap-lg": "60vh",
        "stage-min": "40vh",
      },
      // Motion tokens. Durations sit in the 200-400ms band the design spec
      // calls for; ease-out-expo is the shared decelerating curve for entrances.
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        quick: "180ms",
        base: "240ms",
        reveal: "320ms",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        forest: {
          DEFAULT: "hsl(var(--forest))",
          light: "hsl(var(--forest-light))",
        },
        golden: {
          DEFAULT: "hsl(var(--golden))",
          light: "hsl(var(--golden-light))",
        },
        earth: {
          DEFAULT: "hsl(var(--earth))",
          light: "hsl(var(--earth-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Only the Radix accordion keyframes remain. Twelve others (float, steam,
      // bubble, shimmer, frost, pulse-glow, spin-slow, vibrate, counter,
      // fade-in, fade-in-up, scale-in) were defined but referenced nowhere;
      // several ran `infinite` and animated box-shadow, a paint-heavy property
      // that would have pinned the compositor on mid-tier devices the moment
      // anyone applied the class. Entrance motion is handled by ScrollStage and
      // Framer Motion instead, both of which stick to transform/opacity.
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
