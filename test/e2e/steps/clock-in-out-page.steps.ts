import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FRONTEND_URL } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID, TEST_PASSWORD } from './helpers';

// Fill login credentials
async function fillLoginCredentials(page: any, userId: string = TEST_USER_ID, password: string = TEST_PASSWORD): Promise<void> {
  // Wait for the form to be fully loaded
  await page.waitForSelector('#userId', { state: 'visible' });
  await page.waitForSelector('#password', { state: 'visible' });
  
  // Fill the form fields
  await page.fill('#userId', userId);
  await page.fill('#password', password);
  
  // Give React time to update state
  await page.waitForTimeout(500);
}

// Click clock button and wait for message
async function clickClockButtonAndWaitForMessage(page: any, buttonText: string): Promise<void> {
  await page.click(`text=${buttonText}`);
  await page.waitForSelector('.message', { timeout: 15000 });
}

// 打刻ページのステップ
When('ユーザーが出勤を打刻する', { timeout: 30000 }, async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  
  await this.page.goto(FRONTEND_URL);
  await fillLoginCredentials(this.page);
  await clickClockButtonAndWaitForMessage(this.page, '出勤');
  
  // Verify success message appeared
  const messageElement = await this.page.locator('.message').first();
  const messageClass = await messageElement.getAttribute('class');
  
  if (!messageClass?.includes('success')) {
    const messageText = await messageElement.textContent();
    throw new Error(`Expected success message but got: ${messageText}`);
  }
});

When('ユーザーが退勤を打刻する', { timeout: 30000 }, async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }
  
  await this.page.goto(FRONTEND_URL);
  await fillLoginCredentials(this.page);
  await clickClockButtonAndWaitForMessage(this.page, '退勤');
  
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
  
  const successMessage = await this.page.waitForSelector('.message.success', { timeout: 15000 });
  const messageText = await successMessage.textContent();
  expect(messageText).toBeTruthy();
});
