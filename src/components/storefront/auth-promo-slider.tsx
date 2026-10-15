"use client";

import Image from "next/image";
import { SparkleMark } from "@/components/storefront/illustrations";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    eyebrow: BRAND.category,
    title: BRAND.slogan,
    body: `${BRAND.occasions.join(" · ")} — ${BRAND.tagline}.`,
    gradient: "from-[#111111] via-[#2a2a2a] to-[#4a4a4a]",
  },
  {
    eyebrow: "Fashion & Accessories",
    title: "Outfit for every occasion",
    body: "Corporate polish, street energy, dinner elegance, and party-ready looks — styled by Wunmzy Co.",
    gradient: "from-[#1a1a1a] via-[#333] to-[#6b705c]",
  },
  {
    eyebrow: "Inquiries & orders",
    title: "Be bold. Be confident. Be you.",
    body: `WhatsApp or call ${BRAND.whatsappDisplay}. Find us at ${BRAND.webHandle}.`,
    gradient: "from-[#111] via-[#2c241c] to-[#9a8b7a]",
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
    <div
      className={cn(
        "relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden p-10 text-[#f7f3ec] lg:min-h-full lg:p-14",
        `bg-gradient-to-br ${slide.gradient}`,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -right-16 top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Image
          src={BRAND.logoUrl}
          alt={BRAND.storeName}
          width={220}
          height={120}
          className="h-16 w-auto object-contain brightness-0 invert sm:h-20"
          priority
        />
      </div>

      <div className="relative z-10 max-w-md space-y-4">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70">
          <SparkleMark className="shrink-0 text-white/80" />
          <span>{slide.eyebrow}</span>
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
