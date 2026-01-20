#!/bin/bash
set -euo pipefail

# DynamoDB Stack LocalStackデプロイスクリプト
# LocalStackにDynamoDB Stackのみをデプロイする

main() {
  npm run localstack:bootstrap
  npm run localstack:synth
  npm run localstack:deploy-stack
}

main "${@}"
