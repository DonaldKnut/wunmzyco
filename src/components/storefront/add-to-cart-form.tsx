"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { addToCart } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatNgn } from "@/lib/currency";

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
};

export function AddToCartForm({
  productId,
  stock,
  hasVariants,
  variants,
  basePriceKobo,
}: AddToCartFormProps) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const selected = variants.find((v) => v.id === variantId);
  const available = hasVariants ? (selected?.stock ?? 0) : stock;
  const disabled = available <= 0;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addToCart(formData);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
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
            onChange={(e) => setVariantId(e.target.value)}
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
      <input type="hidden" name="quantity" value="1" />
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={disabled || pending}>
          {disabled ? "Sold out" : pending ? "Adding…" : "Add to bag"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {formatNgn(selected?.salePriceKobo ?? selected?.priceKobo ?? basePriceKobo)}
        </span>
      </div>
    </form>
  );
}
