import Link from "next/link";
import type { Category, Product, ProductStatus } from "@prisma/client";
import { koboToNaira } from "@/lib/currency";
import { Button, Field, Input, Select, Textarea } from "@/components/admin/ui";

type ProductWithCats = Product & { categories: { categoryId: string }[] };

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  product?: ProductWithCats;
  submitLabel: string;
}) {
  const selected = new Set(product?.categories.map((c) => c.categoryId) ?? []);

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <Field label="Name">
        <Input name="name" defaultValue={product?.name} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="SKU">
          <Input name="sku" defaultValue={product?.sku} required />
        </Field>
        <Field label="Slug">
          <Input name="slug" defaultValue={product?.slug} placeholder="auto from name" />
        </Field>
      </div>
      <Field label="Description">
        <Textarea name="description" defaultValue={product?.description} required />
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
          />
        </Field>
        <Field label="Sale price (₦)">
          <Input
            name="salePriceNaira"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              product?.salePriceKobo != null
                ? koboToNaira(product.salePriceKobo)
                : undefined
            }
          />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={product?.status ?? "DRAFT"}>
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
          />
        </Field>
        <Field label="Low stock at">
          <Input
            name="lowStockAt"
            type="number"
            min="0"
            defaultValue={product?.lowStockAt ?? 2}
          />
        </Field>
      </div>
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
                />
                {cat.name}
              </label>
            ))}
          </div>
        </Field>
      ) : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit">{submitLabel}</Button>
        <Link
          href="/admin/products"
          className="inline-flex h-9 items-center px-4 text-sm text-[#5c5a54] hover:text-[#1a1a18]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
