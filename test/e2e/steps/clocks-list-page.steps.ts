import { Then } from '@cucumber/cucumber';
import ClocksListPage from '../page-objects/ClocksListPage';
import { dynamoClient, TABLE_NAME } from './services.helper';
import { CustomWorld } from './world';
import { TEST_USER_ID } from './helpers';
import { SELECTORS } from './constants';
import { verifyRecordInDynamoDB } from '../helpers/database.helper';

// Step definitions
Then('打刻一覧を確認する', async function (this: CustomWorld) {
  // Given: ページが初期化されていることを確認
  if (!this.page) {
    throw new Error('Page is not initialized');
  }

  // When: 打刻一覧リンクをクリックして画面遷移
  await this.page.getByRole('link', { name: SELECTORS.clockListLink }).click();
  await this.page.waitForLoadState('networkidle');

  // Then: 打刻一覧画面のページオブジェクトを使用して検証
  const clocksListPage = new ClocksListPage(this.page);

  // テーブルが表示されることを検証
  await clocksListPage.expectTableToBeVisible();

  // DynamoDBにレコードが存在することを検証
  await verifyRecordInDynamoDB(dynamoClient, TABLE_NAME, TEST_USER_ID);
});
