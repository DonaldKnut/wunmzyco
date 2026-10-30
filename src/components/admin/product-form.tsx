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
  const isEdit = Boolean(product);

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
      <Field
        label="Name"
        hint="Enter the product title shoppers will see. Clear names help people find and trust the item in search and on the product page."
      >
        <Input name="name" defaultValue={product?.name} required disabled={pending} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="SKU"
          hint="A unique product code used for inventory and orders. On new products this is created for you automatically — you don’t need to invent one."
        >
          {isEdit ? (
            <Input name="sku" defaultValue={product?.sku} readOnly disabled={pending} />
          ) : (
            <Input
              value="Auto-generated when you save"
              readOnly
              disabled
              className="text-[#7a776f]"
            />
          )}
        </Field>
        <Field
          label="Slug"
          hint="The short URL path for this product (e.g. /shop/silk-blouse). Leave blank to build it from the name. Needed so each product has a stable, shareable link."
        >
          <Input
            name="slug"
            defaultValue={product?.slug}
            placeholder="auto from name"
            disabled={pending}
          />
        </Field>
      </div>
      <Field
        label="Description"
        hint="Describe fabric, fit, condition, and what makes this piece special. Shoppers use this to decide whether to buy — be honest and specific."
      >
        <Textarea
          name="description"
          defaultValue={product?.description}
          required
          disabled={pending}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Price (₦)"
          hint="The regular selling price in naira. This is what customers pay unless a sale price is set. Required so checkout can charge the right amount."
        >
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
        <Field
          label="Sale price (₦)"
          hint="Optional discount price. Leave blank if there’s no sale. When set, shoppers see this instead of the regular price."
        >
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
        <Field
          label="Status"
          hint="Draft = only staff can see it. Published = live in the shop. Archived = hidden but kept for records. Publish only when photos and details are ready."
        >
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
        <Field
          label="Stock"
          hint="How many units you can sell right now. Checkout won’t sell more than this. Update it when you restock or sell offline."
        >
          <Input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            disabled={pending}
          />
        </Field>
        <Field
          label="Low stock at"
          hint="When stock falls to this number (or below), the item is treated as low stock so you know to restock. Use 2 if you’re unsure."
        >
          <Input
            name="lowStockAt"
            type="number"
            min="0"
            defaultValue={product?.lowStockAt ?? 2}
            disabled={pending}
          />
        </Field>
      </div>

      <Field
        label="Product images"
        hint="Upload clear photos of the actual item. The cover image is the main photo in the shop grid. Good photos reduce returns and build trust."
      >
        <div className="space-y-3 rounded-md border border-[#d8d3c8] bg-white p-3">
          {images.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((img, index) => (
                <li
                  key={`${img.url}-${index}`}
                  className="group relative overflow-hidden rounded-md border border-[#e8e4dc]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || ""}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-[#111]/70 p-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded bg-white/90 text-[10px] font-medium text-[#1a1a18]"
                      title="Set as cover"
                    >
                      <Star className={`h-3 w-3 ${img.isCover ? "fill-current" : ""}`} />
                      Cover
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
        <span className="inline-flex items-center gap-1.5">
          Feature on homepage
          <span className="group relative inline-flex">
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#cfc8bc] bg-[#f7f3ec] text-[10px] font-bold leading-none text-[#6b6459]"
              aria-label="Help: Feature on homepage"
            >
              ?
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-56 rounded-md border border-[#e8e2d7] bg-[#1a1a18] px-2.5 py-2 text-[11px] font-normal text-[#f7f3ec] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            >
              Tick this to highlight the product on the homepage featured section. Only works when
              status is Published.
            </span>
          </span>
        </span>
      </label>
      {categories.length > 0 ? (
        <Field
          label="Categories"
          hint="Choose where this product should appear in the shop (e.g. Dresses, Tops). Helps shoppers browse by type. You can select more than one."
        >
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
