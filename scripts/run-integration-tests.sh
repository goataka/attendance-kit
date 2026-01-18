#!/bin/bash
set -euo pipefail

# Integration test runner script
# This script orchestrates LocalStack startup, CDK deployment, and integration tests

# Get repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/apps/backend"
INFRA_DIR="${REPO_ROOT}/infrastructure/deploy"
LOCALSTACK_DIR="${INFRA_DIR}/localstack"

echo "=== Integration Test Runner ==="
echo "Repository root: ${REPO_ROOT}"
echo "Backend directory: ${BACKEND_DIR}"
echo "Infrastructure directory: ${INFRA_DIR}"
echo ""

cleanup() {
  echo "=== Cleaning up ==="
  if [ -d "${LOCALSTACK_DIR}" ]; then
    (cd "${LOCALSTACK_DIR}" && docker compose down) || true
    echo "✅ LocalStack stopped"
  fi
}

# Ensure cleanup runs on exit
trap cleanup EXIT

start_localstack() {
  echo "=== Starting LocalStack ==="
  cd "${LOCALSTACK_DIR}"
  docker compose up -d
  
  echo "=== Waiting for LocalStack to be ready ==="
  for i in {1..60}; do
    if curl -s http://localhost:4566/_localstack/health | grep -q '"dynamodb"'; then
      echo "✅ LocalStack is ready!"
      curl -s http://localhost:4566/_localstack/health | jq '.' || true
      return 0
    fi
    echo "Waiting... ($i/60)"
    sleep 2
  done
  
  echo "❌ Error: LocalStack did not start within 120 seconds"
  docker compose logs
  exit 1
}

install_dependencies() {
  echo "=== Installing Dependencies ==="
  
  # Install backend dependencies
  echo "Installing backend dependencies..."
  (cd "${BACKEND_DIR}" && npm ci)
  
  # Install infrastructure dependencies
  echo "Installing infrastructure dependencies..."
  (cd "${INFRA_DIR}" && npm ci)
  
  # Install CDK tools globally
  echo "Installing CDK tools..."
  npm install -g aws-cdk-local aws-cdk
  
  echo "✅ Dependencies installed"
}

build_backend() {
  echo "=== Building Backend ==="
  (cd "${BACKEND_DIR}" && npm run build)
  echo "✅ Backend built"
}

deploy_infrastructure() {
  echo "=== Deploying Infrastructure to LocalStack ==="
  
  # Ensure environment variables are set
  export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
  export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
  export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-ap-northeast-1}"
  export CDK_DEFAULT_ACCOUNT="${CDK_DEFAULT_ACCOUNT:-000000000000}"
  export CDK_DEFAULT_REGION="${CDK_DEFAULT_REGION:-ap-northeast-1}"
  
  echo "Environment variables:"
  echo "  AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION}"
  echo "  CDK_DEFAULT_ACCOUNT: ${CDK_DEFAULT_ACCOUNT}"
  echo "  CDK_DEFAULT_REGION: ${CDK_DEFAULT_REGION}"
  
  cd "${INFRA_DIR}"
  
  echo "=== CDK Bootstrap ==="
  cdklocal bootstrap aws://000000000000/ap-northeast-1 --force
  
  # Wait for LocalStack to persist bootstrap resources
  echo "=== Waiting for bootstrap to complete ==="
  sleep 3
  
  echo "=== CDK Synth DynamoDB Stack ==="
  cdklocal synth AttendanceKit-test-DynamoDB --context stack=dynamodb --context environment=test
  
  echo "=== CDK Deploy DynamoDB Stack ==="
  cdklocal deploy AttendanceKit-test-DynamoDB \
    --context stack=dynamodb \
    --context environment=test \
    --require-approval never \
    --no-previous-parameters
  
  echo "✅ Infrastructure deployed"
}

run_integration_tests() {
  echo "=== Running Integration Tests ==="
  
  # Ensure environment variables are set for tests
  export USE_LOCALSTACK="${USE_LOCALSTACK:-true}"
  export DYNAMODB_TABLE_NAME="${DYNAMODB_TABLE_NAME:-attendance-kit-test-clock}"
  export DYNAMODB_ENDPOINT="${DYNAMODB_ENDPOINT:-http://localhost:4566}"
  export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
  export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
  export JWT_SECRET="${JWT_SECRET:-test-secret-key}"
  
  echo "Test environment variables:"
  echo "  USE_LOCALSTACK: ${USE_LOCALSTACK}"
  echo "  DYNAMODB_TABLE_NAME: ${DYNAMODB_TABLE_NAME}"
  echo "  DYNAMODB_ENDPOINT: ${DYNAMODB_ENDPOINT}"
  echo "  JWT_SECRET: [REDACTED]"
  
  (cd "${BACKEND_DIR}" && npm run test:integration)
  
  echo "✅ Integration tests passed"
}

show_summary() {
  echo ""
  echo "=== Integration Test Summary ==="
  echo "✅ LocalStack started"
  echo "✅ Dependencies installed"
  echo "✅ Backend built"
  echo "✅ Infrastructure deployed"
  echo "✅ Integration tests passed"
  echo "✅ Cleanup completed"
  echo ""
  echo "🎉 All integration tests completed successfully!"
}

main() {
  echo "=== Starting Integration Test Workflow ==="
  echo ""
  
  start_localstack
  install_dependencies
  build_backend
  deploy_infrastructure
  run_integration_tests
  show_summary
}

main
