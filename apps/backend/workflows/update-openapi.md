# Update OpenAPI ワークフロー

OpenAPI仕様書を自動生成・更新するコンポジットアクション。

## 概要

このワークフローは、NestJSのコードからOpenAPI 3.0仕様書を自動生成し、変更があればコミット・プッシュしてPRにコメントを投稿します。

## 使用方法

### 基本的な使用

```yaml
- name: Update OpenAPI Documentation
  uses: ./apps/backend/workflows/update-openapi.yml
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### カスタムNode.jsバージョンの指定

```yaml
- name: Update OpenAPI Documentation
  uses: ./apps/backend/workflows/update-openapi.yml
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    node-version: '20'
```

## 入力パラメータ

| パラメータ | 必須 | デフォルト | 説明 |
|-----------|------|-----------|------|
| `github-token` | ✅ | - | GitHub認証トークン（`${{ secrets.GITHUB_TOKEN }}`） |
| `node-version` | ❌ | `'22'` | 使用するNode.jsのバージョン |

## 実行内容

このワークフローは以下のステップを実行します:

1. **Node.js環境のセットアップ**
   - 指定されたバージョンのNode.jsをセットアップ
   - npmキャッシュを有効化

2. **依存関係のインストール**
   - ルートディレクトリで`npm ci`を実行
   - バックエンドディレクトリで`npm ci`を実行

3. **OpenAPI仕様書の生成**
   - `apps/backend/scripts/generate-openapi.sh`を実行
   - NestJSコードから`apps/backend/api/openapi.json`を生成

4. **変更の検出**
   - `git diff`で`openapi.json`の変更を確認
   - 変更があるかどうかを判定

5. **コミット・プッシュ（変更がある場合のみ）**
   - Git設定（ユーザー名、メールアドレス）
   - 変更をステージング
   - コミットメッセージ: `"docs: OpenAPI仕様を自動更新"`
   - リモートにプッシュ

6. **PRコメント投稿（変更がある場合のみ）**
   - GitHub APIを使用してPRにコメントを投稿
   - 変更内容へのリンクを含む

7. **結果メッセージ**
   - 変更がない場合: "✅ OpenAPI仕様に変更はありません。"

## 呼び出し元ワークフロー

このコンポジットアクションは以下のワークフローから呼び出されます:

- **backend-pr.yml**: バックエンドのPull Request時に実行
  - トリガー: `apps/backend/**` の変更
  - 実行内容: このコンポジットアクションを呼び出してOpenAPI仕様を更新

## ローカルでのテスト

コンポジットアクションで実行されるスクリプトは、ローカル環境でも実行できます:

```bash
# バックエンドディレクトリに移動
cd apps/backend

# 依存関係のインストール（初回のみ）
npm ci

# OpenAPI仕様書の生成
bash scripts/generate-openapi.sh
```

生成された仕様書は `apps/backend/api/openapi.json` に保存されます。

## 生成されるファイル

- **出力ファイル**: `apps/backend/api/openapi.json`
- **形式**: OpenAPI 3.0
- **内容**: 
  - APIエンドポイント定義
  - リクエスト/レスポンススキーマ
  - 認証要件
  - タグとメタデータ

## トラブルシューティング

### ワークフローが失敗する場合

1. **依存関係のインストールエラー**
   - `package-lock.json`が最新か確認
   - Node.jsバージョンが互換性があるか確認

2. **OpenAPI生成エラー**
   - NestJSコードの構文エラーをチェック
   - Swaggerデコレータが正しく設定されているか確認

3. **Git操作エラー**
   - ブランチの権限を確認
   - `GITHUB_TOKEN`が正しく渡されているか確認

### デバッグ方法

ローカルで生成スクリプトを実行して、エラーメッセージを確認:

```bash
cd apps/backend
npm ci
npm run generate:openapi
```

## 関連ファイル

- **ワークフロー定義**: `apps/backend/workflows/update-openapi.yml`（このファイル）
- **生成スクリプト**: `apps/backend/scripts/generate-openapi.sh`
- **生成ロジック**: `apps/backend/src/generate-openapi.ts`
- **出力ファイル**: `apps/backend/api/openapi.json`
- **呼び出し元**: `.github/workflows/backend-pr.yml`

## 参考資料

- [GitHub Actions - Creating a composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.0)
- [NestJS OpenAPI (Swagger)](https://docs.nestjs.com/openapi/introduction)
- [Backend Scripts Documentation](../scripts/README.md)
