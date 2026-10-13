"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBagIllustration } from "@/components/storefront/illustrations";
import { useStorefrontUi } from "@/components/providers/storefront-ui-provider";
import { formatNgn } from "@/lib/currency";

type CartLine = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    priceKobo: number;
    salePriceKobo: number | null;
    images: { url: string; alt: string | null }[];
  };
  variant: { name: string } | null;
};

function unitPrice(line: CartLine) {
  const sale = line.product.salePriceKobo;
  if (sale != null && sale < line.product.priceKobo) return sale;
  return line.product.priceKobo;
}

export function CartDrawer() {
  const { cartOpen, closeCart, cartBump } = useStorefrontUi();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      const json = await res.json();
      if (json.ok) setItems(json.data.cart.items ?? []);
    } catch {
      // keep prior
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cartOpen) void load();
  }, [cartOpen, cartBump, load]);

  async function updateQty(itemId: string, quantity: number) {
    await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ itemId, quantity }),
    });
    await load();
  }

  async function removeItem(itemId: string) {
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ itemId }),
    });
    await load();
  }

  const subtotal = items.reduce((sum, line) => sum + unitPrice(line) * line.quantity, 0);

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => (!open ? closeCart() : undefined)}>
      <SheetContent className="bg-[#faf7f1]">
        <SheetHeader>
          <SheetTitle>Your bag</SheetTitle>
          <SheetDescription>
            {items.length === 0 ? "Nothing here yet" : `${items.length} item${items.length === 1 ? "" : "s"}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <ShoppingBagIllustration />
              <p className="font-display text-xl">Your bag is empty</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Discover curated pieces in the shop and add them here.
              </p>
              <Button asChild onClick={closeCart}>
                <Link href="/shop">Browse shop</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((line) => {
                const img = line.product.images[0];
                const price = unitPrice(line);
                return (
                  <li key={line.id} className="flex gap-3 border-b border-border/70 pb-5">
                    <Link
                      href={`/products/${line.product.slug}`}
                      onClick={closeCart}
                      className="relative h-24 w-20 shrink-0 overflow-hidden bg-muted"
                    >
                      {img?.url ? (
                        img.url.startsWith("/") ? (
                          <Image src={img.url} alt={img.alt ?? line.product.name} fill className="object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img.url} alt={img.alt ?? line.product.name} className="h-full w-full object-cover" />
                        )
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground">
                          No image
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${line.product.slug}`}
                        onClick={closeCart}
                        className="font-display text-lg leading-snug hover:underline"
                      >
                        {line.product.name}
                      </Link>
                      {line.variant ? (
                        <p className="text-xs text-muted-foreground">{line.variant.name}</p>
                      ) : null}
                      <p className="mt-1 text-sm font-medium">{formatNgn(price)}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded border border-border p-1 transition hover:bg-secondary"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(line.id, Math.max(0, line.quantity - 1))}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                        <button
                          type="button"
                          className="rounded border border-border p-1 transition hover:bg-secondary"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(line.id, line.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-muted-foreground transition hover:text-destructive"
                          aria-label="Remove item"
                          onClick={() => removeItem(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="space-y-3 border-t border-border px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatNgn(subtotal)}</span>
            </div>
            <Button asChild className="w-full" size="lg" onClick={closeCart}>
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" onClick={closeCart}>
              <Link href="/cart">View full cart</Link>
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
