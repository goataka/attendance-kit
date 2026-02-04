import { buildTableName, resolveTableName } from './dynamodb-table-name';

describe('DynamoDBテーブル名ユーティリティ', () => {
  describe('buildTableName関数', () => {
    test('環境名とリソースタイプからテーブル名を生成できる', () => {
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
      process.env.NODE_ENV = 'dev';
      expect(resolveTableName('clock')).toBe('attendance-kit-dev-clock');

      process.env.NODE_ENV = 'staging';
      expect(resolveTableName('clock')).toBe('attendance-kit-staging-clock');
    });

    test('NODE_ENVが未設定の場合はデフォルト環境を使用する', () => {
      delete process.env.NODE_ENV;
      expect(resolveTableName('clock')).toBe('attendance-kit-dev-clock');
      expect(resolveTableName('clock', 'local')).toBe(
        'attendance-kit-local-clock',
      );
    });

    test('デフォルト環境をカスタマイズできる', () => {
      delete process.env.NODE_ENV;
      expect(resolveTableName('clock', 'test')).toBe(
        'attendance-kit-test-clock',
      );
    });
  });
});
