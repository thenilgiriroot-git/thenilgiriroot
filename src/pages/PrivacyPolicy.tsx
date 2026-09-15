import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import LegalLayout, { Fact } from "@/components/legal/LegalLayout";
import { LEGAL_ENTITY, PROCESSING_ACTIVITIES, COOKIE_CATEGORIES } from "@/data/legalEntity";

const E = LEGAL_ENTITY;

const SECTIONS = [
  { id: "who-we-are", title: "Who we are" },
  { id: "scope", title: "What this covers" },
  { id: "what-we-collect", title: "Data we collect" },
  { id: "lawful-basis", title: "Why we may process it" },
  { id: "how-we-use", title: "How we use it" },
  { id: "sharing", title: "Who we share it with" },
  { id: "cross-border", title: "Storage and transfers" },
  { id: "retention", title: "How long we keep it" },
  { id: "your-rights", title: "Your rights" },
  { id: "exercise", title: "Exercising your rights" },
  { id: "children", title: "Children and guardianship" },
  { id: "cookies", title: "Cookies" },
  { id: "security", title: "Security" },
  { id: "breach", title: "If something goes wrong" },
  { id: "obligations", title: "Our obligations" },
  { id: "grievance", title: "Grievances and escalation" },
  { id: "changes", title: "Changes to this policy" },
];

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | The Nilgiri Root"
        description="How The Nilgiri Root collects, uses, shares and retains personal data, and how you can exercise your rights under India's Digital Personal Data Protection Act, 2023."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy Policy",
          url: `${E.websiteUrl}/privacy-policy`,
          description:
            "Privacy Policy of The Nilgiri Root, compliant with India's Digital Personal Data Protection Act, 2023.",
          publisher: { "@type": "Organization", name: E.tradingName },
        }}
      />

      <LegalLayout
        title="Privacy Policy"
        standfirst="This explains what personal data we collect when you use this website or contact us, why we hold it, who else sees it, and the rights you have over it under India's Digital Personal Data Protection Act, 2023."
        sections={SECTIONS}
      >
        <p className="lead">
          We have tried to write this in plain language rather than legalese. Where the law uses a
          specific term — <strong>Data Principal</strong> (you), <strong>Data Fiduciary</strong> (us),{" "}
          <strong>Data Processor</strong> (a supplier acting on our instructions) — we have used it and
          explained it.
        </p>

        {/* ── Who we are ─────────────────────────────────────────────── */}
        <h2 id="who-we-are">Who we are</h2>
        <p>
          This website is operated by <strong><Fact value={E.registeredName} /></strong> (
          <Fact value={E.entityType} />), trading as <strong>{E.tradingName}</strong>. In the language
          of the Digital Personal Data Protection Act, 2023 (the <strong>DPDP Act</strong>), we are the{" "}
          <strong>Data Fiduciary</strong> for the personal data described here — meaning we decide why
          and how it is processed, and we are accountable for it.
        </p>
        <table>
          <tbody>
            <tr><th scope="row">Registered name</th><td><Fact value={E.registeredName} /></td></tr>
            <tr><th scope="row">Entity type</th><td><Fact value={E.entityType} /></td></tr>
            <tr><th scope="row">Registration number</th><td><Fact value={E.registrationNumber} /></td></tr>
            <tr><th scope="row">FSSAI licence</th><td>{E.fssaiLicence}</td></tr>
            <tr><th scope="row">Registered office</th><td><Fact value={E.registeredAddress} /></td></tr>
            <tr><th scope="row">Operations</th><td>{E.operationalAddress}</td></tr>
            <tr><th scope="row">Contact</th><td>{E.generalEmail} · {E.phone}</td></tr>
          </tbody>
        </table>

        {/* ── Scope ──────────────────────────────────────────────────── */}
        <h2 id="scope">What this policy covers</h2>
        <p>
          This policy applies to personal data we process about people in India in connection with{" "}
          {E.websiteUrl}, our sales and enquiry channels, and our business relationships. It applies
          whether you reach us through the website, WhatsApp, email or phone.
        </p>
        <p>It does not cover:</p>
        <ul>
          <li>
            Websites and services operated by other companies that we link to. Once you follow a link
            away from our site, their privacy terms apply, not ours.
          </li>
          <li>
            Personal data we process purely on behalf of a business customer under a separate
            contract, where that customer decides the purposes — in those cases they are the Data
            Fiduciary and we act as a Data Processor.
          </li>
          <li>
            Data that is not personal data — for example aggregated statistics from which no
            individual can be identified.
          </li>
        </ul>
        <p>
          The DPDP Act does not apply to personal data you yourself make publicly available, or to
          data processed for purely personal or domestic purposes.
        </p>

        {/* ── What we collect ────────────────────────────────────────── */}
        <h2 id="what-we-collect">The personal data we collect</h2>
        <p>
          We collect only what we need for a specific, stated purpose. We do not sell personal data,
          and we do not buy contact lists.
        </p>

        <h3>Data you give us directly</h3>
        <ul>
          <li>
            <strong>Quotation and enquiry forms</strong> — your name, company, designation, email,
            phone number, city and state, optionally your GSTIN, and the requirement details you
            choose to describe (cut sizes, volumes, packaging, delivery dates, notes).
          </li>
          <li>
            <strong>Newsletter</strong> — your email address only.
          </li>
          <li>
            <strong>Contact form, WhatsApp and the on-site assistant</strong> — whatever you choose to
            write to us, plus the contact details you provide so we can reply.
          </li>
        </ul>

        <h3>Data we collect automatically</h3>
        <ul>
          <li>
            <strong>Technical and security data</strong> — IP address, browser and device type, and
            request timestamps. We use these to keep the site available and to stop automated abuse of
            our forms.
          </li>
          <li>
            <strong>Usage data</strong> — which pages you viewed, how you arrived, and approximate
            region. This is collected <em>only if you accept analytics cookies</em>, and it is
            pseudonymous.
          </li>
        </ul>

        <h3>Data we do not want</h3>
        <p>
          Please do not send us financial account details, government identifiers such as Aadhaar or
          PAN, health information, or any other sensitive personal data through the website forms or
          the chat assistant. We have no business need for it. If you send it anyway we will delete it
          once we have dealt with your message.
        </p>

        {/* ── Lawful basis ───────────────────────────────────────────── */}
        <h2 id="lawful-basis">Why we are allowed to process it</h2>
        <p>
          Under the DPDP Act, personal data may be processed either with your <strong>consent</strong>{" "}
          (section 6) or for <strong>certain legitimate uses</strong> (section 7). We rely on both,
          depending on the activity. The table under{" "}
          <a href="#how-we-use">How we use it</a> states which basis applies to each purpose.
        </p>
        <h3>Where we rely on consent</h3>
        <p>
          Where we ask for consent, we ask for it separately for each purpose — accepting analytics
          does not subscribe you to marketing, and vice versa. Our consent requests are specific,
          informed and unambiguous, and are never bundled into a single take-it-or-leave-it checkbox.
          Consent is as easy to withdraw as it was to give: use{" "}
          <Link to="/privacy-dashboard">Your Privacy Choices</Link> at any time.
        </p>
        <p>
          Withdrawing consent does not make our earlier processing unlawful, and it does not affect
          processing that rests on a legitimate use. If withdrawal means we can no longer do something
          for you — for example, send you the updates you asked for — we will simply stop doing that.
        </p>
        <h3>Where we rely on legitimate uses</h3>
        <p>
          Section 7(a) of the DPDP Act permits processing where you have voluntarily provided your
          personal data for a specified purpose and have not indicated that you object. When you fill
          in a quotation form, you are voluntarily giving us your details precisely so that we can
          quote — so we may use them for that. We also rely on legitimate uses to keep our systems
          secure and to comply with law.
        </p>

        {/* ── How we use it ──────────────────────────────────────────── */}
        <h2 id="how-we-use">How we use your data, purpose by purpose</h2>
        <p>
          This table is generated from the same configuration that drives the consent controls on this
          site, so it cannot drift out of step with what actually happens.
        </p>
        <div className="not-prose overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Purpose</th>
                <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Data used</th>
                <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Basis</th>
                <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Kept for</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSING_ACTIVITIES.map((a) => (
                <tr key={a.id} className="border-t border-border align-top">
                  <td className="p-3 font-body text-foreground">
                    {a.purpose}
                    <span className="mt-1 block text-2xs leading-relaxed text-muted-foreground">
                      {a.lawfulBasisNote}
                    </span>
                  </td>
                  <td className="p-3 font-body text-2xs leading-relaxed text-muted-foreground">
                    {a.dataCategories.join(", ")}
                  </td>
                  <td className="whitespace-nowrap p-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 font-body text-2xs ${
                        a.lawfulBasis === "consent"
                          ? "bg-accent/12 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {a.lawfulBasis === "consent" ? "Consent" : "Legitimate use"}
                    </span>
                  </td>
                  <td className="p-3 font-body text-2xs text-muted-foreground">
                    <Fact value={a.retention} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          We do not use your personal data to make automated decisions that produce legal or similarly
          significant effects about you, and we do not profile you for advertising.
        </p>

        {/* ── Sharing ────────────────────────────────────────────────── */}
        <h2 id="sharing">Who we share it with</h2>
        <p>
          We share personal data only with suppliers who process it on our written instructions as{" "}
          <strong>Data Processors</strong>, and only as far as they need it to do their job. They may
          not use it for their own purposes.
        </p>
        <ul>
          <li><strong>Supabase</strong> — hosting, database and serverless functions behind this site.</li>
          <li><strong>Google Analytics (Google LLC)</strong> — usage measurement, only where you have accepted analytics cookies.</li>
          <li><strong>Our email delivery provider</strong> — sending transactional replies and, where you have subscribed, newsletters.</li>
          <li><strong>WhatsApp (Meta Platforms)</strong> — only where you choose to start a WhatsApp conversation with us.</li>
        </ul>
        <p>We may also disclose personal data where we are legally obliged to: to a court, a regulator, or a law enforcement agency acting under lawful authority. We will not hand over data on an informal request without a lawful basis for doing so.</p>
        <p>
          If our business is ever sold or reorganised, personal data may transfer to the acquiring
          entity. We would tell you before that happened and your rights would carry over unchanged.
        </p>

        {/* ── Cross-border ───────────────────────────────────────────── */}
        <h2 id="cross-border">Where your data is stored, and transfers outside India</h2>
        <p>
          Some of the suppliers listed above operate infrastructure outside India, so your personal
          data may be stored or processed abroad. Section 16 of the DPDP Act permits transfers of
          personal data outside India, except to territories that the Central Government specifically
          restricts by notification. We monitor those notifications and will stop transfers to any
          restricted territory.
        </p>
        <p>Where data does leave India, we:</p>
        <ul>
          <li>keep a written record of the transfer, the destination and the supplier;</li>
          <li>put a data processing agreement in place with binding confidentiality and security obligations;</li>
          <li>require the supplier to assist us in meeting your rights requests and our breach-reporting duties;</li>
          <li>transfer only the minimum data needed for the purpose.</li>
        </ul>
        <p>
          Sector-specific rules may separately require certain records to be kept in India. Where they
          apply to us, we follow them.
        </p>
        <p className="not-prose rounded-xl border border-border bg-muted/40 p-4 font-body text-sm text-muted-foreground">
          <strong className="text-foreground">Note for review:</strong> the specific hosting regions
          for each supplier, and the executed data processing agreements, need to be confirmed and
          listed here before publication.
        </p>

        {/* ── Retention ──────────────────────────────────────────────── */}
        <h2 id="retention">How long we keep it</h2>
        <p>
          We keep personal data only as long as the purpose it was collected for still exists, plus
          any period we are legally required to retain it for — for instance tax and food-safety
          record-keeping obligations. The per-purpose periods are in the{" "}
          <a href="#how-we-use">table above</a>.
        </p>
        <p>
          Once a retention period ends we delete the data or irreversibly anonymise it. Where data is
          held in backups it is removed on the normal backup rotation rather than immediately, and
          remains protected in the meantime.
        </p>

        {/* ── Rights ─────────────────────────────────────────────────── */}
        <h2 id="your-rights">Your rights as a Data Principal</h2>
        <p>Chapter III of the DPDP Act gives you the following rights. They are free to exercise.</p>
        <h3>Right to access information about your data</h3>
        <p>
          You can ask us for a summary of the personal data we hold about you, what we are doing with
          it, and the identities of any other Data Fiduciaries and Processors we have shared it with —
          together with a description of what was shared.
        </p>
        <h3>Right to correction, completion, updating and erasure</h3>
        <p>
          You can ask us to correct data that is inaccurate or misleading, complete data that is
          incomplete, update data that has gone stale, and erase data we no longer need. We will erase
          on request unless we are required by law to keep it — if that applies, we will tell you
          which obligation prevents deletion and when it expires.
        </p>
        <h3>Right of grievance redressal</h3>
        <p>
          You can complain to us about anything in this policy or how we have handled your data, and
          we must respond. See <a href="#grievance">Grievances and escalation</a>. You must give us
          the chance to resolve your complaint before approaching the Data Protection Board of India.
        </p>
        <h3>Right to nominate</h3>
        <p>
          You can nominate another individual to exercise these rights on your behalf if you die or
          become incapacitated. Tell us through the grievance channel and we will record the
          nomination.
        </p>
        <h3>Right to withdraw consent</h3>
        <p>
          Where we rely on your consent, you can withdraw it at any time and as easily as you gave it,
          through <Link to="/privacy-dashboard">Your Privacy Choices</Link>.
        </p>
        <h3>Your duties</h3>
        <p>
          The DPDP Act also places duties on Data Principals: not to impersonate someone else when
          providing data, not to suppress material information, not to register false or frivolous
          grievances, and to provide only authentic information when asking us to correct or erase
          data. The Act provides for penalties where these duties are breached.
        </p>

        {/* ── Exercising ─────────────────────────────────────────────── */}
        <h2 id="exercise">How to exercise your rights</h2>
        <p>
          The quickest route is <Link to="/privacy-dashboard">Your Privacy Choices</Link>, where you
          can review your consent settings, change them, and raise a request. You can also email{" "}
          <a href={`mailto:${E.grievanceOfficer.email}`}>{E.grievanceOfficer.email}</a>.
        </p>
        <p>
          So that we do not disclose someone's data to the wrong person, we need to be reasonably
          satisfied you are who you say you are. We will normally verify by sending a confirmation
          link to the email address already on our records. We will not ask you for identity documents
          unless there is a genuine doubt.
        </p>
        <p>
          We aim to respond within <strong>{E.grievanceOfficer.responseDays} days</strong>. If a
          request is unusually complex we will tell you why and how much longer we need.
        </p>

        {/* ── Children ───────────────────────────────────────────────── */}
        <h2 id="children">Children and persons with a guardian</h2>
        <p>
          This is a business-to-business site and is not directed at children. We do not knowingly
          collect personal data from anyone under the age of 18.
        </p>
        <p>
          Under section 9 of the DPDP Act, processing a child's personal data requires{" "}
          <strong>verifiable consent from a parent or lawful guardian</strong>. The Act also prohibits
          tracking, behavioural monitoring and targeted advertising directed at children, and any
          processing likely to cause a detrimental effect on a child's well-being. The same
          protections apply to a person with a disability who has a lawful guardian.
        </p>
        <p>
          If we become aware that we hold a child's personal data without verifiable parental consent,
          we will delete it. If you believe a child has given us their details, please contact{" "}
          <a href={`mailto:${E.grievanceOfficer.email}`}>{E.grievanceOfficer.email}</a> and we will
          remove it promptly.
        </p>

        {/* ── Cookies ────────────────────────────────────────────────── */}
        <h2 id="cookies">Cookies and similar technologies</h2>
        <p>
          Cookies are small files stored on your device. We group ours into three categories, and you
          control the optional ones. Non-essential cookies are not set until you accept them — there
          is no pre-ticked box and no "continuing to browse means you agree".
        </p>
        <ul>
          {COOKIE_CATEGORIES.map((c) => (
            <li key={c.id}>
              <strong>{c.label}</strong>
              {c.required ? " (always on) — " : " (optional) — "}
              {c.description}
            </li>
          ))}
        </ul>
        <p>
          The full inventory — every cookie, its provider, purpose and lifetime — is in the{" "}
          <Link to="/cookie-policy">Cookie Policy</Link>. You can change your choices whenever you
          like from <Link to="/privacy-dashboard">Your Privacy Choices</Link>, and you can also clear
          or block cookies in your browser settings.
        </p>

        {/* ── Security ───────────────────────────────────────────────── */}
        <h2 id="security">How we protect your data</h2>
        <p>
          Section 8(5) of the DPDP Act requires us to take reasonable security safeguards to prevent a
          personal data breach. The measures we currently rely on include:
        </p>
        <ul>
          <li>encryption in transit (HTTPS/TLS) across the whole site, and encryption at rest in our database;</li>
          <li>row-level access controls so that records are only readable by the roles that need them;</li>
          <li>a Content Security Policy and related HTTP security headers to reduce injection and clickjacking risk;</li>
          <li>rate limiting and spam controls on public forms;</li>
          <li>access to production systems limited to the people who need it;</li>
          <li>contractual security obligations on every Data Processor we use.</li>
        </ul>
        <p>
          No system is perfectly secure, and we do not claim otherwise. What we do commit to is
          handling a failure properly — see below.
        </p>

        {/* ── Breach ─────────────────────────────────────────────────── */}
        <h2 id="breach">If there is a personal data breach</h2>
        <p>
          Section 8(6) of the DPDP Act requires us to notify both the Data Protection Board of India
          and every affected Data Principal if a breach occurs. Our procedure is:
        </p>
        <ol>
          <li>
            <strong>Contain and assess</strong> — stop the exposure and establish what data, and whose,
            was involved.
          </li>
          <li>
            <strong>Tell you without delay</strong> — we will describe the nature and extent of the
            breach, when it happened, the likely consequences, what we have done about it, and what
            you can do to protect yourself. We will give you a contact point for questions.
          </li>
          <li>
            <strong>Notify the Board</strong> — an initial intimation without delay, followed by a
            detailed report within <strong>72 hours</strong> covering the circumstances, the
            mitigation taken, the findings on who caused it, and the remedial measures put in place to
            prevent recurrence.
          </li>
          <li>
            <strong>Record and learn</strong> — every incident is logged in our internal breach
            register with its timeline and outcome, whether or not it met the notification threshold.
          </li>
        </ol>
        <p className="not-prose rounded-xl border border-border bg-muted/40 p-4 font-body text-sm text-muted-foreground">
          <strong className="text-foreground">Note for review:</strong> the 72-hour detailed-report
          window follows the Draft DPDP Rules. Confirm the timelines against the Rules as finally
          notified before publication, and confirm the internal escalation owners.
        </p>

        {/* ── Obligations ────────────────────────────────────────────── */}
        <h2 id="obligations">Our obligations as a Data Fiduciary</h2>
        <p>Independently of any request from you, we are required to and do:</p>
        <ul>
          <li>process personal data only for a lawful purpose, and only as much as that purpose needs;</li>
          <li>make reasonable efforts to keep the data we hold accurate, complete and consistent, particularly where it will be used to make a decision affecting you or shared with another fiduciary;</li>
          <li>maintain reasonable security safeguards;</li>
          <li>erase personal data once its purpose is served and no legal retention obligation remains, and ensure our Processors do the same;</li>
          <li>publish the contact details of a person able to answer your questions about processing;</li>
          <li>operate a grievance redressal mechanism;</li>
          <li>engage Processors only under a valid contract;</li>
          <li>remain accountable for compliance even where processing is carried out by a Processor on our behalf.</li>
        </ul>
        <p>
          {E.isSignificantDataFiduciary ? (
            <>
              We have been designated a <strong>Significant Data Fiduciary</strong>. Accordingly we
              have appointed a Data Protection Officer based in India, appointed an independent data
              auditor, and carry out periodic Data Protection Impact Assessments and audits.
            </>
          ) : (
            <>
              We have not been designated a <strong>Significant Data Fiduciary</strong> by the Central
              Government. That designation triggers additional obligations — appointing a Data
              Protection Officer based in India, appointing an independent data auditor, and
              conducting periodic Data Protection Impact Assessments. If we are ever designated as
              one, we will comply and update this policy. In the meantime, questions and complaints go
              to our grievance officer below.
            </>
          )}
        </p>

        {/* ── Grievance ──────────────────────────────────────────────── */}
        <h2 id="grievance">Grievances and escalation</h2>
        <p>
          If you are unhappy with how we have handled your personal data or your request, please tell
          us first. We take complaints seriously and would rather fix a problem than have you escalate
          it.
        </p>
        <div className="not-prose my-6 rounded-xl border border-border bg-card p-5">
          <p className="mb-3 font-body text-2xs uppercase tracking-[0.2em] text-muted-foreground">
            Grievance Officer
          </p>
          <dl className="grid gap-2 font-body text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground"><Fact value={E.grievanceOfficer.name} /></dd>
            <dt className="text-muted-foreground">Designation</dt>
            <dd className="text-foreground"><Fact value={E.grievanceOfficer.designation} /></dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground">
              <a href={`mailto:${E.grievanceOfficer.email}`} className="text-accent hover:underline">
                {E.grievanceOfficer.email}
              </a>
            </dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-foreground"><Fact value={E.grievanceOfficer.phone} /></dd>
            <dt className="text-muted-foreground">Post</dt>
            <dd className="text-foreground"><Fact value={E.grievanceOfficer.postalAddress} /></dd>
            <dt className="text-muted-foreground">Response time</dt>
            <dd className="text-foreground">Within {E.grievanceOfficer.responseDays} days</dd>
          </dl>
        </div>
        <p>
          <strong>If we do not resolve it.</strong> If you have raised a grievance with us and are not
          satisfied with the outcome — or we have not responded in time — you may complain to the{" "}
          <strong>Data Protection Board of India</strong>. Exhausting our internal process first is a
          precondition under the DPDP Act. Contact details and the procedure are published by the
          Board.
        </p>

        {/* ── Changes ────────────────────────────────────────────────── */}
        <h2 id="changes">Changes to this policy</h2>
        <p>
          We update this policy when our processing changes or the law does. The "last updated" date
          at the top always reflects the current version.
        </p>
        <p>
          If a change materially affects your rights or introduces a new purpose that relies on your
          consent, we will not simply update the page: we will tell you directly — by email where we
          have your address, and by a notice on the site — and where consent is needed we will ask for
          it afresh before the new processing starts. Continuing to use the site is not treated as
          agreement to a new purpose.
        </p>

        <hr />
        <p className="text-2xs">
          Available in English. If you would prefer to receive this policy or communicate with our
          grievance officer in हिन्दी or தமிழ், please write to{" "}
          <a href={`mailto:${E.grievanceOfficer.email}`}>{E.grievanceOfficer.email}</a> and we will
          arrange it. The DPDP Act entitles you to access consent notices in any language listed in
          the Eighth Schedule to the Constitution.
        </p>
      </LegalLayout>
    </>
  );
}
