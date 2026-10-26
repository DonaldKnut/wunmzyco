import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTour, AdminTourTrigger } from "@/components/admin/tour";
import { requireStaffUser } from "@/lib/admin/auth";
import { logoutStaff } from "@/server/actions/auth";
import { Globe } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Suite · Wunmzy Co",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireStaffUser();

  return (
    <AdminTour>
      <div className="flex h-dvh overflow-hidden bg-[#fbf9f5] text-[#121110]">
        <AdminSidebar user={user} logoutAction={logoutStaff} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-14 lg:pt-0">
          <header className="sticky top-0 z-20 shrink-0 border-b border-[#e8e2d7] bg-[#fbf9f5]/90 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Store Active
                </span>
                <span className="text-xs text-[#7a776f] hidden sm:inline">
                  Wunmzy Co Luxury Operations & Catalogue Control
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  target="_blank"
                  className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#6b6459] transition hover:text-[#121110]"
                >
                  <Globe className="h-3.5 w-3.5 text-[#b38e5d]" />
                  <span>wunmzy.co</span>
                </Link>
                <div className="h-4 w-px bg-[#e8e2d7] hidden md:block" />
                <AdminTourTrigger />
              </div>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminTour>
  );
}
