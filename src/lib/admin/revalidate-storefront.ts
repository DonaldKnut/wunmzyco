import { revalidatePath } from "next/cache";

/** Keep the public storefront in sync after catalogue / settings changes. */
export function revalidateStorefront(opts?: { productSlug?: string; categorySlug?: string }) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/search");
  if (opts?.productSlug) {
    revalidatePath(`/products/${opts.productSlug}`);
  }
  if (opts?.categorySlug) {
    revalidatePath(`/categories/${opts.categorySlug}`);
  }
}
