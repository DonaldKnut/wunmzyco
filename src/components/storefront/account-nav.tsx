"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-4 border-b border-border pb-4 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "uppercase tracking-widest text-muted-foreground hover:text-foreground",
            pathname === link.href && "text-foreground underline underline-offset-4",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
