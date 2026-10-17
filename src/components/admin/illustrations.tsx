import { cn } from "@/lib/utils";

type Props = { className?: string };

export function CategoriesIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <rect x="12" y="18" width="44" height="28" rx="4" fill="currentColor" opacity="0.25" />
      <rect x="64" y="18" width="44" height="28" rx="4" fill="currentColor" opacity="0.4" />
      <rect x="12" y="54" width="44" height="28" rx="4" fill="currentColor" opacity="0.4" />
      <rect x="64" y="54" width="44" height="28" rx="4" fill="currentColor" opacity="0.2" />
      <circle cx="34" cy="32" r="5" fill="currentColor" opacity="0.7" />
      <circle cx="86" cy="68" r="5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function CollectionsIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <rect x="28" y="22" width="64" height="56" rx="6" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.35" />
      <rect x="20" y="16" width="64" height="56" rx="6" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.55" />
      <rect x="12" y="10" width="64" height="56" rx="6" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="3" />
      <path d="M28 28h32M28 40h24M28 52h28" stroke="currentColor" strokeWidth="2.5" opacity="0.65" strokeLinecap="round" />
    </svg>
  );
}

export function CouponIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <path
        d="M18 36h84v28c0 0-8 0-8 10s8 10 8 10H18c0 0 8 0 8-10s-8-10-8-10V36z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.65"
      />
      <circle cx="42" cy="50" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
      <path d="M58 42v16M66 42v16M74 42v16" stroke="currentColor" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
    </svg>
  );
}

export function DeliveryIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <rect x="14" y="34" width="58" height="36" rx="4" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="2.5" />
      <path d="M72 42h22l12 16v12H72V42z" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
      <circle cx="34" cy="74" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.75" />
      <circle cx="90" cy="74" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.75" />
      <path d="M20 28h20" stroke="currentColor" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

export function InventoryIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <path d="M20 40l40-18 40 18v36l-40 18-40-18V40z" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.55" />
      <path d="M20 40l40 18 40-18M60 58v36" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
      <rect x="48" y="30" width="24" height="10" rx="2" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function StaffIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <circle cx="60" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.7" />
      <path d="M28 78c4-18 18-28 32-28s28 10 32 28" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.55" />
      <circle cx="88" cy="36" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
      <path d="M98 70c2-10 8-16 14-16" stroke="currentColor" strokeWidth="2.5" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

export function ProductIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <rect x="28" y="18" width="64" height="72" rx="6" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.55" />
      <path d="M40 18v-4c0-6 8-10 20-10s20 4 20 10v4" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.45" />
      <circle cx="60" cy="48" r="14" fill="currentColor" opacity="0.2" />
      <path d="M42 78h36" stroke="currentColor" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" className={cn("mx-auto h-24 w-auto", className)} aria-hidden>
      <circle cx="60" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.65" />
      <circle cx="60" cy="50" r="6" fill="currentColor" opacity="0.45" />
      <path
        d="M60 22v8M60 70v8M22 50h8M90 50h8M34 28l6 6M80 66l6 6M34 72l6-6M80 34l6-6"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
