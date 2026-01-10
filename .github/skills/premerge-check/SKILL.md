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

このコマンドは、`.github/workflows/premerge-local.yml` で定義されたワークフローを `act` ツールを使用してローカル環境で実行します。Node.js 22がプリインストールされたDockerイメージを使用するため、SSL証明書エラーを回避できます。

## 実行される内容

ワークフローは以下のステップを実行します:

1. **コードのチェックアウト**: リポジトリのコードをチェックアウト
2. **Node.js バージョン確認**: Node.js 22.x環境を確認（プリインストール済み）
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

### SSL証明書エラー（解決済み）

現在の設定では、Node.js 22がプリインストールされた `node:22-bookworm` Dockerイメージを使用しているため、SSL証明書エラーは発生しません。

古い設定や特殊な環境で問題が発生する場合は、以下を参照してください:
- 詳細なセットアップガイド: `scripts/SETUP.md`
- ローカルのNode.jsで直接実行する代替方法

### その他の問題

詳細なトラブルシューティング情報とセットアップ手順は以下を参照してください:
- `scripts/README.md` - 基本的な使用方法とトラブルシューティング
- `scripts/SETUP.md` - 詳細なセットアップガイド（人間による手動設定項目を含む）

## 参考資料

- スクリプト使用方法: `scripts/README.md`
- 詳細セットアップガイド: `scripts/SETUP.md`
- ローカル実行用ワークフロー定義: `.github/workflows/premerge-local.yml`
- GitHub Actionsプロダクション用ワークフロー: `.github/workflows/premerge.yml`
- act - GitHub Actions local runner: https://github.com/nektos/act
