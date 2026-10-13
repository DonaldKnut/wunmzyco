"use client";

import { Search, ShoppingBag } from "lucide-react";
import { useStorefrontUi } from "@/components/providers/storefront-ui-provider";
import { cn } from "@/lib/utils";

export function HeaderClientActions({ cartCount }: { cartCount: number }) {
  const { toggleSearch, toggleCart, cartBump } = useStorefrontUi();

  return (
    <>
      <button
        type="button"
        onClick={toggleSearch}
        className="inline-flex items-center justify-center rounded-full p-1.5 transition hover:bg-secondary"
        aria-label="Search (Ctrl+K)"
      >
        <Search className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={toggleCart}
        className={cn(
          "relative inline-flex items-center gap-1.5 rounded-full p-1.5 text-sm transition hover:bg-secondary",
          cartBump > 0 && "animate-[bag-bounce_0.45s_ease]",
        )}
        aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ""}`}
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden sm:inline">Bag</span>
        {cartCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-accent px-1 text-[10px] font-medium text-accent-foreground">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        ) : null}
      </button>
    </>
  );
}
