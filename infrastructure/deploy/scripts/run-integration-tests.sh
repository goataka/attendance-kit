#!/bin/bash
set -euo pipefail

main() {
  # Get the script directory
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local infra_dir="$(cd "${script_dir}/.." && pwd)"
  local localstack_dir="${infra_dir}/localstack"

  echo "=== Infrastructure Integration Setup ==="
  echo "Infrastructure directory: ${infra_dir}"
  echo ""

  cleanup() {
    echo "=== Stopping LocalStack ==="
    (cd "${localstack_dir}" && docker compose down) || true
    echo "✅ LocalStack stopped"
  }

  # Ensure cleanup runs on exit
  trap cleanup EXIT

  start_localstack() {
    echo "==> Starting LocalStack..."
    cd "${localstack_dir}"
    docker compose up -d
    
    echo "==> Waiting for LocalStack to be ready..."
    for i in {1..60}; do
      if curl -s http://localhost:4566/_localstack/health | grep -q '"dynamodb"'; then
        echo "✅ LocalStack is ready!"
        curl -s http://localhost:4566/_localstack/health | jq '.' || true
        return 0
      fi
      echo "Waiting... ($i/60)"
      sleep 2
    done
    
    echo "❌ Error: LocalStack did not start within 120 seconds"
    docker compose logs
    exit 1
  }

  install_dependencies() {
    echo "==> Installing infrastructure dependencies..."
    cd "${infra_dir}"
    npm ci
    
    echo "==> Installing CDK tools globally..."
    npm install -g aws-cdk-local aws-cdk
    
    echo "✅ Infrastructure dependencies installed"
  }

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

  deploy_cdk() {
    echo "==> CDK Bootstrap..."
    cd "${infra_dir}"
    cdklocal bootstrap aws://000000000000/ap-northeast-1 --force
    
    # Wait for LocalStack to persist bootstrap resources
    echo "==> Waiting for bootstrap to complete..."
    sleep 3
    
    echo "==> CDK Synth DynamoDB Stack..."
    cdklocal synth AttendanceKit-test-DynamoDB --context stack=dynamodb --context environment=test
    
    echo "==> CDK Deploy DynamoDB Stack..."
    cdklocal deploy AttendanceKit-test-DynamoDB \
      --context stack=dynamodb \
      --context environment=test \
      --require-approval never \
      --no-previous-parameters
    
    echo "✅ Infrastructure deployed"
  }

  start_localstack
  install_dependencies
  show_environment
  deploy_cdk
  
  echo ""
  echo "✅ Infrastructure setup completed successfully"
  echo "Note: LocalStack will remain running for subsequent tests"
}

main
