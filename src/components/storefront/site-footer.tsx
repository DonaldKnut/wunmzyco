import Link from "next/link";
import { Phone, ShieldCheck, CreditCard, Sparkles, Truck } from "lucide-react";
import { getStoreSettings } from "@/lib/store/settings";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { BRAND, whatsappLink } from "@/lib/brand";

const shopLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search Rail" },
  { href: "/track-order", label: "Track Your Order" },
];

const helpLinks = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/returns-policy", label: "Returns & Exchanges" },
  { href: "/contact", label: "Stylist Concierge" },
];

const companyLinks = [
  { href: "/about", label: "About Wunmzy Co" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export async function SiteFooter() {
  const settings = await getStoreSettings();
  const year = new Date().getFullYear();
  const phone = settings.whatsappNumber || BRAND.whatsappNumber;
  const wa = whatsappLink(phone, "Hi Wunmzy Co — I’d like personal styling help.");

  return (
    <footer className="mt-auto border-t border-[#e8e2d7] bg-[#121110] text-[#fbf9f5]">
      {/* Top Value Assurance Ribbon */}
      <div className="border-b border-white/10 bg-white/5 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4af37]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">One-of-One Finds</p>
              <p className="text-[11px] text-white/60">Individually Curated Thrift</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4af37]">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Lagos Same-Day</p>
              <p className="text-[11px] text-white/60">Fast Nationwide Shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4af37]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Paystack Secured</p>
              <p className="text-[11px] text-white/60">Cards, Transfer, & USSD</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d4af37]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">WhatsApp Support</p>
              <p className="text-[11px] text-white/60">Real-Time Stylist Care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div className="space-y-5">
            <div className="inline-block rounded-xl bg-white/95 p-2">
              <BrandLogo src={settings.logoUrl} name={settings.storeName} className="h-10 sm:h-12 w-auto" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              {BRAND.category}
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-white/70">
              {settings.tagline} — Styling looks for Corporate, Street, Dinner, and Party.
            </p>
            <p className="text-xs font-medium tracking-wide text-white/90">
              {BRAND.slogan}
            </p>

            <div className="space-y-2 pt-2 text-xs text-white/70">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="block transition hover:text-[#d4af37]"
              >
                {settings.contactEmail}
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-[#d4af37]"
              >
                <Phone className="h-3.5 w-3.5 text-[#d4af37]" />
                WhatsApp: {BRAND.whatsappDisplay}
              </a>
            </div>

            {/* Social pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-semibold uppercase tracking-wider">
              {settings.facebookUrl ? (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 transition hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  Facebook
                </a>
              ) : null}
              {settings.instagramUrl ? (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 transition hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  Instagram
                </a>
              ) : null}
              {settings.tiktokUrl ? (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 transition hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  TikTok
                </a>
              ) : null}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              The Edit
            </p>
            <ul className="space-y-3 text-xs">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Occasions
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {BRAND.occasions.map((occ) => (
                <Link
                  key={occ}
                  href={`/shop?q=${occ.toLowerCase()}`}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/80 transition hover:border-[#d4af37] hover:text-white"
                >
                  {occ}
                </Link>
              ))}
            </div>
          </div>

          {/* Concierge & Help */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Concierge & Care
            </p>
            <ul className="space-y-3 text-xs">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* House of Wunmzy */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              House of Wunmzy
            </p>
            <ul className="space-y-3 text-xs">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row text-xs text-white/50">
          <p>© {year} {settings.storeName}. All rights reserved.</p>
          <p className="text-[11px] tracking-wide text-white/40">
            Designed for Nigerian Fashion & Global Discerning Women.
          </p>
        </div>
      </div>
    </footer>
  );
}
