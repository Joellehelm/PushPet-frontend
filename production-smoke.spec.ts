import { expect, test } from "@playwright/test";

const appUrl = "https://push-pet-frontend.vercel.app";

test.use({ viewport: { width: 390, height: 844 } });

test("production main, demo, and individual lookup do not dead-end", async ({ page }) => {
  await page.goto(`${appUrl}/?smoke=${Date.now()}`);
  await expect(page.getByRole("button", { name: "Community Pushpet", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Individual Pushpet", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /How it works/i })).toBeVisible();

  await page.getByRole("button", { name: /How it works/i }).click();
  await expect(page).toHaveURL(/\/demo/);
  await expect(page.getByRole("heading", { name: /Care powered by code/i })).toBeVisible();
  await page.getByRole("button", { name: /Back/i }).click();
  await expect(page).toHaveURL(appUrl + "/");

  await page.getByRole("button", { name: "Individual Pushpet", exact: true }).click();
  await page.getByLabel(/GitHub username/i).fill("octocat");
  await page.getByRole("button", { name: /Get individual Pushpet/i }).click();

  await expect(page.getByText(/Getting pet/i)).toBeVisible();
  await expect(page.getByText(/Getting pet/i)).toBeHidden({ timeout: 18_000 });
  await expect(page.getByText(/New Pushpet|Active find|Username not found|Signal got fuzzy/i)).toBeVisible();
});
