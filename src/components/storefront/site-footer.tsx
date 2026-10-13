import Link from "next/link";
import { getStoreSettings } from "@/lib/store/settings";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { Separator } from "@/components/ui/separator";

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

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="font-display text-2xl">{settings.storeName}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{settings.tagline}</p>
            <p className="text-sm">
              <a href={`mailto:${settings.contactEmail}`} className="underline-offset-4 hover:underline">
                {settings.contactEmail}
              </a>
            </p>
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
              New drops and restocks — no spam, just good style.
            </p>
            <NewsletterForm />
          </div>
          <p className="text-xs text-muted-foreground">
            © {year} {settings.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
