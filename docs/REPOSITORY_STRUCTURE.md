# リポジトリ構成

このドキュメントは、attendance-kitリポジトリの構成と各ディレクトリの役割を説明します。

## ディレクトリ構造

```
attendance-kit/
├── .devcontainer/          # DevContainer設定
│   ├── devcontainer.json
│   └── README.md
├── .github/                # GitHub設定
│   ├── agents/            # カスタムエージェント設定
│   └── workflows/         # GitHub Actionsワークフロー
├── .specify/              # spec-kit設定
│   └── templates/         # ドキュメントテンプレート
├── apps/                  # アプリケーション
│   ├── frontend/          # フロントエンドアプリ（React）
│   └── backend/           # バックエンドアプリ（NestJS）
├── apps/site/                 # 静的サイト
│   └── site/   # 製品サポートサイト（Astro + Starlight）
├── packages/              # 共通パッケージ
│   ├── types/            # 共通型定義
│   └── config/           # 共通設定
├── infrastructure/        # インフラストラクチャ
│   ├── deploy/           # AWS CDKデプロイコード
│   └── setup/            # セットアップスクリプト
├── specs/                 # 機能仕様書（開発中）
├── docs/                  # 確定仕様・実装ドキュメント
│   ├── architecture/     # アーキテクチャ設計
│   └── business/         # ビジネス要件
├── memory/                # プロジェクト憲法と記憶
├── package.json           # ルートpackage.json（workspaces設定）
├── tsconfig.json          # ベースTypeScript設定
└── README.md              # プロジェクト概要
```

## ディレクトリの詳細

### `.devcontainer/`

DevContainerの設定ファイルを格納。VS CodeとGitHub Copilot Coding Agentで一貫した開発環境を提供。

**主要ファイル**:
- `devcontainer.json`: コンテナ設定、拡張機能、postCreateCommand

### `.github/`

GitHub関連の設定を格納。

**サブディレクトリ**:
- `agents/`: カスタムエージェントの設定とガイドライン
- `workflows/`: CI/CDワークフロー定義

### `.specify/`

spec-kitの設定とテンプレートを格納。

**サブディレクトリ**:
- `templates/`: 仕様書、計画書、タスクのテンプレート

### `apps/`

アプリケーション本体を格納するモノレポのアプリディレクトリ。

#### `apps/frontend/`

React + Vite + TypeScriptで構築されたフロントエンドアプリケーション。

**技術スタック**:
- React 18
- TypeScript 5
- Vite 5

**主要ディレクトリ**:
- `src/components/`: UIコンポーネント
- `src/services/`: API通信サービス
- `public/`: 静的ファイル

**ビルド成果物**: `dist/`

#### `apps/backend/`

NestJS + TypeScriptで構築されたバックエンドアプリケーション。

**技術スタック**:
- NestJS 10
- TypeScript 5
- Express

**主要ディレクトリ**:
- `src/clock/`: 打刻機能モジュール
  - `clock.controller.ts`: APIコントローラー
  - `clock.service.ts`: ビジネスロジック
  - `clock.module.ts`: モジュール定義

**ビルド成果物**: `dist/`

### `apps/site/`

静的サイトを格納するディレクトリ。

#### `apps/site/site/`

Astro + Starlightで構築された製品サポートサイト。

**技術スタック**:
- Astro 4
- Starlight
- Markdown

**主要ディレクトリ**:
- `src/content/docs/`: Markdownコンテンツ
- `src/styles/`: カスタムスタイル
- `public/`: 静的アセット

**ビルド成果物**: `dist/`

### `packages/`

ワークスペース間で共有する共通パッケージを格納。

#### `packages/types/`

TypeScript型定義を提供する共有パッケージ。

**主要な型**:
- `ClockRecord`: 打刻記録
- `User`: ユーザー情報
- `ApiResponse<T>`: API共通レスポンス
- `ClockInRequest`, `ClockOutRequest`: リクエスト型

**エクスポート**: `src/index.ts`

#### `packages/config/`

Viteなどのビルドツール設定を提供する共有パッケージ。

**主要ファイル**:
- `vite.config.base.ts`: ベースVite設定

### `infrastructure/`

AWSインフラストラクチャのコードと設定を格納。

#### `infrastructure/deploy/`

AWS CDKによるインフラデプロイコード。

**主要ファイル**:
- `lib/`: CDKスタック定義
- `bin/`: CDKアプリエントリーポイント

#### `infrastructure/setup/`

インフラセットアップスクリプト。

### `specs/`

開発中の機能仕様書を格納。ブランチごとに管理。

**構成**:
```
specs/
└── {feature-number}-{feature-name}/
    ├── spec.md      # 機能仕様
    ├── plan.md      # 技術計画
    ├── tasks.md     # 実装タスク
    └── implement.md # 実装ログ（任意）
```

### `docs/`

確定した仕様と実装ドキュメントを格納。

#### `docs/architecture/`

アーキテクチャ設計ドキュメント。

**例**:
- システム構成図
- API設計
- データベース設計
- デプロイ戦略

#### `docs/business/`

ビジネス要件ドキュメント。

**例**:
- ユースケース
- ドメインモデル
- ビジネスルール

### `memory/`

プロジェクト憲法と組織的な記憶を格納。

**主要ファイル**:
- `constitution.md`: プロジェクト憲法（原則、ポリシー）

## パッケージ管理

### npm workspaces

このプロジェクトはnpm workspacesを使用してモノレポを管理しています。

**ワークスペース定義** (`package.json`):
```json
{
  "workspaces": [
    "apps/*",
    "apps/site/*",
    "packages/*"
  ]
}
```

**利点**:
- 依存関係の一元管理
- パッケージ間の相互参照が容易
- ビルドキャッシュの共有
- 効率的な開発ワークフロー

### 共通依存関係

共通で使用する依存関係はルート`package.json`で管理し、各パッケージ固有の依存関係は個別の`package.json`で管理します。

## ビルドとデプロイ

### 開発

```bash
# すべての開発サーバーを起動
npm run dev

# 個別起動
npm run dev:frontend
npm run dev:backend
npm run dev:site
```

### ビルド

```bash
# すべてをビルド
npm run build

# 個別ビルド
npm run build:frontend
npm run build:backend
npm run build:site
```

### ビルド成果物の配置

| パッケージ | ビルド成果物 | デプロイ先 |
|----------|------------|-----------|
| frontend | `apps/frontend/dist/` | CloudFront + S3 |
| backend | `apps/backend/dist/` | API Gateway + Lambda |
| site | `apps/site/site/dist/` | CloudFront + S3 |

## 開発ワークフロー

### 1. 機能開発

1. 仕様書作成: `/specify <機能の説明>`
2. 技術計画: `/plan`
3. タスク分解: `/tasks`
4. 実装: `/implement`

### 2. コードレビュー

- Pull Requestでレビュー
- コードレビューツールによる自動レビュー
- CodeQLによるセキュリティスキャン

### 3. デプロイ

- mainブランチへのマージで自動デプロイ（将来実装）
- AWS CDKによるインフラ管理

## 規約

### コーディング規約

- **言語**: TypeScript
- **スタイル**: ESLint（将来追加）
- **フォーマット**: Prettier（将来追加）

### ドキュメント規約

- **言語**: 日本語（仕様書・要件）、英語（コード・技術文書）
- **形式**: Markdown
- **図表**: Mermaid

### コミット規約

- **言語**: 日本語
- **形式**: 簡潔な説明（50文字以内推奨）

### 参照

- [アーキテクチャ仕様](architecture/attendance-kit-architecture.md)
- [ローカル開発環境](LOCAL_DEVELOPMENT.md)
- [メインREADME](../README.md)
- [プロジェクト憲法](../memory/constitution.md)
