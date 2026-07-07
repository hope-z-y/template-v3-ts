import { expect, test } from "@playwright/test";

test("renders the login page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "登录" })).toBeVisible();
});
