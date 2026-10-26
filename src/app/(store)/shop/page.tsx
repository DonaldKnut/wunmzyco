import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { FashionRackIllustration } from "@/components/storefront/illustrations";
import { getActiveCategories, getShopProducts } from "@/lib/store/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Sparkles, X, Search } from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Shop the Edit · Wunmzy Co" };

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

  const hasActiveFilters = Boolean(
    q || category || sort !== "newest" || availability !== "all" || minPrice != null || maxPrice != null,
  );

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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Editorial Page Heading */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d] shadow-xs">
          <Sparkles className="h-3 w-3 text-[#d4af37]" /> The Complete Edit
        </div>
        <h1 className="font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
          Curated Fashion Rail
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed sm:text-base">
          One-of-one Nigerian thrift finds, contemporary staples, and occasion statement wear for Corporate, Street, Dinner, and Party.
        </p>

        {/* Quick Occasion Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {BRAND.occasions.map((occ) => {
            const active = q.toLowerCase() === occ.toLowerCase();
            return (
              <Link
                key={occ}
                href={active ? "/shop" : `/shop?q=${occ.toLowerCase()}`}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider transition-all duration-200 ${
                  active
                    ? "border-[#121110] bg-[#121110] text-[#fbf9f5] shadow-xs"
                    : "border-border/80 bg-card/80 text-foreground hover:border-[#d4af37] hover:bg-card"
                }`}
              >
                {occ}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <form
        className="mb-10 rounded-2xl border border-border/80 bg-card p-5 shadow-xs"
        method="get"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {/* Search Field */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search by piece name or tag…"
              aria-label="Search products"
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <select
              name="category"
              defaultValue={category}
              aria-label="Category"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-foreground focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="lg:col-span-3">
            <select
              name="sort"
              defaultValue={sort}
              aria-label="Sort"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-foreground focus:outline-none"
            >
              <option value="newest">Newest Drops First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {/* Availability */}
          <div className="lg:col-span-2">
            <select
              name="availability"
              defaultValue={availability}
              aria-label="Availability"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-foreground focus:outline-none"
            >
              <option value="all">All Items</option>
              <option value="in_stock">In Stock Only</option>
            </select>
          </div>
        </div>

        {/* Filter Action and Active Pill Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{result.total}</span> piece{result.total === 1 ? "" : "s"} available
            {hasActiveFilters ? (
              <Link
                href="/shop"
                className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:underline"
              >
                <X className="h-3 w-3" /> Reset Filters
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="rounded-xl px-5 gap-1.5 text-xs font-semibold">
              <Filter className="h-3.5 w-3.5" /> Apply Filters
            </Button>
          </div>
        </div>
      </form>

      {/* Product Grid */}
      {result.products.length === 0 ? (
        <EmptyState
          illustration={<FashionRackIllustration />}
          title="No pieces match your search"
          description="Try broadening your filters or explore other occasion categories on the rail."
          actionHref="/shop"
          actionLabel="View All Pieces"
        />
      ) : (
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {result.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {result.totalPages > 1 ? (
        <nav className="mt-16 flex items-center justify-center gap-3" aria-label="Pagination">
          {result.page > 1 ? (
            <Button asChild variant="outline" size="sm" className="rounded-full px-5">
              <Link href={buildHref({ page: String(result.page - 1) })}>Previous</Link>
            </Button>
          ) : null}
          <span className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground shadow-xs">
            {result.page} of {result.totalPages}
          </span>
          {result.page < result.totalPages ? (
            <Button asChild variant="outline" size="sm" className="rounded-full px-5">
              <Link href={buildHref({ page: String(result.page + 1) })}>Next</Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
