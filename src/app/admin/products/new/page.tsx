import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { createProduct } from "@/server/actions/products";

export default async function NewProductPage() {
  const user = await requirePermission("products:read");
  if (!hasPermission(user.role, "products:write")) {
    redirect("/admin?error=forbidden");
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  async function createAction(formData: FormData) {
    "use server";
    const result = await createProduct(formData);
    if (result.ok && result.data?.id) {
      redirect(`/admin/products/${result.data.id}/edit`);
    }
  }

  return (
    <>
      <PageHeader title="New product" />
      <ProductForm action={createAction} categories={categories} submitLabel="Create product" />
    </>
  );
}
