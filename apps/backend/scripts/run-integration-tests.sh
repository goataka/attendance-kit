#!/bin/bash
set -euo pipefail

# Backend integration tests script
# This script runs integration tests
# Assumes LocalStack, infrastructure, and backend build are already done

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== Backend Integration Tests ==="
echo "Backend directory: ${BACKEND_DIR}"
echo ""

cd "${BACKEND_DIR}"

# Load environment variables from .env if it exists
if [ -f ".env" ]; then
  echo "==> Loading environment variables from .env..."
  set -a
  source .env
  set +a
fi

# Check LocalStack availability
echo "==> Checking LocalStack availability..."
if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
  echo "❌ Error: LocalStack is not running on localhost:4566"
  echo "Please ensure infrastructure setup has been completed first"
  exit 1
fi

# Display test environment
echo "==> Test environment:"
echo "  DYNAMODB_ENDPOINT: ${DYNAMODB_ENDPOINT:-not set}"
echo "  DYNAMODB_TABLE_NAME: ${DYNAMODB_TABLE_NAME:-not set}"
echo "  USE_LOCALSTACK: ${USE_LOCALSTACK:-not set}"
echo ""

# Run integration tests
echo "==> Running integration tests..."
npm run test:integration

echo "✅ Backend integration tests completed successfully"
