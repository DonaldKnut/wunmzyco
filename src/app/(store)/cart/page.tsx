import Link from "next/link";
import { getCartLines } from "@/lib/cart";
import { formatNgn } from "@/lib/currency";
import { multiplyKobo } from "@/lib/currency";
import { EmptyState } from "@/components/storefront/empty-state";
import { Button } from "@/components/ui/button";
import { removeCartItem, updateCartItem } from "@/lib/actions/cart";
import { ProductImagePlaceholder } from "@/components/storefront/product-image-placeholder";
import { ShoppingBagIllustration } from "@/components/storefront/illustrations";
import { ShieldCheck, Truck, Lock, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";

export const metadata = { title: "Your Shopping Bag · Wunmzy Co" };

export default async function CartPage() {
  const lines = await getCartLines();
  const subtotal = lines.reduce(
    (sum, line) => sum + multiplyKobo(line.unitPriceKobo, line.quantity),
    0,
  );

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const wa = whatsappLink(
    BRAND.whatsappNumber,
    `Hi Wunmzy Co — I’d like to complete my order of ${itemCount} piece(s) (Total: ${formatNgn(subtotal)}) via WhatsApp.`,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d] shadow-xs">
          <Sparkles className="h-3 w-3 text-[#d4af37]" /> Shopping Bag
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
          Review Your Selected Pieces
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? "piece" : "pieces"} in your bag
        </p>
      </div>

      {lines.length === 0 ? (
        <EmptyState
          illustration={<ShoppingBagIllustration />}
          title="Your bag is waiting"
          description="Explore our curated rail for one-of-a-kind vintage and contemporary thrift drops."
          actionHref="/shop"
          actionLabel="Explore the Rail"
        />
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          {/* Cart Items List */}
          <ul className="divide-y divide-border/80 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 p-5 sm:gap-6">
                <Link
                  href={`/products/${line.slug}`}
                  className="w-24 shrink-0 sm:w-28 aspect-[3/4] overflow-hidden rounded-xl bg-secondary/50 border border-border/60"
                >
                  {line.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.imageUrl}
                      alt={line.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <ProductImagePlaceholder className="h-full w-full" />
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-1">
                    <Link
                      href={`/products/${line.slug}`}
                      className="font-display text-xl font-medium text-foreground hover:text-accent transition-colors"
                    >
                      {line.name}
                    </Link>
                    <p className="text-sm font-semibold text-foreground">
                      {formatNgn(line.unitPriceKobo)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
                    <form action={updateCartItem} className="flex items-center gap-2">
                      <input type="hidden" name="itemId" value={line.id} />
                      <label className="sr-only" htmlFor={`qty-${line.id}`}>
                        Quantity
                      </label>
                      <span className="text-xs text-muted-foreground">Qty:</span>
                      <input
                        id={`qty-${line.id}`}
                        name="quantity"
                        type="number"
                        min={1}
                        max={Math.max(1, line.stock)}
                        defaultValue={line.quantity}
                        className="h-8 w-14 rounded-lg border border-input bg-background px-2 text-center text-xs font-semibold"
                      />
                      <Button type="submit" variant="outline" size="sm" className="h-8 text-xs rounded-lg">
                        Update
                      </Button>
                    </form>

                    <form action={removeCartItem}>
                      <input type="hidden" name="itemId" value={line.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-rose-700 hover:bg-rose-50"
                      >
                        Remove
                      </Button>
                    </form>

                    <div className="ml-auto font-semibold text-sm tabular-nums text-foreground">
                      {formatNgn(multiplyKobo(line.unitPriceKobo, line.quantity))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Order Summary Sidebar */}
          <aside className="h-fit rounded-2xl border border-border/80 bg-card p-6 shadow-md space-y-6">
            <h2 className="font-display text-2xl font-medium text-foreground border-b border-border/60 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                <span className="font-semibold tabular-nums text-foreground">{formatNgn(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Nationwide Shipping</span>
                <span>Calculated at Checkout</span>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <div className="flex justify-between text-base font-bold text-foreground">
                <span>Estimated Total</span>
                <span className="tabular-nums text-lg">{formatNgn(subtotal)}</span>
              </div>
            </div>

            <Button asChild className="w-full rounded-full py-6 text-xs uppercase tracking-[0.18em]" size="lg">
              <Link href="/checkout">
                <span>Proceed to Checkout</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {/* Alternative: Order via WhatsApp */}
            <div className="pt-2">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-50/60 py-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100/80"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Complete Order on WhatsApp</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#b38e5d]" />
                <span>256-bit Encrypted Checkout via Paystack</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-[#b38e5d]" />
                <span>Same-Day Dispatch Available in Lagos</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#b38e5d]" />
                <span>Individually Authenticated Curation</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
