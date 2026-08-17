import { useState } from "react";
import ScrollStage from "@/components/ScrollStage";
import SEOHead from "@/components/SEOHead";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";
import { UtensilsCrossed, Snowflake } from "lucide-react";
import product9mm from "@/assets/product-classic-6mm.webp";
import product10mm from "@/assets/product-classic-8mm.webp";
import product11mm from "@/assets/product-classic-9mm.webp";
import plated9mm from "@/assets/product-6mm-plated.webp";
import plated10mm from "@/assets/product-8mm-plated.webp";
import plated11mm from "@/assets/product-9mm-plated.webp";

const products = [
  {
    name: "Classic Cut 9mm",
    subtitle: "Crisp & Quick",
    description:
      "A clean, balanced fry built for fast service. Crisp exterior, fluffy centre, and uniform colour straight from the blast freezer.",
    weights: ["500g", "1kg", "2.5kg"],
    features: ["Quick Cook", "Uniform Size", "QSR Favourite"],
    image: product9mm,
    plated: plated9mm,
    servingSuggestion: "Pair with smoked paprika aioli and ketchup on a slate board",
  },
  {
    name: "Classic Cut 10mm",
    subtitle: "The All-Rounder",
    description:
      "Our most versatile cut. Ideal balance of crisp shell and tender centre — equally at home in cafes, casual dining, and home kitchens.",
    weights: ["500g", "1kg", "2.5kg"],
    features: ["Balanced Texture", "Versatile", "Most Popular"],
    image: product10mm,
    plated: plated10mm,
    servingSuggestion: "Serve with herb butter and truffle mayo on rustic wood",
  },
  {
    name: "Classic Cut 11mm",
    subtitle: "Steakhouse Style",
    description:
      "A thick, hearty cut with a satisfying crunch and rich potato character — built for premium plates and signature platters.",
    weights: ["500g", "1kg", "2.5kg"],
    features: ["Steakhouse Style", "Hearty", "Premium Plate"],
    image: product11mm,
    plated: plated11mm,
    servingSuggestion: "Loaded with cheese sauce, bacon and chives in a cast iron skillet",
  },
];

function ProductCard({ product, index }: { product: (typeof products)[0]; index: number }) {
  const [showPlated, setShowPlated] = useState(false);

  return (
    <ScrollStage delay={index * 150}>
      <article
        className="group relative rounded-2xl border-2 border-transparent hover:border-accent/40 bg-card/60 backdrop-blur-sm transition-all duration-500 hover:shadow-[0_8px_40px_-12px_hsl(var(--accent)_/_0.2)] hover:-translate-y-2 overflow-hidden"
        itemScope
        itemType="https://schema.org/Product"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={`${product.name} frozen french fries — premium blast frozen`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
            style={{ opacity: showPlated ? 0 : 1 }}
            loading="lazy"
            width={400}
            height={300}
            itemProp="image"
          />
          <img
            src={product.plated}
            alt={`${product.name} serving suggestion — crispy golden fries`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
            style={{ opacity: showPlated ? 1 : 0 }}
            loading="lazy"
            width={400}
            height={300}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          <button
            onClick={() => setShowPlated(!showPlated)}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-2xs sm:text-xs font-body font-medium transition-all duration-300 backdrop-blur-md ${
              showPlated
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30"
                : "bg-background/60 text-foreground/80 hover:bg-background/80 border border-border/30"
            }`}
            aria-label={showPlated ? "Show frozen product" : "Show serving suggestion"}
          >
            {showPlated ? (
              <>
                <Snowflake className="h-3 w-3" aria-hidden="true" />
                Frozen
              </>
            ) : (
              <>
                <UtensilsCrossed className="h-3 w-3" aria-hidden="true" />
                Serving Idea
              </>
            )}
          </button>

          <div
            className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 transition-all duration-500"
            style={{
              opacity: showPlated ? 1 : 0,
              transform: showPlated ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <p className="text-2xs sm:text-xs font-body text-foreground/90 bg-background/60 backdrop-blur-md rounded-lg px-3 py-2 border border-border/20">
              🍽️ {product.servingSuggestion}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 md:p-8">
          <p className="font-body text-accent text-2xs sm:text-xs tracking-[0.25em] uppercase mb-1.5">
            {product.subtitle}
          </p>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3" itemProp="name">
            {product.name}
          </h2>
          <p className="font-body text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed" itemProp="description">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
            {product.features.map((f) => (
              <span
                key={f}
                className="text-2xs sm:text-xs font-body px-2.5 sm:px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {product.weights.map((w) => (
              <span
                key={w}
                className="text-2xs sm:text-xs font-body px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border/50 text-muted-foreground"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </article>
    </ScrollStage>
  );
}

const productsJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "The Nilgiri Root French Fries Products",
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      description: p.description,
      brand: { "@type": "Brand", name: "The Nilgiri Root" },
      category: "Frozen French Fries",
    },
  })),
};

export default function Products() {
  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title="Premium Frozen French Fries — 9mm, 10mm, 11mm Cuts"
        description="Buy premium frozen french fries in 9mm, 10mm, and 11mm cuts. 100% Nilgiri mountain potatoes, blast frozen for peak freshness. Available in 500g, 1kg, 2.5kg packs."
        keywords="buy frozen french fries, 9mm french fries, 10mm french fries, 11mm french fries, blast frozen french fries, bulk frozen fries"
        jsonLd={productsJsonLd}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollStage>
          <header className="text-center mb-12 sm:mb-16 md:mb-20">
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
              Our Range
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Premium <span className="text-gradient-forest">French Fries</span> Products
            </h1>
            <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Three distinct cuts, each crafted for a unique culinary experience.
              All made from 100% Nilgiri mountain potatoes and locked in by our blast freezing process.
            </p>
          </header>
        </ScrollStage>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8" aria-label="Product catalog">
          {products.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </section>
      </div>

      <WhatsAppCTA
        pageSource="products"
        heading="Order your variants in"
        subheading="Pick the cuts you need (9mm, 10mm, 11mm) and we'll pre-fill the WhatsApp message for you."
      />
    </main>
  );
}
