import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { PageHeading } from "@/components/storefront/page-heading";
import { EmptyState } from "@/components/storefront/empty-state";
import { searchProducts } from "@/lib/store/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeading title="Search" description="Find pieces by name, description, or SKU." />
      <form className="mb-10 flex max-w-lg gap-2" action="/search" method="get">
        <Input name="q" defaultValue={query} placeholder="Search the shop" aria-label="Search query" />
        <Button type="submit">Search</Button>
      </form>
      {!query ? (
        <p className="text-sm text-muted-foreground">Enter a term to search the catalogue.</p>
      ) : products.length === 0 ? (
        <EmptyState
          title="No matches"
          description={`We couldn't find anything for “${query}”. Try another term or browse the shop.`}
          actionHref="/shop"
          actionLabel="Shop all"
        />
      ) : (
        <>
          <p className="mb-8 text-sm text-muted-foreground">
            {products.length} result{products.length === 1 ? "" : "s"} for{" "}
            <span className="text-foreground">“{query}”</span>
          </p>
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-12 text-sm">
        <Link href="/shop" className="underline-offset-4 hover:underline">
          Browse all products
        </Link>
      </p>
    </div>
  );
}
