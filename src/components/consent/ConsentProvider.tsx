import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_STATE,
  applyConsentToTags,
  commitConsent,
  readConsent,
  type ConsentRecord,
  type ConsentState,
} from "@/lib/consent";

interface ConsentContextValue {
  /** Null until the visitor has made a decision. */
  record: ConsentRecord | null;
  state: ConsentState;
  /** True when no valid decision exists, so the banner should be shown. */
  needsDecision: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (state: ConsentState, method?: ConsentRecord["method"]) => void;
  /** Re-open the banner so a decision can be revisited from anywhere. */
  reopen: () => void;
  bannerOpen: boolean;
  closeBanner: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside <ConsentProvider>");
  return ctx;
}

/**
 * Holds the visitor's consent decision and keeps the tag layer in step with it.
 *
 * Reads synchronously from localStorage on first render so a returning visitor
 * never sees the banner flash before their stored decision loads.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<ConsentRecord | null>(() => readConsent());
  const [manuallyOpened, setManuallyOpened] = useState(false);

  // Re-assert the stored decision on mount. The inline script in index.html
  // already did this for the tag layer; this covers anything that mounted
  // afterwards and keeps a single source of truth in React.
  useEffect(() => {
    if (record) applyConsentToTags(record.state);
  }, [record]);

  const value = useMemo<ConsentContextValue>(() => {
    const commit = (state: ConsentState, method: ConsentRecord["method"]) => {
      const next = commitConsent(state, method);
      setRecord(next);
      setManuallyOpened(false);
    };

    return {
      record,
      state: record?.state ?? DEFAULT_STATE,
      needsDecision: record === null,
      bannerOpen: record === null || manuallyOpened,
      acceptAll: () =>
        commit({ necessary: true, analytics: true, marketing: true }, "banner-accept-all"),
      rejectAll: () =>
        commit({ necessary: true, analytics: false, marketing: false }, "banner-reject-all"),
      save: (state, method = "banner-custom") => commit(state, method),
      reopen: () => setManuallyOpened(true),
      closeBanner: () => setManuallyOpened(false),
    };
  }, [record, manuallyOpened]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
