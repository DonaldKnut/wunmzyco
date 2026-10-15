import { BrandLogo } from "@/components/storefront/brand-logo";
import { AuthPromoSlider } from "@/components/storefront/auth-promo-slider";

export function AuthShell({
  children,
  showMobilePromo = false,
}: {
  children: React.ReactNode;
  showMobilePromo?: boolean;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden lg:block">
        <AuthPromoSlider />
      </aside>
      <section className="flex flex-col px-6 pb-16 pt-8 sm:px-10 sm:pb-20 sm:pt-10 lg:px-16 lg:pt-12">
        <div className="mb-8 shrink-0 sm:mb-10">
          <BrandLogo className="h-11 w-auto sm:h-12" priority />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8">
          {showMobilePromo ? (
            <div className="lg:hidden">
              <div className="overflow-hidden rounded-xl border border-border">
                <AuthPromoSlider />
              </div>
            </div>
          ) : null}
          {children}
        </div>
      </section>
    </div>
  );
}
