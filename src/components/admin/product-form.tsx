"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Category, Product, ProductImage, ProductStatus } from "@prisma/client";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { koboToNaira } from "@/lib/currency";
import { createProduct, updateProduct } from "@/server/actions/products";
import { Button, Field, Input, Select, Textarea } from "@/components/admin/ui";

type ProductWithRelations = Product & {
  categories: { categoryId: string }[];
  images?: ProductImage[];
};

type DraftImage = {
  url: string;
  publicId?: string | null;
  alt?: string;
  isCover: boolean;
};

export function ProductForm({
  categories,
  product,
  submitLabel,
  onSuccess,
}: {
  categories: Category[];
  product?: ProductWithRelations;
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<DraftImage[]>(
    () =>
      product?.images?.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        alt: img.alt ?? "",
        isCover: img.isCover,
      })) ?? [],
  );
  const selected = new Set(product?.categories.map((c) => c.categoryId) ?? []);

  async function onUpload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "products");
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = (await res.json()) as {
        ok?: boolean;
        data?: { url: string; publicId: string };
        error?: string;
      };
      if (!res.ok || !json.data?.url) {
        throw new Error(json.error ?? "Upload failed");
      }
      setImages((prev) => [
        ...prev,
        {
          url: json.data!.url,
          publicId: json.data!.publicId,
          alt: "",
          isCover: prev.length === 0,
        },
      ]);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length && !next.some((img) => img.isCover)) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });
  }

  function setCover(index: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, isCover: i === index })));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("imagesJson", JSON.stringify(images));
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

      <Field label="Product images">
        <div className="space-y-3 rounded-md border border-[#d8d3c8] bg-white p-3">
          {images.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((img, index) => (
                <li key={`${img.url}-${index}`} className="group relative overflow-hidden rounded-md border border-[#e8e4dc]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || ""} className="aspect-square w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-[#111]/70 p-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded bg-white/90 text-[10px] font-medium text-[#1a1a18]"
                      title="Set as cover"
                    >
                      <Star className={`h-3 w-3 ${img.isCover ? "fill-current" : ""}`} />
                      {img.isCover ? "Cover" : "Cover"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded bg-white/90 text-[#8b3a3a]"
                      title="Remove"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {img.isCover ? (
                    <span className="absolute left-1 top-1 rounded bg-[#1a1a18] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#d8d3c8] bg-[#faf8f5] px-4 py-8 text-center">
              <ImagePlus className="h-6 w-6 text-[#7a776f]" />
              <p className="text-xs text-[#5c5a54]">Upload photos — stored on Cloudinary.</p>
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#d8d3c8] bg-[#faf8f5] px-3 py-2 text-xs font-medium text-[#1a1a18] hover:bg-[#f0ebe3]">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={uploading || pending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </Field>

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
        <Button type="submit" disabled={pending || uploading}>
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
