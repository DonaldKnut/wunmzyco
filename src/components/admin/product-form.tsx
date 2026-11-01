"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Category, Product, ProductImage, ProductStatus } from "@prisma/client";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { koboToNaira } from "@/lib/currency";
import { createProduct, updateProduct } from "@/server/actions/products";
import { Button, Field, FieldHelp, Input, Select, Textarea } from "@/components/admin/ui";

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

  async function onUploadFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) {
      toast.error("Please choose image files (JPEG, PNG, WebP, or GIF).");
      return;
    }

    const room = Math.max(0, 12 - images.length);
    if (room === 0) {
      toast.error("You can add up to 12 photos per product.");
      return;
    }
    const files = incoming.slice(0, room);
    if (incoming.length > room) {
      toast.message(`Only ${room} more photo${room === 1 ? "" : "s"} can be added (max 12).`);
    }

    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of files) {
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
          throw new Error(json.error ?? `Could not upload ${file.name}`);
        }
        const uploadedUrl = json.data.url;
        const uploadedPublicId = json.data.publicId;
        setImages((prev) => [
          ...prev,
          {
            url: uploadedUrl,
            publicId: uploadedPublicId,
            alt: "",
            isCover: prev.length === 0,
          },
        ]);
        uploaded += 1;
      }
      toast.success(
        uploaded === 1 ? "Image uploaded" : `${uploaded} images uploaded`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    const target = images[index];
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length && !next.some((img) => img.isCover)) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });
    toast.success("Image removed");
    // Best-effort Cloudinary cleanup — form save still drops it from the product.
    if (target?.publicId) {
      void fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: target.publicId }),
      }).catch(() => {
        /* ignore network failures; product save is source of truth */
      });
    }
  }

  function setCover(index: number) {
    setImages((prev) => {
      const marked = prev.map((img, i) => ({ ...img, isCover: i === index }));
      // Keep cover first so shop cards open on the chosen photo.
      const cover = marked[index];
      if (!cover) return marked;
      return [cover, ...marked.filter((_, i) => i !== index)];
    });
    toast.success("Cover photo updated");
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
        hint="Select several photos at once if you like. Remove any you don’t want. Use Set as cover for the main shop photo — shoppers can swipe the rest on product cards."
      >
        <div className="space-y-3 rounded-md border border-[#d8d3c8] bg-white p-3">
          {images.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((img, index) => (
                <li
                  key={`${img.url}-${index}`}
                  className={
                    img.isCover
                      ? "relative overflow-hidden rounded-md border-2 border-[#1a1a18]"
                      : "relative overflow-hidden rounded-md border border-[#e8e4dc]"
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || ""}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={pending || uploading}
                    className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8b3a3a] text-white shadow-md ring-2 ring-white hover:bg-[#6f2424] disabled:opacity-50"
                    title="Remove this photo"
                    aria-label="Remove this photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {img.isCover ? (
                    <span className="absolute left-1.5 top-1.5 rounded bg-[#1a1a18] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-[#111]/80 to-transparent p-1.5 pt-6">
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      disabled={pending || uploading || img.isCover}
                      className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded bg-white/95 text-[10px] font-medium text-[#1a1a18] disabled:opacity-70"
                      title="Use as main shop photo"
                    >
                      <Star className={`h-3 w-3 ${img.isCover ? "fill-current" : ""}`} />
                      {img.isCover ? "Main photo" : "Set as cover"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={pending || uploading}
                      className="inline-flex h-7 items-center gap-1 rounded bg-white/95 px-2 text-[10px] font-medium text-[#8b3a3a]"
                      title="Remove this photo"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#d8d3c8] bg-[#faf8f5] px-4 py-8 text-center">
              <ImagePlus className="h-6 w-6 text-[#7a776f]" />
              <p className="text-xs text-[#5c5a54]">
                Upload one or many photos — pick several files together.
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#d8d3c8] bg-[#faf8f5] px-3 py-2 text-xs font-medium text-[#1a1a18] hover:bg-[#f0ebe3]">
              <Upload className="h-3.5 w-3.5" />
              {uploading
                ? "Uploading…"
                : images.length
                  ? "Add more photos"
                  : "Upload photos"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                disabled={uploading || pending || images.length >= 12}
                onChange={(e) => {
                  const list = e.target.files;
                  if (list?.length) void onUploadFiles(list);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="text-[11px] text-[#7a776f]">
              {images.length}/12 photos · Set one as cover · Remove any you don’t need · Save to
              keep changes
            </p>
          </div>
        </div>
      </Field>

      <div className="space-y-1.5">
        <label className="flex flex-wrap items-center gap-2 text-sm text-[#3d3b36]">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured}
            className="rounded border-[#d8d3c8]"
            disabled={pending}
          />
          Feature on homepage
          <FieldHelp
            label="Feature on homepage"
            hint="Tick this to highlight the product on the homepage featured section. Only works when status is Published."
          />
        </label>
      </div>
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
