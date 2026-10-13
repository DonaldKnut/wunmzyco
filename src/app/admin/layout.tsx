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
    <div className="flex min-h-screen bg-[#faf8f5] text-[#1a1a18]">
      <AdminSidebar user={user} logoutAction={logoutStaff} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[#e8e4dc] bg-[#faf8f5] px-6 py-3">
          <p className="text-xs text-[#7a776f]">
            Staff dashboard — customer self-registration is disabled here.
          </p>
        </header>
        <main className="flex-1 overflow-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
