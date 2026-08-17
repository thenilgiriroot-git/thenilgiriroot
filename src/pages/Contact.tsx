import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollStage from "@/components/ScrollStage";
import SEOHead from "@/components/SEOHead";
import NewsletterForm from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  trackPhoneClick,
  trackEmailClick,
  trackWhatsAppClick,
  trackMapClick,
  trackContactFormSubmit,
} from "@/lib/analytics";

const MAPS_URL = "https://www.google.com/maps/place/FJJX%2B2G4+Sholur,+Tamil+Nadu,+India";
const PLUS_CODE_ADDRESS = "FJJX+2G4 Sholur, Tamil Nadu, India";

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: "https://thenilgiriroot.com/contact",
  name: "Contact Frozen French Fries Supplier in India | The Nilgiri Root",
  mainEntity: {
    "@type": "Organization",
    name: "The Nilgiri Root",
    telephone: "+91-75399-31361",
    email: "admin@thenilgiriroot.com",
    url: "https://thenilgiriroot.com",
    areaServed: { "@type": "Country", name: "India" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "FJJX+2G4 Sholur",
      addressLocality: "Sholur",
      addressRegion: "Tamil Nadu",
      postalCode: "643005",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-75399-31361",
      contactType: "sales",
      email: "admin@thenilgiriroot.com",
      areaServed: "IN",
      availableLanguage: ["English", "Tamil", "Hindi"],
    },
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thenilgiriroot.com" },
      { "@type": "ListItem", position: 2, name: "Contact", item: "https://thenilgiriroot.com/contact" },
    ],
  },
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.length > 100) errs.name = "Name must be under 100 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^[+\d\s()-]{7,20}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.length > 2000) errs.message = "Message must be under 2000 characters";
    if (form.company.length > 200) errs.company = "Company name too long";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot: if filled, silently reject
    if (form.website) return;
    if (!validate()) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-lead", {
        body: {
          source_type: "contact_form",
          source_detail: "contact_page",
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message: form.message,
          page_url: typeof window !== "undefined" ? window.location.href : "",
        },
      });
      if (error) throw error;
      trackContactFormSubmit("contact_page");
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", company: "", phone: "", email: "", message: "", website: "" });
      setErrors({});
    } catch (err) {
      console.error("contact submit failed", err);
      toast({
        title: "Could not send message",
        description: "Please try again or email admin@thenilgiriroot.com directly.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title="Contact Frozen French Fries Supplier in India | The Nilgiri Root"
        description="Contact The Nilgiri Root — frozen french fries manufacturer and supplier in India. Bulk orders for restaurants, QSRs, distributors and retailers. Call +91 75399 31361."
        keywords="contact frozen french fries supplier India, bulk frozen fries order, frozen fries manufacturer Tamil Nadu, frozen fries wholesale enquiry, FJJX+2G4 Sholur"
        jsonLd={contactJsonLd}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollStage>
          <header className="text-center mb-12 sm:mb-16 md:mb-20">
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">Get In Touch</p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Contact <span className="text-gradient-golden">Us</span>
            </h1>
            <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Talk to a frozen french fries manufacturer and supplier in India. We work with
              distributors, retailers, restaurants and QSRs on bulk orders and recurring supply.
              Browse <Link to="/solutions" className="text-accent hover:underline">our solutions</Link> or
              read the <Link to="/faq" className="text-accent hover:underline">FAQs</Link>.
            </p>
          </header>
        </ScrollStage>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Form */}
          <ScrollStage delay={100}>
            <form onSubmit={handleSubmit} className="glass-card p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-6" aria-label="Contact form" noValidate>
              {/* Honeypot — hidden from real users */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="name" className="font-body text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Name *</label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-muted/50 border-border/30 font-body rounded-xl text-sm"
                    placeholder="Your name"
                    maxLength={100}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && <p id="name-error" className="text-destructive text-xs mt-1 font-body">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="company" className="font-body text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Company</label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="bg-muted/50 border-border/30 font-body rounded-xl text-sm"
                    placeholder="Restaurant / Hotel / Company name"
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="phone" className="font-body text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Phone *</label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-muted/50 border-border/30 font-body rounded-xl text-sm"
                    placeholder="+91 XXXXX XXXXX"
                    maxLength={20}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && <p id="phone-error" className="text-destructive text-xs mt-1 font-body">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="font-body text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Email *</label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-muted/50 border-border/30 font-body rounded-xl text-sm"
                    placeholder="your@email.com"
                    maxLength={255}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && <p id="email-error" className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="message" className="font-body text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Message *</label>
                <Textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="bg-muted/50 border-border/30 font-body rounded-xl resize-none text-sm"
                  placeholder="Tell us about your bulk order requirements, quantity needed, delivery location..."
                  maxLength={2000}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message && <p id="message-error" className="text-destructive text-xs mt-1 font-body">{errors.message}</p>}
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body rounded-full py-5 sm:py-6 text-sm"
              >
                {sending ? "Sending..." : "Send Enquiry"}
              </Button>
            </form>
          </ScrollStage>

          {/* Info */}
          <ScrollStage delay={200}>
            <aside className="space-y-6 sm:space-y-8" aria-label="Contact information">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Reach Out Directly</h2>
                <address className="space-y-4 sm:space-y-5 not-italic">
                  <a
                    href="tel:+917539931361"
                    onClick={() => trackPhoneClick({ buttonText: "+91 75399 31361", sourceSection: "contact-page", destination: "+917539931361" })}
                    className="flex items-center gap-3 sm:gap-4 group"
                  >
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 group-hover:bg-accent/10 transition-colors shrink-0">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-body text-2xs sm:text-xs text-muted-foreground">Phone</p>
                      <p className="font-body text-sm sm:text-base text-foreground">+91 75399 31361</p>
                    </div>
                  </a>
                  <a
                    href="mailto:admin@thenilgiriroot.com"
                    onClick={() => trackEmailClick({ buttonText: "admin@thenilgiriroot.com", sourceSection: "contact-page", destination: "admin@thenilgiriroot.com" })}
                    className="flex items-center gap-3 sm:gap-4 group"
                  >
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 group-hover:bg-accent/10 transition-colors shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-2xs sm:text-xs text-muted-foreground">Email</p>
                      <p className="font-body text-sm sm:text-base text-foreground truncate">admin@thenilgiriroot.com</p>
                    </div>
                  </a>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackMapClick(MAPS_URL)}
                    className="flex items-center gap-3 sm:gap-4 group"
                    aria-label="Open The Nilgiri Root premises on Google Maps (FJJX+2G4 Sholur, Tamil Nadu, India)"
                  >
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 group-hover:bg-accent/10 transition-colors shrink-0">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-body text-2xs sm:text-xs text-muted-foreground">Premises</p>
                      <p className="font-body text-sm sm:text-base text-foreground group-hover:text-accent transition-colors inline-flex items-center gap-1.5">
                        {PLUS_CODE_ADDRESS}
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                      </p>
                      <p className="font-body text-2xs sm:text-xs text-muted-foreground mt-0.5">
                        Sholur, The Nilgiris, Tamil Nadu, India — 643005
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/917539931361"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick({ buttonText: "Chat with us on WhatsApp", sourceSection: "contact-page", destination: "https://wa.me/917539931361" })}
                    className="flex items-center gap-3 sm:gap-4 group"
                  >
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 group-hover:bg-accent/10 transition-colors shrink-0">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-accent" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-body text-2xs sm:text-xs text-muted-foreground">WhatsApp</p>
                      <p className="font-body text-sm sm:text-base text-foreground">Chat with us on WhatsApp</p>
                    </div>
                  </a>
                </address>
              </div>

              {/* Map */}
              <div className="glass-card p-1 rounded-2xl overflow-hidden">
                <iframe
                  title="The Nilgiri Root manufacturing premises — FJJX+2G4 Sholur, Tamil Nadu, India"
                  src="https://www.google.com/maps?q=FJJX%2B2G4%20Sholur%20Tamil%20Nadu%20India&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                />
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs font-body text-accent hover:underline py-2"
                >
                  Open in Google Maps →
                </a>
              </div>
            </aside>
          </ScrollStage>
        </div>

        <ScrollStage delay={300}>
          <div className="max-w-3xl mx-auto mt-16 sm:mt-20">
            <NewsletterForm
              variant="card"
              sourceDetail="contact_page"
              heading="Subscribe for trade updates"
              description="Get B2B updates, new SKU launches and exclusive trade offers — once a month."
            />
          </div>
        </ScrollStage>
      </div>
    </main>
  );
}
