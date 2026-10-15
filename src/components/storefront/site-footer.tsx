import Link from "next/link";
import { Phone } from "lucide-react";
import { getStoreSettings } from "@/lib/store/settings";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { Separator } from "@/components/ui/separator";
import { BRAND, whatsappLink } from "@/lib/brand";

const shopLinks = [
  { href: "/shop", label: "Shop all" },
  { href: "/search", label: "Search" },
  { href: "/track-order", label: "Track order" },
];

const helpLinks = [
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/returns-policy", label: "Returns" },
  { href: "/contact", label: "Contact" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export async function SiteFooter() {
  const settings = await getStoreSettings();
  const year = new Date().getFullYear();
  const phone = settings.whatsappNumber || BRAND.whatsappNumber;
  const wa = whatsappLink(phone, "Hi Wunmzy Co — I’d like to place an order.");

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <BrandLogo src={settings.logoUrl} name={settings.storeName} className="h-16 sm:h-20" />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {BRAND.category}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">{settings.tagline}</p>
            <p className="text-sm font-medium tracking-wide">{BRAND.slogan}</p>
            <div className="space-y-2 text-sm">
              <a href={`mailto:${settings.contactEmail}`} className="block underline-offset-4 hover:underline">
                {settings.contactEmail}
              </a>
              <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                <Phone className="h-3.5 w-3.5" />
                {BRAND.whatsappDisplay}
              </a>
              <a href={BRAND.siteUrl} target="_blank" rel="noreferrer" className="block underline-offset-4 hover:underline">
                {BRAND.webHandle}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium uppercase tracking-wider">
              {settings.facebookUrl ? (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">
                  Facebook
                </a>
              ) : null}
              {settings.instagramUrl ? (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">
                  Instagram
                </a>
              ) : null}
              {settings.tiktokUrl ? (
                <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1.5 hover:bg-secondary">
                  TikTok
                </a>
              ) : null}
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest">Shop</p>
            <ul className="space-y-2 text-sm">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Occasions</p>
            <p className="mt-2 text-sm text-muted-foreground">{BRAND.occasions.join(" · ")}</p>
          </div>
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest">Help</p>
            <ul className="space-y-2 text-sm">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest">Company</p>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Separator className="my-12" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div id="newsletter" className="space-y-3 scroll-mt-24">
            <p className="text-xs font-medium uppercase tracking-widest">Newsletter</p>
            <p className="max-w-md text-sm text-muted-foreground">
              New drops for every occasion — no spam, just good style.
            </p>
            <NewsletterForm />
          </div>
          <p className="text-xs text-muted-foreground">
            © {year} {settings.storeName}. Thanks for your patronage.
          </p>
        </div>
      </div>
    </footer>
  );
}
