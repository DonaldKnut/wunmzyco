import { getStoreSettings } from "@/lib/store/settings";
import { PolicyContent } from "@/components/storefront/policy-content";

export const metadata = { title: "Terms of service" };

const fallback = `By using this website and placing orders, you agree to these terms and our policies on shipping, returns, and privacy.

All prices are in Nigerian Naira unless stated otherwise. Product availability is not guaranteed until checkout is complete and payment succeeds.

We reserve the right to refuse or cancel orders in cases of suspected fraud, pricing errors, or unavailability.`;

export default async function TermsPage() {
  const settings = await getStoreSettings();
  return (
    <PolicyContent title="Terms of service" body={settings.termsOfService} fallback={fallback} />
  );
}
