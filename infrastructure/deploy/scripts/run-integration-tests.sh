#!/bin/bash
set -euo pipefail

# Infrastructure Integration Tests
# LocalStackを使用してDynamoDB Stackをデプロイし、動作を検証する

cleanup() {
  local -r repo_root="${1}"
  
  cd "${repo_root}"
  npm run localstack:stop --workspace=attendance-kit-infrastructure
}

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r infra_dir="$(cd "${script_dir}/.." && pwd)"
  local -r repo_root="$(cd "${infra_dir}/../.." && pwd)"

  trap "cleanup ${repo_root}" EXIT

  cd "${repo_root}"
  
  npm ci --workspace=attendance-kit-infrastructure
  npm install --global aws-cdk-local aws-cdk
  
  npm run localstack:start --workspace=attendance-kit-infrastructure
  npm run localstack:wait --workspace=attendance-kit-infrastructure
  
  "${infra_dir}/scripts/deploy-dynamodb-localstack.sh" "${repo_root}"
}

main
