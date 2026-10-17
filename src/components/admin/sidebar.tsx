"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { LogOut, Menu, PanelLeftClose, PanelLeft, X } from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("wunmzy-admin-sidebar") === "1");
    } catch {
      /* ignore */
    }
    function expand() {
      setCollapsed(false);
    }
    window.addEventListener("wunmzy-expand-sidebar", expand);
    return () => window.removeEventListener("wunmzy-expand-sidebar", expand);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("wunmzy-admin-sidebar", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const tourIdForHref = (href: string) => {
    if (href === "/admin") return "nav-overview";
    if (href === "/admin/products") return "nav-products";
    if (href === "/admin/homepage") return "nav-homepage";
    if (href === "/admin/orders") return "nav-orders";
    if (href === "/admin/settings") return "nav-settings";
    return undefined;
  };

  const nav = (
    <>
      <div className={cn("border-b border-[#e8e4dc] px-3 py-4", collapsed && "px-2")}>
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/brand/wunmzy-logo.png"
            alt="Wunmzy Co"
            width={112}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a776f]">
                Wunmzy Co
              </p>
              <p className="text-sm font-semibold text-[#1a1a18]">Admin</p>
            </div>
          ) : null}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const tourId = tourIdForHref(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  data-tour={tourId}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-2",
                    active
                      ? "bg-[#1a1a18] text-[#faf8f5] shadow-sm"
                      : "text-[#3d3b36] hover:bg-[#ebe6dd]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-[#faf8f5]" : "text-[#7a776f] group-hover:text-[#1a1a18]",
                    )}
                    aria-hidden
                  />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        data-tour="account"
        className={cn("border-t border-[#e8e4dc] px-3 py-3", collapsed && "px-2")}
      >
        {!collapsed ? (
          <div className="mb-3 rounded-lg bg-white/70 px-3 py-2.5 text-xs text-[#5c5a54]">
            <p className="font-medium text-[#1a1a18]">{user.name}</p>
            <p className="truncate">{user.email}</p>
            <p className="mt-1 inline-flex rounded-full bg-[#eee9e0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#3d3b36]">
              {formatRole(user.role)}
            </p>
          </div>
        ) : null}
        <div className={cn("flex gap-1", collapsed ? "flex-col items-center" : "items-center")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden h-8 w-8 items-center justify-center rounded-md text-[#5c5a54] transition hover:bg-[#ebe6dd] hover:text-[#1a1a18] lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <form action={logoutAction} className={cn(!collapsed && "flex-1")}>
            <button
              type="submit"
              title="Sign out"
              className={cn(
                "inline-flex h-8 items-center justify-center gap-2 rounded-md text-xs font-medium text-[#1a1a18] transition hover:bg-[#ebe6dd]",
                collapsed ? "w-8" : "w-full px-2",
              )}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              {!collapsed ? <span>Sign out</span> : null}
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-3 border-b border-[#e8e4dc] bg-[#f5f2ec]/95 px-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-[#ebe6dd]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold">Wunmzy Admin</p>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={cn(
            "absolute inset-0 bg-black/30 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-64 flex-col border-r border-[#e8e4dc] bg-[#f5f2ec] shadow-xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-2 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#ebe6dd]"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
          {nav}
        </aside>
      </div>

      {/* Desktop fixed sidebar */}
      <aside
        data-tour="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#e8e4dc] bg-[#f5f2ec] transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.25rem]" : "w-60",
        )}
      >
        {nav}
      </aside>

      {/* Spacer so main content clears the fixed sidebar */}
      <div
        aria-hidden
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 lg:block",
          collapsed ? "w-[4.25rem]" : "w-60",
        )}
      />
    </>
  );
}
