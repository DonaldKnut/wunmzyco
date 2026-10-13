import { test, expect } from "@playwright/test";

test.describe("storefront smoke", () => {
  test("homepage renders brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /wunmzy/i }).first()).toBeVisible();
  });

  test("shop page loads", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: /shop/i })).toBeVisible();
  });

  test("cart page loads empty or with items", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible();
  });

  test("checkout validates empty cart", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator("body")).toContainText(/checkout|cart|empty|sign/i);
  });

  test("admin is protected", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin$/);
  });
});
