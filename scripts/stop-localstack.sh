#!/bin/bash
set -euo pipefail

# LocalStack停止スクリプト
# infrastructureディレクトリのdocker-composeを使用してLocalStackを停止する

main() {
  local -r repo_root="${1:?Repository root is required}"

  local -r localstack_dir="${repo_root}/infrastructure/deploy/localstack"

  echo "=== LocalStack停止 ==="
  
  cd "${localstack_dir}"
  docker compose down || true
  
  echo "✅ LocalStackを停止しました"
}

main "${@}"
