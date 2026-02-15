# GitHub Actions ワークフロー

## ワークフロー一覧

| ワークフロー                                                   | 説明                                           | トリガー                |
| -------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| [premerge.yml](./premerge.yml)                                 | PR時のテストとチェック                         | PR作成・更新時          |
| [pr-e2e-test.yml](./pr-e2e-test.yml)                           | PR環境デプロイとE2Eテスト                      | PR作成・更新時          |
| [pr-cleanup.yml](./pr-cleanup.yml)                             | PR環境クリーンアップ                           | PRクローズ時            |
| [deploy-environment-stack.yml](./deploy-environment-stack.yml) | 環境スタックデプロイ                           | mainマージ時/手動       |
| [deploy-account-stack.yml](./deploy-account-stack.yml)         | アカウントスタックデプロイ                     | mainマージ時/手動       |
| [copilot-setup-steps.yml](./copilot-setup-steps.yml)           | Copilotセットアップ検証                        | 手動/ワークフロー変更時 |

## E2Eテスト実行環境

E2Eテストは実際のAWS環境にデプロイして実行されます:

- **PR環境**: PR作成時に個別の環境（`pr-123`形式）がデプロイされ、その環境に対してE2Eテストが実行されます
  - デプロイとテスト実行: [pr-e2e-test.yml](./pr-e2e-test.yml)
  - PRクローズ時に自動クリーンアップ: [pr-cleanup.yml](./pr-cleanup.yml)

- **Eva環境**: mainブランチマージ後、eva環境に対してE2Eテストが実行されます
  - デプロイとテスト実行: [deploy-environment-stack.yml](./deploy-environment-stack.yml)

## 必須設定

### GitHub Secrets

デプロイワークフローには以下のSecretsが必要です:

- `AWS_ROLE_TO_ASSUME`: デプロイに使用するIAMロールのARN
- `COST_ALERT_EMAIL`: コストアラート通知先メールアドレス
- `JWT_SECRET`: バックエンドAPIのJWT認証シークレットキー

### AWS調査用Role（オプション）

- `AWS_INVESTIGATION_ROLE_ARN`: GitHub Copilot Agent用の調査用Role ARN
  - 設定されている場合、AWS認証と接続確認を実行
  - 設定されていない場合、警告メッセージを表示して続行
  - 権限: `ReadOnlyAccess`（AWSマネージドポリシー）

## エラー時の自動対応

デプロイが失敗した場合、以下の対応が自動的に実行されます:

- PRへのコメント投稿
- Issueの自動作成（`bug`および`deploy-error`ラベル付き、Copilotがアサイン）

## セキュリティ考慮事項

- 認証情報の詳細（Account ID、Role ARNなど）は標準出力に出力しません
- AWS接続の成功/失敗のみを確認します
