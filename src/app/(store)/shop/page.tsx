import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { PageHeading } from "@/components/storefront/page-heading";
import { EmptyState } from "@/components/storefront/empty-state";
import { FashionRackIllustration } from "@/components/storefront/illustrations";
import { getActiveCategories, getShopProducts } from "@/lib/store/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

export const metadata = { title: "Shop" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const q = first(sp.q) ?? "";
  const category = first(sp.category) ?? "";
  const sort = (first(sp.sort) as "newest" | "price-asc" | "price-desc" | "name") || "newest";
  const availability = (first(sp.availability) as "in_stock" | "all") || "all";
  const minPrice = first(sp.minPrice) ? Number(first(sp.minPrice)) : undefined;
  const maxPrice = first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined;
  const page = Math.max(1, Number(first(sp.page) ?? "1") || 1);

  const [categories, result] = await Promise.all([
    getActiveCategories(),
    getShopProducts({
      q: q || undefined,
      category: category || undefined,
      sort,
      availability,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      page,
    }),
  ]);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = {
      q: q || undefined,
      category: category || undefined,
      sort: sort !== "newest" ? sort : undefined,
      availability: availability !== "all" ? availability : undefined,
      minPrice: minPrice != null && Number.isFinite(minPrice) ? String(minPrice) : undefined,
      maxPrice: maxPrice != null && Number.isFinite(maxPrice) ? String(maxPrice) : undefined,
      page: page > 1 ? String(page) : undefined,
      ...overrides,
    };
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeading
        title="Shop"
        description="Curated thrift and women's fashion — one-of-one finds and everyday staples."
      />

      <form className="mb-8 grid gap-3 rounded-lg border border-border bg-secondary/30 p-4 md:grid-cols-6" method="get">
        <div className="md:col-span-2">
          <Input name="q" defaultValue={q} placeholder="Search" aria-label="Search products" />
        </div>
        <select
          name="category"
          defaultValue={category}
          aria-label="Category"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sort"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
        <select
          name="availability"
          defaultValue={availability}
          aria-label="Availability"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All items</option>
          <option value="in_stock">In stock</option>
        </select>
        <div className="flex gap-2 md:col-span-6 lg:col-span-2">
          <Input name="minPrice" type="number" min={0} step={100} defaultValue={minPrice ?? ""} placeholder="Min ₦" aria-label="Minimum price in naira" />
          <Input name="maxPrice" type="number" min={0} step={100} defaultValue={maxPrice ?? ""} placeholder="Max ₦" aria-label="Maximum price in naira" />
          <Button type="submit" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </form>

      <p className="mb-6 text-sm text-muted-foreground">
        {result.total} product{result.total === 1 ? "" : "s"}
        {result.totalPages > 1 ? ` · Page ${result.page} of ${result.totalPages}` : ""}
      </p>

      {result.products.length === 0 ? (
        <EmptyState
          illustration={<FashionRackIllustration />}
          title="Nothing on the rack"
          description="No published products match these filters yet. Add inventory from the admin dashboard, or clear filters to browse everything."
          actionHref="/admin/products"
          actionLabel="Add products in admin"
        />
      ) : (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {result.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 ? (
        <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Pagination">
          {result.page > 1 ? (
            <Link href={buildHref({ page: String(result.page - 1) })} className="text-sm underline-offset-4 hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted-foreground">
            {result.page} / {result.totalPages}
          </span>
          {result.page < result.totalPages ? (
            <Link href={buildHref({ page: String(result.page + 1) })} className="text-sm underline-offset-4 hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
