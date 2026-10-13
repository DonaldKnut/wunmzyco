import { test, expect } from "@playwright/test";

test("cart page is reachable", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible();
});

test("checkout page loads", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.locator("body")).toContainText(/checkout|cart|empty|delivery|sign/i);
});

test("cart add rejects invalid product id", async ({ request }) => {
  const res = await request.post("/api/cart/add", {
    data: {
      productId: "not-a-cuid",
      quantity: 1,
    },
  });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(body.ok).toBe(false);
});

test("cart GET returns empty cart for new guest", async ({ request }) => {
  const res = await request.get("/api/cart");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.data.cart.items).toEqual([]);
});
