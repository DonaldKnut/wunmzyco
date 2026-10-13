import { describe, expect, it } from "vitest";
import { hasPermission, isStaffRole } from "./permissions";

describe("permissions", () => {
  it("denies customers admin access", () => {
    expect(hasPermission("CUSTOMER", "admin:access")).toBe(false);
    expect(isStaffRole("CUSTOMER")).toBe(false);
  });

  it("allows support order read but not product write", () => {
    expect(hasPermission("SUPPORT", "orders:read")).toBe(true);
    expect(hasPermission("SUPPORT", "products:write")).toBe(false);
  });

  it("restricts admin user management to SUPER_ADMIN", () => {
    expect(hasPermission("ADMIN", "admins:manage")).toBe(false);
    expect(hasPermission("SUPER_ADMIN", "admins:manage")).toBe(true);
  });

  it("gives inventory manager stock permissions only", () => {
    expect(hasPermission("INVENTORY_MANAGER", "inventory:write")).toBe(true);
    expect(hasPermission("INVENTORY_MANAGER", "payments:refund")).toBe(false);
  });
});
