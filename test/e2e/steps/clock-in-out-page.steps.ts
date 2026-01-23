import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page, FRONTEND_URL, browser } from './common.steps';

// Test credentials
const TEST_USER_ID = 'user001';
const TEST_PASSWORD = 'password123';

// ClockInOutPage - 打刻ページのステップ
When('ユーザーがClock-inボタンをクリックする', { timeout: 30000 }, async function () {
  console.log(`📝 Starting clock-in for user: ${TEST_USER_ID}`);
  
  // ページにアクセス
  await page.goto(FRONTEND_URL);
  console.log(`✓ Navigated to ${FRONTEND_URL}`);
  
  // User IDとPasswordを入力
  await page.fill('#userId', TEST_USER_ID);
  await page.fill('#password', TEST_PASSWORD);
  console.log(`✓ Filled userId and password`);
  
  // Clock-inボタンをクリック（"出勤"ボタン）
  await page.click('text=出勤');
  console.log(`✓ Clicked clock-in button`);
  
  // メッセージが表示されるまで待機（成功または失敗）
  try {
    await page.waitForSelector('.message', { timeout: 15000 });
    const messageElement = await page.locator('.message').first();
    const messageText = await messageElement.textContent();
    const messageClass = await messageElement.getAttribute('class');
    console.log(`✓ Message appeared: ${messageText}`);
    console.log(`✓ Message class: ${messageClass}`);
    
    // 成功メッセージかどうか確認
    if (!messageClass?.includes('success')) {
      throw new Error(`Expected success message but got: ${messageText}`);
    }
  } catch (error) {
    console.error(`❌ Error waiting for message:`, error);
    // ページの現在の状態をログ
    const bodyText = await page.textContent('body');
    console.log('Page content:', bodyText?.substring(0, 500));
    throw error;
  }
});

Then('成功メッセージが表示される', { timeout: 30000 }, async function () {
  // ホームページに戻って成功メッセージを確認
  await page.goto(FRONTEND_URL);
  
  // 最後のテストとして、もう一度clock-inして成功メッセージを確認
  await page.fill('#userId', TEST_USER_ID);
  await page.fill('#password', TEST_PASSWORD);
  await page.click('text=出勤');
  
  // 成功メッセージを確認
  const successMessage = await page.waitForSelector('.message.success', { timeout: 15000 });
  const messageText = await successMessage.textContent();
  expect(messageText).toContain('Clock in successful');
  
  console.log(`✓ Success message displayed: ${messageText}`);
  
  // ブラウザのクリーンアップ
  if (browser) {
    await browser.close();
  }
});
