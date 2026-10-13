import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/storefront/page-heading";

export const metadata = { title: "Payment failed" };

export default function CheckoutFailedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
      <PageHeading
        title="Payment didn't go through"
        description="Your card wasn't charged, or the payment was cancelled. You can try again from your bag or contact us if you need help."
        className="text-center [&_h1]:text-center [&_p]:mx-auto"
      />
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/checkout">Try checkout again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
