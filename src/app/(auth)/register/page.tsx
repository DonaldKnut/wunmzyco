import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/storefront/auth-forms";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/account");

  return (
    <AuthShell>
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Optional — you can also checkout as a guest anytime.
        </p>
      </div>
      <RegisterForm />
    </AuthShell>
  );
}
