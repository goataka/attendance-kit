# ワークフロー失敗時の自動Issue作成

このワークフローは、他のGitHub Actionsワークフローが失敗した際に、自動的にIssueを作成してCopilotにアサインします。

## トリガー条件

以下のワークフローが完了（`completed`）し、結果が失敗（`failure`）の場合にトリガーされます：

- Copilot Setup Steps
- Deploy Account Stack to AWS
- Deploy Environment Stack to AWS

## 動作の詳細

### 1. ワークフロー情報の取得

失敗したワークフローの以下の情報を取得します：
- ワークフロー名
- 実行番号
- 実行ID
- ブランチ名
- コミットSHA
- ワークフロー実行URL

### 2. 既存Issue確認

同じワークフロー名と実行番号で既にIssueが作成されているか確認します。
これにより、重複したIssueの作成を防ぎます。

### 3. Issue作成またはコメント追加

**新規Issue作成の場合：**
- タイトル: `[Workflow失敗] {ワークフロー名} #{実行番号}`
- ラベル: `bug`, `automated`, `workflow-failure`
- 本文: ワークフロー失敗の詳細情報
- アサイン: Copilot（可能な場合）

**既存Issueがある場合：**
- 既存のIssueにコメントを追加
- 再度の失敗情報を記録

## 自己除外機能

このワークフロー自体は監視対象に含まれていないため、無限ループが発生することはありません。

## 権限

このワークフローには以下の権限が必要です：
- `issues: write` - Issueの作成と編集
- `actions: read` - ワークフロー実行情報の読み取り
- `contents: read` - リポジトリコンテンツの読み取り

## Copilotのアサインについて

Copilotへのアサインは、Copilotがリポジトリにアクセス可能な場合のみ機能します。
アサインに失敗した場合でもワークフローは正常に完了し、Issueは作成されます。

## カスタマイズ

### 監視対象ワークフローの追加

`on.workflow_run.workflows` セクションに監視したいワークフロー名を追加してください：

```yaml
on:
  workflow_run:
    workflows:
      - "Copilot Setup Steps"
      - "Deploy Account Stack to AWS"
      - "Deploy Environment Stack to AWS"
      - "新しいワークフロー名"  # 追加
    types:
      - completed
```

### ラベルのカスタマイズ

Issue作成時のラベルは `--label` オプションで変更できます：

```yaml
--label "bug,automated,workflow-failure,priority-high"
```

## トラブルシューティング

### Issueが作成されない

- ワークフローの権限設定を確認
- `if` 条件が正しく評価されているか確認
- GitHub Actionsの実行ログを確認

### Copilotがアサインされない

- Copilotがリポジトリにアクセス可能か確認
- リポジトリの設定でCopilotが有効になっているか確認
- Issueは作成されているため、手動でアサイン可能

## セキュリティ考慮事項

- `GITHUB_TOKEN` は自動的に提供される一時トークンを使用
- 追加のシークレットは不要
- 書き込み権限は `issues` のみに制限
