"use client";

import { Search, ShoppingBag } from "lucide-react";
import { useStorefrontUi } from "@/components/providers/storefront-ui-provider";
import { cn } from "@/lib/utils";

export function HeaderClientActions({ cartCount }: { cartCount: number }) {
  const { toggleSearch, toggleCart, cartBump } = useStorefrontUi();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleSearch}
        className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-foreground/30 hover:bg-card hover:text-foreground"
        aria-label="Search (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5 transition group-hover:scale-110" />
        <span className="hidden sm:inline font-normal">Search</span>
        <kbd className="hidden lg:inline-flex h-4 items-center rounded border border-border/80 bg-muted/60 px-1 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={toggleCart}
        className={cn(
          "relative inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-foreground/30 hover:bg-card hover:shadow-xs",
          cartBump > 0 && "animate-[bag-bounce_0.45s_ease]",
        )}
        aria-label={`Open cart${cartCount ? `, ${cartCount} items` : ""}`}
      >
        <ShoppingBag className="h-3.5 w-3.5 text-accent" />
        <span className="hidden sm:inline">Bag</span>
        {cartCount > 0 ? (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#121110] px-1 text-[10px] font-bold text-[#fbf9f5] shadow-xs">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
