# Scripts

このディレクトリには、開発とCI/CDプロセスをサポートするスクリプトが含まれています。

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

スクリプトは `.github/workflows/premerge-local.yml` で定義された以下のステップを実行します:

1. コードのチェックアウト
2. Node.js バージョン確認（Node.js 22が事前インストール済み）
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

#### SSL証明書エラー

**解決済み**: 現在の設定では、Node.js 22がプリインストールされた `node:22-bookworm` Dockerイメージを使用しているため、SSL証明書エラーは発生しません。

古い設定で問題が発生した場合:

```
self-signed certificate in certificate chain
```

以下の解決方法があります:

1. **推奨**: `.actrc` で Node.js 22プリインストール済みイメージを使用（デフォルト設定）
   ```
   -P ubuntu-latest=node:22-bookworm
   ```

2. **代替方法**: ローカルのNode.jsで直接コマンドを実行
   ```bash
   npm ci
   npm run lint
   npm test
   npm run build
   ```

3. **詳細なセットアップ**: [scripts/SETUP.md](./SETUP.md) を参照

### 人間による手動設定が必要な項目

以下の設定は、環境に応じて人間が手動で調整する必要があります:

1. **Dockerイメージの選択**: `.actrc` で設定（デフォルト: `node:22-bookworm`）
2. **プロキシ設定**: 企業プロキシ環境の場合、追加設定が必要
3. **シークレット**: GitHub Actionsで使用するシークレットをローカルで設定する場合

詳細は [scripts/SETUP.md](./SETUP.md) を参照してください。

### 参考資料

- [scripts/SETUP.md](./SETUP.md) - 詳細なセットアップガイド（人間による手動設定項目を含む）
- [act - GitHub Actions local runner](https://github.com/nektos/act)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [.github/workflows/premerge-local.yml](../.github/workflows/premerge-local.yml) - ローカル実行用ワークフロー定義
