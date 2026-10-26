import Link from "next/link";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { HomeHeroSlider } from "@/components/storefront/home-hero-slider";
import { HomeMarquee } from "@/components/storefront/home-marquee";
import { HomeOccasions } from "@/components/storefront/home-occasions";
import { HomeManifesto } from "@/components/storefront/home-manifesto";
import { HomeAdverts } from "@/components/storefront/home-adverts";
import { NewsletterForm } from "@/components/storefront/newsletter-form";
import { FashionRackIllustration } from "@/components/storefront/illustrations";
import { getStoreSettings } from "@/lib/store/settings";
import { getHomepageSlides } from "@/lib/store/homepage";
import {
  getActiveCategories,
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/store/products";

export default async function HomePage() {
  const [settings, slides, featured, latest, categories] = await Promise.all([
    getStoreSettings(),
    getHomepageSlides(),
    getFeaturedProducts(8),
    getLatestProducts(8),
    getActiveCategories(),
  ]);

  const products = featured.length ? featured : latest;

  return (
    <div className="relative">
      {/* 1. Cinematic Hero Slider */}
      <HomeHeroSlider
        slides={slides}
        fallbackTitle={settings.homepageHeroTitle}
        fallbackSubtitle={settings.homepageHeroSubtitle}
        fallbackTagline={settings.tagline}
      />

      {/* 2. Infinite Fashion Ticker */}
      <HomeMarquee />

      {/* 3. Curated by Occasion: Corporate, Street, Dinner, Party */}
      <HomeOccasions />

      {/* 4. Category Showcase */}
      {categories.length > 0 ? (
        <section className="border-t border-border/80 bg-secondary/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Layers className="h-3 w-3 text-[#d4af37]" /> The Directory
                </div>
                <h2 className="font-display text-4xl tracking-tight sm:text-5xl text-foreground">
                  Shop by Category
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explore tailored selections curated for your exact style vision.
                </p>
              </div>
              <Link
                href="/categories"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground underline-offset-8 hover:underline"
              >
                All Categories
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((cat, idx) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/60 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono text-[11px] text-[#b38e5d]">0{idx + 1}</span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] uppercase tracking-wider">
                          Curated
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-accent">
                        {cat.name}
                      </h3>
                      {cat.description ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {cat.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="pt-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-foreground">
                        Browse pieces
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 5. Featured Drops Collection */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card/60 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d]">
              <Sparkles className="h-3 w-3 text-[#d4af37]" /> The Rail
            </div>
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl text-foreground">
              {featured.length ? "Featured Pieces" : "Latest Arrivals"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Individually photographed, authenticated, and ready to elevate your wardrobe.
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground underline-offset-8 hover:underline"
          >
            Explore Complete Rail
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            illustration={<FashionRackIllustration />}
            title="The rail is currently resting"
            description="Our stylists are preparing the next exclusive drop. Browse the archive or check back soon."
            actionHref="/admin/products"
            actionLabel="Add products in admin"
          />
        ) : (
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 6. Brand Manifesto */}
      <HomeManifesto />

      {/* 7. Value Guarantees & Features */}
      <HomeAdverts />

      {/* 8. VIP Club & Newsletter Section */}
      <section id="newsletter" className="border-t border-border/80 bg-secondary/40 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#e8e2d7] bg-card p-8 sm:p-14 shadow-lg text-center">
            {/* Ambient gold glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-48 w-96 rounded-full bg-[#d4af37]/20 blur-3xl" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-secondary/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d]">
                <Sparkles className="h-3 w-3 text-[#d4af37]" /> Exclusive Previews
              </span>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground">
                Join the Private Edit
              </h2>
              <p className="mx-auto max-w-lg text-sm text-muted-foreground leading-relaxed">
                Be the first to preview new thrift drops, limited one-of-one releases, and private seasonal sales. No spam, only immaculate taste.
              </p>

              <div className="pt-6 flex justify-center">
                <NewsletterForm />
              </div>

              <p className="pt-2 text-[11px] text-muted-foreground">
                By subscribing, you agree to receive editorial styling updates. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
