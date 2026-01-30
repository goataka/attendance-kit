# create-issue-on-failure

ワークフロー失敗時にGitHub Issueを自動作成し、Copilotをアサインするアクション

## 概要

このアクションは、デプロイワークフローなどが失敗した際に、自動的にGitHub Issueを作成します。作成されるIssueには以下の情報が含まれます：

- ワークフロー名
- 失敗したワークフローのURL
- コミットSHA
- 発生日時
- Copilotへの対応依頼

また、Issueには自動的に以下のラベルが付与され、Copilotがアサインされます：

- `bug`
- `deploy-error`

## 使用方法

```yaml
- name: Create issue on failure
  if: failure()
  uses: ./.github/actions/create-issue-on-failure
  with:
    workflow-name: 'Deploy Environment Stack'
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 入力パラメータ

| パラメータ | 必須 | 説明 |
|----------|------|------|
| `workflow-name` | ✅ | ワークフロー名（Issueタイトルと本文に使用） |
| `github-token` | ✅ | GitHub token（Issue作成に必要） |

## 出力

このアクションは出力パラメータを持ちません。

## 機能

### Issue作成

ワークフロー失敗時に以下の形式でIssueを作成します：

**Issueタイトル**: `⚠️ [ワークフロー名] デプロイエラー`

**Issue本文**:
```
## ワークフローエラー

ワークフロー **[ワークフロー名]** が失敗しました。

### 詳細情報

- **ワークフローURL**: [ワークフローURL]
- **コミットSHA**: [コミットSHA]
- **発生日時**: [UTC時刻]

### 対応依頼

このエラーを調査し、修正を試みてください。
ワークフローのログを確認して、エラーの原因を特定してください。

---

@copilot workflow-error-handlerスキルを使用してエラー対応を行ってください。
```

### ラベルとアサイン

- **ラベル**: `bug`, `deploy-error`
- **アサイン**: `copilot`

## 使用例

このアクションは現在、以下のワークフローで使用されています：

- `deploy-account-stack.yml` - アカウントスタックのデプロイ失敗時
- `deploy-environment-stack.yml` - 環境スタックのデプロイ失敗時

## 注意事項

- このアクションは `failure()` 条件と組み合わせて使用する必要があります
- `github-token` には Issue 作成権限が必要です
- Copilotユーザーがリポジトリにアクセス可能である必要があります

## 関連アクション

- [comment-on-failure](../comment-on-failure/README.md) - ワークフロー失敗時にPRにコメントを投稿するアクション（併用可能）
