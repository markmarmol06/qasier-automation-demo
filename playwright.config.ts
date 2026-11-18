import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  // `list` for readable CI logs, plus the Qasier reporter that posts results to your test run.
  reporter: [['list'], ['./qasier-reporter.ts']],
  use: { headless: true },
});
