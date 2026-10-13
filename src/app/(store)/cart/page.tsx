import Link from "next/link";
import { getCartLines } from "@/lib/cart";
import { formatNgn } from "@/lib/currency";
import { multiplyKobo } from "@/lib/currency";
import { PageHeading } from "@/components/storefront/page-heading";
import { EmptyState } from "@/components/storefront/empty-state";
import { Button } from "@/components/ui/button";
import { removeCartItem, updateCartItem } from "@/lib/actions/cart";
import { ProductImagePlaceholder } from "@/components/storefront/product-image-placeholder";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const lines = await getCartLines();
  const subtotal = lines.reduce(
    (sum, line) => sum + multiplyKobo(line.unitPriceKobo, line.quantity),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeading title="Your bag" description="Review items before checkout." />
      {lines.length === 0 ? (
        <EmptyState
          title="Your bag is empty"
          description="When you find something you love, it'll live here until you're ready."
          actionHref="/shop"
          actionLabel="Start shopping"
        />
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-border border border-border">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 p-4 sm:gap-6">
                <Link href={`/products/${line.slug}`} className="w-24 shrink-0 sm:w-28">
                  {line.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.imageUrl} alt="" className="aspect-[3/4] w-full object-cover" />
                  ) : (
                    <ProductImagePlaceholder className="aspect-[3/4]" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-2">
                  <Link href={`/products/${line.slug}`} className="font-display text-lg hover:underline">
                    {line.name}
                  </Link>
                  <p className="text-sm font-medium">{formatNgn(line.unitPriceKobo)}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <form action={updateCartItem} className="flex items-center gap-2">
                      <input type="hidden" name="itemId" value={line.id} />
                      <label className="sr-only" htmlFor={`qty-${line.id}`}>
                        Quantity
                      </label>
                      <input
                        id={`qty-${line.id}`}
                        name="quantity"
                        type="number"
                        min={1}
                        max={Math.max(1, line.stock)}
                        defaultValue={line.quantity}
                        className="h-9 w-16 border border-input px-2 text-sm"
                      />
                      <Button type="submit" variant="outline" size="sm">
                        Update
                      </Button>
                    </form>
                    <form action={removeCartItem}>
                      <input type="hidden" name="itemId" value={line.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
                <p className="text-sm font-medium">{formatNgn(multiplyKobo(line.unitPriceKobo, line.quantity))}</p>
              </li>
            ))}
          </ul>
          <aside className="h-fit border border-border bg-card p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatNgn(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Delivery calculated at checkout.</p>
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
