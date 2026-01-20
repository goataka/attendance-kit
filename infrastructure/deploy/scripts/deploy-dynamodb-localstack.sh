#!/bin/bash
set -euo pipefail

# DynamoDB Stack LocalStackデプロイスクリプト
# LocalStackにDynamoDB Stackのみをデプロイする

main() {
  local -r script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local -r infra_dir="$(cd "${script_dir}/.." && pwd)"

  cd "${infra_dir}"

  npm run localstack:bootstrap
  npm run localstack:synth
  npm run localstack:deploy-stack
}

main "${@}"
