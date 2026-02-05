#!/bin/bash
# エージェントセッション完了報告をPRにコメントとして投稿するスクリプト

set -euo pipefail

# 関数定義

# PR番号を取得する関数
get_pr_number() {
  local branch_name="${1:?Branch name is required}"
  local repo="${GITHUB_REPOSITORY:-goataka/attendance-kit}"
  
  # GitHub CLIを使用してPR番号を取得
  local pr_number
  pr_number=$(gh pr list \
    --repo "${repo}" \
    --head "${branch_name}" \
    --state open \
    --json number \
    --jq '.[0].number' 2>/dev/null || echo "")
  
  if [[ -z "${pr_number}" ]]; then
    echo "Error: PR not found for branch '${branch_name}'" >&2
    return 1
  fi
  
  echo "${pr_number}"
}

# PRにコメントを投稿する関数
post_pr_comment() {
  local pr_number="${1:?PR number is required}"
  local comment_body="${2:?Comment body is required}"
  local repo="${GITHUB_REPOSITORY:-goataka/attendance-kit}"
  
  # GitHub CLIを使用してコメントを投稿
  gh pr comment "${pr_number}" \
    --repo "${repo}" \
    --body "${comment_body}"
}

# メイン関数
main() {
  local branch_name="${1:-}"
  local comment_body="${2:-}"
  
  # 引数チェック
  if [[ -z "${branch_name}" ]]; then
    branch_name=$(git branch --show-current)
    if [[ -z "${branch_name}" ]]; then
      echo "Error: Could not determine current branch" >&2
      exit 1
    fi
  fi
  
  if [[ -z "${comment_body}" ]]; then
    echo "Error: Comment body is required" >&2
    echo "Usage: $0 [branch_name] <comment_body>" >&2
    exit 1
  fi
  
  # GH_TOKEN環境変数の確認
  if [[ -z "${GH_TOKEN:-}" ]] && [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "Error: GH_TOKEN or GITHUB_TOKEN environment variable is required" >&2
    echo "Set GH_TOKEN to use GitHub CLI" >&2
    exit 1
  fi
  
  # GH_TOKENが設定されていない場合、GITHUB_TOKENを使用
  if [[ -z "${GH_TOKEN:-}" ]]; then
    export GH_TOKEN="${GITHUB_TOKEN}"
  fi
  
  # PR番号を取得
  echo "Getting PR number for branch '${branch_name}'..."
  local pr_number
  pr_number=$(get_pr_number "${branch_name}")
  
  echo "Found PR #${pr_number}"
  
  # コメントを投稿
  echo "Posting comment to PR #${pr_number}..."
  post_pr_comment "${pr_number}" "${comment_body}"
  
  echo "Comment posted successfully!"
}

# スクリプトが直接実行された場合のみmainを呼び出す
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
