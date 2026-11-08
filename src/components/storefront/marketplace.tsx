import Link from "next/link";
import type { ProductCondition } from "@prisma/client";
import { ChevronDown, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { EmptyState } from "@/components/storefront/empty-state";
import { FashionRackIllustration } from "@/components/storefront/illustrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/lib/brand";
import {
  PRODUCT_CONDITIONS,
  getActiveCategories,
  getShopFacets,
  getShopProducts,
  type ShopSort,
} from "@/lib/store/products";
import { cn } from "@/lib/utils";

type RawParams = Record<string, string | string[] | undefined>;

const SORTS: { value: ShopSort; label: string }[] = [
  { value: "featured", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: "Brand new",
  LIKE_NEW: "Like new",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
};

const QUICK_SEARCHES = [
  ...BRAND.occasions.map((o) => ({ label: o, q: o.toLowerCase() })),
  { label: "On sale", q: "on sale" },
  { label: "Under ₦10,000", q: "under 10k" },
];

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:border-foreground focus:outline-none";

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() || undefined;
}

function nonNegative(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/[₦,\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Search, collapsible categories and the full product grid — used on the homepage and /shop. */
export async function Marketplace({
  basePath,
  searchParams,
  pageSize = 24,
}: {
  basePath: "/" | "/shop";
  searchParams: RawParams;
  pageSize?: number;
}) {
  const q = (first(searchParams.q) ?? "").slice(0, 120);
  const category = first(searchParams.category) ?? "";
  const sortRaw = first(searchParams.sort);
  const sort: ShopSort = SORTS.some((s) => s.value === sortRaw)
    ? (sortRaw as ShopSort)
    : "featured";
  const availability = first(searchParams.availability) === "in_stock" ? "in_stock" : "all";
  const conditionRaw = first(searchParams.condition);
  const condition = (PRODUCT_CONDITIONS as readonly string[]).includes(conditionRaw ?? "")
    ? (conditionRaw as ProductCondition)
    : undefined;
  const size = first(searchParams.size)?.slice(0, 40);
  const colour = first(searchParams.colour)?.slice(0, 40);
  const onSale = first(searchParams.onSale) === "1";
  const minPrice = nonNegative(first(searchParams.minPrice));
  const maxPrice = nonNegative(first(searchParams.maxPrice));
  const page = Math.max(1, Math.floor(Number(first(searchParams.page) ?? "1")) || 1);

  const [categories, facets, result] = await Promise.all([
    getActiveCategories(),
    getShopFacets(),
    getShopProducts({
      q: q || undefined,
      category: category || undefined,
      sort,
      availability,
      condition,
      size,
      colour,
      onSale,
      minPrice,
      maxPrice,
      page,
      pageSize,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const advancedActive = Boolean(
    condition ||
      size ||
      colour ||
      onSale ||
      minPrice != null ||
      maxPrice != null ||
      availability !== "all" ||
      sort !== "featured",
  );
  const hasFilters = Boolean(q || category || advancedActive);

  const current: Record<string, string | undefined> = {
    q: q || undefined,
    category: category || undefined,
    sort: sort !== "featured" ? sort : undefined,
    availability: availability !== "all" ? availability : undefined,
    condition,
    size,
    colour,
    onSale: onSale ? "1" : undefined,
    minPrice: minPrice != null ? String(minPrice) : undefined,
    maxPrice: maxPrice != null ? String(maxPrice) : undefined,
    page: page > 1 ? String(page) : undefined,
  };

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...current, ...overrides })) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.total, result.page * result.pageSize);

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <form
        action={basePath}
        method="get"
        role="search"
        className="rounded-2xl border border-border/80 bg-card p-3 shadow-xs sm:p-4"
      >
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search anything: black gown, tops under 10k, size 12…"
              aria-label="Search all products"
              className="h-12 rounded-xl pl-10 text-base"
              enterKeyHint="search"
            />
          </div>
          <Button type="submit" className="h-12 shrink-0 rounded-xl px-4 sm:px-6">
            <Search className="h-4 w-4 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <span className="sr-only sm:hidden">Search</span>
          </Button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Try:</span>
          {QUICK_SEARCHES.map((s) => {
            const active = q.toLowerCase() === s.q;
            return (
              <Link
                key={s.q}
                href={active ? buildHref({ q: undefined, page: undefined }) : buildHref({ q: s.q, page: undefined })}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-[#121110] bg-[#121110] text-[#fbf9f5]"
                    : "border-border/80 bg-background text-foreground hover:border-[#d4af37]",
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        <details className="group mt-3 border-t border-border/60 pt-3" open={advancedActive}>
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            More filters
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Category</span>
              <select name="category" defaultValue={category} className={selectClass}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Sort by</span>
              <select name="sort" defaultValue={sort} className={selectClass}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Condition</span>
              <select name="condition" defaultValue={condition ?? ""} className={selectClass}>
                <option value="">Any condition</option>
                {PRODUCT_CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {CONDITION_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Availability</span>
              <select name="availability" defaultValue={availability} className={selectClass}>
                <option value="all">Show everything</option>
                <option value="in_stock">In stock only</option>
              </select>
            </label>
            {facets.sizes.length > 0 ? (
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>Size</span>
                <select name="size" defaultValue={size ?? ""} className={selectClass}>
                  <option value="">Any size</option>
                  {facets.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {facets.colours.length > 0 ? (
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>Colour</span>
                <select name="colour" defaultValue={colour ?? ""} className={selectClass}>
                  <option value="">Any colour</option>
                  {facets.colours.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Lowest price (₦)</span>
              <Input
                name="minPrice"
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={minPrice ?? ""}
                placeholder="e.g. 5000"
                className="h-10 rounded-xl"
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Highest price (₦)</span>
              <Input
                name="maxPrice"
                type="number"
                min={0}
                inputMode="numeric"
                defaultValue={maxPrice ?? ""}
                placeholder="e.g. 30000"
                className="h-10 rounded-xl"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2 lg:col-span-4">
              <input
                type="checkbox"
                name="onSale"
                value="1"
                defaultChecked={onSale}
                className="rounded border-border"
              />
              Only show items on sale
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit" size="sm" className="rounded-xl px-5">
              Apply filters
            </Button>
            {hasFilters ? (
              <Button asChild type="button" size="sm" variant="outline" className="rounded-xl px-5">
                <Link href={basePath}>Clear all</Link>
              </Button>
            ) : null}
          </div>
        </details>
      </form>

      {categories.length > 0 ? (
        <details
          className="group mt-3 rounded-2xl border border-border/80 bg-card shadow-xs"
          open={Boolean(category)}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              <LayoutGrid className="h-4 w-4 shrink-0 text-[#b38e5d]" aria-hidden />
              Browse by category
              <span className="font-normal text-muted-foreground">({categories.length})</span>
              {activeCategory ? (
                <span className="rounded-full bg-[#121110] px-2.5 py-0.5 text-[11px] font-medium text-[#fbf9f5]">
                  {activeCategory.name}
                </span>
              ) : null}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span>
              <ChevronDown
                className="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </span>
          </summary>
          <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 py-3">
            <Link
              href={buildHref({ category: undefined, page: undefined })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                !category
                  ? "border-[#121110] bg-[#121110] text-[#fbf9f5]"
                  : "border-border/80 bg-background hover:border-[#d4af37]",
              )}
            >
              All products
            </Link>
            {categories.map((c) => {
              const active = c.slug === category;
              return (
                <Link
                  key={c.id}
                  href={buildHref({ category: active ? undefined : c.slug, page: undefined })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    active
                      ? "border-[#121110] bg-[#121110] text-[#fbf9f5]"
                      : "border-border/80 bg-background hover:border-[#d4af37]",
                  )}
                >
                  {c.name}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[11px] tabular-nums",
                      active ? "bg-white/20" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {c._count.products}
                  </span>
                </Link>
              );
            })}
          </div>
        </details>
      ) : null}

      <div className="mb-4 mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{result.total}</span>{" "}
          {result.total === 1 ? "item" : "items"}
          {q ? (
            <>
              {" "}
              for <span className="text-foreground">“{q}”</span>
            </>
          ) : null}
          {activeCategory ? (
            <>
              {" "}
              in <span className="text-foreground">{activeCategory.name}</span>
            </>
          ) : null}
          {result.total > result.pageSize ? (
            <span>
              {" "}
              · showing {from}–{to}
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {result.understood.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium capitalize text-foreground"
            >
              {chip}
            </span>
          ))}
          {hasFilters ? (
            <Link
              href={basePath}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:underline"
            >
              <X className="h-3 w-3" aria-hidden /> Clear search
            </Link>
          ) : null}
        </div>
      </div>

      {result.products.length === 0 ? (
        <EmptyState
          illustration={<FashionRackIllustration />}
          title={hasFilters ? "Nothing matches that search" : "No products yet"}
          description={
            hasFilters
              ? "Try fewer words, a different spelling, or clear the search to see everything."
              : "New pieces are on the way — check back soon."
          }
          actionHref={basePath}
          actionLabel={hasFilters ? "See all products" : "Refresh"}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {result.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 ? (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Pagination">
          {result.page > 1 ? (
            <Button asChild variant="outline" size="sm" className="rounded-full px-5">
              <Link href={buildHref({ page: result.page > 2 ? String(result.page - 1) : undefined })}>
                Previous
              </Link>
            </Button>
          ) : null}
          <span className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground shadow-xs">
            Page {result.page} of {result.totalPages}
          </span>
          {result.page < result.totalPages ? (
            <Button asChild size="sm" className="rounded-full px-5">
              <Link href={buildHref({ page: String(result.page + 1) })}>More products</Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
