# テスト戦略

このドキュメントは、勤怠管理キット（attendance-kit）プロジェクトにおけるテスト戦略の概要を示します。

## 概要

本プロジェクトでは、品質保証と開発効率の向上を目的として、複数のレイヤーにおける包括的なテスト戦略を採用しています。各レイヤー（AWS CDK、NestJS、React、System）において、ユニットテストから統合テスト、E2Eテストまで、適切なテスト種類とツールを組み合わせて実施します。

## テスト戦略マトリックス

| ターゲット  | テスト種類  | テスト目的   | テスト内容                                                                                                     | 使用ツール              | 実行タイミング          | 接続先                   |
| ----------- | ----------- | ------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------- | ------------------------ |
| **AWS CDK** | Unit        | 規約遵守     | ・セキュリティ設定（暗号化等）の有無<br>・必須タグ付与の確認<br>・スタック分割の妥当性                         | Jest                    | 実装中・プレマージ      | なし<br>(Mock)           |
| **AWS CDK** | Integration | 構築妥当性   | ・cdklocalによるリソース作成成功<br>・循環参照や依存関係エラーの検知<br>・パラメータ同期の確認                 | Jest                    | 実装中・プレマージ      | LocalStack               |
| **NestJS**  | Unit        | ロジック保証 | ・ビジネスルールの計算正当性<br>・入力値バリデーションの分岐<br>・例外処理のハンドリング                       | Jest                    | 実装中・プレマージ      | なし<br>(Mock)           |
| **NestJS**  | Integration | データ整合性 | ・DynamoDBへのCRUD操作<br>・GSI/LSIを利用した検索挙動<br>・SDK v3の型定義整合性                                | Jest + Supertest        | 実装中・プレマージ      | LocalStack<br>(DynamoDB) |
| **React**   | Unit        | 独立性検証   | ・Custom Hooksの戻り値<br>・純粋な関数（Utils）の出力<br>・UI非依存のステート管理ロジック                      | Jest                    | 実装中・プレマージ      | なし<br>(Mock)           |
| **React**   | Integration | 表示・連携   | ・コンポーネント間のProps受け渡し<br>・APIレスポンス別のUI表示切替<br>・MSWによる擬似的な通信エラー対応        | Playwright + MSW        | 実装中・プレマージ      | なし<br>(Mock)           |
| **System**  | API         | 接続・権限   | ・エンドポイントの疎通（HTTP 200）<br>・IAMロール/ポリシーの権限不足確認<br>・CORS設定の妥当性                 | Playwright<br>(Request) | デプロイ前 / デプロイ後 | Local / AWS              |
| **System**  | E2E         | 体験保証     | ・ユーザー導線の完結（ログイン〜保存）<br>・ブラウザ間の表示・挙動差異<br>・システム全体のパフォーマンス・疎通 | Playwright<br>(Browser) | デプロイ前 / デプロイ後 | Local / AWS              |

## ターゲット別テスト詳細

各ターゲットの詳細なテスト戦略は、以下のドキュメントを参照してください。

### AWS CDK（インフラストラクチャ）

**概要**: [infrastructure/docs/TEST.md](../infrastructure/docs/TEST.md)

- **ユニットテスト**: [infrastructure/docs/test/unit.md](../infrastructure/docs/test/unit.md)
- **統合テスト**: [infrastructure/docs/test/integration.md](../infrastructure/docs/test/integration.md)

### NestJS（バックエンド）

**概要**: [apps/backend/docs/TEST.md](../apps/backend/docs/TEST.md)

- **ユニットテスト**: [apps/backend/docs/test/unit.md](../apps/backend/docs/test/unit.md)
- **統合テスト**: [apps/backend/docs/test/integration.md](../apps/backend/docs/test/integration.md)

### React（フロントエンド）

**概要**: [apps/frontend/docs/TEST.md](../apps/frontend/docs/TEST.md)

- **ユニットテスト**: [apps/frontend/docs/test/unit.md](../apps/frontend/docs/test/unit.md)
- **統合テスト**: [apps/frontend/docs/test/integration.md](../apps/frontend/docs/test/integration.md)

### System（システムテスト）

システムテストは、アプリケーション全体の統合と実際のユーザー体験を検証します。

- **APIテスト**: [test/api.md](test/api.md)
- **E2Eテスト**: [test/e2e.md](test/e2e.md)

## テスト実行方法

### 全テストの実行

```bash
# モノレポ全体のテスト実行
npm test

# 特定のワークスペースのテスト実行
npm test -w @attendance-kit/backend
npm test -w @attendance-kit/frontend
```

### ターゲット別のテスト実行

各ターゲットの詳細なテスト実行方法は、以下のドキュメントを参照してください。

- **AWS CDK**: [infrastructure/docs/TEST.md](../infrastructure/docs/TEST.md)
- **NestJS**: [apps/backend/docs/TEST.md](../apps/backend/docs/TEST.md)
- **React**: [apps/frontend/docs/TEST.md](../apps/frontend/docs/TEST.md)

### プレマージチェック

プルリクエスト作成前に、以下のコマンドで主要なチェックを実行できます。

```bash
# Lint
npm run lint

# ユニットテスト
npm test

# ビルド
npm run build
```

統合テストやE2Eテストは、PRを作成することで自動的に実行されます。詳細は[.github/workflows/premerge.yml](../.github/workflows/premerge.yml)を参照してください。

## テストツール構成

主要なテストツールの概要です。詳細な使用方法は各ターゲットのドキュメントを参照してください。

- **Jest**: JavaScriptとTypeScriptのテストフレームワーク
- **Supertest**: Node.js HTTPサーバーのテストライブラリ
- **MSW (Mock Service Worker)**: APIリクエストをモックするライブラリ
- **Playwright**: エンドツーエンドテストフレームワーク
- **LocalStack**: AWS環境をローカルで再現するツール

## テストカバレッジ目標

| レイヤー | ユニットテスト | 統合テスト | E2Eテスト    |
| -------- | -------------- | ---------- | ------------ |
| AWS CDK  | 80%以上        | -          | -            |
| NestJS   | 80%以上        | 70%以上    | -            |
| React    | 70%以上        | -          | -            |
| System   | -              | -          | 主要導線100% |

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

## 参考資料

- [Jest公式ドキュメント](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Library](https://testing-library.com/)
- [MSW公式ドキュメント](https://mswjs.io/)
- [Playwright公式ドキュメント](https://playwright.dev/)
- [LocalStack公式ドキュメント](https://docs.localstack.cloud/)
- [AWS CDK Testing Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/testing.html)
