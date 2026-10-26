import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNgn } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/storefront/page-heading";
import {
  cancelPendingCheckoutAndRestoreBag,
  resumePaystackCheckout,
} from "@/lib/actions/checkout-recovery";

export const metadata = { title: "Payment failed" };

export default async function CheckoutFailedPage({
  searchParams,
}: PageProps<"/checkout/failed">) {
  const params = await searchParams;
  const reference = typeof params.reference === "string" ? params.reference : null;
  const status = typeof params.status === "string" ? params.status : null;
  const reason = typeof params.reason === "string" ? params.reason : null;

  const payment = reference
    ? await prisma.payment.findUnique({
        where: { reference },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalKobo: true,
              customerName: true,
            },
          },
        },
      })
    : null;

  const order = payment?.order ?? null;
  const canResume =
    Boolean(payment?.authorizationUrl) &&
    payment?.status === "PENDING" &&
    order?.status === "PENDING_PAYMENT";
  const canRestore =
    Boolean(order) &&
    (order!.status === "CANCELLED" ||
      order!.status === "PENDING_PAYMENT" ||
      payment?.status === "ABANDONED" ||
      payment?.status === "FAILED");

  const title =
    status === "abandoned" || reason === "cancelled"
      ? "Payment cancelled"
      : status === "pending"
        ? "Payment not finished"
        : "Payment didn't go through";

  const description = canResume
    ? "Your order is still reserved for a short time. You can resume Paystack, or cancel and keep shopping with your bag restored."
    : "You weren't charged. Your items are kept in your bag so you can try again — stock is released when a payment is cancelled or expires.";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
      <PageHeading
        title={title}
        description={description}
        className="text-center [&_h1]:text-center [&_p]:mx-auto"
      />

      {order ? (
        <div className="mx-auto mb-8 max-w-sm border border-border bg-card px-4 py-3 text-left text-sm">
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-muted-foreground">{order.customerName}</p>
          <p className="mt-1 tabular-nums">{formatNgn(order.totalKobo)}</p>
          <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
            Order {order.status.replace(/_/g, " ").toLowerCase()}
            {payment ? ` · Payment ${payment.status.toLowerCase()}` : ""}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        {canResume && reference ? (
          <form action={resumePaystackCheckout}>
            <input type="hidden" name="reference" value={reference} />
            <Button type="submit">Resume payment</Button>
          </form>
        ) : null}

        {canRestore && reference ? (
          <form action={cancelPendingCheckoutAndRestoreBag}>
            <input type="hidden" name="reference" value={reference} />
            <Button type="submit" variant={canResume ? "outline" : "default"}>
              {order?.status === "PENDING_PAYMENT"
                ? "Cancel & restore bag"
                : "Restore bag"}
            </Button>
          </form>
        ) : (
          <Button asChild>
            <Link href="/cart">Back to bag</Link>
          </Button>
        )}

        <Button asChild variant="outline">
          <Link href="/checkout">Try checkout again</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
