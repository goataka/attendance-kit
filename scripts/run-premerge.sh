#!/bin/bash

# Script to run premerge GitHub Actions workflow locally using act
# This allows developers and agents to test workflows before pushing

set -e

echo "🚀 Running premerge workflow locally with act..."
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ Error: 'act' is not installed"
    echo "Please install act: https://github.com/nektos/act#installation"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

# Run the premerge workflow
# -j test: Run only the 'test' job
# --pull=false: Use cached Docker images
# -W: Specify workflow file
echo "Running workflow: .github/workflows/premerge.yml"
echo "Job: test"
echo ""

act pull_request \
    -j test \
    -W .github/workflows/premerge.yml \
    --pull=false \
    "$@"

echo ""
echo "✅ Premerge workflow completed"
