import { prisma } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api/http";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = rateLimit(clientKey("search", ip), 60, 60_000);
  if (!limited.ok) return jsonError("Too many requests", 429);

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q || q.length < 1) {
    return jsonOk({ hits: [], query: q });
  }
  if (q.length > 80) return jsonError("Query too long", 400);

  const [products, categories, collections] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { material: { contains: q, mode: "insensitive" } },
          { colours: { has: q } },
        ],
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        priceKobo: true,
        salePriceKobo: true,
        condition: true,
      },
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { id: true, name: true, slug: true, description: true },
    }),
    prisma.collection.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { id: true, name: true, slug: true, description: true },
    }),
  ]);

  const hits = [
    ...products.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      href: `/products/${p.slug}`,
      subtitle: p.condition.replaceAll("_", " ").toLowerCase(),
      priceKobo: p.salePriceKobo != null && p.salePriceKobo < p.priceKobo ? p.salePriceKobo : p.priceKobo,
    })),
    ...categories.map((c) => ({
      type: "category" as const,
      id: c.id,
      title: c.name,
      href: `/categories/${c.slug}`,
      subtitle: "Category",
    })),
    ...collections.map((c) => ({
      type: "collection" as const,
      id: c.id,
      title: c.name,
      href: `/shop?q=${encodeURIComponent(c.name)}`,
      subtitle: "Collection",
    })),
  ];

  return jsonOk({ hits, query: q });
}
