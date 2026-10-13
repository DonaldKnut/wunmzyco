import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/permissions";
import { LoginForm } from "@/components/storefront/auth-forms";
import { AuthPromoSlider } from "@/components/storefront/auth-promo-slider";

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
  const reset = params.reset;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden lg:block">
        <AuthPromoSlider />
      </aside>

      <section className="relative flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <Link href="/" className="absolute left-6 top-6 font-display text-xl tracking-tight sm:left-10 lg:left-16">
          Wunmzy Co
        </Link>

        <div className="mx-auto w-full max-w-md space-y-8">
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

          {reset === "1" ? (
            <p className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm">
              Password updated — you can sign in now.
            </p>
          ) : null}

          <div className="lg:hidden">
            <div className="overflow-hidden rounded-xl border border-border">
              <AuthPromoSlider />
            </div>
          </div>

          <LoginForm next={next} staffHint={staffFlow} />
        </div>
      </section>
    </div>
  );
}
