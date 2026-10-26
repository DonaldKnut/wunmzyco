import { Sparkles, Heart, Award, ShieldCheck, Truck, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getStoreSettings } from "@/lib/store/settings";
import { BRAND, whatsappLink } from "@/lib/brand";

export const metadata = { title: "Our Story & Philosophy · Wunmzy Co" };

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const body = settings.aboutCopy?.trim() || BRAND.aboutCopy;
  const wa = whatsappLink(BRAND.whatsappNumber, "Hello Wunmzy Co! I would love to learn more about your upcoming drops.");

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Eyebrow */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d] shadow-xs">
            <Heart className="h-3.5 w-3.5 text-rose-600" /> The House of Wunmzy
          </div>
          <h1 className="font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Where Individuality Meets Couture
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {settings.tagline} — Founded on the conviction that style should be fearless, personal, and profoundly empowering.
          </p>
        </div>

        {/* Feature Brand Showcase */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-[#e8e2d7] bg-card p-6 shadow-xl sm:p-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#faf8f5] p-4 flex items-center justify-center">
              <Image
                src={BRAND.brandCardUrl}
                alt={settings.storeName}
                width={480}
                height={600}
                className="h-full w-full object-contain drop-shadow-md transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38e5d]">
                Official Identity
              </span>
              <h2 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {BRAND.slogan}
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {body}
              </div>

              <div className="pt-2">
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#121110] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#fbf9f5] transition hover:bg-[#2e2d2a]"
                >
                  <MessageCircle className="h-4 w-4 text-[#d4af37]" />
                  <span>Connect with Founder</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div className="mt-20">
          <div className="mb-10 text-center">
            <h3 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              The 4 Occasion Pillars
            </h3>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {BRAND.occasions.join(" · ")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <span className="rounded-full bg-[#f4efe7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b38e5d]">
                01 · Power
              </span>
              <h4 className="mt-4 font-display text-2xl text-foreground">Corporate</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Tailored finesse and sharp silhouettes curated for executive boardrooms and professional poise.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <span className="rounded-full bg-[#f4efe7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b38e5d]">
                02 · Attitude
              </span>
              <h4 className="mt-4 font-display text-2xl text-foreground">Street</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Urban rebellion, relaxed luxury cuts, and vintage statement finds that turn sidewalks into runways.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <span className="rounded-full bg-[#f4efe7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b38e5d]">
                03 · Romance
              </span>
              <h4 className="mt-4 font-display text-2xl text-foreground">Dinner</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Midnight satin, architectural necklines, and sensual simplicity for unforgettable evenings.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <span className="rounded-full bg-[#f4efe7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b38e5d]">
                04 · Glamour
              </span>
              <h4 className="mt-4 font-display text-2xl text-foreground">Party</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Daring sparkle, bold colors, and showstopping energy designed to celebrate life under the lights.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#121110] transition-all duration-300 hover:bg-[#e6c354] hover:shadow-lg"
          >
            <span>Explore the Current Collection</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
