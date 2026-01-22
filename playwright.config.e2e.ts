import { defineConfig } from '@playwright/test';

/**
 * E2E Test Configuration for Playwright
 * 
 * このconfigはGherkin形式のe2eテストで使用します。
 * - LocalStackのDynamoDBを使用
 * - バックエンドとフロントエンドをローカルで起動
 * - Cucumber/Gherkinでテストシナリオを記述
 */
export default defineConfig({
  testDir: './test/e2e',
  testMatch: '**/*.feature',
  timeout: 60000,
  fullyParallel: false, // e2eテストは順次実行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test/e2e/reports/playwright-report' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
