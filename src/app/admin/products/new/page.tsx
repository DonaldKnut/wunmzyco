import { redirect } from "next/navigation";

/** Product creation is a modal on the products list. */
export default function NewProductPage() {
  redirect("/admin/products");
}
