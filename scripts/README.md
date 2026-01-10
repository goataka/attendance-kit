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

#### SSL証明書エラー

一部の環境では、Node.jsのダウンロード時にSSL証明書エラーが発生することがあります:

```
self-signed certificate in certificate chain
```

この場合、以下の回避策があります:

1. **ローカルのNode.jsを使用**: 既にNode.js 22がインストールされている場合は、ローカルで直接コマンドを実行できます
   ```bash
   npm ci
   npm run lint
   npm test
   npm run build
   ```

2. **Docker設定の調整**: `.actrc` ファイルで設定を調整できます（リポジトリルートに既に含まれています）

3. **代替イメージの使用**: より新しいNode.jsがプリインストールされたイメージを使用することもできます

### 参考資料

- [act - GitHub Actions local runner](https://github.com/nektos/act)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
