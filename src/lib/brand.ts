/** Canonical Wunmzy Co brand copy from official identity. */
export const BRAND = {
  storeName: "Wunmzy Co",
  category: "Fashion & Accessories",
  occasions: ["Corporate", "Street", "Dinner", "Party"] as const,
  tagline: "Outfit for every occasion",
  slogan: "BE BOLD. BE CONFIDENT. BE YOU.",
  contactEmail: "Wunmzy123@gmail.com",
  whatsappNumber: "+2347011726209",
  whatsappDisplay: "+234 701 172 6209",
  webHandle: "wunmzyco.com",
  /** Live public site — always use this for customer-facing product / share links. */
  siteUrl: "https://wunmzyco.com",
  facebookUrl: "https://www.facebook.com/wunmzy.co",
  instagramUrl: "https://www.instagram.com/wunmzy.co",
  tiktokUrl: "https://www.tiktok.com/@wunmzy.co",
  logoUrl: "/brand/wunmzy-logo.png",
  markUrl: "/brand/wunmzy-mark.png",
  brandCardUrl: "/brand/wunmzy-brand-card.png",
  homepageHeroTitle: "BE BOLD. BE CONFIDENT. BE YOU.",
  homepageHeroSubtitle:
    "Fashion & accessories for Corporate, Street, Dinner, and Party — outfit for every occasion.",
  announcementBar: "Fashion & Accessories · Corporate | Street | Dinner | Party",
  aboutCopy: `Wunmzy Co is a fashion and accessories brand styling looks for every occasion — Corporate, Street, Dinner, and Party.

We believe style should feel personal and empowering. Be bold. Be confident. Be you.

For inquiries and orders, contact us on WhatsApp or call +234 701 172 6209. Find us online at wunmzyco.com.`,
} as const;

/** Public product URL for WhatsApp / share messages (never localhost). */
export function productPublicUrl(slug: string) {
  return `${BRAND.siteUrl}/products/${slug}`;
}

export function whatsappLink(number: string = BRAND.whatsappNumber, message?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** WhatsApp text for asking about one item — always names it and links to it. */
export function productEnquiryMessage(productName: string, productUrl: string) {
  return [
    "Hi Wunmzy Co! I'd like to ask about this item:",
    "",
    `*${productName}*`,
    productUrl,
    "",
    "Is it still available? Please share sizes/measurements and delivery details.",
  ].join("\n");
}

/** WhatsApp text for a bag of items — one line per item with its link. */
export function cartEnquiryMessage(
  lines: { name: string; quantity: number; url: string }[],
  totalLabel: string,
) {
  return [
    "Hi Wunmzy Co! I'd like to order these items:",
    "",
    ...lines.map((l, i) => `${i + 1}. *${l.name}* × ${l.quantity}\n${l.url}`),
    "",
    `Total: ${totalLabel}`,
  ].join("\n");
}
