"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { setCategoryActive } from "@/server/actions/catalog";
import { Badge } from "@/components/admin/ui";

export function CategoryActiveToggle({
  categoryId,
  isActive,
}: {
  categoryId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title={isActive ? "Click to hide from storefront" : "Click to show on storefront"}
      onClick={() => {
        startTransition(async () => {
          const result = await setCategoryActive(categoryId, !isActive);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(isActive ? "Category hidden" : "Category is now visible");
          router.refresh();
        });
      }}
      className="disabled:opacity-50"
    >
      <Badge tone={isActive ? "success" : "neutral"}>
        {pending ? "…" : isActive ? "Active" : "Hidden"}
      </Badge>
    </button>
  );
}
