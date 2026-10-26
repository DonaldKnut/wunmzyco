"use client";

import * as React from "react";
import type { Category, Product, ProductImage } from "@prisma/client";
import { Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/product-form";
import { ProductIllustration } from "@/components/admin/illustrations";
import { Button } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type ProductWithCats = Product & {
  categories: { categoryId: string }[];
  images?: ProductImage[];
};

export function ProductFormModal({
  categories,
  product,
  mode = "create",
  trigger,
}: {
  categories: Category[];
  product?: ProductWithCats;
  mode?: "create" | "edit";
  /** Optional custom trigger (e.g. overview “Add Product” button). */
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const isEdit = mode === "edit" && product;

  const defaultTrigger = isEdit ? (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-[#3d3b36] hover:bg-[#f0ebe3]"
      title="Edit"
    >
      <Pencil className="h-3 w-3" aria-hidden />
      Edit
    </button>
  ) : (
    <Button type="button" className="gap-1.5">
      <Plus className="h-3.5 w-3.5" aria-hidden />
      New product
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(92dvh,800px)] max-w-3xl overflow-hidden border-[#e8e4dc] bg-[#faf8f5] p-0 shadow-2xl sm:rounded-xl",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        )}
      >
        <div className="grid max-h-[min(92dvh,800px)] md:grid-cols-[11rem_1fr]">
          <div className="relative hidden overflow-hidden border-r border-[#e8e4dc] bg-gradient-to-b from-[#1a1a18] via-[#2c2a26] to-[#4a463c] md:block">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-[#c4b5a0]/20 blur-2xl" />
            </div>
            <div className="relative flex h-full flex-col justify-between p-5 text-[#f7f3ec]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Wunmzy Co
              </p>
              <ProductIllustration className="my-4 text-[#f7f3ec]" />
              <p className="text-xs leading-relaxed text-white/70">
                {isEdit ? "Update catalogue item" : "Add to catalogue"}
              </p>
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b border-[#eee9e0] px-5 py-4 text-left pr-12">
              <DialogTitle className="font-sans text-base font-semibold text-[#1a1a18]">
                {isEdit ? `Edit · ${product.name}` : "New product"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#5c5a54]">
                {isEdit
                  ? `SKU ${product.sku}`
                  : "Add a catalogue item with pricing, stock, and categories."}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <ProductForm
                categories={categories}
                product={product}
                submitLabel={isEdit ? "Save changes" : "Create product"}
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
