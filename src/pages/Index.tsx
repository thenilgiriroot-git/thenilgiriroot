import HeroSection from "@/components/home/HeroSection";
import OriginSection from "@/components/home/OriginSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";
import CTASection from "@/components/home/CTASection";
import SEOHead from "@/components/SEOHead";

export default function Index() {
  return (
    <main>
      <SEOHead
        title="Frozen French Fries Manufacturer in India | The Nilgiri Root"
        description="The Nilgiri Root is a frozen french fries manufacturer and supplier in India serving distributors, retailers, restaurants, QSRs and bulk buyers. FSSAI certified, blast frozen, 9mm/10mm/11mm cuts."
        keywords="frozen french fries manufacturer in India, frozen french fries supplier in India, bulk frozen french fries supplier, frozen french fries for restaurants, frozen fries for QSRs, food service frozen fries supplier, frozen fries supplier Tamil Nadu, export quality frozen french fries, frozen potato products manufacturer, FSSAI certified fries, Nilgiri potatoes, 9mm fries, 10mm fries, 11mm fries"
      />
      <HeroSection />
      <OriginSection />
      <WhyChooseUs />
      <WhatsAppCTA />
      <CTASection />
    </main>
  );
}
