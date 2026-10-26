import { Sparkles, MessageCircle, ShieldCheck, Clock, Award } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";

export function HomeManifesto() {
  const wa = whatsappLink(
    BRAND.whatsappNumber,
    "Hello Wunmzy Co! I would love personalized outfit styling recommendations.",
  );

  return (
    <section className="relative overflow-hidden border-y border-[#e8e2d7] bg-[#121110] py-24 text-[#fbf9f5]">
      {/* Background radial lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-[#d4af37]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#d4af37] backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" /> The Wunmzy Co Philosophy
        </div>

        {/* Editorial Headline */}
        <h2 className="mt-6 font-display text-4xl leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
          &ldquo;Be Bold. Be Confident. <br className="hidden sm:inline" />
          <span className="italic font-normal text-[#d4af37]">Be You.&rdquo;</span>
        </h2>

        {/* Manifesto Paragraph */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
          We believe true style isn&apos;t about chasing fast fashion trends — it&apos;s about discovering timeless pieces with soul, character, and unmistakable presence. Every piece in our collection is handpicked to celebrate your individuality.
        </p>

        {/* 3 Value Pillars */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/50 hover:bg-white/10">
            <Award className="h-6 w-6 text-[#d4af37] mb-3" />
            <h4 className="font-display text-xl text-white">One-of-a-Kind Archive</h4>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Unique thrift and contemporary pieces. When it&apos;s gone, it&apos;s gone forever.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/50 hover:bg-white/10">
            <Clock className="h-6 w-6 text-[#d4af37] mb-3" />
            <h4 className="font-display text-xl text-white">Express Lagos Delivery</h4>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Same-day doorstep delivery across Lagos and rapid dispatch to all Nigerian states.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/50 hover:bg-white/10">
            <ShieldCheck className="h-6 w-6 text-[#d4af37] mb-3" />
            <h4 className="font-display text-xl text-white">Pristine Quality Standard</h4>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Every garment is individually inspected, professionally cleaned, and steamed ready to wear.
            </p>
          </div>
        </div>

        {/* Direct Concierge Link */}
        <div className="mt-12 inline-flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#d4af37] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#121110] transition-all duration-300 hover:bg-[#e8c65b] hover:shadow-lg hover:shadow-[#d4af37]/20"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat with Personal Stylist</span>
          </a>
          <span className="text-xs text-white/50">Response time: ~5 mins on WhatsApp</span>
        </div>
      </div>
    </section>
  );
}
