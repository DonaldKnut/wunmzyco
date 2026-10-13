import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
  title?: string;
};

/** Soft editorial SVG illustrations for empty / brand moments */
export function FashionRackIllustration({ className, title = "Empty rail" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      className={cn("mx-auto h-28 w-auto text-accent/80", className)}
      role="img"
      aria-label={title}
    >
      <rect x="20" y="28" width="200" height="8" rx="2" fill="currentColor" opacity="0.35" />
      <line x1="40" y1="36" x2="40" y2="130" stroke="currentColor" strokeWidth="3" opacity="0.45" />
      <line x1="200" y1="36" x2="200" y2="130" stroke="currentColor" strokeWidth="3" opacity="0.45" />
      <path d="M70 44v48c0 8 12 14 24 14s24-6 24-14V44" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
      <path d="M130 44v52c0 10 14 16 28 16s28-6 28-16V44" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.55" />
      <circle cx="94" cy="44" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="158" cy="44" r="4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function ShoppingBagIllustration({ className, title = "Bag" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 140" className={cn("mx-auto h-24 w-auto text-accent/80", className)} role="img" aria-label={title}>
      <path
        d="M40 50h80l-6 62H46L40 50z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.65"
      />
      <path d="M58 50c0-14 10-26 22-26s22 12 22 26" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.55" />
      <circle cx="80" cy="88" r="6" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function SearchIllustration({ className, title = "Search" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 140 120" className={cn("mx-auto h-20 w-auto text-accent/80", className)} role="img" aria-label={title}>
      <circle cx="58" cy="52" r="28" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.6" />
      <line x1="78" y1="72" x2="108" y2="102" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function EnvelopeIllustration({ className, title = "Mail" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 160 120" className={cn("mx-auto h-20 w-auto text-accent/80", className)} role="img" aria-label={title}>
      <rect x="24" y="28" width="112" height="72" rx="4" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.55" />
      <path d="M24 36l56 40 56-40" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.65" />
    </svg>
  );
}

export function SparkleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 text-accent", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2l1.2 6.3L19 12l-5.8 3.7L12 22l-1.2-6.3L5 12l5.8-3.7L12 2z"
        opacity="0.85"
      />
    </svg>
  );
}
