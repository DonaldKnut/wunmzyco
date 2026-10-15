import Link from "next/link";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { BRAND, whatsappLink } from "@/lib/brand";

export function HomeAdverts() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/shop"
          className="group relative overflow-hidden border border-border bg-[#111] px-6 py-10 text-[#f7f3ec] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Sparkles className="mb-4 h-5 w-5 text-white/70 transition group-hover:scale-110" />
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">{BRAND.category}</p>
          <h3 className="mt-2 font-display text-2xl">{BRAND.slogan}</h3>
          <p className="mt-2 text-sm text-white/70">{BRAND.occasions.join(" · ")}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm">
            Shop now <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <a
          href={whatsappLink(BRAND.whatsappNumber, "Hi Wunmzy Co — I’d like to place an order.")}
          target="_blank"
          rel="noreferrer"
          className="border border-border bg-card px-6 py-10 transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <Truck className="mb-4 h-5 w-5 text-accent" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Orders</p>
          <h3 className="mt-2 font-display text-2xl">Inquiries & orders</h3>
          <p className="mt-2 text-sm text-muted-foreground">WhatsApp / call {BRAND.whatsappDisplay}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
            Message us <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </a>

        <div className="border border-border bg-secondary/40 px-6 py-10">
          <ShieldCheck className="mb-4 h-5 w-5 text-accent" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Every occasion</p>
          <h3 className="mt-2 font-display text-2xl">{BRAND.tagline}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure checkout online, or order via WhatsApp — find us at {BRAND.webHandle}.
          </p>
          <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
            Our story <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
