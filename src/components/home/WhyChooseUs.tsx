import { useEffect, useState } from "react";
import ScrollStage from "@/components/ScrollStage";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Mountain, Snowflake, Award, Truck } from "lucide-react";

const stats = [
  { icon: Mountain, value: 7000, suffix: "ft", label: "Elevation of our farms" },
  { icon: Snowflake, value: -35, suffix: "°C", label: "Blast freezer temperature" },
  { icon: Award, value: 100, suffix: "%", label: "Quality assurance" },
  { icon: Truck, value: 24, suffix: "hr", label: "Farm to factory" },
];

const COUNT_DURATION_MS = 1600;
/** Decelerating curve, so the number eases into its final value. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts up to `target` when scrolled into view.
 *
 * Driven by requestAnimationFrame against a real timestamp rather than a
 * setInterval firing every 33ms. The interval version queued 60 state updates
 * unsynchronised with the compositor, so on a busy main thread the ticks
 * bunched and the count visibly stuttered — and each tick relaid out the
 * number. tabular-nums keeps every digit the same width, so the counter no
 * longer reflows its siblings as it climbs.
 */
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const { ref, isVisible, prefersReducedMotion } = useScrollAnimation<HTMLSpanElement>(0.3);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Reduced motion: show the final figure, don't animate to it.
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
      setCount(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVisible, target, prefersReducedMotion]);

  return (
    <span
      ref={ref}
      className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-accent tabular-nums"
    >
      {count}
      {suffix}
    </span>
  );
}

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)_/_0.06),_transparent_70%)]" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollStage>
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">Why Choose Us</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Quality at Every Step
            </h2>
          </div>
        </ScrollStage>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <ScrollStage key={i} delay={i * 150}>
              <div className="text-center space-y-2 sm:space-y-3 glass-card p-4 sm:p-6 md:p-8">
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent mx-auto mb-2 sm:mb-4" />
                <Counter target={stat.value} suffix={stat.suffix} />
                <p className="text-2xs sm:text-xs md:text-sm text-muted-foreground font-body">{stat.label}</p>
              </div>
            </ScrollStage>
          ))}
        </div>
      </div>
    </section>
  );
}
