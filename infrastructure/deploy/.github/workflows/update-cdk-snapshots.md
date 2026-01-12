# Update CDK Snapshots ワークフロー

## 概要

CDK関連ファイルが変更されたPull Requestに対して、自動的にスナップショットを更新するワークフローです。

## トリガー

Pull Requestで以下のファイルが変更された時に自動実行されます：

- `infrastructure/deploy/lib/**/*.ts` - CDKスタック定義
- `infrastructure/deploy/bin/**/*.ts` - CDKアプリケーションエントリーポイント
- `infrastructure/deploy/test/**/*.test.ts` - テストファイル
- `infrastructure/deploy/package*.json` - 依存関係
- `infrastructure/deploy/tsconfig.json` - TypeScript設定

## 動作

1. **依存関係のインストール**: npm ci でクリーンインストール
2. **TypeScriptビルド**: npm run build でコンパイル
3. **スナップショット更新**: npm test -- -u でスナップショットを更新
4. **変更検知**: スナップショットファイルの変更を検知
5. **自動コミット**: 変更があればコミット・プッシュ
6. **PR コメント**: 更新内容をPRにコメント

## スナップショット対象

以下の3つのスタックのスナップショットを管理します：

- **Dev環境スタック** (`attendance-kit-stack.test.ts`)
- **Staging環境スタック** (`attendance-kit-stack.test.ts`)
- **Accountスタック** (`attendance-kit-account-stack.test.ts`)

個別のConstructクラス（例：`cost-budget.test.ts`）はスナップショット対象外です。

## 権限

- `contents: write` - スナップショットファイルのコミット・プッシュに必要
- `pull-requests: write` - PRへのコメント投稿に必要

## 注意事項

⚠️ スナップショットの自動更新後は、変更内容が意図したものであることを必ず確認してください。

- CloudFormationテンプレートの差分を確認
- 予期しないリソースの追加・削除・変更がないかチェック
- セキュリティ設定の変更に注意

## 関連ファイル

- [update-cdk-snapshots.yml](./update-cdk-snapshots.yml) - ワークフロー定義
- [attendance-kit-stack.test.ts](../../infrastructure/deploy/test/attendance-kit-stack.test.ts) - Dev/Stagingスタックテスト
- [attendance-kit-account-stack.test.ts](../../infrastructure/deploy/test/attendance-kit-account-stack.test.ts) - Accountスタックテスト
