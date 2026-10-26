import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  illustration?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-12 text-center backdrop-blur-sm shadow-xs">
      {/* Decorative ambient light */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-32 w-64 rounded-full bg-[#d4af37]/10 blur-2xl" />

      {illustration ? (
        <div className="relative z-10 transition-transform duration-500 hover:scale-105">
          {illustration}
        </div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-[#b38e5d]">
          <Sparkles className="h-6 w-6" />
        </div>
      )}

      <div className="relative z-10 space-y-2">
        <h2 className="font-display text-3xl font-medium tracking-tight text-foreground">{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {actionHref && actionLabel ? (
        <div className="relative z-10 pt-2">
          <Button asChild className="rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.16em]">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
