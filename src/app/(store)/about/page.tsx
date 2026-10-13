import { Heart } from "lucide-react";
import { getStoreSettings } from "@/lib/store/settings";
import { PageHeading } from "@/components/storefront/page-heading";
import { SparkleMark } from "@/components/storefront/illustrations";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const body =
    settings.aboutCopy?.trim() ||
    `${settings.storeName} is a curated destination for women's thrift and fashion — pieces chosen for character, quality, and everyday wear. We believe style should feel personal, not performative.`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
        <Heart className="h-3.5 w-3.5 text-accent" />
        Our story
      </div>
      <PageHeading title="About" description={settings.tagline} />
      <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <SparkleMark />
        Curated with care in Nigeria
      </div>
      <div className="prose-store whitespace-pre-wrap text-sm leading-relaxed">{body}</div>
    </div>
  );
}
