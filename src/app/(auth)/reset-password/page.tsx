import Link from "next/link";
import { ResetPasswordForm } from "@/components/storefront/auth-forms";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const resetToken = typeof token === "string" ? token : "";

  return (
    <AuthShell>
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-tight">
          {resetToken ? "Choose a new password" : "Reset password"}
        </h1>
        {!resetToken ? (
          <p className="text-sm text-muted-foreground">
            This link is missing a token. Request a new one from{" "}
            <Link href="/forgot-password" className="underline-offset-4 hover:underline">
              forgot password
            </Link>
            .
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Pick a strong password for your account.</p>
        )}
      </div>
      {resetToken ? <ResetPasswordForm token={resetToken} /> : null}
    </AuthShell>
  );
}
