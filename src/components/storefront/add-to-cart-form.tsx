"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Minus, Plus, Trash2 } from "lucide-react";
import { addToCart, removeProductFromCart, setProductCartQuantity } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatNgn } from "@/lib/currency";
import { useStorefrontUi } from "@/components/providers/storefront-ui-provider";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  name: string;
  stock: number;
  priceKobo: number | null;
  salePriceKobo: number | null;
};

type AddToCartFormProps = {
  productId: string;
  stock: number;
  hasVariants: boolean;
  variants: Variant[];
  basePriceKobo: number;
  /** Current quantity already in cart for this product (default variant or first). */
  initialCartQuantity?: number;
  isOneOfOne?: boolean;
};

export function AddToCartForm({
  productId,
  stock,
  hasVariants,
  variants,
  basePriceKobo,
  initialCartQuantity = 0,
  isOneOfOne = false,
}: AddToCartFormProps) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [cartQty, setCartQty] = useState(initialCartQuantity);
  const [pending, startTransition] = useTransition();
  const { bumpCart, openCart } = useStorefrontUi();

  const selected = variants.find((v) => v.id === variantId);
  const available = hasVariants ? (selected?.stock ?? 0) : stock;
  const maxQty = isOneOfOne ? 1 : Math.max(1, available);
  const disabled = available <= 0;

  function clampQty(n: number) {
    return Math.min(maxQty, Math.max(1, n));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("quantity", String(quantity));
    startTransition(async () => {
      const result = await addToCart(formData);
      if (result.ok) {
        toast.success(result.message);
        setCartQty((q) => q + quantity);
        bumpCart();
        openCart();
      } else {
        toast.error(result.message);
      }
    });
  }

  function onSetCartQuantity(next: number) {
    startTransition(async () => {
      const result = await setProductCartQuantity({
        productId,
        variantId: hasVariants ? variantId || null : null,
        quantity: next,
      });
      if (result.ok) {
        setCartQty(next);
        bumpCart();
        toast.success(next === 0 ? "Removed from bag" : "Bag updated");
        if (next > 0) openCart();
      } else {
        toast.error(result.message);
      }
    });
  }

  function onRemove() {
    startTransition(async () => {
      const result = await removeProductFromCart({
        productId,
        variantId: hasVariants ? variantId || null : null,
      });
      if (result.ok) {
        setCartQty(0);
        bumpCart();
        toast.success("Removed from bag");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      {hasVariants && variants.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="variantId">Option</Label>
          <select
            id="variantId"
            name="variantId"
            className="flex h-10 w-full border border-input bg-background px-3 text-sm"
            value={variantId}
            onChange={(e) => {
              setVariantId(e.target.value);
              setQuantity(1);
            }}
            required
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.name}
                {v.stock <= 0 ? " — sold out" : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={disabled || quantity <= 1 || pending}
            onClick={() => setQuantity((q) => clampQty(q - 1))}
            className="inline-flex h-10 w-10 items-center justify-center border border-input disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(e) => setQuantity(clampQty(Number(e.target.value) || 1))}
            className="h-10 w-16 border border-input bg-background px-2 text-center text-sm tabular-nums"
            disabled={disabled || pending}
          />
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={disabled || quantity >= maxQty || pending}
            onClick={() => setQuantity((q) => clampQty(q + 1))}
            className="inline-flex h-10 w-10 items-center justify-center border border-input disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">
            {available > 0 ? `${available} in stock` : "Sold out"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={disabled || pending}>
          {disabled ? "Sold out" : pending ? "Updating…" : "Add to bag"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {formatNgn(selected?.salePriceKobo ?? selected?.priceKobo ?? basePriceKobo)}
        </span>
      </div>

      {cartQty > 0 ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 border border-border bg-muted/30 px-3 py-2.5 text-sm",
          )}
        >
          <span className="text-muted-foreground">
            In bag: <strong className="text-foreground tabular-nums">{cartQty}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Decrease bag quantity"
              disabled={pending || cartQty <= 1}
              onClick={() => onSetCartQuantity(cartQty - 1)}
              className="inline-flex h-8 w-8 items-center justify-center border border-input bg-background disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Increase bag quantity"
              disabled={pending || cartQty >= maxQty}
              onClick={() => onSetCartQuantity(cartQty + 1)}
              className="inline-flex h-8 w-8 items-center justify-center border border-input bg-background disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Remove from bag"
              disabled={pending}
              onClick={onRemove}
              className="inline-flex h-8 items-center gap-1.5 border border-input bg-background px-2 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
