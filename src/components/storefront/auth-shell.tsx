import { BrandLogo } from "@/components/storefront/brand-logo";
import { AuthPromoSlider } from "@/components/storefront/auth-promo-slider";

/**
 * Desktop: promo stays fixed (no scroll); only the auth form column scrolls.
 * Mobile: form first; optional compact promo below.
 */
export function AuthShell({
  children,
  showMobilePromo = false,
}: {
  children: React.ReactNode;
  showMobilePromo?: boolean;
}) {
  return (
    <div className="relative h-dvh overflow-hidden">
      {/* Fixed promo — never scrolls */}
      <aside className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 overflow-hidden lg:pointer-events-auto lg:block">
        <div className="h-full w-full">
          <AuthPromoSlider />
        </div>
      </aside>

      {/* Scrollable form panel only */}
      <section className="flex h-dvh flex-col overflow-y-auto overscroll-contain px-6 pb-24 pt-8 sm:px-10 sm:pb-20 sm:pt-10 lg:ml-[50%] lg:w-1/2 lg:px-16 lg:pb-12 lg:pt-12">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8 py-2 lg:my-auto lg:py-6">
          <div className="shrink-0">
            <BrandLogo className="h-11 w-auto sm:h-12" priority />
          </div>

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
