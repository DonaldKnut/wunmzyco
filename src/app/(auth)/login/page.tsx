import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/permissions";
import { LoginForm } from "@/components/storefront/auth-forms";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const user = await getSessionUser();
  if (user) {
    if (isStaffRole(user.role) && next?.startsWith("/")) redirect(next);
    if (isStaffRole(user.role)) redirect("/admin");
    redirect("/account");
  }

  const staffFlow = next?.startsWith("/admin");

  return (
    <AuthShell showMobilePromo>
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-tight">
          {staffFlow ? "Staff sign in" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {staffFlow
            ? "No public staff registration — ask a super admin for an account."
            : "Sign in to track orders, save addresses, and check out faster."}
        </p>
      </div>

      <LoginForm next={next} staffHint={staffFlow} />
    </AuthShell>
  );
}
