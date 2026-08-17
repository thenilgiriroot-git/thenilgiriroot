import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mountain, Droplets, Thermometer } from "lucide-react";
import nilgiriHills from "@/assets/nilgiri-hills-mist.webp";

const stats = [
  { icon: Mountain, label: "Altitude", value: "2,200m", desc: "Above sea level" },
  { icon: Thermometer, label: "Temperature", value: "5–20°C", desc: "Year-round cool" },
  { icon: Droplets, label: "Rainfall", value: "1,920mm", desc: "Annual average" },
];

export default function OriginSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-card"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">

          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[3/4] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
            <motion.img
              src={nilgiriHills}
              alt="Misty Nilgiri hills at golden hour with lush green tea plantations"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1 }}
              animate={isInView ? { scale: 1.12 } : { scale: 1 }}
              transition={{ duration: 18, ease: "linear" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent" />

            <motion.div
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-background/70 backdrop-blur-md rounded-xl px-4 py-3 border border-border/20"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <p className="font-display text-xl sm:text-2xl font-bold text-foreground">2,200m</p>
              <p className="font-body text-2xs sm:text-xs text-muted-foreground tracking-wide">Above Sea Level</p>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
                The Origin
              </p>
              <h2
                className="font-display font-bold text-foreground mb-4 sm:mb-6 leading-[1.15]"
                style={{ fontSize: "clamp(1.75rem, 4vw, 3.5rem)" }}
              >
                High-Altitude{" "}
                <span className="text-gradient-forest">Starch</span>
                <br />
                Advantage
              </h2>
            </motion.div>

            <motion.p
              className="font-body text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              Grown at over 2,200 metres in the cool, mist-laden Nilgiri hills,
              our potatoes develop a uniquely dense starch structure. The slow
              maturation in volcanic red soil and consistent cool temperatures
              produces tubers with lower sugar content and higher dry matter —
              the secret to a crispier, longer-lasting fry.
            </motion.p>

            <motion.p
              className="font-body text-muted-foreground/80 text-xs sm:text-sm leading-relaxed mb-8 sm:mb-10 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              This high-altitude advantage means less oil absorption during
              frying, a golden exterior that stays crisp, and a fluffy interior
              that melts on the tongue. It's not just a potato — it's terroir.
            </motion.p>

            <motion.div
              className="grid grid-cols-3 gap-3 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.55 }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-muted/50 rounded-xl p-3 sm:p-4 border border-border/30 text-center sm:text-left"
                >
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent mb-2 mx-auto sm:mx-0" />
                  <p className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="font-body text-2xs sm:text-xs text-muted-foreground">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
