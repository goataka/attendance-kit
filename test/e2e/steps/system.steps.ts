import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FRONTEND_URL, BACKEND_URL, CustomWorld } from './common.steps';

// Scenario: フロントエンドからバックエンドAPIへの接続確認
When('ユーザーがフロントエンドにアクセスする', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  await this.page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
});

Then('フロントエンドページが正常に表示される', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  // ページタイトルまたは特定の要素が存在することを確認
  const title = await this.page.title();
  expect(title).toBeTruthy();
});

Then('バックエンドAPIへの接続が確立される', async function (this: CustomWorld) {
  // APIヘルスチェック
  const response = await fetch(`${BACKEND_URL}/api/health`);
  expect(response.ok).toBe(true);
});
