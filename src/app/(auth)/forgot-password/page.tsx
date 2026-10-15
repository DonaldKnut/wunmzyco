import { ForgotPasswordForm } from "@/components/storefront/auth-forms";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-tight">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll send reset instructions if an account exists for that email.
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
