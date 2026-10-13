import { getStoreSettings } from "@/lib/store/settings";
import { PolicyContent } from "@/components/storefront/policy-content";

export const metadata = { title: "Shipping policy" };

const fallback = `We ship within Nigeria. Delivery fees depend on your zone and the weight of your order, and are shown at checkout before you pay.

Processing typically begins after payment is confirmed. You'll receive tracking details by email when your order ships.

If delivery zones aren't configured yet in the shop, checkout may be temporarily unavailable — contact us and we'll help you complete your order.`;

export default async function ShippingPolicyPage() {
  const settings = await getStoreSettings();
  return (
    <PolicyContent title="Shipping policy" body={settings.shippingPolicy} fallback={fallback} />
  );
}
