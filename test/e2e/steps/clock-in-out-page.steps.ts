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
  
  // Clear any existing values first
  await page.locator('#userId').clear();
  await page.locator('#password').clear();
  
  // Use pressSequentially to type character by character, which better simulates real user input
  // and ensures onChange events fire properly for each character
  await page.locator('#userId').pressSequentially(userId, { delay: 50 });
  await page.locator('#password').pressSequentially(password, { delay: 50 });
  
  // Give React more time to process all onChange events and update state
  // React batches state updates, so we need to wait for the event loop to complete
  await page.waitForTimeout(1000);
  
  // Verify the values were actually set in the DOM
  const userIdValue = await page.locator('#userId').inputValue();
  const passwordValue = await page.locator('#password').inputValue();
  
  if (userIdValue !== userId || passwordValue !== password) {
    throw new Error(`Form values not set correctly. Expected userId='${userId}', got='${userIdValue}'. Expected password='${password}', got='${passwordValue}'`);
  }
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
