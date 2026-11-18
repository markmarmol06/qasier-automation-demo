import { test, expect } from '@playwright/test';

// Each title carries a Qasier test case ID. CHANGE these to IDs that exist in the test run you
// want to update (the reporter reads the "TC-..." part of the title).

test('[TC-1795000093] example.com shows its heading', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible();
});

// test('[TC-002] example.com links to the IANA page', async ({ page }) => {
//   await page.goto('https://example.com');
//   await expect(page.getByRole('link', { name: /more information/i })).toHaveAttribute('href', /iana\.org/);
// });

// test('[TC-003] page title is correct', async ({ page }) => {
//   await page.goto('https://example.com');
//   await expect(page).toHaveTitle('Example Domain');
// });

// // Fails on purpose, so you can see a "Failed" result and a red CI run come back to Qasier.
// // Delete this test (or change the expectation) once you've seen it.
// test('[TC-004] intentionally failing check', async ({ page }) => {
//   await page.goto('https://example.com');
//   await expect(page.getByRole('heading', { name: 'This heading does not exist' })).toBeVisible({ timeout: 3000 });
// });
