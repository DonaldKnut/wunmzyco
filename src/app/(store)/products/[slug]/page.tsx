import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { formatNgn } from "@/lib/currency";
import { getOrCreateCartId } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { effectiveUnitPrice, getProductBySlug } from "@/lib/store/products";
import { Sparkles, ShieldCheck, Truck, MessageCircle, ArrowLeft } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product · Wunmzy Co" };
  return { title: `${product.name} · Wunmzy Co`, description: product.description.slice(0, 160) };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = effectiveUnitPrice(product);
  const onSale =
    product.salePriceKobo != null && product.salePriceKobo < product.priceKobo;
  const discountPercent = onSale
    ? Math.round(((product.priceKobo - price) / product.priceKobo) * 100)
    : 0;

  let initialCartQuantity = 0;
  try {
    const cartId = await getOrCreateCartId();
    if (cartId) {
      const item = await prisma.cartItem.findFirst({
        where: {
          cartId,
          productId: product.id,
          variantId: product.hasVariants ? product.variants[0]?.id ?? null : null,
        },
        select: { quantity: true },
      });
      initialCartQuantity = item?.quantity ?? 0;
    }
  } catch {
    initialCartQuantity = 0;
  }

  const stylistWa = whatsappLink(
    BRAND.whatsappNumber,
    `Hi Wunmzy Co! I’m looking at the piece "${product.name}" (${BRAND.siteUrl}/products/${product.slug}) and would love styling/measurement details.`,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Shop Rail
        </Link>
        <span>/</span>
        {product.categories[0] ? (
          <>
            <Link
              href={`/categories/${product.categories[0].category.slug}`}
              className="hover:text-foreground"
            >
              {product.categories[0].category.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="truncate text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Gallery */}
        <div className="sticky top-24">
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

        {/* Product Details Panel */}
        <div className="space-y-7">
          {/* Badges strip */}
          <div className="flex flex-wrap items-center gap-2">
            {product.isOneOfOne ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d4af37]/60 bg-[#121110] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#d4af37] shadow-xs">
                <Sparkles className="h-3 w-3" /> One of One Archive
              </span>
            ) : null}
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs uppercase tracking-wider">
              {product.condition.replace(/_/g, " ")}
            </Badge>
            {onSale ? (
              <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Save {discountPercent}%
              </span>
            ) : null}
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
              {product.name}
            </h1>
            {product.categories.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {product.categories.map((c) => (
                  <Link
                    key={c.categoryId}
                    href={`/categories/${c.category.slug}`}
                    className="hover:text-[#b38e5d] transition-colors"
                  >
                    {c.category.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 border-y border-border/80 py-4">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              {formatNgn(price)}
            </span>
            {onSale ? (
              <span className="text-base text-muted-foreground line-through">
                {formatNgn(product.priceKobo)}
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground ml-auto">
              Taxes included · Nationwide dispatch
            </span>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Curator&apos;s Notes
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Add to Cart Form */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <AddToCartForm
              productId={product.id}
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
              initialCartQuantity={initialCartQuantity}
              isOneOfOne={product.isOneOfOne}
            />
          </div>

          {/* Direct WhatsApp Stylist Consultation Button */}
          <a
            href={stylistWa}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-50/60 p-4 text-xs font-semibold uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-100"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>Consult Stylist on WhatsApp About This Piece</span>
          </a>

          {/* Value Assurances Box */}
          <div className="grid gap-3 rounded-2xl border border-border/70 bg-secondary/40 p-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[#b38e5d] shrink-0" />
              <span>Individually inspected, steam-sanitized, and guaranteed authentic condition.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-[#b38e5d] shrink-0" />
              <span>Same-day door-to-door delivery in Lagos; express nationwide courier dispatch.</span>
            </div>
          </div>

          {/* Reviews */}
          {product.reviews.length > 0 ? (
            <section className="border-t border-border pt-8">
              <h2 className="font-display mb-4 text-2xl font-medium text-foreground">
                Client Impressions
              </h2>
              <ul className="space-y-4">
                {product.reviews.map((review) => (
                  <li key={review.id} className="rounded-xl border border-border/70 bg-card p-4 text-sm">
                    <p className="font-semibold text-foreground">{review.authorName}</p>
                    {review.title ? (
                      <p className="font-display text-lg font-medium text-foreground mt-0.5">
                        {review.title}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {review.body}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
