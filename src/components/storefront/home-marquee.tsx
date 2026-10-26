import { Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  "CORPORATE SILHOUETTES",
  "ONE-OF-A-KIND FINDS",
  "LAGOS SAME-DAY DISPATCH",
  "STREET STATEMENT PIECES",
  "AUTHENTICATED VINTAGE & THRIFT",
  "DINNER ELEGANCE",
  "CONCIERGE WHATSAPP STYLING",
  "PARTY ATTENTION-GRABBERS",
  "NATIONWIDE NIGERIAN DELIVERY",
];

export function HomeMarquee() {
  return (
    <div className="relative border-y border-border/80 bg-card py-4 overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-card to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-card to-transparent z-10" />

      <div className="animate-marquee flex items-center gap-10">
        {[...HIGHLIGHTS, ...HIGHLIGHTS].map((text, idx) => (
          <div key={idx} className="flex items-center gap-6 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.24em] text-foreground/80">
            <span>{text}</span>
            <Sparkles className="h-3 w-3 text-[#d4af37]" />
          </div>
        ))}
      </div>
    </div>
  );
}
