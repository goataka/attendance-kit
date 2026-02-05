# エージェントセッション完了報告スクリプト

エージェントセッション完了時にPRへコメントを投稿するスクリプトです。

## 概要

`post-agent-session-comment.sh`は、GitHub CLIを使用してPRにコメントを投稿するヘルパースクリプトです。エージェントがタスク完了時に結果報告をPRにコメントとして投稿する際に使用します。

## 前提条件

- GitHub CLI (`gh`) がインストールされていること
- `GH_TOKEN`または`GITHUB_TOKEN`環境変数が設定されていること
- 対象ブランチに紐づくオープンなPRが存在すること

## 使用方法

### 基本的な使用方法

```bash
# 現在のブランチのPRにコメントを投稿
GH_TOKEN="${GITHUB_TOKEN}" .github/scripts/post-agent-session-comment.sh "$(git branch --show-current)" "コメント本文"
```

### コメント本文をファイルから読み込む

```bash
# コメント本文を事前にファイルに保存
cat > /tmp/comment.md << 'EOF'
## エージェントセッション完了報告

### 実施内容
タスクXを完了しました。

### 検証結果
- ✅ `npm run build`: 成功
- ✅ `npm test`: 成功
EOF

# ファイルからコメントを読み込んで投稿
GH_TOKEN="${GITHUB_TOKEN}" .github/scripts/post-agent-session-comment.sh "$(git branch --show-current)" "$(cat /tmp/comment.md)"
```

### 引数

1. **ブランチ名** (省略可): PRを検索するブランチ名。省略した場合は現在のブランチを使用します。
2. **コメント本文** (必須): PRに投稿するコメントの本文。Markdown形式で記述できます。

## エラーメッセージ

- `Error: PR not found for branch 'xxx'`: 指定したブランチに紐づくオープンなPRが見つかりません
- `Error: Comment body is required`: コメント本文が指定されていません
- `Error: GH_TOKEN or GITHUB_TOKEN environment variable is required`: 環境変数が設定されていません

## 使用例

### GitHub Actions環境での使用

```yaml
- name: エージェントセッション完了報告をPRにコメント
  env:
    GH_TOKEN: ${{ github.token }}
  run: |
    .github/scripts/post-agent-session-comment.sh \
      "${{ github.head_ref }}" \
      "$(cat << 'EOF'
    ## エージェントセッション完了報告
    
    ### 実施内容
    タスクを完了しました。
    
    ### 検証結果
    - ✅ 全てのテストが成功
    EOF
    )"
```

### エージェントセッション内での使用

エージェントは、タスク完了時に以下の手順でPRコメントを投稿します:

1. コメント本文を作成（カスタムインストラクションのフォーマットに従う）
2. `/tmp`ディレクトリにコメント本文を保存
3. スクリプトを実行してPRにコメントを投稿

```bash
# コメント本文を作成
cat > /tmp/agent-session-comment.md << 'EOF'
## エージェントセッション完了報告

### 実施内容
...

### スキル利用状況
...

### 検証結果
...

### 変更の影響範囲
...

### PR差分
...
EOF

# PRにコメントを投稿
GH_TOKEN="${GITHUB_TOKEN}" .github/scripts/post-agent-session-comment.sh \
  "$(git branch --show-current)" \
  "$(cat /tmp/agent-session-comment.md)"
```

## 関連ドキュメント

- [カスタムインストラクション](../copilot-instructions.md) - エージェントセッション完了報告の詳細
