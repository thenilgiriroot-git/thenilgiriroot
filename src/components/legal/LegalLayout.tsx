import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isTodo, LEGAL_ENTITY } from "@/data/legalEntity";

/**
 * Renders a value from the legal-entity config.
 *
 * Unfilled facts render as a loud inline marker rather than silently printing
 * "TODO: ..." as if it were the answer. The whole point is that nobody can
 * publish a policy that declares an invented registered name or retention
 * period — an incomplete policy should look incomplete.
 */
export function Fact({ value }: { value: string }) {
  if (isTodo(value)) {
    return (
      <mark
        className="rounded bg-destructive/15 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-destructive"
        title="This value must be supplied before publication"
      >
        [{value.replace(/^TODO:\s*/, "")}]
      </mark>
    );
  }
  return <>{value}</>;
}

interface Section {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  /** One-line summary shown under the title. */
  standfirst: string;
  sections: Section[];
  children: ReactNode;
}

/**
 * Shared chrome for the policy pages: title block, effective dates, a sticky
 * table of contents on desktop, and cross-links between the legal documents.
 */
export default function LegalLayout({ title, standfirst, sections, children }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  // Highlight the section currently in view in the table of contents.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <main className="bg-background px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl">
          <p className="font-body text-2xs uppercase tracking-[0.3em] text-muted-foreground">Legal</p>
          <h1 className="mt-3 font-display text-fluid-h1 font-bold text-balance text-foreground">{title}</h1>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground">{standfirst}</p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-5 font-body text-2xs">
            <div className="flex gap-2">
              <dt className="uppercase tracking-[0.14em] text-muted-foreground">Effective</dt>
              <dd className="text-foreground">
                <Fact value={LEGAL_ENTITY.effectiveDate} />
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="uppercase tracking-[0.14em] text-muted-foreground">Last updated</dt>
              <dd className="text-foreground">
                <Fact value={LEGAL_ENTITY.lastUpdated} />
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="uppercase tracking-[0.14em] text-muted-foreground">Governing law</dt>
              <dd className="text-foreground">India</dd>
            </div>
          </dl>
        </header>

        <div className="mt-12 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          {/* Table of contents */}
          <nav aria-label="On this page" className="mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-28">
              <p className="mb-3 font-body text-2xs uppercase tracking-[0.2em] text-muted-foreground">
                On this page
              </p>
              <ol className="flex flex-col gap-1 border-l border-border">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={activeId === s.id ? "true" : undefined}
                      className={`-ml-px block border-l-2 py-1.5 pl-4 font-body text-sm transition-colors duration-quick focus-ring ${
                        activeId === s.id
                          ? "border-accent text-accent"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          {/* Body. `prose` gives the long-form copy sane defaults; the max-width
              keeps line length readable at ~72 characters. */}
          <div
            className="prose prose-sm max-w-none font-body dark:prose-invert
              prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
              prose-h2:mt-14 prose-h2:scroll-mt-28 prose-h2:text-2xl
              prose-h3:mt-8 prose-h3:scroll-mt-28 prose-h3:text-lg
              prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-li:text-muted-foreground prose-li:leading-relaxed
              prose-strong:text-foreground
              prose-a:text-accent prose-a:underline-offset-2
              prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground
              prose-td:align-top"
          >
            {children}
          </div>
        </div>

        <footer className="mx-auto mt-20 max-w-3xl border-t border-border pt-8">
          <p className="mb-4 font-body text-2xs uppercase tracking-[0.2em] text-muted-foreground">
            Related documents
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-body text-sm">
            <li>
              <Link to="/privacy-policy" className="rounded-sm text-accent hover:underline focus-ring">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="rounded-sm text-accent hover:underline focus-ring">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/cookie-policy" className="rounded-sm text-accent hover:underline focus-ring">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link to="/privacy-dashboard" className="rounded-sm text-accent hover:underline focus-ring">
                Your Privacy Choices
              </Link>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
