"use client";

import { useEffect, useState } from "react";
import { SparkleMark } from "@/components/storefront/illustrations";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    eyebrow: "Curated thrift",
    title: "Style that feels like you",
    body: "Thoughtfully selected women's fashion — quality pieces, fair prices, delivered across Nigeria.",
    gradient: "from-[#2c2a26] via-[#3d3832] to-[#6b705c]",
  },
  {
    eyebrow: "Shop with confidence",
    title: "Secure checkout, clear delivery",
    body: "Server-side pricing, tracked orders, and delivery zones you can trust — from Mainland to nationwide.",
    gradient: "from-[#1f2a24] via-[#3a4a3a] to-[#9a8b7a]",
  },
  {
    eyebrow: "One-of-one finds",
    title: "Rare pieces, ready to wear",
    body: "Discover unique thrift and like-new looks. When it's gone, it's gone — claimed only once.",
    gradient: "from-[#3a2f2a] via-[#5c4a3e] to-[#c4b5a5]",
  },
];

export function AuthPromoSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5200);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index]!;

  return (
    <div className={cn("relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden p-10 text-[#f7f3ec] lg:min-h-full lg:p-14", `bg-gradient-to-br ${slide.gradient}`)}>
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -right-16 top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-all duration-700" />
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-black/20 blur-2xl" />
      </div>

      <div className="relative z-10">
        <p className="font-display text-3xl tracking-tight">Wunmzy Co</p>
        <p className="mt-2 text-sm text-white/70">Women&apos;s thrift & fashion</p>
      </div>

      <div className="relative z-10 max-w-md space-y-4 transition-all duration-500" key={slide.title}>
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70">
          <SparkleMark className="text-white/80" />
          {slide.eyebrow}
        </p>
        <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">{slide.title}</h2>
        <p className="text-base leading-relaxed text-white/80">{slide.body}</p>
      </div>

      <div className="relative z-10 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </div>
  );
}
