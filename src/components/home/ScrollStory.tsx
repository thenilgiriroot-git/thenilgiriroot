import { useEffect, useRef, useState, useCallback } from "react";
import ScrollStage from "@/components/ScrollStage";
import StageVideo from "@/components/StageVideo";
import { stageMedia } from "@/assets/stages";
import { useIsMobile } from "@/hooks/use-mobile";

interface Stage {
  step: string;
  title: string;
  description: string;
}

const stages: Stage[] = [
  { step: "01", title: "Harvesting",     description: "Hand-harvested fresh potatoes from the red soil of the Nilgiri mountains at 7,000 ft elevation — where the cool climate produces the finest starch content." },
  { step: "02", title: "Washing",        description: "Triple-stage washing removes every trace of soil and debris, prepping each potato for inspection." },
  { step: "03", title: "Peeling",        description: "Gentle steam-peeling preserves the nutrient-rich layer just under the skin." },
  { step: "04", title: "Cutting",        description: "Precision blades cut uniform 9mm, 10mm and 11mm fries for consistent cooking." },
  { step: "05", title: "Blanching",      description: "A controlled hot-water bath sets colour, deactivates enzymes and locks in texture." },
  { step: "06", title: "Par-Frying",     description: "A short par-fry in pure vegetable oil creates the golden crust that crisps perfectly when reheated." },
  { step: "07", title: "De-oiling",      description: "Centrifugal de-oiling removes excess fat for a cleaner, lighter bite." },
  { step: "08", title: "Blast Freezing", description: "Rapid −35 °C blast freezing locks in flavour, texture and nutrients within minutes." },
  { step: "09", title: "Packaging",      description: "Food-grade barrier packaging in 500 g, 1 kg and 2.5 kg formats keeps every fry market-fresh." },
  { step: "10", title: "Logistics",      description: "Cold-chain dispatch across India ensures the fries reach you exactly as they left our facility." },
];

/**
 * ScrollStory — the ten-stage manufacturing flow.
 *
 * Media: each stage was a 3-5 MB animated GIF, 42.6 MB for the set. They are
 * now MP4/WebM clips behind poster frames that load nothing until scrolled to
 * (see StageVideo). Page weight on arrival is ten posters, ~320 KB.
 *
 * Layout:
 * - **Mobile / reduced motion:** a linear list of poster stills. Ten videos
 *   decoding at once is more than a mid-tier phone should be asked to do, and
 *   the stills carry the information perfectly well.
 * - **Desktop:** sticky visual column, scrolling captions, one clip playing at
 *   a time as its caption enters the viewport.
 */
export default function ScrollStory() {
  const isMobile = useIsMobile();
  const [reduce, setReduce] = useState(false);
  const [active, setActive] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (e: MediaQueryListEvent | MediaQueryList) => setReduce(e.matches);
    update(m);
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);

  const useLinear = reduce || isMobile;

  // Desktop: track which caption is centred, batched to one update per frame.
  useEffect(() => {
    if (useLinear) return;
    let raf = 0;
    let pending: number | null = null;

    const apply = () => {
      raf = 0;
      if (pending !== null) {
        setActive(pending);
        pending = null;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.isIntersecting) {
          pending = Number((best.target as HTMLElement).dataset.idx);
          if (!raf) raf = requestAnimationFrame(apply);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sectionRefs.current.forEach((el) => el && io.observe(el));
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [useLinear]);

  const jumpTo = useCallback((i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // ---------- Linear (mobile + reduced motion) ----------
  if (useLinear) {
    return (
      <section aria-label="Manufacturing process — ten stages" className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <ol className="space-y-10">
            {stages.map((s, i) => (
              <li
                key={s.step}
                className="space-y-4"
                style={{
                  contentVisibility: i > 1 ? ("auto" as const) : undefined,
                  containIntrinsicSize: "auto 480px",
                }}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/40 shadow-md">
                  <StageVideo
                    media={stageMedia[i]}
                    label={`${s.title} — stage ${s.step} of 10`}
                    staticOnly
                    eager={i < 2}
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 backdrop-blur-sm">
                    <span className="font-display text-2xs font-bold text-accent">
                      STAGE {s.step} / 10
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-body text-accent text-2xs tracking-[0.3em] uppercase mb-1">
                    Stage {s.step}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  // ---------- Desktop sticky split ----------
  const activeStage = stages[active];

  return (
    <section aria-label="Manufacturing process — ten stages" className="relative py-8 md:py-12">
      <nav
        aria-label="Jump to stage"
        className="hidden md:flex sticky top-24 z-20 mx-auto mb-8 w-fit items-center gap-1 rounded-full border border-border/40 bg-background/80 px-2 py-2 backdrop-blur-md shadow-sm"
      >
        {stages.map((s, i) => (
          <button
            key={s.step}
            onClick={() => jumpTo(i)}
            aria-label={`Jump to stage ${s.step}: ${s.title}`}
            aria-current={i === active ? "step" : undefined}
            className={`h-8 w-8 rounded-full text-2xs font-display font-bold transition-[background-color,color,transform] duration-base ease-out-expo focus-ring ${
              i === active
                ? "bg-accent text-accent-foreground scale-110"
                : "bg-transparent text-muted-foreground hover:bg-muted"
            }`}
          >
            {s.step}
          </button>
        ))}
      </nav>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Sticky visual column — only the active stage's clip is mounted, so
              exactly one video decodes at a time regardless of list length. */}
          <div className="lg:sticky lg:top-32 order-1">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/40 shadow-lg">
              <StageVideo
                key={active}
                media={stageMedia[active]}
                label={`${activeStage.title} — stage ${activeStage.step} of 10`}
                eager
              />
              <div className="absolute top-3 left-3 z-10 rounded-full bg-background/90 px-3 py-1 backdrop-blur-sm">
                <span className="font-display text-xs font-bold text-accent">
                  STAGE {activeStage.step} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Scrolling captions */}
          <div className="order-2">
            <ol className="space-y-stage-gap lg:space-y-stage-gap-lg pb-stage-min">
              {stages.map((s, i) => (
                <li
                  key={s.step}
                  data-idx={i}
                  ref={(el) => (sectionRefs.current[i] = el)}
                  className="min-h-stage-min flex flex-col justify-center"
                >
                  <ScrollStage>
                    <p className="font-body text-accent text-xs tracking-[0.3em] uppercase mb-2">
                      Stage {s.step}
                    </p>
                    <h3 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
                      {s.title}
                    </h3>
                    <p className="font-body text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                      {s.description}
                    </p>
                  </ScrollStage>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
