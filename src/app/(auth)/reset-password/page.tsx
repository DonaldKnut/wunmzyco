import Link from "next/link";
import { ResetPasswordForm } from "@/components/storefront/auth-forms";
import { AuthPromoSlider } from "@/components/storefront/auth-promo-slider";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const resetToken = typeof token === "string" ? token : "";

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
        </div>
      </section>
    </div>
  );
}
