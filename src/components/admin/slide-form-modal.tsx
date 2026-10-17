"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, Field, Input, Textarea } from "@/components/admin/ui";
import { upsertHomepageSlide } from "@/server/actions/homepage";
import { cn } from "@/lib/utils";

export type SlideFormValues = {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string | null;
  imageAlt: string | null;
  tone: string;
  sortOrder: number;
  isActive: boolean;
};

export function SlideFormModal({
  slide,
  mode = "create",
}: {
  slide?: SlideFormValues;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState(slide?.imageUrl ?? "");
  const isEdit = mode === "edit" && slide;

  React.useEffect(() => {
    if (open) setImageUrl(slide?.imageUrl ?? "");
  }, [open, slide?.imageUrl]);

  async function onUpload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = (await res.json()) as { ok?: boolean; data?: { url: string }; error?: string };
      if (!res.ok || !json.data?.url) {
        throw new Error(json.error ?? "Upload failed");
      }
      setImageUrl(json.data.url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrl);
    setPending(true);
    try {
      const result = await upsertHomepageSlide(formData);
      if (result.ok) {
        toast.success(isEdit ? "Slide updated" : "Slide added");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-[#3d3b36] hover:bg-[#f0ebe3]"
          >
            <Pencil className="h-3 w-3" aria-hidden />
            Edit
          </button>
        ) : (
          <Button type="button" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add slide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(92dvh,820px)] max-w-2xl overflow-hidden border-[#e8e4dc] bg-[#faf8f5] p-0 sm:rounded-xl",
        )}
      >
        <DialogHeader className="border-b border-[#eee9e0] px-5 py-4 text-left pr-12">
          <DialogTitle className="font-sans text-base font-semibold">
            {isEdit ? "Edit slide" : "Add homepage slide"}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#5c5a54]">
            Copy, CTA, and optional full-bleed image for the hero carousel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="max-h-[min(72dvh,640px)] space-y-4 overflow-y-auto px-5 py-4">
          {isEdit ? <input type="hidden" name="id" value={slide.id} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input name="eyebrow" defaultValue={slide?.eyebrow} placeholder="Fashion & Accessories" />
            </Field>
            <Field label="Sort order">
              <Input name="sortOrder" type="number" defaultValue={slide?.sortOrder ?? 0} />
            </Field>
          </div>

          <Field label="Title">
            <Input name="title" defaultValue={slide?.title} required />
          </Field>
          <Field label="Subtitle">
            <Textarea name="subtitle" defaultValue={slide?.subtitle} rows={3} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA label">
              <Input name="ctaLabel" defaultValue={slide?.ctaLabel ?? "Shop the edit"} />
            </Field>
            <Field label="CTA link">
              <Input name="ctaHref" defaultValue={slide?.ctaHref ?? "/shop"} placeholder="/shop" />
            </Field>
          </div>

          <Field label="Gradient tone (Tailwind classes)">
            <Input
              name="tone"
              defaultValue={slide?.tone ?? "from-[#f7f3ec] via-[#ebe4d8] to-[#d9cfc0]"}
            />
          </Field>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#3d3b36]">Slide image</p>
            <input type="hidden" name="imageUrl" value={imageUrl} />
            <div className="flex flex-wrap items-start gap-3">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#d8d3c8] bg-white px-3 text-xs font-medium hover:bg-[#f0ebe3]">
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
              {imageUrl ? (
                <button
                  type="button"
                  className="h-9 text-xs text-[#6f2424] underline-offset-2 hover:underline"
                  onClick={() => setImageUrl("")}
                >
                  Remove image
                </button>
              ) : null}
            </div>
            {imageUrl ? (
              <div className="relative mt-2 aspect-[16/10] w-full max-w-sm overflow-hidden rounded-md border border-[#e8e4dc] bg-[#eee9e0]">
                <Image src={imageUrl} alt="" fill className="object-cover" unoptimized={imageUrl.startsWith("/")} />
              </div>
            ) : (
              <p className="text-xs text-[#7a776f]">No image — slide uses gradient only.</p>
            )}
            <Field label="Image alt text">
              <Input name="imageAlt" defaultValue={slide?.imageAlt ?? ""} placeholder="Optional" />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={slide?.isActive ?? true} />
            Active on homepage
          </label>

          <Button type="submit" disabled={pending || uploading}>
            {pending ? "Saving…" : isEdit ? "Save slide" : "Create slide"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
