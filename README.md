# 勤怠管理キット

このプロジェクトはエージェントのみで構築する勤怠管理システムです。

## 🌏 言語ポリシー

- **仕様書・要件定義**: 日本語
- **コード・技術文書**: 英語
- **コミュニケーション**: 日本語

詳細は [Copilotインストラクション](.github/copilot-instructions.md) を参照してください。

## 🏗️ プロジェクト構造

```
.
├── .devcontainer/     # DevContainer設定
│   └── devcontainer.json
├── .github/
│   ├── skills/        # GitHub Copilot Agent Skills定義
│   └── workflows/
│       └── premerge.yml             # PR時のCI/CD
├── apps/              # アプリケーション（npmワークスペース）
│   ├── frontend/      # フロントエンドアプリケーション
│   ├── backend/       # バックエンドアプリケーション
│   └── website/       # Webサイト
├── scripts/           # 開発・CI/CD支援スクリプト
├── docs/              # ドキュメント
├── infrastructure/    # インフラストラクチャコード
├── package.json       # モノレポルート設定
└── README.md          # このファイル
```

## 📦 モノレポ構成

このプロジェクトは **npm workspaces** を使用したモノレポ構成です。

### アプリケーション

- **@attendance-kit/frontend**: フロントエンドアプリケーション
- **@attendance-kit/backend**: バックエンドアプリケーション
- **@attendance-kit/website**: Webサイト

### 共通コマンド

```bash
# 依存関係のインストール
npm install

# 全アプリケーションの開発サーバー起動
npm run dev

# 全アプリケーションのビルド
npm run build

# 全アプリケーションのテスト実行
npm test

# 全アプリケーションのLintチェック
npm run lint

# プレマージワークフローのローカル実行
npm run premerge:local
```

### プレマージワークフローのローカル実行

プルリクエスト作成前にCI/CDチェックを実行できます。

```bash
npm run premerge:local
```

**必要条件**:
- Docker が起動していること
- [act](https://github.com/nektos/act) がインストールされていること（`brew install act` または [公式サイト](https://github.com/nektos/act)参照）

### 個別アプリケーションでのコマンド実行

```bash
# 特定のワークスペースでコマンド実行
npm run dev -w @attendance-kit/frontend
npm run build -w @attendance-kit/backend
npm test -w @attendance-kit/website
```

## 🤖 GitHub Copilot Agent Skills

このプロジェクトは、GitHub Copilot Agentが使用できるスキルを定義しています。詳細は [.github/skills/README.md](.github/skills/README.md) を参照してください。

## 🚀 開発環境セットアップ

DevContainerを使用した一貫性のある開発環境を提供します。

### DevContainerの使用

VS Codeでコマンドパレットから "Dev Containers: Reopen in Container" を実行してください。以下が自動的にセットアップされます:

- Node.js 24
- VS Code extensions
- 必要な環境変数

## 📝 ドキュメント

- [Copilotインストラクション](.github/copilot-instructions.md)
- [アーキテクチャドキュメント](docs/architecture/README.md)
- [ビジネス仕様](docs/business/README.md)