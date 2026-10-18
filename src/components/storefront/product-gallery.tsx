"use client";

import { useState } from "react";
import { ProductImageZoom } from "@/components/storefront/product-image-zoom";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  isCover: boolean;
};

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const cover = images.find((i) => i.isCover) ?? images[0];
  const [activeId, setActiveId] = useState(cover?.id ?? "");
  const active = images.find((i) => i.id === activeId) ?? cover;

  return (
    <div className="space-y-4">
      <ProductImageZoom
        key={active?.id ?? "empty"}
        src={active?.url}
        alt={active?.alt ?? productName}
      />
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              className={cn(
                "border transition",
                img.id === active?.id ? "border-foreground" : "border-border hover:border-foreground/50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
