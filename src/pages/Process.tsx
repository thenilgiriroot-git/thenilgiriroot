import ScrollStory from "@/components/home/ScrollStory";
import ScrollStage from "@/components/ScrollStage";
import SEOHead from "@/components/SEOHead";

export default function Process() {
  return (
    <main className="pt-24 pb-20">
      <SEOHead
        title="Our Process | Farm to Blast Freezer French Fries Manufacturing"
        description="Discover our 10-step premium french fries manufacturing process. From Nilgiri potato harvesting to blast freezing and packaging. FSSAI certified facility with state-of-the-art processing."
        keywords="french fries manufacturing process, blast freezing, frozen fries production, potato processing India, blanching french fries, frozen food manufacturing, FSSAI certified production, farm to freezer"
      />
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollStage>
          <header className="text-center mb-12">
            <p className="font-body text-accent text-sm tracking-[0.3em] uppercase mb-4">Farm to Blast Freezer</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Our <span className="text-gradient-golden">Manufacturing Process</span>
            </h1>
            <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
              Ten meticulous steps transform Nilgiri mountain potatoes into premium blast frozen french fries.
            </p>
          </header>
        </ScrollStage>
      </div>
      <ScrollStory />
    </main>
  );
}
