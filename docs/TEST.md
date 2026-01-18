# テスト戦略

このドキュメントは、勤怠管理キット（attendance-kit）プロジェクトにおけるテスト戦略を定義します。

## 概要

本プロジェクトでは、品質保証と開発効率の向上を目的として、複数のレイヤーにおける包括的なテスト戦略を採用しています。各レイヤー（AWS CDK、NestJS、React、System）において、ユニットテストから統合テスト、E2Eテストまで、適切なテスト種類とツールを組み合わせて実施します。

## テスト戦略マトリックス

| ターゲット | テスト種類 | テスト目的 | テスト内容 | 使用ツール | 実行タイミング | 接続先 |
|-----------|-----------|-----------|-----------|-----------|---------------|--------|
| **AWS CDK** | Unit | 規約遵守 | ・セキュリティ設定（暗号化等）の有無<br>・必須タグ付与の確認<br>・スタック分割の妥当性 | Jest | 実装中・プレマージ | なし<br>(Mock) |
| **AWS CDK** | Integration | 構築妥当性 | ・cdklocalによるリソース作成成功<br>・循環参照や依存関係エラーの検知<br>・パラメータ同期の確認 | Jest | 実装中・プレマージ | LocalStack |
| **NestJS** | Unit | ロジック保証 | ・ビジネスルールの計算正当性<br>・入力値バリデーションの分岐<br>・例外処理のハンドリング | Jest | 実装中・プレマージ | なし<br>(Mock) |
| **NestJS** | Integration | データ整合性 | ・DynamoDBへのCRUD操作<br>・GSI/LSIを利用した検索挙動<br>・SDK v3の型定義整合性 | Jest + Supertest | 実装中・プレマージ | LocalStack<br>(DynamoDB) |
| **React** | Unit | 独立性検証 | ・Custom Hooksの戻り値<br>・純粋な関数（Utils）の出力<br>・UI非依存のステート管理ロジック | Jest | 実装中・プレマージ | なし<br>(Mock) |
| **React** | Integration | 表示・連携 | ・コンポーネント間のProps受け渡し<br>・APIレスポンス別のUI表示切替<br>・MSWによる擬似的な通信エラー対応 | Storybook + MSW | 実装中・プレマージ | なし<br>(Mock) |
| **System** | API | 接続・権限 | ・エンドポイントの疎通（HTTP 200）<br>・IAMロール/ポリシーの権限不足確認<br>・CORS設定の妥当性 | Playwright<br>(Request) | デプロイ前 / デプロイ後 | Local / AWS |
| **System** | E2E | 体験保証 | ・ユーザー導線の完結（ログイン〜保存）<br>・ブラウザ間の表示・挙動差異<br>・システム全体のパフォーマンス・疎通 | Playwright<br>(Browser) | デプロイ前 / デプロイ後 | Local / AWS |

## レイヤー別テスト詳細

### 1. AWS CDK

AWS CDKで構築するインフラストラクチャのテストは、コード品質とデプロイ前の検証を目的とします。

#### 1.1 ユニットテスト

**目的**: インフラコードが組織の規約とベストプラクティスに準拠していることを保証

**テスト内容**:
- セキュリティ設定の検証
  - S3バケットの暗号化設定
  - DynamoDBテーブルのポイントインタイムリカバリ設定
  - IAMロールの最小権限原則の適用
- 必須タグの付与確認
  - Environment、Project、Ownerなどの必須タグ
- スタック分割の妥当性
  - 論理的な責任範囲に基づくスタック分割
  - 循環依存の回避

**使用ツール**: Jest
- AWS CDK Assertionsライブラリを使用
- スナップショットテストで構成変更を追跡

**実行タイミング**: 
- 開発中（ファイル保存時）
- プルリクエスト作成時（GitHub Actions）

**接続先**: なし（Mockを使用）

#### 1.2 統合テスト

**目的**: CDKコードが実際のAWS環境で正しく動作することを検証

**テスト内容**:
- cdklocalを使用したローカルでのリソース作成
  - DynamoDB、S3、Lambda等のリソース作成成功を確認
- 循環参照や依存関係エラーの検知
  - スタック間の依存関係が正しく解決されることを確認
- パラメータとシークレットの同期確認
  - Systems ManagerパラメータストアやSecrets Managerとの連携

**使用ツール**: Jest + cdklocal
- LocalStackを利用したローカルAWS環境
- CDK Bootstrap、Synth、Deployの一連の流れを検証

**実行タイミング**: 
- プルリクエスト作成時（GitHub Actions）
- 定期的な統合テスト実行

**接続先**: LocalStack

**実装例**:
```typescript
// infrastructure/test/integration/stack.integration.test.ts
describe('CDK Stack Integration Test', () => {
  test('should deploy stack to LocalStack', async () => {
    // LocalStackへのデプロイ検証
  });
});
```

### 2. NestJS（バックエンド）

NestJSバックエンドは、ビジネスロジックとデータアクセス層のテストを重視します。

#### 2.1 ユニットテスト

**目的**: ビジネスロジックの正確性とエラーハンドリングの検証

**テスト内容**:
- ビジネスルールの計算正当性
  - 勤怠時間の計算
  - 残業時間の算出
  - 休暇日数の集計
- 入力値バリデーションの分岐
  - DTOのバリデーションルール
  - 境界値テスト
- 例外処理のハンドリング
  - カスタム例外の適切なスロー
  - エラーレスポンスの形式

**使用ツール**: Jest
- NestJS Testing Moduleを使用
- Serviceクラス、Utilityクラスの単体テスト
- 依存関係はMockで代替

**実行タイミング**: 
- 開発中（ファイル保存時）
- プルリクエスト作成時

**接続先**: なし（Mockを使用）

**実装例**:
```typescript
// apps/backend/src/attendance/attendance.service.spec.ts
describe('AttendanceService', () => {
  it('should calculate working hours correctly', () => {
    // ロジックテスト
  });
});
```

#### 2.2 統合テスト

**目的**: データベース操作とAPIエンドポイントの統合的な動作を検証

**テスト内容**:
- DynamoDBへのCRUD操作
  - Create、Read、Update、Delete操作の成功確認
  - トランザクション処理の検証
- GSI/LSIを利用した検索挙動
  - セカンダリインデックスを使用したクエリ
  - 複雑な検索条件の動作確認
- AWS SDK v3の型定義整合性
  - DynamoDBクライアントの型安全性
  - レスポンス形式の検証

**使用ツール**: Jest + Supertest
- SupertestでHTTPリクエストをシミュレート
- LocalStackのDynamoDBを使用

**実行タイミング**: 
- プルリクエスト作成時
- 定期的な統合テスト実行

**接続先**: LocalStack（DynamoDB）

**実装例**:
```typescript
// apps/backend/test/integration/attendance.e2e-spec.ts
describe('Attendance API (e2e)', () => {
  it('/attendance (POST)', () => {
    return request(app.getHttpServer())
      .post('/attendance')
      .send({ /* data */ })
      .expect(201);
  });
});
```

### 3. React（フロントエンド）

Reactフロントエンドは、コンポーネントの独立性とUI/UXの品質を保証します。

#### 3.1 ユニットテスト

**目的**: UI非依存のロジックとカスタムフックの動作検証

**テスト内容**:
- Custom Hooksの戻り値
  - useAttendance、useAuthなどのカスタムフック
  - 状態管理とライフサイクルの検証
- 純粋な関数（Utils）の出力
  - 日付フォーマット関数
  - バリデーション関数
  - 計算ロジック
- UI非依存のステート管理ロジック
  - Redux/Zustandストアのreducers/actions
  - ビジネスロジックの分離

**使用ツール**: Jest
- @testing-library/react-hooksを使用
- 純粋関数のテスト

**実行タイミング**: 
- 開発中（ファイル保存時）
- プルリクエスト作成時

**接続先**: なし（Mockを使用）

**実装例**:
```typescript
// apps/frontend/src/hooks/useAttendance.test.ts
describe('useAttendance', () => {
  it('should return attendance data', () => {
    // カスタムフックのテスト
  });
});
```

#### 3.2 統合テスト

**目的**: コンポーネント間の連携とAPI通信時のUI挙動を検証

**テスト内容**:
- コンポーネント間のProps受け渡し
  - 親子コンポーネント間のデータフロー
  - イベントハンドラの伝播
- APIレスポンス別のUI表示切替
  - ローディング状態
  - エラー状態
  - 成功状態の表示
- MSWによる擬似的な通信エラー対応
  - ネットワークエラー時のフォールバック
  - リトライロジックの検証

**使用ツール**: Storybook + MSW
- Storybookでコンポーネントをカタログ化
- MSW（Mock Service Worker）でAPIモック
- @testing-library/reactで操作とアサーション

**実行タイミング**: 
- 開発中（Storybookサーバー起動時）
- プルリクエスト作成時

**接続先**: なし（Mockを使用）

**実装例**:
```typescript
// apps/frontend/src/components/AttendanceForm.stories.tsx
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/attendance', (req, res, ctx) => {
          return res(ctx.json({ /* mock data */ }));
        }),
      ],
    },
  },
};
```

### 4. System（システムテスト）

システムテストは、アプリケーション全体の統合と実際のユーザー体験を検証します。

#### 4.1 APIテスト

**目的**: APIエンドポイントの疎通と権限設定の検証

**テスト内容**:
- エンドポイントの疎通（HTTP 200）
  - 全APIエンドポイントのヘルスチェック
  - レスポンスタイムの測定
- IAMロール/ポリシーの権限不足確認
  - 認証が必要なエンドポイントのアクセス制御
  - 権限エラー（403 Forbidden）の適切な処理
- CORS設定の妥当性
  - クロスオリジンリクエストの許可
  - 許可されたオリジンとメソッドの確認

**使用ツール**: Playwright（Request Context）
- APIリクエストの直接実行
- レスポンスの検証

**実行タイミング**: 
- デプロイ前（LocalStack環境）
- デプロイ後（AWS環境）

**接続先**: Local / AWS

**実装例**:
```typescript
// tests/api/attendance.api.test.ts
test('should return 200 for GET /api/attendance', async ({ request }) => {
  const response = await request.get('/api/attendance');
  expect(response.status()).toBe(200);
});
```

#### 4.2 E2Eテスト

**目的**: エンドユーザーの実際の操作フローを再現し、システム全体の動作を保証

**テスト内容**:
- ユーザー導線の完結（ログイン〜保存）
  - ログイン
  - 出勤打刻
  - 退勤打刻
  - 勤怠履歴の確認
  - ログアウト
- ブラウザ間の表示・挙動差異
  - Chrome、Firefox、Safariでの動作確認
  - レスポンシブデザインの検証
- システム全体のパフォーマンス・疎通
  - ページロード時間
  - API応答時間
  - エンドツーエンドの処理時間

**使用ツール**: Playwright（Browser Context）
- ブラウザ自動化
- クロスブラウザテスト
- スクリーンショットとビデオ録画

**実行タイミング**: 
- デプロイ前（LocalStack環境）
- デプロイ後（AWS環境）
- 定期的な回帰テスト

**接続先**: Local / AWS

**実装例**:
```typescript
// tests/e2e/attendance-flow.spec.ts
test('user can clock in and out', async ({ page }) => {
  await page.goto('/');
  await page.click('text=ログイン');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button:has-text("ログイン")');
  await page.click('text=出勤');
  await expect(page.locator('text=出勤しました')).toBeVisible();
});
```

## テスト実行方法

### 全テストの実行

```bash
# モノレポ全体のテスト実行
npm test

# 特定のワークスペースのテスト実行
npm test -w @attendance-kit/backend
npm test -w @attendance-kit/frontend
```

### レイヤー別のテスト実行

#### AWS CDK

```bash
# ユニットテスト
cd infrastructure
npm run test:unit

# 統合テスト（LocalStack使用）
npm run test:integration
```

#### NestJS

```bash
# ユニットテスト
cd apps/backend
npm run test

# 統合テスト
npm run test:e2e
```

#### React

```bash
# ユニットテスト
cd apps/frontend
npm run test

# Storybook起動
npm run storybook
```

#### System

```bash
# APIテスト
npx playwright test tests/api

# E2Eテスト
npx playwright test tests/e2e

# 特定のブラウザでテスト
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### プレマージチェック

プルリクエスト作成前に、ローカル環境でCI/CDチェックを実行できます。

```bash
# プレマージワークフローのローカル実行
npm run premerge:local
```

このコマンドは以下を実行します：
- Lint
- ユニットテスト
- ビルド
- 統合テスト（LocalStack使用）

詳細は [scripts/README.md](../scripts/README.md) を参照してください。

## テストツール構成

### Jest

JavaScriptとTypeScriptのユニット/統合テストフレームワーク。

**使用箇所**:
- AWS CDK（ユニット/統合）
- NestJS（ユニット/統合）
- React（ユニット）

**主な機能**:
- スナップショットテスト
- モック/スパイ機能
- カバレッジレポート
- 並列実行

### Supertest

Node.js HTTPサーバーのテストライブラリ。

**使用箇所**:
- NestJS統合テスト

**主な機能**:
- HTTPリクエストのシミュレート
- レスポンスのアサーション

### Storybook

UIコンポーネントの開発・テスト環境。

**使用箇所**:
- React統合テスト

**主な機能**:
- コンポーネントカタログ
- インタラクティブテスト
- アクセシビリティチェック

### MSW (Mock Service Worker)

APIリクエストをモックするライブラリ。

**使用箇所**:
- React統合テスト
- Storybook

**主な機能**:
- Service Workerによるリクエストインターセプト
- RESTとGraphQLのサポート

### Playwright

エンドツーエンドテストフレームワーク。

**使用箇所**:
- システムAPIテスト
- システムE2Eテスト

**主な機能**:
- クロスブラウザテスト（Chromium、Firefox、WebKit）
- APIテスト
- スクリーンショットとビデオ録画
- トレース機能

### LocalStack

AWS環境をローカルで再現するツール。

**使用箇所**:
- AWS CDK統合テスト
- NestJS統合テスト
- システムテスト（Local環境）

**主な機能**:
- DynamoDB、S3、Lambda等のエミュレート
- CDKとの統合
- Docker Composeサポート

## テストカバレッジ目標

| レイヤー | ユニットテスト | 統合テスト | E2Eテスト |
|---------|--------------|-----------|----------|
| AWS CDK | 80%以上 | - | - |
| NestJS | 80%以上 | 70%以上 | - |
| React | 70%以上 | - | - |
| System | - | - | 主要導線100% |

## テスト環境

### ローカル環境

- **OS**: Linux、macOS、Windows（WSL2）
- **Node.js**: 24.0.0以上
- **Docker**: 20.10以上（LocalStack使用時）
- **ブラウザ**: Chromium、Firefox、WebKit（Playwright使用時）

### CI/CD環境

- **GitHub Actions**: Ubuntu Latest
- **LocalStack**: Dockerコンテナ
- **ブラウザ**: Playwrightがインストールするブラウザ

## テストデータ管理

### テストデータの原則

1. **再現性**: テストは常に同じ結果を返すこと
2. **独立性**: テスト間でデータが影響しないこと
3. **クリーンアップ**: テスト後はデータを削除すること

### テストフィクスチャ

```typescript
// apps/backend/test/fixtures/attendance.fixture.ts
export const mockAttendanceData = {
  userId: 'test-user-001',
  clockIn: '2024-01-01T09:00:00Z',
  clockOut: '2024-01-01T18:00:00Z',
};
```

### シードデータ

統合テストとE2Eテストでは、事前にシードデータを投入します。

```bash
# シードデータの投入
npm run seed:test
```

## トラブルシューティング

### LocalStackが起動しない

```bash
# Dockerコンテナの確認
docker ps -a

# LocalStackログの確認
docker logs localstack

# LocalStackの再起動
docker restart localstack
```

### テストがタイムアウトする

Jest設定でタイムアウト時間を延長：

```typescript
// jest.config.js
module.exports = {
  testTimeout: 30000, // 30秒
};
```

### Playwrightブラウザがインストールされていない

```bash
# ブラウザのインストール
npx playwright install
```

## 参考資料

- [Jest公式ドキュメント](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Library](https://testing-library.com/)
- [Storybook公式ドキュメント](https://storybook.js.org/)
- [MSW公式ドキュメント](https://mswjs.io/)
- [Playwright公式ドキュメント](https://playwright.dev/)
- [LocalStack公式ドキュメント](https://docs.localstack.cloud/)
- [AWS CDK Testing Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/testing.html)
