#!/bin/bash
set -euo pipefail

# Lambda関数の環境変数を確認するスクリプト
# デプロイされたLambda関数の設定を取得し、JWT_SECRETが正しく設定されているか検証します

main() {
  local environment="${1:-dev}"
  local function_name="attendance-kit-${environment}-api"
  
  echo "Checking Lambda function: ${function_name}"
  echo ""
  
  # Lambda関数の設定を取得
  echo "Function configuration:"
  aws lambda get-function-configuration \
    --function-name "${function_name}" \
    --query '{FunctionName:FunctionName,Runtime:Runtime,LastModified:LastModified}' \
    --output json
  
  echo ""
  echo "Environment variables:"
  aws lambda get-function-configuration \
    --function-name "${function_name}" \
    --query 'Environment.Variables' \
    --output json
  
  echo ""
  echo "Checking JWT_SECRET..."
  local jwt_secret_value
  jwt_secret_value=$(aws lambda get-function-configuration \
    --function-name "${function_name}" \
    --query 'Environment.Variables.JWT_SECRET' \
    --output text)
  
  # AWS CLIのtext出力では、null値は "None" という文字列で表現される
  if [ "${jwt_secret_value}" = "None" ] || [ -z "${jwt_secret_value}" ]; then
    echo "❌ JWT_SECRET is not set"
  else
    local jwt_secret_length=${#jwt_secret_value}
    echo "✓ JWT_SECRET is set (length: ${jwt_secret_length} characters)"
    
    # 空白のみかチェック
    if [[ "${jwt_secret_value}" =~ ^[[:space:]]*$ ]]; then
      echo "⚠️  WARNING: JWT_SECRET contains only whitespace"
    fi
  fi
}

main "$@"
