import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: unknown[]) => invoke(...args) } },
}));
vi.mock("@/lib/analytics", () => ({
  trackQuoteRequestClick: vi.fn(),
  trackCtaClick: vi.fn(),
  trackPhoneClick: vi.fn(),
  trackEmailClick: vi.fn(),
  useGaPageviews: vi.fn(),
}));
const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: (...a: unknown[]) => toast(...a) }));

import InlineRfqForm from "@/components/InlineRfqForm";
import RfqDialog from "@/components/RfqDialog";

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  invoke.mockReset();
  toast.mockReset();
  invoke.mockResolvedValue({ error: null });
});

describe("InlineRfqForm accessibility", () => {
  it("gives every visible field an accessible name", () => {
    // Regression guard: neither RFQ form associated a single label with its
    // control, so a screen reader announced "edit text, blank" on all of them.
    wrap(<InlineRfqForm sourceDetail="test" />);

    for (const name of [/your name/i, /company/i, /phone/i, /email/i, /city/i]) {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/cut/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pack size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly volume/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/requirements/i)).toBeInTheDocument();
  });

  it("marks the four mandatory fields as required", () => {
    wrap(<InlineRfqForm sourceDetail="test" />);

    for (const name of [/your name/i, /company/i, /phone/i, /email/i]) {
      expect(screen.getByLabelText(name)).toBeRequired();
    }
    expect(screen.getByLabelText(/city/i)).not.toBeRequired();
  });

  it("keeps the honeypot out of the accessibility tree", () => {
    const { container } = wrap(<InlineRfqForm sourceDetail="test" />);
    const honeypot = container.querySelector('div[aria-hidden="true"] input');
    expect(honeypot).toBeTruthy();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});

describe("InlineRfqForm submission", () => {
  it("blocks an invalid email at the field, before any network call", async () => {
    const user = userEvent.setup();
    wrap(<InlineRfqForm sourceDetail="test" />);

    await user.type(screen.getByLabelText(/your name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/company/i), "Rao Foods");
    await user.type(screen.getByLabelText(/phone/i), "9876543210");
    const email = screen.getByLabelText(/email/i);
    await user.type(email, "not-an-email");
    await user.click(screen.getByRole("button", { name: /send quotation request/i }));

    // type="email" + required means the browser refuses to submit and points
    // the user at the offending field — better than a toast after a round
    // trip. What matters is that nothing reaches the backend.
    expect((email as HTMLInputElement).validity.valid).toBe(false);
    expect(invoke).not.toHaveBeenCalled();
    expect(screen.queryByText(/request received/i)).not.toBeInTheDocument();
  });

  it("still rejects a malformed email if native validation is bypassed", async () => {
    // Autofill and some password managers can populate a field without
    // triggering native validation, so the zod schema must hold the line too.
    const user = userEvent.setup();
    const { container } = wrap(<InlineRfqForm sourceDetail="test" />);

    await user.type(screen.getByLabelText(/your name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/company/i), "Rao Foods");
    await user.type(screen.getByLabelText(/phone/i), "9876543210");
    await user.type(screen.getByLabelText(/email/i), "nope@@example");

    container.querySelector("form")!.noValidate = true;
    await user.click(screen.getByRole("button", { name: /send quotation request/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })),
    );
    expect(invoke).not.toHaveBeenCalled();
  });

  it("submits a valid enquiry to the submit-lead function", async () => {
    const user = userEvent.setup();
    wrap(<InlineRfqForm sourceDetail="lp_9mm" defaultCut="9mm" />);

    await user.type(screen.getByLabelText(/your name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/company/i), "Rao Foods");
    await user.type(screen.getByLabelText(/phone/i), "9876543210");
    await user.type(screen.getByLabelText(/email/i), "asha@raofoods.in");
    await user.click(screen.getByRole("button", { name: /send quotation request/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledWith("submit-lead", expect.anything()));

    const [, options] = invoke.mock.calls[0] as [string, { body: Record<string, unknown> }];
    expect(options.body).toMatchObject({
      source_type: "rfq",
      source_detail: "lp_9mm",
      name: "Asha Rao",
      email: "asha@raofoods.in",
      company: "Rao Foods",
    });
  });

  it("confirms success to the user instead of silently resetting", async () => {
    const user = userEvent.setup();
    wrap(<InlineRfqForm sourceDetail="test" />);

    await user.type(screen.getByLabelText(/your name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/company/i), "Rao Foods");
    await user.type(screen.getByLabelText(/phone/i), "9876543210");
    await user.type(screen.getByLabelText(/email/i), "asha@raofoods.in");
    await user.click(screen.getByRole("button", { name: /send quotation request/i }));

    expect(await screen.findByText(/request received/i)).toBeInTheDocument();
  });

  it("surfaces a backend failure rather than showing success", async () => {
    invoke.mockResolvedValue({ error: { message: "boom" } });
    const user = userEvent.setup();
    wrap(<InlineRfqForm sourceDetail="test" />);

    await user.type(screen.getByLabelText(/your name/i), "Asha Rao");
    await user.type(screen.getByLabelText(/company/i), "Rao Foods");
    await user.type(screen.getByLabelText(/phone/i), "9876543210");
    await user.type(screen.getByLabelText(/email/i), "asha@raofoods.in");
    await user.click(screen.getByRole("button", { name: /send quotation request/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" }),
      ),
    );
    expect(screen.queryByText(/request received/i)).not.toBeInTheDocument();
  });
});

describe("RfqDialog", () => {
  it("labels every field once opened", async () => {
    const user = userEvent.setup();
    wrap(<RfqDialog trigger={<button>Request Quote</button>} />);

    await user.click(screen.getByRole("button", { name: /request quote/i }));

    expect(await screen.findByLabelText(/^company/i)).toBeInTheDocument();
    for (const name of [
      /contact name/i,
      /^phone/i,
      /^email/i,
      /gst number/i,
      /designation/i,
      /preferred delivery date/i,
      /notes/i,
    ]) {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    }
  });

  it("generates unique ids so several instances can coexist", async () => {
    // The dialog is mounted three times on a typical page (desktop navbar,
    // mobile navbar, in-page CTA). Duplicate ids would bind every label to the
    // first instance's input.
    const user = userEvent.setup();
    const { container } = wrap(
      <>
        <RfqDialog trigger={<button>Open A</button>} sourceSection="a" />
        <RfqDialog trigger={<button>Open B</button>} sourceSection="b" />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /open a/i }));
    await screen.findByLabelText(/contact name/i);

    const ids = Array.from(container.ownerDocument.querySelectorAll("input[id]")).map(
      (el) => el.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});
