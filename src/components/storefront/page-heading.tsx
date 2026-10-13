import { cn } from "@/lib/utils";

type PageHeadingProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeading({ title, description, className }: PageHeadingProps) {
  return (
    <header className={cn("mb-10 space-y-3", className)}>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
      {description ? <p className="max-w-2xl text-muted-foreground">{description}</p> : null}
    </header>
  );
}
