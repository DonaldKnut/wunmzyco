"use client";

import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Eye,
  EyeOff,
  Inbox,
  Layers,
  LayoutDashboard,
  Package,
  PackagePlus,
  PanelsTopLeft,
  Settings,
  ShoppingBag,
  Tags,
  Warehouse,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveInputIcon } from "@/lib/ui/resolve-input-icon";

/** String keys only — Lucide components cannot cross the RSC boundary. */
export type AdminPageIcon =
  | "dashboard"
  | "packages"
  | "package-plus"
  | "orders"
  | "tags"
  | "layers"
  | "warehouse"
  | "settings"
  | "homepage"
  | "inbox";

const PAGE_ICONS: Record<AdminPageIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  packages: Package,
  "package-plus": PackagePlus,
  orders: ShoppingBag,
  tags: Tags,
  layers: Layers,
  warehouse: Warehouse,
  settings: Settings,
  homepage: PanelsTopLeft,
  inbox: Inbox,
};

export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e8e2d7] bg-white shadow-[0_2px_14px_-2px_rgba(26,24,20,0.04)] transition-all duration-200 hover:shadow-[0_4px_20px_-2px_rgba(26,24,20,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminCardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#f2ede4] px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-[#1a1a18]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-[#6b6459]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function AdminCardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
}) {
  // Determine accent color by label
  const isRevenue = label.toLowerCase().includes("sales") || label.toLowerCase().includes("gross");
  const isOrders = label.toLowerCase().includes("orders");

  const accentColor = isRevenue
    ? "from-[#d4af37] via-[#b38e5d] to-[#d4af37]"
    : isOrders
      ? "from-emerald-500 to-teal-600"
      : "from-[#1a1a18] to-[#4a4740]";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e8e2d7] bg-white p-5 shadow-[0_2px_14px_-2px_rgba(26,24,20,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(26,24,20,0.08)]">
      {/* Top Accent Strip */}
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accentColor)} />

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a776f]">
            {label}
          </p>
          {trend ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <TrendingUp className="h-2.5 w-2.5" /> {trend}
            </span>
          ) : isRevenue ? (
            <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
          ) : null}
        </div>

        <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#1a1a18]">
          {value}
        </p>

        {hint ? <p className="text-xs text-[#6b6459] leading-relaxed">{hint}</p> : null}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  icon,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: AdminPageIcon;
}) {
  const Icon = icon ? PAGE_ICONS[icon] : null;
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8e2d7]/70 pb-6">
      <div className="flex items-start gap-3.5">
        {Icon ? (
          <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8e2d7] bg-white text-[#1a1a18] shadow-xs">
            <Icon className="h-5 w-5 text-[#b38e5d]" aria-hidden />
          </span>
        ) : null}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a18]">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-xs text-[#6b6459] leading-relaxed">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a18] disabled:pointer-events-none disabled:opacity-50";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
  }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  const variants = {
    primary: "bg-[#1a1a18] text-[#fbf9f5] hover:bg-[#2e2d2a] hover:shadow-xs",
    secondary: "border border-[#d8d3c8] bg-white text-[#1a1a18] hover:bg-[#f5efe6]",
    ghost: "text-[#1a1a18] hover:bg-[#f0ebe3]",
    danger: "bg-[#943a3a] text-white hover:bg-[#7a2f2f]",
  };
  const sizes = { sm: "h-8 px-3 text-[11px]", md: "h-9 px-4 text-xs" };
  return (
    <button
      ref={ref}
      className={cn(buttonBase, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export function ButtonLink({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  const variants = {
    primary: "bg-[#1a1a18] text-[#fbf9f5] hover:bg-[#2e2d2a] hover:shadow-xs",
    secondary: "border border-[#d8d3c8] bg-white text-[#1a1a18] hover:bg-[#f5efe6]",
    ghost: "text-[#1a1a18] hover:bg-[#f0ebe3]",
  };
  const sizes = { sm: "h-8 px-3 text-[11px]", md: "h-9 px-4 text-xs" };
  return (
    <Link
      href={href}
      className={cn(buttonBase, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

export function Input({
  icon,
  className,
  type,
  name,
  autoComplete,
  togglePassword,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon | false | null;
  togglePassword?: boolean;
}) {
  const isPassword = type === "password";
  const showToggle = isPassword && togglePassword !== false;
  const [visible, setVisible] = React.useState(false);
  const Icon = resolveInputIcon({ icon, type, name, autoComplete });
  const inputType = showToggle ? (visible ? "text" : "password") : type;
  return (
    <div className="relative w-full">
      {Icon ? (
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a968d]"
          aria-hidden
        />
      ) : null}
      <input
        type={inputType}
        name={name}
        autoComplete={autoComplete}
        className={cn(
          "h-9 w-full rounded-lg border border-[#d8d3c8] bg-white text-sm text-[#1a1a18] placeholder:text-[#9a968d] focus:border-[#1a1a18] focus:outline-none focus:ring-1 focus:ring-[#1a1a18]",
          Icon ? "pl-8" : "pl-3",
          showToggle ? "pr-9" : "pr-3",
          className,
        )}
        {...props}
      />
      {showToggle ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[#9a968d] hover:bg-[#f0ebe3] hover:text-[#1a1a18]"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      ) : null}
    </div>
  );
}

export function Textarea({
  icon,
  className,
  name,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  icon?: LucideIcon | false | null;
}) {
  const Icon = resolveInputIcon({ icon, name, type: "text" });
  return (
    <div className="relative w-full">
      {Icon ? (
        <Icon
          className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-[#9a968d]"
          aria-hidden
        />
      ) : null}
      <textarea
        name={name}
        className={cn(
          "min-h-[88px] w-full rounded-lg border border-[#d8d3c8] bg-white py-2 text-sm text-[#1a1a18] placeholder:text-[#9a968d] focus:border-[#1a1a18] focus:outline-none focus:ring-1 focus:ring-[#1a1a18]",
          Icon ? "pl-8 pr-3" : "px-3",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-lg border border-[#d8d3c8] bg-white px-3 text-sm text-[#1a1a18] focus:border-[#1a1a18] focus:outline-none focus:ring-1 focus:ring-[#1a1a18]",
        props.className,
      )}
      {...props}
    />
  );
}

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#3d3b36]">
      {children}
    </label>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-[#eee9e0] text-[#3d3b36] border-[#d8d3c8]",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const dots = {
    neutral: "bg-[#7a776f]",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tones[tone],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />
      {children}
    </span>
  );
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e8e2d7] bg-white shadow-xs">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-[#eee9e0] bg-[#faf8f5] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a776f]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-[#f3efe8] px-4 py-3.5 text-[#1a1a18] transition-colors", className)}>
      {children}
    </td>
  );
}

export function EmptyState({
  title,
  description,
  icon = "inbox",
}: {
  title: string;
  description?: string;
  icon?: AdminPageIcon;
}) {
  const Icon = PAGE_ICONS[icon] ?? Inbox;
  return (
    <div className="rounded-2xl border border-dashed border-[#d8d3c8] bg-[#faf8f5]/80 px-6 py-12 text-center">
      <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eee9e0] text-[#5c5a54]">
        <Icon className="h-6 w-6 text-[#b38e5d]" aria-hidden />
      </span>
      <p className="text-sm font-semibold text-[#1a1a18]">{title}</p>
      {description ? <p className="mt-1 text-xs text-[#6b6459] leading-relaxed max-w-sm mx-auto">{description}</p> : null}
    </div>
  );
}

export function AlertBanner({
  variant = "info",
  children,
}: {
  variant?: "info" | "warning" | "error";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50/80 text-blue-900",
    warning: "border-amber-200 bg-amber-50/80 text-amber-900",
    error: "border-rose-200 bg-rose-50/80 text-rose-900",
  };
  return (
    <div className={cn("mb-5 rounded-xl border p-4 text-xs font-medium leading-relaxed shadow-xs", styles[variant])}>
      {children}
    </div>
  );
}
