import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { formatNgn } from "@/lib/currency";
import { getOrCreateCartId } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { effectiveUnitPrice, getProductBySlug } from "@/lib/store/products";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = effectiveUnitPrice(product);
  const onSale =
    product.salePriceKobo != null && product.salePriceKobo < product.priceKobo;

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            isCover: img.isCover,
          }))}
          productName={product.name}
        />
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {product.isOneOfOne ? <Badge variant="accent">One of one</Badge> : null}
            <Badge variant="outline">{product.condition.replace(/_/g, " ")}</Badge>
          </div>
          <h1 className="font-display text-4xl tracking-tight">{product.name}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-medium">{formatNgn(price)}</span>
            {onSale ? (
              <span className="text-muted-foreground line-through">
                {formatNgn(product.priceKobo)}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {product.description}
          </p>
          {product.categories.length > 0 ? (
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {product.categories.map((c) => (
                <Link
                  key={c.categoryId}
                  href={`/categories/${c.category.slug}`}
                  className="mr-3 hover:text-foreground"
                >
                  {c.category.name}
                </Link>
              ))}
            </p>
          ) : null}
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
          {product.reviews.length > 0 ? (
            <section className="border-t border-border pt-8">
              <h2 className="font-display mb-4 text-2xl">Reviews</h2>
              <ul className="space-y-4">
                {product.reviews.map((review) => (
                  <li key={review.id} className="text-sm">
                    <p className="font-medium">{review.authorName}</p>
                    {review.title ? <p className="font-display text-lg">{review.title}</p> : null}
                    <p className="text-muted-foreground">{review.body}</p>
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
