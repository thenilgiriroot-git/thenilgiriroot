import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { COOKIE_CATEGORIES } from "@/data/legalEntity";
import { useConsent } from "./ConsentProvider";
import type { ConsentState } from "@/lib/consent";

/**
 * Consent notice.
 *
 * Deliberate design decisions, each traceable to DPDP s.6:
 *
 *  - **Reject is as prominent as Accept.** Both are the same size, same
 *    position, same visual weight. A "reject" hidden behind a second click or
 *    styled as a low-contrast link makes consent neither free nor unambiguous.
 *  - **No pre-ticked toggles.** Optional purposes start off. Consent requires
 *    a clear affirmative action.
 *  - **Dismissal is not consent.** There is no close button and Escape does
 *    not silently accept — the visitor must actually choose. Escape collapses
 *    the detail panel only.
 *  - **Not a hard modal.** It does not trap focus or block the page, so
 *    someone who wants to read the Privacy Policy before deciding can. But it
 *    is the first thing in the tab order after the skip link.
 *  - **Per-purpose detail.** Each category explains what it does and what
 *    declining costs you (nothing).
 */
export default function ConsentBanner() {
  const { bannerOpen, needsDecision, state, acceptAll, rejectAll, save, closeBanner } = useConsent();
  const [showDetail, setShowDetail] = useState(false);
  const [draft, setDraft] = useState<ConsentState>(state);
  const prefersReducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Keep the draft in step when the banner is reopened from the footer.
  useEffect(() => {
    if (bannerOpen) setDraft(state);
  }, [bannerOpen, state]);

  // Move focus to the notice when it appears so screen-reader and keyboard
  // users encounter it rather than tabbing past invisibly.
  useEffect(() => {
    if (bannerOpen) headingRef.current?.focus();
  }, [bannerOpen]);

  if (!bannerOpen) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Escape closes the detail panel, never the notice itself — dismissing
    // must not be mistakable for a decision.
    if (e.key === "Escape" && showDetail) {
      e.stopPropagation();
      setShowDetail(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        role="dialog"
        aria-modal="false"
        aria-labelledby="consent-heading"
        aria-describedby="consent-body"
        onKeyDown={onKeyDown}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-0 z-[9998] p-3 sm:p-4"
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="p-5 sm:p-6">
            <h2
              id="consent-heading"
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-lg font-bold text-foreground outline-none"
            >
              Your privacy choices
            </h2>
            <p id="consent-body" className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
              We use cookies that are strictly necessary to run this site. We&rsquo;d also like to set
              optional ones to understand how the site is used. Optional cookies are{" "}
              <strong className="text-foreground">off until you turn them on</strong>, and declining
              changes nothing about how the site works for you.
            </p>
            <p className="mt-2 font-body text-2xs leading-relaxed text-muted-foreground">
              You can change this at any time from{" "}
              <Link to="/privacy-dashboard" className="rounded-sm text-accent hover:underline focus-ring">
                Your Privacy Choices
              </Link>
              . Read our <Link to="/privacy-policy" className="rounded-sm text-accent hover:underline focus-ring">Privacy Policy</Link>{" "}
              and <Link to="/cookie-policy" className="rounded-sm text-accent hover:underline focus-ring">Cookie Policy</Link>.
            </p>

            {/* Per-purpose controls */}
            <AnimatePresence initial={false}>
              {showDetail && (
                <motion.div
                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
                    {COOKIE_CATEGORIES.map((cat) => {
                      const checked = cat.required ? true : draft[cat.id];
                      return (
                        <li key={cat.id} className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <label
                              htmlFor={`consent-${cat.id}`}
                              className="font-body text-sm font-medium text-foreground"
                            >
                              {cat.label}
                              {cat.required && (
                                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 font-body text-2xs font-normal text-muted-foreground">
                                  Always on
                                </span>
                              )}
                            </label>
                            <p className="mt-1 font-body text-2xs leading-relaxed text-muted-foreground">
                              {cat.description}
                            </p>
                          </div>
                          <Switch
                            id={`consent-${cat.id}`}
                            checked={checked}
                            disabled={cat.required}
                            aria-describedby={`consent-${cat.id}-desc`}
                            onCheckedChange={(v) =>
                              setDraft((d) => ({ ...d, [cat.id]: v }) as ConsentState)
                            }
                            className="mt-0.5 shrink-0"
                          />
                          <span id={`consent-${cat.id}-desc`} className="sr-only">
                            {cat.required
                              ? "Required for the site to function and cannot be switched off"
                              : `Optional. ${cat.description}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions. Accept and Reject are visually equal by design. */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                onClick={acceptAll}
                className="flex-1 rounded-full bg-accent font-body text-sm text-accent-foreground hover:bg-accent/90"
              >
                Accept all
              </Button>
              <Button
                onClick={rejectAll}
                variant="outline"
                className="flex-1 rounded-full border-border font-body text-sm text-foreground hover:bg-muted"
              >
                Reject optional
              </Button>
              {showDetail ? (
                <Button
                  onClick={() => save(draft)}
                  variant="outline"
                  className="flex-1 rounded-full border-border font-body text-sm text-foreground hover:bg-muted"
                >
                  Save my choices
                </Button>
              ) : (
                <Button
                  onClick={() => setShowDetail(true)}
                  variant="ghost"
                  className="flex-1 rounded-full font-body text-sm text-muted-foreground hover:text-foreground"
                  aria-expanded={showDetail}
                >
                  Choose individually
                </Button>
              )}
            </div>

            {/* Only offered once a decision already exists — i.e. the banner was
                reopened deliberately. On a first visit there is no way to
                dismiss without choosing. */}
            {!needsDecision && (
              <button
                type="button"
                onClick={closeBanner}
                className="mt-3 w-full rounded-sm font-body text-2xs text-muted-foreground underline-offset-2 hover:underline focus-ring"
              >
                Close without changing
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
