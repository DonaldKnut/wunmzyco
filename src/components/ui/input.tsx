"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveInputIcon } from "@/lib/ui/resolve-input-icon";

export type InputProps = React.ComponentProps<"input"> & {
  /** Pass a Lucide icon, or `false` to hide the auto icon. */
  icon?: LucideIcon | false | null;
  /** Show eye toggle for password fields. Defaults to true when type="password". */
  togglePassword?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, name, autoComplete, togglePassword, ...props }, ref) => {
    const isPassword = type === "password";
    const showToggle = isPassword && togglePassword !== false;
    const [visible, setVisible] = React.useState(false);
    const Icon = resolveInputIcon({ icon, type, name, autoComplete });
    const inputType = showToggle ? (visible ? "text" : "password") : type;

    return (
      <div className="relative w-full">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        ) : null}
        <input
          type={inputType}
          name={name}
          autoComplete={autoComplete}
          className={cn(
            "flex h-10 w-full border border-input bg-background py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            Icon ? "pl-9" : "pl-3",
            showToggle ? "pr-10" : "pr-3",
            className,
          )}
          ref={ref}
          {...props}
        />
        {showToggle ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
