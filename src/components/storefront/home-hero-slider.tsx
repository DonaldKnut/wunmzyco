"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: { href: string; label: string };
  tone: string;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    eyebrow: "New season edit",
    title: "Style that feels like you",
    subtitle: "Thoughtfully curated thrift and women's fashion for everyday confidence.",
    cta: { href: "/shop", label: "Shop the edit" },
    tone: "from-[#f7f3ec] via-[#ebe4d8] to-[#d9cfc0]",
  },
  {
    eyebrow: "One-of-one finds",
    title: "Pieces you won't see twice",
    subtitle: "Rare thrift and like-new looks — claimed once, worn with intention.",
    cta: { href: "/shop?availability=in_stock", label: "Browse arrivals" },
    tone: "from-[#efe8df] via-[#e0d5c6] to-[#c9b8a4]",
  },
  {
    eyebrow: "Nationwide delivery",
    title: "From Lagos to everywhere",
    subtitle: "Transparent delivery zones and secure checkout when you're ready.",
    cta: { href: "/shipping-policy", label: "Delivery info" },
    tone: "from-[#f3efe8] via-[#e8e1d4] to-[#b7c0a8]/40",
  },
];

export function HomeHeroSlider({
  title,
  subtitle,
  tagline,
}: {
  title?: string;
  subtitle?: string;
  tagline?: string;
}) {
  const slides: Slide[] = [
    {
      ...DEFAULT_SLIDES[0]!,
      title: title || DEFAULT_SLIDES[0]!.title,
      subtitle: subtitle || DEFAULT_SLIDES[0]!.subtitle,
      eyebrow: tagline || DEFAULT_SLIDES[0]!.eyebrow,
    },
    ...DEFAULT_SLIDES.slice(1),
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide = slides[index]!;

  return (
    <section className={cn("relative overflow-hidden border-b border-border bg-gradient-to-br transition-all duration-700", slide.tone)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[-20%] h-[70%] w-[50%] rounded-full bg-white/40 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[60%] w-[45%] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-28">
        <div className="max-w-xl space-y-6" key={slide.title}>
          <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {slide.eyebrow}
          </p>
          <h1 className="animate-fade-up font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl [animation-delay:60ms]">
            {slide.title}
          </h1>
          <p className="animate-fade-up text-lg text-muted-foreground [animation-delay:120ms]">{slide.subtitle}</p>
          <div className="animate-fade-up flex flex-wrap gap-3 pt-2 [animation-delay:180ms]">
            <Button asChild size="lg">
              <Link href={slide.cta.href}>
                {slide.cta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Our story</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex w-full max-w-md flex-col justify-end lg:max-w-sm">
          <div className="aspect-[4/5] w-full overflow-hidden border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
            <div className="flex h-full flex-col justify-between p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Wunmzy Co</p>
              <div>
                <p className="font-display text-3xl leading-tight">{slide.title}</p>
                <p className="mt-3 text-sm text-muted-foreground">{slide.eyebrow}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-8 bg-foreground" : "w-3 bg-foreground/25 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
