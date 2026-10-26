import Link from "next/link";
import { ArrowUpRight, Sparkles, Briefcase, Flame, UtensilsCrossed, PartyPopper } from "lucide-react";

const OCCASIONS = [
  {
    name: "Corporate",
    slug: "corporate",
    subtitle: "Tailored Power & Poise",
    description: "Structured blazers, sharp silhouettes, and refined skirts designed to command every room.",
    icon: Briefcase,
    palette: "from-[#2A2826] to-[#121110]",
    badge: "Office & Executive",
    tagline: "Unapologetic Professional Elegance",
  },
  {
    name: "Street",
    slug: "street",
    subtitle: "Urban Luxury & Edge",
    description: "Effortless denim, statement tops, and one-of-a-kind vintage thrift with unmistakable attitude.",
    icon: Flame,
    palette: "from-[#4A3E31] to-[#1A1612]",
    badge: "Everyday Statement",
    tagline: "Bold Cuts & Authentic Street Style",
  },
  {
    name: "Dinner",
    slug: "dinner",
    subtitle: "Midnight Grace & Glamour",
    description: "Sleek slip dresses, draped satin, and subtle sensual cuts crafted for intimate candlelit evenings.",
    icon: UtensilsCrossed,
    palette: "from-[#352636] to-[#130E14]",
    badge: "Evening Couture",
    tagline: "Romantic Silhouettes & Quiet Luxury",
  },
  {
    name: "Party",
    slug: "party",
    subtitle: "High-Voltage Energy",
    description: "Turn heads with vibrant metallics, daring mini cuts, and unforgettable dancefloor silhouettes.",
    icon: PartyPopper,
    palette: "from-[#4B2F23] to-[#170E0A]",
    badge: "Celebration & Nightlife",
    tagline: "Electric Confidence & Shimmer",
  },
];

export function HomeOccasions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-card/60 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b38e5d]">
            <Sparkles className="h-3 w-3 text-[#d4af37]" /> Curated Style Edits
          </div>
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl text-foreground">
            Dress for the Moment
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            From daytime executive boardrooms to midnight dancefloors — explore our curated collections tailored for every chapter of your life.
          </p>
        </div>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground underline-offset-8 hover:underline"
        >
          View All Pieces
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 text-[#d4af37]" />
        </Link>
      </div>

      {/* 4 Occasion Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {OCCASIONS.map((occ, idx) => {
          const Icon = occ.icon;
          return (
            <Link
              key={occ.slug}
              href={`/shop?q=${occ.slug}`}
              className="group relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d4af37]/70 hover:shadow-xl"
            >
              {/* Background gradient & ambient glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${occ.palette} opacity-95 transition-transform duration-700 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Card Top */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#d4af37] backdrop-blur-md transition-all duration-300 group-hover:bg-[#d4af37] group-hover:text-[#121110]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                  0{idx + 1}
                </span>
              </div>

              {/* Card Bottom */}
              <div className="relative z-10 space-y-3 pt-12">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                  {occ.badge}
                </span>
                <h3 className="font-display text-3xl font-medium tracking-tight text-[#fbf9f5] transition-colors group-hover:text-white">
                  {occ.name}
                </h3>
                <p className="text-xs font-medium text-white/90">
                  {occ.subtitle}
                </p>
                <p className="text-xs leading-relaxed text-white/65 line-clamp-2">
                  {occ.description}
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 group-hover:text-[#d4af37] transition-colors">
                    Explore {occ.name}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
