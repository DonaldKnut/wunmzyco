import { AdminSidebar } from "@/components/admin/sidebar";
import { requireStaffUser } from "@/lib/admin/auth";
import { logoutStaff } from "@/server/actions/auth";

export const metadata = {
  title: "Admin · Wunmzy Co",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireStaffUser();

  return (
    <div className="flex h-dvh overflow-hidden bg-[#faf8f5] text-[#1a1a18]">
      <AdminSidebar user={user} logoutAction={logoutStaff} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-12 lg:pt-0">
        <header className="sticky top-0 z-20 shrink-0 border-b border-[#e8e4dc] bg-[#faf8f5]/95 px-4 py-3 backdrop-blur sm:px-6">
          <p className="flex items-center gap-2 text-xs text-[#7a776f]">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Staff dashboard — manage catalogue, orders, and store settings.
          </p>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
