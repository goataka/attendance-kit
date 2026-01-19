#!/bin/bash
set -euo pipefail

# LocalStack起動スクリプト
# infrastructureディレクトリのdocker-composeを使用してLocalStackを起動し、準備完了まで待機する

main() {
  local -r repo_root="${1:?Repository root is required}"

  local -r localstack_dir="${repo_root}/infrastructure/deploy/localstack"

  echo "=== LocalStack起動 ==="
  
  cd "${localstack_dir}"
  docker compose up --detach
  
  echo "==> LocalStackの準備完了を待機中..."
  for i in {1..60}; do
    if curl --silent http://localhost:4566/_localstack/health | grep --quiet '"dynamodb"'; then
      echo "✅ LocalStackが準備完了しました"
      curl --silent http://localhost:4566/_localstack/health | jq '.' || true
      return 0
    fi
    echo "待機中... (${i}/60)"
    sleep 2
  done
  
  echo "❌ エラー: LocalStackが120秒以内に起動しませんでした"
  docker compose logs
  exit 1
}

main "${@}"
