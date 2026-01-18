#!/bin/bash
set -euo pipefail

# LocalStackにDynamoDBテーブルをデプロイ

echo "==> Checking LocalStack availability..."
if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
  echo "Error: LocalStack is not running on localhost:4566"
  echo "Please start LocalStack first"
  exit 1
fi

echo "==> Bootstrapping CDK for LocalStack..."
cdklocal bootstrap aws://000000000000/ap-northeast-1

echo "==> Deploying DynamoDB stack to LocalStack..."
cdklocal deploy AttendanceKit-test-DynamoDB \
  --context stack=dynamodb \
  --context environment=test \
  --require-approval never

echo "✅ DynamoDB deployed to LocalStack successfully"
echo ""
echo "Table Name: attendance-kit-test-clock"
echo "LocalStack Endpoint: http://localhost:4566"
