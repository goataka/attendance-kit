#!/bin/bash
set -euo pipefail

# LocalStack validation script for CDK deployment
# This script performs LocalStack startup, setup, CDK deployment, integration tests, and shutdown

cleanup() {
  echo "=== Stopping LocalStack ==="
  npm run localstack:stop || true
  echo "✅ LocalStack stopped"
}

wait_localstack() {
  echo "=== Waiting for LocalStack to be ready ==="
  curl --silent --fail http://localhost:4566/_localstack/health \
    --retry 30 --retry-delay 2 --retry-all-errors | grep --quiet "available"
  echo "✅ LocalStack is ready!"
}

show_environment() {
  echo "=== Environment Variables ==="
  echo "AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}"
  echo "AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}"
  echo "AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION}"
  echo "NODE_VERSION: $(node --version)"
  echo "NPM_VERSION: $(npm --version)"
  
  echo "=== LocalStack Health Check ==="
  curl --silent http://localhost:4566/_localstack/health | jq '.' || echo "Failed to get health status"
}

run_cdk_operations() {
  echo "=== CDK Bootstrap ==="
  npm run localstack:bootstrap
  
  echo "=== CDK Synth ==="
  npm run localstack:synth
  
  echo "=== CDK Deploy to LocalStack ==="
  npm run localstack:deploy
}

run_integration_tests() {
  echo "=== Running DynamoDB Integration Tests ==="
  npm run test:integration
}

main() {
  echo "=== Starting LocalStack CDK Validation ==="
  
  # Ensure LocalStack is stopped even if script fails
  trap cleanup EXIT
  
  # Start LocalStack
  echo "=== Starting LocalStack ==="
  npm run localstack:start
  
  # Set minimal required environment variables
  export AWS_ACCESS_KEY_ID="test"
  export AWS_SECRET_ACCESS_KEY="test"
  export AWS_DEFAULT_REGION="ap-northeast-1"
  
  wait_localstack
  show_environment
  run_cdk_operations
  run_integration_tests
  
  echo "=== LocalStack CDK Validation Completed Successfully ==="
}

main
