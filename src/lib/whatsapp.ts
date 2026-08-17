export const WHATSAPP_NUMBER = "917539931361";

export type CtaType = "distributor" | "restaurant";
export type Variant = "9mm" | "10mm" | "11mm";

export const ALL_VARIANTS: Variant[] = ["9mm", "10mm", "11mm"];

export function buildDistributorMessage(variants: Variant[]): string {
  const list = variants.length === 0
    ? "• (variants to be discussed)"
    : variants.map((v) => `• Classic Cut ${v}`).join("\n");
  return `Hello The Nilgiri Root team,

I'm interested in becoming a *distributor* for your premium frozen french fries.

Please share pricing and trade terms for the following variants:
${list}

────────────────────
My Details
────────────────────
Company Name: 
Contact Person: 
City / State: 
Estimated Monthly Volume (KG): 
Existing Distribution Network: 

Looking forward to partnering with you.`;
}

export function buildRestaurantMessage(variants: Variant[]): string {
  const list = variants.length === 0
    ? "• (variants to be discussed)"
    : variants.map((v) => `• Classic Cut ${v}`).join("\n");
  return `Hello The Nilgiri Root team,

I run a *restaurant / cafe / cloud kitchen* and would like to order your blast-frozen french fries in bulk.

Please share HORECA pricing for:
${list}

────────────────────
My Details
────────────────────
Outlet Name: 
Contact Person: 
City: 
Monthly Requirement (KG): 
Preferred Delivery Frequency: 

Looking forward to your quote.`;
}

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function messageFor(type: CtaType, variants: Variant[]): string {
  return type === "distributor"
    ? buildDistributorMessage(variants)
    : buildRestaurantMessage(variants);
}
