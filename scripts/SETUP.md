# actツールのセットアップガイド

このガイドでは、プレマージワークフローをローカルで実行するために必要な手動セットアップ手順を説明します。

## 前提条件

以下がシステムにインストールされている必要があります:

### 1. Docker

**確認方法**:
```bash
docker --version
```

**インストール方法**:
- **Linux**: [Docker Engine installation](https://docs.docker.com/engine/install/)
- **macOS**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

**Dockerの起動確認**:
```bash
docker info
```

### 2. actツール

**確認方法**:
```bash
act --version
```

**インストール方法**:

#### Linux/macOS
```bash
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

#### Homebrew
```bash
brew install act
```

#### Windows (Chocolatey)
```bash
choco install act-cli
```

#### Windows (Scoop)
```bash
scoop install act
```

詳細は [act公式ドキュメント](https://github.com/nektos/act#installation) を参照してください。

## 設定ファイル

### .actrc

リポジトリルートの `.actrc` ファイルでactの動作を設定します。

**デフォルト設定** (Node.js 22プリインストール済みイメージ使用):
```
-P ubuntu-latest=node:22-bookworm
-P ubuntu-22.04=node:22-bookworm
```

この設定により、Node.js 22が既にインストールされているDockerイメージを使用するため、SSL証明書エラーを回避できます。

### 代替設定

SSL証明書エラーが発生する環境では、以下の代替設定を試してください:

#### オプション1: Medium-sizedイメージ
```
-P ubuntu-latest=catthehacker/ubuntu:act-latest
-P ubuntu-22.04=catthehacker/ubuntu:act-22.04
```

#### オプション2: Node.jsアクションをスキップ
`.github/workflows/` に `act-premerge.yml` を作成し、Node.jsセットアップをスキップする設定も可能です。

## 初回実行時の設定

actを初めて実行する際、使用するDockerイメージのサイズを選択するプロンプトが表示される場合があります:

```
? Please choose the default image you want to use with act:
  - Large size image
  > Medium size image
  - Micro size image
```

**推奨**: Medium size imageを選択してください。

この選択は `~/.config/act/actrc` (Linuxの場合) または `~/.actrc` に保存されます。

## トラブルシューティング

### SSL証明書エラーが発生する場合

**症状**:
```
self-signed certificate in certificate chain
```

**解決方法**:

#### 方法1: Node.js 22プリインストール済みイメージを使用
`.actrc` を以下のように設定:
```
-P ubuntu-latest=node:22-bookworm
```

#### 方法2: ローカルのNode.jsで直接実行
```bash
npm ci
npm run lint
npm test
npm run build
```

#### 方法3: SSL検証を無効化（推奨しません）
環境変数を設定:
```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
npm run premerge:local
```

**注意**: この方法はセキュリティリスクがあるため、開発環境でのみ使用してください。

### Dockerが起動していない

**症状**:
```
❌ Error: Docker is not running
```

**解決方法**:
1. Docker Desktopを起動（macOS/Windows）
2. Docker Engineを起動（Linux）
   ```bash
   sudo systemctl start docker
   ```

### actがインストールされていない

**症状**:
```
❌ Error: 'act' is not installed
```

**解決方法**:
上記の「actツール」セクションを参照してインストールしてください。

### Docker イメージのダウンロードに時間がかかる

初回実行時は、Dockerイメージのダウンロードに時間がかかる場合があります（イメージサイズによっては数GB）。

**対策**:
- 高速なインターネット接続を使用
- `--pull=false` オプションを使用して、既存のイメージを再利用

## 人間による手動設定が必要な項目

以下の設定は、プロジェクトのニーズに応じて人間が手動で調整する必要があります:

### 1. Dockerイメージの選択

`.actrc` でDockerイメージを選択:
- **node:22-bookworm**: Node.js 22プリインストール（推奨、SSL証明書問題を回避）
- **catthehacker/ubuntu:act-latest**: GitHub Actions互換環境（Medium size）
- **catthehacker/ubuntu:act-22.04**: Ubuntu 22.04ベース

**選択基準**:
- SSL証明書エラーを避けたい → `node:22-bookworm`
- GitHub Actionsとの互換性を重視 → `catthehacker/ubuntu:act-latest`

### 2. ネットワーク設定

企業プロキシや特殊なネットワーク環境の場合、追加設定が必要な場合があります:

```
--container-options "-e HTTP_PROXY=http://proxy:port -e HTTPS_PROXY=https://proxy:port"
```

### 3. ボリュームマウント

特定のディレクトリをマウントする必要がある場合:

```
--bind
```

### 4. シークレットと環境変数

GitHub Actionsで使用するシークレットをローカルで設定する場合、`.secrets` ファイルを作成:

```
GITHUB_TOKEN=your_token_here
```

actは自動的にこのファイルを読み込みます。

## 実行コマンド

### 基本実行
```bash
npm run premerge:local
```

### カスタムイメージを指定して実行
```bash
act pull_request -j test -W .github/workflows/premerge.yml -P ubuntu-latest=node:22-bookworm
```

### verbose モードで実行
```bash
act pull_request -j test -W .github/workflows/premerge.yml -v
```

### dry-runモード（実際には実行しない）
```bash
act pull_request -j test -W .github/workflows/premerge.yml -n
```

## 参考資料

- [act公式ドキュメント](https://github.com/nektos/act)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
