import { Mail, MessageCircle, PackageSearch, Phone, Sparkles, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getStoreSettings } from "@/lib/store/settings";
import { BRAND, whatsappLink } from "@/lib/brand";

export const metadata = { title: "Stylist Concierge & Contact · Wunmzy Co" };

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const phone = settings.whatsappNumber || BRAND.whatsappNumber;
  const wa = whatsappLink(phone, "Hi Wunmzy Co — I’d like personal styling help or to inquire about an order.");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d] shadow-xs">
          <Sparkles className="h-3 w-3 text-[#d4af37]" /> Stylist Concierge
        </div>
        <h1 className="font-display text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
          At Your Service
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground leading-relaxed sm:text-base">
          Direct communication for personal styling consultations, sizing inquiries, bespoke orders, and shipment tracking.
        </p>
      </div>

      {/* Grid of Contact Options */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* WhatsApp Card (Primary) */}
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/50 p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                <MessageCircle className="h-6 w-6" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Online
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-medium text-foreground">
              WhatsApp Concierge
            </h3>
            <p className="mt-1 font-semibold text-emerald-900">{BRAND.whatsappDisplay}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Instant styling feedback, video previews of garments, and direct order placement with our store team.
            </p>
          </div>

          <div className="pt-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800 transition group-hover:translate-x-1">
              Start WhatsApp Chat →
            </span>
          </div>
        </a>

        {/* Email Card */}
        <a
          href={`mailto:${settings.contactEmail}`}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37] hover:shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-[#b38e5d]">
                <Mail className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Inquiries
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-medium text-foreground">
              Email Customer Care
            </h3>
            <p className="mt-1 font-semibold text-foreground">{settings.contactEmail}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Formal inquiries, partnerships, press releases, and corporate order queries.
            </p>
          </div>

          <div className="pt-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition group-hover:translate-x-1">
              Send an Email →
            </span>
          </div>
        </a>

        {/* Order Tracking Card */}
        <Link
          href="/track-order"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-xl sm:col-span-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-[#121110]">
                <PackageSearch className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  Track Your Delivery
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-lg leading-relaxed">
                  Have your tracking token from your order confirmation SMS or email? Check live dispatch and courier status in real-time.
                </p>
              </div>
            </div>

            <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#121110] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#fbf9f5] transition hover:bg-[#2e2d2a]">
              Track Order Token →
            </span>
          </div>
        </Link>
      </div>

      {/* Social Handle Bar */}
      <div className="mt-12 rounded-2xl border border-border/60 bg-secondary/30 p-6 text-center text-xs text-muted-foreground">
        <p className="font-medium text-foreground">
          Follow the House of Wunmzy on Social Media
        </p>
        <p className="mt-1">
          Discover daily styling drops, client fits, and behind-the-scenes at <strong className="text-foreground">{BRAND.webHandle}</strong> on Instagram, TikTok, and Facebook.
        </p>
      </div>
    </div>
  );
}
