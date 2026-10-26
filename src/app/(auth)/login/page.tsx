import { safeAdminPath } from "@/lib/auth/flash";
import { LoginForm } from "@/components/storefront/auth-forms";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata = { title: "Staff sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const nextRaw = typeof params.next === "string" ? params.next : undefined;
  const next = safeAdminPath(nextRaw);
  // Signed-in redirect is handled in (auth)/layout.tsx

  return (
    <AuthShell showMobilePromo>
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Wunmzy Co · Admin
        </p>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Sign in</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Enter your staff credentials to open the dashboard. One portal — straight to admin.
        </p>
      </div>

      <LoginForm next={next} />
    </AuthShell>
  );
}
