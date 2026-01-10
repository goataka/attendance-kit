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

このコマンドは、`.github/workflows/premerge.yml` で定義されたワークフローを `act` ツールを使用してローカル環境で実行します。SSL証明書の検証を無効化することで、証明書エラーを回避しています。

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

### SSL証明書エラー（解決済み）

`.actrc` 設定で `NODE_TLS_REJECT_UNAUTHORIZED=0` 環境変数を設定することにより、SSL証明書の検証を無効化しています。これによりNode.js 22のダウンロード時の証明書エラーを回避できます。

**注意**: この設定は開発環境でのローカル実行専用です。

### その他の問題

詳細なトラブルシューティング情報とセットアップ手順は以下を参照してください:
- `scripts/README.md` - 基本的な使用方法とトラブルシューティング
- `scripts/SETUP.md` - 詳細なセットアップガイド（人間による手動設定項目を含む）

## 参考資料

- スクリプト使用方法: `scripts/README.md`
- 詳細セットアップガイド: `scripts/SETUP.md`
- プレマージワークフロー定義: `.github/workflows/premerge.yml`
- act - GitHub Actions local runner: https://github.com/nektos/act
