#!/bin/bash
set -euo pipefail

# Ephemeral環境をAWSにデプロイするスクリプト
# CI E2Eテストと同じ方式でローカルからもデプロイ可能

main() {
  local -r environment="${ENVIRONMENT:-local-$(whoami)}"
  local -r aws_region="${AWS_REGION:-ap-northeast-1}"
  
  # JWT_SECRETが設定されているかチェック（値は使用しないが必須）
  : "${JWT_SECRET:?JWT_SECRET environment variable is required}"
  
  echo "🚀 Ephemeral環境のデプロイを開始します"
  echo "  環境名: ${environment}"
  echo "  リージョン: ${aws_region}"
  echo ""
  
  # AWS認証情報の確認
  if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ エラー: AWS認証情報が設定されていません"
    echo ""
    echo "以下のいずれかの方法でAWS認証を設定してください："
    echo "  1. AWS CLI設定: aws configure"
    echo "  2. 環境変数: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
    echo "  3. OIDC (GitHub Actions環境): configure-aws-credentials action"
    exit 1
  fi
  
  local -r account_id="$(aws sts get-caller-identity --query Account --output text)"
  echo "✅ AWS認証確認完了 (Account: ${account_id})"
  echo ""
  
  # CDK Bootstrap
  echo "📦 CDK Bootstrapを実行します（冪等性のある操作）..."
  npx cdk bootstrap "aws://${account_id}/${aws_region}" \
    --context stack=environment
  
  echo ""
  
  # スタック名の生成（PR環境と同じ形式）
  local -r stack_name="AttendanceKit-$(echo "${environment}" | sed 's/-//g' | sed 's/./\U&/')-Stack"
  
  # CDK Deploy
  echo "🏗️  環境スタックをデプロイします: ${stack_name}"
  npx cdk deploy "${stack_name}" \
    --require-approval never \
    --context stack=environment \
    --context environment="${environment}"
  
  echo ""
  echo "✅ デプロイが完了しました！"
  echo ""
  
  # スタック出力を表示
  echo "📋 デプロイ情報:"
  echo "=================="
  
  local -r stack_outputs="$(aws cloudformation describe-stacks \
    --stack-name "${stack_name}" \
    --query 'Stacks[0].Outputs' \
    --output json)"
  
  local -r cloudfront_url="$(echo "${stack_outputs}" | jq -r '.[] | select(.OutputKey | contains("CloudFrontUrl")) | .OutputValue')"
  local -r api_url="$(echo "${stack_outputs}" | jq -r '.[] | select(.OutputKey | contains("ApiUrl")) | .OutputValue')"
  
  if [ -n "${cloudfront_url}" ]; then
    echo "🌐 Frontend URL: ${cloudfront_url}"
  fi
  
  if [ -n "${api_url}" ]; then
    echo "🔌 Backend API URL: ${api_url}"
  fi
  
  echo ""
  echo "💡 E2Eテストを実行するには:"
  echo "   export E2E_ENV=deployed"
  echo "   export FRONTEND_URL=${cloudfront_url}"
  echo "   export BACKEND_URL=${api_url}"
  echo "   export NODE_ENV=${environment}"
  echo "   npm run test:e2e"
  echo ""
  echo "💡 環境を削除するには:"
  echo "   npx cdk destroy ${stack_name} --context stack=environment --context environment=${environment}"
}

main "$@"
