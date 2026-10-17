"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/server/actions/products";

export function DeleteProductButton({
  productId,
  productName,
  redirectTo,
}: {
  productId: string;
  productName: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title="Delete permanently"
      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-[#6f2424] hover:bg-[#f3e0e0] disabled:opacity-50"
      onClick={() => {
        const ok = window.confirm(
          `Delete “${productName}” permanently? This cannot be undone. Prefer Archive if the product may have order history.`,
        );
        if (!ok) return;
        startTransition(async () => {
          const result = await deleteProduct(productId);
          if (result.ok) {
            toast.success("Product deleted");
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      <Trash2 className="h-3 w-3" aria-hidden />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
