#!/bin/bash
set -euo pipefail

# LocalStack準備完了待機スクリプト
# LocalStackのヘルスチェックエンドポイントを監視し、DynamoDBサービスが利用可能になるまで待機する

main() {
  echo "LocalStackの準備完了を待機中..."
  
  for i in {1..60}; do
    if curl --silent http://localhost:4566/_localstack/health | grep --quiet '"dynamodb"'; then
      echo "LocalStackが準備完了しました"
      return 0
    fi
    sleep 2
  done
  
  echo "エラー: LocalStackが120秒以内に起動しませんでした" >&2
  exit 1
}

main
