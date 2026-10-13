import { prisma } from "@/lib/db";
import type { Prisma, Product, ProductImage, ProductStatus } from "@prisma/client";

export const PUBLISHED = "PUBLISHED" satisfies ProductStatus;

export type ProductListItem = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "priceKobo"
  | "salePriceKobo"
  | "condition"
  | "isOneOfOne"
  | "stock"
> & {
  coverImage: Pick<ProductImage, "url" | "alt"> | null;
};

const listSelect = {
  id: true,
  name: true,
  slug: true,
  priceKobo: true,
  salePriceKobo: true,
  condition: true,
  isOneOfOne: true,
  stock: true,
  images: {
    where: { isCover: true },
    take: 1,
    orderBy: { sortOrder: "asc" as const },
    select: { url: true, alt: true },
  },
} as const;

function mapListItem(
  row: {
    id: string;
    name: string;
    slug: string;
    priceKobo: number;
    salePriceKobo: number | null;
    condition: Product["condition"];
    isOneOfOne: boolean;
    stock: number;
    images: { url: string; alt: string | null }[];
  },
): ProductListItem {
  const cover = row.images[0];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    priceKobo: row.priceKobo,
    salePriceKobo: row.salePriceKobo,
    condition: row.condition,
    isOneOfOne: row.isOneOfOne,
    stock: row.stock,
    coverImage: cover ? { url: cover.url, alt: cover.alt } : null,
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: PUBLISHED, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: listSelect,
    });
    return rows.map(mapListItem);
  } catch {
    return [];
  }
}

export async function getLatestProducts(limit = 12): Promise<ProductListItem[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: PUBLISHED },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: listSelect,
    });
    return rows.map(mapListItem);
  } catch {
    return [];
  }
}

export async function searchProducts(query: string, limit = 24): Promise<ProductListItem[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const rows = await prisma.product.findMany({
      where: {
        status: PUBLISHED,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: listSelect,
    });
    return rows.map(mapListItem);
  } catch {
    return [];
  }
}

export async function getProductsByCategorySlug(
  slug: string,
  limit = 48,
): Promise<{ category: { name: string; description: string | null } | null; products: ProductListItem[] }> {
  try {
    const category = await prisma.category.findFirst({
      where: { slug, isActive: true },
      select: {
        name: true,
        description: true,
        products: {
          where: { product: { status: PUBLISHED } },
          take: limit,
          orderBy: { product: { createdAt: "desc" } },
          select: {
            product: { select: listSelect },
          },
        },
      },
    });
    if (!category) return { category: null, products: [] };
    return {
      category: { name: category.name, description: category.description },
      products: category.products.map((p) => mapListItem(p.product)),
    };
  } catch {
    return { category: null, products: [] };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: { slug, status: PUBLISHED },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        categories: { include: { category: true } },
        variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getActiveCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, description: true, imageUrl: true },
    });
  } catch {
    return [];
  }
}

export function effectiveUnitPrice(product: {
  priceKobo: number;
  salePriceKobo: number | null;
}): number {
  if (product.salePriceKobo != null && product.salePriceKobo < product.priceKobo) {
    return product.salePriceKobo;
  }
  return product.priceKobo;
}

export type ShopQuery = {
  q?: string;
  category?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  minPrice?: number; // naira
  maxPrice?: number; // naira
  availability?: "in_stock" | "all";
  page?: number;
  pageSize?: number;
};

export async function getShopProducts(query: ShopQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 24));
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProductWhereInput = { status: PUBLISHED };

  if (query.q?.trim()) {
    const q = query.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  if (query.category) {
    where.categories = { some: { category: { slug: query.category, isActive: true } } };
  }

  if (query.availability === "in_stock") {
    where.stock = { gt: 0 };
  }

  if (query.minPrice != null || query.maxPrice != null) {
    const priceFilter: Prisma.IntFilter = {};
    if (query.minPrice != null) priceFilter.gte = Math.round(query.minPrice * 100);
    if (query.maxPrice != null) priceFilter.lte = Math.round(query.maxPrice * 100);
    where.priceKobo = priceFilter;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "price-asc"
      ? { priceKobo: "asc" }
      : query.sort === "price-desc"
        ? { priceKobo: "desc" }
        : query.sort === "name"
          ? { name: "asc" }
          : { createdAt: "desc" };

  try {
    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: listSelect,
      }),
    ]);

    return {
      products: rows.map(mapListItem),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch {
    return { products: [], total: 0, page: 1, pageSize, totalPages: 1 };
  }
}
