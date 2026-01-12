#!/bin/bash
set -e

# LocalStack validation script for CDK deployment
# This script performs LocalStack startup, setup, CDK deployment, integration tests, and shutdown

echo "=== Starting LocalStack CDK Validation ==="

# Function to cleanup LocalStack on exit
cleanup() {
  echo "=== Stopping LocalStack ==="
  npm run localstack:stop || true
  echo "✅ LocalStack stopped"
}

# Ensure LocalStack is stopped even if script fails
trap cleanup EXIT

# Start LocalStack
echo "=== Starting LocalStack ==="
npm run localstack:start

# Environment variables for LocalStack
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="ap-northeast-1"
export AWS_ENDPOINT_URL="http://localhost:4566"
export LOCALSTACK_HOSTNAME="localhost"
export CDK_DEFAULT_ACCOUNT="000000000000"
export CDK_DEFAULT_REGION="ap-northeast-1"

# Wait for LocalStack to be ready
echo "=== Waiting for LocalStack to be ready ==="
timeout 60 bash -c 'until curl -s http://localhost:4566/_localstack/health | grep -q "\"dynamodb\": \"available\""; do sleep 2; done'
echo "✅ LocalStack is ready!"

# Display environment variables for debugging
echo "=== Environment Variables ==="
echo "AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}"
echo "AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}"
echo "AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION}"
echo "CDK_DEFAULT_ACCOUNT: ${CDK_DEFAULT_ACCOUNT}"
echo "CDK_DEFAULT_REGION: ${CDK_DEFAULT_REGION}"
echo "NODE_VERSION: $(node --version)"
echo "NPM_VERSION: $(npm --version)"

echo "=== LocalStack Health Check ==="
curl -s http://localhost:4566/_localstack/health | jq '.' || echo "Failed to get health status"

# CDK Bootstrap
echo "=== CDK Bootstrap ==="
npm run localstack:bootstrap

# CDK Synth
echo "=== CDK Synth ==="
npm run localstack:synth

# CDK Deploy
echo "=== CDK Deploy to LocalStack ==="
npm run localstack:deploy

# Run integration tests
echo "=== Running DynamoDB Integration Tests ==="
npm run test:integration

echo "=== LocalStack CDK Validation Completed Successfully ==="
