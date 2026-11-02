"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Category, Product } from "@prisma/client";
import { toast } from "sonner";
import {
  setCategoryProducts,
  upsertCategory,
} from "@/server/actions/catalog";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button, Field, Input, Textarea } from "@/components/admin/ui";

type ProductOption = Pick<Product, "id" | "name" | "sku" | "status" | "stock">;

export function CategoryForm({
  category,
  products = [],
  selectedProductIds = [],
  submitLabel,
  onSuccess,
}: {
  category?: Category;
  products?: ProductOption[];
  selectedProductIds?: string[];
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedProductIds),
  );
  const isEdit = Boolean(category);

  function toggleProduct(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await upsertCategory(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const categoryId = category?.id ?? result.data?.id;
      if (categoryId && products.length > 0) {
        const assign = await setCategoryProducts(categoryId, [...selected]);
        if (!assign.ok) {
          toast.error(assign.error);
          return;
        }
      }

      toast.success(isEdit ? "Category updated" : "Category created");
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <Field
        label="Name"
        hint="The category title shoppers see in the shop directory (e.g. Dinner, Tops)."
      >
        <Input name="name" defaultValue={category?.name} required disabled={pending} />
      </Field>
      <Field
        label="Slug"
        hint="Optional short URL (e.g. dinner). Leave blank and we’ll create one from the name."
      >
        <Input
          name="slug"
          defaultValue={category?.slug || undefined}
          placeholder="auto from name"
          disabled={pending}
        />
      </Field>
      <Field label="Sort order" hint="Lower numbers appear first in the category list.">
        <Input
          name="sortOrder"
          type="number"
          defaultValue={category?.sortOrder ?? 0}
          disabled={pending}
        />
      </Field>
      <Field
        label="Active"
        hint="When on, this category is visible on the storefront. New categories are always turned on."
      >
        <label className="flex h-9 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={category?.isActive ?? true}
            value="on"
            className="rounded"
            disabled={pending}
          />
          Visible in catalog
        </label>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description" hint="Optional short blurb under the category name.">
          <Textarea
            name="description"
            defaultValue={category?.description ?? ""}
            disabled={pending}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Category image" hint="Optional cover image for the category card.">
          <ImageUploadField
            name="imageUrl"
            folder="categories"
            defaultValue={category?.imageUrl}
            disabled={pending}
          />
        </Field>
      </div>

      {products.length > 0 ? (
        <div className="sm:col-span-2 space-y-2">
          <Field
            label="Products in this category"
            hint="Tick products that belong here. You can change this anytime — the count updates on the categories list."
          >
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-[#d8d3c8] bg-white p-3">
              <p className="mb-2 text-[11px] text-[#7a776f]">
                {selected.size} selected · {products.length} products available
              </p>
              {products.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-start gap-2 rounded px-1 py-1.5 text-sm hover:bg-[#faf8f5]"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="mt-0.5 rounded border-[#d8d3c8]"
                    disabled={pending}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-[#1a1a18]">{p.name}</span>
                    <span className="mt-0.5 block text-[11px] text-[#7a776f]">
                      {p.sku} · {p.status} · stock {p.stock}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Field>
        </div>
      ) : null}

      <Button type="submit" className="sm:col-span-2" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
