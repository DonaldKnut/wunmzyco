import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { getSessionUser } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/permissions";
import { AccountNav } from "@/components/storefront/account-nav";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  // Staff live in the admin dashboard, not the shopper account area.
  if (isStaffRole(user.role)) redirect("/admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Account</p>
          <h1 className="font-display text-3xl">Hello, {user.name.split(" ")[0]}</h1>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline-offset-4 hover:underline">
            Sign out
          </button>
        </form>
      </div>
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
