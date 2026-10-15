import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveInputIcon } from "@/lib/ui/resolve-input-icon";

export type TextareaProps = React.ComponentProps<"textarea"> & {
  icon?: LucideIcon | false | null;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, icon, name, ...props }, ref) => {
    const Icon = resolveInputIcon({ icon, name, type: "text" });

    return (
      <div className="relative w-full">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
        ) : null}
        <textarea
          name={name}
          className={cn(
            "flex min-h-[80px] w-full border border-input bg-background py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            Icon ? "pl-9 pr-3" : "px-3",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
