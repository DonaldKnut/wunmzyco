import Link from "next/link";
import { Suspense } from "react";
import { User } from "lucide-react";
import { getStoreSettings } from "@/lib/store/settings";
import { getCartItemCount } from "@/lib/cart";
import { getSessionUser } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderClientActions } from "@/components/storefront/header-client-actions";
import { SearchDropdown } from "@/components/storefront/search-dropdown";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/shop", label: "Shop All" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "Our Story" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Concierge" },
];

async function AccountLink() {
  const user = await getSessionUser();
  const staff = user && isStaffRole(user.role);
  const href = staff ? "/admin" : user ? "/account" : "/login";
  const label = staff ? "Admin Suite" : user ? user.name.split(" ")[0] ?? "Account" : "Sign In";
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-xs font-medium tracking-wide text-foreground transition-all duration-200 hover:border-foreground/30 hover:bg-card hover:shadow-xs"
    >
      <User className="h-3.5 w-3.5 text-accent" />
      <span>{label}</span>
    </Link>
  );
}

export async function SiteHeader() {
  const [settings, cartCount] = await Promise.all([getStoreSettings(), getCartItemCount()]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e2d7]/80 bg-[#fbf9f5]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#fbf9f5]/75">
      <div className="relative">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {/* Logo with luxury presentation */}
          <div className="flex shrink-0 items-center">
            <BrandLogo src={settings.logoUrl} name={settings.storeName} priority />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Client Action Icons & Account */}
          <div className="flex items-center gap-3 sm:gap-4">
            <HeaderClientActions cartCount={cartCount} />
            <Suspense fallback={<Skeleton className="h-8 w-20 rounded-full" />}>
              <AccountLink />
            </Suspense>
          </div>
        </div>

        <SearchDropdown />
        <CartDrawer />
      </div>

      {/* Mobile Navigation Strip */}
      <nav
        className={cn(
          "flex gap-4 overflow-x-auto border-t border-border/60 bg-secondary/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] md:hidden scrollbar-none",
        )}
        aria-label="Mobile"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-border/60 bg-card/60 px-3 py-1 text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
