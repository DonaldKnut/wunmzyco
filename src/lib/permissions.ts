import type { Role } from "@prisma/client";

export type Permission =
  | "admin:access"
  | "dashboard:view"
  | "products:read"
  | "products:write"
  | "inventory:read"
  | "inventory:write"
  | "orders:read"
  | "orders:write"
  | "payments:read"
  | "payments:refund"
  | "customers:read"
  | "customers:write"
  | "delivery:read"
  | "delivery:write"
  | "discounts:read"
  | "discounts:write"
  | "reviews:read"
  | "reviews:moderate"
  | "newsletter:read"
  | "reports:read"
  | "reports:export"
  | "settings:read"
  | "settings:write"
  | "admins:manage"
  | "audit:read";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: [],
  SUPPORT: [
    "admin:access",
    "dashboard:view",
    "orders:read",
    "customers:read",
    "reviews:read",
    "newsletter:read",
  ],
  INVENTORY_MANAGER: [
    "admin:access",
    "dashboard:view",
    "products:read",
    "products:write",
    "inventory:read",
    "inventory:write",
    "reports:read",
  ],
  ORDER_MANAGER: [
    "admin:access",
    "dashboard:view",
    "orders:read",
    "orders:write",
    "payments:read",
    "customers:read",
    "delivery:read",
    "reports:read",
  ],
  ADMIN: [
    "admin:access",
    "dashboard:view",
    "products:read",
    "products:write",
    "inventory:read",
    "inventory:write",
    "orders:read",
    "orders:write",
    "payments:read",
    "payments:refund",
    "customers:read",
    "customers:write",
    "delivery:read",
    "delivery:write",
    "discounts:read",
    "discounts:write",
    "reviews:read",
    "reviews:moderate",
    "newsletter:read",
    "reports:read",
    "reports:export",
    "settings:read",
    "settings:write",
    "audit:read",
  ],
  SUPER_ADMIN: [
    "admin:access",
    "dashboard:view",
    "products:read",
    "products:write",
    "inventory:read",
    "inventory:write",
    "orders:read",
    "orders:write",
    "payments:read",
    "payments:refund",
    "customers:read",
    "customers:write",
    "delivery:read",
    "delivery:write",
    "discounts:read",
    "discounts:write",
    "reviews:read",
    "reviews:moderate",
    "newsletter:read",
    "reports:read",
    "reports:export",
    "settings:read",
    "settings:write",
    "admins:manage",
    "audit:read",
  ],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function isStaffRole(role: Role): boolean {
  return role !== "CUSTOMER";
}

export const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "ORDER_MANAGER",
  "INVENTORY_MANAGER",
  "SUPPORT",
];
