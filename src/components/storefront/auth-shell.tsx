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
    <div className="relative min-h-dvh lg:h-dvh lg:overflow-hidden">
      {/* Fixed promo panel — desktop only */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-1/2 lg:flex-col lg:overflow-hidden">
        <div className="h-full min-h-0 w-full">
          <AuthPromoSlider />
        </div>
      </aside>

      {/*
        Form column scrolls independently.
        Avoid flex-1 + justify-center on mobile — that clips tall content and
        makes inputs unreachable. Use margin-auto centering only when it fits.
      */}
      <section className="flex min-h-dvh flex-col overflow-y-auto overscroll-contain px-6 pb-24 pt-8 sm:px-10 sm:pb-20 sm:pt-10 lg:ml-[50%] lg:h-dvh lg:min-h-0 lg:px-16 lg:pt-12 lg:pb-12">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8 py-2 lg:my-auto lg:min-h-0 lg:py-4">
          <div className="shrink-0">
            <BrandLogo className="h-11 w-auto sm:h-12" priority />
          </div>

          {/* Form first on mobile so inputs are always in reach */}
          <div className="shrink-0 space-y-8">{children}</div>

          {showMobilePromo ? (
            <div className="shrink-0 lg:hidden">
              <div className="overflow-hidden rounded-xl border border-border">
                <AuthPromoSlider compact />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
