import Link from "next/link";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { getActiveCategories } from "@/lib/store/products";
import { EmptyState } from "@/components/storefront/empty-state";

export const metadata = { title: "Categories Directory · Wunmzy Co" };

export default async function CategoriesIndexPage() {
  const categories = await getActiveCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d] shadow-xs">
          <Layers className="h-3.5 w-3.5 text-[#d4af37]" /> The Directory
        </div>
        <h1 className="font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
          Browse by Category
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground leading-relaxed sm:text-base">
          Explore our tailored selections curated for your exact style vision across every occasion.
        </p>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories published yet"
          description="Categories will appear here once created in the admin dashboard."
          actionHref="/shop"
          actionLabel="Explore all pieces"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/70 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-xs font-semibold text-[#b38e5d]">0{idx + 1}</span>
                  <span className="rounded-full bg-secondary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Curated Collection
                  </span>
                </div>
                <h3 className="mt-5 font-display text-3xl font-medium tracking-tight text-foreground transition-colors group-hover:text-accent">
                  {cat.name}
                </h3>
                {cat.description ? (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                    {cat.description}
                  </p>
                ) : (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Discover exclusive pieces handpicked for this curation.
                  </p>
                )}
              </div>

              <div className="pt-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-colors group-hover:text-[#b38e5d]">
                  Explore Category
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
