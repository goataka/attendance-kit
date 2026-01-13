#!/bin/bash
set -euo pipefail

# Common test script for CDK workflows
# This script installs dependencies, builds TypeScript, and runs unit tests

echo "==> Installing dependencies..."
npm ci

echo "==> Building TypeScript..."
npm run build

echo "==> Running unit tests (excluding integration tests)..."
npm test -- --testPathIgnorePatterns=test/integration

echo "✅ Tests completed successfully"
