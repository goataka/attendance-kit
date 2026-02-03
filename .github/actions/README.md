# GitHub Actions カスタムアクション

## アクション一覧

| アクション | 説明 |
|----------|------|
| [commit-and-comment](./commit-and-comment) | ファイル変更を検出し、コミットしてPRにコメント投稿 |
| [create-issue-on-failure](./create-issue-on-failure) | ワークフロー失敗時にIssueを自動作成 |
| [comment-on-failure](./comment-on-failure) | ワークフロー失敗時にPRにコメント投稿 |

## 使用上の注意

### create-issue-on-failure使用時の必須設定

このアクションを使用するには、ワークフローの`permissions`に以下を追加する必要があります:

```yaml
permissions:
  id-token: write
  contents: read
  pull-requests: write
  issues: write  # Issue作成に必要
```

また、以下のラベルがリポジトリに存在している必要があります:
- `bug`
- `deploy-error`
