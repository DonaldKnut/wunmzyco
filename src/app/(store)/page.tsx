import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { HomeHeroSlider } from "@/components/storefront/home-hero-slider";
import { HomeAdverts } from "@/components/storefront/home-adverts";
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
    <div>
      <HomeHeroSlider
        slides={slides}
        fallbackTitle={settings.homepageHeroTitle}
        fallbackSubtitle={settings.homepageHeroSubtitle}
        fallbackTagline={settings.tagline}
      />

      <HomeAdverts />

      {categories.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl">Categories</h2>
            <Link href="/shop" className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group block border border-border bg-card px-5 py-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm"
                >
                  <span className="font-display text-xl transition-colors group-hover:text-accent">{cat.name}</span>
                  {cat.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{cat.description}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">
            {featured.length ? "Featured pieces" : "Latest arrivals"}
          </h2>
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline">
            Shop all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {products.length === 0 ? (
          <EmptyState
            illustration={<FashionRackIllustration />}
            title="The rail is waiting"
            description="No products published yet. Add pieces from the admin dashboard and they'll appear here."
            actionHref="/admin/products"
            actionLabel="Add products in admin"
          />
        ) : (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-display text-3xl">Join the list</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Be first to hear about new drops — no spam, just good style.
            </p>
          </div>
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 text-sm text-background transition hover:bg-foreground/90"
          >
            Newsletter signup <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
