#!/bin/bash
set -euo pipefail

cleanup() {
  npm run localstack:stop
}

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r infra_dir="$(cd "${script_dir}/.." && pwd)"

  trap cleanup EXIT

  cd "${infra_dir}"
  
  npm ci
  npm install --global aws-cdk-local aws-cdk
  npm run build
  
  # プレースホルダーを作成（CDKがLambdaアセットを参照するため）
  if [ ! -d "../../apps/backend/dist" ]; then
    mkdir -p ../../apps/backend/dist
    echo '// Placeholder for CDK tests' > ../../apps/backend/dist/lambda.js
  fi
  
  npm run localstack:start
  npm run localstack:wait
  npm run localstack:deploy
}

main
