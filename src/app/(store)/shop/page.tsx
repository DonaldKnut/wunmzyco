import { Marketplace } from "@/components/storefront/marketplace";

export const metadata = { title: "Shop all products · Wunmzy Co" };

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;

  return (
    <div className="pb-10">
      <section className="border-b border-border/70 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 pb-1 pt-6 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            All products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by name, colour, size, category or price — e.g. “red dress under 20k”.
          </p>
        </div>
      </section>
      <Marketplace basePath="/shop" searchParams={sp} />
    </div>
  );
}
