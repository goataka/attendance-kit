import { buildTableName, resolveTableName } from './dynamodb-table-name';

describe('DynamoDBテーブル名ユーティリティ', () => {
  describe('buildTableName関数', () => {
    test('環境名とリソースタイプからテーブル名を生成できる', () => {
      // Given: 環境名とリソースタイプ
      // When: buildTableName関数を呼び出す
      // Then: 正しいフォーマットのテーブル名が返される
      expect(buildTableName('dev', 'clock')).toBe('attendance-kit-dev-clock');
      expect(buildTableName('staging', 'clock')).toBe(
        'attendance-kit-staging-clock',
      );
      expect(buildTableName('test', 'clock')).toBe('attendance-kit-test-clock');
      expect(buildTableName('local', 'clock')).toBe(
        'attendance-kit-local-clock',
      );
    });
  });

  describe('resolveTableName関数', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      // テスト後に環境変数を復元
      process.env.NODE_ENV = originalEnv;
    });

    test('NODE_ENVからテーブル名を解決できる', () => {
      // Given: NODE_ENVに環境名が設定されている
      process.env.NODE_ENV = 'dev';
      // When: resolveTableName関数を呼び出す
      // Then: NODE_ENVに基づいたテーブル名が返される
      expect(resolveTableName('clock')).toBe('attendance-kit-dev-clock');

      // Given: NODE_ENVがstagingに変更された
      process.env.NODE_ENV = 'staging';
      // When: resolveTableName関数を呼び出す
      // Then: stagingに基づいたテーブル名が返される
      expect(resolveTableName('clock')).toBe('attendance-kit-staging-clock');
    });

    test('NODE_ENVが未設定の場合はデフォルト環境を使用する', () => {
      // Given: NODE_ENVが未設定
      delete process.env.NODE_ENV;
      // When: resolveTableName関数を呼び出す
      // Then: デフォルト環境(dev)が使用される
      expect(resolveTableName('clock')).toBe('attendance-kit-dev-clock');
      // Given: NODE_ENVが未設定、デフォルト環境にlocalを指定
      // When: resolveTableName関数を呼び出す
      // Then: localが使用される
      expect(resolveTableName('clock', 'local')).toBe(
        'attendance-kit-local-clock',
      );
    });

    test('デフォルト環境をカスタマイズできる', () => {
      // Given: NODE_ENVが未設定、デフォルト環境にtestを指定
      delete process.env.NODE_ENV;
      // When: resolveTableName関数を呼び出す
      // Then: testが使用される
      expect(resolveTableName('clock', 'test')).toBe(
        'attendance-kit-test-clock',
      );
    });
  });
});
