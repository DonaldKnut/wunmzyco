import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { updateProduct } from "@/server/actions/products";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  const user = await requirePermission("products:read");
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!product) notFound();

  if (!hasPermission(user.role, "products:write")) {
    redirect("/admin?error=forbidden");
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  async function updateAction(formData: FormData) {
    "use server";
    await updateProduct(id, formData);
  }

  return (
    <>
      <PageHeader title={`Edit · ${product.name}`} description={`SKU ${product.sku}`} />
      <ProductForm
        action={updateAction}
        categories={categories}
        product={product}
        submitLabel="Save changes"
      />
    </>
  );
}
