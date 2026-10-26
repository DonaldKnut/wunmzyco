import Link from "next/link";
import { ArrowRight, Sparkles, MessageCircle, Truck } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";

export function HomeAdverts() {
  const wa = whatsappLink(BRAND.whatsappNumber, "Hi Wunmzy Co — I’d like to place an order or ask about available pieces.");

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Obsidian Luxury Drop */}
        <Link
          href="/shop"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e8e2d7] bg-[#121110] p-8 text-[#fbf9f5] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/60 hover:shadow-2xl"
        >
          {/* Subtle gold glow */}
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#d4af37]/15 blur-2xl transition-all duration-500 group-hover:bg-[#d4af37]/25" />

          <div className="relative z-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#d4af37] backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4af37]">
              {BRAND.category}
            </p>
            <h3 className="mt-2 font-display text-3xl font-normal tracking-tight text-white">
              {BRAND.slogan}
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-white/70">
              {BRAND.occasions.join(" · ")} — hand-curated archival fashion for women of discernment.
            </p>
          </div>

          <div className="relative z-10 pt-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d4af37]">
              Explore Collection <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Card 2: WhatsApp Concierge */}
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366]/40 hover:shadow-xl"
        >
          <div className="relative z-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <MessageCircle className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Personal Styling
            </p>
            <h3 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">
              Inquiries & Concierge
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Order directly via WhatsApp, ask about measurements, or request video walk-throughs of pieces.
            </p>
          </div>

          <div className="relative z-10 pt-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Message {BRAND.whatsappDisplay} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </a>

        {/* Card 3: Nationwide Delivery & Trust */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-secondary/50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-xl">
          <div className="relative z-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-card text-[#b38e5d] transition-transform duration-300 group-hover:scale-110">
              <Truck className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Every Occasion
            </p>
            <h3 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">
              {BRAND.tagline}
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Secure online payments via Paystack, same-day delivery in Lagos, tracked shipping across Nigeria.
            </p>
          </div>

          <div className="relative z-10 pt-8">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground underline-offset-4 hover:underline"
            >
              Read Our Story <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
