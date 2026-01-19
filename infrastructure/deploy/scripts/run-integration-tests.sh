#!/bin/bash
set -euo pipefail

# Infrastructure integration tests script
# This script handles LocalStack startup, dependency installation, and CDK deployment
# It does NOT run backend tests - those are handled by the backend script

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOCALSTACK_DIR="${INFRA_DIR}/localstack"

echo "=== Infrastructure Integration Setup ==="
echo "Infrastructure directory: ${INFRA_DIR}"
echo ""

cleanup() {
  echo "=== Stopping LocalStack ==="
  (cd "${LOCALSTACK_DIR}" && docker compose down) || true
  echo "✅ LocalStack stopped"
}

# Ensure cleanup runs on exit
trap cleanup EXIT

start_localstack() {
  echo "==> Starting LocalStack..."
  cd "${LOCALSTACK_DIR}"
  docker compose up -d
  
  echo "==> Waiting for LocalStack to be ready..."
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
  echo "==> Installing infrastructure dependencies..."
  cd "${INFRA_DIR}"
  npm ci
  
  echo "==> Installing CDK tools globally..."
  npm install -g aws-cdk-local aws-cdk
  
  echo "✅ Infrastructure dependencies installed"
}

show_environment() {
  echo "==> Environment variables:"
  echo "  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-not set}"
  echo "  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-not set}"
  echo "  AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION:-not set}"
  echo "  CDK_DEFAULT_ACCOUNT: ${CDK_DEFAULT_ACCOUNT:-not set}"
  echo "  CDK_DEFAULT_REGION: ${CDK_DEFAULT_REGION:-not set}"
  echo "  NODE_VERSION: $(node --version)"
  echo "  NPM_VERSION: $(npm --version)"
  echo ""
}

deploy_cdk() {
  echo "==> CDK Bootstrap..."
  cd "${INFRA_DIR}"
  cdklocal bootstrap aws://000000000000/ap-northeast-1 --force
  
  # Wait for LocalStack to persist bootstrap resources
  echo "==> Waiting for bootstrap to complete..."
  sleep 3
  
  echo "==> CDK Synth DynamoDB Stack..."
  cdklocal synth AttendanceKit-test-DynamoDB --context stack=dynamodb --context environment=test
  
  echo "==> CDK Deploy DynamoDB Stack..."
  cdklocal deploy AttendanceKit-test-DynamoDB \
    --context stack=dynamodb \
    --context environment=test \
    --require-approval never \
    --no-previous-parameters
  
  echo "✅ Infrastructure deployed"
}

main() {
  start_localstack
  install_dependencies
  show_environment
  deploy_cdk
  
  echo ""
  echo "✅ Infrastructure setup completed successfully"
  echo "Note: LocalStack will remain running for subsequent tests"
}

main
