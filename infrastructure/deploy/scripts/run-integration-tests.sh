#!/bin/bash
set -euo pipefail

# Infrastructure Integration Tests
# LocalStackを使用してDynamoDB Stackをデプロイし、動作を検証する

# Ensure cleanup runs on exit
cleanup() {
  local -r repo_root="${1}"
  
  "${repo_root}/scripts/stop-localstack.sh" "${repo_root}"
}

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r infra_dir="$(cd "${script_dir}/.." && pwd)"
  local -r repo_root="$(cd "${infra_dir}/../.." && pwd)"

  # Set trap for cleanup
  trap "cleanup ${repo_root}" EXIT

  echo "=== Infrastructure Integration Setup ==="
  echo "Infrastructure directory: ${infra_dir}"
  echo ""

  show_environment() {
    echo "==> Environment variables:"
    echo "  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-not set}"
    echo "  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-not set}"
    echo "  AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION:-not set}"
    echo "  CDK_DEFAULT_ACCOUNT: ${CDK_DEFAULT_ACCOUNT:-not set}"
    echo "  CDK_DEFAULT_REGION: ${CDK_DEFAULT_REGION:-not set}"
    echo "  NODE_VERSION: $(node --version)"
    echo "  NPM_VERSION: $(npm --version)"
    echo ""
  }

  install_dependencies() {
    echo "==> Installing infrastructure dependencies..."
    cd "${infra_dir}"
    npm ci
    
    echo "==> Installing CDK tools globally..."
    npm install --global aws-cdk-local aws-cdk
    
    echo "✅ Infrastructure dependencies installed"
  }

  echo "==> Starting LocalStack..."
  "${repo_root}/scripts/start-localstack.sh" "${repo_root}"
  echo ""
  
  install_dependencies
  show_environment
  
  echo "==> Deploying DynamoDB Stack..."
  "${infra_dir}/scripts/deploy-dynamodb-localstack.sh" "${repo_root}"
  
  echo ""
  echo "✅ Infrastructure setup completed successfully"
  echo "Note: LocalStack will remain running for subsequent tests"
}

main
