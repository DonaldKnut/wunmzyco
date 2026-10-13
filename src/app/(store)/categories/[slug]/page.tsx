import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { PageHeading } from "@/components/storefront/page-heading";
import { EmptyState } from "@/components/storefront/empty-state";
import { getProductsByCategorySlug } from "@/lib/store/products";

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const { category } = await getProductsByCategorySlug(slug, 1);
  if (!category) return { title: "Category" };
  return { title: category.name, description: category.description ?? undefined };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const { category, products } = await getProductsByCategorySlug(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeading title={category.name} description={category.description ?? undefined} />
      {products.length === 0 ? (
        <EmptyState
          title="No pieces in this category yet"
          description="Check back soon or explore the full shop."
          actionHref="/shop"
          actionLabel="Shop all"
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
    </div>
  );
}
