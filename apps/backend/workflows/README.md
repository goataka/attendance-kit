# Backend Workflows

このディレクトリは、バックエンドに関連するGitHub Actionsワークフローのドキュメントと参照を提供します。

## 実際のワークフローファイル

GitHub Actionsの仕様により、ワークフローファイルは `.github/workflows/` ディレクトリに配置する必要があります。
バックエンド関連のワークフローは以下の場所にあります:

### Reusable Workflow (再利用可能なワークフロー)

- **場所**: `/.github/workflows/backend-update-openapi.yml`
- **目的**: OpenAPI仕様書の自動生成・更新ロジック
- **呼び出し元**: `/.github/workflows/update-openapi.yml`

### Caller Workflow (呼び出し元ワークフロー)

- **場所**: `/.github/workflows/update-openapi.yml`
- **目的**: PR時にバックエンドコード変更を検知してOpenAPI更新を実行
- **トリガー**: Pull Request (apps/backend/src/** または apps/backend/package.json の変更時)

## ワークフローの構造

```
.github/workflows/
├── update-openapi.yml              # 呼び出し元（トリガー定義）
└── backend-update-openapi.yml      # 再利用可能なワークフロー（実装）

apps/backend/
├── scripts/
│   └── generate-openapi.sh         # OpenAPI生成スクリプト
└── workflows/
    └── README.md                   # このファイル
```

## ワークフローの実行内容

1. リポジトリのチェックアウト
2. Node.js 22のセットアップ
3. 依存関係のインストール
4. OpenAPI仕様書の生成（`generate-openapi.sh`を実行）
5. 変更の検出
6. 変更があればコミット＆プッシュ
7. PRにコメントを投稿

## ローカルでのテスト

ワークフローで実行されるスクリプトは、ローカルでも実行できます:

```bash
cd apps/backend
npm ci
bash scripts/generate-openapi.sh
```

## 参考資料

- [GitHub Actions - Reusing workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Backend Scripts Documentation](../scripts/README.md)
