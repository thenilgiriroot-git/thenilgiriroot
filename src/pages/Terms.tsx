import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import LegalLayout, { Fact } from "@/components/legal/LegalLayout";
import { LEGAL_ENTITY } from "@/data/legalEntity";

const E = LEGAL_ENTITY;

const SECTIONS = [
  { id: "agreement", title: "Agreement to these terms" },
  { id: "eligibility", title: "Who may use this site" },
  { id: "accounts", title: "Accounts and responsibilities" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "enquiries", title: "Enquiries, quotes and orders" },
  { id: "content", title: "Product information and accuracy" },
  { id: "ip", title: "Intellectual property" },
  { id: "your-content", title: "Content you send us" },
  { id: "data-protection", title: "Data protection" },
  { id: "third-party", title: "Third-party services and links" },
  { id: "availability", title: "Availability of the site" },
  { id: "disclaimer", title: "Disclaimers" },
  { id: "liability", title: "Limitation of liability" },
  { id: "indemnity", title: "Indemnity" },
  { id: "termination", title: "Suspension and termination" },
  { id: "disputes", title: "Disputes and governing law" },
  { id: "changes", title: "Changes to these terms" },
  { id: "general", title: "General" },
  { id: "contact", title: "Contact" },
];

export default function Terms() {
  return (
    <>
      <SEOHead
        title="Terms & Conditions | The Nilgiri Root"
        description="The terms governing your use of The Nilgiri Root website and services, including acceptable use, liability, DPDP Act obligations, and Indian governing law."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms and Conditions",
          url: `${E.websiteUrl}/terms`,
          publisher: { "@type": "Organization", name: E.tradingName },
        }}
      />

      <LegalLayout
        title="Terms &amp; Conditions"
        standfirst="These terms govern your use of this website and any enquiry, quotation or communication you send us through it. Please read them before using the site."
        sections={SECTIONS}
      >
        <p className="lead">
          In these terms, <strong>&ldquo;we&rdquo;</strong>, <strong>&ldquo;us&rdquo;</strong> and{" "}
          <strong>&ldquo;our&rdquo;</strong> mean <Fact value={E.registeredName} /> trading as{" "}
          {E.tradingName}. <strong>&ldquo;You&rdquo;</strong> means the person or business using this
          site.
        </p>

        {/* ── Agreement ──────────────────────────────────────────────── */}
        <h2 id="agreement">Agreement to these terms</h2>
        <p>
          By accessing or using {E.websiteUrl} you agree to these terms. If you do not agree with
          them, please do not use the site.
        </p>
        <p>
          If you are using the site for a business, you confirm you have authority to bind that
          business, and &ldquo;you&rdquo; means both you and that business.
        </p>
        <p>
          These terms should be read together with our{" "}
          <Link to="/privacy-policy">Privacy Policy</Link> and{" "}
          <Link to="/cookie-policy">Cookie Policy</Link>, which form part of them.
        </p>

        {/* ── Eligibility ────────────────────────────────────────────── */}
        <h2 id="eligibility">Who may use this site</h2>
        <p>To use this site and submit enquiries you must:</p>
        <ul>
          <li>be at least 18 years old and competent to contract under the Indian Contract Act, 1872;</li>
          <li>be acting in the course of a trade, business or profession — this is a business-to-business site and we do not sell to consumers through it;</li>
          <li>not be barred from receiving our products or services under any applicable law.</li>
        </ul>
        <p>
          We do not knowingly permit anyone under 18 to submit personal data through this site. See{" "}
          <Link to="/privacy-policy#children">Children and persons with a guardian</Link> in our
          Privacy Policy for how we handle this, including the verifiable parental consent
          requirements under section 9 of the Digital Personal Data Protection Act, 2023 (the{" "}
          <strong>DPDP Act</strong>).
        </p>

        {/* ── Accounts ───────────────────────────────────────────────── */}
        <h2 id="accounts">Accounts and your responsibilities</h2>
        <p>
          Most of this site needs no account. Where an account is provided — for example to access
          administrative or partner areas — you agree to:
        </p>
        <ul>
          <li>give accurate and complete information when registering, and keep it up to date;</li>
          <li>keep your credentials confidential and not share them;</li>
          <li>be responsible for everything done under your account;</li>
          <li>tell us promptly at <a href={`mailto:${E.generalEmail}`}>{E.generalEmail}</a> if you suspect unauthorised access.</li>
        </ul>
        <p>
          We may suspend or close an account that has been compromised, or that is being used in
          breach of these terms.
        </p>

        {/* ── Acceptable use ─────────────────────────────────────────── */}
        <h2 id="acceptable-use">Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>use the site for any unlawful purpose, or in breach of any applicable law or regulation;</li>
          <li>submit false, misleading or impersonated details — note that the DPDP Act separately places a duty on you not to impersonate another person when providing personal data;</li>
          <li>send spam, bulk unsolicited enquiries, or use our forms to distribute advertising;</li>
          <li>upload or transmit anything containing malware, or otherwise attempt to interfere with the site's operation;</li>
          <li>attempt to gain unauthorised access to any part of the site, its servers, or any connected system;</li>
          <li>probe, scan or test the vulnerability of our systems without our prior written permission;</li>
          <li>scrape, harvest or systematically extract data from the site, including by automated means, except for legitimate search-engine indexing consistent with our robots.txt;</li>
          <li>reverse engineer, decompile or disassemble any part of the site;</li>
          <li>use the site in a way that imposes an unreasonable load on our infrastructure;</li>
          <li>remove, obscure or alter any proprietary notice.</li>
        </ul>
        <p>
          If you are a security researcher and believe you have found a vulnerability, please report it
          to <a href={`mailto:${E.generalEmail}`}>{E.generalEmail}</a> rather than exploiting it. We
          will not pursue action against good-faith research that is reported responsibly and does not
          access or exfiltrate other people's data.
        </p>

        {/* ── Enquiries ──────────────────────────────────────────────── */}
        <h2 id="enquiries">Enquiries, quotations and orders</h2>
        <p>
          Nothing on this site is an offer capable of acceptance. Product listings, specifications and
          any indicative pricing are an <em>invitation to treat</em> only.
        </p>
        <ul>
          <li>
            Submitting a quotation request creates no contract. It is a request for us to quote.
          </li>
          <li>
            Any quotation we issue is valid only for the period stated in it, and is subject to
            availability, minimum order quantities and confirmation of delivery terms.
          </li>
          <li>
            A binding contract of sale arises only when we accept your purchase order in writing, or
            on the terms of a separate supply agreement between us. Where a supply agreement exists
            and conflicts with these terms, the supply agreement prevails for that transaction.
          </li>
          <li>
            Prices are exclusive of GST and other applicable taxes and duties unless expressly stated
            otherwise.
          </li>
        </ul>

        {/* ── Content accuracy ───────────────────────────────────────── */}
        <h2 id="content">Product information and accuracy</h2>
        <p>
          We take care to describe our products accurately, including cut sizes, pack formats,
          processing methods and certifications. Even so:
        </p>
        <ul>
          <li>photographs are illustrative and colour and appearance may vary;</li>
          <li>specifications may change as we improve our processes — the specification confirmed in your quotation or supply agreement governs, not the website;</li>
          <li>blog articles, recipes and guides are general information, not technical or nutritional advice for your specific application.</li>
        </ul>
        <p>
          Our FSSAI licence number is {E.fssaiLicence}. Food safety and labelling compliance in your
          own onward sale remains your responsibility.
        </p>

        {/* ── IP ─────────────────────────────────────────────────────── */}
        <h2 id="ip">Intellectual property</h2>
        <p>
          All content on this site — text, photography, video, illustrations, the{" "}
          {E.tradingName} name and logo, page layouts, and the underlying code — is owned by us or
          licensed to us, and is protected by the Copyright Act, 1957, the Trade Marks Act, 1999 and
          other applicable laws.
        </p>
        <p>You may:</p>
        <ul>
          <li>view and browse the site;</li>
          <li>print or download extracts for the legitimate purpose of evaluating us as a supplier.</li>
        </ul>
        <p>You may not, without our prior written permission:</p>
        <ul>
          <li>reproduce, republish, distribute or commercially exploit any part of the site;</li>
          <li>use our name, logo or trade dress in any way that suggests endorsement or partnership that does not exist;</li>
          <li>use our content to train a machine learning model or build a competing dataset.</li>
        </ul>
        <p>
          If you believe content on this site infringes your rights, write to{" "}
          <a href={`mailto:${E.generalEmail}`}>{E.generalEmail}</a> with details of the work, the
          location of the material, and your contact information, and we will investigate.
        </p>

        {/* ── Your content ───────────────────────────────────────────── */}
        <h2 id="your-content">Content you send us</h2>
        <p>
          You keep ownership of anything you send us through the site. By sending it you grant us a
          non-exclusive, royalty-free licence to use it for the purpose you sent it for — responding
          to your enquiry, preparing a quotation, or providing support.
        </p>
        <p>You confirm that anything you send:</p>
        <ul>
          <li>is yours to send, or you have permission to send it;</li>
          <li>does not infringe anyone else's rights;</li>
          <li>is not unlawful, defamatory or offensive;</li>
          <li>does not contain another person's personal data unless you have a lawful basis to share it with us.</li>
        </ul>
        <p>
          That last point matters. If you send us the details of a colleague or a third party, you are
          responsible for having told them and for having a lawful basis under the DPDP Act. We will
          process such data in accordance with our <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>

        {/* ── Data protection ────────────────────────────────────────── */}
        <h2 id="data-protection">Data protection</h2>
        <p>
          We process personal data as a <strong>Data Fiduciary</strong> under the DPDP Act. How we do
          so — what we collect, our lawful bases, retention, cross-border transfers, and your rights
          of access, correction, erasure, nomination and grievance redressal — is set out in full in
          our <Link to="/privacy-policy">Privacy Policy</Link>, which forms part of these terms.
        </p>
        <p>In summary, and as a term of this agreement:</p>
        <ul>
          <li>
            we process personal data only for lawful, specified purposes, on the basis of your consent
            or a legitimate use under section 7 of the DPDP Act;
          </li>
          <li>
            you may withdraw consent at any time through{" "}
            <Link to="/privacy-dashboard">Your Privacy Choices</Link>, as easily as you gave it;
          </li>
          <li>
            we maintain reasonable security safeguards, and will notify you and the Data Protection
            Board of India of a personal data breach as required by section 8(6);
          </li>
          <li>
            we operate a grievance redressal mechanism and publish the contact details of our
            grievance officer;
          </li>
          <li>
            you must exhaust that mechanism before approaching the Data Protection Board of India.
          </li>
        </ul>
        <p>
          Where we act as a <strong>Data Processor</strong> for you under a separate supply or
          services agreement, that agreement's data processing terms govern, and you remain the Data
          Fiduciary for that data.
        </p>

        {/* ── Third party ────────────────────────────────────────────── */}
        <h2 id="third-party">Third-party services and links</h2>
        <p>
          This site relies on third-party services including hosting, analytics, email delivery and
          messaging. Where you choose to continue a conversation on WhatsApp, that conversation is
          also governed by WhatsApp's own terms and privacy policy, over which we have no control.
        </p>
        <p>
          We link to other websites for convenience. We do not endorse them, we do not control them,
          and we are not responsible for their content or their handling of your data.
        </p>

        {/* ── Availability ───────────────────────────────────────────── */}
        <h2 id="availability">Availability of the site</h2>
        <p>
          We aim to keep the site available but do not guarantee uninterrupted access. We may suspend,
          withdraw or restrict all or part of it for business or operational reasons, including
          maintenance, and will try to give reasonable notice where we can.
        </p>
        <p>You are responsible for the arrangements needed to access the site, including your own internet connection and device security.</p>

        {/* ── Disclaimer ─────────────────────────────────────────────── */}
        <h2 id="disclaimer">Disclaimers</h2>
        <p>
          The site and its content are provided <strong>&ldquo;as is&rdquo;</strong>. To the fullest
          extent permitted by law we exclude all warranties, conditions and representations that are
          not expressly stated in these terms, whether implied by statute, common law or otherwise —
          including any implied warranty of merchantability, fitness for a particular purpose, or
          non-infringement.
        </p>
        <p>
          We do not warrant that the site will be error-free, secure or free of viruses, or that the
          information on it is complete, accurate or current at any given moment.
        </p>
        <p>
          Nothing in these terms excludes or limits liability that cannot lawfully be excluded or
          limited — including liability for death or personal injury caused by negligence, or for
          fraud or fraudulent misrepresentation.
        </p>

        {/* ── Liability ──────────────────────────────────────────────── */}
        <h2 id="liability">Limitation of liability</h2>
        <p>
          Subject to the paragraph immediately above, and to the fullest extent permitted by law:
        </p>
        <ul>
          <li>
            we are not liable for any indirect, incidental, special, punitive or consequential loss;
          </li>
          <li>
            we are not liable for loss of profit, revenue, business, anticipated savings, goodwill,
            contracts, or for loss or corruption of data, in each case whether direct or indirect;
          </li>
          <li>
            our total aggregate liability arising out of or in connection with your use of this site —
            whether in contract, tort (including negligence), breach of statutory duty or otherwise —
            is limited to <strong>INR 10,000</strong> (ten thousand rupees), or the amount you have
            paid us under a contract formed through this site in the twelve months preceding the
            claim, whichever is greater.
          </li>
        </ul>
        <p>
          This limitation applies to use of the <em>website</em>. Liability under a separate supply
          agreement for products we sell you is governed by that agreement, not this clause.
        </p>
        <p className="not-prose rounded-xl border border-border bg-muted/40 p-4 font-body text-sm text-muted-foreground">
          <strong className="text-foreground">Note for review:</strong> the liability cap figure is a
          placeholder pending commercial and insurance input. Confirm the number, and confirm it does
          not conflict with the liability provisions of your standard supply agreement.
        </p>

        {/* ── Indemnity ──────────────────────────────────────────────── */}
        <h2 id="indemnity">Indemnity</h2>
        <p>
          You agree to indemnify and hold us harmless against any claim, loss, liability, cost or
          expense (including reasonable legal fees) arising from:
        </p>
        <ul>
          <li>your breach of these terms;</li>
          <li>your misuse of the site;</li>
          <li>your violation of any law or the rights of a third party;</li>
          <li>
            personal data you supplied to us in breach of your own obligations under the DPDP Act or
            other applicable law.
          </li>
        </ul>
        <p>
          We will notify you of any such claim, allow you to control its defence at your cost where
          you confirm you will indemnify us in full, and cooperate reasonably with you.
        </p>

        {/* ── Termination ────────────────────────────────────────────── */}
        <h2 id="termination">Suspension and termination</h2>
        <p>
          We may suspend or terminate your access to the site, immediately and without notice, if we
          reasonably believe you have breached these terms — in particular the acceptable use rules —
          or where we are required to do so by law.
        </p>
        <p>
          You may stop using the site at any time. You may request erasure of your personal data
          through <Link to="/privacy-dashboard">Your Privacy Choices</Link>; we will comply except
          where we are legally required to retain specific records, and will tell you if that applies.
        </p>
        <p>
          Termination does not affect accrued rights. The sections on intellectual property, content
          you send us, disclaimers, limitation of liability, indemnity, and disputes survive.
        </p>

        {/* ── Disputes ───────────────────────────────────────────────── */}
        <h2 id="disputes">Disputes and governing law</h2>
        <p>
          These terms and any dispute arising out of them or your use of the site are governed by the
          <strong> laws of India</strong>, without regard to conflict-of-law rules.
        </p>
        <h3>Step 1 — talk to us</h3>
        <p>
          Most problems are resolved quickly. Please raise the issue with us first at{" "}
          <a href={`mailto:${E.generalEmail}`}>{E.generalEmail}</a>. We will acknowledge within 7
          working days and try to resolve it within 30 days.
        </p>
        <h3>Step 2 — data protection complaints</h3>
        <p>
          A complaint specifically about personal data must first go through our grievance redressal
          mechanism (see the <Link to="/privacy-policy#grievance">Privacy Policy</Link>). If unresolved,
          you may then approach the Data Protection Board of India. This route is separate from, and
          not displaced by, the arbitration clause below.
        </p>
        <h3>Step 3 — arbitration</h3>
        <p>
          Any dispute not resolved under Step 1 will be referred to arbitration under the Arbitration
          and Conciliation Act, 1996, before a sole arbitrator appointed by agreement between the
          parties. The seat and venue of arbitration will be{" "}
          <Fact value={E.jurisdiction} />, and the language will be English. The award will be final
          and binding.
        </p>
        <h3>Step 4 — courts</h3>
        <p>
          Subject to the above, the courts at <Fact value={E.jurisdiction} /> have exclusive
          jurisdiction. Nothing prevents either party from seeking urgent interim relief from a court
          of competent jurisdiction.
        </p>

        {/* ── Changes ────────────────────────────────────────────────── */}
        <h2 id="changes">Changes to these terms</h2>
        <p>
          We may update these terms as our business, the site or the law changes. The &ldquo;last
          updated&rdquo; date at the top always shows the current version.
        </p>
        <p>Our commitments on notification:</p>
        <ul>
          <li>
            <strong>Minor changes</strong> — clarifications, corrections, formatting — take effect on
            publication.
          </li>
          <li>
            <strong>Material changes</strong> — anything that meaningfully affects your rights or
            obligations — take effect <strong>30 days</strong> after we publish them. We will show a
            notice on the site during that period, and email you if we hold your address.
          </li>
          <li>
            <strong>Changes involving personal data</strong> — where a change introduces a new
            processing purpose that relies on your consent, we will ask for that consent separately
            and before the processing begins. Continuing to use the site is never treated as consent
            to a new purpose.
          </li>
        </ul>
        <p>
          If you do not accept a material change, stop using the site before it takes effect and, if
          you wish, ask us to erase your data.
        </p>

        {/* ── General ────────────────────────────────────────────────── */}
        <h2 id="general">General</h2>
        <ul>
          <li>
            <strong>Entire agreement</strong> — these terms, with the Privacy and Cookie Policies, are
            the whole agreement between us regarding the site.
          </li>
          <li>
            <strong>Severability</strong> — if any provision is held unenforceable, the rest continues
            in force and the offending provision is read down to the minimum extent necessary.
          </li>
          <li>
            <strong>No waiver</strong> — a delay in enforcing a right is not a waiver of it.
          </li>
          <li>
            <strong>Assignment</strong> — you may not assign these terms without our written consent;
            we may assign them as part of a business transfer.
          </li>
          <li>
            <strong>No partnership</strong> — nothing here creates a partnership, joint venture or
            agency between us.
          </li>
          <li>
            <strong>Third parties</strong> — no one other than you and us has any right to enforce
            these terms.
          </li>
          <li>
            <strong>Force majeure</strong> — neither party is liable for failure to perform caused by
            events beyond its reasonable control.
          </li>
        </ul>

        {/* ── Contact ────────────────────────────────────────────────── */}
        <h2 id="contact">Contact</h2>
        <p>Questions about these terms:</p>
        <div className="not-prose my-6 rounded-xl border border-border bg-card p-5">
          <dl className="grid gap-2 font-body text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
            <dt className="text-muted-foreground">Entity</dt>
            <dd className="text-foreground"><Fact value={E.registeredName} /></dd>
            <dt className="text-muted-foreground">Address</dt>
            <dd className="text-foreground">{E.operationalAddress}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground">
              <a href={`mailto:${E.generalEmail}`} className="text-accent hover:underline">{E.generalEmail}</a>
            </dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-foreground">{E.phone}</dd>
            <dt className="text-muted-foreground">Data protection</dt>
            <dd className="text-foreground">
              <a href={`mailto:${E.grievanceOfficer.email}`} className="text-accent hover:underline">
                {E.grievanceOfficer.email}
              </a>
            </dd>
          </dl>
        </div>
      </LegalLayout>
    </>
  );
}
