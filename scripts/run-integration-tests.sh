#!/bin/bash
set -euo pipefail

cleanup() {
  local -r repo_root="${1}"
  
  npm run localstack:stop --workspace=attendance-kit-infrastructure
}

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r repo_root="$(cd "${script_dir}/.." && pwd)"
  local -r backend_dir="${repo_root}/apps/backend"

  trap "cleanup ${repo_root}" EXIT

  # Load environment variables from .env.integration-test
  if [ -f "${repo_root}/.env.integration-test" ]; then
    set -a
    source "${repo_root}/.env.integration-test"
    set +a
  fi

  cd "${repo_root}"
  
  npm ci
  npm run build --workspaces --if-present
  
  npm ci --workspace=attendance-kit-infrastructure
  npm install --global aws-cdk-local aws-cdk
  
  npm run localstack:start --workspace=attendance-kit-infrastructure
  npm run localstack:wait --workspace=attendance-kit-infrastructure
  
  "${repo_root}/infrastructure/deploy/scripts/deploy-dynamodb-localstack.sh" "${repo_root}"
  
  "${backend_dir}/scripts/run-integration-tests.sh"
  
  echo "🎉 統合テスト完了"
}

main
