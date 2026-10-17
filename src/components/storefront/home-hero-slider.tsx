"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
            tone: "from-[#f7f3ec] via-[#ebe4d8] to-[#d9cfc0]",
          } satisfies HomepageSlideView,
        ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [items.length]);

  const slide = items[Math.min(index, items.length - 1)]!;
  const hasImage = Boolean(slide.imageUrl);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border transition-colors duration-700",
        hasImage ? "bg-[#111]" : cn("bg-gradient-to-br", slide.tone),
      )}
    >
      {hasImage ? (
        <div className="absolute inset-0">
          <Image
            key={slide.imageUrl}
            src={slide.imageUrl!}
            alt={slide.imageAlt || slide.title}
            fill
            priority
            className="object-cover"
            unoptimized={slide.imageUrl!.startsWith("/")}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-10%] top-[-20%] h-[70%] w-[50%] rounded-full bg-white/40 blur-3xl" />
        </div>
      )}

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-28">
        <div className="max-w-xl space-y-6" key={slide.id}>
          <p
            className={cn(
              "animate-fade-up text-xs font-medium uppercase tracking-[0.2em]",
              hasImage ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {slide.eyebrow || fallbackTagline || BRAND.tagline}
          </p>
          <h1
            className={cn(
              "animate-fade-up font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl [animation-delay:60ms]",
              hasImage ? "text-[#f7f3ec]" : "text-foreground",
            )}
          >
            {slide.title || fallbackTitle || BRAND.slogan}
          </h1>
          <p
            className={cn(
              "animate-fade-up text-lg [animation-delay:120ms]",
              hasImage ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {slide.subtitle || fallbackSubtitle || BRAND.homepageHeroSubtitle}
          </p>
          <div className="animate-fade-up flex flex-wrap gap-3 pt-2 [animation-delay:180ms]">
            <Button asChild size="lg" variant={hasImage ? "secondary" : "default"}>
              <Link href={slide.ctaHref || "/shop"}>
                {slide.ctaLabel || "Shop the edit"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className={hasImage ? "border-white/40 bg-transparent text-white hover:bg-white/10" : undefined}
            >
              <Link href="/about">Our story</Link>
            </Button>
          </div>
        </div>

        {!hasImage ? (
          <div className="relative flex w-full max-w-md flex-col justify-end lg:max-w-sm">
            <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden border border-border/60 bg-card/70 p-8 shadow-sm backdrop-blur-sm">
              <Image
                src={BRAND.brandCardUrl}
                alt={BRAND.storeName}
                width={420}
                height={520}
                className="h-auto max-h-full w-full object-contain"
                priority
              />
            </div>
          </div>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="relative mx-auto flex max-w-6xl gap-2 px-4 pb-8 sm:px-6">
          {items.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? hasImage
                    ? "w-8 bg-white"
                    : "w-8 bg-foreground"
                  : hasImage
                    ? "w-3 bg-white/40 hover:bg-white/70"
                    : "w-3 bg-foreground/25 hover:bg-foreground/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
