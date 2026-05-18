import { expect, test } from "@playwright/test";

test("home page loads with heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /edit the page\.tsx file/i }),
  ).toBeVisible();
});

test("home page has deploy and docs links", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Deploy Now" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Documentation" }),
  ).toBeVisible();
});
