import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center gap-4 border border-dashed border-border bg-card/50 px-8 py-14 text-center">
      {illustration}
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild variant="outline">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
