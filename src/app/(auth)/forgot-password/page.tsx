import Link from "next/link";
import { ForgotPasswordForm } from "@/components/storefront/auth-forms";
import { AuthPromoSlider } from "@/components/storefront/auth-promo-slider";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
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
            <h1 className="font-display text-4xl tracking-tight">Forgot password</h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ll send reset instructions if an account exists for that email.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      </section>
    </div>
  );
}
