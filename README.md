# 勤怠管理システム

このプロジェクトは、[spec-kit](https://github.com/github/spec-kit)を使用した仕様駆動開発により構築される勤怠管理システムです。

## 🌏 言語ポリシー

- **仕様書・要件定義**: 日本語
- **コード・技術文書**: 英語
- **コミュニケーション**: 日本語

詳細は [memory/constitution.md](memory/constitution.md) を参照してください。

## 🏗️ プロジェクト構造

```
.
├── .devcontainer/      # DevContainer設定
│   ├── devcontainer.json
│   └── README.md
├── .github/            # GitHub設定
│   ├── agents/        # カスタムエージェント設定
│   └── workflows/     # GitHub Actionsワークフロー
├── .specify/           # spec-kit設定とテンプレート
│   └── templates/     # ドキュメントテンプレート
├── apps/               # アプリケーション
│   ├── frontend/      # 勤怠アプリ（React）
│   └── backend/       # 勤怠アプリ（NestJS）
├── apps/site/              # 静的サイト
│   └── site/      # 製品サポートサイト（Astro + Starlight）
├── packages/           # 共通パッケージ
│   ├── types/         # 共通型定義
│   └── config/        # 共通設定
├── infrastructure/     # AWS CDKインフラコード
│   ├── deploy/        # CDKデプロイコード
│   └── setup/         # セットアップスクリプト
├── specs/              # 機能仕様書（ブランチごと）
├── docs/               # 確定した仕様と実装ドキュメント
│   ├── architecture/  # アーキテクチャ設計
│   └── business/      # ビジネス要件
├── memory/             # プロジェクト憲法と記憶
└── README.md           # このファイル
```

## 🚀 Spec-Kit セットアップ

このプロジェクトでは、DevContainerを使用した一貫性のある開発環境を提供します。

### DevContainerの使用（推奨）

**VS Codeでの使用**:

1. VS Codeで開く
2. コマンドパレット: "Dev Containers: Reopen in Container"
3. コンテナが起動し、自動的にspec-kitがセットアップされます

**GitHub Copilot Coding Agentでの使用**:

エージェントは `.devcontainer/devcontainer.json` の設定を参照し、自動的に同じ環境を構築します。

### 自動セットアップの内容

`.devcontainer/devcontainer.json` と `.github/workflows/copilot-setup-steps.yml` により：

- ✅ Python 3.12 with uv (pre-installed Docker image)
- ✅ spec-kit CLI
- ✅ VS Code extensions (Copilot, Python)
- ✅ 必要な環境変数とPATH設定

### 手動セットアップ（非推奨）

DevContainerを使わずにローカル環境でspec-kitを使用する場合：

#### 前提条件

- Python 3.11+
- Git
- uv (Python package manager)

#### インストール

```bash
# Install uv
pip3 install uv

# Install spec-kit
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify installation
specify --help
```

### ワークフローコマンド

このプロジェクトではGitHub Copilot Coding Agent経由で以下のコマンドを使用します：

- `/constitution`: プロジェクト憲法の作成・更新
- `/specify`: 機能仕様の作成
- `/plan`: 技術計画の作成
- `/tasks`: 実装タスクの作成
- `/implement`: タスクの実装

## 📖 仕様駆動開発ワークフロー

### 1. 憲法の確認

プロジェクトの原則とガイドラインを確認：
```
/constitution
```

### 2. 機能仕様の作成

実装したい機能を仕様化：
```
/specify <機能の説明>
```

### 3. 技術計画の作成

仕様に基づいた技術的なアプローチを計画：
```
/plan
```

### 4. タスクの作成

実装可能な作業単位に分解：
```
/tasks
```

### 5. 実装

タスクを実装：
```
/implement
```

## 📝 ドキュメント

- [リポジトリ構成](docs/REPOSITORY_STRUCTURE.md) - ディレクトリ構造と役割
- [アーキテクチャ仕様](docs/architecture/attendance-kit-architecture.md) - システムアーキテクチャと設計
- [ローカル開発環境](docs/LOCAL_DEVELOPMENT.md) - ローカル開発のセットアップ手順
- [デプロイガイド](infrastructure/deploy/DEPLOYMENT.md) - AWS CDKデプロイ手順
- [プロジェクト憲法](memory/constitution.md) - プロジェクトの核心原則

## 🎯 初期セットアップ状況

✅ spec-kit minimal setup completed:
- ✅ uv installed
- ✅ spec-kit CLI installed
- ✅ Directory structure created
- ✅ Constitution with Japanese language support created
- ✅ Templates configured

✅ MVP モノレポ構成 completed:
- ✅ npm workspaces設定
- ✅ 共通型定義パッケージ（@attendance-kit/types）
- ✅ 共通設定パッケージ（@attendance-kit/config）
- ✅ 勤怠アプリ フロントエンド（React + Vite）
- ✅ 勤怠アプリ バックエンド（NestJS）
- ✅ 製品サポートサイト（Astro + Starlight）

## 💻 開発コマンド

### ローカル開発のセットアップ

詳細な手順は [ローカル開発環境セットアップガイド](docs/LOCAL_DEVELOPMENT.md) を参照してください。

#### クイックスタート

```bash
# 1. 依存関係をインストール
npm ci

# 2. LocalStackを起動（DynamoDBローカル環境）
npm run localstack:start

# 3. DynamoDBテーブルを作成
npm run dynamodb:setup

# 4. 開発サーバーを起動
npm run dev
```

アクセス:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Site: http://localhost:4321
- LocalStack: http://localhost:4566

### すべてのアプリを起動

```bash
npm run dev
```

### 個別起動

```bash
# フロントエンド（http://localhost:5173）
npm run dev:frontend

# バックエンド（http://localhost:3000）
npm run dev:backend

# サポートサイト（http://localhost:4321）
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

### LocalStack管理

```bash
npm run localstack:start    # LocalStackを起動
npm run localstack:stop     # LocalStackを停止
npm run localstack:logs     # LocalStackのログを表示
npm run dynamodb:setup      # DynamoDBテーブルを作成
```
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

## 🔮 今後の開発

勤怠管理システムの主要機能：
- 出退勤記録（MVP実装済み）
- 休暇申請と承認
- 勤怠データの集計とレポート
- ユーザー管理と認証
- データベース統合（DynamoDB）
- CI/CDパイプライン

これらの機能は、spec-kitのワークフローに従って順次実装していきます。

## 📚 リソース

- [Spec-Kit Official Documentation](https://github.com/github/spec-kit)
- [Spec-Kit Website](https://speckit.org/)
- [GitHub Blog: Spec-driven Development](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

## 🤝 貢献

プロジェクト憲法に従って開発を進めてください。