import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { FashionRackIllustration } from "@/components/storefront/illustrations";
import { getProductsByCategorySlug } from "@/lib/store/products";

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const { category } = await getProductsByCategorySlug(slug, 1);
  if (!category) return { title: "Category · Wunmzy Co" };
  return { title: `${category.name} · Wunmzy Co`, description: category.description ?? undefined };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const { category, products } = await getProductsByCategorySlug(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Categories
        </Link>
      </div>

      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d] shadow-xs">
          <Sparkles className="h-3 w-3 text-[#d4af37]" /> Curated Rail
        </div>
        <h1 className="font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground leading-relaxed sm:text-base">
            {category.description}
          </p>
        ) : null}
      </div>

      {products.length === 0 ? (
        <EmptyState
          illustration={<FashionRackIllustration />}
          title="No pieces in this collection right now"
          description="Pieces in this category sell quickly due to one-of-a-kind availability. Explore the full rail or check back shortly."
          actionHref="/shop"
          actionLabel="Explore Complete Shop"
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
    </div>
  );
}
