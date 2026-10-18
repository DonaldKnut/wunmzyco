"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ShoppingBag, Check } from "lucide-react";
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
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`} className="relative block">
          <ProductImageZoom
            src={product.coverImage?.url}
            alt={product.coverImage?.alt ?? product.name}
            compact
            className="transition-transform duration-700 ease-out"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.isOneOfOne ? <Badge variant="accent">One of one</Badge> : null}
          {soldOut ? <Badge variant="secondary">Sold out</Badge> : null}
          {onSale && !soldOut ? <Badge variant="secondary">Sale</Badge> : null}
        </div>

        {!soldOut ? (
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending}
            className={cn(
              "absolute bottom-3 left-3 right-3 flex translate-y-3 items-center justify-center gap-2 bg-primary px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground opacity-0 shadow-md transition-all duration-300 ease-out",
              "group-hover:translate-y-0 group-hover:opacity-100",
              "hover:bg-primary/90 focus-visible:translate-y-0 focus-visible:opacity-100",
              pending && "opacity-80",
              added && "bg-[#2d4a2d] opacity-100 translate-y-0",
            )}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className={cn("h-3.5 w-3.5 transition-transform", pending && "animate-pulse")} />
                {pending ? "Adding…" : "Add to bag"}
              </>
            )}
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-1 transition-transform duration-300 group-hover:-translate-y-0.5">
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-lg leading-snug transition-colors hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{formatNgn(price)}</span>
          {onSale ? (
            <span className="text-muted-foreground line-through">{formatNgn(product.priceKobo)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
