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
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

async function AccountLink() {
  const user = await getSessionUser();
  const staff = user && isStaffRole(user.role);
  const href = staff ? "/admin" : user ? "/account" : "/login";
  const label = staff ? "Admin" : user ? user.name.split(" ")[0] ?? "Account" : "Sign in";
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70">
      <User className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export async function SiteHeader() {
  const [settings, cartCount] = await Promise.all([getStoreSettings(), getCartItemCount()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="relative">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo src={settings.logoUrl} name={settings.storeName} priority />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <HeaderClientActions cartCount={cartCount} />
            <Suspense fallback={<Skeleton className="h-4 w-12" />}>
              <AccountLink />
            </Suspense>
          </div>
        </div>
        <SearchDropdown />
        <CartDrawer />
      </div>
      <nav
        className={cn(
          "flex gap-6 overflow-x-auto border-t border-border px-4 py-2 text-xs uppercase tracking-widest md:hidden",
        )}
        aria-label="Mobile"
      >
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap text-muted-foreground">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
