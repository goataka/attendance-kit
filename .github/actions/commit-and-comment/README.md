# commit-and-comment

ファイルの変更を検出し、変更がある場合にコミットしてPRにコメントを投稿する再利用可能なアクションです。

## 使用方法

```yaml
- uses: ./.github/actions/commit-and-comment
  with:
    files: 'path/to/files/'
    commit-message: 'コミットメッセージ'
    pr-comment: 'PRに投稿するコメント'
    github-token: ${{ github.token }}
```

## 入力パラメータ

| パラメータ | 必須 | 説明 |
|-----------|------|------|
| `files` | ✓ | コミット対象のファイルパス |
| `commit-message` | ✓ | コミットメッセージ |
| `pr-comment` | ✓ | PRに投稿するコメントのプレフィックス |
| `github-token` | ✓ | GitHub API認証用トークン |

## 動作

1. 指定されたファイルの変更を検出
2. 変更がある場合、指定されたコミットメッセージでコミット
3. PRにコミットへのリンクを含むコメントを投稿
4. 変更がない場合は何もしない
