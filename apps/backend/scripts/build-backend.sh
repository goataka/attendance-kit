#!/bin/bash

# Build script for backend deployment
# This script builds the NestJS backend and prepares it for Lambda deployment

set -e

echo "🔨 Building backend for Lambda deployment..."

# Get the script directory and navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️  Building application..."
npm run build

# Copy node_modules to dist for Lambda (excluding dev dependencies)
echo "📋 Preparing Lambda package..."
cd dist
# Lambda needs production dependencies
cp -r ../node_modules .

echo "✅ Backend build complete!"
echo "📂 Lambda package ready at: apps/backend/dist"
