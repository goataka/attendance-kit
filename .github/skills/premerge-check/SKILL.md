---
name: premerge-check
description: プレマージワークフローをローカルで実行してCI/CDチェックを行うスキルです。プルリクエストを作成する前にlint、test、buildをローカル環境で検証したい場合に使用してください。
---

# プレマージチェックスキル

このスキルは、GitHub ActionsのPremergeワークフローをローカル環境で実行し、CI/CDチェックを行います。

## 使用すべきタイミング

以下の場合にこのスキルを使用してください:

- プルリクエストを作成する前にCI/CDチェックを実行したい
- ローカルでワークフローの動作を確認したい
- デバッグやトラブルシューティングを行いたい

## 実行方法

プレマージワークフローをローカルで実行するには、以下のコマンドを使用します:

```bash
npm run premerge:local
```

このコマンドは、`.github/workflows/premerge.yml` で定義されたワークフローを `act` ツールを使用してローカル環境で実行します。

## 実行される内容

ワークフローは以下のステップを実行します:

1. **コードのチェックアウト**: リポジトリのコードをチェックアウト
2. **Node.js 22のセットアップ**: Node.js 22.x環境をセットアップ
3. **依存関係のインストール**: `npm ci` で依存関係をインストール
4. **Lintチェック**: `npm run lint` でコードスタイルをチェック
5. **テスト実行**: `npm test` でテストを実行
6. **ビルド実行**: `npm run build` でビルドを実行

## 前提条件

このスキルを使用するには、以下が必要です:

1. **Dockerが起動していること**: actツールはDockerを使用してワークフローを実行します
2. **actツールがインストールされていること**: インストール手順は `scripts/README.md` を参照

### actのインストール

```bash
# Linux/macOS
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Homebrew
brew install act
```

## トラブルシューティング

### SSL証明書エラーが発生する場合

環境によっては、Node.js 22のダウンロード時にSSL証明書エラーが発生することがあります。
その場合は、ローカルのNode.jsで直接コマンドを実行できます:

```bash
npm ci
npm run lint
npm test
npm run build
```

### その他の問題

詳細なトラブルシューティング情報は `scripts/README.md` を参照してください。

## 参考資料

- スクリプト使用方法: `scripts/README.md`
- プレマージワークフロー定義: `.github/workflows/premerge.yml`
- act - GitHub Actions local runner: https://github.com/nektos/act
