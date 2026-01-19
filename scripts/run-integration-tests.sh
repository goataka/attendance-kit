#!/bin/bash
set -euo pipefail

# Ensure cleanup runs on exit
cleanup() {
  local -r repo_root="${1}"
  
  "${repo_root}/scripts/stop-localstack.sh" "${repo_root}"
}

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r repo_root="$(cd "${script_dir}/.." && pwd)"
  local -r backend_dir="${repo_root}/apps/backend"
  local -r infra_dir="${repo_root}/infrastructure/deploy"

  # Set trap for cleanup
  trap "cleanup ${repo_root}" EXIT

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

  echo "=== Phase 0: Dependencies Installation ==="
  cd "${repo_root}"
  echo "==> Installing dependencies..."
  npm ci
  echo "✅ Dependencies installed"
  echo ""

  echo "=== Phase 1: Build ==="
  cd "${repo_root}"
  echo "==> Building all workspaces..."
  npm run build --workspaces --if-present
  echo "✅ Build completed"
  echo ""

  echo "=== Phase 2: Infrastructure Setup ==="
  echo "==> Installing infrastructure dependencies..."
  cd "${infra_dir}"
  npm ci
  
  echo "==> Installing CDK tools globally..."
  npm install --global aws-cdk-local aws-cdk
  
  echo "==> Environment variables:"
  echo "  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-not set}"
  echo "  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-not set}"
  echo "  AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION:-not set}"
  echo "  CDK_DEFAULT_ACCOUNT: ${CDK_DEFAULT_ACCOUNT:-not set}"
  echo "  CDK_DEFAULT_REGION: ${CDK_DEFAULT_REGION:-not set}"
  echo "  NODE_VERSION: $(node --version)"
  echo "  NPM_VERSION: $(npm --version)"
  echo ""
  
  echo "==> Starting LocalStack..."
  "${repo_root}/scripts/start-localstack.sh" "${repo_root}"
  echo ""
  
  echo "==> Deploying DynamoDB Stack..."
  "${infra_dir}/scripts/deploy-dynamodb-localstack.sh" "${repo_root}"
  echo "✅ Infrastructure setup completed"
  echo ""
  
  echo "=== Phase 3: Backend Integration Tests ==="
  "${backend_dir}/scripts/run-integration-tests.sh"
  echo ""
  
  echo "=== Integration Test Summary ==="
  echo "✅ Dependencies installed"
  echo "✅ All workspaces built"
  echo "✅ Infrastructure deployed"
  echo "✅ Backend integration tests passed"
  echo ""
  echo "🎉 All integration tests completed successfully!"
}

main
