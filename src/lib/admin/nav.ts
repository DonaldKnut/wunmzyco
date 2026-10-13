import type { Permission } from "@/lib/permissions";

export type AdminNavItem = {
  href: string;
  label: string;
  permission: Permission;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", permission: "dashboard:view" },
  { href: "/admin/products", label: "Products", permission: "products:read" },
  { href: "/admin/categories", label: "Categories", permission: "products:read" },
  { href: "/admin/collections", label: "Collections", permission: "products:read" },
  { href: "/admin/inventory", label: "Inventory", permission: "inventory:read" },
  { href: "/admin/orders", label: "Orders", permission: "orders:read" },
  { href: "/admin/payments", label: "Payments", permission: "payments:read" },
  { href: "/admin/customers", label: "Customers", permission: "customers:read" },
  { href: "/admin/delivery", label: "Delivery", permission: "delivery:read" },
  { href: "/admin/discounts", label: "Discounts", permission: "discounts:read" },
  { href: "/admin/reviews", label: "Reviews", permission: "reviews:read" },
  { href: "/admin/newsletter", label: "Newsletter", permission: "newsletter:read" },
  { href: "/admin/reports", label: "Reports", permission: "reports:read" },
  { href: "/admin/settings", label: "Settings", permission: "settings:read" },
  { href: "/admin/users", label: "Admin users", permission: "admins:manage" },
  { href: "/admin/audit", label: "Audit log", permission: "audit:read" },
];
