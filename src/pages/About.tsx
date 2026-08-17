import ScrollStage from "@/components/ScrollStage";
import SEOHead from "@/components/SEOHead";
import {
  Heart,
  Target,
  Eye,
  Sprout,
  ShieldCheck,
  Truck,
  Handshake,
  Factory,
  Users,
} from "lucide-react";
import storyFarmImg from "@/assets/about-story-farm.webp";
import processingImg from "@/assets/about-processing-facility.webp";
import visionLandscapeImg from "@/assets/about-vision-landscape.webp";

const values = [
  {
    icon: Heart,
    title: "Our Story",
    image: storyFarmImg,
    imageAlt:
      "Locally sourced potatoes from the Nilgiri hills — raw material for The Nilgiri Root frozen french fries manufactured in India",
    content:
      "The Nilgiri Root began with a simple conviction — that locally grown vegetables can become world-class value added farm products when handled with care and consistency. Rooted in the farming ecosystem of the Nilgiris, we work closely with growers around us, source produce at its peak, and process it into reliable, modern food products that fit the way kitchens cook today. Our work is rooted in the soil it comes from and built for the markets it serves.",
  },
  {
    icon: Target,
    title: "Our Mission",
    image: processingImg,
    imageAlt:
      "Premium frozen french fries on a stainless steel processing line at The Nilgiri Root — farm-to-freezer manufacturing facility in Tamil Nadu, India",
    content:
      "To carry the freshness of the Nilgiri harvest from field to freezer in a single, uninterrupted journey — and to set the standard for premium, value added farm products in India. Within hours of being lifted from the soil, our potatoes are washed, cut, blanched, par-fried and blast frozen on a tightly controlled, FSSAI-certified line. Every batch is built around the same disciplines that great kitchens demand: clean ingredients, repeatable craft, and a finish that performs the same in Coimbatore, Mumbai or beyond.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    image: visionLandscapeImg,
    imageAlt:
      "Nilgiri mountains in Tamil Nadu — sourcing region for The Nilgiri Root frozen french fries supplied across India",
    content:
      "To be one of India's most trusted value added farm product brands — recognised globally for quality, consistency, and a clear connection to the land we grow on.",
  },
];

const whyChooseUs = [
  {
    icon: Sprout,
    title: "Farm to Table Approach",
    content:
      "We work directly within the Nilgiri farming ecosystem so every batch carries a clear path from field to finished product.",
  },
  {
    icon: Truck,
    title: "Consistent Supply",
    content:
      "Planned sourcing and steady production cycles let us deliver reliably, week after week, across regions and order sizes.",
  },
  {
    icon: Factory,
    title: "Quality-Focused Processing",
    content:
      "Our blast freezing line and process controls protect texture, colour and taste from the moment produce enters the facility.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Manufacturing Standards",
    content:
      "FSSAI-certified production with documented controls at every stage — built to satisfy serious B2B partners.",
  },
  {
    icon: Sprout,
    title: "Locally Sourced Raw Materials",
    content:
      "Produce is sourced from farms around the Nilgiris, supporting the regional agricultural economy and preserving freshness.",
  },
  {
    icon: Handshake,
    title: "Customer-Focused Service",
    content:
      "Clear communication, honest timelines and tailored support for every distributor, retailer and HoReCa partner we work with.",
  },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  mainEntity: {
    "@type": "Organization",
    name: "The Nilgiri Root",
    founder: { "@type": "Person", name: "Sowmiya Moorthy", jobTitle: "Founder & Managing Director" },
    foundingDate: "2023",
    description:
      "The Nilgiri Root transforms locally grown vegetables into world-class value added farm products from the Nilgiri mountains of Tamil Nadu, India.",
  },
};

export default function About() {
  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title="About The Nilgiri Root | Frozen French Fries Manufacturer in India"
        description="About The Nilgiri Root — a frozen french fries manufacturer and supplier in India. FSSAI certified, locally sourced from the Nilgiris of Tamil Nadu, founded by Sowmiya Moorthy."
        keywords="about The Nilgiri Root, frozen french fries manufacturer India, frozen fries supplier Tamil Nadu, value added farm products, Nilgiri food manufacturer, Sowmiya Moorthy"
        jsonLd={aboutJsonLd}
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20" aria-labelledby="about-title">
        <div className="absolute inset-0">
          <img
            src={visionLandscapeImg}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(152_39%_18%_/_0.15),_transparent_50%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollStage>
            <header className="text-center max-w-3xl mx-auto">
              <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
                Our Identity
              </p>
              <h1
                id="about-title"
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6"
              >
                About <span className="text-gradient-forest">The Nilgiri Root</span>
              </h1>
              <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
                Locally grown vegetables, transformed into value added farm products —
                with care, consistency, and a clear sense of where they come from.
              </p>
            </header>
          </ScrollStage>
        </div>
      </section>

      {/* Story / Mission / Vision */}
      <section className="py-10 sm:py-12 md:py-16" aria-label="Company values and story">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {values.map((v, i) => (
            <ScrollStage key={v.title} delay={100}>
              <article
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
                } items-center gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16 md:mb-20`}
              >
                <div className="img-cinematic-frame relative rounded-2xl overflow-hidden aspect-[16/9] shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.25)] border border-border/30">
                  <img
                    src={v.image}
                    alt={v.imageAlt}
                    loading="lazy"
                    decoding="async"
                    width={1600}
                    height={900}
                    className="img-cinematic absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div>
                  <div className="p-3 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 inline-block mb-4 sm:mb-5">
                    <v.icon className="h-6 w-6 sm:h-8 sm:w-8 text-accent" aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                    {v.title}
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                    {v.content}
                  </p>
                </div>
              </article>
            </ScrollStage>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
        aria-labelledby="why-choose-title"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--accent)_/_0.05),_transparent_70%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
          <ScrollStage>
            <header className="text-center mb-10 sm:mb-14">
              <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
                Why Choose Us
              </p>
              <h2
                id="why-choose-title"
                className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4"
              >
                Built for Retail, HoReCa and Distribution Partners
              </h2>
              <p className="font-body text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                From farm to table, we focus on quality, consistency and reliable supply — backed by
                locally sourced raw materials and a process-driven production line.
              </p>
            </header>
          </ScrollStage>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {whyChooseUs.map((item, i) => (
              <ScrollStage key={item.title} delay={i * 80}>
                <article className="glass-card p-5 sm:p-6 md:p-7 h-full">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 border border-primary/20 inline-block mb-3 sm:mb-4">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {item.content}
                  </p>
                </article>
              </ScrollStage>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-12 sm:py-16 md:py-20" aria-labelledby="founder-title">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollStage>
            <article
              className="glass-card p-6 sm:p-8 md:p-12 max-w-3xl mx-auto text-center"
              itemScope
              itemType="https://schema.org/Person"
            >
              <div className="p-3 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 inline-block mb-4 sm:mb-6">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-accent" aria-hidden="true" />
              </div>
              <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
                Leadership
              </p>
              <h2
                id="founder-title"
                className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2"
                itemProp="name"
              >
                Sowmiya Moorthy
              </h2>
              <p className="font-body text-accent text-xs sm:text-sm mb-4 sm:mb-6" itemProp="jobTitle">
                Founder & Managing Director
              </p>
              <p
                className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed"
                itemProp="description"
              >
                Our leadership is driven by a clear vision — to bring world class value added farm
                products to market by combining the strength of local sourcing, disciplined processing,
                and a long-term commitment to quality. Every decision, from the farms we partner with
                to the freezers we run, is shaped by that intent.
              </p>
            </article>
          </ScrollStage>
        </div>
      </section>
    </main>
  );
}
