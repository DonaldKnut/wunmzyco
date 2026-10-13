import Link from "next/link";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";

export function HomeAdverts() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/shop"
          className="group relative overflow-hidden border border-border bg-[#2c2a26] px-6 py-10 text-[#f7f3ec] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Sparkles className="mb-4 h-5 w-5 text-white/70 transition group-hover:scale-110" />
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Featured</p>
          <h3 className="mt-2 font-display text-2xl">Fresh drops weekly</h3>
          <p className="mt-2 text-sm text-white/70">New thrift finds, styled for Nigeria.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm">
            Shop now <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <div className="border border-border bg-card px-6 py-10">
          <Truck className="mb-4 h-5 w-5 text-accent" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Delivery</p>
          <h3 className="mt-2 font-display text-2xl">Lagos & nationwide</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Configurable zones with clear fees at checkout.
          </p>
          <Link href="/shipping-policy" className="mt-6 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
            Shipping policy <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="border border-border bg-secondary/40 px-6 py-10">
          <ShieldCheck className="mb-4 h-5 w-5 text-accent" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Checkout</p>
          <h3 className="mt-2 font-display text-2xl">Secure payments</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Paystack-ready when you go live — guest checkout supported.
          </p>
          <Link href="/shop" className="mt-6 inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline">
            Start shopping <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
