"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { ProductImagePlaceholder } from "@/components/storefront/product-image-placeholder";
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
  const ordered = [...images].sort((a, b) => Number(b.isCover) - Number(a.isCover));
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = ordered.length;
  const active = ordered[Math.min(index, Math.max(0, count - 1))];

  const go = useCallback(
    (next: number) => {
      if (count < 2) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, index, go]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchStartX.current = e.changedTouches[0]?.clientX ?? null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current == null) return;
      const delta = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
    },
  };

  if (!active) {
    return (
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
        <ProductImagePlaceholder className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-4">
      {count > 1 ? (
        <ul
          className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:max-h-[min(78vh,760px)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0"
          aria-label="Product photos"
        >
          {ordered.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "block h-20 w-16 overflow-hidden rounded-lg border-2 transition lg:h-24 lg:w-[76px]",
                  i === index
                    ? "border-foreground"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        className={cn(
          "group relative order-1 aspect-[4/5] overflow-hidden rounded-2xl bg-secondary lg:order-2",
          count < 2 && "lg:col-span-2",
        )}
        {...swipe}
      >
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="block h-full w-full cursor-zoom-in"
          aria-label="View photo full screen"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={active.id}
            src={active.url}
            alt={active.alt ?? productName}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            draggable={false}
          />
        </button>

        <span className="pointer-events-none absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-foreground shadow-sm backdrop-blur">
          <Expand className="h-4 w-4" aria-hidden />
        </span>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#121110]/75 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0c0b0a]/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} photos`}
          onClick={() => setLightbox(false)}
          {...swipe}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.alt ?? productName}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[94vw] object-contain"
          />
          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(index - 1);
                }}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(index + 1);
                }}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tabular-nums text-white/80">
                {index + 1} / {count}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
