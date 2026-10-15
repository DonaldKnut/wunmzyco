import { Heart } from "lucide-react";
import Image from "next/image";
import { getStoreSettings } from "@/lib/store/settings";
import { PageHeading } from "@/components/storefront/page-heading";
import { SparkleMark } from "@/components/storefront/illustrations";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const body = settings.aboutCopy?.trim() || BRAND.aboutCopy;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex justify-center">
        <Image
          src={BRAND.brandCardUrl}
          alt={settings.storeName}
          width={420}
          height={520}
          className="h-auto w-full max-w-sm object-contain"
          priority
        />
      </div>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
        <Heart className="h-3.5 w-3.5 text-accent" />
        {BRAND.category}
      </div>
      <PageHeading title="About" description={settings.tagline} />
      <div className="mb-4 flex items-center gap-2 text-sm font-medium tracking-wide">
        <SparkleMark />
        {BRAND.slogan}
      </div>
      <p className="mb-8 text-sm text-muted-foreground">{BRAND.occasions.join(" · ")}</p>
      <div className="prose-store whitespace-pre-wrap text-sm leading-relaxed">{body}</div>
    </div>
  );
}
