# GitHub Actions ワークフロー

## ワークフロー一覧

| ワークフロー | 説明 | トリガー |
|-------------|------|---------|
| [premerge.yml](./premerge.yml) | PR時のテストとチェック | PR作成・更新時 |
| [deploy-environment-stack.yml](./deploy-environment-stack.yml) | 環境スタックデプロイ | mainマージ時/手動 |
| [deploy-account-stack.yml](./deploy-account-stack.yml) | アカウントスタックデプロイ | mainマージ時/手動 |

詳細は各ワークフローのドキュメントを参照してください。
