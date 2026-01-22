import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page, FRONTEND_URL, BACKEND_URL } from './common.steps';

// Scenario: フロントエンドからバックエンドAPIへの接続確認
When('ユーザーがフロントエンドにアクセスする', async function () {
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
});

Then('フロントエンドページが正常に表示される', async function () {
  // ページタイトルまたは特定の要素が存在することを確認
  const title = await page.title();
  expect(title).toBeTruthy();
});

Then('バックエンドAPIへの接続が確立される', async function () {
  // APIヘルスチェック
  const response = await fetch(`${BACKEND_URL}/api/health`);
  expect(response.ok).toBe(true);
});
