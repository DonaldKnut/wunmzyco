import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  Warehouse,
  ShoppingBag,
  CreditCard,
  Users,
  Truck,
  Percent,
  Star,
  Mail,
  BarChart3,
  Settings,
  Shield,
  ScrollText,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export type AdminNavItem = {
  href: string;
  label: string;
  permission: Permission;
  icon: LucideIcon;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", permission: "dashboard:view", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", permission: "products:read", icon: Package },
  { href: "/admin/categories", label: "Categories", permission: "products:read", icon: Tags },
  { href: "/admin/collections", label: "Collections", permission: "products:read", icon: Layers },
  { href: "/admin/inventory", label: "Inventory", permission: "inventory:read", icon: Warehouse },
  { href: "/admin/orders", label: "Orders", permission: "orders:read", icon: ShoppingBag },
  { href: "/admin/payments", label: "Payments", permission: "payments:read", icon: CreditCard },
  { href: "/admin/customers", label: "Customers", permission: "customers:read", icon: Users },
  { href: "/admin/delivery", label: "Delivery", permission: "delivery:read", icon: Truck },
  { href: "/admin/discounts", label: "Discounts", permission: "discounts:read", icon: Percent },
  { href: "/admin/reviews", label: "Reviews", permission: "reviews:read", icon: Star },
  { href: "/admin/newsletter", label: "Newsletter", permission: "newsletter:read", icon: Mail },
  { href: "/admin/reports", label: "Reports", permission: "reports:read", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", permission: "settings:read", icon: Settings },
  { href: "/admin/users", label: "Admin users", permission: "admins:manage", icon: Shield },
  { href: "/admin/audit", label: "Audit log", permission: "audit:read", icon: ScrollText },
];
