#!/bin/bash
set -euo pipefail

# DynamoDB Stack LocalStackデプロイスクリプト
# LocalStackにDynamoDB Stackのみをデプロイする

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r infra_dir="$(cd "${script_dir}/.." && pwd)"

  cd "${infra_dir}"
  
  cdklocal bootstrap aws://000000000000/ap-northeast-1 --force
  
  # LocalStackがbootstrapリソースを永続化するまで待機
  sleep 3
  
  cdklocal synth AttendanceKit-test-DynamoDB --context stack=dynamodb --context environment=test
  
  cdklocal deploy AttendanceKit-test-DynamoDB \
    --context stack=dynamodb \
    --context environment=test \
    --require-approval never \
    --no-previous-parameters
}

main "${@}"
