#!/bin/bash

# Generate OpenAPI specification
# This script generates the OpenAPI specification from NestJS code

set -e

echo "📝 Generating OpenAPI specification..."

# Get the script directory and navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

# Generate OpenAPI spec
npm run generate:openapi

echo "✅ OpenAPI specification generated!"
echo "📄 Specification available at: apps/backend/api/openapi.json"
