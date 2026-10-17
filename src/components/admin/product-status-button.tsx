"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ProductStatus } from "@prisma/client";
import { Archive, Eye } from "lucide-react";
import { toast } from "sonner";
import { setProductStatus } from "@/server/actions/products";

export function ProductStatusButton({
  productId,
  status,
}: {
  productId: string;
  status: Extract<ProductStatus, "PUBLISHED" | "ARCHIVED">;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isPublish = status === "PUBLISHED";

  return (
    <button
      type="button"
      disabled={pending}
      title={isPublish ? "Publish" : "Archive"}
      className={
        isPublish
          ? "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-[#2d4a2d] hover:bg-[#dfe8df] disabled:opacity-50"
          : "inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-[#6b4f1d] hover:bg-[#f5ead6] disabled:opacity-50"
      }
      onClick={() => {
        startTransition(async () => {
          const result = await setProductStatus(productId, status);
          if (result.ok) {
            toast.success(isPublish ? "Product published — now on the storefront" : "Product archived");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      {isPublish ? <Eye className="h-3 w-3" aria-hidden /> : <Archive className="h-3 w-3" aria-hidden />}
      {pending ? "…" : isPublish ? "Publish" : "Archive"}
    </button>
  );
}
