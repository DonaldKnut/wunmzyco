import { prisma } from "@/lib/db";
import type {
  Prisma,
  Product,
  ProductCondition,
  ProductImage,
  ProductStatus,
} from "@prisma/client";
import {
  describeParsedSearch,
  effectivePriceWhere,
  parseSearchQuery,
  searchTermsWhere,
} from "@/lib/store/search";

export const PUBLISHED = "PUBLISHED" satisfies ProductStatus;

export type ProductListImage = Pick<ProductImage, "url" | "alt">;

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
  coverImage: ProductListImage | null;
  /** Ordered gallery for card sliders (cover first). */
  images: ProductListImage[];
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
    take: 8,
    orderBy: [{ isCover: "desc" as const }, { sortOrder: "asc" as const }],
    select: { url: true, alt: true, isCover: true },
  },
} satisfies Prisma.ProductSelect;

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
    images: { url: string; alt: string | null; isCover?: boolean }[];
  },
): ProductListItem {
  const images = row.images.map((img) => ({ url: img.url, alt: img.alt }));
  const cover =
    row.images.find((img) => img.isCover) ?? row.images[0] ?? null;
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
    images,
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
    const { products } = await getShopProducts({ q, pageSize: limit });
    return products;
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
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: {
          select: {
            products: { where: { product: { status: PUBLISHED } } },
          },
        },
      },
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

export type ShopSort = "featured" | "newest" | "price-asc" | "price-desc" | "name";

export const PRODUCT_CONDITIONS = ["NEW", "LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"] as const;

export type ShopQuery = {
  q?: string;
  category?: string;
  sort?: ShopSort;
  minPrice?: number; // naira
  maxPrice?: number; // naira
  availability?: "in_stock" | "all";
  condition?: ProductCondition;
  size?: string;
  colour?: string;
  onSale?: boolean;
  page?: number;
  pageSize?: number;
};

export function buildShopWhere(query: ShopQuery) {
  const parsed = parseSearchQuery(query.q?.trim() ?? "");
  const and: Prisma.ProductWhereInput[] = [
    { status: PUBLISHED },
    ...searchTermsWhere(parsed.terms),
  ];

  if (query.category) {
    and.push({ categories: { some: { category: { slug: query.category, isActive: true } } } });
  }
  if (query.availability === "in_stock" || parsed.inStock) {
    and.push({ stock: { gt: 0 } });
  }
  const condition = query.condition ?? parsed.condition;
  if (condition) and.push({ condition });
  if (query.onSale || parsed.onSale) and.push({ salePriceKobo: { not: null } });
  if (parsed.oneOfOne) and.push({ isOneOfOne: true });
  if (query.size) {
    and.push({
      OR: [
        { sizes: { has: query.size } },
        { variants: { some: { isActive: true, size: { equals: query.size, mode: "insensitive" } } } },
      ],
    });
  }
  if (query.colour) {
    and.push({
      OR: [
        { colours: { has: query.colour } },
        {
          variants: {
            some: { isActive: true, colour: { equals: query.colour, mode: "insensitive" } },
          },
        },
      ],
    });
  }
  const price = effectivePriceWhere(
    query.minPrice ?? parsed.minPrice,
    query.maxPrice ?? parsed.maxPrice,
  );
  if (price) and.push(price);

  return { where: { AND: and } satisfies Prisma.ProductWhereInput, parsed };
}

function shopOrderBy(sort: ShopSort | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceKobo: "asc" }];
    case "price-desc":
      return [{ priceKobo: "desc" }];
    case "name":
      return [{ name: "asc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      // In-stock and featured pieces first, then newest.
      return [{ isFeatured: "desc" }, { stock: "desc" }, { createdAt: "desc" }];
  }
}

export async function getShopProducts(query: ShopQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 24));
  const skip = (page - 1) * pageSize;
  const { where, parsed } = buildShopWhere(query);
  const understood = describeParsedSearch(parsed);

  try {
    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: shopOrderBy(query.sort),
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
      understood,
    };
  } catch {
    return { products: [], total: 0, page: 1, pageSize, totalPages: 1, understood };
  }
}

/** Sizes and colours that actually exist on published products, for filter dropdowns. */
export async function getShopFacets(): Promise<{ sizes: string[]; colours: string[] }> {
  try {
    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: { status: PUBLISHED },
        select: { sizes: true, colours: true },
        take: 1000,
      }),
      prisma.productVariant.findMany({
        where: { isActive: true, product: { status: PUBLISHED } },
        select: { size: true, colour: true },
        take: 2000,
      }),
    ]);
    const sizes = new Map<string, string>();
    const colours = new Map<string, string>();
    const add = (map: Map<string, string>, value: string | null | undefined) => {
      const v = value?.trim();
      if (v && !map.has(v.toLowerCase())) map.set(v.toLowerCase(), v);
    };
    for (const p of products) {
      p.sizes.forEach((s) => add(sizes, s));
      p.colours.forEach((c) => add(colours, c));
    }
    for (const v of variants) {
      add(sizes, v.size);
      add(colours, v.colour);
    }
    const sort = (values: Iterable<string>) =>
      [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return { sizes: sort(sizes.values()), colours: sort(colours.values()) };
  } catch {
    return { sizes: [], colours: [] };
  }
}
