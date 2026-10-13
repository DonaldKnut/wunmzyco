import Link from "next/link";
import { cn } from "@/lib/utils";

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
        "rounded-lg border border-[#e8e4dc] bg-white shadow-sm",
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
    <div className="flex items-start justify-between gap-3 border-b border-[#eee9e0] px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold text-[#1a1a18]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-[#5c5a54]">{description}</p>
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
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <AdminCard>
      <AdminCardBody className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[#7a776f]">
          {label}
        </p>
        <p className="text-2xl font-semibold tabular-nums text-[#1a1a18]">{value}</p>
        {hint ? <p className="text-xs text-[#5c5a54]">{hint}</p> : null}
      </AdminCardBody>
    </AdminCard>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1a1a18]">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-[#5c5a54]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a18] disabled:pointer-events-none disabled:opacity-50";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const variants = {
    primary: "bg-[#1a1a18] text-[#faf8f5] hover:bg-[#2d2d2a]",
    secondary: "border border-[#d8d3c8] bg-[#faf8f5] text-[#1a1a18] hover:bg-[#f0ebe3]",
    ghost: "text-[#1a1a18] hover:bg-[#f0ebe3]",
    danger: "bg-[#8b2e2e] text-white hover:bg-[#6f2424]",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4" };
  return (
    <button
      className={cn(buttonBase, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

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
    primary: "bg-[#1a1a18] text-[#faf8f5] hover:bg-[#2d2d2a]",
    secondary: "border border-[#d8d3c8] bg-[#faf8f5] text-[#1a1a18] hover:bg-[#f0ebe3]",
    ghost: "text-[#1a1a18] hover:bg-[#f0ebe3]",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4" };
  return (
    <Link
      href={href}
      className={cn(buttonBase, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border border-[#d8d3c8] bg-white px-3 text-sm text-[#1a1a18] placeholder:text-[#9a968d] focus:border-[#1a1a18] focus:outline-none focus:ring-1 focus:ring-[#1a1a18]",
        props.className,
      )}
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[88px] w-full rounded-md border border-[#d8d3c8] bg-white px-3 py-2 text-sm text-[#1a1a18] placeholder:text-[#9a968d] focus:border-[#1a1a18] focus:outline-none focus:ring-1 focus:ring-[#1a1a18]",
        props.className,
      )}
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-md border border-[#d8d3c8] bg-white px-3 text-sm text-[#1a1a18] focus:border-[#1a1a18] focus:outline-none focus:ring-1 focus:ring-[#1a1a18]",
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
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-[#3d3b36]">
      {children}
    </label>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
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
    neutral: "bg-[#eee9e0] text-[#3d3b36]",
    success: "bg-[#dfe8df] text-[#2d4a2d]",
    warning: "bg-[#f5ead6] text-[#6b4f1d]",
    danger: "bg-[#f3e0e0] text-[#6f2424]",
    info: "bg-[#e4e8f0] text-[#2a3a5c]",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#e8e4dc] bg-white">
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
        "border-b border-[#eee9e0] bg-[#faf8f5] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#7a776f]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-[#f3efe8] px-3 py-2.5 text-[#1a1a18]", className)}>
      {children}
    </td>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d8d3c8] bg-[#faf8f5]/60 px-6 py-10 text-center">
      <p className="text-sm font-medium text-[#1a1a18]">{title}</p>
      {description ? <p className="mt-1 text-sm text-[#5c5a54]">{description}</p> : null}
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
    info: "border-[#c8d4e8] bg-[#eef3fa] text-[#2a3a5c]",
    warning: "border-[#e8d4a8] bg-[#faf5ea] text-[#6b4f1d]",
    error: "border-[#e8c8c8] bg-[#faf0f0] text-[#6f2424]",
  };
  return (
    <div className={cn("mb-4 rounded-md border px-4 py-3 text-sm", styles[variant])}>
      {children}
    </div>
  );
}
