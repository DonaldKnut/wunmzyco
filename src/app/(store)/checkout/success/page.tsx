import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/storefront/page-heading";

export const metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const { order } = await searchParams;
  const orderNumber = typeof order === "string" ? order : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
      <PageHeading
        title="Thank you"
        description="Your order is in — we'll email you confirmation and tracking details when payment completes."
        className="text-center [&_h1]:text-center [&_p]:mx-auto"
      />
      {orderNumber ? (
        <p className="mb-8 font-display text-2xl">{orderNumber}</p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/track-order">Track order</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
