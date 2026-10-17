import { redirect } from "next/navigation";

/** Product editing is a modal on the products list. */
export default function EditProductPage() {
  redirect("/admin/products");
}
