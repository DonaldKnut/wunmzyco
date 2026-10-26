import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { safeAdminPath } from "@/lib/auth/flash";
import { isStaffRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * Signed-in users never see auth screens again — staff → /admin (or ?next=), everyone else → home.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user) {
    if (isStaffRole(user.role)) {
      const h = await headers();
      const rawUrl = h.get("x-url") ?? h.get("referer") ?? "";
      let next: string | undefined;
      try {
        const u = new URL(rawUrl, "http://localhost");
        next = u.searchParams.get("next") ?? undefined;
      } catch {
        next = undefined;
      }
      redirect(safeAdminPath(next));
    }
    redirect("/");
  }

  return <div className="h-dvh overflow-hidden bg-background">{children}</div>;
}
