import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FRONTEND_URL } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID, TEST_PASSWORD } from './helpers';
import { TIMEOUTS } from './constants';
import { ClockInOutPage } from '../../../apps/frontend/src/ClockInOutPage/__tests__/integration/ClockInOutPage.page';

async function performClockAction(
  world: CustomWorld,
  action: 'clock-in' | 'clock-out',
): Promise<void> {
  if (!world.page) {
    throw new Error('Page is not initialized');
  }

  const clockInOutPage = new ClockInOutPage(world.page);
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

    const clockInOutPage = new ClockInOutPage(this.page);
    await clockInOutPage.expectSuccessMessage();
  },
);
