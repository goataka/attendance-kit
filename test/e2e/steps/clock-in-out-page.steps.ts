import { When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { FRONTEND_URL } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID, TEST_PASSWORD } from './helpers';
import { TIMEOUTS, SELECTORS } from './constants';

/**
 * Fill login credentials on the page
 */
async function fillLoginCredentials(
  page: Page,
  userId: string = TEST_USER_ID,
  password: string = TEST_PASSWORD,
): Promise<void> {
  await page.locator(SELECTORS.userId).fill(userId);
  await page.locator(SELECTORS.password).fill(password);

  // Wait for React to update state
  await page.waitForFunction(
    ({ userId, password }) => {
      const userIdInput = document.querySelector('#userId') as HTMLInputElement;
      const passwordInput = document.querySelector(
        '#password',
      ) as HTMLInputElement;
      return (
        userIdInput?.value === userId && passwordInput?.value === password
      );
    },
    { userId, password },
  );
}

/**
 * Click clock button and wait for message to appear
 */
async function clickClockButtonAndWaitForMessage(
  page: Page,
  buttonText: string,
): Promise<void> {
  await page.getByRole('button', { name: buttonText }).click();
  await page.waitForSelector(SELECTORS.message, {
    timeout: TIMEOUTS.WAIT_MESSAGE,
  });
}

/**
 * Verify success message appeared
 */
async function verifySuccessMessage(page: Page): Promise<void> {
  const messageElement = await page.locator(SELECTORS.message).first();
  const messageClass = await messageElement.getAttribute('class');

  if (!messageClass?.includes('success')) {
    const messageText = await messageElement.textContent();
    throw new Error(`Expected success message but got: ${messageText}`);
  }
}

/**
 * Perform clock action (clock-in or clock-out)
 */
async function performClockAction(
  world: CustomWorld,
  buttonText: string,
): Promise<void> {
  if (!world.page) {
    throw new Error('Page is not initialized');
  }

  await world.page.goto(FRONTEND_URL);
  await fillLoginCredentials(world.page);
  await clickClockButtonAndWaitForMessage(world.page, buttonText);
  await verifySuccessMessage(world.page);
}

// Step definitions
When(
  'ユーザーが出勤を打刻する',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    await performClockAction(this, '出勤');
  },
);

When(
  'ユーザーが退勤を打刻する',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    await performClockAction(this, '退勤');
  },
);

Then(
  '成功メッセージが表示される',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    const successMessage = await this.page.waitForSelector(
      SELECTORS.successMessage,
      { timeout: TIMEOUTS.WAIT_MESSAGE },
    );
    const messageText = await successMessage.textContent();
    expect(messageText).toBeTruthy();
  },
);
