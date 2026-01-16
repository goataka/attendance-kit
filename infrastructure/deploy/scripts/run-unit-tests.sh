#!/bin/bash
set -euo pipefail

# Common test script for CDK workflows
# This script installs dependencies, builds TypeScript, and runs unit tests

echo "==> Installing dependencies..."
npm ci

echo "==> Building TypeScript..."
npm run build

echo "==> Creating placeholder backend dist for CDK tests..."
mkdir -p ../../apps/backend/dist
echo '// Placeholder for CDK tests' > ../../apps/backend/dist/lambda.js

echo "==> Running unit tests (excluding integration tests)..."
npm run test:unit

echo "✅ Tests completed successfully"
