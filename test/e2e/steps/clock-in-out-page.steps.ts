import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page, FRONTEND_URL, browser } from './common.steps';

// Test credentials
const TEST_USER_ID = 'user001';
const TEST_PASSWORD = 'password123';

// ClockInOutPage - 打刻ページのステップ
When('ユーザーがClock-inボタンをクリックする', async function () {
  // ページにアクセス
  await page.goto(FRONTEND_URL);
  
  // User IDとPasswordを入力
  await page.fill('#userId', TEST_USER_ID);
  await page.fill('#password', TEST_PASSWORD);
  
  // Clock-inボタンをクリック（"出勤"ボタン）
  await page.click('text=出勤');
  
  // メッセージが表示されるまで待機
  await page.waitForSelector('.message.success', { timeout: 5000 });
});

Then('成功メッセージが表示される', async function () {
  // ホームページに戻って成功メッセージを確認
  await page.goto(FRONTEND_URL);
  
  // 最後のテストとして、もう一度clock-inして成功メッセージを確認
  await page.fill('#userId', TEST_USER_ID);
  await page.fill('#password', TEST_PASSWORD);
  await page.click('text=出勤');
  
  // 成功メッセージを確認
  const successMessage = await page.waitForSelector('.message.success', { timeout: 5000 });
  const messageText = await successMessage.textContent();
  expect(messageText).toContain('Clock in successful');
  
  console.log(`✓ Success message displayed: ${messageText}`);
  
  // ブラウザのクリーンアップ
  if (browser) {
    await browser.close();
  }
});
