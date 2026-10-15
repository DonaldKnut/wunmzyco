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
  webHandle: "wunmzy.co",
  siteUrl: "https://wunmzy.co",
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

For inquiries and orders, contact us on WhatsApp or call +234 701 172 6209. Find us online at wunmzy.co.`,
} as const;

export function whatsappLink(number: string = BRAND.whatsappNumber, message?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
