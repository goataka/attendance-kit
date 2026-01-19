#!/bin/bash
set -euo pipefail

# DynamoDB Stack LocalStackデプロイスクリプト
# LocalStackにDynamoDB Stackのみをデプロイする

main() {
  local -r repo_root="${1:?Repository root is required}"

  local -r infra_dir="${repo_root}/infrastructure/deploy"

  echo "=== DynamoDB Stack LocalStackデプロイ ==="
  
  cd "${infra_dir}"
  
  echo "==> CDK Bootstrap実行..."
  cdklocal bootstrap aws://000000000000/ap-northeast-1 --force
  
  # LocalStackがbootstrapリソースを永続化するまで待機
  echo "==> Bootstrap完了待機..."
  sleep 3
  
  echo "==> CDK Synth DynamoDB Stack実行..."
  cdklocal synth AttendanceKit-test-DynamoDB --context stack=dynamodb --context environment=test
  
  echo "==> CDK Deploy DynamoDB Stack実行..."
  cdklocal deploy AttendanceKit-test-DynamoDB \
    --context stack=dynamodb \
    --context environment=test \
    --require-approval never \
    --no-previous-parameters
  
  echo "✅ DynamoDB Stackのデプロイが完了しました"
}

main "${@}"
