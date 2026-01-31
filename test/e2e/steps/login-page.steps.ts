import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FRONTEND_URL } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID, TEST_PASSWORD } from './helpers';
import { TIMEOUTS } from './constants';

// Given steps
Given(
  'ユーザーがログインページにアクセスする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    await this.page.goto(`${FRONTEND_URL}/login`);
    
    // Verify we're on the login page
    await expect(this.page.locator('h1')).toHaveText('ログイン');
  },
);

Given(
  'ユーザーが打刻画面にアクセスする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    await this.page.goto(FRONTEND_URL);
    
    // Verify we're on the clock-in/out page
    await expect(this.page.locator('h1')).toHaveText('勤怠打刻');
  },
);

// When steps
When(
  'ユーザーが有効な認証情報でログインする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Fill in credentials
    await this.page.locator('#userId').fill(TEST_USER_ID);
    await this.page.locator('#password').fill(TEST_PASSWORD);
    
    // Click login button
    await this.page.getByRole('button', { name: 'ログイン' }).click();
  },
);

When(
  'ユーザーが無効な認証情報でログインする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Fill in invalid credentials
    await this.page.locator('#userId').fill('invaliduser');
    await this.page.locator('#password').fill('wrongpassword');
    
    // Click login button
    await this.page.getByRole('button', { name: 'ログイン' }).click();
  },
);

When(
  'ユーザーが空のフィールドでログインを試みる',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Click login button without filling fields
    await this.page.getByRole('button', { name: 'ログイン' }).click();
  },
);

When(
  'ユーザーがログインボタンをクリックする',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Click the login link button
    await this.page.getByRole('link', { name: 'ログイン' }).click();
  },
);

// Then steps
Then(
  'ログインに成功する',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Wait for navigation (successful login redirects)
    await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.NETWORK_IDLE });
  },
);

Then(
  '打刻一覧ページにリダイレクトされる',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Verify URL is /clocks
    await expect(this.page).toHaveURL(`${FRONTEND_URL}/clocks`);
    
    // Verify the page title
    await expect(this.page.locator('h1')).toHaveText('打刻一覧');
  },
);

Then(
  'エラーメッセージが表示される',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Wait for error message to appear
    const errorMessage = await this.page.waitForSelector('.message.error', {
      timeout: TIMEOUTS.WAIT_MESSAGE,
    });
    
    // Verify error message is visible
    await expect(errorMessage).toBeVisible();
    
    // Verify error message contains text
    const messageText = await errorMessage.textContent();
    expect(messageText).toBeTruthy();
    expect(messageText?.length).toBeGreaterThan(0);
  },
);

Then(
  '必須フィールドのエラーメッセージが表示される',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Wait for error message to appear
    const errorMessage = await this.page.waitForSelector('.message.error', {
      timeout: TIMEOUTS.WAIT_MESSAGE,
    });
    
    // Verify error message contains "required" text
    const messageText = await errorMessage.textContent();
    expect(messageText).toContain('required');
  },
);

Then(
  'ログインページに移動する',
  { timeout: TIMEOUTS.DEFAULT_STEP },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }
    
    // Verify URL is /login
    await expect(this.page).toHaveURL(`${FRONTEND_URL}/login`);
    
    // Verify the page title
    await expect(this.page.locator('h1')).toHaveText('ログイン');
  },
);
