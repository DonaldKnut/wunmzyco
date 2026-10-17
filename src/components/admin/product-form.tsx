"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Category, Product, ProductStatus } from "@prisma/client";
import { toast } from "sonner";
import { koboToNaira } from "@/lib/currency";
import { createProduct, updateProduct } from "@/server/actions/products";
import { Button, Field, Input, Select, Textarea } from "@/components/admin/ui";

type ProductWithCats = Product & { categories: { categoryId: string }[] };

export function ProductForm({
  categories,
  product,
  submitLabel,
  onSuccess,
}: {
  categories: Category[];
  product?: ProductWithCats;
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const selected = new Set(product?.categories.map((c) => c.categoryId) ?? []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);
      if (result.ok) {
        toast.success(product ? "Product updated" : "Product created");
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input name="name" defaultValue={product?.name} required disabled={pending} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SKU">
          <Input name="sku" defaultValue={product?.sku} required disabled={pending} />
        </Field>
        <Field label="Slug">
          <Input
            name="slug"
            defaultValue={product?.slug}
            placeholder="auto from name"
            disabled={pending}
          />
        </Field>
      </div>
      <Field label="Description">
        <Textarea
          name="description"
          defaultValue={product?.description}
          required
          disabled={pending}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (₦)">
          <Input
            name="priceNaira"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product ? koboToNaira(product.priceKobo) : undefined}
            required
            disabled={pending}
          />
        </Field>
        <Field label="Sale price (₦)">
          <Input
            name="salePriceNaira"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              product?.salePriceKobo != null ? koboToNaira(product.salePriceKobo) : undefined
            }
            disabled={pending}
          />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={product?.status ?? "DRAFT"} disabled={pending}>
            {(["DRAFT", "PUBLISHED", "ARCHIVED"] as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Stock">
          <Input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            disabled={pending}
          />
        </Field>
        <Field label="Low stock at">
          <Input
            name="lowStockAt"
            type="number"
            min="0"
            defaultValue={product?.lowStockAt ?? 2}
            disabled={pending}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-[#3d3b36]">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={product?.isFeatured}
          className="rounded border-[#d8d3c8]"
          disabled={pending}
        />
        Feature on homepage
      </label>
      {categories.length > 0 ? (
        <Field label="Categories">
          <div className="flex flex-wrap gap-3 rounded-md border border-[#d8d3c8] bg-white p-3">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={cat.id}
                  defaultChecked={selected.has(cat.id)}
                  className="rounded border-[#d8d3c8]"
                  disabled={pending}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </Field>
      ) : null}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
      <p className="text-xs text-[#7a776f]">
        Set status to <strong>PUBLISHED</strong> for the product to appear in shop and homepage
        (featured items need the checkbox above).
      </p>
    </form>
  );
}
