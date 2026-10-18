import Link from "next/link";
import { getCartLines } from "@/lib/cart";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getActiveDeliveryZones } from "@/lib/store/delivery";
import { PageHeading } from "@/components/storefront/page-heading";
import { EmptyState } from "@/components/storefront/empty-state";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [lines, user, zones, settings] = await Promise.all([
    getCartLines(),
    getSessionUser(),
    getActiveDeliveryZones(),
    prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: { whatsappNumber: true },
    }),
  ]);

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeading title="Checkout" />
        <EmptyState
          title="Nothing to checkout"
          description="Add items to your bag first."
          actionHref="/shop"
          actionLabel="Go to shop"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeading title="Checkout" description="Secure checkout — delivery fees apply at payment." />
      <p className="-mt-6 mb-10 text-sm">
        <Link href="/cart" className="underline-offset-4 hover:underline">
          Back to bag
        </Link>
      </p>
      <CheckoutForm
        zones={zones}
        defaultEmail={user?.email}
        defaultName={user?.name}
        whatsappEnabled={Boolean(settings?.whatsappNumber?.trim())}
      />
    </div>
  );
}
