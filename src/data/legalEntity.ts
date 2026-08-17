/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ACTION REQUIRED BEFORE LAUNCH
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for every organisation-specific fact that appears in
 * the Privacy Policy, Terms, Cookie Policy and consent flows.
 *
 * Values marked `TODO` are facts about your company and your operations that
 * cannot be derived from the codebase and MUST NOT be guessed — an invented
 * registered name, retention period or grievance officer would be a false
 * statutory declaration, not a placeholder. They are typed as `TodoValue` so
 * they render as an obvious, unmissable marker on the page until replaced.
 *
 * Run `npm run legal:check` to list everything still outstanding.
 *
 * Values already filled in were taken from existing site content (schema.org
 * markup in index.html, the footer, and the FSSAI licence) — please still
 * verify them against your incorporation documents.
 *
 * NOTHING HERE HAS BEEN REVIEWED BY A LAWYER. The drafting is a technically
 * competent starting point that tracks the DPDP Act, 2023 and the Draft DPDP
 * Rules, 2025 — it is not legal advice and must be reviewed by qualified
 * Indian counsel before publication.
 */

/** Marker type for facts that must be supplied before launch. */
export type TodoValue = `TODO:${string}`;

export const isTodo = (v: string): v is TodoValue => v.startsWith("TODO:");

export interface LegalEntity {
  /** Trading name as used publicly. */
  tradingName: string;
  /** Full registered legal name, e.g. "Nilgiri Root Foods Private Limited". */
  registeredName: string | TodoValue;
  /** "Private Limited Company", "LLP", "Sole Proprietorship", … */
  entityType: string | TodoValue;
  /** CIN / LLPIN, or registration number for a proprietorship. */
  registrationNumber: string | TodoValue;
  gstin: string | TodoValue;
  fssaiLicence: string;

  registeredAddress: string | TodoValue;
  operationalAddress: string;

  websiteUrl: string;
  generalEmail: string;
  phone: string;

  /**
   * DPDP Act s.13 requires a Data Fiduciary to publish the contact details of
   * the person able to answer Data Principals' questions about processing.
   * A named individual is required — a role mailbox alone is not sufficient.
   */
  grievanceOfficer: {
    name: string | TodoValue;
    designation: string | TodoValue;
    email: string;
    phone: string | TodoValue;
    postalAddress: string | TodoValue;
    /** Statutory maximum response window you commit to, in days. */
    responseDays: number;
  };

  /**
   * A Data Protection Officer is mandatory only for a Significant Data
   * Fiduciary (DPDP Act s.10), which the Central Government designates based
   * on volume and sensitivity of data, risk to Data Principals, and other
   * factors. Most B2B marketing sites are NOT significant data fiduciaries.
   * Confirm your status with counsel and set this accordingly.
   */
  isSignificantDataFiduciary: boolean;
  dataProtectionOfficer: {
    appointed: boolean;
    name: string | TodoValue;
    email: string | TodoValue;
  };

  /** Courts with exclusive jurisdiction, e.g. "Coimbatore, Tamil Nadu". */
  jurisdiction: string | TodoValue;

  /** ISO date these documents take effect. */
  effectiveDate: string | TodoValue;
  lastUpdated: string | TodoValue;
}

export const LEGAL_ENTITY: LegalEntity = {
  tradingName: "The Nilgiri Root",
  registeredName: "TODO: full registered legal name from your Certificate of Incorporation",
  entityType: "TODO: Private Limited / LLP / Partnership / Sole Proprietorship",
  registrationNumber: "TODO: CIN, LLPIN or firm registration number",
  gstin: "TODO: GSTIN",
  fssaiLicence: "12426021000002",

  registeredAddress: "TODO: registered office address as filed with the MCA",
  operationalAddress: "FJJX+2G4 Sholur, Sholur, The Nilgiris, Tamil Nadu 643005, India",

  websiteUrl: "https://thenilgiriroot.com",
  generalEmail: "admin@thenilgiriroot.com",
  phone: "+91 75399 31361",

  grievanceOfficer: {
    name: "Sowmiya Moorthy",
    designation: "TODO: their designation — the site's Organization schema already lists them as Founder; confirm whether that is the title to publish here",
    email: "contact@thenilgiriroot.com",
    phone: "TODO: direct contact number (the general line +91 75399 31361 is acceptable if monitored for grievances)",
    postalAddress: "TODO: postal address for written grievances (the Sholur operational address is acceptable if post is received there)",
    responseDays: 30,
  },

  isSignificantDataFiduciary: false,
  dataProtectionOfficer: {
    appointed: false,
    name: "TODO: only required if designated a Significant Data Fiduciary",
    email: "TODO: only required if designated a Significant Data Fiduciary",
  },

  jurisdiction: "TODO: courts of <city>, Tamil Nadu",

  effectiveDate: "TODO: YYYY-MM-DD the policies go live",
  lastUpdated: "TODO: YYYY-MM-DD",
};

/**
 * Processing activities register (RoPA).
 *
 * DPDP does not mandate a RoPA for every fiduciary the way GDPR Art.30 does,
 * but you cannot demonstrate purpose limitation, answer an access request, or
 * respond to a Board enquiry without one. It also drives the consent UI and
 * the Privacy Policy tables, so the published policy can never drift from what
 * the code actually does.
 *
 * Retention periods below were set by the business on 2026-08-16. They are a
 * commercial and statutory decision, so if tax (Income Tax Act) or food-safety
 * (FSSAI) record-keeping obligations require longer for any category, these
 * must be revised upward — the published policy is a commitment, and keeping
 * data beyond the period stated here would breach it.
 *
 * Two of these are only true if a system setting matches:
 *   - analytics "14 months" must equal the Data Retention setting on the GA4
 *     property (Admin -> Data Settings -> Data Retention). GA4's default is
 *     14 months, but verify it, because the policy now states it as fact.
 *   - the 24-month and 90-day periods need a deletion job; nothing currently
 *     enforces them automatically. See COMPLIANCE-HANDOVER.md.
 */
export interface ProcessingActivity {
  id: string;
  purpose: string;
  /** Categories of personal data, in plain language. */
  dataCategories: string[];
  /** DPDP s.6 consent, or s.7 "certain legitimate uses". */
  lawfulBasis: "consent" | "legitimate-use";
  lawfulBasisNote: string;
  retention: string | TodoValue;
  /** Third parties (Data Processors) involved. */
  recipients: string[];
  /** Whether data leaves India for this activity. */
  crossBorder: boolean;
}

export const PROCESSING_ACTIVITIES: ProcessingActivity[] = [
  {
    id: "rfq",
    purpose: "Responding to quotation requests and sales enquiries",
    dataCategories: ["Name", "Company", "Designation", "Email", "Phone", "City/State", "GSTIN (optional)", "Requirement details"],
    lawfulBasis: "legitimate-use",
    lawfulBasisNote:
      "You voluntarily provide these details for the specified purpose of obtaining a quotation (DPDP s.7(a) — data voluntarily provided for a purpose, where consent has not been withheld).",
    retention: "24 months from last contact, then deleted",
    recipients: ["Supabase (hosting and database)", "Email delivery provider"],
    crossBorder: true,
  },
  {
    id: "newsletter",
    purpose: "Sending trade updates, new SKU announcements and B2B offers",
    dataCategories: ["Email address"],
    lawfulBasis: "consent",
    lawfulBasisNote: "Separate, opt-in consent given at the point of subscription. Withdrawable at any time.",
    retention: "Until you withdraw consent, plus 12 months of suppression records so we do not re-add you",
    recipients: ["Supabase", "Email delivery provider"],
    crossBorder: true,
  },
  {
    id: "analytics",
    purpose: "Understanding how the site is used so we can improve it",
    dataCategories: ["Pages viewed", "Approximate location (country/region)", "Device and browser type", "Referring site", "Pseudonymous identifier"],
    lawfulBasis: "consent",
    lawfulBasisNote: "Optional. Analytics cookies are not set unless you accept them; declining has no effect on site functionality.",
    retention: "14 months",
    recipients: ["Google Analytics (Google LLC)"],
    crossBorder: true,
  },
  {
    id: "whatsapp",
    purpose: "Connecting you to our sales team over WhatsApp",
    dataCategories: ["Phone number (from your own device)", "Message content", "Click metadata"],
    lawfulBasis: "legitimate-use",
    lawfulBasisNote:
      "Initiated by you. Once the conversation moves to WhatsApp it is also governed by WhatsApp's own privacy terms, over which we have no control.",
    retention: "24 months",
    recipients: ["Supabase", "WhatsApp (Meta Platforms)"],
    crossBorder: true,
  },
  {
    id: "support",
    purpose: "Answering questions asked through the on-site assistant",
    dataCategories: ["Message content", "Session identifier"],
    lawfulBasis: "legitimate-use",
    lawfulBasisNote: "Data voluntarily provided in order to receive a response.",
    retention: "12 months",
    recipients: ["Supabase", "TODO: confirm the AI model provider used by the assistant"],
    crossBorder: true,
  },
  {
    id: "security",
    purpose: "Keeping the site secure and preventing abuse of our forms",
    dataCategories: ["IP address", "User agent", "Request timestamps", "Rate-limit counters"],
    lawfulBasis: "legitimate-use",
    lawfulBasisNote:
      "Necessary for the security of our systems and to prevent fraud and abuse — a legitimate use under DPDP s.7.",
    retention: "90 days",
    recipients: ["Supabase"],
    crossBorder: true,
  },
];

/** Cookie inventory. Drives both the Cookie Policy table and the consent banner. */
export interface CookieCategory {
  id: "necessary" | "analytics" | "marketing";
  label: string;
  description: string;
  /** Necessary cookies cannot be declined; the toggle is locked on. */
  required: boolean;
  cookies: {
    name: string;
    provider: string;
    purpose: string;
    duration: string;
    type: "Cookie" | "Local storage" | "Session storage";
  }[];
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "necessary",
    label: "Strictly necessary",
    description:
      "Required for the site to function — remembering your consent choices, keeping you signed in, and protecting forms from abuse. These cannot be switched off.",
    required: true,
    cookies: [
      { name: "tnr:consent", provider: "The Nilgiri Root", purpose: "Stores your cookie and consent preferences so we don't ask again", duration: "12 months", type: "Local storage" },
      { name: "tnr:intro-seen", provider: "The Nilgiri Root", purpose: "Suppresses the brand intro animation after the first page of a visit", duration: "Session", type: "Session storage" },
      { name: "sb-*-auth-token", provider: "Supabase", purpose: "Keeps you signed in on authenticated pages", duration: "Session / 7 days", type: "Local storage" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    description:
      "Help us understand which pages are useful and where people get stuck, so we can improve the site. Aggregated and pseudonymous — we don't use these to identify you.",
    required: false,
    cookies: [
      { name: "_ga", provider: "Google Analytics", purpose: "Distinguishes returning visitors", duration: "24 months", type: "Cookie" },
      { name: "_ga_<container>", provider: "Google Analytics", purpose: "Maintains session state", duration: "24 months", type: "Cookie" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Would let us measure which campaigns bring buyers to the site and show relevant follow-ups. We do not currently set any marketing cookies — this control is here so that if we ever do, your existing choice is already on record.",
    required: false,
    cookies: [],
  },
];
