import { getStoreSettings } from "@/lib/store/settings";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { BRAND, whatsappLink } from "@/lib/brand";

export async function AnnouncementBar() {
  const settings = await getStoreSettings();
  if (!settings.announcementActive || !settings.announcementBar?.trim()) {
    return null;
  }

  const wa = whatsappLink(settings.whatsappNumber || BRAND.whatsappNumber, "Hi Wunmzy Co — I’d like personal styling help.");

  return (
    <div className="relative z-30 border-b border-[#e8e2d7] bg-[#121110] text-[#fbf9f5] overflow-hidden">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs tracking-wider sm:px-6">
        <div className="hidden items-center gap-2 text-white/60 md:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse" />
          <span className="font-medium uppercase tracking-[0.18em] text-[#d4af37]">VIP Concierge</span>
          <span className="text-white/40">·</span>
          <span>Curated Nigerian Thrift & Couture</span>
        </div>

        <div className="mx-auto flex items-center justify-center gap-2 text-center text-[11px] font-medium tracking-wide sm:text-xs">
          <Sparkles className="h-3 w-3 text-[#d4af37]" />
          <span>{settings.announcementBar}</span>
          <span className="hidden sm:inline text-white/40">·</span>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center text-[#d4af37] underline-offset-4 hover:underline"
          >
            Explore drops
          </Link>
        </div>

        <div className="hidden items-center gap-4 text-xs lg:flex">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="text-white/75 transition hover:text-[#d4af37]"
          >
            WhatsApp Support: {BRAND.whatsappDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
