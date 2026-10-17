"use client";

import { Compass } from "lucide-react";
import { useAdminTour } from "@/components/admin/tour/tour-context";

export function AdminTourTrigger() {
  const { start, active } = useAdminTour();

  return (
    <button
      type="button"
      onClick={start}
      disabled={active}
      data-tour="tour-trigger"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e8e4dc] bg-white px-2.5 text-xs font-medium text-[#3d3b36] transition hover:bg-[#f0ebe3] disabled:opacity-50"
    >
      <Compass className="h-3.5 w-3.5" aria-hidden />
      Take a tour
    </button>
  );
}
