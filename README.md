# 勤怠管理キット

このプロジェクトは、[spec-kit](https://github.com/github/spec-kit)を使用した仕様駆動開発により構築される勤怠管理キットです。

## 🌏 言語ポリシー

- **仕様書・要件定義**: 日本語
- **コード・技術文書**: 英語
- **コミュニケーション**: 日本語

詳細は [memory/constitution.md](memory/constitution.md) を参照してください。

## 🏗️ プロジェクト構造

```
.
├── .devcontainer/     # DevContainer設定
│   ├── devcontainer.json
│   └── README.md
├── .github/
│   ├── skills/        # GitHub Copilot Agent Skills定義
│   └── workflows/
│       ├── copilot-setup-steps.yml  # 自動セットアップ
│       └── premerge.yml             # PR時のCI/CD
├── .specify/          # spec-kit設定とテンプレート
│   └── templates/     # ドキュメントテンプレート
├── apps/              # アプリケーション（npmワークスペース）
│   ├── frontend/      # フロントエンドアプリケーション
│   ├── backend/       # バックエンドアプリケーション
│   └── website/       # Webサイト
├── memory/            # プロジェクト憲法と記憶
├── scripts/           # 開発・CI/CD支援スクリプト
├── specs/             # 機能仕様書（ブランチごと）
├── docs/              # 確定した仕様と実装ドキュメント
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

GitHub ActionsのPremergeワークフローをローカル環境で実行できます。これにより、プルリクエストを作成する前にCI/CDチェックをテストできます。

**推奨方法**:
```bash
npm run premerge:local
```

このコマンドは、`.github/workflows/premerge.yml` ワークフローを実行します。SSL証明書の検証を無効化することで、証明書エラーを回避しています。

**必要条件**:
- Docker が起動していること
- [act](https://github.com/nektos/act) がインストールされていること

**actのインストール**:
```bash
# Linux/macOS
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Homebrew
brew install act
```

**詳細なセットアップ手順**: [scripts/SETUP.md](scripts/SETUP.md) を参照してください。

**人間による手動設定が必要な項目**:
- Dockerイメージの選択（`.actrc` で設定、デフォルトは `catthehacker/ubuntu:act-latest`）
- 企業プロキシ環境での追加ネットワーク設定
- シークレットや環境変数の設定（必要な場合）

**注意**: `.actrc` で `NODE_TLS_REJECT_UNAUTHORIZED=0` を設定してSSL証明書の検証を無効化しています。これは開発環境専用の設定です。

詳細は [scripts/README.md](scripts/README.md) と [scripts/SETUP.md](scripts/SETUP.md) を参照してください。

### 個別アプリケーションでのコマンド実行

```bash
# 特定のワークスペースでコマンド実行
npm run dev -w @attendance-kit/frontend
npm run build -w @attendance-kit/backend
npm test -w @attendance-kit/website
```

## 🤖 GitHub Copilot Agent Skills

このプロジェクトは、GitHub Copilot Agentが使用できるスキルを定義しています。

### 利用可能なスキル

#### premerge-check

プレマージワークフローをローカルで実行してCI/CDチェックを行うスキルです。

**使用方法**:
```bash
npm run premerge:local
```

**スキルの詳細**: [.github/skills/premerge-check/SKILL.md](.github/skills/premerge-check/SKILL.md)

すべてのスキルの一覧と詳細は [.github/skills/README.md](.github/skills/README.md) を参照してください。

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
- ✅ Node.js 22+ (モノレポ開発用)

### 手動セットアップ（非推奨）

DevContainerを使わずにローカル環境で開発する場合：

#### 前提条件

- Python 3.11+
- Node.js 22+
- npm 8+
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

# Install npm dependencies
npm install
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

- [憲法](memory/constitution.md): プロジェクトの原則とガイドライン
- 仕様書: `specs/`ディレクトリに機能ごとに作成
- 実装文書: `docs/`ディレクトリに確定版を保存

## 🔮 今後の開発

勤怠管理キットの主要機能：
- 出退勤記録
- 休暇申請と承認
- 勤怠データの集計とレポート
- ユーザー管理

これらの機能は、spec-kitのワークフローに従って順次実装していきます。

## 📚 リソース

- [Spec-Kit Official Documentation](https://github.com/github/spec-kit)
- [Spec-Kit Website](https://speckit.org/)
- [GitHub Blog: Spec-driven Development](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

## 🤝 貢献

プロジェクト憲法に従って開発を進めてください。