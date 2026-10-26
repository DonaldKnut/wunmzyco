import Link from "next/link";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata = { title: "Create account" };

/** Public registration is not used — shop is guest checkout; staff use /login. */
export default async function RegisterPage() {
  // Signed-in redirect is handled in (auth)/layout.tsx
  return (
    <AuthShell>
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Wunmzy Co
        </p>
        <h1 className="font-display text-4xl tracking-tight">No public signup</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          You can shop and checkout as a guest. Staff access the dashboard with an invited
          account — no self-registration.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/shop"
            className="inline-flex h-10 items-center border border-foreground bg-foreground px-5 text-sm text-background transition hover:bg-foreground/90"
          >
            Continue shopping
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center border border-border px-5 text-sm transition hover:bg-muted"
          >
            Staff sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
