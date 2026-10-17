"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/admin/ui";
import {
  CategoriesIllustration,
  CollectionsIllustration,
  CouponIllustration,
  DeliveryIllustration,
  InventoryIllustration,
  StaffIllustration,
} from "@/components/admin/illustrations";
import { cn } from "@/lib/utils";

export type AdminFormIllustration =
  | "categories"
  | "collections"
  | "coupon"
  | "delivery"
  | "inventory"
  | "staff";

const ILLUSTRATIONS: Record<
  AdminFormIllustration,
  React.ComponentType<{ className?: string }>
> = {
  categories: CategoriesIllustration,
  collections: CollectionsIllustration,
  coupon: CouponIllustration,
  delivery: DeliveryIllustration,
  inventory: InventoryIllustration,
  staff: StaffIllustration,
};

export function AdminFormModal({
  title,
  description,
  triggerLabel,
  illustration,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  triggerLabel: string;
  illustration: AdminFormIllustration;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const Illustration = ILLUSTRATIONS[illustration];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className={cn("gap-1.5", className)}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(90dvh,720px)] max-w-2xl overflow-hidden border-[#e8e4dc] bg-[#faf8f5] p-0 shadow-2xl sm:rounded-xl",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          contentClassName,
        )}
      >
        <div className="grid max-h-[min(90dvh,720px)] md:grid-cols-[11rem_1fr]">
          <div className="relative hidden overflow-hidden border-r border-[#e8e4dc] bg-gradient-to-b from-[#1a1a18] via-[#2c2a26] to-[#4a463c] md:block">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-[#c4b5a0]/20 blur-2xl" />
            </div>
            <div className="relative flex h-full flex-col justify-between p-5 text-[#f7f3ec]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Wunmzy Co
              </p>
              <Illustration className="my-4 text-[#f7f3ec]" />
              <p className="text-xs leading-relaxed text-white/70">{title}</p>
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b border-[#eee9e0] px-5 py-4 text-left">
              <DialogTitle className="font-sans text-base font-semibold text-[#1a1a18]">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="text-sm text-[#5c5a54]">
                  {description}
                </DialogDescription>
              ) : null}
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
