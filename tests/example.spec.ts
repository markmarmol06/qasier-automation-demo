import { test, expect } from '@playwright/test';

// Each title carries a Qasier test case ID. CHANGE these to IDs that exist in the test run you
// want to update (the reporter reads the "TC-..." part of the title).

test('[TC-1795000093] app.qasier.com URL is correct', async ({ page }) => {
  await page.goto('https://app.qasier.com/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL('https://app.qasier.com/');
});
