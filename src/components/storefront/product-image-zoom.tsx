"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImagePlaceholder } from "@/components/storefront/product-image-placeholder";

type ProductImageZoomProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Aspect ratio classes for the frame */
  frameClassName?: string;
  /** Compact controls for product cards */
  compact?: boolean;
};

export function ProductImageZoom({
  src,
  alt,
  className,
  frameClassName = "aspect-[3/4]",
  compact = false,
}: ProductImageZoomProps) {
  const [scale, setScale] = useState(1);

  function zoomIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setScale((s) => Math.min(2.5, Number((s + 0.25).toFixed(2))));
  }

  function zoomOut(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setScale((s) => Math.max(1, Number((s - 0.25).toFixed(2))));
  }

  return (
    <div className={cn("group/zoom relative overflow-hidden", frameClassName, className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 ease-out"
          style={{ transform: `scale(${scale})` }}
          draggable={false}
        />
      ) : (
        <ProductImagePlaceholder className="h-full w-full" />
      )}

      {src ? (
        <div
          className={cn(
            "absolute flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover/zoom:opacity-100",
            compact ? "right-2 top-2 scale-90" : "bottom-2 right-2",
          )}
        >
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            aria-label="Zoom out"
            className="inline-flex h-8 w-8 items-center justify-center border border-border/80 bg-background/90 text-foreground shadow-sm backdrop-blur disabled:opacity-40"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 2.5}
            aria-label="Zoom in"
            className="inline-flex h-8 w-8 items-center justify-center border border-border/80 bg-background/90 text-foreground shadow-sm backdrop-blur disabled:opacity-40"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
