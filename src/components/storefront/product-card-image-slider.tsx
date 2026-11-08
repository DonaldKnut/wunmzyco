"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImagePlaceholder } from "@/components/storefront/product-image-placeholder";
import { cn } from "@/lib/utils";
import type { ProductListImage } from "@/lib/store/products";

type ProductCardImageSliderProps = {
  href: string;
  name: string;
  images: ProductListImage[];
  className?: string;
};

export function ProductCardImageSlider({
  href,
  name,
  images,
  className,
}: ProductCardImageSliderProps) {
  const slides = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const multi = slides.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [slides.length, slides[0]?.url]);

  const go = useCallback(
    (next: number) => {
      if (!multi) return;
      const len = slides.length;
      setIndex(((next % len) + len) % len);
    },
    [multi, slides.length],
  );

  const active = slides[index];

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Link
        href={href}
        className="relative block h-full w-full overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (!multi || touchStartX.current == null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const delta = endX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < 40) return;
          go(index + (delta < 0 ? 1 : -1));
        }}
      >
        {active?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt={active.alt ?? name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <ProductImagePlaceholder className="h-full w-full" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      {multi ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(index - 1);
            }}
            className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[#121110]/70 text-white opacity-100 shadow backdrop-blur-sm transition sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(index + 1);
            }}
            className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[#121110]/70 text-white opacity-100 shadow backdrop-blur-sm transition sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5 px-2">
            {slides.map((slide, i) => (
              <button
                key={`${slide.url}-${i}`}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
