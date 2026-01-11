#!/bin/bash

# Build script for backend deployment
# This script builds the NestJS backend and prepares it for Lambda deployment

set -e

echo "🔨 Building backend for Lambda deployment..."

# Navigate to backend directory
cd "$(dirname "$0")/../apps/backend"

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
