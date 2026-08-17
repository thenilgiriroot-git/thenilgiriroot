import { useState } from "react";
import ScrollStage from "@/components/ScrollStage";
import SEOHead from "@/components/SEOHead";
import { FileCheck, X, ExternalLink } from "lucide-react";

export default function Certificates() {
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title="FSSAI Certificate | Food Safety Certified French Fries"
        description="View The Nilgiri Root's FSSAI certification. License No: 12426021000002. We are a certified food business operator under the Food Safety and Standards Act, 2006. Safe, hygienic frozen fries."
        keywords="FSSAI certified french fries, food safety certificate India, frozen food certification, FSSAI license frozen fries, certified frozen food manufacturer, food safety standards India" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollStage>
          <header className="text-center mb-12 sm:mb-16 md:mb-20">
            <p className="font-body text-accent text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
              Trust & Quality
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Our <span className="text-gradient-golden">Certificates</span>
            </h1>
            <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Certified quality and food safety at every stage of production.
            </p>
          </header>
        </ScrollStage>

        {/* FSSAI License — single featured card */}
        <ScrollStage>
          <section className="max-w-2xl mx-auto" aria-label="FSSAI Certification">
            <article
              className="glass-card p-6 sm:p-8 md:p-10 glow-golden border-accent/20 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
              onClick={() => setPdfOpen(true)}
              itemScope
              itemType="https://schema.org/GovernmentService"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPdfOpen(true)}
              aria-label="View FSSAI certificate">
              
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 rounded-xl bg-accent/10 shrink-0">
                  <FileCheck className="h-6 w-6 sm:h-8 sm:w-8 text-accent" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground" itemProp="name">
                      FSSAI License
                    </h2>
                    <span className="text-2xs sm:text-xs font-body px-2 py-0.5 rounded-full bg-accent/20 text-accent uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <p className="font-body text-xs sm:text-sm text-accent mb-1">
                    <strong>License No:</strong> <span itemProp="identifier">12426021000002</span>
                  </p>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground mb-3">
                    <strong>Valid:</strong> 14-01-2026 to 13-01-2027
                  </p>
                  <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed" itemProp="description">
                    Licensed food business operator under the Food Safety and Standards Act, 2006. 
                    Our facility meets all FSSAI requirements for hygienic frozen food production.
                  </p>
                  <p className="font-body text-xs text-muted-foreground/60 mt-3">
                    Issued by: Food Safety and Standards Authority of India
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-accent">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <p className="font-body text-xs sm:text-sm hover:underline">
                      Click to view certificate
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </ScrollStage>
      </div>

      {/* PDF Modal */}
      {pdfOpen &&
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6"
        onClick={() => setPdfOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="FSSAI License Certificate">
        
          <div
          className="relative w-full max-w-4xl h-[80vh] sm:h-[85vh] glass-card overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          
            <button
            onClick={() => setPdfOpen(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Close certificate viewer">
            
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            </button>
            <iframe
            src="/fssai-license.pdf"
            className="w-full h-full"
            title="FSSAI License Certificate - The Nilgiri Root - License No: 12426021000002" />
          
          </div>
        </div>
      }
    </main>);

}