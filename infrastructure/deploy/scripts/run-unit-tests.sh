#!/bin/bash
set -euo pipefail

# Common test script for CDK workflows
# This script installs dependencies, builds TypeScript, and runs unit tests

echo "==> Installing dependencies..."
npm ci

echo "==> Building TypeScript..."
npm run build

echo "==> Ensuring backend dist exists for CDK tests..."
# プレースホルダーを作成（CDKがLambdaアセットを参照するため）
# Note: 実際のビルドプロセスではバックエンドビルドが先に実行される
if [ ! -d "../../apps/backend/dist" ]; then
  mkdir -p ../../apps/backend/dist
  echo '// Placeholder for CDK tests' > ../../apps/backend/dist/lambda.js
fi

echo "==> Running unit tests (excluding integration tests)..."
npm run test:unit

echo "✅ Tests completed successfully"
