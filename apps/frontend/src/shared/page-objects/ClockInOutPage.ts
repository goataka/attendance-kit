import { Page, expect } from '@playwright/test';

/**
 * 打刻画面のページオブジェクト
 */
export default class ClockInOutPage {
  private readonly page: Page;

  // セレクター定義
  private readonly selectors = {
    title: 'h1',
    userIdInput: '#userId',
    passwordInput: '#password',
    clockInButton: 'button:has-text("出勤")',
    clockOutButton: 'button:has-text("退勤")',
    message: '.message',
    successMessage: '.message.success',
    errorMessage: '.message.error',
    clockListLink: 'a:has-text("打刻一覧を見る")',
  };

  // タイムアウト設定
  private readonly timeouts = {
    waitMessage: 15000,
    stateUpdate: 5000,
  };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 打刻画面に遷移する
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * ページタイトルを取得する
   */
  async getTitle(): Promise<string> {
    const titleElement = this.page.locator(this.selectors.title);
    return (await titleElement.textContent()) || '';
  }

  /**
   * ページタイトルが表示されていることを検証する
   */
  async expectTitleToBeVisible(expectedTitle: string = '勤怠打刻'): Promise<void> {
    await expect(this.page.locator(this.selectors.title)).toHaveText(expectedTitle);
  }

  /**
   * ユーザーIDを入力する
   */
  async fillUserId(userId: string): Promise<void> {
    await this.page.locator(this.selectors.userIdInput).fill(userId);
  }

  /**
   * パスワードを入力する
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.locator(this.selectors.passwordInput).fill(password);
  }

  /**
   * ログイン情報を入力する
   */
  async fillLoginCredentials(userId: string, password: string): Promise<void> {
    await this.fillUserId(userId);
    await this.fillPassword(password);

    // Reactの状態更新を待機
    await this.page.waitForFunction(
      ({ userId, password }) => {
        const userIdInput = document.querySelector('#userId') as HTMLInputElement;
        const passwordInput = document.querySelector('#password') as HTMLInputElement;
        return userIdInput?.value === userId && passwordInput?.value === password;
      },
      { userId, password },
    );
  }

  /**
   * 出勤ボタンをクリックする
   */
  async clickClockIn(): Promise<void> {
    await this.page.getByRole('button', { name: '出勤' }).click();
  }

  /**
   * 退勤ボタンをクリックする
   */
  async clickClockOut(): Promise<void> {
    await this.page.getByRole('button', { name: '退勤' }).click();
  }

  /**
   * 出勤を打刻する（ボタンクリック後、メッセージ表示を待機）
   */
  async performClockIn(): Promise<void> {
    await this.clickClockIn();
    await this.waitForMessage();
  }

  /**
   * 退勤を打刻する（ボタンクリック後、メッセージ表示を待機）
   */
  async performClockOut(): Promise<void> {
    await this.clickClockOut();
    await this.waitForMessage();
  }

  /**
   * メッセージの表示を待機する
   */
  async waitForMessage(): Promise<void> {
    await this.page.waitForSelector(this.selectors.message, {
      timeout: this.timeouts.waitMessage,
    });
  }

  /**
   * 成功メッセージが表示されることを検証する
   */
  async expectSuccessMessage(expectedText?: string): Promise<void> {
    const messageLocator = this.page.locator(this.selectors.successMessage);
    await messageLocator.waitFor({
      state: 'visible',
      timeout: this.timeouts.waitMessage,
    });
    
    const messageClass = await messageLocator.getAttribute('class');
    if (!messageClass?.includes('success')) {
      const messageText = await messageLocator.textContent();
      throw new Error(`Expected success message but got: ${messageText}`);
    }

    if (expectedText) {
      await expect(messageLocator).toContainText(expectedText);
    }
  }

  /**
   * エラーメッセージが表示されることを検証する
   */
  async expectErrorMessage(expectedText?: string): Promise<void> {
    const messageLocator = this.page.locator(this.selectors.errorMessage);
    await messageLocator.waitFor({
      state: 'visible',
      timeout: this.timeouts.waitMessage,
    });

    if (expectedText) {
      await expect(messageLocator).toContainText(expectedText);
    }
  }

  /**
   * フォーム要素が表示されていることを検証する
   */
  async expectFormToBeVisible(): Promise<void> {
    await expect(this.page.locator(this.selectors.userIdInput)).toBeVisible();
    await expect(this.page.locator(this.selectors.passwordInput)).toBeVisible();
    await expect(this.page.getByRole('button', { name: '出勤' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: '退勤' })).toBeVisible();
  }

  /**
   * 打刻一覧リンクをクリックする
   */
  async clickClockListLink(): Promise<void> {
    await this.page.getByRole('link', { name: '打刻一覧を見る' }).click();
  }

  /**
   * ログイン情報を入力して出勤を打刻する（統合アクション）
   */
  async loginAndClockIn(userId: string, password: string): Promise<void> {
    await this.goto();
    await this.fillLoginCredentials(userId, password);
    await this.performClockIn();
    await this.expectSuccessMessage();
  }

  /**
   * ログイン情報を入力して退勤を打刻する（統合アクション）
   */
  async loginAndClockOut(userId: string, password: string): Promise<void> {
    await this.goto();
    await this.fillLoginCredentials(userId, password);
    await this.performClockOut();
    await this.expectSuccessMessage();
  }
}
