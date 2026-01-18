#!/bin/bash
set -euo pipefail

# Run unit tests only
echo "==> Running unit tests..."
npm run test:unit

echo "✅ Unit tests completed successfully"
