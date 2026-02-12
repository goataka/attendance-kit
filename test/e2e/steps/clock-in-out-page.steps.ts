import { When, Then } from '@cucumber/cucumber';
import { ClockInOutPage } from '../page-objects';
import { CustomWorld } from './world';
import { TEST_USER_ID, TEST_PASSWORD } from './helpers';
import { TIMEOUTS } from './constants';

// Step definitions
When(
  'ユーザーが出勤を打刻する',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    // Given: ページが初期化されていることを確認
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    // When: 打刻画面のページオブジェクトを使用して出勤を打刻
    const clockInOutPage = new ClockInOutPage(this.page);
    await clockInOutPage.loginAndClockIn(TEST_USER_ID, TEST_PASSWORD);
  },
);

When(
  'ユーザーが退勤を打刻する',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    // Given: ページが初期化されていることを確認
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    // When: 打刻画面のページオブジェクトを使用して退勤を打刻
    const clockInOutPage = new ClockInOutPage(this.page);
    await clockInOutPage.loginAndClockOut(TEST_USER_ID, TEST_PASSWORD);
  },
);

Then(
  '成功メッセージが表示される',
  { timeout: TIMEOUTS.CLOCK_ACTION },
  async function (this: CustomWorld) {
    // Given: ページが初期化されていることを確認
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    // Then: 成功メッセージが表示されることを検証
    const clockInOutPage = new ClockInOutPage(this.page);
    await clockInOutPage.expectSuccessMessage();
  },
);
