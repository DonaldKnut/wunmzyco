"use client";

import * as React from "react";
import type { Category, Product } from "@prisma/client";
import { Pencil, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoriesIllustration } from "@/components/admin/illustrations";
import { Button } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type ProductOption = Pick<Product, "id" | "name" | "sku" | "status" | "stock">;

export function CategoryFormModal({
  category,
  products,
  selectedProductIds = [],
  mode = "create",
}: {
  category?: Category;
  products: ProductOption[];
  selectedProductIds?: string[];
  mode?: "create" | "edit";
}) {
  const [open, setOpen] = React.useState(false);
  const isEdit = mode === "edit" && category;

  const trigger = isEdit ? (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-[#3d3b36] hover:bg-[#f0ebe3]"
      title="Edit category"
    >
      <Pencil className="h-3 w-3" aria-hidden />
      Edit
    </button>
  ) : (
    <Button type="button" className="gap-1.5">
      <Plus className="h-3.5 w-3.5" aria-hidden />
      Add category
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(92dvh,820px)] max-w-3xl overflow-hidden border-[#e8e4dc] bg-[#faf8f5] p-0 shadow-2xl sm:rounded-xl",
        )}
      >
        <div className="grid max-h-[min(92dvh,820px)] md:grid-cols-[11rem_1fr]">
          <div className="relative hidden overflow-hidden border-r border-[#e8e4dc] bg-gradient-to-b from-[#1a1a18] via-[#2c2a26] to-[#4a463c] md:block">
            <div className="relative flex h-full flex-col justify-between p-5 text-[#f7f3ec]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Wunmzy Co
              </p>
              <CategoriesIllustration className="my-4 text-[#f7f3ec]" />
              <p className="text-xs leading-relaxed text-white/70">
                {isEdit ? "Update category & products" : "Create category & add products"}
              </p>
            </div>
          </div>
          <div className="flex min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b border-[#eee9e0] px-5 py-4 pr-12 text-left">
              <DialogTitle className="font-sans text-base font-semibold text-[#1a1a18]">
                {isEdit ? `Edit · ${category.name}` : "New category"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#5c5a54]">
                {isEdit
                  ? "Update details and choose which products belong here."
                  : "Create a category, then tick products to place in it."}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <CategoryForm
                category={category}
                products={products}
                selectedProductIds={selectedProductIds}
                submitLabel={isEdit ? "Save category" : "Create category"}
                onSuccess={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
