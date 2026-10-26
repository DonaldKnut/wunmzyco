"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import type { HomepageSlideView } from "@/lib/store/homepage";
import { cn } from "@/lib/utils";

export function HomeHeroSlider({
  slides,
  fallbackTitle,
  fallbackSubtitle,
  fallbackTagline,
}: {
  slides: HomepageSlideView[];
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  fallbackTagline?: string;
}) {
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
            imageUrl: BRAND.brandCardUrl,
            imageAlt: BRAND.storeName,
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
  const hasImage = Boolean(slide.imageUrl && slide.imageUrl !== BRAND.brandCardUrl);

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-[#e8e2d7] transition-all duration-1000",
        hasImage ? "bg-[#0e0d0c]" : cn("bg-gradient-to-br", slide.tone || "from-[#fbf9f5] via-[#f5efe5] to-[#ebe1d3]"),
      )}
    >
      {/* Ambient decorative lighting */}
      {hasImage ? (
        <div className="absolute inset-0">
          <Image
            key={slide.imageUrl}
            src={slide.imageUrl!}
            alt={slide.imageAlt || slide.title}
            fill
            priority
            className="object-cover transition-transform duration-1000 scale-105"
            unoptimized={slide.imageUrl!.startsWith("/")}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/70" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-[15%] -top-[25%] h-[80%] w-[65%] rounded-full bg-gradient-to-br from-[#d4af37]/15 to-transparent blur-3xl" />
          <div className="absolute -left-[10%] bottom-[-10%] h-[60%] w-[50%] rounded-full bg-gradient-to-tr from-[#b38e5d]/10 to-transparent blur-3xl" />
        </div>
      )}

      <div className="relative mx-auto flex min-h-[580px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:min-h-[640px] lg:flex-row lg:items-center lg:justify-between lg:py-24">
        {/* Editorial Text Column */}
        <div className="max-w-2xl space-y-7 z-10" key={slide.id}>
          {/* High-fashion badge pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card/60 px-4 py-1.5 backdrop-blur-md shadow-xs animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
              {slide.eyebrow || fallbackTagline || BRAND.tagline}
            </span>
          </div>

          {/* Majestic Hero Headline */}
          <h1
            className={cn(
              "animate-fade-up font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl [animation-delay:80ms]",
              hasImage ? "text-[#fbf9f5]" : "text-foreground",
            )}
          >
            {slide.title || fallbackTitle || BRAND.slogan}
          </h1>

          {/* Subtitle with editorial rhythm */}
          <p
            className={cn(
              "animate-fade-up max-w-xl text-base leading-relaxed sm:text-lg [animation-delay:140ms]",
              hasImage ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {slide.subtitle || fallbackSubtitle || BRAND.homepageHeroSubtitle}
          </p>

          {/* Occasion Tags Pill Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 animate-fade-up [animation-delay:180ms]">
            <span className={cn("text-xs font-semibold uppercase tracking-widest", hasImage ? "text-white/50" : "text-muted-foreground/80")}>
              Occasions:
            </span>
            {BRAND.occasions.map((occasion) => (
              <Link
                key={occasion}
                href={`/shop?q=${occasion.toLowerCase()}`}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-all duration-200",
                  hasImage
                    ? "border border-white/20 bg-white/10 text-white hover:border-[#d4af37] hover:text-[#d4af37]"
                    : "border border-border/80 bg-card/70 text-foreground hover:border-[#d4af37] hover:bg-card",
                )}
              >
                {occasion}
              </Link>
            ))}
          </div>

          {/* Call to Actions */}
          <div className="animate-fade-up flex flex-wrap items-center gap-4 pt-3 [animation-delay:220ms]">
            <Button
              asChild
              size="lg"
              className={cn(
                "group relative overflow-hidden rounded-full px-7 py-6 text-xs uppercase tracking-[0.18em] shadow-md transition-all duration-300",
                hasImage
                  ? "bg-[#d4af37] text-[#121110] hover:bg-[#e6c354] hover:shadow-lg"
                  : "bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              <Link href={slide.ctaHref || "/shop"}>
                <span>{slide.ctaLabel || "Shop the edit"}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className={cn(
                "rounded-full px-6 py-6 text-xs uppercase tracking-[0.18em] transition-all duration-300",
                hasImage
                  ? "border-white/30 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white/15"
                  : "border-border/90 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-foreground/40",
              )}
            >
              <Link href="/about">Our Philosophy</Link>
            </Button>
          </div>
        </div>

        {/* Brand Card / Visual Feature Showcase */}
        {!hasImage ? (
          <div className="relative mt-12 flex w-full max-w-md flex-col justify-end lg:mt-0 lg:max-w-md z-10">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-b from-white/90 to-white/40 p-6 shadow-2xl backdrop-blur-md">
              <Image
                src={BRAND.brandCardUrl}
                alt={BRAND.storeName}
                width={500}
                height={620}
                className="h-full w-full object-contain drop-shadow-md transition-transform duration-700 hover:scale-105"
                priority
              />

              {/* Floating luxury status capsules */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-white/60 bg-white/80 p-3.5 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#121110] text-[#d4af37]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#121110]">One-of-a-Kind Finds</p>
                    <p className="text-[11px] text-muted-foreground">Handpicked Fashion Archives</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                    <ShieldCheck className="h-3 w-3" /> 100% Curated
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Slide Navigation Controls */}
      {items.length > 1 ? (
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 pb-8 sm:px-6">
          <div className="flex items-center gap-2">
            {items.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index
                    ? hasImage
                      ? "w-10 bg-[#d4af37]"
                      : "w-10 bg-foreground"
                    : hasImage
                      ? "w-3 bg-white/40 hover:bg-white/70"
                      : "w-3 bg-foreground/20 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200",
                hasImage
                  ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                  : "border-border bg-card/60 text-foreground hover:border-foreground hover:bg-card",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200",
                hasImage
                  ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                  : "border-border bg-card/60 text-foreground hover:border-foreground hover:bg-card",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
