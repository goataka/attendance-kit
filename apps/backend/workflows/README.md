# Backend Workflows

このディレクトリには、バックエンドに関連するGitHub Actionsの**コンポジットアクション**が含まれています。

## コンポジットアクション

### update-openapi

OpenAPI仕様書を自動生成・更新するコンポジットアクション。

**場所**: `./update-openapi/action.yml`

**使用方法**:
```yaml
- name: Update OpenAPI Documentation
  uses: ./apps/backend/workflows/update-openapi
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    node-version: '22'  # オプション
```

**実行内容**:
1. Node.js環境のセットアップ
2. 依存関係のインストール
3. OpenAPI仕様書の生成（`generate-openapi.sh`を実行）
4. 変更の検出とコミット
5. PRへのコメント投稿

## 実際のワークフロー

コンポジットアクションは以下のワークフローから呼び出されます:

### Backend PR Workflow

- **場所**: `/.github/workflows/backend-pr.yml`
- **目的**: バックエンドのPRで実行される自動チェック
- **トリガー**: Pull Request (apps/backend/** の変更時)
- **実行内容**:
  - OpenAPI仕様書の自動更新

## ワークフロー構造

```
.github/workflows/
└── backend-pr.yml                  # バックエンドPRワークフロー

apps/backend/workflows/
├── README.md                       # このファイル
└── update-openapi/
    └── action.yml                  # OpenAPI更新コンポジットアクション
```

## ローカルでのテスト

コンポジットアクションで実行されるスクリプトは、ローカルでも実行できます:

```bash
cd apps/backend
npm ci
bash scripts/generate-openapi.sh
```

## 参考資料

- [GitHub Actions - Creating a composite action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Backend Scripts Documentation](../scripts/README.md)
