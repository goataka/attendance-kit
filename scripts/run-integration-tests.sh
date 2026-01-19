#!/bin/bash
set -euo pipefail

main() {
  # Get repository root
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local repo_root="$(cd "${script_dir}/.." && pwd)"
  local backend_dir="${repo_root}/apps/backend"
  local infra_dir="${repo_root}/infrastructure/deploy"

  echo "=== Integration Test Orchestrator ==="
  echo "Repository root: ${repo_root}"
  echo ""

  # Export environment variables for child scripts
  export AWS_ACCESS_KEY_ID="test"
  export AWS_SECRET_ACCESS_KEY="test"
  export AWS_DEFAULT_REGION="ap-northeast-1"
  export CDK_DEFAULT_ACCOUNT="000000000000"
  export CDK_DEFAULT_REGION="ap-northeast-1"
  export USE_LOCALSTACK="true"
  export DYNAMODB_TABLE_NAME="attendance-kit-test-clock"
  export DYNAMODB_ENDPOINT="http://localhost:4566"
  export JWT_SECRET="test-secret-key"

  echo "=== Phase 1: Infrastructure Setup and Deployment ==="
  "${infra_dir}/scripts/run-integration-tests.sh"
  echo ""
  
  echo "=== Phase 2: Backend Integration Tests ==="
  "${backend_dir}/scripts/run-integration-tests.sh"
  echo ""
  
  echo "=== Integration Test Summary ==="
  echo "✅ Infrastructure deployed"
  echo "✅ Backend integration tests passed"
  echo ""
  echo "🎉 All integration tests completed successfully!"
}

main
