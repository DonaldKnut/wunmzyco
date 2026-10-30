import Link from "next/link";
import { ArrowUpRight, Sparkles, Briefcase, Flame, UtensilsCrossed, PartyPopper } from "lucide-react";

const OCCASIONS = [
  {
    name: "Corporate",
    slug: "corporate",
    subtitle: "Tailored Power & Poise",
    description: "Structured blazers, sharp silhouettes, and refined skirts designed to command every room.",
    icon: Briefcase,
  },
  {
    name: "Street",
    slug: "street",
    subtitle: "Urban Luxury & Edge",
    description: "Effortless denim, statement tops, and one-of-a-kind vintage thrift with unmistakable attitude.",
    icon: Flame,
  },
  {
    name: "Dinner",
    slug: "dinner",
    subtitle: "Midnight Grace & Glamour",
    description: "Sleek slip dresses, draped satin, and subtle sensual cuts crafted for intimate candlelit evenings.",
    icon: UtensilsCrossed,
  },
  {
    name: "Party",
    slug: "party",
    subtitle: "High-Voltage Energy",
    description: "Turn heads with vibrant metallics, daring mini cuts, and unforgettable dancefloor silhouettes.",
    icon: PartyPopper,
  },
];

export function HomeOccasions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mb-9 flex flex-col justify-between gap-5 md:mb-11 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9b805b]">
            <Sparkles className="h-3 w-3" /> Find your moment
          </div>
          <h2 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Dress for the Moment
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            From daytime executive boardrooms to midnight dancefloors — explore our curated collections tailored for every chapter of your life.
          </p>
        </div>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2 self-start text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground underline decoration-[#c4b8a5] underline-offset-4 transition-colors hover:text-[#8b704b] md:self-auto"
        >
          Explore the edit
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {OCCASIONS.map((occ, idx) => {
          const Icon = occ.icon;
          return (
            <Link
              key={occ.slug}
              href={`/shop?q=${occ.slug}`}
              className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden border border-[#e8e2d7] bg-white/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#bda98a] hover:bg-white hover:shadow-[0_18px_40px_-28px_rgba(25,23,20,0.35)] sm:p-7"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e2d7] bg-[#f7f4ee] text-[#9b805b] transition-colors duration-300 group-hover:border-[#bda98a] group-hover:bg-[#eee7db]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display text-xl italic text-[#b9ad9b]">
                  0{idx + 1}
                </span>
              </div>

              <div className="pt-8">
                <h3 className="font-display text-3xl font-medium tracking-tight text-[#191714]">
                  {occ.name}
                </h3>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#806d53]">
                  {occ.subtitle}
                </p>
                <p className="mt-3 text-xs leading-5 text-[#746b5f] line-clamp-2">
                  {occ.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#514a40]">
                  Explore {occ.name}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
