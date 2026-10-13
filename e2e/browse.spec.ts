import { test, expect } from "@playwright/test";

test("home page loads with brand", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Wunmzy/i);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /wunmzy/i }).first()).toBeVisible();
});

test("shop page lists catalogue", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { name: /shop/i })).toBeVisible();
});
