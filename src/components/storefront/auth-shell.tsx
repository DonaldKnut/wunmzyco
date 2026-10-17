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
    <div className="relative min-h-screen lg:h-screen lg:overflow-hidden">
      {/* Fixed promo panel — does not scroll with the form */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-1/2 lg:flex-col lg:overflow-hidden">
        <div className="h-full min-h-0 w-full">
          <AuthPromoSlider />
        </div>
      </aside>

      {/* Form column — independent inner scroll */}
      <section className="flex min-h-screen flex-col overflow-y-auto overscroll-contain px-6 pb-16 pt-8 sm:px-10 sm:pb-20 sm:pt-10 lg:ml-[50%] lg:h-screen lg:min-h-0 lg:px-16 lg:pt-12 lg:pb-12">
        <div className="mb-8 shrink-0 sm:mb-10">
          <BrandLogo className="h-11 w-auto sm:h-12" priority />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 py-2">
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
