# 勤怠管理キット

このプロジェクトはエージェントのみで構築する勤怠管理システムです。

## 🌏 言語ポリシー

- **仕様書・要件定義**: 日本語
- **コード・技術文書**: 英語
- **コミュニケーション**: 日本語

詳細は [.github/copilot-instructions.md](.github/copilot-instructions.md) を参照してください。

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
├── turbo.json         # Turborepo設定
└── README.md          # このファイル
```

## 📦 モノレポ構成

このプロジェクトは **npm workspaces** と **Turborepo** を使用したモノレポ構成です。

### Turborepoの利点

- **高速なビルド**: タスクの並列実行とインクリメンタルビルド
- **スマートキャッシング**: 変更されていないタスクは再実行されません
- **依存関係の自動解決**: パッケージ間の依存関係を自動的に処理

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

### Turborepoの使用

Turborepoを使用することで、変更されたパッケージのみが再ビルドされ、キャッシュされた結果が利用されます。

```bash
# キャッシュの効果を確認
npm run build  # 初回実行
npm run build  # 2回目はキャッシュから実行（高速）

# 特定のパッケージのみ実行
npm run build -- --filter=@attendance-kit/frontend

# キャッシュをクリア
npx turbo clean
```

**設定ファイル**:
- `turbo.json`: Turborepoの設定（タスクの依存関係、キャッシュルール）
- `package.json`: packageManager フィールドで npm のバージョンを指定


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

## 🚀 開発環境セットアップ

このプロジェクトでは、DevContainerを使用した一貫性のある開発環境を提供します。

### DevContainerの使用（推奨）

**VS Codeでの使用**:

1. VS Codeで開く
2. コマンドパレット: "Dev Containers: Reopen in Container"
3. コンテナが起動し、開発環境が自動的にセットアップされます

**GitHub Copilot Coding Agentでの使用**:

エージェントは `.devcontainer/devcontainer.json` の設定を参照し、自動的に同じ環境を構築します。

### 自動セットアップの内容

`.devcontainer/devcontainer.json` により：

- ✅ Node.js 24
- ✅ VS Code extensions (Copilot)
- ✅ 必要な環境変数とPATH設定

## 📝 ドキュメント

- [Copilotインストラクション](.github/copilot-instructions.md): GitHub Copilotの使用ガイドライン
- ドキュメント: `docs/`ディレクトリに配置

## 🔮 今後の開発

勤怠管理キットの主要機能：
- 出退勤記録
- 休暇申請と承認
- 勤怠データの集計とレポート
- ユーザー管理

## 🤝 貢献

プロジェクトのガイドラインに従って開発を進めてください。