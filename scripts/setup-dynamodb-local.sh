#!/bin/bash

# LocalStack DynamoDB テーブルセットアップスクリプト

set -e

ENDPOINT_URL="http://localhost:4566"
REGION="ap-northeast-1"
TABLE_NAME="AttendanceRecords-Local"

echo "🚀 Setting up DynamoDB table in LocalStack..."

# テーブルが既に存在するかチェック
if aws dynamodb describe-table \
  --table-name "$TABLE_NAME" \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$REGION" \
  --no-cli-pager \
  2>/dev/null; then
  echo "✅ Table '$TABLE_NAME' already exists"
else
  echo "📝 Creating table '$TABLE_NAME'..."
  
  # テーブル作成
  aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions \
      AttributeName=userId,AttributeType=S \
      AttributeName=timestamp,AttributeType=S \
      AttributeName=date,AttributeType=S \
    --key-schema \
      AttributeName=userId,KeyType=HASH \
      AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes \
      "[
        {
          \"IndexName\": \"DateIndex\",
          \"KeySchema\": [
            {\"AttributeName\": \"date\", \"KeyType\": \"HASH\"},
            {\"AttributeName\": \"timestamp\", \"KeyType\": \"RANGE\"}
          ],
          \"Projection\": {
            \"ProjectionType\": \"ALL\"
          }
        }
      ]" \
    --endpoint-url "$ENDPOINT_URL" \
    --region "$REGION" \
    --no-cli-pager
  
  echo "✅ Table '$TABLE_NAME' created successfully"
fi

echo ""
echo "📊 Table description:"
aws dynamodb describe-table \
  --table-name "$TABLE_NAME" \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$REGION" \
  --no-cli-pager \
  --query 'Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount,GSI:GlobalSecondaryIndexes[0].IndexName}'

echo ""
echo "✅ DynamoDB setup complete!"
echo "   Table name: $TABLE_NAME"
echo "   Endpoint: $ENDPOINT_URL"
echo "   Region: $REGION"
echo ""
echo "💡 Set environment variable for backend:"
echo "   export DYNAMODB_TABLE_NAME=$TABLE_NAME"
echo "   export AWS_ENDPOINT_URL=$ENDPOINT_URL"
