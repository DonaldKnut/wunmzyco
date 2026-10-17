"use client";

import { AdminTourProvider } from "@/components/admin/tour/tour-context";
import { AdminTourOverlay } from "@/components/admin/tour/tour-overlay";

export function AdminTour({ children }: { children: React.ReactNode }) {
  return (
    <AdminTourProvider>
      {children}
      <AdminTourOverlay />
    </AdminTourProvider>
  );
}

export { AdminTourTrigger } from "@/components/admin/tour/tour-trigger";
export { useAdminTour } from "@/components/admin/tour/tour-context";
