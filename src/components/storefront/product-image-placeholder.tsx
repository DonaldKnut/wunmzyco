import { cn } from "@/lib/utils";

type ProductImagePlaceholderProps = {
  className?: string;
  label?: string;
};

export function ProductImagePlaceholder({
  className,
  label = "Image coming soon",
}: ProductImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex aspect-[3/4] w-full flex-col items-center justify-center bg-muted text-center text-xs uppercase tracking-widest text-muted-foreground",
        className,
      )}
      aria-label={label}
    >
      <span className="max-w-[12rem] px-4 leading-relaxed">{label}</span>
    </div>
  );
}
