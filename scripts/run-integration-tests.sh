#!/bin/bash
set -euo pipefail

# Integration test orchestrator script
# This script coordinates backend and infrastructure integration tests
# by calling their respective scripts in the correct order

# Get repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/apps/backend"
INFRA_DIR="${REPO_ROOT}/infrastructure/deploy"

echo "=== Integration Test Orchestrator ==="
echo "Repository root: ${REPO_ROOT}"
echo ""

# Export environment variables for child scripts
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-ap-northeast-1}"
export CDK_DEFAULT_ACCOUNT="${CDK_DEFAULT_ACCOUNT:-000000000000}"
export CDK_DEFAULT_REGION="${CDK_DEFAULT_REGION:-ap-northeast-1}"
export USE_LOCALSTACK="${USE_LOCALSTACK:-true}"
export DYNAMODB_TABLE_NAME="${DYNAMODB_TABLE_NAME:-attendance-kit-test-clock}"
export DYNAMODB_ENDPOINT="${DYNAMODB_ENDPOINT:-http://localhost:4566}"
export JWT_SECRET="${JWT_SECRET:-test-secret-key}"

main() {
  echo "=== Phase 1: Infrastructure Setup and Deployment ==="
  "${INFRA_DIR}/scripts/run-integration-tests.sh"
  echo ""
  
  echo "=== Phase 2: Backend Integration Tests ==="
  "${BACKEND_DIR}/scripts/run-integration-tests.sh"
  echo ""
  
  echo "=== Integration Test Summary ==="
  echo "✅ Infrastructure deployed"
  echo "✅ Backend integration tests passed"
  echo ""
  echo "🎉 All integration tests completed successfully!"
}

main
