import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import LegalLayout from "@/components/legal/LegalLayout";
import { COOKIE_CATEGORIES, LEGAL_ENTITY } from "@/data/legalEntity";

const E = LEGAL_ENTITY;

const SECTIONS = [
  { id: "what", title: "What cookies are" },
  { id: "consent", title: "How we ask" },
  { id: "inventory", title: "The full list" },
  { id: "third-party", title: "Third-party cookies" },
  { id: "control", title: "Controlling cookies" },
  { id: "changes", title: "Changes" },
];

export default function CookiePolicy() {
  return (
    <>
      <SEOHead
        title="Cookie Policy | The Nilgiri Root"
        description="Every cookie and similar technology used on thenilgiriroot.com — what it does, who sets it, how long it lasts, and how to control it."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Cookie Policy",
          url: `${E.websiteUrl}/cookie-policy`,
          publisher: { "@type": "Organization", name: E.tradingName },
        }}
      />

      <LegalLayout
        title="Cookie Policy"
        standfirst="A complete inventory of the cookies and similar technologies this site uses, why each one exists, and how to turn the optional ones off."
        sections={SECTIONS}
      >
        <h2 id="what">What cookies are</h2>
        <p>
          Cookies are small text files a website stores on your device. Related technologies —{" "}
          <strong>local storage</strong> and <strong>session storage</strong> — do a similar job but
          are read only by your browser rather than sent back with every request. We use all three
          and have listed them together below, because the distinction rarely matters to the person
          deciding whether to allow them.
        </p>

        <h2 id="consent">How we ask for your consent</h2>
        <p>
          Under section 6 of the Digital Personal Data Protection Act, 2023, consent must be free,
          specific, informed, unconditional and unambiguous, given by a clear affirmative action. In
          practice that means:
        </p>
        <ul>
          <li>
            <strong>Nothing optional is pre-ticked.</strong> Analytics and marketing start switched
            off and stay off until you turn them on.
          </li>
          <li>
            <strong>Dismissing the notice is not consent.</strong> There is no close button that
            quietly counts as acceptance, and continuing to scroll does not accept anything.
          </li>
          <li>
            <strong>Rejecting is as easy as accepting.</strong> Both buttons are the same size, in
            the same place, with the same prominence.
          </li>
          <li>
            <strong>You can choose per purpose.</strong> Accepting analytics does not opt you into
            marketing.
          </li>
          <li>
            <strong>Withdrawal is as easy as consent.</strong> One switch in{" "}
            <Link to="/privacy-dashboard">Your Privacy Choices</Link>, at any time. Turning analytics
            off also deletes the analytics cookies already on your device.
          </li>
          <li>
            <strong>Declining costs you nothing.</strong> Every part of this site works identically
            whether you accept or refuse.
          </li>
        </ul>
        <p>
          We record your decision so we don&rsquo;t have to keep asking. That record — the categories
          you chose, when, and a receipt reference — is itself stored in the strictly necessary
          category, because we are required to be able to demonstrate that consent was given.
        </p>

        <h2 id="inventory">The full list</h2>
        {COOKIE_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <h3>
              {cat.label} {cat.required ? "(always on)" : "(optional)"}
            </h3>
            <p>{cat.description}</p>
            {cat.cookies.length === 0 ? (
              <p>
                <em>We do not currently set any cookies in this category.</em>
              </p>
            ) : (
              <div className="not-prose my-4 overflow-x-auto rounded-xl border border-border">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/60">
                      <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Name</th>
                      <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Set by</th>
                      <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Purpose</th>
                      <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Lasts</th>
                      <th scope="col" className="p-3 text-left font-body text-2xs uppercase tracking-wider text-muted-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.cookies.map((c) => (
                      <tr key={c.name} className="border-t border-border align-top">
                        <td className="p-3 font-mono text-2xs text-foreground">{c.name}</td>
                        <td className="p-3 font-body text-2xs text-muted-foreground">{c.provider}</td>
                        <td className="p-3 font-body text-2xs leading-relaxed text-muted-foreground">{c.purpose}</td>
                        <td className="whitespace-nowrap p-3 font-body text-2xs text-muted-foreground">{c.duration}</td>
                        <td className="whitespace-nowrap p-3 font-body text-2xs text-muted-foreground">{c.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        <h2 id="third-party">Third-party cookies</h2>
        <p>
          Where a cookie is set by another company, that company also acts on your data under its own
          terms. The one we currently use is <strong>Google Analytics</strong>, and only where you
          have accepted analytics.
        </p>
        <p>
          We run Google Consent Mode, which means Google is told your choice before any measurement
          happens — not merely blocked after the fact. With analytics declined, no analytics
          identifiers are written at all.
        </p>
        <p>
          Analytics data may be processed outside India. See{" "}
          <Link to="/privacy-policy#cross-border">Storage and transfers</Link> in our Privacy Policy.
        </p>

        <h2 id="control">Controlling cookies</h2>
        <h3>On this site</h3>
        <p>
          Use <Link to="/privacy-dashboard">Your Privacy Choices</Link>. Changes apply immediately,
          and switching a category off clears the cookies it had already set.
        </p>
        <h3>In your browser</h3>
        <p>
          Every major browser lets you block or delete cookies. Blocking strictly necessary cookies
          will stop us remembering your privacy choices — which means you&rsquo;ll be asked again on
          every visit — but nothing else will break.
        </p>
        <h3>Do Not Track and Global Privacy Control</h3>
        <p>
          There is no settled standard for how sites should respond to Do Not Track, and we do not
          currently act on it. We are watching the Global Privacy Control signal and will honour it
          once its treatment under Indian law is clear. In the meantime our default is already the
          privacy-protective one: optional cookies are off until you switch them on.
        </p>

        <h2 id="changes">Changes to this policy</h2>
        <p>
          If we add a cookie in a new category, or change what an existing one does, we will update
          this page and ask for your consent again before the new processing starts. Your previous
          choice is never silently extended to a new purpose.
        </p>
        <p>
          Questions about anything here go to{" "}
          <a href={`mailto:${E.grievanceOfficer.email}`}>{E.grievanceOfficer.email}</a>.
        </p>
      </LegalLayout>
    </>
  );
}
