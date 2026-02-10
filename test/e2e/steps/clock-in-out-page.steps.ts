import { When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { FRONTEND_URL } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID, TEST_PASSWORD } from './helpers';
import { TIMEOUTS } from './constants';

async function createClockInOutPage(page: Page) {
  const { ClockInOutPage } = await import(
    '@/ClockInOutPage/tests/integration/ClockInOutPage.page'
  );

  return new ClockInOutPage(page);
}

async function performClockAction(
  world: CustomWorld,
  action: 'clock-in' | 'clock-out',
): Promise<void> {
  if (!world.page) {
    throw new Error('Page is not initialized');
  }

  const clockInOutPage = await createClockInOutPage(world.page);
  await clockInOutPage.goto();
  await clockInOutPage.clockInWithoutLogin(
    TEST_USER_ID,
    TEST_PASSWORD,
    action,
  );
}

// Step definitions
When(
  'ユーザーが出勤を打刻する',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    await performClockAction(this, 'clock-in');
  },
);

When(
  'ユーザーが退勤を打刻する',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    await performClockAction(this, 'clock-out');
  },
);

Then(
  '成功メッセージが表示される',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    const clockInOutPage = await createClockInOutPage(this.page);
    await clockInOutPage.expectSuccessMessage();
  },
);
