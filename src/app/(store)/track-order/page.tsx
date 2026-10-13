import { PageHeading } from "@/components/storefront/page-heading";
import { TrackOrderForm } from "@/components/storefront/track-order-form";

export const metadata = { title: "Track order" };

export default async function TrackOrderPage({ searchParams }: PageProps<"/track-order">) {
  const { token } = await searchParams;
  const presetToken = typeof token === "string" ? token : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeading
        title="Track order"
        description="Use your order number and the tracking token from your confirmation email."
      />
      <TrackOrderForm presetToken={presetToken} />
    </div>
  );
}
