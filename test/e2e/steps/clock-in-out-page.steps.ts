import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FRONTEND_URL } from './common.steps';
import { CustomWorld } from './world';
import { fillLoginCredentials, clickClockInAndWaitForMessage } from './helpers';

// 打刻ページのステップ
When('ユーザーが出勤を打刻する', { timeout: 30000 }, async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  
  await this.page.goto(FRONTEND_URL);
  await fillLoginCredentials(this.page);
  await clickClockInAndWaitForMessage(this.page);
  
  // Verify success message appeared
  const messageElement = await this.page.locator('.message').first();
  const messageClass = await messageElement.getAttribute('class');
  
  if (!messageClass?.includes('success')) {
    const messageText = await messageElement.textContent();
    throw new Error(`Expected success message but got: ${messageText}`);
  }
});

Then('成功メッセージが表示される', { timeout: 30000 }, async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  
  await this.page.goto(FRONTEND_URL);
  await fillLoginCredentials(this.page);
  await clickClockInAndWaitForMessage(this.page);
  
  const successMessage = await this.page.waitForSelector('.message.success', { timeout: 15000 });
  const messageText = await successMessage.textContent();
  expect(messageText).toContain('Clock in successful');
});
