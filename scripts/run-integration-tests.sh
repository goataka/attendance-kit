#!/bin/bash
set -euo pipefail

cleanup() {
  npm run localstack:stop --workspace=attendance-kit-infrastructure
}

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r repo_root="$(cd "${script_dir}/.." && pwd)"

  trap cleanup EXIT

  if [ -f "${repo_root}/.env.integration-test" ]; then
    set -a
    source "${repo_root}/.env.integration-test"
    set +a
  fi

  cd "${repo_root}"
  
  npm ci
  npm run build --workspaces --if-present
  
  npm install --global aws-cdk-local aws-cdk
  
  npm run localstack:start --workspace=attendance-kit-infrastructure
  npm run localstack:wait --workspace=attendance-kit-infrastructure
  npm run localstack:deploy --workspace=attendance-kit-infrastructure
  
  npm run test:integration --workspace=@attendance-kit/backend
}

main
