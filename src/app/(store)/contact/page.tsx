import { Mail, MessageCircle, PackageSearch } from "lucide-react";
import Link from "next/link";
import { getStoreSettings } from "@/lib/store/settings";
import { PageHeading } from "@/components/storefront/page-heading";
import { EnvelopeIllustration } from "@/components/storefront/illustrations";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <EnvelopeIllustration className="mb-6" />
      <PageHeading
        title="Contact"
        description="Questions about an order, sizing, or a piece you saw? We're happy to help."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${settings.contactEmail}`}
          className="group flex gap-3 border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <Mail className="mt-0.5 h-5 w-5 text-accent transition group-hover:scale-110" />
          <div>
            <p className="font-medium">Email</p>
            <p className="mt-1 text-sm text-muted-foreground">{settings.contactEmail}</p>
          </div>
        </a>
        <Link
          href="/track-order"
          className="group flex gap-3 border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <PackageSearch className="mt-0.5 h-5 w-5 text-accent transition group-hover:scale-110" />
          <div>
            <p className="font-medium">Track an order</p>
            <p className="mt-1 text-sm text-muted-foreground">Use your tracking token from confirmation.</p>
          </div>
        </Link>
      </div>
      <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
        We aim to reply within one to two business days.
      </p>
    </div>
  );
}
