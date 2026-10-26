"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ShoppingBag, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNgn } from "@/lib/currency";
import { effectiveUnitPrice, type ProductListItem } from "@/lib/store/products";
import { ProductImageZoom } from "@/components/storefront/product-image-zoom";
import { useStorefrontUi } from "@/components/providers/storefront-ui-provider";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductListItem;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const price = effectiveUnitPrice(product);
  const onSale =
    product.salePriceKobo != null && product.salePriceKobo < product.priceKobo;
  const soldOut = product.stock <= 0;
  const { openCart, bumpCart } = useStorefrontUi();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut || pending) return;
    startTransition(async () => {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
        bumpCart();
        openCart();
        setTimeout(() => setAdded(false), 1600);
      }
    });
  }

  return (
    <article className={cn("group flex flex-col", className)}>
      {/* Product Image Frame */}
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-300 group-hover:border-foreground/20 group-hover:shadow-md">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden">
          <ProductImageZoom
            src={product.coverImage?.url}
            alt={product.coverImage?.alt ?? product.name}
            compact
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle gradient vignette on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {/* Floating Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {product.isOneOfOne ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/60 bg-[#121110]/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#d4af37] backdrop-blur-md shadow-xs">
              <Sparkles className="h-2.5 w-2.5" /> One of One
            </span>
          ) : null}
          {soldOut ? (
            <Badge variant="secondary" className="rounded-full bg-[#121110]/80 text-[#fbf9f5] backdrop-blur-sm">
              Sold Out
            </Badge>
          ) : null}
          {onSale && !soldOut ? (
            <span className="inline-flex rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-xs">
              Sale
            </span>
          ) : null}
        </div>

        {/* Scarcity Pill (Only 1 left) */}
        {!soldOut && product.stock === 1 && !product.isOneOfOne ? (
          <div className="absolute right-3 top-3 z-10">
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-800 shadow-xs">
              Last 1 left
            </span>
          </div>
        ) : null}

        {/* Quick Add Bar */}
        {!soldOut ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending}
            className={cn(
              "absolute bottom-3 left-3 right-3 flex translate-y-4 items-center justify-center gap-2 rounded-lg bg-[#121110] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#fbf9f5] opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 ease-out z-20",
              "group-hover:translate-y-0 group-hover:opacity-100",
              "hover:bg-[#252422] focus-visible:translate-y-0 focus-visible:opacity-100",
              pending && "opacity-80",
              added && "bg-[#2d4a2d] text-white opacity-100 translate-y-0",
            )}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className={cn("h-3.5 w-3.5 text-[#d4af37] transition-transform", pending && "animate-pulse")} />
                {pending ? "Adding…" : "Quick Add"}
              </>
            )}
          </button>
        ) : null}
      </div>

      {/* Product Meta */}
      <div className="mt-3.5 space-y-1 px-1 transition-transform duration-300 group-hover:-translate-y-0.5">
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-lg font-medium leading-snug tracking-tight text-foreground transition-colors hover:text-accent line-clamp-1"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2.5 text-sm">
          <span className="font-semibold text-foreground">{formatNgn(price)}</span>
          {onSale ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatNgn(product.priceKobo)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
