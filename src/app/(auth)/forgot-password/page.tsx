import { ForgotPasswordForm } from "@/components/storefront/auth-forms";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Wunmzy Co · Admin
        </p>
        <h1 className="font-display text-4xl tracking-tight">Reset password</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Enter your staff email. If an account exists, we&apos;ll send reset instructions.
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
