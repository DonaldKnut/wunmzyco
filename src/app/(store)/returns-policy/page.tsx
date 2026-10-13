import { getStoreSettings } from "@/lib/store/settings";
import { PolicyContent } from "@/components/storefront/policy-content";

export const metadata = { title: "Returns policy" };

const fallback = `Because many of our pieces are one-of-one thrift finds, returns are handled case by case. If something arrives not as described, contact us within 48 hours of delivery with photos and your order number.

Approved returns must be unworn, with original tags where applicable, and sent back within the timeframe we provide. Refunds are processed to your original payment method once we receive and inspect the item.`;

export default async function ReturnsPolicyPage() {
  const settings = await getStoreSettings();
  return (
    <PolicyContent title="Returns policy" body={settings.returnsPolicy} fallback={fallback} />
  );
}
