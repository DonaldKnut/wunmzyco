"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import type { HomepageSlideView } from "@/lib/store/homepage";
import { cn } from "@/lib/utils";

type HomeHeroSliderProps = {
  slides: HomepageSlideView[];
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackTagline?: string;
  fallbackImageUrl?: string | null;
  fallbackImageAlt?: string;
};

export function HomeHeroSlider({
  slides,
  fallbackTitle,
  fallbackSubtitle,
  fallbackTagline,
  fallbackImageUrl,
  fallbackImageAlt,
}: HomeHeroSliderProps) {
  const items =
    slides.length > 0
      ? slides
      : [
          {
            id: "default",
            eyebrow: fallbackTagline || BRAND.tagline,
            title: fallbackTitle || BRAND.slogan,
            subtitle: fallbackSubtitle || BRAND.homepageHeroSubtitle,
            ctaLabel: "Shop the edit",
            ctaHref: "/shop",
            imageUrl: fallbackImageUrl || BRAND.brandCardUrl,
            imageAlt: fallbackImageAlt || BRAND.storeName,
            tone: "from-[#fbf9f5] via-[#f4efe7] to-[#e8e0d2]",
          } satisfies HomepageSlideView,
        ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [items.length]);

  const slide = items[Math.min(index, items.length - 1)]!;
  const isBrandCard = slide.imageUrl === BRAND.brandCardUrl;
  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section className="overflow-hidden border-b border-[#e8e2d7] bg-[#f7f4ee]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[680px] lg:grid-cols-[1fr_0.88fr] lg:gap-16 lg:px-8 lg:py-16">
        <div key={slide.id} className="animate-fade-up max-w-2xl lg:py-8">
          <div className="mb-7 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#816b4d] sm:text-xs">
            <span className="h-px w-8 bg-[#b38e5d]" />
            {slide.eyebrow || fallbackTagline || BRAND.tagline}
          </div>

          <h1 className="max-w-[11ch] font-display text-[clamp(3.75rem,7.2vw,6.6rem)] font-medium leading-[0.88] tracking-[-0.055em] text-[#191714]">
            {slide.title || fallbackTitle || BRAND.slogan}
          </h1>

          <p className="mt-7 max-w-md text-sm leading-7 text-[#6b6459] sm:text-base sm:leading-8">
            {slide.subtitle || fallbackSubtitle || BRAND.homepageHeroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.13em] text-[#746b5f]">
            {BRAND.occasions.map((occasion, occasionIndex) => (
              <span key={occasion} className="inline-flex items-center gap-5">
                <Link
                  href={`/shop?q=${occasion.toLowerCase()}`}
                  className="transition-colors hover:text-[#191714]"
                >
                  {occasion}
                </Link>
                {occasionIndex < BRAND.occasions.length - 1 ? (
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#c4b8a5]" />
                ) : null}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href={slide.ctaHref || "/shop"}
              className="group inline-flex min-h-13 items-center justify-center gap-5 rounded-full bg-[#191714] px-7 text-[11px] font-semibold uppercase tracking-[0.17em] text-white transition-colors hover:bg-[#39352f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b38e5d]"
            >
              {slide.ctaLabel || "Shop the edit"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#595248] underline decoration-[#c4b8a5] underline-offset-4 transition-colors hover:text-[#191714]"
            >
              Our philosophy
            </Link>
          </div>

          {items.length > 1 ? (
            <div className="mt-12 flex items-center gap-4">
              <div className="flex items-center gap-2">
                {items.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Go to slide ${itemIndex + 1}`}
                    aria-current={itemIndex === index}
                    onClick={() => setIndex(itemIndex)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      itemIndex === index ? "w-8 bg-[#191714]" : "w-3 bg-[#cfc6b8] hover:bg-[#8b8173]",
                    )}
                  />
                ))}
              </div>
              <div className="ml-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous slide"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d1c5] text-[#4c463d] transition-colors hover:border-[#191714] hover:text-[#191714]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next slide"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9d1c5] text-[#4c463d] transition-colors hover:border-[#191714] hover:text-[#191714]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative mx-auto w-full max-w-[500px] lg:ml-auto">
          <div className="absolute -inset-3 rotate-2 border border-[#d9d1c5] sm:-inset-4" />
          <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e3d9]">
            {slide.imageUrl ? (
              <Image
                key={slide.imageUrl}
                src={slide.imageUrl}
                alt={slide.imageAlt || slide.title}
                fill
                priority
                className={cn(
                  "transition-transform duration-700 ease-out hover:scale-[1.025]",
                  isBrandCard ? "object-contain p-5 sm:p-8" : "object-cover",
                )}
                unoptimized={slide.imageUrl.startsWith("/")}
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#d6c5a6] via-[#bda98a] to-[#82715e]" />
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-5 pt-20 sm:p-7 sm:pt-24">
              <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.17em] text-white">
                <ShieldCheck className="h-4 w-4 text-[#ead6a1]" />
                Handpicked with intention
              </span>
              <span className="font-display text-4xl italic leading-none text-white/85">W.</span>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 border border-[#e6dfd4] bg-[#fbf9f5] px-4 py-3 shadow-[0_12px_35px_-20px_rgba(25,23,20,0.35)] sm:flex lg:-left-10">
            <span className="font-display text-2xl italic text-[#9b805b]">01</span>
            <span className="h-7 w-px bg-[#ded6ca]" />
            <span className="text-[9px] font-semibold uppercase leading-4 tracking-[0.16em] text-[#62594d]">
              Style for<br />every moment
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
