"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteHomepageSlide } from "@/server/actions/homepage";

export function DeleteSlideButton({ slideId, title }: { slideId: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-[#6f2424] hover:bg-[#f3e0e0] disabled:opacity-50"
      onClick={() => {
        if (!window.confirm(`Delete slide “${title}”?`)) return;
        startTransition(async () => {
          const result = await deleteHomepageSlide(slideId);
          if (result.ok) {
            toast.success("Slide deleted");
            router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      <Trash2 className="h-3 w-3" aria-hidden />
      {pending ? "…" : "Delete"}
    </button>
  );
}
