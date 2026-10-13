import { getStoreSettings } from "@/lib/store/settings";
import { PolicyContent } from "@/components/storefront/policy-content";

export const metadata = { title: "Privacy policy" };

const fallback = `We collect information you provide when you shop or create an account — such as name, email, phone, and delivery address — to fulfil orders and support you.

Payment processing is handled by our payment partner; we do not store full card details on our servers.

We use your email for order updates and, if you opt in, occasional news about new drops. You can unsubscribe from marketing at any time.

Contact us if you have questions about your data or would like it updated or deleted where applicable.`;

export default async function PrivacyPolicyPage() {
  const settings = await getStoreSettings();
  return (
    <PolicyContent title="Privacy policy" body={settings.privacyPolicy} fallback={fallback} />
  );
}
