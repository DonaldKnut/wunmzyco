import Link from "next/link";
import { notFound } from "next/navigation";
import type { ProductCondition } from "@prisma/client";
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { formatNgn } from "@/lib/currency";
import { getOrCreateCartId } from "@/lib/cart";
import { prisma } from "@/lib/db";
import {
  effectiveUnitPrice,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/store/products";
import { BRAND, productEnquiryMessage, whatsappLink } from "@/lib/brand";
import { absoluteUrl, cn } from "@/lib/utils";

const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: "Brand new",
  LIKE_NEW: "Like new",
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
};

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const cover = product.images.find((i) => i.isCover) ?? product.images[0];
  const description = product.description.slice(0, 160);
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: absoluteUrl(`/products/${product.slug}`),
      images: cover ? [{ url: cover.url, alt: cover.alt ?? product.name }] : undefined,
    },
  };
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-border" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold uppercase tracking-wider text-foreground [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = effectiveUnitPrice(product);
  const onSale = product.salePriceKobo != null && product.salePriceKobo < product.priceKobo;
  const discountPercent = onSale
    ? Math.round(((product.priceKobo - price) / product.priceKobo) * 100)
    : 0;
  const totalStock = product.hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;
  const primaryCategory = product.categories[0]?.category;

  let initialCartQuantity = 0;
  try {
    const cartId = await getOrCreateCartId();
    if (cartId) {
      const item = await prisma.cartItem.findFirst({
        where: {
          cartId,
          productId: product.id,
          variantId: product.hasVariants ? (product.variants[0]?.id ?? null) : null,
        },
        select: { quantity: true },
      });
      initialCartQuantity = item?.quantity ?? 0;
    }
  } catch {
    initialCartQuantity = 0;
  }

  const related = await getRelatedProducts(
    product.id,
    product.categories.map((c) => c.categoryId),
    4,
  );

  const enquiryHref = whatsappLink(
    BRAND.whatsappNumber,
    productEnquiryMessage(product.name, absoluteUrl(`/products/${product.slug}`)),
  );

  const details: { label: string; value: string }[] = [
    { label: "Condition", value: CONDITION_LABELS[product.condition] },
    ...(product.material ? [{ label: "Material", value: product.material }] : []),
    ...(product.measurements ? [{ label: "Measurements", value: product.measurements }] : []),
    ...(product.sizes.length ? [{ label: "Sizes", value: product.sizes.join(", ") }] : []),
    ...(product.colours.length ? [{ label: "Colours", value: product.colours.join(", ") }] : []),
    { label: "Product code", value: product.sku },
  ];

  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-20">
      <nav
        className="mb-5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="shrink-0 hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
        {primaryCategory ? (
          <>
            <Link
              href={`/shop?category=${primaryCategory.slug}`}
              className="shrink-0 hover:text-foreground"
            >
              {primaryCategory.name}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          </>
        ) : (
          <>
            <Link href="/shop" className="shrink-0 hover:text-foreground">
              Shop
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          </>
        )}
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            images={product.images.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              isCover: img.isCover,
            }))}
            productName={product.name}
          />
        </div>

        <div className="min-w-0">
          {product.categories.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38e5d]">
              {product.categories.map((c) => (
                <Link
                  key={c.categoryId}
                  href={`/shop?category=${c.category.slug}`}
                  className="hover:text-foreground"
                >
                  {c.category.name}
                </Link>
              ))}
            </div>
          ) : null}

          <h1 className="mt-2 font-display text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          {avgRating != null ? (
            <a
              href="#reviews"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Star className="h-3.5 w-3.5 fill-[#d4af37] text-[#d4af37]" aria-hidden />
              {avgRating.toFixed(1)} · {product.reviews.length} review
              {product.reviews.length === 1 ? "" : "s"}
            </a>
          ) : null}

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatNgn(price)}
            </span>
            {onSale ? (
              <>
                <span className="text-base tabular-nums text-muted-foreground line-through">
                  {formatNgn(product.priceKobo)}
                </span>
                <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  −{discountPercent}%
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium",
                totalStock <= 0
                  ? "bg-secondary text-muted-foreground"
                  : totalStock === 1
                    ? "bg-amber-50 text-amber-800"
                    : "bg-emerald-50 text-emerald-800",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  totalStock <= 0
                    ? "bg-muted-foreground"
                    : totalStock === 1
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                )}
              />
              {totalStock <= 0 ? "Sold out" : totalStock === 1 ? "Only 1 left" : "In stock"}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
              Condition: {CONDITION_LABELS[product.condition]}
            </span>
            {product.isOneOfOne ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#121110] px-3 py-1 font-medium text-[#d4af37]">
                <Sparkles className="h-3 w-3" aria-hidden /> One of one
              </span>
            ) : null}
          </div>

          <div className="mt-7 border-t border-border pt-6">
            <AddToCartForm
              productId={product.id}
              productName={product.name}
              stock={product.stock}
              hasVariants={product.hasVariants}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                stock: v.stock,
                priceKobo: v.priceKobo,
                salePriceKobo: v.salePriceKobo,
              }))}
              basePriceKobo={price}
              enquiryHref={enquiryHref}
              initialCartQuantity={initialCartQuantity}
              isOneOfOne={product.isOneOfOne}
            />
          </div>

          <ul className="mt-6 grid gap-3 rounded-2xl bg-secondary/40 p-4 text-xs text-muted-foreground sm:grid-cols-3 sm:gap-2">
            <li className="flex items-center gap-2 sm:flex-col sm:text-center">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#b38e5d]" aria-hidden />
              Inspected &amp; cleaned before dispatch
            </li>
            <li className="flex items-center gap-2 sm:flex-col sm:text-center">
              <Truck className="h-4 w-4 shrink-0 text-[#b38e5d]" aria-hidden />
              Same-day Lagos, nationwide delivery
            </li>
            <li className="flex items-center gap-2 sm:flex-col sm:text-center">
              <CreditCard className="h-4 w-4 shrink-0 text-[#b38e5d]" aria-hidden />
              Pay by Paystack or WhatsApp
            </li>
          </ul>

          <div className="mt-6 border-t border-border">
            <Section title="Description" defaultOpen>
              <p className="whitespace-pre-wrap">{product.description}</p>
            </Section>
            <Section title="Details">
              <dl className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-x-4 gap-y-2">
                {details.map((d) => (
                  <div key={d.label} className="contents">
                    <dt className="text-foreground">{d.label}</dt>
                    <dd className="break-words">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
            <Section title="Delivery & returns">
              <p>
                Same-day delivery within Lagos and express courier nationwide. The delivery fee is
                worked out at checkout from your area.
              </p>
              <p className="mt-2">
                Read our{" "}
                <Link href="/shipping-policy" className="text-foreground underline underline-offset-4">
                  shipping policy
                </Link>{" "}
                and{" "}
                <Link href="/returns-policy" className="text-foreground underline underline-offset-4">
                  returns policy
                </Link>
                .
              </p>
            </Section>
          </div>
        </div>
      </div>

      {product.reviews.length > 0 ? (
        <section id="reviews" className="mt-16 scroll-mt-24 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
            What customers say
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {product.reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-border/70 bg-card p-5">
                <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < review.rating ? "fill-[#d4af37] text-[#d4af37]" : "text-border",
                      )}
                      aria-hidden
                    />
                  ))}
                </div>
                {review.title ? (
                  <p className="mt-2 font-medium text-foreground">{review.title}</p>
                ) : null}
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                <p className="mt-3 text-xs font-medium text-foreground">{review.authorName}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16 border-t border-border pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-medium text-foreground sm:text-3xl">
              You may also like
            </h2>
            <Link
              href={primaryCategory ? `/shop?category=${primaryCategory.slug}` : "/shop"}
              className="shrink-0 text-xs font-semibold uppercase tracking-wider text-foreground underline-offset-4 hover:underline"
            >
              See more
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
