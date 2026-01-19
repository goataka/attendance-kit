# Scripts

このディレクトリには、開発とCI/CDプロセスをサポートするスクリプトが含まれています。

## Integration Tests

### 概要

統合テストを実行するためのスクリプトです。LocalStackを使用してAWSサービスをエミュレートし、アプリケーション全体の動作を検証します。

### スクリプト一覧

#### run-integration-tests.sh

メインの統合テストオーケストレータスクリプトです。以下の処理を順次実行します:

1. 依存関係のインストール
2. 全ワークスペースのビルド
3. LocalStackの起動と待機
4. DynamoDBデプロイ
5. バックエンド統合テスト実行

**使用方法:**
```bash
./scripts/run-integration-tests.sh
```

**環境変数:**
`.env.integration-test` ファイルで設定を管理

### 必要条件

- Docker が起動していること
- Node.js 24以上
- npm 10以上

## プレマージワークフローのローカル実行

### 概要

GitHub ActionsのPremergeワークフローをローカル環境で実行するためのスクリプトです。
[act](https://github.com/nektos/act)を使用して、プルリクエスト前にワークフローをテストできます。

### 必要条件

- Docker が起動していること
- act がインストールされていること

### actのインストール

```bash
# Linux/macOS
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Homebrew
brew install act

# Windows (Chocolatey)
choco install act-cli
```

### 使用方法

#### npmスクリプトから実行

```bash
npm run premerge:local
```

#### 直接実行

```bash
./scripts/run-premerge.sh
```

### 実行内容

スクリプトは `.github/workflows/premerge.yml` で定義された以下のステップを実行します:

1. コードのチェックアウト
2. Node.js 22のセットアップ
3. 依存関係のインストール (`npm ci`)
4. Lint実行 (`npm run lint`)
5. テスト実行 (`npm run test`)
6. ビルド実行 (`npm run build`)

### エージェントの使用

GitHub Copilot Agentは、このスクリプトを使用してプルリクエスト前にワークフローを検証できます:

```bash
npm run premerge:local
```

### トラブルシューティング

#### Dockerが起動していない

```
❌ Error: Docker is not running
Please start Docker and try again
```

Dockerを起動してから再実行してください。

#### actがインストールされていない

```
❌ Error: 'act' is not installed
Please install act: https://github.com/nektos/act#installation
```

上記のインストール手順に従ってactをインストールしてください。

#### SSL証明書エラー（解決済み）

`.actrc` 設定で `NODE_TLS_REJECT_UNAUTHORIZED=0` 環境変数を設定することにより、SSL証明書の検証を無効化しています。これにより、Node.js 22のダウンロード時の証明書エラーを回避できます。

**注意**: この設定は開発環境でのローカル実行専用です。本番環境では使用しないでください。

### 人間による手動設定が必要な項目

以下の設定は、環境に応じて人間が手動で調整する必要があります:

1. **Dockerイメージの選択**: `.actrc` で設定（デフォルト: `catthehacker/ubuntu:act-latest`）
2. **プロキシ設定**: 企業プロキシ環境の場合、追加設定が必要
3. **シークレット**: GitHub Actionsで使用するシークレットをローカルで設定する場合

詳細は [scripts/SETUP.md](./SETUP.md) を参照してください。

### 参考資料

- [scripts/SETUP.md](./SETUP.md) - 詳細なセットアップガイド（人間による手動設定項目を含む）
- [act - GitHub Actions local runner](https://github.com/nektos/act)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [.github/workflows/premerge.yml](../.github/workflows/premerge.yml) - プレマージワークフロー定義
