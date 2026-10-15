"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { formatRole } from "@/lib/admin/labels";

export function AdminSidebar({
  user,
  logoutAction,
}: {
  user: { name: string; email: string; role: Role };
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => hasPermission(user.role, item.permission));

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[#e8e4dc] bg-[#f5f2ec]">
      <div className="border-b border-[#e8e4dc] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#7a776f]">
          <span className="inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/wunmzy-logo.png" alt="" className="h-7 w-auto object-contain" />
            Wunmzy Co
          </span>
        </p>
        <p className="text-sm font-semibold text-[#1a1a18]">Admin</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#1a1a18] text-[#faf8f5]"
                      : "text-[#3d3b36] hover:bg-[#ebe6dd]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-[#e8e4dc] px-4 py-3 text-xs text-[#5c5a54]">
        <p className="font-medium text-[#1a1a18]">{user.name}</p>
        <p className="truncate">{user.email}</p>
        <p className="mt-1 text-[#7a776f]">{formatRole(user.role)}</p>
        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="text-xs font-medium text-[#1a1a18] underline-offset-2 hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
