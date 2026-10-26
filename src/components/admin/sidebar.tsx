"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { LogOut, Menu, PanelLeftClose, PanelLeft, X, ExternalLink } from "lucide-react";
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
    function openMobile() {
      setMobileOpen(true);
      setCollapsed(false);
    }
    function closeMobile() {
      setMobileOpen(false);
    }
    window.addEventListener("wunmzy-expand-sidebar", expand);
    window.addEventListener("wunmzy-open-mobile-sidebar", openMobile);
    window.addEventListener("wunmzy-close-mobile-sidebar", closeMobile);
    return () => {
      window.removeEventListener("wunmzy-expand-sidebar", expand);
      window.removeEventListener("wunmzy-open-mobile-sidebar", openMobile);
      window.removeEventListener("wunmzy-close-mobile-sidebar", closeMobile);
    };
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
      {/* Brand Header */}
      <div className={cn("border-b border-[#e8e2d7] px-4 py-4", collapsed && "px-2.5")}>
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-1 border border-[#e8e2d7] shadow-xs">
              <Image
                src="/brand/wunmzy-logo.png"
                alt="Wunmzy Co"
                width={100}
                height={36}
                className="h-7 w-auto object-contain"
                priority
              />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[#b38e5d]">
                  Executive Suite
                </p>
                <p className="text-xs font-semibold text-[#1a1a18]">Wunmzy Co</p>
              </div>
            ) : null}
          </Link>
        </div>

        {/* View Storefront Pill */}
        {!collapsed ? (
          <div className="mt-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-[#e8e2d7] bg-white/70 px-2.5 py-1.5 text-[11px] font-medium text-[#6b6459] transition hover:bg-white hover:text-[#1a1a18]"
            >
              <span>View Live Store</span>
              <ExternalLink className="h-3 w-3 text-[#b38e5d]" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
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
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200",
                    collapsed && "justify-center px-2",
                    active
                      ? "bg-[#1a1a18] text-[#fbf9f5] shadow-xs"
                      : "text-[#4a4740] hover:bg-[#ede8df] hover:text-[#1a1a18]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      active ? "text-[#d4af37]" : "text-[#7a776f] group-hover:text-[#1a1a18]",
                    )}
                    aria-hidden
                  />
                  {!collapsed ? (
                    <span className="truncate tracking-wide">{item.label}</span>
                  ) : null}

                  {/* Active glowing indicator pill */}
                  {active && !collapsed ? (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Card & Signout Footer */}
      <div
        data-tour="account"
        className={cn("border-t border-[#e8e2d7] bg-white/40 p-3", collapsed && "px-2")}
      >
        {!collapsed ? (
          <div className="mb-3 rounded-xl border border-[#e8e2d7] bg-white p-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a18] text-[11px] font-bold text-[#d4af37]">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#1a1a18]">{user.name}</p>
                <p className="truncate text-[11px] text-[#7a776f]">{user.email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-[#f2ede4] pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4efe7] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6b6459]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {formatRole(user.role)}
              </span>
            </div>
          </div>
        ) : null}

        <div className={cn("flex gap-1.5", collapsed ? "flex-col items-center" : "items-center")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-[#6b6459] transition hover:bg-[#ede8df] hover:text-[#1a1a18] lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <form action={logoutAction} className={cn(!collapsed && "flex-1")}>
            <button
              type="submit"
              title="Sign out"
              className={cn(
                "inline-flex h-8 items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[#1a1a18] transition hover:bg-[#ede8df]",
                collapsed ? "w-8" : "w-full px-2",
              )}
            >
              <LogOut className="h-3.5 w-3.5 text-[#7a776f]" aria-hidden />
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
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#e8e2d7] bg-[#fbf9f5]/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8e2d7] bg-white hover:bg-[#f5efe6]"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/brand/wunmzy-logo.png"
              alt="Wunmzy Co"
              width={80}
              height={28}
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#b38e5d]">Admin</span>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 rounded-full border border-[#e8e2d7] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6b6459]"
        >
          <span>Store</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </Link>
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
            "absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          data-tour="sidebar"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col border-r border-[#e8e2d7] bg-[#fbf9f5] shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#ede8df]"
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
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#e8e2d7] bg-[#fbf9f5] transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        {nav}
      </aside>

      {/* Spacer so main content clears the fixed sidebar */}
      <div
        aria-hidden
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 lg:block",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      />
    </>
  );
}
