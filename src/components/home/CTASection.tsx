import { Link } from "react-router-dom";
import ScrollStage from "@/components/ScrollStage";
import { trackCtaClick, trackWhatsAppClick } from "@/lib/analytics";

export default function CTASection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-background to-background" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollStage>
          <div className="text-center max-w-3xl mx-auto">
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-4 sm:mb-6">
              Let's Grow Together
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Ready to Partner <br />
              <span className="text-gradient-forest">With Us?</span>
            </h2>
            <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg mb-8 sm:mb-10 leading-relaxed">
              Join our growing network of distributors, retailers, restaurants and QSRs across India.
              Experience the premium quality of The Nilgiri Root — a frozen french fries manufacturer
              and supplier in India built for serious B2B buyers. Explore tailored{" "}
              <Link to="/solutions" className="text-accent hover:underline">solutions</Link> for your
              business or browse our <Link to="/faq" className="text-accent hover:underline">FAQs</Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/contact"
                onClick={() => trackCtaClick({ label: "Partner With Us", destination: "/contact", pageSource: "home", section: "footer-cta" })}
                className="bg-accent text-accent-foreground px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-body text-sm font-medium hover:bg-accent/90 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
              >
                Partner With Us
              </Link>
              <a
                href="https://wa.me/917539931361"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick({ buttonText: "WhatsApp Us", sourceSection: "home-footer-cta", destination: "https://wa.me/917539931361" })}
                className="border border-border/50 text-foreground px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-body text-sm font-medium hover:bg-muted transition-all duration-300"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </ScrollStage>
      </div>
    </section>
  );
}
