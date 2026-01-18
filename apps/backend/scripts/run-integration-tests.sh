#!/bin/bash
set -euo pipefail

# Integration tests with LocalStack
echo "==> Loading environment variables..."
if [ -f ".env" ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "==> Checking LocalStack availability..."
if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
  echo "Error: LocalStack is not running on localhost:4566"
  echo "Please start LocalStack first: npm run localstack:start"
  exit 1
fi

echo "==> Running integration tests..."
npm run test:integration

echo "✅ Integration tests completed successfully"
