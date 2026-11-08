import { Sparkles } from "lucide-react";
import { HomeHeroSlider } from "@/components/storefront/home-hero-slider";
import { HomeManifesto } from "@/components/storefront/home-manifesto";
import { HomeAdverts } from "@/components/storefront/home-adverts";
import { Marketplace } from "@/components/storefront/marketplace";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { getStoreSettings } from "@/lib/store/settings";
import { getHomepageSlides } from "@/lib/store/homepage";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [sp, settings, slides] = await Promise.all([
    searchParams,
    getStoreSettings(),
    getHomepageSlides(),
  ]);

  return (
    <div className="relative">
      <section className="border-b border-border/70 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 pb-1 pt-6 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Shop all our clothes &amp; accessories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything we sell is right below — search for anything, open a category, or just
            scroll.
          </p>
        </div>
      </section>

      <Marketplace basePath="/" searchParams={sp} />

      <div className="border-t border-border/80">
        <HomeHeroSlider
          slides={slides}
          fallbackTitle={settings.homepageHeroTitle}
          fallbackSubtitle={settings.homepageHeroSubtitle}
          fallbackTagline={settings.tagline}
        />
      </div>

      <HomeManifesto />
      <HomeAdverts />

      <section id="newsletter" className="border-t border-border/80 bg-secondary/40 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#e8e2d7] bg-card p-8 text-center shadow-lg sm:p-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4af37]/20 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-secondary/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d]">
                <Sparkles className="h-3 w-3 text-[#d4af37]" /> New drops first
              </span>
              <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
                Get told when new pieces arrive
              </h2>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
                Join our list for new arrivals and sales. No spam — unsubscribe anytime.
              </p>
              <div className="flex justify-center pt-4">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
