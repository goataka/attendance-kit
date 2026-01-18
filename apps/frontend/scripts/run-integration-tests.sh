#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Running integration tests..."
npm run test:integration

echo "✅ Integration tests passed"
