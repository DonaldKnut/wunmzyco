import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/storefront/auth-forms";
import { AuthPromoSlider } from "@/components/storefront/auth-promo-slider";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/account");

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
            <h1 className="font-display text-4xl tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">
              Optional — you can also checkout as a guest anytime.
            </p>
          </div>
          <RegisterForm />
        </div>
      </section>
    </div>
  );
}
