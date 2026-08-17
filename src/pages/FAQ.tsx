import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollStage from "@/components/ScrollStage";
import SEOHead from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { trackFaqExpand } from "@/lib/analytics";

const faqs = [
  {
    q: "What types of frozen french fries do you supply?",
    a: "The Nilgiri Root manufactures premium blast frozen french fries in three classic cut sizes — 9mm (crisp & quick), 10mm (the all-rounder) and 11mm (steakhouse style). Each cut is available in 500g, 1kg and 2.5kg packs as well as bulk catering formats for distributors, restaurants and QSRs.",
  },
  {
    q: "Do you supply bulk frozen french fries in India?",
    a: "Yes. We are a frozen french fries manufacturer and supplier in India serving bulk B2B buyers nationwide. We accept large repeat orders, planned monthly volumes and one-off project orders. Use our Request Quote flow or visit the Contact page to share your requirement.",
  },
  {
    q: "Do you supply restaurants, QSRs and distributors?",
    a: "We work with restaurants, QSR chains, hotels, cloud kitchens, caterers, modern retailers and regional distributors across India. Our Solutions page outlines tailored supply support for each of these segments.",
  },
  {
    q: "What storage conditions are required for frozen fries?",
    a: "Our frozen french fries should be stored at -18°C or colder in a sealed pack until use. Do not refreeze after thawing. Maintaining an unbroken cold chain protects the texture, colour and shelf life of the product.",
  },
  {
    q: "Are your products suitable for food service businesses?",
    a: "Yes. Our fries are FSSAI certified, blast frozen for consistent texture, and engineered to deliver a uniform fry across batches — exactly what food service operations need for predictable kitchen output.",
  },
  {
    q: "Can I enquire for regular monthly supply?",
    a: "Absolutely. We are set up for steady, recurring supply cycles. Share your monthly volume estimate and delivery region through our Contact page and our team will respond with pricing, lead times and dispatch schedules.",
  },
  {
    q: "Do you handle bulk business orders for QSRs and chains?",
    a: "Yes — bulk and chain accounts are a core part of our business. We can scope packaging format, palletisation, lead times and dispatch frequency around your operational needs.",
  },
  {
    q: "Do you support distributor and retail enquiries?",
    a: "Yes. We actively onboard regional distributors and modern retail partners across India. Visit our Solutions page for distributor and retailer programmes.",
  },
  {
    q: "What certifications and quality standards do you follow?",
    a: "The Nilgiri Root operates under FSSAI License No. 12426021000002. Our processing line follows documented hygiene and quality controls, with batch-level traceability from raw potato sourcing through blast freezing and packaging.",
  },
  {
    q: "How can I contact The Nilgiri Root for an enquiry?",
    a: "You can reach us at +91 75399 31361, email admin@thenilgiriroot.com, or message us on WhatsApp. The Contact page also has a structured enquiry form for bulk and business orders.",
  },
  {
    q: "Where is The Nilgiri Root located?",
    a: "Our manufacturing premises are located at FJJX+2G4 Sholur, Tamil Nadu, India — in the Nilgiri hills. The Contact page has a clickable Google Maps link to the exact location.",
  },
  {
    q: "Do you supply export-quality frozen french fries?",
    a: "Yes. Our products are produced to export-grade standards. For international enquiries, please reach out via the Contact page with your destination market, volume and certification requirements.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://thenilgiriroot.com" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://thenilgiriroot.com/faq" },
  ],
};

export default function FAQ() {
  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title="Frozen French Fries FAQs | The Nilgiri Root"
        description="Find answers about frozen french fries supply, bulk orders, storage, product types, distribution and business enquiries at The Nilgiri Root."
        keywords="frozen french fries FAQ, bulk frozen fries India, frozen fries supplier questions, QSR frozen fries, distributor frozen fries"
        jsonLd={{ "@graph": [faqJsonLd, breadcrumbJsonLd] }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <ScrollStage>
          <header className="text-center mb-10 sm:mb-14">
            <div className="p-3 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 inline-block mb-4 sm:mb-6">
              <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-accent" aria-hidden="true" />
            </div>
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
              Buyer Help Centre
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Frequently Asked <span className="text-gradient-forest">Questions</span>
            </h1>
            <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Common questions from distributors, retailers, restaurants, QSRs and food service buyers
              about our frozen french fries supply across India.
            </p>
          </header>
        </ScrollStage>

        <ScrollStage delay={100}>
          <Accordion
            type="single"
            collapsible
            onValueChange={(value) => {
              // Fires only on open (value="") on close
              if (!value) return;
              const idx = Number(value.replace("item-", ""));
              const q = faqs[idx]?.q;
              if (q) trackFaqExpand(q);
            }}
            className="glass-card p-2 sm:p-4 md:p-6 rounded-2xl"
          >
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/30">
                <AccordionTrigger className="font-display text-left text-base sm:text-lg text-foreground hover:text-accent px-2 sm:px-4">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed px-2 sm:px-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollStage>

        <ScrollStage delay={200}>
          <aside className="mt-10 sm:mt-14 text-center glass-card p-6 sm:p-8 rounded-2xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
              Didn't find your answer?
            </h2>
            <p className="font-body text-muted-foreground text-sm sm:text-base mb-5 max-w-xl mx-auto">
              Our team is happy to help with bulk order, distribution and food service enquiries.
              Explore <Link to="/solutions" className="text-accent hover:underline">tailored solutions</Link> or
              get in touch directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-body text-sm hover:bg-accent/90 transition-colors"
              >
                Contact Sales
              </Link>
              <Link
                to="/solutions"
                className="border border-border/50 text-foreground px-6 py-3 rounded-full font-body text-sm hover:bg-muted transition-colors"
              >
                View Solutions
              </Link>
            </div>
          </aside>
        </ScrollStage>
      </div>
    </main>
  );
}
