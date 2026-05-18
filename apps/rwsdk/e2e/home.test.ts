import { expect, test } from "@playwright/test";

test("home page loads with welcome heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Welcome to RedwoodSDK" }),
  ).toBeVisible();
});

test("home page has next steps section", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Next steps" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Quick Start" })).toBeVisible();
});
