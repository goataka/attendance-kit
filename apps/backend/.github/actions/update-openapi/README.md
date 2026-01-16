# Update OpenAPI アクション

OpenAPI仕様書を自動生成・更新するコンポジットアクションです。

## 使用方法

```yaml
- name: Update OpenAPI Documentation
  uses: ./apps/backend/.github/actions/update-openapi
```

## 実行内容

詳細は[action.yml](./action.yml)を参照してください。

主な処理:
1. Node.js 24環境のセットアップ
2. 依存関係のインストール
3. [generate-openapi.sh](../../../scripts/generate-openapi.sh)でOpenAPI仕様書を生成
4. 変更があればコミット・プッシュ・PRコメント投稿

## ローカルでの実行

```bash
# OpenAPI仕様書の生成
bash apps/backend/scripts/generate-openapi.sh
```

詳細は[scripts/README.md](../../../scripts/README.md)を参照してください。

## 呼び出し元

- [.github/workflows/backend-pr.yml](../../../../../.github/workflows/backend-pr.yml)

## 関連ファイル

- [action.yml](./action.yml) - コンポジットアクション定義
- [../../../scripts/generate-openapi.sh](../../../scripts/generate-openapi.sh) - 生成スクリプト
- [../../../src/generate-openapi.ts](../../../src/generate-openapi.ts) - 生成ロジック
- [../../../api/openapi.json](../../../api/openapi.json) - 出力ファイル
