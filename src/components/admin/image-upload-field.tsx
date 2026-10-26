"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { UploadFolder } from "@/lib/storage";
import { cn } from "@/lib/utils";

/**
 * Single-image upload field backed by Cloudinary via POST /api/uploads.
 * Renders a hidden input (`name`) holding the Cloudinary URL so it drops
 * into any existing <form> / server action unchanged.
 */
export function ImageUploadField({
  name,
  folder,
  defaultValue = "",
  disabled = false,
  previewClassName,
}: {
  name: string;
  folder: UploadFolder;
  defaultValue?: string | null;
  disabled?: boolean;
  previewClassName?: string;
}) {
  const [url, setUrl] = React.useState(defaultValue ?? "");
  const [uploading, setUploading] = React.useState(false);

  async function onUpload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = (await res.json()) as {
        ok?: boolean;
        data?: { url: string; publicId: string };
        error?: string;
      };
      if (!res.ok || !json.data?.url) {
        throw new Error(json.error ?? "Upload failed");
      }
      setUrl(json.data.url);
      toast.success("Image uploaded to Cloudinary");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-start gap-3">
        <label
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#d8d3c8] bg-white px-3 text-xs font-medium text-[#1a1a18] hover:bg-[#f0ebe3]",
            (disabled || uploading) && "pointer-events-none opacity-50",
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading…" : url ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            disabled={disabled || uploading}
            className="inline-flex h-9 items-center gap-1 text-xs text-[#6f2424] underline-offset-2 hover:underline disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>
      {url ? (
        <div
          className={cn(
            "relative aspect-[16/10] w-full max-w-xs overflow-hidden rounded-md border border-[#e8e4dc] bg-[#eee9e0]",
            previewClassName,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <p className="text-xs text-[#7a776f]">No image — uploads go to Cloudinary.</p>
      )}
    </div>
  );
}
