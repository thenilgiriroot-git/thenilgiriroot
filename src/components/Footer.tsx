import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { trackPhoneClick, trackEmailClick, trackCtaClick } from "@/lib/analytics";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-card/30" itemScope itemType="https://schema.org/Organization">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <img src="/logo.webp" alt="The Nilgiri Root - Premium Frozen French Fries Manufacturer India" width={180} height={84} loading="lazy" decoding="async" className="h-12 sm:h-14 w-auto" itemProp="logo" />
            <p className="text-muted-foreground text-xs sm:text-sm font-body leading-relaxed max-w-xs" itemProp="description">
              Premium frozen french fries crafted from the finest Nilgiri mountain potatoes.
              FSSAI certified. Available in 9mm, 10mm, 11mm cuts. From the hills of Nilgiri to your table.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-display text-base sm:text-lg text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {[
              { label: "Products", path: "/products" },
                { label: "Solutions", path: "/solutions" },
                { label: "Our Process", path: "/process" },
                { label: "Blog", path: "/blog" },
                { label: "FAQ", path: "/faq" },
                { label: "Certificates", path: "/certificates" },
                { label: "About Us", path: "/about" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors font-body rounded-sm focus-ring"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-display text-base sm:text-lg text-foreground">Contact</h4>
            <div className="flex flex-col gap-2 sm:gap-3">
              <a
                href="tel:+917539931361"
                onClick={() => trackPhoneClick({ buttonText: "+91 75399 31361", sourceSection: "footer", destination: "+917539931361" })}
                className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors font-body rounded-sm focus-ring"
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
                +91 75399 31361
              </a>
              <a
                href="mailto:admin@thenilgiriroot.com"
                onClick={() => trackEmailClick({ buttonText: "admin@thenilgiriroot.com", sourceSection: "footer", destination: "admin@thenilgiriroot.com" })}
                className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors font-body min-w-0 rounded-sm focus-ring"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
                <span className="truncate">admin@thenilgiriroot.com</span>
              </a>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground font-body">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent mt-0.5 shrink-0" />
                Sholur, The Nilgiris, Tamil Nadu, India - 643005
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-3 sm:space-y-4">
            <NewsletterForm
              variant="inline"
              sourceDetail="footer"
              heading="Stay in the loop"
              description="B2B updates, new SKUs and trade offers. Once a month, no spam."
            />
            <div className="pt-2">
              <Link
                to="/contact"
                onClick={() => trackCtaClick({ label: "Get In Touch", destination: "/contact", pageSource: "footer", section: "footer-cta" })}
                className="inline-block bg-accent/10 text-accent px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-body hover:bg-accent/20 transition-colors focus-ring"
              >
                Partner With Us →
              </Link>
            </div>
          </div>
        </div>

        {/* SEO landing-page links — keeps internal linking strong without bloating nav */}
        <div className="mt-10 pt-8 border-t border-border/20">
          <p className="font-display text-sm text-foreground/80 mb-3">Popular sourcing pages</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-2xs sm:text-xs font-body text-muted-foreground">
            {[
              { label: "Manufacturer in India", to: "/frozen-french-fries-manufacturer-in-india" },
              { label: "Manufacturer in Ooty", to: "/frozen-french-fries-manufacturer-in-ooty" },
              { label: "Near Coimbatore", to: "/frozen-french-fries-manufacturer-near-coimbatore" },
              { label: "Exporter India", to: "/frozen-french-fries-exporter-india" },
              { label: "HORECA supplier", to: "/frozen-french-fries-horeca-supplier" },
              { label: "QSR supplier", to: "/frozen-french-fries-qsr-supplier" },
              { label: "Distributor / Wholesale", to: "/frozen-french-fries-distributor-wholesale" },
              { label: "9mm", to: "/frozen-french-fries-9mm" },
              { label: "10mm", to: "/frozen-french-fries-10mm" },
              { label: "11mm", to: "/frozen-french-fries-11mm" },
              { label: "500g pack", to: "/frozen-french-fries-500g" },
              { label: "1kg pack", to: "/frozen-french-fries-1kg" },
              { label: "2.5kg pack", to: "/frozen-french-fries-2-5kg" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-accent transition-colors rounded-sm focus-ring">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Legal. Kept on its own row above the copyright line so the privacy
            controls are findable rather than buried — DPDP s.6(4) requires
            withdrawing consent to be as easy as giving it, which means the
            route to it cannot be harder to find than the banner was. */}
        <nav aria-label="Legal" className="mt-10 pt-8 border-t border-border/20">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-2xs sm:text-xs font-body">
            <li>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-accent transition-colors rounded-sm focus-ring">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-muted-foreground hover:text-accent transition-colors rounded-sm focus-ring">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/cookie-policy" className="text-muted-foreground hover:text-accent transition-colors rounded-sm focus-ring">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link to="/privacy-dashboard" className="text-accent hover:underline transition-colors rounded-sm focus-ring">
                Your Privacy Choices
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-2xs sm:text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} The Nilgiri Root. All rights reserved.
          </p>
          <p className="text-2xs sm:text-xs text-muted-foreground font-body">
            FSSAI License: 12426021000002
          </p>
        </div>
      </div>
    </footer>
  );
}
