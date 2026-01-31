# デプロイメント

## 自動デプロイ

### 環境スタック

`apps/`または`infrastructure/deploy/`配下の対象ファイルを変更し`main`ブランチにマージすると、GitHub Actionsが自動的にdev環境にデプロイします（`apps/website`は対象外）。

### アカウントスタック

コストアラート関連ファイルを変更し`main`ブランチにマージすると、自動的にデプロイされます。

**前提**: GitHub Secretsに `COST_ALERT_EMAIL` が設定されていること

## 手動デプロイ

### 環境スタック

```bash
cd infrastructure/deploy
npm install && npm run build && npm test
ENVIRONMENT=dev npx cdk deploy AttendanceKit-Dev-Stack
```

または、GitHub Actionsの "Deploy Environment Stack to AWS" を手動実行

### アカウントスタック

```bash
cd infrastructure/account
COST_ALERT_EMAIL=your-email@example.com npx cdk deploy
```

または、GitHub Actionsの "Deploy Account Stack to AWS" を手動実行

#### デプロイ後

SNSサブスクリプション確認メールが届くので、リンクをクリックして確認してください。
