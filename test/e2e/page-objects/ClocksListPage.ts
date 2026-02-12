import { Page, expect } from '@playwright/test';
import { ScanCommand } from '@aws-sdk/client-dynamodb';

/**
 * 打刻一覧画面のページオブジェクト
 */
export class ClocksListPage {
  private readonly page: Page;

  // セレクター定義
  private readonly selectors = {
    title: 'h1',
    filterUserId: '#filterUserId',
    filterType: '#filterType',
    filterStartDate: '#filterStartDate',
    filterEndDate: '#filterEndDate',
    searchButton: 'button:has-text("検索")',
    resetButton: 'button:has-text("リセット")',
    table: '.records-table',
    tableBody: '.records-table tbody',
    tableRow: '.records-table tbody tr',
    backToClockInLink: 'a:has-text("打刻画面に戻る")',
  };

  // タイムアウト設定
  private readonly timeouts = {
    networkIdle: 5000,
    dataLoad: 10000,
  };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 打刻一覧画面に遷移する
   */
  async goto(): Promise<void> {
    await this.page.goto('/clocks');
  }

  /**
   * ページタイトルが表示されていることを検証する
   */
  async expectTitleToBeVisible(expectedTitle: string = '打刻一覧'): Promise<void> {
    await expect(this.page.locator(this.selectors.title)).toHaveText(expectedTitle);
  }

  /**
   * フィルター要素が表示されていることを検証する
   */
  async expectFiltersToBeVisible(): Promise<void> {
    await expect(this.page.locator(this.selectors.filterUserId)).toBeVisible();
    await expect(this.page.locator(this.selectors.filterType)).toBeVisible();
    await expect(this.page.locator(this.selectors.filterStartDate)).toBeVisible();
    await expect(this.page.locator(this.selectors.filterEndDate)).toBeVisible();
  }

  /**
   * テーブルが表示されていることを検証する
   */
  async expectTableToBeVisible(): Promise<void> {
    await expect(this.page.locator(this.selectors.table)).toBeVisible();
  }

  /**
   * テーブルのヘッダーを検証する
   */
  async expectTableHeaderToContainText(text: string): Promise<void> {
    const headerCell = this.page.locator('.records-table th').first();
    await expect(headerCell).toContainText(text);
  }

  /**
   * ユーザーIDフィルターに値を入力する
   */
  async fillFilterUserId(userId: string): Promise<void> {
    await this.page.locator(this.selectors.filterUserId).fill(userId);
  }

  /**
   * タイプフィルターを選択する
   */
  async selectFilterType(type: string): Promise<void> {
    await this.page.locator(this.selectors.filterType).selectOption(type);
  }

  /**
   * 検索ボタンをクリックする
   */
  async clickSearch(): Promise<void> {
    await this.page.getByRole('button', { name: '検索' }).click();
  }

  /**
   * リセットボタンをクリックする
   */
  async clickReset(): Promise<void> {
    await this.page.getByRole('button', { name: 'リセット' }).click();
  }

  /**
   * ネットワークが安定するまで待機する
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * テーブルにデータが表示されるのを待機する
   */
  async waitForTableData(): Promise<void> {
    await this.page.waitForSelector(this.selectors.tableRow, {
      timeout: this.timeouts.dataLoad,
    });
  }

  /**
   * フィルターの値を検証する
   */
  async expectFilterUserIdToHaveValue(expectedValue: string): Promise<void> {
    await expect(this.page.locator(this.selectors.filterUserId)).toHaveValue(expectedValue);
  }

  /**
   * フィルタータイプの値を検証する
   */
  async expectFilterTypeToHaveValue(expectedValue: string): Promise<void> {
    await expect(this.page.locator(this.selectors.filterType)).toHaveValue(expectedValue);
  }

  /**
   * テーブルの最初の行にテキストが含まれることを検証する
   */
  async expectFirstRowToContainText(text: string): Promise<void> {
    const firstRow = this.page.locator(this.selectors.tableRow).first();
    await expect(firstRow).toContainText(text);
  }

  /**
   * 打刻画面に戻るリンクをクリックする
   */
  async clickBackToClockInLink(): Promise<void> {
    await this.page.getByRole('link', { name: '打刻画面に戻る' }).click();
  }

  /**
   * ユーザーIDでフィルターして検索する（統合アクション）
   */
  async filterByUserId(userId: string): Promise<void> {
    await this.fillFilterUserId(userId);
    await this.clickSearch();
    await this.page.waitForTimeout(500);
  }

  /**
   * フィルターをリセットする（統合アクション）
   */
  async resetFilters(): Promise<void> {
    await this.clickReset();
  }

  /**
   * DynamoDBにレコードが存在することを検証する
   */
  async verifyRecordInDynamoDB(
    dynamoClient: any,
    tableName: string,
    userId: string,
  ): Promise<void> {
    const command = new ScanCommand({
      TableName: tableName,
      Limit: 10,
    });
    const result = await dynamoClient.send(command);

    const clockRecord = result.Items?.find((item) => item.userId?.S === userId);

    expect(clockRecord).toBeDefined();
  }
}
