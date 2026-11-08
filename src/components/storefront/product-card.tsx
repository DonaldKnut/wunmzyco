"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ShoppingBag, Check, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BRAND, productEnquiryMessage, whatsappLink } from "@/lib/brand";
import { formatNgn } from "@/lib/currency";
import { effectiveUnitPrice, type ProductListItem } from "@/lib/store/products";
import { ProductCardImageSlider } from "@/components/storefront/product-card-image-slider";
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

  const gallery =
    product.images?.length > 0
      ? product.images
      : product.coverImage
        ? [product.coverImage]
        : [];

  function handleAsk(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/products/${product.slug}`;
    window.open(
      whatsappLink(BRAND.whatsappNumber, productEnquiryMessage(product.name, url)),
      "_blank",
      "noopener,noreferrer",
    );
  }

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
        return;
      }
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(json?.error ?? "Could not add this item to your cart. Please try again.");
    });
  }

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-300 group-hover:border-foreground/20 group-hover:shadow-md">
        <div className="relative aspect-[3/4] overflow-hidden">
          <ProductCardImageSlider
            href={`/products/${product.slug}`}
            name={product.name}
            images={gallery}
          />
        </div>

        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isOneOfOne ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/60 bg-[#121110]/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#d4af37] shadow-xs backdrop-blur-md">
              <Sparkles className="h-2.5 w-2.5" /> One of One
            </span>
          ) : null}
          {soldOut ? (
            <Badge
              variant="secondary"
              className="rounded-full bg-[#121110]/80 text-[#fbf9f5] backdrop-blur-sm"
            >
              Sold Out
            </Badge>
          ) : null}
          {onSale && !soldOut ? (
            <span className="inline-flex rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-xs">
              Sale
            </span>
          ) : null}
        </div>

        {!soldOut && product.stock === 1 && !product.isOneOfOne ? (
          <div className="absolute right-3 top-3 z-10">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 shadow-xs">
              Last 1 left
            </span>
          </div>
        ) : null}

      </div>

      <div className="mt-2.5 flex flex-1 flex-col gap-2 px-0.5">
        <Link
          href={`/products/${product.slug}`}
          className="font-display line-clamp-2 text-base font-medium leading-snug tracking-tight text-foreground transition-colors hover:text-accent sm:line-clamp-1 sm:text-lg"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-semibold text-foreground">{formatNgn(price)}</span>
          {onSale ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatNgn(product.priceKobo)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || pending}
            title="Add to cart, then pay with Paystack or WhatsApp at checkout"
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors",
              soldOut
                ? "cursor-not-allowed bg-secondary text-muted-foreground"
                : added
                  ? "bg-[#2d4a2d] text-white"
                  : "bg-[#121110] text-[#fbf9f5] hover:bg-[#252422]",
            )}
          >
            {soldOut ? (
              "Sold out"
            ) : added ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden />
                Added
              </>
            ) : (
              <>
                <ShoppingBag
                  className={cn("h-3.5 w-3.5 text-[#d4af37]", pending && "animate-pulse")}
                  aria-hidden
                />
                {pending ? "Adding…" : "Add to cart"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleAsk}
            title="Chat with us on WhatsApp about this item"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-50/70 px-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            aria-label={`Ask about ${product.name} on WhatsApp`}
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            <span className="sm:hidden">Ask</span>
            <span className="hidden sm:inline">Ask on WhatsApp</span>
          </button>
        </div>
      </div>
    </article>
  );
}
